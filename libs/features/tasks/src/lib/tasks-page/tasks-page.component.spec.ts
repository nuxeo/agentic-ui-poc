import { HttpClient } from '@angular/common/http';
import { provideExperimentalZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import {
  ActivatedRoute,
  Router,
  provideRouter,
  withDisabledInitialNavigation,
} from '@angular/router';
import { EMPTY, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import {
  CURRENT_USERNAME,
  DocumentService,
  NuxeoApiBase,
  TaskService,
  UserService,
  WorkflowService,
  type NuxeoDocument,
  type NuxeoTask,
} from '@agentic-ui/shared/nuxeo-client';

import { TasksPageComponent } from './tasks-page.component';

function task(overrides: Partial<NuxeoTask> = {}): NuxeoTask {
  return {
    id: 't1',
    name: 'wf.serialDocumentReview.chooseParticipants',
    workflowInstanceId: 'wf-1',
    ...overrides,
  } as NuxeoTask;
}

function doc(uid = 'd1', overrides: Partial<NuxeoDocument> = {}): NuxeoDocument {
  return {
    uid,
    title: 'Target doc',
    type: 'File',
    path: '/default-domain/workspaces/ws/target',
    lastModified: '',
    properties: {},
    ...overrides,
  };
}

const mockTaskService = {
  getUserTasks: vi.fn(() => of([] as NuxeoTask[])),
  getTask: vi.fn(() => EMPTY),
  completeTask: vi.fn(() => EMPTY),
  delegateTask: vi.fn(() => EMPTY),
  reassignTask: vi.fn(() => EMPTY),
  notifyTasksChanged: vi.fn(),
};

const mockUserService = {
  searchUsers: vi.fn(() => of([])),
  searchGroups: vi.fn(() => of([])),
};

const mockWorkflowService = {
  cancelWorkflow: vi.fn(() => EMPTY),
  getWorkflowGraph: vi.fn(() => EMPTY),
};

const mockDocService = {
  getById: vi.fn(() => EMPTY),
};

const mockNuxeoApi = {
  apiUrl: vi.fn((path: string) => `http://nuxeo${path}`),
};

const mockHttp = {
  get: vi.fn(() => EMPTY),
};

describe('TasksPageComponent', () => {
  let component: TasksPageComponent;
  let fixture: ComponentFixture<TasksPageComponent>;
  let snackBarOpen: ReturnType<typeof vi.fn>;
  let navigate: ReturnType<typeof vi.fn>;
  let routeTaskId: string | null;
  let revokeObjectURL: ReturnType<typeof vi.fn>;

  beforeAll(() => {
    Object.defineProperty(URL, 'createObjectURL', {
      value: vi.fn(() => 'blob:preview'),
      configurable: true,
    });
    revokeObjectURL = vi.fn();
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: revokeObjectURL,
      configurable: true,
    });
  });

  afterAll(() => {
    delete (URL as unknown as Record<string, unknown>)['createObjectURL'];
    delete (URL as unknown as Record<string, unknown>)['revokeObjectURL'];
  });

  beforeEach(async () => {
    vi.clearAllMocks();
    routeTaskId = null;
    snackBarOpen = vi.fn();
    mockTaskService.getUserTasks.mockReturnValue(of([]));
    mockUserService.searchUsers.mockReturnValue(of([]));
    mockUserService.searchGroups.mockReturnValue(of([]));
    mockDocService.getById.mockReturnValue(EMPTY);
    mockHttp.get.mockReturnValue(EMPTY);

    await TestBed.configureTestingModule({
      imports: [TasksPageComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        provideRouter([], withDisabledInitialNavigation()),
        { provide: TaskService, useValue: mockTaskService },
        { provide: UserService, useValue: mockUserService },
        { provide: WorkflowService, useValue: mockWorkflowService },
        { provide: DocumentService, useValue: mockDocService },
        { provide: NuxeoApiBase, useValue: mockNuxeoApi },
        { provide: HttpClient, useValue: mockHttp },
        { provide: CURRENT_USERNAME, useValue: signal('alice') },
        { provide: MatSnackBar, useValue: { open: snackBarOpen } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => routeTaskId } } },
        },
      ],
    })
      // Shallow-render: the real template pulls in 14 Material/Satori modules whose
      // zone-tracked handles hang the runner.
      .overrideComponent(TasksPageComponent, { set: { imports: [], template: '<div></div>' } })
      .compileComponents();

    fixture = TestBed.createComponent(TasksPageComponent);
    component = fixture.componentInstance;
    navigate = vi.fn().mockResolvedValue(true);
    vi.spyOn(TestBed.inject(Router), 'navigate').mockImplementation(navigate);
  });

  afterEach(() => fixture.destroy());

  it('creates', () => {
    expect(component).toBeTruthy();
  });

  describe('loadTasks', () => {
    it('auto-selects the first task when the route carries no id', () => {
      mockTaskService.getUserTasks.mockReturnValue(of([task({ id: 'a' }), task({ id: 'b' })]));

      component.ngOnInit();

      expect(mockTaskService.getUserTasks).toHaveBeenCalledWith('alice', 50);
      expect(component.tasks().length).toBe(2);
      expect(component.listLoading()).toBe(false);
      expect(component.selectedTask()?.id).toBe('a');
    });

    it('selects the routed task when it is present in the list', () => {
      routeTaskId = 'b';
      mockTaskService.getUserTasks.mockReturnValue(of([task({ id: 'a' }), task({ id: 'b' })]));

      component.ngOnInit();

      expect(component.selectedTask()?.id).toBe('b');
      expect(mockTaskService.getTask).not.toHaveBeenCalled();
    });

    it('fetches a routed task that is missing from the list', () => {
      routeTaskId = 'z';
      mockTaskService.getUserTasks.mockReturnValue(of([task({ id: 'a' })]));
      mockTaskService.getTask.mockReturnValue(of(task({ id: 'z' })));

      component.ngOnInit();

      expect(mockTaskService.getTask).toHaveBeenCalledWith('z');
      expect(component.selectedTask()?.id).toBe('z');
      expect(component.taskLoading()).toBe(false);
    });

    it('clears the loading flag when fetching a routed task fails', () => {
      routeTaskId = 'z';
      mockTaskService.getUserTasks.mockReturnValue(of([]));
      mockTaskService.getTask.mockReturnValue(throwError(() => new Error('gone')));

      component.ngOnInit();

      expect(component.taskLoading()).toBe(false);
      expect(component.selectedTask()).toBeNull();
    });

    it('leaves nothing selected for an empty inbox', () => {
      mockTaskService.getUserTasks.mockReturnValue(of([]));

      component.ngOnInit();

      expect(component.selectedTask()).toBeNull();
      expect(component.listLoading()).toBe(false);
    });

    it('sets the error message and clears loading on failure', () => {
      mockTaskService.getUserTasks.mockReturnValue(throwError(() => new Error('boom')));

      component.ngOnInit();

      expect(component.listError()).toBe('Failed to load tasks.');
      expect(component.listLoading()).toBe(false);
    });
  });

  describe('selectTask', () => {
    it('resets the form and navigates to the task URL', () => {
      component.comment = 'stale';
      component.participants = ['user:bob'];

      component.selectTask(task({ id: 't9', variables: {} }));

      expect(component.comment).toBe('');
      expect(component.participants).toEqual([]);
      expect(navigate).toHaveBeenCalledWith(['/tasks', 't9'], { replaceUrl: true });
    });

    it('pre-fills participants and due date from task variables', () => {
      component.selectTask(
        task({
          variables: { participants: ['user:bob'], end_date: '2026-03-01T00:00:00.000Z' },
        }),
      );

      expect(component.participants).toEqual(['user:bob']);
      expect(component.dueDate?.toISOString()).toBe('2026-03-01T00:00:00.000Z');
    });

    it('defaults the due date to five days out when the task has none', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));

      component.selectTask(task({ variables: {} }));

      expect(component.dueDate?.toISOString().slice(0, 10)).toBe('2026-01-06');
      vi.useRealTimers();
    });

    it('shows the enriched target document immediately, then the full fetch', () => {
      mockDocService.getById.mockReturnValue(of(doc('d1', { title: 'Full doc' })));

      component.selectTask(
        task({
          targetDocumentIds: [
            { uid: 'd1', title: 'Enriched', type: 'File', path: '/p' },
          ] as NuxeoTask['targetDocumentIds'],
        }),
      );

      expect(mockDocService.getById).toHaveBeenCalledWith('d1');
      expect(component.targetDoc()?.title).toBe('Full doc');
      expect(component.docLoading()).toBe(false);
    });

    it('falls back to fetching by id when the enricher gave no title', () => {
      mockDocService.getById.mockReturnValue(of(doc('d2')));

      component.selectTask(
        task({ targetDocumentIds: [{ id: 'd2' }] as unknown as NuxeoTask['targetDocumentIds'] }),
      );

      expect(mockDocService.getById).toHaveBeenCalledWith('d2');
      expect(component.targetDoc()?.uid).toBe('d2');
    });

    it('clears docLoading when the target document fetch fails', () => {
      mockDocService.getById.mockReturnValue(throwError(() => new Error('403')));

      component.selectTask(
        task({ targetDocumentIds: [{ id: 'd2' }] as unknown as NuxeoTask['targetDocumentIds'] }),
      );

      expect(component.docLoading()).toBe(false);
    });

    it('leaves the document panel empty when the task has no target', () => {
      component.selectTask(task({ targetDocumentIds: [] }));

      expect(mockDocService.getById).not.toHaveBeenCalled();
      expect(component.targetDoc()).toBeNull();
    });
  });

  describe('isChooseParticipants', () => {
    it('is false with no selection', () => {
      expect(component.isChooseParticipants).toBe(false);
    });

    it.each([
      [
        'a start_review action',
        task({ name: 'x', taskInfo: { taskActions: [{ name: 'start_review', label: 'Start' }] } }),
      ],
      ['a chooseParticipants name', task({ name: 'wf.x.chooseParticipants' })],
      ['a choose_participants name', task({ name: 'choose_participants' })],
      ['a "choose participants" name', task({ name: 'choose participants' })],
      ['a select directive', task({ name: 'x', directive: 'select' })],
      ['a chooseParticipants directive', task({ name: 'x', directive: 'chooseParticipants' })],
    ] as const)('is true for %s', (_label, subject) => {
      component.selectedTask.set(subject as NuxeoTask);
      expect(component.isChooseParticipants).toBe(true);
    });

    it('is false for an unrelated review step', () => {
      component.selectedTask.set(task({ name: 'wf.x.approve', directive: 'approve' }));
      expect(component.isChooseParticipants).toBe(false);
    });
  });

  describe('executeAction', () => {
    it('does nothing without a selected task', () => {
      component.executeAction({ name: 'approve', label: 'Approve' });
      expect(mockTaskService.completeTask).not.toHaveBeenCalled();
    });

    it('sends participants and end_date for a choose-participants step', () => {
      component.selectedTask.set(task({ name: 'wf.x.chooseParticipants' }));
      component.participants = ['bob', 'group:reviewers'];
      component.dueDate = new Date('2026-04-01T00:00:00.000Z');
      component.comment = 'please review';
      mockTaskService.completeTask.mockReturnValue(of({}));

      component.executeAction({ name: 'start_review', label: 'Start' });

      expect(mockTaskService.completeTask).toHaveBeenCalledWith(
        't1',
        'start_review',
        {
          participants: ['user:bob', 'group:reviewers'],
          end_date: '2026-04-01T00:00:00.000Z',
          validationOrReview: 'simpleReview',
          comment: 'please review',
        },
        'please review',
      );
      expect(component.submitting()).toBe(false);
      expect(mockTaskService.notifyTasksChanged).toHaveBeenCalled();
    });

    it('defaults participants to the current user when none were picked', () => {
      component.selectedTask.set(task({ name: 'wf.x.chooseParticipants' }));
      component.participants = [];
      component.dueDate = new Date('2026-04-01T00:00:00.000Z');
      mockTaskService.completeTask.mockReturnValue(of({}));

      component.executeAction({ name: 'start_review', label: 'Start' });

      expect(mockTaskService.completeTask.mock.calls[0][2]).toMatchObject({
        participants: ['user:alice'],
      });
    });

    it('synthesises an end_date seven days out when the form has none', () => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-01-01T00:00:00.000Z'));
      component.selectedTask.set(task({ name: 'wf.x.chooseParticipants' }));
      component.dueDate = null;
      mockTaskService.completeTask.mockReturnValue(of({}));

      component.executeAction({ name: 'start_review', label: 'Start' });

      const variables = mockTaskService.completeTask.mock.calls[0][2] as Record<string, string>;
      expect(variables['end_date'].slice(0, 10)).toBe('2026-01-08');
      vi.useRealTimers();
    });

    it('omits participant variables for a plain approval step', () => {
      component.selectedTask.set(task({ name: 'wf.x.approve' }));
      mockTaskService.completeTask.mockReturnValue(of({}));

      component.executeAction({ name: 'approve', label: 'Approve' });

      expect(mockTaskService.completeTask).toHaveBeenCalledWith('t1', 'approve', {}, undefined);
    });

    it('clears the selection and reloads the inbox on success', async () => {
      component.selectedTask.set(task({ name: 'wf.x.approve' }));
      component.targetDoc.set(doc());
      mockTaskService.completeTask.mockReturnValue(of({}));
      mockTaskService.getUserTasks.mockReturnValue(of([]));

      component.executeAction({ name: 'approve', label: 'Approve' });
      await Promise.resolve();

      expect(component.selectedTask()).toBeNull();
      expect(component.targetDoc()).toBeNull();
      expect(navigate).toHaveBeenCalledWith(['/tasks'], { replaceUrl: true });
      expect(snackBarOpen).toHaveBeenCalledWith(
        'Task completed successfully.',
        'Close',
        expect.anything(),
      );
    });

    it('surfaces the server message when completion fails', () => {
      component.selectedTask.set(task({ name: 'wf.x.approve' }));
      mockTaskService.completeTask.mockReturnValue(
        throwError(() => ({ error: { message: 'Not your task' } })),
      );

      component.executeAction({ name: 'approve', label: 'Approve' });

      expect(component.submitting()).toBe(false);
      expect(snackBarOpen).toHaveBeenCalledWith('Not your task', 'Close', expect.anything());
    });

    it('falls back to a generic message when the error carries none', () => {
      component.selectedTask.set(task({ name: 'wf.x.approve' }));
      mockTaskService.completeTask.mockReturnValue(throwError(() => new Error('network')));

      component.executeAction({ name: 'approve', label: 'Approve' });

      expect(snackBarOpen).toHaveBeenCalledWith(
        'Failed to complete the task.',
        'Close',
        expect.anything(),
      );
    });
  });

  describe('abandonWorkflow', () => {
    it('does nothing without a workflow instance', () => {
      component.selectedTask.set(task({ workflowInstanceId: undefined }));

      component.abandonWorkflow();

      expect(mockWorkflowService.cancelWorkflow).not.toHaveBeenCalled();
    });

    it('cancels the workflow and resets the panel', async () => {
      component.selectedTask.set(task());
      component.targetDoc.set(doc());
      mockWorkflowService.cancelWorkflow.mockReturnValue(of({}));
      mockTaskService.getUserTasks.mockReturnValue(of([]));

      component.abandonWorkflow();
      await Promise.resolve();

      expect(mockWorkflowService.cancelWorkflow).toHaveBeenCalledWith('wf-1');
      expect(component.selectedTask()).toBeNull();
      expect(component.submitting()).toBe(false);
      expect(snackBarOpen).toHaveBeenCalledWith('Workflow abandoned.', 'Close', expect.anything());
    });

    it('reports a cancellation failure', () => {
      component.selectedTask.set(task());
      mockWorkflowService.cancelWorkflow.mockReturnValue(throwError(() => new Error('nope')));

      component.abandonWorkflow();

      expect(component.submitting()).toBe(false);
      expect(snackBarOpen).toHaveBeenCalledWith(
        'Failed to abandon workflow.',
        'Close',
        expect.anything(),
      );
    });
  });

  describe('participant search', () => {
    it('clears results for a query shorter than two characters', () => {
      component.userResults.set([{ id: 'x' } as never]);
      component.participantInput = 'a';

      component.searchUsers();

      expect(mockUserService.searchUsers).not.toHaveBeenCalled();
      expect(component.userResults()).toEqual([]);
    });

    it('searches users and groups in parallel', () => {
      component.participantInput = '  bob  ';
      mockUserService.searchUsers.mockReturnValue(of([{ id: 'bob' } as never]));
      mockUserService.searchGroups.mockReturnValue(of([{ name: 'reviewers' } as never]));

      component.searchUsers();

      expect(mockUserService.searchUsers).toHaveBeenCalledWith('bob');
      expect(mockUserService.searchGroups).toHaveBeenCalledWith('bob');
      expect(component.userResults().length).toBe(1);
      expect(component.groupResults().length).toBe(1);
      expect(component.searching()).toBe(false);
    });

    it('clears the searching flag when the user search fails', () => {
      component.participantInput = 'bob';
      mockUserService.searchUsers.mockReturnValue(throwError(() => new Error('boom')));

      component.searchUsers();

      expect(component.searching()).toBe(false);
    });

    it('swallows a group search failure', () => {
      component.participantInput = 'bob';
      mockUserService.searchGroups.mockReturnValue(throwError(() => new Error('boom')));

      expect(() => component.searchUsers()).not.toThrow();
      expect(component.groupResults()).toEqual([]);
    });

    it('addParticipant appends once and clears the input', () => {
      component.addParticipant('user:bob');
      component.addParticipant('user:bob');

      expect(component.participants).toEqual(['user:bob']);
      expect(component.participantInput).toBe('');
    });

    it('removeParticipant drops the entry', () => {
      component.participants = ['user:bob', 'user:carol'];
      component.removeParticipant('user:bob');
      expect(component.participants).toEqual(['user:carol']);
    });

    it('formatParticipant strips the user/group prefix', () => {
      expect(component.formatParticipant('user:bob')).toBe('bob');
      expect(component.formatParticipant('group:reviewers')).toBe('reviewers');
      expect(component.formatParticipant('bare')).toBe('bare');
    });
  });

  describe('delegate', () => {
    it('opens the delegate panel and closes the reassign panel', () => {
      component.showReassignPanel.set(true);

      component.openDelegatePanel();

      expect(component.showDelegatePanel()).toBe(true);
      expect(component.showReassignPanel()).toBe(false);
    });

    it('closeDelegatePanel wipes its form state', () => {
      component.showDelegatePanel.set(true);
      component.delegateInput = 'bob';
      component.delegateActors = ['user:bob'];
      component.delegateComment = 'take over';

      component.closeDelegatePanel();

      expect(component.showDelegatePanel()).toBe(false);
      expect(component.delegateActors).toEqual([]);
      expect(component.delegateComment).toBe('');
    });

    it('searchDelegateUsers ignores short queries', () => {
      component.delegateInput = 'b';
      component.searchDelegateUsers();
      expect(mockUserService.searchUsers).not.toHaveBeenCalled();
    });

    it('searchDelegateUsers populates both result sets', () => {
      component.delegateInput = 'bob';
      mockUserService.searchUsers.mockReturnValue(of([{ id: 'bob' } as never]));
      mockUserService.searchGroups.mockReturnValue(of([{ name: 'g' } as never]));

      component.searchDelegateUsers();

      expect(component.delegateUserResults().length).toBe(1);
      expect(component.delegateGroupResults().length).toBe(1);
    });

    it('searchDelegateUsers swallows both failures', () => {
      component.delegateInput = 'bob';
      mockUserService.searchUsers.mockReturnValue(throwError(() => new Error('a')));
      mockUserService.searchGroups.mockReturnValue(throwError(() => new Error('b')));

      expect(() => component.searchDelegateUsers()).not.toThrow();
    });

    it('addDelegateActor de-duplicates', () => {
      component.addDelegateActor('user:bob');
      component.addDelegateActor('user:bob');
      expect(component.delegateActors).toEqual(['user:bob']);
    });

    it('removeDelegateActor drops the entry', () => {
      component.delegateActors = ['user:bob'];
      component.removeDelegateActor('user:bob');
      expect(component.delegateActors).toEqual([]);
    });

    it('confirmDelegate needs both a task and at least one actor', () => {
      component.selectedTask.set(task());
      component.delegateActors = [];

      component.confirmDelegate();

      expect(mockTaskService.delegateTask).not.toHaveBeenCalled();
    });

    it('confirmDelegate delegates and refreshes the task', () => {
      component.selectedTask.set(task());
      component.delegateActors = ['user:bob'];
      component.delegateComment = 'over to you';
      mockTaskService.delegateTask.mockReturnValue(of({}));
      mockTaskService.getTask.mockReturnValue(of(task({ id: 't1' })));

      component.confirmDelegate();

      expect(mockTaskService.delegateTask).toHaveBeenCalledWith('t1', ['user:bob'], 'over to you');
      expect(component.showDelegatePanel()).toBe(false);
      expect(mockTaskService.getTask).toHaveBeenCalledWith('t1');
      expect(component.submitting()).toBe(false);
    });

    it('confirmDelegate keeps the current task if the refresh fails', () => {
      const original = task({ id: 't1' });
      component.selectedTask.set(original);
      component.delegateActors = ['user:bob'];
      mockTaskService.delegateTask.mockReturnValue(of({}));
      mockTaskService.getTask.mockReturnValue(throwError(() => new Error('boom')));

      component.confirmDelegate();

      expect(component.selectedTask()).toBe(original);
    });

    it('confirmDelegate reports the server message on failure', () => {
      component.selectedTask.set(task());
      component.delegateActors = ['user:bob'];
      mockTaskService.delegateTask.mockReturnValue(
        throwError(() => ({ error: { message: 'Cannot delegate' } })),
      );

      component.confirmDelegate();

      expect(snackBarOpen).toHaveBeenCalledWith('Cannot delegate', 'Close', expect.anything());
      expect(component.submitting()).toBe(false);
    });

    it('confirmDelegate falls back to a generic failure message', () => {
      component.selectedTask.set(task());
      component.delegateActors = ['user:bob'];
      mockTaskService.delegateTask.mockReturnValue(throwError(() => new Error('x')));

      component.confirmDelegate();

      expect(snackBarOpen).toHaveBeenCalledWith(
        'Failed to delegate task.',
        'Close',
        expect.anything(),
      );
    });
  });

  describe('reassign', () => {
    it('opens the reassign panel and closes the delegate panel', () => {
      component.showDelegatePanel.set(true);

      component.openReassignPanel();

      expect(component.showReassignPanel()).toBe(true);
      expect(component.showDelegatePanel()).toBe(false);
    });

    it('closeReassignPanel wipes its form state', () => {
      component.reassignActors = ['user:bob'];
      component.reassignComment = 'yours';

      component.closeReassignPanel();

      expect(component.reassignActors).toEqual([]);
      expect(component.reassignComment).toBe('');
    });

    it('searchReassignUsers ignores short queries', () => {
      component.reassignInput = 'b';
      component.searchReassignUsers();
      expect(mockUserService.searchUsers).not.toHaveBeenCalled();
    });

    it('searchReassignUsers populates both result sets', () => {
      component.reassignInput = 'bob';
      mockUserService.searchUsers.mockReturnValue(of([{ id: 'bob' } as never]));
      mockUserService.searchGroups.mockReturnValue(of([{ name: 'g' } as never]));

      component.searchReassignUsers();

      expect(component.reassignUserResults().length).toBe(1);
      expect(component.reassignGroupResults().length).toBe(1);
    });

    it('searchReassignUsers swallows both failures', () => {
      component.reassignInput = 'bob';
      mockUserService.searchUsers.mockReturnValue(throwError(() => new Error('a')));
      mockUserService.searchGroups.mockReturnValue(throwError(() => new Error('b')));

      expect(() => component.searchReassignUsers()).not.toThrow();
    });

    it('addReassignActor de-duplicates and removeReassignActor drops', () => {
      component.addReassignActor('user:bob');
      component.addReassignActor('user:bob');
      expect(component.reassignActors).toEqual(['user:bob']);

      component.removeReassignActor('user:bob');
      expect(component.reassignActors).toEqual([]);
    });

    it('confirmReassign needs a task and an actor', () => {
      component.selectedTask.set(task());
      component.reassignActors = [];

      component.confirmReassign();

      expect(mockTaskService.reassignTask).not.toHaveBeenCalled();
    });

    it('confirmReassign reassigns and refreshes', () => {
      component.selectedTask.set(task());
      component.reassignActors = ['user:carol'];
      component.reassignComment = 'yours now';
      mockTaskService.reassignTask.mockReturnValue(of({}));
      mockTaskService.getTask.mockReturnValue(of(task()));

      component.confirmReassign();

      expect(mockTaskService.reassignTask).toHaveBeenCalledWith('t1', ['user:carol'], 'yours now');
      expect(component.showReassignPanel()).toBe(false);
      expect(component.submitting()).toBe(false);
    });

    it('confirmReassign reports the server message on failure', () => {
      component.selectedTask.set(task());
      component.reassignActors = ['user:carol'];
      mockTaskService.reassignTask.mockReturnValue(
        throwError(() => ({ error: { message: 'Cannot reassign' } })),
      );

      component.confirmReassign();

      expect(snackBarOpen).toHaveBeenCalledWith('Cannot reassign', 'Close', expect.anything());
    });

    it('confirmReassign falls back to a generic failure message', () => {
      component.selectedTask.set(task());
      component.reassignActors = ['user:carol'];
      mockTaskService.reassignTask.mockReturnValue(throwError(() => new Error('x')));

      component.confirmReassign();

      expect(snackBarOpen).toHaveBeenCalledWith(
        'Failed to reassign task.',
        'Close',
        expect.anything(),
      );
    });
  });

  describe('workflow graph', () => {
    it('does nothing without a workflow instance', () => {
      component.selectedTask.set(task({ workflowInstanceId: undefined }));

      component.openGraphPanel();

      expect(component.showGraphPanel()).toBe(false);
    });

    it('loads and stores the graph', () => {
      component.selectedTask.set(task());
      mockWorkflowService.getWorkflowGraph.mockReturnValue(of({ nodes: [] }));

      component.openGraphPanel();

      expect(component.showGraphPanel()).toBe(true);
      expect(component.graphLoading()).toBe(false);
      expect(component.graphData()).toEqual({ nodes: [] });
    });

    it('records an error marker when the graph fails to load', () => {
      component.selectedTask.set(task());
      mockWorkflowService.getWorkflowGraph.mockReturnValue(throwError(() => new Error('boom')));

      component.openGraphPanel();

      expect(component.graphData()).toEqual({ error: 'Failed to load graph' });
      expect(component.graphLoading()).toBe(false);
    });

    it('closeGraphPanel discards the graph', () => {
      component.showGraphPanel.set(true);
      component.graphData.set({ nodes: [] });

      component.closeGraphPanel();

      expect(component.showGraphPanel()).toBe(false);
      expect(component.graphData()).toBeNull();
    });

    it('graphNodes is empty with no data or an error marker', () => {
      expect(component.graphNodes()).toEqual([]);
      component.graphData.set({ error: 'boom' });
      expect(component.graphNodes()).toEqual([]);
    });

    it('graphNodes marks the current node from nodeName', () => {
      component.selectedTask.set(task({ nodeName: 'n2' }));
      component.graphData.set({
        nodes: [
          { id: 'n1', title: 'First', state: 'done' },
          { id: 'n2', state: 'running' },
        ],
      });

      expect(component.graphNodes()).toEqual([
        { id: 'n1', title: 'First', state: 'done', isCurrent: false },
        { id: 'n2', title: 'n2', state: 'running', isCurrent: true },
      ]);
    });

    it('graphNodes reads the alternative "elements" key', () => {
      component.graphData.set({ elements: [{ id: 'n1' }] });
      expect(component.graphNodes().map((n) => n.id)).toEqual(['n1']);
    });

    it('graphNodes tolerates nodes with no id at all', () => {
      component.graphData.set({ nodes: [{}] });
      expect(component.graphNodes()).toEqual([{ id: '', title: '', state: '', isCurrent: false }]);
    });
  });

  describe('task comments and actors', () => {
    it('taskComments is empty with no selection or no comments', () => {
      expect(component.taskComments).toEqual([]);
      component.selectedTask.set(task({ comments: undefined }));
      expect(component.taskComments).toEqual([]);
    });

    it('normalises string and object comment shapes', () => {
      component.selectedTask.set(
        task({
          comments: [
            'plain text',
            { author: 'bob', text: 'hello', date: '2026-01-01' },
            { author: 'carol', comment: 'legacy key', creationDate: '2026-01-02' },
            {},
          ],
        } as unknown as Partial<NuxeoTask>),
      );

      expect(component.taskComments).toEqual([
        { author: '', text: 'plain text', date: '' },
        { author: 'bob', text: 'hello', date: '2026-01-01' },
        { author: 'carol', text: 'legacy key', date: '2026-01-02' },
        { author: '', text: '', date: '' },
      ]);
    });

    it('taskActors maps actor ids', () => {
      expect(component.taskActors()).toEqual([]);
      component.selectedTask.set(task({ actors: [{ id: 'user:bob' }] } as Partial<NuxeoTask>));
      expect(component.taskActors()).toEqual(['user:bob']);
    });

    it('taskActors is empty when the task carries no actors array', () => {
      component.selectedTask.set(task({ actors: undefined }));
      expect(component.taskActors()).toEqual([]);
    });

    it('delegatedActorsList maps delegated actor ids', () => {
      expect(component.delegatedActorsList).toEqual([]);
      component.selectedTask.set(
        task({ delegatedActors: [{ id: 'user:carol' }] } as Partial<NuxeoTask>),
      );
      expect(component.delegatedActorsList).toEqual(['user:carol']);
    });

    it('actions is empty without taskInfo', () => {
      expect(component.actions).toEqual([]);
      component.selectedTask.set(task({ taskInfo: undefined }));
      expect(component.actions).toEqual([]);
    });

    it('actions surfaces the task actions', () => {
      component.selectedTask.set(
        task({ taskInfo: { taskActions: [{ name: 'approve', label: 'Approve' }] } }),
      );
      expect(component.actions).toEqual([{ name: 'approve', label: 'Approve' }]);
    });

    it('hasSelection tracks the selected task', () => {
      expect(component.hasSelection()).toBe(false);
      component.selectedTask.set(task());
      expect(component.hasSelection()).toBe(true);
    });
  });

  describe('breadcrumbs', () => {
    it('is empty without a target document path', () => {
      expect(component.breadcrumbItems()).toEqual([]);
      component.targetDoc.set(doc('d1', { path: '' }));
      expect(component.breadcrumbItems()).toEqual([]);
    });

    it('builds cumulative hrefs under /browse and decodes segments', () => {
      component.targetDoc.set(doc('d1', { path: '/default-domain/My%20Folder/file' }));

      expect(component.breadcrumbItems()).toEqual([
        { label: 'default-domain', href: '/browse/default-domain' },
        { label: 'My Folder', href: '/browse/default-domain/My%20Folder' },
        { label: 'file', href: '/browse/default-domain/My%20Folder/file' },
      ]);
    });

    it('reuses the cached items for an unchanged path', () => {
      component.targetDoc.set(doc('d1', { path: '/a/b' }));
      const first = component.breadcrumbItems();

      component.targetDoc.set(doc('d2', { path: '/a/b' }));

      expect(component.breadcrumbItems()).toBe(first);
    });

    it('onBreadcrumbClick routes to the anchor href instead of reloading', () => {
      const navigateByUrl = vi
        .spyOn(TestBed.inject(Router), 'navigateByUrl')
        .mockResolvedValue(true);
      const anchor = document.createElement('a');
      anchor.setAttribute('href', '/browse/default-domain');
      const preventDefault = vi.fn();

      component.onBreadcrumbClick({
        target: anchor,
        preventDefault,
      } as unknown as MouseEvent);

      expect(preventDefault).toHaveBeenCalled();
      expect(navigateByUrl).toHaveBeenCalledWith('/browse/default-domain');
    });

    it('onBreadcrumbClick ignores a click that is not on a link', () => {
      const navigateByUrl = vi
        .spyOn(TestBed.inject(Router), 'navigateByUrl')
        .mockResolvedValue(true);

      component.onBreadcrumbClick({
        target: document.createElement('span'),
        preventDefault: vi.fn(),
      } as unknown as MouseEvent);

      expect(navigateByUrl).not.toHaveBeenCalled();
    });
  });

  describe('document preview', () => {
    it('fetches the raw blob for an image target', () => {
      mockHttp.get.mockReturnValue(of(new Blob(['img'])));
      mockDocService.getById.mockReturnValue(
        of(doc('d1', { properties: { 'file:content': { 'mime-type': 'image/png' } } })),
      );

      component.selectTask(
        task({ targetDocumentIds: [{ id: 'd1' }] as unknown as NuxeoTask['targetDocumentIds'] }),
      );

      expect(mockNuxeoApi.apiUrl).toHaveBeenCalledWith('/nuxeo/api/v1/id/d1/@blob/file:content');
      expect(component.previewUrl()).toBeTruthy();
    });

    it('falls back to the thumbnail rendition for a non-image target', () => {
      mockHttp.get.mockReturnValue(of(new Blob(['thumb'])));
      mockDocService.getById.mockReturnValue(
        of(doc('d1', { properties: { 'file:content': { 'mime-type': 'application/pdf' } } })),
      );

      component.selectTask(
        task({ targetDocumentIds: [{ id: 'd1' }] as unknown as NuxeoTask['targetDocumentIds'] }),
      );

      expect(mockNuxeoApi.apiUrl).toHaveBeenCalledWith('/nuxeo/api/v1/id/d1/@rendition/thumbnail');
    });

    it('skips the preview fetch when the document has no blob', () => {
      mockDocService.getById.mockReturnValue(of(doc('d1')));

      component.selectTask(
        task({ targetDocumentIds: [{ id: 'd1' }] as unknown as NuxeoTask['targetDocumentIds'] }),
      );

      expect(mockHttp.get).not.toHaveBeenCalled();
      expect(component.previewUrl()).toBeNull();
    });

    it('leaves the preview empty when the blob request fails', () => {
      mockHttp.get.mockReturnValue(throwError(() => new Error('404')));
      mockDocService.getById.mockReturnValue(
        of(doc('d1', { properties: { 'file:content': { 'mime-type': 'image/png' } } })),
      );

      component.selectTask(
        task({ targetDocumentIds: [{ id: 'd1' }] as unknown as NuxeoTask['targetDocumentIds'] }),
      );

      expect(component.previewUrl()).toBeNull();
    });

    it('revokes the previous preview URL when a new task is selected', () => {
      mockHttp.get.mockReturnValue(of(new Blob(['img'])));
      mockDocService.getById.mockReturnValue(
        of(doc('d1', { properties: { 'file:content': { 'mime-type': 'image/png' } } })),
      );
      component.selectTask(
        task({ targetDocumentIds: [{ id: 'd1' }] as unknown as NuxeoTask['targetDocumentIds'] }),
      );
      revokeObjectURL.mockClear();

      component.selectTask(task({ id: 't2', targetDocumentIds: [] }));

      expect(revokeObjectURL).toHaveBeenCalledWith('blob:preview');
      expect(component.previewUrl()).toBeNull();
    });
  });

  describe('document metadata helpers', () => {
    it('downloadUrl is null without a target document', () => {
      expect(component.downloadUrl()).toBeNull();
    });

    it('downloadUrl points at the main blob', () => {
      component.targetDoc.set(doc('d7'));
      expect(component.downloadUrl()).toBe('http://nuxeo/nuxeo/api/v1/id/d7/@blob/file:content');
    });

    it('download opens the blob URL in a new tab', () => {
      component.targetDoc.set(doc('d7'));
      const open = vi.spyOn(window, 'open').mockReturnValue(null);

      component.download();

      expect(open).toHaveBeenCalledWith(
        'http://nuxeo/nuxeo/api/v1/id/d7/@blob/file:content',
        '_blank',
      );
      open.mockRestore();
    });

    it('download is a no-op with no target document', () => {
      const open = vi.spyOn(window, 'open').mockReturnValue(null);

      component.download();

      expect(open).not.toHaveBeenCalled();
      open.mockRestore();
    });

    it.each([
      [512, '512 B'],
      [2048, '2.00 KB'],
      [5 * 1024 * 1024, '5.00 MB'],
    ])('fileSize formats %i bytes', (length, expected) => {
      component.targetDoc.set(doc('d1', { properties: { 'file:content': { length } } }));
      expect(component.fileSize()).toBe(expected);
    });

    it('fileSize is empty without a blob length', () => {
      expect(component.fileSize()).toBe('');
      component.targetDoc.set(doc('d1'));
      expect(component.fileSize()).toBe('');
    });

    it('mimeType reads the blob mime type', () => {
      expect(component.mimeType()).toBe('');
      component.targetDoc.set(
        doc('d1', { properties: { 'file:content': { 'mime-type': 'image/png' } } }),
      );
      expect(component.mimeType()).toBe('image/png');
    });

    it('fileName prefers the blob name and falls back to the title', () => {
      component.targetDoc.set(
        doc('d1', { title: 'Doc title', properties: { 'file:content': { name: 'scan.pdf' } } }),
      );
      expect(component.fileName()).toBe('scan.pdf');

      component.targetDoc.set(doc('d1', { title: 'Doc title' }));
      expect(component.fileName()).toBe('Doc title');
    });

    it('fileName is empty with no target document', () => {
      expect(component.fileName()).toBe('');
    });

    it('docProp reads an arbitrary property', () => {
      expect(component.docProp('dc:nature')).toBeNull();
      component.targetDoc.set(doc('d1', { properties: { 'dc:nature': 'article' } }));
      expect(component.docProp('dc:nature')).toBe('article');
    });
  });

  describe('label formatting', () => {
    it('taskLabel strips the workflow prefix and title suffix, then humanises', () => {
      expect(component.taskLabel(task({ name: 'wf.serialReview.chooseParticipants.title' }))).toBe(
        'Choose Participants',
      );
    });

    it('taskDirective prefers the directive and falls back to the name', () => {
      expect(
        component.taskDirective(task({ name: 'wf.x.approve', directive: 'wf.x.validate' })),
      ).toBe('Validate');
      expect(component.taskDirective(task({ name: 'wf.x.approve' }))).toBe('Approve');
    });

    it('taskWorkflow prefers the title over the model name', () => {
      expect(
        component.taskWorkflow(
          task({ workflowTitle: 'wf.x.serialReview', workflowModelName: 'm' }),
        ),
      ).toBe('Serial Review');
      expect(component.taskWorkflow(task({ workflowModelName: 'parallelReview' }))).toBe(
        'Parallel Review',
      );
    });

    it('taskWorkflow is empty when neither field is set', () => {
      expect(component.taskWorkflow(task({ workflowTitle: '', workflowModelName: '' }))).toBe('');
    });

    it('actionLabel humanises underscores and camel case', () => {
      expect(component.actionLabel({ name: 'start_review', label: '' })).toBe('Start Review');
      expect(component.actionLabel({ name: 'x', label: 'wf.x.validateDocument' })).toBe(
        'Validate Document',
      );
    });

    it.each([
      ['reject', 'warn'],
      ['cancel', 'warn'],
      ['approve', 'primary'],
      ['validate', 'primary'],
      ['start_review', 'primary'],
      ['comment', ''],
    ])('actionColor(%s) is %s', (name, expected) => {
      expect(component.actionColor({ name })).toBe(expected);
    });

    it.each([
      ['approve', 'check_circle'],
      ['validate', 'check_circle'],
      ['reject', 'cancel'],
      ['start_review', 'play_arrow'],
      ['cancel_workflow', 'block'],
      ['comment', 'send'],
    ])('actionIcon(%s) is %s', (name, expected) => {
      expect(component.actionIcon({ name })).toBe(expected);
    });

    it('dueDateFormatted renders a long date and empty for none', () => {
      expect(component.dueDateFormatted(task({ dueDate: undefined }))).toBe('');
      expect(component.dueDateFormatted(task({ dueDate: '2026-03-15T00:00:00.000Z' }))).toContain(
        '2026',
      );
    });

    it('isOverdue compares against now', () => {
      expect(component.isOverdue(task({ dueDate: undefined }))).toBe(false);
      expect(component.isOverdue(task({ dueDate: '2000-01-01T00:00:00.000Z' }))).toBe(true);
      expect(component.isOverdue(task({ dueDate: '2099-01-01T00:00:00.000Z' }))).toBe(false);
    });

    describe('dueLabel', () => {
      beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2026-01-10T12:00:00.000Z'));
      });

      afterEach(() => vi.useRealTimers());

      it('is empty with no due date', () => {
        expect(component.dueLabel(task({ dueDate: undefined }))).toBe('');
      });

      it('renders whole days ahead', () => {
        expect(component.dueLabel(task({ dueDate: '2026-01-13T12:00:00.000Z' }))).toBe(
          'Due in 3 days',
        );
      });

      it('singularises a single day', () => {
        expect(component.dueLabel(task({ dueDate: '2026-01-11T12:00:00.000Z' }))).toBe(
          'Due in 1 day',
        );
      });

      it('renders hours when under a day', () => {
        expect(component.dueLabel(task({ dueDate: '2026-01-10T17:00:00.000Z' }))).toBe(
          'Due in 5 hours',
        );
      });

      it('collapses under an hour', () => {
        expect(component.dueLabel(task({ dueDate: '2026-01-10T12:30:00.000Z' }))).toBe(
          'Due in less than an hour',
        );
      });

      it('renders overdue in the past tense', () => {
        expect(component.dueLabel(task({ dueDate: '2026-01-08T12:00:00.000Z' }))).toBe(
          '2 days overdue',
        );
      });
    });
  });
});
