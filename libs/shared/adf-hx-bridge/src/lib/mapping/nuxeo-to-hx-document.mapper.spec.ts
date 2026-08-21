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
  describe('standard HxPR fields, not just the hx: custom ones', () => {
    // These three were dropped, which is why upstream's DataTable rendered a blank Last
    // Contributor column: the value existed only under `hx:lastContributor`, a key adf-hx
    // has never heard of. Asserted on the standard names because that is what any upstream
    // component reads.
    const withPeople = {
      uid: 'doc-9',
      title: 'Invoice',
      type: 'File',
      path: '/default-domain/workspaces/ws/Invoice',
      lastModified: '2026-02-01T00:00:00.000Z',
      state: 'project',
      properties: { 'dc:lastContributor': 'jdoe', 'dc:creator': 'asmith' },
    } as unknown as Parameters<typeof mapNuxeoDocumentToHx>[0];

    it('maps dc:lastContributor to sys_lastContributor as a User', () => {
      const hx = mapNuxeoDocumentToHx(withPeople);
      expect(hx.sys_lastContributor).toEqual({ id: 'jdoe', username: 'jdoe' });
    });

    it('maps dc:creator to sys_creator as a User', () => {
      expect(mapNuxeoDocumentToHx(withPeople).sys_creator).toEqual({
        id: 'asmith',
        username: 'asmith',
      });
    });

    it('maps the Nuxeo lifecycle state to sys_lifecycleState', () => {
      // Section 3 recorded document state being read from `dc:nature`; the real field is
      // the lifecycle state, and Nuxeo already sends it.
      expect(mapNuxeoDocumentToHx(withPeople).sys_lifecycleState).toBe('project');
    });

    it('leaves a User undefined rather than inventing one when Nuxeo sends no username', () => {
      const anonymous = { ...withPeople, properties: {} } as typeof withPeople;
      const hx = mapNuxeoDocumentToHx(anonymous);
      expect(hx.sys_lastContributor).toBeUndefined();
      expect(hx.sys_creator).toBeUndefined();
    });

    it('does not fabricate a display name it cannot know', () => {
      // Nuxeo carries a username only. Filling firstName/lastName would need a /user call
      // per contributor, and a guessed name is worse than an honest username.
      const user = mapNuxeoDocumentToHx(withPeople).sys_lastContributor;
      expect(user?.firstName).toBeUndefined();
      expect(user?.lastName).toBeUndefined();
      expect(user?.email).toBeUndefined();
    });
  });
});
