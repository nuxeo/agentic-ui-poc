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

@Component({
  standalone: true,
  templateUrl: './document-detail-sub-tab-focus-ring.host.html',
  styleUrls: [
    '../../../../../libs/features/document-detail/src/lib/document-detail/document-detail.scss',
  ],
})
class DocumentDetailSubTabFocusHostComponent {}

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

describe('Document detail properties sub-tab — keyboard focus indicator (NXENG-776)', () => {
  let fixture: ComponentFixture<DocumentDetailSubTabFocusHostComponent>;
  let tab: HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DocumentDetailSubTabFocusHostComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();

    fixture = TestBed.createComponent(DocumentDetailSubTabFocusHostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    await fixture.whenStable();

    tab = fixture.nativeElement.querySelector('.sub-tab') as HTMLButtonElement;
  });

  function surfaceBehindTheRing(): string {
    let node: HTMLElement | null = tab.parentElement;
    while (node) {
      const bg = getComputedStyle(node).backgroundColor;
      if (bg && !/rgba\(0, 0, 0, 0\)|transparent/.test(bg)) return bg;
      node = node.parentElement;
    }
    return 'rgb(255, 255, 255)';
  }

  afterEach(() => {
    tab?.blur();
    fixture.nativeElement.remove();
  });

  it('draws no outline while unfocused', () => {
    expect(getComputedStyle(tab).outlineStyle).toBe('none');
  });

  it('draws a 2px solid outline on the sub-tab once focused', () => {
    tab.focus();
    expect(document.activeElement).toBe(tab);

    const style = getComputedStyle(tab);
    expect(style.outlineStyle).toBe('solid');
    expect(style.outlineWidth).toBe('2px');
    expect(style.outlineOffset).toBe('2px');
  });

  it('meets the 3:1 non-text contrast of SC 1.4.11 against the fixture surface the ring touches', () => {
    tab.focus();
    const style = getComputedStyle(tab);

    expect(style.outlineStyle).not.toBe('none');
    expect(parseFloat(style.outlineWidth)).toBeGreaterThan(0);
    expect(parseFloat(style.outlineOffset)).toBeGreaterThan(0);

    expect(
      contrastRatio(rgb(style.outlineColor), rgb(surfaceBehindTheRing())),
    ).toBeGreaterThanOrEqual(3);
  });

  it('draws a visible ring on :focus when :focus-visible is false (IBM style_focus_visible)', () => {
    tab.focus({ focusVisible: false } as FocusOptions);
    expect(tab.matches(':focus')).toBe(true);
    expect(tab.matches(':focus-visible')).toBe(false);

    const style = getComputedStyle(tab);
    expect(style.outlineStyle).toBe('solid');
    expect(style.outlineWidth).toBe('2px');
  });

  it('declares a standalone :focus rule that IBM Equal Access can read', () => {
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
