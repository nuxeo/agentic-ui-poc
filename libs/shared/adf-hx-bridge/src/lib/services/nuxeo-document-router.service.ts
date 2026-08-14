import { Injectable, inject } from '@angular/core';

import { Router } from '@angular/router';

import type { Document } from '@hylandsoftware/hxcs-js-client';

import { BROWSE_RETURN_MODE_PARAM, normalizeNuxeoPath } from '@agentic-ui/shared/nuxeo-client';

import { isHxFolder } from '../services/adf-hx-document.service';

import { AdfHxBrowseContextService } from '../services/adf-hx-browse-context.service';

import { isHxRootDocument } from '../tokens/adf-hx-bridge.tokens';

import { toAdfHxBrowseRouterUrl } from '../utils/adf-hx-browse-path.utils';

@Injectable()
export class NuxeoDocumentRouterService {
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

  urlFor(document: Document): string {
    if (isHxFolder(document) || isHxRootDocument(document)) {
      const path = document.sys_path ?? '/';

      return `#${toAdfHxBrowseRouterUrl(path)}`;
    }

    const id = document.sys_id ?? '';

    return `#/doc/${id}?${BROWSE_RETURN_MODE_PARAM}=adf-hx`;
  }
}
