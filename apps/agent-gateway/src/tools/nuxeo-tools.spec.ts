import { describe, expect, it } from 'vitest';

import { NuxeoRestClient } from '../nuxeo/nuxeo-rest-client';
import {
  jsonResponse,
  recordingFetch,
  testCaller,
  testLogger,
  TEST_NUXEO_BASE_URL,
} from '../testing/test-doubles';
import { ToolArgumentError } from './args';
import { askKnowledgeDiscoveryTool, ContentIntelligenceError } from './content-intelligence-tools';
import {
  bulkUpdateMetadataTool,
  getAuditHistoryTool,
  getDocumentAclsTool,
  moveDocumentsTool,
  saveSearchTool,
  searchDocumentsTool,
  updateMetadataTool,
} from './nuxeo-document-tools';
import { completeTaskTool, listMyTasksTool } from './nuxeo-workflow-tools';
import type { AgentTool } from './tool.types';

function harness(respond: (url: string) => Response) {
  const recorder = recordingFetch((request) => respond(request.url));
  const nuxeo = new NuxeoRestClient(TEST_NUXEO_BASE_URL, recorder.fetchImpl);
  const context = {
    caller: testCaller(),
    nuxeo,
    signal: new AbortController().signal,
    logger: testLogger(),
  };
  const run = (tool: AgentTool, args: Record<string, unknown>) =>
    tool.execute(args as never, context);
  return { recorder, run };
}

describe('nuxeo.searchDocuments', () => {
  it('calls the NXQL search endpoint and projects results down to what a model needs', async () => {
    const { recorder, run } = harness(() =>
      jsonResponse({
        totalSize: 1,
        entries: [
          {
            uid: 'doc-1',
            title: 'Contract',
            type: 'File',
            path: '/ws/contract',
            properties: { 'dc:description': 'a very long description' },
          },
        ],
      }),
    );

    const result = await run(searchDocumentsTool, { query: 'SELECT * FROM Document' });

    const url = new URL(recorder.requests[0]?.url ?? '');
    expect(url.pathname).toBe('/nuxeo/api/v1/search/lang/NXQL/execute');
    expect(url.searchParams.get('query')).toBe('SELECT * FROM Document');
    expect(result).toEqual({
      totalSize: 1,
      entries: [
        {
          uid: 'doc-1',
          title: 'Contract',
          type: 'File',
          path: '/ws/contract',
          state: undefined,
          lastModified: undefined,
        },
      ],
    });
  });

  it('caps pageSize so a model cannot ask for the whole repository', async () => {
    const { recorder, run } = harness(() => jsonResponse({ entries: [] }));

    await run(searchDocumentsTool, { query: 'SELECT * FROM Document', pageSize: 100000 });

    expect(new URL(recorder.requests[0]?.url ?? '').searchParams.get('pageSize')).toBe('100');
  });

  it('rejects a missing query with a message the model can act on', async () => {
    const { run } = harness(() => jsonResponse({}));
    await expect(run(searchDocumentsTool, {})).rejects.toBeInstanceOf(ToolArgumentError);
  });
});

