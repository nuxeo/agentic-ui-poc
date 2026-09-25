import { Directive, ElementRef, afterNextRender, effect, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SatPlatformNavStateService } from '@hylandsoftware/satori-ui/platform-nav';
import { TranslateService } from '@ngx-translate/core';

import {
  PLATFORM_NAV_RAIL_TOGGLE_SELECTOR,
  platformNavRailToggleLabelKey,
  syncPlatformNavRailToggleVisibleLabel,
} from './platform-nav-rail-toggle-visible-label';

/**
 * Host-side workaround for Satori `SatPlatformNav` rail toggle (finding 4.6 / NXENG-927).
 */
@Directive({
  selector: 'sat-platform-nav[satPlatformNavRailToggleVisibleLabel]',
  standalone: true,
})
export class PlatformNavRailToggleVisibleLabelDirective {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly navState = inject(SatPlatformNavStateService);
  private readonly translate = inject(TranslateService);

  constructor() {
    const sync = () => {
      const collapsed = this.navState.collapsed();
      const key = platformNavRailToggleLabelKey(collapsed);
      syncPlatformNavRailToggleVisibleLabel(this.host.nativeElement, this.translate.instant(key));
    };

    afterNextRender(() => {
      const trySync = (attemptsLeft: number) => {
        sync();
        if (
          !this.host.nativeElement.querySelector(PLATFORM_NAV_RAIL_TOGGLE_SELECTOR) &&
          attemptsLeft > 0
        ) {
          requestAnimationFrame(() => trySync(attemptsLeft - 1));
        }
      };
      trySync(20);
    });

    effect(() => {
      this.navState.collapsed();
      sync();
    });

    this.translate.onLangChange.pipe(takeUntilDestroyed()).subscribe(() => sync());
  }
}
