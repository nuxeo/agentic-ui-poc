/**
 * NXENG-939 (IBM 9067535242) — the dashboard AI Insights banner title must meet WCAG 2.1
 * SC 1.4.3 (4.5:1) against an opaque surface IBM Equal Access can evaluate.
 *
 * The defect was not illegible text but a decorative linear/radial gradient behind the title
 * that put the finding in "Needs review". These tests render the real banner styles and
 * measure the computed contrast ratio, same pattern as `nav-focus-ring-contrast.spec.ts`.
 */
import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';

import { testTranslateModule } from '../i18n/translate-testing';

function relativeLuminance([r, g, b]: readonly number[]): number {
  const channel = (v: number): number => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(a: readonly number[], b: readonly number[]): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function rgb(css: string): number[] {
  const parts = (css.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
  return [parts[0] ?? 0, parts[1] ?? 0, parts[2] ?? 0];
}

function paintedBackdrop(element: Element): number[] {
  for (let node = element.parentElement; node; node = node.parentElement) {
    const style = getComputedStyle(node);
    const bgImage = style.backgroundImage ?? '';
    if (/gradient/i.test(bgImage)) {
      throw new Error(`ancestor uses gradient background: ${bgImage}`);
    }
    const background = style.backgroundColor;
    if (background && background !== 'rgba(0, 0, 0, 0)' && background !== 'transparent') {
      return rgb(background);
    }
  }
  throw new Error('no opaque painted ancestor found for the banner title');
}

@Component({
  standalone: true,
  imports: [MatIconModule, TranslateModule],
  styleUrls: ['./dashboard-page.component.scss'],
  templateUrl: './dashboard-ai-banner-contrast.spec.html',
})
class DashboardAiBannerHostComponent {}

describe('dashboard AI Insights banner title contrast (NXENG-939)', () => {
  /** WCAG 2.1 SC 1.4.3 — normal text at AA. */
  const MIN_TEXT_RATIO = 4.5;

  let fixture: ComponentFixture<DashboardAiBannerHostComponent>;
  let title: HTMLElement;
  let banner: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardAiBannerHostComponent, testTranslateModule()],
      providers: [provideZonelessChangeDetection()],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardAiBannerHostComponent);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    await fixture.whenStable();

    title = fixture.nativeElement.querySelector('.ai-banner-title') as HTMLElement;
    banner = fixture.nativeElement.querySelector('.ai-insights-banner') as HTMLElement;
  });

  afterEach(() => {
    fixture.nativeElement.remove();
  });

  it('uses an opaque surface background IBM can evaluate', () => {
    const bannerStyle = getComputedStyle(banner);
    expect(bannerStyle.backgroundImage).not.toMatch(/gradient/i);
    expect(bannerStyle.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
  });

  it(`meets ${MIN_TEXT_RATIO}:1 text contrast against the banner surface`, () => {
    const titleStyle = getComputedStyle(title);
    const ratio = contrastRatio(rgb(titleStyle.color), paintedBackdrop(title));
    expect(ratio)
      .withContext(
        `title ${titleStyle.color} on banner ${getComputedStyle(banner).backgroundColor}`,
      )
      .toBeGreaterThanOrEqual(MIN_TEXT_RATIO);
  });
});
