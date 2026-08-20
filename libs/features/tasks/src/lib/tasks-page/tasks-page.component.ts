import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDividerModule } from '@angular/material/divider';

import {
  NuxeoTask,
  NuxeoUser,
  NuxeoGroup,
  NuxeoDocument,
  TaskService,
  UserService,
  WorkflowService,
  DocumentService,
  NuxeoApiBase,
  CURRENT_USERNAME,
} from '@agentic-ui/shared/nuxeo-client';

import { DocumentViewerComponent } from '@agentic-ui/shared/ui';
import { SatBreadcrumbsComponent, SatBreadcrumbsItem } from '@hylandsoftware/satori-ui/breadcrumbs';

@Component({
  selector: 'lib-tasks-page',
  standalone: true,
  imports: [
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatTabsModule,
    MatDividerModule,
    DocumentViewerComponent,
    SatBreadcrumbsComponent,
  ],
  templateUrl: './tasks-page.component.html',
  styleUrl: './tasks-page.component.scss',
})
export class TasksPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  readonly router = inject(Router);
  private readonly taskService = inject(TaskService);
  private readonly userService = inject(UserService);
  private readonly workflowService = inject(WorkflowService);
  private readonly docService = inject(DocumentService);
  private readonly nuxeoApi = inject(NuxeoApiBase);
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly currentUsername = inject(CURRENT_USERNAME);
  private readonly snackBar = inject(MatSnackBar);

  /* ─── Task list ─── */
  readonly tasks = signal<NuxeoTask[]>([]);
  readonly listLoading = signal(true);
  readonly listError = signal<string | null>(null);

  /* ─── Selected task & document ─── */
  readonly selectedTask = signal<NuxeoTask | null>(null);
  readonly targetDoc = signal<NuxeoDocument | null>(null);
  readonly previewBlobUrl = signal<SafeResourceUrl | null>(null);
  private rawPreviewUrl: string | null = null;
  readonly taskLoading = signal(false);
  readonly docLoading = signal(false);
  readonly submitting = signal(false);

  /* ─── Form fields ─── */
  comment = '';
  participants: string[] = [];
  participantInput = '';
  dueDate: Date | null = null;
  validationOrReview = 'simpleReview';

  /* ─── Delegate / Reassign dialogs ─── */
  readonly showDelegatePanel = signal(false);
  readonly showReassignPanel = signal(false);
  delegateInput = '';
  delegateActors: string[] = [];
  reassignInput = '';
  reassignActors: string[] = [];
  delegateComment = '';
  reassignComment = '';

  /* ─── Delegate/Reassign search results ─── */
  readonly delegateUserResults = signal<NuxeoUser[]>([]);
  readonly delegateGroupResults = signal<NuxeoGroup[]>([]);
  readonly reassignUserResults = signal<NuxeoUser[]>([]);
  readonly reassignGroupResults = signal<NuxeoGroup[]>([]);

  /* ─── View Graph ─── */
  readonly showGraphPanel = signal(false);
  readonly graphData = signal<unknown>(null);
  readonly graphLoading = signal(false);

  /* ─── User search ─── */
  readonly userResults = signal<NuxeoUser[]>([]);
  readonly groupResults = signal<NuxeoGroup[]>([]);
  readonly searching = signal(false);
  private breadcrumbPathCache: string | null = null;
  private breadcrumbItemsCache: SatBreadcrumbsItem[] = [];

  /* ─── Computed ─── */
  readonly hasSelection = computed(() => this.selectedTask() !== null);
  readonly breadcrumbItems = computed<SatBreadcrumbsItem[]>(() => {
    const doc = this.targetDoc();
    if (!doc?.path) return [];

    if (doc.path === this.breadcrumbPathCache) {
      return this.breadcrumbItemsCache;
    }

    this.breadcrumbPathCache = doc.path;
    let accumulated = '/browse';
    this.breadcrumbItemsCache = doc.path
      .split('/')
      .filter(Boolean)
      .map((s) => {
        accumulated += `/${s}`;
        return { label: decodeURIComponent(s), href: accumulated };
      });
    return this.breadcrumbItemsCache;
  });

  onBreadcrumbClick(event: MouseEvent): void {
    const anchor = (event.target as HTMLElement).closest('a');
    const href = anchor?.getAttribute('href');
    if (href) {
      event.preventDefault();
      void this.router.navigateByUrl(href);
    }
  }

  /** Actors assigned to the current task (from task actors list). */
  readonly taskActors = computed<string[]>(() => {
    const task = this.selectedTask();
    if (!task) return [];
    return (task.actors ?? []).map((a) => a.id);
  });

  get isChooseParticipants(): boolean {
    const t = this.selectedTask();
    if (!t) return false;
    const name = (t.name || '').toLowerCase();
    const directive = (t.directive || '').toLowerCase();
    const hasStartReview = (t.taskInfo?.taskActions ?? []).some((a) => a.name === 'start_review');
    return (
      hasStartReview ||
      name.includes('chooseparticipants') ||
      name.includes('choose_participants') ||
      name.includes('choose participants') ||
      directive.includes('select') ||
      directive.includes('chooseparticipants')
    );
  }

  get actions(): { name: string; label: string }[] {
    return this.selectedTask()?.taskInfo?.taskActions ?? [];
  }

  /* ════════════════════════════════════════════════════════
     Lifecycle
     ════════════════════════════════════════════════════════ */

  ngOnInit(): void {
    this.loadTasks();
  }

  /* ════════════════════════════════════════════════════════
     Task List
     ════════════════════════════════════════════════════════ */

  loadTasks(): void {
    this.listLoading.set(true);
    this.listError.set(null);
    const userId = this.currentUsername() ?? 'Administrator';

    this.taskService.getUserTasks(userId, 50).subscribe({
      next: (entries) => {
        this.tasks.set(entries);
        this.listLoading.set(false);

        const taskId = this.route.snapshot.paramMap.get('taskId');
        if (taskId) {
          const found = entries.find((t) => t.id === taskId);
          if (found) this.selectTask(found);
          else this.loadAndSelectTask(taskId);
        } else if (entries.length > 0) {
          this.selectTask(entries[0]);
        }
      },
      error: () => {
        this.listError.set('Failed to load tasks.');
        this.listLoading.set(false);
      },
    });
  }

  selectTask(task: NuxeoTask): void {
    this.selectedTask.set(task);
    this.targetDoc.set(null);
    this.clearPreviewBlob();
    this.resetForm();
    this.router.navigate(['/tasks', task.id], { replaceUrl: true });

    const vars = task.variables ?? {};
    if (Array.isArray(vars['participants'])) {
      this.participants = vars['participants'] as string[];
    }
    if (vars['end_date']) {
      this.dueDate = new Date(vars['end_date'] as string);
    } else {
      const d = new Date();
      d.setDate(d.getDate() + 5);
      this.dueDate = d;
    }

    const targetRef = task.targetDocumentIds?.[0];
    const docId = targetRef?.uid || targetRef?.id;

    // If the enricher already provided a full document object, use it directly
    if (targetRef?.uid && targetRef?.title) {
      this.targetDoc.set({
        uid: targetRef.uid,
        title: targetRef.title,
        type: targetRef.type ?? '',
        path: targetRef.path ?? '',
        lastModified: '',
        properties: {},
      });
      // Still fetch full doc to get properties (file:content etc.) for preview
      this.docLoading.set(true);
      this.docService.getById(targetRef.uid).subscribe({
        next: (doc) => {
          this.targetDoc.set(doc);
          this.docLoading.set(false);
          this.loadPreviewBlob(doc);
        },
        error: () => this.docLoading.set(false),
      });
    } else if (docId) {
      this.docLoading.set(true);
      this.docService.getById(docId).subscribe({
        next: (doc) => {
          this.targetDoc.set(doc);
          this.docLoading.set(false);
          this.loadPreviewBlob(doc);
        },
        error: () => this.docLoading.set(false),
      });
    }
  }

  private loadAndSelectTask(taskId: string): void {
    this.taskLoading.set(true);
    this.taskService.getTask(taskId).subscribe({
      next: (task) => {
        this.taskLoading.set(false);
        this.selectTask(task);
      },
      error: () => this.taskLoading.set(false),
    });
  }

  /** Re-fetch the currently selected task to refresh its actors / state. */
  private refreshCurrentTask(): void {
    const current = this.selectedTask();
    if (!current) return;
    this.taskService.getTask(current.id).subscribe({
      next: (updated) => this.selectedTask.set(updated),
      error: () => {
        /* keep current */
      },
    });
  }

  private resetForm(): void {
    this.comment = '';
    this.participants = [];
    this.participantInput = '';
    this.dueDate = null;
    this.validationOrReview = 'simpleReview';
    this.userResults.set([]);
    this.groupResults.set([]);
    this.closeDelegatePanel();
    this.closeReassignPanel();
    this.closeGraphPanel();
  }

  /* ════════════════════════════════════════════════════════
     User / Group Search
     ════════════════════════════════════════════════════════ */

  searchUsers(): void {
    const q = this.participantInput.trim();
    if (q.length < 2) {
      this.userResults.set([]);
      this.groupResults.set([]);
      return;
    }
    this.searching.set(true);
    this.userService.searchUsers(q).subscribe({
      next: (users) => {
        this.userResults.set(users);
        this.searching.set(false);
      },
      error: () => this.searching.set(false),
    });
    this.userService.searchGroups(q).subscribe({
      next: (groups) => this.groupResults.set(groups),
      error: () => {
        /* swallow */
      },
    });
  }

  addParticipant(id: string): void {
    if (!this.participants.includes(id)) {
      this.participants = [...this.participants, id];
    }
    this.participantInput = '';
    this.userResults.set([]);
    this.groupResults.set([]);
  }

  removeParticipant(id: string): void {
    this.participants = this.participants.filter((p) => p !== id);
  }

  formatParticipant(id: string): string {
    return id.replace(/^(user:|group:)/, '');
  }

  /* ════════════════════════════════════════════════════════
     Task Actions
     ════════════════════════════════════════════════════════ */

  executeAction(action: { name: string; label: string }): void {
    const task = this.selectedTask();
    if (!task) return;

    this.submitting.set(true);
    const variables: Record<string, unknown> = {};

    if (this.isChooseParticipants) {
      variables['participants'] =
        this.participants.length > 0
          ? this.participants.map((p) => (p.includes(':') ? p : `user:${p}`))
          : [`user:${this.currentUsername() ?? 'Administrator'}`];
      if (this.dueDate) {
        variables['end_date'] = this.dueDate.toISOString();
      } else {
        // Nuxeo requires an end_date — default to 7 days from now
        const d = new Date();
        d.setDate(d.getDate() + 7);
        variables['end_date'] = d.toISOString();
      }
      if (this.validationOrReview) variables['validationOrReview'] = this.validationOrReview;
    }
    if (this.comment) variables['comment'] = this.comment;

    this.taskService
      .completeTask(task.id, action.name, variables, this.comment || undefined)
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.snackBar.open('Task completed successfully.', 'Close', {
            duration: 4000,
          });
          this.selectedTask.set(null);
          this.targetDoc.set(null);
          // Navigate to /tasks (no task ID) so loadTasks picks the next available task
          this.router.navigate(['/tasks'], { replaceUrl: true }).then(() => {
            this.loadTasks();
          });
          this.taskService.notifyTasksChanged();
        },
        error: (err) => {
          this.submitting.set(false);
          const msg = err?.error?.message || 'Failed to complete the task.';
          this.snackBar.open(msg, 'Close', { duration: 6000 });
        },
      });
  }

  abandonWorkflow(): void {
    const task = this.selectedTask();
    if (!task?.workflowInstanceId) return;

    this.submitting.set(true);
    this.workflowService.cancelWorkflow(task.workflowInstanceId).subscribe({
      next: () => {
        this.submitting.set(false);
        this.snackBar.open('Workflow abandoned.', 'Close', { duration: 4000 });
        this.selectedTask.set(null);
        this.targetDoc.set(null);
        this.router.navigate(['/tasks'], { replaceUrl: true }).then(() => {
          this.loadTasks();
        });
        this.taskService.notifyTasksChanged();
      },
      error: () => {
        this.submitting.set(false);
        this.snackBar.open('Failed to abandon workflow.', 'Close', {
          duration: 4000,
        });
      },
    });
  }

  /* ════════════════════════════════════════════════════════
     Delegate Task
     ════════════════════════════════════════════════════════ */

  openDelegatePanel(): void {
    this.showDelegatePanel.set(true);
    this.showReassignPanel.set(false);
  }

  closeDelegatePanel(): void {
    this.showDelegatePanel.set(false);
    this.delegateInput = '';
    this.delegateActors = [];
    this.delegateComment = '';
    this.delegateUserResults.set([]);
    this.delegateGroupResults.set([]);
  }

  searchDelegateUsers(): void {
    const q = this.delegateInput.trim();
    if (q.length < 2) {
      this.delegateUserResults.set([]);
      this.delegateGroupResults.set([]);
      return;
    }
    this.userService.searchUsers(q).subscribe({
      next: (users) => this.delegateUserResults.set(users),
      error: () => {
        /* swallow */
      },
    });
    this.userService.searchGroups(q).subscribe({
      next: (groups) => this.delegateGroupResults.set(groups),
      error: () => {
        /* swallow */
      },
    });
  }

  addDelegateActor(id: string): void {
    if (!this.delegateActors.includes(id)) {
      this.delegateActors = [...this.delegateActors, id];
    }
    this.delegateInput = '';
    this.delegateUserResults.set([]);
    this.delegateGroupResults.set([]);
  }

  removeDelegateActor(id: string): void {
    this.delegateActors = this.delegateActors.filter((a) => a !== id);
  }

  confirmDelegate(): void {
    const task = this.selectedTask();
    if (!task || this.delegateActors.length === 0) return;

    this.submitting.set(true);
    this.taskService
      .delegateTask(task.id, this.delegateActors, this.delegateComment || undefined)
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.snackBar.open('Task delegated successfully.', 'Close', { duration: 4000 });
          this.closeDelegatePanel();
          this.refreshCurrentTask();
          this.loadTasks();
          this.taskService.notifyTasksChanged();
        },
        error: (err) => {
          this.submitting.set(false);
          const msg = err?.error?.message || 'Failed to delegate task.';
          this.snackBar.open(msg, 'Close', { duration: 6000 });
        },
      });
  }

  /* ════════════════════════════════════════════════════════
     Reassign Task
     ════════════════════════════════════════════════════════ */

  openReassignPanel(): void {
    this.showReassignPanel.set(true);
    this.showDelegatePanel.set(false);
  }

  closeReassignPanel(): void {
    this.showReassignPanel.set(false);
    this.reassignInput = '';
    this.reassignActors = [];
    this.reassignComment = '';
    this.reassignUserResults.set([]);
    this.reassignGroupResults.set([]);
  }

  searchReassignUsers(): void {
    const q = this.reassignInput.trim();
    if (q.length < 2) {
      this.reassignUserResults.set([]);
      this.reassignGroupResults.set([]);
      return;
    }
    this.userService.searchUsers(q).subscribe({
      next: (users) => this.reassignUserResults.set(users),
      error: () => {
        /* swallow */
      },
    });
    this.userService.searchGroups(q).subscribe({
      next: (groups) => this.reassignGroupResults.set(groups),
      error: () => {
        /* swallow */
      },
    });
  }

  addReassignActor(id: string): void {
    if (!this.reassignActors.includes(id)) {
      this.reassignActors = [...this.reassignActors, id];
    }
    this.reassignInput = '';
    this.reassignUserResults.set([]);
    this.reassignGroupResults.set([]);
  }

  removeReassignActor(id: string): void {
    this.reassignActors = this.reassignActors.filter((a) => a !== id);
  }

  confirmReassign(): void {
    const task = this.selectedTask();
    if (!task || this.reassignActors.length === 0) return;

    this.submitting.set(true);
    this.taskService
      .reassignTask(task.id, this.reassignActors, this.reassignComment || undefined)
      .subscribe({
        next: () => {
          this.submitting.set(false);
          this.snackBar.open('Task reassigned successfully.', 'Close', { duration: 4000 });
          this.closeReassignPanel();
          this.refreshCurrentTask();
          this.loadTasks();
          this.taskService.notifyTasksChanged();
        },
        error: (err) => {
          this.submitting.set(false);
          const msg = err?.error?.message || 'Failed to reassign task.';
          this.snackBar.open(msg, 'Close', { duration: 6000 });
        },
      });
  }

  /* ════════════════════════════════════════════════════════
     View Graph
     ════════════════════════════════════════════════════════ */

  openGraphPanel(): void {
    const task = this.selectedTask();
    if (!task?.workflowInstanceId) return;

    this.showGraphPanel.set(true);
    this.graphLoading.set(true);
    this.graphData.set(null);

    this.workflowService.getWorkflowGraph(task.workflowInstanceId).subscribe({
      next: (data) => {
        this.graphData.set(data);
        this.graphLoading.set(false);
      },
      error: () => {
        this.graphData.set({ error: 'Failed to load graph' });
        this.graphLoading.set(false);
      },
    });
  }

  closeGraphPanel(): void {
    this.showGraphPanel.set(false);
    this.graphData.set(null);
  }

  /** Get graph node entries for rendering. */
  graphNodes(): { id: string; title: string; state: string; isCurrent: boolean }[] {
    const data = this.graphData() as Record<string, unknown> | null;
    if (!data || data['error']) return [];
    const nodes = (data['nodes'] ?? data['elements'] ?? []) as Record<string, unknown>[];
    const currentNode = this.selectedTask()?.nodeName;
    return nodes.map((n) => {
      const id = (n['id'] as string) ?? '';
      return {
        id,
        title: (n['title'] as string) ?? id,
        state: (n['state'] as string) ?? '',
        // Both sides must be present: an id-less node must not match an absent nodeName.
        isCurrent: !!currentNode && id === currentNode,
      };
    });
  }

  /* ════════════════════════════════════════════════════════
     Task Comments (from task.comments array)
     ════════════════════════════════════════════════════════ */

  get taskComments(): { author: string; text: string; date: string }[] {
    const task = this.selectedTask();
    if (!task?.comments) return [];
    // Comments can be objects {author, text, date} or plain strings
    return task.comments.map((c: unknown) => {
      if (typeof c === 'string') return { author: '', text: c, date: '' };
      const obj = c as Record<string, string>;
      return {
        author: obj['author'] ?? '',
        text: obj['text'] ?? obj['comment'] ?? '',
        date: obj['date'] ?? obj['creationDate'] ?? '',
      };
    });
  }

  /** Delegated actors on the current task. */
  get delegatedActorsList(): string[] {
    const task = this.selectedTask();
    if (!task?.delegatedActors) return [];
    return task.delegatedActors.map((a) => a.id);
  }

  /* ════════════════════════════════════════════════════════
     URL Helpers
     ════════════════════════════════════════════════════════ */

  private loadPreviewBlob(doc: NuxeoDocument): void {
    this.clearPreviewBlob();
    const fc = doc.properties?.['file:content'] as Record<string, unknown> | null;
    if (!fc) return;

    const mime = (fc['mime-type'] as string) ?? '';
    const isImg = mime.startsWith('image/');
    const url = this.nuxeoApi.apiUrl(
      isImg
        ? `/nuxeo/api/v1/id/${doc.uid}/@blob/file:content`
        : `/nuxeo/api/v1/id/${doc.uid}/@rendition/thumbnail`,
    );

    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        this.rawPreviewUrl = URL.createObjectURL(blob);
        this.previewBlobUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(this.rawPreviewUrl));
      },
      error: () => {
        /* preview not available */
      },
    });
  }

  private clearPreviewBlob(): void {
    if (this.rawPreviewUrl) {
      URL.revokeObjectURL(this.rawPreviewUrl);
      this.rawPreviewUrl = null;
    }
    this.previewBlobUrl.set(null);
  }

  previewUrl(): SafeResourceUrl | null {
    return this.previewBlobUrl();
  }

  downloadUrl(): string | null {
    const doc = this.targetDoc();
    if (!doc) return null;
    return this.nuxeoApi.apiUrl(`/nuxeo/api/v1/id/${doc.uid}/@blob/file:content`);
  }

  download(): void {
    const url = this.downloadUrl();
    if (url) window.open(url, '_blank');
  }

  fileSize(): string {
    const doc = this.targetDoc();
    const content = doc?.properties?.['file:content'] as Record<string, unknown> | undefined;
    if (!content?.['length']) return '';
    const bytes = content['length'] as number;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  mimeType(): string {
    const doc = this.targetDoc();
    const fc = doc?.properties?.['file:content'] as Record<string, unknown> | undefined;
    return (fc?.['mime-type'] as string) ?? '';
  }

  fileName(): string {
    const doc = this.targetDoc();
    const content = doc?.properties?.['file:content'] as Record<string, unknown> | undefined;
    return (content?.['name'] as string) || doc?.title || '';
  }

  /* ════════════════════════════════════════════════════════
     Formatting Helpers
     ════════════════════════════════════════════════════════ */

  taskLabel(task: NuxeoTask): string {
    const key = task.name.replace(/^wf\.\w+\./, '').replace(/\.(title|directive)$/i, '');
    return key
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\./g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  taskDirective(task: NuxeoTask): string {
    if (task.directive) {
      const d = task.directive.replace(/^wf\.\w+\./, '').replace(/\.(title|directive)$/i, '');
      return d
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/\./g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
    }
    return this.taskLabel(task);
  }

  taskWorkflow(task: NuxeoTask): string {
    const raw = task.workflowTitle || task.workflowModelName || '';
    const key = raw.replace(/^wf\.\w+\./, '');
    return key.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  dueDateFormatted(task: NuxeoTask): string {
    if (!task.dueDate) return '';
    return new Date(task.dueDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  actionLabel(action: { name: string; label: string }): string {
    const raw = action.label || action.name;
    const key = raw.replace(/^wf\.\w+\./, '');
    return key
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  actionColor(action: { name: string }): string {
    const n = action.name.toLowerCase();
    if (n.includes('reject') || n.includes('cancel')) return 'warn';
    if (n.includes('approve') || n.includes('validate') || n.includes('start')) return 'primary';
    return '';
  }

  actionIcon(action: { name: string }): string {
    const n = action.name.toLowerCase();
    if (n.includes('approve') || n.includes('validate')) return 'check_circle';
    if (n.includes('reject')) return 'cancel';
    if (n.includes('start')) return 'play_arrow';
    if (n.includes('cancel')) return 'block';
    return 'send';
  }

  isOverdue(task: NuxeoTask): boolean {
    return !!task.dueDate && new Date(task.dueDate) < new Date();
  }

  dueLabel(task: NuxeoTask): string {
    if (!task.dueDate) return '';
    const diff = new Date(task.dueDate).getTime() - Date.now();
    const absDiff = Math.abs(diff);
    const days = Math.floor(absDiff / 86_400_000);
    const hours = Math.floor(absDiff / 3_600_000);
    let label: string;
    if (days >= 1) label = days === 1 ? '1 day' : `${days} days`;
    else label = hours <= 1 ? 'less than an hour' : `${hours} hours`;
    return diff > 0 ? `Due in ${label}` : `${label} overdue`;
  }

  docProp(key: string): unknown {
    return this.targetDoc()?.properties?.[key] ?? null;
  }
}
