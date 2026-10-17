import { Observable, Subject } from 'rxjs';
import { NuxeoTask } from '../models/task.model';
import * as i0 from "@angular/core";
export declare class TaskService {
    private readonly api;
    /** Emits whenever tasks are mutated (completed, delegated, reassigned, abandoned). */
    readonly tasksChanged$: Subject<void>;
    /** Notify all subscribers that the task list has changed. */
    notifyTasksChanged(): void;
    /** Fetch headers to resolve task targets and actors. */
    private readonly taskFetchHeaders;
    getUserTasks(userId: string, pageSize?: number): Observable<NuxeoTask[]>;
    /** Get a specific task by ID (with enriched targets & actors). */
    getTask(taskId: string): Observable<NuxeoTask>;
    /** Get tasks for a document. */
    getDocumentTasks(docId: string, userId?: string): Observable<NuxeoTask[]>;
    /**
     * Complete a task by executing an action (e.g., start_review, approve, reject, validate).
     * Variables are task-specific (comment, participants, end_date, etc.).
     */
    completeTask(taskId: string, action: string, variables?: Record<string, unknown>, comment?: string): Observable<NuxeoTask>;
    /** Reassign a task to other actors (replaces current actors). */
    reassignTask(taskId: string, actors: string[], comment?: string): Observable<void>;
    /** Delegate a task to additional actors (keeps original actors). */
    delegateTask(taskId: string, delegatedActors: string[], comment?: string): Observable<void>;
    static ɵfac: i0.ɵɵFactoryDeclaration<TaskService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<TaskService>;
}
//# sourceMappingURL=task.service.d.ts.map