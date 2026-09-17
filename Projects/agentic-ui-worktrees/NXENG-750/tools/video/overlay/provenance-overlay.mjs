/**
 * In-app provenance annotation overlay.
 *
 * Injected into the *running* product at record time and drawn on top of it, so the
 * screencast is the live application with infographics over it rather than a deck of
 * screenshots. Nothing here ships: it lives only in the recording browser's page context.
 *
 * ## What it asserts
 *
 * Every box is anchored to a real DOM element found by its Angular component selector.
 * The selectors and class names in `REGISTRY` below were not guessed. They were read out of
 * the shipped bundles by matching Angular's partial-ivy `ngDeclareComponent({ type: X,
 * selector: "y" })` metadata, and the bridge ones out of `libs/shared/adf-hx-bridge/src`.
 * That matters: a first pass guessed the names from the selectors and got six of them wrong
 * — `hxp-folder-icon` is `FolderIconComponent`, not `HxpFolderIconComponent`, and the three
 * skeleton loaders drop the prefix too. A tag not in the registry is drawn in neither colour
 * and reported by `unknown()`, so a renamed selector surfaces as a gap instead of silently
 * vanishing.
 *
 * ## Two traps this had to handle
 *
 * 1. **Degenerate host boxes.** `hxp-column-picker` renders an absolutely positioned
 *    panel, so its own `getBoundingClientRect()` is ~0x0 and a naive outline draws a dot
 *    in the corner. `measure()` falls back to the union of the host's visible descendant
 *    rects.
 * 2. **Co-incident nesting.** `hxp-document-list` and the `adf-datatable` it renders have
 *    *identical* rects. Drawn plainly that is one box with two labels stacked on it, which
 *    reads as a mislabel. Nested annotations are inset by their annotated-ancestor depth.
 *
 * Identity never rests on colour: every label carries its origin as text as well.
 */

/** Upstream adf-hx. Colourblind-separable from the orange on this surface. */
export const BLUE = '#3987e5';
/** Ours, in `libs/shared/adf-hx-bridge`. */
export const ORANGE = '#d95926';

/**
 * selector -> provenance.
 *
 * `origin` is one of:
 *   - `adf-hx`   — `@alfresco/adf-hx-content-services`, upstream, blue
 *   - `adf-core` — `@alfresco/adf-core`, also upstream and also blue, but a different
 *                  package; the text says which, because "upstream" alone would let the
 *                  adf-core datatable be read as an adf-hx component
 *   - `ours`     — declared in `libs/shared/adf-hx-bridge`, orange
 *
 * `headline: true` marks the six upstream components the Beta actually adopted, as
 * distinct from upstream internals those six happen to render.
 */
