import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs';
import { NuxeoApiBase } from './nuxeo-api-base';
import * as i0 from "@angular/core";
export class TagService {
    api = inject(NuxeoApiBase);
    http = inject(HttpClient);
    /**
     * Tags the document and answers with all its tags afterwards. Nuxeo normalises a label — "Q3
     * Report" is stored as `q3report` — so what to show is the label it stored, not the one typed.
     */
    addTag(uid, label) {
        return this.api
            .post(`/nuxeo/api/v1/id/${uid}/@op/Services.TagDocument`, { params: { tags: label }, context: {} }, TAGS_SCHEMA)
            .pipe(map(tagLabels));
    }
    /** Takes the tag off the document and answers with the tags it still has. */
    removeTag(uid, label) {
        return this.api
            .post(`/nuxeo/api/v1/id/${uid}/@op/Services.UntagDocument`, { params: { tags: label }, context: {} }, TAGS_SCHEMA)
            .pipe(map(tagLabels));
    }
    searchTags(term) {
        const params = new HttpParams().set('pageSize', '20').set('currentPageIndex', '0');
        return this.http
            .get(this.api.apiUrl('/nuxeo/api/v1/directory/label_tag_entry'), { params })
            .pipe(map((res) => res.entries
            .map((e) => e.properties.label)
            .filter((l) => l.toLowerCase().includes(term.toLowerCase()))));
    }
    /**
     * Existing tags matching `term`, as Web UI's tag suggestion lists them: the `Tag.Suggestion`
     * operation. `searchTags` reads a `label_tag_entry` directory, which a stock Nuxeo 2025 answers
     * with 404. An entry with neither a label nor an id is skipped, and an answer that is not a list
     * is no suggestions; a server error reaches the caller.
     */
    suggestTags(term) {
        return this.api
            .post('/nuxeo/api/v1/automation/Tag.Suggestion', { params: { searchTerm: term }, context: {} }, { 'Content-Type': 'application/json' })
            .pipe(map((answer) => Array.isArray(answer) ? answer.map(suggestionLabel).filter((label) => label !== '') : []));
    }
    static ɵfac = function TagService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || TagService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: TagService, factory: TagService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(TagService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
/** A `Tag.Suggestion` entry's label, or its id when it has none; empty when it has neither. */
function suggestionLabel(entry) {
    if (typeof entry !== 'object' || entry === null)
        return '';
    const label = 'displayLabel' in entry ? entry.displayLabel : undefined;
    const id = 'id' in entry ? entry.id : undefined;
    return (typeof label === 'string' && label) || (typeof id === 'string' ? id : '');
}
/** Asks for the schema holding `nxtag:tags`, which the operations' answer otherwise leaves out. */
const TAGS_SCHEMA = { properties: 'facetedTag' };
const tagLabels = (doc) => {
    const tags = doc?.properties?.['nxtag:tags'];
    return Array.isArray(tags)
        ? tags
            .map((tag) => typeof tag === 'string' ? tag : (tag?.label ?? ''))
            .filter(Boolean)
        : [];
};
//# sourceMappingURL=tag.service.js.map