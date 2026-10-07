/**
 * NXENG-792 — keyboard focus ring on document detail sidebar `.sub-tab` buttons (IBM 321710239).
 * Karma loads global styles so theme tokens resolve; the host pulls in the real feature SCSS.
 */
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

import { COMPILED_THEME_BASES } from '../theme/app-theme';

const MINIMUM_RATIO = 3;

@Component({
  standalone: true,
  templateUrl: './sub-tab-focus-ring.host.html',
  styleUrls: [
    '../../../../../libs/features/document-detail/src/lib/document-detail/document-detail.scss',
  ],
})
class SubTabFocusHostComponent {}

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

describe('Document detail sidebar sub-tabs — keyboard focus (NXENG-792)', () => {
  let fixture: ComponentFixture<SubTabFocusHostComponent>;
  let originalTheme: string | null;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubTabFocusHostComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();
    originalTheme = document.documentElement.getAttribute('data-app-theme');
    fixture = TestBed.createComponent(SubTabFocusHostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.nativeElement.remove();
    if (originalTheme === null) document.documentElement.removeAttribute('data-app-theme');
    else document.documentElement.setAttribute('data-app-theme', originalTheme);
  });

  function subTab(index: number): HTMLButtonElement {
    const buttons = fixture.nativeElement.querySelectorAll('.sub-tab') as NodeListOf<HTMLButtonElement>;
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
      expect(Number.parseFloat(styles.outlineWidth)).toBeGreaterThanOrEqual(2);
      expect(Number.parseFloat(styles.outlineOffset)).toBeLessThanOrEqual(-2);

      const panelRect = panel.getBoundingClientRect();
      const btnRect = button.getBoundingClientRect();
      const inset = Math.max(2, Math.abs(Number.parseFloat(styles.outlineOffset)));
      const probeX =
        tabIndex === 0 ? btnRect.left + inset + 1 : btnRect.right - inset - 1;
      const probeY = btnRect.top + btnRect.height / 2;
      expect(probeX).toBeGreaterThanOrEqual(panelRect.left);
      expect(probeX).toBeLessThanOrEqual(panelRect.right);
      expect(probeY).toBeGreaterThanOrEqual(panelRect.top);
      expect(probeY).toBeLessThanOrEqual(panelRect.bottom);

      const hit = document.elementFromPoint(probeX, probeY);
      expect(hit === button || button.contains(hit))
        .withContext('focus ring probe must land on the focused sub-tab, not clipped away')
        .toBe(true);
    });
  }
});
