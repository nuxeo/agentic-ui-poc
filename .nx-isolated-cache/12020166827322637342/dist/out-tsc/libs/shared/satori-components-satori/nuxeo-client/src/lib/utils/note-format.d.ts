/** Nuxeo Note `note:mime_type` values and display labels (matches Nuxeo Web UI). */
export declare const NOTE_FORMAT_OPTIONS: readonly [{
    readonly value: "text/html";
    readonly labelKey: "note-format.html";
    readonly label: "HTML";
}, {
    readonly value: "text/plain";
    readonly labelKey: "note-format.plain";
    readonly label: "Text";
}, {
    readonly value: "text/xml";
    readonly labelKey: "note-format.xml";
    readonly label: "XML";
}, {
    readonly value: "text/markdown";
    readonly labelKey: "note-format.markdown";
    readonly label: "Markdown";
}];
export type NoteMimeType = (typeof NOTE_FORMAT_OPTIONS)[number]['value'];
/** Default empty body for a new note of the given format. */
export declare function defaultNoteContent(mimeType: string): string;
/** Human-readable label for `note:mime_type` (e.g. `text/html` → `HTML`). */
export declare function noteFormatLabel(mimeType: string | null | undefined): string;
export declare function isHtmlNoteFormat(mimeType: string): boolean;
/**
 * Formats note HTML for the code/source textarea (display only).
 *
 * Nuxeo Web UI toggles source mode on the persisted `note:note` string. Satori uses Quill for
 * the visual editor; `getSemanticHTML()` collapses markup onto one line with `&nbsp;` entities.
 * This helper restores a readable multi-line source view without mutating the saved document.
 */
export declare function formatNoteHtmlForSourceView(html: string): string;
//# sourceMappingURL=note-format.d.ts.map