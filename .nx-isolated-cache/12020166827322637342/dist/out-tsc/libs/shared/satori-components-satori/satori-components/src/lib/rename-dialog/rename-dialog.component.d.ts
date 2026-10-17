import { type NxsErrorStatus } from '../error-state/error-status';
import * as i0 from "@angular/core";
/** What the rename dialog needs from the page that opens it. */
export interface NxsRenameDialogData {
    /** The document to rename. */
    readonly documentId: string;
    /** Its title now, which the field starts from. */
    readonly title: string;
}
/**
 * Renames a document, as a `MatDialog`: `dialog.open(NxsRenameDialogComponent, { data })`.
 *
 * Renaming is a change of the document's title, `dc:title`, as in Nuxeo Web UI; the name in its
 * path does not change, so links to it keep working. The dialog writes the title itself and closes
 * with the updated document. A refusal stays in the dialog with the reason — no permission, or the
 * document locked by someone else — so the user can cancel or try again; nothing is lost.
 */
export declare class NxsRenameDialogComponent {
    private readonly dialogRef;
    private readonly browse;
    private readonly destroyRef;
    protected readonly data: NxsRenameDialogData;
    protected readonly title: import("@angular/core").WritableSignal<string>;
    protected readonly saving: import("@angular/core").WritableSignal<boolean>;
    protected readonly failure: import("@angular/core").WritableSignal<NxsErrorStatus | 409 | null>;
    protected readonly trimmed: import("@angular/core").Signal<string>;
    protected readonly unchanged: import("@angular/core").Signal<boolean>;
    protected readonly canSave: import("@angular/core").Signal<boolean>;
    protected save(): void;
    protected cancel(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsRenameDialogComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsRenameDialogComponent, "nxs-rename-dialog", never, {}, {}, never, never, true, never>;
}
//# sourceMappingURL=rename-dialog.component.d.ts.map