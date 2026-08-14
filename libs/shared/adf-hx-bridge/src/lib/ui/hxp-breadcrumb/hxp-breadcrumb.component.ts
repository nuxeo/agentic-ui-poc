import { Component, effect, inject, input, signal } from '@angular/core';
import type { Document } from '@hylandsoftware/hxcs-js-client';
import { catchError, map, of } from 'rxjs';
import { AdfHxDocumentService } from '../../services/adf-hx-document.service';
import { NuxeoDocumentRouterService } from '../../services/nuxeo-document-router.service';
import { isHxRootDocument, ROOT_DOCUMENT } from '../../tokens/adf-hx-bridge.tokens';

export interface HxpBreadcrumbItem {
  label: string;
  href?: string;
  document?: Document;
}

@Component({
  selector: 'hxp-breadcrumb',
  standalone: true,
  templateUrl: './hxp-breadcrumb.component.html',
  styleUrl: './hxp-breadcrumb.component.scss',
  host: { class: 'hxp-breadcrumb' },
})
export class HxpBreadcrumbComponent {
  private readonly documentService = inject(AdfHxDocumentService);
  private readonly router = inject(NuxeoDocumentRouterService);

  readonly document = input<Document>(ROOT_DOCUMENT);
  protected readonly breadcrumbElements = signal<HxpBreadcrumbItem[]>([]);

  constructor() {
    effect((onCleanup) => {
      const current = this.document();
      const sub = this.documentService
        .getAncestors(current.sys_id ?? ROOT_DOCUMENT.sys_id)
        .pipe(
          catchError(() => of([{ ...ROOT_DOCUMENT }])),
          map((ancestors) => this.buildTrail(ancestors, current)),
        )
        .subscribe((items) => this.breadcrumbElements.set(items));

      onCleanup(() => sub.unsubscribe());
    });
  }

  protected onItemClick(event: MouseEvent, item: HxpBreadcrumbItem): void {
    if (!item.href) {
      return;
    }
    event.preventDefault();
    if (item.document) {
      void this.router.navigateTo(item.document);
      return;
    }
    const pathMatch = item.href.match(/path=([^&]+)/);
    if (pathMatch?.[1]) {
      const path = decodeURIComponent(pathMatch[1]);
      void this.router.navigateTo({
        ...ROOT_DOCUMENT,
        sys_path: path,
        sys_isFolderish: true,
        sys_title: path.split('/').filter(Boolean).pop() ?? ROOT_DOCUMENT.sys_title,
      });
    }
  }

  private buildTrail(ancestors: Document[], current: Document): HxpBreadcrumbItem[] {
    if (!current) {
      return [];
    }

    const parents = ancestors.filter((ancestor) => ancestor?.sys_id && !isHxRootDocument(ancestor));
    const atRoot = isHxRootDocument(current);
    const items: HxpBreadcrumbItem[] = [];

    items.push({
      label: ROOT_DOCUMENT.sys_title ?? 'Repository',
      href: atRoot ? undefined : this.router.urlFor(ROOT_DOCUMENT),
      document: ROOT_DOCUMENT,
    });

    for (const ancestor of parents) {
      items.push({
        label: ancestor.sys_title ?? ancestor.sys_name ?? 'Document',
        href: this.router.urlFor(ancestor),
        document: ancestor,
      });
    }

    if (!atRoot) {
      items.push({
        label: current.sys_title ?? current.sys_name ?? 'Document',
      });
    }

    return items;
  }
}
