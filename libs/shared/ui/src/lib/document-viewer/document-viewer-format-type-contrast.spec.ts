/**
 * NXENG-760 — `.format-type` in the picture viewer strip used `#999` at 11px/400, ~2.85:1 on
 * the white `.picture-cards` background (IBM `text_contrast_sufficient`, Issue 56037090).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const MIN_AA_TEXT = 4.5;
const TOKEN_FALLBACK = '#5c5f6b';
const LEGACY_COLOR = '#999999';
const CARD_BACKGROUND = '#ffffff';

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (v: number): number => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(a: [number, number, number], b: [number, number, number]): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function hexRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const full =
    h.length === 3
      ? h
          .split('')
          .map((c) => c + c)
          .join('')
      : h;
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

describe('document viewer — format-type text contrast (NXENG-760)', () => {
  it('styles .format-type with the theme secondary text token, not #999', () => {
    const scss = readFileSync(
      join(process.cwd(), 'libs/shared/ui/src/lib/document-viewer/document-viewer.component.scss'),
      'utf8',
    );
    const block = scss.match(/\.format-type\s*\{[^}]+\}/s)?.[0] ?? '';
    expect(block).toContain('var(--mat-sys-on-surface-variant');
    expect(block).not.toMatch(/color:\s*#999/);
  });

  it('meets WCAG AA (4.5:1) for the token fallback on the picture card background', () => {
    const fg = hexRgb(TOKEN_FALLBACK);
    const bg = hexRgb(CARD_BACKGROUND);
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(MIN_AA_TEXT);
    expect(contrastRatio(fg, bg)).toBeGreaterThan(contrastRatio(hexRgb(LEGACY_COLOR), bg));
  });
});
