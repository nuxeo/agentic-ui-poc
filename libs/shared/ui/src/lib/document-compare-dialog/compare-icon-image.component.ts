import { HttpClient } from '@angular/common/http';
import { Component, effect, inject, input, OnDestroy, signal } from '@angular/core';
import { catchError, of } from 'rxjs';
import { NUXEO_API_ORIGIN, resolveNuxeoIconPath } from '@agentic-ui/shared/nuxeo-client';

@Component({
  selector: 'lib-compare-icon-image',
  standalone: true,
  template: `
    @if (blobUrl()) {
      <img [src]="blobUrl()!" [alt]="alt()" class="compare-icon-image" />
    } @else if (path()) {
      <span class="compare-icon-fallback">{{ path() }}</span>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
    }

    .compare-icon-image {
      width: 16px;
      height: 16px;
      display: block;
    }

    .compare-icon-fallback {
      font-size: 13px;
    }
  `,
})
export class CompareIconImageComponent implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly apiOrigin = inject(NUXEO_API_ORIGIN);

  readonly path = input('');
  readonly alt = input('Document type icon');

  readonly blobUrl = signal<string | null>(null);
  private activeUrl: string | null = null;

  constructor() {
    effect((onCleanup) => {
      const path = this.path();
      this.revokeActiveUrl();
      this.blobUrl.set(null);
      if (!path) return;

      const requestUrl = `${this.apiOrigin.replace(/\/$/, '')}${resolveNuxeoIconPath(path)}`;
      const subscription = this.http
        .get(requestUrl, { responseType: 'blob' })
        .pipe(catchError(() => of(null)))
        .subscribe((blob) => {
          if (!blob) return;
          const objectUrl = URL.createObjectURL(blob);
          this.activeUrl = objectUrl;
          this.blobUrl.set(objectUrl);
        });

      onCleanup(() => {
        subscription.unsubscribe();
        this.revokeActiveUrl();
        this.blobUrl.set(null);
      });
    });
  }

  ngOnDestroy(): void {
    this.revokeActiveUrl();
  }

  private revokeActiveUrl(): void {
    if (!this.activeUrl) return;
    URL.revokeObjectURL(this.activeUrl);
    this.activeUrl = null;
  }
}
