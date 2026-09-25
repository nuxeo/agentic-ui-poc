import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * NXENG-801 — `.format-type` in the Preview/View tab additional-formats row must meet
 * WCAG 2.1 AA 4.5:1 for 11px regular text (IBM issue 374303107).
 *
 * Asserts the authored token in component SCSS rather than a computed style in jsdom,
 * because Vitest here does not load component styles into a real layout engine.
 */

const SCSS_PATH = resolve(import.meta.dirname, 'document-viewer.component.scss');

function luminance([r, g, b]: readonly number[]): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(fg: readonly number[], bg: readonly number[]): number {
  const [hi, lo] = [luminance(fg), luminance(bg)].sort((a, b) => b - a);
  return (hi + 0.05) / (lo + 0.05);
}

function parseHex(hex: string): number[] {
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) throw new Error(`not a #rrggbb colour: ${hex}`);
  const n = Number.parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function formatTypeColourFromScss(source: string): string {
  const block = /\.format-type\s*\{([^}]+)\}/s.exec(source);
  if (!block) {
    throw new Error('.format-type rule missing from document-viewer.component.scss');
  }
  const colourLine = block[1]
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.startsWith('color:'));
  if (!colourLine) {
    throw new Error('colour declaration missing on .format-type');
  }
  return colourLine;
}

describe('document viewer format-type contrast (NXENG-801)', () => {
  const scss = readFileSync(SCSS_PATH, 'utf8');
  const colourDecl = formatTypeColourFromScss(scss);

  it('does not use the failing #999 grey literal', () => {
    expect(colourDecl).not.toMatch(/#999\b/i);
  });

  it('uses the Material on-surface-variant token with an AA-safe fallback', () => {
    expect(colourDecl).toContain('var(--mat-sys-on-surface-variant');
    const fallback = /--mat-sys-on-surface-variant,\s*(#[0-9a-f]{6})/i.exec(colourDecl);
    expect(fallback?.[1], 'token fallback hex').toBeTruthy();
    const fg = parseHex(fallback?.[1] ?? '');
    for (const bg of [
      [255, 255, 255],
      [244, 243, 247],
    ] as const) {
      expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
    }
  });
});
