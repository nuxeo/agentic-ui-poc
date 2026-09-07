import { describe, expect, it } from 'vitest';
import type { Document } from '@hylandsoftware/hxcs-js-client';
import {
  hxpBrowseCellValue,
  hxpDocTitle,
  hxpDocTypeLabel,
  hxpLastContributor,
} from './hxp-browse-cell.utils';

function doc(fields: Record<string, unknown> = {}): Document {
  return { sys_id: 'doc-1', ...fields } as Document;
}

describe('hxpDocTitle', () => {
  it('prefers sys_title', () => {
    expect(hxpDocTitle(doc({ sys_title: 'Invoice', sys_name: 'invoice.pdf' }))).toBe('Invoice');
  });

  it('falls back to sys_name when the title is absent', () => {
    expect(hxpDocTitle(doc({ sys_name: 'invoice.pdf' }))).toBe('invoice.pdf');
  });

  it('renders Untitled rather than an empty cell when neither is set', () => {
    expect(hxpDocTitle(doc())).toBe('Untitled');
  });
});

describe('hxpDocTypeLabel', () => {
  it('prefers the mapper-supplied type label', () => {
    expect(hxpDocTypeLabel(doc({ sys_typeLabel: 'Workspace', sys_primaryType: 'SysRoot' }))).toBe(
      'Workspace',
    );
  });

  it('falls back to the primary type', () => {
    expect(hxpDocTypeLabel(doc({ sys_primaryType: 'Folder' }))).toBe('Folder');
  });

  it('falls back to File when the document declares no type', () => {
    expect(hxpDocTypeLabel(doc())).toBe('File');
  });
});

describe('hxpBrowseCellValue', () => {
  it('renders the title column through the same fallback chain as the title helper', () => {
    expect(hxpBrowseCellValue(doc({ sys_name: 'invoice.pdf' }), 'title')).toBe('invoice.pdf');
  });

  it('renders the type column from the type label', () => {
    expect(hxpBrowseCellValue(doc({ sys_typeLabel: 'Workspace' }), 'type')).toBe('Workspace');
  });

  it('formats the modified column as a locale date', () => {
    const value = hxpBrowseCellValue(doc({ sys_modified: '2026-02-03T10:00:00.000Z' }), 'modified');
    expect(value).toBe(new Date('2026-02-03T10:00:00.000Z').toLocaleDateString());
  });

  it('renders an empty modified cell rather than Invalid Date when the value is absent', () => {
    expect(hxpBrowseCellValue(doc(), 'modified')).toBe('');
  });

  it('formats the created column as a locale date', () => {
    const value = hxpBrowseCellValue(doc({ sys_created: '2026-01-01T00:00:00.000Z' }), 'created');
    expect(value).toBe(new Date('2026-01-01T00:00:00.000Z').toLocaleDateString());
  });

  it('renders an empty created cell when the value is absent', () => {
    expect(hxpBrowseCellValue(doc(), 'created')).toBe('');
  });

  it('reads the Dublin Core keys the mapper emits, not the retired hx_ ones', () => {
    // The mapper stopped emitting `hx:*` in Phase 3. Reading `dc_*` here is what keeps these
    // columns populated, and asserting the key name is what would catch a re-prefixing.
    const row = doc({
      dc_lastContributor: 'jdoe',
      dc_creator: 'Administrator',
      dc_nature: 'contract',
      dc_coverage: 'europe',
    });
    expect(hxpBrowseCellValue(row, 'lastContributor')).toBe('jdoe');
    expect(hxpBrowseCellValue(row, 'author')).toBe('Administrator');
    expect(hxpBrowseCellValue(row, 'nature')).toBe('contract');
    expect(hxpBrowseCellValue(row, 'coverage')).toBe('europe');
  });

  it('returns an empty string for a Dublin Core property the mapper omitted', () => {
    // The mapper skips properties Nuxeo holds no value for, so an absent key is the normal
    // case; the cell must be blank rather than `undefined`.
    expect(hxpBrowseCellValue(doc(), 'lastContributor')).toBe('');
    expect(hxpBrowseCellValue(doc(), 'author')).toBe('');
  });

  it('returns an empty string when a property arrives as a non-string', () => {
    expect(hxpBrowseCellValue(doc({ dc_creator: 42 }), 'author')).toBe('');
  });

  it('joins the subjects array Nuxeo sends', () => {
    expect(
      hxpBrowseCellValue(doc({ dc_subjects: ['art/architecture', 'art/comics'] }), 'subjects'),
    ).toBe('art/architecture, art/comics');
  });

  it('accepts a pre-joined subjects string as well as an array', () => {
    expect(hxpBrowseCellValue(doc({ dc_subjects: 'art/comics' }), 'subjects')).toBe('art/comics');
  });

  it('composes the version column from the major and minor uid properties', () => {
    expect(hxpBrowseCellValue(doc({ uid_major_version: 1, uid_minor_version: 3 }), 'version')).toBe(
      '1.3',
    );
  });

  it('defaults an absent minor version to zero rather than dropping the column', () => {
    expect(hxpBrowseCellValue(doc({ uid_major_version: 2 }), 'version')).toBe('2.0');
  });

  it('renders 0.0 for a never-versioned document, not an empty cell', () => {
    // `0` is a real version number. A truthiness check here would blank the column for every
    // document that has never been checked in, which is most of them.
    expect(hxpBrowseCellValue(doc({ uid_major_version: 0, uid_minor_version: 0 }), 'version')).toBe(
      '0.0',
    );
  });

  it('renders an empty version cell when the uid schema is absent', () => {
    expect(hxpBrowseCellValue(doc(), 'version')).toBe('');
    expect(hxpBrowseCellValue(doc({ uid_major_version: null }), 'version')).toBe('');
  });

  it('renders the flags column as empty, matching production browse', () => {
    expect(hxpBrowseCellValue(doc({ sys_title: 'x' }), 'flags')).toBe('');
  });

  it('returns an empty string for a column key it does not know', () => {
    // A column added to the manifest but not here must render blank rather than throw and
    // take the whole listing down.
    expect(hxpBrowseCellValue(doc({ sys_title: 'x' }), 'not-a-column')).toBe('');
  });

  it('renders the state column from dc:nature, matching production browse', () => {
    // Deliberately NOT `sys_lifecycleState`, which is what "State" means everywhere else in
    // the app (trash, assets, search). This mirrors `browse.ts` so the POC page and the
    // production page agree; the divergence is app-wide and not this file's to resolve.
    expect(
      hxpBrowseCellValue(doc({ dc_nature: 'contract', sys_lifecycleState: 'project' }), 'state'),
    ).toBe('contract');
  });
});

describe('hxpLastContributor', () => {
  it('reads dc_lastContributor', () => {
    expect(hxpLastContributor(doc({ dc_lastContributor: 'jdoe' }))).toBe('jdoe');
  });

  it('returns an empty string when the property is absent', () => {
    expect(hxpLastContributor(doc())).toBe('');
  });
});
