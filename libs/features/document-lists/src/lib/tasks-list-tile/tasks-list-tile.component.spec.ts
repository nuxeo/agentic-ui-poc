import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, withDisabledInitialNavigation } from '@angular/router';
import { provideExperimentalZonelessChangeDetection } from '@angular/core';
import { EMPTY, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { TasksListTileComponent } from './tasks-list-tile.component';
import { TaskService, type NuxeoTask, CURRENT_USERNAME } from '@agentic-ui/shared/nuxeo-client';

describe('TasksListTileComponent', () => {
  let component: TasksListTileComponent;
  let fixture: ComponentFixture<TasksListTileComponent>;

  const mockTasks: NuxeoTask[] = [
    {
      id: 'task-1',
      name: 'wf.serialDocumentReview.DocumentValidation',
      directive: 'Validate',
      workflowInstanceId: 'wf-1',
      workflowModelName: 'SerialDocumentReview',
      workflowTitle: 'Serial Document Review',
      created: '2026-08-01T10:00:00Z',
      dueDate: '2026-08-10T10:00:00Z',
      state: 'opened',
      nodeName: 'node-1',
      targetDocumentIds: [{ uid: 'doc-1', title: 'Test Document' }],
      targetDocTitle: 'Test Document',
      actors: [{ id: 'user1' }],
      delegatedActors: [],
      comments: [],
      variables: {},
      taskInfo: { taskActions: [] },
    },
  ];

  const mockTaskService = {
    getUserTasks: vi.fn(() => EMPTY),
    tasksChanged$: { subscribe: vi.fn() },
  };

  async function createComponent(inputs: { title: string; limit?: number }) {
    await TestBed.configureTestingModule({
      imports: [TasksListTileComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        provideRouter([], withDisabledInitialNavigation()),
        { provide: TaskService, useValue: mockTaskService },
        { provide: CURRENT_USERNAME, useValue: () => 'testuser' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TasksListTileComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', inputs.title);
    if (inputs.limit !== undefined) {
      fixture.componentRef.setInput('limit', inputs.limit);
    }
    fixture.detectChanges();
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mockTaskService.getUserTasks.mockReturnValue(EMPTY);
  });

  afterEach(() => {
    fixture?.destroy();
  });

  it('should create', async () => {
    mockTaskService.getUserTasks.mockReturnValue(of([]));
    await createComponent({ title: 'My Tasks' });
    expect(component).toBeTruthy();
  });

  it('should load tasks on init', async () => {
    mockTaskService.getUserTasks.mockReturnValue(of(mockTasks));
    await createComponent({ title: 'My Tasks', limit: 10 });

    expect(mockTaskService.getUserTasks).toHaveBeenCalledWith('testuser', 10);
    expect(component.tasks()).toEqual(mockTasks);
    expect(component.loading()).toBe(false);
    expect(component.error()).toBeNull();
  });

  it('should handle error when loading tasks', async () => {
    mockTaskService.getUserTasks.mockReturnValue(throwError(() => new Error('Network error')));
    await createComponent({ title: 'My Tasks', limit: 10 });

    expect(component.loading()).toBe(false);
    expect(component.error()).toBe('Failed to load tasks.');
    expect(component.tasks()).toEqual([]);
  });

  it('should clamp limit to valid range', async () => {
    mockTaskService.getUserTasks.mockReturnValue(of([]));
    await createComponent({ title: 'My Tasks', limit: 100 });

    expect(mockTaskService.getUserTasks).toHaveBeenCalledWith('testuser', 50);
  });

  it('should format task label correctly', async () => {
    mockTaskService.getUserTasks.mockReturnValue(of([]));
    await createComponent({ title: 'My Tasks' });

    const label = component.taskLabel(mockTasks[0]);
    expect(label).toBe('Document Validation');
  });

  it('should detect overdue tasks', async () => {
    mockTaskService.getUserTasks.mockReturnValue(of([]));
    await createComponent({ title: 'My Tasks' });

    const now = new Date();
    const pastDate = new Date(now.getTime() - 86400000).toISOString();
    const futureDate = new Date(now.getTime() + 86400000).toISOString();

    const overdueTask = { ...mockTasks[0], dueDate: pastDate };
    const notOverdueTask = { ...mockTasks[0], dueDate: futureDate };

    expect(component.isOverdue(overdueTask)).toBe(true);
    expect(component.isOverdue(notOverdueTask)).toBe(false);
  });

  it('should format relative time correctly', async () => {
    mockTaskService.getUserTasks.mockReturnValue(of([]));
    await createComponent({ title: 'My Tasks' });

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 3600000).toISOString();
    const oneDayAgo = new Date(now.getTime() - 86400000).toISOString();

    expect(component.relativeTime(oneHourAgo)).toBe('an hour ago');
    expect(component.relativeTime(oneDayAgo)).toBe('a day ago');
  });

  it('should show empty state when no tasks', async () => {
    mockTaskService.getUserTasks.mockReturnValue(of([]));
    await createComponent({ title: 'My Tasks', limit: 10 });

    expect(component.hasContent()).toBe(false);
  });
});
