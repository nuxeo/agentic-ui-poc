/**
 * NXENG-774 / NXENG-782 — measure `.doc-info-label` contrast on the fixed light properties panel
 * under every compiled palette. Karma loads `apps/nuxeo-ui/src/styles.scss`.
 */
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { COMPILED_THEME_BASES } from '../theme/app-theme';

const WCAG_AA_NORMAL_TEXT = 4.5;

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

function opaqueBackground(element: HTMLElement): [number, number, number] {
  for (let node: HTMLElement | null = element; node; node = node.parentElement) {
    const bg = parseRgb(getComputedStyle(node).backgroundColor);
    if (bg && getComputedStyle(node).backgroundColor !== 'rgba(0, 0, 0, 0)') {
      return bg;
    }
  }
  return [255, 255, 255];
}

@Component({
  standalone: true,
  styleUrls: [
    '../../../../../libs/features/document-detail/src/lib/document-detail/document-detail.scss',
  ],
  templateUrl: './document-detail-doc-info-label-contrast.host.html',
})
class DocumentDetailDocInfoLabelHostComponent {}

describe('Document detail doc-info-label contrast by theme (NXENG-774, NXENG-782)', () => {
  let fixture: ComponentFixture<DocumentDetailDocInfoLabelHostComponent>;
  let originalTheme: string | null;

  beforeEach(async () => {
    originalTheme = document.documentElement.getAttribute('data-app-theme');

    await TestBed.configureTestingModule({
      imports: [DocumentDetailDocInfoLabelHostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentDetailDocInfoLabelHostComponent);
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

  for (const theme of COMPILED_THEME_BASES) {
    it(`meets ${WCAG_AA_NORMAL_TEXT}:1 on ${theme}`, () => {
      document.documentElement.setAttribute('data-app-theme', theme);
      fixture.detectChanges();

      const label = fixture.nativeElement.querySelector('.doc-info-label') as HTMLElement | null;
      const panel = fixture.nativeElement.querySelector('.properties-panel') as HTMLElement | null;
      expect(label).withContext(`theme ${theme} should render .doc-info-label`).not.toBeNull();
      expect(panel).withContext(`theme ${theme} should render .properties-panel`).not.toBeNull();
      if (!label || !panel) return;

      const fg = parseRgb(getComputedStyle(label).color);
      expect(fg).withContext(`theme ${theme} label colour`).not.toBeNull();
      if (!fg) return;

      const bg = opaqueBackground(label);
      const ratio = contrastRatio(fg, bg);
      expect(ratio)
        .withContext(`theme ${theme} doc-info-label on properties panel backdrop`)
        .toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    });
  }
});
