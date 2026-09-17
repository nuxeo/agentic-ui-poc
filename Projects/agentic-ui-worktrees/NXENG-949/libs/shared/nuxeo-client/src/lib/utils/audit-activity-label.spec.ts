import { describe, expect, it } from 'vitest';

import { AuditEntry } from '../models/audit.model';
import { auditActivityLabel, auditActivityLabelKey } from './audit-activity-label';

function entry(partial: Partial<AuditEntry> & Pick<AuditEntry, 'eventId'>): AuditEntry {
  return {
    id: 1,
    category: 'eventDocumentCategory',
    principalName: 'user7',
    comment: '',
    docLifeCycle: 'project',
    docPath: '/default-domain/ws/file',
    docType: 'File',
    docUUID: 'uid-1',
    repositoryId: 'default',
    eventDate: '2026-03-31T06:47:47.472Z',
    logDate: '2026-03-31T06:47:47.474Z',
    extended: {},
    ...partial,
  };
}

describe('auditActivityLabelKey', () => {
  it('prefers extended.clientReason over eventId (Web UI parity)', () => {
    expect(
      auditActivityLabelKey(entry({ eventId: 'download', extended: { clientReason: 'view' } })),
    ).toBe('view');
  });

  it('falls back to eventId when clientReason is missing', () => {
    expect(auditActivityLabelKey(entry({ eventId: 'documentCreated' }))).toBe('documentCreated');
  });
});

describe('auditActivityLabel', () => {
  it('shows viewed the document when clientReason is view', () => {
    expect(
      auditActivityLabel(entry({ eventId: 'download', extended: { clientReason: 'view' } })),
    ).toBe('viewed the document');
  });

  it('shows downloaded the document when clientReason is download', () => {
    expect(
      auditActivityLabel(entry({ eventId: 'download', extended: { clientReason: 'download' } })),
    ).toBe('downloaded the document');
  });

  it('shows downloaded the document when eventId is download without clientReason', () => {
    expect(auditActivityLabel(entry({ eventId: 'download' }))).toBe('downloaded the document');
  });

  it('maps other event ids to activity labels', () => {
    expect(auditActivityLabel(entry({ eventId: 'documentCreated' }))).toBe('created the document');
  });
});
