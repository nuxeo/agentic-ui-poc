import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { NUXEO_SERVER_URL } from '../nuxeo-api.config';
import { CURRENT_USERNAME } from '../current-user.token';
import { NuxeoApiBase } from './nuxeo-api-base';

@Injectable({ providedIn: 'root' })
export class NuxeoDriveService {
  private readonly api = inject(NuxeoApiBase);
  private readonly http = inject(HttpClient);
  private readonly serverUrl = inject(NUXEO_SERVER_URL);
  private readonly currentUsername = inject(CURRENT_USERNAME);

  private get baseUrl(): string {
    return this.serverUrl;
  }

  private get username(): string {
    return this.currentUsername() ?? 'Administrator';
  }

  /**
   * Checks whether Nuxeo Drive has a registered token (i.e. is installed
   * and has been connected at least once). This mirrors the native Nuxeo
   * Web UI approach: GET /api/v1/token?application=Nuxeo Drive
   */
  hasDriveToken(): Observable<boolean> {
    return this.http
      .get<{
        entries: unknown[];
      }>(this.api.apiUrl('/nuxeo/api/v1/token'), { params: { application: 'Nuxeo Drive' } })
      .pipe(
        map((res) => (res.entries?.length ?? 0) > 0),
        catchError(() => of(false)),
      );
  }

  buildEditUrl(docUid: string, blobUrl: string, filename: string): string {
    const parts = blobUrl.split('/nxfile/');
    const downloadUrl = parts.length > 1 ? `nxfile/${parts[1]}` : '';

    return [
      'nxdrive://edit',
      this.baseUrl.replace('://', '/'),
      'user',
      this.username,
      'repo',
      'default',
      'nxdocid',
      docUid,
      'filename',
      encodeURIComponent(filename),
      ...(downloadUrl ? ['downloadUrl', downloadUrl] : []),
    ].join('/');
  }

  buildDirectTransferUrl(docPath: string): string {
    return [
      'nxdrive://direct-transfer',
      this.baseUrl.replace('://', '/'),
      docPath.startsWith('/') ? docPath.slice(1) : docPath,
    ].join('/');
  }

  openDriveUrl(url: string): void {
    // Use a hidden anchor click so the OS protocol handler (Nuxeo Drive) is triggered
    // without navigating the current tab away from the app. window.open(_top) causes
    // ERR_UNKNOWN_URL_SCHEME in Chrome for custom protocol schemes.
    const a = document.createElement('a');
    a.href = url;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => document.body.removeChild(a), 500);
  }
}
