import { Injectable, inject } from '@angular/core';
import {
  AuditEntry,
  AuditLogList,
  BrowseService,
  DirectoryEntry,
  DirectoryService,
  DocumentDetailService,
  NuxeoDocument,
  NuxeoDocumentList,
  TagService,
} from '@nuxeo-satori/platform/nuxeo-client';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import type { Document } from '@hylandsoftware/hxcs-js-client';
import {
  mapNuxeoDocumentToHx,
  mapNuxeoDocumentsToHx,
} from '../mapping/nuxeo-to-hx-document.mapper';

export interface HxpAuditDirectoryLabels {
  eventTypes: DirectoryEntry[];
  eventCategories: DirectoryEntry[];
  eventTypeLabelMap: Record<string, string>;
  eventCategoryLabelMap: Record<string, string>;
}

@Injectable()
export class AdfHxBrowseFolderService {
  private readonly browseService = inject(BrowseService);
  private readonly detailService = inject(DocumentDetailService);
  private readonly directoryService = inject(DirectoryService);
  private readonly tagService = inject(TagService);

  getFullDocument(uid: string): Observable<NuxeoDocument> {
    return this.detailService.getFullDocument(uid);
  }

  getDocumentPermissions(uid: string): Observable<NuxeoDocument> {
    return this.detailService.getDocumentPermissions(uid);
  }

  getAuditLog(uid: string, pageSize = 10, pageIndex = 0): Observable<AuditLogList> {
    return this.detailService.getAuditLog(uid, pageSize, pageIndex);
  }

  getAuditDirectoryLabels(): Observable<HxpAuditDirectoryLabels> {
    return forkJoin([
      this.directoryService.getEventTypes(),
      this.directoryService.getEventCategories(),
    ]).pipe(
      map(([eventTypes, eventCategories]) => {
        const eventTypeLabelMap: Record<string, string> = {};
        for (const entry of eventTypes) {
          eventTypeLabelMap[entry.id] = entry.label;
        }
        const eventCategoryLabelMap: Record<string, string> = {};
        for (const entry of eventCategories) {
          eventCategoryLabelMap[entry.id] = entry.label;
        }
        return {
          eventTypes,
          eventCategories,
          eventTypeLabelMap,
          eventCategoryLabelMap,
        };
      }),
    );
  }

  getTrashedChildren(parentUid: string, pageSize = 50): Observable<NuxeoDocumentList> {
    return this.browseService.getTrashedChildren(parentUid, pageSize);
  }

  restoreDocument(uid: string): Observable<NuxeoDocument> {
    return this.browseService.restoreDocument(uid);
  }

  searchTags(term: string): Observable<string[]> {
    return this.tagService.searchTags(term);
  }

  mapTrashedToHx(docs: NuxeoDocument[]): Document[] {
    return mapNuxeoDocumentsToHx(docs);
  }

  mapNuxeoToHx(doc: NuxeoDocument): Document {
    return mapNuxeoDocumentToHx(doc);
  }

  filterAuditEntries(
    entries: AuditEntry[],
    filters: {
      username?: string;
      dateFrom?: Date | null;
      dateTo?: Date | null;
      action?: string;
      category?: string;
    },
    sort: { active: keyof AuditEntry; direction: 'asc' | 'desc' | '' },
  ): AuditEntry[] {
    let filtered = [...entries];
    const username = filters.username?.trim().toLowerCase();
    if (username) {
      filtered = filtered.filter((entry) => entry.principalName?.toLowerCase().includes(username));
    }
    if (filters.dateFrom) {
      const from = filters.dateFrom.getTime();
      filtered = filtered.filter((entry) => new Date(entry.eventDate).getTime() >= from);
    }
    if (filters.dateTo) {
      const to = filters.dateTo.getTime() + 86_400_000;
      filtered = filtered.filter((entry) => new Date(entry.eventDate).getTime() < to);
    }
    if (filters.action) {
      filtered = filtered.filter((entry) => entry.eventId === filters.action);
    }
    if (filters.category) {
      filtered = filtered.filter((entry) => entry.category === filters.category);
    }
    if (sort.active && sort.direction) {
      const dir = sort.direction === 'asc' ? 1 : -1;
      filtered.sort((a, b) => {
        const va = String(a[sort.active] ?? '');
        const vb = String(b[sort.active] ?? '');
        return va.localeCompare(vb) * dir;
      });
    }
    return filtered;
  }
}
