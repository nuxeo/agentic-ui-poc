import { AuditEntry } from '../models/audit.model';

/** Mirrors nuxeo-web-ui `activity.*` i18n keys used by `nuxeo-document-activity._activity()`. */
const ACTIVITY_LABELS: Record<string, string> = {
  view: 'viewed the document',
  download: 'downloaded the document',
  documentCreated: 'created the document',
  documentModified: 'updated the document',
  documentMoved: 'moved the document',
  documentRemoved: 'removed the document',
  documentLocked: 'locked the document',
  documentUnlocked: 'unlocked the document',
  documentSecurityUpdated: 'updated security settings',
  lifecycle_transition_event: 'changed document state',
  loginSuccess: 'logged in',
  addedToCollection: 'added to collection',
  removedFromCollection: 'removed from collection',
  documentPublished: 'published the document',
  documentProxyPublished: 'published the document',
  'workflow.start': 'started a review',
  'workflow.complete': 'completed a review',
  documentCheckedIn: 'checked in the document',
  documentCheckedOut: 'checked out the document',
  documentRestored: 'restored the document',
  'activity.deleted': 'activity.deleted',
};

/**
 * Label key for an audit activity entry — Web UI uses `extended.clientReason` when present,
 * otherwise `eventId` (see `nuxeo-document-activity._activity()`).
 */
export function auditActivityLabelKey(entry: AuditEntry): string {
  const clientReason = entry.extended?.['clientReason'];
  if (typeof clientReason === 'string' && clientReason.length > 0) {
    return clientReason;
  }
  return entry.eventId;
}

function directoryEventLabel(
  labels: Map<string, string> | Record<string, string>,
  key: string,
): string | undefined {
  if (labels instanceof Map) {
    return labels.get(key);
  }
  return Object.hasOwn(labels, key) ? labels[key] : undefined;
}

/**
 * Human-readable Activity tab label for an audit entry (Classic Web UI parity).
 */
export function auditActivityLabel(
  entry: AuditEntry,
  eventTypeLabels?: Map<string, string> | Record<string, string>,
): string {
  const key = auditActivityLabelKey(entry);

  // `Object.hasOwn` guard, not a bare lookup: an eventId of `constructor` or `toString` would
  // otherwise resolve up the prototype chain and return a function where a string is declared.
  const builtIn = Object.hasOwn(ACTIVITY_LABELS, key) ? ACTIVITY_LABELS[key] : undefined;
  if (builtIn) {
    return builtIn;
  }

  const fromDirectory = eventTypeLabels ? directoryEventLabel(eventTypeLabels, key) : undefined;
  if (fromDirectory) {
    return fromDirectory;
  }

  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
}
