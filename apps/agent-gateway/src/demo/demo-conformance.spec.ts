import {
  EventSchemas,
  EventType,
  type BaseEvent,
  type Message,
  type ResumeEntry,
  type RunAgentInput,
} from '@ag-ui/core';
import { describe, expect, it } from 'vitest';

import { MUTATION_APPROVAL_INTERRUPT_KIND } from '../agent/approval-gate';
import { CITATIONS_EVENT_NAME } from '../agent/citations';
import { runAgent, THINKING_EVENT_NAME } from '../agent/run-agent';
import { NuxeoRestClient } from '../nuxeo/nuxeo-rest-client';
import { throughClientChunkTransform } from '../testing/ag-ui-client-transform';
import {
  jsonResponse,
  recordingFetch,
  testCaller,
  testLogger,
  TEST_NUXEO_BASE_URL,
  TEST_SESSION_COOKIE,
} from '../testing/test-doubles';
import { FRONTEND_TOOL_NAMES } from '../tools/frontend-tools';
import { loadDemoConfig } from './demo-config';
import { createDemoModelClient } from './demo-model-client';
import { DEMO_SCRIPTS } from './demo-scripts';
import { validateDemoScripts } from './demo-script.types';
import { createDemoToolRegistry, demoToolProvenance } from './demo-tools';

/**
 * The conformance suite: every shipped script, both branches, through the real loop.
 *
 * "Every frame validates against the SDK's schemas" is the requirement that makes
 * demo mode worth having — a demo emitting frames the real client rejects would fail
 * on stage, in front of the audience it exists for, and nowhere earlier. So this
 * drives `runAgent` with the demo model client and the demo registry, plays each
 * script to completion the way the browser does (including resuming interrupts), and
 * parses every event with `EventSchemas`.
 */

type Recorded = BaseEvent & Record<string, unknown>;

const SPEED = 5000;

/** Nuxeo answers used by the real tools the scripts call. */
function nuxeoDouble() {
  return recordingFetch((request) => {
    if (request.url.includes('/search/lang/NXQL/execute')) {
      return jsonResponse({
        totalSize: 2,
        entries: [
          {
            uid: 'uid-newest',
            title: 'Newest document',
            type: 'File',
            path: '/default-domain/newest',
            properties: { 'dc:description': 'A description' },
          },
          { uid: 'uid-second', title: 'Second document', type: 'File' },
        ],
      });
    }
    if (request.url.includes('/api/v1/id/')) {
      return jsonResponse({ uid: 'uid-newest', title: 'Newest document', properties: {} });
    }
    if (request.url.includes('/automation/Collection.Create')) {
      return jsonResponse({ uid: 'uid-collection', title: 'Agent demo — recent documents' });
    }
    if (request.url.includes('/automation/Audit.QueryWithPageProvider')) {
      return jsonResponse({ entries: [{ eventId: 'documentModified', principalName: 'jdoe' }] });
    }
    return jsonResponse({});
  });
}

interface Exchange {
  readonly events: Recorded[];
  readonly requests: readonly { readonly url: string; readonly headers: Record<string, string> }[];
}

/**
 * Plays a prompt to completion, resuming interrupts the way the browser does.
 *
 * This is deliberately a re-implementation of the client's side of the contract
 * rather than a shortcut through the demo client: if the gateway's interrupt and the
 * resumption it expects ever stop lining up, this is where it shows.
 */
