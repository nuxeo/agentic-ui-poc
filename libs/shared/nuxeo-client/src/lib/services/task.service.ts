import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';

import { NuxeoTask, NuxeoTaskList } from '../models/task.model';
import { NuxeoDocument } from '../models/document.model';
import { NuxeoApiBase } from './nuxeo-api-base';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly api = inject(NuxeoApiBase);

  getUserTasks(userId: string, pageSize = 10): Observable<NuxeoTask[]> {
    const params = new HttpParams()
      .set('userId', userId)
      .set('pageSize', pageSize);

    return this.api
      .get<NuxeoTaskList>('/nuxeo/api/v1/task', params)
      .pipe(
        map((res) => res.entries),
        switchMap((tasks) => {
          if (tasks.length === 0) return of([] as NuxeoTask[]);

          const enriched$ = tasks.map((task) => {
            const docId = task.targetDocumentIds?.[0]?.id;
            if (!docId) return of(task);

            return this.api
              .get<NuxeoDocument>(`/nuxeo/api/v1/id/${docId}`)
              .pipe(
                map((doc) => ({ ...task, targetDocTitle: doc.title })),
                catchError(() => of(task)),
              );
          });

          return forkJoin(enriched$);
        }),
      );
  }
}
