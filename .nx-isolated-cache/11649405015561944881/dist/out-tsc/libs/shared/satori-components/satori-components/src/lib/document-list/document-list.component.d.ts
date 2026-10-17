import { type MatCheckboxChange } from '@angular/material/checkbox';
import { type Sort } from '@angular/material/sort';
import { type NuxeoDocument } from '@nuxeo/satori-platform/nuxeo-client';
import { type NxsMenuAction } from '../action-menu/action-menu.component';
import type { NxsErrorStatus } from '../error-state/error-status';
import { NxsFileDropTracker } from '../file-drop';
import type { NxsHeadingLevel } from '../heading-level';
import { type NxsAvatarColor } from '../primitives';
import * as i0 from "@angular/core";
/** One column of a document list. */
export interface NxsDocumentListColumn {
    /**
     * What the column shows. `title`, `type`, `modified`, `lastContributor`, `created`, `author`,
     * `state`, `version`, `nature`, `coverage` and `subjects` are the packaged columns; any other key
     * is read as a Nuxeo property of that name, such as `dc:source`.
     */
    readonly key: string;
    /** The header, already translated. */
    readonly label: string;
    /**
     * Whether the header sorts. Only set it for a key the listing's source can sort by on the server:
     * the list never sorts a page itself. A column that cannot sort has a plain header.
     */
    readonly sortable?: boolean;
}
/** The server-side order a list is in: a column's key and a direction. */
export interface NxsDocumentListSort {
    readonly key: string;
    readonly direction: 'asc' | 'desc';
}
/** A row's action, chosen from that row's menu. */
export interface NxsDocumentListRowAction {
    readonly action: NxsMenuAction;
    readonly document: NuxeoDocument;
}
/**
 * One page of documents as a table: sortable headers, selection, keyboard navigation and a pager,
 * with the loading, empty and error states in place of the rows.
 *
 * The server pages and sorts it. The list never sorts or slices what it is given: it shows the
 * page in `documents`, and asks for another order with `sortChange` and another page with
 * `pageChange`. A Material table with `MatSort`, not virtualised —
 * `docs/satori-components/decision-table-primitive.md`.
 *
 * One row is in the Tab sequence at a time. Arrow keys move between rows, Home and End go to the
 * first and last, Space selects, Shift extends a selection from the last row selected, Ctrl or
 * Cmd+A selects the page, and Enter opens. Inside a row, Right and Left move between its controls,
 * which never take a Tab stop of their own.
 */