async function play(prompt: string, options: { approve?: boolean } = {}): Promise<Exchange> {
  const recorder = nuxeoDouble();
  const deps = {
    config: loadDemoConfig({
      NUXEO_BASE_URL: TEST_NUXEO_BASE_URL,
      AGENT_DEMO_MODE: 'scripted',
      AGENT_DEMO_SPEED: String(SPEED),
    }),
    model: createDemoModelClient({
      scripts: DEMO_SCRIPTS,
      speed: SPEED,
      logger: testLogger(),
    }),
    registry: createDemoToolRegistry(),
    nuxeo: new NuxeoRestClient(TEST_NUXEO_BASE_URL, recorder.fetchImpl),
    logger: testLogger(),
  };

  const messages: Message[] = [{ id: 'm1', role: 'user', content: prompt } as Message];
  const events: Recorded[] = [];
  let resume: ResumeEntry[] = [];
  // Bounded so a script that fails to terminate fails the test instead of hanging.
  for (let exchange = 0; exchange < 6; exchange += 1) {
    const collected: Recorded[] = [];
    const input = {
      threadId: 'thread-demo',
      runId: `run-${exchange}`,
      messages,
      tools: FRONTEND_TOOL_NAMES.map((name) => ({
        name,
        description: name,
        parameters: { type: 'object', properties: {} },
      })),
      context: [],
      ...(resume.length > 0 ? { resume } : {}),
    } as unknown as RunAgentInput;

    await runAgent(deps, {
      input,
      caller: testCaller(),
      emit: (event) => {
        collected.push(event);
        return true;
      },
      signal: new AbortController().signal,
    });
    events.push(...collected);

    const finished = collected.find((event) => event.type === EventType.RUN_FINISHED);
    const outcome = finished?.['outcome'] as
      | { type: string; interrupts?: { id: string; metadata?: Record<string, unknown> }[] }
      | undefined;
    if (outcome?.type !== 'interrupt') break;

    // What `AgentRuntimeService` does, and the two answer shapes are not
    // interchangeable. A frontend tool runs in the browser, so its interrupt is
    // answered by a `role: "tool"` message carrying the result. A server-enforced
    // mutation approval runs nothing in the browser — `answerWithoutToolCall`
    // deliberately appends no tool message, because that would invent a result for
    // a call the gateway has not made yet. Its verdict travels in `resume` alone,
    // and the gateway executes the call itself on this next request.
    resume = [];
    for (const interrupt of outcome.interrupts ?? []) {
      const approved = options.approve === true;
      const metadata = interrupt.metadata ?? {};
      messages.push({
        id: `a-${exchange}-${interrupt.id}`,
        role: 'assistant',
        content: '',
        toolCalls: [
          {
            id: interrupt.id,
            type: 'function',
            function: {
              name: String(metadata['toolName'] ?? ''),
              arguments: JSON.stringify(metadata['args'] ?? {}),
            },
          },
        ],
      } as Message);

      if (metadata['kind'] === MUTATION_APPROVAL_INTERRUPT_KIND) {
        resume.push(
          approved
            ? { interruptId: interrupt.id, status: 'resolved', payload: { approved: true } }
            : { interruptId: interrupt.id, status: 'cancelled' },
        );
        continue;
      }
      messages.push({
        id: `t-${exchange}-${interrupt.id}`,
        role: 'tool',
        toolCallId: interrupt.id,
        content: JSON.stringify({ approved }),
      } as Message);
    }
  }

  return { events, requests: recorder.requests };
}

const types = (events: Recorded[]): string[] => events.map((event) => String(event.type));

function customNamed(events: Recorded[], name: string): Recorded[] {
  return events.filter((event) => event.type === EventType.CUSTOM && event['name'] === name);
}

describe('shipped demo scripts', () => {
  // The startup check, run again here so a bad script fails CI and not only the
  // process that would have served it.
  it('all declare their data provenance consistently with the demo registry', () => {
    expect(() => validateDemoScripts(DEMO_SCRIPTS, demoToolProvenance)).not.toThrow();
  });

  it('have unique ids and non-empty prompts, triggers and rationales', () => {
    expect(new Set(DEMO_SCRIPTS.map((script) => script.id)).size).toBe(DEMO_SCRIPTS.length);
    for (const script of DEMO_SCRIPTS) {
      expect(script.prompt.trim(), script.id).not.toBe('');
      expect(script.demonstrates.trim(), script.id).not.toBe('');
    }
  });

  // The beats the runbook promises. If one of these disappears, the runbook is
  // making a claim the gateway cannot keep.
  it('cover streaming, a multi-step plan, an approval, citations and a slow run', () => {
    expect(DEMO_SCRIPTS.map((script) => script.id)).toEqual([
      'recent-activity',
      'document-overview',
      'collection-approval',
      'grounded-answer',
      'long-audit-review',
    ]);
  });
});

