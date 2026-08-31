import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';

import {
  CURRENT_USERNAME,
  NUXEO_SERVER_URL,
  NuxeoDriveService,
} from '@nuxeo-satori/platform/nuxeo-client';

import { BrowseDriveDialogComponent, type BrowseDriveDialogData } from './drive-dialog';

const SERVER_URL = 'http://localhost:8080/nuxeo';

describe('BrowseDriveDialogComponent', () => {
  let fixture: ComponentFixture<BrowseDriveDialogComponent>;
  let component: BrowseDriveDialogComponent;
  let httpMock: HttpTestingController;
  let driveService: NuxeoDriveService;
  let openDriveUrl: MockInstance<NuxeoDriveService['openDriveUrl']>;
  const close = vi.fn();

  async function setup(data: BrowseDriveDialogData): Promise<void> {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [BrowseDriveDialogComponent, HttpClientTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: MatDialogRef, useValue: { close } },
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: NUXEO_SERVER_URL, useValue: SERVER_URL },
        { provide: CURRENT_USERNAME, useValue: () => 'jdoe' },
      ],
    })
      .overrideComponent(BrowseDriveDialogComponent, {
        set: { imports: [], template: '<div></div>' },
      })
      .compileComponents();

    httpMock = TestBed.inject(HttpTestingController);
    driveService = TestBed.inject(NuxeoDriveService);
    openDriveUrl = vi.spyOn(driveService, 'openDriveUrl').mockImplementation(() => undefined);

    fixture = TestBed.createComponent(BrowseDriveDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function answerTokenProbe(entries: unknown[]): void {
    const req = httpMock.expectOne((r) => r.url.endsWith('/api/v1/token'));
    expect(req.request.params.get('application')).toBe('Nuxeo Drive');
    req.flush({ entries });
  }

  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('launches Drive with a direct-transfer URL built from the folder path when a token exists', async () => {
    await setup({ docUid: 'doc-1', docPath: '/default-domain/workspaces/ws' });
    answerTokenProbe([{ id: 'token-1' }]);

    expect(openDriveUrl).toHaveBeenCalledWith(
      'nxdrive://direct-transfer/http/localhost:8080/nuxeo/default-domain/workspaces/ws',
    );
    expect(close).toHaveBeenCalledWith();
    httpMock.verify();
  });

  it('never puts a credential in the Drive URL query string', async () => {
    await setup({ docUid: 'doc-1', docPath: '/default-domain/workspaces/ws' });
    answerTokenProbe([{ id: 'token-1' }]);

    const [url] = openDriveUrl.mock.calls[0];
    expect(url).not.toContain('?');
    expect(url).not.toMatch(/password|passwd|token|secret|Basic /i);
    httpMock.verify();
  });

  it('falls back to the repository root when the dialog is opened without a path', async () => {
    await setup({ docUid: 'doc-1', docPath: '' });
    answerTokenProbe([{ id: 'token-1' }]);

    expect(openDriveUrl).toHaveBeenCalledWith(
      'nxdrive://direct-transfer/http/localhost:8080/nuxeo/',
    );
    httpMock.verify();
  });

  it('shows the download table instead of launching when Drive has no token', async () => {
    await setup({ docUid: 'doc-1', docPath: '/ws' });
    expect(component.checking()).toBe(true);

    answerTokenProbe([]);

    expect(component.checking()).toBe(false);
    expect(openDriveUrl).not.toHaveBeenCalled();
    expect(close).not.toHaveBeenCalled();
    expect(component.packages.map((p) => p.platform)).toEqual(['Linux', 'macOS', 'Windows']);
    httpMock.verify();
  });

  it('shows the download table when the token probe fails', async () => {
    await setup({ docUid: 'doc-1', docPath: '/ws' });
    httpMock
      .expectOne((r) => r.url.endsWith('/api/v1/token'))
      .flush('boom', { status: 500, statusText: 'Server Error' });

    expect(component.checking()).toBe(false);
    expect(openDriveUrl).not.toHaveBeenCalled();
    expect(close).not.toHaveBeenCalled();
    httpMock.verify();
  });

  it('offers each package over https from the community download host', async () => {
    await setup({ docUid: 'doc-1', docPath: '/ws' });
    answerTokenProbe([]);

    for (const pkg of component.packages) {
      expect(pkg.url.startsWith('https://community.nuxeo.com/static/drive-updates/release/')).toBe(
        true,
      );
    }
    httpMock.verify();
  });

  it('close() dismisses the dialog without a result', async () => {
    await setup({ docUid: 'doc-1', docPath: '/ws' });
    answerTokenProbe([]);

    component.close();

    expect(close).toHaveBeenCalledWith();
    httpMock.verify();
  });
});
