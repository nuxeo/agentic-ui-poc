import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { docTypeIcon } from '../constants/doc-type-icons';
import type {
  KnowledgeDiscoveryQueryRequest,
  KnowledgeDiscoveryResponse,
  KnowledgeDiscoverySource,
  KnowledgeDiscoveryStatus,
} from '../models/knowledge-discovery.model';
import type { SearchResultItem } from '../models/search.model';
import { NuxeoApiBase } from './nuxeo-api-base';

const KNOWLEDGE_DISCOVERY_ENDPOINT = '/nuxeo/api/v1/automation/KnowledgeDiscovery.Query';
const JSON_HEADERS = {
  'Content-Type': 'application/json',
  properties: 'dublincore,file,common',
} as const;

@Injectable({ providedIn: 'root' })
export class KnowledgeDiscoveryService {
  private readonly api = inject(NuxeoApiBase);

  query(request: KnowledgeDiscoveryQueryRequest): Observable<KnowledgeDiscoveryResponse> {
    return this.api
      .post<unknown>(
        KNOWLEDGE_DISCOVERY_ENDPOINT,
        {
          params: {
            query: request.query.trim(),
            limit: request.limit ?? 5,
          },
          context: {},
        },
        JSON_HEADERS,
      )
      .pipe(map((response) => this.normalizeResponse(response)));
  }

  private normalizeResponse(response: unknown): KnowledgeDiscoveryResponse {
    const raw = this.asRecord(response);
    const answer = this.pickString(raw['answer'], raw['response'], raw['reply']);
    const status = this.normalizeStatus(
      this.pickString(raw['responseCompleteness'], raw['status'], raw['state']),
    );
    const items = this.normalizeItems(
      raw['items'],
      raw['documents'],
      raw['results'],
      raw['entries'],
    );
    const sources = this.normalizeSources(
      raw['sources'],
      raw['objectReferences'],
      raw['references'],
      raw['citations'],
    );

    return {
      answer,
      status,
      items,
      sources,
      questionId: this.pickString(raw['questionId'], raw['question_id']),
      agentId: this.pickString(raw['agentId'], raw['agent_id']),
      error: this.pickString(raw['error'], raw['message']) || undefined,
    };
  }

  private normalizeItems(...values: unknown[]): SearchResultItem[] {
    const entries = values.find(Array.isArray);
    if (!Array.isArray(entries)) return [];

    return entries
      .map((entry) => this.mapItem(entry))
      .filter((item): item is SearchResultItem => item !== null);
  }

  private mapItem(value: unknown): SearchResultItem | null {
    const raw = this.asRecord(value);
    const id = this.pickString(raw['id'], raw['uid'], raw['objectId']);
    if (!id) return null;

    const title =
      this.pickString(raw['title'], raw['name'], raw['label'], raw['objectTitle']) || id;
    const type = this.pickString(raw['type'], raw['primaryType']) || 'Document';
    const author = this.pickString(raw['author'], raw['creator'], raw['createdBy']);
    const lastContributor = this.pickString(
      raw['lastContributor'],
      raw['modifiedBy'],
      raw['author'],
      raw['creator'],
    );

    return {
      id,
      title,
      type,
      path: this.pickString(raw['path'], raw['uri']),
      modifiedDate:
        this.pickString(raw['modifiedDate'], raw['lastModified'], raw['modified']) || '',
      sizeInBytes: this.toNumber(raw['sizeInBytes'], raw['size']) ?? undefined,
      lastContributor,
      createdDate: this.pickString(raw['createdDate'], raw['created']),
      author,
      authorKey: author,
      state: this.pickString(raw['state'], raw['lifecycleState']),
      version: this.pickString(raw['version']),
      nature: this.pickString(raw['nature']),
      coverage: this.pickString(raw['coverage']),
      subjects: this.toSubjects(raw['subjects']),
      flags: this.pickString(raw['flags']),
      collection: this.pickString(raw['collection']) || '',
      collectionKey: this.pickString(raw['collectionKey']) || '',
      tags: this.toStringArray(raw['tags']),
      icon: this.pickString(raw['icon']) || docTypeIcon(type),
      isFavorite: typeof raw['isFavorite'] === 'boolean' ? raw['isFavorite'] : false,
    };
  }

  private normalizeSources(...values: unknown[]): KnowledgeDiscoverySource[] {
    const sources: KnowledgeDiscoverySource[] = [];

    for (const value of values) {
      if (!Array.isArray(value)) continue;

      for (const entry of value) {
        const raw = this.asRecord(entry);
        const refs = Array.isArray(raw['references']) ? raw['references'] : null;

        if (refs && refs.length > 0) {
          const objectId = this.pickString(raw['objectId'], raw['id']) || 'unknown-source';
          const title =
            this.pickString(raw['title'], raw['objectTitle'], raw['label'], raw['name']) ||
            objectId;

          for (const ref of refs) {
            const refRaw = this.asRecord(ref);
            sources.push({
              objectId,
              referenceId: this.pickString(refRaw['referenceId'], refRaw['id']) || undefined,
              title,
              path: this.pickString(raw['path']),
              excerpt: this.pickString(refRaw['content'], refRaw['excerpt'], refRaw['summary']),
              uri: this.pickString(raw['uri'], refRaw['uri']),
              score: this.toNumber(refRaw['rankScore'], refRaw['score']) ?? undefined,
            });
          }
          continue;
        }

        const objectId = this.pickString(raw['objectId'], raw['id']);
        if (!objectId) continue;

        sources.push({
          objectId,
          referenceId: this.pickString(raw['referenceId']) || undefined,
          title:
            this.pickString(raw['title'], raw['objectTitle'], raw['label'], raw['name']) ||
            objectId,
          path: this.pickString(raw['path']),
          excerpt: this.pickString(raw['content'], raw['excerpt'], raw['summary']),
          uri: this.pickString(raw['uri']),
          score: this.toNumber(raw['rankScore'], raw['score']) ?? undefined,
        });
      }
    }

    return sources;
  }

  private normalizeStatus(value: string): KnowledgeDiscoveryStatus {
    switch (value) {
      case 'Complete':
      case 'Submitted':
      case 'Error':
        return value;
      default:
        return 'Unknown';
    }
  }

  private toSubjects(value: unknown): string {
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === 'string').join(', ');
    }

    return typeof value === 'string' ? value : '';
  }

  private toStringArray(value: unknown): string[] {
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is string => typeof item === 'string');
  }

  private toNumber(...values: unknown[]): number | null {
    for (const value of values) {
      if (typeof value === 'number' && Number.isFinite(value)) return value;
      if (typeof value === 'string') {
        const parsed = Number(value);
        if (Number.isFinite(parsed)) return parsed;
      }
    }

    return null;
  }

  private pickString(...values: unknown[]): string {
    for (const value of values) {
      if (typeof value === 'string' && value.trim().length > 0) return value.trim();
    }

    return '';
  }

  private asRecord(value: unknown): Record<string, unknown> {
    return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  }
}
