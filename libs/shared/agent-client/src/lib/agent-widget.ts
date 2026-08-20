import { InjectionToken, inject, type Provider, type Type } from '@angular/core';

/**
 * Generative UI: the browser half of "the agent proposes, the app mounts".
 *
 * The gateway sends a `CUSTOM` event named `render` naming a widget and its
 * props. Nothing in that event is trusted. This module is the mechanism that
 * turns an untrusted payload into either one of a fixed set of typed requests or
 * nothing at all, and it is deliberately the only place that decision is made.
 *
 * ## The registry is a public extension point
 *
 * A widget is contributed by providing an {@link AgentWidgetDefinition} through
 * {@link provideAgentWidgets} in the composition root. Nothing in this library,
 * in `AgentRuntimeService`, or in the chat panel names a widget: the panel asks
 * the injected catalogue, and a name absent from it is refused. That is what
 * backs the Level 4 custom-widget claim on the product overview, and it is why
 * the props parser travels *with* the widget — a contributed widget brings its
 * own validation instead of patching a switch statement in here.
 *
 * The allowlist stays closed despite being open to extension. Registration is an
 * Angular provider evaluated at bootstrap, so the set of mountable widgets is
 * fixed before the first token of the first run is streamed, and there is no
 * path from anything on the wire to a new entry.
 *
 * ## The rules a contributed widget inherits, from `docs/generative-ui-readiness.md` §5
 *
 * 1. **Props are identifiers, never content.** A widget takes uids, enums and
 *    counts. It re-fetches through the ordinary services under the caller's own
 *    session, so a fabricated row is not something a model can express and ACL
 *    enforcement is Nuxeo's rather than ours. {@link parseUid} and
 *    {@link parseUidList} exist so a contributor gets this right by default.
 * 2. **A closed allowlist**, resolved from the injected catalogue.
 * 3. **Deny by default.** Every branch below returns a rejection or null; there
 *    is no path that mounts something on the strength of a missing check.
 * 4. **Validate before mounting, and reject atomically.** One bad uid rejects the
 *    whole request. A half-populated list is a lie with a scrollbar.
 * 5. **No free text reaches markup.** {@link exactProps} refuses an unexpected
 *    key rather than ignoring it, so a widget cannot quietly grow a content prop.
 * 6. **Bound the blast radius.** {@link MAX_WIDGET_DOCUMENT_IDS} per widget;
 *    `AgentRuntimeService` caps widgets per thread.
 *
 * Read-only is the other half of the contract and is not enforceable from here —
 * it is a property of the component. It is stated in `AgentWidgetDefinition`'s
 * documentation and checked by each widget's own tests.
 *
 * **Nothing in this registry may ever submit.** A7 stage 3 added a component that
 * answers a gated write, and it deliberately did *not* arrive here: it lives in
 * its own registry, `AGENT_FORM_COMPONENTS` (`agent-form.ts`), because the two
 * channels cannot share a prop rule — a widget's props are identifiers and enums
 * and never content, while a form's necessarily carry gateway-resolved content.
 * Admitting one member that carried content would demote rule 1 above from a
 * property of this registry to a property of some of its members. The two
 * name-spaces are held disjoint by `render-events.spec.ts`. See ADR 001,
 * "The two channels get two registries".
 */

/**
 * Validated props of one widget. Identifiers, enums and counts — never content.
 *
 * `object` rather than `Record<string, unknown>` so a contributor can declare
 * their props as a plain `interface`. TypeScript withholds an implicit index
 * signature from interfaces, and a constraint that quietly forced every
 * contributed widget to use a type alias would be a papercut with no purpose.
 */
export type AgentWidgetProps = object;

/**
 * Turns an untrusted prop object into the widget's own validated props, or null.
 *
 * Null means "do not mount": the user is told a view was refused, and the
 * component type is never even resolved. Returning a partially repaired object
 * is the one thing a parser must not do.
 */
export type AgentWidgetPropsParser<P extends AgentWidgetProps = AgentWidgetProps> = (
  props: Record<string, unknown>,
) => P | null;

/**
 * One contributed widget.
 *
 * `name` is what the gateway puts on the wire. `load` resolves the component,
 * and SHOULD be a dynamic `import()` so a widget nobody triggers costs nothing.
 * `inputs` is the second half of the security boundary and the more important
 * half: validated props are *translated* into component inputs rather than
 * spread onto the component, so a widget gaining a dangerous input later does
 * not become reachable until someone writes it into this function.
 *
 * The component MUST be read-only. It may navigate and it may re-fetch; it may
 * not write, upload or delete. A write performed from a mounted component leaves
 * the browser carrying the user's Nuxeo session and never reaches the gateway's
 * approval gate — the gate is not bypassed so much as absent from that path.
 */
