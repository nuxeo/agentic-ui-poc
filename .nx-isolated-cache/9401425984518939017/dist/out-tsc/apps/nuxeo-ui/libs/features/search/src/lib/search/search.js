import { Component, computed, effect, inject, signal, untracked, DestroyRef } from '@angular/core';
import { DescriptorLabelPipe, descriptorLabel } from '@nuxeo/satori-platform/extensions';
import { toSignal, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, catchError, of, map, Subject, debounceTime, distinctUntilChanged, } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ConfirmDialogComponent, ShareSavedSearchDialogComponent, } from '@nuxeo/satori-platform/ui';
import { SelectionService, DocumentDetailService, FOLDERISH_TYPES, NuxeoApiBase, NON_CONTENT_DOCUMENT_TYPES, DocTypeLabelPipe, } from '@nuxeo/satori-platform/nuxeo-client';
import { AiGatewayService, AiFeatureFlagService, aiErrorMessage, } from '@agentic-ui/shared/ai-client';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NxsColumnPickerComponent, NxsErrorStateComponent, NxsFavoriteToggleComponent, NxsPagerComponent, NxsSavedSearchActionsComponent, NxsSpinnerComponent, NxsThumbnailComponent, nxsErrorStatus, provideNxsThumbnailCache, NxsToastService, provideNxsToast, } from '@nuxeo/satori-platform/components';
import { askSavedSearchName } from '../search-session/saved-search-dialogs';
import { SEARCH_PAGE_SIZE, SearchSession, } from '../search-session/search-session';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/button";
import * as i2 from "@angular/material/icon";
import * as i3 from "@angular/material/tooltip";
import * as i4 from "@angular/material/checkbox";
import * as i5 from "@angular/material/progress-spinner";
import * as i6 from "@angular/material/select";
import * as i7 from "@angular/material/autocomplete";
import * as i8 from "@angular/forms";
const _c0 = a0 => ({ count: a0 });
const _c1 = a0 => ({ name: a0 });
const _forTrack0 = ($index, $item) => $item.value;
const _forTrack1 = ($index, $item) => $item.id;
const _forTrack2 = ($index, $item) => $item.key;
function SearchComponent_Conditional_1_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 22);
    i0.ɵɵlistener("click", function SearchComponent_Conditional_1_Conditional_8_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.showNxqlPanel.set(!ctx_r1.showNxqlPanel())); });
    i0.ɵɵelementStart(1, "mat-icon");
    i0.ɵɵtext(2, "code");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.showNxqlPanel() ? i0.ɵɵpipeBind1(4, 1, "search.hide-query") : i0.ɵɵpipeBind1(5, 3, "search.view-query"), " ");
} }
function SearchComponent_Conditional_1_Conditional_9_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "mat-spinner", 26);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 1, "search.search.loading"));
} }
function SearchComponent_Conditional_1_Conditional_9_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 32);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵlistener("click", function SearchComponent_Conditional_1_Conditional_9_Conditional_6_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.executeAiSearch()); });
    i0.ɵɵelementStart(2, "mat-icon");
    i0.ɵɵtext(3, "send");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("disabled", !ctx_r1.aiQuery().trim());
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 2, "search.search.run-ai-search"));
} }
function SearchComponent_Conditional_1_Conditional_9_For_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 29)(1, "mat-icon", 33);
    i0.ɵɵtext(2, "auto_awesome");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const suggestion_r6 = ctx.$implicit;
    i0.ɵɵproperty("value", suggestion_r6);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", suggestion_r6, " ");
} }
function SearchComponent_Conditional_1_Conditional_9_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 30)(1, "mat-icon");
    i0.ɵɵtext(2, "error_outline");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.aiError(), " ");
} }
function SearchComponent_Conditional_1_Conditional_9_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 31)(1, "div", 34)(2, "mat-icon");
    i0.ɵɵtext(3, "info_outline");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "pre", 35);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(ctx_r1.aiExplanation());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.aiGeneratedNxql());
} }
function SearchComponent_Conditional_1_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 23)(1, "mat-icon", 24);
    i0.ɵɵtext(2, "auto_awesome");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "input", 25);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵlistener("ngModelChange", function SearchComponent_Conditional_1_Conditional_9_Template_input_ngModelChange_3_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onAiQueryInput($event)); })("keydown.enter", function SearchComponent_Conditional_1_Conditional_9_Template_input_keydown_enter_3_listener() { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.executeAiSearch()); });
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(5, SearchComponent_Conditional_1_Conditional_9_Conditional_5_Template, 2, 3, "mat-spinner", 26)(6, SearchComponent_Conditional_1_Conditional_9_Conditional_6_Template, 4, 4, "button", 27);
    i0.ɵɵelementStart(7, "mat-autocomplete", 28, 0);
    i0.ɵɵlistener("optionSelected", function SearchComponent_Conditional_1_Conditional_9_Template_mat_autocomplete_optionSelected_7_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.selectAiSuggestion($event.option.value)); });
    i0.ɵɵrepeaterCreate(9, SearchComponent_Conditional_1_Conditional_9_For_10_Template, 4, 2, "mat-option", 29, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(11, SearchComponent_Conditional_1_Conditional_9_Conditional_11_Template, 4, 1, "div", 30);
    i0.ɵɵconditionalCreate(12, SearchComponent_Conditional_1_Conditional_9_Conditional_12_Template, 8, 2, "div", 31);
} if (rf & 2) {
    const aiAutoComplete_r7 = i0.ɵɵreference(8);
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(4, 6, "search.search.ask-in-natural-language-e-g"))("ngModel", ctx_r1.aiQuery())("matAutocomplete", aiAutoComplete_r7);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.aiLoading() ? 5 : 6);
    i0.ɵɵadvance(4);
    i0.ɵɵrepeater(ctx_r1.aiSuggestions());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.aiError() ? 11 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.showNxqlPanel() && ctx_r1.aiGeneratedNxql() ? 12 : -1);
} }
function SearchComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 2)(1, "div", 18)(2, "button", 19);
    i0.ɵɵlistener("click", function SearchComponent_Conditional_1_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.toggleAiSearch()); });
    i0.ɵɵelementStart(3, "mat-icon", 20);
    i0.ɵɵtext(4, "auto_awesome");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(8, SearchComponent_Conditional_1_Conditional_8_Template, 6, 5, "button", 21);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(9, SearchComponent_Conditional_1_Conditional_9_Template, 13, 8);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("active", ctx_r1.aiSearchMode());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.aiSearchMode() ? i0.ɵɵpipeBind1(6, 5, "search.ai-search-active") : i0.ɵɵpipeBind1(7, 7, "search.ai-search"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.aiSearchMode() && ctx_r1.aiGeneratedNxql() ? 8 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.aiSearchMode() ? 9 : -1);
} }
function SearchComponent_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 7);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(2, 1, ctx_r1.totalCount() === 1 ? "common.count.result-one" : "common.count.result-many", i0.ɵɵpureFunction1(4, _c0, ctx_r1.totalCount())));
} }
function SearchComponent_For_9_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 36);
    i0.ɵɵlistener("click", function SearchComponent_For_9_Template_button_click_0_listener() { const filter_r9 = i0.ɵɵrestoreView(_r8).$implicit; const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.toggleQuickFilter(filter_r9.value)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "descriptorLabel");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const filter_r9 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵclassProp("active", ctx_r1.isQuickFilterSelected(filter_r9.value));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 3, filter_r9), " ");
} }
function SearchComponent_Conditional_31_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 13);
    i0.ɵɵelement(1, "nxs-spinner", 37);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", i0.ɵɵpipeBind1(2, 1, "search.search.loading"));
} }
function SearchComponent_Conditional_32_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "nxs-error-state", 38);
    i0.ɵɵlistener("retry", function SearchComponent_Conditional_32_Template_nxs_error_state_retry_0_listener() { i0.ɵɵrestoreView(_r10); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.retrySearch()); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("status", ctx_r1.errorStatus())("heading", ctx);
} }
function SearchComponent_Conditional_33_For_32_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    const _r14 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 49);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵlistener("click", function SearchComponent_Conditional_33_For_32_Conditional_18_Template_button_click_0_listener($event) { i0.ɵɵrestoreView(_r14); const row_r13 = i0.ɵɵnextContext().$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.downloadDocument(row_r13.id, row_r13.name, $event)); });
    i0.ɵɵelementStart(3, "mat-icon", 66);
    i0.ɵɵtext(4, "download");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(1, 2, "search.search.download"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 4, "search.search.download"));
} }
function SearchComponent_Conditional_33_For_32_Template(rf, ctx) { if (rf & 1) {
    const _r12 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 53)(1, "div", 54)(2, "mat-checkbox", 55);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵlistener("change", function SearchComponent_Conditional_33_For_32_Template_mat_checkbox_change_2_listener() { const row_r13 = i0.ɵɵrestoreView(_r12).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.toggleSelection(row_r13.id)); })("click", function SearchComponent_Conditional_33_For_32_Template_mat_checkbox_click_2_listener($event) { i0.ɵɵrestoreView(_r12); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(4, "div", 56)(5, "nxs-thumbnail", 57)(6, "mat-icon", 58);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(8, "div", 59)(9, "div", 60)(10, "button", 61);
    i0.ɵɵlistener("click", function SearchComponent_Conditional_33_For_32_Template_button_click_10_listener($event) { const row_r13 = i0.ɵɵrestoreView(_r12).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); ctx_r1.openDocument(row_r13.id); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "span", 62);
    i0.ɵɵpipe(13, "docTypeLabel");
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "docTypeLabel");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(16, "div", 63)(17, "nxs-favorite-toggle", 64);
    i0.ɵɵlistener("changed", function SearchComponent_Conditional_33_For_32_Template_nxs_favorite_toggle_changed_17_listener($event) { const row_r13 = i0.ɵɵrestoreView(_r12).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onFavoriteChanged(row_r13.id, $event)); })("failed", function SearchComponent_Conditional_33_For_32_Template_nxs_favorite_toggle_failed_17_listener($event) { i0.ɵɵrestoreView(_r12); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onFavoriteFailed($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(18, SearchComponent_Conditional_33_For_32_Conditional_18_Template, 5, 6, "button", 65);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const row_r13 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("selected", ctx_r1.isSelected(row_r13.id));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("checked", ctx_r1.isSelected(row_r13.id));
    i0.ɵɵariaProperty("aria-label", i0.ɵɵpipeBind2(3, 13, "common.select-item", i0.ɵɵpureFunction1(20, _c1, row_r13.name)));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("documentId", row_r13.id);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(row_r13.icon);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("title", row_r13.name);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", row_r13.name, " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("title", i0.ɵɵpipeBind1(13, 16, row_r13.type));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(15, 18, row_r13.type));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("documentId", row_r13.id)("favorite", ctx_r1.isFavorited(row_r13.id));
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.isDownloadableType(row_r13.type) ? 18 : -1);
} }
function SearchComponent_Conditional_33_Conditional_33_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 52);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "search.search.no-documents-match-the-search-criteria"), " ");
} }
function SearchComponent_Conditional_33_Template(rf, ctx) { if (rf & 1) {
    const _r11 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 15)(1, "div", 39)(2, "div", 40)(3, "mat-select", 41);
    i0.ɵɵlistener("selectionChange", function SearchComponent_Conditional_33_Template_mat_select_selectionChange_3_listener($event) { i0.ɵɵrestoreView(_r11); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.setGridGroupBy($event.value)); });
    i0.ɵɵelementStart(4, "mat-option", 42);
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "mat-option", 43);
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "mat-option", 44);
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "mat-option", 45);
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "mat-option", 46);
    i0.ɵɵtext(17);
    i0.ɵɵpipe(18, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "mat-option", 47);
    i0.ɵɵtext(20);
    i0.ɵɵpipe(21, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(22, "mat-option", 48);
    i0.ɵɵtext(23);
    i0.ɵɵpipe(24, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(25, "button", 49);
    i0.ɵɵpipe(26, "translate");
    i0.ɵɵpipe(27, "translate");
    i0.ɵɵlistener("click", function SearchComponent_Conditional_33_Template_button_click_25_listener() { i0.ɵɵrestoreView(_r11); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.setGridSortOrder(ctx_r1.gridSortOrder() === "asc" ? "desc" : "asc")); });
    i0.ɵɵelementStart(28, "mat-icon");
    i0.ɵɵtext(29);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(30, "div", 50);
    i0.ɵɵrepeaterCreate(31, SearchComponent_Conditional_33_For_32_Template, 19, 22, "div", 51, _forTrack1);
    i0.ɵɵconditionalCreate(33, SearchComponent_Conditional_33_Conditional_33_Template, 3, 3, "div", 52);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("value", ctx_r1.gridGroupBy());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(6, 12, "search.search.title"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 14, "search.search.created"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 16, "search.search.modified"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(15, 18, "search.search.last-contributor"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(18, 20, "search.search.state"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(21, 22, "search.search.nature"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(24, 24, "search.search.coverage"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(26, 26, "search.search.revert-sort-order"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(27, 28, "search.search.revert-sort-order"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r1.gridSortOrder() === "asc" ? "arrow_upward" : "arrow_downward");
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.displayResults());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.resultCount() === 0 ? 33 : -1);
} }
function SearchComponent_Conditional_34_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r16 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "nxs-column-picker", 75);
    i0.ɵɵlistener("apply", function SearchComponent_Conditional_34_Conditional_1_Template_nxs_column_picker_apply_0_listener($event) { i0.ɵɵrestoreView(_r16); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.applyColumns($event)); })("dismiss", function SearchComponent_Conditional_34_Conditional_1_Template_nxs_column_picker_dismiss_0_listener() { i0.ɵɵrestoreView(_r16); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.closeColumnPanel()); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("columns", ctx_r1.pickerColumns())("defaults", ctx_r1.defaultColumnKeys);
} }
function SearchComponent_Conditional_34_For_6_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r17 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 77);
    i0.ɵɵlistener("click", function SearchComponent_Conditional_34_For_6_Conditional_0_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r17); const col_r18 = i0.ɵɵnextContext().$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.sortBy(col_r18.key)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "descriptorLabel");
    i0.ɵɵelementStart(3, "mat-icon", 78);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const col_r18 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("col-name", col_r18.key === "name");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 6, col_r18), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("sort-active", ctx_r1.sortColumn() === col_r18.key);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.sortColumn() === col_r18.key && ctx_r1.sortDirection() === "desc" ? "arrow_downward" : "arrow_upward", " ");
} }
function SearchComponent_Conditional_34_For_6_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "descriptorLabel");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const col_r18 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, col_r18));
} }
function SearchComponent_Conditional_34_For_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, SearchComponent_Conditional_34_For_6_Conditional_0_Template, 5, 8, "button", 76)(1, SearchComponent_Conditional_34_For_6_Conditional_1_Template, 3, 3, "span");
} if (rf & 2) {
    const col_r18 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵconditional(ctx_r1.SORTABLE_COLUMNS.has(col_r18.key) ? 0 : 1);
} }
function SearchComponent_Conditional_34_For_14_For_5_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r21 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "span", 82)(1, "nxs-thumbnail", 83)(2, "mat-icon", 84);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(4, "button", 85);
    i0.ɵɵlistener("click", function SearchComponent_Conditional_34_For_14_For_5_Conditional_0_Template_button_click_4_listener($event) { i0.ɵɵrestoreView(_r21); const row_r20 = i0.ɵɵnextContext(2).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); ctx_r1.openDocument(row_r20.id); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const row_r20 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵproperty("documentId", row_r20.id);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(row_r20.icon);
    i0.ɵɵadvance();
    i0.ɵɵproperty("title", row_r20.name);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", row_r20.name, " ");
} }
function SearchComponent_Conditional_34_For_14_For_5_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "docTypeLabel");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r20 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, row_r20.type));
} }
function SearchComponent_Conditional_34_For_14_For_5_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const col_r22 = i0.ɵɵnextContext().$implicit;
    const row_r20 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.getCellValue(row_r20, col_r22.key));
} }
function SearchComponent_Conditional_34_For_14_For_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, SearchComponent_Conditional_34_For_14_For_5_Conditional_0_Template, 6, 4, "span", 82)(1, SearchComponent_Conditional_34_For_14_For_5_Conditional_1_Template, 3, 3, "span")(2, SearchComponent_Conditional_34_For_14_For_5_Conditional_2_Template, 2, 1, "span");
} if (rf & 2) {
    const col_r22 = ctx.$implicit;
    i0.ɵɵconditional(col_r22.key === "name" ? 0 : col_r22.key === "type" ? 1 : 2);
} }
function SearchComponent_Conditional_34_For_14_Template(rf, ctx) { if (rf & 1) {
    const _r19 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 79)(1, "span", 80)(2, "mat-checkbox", 81);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵlistener("click", function SearchComponent_Conditional_34_For_14_Template_mat_checkbox_click_2_listener($event) { i0.ɵɵrestoreView(_r19); return i0.ɵɵresetView($event.stopPropagation()); })("change", function SearchComponent_Conditional_34_For_14_Template_mat_checkbox_change_2_listener() { const row_r20 = i0.ɵɵrestoreView(_r19).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.toggleSelection(row_r20.id)); });
    i0.ɵɵelementEnd()();
    i0.ɵɵrepeaterCreate(4, SearchComponent_Conditional_34_For_14_For_5_Template, 3, 1, null, null, _forTrack2);
    i0.ɵɵelement(6, "span", 71);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r20 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵstyleProp("grid-template-columns", ctx_r1.gridTemplate());
    i0.ɵɵclassProp("selected", ctx_r1.isSelected(row_r20.id));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("checked", ctx_r1.isSelected(row_r20.id));
    i0.ɵɵariaProperty("aria-label", i0.ɵɵpipeBind2(3, 6, "common.select-item", i0.ɵɵpureFunction1(9, _c1, row_r20.name)));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.visibleColumns());
} }
function SearchComponent_Conditional_34_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 74);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "search.search.no-documents-match-the-search-criteria"), " ");
} }
function SearchComponent_Conditional_34_Template(rf, ctx) { if (rf & 1) {
    const _r15 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 16);
    i0.ɵɵconditionalCreate(1, SearchComponent_Conditional_34_Conditional_1_Template, 1, 2, "nxs-column-picker", 67);
    i0.ɵɵelementStart(2, "div", 68)(3, "div", 69);
    i0.ɵɵelement(4, "span", 70);
    i0.ɵɵrepeaterCreate(5, SearchComponent_Conditional_34_For_6_Template, 2, 1, null, null, _forTrack2);
    i0.ɵɵelementStart(7, "span", 71)(8, "button", 72);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵlistener("click", function SearchComponent_Conditional_34_Template_button_click_8_listener() { i0.ɵɵrestoreView(_r15); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.openColumnPanel()); });
    i0.ɵɵelementStart(11, "mat-icon");
    i0.ɵɵtext(12, "tune");
    i0.ɵɵelementEnd()()()();
    i0.ɵɵrepeaterCreate(13, SearchComponent_Conditional_34_For_14_Template, 7, 11, "div", 73, _forTrack1);
    i0.ɵɵconditionalCreate(15, SearchComponent_Conditional_34_Conditional_15_Template, 3, 3, "div", 74);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.columnPanelOpen() ? 1 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵstyleProp("grid-template-columns", ctx_r1.gridTemplate());
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.visibleColumns());
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(9, 6, "search.search.manage-columns"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(10, 8, "search.search.manage-columns"));
    i0.ɵɵadvance(5);
    i0.ɵɵrepeater(ctx_r1.sortedResults());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.resultCount() === 0 ? 15 : -1);
} }
function SearchComponent_Conditional_35_For_31_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    const _r26 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 49);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵlistener("click", function SearchComponent_Conditional_35_For_31_Conditional_18_Template_button_click_0_listener($event) { i0.ɵɵrestoreView(_r26); const row_r25 = i0.ɵɵnextContext().$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.downloadDocument(row_r25.id, row_r25.name, $event)); });
    i0.ɵɵelementStart(3, "mat-icon", 66);
    i0.ɵɵtext(4, "download");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(1, 2, "search.search.download"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 4, "search.search.download"));
} }
function SearchComponent_Conditional_35_For_31_Template(rf, ctx) { if (rf & 1) {
    const _r24 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 91)(1, "div", 92)(2, "nxs-thumbnail", 93)(3, "mat-icon", 94);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "span", 95)(6, "mat-checkbox", 81);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵlistener("click", function SearchComponent_Conditional_35_For_31_Template_mat_checkbox_click_6_listener($event) { i0.ɵɵrestoreView(_r24); return i0.ɵɵresetView($event.stopPropagation()); })("change", function SearchComponent_Conditional_35_For_31_Template_mat_checkbox_change_6_listener() { const row_r25 = i0.ɵɵrestoreView(_r24).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.toggleSelection(row_r25.id)); });
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(8, "div", 96)(9, "div", 97)(10, "button", 98);
    i0.ɵɵlistener("click", function SearchComponent_Conditional_35_For_31_Template_button_click_10_listener($event) { const row_r25 = i0.ɵɵrestoreView(_r24).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); ctx_r1.openDocument(row_r25.id); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "span", 99);
    i0.ɵɵpipe(13, "docTypeLabel");
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "docTypeLabel");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(16, "div", 100)(17, "nxs-favorite-toggle", 64);
    i0.ɵɵlistener("changed", function SearchComponent_Conditional_35_For_31_Template_nxs_favorite_toggle_changed_17_listener($event) { const row_r25 = i0.ɵɵrestoreView(_r24).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onFavoriteChanged(row_r25.id, $event)); })("failed", function SearchComponent_Conditional_35_For_31_Template_nxs_favorite_toggle_failed_17_listener($event) { i0.ɵɵrestoreView(_r24); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onFavoriteFailed($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(18, SearchComponent_Conditional_35_For_31_Conditional_18_Template, 5, 6, "button", 65);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const row_r25 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("selected", ctx_r1.isSelected(row_r25.id));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("documentId", row_r25.id);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(row_r25.icon);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("checked", ctx_r1.isSelected(row_r25.id));
    i0.ɵɵariaProperty("aria-label", i0.ɵɵpipeBind2(7, 13, "common.select-item", i0.ɵɵpureFunction1(20, _c1, row_r25.name)));
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("title", row_r25.name);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", row_r25.name, " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("title", i0.ɵɵpipeBind1(13, 16, row_r25.type));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(15, 18, row_r25.type));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("documentId", row_r25.id)("favorite", ctx_r1.isFavorited(row_r25.id));
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.isDownloadableType(row_r25.type) ? 18 : -1);
} }
function SearchComponent_Conditional_35_Conditional_32_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 74);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "search.search.no-documents-match-the-search-criteria"), " ");
} }
function SearchComponent_Conditional_35_Template(rf, ctx) { if (rf & 1) {
    const _r23 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 86)(1, "div", 87)(2, "mat-select", 88);
    i0.ɵɵlistener("selectionChange", function SearchComponent_Conditional_35_Template_mat_select_selectionChange_2_listener($event) { i0.ɵɵrestoreView(_r23); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.setGridGroupBy($event.value)); });
    i0.ɵɵelementStart(3, "mat-option", 42);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "mat-option", 43);
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "mat-option", 44);
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "mat-option", 45);
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "mat-option", 46);
    i0.ɵɵtext(16);
    i0.ɵɵpipe(17, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "mat-option", 47);
    i0.ɵɵtext(19);
    i0.ɵɵpipe(20, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "mat-option", 48);
    i0.ɵɵtext(22);
    i0.ɵɵpipe(23, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(24, "button", 49);
    i0.ɵɵpipe(25, "translate");
    i0.ɵɵpipe(26, "translate");
    i0.ɵɵlistener("click", function SearchComponent_Conditional_35_Template_button_click_24_listener() { i0.ɵɵrestoreView(_r23); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.setGridSortOrder(ctx_r1.gridSortOrder() === "asc" ? "desc" : "asc")); });
    i0.ɵɵelementStart(27, "mat-icon");
    i0.ɵɵtext(28);
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelementStart(29, "div", 89);
    i0.ɵɵrepeaterCreate(30, SearchComponent_Conditional_35_For_31_Template, 19, 22, "div", 90, _forTrack1);
    i0.ɵɵconditionalCreate(32, SearchComponent_Conditional_35_Conditional_32_Template, 3, 3, "div", 74);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("value", ctx_r1.gridGroupBy());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(5, 12, "search.search.title"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 14, "search.search.created"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(11, 16, "search.search.modified"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(14, 18, "search.search.last-contributor"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(17, 20, "search.search.state"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(20, 22, "search.search.nature"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(23, 24, "search.search.coverage"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(25, 26, "search.search.revert-sort-order"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(26, 28, "search.search.revert-sort-order"));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r1.gridSortOrder() === "asc" ? "arrow_upward" : "arrow_downward");
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.displayResults());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.resultCount() === 0 ? 32 : -1);
} }
function SearchComponent_Conditional_36_Template(rf, ctx) { if (rf & 1) {
    const _r27 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "nxs-pager", 101);
    i0.ɵɵlistener("pageChange", function SearchComponent_Conditional_36_Template_nxs_pager_pageChange_0_listener($event) { i0.ɵɵrestoreView(_r27); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.goToPage($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("pageIndex", ctx_r1.pager().pageIndex)("pageSize", ctx_r1.pageSize)("itemCount", ctx_r1.pager().itemCount)("totalSize", ctx_r1.pager().totalSize)("hasNextPage", ctx_r1.pager().hasNextPage);
} }
/** The columns a search table starts with, and what the picker's Reset returns to. */
const DEFAULT_COLUMN_KEYS = ['name', 'modified', 'contributor'];
const ALL_COLUMNS = [
    { key: 'name', labelKey: 'search.column.name', label: 'Title', width: '2fr' },
    { key: 'type', labelKey: 'search.column.type', label: 'Type', width: '1fr' },
    { key: 'modified', labelKey: 'search.column.modified', label: 'Modified', width: '1fr' },
    {
        key: 'contributor',
        labelKey: 'search.column.contributor',
        label: 'Last contributor',
        width: '1.2fr',
    },
    { key: 'state', labelKey: 'search.column.state', label: 'State', width: '1fr' },
    { key: 'version', labelKey: 'search.column.version', label: 'Version', width: '0.8fr' },
    { key: 'created', labelKey: 'search.column.created', label: 'Created', width: '1fr' },
    { key: 'author', labelKey: 'search.column.author', label: 'Author', width: '1fr' },
    { key: 'nature', labelKey: 'search.column.nature', label: 'Nature', width: '1fr' },
    { key: 'coverage', labelKey: 'search.column.coverage', label: 'Coverage', width: '1fr' },
    { key: 'subjects', labelKey: 'search.column.subjects', label: 'Subjects', width: '1fr' },
    { key: 'flags', labelKey: 'search.column.flags', label: 'Flags', width: '1fr' },
];
const QUICK_FILTER_OPTIONS = [
    { labelKey: 'search.quick-filter.no-containers', label: 'No Containers', value: 'noFolder' },
    { labelKey: 'search.quick-filter.most-recent', label: 'Most Recent', value: 'mostRecent' },
    { labelKey: 'search.quick-filter.validated', label: 'Validated', value: 'onlyValidated' },
];
// Map display column keys to API field names
const COLUMN_TO_API_FIELD = {
    title: 'dc:title',
    name: 'dc:title',
    type: 'dc:type',
    modified: 'dc:modified',
    contributor: 'dc:lastContributor',
    state: 'ecm:currentLifeCycleState',
    version: 'dc:version',
    created: 'dc:created',
    author: 'dc:creator',
    nature: 'dc:nature',
    coverage: 'dc:coverage',
    subjects: 'dc:subjects',
    flags: 'dc:flag',
};
// Reverse map: API field names back to display column keys
const API_FIELD_TO_COLUMN = Object.fromEntries(Object.entries(COLUMN_TO_API_FIELD)
    .filter(([key]) => key !== 'title') // prefer 'name' over 'title' for dc:title
    .map(([key, value]) => [value, key]));
/**
 * Relative, so it resolves against `<base href>`: the Marketplace package serves the app from
 * `/nuxeo/agentic-ui/`, where a root-absolute path 404s.
 */
const FALLBACK_ART_URL = 'images/Login-background.svg';
function mapToView(item) {
    return {
        id: item.id,
        name: item.title,
        imageUrl: FALLBACK_ART_URL,
        type: item.type,
        modifiedDate: item.modifiedDate,
        lastContributor: item.lastContributor,
        state: item.state,
        version: item.version,
        createdDate: item.createdDate,
        author: item.author,
        nature: item.nature,
        coverage: item.coverage,
        subjects: item.subjects ?? item.tags.join(', '),
        flags: item.flags,
        icon: item.icon,
    };
}
export class SearchComponent {
    translate = inject(TranslateService);
    route = inject(ActivatedRoute);
    router = inject(Router);
    toast = inject(NxsToastService);
    dialog = inject(MatDialog);
    destroyRef = inject(DestroyRef);
    session = inject(SearchSession);
    documentDetailService = inject(DocumentDetailService);
    nuxeoApi = inject(NuxeoApiBase);
    aiGateway = inject(AiGatewayService);
    featureFlags = inject(AiFeatureFlagService);
    selectionService = inject(SelectionService);
    /**
     * Sequence for the whole AI request lifecycle — `nlToNxql` *and* the `nxqlSearch` it triggers.
     *
     * One counter spanning both phases, not one per phase. Guarding only the second phase was not
     * enough: a stale `nlToNxql` response still wrote `aiGeneratedNxql`/`aiExplanation` and then
     * started a fresh query that minted its own generation, so the superseded request won. It is also
     * incremented when AI mode is switched off, so an in-flight response cannot re-enable
     * `aiSearchExecuted` or overwrite the restored standard-search thumbnails after the UI has left.
     */
    aiRequestGeneration = 0;
    // AI Search state
    aiSearchMode = signal(false, ...(ngDevMode ? [{ debugName: "aiSearchMode" }] : []));
    aiQuery = signal('', ...(ngDevMode ? [{ debugName: "aiQuery" }] : []));
    aiLoading = signal(false, ...(ngDevMode ? [{ debugName: "aiLoading" }] : []));
    aiGeneratedNxql = signal('', ...(ngDevMode ? [{ debugName: "aiGeneratedNxql" }] : []));
    aiExplanation = signal('', ...(ngDevMode ? [{ debugName: "aiExplanation" }] : []));
    aiSuggestions = signal([], ...(ngDevMode ? [{ debugName: "aiSuggestions" }] : []));
    showNxqlPanel = signal(false, ...(ngDevMode ? [{ debugName: "showNxqlPanel" }] : []));
    aiError = signal(null, ...(ngDevMode ? [{ debugName: "aiError" }] : []));
    aiResults = signal([], ...(ngDevMode ? [{ debugName: "aiResults" }] : []));
    aiSearchExecuted = signal(false, ...(ngDevMode ? [{ debugName: "aiSearchExecuted" }] : []));
    aiSuggestSubject = new Subject();
    /** The shared search's state: `SearchSession` runs the one request this page and the drawer show. */
    resultsState = toSignal(this.session.results$, {
        initialValue: {
            status: 'loading',
            items: [],
            aggregations: {},
            totalSize: -1,
            hasNextPage: false,
            error: null,
        },
    });
    loading = computed(() => this.resultsState().status === 'loading', ...(ngDevMode ? [{ debugName: "loading" }] : []));
    /**
     * Loading owned by the AI NXQL request specifically, kept separate from {@link loading}.
     *
     * `loading` belongs to the standard search, which `SearchSession` runs on every route/filter
     * change. When `runNxqlQuery` also wrote to it, `supersedeAiRequest` had to clear it — and that
     * clear could land while a *standard* search was still in flight, hiding the spinner and rendering
     * the previous results, because every view mode below is gated on `!loading()`. Superseding AI work
     * must only release AI-owned loading, so the two are no longer the same flag.
     */
    aiNxqlLoading = signal(false, ...(ngDevMode ? [{ debugName: "aiNxqlLoading" }] : []));
    /** Either request is in flight. What the template gates on, so neither can hide the other's spinner. */
    busy = computed(() => this.loading() || this.aiNxqlLoading(), ...(ngDevMode ? [{ debugName: "busy" }] : []));
    error = computed(() => this.resultsState().status === 'failed'
        ? this.translate.instant('search.message.failed-to-load-search-results')
        : null, ...(ngDevMode ? [{ debugName: "error" }] : []));
    quickFilterOptions = QUICK_FILTER_OPTIONS;
    selectedQuickFilters = signal(new Set(), ...(ngDevMode ? [{ debugName: "selectedQuickFilters" }] : []));
    gridGroupBy = signal('created', ...(ngDevMode ? [{ debugName: "gridGroupBy" }] : []));
    gridSortOrder = signal('asc', ...(ngDevMode ? [{ debugName: "gridSortOrder" }] : []));
    viewMode = signal('table', ...(ngDevMode ? [{ debugName: "viewMode" }] : []));
    visibleColumnKeys = signal([...DEFAULT_COLUMN_KEYS], ...(ngDevMode ? [{ debugName: "visibleColumnKeys" }] : []));
    columnPanelOpen = signal(false, ...(ngDevMode ? [{ debugName: "columnPanelOpen" }] : []));
    defaultColumnKeys = DEFAULT_COLUMN_KEYS;
    /**
     * The active language as a signal. `translate.instant` is not reactive, so the picker's
     * labels read this to follow a language change.
     */
    currentLang = toSignal(this.translate.onLangChange.pipe(map((event) => event.lang)), { initialValue: this.translate.currentLang });
    /** Every column as the picker offers it: names resolved for the active language. */
    pickerColumns = computed(() => {
        this.currentLang();
        const visible = this.visibleColumnKeys();
        return ALL_COLUMNS.map((column) => ({
            key: column.key,
            label: descriptorLabel(column, (key) => this.translate.instant(key)),
            visible: visible.includes(column.key),
        }));
    }, ...(ngDevMode ? [{ debugName: "pickerColumns" }] : []));
    sortColumn = signal(null, ...(ngDevMode ? [{ debugName: "sortColumn" }] : []));
    sortDirection = signal(null, ...(ngDevMode ? [{ debugName: "sortDirection" }] : []));
    favoriteIds = signal(new Set(), ...(ngDevMode ? [{ debugName: "favoriteIds" }] : []));
    selectedSavedSearchId = this.session.savedSearchId;
    selectedSavedSearchTitle = this.session.savedSearchTitle;
    /** Whether the filters differ from the open saved search's: Save is offered only then. */
    savedSearchDirty = this.session.dirty;
    hasFilters = this.session.hasFilters;
    /** Which error state `error` shows: the status of the search request that failed. */
    errorStatus = computed(() => nxsErrorStatus(this.resultsState().error), ...(ngDevMode ? [{ debugName: "errorStatus" }] : []));
    /**
     * The standard search's failure, while its results are the ones on screen. `error` belongs to the
     * standard search and outlives an AI search, whose results must not be hidden behind it.
     */
    resultsError = computed(() => this.aiSearchMode() && this.aiSearchExecuted() ? null : this.error(), ...(ngDevMode ? [{ debugName: "resultsError" }] : []));
    results = computed(() => this.resultsState().items, ...(ngDevMode ? [{ debugName: "results" }] : []));
    /** Run the failed search again, with the same query and filters. */
    retrySearch() {
        this.session.retry();
    }
    /**
     * The URL's quick filters and sort: shown here, and handed to the session as part of the query.
     */
    applyPageQuery(params) {
        const quickFilters = params.get('quickFilters') ?? '';
        this.selectedQuickFilters.set(this.parseQuickFilters(quickFilters));
        const sortBy = params.get('sortBy');
        const sortOrderRaw = params.get('sortOrder');
        const sortOrder = sortOrderRaw === 'asc' || sortOrderRaw === 'desc' ? sortOrderRaw : null;
        // Map API field name back to UI column key for in-memory sorting/indicators
        const uiSortColumn = sortBy ? (API_FIELD_TO_COLUMN[sortBy] ?? sortBy) : null;
        this.sortColumn.set(uiSortColumn);
        this.sortDirection.set(sortOrder);
        // Sync grid sort UI from query params so grid view stays in sync with table view
        if (uiSortColumn)
            this.gridGroupBy.set(uiSortColumn);
        if (sortOrder)
            this.gridSortOrder.set(sortOrder);
        this.session.setPageQuery({ quickFilters: quickFilters.trim(), sortBy, sortOrder });
        // The URL counts pages from one; the session from zero. No `page` means the first.
        const page = Number.parseInt(params.get('page') ?? '', 10);
        this.urlPageIndex = Number.isFinite(page) && page > 1 ? page - 1 : 0;
        this.session.setPageIndex(this.urlPageIndex);
    }
    /**
     * The pager asked for another page. The request and the URL both follow the session.
     *
     * Ignored while a page loads. The pager still shows the last answer then, so the page it names
     * can be out of date: after a filter change it would ask for a page of the new query that the
     * reset has already moved past. The control stays enabled, so it keeps keyboard focus.
     */
    goToPage(pageIndex) {
        if (this.resultsState().status === 'loading')
            return;
        this.session.setPageIndex(pageIndex);
    }
    visibleColumns = computed(() => ALL_COLUMNS.filter((c) => this.visibleColumnKeys().includes(c.key)), ...(ngDevMode ? [{ debugName: "visibleColumns" }] : []));
    gridTemplate = computed(() => ['40px', ...this.visibleColumns().map((c) => c.width), '40px'].join(' '), ...(ngDevMode ? [{ debugName: "gridTemplate" }] : []));
    filteredResults = computed(() => {
        const source = this.aiSearchMode() && this.aiSearchExecuted() ? this.aiResults() : this.results();
        return source.map(mapToView);
    }, ...(ngDevMode ? [{ debugName: "filteredResults" }] : []));
    displayResults = computed(() => this.filteredResults(), ...(ngDevMode ? [{ debugName: "displayResults" }] : []));
    sortedResults = computed(() => {
        const rows = [...this.displayResults()];
        const col = this.sortColumn();
        const dir = this.sortDirection();
        if (!col || !dir)
            return rows;
        return rows.sort((a, b) => {
            const aVal = this.getCellValue(a, col).toLowerCase();
            const bVal = this.getCellValue(b, col).toLowerCase();
            return dir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        });
    }, ...(ngDevMode ? [{ debugName: "sortedResults" }] : []));
    resultCount = computed(() => this.displayResults().length, ...(ngDevMode ? [{ debugName: "resultCount" }] : []));
    /** Every match the server counted, or the rows on screen when it counted none. */
    totalCount = computed(() => {
        // An AI search's rows are not the standard search's results, so its total is not theirs.
        // An AI search's rows are not the standard search's results, so its total is not theirs.
        if (this.aiSearchMode() && this.aiSearchExecuted())
            return this.resultCount();
        const total = this.resultsState().totalSize;
        return total >= 0 ? total : this.resultCount();
    }, ...(ngDevMode ? [{ debugName: "totalCount" }] : []));
    pageSize = SEARCH_PAGE_SIZE;
    /**
     * The paging of the last answer, which the pager reads. It stays on screen while the next page
     * loads: a control removed while focused loses the keyboard user's place.
     */
    pager = signal({ pageIndex: 0, itemCount: 0, totalSize: -1, hasNextPage: false }, ...(ngDevMode ? [{ debugName: "pager" }] : []));
    /** The page the URL asked for, as the last applied URL; the URL follows the pager through it. */
    urlPageIndex = 0;
    selectedCount = computed(() => this.selectionService.selectedCount(), ...(ngDevMode ? [{ debugName: "selectedCount" }] : []));
    SORTABLE_COLUMNS = new Set(['name', 'modified', 'contributor', 'author', 'created']);
    isAllSelected = computed(() => {
        const rows = this.displayResults();
        return this.selectionService.isAllSelected(rows.map((r) => r.id));
    }, ...(ngDevMode ? [{ debugName: "isAllSelected" }] : []));
    isIndeterminate = computed(() => {
        const rows = this.displayResults();
        return this.selectionService.isIndeterminate(rows.map((r) => r.id));
    }, ...(ngDevMode ? [{ debugName: "isIndeterminate" }] : []));
    isQuickFilterSelected(value) {
        return this.selectedQuickFilters().has(value);
    }
    toggleQuickFilter(value) {
        const next = new Set(this.selectedQuickFilters());
        if (next.has(value))
            next.delete(value);
        else
            next.add(value);
        this.selectedQuickFilters.set(next);
        const orderedSelected = QUICK_FILTER_OPTIONS.map((filter) => filter.value).filter((filterValue) => next.has(filterValue));
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                quickFilters: orderedSelected.length > 0 ? orderedSelected.join(',') : null,
                page: null,
            },
            queryParamsHandling: 'merge',
        });
    }
    setViewMode(mode) {
        this.viewMode.set(mode);
    }
    openDocument(uid) {
        if (!uid)
            return;
        const item = this.results().find((r) => r.id === uid);
        if (item?.type === 'Collection') {
            void this.router.navigateByUrl(`/collections/${uid}`);
            return;
        }
        if (item && FOLDERISH_TYPES.has(item.type) && item.path) {
            void this.router.navigateByUrl(`/browse${item.path}`);
            return;
        }
        void this.router.navigateByUrl(`/doc/${uid}`);
    }
    isSelected(id) {
        return this.selectionService.isSelected(id);
    }
    toggleSelection(id) {
        const row = this.displayResults().find((r) => r.id === id);
        this.selectionService.toggle(id, row?.name ?? id);
    }
    toggleAll() {
        if (this.isAllSelected()) {
            this.selectionService.clear();
        }
        else {
            const rows = this.displayResults();
            const labels = {};
            rows.forEach((row) => {
                labels[row.id] = row.name;
            });
            this.selectionService.selectAll(rows.map((r) => r.id), labels);
        }
    }
    deleteSelected() {
        this.selectionService
            .deleteSelected()
            .pipe(takeUntilDestroyed(this.destroyRef))
            // The same query again, so the deleted documents leave the results.
            .subscribe({ next: () => this.session.retry() });
    }
    clearSelection() {
        this.selectionService.clear();
    }
    openColumnPanel() {
        this.columnPanelOpen.set(true);
    }
    closeColumnPanel() {
        this.columnPanelOpen.set(false);
    }
    /** The picker's Done: the keys to show, in column order. */
    applyColumns(keys) {
        this.visibleColumnKeys.set([...keys]);
        this.columnPanelOpen.set(false);
    }
    sortBy(col) {
        if (!this.SORTABLE_COLUMNS.has(col))
            return;
        let newSortColumn = col;
        let newSortDirection = 'asc';
        if (this.sortColumn() === col) {
            if (this.sortDirection() === 'asc') {
                newSortDirection = 'desc';
            }
            else if (this.sortDirection() === 'desc') {
                newSortColumn = null;
                newSortDirection = null;
            }
        }
        this.sortColumn.set(newSortColumn);
        this.sortDirection.set(newSortDirection);
        // Map the display column key to API field name
        const apiFieldName = newSortColumn ? COLUMN_TO_API_FIELD[newSortColumn] : null;
        // Update route query parameters to trigger API call
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                sortBy: apiFieldName || null,
                sortOrder: newSortDirection || null,
                page: null,
            },
            queryParamsHandling: 'merge',
        });
    }
    getCellValue(row, key) {
        switch (key) {
            case 'name':
                return row.name;
            case 'type':
                return row.type;
            case 'modified':
                return row.modifiedDate;
            case 'contributor':
                return row.lastContributor;
            case 'author':
                return row.author;
            case 'state':
                return row.state ?? '—';
            case 'version':
                return row.version ?? '—';
            case 'created':
                return row.createdDate ?? '—';
            case 'nature':
                return row.nature ?? '—';
            case 'coverage':
                return row.coverage ?? '—';
            case 'subjects':
                return row.subjects ?? '—';
            case 'flags':
                return row.flags ?? '—';
            default:
                return '';
        }
    }
    exportCsv() {
        const headers = [
            'Title',
            'Type',
            'Modified',
            'Last Contributor',
            'State',
            'Version',
            'Created',
            'Author',
            'Nature',
            'Coverage',
            'Subjects',
            'Flags',
        ];
        const escape = (value) => `"${value.replaceAll('"', '""')}"`;
        const rows = this.sortedResults().map((row) => [
            row.name,
            row.type,
            row.modifiedDate,
            row.lastContributor,
            row.state ?? '—',
            row.version ?? '—',
            row.createdDate ?? '—',
            row.author,
            row.nature ?? '—',
            row.coverage ?? '—',
            row.subjects ?? '—',
            row.flags ?? '—',
        ]);
        const csv = [headers, ...rows]
            .map((line) => line.map((cell) => escape(cell ?? '')).join(','))
            .join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = 'search-results.csv';
        anchor.click();
        URL.revokeObjectURL(url);
    }
    onImageError(event) {
        const img = event.target;
        if (!img)
            return;
        img.src = FALLBACK_ART_URL;
    }
    /** A result's star confirmed a change: keep the page's view of it in step. */
    onFavoriteChanged(id, favorite) {
        this.favoriteIds.update((current) => {
            const next = new Set(current);
            if (favorite)
                next.add(id);
            else
                next.delete(id);
            return next;
        });
    }
    onFavoriteFailed(error) {
        this.toast.error(this.getApiErrorMessage(error, this.translate.instant('search.message.failed-to-update-favorites')), { duration: 5000 });
    }
    getApiErrorMessage(err, fallback) {
        if (typeof err === 'string' && err.trim().length > 0)
            return err;
        const maybeObj = err;
        const apiMessage = maybeObj?.error?.message;
        if (typeof apiMessage === 'string' && apiMessage.trim().length > 0)
            return apiMessage;
        const defaultMessage = maybeObj?.message;
        if (typeof defaultMessage === 'string' && defaultMessage.trim().length > 0)
            return defaultMessage;
        return fallback;
    }
    isFavorited(id) {
        return this.favoriteIds().has(id);
    }
    downloadDocument(id, name, event) {
        if (event) {
            event.stopPropagation();
        }
        if (!id)
            return;
        const row = this.displayResults().find((r) => r.id === id);
        if (row && !this.isDownloadableType(row.type)) {
            return;
        }
        this.documentDetailService
            .fetchBlob(id, { clientReason: 'download' })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (blob) => {
                const objectUrl = URL.createObjectURL(blob);
                const anchor = document.createElement('a');
                anchor.href = objectUrl;
                anchor.download = this.buildDownloadFileName(name, blob.type);
                anchor.click();
                URL.revokeObjectURL(objectUrl);
            },
            error: (err) => {
                this.toast.error(this.getApiErrorMessage(err, this.translate.instant('search.message.failed-to-download-document')), { duration: 5000 });
            },
        });
    }
    isDownloadableType(type) {
        const normalized = type.trim().toLowerCase();
        return normalized.length > 0 && !NON_CONTENT_DOCUMENT_TYPES.has(normalized);
    }
    buildDownloadFileName(name, mimeType) {
        const trimmed = name.trim() || 'document';
        // Keep existing extension if present.
        if (/\.[a-z0-9]+$/i.test(trimmed))
            return trimmed;
        const extensionByMime = {
            'application/pdf': 'pdf',
            'text/plain': 'txt',
            'text/csv': 'csv',
            'application/json': 'json',
            'application/xml': 'xml',
            'text/xml': 'xml',
            'application/zip': 'zip',
            'application/msword': 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
            'application/vnd.ms-excel': 'xls',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
            'application/vnd.ms-powerpoint': 'ppt',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/gif': 'gif',
            'image/webp': 'webp',
            'video/mp4': 'mp4',
            'audio/mpeg': 'mp3',
        };
        const ext = extensionByMime[mimeType.toLowerCase()];
        return ext ? `${trimmed}.${ext}` : trimmed;
    }
    setGridGroupBy(value) {
        this.gridGroupBy.set(value);
        // Dropdown-triggered sorting should default to ascending.
        this.gridSortOrder.set('asc');
        const apiFieldName = COLUMN_TO_API_FIELD[value] ?? null;
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                sortBy: apiFieldName,
                sortOrder: 'asc',
                page: null,
            },
            queryParamsHandling: 'merge',
        });
    }
    setGridSortOrder(direction) {
        const effectiveDirection = direction === 'asc' ? 'asc' : 'desc';
        this.gridSortOrder.set(effectiveDirection);
        const apiFieldName = COLUMN_TO_API_FIELD[this.gridGroupBy()] ?? null;
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
                sortBy: apiFieldName,
                sortOrder: effectiveDirection,
                page: null,
            },
            queryParamsHandling: 'merge',
        });
    }
    parseQuickFilters(value) {
        const allowed = new Set(QUICK_FILTER_OPTIONS.map((f) => f.value));
        return new Set(value
            .split(',')
            .map((v) => v.trim())
            .filter((v) => allowed.has(v)));
    }
    /** Save the filters as a new saved search, under a name the user gives. */
    onSaveAs() {
        this.withSavedSearchName({ heading: this.translate.instant('ui.saved-search') }, (name) => this.session.saveAs(name).pipe(map(() => name))).subscribe({
            next: (name) => this.toast.show(this.translate.instant('common.search-saved', { name })),
            error: () => this.savedSearchFailed('assets.message.failed-to-save-search'),
        });
    }
    /** Save the filters into the open saved search. */
    onSave() {
        const name = this.selectedSavedSearchTitle().trim();
        this.session
            .save()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: () => this.toast.show(this.translate.instant('common.search-updated', { name })),
            error: () => this.savedSearchFailed('assets.message.failed-to-save-search'),
        });
    }
    /** Rename the open saved search. Its stored filters stay as they are, as in Web UI. */
    onRename() {
        this.withSavedSearchName({
            heading: this.translate.instant('ui.edit-saved-search'),
            initial: this.selectedSavedSearchTitle(),
        }, (name) => this.session.rename(name).pipe(map(() => name))).subscribe({
            next: (name) => this.toast.show(this.translate.instant('common.search-updated', { name })),
            error: () => this.savedSearchFailed('assets.message.failed-to-update-search'),
        });
    }
    onShare() {
        const id = this.selectedSavedSearchId().trim();
        if (!id)
            return;
        this.dialog.open(ShareSavedSearchDialogComponent, {
            width: '95vw',
            maxWidth: '1080px',
            data: {
                title: this.selectedSavedSearchTitle().trim() || this.translate.instant('ui.saved-search'),
                id,
            },
        });
    }
    /** Delete the open saved search, once the user confirms. */
    onDelete() {
        const id = this.selectedSavedSearchId().trim();
        if (!id)
            return;
        const title = this.selectedSavedSearchTitle().trim() || this.translate.instant('ui.saved-search');
        this.dialog
            .open(ConfirmDialogComponent, {
            data: {
                title: this.translate.instant('confirm.delete-saved-search'),
                message: this.translate.instant('confirm.delete-saved-search-named', { name: title }),
                confirmLabel: this.translate.instant('confirm.delete'),
            },
        })
            .afterClosed()
            .pipe(switchMap((confirmed) => (confirmed ? this.session.deleteSavedSearch() : of(null))), takeUntilDestroyed(this.destroyRef))
            .subscribe({
            error: () => this.savedSearchFailed('search.message.failed-to-delete-saved-search'),
        });
    }
    /** Asks for a name, then runs `run` with it; nothing happens when the dialog is dismissed. */
    withSavedSearchName(options, run) {
        return askSavedSearchName(this.dialog, this.translate, options).pipe(switchMap(run), takeUntilDestroyed(this.destroyRef));
    }
    savedSearchFailed(key) {
        this.toast.error(this.translate.instant(key), { duration: 5000 });
    }
    constructor() {
        this.route.queryParamMap
            .pipe(takeUntilDestroyed())
            .subscribe((params) => this.applyPageQuery(params));
        // Each answer's paging, for the pager. Only an answer moves it: a page being loaded does not.
        effect(() => {
            const state = this.resultsState();
            if (state.status !== 'loaded')
                return;
            untracked(() => this.pager.set({
                pageIndex: this.session.pageIndex(),
                itemCount: state.items.length,
                totalSize: state.totalSize,
                hasNextPage: state.hasNextPage,
            }));
        });
        // The page on screen is kept in the URL, so a deep link reopens it. A page the pager or a
        // filter change moved to is written back, replacing the history entry rather than adding one.
        effect(() => {
            const pageIndex = this.session.pageIndex();
            untracked(() => {
                if (pageIndex === this.urlPageIndex)
                    return;
                void this.router.navigate([], {
                    relativeTo: this.route,
                    queryParams: { page: pageIndex > 0 ? pageIndex + 1 : null },
                    queryParamsHandling: 'merge',
                    replaceUrl: true,
                });
            });
        });
        // The favourites enricher says which results are favourites; a star's own change is then kept
        // in `favoriteIds` until the next answer.
        effect(() => {
            const state = this.resultsState();
            if (state.status === 'loading')
                return;
            untracked(() => this.favoriteIds.set(new Set(state.items.filter((item) => item.isFavorite).map((item) => item.id))));
        });
        this.aiSuggestSubject
            .pipe(debounceTime(400), distinctUntilChanged(), switchMap((q) => {
            if (q.length < 3)
                return of({ suggestions: [] });
            return this.aiGateway
                .nlToNxqlSuggestions(q)
                .pipe(catchError(() => of({ suggestions: [] })));
        }), takeUntilDestroyed(this.destroyRef))
            .subscribe((res) => this.aiSuggestions.set(res.suggestions));
    }
    toggleAiSearch() {
        const next = !this.aiSearchMode();
        this.aiSearchMode.set(next);
        if (!next) {
            // Invalidate any in-flight AI request before restoring standard state. Without this a late
            // `nlToNxql` or `nxqlSearch` response re-enabled `aiSearchExecuted` and put AI results back on
            // screen while the UI was already back in standard mode.
            //
            // Via `supersedeAiRequest` rather than a bare increment, because the invalidation alone left
            // `loading` set by a pending `runNxqlQuery` — so leaving AI mode restored the standard results
            // behind a spinner that would never clear.
            this.supersedeAiRequest();
            this.resetAiSearchState();
        }
    }
    onAiQueryInput(value) {
        this.aiQuery.set(value);
        this.aiSuggestSubject.next(value);
    }
    selectAiSuggestion(suggestion) {
        this.aiQuery.set(suggestion);
        this.aiSuggestions.set([]);
        this.executeAiSearch();
    }
    /**
     * Mints a new AI request generation **and** releases the loading state the superseded work owned.
     *
     * The two halves are inseparable, which is why this is a function rather than two lines at each
     * call site. A generation guard makes the superseded callbacks `return` early — so everything they
     * would have cleared on the way out never gets cleared, and the page sits behind a spinner that no
     * longer has a request behind it.
     *
     * I have now made exactly this mistake three times in this PR: `taskLoading` in the tasks page, and
     * both of these call sites. Each time the guard was added and the release was not. Stating it once
     * here is the only version that stops the fourth.
     */
    supersedeAiRequest() {
        const generation = ++this.aiRequestGeneration;
        // Only AI-owned flags. `loading` belongs to the standard pipeline; clearing it here hid the
        // spinner for a standard search that was still running — see `aiNxqlLoading`.
        this.aiNxqlLoading.set(false);
        this.aiLoading.set(false);
        return generation;
    }
    executeAiSearch() {
        const query = this.aiQuery().trim();
        if (!query)
            return;
        // Supersedes any in-flight AI request and releases its loading state: an NXQL request already
        // running had set `loading`, and its callbacks are about to start returning at the guard.
        const generation = this.supersedeAiRequest();
        this.aiLoading.set(true);
        this.aiError.set(null);
        this.aiGeneratedNxql.set('');
        this.aiExplanation.set('');
        this.aiGateway
            .nlToNxql(query)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (res) => {
                if (generation !== this.aiRequestGeneration)
                    return;
                this.aiGeneratedNxql.set(res.nxql);
                this.aiExplanation.set(res.explanation);
                this.showNxqlPanel.set(true);
                this.runNxqlQuery(res.nxql, generation);
            },
            error: (err) => {
                if (generation !== this.aiRequestGeneration)
                    return;
                this.aiError.set(aiErrorMessage(err, this.translate.instant('search.message.ai-search-failed-try-again')));
                this.aiLoading.set(false);
            },
        });
    }
    /**
     * `generation` is minted by the caller so one value covers both AI phases — see
     * {@link aiRequestGeneration}. The standard search path in this file is driven through `switchMap`
     * and cancels its predecessor; this one subscribes imperatively, so it needs the comparison.
     */
    runNxqlQuery(nxql, generation) {
        // `aiNxqlLoading`, not `loading` — this request does not own the standard pipeline's flag.
        this.aiNxqlLoading.set(true);
        this.nuxeoApi
            .nxqlSearch(nxql, 40, {
            properties: 'dublincore,file,common',
            'enrichers.document': 'favorites',
        })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (result) => {
                if (generation !== this.aiRequestGeneration)
                    return;
                const items = (result.entries ?? []).map((doc) => ({
                    id: doc.uid,
                    title: doc.title,
                    type: doc.type,
                    modifiedDate: doc.lastModified ?? '',
                    lastContributor: String(doc.properties?.['dc:lastContributor'] ?? ''),
                    state: doc.state ?? '',
                    version: String(doc.properties?.['uid:major_version'] ?? ''),
                    createdDate: String(doc.properties?.['dc:created'] ?? ''),
                    author: String(doc.properties?.['dc:creator'] ?? ''),
                    authorKey: String(doc.properties?.['dc:creator'] ?? ''),
                    nature: String(doc.properties?.['dc:nature'] ?? ''),
                    coverage: String(doc.properties?.['dc:coverage'] ?? ''),
                    subjects: (doc.properties?.['dc:subjects'] ?? []).join(', '),
                    collection: '',
                    collectionKey: '',
                    tags: [],
                    flags: '',
                    icon: 'description',
                    isFavorite: doc.contextParameters?.favorites?.isFavorite ?? false,
                }));
                this.aiResults.set(items);
                this.aiSearchExecuted.set(true);
                this.aiNxqlLoading.set(false);
                this.aiLoading.set(false);
            },
            error: () => {
                // Guarded too: a stale failure would otherwise replace a newer query's results with an
                // error banner and clear its loading state.
                if (generation !== this.aiRequestGeneration)
                    return;
                this.aiError.set(this.translate.instant('search.message.nxql-query-execution-failed-the-generated-query'));
                this.aiNxqlLoading.set(false);
                this.aiLoading.set(false);
            },
        });
    }
    resetAiSearchState() {
        this.aiQuery.set('');
        this.aiGeneratedNxql.set('');
        this.aiExplanation.set('');
        this.aiSuggestions.set([]);
        this.aiError.set(null);
        this.showNxqlPanel.set(false);
        this.aiResults.set([]);
        this.aiSearchExecuted.set(false);
        this.aiLoading.set(false);
    }
    static ɵfac = function SearchComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || SearchComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: SearchComponent, selectors: [["lib-search"]], features: [i0.ɵɵProvidersFeature([provideNxsToast(), provideNxsThumbnailCache()])], decls: 37, vars: 43, consts: [["aiAutoComplete", "matAutocomplete"], [1, "results-page"], [1, "ai-search-section"], [1, "results-top-actions"], [3, "saveAs", "save", "rename", "share", "remove", "savedSearchId", "dirty", "hasFilters"], [1, "results-toolbar"], [1, "results-summary"], [1, "results-count"], [1, "quick-filters"], ["mat-stroked-button", "", "type", "button", 1, "quick-filter-btn", 3, "active"], [1, "toolbar-actions"], ["mat-icon-button", "", 1, "toolbar-btn", 3, "click", "matTooltip"], ["mat-icon-button", "", 1, "toolbar-btn", "list-view-btn", 3, "click", "matTooltip"], [1, "results-loading"], ["retryable", "", 3, "status", "heading"], [1, "grid-container"], [1, "list-wrapper"], [3, "pageIndex", "pageSize", "itemCount", "totalSize", "hasNextPage"], [1, "ai-search-header"], ["mat-flat-button", "", 1, "ai-toggle-btn", 3, "click"], [1, "ai-sparkle-icon"], ["mat-stroked-button", "", 1, "nxql-toggle-btn"], ["mat-stroked-button", "", 1, "nxql-toggle-btn", 3, "click"], [1, "ai-search-bar"], [1, "ai-search-icon"], ["type", "text", 1, "ai-search-input", 3, "ngModelChange", "keydown.enter", "placeholder", "ngModel", "matAutocomplete"], ["diameter", "20", 1, "ai-search-spinner"], ["mat-icon-button", "", 1, "ai-search-go", 3, "disabled"], [3, "optionSelected"], [3, "value"], [1, "ai-error"], [1, "ai-nxql-panel"], ["mat-icon-button", "", 1, "ai-search-go", 3, "click", "disabled"], [1, "suggestion-icon"], [1, "ai-nxql-explanation"], [1, "ai-nxql-code"], ["mat-stroked-button", "", "type", "button", 1, "quick-filter-btn", 3, "click"], ["diameter", "32", 3, "label"], ["retryable", "", 3, "retry", "status", "heading"], [1, "grid-action-bar"], [1, "grid-actions-left"], [1, "grid-select", 3, "selectionChange", "value"], ["value", "title"], ["value", "created"], ["value", "modified"], ["value", "contributor"], ["value", "state"], ["value", "nature"], ["value", "coverage"], ["mat-icon-button", "", 1, "action-btn", 3, "click", "matTooltip"], [1, "result-grid"], [1, "result-card", 3, "selected"], [1, "results-empty", "results-empty--grid"], [1, "result-card"], [1, "grid-card-checkbox", "col-hover-select"], [3, "change", "click", "checked", "aria-label"], [1, "result-card-thumbnail"], [1, "result-thumbnail-image", 3, "documentId"], [1, "result-icon"], [1, "result-card-body"], [1, "result-head"], ["type", "button", 1, "result-name", 3, "click", "title"], [1, "result-type-pill", 3, "title"], [1, "grid-card-actions", "col-hover-actions"], [3, "changed", "failed", "documentId", "favorite"], ["mat-icon-button", "", 1, "action-btn", 3, "matTooltip"], [1, "action-icon"], [3, "columns", "defaults"], [1, "result-list"], [1, "list-header"], [1, "col-checkbox"], [1, "col-gear"], ["mat-icon-button", "", 1, "gear-btn", 3, "click", "matTooltip"], [1, "list-row", 3, "selected", "grid-template-columns"], [1, "results-empty"], [3, "apply", "dismiss", "columns", "defaults"], ["type", "button", 1, "col-sortable", 3, "col-name"], ["type", "button", 1, "col-sortable", 3, "click"], [1, "sort-icon"], [1, "list-row"], [1, "col-checkbox", "col-hover-select"], [3, "click", "change", "checked", "aria-label"], [1, "col-name"], [1, "row-thumbnail-image", 3, "documentId"], [1, "row-icon"], ["type", "button", 1, "row-name-text", 3, "click", "title"], [1, "list-action-bar"], [1, "list-actions-left"], [1, "list-select", 3, "selectionChange", "value"], [1, "simple-list"], [1, "simple-list-item", 3, "selected"], [1, "simple-list-item"], [1, "simple-list-thumb-wrap"], [1, "simple-list-thumb", 3, "documentId"], [1, "simple-list-icon"], [1, "simple-list-checkbox", "col-hover-select"], [1, "simple-list-body"], [1, "simple-list-header"], ["type", "button", 1, "simple-list-title", 3, "click", "title"], [1, "simple-list-type-badge", 3, "title"], [1, "simple-list-actions", "col-hover-actions"], [3, "pageChange", "pageIndex", "pageSize", "itemCount", "totalSize", "hasNextPage"]], template: function SearchComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 1);
            i0.ɵɵconditionalCreate(1, SearchComponent_Conditional_1_Template, 10, 9, "div", 2);
            i0.ɵɵelementStart(2, "div", 3)(3, "nxs-saved-search-actions", 4);
            i0.ɵɵlistener("saveAs", function SearchComponent_Template_nxs_saved_search_actions_saveAs_3_listener() { return ctx.onSaveAs(); })("save", function SearchComponent_Template_nxs_saved_search_actions_save_3_listener() { return ctx.onSave(); })("rename", function SearchComponent_Template_nxs_saved_search_actions_rename_3_listener() { return ctx.onRename(); })("share", function SearchComponent_Template_nxs_saved_search_actions_share_3_listener() { return ctx.onShare(); })("remove", function SearchComponent_Template_nxs_saved_search_actions_remove_3_listener() { return ctx.onDelete(); });
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(4, "div", 5)(5, "div", 6);
            i0.ɵɵconditionalCreate(6, SearchComponent_Conditional_6_Template, 3, 6, "span", 7);
            i0.ɵɵelementStart(7, "div", 8);
            i0.ɵɵrepeaterCreate(8, SearchComponent_For_9_Template, 3, 5, "button", 9, _forTrack0);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(10, "div", 10)(11, "button", 11);
            i0.ɵɵpipe(12, "translate");
            i0.ɵɵpipe(13, "translate");
            i0.ɵɵlistener("click", function SearchComponent_Template_button_click_11_listener() { return ctx.exportCsv(); });
            i0.ɵɵelementStart(14, "mat-icon");
            i0.ɵɵtext(15, "download");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(16, "button", 11);
            i0.ɵɵpipe(17, "translate");
            i0.ɵɵpipe(18, "translate");
            i0.ɵɵlistener("click", function SearchComponent_Template_button_click_16_listener() { return ctx.setViewMode("grid"); });
            i0.ɵɵelementStart(19, "mat-icon");
            i0.ɵɵtext(20, "grid_view");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(21, "button", 11);
            i0.ɵɵpipe(22, "translate");
            i0.ɵɵpipe(23, "translate");
            i0.ɵɵlistener("click", function SearchComponent_Template_button_click_21_listener() { return ctx.setViewMode("table"); });
            i0.ɵɵelementStart(24, "mat-icon");
            i0.ɵɵtext(25, "view_list");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(26, "button", 12);
            i0.ɵɵpipe(27, "translate");
            i0.ɵɵpipe(28, "translate");
            i0.ɵɵlistener("click", function SearchComponent_Template_button_click_26_listener() { return ctx.setViewMode("list"); });
            i0.ɵɵelementStart(29, "mat-icon");
            i0.ɵɵtext(30, "format_list_bulleted");
            i0.ɵɵelementEnd()()()();
            i0.ɵɵconditionalCreate(31, SearchComponent_Conditional_31_Template, 3, 3, "div", 13)(32, SearchComponent_Conditional_32_Template, 1, 2, "nxs-error-state", 14);
            i0.ɵɵconditionalCreate(33, SearchComponent_Conditional_33_Template, 34, 30, "div", 15);
            i0.ɵɵconditionalCreate(34, SearchComponent_Conditional_34_Template, 16, 10, "div", 16);
            i0.ɵɵconditionalCreate(35, SearchComponent_Conditional_35_Template, 33, 30);
            i0.ɵɵconditionalCreate(36, SearchComponent_Conditional_36_Template, 1, 5, "nxs-pager", 17);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            let tmp_20_0;
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.featureFlags.aiEnabled() ? 1 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("savedSearchId", ctx.selectedSavedSearchId())("dirty", ctx.savedSearchDirty())("hasFilters", ctx.hasFilters());
            i0.ɵɵadvance(3);
            i0.ɵɵconditional(ctx.totalCount() > 0 ? 6 : -1);
            i0.ɵɵadvance(2);
            i0.ɵɵrepeater(ctx.quickFilterOptions);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(12, 27, "search.search.export-csv"));
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(13, 29, "search.search.export-csv"));
            i0.ɵɵadvance(5);
            i0.ɵɵclassProp("active", ctx.viewMode() === "grid");
            i0.ɵɵproperty("matTooltip", ctx.viewMode() !== "grid" ? i0.ɵɵpipeBind1(17, 31, "search.switch-to-grid-view") : "");
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(18, 33, "search.search.grid-view"))("aria-pressed", ctx.viewMode() === "grid");
            i0.ɵɵadvance(5);
            i0.ɵɵclassProp("active", ctx.viewMode() === "table");
            i0.ɵɵproperty("matTooltip", ctx.viewMode() !== "table" ? i0.ɵɵpipeBind1(22, 35, "search.switch-to-table-view") : "");
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(23, 37, "search.search.table-view"))("aria-pressed", ctx.viewMode() === "table");
            i0.ɵɵadvance(5);
            i0.ɵɵclassProp("active", ctx.viewMode() === "list");
            i0.ɵɵproperty("matTooltip", ctx.viewMode() !== "list" ? i0.ɵɵpipeBind1(27, 39, "search.switch-to-list-view") : "");
            i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(28, 41, "search.search.list-view"))("aria-pressed", ctx.viewMode() === "list");
            i0.ɵɵadvance(5);
            i0.ɵɵconditional(ctx.busy() ? 31 : (tmp_20_0 = ctx.resultsError()) ? 32 : -1, tmp_20_0);
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(!ctx.busy() && !ctx.resultsError() && ctx.viewMode() === "grid" ? 33 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(!ctx.busy() && !ctx.resultsError() && ctx.viewMode() === "table" ? 34 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(!ctx.busy() && !ctx.resultsError() && ctx.viewMode() === "list" ? 35 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(!ctx.resultsError() && !(ctx.aiSearchMode() && ctx.aiSearchExecuted()) ? 36 : -1);
        } }, dependencies: [NxsColumnPickerComponent,
            NxsErrorStateComponent,
            NxsFavoriteToggleComponent,
            NxsPagerComponent,
            NxsSavedSearchActionsComponent,
            NxsSpinnerComponent,
            NxsThumbnailComponent,
            MatButtonModule, i1.MatButton, i1.MatIconButton, MatIconModule, i2.MatIcon, MatTooltipModule, i3.MatTooltip, MatCheckboxModule, i4.MatCheckbox, MatProgressSpinnerModule, i5.MatProgressSpinner, MatSelectModule, i6.MatSelect, i6.MatOption, MatMenuModule,
            MatAutocompleteModule, i7.MatAutocomplete, i7.MatAutocompleteTrigger, FormsModule, i8.DefaultValueAccessor, i8.NgControlStatus, i8.NgModel, DocTypeLabelPipe,
            DescriptorLabelPipe,
            TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: block;\n  height: 100%;\n}\n\n.ai-search-section[_ngcontent-%COMP%] {\n  margin-bottom: 12px;\n  flex-shrink: 0;\n}\n\n.ai-search-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin-bottom: 8px;\n}\n\n.ai-toggle-btn[_ngcontent-%COMP%] {\n  border-radius: 20px;\n  font-size: 13px;\n  font-weight: 500;\n  background: var(--mat-sys-surface-container, #f5f6fa);\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n  border: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  transition: all 0.2s ease;\n\n  &.active {\n    background: linear-gradient(135deg, #7c4dff 0%, #448aff 100%);\n    color: #fff;\n    border-color: transparent;\n  }\n\n  .ai-sparkle-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n    margin-right: 4px;\n  }\n}\n\n.nxql-toggle-btn[_ngcontent-%COMP%] {\n  font-size: 12px;\n  height: 32px;\n  border-radius: 16px;\n}\n\n.ai-search-bar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 8px 14px;\n  border-radius: 12px;\n  border: 2px solid transparent;\n  background: var(--mat-sys-surface-container, #f5f6fa);\n  transition:\n    border-color 0.2s ease,\n    box-shadow 0.2s ease;\n\n  &:focus-within {\n    border-color: #7c4dff;\n    box-shadow: 0 0 0 3px rgba(124, 77, 255, 0.12);\n  }\n}\n\n.ai-search-icon[_ngcontent-%COMP%] {\n  color: #7c4dff;\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n  flex-shrink: 0;\n}\n\n.ai-search-input[_ngcontent-%COMP%] {\n  flex: 1;\n  border: none;\n  outline: none;\n  background: transparent;\n  font-size: 14px;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  font-family: inherit;\n\n  &::placeholder {\n    color: var(--mat-sys-on-surface-variant, #7a7d87);\n  }\n}\n\n.ai-search-spinner[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n}\n\n.ai-search-go[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n  color: #7c4dff;\n  width: 32px;\n  height: 32px;\n}\n\n.suggestion-icon[_ngcontent-%COMP%] {\n  font-size: 16px;\n  width: 16px;\n  height: 16px;\n  color: #7c4dff;\n  margin-right: 6px;\n}\n\n.ai-error[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  margin-top: 8px;\n  padding: 8px 12px;\n  border-radius: 8px;\n  background: #fdecea;\n  color: #d32f2f;\n  font-size: 13px;\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n  }\n}\n\n.ai-nxql-panel[_ngcontent-%COMP%] {\n  margin-top: 8px;\n  border-radius: 8px;\n  border: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  overflow: hidden;\n}\n\n.ai-nxql-explanation[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  gap: 8px;\n  padding: 10px 14px;\n  background: var(--mat-sys-surface-container-low, #f8f9fc);\n  font-size: 13px;\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n    color: #7c4dff;\n    flex-shrink: 0;\n    margin-top: 1px;\n  }\n}\n\n.ai-nxql-code[_ngcontent-%COMP%] {\n  margin: 0;\n  padding: 12px 14px;\n  background: #1e1e2e;\n  color: #cdd6f4;\n  font-family: 'Fira Code', 'Cascadia Code', monospace;\n  font-size: 12px;\n  line-height: 1.5;\n  white-space: pre-wrap;\n  word-break: break-all;\n  overflow-x: auto;\n}\n\n.results-page[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  padding: 16px 24px;\n  box-sizing: border-box;\n}\n\n.results-top-actions[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-end;\n  align-items: center;\n  gap: 8px;\n  margin-bottom: 8px;\n  flex-shrink: 0;\n}\n\n.results-toolbar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 16px;\n  flex-shrink: 0;\n}\n\n.results-count[_ngcontent-%COMP%] {\n  font-size: 15px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface);\n}\n\n.results-summary[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  min-width: 0;\n}\n\n.quick-filters[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-wrap: wrap;\n}\n\n.quick-filter-btn[_ngcontent-%COMP%] {\n  height: 30px;\n  padding-inline: 10px;\n  border-color: var(--mat-sys-outline-variant, #d8dbe2);\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n\n  &.active {\n    border-color: var(--mat-sys-primary, #5c6bc0);\n    color: var(--mat-sys-primary, #5c6bc0);\n    background: var(--mat-sys-primary-container, #e8def8);\n  }\n}\n\n.toolbar-actions[_ngcontent-%COMP%] {\n  display: flex;\n  margin-left: auto;\n  align-items: center;\n  gap: 4px;\n}\n\n.list-view-btn[_ngcontent-%COMP%] {\n  margin-left: 6px;\n}\n\n.toolbar-btn[_ngcontent-%COMP%] {\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n  width: 36px;\n  height: 36px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-high, #eef0f4);\n  }\n\n  &.active {\n    color: var(--mat-sys-primary, #5c6bc0);\n    background: var(--mat-sys-primary-container, #e8def8);\n    border-radius: 8px;\n  }\n}\n\n.results-loading[_ngcontent-%COMP%], \n.results-error[_ngcontent-%COMP%] {\n  flex: 1;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.results-error[_ngcontent-%COMP%] {\n  color: #d32f2f;\n  font-size: 14px;\n}\n\n.result-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));\n  align-content: start;\n  gap: 16px;\n  overflow-y: auto;\n  flex: 1;\n  min-height: 0;\n  padding-bottom: 16px;\n}\n\n.grid-action-bar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: flex-start;\n  padding: 12px 0;\n  margin-bottom: 12px;\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n}\n\n.grid-actions-left[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n\n.grid-select[_ngcontent-%COMP%] {\n  min-width: 200px;\n  font-size: 14px;\n}\n\n.grid-select-all[_ngcontent-%COMP%] {\n  margin-right: 4px;\n}\n\n.list-action-bar[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: flex-start;\n  padding: 12px 0;\n  margin-bottom: 12px;\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n}\n\n.list-actions-left[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n\n.list-select[_ngcontent-%COMP%] {\n  min-width: 200px;\n  font-size: 14px;\n}\n\n.list-select-all[_ngcontent-%COMP%] {\n  margin-right: 4px;\n}\n\n.grid-container[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  overflow: hidden;\n  min-width: 0;\n  min-height: 0;\n  gap: 12px;\n}\n\n.result-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));\n  align-content: start;\n  gap: 16px;\n  overflow-y: auto;\n  flex: 1;\n  min-height: 0;\n  padding-bottom: 16px;\n}\n\n.result-card[_ngcontent-%COMP%] {\n  border: 1px solid #e0e0e0;\n  border-radius: 8px;\n  background: #fff;\n  cursor: pointer;\n  font: inherit;\n  text-align: left;\n  width: 100%;\n  transition:\n    box-shadow 0.15s ease,\n    background-color 0.15s ease;\n  position: relative;\n  display: flex;\n  flex-direction: column;\n\n  &:hover {\n    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);\n\n    .grid-card-actions {\n      opacity: 1;\n      visibility: visible;\n    }\n\n    .grid-card-checkbox {\n      opacity: 1;\n      visibility: visible;\n    }\n  }\n\n  &.selected {\n    background: var(--mat-sys-primary-container, #e8def8);\n    border-color: var(--mat-sys-primary, #5c6bc0);\n\n    .grid-card-checkbox {\n      opacity: 1;\n      visibility: visible;\n    }\n  }\n}\n\n.grid-card-checkbox[_ngcontent-%COMP%] {\n  position: absolute;\n  top: 8px;\n  left: 8px;\n  opacity: 0;\n  visibility: hidden;\n  transition:\n    opacity 0.2s ease,\n    visibility 0.2s ease;\n  z-index: 2;\n\n  mat-checkbox {\n    display: flex;\n    align-items: center;\n    justify-content: center;\n  }\n}\n\n.result-card-thumbnail[_ngcontent-%COMP%] {\n  position: relative;\n  height: 120px;\n  background: #f5f5f5;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 8px 8px 0 0;\n  overflow: hidden;\n  flex-shrink: 0;\n  padding: 8px;\n}\n\n.result-icon[_ngcontent-%COMP%] {\n  font-size: 40px;\n  width: 40px;\n  height: 40px;\n  line-height: 1;\n  display: block;\n  color: #bdbdbd;\n}\n\n.result-thumbnail-image[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n\n.result-card-body[_ngcontent-%COMP%] {\n  padding: 12px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  min-height: 0;\n  overflow: hidden;\n}\n\n.result-head[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  gap: 6px;\n  min-width: 0;\n}\n\n.grid-card-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 4px;\n  opacity: 0;\n  visibility: hidden;\n  transition:\n    opacity 0.2s ease,\n    visibility 0.2s ease;\n  justify-content: flex-end;\n  padding-top: 8px;\n}\n\n.result-name[_ngcontent-%COMP%] {\n  \n\n\n\n  appearance: none;\n  border: 0;\n  background: none;\n  padding: 0;\n  font: inherit;\n  color: inherit;\n  text-align: left;\n  cursor: pointer;\n  flex: 1;\n  min-width: 0;\n  font-size: 13px;\n  font-weight: 500;\n  color: var(--mat-sys-on-surface);\n  margin: 0;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.result-type-pill[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  padding: 2px 8px;\n  border-radius: 999px;\n  background: var(--mat-sys-surface-container-high, #eef0f4);\n  border: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n  font-size: 11px;\n  font-weight: 600;\n  line-height: 1;\n  max-width: 120px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  flex-shrink: 0;\n}\n\n.list-wrapper[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  position: relative;\n  flex: 1;\n  min-height: 0;\n  overflow: hidden;\n  padding-bottom: 24px;\n}\n\n.result-list[_ngcontent-%COMP%] {\n  flex: 1;\n  min-height: 0;\n  overflow: auto;\n  border: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  border-radius: 8px;\n\n  &:not(:has(.list-row)) {\n    border: none;\n    border-radius: 0;\n  }\n}\n\n.list-header[_ngcontent-%COMP%] {\n  display: grid;\n  padding: 10px 16px;\n  background: var(--mat-sys-surface-container, #f5f6fa);\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  font-size: 12px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n  letter-spacing: 0.4px;\n  position: sticky;\n  top: 0;\n  z-index: 10;\n  isolation: isolate;\n}\n\n.list-row[_ngcontent-%COMP%] {\n  display: grid;\n  padding: 10px 16px;\n  border: none;\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #eceef3);\n  background: none;\n  font: inherit;\n  text-align: left;\n  width: 100%;\n  align-items: center;\n  font-size: 13px;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  position: relative;\n  transition: background-color 0.15s ease;\n  cursor: pointer;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-high, #eef0f4);\n\n    .col-hover-actions {\n      opacity: 1;\n      visibility: visible;\n    }\n\n    .col-hover-select {\n      visibility: visible;\n    }\n  }\n\n  &.selected {\n    background: var(--mat-sys-primary-container, #e8def8);\n\n    &:hover {\n      background: var(--mat-sys-surface-container-high, #eef0f4);\n    }\n  }\n}\n\n.col-name[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  min-width: 0;\n}\n\n.row-icon[_ngcontent-%COMP%] {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n  flex-shrink: 0;\n}\n\n.row-name-text[_ngcontent-%COMP%] {\n  \n\n\n\n  appearance: none;\n  border: 0;\n  background: none;\n  padding: 0;\n  font: inherit;\n  color: inherit;\n  text-align: left;\n  cursor: pointer;\n  flex: 1;\n  min-width: 0;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  cursor: pointer;\n}\n\n.row-thumbnail-image[_ngcontent-%COMP%] {\n  width: 20px;\n  height: 20px;\n  object-fit: cover;\n  border-radius: 4px;\n  flex-shrink: 0;\n}\n\n.col-checkbox[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n}\n\n.col-gear[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n}\n\n.col-header-text[_ngcontent-%COMP%] {\n  font-size: 12px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n  letter-spacing: 0.4px;\n}\n\n.col-actions[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n  gap: 4px;\n  opacity: 0;\n  visibility: hidden;\n  transition:\n    opacity 0.2s ease,\n    visibility 0.2s ease;\n}\n\n.action-btn[_ngcontent-%COMP%] {\n  width: 32px;\n  height: 32px;\n  line-height: 32px;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n  padding: 0;\n\n  &:hover {\n    color: var(--mat-sys-primary, #5c6bc0);\n    background: var(--mat-sys-surface-container-high, #eef0f4);\n  }\n}\n\n.action-icon[_ngcontent-%COMP%] {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n}\n\n.gear-btn[_ngcontent-%COMP%] {\n  width: 32px;\n  height: 32px;\n  line-height: 32px;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n\n  &:hover {\n    color: var(--mat-sys-primary, #5c6bc0);\n  }\n}\n\n.col-sortable[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  cursor: pointer;\n  user-select: none;\n  white-space: nowrap;\n  border: none;\n  background: none;\n  font: inherit;\n  padding: 0;\n  color: inherit;\n\n  &:hover {\n    color: var(--mat-sys-primary, #5c6bc0);\n\n    .sort-icon {\n      opacity: 1;\n    }\n  }\n}\n\n.sort-icon[_ngcontent-%COMP%] {\n  font-size: 14px;\n  width: 14px;\n  height: 14px;\n  opacity: 0;\n  transition: opacity 0.15s ease;\n  color: var(--mat-sys-on-surface-variant, #8a8d98);\n\n  &.sort-active {\n    opacity: 1;\n    color: var(--mat-sys-primary, #5c6bc0);\n  }\n}\n\n.results-empty[_ngcontent-%COMP%] {\n  padding: 32px 16px;\n  text-align: center;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n  font-size: 14px;\n}\n\n.results-empty--grid[_ngcontent-%COMP%] {\n  grid-column: 1 / -1;\n  min-height: 220px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.simple-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  overflow-y: auto;\n  padding: 4px 0 16px;\n}\n\n.simple-list-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 14px;\n  padding: 12px 14px;\n  border: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  border-radius: 8px;\n  background: #fff;\n  font: inherit;\n  text-align: left;\n  width: 100%;\n  position: relative;\n  transition: background 0.2s ease;\n  min-height: 92px;\n  cursor: pointer;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-low, #f8f9fc);\n\n    .col-hover-actions {\n      opacity: 1;\n      visibility: visible;\n    }\n\n    .simple-list-checkbox {\n      opacity: 1;\n      visibility: visible;\n    }\n  }\n\n  &.selected {\n    background: var(--mat-sys-primary-container, #e8def8);\n\n    .simple-list-checkbox {\n      opacity: 1;\n      visibility: visible;\n    }\n  }\n}\n\n.simple-list-checkbox[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  position: absolute;\n  top: 4px;\n  left: 4px;\n  z-index: 1;\n  opacity: 0;\n  visibility: hidden;\n  transition:\n    opacity 0.2s ease,\n    visibility 0.2s ease;\n}\n\n.simple-list-thumb[_ngcontent-%COMP%] {\n  width: 76px;\n  height: 76px;\n  object-fit: cover;\n  border-radius: 6px;\n  flex-shrink: 0;\n}\n\n.simple-list-icon[_ngcontent-%COMP%] {\n  font-size: 32px;\n  width: 32px;\n  height: 32px;\n  color: #bdbdbd;\n}\n\n.simple-list-body[_ngcontent-%COMP%] {\n  min-width: 0;\n  display: flex;\n  flex-direction: column;\n  justify-content: space-between;\n  height: 76px;\n  flex: 1;\n}\n.simple-list-thumb-wrap[_ngcontent-%COMP%] {\n  position: relative;\n  width: 76px;\n  height: 76px;\n  flex-shrink: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: #f5f5f5;\n  border-radius: 6px;\n}\n\n.simple-list-title[_ngcontent-%COMP%] {\n  \n\n\n\n  appearance: none;\n  border: 0;\n  background: none;\n  padding: 0;\n  font: inherit;\n  color: inherit;\n  text-align: left;\n  cursor: pointer;\n  margin: 0;\n  font-size: 14px;\n  font-weight: 600;\n  line-height: 1.2;\n  flex: 1;\n  min-width: 0;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.simple-list-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n  min-width: 0;\n}\n\n.simple-list-type-badge[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  padding: 2px 8px;\n  border-radius: 999px;\n  background: var(--mat-sys-surface-container-high, #eef0f4);\n  border: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n  font-size: 11px;\n  font-weight: 600;\n  line-height: 1;\n  max-width: 120px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  flex-shrink: 0;\n}\n\n.simple-list-actions[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: flex-start;\n  gap: 4px;\n  opacity: 0;\n  visibility: hidden;\n  transition:\n    opacity 0.2s ease,\n    visibility 0.2s ease;\n  flex-shrink: 0;\n}\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n.result-name[_ngcontent-%COMP%], \n.row-name-text[_ngcontent-%COMP%], \n.simple-list-title[_ngcontent-%COMP%] {\n  &::after {\n    content: '';\n    position: absolute;\n    inset: 0;\n    z-index: 0;\n  }\n}\n\n\n\n\n.grid-card-checkbox[_ngcontent-%COMP%], \n.simple-list-checkbox[_ngcontent-%COMP%], \n.col-checkbox[_ngcontent-%COMP%], \n.grid-card-actions[_ngcontent-%COMP%], \n.simple-list-actions[_ngcontent-%COMP%], \n.col-hover-actions[_ngcontent-%COMP%], \n.col-gear[_ngcontent-%COMP%], \n.action-btn[_ngcontent-%COMP%] {\n  position: relative;\n  z-index: 1;\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(SearchComponent, [{
        type: Component,
        args: [{ selector: 'lib-search', standalone: true, imports: [
                    NxsColumnPickerComponent,
                    NxsErrorStateComponent,
                    NxsFavoriteToggleComponent,
                    NxsPagerComponent,
                    NxsSavedSearchActionsComponent,
                    NxsSpinnerComponent,
                    NxsThumbnailComponent,
                    DocTypeLabelPipe,
                    DescriptorLabelPipe,
                    TranslatePipe,
                    MatButtonModule,
                    MatIconModule,
                    MatTooltipModule,
                    MatCheckboxModule,
                    MatProgressSpinnerModule,
                    MatSelectModule,
                    MatMenuModule,
                    MatAutocompleteModule,
                    FormsModule,
                ], providers: [provideNxsToast(), provideNxsThumbnailCache()], template: "<div class=\"results-page\">\n  <!-- AI Search Bar -->\n  @if (featureFlags.aiEnabled()) {\n    <div class=\"ai-search-section\">\n      <div class=\"ai-search-header\">\n        <button\n          mat-flat-button\n          class=\"ai-toggle-btn\"\n          [class.active]=\"aiSearchMode()\"\n          (click)=\"toggleAiSearch()\"\n        >\n          <mat-icon class=\"ai-sparkle-icon\">auto_awesome</mat-icon>\n          {{\n            aiSearchMode()\n              ? ('search.ai-search-active' | translate)\n              : ('search.ai-search' | translate)\n          }}\n        </button>\n        @if (aiSearchMode() && aiGeneratedNxql()) {\n          <button\n            mat-stroked-button\n            class=\"nxql-toggle-btn\"\n            (click)=\"showNxqlPanel.set(!showNxqlPanel())\"\n          >\n            <mat-icon>code</mat-icon>\n            {{\n              showNxqlPanel()\n                ? ('search.hide-query' | translate)\n                : ('search.view-query' | translate)\n            }}\n          </button>\n        }\n      </div>\n\n      @if (aiSearchMode()) {\n        <div class=\"ai-search-bar\">\n          <mat-icon class=\"ai-search-icon\">auto_awesome</mat-icon>\n          <input\n            class=\"ai-search-input\"\n            type=\"text\"\n            [placeholder]=\"'search.search.ask-in-natural-language-e-g' | translate\"\n            [ngModel]=\"aiQuery()\"\n            (ngModelChange)=\"onAiQueryInput($event)\"\n            (keydown.enter)=\"executeAiSearch()\"\n            [matAutocomplete]=\"aiAutoComplete\"\n          />\n          @if (aiLoading()) {\n            <mat-spinner\n              diameter=\"20\"\n              class=\"ai-search-spinner\"\n              [attr.aria-label]=\"'search.search.loading' | translate\"\n            ></mat-spinner>\n          } @else {\n            <button\n              mat-icon-button\n              class=\"ai-search-go\"\n              [attr.aria-label]=\"'search.search.run-ai-search' | translate\"\n              (click)=\"executeAiSearch()\"\n              [disabled]=\"!aiQuery().trim()\"\n            >\n              <mat-icon>send</mat-icon>\n            </button>\n          }\n          <mat-autocomplete\n            #aiAutoComplete=\"matAutocomplete\"\n            (optionSelected)=\"selectAiSuggestion($event.option.value)\"\n          >\n            @for (suggestion of aiSuggestions(); track suggestion) {\n              <mat-option [value]=\"suggestion\">\n                <mat-icon class=\"suggestion-icon\">auto_awesome</mat-icon>\n                {{ suggestion }}\n              </mat-option>\n            }\n          </mat-autocomplete>\n        </div>\n\n        @if (aiError()) {\n          <div class=\"ai-error\">\n            <mat-icon>error_outline</mat-icon>\n            {{ aiError() }}\n          </div>\n        }\n\n        @if (showNxqlPanel() && aiGeneratedNxql()) {\n          <div class=\"ai-nxql-panel\">\n            <div class=\"ai-nxql-explanation\">\n              <mat-icon>info_outline</mat-icon>\n              <span>{{ aiExplanation() }}</span>\n            </div>\n            <pre class=\"ai-nxql-code\">{{ aiGeneratedNxql() }}</pre>\n          </div>\n        }\n      }\n    </div>\n  }\n\n  <div class=\"results-top-actions\">\n    <nxs-saved-search-actions\n      [savedSearchId]=\"selectedSavedSearchId()\"\n      [dirty]=\"savedSearchDirty()\"\n      [hasFilters]=\"hasFilters()\"\n      (saveAs)=\"onSaveAs()\"\n      (save)=\"onSave()\"\n      (rename)=\"onRename()\"\n      (share)=\"onShare()\"\n      (remove)=\"onDelete()\"\n    />\n  </div>\n\n  <div class=\"results-toolbar\">\n    <div class=\"results-summary\">\n      @if (totalCount() > 0) {\n        <span class=\"results-count\">{{\n          (totalCount() === 1 ? 'common.count.result-one' : 'common.count.result-many')\n            | translate: { count: totalCount() }\n        }}</span>\n      }\n\n      <div class=\"quick-filters\">\n        @for (filter of quickFilterOptions; track filter.value) {\n          <button\n            mat-stroked-button\n            type=\"button\"\n            class=\"quick-filter-btn\"\n            [class.active]=\"isQuickFilterSelected(filter.value)\"\n            (click)=\"toggleQuickFilter(filter.value)\"\n          >\n            {{ filter | descriptorLabel }}\n          </button>\n        }\n      </div>\n    </div>\n\n    <div class=\"toolbar-actions\">\n      <button\n        mat-icon-button\n        [matTooltip]=\"'search.search.export-csv' | translate\"\n        [attr.aria-label]=\"'search.search.export-csv' | translate\"\n        (click)=\"exportCsv()\"\n        class=\"toolbar-btn\"\n      >\n        <mat-icon>download</mat-icon>\n      </button>\n\n      <!--\n        The label is static and the *state* is carried by `aria-pressed`, rather than folding\n        both into a conditional tooltip. The tooltip below is deliberately empty for the active\n        view \u2014 sensible for a sighted user, but as an accessible name it left the selected\n        button with no name at all, which is the `button-name` violation this fixes.\n      -->\n      <button\n        mat-icon-button\n        [class.active]=\"viewMode() === 'grid'\"\n        [matTooltip]=\"viewMode() !== 'grid' ? ('search.switch-to-grid-view' | translate) : ''\"\n        [attr.aria-label]=\"'search.search.grid-view' | translate\"\n        [attr.aria-pressed]=\"viewMode() === 'grid'\"\n        (click)=\"setViewMode('grid')\"\n        class=\"toolbar-btn\"\n      >\n        <mat-icon>grid_view</mat-icon>\n      </button>\n\n      <button\n        mat-icon-button\n        [class.active]=\"viewMode() === 'table'\"\n        [matTooltip]=\"viewMode() !== 'table' ? ('search.switch-to-table-view' | translate) : ''\"\n        [attr.aria-label]=\"'search.search.table-view' | translate\"\n        [attr.aria-pressed]=\"viewMode() === 'table'\"\n        (click)=\"setViewMode('table')\"\n        class=\"toolbar-btn\"\n      >\n        <mat-icon>view_list</mat-icon>\n      </button>\n\n      <button\n        mat-icon-button\n        class=\"toolbar-btn list-view-btn\"\n        [class.active]=\"viewMode() === 'list'\"\n        [matTooltip]=\"viewMode() !== 'list' ? ('search.switch-to-list-view' | translate) : ''\"\n        [attr.aria-label]=\"'search.search.list-view' | translate\"\n        [attr.aria-pressed]=\"viewMode() === 'list'\"\n        (click)=\"setViewMode('list')\"\n      >\n        <mat-icon>format_list_bulleted</mat-icon>\n      </button>\n    </div>\n  </div>\n\n  @if (busy()) {\n    <div class=\"results-loading\">\n      <nxs-spinner diameter=\"32\" [label]=\"'search.search.loading' | translate\" />\n    </div>\n  } @else if (resultsError(); as message) {\n    <nxs-error-state\n      [status]=\"errorStatus()\"\n      [heading]=\"message\"\n      retryable\n      (retry)=\"retrySearch()\"\n    />\n  }\n\n  @if (!busy() && !resultsError() && viewMode() === 'grid') {\n    <div class=\"grid-container\">\n      <div class=\"grid-action-bar\">\n        <div class=\"grid-actions-left\">\n          <mat-select\n            [value]=\"gridGroupBy()\"\n            (selectionChange)=\"setGridGroupBy($event.value)\"\n            class=\"grid-select\"\n          >\n            <mat-option value=\"title\">{{ 'search.search.title' | translate }}</mat-option>\n            <mat-option value=\"created\">{{ 'search.search.created' | translate }}</mat-option>\n            <mat-option value=\"modified\">{{ 'search.search.modified' | translate }}</mat-option>\n            <mat-option value=\"contributor\">{{\n              'search.search.last-contributor' | translate\n            }}</mat-option>\n            <mat-option value=\"state\">{{ 'search.search.state' | translate }}</mat-option>\n            <mat-option value=\"nature\">{{ 'search.search.nature' | translate }}</mat-option>\n            <mat-option value=\"coverage\">{{ 'search.search.coverage' | translate }}</mat-option>\n          </mat-select>\n\n          <button\n            mat-icon-button\n            [matTooltip]=\"'search.search.revert-sort-order' | translate\"\n            [attr.aria-label]=\"'search.search.revert-sort-order' | translate\"\n            (click)=\"setGridSortOrder(gridSortOrder() === 'asc' ? 'desc' : 'asc')\"\n            class=\"action-btn\"\n          >\n            <mat-icon>{{ gridSortOrder() === 'asc' ? 'arrow_upward' : 'arrow_downward' }}</mat-icon>\n          </button>\n        </div>\n      </div>\n\n      <div class=\"result-grid\">\n        @for (row of displayResults(); track row.id) {\n          <div class=\"result-card\" [class.selected]=\"isSelected(row.id)\">\n            <div class=\"grid-card-checkbox col-hover-select\">\n              <mat-checkbox\n                [checked]=\"isSelected(row.id)\"\n                [aria-label]=\"'common.select-item' | translate: { name: row.name }\"\n                (change)=\"toggleSelection(row.id)\"\n                (click)=\"$event.stopPropagation()\"\n              ></mat-checkbox>\n            </div>\n            <div class=\"result-card-thumbnail\">\n              <nxs-thumbnail class=\"result-thumbnail-image\" [documentId]=\"row.id\">\n                <mat-icon class=\"result-icon\">{{ row.icon }}</mat-icon>\n              </nxs-thumbnail>\n            </div>\n            <div class=\"result-card-body\">\n              <div class=\"result-head\">\n                <button\n                  type=\"button\"\n                  class=\"result-name\"\n                  [title]=\"row.name\"\n                  (click)=\"openDocument(row.id); $event.stopPropagation()\"\n                >\n                  {{ row.name }}\n                </button>\n                <span class=\"result-type-pill\" [title]=\"row.type | docTypeLabel\">{{\n                  row.type | docTypeLabel\n                }}</span>\n              </div>\n              <div class=\"grid-card-actions col-hover-actions\">\n                <nxs-favorite-toggle\n                  [documentId]=\"row.id\"\n                  [favorite]=\"isFavorited(row.id)\"\n                  (changed)=\"onFavoriteChanged(row.id, $event)\"\n                  (failed)=\"onFavoriteFailed($event)\"\n                />\n                @if (isDownloadableType(row.type)) {\n                  <button\n                    mat-icon-button\n                    [matTooltip]=\"'search.search.download' | translate\"\n                    [attr.aria-label]=\"'search.search.download' | translate\"\n                    class=\"action-btn\"\n                    (click)=\"downloadDocument(row.id, row.name, $event)\"\n                  >\n                    <mat-icon class=\"action-icon\">download</mat-icon>\n                  </button>\n                }\n              </div>\n            </div>\n          </div>\n        }\n\n        @if (resultCount() === 0) {\n          <div class=\"results-empty results-empty--grid\">\n            {{ 'search.search.no-documents-match-the-search-criteria' | translate }}\n          </div>\n        }\n      </div>\n    </div>\n  }\n\n  @if (!busy() && !resultsError() && viewMode() === 'table') {\n    <div class=\"list-wrapper\">\n      @if (columnPanelOpen()) {\n        <nxs-column-picker\n          [columns]=\"pickerColumns()\"\n          [defaults]=\"defaultColumnKeys\"\n          (apply)=\"applyColumns($event)\"\n          (dismiss)=\"closeColumnPanel()\"\n        />\n      }\n\n      <div class=\"result-list\">\n        <div class=\"list-header\" [style.grid-template-columns]=\"gridTemplate()\">\n          <span class=\"col-checkbox\"></span>\n          @for (col of visibleColumns(); track col.key) {\n            @if (SORTABLE_COLUMNS.has(col.key)) {\n              <button\n                type=\"button\"\n                [class.col-name]=\"col.key === 'name'\"\n                class=\"col-sortable\"\n                (click)=\"sortBy(col.key)\"\n              >\n                {{ col | descriptorLabel }}\n                <mat-icon class=\"sort-icon\" [class.sort-active]=\"sortColumn() === col.key\">\n                  {{\n                    sortColumn() === col.key && sortDirection() === 'desc'\n                      ? 'arrow_downward'\n                      : 'arrow_upward'\n                  }}\n                </mat-icon>\n              </button>\n            } @else {\n              <span>{{ col | descriptorLabel }}</span>\n            }\n          }\n          <span class=\"col-gear\">\n            <button\n              mat-icon-button\n              class=\"gear-btn\"\n              [matTooltip]=\"'search.search.manage-columns' | translate\"\n              [attr.aria-label]=\"'search.search.manage-columns' | translate\"\n              (click)=\"openColumnPanel()\"\n            >\n              <mat-icon>tune</mat-icon>\n            </button>\n          </span>\n        </div>\n\n        @for (row of sortedResults(); track row.id) {\n          <div\n            class=\"list-row\"\n            [class.selected]=\"isSelected(row.id)\"\n            [style.grid-template-columns]=\"gridTemplate()\"\n          >\n            <span class=\"col-checkbox col-hover-select\">\n              <mat-checkbox\n                [checked]=\"isSelected(row.id)\"\n                [aria-label]=\"'common.select-item' | translate: { name: row.name }\"\n                (click)=\"$event.stopPropagation()\"\n                (change)=\"toggleSelection(row.id)\"\n              ></mat-checkbox>\n            </span>\n            @for (col of visibleColumns(); track col.key) {\n              @if (col.key === 'name') {\n                <span class=\"col-name\">\n                  <nxs-thumbnail class=\"row-thumbnail-image\" [documentId]=\"row.id\">\n                    <mat-icon class=\"row-icon\">{{ row.icon }}</mat-icon>\n                  </nxs-thumbnail>\n                  <button\n                    type=\"button\"\n                    class=\"row-name-text\"\n                    [title]=\"row.name\"\n                    (click)=\"openDocument(row.id); $event.stopPropagation()\"\n                  >\n                    {{ row.name }}\n                  </button>\n                </span>\n              } @else if (col.key === 'type') {\n                <span>{{ row.type | docTypeLabel }}</span>\n              } @else {\n                <span>{{ getCellValue(row, col.key) }}</span>\n              }\n            }\n            <span class=\"col-gear\"></span>\n          </div>\n        }\n\n        @if (resultCount() === 0) {\n          <div class=\"results-empty\">\n            {{ 'search.search.no-documents-match-the-search-criteria' | translate }}\n          </div>\n        }\n      </div>\n    </div>\n  }\n\n  @if (!busy() && !resultsError() && viewMode() === 'list') {\n    <div class=\"list-action-bar\">\n      <div class=\"list-actions-left\">\n        <mat-select\n          [value]=\"gridGroupBy()\"\n          (selectionChange)=\"setGridGroupBy($event.value)\"\n          class=\"list-select\"\n        >\n          <mat-option value=\"title\">{{ 'search.search.title' | translate }}</mat-option>\n          <mat-option value=\"created\">{{ 'search.search.created' | translate }}</mat-option>\n          <mat-option value=\"modified\">{{ 'search.search.modified' | translate }}</mat-option>\n          <mat-option value=\"contributor\">{{\n            'search.search.last-contributor' | translate\n          }}</mat-option>\n          <mat-option value=\"state\">{{ 'search.search.state' | translate }}</mat-option>\n          <mat-option value=\"nature\">{{ 'search.search.nature' | translate }}</mat-option>\n          <mat-option value=\"coverage\">{{ 'search.search.coverage' | translate }}</mat-option>\n        </mat-select>\n\n        <button\n          mat-icon-button\n          [matTooltip]=\"'search.search.revert-sort-order' | translate\"\n          [attr.aria-label]=\"'search.search.revert-sort-order' | translate\"\n          (click)=\"setGridSortOrder(gridSortOrder() === 'asc' ? 'desc' : 'asc')\"\n          class=\"action-btn\"\n        >\n          <mat-icon>{{ gridSortOrder() === 'asc' ? 'arrow_upward' : 'arrow_downward' }}</mat-icon>\n        </button>\n      </div>\n    </div>\n\n    <div class=\"simple-list\">\n      @for (row of displayResults(); track row.id) {\n        <div class=\"simple-list-item\" [class.selected]=\"isSelected(row.id)\">\n          <div class=\"simple-list-thumb-wrap\">\n            <nxs-thumbnail class=\"simple-list-thumb\" [documentId]=\"row.id\">\n              <mat-icon class=\"simple-list-icon\">{{ row.icon }}</mat-icon>\n            </nxs-thumbnail>\n            <span class=\"simple-list-checkbox col-hover-select\">\n              <mat-checkbox\n                [checked]=\"isSelected(row.id)\"\n                [aria-label]=\"'common.select-item' | translate: { name: row.name }\"\n                (click)=\"$event.stopPropagation()\"\n                (change)=\"toggleSelection(row.id)\"\n              ></mat-checkbox>\n            </span>\n          </div>\n          <div class=\"simple-list-body\">\n            <div class=\"simple-list-header\">\n              <button\n                type=\"button\"\n                class=\"simple-list-title\"\n                [title]=\"row.name\"\n                (click)=\"openDocument(row.id); $event.stopPropagation()\"\n              >\n                {{ row.name }}\n              </button>\n              <span class=\"simple-list-type-badge\" [title]=\"row.type | docTypeLabel\">{{\n                row.type | docTypeLabel\n              }}</span>\n            </div>\n            <div class=\"simple-list-actions col-hover-actions\">\n              <nxs-favorite-toggle\n                [documentId]=\"row.id\"\n                [favorite]=\"isFavorited(row.id)\"\n                (changed)=\"onFavoriteChanged(row.id, $event)\"\n                (failed)=\"onFavoriteFailed($event)\"\n              />\n              @if (isDownloadableType(row.type)) {\n                <button\n                  mat-icon-button\n                  [matTooltip]=\"'search.search.download' | translate\"\n                  [attr.aria-label]=\"'search.search.download' | translate\"\n                  class=\"action-btn\"\n                  (click)=\"downloadDocument(row.id, row.name, $event)\"\n                >\n                  <mat-icon class=\"action-icon\">download</mat-icon>\n                </button>\n              }\n            </div>\n          </div>\n        </div>\n      }\n\n      @if (resultCount() === 0) {\n        <div class=\"results-empty\">\n          {{ 'search.search.no-documents-match-the-search-criteria' | translate }}\n        </div>\n      }\n    </div>\n  }\n  @if (!resultsError() && !(aiSearchMode() && aiSearchExecuted())) {\n    <nxs-pager\n      [pageIndex]=\"pager().pageIndex\"\n      [pageSize]=\"pageSize\"\n      [itemCount]=\"pager().itemCount\"\n      [totalSize]=\"pager().totalSize\"\n      [hasNextPage]=\"pager().hasNextPage\"\n      (pageChange)=\"goToPage($event)\"\n    />\n  }\n</div>\n", styles: [":host {\n  display: block;\n  height: 100%;\n}\n\n.ai-search-section {\n  margin-bottom: 12px;\n  flex-shrink: 0;\n}\n\n.ai-search-header {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  margin-bottom: 8px;\n}\n\n.ai-toggle-btn {\n  border-radius: 20px;\n  font-size: 13px;\n  font-weight: 500;\n  background: var(--mat-sys-surface-container, #f5f6fa);\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n  border: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  transition: all 0.2s ease;\n\n  &.active {\n    background: linear-gradient(135deg, #7c4dff 0%, #448aff 100%);\n    color: #fff;\n    border-color: transparent;\n  }\n\n  .ai-sparkle-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n    margin-right: 4px;\n  }\n}\n\n.nxql-toggle-btn {\n  font-size: 12px;\n  height: 32px;\n  border-radius: 16px;\n}\n\n.ai-search-bar {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 8px 14px;\n  border-radius: 12px;\n  border: 2px solid transparent;\n  background: var(--mat-sys-surface-container, #f5f6fa);\n  transition:\n    border-color 0.2s ease,\n    box-shadow 0.2s ease;\n\n  &:focus-within {\n    border-color: #7c4dff;\n    box-shadow: 0 0 0 3px rgba(124, 77, 255, 0.12);\n  }\n}\n\n.ai-search-icon {\n  color: #7c4dff;\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n  flex-shrink: 0;\n}\n\n.ai-search-input {\n  flex: 1;\n  border: none;\n  outline: none;\n  background: transparent;\n  font-size: 14px;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  font-family: inherit;\n\n  &::placeholder {\n    color: var(--mat-sys-on-surface-variant, #7a7d87);\n  }\n}\n\n.ai-search-spinner {\n  flex-shrink: 0;\n}\n\n.ai-search-go {\n  flex-shrink: 0;\n  color: #7c4dff;\n  width: 32px;\n  height: 32px;\n}\n\n.suggestion-icon {\n  font-size: 16px;\n  width: 16px;\n  height: 16px;\n  color: #7c4dff;\n  margin-right: 6px;\n}\n\n.ai-error {\n  display: flex;\n  align-items: center;\n  gap: 6px;\n  margin-top: 8px;\n  padding: 8px 12px;\n  border-radius: 8px;\n  background: #fdecea;\n  color: #d32f2f;\n  font-size: 13px;\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n  }\n}\n\n.ai-nxql-panel {\n  margin-top: 8px;\n  border-radius: 8px;\n  border: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  overflow: hidden;\n}\n\n.ai-nxql-explanation {\n  display: flex;\n  align-items: flex-start;\n  gap: 8px;\n  padding: 10px 14px;\n  background: var(--mat-sys-surface-container-low, #f8f9fc);\n  font-size: 13px;\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n    color: #7c4dff;\n    flex-shrink: 0;\n    margin-top: 1px;\n  }\n}\n\n.ai-nxql-code {\n  margin: 0;\n  padding: 12px 14px;\n  background: #1e1e2e;\n  color: #cdd6f4;\n  font-family: 'Fira Code', 'Cascadia Code', monospace;\n  font-size: 12px;\n  line-height: 1.5;\n  white-space: pre-wrap;\n  word-break: break-all;\n  overflow-x: auto;\n}\n\n.results-page {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n  padding: 16px 24px;\n  box-sizing: border-box;\n}\n\n.results-top-actions {\n  display: flex;\n  justify-content: flex-end;\n  align-items: center;\n  gap: 8px;\n  margin-bottom: 8px;\n  flex-shrink: 0;\n}\n\n.results-toolbar {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  margin-bottom: 16px;\n  flex-shrink: 0;\n}\n\n.results-count {\n  font-size: 15px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface);\n}\n\n.results-summary {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n  min-width: 0;\n}\n\n.quick-filters {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  flex-wrap: wrap;\n}\n\n.quick-filter-btn {\n  height: 30px;\n  padding-inline: 10px;\n  border-color: var(--mat-sys-outline-variant, #d8dbe2);\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n\n  &.active {\n    border-color: var(--mat-sys-primary, #5c6bc0);\n    color: var(--mat-sys-primary, #5c6bc0);\n    background: var(--mat-sys-primary-container, #e8def8);\n  }\n}\n\n.toolbar-actions {\n  display: flex;\n  margin-left: auto;\n  align-items: center;\n  gap: 4px;\n}\n\n.list-view-btn {\n  margin-left: 6px;\n}\n\n.toolbar-btn {\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n  width: 36px;\n  height: 36px;\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-high, #eef0f4);\n  }\n\n  &.active {\n    color: var(--mat-sys-primary, #5c6bc0);\n    background: var(--mat-sys-primary-container, #e8def8);\n    border-radius: 8px;\n  }\n}\n\n.results-loading,\n.results-error {\n  flex: 1;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.results-error {\n  color: #d32f2f;\n  font-size: 14px;\n}\n\n.result-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));\n  align-content: start;\n  gap: 16px;\n  overflow-y: auto;\n  flex: 1;\n  min-height: 0;\n  padding-bottom: 16px;\n}\n\n.grid-action-bar {\n  display: flex;\n  align-items: center;\n  justify-content: flex-start;\n  padding: 12px 0;\n  margin-bottom: 12px;\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n}\n\n.grid-actions-left {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n\n.grid-select {\n  min-width: 200px;\n  font-size: 14px;\n}\n\n.grid-select-all {\n  margin-right: 4px;\n}\n\n.list-action-bar {\n  display: flex;\n  align-items: center;\n  justify-content: flex-start;\n  padding: 12px 0;\n  margin-bottom: 12px;\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n}\n\n.list-actions-left {\n  display: flex;\n  align-items: center;\n  gap: 12px;\n}\n\n.list-select {\n  min-width: 200px;\n  font-size: 14px;\n}\n\n.list-select-all {\n  margin-right: 4px;\n}\n\n.grid-container {\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  overflow: hidden;\n  min-width: 0;\n  min-height: 0;\n  gap: 12px;\n}\n\n.result-grid {\n  display: grid;\n  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));\n  align-content: start;\n  gap: 16px;\n  overflow-y: auto;\n  flex: 1;\n  min-height: 0;\n  padding-bottom: 16px;\n}\n\n.result-card {\n  border: 1px solid #e0e0e0;\n  border-radius: 8px;\n  background: #fff;\n  cursor: pointer;\n  font: inherit;\n  text-align: left;\n  width: 100%;\n  transition:\n    box-shadow 0.15s ease,\n    background-color 0.15s ease;\n  position: relative;\n  display: flex;\n  flex-direction: column;\n\n  &:hover {\n    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);\n\n    .grid-card-actions {\n      opacity: 1;\n      visibility: visible;\n    }\n\n    .grid-card-checkbox {\n      opacity: 1;\n      visibility: visible;\n    }\n  }\n\n  &.selected {\n    background: var(--mat-sys-primary-container, #e8def8);\n    border-color: var(--mat-sys-primary, #5c6bc0);\n\n    .grid-card-checkbox {\n      opacity: 1;\n      visibility: visible;\n    }\n  }\n}\n\n.grid-card-checkbox {\n  position: absolute;\n  top: 8px;\n  left: 8px;\n  opacity: 0;\n  visibility: hidden;\n  transition:\n    opacity 0.2s ease,\n    visibility 0.2s ease;\n  z-index: 2;\n\n  mat-checkbox {\n    display: flex;\n    align-items: center;\n    justify-content: center;\n  }\n}\n\n.result-card-thumbnail {\n  position: relative;\n  height: 120px;\n  background: #f5f5f5;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  border-radius: 8px 8px 0 0;\n  overflow: hidden;\n  flex-shrink: 0;\n  padding: 8px;\n}\n\n.result-icon {\n  font-size: 40px;\n  width: 40px;\n  height: 40px;\n  line-height: 1;\n  display: block;\n  color: #bdbdbd;\n}\n\n.result-thumbnail-image {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n\n.result-card-body {\n  padding: 12px;\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  min-height: 0;\n  overflow: hidden;\n}\n\n.result-head {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  gap: 6px;\n  min-width: 0;\n}\n\n.grid-card-actions {\n  display: flex;\n  gap: 4px;\n  opacity: 0;\n  visibility: hidden;\n  transition:\n    opacity 0.2s ease,\n    visibility 0.2s ease;\n  justify-content: flex-end;\n  padding-top: 8px;\n}\n\n.result-name {\n  /* Button reset: this is a `<button>` so a keyboard user can open the document.\n     The row itself is no longer a button \u2014 it wrapped a checkbox and action buttons,\n     which is `nested-interactive` (WCAG 4.1.2). */\n  appearance: none;\n  border: 0;\n  background: none;\n  padding: 0;\n  font: inherit;\n  color: inherit;\n  text-align: left;\n  cursor: pointer;\n  flex: 1;\n  min-width: 0;\n  font-size: 13px;\n  font-weight: 500;\n  color: var(--mat-sys-on-surface);\n  margin: 0;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.result-type-pill {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  padding: 2px 8px;\n  border-radius: 999px;\n  background: var(--mat-sys-surface-container-high, #eef0f4);\n  border: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n  font-size: 11px;\n  font-weight: 600;\n  line-height: 1;\n  max-width: 120px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  flex-shrink: 0;\n}\n\n.list-wrapper {\n  display: flex;\n  flex-direction: column;\n  position: relative;\n  flex: 1;\n  min-height: 0;\n  overflow: hidden;\n  padding-bottom: 24px;\n}\n\n.result-list {\n  flex: 1;\n  min-height: 0;\n  overflow: auto;\n  border: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  border-radius: 8px;\n\n  &:not(:has(.list-row)) {\n    border: none;\n    border-radius: 0;\n  }\n}\n\n.list-header {\n  display: grid;\n  padding: 10px 16px;\n  background: var(--mat-sys-surface-container, #f5f6fa);\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  font-size: 12px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n  letter-spacing: 0.4px;\n  position: sticky;\n  top: 0;\n  z-index: 10;\n  isolation: isolate;\n}\n\n.list-row {\n  display: grid;\n  padding: 10px 16px;\n  border: none;\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #eceef3);\n  background: none;\n  font: inherit;\n  text-align: left;\n  width: 100%;\n  align-items: center;\n  font-size: 13px;\n  color: var(--mat-sys-on-surface, #1a1c1e);\n  position: relative;\n  transition: background-color 0.15s ease;\n  cursor: pointer;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-high, #eef0f4);\n\n    .col-hover-actions {\n      opacity: 1;\n      visibility: visible;\n    }\n\n    .col-hover-select {\n      visibility: visible;\n    }\n  }\n\n  &.selected {\n    background: var(--mat-sys-primary-container, #e8def8);\n\n    &:hover {\n      background: var(--mat-sys-surface-container-high, #eef0f4);\n    }\n  }\n}\n\n.col-name {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  min-width: 0;\n}\n\n.row-icon {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n  flex-shrink: 0;\n}\n\n.row-name-text {\n  /* Button reset: this is a `<button>` so a keyboard user can open the document.\n     The row itself is no longer a button \u2014 it wrapped a checkbox and action buttons,\n     which is `nested-interactive` (WCAG 4.1.2). */\n  appearance: none;\n  border: 0;\n  background: none;\n  padding: 0;\n  font: inherit;\n  color: inherit;\n  text-align: left;\n  cursor: pointer;\n  flex: 1;\n  min-width: 0;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  cursor: pointer;\n}\n\n.row-thumbnail-image {\n  width: 20px;\n  height: 20px;\n  object-fit: cover;\n  border-radius: 4px;\n  flex-shrink: 0;\n}\n\n.col-checkbox {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex-shrink: 0;\n}\n\n.col-gear {\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n}\n\n.col-header-text {\n  font-size: 12px;\n  font-weight: 600;\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n  letter-spacing: 0.4px;\n}\n\n.col-actions {\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n  gap: 4px;\n  opacity: 0;\n  visibility: hidden;\n  transition:\n    opacity 0.2s ease,\n    visibility 0.2s ease;\n}\n\n.action-btn {\n  width: 32px;\n  height: 32px;\n  line-height: 32px;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n  padding: 0;\n\n  &:hover {\n    color: var(--mat-sys-primary, #5c6bc0);\n    background: var(--mat-sys-surface-container-high, #eef0f4);\n  }\n}\n\n.action-icon {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n}\n\n.gear-btn {\n  width: 32px;\n  height: 32px;\n  line-height: 32px;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n\n  &:hover {\n    color: var(--mat-sys-primary, #5c6bc0);\n  }\n}\n\n.col-sortable {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  cursor: pointer;\n  user-select: none;\n  white-space: nowrap;\n  border: none;\n  background: none;\n  font: inherit;\n  padding: 0;\n  color: inherit;\n\n  &:hover {\n    color: var(--mat-sys-primary, #5c6bc0);\n\n    .sort-icon {\n      opacity: 1;\n    }\n  }\n}\n\n.sort-icon {\n  font-size: 14px;\n  width: 14px;\n  height: 14px;\n  opacity: 0;\n  transition: opacity 0.15s ease;\n  color: var(--mat-sys-on-surface-variant, #8a8d98);\n\n  &.sort-active {\n    opacity: 1;\n    color: var(--mat-sys-primary, #5c6bc0);\n  }\n}\n\n.results-empty {\n  padding: 32px 16px;\n  text-align: center;\n  color: var(--mat-sys-on-surface-variant, #7a7d87);\n  font-size: 14px;\n}\n\n.results-empty--grid {\n  grid-column: 1 / -1;\n  min-height: 220px;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n}\n\n.simple-list {\n  display: flex;\n  flex-direction: column;\n  gap: 10px;\n  overflow-y: auto;\n  padding: 4px 0 16px;\n}\n\n.simple-list-item {\n  display: flex;\n  align-items: center;\n  gap: 14px;\n  padding: 12px 14px;\n  border: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  border-radius: 8px;\n  background: #fff;\n  font: inherit;\n  text-align: left;\n  width: 100%;\n  position: relative;\n  transition: background 0.2s ease;\n  min-height: 92px;\n  cursor: pointer;\n\n  &:hover {\n    background: var(--mat-sys-surface-container-low, #f8f9fc);\n\n    .col-hover-actions {\n      opacity: 1;\n      visibility: visible;\n    }\n\n    .simple-list-checkbox {\n      opacity: 1;\n      visibility: visible;\n    }\n  }\n\n  &.selected {\n    background: var(--mat-sys-primary-container, #e8def8);\n\n    .simple-list-checkbox {\n      opacity: 1;\n      visibility: visible;\n    }\n  }\n}\n\n.simple-list-checkbox {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  position: absolute;\n  top: 4px;\n  left: 4px;\n  z-index: 1;\n  opacity: 0;\n  visibility: hidden;\n  transition:\n    opacity 0.2s ease,\n    visibility 0.2s ease;\n}\n\n.simple-list-thumb {\n  width: 76px;\n  height: 76px;\n  object-fit: cover;\n  border-radius: 6px;\n  flex-shrink: 0;\n}\n\n.simple-list-icon {\n  font-size: 32px;\n  width: 32px;\n  height: 32px;\n  color: #bdbdbd;\n}\n\n.simple-list-body {\n  min-width: 0;\n  display: flex;\n  flex-direction: column;\n  justify-content: space-between;\n  height: 76px;\n  flex: 1;\n}\n.simple-list-thumb-wrap {\n  position: relative;\n  width: 76px;\n  height: 76px;\n  flex-shrink: 0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  background: #f5f5f5;\n  border-radius: 6px;\n}\n\n.simple-list-title {\n  /* Button reset: this is a `<button>` so a keyboard user can open the document.\n     The row itself is no longer a button \u2014 it wrapped a checkbox and action buttons,\n     which is `nested-interactive` (WCAG 4.1.2). */\n  appearance: none;\n  border: 0;\n  background: none;\n  padding: 0;\n  font: inherit;\n  color: inherit;\n  text-align: left;\n  cursor: pointer;\n  margin: 0;\n  font-size: 14px;\n  font-weight: 600;\n  line-height: 1.2;\n  flex: 1;\n  min-width: 0;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.simple-list-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n  min-width: 0;\n}\n\n.simple-list-type-badge {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  padding: 2px 8px;\n  border-radius: 999px;\n  background: var(--mat-sys-surface-container-high, #eef0f4);\n  border: 1px solid var(--mat-sys-outline-variant, #d8dbe2);\n  color: var(--mat-sys-on-surface-variant, #5c5f6b);\n  font-size: 11px;\n  font-weight: 600;\n  line-height: 1;\n  max-width: 120px;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n  flex-shrink: 0;\n}\n\n.simple-list-actions {\n  display: flex;\n  align-items: center;\n  justify-content: flex-start;\n  gap: 4px;\n  opacity: 0;\n  visibility: hidden;\n  transition:\n    opacity 0.2s ease,\n    visibility 0.2s ease;\n  flex-shrink: 0;\n}\n\n/*\n  Stretched hit area for the row's single control.\n * ---------------------------------------------\n * These rows used to be `<button>` elements wrapping a checkbox and action buttons, which is\n * `nested-interactive` \u2014 invalid HTML and WCAG 4.1.2, because a control cannot contain a\n * control. The title is now the row's one real control, and this pseudo-element extends its\n * clickable area over the whole row, so clicking anywhere still opens the document.\n *\n * The alternative was a focusable `<div role=\"button\">` with key handlers, which reintroduces\n * exactly the nesting this removes; `@angular-eslint`'s `interactive-supports-focus` and\n * `click-events-have-key-events` reject the middle ground of a click handler on a plain div,\n * and they are right to.\n */\n.result-name,\n.row-name-text,\n.simple-list-title {\n  &::after {\n    content: '';\n    position: absolute;\n    inset: 0;\n    z-index: 0;\n  }\n}\n\n/* The controls have to sit above that overlay. `z-index` alone did nothing here: these\n   wrappers were `position: static`, on which `z-index` has no effect. */\n.grid-card-checkbox,\n.simple-list-checkbox,\n.col-checkbox,\n.grid-card-actions,\n.simple-list-actions,\n.col-hover-actions,\n.col-gear,\n.action-btn {\n  position: relative;\n  z-index: 1;\n}\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(SearchComponent, { className: "SearchComponent", filePath: "libs/features/search/src/lib/search/search.ts", lineNumber: 211 }); })();
