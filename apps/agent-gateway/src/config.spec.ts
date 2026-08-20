import { describe, expect, it } from 'vitest';

import { ConfigurationError, FORBIDDEN_VARIABLES, loadConfig } from './config';

const VALID_ENV = {
  NUXEO_BASE_URL: 'https://nuxeo.example.com',
  HAIP_BASE_URL: 'https://haip.example.com/v1',
  HAIP_API_KEY: 'haip-key',
  AGENT_MODEL: 'gpt-test',
};

describe('loadConfig', () => {
  it('reads the required variables and applies documented defaults', () => {
    const config = loadConfig({ ...VALID_ENV });

    expect(config.nuxeoBaseUrl).toBe('https://nuxeo.example.com');
    expect(config.agentModel).toBe('gpt-test');
    expect(config.port).toBe(3100);
    expect(config.maxSteps).toBeGreaterThan(0);
    expect(config.runTimeoutMs).toBeGreaterThan(0);
  });

  it('strips a trailing slash from base URLs so paths concatenate cleanly', () => {
    const config = loadConfig({ ...VALID_ENV, NUXEO_BASE_URL: 'https://nuxeo.example.com/' });
    expect(config.nuxeoBaseUrl).toBe('https://nuxeo.example.com');
  });

  it('fails when a required variable is missing, with no fallback default', () => {
    expect(() => loadConfig({ ...VALID_ENV, HAIP_API_KEY: undefined })).toThrow(ConfigurationError);
  });

  it('reports every problem at once rather than one per restart', () => {
    try {
      loadConfig({});
      expect.unreachable('should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigurationError);
      expect((error as ConfigurationError).issues).toHaveLength(4);
    }
  });

  it('rejects a base URL that is not absolute http(s)', () => {
    expect(() => loadConfig({ ...VALID_ENV, NUXEO_BASE_URL: 'nuxeo.example.com' })).toThrow(
      /must be an absolute URL/,
    );
    expect(() => loadConfig({ ...VALID_ENV, HAIP_BASE_URL: 'ftp://haip.example.com' })).toThrow(
      /must use http or https/,
    );
  });

  /**
   * The mistake this catches was made during the demo rehearsal: the gateway
   * started happily on `http://localhost:8090/nuxeo` and then rejected every run
   * with "Nuxeo rejected the caller session", which reads as an expired login
   * rather than a typo in an environment variable.
   */
  it('rejects a NUXEO_BASE_URL that already carries the context path', () => {
    expect(() =>
      loadConfig({ ...VALID_ENV, NUXEO_BASE_URL: 'http://localhost:8090/nuxeo' }),
    ).toThrow(/must be the Nuxeo origin with no path/);
    expect(() =>
      loadConfig({ ...VALID_ENV, NUXEO_BASE_URL: 'http://localhost:8090/nuxeo' }),
    ).toThrow(/http:\/\/localhost:8090/);
  });

  it('accepts an origin with an explicit root path', () => {
    expect(
      loadConfig({ ...VALID_ENV, NUXEO_BASE_URL: 'http://localhost:8090/' }).nuxeoBaseUrl,
    ).toBe('http://localhost:8090');
  });

  it('rejects a non-numeric or negative PORT rather than silently defaulting', () => {
    expect(() => loadConfig({ ...VALID_ENV, PORT: 'abc' })).toThrow(/positive integer/);
    expect(() => loadConfig({ ...VALID_ENV, AGENT_MAX_STEPS: '-1' })).toThrow(/positive integer/);
  });

  // The regression this guards: someone adds NUXEO_AUTH "just for local dev",
  // a later change starts using it, and the gateway quietly begins querying
  // Nuxeo as a service account. It never reaches that point — it will not boot.
  it.each(FORBIDDEN_VARIABLES)('refuses to start when %s is set', (name) => {
    expect(() => loadConfig({ ...VALID_ENV, [name]: 'Administrator:Administrator' })).toThrow(
      ConfigurationError,
    );
  });

  it('explains why a Nuxeo credential is forbidden rather than just rejecting it', () => {
    try {
      loadConfig({ ...VALID_ENV, NUXEO_AUTH: 'admin:admin' });
      expect.unreachable('should have thrown');
    } catch (error) {
      expect((error as ConfigurationError).issues[0]).toMatch(/forwards the caller's own session/);
    }
  });
});
