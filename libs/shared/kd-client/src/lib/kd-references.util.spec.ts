import { describe, expect, it } from 'vitest';

import {
  buildIndexedReferences,
  enrichCitationsFromObjectReferences,
  extractNuxeoDocumentId,
  extractReferenceContent,
  findReferenceByIndex,
  findReferenceByKey,
  findReferenceForCitation,
  flattenObjectReferencesToCitations,
  formatReferenceExcerpt,
  formatReferenceLabel,
  getMaxCitationIndex,
  mergeCitationExcerpts,
  mergeObjectReferenceContent,
  normalizeObjectReferenceEntry,
  normalizeObjectReferences,
  parseAnswerSegments,
  referenceKey,
  referencesForObject,
} from './kd-references.util';
// `KdAnswerResponse` and friends live in `kd.models` and are only *imported* by
// `kd-references.util`, not re-exported from it. Importing the type from the util
// module compiled under Vitest (esbuild strips types without resolving them) but
// failed `tsc --noEmit` with TS2459 — one of the pre-existing type errors this file
// shipped with.
import type { KdAnswerResponse, KdCitation, KdObjectReference } from './kd.models';

/**
 * Fills every field of `KdAnswerResponse`, including the optional ones, and returns
 * the declared type without a trailing `as KdAnswerResponse`.
 *
 * The cast is what the type is for: a partial object cast to `KdAnswerResponse` keeps
 * compiling when the interface gains a required field, so the fixture silently drifts
 * away from the shape the code is really handed.
 */
function answerWith(overrides: Partial<KdAnswerResponse> = {}): KdAnswerResponse {
  return {
    questionId: 'q-1',
    agentId: 'agent-1',
    agentVersion: 1,
    question: 'Q?',
    status: 'Complete',
    answer: 'A',
    citations: [],
    objectReferences: [],
    feedback: null,
    staticFilter: null,
    dynamicFilter: null,
    error: null,
    ...overrides,
  };
}

