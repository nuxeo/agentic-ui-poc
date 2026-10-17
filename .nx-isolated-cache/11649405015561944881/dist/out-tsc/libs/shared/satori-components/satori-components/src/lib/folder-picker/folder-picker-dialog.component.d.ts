import { type NuxeoDocument } from '@nuxeo/satori-platform/nuxeo-client';
import { type NxsErrorStatus } from '../error-state/error-status';
import * as i0 from "@angular/core";
/** What the folder picker needs from the page that opens it. Text arrives already translated. */
export interface NxsFolderPickerDialogData {
    /** The dialog's heading — "Copy to", "Move to". */
    readonly heading: string;
    /** The button that chooses the folder on screen — "Copy here", "Move here". */
    readonly confirmLabel: string;
    /** Where the picker opens; `/default-domain` when absent. */
    readonly initialPath?: string;
    /**
     * A folder that cannot be the destination, nor anything inside it: the folder being moved.
     * Nuxeo refuses to move a folder into itself; the picker does not offer it.
     */
    readonly excludePath?: string;
    /** A folder that is not a destination because the document is already there. */
    readonly currentParentPath?: string;
}
/** The folder chosen. */
export interface NxsFolderPickerDialogResult {
    readonly uid: string;
    readonly path: string;
    readonly title: string;
}
/**
 * Chooses a destination folder, as a `MatDialog`: `dialog.open(NxsFolderPickerDialogComponent,
 * { data })`, then `afterClosed()` gives the folder, or nothing when cancelled.
 *
 * It opens on a folder and lists the folders in it; the user goes into one, or up a level, and
 * chooses the folder on screen. It reads the repository through `BrowseService` with the
 * application's credentials, and says why when it cannot: no access to a folder, a folder gone,
 * or a failure with Retry. It only chooses; the page copies or moves.
 */
export declare class NxsFolderPickerDialogComponent {
    private readonly dialogRef;
    private readonly browse;
    private readonly destroyRef;
    protected readonly data: NxsFolderPickerDialogData;
    protected readonly path: import("@angular/core").WritableSignal<string>;
    protected readonly folder: import("@angular/core").WritableSignal<NuxeoDocument | null>;
    protected readonly folders: import("@angular/core").WritableSignal<readonly NuxeoDocument[]>;
    protected readonly loading: import("@angular/core").WritableSignal<boolean>;
    protected readonly failure: import("@angular/core").WritableSignal<NxsErrorStatus | "not-a-folder" | null>;
    protected readonly trail: import("@angular/core").Signal<string[]>;
    protected readonly canGoUp: import("@angular/core").Signal<boolean>;
    /** Why the folder on screen cannot be chosen, if it cannot. */
    protected readonly refusal: import("@angular/core").Signal<"inside" | "already" | null>;
    protected readonly canChoose: import("@angular/core").Signal<boolean>;
    constructor();
    protected load(): void;
    protected open(doc: NuxeoDocument): void;
    protected up(): void;
    protected choose(): void;
    protected cancel(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsFolderPickerDialogComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsFolderPickerDialogComponent, "nxs-folder-picker-dialog", never, {}, {}, never, never, true, never>;
}
//# sourceMappingURL=folder-picker-dialog.component.d.ts.map