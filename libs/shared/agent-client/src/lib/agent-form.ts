import { InjectionToken, inject, type Provider, type Type } from '@angular/core';

/**
 * The browser half of "a chat-rendered form answers an interrupt".
 *
 * ADR 001, "A chat-rendered form answers an interrupt". The model calls a
 * mutating tool; the gateway gates it exactly as it gates every other write and
 * ends the run on an interrupt. When the tool's own registration declares a
 * form, that interrupt carries `metadata.render` — which fields, of what type,
 * holding which values, and which of them the user may change. This module turns
 * that untrusted declaration into either a validated request to mount one
 * registered component, or nothing at all.
 *
 * ## This is a second registry, and that is the decision rather than an accident
 *
 * `agent-widget.ts` holds the read-only widgets a `CUSTOM` `render` event mounts.
 * The two channels carry the same-shaped `{ component, props }` and are
 * deliberately kept apart, with disjoint name-spaces and no shared token. The
 * reason is not that a submitting component is untidy beside a read-only one —
 * it is that **the two channels cannot share a prop rule**:
 *
 * - A render-event widget takes **identifiers and enums, never content**. That
 *   single rule is what makes a fabricated row inexpressible, and it holds for
 *   every member of that registry without exception.
 * - A form necessarily carries **content**: `target.title`, every field's
 *   `label`, and every field's current `value`. That is legitimate here for a
 *   reason that does not generalise — the gateway resolved those values from
 *   Nuxeo under the caller's own forwarded credentials, and the labels come from
 *   the tool's own registration. None of it is model-authored.
 *
 * Merging the registries would mean "props are identifiers, never content" stops
 * being a property of the registry and becomes a property of *some members* of
 * it, checked by remembering which. The registry's safety story is worth exactly
 * as much as its weakest member, so the weakest member is kept out.
 *
 * ## Why validation is central here and per-widget there
 *
 * `AgentWidgetDefinition` carries its own `parseProps` because widget props have
 * no common shape: `documentCard` takes one uid plus a field enum and
 * `documentList` takes an array of uids, and a central parser would have grown a
 * branch per widget. A form's props are the opposite — ADR 001 fixes one
 * normative shape for the channel, `{ toolCallId, target, title, submitLabel,
 * fields }`, and every form component reads it. So the parser lives here, once,
 * and a contributed form component inherits it rather than restating it.
 *
 * ## What a failed validation degrades to, and why it is not a notice
 *
 * A refused *widget* is reported to the user, because a widget that silently
 * fails to appear is indistinguishable from a gateway that never asked for one.
 * A refused *form* is different: {@link parseInterruptForm} returns null and the
 * panel draws the ordinary approval card, which is a fully consented write and
 * the exact behaviour that existed before this file. That mirrors the gateway,
 * where every check on a form declaration degrades to no form rather than to a
 * narrower one. Nothing is hidden by the fallback — the card shows the same
 * arguments the form would have shown.
 */

/** The five field types ADR 001 fixes. Anything else refuses the whole form. */
export const AGENT_FORM_FIELD_TYPES = ['text', 'multiline', 'number', 'boolean', 'date'] as const;

export type AgentFormFieldType = (typeof AGENT_FORM_FIELD_TYPES)[number];

/** Where a field's current value came from. Drives how the form marks it. */
export const AGENT_FORM_VALUE_SOURCES = ['proposed', 'current', 'empty'] as const;

export type AgentFormValueSource = (typeof AGENT_FORM_VALUE_SOURCES)[number];

/** Scalars are all a form field can hold; `null` renders as empty. */
export type AgentFormValue = string | number | boolean | null;

/**
 * The document the write lands on, resolved server-side as the caller.
 *
 * `uid` is the one the held call carries. `title`, `type` and `path` are present
 * only when Nuxeo answered for this caller, so **their absence means unresolved,
 * and an unresolved uid MUST render as the bare uid** — never as a label from
 * `metadata.args` and never as anything the model supplied. A wrong name on an
 * approval affordance is worse than an unfriendly one.
 */
