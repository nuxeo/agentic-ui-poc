/**
 * Validation for URLs that will be **navigated** — loaded into an `iframe`, or otherwise handed to
 * the browser as a document to fetch and render.
 *
 * ## Why this exists
 *
 * `DomSanitizer.bypassSecurityTrustResourceUrl` is unavoidable for `iframe[src]`: Angular's
 * `RESOURCE_URL` sanitizer throws on a raw string, so there is no "just don't bypass it" option.
 * The bypass is therefore only as safe as the string handed to it, and two of ours do not originate
 * in our own code:
 *
 *   - the ARender viewer origin, from the **customer-editable** Layer 0 bootstrap file;
 *   - the Nuxeo `preview` URL, from a **server** REST response.
 *
 * A manifest setting `viewerOrigin` to `javascript:alert(1)` is a complete, non-blank, perfectly
 * well-formed value that a completeness check waves through, and `new URL('javascript:alert(1)')`
 * does **not** throw — `javascript:` is a valid URL scheme. Bypassed and put in an `iframe`, it
 * executes in this application's origin. Turning a configuration value into script execution is a
 * privilege escalation, and `.cursor/rules/beta-program.mdc` makes that manifest a customer surface,
 * so the boundary is real rather than theoretical.
 *
 * ## What it checks, and why origin comparison rather than string prefixes
 *
 * Everything is resolved with `new URL(candidate, base)` and compared by `origin`. That is
 * deliberate: the obvious `candidate.startsWith('/')` test for "same origin" accepts `//evil.com/x`,
 * which is protocol-relative and resolves to a *different* origin. Resolving against a base and
 * comparing origins gets that right without a special case, and gets `/\evil.com` right too.
 *
 * A rejected URL returns `null`. Every caller already treats `null` as "no preview available" and
 * renders a placeholder, so failing closed costs a feature rather than breaking a page.
 */
export interface NavigableUrlPolicy {
    /**
     * Origins the URL may belong to, e.g. `https://arender.example.com`. Empty and nullish entries
     * are ignored, so an unset `NUXEO_API_ORIGIN` (which is `''`, meaning "use the dev proxy") simply
     * contributes nothing rather than matching everything.
     *
     * Omit to skip the origin check and validate the scheme only.
     */
    readonly allowedOrigins?: readonly (string | null | undefined)[];
    /**
     * Base for resolving a relative candidate. Pass the application origin to treat a
     * root-relative URL as same-origin; that origin must then also appear in `allowedOrigins`.
     */
    readonly base?: string;
    /**
     * Permit `http:`.
     *
     * Pass **`insecureAllowedForHost(isDevMode())`**, not a bare `isDevMode()` and never a constant
     * `true`.
     *
     * A plaintext document in an `iframe` is a downgrade only *relative to the page framing it*. Where the
     * application is itself served over `http:` — an ordinary on-prem deployment — there is nothing to
     * downgrade, and refusing it removes the feature without adding security. That is the policy
     * `ARenderService` and the preview fallback both implement, and `insecureAllowedForHost` is where it
     * lives so the three callers cannot answer the same question differently.
     *
     * This doc previously said to pass `isDevMode()`. That was the advice that silently disabled ARender
     * on every on-prem plaintext deployment — the fourth place in this repository carrying the same wrong
     * claim, after `docs/arender-setup.md`, `ARenderConfig.viewerOrigin` and the PR description.
     */
    readonly allowInsecure?: boolean;
}
/**
 * The candidate if it is safe to navigate under `policy`, otherwise `null`.
 *
 * Returns the **original** string rather than the normalised `href`, so validating a URL never
 * silently changes which bytes get loaded. The check is the product here, not a rewrite.
 */
export declare function navigableUrlOrNull(candidate: string | null | undefined, policy?: NavigableUrlPolicy): string | null;
/**
 * The origin of `value`, or `null` if it is not an absolute URL.
 *
 * Note `origin` is the string `'null'` for an opaque origin (`javascript:`, `data:`), which is why
 * callers must not compare origins without also checking the scheme.
 */
