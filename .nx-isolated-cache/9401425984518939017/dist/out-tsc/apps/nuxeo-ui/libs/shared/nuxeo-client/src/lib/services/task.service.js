import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Subject, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { NuxeoApiBase } from './nuxeo-api-base';
import * as i0 from "@angular/core";
export class TaskService {
    api = inject(NuxeoApiBase);
    /** Emits whenever tasks are mutated (completed, delegated, reassigned, abandoned). */
    tasksChanged$ = new Subject();
    /** Notify all subscribers that the task list has changed. */
    notifyTasksChanged() {
        this.tasksChanged$.next();
    }
    /** Fetch headers to resolve task targets and actors. */
    taskFetchHeaders = {
        'X-NXfetch.task': 'targetDocumentIds,actors',
    };
    getUserTasks(userId, pageSize = 10) {
        const params = new HttpParams().set('userId', userId).set('pageSize', pageSize);
        return this.api.get('/nuxeo/api/v1/task', params, this.taskFetchHeaders).pipe(map((res) => res.entries), switchMap((tasks) => {
            if (tasks.length === 0)
                return of([]);
            const enriched$ = tasks.map((task) => {
                const targetRef = task.targetDocumentIds?.[0];
                // Enriched response has uid+title, plain response has id
                if (targetRef?.title) {
                    return of({ ...task, targetDocTitle: targetRef.title });
                }
                const docId = targetRef?.uid || targetRef?.id;
                if (!docId)
                    return of(task);
                return this.api.get(`/nuxeo/api/v1/id/${docId}`).pipe(map((doc) => ({ ...task, targetDocTitle: doc.title })), catchError(() => of(task)));
            });
            return forkJoin(enriched$);
        }));
    }
    /** Get a specific task by ID (with enriched targets & actors). */
    getTask(taskId) {
        return this.api.get(`/nuxeo/api/v1/task/${taskId}`, undefined, this.taskFetchHeaders);
    }
    /** Get tasks for a document. */
    getDocumentTasks(docId, userId) {
        let params = new HttpParams();
        if (userId)
            params = params.set('userId', userId);
        return this.api
            .get(`/nuxeo/api/v1/id/${docId}/@task`, params, this.taskFetchHeaders)
            .pipe(map((res) => res.entries));
    }
    /**
     * Complete a task by executing an action (e.g., start_review, approve, reject, validate).
     * Variables are task-specific (comment, participants, end_date, etc.).
     */
    completeTask(taskId, action, variables = {}, comment) {
        const body = {
            'entity-type': 'task',
            id: taskId,
            variables,
        };
        if (comment !== undefined) {
            body['comment'] = comment;
        }
        return this.api.put(`/nuxeo/api/v1/task/${taskId}/${action}`, body);
    }
    /** Reassign a task to other actors (replaces current actors). */
    reassignTask(taskId, actors, comment) {
        const body = {
            'entity-type': 'task',
            id: taskId,
            actors,
        };
        if (comment)
            body['comment'] = comment;
        return this.api.put(`/nuxeo/api/v1/task/${taskId}/reassign`, body);
    }
    /** Delegate a task to additional actors (keeps original actors). */
    delegateTask(taskId, delegatedActors, comment) {
        const body = {
            'entity-type': 'task',
            id: taskId,
            delegatedActors,
        };
        if (comment)
            body['comment'] = comment;
        return this.api.put(`/nuxeo/api/v1/task/${taskId}/delegate`, body);
    }
    static ɵfac = function TaskService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || TaskService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: TaskService, factory: TaskService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(TaskService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
