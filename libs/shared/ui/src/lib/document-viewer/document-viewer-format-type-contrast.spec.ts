/**
 * NXENG-930 — `.format-type` in the Preview tab Additional formats strip must meet WCAG 2.1
 * SC 1.4.3 (IBM `text_contrast_sufficient`). Playwright evidence measures the live ratio on
 * every compiled palette in `apps/nuxeo-ui`; this Vitest spec pins the stylesheet pairing and
 * a default-render contrast check without importing the app shell.
 */
import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

import { DocumentViewerComponent } from './document-viewer.component';

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

describe('DocumentViewerComponent — format-type text contrast (NXENG-930)', () => {
  let fixture: ComponentFixture<DocumentViewerComponent>;

  beforeEach(async () => {
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

  it('themes picture-cards foregrounds with the surface token pair', () => {
    const scssPath = join(import.meta.dirname, 'document-viewer.component.scss');
    const scss = readFileSync(scssPath, 'utf8');
    const cards = scssBlock(scss, 'picture-cards');
    const label = scssBlock(scss, 'format-type');
    const title = scssBlock(scss, 'picture-card-title');
    const infoValue = scssBlock(scss, 'info-value');
    expect(cards).toMatch(/var\(--mat-sys-surface/);
    expect(label).toMatch(/var\(--mat-sys-on-surface-variant/);
    expect(title).toMatch(/var\(--mat-sys-on-surface/);
    expect(infoValue).toMatch(/var\(--mat-sys-on-surface/);
    expect(label).not.toMatch(/#999/i);
  });

  it(`meets ${WCAG_AA_NORMAL_TEXT}:1 on the default surface fallback`, () => {
    const formatLabel = fixture.nativeElement.querySelector('.format-type') as HTMLElement | null;
    expect(formatLabel).not.toBeNull();
    if (!formatLabel) return;

    const fg = parseRgb(getComputedStyle(formatLabel).color);
    expect(fg).not.toBeNull();
    if (!fg) return;

    const ratio = contrastRatio(fg, [255, 255, 255]);
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
  });
});
