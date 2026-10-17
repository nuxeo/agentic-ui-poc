import { DestroyRef, Directive, ElementRef, inject, input, output } from '@angular/core';
import * as i0 from "@angular/core";
/** Emits once when the host element enters the viewport so permissions can be lazy-loaded. */
export class GroupPermLazyLoadDirective {
    el = inject((ElementRef));
    destroyRef = inject(DestroyRef);
    groupId = input.required(...(ngDevMode ? [{ debugName: "groupId", alias: 'libGroupPermLazyLoad' }] : [{ alias: 'libGroupPermLazyLoad' }]));
    visible = output();
    observer;
    ngOnInit() {
        this.observer = new IntersectionObserver((entries) => {
            if (entries.some((entry) => entry.isIntersecting)) {
                this.visible.emit(this.groupId());
                this.observer?.disconnect();
            }
        }, { rootMargin: '64px' });
        this.observer.observe(this.el.nativeElement);
        this.destroyRef.onDestroy(() => this.observer?.disconnect());
    }
    static ɵfac = function GroupPermLazyLoadDirective_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || GroupPermLazyLoadDirective)(); };
    static ɵdir = /*@__PURE__*/ i0.ɵɵdefineDirective({ type: GroupPermLazyLoadDirective, selectors: [["", "libGroupPermLazyLoad", ""]], inputs: { groupId: [1, "libGroupPermLazyLoad", "groupId"] }, outputs: { visible: "visible" } });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(GroupPermLazyLoadDirective, [{
        type: Directive,
        args: [{
                selector: '[libGroupPermLazyLoad]',
                standalone: true,
            }]
    }], null, { groupId: [{ type: i0.Input, args: [{ isSignal: true, alias: "libGroupPermLazyLoad", required: true }] }], visible: [{ type: i0.Output, args: ["visible"] }] }); })();
