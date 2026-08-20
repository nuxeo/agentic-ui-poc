import { describe, expect, it } from 'vitest';

import { NuxeoRestClient } from '../nuxeo/nuxeo-rest-client';
import {
  jsonResponse,
  recordingFetch,
  testCaller,
  testLogger,
  TEST_NUXEO_BASE_URL,
  TEST_SESSION_COOKIE,
} from '../testing/test-doubles';
import { DEFAULT_TOOLS } from './default-registry';
import type { AgentTool } from './tool.types';

/**
 * The regression this file exists to catch.
 *
 * A future tool added with its own `fetch`, or with a service-account header, or
 * simply forgetting to pass the caller through, would cross ACL boundaries
 * silently: no error, no audit signal, just documents the user was never
 * allowed to see. A happy-path test on that tool would still pass.
 *
 * So instead of testing tools one at a time, this sweeps *every* tool in the
 * shipped set and asserts on the requests that actually left the process. A new
 * tool is covered the moment it is registered — there is nothing to remember to
 * add here.
 */

/** Minimal valid arguments per tool, so the sweep can run all of them. */
const TOOL_ARGUMENTS: Record<string, Record<string, unknown>> = {
  'nuxeo.searchDocuments': { query: 'SELECT * FROM Document' },
  'nuxeo.getDocument': { uid: 'doc-1' },
  'nuxeo.listChildren': { uid: 'folder-1' },
  'nuxeo.tagDocument': { uid: 'doc-1', tags: ['contract'] },
  'nuxeo.untagDocument': { uid: 'doc-1', tags: ['contract'] },
  'nuxeo.updateMetadata': { uid: 'doc-1', properties: { 'dc:title': 'New' } },
  'nuxeo.bulkUpdateMetadata': {
    query: 'SELECT * FROM Document',
    properties: { 'dc:nature': 'contract' },
  },
  'nuxeo.moveDocuments': { uids: ['doc-1'], targetUid: 'folder-2' },
  'nuxeo.createCollection': { name: 'Q3 review' },
  'nuxeo.addToCollection': { uid: 'doc-1', collectionUid: 'col-1' },
  'nuxeo.saveSearch': { title: 'Contracts', params: { ecm_fulltext: 'contract' } },
  'nuxeo.getDocumentAcls': { uid: 'doc-1' },
  'nuxeo.getAuditHistory': { uid: 'doc-1' },
  'nuxeo.searchAuditLog': { principalName: 'jdoe' },
  'nuxeo.listMyTasks': {},
  'nuxeo.getDocumentTasks': { uid: 'doc-1' },
  'nuxeo.completeTask': { taskId: 'task-1', action: 'approve' },
  'nuxeo.listWorkflowModels': {},
  'nuxeo.startWorkflow': { uid: 'doc-1', workflowModelName: 'SerialDocumentReview' },
  'nuxeo.getDocumentWorkflows': { uid: 'doc-1' },
  'ai.summarizeDocument': { uid: 'doc-1' },
  'ai.classifyDocument': { uid: 'doc-1' },
  'ai.suggestTags': { uid: 'doc-1' },
  'ai.findSimilarDocuments': { uid: 'doc-1' },
  'ai.detectAuditAnomalies': {},
  'ai.analyzeCommentSentiment': { comments: [{ id: 'c1', text: 'Looks good' }] },
  'kd.listAgents': {},
  'kd.ask': { agentId: 'agent-1', question: 'What changed?' },
  'ke.enrichDocument': { uid: 'doc-1' },
};

function respondFor(url: string): Response {
  if (url.includes('/@blob/')) {
    return new Response('bytes', {
      status: 200,
      headers: { 'content-type': 'application/pdf' },
    });
  }
  if (url.includes('/nuxeo/site/automation/')) {
    return jsonResponse({ response: {}, responseCode: 200 });
  }
  return jsonResponse({ entries: [], uid: 'doc-1' });
}

async function runTool(tool: AgentTool): Promise<ReturnType<typeof recordingFetch>> {
  const recorder = recordingFetch((request) => respondFor(request.url));
  const nuxeo = new NuxeoRestClient(TEST_NUXEO_BASE_URL, recorder.fetchImpl);
  await tool.execute(TOOL_ARGUMENTS[tool.name] as never, {
    caller: testCaller(),
    nuxeo,
    signal: new AbortController().signal,
    logger: testLogger(),
  });
  return recorder;
}

describe('identity propagation across the shipped tool set', () => {
  it('has arguments defined for every registered tool, so the sweep is complete', () => {
    const missing = DEFAULT_TOOLS.filter((tool) => !TOOL_ARGUMENTS[tool.name]).map((t) => t.name);
    expect(missing).toEqual([]);
  });

  it.each(DEFAULT_TOOLS.map((tool) => [tool.name, tool] as const))(
    '%s sends the caller credential on every downstream request',
    async (_name, tool) => {
      const recorder = await runTool(tool);

      expect(recorder.requests.length).toBeGreaterThan(0);
      for (const request of recorder.requests) {
        expect(request.headers['cookie']).toBe(TEST_SESSION_COOKIE);
      }
    },
  );

  it.each(DEFAULT_TOOLS.map((tool) => [tool.name, tool] as const))(
    '%s only ever calls the configured Nuxeo instance',
    async (_name, tool) => {
      const recorder = await runTool(tool);

      for (const request of recorder.requests) {
        expect(new URL(request.url).origin).toBe(TEST_NUXEO_BASE_URL);
      }
    },
  );

  it('never sends a Basic authorization header the gateway made up', async () => {
    for (const tool of DEFAULT_TOOLS) {
      const recorder = await runTool(tool);
      for (const request of recorder.requests) {
        expect(request.headers['authorization']).toBeUndefined();
      }
    }
  });
});