describe('kd-references.util', () => {
  it('extracts the Nuxeo document id from a Content Lake object id', () => {
    expect(extractNuxeoDocumentId('source-id__document-id')).toBe('document-id');
    expect(extractNuxeoDocumentId('plain-object-id')).toBeNull();
  });

  it('flattens objectReferences in API order when citations are insufficient', () => {
    const answer: KdAnswerResponse = {
      questionId: 'q-1',
      agentId: 'agent-1',
      question: 'Who is Holmes?',
      status: 'Complete',
      answer: 'Holmes is a detective [1] and Watson agrees [2].',
      citations: [
        {
          objectId: 'source-id__document-id',
          referenceId: 'chunk-1',
          title: 'Sherlock story',
          score: 0.42,
        },
      ],
      objectReferences: [
        {
          objectId: 'source-id__document-id',
          references: [
            { referenceId: 'chunk-2', rank: 2, rankScore: 0.21, content: 'Second chunk' },
            { referenceId: 'chunk-1', rank: 1, rankScore: 0.42, content: 'First chunk' },
          ],
        },
      ],
    };

    expect(buildIndexedReferences(answer)).toEqual([
      expect.objectContaining({
        index: 1,
        referenceId: 'chunk-2',
        content: 'Second chunk',
        title: 'Sherlock story',
      }),
      expect.objectContaining({
        index: 2,
        referenceId: 'chunk-1',
        content: 'First chunk',
      }),
    ]);
  });

  it('prefers citations array order when it matches inline markers', () => {
    const answer: KdAnswerResponse = {
      questionId: 'q-1',
      agentId: 'agent-1',
      question: 'Summarize KE',
      status: 'Complete',
      answer: 'Setup step one [1] and step two [2].',
      citations: [
        {
          objectId: 'source-id__document-id',
          referenceId: 'chunk-1',
          title: 'KE guide',
          excerpt: 'Install the connector package.',
        },
        {
          objectId: 'source-id__document-id',
          referenceId: 'chunk-2',
          title: 'KE guide',
          excerpt: 'Provision external applications.',
        },
      ],
      objectReferences: [
        {
          objectId: 'source-id__document-id',
          references: [
            { referenceId: 'chunk-2', rank: 2, pageNumber: 7, content: 'Provision external apps.' },
            {
              referenceId: 'chunk-1',
              rank: 1,
              pageNumber: 3,
              content: 'Install the connector package.',
            },
          ],
        },
      ],
    };

    expect(buildIndexedReferences(answer)).toEqual([
      expect.objectContaining({
        index: 1,
        referenceId: 'chunk-1',
        pageNumber: 3,
        content: 'Install the connector package.',
      }),
      expect.objectContaining({
        index: 2,
        referenceId: 'chunk-2',
        pageNumber: 7,
        content: 'Provision external apps.',
      }),
    ]);
  });

  it('reports the highest inline citation marker in answer text', () => {
    expect(getMaxCitationIndex('See [1], [3], and [^7].')).toBe(7);
    expect(getMaxCitationIndex('No markers here.')).toBe(0);
  });

  it('truncates long reference excerpts for display', () => {
    const excerpt = formatReferenceExcerpt('a'.repeat(500), 100);
    expect(excerpt).toHaveLength(101);
    expect(excerpt.endsWith('…')).toBe(true);
  });

  it('keys and labels references by referenceId', () => {
    const reference = {
      index: 2,
      objectId: 'source__doc',
      referenceId: 'chunk-abc',
      content: 'Quoted text',
    };

    expect(referenceKey(reference)).toBe('source__doc::chunk-abc');
    expect(findReferenceByKey([reference], 'source__doc::chunk-abc')).toEqual(reference);
    expect(formatReferenceLabel(reference)).toBe('chunk-abc');
    expect(formatReferenceLabel({ ...reference, referenceId: undefined })).toBe('Citation 2');
  });

  it('parses inline citation markers from answer text', () => {
    expect(parseAnswerSegments('Holmes is a detective [1].')).toEqual([
      { type: 'text', text: 'Holmes is a detective ' },
      { type: 'citation', index: 1 },
      { type: 'text', text: '.' },
    ]);
    expect(parseAnswerSegments('See footnote [^2] and parenthetical (3).')).toEqual([
      { type: 'text', text: 'See footnote ' },
      { type: 'citation', index: 2 },
      { type: 'text', text: ' and parenthetical ' },
      { type: 'citation', index: 3 },
      { type: 'text', text: '.' },
    ]);
  });

  it('extracts reference content from alternate API field names', () => {
    expect(extractReferenceContent({ snippet: 'Quoted passage' })).toBe('Quoted passage');
    expect(extractReferenceContent({ text: 'Another passage' })).toBe('Another passage');
  });

  it('ignores Nuxeo folder paths masquerading as reference content', () => {
    expect(
      extractReferenceContent({ content: '/default-domain/workspaces/demo/file.pdf' }),
    ).toBeUndefined();
  });

  it('enriches citation excerpts from objectReferences content', () => {
    const citations = enrichCitationsFromObjectReferences(
      [{ objectId: 'source__doc', referenceId: 'chunk-1', title: 'Doc' }],
      [
        {
          objectId: 'source__doc',
          references: [{ referenceId: 'chunk-1', content: 'Quoted passage from source.' }],
        },
      ],
    );

    expect(citations[0]?.excerpt).toBe('Quoted passage from source.');
  });

  it('flattens objectReferences into per-chunk citations', () => {
    expect(
      flattenObjectReferencesToCitations([
        {
          objectId: 'source__doc',
          references: [
            { referenceId: 'chunk-1', content: 'First excerpt' },
            { referenceId: 'chunk-2', content: 'Second excerpt' },
          ],
        },
      ]),
    ).toEqual([
      expect.objectContaining({ referenceId: 'chunk-1', excerpt: 'First excerpt' }),
      expect.objectContaining({ referenceId: 'chunk-2', excerpt: 'Second excerpt' }),
    ]);
  });

  it('merges citation excerpts from a fuller answer payload', () => {
    const merged = mergeCitationExcerpts(
      [{ objectId: 'source__doc', referenceId: 'chunk-1', title: 'Doc' }],
      [
        {
          objectId: 'source__doc',
          referenceId: 'chunk-1',
          title: 'Doc',
          excerpt: 'Merged excerpt',
        },
      ],
    );

    expect(merged[0]?.excerpt).toBe('Merged excerpt');
  });

  it('falls back to citation excerpts when objectReferences omit content', () => {
    const references = buildIndexedReferences({
      questionId: 'q-1',
      agentId: 'agent-1',
      question: 'Q?',
      status: 'Complete',
      answer: 'A [1]',
      citations: [
        {
          objectId: 'source__doc',
          referenceId: 'chunk-1',
          title: 'Doc',
          excerpt: 'Passage from citation enrichment',
        },
      ],
      objectReferences: [
        {
          objectId: 'source__doc',
          references: [{ referenceId: 'chunk-1', rankScore: 0.9 }],
        },
      ],
    });

    expect(references[0]?.content).toBe('Passage from citation enrichment');
  });

  it('finds references by index and citation', () => {
    const references = buildIndexedReferences({
      questionId: 'q-1',
      agentId: 'agent-1',
      question: 'Q?',
      status: 'Complete',
      answer: 'A',
      citations: [{ objectId: 'source__doc', title: 'Doc', referenceId: 'chunk-1' }],
      objectReferences: [
        {
          objectId: 'source__doc',
          references: [{ referenceId: 'chunk-1', content: 'Quoted text' }],
        },
      ],
    });

    expect(findReferenceByIndex(references, 1)?.content).toBe('Quoted text');
    expect(
      findReferenceForCitation(references, {
        objectId: 'source__doc',
        referenceId: 'chunk-1',
        title: 'Doc',
      })?.index,
    ).toBe(1);
    expect(referencesForObject(references, 'source__doc')).toHaveLength(1);
  });

  it('returns no content for a reference payload that is absent or not an object', () => {
    expect(extractReferenceContent(null)).toBeUndefined();
    expect(extractReferenceContent(undefined)).toBeUndefined();
    // Every recognised key present but blank: the whitespace guard must reject all of
    // them rather than returning an empty excerpt the sidebar would render as a gap.
    expect(extractReferenceContent({ content: '   ', text: '', snippet: '\n' })).toBeUndefined();
    expect(extractReferenceContent({ referenceId: 'chunk-1', rank: 1 })).toBeUndefined();
  });

  it('prefers the first populated alternate content key in priority order', () => {
    expect(
      extractReferenceContent({
        passage: 'From passage',
        excerpt: 'From excerpt',
        chunkContent: 'From chunkContent',
        referenceContent: 'From referenceContent',
      }),
    ).toBe('From passage');
  });

  /**
   * NOTE: this asserts what `normalizeObjectReferenceEntry` *does*, which is not what it
   * evidently *intends*.
   *
   * Each field is written as `typeof raw['x'] === 'number' ? raw['x'] : typed.x`, but
   * `typed` is the *same object* as `raw` (`reference as KdObjectReferenceEntry`), so the
   * "else" branch hands back the identical value the `typeof` guard just rejected. The
   * guard therefore cannot reject anything: a `referenceId` of `42` is passed straight
   * through into a field the models declare as `string | undefined`.
   *
   * The evident intent was to drop mistyped upstream fields (i.e. fall back to
   * `undefined`). Asserted as-is rather than fixed: dropping the values changes what the
   * citation sidebar and the reference dialog receive from a real Discovery payload, which
   * is a product decision, not a side effect of a coverage task. Recorded so that fixing
   * it turns this assertion red on purpose.
   */
  it('passes mistyped reference fields straight through — the typeof guards are no-ops', () => {
    const normalized = normalizeObjectReferenceEntry({
      referenceId: 42,
      rank: 'first',
      rankScore: null,
      pageNumber: '3',
      content: 'Quoted passage',
    });

    expect(normalized).toEqual({
      referenceId: 42,
      rank: 'first',
      rankScore: null,
      pageNumber: '3',
      content: 'Quoted passage',
    });
  });

  it('normalizes each reference entry and keeps an empty or absent list untouched', () => {
    const empty: KdObjectReference[] = [];
    expect(normalizeObjectReferences(undefined)).toBeUndefined();
    expect(normalizeObjectReferences(empty)).toBe(empty);

    const normalized = normalizeObjectReferences([
      {
        objectId: 'source__doc',
        references: [{ referenceId: 'chunk-1', rank: 1, rankScore: 0.5, pageNumber: 2 }],
      },
    ]);

    expect(normalized).toEqual([
      {
        objectId: 'source__doc',
        references: [
          {
            referenceId: 'chunk-1',
            rank: 1,
            rankScore: 0.5,
            pageNumber: 2,
            content: undefined,
          },
        ],
      },
    ]);
  });

  describe('mergeObjectReferenceContent', () => {
    const current: KdObjectReference[] = [
      { objectId: 'source__doc', references: [{ referenceId: 'chunk-1', rankScore: 0.42 }] },
    ];
    const incoming: KdObjectReference[] = [
      {
        objectId: 'source__doc',
        references: [{ referenceId: 'chunk-1', content: 'Passage from the persisted answer.' }],
      },
    ];

    it('returns the current list untouched when the incoming payload has nothing to add', () => {
      expect(mergeObjectReferenceContent(current, undefined)).toBe(current);
      expect(mergeObjectReferenceContent(current, [])).toBe(current);
    });

    it('returns the incoming list when there is nothing to merge into', () => {
      expect(mergeObjectReferenceContent(undefined, incoming)).toBe(incoming);
      expect(mergeObjectReferenceContent([], incoming)).toBe(incoming);
    });

    it('copies content onto the matching reference and leaves the rest alone', () => {
      const merged = mergeObjectReferenceContent(
        [
          {
            objectId: 'source__doc',
            references: [
              { referenceId: 'chunk-1', rankScore: 0.42 },
              { referenceId: 'chunk-2', rankScore: 0.21, content: 'Already present.' },
              { referenceId: 'chunk-3', rankScore: 0.1 },
            ],
          },
          { objectId: 'source__other', references: [{ referenceId: 'chunk-1' }] },
        ],
        [
          {
            objectId: 'source__doc',
            references: [
              { referenceId: 'chunk-1', content: 'Merged passage.' },
              // No content: must not overwrite chunk-2's existing excerpt with undefined.
              { referenceId: 'chunk-2' },
            ],
          },
        ],
      );

      expect(merged?.[0]?.references).toEqual([
        { referenceId: 'chunk-1', rankScore: 0.42, content: 'Merged passage.' },
        { referenceId: 'chunk-2', rankScore: 0.21, content: 'Already present.' },
        { referenceId: 'chunk-3', rankScore: 0.1 },
      ]);
      // A different objectId shares the same referenceId; it must not pick up the content.
      expect(merged?.[1]?.references).toEqual([{ referenceId: 'chunk-1' }]);
    });
  });

  describe('mergeCitationExcerpts', () => {
    const current: KdCitation[] = [
      { objectId: 'source__doc', referenceId: 'chunk-1', title: 'Doc' },
    ];
    const incoming: KdCitation[] = [
      { objectId: 'source__doc', referenceId: 'chunk-1', title: 'Doc', excerpt: 'Merged excerpt' },
    ];

    it('returns the current list when the incoming payload has no citations', () => {
      expect(mergeCitationExcerpts(current, undefined)).toBe(current);
      expect(mergeCitationExcerpts(current, [])).toBe(current);
      expect(mergeCitationExcerpts(undefined, undefined)).toEqual([]);
    });

    it('returns the incoming list when there is nothing to merge into', () => {
      expect(mergeCitationExcerpts(undefined, incoming)).toBe(incoming);
      expect(mergeCitationExcerpts([], incoming)).toBe(incoming);
    });

    it('falls back to an incoming excerpt keyed by objectId alone', () => {
      const merged = mergeCitationExcerpts(
        [
          { objectId: 'source__doc', referenceId: 'chunk-1', title: 'Doc' },
          { objectId: 'source__other', referenceId: 'chunk-1', title: 'Other' },
        ],
        // No referenceId, so this is stored under the `objectId::` key only.
        [{ objectId: 'source__doc', title: 'Doc', excerpt: 'Object-level excerpt' }],
      );

      expect(merged[0]?.excerpt).toBe('Object-level excerpt');
      // A different object must not inherit it.
      expect(merged[1]?.excerpt).toBeUndefined();
    });
  });

  it('enriches citations against an absent objectReferences list without throwing', () => {
    const citations = enrichCitationsFromObjectReferences(
      [{ objectId: 'source__doc', referenceId: 'chunk-1', title: 'Doc', excerpt: 'Kept as-is' }],
      undefined,
    );

    expect(citations).toEqual([
      { objectId: 'source__doc', referenceId: 'chunk-1', title: 'Doc', excerpt: 'Kept as-is' },
    ]);
    expect(enrichCitationsFromObjectReferences([], undefined)).toEqual([]);
  });

  it('falls back to the raw objectId as a citation title when it carries no document id', () => {
    expect(
      flattenObjectReferencesToCitations([
        {
          objectId: 'plain-object-id',
          references: [{ referenceId: 'chunk-1', content: 'Passage' }],
        },
      ]),
    ).toEqual([
      {
        objectId: 'plain-object-id',
        referenceId: 'chunk-1',
        title: 'plain-object-id',
        excerpt: 'Passage',
        score: undefined,
      },
    ]);
  });

  it('flattens nothing when there are no objectReferences', () => {
    expect(flattenObjectReferencesToCitations(undefined)).toEqual([]);
    expect(flattenObjectReferencesToCitations([])).toEqual([]);
  });

  it('formats a blank excerpt as an empty string and a short one verbatim', () => {
    expect(formatReferenceExcerpt(undefined)).toBe('');
    expect(formatReferenceExcerpt('')).toBe('');
    expect(formatReferenceExcerpt('   \n  ')).toBe('');
    expect(formatReferenceExcerpt('  Short passage.  ')).toBe('Short passage.');
    // Exactly at the limit must not be truncated.
    expect(formatReferenceExcerpt('a'.repeat(10), 10)).toBe('a'.repeat(10));
  });

  it('indexes a citation that has no matching reference and no excerpt', () => {
    const references = buildIndexedReferences(
      answerWith({
        answer: 'A statement with no inline marker.',
        citations: [{ objectId: 'source__doc', referenceId: 'chunk-1', title: 'Doc', score: 0.5 }],
        objectReferences: [],
      }),
    );

    expect(references).toEqual([
      {
        index: 1,
        objectId: 'source__doc',
        referenceId: 'chunk-1',
        content: undefined,
        pageNumber: undefined,
        rank: undefined,
        rankScore: 0.5,
        title: 'Doc',
      },
    ]);
  });

  it('matches a citation to an unlabelled reference entry for the same object', () => {
    const references = buildIndexedReferences(
      answerWith({
        answer: 'Holmes is a detective [1].',
        citations: [{ objectId: 'source__doc', referenceId: 'chunk-1', title: 'Doc' }],
        objectReferences: [
          {
            objectId: 'source__doc',
            // No referenceId at all, so it can only be found by the objectId-only key.
            references: [{ rank: 1, rankScore: 0.5, pageNumber: 4, content: 'Unlabelled passage' }],
          },
        ],
      }),
    );

    expect(references).toEqual([
      expect.objectContaining({
        index: 1,
        referenceId: 'chunk-1',
        content: 'Unlabelled passage',
        pageNumber: 4,
        rank: 1,
        rankScore: 0.5,
      }),
    ]);
  });

  it('resolves reference content from the objectId-only citation excerpt', () => {
    const references = buildIndexedReferences(
      answerWith({
        // Two markers against one citation forces the objectReferences ordering branch.
        answer: 'First claim [1] and second claim [2].',
        citations: [
          {
            objectId: 'source__doc',
            referenceId: 'chunk-1',
            title: 'Doc',
            excerpt: 'Cited passage',
          },
        ],
        objectReferences: [
          { objectId: 'source__doc', references: [{ referenceId: 'chunk-9', rankScore: 0.2 }] },
        ],
      }),
    );

    expect(references).toEqual([
      {
        index: 1,
        objectId: 'source__doc',
        referenceId: 'chunk-9',
        content: 'Cited passage',
        pageNumber: undefined,
        rank: undefined,
        rankScore: 0.2,
        title: 'Doc',
      },
    ]);
  });

  it('indexes citations directly when the markers outrun them and there are no objectReferences', () => {
    const references = buildIndexedReferences(
      answerWith({
        answer: 'Claim one [1] and claim two [2].',
        citations: [
          {
            objectId: 'source__doc',
            referenceId: 'chunk-1',
            title: 'Doc',
            excerpt: 'Only passage',
            score: 0.7,
          },
        ],
        objectReferences: undefined,
      }),
    );

    expect(references).toEqual([
      {
        index: 1,
        objectId: 'source__doc',
        referenceId: 'chunk-1',
        content: 'Only passage',
        rankScore: 0.7,
        title: 'Doc',
      },
    ]);
  });

  it('treats a [0] marker as text rather than a citation', () => {
    expect(parseAnswerSegments('Item [0] is not a citation.')).toEqual([
      { type: 'text', text: 'Item ' },
      { type: 'text', text: '[0]' },
      { type: 'text', text: ' is not a citation.' },
    ]);
  });

  it('returns a single text segment for answer text with no markers', () => {
    expect(parseAnswerSegments('')).toEqual([{ type: 'text', text: '' }]);
    expect(parseAnswerSegments('Plain answer.')).toEqual([{ type: 'text', text: 'Plain answer.' }]);
  });

  it('falls back to the first reference for the object when the referenceId does not match', () => {
    const references = buildIndexedReferences(
      answerWith({
        citations: [{ objectId: 'source__doc', referenceId: 'chunk-1', title: 'Doc' }],
        objectReferences: [
          { objectId: 'source__doc', references: [{ referenceId: 'chunk-1', content: 'Quoted' }] },
        ],
      }),
    );

    // Present first: the exact match resolves.
    expect(
      findReferenceForCitation(references, {
        objectId: 'source__doc',
        referenceId: 'chunk-1',
        title: 'Doc',
      })?.referenceId,
    ).toBe('chunk-1');
    // Then the fallback: an unknown referenceId still resolves via the objectId.
    expect(
      findReferenceForCitation(references, {
        objectId: 'source__doc',
        referenceId: 'chunk-unknown',
        title: 'Doc',
      })?.referenceId,
    ).toBe('chunk-1');
    // And a different object resolves to nothing at all.
    expect(
      findReferenceForCitation(references, { objectId: 'other__doc', title: 'Other' }),
    ).toBeUndefined();
  });

  it('finds nothing for an index or key that is not present', () => {
    const references = buildIndexedReferences(
      answerWith({
        citations: [{ objectId: 'source__doc', referenceId: 'chunk-1', title: 'Doc' }],
        objectReferences: [],
      }),
    );

    expect(findReferenceByIndex(references, 1)?.objectId).toBe('source__doc');
    expect(findReferenceByIndex(references, 2)).toBeUndefined();
    expect(findReferenceByKey(references, 'source__doc::chunk-1')?.index).toBe(1);
    expect(findReferenceByKey(references, 'source__doc::chunk-2')).toBeUndefined();
    expect(referencesForObject(references, 'source__doc')).toHaveLength(1);
    expect(referencesForObject(references, 'other__doc')).toEqual([]);
  });

  it('keys an unlabelled reference by its index', () => {
    expect(referenceKey({ objectId: 'source__doc', index: 3 })).toBe('source__doc::@3');
    expect(referenceKey({ objectId: 'source__doc', referenceId: 'chunk-1', index: 3 })).toBe(
      'source__doc::chunk-1',
    );
  });
});
