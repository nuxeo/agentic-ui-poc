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
});
