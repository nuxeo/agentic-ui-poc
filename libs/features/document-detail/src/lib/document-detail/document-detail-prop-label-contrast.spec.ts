/**
 * NXENG-861 — `.prop-label` in the properties sidebar must meet WCAG 2.1 SC 1.4.3 (IBM 1882757527).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const WCAG_AA_NORMAL_TEXT = 4.5;

function scssBlock(source: string, className: string): string {
  const match = source.match(new RegExp(`\\.${className}\\s*\\{[^}]+\\}`, 's'));
  return match?.[0] ?? '';
}

function parseHex(css: string): [number, number, number] | null {
  const m = css.match(/#([0-9a-f]{6})\b/i);
  if (!m) return null;
  const hex = m[1];
  return [
    Number.parseInt(hex.slice(0, 2), 16),
    Number.parseInt(hex.slice(2, 4), 16),
    Number.parseInt(hex.slice(4, 6), 16),
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

describe('DocumentDetailComponent — prop-label text contrast (NXENG-861)', () => {
  const scssPath = join(import.meta.dirname, 'document-detail.scss');
  const scss = readFileSync(scssPath, 'utf8');
  const labelBlock = scssBlock(scss, 'prop-label');

  it('themes property labels with on-surface-variant, not legacy #888', () => {
    expect(labelBlock).toMatch(/var\(--mat-sys-on-surface-variant,\s*#5c5f6b\)/);
    expect(labelBlock).not.toMatch(/color:\s*#888/i);
  });

  it(`fallback token meets ${WCAG_AA_NORMAL_TEXT}:1 on the properties panel surface`, () => {
    const fg = parseHex(labelBlock);
    expect(fg).not.toBeNull();
    if (!fg) return;
    const panelBlock = scssBlock(scss, 'properties-panel');
    const bg = parseHex(panelBlock) ?? [255, 255, 255];
    const ratio = contrastRatio(fg, bg);
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
  });
});