describe.each(DEMO_SCRIPTS.map((script) => [script.id, script.prompt] as const))(
  'replaying %s',
  (id, prompt) => {
    it('emits only frames the SDK accepts', async () => {
      const { events } = await play(prompt, { approve: true });
      expect(events.length).toBeGreaterThan(0);
      for (const event of events) {
        const parsed = EventSchemas.safeParse(event);
        expect(parsed.success, `${id}: ${JSON.stringify(event)}`).toBe(true);
      }
    });

    // Schemas are not the whole contract: the client also expands the chunk events
    // into start/content/end triples, and that state machine throws on orderings
    // every individual frame validates fine. Run the whole transcript through it.
    it('survives the client\u2019s own chunk state machine', async () => {
      const { events } = await play(prompt, { approve: true });
      const expanded = await throughClientChunkTransform(events);
      expect(expanded.length, id).toBeGreaterThan(events.length);
    });

    it('opens with RUN_STARTED and ends with exactly one terminal event', async () => {
      const { events } = await play(prompt, { approve: true });
      const terminal = events.filter(
        (event) => event.type === EventType.RUN_FINISHED || event.type === EventType.RUN_ERROR,
      );
      expect(types(events)[0]).toBe(EventType.RUN_STARTED);
      // One per exchange; the last one ends the conversation.
      expect(terminal.length).toBeGreaterThanOrEqual(1);
      expect(events.at(-1)?.type).toBe(EventType.RUN_FINISHED);
      expect(events.some((event) => event.type === EventType.RUN_ERROR)).toBe(false);
    });

    // ADR 001 rule 1: only the opening chunk of a text message carries a messageId.
    it('carries a messageId on the first chunk of each text segment and not on the rest', async () => {
      const { events } = await play(prompt, { approve: true });
      const chunks = events.filter((event) => event.type === EventType.TEXT_MESSAGE_CHUNK);
      expect(chunks.length).toBeGreaterThan(0);
      expect(chunks[0]).toMatchObject({ role: 'assistant' });
      expect(chunks[0]?.['messageId']).toBeTypeOf('string');

      const ids = new Set<string>();
      for (const chunk of chunks) {
        const messageId = chunk['messageId'];
        if (messageId === undefined) continue;
        expect(ids.has(String(messageId))).toBe(false);
        ids.add(String(messageId));
      }
    });

    // ADR 001 rule 2: the opening TOOL_CALL_CHUNK carries id and name; later chunks
    // of the same call carry neither.
    it('opens every tool call with an id and a name before any argument delta', async () => {
      const { events } = await play(prompt, { approve: true });
      const opened = new Set<string>();
      for (const event of events) {
        if (event.type !== EventType.TOOL_CALL_CHUNK) continue;
        const toolCallId = String(event['toolCallId']);
        if (event['toolCallName'] !== undefined) {
          opened.add(toolCallId);
          expect(event['delta']).toBeUndefined();
        } else {
          expect(opened.has(toolCallId)).toBe(true);
        }
      }
    });

    it('never reaches Nuxeo without the caller session', async () => {
      const { requests } = await play(prompt, { approve: true });
      for (const request of requests) {
        expect(request.headers['cookie'], request.url).toBe(TEST_SESSION_COOKIE);
      }
    });

    it('answers every tool call it makes', async () => {
      const { events } = await play(prompt, { approve: true });
      const called = new Set(
        events
          .filter(
            (event) =>
              event.type === EventType.TOOL_CALL_CHUNK && event['toolCallName'] !== undefined,
          )
          .map((event) => String(event['toolCallId'])),
      );
      const answered = new Set(
        events
          .filter((event) => event.type === EventType.TOOL_CALL_RESULT)
          .map((event) => String(event['toolCallId'])),
      );
      const interrupted = new Set(
        events.flatMap((event) => {
          const outcome = event['outcome'] as
            | { type?: string; interrupts?: { id: string }[] }
            | undefined;
          return outcome?.type === 'interrupt'
            ? (outcome.interrupts ?? []).map((interrupt) => interrupt.id)
            : [];
        }),
      );
      for (const id of called) {
        expect(answered.has(id) || interrupted.has(id), id).toBe(true);
      }
    });
  },
);

