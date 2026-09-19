import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

/** PoC placeholder for routes not yet backed by feature libraries. */
@Component({
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './placeholder-page.component.html',
  styles: [
    `
      .placeholder {
        padding: 1.5rem;
      }
    `,
  ],
})
export class PlaceholderPageComponent {}
