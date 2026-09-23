/**
 * Integration test harness for Nuxeo Agentic UI.
 *
 * Stage 4 of the integration-test plan. Provides:
 * - Precondition checking (refuse to run against absent/empty Nuxeo or default credentials)
 * - Per-run data root under /default-domain/workspaces/it-<runid>
 * - Guaranteed cleanup (even on test failure)
 * - Helper functions for common test operations
 *
 * See docs/integration-test-audit.md §11 Stage 4.
 */

export {
  checkIntegrationPreconditions,
  runPreflightChecks,
  type IntegrationTestConfig,
  type PreflightResult,
} from './lib/integration-preflight';

export {
  setupIntegrationHarness,
  createTestDocument,
  waitForIndexed,
  waitForNxqlMatch,
  tagDocument,
  type IntegrationHarness,
  type CreatedTestDocument,
} from './lib/integration-harness';

export {
  createNonAdminUser,
  deleteUser,
  grantPermission,
  revokePermission,
  canRead,
  canWrite,
  type TestUser,
  type CreateUserOptions,
} from './lib/user-fixtures';
