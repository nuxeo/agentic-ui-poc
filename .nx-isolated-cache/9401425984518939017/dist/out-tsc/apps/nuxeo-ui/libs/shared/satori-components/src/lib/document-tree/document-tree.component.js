import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Directionality } from '@angular/cdk/bidi';
import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, computed, effect, inject, input, output, signal, untracked, } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { BrowseService, cumulativeNuxeoPathPrefixes, isBrowsableNavNode, isRepositoryRootPath, normalizeNuxeoPath, nuxeoPathsEqualFlexible, nuxeoPathSegments, topLevelNuxeoFolderPath, } from '@nuxeo/satori-platform/nuxeo-client';
import { catchError, map, of, switchMap } from 'rxjs';
import { NxsErrorStateComponent } from '../error-state/error-state.component';
import { nxsErrorStatus } from '../error-state/error-status';
import { NxsSpinnerComponent } from '../spinner/spinner.component';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/icon";
const _c0 = a0 => ({ $implicit: a0, depth: 1 });
const _c1 = (a0, a1) => ({ $implicit: a0, depth: a1 });
const _forTrack0 = ($index, $item) => $item.key;
function NxsDocumentTreeComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 1);
    i0.ɵɵelement(1, "nxs-spinner", 3);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", i0.ɵɵpipeBind1(2, 1, "satori-components.document-tree.loading"));
} }
function NxsDocumentTreeComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "nxs-error-state", 4);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵlistener("retry", function NxsDocumentTreeComponent_Conditional_1_Template_nxs_error_state_retry_0_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.reload()); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("status", ctx_r1.loadError())("heading", ctx_r1.loadError() === 500 ? i0.ɵɵpipeBind1(1, 3, "satori-components.document-tree.load-failed") : "")("headingLevel", 3);
} }
function NxsDocumentTreeComponent_Conditional_2_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 8);
    i0.ɵɵlistener("click", function NxsDocumentTreeComponent_Conditional_2_Conditional_0_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.openRoot()); });
    i0.ɵɵelementStart(1, "mat-icon", 9);
    i0.ɵɵtext(2, "chevron_left");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 1, "satori-components.document-tree.root"), " ");
} }
function NxsDocumentTreeComponent_Conditional_2_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 6);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "satori-components.document-tree.empty"), " ");
} }
function NxsDocumentTreeComponent_Conditional_2_Conditional_2_ng_container_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0);
} }
function NxsDocumentTreeComponent_Conditional_2_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 7);
    i0.ɵɵtemplate(1, NxsDocumentTreeComponent_Conditional_2_Conditional_2_ng_container_1_Template, 1, 0, "ng-container", 10);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    const level_r4 = i0.ɵɵreference(4);
    i0.ɵɵattribute("aria-label", ctx_r1.label());
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngTemplateOutlet", level_r4)("ngTemplateOutletContext", i0.ɵɵpureFunction1(3, _c0, ctx_r1.topNodes()));
} }
function NxsDocumentTreeComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, NxsDocumentTreeComponent_Conditional_2_Conditional_0_Template, 5, 3, "button", 5);
    i0.ɵɵconditionalCreate(1, NxsDocumentTreeComponent_Conditional_2_Conditional_1_Template, 3, 3, "p", 6)(2, NxsDocumentTreeComponent_Conditional_2_Conditional_2_Template, 2, 5, "ul", 7);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵconditional(ctx_r1.showRootBack() ? 0 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.rows().length === 0 ? 1 : 2);
} }
function NxsDocumentTreeComponent_ng_template_3_For_1_Conditional_1_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "nxs-spinner", 14);
} }
function NxsDocumentTreeComponent_ng_template_3_For_1_Conditional_1_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon", 19);
    i0.ɵɵtext(1, "chevron_right");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const node_r7 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵclassProp("nxs-document-tree__arrow--open", node_r7.expanded);
} }
function NxsDocumentTreeComponent_ng_template_3_For_1_Conditional_1_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "span", 16);
} }
function NxsDocumentTreeComponent_ng_template_3_For_1_Conditional_1_Conditional_7_Conditional_1_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "li", 21);
    i0.ɵɵlistener("keydown", function NxsDocumentTreeComponent_ng_template_3_For_1_Conditional_1_Conditional_7_Conditional_1_Conditional_1_Template_li_keydown_0_listener($event) { i0.ɵɵrestoreView(_r8); i0.ɵɵnextContext(); const errorRow_r9 = i0.ɵɵreadContextLet(0); const ctx_r1 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r1.onKeydown($event, errorRow_r9)); })("click", function NxsDocumentTreeComponent_ng_template_3_For_1_Conditional_1_Conditional_7_Conditional_1_Conditional_1_Template_li_click_0_listener($event) { i0.ɵɵrestoreView(_r8); i0.ɵɵnextContext(); const errorRow_r9 = i0.ɵɵreadContextLet(0); const ctx_r1 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r1.onItemClick($event, errorRow_r9)); })("focus", function NxsDocumentTreeComponent_ng_template_3_For_1_Conditional_1_Conditional_7_Conditional_1_Conditional_1_Template_li_focus_0_listener() { i0.ɵɵrestoreView(_r8); i0.ɵɵnextContext(); const errorRow_r9 = i0.ɵɵreadContextLet(0); const ctx_r1 = i0.ɵɵnextContext(5); return i0.ɵɵresetView(ctx_r1.focusKey.set(errorRow_r9.key)); });
    i0.ɵɵelementStart(1, "div", 22)(2, "mat-icon", 16);
    i0.ɵɵtext(3, "error_outline");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 17);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    i0.ɵɵnextContext();
    const errorRow_r9 = i0.ɵɵreadContextLet(0);
    const node_r7 = i0.ɵɵnextContext(3).$implicit;
    const depth_r10 = i0.ɵɵnextContext().depth;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵattribute("data-row-key", errorRow_r9.key)("aria-level", errorRow_r9.level)("tabindex", errorRow_r9.key === ctx_r1.tabStop() ? 0 : -1);
    i0.ɵɵadvance();
    i0.ɵɵstyleProp("padding-inline-start", 8 + depth_r10 * 16, "px");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 6, node_r7.error === 403 ? "satori-components.document-tree.children-forbidden-row" : "satori-components.document-tree.children-failed-row"));
} }
function NxsDocumentTreeComponent_ng_template_3_For_1_Conditional_1_Conditional_7_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdeclareLet(0);
    i0.ɵɵconditionalCreate(1, NxsDocumentTreeComponent_ng_template_3_For_1_Conditional_1_Conditional_7_Conditional_1_Conditional_1_Template, 7, 8, "li", 20);
} if (rf & 2) {
    const node_r7 = i0.ɵɵnextContext(3).$implicit;
    const errorRow_r11 = i0.ɵɵstoreLet(i0.ɵɵnextContext(2).rowFor(node_r7.key + "#error"));
    i0.ɵɵadvance();
    i0.ɵɵconditional(errorRow_r11 ? 1 : -1);
} }
function NxsDocumentTreeComponent_ng_template_3_For_1_Conditional_1_Conditional_7_Conditional_2_ng_container_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0);
} }
function NxsDocumentTreeComponent_ng_template_3_For_1_Conditional_1_Conditional_7_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtemplate(0, NxsDocumentTreeComponent_ng_template_3_For_1_Conditional_1_Conditional_7_Conditional_2_ng_container_0_Template, 1, 0, "ng-container", 10);
} if (rf & 2) {
    const node_r7 = i0.ɵɵnextContext(3).$implicit;
    const depth_r10 = i0.ɵɵnextContext().depth;
    i0.ɵɵnextContext();
    const level_r4 = i0.ɵɵreference(4);
    i0.ɵɵproperty("ngTemplateOutlet", level_r4)("ngTemplateOutletContext", i0.ɵɵpureFunction2(2, _c1, node_r7.children, depth_r10 + 1));
} }
function NxsDocumentTreeComponent_ng_template_3_For_1_Conditional_1_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 18);
    i0.ɵɵconditionalCreate(1, NxsDocumentTreeComponent_ng_template_3_For_1_Conditional_1_Conditional_7_Conditional_1_Template, 2, 2)(2, NxsDocumentTreeComponent_ng_template_3_For_1_Conditional_1_Conditional_7_Conditional_2_Template, 1, 5, "ng-container");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const node_r7 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵconditional(node_r7.error ? 1 : 2);
} }
function NxsDocumentTreeComponent_ng_template_3_For_1_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "li", 12);
    i0.ɵɵlistener("keydown", function NxsDocumentTreeComponent_ng_template_3_For_1_Conditional_1_Template_li_keydown_0_listener($event) { i0.ɵɵrestoreView(_r5); i0.ɵɵnextContext(); const row_r6 = i0.ɵɵreadContextLet(0); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onKeydown($event, row_r6)); })("click", function NxsDocumentTreeComponent_ng_template_3_For_1_Conditional_1_Template_li_click_0_listener($event) { i0.ɵɵrestoreView(_r5); i0.ɵɵnextContext(); const row_r6 = i0.ɵɵreadContextLet(0); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onItemClick($event, row_r6)); })("focus", function NxsDocumentTreeComponent_ng_template_3_For_1_Conditional_1_Template_li_focus_0_listener() { i0.ɵɵrestoreView(_r5); i0.ɵɵnextContext(); const row_r6 = i0.ɵɵreadContextLet(0); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.focusKey.set(row_r6.key)); });
    i0.ɵɵelementStart(1, "div", 13);
    i0.ɵɵconditionalCreate(2, NxsDocumentTreeComponent_ng_template_3_For_1_Conditional_1_Conditional_2_Template, 1, 0, "nxs-spinner", 14)(3, NxsDocumentTreeComponent_ng_template_3_For_1_Conditional_1_Conditional_3_Template, 2, 2, "mat-icon", 15)(4, NxsDocumentTreeComponent_ng_template_3_For_1_Conditional_1_Conditional_4_Template, 1, 0, "span", 16);
    i0.ɵɵelementStart(5, "span", 17);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(7, NxsDocumentTreeComponent_ng_template_3_For_1_Conditional_1_Conditional_7_Template, 3, 1, "ul", 18);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const node_r7 = i0.ɵɵnextContext().$implicit;
    const row_r6 = i0.ɵɵreadContextLet(0);
    const depth_r10 = i0.ɵɵnextContext().depth;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵattribute("data-row-key", row_r6.key)("aria-level", row_r6.level)("aria-setsize", row_r6.setSize)("aria-posinset", row_r6.position)("aria-expanded", node_r7.expandable || node_r7.expanded ? node_r7.expanded : null)("aria-selected", row_r6.key === ctx_r1.currentKey())("aria-current", row_r6.key === ctx_r1.currentKey() ? "page" : null)("aria-busy", node_r7.loading ? true : null)("tabindex", row_r6.key === ctx_r1.tabStop() ? 0 : -1);
    i0.ɵɵadvance();
    i0.ɵɵstyleProp("padding-inline-start", 8 + (depth_r10 - 1) * 16, "px");
    i0.ɵɵclassProp("nxs-document-tree__row--current", row_r6.key === ctx_r1.currentKey());
    i0.ɵɵadvance();
    i0.ɵɵconditional(node_r7.loading ? 2 : node_r7.expandable || node_r7.expanded ? 3 : 4);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r1.nodeLabel(node_r7));
    i0.ɵɵadvance();
    i0.ɵɵconditional(node_r7.expanded ? 7 : -1);
} }
function NxsDocumentTreeComponent_ng_template_3_For_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdeclareLet(0);
    i0.ɵɵconditionalCreate(1, NxsDocumentTreeComponent_ng_template_3_For_1_Conditional_1_Template, 8, 16, "li", 11);
} if (rf & 2) {
    const node_r7 = ctx.$implicit;
    const row_r12 = i0.ɵɵstoreLet(i0.ɵɵnextContext(2).rowFor(node_r7.key));
    i0.ɵɵadvance();
    i0.ɵɵconditional(row_r12 ? 1 : -1);
} }
function NxsDocumentTreeComponent_ng_template_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, NxsDocumentTreeComponent_ng_template_3_For_1_Template, 2, 2, null, null, _forTrack0);
} if (rf & 2) {
    const nodes_r13 = ctx.$implicit;
    i0.ɵɵrepeater(nodes_r13);
} }
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
export class NxsDocumentTreeComponent {
    /** The Nuxeo path of the folder on screen: the tree expands down to it and marks it. */
    currentPath = input('/', ...(ngDevMode ? [{ debugName: "currentPath" }] : []));
    /** The tree's accessible name, already translated, such as "Folders". */
    label = input.required(...(ngDevMode ? [{ debugName: "label" }] : []));
    /** A folder was chosen. The repository root arrives as a document whose path is `/`. */
    navigate = output();
    browse = inject(BrowseService);
    announcer = inject(LiveAnnouncer);
    translate = inject(TranslateService);
    host = inject(ElementRef);
    destroyRef = inject(DestroyRef);
    direction = inject(Directionality, { optional: true });
    status = signal('loading', ...(ngDevMode ? [{ debugName: "status" }] : []));
    loadError = signal(500, ...(ngDevMode ? [{ debugName: "loadError" }] : []));
    /** The row in the Tab sequence, by key; the current folder's until the user moves. */
    focusKey = signal(null, ...(ngDevMode ? [{ debugName: "focusKey" }] : []));
    revision = signal(0, ...(ngDevMode ? [{ debugName: "revision" }] : []));
    root = null;
    loadGeneration = 0;
    syncGeneration = 0;
    /** At the repository root, the root with its domains; inside a domain, that domain's branch. */
    topNodes = computed(() => {
        this.revision();
        const root = this.root;
        if (!root)
            return [];
        const path = normalizeNuxeoPath(this.currentPath());
        if (isRepositoryRootPath(path))
            return [root];
        const domainPath = topLevelNuxeoFolderPath(path);
        const domain = domainPath ? nodeAt(root.children, domainPath) : undefined;
        return domain ? [domain] : [root];
    }, ...(ngDevMode ? [{ debugName: "topNodes" }] : []));
    showRootBack = computed(() => this.status() === 'ready' && this.topNodes()[0]?.root === false, ...(ngDevMode ? [{ debugName: "showRootBack" }] : []));
    /** Every visible row, in reading order, which is what the arrow keys walk. */
    rows = computed(() => {
        const rows = [];
        const walk = (nodes, level) => {
            nodes.forEach((node, index) => {
                rows.push({
                    kind: 'node',
                    key: node.key,
                    node,
                    level,
                    setSize: nodes.length,
                    position: index + 1,
                });
                if (!node.expanded)
                    return;
                if (node.error) {
                    rows.push({
                        kind: 'error',
                        key: `${node.key}#error`,
                        node,
                        level: level + 1,
                        setSize: 1,
                        position: 1,
                    });
                }
                else {
                    walk(node.children, level + 1);
                }
            });
        };
        walk(this.topNodes(), 1);
        return rows;
    }, ...(ngDevMode ? [{ debugName: "rows" }] : []));
    /** The deepest visible folder on the current path: the folder itself, or its nearest shown ancestor. */
    currentKey = computed(() => {
        this.revision();
        const path = normalizeNuxeoPath(this.currentPath());
        const target = nuxeoPathSegments(path);
        let best = null;
        // Deeper wins; at the same depth a folder whose path matches exactly wins over one that
        // matches only ignoring case and spacing, so of `Folder` and `folder` the right one is marked.
        let bestRank = -1;
        for (const row of this.rows()) {
            if (row.kind !== 'node')
                continue;
            const node = row.node;
            if (node.root) {
                if (bestRank < 0) {
                    best = node;
                    bestRank = 0;
                }
                continue;
            }
            const own = normalizeNuxeoPath(node.doc.path ?? '');
            const segments = nuxeoPathSegments(own);
            const onPath = segments.length <= target.length && segments.every((segment, i) => segment === target[i]);
            if (!onPath)
                continue;
            const exact = path === own || path.startsWith(`${own}/`);
            const rank = segments.length * 2 + (exact ? 1 : 0);
            if (rank > bestRank) {
                best = node;
                bestRank = rank;
            }
        }
        return best?.key ?? null;
    }, ...(ngDevMode ? [{ debugName: "currentKey" }] : []));
    rowsByKey = computed(() => new Map(this.rows().map((row) => [row.key, row])), ...(ngDevMode ? [{ debugName: "rowsByKey" }] : []));
    rowFor(key) {
        return this.rowsByKey().get(key);
    }
    tabStop = computed(() => {
        const keys = new Set(this.rows().map((row) => row.key));
        const focus = this.focusKey();
        if (focus && keys.has(focus))
            return focus;
        return this.currentKey() ?? this.rows()[0]?.key ?? null;
    }, ...(ngDevMode ? [{ debugName: "tabStop" }] : []));
    constructor() {
        this.load();
        effect(() => {
            const path = this.currentPath();
            untracked(() => this.syncTo(path));
        });
    }
    /** Reads the tree again from the repository, as after a folder is created, moved or deleted. */
    reload() {
        this.root = null;
        this.focusKey.set(null);
        this.bump();
        this.load();
    }
    nodeLabel(node) {
        return node.root
            ? this.translate.instant('satori-components.document-tree.root')
            : node.doc.title;
    }
    /** A click on a row's arrow expands or collapses it; anywhere else on the row opens it. */
    onItemClick(event, row) {
        event.stopPropagation();
        this.focusKey.set(row.key);
        if (row.kind === 'error') {
            this.retry(row.node);
            return;
        }
        const onArrow = event.target?.closest('.nxs-document-tree__arrow');
        if (onArrow)
            this.toggle(row.node);
        else
            this.open(row.node);
    }
    onKeydown(event, row) {
        if (event.target !== event.currentTarget)
            return;
        const rows = this.rows();
        const at = rows.findIndex((candidate) => candidate.key === row.key);
        const rtl = this.direction?.value === 'rtl';
        const inward = rtl ? 'ArrowLeft' : 'ArrowRight';
        const outward = rtl ? 'ArrowRight' : 'ArrowLeft';
        const node = row.node;
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.focus(rows[Math.min(at + 1, rows.length - 1)]);
                return;
            case 'ArrowUp':
                event.preventDefault();
                this.focus(rows[Math.max(at - 1, 0)]);
                return;
            case 'Home':
                event.preventDefault();
                this.focus(rows[0]);
                return;
            case 'End':
                event.preventDefault();
                this.focus(rows[rows.length - 1]);
                return;
            case 'Enter':
                event.preventDefault();
                if (row.kind === 'error')
                    this.retry(node);
                else
                    this.open(node);
                return;
            case ' ':
                event.preventDefault();
                if (row.kind === 'error')
                    this.retry(node);
                else
                    this.toggle(node);
                return;
        }
        if (event.key === inward) {
            event.preventDefault();
            if (row.kind === 'error')
                return;
            if (!node.expanded && node.expandable)
                this.toggle(node);
            else if (node.expanded)
                this.focus(rows[at + 1]?.level > row.level ? rows[at + 1] : row);
        }
        else if (event.key === outward) {
            event.preventDefault();
            if (row.kind === 'node' && node.expanded) {
                node.expanded = false;
                this.bump();
                return;
            }
            const parentKey = row.kind === 'error' ? node.key : node.parent?.key;
            const parent = rows.find((candidate) => candidate.key === parentKey);
            if (parent)
                this.focus(parent);
        }
    }
    focus(row) {
        if (!row)
            return;
        this.focusKey.set(row.key);
        queueMicrotask(() => [...this.host.nativeElement.querySelectorAll('[data-row-key]')]
            .find((element) => element.dataset['rowKey'] === row.key)
            ?.focus());
    }
    openRoot() {
        if (this.root)
            this.open(this.root);
    }
    open(node) {
        if (node.root) {
            // Web UI's shortcut: a repository with one domain opens that domain, not an empty root.
            const only = node.children.length === 1 ? node.children[0] : null;
            this.navigate.emit(only ? only.doc : { ...node.doc, path: '/' });
            return;
        }
        this.navigate.emit(node.doc);
    }
    toggle(node) {
        if (node.loading)
            return;
        if (node.expanded) {
            node.expanded = false;
            this.bump();
            return;
        }
        if (node.loaded && !node.error) {
            node.expanded = node.children.length > 0;
            this.bump();
            return;
        }
        this.loadChildren(node)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
            node.expanded = node.error !== null || node.children.length > 0;
            this.bump();
        });
    }
    retry(node) {
        node.error = null;
        node.loaded = false;
        node.expanded = false;
        this.focusKey.set(node.key);
        this.toggle(node);
    }
    load() {
        const generation = ++this.loadGeneration;
        this.status.set('loading');
        this.browse
            .getNavTreeBootstrap()
            .pipe(switchMap(({ root, entries }) => {
            const node = this.node(root, null, true);
            node.children = this.toNodes(entries, node);
            node.loaded = true;
            node.expanded = true;
            return this.probe(node.children).pipe(map(() => node));
        }), takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (root) => {
                if (generation !== this.loadGeneration)
                    return;
                this.root = root;
                this.status.set('ready');
                this.bump();
                this.syncTo(this.currentPath());
            },
            error: (error) => {
                if (generation !== this.loadGeneration)
                    return;
                const status = nxsErrorStatus(error);
                this.loadError.set(status);
                this.status.set('error');
                this.announce(status, null);
            },
        });
    }
    /** Expands every folder on `path`, loading the ones not loaded yet, and folds the rest away. */
    syncTo(path) {
        const root = this.root;
        if (!root)
            return;
        const generation = ++this.syncGeneration;
        const prefixes = cumulativeNuxeoPathPrefixes(normalizeNuxeoPath(path));
        root.expanded = true;
        const step = (nodes, index) => {
            if (generation !== this.syncGeneration)
                return;
            const next = index < prefixes.length ? nodeAt(nodes, prefixes[index]) : undefined;
            for (const node of nodes) {
                if (node !== next)
                    collapse(node);
            }
            if (!next) {
                this.bump();
                return;
            }
            if (next.loaded) {
                next.expanded = next.error !== null || next.children.length > 0;
                step(next.children, index + 1);
                return;
            }
            next.loading = true;
            this.bump();
            this.loadChildren(next)
                .pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe(() => {
                if (generation !== this.syncGeneration)
                    return;
                next.expanded = next.error !== null || next.children.length > 0;
                step(next.children, index + 1);
            });
        };
        step(root.children, 0);
    }
    /** Loads a folder's folders and which of them hold one; a failure is recorded, not thrown. */
    loadChildren(node) {
        node.loading = true;
        node.error = null;
        this.bump();
        return this.browse.getNavTreeChildren(node.doc).pipe(switchMap((list) => {
            const children = this.toNodes(list.entries ?? [], node);
            return this.probe(children).pipe(map(() => children));
        }), map((children) => {
            node.children = children;
            node.loaded = true;
            node.loading = false;
            node.expandable = children.length > 0;
        }), catchError((error) => {
            const status = nxsErrorStatus(error);
            node.loading = false;
            node.loaded = false;
            node.error = status;
            this.announce(status, node);
            return of(undefined);
        }));
    }
    /** One query for a whole level: which of these folders hold a folder. Unknown keeps the arrow. */
    probe(nodes) {
        if (nodes.length === 0)
            return of(undefined);
        return this.browse.getFolderIdsWithSubfolders(nodes.map((node) => node.doc.uid)).pipe(map((withFolders) => {
            if (!withFolders)
                return;
            for (const node of nodes)
                node.expandable = withFolders.has(node.doc.uid);
        }), catchError(() => of(undefined)));
    }
    toNodes(entries, parent) {
        return entries
            .filter((doc) => isBrowsableNavNode(doc))
            .map((doc) => this.node(doc, parent, false));
    }
    node(doc, parent, root) {
        return {
            key: root ? 'root' : doc.uid,
            doc,
            root,
            parent,
            children: [],
            loaded: false,
            loading: false,
            expanded: false,
            expandable: true,
            error: null,
        };
    }
    announce(status, node) {
        const name = node ? this.nodeLabel(node) : '';
        const key = node
            ? status === 403
                ? 'satori-components.document-tree.children-forbidden'
                : 'satori-components.document-tree.children-failed'
            : 'satori-components.document-tree.load-failed';
        void this.announcer.announce(this.translate.instant(key, { name }), 'assertive');
    }
    bump() {
        this.revision.update((value) => value + 1);
    }
    static ɵfac = function NxsDocumentTreeComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsDocumentTreeComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsDocumentTreeComponent, selectors: [["nxs-document-tree"]], hostAttrs: [1, "nxs-document-tree"], inputs: { currentPath: [1, "currentPath"], label: [1, "label"] }, outputs: { navigate: "navigate" }, decls: 5, vars: 1, consts: [["level", ""], [1, "nxs-document-tree__state"], ["retryable", "", 1, "nxs-document-tree__error", 3, "status", "heading", "headingLevel"], ["diameter", "24", 3, "label"], ["retryable", "", 1, "nxs-document-tree__error", 3, "retry", "status", "heading", "headingLevel"], ["type", "button", 1, "nxs-document-tree__back"], [1, "nxs-document-tree__empty"], ["role", "tree", 1, "nxs-document-tree__tree"], ["type", "button", 1, "nxs-document-tree__back", 3, "click"], ["aria-hidden", "true", 1, "nxs-document-tree__back-icon"], [4, "ngTemplateOutlet", "ngTemplateOutletContext"], ["role", "treeitem", 1, "nxs-document-tree__item"], ["role", "treeitem", 1, "nxs-document-tree__item", 3, "keydown", "click", "focus"], [1, "nxs-document-tree__row"], ["diameter", "14", 1, "nxs-document-tree__toggle"], ["aria-hidden", "true", 1, "nxs-document-tree__toggle", "nxs-document-tree__arrow", 3, "nxs-document-tree__arrow--open"], ["aria-hidden", "true", 1, "nxs-document-tree__toggle"], [1, "nxs-document-tree__label"], ["role", "group", 1, "nxs-document-tree__group"], ["aria-hidden", "true", 1, "nxs-document-tree__toggle", "nxs-document-tree__arrow"], ["role", "treeitem", "aria-setsize", "1", "aria-posinset", "1", "aria-selected", "false", 1, "nxs-document-tree__item", "nxs-document-tree__item--error"], ["role", "treeitem", "aria-setsize", "1", "aria-posinset", "1", "aria-selected", "false", 1, "nxs-document-tree__item", "nxs-document-tree__item--error", 3, "keydown", "click", "focus"], [1, "nxs-document-tree__row", "nxs-document-tree__row--error"]], template: function NxsDocumentTreeComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, NxsDocumentTreeComponent_Conditional_0_Template, 3, 3, "div", 1)(1, NxsDocumentTreeComponent_Conditional_1_Template, 2, 5, "nxs-error-state", 2)(2, NxsDocumentTreeComponent_Conditional_2_Template, 3, 2);
            i0.ɵɵtemplate(3, NxsDocumentTreeComponent_ng_template_3_Template, 2, 0, "ng-template", null, 0, i0.ɵɵtemplateRefExtractor);
        } if (rf & 2) {
            i0.ɵɵconditional(ctx.status() === "loading" ? 0 : ctx.status() === "error" ? 1 : 2);
        } }, dependencies: [MatIconModule, i1.MatIcon, NgTemplateOutlet,
            NxsErrorStateComponent,
            NxsSpinnerComponent,
            TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: block;\n  font: var(--mat-sys-body-medium);\n  color: var(--mat-sys-on-surface);\n}\n\n.nxs-document-tree__state[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  padding: 16px 0;\n}\n\n.nxs-document-tree__empty[_ngcontent-%COMP%] {\n  margin: 0;\n  padding: 12px 16px;\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.nxs-document-tree__back[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  width: 100%;\n  padding: 6px 8px;\n  border: 0;\n  border-bottom: 1px solid var(--mat-sys-outline-variant);\n  background: none;\n  font: inherit;\n  color: inherit;\n  text-align: start;\n  cursor: pointer;\n\n  // IBM Equal Access's style_focus_visible reads `:focus` only and does not resolve selector\n  // lists, so the ring is also declared on a standalone `:focus` (NXSAT-547).\n  &:focus {\n    outline: 2px solid var(--mat-sys-primary);\n    outline-offset: -2px;\n  }\n\n  &:focus-visible {\n    outline: 2px solid var(--mat-sys-primary);\n    outline-offset: -2px;\n  }\n}\n\n[dir='rtl'][_nghost-%COMP%]   .nxs-document-tree__back-icon[_ngcontent-%COMP%]   ,[_ngcontent-%COMP%]   [dir='rtl'][_ngcontent-%COMP%]   [_nghost-%COMP%]   .nxs-document-tree__back-icon[_ngcontent-%COMP%] {\n  transform: scaleX(-1);\n}\n\n.nxs-document-tree__tree,\n.nxs-document-tree__group[_ngcontent-%COMP%] {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.nxs-document-tree__item[_ngcontent-%COMP%] {\n  outline: none;\n\n  // As the Root back control: a standalone `:focus` for IBM's style_focus_visible.\n  &:focus > .nxs-document-tree__row {\n    outline: 2px solid var(--mat-sys-primary);\n    outline-offset: -2px;\n  }\n\n  &:focus-visible > .nxs-document-tree__row {\n    outline: 2px solid var(--mat-sys-primary);\n    outline-offset: -2px;\n  }\n}\n\n.nxs-document-tree__row[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  min-height: 32px;\n  padding-inline-end: 8px;\n  border-radius: 4px;\n  cursor: pointer;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-high);\n  }\n}\n\n.nxs-document-tree__row--current[_ngcontent-%COMP%] {\n  background: var(--mat-sys-secondary-container);\n  color: var(--mat-sys-on-secondary-container);\n  font-weight: 500;\n\n  &:hover {\n    background: var(--mat-sys-secondary-container);\n  }\n}\n\n.nxs-document-tree__row--error[_ngcontent-%COMP%] {\n  color: var(--mat-sys-error);\n}\n\n.nxs-document-tree__toggle[_ngcontent-%COMP%] {\n  display: inline-flex;\n  flex: 0 0 20px;\n  justify-content: center;\n  width: 20px;\n  height: 20px;\n  font-size: 20px;\n}\n\n.nxs-document-tree__arrow[_ngcontent-%COMP%] {\n  transition: transform 0.15s;\n}\n\n.nxs-document-tree__arrow--open[_ngcontent-%COMP%] {\n  transform: rotate(90deg);\n}\n\n[dir='rtl'][_nghost-%COMP%]   .nxs-document-tree__arrow[_ngcontent-%COMP%]:not(.nxs-document-tree__arrow--open), [dir='rtl']   [_nghost-%COMP%]   .nxs-document-tree__arrow[_ngcontent-%COMP%]:not(.nxs-document-tree__arrow--open) {\n  transform: scaleX(-1);\n}\n\n.nxs-document-tree__label[_ngcontent-%COMP%] {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsDocumentTreeComponent, [{
        type: Component,
        args: [{ selector: 'nxs-document-tree', standalone: true, imports: [
                    MatIconModule,
                    NgTemplateOutlet,
                    NxsErrorStateComponent,
                    NxsSpinnerComponent,
                    TranslatePipe,
                ], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-document-tree' }, template: "@if (status() === 'loading') {\n  <div class=\"nxs-document-tree__state\">\n    <nxs-spinner diameter=\"24\" [label]=\"'satori-components.document-tree.loading' | translate\" />\n  </div>\n} @else if (status() === 'error') {\n  <nxs-error-state\n    class=\"nxs-document-tree__error\"\n    [status]=\"loadError()\"\n    [heading]=\"\n      loadError() === 500 ? ('satori-components.document-tree.load-failed' | translate) : ''\n    \"\n    [headingLevel]=\"3\"\n    retryable\n    (retry)=\"reload()\"\n  />\n} @else {\n  @if (showRootBack()) {\n    <button type=\"button\" class=\"nxs-document-tree__back\" (click)=\"openRoot()\">\n      <mat-icon class=\"nxs-document-tree__back-icon\" aria-hidden=\"true\">chevron_left</mat-icon>\n      {{ 'satori-components.document-tree.root' | translate }}\n    </button>\n  }\n  @if (rows().length === 0) {\n    <p class=\"nxs-document-tree__empty\">\n      {{ 'satori-components.document-tree.empty' | translate }}\n    </p>\n  } @else {\n    <ul class=\"nxs-document-tree__tree\" role=\"tree\" [attr.aria-label]=\"label()\">\n      <ng-container *ngTemplateOutlet=\"level; context: { $implicit: topNodes(), depth: 1 }\" />\n    </ul>\n  }\n}\n\n<ng-template #level let-nodes let-depth=\"depth\">\n  @for (node of nodes; track node.key) {\n    @let row = rowFor(node.key);\n    @if (row) {\n      <li\n        class=\"nxs-document-tree__item\"\n        role=\"treeitem\"\n        [attr.data-row-key]=\"row.key\"\n        [attr.aria-level]=\"row.level\"\n        [attr.aria-setsize]=\"row.setSize\"\n        [attr.aria-posinset]=\"row.position\"\n        [attr.aria-expanded]=\"node.expandable || node.expanded ? node.expanded : null\"\n        [attr.aria-selected]=\"row.key === currentKey()\"\n        [attr.aria-current]=\"row.key === currentKey() ? 'page' : null\"\n        [attr.aria-busy]=\"node.loading ? true : null\"\n        [attr.tabindex]=\"row.key === tabStop() ? 0 : -1\"\n        (keydown)=\"onKeydown($event, row)\"\n        (click)=\"onItemClick($event, row)\"\n        (focus)=\"focusKey.set(row.key)\"\n      >\n        <div\n          class=\"nxs-document-tree__row\"\n          [class.nxs-document-tree__row--current]=\"row.key === currentKey()\"\n          [style.padding-inline-start.px]=\"8 + (depth - 1) * 16\"\n        >\n          @if (node.loading) {\n            <nxs-spinner class=\"nxs-document-tree__toggle\" diameter=\"14\" />\n          } @else if (node.expandable || node.expanded) {\n            <mat-icon\n              class=\"nxs-document-tree__toggle nxs-document-tree__arrow\"\n              [class.nxs-document-tree__arrow--open]=\"node.expanded\"\n              aria-hidden=\"true\"\n              >chevron_right</mat-icon\n            >\n          } @else {\n            <span class=\"nxs-document-tree__toggle\" aria-hidden=\"true\"></span>\n          }\n          <span class=\"nxs-document-tree__label\">{{ nodeLabel(node) }}</span>\n        </div>\n        @if (node.expanded) {\n          <ul class=\"nxs-document-tree__group\" role=\"group\">\n            @if (node.error) {\n              @let errorRow = rowFor(node.key + '#error');\n              @if (errorRow) {\n                <li\n                  class=\"nxs-document-tree__item nxs-document-tree__item--error\"\n                  role=\"treeitem\"\n                  [attr.data-row-key]=\"errorRow.key\"\n                  [attr.aria-level]=\"errorRow.level\"\n                  aria-setsize=\"1\"\n                  aria-posinset=\"1\"\n                  aria-selected=\"false\"\n                  [attr.tabindex]=\"errorRow.key === tabStop() ? 0 : -1\"\n                  (keydown)=\"onKeydown($event, errorRow)\"\n                  (click)=\"onItemClick($event, errorRow)\"\n                  (focus)=\"focusKey.set(errorRow.key)\"\n                >\n                  <div\n                    class=\"nxs-document-tree__row nxs-document-tree__row--error\"\n                    [style.padding-inline-start.px]=\"8 + depth * 16\"\n                  >\n                    <mat-icon class=\"nxs-document-tree__toggle\" aria-hidden=\"true\"\n                      >error_outline</mat-icon\n                    >\n                    <span class=\"nxs-document-tree__label\">{{\n                      (node.error === 403\n                        ? 'satori-components.document-tree.children-forbidden-row'\n                        : 'satori-components.document-tree.children-failed-row'\n                      ) | translate\n                    }}</span>\n                  </div>\n                </li>\n              }\n            } @else {\n              <ng-container\n                *ngTemplateOutlet=\"level; context: { $implicit: node.children, depth: depth + 1 }\"\n              />\n            }\n          </ul>\n        }\n      </li>\n    }\n  }\n</ng-template>\n", styles: [":host {\n  display: block;\n  font: var(--mat-sys-body-medium);\n  color: var(--mat-sys-on-surface);\n}\n\n.nxs-document-tree__state {\n  display: flex;\n  justify-content: center;\n  padding: 16px 0;\n}\n\n.nxs-document-tree__empty {\n  margin: 0;\n  padding: 12px 16px;\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.nxs-document-tree__back {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  width: 100%;\n  padding: 6px 8px;\n  border: 0;\n  border-bottom: 1px solid var(--mat-sys-outline-variant);\n  background: none;\n  font: inherit;\n  color: inherit;\n  text-align: start;\n  cursor: pointer;\n\n  // IBM Equal Access's style_focus_visible reads `:focus` only and does not resolve selector\n  // lists, so the ring is also declared on a standalone `:focus` (NXSAT-547).\n  &:focus {\n    outline: 2px solid var(--mat-sys-primary);\n    outline-offset: -2px;\n  }\n\n  &:focus-visible {\n    outline: 2px solid var(--mat-sys-primary);\n    outline-offset: -2px;\n  }\n}\n\n:host-context([dir='rtl']) .nxs-document-tree__back-icon {\n  transform: scaleX(-1);\n}\n\n.nxs-document-tree__tree,\n.nxs-document-tree__group {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.nxs-document-tree__item {\n  outline: none;\n\n  // As the Root back control: a standalone `:focus` for IBM's style_focus_visible.\n  &:focus > .nxs-document-tree__row {\n    outline: 2px solid var(--mat-sys-primary);\n    outline-offset: -2px;\n  }\n\n  &:focus-visible > .nxs-document-tree__row {\n    outline: 2px solid var(--mat-sys-primary);\n    outline-offset: -2px;\n  }\n}\n\n.nxs-document-tree__row {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  min-height: 32px;\n  padding-inline-end: 8px;\n  border-radius: 4px;\n  cursor: pointer;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-high);\n  }\n}\n\n.nxs-document-tree__row--current {\n  background: var(--mat-sys-secondary-container);\n  color: var(--mat-sys-on-secondary-container);\n  font-weight: 500;\n\n  &:hover {\n    background: var(--mat-sys-secondary-container);\n  }\n}\n\n.nxs-document-tree__row--error {\n  color: var(--mat-sys-error);\n}\n\n.nxs-document-tree__toggle {\n  display: inline-flex;\n  flex: 0 0 20px;\n  justify-content: center;\n  width: 20px;\n  height: 20px;\n  font-size: 20px;\n}\n\n.nxs-document-tree__arrow {\n  transition: transform 0.15s;\n}\n\n.nxs-document-tree__arrow--open {\n  transform: rotate(90deg);\n}\n\n:host-context([dir='rtl']) .nxs-document-tree__arrow:not(.nxs-document-tree__arrow--open) {\n  transform: scaleX(-1);\n}\n\n.nxs-document-tree__label {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n"] }]
    }], () => [], { currentPath: [{ type: i0.Input, args: [{ isSignal: true, alias: "currentPath", required: false }] }], label: [{ type: i0.Input, args: [{ isSignal: true, alias: "label", required: true }] }], navigate: [{ type: i0.Output, args: ["navigate"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsDocumentTreeComponent, { className: "NxsDocumentTreeComponent", filePath: "libs/shared/satori-components/src/lib/document-tree/document-tree.component.ts", lineNumber: 95 }); })();
function collapse(node) {
    node.expanded = false;
    for (const child of node.children)
        collapse(child);
}
/**
 * The folder at `path` among siblings: the one whose path is exactly `path`, else one that differs
 * only in case or spacing, since the path in the address may not match Nuxeo's casing.
 */
function nodeAt(nodes, path) {
    const exact = normalizeNuxeoPath(path);
    return (nodes.find((node) => normalizeNuxeoPath(node.doc.path ?? '') === exact) ??
        nodes.find((node) => nuxeoPathsEqualFlexible(node.doc.path ?? '', path)));
}
