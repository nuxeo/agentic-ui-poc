/**
 * NXENG-901 / NXENG-856 — `.format-type` on themed `.picture-cards` must consume
 * `--mat-sys-on-surface-variant` and meet WCAG 2.1 SC 1.4.3 under every compiled palette.
 * Karma loads `apps/nuxeo-ui/src/styles.scss`, so `data-app-theme` resolves real token pairs.
 */
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
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

function parseColor(value: string): { rgb: number[]; alpha: number } {
  const match = /rgba?\(([^)]+)\)/.exec(value);
  if (!match) {
    throw new Error(`not a computed colour: "${value}"`);
  }
  const parts = match[1]
    .split(/[,\s/]+/)
    .filter(Boolean)
    .map(Number);
  return { rgb: parts.slice(0, 3), alpha: parts.length > 3 ? parts[3] : 1 };
}

function compositeOver(
  fg: { rgb: number[]; alpha: number },
  backdrop: readonly number[],
): number[] {
  return fg.rgb.map((c, i) => Math.round(c * fg.alpha + backdrop[i] * (1 - fg.alpha)));
}

function assertContrast(element: HTMLElement, cards: HTMLElement, label: string): void {
  const fgParsed = parseColor(getComputedStyle(element).color);
  const bg = opaqueBackground(cards);
  const painted = compositeOver(fgParsed, bg);
  const ratio = contrastRatio(painted, bg);
  expect(ratio)
    .withContext(
      `${label} ${getComputedStyle(element).color} on picture-cards ${getComputedStyle(cards).backgroundColor}`,
    )
    .toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
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

describe('DocumentViewer format-type contrast by theme (NXENG-901)', () => {
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
    fixture.componentRef.setInput('mimeType', 'image/jpeg');
    fixture.componentRef.setInput('blobUrl', 'blob:mock-image');
    fixture.componentRef.setInput('rawBlobUrl', 'blob:mock-image');
    fixture.componentRef.setInput('pictureInfo', {
      width: 1920,
      height: 1080,
      format: 'JPEG',
      colorSpace: 'sRGB',
      depth: 8,
      weight: '8 KB',
    });
    fixture.componentRef.setInput('pictureViews', [
      {
        title: 'FullHD',
        width: 1920,
        height: 1080,
        fileSize: '8792 Bytes',
        format: 'JPEG',
        downloadUrl: '/nuxeo/fullhd',
      },
    ]);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.nativeElement.remove();
    (fixture.nativeElement as HTMLElement).style.removeProperty('--mat-sys-on-surface-variant');
    if (originalTheme === null) {
      document.documentElement.removeAttribute('data-app-theme');
    } else {
      document.documentElement.setAttribute('data-app-theme', originalTheme);
    }
  });

  it('wires format-type colour through --mat-sys-on-surface-variant on the viewer host', () => {
    const formatLabel = fixture.nativeElement.querySelector('.format-type') as HTMLElement | null;
    expect(formatLabel).withContext('expected .format-type').not.toBeNull();
    if (!formatLabel) return;

    const host = fixture.nativeElement as HTMLElement;
    const sentinel = 'rgb(1, 2, 3)';
    host.style.setProperty('--mat-sys-on-surface-variant', sentinel);
    fixture.detectChanges();

    expect(getComputedStyle(formatLabel).color).toBe(sentinel);
  });

  for (const theme of [...COMPILED_THEME_BASES, null] as const) {
    const label = theme ?? 'no data-app-theme (first paint)';

    it(`meets ${WCAG_AA_NORMAL_TEXT}:1 on picture-cards — ${label}`, () => {
      if (theme === null) {
        document.documentElement.removeAttribute('data-app-theme');
      } else {
        document.documentElement.setAttribute('data-app-theme', theme);
      }
      fixture.detectChanges();

      const formatLabel = fixture.nativeElement.querySelector('.format-type') as HTMLElement | null;
      const cards = fixture.nativeElement.querySelector('.picture-cards') as HTMLElement | null;
      const cardTitle = fixture.nativeElement.querySelector(
        '.picture-card-title',
      ) as HTMLElement | null;
      const infoValue = fixture.nativeElement.querySelector('.info-value') as HTMLElement | null;

      expect(formatLabel).withContext(`${label}: expected .format-type`).not.toBeNull();
      expect(cards).withContext(`${label}: expected .picture-cards`).not.toBeNull();
      expect(cardTitle).withContext(`${label}: expected .picture-card-title`).not.toBeNull();
      expect(infoValue).withContext(`${label}: expected .info-value`).not.toBeNull();

      assertContrast(formatLabel!, cards!, 'format-type');
      assertContrast(cardTitle!, cards!, 'picture-card-title');
      assertContrast(infoValue!, cards!, 'info-value');
    });
  }
});