export interface AgentWidgetDefinition<P extends AgentWidgetProps = AgentWidgetProps> {
  readonly name: string;
  readonly parseProps: AgentWidgetPropsParser<P>;
  readonly load: () => Promise<Type<unknown>>;
  readonly inputs: (props: P) => Readonly<Record<string, unknown>>;
  /**
   * How this widget takes part in selection. Omit it and the widget cannot be
   * ticked, which is the right answer for anything that shows one document.
   *
   * `offers` names the documents the widget puts in front of the user, read from
   * props the parser has already validated. That set is the closed list an agent
   * proposal may draw from, so a widget that under-reports it makes proposals
   * impossible and one that over-reports it lets the agent suggest a row nobody
   * can see. It is derived from props rather than from the mounted component so
   * that the store knows the answer before the lazy chunk has downloaded.
   *
   * `inputs` maps live proposals into component inputs, in the same translated
   * way as {@link AgentWidgetDefinition.inputs} and for the same reason.
   *
   * Nothing here can express a *selection*. A widget is told what was suggested;
   * the user's own choice belongs to `SelectionService` and is written only by
   * the click that makes it.
   */
  readonly selection?: {
    readonly offers: (props: P) => readonly string[];
    readonly inputs: (proposed: readonly string[]) => Readonly<Record<string, unknown>>;
  };
}

/**
 * Every widget this application will mount.
 *
 * Injected rather than imported, so the chat panel depends on the shape of a
 * widget and never on the identity of one.
 */
export const AGENT_WIDGETS = new InjectionToken<readonly AgentWidgetDefinition[]>('AGENT_WIDGETS', {
  providedIn: 'root',
  factory: () => [],
});

/**
 * Registers widgets with the chat panel. Call in `app.config.ts`:
 *
 * ```ts
 * provideAgentWidgets(documentListWidget, documentCardWidget)
 * ```
 *
 * A library outside this repository contributes by exporting its own
 * definitions and having the application add them to the same call. No file in
 * `apps/nuxeo-ui/src/app/shell` changes, which is the test of whether this is an
 * extension point or a place where extensions happen to be written down.
 */
export function provideAgentWidgets(
  // narrows its own props, and a `readonly AgentWidgetDefinition[]` parameter
  // would reject every one of them contravariantly.
  ...widgets: readonly AgentWidgetDefinition<any>[]
): Provider[] {
  return widgets.map((widget) => ({
    provide: AGENT_WIDGETS,
    useValue: widget,
    multi: true,
  }));
}

/**
 * The registered widgets, indexed and checked.
 *
 * Built once from the injected list. A duplicate name is a configuration error
 * rather than a last-one-wins: two definitions for one name means the wire
 * format is ambiguous, and silently picking either is how a contributed widget
 * shadows a built-in one.
 */
export class AgentWidgetCatalogue {
  private readonly byName: ReadonlyMap<string, AgentWidgetDefinition>;

  constructor(widgets: readonly AgentWidgetDefinition[]) {
    const byName = new Map<string, AgentWidgetDefinition>();
    for (const widget of widgets) {
      if (!widget.name || !WIDGET_NAME_PATTERN.test(widget.name)) {
        throw new Error(`Widget name ${JSON.stringify(widget.name)} is not a valid identifier.`);
      }
      if (byName.has(widget.name)) {
        throw new Error(`Two widgets are registered as "${widget.name}".`);
      }
      byName.set(widget.name, widget);
    }
    this.byName = byName;
  }

  get(name: string): AgentWidgetDefinition | undefined {
    // `Map.get` rather than property access: an object literal would answer
    // `toString` and `constructor` with something callable.
    return this.byName.get(name);
  }

  /** Registered names, sorted. For diagnostics and for the conformance tests. */
  names(): readonly string[] {
    return [...this.byName.keys()].sort();
  }
}

/**
 * A widget name must look like an identifier so it can be compared, logged and
 * put in a URL fragment without escaping. It is never used as a path.
 */
const WIDGET_NAME_PATTERN = /^[a-z][A-Za-z0-9]{0,39}$/;

/**
 * The registered widgets, as one object.
 *
 * Derived from {@link AGENT_WIDGETS} so the duplicate-name check runs once, at
 * first injection, rather than on every render event.
 */
export const AGENT_WIDGET_CATALOGUE = new InjectionToken<AgentWidgetCatalogue>(
  'AGENT_WIDGET_CATALOGUE',
  { providedIn: 'root', factory: () => new AgentWidgetCatalogue(inject(AGENT_WIDGETS)) },
);

/** A render request that passed every check and may be mounted. */
export interface AgentWidgetMount {
  readonly toolCallId: string;
  readonly status: 'ready';
  readonly name: string;
  readonly props: AgentWidgetProps;
}

/**
 * Why a render request will not be mounted.
 *
 * Reported rather than swallowed. A widget that silently fails to appear is
 * indistinguishable from a gateway that never asked for one, and those are very
 * different bugs.
 */
export type AgentWidgetRejectionReason = 'unknown-widget' | 'invalid-props';

export interface AgentWidgetRejection {
  readonly toolCallId: string;
  readonly status: 'rejected';
  readonly reason: AgentWidgetRejectionReason;
}

