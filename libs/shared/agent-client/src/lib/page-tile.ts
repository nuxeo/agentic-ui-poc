import { InjectionToken, inject, type Provider, type Type } from '@angular/core';

/**
 * Page Builder: registry for tiles users can compose into their own pages.
 *
 * This is the THIRD registry following the same pattern as `AGENT_WIDGETS` and
 * `AGENT_FORM_COMPONENTS`. Each has a different prop contract, kept separate to
 * preserve their distinct guarantees:
 *
 * - **Chat widgets** (`AGENT_WIDGETS`): props are identifiers/enums only,
 *   never content. The agent proposes; the app mounts read-only views.
 * - **Form components** (`AGENT_FORM_COMPONENTS`): props carry gateway-resolved
 *   content (field labels, values) because they render approval gates for writes.
 * - **Page tiles** (this registry): props may include authored content (titles,
 *   queries) because they are user-configured, not agent-proposed. Tiles may
 *   include write actions because the user clicked them on their own page.
 *
 * The separation exists because admitting one member with a relaxed prop rule to
 * a stricter registry would demote that rule from a property of the registry to
 * a property of some of its members. See ADR 001 "The two channels get two
 * registries" and §5 of `docs/component-library-page-builder-analysis.md`.
 *
 * ## Security model differences from chat widgets
 *
 * 1. **Authored content in props is permitted.** A tile's `title` and `query`
 *    are set by the page author, not by an LLM. When shared, the viewer sees
 *    those values as authored content, not system labels. XSS prevention applies
 *    (Angular template binding only), plus length caps.
 * 2. **Write actions from tiles are permitted.** A user clicking "remove from
 *    favorites" on their own page is fine. The restriction on chat widgets exists
 *    because agent-caused writes must go through the approval gate; user-caused
 *    writes from a mounted page are ordinary interactions.
 * 3. **ACL enforcement is still Nuxeo's.** Tiles receive only identifiers for
 *    documents; the viewer's browser re-fetches under the viewer's session, so a
 *    shared page shows fewer rows if the viewer cannot see all referenced docs.
 *
 * ## Tile configuration schema
 *
 * Unlike chat widgets which have no display metadata, page tiles declare:
 * - `displayName`: shown in the palette ("Recent Documents")
 * - `description`: hover text in the palette
 * - `icon`: Material icon name
 * - `configSchema`: JSON Schema describing the tile's configuration form
 * - `defaultWidth`: preferred width ('half' | 'full')
 * - `supportedWidths`: which widths the tile can render at
 *
 * This metadata enables the page builder UI to generate configuration forms and
 * show a browsable catalogue, neither of which chat widgets need.
 */

/**
 * Validated configuration of one page tile.
 *
 * Unlike `AgentWidgetProps` which forbids content, tile config MAY include:
 * - `title`: string, displayed as the tile's header (capped at 128 chars)
 * - `query`: NXQL string, executed under the viewer's session
 * - Other identifiers, enums, and counts as needed
 */
export type PageTileConfig = object;

/**
 * Turns an untrusted config object into the tile's validated configuration, or null.
 *
 * Similar to `AgentWidgetPropsParser` but adapted for user-authored content.
 * Null means "do not mount" — the page renders with a placeholder showing which
 * tile failed validation (useful after a prop schema change on upgrade).
 */
export type PageTileConfigParser<C extends PageTileConfig = PageTileConfig> = (
  config: Record<string, unknown>,
) => C | null;

/** Width contexts a tile can render in. Per §4.2, start with half and full only. */
export type PageTileWidth = 'half' | 'full';

/**
 * JSON Schema describing a tile's configuration form.
 *
 * Used by the page builder to generate input fields. The schema must be a plain
 * object literal serializable to JSON — no functions, no circular refs.
 *
 * Example:
 * ```typescript
 * {
 *   type: 'object',
 *   properties: {
 *     title: { type: 'string', maxLength: 128 },
 *     query: { type: 'string', description: 'NXQL query' },
 *     limit: { type: 'integer', minimum: 1, maximum: 50, default: 10 }
 *   },
 *   required: ['title']
 * }
 * ```
 */
export interface PageTileConfigSchema {
  type: 'object';
  properties: Record<string, unknown>;
  required?: readonly string[];
  [key: string]: unknown; // JSON Schema allows additional fields
}

