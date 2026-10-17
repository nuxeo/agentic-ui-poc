import { type NuxeoDocument } from '@nuxeo/satori-platform/nuxeo-client';
import * as i0 from "@angular/core";
/** What `nxs-create-version-dialog` versions. */
export interface NxsCreateVersionDialogData {
    readonly documentUid: string;
    readonly documentTitle: string;
    /** The document's version now — `uid:major_version` and `uid:minor_version`. */
    readonly major: number;
    readonly minor: number;
}
/** Closes with the version created, or with nothing when cancelled. */
export type NxsCreateVersionDialogResult = NuxeoDocument | undefined;
/**
 * Create a version of a document — Web UI's `nuxeo-document-create-version` dialog.
 *
 * As in Web UI: Minor and Major are offered with the number each would give, Major chosen first,
 * and Create runs `Document.CreateVersion`, which checks the document in at the new version. A toast
 * names the version created; a refusal reads as one. It does not decide who may version — open it
 * only where `canCreateDocumentVersion(doc)` holds, as `nxs-manage-versions` does.
 */
export declare class NxsCreateVersionDialogComponent {
    protected readonly data: NxsCreateVersionDialogData;
    private readonly dialogRef;
    private readonly documents;
    private readonly translate;
    private readonly toast;
    private readonly destroyRef;
    protected increment: 'Major' | 'Minor';
    protected readonly saving: import("@angular/core").WritableSignal<boolean>;
    protected readonly current: string;
    protected readonly nextMinor: string;
    protected readonly nextMajor: string;
    protected create(): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsCreateVersionDialogComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsCreateVersionDialogComponent, "nxs-create-version-dialog", never, {}, {}, never, never, true, never>;
}
//# sourceMappingURL=create-version-dialog.component.d.ts.map