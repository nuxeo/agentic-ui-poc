import {
  optionalInteger,
  optionalNonNegativeInteger,
  optionalString,
  optionalStringArray,
  requiredRecord,
  requiredString,
  requiredStringArray,
} from './args';
import {
  ADD_CHILDREN_PERMISSIONS,
  REMOVE_PERMISSIONS,
  WRITE_PERMISSIONS,
  type AgentTool,
  type ToolContext,
} from './tool.types';

/**
 * Document tools: search, read, navigate, and the mutating operations the
 * recipes need. Every endpoint here is the one an existing Angular service
 * already calls, so the gateway and the SPA cannot drift onto two different
 * Nuxeo contracts. The mapping is recorded in
 * apps/agent-gateway/README.md, "Tool → Nuxeo endpoint map".
 */

interface NuxeoDocument {
  readonly uid: string;
  readonly title?: string;
  readonly type?: string;
  readonly path?: string;
  readonly state?: string;
  readonly lastModified?: string;
  readonly properties?: Record<string, unknown>;
  readonly contextParameters?: Record<string, unknown>;
}

interface NuxeoDocumentList {
  readonly entries?: readonly NuxeoDocument[];
  readonly totalSize?: number;
  readonly resultsCount?: number;
}

/** A model does not need 80 Nuxeo properties to reason about a document. */
function summarize(doc: NuxeoDocument) {
  return {
    uid: doc.uid,
    title: doc.title ?? (doc.properties?.['dc:title'] as string | undefined) ?? '',
    type: doc.type,
    path: doc.path,
    state: doc.state,
    lastModified: doc.lastModified,
  };
}

function summarizeList(list: NuxeoDocumentList) {
  return {
    totalSize: list.totalSize ?? list.resultsCount ?? list.entries?.length ?? 0,
    entries: (list.entries ?? []).map(summarize),
  };
}

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;

/**
 * NXQL search. `GET /nuxeo/api/v1/search/lang/NXQL/execute?query=…`, the same
 * call `NuxeoApiBase.nxqlSearch` makes. Nuxeo evaluates the query as the caller,
 * so an unreadable document is not merely hidden from the response — it is never
 * matched. That is the whole reason identity is forwarded rather than assumed.
 */
export const searchDocumentsTool: AgentTool = {
  name: 'nuxeo.searchDocuments',
  description:
    'Search the repository with an NXQL query and return matching documents. Results are ' +
    'restricted to what the signed-in user is allowed to read.',
  mutating: false,
  parameters: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description:
          "A full NXQL statement, e.g. \"SELECT * FROM Document WHERE dc:title LIKE '%contract%' " +
          'AND ecm:isTrashed = 0 ORDER BY dc:modified DESC".',
      },
      pageSize: { type: 'number', description: `Maximum results, default ${DEFAULT_PAGE_SIZE}.` },
      currentPageIndex: { type: 'number', description: 'Zero-based page index.' },
    },
    required: ['query'],
    additionalProperties: false,
  },
  async execute(args, { caller, nuxeo, signal }: ToolContext) {
    const list = await nuxeo.json<NuxeoDocumentList>(caller, {
      method: 'GET',
      path: '/nuxeo/api/v1/search/lang/NXQL/execute',
      query: {
        query: requiredString(args, 'query'),
        pageSize: optionalInteger(args, 'pageSize', DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE),
        currentPageIndex: optionalNonNegativeInteger(args, 'currentPageIndex', 0),
      },
      headers: { properties: 'dublincore' },
      signal,
    });
    return summarizeList(list);
  },
};

