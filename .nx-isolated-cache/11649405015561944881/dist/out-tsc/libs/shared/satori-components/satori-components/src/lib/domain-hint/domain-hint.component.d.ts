import * as i0 from "@angular/core";
/**
 * The note shown where content cannot be created directly: inside a Domain, or at the
 * repository root. It tells the user to open Sections, Templates or Workspaces instead.
 *
 * Renders nothing anywhere else, so a host places it unconditionally and passes what it is
 * showing. The rule — a `Domain`, or the path `/` — is `nuxeo-client`'s, shared with the
 * Create / Import checks that refuse those locations.
 */
export declare class NxsDomainHintComponent {
    /** The type of the document being shown. */
    readonly documentType: import("@angular/core").InputSignal<string | null | undefined>;
    /** The repository path being shown. */
    readonly path: import("@angular/core").InputSignal<string | null | undefined>;
    protected readonly guidanceKey = "browse.message.domain-container-guidance";
    protected readonly visible: import("@angular/core").Signal<boolean>;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsDomainHintComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsDomainHintComponent, "nxs-domain-hint", never, { "documentType": { "alias": "documentType"; "required": false; "isSignal": true; }; "path": { "alias": "path"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=domain-hint.component.d.ts.map