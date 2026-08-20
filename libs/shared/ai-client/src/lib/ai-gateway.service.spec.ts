import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, afterEach, expect, it } from 'vitest';

import { AI_BACKEND_URL } from './ai.config';
import { AiGatewayService } from './ai-gateway.service';

/**
 * Every method is one Automation operation, so the contract worth pinning is the
 * operation id in the URL and the `params` envelope the Java package expects.
 */
describe('AiGatewayService', () => {
  let service: AiGatewayService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        // Deliberately trailing-slashed: the service has to normalise it away.
        { provide: AI_BACKEND_URL, useValue: '/nuxeo/' },
      ],
    });
    service = TestBed.inject(AiGatewayService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  function expectCall(operation: string) {
    const request = http.expectOne(`/nuxeo/api/v1/automation/${operation}`);
    expect(request.request.method).toBe('POST');
    request.flush({});
    return request.request.body.params as Record<string, unknown>;
  }

  it('sends natural-language search with suggestions off, and on for autocomplete', () => {
    service.nlToNxql('contracts from last week').subscribe();
    expect(expectCall('AI.NlToNxql')).toEqual({
      query: 'contracts from last week',
      suggestions: false,
    });

    service.nlToNxqlSuggestions('contr').subscribe();
    expect(expectCall('AI.NlToNxql')).toEqual({ query: 'contr', suggestions: true });
  });

  it('sends the single-document operations with just the document id', () => {
    service.summarize('doc-1').subscribe();
    expect(expectCall('AI.Summarize')).toEqual({ docId: 'doc-1' });

    service.suggestTags('doc-1').subscribe();
    expect(expectCall('AI.SuggestTags')).toEqual({ docId: 'doc-1' });

    service.classify('doc-1').subscribe();
    expect(expectCall('AI.Classify')).toEqual({ docId: 'doc-1' });
  });

  it('defaults the similar-document limit and honours an explicit one', () => {
    service.findSimilar('doc-1').subscribe();
    expect(expectCall('AI.Similar')).toEqual({ docId: 'doc-1', limit: 5 });

    service.findSimilar('doc-1', 12).subscribe();
    expect(expectCall('AI.Similar')).toEqual({ docId: 'doc-1', limit: 12 });
  });

  it('serialises chat history and flattens the page context into the envelope', () => {
    service
      .chat({
        message: 'what is this?',
        history: [{ role: 'user', content: 'hi' }],
        context: { docId: 'doc-1', page: '/doc/doc-1' },
      })
      .subscribe();

    expect(expectCall('AI.Chat')).toEqual({
      message: 'what is this?',
      historyJson: '[{"role":"user","content":"hi"}]',
      docId: 'doc-1',
      page: '/doc/doc-1',
    });
  });

  it('sends empty context rather than undefined when the caller has none', () => {
    service.chat({ message: 'hello' }).subscribe();

    expect(expectCall('AI.Chat')).toEqual({
      message: 'hello',
      historyJson: '[]',
      docId: '',
      page: '',
    });
  });

  it('serialises the collection arguments the analysis operations take', () => {
    service.analyzeSentiment([{ id: 'c1', text: 'great' }]).subscribe();
    expect(expectCall('AI.Sentiment')).toEqual({
      commentsJson: '[{"id":"c1","text":"great"}]',
    });

    service.auditSummarize([{ eventId: 'e1' }]).subscribe();
    expect(expectCall('AI.AuditSummarize')).toEqual({ entriesJson: '[{"eventId":"e1"}]' });
  });

  it('sends the dashboard and audit operations with their own parameters', () => {
    service.getInsights('jdoe').subscribe();
    expect(expectCall('AI.Insights')).toEqual({ userId: 'jdoe' });

    service.detectAnomalies().subscribe();
    expect(expectCall('AI.Anomalies')).toEqual({ timeRange: '24h' });

    service.detectAnomalies('7d').subscribe();
    expect(expectCall('AI.Anomalies')).toEqual({ timeRange: '7d' });

    service.queryPermissions('who can read this?').subscribe();
    expect(expectCall('AI.NlPermissions')).toEqual({ query: 'who can read this?' });
  });

  it('passes today as an ISO date so relative audit filters resolve server-side', () => {
    service.auditNlFilter('deletions since monday').subscribe();

    const params = expectCall('AI.AuditNlFilter');
    expect(params['query']).toBe('deletions since monday');
    expect(params['today']).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
