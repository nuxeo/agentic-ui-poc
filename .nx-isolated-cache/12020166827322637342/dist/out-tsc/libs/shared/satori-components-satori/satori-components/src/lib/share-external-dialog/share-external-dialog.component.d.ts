import { type ErrorStateMatcher } from '@angular/material/core';
import * as i0 from "@angular/core";
/** What the share-with-external-user dialog needs from the page that opens it. */
export interface NxsShareExternalDialogData {
    /** The document to share. */
    readonly documentUid: string;
    /**
     * The document type's `userVisiblePermissions`, the rights the dialog offers. Nuxeo's default
     * three (Read, ReadWrite, Everything) when absent.
     */
    readonly permissions?: readonly string[] | null;
}
/**
 * Shares a document with someone outside the organisation, as a `MatDialog`:
 * `dialog.open(NxsShareExternalDialogComponent, { data })`.
 *
 * As in Web UI, the share needs an end date and always emails the person a link; Nuxeo creates no
 * account for them. **Create and add another** keeps the dialog open for the next person. The
 * dialog closes with `true` when it shared the document with anyone, `false` otherwise.
 */
export declare class NxsShareExternalDialogComponent {
    private readonly dialogRef;
    private readonly data;
    private readonly detail;
    private readonly translate;
    private readonly toast;
    private readonly destroyRef;
    /** The date fields' adapter, from `provideNxsDateAdapter()`: a host's may not hold JS dates. */
    private readonly dateAdapter;
    protected readonly rights: readonly string[];
    protected readonly mailHint = "permissions.notification.mail-hint";
    protected readonly email: import("@angular/core").WritableSignal<string>;
    protected readonly emailLeft: import("@angular/core").WritableSignal<boolean>;
    protected readonly right: import("@angular/core").WritableSignal<string>;
    /** The share's days, at local midnight. */
    protected readonly begin: import("@angular/core").WritableSignal<Date | null>;
    protected readonly end: import("@angular/core").WritableSignal<Date | null>;
    /** The same days as the date fields hold them, in their adapter's own representation. */
    protected readonly beginField: import("@angular/core").Signal<unknown>;
    protected readonly endField: import("@angular/core").Signal<unknown>;
    protected readonly comment: import("@angular/core").WritableSignal<string>;
    /** Which button is saving, so only that one shows the spinner. */
    protected readonly saving: import("@angular/core").WritableSignal<"create" | "another" | null>;
    private shared;
    protected readonly emailValid: import("@angular/core").Signal<boolean>;
    /**
     * Puts the email box in Material's error state once the user has left it invalid, so the input
     * sets `aria-invalid` and points `aria-describedby` at the `mat-error` itself.
     */
    protected readonly emailError: ErrorStateMatcher;
    private readonly emailBox;
    protected readonly endBeforeBegin: import("@angular/core").Signal<boolean>;
    protected readonly valid: import("@angular/core").Signal<boolean>;
    constructor();
    protected label(permission: string): string;
    /** The day a date field holds, whatever its adapter holds dates as. */
    protected fieldDay(value: unknown): Date | null;
    protected cancel(): void;
    protected create(another: boolean): void;
    private reset;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsShareExternalDialogComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsShareExternalDialogComponent, "nxs-share-external-dialog", never, {}, {}, never, never, true, never>;
}
//# sourceMappingURL=share-external-dialog.component.d.ts.map