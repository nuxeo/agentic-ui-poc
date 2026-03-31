import { Component, input, output } from '@angular/core';
import { MatListModule } from '@angular/material/list';

import { AppNavItem } from '../../platform-nav-items';

@Component({
  selector: 'app-nav-drawer',
  standalone: true,
  imports: [MatListModule],
  templateUrl: './nav-drawer.component.html',
  styleUrl: './nav-drawer.component.scss',
})
export class NavDrawerComponent {
  readonly activeItem = input<AppNavItem | null>(null);
  readonly itemSelected = output<string>();
}
