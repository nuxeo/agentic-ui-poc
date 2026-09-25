/**
 * NXENG-763 — measure `.file-size` contrast on `.viewer-footer` under every compiled palette.
 * Karma loads `apps/nuxeo-ui/src/styles.scss`, so `data-app-theme` resolves real token pairs.
 */
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DomSanitizer, type SafeResourceUrl } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { DocumentViewerComponent } from '@nuxeo-satori/platform/ui';

import { testTranslateModule } from '../i18n/translate-testing';
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
  const own = parseRgb(getComputedStyle(element).backgroundColor);
  if (own && getComputedStyle(element).backgroundColor !== 'rgba(0, 0, 0, 0)') {
    return own;
  }
  for (let node: HTMLElement | null = element; node; node = node.parentElement) {
    const bg = parseRgb(getComputedStyle(node).backgroundColor);
    if (bg && getComputedStyle(node).backgroundColor !== 'rgba(0, 0, 0, 0)') {
      return bg;
    }
  }
  return [255, 255, 255];
}

describe('DocumentViewer file-size contrast by theme (NXENG-763)', () => {
  let fixture: ComponentFixture<DocumentViewerComponent>;
  let originalTheme: string | null;

  beforeEach(async () => {
    originalTheme = document.documentElement.getAttribute('data-app-theme');

    await TestBed.configureTestingModule({
      imports: [DocumentViewerComponent, testTranslateModule()],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentViewerComponent);
    document.body.appendChild(fixture.nativeElement);

    const raw = 'blob:http://localhost/sample';
    const trusted = (): SafeResourceUrl =>
      TestBed.inject(DomSanitizer).bypassSecurityTrustResourceUrl(raw);

    fixture.componentRef.setInput('fileName', 'sample.csv');
    fixture.componentRef.setInput('fileSize', '182 B');
    fixture.componentRef.setInput('mimeType', 'text/csv');
    fixture.componentRef.setInput('blobUrl', trusted());
    fixture.componentRef.setInput('rawBlobUrl', raw);
    fixture.componentRef.setInput('loading', false);
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

  for (const theme of [...COMPILED_THEME_BASES, null] as const) {
    const label = theme ?? 'no data-app-theme (first paint)';

    it(`meets ${WCAG_AA_NORMAL_TEXT}:1 on viewer-footer — ${label}`, () => {
      if (theme === null) {
        document.documentElement.removeAttribute('data-app-theme');
      } else {
        document.documentElement.setAttribute('data-app-theme', theme);
      }
      fixture.detectChanges();

      if (theme !== null) {
        const onSurfaceVariant = getComputedStyle(document.documentElement)
          .getPropertyValue('--mat-sys-on-surface-variant')
          .trim();
        expect(onSurfaceVariant)
          .withContext(`theme ${theme} should define --mat-sys-on-surface-variant`)
          .not.toBe('');
      }

      const fileSize = fixture.nativeElement.querySelector('.file-size') as HTMLElement | null;
      const footer = fixture.nativeElement.querySelector('.viewer-footer') as HTMLElement | null;
      expect(fileSize).withContext('expected .file-size').not.toBeNull();
      expect(footer).withContext('expected .viewer-footer').not.toBeNull();
      if (!fileSize || !footer) return;

      const footerBg = getComputedStyle(footer).backgroundColor;
      expect(footerBg)
        .withContext(`viewer-footer background in ${label}`)
        .not.toBe('rgba(0, 0, 0, 0)');

      const fg = parseRgb(getComputedStyle(fileSize).color);
      expect(fg)
        .withContext(`file-size colour ${getComputedStyle(fileSize).color}`)
        .not.toBeNull();
      if (!fg) return;

      const bg = opaqueBackground(footer);
      const ratio = contrastRatio(fg, bg);
      expect(ratio)
        .withContext(
          `file-size on viewer-footer in ${label}: ${getComputedStyle(fileSize).color} vs ${footerBg}`,
        )
        .toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    });
  }
});
