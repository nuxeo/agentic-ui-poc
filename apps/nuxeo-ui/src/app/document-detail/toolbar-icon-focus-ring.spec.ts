/**
 * NXENG-808 / IBM 673904446 — document-detail header toolbar `mat-icon-button` keyboard focus
 * indicator (WCAG 2.1 SC 2.4.7 / 1.4.11). Material icon buttons suppress the default ring and
 * there is no global `:focus-visible` fallback in `styles.scss`.
 *
 * Same IBM `style_focus_visible` constraints as NXENG-789 / NXENG-773: standalone `:focus`
 * selector on the focused control. Contrast is measured against the rendered `.detail-header`
 * background from production SCSS, not a duplicated colour.
 */
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { COMPILED_THEME_BASES } from '../theme/app-theme';

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

/** Background painted by `.detail-header` in document-detail.scss. */
function productionDetailHeaderBackground(host: HTMLElement): string {
  const header = host.querySelector('.detail-header');
  expect(header)
    .withContext('fixture must render the detail header styled by document-detail.scss')
    .toBeTruthy();
  const bg = getComputedStyle(header as Element).backgroundColor;
  expect(bg)
    .withContext('detail header must declare a non-transparent background')
    .not.toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
  return bg;
}

@Component({
  standalone: true,
  imports: [MatButtonModule, MatIconModule],
  styleUrls: [
    '../../../../../libs/features/document-detail/src/lib/document-detail/document-detail.scss',
    './document-detail-header-toolbar-focus.scss',
    './toolbar-icon-focus-ring.fixture.scss',
  ],
  templateUrl: './toolbar-icon-focus-ring.spec.html',
})
class ToolbarIconFocusHostComponent {}

describe('Document detail toolbar icon button — keyboard focus indicator (NXENG-808)', () => {
  let originalTheme: string | null;

  beforeEach(async () => {
    originalTheme = document.documentElement.getAttribute('data-app-theme');

    await TestBed.configureTestingModule({
      imports: [ToolbarIconFocusHostComponent],
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
    fixture: ComponentFixture<ToolbarIconFocusHostComponent>;
    button: HTMLButtonElement;
    header: HTMLElement;
  }> {
    const fixture = TestBed.createComponent(ToolbarIconFocusHostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    await fixture.whenStable();
    const button = fixture.nativeElement.querySelector(
      '[data-testid="toolbar-icon-btn"]',
    ) as HTMLButtonElement;
    const header = fixture.nativeElement.querySelector('.detail-header') as HTMLElement;
    return { fixture, button, header };
  }

  function applyTheme(theme: (typeof COMPILED_THEME_BASES)[number] | null): void {
    if (theme === null) {
      document.documentElement.removeAttribute('data-app-theme');
    } else {
      document.documentElement.setAttribute('data-app-theme', theme);
    }
  }

  it('draws no outline while unfocused', async () => {
    const { fixture, button } = await mount();
    try {
      expect(getComputedStyle(button).outlineStyle).toBe('none');
    } finally {
      button.blur();
      fixture.nativeElement.remove();
    }
  });

  it('draws a 2px solid outline on the button once focused', async () => {
    const { fixture, button } = await mount();
    try {
      button.focus();
      expect(document.activeElement).toBe(button);

      const style = getComputedStyle(button);
      expect(style.outlineStyle).toBe('solid');
      expect(style.outlineWidth).toBe('2px');
      expect(style.outlineOffset).toBe('2px');
    } finally {
      button.blur();
      fixture.nativeElement.remove();
    }
  });

  for (const theme of [...COMPILED_THEME_BASES, null] as const) {
    const label = theme ?? 'no data-app-theme (first paint)';

    it(`meets ${WCAG_1411_MIN_RATIO}:1 against the production detail-header background — ${label}`, async () => {
      applyTheme(theme);
      const { fixture, button } = await mount();
      try {
        button.focus();
        const style = getComputedStyle(button);

        expect(style.outlineStyle).not.toBe('none');
        expect(parseFloat(style.outlineWidth)).toBeGreaterThan(0);
        expect(parseFloat(style.outlineOffset)).toBeGreaterThan(0);

        const headerBg = productionDetailHeaderBackground(fixture.nativeElement as HTMLElement);

        expect(contrastRatio(rgb(style.outlineColor), rgb(headerBg))).toBeGreaterThanOrEqual(
          WCAG_1411_MIN_RATIO,
        );
      } finally {
        button.blur();
        fixture.nativeElement.remove();
      }
    });
  }

  it('declares a standalone :focus rule that IBM style_focus_visible can read', async () => {
    const { fixture, button } = await mount();
    try {
      const focusSelectors: string[] = [];
      for (const sheet of Array.from(document.styleSheets)) {
        let sheetRules: CSSRuleList;
        try {
          sheetRules = sheet.cssRules;
        } catch {
          continue;
        }
        for (const rule of Array.from(sheetRules)) {
          const selector = (rule as CSSStyleRule).selectorText;
          if (
            selector?.includes('.header-actions') &&
            selector.includes('mat-mdc-icon-button') &&
            selector.includes(':focus')
          ) {
            focusSelectors.push(selector);
          }
        }
      }

      const canonical = focusSelectors.map((selector) =>
        selector.replace(/\[_ngcontent-[^\]]+\]/g, '').trim(),
      );
      expect(focusSelectors.length).toBeGreaterThan(0);
      expect(canonical).toContain(
        '.detail-header .header-actions button.mat-mdc-icon-button:focus',
      );
      expect(
        canonical.some((s) =>
          s.includes('.detail-header .header-actions button.mat-mdc-icon-button:focus,'),
        ),
      ).toBe(false);
    } finally {
      button.blur();
      fixture.nativeElement.remove();
    }
  });

  it('resolves its colour through --agentic-document-detail-header-focus-outline', async () => {
    const { fixture, button, header } = await mount();
    try {
      button.focus();
      const SENTINEL = 'rgb(1, 2, 3)';
      header.style.setProperty('--agentic-document-detail-header-focus-outline', SENTINEL);
      expect(getComputedStyle(button).outlineColor).toBe(SENTINEL);
    } finally {
      button.blur();
      fixture.nativeElement.remove();
    }
  });
});
