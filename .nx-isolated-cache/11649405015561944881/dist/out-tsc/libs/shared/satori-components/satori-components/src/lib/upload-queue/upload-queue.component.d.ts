import type { NxsUploadItem } from './upload-queue';
import * as i0 from "@angular/core";
/**
 * The files of an upload, each with its own state: chosen, waiting, uploading with its progress,
 * uploaded, or refused with the reason and Retry.
 *
 * Presentational: it draws `items` — usually an `NxsUploadQueue`'s — and reports Remove and Retry;
 * the page runs the upload. The count of files uploaded and refused is announced politely as it
 * changes, so a screen reader follows a long upload without watching each bar.
 */
export declare class NxsUploadQueueComponent {
    /** The files, in order. */
    readonly items: import("@angular/core").InputSignal<readonly NxsUploadItem[]>;
    /** The list's accessible name, already translated, such as "Files to upload". */
    readonly label: import("@angular/core").InputSignal<string>;
    /** Remove was pressed on a file that is not uploading: its id. */
    readonly remove: import("@angular/core").OutputEmitterRef<string>;
    /** Retry was pressed on a refused file: its id. */
    readonly retry: import("@angular/core").OutputEmitterRef<string>;
    protected readonly doneCount: import("@angular/core").Signal<number>;
    protected readonly failedCount: import("@angular/core").Signal<number>;
    protected readonly started: import("@angular/core").Signal<boolean>;
    /**
     * Whether the list scrolls. A file waiting or uploading has no button, so a long run can leave
     * nothing in the list to focus; the list then takes focus itself, so the keyboard can scroll it.
     * Measured when the files change and when the list changes size with the same files, as on zoom.
     */
    protected readonly scrolls: import("@angular/core").WritableSignal<boolean>;
    private readonly list;
    constructor();
    protected size(bytes: number): string;
    protected removable(item: NxsUploadItem): boolean;
    private measure;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsUploadQueueComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsUploadQueueComponent, "nxs-upload-queue", never, { "items": { "alias": "items"; "required": true; "isSignal": true; }; "label": { "alias": "label"; "required": true; "isSignal": true; }; }, { "remove": "remove"; "retry": "retry"; }, never, never, true, never>;
}
//# sourceMappingURL=upload-queue.component.d.ts.map