import { optionalInteger, optionalString, requiredRecord, requiredString } from './args';
import type { AgentTool, ToolContext } from './tool.types';

/**
 * Task and workflow tools, mapped onto `TaskService` and `WorkflowService`.
 *
 * Note the deliberate omission: there is no "complete every task assigned to me"
 * tool. Completing a task is an irreversible business decision, so the agent
 * completes one identified task at a time and the recipes route that through the
 * frontend `confirmAction` tool first.
 */

interface NuxeoTask {
  readonly id?: string;
  readonly name?: string;
  readonly workflowInstanceId?: string;
  readonly dueDate?: string;
  readonly state?: string;
  readonly actors?: readonly { readonly id?: string }[];
  readonly targetDocumentIds?: readonly { readonly id?: string; readonly title?: string }[];
  readonly taskInfo?: { readonly taskActions?: readonly { readonly name?: string }[] };
}

function summarizeTask(task: NuxeoTask) {
  return {
    id: task.id,
    name: task.name,
    state: task.state,
    dueDate: task.dueDate,
    workflowInstanceId: task.workflowInstanceId,
    targetDocumentIds: (task.targetDocumentIds ?? []).map((target) => target.id).filter(Boolean),
    availableActions: (task.taskInfo?.taskActions ?? []).map((action) => action.name),
  };
}

export const listMyTasksTool: AgentTool = {
  name: 'nuxeo.listMyTasks',
  description: 'List the workflow tasks currently assigned to the signed-in user.',
  mutating: false,
  parameters: {
    type: 'object',
    properties: { pageSize: { type: 'number' } },
    additionalProperties: false,
  },
  async execute(args, { caller, nuxeo, signal }: ToolContext) {
    const result = await nuxeo.json<{ entries?: readonly NuxeoTask[] }>(caller, {
      method: 'GET',
      path: '/nuxeo/api/v1/task',
      // The principal comes from the validated caller, never from tool arguments:
      // otherwise the model could be talked into listing someone else's queue.
      query: {
        userId: caller.principalId,
        pageSize: optionalInteger(args, 'pageSize', 20, 100),
      },
      headers: { 'X-NXfetch.task': 'targetDocumentIds,actors' },
      signal,
    });
    return { entries: (result.entries ?? []).map(summarizeTask) };
  },
};

export const getDocumentTasksTool: AgentTool = {
  name: 'nuxeo.getDocumentTasks',
  description: 'List the workflow tasks attached to a document.',
  mutating: false,
  parameters: {
    type: 'object',
    properties: { uid: { type: 'string' } },
    required: ['uid'],
    additionalProperties: false,
  },
  async execute(args, { caller, nuxeo, signal }: ToolContext) {
    const uid = requiredString(args, 'uid');
    const result = await nuxeo.json<{ entries?: readonly NuxeoTask[] }>(caller, {
      method: 'GET',
      path: `/nuxeo/api/v1/id/${encodeURIComponent(uid)}/@task`,
      headers: { 'X-NXfetch.task': 'targetDocumentIds,actors' },
      signal,
    });
    return { uid, entries: (result.entries ?? []).map(summarizeTask) };
  },
};

