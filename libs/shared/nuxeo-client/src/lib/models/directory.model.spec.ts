import {
  buildVocabularyTableColumns,
  defaultVocabularyLabel,
  directoryEntryDisplayLabel,
  directoryShowsParentField,
  entryPropertiesIncludeParent,
  getDirectoryMetadata,
  vocabularySupportsParent,
  vocabularyTableColumns,
} from './directory.model';

describe('directory.model', () => {
  it('detects parent property keys like Nuxeo Web UI', () => {
    expect(entryPropertiesIncludeParent(['parent', 'id', 'label'])).toBe(true);
    expect(entryPropertiesIncludeParent(['id', 'label'])).toBe(false);
  });

  it('builds table columns with parent first when present', () => {
    expect(buildVocabularyTableColumns(['parent', 'ordering', 'obsolete', 'id', 'label'])).toEqual([
      'parent',
      'id',
      'label',
      'obsolete',
      'ordering',
      'actions',
    ]);
    expect(buildVocabularyTableColumns(['id', 'label'])).toEqual([
      'id',
      'label',
      'obsolete',
      'ordering',
      'actions',
    ]);
  });

  it('always includes obsolete, ordering, and actions even when omitted from API keys', () => {
    expect(buildVocabularyTableColumns(['parent', 'id', 'label'])).toEqual([
      'parent',
      'id',
      'label',
      'obsolete',
      'ordering',
      'actions',
    ]);
  });

  it('shows parent for xvocabulary when parent directory differs', () => {
    expect(
      directoryShowsParentField('country', {
        name: 'country',
        schema: 'xvocabulary',
        parentDirectory: 'continent',
      }),
    ).toBe(true);
  });

  it('looks up catalog metadata case-insensitively', () => {
    const catalog = new Map([
      ['country', { name: 'country', schema: 'xvocabulary', parentDirectory: 'continent' }],
    ]);
    expect(getDirectoryMetadata(catalog, 'Country')?.parentDirectory).toBe('continent');
  });

  it('builds default vocabulary label keys', () => {
    expect(defaultVocabularyLabel('country', 'Afghanistan')).toBe(
      'label.directories.country.Afghanistan',
    );
  });

  it('formats i18n directory entry labels for display', () => {
    expect(
      directoryEntryDisplayLabel({
        id: 'north-america',
        label: 'label.directories.continent.north-america',
      }),
    ).toBe('North America');
  });

  it('includes parent column for country via catalog metadata', () => {
    const columns = vocabularyTableColumns(
      'country',
      { name: 'country', schema: 'xvocabulary', parentDirectory: 'continent' },
      [
        {
          id: 'Afghanistan',
          directoryName: 'country',
          label: 'label.directories.country.Afghanistan',
          ordering: 10_000_000,
          obsolete: false,
          parent: 'asia',
          propertyKeys: ['id', 'label', 'obsolete', 'ordering'],
        },
      ],
    );
    expect(columns[0]).toBe('parent');
  });

  it('omits parent column for continent vocabulary', () => {
    const columns = vocabularyTableColumns(
      'continent',
      { name: 'continent', schema: 'vocabulary' },
      [
        {
          id: 'europe',
          directoryName: 'continent',
          label: 'label.directories.continent.europe',
          ordering: 10_000_000,
          obsolete: false,
          propertyKeys: ['id', 'label', 'obsolete', 'ordering'],
        },
      ],
    );
    expect(columns).not.toContain('parent');
  });
});
