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
import { DEFAULT_TOOLS } from '../tools/default-registry';
import { FRONTEND_TOOL_NAMES } from '../tools/frontend-tools';
import type { ToolContext } from '../tools/tool.types';
import {
  createDemoToolRegistry,
  DEMO_DATA_MARKER,
  DEMO_GROUNDING_NXQL,
  DEMO_TOOL_OVERRIDES,
  demoAskKnowledgeDiscoveryTool,
  demoSummarizeDocumentTool,
  demoToolProvenance,
} from './demo-tools';

function context(response: unknown): {
  ctx: ToolContext;
  requests: ReturnType<typeof recordingFetch>['requests'];
} {
  const recorder = recordingFetch(() => jsonResponse(response));
  return {
    ctx: {
      caller: testCaller(),
      nuxeo: new NuxeoRestClient(TEST_NUXEO_BASE_URL, recorder.fetchImpl),
      signal: new AbortController().signal,
      logger: testLogger(),
    },
    requests: recorder.requests,
  };
}

describe('demoToolProvenance', () => {
  // The lookup is the fact `validateDemoScripts` checks declarations against, so it
  // has to describe what the composed registry will actually do, not what we hope.
  it('reports the two substituted tools as substituted', () => {
    expect(demoToolProvenance('kd.ask')).toBe('hybrid');
    expect(demoToolProvenance('ai.summarizeDocument')).toBe('canned');
  });

  it('reports every other shipped tool as real', () => {
    const overridden = DEMO_TOOL_OVERRIDES.map((entry) => entry.tool.name);
    for (const tool of DEFAULT_TOOLS) {
      if (overridden.includes(tool.name)) continue;
      expect(demoToolProvenance(tool.name), tool.name).toBe('real-nuxeo');
    }
  });

  it('reports browser-executed tools as frontend, not as substitutions', () => {
    for (const name of FRONTEND_TOOL_NAMES) {
      expect(demoToolProvenance(name), name).toBe('frontend');
    }
  });

  it('reports an unknown name as unknown, so a typo in a script fails startup', () => {
    expect(demoToolProvenance('nuxeo.doesNotExist')).toBeUndefined();
  });
});

describe('createDemoToolRegistry', () => {
  it('serves the same tool names as production', () => {
    const registry = createDemoToolRegistry();
    expect(registry.names().sort()).toEqual(DEFAULT_TOOLS.map((tool) => tool.name).sort());
  });

  it('swaps the substituted tools rather than adding duplicates', () => {
    const registry = createDemoToolRegistry();
    expect(registry.get('kd.ask')).toBe(demoAskKnowledgeDiscoveryTool);
    expect(registry.get('ai.summarizeDocument')).toBe(demoSummarizeDocumentTool);
  });

  it('does not serve frontend tools, so they still interrupt the run', () => {
    const registry = createDemoToolRegistry();
    for (const name of FRONTEND_TOOL_NAMES) expect(registry.has(name)).toBe(false);
  });
});

describe('demo kd.ask', () => {
  const entries = [
    {
      uid: 'uid-1',
      title: 'Quarterly report',
      type: 'File',
      path: '/default-domain/report',
      properties: { 'dc:description': '  Q3 numbers  ' },
    },
    { uid: 'uid-2' },
  ];

  it('reads its citations live from Nuxeo as the caller', async () => {
    const { ctx, requests } = context({ entries });
    await demoAskKnowledgeDiscoveryTool.execute({ agentId: 'a', question: 'what is here?' }, ctx);

    expect(requests).toHaveLength(1);
    expect(requests[0]?.url).toContain('/nuxeo/api/v1/search/lang/NXQL/execute');
    // `+` for space is how URLSearchParams encodes it; the query itself is intact.
    expect(decodeURIComponent(requests[0]?.url ?? '').replace(/\+/g, ' ')).toContain(
      DEMO_GROUNDING_NXQL,
    );
    // The whole permission story rests on this: the demo reads as the signed-in user.
    expect(requests[0]?.headers['cookie']).toBe(TEST_SESSION_COOKIE);
  });

  it('returns citations with the real uids, so a source card opens a real document', async () => {
    const { ctx } = context({ entries });
    const result = (await demoAskKnowledgeDiscoveryTool.execute(
      { agentId: 'a', question: 'what is here?' },
      ctx,
    )) as { citations: { uid: string; title: string; excerpt?: string }[] };

    expect(result.citations.map((citation) => citation.uid)).toEqual(['uid-1', 'uid-2']);
    expect(result.citations[0]).toMatchObject({ title: 'Quarterly report', excerpt: 'Q3 numbers' });
    // A missing title falls back to the uid rather than to an invented one.
    expect(result.citations[1]).toEqual({ uid: 'uid-2', title: 'uid-2' });
  });

  it('marks itself as demo data and says which half is scripted', async () => {
    const { ctx } = context({ entries });
    const result = (await demoAskKnowledgeDiscoveryTool.execute(
      { agentId: 'a', question: 'q' },
      ctx,
    )) as Record<string, unknown>;

    expect(result[DEMO_DATA_MARKER]).toBe(true);
    expect(String(result['demoNote'])).toContain('not installed');
    expect(String(result['demoNote'])).toContain('citations are real');
    expect(result['question']).toBe('q');
  });

  it('survives a repository that returns no entries at all', async () => {
    const { ctx } = context({});
    const result = (await demoAskKnowledgeDiscoveryTool.execute(
      { agentId: 'a', question: 'q' },
      ctx,
    )) as { citations: unknown[] };
    expect(result.citations).toEqual([]);
  });

  it('rejects a call with no question rather than inventing one', async () => {
    const { ctx } = context({ entries });
    await expect(demoAskKnowledgeDiscoveryTool.execute({ agentId: 'a' }, ctx)).rejects.toThrow();
  });
});

describe('demo ai.summarizeDocument', () => {
  // The most dangerous possible fabrication — a plausible summary of a document
  // nobody read — so the text says PLACEHOLDER on screen and nothing is fetched.
  it('reads nothing and labels itself a placeholder', async () => {
    const { ctx, requests } = context({});
    const result = (await demoSummarizeDocumentTool.execute({ uid: 'uid-1' }, ctx)) as Record<
      string,
      unknown
    >;

    expect(requests).toHaveLength(0);
    expect(result[DEMO_DATA_MARKER]).toBe(true);
    expect(String(result['summary'])).toContain('PLACEHOLDER');
    expect(String(result['demoNote'])).toContain('nuxeo-ai-package');
    expect(result['uid']).toBe('uid-1');
  });

  it('rejects a call with no uid', async () => {
    const { ctx } = context({});
    await expect(demoSummarizeDocumentTool.execute({}, ctx)).rejects.toThrow();
  });

  it('keeps the shipped tool name and parameter contract', () => {
    const shipped = DEFAULT_TOOLS.find((tool) => tool.name === 'ai.summarizeDocument');
    expect(demoSummarizeDocumentTool.name).toBe(shipped?.name);
    expect(demoSummarizeDocumentTool.parameters).toEqual(shipped?.parameters);
  });
});
