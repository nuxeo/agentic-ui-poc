import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatIconModule } from '@angular/material/icon';
import { provideNoopAnimations } from '@angular/platform-browser/animations';

/**
 * NXENG-940 / IBM 9044252072 — `.ai-banner-empty` text and icon on the AI Insights banner.
 *
 * Measures contrast against the computed opaque banner surface (NXENG-939), not a hex grep.
 * Karma runs in real Chrome with the app stylesheet loaded.
 */

const MIN_TEXT_RATIO = 4.5;

@Component({
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './dashboard-ai-banner-empty-contrast.host.html',
  styleUrls: ['./dashboard-page.component.scss'],
})
class DashboardAiBannerEmptyHostComponent {}

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

function parseRgb(value: string): number[] {
  const match = /rgba?\(([^)]+)\)/.exec(value);
  if (!match) throw new Error(`not a computed colour: "${value}"`);
  const parts = match[1]
    .split(/[,\s/]+/)
    .filter(Boolean)
    .map(Number);
  return parts.slice(0, 3);
}

describe('dashboard AI banner empty state contrast (NXENG-940)', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardAiBannerEmptyHostComponent],
      providers: [provideNoopAnimations()],
    }).compileComponents();
  });

  it('empty-state text and icon meet 4.5:1 on the banner surface', () => {
    const fixture = TestBed.createComponent(DashboardAiBannerEmptyHostComponent);
    fixture.detectChanges();

    const banner = fixture.nativeElement.querySelector('.ai-insights-banner') as HTMLElement;
    const empty = fixture.nativeElement.querySelector('.ai-banner-empty') as HTMLElement;
    const icon = empty.querySelector('mat-icon') as HTMLElement;
    expect(banner).withContext('fixture renders the banner').toBeTruthy();
    expect(empty).withContext('fixture renders the empty row').toBeTruthy();
    expect(icon).withContext('fixture renders the status icon').toBeTruthy();

    const backdrop = parseRgb(getComputedStyle(banner).backgroundColor);
    const textColor = getComputedStyle(empty).color;
    const iconColor = getComputedStyle(icon).color;

    const textRatio = contrastRatio(parseRgb(textColor), backdrop);
    const iconRatio = contrastRatio(parseRgb(iconColor), backdrop);

    expect(textRatio)
      .withContext(`text ${textColor} on ${getComputedStyle(banner).backgroundColor}`)
      .toBeGreaterThanOrEqual(MIN_TEXT_RATIO);
    expect(iconRatio)
      .withContext(`icon ${iconColor} on ${getComputedStyle(banner).backgroundColor}`)
      .toBeGreaterThanOrEqual(MIN_TEXT_RATIO);
  });
});
