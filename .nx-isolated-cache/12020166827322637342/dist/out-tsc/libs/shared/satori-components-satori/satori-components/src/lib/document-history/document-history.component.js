import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { TranslatePipe } from '@ngx-translate/core';
import { DirectoryService, DocumentDetailService, } from '@nuxeo/satori-platform/nuxeo-client';
import { catchError, debounceTime, distinctUntilChanged, forkJoin, map, of, Subject, switchMap, tap, } from 'rxjs';
import { NxsAvatarComponent } from '../avatar/avatar.component';
import { NxsEmptyStateComponent } from '../empty-state/empty-state.component';
import { NxsErrorStateComponent } from '../error-state/error-state.component';
import { nxsErrorStatus } from '../error-state/error-status';
import { NxsSpinnerComponent } from '../spinner/spinner.component';
import { NxsTagComponent } from '../tag/tag.component';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@angular/material/datepicker";
import * as i3 from "@angular/material/form-field";
import * as i4 from "@angular/material/input";
import * as i5 from "@angular/material/paginator";
import * as i6 from "@angular/material/select";
import * as i7 from "@angular/material/sort";
import * as i8 from "@angular/material/table";
const _c0 = () => [10, 20, 50];
const _forTrack0 = ($index, $item) => $item.id;
function NxsDocumentHistoryComponent_For_35_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 11);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const type_r2 = ctx.$implicit;
    i0.ɵɵproperty("value", type_r2.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(type_r2.label);
} }
function NxsDocumentHistoryComponent_For_45_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 11);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const category_r3 = ctx.$implicit;
    i0.ɵɵproperty("value", category_r3.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(category_r3.label);
} }
function NxsDocumentHistoryComponent_Conditional_47_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "nxs-error-state", 19);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵlistener("retry", function NxsDocumentHistoryComponent_Conditional_47_Template_nxs_error_state_retry_0_listener() { i0.ɵɵrestoreView(_r4); const ctx_r4 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r4.retry()); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const status_r6 = ctx;
    const ctx_r4 = i0.ɵɵnextContext();
    i0.ɵɵproperty("status", status_r6)("heading", i0.ɵɵpipeBind1(1, 4, "satori-components.document-history.failed"))("headingLevel", ctx_r4.headingLevel())("retryable", status_r6 === 500);
} }
function NxsDocumentHistoryComponent_Conditional_48_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 15);
    i0.ɵɵelement(1, "nxs-spinner", 20);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", i0.ɵɵpipeBind1(2, 1, "satori-components.document-history.loading"));
} }
function NxsDocumentHistoryComponent_Conditional_49_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "nxs-empty-state", 16);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    const ctx_r4 = i0.ɵɵnextContext();
    i0.ɵɵproperty("heading", i0.ɵɵpipeBind1(1, 2, ctx_r4.filtered() ? "satori-components.document-history.no-match" : "satori-components.document-history.empty"))("headingLevel", ctx_r4.headingLevel());
} }
function NxsDocumentHistoryComponent_Conditional_50_th_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 35);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "satori-components.document-history.action"), " ");
} }
function NxsDocumentHistoryComponent_Conditional_50_td_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 36);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const entry_r8 = ctx.$implicit;
    const ctx_r4 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r4.eventLabel(entry_r8.eventId));
} }
function NxsDocumentHistoryComponent_Conditional_50_th_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 35);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "satori-components.document-history.date"), " ");
} }
function NxsDocumentHistoryComponent_Conditional_50_td_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 36);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "date");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const entry_r9 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(2, 1, entry_r9.eventDate, "medium"));
} }
function NxsDocumentHistoryComponent_Conditional_50_th_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 35);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "satori-components.document-history.user"), " ");
} }
function NxsDocumentHistoryComponent_Conditional_50_td_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 36)(1, "span", 37);
    i0.ɵɵelement(2, "nxs-avatar", 38);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const entry_r10 = ctx.$implicit;
    const ctx_r4 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("initials", ctx_r4.initials(entry_r10.principalName));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", entry_r10.principalName, " ");
} }
function NxsDocumentHistoryComponent_Conditional_50_th_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 35);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "satori-components.document-history.category"), " ");
} }
function NxsDocumentHistoryComponent_Conditional_50_td_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 36);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const entry_r11 = ctx.$implicit;
    const ctx_r4 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r4.categoryLabel(entry_r11.category));
} }
function NxsDocumentHistoryComponent_Conditional_50_th_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 39);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "satori-components.document-history.comment"), " ");
} }
function NxsDocumentHistoryComponent_Conditional_50_td_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 40);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const entry_r12 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", entry_r12.comment, " ");
} }
function NxsDocumentHistoryComponent_Conditional_50_th_22_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 39);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "satori-components.document-history.state"), " ");
} }
function NxsDocumentHistoryComponent_Conditional_50_td_23_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "nxs-tag", 41);
} if (rf & 2) {
    const entry_r13 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("label", entry_r13.docLifeCycle);
} }
function NxsDocumentHistoryComponent_Conditional_50_td_23_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 36);
    i0.ɵɵconditionalCreate(1, NxsDocumentHistoryComponent_Conditional_50_td_23_Conditional_1_Template, 1, 1, "nxs-tag", 41);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const entry_r13 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵconditional(entry_r13.docLifeCycle ? 1 : -1);
} }
function NxsDocumentHistoryComponent_Conditional_50_tr_24_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 42);
} }
function NxsDocumentHistoryComponent_Conditional_50_tr_25_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 43);
} }
function NxsDocumentHistoryComponent_Conditional_50_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 17);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵelementStart(2, "table", 21);
    i0.ɵɵlistener("matSortChange", function NxsDocumentHistoryComponent_Conditional_50_Template_table_matSortChange_2_listener($event) { i0.ɵɵrestoreView(_r7); const ctx_r4 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r4.sorted($event)); });
    i0.ɵɵelementStart(3, "caption", 22);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementContainerStart(6, 23);
    i0.ɵɵtemplate(7, NxsDocumentHistoryComponent_Conditional_50_th_7_Template, 3, 3, "th", 24)(8, NxsDocumentHistoryComponent_Conditional_50_td_8_Template, 2, 1, "td", 25);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(9, 26);
    i0.ɵɵtemplate(10, NxsDocumentHistoryComponent_Conditional_50_th_10_Template, 3, 3, "th", 24)(11, NxsDocumentHistoryComponent_Conditional_50_td_11_Template, 3, 4, "td", 25);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(12, 27);
    i0.ɵɵtemplate(13, NxsDocumentHistoryComponent_Conditional_50_th_13_Template, 3, 3, "th", 24)(14, NxsDocumentHistoryComponent_Conditional_50_td_14_Template, 4, 2, "td", 25);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(15, 28);
    i0.ɵɵtemplate(16, NxsDocumentHistoryComponent_Conditional_50_th_16_Template, 3, 3, "th", 24)(17, NxsDocumentHistoryComponent_Conditional_50_td_17_Template, 2, 1, "td", 25);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(18, 29);
    i0.ɵɵtemplate(19, NxsDocumentHistoryComponent_Conditional_50_th_19_Template, 3, 3, "th", 30)(20, NxsDocumentHistoryComponent_Conditional_50_td_20_Template, 2, 1, "td", 31);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(21, 32);
    i0.ɵɵtemplate(22, NxsDocumentHistoryComponent_Conditional_50_th_22_Template, 3, 3, "th", 30)(23, NxsDocumentHistoryComponent_Conditional_50_td_23_Template, 2, 1, "td", 25);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵtemplate(24, NxsDocumentHistoryComponent_Conditional_50_tr_24_Template, 1, 0, "tr", 33)(25, NxsDocumentHistoryComponent_Conditional_50_tr_25_Template, 1, 0, "tr", 34);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r4 = i0.ɵɵnextContext();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 7, "satori-components.document-history.caption"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("dataSource", ctx_r4.entries())("matSortActive", ctx_r4.sort().by)("matSortDirection", ctx_r4.sort().order);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 9, "satori-components.document-history.caption"), " ");
    i0.ɵɵadvance(20);
    i0.ɵɵproperty("matHeaderRowDef", ctx_r4.columns);
    i0.ɵɵadvance();
    i0.ɵɵproperty("matRowDefColumns", ctx_r4.columns);
} }
function NxsDocumentHistoryComponent_Conditional_51_Template(rf, ctx) { if (rf & 1) {
    const _r14 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-paginator", 44);
    i0.ɵɵlistener("page", function NxsDocumentHistoryComponent_Conditional_51_Template_mat_paginator_page_0_listener($event) { i0.ɵɵrestoreView(_r14); const ctx_r4 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r4.paged($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r4 = i0.ɵɵnextContext();
    i0.ɵɵproperty("length", ctx_r4.total())("pageSize", ctx_r4.size())("pageIndex", ctx_r4.pageIndex())("pageSizeOptions", i0.ɵɵpureFunction0(4, _c0));
} }
const SORTABLE = [
    'eventId',
    'eventDate',
    'principalName',
    'category',
];
const NO_FILTERS = { user: '', from: null, to: null, eventId: '', category: '' };
/** Start of the day after `day`, local time: the adapter's end is exclusive, the user's "To" is not. */
function dayAfter(day) {
    return new Date(day.getFullYear(), day.getMonth(), day.getDate() + 1);
}
function startOf(day) {
    return new Date(day.getFullYear(), day.getMonth(), day.getDate());
}
/** "documentModified" → "Document Modified", for an event the directory does not name. */
function humanise(id) {
    return id.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
}
/** "eventDocumentCategory" → "Document". */
function humaniseCategory(id) {
    return humanise(id)
        .replace(/^Event /, '')
        .replace(/ Category$/, '');
}
/**
 * A vocabulary's label, or the id made readable when the vocabulary only repeats it — the stock
 * `eventTypes` entries are labelled with their own ids, which Web UI translates as `eventType.*`.
 */
function readable(entry, fallback) {
    const label = entry.displayLabel?.trim();
    return label && label !== entry.id ? label : fallback(entry.id);
}
/**
 * A document's history — Web UI's `nuxeo-document-history`, which is its audit search for one
 * document.
 *
 * As in Web UI, every filter and the sort go to the server (`@audit`), so they reach every entry
 * rather than the page on screen: the user who acted (an exact username), a From and To day, the
 * performed action and the event category. The table shows the action, when, who, the category,
 * the comment and the lifecycle state, newest first, a page at a time. Action and category read
 * through the `eventTypes` and `eventCategories` vocabularies.
 *
 * It needs a Material `DateAdapter`, as any datepicker does; the host provides it.
 */
export class NxsDocumentHistoryComponent {
    documents = inject(DocumentDetailService);
    directories = inject(DirectoryService);
    /** The document whose history this is. */
    documentUid = input.required(...(ngDevMode ? [{ debugName: "documentUid" }] : []));
    /** Entries per page; the user can change it. */
    pageSize = input(20, ...(ngDevMode ? [{ debugName: "pageSize" }] : []));
    /** The heading level of the empty and error states, one below the section's own. */
    headingLevel = input(3, ...(ngDevMode ? [{ debugName: "headingLevel" }] : []));
    columns = [
        'eventId',
        'eventDate',
        'principalName',
        'category',
        'comment',
        'docLifeCycle',
    ];
    filters = signal(NO_FILTERS, ...(ngDevMode ? [{ debugName: "filters" }] : []));
    /** What is in the Username box; it filters once the user pauses, not per keystroke. */
    userText = signal('', ...(ngDevMode ? [{ debugName: "userText" }] : []));
    typed = new Subject();
    sort = signal({
        by: 'eventDate',
        order: 'desc',
    }, ...(ngDevMode ? [{ debugName: "sort" }] : []));
    pageIndex = signal(0, ...(ngDevMode ? [{ debugName: "pageIndex" }] : []));
    chosenPageSize = signal(null, ...(ngDevMode ? [{ debugName: "chosenPageSize" }] : []));
    size = computed(() => this.chosenPageSize() ?? this.pageSize(), ...(ngDevMode ? [{ debugName: "size" }] : []));
    retries = signal(0, ...(ngDevMode ? [{ debugName: "retries" }] : []));
    entries = signal([], ...(ngDevMode ? [{ debugName: "entries" }] : []));
    total = signal(0, ...(ngDevMode ? [{ debugName: "total" }] : []));
    loading = signal(true, ...(ngDevMode ? [{ debugName: "loading" }] : []));
    failure = signal(null, ...(ngDevMode ? [{ debugName: "failure" }] : []));
    filtered = computed(() => {
        const f = this.filters();
        return !!(f.user.trim() || f.from || f.to || f.eventId || f.category);
    }, ...(ngDevMode ? [{ debugName: "filtered" }] : []));
    eventTypes = signal([], ...(ngDevMode ? [{ debugName: "eventTypes" }] : []));
    categories = signal([], ...(ngDevMode ? [{ debugName: "categories" }] : []));
    eventOptions = computed(() => this.eventTypes().map((e) => ({ id: e.id, label: readable(e, humanise) })), ...(ngDevMode ? [{ debugName: "eventOptions" }] : []));
    categoryOptions = computed(() => this.categories().map((e) => ({ id: e.id, label: readable(e, humaniseCategory) })), ...(ngDevMode ? [{ debugName: "categoryOptions" }] : []));
    eventLabels = computed(() => new Map(this.eventOptions().map((o) => [o.id, o.label])), ...(ngDevMode ? [{ debugName: "eventLabels" }] : []));
    categoryLabels = computed(() => new Map(this.categoryOptions().map((o) => [o.id, o.label])), ...(ngDevMode ? [{ debugName: "categoryLabels" }] : []));
    constructor() {
        forkJoin({
            types: this.directories.getEventTypes().pipe(catchError(() => of([]))),
            categories: this.directories.getEventCategories().pipe(catchError(() => of([]))),
        })
            .pipe(takeUntilDestroyed())
            .subscribe(({ types, categories }) => {
            this.eventTypes.set(types);
            this.categories.set(categories);
        });
        const request = computed(() => ({
            uid: this.documentUid(),
            filters: this.filters(),
            sort: this.sort(),
            pageIndex: this.pageIndex(),
            size: this.size(),
            retry: this.retries(),
        }), ...(ngDevMode ? [{ debugName: "request" }] : []));
        this.typed
            .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
            .subscribe((user) => this.setFilter('user', user));
        // A document change resets the filters and the page before anything is asked.
        toObservable(this.documentUid)
            .pipe(distinctUntilChanged(), takeUntilDestroyed())
            .subscribe(() => this.clearFilters());
        toObservable(request)
            .pipe(tap(() => {
            this.loading.set(true);
            this.failure.set(null);
        }), switchMap((r) => this.documents
            .getAuditLog(r.uid, r.size, r.pageIndex, this.queryOf(r.filters, r.sort))
            .pipe(map((list) => ({
            entries: list.entries ?? [],
            total: list.resultsCount ?? list.totalSize ?? list.entries?.length ?? 0,
        })), catchError((err) => of({ failure: nxsErrorStatus(err) })))), takeUntilDestroyed())
            .subscribe((page) => {
            this.loading.set(false);
            if ('failure' in page) {
                this.failure.set(page.failure);
                this.entries.set([]);
                this.total.set(0);
                return;
            }
            this.entries.set(page.entries);
            this.total.set(page.total);
        });
    }
    setFilter(key, value) {
        this.filters.update((f) => ({ ...f, [key]: value }));
        this.pageIndex.set(0);
    }
    typeUser(text) {
        this.userText.set(text);
        this.typed.next(text);
    }
    clearFilters() {
        this.userText.set('');
        this.filters.set(NO_FILTERS);
        this.pageIndex.set(0);
    }
    sorted(event) {
        const by = SORTABLE.find((field) => field === event.active);
        this.sort.set(by && event.direction ? { by, order: event.direction } : { by: 'eventDate', order: 'desc' });
        this.pageIndex.set(0);
    }
    paged(event) {
        this.chosenPageSize.set(event.pageSize);
        this.pageIndex.set(event.pageIndex);
    }
    retry() {
        this.retries.update((n) => n + 1);
    }
    eventLabel(id) {
        return this.eventLabels().get(id) ?? humanise(id);
    }
    categoryLabel(id) {
        return this.categoryLabels().get(id) ?? humaniseCategory(id);
    }
    initials(user) {
        return user.charAt(0).toUpperCase();
    }
    queryOf(f, sort) {
        return {
            principalName: f.user.trim() || undefined,
            eventIds: f.eventId ? [f.eventId] : undefined,
            eventCategory: f.category || undefined,
            startDate: f.from ? startOf(f.from) : undefined,
            endDate: f.to ? dayAfter(f.to) : undefined,
            sortBy: sort.by,
            sortOrder: sort.order,
        };
    }
    static ɵfac = function NxsDocumentHistoryComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsDocumentHistoryComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsDocumentHistoryComponent, selectors: [["nxs-document-history"]], hostAttrs: [1, "nxs-document-history"], inputs: { documentUid: [1, "documentUid"], pageSize: [1, "pageSize"], headingLevel: [1, "headingLevel"] }, decls: 52, vars: 39, consts: [["fromPicker", ""], ["toPicker", ""], ["role", "search", 1, "nxs-document-history__filters", 3, "submit"], ["appearance", "outline", "subscriptSizing", "dynamic", 1, "nxs-document-history__user"], ["matInput", "", "name", "user", "autocomplete", "off", 3, "ngModelChange", "ngModel"], ["appearance", "outline", "subscriptSizing", "dynamic"], ["matInput", "", "name", "from", 3, "ngModelChange", "matDatepicker", "ngModel"], ["matIconSuffix", "", 3, "for"], ["matInput", "", "name", "to", 3, "ngModelChange", "matDatepicker", "ngModel"], ["name", "eventId", 3, "ngModelChange", "ngModel"], ["value", ""], [3, "value"], ["name", "category", 3, "ngModelChange", "ngModel"], [1, "nxs-document-history__results"], [3, "status", "heading", "headingLevel", "retryable"], [1, "nxs-document-history__loading"], ["icon", "event_busy", 3, "heading", "headingLevel"], ["role", "region", "tabindex", "0", 1, "nxs-document-history__table"], ["showFirstLastButtons", "", 3, "length", "pageSize", "pageIndex", "pageSizeOptions"], [3, "retry", "status", "heading", "headingLevel", "retryable"], ["diameter", "32", 3, "label"], ["mat-table", "", "matSort", "", "matSortDisableClear", "", 3, "matSortChange", "dataSource", "matSortActive", "matSortDirection"], [1, "cdk-visually-hidden"], ["matColumnDef", "eventId"], ["mat-header-cell", "", "mat-sort-header", "", 4, "matHeaderCellDef"], ["mat-cell", "", 4, "matCellDef"], ["matColumnDef", "eventDate"], ["matColumnDef", "principalName"], ["matColumnDef", "category"], ["matColumnDef", "comment"], ["mat-header-cell", "", 4, "matHeaderCellDef"], ["mat-cell", "", "class", "nxs-document-history__comment", 4, "matCellDef"], ["matColumnDef", "docLifeCycle"], ["mat-header-row", "", 4, "matHeaderRowDef"], ["mat-row", "", 4, "matRowDef", "matRowDefColumns"], ["mat-header-cell", "", "mat-sort-header", ""], ["mat-cell", ""], [1, "nxs-document-history__user-cell"], ["size", "24", "aria-hidden", "true", 3, "initials"], ["mat-header-cell", ""], ["mat-cell", "", 1, "nxs-document-history__comment"], [3, "label"], ["mat-header-row", ""], ["mat-row", ""], ["showFirstLastButtons", "", 3, "page", "length", "pageSize", "pageIndex", "pageSizeOptions"]], template: function NxsDocumentHistoryComponent_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "form", 2);
            i0.ɵɵpipe(1, "translate");
            i0.ɵɵlistener("submit", function NxsDocumentHistoryComponent_Template_form_submit_0_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView($event.preventDefault()); });
            i0.ɵɵelementStart(2, "mat-form-field", 3)(3, "mat-label");
            i0.ɵɵtext(4);
            i0.ɵɵpipe(5, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "input", 4);
            i0.ɵɵlistener("ngModelChange", function NxsDocumentHistoryComponent_Template_input_ngModelChange_6_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.typeUser($event)); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(7, "mat-hint");
            i0.ɵɵtext(8);
            i0.ɵɵpipe(9, "translate");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(10, "mat-form-field", 5)(11, "mat-label");
            i0.ɵɵtext(12);
            i0.ɵɵpipe(13, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(14, "input", 6);
            i0.ɵɵlistener("ngModelChange", function NxsDocumentHistoryComponent_Template_input_ngModelChange_14_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.setFilter("from", $event)); });
            i0.ɵɵelementEnd();
            i0.ɵɵelement(15, "mat-datepicker-toggle", 7)(16, "mat-datepicker", null, 0);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(18, "mat-form-field", 5)(19, "mat-label");
            i0.ɵɵtext(20);
            i0.ɵɵpipe(21, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(22, "input", 8);
            i0.ɵɵlistener("ngModelChange", function NxsDocumentHistoryComponent_Template_input_ngModelChange_22_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.setFilter("to", $event)); });
            i0.ɵɵelementEnd();
            i0.ɵɵelement(23, "mat-datepicker-toggle", 7)(24, "mat-datepicker", null, 1);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(26, "mat-form-field", 5)(27, "mat-label");
            i0.ɵɵtext(28);
            i0.ɵɵpipe(29, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(30, "mat-select", 9);
            i0.ɵɵlistener("ngModelChange", function NxsDocumentHistoryComponent_Template_mat_select_ngModelChange_30_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.setFilter("eventId", $event)); });
            i0.ɵɵelementStart(31, "mat-option", 10);
            i0.ɵɵtext(32);
            i0.ɵɵpipe(33, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵrepeaterCreate(34, NxsDocumentHistoryComponent_For_35_Template, 2, 2, "mat-option", 11, _forTrack0);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(36, "mat-form-field", 5)(37, "mat-label");
            i0.ɵɵtext(38);
            i0.ɵɵpipe(39, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(40, "mat-select", 12);
            i0.ɵɵlistener("ngModelChange", function NxsDocumentHistoryComponent_Template_mat_select_ngModelChange_40_listener($event) { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.setFilter("category", $event)); });
            i0.ɵɵelementStart(41, "mat-option", 10);
            i0.ɵɵtext(42);
            i0.ɵɵpipe(43, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵrepeaterCreate(44, NxsDocumentHistoryComponent_For_45_Template, 2, 2, "mat-option", 11, _forTrack0);
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(46, "div", 13);
            i0.ɵɵconditionalCreate(47, NxsDocumentHistoryComponent_Conditional_47_Template, 2, 6, "nxs-error-state", 14)(48, NxsDocumentHistoryComponent_Conditional_48_Template, 3, 3, "div", 15)(49, NxsDocumentHistoryComponent_Conditional_49_Template, 2, 4, "nxs-empty-state", 16)(50, NxsDocumentHistoryComponent_Conditional_50_Template, 26, 11, "div", 17);
            i0.ɵɵconditionalCreate(51, NxsDocumentHistoryComponent_Conditional_51_Template, 1, 5, "mat-paginator", 18);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            let tmp_23_0;
            const fromPicker_r15 = i0.ɵɵreference(17);
            const toPicker_r16 = i0.ɵɵreference(25);
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 21, "satori-components.document-history.filters"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 23, "satori-components.document-history.user"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngModel", ctx.userText());
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 25, "satori-components.document-history.user-hint"));
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(13, 27, "satori-components.document-history.from"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("matDatepicker", fromPicker_r15)("ngModel", ctx.filters().from);
            i0.ɵɵadvance();
            i0.ɵɵproperty("for", fromPicker_r15);
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(21, 29, "satori-components.document-history.to"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("matDatepicker", toPicker_r16)("ngModel", ctx.filters().to);
            i0.ɵɵadvance();
            i0.ɵɵproperty("for", toPicker_r16);
            i0.ɵɵadvance(5);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(29, 31, "satori-components.document-history.action"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngModel", ctx.filters().eventId);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(33, 33, "satori-components.document-history.any"));
            i0.ɵɵadvance(2);
            i0.ɵɵrepeater(ctx.eventOptions());
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(39, 35, "satori-components.document-history.category"));
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngModel", ctx.filters().category);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(43, 37, "satori-components.document-history.any"));
            i0.ɵɵadvance(2);
            i0.ɵɵrepeater(ctx.categoryOptions());
            i0.ɵɵadvance(2);
            i0.ɵɵattribute("aria-busy", ctx.loading());
            i0.ɵɵadvance();
            i0.ɵɵconditional((tmp_23_0 = ctx.failure()) ? 47 : ctx.loading() && ctx.entries().length === 0 ? 48 : ctx.entries().length === 0 ? 49 : 50, tmp_23_0);
            i0.ɵɵadvance(4);
            i0.ɵɵconditional(ctx.total() > 0 ? 51 : -1);
        } }, dependencies: [FormsModule, i1.ɵNgNoValidate, i1.DefaultValueAccessor, i1.NgControlStatus, i1.NgControlStatusGroup, i1.NgModel, i1.NgForm, MatDatepickerModule, i2.MatDatepicker, i2.MatDatepickerInput, i2.MatDatepickerToggle, MatFormFieldModule, i3.MatFormField, i3.MatLabel, i3.MatHint, i3.MatSuffix, MatInputModule, i4.MatInput, MatPaginatorModule, i5.MatPaginator, MatSelectModule, i6.MatSelect, i6.MatOption, MatSortModule, i7.MatSort, i7.MatSortHeader, MatTableModule, i8.MatTable, i8.MatHeaderCellDef, i8.MatHeaderRowDef, i8.MatColumnDef, i8.MatCellDef, i8.MatRowDef, i8.MatHeaderCell, i8.MatCell, i8.MatHeaderRow, i8.MatRow, NxsAvatarComponent,
            NxsEmptyStateComponent,
            NxsErrorStateComponent,
            NxsSpinnerComponent,
            NxsTagComponent,
            DatePipe,
            TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: block;\n}\n\n.nxs-document-history__filters[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 12px 16px;\n  margin-block-end: 16px;\n\n  mat-form-field {\n    flex: 1 1 12rem;\n    min-width: 0;\n  }\n}\n\n.nxs-document-history__user[_ngcontent-%COMP%] {\n  flex-basis: 16rem;\n}\n\n.nxs-document-history__loading[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  padding: 32px 0;\n}\n\n//[_ngcontent-%COMP%]   The[_ngcontent-%COMP%]   table[_ngcontent-%COMP%]   scrolls[_ngcontent-%COMP%]   sideways[_ngcontent-%COMP%]   inside[_ngcontent-%COMP%]   its[_ngcontent-%COMP%]   own[_ngcontent-%COMP%]   box[_ngcontent-%COMP%]   at[_ngcontent-%COMP%]   320[_ngcontent-%COMP%]   CSS[_ngcontent-%COMP%]   pixels[_ngcontent-%COMP%]   rather[_ngcontent-%COMP%]   than[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   page[_ngcontent-%COMP%]   (1.4.10).\n.nxs-document-history__table[_ngcontent-%COMP%] {\n  overflow-x: auto;\n\n  table {\n    width: 100%;\n  }\n}\n\n.nxs-document-history__user-cell[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.nxs-document-history__comment[_ngcontent-%COMP%] {\n  overflow-wrap: anywhere;\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsDocumentHistoryComponent, [{
        type: Component,
        args: [{ selector: 'nxs-document-history', standalone: true, imports: [
                    DatePipe,
                    FormsModule,
                    MatDatepickerModule,
                    MatFormFieldModule,
                    MatInputModule,
                    MatPaginatorModule,
                    MatSelectModule,
                    MatSortModule,
                    MatTableModule,
                    TranslatePipe,
                    NxsAvatarComponent,
                    NxsEmptyStateComponent,
                    NxsErrorStateComponent,
                    NxsSpinnerComponent,
                    NxsTagComponent,
                ], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-document-history' }, template: "<form\n  class=\"nxs-document-history__filters\"\n  role=\"search\"\n  [attr.aria-label]=\"'satori-components.document-history.filters' | translate\"\n  (submit)=\"$event.preventDefault()\"\n>\n  <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\" class=\"nxs-document-history__user\">\n    <mat-label>{{ 'satori-components.document-history.user' | translate }}</mat-label>\n    <input\n      matInput\n      name=\"user\"\n      autocomplete=\"off\"\n      [ngModel]=\"userText()\"\n      (ngModelChange)=\"typeUser($event)\"\n    />\n    <mat-hint>{{ 'satori-components.document-history.user-hint' | translate }}</mat-hint>\n  </mat-form-field>\n\n  <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\">\n    <mat-label>{{ 'satori-components.document-history.from' | translate }}</mat-label>\n    <input\n      matInput\n      name=\"from\"\n      [matDatepicker]=\"fromPicker\"\n      [ngModel]=\"filters().from\"\n      (ngModelChange)=\"setFilter('from', $event)\"\n    />\n    <mat-datepicker-toggle matIconSuffix [for]=\"fromPicker\" />\n    <mat-datepicker #fromPicker />\n  </mat-form-field>\n\n  <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\">\n    <mat-label>{{ 'satori-components.document-history.to' | translate }}</mat-label>\n    <input\n      matInput\n      name=\"to\"\n      [matDatepicker]=\"toPicker\"\n      [ngModel]=\"filters().to\"\n      (ngModelChange)=\"setFilter('to', $event)\"\n    />\n    <mat-datepicker-toggle matIconSuffix [for]=\"toPicker\" />\n    <mat-datepicker #toPicker />\n  </mat-form-field>\n\n  <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\">\n    <mat-label>{{ 'satori-components.document-history.action' | translate }}</mat-label>\n    <mat-select\n      name=\"eventId\"\n      [ngModel]=\"filters().eventId\"\n      (ngModelChange)=\"setFilter('eventId', $event)\"\n    >\n      <mat-option value=\"\">{{ 'satori-components.document-history.any' | translate }}</mat-option>\n      @for (type of eventOptions(); track type.id) {\n        <mat-option [value]=\"type.id\">{{ type.label }}</mat-option>\n      }\n    </mat-select>\n  </mat-form-field>\n\n  <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\">\n    <mat-label>{{ 'satori-components.document-history.category' | translate }}</mat-label>\n    <mat-select\n      name=\"category\"\n      [ngModel]=\"filters().category\"\n      (ngModelChange)=\"setFilter('category', $event)\"\n    >\n      <mat-option value=\"\">{{ 'satori-components.document-history.any' | translate }}</mat-option>\n      @for (category of categoryOptions(); track category.id) {\n        <mat-option [value]=\"category.id\">{{ category.label }}</mat-option>\n      }\n    </mat-select>\n  </mat-form-field>\n</form>\n\n<div class=\"nxs-document-history__results\" [attr.aria-busy]=\"loading()\">\n  @if (failure(); as status) {\n    <nxs-error-state\n      [status]=\"status\"\n      [heading]=\"'satori-components.document-history.failed' | translate\"\n      [headingLevel]=\"headingLevel()\"\n      [retryable]=\"status === 500\"\n      (retry)=\"retry()\"\n    />\n  } @else if (loading() && entries().length === 0) {\n    <div class=\"nxs-document-history__loading\">\n      <nxs-spinner\n        diameter=\"32\"\n        [label]=\"'satori-components.document-history.loading' | translate\"\n      />\n    </div>\n  } @else if (entries().length === 0) {\n    <nxs-empty-state\n      icon=\"event_busy\"\n      [heading]=\"\n        (filtered()\n          ? 'satori-components.document-history.no-match'\n          : 'satori-components.document-history.empty'\n        ) | translate\n      \"\n      [headingLevel]=\"headingLevel()\"\n    />\n  } @else {\n    <div\n      class=\"nxs-document-history__table\"\n      role=\"region\"\n      tabindex=\"0\"\n      [attr.aria-label]=\"'satori-components.document-history.caption' | translate\"\n    >\n      <table\n        mat-table\n        matSort\n        [dataSource]=\"entries()\"\n        [matSortActive]=\"sort().by\"\n        [matSortDirection]=\"sort().order\"\n        matSortDisableClear\n        (matSortChange)=\"sorted($event)\"\n      >\n        <caption class=\"cdk-visually-hidden\">\n          {{\n            'satori-components.document-history.caption' | translate\n          }}\n        </caption>\n\n        <ng-container matColumnDef=\"eventId\">\n          <th mat-header-cell *matHeaderCellDef mat-sort-header>\n            {{ 'satori-components.document-history.action' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let entry\">{{ eventLabel(entry.eventId) }}</td>\n        </ng-container>\n\n        <ng-container matColumnDef=\"eventDate\">\n          <th mat-header-cell *matHeaderCellDef mat-sort-header>\n            {{ 'satori-components.document-history.date' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let entry\">{{ entry.eventDate | date: 'medium' }}</td>\n        </ng-container>\n\n        <ng-container matColumnDef=\"principalName\">\n          <th mat-header-cell *matHeaderCellDef mat-sort-header>\n            {{ 'satori-components.document-history.user' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let entry\">\n            <span class=\"nxs-document-history__user-cell\">\n              <nxs-avatar [initials]=\"initials(entry.principalName)\" size=\"24\" aria-hidden=\"true\" />\n              {{ entry.principalName }}\n            </span>\n          </td>\n        </ng-container>\n\n        <ng-container matColumnDef=\"category\">\n          <th mat-header-cell *matHeaderCellDef mat-sort-header>\n            {{ 'satori-components.document-history.category' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let entry\">{{ categoryLabel(entry.category) }}</td>\n        </ng-container>\n\n        <ng-container matColumnDef=\"comment\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.document-history.comment' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let entry\" class=\"nxs-document-history__comment\">\n            {{ entry.comment }}\n          </td>\n        </ng-container>\n\n        <ng-container matColumnDef=\"docLifeCycle\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.document-history.state' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let entry\">\n            @if (entry.docLifeCycle) {\n              <nxs-tag [label]=\"entry.docLifeCycle\" />\n            }\n          </td>\n        </ng-container>\n\n        <tr mat-header-row *matHeaderRowDef=\"columns\"></tr>\n        <tr mat-row *matRowDef=\"let row; columns: columns\"></tr>\n      </table>\n    </div>\n  }\n\n  @if (total() > 0) {\n    <mat-paginator\n      [length]=\"total()\"\n      [pageSize]=\"size()\"\n      [pageIndex]=\"pageIndex()\"\n      [pageSizeOptions]=\"[10, 20, 50]\"\n      showFirstLastButtons\n      (page)=\"paged($event)\"\n    />\n  }\n</div>\n", styles: [":host {\n  display: block;\n}\n\n.nxs-document-history__filters {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 12px 16px;\n  margin-block-end: 16px;\n\n  mat-form-field {\n    flex: 1 1 12rem;\n    min-width: 0;\n  }\n}\n\n.nxs-document-history__user {\n  flex-basis: 16rem;\n}\n\n.nxs-document-history__loading {\n  display: flex;\n  justify-content: center;\n  padding: 32px 0;\n}\n\n// The table scrolls sideways inside its own box at 320 CSS pixels rather than the page (1.4.10).\n.nxs-document-history__table {\n  overflow-x: auto;\n\n  table {\n    width: 100%;\n  }\n}\n\n.nxs-document-history__user-cell {\n  display: inline-flex;\n  align-items: center;\n  gap: 8px;\n}\n\n.nxs-document-history__comment {\n  overflow-wrap: anywhere;\n}\n"] }]
    }], () => [], { documentUid: [{ type: i0.Input, args: [{ isSignal: true, alias: "documentUid", required: true }] }], pageSize: [{ type: i0.Input, args: [{ isSignal: true, alias: "pageSize", required: false }] }], headingLevel: [{ type: i0.Input, args: [{ isSignal: true, alias: "headingLevel", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsDocumentHistoryComponent, { className: "NxsDocumentHistoryComponent", filePath: "libs/shared/satori-components/src/lib/document-history/document-history.component.ts", lineNumber: 130 }); })();
//# sourceMappingURL=document-history.component.js.map