import {
  collectForbiddenVariableIssues,
  ConfigurationError,
  DEFAULT_MAX_STEPS,
  DEFAULT_PORT,
  DEFAULT_RUN_TIMEOUT_MS,
  nuxeoOrigin,
  positiveInteger,
  type Env,
  type GatewayRuntimeConfig,
} from '../config';

/**
 * Configuration for scripted demo mode.
 *
 * ## Why this is a separate loader, and separate everything else
 *
 * The requirement is that no misconfiguration can put a production gateway into
 * demo mode. Four independent things have to be true at once, and each is a
 * different kind of mistake, so no single slip gets through:
 *
 *  1. **A different entry point.** `src/main.demo.ts`, built by its own Nx target.
 *     `src/main.ts` never imports anything under `src/demo/`, and
 *     `production-isolation.spec.ts` walks the production import graph and fails if
 *     that ever stops being true. A production image therefore does not *contain*
 *     the scripts, which no environment variable can undo.
 *  2. **An opt-in value, not a boolean.** `AGENT_DEMO_MODE` must be exactly
 *     `scripted`. `true`, `1`, `yes` and an empty string are all refused, so a
 *     truthy-looking value pasted into a config-management template does not enable
 *     anything.
 *  3. **Mutual exclusion with production config.** `loadConfig` refuses to start
 *     when `AGENT_DEMO_MODE` is set at all. One environment cannot satisfy both
 *     loaders, so a half-migrated deployment fails loudly instead of picking one.
 *  4. **`NODE_ENV=production` is a hard stop.** Anything that has been told it is
 *     production does not get a demo mode, whichever binary was started.
 *
 * Rejected alternatives, and why:
 *
 *  - *A boolean env var on the single entry point.* One typo away from being on,
 *     and the demo code ships in the production artifact where a later
 *     vulnerability in it is a production vulnerability.
 *  - *A build-time flag alone* (`define`/dead-code elimination). Good isolation,
 *     but nothing at runtime tells an operator which artifact they are running, and
 *     "is this the demo build?" is then unanswerable from a running process. The
 *     mode has to be visible in the log and in `GET /agent/capabilities`, which
 *     wants a runtime value.
 *  - *A request header or a query parameter.* Turns demo mode into something a
 *     browser can ask for. That is the failure this design exists to prevent.
 */

/** The one accepted value. A boolean would be too easy to set by accident. */
export const DEMO_MODE_VALUE = 'scripted';
export const DEMO_MODE_VARIABLE = 'AGENT_DEMO_MODE';

/** Demo mode needs no HAIP credential and no model name; there is no model. */
export const DEMO_REQUIRED_VARIABLES = ['NUXEO_BASE_URL', DEMO_MODE_VARIABLE] as const;

/** Stands in for `AGENT_MODEL` in logs and in the capability probe. */
export const DEMO_MODEL_NAME = 'scripted-demo (no model)';

export const DEFAULT_DEMO_SPEED = 1;

export interface DemoGatewayConfig extends GatewayRuntimeConfig {
  /** Divides every scripted delay. 1 is presentation pace; tests use a large value. */
  readonly demoSpeed: number;
}

/**
 * Parses the environment for demo mode, or throws listing everything wrong.
 *
 * Deliberately reuses `collectForbiddenVariableIssues`: demo mode forwards the
 * caller's Nuxeo session exactly as production does, so a Nuxeo credential in its
 * environment is the same security failure and gets the same startup refusal. A
 * demo that quietly ran as Administrator would also make every permission claim in
 * the runbook false.
 */
export function loadDemoConfig(env: Env = process.env): DemoGatewayConfig {
  const issues: string[] = [...collectForbiddenVariableIssues(env)];

  const mode = env[DEMO_MODE_VARIABLE]?.trim();
  if (mode !== DEMO_MODE_VALUE) {
    issues.push(
      `${DEMO_MODE_VARIABLE} must be exactly "${DEMO_MODE_VALUE}" to start scripted demo mode` +
        (mode ? `, got "${mode}".` : '. It is not set.') +
        ' Demo mode is opt-in by an explicit value rather than a boolean so that no truthy' +
        ' placeholder can enable it.',
    );
  }

  if (env['NODE_ENV'] === 'production') {
    issues.push(
      'NODE_ENV is "production". Scripted demo mode refuses to start in a production' +
        ' environment: it serves a fixed transcript, which in front of a customer would be' +
        ' indistinguishable from a working product until it was not.',
    );
  }

  const raw = env['NUXEO_BASE_URL']?.trim();
  if (!raw) {
    issues.push(
      'NUXEO_BASE_URL is required and has no default. Demo mode runs real Nuxeo tools against' +
        ' it, so without it the demo would have nothing real left in it.',
    );
  }
  const nuxeoBaseUrl = nuxeoOrigin('NUXEO_BASE_URL', raw ?? '', issues);

  const port = positiveInteger(env, 'PORT', DEFAULT_PORT, issues);
  const maxSteps = positiveInteger(env, 'AGENT_MAX_STEPS', DEFAULT_MAX_STEPS, issues);
  const runTimeoutMs = positiveInteger(env, 'AGENT_RUN_TIMEOUT_MS', DEFAULT_RUN_TIMEOUT_MS, issues);
  const demoSpeed = positiveInteger(env, 'AGENT_DEMO_SPEED', DEFAULT_DEMO_SPEED, issues);

  if (issues.length > 0) {
    throw new ConfigurationError(issues);
  }

  return {
    nuxeoBaseUrl,
    agentModel: DEMO_MODEL_NAME,
    port,
    maxSteps,
    runTimeoutMs,
    demoSpeed,
  };
}
