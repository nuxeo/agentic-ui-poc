/**
 * Layer 0/1 runtime manifest.
 *
 * Contributed by Marketplace packages as `manifest` fragments to the server's configuration
 * service and served, in contribution order, at `agentic-ui-config/manifest.json`. The browser
 * folds the fragments over {@link DEFAULT_APP_RUNTIME_MANIFEST} with
 * {@link mergeRuntimeManifest}, so a later package wins key by key.
 */
/** An empty manifest: no overrides, so the packaged behaviour stands unchanged. */
export const DEFAULT_APP_RUNTIME_MANIFEST = {
    version: 1,
    navItems: [],
    actions: {},
    rules: {},
    presets: {},
    featureToggles: {},
    labels: {},
    extensionLayers: [],
};
function isRecord(value) {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}
function readNavItems(value) {
    if (!Array.isArray(value))
        return DEFAULT_APP_RUNTIME_MANIFEST.navItems;
    const items = [];
    value.forEach((entry, index) => {
        if (!isRecord(entry))
            return;
        const id = entry['id'];
        const route = entry['route'];
        // Without an ID there is nothing to address, and without a route nothing to
        // navigate to — an entry missing either is dropped, not defaulted.
        if (typeof id !== 'string' || id.trim() === '')
            return;
        if (typeof route !== 'string' || route.trim() === '')
            return;
        const label = entry['label'];
        const icon = entry['icon'];
        const order = entry['order'];
        const visible = entry['visible'];
        items.push({
            id,
            route,
            label: typeof label === 'string' ? label : id,
            icon: typeof icon === 'string' ? icon : 'folder',
            order: typeof order === 'number' && Number.isFinite(order) ? order : index,
            visible: typeof visible === 'boolean' ? visible : true,
        });
    });
    return items;
}
function readActions(value) {
    if (!isRecord(value))
        return DEFAULT_APP_RUNTIME_MANIFEST.actions;
    const actions = {};
    for (const [id, entry] of Object.entries(value)) {
        if (!isRecord(entry))
            continue;
        const visible = entry['visible'];
        const rule = entry['rule'];
        const label = entry['label'];
        const order = entry['order'];
        actions[id] = {
            visible: typeof visible === 'boolean' ? visible : true,
            rule: typeof rule === 'string' ? rule : null,
            label: typeof label === 'string' ? label : null,
            order: typeof order === 'number' && Number.isFinite(order) ? order : null,
        };
    }
    return actions;
}
function readBooleanMap(value) {
    if (!isRecord(value))
        return {};
    const map = {};
    for (const [key, entry] of Object.entries(value)) {
        if (typeof entry === 'boolean')
            map[key] = entry;
    }
    return map;
}
function readStringMap(value) {
    if (!isRecord(value))
        return {};
    const map = {};
    for (const [key, entry] of Object.entries(value)) {
        if (typeof entry === 'string')
            map[key] = entry;
    }
    return map;
}
/**
 * Overlay one manifest fragment onto the manifest built so far.
 *
 * Total in the same way as {@link mergeBootstrapConfig}: a package that contributes a
 * malformed fragment must get the packaged application back, not a blank screen.
 */
export function mergeRuntimeManifest(base, patch) {
    if (!isRecord(patch))
        return base;
    const version = patch['version'];
    return {
        version: typeof version === 'number' && Number.isFinite(version) ? version : base.version,
        navItems: patch['navItems'] === undefined ? base.navItems : readNavItems(patch['navItems']),
        actions: { ...base.actions, ...readActions(patch['actions']) },
        rules: { ...base.rules, ...readBooleanMap(patch['rules']) },
        presets: isRecord(patch['presets']) ? { ...base.presets, ...patch['presets'] } : base.presets,
        featureToggles: {
            ...base.featureToggles,
            ...readBooleanMap(patch['featureToggles']),
        },
        labels: { ...base.labels, ...readStringMap(patch['labels']) },
        // Appended as a layer rather than merged here. The merge of this subtree has its own
        // semantics, implemented once in `@nuxeo/satori-platform/extensions`; a second, shallower
        // merge at this level would silently disagree with it.
        extensionLayers: isRecord(patch['extensions'])
            ? [...base.extensionLayers, patch['extensions']]
            : base.extensionLayers,
    };
}
