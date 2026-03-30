import { Component } from '@angular/core';

/** PoC placeholder for routes not yet backed by feature libraries. */
@Component({
  standalone: true,
  template: `
    <div class="placeholder">
      <p>Coming soon</p>
    </div>
  `,
  styles: [
    `
      .placeholder {
        padding: 1.5rem;
      }
    `,
  ],
})
export class PlaceholderPageComponent {}
