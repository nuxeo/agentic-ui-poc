import { DocumentCompareDialogComponent, } from './document-compare-dialog.component';
export function openDocumentCompareDialog(dialog, items) {
    if (items.length < 2)
        return;
    dialog.open(DocumentCompareDialogComponent, {
        width: '1400px',
        maxWidth: '96vw',
        maxHeight: '92vh',
        panelClass: 'document-compare-dialog-panel',
        data: { items },
    });
}
