import { ChangeDetectionStrategy, Component, DestroyRef, LOCALE_ID, computed, effect, inject, input, signal, untracked, } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { DateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subject, catchError, debounceTime, defer, map, of, switchMap } from 'rxjs';
import { formatAceDateRange, isPermissionDeniedError, permissionRightLabel, } from '@nuxeo/satori-platform/nuxeo-client';
import { nxsDateFromAdapter, nxsDateToAdapter } from '../date-input/adapter-date';
import { provideNxsDateAdapter } from '../date-input/locale-date';
import { dayToDate, instantToDay, offeredPermissions, toDay, } from './permissions-model';
import { NxsPermissionsService } from './permissions-panel.service';
import * as i0 from "@angular/core";
import * as i1 from "@angular/material/autocomplete";
import * as i2 from "@angular/material/select";
import * as i3 from "@angular/material/button";
import * as i4 from "@angular/material/datepicker";
import * as i5 from "@angular/material/form-field";
import * as i6 from "@angular/material/icon";
import * as i7 from "@angular/material/input";
import * as i8 from "@angular/material/progress-spinner";
import * as i9 from "@angular/material/radio";
import * as i10 from "@angular/material/table";
import * as i11 from "@angular/material/tooltip";
const _c0 = a0 => ({ count: a0 });
const _c1 = (a0, a1) => ({ applied: a0, total: a1 });
const _c2 = a0 => ({ principal: a0 });
const _c3 = (a0, a1) => ({ principal: a0, permission: a1 });
const _forTrack0 = ($index, $item) => $item.label;
const _forTrack1 = ($index, $item) => $item.id;
function NxsPermissionsPanelComponent_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 6);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx.title);
} }
function NxsPermissionsPanelComponent_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 7);
    i0.ɵɵelement(1, "mat-progress-spinner", 9);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 1, "satori-components.permissions-panel.loading"));
} }
function NxsPermissionsPanelComponent_Conditional_6_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 11);
    i0.ɵɵlistener("click", function NxsPermissionsPanelComponent_Conditional_6_Conditional_4_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.reload()); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "satori-components.permissions-panel.retry"), " ");
} }
function NxsPermissionsPanelComponent_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 8)(1, "p");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(4, NxsPermissionsPanelComponent_Conditional_6_Conditional_4_Template, 3, 3, "button", 10);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, ctx_r1.loadErrorKey()));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx === "failed" ? 4 : -1);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_0_Case_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 23);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const result_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(2, 1, result_r3.count === 1 ? "satori-components.permissions-panel.saved.one" : "satori-components.permissions-panel.saved.many", i0.ɵɵpureFunction1(4, _c0, result_r3.count)), " ");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_0_Case_1_For_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "span", 29);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const refusal_r5 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.entryLabel(refusal_r5.principal, refusal_r5.permission));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(": ", i0.ɵɵpipeBind1(4, 2, ctx_r1.refusalReasonKey(refusal_r5)), " ");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_0_Case_1_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 24)(1, "p", 25);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "ul", 26);
    i0.ɵɵrepeaterCreate(5, NxsPermissionsPanelComponent_Conditional_7_Conditional_0_Case_1_For_6_Template, 5, 4, "li", null, i0.ɵɵrepeaterTrackByIndex);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "div", 27)(8, "button", 11);
    i0.ɵɵlistener("click", function NxsPermissionsPanelComponent_Conditional_7_Conditional_0_Case_1_Template_button_click_8_listener() { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.reload()); });
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "button", 28);
    i0.ɵɵlistener("click", function NxsPermissionsPanelComponent_Conditional_7_Conditional_0_Case_1_Template_button_click_11_listener() { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.dismissOutcome()); });
    i0.ɵɵtext(12);
    i0.ɵɵpipe(13, "translate");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const result_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 3, "satori-components.permissions-panel.refused.heading"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(result_r3.refusals);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(10, 5, "satori-components.permissions-panel.reload"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(13, 7, "satori-components.permissions-panel.dismiss"), " ");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_0_Case_2_For_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "span", 29);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const refusal_r6 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.entryLabel(refusal_r6.principal, refusal_r6.permission));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(": ", i0.ɵɵpipeBind1(4, 2, ctx_r1.refusalReasonKey(refusal_r6)), " ");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_0_Case_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 24)(1, "p", 25);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "ul", 26);
    i0.ɵɵrepeaterCreate(5, NxsPermissionsPanelComponent_Conditional_7_Conditional_0_Case_2_For_6_Template, 5, 4, "li", null, i0.ɵɵrepeaterTrackByIndex);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const result_r3 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 1, "satori-components.permissions-panel.unconfirmed.heading"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(result_r3.refusals);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_0_Case_3_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 24)(1, "p", 25);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p", 30);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "button", 11);
    i0.ɵɵlistener("click", function NxsPermissionsPanelComponent_Conditional_7_Conditional_0_Case_3_Template_button_click_6_listener() { i0.ɵɵrestoreView(_r7); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.reload()); });
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const result_r3 = i0.ɵɵnextContext();
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 3, "satori-components.permissions-panel.unread.heading"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx_r1.serverMessage(result_r3.error));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(8, 5, "satori-components.permissions-panel.reload"), " ");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_0_Case_4_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 24)(1, "p", 25);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "button", 11);
    i0.ɵɵlistener("click", function NxsPermissionsPanelComponent_Conditional_7_Conditional_0_Case_4_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r8); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.reload()); });
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 2, "satori-components.permissions-panel.unverified.heading"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(6, 4, "satori-components.permissions-panel.reload"), " ");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_0_Case_5_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "satori-components.permissions-panel.failed.denied"), " ");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_0_Case_5_Conditional_10_For_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li")(1, "span", 29);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const refusal_r9 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(5);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.entryLabel(refusal_r9.principal, refusal_r9.permission));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(": ", i0.ɵɵpipeBind1(4, 2, ctx_r1.refusalReasonKey(refusal_r9)), " ");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_0_Case_5_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 25);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "ul", 26);
    i0.ɵɵrepeaterCreate(4, NxsPermissionsPanelComponent_Conditional_7_Conditional_0_Case_5_Conditional_10_For_5_Template, 5, 4, "li", null, i0.ɵɵrepeaterTrackByIndex);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const result_r3 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "satori-components.permissions-panel.unconfirmed.heading"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(result_r3.unconfirmed);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_0_Case_5_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "p");
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "button", 11);
    i0.ɵɵlistener("click", function NxsPermissionsPanelComponent_Conditional_7_Conditional_0_Case_5_Conditional_11_Template_button_click_3_listener() { i0.ɵɵrestoreView(_r10); const ctx_r1 = i0.ɵɵnextContext(4); return i0.ɵɵresetView(ctx_r1.reload()); });
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 2, "satori-components.permissions-panel.unverified.heading"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 4, "satori-components.permissions-panel.reload"), " ");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_0_Case_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 24)(1, "p", 25);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "p")(5, "span", 29);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(7, NxsPermissionsPanelComponent_Conditional_7_Conditional_0_Case_5_Conditional_7_Template, 2, 3);
    i0.ɵɵelementStart(8, "span", 30);
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(10, NxsPermissionsPanelComponent_Conditional_7_Conditional_0_Case_5_Conditional_10_Template, 6, 3);
    i0.ɵɵconditionalCreate(11, NxsPermissionsPanelComponent_Conditional_7_Conditional_0_Case_5_Conditional_11_Template, 6, 6);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const result_r3 = i0.ɵɵnextContext();
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(3, 6, "satori-components.permissions-panel.failed.heading", i0.ɵɵpureFunction2(9, _c1, result_r3.applied, result_r3.total)), " ");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(ctx_r1.failedEntry(result_r3));
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.isDenied(result_r3.error) ? 7 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.serverMessage(result_r3.error));
    i0.ɵɵadvance();
    i0.ɵɵconditional(result_r3.unconfirmed.length > 0 ? 10 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(!result_r3.snapshot ? 11 : -1);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, NxsPermissionsPanelComponent_Conditional_7_Conditional_0_Case_0_Template, 3, 6, "p", 23)(1, NxsPermissionsPanelComponent_Conditional_7_Conditional_0_Case_1_Template, 14, 9, "div", 24)(2, NxsPermissionsPanelComponent_Conditional_7_Conditional_0_Case_2_Template, 7, 3, "div", 24)(3, NxsPermissionsPanelComponent_Conditional_7_Conditional_0_Case_3_Template, 9, 7, "div", 24)(4, NxsPermissionsPanelComponent_Conditional_7_Conditional_0_Case_4_Template, 7, 6, "div", 24)(5, NxsPermissionsPanelComponent_Conditional_7_Conditional_0_Case_5_Template, 12, 12, "div", 24);
} if (rf & 2) {
    let tmp_4_0;
    i0.ɵɵconditional((tmp_4_0 = ctx.kind) === "saved" ? 0 : tmp_4_0 === "refused" ? 1 : tmp_4_0 === "unconfirmed" ? 2 : tmp_4_0 === "unread" ? 3 : tmp_4_0 === "unverified" ? 4 : tmp_4_0 === "failed" ? 5 : -1);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    const _r11 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 31);
    i0.ɵɵlistener("click", function NxsPermissionsPanelComponent_Conditional_7_Conditional_6_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r11); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.openAdd()); });
    i0.ɵɵelementStart(1, "mat-icon", 32);
    i0.ɵɵtext(2, "add");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("disabled", !ctx_r1.editable());
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(4, 2, "satori-components.permissions-panel.add"), " ");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_7_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "satori-components.permissions-panel.editor.add-heading"), " ");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_7_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    const edit_r13 = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(1, 1, "satori-components.permissions-panel.editor.edit-heading", i0.ɵɵpureFunction1(4, _c2, edit_r13.item == null ? null : edit_r13.item.principal)), " ");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_7_Conditional_4_For_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 38)(1, "mat-icon", 32);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵtext(3);
    i0.ɵɵelementStart(4, "span", 37);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const suggestion_r16 = ctx.$implicit;
    i0.ɵɵproperty("value", suggestion_r16);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(suggestion_r16.type === "GROUP_TYPE" ? "group" : "person");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", suggestion_r16.displayLabel, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(suggestion_r16.id);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_7_Conditional_4_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 21);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "satori-components.permissions-panel.editor.no-principal"), " ");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_7_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    const _r14 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-form-field", 35)(1, "mat-label");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "input", 45, 0);
    i0.ɵɵlistener("input", function NxsPermissionsPanelComponent_Conditional_7_Conditional_7_Conditional_4_Template_input_input_4_listener() { i0.ɵɵrestoreView(_r14); const principalInput_r15 = i0.ɵɵreference(5); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.onPrincipalInput(principalInput_r15.value)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "mat-autocomplete", 46, 1);
    i0.ɵɵlistener("optionSelected", function NxsPermissionsPanelComponent_Conditional_7_Conditional_7_Conditional_4_Template_mat_autocomplete_optionSelected_6_listener($event) { i0.ɵɵrestoreView(_r14); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.onPrincipalSelected($event.option.value)); });
    i0.ɵɵrepeaterCreate(8, NxsPermissionsPanelComponent_Conditional_7_Conditional_7_Conditional_4_For_9_Template, 6, 4, "mat-option", 38, _forTrack1);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(10, NxsPermissionsPanelComponent_Conditional_7_Conditional_7_Conditional_4_Conditional_10_Template, 3, 3, "p", 21);
} if (rf & 2) {
    const principalAuto_r17 = i0.ɵɵreference(7);
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 5, "satori-components.permissions-panel.editor.principal"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("value", ctx_r1.editorQuery())("matAutocomplete", principalAuto_r17);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("displayWith", ctx_r1.displaySuggestion);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.suggestions());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.editorSubmitted() && !ctx_r1.editorPrincipal() ? 10 : -1);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_7_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 37);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.editorPermission());
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_7_For_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 38);
    i0.ɵɵtext(1);
    i0.ɵɵelementStart(2, "span", 37);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const extra_r18 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("value", extra_r18);
    i0.ɵɵattribute("data-permission", extra_r18);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.permissionLabel(extra_r18), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(extra_r18);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_7_For_16_For_3_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 37);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const permission_r19 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(permission_r19);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_7_For_16_For_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 38);
    i0.ɵɵtext(1);
    i0.ɵɵconditionalCreate(2, NxsPermissionsPanelComponent_Conditional_7_Conditional_7_For_16_For_3_Conditional_2_Template, 2, 1, "span", 37);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const permission_r19 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("value", permission_r19);
    i0.ɵɵattribute("data-permission", permission_r19);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.permissionLabel(permission_r19), " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.permissionLabel(permission_r19) !== permission_r19 ? 2 : -1);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_7_For_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-optgroup", 39);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵrepeaterCreate(2, NxsPermissionsPanelComponent_Conditional_7_Conditional_7_For_16_For_3_Template, 3, 4, "mat-option", 38, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const group_r20 = ctx.$implicit;
    i0.ɵɵproperty("label", i0.ɵɵpipeBind1(1, 1, group_r20.label));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(group_r20.permissions);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_7_Conditional_25_Conditional_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 21);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "satori-components.permissions-panel.editor.end-before-begin"), " ");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_7_Conditional_25_Template(rf, ctx) { if (rf & 1) {
    const _r21 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 47)(1, "mat-form-field", 48)(2, "mat-label");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "input", 49);
    i0.ɵɵlistener("dateChange", function NxsPermissionsPanelComponent_Conditional_7_Conditional_7_Conditional_25_Template_input_dateChange_5_listener($event) { i0.ɵɵrestoreView(_r21); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.editorBegin.set(ctx_r1.fieldDay($event.value))); });
    i0.ɵɵelementEnd();
    i0.ɵɵelement(6, "mat-datepicker-toggle", 50)(7, "mat-datepicker", null, 2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "mat-form-field", 48)(10, "mat-label");
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "input", 49);
    i0.ɵɵlistener("dateChange", function NxsPermissionsPanelComponent_Conditional_7_Conditional_7_Conditional_25_Template_input_dateChange_13_listener($event) { i0.ɵɵrestoreView(_r21); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.editorEnd.set(ctx_r1.fieldDay($event.value))); });
    i0.ɵɵelementEnd();
    i0.ɵɵelement(14, "mat-datepicker-toggle", 50)(15, "mat-datepicker", null, 3);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(17, NxsPermissionsPanelComponent_Conditional_7_Conditional_7_Conditional_25_Conditional_17_Template, 3, 3, "p", 21);
} if (rf & 2) {
    const beginPicker_r22 = i0.ɵɵreference(8);
    const endPicker_r23 = i0.ɵɵreference(16);
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 9, "satori-components.permissions-panel.editor.from"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("matDatepicker", beginPicker_r22)("value", ctx_r1.editorBeginField());
    i0.ɵɵadvance();
    i0.ɵɵproperty("for", beginPicker_r22);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(12, 11, "satori-components.permissions-panel.editor.to"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("matDatepicker", endPicker_r23)("value", ctx_r1.editorEndField());
    i0.ɵɵadvance();
    i0.ɵɵproperty("for", endPicker_r23);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r1.editorInvalidRange() ? 17 : -1);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    const _r12 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "form", 33);
    i0.ɵɵlistener("submit", function NxsPermissionsPanelComponent_Conditional_7_Conditional_7_Template_form_submit_0_listener($event) { i0.ɵɵrestoreView(_r12); const ctx_r1 = i0.ɵɵnextContext(2); $event.preventDefault(); return i0.ɵɵresetView(ctx_r1.applyEditor()); });
    i0.ɵɵelementStart(1, "div", 34);
    i0.ɵɵconditionalCreate(2, NxsPermissionsPanelComponent_Conditional_7_Conditional_7_Conditional_2_Template, 2, 3)(3, NxsPermissionsPanelComponent_Conditional_7_Conditional_7_Conditional_3_Template, 2, 6);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(4, NxsPermissionsPanelComponent_Conditional_7_Conditional_7_Conditional_4_Template, 11, 7);
    i0.ɵɵelementStart(5, "mat-form-field", 35)(6, "mat-label");
    i0.ɵɵtext(7);
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "mat-select", 36);
    i0.ɵɵlistener("selectionChange", function NxsPermissionsPanelComponent_Conditional_7_Conditional_7_Template_mat_select_selectionChange_9_listener($event) { i0.ɵɵrestoreView(_r12); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.editorPermission.set($event.value)); });
    i0.ɵɵelementStart(10, "mat-select-trigger");
    i0.ɵɵtext(11);
    i0.ɵɵconditionalCreate(12, NxsPermissionsPanelComponent_Conditional_7_Conditional_7_Conditional_12_Template, 2, 1, "span", 37);
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(13, NxsPermissionsPanelComponent_Conditional_7_Conditional_7_For_14_Template, 4, 4, "mat-option", 38, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵrepeaterCreate(15, NxsPermissionsPanelComponent_Conditional_7_Conditional_7_For_16_Template, 4, 3, "mat-optgroup", 39, _forTrack0);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(17, "mat-radio-group", 40);
    i0.ɵɵpipe(18, "translate");
    i0.ɵɵlistener("change", function NxsPermissionsPanelComponent_Conditional_7_Conditional_7_Template_mat_radio_group_change_17_listener($event) { i0.ɵɵrestoreView(_r12); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.editorDated.set($event.value === "dated")); });
    i0.ɵɵelementStart(19, "mat-radio-button", 41);
    i0.ɵɵtext(20);
    i0.ɵɵpipe(21, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(22, "mat-radio-button", 42);
    i0.ɵɵtext(23);
    i0.ɵɵpipe(24, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(25, NxsPermissionsPanelComponent_Conditional_7_Conditional_7_Conditional_25_Template, 18, 13);
    i0.ɵɵelementStart(26, "div", 43)(27, "button", 28);
    i0.ɵɵlistener("click", function NxsPermissionsPanelComponent_Conditional_7_Conditional_7_Template_button_click_27_listener() { i0.ɵɵrestoreView(_r12); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.closeEditor()); });
    i0.ɵɵtext(28);
    i0.ɵɵpipe(29, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(30, "button", 44);
    i0.ɵɵtext(31);
    i0.ɵɵpipe(32, "translate");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const edit_r13 = ctx;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵattribute("aria-labelledby", ctx_r1.idPrefix + "-editor-heading");
    i0.ɵɵadvance();
    i0.ɵɵproperty("id", ctx_r1.idPrefix + "-editor-heading");
    i0.ɵɵadvance();
    i0.ɵɵconditional(edit_r13.mode === "add" ? 2 : 3);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(edit_r13.mode === "add" ? 4 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(8, 16, "satori-components.permissions-panel.editor.permission"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("value", ctx_r1.editorPermission());
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.permissionLabel(ctx_r1.editorPermission()), " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.permissionLabel(ctx_r1.editorPermission()) !== ctx_r1.editorPermission() ? 12 : -1);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.editorExtraPermissions());
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.permissionGroups());
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("value", ctx_r1.editorDated() ? "dated" : "permanent");
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(18, 18, "satori-components.permissions-panel.column.time-frame"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(21, 20, "satori-components.permissions-panel.editor.permanent"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(24, 22, "satori-components.permissions-panel.editor.date-based"));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.editorDated() ? 25 : -1);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(29, 24, "satori-components.permissions-panel.editor.cancel"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", !ctx_r1.editable());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(32, 26, edit_r13.mode === "add" ? "satori-components.permissions-panel.editor.add" : "satori-components.permissions-panel.editor.apply"), " ");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 17);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "satori-components.permissions-panel.local.empty"), " ");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_th_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 61);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "satori-components.permissions-panel.column.principal"), " ");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_3_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵelementStart(1, "span", 37);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r24 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵtextInterpolate1(" ", item_r24.principalLabel, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r24.principal);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_3_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const item_r24 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵtextInterpolate1(" ", item_r24.principal, " ");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_3_Case_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 63);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.permissions-panel.state.added"));
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_3_Case_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 63);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.permissions-panel.state.changed"));
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_3_Case_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 64);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.permissions-panel.state.removed"));
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 62);
    i0.ɵɵconditionalCreate(1, NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_3_Conditional_1_Template, 3, 2)(2, NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_3_Conditional_2_Template, 1, 1);
    i0.ɵɵconditionalCreate(3, NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_3_Case_3_Template, 3, 3, "span", 63)(4, NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_3_Case_4_Template, 3, 3, "span", 63)(5, NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_3_Case_5_Template, 3, 3, "span", 64);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    let tmp_6_0;
    const item_r24 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵconditional(item_r24.principalLabel && item_r24.principalLabel !== item_r24.principal ? 1 : 2);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional((tmp_6_0 = item_r24.state) === "added" ? 3 : tmp_6_0 === "changed" ? 4 : tmp_6_0 === "removed" ? 5 : -1);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_th_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 61);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "satori-components.permissions-panel.column.permission"), " ");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_6_Conditional_1_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 37);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r26 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r26.permission);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_6_Conditional_1_For_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 38);
    i0.ɵɵtext(1);
    i0.ɵɵelementStart(2, "span", 37);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const extra_r27 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(5);
    i0.ɵɵproperty("value", extra_r27);
    i0.ɵɵattribute("data-permission", extra_r27);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.permissionLabel(extra_r27), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(extra_r27);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_6_Conditional_1_For_8_For_3_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 37);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const permission_r28 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(permission_r28);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_6_Conditional_1_For_8_For_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 38);
    i0.ɵɵtext(1);
    i0.ɵɵconditionalCreate(2, NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_6_Conditional_1_For_8_For_3_Conditional_2_Template, 2, 1, "span", 37);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const permission_r28 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(6);
    i0.ɵɵproperty("value", permission_r28);
    i0.ɵɵattribute("data-permission", permission_r28);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.permissionLabel(permission_r28), " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.permissionLabel(permission_r28) !== permission_r28 ? 2 : -1);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_6_Conditional_1_For_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-optgroup", 39);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵrepeaterCreate(2, NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_6_Conditional_1_For_8_For_3_Template, 3, 4, "mat-option", 38, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const group_r29 = ctx.$implicit;
    i0.ɵɵproperty("label", i0.ɵɵpipeBind1(1, 1, group_r29.label));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(group_r29.permissions);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_6_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r25 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-select", 67);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵlistener("selectionChange", function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_6_Conditional_1_Template_mat_select_selectionChange_0_listener($event) { i0.ɵɵrestoreView(_r25); const item_r26 = i0.ɵɵnextContext().$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.setPermission(item_r26, $event.value)); });
    i0.ɵɵelementStart(2, "mat-select-trigger");
    i0.ɵɵtext(3);
    i0.ɵɵconditionalCreate(4, NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_6_Conditional_1_Conditional_4_Template, 2, 1, "span", 37);
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(5, NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_6_Conditional_1_For_6_Template, 4, 4, "mat-option", 38, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵrepeaterCreate(7, NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_6_Conditional_1_For_8_Template, 4, 3, "mat-optgroup", 39, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r26 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("value", item_r26.permission)("disabled", !ctx_r1.editable());
    i0.ɵɵariaProperty("aria-label", i0.ɵɵpipeBind2(1, 5, "satori-components.permissions-panel.permission-for", i0.ɵɵpureFunction1(8, _c2, item_r26.principal)));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.permissionLabel(item_r26.permission), " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.permissionLabel(item_r26.permission) !== item_r26.permission ? 4 : -1);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(item_r26.extraPermissions);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.permissionGroups());
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_6_Conditional_2_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 37);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r26 = i0.ɵɵnextContext(2).$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r26.permission);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_6_Conditional_2_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 64);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.permissions-panel.denied"));
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_6_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵconditionalCreate(1, NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_6_Conditional_2_Conditional_1_Template, 2, 1, "span", 37);
    i0.ɵɵconditionalCreate(2, NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_6_Conditional_2_Conditional_2_Template, 3, 3, "span", 64);
} if (rf & 2) {
    const item_r26 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.permissionLabel(item_r26.permission), " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.permissionLabel(item_r26.permission) !== item_r26.permission ? 1 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(!item_r26.granted ? 2 : -1);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_6_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 66);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r26 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, item_r26.lockedReason));
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 62);
    i0.ɵɵconditionalCreate(1, NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_6_Conditional_1_Template, 9, 10, "mat-select", 65)(2, NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_6_Conditional_2_Template, 3, 3);
    i0.ɵɵconditionalCreate(3, NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_6_Conditional_3_Template, 3, 3, "span", 66);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r26 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.canManage() && !item_r26.lockedReason && item_r26.state !== "removed" ? 1 : 2);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(item_r26.lockedReason && ctx_r1.canManage() ? 3 : -1);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_th_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 61);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "satori-components.permissions-panel.column.time-frame"), " ");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_9_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 63);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.permissions-panel.status.pending"));
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_9_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 63);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.permissions-panel.status.archived"));
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 62);
    i0.ɵɵtext(1);
    i0.ɵɵconditionalCreate(2, NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_9_Conditional_2_Template, 3, 3, "span", 63);
    i0.ɵɵconditionalCreate(3, NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_9_Conditional_3_Template, 3, 3, "span", 63);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r30 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.timeFrame(item_r30.begin, item_r30.end), " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional(item_r30.state === "unchanged" && (item_r30.row == null ? null : item_r30.row.status) === "pending" ? 2 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(item_r30.state === "unchanged" && (item_r30.row == null ? null : item_r30.row.status) === "archived" ? 3 : -1);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_th_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 61);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "satori-components.permissions-panel.column.granted-by"), " ");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 62);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const item_r31 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate((item_r31.row == null ? null : item_r31.row.creator) || "\u2014");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_th_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 61)(1, "span", 68);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 1, "satori-components.permissions-panel.column.actions"));
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_15_Conditional_1_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r32 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 72);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵlistener("click", function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_15_Conditional_1_Conditional_0_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r32); const item_r33 = i0.ɵɵnextContext(2).$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.openEdit(item_r33)); });
    i0.ɵɵelementStart(3, "mat-icon", 32);
    i0.ɵɵtext(4, "edit");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r33 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(1, 3, "satori-components.permissions-panel.edit"))("disabled", !ctx_r1.editable());
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind2(2, 5, "satori-components.permissions-panel.edit-entry", i0.ɵɵpureFunction1(8, _c2, item_r33.principal)));
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_15_Conditional_1_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r34 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 73);
    i0.ɵɵlistener("click", function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_15_Conditional_1_Conditional_1_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r34); const item_r33 = i0.ɵɵnextContext(2).$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.toggleRemove(item_r33)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(5);
    i0.ɵɵproperty("disabled", !ctx_r1.editable());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, "satori-components.permissions-panel.undo"), " ");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_15_Conditional_1_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r35 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 72);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵlistener("click", function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_15_Conditional_1_Conditional_2_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r35); const item_r33 = i0.ɵɵnextContext(2).$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.toggleRemove(item_r33)); });
    i0.ɵɵelementStart(3, "mat-icon", 32);
    i0.ɵɵtext(4, "delete");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r33 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(1, 3, "satori-components.permissions-panel.remove"))("disabled", !ctx_r1.editable());
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind2(2, 5, "satori-components.permissions-panel.remove-entry", i0.ɵɵpureFunction2(8, _c3, item_r33.principal, ctx_r1.permissionLabel(item_r33.permission))));
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_15_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_15_Conditional_1_Conditional_0_Template, 5, 10, "button", 70);
    i0.ɵɵconditionalCreate(1, NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_15_Conditional_1_Conditional_1_Template, 3, 4, "button", 71)(2, NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_15_Conditional_1_Conditional_2_Template, 5, 11, "button", 70);
} if (rf & 2) {
    const item_r33 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵconditional(!item_r33.lockedReason && item_r33.state !== "removed" ? 0 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(item_r33.state === "removed" ? 1 : item_r33.lockedReason !== "satori-components.permissions-panel.locked.no-id" ? 2 : -1);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 69);
    i0.ɵɵconditionalCreate(1, NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_15_Conditional_1_Template, 3, 2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.canManage() ? 1 : -1);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_tr_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 74);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_tr_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 75);
} if (rf & 2) {
    const item_r36 = ctx.$implicit;
    i0.ɵɵclassProp("nxs-permissions-panel__row--removed", item_r36.state === "removed")("nxs-permissions-panel__row--pending", item_r36.state !== "unchanged");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "table", 18);
    i0.ɵɵelementContainerStart(1, 51);
    i0.ɵɵtemplate(2, NxsPermissionsPanelComponent_Conditional_7_Conditional_9_th_2_Template, 3, 3, "th", 52)(3, NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_3_Template, 6, 2, "td", 53);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(4, 54);
    i0.ɵɵtemplate(5, NxsPermissionsPanelComponent_Conditional_7_Conditional_9_th_5_Template, 3, 3, "th", 52)(6, NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_6_Template, 4, 2, "td", 53);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(7, 55);
    i0.ɵɵtemplate(8, NxsPermissionsPanelComponent_Conditional_7_Conditional_9_th_8_Template, 3, 3, "th", 52)(9, NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_9_Template, 4, 3, "td", 53);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(10, 56);
    i0.ɵɵtemplate(11, NxsPermissionsPanelComponent_Conditional_7_Conditional_9_th_11_Template, 3, 3, "th", 52)(12, NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_12_Template, 2, 1, "td", 53);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(13, 57);
    i0.ɵɵtemplate(14, NxsPermissionsPanelComponent_Conditional_7_Conditional_9_th_14_Template, 4, 3, "th", 52)(15, NxsPermissionsPanelComponent_Conditional_7_Conditional_9_td_15_Template, 2, 1, "td", 58);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵtemplate(16, NxsPermissionsPanelComponent_Conditional_7_Conditional_9_tr_16_Template, 1, 0, "tr", 59)(17, NxsPermissionsPanelComponent_Conditional_7_Conditional_9_tr_17_Template, 1, 4, "tr", 60);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("dataSource", ctx_r1.localItems())("trackBy", ctx_r1.trackItem);
    i0.ɵɵattribute("aria-labelledby", ctx_r1.idPrefix + "-local");
    i0.ɵɵadvance(16);
    i0.ɵɵproperty("matHeaderRowDef", ctx_r1.localColumns);
    i0.ɵɵadvance();
    i0.ɵɵproperty("matRowDefColumns", ctx_r1.localColumns);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    const _r37 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 19)(1, "span", 76);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(4, "span", 77);
    i0.ɵɵelementStart(5, "button", 73);
    i0.ɵɵlistener("click", function NxsPermissionsPanelComponent_Conditional_7_Conditional_10_Template_button_click_5_listener() { i0.ɵɵrestoreView(_r37); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.discard()); });
    i0.ɵɵtext(6);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "button", 78);
    i0.ɵɵlistener("click", function NxsPermissionsPanelComponent_Conditional_7_Conditional_10_Template_button_click_8_listener() { i0.ɵɵrestoreView(_r37); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.save()); });
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind2(3, 5, ctx_r1.pendingCount() === 1 ? "satori-components.permissions-panel.pending.one" : "satori-components.permissions-panel.pending.many", i0.ɵɵpureFunction1(12, _c0, ctx_r1.pendingCount())));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("disabled", ctx_r1.saving());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(7, 8, "satori-components.permissions-panel.discard"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r1.saving());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(10, 10, "satori-components.permissions-panel.save"), " ");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_16_Template(rf, ctx) { if (rf & 1) {
    const _r38 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 79);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵlistener("click", function NxsPermissionsPanelComponent_Conditional_7_Conditional_16_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r38); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.toggleInheritance()); });
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const current_r39 = i0.ɵɵnextContext();
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("disabled", ctx_r1.inheritanceBusy() || ctx_r1.pendingCount() > 0)("matTooltip", ctx_r1.pendingCount() > 0 ? i0.ɵɵpipeBind1(1, 3, "satori-components.permissions-panel.inherited.save-first") : "");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 5, current_r39.inheritanceBlocked ? "satori-components.permissions-panel.inherited.unblock" : "satori-components.permissions-panel.inherited.block"), " ");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 21);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementStart(3, "span", 30);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 2, "satori-components.permissions-panel.inherited.toggle-failed"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(ctx);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 17);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "satori-components.permissions-panel.inherited.blocked"), " ");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_19_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 17);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "satori-components.permissions-panel.inherited.empty"), " ");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_20_th_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 61);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "satori-components.permissions-panel.column.principal"), " ");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_20_td_3_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵelementStart(1, "span", 37);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r40 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵtextInterpolate1(" ", row_r40.principalLabel, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(row_r40.principal);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_20_td_3_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const row_r40 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵtextInterpolate1(" ", row_r40.principal, " ");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_20_td_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 62);
    i0.ɵɵconditionalCreate(1, NxsPermissionsPanelComponent_Conditional_7_Conditional_20_td_3_Conditional_1_Template, 3, 2)(2, NxsPermissionsPanelComponent_Conditional_7_Conditional_20_td_3_Conditional_2_Template, 1, 1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r40 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵconditional(row_r40.principalLabel && row_r40.principalLabel !== row_r40.principal ? 1 : 2);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_20_th_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 61);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "satori-components.permissions-panel.column.permission"), " ");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_20_td_6_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 37);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r41 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(row_r41.permission);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_20_td_6_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 64);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.permissions-panel.denied"));
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_20_td_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 62);
    i0.ɵɵtext(1);
    i0.ɵɵconditionalCreate(2, NxsPermissionsPanelComponent_Conditional_7_Conditional_20_td_6_Conditional_2_Template, 2, 1, "span", 37);
    i0.ɵɵconditionalCreate(3, NxsPermissionsPanelComponent_Conditional_7_Conditional_20_td_6_Conditional_3_Template, 3, 3, "span", 64);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r41 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.permissionLabel(row_r41.permission), " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.permissionLabel(row_r41.permission) !== row_r41.permission ? 2 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(!row_r41.granted ? 3 : -1);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_20_th_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 61);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "satori-components.permissions-panel.column.time-frame"), " ");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_20_td_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 62);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r42 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.timeFrame(row_r42.begin, row_r42.end));
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_20_th_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 61);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "satori-components.permissions-panel.column.granted-by"), " ");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_20_td_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 62);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r43 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(row_r43.creator || "\u2014");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_20_tr_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 74);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_20_tr_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 75);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_20_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "table", 22);
    i0.ɵɵelementContainerStart(1, 51);
    i0.ɵɵtemplate(2, NxsPermissionsPanelComponent_Conditional_7_Conditional_20_th_2_Template, 3, 3, "th", 52)(3, NxsPermissionsPanelComponent_Conditional_7_Conditional_20_td_3_Template, 3, 1, "td", 53);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(4, 54);
    i0.ɵɵtemplate(5, NxsPermissionsPanelComponent_Conditional_7_Conditional_20_th_5_Template, 3, 3, "th", 52)(6, NxsPermissionsPanelComponent_Conditional_7_Conditional_20_td_6_Template, 4, 3, "td", 53);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(7, 55);
    i0.ɵɵtemplate(8, NxsPermissionsPanelComponent_Conditional_7_Conditional_20_th_8_Template, 3, 3, "th", 52)(9, NxsPermissionsPanelComponent_Conditional_7_Conditional_20_td_9_Template, 2, 1, "td", 53);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(10, 56);
    i0.ɵɵtemplate(11, NxsPermissionsPanelComponent_Conditional_7_Conditional_20_th_11_Template, 3, 3, "th", 52)(12, NxsPermissionsPanelComponent_Conditional_7_Conditional_20_td_12_Template, 2, 1, "td", 53);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵtemplate(13, NxsPermissionsPanelComponent_Conditional_7_Conditional_20_tr_13_Template, 1, 0, "tr", 59)(14, NxsPermissionsPanelComponent_Conditional_7_Conditional_20_tr_14_Template, 1, 0, "tr", 80);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const current_r39 = i0.ɵɵnextContext();
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵproperty("dataSource", current_r39.inherited);
    i0.ɵɵattribute("aria-labelledby", ctx_r1.idPrefix + "-inherited");
    i0.ɵɵadvance(13);
    i0.ɵɵproperty("matHeaderRowDef", ctx_r1.inheritedColumns);
    i0.ɵɵadvance();
    i0.ɵɵproperty("matRowDefColumns", ctx_r1.inheritedColumns);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_21_th_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 61);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "satori-components.permissions-panel.column.principal"), " ");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_21_td_7_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵelementStart(1, "span", 37);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r44 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵtextInterpolate1(" ", row_r44.principalLabel, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(row_r44.principal);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_21_td_7_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const row_r44 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵtextInterpolate1(" ", row_r44.principal, " ");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_21_td_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 62);
    i0.ɵɵconditionalCreate(1, NxsPermissionsPanelComponent_Conditional_7_Conditional_21_td_7_Conditional_1_Template, 3, 2)(2, NxsPermissionsPanelComponent_Conditional_7_Conditional_21_td_7_Conditional_2_Template, 1, 1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r44 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵconditional(row_r44.principalLabel && row_r44.principalLabel !== row_r44.principal ? 1 : 2);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_21_th_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 61);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "satori-components.permissions-panel.column.permission"), " ");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_21_td_10_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 37);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r45 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(row_r45.permission);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_21_td_10_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 64);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.permissions-panel.denied"));
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_21_td_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 62);
    i0.ɵɵtext(1);
    i0.ɵɵconditionalCreate(2, NxsPermissionsPanelComponent_Conditional_7_Conditional_21_td_10_Conditional_2_Template, 2, 1, "span", 37);
    i0.ɵɵconditionalCreate(3, NxsPermissionsPanelComponent_Conditional_7_Conditional_21_td_10_Conditional_3_Template, 3, 3, "span", 64);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r45 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.permissionLabel(row_r45.permission), " ");
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.permissionLabel(row_r45.permission) !== row_r45.permission ? 2 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(!row_r45.granted ? 3 : -1);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_21_th_12_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 61);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "satori-components.permissions-panel.column.time-frame"), " ");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_21_td_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 62);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r46 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.timeFrame(row_r46.begin, row_r46.end));
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_21_th_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "th", 61);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "satori-components.permissions-panel.column.acl"), " ");
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_21_td_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "td", 62);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const row_r47 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(row_r47.acl);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_21_tr_17_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 74);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_21_tr_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "tr", 75);
} }
function NxsPermissionsPanelComponent_Conditional_7_Conditional_21_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 12)(1, "div", 14);
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "table", 22);
    i0.ɵɵelementContainerStart(5, 51);
    i0.ɵɵtemplate(6, NxsPermissionsPanelComponent_Conditional_7_Conditional_21_th_6_Template, 3, 3, "th", 52)(7, NxsPermissionsPanelComponent_Conditional_7_Conditional_21_td_7_Template, 3, 1, "td", 53);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(8, 54);
    i0.ɵɵtemplate(9, NxsPermissionsPanelComponent_Conditional_7_Conditional_21_th_9_Template, 3, 3, "th", 52)(10, NxsPermissionsPanelComponent_Conditional_7_Conditional_21_td_10_Template, 4, 3, "td", 53);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(11, 55);
    i0.ɵɵtemplate(12, NxsPermissionsPanelComponent_Conditional_7_Conditional_21_th_12_Template, 3, 3, "th", 52)(13, NxsPermissionsPanelComponent_Conditional_7_Conditional_21_td_13_Template, 2, 1, "td", 53);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵelementContainerStart(14, 81);
    i0.ɵɵtemplate(15, NxsPermissionsPanelComponent_Conditional_7_Conditional_21_th_15_Template, 3, 3, "th", 52)(16, NxsPermissionsPanelComponent_Conditional_7_Conditional_21_td_16_Template, 2, 1, "td", 53);
    i0.ɵɵelementContainerEnd();
    i0.ɵɵtemplate(17, NxsPermissionsPanelComponent_Conditional_7_Conditional_21_tr_17_Template, 1, 0, "tr", 59)(18, NxsPermissionsPanelComponent_Conditional_7_Conditional_21_tr_18_Template, 1, 0, "tr", 80);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const current_r39 = i0.ɵɵnextContext();
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵattribute("aria-labelledby", ctx_r1.idPrefix + "-other");
    i0.ɵɵadvance();
    i0.ɵɵproperty("id", ctx_r1.idPrefix + "-other");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 7, "satori-components.permissions-panel.other.heading"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("dataSource", current_r39.otherAcls);
    i0.ɵɵattribute("aria-labelledby", ctx_r1.idPrefix + "-other");
    i0.ɵɵadvance(13);
    i0.ɵɵproperty("matHeaderRowDef", ctx_r1.otherColumns);
    i0.ɵɵadvance();
    i0.ɵɵproperty("matRowDefColumns", ctx_r1.otherColumns);
} }
function NxsPermissionsPanelComponent_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, NxsPermissionsPanelComponent_Conditional_7_Conditional_0_Template, 6, 1);
    i0.ɵɵelementStart(1, "section", 12)(2, "div", 13)(3, "div", 14);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(6, NxsPermissionsPanelComponent_Conditional_7_Conditional_6_Template, 5, 4, "button", 15);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(7, NxsPermissionsPanelComponent_Conditional_7_Conditional_7_Template, 33, 28, "form", 16);
    i0.ɵɵconditionalCreate(8, NxsPermissionsPanelComponent_Conditional_7_Conditional_8_Template, 3, 3, "p", 17)(9, NxsPermissionsPanelComponent_Conditional_7_Conditional_9_Template, 18, 5, "table", 18);
    i0.ɵɵconditionalCreate(10, NxsPermissionsPanelComponent_Conditional_7_Conditional_10_Template, 11, 14, "div", 19);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "section", 12)(12, "div", 13)(13, "div", 14);
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(16, NxsPermissionsPanelComponent_Conditional_7_Conditional_16_Template, 4, 7, "button", 20);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(17, NxsPermissionsPanelComponent_Conditional_7_Conditional_17_Template, 5, 4, "p", 21);
    i0.ɵɵconditionalCreate(18, NxsPermissionsPanelComponent_Conditional_7_Conditional_18_Template, 3, 3, "p", 17)(19, NxsPermissionsPanelComponent_Conditional_7_Conditional_19_Template, 3, 3, "p", 17)(20, NxsPermissionsPanelComponent_Conditional_7_Conditional_20_Template, 15, 4, "table", 22);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(21, NxsPermissionsPanelComponent_Conditional_7_Conditional_21_Template, 19, 9, "section", 12);
} if (rf & 2) {
    let tmp_2_0;
    let tmp_7_0;
    let tmp_14_0;
    const current_r39 = ctx;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵconditional((tmp_2_0 = ctx_r1.outcome()) ? 0 : -1, tmp_2_0);
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-labelledby", ctx_r1.idPrefix + "-local");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("id", ctx_r1.idPrefix + "-local");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 15, "satori-components.permissions-panel.local.heading"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.canManage() && !ctx_r1.editor() ? 6 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_7_0 = ctx_r1.editor()) ? 7 : -1, tmp_7_0);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.localItems().length === 0 ? 8 : 9);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.pendingCount() > 0 ? 10 : -1);
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-labelledby", ctx_r1.idPrefix + "-inherited");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("id", ctx_r1.idPrefix + "-inherited");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(15, 17, "satori-components.permissions-panel.inherited.heading"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.canManage() ? 16 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_14_0 = ctx_r1.inheritanceError()) ? 17 : -1, tmp_14_0);
    i0.ɵɵadvance();
    i0.ɵɵconditional(current_r39.inheritanceBlocked ? 18 : current_r39.inherited.length === 0 ? 19 : 20);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(current_r39.otherAcls.length > 0 ? 21 : -1);
} }
/** The ID the panel is registered under, so a customer library can re-register a replacement. */
export const NXS_PERMISSIONS_PANEL_ID = 'nxs.components.permissionsPanel';
let nextId = 0;
/**
 * A document's permissions: local and inherited ACEs, blocked inheritance, and each ACE's time
 * frame and status, with add, edit and remove over the server's list for the document type, Nuxeo's
 * standard permissions and every other permission the server reports to the user.
 *
 * **Every write addresses one ACE.** Changes are staged and applied on Save as one
 * `Document.AddPermission`, `ReplacePermission` or `RemovePermission`-by-id per change, so an
 * entry the user did not touch is never written. Before writing, the ACL is read again and a
 * change that cannot be written faithfully refuses the whole save, naming each entry and why;
 * afterwards it is read once more and any change the server does not show is reported. See
 * `refusalsFor` and `unconfirmedChanges`.
 *
 * **Hiding a control is not a security control.** The panel offers editing when the read says the
 * user holds `WriteSecurity` or `Everything` and the document is not a version, and Nuxeo checks
 * every write regardless.
 *
 * Its chrome is translated through ngx-translate under `satori-components.permissions-panel.*`,
 * and permission names under `permissions.right.*`, both in the application's catalogue.
 * External-user sharing is not shown here; the host owns that flow.
 */
