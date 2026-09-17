import { afterEach, describe, expect, it } from 'vitest';

import type { NuxeoDocument } from '../models/document.model';
import {
  canPasteClipboard,
  CLIPBOARD_STORAGE_KEY,
  readClipboardDocs,
  type ClipboardDoc,
} from './clipboard.utils';

function folderWithSubtypes(types: string[]): NuxeoDocument {
  return {
    uid: 'folder-1',
    title: 'Folder',
    type: 'Folder',
    path: '/default-domain/workspaces/folder',
    lastModified: '2026-01-01T00:00:00.000Z',
    properties: {},
    contextParameters: {
      subtypes: types.map((type) => ({ type })),
    },
  };
}

describe('readClipboardDocs', () => {
  afterEach(() => localStorage.removeItem(CLIPBOARD_STORAGE_KEY));

  it('filters out entries with non-string type', () => {
    localStorage.setItem(
      CLIPBOARD_STORAGE_KEY,
      JSON.stringify([
        { uid: 'a', title: 'A', type: 'File' },
        { uid: 'b', title: 'B', type: 123 },
      ]),
    );
    expect(readClipboardDocs()).toEqual([{ uid: 'a', title: 'A', type: 'File' }]);
  });
});

describe('canPasteClipboard', () => {
  const items: ClipboardDoc[] = [{ uid: 'a', title: 'Doc A', type: 'File' }];

  it('returns false when clipboard is empty', () => {
    expect(canPasteClipboard([], folderWithSubtypes(['File']))).toBe(false);
  });

  it('returns false when target is null', () => {
    expect(canPasteClipboard(items, null)).toBe(false);
  });

  it('returns false when target is not folderish', () => {
    const file: NuxeoDocument = {
      uid: 'f1',
      title: 'File',
      type: 'File',
      path: '/file',
      lastModified: '2026-01-01T00:00:00.000Z',
      properties: {},
    };
    expect(canPasteClipboard(items, file)).toBe(false);
  });

  it('returns true when target has no subtypes enricher', () => {
    const folder: NuxeoDocument = {
      uid: 'folder-1',
      title: 'Folder',
      type: 'Folder',
      path: '/folder',
      lastModified: '2026-01-01T00:00:00.000Z',
      properties: {},
    };
    expect(canPasteClipboard(items, folder)).toBe(true);
  });

  it('returns true when every item type is allowed', () => {
    expect(canPasteClipboard(items, folderWithSubtypes(['File', 'Folder']))).toBe(true);
  });

  it('returns false when an item type is not allowed', () => {
    expect(canPasteClipboard(items, folderWithSubtypes(['Folder']))).toBe(false);
  });

  it('allows items without type for backward compatibility', () => {
    const legacy: ClipboardDoc[] = [{ uid: 'a', title: 'Doc A' }];
    expect(canPasteClipboard(legacy, folderWithSubtypes(['Folder']))).toBe(true);
  });
});
