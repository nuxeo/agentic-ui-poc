import type { NuxeoDocument } from '../models/document.model';
export interface CompareFieldDef {
    key: string;
    label: string;
    read: (doc: NuxeoDocument) => unknown;
    format?: (value: unknown, locale: string) => string;
}
export interface CompareSectionDef {
    id: string;
    label: string;
    fields: CompareFieldDef[];
}
export interface CompareRow {
    key: string;
    label: string;
    left: string;
    right: string;
    differs: boolean;
}
export interface CompareSection {
    id: string;
    label: string;
    fields: CompareRow[];
}
export declare function formatCompareDate(value: unknown, locale: string): string;
export declare function formatCompareUser(value: unknown): string;
export declare function formatCompareUserList(value: unknown): string;
export declare function formatCompareSubjects(value: unknown): string;
export declare function formatCompareTags(value: unknown): string;
export declare function isCompareIconField(key: string): boolean;
/** Resolve a Nuxeo document icon path (e.g. `/icons/note.gif`) to an API URL. */
export declare function resolveNuxeoIconPath(path: string): string;
export declare function formatCompareValue(value: unknown): string;
export declare function buildDocumentCompareSections(left: NuxeoDocument, right: NuxeoDocument, viewAll: boolean, locale: string): CompareSection[];
//# sourceMappingURL=document-compare.utils.d.ts.map