import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'lib-selection-topbar',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatTooltipModule],
  templateUrl: './selection-topbar.component.html',
  styleUrl: './selection-topbar.component.scss',
})
export class SelectionTopbarComponent {
  readonly selectedCount = input.required<number>();
  readonly cleared = output<void>();
  readonly deleted = output<void>();
}