export const completeTaskTool: AgentTool = {
  name: 'nuxeo.completeTask',
  description:
    'Complete one workflow task by running one of its available actions, e.g. "approve" or ' +
    '"reject". Use nuxeo.getDocumentTasks or nuxeo.listMyTasks first to read availableActions.',
  mutating: true,
  // A task id is not a document uid, so there is nothing here to resolve to a
  // title. Whether the task is still open and whether the caller is one of its
  // actors are real preconditions, and both would cost a task read on a path the
  // user is waiting on to pre-empt an error Nuxeo returns cleanly; neither is a
  // compliance question, so neither is checked.
  mutation: { action: 'Complete a workflow task with the action', value: 'action' },
  parameters: {
    type: 'object',
    properties: {
      taskId: { type: 'string' },
      action: { type: 'string', description: "One of the task's availableActions." },
      comment: { type: 'string' },
      variables: { type: 'object', additionalProperties: true },
    },
    required: ['taskId', 'action'],
    additionalProperties: false,
  },
  async execute(args, { caller, nuxeo, signal }: ToolContext) {
    const taskId = requiredString(args, 'taskId');
    const action = requiredString(args, 'action');
    const comment = optionalString(args, 'comment');
    const variables = args['variables'] === undefined ? {} : requiredRecord(args, 'variables');

    const task = await nuxeo.json<NuxeoTask>(caller, {
      method: 'PUT',
      path: `/nuxeo/api/v1/task/${encodeURIComponent(taskId)}/${encodeURIComponent(action)}`,
      json: {
        'entity-type': 'task',
        id: taskId,
        variables,
        ...(comment === undefined ? {} : { comment }),
      },
      signal,
    });
    return { taskId, action, task: summarizeTask(task) };
  },
};

export const listWorkflowModelsTool: AgentTool = {
  name: 'nuxeo.listWorkflowModels',
  description: 'List the workflow models available to start, e.g. serial or parallel review.',
  mutating: false,
  parameters: { type: 'object', properties: {}, additionalProperties: false },
  async execute(_args, { caller, nuxeo, signal }: ToolContext) {
    const result = await nuxeo.json<{
      entries?: readonly { name?: string; title?: string }[];
    }>(caller, { method: 'GET', path: '/nuxeo/api/v1/workflowModel', signal });
    return {
      entries: (result.entries ?? []).map((model) => ({ name: model.name, title: model.title })),
    };
  },
};

export const startWorkflowTool: AgentTool = {
  name: 'nuxeo.startWorkflow',
  description: 'Start a workflow on a document.',
  mutating: true,
  // Named but not checked. Starting a route attaches a workflow to the document
  // rather than changing its content, so neither retention nor legal hold blocks
  // it, and the permission a route model demands is the model's own business.
  mutation: { action: 'Start a workflow on', subject: { arg: 'uid' } },
  parameters: {
    type: 'object',
    properties: {
      uid: { type: 'string' },
      workflowModelName: {
        type: 'string',
        description: 'A name from nuxeo.listWorkflowModels, e.g. "SerialDocumentReview".',
      },
    },
    required: ['uid', 'workflowModelName'],
    additionalProperties: false,
  },
  async execute(args, { caller, nuxeo, signal }: ToolContext) {
    const uid = requiredString(args, 'uid');
    const workflowModelName = requiredString(args, 'workflowModelName');
    const workflow = await nuxeo.json<{ id?: string; state?: string }>(caller, {
      method: 'POST',
      path: `/nuxeo/api/v1/id/${encodeURIComponent(uid)}/@workflow`,
      json: {
        'entity-type': 'workflow',
        workflowModelName,
        attachedDocumentIds: [uid],
      },
      signal,
    });
    return { uid, workflowModelName, workflowInstanceId: workflow.id, state: workflow.state };
  },
};

export const getDocumentWorkflowsTool: AgentTool = {
  name: 'nuxeo.getDocumentWorkflows',
  description: 'List the workflow instances currently running on a document.',
  mutating: false,
  parameters: {
    type: 'object',
    properties: { uid: { type: 'string' } },
    required: ['uid'],
    additionalProperties: false,
  },
  async execute(args, { caller, nuxeo, signal }: ToolContext) {
    const uid = requiredString(args, 'uid');
    const result = await nuxeo.json<{
      entries?: readonly { id?: string; workflowModelName?: string; state?: string }[];
    }>(caller, {
      method: 'GET',
      path: `/nuxeo/api/v1/id/${encodeURIComponent(uid)}/@workflow`,
      signal,
    });
    return { uid, entries: result.entries ?? [] };
  },
};

export const workflowTools: readonly AgentTool[] = [
  listMyTasksTool,
  getDocumentTasksTool,
  completeTaskTool,
  listWorkflowModelsTool,
  startWorkflowTool,
  getDocumentWorkflowsTool,
];
