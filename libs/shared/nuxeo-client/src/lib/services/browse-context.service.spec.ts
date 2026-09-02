import { TestBed } from '@angular/core/testing';

import { BrowseContextService } from './browse-context.service';

describe('BrowseContextService', () => {
  let service: BrowseContextService;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(BrowseContextService);
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('requestTreeRefresh increments treeRefreshTick', () => {
    expect(service.treeRefreshTick()).toBe(0);
    service.requestTreeRefresh();
    expect(service.treeRefreshTick()).toBe(1);
    service.requestTreeRefresh();
    expect(service.treeRefreshTick()).toBe(2);
  });

  it('requestContentRefresh increments contentRefreshTick', () => {
    expect(service.contentRefreshTick()).toBe(0);
    service.requestContentRefresh();
    expect(service.contentRefreshTick()).toBe(1);
    service.requestContentRefresh();
    expect(service.contentRefreshTick()).toBe(2);
  });

  it('resetContext restores repository root path', () => {
    service.setFromNuxeoPath('/default-domain/workspaces/demo');
    service.setSharedDocument({ uid: 'doc-1', title: 'Shared file' });
    expect(service.contextPath()).toBe('/default-domain/workspaces/demo');
    expect(service.sharedDocument()?.uid).toBe('doc-1');
    service.requestTreeRefresh();
    service.requestContentRefresh();
    service.resetContext();
    expect(service.contextPath()).toBe('/');
    expect(service.sharedDocument()).toBeNull();
    expect(service.treeRefreshTick()).toBe(0);
    expect(service.contentRefreshTick()).toBe(0);
    expect(service.clipboardPasteTick()).toBe(0);
    expect(sessionStorage.getItem('agentic_ui_external_share_doc')).toBeNull();
  });

  it('setSharedDocument preserves the first share target for the session', () => {
    service.setSharedDocument({ uid: 'doc-1', title: 'Shared folder' });
    service.setSharedDocument({ uid: 'doc-2', title: 'Child document' });

    expect(service.sharedDocument()).toEqual({ uid: 'doc-1', title: 'Shared folder' });
  });

  it('setSharedDocument persists and restores across service instances', () => {
    service.setSharedDocument({ uid: 'doc-1', title: 'Shared file' });

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const restored = TestBed.inject(BrowseContextService);

    expect(restored.sharedDocument()).toEqual({ uid: 'doc-1', title: 'Shared file' });
  });

  it('notifyClipboardPasteComplete increments ticks and exposes payload once', () => {
    const doc = {
      uid: 'file-1',
      title: 'Report',
      type: 'File',
      path: '/folder/report',
      lastModified: '',
      properties: {},
    };
    service.notifyClipboardPasteComplete({
      targetUid: 'folder-1',
      documents: [doc],
      action: 'copy',
    });
    expect(service.clipboardPasteTick()).toBe(1);
    expect(service.contentRefreshTick()).toBe(0);
    expect(service.consumeClipboardPasteEvent()?.documents[0]?.uid).toBe('file-1');
    expect(service.consumeClipboardPasteEvent()).toBeNull();
  });
});
