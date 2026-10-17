import { type InputSignal } from '@angular/core';
import type { NxsHeadingLevel } from '../heading-level';
import * as i0 from "@angular/core";
/**
 * The header above a container's contents: its type icon, its title as the page heading, an
 * optional second line, and the container's actions on the right.
 *
 * The actions are the host's, projected as they are, so a host keeps its own buttons, menus and
 * their handlers. Anything marked `nxsFolderHeaderDetail` — a breadcrumb trail, say — is
 * projected under the title instead. On a narrow screen the actions drop below the title.
 *
 * The title is the page's level-one heading unless `headingLevel` says otherwise; omit it (blank)
 * while the container is loading rather than announce an empty heading.
 */
export declare class NxsFolderHeaderComponent {
    /** The container's title. Blank renders no heading. */
    readonly heading: InputSignal<string>;
    /**
     * The title's level in the page outline, rendered as the native `<h1>`–`<h6>`. The header is
     * usually the page's own heading, so level one; lower it where the header sits inside a section
     * that already has one.
     */
    readonly headingLevel: InputSignal<NxsHeadingLevel>;
    /** A second line under the title — usually the type's name — already translated. */
    readonly subheading: InputSignal<string>;
    /** The container's Nuxeo type, which picks the icon. Blank renders no icon. */
    readonly documentType: InputSignal<string>;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsFolderHeaderComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsFolderHeaderComponent, "nxs-folder-header", never, { "heading": { "alias": "heading"; "required": false; "isSignal": true; }; "headingLevel": { "alias": "headingLevel"; "required": false; "isSignal": true; }; "subheading": { "alias": "subheading"; "required": false; "isSignal": true; }; "documentType": { "alias": "documentType"; "required": false; "isSignal": true; }; }, {}, never, ["[nxsFolderHeaderDetail]", "*"], true, never>;
}
//# sourceMappingURL=folder-header.component.d.ts.map