export const getDocumentTool: AgentTool = {
  name: 'nuxeo.getDocument',
  description: 'Fetch a single document by uid, including its Dublin Core metadata.',
  mutating: false,
  parameters: {
    type: 'object',
    properties: { uid: { type: 'string', description: 'Document uid.' } },
    required: ['uid'],
    additionalProperties: false,
  },
  async execute(args, { caller, nuxeo, signal }: ToolContext) {
    const uid = requiredString(args, 'uid');
    const doc = await nuxeo.json<NuxeoDocument>(caller, {
      method: 'GET',
      path: `/nuxeo/api/v1/id/${encodeURIComponent(uid)}`,
      headers: { properties: '*', 'enrichers.document': 'permissions' },
      signal,
    });
    return {
      ...summarize(doc),
      properties: doc.properties ?? {},
      permissions: doc.contextParameters?.['permissions'] ?? [],
    };
  },
};

export const listChildrenTool: AgentTool = {
  name: 'nuxeo.listChildren',
  description: 'List the direct children of a folderish document.',
  mutating: false,
  parameters: {
    type: 'object',
    properties: {
      uid: { type: 'string', description: 'Parent document uid.' },
      pageSize: { type: 'number' },
    },
    required: ['uid'],
    additionalProperties: false,
  },
  async execute(args, { caller, nuxeo, signal }: ToolContext) {
    const uid = requiredString(args, 'uid');
    const list = await nuxeo.json<NuxeoDocumentList>(caller, {
      method: 'GET',
      path: `/nuxeo/api/v1/id/${encodeURIComponent(uid)}/@children`,
      query: { pageSize: optionalInteger(args, 'pageSize', DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE) },
      headers: { properties: 'dublincore' },
      signal,
    });
    return summarizeList(list);
  },
};

export const tagDocumentTool: AgentTool = {
  name: 'nuxeo.tagDocument',
  description: 'Add one or more tags to a document.',
  mutating: true,
  mutation: {
    action: 'Add tags to',
    subject: { arg: 'uid', changed: true, permissions: WRITE_PERMISSIONS },
  },
  parameters: {
    type: 'object',
    properties: {
      uid: { type: 'string' },
      tags: { type: 'array', items: { type: 'string' }, description: 'Tag labels to add.' },
    },
    required: ['uid', 'tags'],
    additionalProperties: false,
  },
  async execute(args, { caller, nuxeo, signal }: ToolContext) {
    const uid = requiredString(args, 'uid');
    const tags = requiredStringArray(args, 'tags');
    await nuxeo.json(caller, {
      method: 'POST',
      path: `/nuxeo/api/v1/id/${encodeURIComponent(uid)}/@op/Services.TagDocument`,
      json: { params: { tags: tags.join(',') }, context: {} },
      signal,
    });
    return { uid, tagsAdded: tags };
  },
};

export const untagDocumentTool: AgentTool = {
  name: 'nuxeo.untagDocument',
  description: 'Remove one or more tags from a document.',
  mutating: true,
  mutation: {
    action: 'Remove tags from',
    subject: { arg: 'uid', changed: true, permissions: WRITE_PERMISSIONS },
  },
  parameters: {
    type: 'object',
    properties: {
      uid: { type: 'string' },
      tags: { type: 'array', items: { type: 'string' } },
    },
    required: ['uid', 'tags'],
    additionalProperties: false,
  },
  async execute(args, { caller, nuxeo, signal }: ToolContext) {
    const uid = requiredString(args, 'uid');
    const tags = requiredStringArray(args, 'tags');
    await nuxeo.json(caller, {
      method: 'POST',
      path: `/nuxeo/api/v1/id/${encodeURIComponent(uid)}/@op/Services.UntagDocument`,
      json: { params: { tags: tags.join(',') }, context: {} },
      signal,
    });
    return { uid, tagsRemoved: tags };
  },
};

/**
 * Mirrors `BrowseService.updateDocument` — `PUT /nuxeo/api/v1/id/{uid}`.
 *
 * The one tool that declares a form, which is what plan A7 stage 3 delivered and
 * the whole of what it delivered. Declaring it here rather than in the browser
 * is the point: the fields the user may change and the request that runs come
 * from one declaration, so a tool cannot describe one form and perform a
 * different write.
 *
 * Two of the five fields are writable. The other three are the context that makes
 * the form reviewable — who created this, when, who touched it last — and they
 * are display-only in the strong sense: submitting a value for one changes
 * nothing, because `overlayFormSubmission` builds the write from the fields
 * marked `editable` and from no other source.
 */
