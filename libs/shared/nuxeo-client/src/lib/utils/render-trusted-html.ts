import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import DOMPurify from 'dompurify';

/**
 * Wraps HTML with `bypassSecurityTrustHtml` after sanitizing it through DOMPurify.
 *
 * ## Why this exists
 *
 * `[innerHTML]` requires a `SafeHtml` value — binding a raw string throws in development and is
 * stripped in production. So the bypass is unavoidable, and consolidating the 8 inline calls that
 * pair a sanitizer with a bypass makes two things true:
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
 * ## What it does NOT do
 *
 * It does not validate that the caller's config is safe — that is a review concern, not a runtime
 * one. `ADD_TAGS: ['script']` would be unsafe, and this helper cannot stop it. The contract is that
 * the caller provides a DOMPurify config appropriate for their threat model, and this helper applies
 * it faithfully.
 */
export function renderTrustedHtml(
  sanitizer: DomSanitizer,
  html: string,
  config?: Parameters<typeof DOMPurify.sanitize>[1],
): SafeHtml {
  const clean = DOMPurify.sanitize(html, config);
  return sanitizer.bypassSecurityTrustHtml(clean);
}
