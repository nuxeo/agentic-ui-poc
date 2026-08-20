import type { CallerIdentity } from '../identity/caller-identity';
import type { NuxeoRestClient } from '../nuxeo/nuxeo-rest-client';

/**
 * The tool contract. This is public API: `createDefaultToolRegistry()` builds
 * the shipped set and anything conforming to `AgentTool` can be added to it
 * without editing gateway internals. See apps/agent-gateway/README.md,
 * "Registering a tool".
 */

/** A JSON Schema object describing a tool's arguments, sent to the model verbatim. */
export interface JsonSchemaObject {
  readonly type: 'object';
  readonly properties: Readonly<Record<string, unknown>>;
  readonly required?: readonly string[];
  readonly additionalProperties?: boolean;
}

export interface ToolLogger {
  info(message: string, fields?: Record<string, unknown>): void;
  warn(message: string, fields?: Record<string, unknown>): void;
  error(message: string, fields?: Record<string, unknown>): void;
}

export interface ToolContext {
  /** The signed-in user. Every Nuxeo call in a tool must be made as this caller. */
  readonly caller: CallerIdentity;
  readonly nuxeo: NuxeoRestClient;
  /** Aborted when the client disconnects or the run times out. */
  readonly signal: AbortSignal;
  readonly logger: ToolLogger;
}

/**
 * Permission sets, named so a declaration reads as an intent rather than as a
 * string. Each mirrors the helper the SPA's own action gating uses in
 * `libs/shared/nuxeo-client/src/lib/utils/document-permissions.ts`, which is what
 * ADR 001's precondition rule requires: the agent path checks what the UI path
 * checks, not something stricter it invented.
 *
 * Any-of, not all-of. Nuxeo's `permissions` enricher expands the permission
 * hierarchy, so a user granted the compound `ReadWrite` is listed as holding both
 * `Write` and `WriteProperties`; matching either is what makes the check agree
 * with the server rather than with one spelling of the grant.
 */
export const WRITE_PERMISSIONS = ['Write', 'WriteProperties'] as const;
export const ADD_CHILDREN_PERMISSIONS = ['AddChildren'] as const;
export const REMOVE_PERMISSIONS = ['Remove'] as const;

/**
 * An argument that names the documents a write acts on.
 *
 * Declared rather than discovered. Scanning every argument for something
 * uid-shaped would send whatever the model happened to put in a string field to
 * Nuxeo, which is both wasted traffic and a way to let the model choose what the
 * gateway reads.
 */
export interface DocumentArgument {
  /** Argument carrying a uid, or an array of uids. */
  readonly arg: string;
  /**
   * True when the write changes *this* document rather than merely pointing at
   * it. A changed document must not be a version and must not sit under a
   * retention or legal-hold status — the two facts that make an approval card
   * for it a compliance problem rather than a wasted click.
   */
  readonly changed?: boolean;
  /** The caller must hold at least one of these on each named document. */
  readonly permissions?: readonly string[];
}

/**
 * Widgets the browser may mount to *answer* an interrupt, as opposed to the
 * read-only widgets a tool result mounts.
 *
 * A literal union rather than a string, for the reason the render transport uses
 * one: adding a producer here without adding the consumer there should fail the
 * build rather than the demo. One entry, deliberately — plan A7 stage 3 delivered
 * metadata edit and nothing else.
 *
 * The browser registers these in `AGENT_FORM_COMPONENTS`, which is a **different
 * registry** from the read-only render-event widgets. A name added here must be
 * added there, and must not appear in the widget registry;
 * `render-events.spec.ts` fails on either mistake.
 */
export type AgentFormComponentName = 'documentMetadataForm';

export type MutationFormFieldType = 'text' | 'multiline' | 'number' | 'boolean' | 'date';

/**
 * One field of a chat-rendered form.
 *
 * `editable` is the write allowlist and it is **deny by default**: a field is
 * displayed unless it is absent, and it is writable only if it says
 * `editable: true`. The two are separate on purpose — a form that shows who
 * created a document and when is far more reviewable than one showing two text
 * boxes, and neither of those facts may be written by submitting them back.
 * Anything not declared writable here is dropped server-side however the browser
 * sends it.
 */
export interface MutationFormField {
  /** Key inside the values argument — for metadata, a Nuxeo xpath like `dc:title`. */
  readonly name: string;
  readonly label: string;
  readonly type: MutationFormFieldType;
  /** Only `true` makes the field writable. Omitted means display-only. */
  readonly editable?: boolean;
  /** A submitted value for this field may not be empty. Unsubmitted stays unset. */
  readonly required?: boolean;
  readonly maxLength?: number;
}

