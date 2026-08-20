import {
  EventType,
  type BaseEvent,
  type Message,
  type RunAgentInput,
  type Tool,
} from '@ag-ui/core';
import { describe, expect, it } from 'vitest';

import { NuxeoRestClient } from '../nuxeo/nuxeo-rest-client';
import {
  jsonResponse,
  recordingFetch,
  ScriptedModelClient,
  testCaller,
  testConfig,
  testLogger,
  TEST_NUXEO_BASE_URL,
  TEST_SESSION_COOKIE,
  type RecordedRequest,
} from '../testing/test-doubles';
import { createDefaultToolRegistry, DEFAULT_TOOLS } from '../tools/default-registry';
import { requiresApproval } from '../tools/mutation-policy';
import type { ModelStreamEvent } from './model-client';
import { runAgent } from './run-agent';

/**
 * ADR 001: "whatever preconditions the UI path enforces MUST be evaluated before an
 * approval interrupt is raised, so we never ask a user to approve a write that cannot
 * succeed."
 *
 * The assertions here are on **the HTTP requests that actually left the process**, the way
 * `identity-propagation.spec.ts` established and `approval-gate.spec.ts` continued, because
 * every other vantage point passes against the broken build. A gateway that raises a card
 * for a legally-held record emits a perfectly well-formed run; a gateway that resolves a
 * title with a service account returns a perfectly plausible title. Only "which requests
 * left, carrying whose credential" tells them apart.
 */

type Recorded = BaseEvent & Record<string, unknown>;

const TAG_DOCUMENT = 'nuxeo.tagDocument';
const ADD_TO_COLLECTION = 'nuxeo.addToCollection';

interface CallSpec {
  readonly id: string;
  readonly name: string;
  readonly args: string;
}

interface Exchange {
  readonly events: Recorded[];
  readonly requests: readonly RecordedRequest[];
}

function toolCallTurn(calls: readonly CallSpec[]): ModelStreamEvent[] {
  return [
    ...calls.flatMap((call, index): ModelStreamEvent[] => [
      { type: 'tool-call-start', index, id: call.id, name: call.name },
      { type: 'tool-call-delta', index, delta: call.args },
    ]),
    { type: 'finish', reason: 'tool_calls' },
  ];
}

/** A document entity shaped like Nuxeo's, with only the facts the rules read. */
function document(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    'entity-type': 'document',
    uid: 'doc-1',
    title: 'Records retention policy 2026',
    type: 'File',
    path: '/default-domain/workspaces/beta-demo/retention-policy',
    isVersion: false,
    isUnderRetentionOrLegalHold: false,
    contextParameters: { permissions: ['Read', 'Write', 'WriteProperties', 'AddChildren'] },
    ...overrides,
  };
}

interface Scenario {
  readonly calls: readonly CallSpec[];
  /** Response for a document read, by uid. `null` makes the read fail with a 403. */
  readonly documents?: Readonly<Record<string, Record<string, unknown> | null>>;
}

/** One `POST /agent/run` against the shipped registry and a recording Nuxeo. */
async function run(scenario: Scenario): Promise<Exchange> {
  const recorder = recordingFetch((request) => {
    const match = /\/nuxeo\/api\/v1\/id\/([^/?]+)$/.exec(new URL(request.url).pathname);
    if (request.method === 'GET' && match) {
      const entity = scenario.documents?.[decodeURIComponent(match[1] ?? '')];
      if (entity === undefined) return jsonResponse(document({ uid: match[1] }));
      return entity === null ? jsonResponse({ message: 'forbidden' }, 403) : jsonResponse(entity);
    }
    return jsonResponse({ uid: 'written' });
  });
  const events: Recorded[] = [];

  await runAgent(
    {
      config: testConfig(),
      model: new ScriptedModelClient([
        toolCallTurn(scenario.calls),
        [
          { type: 'text', delta: 'Done.' },
          { type: 'finish', reason: 'stop' },
        ],
      ]),
      registry: createDefaultToolRegistry(),
      nuxeo: new NuxeoRestClient(TEST_NUXEO_BASE_URL, recorder.fetchImpl),
      logger: testLogger(),
    },
    {
      input: {
        threadId: 'thread-1',
        runId: 'run-1',
        messages: [{ id: 'm1', role: 'user', content: 'tidy these up' } as Message],
        tools: [] as Tool[],
        context: [],
      } as RunAgentInput,
      caller: testCaller(),
      emit: (event) => {
        events.push(event);
        return true;
      },
      signal: new AbortController().signal,
    },
  );

  return { events, requests: recorder.requests };
}

