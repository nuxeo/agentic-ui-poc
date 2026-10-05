/**
 * NXENG-944 — WCAG 2.1 SC 1.3.4 Orientation: document detail must not lock layout to one
 * orientation via `@media (orientation: …)` content restrictions; narrow viewports reflow instead.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/** Drop comments so documentation about orientation rules cannot false-fail the scan. */
function scssWithoutComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

describe('DocumentDetailComponent — orientation (NXENG-944)', () => {
  const scssPath = join(import.meta.dirname, 'document-detail.scss');
  const scss = scssWithoutComments(readFileSync(scssPath, 'utf8'));

  it('does not use orientation media queries that can lock content to one mode', () => {
    expect(scss).not.toMatch(/@media[^{]*\(\s*orientation\s*:/i);
  });

  it('reflows the two-column body on narrow viewports via max-width, not orientation', () => {
    expect(scss).toMatch(/@media\s*\(\s*max-width:\s*900px\s*\)/);
    expect(scss).toMatch(/\.detail-body\s*\{[^}]*flex-direction:\s*column/s);
    expect(scss).toMatch(/\.properties-panel\s*\{[^}]*width:\s*100%/s);
  });

  it('uses dynamic viewport units for scrollable tab panels where height is viewport-bound', () => {
    expect(scss).toMatch(/\.ai-tab-content\s*\{[^}]*100dvh/s);
  });
});
