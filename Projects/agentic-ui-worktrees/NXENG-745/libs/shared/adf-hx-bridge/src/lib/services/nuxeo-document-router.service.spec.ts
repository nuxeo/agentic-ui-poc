import { Location } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter, withHashLocation } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Document } from '@hylandsoftware/hxcs-js-client';

import { NuxeoDocumentRouterService } from './nuxeo-document-router.service';
import { AdfHxBrowseContextService } from './adf-hx-browse-context.service';
import { ROOT_DOCUMENT, SYS_ROOT } from '../tokens/adf-hx-bridge.tokens';

function hxDoc(fields: Partial<Document>): Document {
  return fields as Document;
}

const folder = hxDoc({
  sys_id: 'ws-1',
  sys_isFolderish: true,
  sys_path: '/default-domain/workspaces/ws',
  sys_parentPath: '/default-domain/workspaces',
});

const file = hxDoc({
  sys_id: 'doc-9',
  sys_isFolderish: false,
  sys_path: '/default-domain/workspaces/ws/Invoice',
  sys_parentPath: '/default-domain/workspaces/ws',
});

describe('NuxeoDocumentRouterService', () => {
  let service: NuxeoDocumentRouterService;
  let context: AdfHxBrowseContextService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([], withHashLocation()),
        NuxeoDocumentRouterService,
        AdfHxBrowseContextService,
      ],
    });
    service = TestBed.inject(NuxeoDocumentRouterService);
    context = TestBed.inject(AdfHxBrowseContextService);
    router = TestBed.inject(Router);
  });

  describe('urlFor', () => {
    it('returns a router path for a folder, with the Nuxeo path as a query parameter', () => {
      // A router path, not an href: the adopted breadcrumb feeds this straight into
      // `[routerLink]`, which would treat a leading `#` as a path segment.
      expect(service.urlFor(folder)).toBe(
        '/browse-adf-hx?path=%2Fdefault-domain%2Fworkspaces%2Fws',
      );
    });

    it('returns the bare browse route for the repository root', () => {
      expect(service.urlFor(hxDoc({ ...ROOT_DOCUMENT }))).toBe('/browse-adf-hx');
    });

    it('recognises the root by primary type as well as by id', () => {
      expect(service.urlFor(hxDoc({ sys_id: 'real-uid', sys_primaryType: SYS_ROOT }))).toBe(
        '/browse-adf-hx',
      );
    });

    it('routes a non-folder to the document detail page, tagged to return to adf-hx browse', () => {
      // Without the return mode the back navigation lands on production browse, which is a
      // different page than the one the user came from.
      expect(service.urlFor(file)).toBe('/doc/doc-9?browseReturn=adf-hx');
    });

    it('falls back to the root path for a folder the mapper gave no path', () => {
      expect(service.urlFor(hxDoc({ sys_id: 'x', sys_isFolderish: true }))).toBe('/browse-adf-hx');
    });

    it('produces an empty id rather than the string undefined for a document with no id', () => {
      // `/doc/undefined` would resolve to a route and then 404 against Nuxeo; an empty
      // segment fails at the router instead.
      expect(service.urlFor(hxDoc({ sys_isFolderish: false }))).toBe('/doc/?browseReturn=adf-hx');
    });

    it('prefixes the hash when asked for an absolute URL', () => {
      // `withHashLocation()` means the browser-visible URL carries `#`, and
      // `prepareExternalUrl` is what adds it.
      const absolute = service.urlFor(folder, { absolute: true });
      expect(absolute).toContain('#');
      expect(absolute).toContain('/browse-adf-hx?path=');
      expect(absolute).toBe(TestBed.inject(Location).prepareExternalUrl(service.urlFor(folder)));
    });
  });

  describe('urlForParent', () => {
    it('returns the parent folder route from sys_parentPath', () => {
      expect(service.urlForParent(file)).toBe(
        '/browse-adf-hx?path=%2Fdefault-domain%2Fworkspaces%2Fws',
      );
    });

    it('falls back to the browse root rather than back to the document itself', () => {
      // A parent link that silently points at the current page looks like it worked.
      expect(service.urlForParent(hxDoc({ sys_id: 'orphan' }))).toBe('/browse-adf-hx');
    });

    it('gives the parent of a top-level folder as the repository root', () => {
      expect(service.urlForParent(hxDoc({ sys_id: 'd-1', sys_parentPath: '/' }))).toBe(
        '/browse-adf-hx',
      );
    });

    it('prefixes the hash for an absolute parent URL too', () => {
      expect(service.urlForParent(file, { absolute: true })).toContain('#');
    });
  });

  describe('navigateTo', () => {
    it('sets the browse context to the root and navigates there for the root document', async () => {
      const byUrl = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
      context.setFromNuxeoPath('/default-domain/workspaces');

      service.navigateTo(hxDoc({ ...ROOT_DOCUMENT }));

      // Both halves matter: the tree reads the context signal, the main view reads the URL.
      expect(context.contextPath()).toBe('/');
      expect(byUrl.mock.calls[0][0]).toBe('/browse-adf-hx');
    });

    it('sets the context to the folder path and navigates to the browse route', async () => {
      const byUrl = vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

      service.navigateTo(folder);

      expect(context.contextPath()).toBe('/default-domain/workspaces/ws');
      expect(byUrl.mock.calls[0][0]).toBe(
        '/browse-adf-hx?path=%2Fdefault-domain%2Fworkspaces%2Fws',
      );
    });

    it('normalizes a folder path with a trailing slash before it reaches the context', () => {
      vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
      service.navigateTo(hxDoc({ sys_id: 'x', sys_isFolderish: true, sys_path: '/dd/ws/' }));
      expect(context.contextPath()).toBe('/dd/ws');
    });

    it('navigates a non-folder to the document route and leaves the browse context alone', () => {
      // The context is the *folder* the user is browsing. Overwriting it when opening a
      // document would move the tree selection off the folder they will come back to.
      const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      context.setFromNuxeoPath('/default-domain/workspaces/ws');

      service.navigateTo(file);

      expect(navigate).toHaveBeenCalledWith(['/doc', 'doc-9'], {
        queryParams: { browseReturn: 'adf-hx' },
      });
      expect(context.contextPath()).toBe('/default-domain/workspaces/ws');
    });

    it('does not use the document route for the root, even though the root has an id', () => {
      const navigate = vi.spyOn(router, 'navigate').mockResolvedValue(true);
      vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
      service.navigateTo(hxDoc({ ...ROOT_DOCUMENT }));
      expect(navigate).not.toHaveBeenCalled();
    });
  });
});
