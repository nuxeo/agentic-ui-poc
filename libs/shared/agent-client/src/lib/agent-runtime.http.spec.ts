import { TestBed } from '@angular/core/testing';
import { HttpAgent, type HttpAgentConfig } from '@ag-ui/client';
import { describe, beforeEach, expect, it, vi } from 'vitest';

import { AGENT_DEV_AUTH_HEADERS } from './agent.config';
import { AGENT_RUNNER_FACTORY, AgentRuntimeService } from './agent-runtime.service';
import {
  answeringTurn,
  frontendToolTurn,
  narratedToolTurn,
} from './testing/recorded-gateway-frames';

/**
 * The adapter driven end to end by the real `@ag-ui/client` `HttpAgent`, over recorded
 * `apps/agent-gateway` SSE frames.
 *
 * The scripted double in `agent-runtime.service.spec.ts` is faster and covers far more
 * cases, but it can only reproduce the SDK behaviour someone thought to model. These
 * tests exist for the behaviour nobody modelled: `AbstractAgent.onInitialize` throws
 * `Thread has N pending interrupt(s) not addressed by resume` *before the fetch*, so a
 * turn that answers a frontend tool call with only a `role: "tool"` message never
 * reaches the gateway at all. That is a whole class of defect, and this is the only
 * place in the repo that can see it.
 */

interface RecordedExchange {
  readonly body: string;
}

function eventStream(body: string): Response {
  return new Response(body, {
    status: 200,
    headers: { 'Content-Type': 'text/event-stream' },
  });
}

