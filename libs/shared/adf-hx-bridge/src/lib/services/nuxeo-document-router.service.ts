import { Injectable, inject } from '@angular/core';

import { Location } from '@angular/common';
import { Router } from '@angular/router';

import type { Document } from '@hylandsoftware/hxcs-js-client';

import { BROWSE_RETURN_MODE_PARAM, normalizeNuxeoPath } from '@agentic-ui/shared/nuxeo-client';

import { isHxFolder } from '../services/adf-hx-document.service';

import { AdfHxBrowseContextService } from '../services/adf-hx-browse-context.service';

import { isHxRootDocument } from '../tokens/adf-hx-bridge.tokens';

import { toAdfHxBrowseRouterUrl } from '../utils/adf-hx-browse-path.utils';

/**
 * Nuxeo-shaped implementation of adf-hx's `DocumentRouterService`.
 *
 * Upstream's own builds `/{repository}/documents/{id}` — a route structure this application
 * does not have — and its breadcrumb feeds the result straight into `[routerLink]`, so
 * without an override every crumb points at a route that does not exist. It carries no
 * `providedIn`, which makes it an intended substitution point: `provide-adf-hx-nuxeo-bridge.ts`
 * binds this class against it.
 *
 * `urlFor` returns a **router path**, not an `href`. The hand-written breadcrumb used the
 * `#`-prefixed form because it rendered plain anchors; `[routerLink]` would treat a leading
 * `#` as a path segment. `absolute` goes through `Location.prepareExternalUrl`, which adds
 * the `#` itself under `withHashLocation()`.
 */
@Injectable()
export class NuxeoDocumentRouterService {
  private readonly location = inject(Location);

  private readonly router = inject(Router);

  private readonly browseContext = inject(AdfHxBrowseContextService);

  navigateTo(document: Document): void {
    if (isHxRootDocument(document)) {
      this.browseContext.setFromNuxeoPath('/');

      void this.router.navigateByUrl(toAdfHxBrowseRouterUrl('/'));

      return;
    }

    if (isHxFolder(document)) {
      const path = normalizeNuxeoPath(document.sys_path ?? '/');

      this.browseContext.setFromNuxeoPath(path);

      void this.router.navigateByUrl(toAdfHxBrowseRouterUrl(path));

      return;
    }

    void this.router.navigate(['/doc', document.sys_id], {
      queryParams: {
        [BROWSE_RETURN_MODE_PARAM]: 'adf-hx',
      },
    });
  }

  urlFor(document: Document, options: { absolute?: boolean } = {}): string {
    const path = this.routerPathFor(document);
    return options.absolute ? this.location.prepareExternalUrl(path) : path;
  }

  /**
   * The parent's URL, from `sys_parentPath`.
   *
   * Falls back to the browse root rather than to the document itself: a breadcrumb whose
   * parent link silently points back at the current page looks like it worked.
   */
  urlForParent(document: Document, options: { absolute?: boolean } = {}): string {
    const parentPath = document.sys_parentPath ?? '/';
    const path = toAdfHxBrowseRouterUrl(parentPath);
    return options.absolute ? this.location.prepareExternalUrl(path) : path;
  }

  private routerPathFor(document: Document): string {
    if (isHxRootDocument(document) || isHxFolder(document)) {
      return toAdfHxBrowseRouterUrl(document.sys_path ?? '/');
    }
    const id = document.sys_id ?? '';
    return `/doc/${id}?${BROWSE_RETURN_MODE_PARAM}=adf-hx`;
  }
}
