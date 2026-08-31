import { describe, expect, it } from 'vitest';

import {
  formatCompareSubjects,
  formatCompareTags,
  formatCompareUser,
  formatCompareUserList,
  formatCompareValue,
  isCompareIconField,
  resolveNuxeoIconPath,
} from './document-compare.utils';

describe('formatCompareUser', () => {
  it('returns a plain username unchanged', () => {
    expect(formatCompareUser('jdoe')).toBe('jdoe');
  });

  it('prefers the nested username of an enriched user entity', () => {
    expect(
      formatCompareUser({
        'entity-type': 'user',
        id: 'ignored-id',
        properties: { username: 'jdoe', firstName: 'Jane', lastName: 'Doe' },
      }),
    ).toBe('jdoe');
  });

  it('falls back to the entity id when properties carries no username or name', () => {
    expect(
      formatCompareUser({ 'entity-type': 'user', id: 'jdoe', properties: { email: 'j@e.com' } }),
    ).toBe('jdoe');
  });

  it('falls back to the full name when the entity carries no username', () => {
    expect(formatCompareUser({ properties: { firstName: 'Jane', lastName: 'Doe' } })).toBe(
      'Jane Doe',
    );
  });

  it('drops the missing half of a partial full name', () => {
    expect(formatCompareUser({ properties: { firstName: 'Jane' } })).toBe('Jane');
    expect(formatCompareUser({ properties: { lastName: 'Doe' } })).toBe('Doe');
  });

  it('reads a top-level username when there is no properties object', () => {
    expect(formatCompareUser({ username: 'jdoe' })).toBe('jdoe');
  });

  it('falls back to the entity id', () => {
    expect(formatCompareUser({ id: 'jdoe' })).toBe('jdoe');
  });

  it('serialises an object it cannot recognise rather than rendering [object Object]', () => {
    expect(formatCompareUser({ unexpected: 42 })).toBe('{"unexpected":42}');
  });

  it('renders an empty string for every flavour of absent value', () => {
    expect(formatCompareUser(null)).toBe('');
    expect(formatCompareUser(undefined)).toBe('');
    expect(formatCompareUser('')).toBe('');
  });
});

describe('formatCompareUserList', () => {
  it('joins several contributors with a comma', () => {
    expect(
      formatCompareUserList([
        'jdoe',
        { properties: { username: 'jsmith' } },
        { id: 'Administrator' },
      ]),
    ).toBe('jdoe, jsmith, Administrator');
  });

  it('formats a single non-array contributor', () => {
    expect(formatCompareUserList({ properties: { username: 'jdoe' } })).toBe('jdoe');
  });

  it('drops entries that resolve to nothing rather than leaving empty separators', () => {
    expect(formatCompareUserList(['jdoe', '', null])).toBe('jdoe');
  });

  it('renders an empty string for an absent value', () => {
    expect(formatCompareUserList(null)).toBe('');
    expect(formatCompareUserList(undefined)).toBe('');
    expect(formatCompareUserList('')).toBe('');
  });
});

describe('formatCompareSubjects', () => {
  it('numbers each subject so a reordering is visible as a difference', () => {
    expect(formatCompareSubjects(['art/art history', 'sciences'])).toBe(
      '0: art/art history\n1: sciences',
    );
  });

  it('reads the label of a vocabulary-entry subject', () => {
    expect(formatCompareSubjects([{ label: 'Art history' }])).toBe('0: Art history');
  });

  it('stringifies a subject that is neither a string nor labelled', () => {
    expect(formatCompareSubjects([7])).toBe('0: 7');
  });

  it('formats a non-array subjects value as a plain value', () => {
    expect(formatCompareSubjects('sciences')).toBe('sciences');
  });

  it('renders an empty string for an absent value', () => {
    expect(formatCompareSubjects(null)).toBe('');
    expect(formatCompareSubjects(undefined)).toBe('');
    expect(formatCompareSubjects('')).toBe('');
  });
});

describe('formatCompareTags', () => {
  it('joins string tags with a comma', () => {
    expect(formatCompareTags(['alpha', 'beta'])).toBe('alpha, beta');
  });

  it('reads the label of a faceted tag entry', () => {
    expect(formatCompareTags([{ label: 'alpha' }, 'beta'])).toBe('alpha, beta');
  });

  it('stringifies a tag that is neither a string nor labelled', () => {
    expect(formatCompareTags([{ other: 1 }])).toBe('[object Object]');
  });

  it('formats a non-array tags value as a plain value', () => {
    expect(formatCompareTags('alpha')).toBe('alpha');
  });

  it('renders an empty string for an absent value', () => {
    expect(formatCompareTags(null)).toBe('');
    expect(formatCompareTags(undefined)).toBe('');
    expect(formatCompareTags('')).toBe('');
  });
});

describe('formatCompareValue', () => {
  it('joins an array of strings', () => {
    expect(formatCompareValue(['a', 'b'])).toBe('a, b');
  });

  it('reads labels out of an array of labelled entries', () => {
    expect(formatCompareValue([{ label: 'A' }, 'b'])).toBe('A, b');
  });

  it('stringifies array members it cannot recognise', () => {
    expect(formatCompareValue([1, true])).toBe('1, true');
  });

  it('serialises a plain object', () => {
    expect(formatCompareValue({ a: 1 })).toBe('{"a":1}');
  });

  it('renders zero and false rather than treating them as absent', () => {
    expect(formatCompareValue(0)).toBe('0');
    expect(formatCompareValue(false)).toBe('false');
  });

  it('renders an empty string for an absent value', () => {
    expect(formatCompareValue(null)).toBe('');
    expect(formatCompareValue(undefined)).toBe('');
    expect(formatCompareValue('')).toBe('');
  });
});

describe('isCompareIconField', () => {
  it('recognises both icon fields and nothing else', () => {
    expect(isCompareIconField('common:icon')).toBe(true);
    expect(isCompareIconField('common:icon-expanded')).toBe(true);
    expect(isCompareIconField('dc:title')).toBe(false);
  });
});

describe('resolveNuxeoIconPath', () => {
  it('leaves an already-prefixed path alone', () => {
    expect(resolveNuxeoIconPath('/nuxeo/icons/note.gif')).toBe('/nuxeo/icons/note.gif');
  });

  it('prefixes a server-absolute icons path', () => {
    expect(resolveNuxeoIconPath('/icons/note.gif')).toBe('/nuxeo/icons/note.gif');
  });

  it('prefixes a relative icons path with a separator', () => {
    expect(resolveNuxeoIconPath('icons/note.gif')).toBe('/nuxeo/icons/note.gif');
  });

  it('returns an unrecognised path unchanged', () => {
    expect(resolveNuxeoIconPath('https://cdn.example.com/note.gif')).toBe(
      'https://cdn.example.com/note.gif',
    );
  });

  it('returns an empty string for an empty path', () => {
    expect(resolveNuxeoIconPath('')).toBe('');
  });
});
