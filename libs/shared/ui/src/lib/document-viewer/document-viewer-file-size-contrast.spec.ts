/**
 * NXENG-763 — IBM 56037090: `.file-size` must use a theme token meeting WCAG AA on the footer,
 * not hardcoded #888 (11px secondary label on white).
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const scssPath = resolve(import.meta.dirname, 'document-viewer.component.scss');

describe('document viewer file size label — text contrast (NXENG-763)', () => {
  it('styles .file-size with the on-surface-variant token, not low-contrast #888', () => {
    const source = readFileSync(scssPath, 'utf8');
    const block = source.match(/\.file-size\s*\{[^}]+\}/s)?.[0] ?? '';
    expect(block).toContain('font-size: 11px');
    expect(block).toMatch(/var\(--mat-sys-on-surface-variant/);
    expect(block).not.toMatch(/color:\s*#888\b/);
  });
});
