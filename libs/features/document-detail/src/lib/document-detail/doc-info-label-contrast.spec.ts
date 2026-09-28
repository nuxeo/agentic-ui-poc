/**
 * NXENG-829 — `.doc-info-label` in the properties panel must meet WCAG 2.1 SC 1.4.3 (IBM 1224611475).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const WCAG_AA_NORMAL_TEXT = 4.5;

function scssBlock(source: string, className: string): string {
  const match = source.match(new RegExp(`\\.${className}\\s*\\{[^}]+\\}`, 's'));
  return match?.[0] ?? '';
}

function parseHex(hex: string): [number, number, number] | null {
  const m = hex.match(/^#([0-9a-f]{6})$/i);
  if (!m) return null;
  const n = Number.parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
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

describe('DocumentDetailComponent — doc-info-label text contrast (NXENG-829)', () => {
  const scssPath = join(import.meta.dirname, 'document-detail.scss');
  const scss = readFileSync(scssPath, 'utf8');
  const labelBlock = scssBlock(scss, 'doc-info-label');

  it('themes metadata labels with mat-sys on-surface-variant', () => {
    expect(labelBlock).toMatch(/var\(--mat-sys-on-surface-variant,\s*#6b7080\)/);
    expect(labelBlock).not.toMatch(/#888/i);
  });

  it(`fallback colour meets ${WCAG_AA_NORMAL_TEXT}:1 on a white panel surface`, () => {
    const fallbackMatch = labelBlock.match(/#([0-9a-f]{6})/i);
    expect(fallbackMatch).not.toBeNull();
    const fg = parseHex(`#${fallbackMatch![1]}`);
    expect(fg).not.toBeNull();
    if (!fg) return;
    const ratio = contrastRatio(fg, [255, 255, 255]);
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
  });
});
