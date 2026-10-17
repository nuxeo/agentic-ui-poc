import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { NgTemplateOutlet } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { afterNextRender, ChangeDetectionStrategy, Component, computed, contentChild, DestroyRef, ElementRef, inject, Injector, input, numberAttribute, output, signal, viewChild, } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDialog, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle, } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ADMIN_ACCESS_CHECKS, avatarColor, CURRENT_USERNAME, DocumentDetailService, formatRelativeTime, } from '@nuxeo/satori-platform/nuxeo-client';
import { catchError, finalize, map, merge, of, Subject, switchMap, tap, } from 'rxjs';
import { NxsAvatarComponent } from '../avatar/avatar.component';
import { nxsInitial } from '../properties-panel/property-text';
import { NxsSpinnerComponent } from '../spinner/spinner.component';
import { provideNxsToast, NxsToastService } from '../toast/toast.service';
import { NxsCommentExtraDirective } from './comment-extra.directive';
import * as i0 from "@angular/core";
const _c0 = ["deleteConfirmation"];
const _c1 = a0 => ({ count: a0 });
const _c2 = a0 => ({ $implicit: a0, parent: null });
const _c3 = a0 => ({ time: a0 });
const _c4 = (a0, a1) => ({ $implicit: a0, parent: a1 });
const _c5 = a0 => ({ author: a0 });
const _c6 = a0 => ({ $implicit: a0 });
const _forTrack0 = ($index, $item) => $item.id;
function NxsCommentsComponent_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 3);
    i0.ɵɵelement(1, "nxs-spinner", 5);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵproperty("label", i0.ɵɵpipeBind1(2, 1, "satori-components.comments.loading"));
} }
function NxsCommentsComponent_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r1 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 4)(1, "p");
    i0.ɵɵtext(2);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "button", 6);
    i0.ɵɵlistener("click", function NxsCommentsComponent_Conditional_1_Template_button_click_4_listener() { i0.ɵɵrestoreView(_r1); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.reload()); });
    i0.ɵɵtext(5);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(3, 2, "satori-components.comments.load-failed"));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(6, 4, "satori-components.comments.retry"), " ");
} }
function NxsCommentsComponent_Conditional_2_Conditional_0_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 12);
    i0.ɵɵlistener("click", function NxsCommentsComponent_Conditional_2_Conditional_0_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.allShown.set(true)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(2, 1, "satori-components.comments.view-all-comments", i0.ɵɵpureFunction1(4, _c1, ctx_r1.comments().length)), " ");
} }
function NxsCommentsComponent_Conditional_2_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 8);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(2, 1, "satori-components.comments.empty"));
} }
function NxsCommentsComponent_Conditional_2_For_5_ng_container_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0);
} }
function NxsCommentsComponent_Conditional_2_For_5_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 16);
    i0.ɵɵlistener("click", function NxsCommentsComponent_Conditional_2_For_5_Conditional_3_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r4); const comment_r5 = i0.ɵɵnextContext().$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.openReplies(comment_r5.id)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const comment_r5 = i0.ɵɵnextContext().$implicit;
    const count_r6 = i0.ɵɵreadContextLet(0);
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate2(" ", i0.ɵɵpipeBind2(2, 2, count_r6 === 1 ? "satori-components.comments.replies-one" : "satori-components.comments.replies-other", i0.ɵɵpureFunction1(8, _c1, count_r6)), " \u00B7 ", i0.ɵɵpipeBind2(3, 5, "satori-components.comments.last-reply", i0.ɵɵpureFunction1(10, _c3, ctx_r1.lastReply(comment_r5.id))), " ");
} }
function NxsCommentsComponent_Conditional_2_For_5_Conditional_4_Conditional_1_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 12);
    i0.ɵɵlistener("click", function NxsCommentsComponent_Conditional_2_For_5_Conditional_4_Conditional_1_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r7); const comment_r5 = i0.ɵɵnextContext(2).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.showAllReplies(comment_r5.id)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵnextContext(2);
    const count_r6 = i0.ɵɵreadContextLet(0);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(2, 1, "satori-components.comments.view-all-replies", i0.ɵɵpureFunction1(4, _c1, count_r6)), " ");
} }
function NxsCommentsComponent_Conditional_2_For_5_Conditional_4_Conditional_2_For_2_ng_container_1_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0);
} }
function NxsCommentsComponent_Conditional_2_For_5_Conditional_4_Conditional_2_For_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "li", 18);
    i0.ɵɵtemplate(1, NxsCommentsComponent_Conditional_2_For_5_Conditional_4_Conditional_2_For_2_ng_container_1_Template, 1, 0, "ng-container", 13);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const reply_r8 = ctx.$implicit;
    const comment_r5 = i0.ɵɵnextContext(3).$implicit;
    i0.ɵɵnextContext(2);
    const entry_r9 = i0.ɵɵreference(4);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngTemplateOutlet", entry_r9)("ngTemplateOutletContext", i0.ɵɵpureFunction2(2, _c4, reply_r8, comment_r5));
} }
function NxsCommentsComponent_Conditional_2_For_5_Conditional_4_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "ul", 17);
    i0.ɵɵrepeaterCreate(1, NxsCommentsComponent_Conditional_2_For_5_Conditional_4_Conditional_2_For_2_Template, 2, 5, "li", 18, _forTrack0);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const comment_r5 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵrepeater(ctx_r1.shownReplies(comment_r5.id));
} }
function NxsCommentsComponent_Conditional_2_For_5_Conditional_4_Conditional_3_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    const _r11 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 21);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵlistener("click", function NxsCommentsComponent_Conditional_2_For_5_Conditional_4_Conditional_3_Conditional_7_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r11); const comment_r5 = i0.ɵɵnextContext(3).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.submitReply(comment_r5)); });
    i0.ɵɵelementStart(3, "mat-icon");
    i0.ɵɵtext(4, "check");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "button", 22);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵlistener("click", function NxsCommentsComponent_Conditional_2_For_5_Conditional_4_Conditional_3_Conditional_7_Template_button_click_5_listener() { i0.ɵɵrestoreView(_r11); const comment_r5 = i0.ɵɵnextContext(3).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.setReplyText(comment_r5.id, "")); });
    i0.ɵɵelementStart(7, "mat-icon");
    i0.ɵɵtext(8, "close");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(5);
    i0.ɵɵproperty("disabled", ctx_r1.saving())("matTooltip", i0.ɵɵpipeBind1(1, 4, "satori-components.comments.submit-hint"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 6, "satori-components.comments.submit-reply"));
    i0.ɵɵadvance(5);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(6, 8, "satori-components.comments.clear"));
} }
function NxsCommentsComponent_Conditional_2_For_5_Conditional_4_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    const _r10 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 11)(1, "mat-form-field", 19)(2, "mat-label");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "textarea", 20);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵlistener("input", function NxsCommentsComponent_Conditional_2_For_5_Conditional_4_Conditional_3_Template_textarea_input_5_listener($event) { i0.ɵɵrestoreView(_r10); const comment_r5 = i0.ɵɵnextContext(2).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.setReplyText(comment_r5.id, ctx_r1.textOf($event))); })("keydown.control.enter", function NxsCommentsComponent_Conditional_2_For_5_Conditional_4_Conditional_3_Template_textarea_keydown_control_enter_5_listener($event) { i0.ɵɵrestoreView(_r10); const comment_r5 = i0.ɵɵnextContext(2).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); $event.preventDefault(); return i0.ɵɵresetView(ctx_r1.submitReply(comment_r5)); })("keydown.meta.enter", function NxsCommentsComponent_Conditional_2_For_5_Conditional_4_Conditional_3_Template_textarea_keydown_meta_enter_5_listener($event) { i0.ɵɵrestoreView(_r10); const comment_r5 = i0.ɵɵnextContext(2).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); $event.preventDefault(); return i0.ɵɵresetView(ctx_r1.submitReply(comment_r5)); });
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(7, NxsCommentsComponent_Conditional_2_For_5_Conditional_4_Conditional_3_Conditional_7_Template, 9, 10);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const comment_r5 = i0.ɵɵnextContext(2).$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 5, "satori-components.comments.reply-label"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("id", ctx_r1.id + "-reply-" + comment_r5.id)("placeholder", i0.ɵɵpipeBind1(6, 7, "satori-components.comments.write-reply"))("value", ctx_r1.replyText(comment_r5.id));
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.replyText(comment_r5.id).trim() ? 7 : -1);
} }
function NxsCommentsComponent_Conditional_2_For_5_Conditional_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 15);
    i0.ɵɵconditionalCreate(1, NxsCommentsComponent_Conditional_2_For_5_Conditional_4_Conditional_1_Template, 3, 6, "button", 7);
    i0.ɵɵconditionalCreate(2, NxsCommentsComponent_Conditional_2_For_5_Conditional_4_Conditional_2_Template, 3, 0, "ul", 17);
    i0.ɵɵconditionalCreate(3, NxsCommentsComponent_Conditional_2_For_5_Conditional_4_Conditional_3_Template, 8, 9, "div", 11);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const comment_r5 = i0.ɵɵnextContext().$implicit;
    const count_r6 = i0.ɵɵreadContextLet(0);
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.shownReplies(comment_r5.id).length < count_r6 ? 1 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(count_r6 > 0 ? 2 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(!ctx_r1.readOnly() ? 3 : -1);
} }
function NxsCommentsComponent_Conditional_2_For_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdeclareLet(0);
    i0.ɵɵelementStart(1, "li", 10);
    i0.ɵɵtemplate(2, NxsCommentsComponent_Conditional_2_For_5_ng_container_2_Template, 1, 0, "ng-container", 13);
    i0.ɵɵconditionalCreate(3, NxsCommentsComponent_Conditional_2_For_5_Conditional_3_Template, 4, 12, "button", 14);
    i0.ɵɵconditionalCreate(4, NxsCommentsComponent_Conditional_2_For_5_Conditional_4_Template, 4, 3, "div", 15);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const comment_r5 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    const entry_r9 = i0.ɵɵreference(4);
    const count_r12 = i0.ɵɵstoreLet(ctx_r1.repliesOf(comment_r5.id).length);
    const open_r13 = ctx_r1.opened().has(comment_r5.id);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngTemplateOutlet", entry_r9)("ngTemplateOutletContext", i0.ɵɵpureFunction1(5, _c2, comment_r5));
    i0.ɵɵadvance();
    i0.ɵɵconditional(count_r12 > 0 && !open_r13 ? 3 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(open_r13 ? 4 : -1);
} }
function NxsCommentsComponent_Conditional_2_Conditional_6_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    const _r15 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 21);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵlistener("click", function NxsCommentsComponent_Conditional_2_Conditional_6_Conditional_7_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r15); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.submitComment()); });
    i0.ɵɵelementStart(3, "mat-icon");
    i0.ɵɵtext(4, "check");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(5, "button", 22);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵlistener("click", function NxsCommentsComponent_Conditional_2_Conditional_6_Conditional_7_Template_button_click_5_listener() { i0.ɵɵrestoreView(_r15); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.newText.set("")); });
    i0.ɵɵelementStart(7, "mat-icon");
    i0.ɵɵtext(8, "close");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵproperty("disabled", ctx_r1.saving())("matTooltip", i0.ɵɵpipeBind1(1, 4, "satori-components.comments.submit-hint"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(2, 6, "satori-components.comments.submit-comment"));
    i0.ɵɵadvance(5);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(6, 8, "satori-components.comments.clear"));
} }
function NxsCommentsComponent_Conditional_2_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    const _r14 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 11)(1, "mat-form-field", 19)(2, "mat-label");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "textarea", 20);
    i0.ɵɵpipe(6, "translate");
    i0.ɵɵlistener("input", function NxsCommentsComponent_Conditional_2_Conditional_6_Template_textarea_input_5_listener($event) { i0.ɵɵrestoreView(_r14); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.newText.set(ctx_r1.textOf($event))); })("keydown.control.enter", function NxsCommentsComponent_Conditional_2_Conditional_6_Template_textarea_keydown_control_enter_5_listener($event) { i0.ɵɵrestoreView(_r14); const ctx_r1 = i0.ɵɵnextContext(2); $event.preventDefault(); return i0.ɵɵresetView(ctx_r1.submitComment()); })("keydown.meta.enter", function NxsCommentsComponent_Conditional_2_Conditional_6_Template_textarea_keydown_meta_enter_5_listener($event) { i0.ɵɵrestoreView(_r14); const ctx_r1 = i0.ɵɵnextContext(2); $event.preventDefault(); return i0.ɵɵresetView(ctx_r1.submitComment()); });
    i0.ɵɵelementEnd()();
    i0.ɵɵconditionalCreate(7, NxsCommentsComponent_Conditional_2_Conditional_6_Conditional_7_Template, 9, 10);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 5, "satori-components.comments.comment-label"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("id", ctx_r1.id + "-new")("placeholder", i0.ɵɵpipeBind1(6, 7, "satori-components.comments.write-comment"))("value", ctx_r1.newText());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.newText().trim() ? 7 : -1);
} }
function NxsCommentsComponent_Conditional_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵconditionalCreate(0, NxsCommentsComponent_Conditional_2_Conditional_0_Template, 3, 6, "button", 7);
    i0.ɵɵconditionalCreate(1, NxsCommentsComponent_Conditional_2_Conditional_1_Template, 3, 3, "p", 8);
    i0.ɵɵelementStart(2, "ul", 9);
    i0.ɵɵpipe(3, "translate");
    i0.ɵɵrepeaterCreate(4, NxsCommentsComponent_Conditional_2_For_5_Template, 5, 7, "li", 10, _forTrack0);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(6, NxsCommentsComponent_Conditional_2_Conditional_6_Template, 8, 9, "div", 11);
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵconditional(ctx_r1.hiddenCount() > 0 ? 0 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.comments().length === 0 ? 1 : -1);
    i0.ɵɵadvance();
    i0.ɵɵproperty("id", ctx_r1.id + "-list");
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(3, 5, "satori-components.comments.list"));
    i0.ɵɵadvance(2);
    i0.ɵɵrepeater(ctx_r1.shown());
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(!ctx_r1.readOnly() ? 6 : -1);
} }
function NxsCommentsComponent_ng_template_3_Conditional_6_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
    i0.ɵɵpipe(1, "translate");
} if (rf & 2) {
    const comment_r16 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind2(1, 1, "satori-components.comments.edited", i0.ɵɵpureFunction1(4, _c3, ctx_r1.when(comment_r16.creationDate))), " ");
} }
function NxsCommentsComponent_ng_template_3_Conditional_7_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtext(0);
} if (rf & 2) {
    const comment_r16 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵtextInterpolate1(" ", ctx_r1.when(comment_r16.creationDate), " ");
} }
function NxsCommentsComponent_ng_template_3_Conditional_8_Template(rf, ctx) { if (rf & 1) {
    const _r17 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 30);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵlistener("menuClosed", function NxsCommentsComponent_ng_template_3_Conditional_8_Template_button_menuClosed_0_listener() { i0.ɵɵrestoreView(_r17); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.menuClosed()); });
    i0.ɵɵelementStart(2, "mat-icon");
    i0.ɵɵtext(3, "more_vert");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(4, "mat-menu", null, 2)(6, "button", 31);
    i0.ɵɵlistener("click", function NxsCommentsComponent_ng_template_3_Conditional_8_Template_button_click_6_listener() { i0.ɵɵrestoreView(_r17); const ctx_r17 = i0.ɵɵnextContext(); const comment_r16 = ctx_r17.$implicit; const parent_r19 = ctx_r17.parent; const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.choose("edit", comment_r16, parent_r19)); });
    i0.ɵɵelementStart(7, "mat-icon");
    i0.ɵɵtext(8, "edit");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(9);
    i0.ɵɵpipe(10, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "button", 31);
    i0.ɵɵlistener("click", function NxsCommentsComponent_ng_template_3_Conditional_8_Template_button_click_11_listener() { i0.ɵɵrestoreView(_r17); const ctx_r17 = i0.ɵɵnextContext(); const comment_r16 = ctx_r17.$implicit; const parent_r19 = ctx_r17.parent; const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.choose("delete", comment_r16, parent_r19)); });
    i0.ɵɵelementStart(12, "mat-icon");
    i0.ɵɵtext(13, "delete");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(14);
    i0.ɵɵpipe(15, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const menu_r20 = i0.ɵɵreference(5);
    const comment_r16 = i0.ɵɵnextContext().$implicit;
    const isReply_r21 = i0.ɵɵreadContextLet(0);
    i0.ɵɵproperty("matMenuTriggerFor", menu_r20);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind2(1, 4, isReply_r21 ? "satori-components.comments.reply-actions" : "satori-components.comments.comment-actions", i0.ɵɵpureFunction1(11, _c5, comment_r16.author)));
    i0.ɵɵadvance(9);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(10, 7, "satori-components.comments.edit"), " ");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(15, 9, "satori-components.comments.delete"), " ");
} }
function NxsCommentsComponent_ng_template_3_Conditional_9_Template(rf, ctx) { if (rf & 1) {
    const _r22 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 27)(1, "mat-form-field", 19)(2, "mat-label");
    i0.ɵɵtext(3);
    i0.ɵɵpipe(4, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "textarea", 32);
    i0.ɵɵlistener("input", function NxsCommentsComponent_ng_template_3_Conditional_9_Template_textarea_input_5_listener($event) { i0.ɵɵrestoreView(_r22); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.editText.set(ctx_r1.textOf($event))); })("keydown.control.enter", function NxsCommentsComponent_ng_template_3_Conditional_9_Template_textarea_keydown_control_enter_5_listener($event) { i0.ɵɵrestoreView(_r22); const ctx_r17 = i0.ɵɵnextContext(); const comment_r16 = ctx_r17.$implicit; const parent_r19 = ctx_r17.parent; const ctx_r1 = i0.ɵɵnextContext(); $event.preventDefault(); return i0.ɵɵresetView(ctx_r1.saveEdit(comment_r16, parent_r19)); })("keydown.meta.enter", function NxsCommentsComponent_ng_template_3_Conditional_9_Template_textarea_keydown_meta_enter_5_listener($event) { i0.ɵɵrestoreView(_r22); const ctx_r17 = i0.ɵɵnextContext(); const comment_r16 = ctx_r17.$implicit; const parent_r19 = ctx_r17.parent; const ctx_r1 = i0.ɵɵnextContext(); $event.preventDefault(); return i0.ɵɵresetView(ctx_r1.saveEdit(comment_r16, parent_r19)); })("keydown.escape", function NxsCommentsComponent_ng_template_3_Conditional_9_Template_textarea_keydown_escape_5_listener() { i0.ɵɵrestoreView(_r22); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.cancelEdit()); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "button", 21);
    i0.ɵɵpipe(7, "translate");
    i0.ɵɵpipe(8, "translate");
    i0.ɵɵlistener("click", function NxsCommentsComponent_ng_template_3_Conditional_9_Template_button_click_6_listener() { i0.ɵɵrestoreView(_r22); const ctx_r17 = i0.ɵɵnextContext(); const comment_r16 = ctx_r17.$implicit; const parent_r19 = ctx_r17.parent; const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.saveEdit(comment_r16, parent_r19)); });
    i0.ɵɵelementStart(9, "mat-icon");
    i0.ɵɵtext(10, "check");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(11, "button", 22);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵlistener("click", function NxsCommentsComponent_ng_template_3_Conditional_9_Template_button_click_11_listener() { i0.ɵɵrestoreView(_r22); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.cancelEdit()); });
    i0.ɵɵelementStart(13, "mat-icon");
    i0.ɵɵtext(14, "close");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const comment_r16 = i0.ɵɵnextContext().$implicit;
    const isReply_r21 = i0.ɵɵreadContextLet(0);
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(i0.ɵɵpipeBind1(4, 7, isReply_r21 ? "satori-components.comments.edit-reply" : "satori-components.comments.edit-comment"));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("id", ctx_r1.id + "-edit-" + comment_r16.id)("value", ctx_r1.editText());
    i0.ɵɵadvance();
    i0.ɵɵproperty("disabled", ctx_r1.saving() || !ctx_r1.editText().trim())("matTooltip", i0.ɵɵpipeBind1(7, 9, "satori-components.comments.submit-hint"));
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(8, 11, "satori-components.comments.save"));
    i0.ɵɵadvance(5);
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind1(12, 13, "satori-components.comments.cancel"));
} }
function NxsCommentsComponent_ng_template_3_Conditional_10_Conditional_3_Template(rf, ctx) { if (rf & 1) {
    const _r23 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 35);
    i0.ɵɵlistener("click", function NxsCommentsComponent_ng_template_3_Conditional_10_Conditional_3_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r23); const comment_r16 = i0.ɵɵnextContext(2).$implicit; const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.showFullText(comment_r16)); });
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 1, "satori-components.comments.show-all"), " ");
} }
function NxsCommentsComponent_ng_template_3_Conditional_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "p", 28)(1, "span", 33);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(3, NxsCommentsComponent_ng_template_3_Conditional_10_Conditional_3_Template, 3, 3, "button", 34);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const comment_r16 = i0.ɵɵnextContext().$implicit;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.truncated(comment_r16) ? ctx_r1.shortText(comment_r16) : comment_r16.text);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.truncated(comment_r16) ? 3 : -1);
} }
function NxsCommentsComponent_ng_template_3_Conditional_11_ng_container_0_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementContainer(0);
} }
function NxsCommentsComponent_ng_template_3_Conditional_11_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵtemplate(0, NxsCommentsComponent_ng_template_3_Conditional_11_ng_container_0_Template, 1, 0, "ng-container", 13);
} if (rf & 2) {
    const comment_r16 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("ngTemplateOutlet", ctx.template)("ngTemplateOutletContext", i0.ɵɵpureFunction1(2, _c6, comment_r16));
} }
function NxsCommentsComponent_ng_template_3_Conditional_12_Template(rf, ctx) { if (rf & 1) {
    const _r24 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 36);
    i0.ɵɵpipe(1, "translate");
    i0.ɵɵlistener("click", function NxsCommentsComponent_ng_template_3_Conditional_12_Template_button_click_0_listener() { i0.ɵɵrestoreView(_r24); const comment_r16 = i0.ɵɵnextContext().$implicit; const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.openReplies(comment_r16.id, true)); });
    i0.ɵɵelementStart(2, "mat-icon", 37);
    i0.ɵɵtext(3, "reply");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const comment_r16 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵattribute("aria-label", i0.ɵɵpipeBind2(1, 2, "satori-components.comments.reply-to", i0.ɵɵpureFunction1(7, _c5, comment_r16.author)));
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 5, "satori-components.comments.reply"), " ");
} }
function NxsCommentsComponent_ng_template_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵdeclareLet(0);
    i0.ɵɵelementStart(1, "div", 23);
    i0.ɵɵelement(2, "nxs-avatar", 24);
    i0.ɵɵelementStart(3, "span", 25);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "time", 26);
    i0.ɵɵconditionalCreate(6, NxsCommentsComponent_ng_template_3_Conditional_6_Template, 2, 6)(7, NxsCommentsComponent_ng_template_3_Conditional_7_Template, 1, 1);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(8, NxsCommentsComponent_ng_template_3_Conditional_8_Template, 16, 13);
    i0.ɵɵelementEnd();
    i0.ɵɵconditionalCreate(9, NxsCommentsComponent_ng_template_3_Conditional_9_Template, 15, 15, "div", 27)(10, NxsCommentsComponent_ng_template_3_Conditional_10_Template, 4, 2, "p", 28);
    i0.ɵɵconditionalCreate(11, NxsCommentsComponent_ng_template_3_Conditional_11_Template, 1, 4, "ng-container");
    i0.ɵɵconditionalCreate(12, NxsCommentsComponent_ng_template_3_Conditional_12_Template, 6, 9, "button", 29);
} if (rf & 2) {
    let tmp_14_0;
    const comment_r16 = ctx.$implicit;
    const parent_r19 = ctx.parent;
    const ctx_r1 = i0.ɵɵnextContext();
    const isReply_r25 = i0.ɵɵstoreLet(parent_r19 !== null);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("initials", ctx_r1.initial(comment_r16.author))("color", ctx_r1.color(comment_r16.author))("size", isReply_r25 ? "24" : "28");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(comment_r16.author);
    i0.ɵɵadvance();
    i0.ɵɵattribute("datetime", comment_r16.creationDate);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.edited(comment_r16) ? 6 : 7);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional(ctx_r1.canModify(comment_r16) ? 8 : -1);
    i0.ɵɵadvance();
    i0.ɵɵconditional(ctx_r1.editing() === comment_r16.id ? 9 : 10);
    i0.ɵɵadvance(2);
    i0.ɵɵconditional((tmp_14_0 = ctx_r1.extra()) ? 11 : -1, tmp_14_0);
    i0.ɵɵadvance();
    i0.ɵɵconditional(!isReply_r25 && !ctx_r1.readOnly() ? 12 : -1);
} }
function NxsCommentsComponent_ng_template_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "h2", 38);
    i0.ɵɵtext(1);
    i0.ɵɵpipe(2, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "mat-dialog-content");
    i0.ɵɵtext(4);
    i0.ɵɵpipe(5, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "mat-dialog-actions", 39)(7, "button", 40);
    i0.ɵɵtext(8);
    i0.ɵɵpipe(9, "translate");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "button", 41);
    i0.ɵɵtext(11);
    i0.ɵɵpipe(12, "translate");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const data_r26 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(2, 5, data_r26.reply ? "satori-components.comments.delete-reply-title" : "satori-components.comments.delete-comment-title"), " ");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(5, 7, data_r26.reply ? "satori-components.comments.delete-reply-message" : data_r26.replies > 0 ? "satori-components.comments.delete-comment-with-replies" : "satori-components.comments.delete-comment-message"), " ");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(9, 9, "satori-components.comments.cancel"), " ");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("mat-dialog-close", true);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(12, 11, "satori-components.comments.delete"), " ");
} }
const text = (properties, key) => {
    const value = properties[key];
    return typeof value === 'string' ? value : '';
};
/** A `Comment` document as a comment, as the `@comment` endpoint would return it. */
const toComment = (entry, documentUid) => {
    const properties = entry.properties ?? {};
    const modified = text(properties, 'comment:modificationDate');
    return {
        id: entry.uid,
        parentId: text(properties, 'comment:parentId') || documentUid,
        text: text(properties, 'comment:text'),
        author: text(properties, 'comment:author'),
        creationDate: text(properties, 'comment:creationDate') || text(properties, 'dc:created'),
        ...(modified ? { modificationDate: modified } : {}),
    };
};
/**
 * Splits a document's comments into top-level comments and their replies. A reply to a reply,
 * which Web UI never writes but the API accepts, is listed under the top-level comment it hangs
 * from; one whose parent is not in the list is left out rather than shown out of place.
 */
