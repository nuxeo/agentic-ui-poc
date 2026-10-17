import * as i0 from "@angular/core";
/**
 * The star that adds a document to the user's favorites or removes it — Web UI's
 * `nuxeo-favorites-toggle-button`.
 *
 * A toggle button: its accessible name stays "Favorite" and `aria-pressed` carries the state, while
 * the tooltip says what a press will do. It runs the operation itself and reports the outcome, so
 * the host decides what to tell the user — Web UI's application, not its button, shows the toast.
 * A click does not reach the row or card it sits in.
 */
export declare class NxsFavoriteToggleComponent {
    /** The document to add or remove. */
    readonly documentId: import("@angular/core").InputSignal<string>;
    /** Whether it is a favorite now. Two-way: the toggle updates it once the server confirms. */
    readonly favorite: import("@angular/core").ModelSignal<boolean>;
    /** Shown but not pressable — an enabled rule said no. */
    readonly disabled: import("@angular/core").InputSignal<boolean>;
    /** The server confirmed the change; carries the new state. */
    readonly changed: import("@angular/core").OutputEmitterRef<boolean>;
    /** The server refused; `favorite` is unchanged. Carries the error. */
    readonly failed: import("@angular/core").OutputEmitterRef<unknown>;
    /**
     * A request is in flight for the document shown. The button stays focusable and ignores presses
     * until it answers; bound to another document, it is free again.
     */
    protected readonly busy: import("@angular/core").Signal<boolean>;
    /** The document a request is in flight for. */
    private readonly pending;
    private readonly documents;
    private readonly destroyRef;
    /** Adds or removes the document. Ignored while disabled or while a request is in flight. */
    protected toggle(): void;
    /** Ends the request for `documentId`, and reports it only if that is still the document bound. */
    private settle;
    protected press(event: Event): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsFavoriteToggleComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsFavoriteToggleComponent, "nxs-favorite-toggle", never, { "documentId": { "alias": "documentId"; "required": true; "isSignal": true; }; "favorite": { "alias": "favorite"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; }, { "favorite": "favoriteChange"; "changed": "changed"; "failed": "failed"; }, never, never, true, never>;
}
//# sourceMappingURL=favorite-toggle.component.d.ts.map