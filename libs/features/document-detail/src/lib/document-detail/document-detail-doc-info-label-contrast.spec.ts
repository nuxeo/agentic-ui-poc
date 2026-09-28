/**
 * NXENG-774 — `.doc-info-label` in the properties panel must meet WCAG 2.1 SC 1.4.3 (IBM 280073873).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const WCAG_AA_NORMAL_TEXT = 4.5;

function scssBlock(source: string, className: string): string {
  const match = source.match(new RegExp(`\\.${className}\\s*\\{[^}]+\\}`, 's'));
  return match?.[0] ?? '';
}

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    Number.parseInt(h.slice(0, 2), 16),
    Number.parseInt(h.slice(2, 4), 16),
    Number.parseInt(h.slice(4, 6), 16),
  ];
}

function luminance([r, g, b]: readonly number[]): number {
  const s = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * s[0] + 0.7152 * s[1] + 0.0722 * s[2];
}

function contrastRatio(fg: readonly number[], bg: readonly number[]): number {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe('DocumentDetailComponent — doc-info-label text contrast (NXENG-774)', () => {
  it('themes doc-info-label with on-surface-variant, not legacy #888', () => {
    const scssPath = join(import.meta.dirname, 'document-detail.scss');
    const scss = readFileSync(scssPath, 'utf8');
    const label = scssBlock(scss, 'doc-info-label');
    expect(label).toMatch(/var\(--mat-sys-on-surface-variant,\s*#5c5f6b\)/);
    expect(label).not.toMatch(/color:\s*#888/i);
  });

  it(`fallback #5c5f6b on white meets ${WCAG_AA_NORMAL_TEXT}:1`, () => {
    const fg = parseHex('#5c5f6b');
    const bg = parseHex('#ffffff');
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
  });

  it('legacy #888 on white fails WCAG AA (documents the reported defect)', () => {
    const fg = parseHex('#888888');
    const bg = parseHex('#ffffff');
    const ratio = contrastRatio(fg, bg);
    expect(ratio).toBeLessThan(WCAG_AA_NORMAL_TEXT);
    expect(ratio).toBeCloseTo(3.54, 1);
  });
});
