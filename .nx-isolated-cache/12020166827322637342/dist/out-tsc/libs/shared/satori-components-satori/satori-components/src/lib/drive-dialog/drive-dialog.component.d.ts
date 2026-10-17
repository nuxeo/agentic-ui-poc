import * as i0 from "@angular/core";
/** What the Drive dialog needs from the page that opens it. */
export interface NxsDriveDialogData {
    /** The repository folder Drive should open. The repository root when absent. */
    readonly folderPath?: string;
}
interface DrivePackage {
    readonly platform: string;
    readonly name: string;
    readonly url: string;
}
/**
 * "Open with Nuxeo Drive", as a `MatDialog`: `dialog.open(NxsDriveDialogComponent, { data })`.
 *
 * It first asks Nuxeo whether this user has a Drive token. With one, it hands Drive the folder
 * through a `nxdrive://direct-transfer` link and closes itself — direct-transfer matches on the
 * server URL alone, where `nxdrive://edit` also matches the username and fails on some Drive
 * configurations. Without one, including when the check fails, it offers the installers.
 */
export declare class NxsDriveDialogComponent {
    private readonly dialogRef;
    private readonly drive;
    private readonly data;
    protected readonly packages: readonly DrivePackage[];
    protected readonly checking: import("@angular/core").WritableSignal<boolean>;
    constructor();
    protected close(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsDriveDialogComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsDriveDialogComponent, "nxs-drive-dialog", never, {}, {}, never, never, true, never>;
}
export {};
//# sourceMappingURL=drive-dialog.component.d.ts.map