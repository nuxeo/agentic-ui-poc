import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { SatPlatformNavModule } from '@hylandsoftware/satori-ui/platform-nav';

/**
 * NXENG-761 — the keyboard focus ring on the platform sidebar nav links must be visible.
 *
 * WCAG 2.1 SC 1.4.11 Non-text Contrast requires 3:1 between a focus indicator and the colours
 * adjacent to it. Satori draws the ring from `--sat-platform-nav-outline`, which this
 * application did not set, so it fell back to `--mat-sys-outline-variant` — a divider token —
 * and measured 2.87:1 against the active-item highlight the inset ring is drawn over.
 *
 * ## Why this spec measures rather than inspects
 *
 * Asserting that `--sat-platform-nav-outline` is declared, or that it names a particular
 * token, would pass on any value including the one that failed. What has to hold is the
 * contrast, so the colours are read back off rendered elements and the ratio is computed. The
 * spec then keeps working — and keeps failing when it should — if a palette changes, if Satori
 * changes which property the ring reads, or if someone points the property somewhere else.
 *
 * Three things make that possible here rather than in a jsdom test:
 *
 *  - these specs run in real Chrome (`ng test --browsers=ChromeHeadless`), so focus semantics
 *    and `getComputedStyle` are the browser's;
 *  - `angular.json` loads `apps/nuxeo-ui/src/styles.scss` into the Karma page, so the real
 *    theme tokens and the real override are in the cascade; and
 *  - `SatPlatformNav` — the component that owns the rule drawing the ring — declares
 *    `ViewEncapsulation.None`, and nothing in the shipped styles carries `_ngcontent`
 *    scoping, so instantiating the real `<sat-platform-nav>` puts that rule in the cascade.
 *
 * ## The one piece of arithmetic
 *
 * `getComputedStyle` returns what an element *declares*, so the active item reads back as
 * `rgba(255, 255, 255, 0.12)` — a translucent overlay, not the colour a user sees. The
 * composite is computed below from the overlay and the panel underneath. That is not a guess:
 * the evidence capture for this ticket sampled the same pixel out of a screenshot and read
 * #6b69b6, which is what this arithmetic produces from the two declared values.
 */

