import { inject, Injectable } from '@angular/core';
import { NUXEO_API_ORIGIN } from '../nuxeo-api.config';
import { CURRENT_USERNAME } from '../current-user.token';

@Injectable({ providedIn: 'root' })
export class NuxeoDriveService {
  private readonly apiOrigin = inject(NUXEO_API_ORIGIN);
  private readonly currentUsername = inject(CURRENT_USERNAME);

  private get serverUrl(): string {
    const origin = this.apiOrigin || window.location.origin;
    return `${origin}/nuxeo`;
  }

  private get username(): string {
    return this.currentUsername() ?? 'Administrator';
  }

  buildEditUrl(docUid: string, filename: string): string {
    const server = encodeURIComponent(this.serverUrl);
    const user = encodeURIComponent(this.username);
    const file = encodeURIComponent(filename);
    return `nxdrive://edit/${server}/user/${user}/repo/default/nxdocid/${docUid}/filename/${file}`;
  }

  buildTokenUrl(): string {
    const server = encodeURIComponent(this.serverUrl);
    const user = encodeURIComponent(this.username);
    return `nxdrive://token/${server}/user/${user}/repo/default`;
  }

  /**
   * Attempts to open a nxdrive:// URL. Resolves to `true` if the browser
   * handed off to an external app (window lost focus), `false` on timeout.
   */
  tryOpenDrive(nxdriveUrl: string): Promise<boolean> {
    return new Promise((resolve) => {
      let resolved = false;
      const done = (result: boolean) => {
        if (resolved) return;
        resolved = true;
        cleanup();
        resolve(result);
      };

      const timer = setTimeout(() => done(false), 2000);

      const onBlur = () => done(true);
      window.addEventListener('blur', onBlur, { once: true });

      const cleanup = () => {
        clearTimeout(timer);
        window.removeEventListener('blur', onBlur);
      };

      window.location.href = nxdriveUrl;
    });
  }
}
