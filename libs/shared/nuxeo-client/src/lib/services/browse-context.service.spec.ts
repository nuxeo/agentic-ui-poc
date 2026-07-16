import { TestBed } from '@angular/core/testing';

import { BrowseContextService } from './browse-context.service';

describe('BrowseContextService', () => {
  let service: BrowseContextService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BrowseContextService);
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
    expect(service.contextPath()).toBe('/default-domain/workspaces/demo');
    service.resetContext();
    expect(service.contextPath()).toBe('/');
  });
});