function interruptsOf(events: Recorded[]): Record<string, unknown>[] {
  const outcome = events.at(-1)?.['outcome'] as
    | { type?: string; interrupts?: Record<string, unknown>[] }
    | undefined;
  return outcome?.type === 'interrupt' ? (outcome.interrupts ?? []) : [];
}

function metadataOf(events: Recorded[], index = 0): Record<string, unknown> {
  return (interruptsOf(events)[index]?.['metadata'] ?? {}) as Record<string, unknown>;
}

function toolResults(events: Recorded[]): Record<string, unknown>[] {
  return events
    .filter((event) => event.type === EventType.TOOL_CALL_RESULT)
    .map((event) => JSON.parse(String(event['content'])) as Record<string, unknown>);
}

/** Anything that is not a plain read. Preflight reads; nothing else may. */
function writes(requests: readonly RecordedRequest[]): readonly RecordedRequest[] {
  return requests.filter((request) => request.method !== 'GET');
}

function reads(requests: readonly RecordedRequest[]): readonly RecordedRequest[] {
  return requests.filter((request) => request.method === 'GET');
}

const tagCall: CallSpec = {
  id: 'call-1',
  name: TAG_DOCUMENT,
  args: '{"uid":"doc-1","tags":["retention"]}',
};

describe('a write names its targets before anybody is asked to approve it', () => {
  it('puts the title Nuxeo returned on the interrupt, against the uid the write carries', async () => {
    const { events } = await run({ calls: [tagCall] });

    expect(metadataOf(events)).toMatchObject({
      kind: 'mutation_approval',
      toolName: TAG_DOCUMENT,
      args: { uid: 'doc-1', tags: ['retention'] },
      targets: [
        {
          uid: 'doc-1',
          title: 'Records retention policy 2026',
          type: 'File',
          path: '/default-domain/workspaces/beta-demo/retention-policy',
        },
      ],
    });
  });

  // The whole reason this moved off the browser is that the gateway already holds the
  // caller's forwarded credentials. Resolving with anything else would return titles for
  // documents the user cannot see — silently, with no error and no audit signal.
  it('resolves the title as the caller, never as a service account', async () => {
    const { requests } = await run({ calls: [tagCall] });

    const lookups = reads(requests).filter((request) => request.url.includes('/id/doc-1'));
    expect(lookups).toHaveLength(1);
    expect(lookups[0]?.headers['cookie']).toBe(TEST_SESSION_COOKIE);
    expect(lookups[0]?.headers['authorization']).toBeUndefined();
    expect(new URL(lookups[0]?.url ?? '').origin).toBe(TEST_NUXEO_BASE_URL);
  });

  // Omit rather than guess. A title the gateway invented, or one carried over from the
  // model's arguments, is worse than a uid: the row exists so the user knows what they are
  // consenting to, and the panel already renders a bare uid correctly.
  it('omits the target when the lookup fails, rather than raising or guessing', async () => {
    const { events } = await run({ calls: [tagCall], documents: { 'doc-1': null } });

    const metadata = metadataOf(events);
    expect(metadata['targets']).toBeUndefined();
    // The decision is still put to the user: an unreadable document is not a refusal.
    expect(interruptsOf(events).map((interrupt) => interrupt['id'])).toEqual(['call-1']);
    expect(metadata['args']).toEqual({ uid: 'doc-1', tags: ['retention'] });
  });

  it('keeps the targets it could resolve when only one of several fails', async () => {
    const { events } = await run({
      calls: [
        {
          id: 'call-1',
          name: ADD_TO_COLLECTION,
          args: '{"uid":"doc-1","collectionUid":"col-1"}',
        },
      ],
      documents: { 'col-1': null },
    });

    expect(metadataOf(events)['targets']).toEqual([
      expect.objectContaining({ uid: 'doc-1', title: 'Records retention policy 2026' }),
    ]);
  });

  it('reads each document once however many writes name it', async () => {
    const { requests } = await run({
      calls: [
        { id: 'call-1', name: ADD_TO_COLLECTION, args: '{"uid":"d1","collectionUid":"col-1"}' },
        { id: 'call-2', name: ADD_TO_COLLECTION, args: '{"uid":"d2","collectionUid":"col-1"}' },
        { id: 'call-3', name: ADD_TO_COLLECTION, args: '{"uid":"d3","collectionUid":"col-1"}' },
      ],
    });

    const collectionReads = reads(requests).filter((request) => request.url.includes('/id/col-1'));
    expect(collectionReads).toHaveLength(1);
    expect(reads(requests)).toHaveLength(4);
  });

  it('reads nothing at all for a write that names no document', async () => {
    const { requests } = await run({
      calls: [{ id: 'call-1', name: 'nuxeo.createCollection', args: '{"name":"Contracts"}' }],
    });

    expect(requests).toEqual([]);
  });

  // The verb comes from the tool's own registration, so it and the code that runs cannot
  // drift. It used to come from a table in the browser keyed on tool name.
  it('carries the tool’s own phrasing, not a name the client has to interpret', async () => {
    const { events } = await run({ calls: [tagCall] });

    expect(metadataOf(events)['action']).toEqual({
      action: 'Add tags to',
      subject: { arg: 'uid', changed: true, permissions: ['Write', 'WriteProperties'] },
    });
  });
});

