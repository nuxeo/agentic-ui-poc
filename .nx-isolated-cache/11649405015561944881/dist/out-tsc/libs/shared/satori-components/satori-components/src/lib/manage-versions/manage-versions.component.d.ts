import { type NuxeoDocument } from '@nuxeo/satori-platform/nuxeo-client';
import * as i0 from "@angular/core";
/**
 * A document's version number as Web UI writes it: `1.2`, and `1.2+` while it is checked out —
 * changed since that version.
 */
export declare function nxsVersionLabel(doc: NuxeoDocument): string;
/**
 * A document's versions — Web UI's `nuxeo-document-versions`, as the document's info panel shows
 * it.
 *
 * As in Web UI:
 *
 * - With versions, the number (`1.2`, `1.2+` when checked out) opens the list, newest first, each
 *   with when and by whom it was last changed. Choosing one emits `versionSelected`; the host opens
 *   it read-only. Choosing never restores — restoring is the version page's confirmed action.
 * - On a version, the list leads back to the live document (`latestSelected`), and lists the live
 *   document's versions with the one on screen marked.
 * - Create Version is in the list while the document is checked out, and is the whole control
 *   while it has no version. It is offered only where `canCreateDocumentVersion` holds — the live
 *   document, not a publication or a record, `Versionable`, and `WriteVersion`; otherwise the control reads
 *   "Unversioned". It opens `nxs-create-version-dialog` and emits `versionCreated`.
 *
 * The list is read when it opens, through `Document.GetVersions`, which reads the repository
 * rather than the search index, so a version just created is in it.
 */
export declare class NxsManageVersionsComponent {
    private readonly documents;
    private readonly dialog;
    private readonly translate;
    private readonly destroyRef;
    /** The document on screen: the live document or one of its versions. */
    readonly document: import("@angular/core").InputSignal<NuxeoDocument>;
    /** A version the user chose. Open it read-only; never restore from here. */
    readonly versionSelected: import("@angular/core").OutputEmitterRef<NuxeoDocument>;
    /** The live document, chosen while one of its versions is on screen. */
    readonly latestSelected: import("@angular/core").OutputEmitterRef<void>;
    /** A version was created: the document is now checked in at it. Reload the document. */
    readonly versionCreated: import("@angular/core").OutputEmitterRef<NuxeoDocument>;
    protected readonly label: import("@angular/core").Signal<string>;
    protected readonly hasVersions: import("@angular/core").Signal<boolean>;
    protected readonly canCreate: import("@angular/core").Signal<boolean>;
    /** Create Version in the list: only while there are changes to version, as in Web UI. */
    protected readonly offersCreate: import("@angular/core").Signal<boolean>;
    /** The document whose versions are listed — this one, or the live one a version belongs to. */
    private readonly liveUid;
    protected readonly versions: import("@angular/core").WritableSignal<readonly NuxeoDocument[]>;
    protected readonly loading: import("@angular/core").WritableSignal<boolean>;
    protected readonly failed: import("@angular/core").WritableSignal<boolean>;
    private readonly opens;
    constructor();
    protected opened(): void;
    protected retry(event: Event): void;
    protected isShown(version: NuxeoDocument): boolean;
    protected numberOf(version: NuxeoDocument): string;
    protected modified(version: NuxeoDocument): string;
    protected choose(version: NuxeoDocument): void;
    protected create(): void;
    private fetch;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsManageVersionsComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsManageVersionsComponent, "nxs-manage-versions", never, { "document": { "alias": "document"; "required": true; "isSignal": true; }; }, { "versionSelected": "versionSelected"; "latestSelected": "latestSelected"; "versionCreated": "versionCreated"; }, never, never, true, never>;
}
//# sourceMappingURL=manage-versions.component.d.ts.map