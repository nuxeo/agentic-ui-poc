/**
 * NXENG-773 / IBM 247628794 — the document-detail details-panel toggle must show a keyboard
 * focus indicator (WCAG 2.1 SC 2.4.7). Material `mat-icon-button` suppresses the default ring
 * and there is no global `:focus-visible` fallback in `styles.scss`.
 *
 * Same IBM `style_focus_visible` constraints as NXENG-872 / NXENG-775: standalone `:focus`
 * selector on the focused control, ring colour from `--mat-sys-primary`.
 */
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';

import { testTranslateModule } from '../i18n/translate-testing';

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
  styleUrls: [
    '../../../../../libs/features/document-detail/src/lib/document-detail/document-detail.scss',
  ],
  templateUrl: './panel-toggle-focus-ring.spec.html',
})
class PanelToggleFocusHostComponent {}

describe('Document detail panel toggle — keyboard focus indicator (NXENG-773)', () => {
  let fixture: ComponentFixture<PanelToggleFocusHostComponent>;
  let button: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PanelToggleFocusHostComponent, testTranslateModule()],
      providers: [provideZonelessChangeDetection(), provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(PanelToggleFocusHostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    await fixture.whenStable();

    button = fixture.nativeElement.querySelector('.panel-toggle-btn') as HTMLButtonElement;
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

  it('meets the 3:1 non-text contrast of SC 1.4.11 against the fixture surface the ring touches', () => {
    button.focus();
    const style = getComputedStyle(button);

    expect(style.outlineStyle).not.toBe('none');
    expect(parseFloat(style.outlineWidth)).toBeGreaterThan(0);
    expect(parseFloat(style.outlineOffset)).toBeGreaterThan(0);

    expect(
      contrastRatio(rgb(style.outlineColor), rgb(surfaceBehindTheRing())),
    ).toBeGreaterThanOrEqual(3);
  });

  it('declares a standalone :focus rule that IBM style_focus_visible can read', () => {
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
        if (selector?.includes('.panel-toggle-btn') && selector.includes(':focus')) {
          focusSelectors.push(selector);
        }
      }
    }

    const canonical = focusSelectors.map((selector) =>
      selector.replace(/\[_ngcontent-[^\]]+\]/g, '').trim(),
    );
    expect(focusSelectors.length).toBeGreaterThan(0);
    expect(canonical).toContain('.panel-toggle-btn.mat-mdc-icon-button:focus');
  });
});
