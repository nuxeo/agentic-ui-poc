import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

import { ConfigStorageService } from '@agentic-ui/shared/nuxeo-studio';

interface NavItem {
  label: string;
  icon: string;
  path: string;
}

@Component({
  selector: 'lib-studio-designer-shell',
  standalone: true,
  imports: [
    RouterModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDividerModule,
  ],
  templateUrl: './studio-designer-shell.component.html',
  styleUrl: './studio-designer-shell.component.scss',
})
export class StudioDesignerShellComponent {
  private readonly storage = inject(ConfigStorageService);
  private readonly snackBar = inject(MatSnackBar);

  readonly navItems: NavItem[] = [
    { label: 'Layouts', icon: 'dashboard_customize', path: 'layouts' },
    { label: 'Buttons', icon: 'smart_button', path: 'buttons' },
    { label: 'Tabs', icon: 'tab', path: 'tabs' },
    { label: 'Drawer', icon: 'menu', path: 'drawer' },
    { label: 'Page Providers', icon: 'search', path: 'page-providers' },
    { label: 'Themes', icon: 'palette', path: 'themes' },
    { label: 'Translations', icon: 'translate', path: 'translations' },
    { label: 'Dashboard', icon: 'space_dashboard', path: 'dashboard' },
  ];

  exportConfigs(): void {
    const json = this.storage.exportAll();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studio-configs-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.snackBar.open('Configs exported', 'OK', { duration: 2000 });
  }

  importConfigs(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = reader.result as string;
        this.storage.importAll(json).subscribe({
          next: () => {
            this.snackBar.open('Configs imported and saved to server', 'OK', { duration: 3000 });
            window.location.reload();
          },
          error: () => {
            this.snackBar.open('Import failed', 'Dismiss', { duration: 4000 });
          },
        });
      } catch {
        this.snackBar.open('Invalid JSON file', 'Dismiss', { duration: 4000 });
      }
    };
    reader.readAsText(file);
    input.value = '';
  }
}