export class NxsPermissionsPanelComponent {
    /** The uid of the document whose permissions to show. */
    documentId = input.required(...(ngDevMode ? [{ debugName: "documentId" }] : []));
    /**
     * Called after a write that may have changed the document's ACL, so a host showing other
     * ACL-derived content — the external-user shares this panel leaves to it — can read it again.
     */
    permissionsChanged = input(null, ...(ngDevMode ? [{ debugName: "permissionsChanged" }] : []));
    service = inject(NxsPermissionsService);
    translate = inject(TranslateService);
    locale = inject(LOCALE_ID);
    destroyRef = inject(DestroyRef);
    /** The date fields' adapter, from `provideNxsDateAdapter()`: a host's may not hold JS dates. */
    dateAdapter = inject(DateAdapter);
    /** Starts every id the template sets, so two panels on one page never share one. */
    idPrefix = `nxs-permissions-${nextId++}`;
    localColumns = [
        'principal',
        'permission',
        'timeFrame',
        'grantedBy',
        'actions',
    ];
    inheritedColumns = ['principal', 'permission', 'timeFrame', 'grantedBy'];
    otherColumns = ['principal', 'permission', 'timeFrame', 'acl'];
    snapshot = signal(null, ...(ngDevMode ? [{ debugName: "snapshot" }] : []));
    loading = signal(true, ...(ngDevMode ? [{ debugName: "loading" }] : []));
    loadError = signal(null, ...(ngDevMode ? [{ debugName: "loadError" }] : []));
    saving = signal(false, ...(ngDevMode ? [{ debugName: "saving" }] : []));
    outcome = signal(null, ...(ngDevMode ? [{ debugName: "outcome" }] : []));
    inheritanceBusy = signal(false, ...(ngDevMode ? [{ debugName: "inheritanceBusy" }] : []));
    inheritanceError = signal(null, ...(ngDevMode ? [{ debugName: "inheritanceError" }] : []));
    /** Staged changes: by ACE id for an existing entry, by a generated key for an addition. */
    staged = signal(new Map(), ...(ngDevMode ? [{ debugName: "staged" }] : []));
    addCounter = 0;
    /** Display names of staged additions, from the search suggestion the user picked. */
    addedLabels = new Map();
    editor = signal(null, ...(ngDevMode ? [{ debugName: "editor" }] : []));
    editorPrincipal = signal(null, ...(ngDevMode ? [{ debugName: "editorPrincipal" }] : []));
    editorQuery = signal('', ...(ngDevMode ? [{ debugName: "editorQuery" }] : []));
    editorPermission = signal('Read', ...(ngDevMode ? [{ debugName: "editorPermission" }] : []));
    editorDated = signal(false, ...(ngDevMode ? [{ debugName: "editorDated" }] : []));
    /** The time frame's days, at local midnight. */
    editorBegin = signal(null, ...(ngDevMode ? [{ debugName: "editorBegin" }] : []));
    editorEnd = signal(null, ...(ngDevMode ? [{ debugName: "editorEnd" }] : []));
    /** The same days as the date fields hold them, in their adapter's own representation. */
    editorBeginField = computed(() => nxsDateToAdapter(this.dateAdapter, this.editorBegin()), ...(ngDevMode ? [{ debugName: "editorBeginField" }] : []));
    editorEndField = computed(() => nxsDateToAdapter(this.dateAdapter, this.editorEnd()), ...(ngDevMode ? [{ debugName: "editorEndField" }] : []));
    editorSubmitted = signal(false, ...(ngDevMode ? [{ debugName: "editorSubmitted" }] : []));
    suggestions = signal([], ...(ngDevMode ? [{ debugName: "suggestions" }] : []));
    loads = new Subject();
    searches = new Subject();
    /**
     * Bumped whenever the document changes. A save or inheritance change still in flight finishes on
     * its own document, but its answer is dropped rather than shown on this one.
     */
    generation = 0;
    loadErrorKey = computed(() => `satori-components.permissions-panel.load-error.${this.loadError() ?? 'failed'}`, ...(ngDevMode ? [{ debugName: "loadErrorKey" }] : []));
    canManage = computed(() => this.snapshot()?.canManage ?? false, ...(ngDevMode ? [{ debugName: "canManage" }] : []));
    /**
     * False while a save or an inheritance change is in flight: a save replaces the staged changes
     * with those it did not send when it answers, so one staged after it started would be lost.
     */
    editable = computed(() => this.canManage() && !this.saving() && !this.inheritanceBusy(), ...(ngDevMode ? [{ debugName: "editable" }] : []));
    trackItem = (_index, item) => item.key;
    pendingCount = computed(() => this.staged().size, ...(ngDevMode ? [{ debugName: "pendingCount" }] : []));
    /** The permission groups every select offers, in the server's order. */
    permissionGroups = computed(() => {
        const catalogue = this.snapshot()?.catalogue;
        if (!catalogue)
            return [];
        return [
            {
                label: 'satori-components.permissions-panel.group.suggested',
                permissions: catalogue.suggested,
            },
            {
                label: 'satori-components.permissions-panel.group.standard',
                permissions: catalogue.standard,
            },
            { label: 'satori-components.permissions-panel.group.other', permissions: catalogue.other },
        ].filter((group) => group.permissions.length > 0);
    }, ...(ngDevMode ? [{ debugName: "permissionGroups" }] : []));
    offered = computed(() => {
        const catalogue = this.snapshot()?.catalogue;
        return new Set(catalogue ? offeredPermissions(catalogue) : []);
    }, ...(ngDevMode ? [{ debugName: "offered" }] : []));
    localItems = computed(() => {
        const snapshot = this.snapshot();
        if (!snapshot)
            return [];
        const staged = this.staged();
        const extras = (...permissions) => [...new Set(permissions)].filter((p) => !!p && !this.offered().has(p));
        const items = snapshot.local.map((row, index) => {
            const key = row.id || `no-id-${index}`;
            const change = staged.get(key);
            const lockedReason = !row.id ? 'satori-components.permissions-panel.locked.no-id' : null;
            const base = {
                ...this.fromRow(key, row, lockedReason),
                extraPermissions: extras(row.permission),
            };
            if (change?.kind === 'remove') {
                return { ...base, state: 'removed' };
            }
            if (change?.kind === 'replace') {
                return {
                    ...base,
                    permission: change.permission,
                    begin: change.begin,
                    end: change.end,
                    state: 'changed',
                };
            }
            return base;
        });
        for (const [key, change] of staged) {
            if (change.kind !== 'add')
                continue;
            items.push({
                key,
                row: null,
                principal: change.principal,
                principalLabel: this.addedLabels.get(key) ?? '',
                permission: change.permission,
                begin: change.begin,
                end: change.end,
                state: 'added',
                granted: true,
                lockedReason: null,
                extraPermissions: extras(change.permission),
            });
        }
        return items;
    }, ...(ngDevMode ? [{ debugName: "localItems" }] : []));
    /** Permissions the entry being edited holds that the server's lists do not offer. */
    editorExtraPermissions = computed(() => this.editor()?.item?.extraPermissions ?? [], ...(ngDevMode ? [{ debugName: "editorExtraPermissions" }] : []));
    editorInvalidRange = computed(() => {
        const begin = toDay(this.editorBegin());
        const end = toDay(this.editorEnd());
        return this.editorDated() && !!begin && !!end && begin > end;
    }, ...(ngDevMode ? [{ debugName: "editorInvalidRange" }] : []));
    constructor() {
        this.loads
            .pipe(
        // `defer`, so even a synchronous throw ends this load rather than the whole stream —
        // after which no later document, reload or retry would ever load again.
        switchMap((uid) => defer(() => this.service.load(uid)).pipe(catchError((error) => {
            this.loadError.set(classifyLoadError(error));
            return of(null);
        }))), takeUntilDestroyed())
            .subscribe((snapshot) => {
            if (snapshot)
                this.snapshot.set(snapshot);
            this.loading.set(false);
        });
        // No `distinctUntilChanged`: the panel outlives a form, so the same term typed into the next
        // Add would be swallowed and its suggestions, cleared when the form opened, never come back.
        this.searches
            .pipe(debounceTime(300), map((term) => term.trim()), switchMap((term) => (term.length >= 1
            ? defer(() => this.service.searchPrincipals(term)).pipe(catchError(() => of([])))
            : of([])).pipe(map((results) => ({ term, results })))), takeUntilDestroyed())
            // A search can answer after its form closed or its term changed, and must not offer its
            // principals to whatever the editor holds now.
            .subscribe(({ term, results }) => {
            if (this.editor()?.mode === 'add' && this.editorQuery().trim() === term) {
                this.suggestions.set(results);
            }
        });
        // A new document is a new panel: nothing staged, shown or half-edited may carry over.
        effect(() => {
            const uid = this.documentId();
            untracked(() => {
                this.generation += 1;
                this.snapshot.set(null);
                this.clearStaged();
                this.outcome.set(null);
                this.editor.set(null);
                this.saving.set(false);
                this.inheritanceBusy.set(false);
                this.inheritanceError.set(null);
                this.load(uid);
            });
        });
    }
    reload() {
        this.clearStaged();
        this.outcome.set(null);
        this.editor.set(null);
        this.load(this.documentId());
    }
    // ── Labels ──────────────────────────────────────────────────────────────────────────────────
    permissionLabel(permission) {
        return permissionRightLabel(permission, (key) => this.translate.instant(key));
    }
    /** An ACE's time frame, from staged days or the server's instants alike. */
    timeFrame(begin, end) {
        return formatAceDateRange(instantToDay(begin), instantToDay(end), (key, params) => this.translate.instant(key, params), this.locale);
    }
    /** `principal — permission`, for refusal and failure lines. */
    entryLabel(principal, permission) {
        const who = principal || this.translate.instant('satori-components.permissions-panel.unnamed-principal');
        return `${who} — ${this.permissionLabel(permission)} (${permission})`;
    }
    serverMessage(error) {
        const body = error?.error;
        const message = typeof body?.message === 'string' ? body.message.trim() : '';
        if (message)
            return message;
        const status = error?.status;
        return typeof status === 'number' && status > 0
            ? `HTTP ${status}`
            : this.translate.instant('satori-components.permissions-panel.failed.unknown');
    }
    isDenied(error) {
        return isPermissionDeniedError(error);
    }
    // ── Staging ─────────────────────────────────────────────────────────────────────────────────
    setPermission(item, permission) {
        if (!this.editable())
            return;
        this.outcome.set(null);
        if (item.row) {
            this.stageReplace(item.key, item.row, permission, item.begin, item.end);
        }
        else {
            this.updateAdd(item.key, { permission });
        }
    }
    toggleRemove(item) {
        if (!this.editable())
            return;
        this.outcome.set(null);
        const next = new Map(this.staged());
        if (!item.row || next.get(item.key)?.kind === 'remove') {
            next.delete(item.key);
        }
        else {
            next.set(item.key, { kind: 'remove', target: item.row });
        }
        this.staged.set(next);
    }
    dismissOutcome() {
        this.outcome.set(null);
    }
    discard() {
        this.clearStaged();
        this.outcome.set(null);
        this.editor.set(null);
    }
    // ── Editor ──────────────────────────────────────────────────────────────────────────────────
    openAdd() {
        if (!this.editable())
            return;
        this.outcome.set(null);
        this.editor.set({ mode: 'add', item: null });
        this.editorPrincipal.set(null);
        this.editorQuery.set('');
        this.editorPermission.set(this.snapshot()?.catalogue.suggested[0] ?? 'Read');
        this.editorDated.set(false);
        this.editorBegin.set(null);
        this.editorEnd.set(null);
        this.editorSubmitted.set(false);
        this.suggestions.set([]);
    }
    openEdit(item) {
        if (!this.editable())
            return;
        this.outcome.set(null);
        this.editor.set({ mode: 'edit', item });
        this.editorPermission.set(item.permission);
        this.editorDated.set(!!item.begin || !!item.end);
        this.editorBegin.set(dateOf(item.begin));
        this.editorEnd.set(dateOf(item.end));
        this.editorSubmitted.set(false);
    }
    closeEditor() {
        this.editor.set(null);
    }
    onPrincipalInput(value) {
        this.editorQuery.set(value);
        this.editorPrincipal.set(null);
        this.searches.next(value);
    }
    onPrincipalSelected(suggestion) {
        this.editorPrincipal.set(suggestion);
        this.editorQuery.set(suggestion.displayLabel);
    }
    /** The day a date field holds, whatever its adapter holds dates as. */
    fieldDay(value) {
        return nxsDateFromAdapter(this.dateAdapter, value);
    }
    displaySuggestion(suggestion) {
        if (!suggestion)
            return '';
        return typeof suggestion === 'string' ? suggestion : suggestion.displayLabel;
    }
    applyEditor() {
        const editor = this.editor();
        if (!editor || !this.editable())
            return;
        this.editorSubmitted.set(true);
        if (this.editorInvalidRange())
            return;
        const begin = this.editorDated() ? toDay(this.editorBegin()) : null;
        const end = this.editorDated() ? toDay(this.editorEnd()) : null;
        const permission = this.editorPermission();
        if (editor.mode === 'add') {
            const principal = this.editorPrincipal();
            if (!principal)
                return;
            const key = `add-${++this.addCounter}`;
            const next = new Map(this.staged());
            next.set(key, { kind: 'add', key, principal: principal.id, permission, begin, end });
            if (principal.displayLabel !== principal.id)
                this.addedLabels.set(key, principal.displayLabel);
            this.staged.set(next);
        }
        else if (editor.item?.row) {
            this.stageReplace(editor.item.key, editor.item.row, permission, begin, end);
        }
        else if (editor.item) {
            this.updateAdd(editor.item.key, { permission, begin, end });
        }
        this.editor.set(null);
    }
    // ── Writes ──────────────────────────────────────────────────────────────────────────────────
    save() {
        const entries = [...this.staged().entries()];
        const changes = entries.map(([, change]) => change);
        if (changes.length === 0 || this.saving())
            return;
        this.saving.set(true);
        this.outcome.set(null);
        this.editor.set(null);
        const generation = this.generation;
        this.service
            .save(this.documentId(), changes)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (outcome) => {
                if (generation !== this.generation)
                    return;
                this.saving.set(false);
                this.outcome.set(outcome);
                // Neither wrote anything, so the user's staged changes stay for them to adjust.
                if (outcome.kind === 'refused' || outcome.kind === 'unread')
                    return;
                if (outcome.kind !== 'unverified' && outcome.snapshot)
                    this.snapshot.set(outcome.snapshot);
                // Writes stop at the refused change, so it and every change after it were never sent.
                if (outcome.kind === 'failed') {
                    this.keepStaged(entries.slice(changes.indexOf(outcome.change)));
                    if (outcome.applied + outcome.unconfirmed.length > 0)
                        this.notifyChanged();
                }
                else {
                    this.clearStaged();
                    this.notifyChanged();
                }
            },
            error: (error) => {
                if (generation !== this.generation)
                    return;
                // Every failure the service expects is an outcome. Anything else may have struck
                // mid-batch, so what the server holds is unknown.
                this.saving.set(false);
                this.outcome.set({ kind: 'unverified', count: changes.length, error });
                this.clearStaged();
                this.notifyChanged();
            },
        });
    }
    toggleInheritance() {
        const snapshot = this.snapshot();
        if (!snapshot || this.inheritanceBusy() || this.pendingCount() > 0)
            return;
        this.inheritanceBusy.set(true);
        this.inheritanceError.set(null);
        this.outcome.set(null);
        const generation = this.generation;
        this.service
            .setInheritanceBlocked(this.documentId(), !snapshot.inheritanceBlocked)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (updated) => {
                if (generation !== this.generation)
                    return;
                this.inheritanceBusy.set(false);
                if (updated)
                    this.snapshot.set(updated);
                else
                    this.load(this.documentId());
                this.notifyChanged();
            },
            error: (error) => {
                if (generation !== this.generation)
                    return;
                this.inheritanceBusy.set(false);
                this.inheritanceError.set(this.serverMessage(error));
            },
        });
    }
    refusalReasonKey(refusal) {
        return `satori-components.permissions-panel.refusal.${refusal.reason}`;
    }
    failedEntry(outcome) {
        const change = outcome.change;
        return change.kind === 'add'
            ? this.entryLabel(change.principal, change.permission)
            : this.entryLabel(change.target.principal, change.kind === 'remove' ? change.target.permission : change.permission);
    }
    // ── Internals ───────────────────────────────────────────────────────────────────────────────
    clearStaged() {
        this.staged.set(new Map());
        this.addedLabels.clear();
    }
    notifyChanged() {
        this.permissionsChanged()?.();
    }
    keepStaged(entries) {
        const kept = new Map(entries);
        for (const key of [...this.addedLabels.keys()]) {
            if (!kept.has(key))
                this.addedLabels.delete(key);
        }
        this.staged.set(kept);
    }
    load(uid) {
        this.loading.set(true);
        this.loadError.set(null);
        this.loads.next(uid);
    }
    fromRow(key, row, lockedReason) {
        return {
            key,
            row,
            principal: row.principal,
            principalLabel: row.principalLabel,
            permission: row.permission,
            begin: instantToDay(row.begin),
            end: instantToDay(row.end),
            state: 'unchanged',
            granted: row.granted,
            lockedReason: lockedReason ?? (row.granted ? null : 'satori-components.permissions-panel.locked.deny'),
        };
    }
    /** Stages a replacement, or drops it when it would write the entry back unchanged. */
    stageReplace(key, row, permission, begin, end) {
        const next = new Map(this.staged());
        const unchanged = permission === row.permission &&
            begin === instantToDay(row.begin) &&
            end === instantToDay(row.end);
        if (unchanged)
            next.delete(key);
        else
            next.set(key, { kind: 'replace', target: row, permission, begin, end });
        this.staged.set(next);
    }
    updateAdd(key, patch) {
        const change = this.staged().get(key);
        if (change?.kind !== 'add')
            return;
        const next = new Map(this.staged());
        next.set(key, { ...change, ...patch });
        this.staged.set(next);
    }
    static ɵfac = function NxsPermissionsPanelComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsPermissionsPanelComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsPermissionsPanelComponent, selectors: [["nxs-permissions-panel"]], hostAttrs: [1, "nxs-permissions-panel"], inputs: { documentId: [1, "documentId"], permissionsChanged: [1, "permissionsChanged"] }, features: [i0.ɵɵProvidersFeature([NxsPermissionsService, provideNxsDateAdapter()])], decls: 8, vars: 5, consts: [["principalInput", ""], ["principalAuto", "matAutocomplete"], ["beginPicker", ""], ["endPicker", ""], [1, "nxs-permissions-panel__header"], ["role", "heading", "aria-level", "2", 1, "nxs-permissions-panel__title"], [1, "nxs-permissions-panel__document"], ["role", "status", 1, "nxs-permissions-panel__loading"], ["role", "alert", 1, "nxs-permissions-panel__error"], ["mode", "indeterminate", "diameter", "28"], ["mat-stroked-button", "", "type", "button"], ["mat-stroked-button", "", "type", "button", 3, "click"], [1, "nxs-permissions-panel__section"], [1, "nxs-permissions-panel__section-header"], ["role", "heading", "aria-level", "3", 1, "nxs-permissions-panel__section-title", 3, "id"], ["mat-stroked-button", "", "type", "button", "color", "primary", 3, "disabled"], [1, "nxs-permissions-panel__editor"], [1, "nxs-permissions-panel__empty"], ["mat-table", "", 1, "nxs-permissions-panel__table", 3, "dataSource", "trackBy"], [1, "nxs-permissions-panel__pending"], ["mat-stroked-button", "", "type", "button", 3, "disabled", "matTooltip"], ["role", "alert", 1, "nxs-permissions-panel__field-error"], ["mat-table", "", 1, "nxs-permissions-panel__table", 3, "dataSource"], ["role", "status", 1, "nxs-permissions-panel__status"], ["role", "alert", 1, "nxs-permissions-panel__alert"], [1, "nxs-permissions-panel__alert-heading"], [1, "nxs-permissions-panel__refusals"], [1, "nxs-permissions-panel__alert-actions"], ["mat-button", "", "type", "button", 3, "click"], [1, "nxs-permissions-panel__entry"], [1, "nxs-permissions-panel__server-message"], ["mat-stroked-button", "", "type", "button", "color", "primary", 3, "click", "disabled"], ["aria-hidden", "true"], [1, "nxs-permissions-panel__editor", 3, "submit"], ["role", "heading", "aria-level", "4", 1, "nxs-permissions-panel__editor-heading", 3, "id"], ["appearance", "outline", 1, "nxs-permissions-panel__field--wide"], [3, "selectionChange", "value"], [1, "nxs-permissions-panel__id"], [3, "value"], [3, "label"], [1, "nxs-permissions-panel__time-frame", 3, "change", "value"], ["value", "permanent"], ["value", "dated"], [1, "nxs-permissions-panel__editor-actions"], ["mat-flat-button", "", "color", "primary", "type", "submit", 3, "disabled"], ["matInput", "", "type", "text", "autocomplete", "off", 3, "input", "value", "matAutocomplete"], [3, "optionSelected", "displayWith"], [1, "nxs-permissions-panel__dates"], ["appearance", "outline"], ["matInput", "", 3, "dateChange", "matDatepicker", "value"], ["matIconSuffix", "", 3, "for"], ["matColumnDef", "principal"], ["mat-header-cell", "", 4, "matHeaderCellDef"], ["mat-cell", "", 4, "matCellDef"], ["matColumnDef", "permission"], ["matColumnDef", "timeFrame"], ["matColumnDef", "grantedBy"], ["matColumnDef", "actions"], ["mat-cell", "", "class", "nxs-permissions-panel__actions", 4, "matCellDef"], ["mat-header-row", "", 4, "matHeaderRowDef"], ["mat-row", "", 3, "nxs-permissions-panel__row--removed", "nxs-permissions-panel__row--pending", 4, "matRowDef", "matRowDefColumns"], ["mat-header-cell", ""], ["mat-cell", ""], [1, "nxs-permissions-panel__badge"], [1, "nxs-permissions-panel__badge", "nxs-permissions-panel__badge--removed"], [1, "nxs-permissions-panel__select", 3, "value", "disabled", "aria-label"], [1, "nxs-permissions-panel__hint"], [1, "nxs-permissions-panel__select", 3, "selectionChange", "value", "disabled", "aria-label"], [1, "nxs-permissions-panel__visually-hidden"], ["mat-cell", "", 1, "nxs-permissions-panel__actions"], ["mat-icon-button", "", "type", "button", 3, "matTooltip", "disabled"], ["mat-button", "", "type", "button", 3, "disabled"], ["mat-icon-button", "", "type", "button", 3, "click", "matTooltip", "disabled"], ["mat-button", "", "type", "button", 3, "click", "disabled"], ["mat-header-row", ""], ["mat-row", ""], ["role", "status"], [1, "nxs-permissions-panel__spacer"], ["mat-flat-button", "", "color", "primary", "type", "button", 3, "click", "disabled"], ["mat-stroked-button", "", "type", "button", 3, "click", "disabled", "matTooltip"], ["mat-row", "", 4, "matRowDef", "matRowDefColumns"], ["matColumnDef", "acl"]], template: function NxsPermissionsPanelComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 4)(1, "div", 5);
            i0.ɵɵtext(2);
            i0.ɵɵpipe(3, "translate");
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(4, NxsPermissionsPanelComponent_Conditional_4_Template, 2, 1, "p", 6);
            i0.ɵɵelementEnd();
            i0.ɵɵconditionalCreate(5, NxsPermissionsPanelComponent_Conditional_5_Template, 3, 3, "div", 7)(6, NxsPermissionsPanelComponent_Conditional_6_Template, 5, 4, "div", 8)(7, NxsPermissionsPanelComponent_Conditional_7_Template, 22, 19);
        } if (rf & 2) {
            let tmp_1_0;
            let tmp_2_0;
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(3, 3, "satori-components.permissions-panel.title"), " ");
            i0.ɵɵadvance(2);
            i0.ɵɵconditional((tmp_1_0 = ctx.snapshot()) ? 4 : -1, tmp_1_0);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.loading() && !ctx.snapshot() ? 5 : (tmp_2_0 = ctx.loadError()) ? 6 : (tmp_2_0 = ctx.snapshot()) ? 7 : -1, tmp_2_0);
        } }, dependencies: [MatAutocompleteModule, i1.MatAutocomplete, i2.MatOption, i2.MatOptgroup, i1.MatAutocompleteTrigger, MatButtonModule, i3.MatButton, i3.MatIconButton, MatDatepickerModule, i4.MatDatepicker, i4.MatDatepickerInput, i4.MatDatepickerToggle, MatFormFieldModule, i5.MatFormField, i5.MatLabel, i5.MatSuffix, MatIconModule, i6.MatIcon, MatInputModule, i7.MatInput, MatProgressSpinnerModule, i8.MatProgressSpinner, MatRadioModule, i9.MatRadioGroup, i9.MatRadioButton, MatSelectModule, i2.MatSelect, i2.MatSelectTrigger, MatTableModule, i10.MatTable, i10.MatHeaderCellDef, i10.MatHeaderRowDef, i10.MatColumnDef, i10.MatCellDef, i10.MatRowDef, i10.MatHeaderCell, i10.MatCell, i10.MatHeaderRow, i10.MatRow, MatTooltipModule, i11.MatTooltip, TranslatePipe], styles: ["[_nghost-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n  padding: 16px 0;\n  color: var(--mat-sys-on-surface);\n}\n\n.nxs-permissions-panel__header[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n}\n\n.nxs-permissions-panel__title[_ngcontent-%COMP%] {\n  font-size: 1rem;\n  font-weight: 500;\n  line-height: 1.5rem;\n}\n\n.nxs-permissions-panel__document[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 0.875rem;\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.nxs-permissions-panel__loading[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  padding: 24px;\n}\n\n.nxs-permissions-panel__error[_ngcontent-%COMP%], \n.nxs-permissions-panel__alert[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  gap: 8px;\n  padding: 12px 16px;\n  border-radius: 8px;\n  background: var(--mat-sys-error-container);\n  color: var(--mat-sys-on-error-container);\n\n  p {\n    margin: 0;\n  }\n}\n\n.nxs-permissions-panel__alert-heading[_ngcontent-%COMP%] {\n  font-weight: 500;\n}\n\n.nxs-permissions-panel__alert-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 8px;\n}\n\n.nxs-permissions-panel__refusals[_ngcontent-%COMP%] {\n  margin: 0;\n  padding-inline-start: 20px;\n}\n\n.nxs-permissions-panel__entry[_ngcontent-%COMP%] {\n  font-weight: 500;\n}\n\n.nxs-permissions-panel__server-message[_ngcontent-%COMP%] {\n  display: block;\n  font-size: 0.75rem;\n}\n\n.nxs-permissions-panel__status[_ngcontent-%COMP%] {\n  margin: 0;\n  padding: 8px 16px;\n  border-radius: 8px;\n  background: var(--mat-sys-secondary-container);\n  color: var(--mat-sys-on-secondary-container);\n}\n\n.nxs-permissions-panel__section[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n\n.nxs-permissions-panel__section-header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n}\n\n.nxs-permissions-panel__section-title[_ngcontent-%COMP%] {\n  font-size: 0.875rem;\n  font-weight: 600;\n}\n\n.nxs-permissions-panel__empty[_ngcontent-%COMP%] {\n  margin: 0;\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.nxs-permissions-panel__table[_ngcontent-%COMP%] {\n  width: 100%;\n}\n\n.nxs-permissions-panel__select[_ngcontent-%COMP%] {\n  min-width: 200px;\n}\n\n.nxs-permissions-panel__id[_ngcontent-%COMP%] {\n  margin-inline-start: 6px;\n  font-size: 0.75rem;\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.nxs-permissions-panel__badge[_ngcontent-%COMP%] {\n  display: inline-block;\n  margin-inline-start: 8px;\n  padding: 0 8px;\n  border-radius: 999px;\n  font-size: 0.6875rem;\n  font-weight: 500;\n  line-height: 1.25rem;\n  background: var(--mat-sys-surface-container-highest);\n  color: var(--mat-sys-on-surface);\n}\n\n.nxs-permissions-panel__badge--removed[_ngcontent-%COMP%] {\n  background: var(--mat-sys-error-container);\n  color: var(--mat-sys-on-error-container);\n}\n\n.nxs-permissions-panel__hint[_ngcontent-%COMP%] {\n  display: block;\n  font-size: 0.75rem;\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.nxs-permissions-panel__row--pending[_ngcontent-%COMP%] {\n  background: var(--mat-sys-surface-container-low);\n}\n\n.nxs-permissions-panel__row--removed[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n  text-decoration: line-through;\n}\n\n.nxs-permissions-panel__actions[_ngcontent-%COMP%] {\n  white-space: nowrap;\n  text-align: end;\n}\n\n.nxs-permissions-panel__pending[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 8px 12px;\n  border-radius: 8px;\n  background: var(--mat-sys-surface-container);\n}\n\n.nxs-permissions-panel__spacer[_ngcontent-%COMP%] {\n  flex: 1;\n}\n\n.nxs-permissions-panel__editor[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  padding: 16px;\n  border: 1px solid var(--mat-sys-outline-variant);\n  border-radius: 8px;\n}\n\n.nxs-permissions-panel__editor-heading[_ngcontent-%COMP%] {\n  font-size: 0.875rem;\n  font-weight: 500;\n}\n\n.nxs-permissions-panel__field--wide[_ngcontent-%COMP%] {\n  width: 100%;\n}\n\n.nxs-permissions-panel__time-frame[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 24px;\n}\n\n.nxs-permissions-panel__dates[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 16px;\n\n  mat-form-field {\n    flex: 1;\n    min-width: 160px;\n  }\n}\n\n.nxs-permissions-panel__field-error[_ngcontent-%COMP%] {\n  margin: 0;\n  color: var(--mat-sys-error);\n}\n\n.nxs-permissions-panel__editor-actions[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: flex-end;\n  gap: 8px;\n}\n\n.nxs-permissions-panel__visually-hidden[_ngcontent-%COMP%] {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  overflow: hidden;\n  clip: rect(0 0 0 0);\n  white-space: nowrap;\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsPermissionsPanelComponent, [{
        type: Component,
        args: [{ selector: 'nxs-permissions-panel', standalone: true, imports: [
                    TranslatePipe,
                    MatAutocompleteModule,
                    MatButtonModule,
                    MatDatepickerModule,
                    MatFormFieldModule,
                    MatIconModule,
                    MatInputModule,
                    MatProgressSpinnerModule,
                    MatRadioModule,
                    MatSelectModule,
                    MatTableModule,
                    MatTooltipModule,
                ], providers: [NxsPermissionsService, provideNxsDateAdapter()], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-permissions-panel' }, template: "<div class=\"nxs-permissions-panel__header\">\n  <div class=\"nxs-permissions-panel__title\" role=\"heading\" aria-level=\"2\">\n    {{ 'satori-components.permissions-panel.title' | translate }}\n  </div>\n  @if (snapshot(); as current) {\n    <p class=\"nxs-permissions-panel__document\">{{ current.title }}</p>\n  }\n</div>\n\n@if (loading() && !snapshot()) {\n  <div class=\"nxs-permissions-panel__loading\" role=\"status\">\n    <mat-progress-spinner\n      mode=\"indeterminate\"\n      diameter=\"28\"\n      [attr.aria-label]=\"'satori-components.permissions-panel.loading' | translate\"\n    />\n  </div>\n} @else if (loadError(); as error) {\n  <div class=\"nxs-permissions-panel__error\" role=\"alert\">\n    <p>{{ loadErrorKey() | translate }}</p>\n    @if (error === 'failed') {\n      <button mat-stroked-button type=\"button\" (click)=\"reload()\">\n        {{ 'satori-components.permissions-panel.retry' | translate }}\n      </button>\n    }\n  </div>\n} @else if (snapshot(); as current) {\n  @if (outcome(); as result) {\n    @switch (result.kind) {\n      @case ('saved') {\n        <p class=\"nxs-permissions-panel__status\" role=\"status\">\n          {{\n            (result.count === 1\n              ? 'satori-components.permissions-panel.saved.one'\n              : 'satori-components.permissions-panel.saved.many'\n            ) | translate: { count: result.count }\n          }}\n        </p>\n      }\n      @case ('refused') {\n        <div class=\"nxs-permissions-panel__alert\" role=\"alert\">\n          <p class=\"nxs-permissions-panel__alert-heading\">\n            {{ 'satori-components.permissions-panel.refused.heading' | translate }}\n          </p>\n          <ul class=\"nxs-permissions-panel__refusals\">\n            @for (refusal of result.refusals; track $index) {\n              <li>\n                <span class=\"nxs-permissions-panel__entry\">{{\n                  entryLabel(refusal.principal, refusal.permission)\n                }}</span\n                >: {{ refusalReasonKey(refusal) | translate }}\n              </li>\n            }\n          </ul>\n          <div class=\"nxs-permissions-panel__alert-actions\">\n            <button mat-stroked-button type=\"button\" (click)=\"reload()\">\n              {{ 'satori-components.permissions-panel.reload' | translate }}\n            </button>\n            <button mat-button type=\"button\" (click)=\"dismissOutcome()\">\n              {{ 'satori-components.permissions-panel.dismiss' | translate }}\n            </button>\n          </div>\n        </div>\n      }\n      @case ('unconfirmed') {\n        <div class=\"nxs-permissions-panel__alert\" role=\"alert\">\n          <p class=\"nxs-permissions-panel__alert-heading\">\n            {{ 'satori-components.permissions-panel.unconfirmed.heading' | translate }}\n          </p>\n          <ul class=\"nxs-permissions-panel__refusals\">\n            @for (refusal of result.refusals; track $index) {\n              <li>\n                <span class=\"nxs-permissions-panel__entry\">{{\n                  entryLabel(refusal.principal, refusal.permission)\n                }}</span\n                >: {{ refusalReasonKey(refusal) | translate }}\n              </li>\n            }\n          </ul>\n        </div>\n      }\n      @case ('unread') {\n        <div class=\"nxs-permissions-panel__alert\" role=\"alert\">\n          <p class=\"nxs-permissions-panel__alert-heading\">\n            {{ 'satori-components.permissions-panel.unread.heading' | translate }}\n          </p>\n          <p class=\"nxs-permissions-panel__server-message\">{{ serverMessage(result.error) }}</p>\n          <button mat-stroked-button type=\"button\" (click)=\"reload()\">\n            {{ 'satori-components.permissions-panel.reload' | translate }}\n          </button>\n        </div>\n      }\n      @case ('unverified') {\n        <div class=\"nxs-permissions-panel__alert\" role=\"alert\">\n          <p class=\"nxs-permissions-panel__alert-heading\">\n            {{ 'satori-components.permissions-panel.unverified.heading' | translate }}\n          </p>\n          <button mat-stroked-button type=\"button\" (click)=\"reload()\">\n            {{ 'satori-components.permissions-panel.reload' | translate }}\n          </button>\n        </div>\n      }\n      @case ('failed') {\n        <div class=\"nxs-permissions-panel__alert\" role=\"alert\">\n          <p class=\"nxs-permissions-panel__alert-heading\">\n            {{\n              'satori-components.permissions-panel.failed.heading'\n                | translate: { applied: result.applied, total: result.total }\n            }}\n          </p>\n          <p>\n            <span class=\"nxs-permissions-panel__entry\">{{ failedEntry(result) }}</span>\n            @if (isDenied(result.error)) {\n              {{ 'satori-components.permissions-panel.failed.denied' | translate }}\n            }\n            <span class=\"nxs-permissions-panel__server-message\">{{\n              serverMessage(result.error)\n            }}</span>\n          </p>\n          @if (result.unconfirmed.length > 0) {\n            <p class=\"nxs-permissions-panel__alert-heading\">\n              {{ 'satori-components.permissions-panel.unconfirmed.heading' | translate }}\n            </p>\n            <ul class=\"nxs-permissions-panel__refusals\">\n              @for (refusal of result.unconfirmed; track $index) {\n                <li>\n                  <span class=\"nxs-permissions-panel__entry\">{{\n                    entryLabel(refusal.principal, refusal.permission)\n                  }}</span\n                  >: {{ refusalReasonKey(refusal) | translate }}\n                </li>\n              }\n            </ul>\n          }\n          @if (!result.snapshot) {\n            <p>{{ 'satori-components.permissions-panel.unverified.heading' | translate }}</p>\n            <button mat-stroked-button type=\"button\" (click)=\"reload()\">\n              {{ 'satori-components.permissions-panel.reload' | translate }}\n            </button>\n          }\n        </div>\n      }\n    }\n  }\n\n  <!-- Local -->\n  <section class=\"nxs-permissions-panel__section\" [attr.aria-labelledby]=\"idPrefix + '-local'\">\n    <div class=\"nxs-permissions-panel__section-header\">\n      <div\n        class=\"nxs-permissions-panel__section-title\"\n        [id]=\"idPrefix + '-local'\"\n        role=\"heading\"\n        aria-level=\"3\"\n      >\n        {{ 'satori-components.permissions-panel.local.heading' | translate }}\n      </div>\n      @if (canManage() && !editor()) {\n        <button\n          mat-stroked-button\n          type=\"button\"\n          color=\"primary\"\n          [disabled]=\"!editable()\"\n          (click)=\"openAdd()\"\n        >\n          <mat-icon aria-hidden=\"true\">add</mat-icon>\n          {{ 'satori-components.permissions-panel.add' | translate }}\n        </button>\n      }\n    </div>\n\n    @if (editor(); as edit) {\n      <form\n        class=\"nxs-permissions-panel__editor\"\n        [attr.aria-labelledby]=\"idPrefix + '-editor-heading'\"\n        (submit)=\"$event.preventDefault(); applyEditor()\"\n      >\n        <div\n          class=\"nxs-permissions-panel__editor-heading\"\n          [id]=\"idPrefix + '-editor-heading'\"\n          role=\"heading\"\n          aria-level=\"4\"\n        >\n          @if (edit.mode === 'add') {\n            {{ 'satori-components.permissions-panel.editor.add-heading' | translate }}\n          } @else {\n            {{\n              'satori-components.permissions-panel.editor.edit-heading'\n                | translate: { principal: edit.item?.principal }\n            }}\n          }\n        </div>\n        @if (edit.mode === 'add') {\n          <mat-form-field appearance=\"outline\" class=\"nxs-permissions-panel__field--wide\">\n            <mat-label>{{\n              'satori-components.permissions-panel.editor.principal' | translate\n            }}</mat-label>\n            <input\n              #principalInput\n              matInput\n              type=\"text\"\n              autocomplete=\"off\"\n              [value]=\"editorQuery()\"\n              [matAutocomplete]=\"principalAuto\"\n              (input)=\"onPrincipalInput(principalInput.value)\"\n            />\n            <mat-autocomplete\n              #principalAuto=\"matAutocomplete\"\n              [displayWith]=\"displaySuggestion\"\n              (optionSelected)=\"onPrincipalSelected($event.option.value)\"\n            >\n              @for (suggestion of suggestions(); track suggestion.id) {\n                <mat-option [value]=\"suggestion\">\n                  <mat-icon aria-hidden=\"true\">{{\n                    suggestion.type === 'GROUP_TYPE' ? 'group' : 'person'\n                  }}</mat-icon>\n                  {{ suggestion.displayLabel }}\n                  <span class=\"nxs-permissions-panel__id\">{{ suggestion.id }}</span>\n                </mat-option>\n              }\n            </mat-autocomplete>\n          </mat-form-field>\n          @if (editorSubmitted() && !editorPrincipal()) {\n            <p class=\"nxs-permissions-panel__field-error\" role=\"alert\">\n              {{ 'satori-components.permissions-panel.editor.no-principal' | translate }}\n            </p>\n          }\n        }\n        <mat-form-field appearance=\"outline\" class=\"nxs-permissions-panel__field--wide\">\n          <mat-label>{{\n            'satori-components.permissions-panel.editor.permission' | translate\n          }}</mat-label>\n          <mat-select\n            [value]=\"editorPermission()\"\n            (selectionChange)=\"editorPermission.set($event.value)\"\n          >\n            <mat-select-trigger>\n              {{ permissionLabel(editorPermission()) }}\n              @if (permissionLabel(editorPermission()) !== editorPermission()) {\n                <span class=\"nxs-permissions-panel__id\">{{ editorPermission() }}</span>\n              }\n            </mat-select-trigger>\n            @for (extra of editorExtraPermissions(); track extra) {\n              <mat-option [value]=\"extra\" [attr.data-permission]=\"extra\">\n                {{ permissionLabel(extra) }}\n                <span class=\"nxs-permissions-panel__id\">{{ extra }}</span>\n              </mat-option>\n            }\n            @for (group of permissionGroups(); track group.label) {\n              <mat-optgroup [label]=\"group.label | translate\">\n                @for (permission of group.permissions; track permission) {\n                  <mat-option [value]=\"permission\" [attr.data-permission]=\"permission\">\n                    {{ permissionLabel(permission) }}\n                    @if (permissionLabel(permission) !== permission) {\n                      <span class=\"nxs-permissions-panel__id\">{{ permission }}</span>\n                    }\n                  </mat-option>\n                }\n              </mat-optgroup>\n            }\n          </mat-select>\n        </mat-form-field>\n        <mat-radio-group\n          class=\"nxs-permissions-panel__time-frame\"\n          [attr.aria-label]=\"'satori-components.permissions-panel.column.time-frame' | translate\"\n          [value]=\"editorDated() ? 'dated' : 'permanent'\"\n          (change)=\"editorDated.set($event.value === 'dated')\"\n        >\n          <mat-radio-button value=\"permanent\">{{\n            'satori-components.permissions-panel.editor.permanent' | translate\n          }}</mat-radio-button>\n          <mat-radio-button value=\"dated\">{{\n            'satori-components.permissions-panel.editor.date-based' | translate\n          }}</mat-radio-button>\n        </mat-radio-group>\n        @if (editorDated()) {\n          <div class=\"nxs-permissions-panel__dates\">\n            <mat-form-field appearance=\"outline\">\n              <mat-label>{{\n                'satori-components.permissions-panel.editor.from' | translate\n              }}</mat-label>\n              <input\n                matInput\n                [matDatepicker]=\"beginPicker\"\n                [value]=\"editorBeginField()\"\n                (dateChange)=\"editorBegin.set(fieldDay($event.value))\"\n              />\n              <mat-datepicker-toggle matIconSuffix [for]=\"beginPicker\" />\n              <mat-datepicker #beginPicker />\n            </mat-form-field>\n            <mat-form-field appearance=\"outline\">\n              <mat-label>{{\n                'satori-components.permissions-panel.editor.to' | translate\n              }}</mat-label>\n              <input\n                matInput\n                [matDatepicker]=\"endPicker\"\n                [value]=\"editorEndField()\"\n                (dateChange)=\"editorEnd.set(fieldDay($event.value))\"\n              />\n              <mat-datepicker-toggle matIconSuffix [for]=\"endPicker\" />\n              <mat-datepicker #endPicker />\n            </mat-form-field>\n          </div>\n          @if (editorInvalidRange()) {\n            <p class=\"nxs-permissions-panel__field-error\" role=\"alert\">\n              {{ 'satori-components.permissions-panel.editor.end-before-begin' | translate }}\n            </p>\n          }\n        }\n        <div class=\"nxs-permissions-panel__editor-actions\">\n          <button mat-button type=\"button\" (click)=\"closeEditor()\">\n            {{ 'satori-components.permissions-panel.editor.cancel' | translate }}\n          </button>\n          <button mat-flat-button color=\"primary\" type=\"submit\" [disabled]=\"!editable()\">\n            {{\n              (edit.mode === 'add'\n                ? 'satori-components.permissions-panel.editor.add'\n                : 'satori-components.permissions-panel.editor.apply'\n              ) | translate\n            }}\n          </button>\n        </div>\n      </form>\n    }\n\n    @if (localItems().length === 0) {\n      <p class=\"nxs-permissions-panel__empty\">\n        {{ 'satori-components.permissions-panel.local.empty' | translate }}\n      </p>\n    } @else {\n      <table\n        mat-table\n        class=\"nxs-permissions-panel__table\"\n        [attr.aria-labelledby]=\"idPrefix + '-local'\"\n        [dataSource]=\"localItems()\"\n        [trackBy]=\"trackItem\"\n      >\n        <ng-container matColumnDef=\"principal\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.permissions-panel.column.principal' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let item\">\n            @if (item.principalLabel && item.principalLabel !== item.principal) {\n              {{ item.principalLabel }}\n              <span class=\"nxs-permissions-panel__id\">{{ item.principal }}</span>\n            } @else {\n              {{ item.principal }}\n            }\n            @switch (item.state) {\n              @case ('added') {\n                <span class=\"nxs-permissions-panel__badge\">{{\n                  'satori-components.permissions-panel.state.added' | translate\n                }}</span>\n              }\n              @case ('changed') {\n                <span class=\"nxs-permissions-panel__badge\">{{\n                  'satori-components.permissions-panel.state.changed' | translate\n                }}</span>\n              }\n              @case ('removed') {\n                <span class=\"nxs-permissions-panel__badge nxs-permissions-panel__badge--removed\">{{\n                  'satori-components.permissions-panel.state.removed' | translate\n                }}</span>\n              }\n            }\n          </td>\n        </ng-container>\n\n        <ng-container matColumnDef=\"permission\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.permissions-panel.column.permission' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let item\">\n            @if (canManage() && !item.lockedReason && item.state !== 'removed') {\n              <mat-select\n                class=\"nxs-permissions-panel__select\"\n                [value]=\"item.permission\"\n                [disabled]=\"!editable()\"\n                [aria-label]=\"\n                  'satori-components.permissions-panel.permission-for'\n                    | translate: { principal: item.principal }\n                \"\n                (selectionChange)=\"setPermission(item, $event.value)\"\n              >\n                <mat-select-trigger>\n                  {{ permissionLabel(item.permission) }}\n                  @if (permissionLabel(item.permission) !== item.permission) {\n                    <span class=\"nxs-permissions-panel__id\">{{ item.permission }}</span>\n                  }\n                </mat-select-trigger>\n                @for (extra of item.extraPermissions; track extra) {\n                  <mat-option [value]=\"extra\" [attr.data-permission]=\"extra\">\n                    {{ permissionLabel(extra) }}\n                    <span class=\"nxs-permissions-panel__id\">{{ extra }}</span>\n                  </mat-option>\n                }\n                @for (group of permissionGroups(); track group.label) {\n                  <mat-optgroup [label]=\"group.label | translate\">\n                    @for (permission of group.permissions; track permission) {\n                      <mat-option [value]=\"permission\" [attr.data-permission]=\"permission\">\n                        {{ permissionLabel(permission) }}\n                        @if (permissionLabel(permission) !== permission) {\n                          <span class=\"nxs-permissions-panel__id\">{{ permission }}</span>\n                        }\n                      </mat-option>\n                    }\n                  </mat-optgroup>\n                }\n              </mat-select>\n            } @else {\n              {{ permissionLabel(item.permission) }}\n              @if (permissionLabel(item.permission) !== item.permission) {\n                <span class=\"nxs-permissions-panel__id\">{{ item.permission }}</span>\n              }\n              @if (!item.granted) {\n                <span class=\"nxs-permissions-panel__badge nxs-permissions-panel__badge--removed\">{{\n                  'satori-components.permissions-panel.denied' | translate\n                }}</span>\n              }\n            }\n            @if (item.lockedReason && canManage()) {\n              <span class=\"nxs-permissions-panel__hint\">{{ item.lockedReason | translate }}</span>\n            }\n          </td>\n        </ng-container>\n\n        <ng-container matColumnDef=\"timeFrame\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.permissions-panel.column.time-frame' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let item\">\n            {{ timeFrame(item.begin, item.end) }}\n            @if (item.state === 'unchanged' && item.row?.status === 'pending') {\n              <span class=\"nxs-permissions-panel__badge\">{{\n                'satori-components.permissions-panel.status.pending' | translate\n              }}</span>\n            }\n            @if (item.state === 'unchanged' && item.row?.status === 'archived') {\n              <span class=\"nxs-permissions-panel__badge\">{{\n                'satori-components.permissions-panel.status.archived' | translate\n              }}</span>\n            }\n          </td>\n        </ng-container>\n\n        <ng-container matColumnDef=\"grantedBy\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.permissions-panel.column.granted-by' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let item\">{{ item.row?.creator || '\u2014' }}</td>\n        </ng-container>\n\n        <ng-container matColumnDef=\"actions\">\n          <th mat-header-cell *matHeaderCellDef>\n            <span class=\"nxs-permissions-panel__visually-hidden\">{{\n              'satori-components.permissions-panel.column.actions' | translate\n            }}</span>\n          </th>\n          <td mat-cell *matCellDef=\"let item\" class=\"nxs-permissions-panel__actions\">\n            @if (canManage()) {\n              @if (!item.lockedReason && item.state !== 'removed') {\n                <button\n                  mat-icon-button\n                  type=\"button\"\n                  [matTooltip]=\"'satori-components.permissions-panel.edit' | translate\"\n                  [attr.aria-label]=\"\n                    'satori-components.permissions-panel.edit-entry'\n                      | translate: { principal: item.principal }\n                  \"\n                  [disabled]=\"!editable()\"\n                  (click)=\"openEdit(item)\"\n                >\n                  <mat-icon aria-hidden=\"true\">edit</mat-icon>\n                </button>\n              }\n              @if (item.state === 'removed') {\n                <button\n                  mat-button\n                  type=\"button\"\n                  [disabled]=\"!editable()\"\n                  (click)=\"toggleRemove(item)\"\n                >\n                  {{ 'satori-components.permissions-panel.undo' | translate }}\n                </button>\n              } @else if (\n                item.lockedReason !== 'satori-components.permissions-panel.locked.no-id'\n              ) {\n                <button\n                  mat-icon-button\n                  type=\"button\"\n                  [matTooltip]=\"'satori-components.permissions-panel.remove' | translate\"\n                  [attr.aria-label]=\"\n                    'satori-components.permissions-panel.remove-entry'\n                      | translate\n                        : {\n                            principal: item.principal,\n                            permission: permissionLabel(item.permission),\n                          }\n                  \"\n                  [disabled]=\"!editable()\"\n                  (click)=\"toggleRemove(item)\"\n                >\n                  <mat-icon aria-hidden=\"true\">delete</mat-icon>\n                </button>\n              }\n            }\n          </td>\n        </ng-container>\n\n        <tr mat-header-row *matHeaderRowDef=\"localColumns\"></tr>\n        <tr\n          mat-row\n          *matRowDef=\"let item; columns: localColumns\"\n          [class.nxs-permissions-panel__row--removed]=\"item.state === 'removed'\"\n          [class.nxs-permissions-panel__row--pending]=\"item.state !== 'unchanged'\"\n        ></tr>\n      </table>\n    }\n\n    @if (pendingCount() > 0) {\n      <div class=\"nxs-permissions-panel__pending\">\n        <span role=\"status\">{{\n          (pendingCount() === 1\n            ? 'satori-components.permissions-panel.pending.one'\n            : 'satori-components.permissions-panel.pending.many'\n          ) | translate: { count: pendingCount() }\n        }}</span>\n        <span class=\"nxs-permissions-panel__spacer\"></span>\n        <button mat-button type=\"button\" [disabled]=\"saving()\" (click)=\"discard()\">\n          {{ 'satori-components.permissions-panel.discard' | translate }}\n        </button>\n        <button\n          mat-flat-button\n          color=\"primary\"\n          type=\"button\"\n          [disabled]=\"saving()\"\n          (click)=\"save()\"\n        >\n          {{ 'satori-components.permissions-panel.save' | translate }}\n        </button>\n      </div>\n    }\n  </section>\n\n  <!-- Inherited -->\n  <section class=\"nxs-permissions-panel__section\" [attr.aria-labelledby]=\"idPrefix + '-inherited'\">\n    <div class=\"nxs-permissions-panel__section-header\">\n      <div\n        class=\"nxs-permissions-panel__section-title\"\n        [id]=\"idPrefix + '-inherited'\"\n        role=\"heading\"\n        aria-level=\"3\"\n      >\n        {{ 'satori-components.permissions-panel.inherited.heading' | translate }}\n      </div>\n      @if (canManage()) {\n        <button\n          mat-stroked-button\n          type=\"button\"\n          [disabled]=\"inheritanceBusy() || pendingCount() > 0\"\n          [matTooltip]=\"\n            pendingCount() > 0\n              ? ('satori-components.permissions-panel.inherited.save-first' | translate)\n              : ''\n          \"\n          (click)=\"toggleInheritance()\"\n        >\n          {{\n            (current.inheritanceBlocked\n              ? 'satori-components.permissions-panel.inherited.unblock'\n              : 'satori-components.permissions-panel.inherited.block'\n            ) | translate\n          }}\n        </button>\n      }\n    </div>\n    @if (inheritanceError(); as message) {\n      <p class=\"nxs-permissions-panel__field-error\" role=\"alert\">\n        {{ 'satori-components.permissions-panel.inherited.toggle-failed' | translate }}\n        <span class=\"nxs-permissions-panel__server-message\">{{ message }}</span>\n      </p>\n    }\n    @if (current.inheritanceBlocked) {\n      <p class=\"nxs-permissions-panel__empty\">\n        {{ 'satori-components.permissions-panel.inherited.blocked' | translate }}\n      </p>\n    } @else if (current.inherited.length === 0) {\n      <p class=\"nxs-permissions-panel__empty\">\n        {{ 'satori-components.permissions-panel.inherited.empty' | translate }}\n      </p>\n    } @else {\n      <table\n        mat-table\n        class=\"nxs-permissions-panel__table\"\n        [attr.aria-labelledby]=\"idPrefix + '-inherited'\"\n        [dataSource]=\"current.inherited\"\n      >\n        <ng-container matColumnDef=\"principal\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.permissions-panel.column.principal' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let row\">\n            @if (row.principalLabel && row.principalLabel !== row.principal) {\n              {{ row.principalLabel }}\n              <span class=\"nxs-permissions-panel__id\">{{ row.principal }}</span>\n            } @else {\n              {{ row.principal }}\n            }\n          </td>\n        </ng-container>\n        <ng-container matColumnDef=\"permission\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.permissions-panel.column.permission' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let row\">\n            {{ permissionLabel(row.permission) }}\n            @if (permissionLabel(row.permission) !== row.permission) {\n              <span class=\"nxs-permissions-panel__id\">{{ row.permission }}</span>\n            }\n            @if (!row.granted) {\n              <span class=\"nxs-permissions-panel__badge nxs-permissions-panel__badge--removed\">{{\n                'satori-components.permissions-panel.denied' | translate\n              }}</span>\n            }\n          </td>\n        </ng-container>\n        <ng-container matColumnDef=\"timeFrame\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.permissions-panel.column.time-frame' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let row\">{{ timeFrame(row.begin, row.end) }}</td>\n        </ng-container>\n        <ng-container matColumnDef=\"grantedBy\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.permissions-panel.column.granted-by' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let row\">{{ row.creator || '\u2014' }}</td>\n        </ng-container>\n        <tr mat-header-row *matHeaderRowDef=\"inheritedColumns\"></tr>\n        <tr mat-row *matRowDef=\"let row; columns: inheritedColumns\"></tr>\n      </table>\n    }\n  </section>\n\n  @if (current.otherAcls.length > 0) {\n    <section class=\"nxs-permissions-panel__section\" [attr.aria-labelledby]=\"idPrefix + '-other'\">\n      <div\n        class=\"nxs-permissions-panel__section-title\"\n        [id]=\"idPrefix + '-other'\"\n        role=\"heading\"\n        aria-level=\"3\"\n      >\n        {{ 'satori-components.permissions-panel.other.heading' | translate }}\n      </div>\n      <table\n        mat-table\n        class=\"nxs-permissions-panel__table\"\n        [attr.aria-labelledby]=\"idPrefix + '-other'\"\n        [dataSource]=\"current.otherAcls\"\n      >\n        <ng-container matColumnDef=\"principal\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.permissions-panel.column.principal' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let row\">\n            @if (row.principalLabel && row.principalLabel !== row.principal) {\n              {{ row.principalLabel }}\n              <span class=\"nxs-permissions-panel__id\">{{ row.principal }}</span>\n            } @else {\n              {{ row.principal }}\n            }\n          </td>\n        </ng-container>\n        <ng-container matColumnDef=\"permission\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.permissions-panel.column.permission' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let row\">\n            {{ permissionLabel(row.permission) }}\n            @if (permissionLabel(row.permission) !== row.permission) {\n              <span class=\"nxs-permissions-panel__id\">{{ row.permission }}</span>\n            }\n            @if (!row.granted) {\n              <span class=\"nxs-permissions-panel__badge nxs-permissions-panel__badge--removed\">{{\n                'satori-components.permissions-panel.denied' | translate\n              }}</span>\n            }\n          </td>\n        </ng-container>\n        <ng-container matColumnDef=\"timeFrame\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.permissions-panel.column.time-frame' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let row\">{{ timeFrame(row.begin, row.end) }}</td>\n        </ng-container>\n        <ng-container matColumnDef=\"acl\">\n          <th mat-header-cell *matHeaderCellDef>\n            {{ 'satori-components.permissions-panel.column.acl' | translate }}\n          </th>\n          <td mat-cell *matCellDef=\"let row\">{{ row.acl }}</td>\n        </ng-container>\n        <tr mat-header-row *matHeaderRowDef=\"otherColumns\"></tr>\n        <tr mat-row *matRowDef=\"let row; columns: otherColumns\"></tr>\n      </table>\n    </section>\n  }\n}\n", styles: [":host {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n  padding: 16px 0;\n  color: var(--mat-sys-on-surface);\n}\n\n.nxs-permissions-panel__header {\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n}\n\n.nxs-permissions-panel__title {\n  font-size: 1rem;\n  font-weight: 500;\n  line-height: 1.5rem;\n}\n\n.nxs-permissions-panel__document {\n  margin: 0;\n  font-size: 0.875rem;\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.nxs-permissions-panel__loading {\n  display: flex;\n  justify-content: center;\n  padding: 24px;\n}\n\n.nxs-permissions-panel__error,\n.nxs-permissions-panel__alert {\n  display: flex;\n  flex-direction: column;\n  align-items: flex-start;\n  gap: 8px;\n  padding: 12px 16px;\n  border-radius: 8px;\n  background: var(--mat-sys-error-container);\n  color: var(--mat-sys-on-error-container);\n\n  p {\n    margin: 0;\n  }\n}\n\n.nxs-permissions-panel__alert-heading {\n  font-weight: 500;\n}\n\n.nxs-permissions-panel__alert-actions {\n  display: flex;\n  gap: 8px;\n}\n\n.nxs-permissions-panel__refusals {\n  margin: 0;\n  padding-inline-start: 20px;\n}\n\n.nxs-permissions-panel__entry {\n  font-weight: 500;\n}\n\n.nxs-permissions-panel__server-message {\n  display: block;\n  font-size: 0.75rem;\n}\n\n.nxs-permissions-panel__status {\n  margin: 0;\n  padding: 8px 16px;\n  border-radius: 8px;\n  background: var(--mat-sys-secondary-container);\n  color: var(--mat-sys-on-secondary-container);\n}\n\n.nxs-permissions-panel__section {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n\n.nxs-permissions-panel__section-header {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n}\n\n.nxs-permissions-panel__section-title {\n  font-size: 0.875rem;\n  font-weight: 600;\n}\n\n.nxs-permissions-panel__empty {\n  margin: 0;\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.nxs-permissions-panel__table {\n  width: 100%;\n}\n\n.nxs-permissions-panel__select {\n  min-width: 200px;\n}\n\n.nxs-permissions-panel__id {\n  margin-inline-start: 6px;\n  font-size: 0.75rem;\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.nxs-permissions-panel__badge {\n  display: inline-block;\n  margin-inline-start: 8px;\n  padding: 0 8px;\n  border-radius: 999px;\n  font-size: 0.6875rem;\n  font-weight: 500;\n  line-height: 1.25rem;\n  background: var(--mat-sys-surface-container-highest);\n  color: var(--mat-sys-on-surface);\n}\n\n.nxs-permissions-panel__badge--removed {\n  background: var(--mat-sys-error-container);\n  color: var(--mat-sys-on-error-container);\n}\n\n.nxs-permissions-panel__hint {\n  display: block;\n  font-size: 0.75rem;\n  color: var(--mat-sys-on-surface-variant);\n}\n\n.nxs-permissions-panel__row--pending {\n  background: var(--mat-sys-surface-container-low);\n}\n\n.nxs-permissions-panel__row--removed td {\n  text-decoration: line-through;\n}\n\n.nxs-permissions-panel__actions {\n  white-space: nowrap;\n  text-align: end;\n}\n\n.nxs-permissions-panel__pending {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 8px 12px;\n  border-radius: 8px;\n  background: var(--mat-sys-surface-container);\n}\n\n.nxs-permissions-panel__spacer {\n  flex: 1;\n}\n\n.nxs-permissions-panel__editor {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n  padding: 16px;\n  border: 1px solid var(--mat-sys-outline-variant);\n  border-radius: 8px;\n}\n\n.nxs-permissions-panel__editor-heading {\n  font-size: 0.875rem;\n  font-weight: 500;\n}\n\n.nxs-permissions-panel__field--wide {\n  width: 100%;\n}\n\n.nxs-permissions-panel__time-frame {\n  display: flex;\n  gap: 24px;\n}\n\n.nxs-permissions-panel__dates {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 16px;\n\n  mat-form-field {\n    flex: 1;\n    min-width: 160px;\n  }\n}\n\n.nxs-permissions-panel__field-error {\n  margin: 0;\n  color: var(--mat-sys-error);\n}\n\n.nxs-permissions-panel__editor-actions {\n  display: flex;\n  justify-content: flex-end;\n  gap: 8px;\n}\n\n.nxs-permissions-panel__visually-hidden {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  overflow: hidden;\n  clip: rect(0 0 0 0);\n  white-space: nowrap;\n}\n"] }]
    }], () => [], { documentId: [{ type: i0.Input, args: [{ isSignal: true, alias: "documentId", required: true }] }], permissionsChanged: [{ type: i0.Input, args: [{ isSignal: true, alias: "permissionsChanged", required: false }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsPermissionsPanelComponent, { className: "NxsPermissionsPanelComponent", filePath: "libs/shared/satori-components/src/lib/permissions-panel/permissions-panel.component.ts", lineNumber: 124 }); })();
function dateOf(day) {
    return day ? dayToDate(`${day}T00:00:00.000Z`) : null;
}
function classifyLoadError(error) {
    if (isPermissionDeniedError(error))
        return 'denied';
    return error?.status === 404 ? 'not-found' : 'failed';
}
//# sourceMappingURL=permissions-panel.component.js.map