export const updateMetadataTool: AgentTool = {
  name: 'nuxeo.updateMetadata',
  description:
    'Update metadata properties on a single document. Properties use Nuxeo xpath keys such as ' +
    '"dc:title" or "dc:description".',
  mutating: true,
  mutation: {
    action: 'Change metadata on',
    subject: { arg: 'uid', changed: true, permissions: WRITE_PERMISSIONS },
    form: {
      component: 'documentMetadataForm',
      valuesArg: 'properties',
      title: 'Edit metadata',
      submitLabel: 'Save changes',
      fields: [
        {
          name: 'dc:title',
          label: 'Title',
          type: 'text',
          editable: true,
          required: true,
          maxLength: 250,
        },
        {
          name: 'dc:description',
          label: 'Description',
          type: 'multiline',
          editable: true,
          maxLength: 2000,
        },
        { name: 'dc:created', label: 'Created', type: 'date' },
        { name: 'dc:creator', label: 'Created by', type: 'text' },
        { name: 'dc:lastContributor', label: 'Last edited by', type: 'text' },
      ],
    },
  },
  parameters: {
    type: 'object',
    properties: {
      uid: { type: 'string' },
      properties: {
        type: 'object',
        description: 'Map of Nuxeo property xpath to new value.',
        additionalProperties: true,
      },
    },
    required: ['uid', 'properties'],
    additionalProperties: false,
  },
  async execute(args, { caller, nuxeo, signal }: ToolContext) {
    const uid = requiredString(args, 'uid');
    const properties = requiredRecord(args, 'properties');
    const doc = await nuxeo.json<NuxeoDocument>(caller, {
      method: 'PUT',
      path: `/nuxeo/api/v1/id/${encodeURIComponent(uid)}`,
      json: { 'entity-type': 'document', properties },
      headers: { properties: '*' },
      signal,
    });
    // The values Nuxeo stored, read back out of its own response rather than
    // echoed from the request.
    //
    // `updated` alone — just the field names — was not enough, and a live run with
    // a chat-rendered form is what showed it. A form submission replaces the
    // model's proposed value with the user's, server-side, inside
    // `overlayFormSubmission`; the model never sees that happen. Told only that
    // `dc:description` changed, it reported the change using the only value it
    // knew, which was its own proposal, and told the user their edit was saved
    // under the text they had just replaced. The write was correct and the
    // sentence describing it was not.
    //
    // Read from `doc` rather than from `properties` deliberately: what the model
    // relays is then what the repository holds, so a value Nuxeo coerced,
    // truncated or refused cannot be reported as though it had been stored
    // verbatim.
    const stored = Object.fromEntries(
      Object.keys(properties).map((name) => [name, doc.properties?.[name] ?? null]),
    );
    return { ...summarize(doc), updated: Object.keys(properties), values: stored };
  },
};

/**
 * Bulk metadata update over an NXQL selection, via `Bulk.RunAction` with the
 * `setProperties` action.
 *
 * This is the one endpoint in the set with no existing caller in
 * `libs/shared/nuxeo-client`. The repo uses the same `Bulk.RunAction` envelope
 * for `csvExport` (BrowseService.startCsvExport) and `ingest`
 * (ContentLakeIngestService.startIngest), so the request shape is established
 * here; only the action name and its `parameters` payload are new. It is
 * asynchronous: Nuxeo returns a bulk command id and the work completes later.
 */
