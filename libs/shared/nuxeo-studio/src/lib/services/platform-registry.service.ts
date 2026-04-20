import { Injectable, inject, signal } from '@angular/core';
import { Observable, of, forkJoin, catchError, map, shareReplay } from 'rxjs';

import { NuxeoApiBase } from '@agentic-ui/shared/nuxeo-client';
import { StudioLayoutService } from './studio-layout.service';
import type { LayoutMode } from '../models/layout.model';

export interface PlatformDocType {
  name: string;
  parent?: string;
  schemas?: string[];
  facets?: string[];
}

export interface PlatformPageProvider {
  name: string;
  description?: string;
}

/** Tracks which layout modes are deployed from Studio for a doc type. */
export interface DeployedLayoutInfo {
  docType: string;
  modes: LayoutMode[];
}

const WELL_KNOWN_BUILT_IN: ReadonlySet<string> = new Set([
  'Document',
  'File',
  'Note',
  'Folder',
  'Workspace',
  'Picture',
  'Video',
  'Audio',
  'Collection',
  'Section',
  'Domain',
  'OrderedFolder',
  'HiddenFolder',
  'Root',
  'Favorites',
  'UserWorkspacesRoot',
  'UserProfile',
  'AdministrativeStatus',
  'AdministrativeStatusContainer',
  'AdvancedContent',
  'AdvancedSearch',
  'Relation',
  'Comment',
  'ManagementRoot',
  'TemplateRoot',
  'CommentRoot',
  'SectionRoot',
  'WorkspaceRoot',
  'Collections',
]);

const WELL_KNOWN_PAGE_PROVIDERS = [
  'default_search',
  'advanced_document_content',
  'default_document_suggestion',
  'REST_API_SEARCH_ADAPTER',
  'nxql_search',
  'expired_search',
  'default_trash_search',
  'all_collections',
  'simple_search',
];

/**
 * Discovers document types, page providers, and other registrations
 * from the live Nuxeo platform. This enables the Angular Studio Designer
 * to show types/providers created in Nuxeo Studio automatically.
 */
@Injectable({ providedIn: 'root' })
export class PlatformRegistryService {
  private readonly api = inject(NuxeoApiBase);
  private readonly studioLayout = inject(StudioLayoutService);

  private readonly _allDocTypes = signal<PlatformDocType[]>([]);
  private readonly _localDocTypes = signal<PlatformDocType[]>([]);
  private readonly _builtInDocTypes = signal<PlatformDocType[]>([]);
  private readonly _pageProviders = signal<string[]>([]);
  private readonly _deployedLayouts = signal<Map<string, Set<LayoutMode>>>(new Map());
  private readonly _loaded = signal(false);

  readonly allDocTypes = this._allDocTypes.asReadonly();
  readonly localDocTypes = this._localDocTypes.asReadonly();
  readonly builtInDocTypes = this._builtInDocTypes.asReadonly();
  readonly pageProviders = this._pageProviders.asReadonly();
  readonly deployedLayouts = this._deployedLayouts.asReadonly();
  readonly loaded = this._loaded.asReadonly();

  private typesRequest$?: Observable<PlatformDocType[]>;
  private ppRequest$?: Observable<string[]>;

  /**
   * Load all platform registrations. Safe to call multiple times;
   * subsequent calls return the cached Observable.
   */
  loadAll(): Observable<void> {
    return new Observable<void>((subscriber) => {
      const types$ = this.fetchDocTypes();
      const pp$ = this.fetchPageProviders();

      let completed = 0;
      const done = () => {
        completed++;
        if (completed >= 2) {
          this._loaded.set(true);
          this.probeDeployedLayouts();
          subscriber.next();
          subscriber.complete();
        }
      };

      types$.subscribe({ next: () => done(), error: () => done() });
      pp$.subscribe({ next: () => done(), error: () => done() });
    });
  }

  /** All type names as a flat string array (for autocomplete inputs). */
  getAllTypeNames(): string[] {
    return this._allDocTypes().map((t) => t.name);
  }

  /** Check if a type is a custom/local type (not a well-known built-in). */
  isLocalType(name: string): boolean {
    return !WELL_KNOWN_BUILT_IN.has(name);
  }