describe('metadata tools', () => {
  it('updates a single document with PUT /id/{uid}', async () => {
    const { recorder, run } = harness(() => jsonResponse({ uid: 'doc-1', title: 'New' }));

    const result = await run(updateMetadataTool, {
      uid: 'doc-1',
      properties: { 'dc:title': 'New' },
    });

    expect(recorder.requests[0]?.method).toBe('PUT');
    expect(new URL(recorder.requests[0]?.url ?? '').pathname).toBe('/nuxeo/api/v1/id/doc-1');
    expect(JSON.parse(recorder.requests[0]?.body ?? '{}')).toEqual({
      'entity-type': 'document',
      properties: { 'dc:title': 'New' },
    });
    expect(result).toMatchObject({ updated: ['dc:title'] });
  });

  /**
   * The values come back from Nuxeo's response, not from the request.
   *
   * A live run with a chat-rendered form is what forced this, and it is the one
   * defect stage 3 found that no unit test had. `overlayFormSubmission` replaces
   * the model's proposed value with the user's *server-side*, so the model never
   * observes the substitution. Given only the changed field names, it reported the
   * change using the only value it had — its own proposal — and told the user their
   * edit had been saved under the text they had just replaced. The write was
   * correct; the sentence describing it was not.
   *
   * Reading from the response rather than echoing the request is what makes the
   * relayed value the one the repository actually holds.
   */
  it('reports the values Nuxeo stored rather than the ones it was sent', async () => {
    const { run } = harness(() =>
      jsonResponse({
        uid: 'doc-1',
        title: 'What the user typed',
        // Nuxeo's answer differs from the request, which is exactly the case a
        // form submission produces.
        properties: { 'dc:title': 'What the user typed' },
      }),
    );

    const result = await run(updateMetadataTool, {
      uid: 'doc-1',
      properties: { 'dc:title': 'What the model proposed' },
    });

    expect(result).toMatchObject({ values: { 'dc:title': 'What the user typed' } });
  });

  it('reports null for a property Nuxeo did not return, rather than the requested value', async () => {
    // A value Nuxeo coerced, dropped or refused must not be relayed as though it
    // had been stored verbatim.
    const { run } = harness(() => jsonResponse({ uid: 'doc-1', properties: {} }));

    const result = await run(updateMetadataTool, {
      uid: 'doc-1',
      properties: { 'dc:description': 'Never stored' },
    });

    expect(result).toMatchObject({ values: { 'dc:description': null } });
  });

  it('runs a bulk update through Bulk.RunAction/setProperties and returns the command id', async () => {
    const { recorder, run } = harness(() =>
      jsonResponse({ commandId: 'bulk-1', state: 'SCHEDULED' }),
    );

    const result = await run(bulkUpdateMetadataTool, {
      query: "SELECT * FROM Document WHERE ecm:primaryType = 'File'",
      properties: { 'dc:nature': 'contract' },
    });

    expect(new URL(recorder.requests[0]?.url ?? '').pathname).toBe(
      '/nuxeo/api/v1/automation/Bulk.RunAction',
    );
    expect(JSON.parse(recorder.requests[0]?.body ?? '{}').params).toMatchObject({
      action: 'setProperties',
      parameters: JSON.stringify({ 'dc:nature': 'contract' }),
    });
    expect(result).toMatchObject({ commandId: 'bulk-1' });
  });
});

describe('nuxeo.moveDocuments', () => {
  // Document.Move already backs BrowseService.moveDocuments; the input encoding
  // is the part that differs between one document and several.
  it('uses the doc: input form for a single document', async () => {
    const { recorder, run } = harness(() => jsonResponse({ uid: 'doc-1', title: 'Moved' }));

    await run(moveDocumentsTool, { uids: ['doc-1'], targetUid: 'folder-2' });

    expect(new URL(recorder.requests[0]?.url ?? '').pathname).toBe(
      '/nuxeo/api/v1/automation/Document.Move',
    );
    expect(JSON.parse(recorder.requests[0]?.body ?? '{}')).toEqual({
      params: { target: 'folder-2' },
      context: {},
      input: 'doc:doc-1',
    });
  });

  it('uses the docs: input form for several documents and normalises the entry list', async () => {
    const { recorder, run } = harness(() =>
      jsonResponse({ entries: [{ uid: 'doc-1' }, { uid: 'doc-2' }] }),
    );

    const result = await run(moveDocumentsTool, {
      uids: ['doc-1', 'doc-2'],
      targetUid: 'folder-2',
    });

    expect(JSON.parse(recorder.requests[0]?.body ?? '{}').input).toBe('docs:doc-1,doc-2');
    expect(result).toMatchObject({ moved: [{ uid: 'doc-1' }, { uid: 'doc-2' }] });
  });
});

