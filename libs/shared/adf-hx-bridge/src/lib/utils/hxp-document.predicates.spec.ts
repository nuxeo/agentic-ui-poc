import type { Document } from '@hylandsoftware/hxcs-js-client';
import { describe, expect, it } from 'vitest';

import { isHxFolder } from './hxp-document.predicates';
import { ROOT_DOCUMENT, SYS_ROOT } from '../tokens/adf-hx-bridge.tokens';

/**
 * `isHxFolder` — "a folder you can navigate into", which is narrower than "folderish".
 *
 * The exclusion of the synthetic repository root is the entire content of the predicate, and
 * it is the case a naive `sys_isFolderish === true` gets wrong: the root *is* folderish, so a
 * tree or a card grid that treats it as an ordinary folder offers the user a navigation
 * target that is not a Nuxeo document at all.
 */
describe('isHxFolder', () => {
  /**
   * Every field `Document` actually requires — only `sys_primaryType` — plus the ones this
   * predicate reads. `Partial<Document>` for the override so a case can drop a field, and no
   * closing `as Document`: the cast is what would let an invalid fixture through and let it
   * drift as the upstream type changes.
   */
  const doc = (over: Partial<Document> = {}): Document => ({
    sys_id: 'doc-1',
    sys_title: 'Invoice',
    sys_primaryType: 'File',
    sys_path: '/default-domain/workspaces/ws/Invoice',
    sys_isFolderish: false,
    ...over,
  });

  it('accepts an ordinary folderish Nuxeo document', () => {
    expect(isHxFolder(doc({ sys_primaryType: 'Folder', sys_isFolderish: true }))).toBe(true);
    expect(isHxFolder(doc({ sys_primaryType: 'Workspace', sys_isFolderish: true }))).toBe(true);
    expect(isHxFolder(doc({ sys_primaryType: 'Domain', sys_isFolderish: true }))).toBe(true);
  });

  it('rejects a non-folderish document', () => {
    expect(isHxFolder(doc({ sys_primaryType: 'File', sys_isFolderish: false }))).toBe(false);
  });

  it('rejects the synthetic repository root even though it is folderish', () => {
    // The root reaches this predicate as a real value — `syntheticHxRepositoryRoot()` sets
    // `sys_isFolderish: true` — so this is the branch the predicate exists for.
    expect(isHxFolder({ ...ROOT_DOCUMENT })).toBe(false);
  });

  it('rejects the root by id and by primary type independently', () => {
    // `isHxRootDocument` is an OR over the two, and each arm is reachable on its own: the
    // synthetic root carries both, but a mapped Nuxeo `Root` document carries the type with
    // its own uid, and an id-only match arrives from `getDocumentById(ROOT_DOCUMENT.sys_id)`.
    expect(isHxFolder(doc({ sys_id: ROOT_DOCUMENT.sys_id, sys_isFolderish: true }))).toBe(false);
    expect(
      isHxFolder(doc({ sys_id: 'root-uid', sys_primaryType: SYS_ROOT, sys_isFolderish: true })),
    ).toBe(false);
  });

  /**
   * A document whose `sys_isFolderish` holds something the declared type forbids.
   *
   * `Document` declares `sys_isFolderish?: boolean` *and* an `[key: string]: any` index
   * signature, so a non-boolean is impossible in a typed literal but entirely possible at
   * runtime — Nuxeo's JSON arrives untyped. `Object.assign` is how that runtime reality is
   * expressed without an `as` cast on the fixture or an `any` anywhere.
   */
  const withFolderish = (value: unknown): Document =>
    Object.assign(doc(), { sys_isFolderish: value });

  it('requires sys_isFolderish to be exactly true, not merely truthy', () => {
    // The strict `=== true` is deliberate: a truthy check would call a document with
    // `sys_isFolderish: 'false'` a folder — a non-empty string is truthy.
    expect(isHxFolder(doc({ sys_isFolderish: undefined }))).toBe(false);
    expect(isHxFolder(withFolderish('true'))).toBe(false);
    expect(isHxFolder(withFolderish('false'))).toBe(false);
    expect(isHxFolder(withFolderish(1))).toBe(false);
    // A document with nothing but the one required field — the minimum `Document` the upstream
    // type admits.
    expect(isHxFolder({ sys_primaryType: 'File' })).toBe(false);
  });
});
