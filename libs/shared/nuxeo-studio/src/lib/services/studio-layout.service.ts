import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, shareReplay } from 'rxjs';

import { NUXEO_API_ORIGIN } from '@agentic-ui/shared/nuxeo-client';
import { LayoutMode } from '../models/layout.model';

/**
 * Fetches Polymer HTML layout files deployed by Nuxeo Studio Designer.
 *
 * Studio Designer produces static HTML files at conventional paths:
 *   /nuxeo/ui/document/{doctype}/nuxeo-{doctype}-{mode}-layout.html
 *
 * This service fetches those files as raw text, caches the result per
 * doctype+mode, and returns null when no Studio layout exists (404).
 */
@Injectable({ providedIn: 'root' })
export class StudioLayoutService {
  private readonly http = inject(HttpClient);
  private readonly apiOrigin = inject(NUXEO_API_ORIGIN);
  private readonly cache = new Map<string, Observable<string | null>>();

  /**
   * Fetch a Studio Designer layout HTML file.
   * Returns the raw HTML string if found, or null if the layout doesn't exist.
   */
  fetchStudioLayout(docType: string, mode: LayoutMode): Observable<string | null> {
    const cacheKey = `${docType}::${mode}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const url = this.buildLayoutUrl(docType, mode);
    const result$ = this.http.get(url, { responseType: 'text' }).pipe(
      map((html) => (html && html.trim().length > 0 ? html : null)),
      catchError(() => of(null)),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    this.cache.set(cacheKey, result$);
    return result$;
  }

  /**
   * Check whether a Studio layout exists for the given type and mode
   * without returning the full content.
   */
  hasStudioLayout(docType: string, mode: LayoutMode): Observable<boolean> {
    return this.fetchStudioLayout(docType, mode).pipe(map((html) => html !== null));
  }

  /** Clear all cached layout fetches. */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Build the conventional URL for a Studio Designer layout file.
   * Path convention: /nuxeo/ui/document/{lowercase-type}/nuxeo-{lowercase-type}-{mode}-layout.html
   */
  private buildLayoutUrl(docType: string, mode: LayoutMode): string {
    const typeLower = docType.toLowerCase();
    const nuxeoMode = this.toNuxeoLayoutMode(mode);
    const origin = this.apiOrigin.replace(/\/$/, '');
    return `${origin}/nuxeo/ui/document/${typeLower}/nuxeo-${typeLower}-${nuxeoMode}-layout.html`;
  }

  /**
   * Map our internal LayoutMode to Nuxeo's layout file naming convention.
   * Nuxeo uses 'edit' for both edit and create in some cases, but Studio
   * Designer produces separate files for each mode.
   */
  private toNuxeoLayoutMode(mode: LayoutMode): string {
    switch (mode) {
      case 'create':
        return 'create';
      case 'edit':
        return 'edit';
      case 'view':
        return 'view';
      case 'metadata':
        return 'metadata';
      case 'import':
        return 'import';
      default:
        return 'view';
    }
  }
}