describe('beat 1 — streaming and a real search', () => {
  it('streams text in several chunks and runs the NXQL search against Nuxeo', async () => {
    const { events, requests } = await play('What has changed in this repository recently?');
    expect(
      events.filter((event) => event.type === EventType.TEXT_MESSAGE_CHUNK).length,
    ).toBeGreaterThan(4);
    expect(requests.some((request) => request.url.includes('/search/lang/NXQL/execute'))).toBe(
      true,
    );
    expect(customNamed(events, THINKING_EVENT_NAME).length).toBeGreaterThan(0);
  });
});

describe('beat 2 — a multi-step plan', () => {
  it('reads a document by a uid discovered from the live search result', async () => {
    const { events, requests } = await play(
      'Give me an overview of the most recently modified document.',
    );
    // Not a uid from the script: the search double returned it a moment earlier.
    expect(requests.some((request) => request.url.includes('/api/v1/id/uid-newest'))).toBe(true);

    const names = events
      .filter((event) => event.type === EventType.TOOL_CALL_CHUNK && event['toolCallName'])
      .map((event) => String(event['toolCallName']));
    expect(names).toEqual(['nuxeo.searchDocuments', 'nuxeo.getDocument', 'ai.summarizeDocument']);
  });

  it('labels the summary as a placeholder rather than inventing one', async () => {
    const { events } = await play('Give me an overview of the most recently modified document.');
    const summary = events.find(
      (event) =>
        event.type === EventType.TOOL_CALL_RESULT &&
        event['toolCallId'] === 'demo_overview_summary',
    );
    expect(String(summary?.['content'])).toContain('PLACEHOLDER');
  });
});

describe('beat 3 — human approval', () => {
  // The card is raised by the gateway because the tool is mutating, not because
  // the script asked for one. That is the whole beat: no step in this transcript
  // requests confirmation, and the write still cannot happen without it.
  it('interrupts on the write itself, with the real tool name and arguments', async () => {
    const { events } = await play('Put those documents into a new collection for me.');
    const interrupt = events
      .map((event) => event['outcome'])
      .find(
        (outcome): outcome is { type: 'interrupt'; interrupts: Record<string, unknown>[] } =>
          (outcome as { type?: string } | undefined)?.type === 'interrupt',
      );
    expect(interrupt?.interrupts[0]).toMatchObject({
      id: 'demo_create_collection',
      reason: 'nuxeo.createCollection',
      toolCallId: 'demo_create_collection',
      metadata: {
        kind: MUTATION_APPROVAL_INTERRUPT_KIND,
        toolName: 'nuxeo.createCollection',
        args: { name: 'Agent demo — recent documents' },
      },
    });
    // `message` is what the approval card shows; a protocol constant is useless there.
    expect(String(interrupt?.interrupts[0]?.['message'])).toContain('changes content in Nuxeo');
  });

  it('does not ask the model to raise the card for it', async () => {
    const script = DEMO_SCRIPTS.find((entry) => entry.id === 'collection-approval');
    const called = (script?.turns ?? []).map((turn) => turn.toolCall?.name).filter(Boolean);
    expect(called).not.toContain('confirmAction');
  });

  it('writes to Nuxeo only after the approval', async () => {
    const declined = await play('Put those documents into a new collection for me.', {
      approve: false,
    });
    expect(declined.requests.some((request) => request.url.includes('Collection.Create'))).toBe(
      false,
    );

    const approved = await play('Put those documents into a new collection for me.', {
      approve: true,
    });
    expect(approved.requests.some((request) => request.url.includes('Collection.Create'))).toBe(
      true,
    );
  });

  it('says plainly that nothing was written when declined', async () => {
    const { events } = await play('Put those documents into a new collection for me.', {
      approve: false,
    });
    const text = events
      .filter((event) => event.type === EventType.TEXT_MESSAGE_CHUNK)
      .map((event) => String(event['delta']))
      .join('');
    expect(text).toContain('have not created anything');
  });
});