export interface AgentFormTarget {
  readonly uid: string;
  readonly title?: string;
  readonly type?: string;
  readonly path?: string;
}

export interface AgentFormField {
  /** Key inside the submitted record — for metadata, a Nuxeo xpath like `dc:title`. */
  readonly name: string;
  readonly label: string;
  readonly type: AgentFormFieldType;
  /**
   * Whether a submitted value for this field will be honoured.
   *
   * Deny by default in the same direction `mutating` is: only a literal `true`
   * on the wire produces `true` here. A field that arrives without it is
   * display-only both on screen and on the server, so the omission a producer
   * will actually make leaves a field read-only rather than writable.
   */
  readonly editable: boolean;
  readonly required?: boolean;
  readonly maxLength?: number;
  readonly value: AgentFormValue;
  readonly source: AgentFormValueSource;
}

/**
 * One validated form declaration: the props a registered form component mounts
 * with.
 *
 * `toolCallId` is the interrupt this form answers, and it has already been
 * checked against the interrupt the declaration arrived on — see
 * {@link parseInterruptForm}.
 */
export interface AgentFormProps {
  readonly toolCallId: string;
  readonly target: AgentFormTarget;
  readonly title: string;
  readonly submitLabel: string;
  readonly fields: readonly AgentFormField[];
  /**
   * Which of the held call's arguments the submitted values nest under.
   *
   * **Display only, and the distinction is the whole of its safety.** The browser
   * never uses this to build a request: a submission is a flat
   * {@link AgentFormSubmission} of field names, and `overlayFormSubmission`
   * rebuilds the executed arguments from the tool's own declaration server-side,
   * where this name is also read from. Nothing the browser does with it can change
   * where a value lands.
   *
   * It exists so the settled tool card can show what *ran* rather than what the
   * model proposed. Without it the card kept the model's arguments after the user
   * had edited them — so the ticked card read back a description the user had
   * deleted while the prose beneath it correctly reported what was saved, and a
   * card looks more authoritative than prose.
   *
   * Optional because a producer that omits it simply leaves the card showing the
   * proposal, which is the pre-existing behaviour rather than a new failure.
   */
  readonly valuesArg?: string;
}

/**
 * The values a submitted form carries, keyed by declared field name.
 *
 * What the browser sends. It is not what gets written: the gateway rebuilds the
 * executed arguments from the tool's own declaration and takes a value from here
 * only for a field it declared `editable: true`, so a key invented here has
 * nowhere to land.
 */
export type AgentFormSubmission = Readonly<Record<string, AgentFormValue>>;

/**
 * One registered form component.
 *
 * Deliberately smaller than {@link AgentWidgetDefinition}: no `parseProps`,
 * because the channel has one normative props shape this module validates
 * centrally, and no `selection`, because a form edits one document rather than
 * offering rows to tick.
 *
 * Unlike a render-event widget, the component this names **may submit** — but it
 * still may not write. It emits the values the user typed and the panel answers
 * the interrupt; the gateway performs the write, behind the same approval gate
 * and the same one-shot ledger as an ordinary card. A form component that called
 * a Nuxeo service directly would be the exact defect this whole channel exists
 * to avoid: the write would leave the browser on the user's own session and the
 * gateway would hold no record it happened.
 */
export interface AgentFormDefinition {
  readonly name: string;
  /** SHOULD be a dynamic `import()`, so a form nobody triggers costs nothing. */
  readonly load: () => Promise<Type<unknown>>;
  /**
   * Validated props to component inputs, translated by name rather than spread,
   * for the same reason {@link AgentWidgetDefinition.inputs} is: a component
   * that later gains a dangerous input does not become reachable until someone
   * writes it into this function.
   */
  readonly inputs: (props: AgentFormProps) => Readonly<Record<string, unknown>>;
  /**
   * The component's own output property names, so the host can wire them without
   * knowing the component type.
   *
   * Named rather than handed the instance: the host subscribes to exactly these
   * two properties and only after confirming each is an `OutputRef`, so a
   * definition naming something else wires nothing instead of calling whatever
   * it found.
   */
  readonly outputs: {
    /** Emits {@link AgentFormSubmission} when the user submits. */
    readonly submitted: string;
    /** Emits when the user backs out. Answered as a decline. */
    readonly cancelled: string;
  };
}