const toThread = (list, documentUid) => {
    const all = (list.entries ?? []).map((entry) => toComment(entry, documentUid));
    const byId = new Map(all.map((comment) => [comment.id, comment]));
    const replies = {};
    for (const comment of all) {
        if (comment.parentId === documentUid)
            continue;
        let root = byId.get(comment.parentId);
        const seen = new Set([comment.id]);
        while (root && root.parentId !== documentUid && !seen.has(root.id)) {
            seen.add(root.id);
            root = byId.get(root.parentId);
        }
        if (!root || root.parentId !== documentUid)
            continue;
        (replies[root.id] ??= []).push(comment);
    }
    return { comments: all.filter((comment) => comment.parentId === documentUid), replies };
};
let nextId = 0;
/**
 * A document's comments and their replies — Web UI's `nuxeo-document-comment-thread`.
 *
 * It reads and writes the thread itself through `DocumentDetailService`. As in Web UI:
 *
 * - The newest `pageSize` comments show, oldest first, under a "View all" button for the rest.
 * - Anyone who can read the document is offered the comment box; Nuxeo decides whether the comment
 *   is accepted. `readOnly` takes the box and the actions away.
 * - Edit and Delete are offered to the comment's author and to administrators only. Delete asks
 *   first, and says so when the replies go with it.
 * - Only a top-level comment takes replies. Its replies stay folded behind a count until opened.
 * - Ctrl+Enter submits; a comment longer than `maxChars` is cut short behind "Show all".
 *
 * `threadChange` hands the loaded comments and replies to the host, and a projected
 * `[nxsCommentExtra]` template renders under each one.
 */
