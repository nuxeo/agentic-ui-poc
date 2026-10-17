import * as i0 from "@angular/core";
/**
 * The icon for a Nuxeo document type — `Folder`, `File`, `Picture`, `Collection` …
 *
 * The type-to-icon table is `docTypeIcon()` in `nuxeo-client`, so a type added there gets its
 * icon everywhere this is used, and an unknown type gets the generic file icon rather than
 * nothing. Decorative unless given a `label`, because it almost always sits beside the type's
 * name or the document's title.
 */
export declare class NxsDocTypeIconComponent {
    /** The document's type, as Nuxeo names it. */
    readonly type: import("@angular/core").InputSignal<string>;
    /** What the icon means, already translated. Blank makes it decorative. */
    readonly label: import("@angular/core").InputSignal<string>;
    protected readonly icon: import("@angular/core").Signal<string>;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsDocTypeIconComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsDocTypeIconComponent, "nxs-doc-type-icon", never, { "type": { "alias": "type"; "required": true; "isSignal": true; }; "label": { "alias": "label"; "required": false; "isSignal": true; }; }, {}, never, never, true, never>;
}
//# sourceMappingURL=doc-type-icon.component.d.ts.map