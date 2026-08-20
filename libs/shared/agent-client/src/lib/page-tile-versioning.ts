import { Injectable, inject } from '@angular/core';
import { PAGE_TILE_CATALOGUE, type PageTileConfig, type PageTileDefinition } from './page-tile';

/**
 * Page Tile Versioning: Schema migration and upgrade reporting.
 *
 * Per §4.3 of the page builder analysis, saved pages create a compatibility
 * commitment: `PageTileDefinition` props become a public API once customers
 * have pages stored in Nuxeo. This module provides:
 *
 * 1. **Version tracking**: Each tile declares its config schema version
 * 2. **Migration hooks**: Tiles can transform old configs to new schemas
 * 3. **Upgrade reports**: Enumerate pages that will break on upgrade
 * 4. **Safe degradation**: Already handled by registry (unknown tile / invalid props)
 *
 * ## Versioning strategy
 *
 * Tiles follow semantic versioning for their config schemas:
 * - **Major version change** (1→2): Breaking change (rename/remove required field)
 * - **Minor version change** (1.0→1.1): Additive change (new optional field)
 * - **Patch version** (1.0.0→1.0.1): Bug fix (no schema change)
 *
 * For simplicity, we use integer versions (1, 2, 3) rather than semver strings.
 * Only major schema changes require version bumps.
 *
 * ## Migration hooks
 *
 * When a tile's config schema changes incompatibly:
 *
 * ```typescript
 * export const myTile: PageTileDefinition = {
 *   name: 'myTile',
 *   version: 2,
 *   parseConfig: (config) => {
 *     // Current version parsing
 *     const title = parseTileTitle(config.title);
 *     const newField = config.newRequiredField;
 *     return { title, newField };
 *   },
 *   migrateConfig: (config, fromVersion) => {
 *     if (fromVersion === 1) {
 *       // Migrate v1 to v2: add default for newRequiredField
 *       return { ...config, newRequiredField: 'default' };
 *     }
 *     return config;
 *   },
 * };
 * ```
 *
 * ## Upgrade workflow
 *
 * Before deploying a version with tile schema changes:
 * 1. Run `PageVersioningService.getUpgradeReport()`
 * 2. Review affected pages (count, owners, last modified)
 * 3. Notify affected users via email
 * 4. Deploy with migration hooks
 * 5. Tiles with `migrateConfig` auto-upgrade on first load
 * 6. Tiles without hooks degrade gracefully (show error placeholder)
 *
 * ## Storage model
 *
 * Page configs store tiles without version metadata (for now). The version
 * lives in the definition, not the stored config. Future enhancement:
 *
 * ```typescript
 * interface PageTileInstance {
 *   tileName: string;
 *   config: PageTileConfig;
 *   schemaVersion?: number; // Added in future version
 * }
 * ```
 *
 * This allows detecting which version a stored config was created with, enabling
 * more precise migration. For now, we assume "no version = version 1".
 */

/**
 * Migration function signature.
 *
 * Transforms a config from an old schema version to the current version.
 * Return null if migration is impossible (e.g., required data missing).
 */
export type TileConfigMigration<C extends PageTileConfig = PageTileConfig> = (
  config: Record<string, unknown>,
  fromVersion: number,
) => C | null;

/**
 * Extended tile definition with migration support.
 *
 * Tiles declare this extended interface to opt into automatic migrations.
 */
export interface VersionedPageTileDefinition<
  C extends PageTileConfig = PageTileConfig,
> extends PageTileDefinition<C> {
  /**
   * Schema version number (1, 2, 3, ...).
   * Increment on breaking config changes. Optional; defaults to 1.
   */
  version?: number;

  /**
   * Migration function from older versions to current version.
   * Called when loading a page with outdated tile configs.
   *
   * @param config Old config from stored page
   * @param fromVersion Schema version the config was created with
   * @returns Migrated config, or null if migration failed
   */
  migrateConfig?: TileConfigMigration<C>;
}

/**
 * Result of analyzing a single page for upgrade compatibility.
 */
