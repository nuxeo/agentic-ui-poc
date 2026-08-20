import type { CallerIdentity } from '../identity/caller-identity';
import type { NuxeoRestClient } from '../nuxeo/nuxeo-rest-client';
import type { AgentTool, DocumentArgument, MutationSpec } from '../tools/tool.types';

/**
 * What the gateway works out about a write *before* anybody is asked to approve
 * it: what it will act on, and whether it could succeed at all.
 *
 * ## Why this is not the browser's job
 *
 * The panel used to name each row's document itself, one `DocumentService.getById`
 * per uid. That worked for naming and could never do the second half. A browser
 * can read a document; it cannot decide whether a write is allowed to happen,
 * because the rule it would have to apply lives next to the tool that performs
 * the write, in a process the browser does not run.
 *
 * ADR 001's precondition amendment came out of the CSX teardown, where a sibling
 * team's delete service split `isAvailable(context)` — `DELETE` on each document,
 * `DELETE_CHILD` on the parent, no retention or legal hold, not a version — from
 * `execute(context)`, which checks only that the selection is non-empty. Their
 * context menu called the first; their agent path called the second. Nuxeo still
 * applies its own ACLs, so nothing was bypassed, but a legally-held document the
 * UI refuses to offer for deletion is offered by the assistant. In a records
 * product that is a compliance event, and the approval card is the worst place to
 * find out: the user has already been told the action is available and has
 * already said yes.
 *
 * ## The cost, and why it is close to nothing
 *
 * Naming a document and checking it are the *same read*. One
 * `GET /nuxeo/api/v1/id/{uid}` with the dublincore properties and the
 * `permissions` enricher returns the title, type and path the row wants and the
 * retention, version and permission facts the rule wants. So the preconditions
 * are paid for by a request the card already needed, one per distinct uid per
 * approval turn, and no request at all for a write that names no document.
 *
 * ## What a failed read means, which is the decision worth arguing about
 *
 * Nothing. A document we could not read is left unnamed and unchecked: no target
 * on the card, no refusal, the write goes to the user as it would have before.
 * The alternative — reading a 404 or a 403 as "this write cannot succeed" — turns
 * a transient Nuxeo blip into a refusal the user cannot override and the model
 * cannot explain, and it conflates "we could not name it" with "you may not touch
 * it". Nuxeo remains the authority on both; this file only avoids asking a
 * question whose answer is already known.
 */

/** A document a write names, as the row shows it. */
export interface ApprovalTarget {
  /** Matches the uid in the interrupt's `metadata.args`. */
  readonly uid: string;
  /** `dc:title` exactly as Nuxeo returned it for this caller. */
  readonly title: string;
  /** Nuxeo primary type, for the row's icon. */
  readonly type?: string;
  /** Disambiguates two documents that share a title. */
  readonly path?: string;
}

/**
 * Why a write was stopped before anyone was asked about it.
 *
 * `code` is for the model and the logs; `message` is a sentence a person can read
 * if the model repeats it. Neither ever carries the raw Nuxeo error.
 */
export interface PreflightRefusal {
  readonly code: 'legal_hold' | 'immutable_version' | 'permission_denied';
  readonly message: string;
  /** The document that failed the check, when one document is to blame. */
  readonly uid?: string;
}

export interface WritePreflight {
  /** Resolved documents, in the order the arguments named them. */
  readonly targets: readonly ApprovalTarget[];
  /** Present when the write must not be offered for approval. */
  readonly refusal?: PreflightRefusal;
}

/** The subset of the document entity these rules read. */
export interface DocumentFacts {
  readonly uid: string;
  readonly title: string;
  readonly type?: string;
  readonly path?: string;
  readonly isVersion?: boolean;
  readonly isUnderRetentionOrLegalHold?: boolean;
  readonly permissions: readonly string[];
  /**
   * The document's own properties, as Nuxeo returned them to this caller.
   *
   * Not used by any precondition. It is here because a chat-rendered form has to
   * show the values a field currently holds, and this read — the one the card
   * already needed to name its target — has them. Resolving them separately
   * would be a second request, and resolving them anywhere but here would risk
   * doing it with something other than the caller's credentials.
   */
  readonly properties: Readonly<Record<string, unknown>>;
}

interface NuxeoDocumentEntity {
  readonly uid?: string;
  readonly title?: string;
  readonly type?: string;
  readonly path?: string;
  readonly isVersion?: boolean;
  readonly isUnderRetentionOrLegalHold?: boolean;
  readonly properties?: Record<string, unknown>;
  readonly contextParameters?: Record<string, unknown>;
}

export interface PreflightContext {
  readonly caller: CallerIdentity;
  readonly nuxeo: NuxeoRestClient;
  readonly signal: AbortSignal;
}

/**
 * Reads each document once per turn, as the caller.
 *
 * The cache is per-turn and keyed by uid, which is what stops five
 * `nuxeo.addToCollection` calls sharing one collection from reading it five
 * times. It deliberately does not outlive the turn: a permission changed between
 * two approval batches must take effect on the second, for the same reason ADR
 * 001 forbids caching the resolved principal across runs.
 */
export class DocumentReader {
  private readonly cache = new Map<string, Promise<DocumentFacts | null>>();

  constructor(private readonly context: PreflightContext) {}

