import { AuditEntry } from '../models/audit.model';
/**
 * Label key for an audit activity entry — Web UI uses `extended.clientReason` when present,
 * otherwise `eventId` (see `nuxeo-document-activity._activity()`).
 */
export declare function auditActivityLabelKey(entry: AuditEntry): string;
/**
 * Human-readable Activity tab label for an audit entry (Classic Web UI parity).
 */
export declare function auditActivityLabel(entry: AuditEntry, eventTypeLabels?: Map<string, string> | Record<string, string>): string;
//# sourceMappingURL=audit-activity-label.d.ts.map