describe('governance read tools', () => {
  it('requests the acls and permissions enrichers when reading ACLs', async () => {
    const { recorder, run } = harness(() =>
      jsonResponse({
        uid: 'doc-1',
        contextParameters: { acls: [{ name: 'local' }], permissions: ['Read'] },
      }),
    );

    const result = await run(getDocumentAclsTool, { uid: 'doc-1' });

    expect(recorder.requests[0]?.headers['enrichers.document']).toBe('acls,permissions');
    expect(result).toMatchObject({ acls: [{ name: 'local' }], callerPermissions: ['Read'] });
  });

  it('reads document audit history from the @audit adapter', async () => {
    const { recorder, run } = harness(() =>
      jsonResponse({
        totalSize: 1,
        entries: [
          { eventId: 'documentModified', principalName: 'jdoe', eventDate: '2026-08-01', extra: 1 },
        ],
      }),
    );

    const result = await run(getAuditHistoryTool, { uid: 'doc-1' });

    expect(new URL(recorder.requests[0]?.url ?? '').pathname).toBe('/nuxeo/api/v1/id/doc-1/@audit');
    expect(result).toMatchObject({
      entries: [{ eventId: 'documentModified', principalName: 'jdoe' }],
    });
  });
});

describe('nuxeo.saveSearch', () => {
  it('posts a savedSearch entity with a default page provider', async () => {
    const { recorder, run } = harness(() => jsonResponse({ id: 'ss-1', title: 'Contracts' }));

    await run(saveSearchTool, { title: 'Contracts', params: { ecm_fulltext: 'contract' } });

    expect(new URL(recorder.requests[0]?.url ?? '').pathname).toBe('/nuxeo/api/v1/search/saved');
    expect(JSON.parse(recorder.requests[0]?.body ?? '{}')).toMatchObject({
      'entity-type': 'savedSearch',
      pageProviderName: 'default_search',
    });
  });
});

describe('task tools', () => {
  // The model must not be able to name the user whose queue it reads; the
  // principal comes from the validated session.
  it('lists tasks for the validated caller, not for a tool argument', async () => {
    const { recorder, run } = harness(() => jsonResponse({ entries: [] }));

    await run(listMyTasksTool, { userId: 'someone-else' } as Record<string, unknown>);

    expect(new URL(recorder.requests[0]?.url ?? '').searchParams.get('userId')).toBe('jdoe');
  });

  it('completes a task by putting to /task/{id}/{action}', async () => {
    const { recorder, run } = harness(() => jsonResponse({ id: 'task-1', state: 'ended' }));

    await run(completeTaskTool, { taskId: 'task-1', action: 'approve', comment: 'ok' });

    expect(recorder.requests[0]?.method).toBe('PUT');
    expect(new URL(recorder.requests[0]?.url ?? '').pathname).toBe(
      '/nuxeo/api/v1/task/task-1/approve',
    );
    expect(JSON.parse(recorder.requests[0]?.body ?? '{}')).toMatchObject({ comment: 'ok' });
  });
});

describe('kd.ask', () => {
  it('calls the connector automation op and returns the answer with citations', async () => {
    const { recorder, run } = harness(() =>
      jsonResponse({
        responseCode: 200,
        response: {
          questionId: 'q-1',
          answer: 'Three contracts changed.',
          citations: [{ objectId: 'nuxeo__doc-1', score: 0.8, excerpt: 'clause' }],
        },
      }),
    );

    const result = await run(askKnowledgeDiscoveryTool, {
      agentId: 'agent-1',
      question: 'What changed?',
    });

    expect(new URL(recorder.requests[0]?.url ?? '').pathname).toBe(
      '/nuxeo/site/automation/HylandKnowledgeDiscovery.askQuestionAndGetAnswer',
    );
    expect(result).toMatchObject({
      answer: 'Three contracts changed.',
      citations: [{ objectId: 'nuxeo__doc-1' }],
    });
  });

  // A 200 from Nuxeo can still carry a 403 from Discovery inside the envelope.
  it('surfaces an upstream failure hidden inside a 200 envelope', async () => {
    const { run } = harness(() =>
      jsonResponse({
        responseCode: 403,
        responseMessage: 'tenant not provisioned',
        response: null,
      }),
    );

    await expect(
      run(askKnowledgeDiscoveryTool, { agentId: 'agent-1', question: 'x' }),
    ).rejects.toBeInstanceOf(ContentIntelligenceError);
  });
});