/**
 * Every form component this application will mount.
 *
 * A separate token from `AGENT_WIDGETS` on purpose. See this file's header: the
 * two channels have different prop rules, and one token would make the
 * read-only registry's guarantee conditional on which member you are holding.
 */
export const AGENT_FORM_COMPONENTS = new InjectionToken<readonly AgentFormDefinition[]>(
  'AGENT_FORM_COMPONENTS',
  { providedIn: 'root', factory: () => [] },
);

/**
 * Registers form components with the chat panel. Call in `app.config.ts`:
 *
 * ```ts
 * provideAgentFormComponents(documentMetadataForm)
 * ```
 *
 * An application that registers nothing still runs, and every form declaration
 * degrades to the approval card it drew before this channel existed.
 */
export function provideAgentFormComponents(...forms: readonly AgentFormDefinition[]): Provider[] {
  return forms.map((form) => ({ provide: AGENT_FORM_COMPONENTS, useValue: form, multi: true }));
}

/**
 * The registered form components, indexed and checked.
 *
 * A duplicate name throws at bootstrap rather than resolving last-one-wins, for
 * the reason the widget catalogue does: two definitions for one name makes the
 * wire format ambiguous, and silently picking either is how a contributed
 * component shadows a built-in one.
 */
export class AgentFormCatalogue {
  private readonly byName: ReadonlyMap<string, AgentFormDefinition>;

  constructor(forms: readonly AgentFormDefinition[]) {
    const byName = new Map<string, AgentFormDefinition>();
    for (const form of forms) {
      if (!form.name || !FORM_NAME_PATTERN.test(form.name)) {
        throw new Error(
          `Form component name ${JSON.stringify(form.name)} is not a valid identifier.`,
        );
      }
      if (byName.has(form.name)) {
        throw new Error(`Two form components are registered as "${form.name}".`);
      }
      byName.set(form.name, form);
    }
    this.byName = byName;
  }

  get(name: string): AgentFormDefinition | undefined {
    // `Map.get` rather than property access: an object literal would answer
    // `toString` and `constructor` with something callable.
    return this.byName.get(name);
  }

  /** Registered names, sorted. For diagnostics and for the conformance tests. */
  names(): readonly string[] {
    return [...this.byName.keys()].sort();
  }
}

/** A component name must look like an identifier. It is never used as a path. */
const FORM_NAME_PATTERN = /^[a-z][A-Za-z0-9]{0,39}$/;

export const AGENT_FORM_CATALOGUE = new InjectionToken<AgentFormCatalogue>('AGENT_FORM_CATALOGUE', {
  providedIn: 'root',
  factory: () => new AgentFormCatalogue(inject(AGENT_FORM_COMPONENTS)),
});

/** A validated declaration, ready to mount. */
export interface AgentFormRequest {
  readonly name: string;
  readonly props: AgentFormProps;
}

/** Most fields one form may carry. A metadata edit declares five. */
export const MAX_AGENT_FORM_FIELDS = 24;

/**
 * A field name is an object key and a form control name, never a URL or a path.
 *
 * Nuxeo xpaths are the case that matters — `dc:title`, `file:content` — so `:`
 * is allowed alongside the identifier charset. Nothing here reaches a request
 * path, and the length bound is what keeps a pathological key out of the DOM.
 */
const FIELD_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9:._-]{0,63}$/;

/**
 * Keys that would write to an object's prototype rather than into it.
 *
 * The submission is built by assigning into a plain object, and the gateway
 * rebuilds from its own declaration, so neither side is actually reachable this
 * way. Refused anyway: cheap, and the alternative is remembering.
 */
