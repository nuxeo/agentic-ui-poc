import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { TestBed, type ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { Document } from '@hylandsoftware/hxcs-js-client';
import { DOCUMENT_API_TOKEN } from '@alfresco/adf-hx-content-services/api';
import {
  DocumentService,
  PermissionsManagementFacade,
  type PermissionsManagementRow,
} from '@alfresco/adf-hx-content-services/services';
import { PermissionsManagementPanelComponent } from '@alfresco/adf-hx-content-services/ui';

import { ADF_HX_NUXEO_BRIDGE_PROVIDERS } from '@agentic-ui/shared/adf-hx-bridge/providers';

/**
 * adf-core's `TranslationService` duck-types the ngx-translate loader — five methods that are not
 * on `TranslateLoader`. The long version of why is on `AppTranslateLoader` in `apps/nuxeo-ui`;
 * reusing that class here would pull `AppConfigService` and the manifest into a permissions test,
 * so this is the same contract with no catalogue behind it. Assertions below are on structure and
 * on data, never on a translated string.
 */
@Injectable()
class StubAdfTranslateLoader implements TranslateLoader {
  getTranslation(): Observable<Record<string, string>> {
    return of({});
  }
  setDefaultLang(): void {
    /* no catalogue to switch */
  }
  providerRegistered(): boolean {
    return true;
  }
  registerProvider(): void {
    /* no catalogue to extend */
  }
  getFullTranslationJSON(): Record<string, string> {
    return {};
  }
  init(): void {
    /* nothing to prime */
  }
}

/**
 * The **real** upstream permissions panel, driven by the **real** bridge port, over Nuxeo's own ACL
 * payloads.
 *
 * This is an integration test on purpose. Every interesting failure in this adoption is at the seam
 * rather than inside either side of it:
 *
 * - Upstream builds one row per principal from `sys_effectiveAcl`, then calls an ACE *local* only if
 *   it also appears in `sys_acl`. A port that fills one field and leaves the other empty renders a
 *   plausible table that is wrong in both directions — every inherited grant shown as a local one,
 *   and a save that writes them back as local. A unit test of the mapper cannot see that; only
 *   feeding a real payload through `NuxeoDocumentApi` into the real component can.
 * - Nuxeo signals blocked inheritance with a deny-everything ACE for `Everyone`; upstream
 *   recognises the same marker only as `user.id === '__Everyone__'`. Untranslated, the panel shows
 *   inheritance *on* for a document where Nuxeo has switched it off, and its toggle then writes the
 *   opposite of what it displays.
 *
 * The ACL fixtures are the local Nuxeo's answer for `/default-domain/workspaces`, not invented
 * shapes. Every HTTP exchange goes through `HttpTestingController`, so the Nuxeo calls the save path
 * issues are pinned too — Nuxeo has no replace-an-ACL operation, and the clear-then-replay sequence
 * that stands in for one is the part most likely to regress silently.
 */
describe('adf-hx PermissionsManagementPanelComponent over Nuxeo ACLs', () => {
  let httpMock: HttpTestingController;
  let documentApi: { getDocumentById(id: string): Promise<{ data: Document }> };
  let fixture: ComponentFixture<PermissionsManagementPanelComponent> | undefined;

  /**
   * `ComponentFixture.nativeElement` is `any`, which makes `querySelectorAll<T>()` on it an
   * untyped call that cannot take a type argument. Returning it as `HTMLElement` types the
   * DOM queries below without a cast.
   */
  const host = (): HTMLElement => fixture!.nativeElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: StubAdfTranslateLoader },
        }),
      ],
      providers: [
        provideNoopAnimations(),
        ...ADF_HX_NUXEO_BRIDGE_PROVIDERS,
        // No `providedIn` upstream, exactly as in `apps/nuxeo-ui/src/app/app.config.ts`.
        DocumentService,
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    documentApi = TestBed.inject(DOCUMENT_API_TOKEN);
  });

  afterEach(() => {
    fixture?.destroy();
    fixture = undefined;
    httpMock.verify();
  });

  const ace = (
    username: string,
    permission: string,
    granted = true,
    creator: string | null = null,
  ) => ({
    id: `${username}:${permission}:${granted}:${creator ?? ''}::`,
    username,
    externalUser: false,
    permission,
    granted,
    creator,
    begin: null,
    end: null,
    status: 'effective',
  });

  /**
   * `/default-domain/workspaces` as the local instance answers it. `Administrator` appears in both
   * ACLs — with a `creator` locally and without one inherited — which is what makes that row
   * *overridden* rather than simply local, and is why the fixture keeps the field.
   */
  const WORKSPACES_ACLS = [
    {
      name: 'local',
      aces: [
        ace('Administrator', 'Everything', true, 'Administrator'),
        ace('administrators', 'Everything'),
      ],
    },
    {
      name: 'inherited',
      aces: [ace('Administrator', 'Everything'), ace('members', 'Read')],
    },
  ];

  const nuxeoDocument = (acls: unknown) => ({
    'entity-type': 'document',
    uid: 'ws-1',
    path: '/default-domain/workspaces',
    type: 'WorkspaceRoot',
    title: 'Workspaces',
    lastModified: '2025-11-15T06:09:20.552Z',
    properties: {},
    contextParameters: { acls },
  });

  /** Drains the microtask queue, so the `await`s inside the port run before the next expectation. */
  const settle = async () => {
    for (let i = 0; i < 12; i += 1) await Promise.resolve();
  };

  /**
   * Nuxeo's ACE does not say whether a principal is a user or a group, so the port probes the
   * directory per distinct name — group first, user second. See `NuxeoPrincipalResolver`.
   */
  function resolveGroup(name: string, label: string) {
    httpMock
      .expectOne((r) => r.url === `/nuxeo/api/v1/group/${name}`)
      .flush({ 'entity-type': 'group', groupname: name, grouplabel: label });
  }

  function resolveUser(name: string, firstName: string, lastName: string) {
    httpMock
      .expectOne((r) => r.url === `/nuxeo/api/v1/group/${name}`)
      .flush({}, { status: 404, statusText: 'Not Found' });
    httpMock
      .expectOne((r) => r.url === `/nuxeo/api/v1/user/${name}`)
      .flush({
        'entity-type': 'user',
        id: name,
        properties: { username: name, firstName, lastName },
      });
  }

  /** Reads the document through the port, exactly as the POC page's Permissions tab does. */
  async function loadWorkspaces(): Promise<Document> {
    const pending = documentApi.getDocumentById('ws-1');
    httpMock
      .expectOne((r) => r.url === '/nuxeo/api/v1/id/ws-1')
      .flush(nuxeoDocument(WORKSPACES_ACLS));
    await settle();

    resolveGroup('administrators', 'Administrators group');
    resolveGroup('members', 'Members group');
    resolveUser('Administrator', 'Kate', 'Ashley');
    await settle();

    return (await pending).data;
  }

  function renderPanel(document: Document): PermissionsManagementFacade {
    fixture = TestBed.createComponent(PermissionsManagementPanelComponent);
    fixture.componentInstance.document = document;
    // Only read when Nuxeo has blocked inheritance, in which case the effective ACL no longer
    // carries the parent's ACEs. Empty here for the same reason the POC supplies a placeholder when
    // the parent is unreadable: an unreadable parent must not fabricate permissions.
    fixture.componentInstance.parentDocument = { sys_primaryType: '', sys_effectiveAcl: [] };
    fixture.detectChanges();

    // The facade is provided by `hxp-permission-management-container`, so the root injector's
    // instance is a different one. Reaching for the component's own is what makes the assertions
    // below about the rendered panel rather than about a second copy of its state.
    return fixture.debugElement
      .query(By.css('hxp-permission-management-container'))
      .injector.get(PermissionsManagementFacade);
  }

  const groupRowLabels = (): string[] =>
    Array.from(
      // The Groups tab renders its entity cell as a `span`; the Users tab uses a `div`. Both tab
      // bodies are instantiated by `mat-tab-group`, so the tag matters.
      host().querySelectorAll<HTMLElement>('span.hxp-entity-label'),
      (el) => el.textContent?.trim() ?? '',
    );

  const rowsOf = (facade: PermissionsManagementFacade): PermissionsManagementRow[] => {
    let rows: PermissionsManagementRow[] = [];
    facade.api.permissionsManagementRows$.subscribe((value) => (rows = value)).unsubscribe();
    return rows;
  };

  it('fills sys_acl and sys_effectiveAcl separately, which is what makes local distinguishable from inherited', async () => {
    const document = await loadWorkspaces();

    const principal = (a: { user?: { username?: string }; group?: { id?: string } }) =>
      a.user?.username ?? a.group?.id;

    // Load-bearing, and the whole reason the port grew a second ACL read: `sys_acl` is this
    // document's own ACL, `sys_effectiveAcl` is every ACE in force. Equal contents would make the
    // panel treat all four as local.
    expect(document.sys_acl?.map(principal)).toEqual(['Administrator', 'administrators']);
    expect(document.sys_effectiveAcl?.map(principal)).toEqual([
      'Administrator',
      'administrators',
      'Administrator',
      'members',
    ]);
  });

  it('renders one row per principal, resolved to display names rather than Nuxeo ids', async () => {
    const facade = renderPanel(await loadWorkspaces());

    // Rendered DOM, from the real component. Nuxeo's ACL says `administrators` and `members`; these
    // are the `grouplabel`s the group port resolved.
    expect(groupRowLabels()).toEqual(['Administrators group', 'Members group']);

    const user = rowsOf(facade).find((row) => row.entityType === 'user');
    expect(user?.entityLabel).toBe('Kate Ashley');
  });

  it('classifies each ACE as local, inherited or overridden the way Nuxeo means it', async () => {
    const rows = rowsOf(renderPanel(await loadWorkspaces()));
    const row = (entityId: string) => rows.find((r) => r.entityId === entityId);

    // Local only: granted on this document, nothing inherited for it.
    expect(row('administrators')).toMatchObject({
      permission: 'Everything',
      inheritedPermission: 'None',
      inherited: false,
      overridden: false,
    });
    // Inherited only. This is the assertion a single-field port fails: with `sys_effectiveAcl`
    // empty and everything in `sys_acl`, `members` came through as a *local* `Read`.
    expect(row('members')).toMatchObject({
      permission: undefined,
      inheritedPermission: 'Read',
      inherited: true,
      overridden: false,
    });
    // In both ACLs, so the local grant overrides an inherited one of its own.
    expect(row('Administrator')).toMatchObject({
      permission: 'Everything',
      inheritedPermission: 'Everything',
      inherited: true,
      overridden: true,
    });
  });

  it('blocks inheritance from the panel and writes it to Nuxeo as clear, replay, block', async () => {
    renderPanel(await loadWorkspaces());

    // Save is disabled until something changes, so this also proves the toggle registered.
    const save = host().querySelector<HTMLButtonElement>('.hxp-save-permission-button');
    expect(save?.disabled).toBe(true);

    // Driven through the DOM: the inheritance toggle's OFF button, as a user would.
    const [off] = host().querySelectorAll<HTMLButtonElement>('mat-button-toggle button');
    off.click();
    fixture!.detectChanges();
    expect(save?.disabled).toBe(false);

    save!.click();
    await settle();

    // First the port re-reads the document, before touching anything. Upstream's panel can only
    // represent Read/ReadWrite/Everything, so a local ACL holding anything else would be deleted by
    // the clear below; the read is what lets the write be refused instead. These ACLs hold only
    // `Everything`, so the save proceeds.
    httpMock
      .expectOne((r) => r.url === '/nuxeo/api/v1/id/ws-1')
      .flush(nuxeoDocument(WORKSPACES_ACLS));
    await settle();

    // Nuxeo has no operation that replaces an ACL, so the port clears the local ACL and replays the
    // grants the panel kept. The window between the two is real and documented on the port.
    const cleared = httpMock.expectOne(
      (r) => r.url === '/nuxeo/api/v1/id/ws-1/@op/Document.RemoveACL',
    );
    expect(cleared.request.body).toEqual({ params: { acl: 'local' }, context: {} });
    cleared.flush(nuxeoDocument([]));
    await settle();

    const granted: { username?: string; permission?: string }[] = [];
    for (let i = 0; i < 2; i += 1) {
      const call = httpMock.expectOne(
        (r) => r.url === '/nuxeo/api/v1/automation/Document.AddPermission',
      );
      granted.push(call.request.body.params);
      call.flush(nuxeoDocument([]));
      await settle();
    }

    // Two grants, not three. `members` was inherited-only, so it has no local permission to replay
    // — an inherited grant must not be rewritten as a local one. Nuxeo also takes one `username`
    // parameter for users and groups alike and resolves the kind itself.
    expect(granted).toEqual([
      expect.objectContaining({ username: 'Administrator', permission: 'Everything' }),
      expect.objectContaining({ username: 'administrators', permission: 'Everything' }),
    ]);

    // The deny-everything marker is Nuxeo's own operation rather than a third `AddPermission`, and
    // it goes last: Nuxeo appends to the ACL, and a deny ahead of a grant would shadow it.
    const blocked = httpMock.expectOne(
      (r) => r.url === '/nuxeo/api/v1/id/ws-1/@op/Document.BlockPermissionInheritance',
    );
    blocked.flush(nuxeoDocument([]));
    await settle();

    // The port re-reads the document, which is what `DocumentService.updateDocument` returns.
    httpMock.expectOne((r) => r.url === '/nuxeo/api/v1/id/ws-1').flush(nuxeoDocument([]));
    await settle();
  });

  it('shows inheritance as off when Nuxeo has blocked it', async () => {
    // Nuxeo's representation of a blocked ACL: a local deny-everything ACE for `Everyone`, and no
    // `inherited` ACL in the payload at all.
    const pending = documentApi.getDocumentById('ws-1');
    httpMock
      .expectOne((r) => r.url === '/nuxeo/api/v1/id/ws-1')
      .flush(nuxeoDocument([{ name: 'local', aces: [ace('Everyone', 'Everything', false)] }]));
    await settle();

    // Negative, with teeth: `Everyone` is not a directory entry, and resolving it would answer the
    // name `Everyone`, which upstream does not recognise as the marker. `httpMock.verify()` in
    // `afterEach` fails if a probe is issued anyway.
    httpMock.expectNone((r) => r.url.includes('/group/Everyone'));
    httpMock.expectNone((r) => r.url.includes('/user/Everyone'));

    const document = (await pending).data;
    expect(document.sys_acl?.[0]?.user?.id).toBe('__Everyone__');

    const facade = renderPanel(document);
    let enabled: boolean | undefined;
    facade.api.isInheritanceEnabled$.subscribe((value) => (enabled = value)).unsubscribe();
    expect(enabled).toBe(false);

    // And the panel says so: the ON half of the toggle is not the checked one.
    const [off, on] = host().querySelectorAll<HTMLButtonElement>('mat-button-toggle button');
    expect(off.getAttribute('aria-checked')).toBe('true');
    expect(on.getAttribute('aria-checked')).toBe('false');
  });

  it('refuses a property update it cannot honour instead of half-applying it', async () => {
    // `PermissionsDataAccessService` is the only upstream caller of `updateDocumentById`, and it
    // sends exactly `{ sys_acl }`. Accepting anything else would claim a capability this port does
    // not have — Nuxeo's ACL operations cannot write document properties.
    const api = documentApi as unknown as {
      updateDocumentById(id: string, repo: string, body: Record<string, unknown>): Promise<unknown>;
    };
    await expect(
      api.updateDocumentById('ws-1', 'default', { sys_title: 'renamed' }),
    ).rejects.toThrow(/not implemented in Scope A beyond sys_acl; received sys_title/);
  });
});
