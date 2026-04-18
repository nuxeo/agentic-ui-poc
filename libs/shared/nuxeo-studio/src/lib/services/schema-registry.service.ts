import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map, of, shareReplay, switchMap } from 'rxjs';

import { NuxeoApiBase } from '@agentic-ui/shared/nuxeo-client';
import {
  NuxeoFieldDef,
  NuxeoFieldResponseEntry,
  NuxeoFieldType,
  NuxeoSchemaDefinition,
  NuxeoSchemaResponse,
  NuxeoTypeDefinition,
  NuxeoTypeResponse,
} from '../models/schema.model';

/**
 * Fetches and caches Nuxeo document type and schema definitions from
 * the platform's /config/* REST API. Provides strongly-typed field
 * metadata for the Layout Engine and Widget Registry.
 */
@Injectable({ providedIn: 'root' })
export class SchemaRegistryService {
  private readonly api = inject(NuxeoApiBase);

  private readonly typeCache = new Map<string, Observable<NuxeoTypeDefinition>>();
  private readonly schemaCache = new Map<string, Observable<NuxeoSchemaDefinition>>();
  private readonly allTypesCache$ = this.fetchAllTypes();

  // ----- Public API -----

  /** Fetch a single document type definition (cached). */
  getType(docType: string): Observable<NuxeoTypeDefinition> {
    const cached = this.typeCache.get(docType);
    if (cached) return cached;

    const result$ = this.api
      .get<NuxeoTypeResponse>(`/nuxeo/api/v1/config/types/${encodeURIComponent(docType)}`)
      .pipe(
        map((raw) => this.parseTypeResponse(raw)),
        shareReplay({ bufferSize: 1, refCount: false }),
      );

    this.typeCache.set(docType, result$);
    return result$;
  }

  /** Fetch a single schema definition (cached). */
  getSchema(schemaName: string): Observable<NuxeoSchemaDefinition> {
    const cached = this.schemaCache.get(schemaName);
    if (cached) return cached;

    const result$ = this.api
      .get<NuxeoSchemaResponse>(`/nuxeo/api/v1/config/schemas/${encodeURIComponent(schemaName)}`)
      .pipe(
        map((raw) => this.parseSchemaResponse(raw)),
        shareReplay({ bufferSize: 1, refCount: false }),
      );

    this.schemaCache.set(schemaName, result$);
    return result$;
  }

  /** Get all document type names registered on the server. */
  getAllTypeNames(): Observable<string[]> {
    return this.allTypesCache$;
  }

  /**
   * Get all field definitions for a document type.
   * Resolves inherited schemas and facet-attached schemas.
   */
  getFieldsForType(docType: string): Observable<NuxeoFieldDef[]> {
    return this.getType(docType).pipe(map((td) => td.fields));
  }

  /**
   * Find a specific field definition by xpath within a document type.
   */
  getField(docType: string, xpath: string): Observable<NuxeoFieldDef | undefined> {
    return this.getFieldsForType(docType).pipe(map((fields) => this.findField(fields, xpath)));
  }

  /**
   * Well-known facet → schema mappings.
   * Nuxeo facets attach additional schemas to documents at runtime.
   * The config/types API includes facets but may not always list
   * the facet-attached schemas in the schemas array.
   */
  private static readonly FACET_SCHEMAS: Record<string, string[]> = {
    Versionable: ['uid'],
    Publishable: ['publishing'],
    HasRelatedText: ['relatedtext'],
    Thumbnail: ['thumbnail'],
    Picture: ['picture', 'image_metadata'],
    Video: ['video', 'vid'],
    Audio: ['audio'],
    Collection: ['collection'],
    CollectionMember: ['collectionMember'],
    NXTag: ['tag'],
    Commentable: ['comment'],
  };

  /**
   * Get additional field definitions from facet-attached schemas.
   * For facets not already covered by the type's schema list,
   * this fetches the additional schema definitions.
   */
  getFieldsForFacets(facets: string[], existingSchemas: string[]): Observable<NuxeoFieldDef[]> {
    const additionalSchemas = new Set<string>();

    for (const facet of facets) {
      const schemas = SchemaRegistryService.FACET_SCHEMAS[facet];
      if (schemas) {
        for (const s of schemas) {
          if (!existingSchemas.includes(s)) {
            additionalSchemas.add(s);
          }
        }
      }
    }

    if (additionalSchemas.size === 0) return of([]);

    const fetches = Array.from(additionalSchemas).map((name) =>
      this.getSchema(name).pipe(map((schema) => schema.fields)),
    );

    return forkJoin(fetches).pipe(map((results) => results.flat()));
  }

