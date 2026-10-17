import { type NuxeoAce } from '@nuxeo/satori-platform/nuxeo-client';
import * as i0 from "@angular/core";
/** What the delete-permission dialog needs from the page that opens it. */
export interface NxsDeletePermissionDialogData {
    /** The document the entry is on. */
    readonly documentUid: string;
    /** The entry to delete, as the `acls` enricher returned it. */
    readonly ace: NuxeoAce;
    /** The ACL holding the entry. `local` when absent. */
    readonly acl?: string;
}
/**
 * Confirms, then deletes, one permission entry, as a `MatDialog`:
 * `dialog.open(NxsDeletePermissionDialogComponent, { data, role: 'alertdialog' })`.
 *
 * It deletes the entry by its id, as Web UI does, so the user's other entries on the document stay.
 * It closes with `true` once Nuxeo has deleted it; a failure is reported and the dialog stays open.
 */
export declare class NxsDeletePermissionDialogComponent {
    private readonly dialogRef;
    private readonly data;
    private readonly detail;
    private readonly translate;
    private readonly toast;
    private readonly locale;
    private readonly destroyRef;
    protected readonly deleting: import("@angular/core").WritableSignal<boolean>;
    protected readonly principal: string;
    protected readonly right: string;
    protected readonly timeFrame: string;
    protected readonly grantedBy: string;
    /** The entry's four fields, under the labels of the Permissions tab's columns. */
    protected readonly fields: {
        label: string;
        value: string;
    }[];
    /**
     * Below Material's small-screen breakpoint, where MatDialog narrows to the screen, the four
     * columns do not fit, so the entry shows as one label and value row per field instead.
     * `observe()` answers with the current state as it subscribes, so the first render already has
     * the right layout and a phone never sees the table first.
     */
    protected readonly narrow: import("@angular/core").Signal<boolean>;
    protected confirm(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsDeletePermissionDialogComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsDeletePermissionDialogComponent, "nxs-delete-permission-dialog", never, {}, {}, never, never, true, never>;
}
//# sourceMappingURL=delete-permission-dialog.component.d.ts.map