import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { Document } from '@hylandsoftware/hxcs-js-client';
import { BrowseService, DocumentDetailService } from '@nuxeo-satori/platform/nuxeo-client';
import { catchError, Observable, of, switchMap } from 'rxjs';

@Injectable()
export class AdfHxBrowseMediaService {
  private readonly browseService = inject(BrowseService);
  private readonly detailService = inject(DocumentDetailService);
  private readonly thumbnailBlobUrls: string[] = [];

  loadThumbnails(
    documents: Document[],
    onUpdate: (map: Record<string, string>) => void,
    destroyRef: DestroyRef,
    reset = true,
  ): void {
    if (reset) {
      this.revokeThumbnails();
      onUpdate({});
    }

    for (const doc of documents) {
      const id = doc.sys_id;
      if (!id) {
        continue;
      }

      this.detailService
        .fetchThumbnail(id)
        .pipe(
          catchError(() => of(null)),
          takeUntilDestroyed(destroyRef),
        )
        .subscribe((blob) => {
          if (!blob) {
            return;
          }
          const url = URL.createObjectURL(blob);
          this.thumbnailBlobUrls.push(url);
          onUpdate({ [id]: url });
        });
    }
  }

  revokeThumbnails(): void {
    for (const url of this.thumbnailBlobUrls) {
      URL.revokeObjectURL(url);
    }
    this.thumbnailBlobUrls.length = 0;
  }

  /**
   * Revokes only the given thumbnail URLs, for a caller showing two lists from one service: a
   * `reset` or {@link revokeThumbnails} would revoke the other list's images too.
   */
  revokeThumbnailUrls(urls: Iterable<string>): void {
    for (const url of urls) {
      const at = this.thumbnailBlobUrls.indexOf(url);
      if (at === -1) continue;
      URL.revokeObjectURL(url);
      this.thumbnailBlobUrls.splice(at, 1);
    }
  }

  exportCsv(parentUid: string): Observable<Blob> {
    return this.browseService
      .startCsvExport(parentUid)
      .pipe(switchMap((commandId) => this.browseService.pollAndDownloadCsv(commandId)));
  }

  /**
   * CSV of the repository root's children.
   *
   * The bridge's root is a synthetic document with no Nuxeo uid, and exporting its children
   * failed outright; this resolves the real root first, as production browse exports it.
   */
  exportCsvOfRepositoryRoot(): Observable<Blob> {
    return this.browseService
      .getRepositoryRoot()
      .pipe(switchMap((root) => this.exportCsv(root.uid)));
  }

  exportZip(parentUid: string): Observable<Blob> {
    return this.detailService.exportZip(parentUid);
  }
}
