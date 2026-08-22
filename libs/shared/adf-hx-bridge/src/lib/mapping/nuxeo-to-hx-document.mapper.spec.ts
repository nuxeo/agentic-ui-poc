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

  /**
   * Spelling, and it is load-bearing. adf-hx writes `SysFilish` with no `e` in all four places
   * it appears — `isFile()`, `getFilishTypes()` and two mixin checks. This mapper emitted the
   * plausible-looking `SysFileish`, so upstream's `isFile()` was **always false** for every
   * non-folder document we produced. Asserted as exact strings, because that is the only thing
   * that distinguishes the two.
   */
  it('spells the mixins the way adf-hx reads them', () => {
    const file: NuxeoDocument = {
      uid: 'file-uid',
      title: 'Report.pdf',
      type: 'File',
      path: '/x/Report.pdf',
      lastModified: '2026-01-02T00:00:00.000Z',
      properties: {},
    };
    expect(mapNuxeoDocumentToHx(file).sys_mixinTypes).toEqual(['SysFilish']);
    expect(mapNuxeoDocumentToHx(workspace).sys_mixinTypes).toEqual(['SysFolderish']);
  });

  it('maps arrays via mapNuxeoDocumentsToHx', () => {
    const mapped = mapNuxeoDocumentsToHx([workspace]);
    expect(mapped).toHaveLength(1);
    expect(mapped[0].sys_id).toBe('ws-uid');
  });

  describe("Nuxeo's own property surface, as prefix_field", () => {
    const invoice = {
      uid: 'doc-1',
      title: 'Invoice',
      type: 'File',
      path: '/default-domain/workspaces/ws/Invoice',
      lastModified: '2026-02-01T00:00:00.000Z',
      properties: {
        'dc:title': 'Invoice',
        'dc:nature': 'contract',
        'dc:subjects': ['finance', 'legal'],
        'dc:coverage': null,
        'dc:description': '',
        'dc:contributors': [],
        'uid:major_version': 1,
        'uid:minor_version': 2,
        'file:content': {
          name: 'invoice.pdf',
          'mime-type': 'application/pdf',
          length: '84213',
          data: 'http://localhost:8080/nuxeo/nxfile/default/doc-1/file:content/invoice.pdf',
          digest: 'abc123',
        },
        unprefixed: 'ignored',
      },
    } as unknown as Parameters<typeof mapNuxeoDocumentToHx>[0];

    it('rewrites the colon Nuxeo uses to the underscore adf-hx addresses properties by', () => {
      // The other half of this is `nuxeo-to-hx-model.mapper.ts`, which keys the model's schema
      // fields the same way. Without both, upstream finds no type for any property and renders
      // every value as an untyped string.
      const hx = mapNuxeoDocumentToHx(invoice);
      expect(hx['dc_title']).toBe('Invoice');
      expect(hx['dc_nature']).toBe('contract');
      expect(hx['dc_subjects']).toEqual(['finance', 'legal']);
      expect(hx['uid_major_version']).toBe(1);
    });

    it('omits properties Nuxeo holds no value for', () => {
      // Upstream lists properties from `Object.keys(document)`, so a `properties: *` read would
      // otherwise contribute around a hundred blank cards from schemas the document never used.
      const hx = mapNuxeoDocumentToHx(invoice);
      expect('dc_coverage' in hx).toBe(false);
      expect('dc_description' in hx).toBe(false);
      expect('dc_contributors' in hx).toBe(false);
    });

    it('skips a key with no prefix, which would render a card with no label', () => {
      // `translateProperty` splits on `_` and returns an empty label when there is none.
      expect('unprefixed' in mapNuxeoDocumentToHx(invoice)).toBe(false);
    });

    it("reshapes a blob to the three fields adf-core's blob card reads", () => {
      // `createBlobCardItems` builds cards from `.filename`, `.mimeType` and `.length`; Nuxeo
      // names the same three `name`, `mime-type` and `length`.
      expect(mapNuxeoDocumentToHx(invoice)['file_content']).toEqual({
        filename: 'invoice.pdf',
        mimeType: 'application/pdf',
        // Coerced: Nuxeo sends the length as a string, and the card formats a number.
        length: 84213,
      });
    });

    it('drops the blob download URL rather than showing it as metadata', () => {
      const blob = mapNuxeoDocumentToHx(invoice)['file_content'] as Record<string, unknown>;
      expect('data' in blob).toBe(false);
      expect('digest' in blob).toBe(false);
    });

    it('no longer emits the custom hx: keys at all', () => {
      // They duplicated Dublin Core under names no adf-hx component reads, and would have
      // rendered in the adopted metadata panel as cards with no label.
      const hx = mapNuxeoDocumentToHx(invoice);
      expect(Object.keys(hx).filter((k) => k.startsWith('hx:'))).toEqual([]);
    });

    it('lets a sys_ field win over a Nuxeo property of the same name', () => {
      // None collide today — Nuxeo has no `sys` schema — so this asserts the spread ordering
      // rather than an observed conflict.
      const spoofed = {
        ...invoice,
        properties: { ...invoice.properties, 'sys:title': 'from Nuxeo' },
      } as typeof invoice;
      expect(mapNuxeoDocumentToHx(spoofed).sys_title).toBe('Invoice');
    });
  });

  it('builds synthetic repository root', () => {
    const root = syntheticHxRepositoryRoot();
    expect(root.sys_id).toBe('00000000-0000-0000-0000-000000000000');
    expect(root.sys_primaryType).toBe('SysRoot');
    expect(root.sys_isFolderish).toBe(true);
  });
  describe('standard HxPR fields', () => {
    // These three were dropped, which is why upstream's DataTable rendered a blank Last
    // Contributor column: the value existed only under a custom `hx:lastContributor` key that
    // no adf-hx component has heard of. Asserted on the standard names because that is what any
    // upstream component reads. The custom keys are gone entirely — see the Nuxeo property
    // surface tests below.
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
      expect(hx.sys_lastContributor).toEqual({
        id: 'jdoe',
        username: 'jdoe',
        firstName: 'jdoe',
        lastName: '',
      });
    });

    it('maps dc:creator to sys_creator as a User', () => {
      expect(mapNuxeoDocumentToHx(withPeople).sys_creator).toEqual({
        id: 'asmith',
        username: 'asmith',
        firstName: 'asmith',
        lastName: '',
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

    it('composes a readable name from the username, never "undefined undefined"', () => {
      // This assertion is the reverse of what it used to be, and the reason is worth keeping.
      // It previously required firstName/lastName to be **unset**, on the grounds that Nuxeo
      // carries a username only and a guessed name is worse than an honest username. That
      // reasoning was right about not guessing and wrong about the consequence: upstream
      // renders every `User` through `UserResolverService.getFullName`, which is
      // `${firstName} ${lastName}` with no guard, so unset fields rendered the literal string
      // "undefined undefined" in the adopted versions panel.
      //
      // The username is not a guess. Putting it in `firstName` and leaving `lastName` empty
      // composes to the username itself.
      const user = mapNuxeoDocumentToHx(withPeople).sys_lastContributor;
      expect(`${user?.firstName} ${user?.lastName}`.trim()).toBe('jdoe');
      expect(`${user?.firstName} ${user?.lastName}`).not.toContain('undefined');
      // Still not fabricated: there is no plausible email, so none is invented.
      expect(user?.email).toBeUndefined();
    });
  });
});
