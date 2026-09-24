import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { SatPlatformNavModule } from '@hylandsoftware/satori-ui/platform-nav';
import { provideSatori } from '@hylandsoftware/satori-ui/providers';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { PlatformNavRailToggleVisibleLabelDirective } from './platform-nav-rail-toggle-visible-label.directive';
import {
  PLATFORM_NAV_RAIL_TOGGLE_SELECTOR,
  PLATFORM_NAV_RAIL_TOGGLE_VISIBLE_LABEL_CLASS,
  platformNavRailToggleLabelKey,
  syncPlatformNavRailToggleVisibleLabel,
} from './platform-nav-rail-toggle-visible-label';

@Component({
  standalone: true,
  imports: [SatPlatformNavModule, PlatformNavRailToggleVisibleLabelDirective],
  template: '<sat-platform-nav satPlatformNavRailToggleVisibleLabel></sat-platform-nav>',
})
class HostComponent {}

describe('Platform nav rail toggle visible label (NXENG-927)', () => {
  describe('syncPlatformNavRailToggleVisibleLabel', () => {
    it('returns null when the toggle is absent', () => {
      expect(
        syncPlatformNavRailToggleVisibleLabel(document.createElement('div'), 'Expand'),
      ).toBeNull();
    });

    it('inserts visible label text and marks the icon decorative', () => {
      const root = document.createElement('div');
      root.innerHTML =
        '<button id="sat-platform-nav-title-icon" aria-label="Expand navigation"><svg></svg></button>';

      const button = syncPlatformNavRailToggleVisibleLabel(root, 'Expand navigation');
      expect(button).toBeTruthy();

      const span = button!.querySelector(`.${PLATFORM_NAV_RAIL_TOGGLE_VISIBLE_LABEL_CLASS}`);
      expect(span?.textContent).toBe('Expand navigation');

      const svg = button!.querySelector('svg');
      expect(svg?.getAttribute('aria-hidden')).toBe('true');
    });

    it('aligns aria-label when it does not contain the visible text', () => {
      const root = document.createElement('div');
      root.innerHTML =
        '<button id="sat-platform-nav-title-icon" aria-label="Wrong"><svg></svg></button>';

      syncPlatformNavRailToggleVisibleLabel(root, 'Expand navigation');
      const button = root.querySelector(PLATFORM_NAV_RAIL_TOGGLE_SELECTOR) as HTMLButtonElement;
      expect(button.getAttribute('aria-label')).toBe('Expand navigation');
    });
  });

  describe('platformNavRailToggleLabelKey', () => {
    it('maps collapsed state to expand/collapse catalogue keys', () => {
      expect(platformNavRailToggleLabelKey(true)).toBe('sat.platform-nav.expand');
      expect(platformNavRailToggleLabelKey(false)).toBe('sat.platform-nav.collapse');
    });
  });

  describe('PlatformNavRailToggleVisibleLabelDirective', () => {
    let fixture: ComponentFixture<HostComponent>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [HostComponent, TranslateModule.forRoot()],
        providers: [provideSatori(), provideNoopAnimations()],
      }).compileComponents();

      fixture = TestBed.createComponent(HostComponent);
      const translate = TestBed.inject(TranslateService);
      translate.setTranslation('en', {
        'sat.platform-nav.expand': '⟦Expand navigation⟧',
        'sat.platform-nav.collapse': '⟦Collapse navigation⟧',
      });
      translate.use('en');
      fixture.detectChanges();
    });

    it('renders visible label text inside the rail toggle', () => {
      const button = fixture.nativeElement.querySelector(
        PLATFORM_NAV_RAIL_TOGGLE_SELECTOR,
      ) as HTMLButtonElement;
      expect(button).withContext('rail toggle renders').toBeTruthy();

      const span = button.querySelector(`.${PLATFORM_NAV_RAIL_TOGGLE_VISIBLE_LABEL_CLASS}`);
      expect(span?.textContent).toBe('⟦Expand navigation⟧');

      const styles = getComputedStyle(span as Element);
      expect(styles.display).not.toBe('none');
      expect(styles.visibility).not.toBe('hidden');
      expect(Number.parseFloat(styles.fontSize)).toBeGreaterThan(0);
    });
  });
});
