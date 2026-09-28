/**
 * NXENG-858 — `.prop-label` on `.properties-panel` under every compiled palette.
 */
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { COMPILED_THEME_BASES } from '../theme/app-theme';

const WCAG_AA_NORMAL_TEXT = 4.5;

@Component({
  standalone: true,
  templateUrl: './document-detail-prop-label-contrast.host.html',
  styleUrls: [
    '../../../../../libs/features/document-detail/src/lib/document-detail/document-detail.scss',
  ],
  host: {
    style: `
      --document-detail-properties-panel-surface: #ffffff;
      --document-detail-properties-label-muted: #5c5f6b;
    `,
  },
})
class PropLabelContrastHostComponent {}

function parseColor(value: string): { rgb: number[]; alpha: number } {
  const parts = value
    .replace(/rgba?\(|\)|\s/g, '')
    .split(',')
    .map((p) => Number(p));
  return { rgb: parts.slice(0, 3), alpha: parts.length > 3 ? parts[3] : 1 };
}

function compositeOver(
  fg: { rgb: number[]; alpha: number },
  backdrop: readonly number[],
): number[] {
  return fg.rgb.map((c, i) => Math.round(c * fg.alpha + backdrop[i] * (1 - fg.alpha)));
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

function opaqueBackground(element: HTMLElement): number[] {
  for (let node: HTMLElement | null = element; node; node = node.parentElement) {
    const { rgb, alpha } = parseColor(getComputedStyle(node).backgroundColor);
    if (alpha === 1) {
      return rgb;
    }
  }
  return [255, 255, 255];
}

describe('Document detail prop-label contrast by theme (NXENG-858)', () => {
  let originalTheme: string | null;

  beforeEach(async () => {
    originalTheme = document.documentElement.getAttribute('data-app-theme');

    await TestBed.configureTestingModule({
      imports: [PropLabelContrastHostComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();
  });

  afterEach(() => {
    if (originalTheme === null) {
      document.documentElement.removeAttribute('data-app-theme');
    } else {
      document.documentElement.setAttribute('data-app-theme', originalTheme);
    }
  });

  for (const theme of [...COMPILED_THEME_BASES, null] as const) {
    const label = theme ?? 'no data-app-theme (first paint)';

    it(`meets ${WCAG_AA_NORMAL_TEXT}:1 on properties-panel — ${label}`, () => {
      if (theme === null) {
        document.documentElement.removeAttribute('data-app-theme');
      } else {
        document.documentElement.setAttribute('data-app-theme', theme);
      }

      const fixture = TestBed.createComponent(PropLabelContrastHostComponent);
      document.body.appendChild(fixture.nativeElement);
      fixture.detectChanges();

      try {
        const panel = fixture.nativeElement.querySelector('.properties-panel') as HTMLElement | null;
        const propLabel = fixture.nativeElement.querySelector('.prop-label') as HTMLElement | null;
        expect(panel).withContext('expected .properties-panel').not.toBeNull();
        expect(propLabel).withContext('expected .prop-label').not.toBeNull();
        if (!panel || !propLabel) return;

        const panelBg = getComputedStyle(panel).backgroundColor;
        expect(panelBg)
          .withContext(`properties-panel background in ${label}`)
          .not.toBe('rgba(0, 0, 0, 0)');

        const backdrop = opaqueBackground(panel);
        const painted = compositeOver(parseColor(getComputedStyle(propLabel).color), backdrop);
        const ratio = contrastRatio(painted, backdrop);
        expect(ratio)
          .withContext(
            `prop-label on properties-panel in ${label}: ${getComputedStyle(propLabel).color} vs ${panelBg}`,
          )
          .toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);

        if (theme === 'dark') {
          expect(panelBg)
            .withContext('properties panel stays a fixed light surface in dark theme')
            .toBe('rgb(255, 255, 255)');
          expect(getComputedStyle(propLabel).color)
            .withContext('label must not inherit light-theme variant on the light strip')
            .toBe('rgb(92, 95, 107)');
        }
      } finally {
        fixture.nativeElement.remove();
      }
    });
  }
});
