import {
  EMPTY_EXTENSION_RULE_CONTEXT,
  ExtensionActionRegistry,
  PACKAGED_BULK_ACTIONS,
} from '@nuxeo-satori/platform/extensions';

import { SCOPE_A_BLOCKED_BULK_ACTION_IDS, scopeABulkActionHandlers } from './scope-a-bulk-actions';

describe('scopeABulkActionHandlers', () => {
  const descriptor = (id: string) => {
    const found = PACKAGED_BULK_ACTIONS.find((action) => action.id === id);
    if (!found) throw new Error(`${id} is not a packaged bulk action`);
    return found;
  };

  function registryWithShellHandlers(calls: string[]): ExtensionActionRegistry {
    const registry = new ExtensionActionRegistry();
    const shell: Record<string, { execute: () => void }> = {};
    for (const action of PACKAGED_BULK_ACTIONS) {
      shell[action.id] = { execute: () => calls.push(`shell:${action.id}`) };
    }
    registry.register(shell);
    return registry;
  }

  it('blocks only packaged ids, so a renamed action cannot silently escape the block', () => {
    for (const id of SCOPE_A_BLOCKED_BULK_ACTION_IDS) {
      expect(() => descriptor(id)).not.toThrow();
    }
  });

  it('shows the notice instead of running Delete, Publish or Add to Collection', () => {
    const calls: string[] = [];
    const registry = registryWithShellHandlers(calls);
    registry.register(scopeABulkActionHandlers((label) => calls.push(`notice:${label}`)));

    for (const id of SCOPE_A_BLOCKED_BULK_ACTION_IDS) {
      registry.execute(descriptor(id), EMPTY_EXTENSION_RULE_CONTEXT);
    }

    expect(calls).toEqual([
      'notice:Add to Collection',
      'notice:Publish Document',
      'notice:Delete selected',
    ]);
  });

  it('leaves the read-only bulk actions running the shell handlers', () => {
    const calls: string[] = [];
    const registry = registryWithShellHandlers(calls);
    registry.register(scopeABulkActionHandlers((label) => calls.push(`notice:${label}`)));

    for (const id of [
      'app.bulkActions.downloadZip',
      'app.bulkActions.compare',
      'app.bulkActions.addToClipboard',
    ]) {
      registry.execute(descriptor(id), EMPTY_EXTENSION_RULE_CONTEXT);
    }

    expect(calls).toEqual([
      'shell:app.bulkActions.downloadZip',
      'shell:app.bulkActions.compare',
      'shell:app.bulkActions.addToClipboard',
    ]);
  });

  it('restores the shell handlers once withdrawn, so production browse keeps real Delete', () => {
    const calls: string[] = [];
    const registry = registryWithShellHandlers(calls);
    const registration = registry.register(scopeABulkActionHandlers(() => calls.push('notice')));

    registration.unregister();
    registry.execute(descriptor('app.bulkActions.delete'), EMPTY_EXTENSION_RULE_CONTEXT);

    expect(calls).toEqual(['shell:app.bulkActions.delete']);
  });
});