export const bulkUpdateMetadataTool: AgentTool = {
  name: 'nuxeo.bulkUpdateMetadata',
  description:
    'Apply the same metadata properties to every document matching an NXQL query. Runs ' +
    'asynchronously on the server and returns a bulk command id, not the updated documents.',
  mutating: true,
  // No document argument, so nothing to resolve and nothing to check. The
  // selection is a query, and evaluating preconditions over it would mean running
  // it and reading every match — unbounded work on a path the user is waiting on.
  // Nuxeo's bulk action applies the caller's ACLs and skips what it may not touch.
  mutation: { action: 'Change metadata on everything matching', value: 'query' },
  parameters: {
    type: 'object',
    properties: {
      query: { type: 'string', description: 'NXQL selecting the documents to update.' },
      properties: {
        type: 'object',
        description: 'Map of Nuxeo property xpath to new value.',
        additionalProperties: true,
      },
    },
    required: ['query', 'properties'],
    additionalProperties: false,
  },
  async execute(args, { caller, nuxeo, signal }: ToolContext) {
    const query = requiredString(args, 'query');
    const properties = requiredRecord(args, 'properties');
    const status = await nuxeo.automation<Record<string, unknown>>(
      caller,
      'Bulk.RunAction',
      {
        action: 'setProperties',
        query,
        parameters: JSON.stringify(properties),
      },
      { signal },
    );
    return {
      commandId: status['commandId'] ?? (status['value'] as Record<string, unknown>)?.['commandId'],
      state: status['state'] ?? 'SCHEDULED',
      updated: Object.keys(properties),
    };
  },
};

/**
 * Move documents into another folder.
 *
 * The plan's traceability audit lists document move as the one addition with no
 * existing service method. It does have one: `BrowseService.moveDocuments`
 * already calls `POST /nuxeo/api/v1/automation/Document.Move` with
 * `input: "doc:<uid>"` or `"docs:<uid>,<uid>"`. This tool uses that same
 * operation and envelope; no new endpoint was needed.
 */
export const moveDocumentsTool: AgentTool = {
  name: 'nuxeo.moveDocuments',
  description: 'Move one or more documents into a target folder.',
  mutating: true,
  // `CoreSession.move` checks `REMOVE` on the document and `ADD_CHILDREN` on the
  // destination, so those are the two checked here. `REMOVE_CHILDREN` on each
  // source parent is not: it would cost one extra read per distinct parent, on a
  // path the user is waiting on, to pre-empt a 403 Nuxeo raises anyway.
  mutation: {
    action: 'Move',
    subject: { arg: 'uids', changed: true, permissions: REMOVE_PERMISSIONS },
    into: { preposition: 'into', arg: 'targetUid', permissions: ADD_CHILDREN_PERMISSIONS },
  },
  parameters: {
    type: 'object',
    properties: {
      uids: { type: 'array', items: { type: 'string' }, description: 'Documents to move.' },
      targetUid: { type: 'string', description: 'Destination folder uid.' },
    },
    required: ['uids', 'targetUid'],
    additionalProperties: false,
  },
  async execute(args, { caller, nuxeo, signal }: ToolContext) {
    const uids = requiredStringArray(args, 'uids');
    const targetUid = requiredString(args, 'targetUid');
    const input = uids.length === 1 ? `doc:${uids[0]}` : `docs:${uids.join(',')}`;
    const result = await nuxeo.automation<NuxeoDocument | NuxeoDocumentList>(
      caller,
      'Document.Move',
      { target: targetUid },
      { input, signal },
    );
    const moved =
      result && 'entries' in result ? (result.entries ?? []) : [result as NuxeoDocument];
    return { targetUid, moved: moved.map(summarize) };
  },
};

export const createCollectionTool: AgentTool = {
  name: 'nuxeo.createCollection',
  description: 'Create a new collection owned by the signed-in user.',
  mutating: true,
  // Creates rather than changes: there is no existing document to name or check.
  mutation: { action: 'Create a collection named', value: 'name' },
  parameters: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'Collection title.' },
      description: { type: 'string' },
    },
    required: ['name'],
    additionalProperties: false,
  },
  async execute(args, { caller, nuxeo, signal }: ToolContext) {
    const doc = await nuxeo.automation<NuxeoDocument>(
      caller,
      'Collection.Create',
      {
        name: requiredString(args, 'name'),
        description: optionalString(args, 'description') ?? '',
      },
      { signal },
    );
    return summarize(doc);
  },
};

