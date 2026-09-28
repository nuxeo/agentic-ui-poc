/**
 * NXENG-764 — `.prop-label` metadata field labels (IBM 67686130) must meet WCAG 2.1 SC 1.4.3.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('DocumentDetailComponent — prop-label text contrast (NXENG-764)', () => {
  it('themes .prop-label with on-surface-variant, not low-contrast #888', () => {
    const scss = readFileSync(join(import.meta.dirname, 'document-detail.scss'), 'utf8');
    const block = scss.match(/\.prop-label\s*\{[^}]+\}/s)?.[0] ?? '';
    expect(block).toMatch(/var\(--mat-sys-on-surface-variant,\s*#5c5f6b\)/);
    expect(block).not.toMatch(/color:\s*#888/i);
  });
});
