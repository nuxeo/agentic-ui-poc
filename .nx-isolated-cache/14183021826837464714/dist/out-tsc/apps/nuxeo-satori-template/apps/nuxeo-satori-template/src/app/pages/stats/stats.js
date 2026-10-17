import { Component, inject, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { SearchService } from '@nuxeo/satori-platform/nuxeo-client';
import { WidgetGridComponent, WidgetContainerComponent } from '@nuxeo/satori-platform/ui';
import * as i0 from "@angular/core";
export class StatsComponent {
    search = inject(SearchService);
    totalResult = toSignal(this.search.search({ pageSize: 40 }));
    totalDocs = computed(() => this.totalResult()?.items.length, ...(ngDevMode ? [{ debugName: "totalDocs" }] : []));
    recentDocs = 0; // TODO: Add date filter
    myDocs = 0; // TODO: Add user filter
    static ɵfac = function StatsComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || StatsComponent)(); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: StatsComponent, selectors: [["app-stats"]], decls: 16, vars: 4, consts: [[1, "stats-page"], [3, "columns"], ["title", "Total Documents"], [1, "stat"], [1, "stat-value"], ["title", "This Week"], ["title", "My Documents"]], template: function StatsComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "h1");
            i0.ɵɵtext(2, "Quick Statistics");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "lib-widget-grid", 1)(4, "lib-widget-container", 2)(5, "div", 3)(6, "div", 4);
            i0.ɵɵtext(7);
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(8, "lib-widget-container", 5)(9, "div", 3)(10, "div", 4);
            i0.ɵɵtext(11);
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(12, "lib-widget-container", 6)(13, "div", 3)(14, "div", 4);
            i0.ɵɵtext(15);
            i0.ɵɵelementEnd()()()()();
        } if (rf & 2) {
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("columns", 3);
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate1(" ", ctx.totalDocs() ?? "...", " ");
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate1(" ", ctx.recentDocs, " ");
            i0.ɵɵadvance(4);
            i0.ɵɵtextInterpolate1(" ", ctx.myDocs, " ");
        } }, dependencies: [WidgetGridComponent, WidgetContainerComponent], styles: ["//[_ngcontent-%COMP%]   Presentation[_ngcontent-%COMP%]   lives[_ngcontent-%COMP%]   here[_ngcontent-%COMP%]   rather[_ngcontent-%COMP%]   than[_ngcontent-%COMP%]   in[_ngcontent-%COMP%]   `style=`[_ngcontent-%COMP%]   attributes[_ngcontent-%COMP%]   so[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   fork[_ngcontent-%COMP%]   can[_ngcontent-%COMP%]   restyle\n//[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   page[_ngcontent-%COMP%]   from[_ngcontent-%COMP%]   its[_ngcontent-%COMP%]   own[_ngcontent-%COMP%]   stylesheet.[_ngcontent-%COMP%]   There[_ngcontent-%COMP%]   are[_ngcontent-%COMP%]   no[_ngcontent-%COMP%]   colour[_ngcontent-%COMP%]   literals[_ngcontent-%COMP%]   to[_ngcontent-%COMP%]   tokenise[_ngcontent-%COMP%]:   the\n//[_ngcontent-%COMP%]   page[_ngcontent-%COMP%]   inherits[_ngcontent-%COMP%]   `--shell-fg`[_ngcontent-%COMP%]   from[_ngcontent-%COMP%]   `styles.scss`[_ngcontent-%COMP%]   through[_ngcontent-%COMP%]   the[_ngcontent-%COMP%]   body[_ngcontent-%COMP%], which[_ngcontent-%COMP%]   is[_ngcontent-%COMP%]   already\n//[_ngcontent-%COMP%]   a[_ngcontent-%COMP%]   Layer[_ngcontent-%COMP%]   0[_ngcontent-%COMP%]   token.\n.stats-page[_ngcontent-%COMP%] {\n  padding: 2rem;\n}\n\n.stat[_ngcontent-%COMP%] {\n  text-align: center;\n  padding: 2rem;\n}\n\n.stat-value[_ngcontent-%COMP%] {\n  font-size: 3rem;\n  font-weight: 500;\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(StatsComponent, [{
        type: Component,
        args: [{ selector: 'app-stats', standalone: true, imports: [WidgetGridComponent, WidgetContainerComponent], template: "<div class=\"stats-page\">\n  <h1>Quick Statistics</h1>\n\n  <lib-widget-grid [columns]=\"3\">\n    <lib-widget-container title=\"Total Documents\">\n      <div class=\"stat\">\n        <div class=\"stat-value\">\n          {{ totalDocs() ?? '...' }}\n        </div>\n      </div>\n    </lib-widget-container>\n\n    <lib-widget-container title=\"This Week\">\n      <div class=\"stat\">\n        <div class=\"stat-value\">\n          {{ recentDocs }}\n        </div>\n      </div>\n    </lib-widget-container>\n\n    <lib-widget-container title=\"My Documents\">\n      <div class=\"stat\">\n        <div class=\"stat-value\">\n          {{ myDocs }}\n        </div>\n      </div>\n    </lib-widget-container>\n  </lib-widget-grid>\n</div>\n", styles: ["// Presentation lives here rather than in `style=` attributes so a fork can restyle\n// the page from its own stylesheet. There are no colour literals to tokenise: the\n// page inherits `--shell-fg` from `styles.scss` through the body, which is already\n// a Layer 0 token.\n.stats-page {\n  padding: 2rem;\n}\n\n.stat {\n  text-align: center;\n  padding: 2rem;\n}\n\n.stat-value {\n  font-size: 3rem;\n  font-weight: 500;\n}\n"] }]
    }], null, null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(StatsComponent, { className: "StatsComponent", filePath: "apps/nuxeo-satori-template/src/app/pages/stats/stats.ts", lineNumber: 13 }); })();
