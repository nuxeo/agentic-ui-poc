import { describe, expect, it } from 'vitest';
import {
  DEFAULT_REPOSITORY_ID,
  ROOT_DOCUMENT,
  SYS_ROOT,
  isHxFolderDocument,
  isHxRootDocument,
} from './adf-hx-bridge.tokens';

describe('isHxRootDocument', () => {
  it('recognises the synthetic root by its id', () => {
    expect(isHxRootDocument({ sys_id: ROOT_DOCUMENT.sys_id })).toBe(true);
  });

  it("recognises Nuxeo's own Root doctype through the mapped SysRoot primary type", () => {
    // The mapper turns Nuxeo `Root` into `SysRoot`, and that document has a real Nuxeo uid
    // rather than the synthetic one — so the primary type is the only signal available.
    expect(isHxRootDocument({ sys_id: 'a-real-nuxeo-uid', sys_primaryType: SYS_ROOT })).toBe(true);
  });

  it('does not treat an ordinary folder as the root', () => {
    expect(isHxRootDocument({ sys_id: 'ws-1', sys_primaryType: 'Workspace' })).toBe(false);
  });

  it('does not treat a document with neither field as the root', () => {
    // An empty object matching the root would make every unmapped document navigate to `/`.
    expect(isHxRootDocument({})).toBe(false);
  });
});

describe('isHxFolderDocument', () => {
  it('requires sys_isFolderish to be exactly true', () => {
    expect(isHxFolderDocument({ sys_isFolderish: true })).toBe(true);
    expect(isHxFolderDocument({ sys_isFolderish: false })).toBe(false);
  });

  it('treats an absent folderish flag as not folderish', () => {
    // Identity comparison, not truthiness: an unmapped document must not be navigated into
    // as a folder, which would issue a children query against a file.
    expect(isHxFolderDocument({})).toBe(false);
    expect(isHxFolderDocument({ sys_isFolderish: undefined })).toBe(false);
  });
});

describe('ROOT_DOCUMENT', () => {
  it('is folderish, SysRoot-typed and rooted at the default repository', () => {
    // Upstream's `isRoot()` tests `sys_primaryType === 'SysRoot'` and the tree only expands
    // folderish nodes, so all three fields are load-bearing rather than descriptive.
    expect(ROOT_DOCUMENT.sys_primaryType).toBe(SYS_ROOT);
    expect(ROOT_DOCUMENT.sys_isFolderish).toBe(true);
    expect(ROOT_DOCUMENT.sys_path).toBe('/');
    expect(ROOT_DOCUMENT.sys_repository).toBe(DEFAULT_REPOSITORY_ID);
  });

  it('satisfies its own root predicate', () => {
    expect(isHxRootDocument(ROOT_DOCUMENT)).toBe(true);
    expect(isHxFolderDocument(ROOT_DOCUMENT)).toBe(true);
  });
});
