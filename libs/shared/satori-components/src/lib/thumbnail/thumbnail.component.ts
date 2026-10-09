import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap, tap } from 'rxjs';

import { DocumentDetailService } from '@nuxeo-satori/platform/nuxeo-client';

/**
 * A document's thumbnail rendition, fetched through the authenticated client and shown from a blob
 * URL that this component owns: it is revoked when the document changes and when the component is
 * destroyed, so no caller creates or revokes one.
 *
 * Until the image arrives — and when there is none, the request fails or the bytes do not decode —
 * the projected content shows instead, usually the document-type icon. While it shows, the host
 * has no box of its own (`display: contents`), so the fallback lays out exactly as it would without
 * this wrapper. Size the thumbnail with a class on the host; the image fills it and takes the host's
 * `object-fit` and `border-radius`. Do not set `display` on the host.
 *
 * Decorative by default, like Web UI's `nuxeo-document-thumbnail`: a blank `alt` hides it from
 * assistive technology, because the title beside it already names the document.
 */
@Component({
  selector: 'nxs-thumbnail',
  standalone: true,
  templateUrl: './thumbnail.component.html',
  styleUrl: './thumbnail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'nxs-thumbnail',
    '[class.nxs-thumbnail--empty]': 'url() === null',
  },
})
export class NxsThumbnailComponent {
  /** The document whose `thumbnail` rendition to show. */
  readonly documentId = input.required<string>();
  /** The image's text alternative, already translated. Blank marks it decorative. */
  readonly alt = input('');

  protected readonly url = signal<string | null>(null);

  private readonly documents = inject(DocumentDetailService);

  constructor() {
    toObservable(this.documentId)
      .pipe(
        // Cleared before the next request rather than when it answers, so a changed document never
        // shows the previous one's image, even for the length of a request.
        tap(() => this.clear()),
        switchMap((id) =>
          id ? this.documents.fetchThumbnail(id).pipe(catchError(() => of(null))) : of(null),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((blob) => {
        if (blob && blob.size > 0) this.url.set(URL.createObjectURL(blob));
      });
    inject(DestroyRef).onDestroy(() => this.clear());
  }

  /** The bytes arrived but are not an image the browser can draw. */
  protected broken(): void {
    this.clear();
  }

  private clear(): void {
    const url = this.url();
    if (url) URL.revokeObjectURL(url);
    this.url.set(null);
  }
}
