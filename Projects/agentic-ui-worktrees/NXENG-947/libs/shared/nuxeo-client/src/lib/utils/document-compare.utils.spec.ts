import { describe, expect, it } from 'vitest';
import type { NuxeoDocument } from '../models/document.model';
import {
  buildDocumentCompareRows,
  buildDocumentCompareSections,
  formatCompareDate,
  formatCompareSubjects,
  formatCompareUser,
  formatCompareValue,
  isCompareIconField,
  resolveNuxeoIconPath,
} from './document-compare.utils';

function doc(overrides: Partial<NuxeoDocument> = {}): NuxeoDocument {
  return {
    uid: 'a',
    title: 'Alpha',
    type: 'File',
    path: '/workspaces/a',
    lastModified: '2026-07-07T10:00:00.000Z',
    properties: {
      'uid:minor_version': 3,
      'common:icon': '/icons/note.gif',
      'dc:title': 'Alpha',
      'dc:modified': '2026-07-07T10:00:00.000Z',
      'dc:creator': 'Administrator',
    },
    ...overrides,
  };
}

describe('document-compare.utils', () => {
  it('formatCompareValue renders arrays and empty values', () => {
    expect(formatCompareValue(null)).toBe('');
    expect(formatCompareValue(['a', 'b'])).toBe('a, b');
    expect(formatCompareValue([{ label: 'Tag' }])).toBe('Tag');
  });

  it('formatCompareDate renders Web UI style dates', () => {
    expect(formatCompareDate('2026-07-07T10:00:00.000Z')).toBe('July 7, 2026');
  });

  it('formatCompareUser renders username strings', () => {
    expect(formatCompareUser('Administrator')).toBe('Administrator');
  });

  it('formatCompareSubjects renders indexed subject labels', () => {
    expect(formatCompareSubjects(['Daily life'])).toBe('0: Daily life');
  });

  it('isCompareIconField identifies common icon properties', () => {
    expect(isCompareIconField('common:icon')).toBe(true);
    expect(isCompareIconField('common:icon-expanded')).toBe(true);
    expect(isCompareIconField('dc:title')).toBe(false);
  });

  it('resolveNuxeoIconPath prefixes Nuxeo static icon paths', () => {
    expect(resolveNuxeoIconPath('/icons/note.gif')).toBe('/nuxeo/icons/note.gif');
    expect(resolveNuxeoIconPath('/nuxeo/icons/note.gif')).toBe('/nuxeo/icons/note.gif');
  });

  it('buildDocumentCompareSections always shows uid and common fields in default view', () => {
    const sections = buildDocumentCompareSections(doc(), doc(), false);

    expect(sections.map((section) => section.id)).toEqual(['uid', 'common']);
    expect(sections[0]?.fields.map((row) => row.label)).toEqual([
      'uid',
      'major_version',
      'minor_version',
    ]);
    expect(sections[1]?.fields.map((row) => row.label)).toEqual(['icon-expanded', 'icon']);
  });

  it('buildDocumentCompareSections uses diff field set by default', () => {
    const sections = buildDocumentCompareSections(doc(), doc(), false);
    expect(sections.map((section) => section.id)).not.toContain('relatedtext');
    expect(
      sections.flatMap((section) => section.fields).some((row) => row.label === 'description'),
    ).toBe(false);
  });

  it('buildDocumentCompareSections shows full Web UI fields when viewAll is true', () => {
    const sections = buildDocumentCompareSections(doc(), doc(), true);
    expect(sections.map((section) => section.id)).toEqual([
      'uid',
      'common',
      'dublincore',
      'relatedtext',
      'facetedTag',
    ]);
    expect(sections[0]?.fields.some((row) => row.label === 'uid')).toBe(true);
    expect(sections[1]?.fields.some((row) => row.label === 'icon-expanded')).toBe(true);
    expect(sections[2]?.fields.some((row) => row.label === 'description')).toBe(true);
    expect(sections[2]?.fields.some((row) => row.label === 'creator')).toBe(true);
    expect(sections[2]?.fields.some((row) => row.label === 'publisher')).toBe(true);
    expect(sections[3]?.fields.some((row) => row.label === 'relatedtextresources')).toBe(true);
    expect(sections[4]?.fields.some((row) => row.label === 'tags')).toBe(true);
  });

  it('buildDocumentCompareSections returns only differences by default', () => {
    const left = doc();
    const right = doc({
      properties: {
        'uid:minor_version': 0,
        'common:icon': '/icons/image.gif',
        'dc:title': 'CAT',
        'dc:coverage': 'Cameroon',
        'dc:modified': '2026-07-08T10:00:00.000Z',
        'dc:creator': 'Administrator',
      },
    });

    const sections = buildDocumentCompareSections(left, right, false);

    expect(sections.some((section) => section.id === 'uid')).toBe(true);
    expect(
      sections
        .flatMap((section) => section.fields)
        .some((row) => row.key === 'uid:minor_version' && row.differs),
    ).toBe(true);
    expect(
      sections.flatMap((section) => section.fields).some((row) => row.key === 'dc:description'),
    ).toBe(false);
  });

  it('buildDocumentCompareRows flattens section rows', () => {
    const rows = buildDocumentCompareRows(doc(), doc({ title: 'Beta' }), true);
    expect(rows.length).toBeGreaterThan(15);
  });
});
