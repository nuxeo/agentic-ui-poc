import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, output, signal, viewChild, } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatAutocomplete, MatAutocompleteTrigger, MatOption, } from '@angular/material/autocomplete';
import { MatChipGrid, MatChipInput, MatChipRemove, MatChipRow, } from '@angular/material/chips';
import { MatFormField } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TagService } from '@nuxeo/satori-platform/nuxeo-client';
import { catchError, concatMap, debounceTime, distinctUntilChanged, map, of, Subject, switchMap, } from 'rxjs';
import { NxsSpinnerComponent } from '../spinner/spinner.component';
import { NxsTagComponent } from '../tag/tag.component';
import { provideNxsToast, NxsToastService } from '../toast/toast.service';
import * as i0 from "@angular/core";
const _c0 = ["box"];
const _c1 = a0 => ({ tag: a0 });
const _forTrack0 = ($index, $item) => $item.label;
function NxsTagEditorComponent_Conditional_0_For_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li");
    i0.ɵɵelement(1, "nxs-tag", 6);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const tag_r1 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", tag_r1);
} }
function NxsTagEditorComponent_Conditional_0_ForEmpty_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li", 5)(1, "span", 7);
    i0.ɵɵtext(2, "\u2014");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span", 8);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 1, "satori-components.tag-editor.none"));
} }
function NxsTagEditorComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 3);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵrepeaterCreate(2, NxsTagEditorComponent_Conditional_0_For_3_Template, 2, 1, "li", null, i0.ɵɵrepeaterTrackByIdentity, false, NxsTagEditorComponent_Conditional_0_ForEmpty_4_Template, 6, 3, "li", 5);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 2, "satori-components.tag-editor.tags"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.saved());
} }
function NxsTagEditorComponent_Conditional_1_For_5_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-chip-row", 13);
    i0.ɵɵlistener("removed", function NxsTagEditorComponent_Conditional_1_For_5_Template_mat_chip_row_removed_0_listener() { const tag_r5 = i0.ɵɵrestoreView(_r4).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.remove(tag_r5)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementStart(2, "button", 14);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelement(4, "mat-icon", 15);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const tag_r5 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", tag_r5, " ");
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind2(3, 2, "satori-components.tag-editor.remove", i0.ɵɵpureFunction1(5, _c1, tag_r5)));
} }
function NxsTagEditorComponent_Conditional_1_For_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-chip-row", 9);
    i0.ɵɵtext(1);
    i0.ɵɵelement(2, "nxs-spinner", 16);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const tag_r6 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", tag_r6, " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", i0.ɵɵpipeBind2(3, 2, "satori-components.tag-editor.adding", i0.ɵɵpureFunction1(5, _c1, tag_r6)));
} }
function NxsTagEditorComponent_Conditional_1_For_15_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 17);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const option_r8 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(2, 1, "satori-components.tag-editor.new", i0.ɵɵpureFunction1(4, _c1, option_r8.label)));
} }
function NxsTagEditorComponent_Conditional_1_For_15_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const option_r8 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵtextInterpolate1(" ", option_r8.label, " ");
} }
function NxsTagEditorComponent_Conditional_1_For_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 12);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵconditionalCreate(2, NxsTagEditorComponent_Conditional_1_For_15_Conditional_2_Template, 3, 6, "span", 17)(3, NxsTagEditorComponent_Conditional_1_For_15_Conditional_3_Template, 1, 1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const option_r8 = ctx.$implicit;
    i0.ɵɵproperty("value", option_r8);
    i0.ɵɵattribute("aria-label", option_r8.isNew ? i0.ɵɵpipeBind2(1, 3, "satori-components.tag-editor.new-label", i0.ɵɵpureFunction1(6, _c1, option_r8.label)) : null);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(option_r8.isNew ? 2 : 3);
} }
function NxsTagEditorComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-form-field", 4)(1, "mat-chip-grid", null, 0);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵrepeaterCreate(4, NxsTagEditorComponent_Conditional_1_For_5_Template, 5, 7, "mat-chip-row", null, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵrepeaterCreate(6, NxsTagEditorComponent_Conditional_1_For_7_Template, 4, 7, "mat-chip-row", 9, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "input", 10, 1);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵlistener("input", function NxsTagEditorComponent_Conditional_1_Template_input_input_8_listener() { i0.ɵɵrestoreView(_r3); const box_r7 = i0.ɵɵreference(9); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.typed(box_r7.value)); })("matChipInputTokenEnd", function NxsTagEditorComponent_Conditional_1_Template_input_matChipInputTokenEnd_8_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.entered($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "mat-autocomplete", 11, 2);
    i0.ɵɵlistener("optionSelected", function NxsTagEditorComponent_Conditional_1_Template_mat_autocomplete_optionSelected_12_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.picked($event)); });
    i0.ɵɵrepeaterCreate(14, NxsTagEditorComponent_Conditional_1_For_15_Template, 4, 8, "mat-option", 12, _forTrack0);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const grid_r9 = i0.ɵɵreference(2);
    const suggestionList_r10 = i0.ɵɵreference(13);
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(3, 6, "satori-components.tag-editor.tags"));
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(ctx_r1.shown());
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.adding());
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("id", ctx_r1.id + "-box")("placeholder", i0.ɵɵpipeBind1(10, 8, "satori-components.tag-editor.add"))("matChipInputFor", grid_r9)("matAutocomplete", suggestionList_r10);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(11, 10, "satori-components.tag-editor.add"));
    i0.ɵɵadvance(6);
    i0.ɵɵrepeater(ctx_r1.options());
} }
const same = (a, b) => a.toLowerCase() === b.toLowerCase();
let nextId = 0;
/**
 * A document's tags, added and removed in place — Web UI's `nuxeo-tag-suggestion` with
 * `allow-new-tags`, as the document page uses it.
 *
 * It tags the document itself through `TagService`. As in Web UI:
 *
 * - Typing suggests existing tags through the `Tag.Suggestion` operation, and offers the typed text
 *   as a new tag when no tag matches it exactly. Enter adds what is highlighted.
 * - Each change is saved at once; there is no Save button. Nuxeo normalises a label, so the chip
 *   shows the label it stored, and a toast says what changed.
 * - `readOnly` shows the tags without the box or the remove buttons. Web UI's rule for it is
 *   `canTagDocument`: Write on the document itself, not a version or a proxy.
 *
 * Changes are sent one at a time, in order, so an answer can never overwrite a later one.
 * `tagsChange` hands the document's tags to the host after each saved change.
 */
