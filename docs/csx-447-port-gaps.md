# CSX-447 content ports — consumer report from the Nuxeo Satori team

**From:** Nuxeo Agentic UI team (Nuxeo Satori)
**Against:** `Alfresco/hxp-frontend-apps`, branch `feature/CSX-447-content-abstraction-layer`, commit **`61eb45bf0e94df3fd3a62e8efd21af8ec535451e`** (13 July 2026, PR [#18189](https://github.com/Alfresco/hxp-frontend-apps/pull/18189)) — `libs/content-abstraction/{domain,ports}/external/src` and `libs/content-adapter-nuxeo/data-access`
**Date:** 6 August 2026

## Why you are getting this

We build the Nuxeo Satori application — an Angular ECM and DAM UI on Nuxeo. We have just built the CSX-447 port surface into our codebase: a `content-ports` library that is a shape-for-shape copy of yours at the commit above, and a `content-adapter-nuxeo` library implementing all five ports against a production Nuxeo deployment, its 26 services and its real auth model.

We did that because we agree with the direction. RFC CSX-447 is good architecture and we would rather align to it now than build a second content abstraction that has to be thrown away later. We are also, as far as we can tell, the only team in a position to keep your central validation claim true: the RFC's case that the ports are not accidentally HxPR-shaped rests on a second adapter built against Nuxeo, and nobody currently owns one. **We are prepared to own it.**

This report is the price of that offer, and it is meant constructively. Building the adapter for real — against SAML session cookies, page providers, faceted search and Nuxeo's full ACE model rather than a localhost POC — surfaced eight places where the contract as pinned cannot carry Nuxeo. Every one is reproducible against the commit above. For each we give what we needed, what the contract does, what your own reference Nuxeo adapter does, and what we are asking for.

Three of them are, in our reading, contract-level rather than adapter-level, meaning no adapter can fix them from below:

- **Item 1 (`AuthPort`)** is the one to read first. A cookie-session backend cannot satisfy the port as written, and we believe your own Nuxeo adapter demonstrates this rather than refuting it.
- **Item 2 (aggregations)** is the largest by product impact. It is the reason our faceted search — the search page and the whole DAM asset surface — cannot go through `SearchPort` at all.
- **Item 3 (the named-query catalogue)** is the structural cause of item 2 and of several smaller ones.

Items 4 through 8 are narrower and mostly cheap to fix.

We are happy to raise PRs for any of these, or to discuss them as part of a wider conversation about who owns the Nuxeo adapter and where it lives.

---

## 1. `AuthPort` cannot represent a cookie-session backend

**Priority: highest.** This is the item we would most like a response to, because it bears directly on whether the ports can be said to be proven at N = 2.

### What the contract says

```ts
export interface AuthPort {
  getAccessToken(): Promise<string>;
}
```

RFC §4.3 calls this "application-driven token supply": the adapter asks the application for an access token and installs it in its SDK client. ADR-001 restates it — "the port layer does not see tokens; the adapter is responsible for installing the token in its SDK client per backend". Q11 closes the question of per-request auth scopes with "**No.** Phase 1 found a single application-driven scope; `AuthPort.getAccessToken()` is single-method."

Phase 1 was an audit of `workspace-hxp`. The conclusion is sound for HxPR and does not generalise.

### Why Nuxeo does not fit it

Our application is deployed **same-origin with Nuxeo** — it is served by Nuxeo's own Tomcat as a marketplace package. In production, authentication is a **SAML SSO session cookie**. In development, an Angular `HttpInterceptor` attaches `Authorization: Basic …`.

In both cases there is no token for the application to hand over, and the credential is attached by the browser or by an interceptor rather than by the adapter. `getAccessToken(): Promise<string>` has no value that means "there is no token; the transport is already authenticated". The three candidate encodings are all wrong:

- Resolving `''` — a caller that builds `Authorization: Bearer ${token}` sends `Bearer `, which is worse than sending nothing.
- Resolving a synthesised `Basic …` string — that is a header value, not an access token, and it requires the client to hold credentials it should not have.
- Rejecting — correct, but it means the port is permanently unsatisfiable on this backend.

Our `NuxeoAuthAdapter` rejects with `Unauthenticated` and documents why, because fabricating a credential seemed worse than being honest. Nothing in our application calls it. The token is registered only so the substitution boundary stays complete.

### What your own Nuxeo adapter does

We want to be precise here, because this is the part that matters.

`libs/content-adapter-nuxeo/data-access/src/lib/ports/nuxeo-auth.adapter.ts` returns the configured `authHeader` verbatim if one is set; otherwise it base64-encodes `NuxeoConfig.basicAuth` into a `Basic …` string; otherwise it resolves the empty string. `DEFAULT_NUXEO_CONFIG` supplies `Administrator` / `Administrator` against `http://localhost:8080/nuxeo`.

Three observations follow:

1. **It does not return an access token.** It returns a complete `Authorization` header value. Any consumer written against the port's name and type — `getAccessToken`, prefix with `Bearer` — produces `Bearer Basic YWRt…`.
2. **Nothing calls it.** Its own doc comment says so: "the transport builds its own `Authorization` header from the same `NuxeoConfig` and does not depend on this method." We grepped the adapter package at the pinned commit and confirmed it: `getAccessToken` has no caller. `AUTH_PORT` is bound in `provideNuxeoContentAdapter()` and never injected. `nuxeo-session.ts` reads `NUXEO_CONFIG` directly and builds the client's `auth` option itself.
3. **The transport is designed to bypass the application's credential path.** `createNuxeoClient` deliberately uses the `nuxeo` JS client's own `fetch` so the host app's interceptors cannot attach anything, and `poc-plan.md` §"Live testing caveat" records that live validation required opening Nuxeo's CORS filter to `http://localhost:4200` with credentials.

So the POC's Nuxeo backend was a **cross-origin server with static Basic credentials supplied by the client**, and the port under discussion was **not exercised by it**. `poc-plan.md` §3.1 lists "the auth path on the happy path" among what the trivial flow validates; what was validated was the transport's own header construction, not `AuthPort`.

RFC §5.2 states that the "Nuxeo adapter wires its own client to the same `AuthPort`". At the pinned commit it does not. We think that sentence needs to change either way, and we would rather flag it than have it discovered later.

We are **not** saying the port is badly designed for HxPR, and we are not saying your team did the wrong thing in the POC — a localhost Basic setup is an entirely reasonable way to get a second adapter standing up quickly. We are saying that the one auth model your second backend actually ships in production is the one the port cannot express, and that this was not visible from the POC because the POC did not use the port.

### What we are asking for

Make "the transport is already authenticated" a first-class, representable state. Any of these would work for us; the first is our preference:

1. **Make the port describe a credential, not a token.** For example a discriminated result — `{ kind: 'bearer', token } | { kind: 'header', name, value } | { kind: 'ambient' }` — where `ambient` means the browser or an interceptor attaches the credential and the adapter must add nothing. `getAccessToken()` becomes one case of a more honest type.
2. **Make `AuthPort` optional and capability-reported**, alongside the other capability descriptors, so an adapter can declare that it does not participate in credential supply. `AUTH_PORT` would be nullable at the composition root rather than a mandatory binding an adapter has to fake.
3. **At minimum, document the contract for a backend that has no token**, and make the reference Nuxeo adapter honour it rather than returning a header value from a method named `getAccessToken`.

Whichever shape you pick, the second-order ask is the same: **please treat "same-origin, cookie-session, credentials attached outside the client library" as a supported deployment topology in the RFC**, not just as a Nuxeo quirk. It is how Nuxeo ships to on-premise customers, and it is a common shape for any content application served by its own backend.

---

## 2. `SearchResultPage<T>` cannot carry aggregation buckets — and aggregations are bidirectional

**Priority: highest by product impact.** This is why our search page and our entire DAM surface stay on direct Nuxeo access.

### The problem, stated precisely

It is tempting to summarise this as "the search port has no aggregation support", but that undersells it, because it makes the gap sound like one missing feature on the request side. It is not. **Faceted search is bidirectional**, and the contract can express exactly one of the two directions.

- **Outbound** — the UI sends the user's selected facet values to the server. `FilterSpec` can express this: `{ kind: 'in', field, values }` is a reasonable neutral encoding of "`dc:creator` is one of these three people".
- **Inbound** — the server returns, for every facet, the set of buckets and the count of matching documents in each. This is what the facet UI is made of. Without the counts there is nothing to render: no "Creator (12)", no disabled-because-empty buckets, no ordering by frequency.

`SearchResultPage<T>` is:

```ts
export interface SearchResultPage<T> {
  readonly items: readonly T[];
  readonly total?: number;
  readonly hasMore: boolean;
  readonly cursor?: string;
}
```

There is no field a bucket set could go in. So an adapter that mapped our faceted search onto `SearchPort` would send the filters correctly, receive the aggregates from Nuxeo, and then **silently discard them** on the way back through the port. The search would appear to work. The facet panel would render empty and nobody would get an error.

This is a lossy mapping that type-checks, which is the worst kind.

### Why this is not solvable in the adapter

Nuxeo's faceted search runs on **page providers** — server-contributed named queries (`default_search`, `assets_search` and others) that carry their own aggregate definitions, sort specifications and permissions. The UI passes selected values as `<aggregateId>_agg` request parameters and reads `aggregations` back off the response envelope. Our saved-search feature is built on the same mechanism.

To go through `SearchPort` we would have to give up server-defined page providers and re-express every one as a client-side `FilterSpec` — losing the contributed aggregates, the contributed sorts, and saved searches — and we would still have nowhere to put the counts. So we did not: our split is neutral NXQL-shaped queries through `SearchPort`, and faceted page-provider queries direct.

For scale: this is not an edge case in our product. It covers the main search page and the DAM asset browser, which are two of our three highest-traffic surfaces.

We also note that your own assessment of `adf-hx-content-services` lists "no aggregation or facet support anywhere" as a library gap. We think it is worth recognising that the port contract currently makes that gap permanent rather than temporary — a facet component cannot be added to the library later without a change to `SearchResultPage`, because the data will not reach it.

### What we are asking for

1. **Add an optional aggregation channel to the search result type.** Something as small as `readonly aggregations?: readonly { readonly id: string; readonly buckets: readonly { readonly key: string; readonly count: number; readonly selected?: boolean }[] }[]` would let an adapter carry the inbound half without changing any existing consumer.
2. **Add a matching request-side field** — a list of aggregate ids to compute, or a flag to return the aggregates defined by the named query — so the outbound half is explicit rather than inferred from `FilterSpec`.
3. **Report it as a capability**, consistent with the rest of the design, so consumers can pre-flight rather than discover an empty facet panel at runtime.

If the shape is contentious, the minimum useful outcome is a decision recorded either way. Right now the return type says "no aggregations" by omission, which reads as an oversight rather than a position, and an adapter author cannot tell which it is.

---

## 3. The named-query catalogue is a hand-maintained list of three in the shared ports package

### The problem

`libs/content-abstraction/ports/external/src/lib/named-queries.ts` declares the entire catalogue as three `namedQuery()` calls:

```ts
export const childrenOfFolder = namedQuery<
  { parentId: string; sort?: 'name' | 'modified' },
  ContentNode
>('children-of-folder');
export const allContentOfFolder = namedQuery<{ parentId: string }, ContentNode>(
  'all-content-of-folder',
);
export const versionsOfDocument = namedQuery<{ documentId: string }, ContentNode>(
  'versions-of-document',
);
```

ADR-003 makes named queries the **primary** search path and the filter DSL the escape hatch. We think that is the right call. But it means the primary path's vocabulary is a fixed list of three literals living in a shared library inside a private monorepo, and **adding a query is an upstream PR** — reviewed by a team that has descoped Nuxeo productization, on a branch that is currently conflicting and several hundred commits behind `develop`.

We needed two queries on day one that are not in the list: trashed children of a folder, and members of a collection. We expect to need many more; our product is built on dozens of page providers.

Our workaround was to declare the two keys locally with a `nuxeo:` prefix and report them through `SearchCapabilities.supportedNamedQueries`, which is the documented pre-flight path. It works, but it means our port library is no longer a copy of yours — the divergence we were specifically trying to avoid — and any other backend's adapter will reject those keys.

Note the second-order effect: because adding a named query is expensive, adapter authors are pushed onto the escape hatch instead. The escape hatch is also narrow, and this is visible in your own adapter — `nuxeoSearchCapabilities.supportedFilterKinds` declares only `['eq', 'fullText']` out of the eight `FilterKind` values. So of the two search paths ADR-003 offers, one is a closed list of three and the other, as implemented for Nuxeo, supports two of eight leaf kinds.

### What we are asking for

Make the catalogue **extensible without an upstream PR**. Concretely:

1. Keep `namedQuery<TParams, TRow>(key)` exactly as it is — it is a good primitive — but state in the ADR that adapters and consuming applications **may** declare their own keys, and define a **namespacing convention** for them (we have used `nuxeo:`; a documented rule would be better than a convention we invented).
2. Define what a compliant adapter must do with an unknown key. Ours throws `UnsupportedFilter`, which we inferred from `SearchCapabilities.supportedNamedQueries` being a pre-flight surface, but the contract does not say so.
3. Reserve the unprefixed namespace for the shared catalogue, so a locally declared key can never collide with one you add later.

This costs you nothing and removes a coordination dependency between our release train and yours.

---

## 4. `getWithRendition` is not implementable over Nuxeo

### The problem

```ts
export interface RenditionRef {
  readonly url: string;
  readonly mimeType: string;
  readonly width?: number;
  readonly height?: number;
}
```

`RenditionRef.url` assumes a rendition is reachable at a URL that something — an `<img src>`, a `<video src>`, a viewer — can fetch directly.

Nuxeo rendition URLs are not directly fetchable. `/nuxeo/api/v1/id/{uid}/@rendition/thumbnail` requires the session's authentication, and in our deployment that means going through `HttpClient` and our auth interceptor and receiving a `Blob`, which we then expose as an object URL with an explicit revoke on destroy. Handing a `RenditionRef.url` to a template would produce a broken image in development and, under SAML, a redirect to the identity provider rendered inside an `<img>`.

This is also a security position for us, not just a mechanical one: our own conventions forbid binding `<img [src]>` to a Nuxeo URL precisely because of this.

### What your own Nuxeo adapter does

The same thing ours does. `nuxeo-document.adapter.ts` at the pinned commit:

```ts
getWithRendition(_id: string, spec: RenditionSpec): Observable<ContentNode & { rendition: RenditionRef }> {
    return throwError(() => new ContentError('UnsupportedEnrichment', `nuxeo adapter does not serve renditions (requested kind: ${spec.kind})`));
}
```

and `nuxeoDocumentCapabilities` reports `rendition: { supportedKinds: [] }`.

We arrived at an identical implementation independently, which we take as good evidence that this is a contract shape problem rather than an adapter effort problem. It is worth saying plainly that **Nuxeo serves renditions extremely well** and our product depends on them heavily — thumbnails, `picture:views`, PDF previews, video transcodes. They are simply not expressible as a URL.

### What we are asking for

Let `RenditionRef` carry a **fetch strategy**, not just a URL. The minimum viable shape is a discriminated union:

- `{ kind: 'url', url, mimeType }` — today's behaviour, unchanged for HxPR.
- `{ kind: 'blob', fetch: () => Observable<Blob>, mimeType }` — the adapter owns the authenticated fetch and hands back bytes; the consumer owns the object-URL lifecycle.

That is a small change and it converts renditions from "unsupported on this backend" to "supported with a different fetch strategy", which is a much better answer for a library that wants a document viewer and, eventually, any DAM capability at all.

If a strategy union is too much, an intermediate step that would still unblock us is to state in the contract that `RenditionRef.url` may require the adapter's own credentials, and add a `DownloadPort`-style method that returns bytes. The RFC already sketches a download port; landing it would cover most of this.

---

## 5. `PermissionsPort.revoke` takes an id the contract never promises will round-trip

We had this one wrong at first and want to state the corrected version, because the naive framing is not true of Nuxeo.

### What is actually the case

`Document.RemovePermission` **does** accept an ACE id — its parameters are `acl`, `id` and `user`, and either `id` or `user` must be set. So `revoke(node, permissionId)` is expressible in principle, and your adapter does exactly that:

```ts
revoke(node: ContentNodeRef, permissionId: string): Observable<void> {
    return fromNuxeo(() => this.session.operation(REMOVE_PERMISSION).input(docRef(node.id)).params({ id: permissionId }).execute())…
}
```

The gap is not the operation. It is that **the contract never says what `Permission.id` is**, and in particular never says it is a durable backend handle that can be fed back into `revoke`. `Permission.id` is documented only as `readonly id: string`.

That ambiguity has already produced a defect in the reference adapter. `nuxeo-permission.mapper.ts` synthesises an id whenever Nuxeo does not supply one:

```ts
id: ace.id ?? permissionId(principalId, permission),   // toPermission
…
export function permissionId(principalId: string, permission: string): string {
    return `${principalId}:${permission}`;
}
```

and `toGrantedPermission` — the value returned from `grant()` — **always** uses the synthetic form, because `Document.AddPermission` returns the document rather than the created ACE. So a caller that does `grant(...)` and then `revoke(node, granted.id)` sends `id: "jdoe:Read"` to `Document.RemovePermission`, which matches no ACE. The most natural two-call sequence against the port silently fails to revoke anything.

The fallback is not attractive either. `Document.RemovePermission` with `user` removes **every** ACE for that principal on the ACL, not the one requested — so an adapter that resolves the id back to a principal and revokes by user will quietly over-revoke.

### What we are asking for

1. **Say what `Permission.id` is** in the contract: an opaque, adapter-owned handle that MUST round-trip into `revoke` unchanged, and that an adapter MUST NOT synthesise. That single sentence turns this from ambiguity into a testable requirement.
2. **Make `grant` return an ACE with a real id**, or document that the returned `Permission.id` is not revocable and give callers another way to get one. Re-reading the ACL after a grant is an acceptable adapter cost; silently returning an unusable handle is not.
3. Consider adding a contract test for grant-then-revoke round-tripping. It is the obvious first behavioural test for this port and it would have caught this.

---

## 6. `PermissionsPort.grant` cannot express a deny ACE, but the capability descriptor claims it can

### The problem

`Permission.granted` is documented as "`true` for a grant, `false` for an explicit deny", and `NewPermission` is `Omit<Permission, 'id' | 'effective' | 'source'>`, so `granted` is part of the grant request. Nuxeo stores deny ACEs natively and our permissions UI exposes them.

But `Document.AddPermission` has no deny parameter — its parameters are the principal, the permission name, the ACL, `blockInheritance`, `begin`, `end`, `comment` and `notify`. It writes a grant, always. There is no `PermissionsPort` method that writes a deny.

So the port's request type can express something none of its methods can perform.

### What your own Nuxeo adapter does

This is the one place where we think there is an outright defect rather than a gap. `toAddPermissionParams` never reads `ace.granted`:

```ts
export function toAddPermissionParams(ace: NewPermission): NuxeoAddPermissionParams {
    const params: NuxeoAddPermissionParams = {
        username: ace.principal.id,
        permission: ace.permission,
        acl: LOCAL_ACL,
        blockInheritance: false,
        notify: false,
    };
    …
}
```

while `nuxeoPermissionsCapabilities` declares `honours: { begin: true, end: true, deny: true, blockInheritance: true }`.

The combination is the bad case: a caller pre-flights against the descriptor, sees `deny: true`, calls `grant(node, { …, granted: false })`, and **the adapter writes a grant**. The user asked to deny someone access and the system granted it. `blockInheritance` has the same shape of problem — it is declared honoured, but `toAddPermissionParams` hard-codes `false` and `NewPermission` has no field for it.

Our adapter rejects `granted: false` with `UnsupportedField` rather than writing the opposite of what was asked, and we would suggest the reference adapter do the same as an immediate fix regardless of what happens to the contract.

### What we are asking for

Either:

- **Add a deny path to the port** — a `deny()` method, or a documented requirement that `grant` with `granted: false` writes a deny ACE. On Nuxeo an adapter can implement this through `Document.SetACE` or by writing the ACP directly, so it is achievable; it is just not achievable through `Document.AddPermission`.
- **Or remove `granted` from `NewPermission`** and state that the port writes grants only, with deny left to backend-specific code. That is a smaller change and an honest one.

Either way, please fix the descriptor so `honours.deny` reflects what the adapter does. A capability descriptor that over-reports is more dangerous than no descriptor, because it is specifically the thing consumers are told to trust instead of testing.

The same applies to `blockInheritance`: it is reported honoured, is not in `NewPermission`, and is hard-coded to `false`.

---

## 7. `UploadPort.begin` is synchronous, but opening a Nuxeo batch is a network call

### The problem

```ts
begin(file: File, options?: UploadOptions): UploadHandle;
```

`begin` returns a handle synchronously. On Nuxeo, staging bytes requires first `POST /nuxeo/api/v1/upload` to open a batch and get a batch id, then uploading the file into an index within it. The batch id — the only durable reference to the staged bytes — arrives after a round-trip that has not happened when `begin` returns.

The synchronous signature is fine as a UI affordance; it lets a caller create a row in an upload list immediately. The problem is that it makes the handle's readiness implicit, and the contract does not say what `attach` should do if it is called before staging completes.

### What your own Nuxeo adapter does

It fires the staging off unawaited and fails the `attach`:

```ts
begin(file: File, options?: UploadOptions): UploadHandle {
    …
    void this.stage(record);
    return handle;
}

attach(handle, parentId, draft) {
    const record = this.requireRecord(handle.id);
    if (!record.batchBlob) {
        return throwError(() => new ContentError('Conflict', `Upload '${handle.id}' has not finished staging`));
    }
    …
}
```

So the correct usage is "call `begin`, subscribe to `progress`, wait for `processing`, then call `attach`" — but nothing in the port's types or documentation says so, and the failure mode for getting it wrong is a `Conflict` that looks like a server-side conflict rather than a client-side ordering mistake. Our adapter takes the other route: `attach` waits internally for staging to be confirmed before creating the document. Both are defensible; the point is that the contract does not choose, so the two adapters behave differently for the same call sequence.

### What we are asking for

Pick one and write it down:

1. **Make `begin` return `Observable<UploadHandle>`** (or `Promise`), so the handle only exists once the backend has a staging reference. Cleanest, but it is a breaking change and it costs the immediate-UI-row affordance.
2. **Or keep `begin` synchronous and require `attach` to await staging**, so a caller can legitimately do `begin(...)` then `attach(...)` with no progress subscription. This is what we implemented and it is a small change to your adapter.

Option 2 is our preference — it preserves the affordance and it is the behaviour a caller naively expects. Either way, the `UploadHandle` docs should state whether the handle is usable immediately, and `UploadCapabilities` is the obvious place to report it if you would rather leave it adapter-defined.

---

## 8. `Permission.effective` is a boolean; Nuxeo's ACE status is tri-state

### The problem

```ts
/** Whether this ACE is effective (resolved) rather than directly set. */
readonly effective: boolean;
```

A Nuxeo ACE has a computed `status` of `effective`, `pending` or `archived` — driven by the `begin` and `end` window the port already models. "Pending" means the grant starts in the future; "archived" means it has expired.

Mapping onto a boolean collapses `pending` and `archived` into the same `false`. Those are opposite states from the user's point of view. In a permissions table, "starts on 1 September" and "expired on 1 August" must not render identically, and we would rather not reconstruct the distinction client-side by comparing `begin`/`end` against the clock, because that reimplements a computation the server has already done and can get wrong across time zones.

Both reference implementations do the same lossy thing:

```ts
effective: (ace.status ?? '').toLowerCase() === EFFECTIVE_ACE_STATUS,   // yours
effective: ace.status === 'effective',                                   // ours
```

Ours additionally smuggles the original value out through the free-text `source` field — `source: \`${aclName}:${ace.status}\``— which is a hack we would like to delete.`source` is documented as "where the ACE originates … adapter-defined vocabulary", so we are technically within the contract, but only because the field is undefined enough to abuse.

There is a related, smaller inconsistency worth noting: the doc comment says `effective` means "resolved rather than directly set", i.e. inherited-vs-local, which is a different concept from the temporal status both adapters actually map onto it. Two backends reading that comment could reasonably implement two different things.

### What we are asking for

Widen the field to a small closed union — `readonly effective: 'effective' | 'pending' | 'archived'` — or add `readonly status?: 'effective' | 'pending' | 'archived'` alongside the boolean if you would rather not break existing consumers. Then clarify the doc comment so `effective` and "inherited vs local" are unambiguously separate concepts, since `source` is already carrying the second one.

This is the cheapest item in the report and it removes a genuine UI defect.

---

## Summary

| #   | Surface                                  | Ask                                                                              | Type                    |
| --- | ---------------------------------------- | -------------------------------------------------------------------------------- | ----------------------- |
| 1   | `AuthPort`                               | Represent "transport is already authenticated"; make the port optional           | **Contract change**     |
| 2   | `SearchResultPage<T>`                    | Optional aggregation buckets in, aggregate request in — facets are bidirectional | **Contract change**     |
| 3   | `named-queries.ts`                       | Let adapters declare namespaced keys without an upstream PR                      | **Contract change**     |
| 4   | `RenditionRef`                           | Fetch strategy (`url` \| `blob`), not a bare URL                                 | Contract change         |
| 5   | `Permission.id` / `revoke`               | Define the id as a durable, non-synthesised, round-tripping handle               | Contract clarification  |
| 6   | `PermissionsPort.grant` / `honours.deny` | Add a deny path, or drop `granted`; fix the over-reporting descriptor            | **Defect** + contract   |
| 7   | `UploadPort.begin` / `attach`            | Decide whether `attach` awaits staging, and document it                          | Contract clarification  |
| 8   | `Permission.effective`                   | Tri-state status instead of a boolean                                            | Contract change (small) |

Items 1, 2 and 3 are the ones we cannot work around from below. Item 6 is the one we would fix in the reference adapter today regardless of what happens to the contract, because it currently grants access to a principal the caller asked to deny.

## What we are offering

Our `content-adapter-nuxeo` implements all five ports against a production Nuxeo deployment, with unit coverage and a structural test that fails if an adapter drifts from the port surface. It is written against our existing 26 Nuxeo services rather than against a fresh SDK client, so it exercises paths that are already in production. It is currently in our repository, pinned to your commit rather than depending on your packages, because your branch is not installable.

We would like to converge that into your architecture — as `@hxp/content-adapter-nuxeo`, owned and maintained by us. The changes above are what would make that adapter honest rather than a collection of documented divergences. Several of them are small; item 6 is arguably a bug fix; items 1 and 2 are the ones that need a design conversation.

We would also, separately, like to be listed as reviewers on RFC CSX-447. We are the second backend it is designed against, and the eight items above are the kind of thing that is cheaper to find in review than in an adapter.

---

### References

- [RFC — Backend-Agnostic Content Component Library and Workspace (CSX-447)](https://hyland.atlassian.net/wiki/spaces/CSX/pages/4192241998)
- [ADR-001 — Adopt Hexagonal Ports & Adapters](https://hyland.atlassian.net/wiki/spaces/CSX/pages/4192112470)
- [PR #18189 — CSX-447 CSX abstraction layer](https://github.com/Alfresco/hxp-frontend-apps/pull/18189)
- `developer-docs/research/csx-447-abstraction-layer/` at the pinned commit — RFC, eight ADRs, POC plan, status ledger
- [ADF HX vs. a Nuxeo Satori Library — Decision Document](adf-hx-vs-nuxeo-satori-decision.md) — the wider recommendation this report supports
- [Operation `Document.RemovePermission`](https://explorer.nuxeo.com/nuxeo/site/distribution/Nuxeo%20Platform-2025.8/viewOperation/Document.RemovePermission) — parameter reference for item 5