/**
 * One contributed page tile.
 *
 * Similar structure to `AgentWidgetDefinition` but with additional metadata for
 * the page builder UI and a relaxed prop contract.
 */
export interface PageTileDefinition<C extends PageTileConfig = PageTileConfig> {
  /** Internal identifier, must match /^[a-z][A-Za-z0-9]{0,39}$/ */
  readonly name: string;

  /** Display name shown in the palette */
  readonly displayName: string;

  /** Description shown on hover in the palette */
  readonly description: string;

  /** Material icon name (e.g., 'list', 'dashboard', 'folder') */
  readonly icon: string;

  /** JSON Schema describing the configuration form */
  readonly configSchema: PageTileConfigSchema;

  /** Validates and parses configuration from untrusted input */
  readonly parseConfig: PageTileConfigParser<C>;

  /** Lazy-loads the component (should be a dynamic import()) */
  readonly load: () => Promise<Type<unknown>>;

  /** Translates validated config into component inputs */
  readonly inputs: (config: C) => Readonly<Record<string, unknown>>;

  /** Preferred width when added to a page */
  readonly defaultWidth: PageTileWidth;

  /** Which widths this tile can render at (most tiles support both) */
  readonly supportedWidths: readonly PageTileWidth[];

  /**
   * Minimum height in grid rows (optional, default 1).
   * Used by the layout engine to prevent tiles from being too compressed.
   */
  readonly minHeight?: number;

  /**
   * Version number for this tile's configuration schema.
   * Increment when making breaking changes to `configSchema` or `parseConfig`.
   * Used by the upgrade report to detect pages that need migration.
   */
  readonly version?: number;
}

/**
 * Every page tile this application can mount.
 *
 * Injected rather than imported, so the page builder depends on the shape of a
 * tile and never on the identity of one.
 */
export const AGENT_PAGE_TILES = new InjectionToken<readonly PageTileDefinition[]>(
  'AGENT_PAGE_TILES',
  {
    providedIn: 'root',
    factory: () => [],
  },
);

/**
 * Registers page tiles with the page builder. Call in `app.config.ts`:
 *
 * ```ts
 * providePageTiles(recentDocumentsTile, favoriteTile, tasksTile)
 * ```
 *
 * A library outside this repository contributes by exporting its own definitions
 * and having the application add them to the same call.
 */
export function providePageTiles(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ...tiles: readonly PageTileDefinition<any>[]
): Provider[] {
  return tiles.map((tile) => ({
    provide: AGENT_PAGE_TILES,
    useValue: tile,
    multi: true,
  }));
}

/**
 * The registered page tiles, indexed and checked.
 *
 * Built once from the injected list. Duplicate names throw at bootstrap.
 */
export class PageTileCatalogue {
  private readonly byName: ReadonlyMap<string, PageTileDefinition>;

  constructor(tiles: readonly PageTileDefinition[]) {
    const byName = new Map<string, PageTileDefinition>();
    for (const tile of tiles) {
      if (!tile.name || !TILE_NAME_PATTERN.test(tile.name)) {
        throw new Error(`Page tile name ${JSON.stringify(tile.name)} is not a valid identifier.`);
      }
      if (byName.has(tile.name)) {
        throw new Error(`Two page tiles are registered as "${tile.name}".`);
      }
      // Validate that displayName and description exist
      if (!tile.displayName || typeof tile.displayName !== 'string') {
        throw new Error(`Page tile "${tile.name}" must have a displayName.`);
      }
      if (!tile.description || typeof tile.description !== 'string') {
        throw new Error(`Page tile "${tile.name}" must have a description.`);
      }
      // Validate supportedWidths is non-empty
      if (!tile.supportedWidths || tile.supportedWidths.length === 0) {
        throw new Error(`Page tile "${tile.name}" must declare at least one supported width.`);
      }
      byName.set(tile.name, tile);
    }
    this.byName = byName;
  }

  get(name: string): PageTileDefinition | undefined {
    return this.byName.get(name);
  }

  /** All registered tiles, for rendering the palette */
  all(): readonly PageTileDefinition[] {
    return [...this.byName.values()];
  }

  /** Registered names, sorted. For diagnostics and conformance tests. */
  names(): readonly string[] {
    return [...this.byName.keys()].sort();
  }
}

/**
 * A page tile name must look like an identifier (same rule as chat widgets).
 */
const TILE_NAME_PATTERN = /^[a-z][A-Za-z0-9]{0,39}$/;