export interface PageUpgradeAnalysis {
  /** Page document UID */
  pageId: string;
  /** Page title */
  pageTitle: string;
  /** Page owner */
  creator: string;
  /** Last modified timestamp */
  modified: string;
  /** Tiles on this page that will break */
  breakingTiles: Array<{
    tileName: string;
    /** Current schema version in the deployment */
    currentVersion: number;
    /** Whether tile has a migration hook */
    hasMigration: boolean;
    /** Human-readable issue description */
    issue: string;
  }>;
}

/**
 * Report of pages affected by tile schema upgrades.
 */
export interface TileUpgradeReport {
  /** Total pages analyzed */
  totalPages: number;
  /** Pages with at least one breaking tile */
  affectedPages: number;
  /** Pages that will auto-migrate (have migration hooks) */
  autoMigratablePages: number;
  /** Pages that will degrade (no migration hooks) */
  degradedPages: number;
  /** Per-page breakdown */
  details: PageUpgradeAnalysis[];
  /** Summary by tile */
  tileSummary: Record<
    string,
    {
      affectedPages: number;
      currentVersion: number;
      hasMigration: boolean;
    }
  >;
}

@Injectable({ providedIn: 'root' })
export class PageVersioningService {
  private readonly catalogue = inject(PAGE_TILE_CATALOGUE);

  /**
   * Gets the current schema version for a tile.
   * Defaults to 1 if not declared.
   */
  getTileVersion(tileName: string): number {
    const tile = this.catalogue.get(tileName) as VersionedPageTileDefinition | undefined;
    return tile?.version ?? 1;
  }

  /**
   * Checks if a tile has a migration hook.
   */
  hasMigrationHook(tileName: string): boolean {
    const tile = this.catalogue.get(tileName) as VersionedPageTileDefinition | undefined;
    return !!tile?.migrateConfig;
  }

  /**
   * Migrates a tile config from an old version to current.
   *
   * Used when loading a saved page with outdated tile configs.
   * Returns null if migration fails (tile doesn't exist, no hook, or hook returned null).
   *
   * @param tileName Tile identifier
   * @param config Old config to migrate
   * @param fromVersion Version the config was created with (defaults to 1)
   * @returns Migrated config, or null if migration failed
   */
  migrateConfig(
    tileName: string,
    config: Record<string, unknown>,
    fromVersion = 1,
  ): PageTileConfig | null {
    const tile = this.catalogue.get(tileName) as VersionedPageTileDefinition | undefined;
    if (!tile) return null;

    const currentVersion = tile.version ?? 1;
    if (fromVersion === currentVersion) {
      // No migration needed
      return tile.parseConfig(config);
    }

    if (!tile.migrateConfig) {
      // Breaking change, no migration hook - will degrade
      return null;
    }

    // Apply migration
    try {
      const migrated = tile.migrateConfig(config, fromVersion);
      return migrated;
    } catch (err) {
      console.error(`[PageVersioning] Migration failed for ${tileName}:`, err);
      return null;
    }
  }

  /**
   * Analyzes a single page for upgrade compatibility.
   *
   * Checks each tile against the current catalogue version to detect
   * breaking changes.
   *
   * @param page Saved page data (from SavedPageService)
   * @returns Analysis of breaking tiles, or null if page has no issues
   */
  analyzePageUpgrade(page: {
    id: string;
    title: string;
    creator: string;
    modified: string;
    config: { tiles: Array<{ tileName: string; config: unknown }> };
  }): PageUpgradeAnalysis | null {
    const breakingTiles: PageUpgradeAnalysis['breakingTiles'] = [];

    for (const tileInstance of page.config.tiles) {
      const tile = this.catalogue.get(tileInstance.tileName) as
        | VersionedPageTileDefinition
        | undefined;

      if (!tile) {
        // Tile removed from catalogue - will show error placeholder
        breakingTiles.push({
          tileName: tileInstance.tileName,
          currentVersion: 0,
          hasMigration: false,
          issue: 'Tile no longer exists in the deployment',
        });
        continue;
      }

      const currentVersion = tile.version ?? 1;
      // Assume stored configs are version 1 (future: read from stored metadata)
      const storedVersion = 1;

      if (storedVersion < currentVersion) {
        // Breaking change detected
        const hasMigration = !!tile.migrateConfig;
        breakingTiles.push({
          tileName: tileInstance.tileName,
          currentVersion,
          hasMigration,
          issue: hasMigration
            ? `Schema upgraded to v${currentVersion} (auto-migratable)`
            : `Schema upgraded to v${currentVersion} (will degrade)`,
        });
      }
    }

    if (breakingTiles.length === 0) return null;

    return {
      pageId: page.id,
      pageTitle: page.title,
      creator: page.creator,
      modified: page.modified,
      breakingTiles,
    };
  }

