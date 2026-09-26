import { ObjectDataColumn } from '@alfresco/adf-core';
import { describe, expect, it } from 'vitest';

import type { ExtensionColumnDescriptor } from '@nuxeo-satori/platform/extensions';

import { TEXT_CELL_MAX_LENGTH, toDataColumns } from './adf-hx-columns';

const identity = (key: string): string => key;

const column = (field: string, label = field): ExtensionColumnDescriptor => ({
  id: `col.${field}`,
  field,
  label,
});

describe('toDataColumns — long text cells', () => {
  it('keeps text cells on one line and gives long values their full text as a tooltip', () => {
    const [title, contributor] = toDataColumns(
      [column('title', 'Title'), column('lastContributor', 'Last Contributor')],
      identity,
    );

    for (const col of [title, contributor]) {
      expect(col.type).toBe('text');
      expect(col.cssClass).toBe('adf-ellipsis-cell');
      expect(col.maxTextLength).toBe(TEXT_CELL_MAX_LENGTH);
    }
  });

  it('leaves date cells alone, since a formatted date never needs truncating', () => {
    const [modified] = toDataColumns([column('modified', 'Modified')], identity);

    expect(modified.type).toBe('date');
    expect(modified.cssClass).toBeUndefined();
    expect(modified.maxTextLength).toBeUndefined();
  });

  it("survives adf-core's ObjectDataColumn copy, which is what the DataTable actually renders", () => {
    // The table rebuilds every `[columns]` entry through this constructor and keeps only the
    // properties it copies. `formatTooltip` is not one of them, which is why it is not used here.
    const [rendered] = toDataColumns([column('title', 'Title')], identity).map(
      (col) => new ObjectDataColumn(col),
    );

    expect(rendered.cssClass).toBe('adf-ellipsis-cell');
    expect(rendered.maxTextLength).toBe(TEXT_CELL_MAX_LENGTH);
  });
});
