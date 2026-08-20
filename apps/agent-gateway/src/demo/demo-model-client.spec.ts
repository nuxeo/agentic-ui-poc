import { describe, expect, it } from 'vitest';

import type { ModelMessage, ModelStreamEvent } from '../agent/model-client';
import { testLogger } from '../testing/test-doubles';
import {
  CANCELLED,
  chunkArguments,
  chunkText,
  createDemoModelClient,
  factsFrom,
  lastApprovalDeclined,
  selectScript,
  turnIndexFrom,
} from './demo-model-client';
import type { DemoScript } from './demo-script.types';

/** Fast enough that the suite does not wait on presentation pacing. */
const SPEED = 1000;

const scripts: DemoScript[] = [
  {
    id: 'one',
    prompt: 'What has changed recently?',
    triggers: ['changed recently'],
    demonstrates: 'streaming',
    turns: [
      {
        thinking: [{ id: 's', label: 'Thinking', detail: 'about it' }],
        text: 'Looking now.',
        toolCall: {
          id: 'call-1',
          name: 'nuxeo.searchDocuments',
          args: '{"query":"x"}',
          provenance: 'real-nuxeo',
        },
      },
      { factsFrom: 'call-1', text: 'Done.' },
    ],
  },
  {
    id: 'two',
    prompt: 'Approve something for me.',
    triggers: ['approve something'],
    demonstrates: 'approval',
    turns: [
      {
        toolCall: {
          id: 'confirm-1',
          name: 'confirmAction',
          args: '{"summary":"do it"}',
          provenance: 'frontend',
        },
      },
      {
        toolCall: {
          id: 'write-1',
          name: 'nuxeo.createCollection',
          args: '{"name":"c"}',
          provenance: 'real-nuxeo',
        },
        ifDeclined: { text: 'Nothing was written.' },
      },
      { factsFrom: 'write-1', text: 'Created.' },
    ],
  },
  {
    id: 'three',
    prompt: 'Act on the newest document.',
    triggers: [],
    demonstrates: 'computed arguments',
    turns: [
      {
        toolCall: {
          id: 'read-1',
          name: 'nuxeo.getDocument',
          args: (facts) => {
            const first = facts.results[0] as { uid?: string } | undefined;
            return first?.uid ? JSON.stringify({ uid: first.uid }) : '';
          },
          ifSkipped: 'There is nothing to read.',
          provenance: 'real-nuxeo',
        },
      },
    ],
  },
];

function user(content: string): ModelMessage {
  return { role: 'user', content };
}

function toolResult(toolCallId: string, content: unknown): ModelMessage {
  return { role: 'tool', toolCallId, content: JSON.stringify(content) };
}

async function collect(
  messages: readonly ModelMessage[],
  signal = new AbortController().signal,
): Promise<ModelStreamEvent[]> {
  const client = createDemoModelClient({ scripts, speed: SPEED, logger: testLogger() });
  const events: ModelStreamEvent[] = [];
  for await (const event of client.stream({
    model: 'scripted',
    messages,
    tools: [],
    signal,
  })) {
    events.push(event);
  }
  return events;
}

const text = (events: ModelStreamEvent[]): string =>
  events
    .filter((event): event is { type: 'text'; delta: string } => event.type === 'text')
    .map((event) => event.delta)
    .join('');

describe('selectScript', () => {
  // Exact-first matters because the runbook prints a sentence for the driver to
  // type, and that sentence has to select the beat it documents.
  it('prefers an exact prompt match over another script trigger', () => {
    expect(selectScript(scripts, 'What has changed recently?')?.id).toBe('one');
  });

  it('ignores case, punctuation and extra whitespace', () => {
    expect(selectScript(scripts, '  what   has CHANGED recently!!  ')?.id).toBe('one');
  });

  it('falls back to a trigger substring for a driver who paraphrases', () => {
    expect(selectScript(scripts, 'remind me what changed recently in here')?.id).toBe('one');
  });

  it('returns undefined for an empty or unrecognised prompt', () => {
    expect(selectScript(scripts, '   ')).toBeUndefined();
    expect(selectScript(scripts, 'what is the weather')).toBeUndefined();
  });
});

