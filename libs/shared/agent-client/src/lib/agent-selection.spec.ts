import { TestBed } from '@angular/core/testing';
import { describe, expect, it, beforeEach } from 'vitest';

import {
  AgentSelectionStore,
  MAX_PROPOSED_DOCUMENT_IDS,
  readProposedSelection,
} from './agent-selection';

/**
 * The provenance rule, tested adversarially.
 *
 * The scenario every case here is drawn from: a document the user asked about
 * contains text that steers the model. The model then tries to make the
 * application act on documents the user never chose — by asserting a selection,
 * by patching shared state, by naming uids that are not on screen. None of it
 * may reach anything that reads as the user's choice.
 *
 * The strongest assertion in the file is the last one, and it is a shape
 * assertion rather than a behavioural one: this store has no method that writes
 * a user selection. Everything else is a consequence of that.
 */
describe('AgentSelectionStore', () => {
  let store: AgentSelectionStore;

  const A = 'aaaaaaaa-1111-2222-3333-444444444444';
  const B = 'bbbbbbbb-1111-2222-3333-444444444444';
  const C = 'cccccccc-1111-2222-3333-444444444444';

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(AgentSelectionStore);
  });

  describe('a proposal may only name what the user can see', () => {
    it('accepts a uid a mounted widget is offering', () => {
      store.offer('call-1', [A, B]);

      expect(store.propose([A])).toEqual({ accepted: [A], refused: [] });
      expect(store.proposals()).toEqual([A]);
    });

    it('refuses a uid no widget is offering, and says so', () => {
      store.offer('call-1', [A]);

      // The move this blocks: suggest a document the user is not looking at,
      // then describe it persuasively enough that they confirm it blind.
      expect(store.propose([A, C])).toEqual({ accepted: [A], refused: [C] });
      expect(store.proposals()).toEqual([A]);
    });

    it('proposes nothing at all when no widget is mounted', () => {
      expect(store.propose([A, B])).toEqual({ accepted: [], refused: [A, B] });
      expect(store.proposals()).toEqual([]);
    });

    it('stops showing a proposal once the widget offering it is gone', () => {
      store.offer('call-1', [A]);
      store.propose([A]);
      expect(store.proposals()).toEqual([A]);

      store.withdraw('call-1');

      expect(store.proposals()).toEqual([]);
    });

    it('keeps a proposal that another mounted widget still offers', () => {
      store.offer('call-1', [A]);
      store.offer('call-2', [A, B]);
      store.propose([A]);

      store.withdraw('call-1');

      expect(store.proposals()).toEqual([A]);
    });
  });

  describe('ordering between the state event and the lazy widget', () => {
    /**
     * The real sequence on the wire. `STATE_SNAPSHOT` and the render event ride
     * the same run, and the widget behind the render event is a lazy chunk, so
     * the proposal lands while the component is still downloading. Validating at
     * arrival would drop every proposal in practice.
     */
    it('honours a proposal that arrived before the widget mounted', () => {
      expect(store.propose([A])).toEqual({ accepted: [], refused: [A] });
      expect(store.proposals()).toEqual([]);

      store.offer('call-1', [A, B]);

      expect(store.proposals()).toEqual([A]);
    });

    it('still never shows one for a uid no widget ever offers', () => {
      store.propose([C]);
      store.offer('call-1', [A, B]);

      expect(store.proposals()).toEqual([]);
    });
  });

  describe('bounds and hostile input', () => {
    it('replaces rather than accumulates, so a suggestion can be retracted', () => {
      store.offer('call-1', [A, B]);
      store.propose([A, B]);

      store.propose([B]);

      expect(store.proposals()).toEqual([B]);
    });

    it('caps how many uids one proposal may carry', () => {
      const many = Array.from({ length: 200 }, (_, i) => `uid-${i}`);
      store.offer('call-1', many);

      store.propose(many);

      expect(store.proposals()).toHaveLength(MAX_PROPOSED_DOCUMENT_IDS);
    });

    it('drops non-strings rather than coercing them', () => {
      store.offer('call-1', [A]);

      store.propose([A, 42, null, undefined, { uid: A }, [A], true, '']);

      expect(store.proposals()).toEqual([A]);
    });

    it('de-duplicates without losing the order asked for', () => {
      store.offer('call-1', [A, B]);

      store.propose([B, A, B]);

      expect(store.proposals()).toEqual([B, A]);
    });

    it('does not treat an inherited property as an offer', () => {
      store.offer('call-1', [A]);

      store.propose(['toString', 'constructor', '__proto__', 'hasOwnProperty']);

      expect(store.proposals()).toEqual([]);
    });
  });

  describe('per-instance rendering', () => {
    it('gives each widget only the proposals it is showing', () => {
      store.offer('call-1', [A]);
      store.offer('call-2', [B]);
      store.propose([A, B]);

      expect(store.proposalsFor('call-1')).toEqual([A]);
      expect(store.proposalsFor('call-2')).toEqual([B]);
      expect(store.proposalsFor('call-never-mounted')).toEqual([]);
    });

    it('re-offering an instance replaces its previous uids', () => {
      store.offer('call-1', [A]);
      store.propose([A]);
      expect(store.proposals()).toEqual([A]);

      store.offer('call-1', [B]);

      expect(store.proposals()).toEqual([]);
    });
  });

  it('clears everything for a new thread', () => {
    store.offer('call-1', [A]);
    store.propose([A]);

    store.clear();

    expect(store.proposals()).toEqual([]);
    expect(store.offered().size).toBe(0);
  });

  /**
   * The structural claim, asserted as structure.
   *
   * Provenance does not rest on a check that could be forgotten in a later
   * refactor; it rests on there being nowhere to write a user selection. If
   * someone adds `select()` or `confirm()` here, this fails and they have to
   * argue for it in review rather than discover the consequence in production.
   */
  it('exposes no way to select anything', () => {
    const surface = [
      ...Object.getOwnPropertyNames(AgentSelectionStore.prototype),
      ...Object.keys(store),
    ];

    expect(surface.filter((name) => /^(select|confirm|choose|check)/i.test(name))).toEqual([]);
    expect(String(AgentSelectionStore)).not.toContain('SelectionService');
  });
});