  private fetchDocTypes(): Observable<PlatformDocType[]> {
    if (this.typesRequest$) return this.typesRequest$;

    this.typesRequest$ = this.api.get<Record<string, unknown>>('/nuxeo/api/v1/config/types').pipe(
      map((response) => {
        const doctypes = (response['doctypes'] ?? response) as Record<
          string,
          { parent?: string; schemas?: { name: string }[]; facets?: string[] }
        >;

        const all: PlatformDocType[] = Object.entries(doctypes).map(([name, def]) => ({
          name,
          parent: def?.parent,
          schemas: def?.schemas?.map((s) => s.name) ?? [],
          facets: def?.facets ?? [],
        }));

        all.sort((a, b) => a.name.localeCompare(b.name));

        this._allDocTypes.set(all);
        this._localDocTypes.set(all.filter((t) => !WELL_KNOWN_BUILT_IN.has(t.name)));
        this._builtInDocTypes.set(all.filter((t) => WELL_KNOWN_BUILT_IN.has(t.name)));

        return all;
      }),
      catchError(() => {
        this.setFallbackDocTypes();
        return of(this._allDocTypes());
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );

    return this.typesRequest$;
  }

  private fetchPageProviders(): Observable<string[]> {
    if (this.ppRequest$) return this.ppRequest$;

    this.ppRequest$ = this.api
      .get<Record<string, unknown>>('/nuxeo/api/v1/config/searchProviders')
      .pipe(
        map((response) => {
          const providers = Object.keys(response);
          this._pageProviders.set(providers.sort());
          return providers;
        }),
        catchError(() => {
          this._pageProviders.set([...WELL_KNOWN_PAGE_PROVIDERS]);
          return of(this._pageProviders());
        }),
        shareReplay({ bufferSize: 1, refCount: false }),
      );

    return this.ppRequest$;
  }

  /**
   * Check if a specific doc type has a Studio-deployed layout for the given mode.
   */
  hasDeployedLayout(docType: string, mode: LayoutMode): boolean {
    return this._deployedLayouts().get(docType)?.has(mode) ?? false;
  }

  /**
   * Get all modes that have deployed Studio layouts for a doc type.
   */
  getDeployedModes(docType: string): LayoutMode[] {
    const modes = this._deployedLayouts().get(docType);
    return modes ? Array.from(modes) : [];
  }

  /**
   * Probe the Nuxeo server for deployed Studio layouts across all known
   * local (custom) document types. Runs in the background after initial load.
   */
  private probeDeployedLayouts(): void {
    const localTypes = this._localDocTypes();
    if (localTypes.length === 0) return;

    const allModes: LayoutMode[] = ['create', 'edit', 'view', 'metadata', 'import'];
    const probes: Observable<{ docType: string; mode: LayoutMode; exists: boolean }>[] = [];

    for (const dt of localTypes) {
      for (const mode of allModes) {
        probes.push(
          this.studioLayout.hasStudioLayout(dt.name, mode).pipe(
            map((exists) => ({ docType: dt.name, mode, exists })),
            catchError(() => of({ docType: dt.name, mode, exists: false })),
          ),
        );
      }
    }

    if (probes.length === 0) return;

    forkJoin(probes).subscribe((results) => {
      const layoutMap = new Map<string, Set<LayoutMode>>();
      for (const r of results) {
        if (r.exists) {
          if (!layoutMap.has(r.docType)) {
            layoutMap.set(r.docType, new Set());
          }
          layoutMap.get(r.docType)?.add(r.mode);
        }
      }
      this._deployedLayouts.set(layoutMap);
    });
  }

  /**
   * Probe a specific doc type for deployed layouts (useful when a type
   * is first selected in the designer and hasn't been probed yet).
   */
  probeLayoutsForType(docType: string): Observable<LayoutMode[]> {
    const allModes: LayoutMode[] = ['create', 'edit', 'view', 'metadata', 'import'];
    const probes = allModes.map((mode) =>
      this.studioLayout.hasStudioLayout(docType, mode).pipe(
        map((exists) => ({ mode, exists })),
        catchError(() => of({ mode, exists: false })),
      ),
    );

    return forkJoin(probes).pipe(
      map((results) => {
        const modes = results.filter((r) => r.exists).map((r) => r.mode);
        const current = this._deployedLayouts();
        const updated = new Map(current);
        if (modes.length > 0) {
          updated.set(docType, new Set(modes));
        }
        this._deployedLayouts.set(updated);
        return modes;
      }),
    );
  }

  private setFallbackDocTypes(): void {
    const fallback: PlatformDocType[] = [
      'Document',
      'File',
      'Note',
      'Folder',
      'Workspace',
      'Picture',
      'Video',
      'Audio',
      'Collection',
      'Section',
      'Domain',
      'OrderedFolder',
    ].map((name) => ({ name }));

    this._allDocTypes.set(fallback);
    this._localDocTypes.set([]);
    this._builtInDocTypes.set(fallback);
  }
}
