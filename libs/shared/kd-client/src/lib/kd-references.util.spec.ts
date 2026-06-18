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
  parseAnswerSegments,
  referenceKey,
  referencesForObject,
  type KdAnswerResponse,
} from './kd-references.util';

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
});
