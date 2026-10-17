import { Injectable, inject } from '@angular/core';
import { map } from 'rxjs';
import { NuxeoApiBase } from './nuxeo-api-base';
import * as i0 from "@angular/core";
export class WorkflowService {
    api = inject(NuxeoApiBase);
    /** Get all available workflow models (Serial, Parallel, custom). */
    getWorkflowModels() {
        return this.api
            .get('/nuxeo/api/v1/workflowModel')
            .pipe(map((res) => res.entries));
    }
    /** Start a workflow on a document. */
    startWorkflow(docId, workflowModelName) {
        return this.api.post(`/nuxeo/api/v1/id/${docId}/@workflow`, {
            'entity-type': 'workflow',
            workflowModelName,
            attachedDocumentIds: [docId],
        });
    }
    /** Get running workflow instances on a document. */
    getDocumentWorkflows(docId) {
        return this.api
            .get(`/nuxeo/api/v1/id/${docId}/@workflow`)
            .pipe(map((res) => res.entries));
    }
    /** Get workflow instances launched by current user. */
    getMyWorkflows() {
        return this.api
            .get('/nuxeo/api/v1/workflow')
            .pipe(map((res) => res.entries));
    }
    /** Get a specific workflow instance. */
    getWorkflow(workflowId) {
        return this.api.get(`/nuxeo/api/v1/workflow/${workflowId}`);
    }
    /** Cancel / abandon a running workflow. */
    cancelWorkflow(workflowInstanceId) {
        return this.api.delete(`/nuxeo/api/v1/workflow/${workflowInstanceId}`);
    }
    /** Get the workflow graph (JSON). */
    getWorkflowGraph(workflowInstanceId) {
        return this.api.get(`/nuxeo/api/v1/workflow/${workflowInstanceId}/graph`);
    }
    /** Get a specific workflow model by name. */
    getWorkflowModel(modelName) {
        return this.api.get(`/nuxeo/api/v1/workflowModel/${modelName}`);
    }
    /** Get the graph of a workflow model. */
    getWorkflowModelGraph(modelName) {
        return this.api.get(`/nuxeo/api/v1/workflowModel/${modelName}/graph`);
    }
    static ɵfac = function WorkflowService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || WorkflowService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: WorkflowService, factory: WorkflowService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(WorkflowService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
//# sourceMappingURL=workflow.service.js.map