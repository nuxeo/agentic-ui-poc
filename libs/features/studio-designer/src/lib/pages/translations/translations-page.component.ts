import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';

import {
  type TranslationConfig,
  createDefaultTranslation,
  ConfigStorageService,
} from '@agentic-ui/shared/nuxeo-studio';

const DEFAULT_LOCALES = [
  { locale: 'en', displayName: 'English' },
  { locale: 'fr', displayName: 'French' },
  { locale: 'de', displayName: 'German' },
  { locale: 'es', displayName: 'Spanish' },
  { locale: 'it', displayName: 'Italian' },
  { locale: 'pt', displayName: 'Portuguese' },
  { locale: 'ja', displayName: 'Japanese' },
  { locale: 'zh', displayName: 'Chinese' },
];

@Component({
  selector: 'lib-translations-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCardModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatChipsModule,
    KeyValuePipe,
  ],
  templateUrl: './translations-page.component.html',
  styleUrl: './translations-page.component.scss',
})
export class TranslationsPageComponent {
  private readonly storage = inject(ConfigStorageService);
  private readonly snackBar = inject(MatSnackBar);

  readonly defaultLocales = DEFAULT_LOCALES;

  readonly translations = signal<TranslationConfig[]>(this.storage.getTranslations());
  readonly selectedLocale = signal<string | null>(null);
  readonly newKey = signal('');
  readonly newValue = signal('');
  readonly filterText = signal('');
  readonly saving = signal(false);

  readonly selectedTranslation = computed(() => {
    const locale = this.selectedLocale();
    if (!locale) return null;
    return this.translations().find((t) => t.locale === locale) ?? null;
  });

  readonly filteredEntries = computed(() => {
    const trans = this.selectedTranslation();
    if (!trans) return [];
    const filter = this.filterText().toLowerCase();
    return Object.entries(trans.entries)
      .filter(
        ([key, val]) =>
          !filter || key.toLowerCase().includes(filter) || val.toLowerCase().includes(filter),
      )
      .sort(([a], [b]) => a.localeCompare(b));
  });

  readonly entryCount = computed(() => {
    const trans = this.selectedTranslation();
    return trans ? Object.keys(trans.entries).length : 0;
  });

  addLocale(locale: string, displayName: string): void {
    if (this.translations().some((t) => t.locale === locale)) {
      this.selectedLocale.set(locale);
      return;
    }
    const trans = createDefaultTranslation(locale, displayName);
    this.translations.update((all) => [...all, trans]);
    this.storage.saveTranslations(this.translations());
    this.selectedLocale.set(locale);
  }

  selectLocale(locale: string): void {
    this.selectedLocale.set(locale);
    this.filterText.set('');
  }

  removeLocale(locale: string): void {
    this.translations.update((all) => all.filter((t) => t.locale !== locale));
    this.storage.saveTranslations(this.translations());
    if (this.selectedLocale() === locale) {
      this.selectedLocale.set(null);
    }
    this.snackBar.open('Locale removed', 'OK', { duration: 2000 });
  }

  addEntry(): void {
    const key = this.newKey().trim();
    const val = this.newValue().trim();
    const locale = this.selectedLocale();
    if (!key || !locale) return;

    this.translations.update((all) =>
      all.map((t) => (t.locale === locale ? { ...t, entries: { ...t.entries, [key]: val } } : t)),
    );
    this.storage.saveTranslations(this.translations());
    this.newKey.set('');
    this.newValue.set('');
  }

  updateEntry(key: string, value: string): void {
    const locale = this.selectedLocale();
    if (!locale) return;

    this.translations.update((all) =>
      all.map((t) => (t.locale === locale ? { ...t, entries: { ...t.entries, [key]: value } } : t)),
    );
    this.storage.saveTranslations(this.translations());
  }

  removeEntry(key: string): void {
    const locale = this.selectedLocale();
    if (!locale) return;

    this.translations.update((all) =>
      all.map((t) => {
        if (t.locale !== locale) return t;
        const entries = { ...t.entries };
        delete entries[key];
        return { ...t, entries };
      }),
    );
    this.storage.saveTranslations(this.translations());
  }

  save(): void {
    this.saving.set(true);
    this.storage.saveTranslationsAsync(this.translations()).subscribe({
      next: () => {
        this.saving.set(false);
        this.snackBar.open('Translations saved to server', 'OK', { duration: 2000 });
      },
      error: () => {
        this.saving.set(false);
        this.snackBar.open('Save failed — cached locally', 'Dismiss', { duration: 4000 });
      },
    });
  }
}
