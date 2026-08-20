import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CdkDropListGroup } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { catchError, of } from 'rxjs';

import {
  SavedPageService,
  type SavedPageListEntry,
  type SavedPageDocument,
} from '@agentic-ui/shared/nuxeo-client';
import {
  type PageConfig,
  type PageTileDefinition,
  type PageTileInstance,
  PageConfigValidator,
  PAGE_TILE_CATALOGUE,
} from '@agentic-ui/shared/agent-client';
import { ShareSavedPageDialogComponent } from '@agentic-ui/shared/ui';

import { PagePaletteComponent } from '../page-palette/page-palette.component';
import { PageGridEditorComponent } from '../page-grid-editor/page-grid-editor.component';
import { TileConfigFormComponent } from '../tile-config-form/tile-config-form.component';
import { PagePreviewDialogComponent } from '../page-preview-dialog/page-preview-dialog.component';

/**
 * Main page builder shell with three-panel layout and toolbar.
 *
 * This component orchestrates the page building experience:
 * - Left panel: PagePaletteComponent (tile catalogue)
 * - Center panel: PageGridEditorComponent (canvas)
 * - Right panel: TileConfigFormComponent (selected tile config)
 * - Top toolbar: actions (new, save, load, share, delete, preview)
 * - Page metadata form: title and description
 *
 * ## State management
 *
 * - currentPage: full page document (loaded from service or new)
 * - currentConfig: page tiles and layout (synced with editor)
 * - selectedTileIndex: which tile is selected for config editing
 * - dirty: whether there are unsaved changes
 * - saving/loading: async operation states
 *
 * ## Routes
 *
 * - /page-builder → list saved pages
 * - /page-builder/new → blank editor
 * - /page-builder/:pageId → load existing page
 *
 * ## Keyboard shortcuts
 *
 * - Ctrl+S: Save
 * - Ctrl+P: Preview
 * - Delete: Remove selected tile
 *
 * ## Auto-save
 *
 * Draft pages are auto-saved to localStorage every 30 seconds.
 * On navigation, prompts if there are unsaved changes.
 */
