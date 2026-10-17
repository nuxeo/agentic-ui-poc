import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, Injector, afterNextRender, computed, effect, inject, input, output, signal, untracked, } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { DateAdapter, MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DirectoryService, directoryPickerLabel, directoryUsesL10nLabel, filterDirectoryPickerEntries, formatHierarchicalL10nLabel, groupL10nChildrenByParent, l10nEntryLabel, } from '@nuxeo/satori-platform/nuxeo-client';
import { NxsDateMaskPipe } from '../date-input/date-mask.pipe';
import { provideNxsDateAdapter } from '../date-input/locale-date';
import { nxsPropertyText } from '../properties-panel/property-text';
import { NxsTabBodyDirective } from '../tabs/tab-body.directive';
import { NxsTabsComponent } from '../tabs/tabs.component';
import { baseType, buildControl, fieldKind, firstError, newComplexItem, propertyValue, } from './metadata-editor-form';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@angular/material/button";
import * as i3 from "@angular/material/checkbox";
import * as i4 from "@angular/material/chips";
import * as i5 from "@angular/material/datepicker";
import * as i6 from "@angular/material/form-field";
import * as i7 from "@angular/material/icon";
import * as i8 from "@angular/material/input";
import * as i9 from "@angular/material/select";
const _c0 = a0 => ({ count: a0 });
const _c1 = (a0, a1, a2) => ({ $implicit: a0, control: a1, depth: 0, path: a2 });
const _c2 = (a0, a1, a2, a3, a4) => ({ definition: a0, control: a1, label: a2, error: a3, path: a4, multiple: false });
const _c3 = (a0, a1, a2, a3, a4) => ({ definition: a0, control: a1, label: a2, error: a3, path: a4, multiple: true });
const _c4 = a0 => ({ name: a0 });
const _c5 = (a0, a1, a2, a3) => ({ $implicit: a0, control: a1, depth: a2, path: a3 });
const _c6 = a0 => ({ label: a0 });
const _c7 = (a0, a1) => ({ label: a0, index: a1 });
const _c8 = a0 => [a0];
const _forTrack0 = ($index, $item) => $item.xpath;
const _forTrack1 = ($index, $item) => $item.id;
const _forTrack2 = ($index, $item) => $item.parentLabel;
function NxsMetadataEditorComponent_Conditional_0_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "satori-components.metadata-editor.summary-one"), " ");
} }
function NxsMetadataEditorComponent_Conditional_0_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(1, 1, "satori-components.metadata-editor.summary-other", i0.ɵɵpureFunction1(4, _c0, ctx_r0.invalidCount())), " ");
} }
function NxsMetadataEditorComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 4)(1, "mat-icon", 7);
    i0.ɵɵtext(2, "error_outline");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span", 8);
    i0.ɵɵconditionalCreate(4, NxsMetadataEditorComponent_Conditional_0_Conditional_4_Template, 2, 3)(5, NxsMetadataEditorComponent_Conditional_0_Conditional_5_Template, 2, 6);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("id", ctx_r0.id + "-summary");
    i0.ɵɵadvance(4);
    i0.ɵɵconditional(ctx_r0.invalidCount() === 1 ? 4 : 5);
} }
function NxsMetadataEditorComponent_Conditional_1_For_2_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0, 9);
} if (rf & 2) {
    const field_r2 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵnextContext(2);
    const fieldTemplate_r3 = i0.ɵɵreference(5);
    i0.ɵɵproperty("ngTemplateOutlet", fieldTemplate_r3)("ngTemplateOutletContext", i0.ɵɵpureFunction3(2, _c1, field_r2, ctx, field_r2.xpath));
} }
function NxsMetadataEditorComponent_Conditional_1_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, NxsMetadataEditorComponent_Conditional_1_For_2_Conditional_0_Template, 1, 6, "ng-container", 9);
} if (rf & 2) {
    let tmp_13_0;
    const field_r2 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵconditional((tmp_13_0 = ctx_r0.controlFor(field_r2)) ? 0 : -1, tmp_13_0);
} }
function NxsMetadataEditorComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 5);
    i0.ɵɵrepeaterCreate(1, NxsMetadataEditorComponent_Conditional_1_For_2_Template, 1, 1, null, null, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r0.standardFields());
} }
function NxsMetadataEditorComponent_Conditional_2_ng_template_2_For_1_Conditional_0_For_2_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0, 9);
} if (rf & 2) {
    const field_r5 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵnextContext(5);
    const fieldTemplate_r3 = i0.ɵɵreference(5);
    i0.ɵɵproperty("ngTemplateOutlet", fieldTemplate_r3)("ngTemplateOutletContext", i0.ɵɵpureFunction3(2, _c1, field_r5, ctx, field_r5.xpath));
} }
function NxsMetadataEditorComponent_Conditional_2_ng_template_2_For_1_Conditional_0_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, NxsMetadataEditorComponent_Conditional_2_ng_template_2_For_1_Conditional_0_For_2_Conditional_0_Template, 1, 6, "ng-container", 9);
} if (rf & 2) {
    let tmp_26_0;
    const field_r5 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(5);
    i0.ɵɵconditional((tmp_26_0 = ctx_r0.controlFor(field_r5)) ? 0 : -1, tmp_26_0);
} }
function NxsMetadataEditorComponent_Conditional_2_ng_template_2_For_1_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 5);
    i0.ɵɵrepeaterCreate(1, NxsMetadataEditorComponent_Conditional_2_ng_template_2_For_1_Conditional_0_For_2_Template, 1, 1, null, null, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const section_r6 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵadvance();
    i0.ɵɵrepeater(section_r6.fields);
} }
function NxsMetadataEditorComponent_Conditional_2_ng_template_2_For_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, NxsMetadataEditorComponent_Conditional_2_ng_template_2_For_1_Conditional_0_Template, 3, 0, "div", 5);
} if (rf & 2) {
    const section_r6 = ctx.$implicit;
    const tab_r7 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵconditional(section_r6.id === tab_r7.id ? 0 : -1);
} }
function NxsMetadataEditorComponent_Conditional_2_ng_template_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, NxsMetadataEditorComponent_Conditional_2_ng_template_2_For_1_Template, 1, 1, null, null, _forTrack1);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵrepeater(ctx_r0.typeSections());
} }
function NxsMetadataEditorComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "nxs-tabs", 10);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵlistener("selectedIndexChange", function NxsMetadataEditorComponent_Conditional_2_Template_nxs_tabs_selectedIndexChange_0_listener($event) { i0.ɵɵrestoreView(_r4); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.selectTab($event)); });
    i0.ɵɵtemplate(2, NxsMetadataEditorComponent_Conditional_2_ng_template_2_Template, 2, 0, "ng-template", 11);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("tabs", ctx_r0.tabs())("label", ctx_r0.tabsLabel() || i0.ɵɵpipeBind1(1, 3, "satori-components.metadata-editor.sections"))("selectedIndex", ctx_r0.selectedTab());
} }
function NxsMetadataEditorComponent_Conditional_3_For_1_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 13);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const section_r8 = i0.ɵɵnextContext().$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("id", ctx_r0.id + "-" + section_r8.id);
    i0.ɵɵattribute("aria-level", ctx_r0.headingLevel());
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", section_r8.heading, " ");
} }
function NxsMetadataEditorComponent_Conditional_3_For_1_For_4_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0, 9);
} if (rf & 2) {
    const field_r9 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵnextContext(3);
    const fieldTemplate_r3 = i0.ɵɵreference(5);
    i0.ɵɵproperty("ngTemplateOutlet", fieldTemplate_r3)("ngTemplateOutletContext", i0.ɵɵpureFunction3(2, _c1, field_r9, ctx, field_r9.xpath));
} }
function NxsMetadataEditorComponent_Conditional_3_For_1_For_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, NxsMetadataEditorComponent_Conditional_3_For_1_For_4_Conditional_0_Template, 1, 6, "ng-container", 9);
} if (rf & 2) {
    let tmp_23_0;
    const field_r9 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵconditional((tmp_23_0 = ctx_r0.controlFor(field_r9)) ? 0 : -1, tmp_23_0);
} }
function NxsMetadataEditorComponent_Conditional_3_For_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "section", 12);
    i0.ɵɵconditionalCreate(1, NxsMetadataEditorComponent_Conditional_3_For_1_Conditional_1_Template, 2, 3, "div", 13);
    i0.ɵɵelementStart(2, "div", 5);
    i0.ɵɵrepeaterCreate(3, NxsMetadataEditorComponent_Conditional_3_For_1_For_4_Template, 1, 1, null, null, _forTrack0);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const section_r8 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵattribute("aria-labelledby", section_r8.heading ? ctx_r0.id + "-" + section_r8.id : null);
    i0.ɵɵadvance();
    i0.ɵɵconditional(section_r8.heading ? 1 : -1);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(section_r8.fields);
} }
function NxsMetadataEditorComponent_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, NxsMetadataEditorComponent_Conditional_3_For_1_Template, 5, 2, "section", 12, _forTrack1);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵrepeater(ctx_r0.typeSections());
} }
function NxsMetadataEditorComponent_ng_template_4_Case_4_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "textarea", 18);
} if (rf & 2) {
    const ctx_r9 = i0.ɵɵnextContext(2);
    const control_r11 = ctx_r9.control;
    const path_r12 = ctx_r9.path;
    const definition_r13 = i0.ɵɵreadContextLet(2);
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("formControl", ctx_r0.asControl(control_r11))("required", ctx_r0.isRequired(definition_r13))("errorStateMatcher", ctx_r0.errorMatcher);
    i0.ɵɵattribute("data-nxs-invalid", ctx_r0.showError(control_r11) ? "true" : null)("data-xpath", path_r12);
} }
function NxsMetadataEditorComponent_ng_template_4_Case_4_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "input", 19);
} if (rf & 2) {
    const ctx_r9 = i0.ɵɵnextContext(2);
    const control_r11 = ctx_r9.control;
    const path_r12 = ctx_r9.path;
    const definition_r13 = i0.ɵɵreadContextLet(2);
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("formControl", ctx_r0.asControl(control_r11))("required", ctx_r0.isRequired(definition_r13))("errorStateMatcher", ctx_r0.errorMatcher);
    i0.ɵɵattribute("data-nxs-invalid", ctx_r0.showError(control_r11) ? "true" : null)("data-xpath", path_r12);
} }
function NxsMetadataEditorComponent_ng_template_4_Case_4_Conditional_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-error");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext(2);
    const label_r14 = i0.ɵɵreadContextLet(0);
    const error_r15 = i0.ɵɵreadContextLet(3);
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.errorText(error_r15, label_r14));
} }
function NxsMetadataEditorComponent_ng_template_4_Case_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-form-field", 14)(1, "mat-label");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(3, NxsMetadataEditorComponent_ng_template_4_Case_4_Conditional_3_Template, 1, 5, "textarea", 18)(4, NxsMetadataEditorComponent_ng_template_4_Case_4_Conditional_4_Template, 1, 5, "input", 19);
    i0.ɵɵconditionalCreate(5, NxsMetadataEditorComponent_ng_template_4_Case_4_Conditional_5_Template, 2, 1, "mat-error");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const field_r16 = i0.ɵɵnextContext().$implicit;
    const label_r14 = i0.ɵɵreadContextLet(0);
    const error_r15 = i0.ɵɵreadContextLet(3);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(label_r14);
    i0.ɵɵadvance();
    i0.ɵɵconditional(field_r16.multiline ? 3 : 4);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(error_r15 ? 5 : -1);
} }
function NxsMetadataEditorComponent_ng_template_4_Case_5_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-error");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext(2);
    const label_r14 = i0.ɵɵreadContextLet(0);
    const error_r15 = i0.ɵɵreadContextLet(3);
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.errorText(error_r15, label_r14));
} }
function NxsMetadataEditorComponent_ng_template_4_Case_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-form-field", 14)(1, "mat-label");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelement(3, "input", 20);
    i0.ɵɵconditionalCreate(4, NxsMetadataEditorComponent_ng_template_4_Case_5_Conditional_4_Template, 2, 1, "mat-error");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r9 = i0.ɵɵnextContext();
    const control_r11 = ctx_r9.control;
    const path_r12 = ctx_r9.path;
    const label_r14 = i0.ɵɵreadContextLet(0);
    const definition_r13 = i0.ɵɵreadContextLet(2);
    const error_r15 = i0.ɵɵreadContextLet(3);
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(label_r14);
    i0.ɵɵadvance();
    i0.ɵɵproperty("formControl", ctx_r0.asControl(control_r11))("required", ctx_r0.isRequired(definition_r13))("errorStateMatcher", ctx_r0.errorMatcher);
    i0.ɵɵattribute("step", ctx_r0.step(definition_r13))("data-nxs-invalid", ctx_r0.showError(control_r11) ? "true" : null)("data-xpath", path_r12);
    i0.ɵɵadvance();
    i0.ɵɵconditional(error_r15 ? 4 : -1);
} }
function NxsMetadataEditorComponent_ng_template_4_Case_6_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-error");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext(2);
    const label_r14 = i0.ɵɵreadContextLet(0);
    const error_r15 = i0.ɵɵreadContextLet(3);
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.errorText(error_r15, label_r14));
} }
function NxsMetadataEditorComponent_ng_template_4_Case_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-form-field", 14)(1, "mat-label");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelement(3, "input", 21);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵpipe(5, "nxsDateMask");
    i0.ɵɵelement(6, "mat-datepicker-toggle", 22)(7, "mat-datepicker", null, 2);
    i0.ɵɵconditionalCreate(9, NxsMetadataEditorComponent_ng_template_4_Case_6_Conditional_9_Template, 2, 1, "mat-error");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const picker_r17 = i0.ɵɵreference(8);
    const ctx_r9 = i0.ɵɵnextContext();
    const control_r11 = ctx_r9.control;
    const path_r12 = ctx_r9.path;
    const label_r14 = i0.ɵɵreadContextLet(0);
    const definition_r13 = i0.ɵɵreadContextLet(2);
    const error_r15 = i0.ɵɵreadContextLet(3);
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(label_r14);
    i0.ɵɵadvance();
    i0.ɵɵproperty("matDatepicker", picker_r17)("placeholder", i0.ɵɵpipeBind1(5, 12, i0.ɵɵpipeBind1(4, 10, "common.date-mask")))("formControl", ctx_r0.asControl(control_r11))("required", ctx_r0.isRequired(definition_r13))("errorStateMatcher", ctx_r0.errorMatcher);
    i0.ɵɵattribute("data-nxs-invalid", ctx_r0.showError(control_r11) ? "true" : null)("data-xpath", path_r12);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("for", picker_r17);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(error_r15 ? 9 : -1);
} }
function NxsMetadataEditorComponent_ng_template_4_Case_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-checkbox", 15);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r9 = i0.ɵɵnextContext();
    const control_r11 = ctx_r9.control;
    const path_r12 = ctx_r9.path;
    const label_r14 = i0.ɵɵreadContextLet(0);
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("formControl", ctx_r0.asControl(control_r11));
    i0.ɵɵattribute("data-xpath", path_r12);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(label_r14);
} }
function NxsMetadataEditorComponent_ng_template_4_Case_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0, 9);
} if (rf & 2) {
    const ctx_r9 = i0.ɵɵnextContext();
    const control_r11 = ctx_r9.control;
    const path_r12 = ctx_r9.path;
    const label_r14 = i0.ɵɵreadContextLet(0);
    const definition_r13 = i0.ɵɵreadContextLet(2);
    const error_r15 = i0.ɵɵreadContextLet(3);
    i0.ɵɵnextContext();
    const vocabularyTemplate_r18 = i0.ɵɵreference(7);
    i0.ɵɵproperty("ngTemplateOutlet", vocabularyTemplate_r18)("ngTemplateOutletContext", i0.ɵɵpureFunction5(2, _c2, definition_r13, control_r11, label_r14, error_r15, path_r12));
} }
function NxsMetadataEditorComponent_ng_template_4_Case_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0, 9);
} if (rf & 2) {
    const ctx_r9 = i0.ɵɵnextContext();
    const control_r11 = ctx_r9.control;
    const path_r12 = ctx_r9.path;
    const label_r14 = i0.ɵɵreadContextLet(0);
    const definition_r13 = i0.ɵɵreadContextLet(2);
    const error_r15 = i0.ɵɵreadContextLet(3);
    i0.ɵɵnextContext();
    const vocabularyTemplate_r18 = i0.ɵɵreference(7);
    i0.ɵɵproperty("ngTemplateOutlet", vocabularyTemplate_r18)("ngTemplateOutletContext", i0.ɵɵpureFunction5(2, _c3, definition_r13, control_r11, label_r14, error_r15, path_r12));
} }
function NxsMetadataEditorComponent_ng_template_4_Case_10_For_6_Template(rf, ctx) { if (rf & 1) {
    const _r20 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-chip-row", 26);
    i0.ɵɵlistener("removed", function NxsMetadataEditorComponent_ng_template_4_Case_10_For_6_Template_mat_chip_row_removed_0_listener() { const $index_r21 = i0.ɵɵrestoreView(_r20).$index; const control_r11 = i0.ɵɵnextContext(2).control; const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.removeItem(control_r11, $index_r21)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementStart(2, "button", 27);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementStart(4, "mat-icon", 7);
    i0.ɵɵtext(5, "cancel");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const item_r22 = ctx.$implicit;
    i0.ɵɵproperty("value", item_r22);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", item_r22, " ");
    i0.ɵɵadvance();
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind2(3, 3, "satori-components.metadata-editor.remove-value", i0.ɵɵpureFunction1(6, _c4, item_r22)));
} }
function NxsMetadataEditorComponent_ng_template_4_Case_10_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-error");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext(2);
    const label_r14 = i0.ɵɵreadContextLet(0);
    const error_r15 = i0.ɵɵreadContextLet(3);
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.errorText(error_r15, label_r14));
} }
function NxsMetadataEditorComponent_ng_template_4_Case_10_Template(rf, ctx) { if (rf & 1) {
    const _r19 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-form-field", 14)(1, "mat-label");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "mat-chip-grid", 23, 3);
    i0.ɵɵrepeaterCreate(5, NxsMetadataEditorComponent_ng_template_4_Case_10_For_6_Template, 6, 8, "mat-chip-row", 24, i0.ɵɵrepeaterTrackByIndex);
    i0.ɵɵelementStart(7, "input", 25);
    i0.ɵɵlistener("matChipInputTokenEnd", function NxsMetadataEditorComponent_ng_template_4_Case_10_Template_input_matChipInputTokenEnd_7_listener($event) { i0.ɵɵrestoreView(_r19); const control_r11 = i0.ɵɵnextContext().control; const definition_r13 = i0.ɵɵreadContextLet(2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.addItem(control_r11, definition_r13, $event)); });
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(8, NxsMetadataEditorComponent_ng_template_4_Case_10_Conditional_8_Template, 2, 1, "mat-error");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const grid_r23 = i0.ɵɵreference(4);
    const ctx_r9 = i0.ɵɵnextContext();
    const control_r11 = ctx_r9.control;
    const path_r12 = ctx_r9.path;
    const label_r14 = i0.ɵɵreadContextLet(0);
    const definition_r13 = i0.ɵɵreadContextLet(2);
    const error_r15 = i0.ɵɵreadContextLet(3);
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(label_r14);
    i0.ɵɵadvance();
    i0.ɵɵproperty("formControl", ctx_r0.asControl(control_r11))("required", ctx_r0.isRequired(definition_r13))("errorStateMatcher", ctx_r0.errorMatcher);
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r0.listValue(control_r11));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("id", ctx_r0.id + "-" + path_r12 + "-input")("type", ctx_r0.inputType(definition_r13))("matChipInputFor", grid_r23)("matChipInputAddOnBlur", true);
    i0.ɵɵattribute("data-xpath", path_r12)("data-nxs-invalid", ctx_r0.showError(control_r11) ? "true" : null);
    i0.ɵɵadvance();
    i0.ɵɵconditional(error_r15 ? 8 : -1);
} }
function NxsMetadataEditorComponent_ng_template_4_Case_11_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 28);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const path_r12 = i0.ɵɵnextContext(2).path;
    const label_r14 = i0.ɵɵreadContextLet(0);
    const error_r15 = i0.ɵɵreadContextLet(3);
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("id", ctx_r0.id + "-" + path_r12 + "-error");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.errorText(error_r15, label_r14), " ");
} }
function NxsMetadataEditorComponent_ng_template_4_Case_11_For_5_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0, 9);
} if (rf & 2) {
    const sub_r24 = i0.ɵɵnextContext().$implicit;
    const ctx_r9 = i0.ɵɵnextContext(2);
    const depth_r25 = ctx_r9.depth;
    const path_r12 = ctx_r9.path;
    i0.ɵɵnextContext();
    const fieldTemplate_r3 = i0.ɵɵreference(5);
    i0.ɵɵproperty("ngTemplateOutlet", fieldTemplate_r3)("ngTemplateOutletContext", i0.ɵɵpureFunction4(2, _c5, sub_r24, ctx, depth_r25 + 1, path_r12 + "/" + sub_r24.xpath));
} }
function NxsMetadataEditorComponent_ng_template_4_Case_11_For_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, NxsMetadataEditorComponent_ng_template_4_Case_11_For_5_Conditional_0_Template, 1, 7, "ng-container", 9);
} if (rf & 2) {
    let tmp_22_0;
    const sub_r24 = ctx.$implicit;
    const control_r11 = i0.ɵɵnextContext(2).control;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵconditional((tmp_22_0 = ctx_r0.subControl(control_r11, sub_r24.xpath)) ? 0 : -1, tmp_22_0);
} }
function NxsMetadataEditorComponent_ng_template_4_Case_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "fieldset", 16)(1, "legend");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(3, NxsMetadataEditorComponent_ng_template_4_Case_11_Conditional_3_Template, 2, 2, "p", 28);
    i0.ɵɵrepeaterCreate(4, NxsMetadataEditorComponent_ng_template_4_Case_11_For_5_Template, 1, 1, null, null, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r9 = i0.ɵɵnextContext();
    const control_r11 = ctx_r9.control;
    const path_r12 = ctx_r9.path;
    const label_r14 = i0.ɵɵreadContextLet(0);
    const definition_r13 = i0.ɵɵreadContextLet(2);
    const error_r15 = i0.ɵɵreadContextLet(3);
    const ctx_r0 = i0.ɵɵnextContext();
    const groupInvalid_r26 = ctx_r0.showError(control_r11) && !!error_r15;
    i0.ɵɵattribute("data-xpath", path_r12)("aria-describedby", groupInvalid_r26 ? ctx_r0.id + "-" + path_r12 + "-error" : null);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(label_r14);
    i0.ɵɵadvance();
    i0.ɵɵconditional(groupInvalid_r26 ? 3 : -1);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r0.subFields(definition_r13));
} }
function NxsMetadataEditorComponent_ng_template_4_Case_12_For_4_For_5_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0, 9);
} if (rf & 2) {
    const sub_r29 = i0.ɵɵnextContext().$implicit;
    const ɵ$index_157_r30 = i0.ɵɵnextContext().$index;
    const ctx_r9 = i0.ɵɵnextContext(2);
    const depth_r25 = ctx_r9.depth;
    const path_r12 = ctx_r9.path;
    i0.ɵɵnextContext();
    const fieldTemplate_r3 = i0.ɵɵreference(5);
    i0.ɵɵproperty("ngTemplateOutlet", fieldTemplate_r3)("ngTemplateOutletContext", i0.ɵɵpureFunction4(2, _c5, sub_r29, ctx, depth_r25 + 1, path_r12 + "/" + ɵ$index_157_r30 + "/" + sub_r29.xpath));
} }
function NxsMetadataEditorComponent_ng_template_4_Case_12_For_4_For_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, NxsMetadataEditorComponent_ng_template_4_Case_12_For_4_For_5_Conditional_0_Template, 1, 7, "ng-container", 9);
} if (rf & 2) {
    let tmp_33_0;
    const sub_r29 = ctx.$implicit;
    const item_r31 = i0.ɵɵnextContext().$implicit;
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵconditional((tmp_33_0 = ctx_r0.subControl(item_r31, sub_r29.xpath)) ? 0 : -1, tmp_33_0);
} }
function NxsMetadataEditorComponent_ng_template_4_Case_12_For_4_Template(rf, ctx) { if (rf & 1) {
    const _r28 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "fieldset", 29)(1, "legend");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(4, NxsMetadataEditorComponent_ng_template_4_Case_12_For_4_For_5_Template, 1, 1, null, null, _forTrack0);
    i0.ɵɵelementStart(6, "button", 32);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵlistener("click", function NxsMetadataEditorComponent_ng_template_4_Case_12_For_4_Template_button_click_6_listener() { const ɵ$index_157_r30 = i0.ɵɵrestoreView(_r28).$index; const control_r11 = i0.ɵɵnextContext(2).control; const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.removeComplexItem(control_r11, ɵ$index_157_r30)); });
    i0.ɵɵelementStart(8, "mat-icon", 7);
    i0.ɵɵtext(9, "delete_outline");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(10);
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ɵ$index_157_r30 = ctx.$index;
    const control_r11 = i0.ɵɵnextContext(2).control;
    const label_r14 = i0.ɵɵreadContextLet(0);
    const definition_r13 = i0.ɵɵreadContextLet(2);
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(3, 4, "satori-components.metadata-editor.item", i0.ɵɵpureFunction2(12, _c7, label_r14, ɵ$index_157_r30 + 1)), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r0.subFields(definition_r13));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", control_r11.disabled);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind2(7, 7, "satori-components.metadata-editor.remove-item", i0.ɵɵpureFunction2(15, _c7, label_r14, ɵ$index_157_r30 + 1)));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(11, 10, "satori-components.metadata-editor.remove"), " ");
} }
function NxsMetadataEditorComponent_ng_template_4_Case_12_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 31);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const path_r12 = i0.ɵɵnextContext(2).path;
    const label_r14 = i0.ɵɵreadContextLet(0);
    const error_r15 = i0.ɵɵreadContextLet(3);
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵproperty("id", ctx_r0.id + "-" + path_r12 + "-error");
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.errorText(error_r15, label_r14), " ");
} }
function NxsMetadataEditorComponent_ng_template_4_Case_12_Template(rf, ctx) { if (rf & 1) {
    const _r27 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "fieldset", 16)(1, "legend");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵrepeaterCreate(3, NxsMetadataEditorComponent_ng_template_4_Case_12_For_4_Template, 12, 18, "fieldset", 29, i0.ɵɵrepeaterTrackByIdentity);
    i0.ɵɵelementStart(5, "button", 30);
    i0.ɵɵlistener("click", function NxsMetadataEditorComponent_ng_template_4_Case_12_Template_button_click_5_listener() { i0.ɵɵrestoreView(_r27); const ctx_r9 = i0.ɵɵnextContext(); const control_r11 = ctx_r9.control; const depth_r25 = ctx_r9.depth; const definition_r13 = i0.ɵɵreadContextLet(2); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.addComplexItem(control_r11, definition_r13, depth_r25)); });
    i0.ɵɵelementStart(6, "mat-icon", 7);
    i0.ɵɵtext(7, "add");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(10, NxsMetadataEditorComponent_ng_template_4_Case_12_Conditional_10_Template, 2, 2, "p", 31);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r9 = i0.ɵɵnextContext();
    const control_r11 = ctx_r9.control;
    const path_r12 = ctx_r9.path;
    const label_r14 = i0.ɵɵreadContextLet(0);
    const error_r15 = i0.ɵɵreadContextLet(3);
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵattribute("data-xpath", path_r12);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(label_r14);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r0.asArray(control_r11).controls);
    const listInvalid_r32 = ctx_r0.showError(control_r11);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", control_r11.disabled);
    i0.ɵɵattribute("data-nxs-invalid", listInvalid_r32 ? "true" : null)("aria-describedby", listInvalid_r32 ? ctx_r0.id + "-" + path_r12 + "-error" : null);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(9, 7, "satori-components.metadata-editor.add-item", i0.ɵɵpureFunction1(10, _c6, label_r14)), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(listInvalid_r32 && error_r15 ? 10 : -1);
} }
function NxsMetadataEditorComponent_ng_template_4_Case_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 17)(1, "span", 33);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "span", 34);
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r9 = i0.ɵɵnextContext();
    const control_r11 = ctx_r9.control;
    const path_r12 = ctx_r9.path;
    const label_r14 = i0.ɵɵreadContextLet(0);
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵattribute("data-xpath", path_r12);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(label_r14);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r0.readOnlyText(control_r11) || i0.ɵɵpipeBind1(5, 3, "satori-components.metadata-editor.no-value"), " ");
} }
function NxsMetadataEditorComponent_ng_template_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdeclareLet(0);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵdeclareLet(2)(3);
    i0.ɵɵconditionalCreate(4, NxsMetadataEditorComponent_ng_template_4_Case_4_Template, 6, 3, "mat-form-field", 14)(5, NxsMetadataEditorComponent_ng_template_4_Case_5_Template, 5, 8, "mat-form-field", 14)(6, NxsMetadataEditorComponent_ng_template_4_Case_6_Template, 10, 14, "mat-form-field", 14)(7, NxsMetadataEditorComponent_ng_template_4_Case_7_Template, 2, 3, "mat-checkbox", 15)(8, NxsMetadataEditorComponent_ng_template_4_Case_8_Template, 1, 8, "ng-container", 9)(9, NxsMetadataEditorComponent_ng_template_4_Case_9_Template, 1, 8, "ng-container", 9)(10, NxsMetadataEditorComponent_ng_template_4_Case_10_Template, 9, 11, "mat-form-field", 14)(11, NxsMetadataEditorComponent_ng_template_4_Case_11_Template, 6, 4, "fieldset", 16)(12, NxsMetadataEditorComponent_ng_template_4_Case_12_Template, 11, 12, "fieldset", 16)(13, NxsMetadataEditorComponent_ng_template_4_Case_13_Template, 6, 5, "div", 17);
} if (rf & 2) {
    let tmp_10_0;
    const field_r16 = ctx.$implicit;
    const control_r11 = ctx.control;
    const depth_r25 = ctx.depth;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵstoreLet(field_r16.labelKey ? i0.ɵɵpipeBind1(1, 1, field_r16.labelKey) : field_r16.label);
    i0.ɵɵadvance(2);
    const definition_r33 = i0.ɵɵstoreLet(field_r16.definition);
    i0.ɵɵadvance();
    i0.ɵɵstoreLet(ctx_r0.errorOf(control_r11));
    i0.ɵɵadvance();
    i0.ɵɵconditional((tmp_10_0 = ctx_r0.kindOf(definition_r33, depth_r25)) === "text" ? 4 : tmp_10_0 === "number" ? 5 : tmp_10_0 === "date" ? 6 : tmp_10_0 === "boolean" ? 7 : tmp_10_0 === "vocabulary" ? 8 : tmp_10_0 === "vocabulary-list" ? 9 : tmp_10_0 === "list" ? 10 : tmp_10_0 === "complex" ? 11 : tmp_10_0 === "complex-list" ? 12 : 13);
} }
function NxsMetadataEditorComponent_ng_template_6_For_7_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r35 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-chip", 41);
    i0.ɵɵlistener("removed", function NxsMetadataEditorComponent_ng_template_6_For_7_Conditional_0_Template_mat_chip_removed_0_listener() { i0.ɵɵrestoreView(_r35); const $index_r36 = i0.ɵɵnextContext().$index; const ctx_r36 = i0.ɵɵnextContext(); const control_r38 = ctx_r36.control; const multiple_r39 = ctx_r36.multiple; const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(multiple_r39 ? ctx_r0.removeItem(control_r38, $index_r36) : ctx_r0.clearValue(control_r38, false)); });
    i0.ɵɵtext(1);
    i0.ɵɵelementStart(2, "button", 42);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵlistener("click", function NxsMetadataEditorComponent_ng_template_6_For_7_Conditional_0_Template_button_click_2_listener($event) { i0.ɵɵrestoreView(_r35); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵelementStart(4, "mat-icon", 7);
    i0.ɵɵtext(5, "cancel");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const id_r40 = i0.ɵɵnextContext().$implicit;
    const ctx_r36 = i0.ɵɵnextContext();
    const definition_r41 = ctx_r36.definition;
    const control_r38 = ctx_r36.control;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", ctx_r0.vocabularyLabel(definition_r41.directory, id_r40), " ");
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", control_r38.disabled);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind2(3, 3, "satori-components.metadata-editor.remove-value", i0.ɵɵpureFunction1(6, _c4, ctx_r0.vocabularyLabel(definition_r41.directory, id_r40))));
} }
function NxsMetadataEditorComponent_ng_template_6_For_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, NxsMetadataEditorComponent_ng_template_6_For_7_Conditional_0_Template, 6, 8, "mat-chip");
} if (rf & 2) {
    const id_r40 = ctx.$implicit;
    i0.ɵɵconditional(id_r40 ? 0 : -1);
} }
function NxsMetadataEditorComponent_ng_template_6_Conditional_13_For_1_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 24);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const entry_r42 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("value", entry_r42.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.l10nEntryLabel(entry_r42));
} }
function NxsMetadataEditorComponent_ng_template_6_Conditional_13_For_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-optgroup", 43);
    i0.ɵɵrepeaterCreate(1, NxsMetadataEditorComponent_ng_template_6_Conditional_13_For_1_For_2_Template, 2, 2, "mat-option", 24, _forTrack1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const group_r43 = ctx.$implicit;
    i0.ɵɵproperty("label", group_r43.parentLabel);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(group_r43.entries);
} }
function NxsMetadataEditorComponent_ng_template_6_Conditional_13_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, NxsMetadataEditorComponent_ng_template_6_Conditional_13_For_1_Template, 3, 1, "mat-optgroup", 43, _forTrack2);
} if (rf & 2) {
    const definition_r41 = i0.ɵɵnextContext().definition;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵrepeater(ctx_r0.groupedOptions(definition_r41.directory));
} }
function NxsMetadataEditorComponent_ng_template_6_Conditional_14_For_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-option", 24);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const entry_r44 = ctx.$implicit;
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("value", entry_r44.id);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.directoryPickerLabel(entry_r44));
} }
function NxsMetadataEditorComponent_ng_template_6_Conditional_14_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵrepeaterCreate(0, NxsMetadataEditorComponent_ng_template_6_Conditional_14_For_1_Template, 2, 2, "mat-option", 24, _forTrack1);
} if (rf & 2) {
    const definition_r41 = i0.ɵɵnextContext().definition;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵrepeater(ctx_r0.flatOptions(definition_r41.directory));
} }
function NxsMetadataEditorComponent_ng_template_6_Conditional_15_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "mat-error");
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r36 = i0.ɵɵnextContext();
    const label_r45 = ctx_r36.label;
    const error_r46 = ctx_r36.error;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.errorText(error_r46, label_r45));
} }
function NxsMetadataEditorComponent_ng_template_6_Template(rf, ctx) { if (rf & 1) {
    const _r34 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "mat-form-field", 35)(1, "mat-label");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "mat-select", 36);
    i0.ɵɵlistener("openedChange", function NxsMetadataEditorComponent_ng_template_6_Template_mat_select_openedChange_3_listener() { i0.ɵɵrestoreView(_r34); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.panelToggled()); });
    i0.ɵɵelementStart(4, "mat-select-trigger")(5, "mat-chip-set", 37);
    i0.ɵɵrepeaterCreate(6, NxsMetadataEditorComponent_ng_template_6_For_7_Template, 1, 1, null, null, i0.ɵɵrepeaterTrackByIndex);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "div", 38)(9, "input", 39);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵpipe(11, "translate");
    i0.ɵɵlistener("input", function NxsMetadataEditorComponent_ng_template_6_Template_input_input_9_listener($event) { i0.ɵɵrestoreView(_r34); const ctx_r0 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r0.search($event)); })("click", function NxsMetadataEditorComponent_ng_template_6_Template_input_click_9_listener($event) { i0.ɵɵrestoreView(_r34); return i0.ɵɵresetView($event.stopPropagation()); })("keydown", function NxsMetadataEditorComponent_ng_template_6_Template_input_keydown_9_listener($event) { i0.ɵɵrestoreView(_r34); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "div", 40);
    i0.ɵɵconditionalCreate(13, NxsMetadataEditorComponent_ng_template_6_Conditional_13_Template, 2, 0)(14, NxsMetadataEditorComponent_ng_template_6_Conditional_14_Template, 2, 0);
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(15, NxsMetadataEditorComponent_ng_template_6_Conditional_15_Template, 2, 1, "mat-error");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const definition_r41 = ctx.definition;
    const control_r38 = ctx.control;
    const label_r45 = ctx.label;
    const error_r46 = ctx.error;
    const path_r47 = ctx.path;
    const multiple_r39 = ctx.multiple;
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(label_r45);
    i0.ɵɵadvance();
    i0.ɵɵproperty("formControl", ctx_r0.asControl(control_r38))("multiple", multiple_r39)("required", ctx_r0.isRequired(definition_r41))("errorStateMatcher", ctx_r0.errorMatcher)("panelClass", ctx_r0.usesL10n(definition_r41.directory) ? "nxs-vocabulary-panel nxs-vocabulary-panel--grouped" : "nxs-vocabulary-panel");
    i0.ɵɵattribute("data-nxs-invalid", ctx_r0.showError(control_r38) ? "true" : null)("data-xpath", path_r47);
    i0.ɵɵadvance(3);
    i0.ɵɵrepeater(multiple_r39 ? ctx_r0.listValue(control_r38) : i0.ɵɵpureFunction1(18, _c8, control_r38.value));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("value", ctx_r0.panelSearch())("placeholder", i0.ɵɵpipeBind1(10, 13, "satori-components.metadata-editor.search"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind2(11, 15, "satori-components.metadata-editor.search-in", i0.ɵɵpureFunction1(20, _c6, label_r45)));
    i0.ɵɵadvance(4);
    i0.ɵɵconditional(ctx_r0.usesL10n(definition_r41.directory) ? 13 : 14);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(error_r46 ? 15 : -1);
} }
/** Web UI's `nuxeo-dublincore-edit-layout`, the fields every editable document has. */
const DUBLIN_CORE = [
    {
        xpath: 'dc:title',
        label: '',
        labelKey: 'satori-components.metadata-editor.title',
        definition: { type: 'string', required: true },
    },
    {
        xpath: 'dc:description',
        label: '',
        labelKey: 'satori-components.metadata-editor.description',
        definition: { type: 'string' },
        multiline: true,
    },
    {
        xpath: 'dc:nature',
        label: '',
        labelKey: 'satori-components.metadata-editor.nature',
        definition: { type: 'string', directory: 'nature' },
    },
    {
        xpath: 'dc:subjects',
        label: '',
        labelKey: 'satori-components.metadata-editor.subjects',
        definition: { type: 'string[]', directory: 'l10nsubjects' },
    },
    {
        xpath: 'dc:coverage',
        label: '',
        labelKey: 'satori-components.metadata-editor.coverage',
        definition: { type: 'string', directory: 'l10ncoverage' },
    },
    {
        xpath: 'dc:expired',
        label: '',
        labelKey: 'satori-components.metadata-editor.expires',
        definition: { type: 'date' },
    },
];
const ERROR_KEYS = {
    required: 'satori-components.metadata-editor.error.required',
    date: 'satori-components.metadata-editor.error.date',
    number: 'satori-components.metadata-editor.error.number',
    integer: 'satori-components.metadata-editor.error.integer',
    pattern: 'satori-components.metadata-editor.error.pattern',
    item: 'satori-components.metadata-editor.error.item',
    minLength: 'satori-components.metadata-editor.error.min-length',
    maxLength: 'satori-components.metadata-editor.error.max-length',
    minimum: 'satori-components.metadata-editor.error.minimum',
    'minimum-exclusive': 'satori-components.metadata-editor.error.minimum-exclusive',
    maximum: 'satori-components.metadata-editor.error.maximum',
    'maximum-exclusive': 'satori-components.metadata-editor.error.maximum-exclusive',
    invalid: 'satori-components.metadata-editor.error.invalid',
};
const DUBLIN_CORE_XPATHS = new Set(DUBLIN_CORE.map((field) => field.xpath));
/** `billedAmount` → "Billed amount": a complex field's sub-fields carry no label of their own. */
function humanize(name) {
    const words = name
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/[_-]+/g, ' ')
        .trim()
        .toLowerCase();
    return words.charAt(0).toUpperCase() + words.slice(1);
}
function directoriesOf(definition, into) {
    if (definition.directory)
        into.add(definition.directory);
    for (const child of Object.values(definition.fields ?? {}))
        directoriesOf(child, into);
}
let nextId = 0;
/**
 * The form that edits a document's properties — Web UI's `nuxeo-document-edit` and
 * `nuxeo-document-create` layouts, schema-driven.
 *
 * It owns the Dublin Core fields every document has (title, description, nature, subjects,
 * coverage, expiry), then renders the `sections` it is given: one control per field, chosen from
 * the field's type, with the schema's constraints checked as the user types.
 *
 * The host owns the buttons. On Save it calls `validate()`, which shows every error, announces how
 * many fields need a correction and moves focus to the first; when that passes, it sends
 * `dirtyProperties()` for an edit or `properties()` for a create. Errors the server reports go
 * back through `showServerErrors()`.
 */