export const REGISTRY = {
  // ---- the six adopted upstream components -------------------------------------
  'hxp-document-list': { origin: 'adf-hx', name: 'HxpDocumentListComponent', headline: true },
  'hxp-document-tree': { origin: 'adf-hx', name: 'HxpDocumentTreeComponent', headline: true },
  'hxp-breadcrumb': { origin: 'adf-hx', name: 'HxpBreadcrumbComponent', headline: true },
  'hxp-properties-sidebar': {
    origin: 'adf-hx',
    name: 'HxpPropertiesSidebarComponent',
    headline: true,
  },
  'hxp-ui-document-viewer': {
    origin: 'adf-hx',
    name: 'HxpUiDocumentViewerComponent',
    headline: true,
  },
  'hxp-manage-versions-sidebar': {
    origin: 'adf-hx',
    name: 'ManageVersionsSidebarComponent',
    headline: true,
  },
  'hxp-permissions-management-panel': {
    origin: 'adf-hx',
    name: 'PermissionsManagementPanelComponent',
    headline: true,
  },

  // ---- upstream internals the seven render ------------------------------------
  'hxp-ui-breadcrumb': { origin: 'adf-hx', name: 'HxpUiBreadcrumbComponent' },
  'hxp-permission-management-container': {
    origin: 'adf-hx',
    name: 'PermissionManagementContainerComponent',
  },
  'hxp-permissions-table': { origin: 'adf-hx', name: 'PermissionsTableComponent' },
  'hxp-permissions-inheritance-toggle': {
    origin: 'adf-hx',
    name: 'PermissionsInheritanceToggleComponent',
  },
  'hxp-add-permission': { origin: 'adf-hx', name: 'AddPermissionComponent' },
  'hxp-permission-search': { origin: 'adf-hx', name: 'PermissionSearchComponent' },
  'hxp-permissions': { origin: 'adf-hx', name: 'PermissionsComponent' },
  'hxp-inherited-permission': { origin: 'adf-hx', name: 'InheritedPermissionComponent' },
  'hxp-permissions-document-title': {
    origin: 'adf-hx',
    name: 'PermissionsDocumentTitleComponent',
  },
  'hxp-permissions-empty-table': { origin: 'adf-hx', name: 'PermissionsEmptyTableComponent' },
  'hxp-folder-icon': { origin: 'adf-hx', name: 'FolderIconComponent' },
  'hxp-mime-type-icon': { origin: 'adf-hx', name: 'MimeTypeIconComponent' },
  'hxp-document-type-icon': { origin: 'adf-hx', name: 'ContentTypeIconComponent' },
  'hxp-properties-sidebar-legacy': {
    origin: 'adf-hx',
    name: 'HxpPropertiesSidebarLegacyComponent',
  },
  'hxp-properties-viewer-content': { origin: 'adf-hx', name: 'PropertiesViewerContentComponent' },
  'hxp-table-skeleton-loader': { origin: 'adf-hx', name: 'TableSkeletonLoaderComponent' },
  'hxp-tree-skeleton-loader': { origin: 'adf-hx', name: 'TreeSkeletonLoaderComponent' },
  'hxp-panel-skeleton-loader': { origin: 'adf-hx', name: 'PanelSkeletonLoaderComponent' },

  // ---- adf-core, underneath the adf-hx components ------------------------------
  'adf-datatable': { origin: 'adf-core', name: 'DataTableComponent' },
  'adf-breadcrumb': { origin: 'adf-core', name: 'BreadcrumbComponent' },
  'adf-card-view': { origin: 'adf-core', name: 'CardViewComponent' },
  'adf-info-drawer': { origin: 'adf-core', name: 'InfoDrawerComponent' },
  'adf-info-drawer-layout': { origin: 'adf-core', name: 'InfoDrawerLayoutComponent' },
  'adf-viewer': { origin: 'adf-core', name: 'ViewerComponent' },
  'adf-viewer-render': { origin: 'adf-core', name: 'ViewerRenderComponent' },
  'adf-empty-content': { origin: 'adf-core', name: 'EmptyContentComponent' },
  // Repeated per row/cell; annotated only when explicitly asked for, never in `all`.
  'adf-datatable-row': { origin: 'adf-core', name: 'DataTableRowComponent', noisy: true },
  'adf-datatable-cell': { origin: 'adf-core', name: 'DataTableCellComponent', noisy: true },
  'adf-date-cell': { origin: 'adf-core', name: 'DateCellComponent', noisy: true },
  'adf-card-view-item-dispatcher': {
    origin: 'adf-core',
    name: 'CardViewItemDispatcherComponent',
    noisy: true,
  },
  'adf-card-view-textitem': { origin: 'adf-core', name: 'CardViewTextItemComponent', noisy: true },
  'adf-card-view-dateitem': { origin: 'adf-core', name: 'CardViewDateItemComponent', noisy: true },
  'adf-card-view-selectitem': {
    origin: 'adf-core',
    name: 'CardViewSelectItemComponent',
    noisy: true,
  },

  // ---- ours: the thirteen in libs/shared/adf-hx-bridge ------------------------
  // Thirteen, not fourteen: `hxp-browse-permissions` was deleted when upstream's
  // `hxp-permissions-management-panel` was adopted above.
  'hxp-browse-toolbar': { origin: 'ours', name: 'HxpBrowseToolbarComponent' },
  'hxp-browse-tabs': { origin: 'ours', name: 'HxpBrowseTabsComponent' },
  'hxp-browse-nav-drawer': { origin: 'ours', name: 'HxpBrowseNavDrawerComponent' },
  'hxp-browse-pager': { origin: 'ours', name: 'HxpBrowsePagerComponent' },
  'hxp-browse-details-panel': { origin: 'ours', name: 'HxpBrowseDetailsPanelComponent' },
  'hxp-browse-history': { origin: 'ours', name: 'HxpBrowseHistoryComponent' },
  'hxp-browse-trash': { origin: 'ours', name: 'HxpBrowseTrashComponent' },
  'hxp-column-picker': { origin: 'ours', name: 'HxpColumnPickerComponent' },
  'hxp-document-cards': { origin: 'ours', name: 'HxpDocumentCardsComponent' },
  'hxp-folder-header': { origin: 'ours', name: 'HxpFolderHeaderComponent' },
  'hxp-icon': { origin: 'ours', name: 'HxpIconComponent' },
  'hxp-spinner': { origin: 'ours', name: 'HxpSpinnerComponent' },
  'hxp-domain-hint': { origin: 'ours', name: 'HxpDomainHintComponent' },
};

