/**
 * Gateway configuration.
 *
 * Everything comes from the environment and is validated once, at startup, with
 * no fallback defaults for anything required (AGENTS/07-security.md). The
 * process exits non-zero rather than starting in a half-configured state.
 *
 * The table below is ADR 001 "Configuration", verbatim. Note what is absent:
 * there is no Nuxeo credential. The gateway authenticates to Nuxeo as the
 * caller and nothing else, so a Nuxeo username/password/token variable is not
 * merely unnecessary — its presence means someone is about to reintroduce the
 * service-account ACL bypass the design exists to prevent. `FORBIDDEN_VARIABLES`
 * turns that mistake into a startup failure instead of a silent security hole.
 */

/**
 * Everything the HTTP surface and the agent loop need — and deliberately nothing
 * more. The HAIP credential is not in here because neither of them uses it: only
 * `HaipModelClient` does, through its own constructor options. Keeping the loop's
 * config credential-free is what lets a `ModelClient` that has no upstream
 * provider (`src/demo`) be composed without inventing a placeholder secret to
 * satisfy a type, which is how fallback defaults get reintroduced.
 */
export interface GatewayRuntimeConfig {
  /** Origin of the Nuxeo server, e.g. `https://nuxeo.example.com`. Server-controlled. */
  readonly nuxeoBaseUrl: string;
  /** Model identifier passed to whichever `ModelClient` is composed. */
  readonly agentModel: string;
  readonly port: number;
  /** Upper bound on model→tool→model iterations in a single run. */
  readonly maxSteps: number;
  /** Hard ceiling on wall-clock time for a single run. */
  readonly runTimeoutMs: number;
}

export interface GatewayConfig extends GatewayRuntimeConfig {
  /** HAIP model gateway base URL, e.g. `https://haip.example.com/v1`. */
  readonly haipBaseUrl: string;
  /** The one credential the gateway holds. Authenticates it to the model provider only. */
  readonly haipApiKey: string;
}

export const REQUIRED_VARIABLES = [
  'NUXEO_BASE_URL',
  'HAIP_BASE_URL',
  'HAIP_API_KEY',
  'AGENT_MODEL',
] as const;

/**
 * ADR 001, identity propagation rule 1: "The gateway MUST NOT define NUXEO_AUTH,
 * a username, a password, a shared token, or any other Nuxeo credential in its
 * environment, config, or code." Starting with one of these set would let a
 * later code change quietly use it.
 */
export const FORBIDDEN_VARIABLES = [
  'NUXEO_AUTH',
  'NUXEO_USER',
  'NUXEO_USERNAME',
  'NUXEO_PASSWORD',
  'NUXEO_TOKEN',
  'NUXEO_API_KEY',
  'NUXEO_SECRET',
  'NUXEO_BASIC_AUTH',
  'NUXEO_SERVICE_ACCOUNT',
] as const;

export const DEFAULT_PORT = 3100;
export const DEFAULT_MAX_STEPS = 8;
export const DEFAULT_RUN_TIMEOUT_MS = 120_000;

export class ConfigurationError extends Error {
  constructor(readonly issues: readonly string[]) {
    super(`Invalid agent-gateway configuration:\n  - ${issues.join('\n  - ')}`);
    this.name = 'ConfigurationError';
  }
}

export type Env = Record<string, string | undefined>;

/**
 * The forbidden-variable sweep, shared by every entry point.
 *
 * Exported because a second entry point that skipped it would reopen exactly the
 * hole `FORBIDDEN_VARIABLES` exists to close, and "remember to call this too" is
 * not a control.
 */
export function collectForbiddenVariableIssues(env: Env): string[] {
  const issues: string[] = [];
  for (const name of FORBIDDEN_VARIABLES) {
    if (env[name] !== undefined && env[name] !== '') {
      issues.push(
        `${name} must not be set. The gateway holds no Nuxeo credential: it forwards the ` +
          "caller's own session on every downstream call (ADR 001, identity propagation).",
      );
    }
  }
  return issues;
}

