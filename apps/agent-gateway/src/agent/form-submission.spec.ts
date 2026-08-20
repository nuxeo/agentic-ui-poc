import {
  EventType,
  type BaseEvent,
  type Message,
  type ResumeEntry,
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
import { createDefaultToolRegistry } from '../tools/default-registry';
import type { ModelStreamEvent } from './model-client';
import { runAgent } from './run-agent';

/**
 * A chat-rendered form answers an interrupt; it is not a second write path.
 *
 * The defect this file exists to catch is not a model bypassing the gate — that is
 * `approval-gate.spec.ts` — it is a **write that goes somewhere the user did not
 * look**. A submitted form is the one place in the design where a human authored
 * the values, and the temptation that follows is to trust the whole request
 * because they typed part of it. Three things stay model-authored even then: the
 * target document, the field set, and anything the form carries without showing.
 *
 * So every assertion here is on **the HTTP request that actually left the
 * process** — its URL, which is the target, and its body, which is the scope.
 * Asserting on the merged argument object, on an event, or on a returned flag
 * would pass against a gateway that merged correctly and then wrote somewhere
 * else. Only "this PUT went to this uid carrying exactly these properties" can
 * tell the two apart.
 */

type Recorded = BaseEvent & Record<string, unknown>;

const UPDATE_METADATA = 'nuxeo.updateMetadata';
const CREATE_COLLECTION = 'nuxeo.createCollection';
const TARGET_UID = 'doc-1';
const OTHER_UID = 'doc-victim';

interface CallSpec {
  readonly id: string;
  readonly name: string;
  readonly args: string;
}

interface Exchange {
  readonly events: Recorded[];
  readonly requests: readonly RecordedRequest[];
}

interface RunScript {
  /** Model turns. Defaults to a run that says nothing and calls nothing. */
  readonly turns?: ModelStreamEvent[][];
  readonly messages?: Message[];
  readonly resume?: ResumeEntry[];
  /** Document entities by uid; `null` makes the read fail with a 403. */
  readonly documents?: Readonly<Record<string, Record<string, unknown> | null>>;
  /**
   * HTTP status for the write itself, when it should fail.
   *
   * Separate from `documents`, which fails the *preflight read*. The two are
   * different events and were conflated for exactly as long as no test drove the
   * second: a failed read refuses before the user is asked, while a failed write
   * happens after they approved, on the resume run, with a submitted form behind
   * it. That second path is where the note claiming success was attached to an
   * error, so it needs its own lever.
   */
  readonly writeStatus?: number;
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

/** The assistant turn the client echoes back, and the only record of the held call. */
function assistantCall(call: CallSpec): Message {
  return {
    id: `a-${call.id}`,
    role: 'assistant',
    content: '',
    toolCalls: [
      { id: call.id, type: 'function', function: { name: call.name, arguments: call.args } },
    ],
  } as Message;
}

function document(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    'entity-type': 'document',
    uid: TARGET_UID,
    title: 'Records retention policy 2026',
    type: 'File',
    path: '/default-domain/workspaces/beta-demo/retention-policy',
    isVersion: false,
    isUnderRetentionOrLegalHold: false,
    contextParameters: { permissions: ['Read', 'Write', 'WriteProperties'] },
    properties: {
      'dc:title': 'Records retention policy 2026',
      'dc:description': 'The policy as it currently stands.',
      'dc:created': '2026-01-04T09:00:00.000Z',
      'dc:creator': 'jdoe',
      'dc:lastContributor': 'asmith',
    },
    ...overrides,
  };
}

async function run(script: RunScript): Promise<Exchange> {
  const recorder = recordingFetch((request) => {
    const match = /\/nuxeo\/api\/v1\/id\/([^/?]+)$/.exec(new URL(request.url).pathname);
    if (request.method === 'GET' && match) {
      const entity = script.documents?.[decodeURIComponent(match[1] ?? '')];
      if (entity === undefined) return jsonResponse(document({ uid: match[1] }));
      return entity === null ? jsonResponse({ message: 'forbidden' }, 403) : jsonResponse(entity);
    }
    if (script.writeStatus !== undefined) {
      return jsonResponse({ message: 'Nuxeo refused the write.' }, script.writeStatus);
    }
    return jsonResponse({ uid: 'written', title: 'Written' });
  });
  const events: Recorded[] = [];

  await runAgent(
    {
      config: testConfig(),
      model: new ScriptedModelClient(script.turns ?? [[{ type: 'finish', reason: 'stop' }]]),
      registry: createDefaultToolRegistry(),
      nuxeo: new NuxeoRestClient(TEST_NUXEO_BASE_URL, recorder.fetchImpl),
      logger: testLogger(),
    },
    {
      input: {
        threadId: 'thread-1',
        runId: 'run-1',
        messages: script.messages ?? [
          { id: 'm1', role: 'user', content: 'retitle this document' } as Message,
        ],
        tools: [] as Tool[],
        context: [],
        ...(script.resume ? { resume: script.resume } : {}),
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

/** Anything that is not a plain read. The preflight reads; nothing else may. */
function writes(requests: readonly RecordedRequest[]): readonly RecordedRequest[] {
  return requests.filter((request) => request.method !== 'GET');
}

/** The properties a metadata write actually carried to Nuxeo. */
function writtenProperties(requests: readonly RecordedRequest[]): Record<string, unknown> {
  const put = writes(requests)[0];
  const body = JSON.parse(String(put?.body ?? '{}')) as { properties?: Record<string, unknown> };
  return body.properties ?? {};
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

interface RenderedForm {
  readonly component: string;
  readonly props: {
    readonly toolCallId: string;
    readonly target: Record<string, unknown>;
    readonly title: string;
    readonly submitLabel: string;
    readonly fields: readonly Record<string, unknown>[];
  };
}

function formOf(events: Recorded[], index = 0): RenderedForm | undefined {
  return metadataOf(events, index)['render'] as RenderedForm | undefined;
}

function toolResults(events: Recorded[]): Record<string, unknown>[] {
  return events
    .filter((event) => event.type === EventType.TOOL_CALL_RESULT)
    .map((event) => JSON.parse(String(event['content'])) as Record<string, unknown>);
}

/** The write the model proposed, which every submission below is answering. */
const updateCall: CallSpec = {
  id: 'call-1',
  name: UPDATE_METADATA,
  args: JSON.stringify({ uid: TARGET_UID, properties: { 'dc:title': 'Title the model chose' } }),
};

function submission(fields: unknown, interruptId = 'call-1'): ResumeEntry {
  return { interruptId, status: 'resolved', payload: { approved: true, fields } };
}

/** The second request of the conversation, carrying the user's answer. */
function answered(
  resume: ResumeEntry[],
  call: CallSpec = updateCall,
  extra: Pick<RunScript, 'writeStatus' | 'documents'> = {},
): Promise<Exchange> {
  return run({
    messages: [
      { id: 'm1', role: 'user', content: 'retitle this document' } as Message,
      assistantCall(call),
    ],
    resume,
    turns: [
      [
        { type: 'text', delta: 'Done.' },
        { type: 'finish', reason: 'stop' },
      ],
    ],
    ...extra,
  });
}

describe('the interrupt declares the form, from the tool’s own registration', () => {
  it('publishes the fields, their types, their values and which are editable', async () => {
    const { events } = await run({
      turns: [toolCallTurn([updateCall]), [{ type: 'finish', reason: 'stop' }]],
    });

    const form = formOf(events);
    expect(form?.component).toBe('documentMetadataForm');
    expect(form?.props.toolCallId).toBe('call-1');
    expect(form?.props.fields).toEqual([
      {
        name: 'dc:title',
        label: 'Title',
        type: 'text',
        editable: true,
        required: true,
        maxLength: 250,
        // The model proposed this one, so the form opens on its suggestion and
        // says where the suggestion came from.
        value: 'Title the model chose',
        source: 'proposed',
      },
      {
        name: 'dc:description',
        label: 'Description',
        type: 'multiline',
        editable: true,
        maxLength: 2000,
        value: 'The policy as it currently stands.',
        source: 'current',
      },
      {
        name: 'dc:created',
        label: 'Created',
        type: 'date',
        editable: false,
        value: '2026-01-04T09:00:00.000Z',
        source: 'current',
      },
      {
        name: 'dc:creator',
        label: 'Created by',
        type: 'text',
        editable: false,
        value: 'jdoe',
        source: 'current',
      },
      {
        name: 'dc:lastContributor',
        label: 'Last edited by',
        type: 'text',
        editable: false,
        value: 'asmith',
        source: 'current',
      },
    ]);
  });

  // ADR 001 makes this an obligation of the design rather than a nicety: a form
  // whose heading is a title the model supplied relocates the target problem
  // instead of solving it.
  it('names its target from the server’s own read, as the caller', async () => {
    const { events, requests } = await run({
      turns: [toolCallTurn([updateCall]), [{ type: 'finish', reason: 'stop' }]],
    });

    expect(formOf(events)?.props.target).toEqual({
      uid: TARGET_UID,
      title: 'Records retention policy 2026',
      type: 'File',
      path: '/default-domain/workspaces/beta-demo/retention-policy',
    });
    const lookups = requests.filter((request) => request.url.includes(`/id/${TARGET_UID}`));
    expect(lookups).toHaveLength(1);
    expect(lookups[0]?.headers['cookie']).toBe(TEST_SESSION_COOKIE);
  });

  it('shows the bare uid, and still offers the form, when the read fails', async () => {
    const { events } = await run({
      turns: [toolCallTurn([updateCall]), [{ type: 'finish', reason: 'stop' }]],
      documents: { [TARGET_UID]: null },
    });

    expect(formOf(events)?.props.target).toEqual({ uid: TARGET_UID });
    // No document read means no current values; the model's proposal survives
    // because the form displays it, and the rest render empty.
    expect(formOf(events)?.props.fields.map((field) => field['source'])).toEqual([
      'proposed',
      'empty',
      'empty',
      'empty',
      'empty',
    ]);
  });

  // The precondition rule is upstream of the form for the same reason it is
  // upstream of the card: a write that cannot succeed is never put to a person,
  // in either affordance.
  it('offers no form, and no interrupt, for a legally-held document', async () => {
    const { events, requests } = await run({
      turns: [toolCallTurn([updateCall]), [{ type: 'finish', reason: 'stop' }]],
      documents: { [TARGET_UID]: document({ isUnderRetentionOrLegalHold: true }) },
    });

    expect(interruptsOf(events)).toEqual([]);
    expect(writes(requests)).toEqual([]);
    expect(toolResults(events)[0]).toMatchObject({ status: 'refused', code: 'legal_hold' });
  });

  // Every other write keeps the card it had. The key is absent rather than empty,
  // so a client written before any of this renders exactly what it rendered
  // before.
  it('declares no form on a write whose tool declares none', async () => {
    const { events } = await run({
      turns: [
        toolCallTurn([{ id: 'call-1', name: CREATE_COLLECTION, args: '{"name":"Contracts"}' }]),
        [{ type: 'finish', reason: 'stop' }],
      ],
    });

    expect(metadataOf(events)['render']).toBeUndefined();
    expect(metadataOf(events)).toMatchObject({
      kind: 'mutation_approval',
      args: { name: 'Contracts' },
    });
  });
});

describe('the target comes from the interrupt, never from the submitted payload', () => {
  // The attack the rule exists for. A prompt-injected model renders a form that
  // looks like it edits the document under discussion; the payload carries
  // another uid; the user retitles something they never saw.
  it('writes to the interrupt’s document when the payload names a different one', async () => {
    const { requests } = await answered([
      submission({
        uid: OTHER_UID,
        docId: OTHER_UID,
        'ecm:uuid': OTHER_UID,
        'dc:title': 'Renamed by the form',
      }),
    ]);

    const put = writes(requests);
    expect(put).toHaveLength(1);
    expect(put[0]?.method).toBe('PUT');
    expect(new URL(put[0]?.url ?? '').pathname).toBe(`/nuxeo/api/v1/id/${TARGET_UID}`);
    // Not merely "the URL is right": the victim uid appears nowhere in the
    // request at all, so no argument of it survived the overlay.
    expect(String(put[0]?.body)).not.toContain(OTHER_UID);
    expect(writtenProperties(requests)).toEqual({ 'dc:title': 'Renamed by the form' });
  });

  it('carries the caller’s own session on the write it does make', async () => {
    const { requests } = await answered([submission({ 'dc:title': 'A new title' })]);

    expect(writes(requests)[0]?.headers['cookie']).toBe(TEST_SESSION_COOKIE);
  });
});

describe('the field set comes from the declaration, and nothing else is written', () => {
  it('drops a submitted field the form never declared', async () => {
    const { requests } = await answered([
      submission({ 'dc:title': 'A new title', 'dc:rights': 'Public domain' }),
    ]);

    expect(writtenProperties(requests)).toEqual({ 'dc:title': 'A new title' });
  });

  // Declared but display-only. The three context fields exist so the user can see
  // what they are editing; sending a value back for one is not an edit.
  it('drops a submitted field the form declared as display-only', async () => {
    const { requests } = await answered([
      submission({
        'dc:title': 'A new title',
        'dc:creator': 'attacker',
        'dc:created': '1999-01-01',
      }),
    ]);

    expect(writtenProperties(requests)).toEqual({ 'dc:title': 'A new title' });
  });

  // The hidden-field case, and the reason the executed arguments are rebuilt
  // rather than filtered. The model proposed a property the form never showed;
  // the user submitted a title; only the title may be written.
  it('drops a property the model proposed that the form never displayed', async () => {
    const call: CallSpec = {
      ...updateCall,
      args: JSON.stringify({
        uid: TARGET_UID,
        properties: { 'dc:title': 'Title the model chose', 'dc:rights': 'Model-authored rights' },
      }),
    };
    const { requests } = await answered([submission({ 'dc:title': 'A new title' })], call);

    expect(writtenProperties(requests)).toEqual({ 'dc:title': 'A new title' });
  });

  // The loop runs over the *declaration* and looks each declared name up in the
  // payload, rather than iterating what the payload happens to contain. So a key
  // like `__proto__` is never read, never copied, and cannot pollute the object
  // that is about to be serialised to Nuxeo.
  /**
   * The payload now answers `dc:title` legitimately, because leaving it out is a refusal
   * since the required-field hole was closed and a refusal writes nothing — which would
   * make this assert prototype safety vacuously. The subject is unchanged: the hostile
   * keys must be unreachable, and the write must carry exactly the declared fields.
   */
  it('ignores a payload that tries to reach through the prototype', async () => {
    const hostile = JSON.parse(
      '{"__proto__":{"dc:title":"Injected"},"constructor":{"x":1},' +
        '"dc:title":"Mine","dc:description":"Also mine"}',
    ) as Record<string, unknown>;
    const { requests } = await answered([submission(hostile)]);

    expect(writtenProperties(requests)).toEqual({
      // Only the two declared editable fields, both from the submission itself.
      // Nothing arrived through the prototype and `constructor` landed nowhere.
      'dc:title': 'Mine',
      'dc:description': 'Also mine',
    });
    expect(({} as Record<string, unknown>)['dc:title']).toBeUndefined();
  });

  /**
   * Re-pointed from `dc:description` to `dc:title` when the required-field hole was
   * closed, because `dc:title` is declared `required: true` and this property does not
   * apply to it — an unanswered required field is now a refusal, asserted directly two
   * tests below. The property itself is unchanged and still worth pinning: a declared
   * field the user left alone keeps what the interrupt held, so a form that edits one
   * value does not blank the others.
   */
  it('keeps the held value for an optional field the user did not submit', async () => {
    const { requests } = await answered([submission({ 'dc:title': 'Only this changed' })]);

    expect(writtenProperties(requests)).toEqual({
      'dc:title': 'Only this changed',
      // Held, not submitted. `updateMetadata` proposed no description, so the absence
      // here is the write not mentioning the property rather than a blanked field.
    });
  });

  /**
   * The invariant the fallback quietly broke.
   *
   * Before this, a submission that omitted a *required* editable field fell back to the
   * value the interrupt held — which is the model's. So a client could produce a write
   * carrying the model's title, reported to the model as user-authored, without the user
   * having typed it. It fails safe (nothing is written that the form did not display) and
   * it is unreachable from the shipped component, whose `submit()` always emits every
   * editable row — but "the user answered every field the form required" was an invariant
   * resting on one client behaving, not on the gateway checking.
   *
   * Refusing is the same shape of answer `checkValue` already gives a required field
   * answered with an empty string; the two cases differ only in whether the key is
   * present at all, which is not a difference the user can see.
   */
  it('refuses a submission that omits a required field, rather than using the model’s value', async () => {
    const { events, requests } = await answered([
      submission({ 'dc:description': 'Only this changed' }),
    ]);

    expect(writes(requests)).toEqual([]);
    expect(toolResults(events)[0]).toMatchObject({
      status: 'refused',
      approved: false,
      decidedBy: 'gateway',
      code: 'invalid_form_submission',
    });
  });

  it('names the required field it did not get, without echoing what was submitted', async () => {
    const { events } = await answered([
      submission({ 'dc:description': 'A distinctive string the user typed' }),
    ]);
    const result = toolResults(events)[0] ?? {};

    expect(String(result['reason'])).toContain('dc:title');
    // A rejected payload is the one payload not to echo back into the transcript.
    expect(JSON.stringify(result)).not.toContain('A distinctive string');
  });
});

/**
 * What the model is told about a write a person edited — the one thing stage 3's
 * live verification caught that no unit test had.
 *
 * `overlayFormSubmission` substitutes the user's values for the model's *inside
 * the gateway*, so the model never observes the substitution. It proposed some
 * arguments and the result comes back holding values it did not choose. Two
 * failures followed from exactly that gap, in sequence, and each was only visible
 * with a real model on the far end:
 *
 *  1. Given only the changed field *names*, the model reported the change using
 *     the one value it knew — its own proposal — and told the user their edit had
 *     been saved under the text they had just replaced. The write was right and
 *     the sentence describing it was wrong.
 *  2. Given the stored *values* too, it relayed the user's text correctly and then
 *     called it "a concurrent edit or a server-side override", offering to put its
 *     own proposal back.
 *
 * The second is why richer data was not enough on its own: **a value the model did
 * not choose is indistinguishable from a value something went wrong with, unless
 * something says who chose it.** Same lesson as the `refused`/`declined` split —
 * the model reacts to what it is told, so a result that omits who acted invites it
 * to treat a human decision as a fault.
 */
describe('a write the user edited in a form says so, and reports what was stored', () => {
  it('reports the values Nuxeo stored, not the ones the model proposed', async () => {
    const { events } = await answered([submission({ 'dc:title': 'What the user typed' })]);

    // `writtenProperties` already pins what was *sent*. This pins what the model
    // is told came *back*, which is the half that produced a false sentence.
    //
    // `null` rather than the submitted string, and that is the assertion: this
    // harness's PUT answers without a `properties` block, so there is no stored
    // value to report. Echoing the request here would have printed
    // `"What the user typed"` and looked right while proving the opposite — that
    // the field is read from the response is exactly the property under test.
    expect(toolResults(events)[0]).toMatchObject({
      updated: ['dc:title'],
      values: { 'dc:title': null },
    });
  });

  /**
   * Renamed from "reports the stored value when Nuxeo returns one", which is not what
   * it checks: this harness's PUT answers with no `properties` at all, so there is no
   * stored value here to report. The claim in the old name is tested against a PUT that
   * does answer with properties, in `nuxeo-tools.spec.ts`.
   *
   * What this pins is still worth pinning, and is the reason the key must exist even
   * when it is empty: `values` is built from the *response*, so a gateway that echoed
   * the request instead would also produce the key — and would print the submitted
   * string back, looking correct while proving the opposite.
   */
  it('always carries a values key, derived from the response rather than the request', async () => {
    const { events } = await answered([submission({ 'dc:title': 'What the user typed' })]);
    const result = toolResults(events)[0];

    expect(result).toHaveProperty('values');
    // Nulls, not the submitted text: this PUT returned no properties, and reporting
    // what was asked for as though it were what was stored is the defect.
    expect(result?.['values']).toEqual({ 'dc:title': null });
  });

  it('tells the model a person authored the values', async () => {
    const { events } = await answered([submission({ 'dc:title': 'What the user typed' })]);

    expect(toolResults(events)[0]).toMatchObject({
      submittedByUser: true,
      userAuthoredFields: ['dc:title'],
    });
  });

  it('tells the model not to offer to change them back', async () => {
    // The wording matters more than its presence: without it the model read the
    // user's own edit as a conflict and offered to overwrite it.
    const note = String(
      toolResults((await answered([submission({ 'dc:title': 'X' })])).events)[0]['note'],
    );

    expect(note).toContain('not an error');
    expect(note).toContain('do not offer to change it back');
  });

  it('says nothing of the kind when the same write is approved from the card', async () => {
    // An ordinary approval carries no submitted values, so nothing was authored by
    // the user beyond the decision itself. Claiming otherwise would tell the model
    // a person chose arguments the model wrote.
    const { events } = await run({
      messages: [
        { id: 'm1', role: 'user', content: 'retitle this document' } as Message,
        assistantCall(updateCall),
      ],
      resume: [{ interruptId: 'call-1', status: 'resolved', payload: { approved: true } }],
      turns: [
        [
          { type: 'text', delta: 'Done.' },
          { type: 'finish', reason: 'stop' },
        ],
      ],
    });

    expect(toolResults(events)[0]).not.toHaveProperty('submittedByUser');
  });

  it('names only the fields the submission actually set', async () => {
    // So the sentence the model writes can be specific about whose value is whose.
    // `dc:creator` is display-only and dropped, so it is not the user's either.
    const { events } = await answered([
      submission({ 'dc:title': 'A new title', 'dc:creator': 'attacker' }),
    ]);

    expect(toolResults(events)[0]['userAuthoredFields']).toEqual(['dc:title']);
  });
});

/**
 * The write was approved, the form was applied, and then Nuxeo said no.
 *
 * Every test above this drives the success path, and that is precisely why the defect
 * these cover was invisible: the note telling the model "that is the expected outcome,
 * not an error … report what was saved and do not offer to change it back" was attached
 * to *every* outcome, including one carrying a 403. This stage exists to stop the model
 * misdescribing a write, and on the failure path the note was the thing causing it — it
 * primed the model to report a change that never happened, contradicting the error
 * sitting beside it in the same payload.
 *
 * It also undid the `refused` / `declined` care from the other end. `formRejectedOutcome`
 * marks a gateway refusal `decidedBy: 'gateway'` so a person is never told they declined;
 * a Nuxeo-side 403 on the resume path got the success note instead, so a user blocked by
 * a legal hold could be told their edit had been saved.
 *
 * The split now: **attribution is unconditional, reassurance is not.** The model always
 * needs to know whose values these were — a failed write whose arguments it does not
 * recognise is exactly what produced the second live defect — but only a success may be
 * described as one.
 */
describe('a write the user authored in a form that then failed', () => {
  it('does not tell the model the change was made', async () => {
    const { events } = await answered(
      [submission({ 'dc:title': 'What the user typed' })],
      undefined,
      {
        writeStatus: 403,
      },
    );
    const result = toolResults(events)[0] ?? {};

    // The error is the outcome, and the note must not contradict it.
    expect(result).toHaveProperty('error');
    expect(String(result['note'])).not.toContain('report what was saved');
    expect(String(result['note'])).not.toContain('do not offer to change it back');
    expect(String(result['note'])).not.toContain('not an error');
  });

  it('says plainly that nothing was saved', async () => {
    const { events } = await answered(
      [submission({ 'dc:title': 'What the user typed' })],
      undefined,
      {
        writeStatus: 403,
      },
    );
    const note = String(toolResults(events)[0]?.['note']);

    expect(note).toContain('FAILED');
    expect(note).toContain('nothing was saved');
    expect(note).toContain('Do not report the change as made');
  });

  /**
   * Attribution survives the failure, and this is the half that is easy to lose while
   * fixing the other. Without it the model sees a failed call carrying values it never
   * chose, which is the situation that made it call the user's own edit "a concurrent
   * edit or a server-side override" — and on a failure it would have even less reason
   * to trust them.
   */
  it('still tells the model whose values those were', async () => {
    const { events } = await answered(
      [submission({ 'dc:title': 'What the user typed' })],
      undefined,
      {
        writeStatus: 403,
      },
    );

    expect(toolResults(events)[0]).toMatchObject({
      submittedByUser: true,
      userAuthoredFields: ['dc:title'],
    });
  });

  it('reports a server error the same way, since the user still did not decline', async () => {
    const { events } = await answered(
      [submission({ 'dc:title': 'What the user typed' })],
      undefined,
      {
        writeStatus: 500,
      },
    );
    const result = toolResults(events)[0] ?? {};

    expect(result).toHaveProperty('error');
    expect(String(result['note'])).toContain('nothing was saved');
    expect(result['submittedByUser']).toBe(true);
  });

  /**
   * The user's text must not come back in a failed result.
   *
   * A rejected or failed payload is the one payload not to echo into the transcript:
   * printing the submitted title beside an error is how a model comes to report it as
   * the document's current value. Field *names* are attribution; field *values* are not.
   */
  it('names the fields without echoing what was typed into them', async () => {
    const { events } = await answered(
      [submission({ 'dc:title': 'A distinctive string the user typed' })],
      undefined,
      { writeStatus: 403 },
    );

    expect(JSON.stringify(toolResults(events)[0])).not.toContain('A distinctive string');
  });
});

describe('a form answer for a write that declared no form is refused', () => {
  it('writes nothing and says the gateway refused it, not that the user declined', async () => {
    const createCall: CallSpec = {
      id: 'call-1',
      name: CREATE_COLLECTION,
      args: '{"name":"Contracts"}',
    };
    const { events, requests } = await answered(
      [submission({ name: 'Something else entirely' })],
      createCall,
    );

    expect(writes(requests)).toEqual([]);
    expect(toolResults(events)[0]).toMatchObject({
      status: 'refused',
      approved: false,
      decidedBy: 'gateway',
      code: 'form_not_declared',
    });
    expect(toolResults(events)[0]?.['status']).not.toBe('declined');
  });
});

describe('a malformed or hostile submission writes nothing', () => {
  const cases = [
    { what: 'a payload that is not a set of fields', fields: 'dc:title=Renamed' },
    { what: 'an array of values', fields: [['dc:title', 'Renamed']] },
    { what: 'a number where the field declared text', fields: { 'dc:title': 42 } },
    { what: 'an object where the field declared text', fields: { 'dc:title': { nested: true } } },
    { what: 'an empty value for a required field', fields: { 'dc:title': '   ' } },
    { what: 'null for a required field', fields: { 'dc:title': null } },
    { what: 'a value past the declared maximum', fields: { 'dc:title': 'x'.repeat(251) } },
  ] as const;

  it.each(cases)('refuses $what', async ({ fields }) => {
    const { events, requests } = await answered([submission(fields)]);

    expect(writes(requests)).toEqual([]);
    expect(toolResults(events)[0]).toMatchObject({
      status: 'refused',
      decidedBy: 'gateway',
      code: 'invalid_form_submission',
    });
  });

  // A rejected payload is exactly the payload not to echo back: the model reads
  // tool results, and a value it can read is a value it can repeat.
  it('does not carry the rejected value back into the transcript', async () => {
    const { events } = await answered([submission({ 'dc:title': 'x'.repeat(251) })]);

    expect(String(toolResults(events)[0]?.['reason'])).not.toContain('xxx');
  });

  // A declared field whose value fails is refused rather than dropped, which is
  // the opposite of an undeclared one. Dropping it would leave the user believing
  // a change they typed had been made.
  it('refuses the whole write rather than writing the fields that were valid', async () => {
    const { requests } = await answered([
      submission({ 'dc:description': 'Perfectly fine', 'dc:title': 42 }),
    ]);

    expect(writes(requests)).toEqual([]);
  });
});

describe('a form submission is still exactly one write, authorised once', () => {
  // Two writes in the batch, one form answered. The other is a decline, exactly
  // as it would be for two cards.
  it('authorises only the call it names when several are pending', async () => {
    const { events, requests } = await run({
      messages: [
        { id: 'm1', role: 'user', content: 'retitle both' } as Message,
        assistantCall(updateCall),
        assistantCall({
          id: 'call-2',
          name: UPDATE_METADATA,
          args: JSON.stringify({ uid: OTHER_UID, properties: { 'dc:title': 'Second' } }),
        }),
      ],
      resume: [submission({ 'dc:title': 'A new title' })],
      turns: [[{ type: 'finish', reason: 'stop' }]],
    });

    const put = writes(requests);
    expect(put).toHaveLength(1);
    expect(new URL(put[0]?.url ?? '').pathname).toBe(`/nuxeo/api/v1/id/${TARGET_UID}`);
    expect(toolResults(events)[1]).toMatchObject({ status: 'declined', decidedBy: 'user' });
  });

  // The one replay the model has any influence over, now with a submission
  // attached to it: reuse the id the payload names and hope the values are
  // applied a second time. The approval and the values are spent together.
  it('cannot be spent again by a call the model makes in the resumed run', async () => {
    const { events, requests } = await answered([submission({ 'dc:title': 'A new title' })]);

    expect(writes(requests)).toHaveLength(1);

    const replayed = await run({
      messages: [
        { id: 'm1', role: 'user', content: 'retitle this document' } as Message,
        assistantCall(updateCall),
      ],
      resume: [submission({ 'dc:title': 'A new title' })],
      turns: [
        // The model reuses the very id the submission names, immediately.
        toolCallTurn([{ ...updateCall, args: JSON.stringify({ uid: OTHER_UID, properties: {} }) }]),
        [{ type: 'finish', reason: 'stop' }],
      ],
    });

    // One write: the settled one. The model's replay is gated afresh and ends the
    // run on a new interrupt instead of executing.
    expect(writes(replayed.requests)).toHaveLength(1);
    expect(new URL(writes(replayed.requests)[0]?.url ?? '').pathname).toBe(
      `/nuxeo/api/v1/id/${TARGET_UID}`,
    );
    expect(interruptsOf(replayed.events).map((interrupt) => interrupt['id'])).toEqual(['call-1']);
    expect(events.length).toBeGreaterThan(0);
  });

  it('writes nothing when the same form is cancelled instead of submitted', async () => {
    const { events, requests } = await answered([{ interruptId: 'call-1', status: 'cancelled' }]);

    expect(writes(requests)).toEqual([]);
    expect(toolResults(events)[0]).toMatchObject({ status: 'declined', decidedBy: 'user' });
  });

  // Values without the grant are not a grant. A client that submits a form and
  // forgets `approved` loses the edit rather than writing it, which is the
  // direction the mistake has to fall.
  it('writes nothing when values arrive without an approval', async () => {
    const { requests } = await answered([
      { interruptId: 'call-1', status: 'resolved', payload: { fields: { 'dc:title': 'New' } } },
    ]);

    expect(writes(requests)).toEqual([]);
  });
});

describe('the approval card path is unchanged by any of this', () => {
  // The degradation that lets the contract ship before the client implements it:
  // a client that ignores `metadata.render` draws the card, approves, and the
  // gateway runs the arguments the card showed.
  it('runs the held arguments when the answer carries no fields at all', async () => {
    const { requests } = await answered([
      { interruptId: 'call-1', status: 'resolved', payload: { approved: true } },
    ]);

    expect(writes(requests)).toHaveLength(1);
    expect(writtenProperties(requests)).toEqual({ 'dc:title': 'Title the model chose' });
  });

  // An unrecognised payload key is not a submission. It approves the held call,
  // which is what an approval has always meant.
  it('treats an approval carrying some other key as an ordinary approval', async () => {
    const { requests } = await answered([
      {
        interruptId: 'call-1',
        status: 'resolved',
        payload: { approved: true, result: 'Approved by the user.' },
      },
    ]);

    expect(writtenProperties(requests)).toEqual({ 'dc:title': 'Title the model chose' });
  });
});