@Component({
  selector: 'lib-page-builder-shell',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CdkDropListGroup,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatCardModule,
    MatDialogModule,
    MatTooltipModule,
    PagePaletteComponent,
    PageGridEditorComponent,
    TileConfigFormComponent,
  ],
  templateUrl: './page-builder-shell.component.html',
  styleUrl: './page-builder-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageBuilderShellComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly savedPageService = inject(SavedPageService);
  private readonly validator = inject(PageConfigValidator);
  private readonly catalogue = inject(PAGE_TILE_CATALOGUE);
  private readonly destroyRef = inject(DestroyRef);

  /** Current page being edited (null for new page) */
  readonly currentPage = signal<SavedPageDocument | null>(null);

  /** Current page configuration (tiles and layout) */
  readonly currentConfig = signal<PageConfig>({ tiles: [] });

  /** Index of selected tile in the grid (-1 for none) */
  readonly selectedTileIndex = signal<number>(-1);

  /** Selected tile instance for config editing */
  readonly selectedTile = computed<PageTileInstance | null>(() => {
    const index = this.selectedTileIndex();
    const tiles = this.currentConfig().tiles;
    return index >= 0 && index < tiles.length ? tiles[index] : null;
  });

  /** Selected tile definition (looked up from catalogue) */
  readonly selectedTileDef = computed<PageTileDefinition | null>(() => {
    const tile = this.selectedTile();
    if (!tile) return null;
    return this.catalogue.get(tile.tileName) ?? null;
  });

  /** Whether there are unsaved changes */
  readonly dirty = signal(false);

  /** Loading state for async operations */
  readonly loading = signal(false);

  /** Saving state */
  readonly saving = signal(false);

  /** Error message for display */
  readonly error = signal<string | null>(null);

  /** View mode: 'list' | 'editor' */
  readonly viewMode = signal<'list' | 'editor'>('list');

  /** List of saved pages (for list view) */
  readonly savedPages = signal<SavedPageListEntry[]>([]);

  /** Page metadata form */
  readonly metadataForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(128)]],
    description: ['', [Validators.maxLength(500)]],
  });

  constructor() {
    // Load page based on route (run once on init)
    const params = this.route.snapshot.paramMap;
    const pageId = params.get('pageId');

    if (pageId) {
      this.viewMode.set('editor');
      this.loadPage(pageId);
    } else if (this.route.snapshot.url[0]?.path === 'new') {
      this.viewMode.set('editor');
      this.newPage();
    } else {
      this.viewMode.set('list');
      this.loadSavedPagesList();
    }

    // Track form changes for dirty state
    this.metadataForm.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.dirty.set(true);
    });

    // Auto-save draft to localStorage every 30 seconds
    if (typeof window !== 'undefined') {
      setInterval(() => {
        if (this.dirty() && this.viewMode() === 'editor') {
          this.saveDraftToLocalStorage();
        }
      }, 30000);
    }
  }

  /**
   * Load saved pages list for display.
   */
  loadSavedPagesList(): void {
    this.loading.set(true);
    this.error.set(null);

    this.savedPageService
      .getSavedPages()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => {
          this.error.set('Failed to load saved pages');
          console.error('Error loading saved pages:', err);
          return of<SavedPageListEntry[]>([]);
        }),
      )
      .subscribe((pages) => {
        this.savedPages.set(pages);
        this.loading.set(false);
      });
  }

  /**
   * Load a page by ID for editing.
   */
  private loadPage(pageId: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.savedPageService
      .getSavedPageById(pageId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => {
          this.error.set('Failed to load page');
          console.error('Error loading page:', err);
          return of<SavedPageDocument | null>(null);
        }),
      )
      .subscribe((page) => {
        if (page) {
          this.currentPage.set(page);
          this.currentConfig.set(page.config);
          this.metadataForm.patchValue({
            title: page.title,
            description: '',
          });
          this.dirty.set(false);
        }
        this.loading.set(false);
      });
  }

  /**
   * Create a new blank page.
   */
  newPage(): void {
    // Check for unsaved changes
    if (this.dirty()) {
      const confirmed = confirm('You have unsaved changes. Continue without saving?');
      if (!confirmed) return;
    }

    this.currentPage.set(null);
    this.currentConfig.set({ tiles: [] });
    this.selectedTileIndex.set(-1);
    this.metadataForm.reset({ title: '', description: '' });
    this.dirty.set(false);
    this.error.set(null);
  }

  /**
   * Save current page.
   */
  save(): void {
    if (this.saving()) return;

    // Validate form
    if (!this.metadataForm.valid) {
      this.error.set('Please enter a valid title (1-128 characters)');
      this.metadataForm.markAllAsTouched();
      return;
    }

    // Validate page config
    const config = this.currentConfig();
    const validationResult = this.validator.validate(config, this.catalogue);

    if (!validationResult.valid) {
      this.error.set(`Invalid page configuration: ${validationResult.details}`);
      return;
    }

    this.saving.set(true);
    this.error.set(null);

    const title = this.metadataForm.value.title ?? '';
    const description = this.metadataForm.value.description ?? '';

    const currentPage = this.currentPage();
    const saveOp = currentPage
      ? this.savedPageService.updateSavedPage(currentPage.id, { title, description, config })
      : this.savedPageService.saveSavedPage({ title, description, config });

    saveOp
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => {
          this.error.set('Failed to save page');
          console.error('Error saving page:', err);
          return of(null);
        }),
      )
      .subscribe((result) => {
        this.saving.set(false);
        if (result) {
          this.dirty.set(false);
          this.clearDraftFromLocalStorage();

          // If new page, navigate to its editor
          if (!currentPage && typeof result === 'object' && result !== null && 'id' in result) {
            this.router.navigate(['/page-builder', (result as any).id]);
          }
        }
      });
  }

  /**
   * Load a saved page from the list.
   */
  loadSavedPage(page: SavedPageListEntry): void {
    this.router.navigate(['/page-builder', page.id]);
  }

  /**
   * Delete current page.
   */
  deletePage(): void {
    const currentPage = this.currentPage();
    if (!currentPage) return;

    const confirmed = confirm(`Delete page "${currentPage.title}"? This cannot be undone.`);
    if (!confirmed) return;

    this.saving.set(true);
    this.savedPageService
      .deleteSavedPage(currentPage.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((err) => {
          this.error.set('Failed to delete page');
          console.error('Error deleting page:', err);
          return of(null);
        }),
      )
      .subscribe(() => {
        this.saving.set(false);
        this.router.navigate(['/page-builder']);
      });
  }

  /**
   * Open share dialog for current page.
   */
  share(): void {
    const currentPage = this.currentPage();
    if (!currentPage) {
      this.error.set('Cannot share unsaved page. Please save first.');
      return;
    }

    this.dialog.open(ShareSavedPageDialogComponent, {
      width: '720px',
      data: {
        title: currentPage.title,
        id: currentPage.id,
      },
    });
  }

  /**
   * Open preview dialog.
   */
  preview(): void {
    // Validate first
    const config = this.currentConfig();
    if (!config.tiles.length) {
      this.error.set('Cannot preview empty page');
      return;
    }

    this.dialog.open(PagePreviewDialogComponent, {
      width: '90vw',
      height: '90vh',
      maxWidth: '1400px',
      data: { config },
    });
  }

  /**
   * Handle tile selected from palette.
   */
  onTileSelectedFromPalette(_tileDef: PageTileDefinition): void {
    // The grid editor will handle adding the tile
    // Palette selection is informational only; drag-drop handles actual tile creation
  }

  /**
   * Handle config change from editor.
   */
  onConfigChanged(config: PageConfig): void {
    this.currentConfig.set(config);
    this.dirty.set(true);
  }

  /**
   * Handle tile selection in grid.
   */
  onTileSelected(index: number): void {
    this.selectedTileIndex.set(index);
  }

  /**
   * Handle tile config change from form.
   */
  onTileConfigChanged(newConfig: unknown): void {
    const index = this.selectedTileIndex();
    if (index < 0) return;

    const tiles = [...this.currentConfig().tiles];
    tiles[index] = { ...tiles[index], config: newConfig as object };
    this.currentConfig.set({ tiles });
    this.dirty.set(true);
  }

  /**
   * Save draft to localStorage.
   */
  private saveDraftToLocalStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const draft = {
        config: this.currentConfig(),
        metadata: this.metadataForm.value,
        timestamp: Date.now(),
      };
      localStorage.setItem('page-builder-draft', JSON.stringify(draft));
    } catch (err) {
      console.error('Failed to save draft to localStorage:', err);
    }
  }

  /**
   * Clear draft from localStorage.
   */
  private clearDraftFromLocalStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.removeItem('page-builder-draft');
    } catch (err) {
      console.error('Failed to clear draft from localStorage:', err);
    }
  }

  /**
   * Keyboard shortcuts.
   */
  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (this.viewMode() !== 'editor') return;

    // Ctrl+S or Cmd+S: Save
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      this.save();
      return;
    }

    // Ctrl+P or Cmd+P: Preview
    if ((event.ctrlKey || event.metaKey) && event.key === 'p') {
      event.preventDefault();
      this.preview();
      return;
    }

    // Delete: Remove selected tile
    if (event.key === 'Delete' && this.selectedTileIndex() >= 0) {
      event.preventDefault();
      const tiles = [...this.currentConfig().tiles];
      tiles.splice(this.selectedTileIndex(), 1);
      this.currentConfig.set({ tiles });
      this.selectedTileIndex.set(-1);
      this.dirty.set(true);
    }
  }

  /**
   * Can navigate away? Prompt if unsaved changes.
   */
  canDeactivate(): boolean {
    if (this.dirty()) {
      return confirm('You have unsaved changes. Leave without saving?');
    }
    return true;
  }
}