function required(env: Env, name: string, issues: string[]): string {
  const value = env[name]?.trim();
  if (!value) {
    issues.push(`${name} is required and has no default.`);
    return '';
  }
  return value;
}

export function absoluteHttpUrl(name: string, value: string, issues: string[]): string {
  if (!value) return value;
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    issues.push(`${name} must be an absolute URL, got "${value}".`);
    return value;
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    issues.push(`${name} must use http or https, got "${parsed.protocol}".`);
  }
  return value.replace(/\/+$/, '');
}

/**
 * An origin, with no path. Every Nuxeo call in the process builds its own
 * `/nuxeo/...` path, so a base URL that already contains one produces
 * `/nuxeo/nuxeo/api/v1/...` — a 404 that surfaces as "Nuxeo rejected the caller
 * session" on the first run and looks exactly like an expired login. Cheap to
 * mistype, expensive to diagnose live, so it fails at startup instead.
 */
export function nuxeoOrigin(name: string, value: string, issues: string[]): string {
  const normalised = absoluteHttpUrl(name, value, issues);
  if (!normalised) return normalised;
  let path: string;
  try {
    path = new URL(normalised).pathname;
  } catch {
    return normalised;
  }
  if (path !== '/' && path !== '') {
    issues.push(
      `${name} must be the Nuxeo origin with no path, got "${normalised}". The context path is ` +
        `added by the gateway, so this would call "${normalised}/nuxeo/api/v1/me". Use ` +
        `"${new URL(normalised).origin}".`,
    );
  }
  return normalised;
}

export function positiveInteger(
  env: Env,
  name: string,
  fallback: number,
  issues: string[],
): number {
  const raw = env[name]?.trim();
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    issues.push(`${name} must be a positive integer, got "${raw}".`);
    return fallback;
  }
  return value;
}

/**
 * Parses and validates the environment. Throws `ConfigurationError` listing
 * every problem at once — a config error found one variable per restart is a
 * miserable way to bring a container up.
 */
export function loadConfig(env: Env = process.env): GatewayConfig {
  const issues: string[] = [...collectForbiddenVariableIssues(env)];

  // Mutual exclusion with scripted demo mode (src/demo/demo-config.ts). The demo
  // loader requires AGENT_DEMO_MODE=scripted; this one refuses to start if it is set
  // to anything at all. No single environment can therefore satisfy both, so a
  // half-finished migration between the two fails at startup instead of silently
  // resolving to whichever binary happened to be launched.
  if (env['AGENT_DEMO_MODE'] !== undefined && env['AGENT_DEMO_MODE'] !== '') {
    issues.push(
      'AGENT_DEMO_MODE must not be set for the production entry point. Scripted demo mode is a ' +
        'separate binary (main.demo.ts) that serves a fixed transcript; finding its switch in ' +
        'this process\u2019s environment means the deployment is not the one it thinks it is.',
    );
  }

  const nuxeoBaseUrl = nuxeoOrigin(
    'NUXEO_BASE_URL',
    required(env, 'NUXEO_BASE_URL', issues),
    issues,
  );
  const haipBaseUrl = absoluteHttpUrl(
    'HAIP_BASE_URL',
    required(env, 'HAIP_BASE_URL', issues),
    issues,
  );
  const haipApiKey = required(env, 'HAIP_API_KEY', issues);
  const agentModel = required(env, 'AGENT_MODEL', issues);

  const port = positiveInteger(env, 'PORT', DEFAULT_PORT, issues);
  const maxSteps = positiveInteger(env, 'AGENT_MAX_STEPS', DEFAULT_MAX_STEPS, issues);
  const runTimeoutMs = positiveInteger(env, 'AGENT_RUN_TIMEOUT_MS', DEFAULT_RUN_TIMEOUT_MS, issues);

  if (issues.length > 0) {
    throw new ConfigurationError(issues);
  }

  return { nuxeoBaseUrl, haipBaseUrl, haipApiKey, agentModel, port, maxSteps, runTimeoutMs };
}
