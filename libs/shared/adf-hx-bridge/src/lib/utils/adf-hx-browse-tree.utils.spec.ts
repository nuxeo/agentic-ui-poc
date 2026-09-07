import { describe, expect, it } from 'vitest';
import type { Document } from '@hylandsoftware/hxcs-js-client';
import {
  adfHxBrowseTreeScopeKey,
  hxDocPath,
  hxTopLevelFolderPath,
  isAncestorNuxeoPath,
  isHxRepositoryRootPath,
  pathPrefixesBelowRoot,
} from './adf-hx-browse-tree.utils';

describe('adf-hx-browse-tree.utils', () => {
  it('pathPrefixesBelowRoot returns all prefixes from repository root', () => {
    expect(pathPrefixesBelowRoot('/', '/default-domain/workspaces')).toEqual([
      '/default-domain',
      '/default-domain/workspaces',
    ]);
  });

  it('pathPrefixesBelowRoot excludes the domain root when tree is domain-scoped', () => {
    expect(pathPrefixesBelowRoot('/default-domain', '/default-domain/workspaces/foo')).toEqual([
      '/default-domain/workspaces',
      '/default-domain/workspaces/foo',
    ]);
  });

  it('adfHxBrowseTreeScopeKey returns repository root or domain path', () => {
    expect(adfHxBrowseTreeScopeKey('/')).toBe('/');
    expect(adfHxBrowseTreeScopeKey('/default-domain/workspaces')).toBe('/default-domain');
  });

  it('isAncestorNuxeoPath detects folder ancestors', () => {
    expect(isAncestorNuxeoPath('/default-domain', '/default-domain/workspaces')).toBe(true);
    expect(isAncestorNuxeoPath('/default-domain/workspaces', '/default-domain')).toBe(false);
  });

  it('isAncestorNuxeoPath does not treat a path as its own ancestor', () => {
    // A node reporting itself as an ancestor would make the tree mark the active folder as
    // an expandable parent of itself.
    expect(isAncestorNuxeoPath('/default-domain', '/default-domain')).toBe(false);
  });

  it('isAncestorNuxeoPath rejects a sibling with a shared name prefix', () => {
    // Segment comparison, not string `startsWith`: `/default-domain-2` must not be treated
    // as living under `/default-domain`.
    expect(isAncestorNuxeoPath('/default-domain', '/default-domain-2/workspaces')).toBe(false);
  });

  it('pathPrefixesBelowRoot returns nothing when the active path is the root itself', () => {
    expect(pathPrefixesBelowRoot('/default-domain', '/default-domain')).toEqual([]);
    expect(pathPrefixesBelowRoot('/', '/')).toEqual([]);
  });

  it('pathPrefixesBelowRoot excludes a sibling that merely shares a name prefix', () => {
    expect(pathPrefixesBelowRoot('/default-domain', '/default-domain-2/workspaces')).toEqual([]);
  });

  it('hxDocPath normalizes the trailing slash Nuxeo puts on the root', () => {
    expect(hxDocPath({ sys_path: '/default-domain/workspaces/' } as Document)).toBe(
      '/default-domain/workspaces',
    );
  });

  it('hxDocPath falls back to the repository root for a document with no path', () => {
    // The synthetic root carries `sys_path: '/'`, but an unmapped document would carry none;
    // returning `undefined` here would break every downstream path comparison.
    expect(hxDocPath({} as Document)).toBe('/');
  });

  it('isHxRepositoryRootPath recognises the root in each of its spellings', () => {
    expect(isHxRepositoryRootPath('/')).toBe(true);
    expect(isHxRepositoryRootPath('')).toBe(true);
    expect(isHxRepositoryRootPath('/default-domain')).toBe(false);
  });

  it('hxTopLevelFolderPath returns null at the root and the first segment below it', () => {
    expect(hxTopLevelFolderPath('/')).toBeNull();
    expect(hxTopLevelFolderPath('/default-domain/workspaces/ws')).toBe('/default-domain');
    expect(hxTopLevelFolderPath('/default-domain')).toBe('/default-domain');
  });

  it('adfHxBrowseTreeScopeKey and hxTopLevelFolderPath differ only at the root', () => {
    // The tree re-roots on the scope key, so it needs `/` where the folder path is `null`.
    expect(adfHxBrowseTreeScopeKey('/')).toBe('/');
    expect(hxTopLevelFolderPath('/')).toBeNull();
  });
});
