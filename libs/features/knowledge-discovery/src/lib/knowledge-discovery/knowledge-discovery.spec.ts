import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { KdClientService } from '@agentic-ui/shared/kd-client';

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

describe('KnowledgeDiscoveryComponent', () => {
  let component: KnowledgeDiscoveryComponent;
  let fixture: ComponentFixture<KnowledgeDiscoveryComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [KnowledgeDiscoveryComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        { provide: KdClientService, useValue: mockKdClient },
      ],
    })
      .overrideComponent(KnowledgeDiscoveryComponent, {
        set: { imports: [], template: '<div></div>' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(KnowledgeDiscoveryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load the list of agents on construction', async () => {
    await Promise.resolve();
    expect(mockKdClient.listAgents).toHaveBeenCalled();
    expect(component.agents()).toHaveLength(1);
    expect(component.selectedAgentId()).toBe('agent-1');
  });

  it('should submit a question and store the returned answer state', async () => {
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
});