  /**
   * Get all fields for a document type including facet-attached schemas.
   */
  getFieldsForTypeWithFacets(docType: string): Observable<NuxeoFieldDef[]> {
    return this.getType(docType).pipe(
      switchMap((typeDef) =>
        this.getFieldsForFacets(typeDef.facets, typeDef.schemas).pipe(
          map((facetFields) => [...typeDef.fields, ...facetFields]),
        ),
      ),
    );
  }

  /** Clear all cached type and schema definitions. */
  clearCache(): void {
    this.typeCache.clear();
    this.schemaCache.clear();
  }

  // ----- Parsing helpers -----

  private fetchAllTypes(): Observable<string[]> {
    return this.api.get<Record<string, unknown>>('/nuxeo/api/v1/config/types').pipe(
      map((response) => {
        if (response && typeof response === 'object' && 'doctypes' in response) {
          return Object.keys(response['doctypes'] as Record<string, unknown>);
        }
        return Object.keys(response);
      }),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
  }

  private parseTypeResponse(raw: NuxeoTypeResponse): NuxeoTypeDefinition {
    const fields: NuxeoFieldDef[] = [];

    for (const schema of raw.schemas ?? []) {
      const prefix = schema.prefix || schema.name;
      for (const [fieldName, entry] of Object.entries(schema.fields ?? {})) {
        fields.push(this.parseField(fieldName, prefix, entry));
      }
    }

    return {
      name: raw.name,
      parent: raw.parent ?? 'Document',
      facets: raw.facets ?? [],
      schemas: (raw.schemas ?? []).map((s) => s.name),
      fields,
    };
  }

  private parseSchemaResponse(raw: NuxeoSchemaResponse): NuxeoSchemaDefinition {
    const prefix = raw['@prefix'] || raw.name;
    const fields: NuxeoFieldDef[] = [];

    for (const [fieldName, entry] of Object.entries(raw.fields ?? {})) {
      fields.push(this.parseField(fieldName, prefix, entry));
    }

    return { name: raw.name, prefix, fields };
  }

  private parseField(name: string, prefix: string, entry: NuxeoFieldResponseEntry): NuxeoFieldDef {
    const xpath = `${prefix}:${name}`;
    const fieldType = this.normalizeFieldType(entry.type);

    const field: NuxeoFieldDef = {
      xpath,
      name,
      schemaPrefix: prefix,
      type: fieldType,
      constraints: entry.constraints ?? [],
      defaultValue: entry.defaultValue,
    };

    if (entry.fields && (fieldType === 'complex' || fieldType === 'complex[]')) {
      field.fields = [];
      for (const [subName, subEntry] of Object.entries(entry.fields)) {
        field.fields.push(this.parseSubField(subName, xpath, subEntry));
      }
    }

    return field;
  }

  private parseSubField(
    name: string,
    parentXpath: string,
    entry: NuxeoFieldResponseEntry,
  ): NuxeoFieldDef {
    const xpath = `${parentXpath}/${name}`;
    const fieldType = this.normalizeFieldType(entry.type);

    const field: NuxeoFieldDef = {
      xpath,
      name,
      schemaPrefix: '',
      type: fieldType,
      constraints: entry.constraints ?? [],
      defaultValue: entry.defaultValue,
    };

    if (entry.fields && (fieldType === 'complex' || fieldType === 'complex[]')) {
      field.fields = [];
      for (const [subName, subEntry] of Object.entries(entry.fields)) {
        field.fields.push(this.parseSubField(subName, xpath, subEntry));
      }
    }

    return field;
  }

  private normalizeFieldType(raw: string): NuxeoFieldType {
    const mapping: Record<string, NuxeoFieldType> = {
      string: 'string',
      date: 'date',
      integer: 'integer',
      long: 'long',
      float: 'float',
      double: 'double',
      boolean: 'boolean',
      blob: 'blob',
      complex: 'complex',
      content: 'blob',
      'string[]': 'string[]',
      'integer[]': 'integer[]',
      'date[]': 'date[]',
      'blob[]': 'blob[]',
      'complex[]': 'complex[]',
    };

    const lower = raw.toLowerCase().trim();
    // Handle "String[]" style
    if (lower.endsWith('[]') && !mapping[lower]) {
      const base = lower.slice(0, -2);
      return (mapping[base + '[]'] ?? 'string[]') as NuxeoFieldType;
    }
    return mapping[lower] ?? 'string';
  }

  private findField(fields: NuxeoFieldDef[], xpath: string): NuxeoFieldDef | undefined {
    for (const field of fields) {
      if (field.xpath === xpath) return field;
      if (field.fields) {
        const sub = this.findField(field.fields, xpath);
        if (sub) return sub;
      }
    }
    return undefined;
  }
}
