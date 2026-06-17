import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom, lastValueFrom } from 'rxjs';

import { NUXEO_API_ORIGIN } from '@agentic-ui/shared/nuxeo-client';

import {
  DEFAULT_KD_CIC_OPERATIONS,
  DEFAULT_KD_UPSTREAM_PATHS,
  KD_CIC_OPERATIONS,
  KD_UPSTREAM_PATHS,
} from './kd.config';
import { KdClientService } from './kd-client.service';

function envelope<T>(response: T, responseCode = 200, responseMessage = 'OK'): unknown {
  return { response, responseCode, responseMessage };
}

describe('KdClientService', () => {
  let service: KdClientService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: NUXEO_API_ORIGIN, useValue: '' },
        { provide: KD_CIC_OPERATIONS, useValue: DEFAULT_KD_CIC_OPERATIONS },
        { provide: KD_UPSTREAM_PATHS, useValue: DEFAULT_KD_UPSTREAM_PATHS },
      ],
    });

    service = TestBed.inject(KdClientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  function expectAutomation(operation: string) {
    const req = httpMock.expectOne(`/nuxeo/site/automation/${encodeURIComponent(operation)}`);
    expect(req.request.method).toBe('POST');
    return req;
  }

  it('lists agents via HylandKnowledgeDiscovery.getAllAgents and unwraps the CIC envelope', async () => {
    const agents$ = firstValueFrom(service.listAgents());
    const req = expectAutomation(DEFAULT_KD_CIC_OPERATIONS.getAllAgents);
    expect(req.request.body).toEqual({});
    req.flush(envelope([{ id: 'agent-1', name: 'Contracts', description: '', modelName: 'm' }]));
    const agents = await agents$;
    expect(agents).toHaveLength(1);
    expect(agents[0]?.id).toBe('agent-1');
  });

  it('unwraps a wrapped {agents: [...]} payload', async () => {
    const agents$ = firstValueFrom(service.listAgents());
    const req = expectAutomation(DEFAULT_KD_CIC_OPERATIONS.getAllAgents);
    req.flush(
      envelope({
        agents: [{ id: 'agent-2', name: 'Policies', description: '', modelName: 'm' }],
      }),
    );
    const agents = await agents$;
    expect(agents[0]?.id).toBe('agent-2');
  });

  it('listIngestSourceIds reads __sourceId__ from agent static filters', async () => {
    const sourceIds$ = firstValueFrom(service.listIngestSourceIds());
    const req = expectAutomation(DEFAULT_KD_CIC_OPERATIONS.getAllAgents);
    req.flush(
      envelope([
        { id: 'agent-1', name: 'No source', sourceIds: [] },
        {
          id: 'agent-2',
          name: 'Bound agent',
          sourceIds: [],
          staticFilterExpression: {
            field: '__sourceId__',
            value: 'efffbf29-7d45-47ec-a7f0-7a9c5df8413b',
          },
        },
      ]),
    );
    await expect(sourceIds$).resolves.toEqual(['efffbf29-7d45-47ec-a7f0-7a9c5df8413b']);
  });

  it('getAgent routes through the Invoke passthrough with the upstream path', async () => {
    const agent$ = firstValueFrom(service.getAgent('agent-1'));
    const req = expectAutomation(DEFAULT_KD_CIC_OPERATIONS.invoke);
    expect(req.request.body).toEqual({
      params: { httpMethod: 'GET', endpoint: '/agent/agents/agent-1' },
    });
    req.flush(envelope({ id: 'agent-1', name: 'Contracts', description: '', modelName: 'm' }));
    const agent = await agent$;
    expect(agent.id).toBe('agent-1');
  });

  it('submitQuestion uses askQuestionAndGetAnswer and caches the one-shot result', async () => {
    const submission$ = firstValueFrom(
      service.submitQuestion({ agentId: 'agent-1', question: 'Q?' }),
    );
    const req = expectAutomation(DEFAULT_KD_CIC_OPERATIONS.askQuestionAndGetAnswer);
    expect(req.request.body).toEqual({
      params: { agentId: 'agent-1', question: 'Q?' },
    });
    req.flush(
      envelope({
        questionId: 'qid-1',
        agentId: 'agent-1',
        question: 'Q?',
        status: 'Complete',
        answer: 'A.',
        citations: [],
      }),
    );
    const submission = await submission$;
    expect(submission.questionId).toBe('qid-1');
    expect(submission.status).toBe('Complete');

    const answer = await firstValueFrom(service.getAnswer('qid-1'));
    expect(answer.answer).toBe('A.');
    expect(answer.status).toBe('Complete');
  });

  it('submitQuestion serializes dynamicFilter as extraPayloadJsonStr', async () => {
    const submission$ = firstValueFrom(
      service.submitQuestion({
        agentId: 'agent-1',
        question: 'Q?',
        dynamicFilter: { tenant: 'acme' },
      }),
    );
    const req = expectAutomation(DEFAULT_KD_CIC_OPERATIONS.askQuestionAndGetAnswer);
    expect(req.request.body).toEqual({
      params: {
        agentId: 'agent-1',
        question: 'Q?',
        extraPayloadJsonStr: JSON.stringify({ dynamicFilter: { tenant: 'acme' } }),
      },
    });
    req.flush(envelope({ status: 'Complete', answer: 'A.', citations: [] }));
    await submission$;
  });

  it('maps objectReferences from the connector response into citations', async () => {
    const submission$ = firstValueFrom(
      service.submitQuestion({ agentId: 'agent-1', question: 'Who is Holmes?' }),
    );
    const req = expectAutomation(DEFAULT_KD_CIC_OPERATIONS.askQuestionAndGetAnswer);
    req.flush(
      envelope({
        questionId: 'qid-citations',
        agentId: 'agent-1',
        question: 'Who is Holmes?',
        answer: 'Holmes is a detective.',
        objectReferences: [
          {
            objectId: 'source-id__document-id',
            references: [
              {
                referenceId: 'chunk-1',
                rank: 1,
                rankScore: 0.42,
              },
              {
                referenceId: 'chunk-2',
                rank: 2,
                rankScore: 0.21,
              },
            ],
          },
          {
            objectId: 'source-id__weak-document-id',
            references: [
              {
                referenceId: 'weak-chunk-1',
                rank: 1,
                rankScore: 0.01,
              },
            ],
          },
        ],
      }),
    );

    const documentReq = httpMock.expectOne('/nuxeo/api/v1/id/document-id');
    expect(documentReq.request.method).toBe('GET');
    documentReq.flush({
      uid: 'document-id',
      title: 'KD Sherlock Context Test',
      path: '/default-domain/workspaces/Narasimha/kd-sherlock-context.png',
      properties: {
        'dc:title': 'KD Sherlock Context Test',
        'file:content': { name: 'kd-sherlock-context.png' },
      },
    });

    await submission$;
    const answer = await firstValueFrom(service.getAnswer('qid-citations'));
    expect(answer.citations).toEqual([
      {
        objectId: 'source-id__document-id',
        referenceId: 'chunk-1',
        title: 'kd-sherlock-context.png',
        excerpt: '/default-domain/workspaces/Narasimha/kd-sherlock-context.png',
        score: 0.42,
      },
    ]);
  });

  it('retries a normalized question when KD returns insufficient answer with a strong citation', async () => {
    const submission$ = firstValueFrom(
      service.submitQuestion({ agentId: 'agent-1', question: 'What is agentic UI?' }),
    );

    const firstReq = expectAutomation(DEFAULT_KD_CIC_OPERATIONS.askQuestionAndGetAnswer);
    expect(firstReq.request.body).toEqual({
      params: { agentId: 'agent-1', question: 'What is agentic UI?' },
    });
    firstReq.flush(
      envelope({
        questionId: 'qid-first',
        agentId: 'agent-1',
        question: 'What is agentic UI?',
        answer: "#### I don't have enough information to answer this question.",
        objectReferences: [
          {
            objectId: 'source-id__pdf-document-id',
            references: [{ referenceId: 'chunk-1', rankScore: 0.31 }],
          },
        ],
      }),
    );

    const retryReq = expectAutomation(DEFAULT_KD_CIC_OPERATIONS.askQuestionAndGetAnswer);
    expect(retryReq.request.body).toEqual({
      params: { agentId: 'agent-1', question: 'what is agentic ui?' },
    });
    retryReq.flush(
      envelope({
        questionId: 'qid-retry',
        agentId: 'agent-1',
        question: 'what is agentic ui?',
        answer: 'Agentic UI uses agentic AI tooling to build a Nuxeo Angular UI.',
        objectReferences: [
          {
            objectId: 'source-id__pdf-document-id',
            references: [{ referenceId: 'chunk-2', rankScore: 0.44 }],
          },
        ],
      }),
    );

    const documentReq = httpMock.expectOne('/nuxeo/api/v1/id/pdf-document-id');
    documentReq.flush({
      uid: 'pdf-document-id',
      title: 'Test nature',
      path: '/default-domain/workspaces/Narasimha/Test nature',
      properties: {
        'dc:title': 'Test nature',
        'file:content': { name: '_221104827-Agentic UI PoC-300326-060908.pdf' },
      },
    });

    const submission = await submission$;
    expect(submission.questionId).toBe('qid-retry');

    const answer = await firstValueFrom(service.getAnswer('qid-retry'));
    expect(answer.question).toBe('What is agentic UI?');
    expect(answer.answer).toContain('Agentic UI uses agentic AI tooling');
    expect(answer.citations[0]).toEqual(
      expect.objectContaining({
        title: '_221104827-Agentic UI PoC-300326-060908.pdf',
        score: 0.44,
      }),
    );
  });

  it('throws when the CIC envelope carries an error code', async () => {
    const agents$ = firstValueFrom(service.listAgents());
    const req = expectAutomation(DEFAULT_KD_CIC_OPERATIONS.getAllAgents);
    req.flush(envelope({}, 401, 'Unauthorized'));
    await expect(agents$).rejects.toThrow(/Unauthorized/);
  });

  it('submitFeedback updates the cached answer locally', async () => {
    const sub$ = firstValueFrom(service.submitQuestion({ agentId: 'a', question: 'Q?' }));
    const post = expectAutomation(DEFAULT_KD_CIC_OPERATIONS.askQuestionAndGetAnswer);
    post.flush(envelope({ questionId: 'qid-9', status: 'Complete', answer: 'A.', citations: [] }));
    await sub$;

    await lastValueFrom(service.submitFeedback('qid-9', { feedback: 'Good' }));
    const answer = await firstValueFrom(service.getAnswer('qid-9'));
    expect(answer.feedback).toBe('Good');
  });

  it('getQuestionHistory hits the QnA service path and maps responseCompleteness to status', async () => {
    const history$ = firstValueFrom(service.getQuestionHistory('agent-1', 2, 10));
    const req = expectAutomation(DEFAULT_KD_CIC_OPERATIONS.invoke);
    expect(req.request.body).toEqual({
      params: {
        httpMethod: 'GET',
        endpoint: '/qna/agents/agent-1/questions/history?pageNumber=2&pageSize=10',
      },
    });
    req.flush(
      envelope({
        pagination: { totalItems: 1, pageNumber: 2, totalPages: 1, pageSize: 10 },
        data: [
          {
            id: 'qid-42',
            question: 'tell me about nuxeo',
            answer: 'A.',
            dateCreated: '2026-04-24T11:35:25Z',
            dateAnswered: '2026-04-24T11:35:29Z',
            agentVersion: 2,
            responseCompleteness: 'Complete',
            feedback: null,
            staticFilter: null,
            dynamicFilter: null,
          },
        ],
      }),
    );

    const page = await history$;
    expect(page.data).toHaveLength(1);
    expect(page.data[0]).toEqual(
      expect.objectContaining({
        id: 'qid-42',
        question: 'tell me about nuxeo',
        answer: 'A.',
        status: 'Complete',
        feedback: null,
      }),
    );
    expect(page.pagination).toEqual({
      totalItems: 1,
      pageNumber: 2,
      totalPages: 1,
      pageSize: 10,
    });
  });

  it('getQuestionHistory falls back gracefully on an empty payload', async () => {
    const history$ = firstValueFrom(service.getQuestionHistory('agent-1'));
    const req = expectAutomation(DEFAULT_KD_CIC_OPERATIONS.invoke);
    expect(req.request.body.params.endpoint).toBe(
      '/qna/agents/agent-1/questions/history?pageNumber=1&pageSize=25',
    );
    req.flush(envelope(null));
    const page = await history$;
    expect(page.data).toEqual([]);
    expect(page.pagination).toEqual({});
  });
});
