import {
  PACKAGED_BULK_ACTIONS,
  type ExtensionActionHandler,
} from '@nuxeo-satori/platform/extensions';

/**
 * The shell's bulk actions that change documents. On the adf-hx browse page they are outside
 * Scope A, so they answer with the page's notice instead of running.
 *
 * Download as Zip, Compare and Add to Clipboard stay live: they change nothing on the server.
 */
export const SCOPE_A_BLOCKED_BULK_ACTION_IDS = [
  'app.bulkActions.addToCollection',
  'app.bulkActions.publish',
  'app.bulkActions.delete',
] as const;

/**
 * Handlers for {@link SCOPE_A_BLOCKED_BULK_ACTION_IDS} that report the action's label to
 * `notify` instead of running it.
 *
 * They must be registered with `ExtensionActionRegistry.register`, not `registerPackaged`: the
 * shell registers the real handlers on that tier, and within a tier the latest registration wins.
 */
export function scopeABulkActionHandlers(
  notify: (actionLabel: string) => void,
): Record<string, ExtensionActionHandler> {
  const handlers: Record<string, ExtensionActionHandler> = {};
  for (const id of SCOPE_A_BLOCKED_BULK_ACTION_IDS) {
    const label = PACKAGED_BULK_ACTIONS.find((action) => action.id === id)?.label ?? id;
    handlers[id] = { execute: () => notify(label) };
  }
  return handlers;
}
