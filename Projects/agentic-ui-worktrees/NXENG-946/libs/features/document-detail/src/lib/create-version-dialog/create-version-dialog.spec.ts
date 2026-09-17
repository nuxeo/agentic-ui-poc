import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError, type Observable } from 'rxjs';
import { vi } from 'vitest';

import {
  DocumentDetailService,
  PERMISSION_DENIED_MESSAGE,
  type NuxeoDocument,
} from '@nuxeo-satori/platform/nuxeo-client';

import {
  CreateVersionDialogComponent,
  type CreateVersionDialogData,
} from './create-version-dialog';

function docWith(overrides: Partial<NuxeoDocument> = {}): NuxeoDocument {
  return {
    uid: 'doc-1',
    title: 'Quarterly report',
    type: 'File',
    path: '/default-domain/workspaces/ws/doc',
    lastModified: '2026-08-01T00:00:00.000Z',
    properties: {},
    ...overrides,
  };
}

const mockDialogRef = {
  close: vi.fn(),
};

const mockSnackBar = {
  open: vi.fn(),
};

const mockDetailService = {
  createVersion: vi.fn((_uid: string, _increment: 'Major' | 'Minor'): Observable<NuxeoDocument> =>
    of(docWith()),
  ),
};

const dialogData: CreateVersionDialogData = {
  documentUid: 'doc-1',
  documentTitle: 'Quarterly report',
  currentMajor: 2,
  currentMinor: 4,
};

describe('CreateVersionDialogComponent', () => {
  let component: CreateVersionDialogComponent;
  let fixture: ComponentFixture<CreateVersionDialogComponent>;

  const versionDoc = docWith({ uid: 'ver-1' });

  beforeEach(async () => {
    vi.clearAllMocks();
    // `vi.clearAllMocks()` does not undo `mockReturnValue`, so an error observable stubbed by
    // one test would otherwise be the implementation for every test after it.
    mockDetailService.createVersion.mockReturnValue(of(versionDoc));

    await TestBed.configureTestingModule({
      imports: [CreateVersionDialogComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        { provide: DocumentDetailService, useValue: mockDetailService },
        { provide: MatSnackBar, useValue: mockSnackBar },
      ],
    })
      .overrideComponent(CreateVersionDialogComponent, {
        set: { imports: [], template: '<div></div>' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(CreateVersionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('defaults to a major increment', () => {
    expect(component.increment).toBe('Major');
    expect(component.saving()).toBe(false);
  });

  it('creates a major version and announces the next major label', () => {
    component.increment = 'Major';

    component.create();

    expect(mockDetailService.createVersion).toHaveBeenCalledWith('doc-1', 'Major');
    // 2.4 -> 3.0, not 3.4: a major bump resets the minor.
    expect(mockSnackBar.open).toHaveBeenCalledWith('Version 3.0 created', 'OK', {
      duration: 3000,
    });
    expect(mockDialogRef.close).toHaveBeenCalledWith(versionDoc);
    expect(component.saving()).toBe(false);
  });

  it('creates a minor version and announces the next minor label', () => {
    component.increment = 'Minor';

    component.create();

    expect(mockDetailService.createVersion).toHaveBeenCalledWith('doc-1', 'Minor');
    expect(mockSnackBar.open).toHaveBeenCalledWith('Version 2.5 created', 'OK', {
      duration: 3000,
    });
    expect(mockDialogRef.close).toHaveBeenCalledWith(versionDoc);
  });

  it('refuses to create while a create is already in flight', () => {
    component.saving.set(true);

    component.create();

    expect(mockDetailService.createVersion).not.toHaveBeenCalled();
  });

  it('reports a permission failure with the shared denied message', () => {
    mockDetailService.createVersion.mockReturnValue(throwError(() => ({ status: 403 })));

    component.create();

    expect(mockSnackBar.open).toHaveBeenCalledWith(PERMISSION_DENIED_MESSAGE, 'OK', {
      duration: 3000,
    });
    // Releasing `saving` is what allows a retry; leaving it set disables the button for good.
    expect(component.saving()).toBe(false);
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('reports any other failure generically and stays open', () => {
    mockDetailService.createVersion.mockReturnValue(throwError(() => ({ status: 500 })));

    component.create();

    expect(mockSnackBar.open).toHaveBeenCalledWith('Failed to create version', 'OK', {
      duration: 3000,
    });
    expect(component.saving()).toBe(false);
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });
});
