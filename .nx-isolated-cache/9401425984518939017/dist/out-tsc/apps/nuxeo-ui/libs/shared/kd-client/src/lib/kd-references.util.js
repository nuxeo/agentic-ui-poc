const REFERENCE_CONTENT_KEYS = [
    'content',
    'text',
    'snippet',
    'passage',
    'excerpt',
    'chunkContent',
    'referenceContent',
];
/** Extract quoted passage text from a raw reference payload (field names vary by API version). */
export function extractReferenceContent(reference) {
    if (!reference || typeof reference !== 'object') {
        return undefined;
    }
    const typed = reference;
    if (typeof typed.content === 'string' && typed.content.trim().length > 0) {
        return sanitizeReferenceContent(typed.content);
    }
    const raw = reference;
    for (const key of REFERENCE_CONTENT_KEYS) {
        const value = raw[key];
        if (typeof value === 'string' && value.trim().length > 0) {
            return sanitizeReferenceContent(value);
        }
    }
    return undefined;
}
/** Normalize a single reference entry from the Discovery API. */
export function normalizeObjectReferenceEntry(reference) {
    const raw = reference;
    const typed = reference;
    return {
        referenceId: typeof raw['referenceId'] === 'string' ? raw['referenceId'] : typed.referenceId,
        rank: typeof raw['rank'] === 'number' ? raw['rank'] : typed.rank,
        rankScore: typeof raw['rankScore'] === 'number' ? raw['rankScore'] : typed.rankScore,
        pageNumber: typeof raw['pageNumber'] === 'number' ? raw['pageNumber'] : typed.pageNumber,
        content: extractReferenceContent(reference),
    };
}
/** Normalize all object references on an answer payload. */
export function normalizeObjectReferences(objectReferences) {
    if (!objectReferences?.length) {
        return objectReferences;
    }
    return objectReferences.map((objectReference) => ({
        ...objectReference,
        references: (objectReference.references ?? []).map((reference) => normalizeObjectReferenceEntry(reference)),
    }));
}
/** Merge reference content from a fuller answer payload into an existing list. */
export function mergeObjectReferenceContent(current, incoming) {
    if (!incoming?.length) {
        return current;
    }
    if (!current?.length) {
        return incoming;
    }
    const contentByKey = new Map();
    for (const objectReference of incoming) {
        for (const reference of objectReference.references ?? []) {
            const content = extractReferenceContent(reference);
            if (content) {
                contentByKey.set(`${objectReference.objectId}::${reference.referenceId ?? ''}`, content);
            }
        }
    }
    return current.map((objectReference) => ({
        ...objectReference,
        references: (objectReference.references ?? []).map((reference) => {
            const mergedContent = extractReferenceContent(reference) ??
                contentByKey.get(`${objectReference.objectId}::${reference.referenceId ?? ''}`);
            return mergedContent ? { ...reference, content: mergedContent } : reference;
        }),
    }));
}
function sanitizeReferenceContent(value) {
    const trimmed = value.trim();
    if (!trimmed || isLikelyDocumentPath(trimmed)) {
        return undefined;
    }
    return trimmed;
}
function isLikelyDocumentPath(value) {
    return value.startsWith('/') && !value.includes('\n') && value.length < 500;
}
function citationExcerptLookup(citations) {
    const lookup = new Map();
    for (const citation of citations) {
        const excerpt = sanitizeReferenceContent(citation.excerpt ?? '') ??
            extractReferenceContent(citation);
        lookup.set(`${citation.objectId}::${citation.referenceId ?? ''}`, excerpt);
        if (!lookup.has(`${citation.objectId}::`)) {
            lookup.set(`${citation.objectId}::`, excerpt);
        }
    }
    return lookup;
}
function resolveReferenceContent(objectId, reference, citationExcerpts) {
    return (extractReferenceContent(reference) ??
        citationExcerpts.get(`${objectId}::${reference.referenceId ?? ''}`) ??
        citationExcerpts.get(`${objectId}::`));
}
/** Enrich citation excerpts from matching `objectReferences` entries. */
export function enrichCitationsFromObjectReferences(citations, objectReferences) {
    if (!citations.length) {
        return citations;
    }
    const entryByKey = objectReferenceEntryLookup(normalizeObjectReferences(objectReferences) ?? []);
    return citations.map((citation) => {
        const excerpt = sanitizeReferenceContent(citation.excerpt ?? '') ??
            extractReferenceContent(citation) ??
            extractReferenceContent(entryByKey.get(`${citation.objectId}::${citation.referenceId ?? ''}`)) ??
            extractReferenceContent(entryByKey.get(`${citation.objectId}::`));
        return excerpt ? { ...citation, excerpt } : citation;
    });
}
/** Merge citation excerpts from a fuller answer payload into an existing list. */
export function mergeCitationExcerpts(current, incoming) {
    if (!incoming?.length) {
        return current ?? [];
    }
    if (!current?.length) {
        return incoming;
    }
    const excerptByKey = new Map();
    for (const citation of incoming) {
        const excerpt = sanitizeReferenceContent(citation.excerpt ?? '') ??
            extractReferenceContent(citation);
        if (excerpt) {
            excerptByKey.set(`${citation.objectId}::${citation.referenceId ?? ''}`, excerpt);
        }
    }
    return current.map((citation) => {
        const mergedExcerpt = sanitizeReferenceContent(citation.excerpt ?? '') ??
            excerptByKey.get(`${citation.objectId}::${citation.referenceId ?? ''}`) ??
            excerptByKey.get(`${citation.objectId}::`);
        return mergedExcerpt ? { ...citation, excerpt: mergedExcerpt } : citation;
    });
}
/** Flatten `objectReferences` into one citation per referenced chunk. */
export function flattenObjectReferencesToCitations(objectReferences, titleForObjectId) {
    const citations = [];
    for (const objectReference of normalizeObjectReferences(objectReferences) ?? []) {
        const title = titleForObjectId?.(objectReference.objectId) ??
            extractNuxeoDocumentId(objectReference.objectId) ??
            objectReference.objectId;
        for (const reference of objectReference.references ?? []) {
            citations.push({
                objectId: objectReference.objectId,
                referenceId: reference.referenceId,
                title,
                excerpt: extractReferenceContent(reference),
                score: reference.rankScore,
            });
        }
    }
    return citations;
}
function objectReferenceEntryLookup(objectReferences) {
    const lookup = new Map();
    for (const objectReference of objectReferences) {
        for (const reference of objectReference.references ?? []) {
            lookup.set(`${objectReference.objectId}::${reference.referenceId ?? ''}`, reference);
        }
    }
    return lookup;
}
/** Highest `[N]` marker present in the answer text. */
export function getMaxCitationIndex(answerText) {
    let max = 0;
    for (const segment of parseAnswerSegments(answerText)) {
        if (segment.type === 'citation' && segment.index > max) {
            max = segment.index;
        }
    }
    return max;
}
/** Trim long reference excerpts for the citation sidebar. */
export function formatReferenceExcerpt(content, maxLength = 420) {
    const trimmed = content?.trim();
    if (!trimmed) {
        return '';
    }
    if (trimmed.length <= maxLength) {
        return trimmed;
    }
    return `${trimmed.slice(0, maxLength).trimEnd()}…`;
}
function buildIndexedReferencesFromCitations(answer, objectReferences, citationExcerpts) {
    const entryByKey = objectReferenceEntryLookup(objectReferences);
    return answer.citations.map((citation, position) => {
        const entry = entryByKey.get(`${citation.objectId}::${citation.referenceId ?? ''}`) ??
            entryByKey.get(`${citation.objectId}::`);
        return {
            index: position + 1,
            objectId: citation.objectId,
            referenceId: citation.referenceId,
            content: (entry ? resolveReferenceContent(citation.objectId, entry, citationExcerpts) : undefined) ??
                citationExcerpts.get(`${citation.objectId}::${citation.referenceId ?? ''}`) ??
                sanitizeReferenceContent(citation.excerpt ?? ''),
            pageNumber: entry?.pageNumber,
            rank: entry?.rank,
            rankScore: entry?.rankScore ?? citation.score,
            title: citation.title,
        };
    });
}
function buildIndexedReferencesFromObjectReferences(objectReferences, titleByObjectId, citationExcerpts) {
    const indexed = [];
    let nextIndex = 1;
    for (const objectReference of objectReferences) {
        for (const reference of objectReference.references ?? []) {
            indexed.push({
                index: nextIndex++,
                objectId: objectReference.objectId,
                referenceId: reference.referenceId,
                content: resolveReferenceContent(objectReference.objectId, reference, citationExcerpts),
                pageNumber: reference.pageNumber,
                rank: reference.rank,
                rankScore: reference.rankScore,
                title: titleByObjectId.get(objectReference.objectId),
            });
        }
    }
    return indexed;
}
/** Extract the Nuxeo document UUID from a Content Lake `objectId` (`sourceId__documentId`). */
export function extractNuxeoDocumentId(objectId) {
    const documentId = objectId.split('__').pop();
    return documentId && documentId !== objectId ? documentId : null;
}
/**
 * Build a 1-based indexed reference list aligned with inline `[N]` markers in the answer.
 * Prefers the `citations` array order (what the LLM numbers) and enriches entries from
 * `objectReferences`. Falls back to flattening `objectReferences` in API order.
 */
