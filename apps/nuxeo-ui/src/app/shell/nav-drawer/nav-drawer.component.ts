import { Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';

import { AppNavItem } from '../../platform-nav-items';

@Component({
  selector: 'app-nav-drawer',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatListModule],
  templateUrl: './nav-drawer.component.html',
  styleUrl: './nav-drawer.component.scss',
})
export class NavDrawerComponent {
  readonly activeItem = input<AppNavItem | null>(null);
  readonly itemSelected = output<string>();
  readonly closeDrawer = output<void>();
}
