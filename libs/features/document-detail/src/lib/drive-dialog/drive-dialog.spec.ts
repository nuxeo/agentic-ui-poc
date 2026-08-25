import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { of, type Observable } from 'rxjs';
import { vi } from 'vitest';

import { NuxeoDriveService } from '@nuxeo-satori/platform/nuxeo-client';

import { DriveDialogComponent, type DriveDialogData } from './drive-dialog';

const mockDialogRef = {
  close: vi.fn(),
};

const mockDriveService = {
  hasDriveToken: vi.fn((): Observable<boolean> => of(false)),
  buildDirectTransferUrl: vi.fn((_docPath: string): string => 'nxdrive://direct-transfer/x'),
  openDriveUrl: vi.fn((_url: string): void => undefined),
};

async function createDialog(data: DriveDialogData): Promise<{
  component: DriveDialogComponent;
  fixture: ComponentFixture<DriveDialogComponent>;
}> {
  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [DriveDialogComponent],
    providers: [
      provideZonelessChangeDetection(),
      { provide: MatDialogRef, useValue: mockDialogRef },
      { provide: MAT_DIALOG_DATA, useValue: data },
      { provide: NuxeoDriveService, useValue: mockDriveService },
    ],
  })
    .overrideComponent(DriveDialogComponent, {
      set: { imports: [], template: '<div></div>' },
    })
    .compileComponents();

  const fixture = TestBed.createComponent(DriveDialogComponent);
  const component = fixture.componentInstance;
  fixture.detectChanges();
  return { component, fixture };
}

const baseData: DriveDialogData = {
  docUid: 'doc-1',
  filename: 'contract.pdf',
  blobUrl: 'blob:mock/1',
  docPath: '/default-domain/workspaces/ws',
};

describe('DriveDialogComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // `vi.clearAllMocks()` clears call history but not `mockReturnValue`, so the token answer
    // is re-stubbed for every test rather than inherited from whichever ran last.
    mockDriveService.hasDriveToken.mockReturnValue(of(false));
    mockDriveService.buildDirectTransferUrl.mockReturnValue(
      'nxdrive://direct-transfer/http/localhost:8080/default-domain/workspaces/ws',
    );
  });

  it('offers the three platform installers', async () => {
    const { component } = await createDialog(baseData);

    expect(component.packages.map((p) => p.platform)).toEqual(['Linux', 'macOS', 'Windows']);
    // The download links are what the user is left with when Drive is not paired, so an https
    // origin is load-bearing, not cosmetic.
    for (const pkg of component.packages) {
      expect(pkg.url.startsWith('https://community.nuxeo.com/')).toBe(true);
    }
  });

  describe('when Nuxeo Drive is already paired', () => {
    beforeEach(() => {
      mockDriveService.hasDriveToken.mockReturnValue(of(true));
    });

    it('hands the document folder to direct-transfer and closes without showing downloads', async () => {
      const { component } = await createDialog(baseData);

      expect(mockDriveService.buildDirectTransferUrl).toHaveBeenCalledWith(
        '/default-domain/workspaces/ws',
      );
      expect(mockDriveService.openDriveUrl).toHaveBeenCalledWith(
        'nxdrive://direct-transfer/http/localhost:8080/default-domain/workspaces/ws',
      );
      expect(mockDialogRef.close).toHaveBeenCalledWith();
      // Still true: the dialog closes rather than falling through to the download table.
      expect(component.checking()).toBe(true);
    });

    it('falls back to the repository root when the caller omits docPath', async () => {
      await createDialog({ docUid: 'doc-1', filename: 'contract.pdf', blobUrl: 'blob:mock/1' });

      expect(mockDriveService.buildDirectTransferUrl).toHaveBeenCalledWith('/');
    });
  });

  describe('when Nuxeo Drive is not paired', () => {
    it('stops checking and does not attempt to launch Drive', async () => {
      mockDriveService.hasDriveToken.mockReturnValue(of(false));

      const { component } = await createDialog(baseData);

      expect(component.checking()).toBe(false);
      expect(mockDriveService.buildDirectTransferUrl).not.toHaveBeenCalled();
      expect(mockDriveService.openDriveUrl).not.toHaveBeenCalled();
      expect(mockDialogRef.close).not.toHaveBeenCalled();
    });
  });

  it('closes on the Close link', async () => {
    const { component } = await createDialog(baseData);

    component.close();

    expect(mockDialogRef.close).toHaveBeenCalledWith();
  });
});