describe('readProposedSelection', () => {
  const A = 'aaaaaaaa-1111-2222-3333-444444444444';

  it('reads the one slice it is allowed to read', () => {
    expect(readProposedSelection({ selection: { proposed: [A] } })).toEqual([A]);
  });

  /**
   * `STATE_DELTA` is an RFC 6902 patch and can name any path in the document.
   * These are the paths a steered model would reach for, and none of them is
   * read: there is no `confirmed`, no `selected`, and nothing outside
   * `selection.proposed` is looked at whatever it is called.
   */
  it.each([
    ['a confirmed selection', { selection: { confirmed: [A] } }],
    ['a selected list', { selection: { selected: [A], proposed: [] } }],
    ['a user-attributed selection', { selection: { byUser: [A] } }],
    ['a top-level selection array', { selection: [A] }],
    ['a selection of the wrong shape', { selection: { proposed: A } }],
    ['a nested string', { selection: { proposed: { 0: A } } }],
    ['no selection slice', { other: { proposed: [A] } }],
    ['an array document', [{ selection: { proposed: [A] } }]],
    ['a string document', 'selection'],
    ['null', null],
    ['undefined', undefined],
  ])('yields nothing usable for %s', (_label, state) => {
    expect(readProposedSelection(state) ?? []).toEqual([]);
  });

  it('drops non-string members rather than the whole patch', () => {
    // Partial acceptance is safe here and nowhere else: unlike widget props,
    // where a half-parsed list is a lie with a scrollbar, a dropped proposal
    // just means one fewer suggestion. The store then intersects with what is
    // on screen anyway.
    expect(readProposedSelection({ selection: { proposed: [A, 7, null, ''] } })).toEqual([A]);
  });

  it('distinguishes an explicit retraction from an absent slice', () => {
    // An empty array is the gateway saying "nothing is suggested any more".
    // A missing slice is it saying nothing at all, and must not retract.
    expect(readProposedSelection({ selection: { proposed: [] } })).toEqual([]);
    expect(readProposedSelection({ other: true })).toBeNull();
  });
});