export declare function originOf(value: string | null | undefined): string | null;
/**
 * Whether `value` is usable as the **base** of a URL this code will build parameters onto:
 * absolute, http(s), `https:` unless insecure is permitted, and carrying no query, fragment or
 * userinfo. A path is allowed — a viewer legitimately lives at `https://host/arender`.
 *
 * The last three exclusions are the point, and each is a defect this rejects rather than a
 * theoretical tidiness rule:
 *
 *   - **Query.** A caller appending `?url=…` to `https://host/app?tenant=x` produces
 *     `…?tenant=x/?url=…`, where the whole suffix is part of `tenant`'s *value*. There is no
 *     top-level `url` parameter, so the viewer receives no document.
 *   - **Fragment.** Everything after `#` stays in the browser and is never sent, so
 *     `https://host#frag` swallows the parameter entirely.
 *   - **A bare delimiter**, which is why the test is on the raw text and not on `parsed.search`
 *     and `parsed.hash`. `new URL('http://proxy/nuxeo?').search` is `''` and `.hash` is `''`, so a
 *     value ending in `?` or `#` passed a check whose whole purpose is to establish that appending
 *     to it is safe — and appending to it is exactly what breaks: `http://proxy/nuxeo?` plus
 *     `/nxfile/default/<uid>/file:content` is a URL whose path is only `/nuxeo`, with the nxfile
 *     path demoted to a query string. `#` is worse: the suffix becomes a fragment and never
 *     reaches the server at all. Both are silent — ARender fetches the wrong resource rather than
 *     failing. Rejecting the raw characters covers the non-empty cases too, since a base carrying
 *     a real query or fragment must contain the delimiter that introduces it. A percent-encoded
 *     `%3F` or `%23` is not a delimiter and is unaffected.
 *   - **Userinfo.** `https://user:pass@host` embeds a credential in a URL that gets navigated in
 *     an iframe and written into `document.referrer` and history. It is also the classic
 *     look-alike host trick, since the part before `@` reads like the destination.
 *
 * Callers that build parameters onto this base must still use `URL`/`searchParams` rather than
 * string concatenation; this check makes that safe, it does not make it unnecessary.
 */
export declare function isNavigableBaseUrl(value: string | null | undefined, allowInsecure?: boolean): boolean;
/**
 * Whether a plaintext `http:` destination is acceptable given where this document is served from.
 *
 * `true` in dev mode, or when the application itself is on `http:`.
 *
 * ## Why this is a shared function rather than an inline expression
 *
 * An iframe is only a downgrade *relative to its host document*. Where the host is already plaintext
 * — an ordinary on-prem deployment — there is nothing to downgrade, and refusing `http:` there does
 * not add security, it silently removes the feature.
 *
 * That reasoning was written out at the preview-fallback site and applied only there. The two ARender
 * sites kept passing a bare `isDevMode()`, so ARender was silently disabled for exactly the
 * deployments the reasoning was about, while the repository documented the opposite policy. One
 * function means the next caller cannot get a different answer to the same question.
 *
 * This is **not** a licence for `http:` generally. It says "no worse than the host", which is why the
 * ARender viewer origin still gets `isNavigableBaseUrl` and the preview fallback still gets an origin
 * allow-list. Neither of those is replaced by this.
 */
export declare function insecureAllowedForHost(isDevMode: boolean, hostProtocol?: string): boolean;
/**
 * A media type without its parameters, lowercased — e.g. `TEXT/HTML; charset=utf-8` -> `text/html`.
 *
 * Shared because it guards three separate security decisions, and a normalisation that differs
 * between them is a bypass. A media type is case-insensitive and may carry parameters, so an equality
 * test or allow-list lookup written against the raw string is defeated by `TEXT/HTML` or
 * `application/pdf; version=1.7`.
 *
 * Used wherever a *served* `Content-Type` is compared before a `blob:` URL reaches an iframe — the
 * attachment preview dialog, `DocumentViewerComponent`, and the citation dialog. Those iframes are
 * same-origin with the application, so admitting an HTML-served blob is script execution in our
 * origin; see `PREVIEWABLE_TEXT_TYPES` for the full reasoning.
 */
export declare function mediaTypeEssence(value: string | null | undefined): string;
//# sourceMappingURL=navigable-url.d.ts.map