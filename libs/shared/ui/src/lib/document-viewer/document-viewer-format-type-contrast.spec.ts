/**
 * NXENG-768 — `.format-type` in the picture viewer strip used `#999` at 11px/400, ~2.85:1 on
 * the white `.picture-cards` background (IBM `text_contrast_sufficient`, Issue 56037090).
 *
 * Pins the token-based colour against the painted card background. Packaged theme combinations
 * were checked in the Playwright evidence run; this fixture asserts the invariant in jsdom.
 */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { testTranslateModule } from '@agentic-ui/testing/i18n';

import { DocumentViewerComponent, type PictureView } from './document-viewer.component';

const MIN_AA_TEXT = 4.5;

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const channel = (v: number): number => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(a: [number, number, number], b: [number, number, number]): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function rgb(css: string): [number, number, number] {
  const parts = (css.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

function backgroundBehind(el: HTMLElement): string {
  let node: HTMLElement | null = el;
  while (node) {
    const bg = getComputedStyle(node).backgroundColor;
    if (bg && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) return bg;
    node = node.parentElement;
  }
  return 'rgb(255, 255, 255)';
}

describe('document viewer — format-type text contrast (NXENG-768)', () => {
  let fixture: ComponentFixture<DocumentViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentViewerComponent, testTranslateModule()],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();

    document.documentElement.style.setProperty('--mat-sys-on-surface-variant', '#5c5f6b');

    fixture = TestBed.createComponent(DocumentViewerComponent);
    document.body.appendChild(fixture.nativeElement);
  });

  afterEach(() => {
    document.documentElement.style.removeProperty('--mat-sys-on-surface-variant');
    fixture.nativeElement.remove();
    fixture.destroy();
  });

  it('meets WCAG AA (4.5:1) for the format-type label on the picture cards strip', () => {
    const views: PictureView[] = [
      {
        title: 'FullHD',
        width: 1920,
        height: 1080,
        fileSize: '120 KB',
        format: 'JPEG',
        downloadUrl: 'blob:mock',
      },
    ];

    fixture.componentRef.setInput('mimeType', 'image/jpeg');
    fixture.componentRef.setInput('blobUrl', 'blob:mock-image');
    fixture.componentRef.setInput('rawBlobUrl', 'blob:mock-image');
    fixture.componentRef.setInput('pictureInfo', {
      width: 800,
      height: 600,
      format: 'JPEG',
      weight: '45 KB',
    });
    fixture.componentRef.setInput('pictureViews', views);
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('.format-type') as HTMLElement | null;
    expect(label).toBeTruthy();
    expect(label!.textContent?.trim()).toBe('JPEG');

    const fg = rgb(getComputedStyle(label!).color);
    const bg = rgb(backgroundBehind(label!));
    const ratio = contrastRatio(fg, bg);

    expect(ratio).toBeGreaterThanOrEqual(MIN_AA_TEXT);
  });
});