const UNSAFE_FIELD_NAMES: ReadonlySet<string> = new Set(['__proto__', 'constructor', 'prototype']);

/** Longest label, title or resolved value worth putting on screen. */
const MAX_TEXT_LENGTH = 400;
/** Longest field value the form will display. Beyond this the form is refused. */
const MAX_VALUE_LENGTH = 20_000;
/** Ceiling on a declared `maxLength`, so the attribute cannot be absurd. */
const MAX_DECLARED_MAX_LENGTH = 100_000;

/**
 * A uid shaped like something Nuxeo issued. The same pattern the widget channel
 * applies, and for the same reason: a uid reaches
 * `/nuxeo/api/v1/id/{uid}` uninterpolated on any path that reads it back.
 */
const UID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._~-]{0,63}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readText(value: unknown, max = MAX_TEXT_LENGTH): string | null {
  return typeof value === 'string' && value.length > 0 && value.length <= max ? value : null;
}

/**
 * Reads `metadata.render` off an interrupt into a form request, or null.
 *
 * Null is a supported and common outcome — most writes declare no form — and it
 * means "draw the approval card", which is what the panel did before this
 * channel existed. Every check below degrades that way rather than to a narrower
 * form, mirroring `declaredForm` on the gateway: a declaration that is wrong
 * falls back to a fully consented write instead of quietly showing something
 * partial.
 *
 * `interruptId` is required rather than optional. `interruptId === toolCallId`
 * always (ADR 001), so a declaration whose `toolCallId` names a different
 * interrupt is refused — a form that submitted against an interrupt other than
 * the one it is rendered under would answer a decision the user never saw.
 */
export function parseInterruptForm(
  value: unknown,
  interruptId: string,
  catalogue: AgentFormCatalogue,
): AgentFormRequest | null {
  if (!isRecord(value)) return null;

  const name = value['component'];
  if (typeof name !== 'string' || !catalogue.get(name)) return null;

  const rawProps = value['props'];
  if (!isRecord(rawProps)) return null;

  // The correlation check. Not a formality: this is what stops a declaration
  // from answering an interrupt other than the one it arrived on.
  if (rawProps['toolCallId'] !== interruptId) return null;

  const target = parseTarget(rawProps['target']);
  if (!target) return null;

  const title = readText(rawProps['title']);
  const submitLabel = readText(rawProps['submitLabel']);
  if (!title || !submitLabel) return null;

  const fields = parseFields(rawProps['fields']);
  if (!fields) return null;

  // Dropped individually rather than refusing the form, like the target's optional
  // title and type: it feeds a card label, so a malformed one costs the card its
  // executed-argument view and nothing else. It is checked against the field-name
  // charset because it is used as an object key.
  const rawValuesArg = rawProps['valuesArg'];
  const valuesArg =
    typeof rawValuesArg === 'string' &&
    FIELD_NAME_PATTERN.test(rawValuesArg) &&
    !UNSAFE_FIELD_NAMES.has(rawValuesArg)
      ? rawValuesArg
      : undefined;

  return {
    name,
    props: {
      toolCallId: interruptId,
      target,
      title,
      submitLabel,
      fields,
      ...(valuesArg ? { valuesArg } : {}),
    },
  };
}

function parseTarget(value: unknown): AgentFormTarget | null {
  if (!isRecord(value)) return null;
  const uid = value['uid'];
  if (typeof uid !== 'string' || !UID_PATTERN.test(uid)) return null;

  // Each of the three is optional and each is dropped on its own if it does not
  // hold up. Dropping one degrades to showing less, which is the honest
  // direction: an absent title renders the bare uid.
  const title = readText(value['title']);
  const type = readText(value['type']);
  const path = readText(value['path']);
  return {
    uid,
    ...(title ? { title } : {}),
    ...(type ? { type } : {}),
    ...(path ? { path } : {}),
  };
}

