/**
 * NXENG-858 — `.prop-label` in the properties sidebar must meet WCAG 2.1 SC 1.4.3 (IBM 1792790291).
 * Per-theme contrast is covered in `apps/nuxeo-ui/.../document-detail-prop-label-contrast.spec.ts`.
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
  const m = /^#([0-9a-f]{6})$/i.exec(hex.trim());
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

describe('DocumentDetailComponent — prop-label text contrast (NXENG-858)', () => {
  const scssPath = join(import.meta.dirname, 'document-detail.scss');
  const scss = readFileSync(scssPath, 'utf8');

  it('themes property labels through the light-panel host token', () => {
    const host = scss.match(/:host\s*\{[^}]+\}/s)?.[0] ?? '';
    const label = scssBlock(scss, 'prop-label');
    expect(host).toMatch(/--document-detail-properties-label-muted:\s*#5c5f6b/);
    expect(label).toMatch(/var\(--document-detail-properties-label-muted\)/);
    expect(label).not.toMatch(/color:\s*#888/i);
  });

  it(`fallback token meets ${WCAG_AA_NORMAL_TEXT}:1 on the properties panel surface`, () => {
    const panel = scssBlock(scss, 'properties-panel');
    expect(panel).toMatch(/background:\s*#fff/i);
    const fg = parseHex('#5c5f6b');
    const bg = parseHex('#ffffff');
    expect(fg).not.toBeNull();
    expect(bg).not.toBeNull();
    if (!fg || !bg) return;
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
  });
});
