import type { ConfirmDialogData } from './confirm-dialog.component';

/** Web UI `deleteButton.confirm` — soft-delete one document (move to trash). */
export function trashDocumentConfirmData(title: string): ConfirmDialogData {
  const trimmed = title.trim();
  return {
    title: 'Move to Trash',
    message: trimmed ? `Move "${trimmed}" to trash?` : 'Delete the document?',
    confirmLabel: 'Delete',
  };
}

/**
 * Web UI bulk soft-delete (`deleteDocumentsButton.confirm.deleteDocuments` /
 * `label.documents.confirmDeleteDocuments`) — never names a single item when multiple are selected.
 */
export function trashSelectedDocumentsConfirmData(count: number): ConfirmDialogData {
  if (count <= 1) {
    return {
      title: 'Move to Trash',
      message: 'Delete the document?',
      confirmLabel: 'Delete',
    };
  }
  return {
    title: 'Move to Trash',
    message: `Delete ${count} selected document(s)?`,
    confirmLabel: 'Delete',
  };
}
