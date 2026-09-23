/**
 * NXENG-872 — the header Settings menu button must show a keyboard focus indicator.
 *
 * Material `mat-icon-button` suppresses the browser default ring and
 * `apps/nuxeo-ui/src/styles.scss` has no global `:focus-visible` fallback, so focusing the
 * control changed none of its pixels — WCAG 2.1 SC 2.4.7 / IBM `style_focus_visible` Issue
 * 2347835927 on `aria-label="Settings menu"`.
 *
 * Same constraints as NXENG-775 (`header-search-focus-ring.spec.ts`):
 *  - the ring belongs on the focused button, not a wrapper;
 *  - `.header-settings-menu-button:focus` must stay a standalone selector (IBM reads `:focus`
 *    only and does not resolve comma lists);
 *  - the ring colour tracks `--mat-sys-primary` so it contrasts with the header surface.
 */
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';

import { testTranslateModule } from '../i18n/translate-testing';

/** WCAG 2.1 relative luminance. */
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

@Component({
  standalone: true,
  imports: [MatButtonModule, MatIconModule, TranslateModule],
  styleUrls: ['./app-shell.component.scss'],
  templateUrl: './header-settings-focus-ring.spec.html',
})
class HeaderSettingsHostComponent {}

describe('header Settings menu — keyboard focus indicator (NXENG-872)', () => {
  let fixture: ComponentFixture<HeaderSettingsHostComponent>;
  let button: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderSettingsHostComponent, testTranslateModule()],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderSettingsHostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    await fixture.whenStable();

    button = fixture.nativeElement.querySelector(
      '.header-settings-menu-button',
    ) as HTMLButtonElement;
  });

  function surfaceBehindTheRing(): string {
    let node: HTMLElement | null = button.parentElement;
    while (node) {
      const bg = getComputedStyle(node).backgroundColor;
      if (bg && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) return bg;
      node = node.parentElement;
    }
    return 'rgb(255, 255, 255)';
  }

  afterEach(() => {
    button?.blur();
    fixture.nativeElement.remove();
  });

  it('draws no outline while unfocused', () => {
    expect(getComputedStyle(button).outlineStyle).toBe('none');
  });

  it('draws a 2px solid outline on the button once focused', () => {
    button.focus();
    expect(document.activeElement).toBe(button);

    const style = getComputedStyle(button);
    expect(style.outlineStyle).toBe('solid');
    expect(style.outlineWidth).toBe('2px');
    expect(style.outlineOffset).toBe('2px');
  });

  it('meets the 3:1 non-text contrast of SC 1.4.11 against the surface the ring touches', () => {
    button.focus();
    const style = getComputedStyle(button);

    expect(style.outlineStyle).not.toBe('none');
    expect(parseFloat(style.outlineWidth)).toBeGreaterThan(0);
    expect(parseFloat(style.outlineOffset)).toBeGreaterThan(0);

    expect(
      contrastRatio(rgb(style.outlineColor), rgb(surfaceBehindTheRing())),
    ).toBeGreaterThanOrEqual(3);
  });

  it('declares at least one standalone :focus rule that IBM can read', () => {
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
        if (selector?.includes('.header-settings-menu-button') && selector.includes(':focus')) {
          focusSelectors.push(selector);
        }
      }
    }

    const canonical = focusSelectors.map((selector) =>
      selector.replace(/\[_ngcontent-[^\]]+\]/g, '').trim(),
    );
    expect(focusSelectors.length).toBeGreaterThan(0);
    expect(canonical).toContain('.header-settings-menu-button.mat-mdc-icon-button:focus');
  });
});
