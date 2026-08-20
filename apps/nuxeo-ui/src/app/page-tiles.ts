import {
  exactConfig,
  parseTileTitle,
  parsePositiveInt,
  type PageTileDefinition,
} from '@agentic-ui/shared/agent-client';

/**
 * The page tiles this application contributes to the page builder.
 *
 * **These live here rather than beside their components for the same reason
 * `agent-widgets.ts` does, plus one more.** `document-lists` is lazy-loaded, and
 * `app.config.ts` registers tiles at startup, so a static import of anything in
 * that library would pull the whole feature into the initial bundle —
 * `@nx/enforce-module-boundaries` refuses it, and the budget is the reason. A
 * definition is a name, a config schema and a `load()`; keeping it here means
 * only that much is eager, and the component arrives on first placement.
 *
 * So the config shapes below are declared locally rather than imported from the
 * components they configure. They are the contract `parseConfig` enforces, and
 * `inputs()` is the single place the two have to agree.
 *
 * `recentlyEditedTile` ships from `libs/features/dashboard-tiles` alongside its
 * component because that library is not lazy-loaded and can.
 */

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

interface TasksListTileConfig {
  readonly title: string;
  readonly limit: number;
}

interface FavoritesTileConfig {
  readonly title: string;
  readonly limit: number;
}

/** Shared by both tiles: a required title and an optional capped limit. */
function parseTitleAndLimit(
  config: Record<string, unknown>,
): { title: string; limit: number } | null {
  if (!exactConfig(config, ['title'], ['limit'])) return null;

  const title = parseTileTitle(config['title']);
  if (!title) return null;

  const limit =
    config['limit'] === undefined ? DEFAULT_LIMIT : parsePositiveInt(config['limit'], MAX_LIMIT);
  if (limit === null) return null;

  return { title, limit };
}

const titleAndLimitSchema = (titleDefault: string, limitDescription: string) =>
  ({
    type: 'object',
    properties: {
      title: {
        type: 'string',
        maxLength: 128,
        default: titleDefault,
      },
      limit: {
        type: 'integer',
        minimum: 1,
        maximum: MAX_LIMIT,
        default: DEFAULT_LIMIT,
        description: limitDescription,
      },
    },
    required: ['title'],
  }) as const;

/** Workflow tasks assigned to the caller. Read-only. */
export const tasksListTile: PageTileDefinition<TasksListTileConfig> = {
  name: 'tasksList',
  displayName: 'My Tasks',
  description: 'Workflow tasks assigned to you',
  icon: 'task_alt',
  defaultWidth: 'half',
  supportedWidths: ['half', 'full'],

  configSchema: titleAndLimitSchema('My Tasks', 'Maximum number of tasks to display'),

  parseConfig: parseTitleAndLimit,

  load: () => import('@agentic-ui/feature-document-lists').then((m) => m.TasksListTileComponent),

  inputs: (config) => ({ title: config.title, limit: config.limit }),

  version: 1,
};

/**
 * The caller's favorited documents, with an un-favorite action.
 *
 * This is the tile that shows a user-initiated write is allowed on a page, where
 * a chat widget mounted from a tool call must refuse one: the click is the
 * user's, not something the agent asked for.
 */
export const favoritesTile: PageTileDefinition<FavoritesTileConfig> = {
  name: 'favorites',
  displayName: 'Favorites',
  description: 'Your favorited documents',
  icon: 'star',
  defaultWidth: 'half',
  supportedWidths: ['half', 'full'],

  configSchema: titleAndLimitSchema('Favorites', 'Maximum number of favorites to display'),

  parseConfig: parseTitleAndLimit,

  load: () => import('@agentic-ui/feature-document-lists').then((m) => m.FavoritesTileComponent),

  inputs: (config) => ({ title: config.title, limit: config.limit }),

  version: 1,
};
