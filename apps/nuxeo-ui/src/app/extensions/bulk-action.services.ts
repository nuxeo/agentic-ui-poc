import { DestroyRef, Injectable, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, forkJoin, of } from 'rxjs';

import {
  BrowseContextService,
  DocumentDetailService,
  NuxeoDocument,
  SelectionService,
  readClipboardDocs,
  writeClipboardDocs,
} from '@nuxeo-satori/platform/nuxeo-client';
import {
  ConfirmDialogComponent,
  openDocumentCompareDialog,
  trashSelectedDocumentsConfirmData,
} from '@nuxeo-satori/platform/ui';
import type { ExtensionActionHandler } from '@nuxeo-satori/platform/extensions';

/**
 * The packaged bulk actions, one service per action.
 *
 * The shape is adf-hx's — `ContentDeleteActionService`, `ContentShareActionService`,
 * `SingleItemDownloadActionService` and friends in the published package's `/ui`
 * entry point are each an injectable service performing one action. Phase 3
 * adopts those components, so a handler registered here can be replaced by the
 * upstream service under the same descriptor id without touching the topbar.
 *
 * Before this, each of these was a method on `AppShellComponent` reached through
 * a named `@Output()` on `SelectionTopbarComponent`. The shell no longer knows
 * these actions exist.
 *
 * **None of this is a permission check.** Nuxeo evaluates the real ACL
 * server-side on every one of these operations.
 */

/** Trash every selected document, after confirmation. */
@Injectable({ providedIn: 'root' })
export class BulkDeleteActionService implements ExtensionActionHandler {
  private readonly selection = inject(SelectionService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly browseContext = inject(BrowseContextService);
  private readonly destroyRef = inject(DestroyRef);

  execute(): void {
    const count = this.selection.selectedCount();
    if (count === 0) return;

    this.dialog
      .open(ConfirmDialogComponent, { data: trashSelectedDocumentsConfirmData(count) })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) {
          this.selection.clear();
          return;
        }

        this.selection
          .deleteSelected()
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => this.browseContext.requestTreeRefresh(),
            error: (err) => {
              console.error('Failed to delete selected documents', err);
              this.snackBar.open(deleteErrorMessage(err), 'Dismiss', { duration: 5000 });
              this.selection.clear();
            },
          });
      });
  }
}

/** Open the publish dialog for the first selected document. */
@Injectable({ providedIn: 'root' })
export class BulkPublishActionService implements ExtensionActionHandler {
  private readonly selection = inject(SelectionService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly detail = inject(DocumentDetailService);
  private readonly destroyRef = inject(DestroyRef);

  execute(): void {
    const selected = this.selection.selectedItems();
    if (selected.length === 0) return;

    const first = selected[0];
    if (selected.length > 1) {
      this.snackBar.open('Opening publish dialog for the first selected item.', 'Dismiss', {
        duration: 3000,
      });
    }

    const openDialog = async (versions: NuxeoDocument[]) => {
      const { PublishDialogComponent } = await import('@agentic-ui/feature-document-detail');
      this.dialog.open(PublishDialogComponent, {
        width: '620px',
        panelClass: 'publish-dialog-panel',
        data: {
          documentUid: first.id,
          documentTitle: first.name,
          versionLabel: 'Current',
          renditions: [
            { name: 'thumbnail', label: 'Thumbnail' },
            { name: 'pdf', label: 'PDF' },
            { name: 'zipExport', label: 'ZIP Export' },
            { name: 'xmlExport', label: 'XML Export' },
          ],
          versions,
        },
      });
    };

    this.detail
      .getVersions(first.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => void openDialog(res.entries ?? []),
        error: () => void openDialog([]),
      });
  }
}

/** Add the selection to the local clipboard, skipping items already there. */
@Injectable({ providedIn: 'root' })
export class BulkAddToClipboardActionService implements ExtensionActionHandler {
  private readonly selection = inject(SelectionService);
  private readonly snackBar = inject(MatSnackBar);

  execute(): void {
    const selected = this.selection.selectedItems();
    if (selected.length === 0) return;

    const current = readClipboardDocs();
    const existing = new Set(current.map((item) => item.uid));
    const additions = selected
      .filter((item) => !existing.has(item.id))
      .map((item) => ({
        uid: item.id,
        title: item.name,
        ...(item.type ? { type: item.type } : {}),
      }));

    writeClipboardDocs([...current, ...additions]);
    window.dispatchEvent(new Event('clipboard-changed'));

    this.snackBar.open(
      additions.length > 0
        ? `Added ${additions.length} item(s) to clipboard.`
        : 'Selected items are already in clipboard.',
      'Dismiss',
      { duration: 3000 },
    );
  }
}

/** Add every selected document to a collection chosen in the dialog. */
@Injectable({ providedIn: 'root' })
export class BulkAddToCollectionActionService implements ExtensionActionHandler {
  private readonly selection = inject(SelectionService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly detail = inject(DocumentDetailService);
  private readonly destroyRef = inject(DestroyRef);

  execute(): void {
    const selected = this.selection.selectedItems();
    if (selected.length === 0) return;

    void import('@agentic-ui/feature-document-detail').then(
      ({ AddToCollectionDialogComponent }) => {
        this.dialog
          .open(AddToCollectionDialogComponent, { width: '440px', autoFocus: false })
          .afterClosed()
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe((collectionId: string | undefined) => {
            if (!collectionId) return;

            forkJoin(
              selected.map((item) =>
                this.detail.addToCollection(item.id, collectionId).pipe(catchError(() => of(null))),
              ),
            )
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe((results) => {
                const success = results.filter((result) => !!result).length;
                this.snackBar.open(`Added ${success} item(s) to collection.`, 'Dismiss', {
                  duration: 3000,
                });
              });
          });
      },
    );
  }
}

/** Download the selection as a single ZIP. */
@Injectable({ providedIn: 'root' })
export class BulkDownloadZipActionService implements ExtensionActionHandler {
  private readonly selection = inject(SelectionService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly detail = inject(DocumentDetailService);
  private readonly destroyRef = inject(DestroyRef);

  execute(): void {
    const selected = this.selection.selectedItems();
    if (selected.length === 0) return;

    const zipFileName = `selected-documents-${Date.now()}.zip`;
    this.detail
      .bulkDownload(
        selected.map((item) => item.id),
        zipFileName,
      )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = zipFileName;
          anchor.click();
          URL.revokeObjectURL(url);
        },
        error: () =>
          this.snackBar.open('Failed to download selected documents as ZIP.', 'Dismiss', {
            duration: 4000,
          }),
      });
  }
}

/** Open the side-by-side comparison dialog. */
@Injectable({ providedIn: 'root' })
export class BulkCompareActionService implements ExtensionActionHandler {
  private readonly selection = inject(SelectionService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  execute(): void {
    const selected = this.selection.selectedItems();
    if (selected.length < 2) {
      this.snackBar.open('Select at least two documents to compare.', 'Dismiss', {
        duration: 3000,
      });
      return;
    }
    openDocumentCompareDialog(this.dialog, selected);
  }
}

/** The API's message when it has one, so the user sees why the delete failed. */
function deleteErrorMessage(err: unknown): string {
  if (typeof err === 'string' && err.trim().length > 0) return err;

  const maybeObj = err as { error?: { message?: string }; message?: string } | null;
  const apiMessage = maybeObj?.error?.message;
  if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) return apiMessage;

  const defaultMessage = maybeObj?.message;
  if (typeof defaultMessage === 'string' && defaultMessage.trim().length > 0) return defaultMessage;

  return 'Failed to delete selected documents. Please try again.';
}
