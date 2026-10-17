import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError } from 'rxjs';
import { AI_BACKEND_URL } from './ai.config';
import { AiFeatureFlagService } from './ai-feature-flag.service';
import * as i0 from "@angular/core";
/**
 * Calls Nuxeo Automation Operations backed by the Java AI package (HAIP).
 *
 * All endpoints resolve to:
 *   POST /nuxeo/api/v1/automation/<OperationId>
 *   Body: { "params": { ...params } }
 *
 * The Automation REST API returns the Blob content directly when the
 * operation returns a StringBlob with application/json mime type.
 */
export class AiGatewayService {
    http = inject(HttpClient);
    baseUrl = inject(AI_BACKEND_URL);
    featureFlag = inject(AiFeatureFlagService);
    /** Build the Automation endpoint URL for a given operation ID. */
    op(operationId) {
        return `${this.baseUrl.replace(/\/$/, '')}/api/v1/automation/${operationId}`;
    }
    /** Wrap params in the Nuxeo Automation request envelope. */
    params(p) {
        return { params: p };
    }
    /**
     * The single place every operation goes through, so the feature flag is checked once rather
     * than at thirteen call sites that each have to remember.
     *
     * Components gate their own UI on the flag too, so in practice this never fires. It exists
     * because "the AI features are disabled" has to be true of the network, not only of what is
     * rendered: two callers were found issuing AI requests from `ngOnInit` while their templates
     * were correctly hidden, which is exactly the shape of mistake this catches.
     *
     * Errors rather than returning `EMPTY`: an observable that completes without emitting leaves
     * every caller's `loading` signal set, because their `next` and `error` handlers both go
     * unrun, and a permanent spinner is worse than a message nothing is rendering.
     */
    call(operationId, params) {
        if (!this.featureFlag.aiEnabled()) {
            return throwError(() => new Error(`AI features are disabled; ${operationId} was not sent`));
        }
        return this.http.post(this.op(operationId), this.params(params));
    }
    nlToNxql(query) {
        return this.call('AI.NlToNxql', { query, suggestions: false });
    }
    nlToNxqlSuggestions(query) {
        return this.call('AI.NlToNxql', { query, suggestions: true });
    }
    summarize(docId) {
        return this.call('AI.Summarize', { docId });
    }
    suggestTags(docId) {
        return this.call('AI.SuggestTags', { docId });
    }
    classify(docId) {
        return this.call('AI.Classify', { docId });
    }
    findSimilar(docId, limit = 5) {
        return this.call('AI.Similar', { docId, limit });
    }
    chat(request) {
        return this.call('AI.Chat', {
            message: request.message,
            historyJson: JSON.stringify(request.history ?? []),
            docId: request.context?.docId ?? '',
            page: request.context?.page ?? '',
        });
    }
    analyzeSentiment(comments) {
        return this.call('AI.Sentiment', {
            commentsJson: JSON.stringify(comments),
        });
    }
    getInsights(userId) {
        return this.call('AI.Insights', { userId });
    }
    detectAnomalies(timeRange = '24h') {
        return this.call('AI.Anomalies', { timeRange });
    }
    queryPermissions(query) {
        return this.call('AI.NlPermissions', { query });
    }
    auditNlFilter(query) {
        const today = new Date().toISOString().split('T')[0];
        return this.call('AI.AuditNlFilter', { query, today });
    }
    auditSummarize(entries) {
        return this.call('AI.AuditSummarize', {
            entriesJson: JSON.stringify(entries),
        });
    }
    static ɵfac = function AiGatewayService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AiGatewayService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: AiGatewayService, factory: AiGatewayService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AiGatewayService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