describe('a write that cannot succeed is never put to the user', () => {
  const cases = [
    {
      what: 'a document under retention or legal hold',
      entity: document({ isUnderRetentionOrLegalHold: true }),
      code: 'legal_hold',
    },
    {
      what: 'an archived version',
      entity: document({ isVersion: true }),
      code: 'immutable_version',
    },
    {
      what: 'a document the caller may not write',
      entity: document({ contextParameters: { permissions: ['Read', 'Browse'] } }),
      code: 'permission_denied',
    },
  ] as const;

  it.each(cases)('raises no interrupt for $what', async ({ entity }) => {
    const { events } = await run({ calls: [tagCall], documents: { 'doc-1': entity } });

    expect(interruptsOf(events)).toEqual([]);
  });

  it.each(cases)('writes nothing to Nuxeo for $what', async ({ entity }) => {
    const { requests } = await run({ calls: [tagCall], documents: { 'doc-1': entity } });

    expect(writes(requests)).toEqual([]);
  });

  it.each(cases)(
    'tells the model it was refused rather than declined, for $what',
    async ({ entity, code }) => {
      const { events } = await run({ calls: [tagCall], documents: { 'doc-1': entity } });

      // The distinction the model acts on. A decline is a person saying no and invites
      // "what would you prefer"; a refusal is a fact about the document, and treating it
      // as a decline tells the user they made a choice they never made.
      expect(toolResults(events)[0]).toMatchObject({
        status: 'refused',
        approved: false,
        decidedBy: 'gateway',
        code,
        uid: 'doc-1',
      });
      expect(toolResults(events)[0]?.['status']).not.toBe('declined');
    },
  );

  // The run must not end on an interrupt nobody can answer: with no card open the loop
  // carries on so the model can explain the constraint.
  it('lets the run finish so the model can say why, instead of stalling on an interrupt', async () => {
    const { events } = await run({
      calls: [tagCall],
      documents: { 'doc-1': document({ isUnderRetentionOrLegalHold: true }) },
    });

    expect(events.at(-1)).toMatchObject({
      type: EventType.RUN_FINISHED,
      outcome: { type: 'success' },
    });
  });

  it('still asks about the writes that passed, in a turn where one did not', async () => {
    const { events, requests } = await run({
      calls: [tagCall, { id: 'call-2', name: TAG_DOCUMENT, args: '{"uid":"doc-2","tags":["ok"]}' }],
      documents: { 'doc-1': document({ isUnderRetentionOrLegalHold: true }) },
    });

    expect(interruptsOf(events).map((interrupt) => interrupt['id'])).toEqual(['call-2']);
    expect(writes(requests)).toEqual([]);
    expect(toolResults(events)[0]).toMatchObject({ status: 'refused', code: 'legal_hold' });
  });

  // A refused call is answered by a tool message, so `pendingMutations` on the next
  // request no longer sees it as pending. There is therefore no id for a later approval
  // to be spent against, even one a broken client sends.
  it('leaves no pending call an approval could later be spent on', async () => {
    const { events } = await run({
      calls: [tagCall],
      documents: { 'doc-1': document({ isUnderRetentionOrLegalHold: true }) },
    });

    const answered = events
      .filter((event) => event.type === EventType.TOOL_CALL_RESULT)
      .map((event) => event['toolCallId']);
    expect(answered).toContain('call-1');
  });
});

