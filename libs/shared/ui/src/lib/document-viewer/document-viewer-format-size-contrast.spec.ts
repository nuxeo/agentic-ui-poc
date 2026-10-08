/**
 * NXENG-806 — SCSS contract for `.format-size` on the fixed light picture-cards strip
 * (IBM Issue ID 626137632; was hardcoded #999 ~2.85:1).
 *
 * Runtime WCAG 2.1 SC 1.4.3 contrast is owned by the Karma theme matrix in
 * `apps/nuxeo-ui/.../document-viewer-format-type-contrast.spec.ts` (see docs/accessibility.md).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

/** Rule blocks whose selector prelude includes `.className` (compound/pseudo included). */
function scssBlocks(source: string, className: string): { prelude: string; body: string }[] {
  const re = new RegExp(`([^{}]*\\.${className}\\b[^{]*)\\{([^}]+)\\}`, 'gs');
  return [...source.matchAll(re)].map((match) => ({
    prelude: match[1].trim(),
    body: match[2],
  }));
}

describe('DocumentViewerComponent — format-size SCSS contract (NXENG-806)', () => {
  it('scssBlocks catches compound and pseudo-class .format-size selectors', () => {
    const sample = [
      '.format-size { color: var(--document-viewer-muted-on-light-surface); }',
      '.picture-cards .format-size { color: var(--document-viewer-muted-on-light-surface); }',
      '.format-size.regressed { color: #999; }',
    ].join('\n');
    const blocks = scssBlocks(sample, 'format-size');
    expect(blocks).toHaveLength(3);
    expect(blocks.some(({ body }) => /#999/i.test(body))).toBe(true);
  });

  it('pins every .format-size block to the light-strip muted token per NXENG-806', () => {
    const scssPath = join(import.meta.dirname, 'document-viewer.component.scss');
    const scss = readFileSync(scssPath, 'utf8');
    const sizeBlocks = scssBlocks(scss, 'format-size');
    expect(sizeBlocks.length, '.format-size declarations in SCSS').toBeGreaterThan(0);
    for (const { body } of sizeBlocks) {
      expect(body).toMatch(/var\(--document-viewer-muted-on-light-surface\)/);
      expect(body).not.toMatch(/#999/i);
    }
  });
});
