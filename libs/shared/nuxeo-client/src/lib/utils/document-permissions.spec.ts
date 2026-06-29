import {
  canManageDocumentPermissions,
  hasDocumentPermission,
  MANAGE_DOCUMENT_PERMISSIONS,
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

  it('canManageDocumentPermissions is true when user has Everything', () => {
    expect(canManageDocumentPermissions(docWithPermissions(['Read', 'Everything']))).toBe(true);
  });
});
