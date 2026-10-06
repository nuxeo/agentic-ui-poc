/**
 * NXENG-944 — WCAG 2.1 SC 1.3.4 Orientation: document detail must not lock layout to one
 * orientation via `@media (orientation: …)` content restrictions; narrow viewports reflow instead.
 *
 * Shipped CSS: `@media (max-width: 900px)` stacks `.detail-body` and caps `.properties-panel`
 * with `50vh` then `min(50dvh, 50vh)`. `.ai-tab-content` fills the mat-tab body via
 * `flex: 1` / `min-height: 0` (no viewport `max-height` — short landscape stays scrollable).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/** Drop comments so documentation about orientation rules cannot false-fail the scan. */
function scssWithoutComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

function scssBlock(source: string, className: string): string {
  const match = source.match(new RegExp(`\\.${className}\\s*\\{[^}]+\\}`, 's'));
  return match?.[0] ?? '';
}

/** Body of the `@media (max-width: 900px)` block in this stylesheet (brace-balanced). */
function narrowViewportMediaBlock(source: string): string {
  const start = source.search(/@media\s*\(\s*max-width:\s*900px\s*\)/);
  if (start === -1) {
    return '';
  }
  const open = source.indexOf('{', start);
  if (open === -1) {
    return '';
  }
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    const ch = source[i];
    if (ch === '{') {
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) {
        return source.slice(open + 1, i);
      }
    }
  }
  return '';
}

describe('DocumentDetailComponent — orientation (NXENG-944)', () => {
  const scssPath = join(import.meta.dirname, 'document-detail.scss');
  const scss = scssWithoutComments(readFileSync(scssPath, 'utf8'));

  it('does not use orientation media queries that can lock content to one mode', () => {
    expect(scss).not.toMatch(/@media[^{]*\(\s*orientation\s*:/i);
  });

  it('reflows the two-column body on narrow viewports via max-width, not orientation', () => {
    const narrow = narrowViewportMediaBlock(scss);
    expect(narrow.length).toBeGreaterThan(0);
    expect(narrow).toMatch(/\.detail-body\s*\{[^}]*flex-direction:\s*column/s);
    expect(narrow).toMatch(/\.properties-panel\s*\{[^}]*width:\s*100%/s);
    const panelInNarrow = narrow.match(/\.properties-panel\s*\{[^}]+\}/s)?.[0] ?? '';
    expect(panelInNarrow).toMatch(/max-height:\s*50vh/);
    expect(panelInNarrow).toMatch(/max-height:\s*min\(50dvh,\s*50vh\)/);
    const panelVhAt = panelInNarrow.indexOf('max-height: 50vh');
    const panelDvhAt = panelInNarrow.indexOf('50dvh');
    expect(panelVhAt).toBeGreaterThan(-1);
    expect(panelDvhAt).toBeGreaterThan(panelVhAt);
  });

  it('sizes AI tab scroll area through flex, not viewport subtraction that can collapse to zero', () => {
    const block = scssBlock(scss, 'ai-tab-content');
    expect(block).toMatch(/flex:\s*1/);
    expect(block).toMatch(/min-height:\s*0/);
    expect(block).toMatch(/overflow-y:\s*auto/);
    expect(block).not.toMatch(/max-height:\s*calc\(/);
  });
});
