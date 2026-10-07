/**
 * NXENG-776 — keyboard focus indicator on document detail properties panel sub-tabs
 * (IBM 298748541 / WCAG 2.4.7 Focus Visible).
 *
 * Plain `.sub-tab` buttons reset border/background and had no replacement ring. IBM Equal
 * Access reads `:focus` only — keep a standalone `.sub-tab:focus` rule (no comma lists).
 */
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { COMPILED_THEME_BASES } from '../theme/app-theme';

const MINIMUM_RATIO = 3;

@Component({
  standalone: true,
  templateUrl: './document-detail-sub-tab-focus-ring.host.html',
  styleUrls: [
    '../../../../../libs/features/document-detail/src/lib/document-detail/document-detail.scss',
  ],
})
class DocumentDetailSubTabFocusHostComponent {}

function luminance([r, g, b]: readonly number[]): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(a: readonly number[], b: readonly number[]): number {
  const [la, lb] = [luminance(a), luminance(b)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

function parseColor(value: string): { rgb: number[]; alpha: number } {
  const match = /rgba?\(([^)]+)\)/.exec(value);
  if (!match) throw new Error(`not a computed colour: "${value}"`);
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

function paintedBackground(element: HTMLElement): number[] {
  for (let node: HTMLElement | null = element; node; node = node.parentElement) {
    const parsed = parseColor(getComputedStyle(node).backgroundColor);
    if (parsed.alpha > 0) {
      return parsed.rgb;
    }
  }
  return [255, 255, 255];
}

describe('Document detail properties sub-tab — keyboard focus indicator (NXENG-776)', () => {
  let fixture: ComponentFixture<DocumentDetailSubTabFocusHostComponent>;
  let originalTheme: string | null;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentDetailSubTabFocusHostComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();
    originalTheme = document.documentElement.getAttribute('data-app-theme');
    fixture = TestBed.createComponent(DocumentDetailSubTabFocusHostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.nativeElement.remove();
    if (originalTheme === null) document.documentElement.removeAttribute('data-app-theme');
    else document.documentElement.setAttribute('data-app-theme', originalTheme);
  });

  function subTab(index: number): HTMLButtonElement {
    const buttons = fixture.nativeElement.querySelectorAll(
      '.sub-tab',
    ) as NodeListOf<HTMLButtonElement>;
    expect(buttons.length).toBeGreaterThanOrEqual(3);
    return buttons[index];
  }

  function measure(theme: string, tabIndex = 2) {
    document.documentElement.setAttribute('data-app-theme', theme);
    fixture.detectChanges();

    const button = subTab(tabIndex);
    button.focus();

    const styles = getComputedStyle(button);
    const backdrop = paintedBackground(button);
    const ring = parseColor(styles.outlineColor);
    const ringOnBackdrop = compositeOver(ring, backdrop);

    return {
      outlineStyle: styles.outlineStyle,
      outlineWidth: Number.parseFloat(styles.outlineWidth),
      outlineOffset: Number.parseFloat(styles.outlineOffset),
      ratioVsBackdrop: contrastRatio(ringOnBackdrop, backdrop),
    };
  }

  it('draws a visible focus ring on :focus (IBM style_focus_visible reads :focus only)', () => {
    const measured = measure('nuxeo');
    expect(measured.outlineStyle).not.toBe('none');
    expect(measured.outlineWidth).toBeGreaterThanOrEqual(2);
    expect(measured.outlineOffset).toBeLessThanOrEqual(-2);
    expect(measured.outlineWidth + measured.outlineOffset)
      .withContext('ring must be inset so overflow:hidden on .properties-panel cannot clip it')
      .toBeLessThanOrEqual(0);
  });

  for (const theme of COMPILED_THEME_BASES) {
    it(`focus ring meets ${MINIMUM_RATIO}:1 on the ${theme} theme`, () => {
      const measured = measure(theme);
      expect(measured.outlineStyle).not.toBe('none');
      expect(measured.outlineWidth).toBeGreaterThanOrEqual(2);
      expect(measured.ratioVsBackdrop)
        .withContext(`ring on Activity sub-tab under ${theme}`)
        .toBeGreaterThanOrEqual(MINIMUM_RATIO);
    });
  }

  for (const tabIndex of [0, 2] as const) {
    it(`edge sub-tab ${tabIndex} keeps a full ring inside the overflow-hidden panel`, () => {
      document.documentElement.setAttribute('data-app-theme', 'dark');
      fixture.detectChanges();

      const panel = fixture.nativeElement.querySelector('.properties-panel') as HTMLElement;
      const button = subTab(tabIndex);
      button.focus();

      const styles = getComputedStyle(button);
      expect(styles.outlineStyle).not.toBe('none');
      const outlineWidth = Number.parseFloat(styles.outlineWidth);
      const outlineOffset = Number.parseFloat(styles.outlineOffset);
      expect(outlineWidth).toBeGreaterThanOrEqual(2);
      expect(outlineOffset).toBeLessThanOrEqual(-2);
      expect(outlineWidth + outlineOffset)
        .withContext('outline must be fully inset — outlines do not participate in hit testing')
        .toBeLessThanOrEqual(0);

      const panelRect = panel.getBoundingClientRect();
      const btnRect = button.getBoundingClientRect();
      expect(btnRect.left).toBeGreaterThanOrEqual(panelRect.left);
      expect(btnRect.right).toBeLessThanOrEqual(panelRect.right);
      expect(btnRect.top).toBeGreaterThanOrEqual(panelRect.top);
      expect(btnRect.bottom).toBeLessThanOrEqual(panelRect.bottom);
    });
  }

  it('draws a visible ring on :focus when :focus-visible is false (IBM style_focus_visible)', () => {
    const button = subTab(0);
    button.focus({ focusVisible: false } as FocusOptions);
    expect(button.matches(':focus')).toBe(true);
    expect(button.matches(':focus-visible')).toBe(false);

    const style = getComputedStyle(button);
    expect(style.outlineStyle).toBe('solid');
    expect(Number.parseFloat(style.outlineWidth)).toBeGreaterThanOrEqual(2);
  });

  it('declares a standalone :focus rule that IBM Equal Access can read', () => {
    document.documentElement.setAttribute('data-app-theme', 'nuxeo');
    fixture.detectChanges();

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
        if (selector?.includes('.sub-tab') && selector.includes(':focus')) {
          focusSelectors.push(selector);
        }
      }
    }

    const canonical = focusSelectors.map((selector) =>
      selector.replace(/\[_ngcontent-[^\]]+\]/g, '').trim(),
    );
    expect(canonical).toContain('.sub-tab:focus');
  });
});
