import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { PageBuilderShellComponent } from './page-builder-shell.component';
import { SavedPageService } from '@agentic-ui/shared/nuxeo-client';
import { PageConfigValidator, PAGE_TILE_CATALOGUE } from '@agentic-ui/shared/agent-client';

describe('PageBuilderShellComponent', () => {
  let component: PageBuilderShellComponent;
  let fixture: ComponentFixture<PageBuilderShellComponent>;
  let mockSavedPageService: Partial<SavedPageService>;
  let mockValidator: Partial<PageConfigValidator>;
  let mockCatalogue: Partial<ReturnType<typeof PAGE_TILE_CATALOGUE>>;

  beforeEach(async () => {
    mockSavedPageService = {
      getSavedPages: vi.fn(() => of([])),
      getSavedPageById: vi.fn(() =>
        of({
          id: 'test-id',
          title: 'Test Page',
          modified: new Date().toISOString(),
          creator: 'test-user',
          config: { tiles: [] },
        }),
      ),
      saveSavedPage: vi.fn(() => of({ id: 'new-id' })),
      updateSavedPage: vi.fn(() => of({})),
      deleteSavedPage: vi.fn(() => of({})),
    };

    mockValidator = {
      validate: vi.fn(() => ({ valid: true })),
    };

    mockCatalogue = {
      get: vi.fn(() => undefined),
      all: vi.fn(() => []),
    };

    await TestBed.configureTestingModule({
      imports: [PageBuilderShellComponent, NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: SavedPageService, useValue: mockSavedPageService },
        { provide: PageConfigValidator, useValue: mockValidator },
        { provide: PAGE_TILE_CATALOGUE, useValue: mockCatalogue },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PageBuilderShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start in list view mode', () => {
    expect(component.viewMode()).toBe('list');
  });

  it('should load saved pages on init', () => {
    expect(mockSavedPageService.getSavedPages).toHaveBeenCalled();
  });

  it('should create new page with empty config', () => {
    component.newPage();
    expect(component.currentConfig().tiles).toEqual([]);
    expect(component.dirty()).toBe(false);
  });

  it('should mark as dirty when config changes', () => {
    component.onConfigChanged({ tiles: [] });
    expect(component.dirty()).toBe(true);
  });

  it('should mark as dirty when metadata form changes', () => {
    component.metadataForm.patchValue({ title: 'Test Page' });
    expect(component.dirty()).toBe(true);
  });

  it('should require title for save', () => {
    component.metadataForm.patchValue({ title: '' });
    component.save();
    expect(component.error()).toContain('valid title');
  });

  it('should validate title length', () => {
    const longTitle = 'a'.repeat(129);
    component.metadataForm.patchValue({ title: longTitle });
    expect(component.metadataForm.get('title')?.valid).toBe(false);
  });

  it('should validate description length', () => {
    const longDescription = 'a'.repeat(501);
    component.metadataForm.patchValue({ description: longDescription });
    expect(component.metadataForm.get('description')?.valid).toBe(false);
  });

  it('should not save with invalid config', () => {
    if (mockValidator.validate) {
      (mockValidator.validate as ReturnType<typeof vi.fn>).mockReturnValue({
        valid: false,
        error: 'invalid-placement',
        details: 'Tile overlaps',
      });
    }

    component.metadataForm.patchValue({ title: 'Test' });
    component.save();

    expect(mockSavedPageService.saveSavedPage).not.toHaveBeenCalled();
    expect(component.error()).toContain('Invalid page configuration');
  });

  it('should handle keyboard shortcuts', () => {
    const saveSpy = vi.spyOn(component, 'save');
    const previewSpy = vi.spyOn(component, 'preview');

    component['viewMode'].set('editor');

    // Ctrl+S
    const saveEvent = new KeyboardEvent('keydown', { key: 's', ctrlKey: true });
    const savePreventDefaultSpy = vi.spyOn(saveEvent, 'preventDefault');
    component.handleKeyboardEvent(saveEvent);
    expect(saveSpy).toHaveBeenCalled();
    expect(savePreventDefaultSpy).toHaveBeenCalled();

    // Ctrl+P
    const previewEvent = new KeyboardEvent('keydown', { key: 'p', ctrlKey: true });
    const previewPreventDefaultSpy = vi.spyOn(previewEvent, 'preventDefault');
    component.handleKeyboardEvent(previewEvent);
    expect(previewSpy).toHaveBeenCalled();
    expect(previewPreventDefaultSpy).toHaveBeenCalled();
  });

  it('should delete selected tile on Delete key', () => {
    component['currentConfig'].set({
      tiles: [
        {
          tileName: 'test-tile',
          config: {},
          placement: { row: 1, col: 1, width: 12, height: 1 },
        },
      ],
    });
    component['selectedTileIndex'].set(0);
    component['viewMode'].set('editor');

    const deleteEvent = new KeyboardEvent('keydown', { key: 'Delete' });
    const preventDefaultSpy = vi.spyOn(deleteEvent, 'preventDefault');
    component.handleKeyboardEvent(deleteEvent);

    expect(component.currentConfig().tiles.length).toBe(0);
    expect(component.selectedTileIndex()).toBe(-1);
    expect(component.dirty()).toBe(true);
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should prompt before navigation with unsaved changes', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    component['dirty'].set(true);

    const canDeactivate = component.canDeactivate();
    expect(confirmSpy).toHaveBeenCalled();
    expect(canDeactivate).toBe(false);
  });

  it('should allow navigation without unsaved changes', () => {
    component['dirty'].set(false);
    const canDeactivate = component.canDeactivate();
    expect(canDeactivate).toBe(true);
  });
});
