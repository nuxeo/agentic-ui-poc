import { Component, provideZonelessChangeDetection } from '@angular/core';

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { describe, expect, it, beforeEach, afterEach } from 'vitest';

/**

 * NXENG-901 — `.format-type` used `#999` (2.85:1 on white), below WCAG AA for 11px text.

 */

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

@Component({
  standalone: true,

  styleUrls: ['./document-viewer.component.scss'],

  template: `<div class="picture-cards"><span class="format-type">JPEG</span></div>`,
})
class DocumentViewerFormatTypeA11yHostComponent {}

describe('DocumentViewerComponent a11y styles (NXENG-901)', () => {
  const MIN_TEXT_RATIO = 4.5;

  let fixture: ComponentFixture<DocumentViewerFormatTypeA11yHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentViewerFormatTypeA11yHostComponent],

      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentViewerFormatTypeA11yHostComponent);

    document.body.appendChild(fixture.nativeElement);

    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.nativeElement.remove();
  });

  it(`meets ${MIN_TEXT_RATIO}:1 computed contrast on the white picture-cards strip`, () => {
    const strip = fixture.nativeElement.querySelector('.picture-cards') as HTMLElement;

    const label = fixture.nativeElement.querySelector('.format-type') as HTMLElement;

    const labelStyle = getComputedStyle(label);

    const backdrop = opaqueBackdrop(strip);

    const painted = compositeOver(parseColor(labelStyle.color), backdrop);

    const ratio = contrastRatio(painted, backdrop);

    expect(ratio)
      .withContext(
        `format-type ${labelStyle.color} on picture-cards backdrop rgb(${backdrop.join(',')})`,
      )

      .toBeGreaterThanOrEqual(MIN_TEXT_RATIO);
  });
});
