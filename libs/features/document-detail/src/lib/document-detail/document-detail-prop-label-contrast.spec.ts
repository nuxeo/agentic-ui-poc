/**
 * NXENG-769 — metadata sidebar `.prop-label` must meet WCAG 2.1 SC 1.4.3 (IBM 67686130).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const WCAG_AA_NORMAL_TEXT = 4.5;

function scssBlock(source: string, className: string): string {
  const match = source.match(new RegExp(`\\.${className}\\s*\\{[^}]+\\}`, 's'));
  return match?.[0] ?? '';
}

function parseRgb(css: string): [number, number, number] | null {
  const m = css.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
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

describe('DocumentDetailComponent — prop-label text contrast (NXENG-769)', () => {
  const scssPath = join(import.meta.dirname, 'document-detail.scss');
  const scss = readFileSync(scssPath, 'utf8');
  const labelBlock = scssBlock(scss, 'prop-label');
  const panelBlock = scssBlock(scss, 'properties-panel');

  it('themes property labels with mat-sys on-surface-variant, not legacy grey', () => {
    expect(labelBlock).toMatch(/var\(--mat-sys-on-surface-variant\)/);
    expect(labelBlock).not.toMatch(/#888/i);
  });

  it(`meets ${WCAG_AA_NORMAL_TEXT}:1 on the properties panel fallback surface`, () => {
    const panelBgMatch = panelBlock.match(/background:\s*(#[0-9a-f]{3,6}|rgb\([^)]+\))/i);
    const panelBg = panelBgMatch?.[1] ?? '#fff';
    const bg =
      panelBg.startsWith('#') && panelBg.length === 4
        ? [
            parseInt(panelBg[1] + panelBg[1], 16),
            parseInt(panelBg[2] + panelBg[2], 16),
            parseInt(panelBg[3] + panelBg[3], 16),
          ]
        : panelBg.startsWith('#')
          ? [
              parseInt(panelBg.slice(1, 3), 16),
              parseInt(panelBg.slice(3, 5), 16),
              parseInt(panelBg.slice(5, 7), 16),
            ]
          : (parseRgb(panelBg) ?? [255, 255, 255]);

    // Material default on-surface-variant on light themes (~#49454f).
    const fg: [number, number, number] = [73, 69, 79];
    const ratio = contrastRatio(fg, bg);
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
  });
});
