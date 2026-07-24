import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { vi } from 'vitest';

import {
  BrowseService,
  DirectoryService,
  type L10nDirectoryEntry,
  type NuxeoDocument,
} from '@agentic-ui/shared/nuxeo-client';

import { EditMetadataDialogComponent, type EditMetadataDialogData } from './edit-metadata-dialog';

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

const mockBrowseService = { updateDocument: vi.fn(() => of({} as NuxeoDocument)) };

const dialogData: EditMetadataDialogData = {
  uid: 'doc-1',
  title: 'Doc',
  description: '',
  nature: '',
  subjects: [],
  coverage: '',
  expires: null,
};

async function flushAsync(): Promise<void> {
  await Promise.resolve();
  await Promise.resolve();
}

// NXSAT-192: hierarchical Coverage/Subjects must expose child entries grouped by parent.
describe('EditMetadataDialogComponent (NXSAT-192)', () => {
  let component: EditMetadataDialogComponent;
  let fixture: ComponentFixture<EditMetadataDialogComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [EditMetadataDialogComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: DirectoryService, useValue: mockDirectoryService },
        { provide: BrowseService, useValue: mockBrowseService },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    })
      .overrideComponent(EditMetadataDialogComponent, {
        set: { imports: [], template: '<div></div>' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(EditMetadataDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await flushAsync();
  });

  it('loads all l10n entries (including children), not just top-level parents', () => {
    expect(mockDirectoryService.getAllL10nEntries).toHaveBeenCalledWith('l10nsubjects');
    expect(mockDirectoryService.getAllL10nEntries).toHaveBeenCalledWith('l10ncoverage');
    expect(component.coverageOptions().map((e) => e.id)).toContain('tanzania');
    expect(component.subjectOptions().map((e) => e.id)).toContain('cinema');
  });

  it('groups subject children under their parent label for the dropdown', () => {
    const groups = component.groupedSubjectOptions();
    expect(groups).toHaveLength(1);
    expect(groups[0].parentLabel).toBe('Art');
    expect(groups[0].entries.map((e) => e.id)).toEqual(['cinema']);
  });

  it('renders the selected child coverage as Parent/Child', () => {
    component.coverage = 'tanzania';
    expect(component.coveragePillLabel('tanzania')).toBe('Africa/Tanzania');
  });
});