export class NxsTagEditorComponent {
    tagService = inject(TagService);
    translate = inject(TranslateService);
    toast = inject(NxsToastService);
    /** The document to tag. */
    documentUid = input.required(...(ngDevMode ? [{ debugName: "documentUid" }] : []));
    /** The document's tags as loaded — `nxtag:tags`' labels. */
    tags = input([], ...(ngDevMode ? [{ debugName: "tags" }] : []));
    /** Shows the tags only, with no box and no remove buttons. */
    readOnly = input(false, ...(ngDevMode ? [{ debugName: "readOnly" }] : []));
    /** The document's tags after each saved change, as Nuxeo stored them. */
    tagsChange = output();
    id = `nxs-tag-editor-${nextId++}`;
    boxRef = viewChild('box', ...(ngDevMode ? [{ debugName: "boxRef" }] : []));
    trigger = viewChild(MatAutocompleteTrigger, ...(ngDevMode ? [{ debugName: "trigger" }] : []));
    /** The tags as last known: the input, then each answer from the server. */
    saved = linkedSignal(...(ngDevMode ? [{ debugName: "saved", source: () => ({ uid: this.documentUid(), tags: this.tags() }),
            computation: ({ tags }) => tags }] : [{
            source: () => ({ uid: this.documentUid(), tags: this.tags() }),
            computation: ({ tags }) => tags,
        }]));
    adding = signal([], ...(ngDevMode ? [{ debugName: "adding" }] : []));
    removing = signal(new Set(), ...(ngDevMode ? [{ debugName: "removing" }] : []));
    term = signal('', ...(ngDevMode ? [{ debugName: "term" }] : []));
    suggestions = signal([], ...(ngDevMode ? [{ debugName: "suggestions" }] : []));
    /** The chips: the saved tags less those being removed. Tags being added show after them. */
    shown = computed(() => this.saved().filter((tag) => !this.removing().has(tag)), ...(ngDevMode ? [{ debugName: "shown" }] : []));
    options = computed(() => {
        const term = this.term().trim().toLowerCase();
        if (!term)
            return [];
        const taken = [...this.saved(), ...this.adding()];
        const existing = this.suggestions()
            .filter((tag) => !taken.some((other) => same(other, tag)))
            .map((label) => ({ label, isNew: false }));
        const known = [...taken, ...this.suggestions()].some((tag) => same(tag, term));
        return known ? existing : [{ label: term, isNew: true }, ...existing];
    }, ...(ngDevMode ? [{ debugName: "options" }] : []));
    requests = new Subject();
    terms = new Subject();
    constructor() {
        toObservable(this.documentUid)
            .pipe(switchMap((uid) => {
            this.adding.set([]);
            this.removing.set(new Set());
            return this.requests.pipe(concatMap((request) => this.send(uid, request)));
        }), takeUntilDestroyed())
            .subscribe((outcome) => this.settle(outcome));
        this.terms
            .pipe(map((term) => term.trim()), debounceTime(250), distinctUntilChanged(), switchMap((term) => term
            ? this.tagService.suggestTags(term).pipe(catchError(() => of([])))
            : of([])), takeUntilDestroyed())
            .subscribe((tags) => this.suggestions.set(tags));
    }
    typed(value) {
        this.term.set(value);
        this.terms.next(value);
    }
    /** A suggestion picked with the mouse, or highlighted when Enter was pressed. */
    picked(event) {
        const option = event.option.value;
        event.option.deselect();
        this.clearBox();
        this.add(option.label);
    }
    /** Enter in the box. Ignored while a suggestion is highlighted: picking it adds the tag. */
    entered(event) {
        const trigger = this.trigger();
        if (trigger?.panelOpen && trigger.activeOption)
            return;
        const label = event.value.trim();
        this.clearBox();
        if (label)
            this.add(label.toLowerCase());
    }
    remove(tag) {
        if (this.removing().has(tag))
            return;
        this.removing.update((labels) => new Set([...labels, tag]));
        this.requests.next({ change: 'remove', label: tag });
    }
    add(label) {
        const taken = [...this.saved(), ...this.adding()];
        if (taken.some((tag) => same(tag, label)))
            return;
        this.adding.update((labels) => [...labels, label]);
        this.requests.next({ change: 'add', label });
    }
    send(uid, request) {
        const call = request.change === 'add'
            ? this.tagService.addTag(uid, request.label)
            : this.tagService.removeTag(uid, request.label);
        return call.pipe(map((tags) => ({ ...request, tags })), catchError((error) => of({ ...request, error })));
    }
    settle(outcome) {
        const { change, label } = outcome;
        if (change === 'add') {
            this.adding.update((labels) => labels.filter((tag) => tag !== label));
        }
        else {
            this.removing.update((labels) => new Set([...labels].filter((tag) => tag !== label)));
        }
        if ('error' in outcome) {
            this.toast.error(this.failure(change, outcome.error, label));
            return;
        }
        const before = this.saved();
        this.saved.set(outcome.tags);
        this.tagsChange.emit(outcome.tags);
        // The label Nuxeo stored, which is the one to announce: "Q3 Report" comes back as `q3report`.
        const stored = change === 'add'
            ? (outcome.tags.find((tag) => !before.includes(tag)) ?? label.replace(/\s+/g, ''))
            : label;
        const done = change === 'add' ? 'added' : 'removed';
        this.toast.show(this.translate.instant(`satori-components.tag-editor.${done}`, { tag: stored }));
    }
    failure(change, error, tag) {
        const status = error instanceof HttpErrorResponse ? error.status : 0;
        const key = status === 401 || status === 403
            ? `satori-components.tag-editor.error.forbidden`
            : `satori-components.tag-editor.error.${change}`;
        return this.translate.instant(key, { tag });
    }
    clearBox() {
        const box = this.boxRef()?.nativeElement;
        if (box)
            box.value = '';
        this.typed('');
    }
    static ɵfac = function NxsTagEditorComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsTagEditorComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsTagEditorComponent, selectors: [["nxs-tag-editor"]], viewQuery: function NxsTagEditorComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.boxRef, _c0, 5);
            i0.ɵɵviewQuerySignal(ctx.trigger, MatAutocompleteTrigger, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance(2);
        } }, inputs: { documentUid: [1, "documentUid"], tags: [1, "tags"], readOnly: [1, "readOnly"] }, outputs: { tagsChange: "tagsChange" }, features: [i0.ɵɵProvidersFeature([provideNxsToast()])], decls: 2, vars: 1, consts: [["grid", ""], ["box", ""], ["suggestionList", "matAutocomplete"], [1, "nxs-tag-editor__chips"], ["subscriptSizing", "dynamic", 1, "nxs-tag-editor__field"], [1, "nxs-tag-editor__empty"], ["color", "gray", 3, "label"], ["aria-hidden", "true"], [1, "nxs-tag-editor__sr-only"], ["disabled", "", 1, "nxs-tag-editor__pending"], [1, "nxs-tag-editor__box", 3, "input", "matChipInputTokenEnd", "id", "placeholder", "matChipInputFor", "matAutocomplete"], ["autoActiveFirstOption", "", 3, "optionSelected"], [3, "value"], [3, "removed"], ["type", "button", "matChipRemove", ""], ["aria-hidden", "true", 1, "nxs-tag-editor__remove-icon"], ["diameter", "14", 3, "label"], [1, "nxs-tag-editor__new"]], template: function NxsTagEditorComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, NxsTagEditorComponent_Conditional_0_Template, 5, 4, "ul", 3)(1, NxsTagEditorComponent_Conditional_1_Template, 16, 12, "mat-form-field", 4);
        } if (rf & 2) {
            i0.ɵɵconditional(ctx.readOnly() ? 0 : 1);
        } }, dependencies: [MatAutocomplete,
            MatAutocompleteTrigger,
            MatChipGrid,
            MatChipInput,
            MatChipRemove,
            MatChipRow,
            MatFormField,
            MatIcon,
            MatOption,
            NxsSpinnerComponent,
            NxsTagComponent,
            TranslatePipe], styles: ["[_nghost-%COMP%] {\n  --nxs-tag-editor-muted: var(--mat-sys-on-surface-variant);\n  --nxs-tag-editor-new: var(--mat-sys-primary);\n  --mat-chip-container-height: 24px;\n  --mat-chip-label-text-size: 13px;\n  --mat-chip-elevated-container-color: var(--mat-sys-surface-container-high);\n  --mat-chip-label-text-color: var(--mat-sys-on-surface);\n  --mat-chip-disabled-label-text-color: var(--nxs-tag-editor-muted);\n  --mat-chip-disabled-container-opacity: 1;\n  display: block;\n  font-size: 13px;\n}\n\n.nxs-tag-editor__field[_ngcontent-%COMP%] {\n  width: 100%;\n}\n\n//[_ngcontent-%COMP%]   Below[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   chips[_ngcontent-%COMP%]   rather[_ngcontent-%COMP%]   than[_ngcontent-%COMP%]   among[_ngcontent-%COMP%]   them[_ngcontent-%COMP%], so   Material's   in-grid   flex   sizing   does   not   apply.\n[_nghost-%COMP%]   .nxs-tag-editor__box[_ngcontent-%COMP%] {\n  width: 100%;\n  margin: 4px 0 0;\n  font-size: 13px;\n}\n\n//   List   margins   are   scoped   to   the   host:   the   theme's   `.mat-typography`   rules   outrank   a   single   class.\n[_nghost-%COMP%]   .nxs-tag-editor__chips[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.nxs-tag-editor__empty[_ngcontent-%COMP%] {\n  color: var(--nxs-tag-editor-muted);\n}\n\n//[_ngcontent-%COMP%]   The[_ngcontent-%COMP%]   glyph[_ngcontent-%COMP%]   comes[_ngcontent-%COMP%]   from[_ngcontent-%COMP%]   its[_ngcontent-%COMP%]   codepoint[_ngcontent-%COMP%], not[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   `cancel`[_ngcontent-%COMP%]   ligature[_ngcontent-%COMP%]:   ligature[_ngcontent-%COMP%]   text[_ngcontent-%COMP%]   inside[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   button\n//[_ngcontent-%COMP%]   reads[_ngcontent-%COMP%]   to[_ngcontent-%COMP%]   IBM's[_ngcontent-%COMP%]   checker[_ngcontent-%COMP%]   as[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   visible[_ngcontent-%COMP%]   label[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   name[_ngcontent-%COMP%]   \"Remove[_ngcontent-%COMP%]   tag[_ngcontent-%COMP%]   \u2026\"[_ngcontent-%COMP%]   does[_ngcontent-%COMP%]   not[_ngcontent-%COMP%]   contain[_ngcontent-%COMP%]   (WCAG 2.5.3).\n.nxs-tag-editor__remove-icon::before[_ngcontent-%COMP%] {\n  content: '\\e5c9';\n  font:\n    14px/1 'Material Icons',\n    sans-serif;\n}\n\n.nxs-tag-editor__pending[_ngcontent-%COMP%]   nxs-spinner[_ngcontent-%COMP%] {\n  display: inline-flex;\n  margin-inline-start: 6px;\n  vertical-align: middle;\n}\n\n.nxs-tag-editor__new[_ngcontent-%COMP%] {\n  font-weight: 500;\n  color: var(--nxs-tag-editor-new);\n}\n\n.nxs-tag-editor__sr-only[_ngcontent-%COMP%] {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  overflow: hidden;\n  clip: rect(0 0 0 0);\n  white-space: nowrap;\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsTagEditorComponent, [{
        type: Component,
        args: [{ selector: 'nxs-tag-editor', standalone: true, imports: [
                    MatAutocomplete,
                    MatAutocompleteTrigger,
                    MatChipGrid,
                    MatChipInput,
                    MatChipRemove,
                    MatChipRow,
                    MatFormField,
                    MatIcon,
                    MatOption,
                    TranslatePipe,
                    NxsSpinnerComponent,
                    NxsTagComponent,
                ], providers: [provideNxsToast()], changeDetection: ChangeDetectionStrategy.OnPush, template: "@if (readOnly()) {\n  <ul\n    class=\"nxs-tag-editor__chips\"\n    [attr.aria-label]=\"'satori-components.tag-editor.tags' | translate\"\n  >\n    @for (tag of saved(); track tag) {\n      <li><nxs-tag color=\"gray\" [label]=\"tag\" /></li>\n    } @empty {\n      <li class=\"nxs-tag-editor__empty\">\n        <span aria-hidden=\"true\">\u2014</span>\n        <span class=\"nxs-tag-editor__sr-only\">{{\n          'satori-components.tag-editor.none' | translate\n        }}</span>\n      </li>\n    }\n  </ul>\n} @else {\n  <mat-form-field class=\"nxs-tag-editor__field\" subscriptSizing=\"dynamic\">\n    <mat-chip-grid #grid [attr.aria-label]=\"'satori-components.tag-editor.tags' | translate\">\n      @for (tag of shown(); track tag) {\n        <mat-chip-row (removed)=\"remove(tag)\">\n          {{ tag }}\n          <button\n            type=\"button\"\n            matChipRemove\n            [attr.aria-label]=\"'satori-components.tag-editor.remove' | translate: { tag }\"\n          >\n            <mat-icon class=\"nxs-tag-editor__remove-icon\" aria-hidden=\"true\"></mat-icon>\n          </button>\n        </mat-chip-row>\n      }\n      @for (tag of adding(); track tag) {\n        <mat-chip-row class=\"nxs-tag-editor__pending\" disabled>\n          {{ tag }}\n          <nxs-spinner\n            diameter=\"14\"\n            [label]=\"'satori-components.tag-editor.adding' | translate: { tag }\"\n          />\n        </mat-chip-row>\n      }\n    </mat-chip-grid>\n    <!-- Outside the grid: the autocomplete makes the box a combobox, which a grid may not contain. -->\n    <input\n      #box\n      class=\"nxs-tag-editor__box\"\n      [id]=\"id + '-box'\"\n      [placeholder]=\"'satori-components.tag-editor.add' | translate\"\n      [attr.aria-label]=\"'satori-components.tag-editor.add' | translate\"\n      [matChipInputFor]=\"grid\"\n      [matAutocomplete]=\"suggestionList\"\n      (input)=\"typed(box.value)\"\n      (matChipInputTokenEnd)=\"entered($event)\"\n    />\n    <mat-autocomplete\n      #suggestionList=\"matAutocomplete\"\n      autoActiveFirstOption\n      (optionSelected)=\"picked($event)\"\n    >\n      @for (option of options(); track option.label) {\n        <mat-option\n          [value]=\"option\"\n          [attr.aria-label]=\"\n            option.isNew\n              ? ('satori-components.tag-editor.new-label' | translate: { tag: option.label })\n              : null\n          \"\n        >\n          @if (option.isNew) {\n            <span class=\"nxs-tag-editor__new\">{{\n              'satori-components.tag-editor.new' | translate: { tag: option.label }\n            }}</span>\n          } @else {\n            {{ option.label }}\n          }\n        </mat-option>\n      }\n    </mat-autocomplete>\n  </mat-form-field>\n}\n", styles: [":host {\n  --nxs-tag-editor-muted: var(--mat-sys-on-surface-variant);\n  --nxs-tag-editor-new: var(--mat-sys-primary);\n  --mat-chip-container-height: 24px;\n  --mat-chip-label-text-size: 13px;\n  --mat-chip-elevated-container-color: var(--mat-sys-surface-container-high);\n  --mat-chip-label-text-color: var(--mat-sys-on-surface);\n  --mat-chip-disabled-label-text-color: var(--nxs-tag-editor-muted);\n  --mat-chip-disabled-container-opacity: 1;\n  display: block;\n  font-size: 13px;\n}\n\n.nxs-tag-editor__field {\n  width: 100%;\n}\n\n// Below the chips rather than among them, so Material's in-grid flex sizing does not apply.\n:host .nxs-tag-editor__box {\n  width: 100%;\n  margin: 4px 0 0;\n  font-size: 13px;\n}\n\n// List margins are scoped to the host: the theme's `.mat-typography` rules outrank a single class.\n:host .nxs-tag-editor__chips {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 6px;\n  margin: 0;\n  padding: 0;\n  list-style: none;\n}\n\n.nxs-tag-editor__empty {\n  color: var(--nxs-tag-editor-muted);\n}\n\n// The glyph comes from its codepoint, not the `cancel` ligature: ligature text inside a button\n// reads to IBM's checker as a visible label the name \"Remove tag \u2026\" does not contain (WCAG 2.5.3).\n.nxs-tag-editor__remove-icon::before {\n  content: '\\e5c9';\n  font:\n    14px/1 'Material Icons',\n    sans-serif;\n}\n\n.nxs-tag-editor__pending nxs-spinner {\n  display: inline-flex;\n  margin-inline-start: 6px;\n  vertical-align: middle;\n}\n\n.nxs-tag-editor__new {\n  font-weight: 500;\n  color: var(--nxs-tag-editor-new);\n}\n\n.nxs-tag-editor__sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  overflow: hidden;\n  clip: rect(0 0 0 0);\n  white-space: nowrap;\n}\n"] }]
    }], () => [], { documentUid: [{ type: i0.Input, args: [{ isSignal: true, alias: "documentUid", required: true }] }], tags: [{ type: i0.Input, args: [{ isSignal: true, alias: "tags", required: false }] }], readOnly: [{ type: i0.Input, args: [{ isSignal: true, alias: "readOnly", required: false }] }], tagsChange: [{ type: i0.Output, args: ["tagsChange"] }], boxRef: [{ type: i0.ViewChild, args: ['box', { isSignal: true }] }], trigger: [{ type: i0.ViewChild, args: [i0.forwardRef(() => MatAutocompleteTrigger), { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsTagEditorComponent, { className: "NxsTagEditorComponent", filePath: "libs/shared/satori-components/src/lib/tag-editor/tag-editor.component.ts", lineNumber: 106 }); })();
