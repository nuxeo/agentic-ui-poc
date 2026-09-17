import { extractIngestSourceIdsFromAgent, collectIngestSourceIds } from './kd-ingest-source-ids';

describe('extractIngestSourceIdsFromAgent', () => {
  it('returns sourceIds when the agent exposes them directly', () => {
    expect(
      extractIngestSourceIdsFromAgent({
        sourceIds: ['source-1', 'source-2'],
      }),
    ).toEqual(['source-1', 'source-2']);
  });

  it('reads __sourceId__ from staticFilterExpression when sourceIds is empty', () => {
    expect(
      extractIngestSourceIdsFromAgent({
        sourceIds: [],
        staticFilterExpression: {
          field: '__sourceId__',
          type: 'Text',
          value: 'efffbf29-7d45-47ec-a7f0-7a9c5df8413b',
          operator: 'Equals',
        },
      }),
    ).toEqual(['efffbf29-7d45-47ec-a7f0-7a9c5df8413b']);
  });

  it('returns an empty array when no source binding is present', () => {
    expect(
      extractIngestSourceIdsFromAgent({
        sourceIds: [],
        staticFilterExpression: null,
      }),
    ).toEqual([]);
  });
});

describe('collectIngestSourceIds', () => {
  it('deduplicates source ids across agents', () => {
    expect(
      collectIngestSourceIds([
        {
          sourceIds: [],
          staticFilterExpression: {
            field: '__sourceId__',
            value: 'source-a',
          },
        },
        {
          sourceIds: ['source-a', 'source-b'],
        },
      ]),
    ).toEqual(['source-a', 'source-b']);
  });
});
