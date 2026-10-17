import { type NuxeoDocument } from '@nuxeo/satori-platform/nuxeo-client';
import { type NxsErrorStatus } from '../error-state/error-status';
import * as i0 from "@angular/core";
/** A folder in the tree. Mutable: the tree redraws on `revision`, not on a new object. */
interface TreeNode {
    readonly key: string;
    readonly doc: NuxeoDocument;
    readonly root: boolean;
    readonly parent: TreeNode | null;
    children: TreeNode[];
    loaded: boolean;
    loading: boolean;
    expanded: boolean;
    /** False once Nuxeo says the folder holds no folder; true until then, so a branch is never hidden. */
    expandable: boolean;
    /** Why its folders could not be loaded, shown as a row under it until a retry succeeds. */
    error: NxsErrorStatus | null;
}
/** One row of the tree as drawn, in reading order. */
interface TreeRow {
    readonly kind: 'node' | 'error';
    readonly key: string;
    readonly node: TreeNode;
    readonly level: number;
    readonly setSize: number;
    readonly position: number;
}
/**
 * The folder tree of the repository, as the browse drawer shows it: domains at the root, the open
 * domain's branch inside one, expanded down to the folder on screen, which is marked as the
 * current page.
 *
 * It reads the repository itself through `BrowseService`, with the application's credentials:
 * a level's folders through `getNavTreeChildren` (the `tree_children` page provider Nuxeo Web UI's
 * tree uses), and in one query per level which of them hold a folder, so a leaf has no expand
 * arrow, as in Web UI. Choosing a folder emits it; the host navigates.
 *
 * A failure is never silent: the tree's own failure is an error state chosen by status, and a
 * folder whose children fail gets a row saying so, which retries, and an announcement.
 *
 * Keyboard, as the ARIA tree pattern: one row in the Tab sequence, Up and Down between rows, Right
 * to expand or step into, Left to collapse or step out, Home and End, Enter to open a folder and
 * Space to expand or collapse it.
 */
export declare class NxsDocumentTreeComponent {
    /** The Nuxeo path of the folder on screen: the tree expands down to it and marks it. */
    readonly currentPath: import("@angular/core").InputSignal<string>;
    /** The tree's accessible name, already translated, such as "Folders". */
    readonly label: import("@angular/core").InputSignal<string>;
    /** A folder was chosen. The repository root arrives as a document whose path is `/`. */
    readonly navigate: import("@angular/core").OutputEmitterRef<NuxeoDocument>;
    private readonly browse;
    private readonly announcer;
    private readonly translate;
    private readonly host;
    private readonly destroyRef;
    private readonly direction;
    protected readonly status: import("@angular/core").WritableSignal<"error" | "loading" | "ready">;
    protected readonly loadError: import("@angular/core").WritableSignal<NxsErrorStatus>;
    /** The row in the Tab sequence, by key; the current folder's until the user moves. */
    protected readonly focusKey: import("@angular/core").WritableSignal<string | null>;
    private readonly revision;
    private root;
    private loadGeneration;
    private syncGeneration;
    /** At the repository root, the root with its domains; inside a domain, that domain's branch. */
    protected readonly topNodes: import("@angular/core").Signal<readonly TreeNode[]>;
    protected readonly showRootBack: import("@angular/core").Signal<boolean>;
    /** Every visible row, in reading order, which is what the arrow keys walk. */
    protected readonly rows: import("@angular/core").Signal<readonly TreeRow[]>;
    /** The deepest visible folder on the current path: the folder itself, or its nearest shown ancestor. */
    protected readonly currentKey: import("@angular/core").Signal<string | null>;
    private readonly rowsByKey;
    protected rowFor(key: string): TreeRow | undefined;
    protected readonly tabStop: import("@angular/core").Signal<string>;
    constructor();
    /** Reads the tree again from the repository, as after a folder is created, moved or deleted. */
    reload(): void;
    protected nodeLabel(node: TreeNode): string;
    /** A click on a row's arrow expands or collapses it; anywhere else on the row opens it. */
    protected onItemClick(event: MouseEvent, row: TreeRow): void;
    protected onKeydown(event: KeyboardEvent, row: TreeRow): void;
    private focus;
    protected openRoot(): void;
    private open;
    private toggle;
    private retry;
    private load;
    /** Expands every folder on `path`, loading the ones not loaded yet, and folds the rest away. */
    private syncTo;
    /** Loads a folder's folders and which of them hold one; a failure is recorded, not thrown. */
    private loadChildren;
    /** One query for a whole level: which of these folders hold a folder. Unknown keeps the arrow. */
    private probe;
    private toNodes;
    private node;
    private announce;
    private bump;
    static ɵfac: i0.ɵɵFactoryDeclaration<NxsDocumentTreeComponent, never>;
    static ɵcmp: i0.ɵɵComponentDeclaration<NxsDocumentTreeComponent, "nxs-document-tree", never, { "currentPath": { "alias": "currentPath"; "required": false; "isSignal": true; }; "label": { "alias": "label"; "required": true; "isSignal": true; }; }, { "navigate": "navigate"; }, never, never, true, never>;
}
export {};
//# sourceMappingURL=document-tree.component.d.ts.map