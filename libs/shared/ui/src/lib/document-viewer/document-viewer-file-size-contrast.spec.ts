/**
 * NXENG-790 — IBM Equal Access issue 300762098 (`text_contrast_sufficient`, WCAG 1.4.3 AA)
 * on `.file-size` in the document viewer footer (11px secondary label on a white footer).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const scssPath = resolve(import.meta.dirname, 'document-viewer.component.scss');

describe('document viewer file size label — text contrast (NXENG-790)', () => {
  it('styles .file-size with the on-surface-variant token, not low-contrast #888', () => {
    const source = readFileSync(scssPath, 'utf8');
    const block = source.match(/\.file-size\s*\{[^}]+\}/s)?.[0] ?? '';
    expect(block).toContain('font-size: 11px');
    expect(block).toMatch(/var\(--mat-sys-on-surface-variant/);
    expect(block).not.toMatch(/color:\s*#888\b/);
  });
});
