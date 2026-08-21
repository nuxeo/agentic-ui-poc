import { TestBed } from '@angular/core/testing';

import { ExtensionActionRegistry, type ExtensionActionDescriptor } from './extension-actions';
import { EMPTY_EXTENSION_RULE_CONTEXT } from './extension-rules';

function descriptor(patch: Partial<ExtensionActionDescriptor>): ExtensionActionDescriptor {
  return { id: 'app.toolbar.delete', label: 'Delete', ...patch };
}

describe('ExtensionActionRegistry', () => {
  let registry: ExtensionActionRegistry;
  let calls: string[];

  beforeEach(() => {
    TestBed.configureTestingModule({});
    registry = TestBed.inject(ExtensionActionRegistry);
    calls = [];
  });

  it('runs the handler registered under the descriptor id', () => {
    registry.register({ 'app.toolbar.delete': { execute: () => calls.push('delete') } });
    expect(registry.execute(descriptor({}), EMPTY_EXTENSION_RULE_CONTEXT)).toBe(true);
    expect(calls).toEqual(['delete']);
  });

  it('prefers an explicit action id, so two descriptors can share one handler', () => {
    registry.register({ 'app.actions.download': { execute: () => calls.push('download') } });
    registry.execute(
      descriptor({ id: 'app.toolbar.export', action: 'app.actions.download' }),
      EMPTY_EXTENSION_RULE_CONTEXT,
    );
    registry.execute(
      descriptor({ id: 'app.contextMenu.export', action: 'app.actions.download' }),
      EMPTY_EXTENSION_RULE_CONTEXT,
    );
    expect(calls).toEqual(['download', 'download']);
  });

  it('passes the rule context through to the handler', () => {
    let seen: string | null = null;
    registry.register({
      'app.toolbar.delete': { execute: (context) => (seen = context.user.username) },
    });
    registry.execute(descriptor({}), {
      ...EMPTY_EXTENSION_RULE_CONTEXT,
      user: { username: 'jdoe', isAdministrator: false },
    });
    expect(seen).toBe('jdoe');
  });

  it('lets a later registration replace a packaged handler', () => {
    registry.register({ 'app.toolbar.delete': { execute: () => calls.push('packaged') } });
    registry.register({ 'app.toolbar.delete': { execute: () => calls.push('acme') } });
    registry.execute(descriptor({}), EMPTY_EXTENSION_RULE_CONTEXT);
    expect(calls).toEqual(['acme']);
  });

  it('lists registered ids for the reference doc', () => {
    registry.register({
      'app.toolbar.delete': { execute: () => undefined },
      'app.toolbar.edit': { execute: () => undefined },
    });
    expect(registry.registeredActionIds()).toEqual(['app.toolbar.delete', 'app.toolbar.edit']);
  });

  describe('error paths', () => {
    it('is inert rather than throwing when nothing is registered under the id', () => {
      expect(registry.has('app.toolbar.delete')).toBe(false);
      expect(() => registry.execute(descriptor({}), EMPTY_EXTENSION_RULE_CONTEXT)).not.toThrow();
      expect(registry.execute(descriptor({}), EMPTY_EXTENSION_RULE_CONTEXT)).toBe(false);
    });

    it('stops running a handler after it is unregistered', () => {
      registry.register({ 'app.toolbar.delete': { execute: () => calls.push('delete') } });
      registry.unregister(['app.toolbar.delete']);
      expect(registry.execute(descriptor({}), EMPTY_EXTENSION_RULE_CONTEXT)).toBe(false);
      expect(calls).toEqual([]);
    });

    it('ignores unregistering an id that was never registered', () => {
      expect(() => registry.unregister(['nope'])).not.toThrow();
    });
  });
});