/**
 * The registered page tiles, as one catalogue.
 *
 * Derived from {@link AGENT_PAGE_TILES} so the duplicate-name check runs once,
 * at first injection.
 */
export const PAGE_TILE_CATALOGUE = new InjectionToken<PageTileCatalogue>('PAGE_TILE_CATALOGUE', {
  providedIn: 'root',
  factory: () => new PageTileCatalogue(inject(AGENT_PAGE_TILES)),
});

/**
 * A tile mount request after config validation.
 *
 * Unlike `AgentWidgetMount` which has a `toolCallId`, page tiles are mounted by
 * explicit user action so we track them by a generated `mountId`.
 */
export interface PageTileMount {
  readonly mountId: string;
  readonly status: 'ready';
  readonly name: string;
  readonly config: PageTileConfig;
  readonly width: PageTileWidth;
}

/**
 * Why a tile mount request failed.
 *
 * Similar to `AgentWidgetRejection` but with different failure modes.
 */
export type PageTileRejectionReason =
  | 'unknown-tile' // tile removed from catalogue
  | 'invalid-config' // config doesn't match schema
  | 'unsupported-width'; // tile doesn't support the requested width

export interface PageTileRejection {
  readonly mountId: string;
  readonly status: 'rejected';
  readonly reason: PageTileRejectionReason;
  readonly tileName?: string; // included when known, for error display
}

export type PageTileMountRequest = PageTileMount | PageTileRejection;

/**
 * Parses a saved page's tile configuration into a mount request.
 *
 * Similar to `parseAgentWidgetEvent` but for saved page tiles.
 */
export function parsePageTileMountRequest(
  mountId: string,
  tileName: string,
  config: unknown,
  width: PageTileWidth,
  catalogue: PageTileCatalogue,
): PageTileMountRequest {
  const tile = catalogue.get(tileName);
  if (!tile) {
    return { mountId, status: 'rejected', reason: 'unknown-tile', tileName };
  }

  if (!tile.supportedWidths.includes(width)) {
    return { mountId, status: 'rejected', reason: 'unsupported-width', tileName };
  }

  if (!isRecord(config)) {
    return { mountId, status: 'rejected', reason: 'invalid-config', tileName };
  }

  // A parser is contributed code and may throw
  let validatedConfig: PageTileConfig | null;
  try {
    validatedConfig = tile.parseConfig(config);
  } catch {
    validatedConfig = null;
  }

  if (!validatedConfig) {
    return { mountId, status: 'rejected', reason: 'invalid-config', tileName };
  }

  return { mountId, status: 'ready', name: tile.name, config: validatedConfig, width };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Validation helpers copied from agent-widget.ts for consistency.
 * Tile parsers should use these for config validation.
 */

/** Confirms the config object carries every required key and no unknown keys. */
export function exactConfig(
  config: Record<string, unknown>,
  required: readonly string[],
  optional: readonly string[] = [],
): boolean {
  const actual = Object.keys(config);
  return (
    required.every((key) => actual.includes(key)) &&
    actual.every((key) => required.includes(key) || optional.includes(key))
  );
}

/** One member of a closed set of strings, or null. */
export function parseEnum<T extends string>(value: unknown, allowed: readonly T[]): T | null {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : null;
}

/**
 * A title string with length and content validation.
 *
 * Enforces the cap from §5: max 128 chars (raised from 64 after considering
 * real-world dashboard titles). Trims whitespace. Rejects empty strings.
 */
export function parseTileTitle(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 128) return null;
  return trimmed;
}

/**
 * An NXQL query string with basic validation.
 *
 * Does not execute the query or validate its syntax deeply (that happens
 * server-side). Just ensures it's a reasonable-length string. The 2000-char
 * cap prevents obviously malicious payloads without restricting legitimate
 * queries (most NXQL is under 500 chars).
 */
export function parseNxqlQuery(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > 2000) return null;
  // Basic sanity check: must start with SELECT
  if (!trimmed.toUpperCase().startsWith('SELECT')) return null;
  return trimmed;
}

/**
 * A positive integer with a maximum, or null.
 *
 * Common for `limit` and `maxItems` config values.
 */
export function parsePositiveInt(value: unknown, max: number): number | null {
  if (typeof value !== 'number') return null;
  if (!Number.isInteger(value)) return null;
  if (value < 1 || value > max) return null;
  return value;
}
