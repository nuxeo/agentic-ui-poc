import { describe, expect, it } from 'vitest';

import { ConfigurationError, loadConfig, type Env } from '../config';
import {
  DEFAULT_DEMO_SPEED,
  DEMO_MODE_VALUE,
  DEMO_MODE_VARIABLE,
  DEMO_MODEL_NAME,
  loadDemoConfig,
} from './demo-config';

/**
 * The four controls that stop a production gateway serving a scripted transcript.
 * Two of them are testable here — the opt-in value and the mutual exclusion with
 * the production loader. The third (`NODE_ENV`) is below; the fourth (a separate
 * artifact) is `production-isolation.spec.ts`.
 */

function env(overrides: Env = {}): Env {
  return {
    NUXEO_BASE_URL: 'https://nuxeo.test',
    [DEMO_MODE_VARIABLE]: DEMO_MODE_VALUE,
    ...overrides,
  };
}

function issuesOf(loader: () => unknown): string[] {
  try {
    loader();
  } catch (error) {
    if (error instanceof ConfigurationError) return [...error.issues];
    throw error;
  }
  return [];
}

describe('loadDemoConfig', () => {
  it('needs no HAIP credential and no model name, because there is no model', () => {
    const config = loadDemoConfig(env());
    expect(config).toEqual({
      nuxeoBaseUrl: 'https://nuxeo.test',
      agentModel: DEMO_MODEL_NAME,
      port: 3100,
      maxSteps: 8,
      runTimeoutMs: 120_000,
      demoSpeed: DEFAULT_DEMO_SPEED,
    });
  });

  it('reads port, step ceiling, timeout and speed from the environment', () => {
    const config = loadDemoConfig(
      env({
        PORT: '4000',
        AGENT_MAX_STEPS: '3',
        AGENT_RUN_TIMEOUT_MS: '9000',
        AGENT_DEMO_SPEED: '50',
      }),
    );
    expect(config).toMatchObject({
      port: 4000,
      maxSteps: 3,
      runTimeoutMs: 9000,
      demoSpeed: 50,
    });
  });

  it('strips a trailing slash from the Nuxeo base URL', () => {
    expect(loadDemoConfig(env({ NUXEO_BASE_URL: 'https://nuxeo.test/' })).nuxeoBaseUrl).toBe(
      'https://nuxeo.test',
    );
  });

  // Control 2. A boolean would be one careless template value away from being on.
  it.each(['', 'true', '1', 'yes', 'Scripted', 'demo'])(
    'refuses to start with %s as the mode value',
    (value) => {
      const issues = issuesOf(() => loadDemoConfig(env({ [DEMO_MODE_VARIABLE]: value })));
      expect(issues.join('\n')).toContain(`${DEMO_MODE_VARIABLE} must be exactly "scripted"`);
    },
  );

  it('refuses to start when the mode variable is absent entirely', () => {
    const issues = issuesOf(() => loadDemoConfig({ NUXEO_BASE_URL: 'https://nuxeo.test' }));
    expect(issues.join('\n')).toContain('It is not set.');
  });

  // Control 4.
  it('refuses to start when NODE_ENV says production', () => {
    const issues = issuesOf(() => loadDemoConfig(env({ NODE_ENV: 'production' })));
    expect(issues.join('\n')).toContain('NODE_ENV is "production"');
  });

  it('requires an absolute http(s) Nuxeo URL, because real tools still run', () => {
    expect(issuesOf(() => loadDemoConfig(env({ NUXEO_BASE_URL: '' }))).join('\n')).toContain(
      'NUXEO_BASE_URL is required',
    );
    expect(issuesOf(() => loadDemoConfig(env({ NUXEO_BASE_URL: 'nuxeo' }))).join('\n')).toContain(
      'must be an absolute URL',
    );
    expect(
      issuesOf(() => loadDemoConfig(env({ NUXEO_BASE_URL: 'ftp://nuxeo.test' }))).join('\n'),
    ).toContain('must use http or https');
  });

  // The demo driver copies this value out of the runbook by hand, so the mistake
  // that costs a live demo is the one worth failing loudly at startup.
  it('rejects a Nuxeo URL that already includes the /nuxeo context path', () => {
    expect(
      issuesOf(() => loadDemoConfig(env({ NUXEO_BASE_URL: 'http://localhost:8090/nuxeo' }))).join(
        '\n',
      ),
    ).toContain('must be the Nuxeo origin with no path');
  });

  it('rejects a non-positive integer for a numeric variable', () => {
    expect(issuesOf(() => loadDemoConfig(env({ AGENT_DEMO_SPEED: '0' }))).join('\n')).toContain(
      'AGENT_DEMO_SPEED must be a positive integer',
    );
  });

  // Demo mode forwards the caller's own session exactly as production does. A Nuxeo
  // credential here would make every permission claim in the runbook false.
  it('applies the same forbidden-Nuxeo-credential sweep as production', () => {
    const issues = issuesOf(() => loadDemoConfig(env({ NUXEO_PASSWORD: 'hunter2' })));
    expect(issues.join('\n')).toContain('NUXEO_PASSWORD must not be set');
  });

  it('reports every problem in one throw', () => {
    const issues = issuesOf(() =>
      loadDemoConfig({ [DEMO_MODE_VARIABLE]: 'true', NODE_ENV: 'production' }),
    );
    expect(issues.length).toBeGreaterThanOrEqual(3);
  });
});

describe('loadConfig and demo mode are mutually exclusive', () => {
  const production: Env = {
    NUXEO_BASE_URL: 'https://nuxeo.test',
    HAIP_BASE_URL: 'https://haip.test/v1',
    HAIP_API_KEY: 'k',
    AGENT_MODEL: 'm',
  };

  it('starts normally when the demo switch is absent', () => {
    expect(() => loadConfig(production)).not.toThrow();
  });

  // Control 3. One environment cannot satisfy both loaders, so a half-finished
  // migration fails at startup rather than resolving to whichever binary ran.
  it.each([DEMO_MODE_VALUE, 'true', 'anything'])(
    'refuses the production entry point when AGENT_DEMO_MODE=%s',
    (value) => {
      const issues = issuesOf(() => loadConfig({ ...production, AGENT_DEMO_MODE: value }));
      expect(issues.join('\n')).toContain('AGENT_DEMO_MODE must not be set');
    },
  );

  it('ignores an empty AGENT_DEMO_MODE, which is how unset variables arrive in shells', () => {
    expect(() => loadConfig({ ...production, AGENT_DEMO_MODE: '' })).not.toThrow();
  });
});
