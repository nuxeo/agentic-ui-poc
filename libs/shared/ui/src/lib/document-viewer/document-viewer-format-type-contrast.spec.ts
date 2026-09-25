/**
 * NXENG-856 — `.format-type` in the Preview tab Additional formats strip must meet WCAG 2.1
 * SC 1.4.3 (IBM `text_contrast_sufficient`, issue 1766416709). The label is 11px / 400 weight;
 * AA requires 4.5:1 against the white `.picture-cards` surface. Playwright evidence measures
 * the live ratio; this spec pins the stylesheet so `#999` cannot return.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const scssPath = join(__dirname, 'document-viewer.component.scss');

function formatTypeBlock(source: string): string {
  const match = source.match(/\.format-type\s*\{[^}]+\}/s);
  return match?.[0] ?? '';
}

describe('DocumentViewerComponent — format-type text contrast (NXENG-856)', () => {
  it('uses a theme on-surface-variant token instead of #999 for .format-type', () => {
    const block = formatTypeBlock(readFileSync(scssPath, 'utf8'));
    expect(block, 'expected a .format-type rule in document-viewer.component.scss').not.toBe('');
    expect(block).toMatch(/var\(--mat-sys-on-surface-variant/);
    expect(block).not.toMatch(/#999/i);
  });
});
