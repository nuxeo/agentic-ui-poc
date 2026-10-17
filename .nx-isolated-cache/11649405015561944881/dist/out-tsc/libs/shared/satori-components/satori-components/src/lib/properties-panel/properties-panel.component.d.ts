import { avatarColor, type NuxeoDocument } from '@nuxeo/satori-platform/nuxeo-client';
import type { NxsHeadingLevel } from '../heading-level';
import * as i0 from "@angular/core";
/** Turns a vocabulary value into its label: `(directory, id) => label`. */
export type NxsVocabularyLabel = (directory: string, id: string) => string;
interface NxsPerson {
    readonly name: string;
    readonly initial: string;
    readonly color: ReturnType<typeof avatarColor>;
}
/**
 * The Properties view of a document page's side panel — Web UI's `nuxeo-document-info` and
 * `nuxeo-document-metadata`, with the collections and tags sections beside them.
 *
 * It reads what it shows from the document: lifecycle state, dates, creator and contributors, the
 * Dublin Core properties, and the collections it is in. What needs the page — the version control,
 * the tag editor, the type's own layout and the attachments — is projected:
 *
 * - `[nxsVersion]` replaces the version text with a control.
 * - `[nxsTags]` replaces the read-only tag chips with an editor. Tags show only on a document with
 *   the `NXTag` facet, as in Web UI.
 * - Anything else renders after the Dublin Core properties and before the collections.
 *
 * Every value goes through `nxsPropertyText`, so a directory entry, a user or a blob shows its
 * label or name, never `[object Object]`.
 */
export declare class NxsPropertiesPanelComponent {
    /** The document shown. Nothing renders without one. */
    readonly document: import("@angular/core").InputSignal<NuxeoDocument | null>;
    /** Labels for `dc:nature`, `dc:coverage` and `dc:subjects`. Without it the stored ID shows. */
    readonly vocabularyLabel: import("@angular/core").InputSignal<NxsVocabularyLabel | null>;
    /** A workflow is running on the document. */
    readonly processRunning: import("@angular/core").InputSignal<boolean>;
    /** The version text, e.g. `1.2+`; a projected `[nxsVersion]` control replaces it. */
    readonly versionLabel: import("@angular/core").InputSignal<string>;
    /** How many times the document is published; `null` hides the row. */
    readonly publications: import("@angular/core").InputSignal<number | null>;
    /** The note's format, e.g. "Markdown". Blank hides the row. */
    readonly format: import("@angular/core").InputSignal<string>;
    /** The level of the section headings, so they sit under the page's own. */
    readonly headingLevel: import("@angular/core").InputSignal<NxsHeadingLevel>;
    /** The publication count was pressed. Only offered when there is at least one. */
    readonly publicationsSelected: import("@angular/core").OutputEmitterRef<void>;
    protected readonly props: import("@angular/core").Signal<Readonly<Record<string, unknown>>>;
    protected readonly state: import("@angular/core").Signal<string>;
    protected readonly modified: import("@angular/core").Signal<string>;
    protected readonly created: import("@angular/core").Signal<string>;
    protected readonly expires: import("@angular/core").Signal<string>;
    protected readonly creator: import("@angular/core").Signal<NxsPerson | null>;
    protected readonly contributors: import("@angular/core").Signal<NxsPerson[]>;
    protected readonly fileName: import("@angular/core").Signal<string>;
    protected readonly description: import("@angular/core").Signal<string>;
    protected readonly nature: import("@angular/core").Signal<string>;
    protected readonly coverage: import("@angular/core").Signal<string>;
    protected readonly subjects: import("@angular/core").Signal<string>;
    protected readonly taggable: import("@angular/core").Signal<boolean>;
    protected readonly tags: import("@angular/core").Signal<string[]>;
    /** Web UI's `nuxeo-document-collections`; the Favorites collection is the star, not a collection. */
    protected readonly collections: import("@angular/core").Signal<{
        uid: string;
        title: string;
    }[]>;
    /** A vocabulary value as its label: a string ID through `vocabularyLabel`, an entry by its own. */
    private vocabulary;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsPropertiesPanelComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsPropertiesPanelComponent, "nxs-properties-panel", never, { "document": { "alias": "document"; "required": true; "isSignal": true; }; "vocabularyLabel": { "alias": "vocabularyLabel"; "required": false; "isSignal": true; }; "processRunning": { "alias": "processRunning"; "required": false; "isSignal": true; }; "versionLabel": { "alias": "versionLabel"; "required": false; "isSignal": true; }; "publications": { "alias": "publications"; "required": false; "isSignal": true; }; "format": { "alias": "format"; "required": false; "isSignal": true; }; "headingLevel": { "alias": "headingLevel"; "required": false; "isSignal": true; }; }, { "publicationsSelected": "publicationsSelected"; }, never, ["[nxsVersion]", "[nxsTags]", "*"], true, never>;
}
export {};
//# sourceMappingURL=properties-panel.component.d.ts.map