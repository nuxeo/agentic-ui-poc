import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { TaskService, CURRENT_USERNAME } from '@nuxeo-satori/platform/nuxeo-client';
import { testTranslateModule } from '@agentic-ui/testing/i18n';

import { TaskListComponent } from './task-list.component';

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let mockTaskService: { getUserTasks: ReturnType<typeof vi.fn> };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  const mockTasks = [
    {
      id: 'task-1',
      name: 'wf.serialDocumentReview.validateTask.title',
      workflowModelName: 'SerialDocumentReview',
      targetDocumentIds: [{ id: 'doc-1' }],
      actors: [{ id: 'user1' }],
      created: '2026-01-01T00:00:00.000Z',
      dueDate: '2026-01-15T00:00:00.000Z',
    },
    {
      id: 'task-2',
      name: 'wf.parallelReview.approveTask.directive',
      workflowModelName: 'ParallelDocumentReview',
      targetDocumentIds: [{ id: 'doc-2' }],
      actors: [{ id: 'user2' }],
      created: '2026-01-02T00:00:00.000Z',
      dueDate: null,
    },
  ];

  beforeEach(async () => {
    mockTaskService = {
      getUserTasks: vi.fn().mockReturnValue(of(mockTasks)),
    };

    mockRouter = {
      navigate: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [testTranslateModule(), TaskListComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: TaskService, useValue: mockTaskService },
        { provide: Router, useValue: mockRouter },
        { provide: CURRENT_USERNAME, useValue: () => 'testuser' },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
  });

  it('creates the component', () => {
    expect(component).toBeDefined();
  });

  it('loads tasks on initialization', () => {
    fixture.detectChanges(); // triggers ngOnInit

    expect(mockTaskService.getUserTasks).toHaveBeenCalledWith('testuser', 50);
    expect(component.tasks()).toEqual(mockTasks);
    expect(component.loading()).toBe(false);
    expect(component.error()).toBeNull();
  });

  it('uses Administrator as default when currentUsername is null', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [testTranslateModule(), TaskListComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: TaskService, useValue: mockTaskService },
        { provide: Router, useValue: mockRouter },
        { provide: CURRENT_USERNAME, useValue: () => null },
      ],
    });

    const newFixture = TestBed.createComponent(TaskListComponent);
    newFixture.detectChanges();

    expect(mockTaskService.getUserTasks).toHaveBeenCalledWith('Administrator', 50);
  });

  it('sets loading state during task fetch', () => {
    expect(component.loading()).toBe(true);

    fixture.detectChanges();

    expect(component.loading()).toBe(false);
  });

  it('handles error when loading tasks fails', () => {
    mockTaskService.getUserTasks.mockReturnValue(throwError(() => new Error('Network error')));

    fixture.detectChanges();

    expect(component.error()).toBeTruthy();
    expect(component.loading()).toBe(false);
    expect(component.tasks()).toEqual([]);
  });

  it('navigates to task detail when processTask is called', () => {
    component.processTask(mockTasks[0]);

    expect(mockRouter.navigate).toHaveBeenCalledWith(['/tasks', 'task-1']);
  });

  it('transforms task name into readable label', () => {
    const label1 = component.taskLabel(mockTasks[0]);
    expect(label1).toBe('Validate Task');

    const label2 = component.taskLabel(mockTasks[1]);
    expect(label2).toBe('Approve Task');
  });

  it('removes workflow prefix from task name', () => {
    const task = {
      ...mockTasks[0],
      name: 'wf.serialDocumentReview.someComplexTaskName.title',
    };

    const label = component.taskLabel(task);
    expect(label).toBe('Some Complex Task Name');
  });

  it('capitalizes first letter of each word in task label', () => {
    const task = {
      ...mockTasks[0],
      name: 'wf.test.reviewAndApprove.title',
    };

    const label = component.taskLabel(task);
    expect(label).toBe('Review And Approve');
  });

  it('extracts workflow display name from workflowModelName', () => {
    const workflow1 = component.taskWorkflow(mockTasks[0]);
    expect(workflow1).toBe('Serial Document Review');

    const workflow2 = component.taskWorkflow(mockTasks[1]);
    expect(workflow2).toBe('Parallel Document Review');
  });

  it('handles camelCase in workflow names', () => {
    const task = {
      ...mockTasks[0],
      workflowModelName: 'myCustomWorkflowProcess',
    };

    const workflow = component.taskWorkflow(task);
    expect(workflow).toBe('My Custom Workflow Process');
  });

  it('can reload tasks manually', () => {
    fixture.detectChanges(); // initial load
    mockTaskService.getUserTasks.mockClear();

    component.loadTasks();

    expect(mockTaskService.getUserTasks).toHaveBeenCalledTimes(1);
    expect(component.loading()).toBe(false);
  });

  describe('isOverdue', () => {
    it('returns true when due date is in the past', () => {
      const overdueTask = {
        ...mockTasks[0],
        dueDate: '2020-01-01T00:00:00.000Z', // past date
      };

      expect(component.isOverdue(overdueTask)).toBe(true);
    });

    it('returns false when due date is in the future', () => {
      const futureTask = {
        ...mockTasks[0],
        dueDate: '2030-01-01T00:00:00.000Z', // future date
      };

      expect(component.isOverdue(futureTask)).toBe(false);
    });

    it('returns false when task has no due date', () => {
      const noDateTask = {
        ...mockTasks[0],
        dueDate: null,
      };

      expect(component.isOverdue(noDateTask)).toBe(false);
    });
  });

  describe('dueLabel', () => {
    it('returns empty string when task has no due date', () => {
      const noDateTask = {
        ...mockTasks[0],
        dueDate: null,
      };

      expect(component.dueLabel(noDateTask)).toBe('');
    });

    it('returns "less than an hour" for tasks due very soon', () => {
      const soonDate = new Date(Date.now() + 30 * 60 * 1000).toISOString(); // 30 minutes
      const soonTask = {
        ...mockTasks[0],
        dueDate: soonDate,
      };

      const label = component.dueLabel(soonTask);
      expect(label).toContain('less than an hour');
    });

    it('returns hours for tasks due within a day', () => {
      const hoursDate = new Date(Date.now() + 5 * 3600 * 1000).toISOString(); // 5 hours
      const hoursTask = {
        ...mockTasks[0],
        dueDate: hoursDate,
      };

      const label = component.dueLabel(hoursTask);
      expect(label).toMatch(/in \d+ hours/);
    });

    it('returns days for tasks due multiple days away', () => {
      const daysDate = new Date(Date.now() + 3 * 86400 * 1000).toISOString(); // 3 days
      const daysTask = {
        ...mockTasks[0],
        dueDate: daysDate,
      };

      const label = component.dueLabel(daysTask);
      expect(label).toContain('in 3 days');
    });

    it('returns "1 day" for exactly one day', () => {
      const oneDayDate = new Date(Date.now() + 25 * 3600 * 1000).toISOString(); // ~1 day
      const oneDayTask = {
        ...mockTasks[0],
        dueDate: oneDayDate,
      };

      const label = component.dueLabel(oneDayTask);
      expect(label).toContain('1 day');
    });

    it('returns "overdue" for past due dates with hours', () => {
      const overdueDate = new Date(Date.now() - 3 * 3600 * 1000).toISOString(); // 3 hours ago
      const overdueTask = {
        ...mockTasks[0],
        dueDate: overdueDate,
      };

      const label = component.dueLabel(overdueTask);
      expect(label).toContain('overdue');
      expect(label).toMatch(/\d+ hours overdue/);
    });

    it('returns "overdue" for past due dates with days', () => {
      const overdueDate = new Date(Date.now() - 2 * 86400 * 1000).toISOString(); // 2 days ago
      const overdueTask = {
        ...mockTasks[0],
        dueDate: overdueDate,
      };

      const label = component.dueLabel(overdueTask);
      expect(label).toContain('2 days overdue');
    });
  });
});