/**
 * A form the browser may render *instead of* an approval card, to answer this
 * write's interrupt.
 *
 * It lives on the tool's own registration for the same reason `MutationSpec` does:
 * a tool must not be able to describe one form and execute a different write. The
 * gateway publishes this declaration on the interrupt and then, when the answer
 * comes back, rebuilds the executed arguments from *this* declaration rather than
 * from anything the browser sent.
 *
 * `valuesArg` names the single argument the submitted values land in, and that
 * is what makes ADR 001's third rule structural rather than remembered: the
 * target argument is not addressable by a submission at all, because submitted
 * values only ever reach one named sub-object of the held call.
 */
export interface MutationFormSpec {
  readonly component: AgentFormComponentName;
  /** The one argument submitted values are written into, e.g. `properties`. */
  readonly valuesArg: string;
  readonly title: string;
  readonly submitLabel: string;
  readonly fields: readonly MutationFormField[];
}

/**
 * What a write does, and to what — declared next to the code that performs it.
 *
 * This exists because the approval row's verb used to come from a table in the
 * browser keyed on tool name. A tool that changes what it does while keeping its
 * name makes such a row describe the wrong action confidently, and an approval
 * card is the worst possible place for that. The phrasing now travels on the
 * interrupt, from the same declaration `ToolRegistry.execute` runs.
 *
 * It doubles as the precondition declaration: the arguments named here are the
 * ones resolved to titles for the card, and the rules attached to them are what
 * `evaluateWritePreflight` checks before the card is raised at all.
 *
 * Omitting it is safe and means less, not more: the row falls back to the
 * gateway's own sentence and its raw arguments, and no precondition is evaluated.
 */
export interface MutationSpec {
  /** Verb phrase the row leads with, e.g. `Add tags to`. */
  readonly action: string;
  /** The document, or documents, the action is performed on. */
  readonly subject?: DocumentArgument;
  /** Argument holding a literal the user is authorising — a title, a query. */
  readonly value?: string;
  /** A second document the action points at, and the preposition joining them. */
  readonly into?: DocumentArgument & { readonly preposition: string };
  /**
   * The form the browser may render to answer this write's interrupt, instead of
   * an approval card. Omitting it means the write is only ever approved, which
   * is the pre-existing behaviour and the safe default.
   */
  readonly form?: MutationFormSpec;
}

export interface AgentTool<TArgs = Record<string, unknown>> {
  /** Unique, namespaced, stable — the model sees this string. */
  readonly name: string;
  readonly description: string;
  readonly parameters: JsonSchemaObject;
  /**
   * Whether the tool changes repository state.
   *
   * **This is not advisory, and its default is not "safe".** `requiresApproval`
   * in `mutation-policy.ts` treats anything other than an explicit
   * `mutating: false` as a write, and `ToolRegistry.execute` refuses to run a
   * write without a human approval for that specific call. So omitting the flag
   * does not opt out of the gate — it opts *into* it, which is the direction a
   * mistake should fall. Declaring `mutating: false` is a claim that the tool
   * only reads, and it is the claim a reviewer should be looking for.
   */
  readonly mutating?: boolean;
  /**
   * How this write is described to the person approving it, and what must hold
   * before they are asked. Meaningful only on a tool that needs approval.
   */
  readonly mutation?: MutationSpec;
  execute(args: TArgs, context: ToolContext): Promise<unknown>;
}

/** A tool result that is a sentence rather than a structured object. */
export interface JsonSchemaString {
  readonly type: 'string';
  readonly description: string;
}

/**
 * A tool the *client* executes. The gateway advertises it to the model and, when
 * the model calls it, ends the run and hands control back to the browser instead
 * of executing anything. The client renders its UI, collects the human decision,
 * and posts the result back as a tool message on the next `POST /agent/run`.
 *
 * These are the mirror of what the browser declares in `RunAgentInput.tools`. The
 * browser's declaration is what actually reaches the model — the gateway treats
 * any declared tool it does not own as client-executed and never consults this
 * list at runtime — so these definitions exist to pin the contract and to fail a
 * test when the two halves drift apart, which is otherwise invisible until the
 * model sends an argument the browser handler does not read.
 */
export interface FrontendToolContract {
  readonly name: string;
  readonly description: string;
  readonly parameters: JsonSchemaObject;
  /** What the client returns as the tool message content, as JSON Schema. */
  readonly result: JsonSchemaObject | JsonSchemaString;
}
