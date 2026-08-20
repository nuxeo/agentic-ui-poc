import { describe, expect, it } from 'vitest';

import { NuxeoRestClient } from '../nuxeo/nuxeo-rest-client';
import {
  recordingFetch,
  testCaller,
  testLogger,
  TEST_NUXEO_BASE_URL,
} from '../testing/test-doubles';
import { createDefaultToolRegistry, DEFAULT_TOOLS } from './default-registry';
import { FRONTEND_TOOL_NAMES } from './frontend-tools';
import { UnknownToolError } from './mutation-policy';
import { DuplicateToolError, ToolRegistry, type ToolExecutionContext } from './tool-registry';
import type { AgentTool } from './tool.types';

const stubTool = (name: string): AgentTool => ({
  name,
  description: `stub ${name}`,
  parameters: { type: 'object', properties: {} },
  execute: async () => ({ ok: true }),
});

function executionContext(): ToolExecutionContext {
  return {
    caller: testCaller(),
    nuxeo: new NuxeoRestClient(TEST_NUXEO_BASE_URL, recordingFetch().fetchImpl),
    signal: new AbortController().signal,
    logger: testLogger(),
    approval: { toolCallId: 'call-1', granted: false },
  };
}

describe('ToolRegistry', () => {
  it('registers and retrieves tools by name', () => {
    const registry = new ToolRegistry().register(stubTool('a')).register(stubTool('b'));

    expect(registry.names()).toEqual(['a', 'b']);
    expect(registry.get('a')?.description).toBe('stub a');
    expect(registry.has('missing')).toBe(false);
  });

  // Silent shadowing would show up only as the model picking the wrong tool,
  // weeks later and in production.
  it('refuses a duplicate name instead of shadowing', () => {
    const registry = new ToolRegistry().register(stubTool('a'));
    expect(() => registry.register(stubTool('a'))).toThrow(DuplicateToolError);
  });

  it('supports removing a tool, so a deployment can drop capabilities', () => {
    const registry = new ToolRegistry().register(stubTool('a'));
    expect(registry.unregister('a')).toBe(true);
    expect(registry.unregister('a')).toBe(false);
    expect(registry.list()).toHaveLength(0);
  });

  // `execute` is the choke point the mutation gate sits on, so it is also where
  // the unknown-tool and read-only paths have to keep working. The refusals
  // themselves are exercised adversarially in agent/approval-gate.spec.ts.
  it('runs a tool that declared itself read-only', async () => {
    const registry = new ToolRegistry().register({ ...stubTool('a'), mutating: false });

    await expect(registry.execute('a', {}, executionContext())).resolves.toEqual({ ok: true });
  });

  it('refuses a name it does not have rather than returning undefined', async () => {
    await expect(
      new ToolRegistry().execute('missing', {}, executionContext()),
    ).rejects.toBeInstanceOf(UnknownToolError);
  });

  it('passes the arguments and the context straight through', async () => {
    let seen: unknown;
    const registry = new ToolRegistry().register({
      ...stubTool('a'),
      mutating: false,
      execute: async (args) => {
        seen = args;
        return { ok: true };
      },
    });

    await registry.execute('a', { uid: 'doc-1' }, executionContext());
    expect(seen).toEqual({ uid: 'doc-1' });
  });

  it('projects tools into the model function-schema shape', () => {
    const schemas = new ToolRegistry().register(stubTool('a')).toModelSchemas();

    expect(schemas).toEqual([
      {
        type: 'function',
        function: {
          name: 'a',
          description: 'stub a',
          parameters: { type: 'object', properties: {} },
        },
      },
    ]);
  });
});

describe('createDefaultToolRegistry', () => {
  it('registers the shipped tool set', () => {
    const registry = createDefaultToolRegistry();
    expect(registry.names()).toEqual(DEFAULT_TOOLS.map((tool) => tool.name));
  });

  it('supports excluding tools and adding custom ones', () => {
    const registry = createDefaultToolRegistry({
      exclude: ['nuxeo.moveDocuments'],
      additional: [stubTool('custom.thing')],
    });

    expect(registry.has('nuxeo.moveDocuments')).toBe(false);
    expect(registry.has('custom.thing')).toBe(true);
  });

  it('covers every capability the plan funds for the tool layer', () => {
    const names = new Set(createDefaultToolRegistry().names());

    for (const required of [
      'nuxeo.searchDocuments',
      'nuxeo.getDocument',
      'nuxeo.listChildren',
      'nuxeo.tagDocument',
      'ai.classifyDocument',
      'ai.summarizeDocument',
      'ai.findSimilarDocuments',
      'nuxeo.completeTask',
      'nuxeo.startWorkflow',
      'kd.ask',
      'nuxeo.getDocumentAcls',
      'nuxeo.getAuditHistory',
      'ai.detectAuditAnomalies',
      'nuxeo.updateMetadata',
      'nuxeo.bulkUpdateMetadata',
      'nuxeo.moveDocuments',
      'nuxeo.createCollection',
      'nuxeo.addToCollection',
      'nuxeo.saveSearch',
      'ke.enrichDocument',
    ]) {
      expect(names.has(required), `missing tool ${required}`).toBe(true);
    }
  });

  it('flags the state-changing tools, which is what makes them unrunnable unapproved', () => {
    const registry = createDefaultToolRegistry();
    const mutating = registry
      .list()
      .filter((tool) => tool.mutating)
      .map((tool) => tool.name);

    expect(mutating).toContain('nuxeo.moveDocuments');
    expect(mutating).toContain('nuxeo.bulkUpdateMetadata');
    expect(mutating).toContain('nuxeo.completeTask');
    expect(mutating).not.toContain('nuxeo.searchDocuments');
  });

  it('does not register the frontend tools server-side — the browser owns them', () => {
    const registry = createDefaultToolRegistry();
    for (const name of FRONTEND_TOOL_NAMES) {
      expect(registry.has(name)).toBe(false);
    }
  });
});

// The contracts themselves are pinned in frontend-tools.spec.ts, against the
// argument names the browser handlers actually read.
