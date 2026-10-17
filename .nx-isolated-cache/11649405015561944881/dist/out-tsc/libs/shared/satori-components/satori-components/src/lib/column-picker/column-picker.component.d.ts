import { AfterViewInit, OnDestroy } from '@angular/core';
import * as i0 from "@angular/core";
/** One column the user may show or hide. */
export interface NxsPickableColumn {
    /** The host's key for the column; what `apply` emits. */
    readonly key: string;
    /** The column's name, already translated. */
    readonly label: string;
    /** Whether the column is shown now. */
    readonly visible: boolean;
}
/**
 * The panel a user opens from a table header to choose which columns show.
 *
 * Presentational: it is handed the columns and emits the keys chosen, in the columns' own order so
 * a reorder in the host's column set is respected. Where the columns come from — Layer 1
 * descriptors on browse, a fixed set on search — and where the choice is persisted stay the host's.
 *
 * Changes are buffered until Done, so Escape and the backdrop genuinely discard them. It is a
 * modal dialog while open: it takes focus when it appears, keeps Tab and Shift+Tab inside itself,
 * and hands focus back to whatever had it (the header's "Manage columns" button) when it goes. The panel hangs from the top-right corner
 * of the nearest positioned ancestor, so the host renders it inside the table's wrapper.
 */
export declare class NxsColumnPickerComponent implements AfterViewInit, OnDestroy {
    /** Every column the user may choose from, in display order. */
    readonly columns: import("@angular/core").InputSignal<readonly NxsPickableColumn[]>;
    /** Keys that cannot be switched off — the identity column, so no row is left unlabelled. */
    readonly required: import("@angular/core").InputSignal<readonly string[]>;
    /** The keys Reset returns to: the host's defaults, not a copy of a packaged list. */
    readonly defaults: import("@angular/core").InputSignal<readonly string[]>;
    /** Done: the chosen keys, in column order. */
    readonly apply: import("@angular/core").OutputEmitterRef<readonly string[]>;
    /** Escape or the backdrop: close without applying. */
    readonly dismiss: import("@angular/core").OutputEmitterRef<void>;
    private readonly panel;
    private readonly opener;
    private readonly pending;
    protected readonly chosen: import("@angular/core").Signal<readonly string[]>;
    ngAfterViewInit(): void;
    ngOnDestroy(): void;
    protected isChosen(key: string): boolean;
    protected isRequired(key: string): boolean;
    protected toggle(key: string): void;
    protected reset(): void;
    protected commit(): void;
    protected cancel(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsColumnPickerComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsColumnPickerComponent, "nxs-column-picker", never, { "columns": { "alias": "columns"; "required": true; "isSignal": true; }; "required": { "alias": "required"; "required": false; "isSignal": true; }; "defaults": { "alias": "defaults"; "required": false; "isSignal": true; }; }, { "apply": "apply"; "dismiss": "dismiss"; }, never, never, true, never>;
}
//# sourceMappingURL=column-picker.component.d.ts.map