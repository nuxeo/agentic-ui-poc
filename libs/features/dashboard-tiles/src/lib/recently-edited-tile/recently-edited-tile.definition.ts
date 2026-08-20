import {
  PageTileDefinition,
  PageTileConfig,
  exactConfig,
  parseTileTitle,
  parsePositiveInt,
  sanitizeTileTitle,
} from '@agentic-ui/shared/agent-client';

/**
 * Configuration for the Recently Edited tile.
 *
 * - title: Displayed in the tile header (required)
 * - limit: Maximum number of documents to show (optional, default 10, max 50)
 */
export interface RecentlyEditedTileConfig extends PageTileConfig {
  title: string;
  limit?: number;
}

/**
 * Page tile definition for Recently Edited documents.
 *
 * Extracted from dashboard-page.component.html lines 64-117.
 * Shows documents the user recently modified, with thumbnails and contributor info.
 */
export const recentlyEditedTile: PageTileDefinition<RecentlyEditedTileConfig> = {
  name: 'recentlyEdited',
  displayName: 'Recently Edited',
  description: 'Documents you recently modified',
  icon: 'schedule',
  defaultWidth: 'full',
  supportedWidths: ['half', 'full'],

  configSchema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        maxLength: 128,
        description: 'Title displayed in the tile header',
      },
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: 50,
        default: 10,
        description: 'Maximum number of documents to show',
      },
    },
    required: ['title'],
  },

  parseConfig: (config: Record<string, unknown>): RecentlyEditedTileConfig | null => {
    if (!exactConfig(config, ['title'], ['limit'])) {
      return null;
    }

    const rawTitle = parseTileTitle(config['title']);
    if (!rawTitle) {
      return null;
    }

    // Security: Sanitize title per §5 of page-builder-analysis.md
    const title = sanitizeTileTitle(rawTitle);
    if (!title) {
      console.warn('[RecentlyEditedTile] Title sanitization failed:', config['title']);
      return null;
    }

    // limit is optional, default to 10
    let limit = 10;
    if (config['limit'] !== undefined) {
      const parsedLimit = parsePositiveInt(config['limit'], 50);
      if (parsedLimit === null) {
        return null;
      }
      limit = parsedLimit;
    }

    return { title, limit };
  },

  load: () => import('./recently-edited-tile.component').then((m) => m.RecentlyEditedTileComponent),

  inputs: (config: RecentlyEditedTileConfig) => ({
    title: config.title,
    limit: config.limit ?? 10,
  }),

  version: 1,
};
