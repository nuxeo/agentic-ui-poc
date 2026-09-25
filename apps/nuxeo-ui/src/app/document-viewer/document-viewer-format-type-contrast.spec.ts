/**
 * NXENG-760 — `.format-type` in the picture viewer strip must meet WCAG 2.1 SC 1.4.3 (4.5:1)
 * against the `.picture-cards` surface in every packaged theme, not only the SCSS fallback.
 */
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { COMPILED_THEME_BASES } from '../theme/app-theme';

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

@Component({
  standalone: true,
  styleUrls: [
    '../../../../../libs/shared/ui/src/lib/document-viewer/document-viewer.component.scss',
  ],
  templateUrl: './document-viewer-format-type-contrast.host.html',
})
class DocumentViewerFormatTypeContrastHostComponent {}

const SHIPPED_THEMES: readonly (string | null)[] = [null, ...COMPILED_THEME_BASES];

describe('document viewer format-type contrast (NXENG-760)', () => {
  const MIN_TEXT_RATIO = 4.5;

  let fixture: ComponentFixture<DocumentViewerFormatTypeContrastHostComponent>;
  let originalTheme: string | null;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentViewerFormatTypeContrastHostComponent],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    originalTheme = document.documentElement.getAttribute('data-app-theme');
    fixture = TestBed.createComponent(DocumentViewerFormatTypeContrastHostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.nativeElement.remove();
    if (originalTheme === null) {
      document.documentElement.removeAttribute('data-app-theme');
    } else {
      document.documentElement.setAttribute('data-app-theme', originalTheme);
    }
  });

  for (const theme of SHIPPED_THEMES) {
    const label = theme ?? 'no data-app-theme (first paint)';

    it(`meets ${MIN_TEXT_RATIO}:1 in the ${label} theme`, () => {
      if (theme === null) {
        document.documentElement.removeAttribute('data-app-theme');
      } else {
        document.documentElement.setAttribute('data-app-theme', theme);
      }
      fixture.detectChanges();

      const strip = fixture.nativeElement.querySelector('.picture-cards') as HTMLElement;
      const labelEl = fixture.nativeElement.querySelector('.format-type') as HTMLElement;
      const stripStyle = getComputedStyle(strip);
      const labelStyle = getComputedStyle(labelEl);

      expect(parseColor(stripStyle.backgroundColor).alpha)
        .withContext(`${label} picture-cards background must be opaque`)
        .toBe(1);

      const bg = parseColor(stripStyle.backgroundColor).rgb;
      const fg = parseColor(labelStyle.color).rgb;
      const ratio = contrastRatio(fg, bg);

      expect(ratio)
        .withContext(
          `format-type ${labelStyle.color} on picture-cards ${stripStyle.backgroundColor} (${label})`,
        )
        .toBeGreaterThanOrEqual(MIN_TEXT_RATIO);
    });
  }
});
