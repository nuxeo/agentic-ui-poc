import { Injectable, computed, signal } from '@angular/core';

/**
 * Selection provenance for chat-rendered widgets.
 *
 * ## The problem this exists to solve
 *
 * A later turn acting on "the selected documents" must act on what the *user*
 * selected. Before this module, it did not. `selectDocuments` is a frontend tool
 * the model can call at will; its browser handler wrote straight into
 * `SelectionService`, and `ai-chat-panel` sends `SelectionService`'s contents to
 * the gateway as `selectionIds` on the next turn. So a model could assert a
 * selection, read it back one turn later as the user's, and — because
 * `SelectionService` also drives the application's selection toolbar and its
 * Delete action — leave a bulk action armed over documents no human chose.
 * A document whose text steers the model is enough to do it.
 *
 * ## The rule
 *
 * `SelectionService` means "what the user selected", and nothing reachable from
 * the wire may write to it. The model gets a separate channel — a *proposal* —
 * which is rendered as a suggestion the user can accept with a click. Accepting
 * is an ordinary tick, so the only thing that ever puts a uid into
 * `SelectionService` is a person.
 *
 * This is structural rather than a check. There is no method on this store that
 * writes a user selection: it holds proposals and nothing else, and it does not
 * import `SelectionService`. Refusing a bad proposal is not what keeps the two
 * apart — the absence of a code path is.
 *
 * ## What a proposal may name
 *
 * Only a uid some mounted widget is currently offering. A widget declares its
 * offered set from props that {@link AgentWidgetDefinition}'s parser has already
 * validated, so the offered set is derived from identifiers Nuxeo issued and
 * returned to this user, not from anything the model wrote. Proposing something
 * outside it is dropped, which denies the "suggest a uid the user cannot see,
 * then describe it persuasively" move: a proposal is always visible next to the
 * row it names, and always tickable.
 */

/** Most uids one proposal may carry. Matches the widget-side document cap. */
export const MAX_PROPOSED_DOCUMENT_IDS = 25;

/** What {@link AgentSelectionStore.propose} did with a request. */
export interface SelectionProposalOutcome {
  /** Uids now proposed, in the order asked for. */
  readonly accepted: readonly string[];
  /** Uids refused because no mounted widget is offering them. */
  readonly refused: readonly string[];
}

/**
 * Agent-proposed selections for the current thread.
 *
 * Thread-scoped rather than widget-scoped: a proposal is validated against the
 * union of every mounted widget's offered set, and each widget then renders the
 * intersection with its own. Keeping the offered sets per instance is what lets
 * a widget disappear from the transcript and take its offers with it.
 */
@Injectable({ providedIn: 'root' })
export class AgentSelectionStore {
  /** Widget instance id (its `toolCallId`) to the uids that instance shows. */
  private readonly offers = signal<ReadonlyMap<string, readonly string[]>>(new Map());
  /**
   * What the agent last asked for, before it is matched against what is on
   * screen.
   *
   * Held separately from {@link proposals} because of ordering: the gateway's
   * `STATE_DELTA` arrives on the same run as the render event that mounts the
   * widget, and the widget is a lazy chunk, so the proposal almost always lands
   * first. Validating at arrival would drop every proposal for a widget that had
   * not finished downloading. Intersecting on read makes the two independent.
   */
  private readonly requested = signal<readonly string[]>([]);

  /** Every uid a mounted widget is currently showing. */
  readonly offered = computed<ReadonlySet<string>>(() => {
    const all = new Set<string>();
    for (const uids of this.offers().values()) for (const uid of uids) all.add(uid);
    return all;
  });

  /**
   * Uids the agent has proposed that the user can actually see and tick.
   *
   * Never treat this as a selection. It is sent to the gateway under its own
   * name so the model can see its own suggestion is still pending, and it is
   * what a widget renders as a suggestion rather than a tick.
   */
  readonly proposals = computed<readonly string[]>(() => {
    const offered = this.offered();
    return this.requested().filter((uid) => offered.has(uid));
  });

