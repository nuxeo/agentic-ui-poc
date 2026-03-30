import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    ReactiveFormsModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './shell.html',
  styleUrls: ['./shell.scss'],
})
export class ShellComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  sidenavOpen = signal(true);
  searchControl = new FormControl('');

  navItems = [
    { icon: 'folder', label: 'Browse', route: '/browser' },
    { icon: 'search', label: 'Search', route: '/search' },
    { icon: 'cloud_upload', label: 'Upload', route: '/upload' },
  ];

  onSearch(): void {
    const q = this.searchControl.value?.trim();
    if (q) {
      this.router.navigate(['/search'], { queryParams: { q } });
    }
  }

  logout(): void {
    this.auth.logout();
  }
}