describe('beat 4 — grounded citations', () => {
  it('emits citations on their own CUSTOM event, attached to a real text segment', async () => {
    const { events } = await play('Answer from the repository and cite your sources.');
    const citations = customNamed(events, CITATIONS_EVENT_NAME);
    expect(citations).toHaveLength(1);

    const value = citations[0]?.['value'] as {
      messageId: string;
      citations: { uid: string; title: string }[];
    };
    expect(value.citations.map((citation) => citation.uid)).toEqual(['uid-newest', 'uid-second']);

    // The citations event must name a message the client has actually opened, or the
    // sources strip attaches to nothing.
    const openedIds = events
      .filter((event) => event.type === EventType.TEXT_MESSAGE_CHUNK && event['messageId'])
      .map((event) => String(event['messageId']));
    expect(openedIds).toContain(value.messageId);
  });
});

describe('beat 5 — a run slow enough to cancel', () => {
  it('is the longest script by scripted delay, so there is time to press Stop', async () => {
    const script = DEMO_SCRIPTS.find((entry) => entry.id === 'long-audit-review');
    const pauses = (script?.turns ?? []).reduce((total, turn) => total + (turn.pauseMs ?? 0), 0);
    expect(pauses).toBeGreaterThanOrEqual(2000);
    const thinkingSteps = (script?.turns ?? []).reduce(
      (total, turn) => total + (turn.thinking?.length ?? 0),
      0,
    );
    expect(thinkingSteps).toBeGreaterThanOrEqual(4);
  });

  // ADR 001: a cancelled run emits no terminal event; the socket just closes.
  it('emits no terminal event when the run is cancelled mid-stream', async () => {
    const recorder = nuxeoDouble();
    const controller = new AbortController();
    const events: Recorded[] = [];

    await runAgent(
      {
        config: loadDemoConfig({
          NUXEO_BASE_URL: TEST_NUXEO_BASE_URL,
          AGENT_DEMO_MODE: 'scripted',
        }),
        model: createDemoModelClient({ scripts: DEMO_SCRIPTS, speed: 1, logger: testLogger() }),
        registry: createDemoToolRegistry(),
        nuxeo: new NuxeoRestClient(TEST_NUXEO_BASE_URL, recorder.fetchImpl),
        logger: testLogger(),
      },
      {
        input: {
          threadId: 't',
          runId: 'r',
          messages: [
            {
              id: 'm1',
              role: 'user',
              content: 'Run an access review over the repository audit trail.',
            },
          ],
          tools: [],
          context: [],
        } as unknown as RunAgentInput,
        caller: testCaller(),
        emit: (event) => {
          events.push(event);
          // Cancel as soon as the run is visibly under way.
          if (event.type === EventType.CUSTOM) controller.abort();
          return true;
        },
        signal: controller.signal,
      },
    );

    expect(types(events)).toContain(EventType.RUN_STARTED);
    expect(events.some((event) => event.type === EventType.RUN_FINISHED)).toBe(false);
    expect(events.some((event) => event.type === EventType.RUN_ERROR)).toBe(false);
  });
});

describe('an unrecognised prompt', () => {
  it('lists the scripts it does have instead of improvising an answer', async () => {
    const { events, requests } = await play('what is the capital of France?');
    const text = events
      .filter((event) => event.type === EventType.TEXT_MESSAGE_CHUNK)
      .map((event) => String(event['delta']))
      .join('');
    expect(text).toContain('scripted demo mode');
    expect(text).toContain(DEMO_SCRIPTS[0]?.prompt ?? '');
    expect(requests).toHaveLength(0);
    expect(events.at(-1)).toMatchObject({ outcome: { type: 'success' } });
  });
});