export function buildIndexedReferences(answer) {
    const objectReferences = normalizeObjectReferences(answer.objectReferences) ?? [];
    const citations = enrichCitationsFromObjectReferences(answer.citations, objectReferences);
    const titleByObjectId = new Map(citations.map((citation) => [citation.objectId, citation.title]));
    const citationExcerpts = citationExcerptLookup(citations);
    const maxCitationIndex = getMaxCitationIndex(answer.answer);
    if (citations.length > 0 && citations.length >= maxCitationIndex) {
        return buildIndexedReferencesFromCitations({ ...answer, citations }, objectReferences, citationExcerpts);
    }
    if (objectReferences.length > 0) {
        return buildIndexedReferencesFromObjectReferences(objectReferences, titleByObjectId, citationExcerpts);
    }
    return citations.map((citation, position) => ({
        index: position + 1,
        objectId: citation.objectId,
        referenceId: citation.referenceId,
        content: sanitizeReferenceContent(citation.excerpt ?? ''),
        rankScore: citation.score,
        title: citation.title,
    }));
}
/**
 * Split answer text into plain text and clickable citation markers.
 * Supports `[1]`, `[^1]`, and `(1)` markers used by Knowledge Discovery responses.
 */
export function parseAnswerSegments(answerText) {
    const segments = [];
    const pattern = /\[(\d+)\]|\[\^(\d+)\]|\((\d+)\)/g;
    let lastIndex = 0;
    for (const match of answerText.matchAll(pattern)) {
        const markerIndex = match.index ?? 0;
        if (markerIndex > lastIndex) {
            segments.push({ type: 'text', text: answerText.slice(lastIndex, markerIndex) });
        }
        const citationNumber = Number(match[1] ?? match[2] ?? match[3]);
        if (Number.isFinite(citationNumber) && citationNumber > 0) {
            segments.push({ type: 'citation', index: citationNumber });
        }
        else {
            segments.push({ type: 'text', text: match[0] });
        }
        lastIndex = markerIndex + match[0].length;
    }
    if (lastIndex < answerText.length) {
        segments.push({ type: 'text', text: answerText.slice(lastIndex) });
    }
    return segments.length > 0 ? segments : [{ type: 'text', text: answerText }];
}
export function findReferenceByIndex(references, index) {
    return references.find((reference) => reference.index === index);
}
/** Stable key for a reference entry (`objectId` + `referenceId`). */
export function referenceKey(reference) {
    const id = reference.referenceId ?? `@${reference.index}`;
    return `${reference.objectId}::${id}`;
}
export function findReferenceByKey(references, key) {
    return references.find((reference) => referenceKey(reference) === key);
}
/** User-facing label for a reference — prefers the upstream `referenceId`. */
export function formatReferenceLabel(reference) {
    if (reference.referenceId?.trim()) {
        return reference.referenceId.trim();
    }
    return `Citation ${reference.index}`;
}
export function findReferenceForCitation(references, citation) {
    return (references.find((reference) => reference.objectId === citation.objectId &&
        (citation.referenceId ? reference.referenceId === citation.referenceId : true)) ?? references.find((reference) => reference.objectId === citation.objectId));
}
export function referencesForObject(references, objectId) {
    return references.filter((reference) => reference.objectId === objectId);
}
