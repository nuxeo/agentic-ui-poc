import { provideZonelessChangeDetection } from '@angular/core';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it, afterEach } from 'vitest';

import { DocumentViewerComponent } from './document-viewer.component';

const WCAG_AA_NORMAL_TEXT = 4.5;

function relativeLuminance([r, g, b]: readonly number[]): number {
  const channel = (v: number): number => {
    const s = v / 255;

    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(a: readonly number[], b: readonly number[]): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);

  return (hi + 0.05) / (lo + 0.05);
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

function opaqueBackdrop(element: HTMLElement): number[] {
  for (let node: HTMLElement | null = element; node; node = node.parentElement) {
    const { rgb, alpha } = parseColor(getComputedStyle(node).backgroundColor);

    if (alpha === 1) {
      return rgb;
    }
  }

  return [255, 255, 255];
}

describe('document viewer format-type contrast (NXENG-801)', () => {
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

  it(`meets ${WCAG_AA_NORMAL_TEXT}:1 on the fixed white picture-cards strip`, () => {
    for (const theme of ['dark', null] as const) {
      if (theme === null) {
        document.documentElement.removeAttribute('data-app-theme');
      } else {
        document.documentElement.setAttribute('data-app-theme', theme);
      }

      fixture.detectChanges();

      const strip = fixture.nativeElement.querySelector('.picture-cards') as HTMLElement;

      const label = fixture.nativeElement.querySelector('.format-type') as HTMLElement;

      expect(strip).not.toBeNull();

      expect(label).not.toBeNull();

      if (!strip || !label) return;

      const labelStyle = getComputedStyle(label);

      const backdrop = opaqueBackdrop(strip);

      const painted = compositeOver(parseColor(labelStyle.color), backdrop);

      const ratio = contrastRatio(painted, backdrop);

      expect(ratio)
        .withContext(
          `format-type ${labelStyle.color} on picture-cards backdrop rgb(${backdrop.join(',')}) (${theme ?? 'default'})`,
        )

        .toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    }
  });
});