export const addToCollectionTool: AgentTool = {
  name: 'nuxeo.addToCollection',
  description: 'Add a document to an existing collection.',
  mutating: true,
  // Membership is written on both sides: `collectionMember:collectionIds` on the
  // document and `collection:documentIds` on the collection.
  mutation: {
    action: 'Add',
    subject: { arg: 'uid', changed: true, permissions: WRITE_PERMISSIONS },
    into: {
      preposition: 'to the collection',
      arg: 'collectionUid',
      permissions: WRITE_PERMISSIONS,
    },
  },
  parameters: {
    type: 'object',
    properties: {
      uid: { type: 'string', description: 'Document to add.' },
      collectionUid: { type: 'string', description: 'Target collection uid.' },
    },
    required: ['uid', 'collectionUid'],
    additionalProperties: false,
  },
  async execute(args, { caller, nuxeo, signal }: ToolContext) {
    const uid = requiredString(args, 'uid');
    const collectionUid = requiredString(args, 'collectionUid');
    await nuxeo.json(caller, {
      method: 'POST',
      path: `/nuxeo/api/v1/id/${encodeURIComponent(uid)}/@op/Document.AddToCollection`,
      json: { params: { collection: collectionUid }, context: {} },
      signal,
    });
    return { uid, collectionUid, added: true };
  },
};

/** Mirrors `SearchService.saveSearch` — `POST /nuxeo/api/v1/search/saved`. */
export const saveSearchTool: AgentTool = {
  name: 'nuxeo.saveSearch',
  description:
    'Save a search so the user can re-run it later from the search page. Saved searches belong ' +
    'to the signed-in user.',
  mutating: true,
  mutation: { action: 'Save a search named', value: 'title' },
  parameters: {
    type: 'object',
    properties: {
      title: { type: 'string' },
      pageProviderName: {
        type: 'string',
        description: 'Nuxeo page provider, e.g. "default_search". Defaults to "default_search".',
      },
      params: {
        type: 'object',
        description: 'Page-provider parameters, e.g. { "ecm_fulltext": "contract" }.',
        additionalProperties: true,
      },
    },
    required: ['title', 'params'],
    additionalProperties: false,
  },
  async execute(args, { caller, nuxeo, signal }: ToolContext) {
    const saved = await nuxeo.json<{ id?: string; title?: string }>(caller, {
      method: 'POST',
      path: '/nuxeo/api/v1/search/saved',
      json: {
        'entity-type': 'savedSearch',
        title: requiredString(args, 'title'),
        pageProviderName: optionalString(args, 'pageProviderName') ?? 'default_search',
        params: requiredRecord(args, 'params'),
      },
      signal,
    });
    return { id: saved.id, title: saved.title };
  },
};

/**
 * Reads the effective ACLs on a document via the `acls` and `permissions`
 * enrichers, the same pair `BrowseService.getByPath` requests. Read-only: this
 * answers "who can see this", it does not grant anything.
 */
export const getDocumentAclsTool: AgentTool = {
  name: 'nuxeo.getDocumentAcls',
  description:
    'Read the access control lists on a document: which users and groups hold which permissions, ' +
    'and whether inheritance is blocked.',
  mutating: false,
  parameters: {
    type: 'object',
    properties: { uid: { type: 'string' } },
    required: ['uid'],
    additionalProperties: false,
  },
  async execute(args, { caller, nuxeo, signal }: ToolContext) {
    const uid = requiredString(args, 'uid');
    const doc = await nuxeo.json<NuxeoDocument>(caller, {
      method: 'GET',
      path: `/nuxeo/api/v1/id/${encodeURIComponent(uid)}`,
      headers: { properties: 'dublincore', 'enrichers.document': 'acls,permissions' },
      signal,
    });
    return {
      ...summarize(doc),
      acls: doc.contextParameters?.['acls'] ?? [],
      callerPermissions: doc.contextParameters?.['permissions'] ?? [],
    };
  },
};

