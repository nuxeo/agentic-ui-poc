/** Whether a drag carries files from the user's computer, rather than text or a link. */
export declare function dragHasFiles(event: DragEvent): boolean;
/**
 * The drag-over state of one drop target that accepts files, and nothing else.
 *
 * `dragenter` and `dragleave` fire for every child the pointer crosses, so a plain flag flickers
 * off over the first child; counting the entries keeps it on until the pointer leaves the target.
 * A drag of text or a link is ignored entirely: no highlight, and the browser keeps its default.
 */
export declare class NxsFileDropTracker {
    private readonly accepts;
    /** True while files are dragged over the target. */
    readonly over: import("@angular/core").WritableSignal<boolean>;
    private depth;
    constructor(accepts: () => boolean);
    enter(event: DragEvent): void;
    overTarget(event: DragEvent): void;
    leave(event: DragEvent): void;
    /** The files dropped, or none when the drop is not one this target takes. */
    drop(event: DragEvent): File[];
    private takes;
}
//# sourceMappingURL=file-drop.d.ts.map