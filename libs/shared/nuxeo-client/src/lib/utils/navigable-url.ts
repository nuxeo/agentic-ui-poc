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

/**
 * The only schemes that may be navigated.
 *
 * `javascript:` and `data:` are the attack. `blob:` is excluded because a blob URL that arrives
 * from configuration or a server response was not minted by this document — the legitimate case is
 * an object URL created locally and bound directly, never one that travelled through a manifest or
 * a REST payload. `file:` has no meaning in a web origin.
 */
const NAVIGABLE_SCHEMES: ReadonlySet<string> = new Set(['https:', 'http:']);

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
export function navigableUrlOrNull(
  candidate: string | null | undefined,
  policy: NavigableUrlPolicy = {},
): string | null {
  if (typeof candidate !== 'string' || candidate.trim() === '') return null;

  // Reject anything the URL parser would silently rewrite, because this function returns the
  // ORIGINAL string. The WHATWG parser strips tabs, CR and LF anywhere in a URL and trims leading
  // and trailing C0/space, so `https://ok.example/\r\nX-Injected: 1` validates as
  // `https://ok.example/X-Injected:%201` while the value handed back still carries the raw CRLF.
  // The browser normalises again when it navigates, so this is not an injection into the iframe —
  // but validator and consumer disagreeing about which bytes were approved is precisely the gap a
  // validator exists to close, and any consumer that logs the string or hands it to a non-URL parser
  // sees the control characters. Rejecting is cheap; no legitimate endpoint contains them.
  // Checked by code point rather than with a regex: a character class spelling these out literally
  // trips `no-control-regex`, and the intent reads more plainly this way.
  for (let i = 0; i < candidate.length; i += 1) {
    const code = candidate.charCodeAt(i);
    if (code <= 0x20 || code === 0x7f) return null;
  }

  let parsed: URL;
  try {
    // A relative candidate needs a base; without one this throws and we reject, which is correct
    // for a caller that did not say what relative should mean.
    parsed = policy.base ? new URL(candidate, policy.base) : new URL(candidate);
  } catch {
    return null;
  }

  if (!NAVIGABLE_SCHEMES.has(parsed.protocol)) return null;
  if (parsed.protocol === 'http:' && !policy.allowInsecure) return null;

  // Userinfo, rejected here and not only in `isNavigableBaseUrl`.
  //
  // `origin` excludes credentials: `new URL('https://user:pass@app.example/x').origin` is exactly
  // `'https://app.example'`, so the `allowedOrigins` check below cannot see them and a
  // credential-bearing URL passed a same-origin policy. This function returns the ORIGINAL string, so
  // what reached the iframe still carried `user:pass@` — written into `document.referrer` and history,
  // and the classic look-alike-host trick, since the part before `@` reads like the destination.
  //
  // `isNavigableBaseUrl` already rejected this, which meant the base validator was safe while the
  // general validator guarding both Category C bypasses was not. The repository rule is credentials
  // from the environment only, never in a URL.
  if (parsed.username !== '' || parsed.password !== '') return null;

  if (policy.allowedOrigins) {
    const allowed = policy.allowedOrigins
      .map((origin) => originOf(origin))
      .filter((origin): origin is string => origin !== null);
    // An allow-list that resolves to nothing must reject everything. Treating "no usable entries"
    // as "allow all" would turn a misconfiguration into an open redirect.
    if (!allowed.includes(parsed.origin)) return null;
  }

  return candidate;
}

/**
 * The origin of `value`, or `null` if it is not an absolute URL.
 *
 * Note `origin` is the string `'null'` for an opaque origin (`javascript:`, `data:`), which is why
 * callers must not compare origins without also checking the scheme.
 */
export function originOf(value: string | null | undefined): string | null {
  if (typeof value !== 'string' || value.trim() === '') return null;
  try {
    const origin = new URL(value).origin;
    return origin === 'null' ? null : origin;
  } catch {
    return null;
  }
}

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
export function isNavigableBaseUrl(
  value: string | null | undefined,
  allowInsecure = false,
): boolean {
  if (navigableUrlOrNull(value, { allowInsecure }) === null) return false;
  const raw = value as string;
  // The raw text, not `parsed.search`/`parsed.hash` — see the note on a bare delimiter above.
  if (raw.includes('?') || raw.includes('#')) return false;
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return false;
  }
  // Redundant since `navigableUrlOrNull` now rejects userinfo too, and kept deliberately: this file's
  // stated idiom is two independent checks for a privilege boundary, and a base URL is appended to
  // before navigation. Whichever runs first, the answer is the same.
  return parsed.username === '' && parsed.password === '';
}

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
export function insecureAllowedForHost(
  isDevMode: boolean,
  // Injectable, and defaulted rather than read inline, so the policy can be tested without mutating
  // `window.location` — jsdom refuses to redefine `protocol`, which is how a test for this ends up
  // asserting nothing. Callers pass nothing and get the real host.
  hostProtocol: string = typeof window === 'undefined' ? '' : (window.location?.protocol ?? ''),
): boolean {
  return isDevMode || hostProtocol === 'http:';
}

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
export function mediaTypeEssence(value: string | null | undefined): string {
  return (value ?? '').split(';', 1)[0].trim().toLowerCase();
}
