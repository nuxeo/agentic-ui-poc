import type {
  AgentFormComponentName,
  AgentTool,
  MutationFormField,
  MutationFormFieldType,
  MutationFormSpec,
  MutationSpec,
} from '../tools/tool.types';
import type { ApprovalTarget } from './write-preflight';

/**
 * A chat-rendered form answers an interrupt; it is not a second write path.
 *
 * ADR 001, "A chat-rendered form answers an interrupt". The model calls a
 * mutating tool, the gateway gates it exactly as it gates every other write, and
 * the run ends on an interrupt. What is new is that the interrupt may *declare a
 * form* — which fields, of what type, holding which values, and which of them the
 * user may change — so the browser can render the form instead of a Decline /
 * Approve card. Submitting the form answers that same interrupt through `resume`.
 *
 * ## Why there is no second confirmation, and why that is safe
 *
 * A card and a form are asymmetric in who authored what. In a card the model
 * authored the arguments and the human authored a boolean, which is why the
 * card's arguments must come from the parsed call: a "yes" has to attach to a
 * specific machine-read set of arguments or it means nothing. In a form the human
 * authored the values *and* the intent, so there is nothing left to consent to
 * that they did not just type. Asking anyway is not merely redundant — it trains
 * people to click Approve on cards they have not read, which degrades the
 * affordance protecting every case where the model *did* author the arguments.
 *
 * But "the user typed the values" is emphatically not "the request is
 * trustworthy". Three things stay model-authored however carefully the visible
 * fields were filled in: the **target**, because the form was mounted with a uid
 * the model supplied; the **field set**, because the model chose which properties
 * are in play; and any **hidden field**, because anything carried and not
 * displayed is model-authored entirely.
 *
 * So the executed arguments are not filtered, they are **rebuilt**:
 *
 *  - the target comes from the interrupt's own held call, never from the payload;
 *  - the values argument is constructed from the declared field set alone, so a
 *    property the model proposed and the form never displayed is dropped rather
 *    than written;
 *  - a submitted value is taken only for a field declared `editable: true`;
 *  - every other top-level argument is dropped, because a form answer consents to
 *    the form and to nothing beside it.
 *
 * Rebuilding rather than filtering is the whole difference. A filter has to
 * enumerate what to remove and is wrong the moment someone adds an argument; a
 * rebuild can only ever emit what the declaration names.
 *
 * ## The one channel the model cannot write to
 *
 * None of this changes where the authority comes from. A submission is still a
 * `resume` entry — a field of an HTTP request body only the browser composes —
 * still requires `payload.approved === true`, and is still spent exactly once by
 * `ApprovalLedger.claim`. One interrupt, one form, one submission, one write.
 */

/** What the browser is told to render, published as `metadata.render`. */
export interface InterruptFormRender {
  readonly component: AgentFormComponentName;
  readonly props: InterruptFormProps;
}

export interface InterruptFormProps {
  /** The interrupt this form answers. Equal to the interrupt id and the toolCallId. */
  readonly toolCallId: string;
  /**
   * The document the write lands on, resolved server-side as the caller.
   *
   * `uid` is the one from the held call. `title`, `type` and `path` are present
   * only when Nuxeo answered for this caller, so a form never displays a label
   * the model supplied — the prohibition ADR 001 puts on this design.
   */
  readonly target: InterruptFormTarget;
  readonly title: string;
  readonly submitLabel: string;
  readonly fields: readonly InterruptFormFieldView[];
  /**
   * Which held argument the submitted values nest under, so the browser's settled tool
   * card can show what *ran* rather than what the model proposed.
   *
   * Published for display only. The browser sends a flat map of field names, and
   * {@link overlayFormSubmission} reads this name from the tool's own declaration —
   * never from anything that came back — so nothing the browser does with this copy can
   * change where a value lands.
   */
  readonly valuesArg: string;
}

export interface InterruptFormTarget {
  readonly uid: string;
  readonly title?: string;
  readonly type?: string;
  readonly path?: string;
}

/** Scalars are all a form field can hold; `null` renders as empty. */
export type InterruptFormValue = string | number | boolean | null;

