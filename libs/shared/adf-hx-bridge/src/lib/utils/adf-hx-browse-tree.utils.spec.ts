import { describe, expect, it } from 'vitest';
import {
  adfHxBrowseTreeScopeKey,
  isAncestorNuxeoPath,
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
});
