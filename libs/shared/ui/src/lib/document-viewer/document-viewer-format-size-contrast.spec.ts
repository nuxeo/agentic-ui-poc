/**
 * NXENG-806 — `.format-size` in the Additional formats row on the fixed light `.picture-cards`
 * strip must meet WCAG 2.1 SC 1.4.3 (IBM Issue ID 626137632; was hardcoded #999 ~2.85:1).
 * Per-theme Karma coverage: `apps/nuxeo-ui/.../document-viewer-format-type-contrast.spec.ts`.
 */
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { DocumentViewerComponent } from './document-viewer.component';

const WCAG_AA_NORMAL_TEXT = 4.5;

/** Rule blocks whose selector prelude includes `.className` (compound/pseudo included). */
function scssBlocks(source: string, className: string): { prelude: string; body: string }[] {
  const re = new RegExp(`([^{}]*\\.${className}\\b[^{]*)\\{([^}]+)\\}`, 'gs');
  return [...source.matchAll(re)].map((match) => ({
    prelude: match[1].trim(),
    body: match[2],
  }));
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

describe('DocumentViewerComponent — format-size contrast (NXENG-806)', () => {
  let fixture: ComponentFixture<DocumentViewerComponent>;
  let originalTheme: string | null;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentViewerComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    originalTheme = document.documentElement.getAttribute('data-app-theme');
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
      {
        title: 'Medium',
        width: 800,
        height: 600,
        fileSize: '2048 Bytes',
        format: 'JPEG',
        downloadUrl: '/nuxeo/medium',
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

  it('scssBlocks catches compound and pseudo-class .format-size selectors', () => {
    const sample = [
      '.format-size { color: var(--document-viewer-muted-on-light-surface); }',
      '.picture-cards .format-size { color: var(--document-viewer-muted-on-light-surface); }',
      '.format-size.regressed { color: #999; }',
    ].join('\n');
    const blocks = scssBlocks(sample, 'format-size');
    expect(blocks).toHaveLength(3);
  });

  it('pins every .format-size block to the light-strip muted token per NXENG-806', () => {
    const scssPath = join(import.meta.dirname, 'document-viewer.component.scss');
    const scss = readFileSync(scssPath, 'utf8');
    const sizeBlocks = scssBlocks(scss, 'format-size');
    expect(sizeBlocks.length, '.format-size declarations in SCSS').toBeGreaterThan(0);
    for (const { body } of sizeBlocks) {
      expect(body).toMatch(/var\(--document-viewer-muted-on-light-surface\)/);
      expect(body).not.toMatch(/#999/i);
    }
  });

  it(`meets ${WCAG_AA_NORMAL_TEXT}:1 on the picture-cards strip (including dark theme)`, () => {
    for (const theme of ['dark', null] as const) {
      if (theme === null) {
        document.documentElement.removeAttribute('data-app-theme');
      } else {
        document.documentElement.setAttribute('data-app-theme', theme);
      }
      fixture.detectChanges();

      const strip = fixture.nativeElement.querySelector('.picture-cards') as HTMLElement;
      const sizeLabels = fixture.nativeElement.querySelectorAll('.format-size');
      expect(strip).not.toBeNull();
      expect(sizeLabels.length, '.format-size nodes in picture-cards').toBeGreaterThan(0);
      if (!strip) return;

      const bg = opaqueBackground(strip);
      for (const sizeLabel of sizeLabels) {
        const fg = parseRgb(getComputedStyle(sizeLabel as HTMLElement).color);
        expect(fg).not.toBeNull();
        if (!fg) return;

        const ratio = contrastRatio(fg, bg);
        expect(
          ratio,
          `format-size on picture-cards (${theme ?? 'default'}, node ${sizeLabel.textContent?.trim() ?? ''})`,
        ).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
      }
    }
  });
});