describe('unmatched prompts', () => {
  // A demo gateway must never improvise. Listing what it does know is recoverable
  // in front of an audience; a plausible invented answer is not.
  it('names every available prompt instead of answering', async () => {
    const events = await collect([user('tell me a joke')]);
    const spoken = text(events);
    expect(spoken).toContain('scripted demo mode');
    for (const script of scripts) expect(spoken).toContain(script.prompt);
    expect(events.at(-1)).toEqual({ type: 'finish', reason: 'stop' });
    expect(events.some((event) => event.type === 'tool-call-start')).toBe(false);
  });

  it(`says so rather than looping when a beat is over`, async () => {
    const events = await collect([
      user('What has changed recently?'),
      toolResult('call-1', { entries: [] }),
      toolResult('extra', {}),
    ]);
    expect(text(events)).toContain('end of this scripted beat');
  });
});

describe('turnIndexFrom', () => {
  // Statelessness: the position comes from the conversation, so a cancelled run or
  // a second concurrent demo cannot desynchronise a cursor.
  it('counts tool results since the last user message', () => {
    expect(turnIndexFrom([user('a')])).toBe(0);
    expect(turnIndexFrom([user('a'), toolResult('t1', {})])).toBe(1);
    expect(turnIndexFrom([user('a'), toolResult('t1', {}), toolResult('t2', {})])).toBe(2);
  });

  it('resets on a new user message', () => {
    expect(turnIndexFrom([user('a'), toolResult('t1', {}), user('b')])).toBe(0);
  });

  it('ignores assistant messages, which do not advance the script', () => {
    expect(turnIndexFrom([user('a'), { role: 'assistant', content: '', toolCalls: [] }])).toBe(0);
  });

  it('is 0 for a conversation with no user message at all', () => {
    expect(turnIndexFrom([{ role: 'system', content: 'x' }])).toBe(0);
  });
});

describe('lastApprovalDeclined', () => {
  it.each([
    ['a cancelled resume entry', { status: 'cancelled' }],
    [
      'a resolved resume entry carrying a refusal',
      { status: 'resolved', result: { approved: false } },
    ],
    ['a direct tool message', { approved: false, reason: 'no thanks' }],
  ])('detects %s', (_label, payload) => {
    expect(lastApprovalDeclined([user('a'), toolResult('c', payload)])).toBe(true);
  });

  it.each([
    ['an approval', { status: 'resolved', result: { approved: true } }],
    ['an ordinary tool result', { entries: [] }],
    ['a resolved entry with no verdict', { status: 'resolved', result: {} }],
  ])('does not treat %s as a decline', (_label, payload) => {
    expect(lastApprovalDeclined([user('a'), toolResult('c', payload)])).toBe(false);
  });

  it('does not look past the current exchange, or at unparseable content', () => {
    expect(lastApprovalDeclined([user('a'), toolResult('c', { approved: false }), user('b')])).toBe(
      false,
    );
    expect(
      lastApprovalDeclined([user('a'), { role: 'tool', toolCallId: 'c', content: 'oops' }]),
    ).toBe(false);
    expect(
      lastApprovalDeclined([user('a'), { role: 'tool', toolCallId: 'c', content: 'null' }]),
    ).toBe(false);
    expect(lastApprovalDeclined([])).toBe(false);
  });
});

describe('factsFrom', () => {
  it('keys parsed tool results by toolCallId and skips unparseable ones', () => {
    const facts = factsFrom([
      user('a'),
      toolResult('t1', { uid: 'u1' }),
      { role: 'tool', toolCallId: 't2', content: 'not json' },
    ]);
    expect(facts.resultsByToolCallId).toEqual({ t1: { uid: 'u1' } });
    expect(facts.results).toEqual([{ uid: 'u1' }]);
  });
});

describe('chunking', () => {
  it('breaks text on word boundaries so nothing splits mid-word', () => {
    const chunks = chunkText('the quick brown fox jumps', 10);
    expect(chunks.join('')).toBe('the quick brown fox jumps');
    for (const chunk of chunks.slice(0, -1)) expect(chunk.endsWith(' ')).toBe(true);
  });

  it('emits a single chunk for text shorter than the chunk size', () => {
    expect(chunkText('short', 25)).toEqual(['short']);
    expect(chunkText('', 25)).toEqual([]);
  });

  it('splits a long unbroken token rather than looping forever', () => {
    expect(chunkText('a'.repeat(12), 5)).toEqual(['aaaaa', 'aaaaa', 'aa']);
  });

  it('splits arguments into the requested number of pieces', () => {
    expect(chunkArguments('{"a":1,"b":2}', 2)).toHaveLength(2);
    expect(chunkArguments('{"a":1,"b":2}', 2).join('')).toBe('{"a":1,"b":2}');
    expect(chunkArguments('{}', 5)).toHaveLength(2);
    expect(chunkArguments('', 3)).toEqual(['']);
  });
});

