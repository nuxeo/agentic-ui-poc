import {
  buildVocabularyTableColumns,
  defaultVocabularyLabel,
  directoryAdminTableLabel,
  directoryEntryDisplayLabel,
  directoryPickerLabel,
  filterDirectoryPickerEntries,
  formatDirectoryEntryId,
  directoryShowsParentField,
  isManagedDirectory,
  isManagedDirectoryName,
  entryPropertiesIncludeParent,
  getDirectoryMetadata,
  vocabularyParentRequired,
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

  it('directoryAdminTableLabel returns the stored label value', () => {
    expect(
      directoryAdminTableLabel({
        label: 'label.directories.country.Afghanistan',
      }),
    ).toBe('label.directories.country.Afghanistan');
  });

  it('isManagedDirectoryName excludes known system directory names', () => {
    expect(isManagedDirectoryName('eventTypes')).toBe(false);
    expect(isManagedDirectoryName('country')).toBe(true);
  });

  it('isManagedDirectory excludes system directories like Web UI', () => {
    expect(isManagedDirectory({ type: 'system' })).toBe(false);
    expect(isManagedDirectory({ type: 'vocabulary' })).toBe(true);
    expect(isManagedDirectory({})).toBe(true);
  });

  it('filterDirectoryPickerEntries matches id or displayLabel and sorts alphabetically', () => {
    const entries = [
      {
        id: 'custom-entry-alpha',
        label: 'label.directories.nature.custom-entry-alpha',
        displayLabel: 'Custom Entry Alpha',
        ordering: 1,
        obsolete: 0,
        directoryName: 'nature',
      },
      {
        id: 'brand-new-term',
        label: 'label.directories.nature.brand-new-term',
        displayLabel: 'Brand New Term',
        ordering: 2,
        obsolete: 0,
        directoryName: 'nature',
      },
    ];

    expect(filterDirectoryPickerEntries(entries, 'brand')).toEqual([entries[1]]);
    expect(filterDirectoryPickerEntries(entries).map((entry) => entry.id)).toEqual([
      'brand-new-term',
      'custom-entry-alpha',
    ]);
  });

  it('directoryPickerLabel formats arbitrary custom ids from any vocabulary directory', () => {
    expect(
      directoryPickerLabel({
        id: 'my-new-vocab-id',
        label: 'label.directories.country.my-new-vocab-id',
        displayLabel: 'label.directories.country.my-new-vocab-id',
      }),
    ).toBe('My New Vocab Id');

    expect(
      directoryPickerLabel({
        id: 'edited-term',
        label: 'Renamed Label From Admin',
        displayLabel: 'Renamed Label From Admin',
      }),
    ).toBe('Renamed Label From Admin');
  });

  it('directoryPickerLabel prefers absoluteLabel then displayLabel then i18n fallback', () => {
    expect(
      directoryPickerLabel({
        id: 'contract',
        label: 'label.directories.nature.contract',
        displayLabel: 'Contract',
      }),
    ).toBe('Contract');

    expect(
      directoryPickerLabel({
        id: 'my-custom',
        label: 'label.directories.nature.my-custom',
        displayLabel: 'label.directories.nature.my-custom',
        absoluteLabel: 'Custom Absolute',
      }),
    ).toBe('Custom Absolute');

    expect(
      directoryPickerLabel({
        id: 'my-custom',
        label: 'label.directories.nature.my-custom',
        displayLabel: 'label.directories.nature.my-custom',
      }),
    ).toBe('My Custom');
  });

  it('directoryPickerLabel resolves Publication from i18n key using entry id', () => {
    expect(
      directoryPickerLabel({
        id: 'Publication',
        label: 'label.directories.nature.Publication',
        displayLabel: 'label.directories.nature.Publication',
      }),
    ).toBe('Publication');

    expect(
      directoryPickerLabel({
        id: 'publication',
        displayLabel: 'label.directories.nature.publication',
      }),
    ).toBe('Publication');
  });

  it('directoryPickerLabel ignores i18n absoluteLabel from SuggestEntries', () => {
    expect(
      directoryPickerLabel({
        id: 'Publication',
        label: 'label.directories.nature.Publication',
        displayLabel: 'label.directories.nature.Publication',
        absoluteLabel: 'label.directories.nature.Publication',
      }),
    ).toBe('Publication');
  });

  it('formatDirectoryEntryId extracts the id segment from an i18n key path', () => {
    expect(formatDirectoryEntryId('label.directories.nature.Publication')).toBe('Publication');
  });

  it('filterDirectoryPickerEntries matches resolved picker labels', () => {
    const entries = [
      {
        id: 'Publication',
        label: 'label.directories.nature.Publication',
        displayLabel: 'label.directories.nature.Publication',
        ordering: 1,
        obsolete: 0,
        directoryName: 'nature',
      },
    ];

    expect(filterDirectoryPickerEntries(entries, 'publ')).toEqual(entries);
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

  it('requires parent only for external parent vocabularies', () => {
    expect(
      vocabularyParentRequired('country', {
        name: 'country',
        schema: 'xvocabulary',
        parentDirectory: 'continent',
      }),
    ).toBe(true);
    expect(vocabularyParentRequired('l10nsubjects')).toBe(false);
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
