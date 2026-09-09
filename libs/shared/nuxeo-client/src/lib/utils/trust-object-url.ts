import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/**
 * Wraps a locally-minted object URL with `bypassSecurityTrustResourceUrl` after validating it is
 * actually an object URL.
 *
 * ## Why this exists
 *
 * `URL.createObjectURL(blob)` returns a `blob:` URL that is safe to load — the blob was fetched by
 * this code and the URL points into this document's own object store — but Angular's `RESOURCE_URL`
 * sanitizer throws on a raw string. So the bypass is unavoidable, and consolidating the 7 inline
 * calls that do exactly this makes two things true:
 *
 *   1. The justification lives in one place rather than scattered across 7 docstrings.
 *   2. `scripts/beta-harness/sanitizer-audit.mjs` can enforce that every object-URL bypass goes
 *      through here, so a new inline one is rejected by the gate rather than discovered in review.
 *
 * ## What it checks
 *
 * That `url` is a `blob:` URL. Anything else — including a blank string, a relative path, or
 * another scheme — is rejected and returns `null`, which every caller already treats as "no preview
 * available". An object URL that arrived from configuration or a server response was not minted by
 * this document, so accepting one would be a mistake rather than a bypass.
 *
 * `DomSanitizer` is passed in rather than injected so this can be a pure function, making it easier
 * to test and reason about. The helper does not own the sanitizer instance.
 *
 * ## Lifecycle note
 *
 * This only *wraps* the URL; it does not manage its lifecycle. The caller that minted the object
 * URL is responsible for calling `URL.revokeObjectURL()` when the blob is no longer needed, which
 * for a component means in `ngOnDestroy` or tied to `DestroyRef`. See
 * `scripts/review-guardrails.mjs` for the pairing check that enforces this.
 */
export function trustObjectUrl(
  sanitizer: DomSanitizer,
  url: string | null | undefined,
): SafeResourceUrl | null {
  if (typeof url !== 'string' || url.trim() === '') return null;

  // The only legitimate case is a `blob:` URL minted by this document. Anything else — including
  // a different scheme, a relative path, or a `blob:` URL from configuration/server (which was not
  // minted here) — is rejected. `new URL()` is not needed: the scheme is enough, and parsing a
  // deliberately-malicious input is exactly what we want to avoid.
  if (!url.startsWith('blob:')) return null;

  return sanitizer.bypassSecurityTrustResourceUrl(url);
}
