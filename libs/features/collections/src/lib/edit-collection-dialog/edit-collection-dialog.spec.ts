import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { vi } from 'vitest';

import {
  CollectionService,
  DirectoryService,
  type L10nDirectoryEntry,
  type NuxeoDocument,
} from '@nuxeo-satori/platform/nuxeo-client';

import { EditCollectionDialogComponent } from './edit-collection-dialog';

function l10n(id: string, parent: string, labelEn: string): L10nDirectoryEntry {
  return {
    id,
    directoryName: 'l10ncoverage',
    properties: { id, parent, ordering: 0, obsolete: 0, label_en: labelEn },
  };
}

const coverageEntries: L10nDirectoryEntry[] = [
  l10n('africa', '', 'Africa'),
  l10n('tanzania', 'africa', 'Tanzania'),
];

const subjectEntries: L10nDirectoryEntry[] = [
  l10n('art', '', 'Art'),
  l10n('cinema', 'art', 'Cinema'),
];

const mockDialogRef = { close: vi.fn() };

const mockDirectoryService = {
  getEntries: vi.fn(() => of([])),
  getAllL10nEntries: vi.fn((name: string) =>
    of(name === 'l10nsubjects' ? subjectEntries : coverageEntries),
  ),
};

const mockCollectionService = { updateProperties: vi.fn(() => of({} as NuxeoDocument)) };

const document: NuxeoDocument = {
  uid: 'col-1',
  title: 'My Collection',
  type: 'Collection',
  path: '/default-domain/collections/my-collection',
  lastModified: '2026-01-01T00:00:00.000Z',
  properties: {},
};

async function flushAsync(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

// NXSAT-192: hierarchical Coverage/Subjects must expose child entries grouped by parent.
describe('EditCollectionDialogComponent (NXSAT-192)', () => {
  let component: EditCollectionDialogComponent;
  let fixture: ComponentFixture<EditCollectionDialogComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [EditCollectionDialogComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { document } },
        { provide: DirectoryService, useValue: mockDirectoryService },
        { provide: CollectionService, useValue: mockCollectionService },
      ],
    })
      .overrideComponent(EditCollectionDialogComponent, {
        set: { imports: [], template: '<div></div>' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(EditCollectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await flushAsync();
  });

  it('loads all l10n entries (including children), not just top-level parents', () => {
    expect(mockDirectoryService.getAllL10nEntries).toHaveBeenCalledWith('l10nsubjects');
    expect(mockDirectoryService.getAllL10nEntries).toHaveBeenCalledWith('l10ncoverage');
    expect(component.coverageEntries().map((e) => e.id)).toContain('tanzania');
    expect(component.subjectEntries().map((e) => e.id)).toContain('cinema');
  });

  it('groups coverage children under their parent label for the dropdown', () => {
    const groups = component.groupedCoverageOptions();
    expect(groups).toHaveLength(1);
    expect(groups[0].parentLabel).toBe('Africa');
    expect(groups[0].entries.map((e) => e.id)).toEqual(['tanzania']);
  });

  it('renders the selected child coverage as Parent/Child', () => {
    component.coverage = 'tanzania';
    expect(component.coveragePillLabel('tanzania')).toBe('Africa/Tanzania');
  });
});
