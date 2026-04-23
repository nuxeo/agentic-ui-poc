import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { NUXEO_API_ORIGIN } from '@agentic-ui/shared/nuxeo-client';

import { DEFAULT_KD_CIC_OPERATIONS, KD_CIC_OPERATIONS } from './kd.config';
import { KdClientService } from './kd-client.service';

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
      ],
    });

    service = TestBed.inject(KdClientService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should invoke the configured CIC list-agents operation', () => {
    service.listAgents().subscribe((agents) => {
      expect(agents).toHaveLength(1);
      expect(agents[0]?.id).toBe('agent-1');
    });

    const req = httpMock.expectOne(
      `/nuxeo/site/automation/${encodeURIComponent(DEFAULT_KD_CIC_OPERATIONS.listAgents)}`,
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    req.flush([{ id: 'agent-1', name: 'Contracts Agent', description: '', modelName: 'model-1' }]);
  });

  it('should unwrap a wrapped agents payload', () => {
    service.listAgents().subscribe((agents) => {
      expect(agents).toHaveLength(1);
      expect(agents[0]?.id).toBe('agent-2');
    });

    const req = httpMock.expectOne(
      `/nuxeo/site/automation/${encodeURIComponent(DEFAULT_KD_CIC_OPERATIONS.listAgents)}`,
    );
    req.flush({
      agents: [{ id: 'agent-2', name: 'Policies Agent', description: '', modelName: 'model-1' }],
    });
  });

  it('should submit a question through the CIC submit-question operation', () => {
    service
      .submitQuestion({
        agentId: 'agent-1',
        question: 'What contracts mention renewal clauses?',
      })
      .subscribe((result) => {
        expect(result.questionId).toBe('question-1');
        expect(result.status).toBe('Submitted');
      });

    const req = httpMock.expectOne(
      `/nuxeo/site/automation/${encodeURIComponent(DEFAULT_KD_CIC_OPERATIONS.submitQuestion)}`,
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      params: {
        agentId: 'agent-1',
        question: 'What contracts mention renewal clauses?',
        dynamicFilter: null,
      },
    });
    req.flush({ questionId: 'question-1', status: 'Submitted' });
  });

  it('should call the configured get-answer operation with the question id', () => {
    service.getAnswer('question-1').subscribe((answer) => {
      expect(answer.status).toBe('Complete');
    });

    const req = httpMock.expectOne(
      `/nuxeo/site/automation/${encodeURIComponent(DEFAULT_KD_CIC_OPERATIONS.getAnswer)}`,
    );
    expect(req.request.body).toEqual({ params: { questionId: 'question-1' } });
    req.flush({
      questionId: 'question-1',
      agentId: 'agent-1',
      question: 'What contracts mention renewal clauses?',
      status: 'Complete',
      answer: 'Yes.',
      citations: [],
    });
  });
});
