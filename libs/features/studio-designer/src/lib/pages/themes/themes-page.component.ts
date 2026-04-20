import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import {
  type ThemeDefinition,
  getAllBaseThemes,
  themeToCSS,
  ConfigStorageService,
} from '@agentic-ui/shared/nuxeo-studio';

import { NewThemeDialogComponent } from './new-theme-dialog.component';

type ViewMode = 'list' | 'editor';

@Component({
  selector: 'lib-themes-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatSnackBarModule,
    MatCheckboxModule,
    MatDialogModule,
    MatChipsModule,
    MatTooltipModule,
    MatSlideToggleModule,
  ],
  templateUrl: './themes-page.component.html',
  styleUrl: './themes-page.component.scss',
})
export class ThemesPageComponent {
  private readonly storage = inject(ConfigStorageService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  readonly viewMode = signal<ViewMode>('list');
  readonly filterText = signal('');
  readonly onlyCustom = signal(false);
  readonly saving = signal(false);

  readonly customThemes = signal<ThemeDefinition[]>(this.storage.getThemeDefinitions());
  readonly editingTheme = signal<ThemeDefinition | null>(null);

  readonly allThemes = computed(() => {
    const builtIn = getAllBaseThemes();
    const custom = this.customThemes();
    return [...custom, ...builtIn];
  });

  readonly filteredThemes = computed(() => {
    let themes = this.allThemes();
    if (this.onlyCustom()) {
      themes = themes.filter((t) => t.isCustom);
    }
    const q = this.filterText().toLowerCase();
    if (q) {
      themes = themes.filter((t) => t.name.toLowerCase().includes(q));
    }
    return themes;
  });

  readonly cssPreview = computed(() => {
    const theme = this.editingTheme();
    return theme ? themeToCSS(theme) : '';
  });

  openNewThemeDialog(): void {
    this.dialog
      .open(NewThemeDialogComponent, { width: '440px' })
      .afterClosed()
      .subscribe((result: ThemeDefinition | undefined) => {
        if (!result) return;
        this.storage.saveThemeDefinitionAsync(result).subscribe({
          next: () => {
            this.customThemes.set(this.storage.getThemeDefinitions());
            this.editTheme(result);
          },
          error: () => {
            this.customThemes.set(this.storage.getThemeDefinitions());
            this.editTheme(result);
          },
        });
      });
  }

  editTheme(theme: ThemeDefinition): void {
    this.editingTheme.set(JSON.parse(JSON.stringify(theme)));
    this.viewMode.set('editor');
  }

  backToList(): void {
    this.editingTheme.set(null);
    this.viewMode.set('list');
    this.customThemes.set(this.storage.getThemeDefinitions());
  }

  saveTheme(): void {
    const theme = this.editingTheme();
    if (!theme) return;
    this.saving.set(true);
    this.storage.saveThemeDefinitionAsync(theme).subscribe({
      next: () => {
        this.saving.set(false);
        this.customThemes.set(this.storage.getThemeDefinitions());
        this.snackBar.open(`Theme "${theme.name}" saved to server`, 'OK', { duration: 2000 });
      },
      error: () => {
        this.saving.set(false);
        this.snackBar.open('Save failed — cached locally', 'Dismiss', { duration: 4000 });
      },
    });
  }

  discardChanges(): void {
    const theme = this.editingTheme();
    if (!theme) return;
    const original = this.storage.getThemeDefinition(theme.id);
    if (original) {
      this.editingTheme.set(JSON.parse(JSON.stringify(original)));
    } else {
      this.backToList();
    }
  }

  deleteTheme(theme: ThemeDefinition): void {
    if (!theme.isCustom) return;
    this.storage.deleteThemeDefinitionAsync(theme.id).subscribe({
      next: () => {
        this.customThemes.set(this.storage.getThemeDefinitions());
        this.snackBar.open(`Theme "${theme.name}" deleted`, 'OK', { duration: 2000 });
      },
      error: () => {
        this.customThemes.set(this.storage.getThemeDefinitions());
        this.snackBar.open('Delete saved locally', 'OK', { duration: 2000 });
      },
    });
  }

  updateThemeName(name: string): void {
    this.editingTheme.update((t) => (t ? { ...t, name } : t));
  }

  toggleDefault(): void {
    this.editingTheme.update((t) => (t ? { ...t, isDefault: !t.isDefault } : t));
  }

  updateVariable(catIdx: number, varIdx: number, value: string): void {
    this.editingTheme.update((t) => {
      if (!t) return t;
      const categories = t.categories.map((c, ci) => {
        if (ci !== catIdx) return c;
        const variables = c.variables.map((v, vi) => (vi === varIdx ? { ...v, value } : v));
        return { ...c, variables };
      });
      return { ...t, categories };
    });
  }

  updateLogoUrl(url: string): void {
    this.editingTheme.update((t) => (t ? { ...t, logoUrl: url } : t));
  }

  updateBackgroundUrl(url: string): void {
    this.editingTheme.update((t) => (t ? { ...t, backgroundUrl: url } : t));
  }

  updateScreenshotUrl(url: string): void {
    this.editingTheme.update((t) => (t ? { ...t, screenshotUrl: url } : t));
  }
}
