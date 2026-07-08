import { describe, expect, it } from 'vitest';

import type { DirectoryEntry, L10nDirectoryEntry } from '../models/directory.model';
import {
  formatHierarchicalL10nLabel,
  groupL10nChildrenByParent,
  l10nEntryLabel,
  resolveNatureLabel,
} from './l10n-directory.utils';

function l10nEntry(id: string, parent: string, labelEn: string): L10nDirectoryEntry {
  return {
    id,
    directoryName: 'l10ncoverage',
    properties: { id, parent, ordering: 0, obsolete: 0, label_en: labelEn },
  };
}

describe('l10n-directory.utils', () => {
  const coverageEntries: L10nDirectoryEntry[] = [
    l10nEntry('africa', '', 'Africa'),
    l10nEntry('tanzania', 'africa', 'Tanzania'),
  ];

  it('l10nEntryLabel falls back to id', () => {
    expect(l10nEntryLabel(l10nEntry('x', '', 'X'))).toBe('X');
    expect(
      l10nEntryLabel({
        id: 'y',
        directoryName: 'l10ncoverage',
        properties: { id: 'y', parent: '', ordering: 0, obsolete: 0 },
      }),
    ).toBe('y');
  });

  it('formatHierarchicalL10nLabel builds Parent/Child', () => {
    expect(formatHierarchicalL10nLabel('tanzania', coverageEntries)).toBe('Africa/Tanzania');
    expect(formatHierarchicalL10nLabel('africa', coverageEntries)).toBe('Africa');
    expect(formatHierarchicalL10nLabel('unknown', coverageEntries)).toBe('unknown');
  });

  it('resolveNatureLabel maps vocabulary id to display label', () => {
    const nature: DirectoryEntry[] = [
      {
        id: 'contract',
        label: 'contract',
        displayLabel: 'Contract',
        ordering: 0,
        obsolete: 0,
        directoryName: 'nature',
      },
    ];
    expect(resolveNatureLabel('contract', nature)).toBe('Contract');
    expect(resolveNatureLabel('missing', nature)).toBe('missing');
  });

  it('groupL10nChildrenByParent groups children under parent labels', () => {
    const groups = groupL10nChildrenByParent(coverageEntries);
    expect(groups).toHaveLength(1);
    expect(groups[0].parentLabel).toBe('Africa');
    expect(groups[0].entries.map((e) => e.id)).toEqual(['tanzania']);
  });
});
