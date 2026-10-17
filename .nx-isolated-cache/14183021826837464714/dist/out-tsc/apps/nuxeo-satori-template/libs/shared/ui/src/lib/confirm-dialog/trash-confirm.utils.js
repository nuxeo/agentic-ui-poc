/** Web UI `deleteButton.confirm` — soft-delete one document (move to trash). */
export function trashDocumentConfirmData(title, translate) {
    const trimmed = title.trim();
    return {
        title: translate('confirm.move-to-trash'),
        // One parameterised string per branch, never a concatenation: a translator needs the whole
        // sentence to choose case and word order, and `"{{ name }}"` moves inside the clause in
        // several languages.
        message: trimmed
            ? translate('confirm.move-named-to-trash', { name: trimmed })
            : translate('confirm.delete-the-document'),
        confirmLabel: translate('confirm.delete'),
    };
}
/**
 * Web UI bulk soft-delete (`deleteDocumentsButton.confirm.deleteDocuments` /
 * `label.documents.confirmDeleteDocuments`) — never names a single item when multiple are selected.
 */
export function trashSelectedDocumentsConfirmData(count, translate) {
    if (count <= 1) {
        return {
            title: translate('confirm.move-to-trash'),
            message: translate('confirm.delete-the-document'),
            confirmLabel: translate('confirm.delete'),
        };
    }
    return {
        title: translate('confirm.move-to-trash'),
        // The singular case is handled by the branch above rather than by an `(s)` suffix. That
        // suffix is untranslatable: it assumes a language pluralises by appending one letter, and
        // most do not.
        message: translate('confirm.delete-selected-documents', { count }),
        confirmLabel: translate('confirm.delete'),
    };
}