  read(uid: string): Promise<DocumentFacts | null> {
    const cached = this.cache.get(uid);
    if (cached) return cached;
    const pending = this.fetch(uid);
    this.cache.set(uid, pending);
    return pending;
  }

  private async fetch(uid: string): Promise<DocumentFacts | null> {
    try {
      const doc = await this.context.nuxeo.json<NuxeoDocumentEntity>(this.context.caller, {
        method: 'GET',
        path: `/nuxeo/api/v1/id/${encodeURIComponent(uid)}`,
        // The caller's own credentials, so the title is one they are already
        // allowed to see and the permission list is theirs rather than a service
        // account's. `NuxeoRestClient` has no anonymous overload, so this is
        // structural rather than remembered.
        headers: { properties: 'dublincore', 'enrichers.document': 'permissions' },
        signal: this.context.signal,
      });
      const title = readTitle(doc);
      if (!title) return null;
      return {
        uid: doc.uid ?? uid,
        title,
        ...(doc.type ? { type: doc.type } : {}),
        ...(doc.path ? { path: doc.path } : {}),
        ...(typeof doc.isVersion === 'boolean' ? { isVersion: doc.isVersion } : {}),
        ...(typeof doc.isUnderRetentionOrLegalHold === 'boolean'
          ? { isUnderRetentionOrLegalHold: doc.isUnderRetentionOrLegalHold }
          : {}),
        permissions: readPermissions(doc),
        properties: doc.properties ?? {},
      };
    } catch {
      // Unreadable, gone, or Nuxeo having a bad moment. Omit rather than guess:
      // the row degrades to the bare uid, which is the honest rendering.
      return null;
    }
  }
}

function readTitle(doc: NuxeoDocumentEntity): string {
  const title = doc.title ?? doc.properties?.['dc:title'];
  return typeof title === 'string' && title.trim() ? title.trim() : '';
}

function readPermissions(doc: NuxeoDocumentEntity): readonly string[] {
  const permissions = doc.contextParameters?.['permissions'];
  return Array.isArray(permissions)
    ? permissions.filter((entry): entry is string => typeof entry === 'string')
    : [];
}

/** Uids an argument names, tolerating both the single and the array form. */
function readUids(value: unknown): string[] {
  if (typeof value === 'string') return value.trim() ? [value.trim()] : [];
  if (!Array.isArray(value)) return [];
  return value
    .filter((entry): entry is string => typeof entry === 'string' && entry.trim() !== '')
    .map((entry) => entry.trim());
}

function documentArguments(spec: MutationSpec): readonly DocumentArgument[] {
  return [spec.subject, spec.into].filter(
    (entry): entry is DocumentArgument => entry !== undefined,
  );
}

/**
 * The check itself. Order matters only in what the user is told first, and legal
 * hold leads because it is the one whose consequences are not merely an error.
 */
function checkFacts(facts: DocumentFacts, rule: DocumentArgument): PreflightRefusal | undefined {
  if (rule.changed && facts.isUnderRetentionOrLegalHold === true) {
    return {
      code: 'legal_hold',
      uid: facts.uid,
      message:
        `"${facts.title}" is under a retention or legal-hold status, so its content cannot ` +
        `be changed.`,
    };
  }
  if (rule.changed && facts.isVersion === true) {
    return {
      code: 'immutable_version',
      uid: facts.uid,
      message: `"${facts.title}" is an archived version, and a version cannot be changed.`,
    };
  }
  // An empty list is "the enricher did not answer", not "no permissions". Only a
  // list that came back and does not hold the permission is a refusal — the same
  // omit-rather-than-guess rule the reader applies.
  if (
    rule.permissions &&
    facts.permissions.length > 0 &&
    !rule.permissions.some((permission) => facts.permissions.includes(permission))
  ) {
    return {
      code: 'permission_denied',
      uid: facts.uid,
      message: `You do not have permission to make this change to "${facts.title}".`,
    };
  }
  return undefined;
}

/**
 * Resolves a write's targets and evaluates its preconditions.
 *
 * A tool with no `mutation` declaration resolves nothing and refuses nothing,
 * which is exactly today's behaviour: the card falls back to the gateway's
 * sentence and the raw arguments. Declaring is how a tool opts in, and the
 * shipped set is held to declaring by write-preflight.spec.ts.
 */
export async function evaluateWritePreflight(
  tool: Pick<AgentTool, 'mutation'>,
  args: Record<string, unknown>,
  reader: DocumentReader,
): Promise<WritePreflight> {
  const spec = tool.mutation;
  if (!spec) return { targets: [] };

  const targets: ApprovalTarget[] = [];
  let refusal: PreflightRefusal | undefined;

  for (const rule of documentArguments(spec)) {
    for (const uid of readUids(args[rule.arg])) {
      const facts = await reader.read(uid);
      if (!facts) continue;
      targets.push({
        uid: facts.uid,
        title: facts.title,
        ...(facts.type ? { type: facts.type } : {}),
        ...(facts.path ? { path: facts.path } : {}),
      });
      refusal ??= checkFacts(facts, rule);
    }
  }

  // Every document is still read and still named even once one has failed, so a
  // log line records the whole batch rather than stopping at the first problem.
  // Only the first refusal is reported, because one is enough to not ask.
  return refusal ? { targets, refusal } : { targets };
}
