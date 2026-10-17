import { Observable } from 'rxjs';
import * as i0 from "@angular/core";
export interface TagEntry {
    label: string;
}
export declare class TagService {
    private readonly api;
    private readonly http;
    /**
     * Tags the document and answers with all its tags afterwards. Nuxeo normalises a label — "Q3
     * Report" is stored as `q3report` — so what to show is the label it stored, not the one typed.
     */
    addTag(uid: string, label: string): Observable<string[]>;
    /** Takes the tag off the document and answers with the tags it still has. */
    removeTag(uid: string, label: string): Observable<string[]>;
    searchTags(term: string): Observable<string[]>;
    /**
     * Existing tags matching `term`, as Web UI's tag suggestion lists them: the `Tag.Suggestion`
     * operation. `searchTags` reads a `label_tag_entry` directory, which a stock Nuxeo 2025 answers
     * with 404. An entry with neither a label nor an id is skipped, and an answer that is not a list
     * is no suggestions; a server error reaches the caller.
     */
    suggestTags(term: string): Observable<string[]>;
    static ɵfac: i0.ɵɵFactoryDeclaration<TagService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<TagService>;
}
//# sourceMappingURL=tag.service.d.ts.map