/**
 * The page-side implementation, stringified and evaluated inside the product.
 *
 * It is one function rather than a module because it is handed to `page.evaluate`, which
 * serialises the source; nothing here may close over Node scope.
 */
function pageSide(registry, colours) {
  const { BLUE, ORANGE } = colours;
  const Z = 2147483000;

  const COLOUR = { 'adf-hx': BLUE, 'adf-core': BLUE, ours: ORANGE };
  const ORIGIN_TEXT = { 'adf-hx': 'adf-hx', 'adf-core': 'adf-core', ours: 'ours' };

  const root = document.createElement('div');
  root.id = '__provenance-overlay';
  root.setAttribute('aria-hidden', 'true');
  root.style.cssText = `position:fixed;inset:0;pointer-events:none;z-index:${Z};font-family:-apple-system,"Segoe UI",Roboto,sans-serif;`;
  document.body.append(root);

  const style = document.createElement('style');
  style.textContent = `
    #__provenance-overlay .pv-box{position:fixed;border-width:2px;border-style:solid;border-radius:3px;box-sizing:border-box;transition:opacity .28s ease;}
    #__provenance-overlay .pv-label{position:fixed;display:flex;align-items:center;gap:6px;padding:3px 8px;border-radius:3px;
      font-size:13px;font-weight:700;line-height:1.25;color:#fff;white-space:nowrap;box-shadow:0 1px 4px rgba(0,0,0,.35);transition:opacity .28s ease;}
    #__provenance-overlay .pv-label .pv-origin{font-weight:800;letter-spacing:.04em;text-transform:lowercase;}
    #__provenance-overlay .pv-label .pv-sep{opacity:.6;font-weight:400;}
    #__provenance-overlay .pv-label .pv-mult{font-weight:600;opacity:.85;}
    #__provenance-overlay .pv-hidden{opacity:0;}
    /* left:68px clears the app's 56px nav rail, so the signed-in avatar at the bottom of it
       stays visible — the legend was covering the "AD" badge that proves the session. */
    #__provenance-overlay #pv-legend{position:fixed;left:68px;bottom:20px;background:rgba(17,20,26,.94);color:#f2f4f8;
      padding:14px 18px;border-radius:8px;font-size:14px;line-height:1.5;box-shadow:0 6px 24px rgba(0,0,0,.4);max-width:520px;}
    #__provenance-overlay #pv-legend .pv-row{display:flex;align-items:center;gap:9px;margin-top:5px;}
    #__provenance-overlay #pv-legend .pv-sw{width:15px;height:15px;border-radius:3px;flex:0 0 auto;}
    #__provenance-overlay #pv-legend .pv-title{font-weight:800;font-size:12px;letter-spacing:.1em;text-transform:uppercase;opacity:.66;}
    #__provenance-overlay #pv-legend .pv-note{margin-top:9px;font-size:12px;opacity:.62;line-height:1.4;}
    #__provenance-overlay #pv-count{position:fixed;right:20px;bottom:20px;background:rgba(17,20,26,.94);color:#f2f4f8;
      padding:14px 18px;border-radius:8px;font-size:15px;box-shadow:0 6px 24px rgba(0,0,0,.4);text-align:right;}
    #__provenance-overlay #pv-count b{font-size:23px;font-weight:800;vertical-align:-1px;}
    #__provenance-overlay #pv-caption{position:fixed;left:50%;transform:translateX(-50%);bottom:20px;background:rgba(17,20,26,.94);
      color:#f2f4f8;padding:12px 22px;border-radius:8px;font-size:17px;font-weight:600;box-shadow:0 6px 24px rgba(0,0,0,.4);
      max-width:820px;text-align:center;line-height:1.4;transition:opacity .3s ease;}
  `;
  root.append(style);

  const legend = document.createElement('div');
  legend.id = 'pv-legend';
  legend.innerHTML =
    `<div class="pv-title">Component provenance</div>` +
    `<div class="pv-row"><span class="pv-sw" style="background:${BLUE}"></span><span><b>adf-hx</b> / <b>adf-core</b> — upstream, from <code>@alfresco/*</code></span></div>` +
    `<div class="pv-row"><span class="pv-sw" style="background:${ORANGE}"></span><span><b>ours</b> — <code>libs/shared/adf-hx-bridge</code></span></div>` +
    `<div class="pv-note">Every label states its origin in words as well as colour. Counts are distinct component types currently outlined on screen, not instances.</div>`;
  root.append(legend);

  const counter = document.createElement('div');
  counter.id = 'pv-count';
  root.append(counter);

  const caption = document.createElement('div');
  caption.id = 'pv-caption';
  caption.style.display = 'none';
  root.append(caption);

  /** tag -> { box, label, el, spec, count } for everything currently revealed. */
  const live = new Map();
  /** Tags whose selector is unknown to the registry, seen while scanning. */
  const unknownTags = new Set();

  const isVisible = (r) =>
    r.width > 4 &&
    r.height > 4 &&
    r.bottom > 0 &&
    r.top < innerHeight &&
    r.right > 0 &&
    r.left < innerWidth;

  /**
   * The element's own rect, or — when the host box is degenerate because its content is
   * absolutely positioned — the union of its visible descendants.
   *
   * The descendant union skips **scrims**: `hxp-column-picker` renders a full-screen
   * backdrop button before its panel, and unioning that produced a box covering the entire
   * 1920x1080 viewport, labelled as the column picker. Anything covering more than half the
   * viewport is therefore excluded from the union, because no annotated panel in this app
   * is that large and a backdrop always is.
   */
  function measure(el) {
    const own = el.getBoundingClientRect();
    if (own.width > 8 && own.height > 8)
      return { x: own.left, y: own.top, w: own.width, h: own.height, own: true };

    const viewportArea = innerWidth * innerHeight;
    const union = (skipScrims) => {
      let x0 = Infinity;
      let y0 = Infinity;
      let x1 = -Infinity;
      let y1 = -Infinity;
      for (const kid of el.querySelectorAll('*')) {
        const r = kid.getBoundingClientRect();
        if (!isVisible(r)) continue;
        if (skipScrims && r.width * r.height > viewportArea * 0.5) continue;
        x0 = Math.min(x0, r.left);
        y0 = Math.min(y0, r.top);
        x1 = Math.max(x1, r.right);
        y1 = Math.max(y1, r.bottom);
      }
      return x0 === Infinity ? null : { x: x0, y: y0, w: x1 - x0, h: y1 - y0, own: false };
    };
    // Scrim-free first; only if that leaves nothing does the scrim itself count.
    return union(true) ?? union(false);
  }

  /**
   * Every visible instance of a tag, capped so a per-cell component does not bury the frame
   * in outlines.
   *
   * Ranked by the area *inside the viewport*, not total area. Ranking by total area picked
   * the `adf-card-view` instance that begins at y=1050 and runs 1200px below the fold — a
   * 30px sliver at the bottom edge carrying a confident label. What a viewer can see is what
   * should be labelled.
   */
  function pick(tag) {
    const hits = [];
    for (const el of document.querySelectorAll(tag)) {
      const m = measure(el);
      if (!m || !isVisible(new DOMRect(m.x, m.y, m.w, m.h))) continue;
      const vw = Math.min(m.x + m.w, innerWidth) - Math.max(m.x, 0);
      const vh = Math.min(m.y + m.h, innerHeight) - Math.max(m.y, 0);
      hits.push({ el, area: Math.max(0, vw) * Math.max(0, vh) });
    }
    if (!hits.length) return null;
    hits.sort((a, b) => b.area - a.area);
    return { els: hits.slice(0, 24).map((h) => h.el), count: hits.length };
  }

  /** How many *annotated* elements are ancestors of this one — drives the inset. */
  function depthOf(el) {
    let d = 0;
    for (let p = el.parentElement; p; p = p.parentElement) {
      for (const entry of live.values()) if (entry.els.includes(p)) d += 1;
    }
    return d;
  }

  /**
   * Draw one outline per instance and a single label on the largest, so eleven `hxp-icon`
   * hosts read as eleven outlined icons with one legend rather than one arbitrary pick.
   */
  function draw(entry) {
    let labelled = false;
    for (let i = 0; i < entry.els.length; i += 1) {
      const el = entry.els[i];
      const box = entry.boxes[i];
      const m = measure(el);
      if (!m) {
        box.style.display = 'none';
        continue;
      }
      const inset = Math.min(3, depthOf(el)) * 6;
      const x = m.x + inset;
      const y = m.y + inset;
      const w = Math.max(10, m.w - inset * 2);
      const h = Math.max(10, m.h - inset * 2);
      box.style.display = '';
      Object.assign(box.style, {
        left: `${x}px`,
        top: `${y}px`,
        width: `${w}px`,
        height: `${h}px`,
      });

      if (labelled) continue;
      labelled = true;
      entry.label.style.display = '';
      // Final position is chosen by layoutLabels() from candidates around this box.
      entry.anchor = { x, y, w, h };
    }
    if (!labelled) {
      entry.label.style.display = 'none';
      entry.anchor = null;
    }
  }

  /**
   * Place each label on its own box, choosing a free corner rather than drifting.
   *
   * Two things forced this. `hxp-document-list` and the `adf-datatable` inside it have
   * identical rects, so both labels wanted the same pixel and one sat invisibly under the
   * other — the outer component read as unlabelled. Then the first fix, pushing collisions
   * straight down, walked the `hxp-folder-header` label 150px away from its box in the
   * fifteen-label pass, where it sat on top of an unrelated component. A label 150px from
   * what it names is worse than no label.
   *
   * So every candidate is anchored to the box it belongs to — nine positions around and
   * inside its perimeter. If all nine collide the first is used anyway: overlapping and
   * attached beats clear and detached.
   */
  function layoutLabels() {
    const hits = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
    // The legend, counter and caption are opaque, so a label placed under one of them is a
    // label nobody can read. They are seeded as occupied so candidates route around them.
    const placed = [legend, counter, caption]
      .filter((el) => el.style.display !== 'none')
      .map((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left, y: r.top, w: r.width, h: r.height };
      });
    for (const entry of live.values()) {
      const a = entry.anchor;
      if (!a) continue;
      const lh = entry.label.offsetHeight || 24;
      const lw = entry.label.offsetWidth || 180;
      const left = a.x + 4;
      const right = a.x + a.w - lw - 4;
      const candidates = [
        [left, a.y - lh - 3],
        [right, a.y - lh - 3],
        [left, a.y + 3],
        [right, a.y + 3],
        [left, a.y + a.h - lh - 3],
        [right, a.y + a.h - lh - 3],
        [left, a.y + a.h + 3],
        [right, a.y + a.h + 3],
        [left, a.y + Math.round((a.h - lh) / 2)],
      ]
        // Clamped so a label never leaves the frame, which would hide it entirely.
        .map(([cx, cy]) => ({
          x: Math.min(Math.max(4, cx), innerWidth - lw - 4),
          y: Math.min(Math.max(4, cy), innerHeight - lh - 4),
          w: lw,
          h: lh,
        }));
      const free = candidates.find((c) => !placed.some((p) => hits(c, p)));
      const r = free ?? candidates[0];
      placed.push(r);
      Object.assign(entry.label.style, { left: `${r.x}px`, top: `${r.y}px` });
    }
  }

  function updateCounter() {
    let up = 0;
    let ours = 0;
    for (const e of live.values()) {
      if (e.label.style.display === 'none') continue;
      if (e.spec.origin === 'ours') ours += 1;
      else up += 1;
    }
    counter.innerHTML =
      `<div style="color:${BLUE}">upstream on screen: <b>${up}</b></div>` +
      `<div style="color:${ORANGE};margin-top:3px">ours: <b>${ours}</b></div>`;
  }

  function redrawAll() {
    for (const e of live.values()) draw(e);
    layoutLabels();
    updateCounter();
  }

  /** Keep boxes glued to the DOM as it scrolls, resizes and re-renders. */
  const ticker = setInterval(redrawAll, 200);
  addEventListener('scroll', redrawAll, true);
  addEventListener('resize', redrawAll);

  window.__prov = {
    /** Reveal one or more tags. Unknown or absent tags are reported, not drawn. */
    reveal(tags) {
      const added = [];
      const missing = [];
      for (const tag of Array.isArray(tags) ? tags : [tags]) {
        if (live.has(tag)) {
          added.push(tag);
          continue;
        }
        const spec = registry[tag];
        if (!spec) {
          missing.push(`${tag} (not in registry)`);
          continue;
        }
        const hit = pick(tag);
        if (!hit) {
          missing.push(`${tag} (not on screen)`);
          continue;
        }
        const colour = COLOUR[spec.origin];
        const boxes = hit.els.map(() => {
          const box = document.createElement('div');
          box.className = 'pv-box pv-hidden';
          box.style.borderColor = colour;
          box.style.background = `${colour}14`;
          return box;
        });

        const label = document.createElement('div');
        label.className = 'pv-label pv-hidden';
        label.style.background = colour;
        label.innerHTML =
          `<span class="pv-origin">${ORIGIN_TEXT[spec.origin]}</span>` +
          `<span class="pv-sep">·</span><span>${spec.name}</span>` +
          (hit.count > 1 ? `<span class="pv-mult">×${hit.count}</span>` : '');

        root.append(...boxes, label);
        const entry = { boxes, label, els: hit.els, spec, count: hit.count };
        live.set(tag, entry);
        draw(entry);
        // Fade in on the next frame so the transition actually runs.
        requestAnimationFrame(() => {
          for (const box of boxes) box.classList.remove('pv-hidden');
          label.classList.remove('pv-hidden');
        });
        added.push(tag);
      }
      redrawAll();
      return { added, missing };
    },

    /** Drop annotations. No argument clears everything. */
    clear(tags) {
      const list = tags ? (Array.isArray(tags) ? tags : [tags]) : [...live.keys()];
      for (const tag of list) {
        const e = live.get(tag);
        if (!e) continue;
        for (const box of e.boxes) box.remove();
        e.label.remove();
        live.delete(tag);
      }
      redrawAll();
      return [...live.keys()];
    },

    /** Every registered selector currently on screen, split by origin. */
    scan() {
      const out = { 'adf-hx': [], 'adf-core': [], ours: [], unknown: [] };
      const seen = new Set();
      for (const el of document.querySelectorAll('*')) {
        const tag = el.tagName.toLowerCase();
        if (!/^(hxp|adf)-/.test(tag) || seen.has(tag)) continue;
        const m = measure(el);
        if (!m || !isVisible(new DOMRect(m.x, m.y, m.w, m.h))) continue;
        seen.add(tag);
        const spec = registry[tag];
        if (spec) out[spec.origin].push(tag);
        else {
          out.unknown.push(tag);
          unknownTags.add(tag);
        }
      }
      return out;
    },

    /** Everything on screen that is registered and not marked noisy. */
    revealAllOnScreen() {
      const s = this.scan();
      const tags = [...s['adf-hx'], ...s['adf-core'], ...s.ours].filter((t) => !registry[t].noisy);
      return this.reveal(tags);
    },

    /**
     * Bring a component into view. `hxp-browse-pager` sits at the bottom of a scrolling
     * container, and a fixed `mouse.wheel` only moved the window 32px, leaving the pager as
     * a 30px sliver clipped by the bottom edge.
     */
    scrollIntoView(tag) {
      const el = document.querySelector(tag);
      if (!el) return false;
      el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'instant' });
      return true;
    },

    caption(text) {
      if (!text) {
        caption.style.display = 'none';
        return;
      }
      caption.textContent = text;
      caption.style.display = '';
    },

    legend(on) {
      legend.style.display = on === false ? 'none' : '';
      counter.style.display = on === false ? 'none' : '';
    },

    /**
     * Breakdown of what is currently outlined, so a caption can quote numbers it measured
     * rather than numbers someone typed. The counter's "upstream" total mixes the six adopted
     * adf-hx components with upstream internals and adf-core, and a caption saying "six
     * upstream components" beside a counter reading 8 invites the reader to think one of them
     * is wrong.
     */
    summary() {
      const out = { adopted: 0, internals: 0, core: 0, ours: 0 };
      for (const e of live.values()) {
        if (e.label.style.display === 'none') continue;
        if (e.spec.origin === 'ours') out.ours += 1;
        else if (e.spec.origin === 'adf-core') out.core += 1;
        else if (e.spec.headline) out.adopted += 1;
        else out.internals += 1;
      }
      return out;
    },

    /** Selectors seen in the DOM that the registry does not know — a gap, not a pass. */
    unknown() {
      this.scan();
      return [...unknownTags];
    },

    /** Where each revealed box actually landed, for after-the-fact verification. */
    placements() {
      const out = {};
      for (const [tag, e] of live) {
        const drawn = e.boxes.filter((b) => b.style.display !== 'none');
        const b = (drawn[0] ?? e.boxes[0]).getBoundingClientRect();
        const l = e.label.getBoundingClientRect();
        out[tag] = {
          origin: e.spec.origin,
          name: e.spec.name,
          hidden: e.label.style.display === 'none',
          instances: e.count,
          outlines: drawn.length,
          box: [Math.round(b.x), Math.round(b.y), Math.round(b.width), Math.round(b.height)],
          // Rectangle gap between the label and the box it names: 0 when touching or
          // overlapping. A detached label is then findable in the dump rather than only by
          // squinting at a frame.
          labelGapPx: Math.round(
            Math.hypot(
              Math.max(0, b.left - l.right, l.left - b.right),
              Math.max(0, b.top - l.bottom, l.top - b.bottom),
            ),
          ),
          hostTag: e.els[0].tagName.toLowerCase(),
          labelText: e.label.textContent,
        };
      }
      return out;
    },

    destroy() {
      clearInterval(ticker);
      removeEventListener('scroll', redrawAll, true);
      removeEventListener('resize', redrawAll);
      root.remove();
      delete window.__prov;
    },
  };

  return true;
}

