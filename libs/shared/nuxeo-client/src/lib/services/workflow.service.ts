import { HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import {
  NuxeoWorkflow,
  NuxeoWorkflowList,
  NuxeoWorkflowModel,
  NuxeoWorkflowModelList,
} from '../models/workflow.model';
import { NuxeoApiBase } from './nuxeo-api-base';

@Injectable({ providedIn: 'root' })
export class WorkflowService {
  private readonly api = inject(NuxeoApiBase);

  /** Get all available workflow models (Serial, Parallel, custom). */
  getWorkflowModels(): Observable<NuxeoWorkflowModel[]> {
    return this.api
      .get<NuxeoWorkflowModelList>('/nuxeo/api/v1/workflowModel')
      .pipe(map((res) => res.entries));
  }

  /** Start a workflow on a document. */
  startWorkflow(
    docId: string,
    workflowModelName: string,
  ): Observable<NuxeoWorkflow> {
    return this.api.post<NuxeoWorkflow>(
      `/nuxeo/api/v1/id/${docId}/@workflow`,
      {
        'entity-type': 'workflow',
        workflowModelName,
        attachedDocumentIds: [{ id: docId }],
      },
    );
  }

  /** Get running workflow instances on a document. */
  getDocumentWorkflows(docId: string): Observable<NuxeoWorkflow[]> {
    return this.api
      .get<NuxeoWorkflowList>(`/nuxeo/api/v1/id/${docId}/@workflow`)
      .pipe(map((res) => res.entries));
  }

  /** Get workflow instances launched by current user. */
  getMyWorkflows(): Observable<NuxeoWorkflow[]> {
    return this.api
      .get<NuxeoWorkflowList>('/nuxeo/api/v1/workflow')
      .pipe(map((res) => res.entries));
  }

  /** Get a specific workflow instance. */
  getWorkflow(workflowId: string): Observable<NuxeoWorkflow> {
    return this.api.get<NuxeoWorkflow>(
      `/nuxeo/api/v1/workflow/${workflowId}`,
    );
  }

  /** Cancel / abandon a running workflow. */
  cancelWorkflow(workflowInstanceId: string): Observable<void> {
    return this.api.delete<void>(
      `/nuxeo/api/v1/workflow/${workflowInstanceId}`,
    );
  }

  /** Get the workflow graph (JSON). */
  getWorkflowGraph(workflowInstanceId: string): Observable<unknown> {
    return this.api.get<unknown>(
      `/nuxeo/api/v1/workflow/${workflowInstanceId}/graph`,
    );
  }

  /** Get a specific workflow model by name. */
  getWorkflowModel(modelName: string): Observable<NuxeoWorkflowModel> {
    return this.api.get<NuxeoWorkflowModel>(
      `/nuxeo/api/v1/workflowModel/${modelName}`,
    );
  }

  /** Get the graph of a workflow model. */
  getWorkflowModelGraph(modelName: string): Observable<unknown> {
    return this.api.get<unknown>(
      `/nuxeo/api/v1/workflowModel/${modelName}/graph`,
    );
  }
}
