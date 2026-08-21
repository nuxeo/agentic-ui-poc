import {
  mergeExtensionConfigs,
  readExtensionConfig,
  resolveExtensionConfig,
  type ExtensionConfig,
} from './extension-config';

describe('mergeExtensionConfigs', () => {
  it('lets a later layer win on a scalar', () => {
    const merged = mergeExtensionConfigs(
      { overrides: { 'app.toolbar.delete': { visible: true } } },
      { overrides: { 'app.toolbar.delete': { visible: false } } },
    );
    expect(merged.overrides?.['app.toolbar.delete'].visible).toBe(false);
  });

  it('merges arrays of descriptors by id rather than concatenating them', () => {
    const merged = mergeExtensionConfigs(
      { slots: { navbar: [{ id: 'app.navbar.browse', order: 30 }] } } as ExtensionConfig,
      { slots: { navbar: [{ id: 'app.navbar.browse', order: 5 }] } } as ExtensionConfig,
    );
    expect(merged.slots?.['navbar']).toEqual([{ id: 'app.navbar.browse', order: 5 }]);
  });

  it('appends a descriptor a later layer introduces', () => {
    const merged = mergeExtensionConfigs(
      { slots: { navbar: [{ id: 'app.navbar.browse' }] } } as ExtensionConfig,
      { slots: { navbar: [{ id: 'acme.navbar.contracts' }] } } as ExtensionConfig,
    );
    expect(merged.slots?.['navbar'].map((entry) => entry.id)).toEqual([
      'app.navbar.browse',
      'acme.navbar.contracts',
    ]);
  });

  it('replaces rather than merges when a key uses the $replace suffix', () => {
    const merged = mergeExtensionConfigs({ slots: { navbar: [{ id: 'app.navbar.browse' }] } }, {
      'slots.$replace': { navbar: [{ id: 'acme.navbar.only' }] },
    } as unknown as ExtensionConfig);
    expect(merged.slots?.['navbar'].map((entry) => entry.id)).toEqual(['acme.navbar.only']);
  });

  it('does not merge $-prefixed metadata into the result', () => {
    const merged = mergeExtensionConfigs(
      { $name: 'packaged', $references: ['acme'] },
      { $name: 'acme', overrides: {} },
    );
    expect(merged.$name).toBeUndefined();
    expect(merged.$references).toBeUndefined();
  });

  it('returns an empty config when given nothing usable', () => {
    expect(mergeExtensionConfigs()).toEqual({});
    expect(mergeExtensionConfigs(...([null, undefined] as unknown as ExtensionConfig[]))).toEqual(
      {},
    );
  });
});

describe('resolveExtensionConfig', () => {
  const root: ExtensionConfig = {
    $references: ['base', 'acme'],
    $layers: {
      base: { overrides: { 'app.toolbar.delete': { visible: true, label: 'Delete' } } },
      acme: { overrides: { 'app.toolbar.delete': { label: 'Bin it' } } },
    },
  };

  it('applies referenced layers in order, with the last file winning', () => {
    const { config, applied, missing } = resolveExtensionConfig(root);
    expect(applied).toEqual(['base', 'acme']);
    expect(missing).toEqual([]);
    expect(config.overrides?.['app.toolbar.delete']).toEqual({ visible: true, label: 'Bin it' });
  });

  it('drops a layer named in $ignoreReferenceList', () => {
    const { config, applied } = resolveExtensionConfig({
      ...root,
      $ignoreReferenceList: ['acme'],
    });
    expect(applied).toEqual(['base']);
    expect(config.overrides?.['app.toolbar.delete'].label).toBe('Delete');
  });

  it('reports a referenced layer that cannot be resolved instead of failing', () => {
    const { config, applied, missing } = resolveExtensionConfig({
      $references: ['base', 'absent'],
      $layers: { base: { overrides: { 'app.toolbar.a': { visible: false } } } },
    });
    expect(applied).toEqual(['base']);
    expect(missing).toEqual(['absent']);
    expect(config.overrides?.['app.toolbar.a'].visible).toBe(false);
  });

  it('accepts an external layer resolver, so layers need not live in the document', () => {
    const { config, applied } = resolveExtensionConfig({ $references: ['remote'] }, (name) =>
      name === 'remote' ? { overrides: { 'app.toolbar.x': { visible: false } } } : null,
    );
    expect(applied).toEqual(['remote']);
    expect(config.overrides?.['app.toolbar.x'].visible).toBe(false);
  });

  it('returns the root untouched when there are no references', () => {
    const config: ExtensionConfig = { overrides: { 'app.toolbar.a': { order: 1 } } };
    expect(resolveExtensionConfig(config).config.overrides).toEqual(config.overrides);
  });

  it('ignores a layer body that is not an object', () => {
    const { applied, missing } = resolveExtensionConfig(
      { $references: ['bad'] },
      () => 'not an object' as unknown as ExtensionConfig,
    );
    expect(applied).toEqual([]);
    expect(missing).toEqual(['bad']);
  });
});

describe('readExtensionConfig', () => {
  it('reads slots and overrides out of untrusted JSON', () => {
    const config = readExtensionConfig({
      $name: 'acme',
      slots: { navbar: [{ id: 'acme.navbar.contracts', label: 'Contracts' }] },
      overrides: { 'app.toolbar.delete': { visible: false } },
    });
    expect(config.$name).toBe('acme');
    expect(config.slots?.['navbar']).toHaveLength(1);
    expect(config.overrides?.['app.toolbar.delete'].visible).toBe(false);
  });

  it('drops a slot entry with no usable id, because it could never be addressed', () => {
    const config = readExtensionConfig({
      slots: { navbar: [{ id: '  ' }, { label: 'no id' }, { id: 'acme.navbar.ok' }] },
    });
    expect(config.slots?.['navbar'].map((entry) => entry.id)).toEqual(['acme.navbar.ok']);
  });

  it('tolerates the shapes a customer can actually save', () => {
    expect(readExtensionConfig(null)).toEqual({});
    expect(readExtensionConfig('a string')).toEqual({});
    expect(readExtensionConfig([1, 2, 3])).toEqual({});
    expect(readExtensionConfig({ slots: 'not an object' })).toEqual({});
    expect(readExtensionConfig({ slots: { navbar: 'not an array' } }).slots).toEqual({});
    expect(readExtensionConfig({ overrides: { 'app.a': 'not an object' } }).overrides).toEqual({});
  });
});