export class NxsMetadataEditorComponent {
    /** The type's fields beyond Dublin Core, from its layout. A field Dublin Core already has is skipped. */
    sections = input([], ...(ngDevMode ? [{ debugName: "sections" }] : []));
    /** Show `sections` one after another under headings, or as tabs. */
    display = input('sections', ...(ngDevMode ? [{ debugName: "display" }] : []));
    /** The current property values. A new object resets the form and discards what was typed. */
    values = input({}, ...(ngDevMode ? [{ debugName: "values" }] : []));
    /** Show the Dublin Core fields. Off for a type that has no `dublincore` schema. */
    dublinCore = input(true, ...(ngDevMode ? [{ debugName: "dublinCore" }] : []));
    /** While saving: every control is read-only. */
    disabled = input(false, ...(ngDevMode ? [{ debugName: "disabled" }] : []));
    /** The level of the section headings, one below the dialog or page title. */
    headingLevel = input(3, ...(ngDevMode ? [{ debugName: "headingLevel" }] : []));
    /** The tab strip's accessible name in tabs display. Empty uses the default. */
    tabsLabel = input('', ...(ngDevMode ? [{ debugName: "tabsLabel" }] : []));
    /** Every value passes its field's constraints, or not. Emitted when that changes. */
    validChange = output();
    directories = inject(DirectoryService);
    translate = inject(TranslateService);
    destroyRef = inject(DestroyRef);
    injector = inject(Injector);
    host = inject(ElementRef);
    /** The datepickers' adapter, from `provideNxsDateAdapter()`: date controls hold its dates. */
    dateAdapter = inject(DateAdapter);
    id = `nxs-metadata-editor-${nextId++}`;
    form = new FormGroup({});
    /** Bumped whenever controls are added or removed, so the template reads the new set. */
    structure = signal(0, ...(ngDevMode ? [{ debugName: "structure" }] : []));
    submitted = signal(false, ...(ngDevMode ? [{ debugName: "submitted" }] : []));
    invalidCount = signal(0, ...(ngDevMode ? [{ debugName: "invalidCount" }] : []));
    selectedTab = signal(0, ...(ngDevMode ? [{ debugName: "selectedTab" }] : []));
    panelSearch = signal('', ...(ngDevMode ? [{ debugName: "panelSearch" }] : []));
    vocabularies = signal(new Map(), ...(ngDevMode ? [{ debugName: "vocabularies" }] : []));
    requested = new Set();
    builtFrom = null;
    /** Never shown: stands in for a control of an unexpected shape so a binding never throws. */
    detached = new FormControl();
    detachedList = new FormArray([]);
    valid = true;
    /**
     * The server's message per field, with the value it refused. Held as a validator rather than
     * set once with `setErrors`, because re-enabling the form after a save re-runs every validator
     * and would drop it; it lapses as soon as the value differs from the one refused.
     */
    serverMessages = new Map();
    /** Server messages arrived while the form was disabled: reveal them once it is enabled. */
    revealOnEnable = false;
    standardFields = computed(() => this.dublinCore() ? DUBLIN_CORE : [], ...(ngDevMode ? [{ debugName: "standardFields" }] : []));
    typeSections = computed(() => {
        const skip = this.dublinCore() ? DUBLIN_CORE_XPATHS : new Set();
        return this.sections()
            .map((section) => ({
            ...section,
            fields: section.fields.filter((field) => !skip.has(field.xpath)),
        }))
            .filter((section) => section.fields.length > 0);
    }, ...(ngDevMode ? [{ debugName: "typeSections" }] : []));
    tabs = computed(() => this.typeSections().map((section) => ({
        id: section.id,
        label: section.heading ?? section.id,
    })), ...(ngDevMode ? [{ debugName: "tabs" }] : []));
    fields = computed(() => [
        ...this.standardFields(),
        ...this.typeSections().flatMap((section) => section.fields),
    ], ...(ngDevMode ? [{ debugName: "fields" }] : []));
    errorMatcher = {
        isErrorState: (control) => !!control && control.invalid && (control.touched || this.submitted()),
    };
    l10nEntryLabel = l10nEntryLabel;
    directoryPickerLabel = directoryPickerLabel;
    constructor() {
        effect(() => {
            const fields = this.fields();
            const values = this.values();
            untracked(() => this.build(fields, values));
        });
        effect(() => {
            const disabled = this.disabled();
            untracked(() => this.applyDisabled(disabled));
        });
        this.form.statusChanges
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.statusChanged());
    }
    /**
     * Shows every error, announces how many fields need a correction and focuses the first.
     * Answers whether the form can be saved.
     */
    validate() {
        this.form.markAllAsTouched();
        this.form.updateValueAndValidity();
        this.submitted.set(true);
        this.invalidCount.set(this.countInvalid());
        if (this.form.valid)
            return true;
        this.revealFirstInvalid();
        return false;
    }
    /** The values the user changed, by xpath, as the document properties take them. */
    dirtyProperties() {
        return this.collect((control) => control.dirty);
    }
    /** Every value in the form, by xpath — what a new document is created with. */
    properties() {
        return this.collect(() => true);
    }
    /**
     * Puts the server's messages on the fields they name, by xpath, until the value changes.
     * Answers the messages for fields the form does not show, for the host to report another way.
     */
    showServerErrors(errors) {
        const unplaced = [];
        for (const [xpath, message] of Object.entries(errors)) {
            const control = this.form.controls[xpath];
            if (!control) {
                unplaced.push(message);
                continue;
            }
            this.serverMessages.set(xpath, { message, refused: JSON.stringify(control.getRawValue()) });
            control.markAsTouched();
            control.updateValueAndValidity({ emitEvent: false });
        }
        this.submitted.set(true);
        this.form.updateValueAndValidity();
        this.invalidCount.set(this.countInvalid());
        if (this.form.disabled)
            this.revealOnEnable = true;
        else if (this.form.invalid)
            this.revealFirstInvalid();
        return unplaced;
    }
    kindOf(definition, depth) {
        return fieldKind(definition, depth);
    }
    controlFor(field) {
        this.structure();
        return this.form.controls[field.xpath] ?? null;
    }
    asControl(control) {
        return control instanceof FormControl ? control : this.detached;
    }
    asArray(control) {
        return control instanceof FormArray ? control : this.detachedList;
    }
    /** A complex field's sub-fields, labelled from their names. */
    subFields(definition) {
        return Object.entries(definition.fields ?? {}).map(([name, child]) => ({
            xpath: name,
            label: humanize(name),
            definition: child,
        }));
    }
    subControl(group, name) {
        return group instanceof FormGroup ? (group.controls[name] ?? null) : null;
    }
    showError(control) {
        return control.invalid && (control.touched || this.submitted());
    }
    errorOf(control) {
        return firstError(control);
    }
    /** The message for an error, naming the field so it reads on its own in the error summary's wake. */
    errorText(error, label) {
        if (error.key === 'server') {
            const message = error.params['message'];
            return typeof message === 'string' ? message : '';
        }
        const key = ERROR_KEYS[error.key] ?? ERROR_KEYS['invalid'];
        return this.translate.instant(key, { ...error.params, label });
    }
    search(event) {
        if (event.target instanceof HTMLInputElement)
            this.panelSearch.set(event.target.value);
    }
    isRequired(definition) {
        return definition.required === true;
    }
    inputType(definition) {
        return fieldKind(definition) === 'number' ? 'number' : 'text';
    }
    step(definition) {
        return baseType(definition) === 'double'
            ? 'any'
            : fieldKind(definition) === 'number'
                ? '1'
                : null;
    }
    readOnlyText(control) {
        const value = control.value;
        const items = Array.isArray(value) ? value : [value];
        return items
            .map((item) => nxsPropertyText(item))
            .filter((text) => text !== '')
            .join(', ');
    }
    flatOptions(directory) {
        const vocabulary = this.vocabularies().get(directory);
        if (!vocabulary || vocabulary.l10n)
            return [];
        return filterDirectoryPickerEntries([...vocabulary.entries], this.panelSearch());
    }
    groupedOptions(directory) {
        const vocabulary = this.vocabularies().get(directory);
        if (!vocabulary?.l10n)
            return [];
        return groupL10nChildrenByParent([...vocabulary.entries], this.panelSearch());
    }
    usesL10n(directory) {
        return directoryUsesL10nLabel(directory);
    }
    /** A vocabulary value's label, `Parent/Child` for a hierarchical one. The stored ID until loaded. */
    vocabularyLabel(directory, id) {
        if (typeof id !== 'string')
            return '';
        const vocabulary = this.vocabularies().get(directory);
        if (!vocabulary)
            return id;
        if (vocabulary.l10n)
            return formatHierarchicalL10nLabel(id, [...vocabulary.entries]);
        const entry = vocabulary.entries.find((candidate) => candidate.id === id);
        return entry ? directoryPickerLabel(entry) : id;
    }
    listValue(control) {
        return Array.isArray(control.value) ? control.value : [];
    }
    /** Each vocabulary panel opens with an empty search. */
    panelToggled() {
        this.panelSearch.set('');
    }
    clearValue(control, multiple) {
        control.setValue(multiple ? [] : null);
        control.markAsDirty();
        control.markAsTouched();
    }
    removeItem(control, index) {
        control.setValue(this.listValue(control).filter((_, at) => at !== index));
        control.markAsDirty();
        control.markAsTouched();
    }
    addItem(control, definition, event) {
        const text = event.value.trim();
        event.chipInput.clear();
        if (text === '')
            return;
        const item = fieldKind({ type: baseType(definition) }) === 'number' ? Number(text) : text;
        control.setValue([...this.listValue(control), item]);
        control.markAsDirty();
        control.markAsTouched();
    }
    addComplexItem(control, definition, depth) {
        if (!(control instanceof FormArray))
            return;
        control.push(newComplexItem(definition, this.dateAdapter, depth));
        control.markAsDirty();
        this.structure.update((value) => value + 1);
    }
    removeComplexItem(control, index) {
        if (!(control instanceof FormArray))
            return;
        control.removeAt(index);
        control.markAsDirty();
        control.markAsTouched();
        this.structure.update((value) => value + 1);
    }
    selectTab(index) {
        this.selectedTab.set(index);
    }
    build(fields, values) {
        if (values !== this.builtFrom) {
            for (const xpath of Object.keys(this.form.controls))
                this.form.removeControl(xpath, { emitEvent: false });
            this.builtFrom = values;
            this.serverMessages.clear();
            this.submitted.set(false);
            this.invalidCount.set(0);
        }
        const wanted = new Set(fields.map((field) => field.xpath));
        for (const xpath of Object.keys(this.form.controls)) {
            if (wanted.has(xpath))
                continue;
            this.form.removeControl(xpath, { emitEvent: false });
            this.serverMessages.delete(xpath);
        }
        const directories = new Set();
        for (const field of fields) {
            directoriesOf(field.definition, directories);
            if (this.form.controls[field.xpath])
                continue;
            const control = buildControl(field.definition, values[field.xpath], this.dateAdapter);
            control.addValidators(this.heldServerMessage(field.xpath));
            control.updateValueAndValidity({ emitEvent: false });
            this.form.addControl(field.xpath, control, { emitEvent: false });
        }
        this.applyDisabled(untracked(this.disabled));
        this.loadVocabularies(directories);
        this.structure.update((value) => value + 1);
        this.statusChanged();
    }
    applyDisabled(disabled) {
        if (disabled) {
            this.form.disable({ emitEvent: false });
            return;
        }
        this.form.enable({ emitEvent: false });
        for (const field of untracked(this.fields)) {
            const control = this.form.controls[field.xpath];
            if (control)
                this.lockReadOnly(field.definition, control, 0);
        }
        this.statusChanged();
        if (this.revealOnEnable) {
            this.revealOnEnable = false;
            if (this.form.invalid)
                this.revealFirstInvalid();
        }
    }
    heldServerMessage(xpath) {
        return (control) => {
            const held = this.serverMessages.get(xpath);
            return held && JSON.stringify(control.getRawValue()) === held.refused
                ? { server: held.message }
                : null;
        };
    }
    /** `enable()` reaches every control; a file or an unsupported shape stays read-only. */
    lockReadOnly(definition, control, depth) {
        const kind = fieldKind(definition, depth);
        if (kind === 'read-only') {
            control.disable({ emitEvent: false });
            return;
        }
        const children = definition.fields ?? {};
        const groups = kind === 'complex'
            ? [control]
            : kind === 'complex-list' && control instanceof FormArray
                ? control.controls
                : [];
        for (const group of groups) {
            if (!(group instanceof FormGroup))
                continue;
            for (const [name, child] of Object.entries(children)) {
                const sub = group.controls[name];
                if (sub)
                    this.lockReadOnly(child, sub, depth + 1);
            }
        }
    }
    loadVocabularies(directories) {
        for (const directory of directories) {
            if (this.requested.has(directory))
                continue;
            this.requested.add(directory);
            const store = (vocabulary) => this.vocabularies.update((current) => new Map(current).set(directory, vocabulary));
            if (directoryUsesL10nLabel(directory)) {
                this.directories
                    .getAllL10nEntries(directory)
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe({
                    next: (entries) => store({ l10n: true, entries }),
                    error: () => this.requested.delete(directory),
                });
            }
            else {
                this.directories
                    .getEntries(directory)
                    .pipe(takeUntilDestroyed(this.destroyRef))
                    .subscribe({
                    next: (entries) => store({ l10n: false, entries }),
                    error: () => this.requested.delete(directory),
                });
            }
        }
    }
    collect(include) {
        const out = {};
        for (const field of untracked(this.fields)) {
            const control = this.form.controls[field.xpath];
            if (!control || fieldKind(field.definition) === 'read-only' || !include(control))
                continue;
            out[field.xpath] = propertyValue(field.definition, control, this.dateAdapter, 0, field.multiline === true);
        }
        return out;
    }
    statusChanged() {
        if (this.submitted())
            this.invalidCount.set(this.countInvalid());
        const valid = this.form.valid || this.form.disabled;
        if (valid === this.valid)
            return;
        this.valid = valid;
        this.validChange.emit(valid);
    }
    countInvalid() {
        const count = (control) => {
            if (control instanceof FormGroup || control instanceof FormArray) {
                const own = control.errors ? 1 : 0;
                return own + Object.values(control.controls).reduce((sum, child) => sum + count(child), 0);
            }
            return control.invalid ? 1 : 0;
        };
        return Object.values(this.form.controls).reduce((sum, control) => sum + count(control), 0);
    }
    /** Opens the tab holding the first invalid field, then focuses it once it has rendered. */
    revealFirstInvalid() {
        const standardInvalid = untracked(this.standardFields).some((field) => this.form.controls[field.xpath]?.invalid);
        if (!standardInvalid && untracked(this.display) === 'tabs') {
            const index = untracked(this.typeSections).findIndex((section) => section.fields.some((field) => this.form.controls[field.xpath]?.invalid));
            if (index >= 0)
                this.selectedTab.set(index);
        }
        this.focusFirstInvalid(3);
    }
    /** A tab's content attaches a render after the tab is selected, so the field may not exist yet. */
    focusFirstInvalid(attempts) {
        afterNextRender(() => {
            const target = this.host.nativeElement.querySelector('[data-nxs-invalid="true"]');
            if (target)
                target.focus();
            else if (attempts > 1)
                this.focusFirstInvalid(attempts - 1);
        }, { injector: this.injector });
    }
    static ɵfac = function NxsMetadataEditorComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsMetadataEditorComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsMetadataEditorComponent, selectors: [["nxs-metadata-editor"]], hostAttrs: [1, "nxs-metadata-editor"], inputs: { sections: [1, "sections"], display: [1, "display"], values: [1, "values"], dublinCore: [1, "dublinCore"], disabled: [1, "disabled"], headingLevel: [1, "headingLevel"], tabsLabel: [1, "tabsLabel"] }, outputs: { validChange: "validChange" }, features: [i0.ɵɵProvidersFeature([provideNxsDateAdapter()])], decls: 8, vars: 3, consts: [["fieldTemplate", ""], ["vocabularyTemplate", ""], ["picker", ""], ["grid", ""], ["role", "alert", 1, "nxs-metadata-editor__summary", 3, "id"], [1, "nxs-metadata-editor__fields"], [1, "nxs-metadata-editor__tabs", 3, "tabs", "label", "selectedIndex"], ["aria-hidden", "true"], [1, "nxs-metadata-editor__summary-text"], [3, "ngTemplateOutlet", "ngTemplateOutletContext"], [1, "nxs-metadata-editor__tabs", 3, "selectedIndexChange", "tabs", "label", "selectedIndex"], ["nxsTabBody", ""], [1, "nxs-metadata-editor__section"], ["role", "heading", 1, "nxs-metadata-editor__heading", 3, "id"], ["appearance", "outline", "subscriptSizing", "dynamic", 1, "nxs-metadata-editor__field"], [1, "nxs-metadata-editor__checkbox", 3, "formControl"], [1, "nxs-metadata-editor__group"], [1, "nxs-metadata-editor__read-only"], ["matInput", "", "rows", "2", 3, "formControl", "required", "errorStateMatcher"], ["matInput", "", "type", "text", 3, "formControl", "required", "errorStateMatcher"], ["matInput", "", "type", "number", 3, "formControl", "required", "errorStateMatcher"], ["matInput", "", 3, "matDatepicker", "placeholder", "formControl", "required", "errorStateMatcher"], ["matIconSuffix", "", 3, "for"], [3, "formControl", "required", "errorStateMatcher"], [3, "value"], [3, "matChipInputTokenEnd", "id", "type", "matChipInputFor", "matChipInputAddOnBlur"], [3, "removed", "value"], ["type", "button", "matChipRemove", ""], ["tabindex", "-1", "data-nxs-invalid", "true", 1, "nxs-metadata-editor__error", 3, "id"], [1, "nxs-metadata-editor__item"], ["mat-stroked-button", "", "type", "button", 1, "nxs-metadata-editor__add", 3, "click", "disabled"], [1, "nxs-metadata-editor__error", 3, "id"], ["mat-button", "", "type", "button", 1, "nxs-metadata-editor__remove", 3, "click", "disabled"], [1, "nxs-metadata-editor__read-only-label"], [1, "nxs-metadata-editor__read-only-value"], ["appearance", "outline", "subscriptSizing", "dynamic", 1, "nxs-metadata-editor__field", "nxs-metadata-editor__vocabulary"], [3, "openedChange", "formControl", "multiple", "required", "errorStateMatcher", "panelClass"], [1, "nxs-metadata-editor__trigger-chips"], [1, "nxs-vocabulary-panel__search"], ["type", "text", 3, "input", "click", "keydown", "value", "placeholder"], [1, "nxs-vocabulary-panel__list"], [3, "removed"], ["type", "button", "matChipRemove", "", 3, "click", "disabled"], [3, "label"]], template: function NxsMetadataEditorComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, NxsMetadataEditorComponent_Conditional_0_Template, 6, 2, "div", 4);
            i0.ɵɵconditionalCreate(1, NxsMetadataEditorComponent_Conditional_1_Template, 3, 0, "div", 5);
            i0.ɵɵconditionalCreate(2, NxsMetadataEditorComponent_Conditional_2_Template, 3, 5, "nxs-tabs", 6)(3, NxsMetadataEditorComponent_Conditional_3_Template, 2, 0);
            i0.ɵɵtemplate(4, NxsMetadataEditorComponent_ng_template_4_Template, 14, 6, "ng-template", null, 0, i0.ɵɵtemplateRefExtractor)(6, NxsMetadataEditorComponent_ng_template_6_Template, 16, 22, "ng-template", null, 1, i0.ɵɵtemplateRefExtractor);
        } if (rf & 2) {
            i0.ɵɵconditional(ctx.submitted() && ctx.invalidCount() > 0 ? 0 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.standardFields().length ? 1 : -1);
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.display() === "tabs" && ctx.typeSections().length ? 2 : 3);
        } }, dependencies: [NgTemplateOutlet,
            ReactiveFormsModule, i1.DefaultValueAccessor, i1.NumberValueAccessor, i1.NgControlStatus, i1.RequiredValidator, i1.FormControlDirective, MatButtonModule, i2.MatButton, MatCheckboxModule, i3.MatCheckbox, MatChipsModule, i4.MatChip, i4.MatChipGrid, i4.MatChipInput, i4.MatChipRemove, i4.MatChipRow, i4.MatChipSet, MatDatepickerModule, i5.MatDatepicker, i5.MatDatepickerInput, i5.MatDatepickerToggle, MatFormFieldModule, i6.MatFormField, i6.MatLabel, i6.MatError, i6.MatSuffix, MatIconModule, i7.MatIcon, MatInputModule, i8.MatInput, MatOptionModule, i9.MatOption, i9.MatOptgroup, MatSelectModule, i9.MatSelect, i9.MatSelectTrigger, NxsTabsComponent,
            NxsTabBodyDirective,
            TranslatePipe,
            NxsDateMaskPipe], styles: ["[_nghost-%COMP%] {\n  --nxs-metadata-editor-heading: var(--mat-sys-on-surface);\n  --nxs-metadata-editor-label: var(--mat-sys-on-surface-variant);\n  --nxs-metadata-editor-divider: var(--mat-sys-outline-variant);\n  --nxs-metadata-editor-error: var(--mat-sys-error);\n  --nxs-metadata-editor-error-surface: var(--mat-sys-error-container);\n  --nxs-metadata-editor-on-error-surface: var(--mat-sys-on-error-container);\n  display: flex;\n  flex-direction: column;\n  gap: 20px;\n}\n\n.nxs-metadata-editor__summary[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 10px 12px;\n  border-radius: 4px;\n  background: var(--nxs-metadata-editor-error-surface);\n  color: var(--nxs-metadata-editor-on-error-surface);\n  font-size: 0.875rem;\n}\n\n.nxs-metadata-editor__fields[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}\n\n.nxs-metadata-editor__tabs[_ngcontent-%COMP%]   .nxs-metadata-editor__fields[_ngcontent-%COMP%] {\n  padding-top: 16px;\n}\n\n.nxs-metadata-editor__section[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  padding-top: 16px;\n  border-top: 1px solid var(--nxs-metadata-editor-divider);\n}\n\n.nxs-metadata-editor__heading[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 0.9375rem;\n  font-weight: 600;\n  color: var(--nxs-metadata-editor-heading);\n}\n\n.nxs-metadata-editor__field[_ngcontent-%COMP%] {\n  width: 100%;\n}\n\n.nxs-metadata-editor__group[_ngcontent-%COMP%], \n.nxs-metadata-editor__item[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  min-width: 0;\n  margin: 0;\n  padding: 12px;\n  border: 1px solid var(--nxs-metadata-editor-divider);\n  border-radius: 4px;\n\n  > legend {\n    padding: 0 4px;\n    font-size: 0.8125rem;\n    color: var(--nxs-metadata-editor-label);\n  }\n}\n\n.nxs-metadata-editor__remove[_ngcontent-%COMP%], \n.nxs-metadata-editor__add[_ngcontent-%COMP%] {\n  align-self: flex-start;\n}\n\n//   Scoped   to   the   host:   the   theme's   `.mat-typography   p`   margin   outranks   a   single   class.\n[_nghost-%COMP%]   .nxs-metadata-editor__error[_ngcontent-%COMP%] {\n  margin: 0;\n  font-size: 0.75rem;\n  color: var(--nxs-metadata-editor-error);\n}\n\n.nxs-metadata-editor__read-only[_ngcontent-%COMP%] {\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n}\n\n.nxs-metadata-editor__read-only-label[_ngcontent-%COMP%] {\n  font-size: 0.75rem;\n  color: var(--nxs-metadata-editor-label);\n}\n\n.nxs-metadata-editor__trigger-chips[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 4px;\n}\n\n.nxs-metadata-editor__vocabulary[_ngcontent-%COMP%]   ::ng-deep[_ngcontent-%COMP%]   .mat-mdc-select-trigger[_ngcontent-%COMP%] {\n  height: auto;\n  min-height: 24px;\n}\n\n//[_ngcontent-%COMP%]   The[_ngcontent-%COMP%]   select[_ngcontent-%COMP%]   panel[_ngcontent-%COMP%]   renders[_ngcontent-%COMP%]   in[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   overlay[_ngcontent-%COMP%]   container,[_ngcontent-%COMP%]   outside[_ngcontent-%COMP%]   this[_ngcontent-%COMP%]   component's[_ngcontent-%COMP%]   view.\n[_ngcontent-%COMP%]  .mat-mdc-select-panel.nxs-vocabulary-panel {\n  display: flex;\n  flex-direction: column;\n  max-height: 320px;\n  overflow: hidden;\n  padding-top: 0;\n\n  .nxs-vocabulary-panel__search {\n    flex: 0 0 auto;\n    padding: 8px 12px;\n    border-bottom: 1px solid var(--mat-sys-outline-variant);\n  }\n\n  .nxs-vocabulary-panel__search input {\n    box-sizing: border-box;\n    width: 100%;\n    padding: 8px 12px;\n    border: 1px solid var(--mat-sys-outline);\n    border-radius: 4px;\n    font: inherit;\n    font-size: 0.875rem;\n    color: var(--mat-sys-on-surface);\n    background: var(--mat-sys-surface);\n  }\n\n  .nxs-vocabulary-panel__search input:focus {\n    outline: 2px solid var(--mat-sys-primary);\n    outline-offset: 1px;\n  }\n\n  .nxs-vocabulary-panel__list {\n    flex: 1 1 auto;\n    min-height: 0;\n    overflow-y: auto;\n  }\n}\n\n  .nxs-vocabulary-panel--grouped .mat-mdc-optgroup-label {\n  padding: 10px 16px 6px;\n  font-size: 0.8125rem;\n  font-weight: 700;\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsMetadataEditorComponent, [{
        type: Component,
        args: [{ selector: 'nxs-metadata-editor', standalone: true, imports: [
                    NgTemplateOutlet,
                    ReactiveFormsModule,
                    TranslatePipe,
                    MatButtonModule,
                    MatCheckboxModule,
                    MatChipsModule,
                    MatDatepickerModule,
                    MatFormFieldModule,
                    MatIconModule,
                    MatInputModule,
                    MatOptionModule,
                    MatSelectModule,
                    NxsTabsComponent,
                    NxsTabBodyDirective,
                    NxsDateMaskPipe,
                ], providers: [provideNxsDateAdapter()], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-metadata-editor' }, template: "@if (submitted() && invalidCount() > 0) {\n  <div class=\"nxs-metadata-editor__summary\" role=\"alert\" [id]=\"id + '-summary'\">\n    <mat-icon aria-hidden=\"true\">error_outline</mat-icon>\n    <span class=\"nxs-metadata-editor__summary-text\">\n      @if (invalidCount() === 1) {\n        {{ 'satori-components.metadata-editor.summary-one' | translate }}\n      } @else {\n        {{\n          'satori-components.metadata-editor.summary-other' | translate: { count: invalidCount() }\n        }}\n      }\n    </span>\n  </div>\n}\n\n@if (standardFields().length) {\n  <div class=\"nxs-metadata-editor__fields\">\n    @for (field of standardFields(); track field.xpath) {\n      @if (controlFor(field); as control) {\n        <ng-container\n          [ngTemplateOutlet]=\"fieldTemplate\"\n          [ngTemplateOutletContext]=\"{\n            $implicit: field,\n            control: control,\n            depth: 0,\n            path: field.xpath,\n          }\"\n        />\n      }\n    }\n  </div>\n}\n\n@if (display() === 'tabs' && typeSections().length) {\n  <nxs-tabs\n    class=\"nxs-metadata-editor__tabs\"\n    [tabs]=\"tabs()\"\n    [label]=\"tabsLabel() || ('satori-components.metadata-editor.sections' | translate)\"\n    [selectedIndex]=\"selectedTab()\"\n    (selectedIndexChange)=\"selectTab($event)\"\n  >\n    <ng-template nxsTabBody let-tab>\n      @for (section of typeSections(); track section.id) {\n        @if (section.id === tab.id) {\n          <div class=\"nxs-metadata-editor__fields\">\n            @for (field of section.fields; track field.xpath) {\n              @if (controlFor(field); as control) {\n                <ng-container\n                  [ngTemplateOutlet]=\"fieldTemplate\"\n                  [ngTemplateOutletContext]=\"{\n                    $implicit: field,\n                    control: control,\n                    depth: 0,\n                    path: field.xpath,\n                  }\"\n                />\n              }\n            }\n          </div>\n        }\n      }\n    </ng-template>\n  </nxs-tabs>\n} @else {\n  @for (section of typeSections(); track section.id) {\n    <section\n      class=\"nxs-metadata-editor__section\"\n      [attr.aria-labelledby]=\"section.heading ? id + '-' + section.id : null\"\n    >\n      @if (section.heading) {\n        <div\n          class=\"nxs-metadata-editor__heading\"\n          role=\"heading\"\n          [attr.aria-level]=\"headingLevel()\"\n          [id]=\"id + '-' + section.id\"\n        >\n          {{ section.heading }}\n        </div>\n      }\n      <div class=\"nxs-metadata-editor__fields\">\n        @for (field of section.fields; track field.xpath) {\n          @if (controlFor(field); as control) {\n            <ng-container\n              [ngTemplateOutlet]=\"fieldTemplate\"\n              [ngTemplateOutletContext]=\"{\n                $implicit: field,\n                control: control,\n                depth: 0,\n                path: field.xpath,\n              }\"\n            />\n          }\n        }\n      </div>\n    </section>\n  }\n}\n\n<ng-template #fieldTemplate let-field let-control=\"control\" let-depth=\"depth\" let-path=\"path\">\n  @let label = field.labelKey ? (field.labelKey | translate) : field.label;\n  @let definition = field.definition;\n  @let error = errorOf(control);\n  @switch (kindOf(definition, depth)) {\n    @case ('text') {\n      <mat-form-field\n        appearance=\"outline\"\n        subscriptSizing=\"dynamic\"\n        class=\"nxs-metadata-editor__field\"\n      >\n        <mat-label>{{ label }}</mat-label>\n        @if (field.multiline) {\n          <textarea\n            matInput\n            rows=\"2\"\n            [formControl]=\"asControl(control)\"\n            [required]=\"isRequired(definition)\"\n            [errorStateMatcher]=\"errorMatcher\"\n            [attr.data-nxs-invalid]=\"showError(control) ? 'true' : null\"\n            [attr.data-xpath]=\"path\"\n          ></textarea>\n        } @else {\n          <input\n            matInput\n            type=\"text\"\n            [formControl]=\"asControl(control)\"\n            [required]=\"isRequired(definition)\"\n            [errorStateMatcher]=\"errorMatcher\"\n            [attr.data-nxs-invalid]=\"showError(control) ? 'true' : null\"\n            [attr.data-xpath]=\"path\"\n          />\n        }\n        @if (error) {\n          <mat-error>{{ errorText(error, label) }}</mat-error>\n        }\n      </mat-form-field>\n    }\n    @case ('number') {\n      <mat-form-field\n        appearance=\"outline\"\n        subscriptSizing=\"dynamic\"\n        class=\"nxs-metadata-editor__field\"\n      >\n        <mat-label>{{ label }}</mat-label>\n        <input\n          matInput\n          type=\"number\"\n          [attr.step]=\"step(definition)\"\n          [formControl]=\"asControl(control)\"\n          [required]=\"isRequired(definition)\"\n          [errorStateMatcher]=\"errorMatcher\"\n          [attr.data-nxs-invalid]=\"showError(control) ? 'true' : null\"\n          [attr.data-xpath]=\"path\"\n        />\n        @if (error) {\n          <mat-error>{{ errorText(error, label) }}</mat-error>\n        }\n      </mat-form-field>\n    }\n    @case ('date') {\n      <mat-form-field\n        appearance=\"outline\"\n        subscriptSizing=\"dynamic\"\n        class=\"nxs-metadata-editor__field\"\n      >\n        <mat-label>{{ label }}</mat-label>\n        <input\n          matInput\n          [matDatepicker]=\"picker\"\n          [placeholder]=\"'common.date-mask' | translate | nxsDateMask\"\n          [formControl]=\"asControl(control)\"\n          [required]=\"isRequired(definition)\"\n          [errorStateMatcher]=\"errorMatcher\"\n          [attr.data-nxs-invalid]=\"showError(control) ? 'true' : null\"\n          [attr.data-xpath]=\"path\"\n        />\n        <mat-datepicker-toggle matIconSuffix [for]=\"picker\" />\n        <mat-datepicker #picker />\n        @if (error) {\n          <mat-error>{{ errorText(error, label) }}</mat-error>\n        }\n      </mat-form-field>\n    }\n    @case ('boolean') {\n      <mat-checkbox\n        class=\"nxs-metadata-editor__checkbox\"\n        [formControl]=\"asControl(control)\"\n        [attr.data-xpath]=\"path\"\n        >{{ label }}</mat-checkbox\n      >\n    }\n    @case ('vocabulary') {\n      <ng-container\n        [ngTemplateOutlet]=\"vocabularyTemplate\"\n        [ngTemplateOutletContext]=\"{ definition, control, label, error, path, multiple: false }\"\n      />\n    }\n    @case ('vocabulary-list') {\n      <ng-container\n        [ngTemplateOutlet]=\"vocabularyTemplate\"\n        [ngTemplateOutletContext]=\"{ definition, control, label, error, path, multiple: true }\"\n      />\n    }\n    @case ('list') {\n      <mat-form-field\n        appearance=\"outline\"\n        subscriptSizing=\"dynamic\"\n        class=\"nxs-metadata-editor__field\"\n      >\n        <mat-label>{{ label }}</mat-label>\n        <mat-chip-grid\n          #grid\n          [formControl]=\"asControl(control)\"\n          [required]=\"isRequired(definition)\"\n          [errorStateMatcher]=\"errorMatcher\"\n        >\n          @for (item of listValue(control); track $index) {\n            <mat-chip-row [value]=\"item\" (removed)=\"removeItem(control, $index)\">\n              {{ item }}\n              <button\n                type=\"button\"\n                matChipRemove\n                [attr.aria-label]=\"\n                  'satori-components.metadata-editor.remove-value' | translate: { name: item }\n                \"\n              >\n                <mat-icon aria-hidden=\"true\">cancel</mat-icon>\n              </button>\n            </mat-chip-row>\n          }\n          <input\n            [id]=\"id + '-' + path + '-input'\"\n            [type]=\"inputType(definition)\"\n            [matChipInputFor]=\"grid\"\n            [matChipInputAddOnBlur]=\"true\"\n            (matChipInputTokenEnd)=\"addItem(control, definition, $event)\"\n            [attr.data-xpath]=\"path\"\n            [attr.data-nxs-invalid]=\"showError(control) ? 'true' : null\"\n          />\n        </mat-chip-grid>\n        @if (error) {\n          <mat-error>{{ errorText(error, label) }}</mat-error>\n        }\n      </mat-form-field>\n    }\n    @case ('complex') {\n      @let groupInvalid = showError(control) && !!error;\n      <fieldset\n        class=\"nxs-metadata-editor__group\"\n        [attr.data-xpath]=\"path\"\n        [attr.aria-describedby]=\"groupInvalid ? id + '-' + path + '-error' : null\"\n      >\n        <legend>{{ label }}</legend>\n        @if (groupInvalid) {\n          <p\n            class=\"nxs-metadata-editor__error\"\n            tabindex=\"-1\"\n            data-nxs-invalid=\"true\"\n            [id]=\"id + '-' + path + '-error'\"\n          >\n            {{ errorText(error, label) }}\n          </p>\n        }\n        @for (sub of subFields(definition); track sub.xpath) {\n          @if (subControl(control, sub.xpath); as child) {\n            <ng-container\n              [ngTemplateOutlet]=\"fieldTemplate\"\n              [ngTemplateOutletContext]=\"{\n                $implicit: sub,\n                control: child,\n                depth: depth + 1,\n                path: path + '/' + sub.xpath,\n              }\"\n            />\n          }\n        }\n      </fieldset>\n    }\n    @case ('complex-list') {\n      <fieldset class=\"nxs-metadata-editor__group\" [attr.data-xpath]=\"path\">\n        <legend>{{ label }}</legend>\n        @for (item of asArray(control).controls; track item; let index = $index) {\n          <fieldset class=\"nxs-metadata-editor__item\">\n            <legend>\n              {{\n                'satori-components.metadata-editor.item' | translate: { label, index: index + 1 }\n              }}\n            </legend>\n            @for (sub of subFields(definition); track sub.xpath) {\n              @if (subControl(item, sub.xpath); as child) {\n                <ng-container\n                  [ngTemplateOutlet]=\"fieldTemplate\"\n                  [ngTemplateOutletContext]=\"{\n                    $implicit: sub,\n                    control: child,\n                    depth: depth + 1,\n                    path: path + '/' + index + '/' + sub.xpath,\n                  }\"\n                />\n              }\n            }\n            <button\n              mat-button\n              type=\"button\"\n              class=\"nxs-metadata-editor__remove\"\n              [disabled]=\"control.disabled\"\n              [attr.aria-label]=\"\n                'satori-components.metadata-editor.remove-item'\n                  | translate: { label, index: index + 1 }\n              \"\n              (click)=\"removeComplexItem(control, index)\"\n            >\n              <mat-icon aria-hidden=\"true\">delete_outline</mat-icon>\n              {{ 'satori-components.metadata-editor.remove' | translate }}\n            </button>\n          </fieldset>\n        }\n        @let listInvalid = showError(control);\n        <button\n          mat-stroked-button\n          type=\"button\"\n          class=\"nxs-metadata-editor__add\"\n          [disabled]=\"control.disabled\"\n          [attr.data-nxs-invalid]=\"listInvalid ? 'true' : null\"\n          [attr.aria-describedby]=\"listInvalid ? id + '-' + path + '-error' : null\"\n          (click)=\"addComplexItem(control, definition, depth)\"\n        >\n          <mat-icon aria-hidden=\"true\">add</mat-icon>\n          {{ 'satori-components.metadata-editor.add-item' | translate: { label } }}\n        </button>\n        @if (listInvalid && error) {\n          <p class=\"nxs-metadata-editor__error\" [id]=\"id + '-' + path + '-error'\">\n            {{ errorText(error, label) }}\n          </p>\n        }\n      </fieldset>\n    }\n    @default {\n      <div class=\"nxs-metadata-editor__read-only\" [attr.data-xpath]=\"path\">\n        <span class=\"nxs-metadata-editor__read-only-label\">{{ label }}</span>\n        <span class=\"nxs-metadata-editor__read-only-value\">\n          {{ readOnlyText(control) || ('satori-components.metadata-editor.no-value' | translate) }}\n        </span>\n      </div>\n    }\n  }\n</ng-template>\n\n<ng-template\n  #vocabularyTemplate\n  let-definition=\"definition\"\n  let-control=\"control\"\n  let-label=\"label\"\n  let-error=\"error\"\n  let-path=\"path\"\n  let-multiple=\"multiple\"\n>\n  <mat-form-field\n    appearance=\"outline\"\n    subscriptSizing=\"dynamic\"\n    class=\"nxs-metadata-editor__field nxs-metadata-editor__vocabulary\"\n  >\n    <mat-label>{{ label }}</mat-label>\n    <mat-select\n      [formControl]=\"asControl(control)\"\n      [multiple]=\"multiple\"\n      [required]=\"isRequired(definition)\"\n      [errorStateMatcher]=\"errorMatcher\"\n      [attr.data-nxs-invalid]=\"showError(control) ? 'true' : null\"\n      [panelClass]=\"\n        usesL10n(definition.directory)\n          ? 'nxs-vocabulary-panel nxs-vocabulary-panel--grouped'\n          : 'nxs-vocabulary-panel'\n      \"\n      [attr.data-xpath]=\"path\"\n      (openedChange)=\"panelToggled()\"\n    >\n      <mat-select-trigger>\n        <mat-chip-set class=\"nxs-metadata-editor__trigger-chips\">\n          @for (id of multiple ? listValue(control) : [control.value]; track $index) {\n            @if (id) {\n              <mat-chip\n                (removed)=\"multiple ? removeItem(control, $index) : clearValue(control, false)\"\n              >\n                {{ vocabularyLabel(definition.directory, id) }}\n                <button\n                  type=\"button\"\n                  matChipRemove\n                  [disabled]=\"control.disabled\"\n                  [attr.aria-label]=\"\n                    'satori-components.metadata-editor.remove-value'\n                      | translate: { name: vocabularyLabel(definition.directory, id) }\n                  \"\n                  (click)=\"$event.stopPropagation()\"\n                >\n                  <mat-icon aria-hidden=\"true\">cancel</mat-icon>\n                </button>\n              </mat-chip>\n            }\n          }\n        </mat-chip-set>\n      </mat-select-trigger>\n      <div class=\"nxs-vocabulary-panel__search\">\n        <input\n          type=\"text\"\n          [value]=\"panelSearch()\"\n          [placeholder]=\"'satori-components.metadata-editor.search' | translate\"\n          [attr.aria-label]=\"'satori-components.metadata-editor.search-in' | translate: { label }\"\n          (input)=\"search($event)\"\n          (click)=\"$event.stopPropagation()\"\n          (keydown)=\"$event.stopPropagation()\"\n        />\n      </div>\n      <div class=\"nxs-vocabulary-panel__list\">\n        @if (usesL10n(definition.directory)) {\n          @for (group of groupedOptions(definition.directory); track group.parentLabel) {\n            <mat-optgroup [label]=\"group.parentLabel\">\n              @for (entry of group.entries; track entry.id) {\n                <mat-option [value]=\"entry.id\">{{ l10nEntryLabel(entry) }}</mat-option>\n              }\n            </mat-optgroup>\n          }\n        } @else {\n          @for (entry of flatOptions(definition.directory); track entry.id) {\n            <mat-option [value]=\"entry.id\">{{ directoryPickerLabel(entry) }}</mat-option>\n          }\n        }\n      </div>\n    </mat-select>\n    @if (error) {\n      <mat-error>{{ errorText(error, label) }}</mat-error>\n    }\n  </mat-form-field>\n</ng-template>\n", styles: [":host {\n  --nxs-metadata-editor-heading: var(--mat-sys-on-surface);\n  --nxs-metadata-editor-label: var(--mat-sys-on-surface-variant);\n  --nxs-metadata-editor-divider: var(--mat-sys-outline-variant);\n  --nxs-metadata-editor-error: var(--mat-sys-error);\n  --nxs-metadata-editor-error-surface: var(--mat-sys-error-container);\n  --nxs-metadata-editor-on-error-surface: var(--mat-sys-on-error-container);\n  display: flex;\n  flex-direction: column;\n  gap: 20px;\n}\n\n.nxs-metadata-editor__summary {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  padding: 10px 12px;\n  border-radius: 4px;\n  background: var(--nxs-metadata-editor-error-surface);\n  color: var(--nxs-metadata-editor-on-error-surface);\n  font-size: 0.875rem;\n}\n\n.nxs-metadata-editor__fields {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n}\n\n.nxs-metadata-editor__tabs .nxs-metadata-editor__fields {\n  padding-top: 16px;\n}\n\n.nxs-metadata-editor__section {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  padding-top: 16px;\n  border-top: 1px solid var(--nxs-metadata-editor-divider);\n}\n\n.nxs-metadata-editor__heading {\n  margin: 0;\n  font-size: 0.9375rem;\n  font-weight: 600;\n  color: var(--nxs-metadata-editor-heading);\n}\n\n.nxs-metadata-editor__field {\n  width: 100%;\n}\n\n.nxs-metadata-editor__group,\n.nxs-metadata-editor__item {\n  display: flex;\n  flex-direction: column;\n  gap: 12px;\n  min-width: 0;\n  margin: 0;\n  padding: 12px;\n  border: 1px solid var(--nxs-metadata-editor-divider);\n  border-radius: 4px;\n\n  > legend {\n    padding: 0 4px;\n    font-size: 0.8125rem;\n    color: var(--nxs-metadata-editor-label);\n  }\n}\n\n.nxs-metadata-editor__remove,\n.nxs-metadata-editor__add {\n  align-self: flex-start;\n}\n\n// Scoped to the host: the theme's `.mat-typography p` margin outranks a single class.\n:host .nxs-metadata-editor__error {\n  margin: 0;\n  font-size: 0.75rem;\n  color: var(--nxs-metadata-editor-error);\n}\n\n.nxs-metadata-editor__read-only {\n  display: flex;\n  flex-direction: column;\n  gap: 2px;\n}\n\n.nxs-metadata-editor__read-only-label {\n  font-size: 0.75rem;\n  color: var(--nxs-metadata-editor-label);\n}\n\n.nxs-metadata-editor__trigger-chips {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 4px;\n}\n\n.nxs-metadata-editor__vocabulary ::ng-deep .mat-mdc-select-trigger {\n  height: auto;\n  min-height: 24px;\n}\n\n// The select panel renders in the overlay container, outside this component's view.\n::ng-deep .mat-mdc-select-panel.nxs-vocabulary-panel {\n  display: flex;\n  flex-direction: column;\n  max-height: 320px;\n  overflow: hidden;\n  padding-top: 0;\n\n  .nxs-vocabulary-panel__search {\n    flex: 0 0 auto;\n    padding: 8px 12px;\n    border-bottom: 1px solid var(--mat-sys-outline-variant);\n  }\n\n  .nxs-vocabulary-panel__search input {\n    box-sizing: border-box;\n    width: 100%;\n    padding: 8px 12px;\n    border: 1px solid var(--mat-sys-outline);\n    border-radius: 4px;\n    font: inherit;\n    font-size: 0.875rem;\n    color: var(--mat-sys-on-surface);\n    background: var(--mat-sys-surface);\n  }\n\n  .nxs-vocabulary-panel__search input:focus {\n    outline: 2px solid var(--mat-sys-primary);\n    outline-offset: 1px;\n  }\n\n  .nxs-vocabulary-panel__list {\n    flex: 1 1 auto;\n    min-height: 0;\n    overflow-y: auto;\n  }\n}\n\n::ng-deep .nxs-vocabulary-panel--grouped .mat-mdc-optgroup-label {\n  padding: 10px 16px 6px;\n  font-size: 0.8125rem;\n  font-weight: 700;\n}\n"] }]
    }], () => [], { sections: [{ type: i0.Input, args: [{ isSignal: true, alias: "sections", required: false }] }], display: [{ type: i0.Input, args: [{ isSignal: true, alias: "display", required: false }] }], values: [{ type: i0.Input, args: [{ isSignal: true, alias: "values", required: false }] }], dublinCore: [{ type: i0.Input, args: [{ isSignal: true, alias: "dublinCore", required: false }] }], disabled: [{ type: i0.Input, args: [{ isSignal: true, alias: "disabled", required: false }] }], headingLevel: [{ type: i0.Input, args: [{ isSignal: true, alias: "headingLevel", required: false }] }], tabsLabel: [{ type: i0.Input, args: [{ isSignal: true, alias: "tabsLabel", required: false }] }], validChange: [{ type: i0.Output, args: ["validChange"] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsMetadataEditorComponent, { className: "NxsMetadataEditorComponent", filePath: "libs/shared/satori-components/src/lib/metadata-editor/metadata-editor.component.ts", lineNumber: 196 }); })();
//# sourceMappingURL=metadata-editor.component.js.map