export interface InterruptFormFieldView {
  readonly name: string;
  readonly label: string;
  readonly type: MutationFormFieldType;
  /** Whether a submitted value for this field will be honoured. */
  readonly editable: boolean;
  readonly required?: boolean;
  readonly maxLength?: number;
  readonly value: InterruptFormValue;
  /**
   * Where `value` came from, so the browser can mark what the model proposed.
   *
   * `proposed` is model-authored and the user is editing a suggestion;
   * `current` came from Nuxeo under the caller's own credentials; `empty` means
   * neither had a value.
   */
  readonly source: 'proposed' | 'current' | 'empty';
}

export type FormRejectionCode = 'form_not_declared' | 'invalid_form_submission';

export interface FormSubmissionRejection {
  readonly code: FormRejectionCode;
  /** A sentence for the model to relay. Never carries a submitted value back. */
  readonly message: string;
}

export type FormSubmissionOutcome =
  | {
      readonly ok: true;
      /** The complete argument object to execute. Rebuilt, not filtered. */
      readonly args: Record<string, unknown>;
      /** Declared fields the submission actually set, for the log line. */
      readonly applied: readonly string[];
    }
  | { readonly ok: false; readonly rejection: FormSubmissionRejection };

type FormCapableTool = Pick<AgentTool, 'mutation' | 'parameters'>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Field names that would write to an object's prototype rather than into it.
 *
 * Nothing the browser sends can reach this — the allowlist is the declaration,
 * not the payload — so this guards against a *declaration* naming one, which
 * would turn `values[field.name] = …` into a prototype assignment on the object
 * about to be serialised to Nuxeo. Cheap, and the alternative is remembering.
 */
const UNSAFE_FIELD_NAMES: ReadonlySet<string> = new Set(['__proto__', 'constructor', 'prototype']);

/** Arguments of the mutation spec that name documents rather than values. */
function documentArgNames(spec: MutationSpec): readonly string[] {
  return [spec.subject?.arg, spec.into?.arg].filter((arg): arg is string => arg !== undefined);
}

/**
 * The form declaration, but only if it is one this gateway is willing to act on.
 *
 * Every check below is a way a declaration could widen the write beyond what the
 * form displays, and each one **degrades to no form at all** rather than to a
 * narrower one. That direction matters: a tool whose declaration is wrong falls
 * back to today's approval card, which is a fully consented write, instead of
 * quietly executing something nobody saw. The shipped set is held to declaring
 * validly by `interrupt-forms.spec.ts`, so the fallback never hides a bug in our
 * own tools.
 */
export function declaredForm(tool: FormCapableTool): MutationFormSpec | undefined {
  const spec = tool.mutation;
  const form = spec?.form;
  if (!spec || !form) return undefined;

  const parameters = Object.keys(tool.parameters.properties);
  // The values argument must exist, and must not be the argument naming the
  // target. Were they the same, a submitted value would land on the document id
  // and the payload would choose what gets written.
  if (!form.valuesArg || !parameters.includes(form.valuesArg)) return undefined;
  if (documentArgNames(spec).includes(form.valuesArg)) return undefined;
  if (spec.value === form.valuesArg) return undefined;

  // A form with nothing writable is a card with extra steps; a duplicate or
  // blank field name makes the allowlist ambiguous.
  const names = new Set<string>();
  for (const field of form.fields) {
    if (!field.name.trim() || names.has(field.name)) return undefined;
    if (UNSAFE_FIELD_NAMES.has(field.name)) return undefined;
    names.add(field.name);
  }
  if (!form.fields.some((field) => field.editable === true)) return undefined;

  // Because the executed arguments are rebuilt from the declaration, a required
  // parameter the declaration cannot supply would produce a partial write. Refuse
  // to raise the form instead.
  const supplied = new Set([...documentArgNames(spec), form.valuesArg]);
  if ((tool.parameters.required ?? []).some((name) => !supplied.has(name))) return undefined;

  return form;
}

/** The single document a form writes to, read out of the held call. */
function formTargetUid(spec: MutationSpec, heldArgs: Record<string, unknown>): string | undefined {
  const arg = spec.subject?.arg;
  if (!arg) return undefined;
  const value = heldArgs[arg];
  // Deliberately only the single form. A write over several documents is not one
  // form, and guessing which of them the form edits is exactly the confusion the
  // target rule exists to prevent.
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function scalarOrNull(value: unknown): InterruptFormValue {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }
  return null;
}

