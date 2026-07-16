import {
  ADD_CHILDREN,
  canAddChildren,
  canManageDocumentPermissions,
  canRemoveDocument,
  canViewDocumentAuditLog,
  canWriteDocument,
  hasDocumentPermission,
  isPermissionDeniedError,
  MANAGE_DOCUMENT_PERMISSIONS,
  READ_WRITE_DOCUMENT,
  WRITE_SECURITY,
  PERMISSION_DENIED_MESSAGE,
  REMOVE_DOCUMENT,
  WRITE_DOCUMENT,
  WRITE_PROPERTIES,
} from './document-permissions';
import type { NuxeoDocument } from '../models/document.model';

function docWithPermissions(permissions: string[]): NuxeoDocument {
  return {
    uid: 'doc-1',
    title: 'Test',
    type: 'File',
    path: '/default-domain/workspaces/test',
    lastModified: '2026-06-12T00:00:00.000Z',
    properties: {},
    contextParameters: { permissions },
  };
}

describe('document-permissions', () => {
  it('hasDocumentPermission returns false when permissions enricher is missing', () => {
    expect(hasDocumentPermission({} as NuxeoDocument, MANAGE_DOCUMENT_PERMISSIONS)).toBe(false);
    expect(hasDocumentPermission(null, MANAGE_DOCUMENT_PERMISSIONS)).toBe(false);
  });

  it('hasDocumentPermission matches a granted compound permission', () => {
    expect(hasDocumentPermission(docWithPermissions(['Read']), 'Read')).toBe(true);
    expect(hasDocumentPermission(docWithPermissions(['Read']), 'Everything')).toBe(false);
  });

  it('canManageDocumentPermissions is false for read-only users', () => {
    expect(canManageDocumentPermissions(docWithPermissions(['Read']))).toBe(false);
  });

  it('canManageDocumentPermissions is true when user has WriteSecurity', () => {
    expect(canManageDocumentPermissions(docWithPermissions(['Read', WRITE_SECURITY]))).toBe(true);
  });

  it('canManageDocumentPermissions is true when user has Everything', () => {
    expect(canManageDocumentPermissions(docWithPermissions(['Read', 'Everything']))).toBe(true);
  });

  it('canManageDocumentPermissions is false when user only has ReadSecurity', () => {
    expect(canManageDocumentPermissions(docWithPermissions(['Read', 'ReadSecurity']))).toBe(false);
  });

  it('canWriteDocument is false for read-only users', () => {
    expect(canWriteDocument(docWithPermissions(['Read']))).toBe(false);
  });

  it('canWriteDocument is true when user has Write', () => {
    expect(canWriteDocument(docWithPermissions(['Read', WRITE_DOCUMENT]))).toBe(true);
  });

  it('canWriteDocument is true when user has WriteProperties (Web UI note parity)', () => {
    expect(canWriteDocument(docWithPermissions(['Read', WRITE_PROPERTIES]))).toBe(true);
  });

  it('canAddChildren is false for read-only users', () => {
    expect(canAddChildren(docWithPermissions(['Read']))).toBe(false);
  });

  it('canAddChildren is true when user has AddChildren', () => {
    expect(canAddChildren(docWithPermissions(['Read', ADD_CHILDREN]))).toBe(true);
  });

  it('canRemoveDocument is false for read-only users', () => {
    expect(canRemoveDocument(docWithPermissions(['Read']))).toBe(false);
  });

  it('canRemoveDocument is true when user has Remove', () => {
    expect(canRemoveDocument(docWithPermissions(['Read', REMOVE_DOCUMENT]))).toBe(true);
  });

  it('canViewDocumentAuditLog is true for read-only users (Classic Web UI parity)', () => {
    expect(canViewDocumentAuditLog(docWithPermissions(['Read']))).toBe(true);
  });

  it('canViewDocumentAuditLog is false when permissions enricher is missing', () => {
    expect(canViewDocumentAuditLog({} as NuxeoDocument)).toBe(false);
    expect(canViewDocumentAuditLog(null)).toBe(false);
  });

  it('canViewDocumentAuditLog is true when user has Write', () => {
    expect(canViewDocumentAuditLog(docWithPermissions(['Read', WRITE_DOCUMENT]))).toBe(true);
  });

  it('canViewDocumentAuditLog is true when user has ReadWrite', () => {
    expect(canViewDocumentAuditLog(docWithPermissions(['Read', READ_WRITE_DOCUMENT]))).toBe(true);
  });

  it('canViewDocumentAuditLog is true when user has Everything', () => {
    expect(canViewDocumentAuditLog(docWithPermissions(['Read', MANAGE_DOCUMENT_PERMISSIONS]))).toBe(
      true,
    );
  });

  it('canViewDocumentAuditLog is true when user has WriteSecurity', () => {
    expect(canViewDocumentAuditLog(docWithPermissions(['Read', WRITE_SECURITY]))).toBe(true);
  });

  it('isPermissionDeniedError detects 401 and 403', () => {
    expect(isPermissionDeniedError({ status: 403 })).toBe(true);
    expect(isPermissionDeniedError({ status: 401 })).toBe(true);
    expect(isPermissionDeniedError({ status: 500 })).toBe(false);
  });

  it('exports a user-facing permission denied message', () => {
    expect(PERMISSION_DENIED_MESSAGE.length).toBeGreaterThan(0);
  });
});
