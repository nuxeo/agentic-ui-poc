/**
 * NXENG-858 — measure `.prop-label` contrast on `.properties-panel` under every compiled palette.
 */
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { COMPILED_THEME_BASES } from '../theme/app-theme';

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

@Component({
  selector: 'lib-document-detail',
  standalone: true,
  template: `
    <aside class="properties-panel">
      <div class="prop-field">
        <span class="prop-label">Title</span>
        <div class="prop-value">Sample document</div>
      </div>
    </aside>
  `,
  styleUrls: [
    '../../../../../libs/features/document-detail/src/lib/document-detail/document-detail.scss',
  ],
})
class PropLabelContrastHost {}

describe('Document detail prop-label contrast by theme (NXENG-858)', () => {
  let fixture: ComponentFixture<PropLabelContrastHost>;
  let originalTheme: string | null;

  beforeEach(async () => {
    originalTheme = document.documentElement.getAttribute('data-app-theme');

    await TestBed.configureTestingModule({
      imports: [PropLabelContrastHost],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(PropLabelContrastHost);
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

  for (const theme of [...COMPILED_THEME_BASES, null] as const) {
    const label = theme ?? 'no data-app-theme (first paint)';

    it(`meets ${WCAG_AA_NORMAL_TEXT}:1 on properties-panel — ${label}`, () => {
      if (theme === null) {
        document.documentElement.removeAttribute('data-app-theme');
      } else {
        document.documentElement.setAttribute('data-app-theme', theme);
      }
      fixture.detectChanges();

      if (theme !== null) {
        const onSurfaceVariant = getComputedStyle(document.documentElement)
          .getPropertyValue('--mat-sys-on-surface-variant')
          .trim();
        expect(onSurfaceVariant)
          .withContext(`theme ${theme} should define --mat-sys-on-surface-variant`)
          .not.toBe('');
      }

      const propLabel = fixture.nativeElement.querySelector('.prop-label') as HTMLElement | null;
      const panel = fixture.nativeElement.querySelector('.properties-panel') as HTMLElement | null;
      expect(propLabel).withContext('expected .prop-label').not.toBeNull();
      expect(panel).withContext('expected .properties-panel').not.toBeNull();
      if (!propLabel || !panel) return;

      const fg = parseRgb(getComputedStyle(propLabel).color);
      const bg = parseRgb(getComputedStyle(panel).backgroundColor);
      expect(fg).withContext(`prop-label foreground in ${label}`).not.toBeNull();
      expect(bg).withContext(`properties-panel background in ${label}`).not.toBeNull();
      if (!fg || !bg) return;

      const ratio = contrastRatio(fg, bg);
      expect(ratio)
        .withContext(`prop-label contrast in ${label}`)
        .toBeGreaterThanOrEqual(WCAG_AA_NORMAL_TEXT);
    });
  }
});
