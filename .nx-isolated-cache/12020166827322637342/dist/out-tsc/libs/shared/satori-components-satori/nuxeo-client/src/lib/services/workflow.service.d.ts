import { Observable } from 'rxjs';
import { NuxeoWorkflow, NuxeoWorkflowModel } from '../models/workflow.model';
import * as i0 from "@angular/core";
export declare class WorkflowService {
    private readonly api;
    /** Get all available workflow models (Serial, Parallel, custom). */
    getWorkflowModels(): Observable<NuxeoWorkflowModel[]>;
    /** Start a workflow on a document. */
    startWorkflow(docId: string, workflowModelName: string): Observable<NuxeoWorkflow>;
    /** Get running workflow instances on a document. */
    getDocumentWorkflows(docId: string): Observable<NuxeoWorkflow[]>;
    /** Get workflow instances launched by current user. */
    getMyWorkflows(): Observable<NuxeoWorkflow[]>;
    /** Get a specific workflow instance. */
    getWorkflow(workflowId: string): Observable<NuxeoWorkflow>;
    /** Cancel / abandon a running workflow. */
    cancelWorkflow(workflowInstanceId: string): Observable<void>;
    /** Get the workflow graph (JSON). */
    getWorkflowGraph(workflowInstanceId: string): Observable<unknown>;
    /** Get a specific workflow model by name. */
    getWorkflowModel(modelName: string): Observable<NuxeoWorkflowModel>;
    /** Get the graph of a workflow model. */
    getWorkflowModelGraph(modelName: string): Observable<unknown>;
    static ɵfac: i0.ɵɵFactoryDeclaration<WorkflowService, never>;
    static ɵprov: i0.ɵɵInjectableDeclaration<WorkflowService>;
}
//# sourceMappingURL=workflow.service.d.ts.map