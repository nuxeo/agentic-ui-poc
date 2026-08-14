import { Component, input } from '@angular/core';

@Component({
  selector: 'hxp-spinner',
  standalone: true,
  templateUrl: './hxp-spinner.component.html',
  styleUrl: './hxp-spinner.component.scss',
  host: {
    class: 'hxp-spinner-host',
    role: 'status',
    'aria-label': 'Loading',
  },
})
export class HxpSpinnerComponent {
  readonly size = input(24);
}