  /** Whether any suggestion is outstanding. Drives the panel's hint. */
  readonly hasProposals = computed(() => this.proposals().length > 0);

  /**
   * Declares what a mounted widget instance is showing.
   *
   * Called by the widget host with props that have already been through the
   * widget's own parser, so every uid here is one the app was willing to render.
   */
  offer(instanceId: string, uids: readonly string[]): void {
    this.offers.update((current) => {
      const next = new Map(current);
      next.set(instanceId, [...uids]);
      return next;
    });
  }

  /**
   * Drops an instance's offers.
   *
   * Any proposal that only this instance backed stops being a proposal, because
   * {@link proposals} intersects with what is on screen — no pruning needed, and
   * nothing to get wrong when a widget is re-mounted with different uids.
   */
  withdraw(instanceId: string): void {
    this.offers.update((current) => {
      if (!current.has(instanceId)) return current;
      const next = new Map(current);
      next.delete(instanceId);
      return next;
    });
  }

  /** The proposed uids this instance is showing, for its own checkboxes. */
  proposalsFor(instanceId: string): readonly string[] {
    const uids = new Set(this.offers().get(instanceId) ?? []);
    return this.proposals().filter((uid) => uids.has(uid));
  }

  /**
   * Records an agent proposal.
   *
   * Replaces rather than accumulates: a second proposal is the agent changing
   * its mind, and a union would make a suggestion impossible to retract. The
   * refused list is returned rather than logged so a caller answering the model
   * can say plainly what did not land — a silent drop reads to the model as
   * success and it will go on to describe the selection as made.
   *
   * "Refused" here is a snapshot against what is mounted *now*; a uid that is
   * refused because its widget is still downloading becomes a live proposal the
   * moment the widget offers it. That is the right way round: the guarantee
   * being kept is that a proposal is never shown or reported unless the user can
   * see the row it names, not that it is resolved on the first tick.
   */
  propose(uids: readonly unknown[]): SelectionProposalOutcome {
    const offered = this.offered();
    const wanted: string[] = [];
    for (const value of uids.slice(0, MAX_PROPOSED_DOCUMENT_IDS)) {
      if (typeof value !== 'string' || value.length === 0) continue;
      if (!wanted.includes(value)) wanted.push(value);
    }
    this.requested.set(wanted);
    return {
      accepted: wanted.filter((uid) => offered.has(uid)),
      refused: wanted.filter((uid) => !offered.has(uid)),
    };
  }

  clearProposals(): void {
    this.requested.set([]);
  }

  /** Everything, on a new thread. */
  clear(): void {
    this.offers.set(new Map());
    this.requested.set([]);
  }
}

/**
 * Reads the `selection.proposed` slice out of AG-UI shared state.
 *
 * Shared state is server-authored: `STATE_SNAPSHOT` and `STATE_DELTA` both come
 * from the gateway, and `STATE_DELTA` is an RFC 6902 patch that can name any
 * path in the document. This function is why that is safe to consume — exactly
 * one path is read, its contents are re-validated, and everything else in the
 * state document is ignored no matter what it is called.
 *
 * There is deliberately no `selection.confirmed` to read. The user's selection
 * is never mirrored into shared state, because a server-authored channel
 * carrying a copy of "what the user chose" is the same vulnerability in a
 * different coat: the gateway could patch its own copy and the browser would
 * have no way to tell that from the real thing.
 */
export function readProposedSelection(state: unknown): readonly string[] | null {
  if (!isRecord(state)) return null;
  const selection = state['selection'];
  if (!isRecord(selection)) return null;
  const proposed = selection['proposed'];
  if (!Array.isArray(proposed)) return null;
  return proposed.filter((uid): uid is string => typeof uid === 'string' && uid.length > 0);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  // Rejects arrays, and `Object.create(null)` is fine — what matters is that a
  // key lookup below cannot reach `Object.prototype`, which `in`-free indexing
  // on a plain object still can. Every value read from here is re-typed before
  // use, so an inherited `toString` reads as "not an array" and is dropped.
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
