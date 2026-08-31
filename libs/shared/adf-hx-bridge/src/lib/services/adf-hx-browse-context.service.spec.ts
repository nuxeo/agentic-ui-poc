import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { AdfHxBrowseContextService } from './adf-hx-browse-context.service';

describe('AdfHxBrowseContextService', () => {
  let service: AdfHxBrowseContextService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdfHxBrowseContextService);
  });

  it('starts at the repository root', () => {
    expect(service.contextPath()).toBe('/');
    expect(service.treeRefreshTick()).toBe(0);
  });

  it('normalizes a trailing slash rather than storing two spellings of one folder', () => {
    // The tree compares the context path against node paths by string; storing
    // `/default-domain/` would make the active folder match nothing.
    service.setFromNuxeoPath('/default-domain/workspaces/');
    expect(service.contextPath()).toBe('/default-domain/workspaces');
  });

  it('treats an empty path as the repository root', () => {
    service.setFromNuxeoPath('/default-domain');
    service.setFromNuxeoPath('');
    expect(service.contextPath()).toBe('/');
  });

  it('does not write the signal again when the new path is equivalent to the current one', () => {
    // The write is guarded so an equivalent path does not retrigger every effect watching
    // the context — the nav tree reloads from one, and a redundant reload is a visible flash.
    service.setFromNuxeoPath('/default-domain');
    const before = service.contextPath();
    service.setFromNuxeoPath('/default-domain/');
    expect(service.contextPath()).toBe(before);
  });

  it('updates the signal when the path genuinely changes', () => {
    service.setFromNuxeoPath('/default-domain');
    service.setFromNuxeoPath('/default-domain/workspaces');
    expect(service.contextPath()).toBe('/default-domain/workspaces');
  });

  it('reads the path out of an adf-hx browse router URL', () => {
    service.setFromRouterUrl('/browse-adf-hx?path=/default-domain/workspaces/ws');
    expect(service.contextPath()).toBe('/default-domain/workspaces/ws');
  });

  it('falls back to the root for a router URL carrying no path', () => {
    service.setFromNuxeoPath('/default-domain');
    service.setFromRouterUrl('/browse-adf-hx');
    expect(service.contextPath()).toBe('/');
  });

  it('resets to the root unconditionally', () => {
    service.setFromNuxeoPath('/default-domain/workspaces');
    service.resetContext();
    expect(service.contextPath()).toBe('/');
  });

  it('advances the refresh tick by one on each request, so repeated refreshes both fire', () => {
    // The tick is what a refresh button drives. A boolean toggle would coalesce two
    // consecutive refreshes into no change at all.
    service.requestTreeRefresh();
    expect(service.treeRefreshTick()).toBe(1);
    service.requestTreeRefresh();
    service.requestTreeRefresh();
    expect(service.treeRefreshTick()).toBe(3);
  });

  it('leaves the context path alone when the tree is refreshed', () => {
    service.setFromNuxeoPath('/default-domain/workspaces');
    service.requestTreeRefresh();
    expect(service.contextPath()).toBe('/default-domain/workspaces');
  });
});
