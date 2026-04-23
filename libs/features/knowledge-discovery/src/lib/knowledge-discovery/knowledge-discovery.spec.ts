import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
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
  listModels: vi.fn(() => of([{ name: 'model-1', status: 'Active' }])),
  listGuardrails: vi.fn(() => of({ guardrailGroups: [] })),
  getQuestionHistory: vi.fn(() => of({ data: [], pagination: {} })),
  submitQuestion: vi.fn(() => of({ questionId: 'question-1', status: 'Submitted' })),
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
  createAgent: vi.fn(() =>
    of({ id: 'agent-2', name: 'New Agent', description: '', modelName: 'model-1' }),
  ),
  updateAgent: vi.fn(),
  deleteAgent: vi.fn(() => of(void 0)),
};

describe('KnowledgeDiscoveryComponent', () => {
  let component: KnowledgeDiscoveryComponent;
  let fixture: ComponentFixture<KnowledgeDiscoveryComponent>;
  let dialogOpen: ReturnType<typeof vi.fn>;
  let afterClosed: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();

    afterClosed = vi.fn(() => of(undefined));
    dialogOpen = vi.fn(() => ({ afterClosed }) as unknown as MatDialogRef<unknown>);

    await TestBed.configureTestingModule({
      imports: [KnowledgeDiscoveryComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        { provide: KdClientService, useValue: mockKdClient },
        { provide: MatDialog, useValue: { open: dialogOpen } },
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

  it('should open the create-agent dialog when requested', () => {
    component.openCreateAgentDialog();

    expect(dialogOpen).toHaveBeenCalledTimes(1);
    const [, config] = dialogOpen.mock.calls[0] as [unknown, { data: { agent: unknown } }];
    expect(config.data.agent).toBeNull();
  });

  it('should open the edit-agent dialog with the selected agent', async () => {
    // allow the initial loadAgents/selectAgent flow to resolve
    await Promise.resolve();

    component.openEditAgentDialog();

    expect(dialogOpen).toHaveBeenCalled();
    const lastCall = dialogOpen.mock.calls.at(-1) as [unknown, { data: { agent: { id: string } } }];
    expect(lastCall[1].data.agent?.id).toBe('agent-1');
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
