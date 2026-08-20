import { ContentError, type FilterSpec } from '@agentic-ui/shared/content-ports';

import { toNxqlWhere } from './filter.mapper';

describe('toNxqlWhere', () => {
  it('compiles each leaf kind', () => {
    expect(toNxqlWhere({ kind: 'eq', field: 'dc:title', value: 'Report' })).toBe(
      "dc:title = 'Report'",
    );
    expect(toNxqlWhere({ kind: 'in', field: 'ecm:primaryType', values: ['File', 'Note'] })).toBe(
      "ecm:primaryType IN ('File', 'Note')",
    );
    expect(
      toNxqlWhere({ kind: 'between', field: 'dc:modified', lo: '2026-01-01', hi: '2026-02-01' }),
    ).toBe("dc:modified BETWEEN '2026-01-01' AND '2026-02-01'");
    expect(toNxqlWhere({ kind: 'startsWith', field: 'ecm:path', value: '/default-domain' })).toBe(
      "ecm:path LIKE '/default-domain%'",
    );
    expect(toNxqlWhere({ kind: 'fullText', query: 'invoice' })).toBe("ecm:fulltext = 'invoice'");
  });

  it('nests boolean nodes with explicit parentheses', () => {
    const spec: FilterSpec<unknown> = {
      kind: 'and',
      clauses: [
        { kind: 'eq', field: 'ecm:primaryType', value: 'File' },
        {
          kind: 'or',
          clauses: [
            { kind: 'eq', field: 'dc:creator', value: 'alice' },
            { kind: 'not', clause: { kind: 'eq', field: 'dc:creator', value: 'bob' } },
          ],
        },
      ],
    };

    expect(toNxqlWhere(spec)).toBe(
      "(ecm:primaryType = 'File' AND (dc:creator = 'alice' OR NOT (dc:creator = 'bob')))",
    );
  });

  it('escapes embedded quotes so a value cannot terminate the literal', () => {
    const spec: FilterSpec<unknown> = {
      kind: 'eq',
      field: 'dc:title',
      value: "' OR 1=1 --",
    };
    expect(toNxqlWhere(spec)).toBe("dc:title = ''' OR 1=1 --'");
  });

  it('rejects a field reference that is not a valid NXQL field', () => {
    const spec: FilterSpec<unknown> = {
      kind: 'eq',
      field: "dc:title = 'x' OR 1=1",
      value: 'ignored',
    };
    expect(() => toNxqlWhere(spec)).toThrow(ContentError);
    expect(() => toNxqlWhere(spec)).toThrow(/not a valid NXQL field/);
  });

  it('maps empty boolean nodes to their identity rather than empty SQL', () => {
    expect(toNxqlWhere({ kind: 'and', clauses: [] })).toBe('1 = 1');
    expect(toNxqlWhere({ kind: 'or', clauses: [] })).toBe('1 = 0');
    expect(toNxqlWhere({ kind: 'in', field: 'dc:creator', values: [] })).toBe('1 = 0');
  });

  it('renders non-string scalars without quoting them as text', () => {
    expect(toNxqlWhere({ kind: 'eq', field: 'common:size', value: 1024 })).toBe(
      'common:size = 1024',
    );
    expect(toNxqlWhere({ kind: 'eq', field: 'ecm:isTrashed', value: false })).toBe(
      'ecm:isTrashed = 0',
    );
    expect(toNxqlWhere({ kind: 'eq', field: 'dc:expired', value: null })).toBe('dc:expired = NULL');
  });
});
