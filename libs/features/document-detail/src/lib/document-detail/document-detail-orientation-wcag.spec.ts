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
  });

  it('uses dynamic viewport units for scrollable tab panels where height is viewport-bound', () => {
    const block = scssBlock(scss, 'ai-tab-content');
    expect(block).toMatch(/max-height:\s*calc\(100vh\s*-\s*350px\)/);
    expect(block).toMatch(/max-height:\s*calc\(100dvh\s*-\s*350px\)/);
    const vhAt = block.indexOf('100vh');
    const dvhAt = block.indexOf('100dvh');
    expect(vhAt).toBeGreaterThan(-1);
    expect(dvhAt).toBeGreaterThan(-1);
    expect(vhAt).toBeLessThan(dvhAt);
  });
});
