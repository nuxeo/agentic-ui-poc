import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { DocumentViewerComponent } from './document-viewer.component';

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

describe('DocumentViewerComponent format-type contrast (NXENG-930)', () => {
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

  it('styles .format-type with a theme token that meets WCAG AA on white', () => {
    const scssPath = join(import.meta.dirname, 'document-viewer.component.scss');
    const scss = readFileSync(scssPath, 'utf8');
    const block = scss.match(/\.format-type\s*\{[^}]+\}/s)?.[0] ?? '';
    expect(block).toContain('--mat-sys-on-surface-variant');
    expect(block).not.toMatch(/color:\s*#999\b/);

    const label = fixture.nativeElement.querySelector('.format-type') as HTMLElement | null;
    expect(label).not.toBeNull();
    if (!label) return;
    expect(label.textContent?.trim()).toBe('JPEG');

    const fg = parseRgb(getComputedStyle(label).color);
    expect(fg).not.toBeNull();
    if (!fg) return;
    const ratio = contrastRatio(fg, [255, 255, 255]);
    expect(ratio).toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
  });
});