export class NxsCommentsComponent {
    documents = inject(DocumentDetailService);
    translate = inject(TranslateService);
    toast = inject(NxsToastService);
    dialog = inject(MatDialog);
    username = inject(CURRENT_USERNAME);
    admin = inject(ADMIN_ACCESS_CHECKS);
    destroyRef = inject(DestroyRef);
    injector = inject(Injector);
    host = inject(ElementRef);
    /** The commented document. Changing it loads that document's thread. */
    documentUid = input.required(...(ngDevMode ? [{ debugName: "documentUid" }] : []));
    /** Shows the thread without the comment box, Reply, Edit or Delete. */
    readOnly = input(false, ...(ngDevMode ? [{ debugName: "readOnly" }] : []));
    /** How many of the newest comments, and of each comment's newest replies, show at first. */
    pageSize = input(10, ...(ngDevMode ? [{ debugName: "pageSize", transform: numberAttribute }] : [{ transform: numberAttribute }]));
    /** Longer comments are cut short behind "Show all". */
    maxChars = input(256, ...(ngDevMode ? [{ debugName: "maxChars", transform: numberAttribute }] : [{ transform: numberAttribute }]));
    /** Every loaded comment and reply, after the thread loads and after each change to it. */
    threadChange = output();
    extra = contentChild(NxsCommentExtraDirective, ...(ngDevMode ? [{ debugName: "extra" }] : []));
    deleteDialog = viewChild.required('deleteConfirmation');
    id = `nxs-comments-${nextId++}`;
    loading = signal(true, ...(ngDevMode ? [{ debugName: "loading" }] : []));
    failed = signal(false, ...(ngDevMode ? [{ debugName: "failed" }] : []));
    saving = signal(false, ...(ngDevMode ? [{ debugName: "saving" }] : []));
    comments = signal([], ...(ngDevMode ? [{ debugName: "comments" }] : []));
    replies = signal({}, ...(ngDevMode ? [{ debugName: "replies" }] : []));
    allShown = signal(false, ...(ngDevMode ? [{ debugName: "allShown" }] : []));
    opened = signal(new Set(), ...(ngDevMode ? [{ debugName: "opened" }] : []));
    allRepliesShown = signal(new Set(), ...(ngDevMode ? [{ debugName: "allRepliesShown" }] : []));
    fullText = signal(new Set(), ...(ngDevMode ? [{ debugName: "fullText" }] : []));
    editing = signal(null, ...(ngDevMode ? [{ debugName: "editing" }] : []));
    editText = signal('', ...(ngDevMode ? [{ debugName: "editText" }] : []));
    newText = signal('', ...(ngDevMode ? [{ debugName: "newText" }] : []));
    replyTexts = signal({}, ...(ngDevMode ? [{ debugName: "replyTexts" }] : []));
    shown = computed(() => this.allShown() ? this.comments() : this.comments().slice(-this.pageSize()), ...(ngDevMode ? [{ debugName: "shown" }] : []));
    hiddenCount = computed(() => this.comments().length - this.shown().length, ...(ngDevMode ? [{ debugName: "hiddenCount" }] : []));
    reloads = new Subject();
    menuChoice = null;
    constructor() {
        toObservable(this.documentUid)
            .pipe(tap(() => this.reset()), switchMap((uid) => merge(of(undefined), this.reloads).pipe(switchMap(() => this.fetch(uid)))), takeUntilDestroyed())
            .subscribe((thread) => {
            this.loading.set(false);
            if (!thread) {
                this.failed.set(true);
                return;
            }
            this.comments.set(thread.comments);
            this.replies.set(thread.replies);
            this.changed();
        });
    }
    /** Loads the thread again, keeping what is being typed. */
    reload() {
        this.reloads.next();
    }
    repliesOf(id) {
        return this.replies()[id] ?? [];
    }
    shownReplies(id) {
        const replies = this.repliesOf(id);
        return this.allRepliesShown().has(id) ? replies : replies.slice(-this.pageSize());
    }
    lastReply(id) {
        const replies = this.repliesOf(id);
        return replies.length ? this.when(replies[replies.length - 1].creationDate) : '';
    }
    /** Web UI's rule: the author, by username, or an administrator. */
    canModify(comment) {
        if (this.readOnly())
            return false;
        const user = this.username();
        return (!!user && comment.author === user) || this.admin.isAdministrator();
    }
    initial(author) {
        return nxsInitial(author);
    }
    color(author) {
        return avatarColor(author);
    }
    when(date) {
        return date ? formatRelativeTime(date, this.translate.currentLang) : '';
    }
    /**
     * Nuxeo 2025 stamps `comment:modificationDate` with the creation date when a comment is made, so
     * Web UI's "set at all" test would mark every comment edited; a later date is an edit.
     */
    edited(comment) {
        return !!comment.modificationDate && comment.modificationDate !== comment.creationDate;
    }
    truncated(comment) {
        return !this.fullText().has(comment.id) && comment.text.length > this.maxChars();
    }
    shortText(comment) {
        return `${comment.text.slice(0, this.maxChars() - 1)}…`;
    }
    showFullText(comment) {
        this.fullText.update((ids) => new Set(ids).add(comment.id));
    }
    showAllReplies(id) {
        this.allRepliesShown.update((ids) => new Set(ids).add(id));
    }
    textOf(event) {
        return event.target.value;
    }
    setReplyText(id, value) {
        this.replyTexts.update((texts) => ({ ...texts, [id]: value }));
    }
    replyText(id) {
        return this.replyTexts()[id] ?? '';
    }
    /** Opens a comment's replies; from Reply, also puts the cursor in the reply box. */
    openReplies(id, focusBox = false) {
        this.opened.update((ids) => new Set(ids).add(id));
        if (focusBox)
            this.focus(`${this.id}-reply-${id}`);
    }
    submitComment() {
        const value = this.newText().trim();
        if (!value || this.saving())
            return;
        const uid = this.documentUid();
        this.save(this.documents.createComment(uid, value), 'add', false, (comment) => {
            this.comments.update((list) => [...list, { ...comment, parentId: uid }]);
            this.newText.set('');
        });
    }
    submitReply(parent) {
        const value = this.replyText(parent.id).trim();
        if (!value || this.saving())
            return;
        this.save(this.documents.createReply(this.documentUid(), parent.id, value), 'add', true, (reply) => {
            this.replies.update((map) => ({
                ...map,
                [parent.id]: [...(map[parent.id] ?? []), { ...reply, parentId: parent.id }],
            }));
            this.setReplyText(parent.id, '');
        });
    }
    choose(action, comment, parent) {
        this.menuChoice = { action, comment, parent };
    }
    /**
     * Runs the chosen item once the menu has closed and handed focus back to its button — otherwise
     * that hand-back takes the cursor out of the edit box, and the delete dialog, opened from an item
     * that no longer exists, has nowhere to return focus on Cancel.
     */
    menuClosed() {
        const choice = this.menuChoice;
        this.menuChoice = null;
        if (choice?.action === 'edit')
            this.startEdit(choice.comment);
        else if (choice)
            this.confirmDelete(choice.comment, choice.parent);
    }
    startEdit(comment) {
        this.editing.set(comment.id);
        this.editText.set(comment.text);
        this.focus(`${this.id}-edit-${comment.id}`);
    }
    cancelEdit() {
        this.editing.set(null);
        this.editText.set('');
    }
    saveEdit(comment, parent) {
        const value = this.editText().trim();
        if (!value || this.saving())
            return;
        if (value === comment.text) {
            this.cancelEdit();
            return;
        }
        this.save(this.documents.updateComment(this.documentUid(), comment.id, value), 'edit', parent !== null, (updated) => {
            const merged = { ...comment, ...updated, parentId: comment.parentId };
            if (parent) {
                this.replies.update((map) => ({
                    ...map,
                    [parent.id]: (map[parent.id] ?? []).map((r) => (r.id === comment.id ? merged : r)),
                }));
            }
            else {
                this.comments.update((list) => list.map((c) => (c.id === comment.id ? merged : c)));
            }
            this.cancelEdit();
        });
    }
    confirmDelete(comment, parent) {
        const data = {
            reply: parent !== null,
            replies: parent ? 0 : this.repliesOf(comment.id).length,
        };
        this.dialog
            .open(this.deleteDialog(), { data, role: 'alertdialog', width: '400px', maxWidth: '95vw' })
            .afterClosed()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((confirmed) => {
            if (confirmed === true)
                this.remove(comment, parent);
        });
    }
    remove(comment, parent) {
        this.save(this.documents.deleteComment(this.documentUid(), comment.id), 'delete', parent !== null, () => {
            if (parent) {
                this.replies.update((map) => ({
                    ...map,
                    [parent.id]: (map[parent.id] ?? []).filter((r) => r.id !== comment.id),
                }));
            }
            else {
                this.comments.update((list) => list.filter((c) => c.id !== comment.id));
                this.replies.update((map) => {
                    const { [comment.id]: _removed, ...rest } = map;
                    return rest;
                });
            }
            // The comment's menu button went with it; the list keeps the focus inside the panel.
            this.focus(`${this.id}-list`);
        });
    }
    save(request, action, reply, done) {
        this.saving.set(true);
        request
            .pipe(finalize(() => this.saving.set(false)), takeUntilDestroyed(this.destroyRef))
            .subscribe({
            next: (result) => {
                done(result);
                this.changed();
            },
            error: (failure) => this.failedTo(action, reply, failure),
        });
    }
    /**
     * A refusal reads as one, and a comment someone else removed reloads the thread — Web UI says
     * "may not be available anymore" and leaves the stale entry on screen.
     */
    failedTo(action, reply, failure) {
        const status = failure instanceof HttpErrorResponse ? failure.status : 0;
        const noun = reply ? 'reply' : 'comment';
        if (status === 403 || status === 401) {
            this.toast.error(this.translate.instant(`satori-components.comments.error.forbidden-${action}`));
        }
        else if (status === 404 && (action !== 'add' || reply)) {
            // A 404 on a new top-level comment is the document itself, which this thread cannot fix;
            // on a new reply it is the comment replied to.
            const gone = action === 'add' ? 'comment' : noun;
            this.toast.error(this.translate.instant(`satori-components.comments.error.not-found-${gone}`));
            this.reload();
        }
        else {
            this.toast.error(this.translate.instant(`satori-components.comments.error.${action}-${noun}`));
        }
    }
    fetch(uid) {
        this.loading.set(true);
        this.failed.set(false);
        return this.documents.getAllComments(uid).pipe(map((list) => toThread(list, uid)), catchError(() => of(null)));
    }
    reset() {
        this.loading.set(true);
        this.failed.set(false);
        this.comments.set([]);
        this.replies.set({});
        this.allShown.set(false);
        this.opened.set(new Set());
        this.allRepliesShown.set(new Set());
        this.fullText.set(new Set());
        this.cancelEdit();
        this.newText.set('');
        this.replyTexts.set({});
    }
    changed() {
        this.threadChange.emit([...this.comments(), ...Object.values(this.replies()).flat()]);
    }
    focus(elementId) {
        afterNextRender(() => this.host.nativeElement.querySelector(`[id="${elementId}"]`)?.focus(), { injector: this.injector });
    }
    static ɵfac = function NxsCommentsComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || NxsCommentsComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: NxsCommentsComponent, selectors: [["nxs-comments"]], contentQueries: function NxsCommentsComponent_ContentQueries(rf, ctx, dirIndex) { if (rf & 1) {
            i0.ɵɵcontentQuerySignal(dirIndex, ctx.extra, NxsCommentExtraDirective, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, viewQuery: function NxsCommentsComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuerySignal(ctx.deleteDialog, _c0, 5);
        } if (rf & 2) {
            i0.ɵɵqueryAdvance();
        } }, hostAttrs: [1, "nxs-comments"], inputs: { documentUid: [1, "documentUid"], readOnly: [1, "readOnly"], pageSize: [1, "pageSize"], maxChars: [1, "maxChars"] }, outputs: { threadChange: "threadChange" }, features: [i0.ɵɵProvidersFeature([provideNxsToast()])], decls: 7, vars: 1, consts: [["entry", ""], ["deleteConfirmation", ""], ["menu", "matMenu"], [1, "nxs-comments__loading"], ["role", "alert", 1, "nxs-comments__failed"], ["diameter", "28", 3, "label"], ["mat-button", "", "type", "button", 3, "click"], ["type", "button", 1, "nxs-comments__more"], [1, "nxs-comments__empty"], ["tabindex", "-1", 1, "nxs-comments__list", 3, "id"], [1, "nxs-comments__comment"], [1, "nxs-comments__composer"], ["type", "button", 1, "nxs-comments__more", 3, "click"], [4, "ngTemplateOutlet", "ngTemplateOutletContext"], ["type", "button", "aria-expanded", "false", 1, "nxs-comments__summary"], [1, "nxs-comments__replies"], ["type", "button", "aria-expanded", "false", 1, "nxs-comments__summary", 3, "click"], [1, "nxs-comments__list"], [1, "nxs-comments__comment", "nxs-comments__comment--reply"], ["appearance", "outline", "subscriptSizing", "dynamic"], ["matInput", "", "cdkTextareaAutosize", "", "cdkAutosizeMinRows", "1", "cdkAutosizeMaxRows", "4", "aria-keyshortcuts", "Control+Enter", 3, "input", "keydown.control.enter", "keydown.meta.enter", "id", "placeholder", "value"], ["mat-icon-button", "", "type", "button", 3, "click", "disabled", "matTooltip"], ["mat-icon-button", "", "type", "button", 3, "click"], [1, "nxs-comments__header"], [3, "initials", "color", "size"], [1, "nxs-comments__author"], [1, "nxs-comments__time"], [1, "nxs-comments__composer", "nxs-comments__composer--edit"], [1, "nxs-comments__text"], ["type", "button", 1, "nxs-comments__reply"], ["mat-icon-button", "", "type", "button", 1, "nxs-comments__menu", 3, "menuClosed", "matMenuTriggerFor"], ["mat-menu-item", "", "type", "button", 3, "click"], ["matInput", "", "cdkTextareaAutosize", "", "cdkAutosizeMinRows", "1", "cdkAutosizeMaxRows", "4", "aria-keyshortcuts", "Control+Enter", 3, "input", "keydown.control.enter", "keydown.meta.enter", "keydown.escape", "id", "value"], [1, "nxs-comments__body"], ["type", "button", 1, "nxs-comments__show-all"], ["type", "button", 1, "nxs-comments__show-all", 3, "click"], ["type", "button", 1, "nxs-comments__reply", 3, "click"], ["aria-hidden", "true"], ["mat-dialog-title", ""], ["align", "end"], ["mat-button", "", "type", "button", "mat-dialog-close", ""], ["mat-flat-button", "", "type", "button", 3, "mat-dialog-close"]], template: function NxsCommentsComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵconditionalCreate(0, NxsCommentsComponent_Conditional_0_Template, 3, 3, "div", 3)(1, NxsCommentsComponent_Conditional_1_Template, 7, 6, "div", 4)(2, NxsCommentsComponent_Conditional_2_Template, 7, 7);
            i0.ɵɵtemplate(3, NxsCommentsComponent_ng_template_3_Template, 13, 11, "ng-template", null, 0, i0.ɵɵtemplateRefExtractor)(5, NxsCommentsComponent_ng_template_5_Template, 13, 13, "ng-template", null, 1, i0.ɵɵtemplateRefExtractor);
        } if (rf & 2) {
            i0.ɵɵconditional(ctx.loading() ? 0 : ctx.failed() ? 1 : 2);
        } }, dependencies: [CdkTextareaAutosize,
            NgTemplateOutlet,
            MatButton,
            MatDialogActions,
            MatDialogClose,
            MatDialogContent,
            MatDialogTitle,
            MatFormField,
            MatIcon,
            MatIconButton,
            MatInput,
            MatLabel,
            MatMenu,
            MatMenuItem,
            MatMenuTrigger,
            MatTooltip,
            NxsAvatarComponent,
            NxsSpinnerComponent,
            TranslatePipe], styles: ["[_nghost-%COMP%] {\n  --nxs-comments-text: var(--mat-sys-on-surface);\n  --nxs-comments-muted: var(--mat-sys-on-surface-variant);\n  --nxs-comments-link: var(--mat-sys-primary);\n  --nxs-comments-divider: var(--mat-sys-outline-variant);\n  display: block;\n  font-size: 13px;\n  color: var(--nxs-comments-text);\n}\n\n.nxs-comments__loading[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: center;\n  padding: 24px 0;\n}\n\n.nxs-comments__failed[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n  padding: 12px 0;\n}\n\n//   Paragraph   margins   are   scoped   to   the   host:   the   theme's   `.mat-typography   p`   outranks   a   single   class.\n[_nghost-%COMP%]   .nxs-comments__failed[_ngcontent-%COMP%]   p[_ngcontent-%COMP%] {\n  margin: 0;\n}\n\n[_nghost-%COMP%]   .nxs-comments__empty[_ngcontent-%COMP%] {\n  margin: 12px 0;\n  color: var(--nxs-comments-muted);\n}\n\n.nxs-comments__list[_ngcontent-%COMP%] {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n\n  &:focus {\n    outline: none;\n  }\n}\n\n.nxs-comments__comment[_ngcontent-%COMP%] {\n  padding: 12px 0;\n  border-bottom: 1px solid var(--nxs-comments-divider);\n\n  &--reply {\n    padding: 8px 0;\n    border-bottom: none;\n  }\n}\n\n.nxs-comments__header[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  min-height: 32px;\n}\n\n.nxs-comments__author[_ngcontent-%COMP%] {\n  font-weight: 500;\n  overflow-wrap: anywhere;\n}\n\n.nxs-comments__time[_ngcontent-%COMP%] {\n  font-size: 12px;\n  color: var(--nxs-comments-muted);\n}\n\n.nxs-comments__menu[_ngcontent-%COMP%] {\n  margin-inline-start: auto;\n}\n\n[_nghost-%COMP%]   .nxs-comments__text[_ngcontent-%COMP%] {\n  margin-block: 4px 0;\n  margin-inline: 36px 0;\n  overflow-wrap: anywhere;\n  line-height: 1.5;\n}\n\n[_nghost-%COMP%]   .nxs-comments__comment--reply[_ngcontent-%COMP%]   .nxs-comments__text[_ngcontent-%COMP%] {\n  margin-inline-start: 32px;\n}\n\n.nxs-comments__body[_ngcontent-%COMP%] {\n  white-space: pre-wrap;\n}\n\n.nxs-comments__replies[_ngcontent-%COMP%] {\n  margin-block: 8px 0;\n  margin-inline: 36px 0;\n  padding-inline-start: 12px;\n  border-inline-start: 2px solid var(--nxs-comments-divider);\n}\n\n//[_ngcontent-%COMP%]   Text[_ngcontent-%COMP%]   buttons[_ngcontent-%COMP%]   that[_ngcontent-%COMP%]   read[_ngcontent-%COMP%]   as[_ngcontent-%COMP%]   links:[_ngcontent-%COMP%]   \"View[_ngcontent-%COMP%]   all\",[_ngcontent-%COMP%]   \"Show[_ngcontent-%COMP%]   all\",[_ngcontent-%COMP%]   \"Reply\",[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   reply[_ngcontent-%COMP%]   count.\n.nxs-comments__more,\n.nxs-comments__show-all,\n.nxs-comments__reply,\n.nxs-comments__summary[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 4px 0;\n  border: none;\n  background: none;\n  font: inherit;\n  font-size: 12px;\n  color: var(--nxs-comments-link);\n  cursor: pointer;\n\n  &:hover {\n    text-decoration: underline;\n  }\n\n  &:focus-visible {\n    outline: 2px solid var(--nxs-comments-link);\n    outline-offset: 2px;\n    border-radius: 2px;\n  }\n}\n\n//[_ngcontent-%COMP%]   IBM[_ngcontent-%COMP%]   Equal[_ngcontent-%COMP%]   Access's[_ngcontent-%COMP%]   style_focus_visible[_ngcontent-%COMP%]   reads[_ngcontent-%COMP%]   `[_ngcontent-%COMP%]:focus`   only[_ngcontent-%COMP%]   and[_ngcontent-%COMP%]   resolves[_ngcontent-%COMP%]   no[_ngcontent-%COMP%]   selector[_ngcontent-%COMP%]   list[_ngcontent-%COMP%], so\n//[_ngcontent-%COMP%]   each[_ngcontent-%COMP%]   of[_ngcontent-%COMP%]   these[_ngcontent-%COMP%]   controls[_ngcontent-%COMP%]   gets[_ngcontent-%COMP%]   its[_ngcontent-%COMP%]   own[_ngcontent-%COMP%]   `[_ngcontent-%COMP%]:focus`   rule[_ngcontent-%COMP%]   (NXSAT-547).\n@each[_ngcontent-%COMP%]   $control[_ngcontent-%COMP%]   in[_ngcontent-%COMP%]   more[_ngcontent-%COMP%], show-all[_ngcontent-%COMP%], reply[_ngcontent-%COMP%], summary[_ngcontent-%COMP%] {\n  .nxs-comments__#{$control}:focus {\n    outline: 2px solid var(--nxs-comments-link);\n    outline-offset: 2px;\n    border-radius: 2px;\n  }\n}\n\n.nxs-comments__more[_ngcontent-%COMP%] {\n  margin-block: 8px 0;\n}\n\n.nxs-comments__reply[_ngcontent-%COMP%], \n.nxs-comments__summary[_ngcontent-%COMP%] {\n  margin-block: 4px 0;\n  margin-inline: 36px 0;\n\n  mat-icon {\n    width: 16px;\n    height: 16px;\n    font-size: 16px;\n  }\n}\n\n.nxs-comments__show-all[_ngcontent-%COMP%] {\n  padding: 0;\n  margin-inline-start: 4px;\n}\n\n.nxs-comments__composer[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: flex-start;\n  gap: 4px;\n  margin-top: 12px;\n\n  mat-form-field {\n    flex: 1;\n    min-width: 0;\n  }\n\n  &--edit {\n    margin-block: 4px 0;\n    margin-inline: 36px 0;\n  }\n}\n\n.nxs-comments__replies[_ngcontent-%COMP%]   .nxs-comments__composer[_ngcontent-%COMP%] {\n  margin-top: 8px;\n}"], changeDetection: 0 });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(NxsCommentsComponent, [{
        type: Component,
        args: [{ selector: 'nxs-comments', standalone: true, imports: [
                    CdkTextareaAutosize,
                    NgTemplateOutlet,
                    MatButton,
                    MatDialogActions,
                    MatDialogClose,
                    MatDialogContent,
                    MatDialogTitle,
                    MatFormField,
                    MatIcon,
                    MatIconButton,
                    MatInput,
                    MatLabel,
                    MatMenu,
                    MatMenuItem,
                    MatMenuTrigger,
                    MatTooltip,
                    TranslatePipe,
                    NxsAvatarComponent,
                    NxsSpinnerComponent,
                ], providers: [provideNxsToast()], changeDetection: ChangeDetectionStrategy.OnPush, host: { class: 'nxs-comments' }, template: "@if (loading()) {\n  <div class=\"nxs-comments__loading\">\n    <nxs-spinner diameter=\"28\" [label]=\"'satori-components.comments.loading' | translate\" />\n  </div>\n} @else if (failed()) {\n  <div class=\"nxs-comments__failed\" role=\"alert\">\n    <p>{{ 'satori-components.comments.load-failed' | translate }}</p>\n    <button mat-button type=\"button\" (click)=\"reload()\">\n      {{ 'satori-components.comments.retry' | translate }}\n    </button>\n  </div>\n} @else {\n  @if (hiddenCount() > 0) {\n    <button class=\"nxs-comments__more\" type=\"button\" (click)=\"allShown.set(true)\">\n      {{ 'satori-components.comments.view-all-comments' | translate: { count: comments().length } }}\n    </button>\n  }\n  @if (comments().length === 0) {\n    <p class=\"nxs-comments__empty\">{{ 'satori-components.comments.empty' | translate }}</p>\n  }\n  <ul\n    class=\"nxs-comments__list\"\n    tabindex=\"-1\"\n    [id]=\"id + '-list'\"\n    [attr.aria-label]=\"'satori-components.comments.list' | translate\"\n  >\n    @for (comment of shown(); track comment.id) {\n      @let count = repliesOf(comment.id).length;\n      @let open = opened().has(comment.id);\n      <li class=\"nxs-comments__comment\">\n        <ng-container *ngTemplateOutlet=\"entry; context: { $implicit: comment, parent: null }\" />\n        @if (count > 0 && !open) {\n          <button\n            class=\"nxs-comments__summary\"\n            type=\"button\"\n            aria-expanded=\"false\"\n            (click)=\"openReplies(comment.id)\"\n          >\n            {{\n              (count === 1\n                ? 'satori-components.comments.replies-one'\n                : 'satori-components.comments.replies-other'\n              ) | translate: { count }\n            }}\n            \u00B7\n            {{\n              'satori-components.comments.last-reply' | translate: { time: lastReply(comment.id) }\n            }}\n          </button>\n        }\n        @if (open) {\n          <div class=\"nxs-comments__replies\">\n            @if (shownReplies(comment.id).length < count) {\n              <button class=\"nxs-comments__more\" type=\"button\" (click)=\"showAllReplies(comment.id)\">\n                {{ 'satori-components.comments.view-all-replies' | translate: { count } }}\n              </button>\n            }\n            @if (count > 0) {\n              <ul class=\"nxs-comments__list\">\n                @for (reply of shownReplies(comment.id); track reply.id) {\n                  <li class=\"nxs-comments__comment nxs-comments__comment--reply\">\n                    <ng-container\n                      *ngTemplateOutlet=\"entry; context: { $implicit: reply, parent: comment }\"\n                    />\n                  </li>\n                }\n              </ul>\n            }\n            @if (!readOnly()) {\n              <div class=\"nxs-comments__composer\">\n                <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\">\n                  <mat-label>{{ 'satori-components.comments.reply-label' | translate }}</mat-label>\n                  <textarea\n                    matInput\n                    cdkTextareaAutosize\n                    cdkAutosizeMinRows=\"1\"\n                    cdkAutosizeMaxRows=\"4\"\n                    aria-keyshortcuts=\"Control+Enter\"\n                    [id]=\"id + '-reply-' + comment.id\"\n                    [placeholder]=\"'satori-components.comments.write-reply' | translate\"\n                    [value]=\"replyText(comment.id)\"\n                    (input)=\"setReplyText(comment.id, textOf($event))\"\n                    (keydown.control.enter)=\"$event.preventDefault(); submitReply(comment)\"\n                    (keydown.meta.enter)=\"$event.preventDefault(); submitReply(comment)\"\n                  ></textarea>\n                </mat-form-field>\n                @if (replyText(comment.id).trim()) {\n                  <button\n                    mat-icon-button\n                    type=\"button\"\n                    [disabled]=\"saving()\"\n                    [attr.aria-label]=\"'satori-components.comments.submit-reply' | translate\"\n                    [matTooltip]=\"'satori-components.comments.submit-hint' | translate\"\n                    (click)=\"submitReply(comment)\"\n                  >\n                    <mat-icon>check</mat-icon>\n                  </button>\n                  <button\n                    mat-icon-button\n                    type=\"button\"\n                    [attr.aria-label]=\"'satori-components.comments.clear' | translate\"\n                    (click)=\"setReplyText(comment.id, '')\"\n                  >\n                    <mat-icon>close</mat-icon>\n                  </button>\n                }\n              </div>\n            }\n          </div>\n        }\n      </li>\n    }\n  </ul>\n  @if (!readOnly()) {\n    <div class=\"nxs-comments__composer\">\n      <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\">\n        <mat-label>{{ 'satori-components.comments.comment-label' | translate }}</mat-label>\n        <textarea\n          matInput\n          cdkTextareaAutosize\n          cdkAutosizeMinRows=\"1\"\n          cdkAutosizeMaxRows=\"4\"\n          aria-keyshortcuts=\"Control+Enter\"\n          [id]=\"id + '-new'\"\n          [placeholder]=\"'satori-components.comments.write-comment' | translate\"\n          [value]=\"newText()\"\n          (input)=\"newText.set(textOf($event))\"\n          (keydown.control.enter)=\"$event.preventDefault(); submitComment()\"\n          (keydown.meta.enter)=\"$event.preventDefault(); submitComment()\"\n        ></textarea>\n      </mat-form-field>\n      @if (newText().trim()) {\n        <button\n          mat-icon-button\n          type=\"button\"\n          [disabled]=\"saving()\"\n          [attr.aria-label]=\"'satori-components.comments.submit-comment' | translate\"\n          [matTooltip]=\"'satori-components.comments.submit-hint' | translate\"\n          (click)=\"submitComment()\"\n        >\n          <mat-icon>check</mat-icon>\n        </button>\n        <button\n          mat-icon-button\n          type=\"button\"\n          [attr.aria-label]=\"'satori-components.comments.clear' | translate\"\n          (click)=\"newText.set('')\"\n        >\n          <mat-icon>close</mat-icon>\n        </button>\n      }\n    </div>\n  }\n}\n\n<ng-template #entry let-comment let-parent=\"parent\">\n  @let isReply = parent !== null;\n  <div class=\"nxs-comments__header\">\n    <nxs-avatar\n      [initials]=\"initial(comment.author)\"\n      [color]=\"color(comment.author)\"\n      [size]=\"isReply ? '24' : '28'\"\n    />\n    <span class=\"nxs-comments__author\">{{ comment.author }}</span>\n    <time class=\"nxs-comments__time\" [attr.datetime]=\"comment.creationDate\">\n      @if (edited(comment)) {\n        {{ 'satori-components.comments.edited' | translate: { time: when(comment.creationDate) } }}\n      } @else {\n        {{ when(comment.creationDate) }}\n      }\n    </time>\n    @if (canModify(comment)) {\n      <button\n        mat-icon-button\n        type=\"button\"\n        class=\"nxs-comments__menu\"\n        [matMenuTriggerFor]=\"menu\"\n        (menuClosed)=\"menuClosed()\"\n        [attr.aria-label]=\"\n          (isReply\n            ? 'satori-components.comments.reply-actions'\n            : 'satori-components.comments.comment-actions'\n          ) | translate: { author: comment.author }\n        \"\n      >\n        <mat-icon>more_vert</mat-icon>\n      </button>\n      <mat-menu #menu=\"matMenu\">\n        <button mat-menu-item type=\"button\" (click)=\"choose('edit', comment, parent)\">\n          <mat-icon>edit</mat-icon>\n          {{ 'satori-components.comments.edit' | translate }}\n        </button>\n        <button mat-menu-item type=\"button\" (click)=\"choose('delete', comment, parent)\">\n          <mat-icon>delete</mat-icon>\n          {{ 'satori-components.comments.delete' | translate }}\n        </button>\n      </mat-menu>\n    }\n  </div>\n  @if (editing() === comment.id) {\n    <div class=\"nxs-comments__composer nxs-comments__composer--edit\">\n      <mat-form-field appearance=\"outline\" subscriptSizing=\"dynamic\">\n        <mat-label>{{\n          (isReply\n            ? 'satori-components.comments.edit-reply'\n            : 'satori-components.comments.edit-comment'\n          ) | translate\n        }}</mat-label>\n        <textarea\n          matInput\n          cdkTextareaAutosize\n          cdkAutosizeMinRows=\"1\"\n          cdkAutosizeMaxRows=\"4\"\n          aria-keyshortcuts=\"Control+Enter\"\n          [id]=\"id + '-edit-' + comment.id\"\n          [value]=\"editText()\"\n          (input)=\"editText.set(textOf($event))\"\n          (keydown.control.enter)=\"$event.preventDefault(); saveEdit(comment, parent)\"\n          (keydown.meta.enter)=\"$event.preventDefault(); saveEdit(comment, parent)\"\n          (keydown.escape)=\"cancelEdit()\"\n        ></textarea>\n      </mat-form-field>\n      <button\n        mat-icon-button\n        type=\"button\"\n        [disabled]=\"saving() || !editText().trim()\"\n        [attr.aria-label]=\"'satori-components.comments.save' | translate\"\n        [matTooltip]=\"'satori-components.comments.submit-hint' | translate\"\n        (click)=\"saveEdit(comment, parent)\"\n      >\n        <mat-icon>check</mat-icon>\n      </button>\n      <button\n        mat-icon-button\n        type=\"button\"\n        [attr.aria-label]=\"'satori-components.comments.cancel' | translate\"\n        (click)=\"cancelEdit()\"\n      >\n        <mat-icon>close</mat-icon>\n      </button>\n    </div>\n  } @else {\n    <p class=\"nxs-comments__text\">\n      <span class=\"nxs-comments__body\">{{\n        truncated(comment) ? shortText(comment) : comment.text\n      }}</span>\n      @if (truncated(comment)) {\n        <button class=\"nxs-comments__show-all\" type=\"button\" (click)=\"showFullText(comment)\">\n          {{ 'satori-components.comments.show-all' | translate }}\n        </button>\n      }\n    </p>\n  }\n  @if (extra(); as projected) {\n    <ng-container *ngTemplateOutlet=\"projected.template; context: { $implicit: comment }\" />\n  }\n  @if (!isReply && !readOnly()) {\n    <button\n      class=\"nxs-comments__reply\"\n      type=\"button\"\n      [attr.aria-label]=\"\n        'satori-components.comments.reply-to' | translate: { author: comment.author }\n      \"\n      (click)=\"openReplies(comment.id, true)\"\n    >\n      <mat-icon aria-hidden=\"true\">reply</mat-icon>\n      {{ 'satori-components.comments.reply' | translate }}\n    </button>\n  }\n</ng-template>\n\n<ng-template #deleteConfirmation let-data>\n  <h2 mat-dialog-title>\n    {{\n      (data.reply\n        ? 'satori-components.comments.delete-reply-title'\n        : 'satori-components.comments.delete-comment-title'\n      ) | translate\n    }}\n  </h2>\n  <mat-dialog-content>\n    {{\n      (data.reply\n        ? 'satori-components.comments.delete-reply-message'\n        : data.replies > 0\n          ? 'satori-components.comments.delete-comment-with-replies'\n          : 'satori-components.comments.delete-comment-message'\n      ) | translate\n    }}\n  </mat-dialog-content>\n  <mat-dialog-actions align=\"end\">\n    <button mat-button type=\"button\" mat-dialog-close>\n      {{ 'satori-components.comments.cancel' | translate }}\n    </button>\n    <button mat-flat-button type=\"button\" [mat-dialog-close]=\"true\">\n      {{ 'satori-components.comments.delete' | translate }}\n    </button>\n  </mat-dialog-actions>\n</ng-template>\n", styles: [":host {\n  --nxs-comments-text: var(--mat-sys-on-surface);\n  --nxs-comments-muted: var(--mat-sys-on-surface-variant);\n  --nxs-comments-link: var(--mat-sys-primary);\n  --nxs-comments-divider: var(--mat-sys-outline-variant);\n  display: block;\n  font-size: 13px;\n  color: var(--nxs-comments-text);\n}\n\n.nxs-comments__loading {\n  display: flex;\n  justify-content: center;\n  padding: 24px 0;\n}\n\n.nxs-comments__failed {\n  display: flex;\n  align-items: center;\n  justify-content: space-between;\n  gap: 8px;\n  padding: 12px 0;\n}\n\n// Paragraph margins are scoped to the host: the theme's `.mat-typography p` outranks a single class.\n:host .nxs-comments__failed p {\n  margin: 0;\n}\n\n:host .nxs-comments__empty {\n  margin: 12px 0;\n  color: var(--nxs-comments-muted);\n}\n\n.nxs-comments__list {\n  list-style: none;\n  margin: 0;\n  padding: 0;\n\n  &:focus {\n    outline: none;\n  }\n}\n\n.nxs-comments__comment {\n  padding: 12px 0;\n  border-bottom: 1px solid var(--nxs-comments-divider);\n\n  &--reply {\n    padding: 8px 0;\n    border-bottom: none;\n  }\n}\n\n.nxs-comments__header {\n  display: flex;\n  align-items: center;\n  gap: 8px;\n  min-height: 32px;\n}\n\n.nxs-comments__author {\n  font-weight: 500;\n  overflow-wrap: anywhere;\n}\n\n.nxs-comments__time {\n  font-size: 12px;\n  color: var(--nxs-comments-muted);\n}\n\n.nxs-comments__menu {\n  margin-inline-start: auto;\n}\n\n:host .nxs-comments__text {\n  margin-block: 4px 0;\n  margin-inline: 36px 0;\n  overflow-wrap: anywhere;\n  line-height: 1.5;\n}\n\n:host .nxs-comments__comment--reply .nxs-comments__text {\n  margin-inline-start: 32px;\n}\n\n.nxs-comments__body {\n  white-space: pre-wrap;\n}\n\n.nxs-comments__replies {\n  margin-block: 8px 0;\n  margin-inline: 36px 0;\n  padding-inline-start: 12px;\n  border-inline-start: 2px solid var(--nxs-comments-divider);\n}\n\n// Text buttons that read as links: \"View all\", \"Show all\", \"Reply\", the reply count.\n.nxs-comments__more,\n.nxs-comments__show-all,\n.nxs-comments__reply,\n.nxs-comments__summary {\n  display: inline-flex;\n  align-items: center;\n  gap: 4px;\n  padding: 4px 0;\n  border: none;\n  background: none;\n  font: inherit;\n  font-size: 12px;\n  color: var(--nxs-comments-link);\n  cursor: pointer;\n\n  &:hover {\n    text-decoration: underline;\n  }\n\n  &:focus-visible {\n    outline: 2px solid var(--nxs-comments-link);\n    outline-offset: 2px;\n    border-radius: 2px;\n  }\n}\n\n// IBM Equal Access's style_focus_visible reads `:focus` only and resolves no selector list, so\n// each of these controls gets its own `:focus` rule (NXSAT-547).\n@each $control in more, show-all, reply, summary {\n  .nxs-comments__#{$control}:focus {\n    outline: 2px solid var(--nxs-comments-link);\n    outline-offset: 2px;\n    border-radius: 2px;\n  }\n}\n\n.nxs-comments__more {\n  margin-block: 8px 0;\n}\n\n.nxs-comments__reply,\n.nxs-comments__summary {\n  margin-block: 4px 0;\n  margin-inline: 36px 0;\n\n  mat-icon {\n    width: 16px;\n    height: 16px;\n    font-size: 16px;\n  }\n}\n\n.nxs-comments__show-all {\n  padding: 0;\n  margin-inline-start: 4px;\n}\n\n.nxs-comments__composer {\n  display: flex;\n  align-items: flex-start;\n  gap: 4px;\n  margin-top: 12px;\n\n  mat-form-field {\n    flex: 1;\n    min-width: 0;\n  }\n\n  &--edit {\n    margin-block: 4px 0;\n    margin-inline: 36px 0;\n  }\n}\n\n.nxs-comments__replies .nxs-comments__composer {\n  margin-top: 8px;\n}\n"] }]
    }], () => [], { documentUid: [{ type: i0.Input, args: [{ isSignal: true, alias: "documentUid", required: true }] }], readOnly: [{ type: i0.Input, args: [{ isSignal: true, alias: "readOnly", required: false }] }], pageSize: [{ type: i0.Input, args: [{ isSignal: true, alias: "pageSize", required: false }] }], maxChars: [{ type: i0.Input, args: [{ isSignal: true, alias: "maxChars", required: false }] }], threadChange: [{ type: i0.Output, args: ["threadChange"] }], extra: [{ type: i0.ContentChild, args: [i0.forwardRef(() => NxsCommentExtraDirective), { isSignal: true }] }], deleteDialog: [{ type: i0.ViewChild, args: ['deleteConfirmation', { isSignal: true }] }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(NxsCommentsComponent, { className: "NxsCommentsComponent", filePath: "libs/shared/satori-components/src/lib/comments/comments.component.ts", lineNumber: 167 }); })();
//# sourceMappingURL=comments.component.js.map