describe('preconditions the gateway deliberately does not evaluate', () => {
  // An unanswered enricher is "we do not know", not "no permissions". Reading it the
  // other way would refuse every write on any deployment whose enricher is disabled.
  it('does not refuse when the permissions enricher returns nothing', async () => {
    const { events } = await run({
      calls: [tagCall],
      documents: { 'doc-1': document({ contextParameters: {} }) },
    });

    expect(interruptsOf(events).map((interrupt) => interrupt['id'])).toEqual(['call-1']);
  });

  // The selection is an NXQL query. Checking it would mean running it and reading every
  // match before the user has agreed to anything.
  it('reads nothing for a bulk update over a query', async () => {
    const { requests } = await run({
      calls: [
        {
          id: 'call-1',
          name: 'nuxeo.bulkUpdateMetadata',
          args: '{"query":"SELECT * FROM Document","properties":{"dc:nature":"contract"}}',
        },
      ],
    });

    expect(requests).toEqual([]);
  });
});

describe('the shipped tool set declares what its writes do', () => {
  // Without this, deleting a declaration silently reverts that tool to the gateway's
  // boilerplate sentence and to no preconditions at all — a regression with no symptom
  // until someone reads an approval card and finds it says nothing.
  it('gives every gated tool a mutation declaration', () => {
    const undeclared = DEFAULT_TOOLS.filter(
      (tool) => requiresApproval(tool) && tool.mutation === undefined,
    );

    expect(undeclared.map((tool) => tool.name)).toEqual([]);
  });

  it('declares no mutation shape on a tool that only reads', () => {
    const declared = DEFAULT_TOOLS.filter(
      (tool) => !requiresApproval(tool) && tool.mutation !== undefined,
    );

    expect(declared.map((tool) => tool.name)).toEqual([]);
  });

  it('names an argument the tool actually accepts, in every declaration', () => {
    const dangling: string[] = [];
    for (const tool of DEFAULT_TOOLS) {
      const spec = tool.mutation;
      if (!spec) continue;
      const properties = Object.keys(tool.parameters.properties);
      for (const arg of [spec.subject?.arg, spec.value, spec.into?.arg]) {
        if (arg && !properties.includes(arg)) dangling.push(`${tool.name}.${arg}`);
      }
    }

    expect(dangling).toEqual([]);
  });
});
