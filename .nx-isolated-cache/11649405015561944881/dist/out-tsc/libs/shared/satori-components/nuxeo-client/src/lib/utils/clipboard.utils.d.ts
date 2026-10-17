import type { NuxeoDocument } from '../models/document.model';
export declare const CLIPBOARD_STORAGE_KEY = "nuxeo_clipboard";
/** Client-side clipboard entry (Web UI stores full documents; we persist uid/title/type). */
export interface ClipboardDoc {
    uid: string;
    title: string;
    type?: string;
}
export declare function readClipboardDocs(): ClipboardDoc[];
export declare function writeClipboardDocs(docs: ClipboardDoc[]): void;
/**
 * Web UI `nuxeo-clipboard.canPaste`: target must be folderish and allow each item type.
 * Items without `type` skip subtype validation (backward compatible with older clipboard data).
 */
export declare function canPasteClipboard(items: ClipboardDoc[], target: NuxeoDocument | null | undefined): boolean;
//# sourceMappingURL=clipboard.utils.d.ts.map