/**
 * NXENG-830 / IBM 1230336254 — the document-detail properties panel close control must show a
 * keyboard focus indicator (WCAG 2.1 SC 2.4.7). Karma loads theme tokens; the host pulls in the
 * real feature SCSS. Standalone `.panel-close-btn:focus` selector shape and production template
 * wiring are owned by `document-detail-panel-close-focus-ring.spec.ts` (feature Vitest); this
 * suite owns compiled contrast, inset geometry, and IBM `:focus`-only focus-visible behaviour.
 */
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';

import { testTranslateModule } from '../i18n/translate-testing';
import { COMPILED_THEME_BASES } from '../theme/app-theme';

/** Resolved from `document-detail.document-detail.close-panel` via testTranslateModule. */
const FIXTURE_CLOSE_PANEL_ARIA_LABEL = 'Close panel';

const WCAG_1411_MIN_RATIO = 3;

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

function panelHeaderBackground(host: HTMLElement): string {
  const header = host.querySelector('.properties-panel .panel-header');
  expect(header)
    .withContext('fixture must render the properties panel header from document-detail.scss')
    .toBeTruthy();
  const bg = getComputedStyle(header as Element).backgroundColor;
  if (bg.match(/rgba\(0, 0, 0, 0\)|transparent/)) {
    const panel = host.querySelector('.properties-panel') as HTMLElement;
    return getComputedStyle(panel).backgroundColor;
  }
  return bg;
}

@Component({
  standalone: true,
  imports: [MatButtonModule, MatIconModule, TranslateModule],
  styleUrls: [
    '../../../../../libs/features/document-detail/src/lib/document-detail/document-detail.scss',
  ],
  templateUrl: './panel-close-focus-ring.spec.html',
})
class PanelCloseFocusHostComponent {}

describe('Document detail panel close — keyboard focus indicator (NXENG-830)', () => {
  let originalTheme: string | null;

  beforeEach(async () => {
    originalTheme = document.documentElement.getAttribute('data-app-theme');

    await TestBed.configureTestingModule({
      imports: [PanelCloseFocusHostComponent, testTranslateModule()],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();
  });

  afterEach(() => {
    if (originalTheme === null) {
      document.documentElement.removeAttribute('data-app-theme');
    } else {
      document.documentElement.setAttribute('data-app-theme', originalTheme);
    }
  });

  async function mount(): Promise<{
    fixture: ComponentFixture<PanelCloseFocusHostComponent>;
    button: HTMLButtonElement;
  }> {
    const fixture = TestBed.createComponent(PanelCloseFocusHostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    await fixture.whenStable();
    const button = fixture.nativeElement.querySelector(
      `button[aria-label="${FIXTURE_CLOSE_PANEL_ARIA_LABEL}"]`,
    ) as HTMLButtonElement;
    expect(button)
      .withContext(
        'fixture must expose the properties panel close control by accessible name (production template wiring and panel-close-btn class are asserted in document-detail-panel-close-focus-ring.spec.ts)',
      )
      .toBeTruthy();
    return { fixture, button };
  }

  function applyTheme(theme: (typeof COMPILED_THEME_BASES)[number] | null): void {
    if (theme === null) {
      document.documentElement.removeAttribute('data-app-theme');
    } else {
      document.documentElement.setAttribute('data-app-theme', theme);
    }
  }

  it('draws a 2px inset outline on :focus (IBM style_focus_visible reads :focus only)', async () => {
    const { fixture, button } = await mount();
    try {
      button.focus();
      expect(document.activeElement).toBe(button);

      const style = getComputedStyle(button);
      expect(style.outlineStyle).toBe('solid');
      expect(style.outlineWidth).toBe('2px');
      expect(Number.parseFloat(style.outlineOffset)).toBeLessThanOrEqual(-2);
    } finally {
      button.blur();
      fixture.nativeElement.remove();
    }
  });

  for (const theme of [...COMPILED_THEME_BASES, null] as const) {
    const label = theme ?? 'no data-app-theme (first paint)';

    it(`meets ${WCAG_1411_MIN_RATIO}:1 against the properties panel background — ${label}`, async () => {
      applyTheme(theme);
      const { fixture, button } = await mount();
      try {
        button.focus();
        const style = getComputedStyle(button);

        expect(style.outlineStyle).not.toBe('none');
        expect(parseFloat(style.outlineWidth)).toBeGreaterThan(0);

        const backdrop = panelHeaderBackground(fixture.nativeElement as HTMLElement);

        expect(contrastRatio(rgb(style.outlineColor), rgb(backdrop))).toBeGreaterThanOrEqual(
          WCAG_1411_MIN_RATIO,
        );
      } finally {
        button.blur();
        fixture.nativeElement.remove();
      }
    });
  }
});
