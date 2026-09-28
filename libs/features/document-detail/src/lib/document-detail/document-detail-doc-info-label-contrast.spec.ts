/**
 * NXENG-813 — `.doc-info-label` on the fixed white properties panel (IBM 787384272).
 */
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const WCAG_AA_NORMAL_TEXT = 4.5;

@Component({
  standalone: true,
  selector: 'lib-document-detail-doc-info-label-contrast-host',
  templateUrl: './document-detail-doc-info-label-contrast.host.html',
  styleUrls: ['./document-detail.scss'],
})
class DocumentDetailDocInfoLabelContrastHost {}

function scssBlock(source: string, className: string): string {
  const match = source.match(new RegExp(`\\.${className}\\s*\\{[^}]+\\}`, 's'));
  return match?.[0] ?? '';
}

function parseRgb(css: string): [number, number, number] | null {
  const m = css.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
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

function opaqueBackground(element: HTMLElement): [number, number, number] {
  for (let node: HTMLElement | null = element; node; node = node.parentElement) {
    const bg = parseRgb(getComputedStyle(node).backgroundColor);
    if (bg && getComputedStyle(node).backgroundColor !== 'rgba(0, 0, 0, 0)') {
      return bg;
    }
  }
  return [255, 255, 255];
}

describe('DocumentDetailComponent — doc-info-label contrast (NXENG-813)', () => {
  const scssPath = join(import.meta.dirname, 'document-detail.scss');
  const scss = readFileSync(scssPath, 'utf8');

  it('pairs doc-info-label with the light-panel host token, not legacy #888', () => {
    const hostBlock = scss.match(/:host\s*\{[\s\S]*?\n\}/m)?.[0] ?? '';
    const label = scssBlock(scss, 'doc-info-label');
    expect(hostBlock).toMatch(/--document-detail-muted-on-light-panel:\s*#5c5f6b/);
    expect(label).toMatch(/var\(--document-detail-muted-on-light-panel\)/);
    expect(label).not.toMatch(/#888/i);
  });

  describe('rendered properties panel', () => {
    let fixture: ComponentFixture<DocumentDetailDocInfoLabelContrastHost>;
    let originalTheme: string | null;

    beforeEach(async () => {
      originalTheme = document.documentElement.getAttribute('data-app-theme');
      await TestBed.configureTestingModule({
        imports: [DocumentDetailDocInfoLabelContrastHost],
        providers: [provideZonelessChangeDetection()],
      }).compileComponents();
      fixture = TestBed.createComponent(DocumentDetailDocInfoLabelContrastHost);
      document.body.appendChild(fixture.nativeElement);
      fixture.detectChanges();
    });

    afterEach(() => {
      fixture.nativeElement.remove();
      if (originalTheme === null) {
        document.documentElement.removeAttribute('data-app-theme');
      } else {
        document.documentElement.setAttribute('data-app-theme', originalTheme);
      }
    });

    it(`meets ${WCAG_AA_NORMAL_TEXT}:1 on the white panel (default and dark theme)`, () => {
      for (const theme of ['dark', null] as const) {
        if (theme === null) {
          document.documentElement.removeAttribute('data-app-theme');
        } else {
          document.documentElement.setAttribute('data-app-theme', theme);
        }
        fixture.detectChanges();

        const panel = fixture.nativeElement.querySelector('.properties-panel') as HTMLElement;
        const label = fixture.nativeElement.querySelector('.doc-info-label') as HTMLElement;
        expect(panel).not.toBeNull();
        expect(label).not.toBeNull();
        if (!panel || !label) return;

        const fg = parseRgb(getComputedStyle(label).color);
        const bg = opaqueBackground(label);
        expect(fg).not.toBeNull();
        if (!fg) return;

        const ratio = contrastRatio(fg, bg);
        expect(ratio)
          .withContext(
            `${getComputedStyle(label).color} on panel backdrop rgb(${bg.join(',')}) (${theme ?? 'default'})`,
          )
          .toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
      }
    });

    it('uses the host light-panel token, not a light Material surface-variant in dark theme', () => {
      document.documentElement.setAttribute('data-app-theme', 'dark');
      document.documentElement.style.setProperty('--mat-sys-on-surface-variant', 'rgb(200, 200, 200)');
      fixture.detectChanges();

      const label = fixture.nativeElement.querySelector('.doc-info-label') as HTMLElement;
      expect(label).not.toBeNull();
      if (!label) return;

      const fg = parseRgb(getComputedStyle(label).color);
      expect(fg).not.toBeNull();
      if (!fg) return;
      expect(fg[0]).toBeLessThan(128);
    });
  });

  it(`fallback token meets ${WCAG_AA_NORMAL_TEXT}:1 on white`, () => {
    const tokenMatch = scss.match(/--document-detail-muted-on-light-panel:\s*(#[0-9a-f]{6})/i);
    const fg = parseHex(tokenMatch?.[1] ?? '#5c5f6b');
    const bg = parseHex('#ffffff');
    expect(fg).not.toBeNull();
    expect(bg).not.toBeNull();
    if (!fg || !bg) return;
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
  });
});