/** sRGB relative luminance, per WCAG 2.1. */
function luminance([r, g, b]: readonly number[]): number {
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(a: readonly number[], b: readonly number[]): number {
  const [high, low] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (high + 0.05) / (low + 0.05);
}

/** `rgb(r, g, b)` / `rgba(r, g, b, a)` — the only forms `getComputedStyle` returns for colours. */
function parseColor(value: string): { rgb: number[]; alpha: number } {
  const parts = value.match(/[\d.]+/g);
  if (!parts || parts.length < 3) {
    throw new Error(`not a colour this test can read: "${value}"`);
  }
  return {
    rgb: parts.slice(0, 3).map(Number),
    alpha: parts.length > 3 ? Number(parts[3]) : 1,
  };
}

/** Composite `value` over `backdrop`, so a translucent overlay is measured as it appears. */
function flatten(value: string, backdrop: readonly number[]): number[] {
  const { rgb, alpha } = parseColor(value);
  return rgb.map((channel, i) => Math.round(alpha * channel + (1 - alpha) * backdrop[i]));
}

/**
 * The host template is external because `AGENTS/08-bug-patterns.md` section 10 requires it of
 * every component and does not exempt test hosts — the same reason
 * `render-trusted-html.spec.ts` keeps its one-line host template in a sibling file.
 */
@Component({
  standalone: true,
  imports: [SatPlatformNavModule],
  templateUrl: './platform-nav-focus-ring.host.html',
})
class NavHostComponent {}

/**
 * Every theme `apps/nuxeo-ui/src/styles.scss` declares. `null` is the no-attribute case, which
 * is not hypothetical: the attribute is applied by the app at runtime, so the first paint of
 * every session is themed by `html:not([data-app-theme])`.
 */
const SHIPPED_THEMES: readonly (string | null)[] = [null, 'nuxeo', 'dark', 'light', 'kawaii'];

const WCAG_1411_MIN_RATIO = 3;

describe('platform sidebar nav — keyboard focus ring (NXENG-761)', () => {
  let fixture: ComponentFixture<NavHostComponent>;
  let originalTheme: string | null;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      // Satori's nav translates its collapse/expand tooltips, and ngx-translate is
      // bootstrapped by the application rather than by the component — the same reason
      // `tasks-page.viewer-mime.spec.ts` imports it.
      imports: [NavHostComponent, TranslateModule.forRoot()],
    }).compileComponents();
    originalTheme = document.documentElement.getAttribute('data-app-theme');
    fixture = TestBed.createComponent(NavHostComponent);
    fixture.detectChanges();
    // Satori's panel is `position: fixed`, so it renders regardless of where Karma puts the
    // fixture; attaching to the body keeps the cascade the same as the application's.
    document.body.appendChild(fixture.nativeElement);
  });

  afterEach(() => {
    fixture.nativeElement.remove();
    if (originalTheme === null) {
      document.documentElement.removeAttribute('data-app-theme');
    } else {
      document.documentElement.setAttribute('data-app-theme', originalTheme);
    }
  });

  function link(navId: 'idle' | 'active'): HTMLElement {
    const el = fixture.nativeElement.querySelector(
      `sat-platform-nav-list-item[data-nav-id="${navId}"] .sat-platform-nav-item`,
    );
    expect(el).withContext(`the ${navId} nav link renders`).toBeTruthy();
    return el as HTMLElement;
  }

  /** Focus a link as a keyboard user would and report the ring it draws, flattened. */
  function focusRingOf(navId: 'idle' | 'active') {
    const el = link(navId);
    el.focus({ focusVisible: true } as FocusOptions);

    const panel = fixture.nativeElement.querySelector('.sat-platform-nav-panel') as HTMLElement;
    const panelRgb = parseColor(getComputedStyle(panel).backgroundColor).rgb;
    const style = getComputedStyle(el);

    return {
      matchesFocusVisible: el.matches(':focus-visible'),
      outlineStyle: style.outlineStyle,
      outlineWidth: parseFloat(style.outlineWidth),
      // Flattened over the panel, so a translucent ring colour cannot read as opaque.
      ring: flatten(style.outlineColor, panelRgb),
      panel: panelRgb,
      // What the *focused* item paints, and what the item next to it paints — the two colours
      // the ring can end up against.
      own: flatten(style.backgroundColor, panelRgb),
      neighbour: flatten(
        getComputedStyle(link(navId === 'idle' ? 'active' : 'idle')).backgroundColor,
        panelRgb,
      ),
    };
  }

  for (const theme of SHIPPED_THEMES) {
    const label = theme ?? 'no data-app-theme (first paint)';

    for (const focused of ['idle', 'active'] as const) {
      it(`draws a ${WCAG_1411_MIN_RATIO}:1 focus ring on the ${focused} sidebar link — ${label}`, () => {
        if (theme === null) {
          document.documentElement.removeAttribute('data-app-theme');
        } else {
          document.documentElement.setAttribute('data-app-theme', theme);
        }

        const measured = focusRingOf(focused);

        // Loud rather than silent: if Chrome stops honouring `focusVisible`, the ring is not
        // on screen and every ratio below would be measuring a colour nothing paints.
        expect(measured.matchesFocusVisible)
          .withContext('the link must be in the :focus-visible state for the ring to exist')
          .toBe(true);
        expect(measured.outlineStyle).not.toBe('none');
        expect(measured.outlineWidth).toBeGreaterThan(0);

        // Every colour the ring is adjacent to: `outline-offset: -2px` draws it inside the
        // item, so it sits on the item's own background, and the panel and the touching
        // neighbour's background are the colours immediately outside it.
        const adjacent = {
          'the panel': measured.panel,
          "the focused item's own background": measured.own,
          "the neighbouring item's background": measured.neighbour,
        };
        for (const [what, colour] of Object.entries(adjacent)) {
          const ratio = contrastRatio(measured.ring, colour);
          expect(ratio)
            .withContext(
              `focus ring rgb(${measured.ring}) against ${what} rgb(${colour}) is ` +
                `${ratio.toFixed(2)}:1, below the ${WCAG_1411_MIN_RATIO}:1 required by ` +
                'WCAG 2.1 SC 1.4.11',
            )
            .toBeGreaterThanOrEqual(WCAG_1411_MIN_RATIO);
        }
      });
    }
  }

  /**
   * The indicator must stay keyboard-only. Satori's rule is `:focus-visible`, and this fix
   * only supplies the colour it reads — but a later "fix" that reached for `:focus` would ring
   * every mouse click, which is the regression this pins down.
   */
  it('does not draw the ring when the link is focused without a keyboard', () => {
    const el = link('idle');
    el.focus({ focusVisible: false } as FocusOptions);
    expect(el.matches(':focus')).toBe(true);
    expect(el.matches(':focus-visible')).toBe(false);
    expect(getComputedStyle(el).outlineStyle).toBe('none');
  });
});
