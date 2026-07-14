import type { NuxeoDocument } from '../models/document.model';
import {
  browseTreeContextPath,
  cumulativeNuxeoPathPrefixes,
  expandableNuxeoPathPrefixes,
  normalizeNuxeoPath,
  nuxeoPathsEqual,
  nuxeoPathsEqualFlexible,
  parentNuxeoFolderPath,
  parseBrowseNuxeoPathFromRouterUrl,
  toBrowseRouterUrl,
  topLevelNuxeoFolderPath,
} from './browse-path.utils';

describe('browse-path.utils', () => {
  describe('parseBrowseNuxeoPathFromRouterUrl', () => {
    it('returns / for bare browse route', () => {
      expect(parseBrowseNuxeoPathFromRouterUrl('/#/browse')).toBe('/');
      expect(parseBrowseNuxeoPathFromRouterUrl('/browse/')).toBe('/');
    });

    it('extracts nested folder path from hash route', () => {
      expect(parseBrowseNuxeoPathFromRouterUrl('/#/browse/default-domain/workspaces')).toBe(
        '/default-domain/workspaces',
      );
    });

    it('decodes percent-encoded path segments', () => {
      expect(parseBrowseNuxeoPathFromRouterUrl('/#/browse/Domain%201/workspaces')).toBe(
        '/Domain 1/workspaces',
      );
    });
  });

  describe('parentNuxeoFolderPath', () => {
    it('returns parent folder for a file path', () => {
      expect(parentNuxeoFolderPath('/default-domain/workspaces/demo/report.pdf')).toBe(
        '/default-domain/workspaces/demo',
      );
    });
  });

  describe('browseTreeContextPath', () => {
    it('uses document path for folderish containers', () => {
      const workspace = {
        uid: 'ws-1',
        path: '/default-domain/workspaces/demo',
        type: 'Workspace',
        title: 'Demo',
      } as NuxeoDocument;
      expect(browseTreeContextPath(workspace)).toBe('/default-domain/workspaces/demo');
    });

    it('uses parent folder for leaf documents', () => {
      const file = {
        uid: 'file-1',
        path: '/default-domain/workspaces/demo/report.pdf',
        type: 'File',
        title: 'Report',
      } as NuxeoDocument;
      expect(browseTreeContextPath(file)).toBe('/default-domain/workspaces/demo');
    });
  });

  describe('cumulativeNuxeoPathPrefixes', () => {
    it('builds cumulative prefixes for nested paths', () => {
      expect(cumulativeNuxeoPathPrefixes('/default-domain/workspaces/demo')).toEqual([
        '/default-domain',
        '/default-domain/workspaces',
        '/default-domain/workspaces/demo',
      ]);
    });
  });

  describe('cumulativeNuxeoPathPrefixes', () => {
    it('includes the active folder so tree children are visible', () => {
      expect(cumulativeNuxeoPathPrefixes('/domain-5/workspaces')).toEqual([
        '/domain-5',
        '/domain-5/workspaces',
      ]);
    });
  });

  describe('expandableNuxeoPathPrefixes', () => {
    it('excludes the active folder segment', () => {
      expect(expandableNuxeoPathPrefixes('/default-domain/workspaces')).toEqual([
        '/default-domain',
      ]);
    });
  });

  describe('normalizeNuxeoPath', () => {
    it('normalizes trailing slashes', () => {
      expect(normalizeNuxeoPath('/default-domain/')).toBe('/default-domain');
    });
  });

  describe('nuxeoPathsEqualFlexible', () => {
    it('treats spaced and hyphenated domain segments as equal', () => {
      expect(nuxeoPathsEqualFlexible('/Domain 1/workspaces', '/domain-1/workspaces')).toBe(true);
    });

    it('does not throw when a segment contains a literal percent sign', () => {
      expect(() => nuxeoPathsEqualFlexible('/100% done', '/100% done')).not.toThrow();
      expect(nuxeoPathsEqualFlexible('/100% done', '/100% done')).toBe(true);
    });
  });

  describe('nuxeoPathsEqual', () => {
    it('matches paths regardless of segment casing', () => {
      expect(nuxeoPathsEqual('/domain-1/workspaces', '/Domain-1/Workspaces')).toBe(true);
    });
  });

  describe('topLevelNuxeoFolderPath', () => {
    it('returns the first segment for nested paths', () => {
      expect(topLevelNuxeoFolderPath('/Domain-5/workspaces')).toBe('/Domain-5');
    });

    it('returns null at repository root', () => {
      expect(topLevelNuxeoFolderPath('/')).toBeNull();
    });
  });

  describe('toBrowseRouterUrl', () => {
    it('encodes browse routes from repository paths', () => {
      expect(toBrowseRouterUrl('/domain-1/workspaces')).toBe('/browse/domain-1/workspaces');
      expect(toBrowseRouterUrl('/')).toBe('/browse');
    });
  });
});
