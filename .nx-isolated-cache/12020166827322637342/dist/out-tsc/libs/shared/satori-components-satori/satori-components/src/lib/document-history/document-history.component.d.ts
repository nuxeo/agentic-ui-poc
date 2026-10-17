import { type PageEvent } from '@angular/material/paginator';
import { type Sort } from '@angular/material/sort';
import { type AuditEntry, type AuditLogSortField, type DirectoryEntry } from '@nuxeo/satori-platform/nuxeo-client';
import { type NxsErrorStatus } from '../error-state/error-status';
import type { NxsHeadingLevel } from '../heading-level';
import * as i0 from "@angular/core";
/** The filters, as the user set them. */
interface NxsHistoryFilters {
    readonly user: string;
    readonly from: Date | null;
    readonly to: Date | null;
    readonly eventId: string;
    readonly category: string;
}
/**
 * A document's history — Web UI's `nuxeo-document-history`, which is its audit search for one
 * document.
 *
 * As in Web UI, every filter and the sort go to the server (`@audit`), so they reach every entry
 * rather than the page on screen: the user who acted (an exact username), a From and To day, the
 * performed action and the event category. The table shows the action, when, who, the category,
 * the comment and the lifecycle state, newest first, a page at a time. Action and category read
 * through the `eventTypes` and `eventCategories` vocabularies.
 *
 * It needs a Material `DateAdapter`, as any datepicker does; the host provides it.
 */
export declare class NxsDocumentHistoryComponent {
    private readonly documents;
    private readonly directories;
    /** The document whose history this is. */
    readonly documentUid: import("@angular/core").InputSignal<string>;
    /** Entries per page; the user can change it. */
    readonly pageSize: import("@angular/core").InputSignal<number>;
    /** The heading level of the empty and error states, one below the section's own. */
    readonly headingLevel: import("@angular/core").InputSignal<NxsHeadingLevel>;
    protected readonly columns: string[];
    protected readonly filters: import("@angular/core").WritableSignal<NxsHistoryFilters>;
    /** What is in the Username box; it filters once the user pauses, not per keystroke. */
    protected readonly userText: import("@angular/core").WritableSignal<string>;
    private readonly typed;
    protected readonly sort: import("@angular/core").WritableSignal<{
        by: AuditLogSortField;
        order: "asc" | "desc";
    }>;
    protected readonly pageIndex: import("@angular/core").WritableSignal<number>;
    private readonly chosenPageSize;
    protected readonly size: import("@angular/core").Signal<number>;
    private readonly retries;
    protected readonly entries: import("@angular/core").WritableSignal<readonly AuditEntry[]>;
    protected readonly total: import("@angular/core").WritableSignal<number>;
    protected readonly loading: import("@angular/core").WritableSignal<boolean>;
    protected readonly failure: import("@angular/core").WritableSignal<NxsErrorStatus | null>;
    protected readonly filtered: import("@angular/core").Signal<boolean>;
    protected readonly eventTypes: import("@angular/core").WritableSignal<readonly DirectoryEntry[]>;
    protected readonly categories: import("@angular/core").WritableSignal<readonly DirectoryEntry[]>;
    protected readonly eventOptions: import("@angular/core").Signal<{
        id: string;
        label: string;
    }[]>;
    protected readonly categoryOptions: import("@angular/core").Signal<{
        id: string;
        label: string;
    }[]>;
    private readonly eventLabels;
    private readonly categoryLabels;
    constructor();
    protected setFilter<K extends keyof NxsHistoryFilters>(key: K, value: NxsHistoryFilters[K]): void;
    protected typeUser(text: string): void;
    protected clearFilters(): void;
    protected sorted(event: Sort): void;
    protected paged(event: PageEvent): void;
    protected retry(): void;
    protected eventLabel(id: string): string;
    protected categoryLabel(id: string): string;
    protected initials(user: string): string;
    private queryOf;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsDocumentHistoryComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsDocumentHistoryComponent, "nxs-document-history", never, { "documentUid": { "alias": "documentUid"; "required": true; "isSignal": true; }; "pageSize": { "alias": "pageSize"; "required": false; "isSignal": true; }; "headingLevel": { "alias": "headingLevel"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=document-history.component.d.ts.map