function fieldView(
  field: MutationFormField,
  proposed: Record<string, unknown>,
  current: Readonly<Record<string, unknown>>,
): InterruptFormFieldView {
  const hasProposed = Object.prototype.hasOwnProperty.call(proposed, field.name);
  const hasCurrent = Object.prototype.hasOwnProperty.call(current, field.name);
  const raw = hasProposed ? proposed[field.name] : hasCurrent ? current[field.name] : undefined;
  const value = scalarOrNull(raw);
  return {
    name: field.name,
    label: field.label,
    type: field.type,
    editable: field.editable === true,
    ...(field.required !== undefined ? { required: field.required } : {}),
    ...(field.maxLength !== undefined ? { maxLength: field.maxLength } : {}),
    value,
    source: hasProposed ? 'proposed' : hasCurrent ? 'current' : 'empty',
  };
}

/** Reads a document's properties as the caller, or null when the read failed. */
export type CurrentPropertiesReader = (
  uid: string,
) => Promise<Readonly<Record<string, unknown>> | null>;

/**
 * The form declaration to publish on this write's interrupt, or nothing.
 *
 * Nothing is a supported outcome and the common one: a tool that declares no
 * form, a declaration that failed validation, or a call carrying no single
 * target all produce an ordinary approval card, which is exactly the behaviour
 * that existed before this file. That is what lets the contract be added without
 * a client change being a prerequisite.
 */
export async function interruptFormFor(
  tool: FormCapableTool,
  toolCallId: string,
  heldArgs: Record<string, unknown>,
  targets: readonly ApprovalTarget[],
  readCurrent: CurrentPropertiesReader,
): Promise<InterruptFormRender | undefined> {
  const form = declaredForm(tool);
  const spec = tool.mutation;
  if (!form || !spec) return undefined;

  const uid = formTargetUid(spec, heldArgs);
  if (!uid) return undefined;

  const resolved = targets.find((target) => target.uid === uid);
  // A read that failed loses the title and the current values; it does not lose
  // the form. The browser then shows the bare uid, which is the honest rendering
  // and the same degradation the approval card already makes.
  const current = (await readCurrent(uid)) ?? {};
  const proposed = isRecord(heldArgs[form.valuesArg])
    ? (heldArgs[form.valuesArg] as Record<string, unknown>)
    : {};

  return {
    component: form.component,
    props: {
      toolCallId,
      target: {
        uid,
        ...(resolved?.title ? { title: resolved.title } : {}),
        ...(resolved?.type ? { type: resolved.type } : {}),
        ...(resolved?.path ? { path: resolved.path } : {}),
      },
      title: form.title,
      submitLabel: form.submitLabel,
      fields: form.fields.map((field) => fieldView(field, proposed, current)),
      // Which held argument submitted values nest under, so the settled tool card
      // can show what ran instead of what was proposed. Display only: the browser
      // sends a flat map of field names and `overlayFormSubmission` reads this
      // name from the tool's own declaration, not from anything that came back.
      valuesArg: form.valuesArg,
    },
  };
}

function reject(code: FormRejectionCode, message: string): FormSubmissionOutcome {
  return { ok: false, rejection: { code, message } };
}

type ValueCheck = { readonly ok: true; readonly value: unknown } | { readonly error: string };

/**
 * Whether one submitted value is the thing its field said it would be.
 *
 * A value that fails is a **refusal, not a silent drop**, and the asymmetry with
 * an undeclared field is deliberate. Dropping an undeclared field discards
 * something the user could not have typed, because the form never showed it.
 * Dropping a declared one discards something they did type, and leaves them
 * believing a change was made that was not — worse than refusing outright.
 */
function checkValue(field: MutationFormField, value: unknown): ValueCheck {
  if (value === null) {
    if (field.required) return { error: `"${field.label}" is required.` };
    return { ok: true, value: null };
  }
  switch (field.type) {
    case 'text':
    case 'multiline': {
      if (typeof value !== 'string') return { error: `"${field.label}" must be text.` };
      if (field.required && value.trim() === '') {
        return { error: `"${field.label}" is required.` };
      }
      if (field.maxLength !== undefined && value.length > field.maxLength) {
        return { error: `"${field.label}" is longer than ${field.maxLength} characters.` };
      }
      return { ok: true, value };
    }
    case 'number': {
      // A numeric string is rejected rather than coerced: coercion is how a form
      // ends up writing 0 for the empty string.
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        return { error: `"${field.label}" must be a number.` };
      }
      return { ok: true, value };
    }
    case 'boolean': {
      if (typeof value !== 'boolean') return { error: `"${field.label}" must be true or false.` };
      return { ok: true, value };
    }
    case 'date': {
      if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) {
        return { error: `"${field.label}" must be a date.` };
      }
      return { ok: true, value };
    }
  }
}

