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
    expect(hxpBrowseCellValue(doc({ sys_name: 'invoice.pdf' }), 'title', 'en-US')).toBe(
      'invoice.pdf',
    );
  });

  it('renders the type column from the type label', () => {
    expect(hxpBrowseCellValue(doc({ sys_typeLabel: 'Workspace' }), 'type', 'en-US')).toBe(
      'Workspace',
    );
  });

  it('formats the modified column as a locale date', () => {
    const value = hxpBrowseCellValue(
      doc({ sys_modified: '2026-02-03T10:00:00.000Z' }),
      'modified',
      'en-US',
    );
    expect(value).toBe(new Date('2026-02-03T10:00:00.000Z').toLocaleDateString('en-US'));
  });

  it('formats the modified column in the locale it is given, not the host default', () => {
    // Both this and the `created` case used to assert against a bare `toLocaleDateString()`, which
    // reads whatever locale the machine running the test has. That agrees with the old hardcoded
    // implementation on a US CI box and disagrees anywhere else, so it could neither catch the bug
    // nor survive a move.
    const modified = doc({ sys_modified: '2026-02-03T10:00:00.000Z' });
    expect(hxpBrowseCellValue(modified, 'modified', 'de-DE')).toBe('3.2.2026');
    expect(hxpBrowseCellValue(modified, 'modified', 'en-US')).toBe('2/3/2026');
  });

  it('renders an empty modified cell rather than Invalid Date when the value is absent', () => {
    expect(hxpBrowseCellValue(doc(), 'modified', 'en-US')).toBe('');
  });

  it('formats the created column as a locale date', () => {
    const value = hxpBrowseCellValue(
      doc({ sys_created: '2026-01-01T00:00:00.000Z' }),
      'created',
      'en-US',
    );
    expect(value).toBe(new Date('2026-01-01T00:00:00.000Z').toLocaleDateString('en-US'));
  });

  it('renders an empty created cell when the value is absent', () => {
    expect(hxpBrowseCellValue(doc(), 'created', 'en-US')).toBe('');
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
    expect(hxpBrowseCellValue(row, 'lastContributor', 'en-US')).toBe('jdoe');
    expect(hxpBrowseCellValue(row, 'author', 'en-US')).toBe('Administrator');
    expect(hxpBrowseCellValue(row, 'nature', 'en-US')).toBe('contract');
    expect(hxpBrowseCellValue(row, 'coverage', 'en-US')).toBe('europe');
  });

  it('returns an empty string for a Dublin Core property the mapper omitted', () => {
    // The mapper skips properties Nuxeo holds no value for, so an absent key is the normal
    // case; the cell must be blank rather than `undefined`.
    expect(hxpBrowseCellValue(doc(), 'lastContributor', 'en-US')).toBe('');
    expect(hxpBrowseCellValue(doc(), 'author', 'en-US')).toBe('');
  });

  it('returns an empty string when a property arrives as a non-string', () => {
    expect(hxpBrowseCellValue(doc({ dc_creator: 42 }), 'author', 'en-US')).toBe('');
  });

  it('joins the subjects array Nuxeo sends', () => {
    expect(
      hxpBrowseCellValue(
        doc({ dc_subjects: ['art/architecture', 'art/comics'] }),
        'subjects',
        'en-US',
      ),
    ).toBe('art/architecture, art/comics');
  });

  it('accepts a pre-joined subjects string as well as an array', () => {
    expect(hxpBrowseCellValue(doc({ dc_subjects: 'art/comics' }), 'subjects', 'en-US')).toBe(
      'art/comics',
    );
  });

  it('composes the version column from the major and minor uid properties', () => {
    expect(
      hxpBrowseCellValue(doc({ uid_major_version: 1, uid_minor_version: 3 }), 'version', 'en-US'),
    ).toBe('1.3');
  });

  it('defaults an absent minor version to zero rather than dropping the column', () => {
    expect(hxpBrowseCellValue(doc({ uid_major_version: 2 }), 'version', 'en-US')).toBe('2.0');
  });

  it('renders 0.0 for a never-versioned document, not an empty cell', () => {
    // `0` is a real version number. A truthiness check here would blank the column for every
    // document that has never been checked in, which is most of them.
    expect(
      hxpBrowseCellValue(doc({ uid_major_version: 0, uid_minor_version: 0 }), 'version', 'en-US'),
    ).toBe('0.0');
  });

  it('renders an empty version cell when the uid schema is absent', () => {
    expect(hxpBrowseCellValue(doc(), 'version', 'en-US')).toBe('');
    expect(hxpBrowseCellValue(doc({ uid_major_version: null }), 'version', 'en-US')).toBe('');
  });

  it('renders the flags column as empty, matching production browse', () => {
    expect(hxpBrowseCellValue(doc({ sys_title: 'x' }), 'flags', 'en-US')).toBe('');
  });

  it('returns an empty string for a column key it does not know', () => {
    // A column added to the manifest but not here must render blank rather than throw and
    // take the whole listing down.
    expect(hxpBrowseCellValue(doc({ sys_title: 'x' }), 'not-a-column', 'en-US')).toBe('');
  });

  it('renders the state column from dc:nature, matching production browse', () => {
    // Deliberately NOT `sys_lifecycleState`, which is what "State" means everywhere else in
    // the app (trash, assets, search). This mirrors `browse.ts` so the POC page and the
    // production page agree; the divergence is app-wide and not this file's to resolve.
    expect(
      hxpBrowseCellValue(
        doc({ dc_nature: 'contract', sys_lifecycleState: 'project' }),
        'state',
        'en-US',
      ),
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
