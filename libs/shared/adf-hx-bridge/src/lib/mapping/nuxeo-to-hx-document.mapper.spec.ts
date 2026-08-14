import { describe, expect, it } from 'vitest';
import {
  mapNuxeoDocumentToHx,
  mapNuxeoDocumentsToHx,
  syntheticHxRepositoryRoot,
} from './nuxeo-to-hx-document.mapper';
import type { NuxeoDocument } from '@agentic-ui/shared/nuxeo-client';

describe('nuxeo-to-hx-document.mapper', () => {
  const workspace: NuxeoDocument = {
    uid: 'ws-uid',
    title: 'Marketing',
    type: 'Workspace',
    path: '/default-domain/workspaces/marketing',
    lastModified: '2026-01-01T00:00:00.000Z',
    properties: {},
    parentRef: 'domain-uid',
  };

  it('maps uid/title/path to HxPR sys_* fields', () => {
    const hx = mapNuxeoDocumentToHx(workspace);

    expect(hx.sys_id).toBe('ws-uid');
    expect(hx.sys_title).toBe('Marketing');
    expect(hx.sys_path).toBe('/default-domain/workspaces/marketing');
    expect(hx.sys_parentPath).toBe('/default-domain/workspaces');
    expect(hx.sys_parentId).toBe('domain-uid');
    expect(hx.sys_isFolderish).toBe(true);
    expect(hx.sys_primaryType).toBe('SysFolder');
  });

  it('maps file documents as SysFile', () => {
    const file: NuxeoDocument = {
      uid: 'file-uid',
      title: 'Report.pdf',
      type: 'File',
      path: '/default-domain/workspaces/marketing/Report.pdf',
      lastModified: '2026-01-02T00:00:00.000Z',
      properties: { 'file:content': { 'mime-type': 'application/pdf' } },
    };

    const hx = mapNuxeoDocumentToHx(file);
    expect(hx.sys_isFolderish).toBe(false);
    expect(hx.sys_primaryType).toBe('SysFile');
    expect(hx.sys_contentType).toBe('application/pdf');
  });

  it('maps arrays via mapNuxeoDocumentsToHx', () => {
    const mapped = mapNuxeoDocumentsToHx([workspace]);
    expect(mapped).toHaveLength(1);
    expect(mapped[0].sys_id).toBe('ws-uid');
  });

  it('builds synthetic repository root', () => {
    const root = syntheticHxRepositoryRoot();
    expect(root.sys_id).toBe('00000000-0000-0000-0000-000000000000');
    expect(root.sys_primaryType).toBe('SysRoot');
    expect(root.sys_isFolderish).toBe(true);
  });
});
