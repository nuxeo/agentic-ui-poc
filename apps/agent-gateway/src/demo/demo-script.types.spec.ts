import { describe, expect, it } from 'vitest';

import {
  DemoScriptError,
  requiresJustification,
  validateDemoScripts,
  type DemoDataProvenance,
  type DemoScript,
  type ProvenanceLookup,
} from './demo-script.types';

/**
 * These tests are the honesty rules themselves.
 *
 * Every case below is a way a demo could put a false claim about the audience's own
 * repository on a projector. The validator runs before the port binds, so each one
 * is a startup failure rather than something a reviewer might catch.
 */

const registry: Record<string, DemoDataProvenance> = {
  'nuxeo.searchDocuments': 'real-nuxeo',
  'ai.summarizeDocument': 'canned',
  'kd.ask': 'hybrid',
  confirmAction: 'frontend',
};

const lookup: ProvenanceLookup = (name) => registry[name];

function script(overrides: Partial<DemoScript> = {}): DemoScript {
  return {
    id: 'demo',
    prompt: 'a prompt',
    triggers: [],
    demonstrates: 'something',
    turns: [{ text: 'hello' }],
    ...overrides,
  };
}

function issuesFrom(scripts: readonly DemoScript[]): string[] {
  try {
    validateDemoScripts(scripts, lookup);
  } catch (error) {
    if (error instanceof DemoScriptError) return [...error.issues];
    throw error;
  }
  return [];
}

describe('requiresJustification', () => {
  // `frontend` is the real human-in-the-loop mechanism, not a stand-in for one, so
  // it must not be lumped in with the substitutions that need an excuse.
  it('is true only for the provenances that depart from real data', () => {
    expect(requiresJustification('hybrid')).toBe(true);
    expect(requiresJustification('canned')).toBe(true);
    expect(requiresJustification('real-nuxeo')).toBe(false);
    expect(requiresJustification('frontend')).toBe(false);
  });
});

describe('validateDemoScripts', () => {
  it('accepts a script whose declarations match the registry', () => {
    expect(() =>
      validateDemoScripts(
        [
          script({
            turns: [
              {
                text: 'searching',
                toolCall: {
                  id: 'c1',
                  name: 'nuxeo.searchDocuments',
                  args: '{}',
                  provenance: 'real-nuxeo',
                },
              },
              { factsFrom: 'c1', text: 'that is the result' },
            ],
          }),
        ],
        lookup,
      ),
    ).not.toThrow();
  });

  // The whole point of the format: a step cannot claim to be real when the demo
  // registry has replaced the tool underneath it.
  it('rejects a step that claims real-nuxeo for a substituted tool', () => {
    const issues = issuesFrom([
      script({
        turns: [
          {
            toolCall: { id: 'c1', name: 'kd.ask', args: '{}', provenance: 'real-nuxeo' },
          },
        ],
      }),
    ]);
    expect(issues.join('\n')).toContain('declares "kd.ask" as real-nuxeo');
    expect(issues.join('\n')).toContain('serves it as hybrid');
  });

  it('rejects a substituted step with no stated reason', () => {
    const issues = issuesFrom([
      script({
        turns: [{ toolCall: { id: 'c1', name: 'kd.ask', args: '{}', provenance: 'hybrid' } }],
      }),
    ]);
    expect(issues.join('\n')).toContain('without a "why"');
  });

  it('rejects a "why" on a call that is real, because a real call needs no excuse', () => {
    const issues = issuesFrom([
      script({
        turns: [
          {
            toolCall: {
              id: 'c1',
              name: 'nuxeo.searchDocuments',
              args: '{}',
              provenance: 'real-nuxeo',
              why: 'no reason',
            },
          },
        ],
      }),
    ]);
    expect(issues.join('\n')).toContain('gives a "why" for the real-nuxeo call');
  });

  it('rejects a tool the demo registry does not serve', () => {
    const issues = issuesFrom([
      script({
        turns: [
          { toolCall: { id: 'c1', name: 'nuxeo.nope', args: '{}', provenance: 'real-nuxeo' } },
        ],
      }),
    ]);
    expect(issues.join('\n')).toContain('which the demo registry does not serve');
  });

  it('rejects a reused toolCallId, which would merge two calls into one card', () => {
    const issues = issuesFrom([
      script({
        turns: [
          {
            toolCall: {
              id: 'same',
              name: 'nuxeo.searchDocuments',
              args: '{}',
              provenance: 'real-nuxeo',
            },
          },
          {
            toolCall: {
              id: 'same',
              name: 'nuxeo.searchDocuments',
              args: '{}',
              provenance: 'real-nuxeo',
            },
          },
        ],
      }),
    ]);
    expect(issues.join('\n')).toContain('reuses toolCallId "same"');
  });

  it('rejects prose citing facts from a call no earlier turn makes', () => {
    const issues = issuesFrom([
      script({ turns: [{ factsFrom: 'never-called', text: 'I found…' }] }),
    ]);
    expect(issues.join('\n')).toContain('citing facts from "never-called"');
  });

  // A declined branch describing the write it declined is the most tempting version
  // of the mistake, because the call *is* in the script — just not on that path.
  it('rejects a declined branch citing facts from the call it declined', () => {
    const issues = issuesFrom([
      script({
        turns: [
          {
            toolCall: {
              id: 'write',
              name: 'nuxeo.searchDocuments',
              args: '{}',
              provenance: 'real-nuxeo',
            },
            ifDeclined: { factsFrom: 'write', text: 'as you can see above…' },
          },
        ],
      }),
    ]);
    expect(issues.join('\n')).toContain('citing facts from "write"');
  });

  it('rejects computed arguments with no ifSkipped sentence', () => {
    const issues = issuesFrom([
      script({
        turns: [
          {
            toolCall: {
              id: 'c1',
              name: 'nuxeo.searchDocuments',
              args: () => '',
              provenance: 'real-nuxeo',
            },
          },
        ],
      }),
    ]);
    expect(issues.join('\n')).toContain('no "ifSkipped" sentence');
  });

  it('rejects duplicate script ids, an empty prompt and an empty script', () => {
    const issues = issuesFrom([
      script({ id: 'dup', prompt: '   ', turns: [] }),
      script({ id: 'dup' }),
    ]);
    expect(issues.join('\n')).toContain('Two scripts share the id "dup"');
    expect(issues.join('\n')).toContain('has no prompt');
    expect(issues.join('\n')).toContain('has no turns');
  });

  it('reports every problem at once and names itself in the message', () => {
    let caught: unknown;
    try {
      validateDemoScripts([script({ id: 'x', prompt: '' }), script({ id: 'x' })], lookup);
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(DemoScriptError);
    expect((caught as DemoScriptError).name).toBe('DemoScriptError');
    expect((caught as DemoScriptError).issues.length).toBeGreaterThan(1);
    expect((caught as DemoScriptError).message).toContain('Invalid demo script definitions');
  });
});