/**
 * Install the overlay into the page. Idempotent per navigation — the product is a hash-
 * routed SPA, so this survives route changes, but a full `goto` tears the page down and it
 * must be installed again.
 */
export async function installOverlay(page) {
  await page.evaluate(
    ([registry, colours, src]) => {
      if (window.__prov) window.__prov.destroy();
      // eslint-disable-next-line no-new-func -- the page has no bundler; this is the injection seam.
      return new Function(`return (${src})`)()(registry, colours);
    },
    [REGISTRY, { BLUE, ORANGE }, pageSide.toString()],
  );
}

/** Reveal tags and hold, logging anything that could not be drawn. */
export async function revealAndHold(page, tags, ms, { label = '' } = {}) {
  const result = await page.evaluate((t) => window.__prov.reveal(t), tags);
  if (result.missing.length) {
    console.log(`  [overlay] ${label || tags.join(',')} — not drawn: ${result.missing.join(', ')}`);
  }
  await page.waitForTimeout(ms);
  return result;
}

export const clearOverlay = (page, tags) =>
  page.evaluate((t) => window.__prov.clear(t), tags ?? null);
export const caption = (page, text) => page.evaluate((t) => window.__prov.caption(t), text ?? null);
export const scan = (page) => page.evaluate(() => window.__prov.scan());
export const placements = (page) => page.evaluate(() => window.__prov.placements());
export const unknownSelectors = (page) => page.evaluate(() => window.__prov.unknown());
