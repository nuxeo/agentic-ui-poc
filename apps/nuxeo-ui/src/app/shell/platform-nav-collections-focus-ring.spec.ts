import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { SatPlatformNavModule } from '@hylandsoftware/satori-ui/platform-nav';
import { provideSatori } from '@hylandsoftware/satori-ui/providers';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

/**
 * NXENG-777 — the Collections sidebar nav link must show a visible keyboard focus indicator.
 *
 * IBM Equal Access reported Issue ID 317808202 (`style_focus_visible`, WCAG 2.4.7 / 1.4.11)
 * on `a[aria-label="Collections"]`. The underlying defect was the unset
 * `--sat-platform-nav-outline` token (fixed for all nav items in NXENG-761); this spec pins
 * the report to the Collections entry so a regression cannot hide behind a generic browse link.
 */

const COLLECTIONS_LINK =
  'sat-platform-nav-list-item[data-nav-id="app.navbar.collections"] a.sat-platform-nav-item';

@Component({
  standalone: true,
  imports: [SatPlatformNavModule, TranslateModule],
  templateUrl: './platform-nav-collections-focus-ring.host.html',
})
class CollectionsNavHostComponent {}

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

function paintedBackdrop(element: Element): number[] {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const background = getComputedStyle(node).backgroundColor;
    if (background && background !== 'rgba(0, 0, 0, 0)' && background !== 'transparent') {
      return parseColor(background).rgb;
    }
  }
  throw new Error('no painted ancestor found');
}

describe('platform sidebar nav — Collections link focus (NXENG-777)', () => {
  const MINIMUM_RATIO = 3;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectionsNavHostComponent, TranslateModule.forRoot()],
      providers: [provideSatori(), provideNoopAnimations()],
    }).compileComponents();
    document.documentElement.setAttribute('data-app-theme', 'nuxeo');
  });

  afterEach(() => {
    document.documentElement.removeAttribute('data-app-theme');
  });

  it('exposes the accessible name IBM flagged', () => {
    const fixture = TestBed.createComponent(CollectionsNavHostComponent);
    fixture.detectChanges();
    const anchor = fixture.nativeElement.querySelector(COLLECTIONS_LINK) as HTMLElement | null;
    expect(anchor).withContext('Collections nav link renders').toBeTruthy();
    expect(anchor?.getAttribute('aria-label')).toBe('Collections');
  });

  it('draws a keyboard focus ring with at least 3:1 contrast on the Collections link', () => {
    const fixture = TestBed.createComponent(CollectionsNavHostComponent);
    fixture.detectChanges();
    const anchor = fixture.nativeElement.querySelector(COLLECTIONS_LINK) as HTMLElement | null;
    if (!anchor) throw new Error(`Satori did not render ${COLLECTIONS_LINK}`);

    anchor.focus({ focusVisible: true } as FocusOptions);
    expect(anchor.matches(':focus-visible')).toBe(true);

    const styles = getComputedStyle(anchor);
    expect(styles.outlineStyle).not.toBe('none');
    expect(Number.parseFloat(styles.outlineWidth)).toBeGreaterThanOrEqual(2);

    const panel = paintedBackdrop(anchor);
    const ownFill = parseColor(styles.backgroundColor);
    const interior = ownFill.alpha > 0 ? compositeOver(ownFill, panel) : panel;
    const ring = parseColor(styles.outlineColor);
    const ratioVsInterior = contrastRatio(compositeOver(ring, interior), interior);

    expect(ratioVsInterior)
      .withContext(
        `Collections focus ring ${styles.outlineColor} on item fill — IBM 317808202 / WCAG 1.4.11`,
      )
      .toBeGreaterThanOrEqual(MINIMUM_RATIO);
  });
});
