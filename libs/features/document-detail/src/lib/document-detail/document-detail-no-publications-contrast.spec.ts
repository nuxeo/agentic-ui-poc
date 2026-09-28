/**
 * NXENG-917 — `.no-publications` empty state in doc-info must meet WCAG 2.1 SC 1.4.3 (IBM 3603735683).
 * Per-theme computed contrast: `apps/nuxeo-ui/.../no-publications-contrast.spec.ts`.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const WCAG_AA_NORMAL_TEXT = 4.5;

function scssBlock(source: string, className: string): string {
  const match = source.match(new RegExp(`\\.${className}\\s*\\{[^}]+\\}`, 's'));
  return match?.[0] ?? '';
}

function stripScssComments(block: string): string {
  return block.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

function hostBlock(source: string): string {
  return source.match(/:host\s*\{[^}]+\}/s)?.[0] ?? '';
}

function hostCustomProperty(source: string, name: string): string | null {
  const block = hostBlock(source);
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = block.match(
    new RegExp(`(?:^|[\\s;{])--${escaped}\\s*:\\s*([^;]+);`, 'm'),
  );
  return match?.[1]?.trim() ?? null;
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

describe('DocumentDetailComponent — no-publications text contrast (NXENG-917)', () => {
  const scssPath = join(import.meta.dirname, 'document-detail.scss');
  const scss = readFileSync(scssPath, 'utf8');
  const emptyBlock = stripScssComments(scssBlock(scss, 'no-publications'));

  it('themes empty publications through the light-panel host token, not #aaa', () => {
    expect(emptyBlock).toMatch(/var\(--document-detail-properties-label-muted\)/);
    expect(emptyBlock).not.toMatch(/#aaa/i);
    expect(hostCustomProperty(scss, 'document-detail-properties-label-muted')).toBe('#5c5f6b');
    expect(hostCustomProperty(scss, 'document-detail-properties-panel-surface')).toBe('#ffffff');
  });

  it(`host token pair meets ${WCAG_AA_NORMAL_TEXT}:1 on the properties panel`, () => {
    const fgCss = hostCustomProperty(scss, 'document-detail-properties-label-muted');
    const bgCss = hostCustomProperty(scss, 'document-detail-properties-panel-surface');
    const fg = fgCss ? parseHex(fgCss) : null;
    const bg = bgCss ? parseHex(bgCss) : null;
    expect(fg).not.toBeNull();
    expect(bg).not.toBeNull();
    if (!fg || !bg) return;
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
  });

  it('legacy #aaa on white fails WCAG AA (documents the reported defect)', () => {
    const fg = parseHex('#aaaaaa');
    const bg = parseHex('#ffffff');
    expect(fg).not.toBeNull();
    expect(bg).not.toBeNull();
    if (!fg || !bg) return;
    const ratio = contrastRatio(fg, bg);
    expect(ratio).toBeLessThan(WCAG_AA_NORMAL_TEXT);
    expect(ratio).toBeCloseTo(2.32, 1);
  });
});
