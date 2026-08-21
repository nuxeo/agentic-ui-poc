import { TestBed } from '@angular/core/testing';

import type { NuxeoDocument } from '@agentic-ui/shared/nuxeo-client';

import { DOCUMENT_RULE_EVALUATORS } from './document-rules';
import { EMPTY_EXTENSION_RULE_CONTEXT, ExtensionRuleRegistry } from './extension-rules';
import {
  ExtensionSlotRegistry,
  NO_EXTENSION_SLOT_OVERRIDES,
  type ExtensionSlotOverrides,
} from './extension-slot-registry.service';
import { EXTENSION_SLOTS, type ExtensionElement } from './extension-slots';

interface TestAction extends ExtensionElement {
  readonly label?: string;
  readonly rule?: string;
}

function overrides(patch: Partial<ExtensionSlotOverrides>): ExtensionSlotOverrides {
  return { ...NO_EXTENSION_SLOT_OVERRIDES, ...patch };
}

function doc(permissions: string[]): NuxeoDocument {
  return {
    uid: 'uid-1',
    title: 'Doc',
    type: 'File',
    path: '/default-domain/doc',
    properties: {},
    contextParameters: { permissions },
  } as unknown as NuxeoDocument;
}

describe('ExtensionSlotRegistry', () => {
  let registry: ExtensionSlotRegistry;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    registry = TestBed.inject(ExtensionSlotRegistry);
    TestBed.inject(ExtensionRuleRegistry).registerRules(DOCUMENT_RULE_EVALUATORS);
  });

  it('resolves registered descriptors in ascending order, absent order last', () => {
    registry.register<TestAction>(EXTENSION_SLOTS.toolbar, [
      { id: 'app.toolbar.late' },
      { id: 'app.toolbar.second', order: 20 },
      { id: 'app.toolbar.first', order: 10 },
    ]);

    expect(registry.resolve<TestAction>(EXTENSION_SLOTS.toolbar).map((a) => a.id)).toEqual([
      'app.toolbar.first',
      'app.toolbar.second',
      'app.toolbar.late',
    ]);
  });

  it('replaces rather than duplicates when an id is registered twice', () => {
    registry.register<TestAction>(EXTENSION_SLOTS.toolbar, [
      { id: 'app.toolbar.delete', label: 'Delete' },
    ]);
    registry.register<TestAction>(EXTENSION_SLOTS.toolbar, [
      { id: 'app.toolbar.delete', label: 'Remove' },
    ]);

    const resolved = registry.resolve<TestAction>(EXTENSION_SLOTS.toolbar);
    expect(resolved).toHaveLength(1);
    expect(resolved[0].label).toBe('Remove');
  });

  it('drops descriptors the manifest hides', () => {
    registry.register<TestAction>(EXTENSION_SLOTS.toolbar, [
      { id: 'app.toolbar.delete' },
      { id: 'app.toolbar.download' },
    ]);

    const resolved = registry.resolve<TestAction>(
      EXTENSION_SLOTS.toolbar,
      overrides({ byId: { 'app.toolbar.delete': { visible: false } } }),
    );
    expect(resolved.map((a) => a.id)).toEqual(['app.toolbar.download']);
  });

  it('applies manifest label and order overrides', () => {
    registry.register<TestAction>(EXTENSION_SLOTS.toolbar, [
      { id: 'app.toolbar.a', label: 'A', order: 10 },
      { id: 'app.toolbar.b', label: 'B', order: 20 },
    ]);

    const resolved = registry.resolve<TestAction>(
      EXTENSION_SLOTS.toolbar,
      overrides({
        byId: {
          'app.toolbar.a': { order: 30 },
          'app.toolbar.b': { label: 'Renamed' },
        },
      }),
    );
    expect(resolved.map((a) => [a.id, a.label])).toEqual([
      ['app.toolbar.b', 'Renamed'],
      ['app.toolbar.a', 'A'],
    ]);
  });

  it('gates a descriptor behind a rule the manifest attaches', () => {
    registry.register<TestAction>(EXTENSION_SLOTS.toolbar, [{ id: 'app.toolbar.delete' }]);
    const gated = overrides({
      byId: { 'app.toolbar.delete': { rule: 'app.rules.canRemove' } },
    });

    expect(
      registry.resolve<TestAction>(EXTENSION_SLOTS.toolbar, gated, {
        ...EMPTY_EXTENSION_RULE_CONTEXT,
        document: doc(['Read']),
      }),
    ).toEqual([]);
    expect(
      registry.resolve<TestAction>(EXTENSION_SLOTS.toolbar, gated, {
        ...EMPTY_EXTENSION_RULE_CONTEXT,
        document: doc(['Remove']),
      }),
    ).toHaveLength(1);
  });

  it('lets an override clear a packaged rule with an explicit null', () => {
    registry.register<TestAction>(EXTENSION_SLOTS.toolbar, [
      { id: 'app.toolbar.delete', rule: 'app.rules.canRemove' },
    ]);

    expect(
      registry.resolve<TestAction>(EXTENSION_SLOTS.toolbar, NO_EXTENSION_SLOT_OVERRIDES, {
        ...EMPTY_EXTENSION_RULE_CONTEXT,
        document: doc(['Read']),
      }),
    ).toEqual([]);

    expect(
      registry.resolve<TestAction>(
        EXTENSION_SLOTS.toolbar,
        overrides({ byId: { 'app.toolbar.delete': { rule: null } } }),
        { ...EMPTY_EXTENSION_RULE_CONTEXT, document: doc(['Read']) },
      ),
    ).toHaveLength(1);
  });

  it('adds manifest-contributed descriptors and patches packaged ones by id', () => {
    registry.register<TestAction>(EXTENSION_SLOTS.navbar, [
      { id: 'app.navbar.browse', label: 'Browse', order: 10 },
    ]);

    const resolved = registry.resolve<TestAction>(
      EXTENSION_SLOTS.navbar,
      overrides({
        additions: {
          [EXTENSION_SLOTS.navbar]: [
            { id: 'app.navbar.browse', label: 'Repository' } as TestAction,
            { id: 'acme.navbar.contracts', label: 'Contracts', order: 5 } as TestAction,
          ],
        },
      }),
    );

    expect(resolved.map((a) => [a.id, a.label])).toEqual([
      ['acme.navbar.contracts', 'Contracts'],
      ['app.navbar.browse', 'Repository'],
    ]);
  });

  it('honours the upstream `disabled` flag', () => {
    registry.register<TestAction>(EXTENSION_SLOTS.tabs, [
      { id: 'app.tabs.a' },
      { id: 'app.tabs.b', disabled: true },
    ]);
    expect(registry.resolve<TestAction>(EXTENSION_SLOTS.tabs).map((t) => t.id)).toEqual([
      'app.tabs.a',
    ]);
  });

  /**
   * The hard design constraint from the phase brief: adding a tenth slot must
   * not require changing the nine.
   *
   * `'acme.reportPanel'` appears nowhere in this library — not in
   * `EXTENSION_SLOTS`, not in a union, not in a `switch`. If registration or
   * resolution had a central dispatch, this test could not pass without editing
   * it. That it passes is the proof that the addressable ceiling is backlog
   * rather than an irreversible decision.
   */
  it('supports a slot the library has never heard of, with no change to the nine', () => {
    const before = registry.registeredSlotIds();
    registry.register<TestAction>(EXTENSION_SLOTS.toolbar, [{ id: 'app.toolbar.delete' }]);
    const toolbarBefore = registry.resolve<TestAction>(EXTENSION_SLOTS.toolbar).map((a) => a.id);

    registry.register<TestAction>('acme.reportPanel', [
      { id: 'acme.reportPanel.summary', order: 10 },
      { id: 'acme.reportPanel.hidden', disabled: true },
    ]);

    // The new slot behaves exactly like a packaged one: ordering, `disabled`,
    // overrides and rule gating all work with no registration of the slot itself.
    expect(registry.resolve<TestAction>('acme.reportPanel').map((a) => a.id)).toEqual([
      'acme.reportPanel.summary',
    ]);
    expect(
      registry.resolve<TestAction>(
        'acme.reportPanel',
        overrides({ byId: { 'acme.reportPanel.summary': { visible: false } } }),
      ),
    ).toEqual([]);

    // And nothing about the nine changed.
    expect(registry.resolve<TestAction>(EXTENSION_SLOTS.toolbar).map((a) => a.id)).toEqual(
      toolbarBefore,
    );
    expect(before.every((slot) => registry.registeredSlotIds().includes(slot))).toBe(true);
  });

  describe('error paths', () => {
    it('resolves an unregistered slot to an empty list rather than throwing', () => {
      expect(() => registry.resolve('slot.that.does.not.exist')).not.toThrow();
      expect(registry.resolve('slot.that.does.not.exist')).toEqual([]);
    });

    it('ignores an override for an id that is not registered', () => {
      registry.register<TestAction>(EXTENSION_SLOTS.toolbar, [{ id: 'app.toolbar.delete' }]);
      expect(
        registry
          .resolve<TestAction>(
            EXTENSION_SLOTS.toolbar,
            overrides({ byId: { 'app.toolbar.typo': { visible: false } } }),
          )
          .map((a) => a.id),
      ).toEqual(['app.toolbar.delete']);
    });

    it('keeps a descriptor whose rule id is unknown, rather than hiding it', () => {
      registry.register<TestAction>(EXTENSION_SLOTS.toolbar, [
        { id: 'app.toolbar.delete', rule: 'acme.rules.notInThisBuild' },
      ]);
      expect(registry.resolve<TestAction>(EXTENSION_SLOTS.toolbar)).toHaveLength(1);
    });
  });
});
