import { readLayoutFile } from './layout-file';
import { DocumentTypeDefinition } from './layout.model';
import { applyLayoutFile, generateLayout, humanize, readDocumentType } from './resolve-layout';

/** Trimmed from a real `/config/types/Claim` response with `fetch-schema: fields`. */
const CLAIM_RESPONSE = {
  'entity-type': 'docType',
  name: 'Claim',
  parent: 'File',
  schemas: [
    { name: 'common', fields: { icon: 'string' } },
    { name: 'file', fields: { content: 'blob' } },
    {
      name: 'dublincore',
      '@prefix': 'dc',
      fields: {
        title: { type: 'string', constraints: [{ name: 'string', parameters: {} }] },
        subjects: {
          type: 'string[]',
          constraints: [],
          itemConstraints: [
            {
              name: 'directoryResolver',
              parameters: { directory: 'l10nsubjects', validation: 'true' },
            },
          ],
        },
      },
    },
    {
      name: 'claim',
      '@prefix': 'claim',
      fields: {
        status: {
          type: 'string',
          constraints: [
            {
              name: 'directoryResolver',
              parameters: { directory: 'claim_status', validation: 'true' },
            },
            { name: 'string', parameters: {} },
          ],
        },
        number: { type: 'string', constraints: [] },
        billedAmount: { type: 'double', constraints: [] },
        adjuster: {
          type: 'complex',
          fields: { name: { type: 'string', constraints: [] }, email: 'string' },
        },
      },
    },
  ],
};

const claim = (): DocumentTypeDefinition => {
  const type = readDocumentType(CLAIM_RESPONSE, 'Claim');
  if (!type) throw new Error('fixture did not read');
  return type;
};

describe('humanize', () => {
  it.each([
    ['billedAmount', 'Billed amount'],
    ['memberId', 'Member id'],
    ['memberID', 'Member ID'],
    ['payers_case', 'Payers case'],
    ['image_metadata', 'Image metadata'],
    ['claim', 'Claim'],
    ['HTMLBody', 'HTML body'],
    ['', ''],
  ])('%s → %s', (name, expected) => expect(humanize(name)).toBe(expected));
});

describe('readDocumentType', () => {
  it('reads prefixes, falling back to the schema name when Nuxeo reports none', () => {
    const prefixes = claim().schemas.map((schema) => [schema.name, schema.prefix]);
    expect(prefixes).toEqual([
      ['common', 'common'],
      ['file', 'file'],
      ['dublincore', 'dc'],
      ['claim', 'claim'],
    ]);
  });

  it('reads the vocabulary a value, or each item of a list, is bound to', () => {
    const fields = Object.fromEntries(
      claim().schemas.map((schema) => [schema.name, schema.fields]),
    );
    expect(fields['claim']?.['status']).toEqual({ type: 'string', directory: 'claim_status' });
    expect(fields['dublincore']?.['subjects']).toEqual({
      type: 'string[]',
      directory: 'l10nsubjects',
    });
    expect(fields['dublincore']?.['title']).toEqual({ type: 'string' });
    expect(fields['file']?.['content']).toEqual({ type: 'blob' });
  });

  it('reads complex sub-fields in both of the shapes Nuxeo answers with', () => {
    const adjuster = claim().schemas.find((schema) => schema.name === 'claim')?.fields['adjuster'];
    expect(adjuster).toEqual({
      type: 'complex',
      fields: { name: { type: 'string' }, email: { type: 'string' } },
    });
  });

  it('answers null for a body that is not a type', () => {
    expect(readDocumentType(null, 'Claim')).toBeNull();
    expect(readDocumentType({ name: 'Claim' }, 'Claim')).toBeNull();
  });

  it('skips schemas and fields it cannot read rather than failing the type', () => {
    const type = readDocumentType(
      {
        schemas: [
          { fields: { a: 'string' } },
          { name: 'x', fields: { a: 7, b: { constraints: [] }, c: 'long' } },
        ],
      },
      'X',
    );
    expect(type).toEqual({
      name: 'X',
      schemas: [{ name: 'x', prefix: 'x', fields: { c: { type: 'long' } } }],
    });
  });
});