/**
 * The declared field set, or null if any part of it does not hold up.
 *
 * Atomic, unlike the target's optional labels. A form missing a field it was
 * declared with is a form whose submission means something different from what
 * the user was shown, so one bad field refuses the whole declaration and the
 * card is drawn instead.
 */
function parseFields(value: unknown): readonly AgentFormField[] | null {
  if (!Array.isArray(value) || value.length === 0 || value.length > MAX_AGENT_FORM_FIELDS) {
    return null;
  }

  const fields: AgentFormField[] = [];
  const seen = new Set<string>();
  for (const entry of value) {
    const field = parseField(entry);
    if (!field) return null;
    // A duplicate name makes the submission ambiguous: two controls would write
    // the same key and the last one would silently win.
    if (seen.has(field.name)) return null;
    seen.add(field.name);
    fields.push(field);
  }

  // A form with nothing writable is an approval card with extra steps, and the
  // card is the better affordance for it. The gateway refuses to declare one;
  // this is the same check on the reading side.
  if (!fields.some((field) => field.editable)) return null;
  return fields;
}

function parseField(value: unknown): AgentFormField | null {
  if (!isRecord(value)) return null;

  const name = value['name'];
  if (typeof name !== 'string' || !FIELD_NAME_PATTERN.test(name)) return null;
  if (UNSAFE_FIELD_NAMES.has(name)) return null;

  const label = readText(value['label']);
  if (!label) return null;

  const type = AGENT_FORM_FIELD_TYPES.find((candidate) => candidate === value['type']);
  if (!type) return null;

  const source = AGENT_FORM_VALUE_SOURCES.find((candidate) => candidate === value['source']);
  if (!source) return null;

  // Strictly `true`, so a producer sending `"true"` or `1` gets a display-only
  // field rather than a writable one. Deny by default, in the direction the
  // mistake must fall.
  const editable = value['editable'] === true;
  const required = value['required'] === true;

  const maxLength = value['maxLength'];
  if (maxLength !== undefined) {
    if (
      typeof maxLength !== 'number' ||
      !Number.isInteger(maxLength) ||
      maxLength <= 0 ||
      maxLength > MAX_DECLARED_MAX_LENGTH
    ) {
      return null;
    }
  }

  const parsed = parseValue(value['value'], type);
  if (!parsed) return null;

  return {
    name,
    label,
    type,
    editable,
    ...(required ? { required } : {}),
    ...(maxLength !== undefined ? { maxLength: maxLength as number } : {}),
    value: parsed.value,
    source,
  };
}

/**
 * A field's current value, checked against the type the field declared.
 *
 * A mismatch refuses the whole form rather than nulling the field. Nulling would
 * show an empty box where the model proposed something, which reads as "there is
 * no value" — and the gateway's own `checkValue` would refuse that value on
 * submission anyway, so the form could not have been completed without the user
 * retyping it. The card is drawn instead, and it shows the proposed value
 * plainly as text, so nothing is concealed by the fallback.
 *
 * Wrapped rather than returned bare because `null` is itself a legitimate value
 * — an empty field — and would otherwise be indistinguishable from a refusal.
 */
function parseValue(
  value: unknown,
  type: AgentFormFieldType,
): { readonly value: AgentFormValue } | null {
  if (value === null || value === undefined) return { value: null };

  switch (type) {
    case 'text':
    case 'multiline':
    case 'date':
      // A date arrives as a string; the component parses it for display and the
      // gateway re-checks it on submission. Kept as text here so an unparseable
      // date is still shown rather than silently emptied.
      return typeof value === 'string' && value.length <= MAX_VALUE_LENGTH ? { value } : null;
    case 'number':
      // Not coerced from a string: coercion is how a form ends up writing 0 for
      // the empty string.
      return typeof value === 'number' && Number.isFinite(value) ? { value } : null;
    case 'boolean':
      return typeof value === 'boolean' ? { value } : null;
  }
}
