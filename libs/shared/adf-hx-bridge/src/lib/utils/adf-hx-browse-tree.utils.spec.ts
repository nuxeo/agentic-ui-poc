import { describe, expect, it } from 'vitest';
import type { Document } from '@hylandsoftware/hxcs-js-client';
import {
  adfHxBrowseTreeScopeKey,
  hxDocPath,
  hxTopLevelFolderPath,
  isAncestorNuxeoPath,
  isHxRepositoryRootPath,
  hxTreeBranchFromRoot,
  hxTreeNodeIsExpandable,
  hxTreeNodesToCollapse,
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

  describe('hxTreeNodeIsExpandable', () => {
    const KEY = 'hxp_hasSubfolders';

    it('drops the arrow only from a folder marked as holding no folders', () => {
      expect(hxTreeNodeIsExpandable({ sys_isFolderish: true, [KEY]: false }, KEY)).toBe(false);
      expect(hxTreeNodeIsExpandable({ sys_isFolderish: true, [KEY]: true }, KEY)).toBe(true);
    });

    it('keeps the arrow on an unmarked folder, since unknown is not "empty"', () => {
      expect(hxTreeNodeIsExpandable({ sys_isFolderish: true }, KEY)).toBe(true);
    });

    it('never makes a file expandable, whatever it is marked', () => {
      expect(hxTreeNodeIsExpandable({ sys_isFolderish: false, [KEY]: true }, KEY)).toBe(false);
    });
  });

  describe('hxTreeBranchFromRoot', () => {
    const chain: Document[] = [
      { sys_id: 'repo' },
      { sys_id: 'domain' },
      { sys_id: 'workspaces' },
      { sys_id: 'y' },
    ];

    it("starts the branch at the tree's own root, so a domain-rooted tree can open it", () => {
      // Upstream's `[documents]` expansion starts from the repository root and stops at the first
      // node it cannot find, which in a domain-rooted tree is the very first one.
      expect(hxTreeBranchFromRoot(chain, 'domain').map((d) => d.sys_id)).toEqual([
        'domain',
        'workspaces',
        'y',
      ]);
    });

    it('keeps the whole chain when the root is not in it, and copies it', () => {
      const branch = hxTreeBranchFromRoot(chain, 'elsewhere');
      expect(branch.map((d) => d.sys_id)).toEqual(['repo', 'domain', 'workspaces', 'y']);
      // Upstream's `openNodes` consumes its argument with `shift()`.
      expect(branch).not.toBe(chain);
    });
  });

  describe('hxTreeNodesToCollapse', () => {
    const node = (path: string, level: number, expanded = true, skeleton = false) => ({
      path,
      level,
      expanded,
      skeleton,
    });

    it('collapses expanded branches off the active path and keeps the path open', () => {
      const nodes = [
        node('/default-domain', 0),
        node('/default-domain/sections', 1),
        node('/default-domain/workspaces', 1),
        node('/default-domain/workspaces/y', 2),
      ];
      expect(
        hxTreeNodesToCollapse(nodes, '/default-domain/workspaces/y').map((n) => n.path),
      ).toEqual(['/default-domain/sections']);
    });

    it('collapses only the topmost node of an off-path branch', () => {
      // Its descendants leave the tree with it; collapsing one that is gone corrupts the list.
      const nodes = [
        node('/d', 0),
        node('/d/a', 1),
        node('/d/a/b', 2),
        node('/d/a/b/c', 3),
        node('/d/z', 1),
      ];
      expect(hxTreeNodesToCollapse(nodes, '/d/z').map((n) => n.path)).toEqual(['/d/a']);
    });

    it('never collapses the root, a collapsed node or a skeleton placeholder', () => {
      const nodes = [
        node('/d', 0),
        node('/d/closed', 1, false),
        node('/d/placeholder', 1, true, true),
      ];
      expect(hxTreeNodesToCollapse(nodes, '/elsewhere')).toEqual([]);
    });

    it('treats a sibling whose name only starts like the active folder as off the path', () => {
      const nodes = [node('/d', 0), node('/d/work', 1), node('/d/workspaces', 1)];
      expect(hxTreeNodesToCollapse(nodes, '/d/workspaces').map((n) => n.path)).toEqual(['/d/work']);
    });
  });
});
