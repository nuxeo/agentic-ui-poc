/**
 * Layer 0/1 runtime manifest — the configuration a customer edits day to day.
 *
 * It is loaded from a Nuxeo document rather than a file on disk, which buys
 * versioning, audit, ACLs and per-tenant scoping for free, lets the manifest be
 * edited from the application itself, and puts it somewhere the marketplace
 * installer cannot reach.
 *
 * Phase 1 loads, validates and exposes the manifest, and consumes `labels` and
 * `featureToggles`. `navItems`, `actions`, `rules` and `presets` are declared
 * here so the document schema is stable from the start; the registry that
 * resolves them by ID arrives in Phase 2.
 */

export interface ManifestNavItem {
  readonly id: string;
  readonly label: string;
  readonly route: string;
  readonly icon: string;
  readonly order: number;
  readonly visible: boolean;
}

export interface ManifestAction {
  /** Hide a packaged action without a rebuild. */
  readonly visible: boolean;
  /** ID of a registered rule that further gates visibility. Resolved in Phase 2. */
  readonly rule: string | null;
  /** Overrides the packaged label when set. */
  readonly label: string | null;
  readonly order: number | null;
}

export interface AppRuntimeManifest {
  /** Schema version of the document, so a future loader can migrate rather than guess. */
  readonly version: number;
  readonly navItems: readonly ManifestNavItem[];
  /** Keyed by registered action ID. */
  readonly actions: Readonly<Record<string, ManifestAction>>;
  /** Keyed by registered rule ID; `false` disables the rule. */
  readonly rules: Readonly<Record<string, boolean>>;
  /** Named parameter sets — search presets, column layouts, import defaults. */
  readonly presets: Readonly<Record<string, unknown>>;
  readonly featureToggles: Readonly<Record<string, boolean>>;
  /**
   * Translation overrides, merged over the shipped catalogue for every language.
   * This is how a customer relabels the product without touching a bundle.
   */
  readonly labels: Readonly<Record<string, string>>;
  /**
   * The Layer 1 extension config — slot contributions, per-id overrides and
   * `$references` layering.
   *
   * Held **opaquely** on purpose. Its schema belongs to
   * `@agentic-ui/shared/extensions`, which parses it with
   * `readExtensionConfig()`; keeping the type out of this library is what stops
   * the configuration loader depending on the registry it configures. This
   * whole subtree is passed through unvalidated by design — the registry
   * validates it, and it must tolerate whatever a customer saved.
   */
  readonly extensions: Readonly<Record<string, unknown>>;
}

/** An empty manifest: no overrides, so the packaged behaviour stands unchanged. */
export const DEFAULT_APP_RUNTIME_MANIFEST: AppRuntimeManifest = {
  version: 1,
  navItems: [],
  actions: {},
  rules: {},
  presets: {},
  featureToggles: {},
  labels: {},
  extensions: {},
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readNavItems(value: unknown): readonly ManifestNavItem[] {
  if (!Array.isArray(value)) return DEFAULT_APP_RUNTIME_MANIFEST.navItems;
  const items: ManifestNavItem[] = [];
  value.forEach((entry, index) => {
    if (!isRecord(entry)) return;
    const id = entry['id'];
    const route = entry['route'];
    // Without an ID there is nothing to address, and without a route nothing to
    // navigate to — an entry missing either is dropped, not defaulted.
    if (typeof id !== 'string' || id.trim() === '') return;
    if (typeof route !== 'string' || route.trim() === '') return;
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

function readActions(value: unknown): Readonly<Record<string, ManifestAction>> {
  if (!isRecord(value)) return DEFAULT_APP_RUNTIME_MANIFEST.actions;
  const actions: Record<string, ManifestAction> = {};
  for (const [id, entry] of Object.entries(value)) {
    if (!isRecord(entry)) continue;
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

function readBooleanMap(value: unknown): Readonly<Record<string, boolean>> {
  if (!isRecord(value)) return {};
  const map: Record<string, boolean> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === 'boolean') map[key] = entry;
  }
  return map;
}

function readStringMap(value: unknown): Readonly<Record<string, string>> {
  if (!isRecord(value)) return {};
  const map: Record<string, string> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (typeof entry === 'string') map[key] = entry;
  }
  return map;
}

/**
 * Overlay a parsed manifest document onto the defaults.
 *
 * Total in the same way as {@link mergeBootstrapConfig}: a customer who saves a
 * broken manifest must get the packaged application back, not a blank screen.
 */
export function mergeRuntimeManifest(base: AppRuntimeManifest, patch: unknown): AppRuntimeManifest {
  if (!isRecord(patch)) return base;
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
    // Passed through whole rather than deep-merged here. The `$references`
    // layering inside this subtree has its own semantics, implemented once in
    // `@agentic-ui/shared/extensions`; a second, shallower merge at this level
    // would silently disagree with it.
    extensions: isRecord(patch['extensions']) ? patch['extensions'] : base.extensions,
  };
}

/**
 * Parse the manifest JSON out of a Nuxeo document property.
 *
 * Returns `null` rather than throwing: an absent or malformed configuration
 * document is a supported state, not an error the shell should surface.
 */
export function parseRuntimeManifest(raw: unknown): AppRuntimeManifest | null {
  if (typeof raw !== 'string' || raw.trim() === '') return null;
  try {
    return mergeRuntimeManifest(DEFAULT_APP_RUNTIME_MANIFEST, JSON.parse(raw));
  } catch {
    return null;
  }
}