/**
 * The overlay-and-restrict step: the whole of the security question in a
 * chat-rendered form.
 *
 * The browser may send anything. What comes out of here is built from the tool's
 * own declaration and the call the gateway already holds:
 *
 *  - **the target is the held call's**, and is not reachable from the payload at
 *    all, because submitted values are only ever written inside `valuesArg` and
 *    `declaredForm` refuses a declaration where those are the same argument;
 *  - **the field set is the declaration's**, so a key the payload invents has
 *    nowhere to land, and a property the *model* proposed that the form never
 *    displayed is dropped just as firmly;
 *  - **every other top-level argument is dropped**, so a submission consents to
 *    the form and to nothing beside it.
 *
 * A submission for a tool that declared no form is refused rather than executed
 * without the overlay. The two halves disagreeing about whether a write has a
 * form is the case where "run it anyway" is least defensible.
 */
export function overlayFormSubmission(
  tool: FormCapableTool,
  heldArgs: Record<string, unknown>,
  submitted: unknown,
): FormSubmissionOutcome {
  const form = declaredForm(tool);
  const spec = tool.mutation;
  if (!form || !spec) {
    return reject(
      'form_not_declared',
      'That change does not accept a submitted form, so the submitted values were not used.',
    );
  }
  if (!isRecord(submitted)) {
    return reject('invalid_form_submission', 'The submitted values were not a set of fields.');
  }

  const uid = formTargetUid(spec, heldArgs);
  if (!uid) {
    return reject('invalid_form_submission', 'The change named no document to apply the form to.');
  }

  const proposed = isRecord(heldArgs[form.valuesArg])
    ? (heldArgs[form.valuesArg] as Record<string, unknown>)
    : {};
  const values: Record<string, unknown> = {};
  const applied: string[] = [];

  for (const field of form.fields) {
    // Display-only. Its value is on the form so the user can see what they are
    // changing something about, and submitting it back changes nothing.
    if (field.editable !== true) continue;

    // `hasOwnProperty` rather than a truthiness test, so `false`, `0` and `""`
    // are submissions and an inherited key — `constructor`, `__proto__` — is not.
    if (Object.prototype.hasOwnProperty.call(submitted, field.name)) {
      const checked = checkValue(field, submitted[field.name]);
      if ('error' in checked) return reject('invalid_form_submission', checked.error);
      values[field.name] = checked.value;
      applied.push(field.name);
      continue;
    }
    // A required field must be answered by the submission itself.
    //
    // Falling back to the held value here would write the *model's* string into a
    // field the form declared the user must fill in — and it would do so silently,
    // reported as a user-authored write. The component always emits every editable
    // row, so this is unreachable from the shipped form; the point is that the
    // invariant now holds for any client, rather than resting on one client being
    // well-behaved. A required field with no answer is the same shape of refusal as
    // a required field answered with nothing, which `checkValue` already rejects.
    if (field.required === true) {
      return reject(
        'invalid_form_submission',
        `The form did not answer the required field "${field.name}".`,
      );
    }

    // Not submitted and not required: keep what the interrupt held, which is what
    // the form displayed. Absent from both means the write does not mention the
    // property. Note this value is the model's, so it is *not* added to `applied` —
    // `userAuthoredFields` names only what the user actually typed.
    if (Object.prototype.hasOwnProperty.call(proposed, field.name)) {
      values[field.name] = proposed[field.name];
    }
  }

  const args: Record<string, unknown> = { [form.valuesArg]: values };
  for (const arg of documentArgNames(spec)) {
    if (Object.prototype.hasOwnProperty.call(heldArgs, arg)) args[arg] = heldArgs[arg];
  }

  return { ok: true, args, applied };
}