  /**
   * Generates an upgrade report for all saved pages.
   *
   * **This is expensive**: loads metadata for every saved page in the system.
   * Run during deployment planning, not in production UI.
   *
   * Usage:
   * ```typescript
   * const report = await firstValueFrom(versioningService.getUpgradeReport(savedPages));
   * console.log(`${report.affectedPages}/${report.totalPages} pages affected`);
   * for (const page of report.details) {
   *   console.log(`- ${page.pageTitle} (${page.creator})`);
   *   for (const tile of page.breakingTiles) {
   *     console.log(`  • ${tile.tileName}: ${tile.issue}`);
   *   }
   * }
   * ```
   *
   * @param pages List of saved pages (from SavedPageService.getSavedPages())
   * @returns Comprehensive upgrade report
   */
  getUpgradeReport(
    pages: Array<{
      id: string;
      title: string;
      creator: string;
      modified: string;
      config: { tiles: Array<{ tileName: string; config: unknown }> };
    }>,
  ): TileUpgradeReport {
    const details: PageUpgradeAnalysis[] = [];
    const tileCounts: Record<string, number> = {};

    for (const page of pages) {
      const analysis = this.analyzePageUpgrade(page);
      if (analysis) {
        details.push(analysis);
        for (const tile of analysis.breakingTiles) {
          tileCounts[tile.tileName] = (tileCounts[tile.tileName] ?? 0) + 1;
        }
      }
    }

    const autoMigratablePages = details.filter((p) =>
      p.breakingTiles.every((t) => t.hasMigration),
    ).length;

    const tileSummary: TileUpgradeReport['tileSummary'] = {};
    for (const [tileName, count] of Object.entries(tileCounts)) {
      tileSummary[tileName] = {
        affectedPages: count,
        currentVersion: this.getTileVersion(tileName),
        hasMigration: this.hasMigrationHook(tileName),
      };
    }

    return {
      totalPages: pages.length,
      affectedPages: details.length,
      autoMigratablePages,
      degradedPages: details.length - autoMigratablePages,
      details,
      tileSummary,
    };
  }

  /**
   * Gets a user-friendly summary of an upgrade report.
   *
   * Returns a text summary suitable for deployment planning docs or admin UI.
   */
  formatUpgradeReport(report: TileUpgradeReport): string {
    const lines: string[] = [];
    lines.push(`# Tile Upgrade Report`);
    lines.push('');
    lines.push(`**Total pages**: ${report.totalPages}`);
    lines.push(`**Affected pages**: ${report.affectedPages}`);
    lines.push(`**Auto-migratable**: ${report.autoMigratablePages}`);
    lines.push(`**Will degrade**: ${report.degradedPages}`);
    lines.push('');

    if (Object.keys(report.tileSummary).length > 0) {
      lines.push('## Tiles with breaking changes');
      lines.push('');
      for (const [tileName, summary] of Object.entries(report.tileSummary)) {
        const status = summary.hasMigration ? '✓ auto-migrate' : '✗ will degrade';
        lines.push(`- **${tileName}** v${summary.currentVersion}`);
        lines.push(`  - ${summary.affectedPages} pages affected`);
        lines.push(`  - ${status}`);
      }
      lines.push('');
    }

    if (report.details.length > 0 && report.details.length <= 20) {
      lines.push('## Affected pages');
      lines.push('');
      for (const page of report.details) {
        lines.push(`- **${page.pageTitle}** (${page.creator})`);
        for (const tile of page.breakingTiles) {
          lines.push(`  - ${tile.tileName}: ${tile.issue}`);
        }
      }
    } else if (report.details.length > 20) {
      lines.push(`## ${report.details.length} affected pages (showing first 20)`);
      lines.push('');
      for (const page of report.details.slice(0, 20)) {
        lines.push(`- **${page.pageTitle}** (${page.creator})`);
      }
      lines.push('');
      lines.push(`... and ${report.details.length - 20} more pages`);
    }

    return lines.join('\n');
  }
}
