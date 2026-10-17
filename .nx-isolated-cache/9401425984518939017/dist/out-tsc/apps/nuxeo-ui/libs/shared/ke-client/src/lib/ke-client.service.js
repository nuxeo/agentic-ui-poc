import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map, throwError } from 'rxjs';
import { NUXEO_API_ORIGIN } from '@nuxeo/satori-platform/nuxeo-client';
import { KE_CIC_OPERATIONS } from './ke.config';
import * as i0 from "@angular/core";
/**
 * Error thrown when the Nuxeo KE automation op or the upstream Context API
 * fails. `details` carries the parsed error body when available.
 *
 * `messageKey` is set when `message` is this client's own generic wording rather than text from
 * the server: a caller that shows the error resolves the key (with `messageParams`) so the user
 * reads it in their language. A server-supplied message has no key and is shown as it came.
 */
export class KeEnrichmentError extends Error {
    status;
    details;
    messageKey;
    messageParams;
    constructor(message, status, details, messageKey, messageParams) {
        super(message);
        this.status = status;
        this.details = details;
        this.messageKey = messageKey;
        this.messageParams = messageParams;
        this.name = 'KeEnrichmentError';
    }
}
export class KeClientService {
    http = inject(HttpClient);
    apiOrigin = inject(NUXEO_API_ORIGIN);
    ops = inject(KE_CIC_OPERATIONS);
    enrich(blob, request) {
        const formData = new FormData();
        formData.append('request', new Blob([JSON.stringify({ params: this.toAutomationParams(request) })], {
            type: 'application/json',
        }));
        formData.append('input', blob, 'knowledge-enrichment-input');
        return this.http
            .post(this.automationUrl(this.ops.enrich), formData, {
            responseType: 'text',
            headers: {
                Accept: 'application/json, text/plain',
            },
        })
            .pipe(map((body) => this.normalize(body)), catchError((error) => this.toKeError(error)));
    }
    toAutomationParams(request) {
        const params = {
            actions: request.actions.join(','),
        };
        if (request.sourceId) {
            params['sourceId'] = request.sourceId;
        }
        if (request.classes?.length) {
            params['classes'] = JSON.stringify(request.classes);
        }
        if (request.configName) {
            params['configName'] = request.configName;
        }
        if (request.maxWordCount !== undefined || request.instructions) {
            const extraPayload = {};
            if (request.maxWordCount !== undefined) {
                extraPayload['maxWordCount'] = request.maxWordCount;
            }
            if (request.instructions) {
                extraPayload['instructions'] = request.instructions;
            }
            params['extraJsonPayloadStr'] = JSON.stringify(extraPayload);
        }
        if (request.v2Actions) {
            params['instructionsV2JsonStr'] = JSON.stringify(request.v2Actions);
        }
        return params;
    }
    normalize(body) {
        const parsed = this.parseBody(body);
        const payload = this.unwrapMaybeEnvelope(parsed);
        const envelope = this.toResultsEnvelope(payload);
        const firstResult = Array.isArray(envelope.results) ? envelope.results[0] : undefined;
        return {
            requestId: envelope.id ?? null,
            status: envelope.status ?? null,
            inProgress: Boolean(envelope.inProgress),
            objectKey: this.asString(firstResult?.['objectKey']) ?? null,
            imageDescription: this.toStringResult(firstResult?.['imageDescription']),
            textSummary: this.toStringResult(firstResult?.['textSummary']),
            textClassification: this.toStringResult(firstResult?.['textClassification']),
            namedEntityText: this.toEntityResult(firstResult?.['namedEntityText']),
            namedEntityImage: this.toEntityResult(firstResult?.['namedEntityImage']),
            imageMetadata: this.toStringDictionaryResult(firstResult?.['imageMetadata']),
            textMetadata: this.toStringDictionaryResult(firstResult?.['textMetadata']),
            generalProcessingErrors: this.toProcessingErrors(firstResult?.['generalProcessingErrors']),
            raw: payload,
        };
    }
    parseBody(body) {
        const trimmed = body.trim();
        if (!trimmed)
            return {};
        try {
            return JSON.parse(trimmed);
        }
        catch {
            throw new KeEnrichmentError('Knowledge Enrichment returned a non-JSON response.', undefined, undefined, 'ke-client.message.non-json-response');
        }
    }
    /**
     * The KE connector sometimes returns raw Context API results and may also
     * surface a generic `{ response, responseCode, responseMessage }` envelope.
     */
    unwrapMaybeEnvelope(payload) {
        if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
            return payload;
        }
        const maybeEnvelope = payload;
        if (typeof maybeEnvelope.responseCode !== 'number') {
            return payload;
        }
        if (maybeEnvelope.responseCode < 200 || maybeEnvelope.responseCode >= 300) {
            const code = maybeEnvelope.responseCode;
            if (code === 403) {
                throw new KeEnrichmentError('Knowledge Enrichment credentials are not authorized for the Context API.', code, maybeEnvelope.response, 'ke-client.message.not-authorized');
            }
            if (maybeEnvelope.responseMessage) {
                throw new KeEnrichmentError(maybeEnvelope.responseMessage, code, maybeEnvelope.response);
            }
            throw new KeEnrichmentError(`Knowledge Enrichment returned HTTP ${code}.`, code, maybeEnvelope.response, 'ke-client.message.http-status', { code });
        }
        return maybeEnvelope.response;
    }
    toResultsEnvelope(payload) {
        if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
            return { inProgress: false, results: [] };
        }
        const envelope = payload;
        if (Array.isArray(envelope.results)) {
            return envelope;
        }
        // Some connector versions return a single result object directly.
        return {
            id: null,
            status: null,
            inProgress: false,
            results: [payload],
        };
    }
    toStringResult(value) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return null;
        }
        const entry = value;
        return {
            isSuccess: entry['isSuccess'] === true,
            result: this.asString(entry['result']),
            error: this.toSingleProcessingError(entry['error']),
        };
    }
    toEntityResult(value) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return null;
        }
        const entry = value;
        return {
            isSuccess: entry['isSuccess'] === true,
            result: this.toEntityMap(entry['result']),
            error: this.toSingleProcessingError(entry['error']),
        };
    }
    toStringDictionaryResult(value) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return null;
        }
        const entry = value;
        const result = entry['result'];
        return {
            isSuccess: entry['isSuccess'] === true,
            result: result && typeof result === 'object' && !Array.isArray(result)
                ? result
                : null,
            error: this.toSingleProcessingError(entry['error']),
        };
    }
    toEntityMap(value) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return null;
        }
        const rawMap = value;
        const normalized = {};
        for (const [key, rawValues] of Object.entries(rawMap)) {
            if (!Array.isArray(rawValues))
                continue;
            const values = rawValues
                .map((entry) => this.asString(entry))
                .filter((entry) => Boolean(entry));
            if (values.length > 0) {
                normalized[key] = Array.from(new Set(values));
            }
        }
        return Object.keys(normalized).length > 0 ? normalized : null;
    }
    toProcessingErrors(value) {
        if (!Array.isArray(value))
            return [];
        return value
            .map((entry) => this.toSingleProcessingError(entry))
            .filter((entry) => Boolean(entry));
    }
    toSingleProcessingError(value) {
        if (!value || typeof value !== 'object' || Array.isArray(value)) {
            return null;
        }
        const raw = value;
        return {
            errorType: this.asString(raw['errorType']),
            message: this.asString(raw['message']),
        };
    }
    asString(value) {
        return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
    }
    toKeError(error) {
        if (error instanceof KeEnrichmentError) {
            return throwError(() => error);
        }
        if (!(error instanceof HttpErrorResponse)) {
            return throwError(() => new KeEnrichmentError('Knowledge Enrichment request failed unexpectedly.', undefined, error, 'ke-client.message.failed-unexpectedly'));
        }
        const detail = this.extractErrorDetail(error.error);
        return throwError(() => detail || error.message
            ? new KeEnrichmentError(detail || error.message, error.status, error.error)
            : new KeEnrichmentError('Knowledge Enrichment request failed.', error.status, error.error, 'ke-client.message.failed'));
    }
    extractErrorDetail(raw) {
        if (typeof raw === 'string') {
            try {
                const parsed = JSON.parse(raw);
                return parsed.detail ?? parsed.message ?? raw;
            }
            catch {
                return raw;
            }
        }
        if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
            return null;
        }
        const errorBody = raw;
        return errorBody.detail ?? errorBody.message ?? null;
    }
    automationUrl(operation) {
        const origin = this.apiOrigin.replace(/\/$/, '');
        return `${origin}/nuxeo/site/automation/${encodeURIComponent(operation)}`;
    }
    static ɵfac = function KeClientService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || KeClientService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: KeClientService, factory: KeClientService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(KeClientService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
