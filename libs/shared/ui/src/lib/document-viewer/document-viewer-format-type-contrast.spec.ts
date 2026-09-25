/**
 * NXENG-856 — `.format-type` in the Preview tab Additional formats strip must meet WCAG 2.1
 * SC 1.4.3 (IBM `text_contrast_sufficient`, issue 1766416709). The label is 11px / 400 weight;
 * AA requires 4.5:1 against the `.picture-cards` surface. Playwright evidence measures the live
 * ratio; this spec renders the real component against every compiled app theme so a dark-palette
 * `--mat-sys-on-surface-variant` cannot regress on a fixed white strip.
 */
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { DocumentViewerComponent } from './document-viewer.component';

/** Mirrors `COMPILED_THEME_BASES` in `apps/nuxeo-ui/src/app/theme/app-theme.ts`. */
const SHIPPED_THEMES = ['nuxeo', 'dark', 'kawaii', 'light'] as const;

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

describe('DocumentViewerComponent — format-type text contrast (NXENG-856)', () => {
  const scssPath = join(import.meta.dirname, 'document-viewer.component.scss');
  const scss = readFileSync(scssPath, 'utf8');

  let fixture: ComponentFixture<DocumentViewerComponent>;
  let originalTheme: string | null;

  beforeAll(async () => {
    // Load compiled palettes so `data-app-theme` resolves real surface/variant pairs.
    // eslint-disable-next-line @nx/enforce-module-boundaries -- contrast must be measured, not guessed
    await import('../../../../../../apps/nuxeo-ui/src/styles.scss');
  });

  beforeEach(async () => {
    originalTheme = document.documentElement.getAttribute('data-app-theme');

    await TestBed.configureTestingModule({
      imports: [DocumentViewerComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentViewerComponent);
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
    if (originalTheme === null) {
      document.documentElement.removeAttribute('data-app-theme');
    } else {
      document.documentElement.setAttribute('data-app-theme', originalTheme);
    }
  });

  it('themes .picture-cards and .format-type as a matched surface/foreground pair', () => {
    const cards = scssBlock(scss, 'picture-cards');
    const label = scssBlock(scss, 'format-type');
    expect(cards).toMatch(/var\(--mat-sys-surface/);
    expect(label).toMatch(/var\(--mat-sys-on-surface-variant/);
    expect(label).not.toMatch(/#999/i);
  });

  for (const theme of [...SHIPPED_THEMES, null] as const) {
    const label = theme ?? 'no data-app-theme (first paint)';

    it(`meets ${WCAG_AA_NORMAL_TEXT}:1 on the picture-cards surface — ${label}`, () => {
      if (theme === null) {
        document.documentElement.removeAttribute('data-app-theme');
      } else {
        document.documentElement.setAttribute('data-app-theme', theme);
      }
      fixture.detectChanges();

      const formatLabel = fixture.nativeElement.querySelector('.format-type') as HTMLElement | null;
      const cards = fixture.nativeElement.querySelector('.picture-cards') as HTMLElement | null;
      expect(formatLabel, 'expected a rendered .format-type label').not.toBeNull();
      expect(cards, 'expected a rendered .picture-cards strip').not.toBeNull();
      if (!formatLabel || !cards) return;

      const fg = parseRgb(getComputedStyle(formatLabel).color);
      expect(fg, `format-type colour: ${getComputedStyle(formatLabel).color}`).not.toBeNull();
      if (!fg) return;

      const bg = opaqueBackground(cards);
      const ratio = contrastRatio(fg, bg);
      expect(
        ratio,
        `format-type ${getComputedStyle(formatLabel).color} on picture-cards ` +
          `${getComputedStyle(cards).backgroundColor} (opaque ${bg.join(',')})`,
      ).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    });
  }
});
