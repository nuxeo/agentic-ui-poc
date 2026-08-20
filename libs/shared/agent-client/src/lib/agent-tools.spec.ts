import { describe, expect, it } from 'vitest';

import { FRONTEND_AGENT_TOOLS, toolRequiresApproval } from './agent-tools';
import { agentCapabilitiesUrl, agentRunUrl } from './agent.config';

describe('frontend agent tools', () => {
  it('declares exactly the four tools the gateway advertises', () => {
    expect(FRONTEND_AGENT_TOOLS.map((tool) => tool.name)).toEqual([
      'confirmAction',
      'navigateTo',
      'applyMetadata',
      'selectDocuments',
    ]);
  });

  /**
   * These literals are the contract, and this declaration is the authoritative side of it:
   * `RunAgentInput.tools` is what reaches the model, so the model calls these names and no
   * others. `apps/agent-gateway/src/tools/frontend-tools.spec.ts` pins the same literals on
   * the gateway side — it cannot import this file, being a Node process rather than Angular.
   *
   * `applyMetadata.docId` is the one that already bit: the gateway declared `uid` while the
   * browser handler in `ai-chat-panel.component.ts` reads `args['docId']` and refuses the
   * write when it is absent. The model would do as it was told, the write would never
   * happen, and the failure would read like a model mistake.
   */
  it.each([
    ['confirmAction', ['summary', 'action', 'details'], ['summary']],
    ['navigateTo', ['route', 'reason'], ['route']],
    ['applyMetadata', ['docId', 'properties'], ['docId', 'properties']],
    ['selectDocuments', ['docIds'], ['docIds']],
  ])(
    'declares %s with the argument names the browser handler reads',
    (name, properties, required) => {
      const tool = FRONTEND_AGENT_TOOLS.find((entry) => entry.name === name);
      const parameters = tool?.parameters as
        | { properties?: Record<string, unknown>; required?: string[] }
        | undefined;

      expect(Object.keys(parameters?.properties ?? {})).toEqual(properties);
      expect(parameters?.required).toEqual(required);
    },
  );

  it('gives the model a description for every tool and every argument', () => {
    for (const tool of FRONTEND_AGENT_TOOLS) {
      expect(tool.description.length).toBeGreaterThan(20);
      const properties = (tool.parameters as { properties?: Record<string, unknown> }).properties;
      for (const [argument, schema] of Object.entries(properties ?? {})) {
        expect(
          (schema as { description?: string }).description,
          `${tool.name}.${argument}`,
        ).toBeTruthy();
      }
    }
  });

  it('gates the mutating tools behind human approval and lets read-only ones through', () => {
    expect(toolRequiresApproval('applyMetadata')).toBe(true);
    expect(toolRequiresApproval('confirmAction')).toBe(true);
    expect(toolRequiresApproval('navigateTo')).toBe(false);
    expect(toolRequiresApproval('selectDocuments')).toBe(false);
  });
});

/**
 * RFC 6265 §5.1.4 path-match, which is the rule that decides whether the browser
 * attaches a cookie to a request. Written out rather than asserted against string
 * prefixes because the property under test *is* this rule: the endpoints have to sit
 * where `JSESSIONID` is sent, and "starts with /nuxeo" is a restatement of the answer
 * rather than a check of it.
 */
function cookiePathMatches(cookiePath: string, requestPath: string): boolean {
  if (requestPath === cookiePath) return true;
  if (!requestPath.startsWith(cookiePath)) return false;
  return cookiePath.endsWith('/') || requestPath[cookiePath.length] === '/';
}

/** What Nuxeo actually answers: `Set-Cookie: JSESSIONID=…; Path=/nuxeo; HttpOnly`. */
const NUXEO_SESSION_COOKIE_PATH = '/nuxeo';

describe('agent endpoints', () => {
  it('builds same-origin absolute paths by default', () => {
    expect(agentRunUrl('')).toBe('/nuxeo/agent/run');
    expect(agentCapabilitiesUrl('')).toBe('/nuxeo/agent/capabilities');
  });

  it('does not double the separator when a base URL is configured', () => {
    expect(agentRunUrl('https://nuxeo.example.com/')).toBe(
      'https://nuxeo.example.com/nuxeo/agent/run',
    );
  });

  // The regression test. A gateway published outside the Nuxeo session cookie's `Path`
  // is same-origin and still receives no credential: the browser withholds
  // `JSESSIONID`, `resolveCaller`'s `GET /me` is rejected, and the run returns 401 while
  // the rest of the application — every request of which *is* under `/nuxeo/` — keeps
  // working. It surfaces as "The assistant is unavailable. Check the connection and try
  // again." beside a lit AGENT badge, because the capability probe needs no credential.
  //
  // The other assertions here and in `agent-runtime.http.spec.ts` pin the literal string,
  // which is why they let the defect through: they agree with whatever the constant says,
  // so anyone moving the mount point just updates them and the suite stays green. This one
  // asserts the reason the string has to be what it is.
  it('puts the run inside the Nuxeo session cookie path, so the browser sends JSESSIONID', () => {
    expect(cookiePathMatches(NUXEO_SESSION_COOKIE_PATH, agentRunUrl(''))).toBe(true);
    expect(cookiePathMatches(NUXEO_SESSION_COOKIE_PATH, agentCapabilitiesUrl(''))).toBe(true);
  });

  it('proves that rule has teeth: the old /agent path is outside the cookie scope', () => {
    expect(cookiePathMatches(NUXEO_SESSION_COOKIE_PATH, '/agent/run')).toBe(false);
    // Nor does a sibling that merely shares the prefix as text.
    expect(cookiePathMatches(NUXEO_SESSION_COOKIE_PATH, '/nuxeoagent/run')).toBe(false);
  });
});
