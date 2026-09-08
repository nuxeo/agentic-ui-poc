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
 *   - the ARender viewer origin, from the **customer-editable** runtime app-config manifest;
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
   * Permit `http:`. A plaintext document in an `iframe` is a downgrade, so this should be
   * `isDevMode()` at the call site and never a constant `true`.
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
 * Whether `origin` is usable as the base of a navigable URL: absolute, http(s), and `https:` unless
 * insecure is explicitly permitted. Used to reject a configured viewer origin before anything is
 * built from it.
 */
export function isNavigableOrigin(
  value: string | null | undefined,
  allowInsecure = false,
): boolean {
  return navigableUrlOrNull(value, { allowInsecure }) !== null;
}
