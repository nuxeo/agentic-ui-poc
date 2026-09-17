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
 * available". Provenance is a caller precondition: the helper cannot prove a `blob:` URL was minted
 * by this document.
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

  // Scheme guard only. Provenance is caller-owned: pass only object URLs from
  // `URL.createObjectURL(blob)` in this document.
  if (!url.startsWith('blob:')) return null;

  return sanitizer.bypassSecurityTrustResourceUrl(url);
}
