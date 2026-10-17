import { Component, inject, signal, computed, effect, untracked } from '@angular/core';
import { DescriptorLabelPipe } from '@nuxeo/satori-platform/extensions';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { TrashFilterService, TrashService, DocumentDetailService, docTypeIcon, DocTypeLabelPipe, } from '@nuxeo/satori-platform/nuxeo-client';
import { TranslatePipe } from '@ngx-translate/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/icon";
import * as i2 from "@angular/material/button";
import * as i3 from "@angular/material/checkbox";
import * as i4 from "@angular/material/divider";
import * as i5 from "@angular/material/tooltip";
const _c0 = a0 => ({ count: a0 });
const _forTrack0 = ($index, $item) => $item.uid;
const _forTrack1 = ($index, $item) => $item.id;
const _forTrack2 = ($index, $item) => $item.key;
function TrashFiltersDrawerComponent_Conditional_8_For_5_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 10);
    i0.ɵɵlistener("mousedown", function TrashFiltersDrawerComponent_Conditional_8_For_5_Template_button_mousedown_0_listener() { const filter_r4 = i0.ɵɵrestoreView(_r3).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.selectSavedFilter(filter_r4)); });
    i0.ɵɵelementStart(1, "mat-icon", 11);
    i0.ɵɵtext(2, "bookmark");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const filter_r4 = ctx.$implicit;
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", filter_r4.title, " ");
} }
function TrashFiltersDrawerComponent_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 5)(1, "div", 7)(2, "input", 8);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵlistener("input", function TrashFiltersDrawerComponent_Conditional_8_Template_input_input_2_listener($event) { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.savedFilterSearch.set($event.target.value)); });
    i0.ɵɵelementEnd()();
    i0.ɵɵrepeaterCreate(4, TrashFiltersDrawerComponent_Conditional_8_For_5_Template, 4, 1, "button", 9, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(3, 2, "trash.trash-filters-drawer.search"))("value", ctx_r1.savedFilterSearch());
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.filteredSavedFilters());
} }
function TrashFiltersDrawerComponent_Conditional_17_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 31);
    i0.ɵɵlistener("click", function TrashFiltersDrawerComponent_Conditional_17_Conditional_8_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r6); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onFullTextClear()); });
    i0.ɵɵelementStart(1, "mat-icon");
    i0.ɵɵtext(2, "close");
    i0.ɵɵelementEnd()();
} }
function TrashFiltersDrawerComponent_Conditional_17_Conditional_16_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 32);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "trash.trash-filters-drawer.loading"), " ");
} }
function TrashFiltersDrawerComponent_Conditional_17_Conditional_16_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 32);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "trash.trash-filters-drawer.no-folders-found"), " ");
} }
function TrashFiltersDrawerComponent_Conditional_17_Conditional_16_Conditional_3_For_1_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 34);
    i0.ɵɵlistener("mousedown", function TrashFiltersDrawerComponent_Conditional_17_Conditional_16_Conditional_3_For_1_Template_button_mousedown_0_listener() { const doc_r8 = i0.ɵɵrestoreView(_r7).$implicit; const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.selectPath(doc_r8)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const doc_r8 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", doc_r8.path, " ");
} }
function TrashFiltersDrawerComponent_Conditional_17_Conditional_16_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, TrashFiltersDrawerComponent_Conditional_17_Conditional_16_Conditional_3_For_1_Template, 2, 1, "button", 33, _forTrack0);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵrepeater(ctx_r1.pathSuggestions());
} }
function TrashFiltersDrawerComponent_Conditional_17_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 21);
    i0.ɵɵconditionalCreate(1, TrashFiltersDrawerComponent_Conditional_17_Conditional_16_Conditional_1_Template, 3, 3, "div", 32)(2, TrashFiltersDrawerComponent_Conditional_17_Conditional_16_Conditional_2_Template, 3, 3, "div", 32)(3, TrashFiltersDrawerComponent_Conditional_17_Conditional_16_Conditional_3_Template, 2, 0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.pathLoading() ? 1 : ctx_r1.pathSuggestions().length === 0 ? 2 : 3);
} }
function TrashFiltersDrawerComponent_Conditional_17_Conditional_27_Conditional_1_For_1_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 34);
    i0.ɵɵlistener("mousedown", function TrashFiltersDrawerComponent_Conditional_17_Conditional_27_Conditional_1_For_1_Template_button_mousedown_0_listener() { const opt_r10 = i0.ɵɵrestoreView(_r9).$implicit; const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.selectAuthorOption(opt_r10)); });
    i0.ɵɵelementStart(1, "mat-icon", 35);
    i0.ɵɵtext(2, "person");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵelementStart(4, "span", 36);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const opt_r10 = ctx.$implicit;
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", opt_r10.label, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("(", opt_r10.count, ")");
} }
function TrashFiltersDrawerComponent_Conditional_17_Conditional_27_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, TrashFiltersDrawerComponent_Conditional_17_Conditional_27_Conditional_1_For_1_Template, 6, 2, "button", 33, _forTrack1);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵrepeater(ctx_r1.filteredAuthorOptions());
} }
function TrashFiltersDrawerComponent_Conditional_17_Conditional_27_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 32);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "trash.trash-filters-drawer.no-authors-found"), " ");
} }
function TrashFiltersDrawerComponent_Conditional_17_Conditional_27_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 32);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "trash.trash-filters-drawer.no-matching-authors"), " ");
} }
function TrashFiltersDrawerComponent_Conditional_17_Conditional_27_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 21);
    i0.ɵɵconditionalCreate(1, TrashFiltersDrawerComponent_Conditional_17_Conditional_27_Conditional_1_Template, 2, 0)(2, TrashFiltersDrawerComponent_Conditional_17_Conditional_27_Conditional_2_Template, 3, 3, "div", 32)(3, TrashFiltersDrawerComponent_Conditional_17_Conditional_27_Conditional_3_Template, 3, 3, "div", 32);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.filteredAuthorOptions().length > 0 ? 1 : ctx_r1.authorInput().length === 0 ? 2 : 3);
} }
function TrashFiltersDrawerComponent_Conditional_17_Conditional_35_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r11 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-checkbox", 38);
    i0.ɵɵlistener("change", function TrashFiltersDrawerComponent_Conditional_17_Conditional_35_For_2_Template_mat_checkbox_change_0_listener() { const option_r12 = i0.ɵɵrestoreView(_r11).$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.toggleSize(option_r12.value)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "descriptorLabel");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const option_r12 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("checked", ctx_r1.isSizeSelected(option_r12.value));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2(" ", i0.ɵɵpipeBind1(2, 3, option_r12), " (", option_r12.count, ") ");
} }
function TrashFiltersDrawerComponent_Conditional_17_Conditional_35_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 27);
    i0.ɵɵrepeaterCreate(1, TrashFiltersDrawerComponent_Conditional_17_Conditional_35_For_2_Template, 3, 5, "mat-checkbox", 37, _forTrack2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.sizeOptions());
} }
function TrashFiltersDrawerComponent_Conditional_17_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 12)(1, "div", 13)(2, "p", 14);
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 15)(6, "input", 16);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵlistener("input", function TrashFiltersDrawerComponent_Conditional_17_Template_input_input_6_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.onFullTextChange($event.target.value)); });
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(8, TrashFiltersDrawerComponent_Conditional_17_Conditional_8_Template, 3, 0, "button", 17);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "div", 13)(10, "p", 14);
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "div", 18)(14, "div", 19)(15, "input", 20);
    i0.ɵɵlistener("input", function TrashFiltersDrawerComponent_Conditional_17_Template_input_input_15_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.onPathInput($event.target.value)); })("focus", function TrashFiltersDrawerComponent_Conditional_17_Template_input_focus_15_listener() { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.onPathFocus()); })("blur", function TrashFiltersDrawerComponent_Conditional_17_Template_input_blur_15_listener() { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.closePathDropdown()); })("keydown", function TrashFiltersDrawerComponent_Conditional_17_Template_input_keydown_15_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.onPathKeydown($event)); });
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(16, TrashFiltersDrawerComponent_Conditional_17_Conditional_16_Template, 4, 1, "div", 21);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(17, "div", 13)(18, "p", 14);
    i0.ɵɵtext(19);
    i0.ɵɵpipe(20, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "div", 18)(22, "div", 19)(23, "input", 22);
    i0.ɵɵpipe(24, "translate");
    i0.ɵɵlistener("input", function TrashFiltersDrawerComponent_Conditional_17_Template_input_input_23_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.onAuthorInput($event.target.value)); })("focus", function TrashFiltersDrawerComponent_Conditional_17_Template_input_focus_23_listener() { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.onAuthorFocus()); })("blur", function TrashFiltersDrawerComponent_Conditional_17_Template_input_blur_23_listener() { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.closeAuthorDropdown()); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "mat-icon", 23);
    i0.ɵɵtext(26, "arrow_drop_down");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(27, TrashFiltersDrawerComponent_Conditional_17_Conditional_27_Template, 4, 1, "div", 21);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(28, "div", 13)(29, "button", 24);
    i0.ɵɵlistener("click", function TrashFiltersDrawerComponent_Conditional_17_Template_button_click_29_listener() { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.toggleSizeExpanded()); });
    i0.ɵɵelementStart(30, "span", 25);
    i0.ɵɵtext(31);
    i0.ɵɵpipe(32, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(33, "mat-icon", 26);
    i0.ɵɵtext(34);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(35, TrashFiltersDrawerComponent_Conditional_17_Conditional_35_Template, 3, 0, "div", 27);
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(36, "mat-divider");
    i0.ɵɵelementStart(37, "div", 28)(38, "div", 29)(39, "button", 30);
    i0.ɵɵlistener("click", function TrashFiltersDrawerComponent_Conditional_17_Template_button_click_39_listener() { i0.ɵɵrestoreView(_r5); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.resetFilters()); });
    i0.ɵɵtext(40);
    i0.ɵɵpipe(41, "translate");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 16, "trash.trash-filters-drawer.full-text"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(7, 18, "trash.trash-filters-drawer.search-for-something"))("value", ctx_r1.fullText());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.fullText() ? 8 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 20, "trash.trash-filters-drawer.path"));
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("value", ctx_r1.pathInput());
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.pathOpen() ? 16 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(20, 22, "trash.trash-filters-drawer.authors"));
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("placeholder", i0.ɵɵpipeBind1(24, 24, "trash.trash-filters-drawer.search-for-authors"))("value", ctx_r1.authorInput());
    i0.ɵɵadvance(4);
    i0.ɵɵconditional(ctx_r1.authorOpen() ? 27 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(32, 26, "trash.trash-filters-drawer.size"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.sizeExpanded() ? "expand_less" : "expand_more", " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.sizeExpanded() ? 35 : -1);
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("disabled", !ctx_r1.hasActiveFilters());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(41, 28, "trash.trash-filters-drawer.reset"), " ");
} }
function TrashFiltersDrawerComponent_Conditional_18_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 41);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "trash.trash-filters-drawer.loading"));
} }
function TrashFiltersDrawerComponent_Conditional_18_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 42);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "trash.trash-filters-drawer.trash-is-empty"), " ");
} }
function TrashFiltersDrawerComponent_Conditional_18_Conditional_6_For_2_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "img", 47);
} if (rf & 2) {
    i0.ɵɵproperty("src", ctx, i0.ɵɵsanitizeUrl);
} }
function TrashFiltersDrawerComponent_Conditional_18_Conditional_6_For_2_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-icon", 48);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r14 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.docIcon(item_r14.type));
} }
function TrashFiltersDrawerComponent_Conditional_18_Conditional_6_For_2_Template(rf, ctx) { if (rf & 1) {
    const _r13 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 45);
    i0.ɵɵlistener("click", function TrashFiltersDrawerComponent_Conditional_18_Conditional_6_For_2_Template_button_click_0_listener() { const item_r14 = i0.ɵɵrestoreView(_r13).$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.openDocument(item_r14.uid)); });
    i0.ɵɵelementStart(1, "div", 46);
    i0.ɵɵconditionalCreate(2, TrashFiltersDrawerComponent_Conditional_18_Conditional_6_For_2_Conditional_2_Template, 1, 1, "img", 47)(3, TrashFiltersDrawerComponent_Conditional_18_Conditional_6_For_2_Conditional_3_Template, 2, 1, "mat-icon", 48);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 49)(5, "span", 50);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "span", 51);
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "docTypeLabel");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    let tmp_12_0;
    const item_r14 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional((tmp_12_0 = ctx_r1.trashFilterService.resultThumbnails()[item_r14.uid]) ? 2 : 3, tmp_12_0);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(item_r14.title);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(9, 3, item_r14.type));
} }
function TrashFiltersDrawerComponent_Conditional_18_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 43);
    i0.ɵɵrepeaterCreate(1, TrashFiltersDrawerComponent_Conditional_18_Conditional_6_For_2_Template, 10, 5, "button", 44, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.trashFilterService.results());
} }
function TrashFiltersDrawerComponent_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 39)(1, "span", 40);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(4, TrashFiltersDrawerComponent_Conditional_18_Conditional_4_Template, 3, 3, "div", 41)(5, TrashFiltersDrawerComponent_Conditional_18_Conditional_5_Template, 3, 3, "div", 42)(6, TrashFiltersDrawerComponent_Conditional_18_Conditional_6_Template, 3, 0, "div", 43);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(3, 2, ctx_r1.trashFilterService.totalResults() === 1 ? "common.count.result-one" : "common.count.result-many", i0.ɵɵpureFunction1(5, _c0, ctx_r1.trashFilterService.totalResults())));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.trashFilterService.resultsLoading() ? 4 : ctx_r1.trashFilterService.results().length === 0 ? 5 : 6);
} }
const SIZE_LABEL_KEYS = {
    tiny: 'search.filter.option.less-than-100-kb',
    small: 'search.filter.option.between-100-kb-and-1-mb',
    medium: 'search.filter.option.between-1-mb-and-10-mb',
    large: 'search.filter.option.between-10-mb-and-100-mb',
    huge: 'search.filter.option.more-than-100-mb',
};
const SIZE_LABELS = {
    tiny: 'Less than 100 KB',
    small: 'Between 100 KB and 1 MB',
    medium: 'Between 1 MB and 10 MB',
    large: 'Between 10 MB and 100 MB',
    huge: 'More than 100 MB',
};
export class TrashFiltersDrawerComponent {
    router = inject(Router);
    trashFilterService = inject(TrashFilterService);
    trashService = inject(TrashService);
    detailService = inject(DocumentDetailService);
    sizeOptions = signal([], ...(ngDevMode ? [{ debugName: "sizeOptions" }] : []));
    authorOptions = signal([], ...(ngDevMode ? [{ debugName: "authorOptions" }] : []));
    fullText = signal('', ...(ngDevMode ? [{ debugName: "fullText" }] : []));
    pathInput = signal('/', ...(ngDevMode ? [{ debugName: "pathInput" }] : []));
    authorInput = signal('', ...(ngDevMode ? [{ debugName: "authorInput" }] : []));
    selectedSizes = signal(new Set(), ...(ngDevMode ? [{ debugName: "selectedSizes" }] : []));
    pathOpen = signal(false, ...(ngDevMode ? [{ debugName: "pathOpen" }] : []));
    pathSuggestions = signal([], ...(ngDevMode ? [{ debugName: "pathSuggestions" }] : []));
    pathLoading = signal(false, ...(ngDevMode ? [{ debugName: "pathLoading" }] : []));
    authorOpen = signal(false, ...(ngDevMode ? [{ debugName: "authorOpen" }] : []));
    authorSuggestions = signal([], ...(ngDevMode ? [{ debugName: "authorSuggestions" }] : []));
    sizeExpanded = signal(true, ...(ngDevMode ? [{ debugName: "sizeExpanded" }] : []));
    savedFilterDropdownOpen = signal(false, ...(ngDevMode ? [{ debugName: "savedFilterDropdownOpen" }] : []));
    savedFilterSearch = signal('', ...(ngDevMode ? [{ debugName: "savedFilterSearch" }] : []));
    savedFilters = signal([], ...(ngDevMode ? [{ debugName: "savedFilters" }] : []));
    filteredSavedFilters = computed(() => {
        const q = this.savedFilterSearch().toLowerCase();
        return this.savedFilters().filter((f) => f.title.toLowerCase().includes(q));
    }, ...(ngDevMode ? [{ debugName: "filteredSavedFilters" }] : []));
    hasActiveFilters = computed(() => {
        const f = this.trashFilterService.filters();
        return f.fullText !== '' || f.path !== '/' || f.author !== '' || f.sizeRanges.length > 0;
    }, ...(ngDevMode ? [{ debugName: "hasActiveFilters" }] : []));
    constructor() {
        effect(() => {
            const version = this.trashFilterService.savedSearchVersion();
            if (version === 0)
                return;
            untracked(() => this.loadSavedSearches());
        });
        effect(() => {
            const filters = this.trashFilterService.filters();
            const activeUid = this.trashFilterService.activeSavedFilterUid() ?? '';
            this.fullText.set(filters.fullText ?? '');
            this.pathInput.set(filters.path || '/');
            this.authorInput.set(filters.author ?? '');
            this.selectedSizes.set(new Set(filters.sizeRanges ?? []));
            if (activeUid)
                return;
            this.savedFilterSearch.set('');
            this.savedFilterDropdownOpen.set(false);
        });
    }
    ngOnInit() {
        this.ensureTrashRoute();
        this.loadAggregatedCounts();
        this.loadSavedSearches();
    }
    loadSavedSearches() {
        this.trashService
            .getSavedSearches()
            .pipe(catchError(() => of([])))
            .subscribe((results) => {
            this.savedFilters.set(results);
            const activeUid = this.trashFilterService.activeSavedFilterUid();
            if (!activeUid)
                return;
            // Preserve current filters during save/edit refresh; only hydrate from saved search
            // when local filter state is empty (e.g., after navigation or explicit reset).
            if (this.hasActiveFilters())
                return;
            const active = results.find((r) => r.uid === activeUid);
            if (!active)
                return;
            this.selectSavedFilter(active);
        });
    }
    loadAggregatedCounts() {
        this.trashService
            .searchTrash({ pageSize: 200 })
            .pipe(catchError(() => of({ entries: [] })))
            .subscribe((res) => {
            const entries = res.entries ?? [];
            this.computeSizeCounts(entries);
            this.computeAuthorCounts(entries);
        });
    }
    computeSizeCounts(entries) {
        const counts = { tiny: 0, small: 0, medium: 0, large: 0, huge: 0 };
        for (const doc of entries) {
            const fileContent = doc.properties?.['file:content'];
            const size = fileContent?.length ?? 0;
            if (size < 102400)
                counts['tiny']++;
            else if (size < 1048576)
                counts['small']++;
            else if (size < 10485760)
                counts['medium']++;
            else if (size < 104857600)
                counts['large']++;
            else
                counts['huge']++;
        }
        this.sizeOptions.set(Object.entries(SIZE_LABELS).map(([key, label]) => ({
            key,
            value: key,
            labelKey: SIZE_LABEL_KEYS[key],
            label,
            count: counts[key] ?? 0,
        })));
    }
    computeAuthorCounts(entries) {
        const map = new Map();
        for (const doc of entries) {
            const creator = doc.properties?.['dc:creator'] ?? '';
            if (creator) {
                map.set(creator, (map.get(creator) ?? 0) + 1);
            }
        }
        this.authorOptions.set(Array.from(map.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([id, count]) => ({ id, label: id, count })));
    }
    toggleLayout() {
        this.trashFilterService.toggleLayout();
    }
    docIcon(type) {
        return docTypeIcon(type);
    }
    openDocument(uid) {
        void this.router.navigateByUrl(`/doc/${uid}`);
    }
    toggleSavedFilterDropdown() {
        this.savedFilterDropdownOpen.update((v) => !v);
    }
    closeSavedFilterDropdown() {
        setTimeout(() => this.savedFilterDropdownOpen.set(false), 200);
    }
    onSavedFilterFocusOut(event) {
        const host = event.currentTarget;
        const next = event.relatedTarget;
        if (!host || (next && host.contains(next)))
            return;
        this.savedFilterDropdownOpen.set(false);
    }
    selectSavedFilter(filter) {
        this.savedFilterDropdownOpen.set(false);
        this.trashFilterService.activeSavedFilterUid.set(filter.uid);
        this.trashFilterService.activeSavedFilterTitle.set(filter.title);
        const p = filter.params ?? {};
        const fullText = this.extractParam(p, 'ecm_fulltext', '');
        const path = this.extractParam(p, 'ecm_path', '/') || '/';
        const author = this.extractParam(p, 'dc_creator', '');
        const sizeRaw = this.extractParamArray(p, 'common_size');
        this.fullText.set(fullText);
        this.pathInput.set(path);
        this.authorInput.set(author);
        this.selectedSizes.set(new Set(sizeRaw));
        this.trashFilterService.filters.set({
            fullText,
            path,
            author,
            sizeRanges: sizeRaw,
        });
        this.ensureTrashRoute();
    }
    extractParam(params, key, fallback) {
        for (const prefix of ['', 'defaults:']) {
            const val = params[`${prefix}${key}`];
            if (typeof val === 'string' && val.trim())
                return val.trim();
            if (Array.isArray(val) && val.length > 0) {
                const first = String(val[0] ?? '').trim();
                if (first)
                    return first;
            }
        }
        return fallback;
    }
    extractParamArray(params, key) {
        for (const prefix of ['', 'defaults:']) {
            const val = params[`${prefix}${key}`];
            if (Array.isArray(val)) {
                return val.map((item) => String(item ?? '').trim()).filter(Boolean);
            }
            if (typeof val === 'string' && val.trim()) {
                try {
                    const parsed = JSON.parse(val);
                    if (Array.isArray(parsed)) {
                        return parsed.map((item) => String(item ?? '').trim()).filter(Boolean);
                    }
                }
                catch {
                    return val
                        .split(',')
                        .map((item) => item.trim())
                        .filter(Boolean);
                }
            }
        }
        return [];
    }
    onFullTextChange(value) {
        this.fullText.set(value);
        this.updateFilters();
    }
    onFullTextClear() {
        this.fullText.set('');
        this.updateFilters();
    }
    onPathInput(value) {
        this.pathInput.set(value);
        if (value.length >= 1) {
            this.pathLoading.set(true);
            this.trashService
                .getPathSuggestions(value)
                .pipe(catchError(() => of({ entries: [] })))
                .subscribe((res) => {
                this.pathSuggestions.set(res.entries);
                this.pathLoading.set(false);
                this.pathOpen.set(true);
            });
        }
        else {
            this.pathSuggestions.set([]);
        }
    }
    onPathFocus() {
        const current = this.pathInput() || '/';
        this.onPathInput(current);
    }
    selectPath(doc) {
        this.pathInput.set(doc.path + '/');
        this.pathOpen.set(false);
        this.updateFilters();
        setTimeout(() => this.onPathInput(doc.path + '/'), 100);
    }
    closePathDropdown() {
        setTimeout(() => this.pathOpen.set(false), 200);
    }
    onPathKeydown(event) {
        if (event.key === 'Enter') {
            this.pathOpen.set(false);
            this.updateFilters();
        }
    }
    filteredAuthorOptions = computed(() => {
        const q = this.authorInput().toLowerCase();
        if (!q)
            return this.authorOptions();
        return this.authorOptions().filter((a) => a.label.toLowerCase().includes(q));
    }, ...(ngDevMode ? [{ debugName: "filteredAuthorOptions" }] : []));
    onAuthorFocus() {
        this.authorOpen.set(true);
    }
    onAuthorInput(value) {
        this.authorInput.set(value);
        this.authorOpen.set(true);
    }
    selectAuthorOption(option) {
        this.authorInput.set(option.id);
        this.authorOpen.set(false);
        this.updateFilters();
    }
    selectAuthor(suggestion) {
        this.authorInput.set(suggestion.id);
        this.authorOpen.set(false);
        this.updateFilters();
    }
    closeAuthorDropdown() {
        setTimeout(() => {
            this.authorOpen.set(false);
            this.updateFilters();
        }, 200);
    }
    isSizeSelected(value) {
        return this.selectedSizes().has(value);
    }
    toggleSize(value) {
        const next = new Set(this.selectedSizes());
        if (next.has(value))
            next.delete(value);
        else
            next.add(value);
        this.selectedSizes.set(next);
        this.updateFilters();
    }
    toggleSizeExpanded() {
        this.sizeExpanded.update((v) => !v);
    }
    resetFilters() {
        this.fullText.set('');
        this.pathInput.set('/');
        this.authorInput.set('');
        this.selectedSizes.set(new Set());
        this.trashFilterService.reset();
        this.ensureTrashRoute();
    }
    updateFilters() {
        this.trashFilterService.filters.set({
            fullText: this.fullText(),
            path: this.pathInput() || '/',
            author: this.authorInput(),
            sizeRanges: [...this.selectedSizes()],
        });
        this.ensureTrashRoute();
    }
    ensureTrashRoute() {
        if (!this.router.url.startsWith('/trash')) {
            void this.router.navigateByUrl('/trash');
        }
    }
    static ɵfac = function TrashFiltersDrawerComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || TrashFiltersDrawerComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: TrashFiltersDrawerComponent, selectors: [["lib-trash-filters-drawer"]], decls: 19, vars: 20, consts: [[1, "drawer-header"], ["tabindex", "-1", 1, "saved-filters-dropdown", 3, "focusout"], ["type", "button", 1, "saved-filters-trigger", 3, "click"], [1, "saved-filters-label"], [1, "saved-filters-arrow"], [1, "saved-filters-panel"], ["mat-icon-button", "", "type", "button", 1, "view-switcher-btn", 3, "click", "matTooltip"], [1, "saved-filters-search"], ["type", "text", 1, "saved-filters-search-input", 3, "input", "placeholder", "value"], ["type", "button", 1, "saved-filters-option"], ["type", "button", 1, "saved-filters-option", 3, "mousedown"], [1, "saved-filter-icon"], [1, "filters-section"], [1, "filter-group"], [1, "filter-title"], [1, "filter-input-wrap"], ["type", "text", 1, "filter-input", 3, "input", "placeholder", "value"], ["type", "button", 1, "clear-btn"], [1, "typeahead-field"], [1, "typeahead-input-wrap"], ["type", "text", "placeholder", "/", 1, "typeahead-input", 3, "input", "focus", "blur", "keydown", "value"], [1, "typeahead-panel"], ["type", "text", 1, "typeahead-input", 3, "input", "focus", "blur", "placeholder", "value"], [1, "typeahead-arrow"], ["type", "button", 1, "filter-btn", 3, "click"], [1, "filter-btn-label"], [1, "filter-btn-icon"], [1, "filter-options"], [1, "drawer-footer"], [1, "footer-actions"], ["mat-stroked-button", "", "type", "button", 1, "footer-btn", 3, "click", "disabled"], ["type", "button", 1, "clear-btn", 3, "click"], [1, "typeahead-hint"], ["type", "button", 1, "typeahead-option"], ["type", "button", 1, "typeahead-option", 3, "mousedown"], [1, "suggestion-icon"], [1, "option-count"], [1, "filter-checkbox", 3, "checked"], [1, "filter-checkbox", 3, "change", "checked"], [1, "drawer-results-header"], [1, "drawer-results-count"], [1, "drawer-results-loading"], [1, "drawer-results-empty"], [1, "drawer-results-list"], ["type", "button", 1, "drawer-result-item"], ["type", "button", 1, "drawer-result-item", 3, "click"], [1, "drawer-result-thumb"], ["alt", "", 1, "drawer-result-thumb-img", 3, "src"], [1, "drawer-result-thumb-icon"], [1, "drawer-result-info"], [1, "drawer-result-title"], [1, "drawer-result-type"]], template: function TrashFiltersDrawerComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "div", 1);
            i0.ɵɵlistener("focusout", function TrashFiltersDrawerComponent_Template_div_focusout_1_listener($event) { return ctx.onSavedFilterFocusOut($event); });
            i0.ɵɵelementStart(2, "button", 2);
            i0.ɵɵlistener("click", function TrashFiltersDrawerComponent_Template_button_click_2_listener() { return ctx.toggleSavedFilterDropdown(); });
            i0.ɵɵelementStart(3, "span", 3);
            i0.ɵɵtext(4);
            i0.ɵɵpipe(5, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(6, "mat-icon", 4);
            i0.ɵɵtext(7, "arrow_drop_down");
            i0.ɵɵelementEnd()();
            i0.ɵɵconditionalCreate(8, TrashFiltersDrawerComponent_Conditional_8_Template, 6, 4, "div", 5);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(9, "button", 6);
            i0.ɵɵpipe(10, "translate");
            i0.ɵɵpipe(11, "translate");
            i0.ɵɵpipe(12, "translate");
            i0.ɵɵpipe(13, "translate");
            i0.ɵɵlistener("click", function TrashFiltersDrawerComponent_Template_button_click_9_listener() { return ctx.toggleLayout(); });
            i0.ɵɵelementStart(14, "mat-icon");
            i0.ɵɵtext(15);
            i0.ɵɵelementEnd()()();
            i0.ɵɵelement(16, "mat-divider");
            i0.ɵɵconditionalCreate(17, TrashFiltersDrawerComponent_Conditional_17_Template, 42, 30);
            i0.ɵɵconditionalCreate(18, TrashFiltersDrawerComponent_Conditional_18_Template, 7, 7);
        } if (rf & 2) {
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate(ctx.trashFilterService.activeSavedFilterTitle() ?? i0.ɵɵpipeBind1(5, 10, "trash.search-filters"));
            i0.ɵɵadvance(4);
            i0.ɵɵconditional(ctx.savedFilterDropdownOpen() ? 8 : -1);
            i0.ɵɵadvance();
            i0.ɵɵclassProp("active", ctx.trashFilterService.layoutMode() === "results");
            i0.ɵɵproperty("matTooltip", i0.ɵɵinterpolate(ctx.trashFilterService.layoutMode() === "filters" ? i0.ɵɵpipeBind1(10, 12, "trash.show-results") : i0.ɵɵpipeBind1(11, 14, "trash.show-filters")));
            i0.ɵɵattribute("aria-label", ctx.trashFilterService.layoutMode() === "filters" ? i0.ɵɵpipeBind1(12, 16, "trash.show-results") : i0.ɵɵpipeBind1(13, 18, "trash.show-filters"));
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate(ctx.trashFilterService.layoutMode() === "filters" ? "view_sidebar" : "filter_list");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional(ctx.trashFilterService.layoutMode() === "filters" ? 17 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.trashFilterService.layoutMode() === "results" ? 18 : -1);
        } }, dependencies: [FormsModule,
            MatIconModule, i1.MatIcon, MatButtonModule, i2.MatButton, i2.MatIconButton, MatCheckboxModule, i3.MatCheckbox, MatDividerModule, i4.MatDivider, MatTooltipModule, i5.MatTooltip, DocTypeLabelPipe,
            DescriptorLabelPipe,
            TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n}\n\n.drawer-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 10px 16px;\n}\n\n.saved-filters-dropdown[_ngcontent-%COMP%] {\n  position: relative;\n  flex: 1;\n}\n\n.saved-filters-trigger[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  background: none;\n  border: 1px solid #ccc;\n  border-radius: 4px;\n  padding: 6px 8px;\n  cursor: pointer;\n  font: inherit;\n  font-size: 13px;\n  color: #333;\n  width: 100%;\n  &:hover {\n    border-color: #999;\n  }\n}\n\n.saved-filters-label[_ngcontent-%COMP%] {\n  flex: 1;\n  text-align: left;\n}\n\n.saved-filters-arrow[_ngcontent-%COMP%] {\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n  color: #666;\n}\n\n.saved-filters-panel[_ngcontent-%COMP%] {\n  position: absolute;\n  left: 0;\n  right: 0;\n  top: calc(100% + 2px);\n  background: #fff;\n  border: 1px solid #ccc;\n  border-radius: 4px;\n  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);\n  z-index: 20;\n  max-height: 200px;\n  overflow-y: auto;\n}\n\n.saved-filters-search[_ngcontent-%COMP%] {\n  padding: 6px 8px;\n  border-bottom: 1px solid #eee;\n}\n\n.saved-filters-search-input[_ngcontent-%COMP%] {\n  width: 100%;\n  border: 1px solid #ddd;\n  border-radius: 4px;\n  padding: 4px 8px;\n  font-size: 13px;\n  outline: none;\n  &:focus {\n    border-color: #3f51b5;\n  }\n}\n\n.saved-filters-empty[_ngcontent-%COMP%] {\n  padding: 10px 12px;\n  font-size: 13px;\n  color: #999;\n}\n\n.saved-filters-option[_ngcontent-%COMP%] {\n  width: 100%;\n  text-align: left;\n  border: none;\n  background: #fff;\n  padding: 8px 12px;\n  font-size: 13px;\n  cursor: pointer;\n  color: #333;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  &:hover {\n    background: #e3f2fd;\n    color: #1565c0;\n  }\n}\n\n.saved-filters-default[_ngcontent-%COMP%] {\n  border-bottom: 1px solid #eee;\n}\n\n.saved-filter-icon[_ngcontent-%COMP%] {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n  color: #888;\n}\n\n.view-switcher-btn[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n  width: 36px;\n  height: 36px;\n  color: #555;\n  &:hover {\n    color: #3f51b5;\n  }\n  &.active {\n    color: #3f51b5;\n    background: rgba(63, 81, 181, 0.08);\n    border-radius: 8px;\n  }\n}\n\n.drawer-results-header[_ngcontent-%COMP%] {\n  padding: 10px 16px;\n  font-size: 13px;\n  font-weight: 600;\n  color: #555;\n}\n\n.drawer-results-count[_ngcontent-%COMP%] {\n  font-size: 13px;\n}\n\n.drawer-results-loading[_ngcontent-%COMP%], \n.drawer-results-empty[_ngcontent-%COMP%] {\n  padding: 24px 16px;\n  text-align: center;\n  color: #999;\n  font-size: 13px;\n}\n\n.drawer-results-list[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n}\n\n.drawer-result-item[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  width: 100%;\n  padding: 8px 16px;\n  border: none;\n  background: none;\n  font: inherit;\n  text-align: left;\n  cursor: pointer;\n  &:hover {\n    background: #f5f5f5;\n  }\n}\n\n.drawer-result-thumb[_ngcontent-%COMP%] {\n  width: 40px;\n  height: 40px;\n  flex-shrink: 0;\n  border-radius: 4px;\n  background: #f0f0f0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  overflow: hidden;\n}\n\n.drawer-result-thumb-img[_ngcontent-%COMP%] {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n\n.drawer-result-thumb-icon[_ngcontent-%COMP%] {\n  font-size: 22px;\n  width: 22px;\n  height: 22px;\n  color: #bbb;\n}\n\n.drawer-result-info[_ngcontent-%COMP%] {\n  min-width: 0;\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n}\n\n.drawer-result-title[_ngcontent-%COMP%] {\n  font-size: 13px;\n  font-weight: 500;\n  color: #333;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.drawer-result-type[_ngcontent-%COMP%] {\n  font-size: 11px;\n  color: #999;\n}\n\n.filters-section[_ngcontent-%COMP%] {\n  flex: 1;\n  overflow-y: auto;\n  padding: 8px 0;\n}\n\n.filters-heading[_ngcontent-%COMP%] {\n  font-size: 11px;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n  color: #999;\n  padding: 4px 16px 8px;\n  margin: 0;\n}\n\n.filter-group[_ngcontent-%COMP%] {\n  border-bottom: 1px solid #f5f5f5;\n  padding: 10px 16px 12px;\n}\n\n.filter-title[_ngcontent-%COMP%] {\n  margin: 0 0 8px;\n  font-size: 13px;\n  font-weight: 600;\n  color: #333;\n}\n\n.filter-input-wrap[_ngcontent-%COMP%] {\n  position: relative;\n}\n\n.filter-input[_ngcontent-%COMP%] {\n  width: 100%;\n  border: none;\n  border-bottom: 1px solid #4c4b67;\n  background: transparent;\n  font-size: 14px;\n  color: #333;\n  padding: 0 28px 8px 0;\n  outline: none;\n  box-sizing: border-box;\n\n  &::placeholder {\n    color: #aaa;\n  }\n  &:focus {\n    border-bottom-color: #3f51b5;\n  }\n}\n\n.clear-btn[_ngcontent-%COMP%] {\n  position: absolute;\n  right: 0;\n  bottom: 4px;\n  border: none;\n  background: none;\n  cursor: pointer;\n  padding: 0;\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n    color: #999;\n  }\n}\n\n.filter-btn[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  width: 100%;\n  padding: 2px 0 4px;\n  background: none;\n  border: none;\n  cursor: pointer;\n  text-align: left;\n  color: #333;\n  &:hover {\n    background: #f5f5f5;\n  }\n}\n\n.filter-btn-label[_ngcontent-%COMP%] {\n  font-size: 14px;\n  font-weight: 500;\n}\n\n.filter-btn-icon[_ngcontent-%COMP%] {\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n  color: #666;\n  flex-shrink: 0;\n}\n\n.filter-options[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  padding: 4px 0 0;\n  gap: 4px;\n}\n\n.filter-checkbox[_ngcontent-%COMP%] {\n  display: block;\n}\n\n.typeahead-field[_ngcontent-%COMP%] {\n  position: relative;\n}\n\n.typeahead-input-wrap[_ngcontent-%COMP%] {\n  position: relative;\n  border-bottom: 1px solid #4c4b67;\n}\n\n.typeahead-input[_ngcontent-%COMP%] {\n  width: 100%;\n  border: none;\n  background: transparent;\n  font-size: 14px;\n  line-height: 1.2;\n  color: #4c4b67;\n  padding: 0 28px 8px 0;\n  outline: none;\n  &::placeholder {\n    color: #4f6382;\n    opacity: 1;\n  }\n}\n\n.typeahead-arrow[_ngcontent-%COMP%] {\n  position: absolute;\n  right: 0;\n  bottom: 7px;\n  color: #4c4b67;\n  pointer-events: none;\n}\n\n.typeahead-panel[_ngcontent-%COMP%] {\n  position: absolute;\n  left: 0;\n  right: 0;\n  top: calc(100% + 2px);\n  background: #fff;\n  border-radius: 0 0 4px 4px;\n  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.24);\n  z-index: 20;\n  max-height: 220px;\n  overflow-y: auto;\n}\n\n.typeahead-hint[_ngcontent-%COMP%] {\n  padding: 10px 12px;\n  color: #4c4b67;\n  font-size: 15px;\n}\n\n.typeahead-option[_ngcontent-%COMP%] {\n  width: 100%;\n  text-align: left;\n  border: none;\n  background: #fff;\n  color: #333;\n  padding: 10px 12px;\n  font-size: 13px;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  &:hover {\n    background: #f5f5f5;\n  }\n}\n\n.suggestion-icon[_ngcontent-%COMP%] {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n  color: #666;\n}\n\n.option-count[_ngcontent-%COMP%] {\n  margin-left: auto;\n  font-size: 12px;\n  color: #999;\n}\n\n.drawer-footer[_ngcontent-%COMP%] {\n  flex-shrink: 0;\n  padding: 12px 16px;\n}\n\n.footer-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n}\n\n.footer-btn[_ngcontent-%COMP%] {\n  flex: 1;\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(TrashFiltersDrawerComponent, [{
        type: Component,
        args: [{ selector: 'lib-trash-filters-drawer', standalone: true, imports: [
                    DocTypeLabelPipe,
                    DescriptorLabelPipe,
                    TranslatePipe,
                    FormsModule,
                    MatIconModule,
                    MatButtonModule,
                    MatCheckboxModule,
                    MatDividerModule,
                    MatTooltipModule,
                ], template: "<div class=\"drawer-header\">\n  <div class=\"saved-filters-dropdown\" tabindex=\"-1\" (focusout)=\"onSavedFilterFocusOut($event)\">\n    <button class=\"saved-filters-trigger\" type=\"button\" (click)=\"toggleSavedFilterDropdown()\">\n      <span class=\"saved-filters-label\">{{\n        trashFilterService.activeSavedFilterTitle() ?? ('trash.search-filters' | translate)\n      }}</span>\n      <mat-icon class=\"saved-filters-arrow\">arrow_drop_down</mat-icon>\n    </button>\n\n    @if (savedFilterDropdownOpen()) {\n      <div class=\"saved-filters-panel\">\n        <div class=\"saved-filters-search\">\n          <input\n            class=\"saved-filters-search-input\"\n            type=\"text\"\n            [placeholder]=\"'trash.trash-filters-drawer.search' | translate\"\n            [value]=\"savedFilterSearch()\"\n            (input)=\"savedFilterSearch.set($any($event.target).value)\"\n          />\n        </div>\n        @for (filter of filteredSavedFilters(); track filter.uid) {\n          <button\n            class=\"saved-filters-option\"\n            type=\"button\"\n            (mousedown)=\"selectSavedFilter(filter)\"\n          >\n            <mat-icon class=\"saved-filter-icon\">bookmark</mat-icon>\n            {{ filter.title }}\n          </button>\n        }\n      </div>\n    }\n  </div>\n\n  <button\n    mat-icon-button\n    class=\"view-switcher-btn\"\n    [class.active]=\"trashFilterService.layoutMode() === 'results'\"\n    matTooltip=\"{{\n      trashFilterService.layoutMode() === 'filters'\n        ? ('trash.show-results' | translate)\n        : ('trash.show-filters' | translate)\n    }}\"\n    [attr.aria-label]=\"\n      trashFilterService.layoutMode() === 'filters'\n        ? ('trash.show-results' | translate)\n        : ('trash.show-filters' | translate)\n    \"\n    type=\"button\"\n    (click)=\"toggleLayout()\"\n  >\n    <mat-icon>{{\n      trashFilterService.layoutMode() === 'filters' ? 'view_sidebar' : 'filter_list'\n    }}</mat-icon>\n  </button>\n</div>\n\n<mat-divider />\n\n<!-- \u2500\u2500\u2500\u2500\u2500 FILTERS MODE \u2500\u2500\u2500\u2500\u2500 -->\n@if (trashFilterService.layoutMode() === 'filters') {\n  <div class=\"filters-section\">\n    <div class=\"filter-group\">\n      <p class=\"filter-title\">{{ 'trash.trash-filters-drawer.full-text' | translate }}</p>\n      <div class=\"filter-input-wrap\">\n        <input\n          class=\"filter-input\"\n          type=\"text\"\n          [placeholder]=\"'trash.trash-filters-drawer.search-for-something' | translate\"\n          [value]=\"fullText()\"\n          (input)=\"onFullTextChange($any($event.target).value)\"\n        />\n        @if (fullText()) {\n          <button class=\"clear-btn\" type=\"button\" (click)=\"onFullTextClear()\">\n            <mat-icon>close</mat-icon>\n          </button>\n        }\n      </div>\n    </div>\n\n    <div class=\"filter-group\">\n      <p class=\"filter-title\">{{ 'trash.trash-filters-drawer.path' | translate }}</p>\n      <div class=\"typeahead-field\">\n        <div class=\"typeahead-input-wrap\">\n          <input\n            class=\"typeahead-input\"\n            type=\"text\"\n            placeholder=\"/\"\n            [value]=\"pathInput()\"\n            (input)=\"onPathInput($any($event.target).value)\"\n            (focus)=\"onPathFocus()\"\n            (blur)=\"closePathDropdown()\"\n            (keydown)=\"onPathKeydown($event)\"\n          />\n        </div>\n        @if (pathOpen()) {\n          <div class=\"typeahead-panel\">\n            @if (pathLoading()) {\n              <div class=\"typeahead-hint\">\n                {{ 'trash.trash-filters-drawer.loading' | translate }}\n              </div>\n            } @else if (pathSuggestions().length === 0) {\n              <div class=\"typeahead-hint\">\n                {{ 'trash.trash-filters-drawer.no-folders-found' | translate }}\n              </div>\n            } @else {\n              @for (doc of pathSuggestions(); track doc.uid) {\n                <button class=\"typeahead-option\" type=\"button\" (mousedown)=\"selectPath(doc)\">\n                  {{ doc.path }}\n                </button>\n              }\n            }\n          </div>\n        }\n      </div>\n    </div>\n\n    <div class=\"filter-group\">\n      <p class=\"filter-title\">{{ 'trash.trash-filters-drawer.authors' | translate }}</p>\n      <div class=\"typeahead-field\">\n        <div class=\"typeahead-input-wrap\">\n          <input\n            class=\"typeahead-input\"\n            type=\"text\"\n            [placeholder]=\"'trash.trash-filters-drawer.search-for-authors' | translate\"\n            [value]=\"authorInput()\"\n            (input)=\"onAuthorInput($any($event.target).value)\"\n            (focus)=\"onAuthorFocus()\"\n            (blur)=\"closeAuthorDropdown()\"\n          />\n          <mat-icon class=\"typeahead-arrow\">arrow_drop_down</mat-icon>\n        </div>\n        @if (authorOpen()) {\n          <div class=\"typeahead-panel\">\n            @if (filteredAuthorOptions().length > 0) {\n              @for (opt of filteredAuthorOptions(); track opt.id) {\n                <button\n                  class=\"typeahead-option\"\n                  type=\"button\"\n                  (mousedown)=\"selectAuthorOption(opt)\"\n                >\n                  <mat-icon class=\"suggestion-icon\">person</mat-icon>\n                  {{ opt.label }}\n                  <span class=\"option-count\">({{ opt.count }})</span>\n                </button>\n              }\n            } @else if (authorInput().length === 0) {\n              <div class=\"typeahead-hint\">\n                {{ 'trash.trash-filters-drawer.no-authors-found' | translate }}\n              </div>\n            } @else {\n              <div class=\"typeahead-hint\">\n                {{ 'trash.trash-filters-drawer.no-matching-authors' | translate }}\n              </div>\n            }\n          </div>\n        }\n      </div>\n    </div>\n\n    <div class=\"filter-group\">\n      <button class=\"filter-btn\" type=\"button\" (click)=\"toggleSizeExpanded()\">\n        <span class=\"filter-btn-label\">{{ 'trash.trash-filters-drawer.size' | translate }}</span>\n        <mat-icon class=\"filter-btn-icon\">\n          {{ sizeExpanded() ? 'expand_less' : 'expand_more' }}\n        </mat-icon>\n      </button>\n      @if (sizeExpanded()) {\n        <div class=\"filter-options\">\n          @for (option of sizeOptions(); track option.key) {\n            <mat-checkbox\n              [checked]=\"isSizeSelected(option.value)\"\n              (change)=\"toggleSize(option.value)\"\n              class=\"filter-checkbox\"\n            >\n              {{ option | descriptorLabel }} ({{ option.count }})\n            </mat-checkbox>\n          }\n        </div>\n      }\n    </div>\n  </div>\n\n  <mat-divider />\n\n  <div class=\"drawer-footer\">\n    <div class=\"footer-actions\">\n      <button\n        mat-stroked-button\n        class=\"footer-btn\"\n        type=\"button\"\n        [disabled]=\"!hasActiveFilters()\"\n        (click)=\"resetFilters()\"\n      >\n        {{ 'trash.trash-filters-drawer.reset' | translate }}\n      </button>\n    </div>\n  </div>\n}\n\n<!-- \u2500\u2500\u2500\u2500\u2500 RESULTS MODE \u2500\u2500\u2500\u2500\u2500 -->\n@if (trashFilterService.layoutMode() === 'results') {\n  <div class=\"drawer-results-header\">\n    <span class=\"drawer-results-count\">{{\n      (trashFilterService.totalResults() === 1\n        ? 'common.count.result-one'\n        : 'common.count.result-many'\n      ) | translate: { count: trashFilterService.totalResults() }\n    }}</span>\n  </div>\n\n  @if (trashFilterService.resultsLoading()) {\n    <div class=\"drawer-results-loading\">{{ 'trash.trash-filters-drawer.loading' | translate }}</div>\n  } @else if (trashFilterService.results().length === 0) {\n    <div class=\"drawer-results-empty\">\n      {{ 'trash.trash-filters-drawer.trash-is-empty' | translate }}\n    </div>\n  } @else {\n    <div class=\"drawer-results-list\">\n      @for (item of trashFilterService.results(); track item.uid) {\n        <button class=\"drawer-result-item\" type=\"button\" (click)=\"openDocument(item.uid)\">\n          <div class=\"drawer-result-thumb\">\n            @if (trashFilterService.resultThumbnails()[item.uid]; as thumb) {\n              <img class=\"drawer-result-thumb-img\" [src]=\"thumb\" alt=\"\" />\n            } @else {\n              <mat-icon class=\"drawer-result-thumb-icon\">{{ docIcon(item.type) }}</mat-icon>\n            }\n          </div>\n          <div class=\"drawer-result-info\">\n            <span class=\"drawer-result-title\">{{ item.title }}</span>\n            <span class=\"drawer-result-type\">{{ item.type | docTypeLabel }}</span>\n          </div>\n        </button>\n      }\n    </div>\n  }\n}\n", styles: [":host {\n  display: flex;\n  flex-direction: column;\n  height: 100%;\n}\n\n.drawer-header {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 10px 16px;\n}\n\n.saved-filters-dropdown {\n  position: relative;\n  flex: 1;\n}\n\n.saved-filters-trigger {\n  display: flex;\n  align-items: center;\n  gap: 4px;\n  background: none;\n  border: 1px solid #ccc;\n  border-radius: 4px;\n  padding: 6px 8px;\n  cursor: pointer;\n  font: inherit;\n  font-size: 13px;\n  color: #333;\n  width: 100%;\n  &:hover {\n    border-color: #999;\n  }\n}\n\n.saved-filters-label {\n  flex: 1;\n  text-align: left;\n}\n\n.saved-filters-arrow {\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n  color: #666;\n}\n\n.saved-filters-panel {\n  position: absolute;\n  left: 0;\n  right: 0;\n  top: calc(100% + 2px);\n  background: #fff;\n  border: 1px solid #ccc;\n  border-radius: 4px;\n  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);\n  z-index: 20;\n  max-height: 200px;\n  overflow-y: auto;\n}\n\n.saved-filters-search {\n  padding: 6px 8px;\n  border-bottom: 1px solid #eee;\n}\n\n.saved-filters-search-input {\n  width: 100%;\n  border: 1px solid #ddd;\n  border-radius: 4px;\n  padding: 4px 8px;\n  font-size: 13px;\n  outline: none;\n  &:focus {\n    border-color: #3f51b5;\n  }\n}\n\n.saved-filters-empty {\n  padding: 10px 12px;\n  font-size: 13px;\n  color: #999;\n}\n\n.saved-filters-option {\n  width: 100%;\n  text-align: left;\n  border: none;\n  background: #fff;\n  padding: 8px 12px;\n  font-size: 13px;\n  cursor: pointer;\n  color: #333;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  &:hover {\n    background: #e3f2fd;\n    color: #1565c0;\n  }\n}\n\n.saved-filters-default {\n  border-bottom: 1px solid #eee;\n}\n\n.saved-filter-icon {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n  color: #888;\n}\n\n.view-switcher-btn {\n  flex-shrink: 0;\n  width: 36px;\n  height: 36px;\n  color: #555;\n  &:hover {\n    color: #3f51b5;\n  }\n  &.active {\n    color: #3f51b5;\n    background: rgba(63, 81, 181, 0.08);\n    border-radius: 8px;\n  }\n}\n\n.drawer-results-header {\n  padding: 10px 16px;\n  font-size: 13px;\n  font-weight: 600;\n  color: #555;\n}\n\n.drawer-results-count {\n  font-size: 13px;\n}\n\n.drawer-results-loading,\n.drawer-results-empty {\n  padding: 24px 16px;\n  text-align: center;\n  color: #999;\n  font-size: 13px;\n}\n\n.drawer-results-list {\n  flex: 1;\n  overflow-y: auto;\n}\n\n.drawer-result-item {\n  display: flex;\n  align-items: center;\n  gap: 10px;\n  width: 100%;\n  padding: 8px 16px;\n  border: none;\n  background: none;\n  font: inherit;\n  text-align: left;\n  cursor: pointer;\n  &:hover {\n    background: #f5f5f5;\n  }\n}\n\n.drawer-result-thumb {\n  width: 40px;\n  height: 40px;\n  flex-shrink: 0;\n  border-radius: 4px;\n  background: #f0f0f0;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  overflow: hidden;\n}\n\n.drawer-result-thumb-img {\n  width: 100%;\n  height: 100%;\n  object-fit: cover;\n}\n\n.drawer-result-thumb-icon {\n  font-size: 22px;\n  width: 22px;\n  height: 22px;\n  color: #bbb;\n}\n\n.drawer-result-info {\n  min-width: 0;\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n}\n\n.drawer-result-title {\n  font-size: 13px;\n  font-weight: 500;\n  color: #333;\n  white-space: nowrap;\n  overflow: hidden;\n  text-overflow: ellipsis;\n}\n\n.drawer-result-type {\n  font-size: 11px;\n  color: #999;\n}\n\n.filters-section {\n  flex: 1;\n  overflow-y: auto;\n  padding: 8px 0;\n}\n\n.filters-heading {\n  font-size: 11px;\n  font-weight: 600;\n  text-transform: uppercase;\n  letter-spacing: 0.5px;\n  color: #999;\n  padding: 4px 16px 8px;\n  margin: 0;\n}\n\n.filter-group {\n  border-bottom: 1px solid #f5f5f5;\n  padding: 10px 16px 12px;\n}\n\n.filter-title {\n  margin: 0 0 8px;\n  font-size: 13px;\n  font-weight: 600;\n  color: #333;\n}\n\n.filter-input-wrap {\n  position: relative;\n}\n\n.filter-input {\n  width: 100%;\n  border: none;\n  border-bottom: 1px solid #4c4b67;\n  background: transparent;\n  font-size: 14px;\n  color: #333;\n  padding: 0 28px 8px 0;\n  outline: none;\n  box-sizing: border-box;\n\n  &::placeholder {\n    color: #aaa;\n  }\n  &:focus {\n    border-bottom-color: #3f51b5;\n  }\n}\n\n.clear-btn {\n  position: absolute;\n  right: 0;\n  bottom: 4px;\n  border: none;\n  background: none;\n  cursor: pointer;\n  padding: 0;\n  mat-icon {\n    font-size: 18px;\n    width: 18px;\n    height: 18px;\n    color: #999;\n  }\n}\n\n.filter-btn {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  width: 100%;\n  padding: 2px 0 4px;\n  background: none;\n  border: none;\n  cursor: pointer;\n  text-align: left;\n  color: #333;\n  &:hover {\n    background: #f5f5f5;\n  }\n}\n\n.filter-btn-label {\n  font-size: 14px;\n  font-weight: 500;\n}\n\n.filter-btn-icon {\n  font-size: 20px;\n  width: 20px;\n  height: 20px;\n  color: #666;\n  flex-shrink: 0;\n}\n\n.filter-options {\n  display: flex;\n  flex-direction: column;\n  padding: 4px 0 0;\n  gap: 4px;\n}\n\n.filter-checkbox {\n  display: block;\n}\n\n.typeahead-field {\n  position: relative;\n}\n\n.typeahead-input-wrap {\n  position: relative;\n  border-bottom: 1px solid #4c4b67;\n}\n\n.typeahead-input {\n  width: 100%;\n  border: none;\n  background: transparent;\n  font-size: 14px;\n  line-height: 1.2;\n  color: #4c4b67;\n  padding: 0 28px 8px 0;\n  outline: none;\n  &::placeholder {\n    color: #4f6382;\n    opacity: 1;\n  }\n}\n\n.typeahead-arrow {\n  position: absolute;\n  right: 0;\n  bottom: 7px;\n  color: #4c4b67;\n  pointer-events: none;\n}\n\n.typeahead-panel {\n  position: absolute;\n  left: 0;\n  right: 0;\n  top: calc(100% + 2px);\n  background: #fff;\n  border-radius: 0 0 4px 4px;\n  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.24);\n  z-index: 20;\n  max-height: 220px;\n  overflow-y: auto;\n}\n\n.typeahead-hint {\n  padding: 10px 12px;\n  color: #4c4b67;\n  font-size: 15px;\n}\n\n.typeahead-option {\n  width: 100%;\n  text-align: left;\n  border: none;\n  background: #fff;\n  color: #333;\n  padding: 10px 12px;\n  font-size: 13px;\n  cursor: pointer;\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  &:hover {\n    background: #f5f5f5;\n  }\n}\n\n.suggestion-icon {\n  font-size: 18px;\n  width: 18px;\n  height: 18px;\n  color: #666;\n}\n\n.option-count {\n  margin-left: auto;\n  font-size: 12px;\n  color: #999;\n}\n\n.drawer-footer {\n  flex-shrink: 0;\n  padding: 12px 16px;\n}\n\n.footer-actions {\n  display: flex;\n  gap: 8px;\n}\n\n.footer-btn {\n  flex: 1;\n}\n"] }]
    }], () => [], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(TrashFiltersDrawerComponent, { className: "TrashFiltersDrawerComponent", filePath: "libs/features/trash/src/lib/trash-filters-drawer/trash-filters-drawer.component.ts", lineNumber: 73 }); })();