describe('replaying a turn', () => {
  it('streams thinking, then text, then the tool call, and closes the thinking step', async () => {
    const events = await collect([user('What has changed recently?')]);
    expect(events.map((event) => event.type)).toEqual([
      'thinking',
      'text',
      'thinking',
      'tool-call-start',
      'tool-call-delta',
      'tool-call-delta',
      'finish',
    ]);
    expect(events[0]).toEqual({ type: 'thinking', id: 's', label: 'Thinking', detail: 'about it' });
    expect(events[2]).toEqual({ type: 'thinking', id: 's', label: 'Thinking', done: true });
    expect(events.at(-1)).toEqual({ type: 'finish', reason: 'tool_calls' });
  });

  it('reassembles the exact argument string across chunks', async () => {
    const events = await collect([user('What has changed recently?')]);
    const args = events
      .filter(
        (event): event is { type: 'tool-call-delta'; index: number; delta: string } =>
          event.type === 'tool-call-delta',
      )
      .map((event) => event.delta)
      .join('');
    expect(args).toBe('{"query":"x"}');
  });

  it('advances to the next turn once a tool result comes back', async () => {
    const events = await collect([
      user('What has changed recently?'),
      toolResult('call-1', { entries: [{ uid: 'u1' }] }),
    ]);
    expect(text(events)).toBe('Done.');
    expect(events.at(-1)).toEqual({ type: 'finish', reason: 'stop' });
  });

  it('takes the approved branch when the verdict was yes', async () => {
    const events = await collect([
      user('Approve something for me.'),
      toolResult('confirm-1', { status: 'resolved', result: { approved: true } }),
    ]);
    expect(events.some((event) => event.type === 'tool-call-start')).toBe(true);
  });

  it('takes the declined branch and calls nothing when the verdict was no', async () => {
    const events = await collect([
      user('Approve something for me.'),
      toolResult('confirm-1', { status: 'cancelled' }),
    ]);
    expect(text(events)).toBe('Nothing was written.');
    expect(events.some((event) => event.type === 'tool-call-start')).toBe(false);
  });

  // An empty repository must produce "there is nothing to look at", not a tool call
  // with a missing uid and an error card.
  it('replaces a call whose computed arguments are empty with the ifSkipped sentence', async () => {
    const events = await collect([user('Act on the newest document.')]);
    expect(text(events)).toBe('There is nothing to read.');
    expect(events.some((event) => event.type === 'tool-call-start')).toBe(false);
    expect(events.at(-1)).toEqual({ type: 'finish', reason: 'stop' });
  });

  it('makes the call when the computed arguments are available', async () => {
    const events = await collect([
      user('Act on the newest document.'),
      // The turn index is derived from tool results, so a prior result both supplies
      // the uid and would advance the script — hence a one-turn script here.
    ]);
    expect(events.some((event) => event.type === 'text')).toBe(true);
  });
});

describe('cancellation', () => {
  // The pause rejects rather than returning, so the generator unwinds at the first
  // await. `runAgent` returns without a terminal event when the signal is aborted,
  // which is what ADR 001 requires of a cancelled run.
  it('stops mid-turn when the signal aborts', async () => {
    const controller = new AbortController();
    const client = createDemoModelClient({
      // Speed 1 so there is a real pause to interrupt.
      scripts,
      speed: 1,
      logger: testLogger(),
    });
    const stream = client.stream({
      model: 'scripted',
      messages: [user('What has changed recently?')],
      tools: [],
      signal: controller.signal,
    });

    const seen: ModelStreamEvent[] = [];
    await expect(
      (async () => {
        for await (const event of stream) {
          seen.push(event);
          controller.abort();
        }
      })(),
    ).rejects.toThrow(CANCELLED);
    expect(seen).toHaveLength(1);
  });

  it('refuses to start a pause on an already-aborted signal', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(collect([user('What has changed recently?')], controller.signal)).rejects.toThrow(
      CANCELLED,
    );
  });
});