describe('AgentRuntimeService over a real HttpAgent', () => {
  let requests: Array<{ url: string; body: Record<string, unknown> }>;
  let exchanges: RecordedExchange[];

  /** Stands in for the network only; everything above it is the shipping SDK. */
  const fakeFetch = vi.fn(async (url: string, init: RequestInit): Promise<Response> => {
    requests.push({ url, body: JSON.parse(String(init.body)) as Record<string, unknown> });
    const next = exchanges.shift();
    if (!next) throw new Error(`No recorded gateway response for request ${requests.length}`);
    return eventStream(next.body);
  });

  function record(...bodies: string[]): void {
    exchanges = bodies.map((body) => ({ body }));
  }

  function service(): AgentRuntimeService {
    return TestBed.inject(AgentRuntimeService);
  }

  /** Lets the SDK's RxJS pipeline and the adapter's own promises settle. */
  async function settle(): Promise<void> {
    for (let tick = 0; tick < 8; tick += 1) {
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }

  function resumeIds(index: number): string[] {
    const resume = requests[index]?.body['resume'] as Array<{ interruptId: string }> | undefined;
    return (resume ?? []).map((entry) => entry.interruptId);
  }

  function toolMessages(index: number): Array<{ toolCallId?: string; content?: string }> {
    const messages = (requests[index]?.body['messages'] ?? []) as Array<{
      role: string;
      toolCallId?: string;
      content?: string;
    }>;
    return messages.filter((message) => message.role === 'tool');
  }

  beforeEach(() => {
    requests = [];
    exchanges = [];
    fakeFetch.mockClear();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AGENT_RUNNER_FACTORY,
          useValue: (config: HttpAgentConfig) => new HttpAgent({ ...config, fetch: fakeFetch }),
        },
        { provide: AGENT_DEV_AUTH_HEADERS, useValue: () => ({}) },
      ],
    });
  });

  it('sends the AG-UI required arrays and reaches the gateway at all', async () => {
    record(answeringTurn('r1', 'Two contracts matched.'));
    const agent = service();

    agent.send('find contracts');
    await settle();

    expect(fakeFetch).toHaveBeenCalledTimes(1);
    expect(requests[0].url).toBe('/nuxeo/agent/run');
    expect(Array.isArray(requests[0].body['tools'])).toBe(true);
    expect(Array.isArray(requests[0].body['context'])).toBe(true);
    expect(agent.error()).toBeNull();
    expect(agent.messages().map((message) => message.content)).toContain('Two contracts matched.');
  });

  /**
   * The panel reads `toolCallIds` to put a card where the call was made instead of after
   * everything the agent said. Only the real SDK produces them: `TOOL_CALL_START` with no
   * `parentMessageId` pushes an assistant message keyed by the call id, and the adapter
   * used to drop it for having no prose — taking the ordering with it.
   */
  it('keeps each tool call positioned between the messages around it', async () => {
    record(
      narratedToolTurn(
        'r1',
        'Let me look at what has moved.',
        {
          toolCallId: 'call-1',
          toolName: 'nuxeo.searchDocuments',
          args: { query: 'SELECT * FROM Document' },
          result: '{"entries":[]}',
        },
        'That is what I found.',
      ),
    );
    const agent = service();

    agent.send('what has changed?');
    await settle();

    expect(
      agent
        .messages()
        .map((message) => `${message.role}:${message.content || message.toolCallIds?.join(',')}`),
    ).toEqual([
      'user:what has changed?',
      'assistant:Let me look at what has moved.',
      'assistant:call-1',
      'tool:{"entries":[]}',
      'assistant:That is what I found.',
    ]);
  });

  it('answers a read-only tool interrupt with resume, so the next run leaves the browser', async () => {
    record(
      frontendToolTurn('r1', [
        { toolCallId: 'call-1', toolName: 'navigateTo', args: { route: '/doc/abc' } },
      ]),
      answeringTurn('r2', 'Opened it.'),
    );
    const agent = service();
    const navigate = vi.fn().mockReturnValue('Navigated to /doc/abc.');
    agent.registerToolHandler('navigateTo', navigate);

    agent.send('open abc');
    await settle();

    expect(navigate).toHaveBeenCalledWith({ route: '/doc/abc' });
    // Before the fix this was 1: the SDK threw on the unaddressed interrupt and the
    // user saw "The assistant is unavailable" with nothing having left the browser.
    expect(fakeFetch).toHaveBeenCalledTimes(2);
    expect(resumeIds(1)).toEqual(['call-1']);
    expect(toolMessages(1)).toHaveLength(1);
    expect(toolMessages(1)[0]).toMatchObject({
      toolCallId: 'call-1',
      content: 'Navigated to /doc/abc.',
    });
    expect(agent.error()).toBeNull();
    expect(agent.approvals()).toEqual([]);
    expect(agent.messages().map((message) => message.content)).toContain('Opened it.');
  });

  it('raises exactly one approval for a mutating tool and runs it when approved', async () => {
    record(
      frontendToolTurn('r1', [
        {
          toolCallId: 'call-1',
          toolName: 'applyMetadata',
          args: { docId: 'doc-1', properties: { 'dc:title': 'New' } },
          message: 'Rename Contract A to New?',
        },
      ]),
      answeringTurn('r2', 'Renamed it.'),
    );
    const agent = service();
    const apply = vi.fn().mockResolvedValue('Updated 1 propert(ies) on doc-1.');
    agent.registerToolHandler('applyMetadata', apply);

    agent.send('rename doc-1');
    await settle();

    // NG0955: two entries sharing `track request.id` used to reach the panel here.
    expect(agent.approvals()).toEqual([
      {
        id: 'call-1',
        kind: 'interrupt',
        toolName: 'applyMetadata',
        summary: 'Rename Contract A to New?',
        args: { docId: 'doc-1', properties: { 'dc:title': 'New' } },
      },
    ]);
    expect(apply).not.toHaveBeenCalled();
    expect(fakeFetch).toHaveBeenCalledTimes(1);

    agent.respondToApproval('call-1', true);
    await settle();

    // The whole point of the defect: the browser handler has to actually run.
    expect(apply).toHaveBeenCalledWith({ docId: 'doc-1', properties: { 'dc:title': 'New' } });
    expect(fakeFetch).toHaveBeenCalledTimes(2);
    expect(resumeIds(1)).toEqual(['call-1']);
    expect(toolMessages(1)[0].content).toBe('Updated 1 propert(ies) on doc-1.');
    expect(agent.approvals()).toEqual([]);
    expect(agent.error()).toBeNull();
  });

  it('waits for the human before resuming a turn that mixed a write with a navigation', async () => {
    record(
      frontendToolTurn('r1', [
        { toolCallId: 'call-nav', toolName: 'navigateTo', args: { route: '/doc/abc' } },
        {
          toolCallId: 'call-write',
          toolName: 'applyMetadata',
          args: { docId: 'doc-1', properties: { 'dc:title': 'New' } },
        },
      ]),
      answeringTurn('r2', 'Done.'),
    );
    const agent = service();
    agent.registerToolHandler('navigateTo', () => 'Navigated to /doc/abc.');
    const apply = vi.fn().mockResolvedValue('Updated 1 propert(ies) on doc-1.');
    agent.registerToolHandler('applyMetadata', apply);

    agent.send('open abc and rename it');
    await settle();

    // The navigation ran, but resuming now would leave the write's interrupt
    // unaddressed and the SDK would refuse the run.
    expect(fakeFetch).toHaveBeenCalledTimes(1);
    expect(agent.approvals().map((request) => request.id)).toEqual(['call-write']);

    agent.respondToApproval('call-write', true);
    await settle();

    expect(fakeFetch).toHaveBeenCalledTimes(2);
    expect(resumeIds(1).sort()).toEqual(['call-nav', 'call-write']);
    expect(agent.error()).toBeNull();
  });

  it('resumes with a cancellation when the user declines, and never writes', async () => {
    record(
      frontendToolTurn('r1', [
        {
          toolCallId: 'call-1',
          toolName: 'applyMetadata',
          args: { docId: 'doc-1', properties: { 'dc:title': 'New' } },
        },
      ]),
      answeringTurn('r2', 'Left it alone.'),
    );
    const agent = service();
    const apply = vi.fn();
    agent.registerToolHandler('applyMetadata', apply);

    agent.send('rename doc-1');
    await settle();
    agent.respondToApproval('call-1', false);
    await settle();

    expect(apply).not.toHaveBeenCalled();
    const resume = requests[1].body['resume'] as Array<{ interruptId: string; status: string }>;
    expect(resume).toEqual([{ interruptId: 'call-1', status: 'cancelled' }]);
    expect(agent.error()).toBeNull();
  });
});
