import { ChangeDetectionStrategy, Component, computed, DestroyRef, ViewEncapsulation, afterNextRender, effect, inject, input, output, signal, viewChild, Injector, } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DomSanitizer } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { catchError, of, switchMap } from 'rxjs';
import { DocumentDetailService, DocumentImportService, formatNoteHtmlForSourceView, hasInsertablePictureBlob, inferBlobDocTypeFromFile, isHtmlNoteFormat, isMarkdownNoteFormat, renderNoteMarkdown, renderTrustedHtml, sanitizeDocumentName, titleFromFileName, } from '@nuxeo/satori-platform/nuxeo-client';
import DOMPurify from 'dompurify';
import Quill from 'quill';
import { applyHeaderFormatSelectionOnly } from './note-quill-header';
import { NoteImagePickerDialogComponent } from './note-image-picker-dialog';
import { buildNoteImagesInsertHtml } from './note-image-insert';
import { notePictureInsertUrl } from './note-image-url';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NxsSpinnerComponent, NxsToastService, provideNxsToast, } from '@nuxeo/satori-platform/components';
import * as i0 from "@angular/core";
import * as i1 from "@angular/forms";
import * as i2 from "@angular/material/button";
import * as i3 from "@angular/material/icon";
import * as i4 from "@angular/material/progress-spinner";
import * as i5 from "@angular/material/tooltip";
const _c0 = ["quillToolbar"];
const _c1 = ["quillEditor"];
const _c2 = ["imageUploadInput"];
const _c3 = ["plainTextEditor"];
function NoteEditorComponent_Conditional_1_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 5);
    i0.ɵɵelement(1, "nxs-spinner", 7);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", i0.ɵɵpipeBind1(2, 1, "document-detail.note-editor.loading"));
} }
function NoteEditorComponent_Conditional_1_Conditional_1_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "div", 8);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("innerHTML", ctx_r0.markdownHtml(), i0.ɵɵsanitizeHtml);
} }
function NoteEditorComponent_Conditional_1_Conditional_1_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 9)(1, "div", 11);
    i0.ɵɵelement(2, "div", 12);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("innerHTML", ctx_r0.htmlReadonlyView(), i0.ɵɵsanitizeHtml);
} }
function NoteEditorComponent_Conditional_1_Conditional_1_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "pre", 10);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.content());
} }
function NoteEditorComponent_Conditional_1_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 6);
    i0.ɵɵconditionalCreate(1, NoteEditorComponent_Conditional_1_Conditional_1_Conditional_1_Template, 1, 1, "div", 8)(2, NoteEditorComponent_Conditional_1_Conditional_1_Conditional_2_Template, 3, 1, "div", 9)(3, NoteEditorComponent_Conditional_1_Conditional_1_Conditional_3_Template, 2, 1, "pre", 10);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.isMarkdown() ? 1 : ctx_r0.isHtml() ? 2 : 3);
} }
function NoteEditorComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, NoteEditorComponent_Conditional_1_Conditional_0_Template, 3, 3, "div", 5)(1, NoteEditorComponent_Conditional_1_Conditional_1_Template, 4, 1, "div", 6);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵconditional(ctx_r0.loading() ? 0 : 1);
} }
function NoteEditorComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 5);
    i0.ɵɵelement(1, "nxs-spinner", 7);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", i0.ɵɵpipeBind1(2, 1, "document-detail.note-editor.loading"));
} }
function NoteEditorComponent_Conditional_3_Conditional_1_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 17);
    i0.ɵɵelement(1, "nxs-spinner", 60);
    i0.ɵɵelementStart(2, "span");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 1, "document-detail.note-editor.uploading-image"));
} }
function NoteEditorComponent_Conditional_3_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r2 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 9);
    i0.ɵɵconditionalCreate(1, NoteEditorComponent_Conditional_3_Conditional_1_Conditional_1_Template, 5, 3, "div", 17);
    i0.ɵɵelementStart(2, "button", 18);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵlistener("click", function NoteEditorComponent_Conditional_3_Conditional_1_Template_button_click_2_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.focusForEdit()); });
    i0.ɵɵelementStart(5, "mat-icon");
    i0.ɵɵtext(6, "edit");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "div", 19, 0);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵlistener("mousedown", function NoteEditorComponent_Conditional_3_Conditional_1_Template_div_mousedown_7_listener($event) { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.onToolbarMouseDown($event)); });
    i0.ɵɵelementStart(10, "span", 20)(11, "select", 21);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵpipe(13, "translate");
    i0.ɵɵelement(14, "option", 22)(15, "option", 23)(16, "option", 24)(17, "option", 25)(18, "option", 26)(19, "option", 27)(20, "option", 28);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(21, "span", 20);
    i0.ɵɵelement(22, "button", 29);
    i0.ɵɵpipe(23, "translate");
    i0.ɵɵpipe(24, "translate");
    i0.ɵɵelement(25, "button", 30);
    i0.ɵɵpipe(26, "translate");
    i0.ɵɵpipe(27, "translate");
    i0.ɵɵelement(28, "button", 31);
    i0.ɵɵpipe(29, "translate");
    i0.ɵɵpipe(30, "translate");
    i0.ɵɵelement(31, "button", 32);
    i0.ɵɵpipe(32, "translate");
    i0.ɵɵpipe(33, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(34, "span", 20);
    i0.ɵɵelement(35, "button", 33);
    i0.ɵɵpipe(36, "translate");
    i0.ɵɵpipe(37, "translate");
    i0.ɵɵelement(38, "button", 34);
    i0.ɵɵpipe(39, "translate");
    i0.ɵɵpipe(40, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(41, "span", 20);
    i0.ɵɵelement(42, "button", 35);
    i0.ɵɵpipe(43, "translate");
    i0.ɵɵpipe(44, "translate");
    i0.ɵɵelement(45, "button", 36);
    i0.ɵɵpipe(46, "translate");
    i0.ɵɵpipe(47, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(48, "span", 20);
    i0.ɵɵelement(49, "button", 37);
    i0.ɵɵpipe(50, "translate");
    i0.ɵɵpipe(51, "translate");
    i0.ɵɵelement(52, "button", 38);
    i0.ɵɵpipe(53, "translate");
    i0.ɵɵpipe(54, "translate");
    i0.ɵɵelement(55, "button", 39);
    i0.ɵɵpipe(56, "translate");
    i0.ɵɵpipe(57, "translate");
    i0.ɵɵelement(58, "button", 40);
    i0.ɵɵpipe(59, "translate");
    i0.ɵɵpipe(60, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(61, "span", 20);
    i0.ɵɵelement(62, "select", 41);
    i0.ɵɵpipe(63, "translate");
    i0.ɵɵpipe(64, "translate");
    i0.ɵɵelement(65, "select", 42);
    i0.ɵɵpipe(66, "translate");
    i0.ɵɵpipe(67, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(68, "span", 20);
    i0.ɵɵelement(69, "button", 43);
    i0.ɵɵpipe(70, "translate");
    i0.ɵɵpipe(71, "translate");
    i0.ɵɵelement(72, "button", 44);
    i0.ɵɵpipe(73, "translate");
    i0.ɵɵpipe(74, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(75, "span", 20);
    i0.ɵɵelement(76, "button", 45);
    i0.ɵɵpipe(77, "translate");
    i0.ɵɵpipe(78, "translate");
    i0.ɵɵelement(79, "button", 46);
    i0.ɵɵpipe(80, "translate");
    i0.ɵɵpipe(81, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(82, "span", 20);
    i0.ɵɵelement(83, "button", 47);
    i0.ɵɵpipe(84, "translate");
    i0.ɵɵpipe(85, "translate");
    i0.ɵɵelement(86, "button", 48);
    i0.ɵɵpipe(87, "translate");
    i0.ɵɵpipe(88, "translate");
    i0.ɵɵelementStart(89, "button", 49);
    i0.ɵɵpipe(90, "translate");
    i0.ɵɵpipe(91, "translate");
    i0.ɵɵlistener("mousedown", function NoteEditorComponent_Conditional_3_Conditional_1_Template_button_mousedown_89_listener($event) { i0.ɵɵrestoreView(_r2); return i0.ɵɵresetView($event.preventDefault()); })("click", function NoteEditorComponent_Conditional_3_Conditional_1_Template_button_click_89_listener() { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.insertImagesFromExistingDocuments()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(92, "svg", 50);
    i0.ɵɵelement(93, "rect", 51)(94, "circle", 52)(95, "polyline", 53)(96, "circle", 54)(97, "line", 55);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelement(98, "button", 56);
    i0.ɵɵpipe(99, "translate");
    i0.ɵɵpipe(100, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(101, "input", 57, 1);
    i0.ɵɵlistener("change", function NoteEditorComponent_Conditional_3_Conditional_1_Template_input_change_101_listener($event) { i0.ɵɵrestoreView(_r2); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.onImageFileSelected($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(103, "span", 20);
    i0.ɵɵelement(104, "button", 58);
    i0.ɵɵpipe(105, "translate");
    i0.ɵɵpipe(106, "translate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelement(107, "div", 59, 2);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.imageUploading() ? 1 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(3, 52, "document-detail.note-editor.edit-note"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(4, 54, "document-detail.note-editor.edit-note"));
    i0.ɵɵadvance(5);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(9, 56, "document-detail.note-editor.note-formatting"));
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("title", i0.ɵɵpipeBind1(12, 58, "document-detail.note-editor.text-style"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(13, 60, "document-detail.note-editor.text-style"));
    i0.ɵɵadvance(11);
    i0.ɵɵproperty("title", i0.ɵɵpipeBind1(23, 62, "document-detail.note-editor.bold"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(24, 64, "document-detail.note-editor.bold"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("title", i0.ɵɵpipeBind1(26, 66, "document-detail.note-editor.italic"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(27, 68, "document-detail.note-editor.italic"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("title", i0.ɵɵpipeBind1(29, 70, "document-detail.note-editor.underline"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(30, 72, "document-detail.note-editor.underline"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("title", i0.ɵɵpipeBind1(32, 74, "document-detail.note-editor.strikethrough"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(33, 76, "document-detail.note-editor.strikethrough"));
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("title", i0.ɵɵpipeBind1(36, 78, "document-detail.note-editor.blockquote"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(37, 80, "document-detail.note-editor.blockquote"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("title", i0.ɵɵpipeBind1(39, 82, "document-detail.note-editor.code-block"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(40, 84, "document-detail.note-editor.code-block"));
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("title", i0.ɵɵpipeBind1(43, 86, "document-detail.note-editor.bulleted-list"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(44, 88, "document-detail.note-editor.bulleted-list"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("title", i0.ɵɵpipeBind1(46, 90, "document-detail.note-editor.numbered-list"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(47, 92, "document-detail.note-editor.numbered-list"));
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("title", i0.ɵɵpipeBind1(50, 94, "document-detail.note-editor.align-left"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(51, 96, "document-detail.note-editor.align-left"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("title", i0.ɵɵpipeBind1(53, 98, "document-detail.note-editor.align-center"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(54, 100, "document-detail.note-editor.align-center"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("title", i0.ɵɵpipeBind1(56, 102, "document-detail.note-editor.align-right"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(57, 104, "document-detail.note-editor.align-right"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("title", i0.ɵɵpipeBind1(59, 106, "document-detail.note-editor.justify"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(60, 108, "document-detail.note-editor.justify"));
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("title", i0.ɵɵpipeBind1(63, 110, "document-detail.note-editor.text-color"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(64, 112, "document-detail.note-editor.text-color"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("title", i0.ɵɵpipeBind1(66, 114, "document-detail.note-editor.highlight-color"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(67, 116, "document-detail.note-editor.highlight-color"));
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("title", i0.ɵɵpipeBind1(70, 118, "document-detail.note-editor.subscript"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(71, 120, "document-detail.note-editor.subscript"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("title", i0.ɵɵpipeBind1(73, 122, "document-detail.note-editor.superscript"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(74, 124, "document-detail.note-editor.superscript"));
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("title", i0.ɵɵpipeBind1(77, 126, "document-detail.note-editor.decrease-indent"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(78, 128, "document-detail.note-editor.decrease-indent"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("title", i0.ɵɵpipeBind1(80, 130, "document-detail.note-editor.increase-indent"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(81, 132, "document-detail.note-editor.increase-indent"));
    i0.ɵɵadvance(4);
    i0.ɵɵproperty("title", i0.ɵɵpipeBind1(84, 134, "document-detail.note-editor.insert-link"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(85, 136, "document-detail.note-editor.insert-link"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("title", i0.ɵɵpipeBind1(87, 138, "document-detail.note-editor.insert-image"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(88, 140, "document-detail.note-editor.insert-image"));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("title", i0.ɵɵpipeBind1(90, 142, "document-detail.note-editor.insert-image-from-existing-documents"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(91, 144, "document-detail.note-editor.insert-image-from-existing-documents"));
    i0.ɵɵadvance(9);
    i0.ɵɵproperty("title", i0.ɵɵpipeBind1(99, 146, "document-detail.note-editor.insert-video"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(100, 148, "document-detail.note-editor.insert-video"));
    i0.ɵɵadvance(6);
    i0.ɵɵproperty("title", i0.ɵɵpipeBind1(105, 150, "document-detail.note-editor.clear-formatting"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(106, 152, "document-detail.note-editor.clear-formatting"));
} }
function NoteEditorComponent_Conditional_3_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "textarea", 61);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵlistener("ngModelChange", function NoteEditorComponent_Conditional_3_Conditional_2_Template_textarea_ngModelChange_0_listener($event) { i0.ɵɵrestoreView(_r3); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.editText.set($event)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵproperty("ngModel", ctx_r0.editText());
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 2, "document-detail.note-editor.note-html-source"));
} }
function NoteEditorComponent_Conditional_3_Conditional_3_Conditional_1_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "div", 8);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(4);
    i0.ɵɵproperty("innerHTML", ctx_r0.markdownHtml(), i0.ɵɵsanitizeHtml);
} }
function NoteEditorComponent_Conditional_3_Conditional_3_Conditional_1_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "pre", 10);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.content());
} }
function NoteEditorComponent_Conditional_3_Conditional_3_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 62)(1, "button", 63);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵlistener("click", function NoteEditorComponent_Conditional_3_Conditional_3_Conditional_1_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r4); const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.enterPlainTextEdit()); });
    i0.ɵɵelementStart(4, "mat-icon");
    i0.ɵɵtext(5, "edit");
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(6, NoteEditorComponent_Conditional_3_Conditional_3_Conditional_1_Conditional_6_Template, 1, 1, "div", 8)(7, NoteEditorComponent_Conditional_3_Conditional_3_Conditional_1_Conditional_7_Template, 2, 1, "pre", 10);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("matTooltip", i0.ɵɵpipeBind1(2, 3, "document-detail.note-editor.edit"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(3, 5, "document-detail.note-editor.edit-note"));
    i0.ɵɵadvance(5);
    i0.ɵɵconditional(ctx_r0.isMarkdown() ? 6 : 7);
} }
function NoteEditorComponent_Conditional_3_Conditional_3_Conditional_2_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "mat-spinner", 68);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 1, "document-detail.note-editor.loading"));
} }
function NoteEditorComponent_Conditional_3_Conditional_3_Conditional_2_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "document-detail.note-editor.save"), " ");
} }
function NoteEditorComponent_Conditional_3_Conditional_3_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    const _r5 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "textarea", 64, 3);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵlistener("ngModelChange", function NoteEditorComponent_Conditional_3_Conditional_3_Conditional_2_Template_textarea_ngModelChange_0_listener($event) { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.editText.set($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 65)(4, "button", 66);
    i0.ɵɵlistener("click", function NoteEditorComponent_Conditional_3_Conditional_3_Conditional_2_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.cancelPlainTextEdit()); });
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "button", 67);
    i0.ɵɵlistener("click", function NoteEditorComponent_Conditional_3_Conditional_3_Conditional_2_Template_button_click_7_listener() { i0.ɵɵrestoreView(_r5); const ctx_r0 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r0.onSave()); });
    i0.ɵɵconditionalCreate(8, NoteEditorComponent_Conditional_3_Conditional_3_Conditional_2_Conditional_8_Template, 2, 3, "mat-spinner", 68)(9, NoteEditorComponent_Conditional_3_Conditional_3_Conditional_2_Conditional_9_Template, 2, 3);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(3);
    i0.ɵɵclassProp("note-markdown-editor", ctx_r0.isMarkdown());
    i0.ɵɵproperty("ngModel", ctx_r0.editText());
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 7, "document-detail.note-editor.note-content"));
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(6, 9, "document-detail.note-editor.cancel"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("disabled", ctx_r0.saving());
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.saving() ? 8 : 9);
} }
function NoteEditorComponent_Conditional_3_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 15);
    i0.ɵɵconditionalCreate(1, NoteEditorComponent_Conditional_3_Conditional_3_Conditional_1_Template, 8, 7, "div", 62)(2, NoteEditorComponent_Conditional_3_Conditional_3_Conditional_2_Template, 10, 11);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵconditional(!ctx_r0.plainTextEditMode() ? 1 : 2);
} }
function NoteEditorComponent_Conditional_3_Conditional_4_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "mat-spinner", 68);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(1, 1, "document-detail.note-editor.loading"));
} }
function NoteEditorComponent_Conditional_3_Conditional_4_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(1, 1, "document-detail.note-editor.save"), " ");
} }
function NoteEditorComponent_Conditional_3_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 16)(1, "button", 69);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵlistener("click", function NoteEditorComponent_Conditional_3_Conditional_4_Template_button_click_1_listener() { i0.ɵɵrestoreView(_r6); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.toggleSourceMode()); });
    i0.ɵɵelementStart(6, "mat-icon");
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "button", 67);
    i0.ɵɵlistener("click", function NoteEditorComponent_Conditional_3_Conditional_4_Template_button_click_8_listener() { i0.ɵɵrestoreView(_r6); const ctx_r0 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r0.onSave()); });
    i0.ɵɵconditionalCreate(9, NoteEditorComponent_Conditional_3_Conditional_4_Conditional_9_Template, 2, 3, "mat-spinner", 68)(10, NoteEditorComponent_Conditional_3_Conditional_4_Conditional_10_Template, 2, 3);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵclassProp("source-toggle--active", ctx_r0.sourceMode());
    i0.ɵɵproperty("matTooltip", ctx_r0.sourceMode() ? i0.ɵɵpipeBind1(2, 7, "document-detail.visual-editor") : i0.ɵɵpipeBind1(3, 9, "document-detail.html-source"));
    i0.ɵɵattribute("aria-label", ctx_r0.sourceMode() ? i0.ɵɵpipeBind1(4, 11, "document-detail.visual-editor") : i0.ɵɵpipeBind1(5, 13, "document-detail.html-source"));
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate(ctx_r0.sourceMode() ? "edit" : "code");
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r0.saving());
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.saving() ? 9 : 10);
} }
function NoteEditorComponent_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 13);
    i0.ɵɵconditionalCreate(1, NoteEditorComponent_Conditional_3_Conditional_1_Template, 109, 154, "div", 9)(2, NoteEditorComponent_Conditional_3_Conditional_2_Template, 2, 4, "textarea", 14)(3, NoteEditorComponent_Conditional_3_Conditional_3_Template, 3, 1, "div", 15);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(4, NoteEditorComponent_Conditional_3_Conditional_4_Template, 11, 15, "div", 16);
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r0.isHtml() && !ctx_r0.sourceMode() ? 1 : ctx_r0.isHtml() && ctx_r0.sourceMode() ? 2 : 3);
    i0.ɵɵadvance(3);
    i0.ɵɵconditional(ctx_r0.isHtml() ? 4 : -1);
} }
export class NoteEditorComponent {
    translate = inject(TranslateService);
    destroyRef = inject(DestroyRef);
    injector = inject(Injector);
    sanitizer = inject(DomSanitizer);
    dialog = inject(MatDialog);
    toast = inject(NxsToastService);
    documentImportService = inject(DocumentImportService);
    documentDetailService = inject(DocumentDetailService);
    content = input.required(...(ngDevMode ? [{ debugName: "content" }] : []));
    mimeType = input.required(...(ngDevMode ? [{ debugName: "mimeType" }] : []));
    /** Parent folder path for RTE image uploads (Web UI stores uploaded pictures in the repository). */
    uploadParentPath = input(null, ...(ngDevMode ? [{ debugName: "uploadParentPath" }] : []));
    saving = input(false, ...(ngDevMode ? [{ debugName: "saving" }] : []));
    loading = input(false, ...(ngDevMode ? [{ debugName: "loading" }] : []));
    autoFocus = input(false, ...(ngDevMode ? [{ debugName: "autoFocus" }] : []));
    readOnly = input(false, ...(ngDevMode ? [{ debugName: "readOnly" }] : []));
    saveNote = output();
    focused = output();
    sourceMode = signal(false, ...(ngDevMode ? [{ debugName: "sourceMode" }] : []));
    plainTextEditMode = signal(false, ...(ngDevMode ? [{ debugName: "plainTextEditMode" }] : []));
    editText = signal('', ...(ngDevMode ? [{ debugName: "editText" }] : []));
    imageUploading = signal(false, ...(ngDevMode ? [{ debugName: "imageUploading" }] : []));
    quillToolbarRef = viewChild('quillToolbar', ...(ngDevMode ? [{ debugName: "quillToolbarRef" }] : []));
    quillEditorRef = viewChild('quillEditor', ...(ngDevMode ? [{ debugName: "quillEditorRef" }] : []));
    imageUploadInputRef = viewChild('imageUploadInput', ...(ngDevMode ? [{ debugName: "imageUploadInputRef" }] : []));
    plainTextEditorRef = viewChild('plainTextEditor', ...(ngDevMode ? [{ debugName: "plainTextEditorRef" }] : []));
    quill = null;
    /** Last `content()` value pushed into the Quill visual editor. */
    lastParentContent = null;
    syncedPlainContent = null;
    lastEmittedSave = null;
    savedRange = null;
    /** True when the Quill visual editor has unsaved edits vs persisted `content()`. */
    visualDirty = false;
    isHtml = () => isHtmlNoteFormat(this.mimeType());
    isMarkdown = () => isMarkdownNoteFormat(this.mimeType());
    markdownHtml = computed(() => {
        if (!this.isMarkdown())
            return null;
        const raw = renderNoteMarkdown(this.content() ?? '');
        return renderTrustedHtml(this.sanitizer, raw, { ADD_ATTR: ['target', 'rel'] });
    }, ...(ngDevMode ? [{ debugName: "markdownHtml" }] : []));
    htmlReadonlyView = computed(() => {
        if (!this.isHtml())
            return null;
        return renderTrustedHtml(this.sanitizer, this.content() ?? '', {
            ADD_ATTR: ['target', 'rel'],
        });
    }, ...(ngDevMode ? [{ debugName: "htmlReadonlyView" }] : []));
    constructor() {
        afterNextRender(() => this.tryInitQuill());
        effect(() => {
            const text = this.content();
            const mime = this.mimeType();
            const source = this.sourceMode();
            const saving = this.saving();
            if (isHtmlNoteFormat(mime)) {
                if (source)
                    return;
                if (text === this.lastParentContent)
                    return;
                this.lastParentContent = text;
                this.visualDirty = false;
                queueMicrotask(() => {
                    if (!this.quill) {
                        this.tryInitQuill(text);
                    }
                    else {
                        this.applyExternalContent(text);
                    }
                });
                return;
            }
            if (text !== this.syncedPlainContent) {
                this.syncedPlainContent = text;
                if (this.plainTextEditMode() &&
                    this.lastEmittedSave !== null &&
                    text === this.lastEmittedSave &&
                    !saving) {
                    this.plainTextEditMode.set(false);
                    this.lastEmittedSave = null;
                    this.editText.set(text);
                }
                else if (!this.plainTextEditMode()) {
                    this.editText.set(text);
                }
                else if (this.lastEmittedSave === null) {
                    this.plainTextEditMode.set(false);
                    this.editText.set(text);
                }
            }
        });
        effect(() => {
            if (this.readOnly() || !this.autoFocus() || this.loading())
                return;
            if (this.isHtml()) {
                if (this.sourceMode())
                    return;
                queueMicrotask(() => {
                    this.quill?.focus();
                    this.focused.emit();
                });
                return;
            }
            queueMicrotask(() => {
                this.enterPlainTextEdit();
                this.focused.emit();
            });
        });
        this.destroyRef.onDestroy(() => {
            this.destroyQuill();
        });
    }
    onToolbarMouseDown(event) {
        if (!this.quill)
            return;
        const target = event.target;
        if (!(target instanceof HTMLElement) || !target.closest('.note-quill-toolbar'))
            return;
        event.preventDefault();
        const range = this.quill.getSelection();
        if (range) {
            this.savedRange = { index: range.index, length: range.length };
        }
    }
    onImageFileSelected(event) {
        const input = event.target;
        if (!(input instanceof HTMLInputElement))
            return;
        const file = input.files?.[0];
        input.value = '';
        if (!file || !this.quill)
            return;
        if (!file.type.startsWith('image/'))
            return;
        this.uploadAndInsertImage(file);
    }
    insertImagesFromExistingDocuments() {
        if (!this.quill || this.readOnly())
            return;
        this.dialog
            .open(NoteImagePickerDialogComponent, {
            width: '900px',
            maxWidth: '95vw',
            maxHeight: '90vh',
            autoFocus: 'dialog',
            panelClass: 'note-image-picker-panel',
        })
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((docs) => {
            if (!docs?.length || !this.quill)
                return;
            const urls = docs
                .filter((doc) => hasInsertablePictureBlob(doc))
                .map((doc) => notePictureInsertUrl(doc))
                .filter((url) => !!url);
            if (!urls.length) {
                this.toast.error(this.translate.instant('document-detail.message.selected-documents-have-no-insertable-image-url'));
                return;
            }
            queueMicrotask(() => this.insertImagesAtSelection(urls));
        });
    }
    toggleSourceMode() {
        if (!this.isHtml() || this.readOnly())
            return;
        if (this.sourceMode()) {
            const html = this.editText();
            this.sourceMode.set(false);
            this.visualDirty = false;
            afterNextRender(() => {
                this.destroyQuill();
                this.tryInitQuill(html);
                this.editText.set(html);
            }, { injector: this.injector });
            return;
        }
        const html = this.visualDirty && this.quill ? this.readQuillHtml() : (this.content() ?? '');
        this.editText.set(formatNoteHtmlForSourceView(html));
        if (this.quill) {
            this.destroyQuill();
        }
        this.sourceMode.set(true);
    }
    /** Focus inline note editing — triggered by the note-surface pencil (Web UI parity). */
    focusForEdit() {
        if (this.readOnly() || this.loading())
            return;
        if (this.isHtml()) {
            if (this.sourceMode()) {
                const html = this.editText();
                this.sourceMode.set(false);
                this.visualDirty = false;
                afterNextRender(() => {
                    this.destroyQuill();
                    this.tryInitQuill(html);
                    this.editText.set(html);
                    queueMicrotask(() => {
                        this.quill?.focus();
                        this.focused.emit();
                    });
                }, { injector: this.injector });
                return;
            }
            queueMicrotask(() => {
                if (!this.quill) {
                    this.tryInitQuill();
                }
                this.quill?.focus();
                this.focused.emit();
            });
            return;
        }
        this.enterPlainTextEdit();
        this.focused.emit();
    }
    onSave() {
        if (this.readOnly() || this.saving() || this.loading())
            return;
        const body = this.isHtml()
            ? this.sourceMode()
                ? this.editText()
                : this.readQuillHtml()
            : this.editText();
        if (!this.isHtml()) {
            this.lastEmittedSave = body;
        }
        this.saveNote.emit(body);
    }
    enterPlainTextEdit() {
        if (this.readOnly())
            return;
        this.editText.set(this.content());
        this.plainTextEditMode.set(true);
        queueMicrotask(() => this.plainTextEditorRef()?.nativeElement?.focus());
    }
    cancelPlainTextEdit() {
        this.editText.set(this.content());
        this.plainTextEditMode.set(false);
        this.lastEmittedSave = null;
    }
    bindVideoTooltipOnce(toolbar) {
        if (toolbar.dataset['noteVideoTooltipBound'] === 'true')
            return;
        toolbar.dataset['noteVideoTooltipBound'] = 'true';
        const videoButton = toolbar.querySelector('.ql-video');
        if (!videoButton)
            return;
        videoButton.addEventListener('click', () => {
            requestAnimationFrame(() => this.alignVideoTooltipToCursor());
        });
    }
    /** Place Quill's inline video prompt at the current cursor / selection. */
    alignVideoTooltipToCursor() {
        const editorQuill = this.quill;
        const editorEl = this.quillEditorRef()?.nativeElement;
        if (!editorQuill || !editorEl)
            return;
        const tooltip = editorEl.querySelector('.ql-tooltip[data-mode="video"]');
        if (!tooltip)
            return;
        const range = this.savedRange ?? editorQuill.getSelection(true);
        const index = range?.index ?? Math.max(0, editorQuill.getLength() - 1);
        const length = range?.length ?? 0;
        const bounds = editorQuill.getBounds(index, length);
        if (!bounds)
            return;
        const editorWidth = editorEl.clientWidth;
        const tooltipWidth = tooltip.offsetWidth || 320;
        const halfTooltip = tooltipWidth / 2;
        let left = bounds.left + bounds.width / 2;
        left = Math.max(halfTooltip + 8, Math.min(left, editorWidth - halfTooltip - 8));
        const top = bounds.bottom + 8;
        tooltip.style.left = `${left}px`;
        tooltip.style.top = `${top}px`;
        tooltip.style.right = 'auto';
        tooltip.style.bottom = 'auto';
        tooltip.style.transform = 'translateX(-50%)';
    }
    tryInitQuill(initialHtml) {
        if (this.readOnly() || this.sourceMode() || !this.isHtml() || this.loading() || this.quill)
            return;
        const toolbar = this.quillToolbarRef()?.nativeElement;
        const editor = this.quillEditorRef()?.nativeElement;
        if (!toolbar || !editor)
            return;
        const getSavedRange = () => this.savedRange;
        const clearSavedRange = () => {
            this.savedRange = null;
        };
        this.quill = new Quill(editor, {
            theme: 'snow',
            modules: {
                toolbar: {
                    container: toolbar,
                    handlers: {
                        header: (value) => {
                            const editorQuill = this.quill;
                            if (!editorQuill)
                                return;
                            applyHeaderFormatSelectionOnly(editorQuill, value, getSavedRange());
                            clearSavedRange();
                        },
                        image: () => {
                            this.imageUploadInputRef()?.nativeElement.click();
                        },
                    },
                },
            },
            placeholder: this.translate.instant('document-detail.note-editor.placeholder'),
        });
        this.quill.on('text-change', () => {
            this.visualDirty = true;
        });
        this.bindVideoTooltipOnce(toolbar);
        const html = initialHtml ?? this.content();
        this.applyExternalContent(html, true);
        if (initialHtml === undefined) {
            this.lastParentContent = html;
        }
    }
    uploadAndInsertImage(file) {
        const editorQuill = this.quill;
        const parentPath = this.uploadParentPath();
        if (!editorQuill || this.imageUploading())
            return;
        if (!parentPath) {
            this.toast.error(this.translate.instant('document-detail.message.cannot-upload-image-parent-folder-is-unknown'));
            return;
        }
        const docType = inferBlobDocTypeFromFile(file);
        const title = titleFromFileName(file.name);
        const name = sanitizeDocumentName(file.name);
        this.imageUploading.set(true);
        this.documentImportService
            .createBlobHoldingDocumentReliable(parentPath, name, docType, { 'dc:title': title }, file)
            .pipe(switchMap((doc) => {
            if (!doc)
                return of(null);
            return this.documentDetailService
                .getFullDocument(doc.uid)
                .pipe(catchError(() => of(doc)));
        }), catchError(() => of(null)), takeUntilDestroyed(this.destroyRef))
            .subscribe((doc) => {
            this.imageUploading.set(false);
            if (!doc || !this.quill) {
                this.toast.error(this.translate.instant('document-detail.message.failed-to-upload-image'));
                return;
            }
            const url = notePictureInsertUrl(doc);
            if (!url) {
                this.toast.error(this.translate.instant('document-detail.message.uploaded-image-has-no-display-url-yet'));
                return;
            }
            this.insertImagesAtSelection([url]);
        });
    }
    insertImagesAtSelection(urls) {
        const editorQuill = this.quill;
        if (!editorQuill || urls.length === 0)
            return;
        const range = this.savedRange ?? editorQuill.getSelection(true);
        const index = range?.index ?? Math.max(0, editorQuill.getLength() - 1);
        if (range?.length) {
            editorQuill.deleteText(index, range.length, Quill.sources.USER);
        }
        this.savedRange = null;
        editorQuill.clipboard.dangerouslyPasteHTML(index, buildNoteImagesInsertHtml(urls), Quill.sources.USER);
        editorQuill.focus();
        this.visualDirty = true;
    }
    applyExternalContent(html, force = false) {
        if (!this.quill)
            return;
        const incoming = html || '';
        if (!force) {
            const current = this.quill.getSemanticHTML();
            if (current === incoming)
                return;
        }
        const selection = this.quill.getSelection();
        const delta = this.quill.clipboard.convert({ html: incoming });
        this.quill.setContents(delta, Quill.sources.SILENT);
        if (selection) {
            const docLength = this.quill.getLength();
            const index = Math.min(selection.index, Math.max(0, docLength - 1));
            const length = Math.min(selection.length, docLength - index);
            this.quill.setSelection(index, length, Quill.sources.SILENT);
        }
    }
    readQuillHtml() {
        if (!this.quill)
            return '';
        const raw = this.quill.getSemanticHTML();
        const clean = DOMPurify.sanitize(raw, { ADD_ATTR: ['target', 'rel'] });
        return this.enforceBlankLinkRel(clean);
    }
    /** Prevent reverse-tabnabbing for links opened in a new tab. */
    enforceBlankLinkRel(html) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        doc.querySelectorAll('a[target="_blank"]').forEach((anchor) => {
            anchor.setAttribute('rel', 'noopener noreferrer');
        });
        return doc.body.innerHTML;
    }
    destroyQuill() {
        const editor = this.quillEditorRef()?.nativeElement;
        if (editor) {
            editor.innerHTML = '';
        }
        this.quill = null;
    }
    static ɵfac = function NoteEditorComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NoteEditorComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NoteEditorComponent, selectors: [["lib-note-editor"]], viewQuery: function NoteEditorComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.quillToolbarRef, _c0, 5);
            i0.ɵɵviewQuerySignal(ctx.quillEditorRef, _c1, 5);
            i0.ɵɵviewQuerySignal(ctx.imageUploadInputRef, _c2, 5);
            i0.ɵɵviewQuerySignal(ctx.plainTextEditorRef, _c3, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance(4);
        } }, inputs: { content: [1, "content"], mimeType: [1, "mimeType"], uploadParentPath: [1, "uploadParentPath"], saving: [1, "saving"], loading: [1, "loading"], autoFocus: [1, "autoFocus"], readOnly: [1, "readOnly"] }, outputs: { saveNote: "saveNote", focused: "focused" }, features: [i0.ɵɵProvidersFeature([provideNxsToast()])], decls: 4, vars: 3, consts: [["quillToolbar", ""], ["imageUploadInput", ""], ["quillEditor", ""], ["plainTextEditor", ""], [1, "note-editor"], [1, "note-editor-loading"], [1, "note-body", "note-body--read-only"], ["diameter", "36", 3, "label"], [1, "note-markdown-rendered", 3, "innerHTML"], [1, "note-quill-shell"], [1, "note-plain-readonly"], [1, "note-quill-editor", "ql-container", "ql-snow"], [1, "ql-editor", 3, "innerHTML"], [1, "note-body"], ["spellcheck", "false", 1, "note-text-surface", 3, "ngModel"], [1, "note-plain-shell"], [1, "note-footer"], ["aria-live", "polite", 1, "note-image-upload-overlay"], ["type", "button", "mat-icon-button", "", 1, "note-quill-edit-btn", 3, "click", "matTooltip"], ["role", "toolbar", 1, "note-quill-toolbar", 3, "mousedown"], [1, "ql-formats"], [1, "ql-header", 3, "title"], ["value", "1"], ["value", "2"], ["value", "3"], ["value", "4"], ["value", "5"], ["value", "6"], ["selected", ""], ["type", "button", 1, "ql-bold", 3, "title"], ["type", "button", 1, "ql-italic", 3, "title"], ["type", "button", 1, "ql-underline", 3, "title"], ["type", "button", 1, "ql-strike", 3, "title"], ["type", "button", 1, "ql-blockquote", 3, "title"], ["type", "button", 1, "ql-code-block", 3, "title"], ["type", "button", "value", "bullet", 1, "ql-list", 3, "title"], ["type", "button", "value", "ordered", 1, "ql-list", 3, "title"], ["type", "button", "value", "", 1, "ql-align", 3, "title"], ["type", "button", "value", "center", 1, "ql-align", 3, "title"], ["type", "button", "value", "right", 1, "ql-align", 3, "title"], ["type", "button", "value", "justify", 1, "ql-align", 3, "title"], [1, "ql-color", 3, "title"], [1, "ql-background", 3, "title"], ["type", "button", "value", "sub", 1, "ql-script", 3, "title"], ["type", "button", "value", "super", 1, "ql-script", 3, "title"], ["type", "button", "value", "-1", 1, "ql-indent", 3, "title"], ["type", "button", "value", "+1", 1, "ql-indent", 3, "title"], ["type", "button", 1, "ql-link", 3, "title"], ["type", "button", 1, "ql-image", 3, "title"], ["type", "button", 1, "note-quill-image-from-docs", 3, "mousedown", "click", "title"], ["viewBox", "0 0 18 18", "aria-hidden", "true"], ["height", "9", "width", "10", "x", "1", "y", "2", 1, "ql-stroke"], ["cx", "3.75", "cy", "5", "r", "0.85", 1, "ql-fill"], ["points", "2.5 9.5 2.5 9 4.25 7.25 5.25 8.25 7.5 6 9.25 7.75 9.25 9.5 2.5 9.5", 1, "ql-even", "ql-fill"], ["cx", "12.75", "cy", "12.75", "r", "2.75", 1, "ql-stroke"], ["x1", "14.7", "y1", "14.7", "x2", "16.5", "y2", "16.5", 1, "ql-stroke"], ["type", "button", 1, "ql-video", 3, "title"], ["type", "file", "accept", "image/*", 1, "note-quill-hidden-file-input", 3, "change"], ["type", "button", 1, "ql-clean", 3, "title"], [1, "note-quill-editor"], ["diameter", "28"], ["spellcheck", "false", 1, "note-text-surface", 3, "ngModelChange", "ngModel"], [1, "note-plain-view"], ["type", "button", "mat-icon-button", "", 1, "note-plain-edit-btn", 3, "click", "matTooltip"], ["spellcheck", "true", 1, "note-text-surface", "note-plain-editor", 3, "ngModelChange", "ngModel"], [1, "note-plain-actions"], ["type", "button", "mat-button", "", 3, "click"], ["type", "button", "mat-flat-button", "", "color", "primary", 1, "save-btn", 3, "click", "disabled"], ["diameter", "18"], ["type", "button", "mat-icon-button", "", 1, "source-toggle", 3, "click", "matTooltip"]], template: function NoteEditorComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 4);
            i0.ɵɵconditionalCreate(1, NoteEditorComponent_Conditional_1_Template, 2, 1)(2, NoteEditorComponent_Conditional_2_Template, 3, 3, "div", 5)(3, NoteEditorComponent_Conditional_3_Template, 5, 2);
            i0.ɵɵelementEnd();
        } if (rf & 2) {
            i0.ɵɵclassProp("note-editor--read-only", ctx.readOnly());
            i0.ɵɵadvance();
            i0.ɵɵconditional(ctx.readOnly() ? 1 : ctx.loading() ? 2 : 3);
        } }, dependencies: [NxsSpinnerComponent,
            FormsModule, i1.NgSelectOption, i1.ɵNgSelectMultipleOption, i1.DefaultValueAccessor, i1.NgControlStatus, i1.NgModel, MatButtonModule, i2.MatButton, i2.MatIconButton, MatDialogModule,
            MatIconModule, i3.MatIcon, MatProgressSpinnerModule, i4.MatProgressSpinner, MatTooltipModule, i5.MatTooltip, TranslatePipe], styles: ["@import 'quill/dist/quill.snow.css';\n\nlib-note-editor {\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  min-height: 0;\n  overflow: hidden;\n}\n\n.note-editor {\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  min-height: 0;\n  background: var(--mat-sys-surface, #fff);\n  border: 1px solid var(--mat-sys-outline-variant, #e0e0e0);\n  border-radius: 4px;\n  overflow: hidden;\n}\n\n.note-editor-loading {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex: 1;\n  min-height: 320px;\n}\n\n.note-body {\n  flex: 1;\n  min-height: 0;\n  display: flex;\n  flex-direction: column;\n}\n\n.note-quill-shell {\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  min-height: 0;\n  position: relative;\n}\n\n.note-quill-edit-btn {\n  position: absolute;\n  top: 8px;\n  right: 8px;\n  z-index: 5;\n  color: var(--mat-sys-on-surface-variant, #616161);\n\n  &:hover {\n    color: var(--mat-sys-on-surface, #212121);\n  }\n}\n\n.note-image-upload-overlay {\n  position: absolute;\n  inset: 0;\n  z-index: 10;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n  background: color-mix(in srgb, var(--mat-sys-surface, #fff) 82%, transparent);\n  font-size: 14px;\n  color: var(--mat-sys-on-surface, #212121);\n}\n\n.note-quill-hidden-file-input {\n  display: none !important;\n}\n\n.note-quill-editor {\n  flex: 1;\n  min-height: 360px;\n  border: none !important;\n  display: flex;\n  flex-direction: column;\n  position: relative;\n\n  &.ql-container.ql-snow {\n    border: none;\n  }\n\n  // Quill inline prompts (link, video) \u2014 readable; video position set at cursor via TS.\n  .ql-tooltip {\n    z-index: 20;\n    padding: 10px 12px;\n    border: 1px solid var(--mat-sys-outline-variant, #c4c4c4);\n    border-radius: 8px;\n    background: var(--mat-sys-surface, #fff);\n    box-shadow:\n      0 4px 16px color-mix(in srgb, var(--mat-sys-shadow, #000) 14%, transparent),\n      0 1px 4px color-mix(in srgb, var(--mat-sys-shadow, #000) 8%, transparent);\n    font-size: 14px;\n    line-height: 1.4;\n    color: var(--mat-sys-on-surface, #212121);\n    white-space: nowrap;\n\n    &::before {\n      font-weight: 600;\n    }\n\n    input[type='text'] {\n      min-width: 280px;\n      padding: 8px 10px;\n      border: 1px solid var(--mat-sys-outline-variant, #c4c4c4);\n      border-radius: 4px;\n      font-size: 14px;\n    }\n\n    .ql-action,\n    .ql-remove {\n      margin-left: 8px;\n      font-weight: 600;\n    }\n  }\n\n  .ql-editor {\n    flex: 1;\n    min-height: 360px;\n    padding: 16px 20px;\n    font-size: 14px;\n    line-height: 1.6;\n    color: var(--mat-sys-on-surface, #212121);\n\n    img {\n      display: block;\n      max-width: 100%;\n      height: auto;\n    }\n\n    p:has(> img:only-child) {\n      margin: 0.5em 0;\n    }\n  }\n\n  .ql-editor.ql-blank::before {\n    color: var(--mat-sys-on-surface-variant, #9e9e9e);\n    font-style: normal;\n    left: 20px;\n  }\n}\n\n.note-quill-toolbar {\n  border: none;\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #e8e8e8);\n  background: var(--mat-sys-surface-container-low, #fafafa);\n  padding: 6px 8px;\n  font-family: inherit;\n\n  .note-quill-image-from-docs {\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n    width: 28px;\n    height: 24px;\n    margin: 0 1px;\n    padding: 3px 5px;\n    border: none;\n    border-radius: 2px;\n    background: transparent;\n    cursor: pointer;\n    vertical-align: middle;\n    float: left;\n\n    &:hover {\n      color: var(--mat-sys-primary, #3949ab);\n\n      .ql-stroke {\n        stroke: var(--mat-sys-primary, #3949ab);\n      }\n\n      .ql-fill {\n        fill: var(--mat-sys-primary, #3949ab);\n      }\n    }\n\n    svg {\n      display: block;\n      width: 18px;\n      height: 18px;\n    }\n  }\n}\n\n.note-text-surface {\n  flex: 1;\n  min-height: 360px;\n  width: 100%;\n  padding: 16px 20px;\n  border: none;\n  resize: none;\n  outline: none;\n  font-family: 'Roboto Mono', 'Consolas', monospace;\n  font-size: 14px;\n  line-height: 1.6;\n  box-sizing: border-box;\n}\n\n.note-plain-shell {\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  min-height: 0;\n}\n\n.note-plain-view {\n  position: relative;\n  flex: 1;\n  min-height: 360px;\n  overflow: auto;\n}\n\n.note-plain-edit-btn {\n  position: absolute;\n  top: 8px;\n  right: 8px;\n  z-index: 1;\n  color: var(--mat-sys-on-surface-variant, #616161);\n\n  &:hover {\n    color: var(--mat-sys-on-surface, #212121);\n  }\n}\n\n.note-plain-readonly {\n  margin: 0;\n  padding: 16px 48px 16px 20px;\n  font-family: 'Roboto Mono', 'Consolas', monospace;\n  font-size: 14px;\n  line-height: 1.6;\n  white-space: pre-wrap;\n  word-break: break-word;\n  color: var(--mat-sys-on-surface, #212121);\n}\n\n.note-body--read-only {\n  min-height: 120px;\n}\n\n.note-editor--read-only .note-quill-editor {\n  pointer-events: none;\n}\n\n.note-markdown-rendered {\n  padding: 16px 48px 16px 20px;\n  font-size: 14px;\n  line-height: 1.6;\n  color: var(--mat-sys-on-surface, #243442);\n  word-break: break-word;\n\n  h1,\n  h2,\n  h3,\n  h4,\n  h5,\n  h6 {\n    margin: 0 0 0.5em;\n    font-weight: 600;\n    color: var(--mat-sys-on-surface, #243442);\n  }\n\n  h1 {\n    font-size: 2em;\n  }\n\n  h2 {\n    font-size: 1.5em;\n  }\n\n  h3 {\n    font-size: 1.25em;\n  }\n\n  p {\n    margin: 0 0 0.75em;\n  }\n\n  strong {\n    font-weight: 600;\n  }\n\n  ul,\n  ol {\n    margin: 0.5em 0 0.75em;\n    padding-left: 1.5em;\n  }\n\n  li {\n    margin-bottom: 0.25em;\n  }\n\n  code {\n    background: var(--mat-sys-surface-container-high, #f0f0f0);\n    padding: 2px 4px;\n    border-radius: 3px;\n    font-family: 'Roboto Mono', 'Consolas', monospace;\n    font-size: 0.9em;\n  }\n\n  blockquote {\n    margin: 0.5em 0;\n    padding-left: 1em;\n    border-left: 3px solid var(--mat-sys-outline-variant, #ccc);\n    color: var(--mat-sys-on-surface-variant, #555);\n  }\n\n  a {\n    color: var(--mat-sys-primary, #3f51b5);\n    text-decoration: underline;\n  }\n}\n\n.note-markdown-editor {\n  font-family: inherit;\n}\n\n.note-plain-editor {\n  min-height: 0;\n}\n\n.note-plain-actions {\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n  gap: 8px;\n  padding: 12px 16px;\n  border-top: 1px solid var(--mat-sys-outline-variant, #e8e8e8);\n  background: var(--mat-sys-surface-container-low, #fafafa);\n\n  .save-btn {\n    min-width: 88px;\n  }\n}\n\n.note-footer {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 8px 12px;\n  border-top: 1px solid var(--mat-sys-outline-variant, #e8e8e8);\n  background: var(--mat-sys-surface-container-low, #fafafa);\n\n  .save-btn {\n    min-width: 88px;\n  }\n\n  .source-toggle--active {\n    background: color-mix(in srgb, var(--mat-sys-primary) 14%, transparent);\n\n    .mat-icon {\n      color: var(--mat-sys-primary, #3949ab);\n    }\n  }\n}\n"], encapsulation: 2, changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NoteEditorComponent, [{
        type: Component,
        args: [{ selector: 'lib-note-editor', standalone: true, imports: [
                    NxsSpinnerComponent,
                    TranslatePipe,
                    FormsModule,
                    MatButtonModule,
                    MatDialogModule,
                    MatIconModule,
                    MatProgressSpinnerModule,
                    MatTooltipModule,
                ], providers: [provideNxsToast()], changeDetection: ChangeDetectionStrategy.OnPush, encapsulation: ViewEncapsulation.None, template: "<div class=\"note-editor\" [class.note-editor--read-only]=\"readOnly()\">\n  @if (readOnly()) {\n    @if (loading()) {\n      <div class=\"note-editor-loading\">\n        <nxs-spinner diameter=\"36\" [label]=\"'document-detail.note-editor.loading' | translate\" />\n      </div>\n    } @else {\n      <div class=\"note-body note-body--read-only\">\n        @if (isMarkdown()) {\n          <div class=\"note-markdown-rendered\" [innerHTML]=\"markdownHtml()\"></div>\n        } @else if (isHtml()) {\n          <div class=\"note-quill-shell\">\n            <div class=\"note-quill-editor ql-container ql-snow\">\n              <div class=\"ql-editor\" [innerHTML]=\"htmlReadonlyView()\"></div>\n            </div>\n          </div>\n        } @else {\n          <pre class=\"note-plain-readonly\">{{ content() }}</pre>\n        }\n      </div>\n    }\n  } @else if (loading()) {\n    <div class=\"note-editor-loading\">\n      <nxs-spinner diameter=\"36\" [label]=\"'document-detail.note-editor.loading' | translate\" />\n    </div>\n  } @else {\n    <div class=\"note-body\">\n      @if (isHtml() && !sourceMode()) {\n        <div class=\"note-quill-shell\">\n          @if (imageUploading()) {\n            <div class=\"note-image-upload-overlay\" aria-live=\"polite\">\n              <nxs-spinner diameter=\"28\" />\n              <span>{{ 'document-detail.note-editor.uploading-image' | translate }}</span>\n            </div>\n          }\n          <button\n            type=\"button\"\n            mat-icon-button\n            class=\"note-quill-edit-btn\"\n            [matTooltip]=\"'document-detail.note-editor.edit-note' | translate\"\n            [attr.aria-label]=\"'document-detail.note-editor.edit-note' | translate\"\n            (click)=\"focusForEdit()\"\n          >\n            <mat-icon>edit</mat-icon>\n          </button>\n          <div\n            #quillToolbar\n            class=\"note-quill-toolbar\"\n            role=\"toolbar\"\n            [attr.aria-label]=\"'document-detail.note-editor.note-formatting' | translate\"\n            (mousedown)=\"onToolbarMouseDown($event)\"\n          >\n            <span class=\"ql-formats\">\n              <select\n                class=\"ql-header\"\n                [title]=\"'document-detail.note-editor.text-style' | translate\"\n                [attr.aria-label]=\"'document-detail.note-editor.text-style' | translate\"\n              >\n                <option value=\"1\"></option>\n                <option value=\"2\"></option>\n                <option value=\"3\"></option>\n                <option value=\"4\"></option>\n                <option value=\"5\"></option>\n                <option value=\"6\"></option>\n                <option selected></option>\n              </select>\n            </span>\n            <span class=\"ql-formats\">\n              <button\n                type=\"button\"\n                class=\"ql-bold\"\n                [title]=\"'document-detail.note-editor.bold' | translate\"\n                [attr.aria-label]=\"'document-detail.note-editor.bold' | translate\"\n              ></button>\n              <button\n                type=\"button\"\n                class=\"ql-italic\"\n                [title]=\"'document-detail.note-editor.italic' | translate\"\n                [attr.aria-label]=\"'document-detail.note-editor.italic' | translate\"\n              ></button>\n              <button\n                type=\"button\"\n                class=\"ql-underline\"\n                [title]=\"'document-detail.note-editor.underline' | translate\"\n                [attr.aria-label]=\"'document-detail.note-editor.underline' | translate\"\n              ></button>\n              <button\n                type=\"button\"\n                class=\"ql-strike\"\n                [title]=\"'document-detail.note-editor.strikethrough' | translate\"\n                [attr.aria-label]=\"'document-detail.note-editor.strikethrough' | translate\"\n              ></button>\n            </span>\n            <span class=\"ql-formats\">\n              <button\n                type=\"button\"\n                class=\"ql-blockquote\"\n                [title]=\"'document-detail.note-editor.blockquote' | translate\"\n                [attr.aria-label]=\"'document-detail.note-editor.blockquote' | translate\"\n              ></button>\n              <button\n                type=\"button\"\n                class=\"ql-code-block\"\n                [title]=\"'document-detail.note-editor.code-block' | translate\"\n                [attr.aria-label]=\"'document-detail.note-editor.code-block' | translate\"\n              ></button>\n            </span>\n            <span class=\"ql-formats\">\n              <button\n                type=\"button\"\n                class=\"ql-list\"\n                value=\"bullet\"\n                [title]=\"'document-detail.note-editor.bulleted-list' | translate\"\n                [attr.aria-label]=\"'document-detail.note-editor.bulleted-list' | translate\"\n              ></button>\n              <button\n                type=\"button\"\n                class=\"ql-list\"\n                value=\"ordered\"\n                [title]=\"'document-detail.note-editor.numbered-list' | translate\"\n                [attr.aria-label]=\"'document-detail.note-editor.numbered-list' | translate\"\n              ></button>\n            </span>\n            <span class=\"ql-formats\">\n              <button\n                type=\"button\"\n                class=\"ql-align\"\n                value=\"\"\n                [title]=\"'document-detail.note-editor.align-left' | translate\"\n                [attr.aria-label]=\"'document-detail.note-editor.align-left' | translate\"\n              ></button>\n              <button\n                type=\"button\"\n                class=\"ql-align\"\n                value=\"center\"\n                [title]=\"'document-detail.note-editor.align-center' | translate\"\n                [attr.aria-label]=\"'document-detail.note-editor.align-center' | translate\"\n              ></button>\n              <button\n                type=\"button\"\n                class=\"ql-align\"\n                value=\"right\"\n                [title]=\"'document-detail.note-editor.align-right' | translate\"\n                [attr.aria-label]=\"'document-detail.note-editor.align-right' | translate\"\n              ></button>\n              <button\n                type=\"button\"\n                class=\"ql-align\"\n                value=\"justify\"\n                [title]=\"'document-detail.note-editor.justify' | translate\"\n                [attr.aria-label]=\"'document-detail.note-editor.justify' | translate\"\n              ></button>\n            </span>\n            <span class=\"ql-formats\">\n              <select\n                class=\"ql-color\"\n                [title]=\"'document-detail.note-editor.text-color' | translate\"\n                [attr.aria-label]=\"'document-detail.note-editor.text-color' | translate\"\n              ></select>\n              <select\n                class=\"ql-background\"\n                [title]=\"'document-detail.note-editor.highlight-color' | translate\"\n                [attr.aria-label]=\"'document-detail.note-editor.highlight-color' | translate\"\n              ></select>\n            </span>\n            <span class=\"ql-formats\">\n              <button\n                type=\"button\"\n                class=\"ql-script\"\n                value=\"sub\"\n                [title]=\"'document-detail.note-editor.subscript' | translate\"\n                [attr.aria-label]=\"'document-detail.note-editor.subscript' | translate\"\n              ></button>\n              <button\n                type=\"button\"\n                class=\"ql-script\"\n                value=\"super\"\n                [title]=\"'document-detail.note-editor.superscript' | translate\"\n                [attr.aria-label]=\"'document-detail.note-editor.superscript' | translate\"\n              ></button>\n            </span>\n            <span class=\"ql-formats\">\n              <button\n                type=\"button\"\n                class=\"ql-indent\"\n                value=\"-1\"\n                [title]=\"'document-detail.note-editor.decrease-indent' | translate\"\n                [attr.aria-label]=\"'document-detail.note-editor.decrease-indent' | translate\"\n              ></button>\n              <button\n                type=\"button\"\n                class=\"ql-indent\"\n                value=\"+1\"\n                [title]=\"'document-detail.note-editor.increase-indent' | translate\"\n                [attr.aria-label]=\"'document-detail.note-editor.increase-indent' | translate\"\n              ></button>\n            </span>\n            <span class=\"ql-formats\">\n              <button\n                type=\"button\"\n                class=\"ql-link\"\n                [title]=\"'document-detail.note-editor.insert-link' | translate\"\n                [attr.aria-label]=\"'document-detail.note-editor.insert-link' | translate\"\n              ></button>\n              <button\n                type=\"button\"\n                class=\"ql-image\"\n                [title]=\"'document-detail.note-editor.insert-image' | translate\"\n                [attr.aria-label]=\"'document-detail.note-editor.insert-image' | translate\"\n              ></button>\n              <button\n                type=\"button\"\n                class=\"note-quill-image-from-docs\"\n                [title]=\"\n                  'document-detail.note-editor.insert-image-from-existing-documents' | translate\n                \"\n                [attr.aria-label]=\"\n                  'document-detail.note-editor.insert-image-from-existing-documents' | translate\n                \"\n                (mousedown)=\"$event.preventDefault()\"\n                (click)=\"insertImagesFromExistingDocuments()\"\n              >\n                <svg viewBox=\"0 0 18 18\" aria-hidden=\"true\">\n                  <rect class=\"ql-stroke\" height=\"9\" width=\"10\" x=\"1\" y=\"2\" />\n                  <circle class=\"ql-fill\" cx=\"3.75\" cy=\"5\" r=\"0.85\" />\n                  <polyline\n                    class=\"ql-even ql-fill\"\n                    points=\"2.5 9.5 2.5 9 4.25 7.25 5.25 8.25 7.5 6 9.25 7.75 9.25 9.5 2.5 9.5\"\n                  />\n                  <circle class=\"ql-stroke\" cx=\"12.75\" cy=\"12.75\" r=\"2.75\" />\n                  <line class=\"ql-stroke\" x1=\"14.7\" y1=\"14.7\" x2=\"16.5\" y2=\"16.5\" />\n                </svg>\n              </button>\n              <button\n                type=\"button\"\n                class=\"ql-video\"\n                [title]=\"'document-detail.note-editor.insert-video' | translate\"\n                [attr.aria-label]=\"'document-detail.note-editor.insert-video' | translate\"\n              ></button>\n            </span>\n            <input\n              #imageUploadInput\n              type=\"file\"\n              accept=\"image/*\"\n              class=\"note-quill-hidden-file-input\"\n              (change)=\"onImageFileSelected($event)\"\n            />\n            <span class=\"ql-formats\">\n              <button\n                type=\"button\"\n                class=\"ql-clean\"\n                [title]=\"'document-detail.note-editor.clear-formatting' | translate\"\n                [attr.aria-label]=\"'document-detail.note-editor.clear-formatting' | translate\"\n              ></button>\n            </span>\n          </div>\n          <div #quillEditor class=\"note-quill-editor\"></div>\n        </div>\n      } @else if (isHtml() && sourceMode()) {\n        <textarea\n          class=\"note-text-surface\"\n          [ngModel]=\"editText()\"\n          (ngModelChange)=\"editText.set($event)\"\n          [attr.aria-label]=\"'document-detail.note-editor.note-html-source' | translate\"\n          spellcheck=\"false\"\n        ></textarea>\n      } @else {\n        <div class=\"note-plain-shell\">\n          @if (!plainTextEditMode()) {\n            <div class=\"note-plain-view\">\n              <button\n                type=\"button\"\n                mat-icon-button\n                class=\"note-plain-edit-btn\"\n                [matTooltip]=\"'document-detail.note-editor.edit' | translate\"\n                [attr.aria-label]=\"'document-detail.note-editor.edit-note' | translate\"\n                (click)=\"enterPlainTextEdit()\"\n              >\n                <mat-icon>edit</mat-icon>\n              </button>\n              @if (isMarkdown()) {\n                <div class=\"note-markdown-rendered\" [innerHTML]=\"markdownHtml()\"></div>\n              } @else {\n                <pre class=\"note-plain-readonly\">{{ content() }}</pre>\n              }\n            </div>\n          } @else {\n            <textarea\n              #plainTextEditor\n              class=\"note-text-surface note-plain-editor\"\n              [class.note-markdown-editor]=\"isMarkdown()\"\n              [ngModel]=\"editText()\"\n              (ngModelChange)=\"editText.set($event)\"\n              [attr.aria-label]=\"'document-detail.note-editor.note-content' | translate\"\n              spellcheck=\"true\"\n            ></textarea>\n            <div class=\"note-plain-actions\">\n              <button type=\"button\" mat-button (click)=\"cancelPlainTextEdit()\">\n                {{ 'document-detail.note-editor.cancel' | translate }}\n              </button>\n              <button\n                type=\"button\"\n                mat-flat-button\n                color=\"primary\"\n                class=\"save-btn\"\n                [disabled]=\"saving()\"\n                (click)=\"onSave()\"\n              >\n                @if (saving()) {\n                  <mat-spinner\n                    diameter=\"18\"\n                    [attr.aria-label]=\"'document-detail.note-editor.loading' | translate\"\n                  />\n                } @else {\n                  {{ 'document-detail.note-editor.save' | translate }}\n                }\n              </button>\n            </div>\n          }\n        </div>\n      }\n    </div>\n\n    @if (isHtml()) {\n      <div class=\"note-footer\">\n        <button\n          type=\"button\"\n          mat-icon-button\n          class=\"source-toggle\"\n          [class.source-toggle--active]=\"sourceMode()\"\n          [matTooltip]=\"\n            sourceMode()\n              ? ('document-detail.visual-editor' | translate)\n              : ('document-detail.html-source' | translate)\n          \"\n          [attr.aria-label]=\"\n            sourceMode()\n              ? ('document-detail.visual-editor' | translate)\n              : ('document-detail.html-source' | translate)\n          \"\n          (click)=\"toggleSourceMode()\"\n        >\n          <mat-icon>{{ sourceMode() ? 'edit' : 'code' }}</mat-icon>\n        </button>\n        <button\n          type=\"button\"\n          mat-flat-button\n          color=\"primary\"\n          class=\"save-btn\"\n          [disabled]=\"saving()\"\n          (click)=\"onSave()\"\n        >\n          @if (saving()) {\n            <mat-spinner\n              diameter=\"18\"\n              [attr.aria-label]=\"'document-detail.note-editor.loading' | translate\"\n            />\n          } @else {\n            {{ 'document-detail.note-editor.save' | translate }}\n          }\n        </button>\n      </div>\n    }\n  }\n</div>\n", styles: ["@import 'quill/dist/quill.snow.css';\n\nlib-note-editor {\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  min-height: 0;\n  overflow: hidden;\n}\n\n.note-editor {\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  min-height: 0;\n  background: var(--mat-sys-surface, #fff);\n  border: 1px solid var(--mat-sys-outline-variant, #e0e0e0);\n  border-radius: 4px;\n  overflow: hidden;\n}\n\n.note-editor-loading {\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  flex: 1;\n  min-height: 320px;\n}\n\n.note-body {\n  flex: 1;\n  min-height: 0;\n  display: flex;\n  flex-direction: column;\n}\n\n.note-quill-shell {\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  min-height: 0;\n  position: relative;\n}\n\n.note-quill-edit-btn {\n  position: absolute;\n  top: 8px;\n  right: 8px;\n  z-index: 5;\n  color: var(--mat-sys-on-surface-variant, #616161);\n\n  &:hover {\n    color: var(--mat-sys-on-surface, #212121);\n  }\n}\n\n.note-image-upload-overlay {\n  position: absolute;\n  inset: 0;\n  z-index: 10;\n  display: flex;\n  flex-direction: column;\n  align-items: center;\n  justify-content: center;\n  gap: 8px;\n  background: color-mix(in srgb, var(--mat-sys-surface, #fff) 82%, transparent);\n  font-size: 14px;\n  color: var(--mat-sys-on-surface, #212121);\n}\n\n.note-quill-hidden-file-input {\n  display: none !important;\n}\n\n.note-quill-editor {\n  flex: 1;\n  min-height: 360px;\n  border: none !important;\n  display: flex;\n  flex-direction: column;\n  position: relative;\n\n  &.ql-container.ql-snow {\n    border: none;\n  }\n\n  // Quill inline prompts (link, video) \u2014 readable; video position set at cursor via TS.\n  .ql-tooltip {\n    z-index: 20;\n    padding: 10px 12px;\n    border: 1px solid var(--mat-sys-outline-variant, #c4c4c4);\n    border-radius: 8px;\n    background: var(--mat-sys-surface, #fff);\n    box-shadow:\n      0 4px 16px color-mix(in srgb, var(--mat-sys-shadow, #000) 14%, transparent),\n      0 1px 4px color-mix(in srgb, var(--mat-sys-shadow, #000) 8%, transparent);\n    font-size: 14px;\n    line-height: 1.4;\n    color: var(--mat-sys-on-surface, #212121);\n    white-space: nowrap;\n\n    &::before {\n      font-weight: 600;\n    }\n\n    input[type='text'] {\n      min-width: 280px;\n      padding: 8px 10px;\n      border: 1px solid var(--mat-sys-outline-variant, #c4c4c4);\n      border-radius: 4px;\n      font-size: 14px;\n    }\n\n    .ql-action,\n    .ql-remove {\n      margin-left: 8px;\n      font-weight: 600;\n    }\n  }\n\n  .ql-editor {\n    flex: 1;\n    min-height: 360px;\n    padding: 16px 20px;\n    font-size: 14px;\n    line-height: 1.6;\n    color: var(--mat-sys-on-surface, #212121);\n\n    img {\n      display: block;\n      max-width: 100%;\n      height: auto;\n    }\n\n    p:has(> img:only-child) {\n      margin: 0.5em 0;\n    }\n  }\n\n  .ql-editor.ql-blank::before {\n    color: var(--mat-sys-on-surface-variant, #9e9e9e);\n    font-style: normal;\n    left: 20px;\n  }\n}\n\n.note-quill-toolbar {\n  border: none;\n  border-bottom: 1px solid var(--mat-sys-outline-variant, #e8e8e8);\n  background: var(--mat-sys-surface-container-low, #fafafa);\n  padding: 6px 8px;\n  font-family: inherit;\n\n  .note-quill-image-from-docs {\n    display: inline-flex;\n    align-items: center;\n    justify-content: center;\n    width: 28px;\n    height: 24px;\n    margin: 0 1px;\n    padding: 3px 5px;\n    border: none;\n    border-radius: 2px;\n    background: transparent;\n    cursor: pointer;\n    vertical-align: middle;\n    float: left;\n\n    &:hover {\n      color: var(--mat-sys-primary, #3949ab);\n\n      .ql-stroke {\n        stroke: var(--mat-sys-primary, #3949ab);\n      }\n\n      .ql-fill {\n        fill: var(--mat-sys-primary, #3949ab);\n      }\n    }\n\n    svg {\n      display: block;\n      width: 18px;\n      height: 18px;\n    }\n  }\n}\n\n.note-text-surface {\n  flex: 1;\n  min-height: 360px;\n  width: 100%;\n  padding: 16px 20px;\n  border: none;\n  resize: none;\n  outline: none;\n  font-family: 'Roboto Mono', 'Consolas', monospace;\n  font-size: 14px;\n  line-height: 1.6;\n  box-sizing: border-box;\n}\n\n.note-plain-shell {\n  display: flex;\n  flex-direction: column;\n  flex: 1;\n  min-height: 0;\n}\n\n.note-plain-view {\n  position: relative;\n  flex: 1;\n  min-height: 360px;\n  overflow: auto;\n}\n\n.note-plain-edit-btn {\n  position: absolute;\n  top: 8px;\n  right: 8px;\n  z-index: 1;\n  color: var(--mat-sys-on-surface-variant, #616161);\n\n  &:hover {\n    color: var(--mat-sys-on-surface, #212121);\n  }\n}\n\n.note-plain-readonly {\n  margin: 0;\n  padding: 16px 48px 16px 20px;\n  font-family: 'Roboto Mono', 'Consolas', monospace;\n  font-size: 14px;\n  line-height: 1.6;\n  white-space: pre-wrap;\n  word-break: break-word;\n  color: var(--mat-sys-on-surface, #212121);\n}\n\n.note-body--read-only {\n  min-height: 120px;\n}\n\n.note-editor--read-only .note-quill-editor {\n  pointer-events: none;\n}\n\n.note-markdown-rendered {\n  padding: 16px 48px 16px 20px;\n  font-size: 14px;\n  line-height: 1.6;\n  color: var(--mat-sys-on-surface, #243442);\n  word-break: break-word;\n\n  h1,\n  h2,\n  h3,\n  h4,\n  h5,\n  h6 {\n    margin: 0 0 0.5em;\n    font-weight: 600;\n    color: var(--mat-sys-on-surface, #243442);\n  }\n\n  h1 {\n    font-size: 2em;\n  }\n\n  h2 {\n    font-size: 1.5em;\n  }\n\n  h3 {\n    font-size: 1.25em;\n  }\n\n  p {\n    margin: 0 0 0.75em;\n  }\n\n  strong {\n    font-weight: 600;\n  }\n\n  ul,\n  ol {\n    margin: 0.5em 0 0.75em;\n    padding-left: 1.5em;\n  }\n\n  li {\n    margin-bottom: 0.25em;\n  }\n\n  code {\n    background: var(--mat-sys-surface-container-high, #f0f0f0);\n    padding: 2px 4px;\n    border-radius: 3px;\n    font-family: 'Roboto Mono', 'Consolas', monospace;\n    font-size: 0.9em;\n  }\n\n  blockquote {\n    margin: 0.5em 0;\n    padding-left: 1em;\n    border-left: 3px solid var(--mat-sys-outline-variant, #ccc);\n    color: var(--mat-sys-on-surface-variant, #555);\n  }\n\n  a {\n    color: var(--mat-sys-primary, #3f51b5);\n    text-decoration: underline;\n  }\n}\n\n.note-markdown-editor {\n  font-family: inherit;\n}\n\n.note-plain-editor {\n  min-height: 0;\n}\n\n.note-plain-actions {\n  display: flex;\n  align-items: center;\n  justify-content: flex-end;\n  gap: 8px;\n  padding: 12px 16px;\n  border-top: 1px solid var(--mat-sys-outline-variant, #e8e8e8);\n  background: var(--mat-sys-surface-container-low, #fafafa);\n\n  .save-btn {\n    min-width: 88px;\n  }\n}\n\n.note-footer {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  padding: 8px 12px;\n  border-top: 1px solid var(--mat-sys-outline-variant, #e8e8e8);\n  background: var(--mat-sys-surface-container-low, #fafafa);\n\n  .save-btn {\n    min-width: 88px;\n  }\n\n  .source-toggle--active {\n    background: color-mix(in srgb, var(--mat-sys-primary) 14%, transparent);\n\n    .mat-icon {\n      color: var(--mat-sys-primary, #3949ab);\n    }\n  }\n}\n"] }]
    }], () => [], { content: [{ type: i0.Input, args: [{ isSignal: true, alias: "content", required: true }] }], mimeType: [{ type: i0.Input, args: [{ isSignal: true, alias: "mimeType", required: true }] }], uploadParentPath: [{ type: i0.Input, args: [{ isSignal: true, alias: "uploadParentPath", required: false }] }], saving: [{ type: i0.Input, args: [{ isSignal: true, alias: "saving", required: false }] }], loading: [{ type: i0.Input, args: [{ isSignal: true, alias: "loading", required: false }] }], autoFocus: [{ type: i0.Input, args: [{ isSignal: true, alias: "autoFocus", required: false }] }], readOnly: [{ type: i0.Input, args: [{ isSignal: true, alias: "readOnly", required: false }] }], saveNote: [{ type: i0.Output, args: ["saveNote"] }], focused: [{ type: i0.Output, args: ["focused"] }], quillToolbarRef: [{ type: i0.ViewChild, args: ['quillToolbar', { isSignal: true }] }], quillEditorRef: [{ type: i0.ViewChild, args: ['quillEditor', { isSignal: true }] }], imageUploadInputRef: [{ type: i0.ViewChild, args: ['imageUploadInput', { isSignal: true }] }], plainTextEditorRef: [{ type: i0.ViewChild, args: ['plainTextEditor', { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NoteEditorComponent, { className: "NoteEditorComponent", filePath: "libs/features/document-detail/src/lib/note-editor/note-editor.ts", lineNumber: 72 }); })();
