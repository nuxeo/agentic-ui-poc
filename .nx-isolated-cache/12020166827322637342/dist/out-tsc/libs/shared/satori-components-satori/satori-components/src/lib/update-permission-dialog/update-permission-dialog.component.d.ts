import { type NuxeoAce } from '@nuxeo/satori-platform/nuxeo-client';
import * as i0 from "@angular/core";
/** What the update-permission dialog needs from the page that opens it. */
export interface NxsUpdatePermissionDialogData {
    /** The document the entry is on. */
    readonly documentUid: string;
    /** The entry to change, as the `acls` enricher returned it. */
    readonly ace: NuxeoAce;
    /**
     * The document type's `userVisiblePermissions`, the rights the dialog offers, plus the entry's
     * own. Nuxeo's default three (Read, ReadWrite, Everything) when absent.
     */
    readonly permissions?: readonly string[] | null;
}
/**
 * Changes one permission entry's right, time frame or both, as a `MatDialog`:
 * `dialog.open(NxsUpdatePermissionDialogComponent, { data })`.
 *
 * It replaces the entry in one call, as Web UI does, so a failure leaves the entry as it was. An
 * external user's share keeps its required end date and always emails the person again. A date the
 * user did not change is written back as the instant Nuxeo holds, so editing the right alone never
 * moves an entry written from another time zone. It closes with `true` once Nuxeo has saved it.
 */
export declare class NxsUpdatePermissionDialogComponent {
    private readonly dialogRef;
    private readonly data;
    private readonly detail;
    private readonly translate;
    private readonly toast;
    private readonly destroyRef;
    /** The date fields' adapter, from `provideNxsDateAdapter()`: a host's may not hold JS dates. */
    private readonly dateAdapter;
    private readonly ace;
    protected readonly id: string;
    protected readonly external: boolean;
    protected readonly principal: string;
    protected readonly rights: readonly string[];
    protected readonly mailHint = "permissions.notification.mail-hint";
    protected readonly right: import("@angular/core").WritableSignal<string>;
    protected readonly dated: import("@angular/core").WritableSignal<boolean>;
    /** The entry's days, at local midnight. */
    protected readonly begin: import("@angular/core").WritableSignal<Date | null>;
    protected readonly end: import("@angular/core").WritableSignal<Date | null>;
    /** The same days as the date fields hold them, in their adapter's own representation. */
    protected readonly beginField: import("@angular/core").Signal<unknown>;
    protected readonly endField: import("@angular/core").Signal<unknown>;
    protected readonly notify: import("@angular/core").WritableSignal<boolean>;
    protected readonly comment: import("@angular/core").WritableSignal<string>;
    protected readonly saving: import("@angular/core").WritableSignal<boolean>;
    protected readonly endBeforeBegin: import("@angular/core").Signal<boolean>;
    protected readonly valid: import("@angular/core").Signal<boolean>;
    protected label(permission: string): string;
    /** The day a date field holds, whatever its adapter holds dates as. */
    protected fieldDay(value: unknown): Date | null;
    protected update(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsUpdatePermissionDialogComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsUpdatePermissionDialogComponent, "nxs-update-permission-dialog", never, {}, {}, never, never, true, never>;
}
//# sourceMappingURL=update-permission-dialog.component.d.ts.map