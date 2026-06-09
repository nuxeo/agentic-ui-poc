import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { KdClientService, KdDiscoveryError } from '@agentic-ui/shared/kd-client';

import { KnowledgeDiscoveryComponent } from './knowledge-discovery';

const mockKdClient = {
  listAgents: vi.fn(() =>
    of([{ id: 'agent-1', name: 'Contracts Agent', description: '', modelName: 'model-1' }]),
  ),
  getAgent: vi.fn(() =>
    of({
      id: 'agent-1',
      name: 'Contracts Agent',
      description: '',
      modelName: 'model-1',
      instructions: '',
      sourceIds: [],
      accessRights: [],
      staticFilterExpression: null,
      dynamicFilterTemplate: null,
      guardrails: [],
      agentType: 'standard',
      knowledgeGraphDomainId: '',
    }),
  ),
  listModels: vi.fn(() => of([{ modelName: 'model-1', displayName: 'Model 1', status: 'Active' }])),
  listGuardrails: vi.fn(() => of({ guardrailGroups: [] })),
  getQuestionHistory: vi.fn(() => of({ data: [], pagination: {} })),
  submitQuestion: vi.fn(() => of({ questionId: 'question-1', status: 'Complete' })),
  getAnswer: vi.fn(() =>
    of({
      questionId: 'question-1',
      agentId: 'agent-1',
      question: 'What contracts mention renewal clauses?',
      status: 'Complete',
      answer: 'The MSA contains renewal clauses.',
      citations: [],
    }),
  ),
  submitFeedback: vi.fn(() => of(void 0)),
};

function activatedRouteWith(query: Record<string, string> = {}): Partial<ActivatedRoute> {
  return {
    snapshot: { queryParamMap: convertToParamMap(query) } as ActivatedRoute['snapshot'],
  };
}

async function createComponent(query: Record<string, string> = {}): Promise<{
  component: KnowledgeDiscoveryComponent;
  fixture: ComponentFixture<KnowledgeDiscoveryComponent>;
}> {
  await TestBed.configureTestingModule({
    imports: [KnowledgeDiscoveryComponent],
    providers: [
      provideExperimentalZonelessChangeDetection(),
      { provide: KdClientService, useValue: mockKdClient },
      { provide: ActivatedRoute, useValue: activatedRouteWith(query) },
    ],
  })
    .overrideComponent(KnowledgeDiscoveryComponent, {
      set: { imports: [], template: '<div></div>' },
    })
    .compileComponents();

  const fixture = TestBed.createComponent(KnowledgeDiscoveryComponent);
  return { component: fixture.componentInstance, fixture };
}

describe('KnowledgeDiscoveryComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create', async () => {
    const { component } = await createComponent();
    expect(component).toBeTruthy();
  });

  it('should load the list of agents on construction', async () => {
    const { component } = await createComponent();
    await Promise.resolve();
    expect(mockKdClient.listAgents).toHaveBeenCalled();
    expect(component.agents()).toHaveLength(1);
    expect(component.selectedAgentId()).toBe('agent-1');
  });

  it('should submit a question and store the returned answer state', async () => {
    const { component } = await createComponent();
    component.questionText.set('What contracts mention renewal clauses?');
    component.selectedAgentId.set('agent-1');

    component.submitQuestion();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(mockKdClient.submitQuestion).toHaveBeenCalledWith({
      agentId: 'agent-1',
      question: 'What contracts mention renewal clauses?',
      dynamicFilter: null,
    });
    expect(mockKdClient.getAnswer).toHaveBeenCalledWith('question-1');
    expect(component.activeQuestionId()).toBe('question-1');
    expect(component.answer()?.status).toBe('Complete');
  });

  describe('debug mode', () => {
    it('is off by default and captures no detail on success', async () => {
      const { component } = await createComponent();
      await Promise.resolve();
      expect(component.debugMode()).toBe(false);
      expect(component.agentsErrorDetail()).toBeNull();
      expect(component.referenceDataErrorDetail()).toBeNull();
    });

    it('turns on when ?debug=1 is in the route', async () => {
      const { component } = await createComponent({ debug: '1' });
      expect(component.debugMode()).toBe(true);
    });

    it('captures an HttpErrorResponse-like failure with status, body, and url', async () => {
      mockKdClient.listAgents.mockReturnValueOnce(
        throwError(() => ({
          status: 401,
          statusText: 'Unauthorized',
          url: '/nuxeo/site/automation/HylandKnowledgeDiscovery.getAllAgents',
          error: '<html>login</html>',
          message: 'Http failure response',
        })),
      );

      const { component } = await createComponent({ debug: '1' });
      await Promise.resolve();

      expect(component.agentsError()).toBe('Failed to load Knowledge Discovery agents.');
      const detail = component.agentsErrorDetail();
      expect(detail).not.toBeNull();
      expect(detail?.status).toBe(401);
      expect(detail?.statusText).toBe('Unauthorized');
      expect(detail?.url).toContain('HylandKnowledgeDiscovery.getAllAgents');
      expect(detail?.body).toBe('<html>login</html>');
      expect(detail?.operation).toBe('HylandKnowledgeDiscovery.getAllAgents');
      expect(typeof detail?.timestamp).toBe('string');
    });

    it('captures a KdDiscoveryError with upstream responseCode and body', async () => {
      mockKdClient.listGuardrails.mockReturnValueOnce(
        throwError(
          () =>
            new KdDiscoveryError(403, 'tenant not provisioned', {
              error: 'tenant-not-provisioned',
            }),
        ),
      );

      const { component } = await createComponent({ debug: '1' });
      await Promise.resolve();

      const detail = component.referenceDataErrorDetail();
      expect(detail).not.toBeNull();
      expect(detail?.status).toBe(403);
      expect(detail?.statusText).toBe('tenant not provisioned');
      expect(detail?.body).toEqual({ error: 'tenant-not-provisioned' });
      expect(detail?.operation).toContain('forkJoin');
    });

    it('copyDebugInfo writes pretty JSON to the clipboard when available', async () => {
      const writeText = vi.fn().mockResolvedValue(undefined);
      Object.assign(globalThis.navigator, { clipboard: { writeText } });

      const { component } = await createComponent({ debug: '1' });
      component.copyDebugInfo({
        operation: 'op',
        status: 500,
        body: { foo: 'bar' },
        message: 'oops',
        timestamp: '2026-06-06T00:00:00.000Z',
      });

      expect(writeText).toHaveBeenCalledTimes(1);
      const written = writeText.mock.calls[0][0];
      expect(written).toContain('"operation": "op"');
      expect(written).toContain('"foo": "bar"');
    });
  });
});
