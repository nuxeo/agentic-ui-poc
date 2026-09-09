import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import DOMPurify from 'dompurify';

const ALLOWED_CONFIG_KEYS = new Set(['ALLOWED_TAGS', 'ALLOWED_ATTR', 'ADD_ATTR']);
const BLOCKED_TAGS = new Set(['script', 'iframe', 'object', 'embed', 'style', 'link', 'meta', 'base']);
const BLOCKED_ATTRS = new Set(['srcdoc']);

function assertSafeConfig(config?: Parameters<typeof DOMPurify.sanitize>[1]): void {
  if (!config) return;
  const cfg = config as Record<string, unknown>;

  for (const key of Object.keys(cfg)) {
    if (!ALLOWED_CONFIG_KEYS.has(key)) {
      throw new Error(`renderTrustedHtml: unsupported DOMPurify config key "${key}"`);
    }
  }

  const hasBlockedValue = (values: unknown, blocked: Set<string>, blockOnPrefix = false): boolean =>
    Array.isArray(values) &&
    values.some((value) => {
      if (typeof value !== 'string') return true;
      const normalized = value.toLowerCase();
      if (blockOnPrefix) return normalized.startsWith('on');
      return blocked.has(normalized);
    });

  if (hasBlockedValue(cfg['ALLOWED_TAGS'], BLOCKED_TAGS)) {
    throw new Error('renderTrustedHtml: active-content tags are not allowed');
  }

  if (
    hasBlockedValue(cfg['ALLOWED_ATTR'], BLOCKED_ATTRS) ||
    hasBlockedValue(cfg['ADD_ATTR'], BLOCKED_ATTRS) ||
    hasBlockedValue(cfg['ALLOWED_ATTR'], new Set<string>(), true) ||
    hasBlockedValue(cfg['ADD_ATTR'], new Set<string>(), true)
  ) {
    throw new Error('renderTrustedHtml: executable attributes are not allowed');
  }
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
export function renderTrustedHtml(
  sanitizer: DomSanitizer,
  html: string,
  config?: Parameters<typeof DOMPurify.sanitize>[1],
): SafeHtml {
  assertSafeConfig(config);
  const clean = DOMPurify.sanitize(html, config);
  return sanitizer.bypassSecurityTrustHtml(clean);
}
