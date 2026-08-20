import { describe, expect, it } from 'vitest';

import { FRONTEND_TOOL_CONTRACTS, FRONTEND_TOOL_NAMES } from './frontend-tools';

/**
 * These contracts mirror `FRONTEND_AGENT_TOOLS` in
 * `libs/shared/agent-client/src/lib/agent-tools.ts`, which is what the browser
 * actually sends in `RunAgentInput.tools` and therefore what the model sees.
 *
 * The gateway cannot import that file — it is Angular, this is a Node process —
 * so the argument names are pinned here as literals. That is deliberate: a
 * rename on either side breaks a tool call in a way nothing else catches. The
 * model would send `uid`, the browser handler would read `docId`, find nothing,
 * and answer "Refused: the metadata update was missing a document" — a failure
 * that looks like a model mistake and is not.
 */
describe('frontend tool contracts', () => {
  it('declares exactly the four the chat surface implements', () => {
    expect([...FRONTEND_TOOL_NAMES]).toEqual([
      'confirmAction',
      'navigateTo',
      'applyMetadata',
      'selectDocuments',
    ]);
  });

  it.each([
    ['confirmAction', ['summary', 'action', 'details'], ['summary']],
    ['navigateTo', ['route', 'reason'], ['route']],
    ['applyMetadata', ['docId', 'properties'], ['docId', 'properties']],
    ['selectDocuments', ['docIds'], ['docIds']],
  ])('%s takes the argument names the browser handler reads', (name, properties, required) => {
    const contract = FRONTEND_TOOL_CONTRACTS.find((entry) => entry.name === name);

    expect(Object.keys(contract?.parameters.properties ?? {})).toEqual(properties);
    expect(contract?.parameters.required).toEqual(required);
  });

  // `confirmAction` is answered by the approval verdict rather than by a browser
  // handler, so it is the only one whose result is structured.
  it('expects a verdict object back from confirmAction and a sentence from the rest', () => {
    const resultTypes = FRONTEND_TOOL_CONTRACTS.map((contract) => [
      contract.name,
      contract.result.type,
    ]);

    expect(resultTypes).toEqual([
      ['confirmAction', 'object'],
      ['navigateTo', 'string'],
      ['applyMetadata', 'string'],
      ['selectDocuments', 'string'],
    ]);
  });

  it('gives the model a description for every tool and every argument', () => {
    for (const contract of FRONTEND_TOOL_CONTRACTS) {
      expect(contract.description.length).toBeGreaterThan(20);
      for (const [argument, schema] of Object.entries(contract.parameters.properties)) {
        expect(
          (schema as { description?: string }).description,
          `${contract.name}.${argument}`,
        ).toBeTruthy();
      }
    }
  });
});