describe('generateLayout', () => {
  it('gives each schema the panel does not already present a section, fields by name', () => {
    const layout = generateLayout(claim(), 'metadata');
    expect(layout.source).toBe('generated');
    expect(layout.display).toBe('sections');
    expect(layout.sections.map((section) => section.id)).toEqual(['claim']);
    expect(layout.sections[0]?.fields.map((field) => field.xpath)).toEqual([
      'claim:adjuster',
      'claim:billedAmount',
      'claim:number',
      'claim:status',
    ]);
  });

  it('labels a section and its fields by translation key first, then by readable name', () => {
    const [section] = generateLayout(claim(), 'metadata').sections;
    expect(section?.label).toEqual({ keys: ['layout.schema.claim'], fallback: 'Claim' });
    expect(section?.fields[1]?.label).toEqual({
      keys: ['layout.field.claim:billedAmount'],
      fallback: 'Billed amount',
    });
  });

  it('adds nothing to a stock File: every one of its schemas is already presented', () => {
    const file = readDocumentType(
      {
        schemas: ['common', 'file', 'dublincore', 'uid', 'files', 'facetedTag', 'relatedtext'].map(
          (name) => ({
            name,
            fields: { anything: 'string' },
          }),
        ),
      },
      'File',
    );
    expect(file && generateLayout(file, 'metadata').sections).toEqual([]);
  });

  it('adds nothing to a stock Picture, including the iptc schema a distribution may add', () => {
    const picture = readDocumentType(
      {
        schemas: [
          'common',
          'uid',
          'dublincore',
          'facetedTag',
          'file',
          'picture',
          'image_metadata',
          'iptc',
          'relatedtext',
        ].map((name) => ({ name, fields: { anything: 'string' } })),
      },
      'Picture',
    );
    expect(picture && generateLayout(picture, 'metadata').sections).toEqual([]);
  });

  it('shows a customer schema added to a stock type, and drops a schema with no fields', () => {
    const file = readDocumentType(
      {
        schemas: [
          { name: 'dublincore', '@prefix': 'dc', fields: { title: 'string' } },
          { name: 'contract', '@prefix': 'ct', fields: { party: 'string' } },
          { name: 'marker', fields: {} },
        ],
      },
      'File',
    );
    expect(file && generateLayout(file, 'metadata').sections.map((section) => section.id)).toEqual([
      'contract',
    ]);
  });
});

describe('applyLayoutFile', () => {
  const file = (content: Record<string, unknown>) => {
    const read = readLayoutFile(content);
    if ('invalid' in read) throw new Error(read.invalid);
    return read;
  };

  it('shows exactly the listed fields, in the file order, and nothing generated', () => {
    const { layout, skipped } = applyLayoutFile(
      claim(),
      'metadata',
      file({
        version: 1,
        display: 'tabs',
        sections: [
          { id: 'summary', label: 'Summary', fields: ['claim:status', 'claim:number'] },
          { id: 'more', labelKey: 'acme.more', fields: ['dc:title'] },
        ],
      }),
    );
    expect(skipped).toEqual([]);
    expect(layout.source).toBe('contributed');
    expect(layout.display).toBe('tabs');
    expect(
      layout.sections.map((section) => [section.id, section.fields.map((field) => field.xpath)]),
    ).toEqual([
      ['summary', ['claim:status', 'claim:number']],
      ['more', ['dc:title']],
    ]);
    expect(layout.sections.map((section) => section.label)).toEqual([
      { literal: 'Summary', keys: [], fallback: null },
      { keys: ['acme.more'], fallback: null },
    ]);
  });

  it('honours a field label literal and key ahead of the generated key', () => {
    const { layout } = applyLayoutFile(
      claim(),
      'metadata',
      file({
        version: 1,
        sections: [
          {
            id: 'a',
            fields: [{ field: 'claim:status', label: 'Status', labelKey: 'acme.status' }],
          },
        ],
      }),
    );
    expect(layout.sections[0]?.fields[0]?.label).toEqual({
      literal: 'Status',
      keys: ['acme.status', 'layout.field.claim:status'],
      fallback: 'Status',
    });
  });

  it('skips a field the type does not have and keeps the rest', () => {
    const { layout, skipped } = applyLayoutFile(
      claim(),
      'metadata',
      file({
        version: 1,
        sections: [{ id: 'a', fields: ['claim:nope', 'member:plan', 'claim:number'] }],
      }),
    );
    expect(skipped).toEqual(['claim:nope', 'member:plan']);
    expect(layout.sections[0]?.fields.map((field) => field.xpath)).toEqual(['claim:number']);
  });

  it('addresses a prefix-less schema by its name, as Nuxeo does', () => {
    const { layout, skipped } = applyLayoutFile(
      claim(),
      'metadata',
      file({ version: 1, sections: [{ id: 'a', fields: ['file:content'] }] }),
    );
    expect(skipped).toEqual([]);
    expect(layout.sections[0]?.fields[0]?.definition).toEqual({ type: 'blob' });
  });
});
