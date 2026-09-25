/**
 * NXENG-790 — IBM Equal Access issue 300762098 (`text_contrast_sufficient`, WCAG 1.4.3 AA)
 * on `.file-size` in the document viewer footer (11px secondary label on a white footer).
 */
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it, afterEach, beforeEach } from 'vitest';

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
  template: `<footer class="viewer-footer"><span class="file-size">8 KB</span></footer>`,
})
class DocumentViewerFileSizeContrastHostComponent {}

describe('document viewer file size label — text contrast (NXENG-790)', () => {
  const MIN_TEXT_RATIO = 4.5;
  let fixture: ComponentFixture<DocumentViewerFileSizeContrastHostComponent>;
  let originalTheme: string | null;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentViewerFileSizeContrastHostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    originalTheme = document.documentElement.getAttribute('data-app-theme');
    fixture = TestBed.createComponent(DocumentViewerFileSizeContrastHostComponent);
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

  it(`meets ${MIN_TEXT_RATIO}:1 on the fixed white footer in light and dark themes`, () => {
    for (const theme of ['dark', null] as const) {
      if (theme === null) {
        document.documentElement.removeAttribute('data-app-theme');
      } else {
        document.documentElement.setAttribute('data-app-theme', theme);
      }
      fixture.detectChanges();

      const footer = fixture.nativeElement.querySelector('.viewer-footer') as HTMLElement;
      const label = fixture.nativeElement.querySelector('.file-size') as HTMLElement;
      const labelStyle = getComputedStyle(label);
      const backdrop = opaqueBackdrop(footer);
      const painted = compositeOver(parseColor(labelStyle.color), backdrop);
      const ratio = contrastRatio(painted, backdrop);

      expect(ratio)
        .withContext(
          `file-size ${labelStyle.color} on footer backdrop rgb(${backdrop.join(',')}) (${theme ?? 'default'})`,
        )
        .toBeGreaterThanOrEqual(MIN_TEXT_RATIO);
    }
  });
});
