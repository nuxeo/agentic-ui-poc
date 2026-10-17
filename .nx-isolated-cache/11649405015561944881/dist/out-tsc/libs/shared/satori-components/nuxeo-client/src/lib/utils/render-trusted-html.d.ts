import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
/**
 * The only config this helper accepts, as a type rather than as a runtime surprise.
 *
 * The parameter used to be DOMPurify's own `Config`, which types roughly 40 options and permits
 * `ADD_ATTR` to be a predicate. `assertSafeConfig` throws for all but three keys and for any
 * non-array value, so a consumer could write a config that type-checked and then threw at runtime —
 * the compiler actively pointed the wrong way. This type is the guard's contract expressed where the
 * caller can see it, so an unsupported option is a compile error and the runtime check becomes the
 * backstop for untyped callers rather than the only line of defence.
 */
export interface TrustedHtmlConfig {
    /** Elements to keep. Active-content tags are rejected — see {@link BLOCKED_TAGS}. */
    ALLOWED_TAGS?: string[];
    /** Attributes to keep. `on*` handlers and `srcdoc` are rejected. */
    ALLOWED_ATTR?: string[];
    /** Attributes to keep *in addition to* DOMPurify's defaults. Same restrictions as ALLOWED_ATTR. */
    ADD_ATTR?: string[];
}
/**
 * Wraps HTML with `bypassSecurityTrustHtml` after sanitizing it through DOMPurify.
 *
 * ## Why this exists
 *
 * Angular accepts raw strings for `[innerHTML]` and applies its own HTML sanitizer. This helper
 * keeps the repository's reviewed DOMPurify output together with the audited bypass, so the 8
 * formerly inline sanitize-then-bypass sites share one implementation and one security rationale.
 * Consolidating them makes two things true:
 *
 *   1. The justification ("safe as a PAIRING") lives in one place.
 *   2. `scripts/beta-harness/sanitizer-audit.mjs` can enforce that every innerHTML bypass goes
 *      through here, so a new unpaired one is rejected by the gate.
 *
 * ## What it does
 *
 * Runs `DOMPurify.sanitize(html, config)` and wraps the result. The config is caller-supplied so
 * each site can declare its allow-list: note editor needs `<strong> <em>`, AI markdown needs
 * `<ol> <ul> <li>`, citation highlighting needs `<mark>`. A missing config uses DOMPurify's default
 * (secure but restrictive — strips `<iframe>`, `<script>`, `on*` handlers, `javascript:` URLs).
 *
 * `DomSanitizer` is passed in rather than injected so this can be a pure function.
 *
 * Only a narrow config subset is accepted (`ALLOWED_TAGS`, `ALLOWED_ATTR`, `ADD_ATTR`), and active
 * content is rejected (`script`/`iframe` tags, `on*`/`srcdoc` attributes).
 */
export declare function renderTrustedHtml(sanitizer: DomSanitizer, html: string, config?: TrustedHtmlConfig): SafeHtml;
//# sourceMappingURL=render-trusted-html.d.ts.map