import { NxsFileDropTracker } from '../file-drop';
import * as i0 from "@angular/core";
/**
 * Where files are dropped from the computer, or chosen with a button — the same files either way.
 *
 * The button is the keyboard's way in, since dragging files has none. Only a drag of files is
 * taken: a drag of text or a link is left to the browser, and nothing lights up for it.
 */
export declare class NxsDropzoneComponent {
    /** What the zone says, already translated, such as "Drag and drop files here". */
    readonly label: import("@angular/core").InputSignal<string>;
    /** The button's text, already translated. Blank says "Choose files" or "Choose a file". */
    readonly buttonLabel: import("@angular/core").InputSignal<string>;
    /** Takes several files at once. Accepts a bare attribute. */
    readonly multiple: import("@angular/core").InputSignalWithTransform<boolean, unknown>;
    /** The file types the chooser offers, as the `accept` attribute takes them: `.csv`. */
    readonly accept: import("@angular/core").InputSignal<string>;
    /** Takes nothing, from the button or a drop. Accepts a bare attribute. */
    readonly disabled: import("@angular/core").InputSignalWithTransform<boolean, unknown>;
    /** Files chosen or dropped: one when `multiple` is off, however many were dropped. */
    readonly files: import("@angular/core").OutputEmitterRef<readonly File[]>;
    protected readonly drop: NxsFileDropTracker;
    /**
     * The button's id, which also names the file input behind it. That input is hidden from
     * assistive technology and out of the Tab sequence, so the name is never announced; it states
     * which control the input stands behind, and gives it a label a template check can see.
     */
    protected readonly buttonId: string;
    private readonly input;
    protected choose(): void;
    protected onPicked(event: Event): void;
    protected onDrop(event: DragEvent): void;
    private emit;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsDropzoneComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsDropzoneComponent, "nxs-dropzone", never, { "label": { "alias": "label"; "required": true; "isSignal": true; }; "buttonLabel": { "alias": "buttonLabel"; "required": false; "isSignal": true; }; "multiple": { "alias": "multiple"; "required": false; "isSignal": true; }; "accept": { "alias": "accept"; "required": false; "isSignal": true; }; "disabled": { "alias": "disabled"; "required": false; "isSignal": true; }; }, { "files": "files"; }, never, never, true, never>;
}
//# sourceMappingURL=dropzone.component.d.ts.map