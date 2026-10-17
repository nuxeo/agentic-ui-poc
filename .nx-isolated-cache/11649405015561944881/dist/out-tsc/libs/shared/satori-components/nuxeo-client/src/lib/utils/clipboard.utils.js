import { isFolderishDocument } from '../services/document-import.service';
import { parseDocumentSubtypes } from './parse-document-subtypes';
export const CLIPBOARD_STORAGE_KEY = 'nuxeo_clipboard';
export function readClipboardDocs() {
    try {
        const parsed = JSON.parse(localStorage.getItem(CLIPBOARD_STORAGE_KEY) ?? '[]');
        return Array.isArray(parsed)
            ? parsed.filter((item) => typeof item === 'object' &&
                item !== null &&
                typeof item.uid === 'string' &&
                typeof item.title === 'string' &&
                (item.type === undefined ||
                    typeof item.type === 'string'))
            : [];
    }
    catch {
        return [];
    }
}
export function writeClipboardDocs(docs) {
    try {
        localStorage.setItem(CLIPBOARD_STORAGE_KEY, JSON.stringify(docs));
    }
    catch {
        // Storage can be unavailable in restricted browser contexts and test runners.
    }
}
/**
 * Web UI `nuxeo-clipboard.canPaste`: target must be folderish and allow each item type.
 * Items without `type` skip subtype validation (backward compatible with older clipboard data).
 */
export function canPasteClipboard(items, target) {
    if (!items.length || !target || !isFolderishDocument(target)) {
        return false;
    }
    const allowedTypes = parseDocumentSubtypes(target);
    if (allowedTypes.length === 0) {
        return true;
    }
    return items.every((item) => !item.type || allowedTypes.includes(item.type));
}
//# sourceMappingURL=clipboard.utils.js.map