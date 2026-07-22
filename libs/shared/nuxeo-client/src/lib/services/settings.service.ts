import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';

import {
  AuthorizedApplication,
  ConnectedAccount,
  NuxeoOAuth2ServiceProvider,
  NuxeoOAuth2ServiceProviderList,
  NuxeoOAuth2Token,
  NuxeoOAuth2TokenList,
} from '../models/oauth2.model';
import { NuxeoAcl } from '../models/acl.model';
import { NuxeoDocumentList } from '../models/document.model';
import { NuxeoApiBase } from './nuxeo-api-base';

function matchesPrincipal(aceUsername: string, logicalPrincipal: string): boolean {
  if (aceUsername === logicalPrincipal) return true;
  if (aceUsername === `user:${logicalPrincipal}`) return true;
  if (aceUsername === `group:${logicalPrincipal}`) return true;
  return aceUsername.replace(/^(user:|group:)/, '') === logicalPrincipal;
}

export interface LocalPermissionRow {
  on: string;
  right: string;
  timeFrame: string;
  grantedBy: string;
}

export interface SynchronizationRootRow {
  id: string;
  title: string;
  path: string;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly api = inject(NuxeoApiBase);

  getLocalPermissions(username: string, pageSize = 25): Observable<LocalPermissionRow[]> {
    return this.queryPermissions(username, pageSize);
  }

  private queryPermissions(principal: string, pageSize: number): Observable<LocalPermissionRow[]> {
    const safePrincipal = principal.replace(/'/g, "''");
    const nxql =
      `SELECT * FROM Document WHERE ecm:mixinType != "HiddenInNavigation" ` +
      `AND ecm:isProxy = 0 AND ecm:isVersion = 0 AND ecm:isTrashed = 0 ` +
      `AND (` +
      `(ecm:acl/*1/principal = '${safePrincipal}' AND ecm:acl/*1/name = 'local') OR ` +
      `(ecm:acl/*1/principal = 'user:${safePrincipal}' AND ecm:acl/*1/name = 'local') OR ` +
      `(ecm:acl/*1/principal = 'group:${safePrincipal}' AND ecm:acl/*1/name = 'local')` +
      `)`;

    return this.api
      .post<NuxeoDocumentList>(
        '/nuxeo/api/v1/automation/Repository.Query',
        {
          params: { query: nxql, page: 0, pageSize },
          context: {},
        },
        {
          'X-NXContext-Category': 'acls',
          'X-NXRepository': 'default',
          'enrichers-document': 'acls',
          properties: '*',
        },
      )
      .pipe(
        map((res) => {
          const rows: LocalPermissionRow[] = [];

          for (const doc of res.entries ?? []) {
            rows.push(...this.extractLocalPermissionRows(doc, principal));
          }

          return rows;
        }),
      );
  }

  getConnectedAccounts(): Observable<ConnectedAccount[]> {
    return forkJoin({
      providers: this.getProviders(),
      tokens: this.getProviderTokens(),
    }).pipe(
      map(({ providers, tokens }) => {
        const providersByName = new Map(
          providers.entries.map((provider) => [provider.serviceName, provider] as const),
        );

        return tokens.entries.map((token) => this.toConnectedAccount(token, providersByName));
      }),
    );
  }

  getAuthorizedApplications(): Observable<AuthorizedApplication[]> {
    return this.api
      .get<NuxeoOAuth2TokenList>('/nuxeo/api/v1/oauth2/token/client', undefined, {
        properties: '*',
      })
      .pipe(map((tokens) => tokens.entries.map((token) => this.toAuthorizedApplication(token))));
  }

  getSynchronizationRoots(): Observable<SynchronizationRootRow[]> {
    return this.api
      .post<{ entries?: Array<{ uid?: string; id?: string; title?: string; path?: string }> }>(
        '/nuxeo/api/v1/automation/NuxeoDrive.GetRoots',
        {
          params: {},
          context: {},
        },
        {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-NXRepository': 'default',
          properties: '*',
        },
      )
      .pipe(
        map((response) =>
          (response.entries ?? []).map((entry) => ({
            id: entry.uid?.trim() || entry.id?.trim() || '',
            title: entry.title?.trim() || '—',
            path: entry.path?.trim() || '—',
          })),
        ),
      );
  }

  setSynchronizationRoot(rootId: string, enable: boolean): Observable<unknown> {
    return this.api.post<unknown>(
      '/nuxeo/api/v1/automation/NuxeoDrive.SetSynchronization',
      {
        params: { enable },
        context: {},
        input: rootId,
      },
      {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-NXRepository': 'default',
        properties: '*',
      },
    );
  }

  private getProviders(): Observable<NuxeoOAuth2ServiceProviderList> {
    return this.api.get<NuxeoOAuth2ServiceProviderList>(
      '/nuxeo/api/v1/oauth2/provider/',
      undefined,
      {
        properties: '*',
      },
    );
  }

  private getProviderTokens(): Observable<NuxeoOAuth2TokenList> {
    return this.api.get<NuxeoOAuth2TokenList>('/nuxeo/api/v1/oauth2/token/provider', undefined, {
      properties: '*',
    });
  }

  private toConnectedAccount(
    token: NuxeoOAuth2Token,
    providersByName: Map<string, NuxeoOAuth2ServiceProvider>,
  ): ConnectedAccount {
    const provider = providersByName.get(token.serviceName);

    return {
      serviceName: provider?.serviceName ?? token.serviceName,
      nuxeoLogin: token.nuxeoLogin,
      serviceLogin: token.serviceLogin,
      creationDate: token.creationDate,
      shared: token.isShared,
    };
  }

  private toAuthorizedApplication(token: NuxeoOAuth2Token): AuthorizedApplication {
    return {
      name: token.clientId ?? token.serviceName,
      authorizationDate: token.creationDate,
    };
  }

  changePassword(oldPassword: string, newPassword: string): Observable<void> {
    return this.api.put<void>('/nuxeo/api/v1/me/changepassword', { oldPassword, newPassword });
  }

  /** Web UI profile: local ACL rows only (skip inherited ACLs). */
  private extractLocalPermissionRows(
    doc: { title?: string; path?: string; uid: string; contextParameters?: { acls?: NuxeoAcl[] } },
    logicalPrincipal: string,
  ): LocalPermissionRow[] {
    const localAcl = (doc.contextParameters?.acls ?? []).find((acl) => acl.name === 'local');
    if (!localAcl?.aces?.length) {
      return [];
    }

    const title = doc.title || doc.uid;
    const on = doc.path ? `${title} (${doc.path})` : title;
    const rows: LocalPermissionRow[] = [];

    for (const ace of localAcl.aces) {
      if (!ace.granted) continue;
      if (ace.status === 'archived') continue;
      if (!matchesPrincipal(ace.username, logicalPrincipal)) continue;

      rows.push({
        on,
        right: ace.permission,
        timeFrame: this.formatTimeFrame(ace.begin, ace.end),
        grantedBy: ace.creator || '—',
      });
    }

    return rows;
  }

  private formatTimeFrame(begin: string | null, end: string | null): string {
    if (!begin && !end) {
      return 'Permanent';
    }

    if (begin && end) {
      return `${begin} → ${end}`;
    }

    if (begin) {
      return `From ${begin}`;
    }

    return `Until ${end}`;
  }
}
