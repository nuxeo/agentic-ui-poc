import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

export interface AdminNavLink {
  label: string;
  path: string;
  icon: string;
}

@Component({
  selector: 'lib-administration-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './administration-shell.component.html',
  styleUrl: './administration-shell.component.scss',
})
export class AdministrationShellComponent {
  readonly links: AdminNavLink[] = [
    { label: 'Analytics', path: 'analytics', icon: 'insights' },
    { label: 'Users & Groups', path: 'users-groups', icon: 'groups' },
    { label: 'Vocabularies', path: 'vocabularies', icon: 'menu_book' },
    { label: 'Audit', path: 'audit', icon: 'history' },
    { label: 'Cloud Services', path: 'cloud-services', icon: 'cloud_queue' },
    { label: 'NXQL Search', path: 'nxql-search', icon: 'terminal' },
  ];
}
