import { type SearchAggregations, type SearchCollectionOption } from '@nuxeo/satori-platform/nuxeo-client';
import { type NxsFacetOption, type NxsSearchFilters } from './search-filters.model';
import * as i0 from "@angular/core";
/** A group of checkboxes, and which field of the filters it edits. */
type CheckboxField = 'modified' | 'nature' | 'subjects' | 'coverage' | 'size';
/** A typeahead whose choices collect as chips, as Web UI's multiple-choice fields do. */
type ChoiceField = 'authors' | 'collections' | 'tags';
interface CheckboxGroup {
    readonly field: CheckboxField;
    readonly titleKey: string;
    readonly options: readonly NxsFacetOption[];
    /** Translation keys for range labels; a terms bucket shows its key. */
    readonly labelKeys?: Readonly<Record<string, string>>;
}
/**
 * The search filters — Web UI's default search form: full text, modification date, authors,
 * collections, tags, nature, subjects, coverage and size, with Reset and Save as.
 *
 * It edits `filters` and nothing else: the host turns them into a query and passes the server's
 * `aggregations` for that query back, which give each choice its count, as Web UI's checkbox
 * aggregations do. Full text applies on Enter; a checkbox, or an author, collection or tag added or
 * removed, applies at once. Authors, collections and tags take several values, as in Web UI. It
 * looks up the user's collections and the tag suggestions itself.
 */
export declare class NxsSearchFiltersComponent {
    /** The filters shown. Two-way: every change the user makes is written back. */
    readonly filters: import("@angular/core").ModelSignal<NxsSearchFilters>;
    /** The server's aggregates for the query the filters produce: each choice's count. */
    readonly aggregations: import("@angular/core").InputSignal<SearchAggregations>;
    /**
     * The text shown for a choice, by field and bucket key: the vocabulary label of a nature, subject
     * or coverage id. A choice with no label shows its key. `filters` always keeps the key, so a
     * label never reaches a query or a saved search.
     */
    readonly optionLabels: import("@angular/core").InputSignal<Readonly<Partial<Record<string, Readonly<Record<string, string>>>>>>;
    /** Reset was pressed: the filters are now empty. A host clears what it keeps beside them. */
    readonly filtersReset: import("@angular/core").OutputEmitterRef<void>;
    /** Save as was pressed: the host asks for a name and saves the current filters. */
    readonly saveAs: import("@angular/core").OutputEmitterRef<void>;
    private readonly searchService;
    private readonly destroyRef;
    protected readonly ids: {
        fulltext: string;
        authors: string;
        collections: string;
        tags: string;
        group: (field: string) => string;
    };
    protected readonly hasFilters: import("@angular/core").Signal<boolean>;
    /** What the full-text box holds; it reaches `filters` on Enter. */
    protected readonly fulltextDraft: import("@angular/core").WritableSignal<string>;
    protected readonly authorText: import("@angular/core").WritableSignal<string>;
    protected readonly collectionText: import("@angular/core").WritableSignal<string>;
    protected readonly tagText: import("@angular/core").WritableSignal<string>;
    /** Which collapsible groups are open. Modification date starts open, as in Web UI. */
    private readonly expanded;
    protected readonly groups: import("@angular/core").Signal<{
        before: CheckboxGroup[];
        after: CheckboxGroup[];
    }>;
    /** The authors the server counted for this query, not yet chosen, narrowed by what is typed. */
    protected readonly authorOptions: import("@angular/core").Signal<NxsFacetOption[]>;
    protected readonly collections: import("@angular/core").WritableSignal<readonly SearchCollectionOption[]>;
    protected readonly collectionsState: import("@angular/core").WritableSignal<"idle" | "failed" | "loading" | "loaded">;
    protected readonly collectionOptions: import("@angular/core").Signal<SearchCollectionOption[]>;
    /** A choice leaves its box empty: it is shown as a chip below it. */
    protected readonly emptyDisplay: () => string;
    private readonly tagSuggestions;
    protected readonly tagOptions: import("@angular/core").Signal<string[]>;
    private readonly tagTerms;
    constructor();
    protected isExpanded(field: CheckboxField): boolean;
    protected toggleGroup(field: CheckboxField): void;
    protected isChecked(field: CheckboxField, value: string): boolean;
    protected toggleOption(field: CheckboxField, value: string): void;
    protected optionLabelKey(group: CheckboxGroup, value: string): string | null;
    protected optionText(group: CheckboxGroup, value: string): string;
    protected applyFulltext(): void;
    protected clearFulltext(): void;
    protected addChoice(field: ChoiceField, value: string): void;
    protected removeChoice(field: ChoiceField, value: string): void;
    protected onCollectionsFocus(): void;
    private loadCollections;
    protected onTagInput(value: string): void;
    protected resetFilters(): void;
    /** The title a collection id is shown with, once the user's collections are known. */
    protected collectionTitle(id: string): string;
    private update;
    /** Opens every group that has a selection, so a loaded saved search shows what it filters on. */
    private expandSelected;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsSearchFiltersComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsSearchFiltersComponent, "nxs-search-filters", never, { "filters": { "alias": "filters"; "required": false; "isSignal": true; }; "aggregations": { "alias": "aggregations"; "required": false; "isSignal": true; }; "optionLabels": { "alias": "optionLabels"; "required": false; "isSignal": true; }; }, { "filters": "filtersChange"; "filtersReset": "filtersReset"; "saveAs": "saveAs"; }, never, never, true, never>;
}
export {};
//# sourceMappingURL=search-filters.component.d.ts.map