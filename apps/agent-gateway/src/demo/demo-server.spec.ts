import { afterEach, describe, expect, it } from 'vitest';

import { ConfigurationError, type Env } from '../config';
import { testLogger } from '../testing/test-doubles';
import { DEMO_SCRIPTS } from './demo-scripts';
import { DemoScriptError, type DemoScript } from './demo-script.types';
import { createDemoGateway, type DemoGateway } from './demo-server';

/**
 * `createDemoGateway` is also the Phase 4 Playwright fixture, so these tests double
 * as the demonstration that it can be started on an ephemeral port from a test
 * process, without a build step and without touching the environment.
 */

// No PORT: `createDemoGateway` returns an unbound server, so the fixture picks the
// port itself with `listen(0)` — which is what a Playwright global-setup wants.
const env: Env = {
  NUXEO_BASE_URL: 'https://nuxeo.test',
  AGENT_DEMO_MODE: 'scripted',
};

let started: DemoGateway | undefined;

afterEach(async () => {
  if (!started) return;
  await new Promise<void>((resolve) => started?.server.close(() => resolve()));
  started = undefined;
});

async function baseUrlOf(gateway: DemoGateway): Promise<string> {
  await new Promise<void>((resolve) => gateway.server.listen(0, '127.0.0.1', () => resolve()));
  const address = gateway.server.address();
  if (address === null || typeof address === 'string') throw new Error('no port assigned');
  return `http://127.0.0.1:${address.port}`;
}

describe('createDemoGateway', () => {
  it('composes a gateway with the demo model, the demo registry and the disclosure', () => {
    const gateway = createDemoGateway({ env, logger: testLogger() });
    expect(gateway.config.nuxeoBaseUrl).toBe('https://nuxeo.test');
    expect(gateway.scripts).toBe(DEMO_SCRIPTS);
    // The full shipped tool set, with two swapped rather than dropped.
    expect(gateway.toolCount).toBeGreaterThan(20);
    expect(gateway.banner.join('\n')).toContain('SCRIPTED DEMO MODE');
  });

  it('serves the demo disclosure over HTTP, unauthenticated', async () => {
    started = createDemoGateway({ env, logger: testLogger() });
    const response = await fetch(`${await baseUrlOf(started)}/agent/capabilities`);
    const body = (await response.json()) as {
      agentRuntime: boolean;
      mode: string;
      demo?: { scripted: boolean; scripts: { id: string }[] };
    };

    expect(response.status).toBe(200);
    // Still true: the browser must behave exactly as it would against a live gateway.
    expect(body.agentRuntime).toBe(true);
    expect(body.mode).toBe('demo-scripted');
    expect(body.demo?.scripted).toBe(true);
    expect(body.demo?.scripts.map((script) => script.id)).toEqual(
      DEMO_SCRIPTS.map((script) => script.id),
    );
  });

  it('still refuses an unauthenticated run, exactly as production does', async () => {
    started = createDemoGateway({ env, logger: testLogger() });
    const response = await fetch(`${await baseUrlOf(started)}/agent/run`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ threadId: 't', runId: 'r', messages: [], tools: [], context: [] }),
    });
    expect(response.status).toBe(401);
  });

  it('fails on a bad environment before anything binds a port', () => {
    expect(() => createDemoGateway({ env: {}, logger: testLogger() })).toThrow(ConfigurationError);
  });

  // The validator runs inside the factory rather than at the call site, so no entry
  // point — including a future one — can skip it.
  it('fails on a script that misdeclares its data before anything binds a port', () => {
    const dishonest: DemoScript[] = [
      {
        id: 'dishonest',
        prompt: 'lie to me',
        triggers: [],
        demonstrates: 'a false claim',
        turns: [
          {
            toolCall: { id: 'c1', name: 'kd.ask', args: '{}', provenance: 'real-nuxeo' },
          },
        ],
      },
    ];
    expect(() => createDemoGateway({ env, scripts: dishonest, logger: testLogger() })).toThrow(
      DemoScriptError,
    );
  });
});
