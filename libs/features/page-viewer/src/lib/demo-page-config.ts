import type { PageConfig } from '@agentic-ui/shared/agent-client';

/**
 * Demo page configuration for testing the PageViewerComponent.
 *
 * This demonstrates the 12-column grid layout system with:
 * - Row 1: Two half-width tiles side by side (cols 1-6 and 7-12)
 * - Row 3: One full-width tile (cols 1-12)
 *
 * These tiles don't exist yet - they'll be created in Task #4
 * "Build first 3 dashboard tiles from existing markup".
 *
 * Once actual tiles are registered, this demo can be used for:
 * - Visual testing of the grid layout
 * - Verifying responsive behavior
 * - Testing error handling (unknown tiles show placeholders)
 */
export const DEMO_PAGE_CONFIG: PageConfig = {
  tiles: [
    {
      tileName: 'recentDocuments',
      config: {
        title: 'Recent Documents',
        limit: 10,
      },
      placement: {
        row: 1,
        col: 1,
        width: 6, // half-width
        height: 2,
      },
    },
    {
      tileName: 'favorites',
      config: {
        title: 'My Favorites',
        limit: 10,
      },
      placement: {
        row: 1,
        col: 7,
        width: 6, // half-width
        height: 2,
      },
    },
    {
      tileName: 'taskList',
      config: {
        title: 'My Tasks',
        limit: 5,
      },
      placement: {
        row: 3,
        col: 1,
        width: 12, // full-width
        height: 2,
      },
    },
  ],
  metadata: {
    title: 'My Dashboard',
    description: 'Demo dashboard page for testing the page viewer',
  },
};
