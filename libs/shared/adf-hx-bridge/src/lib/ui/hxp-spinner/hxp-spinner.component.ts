import { Component, inject, input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'hxp-spinner',
  standalone: true,
  templateUrl: './hxp-spinner.component.html',
  styleUrl: './hxp-spinner.component.scss',
  host: {
    class: 'hxp-spinner-host',
    role: 'status',
    // Bound rather than literal: a screen reader announces this, so it is user-facing text.
    '[attr.aria-label]': "translate.instant('adf-hx-bridge.loading')",
  },
})
export class HxpSpinnerComponent {
  protected readonly translate = inject(TranslateService);
  readonly size = input(24);
}
