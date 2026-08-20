import { describe, expect, it } from 'vitest';

import { CITATIONS_EVENT_NAME, extractCitations } from './citations';

describe('CITATIONS_EVENT_NAME', () => {
  // The client matches this string exactly in `AgentRuntimeService.applyCustomEvent`.
  // A rename renders nothing and raises nothing — the single most expensive kind
  // of mismatch to diagnose, which is why it is asserted as a literal.
  it('is the name the client matches on', () => {
    expect(CITATIONS_EVENT_NAME).toBe('citations');
  });
});

describe('extractCitations', () => {
  it('lifts a citations array off a tool result', () => {
    expect(
      extractCitations({
        answer: 'Two contracts matched.',
        citations: [{ uid: 'doc-1', title: 'Contract A', path: '/ws/a' }],
      }),
    ).toEqual([{ uid: 'doc-1', title: 'Contract A', path: '/ws/a' }]);
  });

  // Content Lake ids are `sourceId__documentId`, and the chat panel routes
  // /doc/<uid>. Forwarding the raw objectId produces a source card that
  // navigates to a page that does not exist.
  it('reduces a Content Lake objectId to the Nuxeo document uid', () => {
    expect(
      extractCitations({ citations: [{ objectId: 'src-9__doc-7', title: 'Contract A' }] }),
    ).toEqual([{ uid: 'doc-7', title: 'Contract A' }]);
  });

  it('keeps an objectId that carries no source prefix', () => {
    expect(extractCitations({ citations: [{ objectId: 'doc-7' }] })).toEqual([
      { uid: 'doc-7', title: 'doc-7' },
    ]);
  });

  it('accepts id as well as uid, and carries the excerpt through', () => {
    expect(
      extractCitations({ citations: [{ id: 'doc-2', title: 'B', excerpt: 'clause 4' }] }),
    ).toEqual([{ uid: 'doc-2', title: 'B', excerpt: 'clause 4' }]);
  });

  it('falls back to the uid for a citation with no title', () => {
    expect(extractCitations({ citations: [{ uid: 'doc-3' }] })).toEqual([
      { uid: 'doc-3', title: 'doc-3' },
    ]);
  });

  // A card the user can click but that cannot resolve is worse than no card.
  it('drops an entry with no resolvable uid', () => {
    expect(extractCitations({ citations: [{ title: 'Nowhere' }, { uid: 'doc-1' }] })).toEqual([
      { uid: 'doc-1', title: 'doc-1' },
    ]);
  });

  it('collapses duplicates on uid, keeping the first', () => {
    expect(
      extractCitations({
        citations: [
          { uid: 'doc-1', title: 'First' },
          { uid: 'doc-1', title: 'Second' },
        ],
      }),
    ).toEqual([{ uid: 'doc-1', title: 'First' }]);
  });

  it.each([
    ['a result with no citations', { answer: 'no sources' }],
    ['a non-array citations field', { citations: 'doc-1' }],
    ['a primitive result', 'text'],
    ['null', null],
    ['an array result', [{ uid: 'doc-1' }]],
  ])('returns nothing for %s', (_label, result) => {
    expect(extractCitations(result)).toEqual([]);
  });
});
