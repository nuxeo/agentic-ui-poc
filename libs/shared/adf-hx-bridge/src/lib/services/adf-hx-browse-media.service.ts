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

  exportCsv(parentUid: string): Observable<Blob> {
    return this.browseService
      .startCsvExport(parentUid)
      .pipe(switchMap((commandId) => this.browseService.pollAndDownloadCsv(commandId)));
  }

  exportZip(parentUid: string): Observable<Blob> {
    return this.detailService.exportZip(parentUid);
  }
}