export type AgentWidgetRequest = AgentWidgetMount | AgentWidgetRejection;

/**
 * Most uids one widget may carry.
 *
 * A cap the gateway also applies, restated here because the gateway's copy
 * protects the panel from a paged search and this one protects it from a
 * producer that has been steered.
 */
export const MAX_WIDGET_DOCUMENT_IDS = 25;

/**
 * A uid shaped like something Nuxeo issued.
 *
 * The charset is the control that matters, not the length. `DocumentService.getById`
 * interpolates the uid into `/nuxeo/api/v1/id/{uid}` without encoding it, so a
 * value containing `/`, `?`, `#` or `%` would be a request to a path the caller
 * did not choose. Nuxeo uids are UUIDs; anything that is not uid-shaped has no
 * business reaching a URL.
 */
const UID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._~-]{0,63}$/;

/** Longest `toolCallId` worth attaching to. Beyond this the payload is not ours. */
const MAX_TOOL_CALL_ID_LENGTH = 200;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Confirms the prop object carries every required key, no unknown key, and
 * nothing outside the declared set.
 *
 * Exported because it is the rule contributors most often get wrong by being
 * permissive: an ignored unknown key is how `title` sneaks in beside `docIds`
 * and how the next person assumes it is honoured.
 */
export function exactProps(
  props: Record<string, unknown>,
  required: readonly string[],
  optional: readonly string[] = [],
): boolean {
  const actual = Object.keys(props);
  return (
    required.every((key) => actual.includes(key)) &&
    actual.every((key) => required.includes(key) || optional.includes(key))
  );
}

/** One uid, or null. Use for any prop naming a single document. */
export function parseUid(value: unknown): string | null {
  return typeof value === 'string' && UID_PATTERN.test(value) ? value : null;
}

/**
 * One member of a closed set of strings, or null.
 *
 * The other legitimate shape of prop besides an identifier. An enum lets the
 * agent choose between presentations the application already ships — which
 * columns a card shows, which kind a list is — without any of the choosing
 * becoming content. Anything not in the set is a rejection, never a fallback to
 * a default: a silent fallback makes a malformed request indistinguishable from
 * a well-formed one.
 */
export function parseEnum<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : null;
}

/**
 * A non-empty, de-duplicated list of enum members, or null. Atomic, like
 * {@link parseUidList}: one unrecognised member rejects the list.
 */
export function parseEnumList<T extends string>(
  value: unknown,
  allowed: readonly T[],
): readonly T[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > allowed.length) return null;
  const members: T[] = [];
  for (const entry of value) {
    const member = parseEnum(entry, allowed);
    if (!member) return null;
    if (!members.includes(member)) members.push(member);
  }
  return members;
}

/**
 * A non-empty, de-duplicated, capped list of uids, or null.
 *
 * Atomic: one malformed entry rejects the list. Duplicates are the one thing
 * tolerated — a producer being repetitive rather than a producer being wrong —
 * and are collapsed in place so the order the caller asked for survives.
 */
export function parseUidList(
  value: unknown,
  max: number = MAX_WIDGET_DOCUMENT_IDS,
): readonly string[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > max) return null;
  const uids: string[] = [];
  for (const entry of value) {
    const uid = parseUid(entry);
    if (!uid) return null;
    if (!uids.includes(uid)) uids.push(uid);
  }
  return uids;
}

/**
 * Reads a `CUSTOM` `render` payload into a request the panel can act on.
 *
 * Returns null — nothing recorded, nothing rendered, nothing said — only when the
 * payload names no call to attach to, because there would be nowhere to show
 * either the widget or the explanation. Every other failure is a rejection the
 * user is told about.
 */
export function parseAgentWidgetEvent(
  value: unknown,
  catalogue: AgentWidgetCatalogue,
): AgentWidgetRequest | null {
  if (!isRecord(value)) return null;

  const toolCallId = value['toolCallId'];
  if (
    typeof toolCallId !== 'string' ||
    toolCallId.length === 0 ||
    toolCallId.length > MAX_TOOL_CALL_ID_LENGTH
  ) {
    return null;
  }

  const name = value['component'];
  const widget = typeof name === 'string' ? catalogue.get(name) : undefined;
  if (!widget) return { toolCallId, status: 'rejected', reason: 'unknown-widget' };

  const rawProps = value['props'];
  if (!isRecord(rawProps)) return { toolCallId, status: 'rejected', reason: 'invalid-props' };

  // A parser is contributed code and may be wrong in ways this module cannot
  // anticipate. A throw is treated as a refusal rather than allowed to break the
  // run: one bad contributed widget must not take the transcript down with it.
  let props: AgentWidgetProps | null;
  try {
    props = widget.parseProps(rawProps);
  } catch {
    props = null;
  }
  if (!props) return { toolCallId, status: 'rejected', reason: 'invalid-props' };

  return { toolCallId, status: 'ready', name: widget.name, props };
}
