import { describe, expect, it } from 'vitest';

import { AGENT_CAPABILITIES, demoCapabilities, DEMO_MODE_WARNING } from '../http/capabilities';
import { describeDemoScripts, demoStartupBanner } from './demo-disclosure';
import { DEMO_SCRIPTS } from './demo-scripts';
import type { DemoScript } from './demo-script.types';

/**
 * "Which mode is this gateway in" has to be answerable from outside the process and
 * from the console that started it. These tests pin both renderings, and pin that
 * they are derived from the same declarations the script validator checks — so the
 * published claim about what is real cannot drift from what the tools do.
 */

const scripts: DemoScript[] = [
  {
    id: 'real-only',
    prompt: 'Show me something real.',
    triggers: [],
    demonstrates: 'a real call',
    turns: [
      {
        toolCall: {
          id: 'c1',
          name: 'nuxeo.searchDocuments',
          args: '{}',
          provenance: 'real-nuxeo',
        },
      },
    ],
  },
  {
    id: 'mixed',
    prompt: 'Show me the gaps.',
    triggers: [],
    demonstrates: 'a substituted call and an approval',
    turns: [
      {
        toolCall: { id: 'c2', name: 'confirmAction', args: '{}', provenance: 'frontend' },
      },
      {
        toolCall: {
          id: 'c3',
          name: 'ai.summarizeDocument',
          args: '{}',
          provenance: 'canned',
          why: 'the bundle is not installed',
        },
        ifDeclined: { text: 'nothing happened' },
      },
    ],
  },
];

describe('describeDemoScripts', () => {
  it('publishes the prompt, the rationale and the per-tool provenance', () => {
    expect(describeDemoScripts(scripts)).toEqual([
      {
        id: 'real-only',
        prompt: 'Show me something real.',
        demonstrates: 'a real call',
        data: { 'nuxeo.searchDocuments': 'real-nuxeo' },
      },
      {
        id: 'mixed',
        prompt: 'Show me the gaps.',
        demonstrates: 'a substituted call and an approval',
        data: {
          confirmAction: 'frontend',
          'ai.summarizeDocument': 'canned — the bundle is not installed',
        },
      },
    ]);
  });

  it('describes every shipped script, so nothing is served undisclosed', () => {
    const described = describeDemoScripts(DEMO_SCRIPTS);
    expect(described).toHaveLength(DEMO_SCRIPTS.length);
    for (const entry of described) {
      expect(Object.keys(entry.data).length, entry.id).toBeGreaterThan(0);
    }
  });
});

describe('demoCapabilities', () => {
  // `agentRuntime` staying true is the point: the browser must behave exactly as it
  // would against a live gateway, and flipping it sends the client to the fallback.
  it('keeps the live payload and adds the disclosure alongside it', () => {
    const capabilities = demoCapabilities(describeDemoScripts(scripts));
    expect(capabilities.agentRuntime).toBe(true);
    expect(capabilities.mode).toBe('demo-scripted');
    expect(capabilities.features).toEqual(AGENT_CAPABILITIES.features);
    expect(capabilities.protocolVersion).toBe(AGENT_CAPABILITIES.protocolVersion);
    expect(capabilities.demo?.scripted).toBe(true);
    expect(capabilities.demo?.warning).toBe(DEMO_MODE_WARNING);
    expect(capabilities.demo?.scripts).toHaveLength(2);
  });

  it('leaves the live payload with no demo key at all', () => {
    expect(AGENT_CAPABILITIES.mode).toBe('live');
    expect(AGENT_CAPABILITIES.demo).toBeUndefined();
  });

  it('warns in terms a reader cannot mistake for a working product', () => {
    expect(DEMO_MODE_WARNING).toContain('SCRIPTED DEMO MODE');
    expect(DEMO_MODE_WARNING).toContain('No language model is called');
  });
});

describe('demoStartupBanner', () => {
  const banner = demoStartupBanner(scripts, 3100).join('\n');

  it('says what mode it is in and where it is listening', () => {
    expect(banner).toContain('SCRIPTED DEMO MODE — NO LANGUAGE MODEL IS CALLED');
    expect(banner).toContain('http://localhost:3100');
  });

  it('names every script and every substituted call with its reason', () => {
    expect(banner).toContain('real-only');
    expect(banner).toContain('Show me the gaps.');
    expect(banner).toContain(
      'NOT REAL  ai.summarizeDocument (canned): the bundle is not installed',
    );
  });

  // Listing the approval as "not real" would train the operator to discount the one
  // part of the human-in-the-loop flow that is entirely genuine.
  it('does not label the frontend approval tool as not real', () => {
    expect(banner).not.toContain('NOT REAL  confirmAction');
  });

  it('discloses the substitutions in the shipped scripts', () => {
    const shipped = demoStartupBanner(DEMO_SCRIPTS, 3100).join('\n');
    expect(shipped).toContain('NOT REAL  ai.summarizeDocument');
    expect(shipped).toContain('NOT REAL  kd.ask');
  });
});