export declare class NxsDocumentListComponent {
    /** The page on screen, in the server's order. */
    readonly documents: import("@angular/core").InputSignal<readonly NuxeoDocument[]>;
    /** The columns, in order. The `title` column is the one that names each row. */
    readonly columns: import("@angular/core").InputSignal<readonly NxsDocumentListColumn[]>;
    /** The table's accessible name, already translated, such as "Contents of Invoices". */
    readonly label: import("@angular/core").InputSignal<string>;
    /** The order the page is in, or `null` for the source's own order. */
    readonly sort: import("@angular/core").InputSignal<NxsDocumentListSort | null>;
    /** The selected documents' ids, on every page. Two-way: `[(selectedIds)]`. */
    readonly selectedIds: import("@angular/core").ModelSignal<readonly string[]>;
    /** Shows the selection checkboxes. Accepts a bare attribute. */
    readonly selectable: import("@angular/core").InputSignalWithTransform<boolean, unknown>;
    /** The page on screen, from zero. */
    readonly pageIndex: import("@angular/core").InputSignalWithTransform<number, unknown>;
    /** How many documents a full page holds. */
    readonly pageSize: import("@angular/core").InputSignalWithTransform<number, unknown>;
    /** Every document across every page, or negative when the server did not count them. */
    readonly totalSize: import("@angular/core").InputSignalWithTransform<number, unknown>;
    /** Whether the server has another page. */
    readonly hasNextPage: import("@angular/core").InputSignalWithTransform<boolean, unknown>;
    /** Shows the loader in place of the rows. */
    readonly loading: import("@angular/core").InputSignalWithTransform<boolean, unknown>;
    /** The status of the request that failed, mapped with `nxsErrorStatus()`, or `null`. */
    readonly error: import("@angular/core").InputSignal<NxsErrorStatus | null>;
    /**
     * What failed, already translated — "The folder could not be loaded". Shown for a server error
     * only: a 401, 403 or 404 keeps its own heading, so a refusal never reads as a breakage.
     */
    readonly errorHeading: import("@angular/core").InputSignal<string>;
    /** The empty state's heading, already translated. Blank says "Nothing here yet". */
    readonly emptyHeading: import("@angular/core").InputSignal<string>;
    /** An optional second line for the empty state, already translated. */
    readonly emptyMessage: import("@angular/core").InputSignal<string>;
    /** The level of the empty and error states' headings in the page outline. */
    readonly stateHeadingLevel: import("@angular/core").InputSignal<NxsHeadingLevel>;
    /** Each row's menu entries, by document id. A row with none has no menu. */
    readonly rowActions: import("@angular/core").InputSignal<Readonly<Record<string, readonly NxsMenuAction[]>>>;
    /** Accepts files dragged onto the list. Accepts a bare attribute. */
    readonly dropEnabled: import("@angular/core").InputSignalWithTransform<boolean, unknown>;
    /** What the list says while files are dragged over it, already translated. */
    readonly dropLabel: import("@angular/core").InputSignal<string>;
    /** The order asked for, or `null` when the user cleared it. The host fetches it. */
    readonly sortChange: import("@angular/core").OutputEmitterRef<NxsDocumentListSort | null>;
    /** The page index asked for. The host fetches it. */
    readonly pageChange: import("@angular/core").OutputEmitterRef<number>;
    /** A row was opened: clicked, or Enter on it. */
    readonly open: import("@angular/core").OutputEmitterRef<NuxeoDocument>;
    /** An entry of a row's menu was chosen. */
    readonly rowAction: import("@angular/core").OutputEmitterRef<NxsDocumentListRowAction>;
    /** Files were dropped on the list. Only while `dropEnabled`. */
    readonly filesDropped: import("@angular/core").OutputEmitterRef<readonly File[]>;
    /** Retry was pressed on a server error. */
    readonly retry: import("@angular/core").OutputEmitterRef<void>;
    protected readonly tagId: "nxs.primitives.tag";
    protected readonly avatarId: "nxs.primitives.avatar";
    protected readonly hintId: string;
    protected readonly selectColumn = "__select";
    protected readonly actionsColumn = "__actions";
    protected readonly drop: NxsFileDropTracker;
    private readonly host;
    private readonly announcer;
    private readonly translate;
    private readonly direction;
    private readonly translations;
    /**
     * Each row's accessible name, for the row, its checkbox and its menu: its title, and, where
     * another document on the page has the same title, its place among them — so no two rows on a
     * page share a name. Titles that differ only in case or surrounding space read the same aloud,
     * so they count as the same.
     */
    private readonly accessibleNames;
    /** The row in the Tab sequence. */
    protected readonly activeIndex: import("@angular/core").WritableSignal<number>;
    /** Where a Shift selection extends from, and what was selected before it began. */
    private anchor;
    private rangeBase;
    /** Whether Shift was held for the checkbox change that follows. */
    private shiftHeld;
    protected readonly selected: import("@angular/core").Signal<Set<string>>;
    protected readonly sortableColumns: import("@angular/core").Signal<NxsDocumentListColumn[]>;
    protected readonly plainColumns: import("@angular/core").Signal<NxsDocumentListColumn[]>;
    protected readonly hasRowActions: import("@angular/core").Signal<boolean>;
    protected readonly displayedColumns: import("@angular/core").Signal<string[]>;
    protected readonly pageIds: import("@angular/core").Signal<string[]>;
    protected readonly allOnPageSelected: import("@angular/core").Signal<boolean>;
    protected readonly someOnPageSelected: import("@angular/core").Signal<boolean>;
    /** The header row counts as one. Unknown is `-1`, which ARIA reads as "not known". */
    protected readonly rowCount: import("@angular/core").Signal<number>;
    protected readonly matSortActive: import("@angular/core").Signal<string>;
    protected readonly matSortDirection: import("@angular/core").Signal<"" | "asc" | "desc">;
    constructor();
    protected actionsFor(doc: NuxeoDocument): readonly NxsMenuAction[];
    protected isSelected(doc: NuxeoDocument): boolean;
    protected isFolder(doc: NuxeoDocument): boolean;
    /** A container's rendition is only Nuxeo's generic icon, so it is not fetched; the type icon shows. */
    protected hasThumbnail(doc: NuxeoDocument): boolean;
    protected icon(doc: NuxeoDocument): string;
    protected rowName(doc: NuxeoDocument): string;
    protected accessibleName(doc: NuxeoDocument): string;
    protected rowIndex(index: number): number;
    protected contributor(doc: NuxeoDocument): string;
    /** Never empty: an empty string crashes Satori's avatar inside change detection. */
    protected initials(name: string): string;
    protected avatarColor(name: string): NxsAvatarColor;
    /** The text of a column that is neither the title, the type, a date nor a person. */
    protected cellText(doc: NuxeoDocument, key: string): string;
    protected createdDate(doc: NuxeoDocument): string | null;
    protected onSortChange(sort: Sort): void;
    protected onPageChange(index: number): void;
    protected onRowAction(action: NxsMenuAction, document: NuxeoDocument): void;
    protected onDrop(event: DragEvent): void;
    /** Records Shift for the checkbox change it precedes, from the pointer or the keyboard. */
    protected noteModifiers(event: MouseEvent | KeyboardEvent): void;
    protected onCheckboxChange(change: MatCheckboxChange, index: number): void;
    protected onSelectPage(change: MatCheckboxChange): void;
    protected onRowClick(event: MouseEvent, doc: NuxeoDocument, index: number): void;
    protected onOpenClick(event: MouseEvent, doc: NuxeoDocument, index: number): void;
    protected onRowFocusIn(index: number): void;
    protected onRowKeydown(event: KeyboardEvent, doc: NuxeoDocument, index: number): void;
    private inlineKeys;
    private moveTo;
    private focusRow;
    private toggleAt;
    /** Everything selected before the range began, plus every row from the anchor to `index`. */
    private selectRange;
    private selectPage;
    private deselectPage;
    /** Keeps the order ids were selected in, so the host's own list does not reshuffle. */
    private commit;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsDocumentListComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsDocumentListComponent, "nxs-document-list", never, { "documents": { "alias": "documents"; "required": true; "isSignal": true; }; "columns": { "alias": "columns"; "required": true; "isSignal": true; }; "label": { "alias": "label"; "required": true; "isSignal": true; }; "sort": { "alias": "sort"; "required": false; "isSignal": true; }; "selectedIds": { "alias": "selectedIds"; "required": false; "isSignal": true; }; "selectable": { "alias": "selectable"; "required": false; "isSignal": true; }; "pageIndex": { "alias": "pageIndex"; "required": false; "isSignal": true; }; "pageSize": { "alias": "pageSize"; "required": false; "isSignal": true; }; "totalSize": { "alias": "totalSize"; "required": false; "isSignal": true; }; "hasNextPage": { "alias": "hasNextPage"; "required": false; "isSignal": true; }; "loading": { "alias": "loading"; "required": false; "isSignal": true; }; "error": { "alias": "error"; "required": false; "isSignal": true; }; "errorHeading": { "alias": "errorHeading"; "required": false; "isSignal": true; }; "emptyHeading": { "alias": "emptyHeading"; "required": false; "isSignal": true; }; "emptyMessage": { "alias": "emptyMessage"; "required": false; "isSignal": true; }; "stateHeadingLevel": { "alias": "stateHeadingLevel"; "required": false; "isSignal": true; }; "rowActions": { "alias": "rowActions"; "required": false; "isSignal": true; }; "dropEnabled": { "alias": "dropEnabled"; "required": false; "isSignal": true; }; "dropLabel": { "alias": "dropLabel"; "required": false; "isSignal": true; }; }, { "selectedIds": "selectedIdsChange"; "sortChange": "sortChange"; "pageChange": "pageChange"; "open": "open"; "rowAction": "rowAction"; "filesDropped": "filesDropped"; "retry": "retry"; }, never, never, true, never>;
}
//# sourceMappingURL=document-list.component.d.ts.map