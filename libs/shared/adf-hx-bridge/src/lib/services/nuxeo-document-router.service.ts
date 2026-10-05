import { Injectable, inject } from '@angular/core';

import { Location } from '@angular/common';
import { Router, type UrlTree } from '@angular/router';

import type { Document } from '@hylandsoftware/hxcs-js-client';

import { BROWSE_RETURN_MODE_PARAM, normalizeNuxeoPath } from '@nuxeo-satori/platform/nuxeo-client';

import { isHxFolder } from '../utils/hxp-document.predicates';

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
 * `urlFor` returns a **router URL**, not an `href`. The hand-written breadcrumb used the
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

  /**
   * A parsed `UrlTree` for in-app links, because upstream's breadcrumb binds this to
   * `[routerLink]`, which treats a string as path segments: `?path=` was escaped to `%3Fpath%3D`,
   * so every crumb except the query-less root pointed at a route that does not exist.
   */
  urlFor(document: Document, options?: { absolute?: false }): UrlTree;
  urlFor(document: Document, options: { absolute: true }): string;
  urlFor(document: Document, options: { absolute?: boolean } = {}): UrlTree | string {
    const path = this.routerPathFor(document);
    return options.absolute ? this.location.prepareExternalUrl(path) : this.router.parseUrl(path);
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