/** Mirrors `DocumentDetailService.getAuditLog` — `GET /nuxeo/api/v1/id/{uid}/@audit`. */
export const getAuditHistoryTool: AgentTool = {
  name: 'nuxeo.getAuditHistory',
  description: 'Read the audit history of a single document: who did what to it, and when.',
  mutating: false,
  parameters: {
    type: 'object',
    properties: {
      uid: { type: 'string' },
      pageSize: { type: 'number' },
    },
    required: ['uid'],
    additionalProperties: false,
  },
  async execute(args, { caller, nuxeo, signal }: ToolContext) {
    const uid = requiredString(args, 'uid');
    const log = await nuxeo.json<{
      entries?: readonly Record<string, unknown>[];
      totalSize?: number;
    }>(caller, {
      method: 'GET',
      path: `/nuxeo/api/v1/id/${encodeURIComponent(uid)}/@audit`,
      query: {
        pageSize: optionalInteger(args, 'pageSize', 50, MAX_PAGE_SIZE),
        currentPageIndex: 0,
      },
      signal,
    });
    return {
      totalSize: log.totalSize ?? log.entries?.length ?? 0,
      entries: (log.entries ?? []).map((entry) => ({
        eventId: entry['eventId'],
        eventDate: entry['eventDate'],
        principalName: entry['principalName'],
        category: entry['category'],
        comment: entry['comment'],
      })),
    };
  },
};

/** Mirrors `AdministrationService.searchAuditLogs` — `Audit.QueryWithPageProvider`. */
export const searchAuditLogTool: AgentTool = {
  name: 'nuxeo.searchAuditLog',
  description:
    'Search the repository-wide audit log, optionally filtered by user, date range and event id.',
  mutating: false,
  parameters: {
    type: 'object',
    properties: {
      principalName: { type: 'string', description: 'Filter to one user.' },
      startDate: { type: 'string', description: 'ISO date, inclusive.' },
      endDate: { type: 'string', description: 'ISO date, inclusive.' },
      eventIds: { type: 'array', items: { type: 'string' } },
      pageSize: { type: 'number' },
    },
    additionalProperties: false,
  },
  async execute(args, { caller, nuxeo, signal }: ToolContext) {
    const namedParameters: Record<string, unknown> = {};
    const principalName = optionalString(args, 'principalName');
    const startDate = optionalString(args, 'startDate');
    const endDate = optionalString(args, 'endDate');
    const eventIds = optionalStringArray(args, 'eventIds');
    if (principalName) namedParameters['principalName'] = principalName;
    if (startDate) namedParameters['startDate'] = startDate;
    if (endDate) namedParameters['endDate'] = endDate;
    if (eventIds) namedParameters['eventIds'] = eventIds;

    const result = await nuxeo.automation<{
      entries?: readonly Record<string, unknown>[];
      value?: { entries?: readonly Record<string, unknown>[] };
    }>(
      caller,
      'Audit.QueryWithPageProvider',
      {
        providerName: 'AUDIT_BROWSER',
        pageSize: optionalInteger(args, 'pageSize', 50, MAX_PAGE_SIZE),
        currentPageIndex: 0,
        namedQueryParams: namedParameters,
      },
      { signal },
    );
    const entries = result.entries ?? result.value?.entries ?? [];
    return {
      totalSize: entries.length,
      entries: entries.map((entry) => ({
        eventId: entry['eventId'],
        eventDate: entry['eventDate'],
        principalName: entry['principalName'],
        docUUID: entry['docUUID'],
        category: entry['category'],
      })),
    };
  },
};

export const documentTools: readonly AgentTool[] = [
  searchDocumentsTool,
  getDocumentTool,
  listChildrenTool,
  tagDocumentTool,
  untagDocumentTool,
  updateMetadataTool,
  bulkUpdateMetadataTool,
  moveDocumentsTool,
  createCollectionTool,
  addToCollectionTool,
  saveSearchTool,
  getDocumentAclsTool,
  getAuditHistoryTool,
  searchAuditLogTool,
];
