import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';

import {
  NuxeoDocument,
  NuxeoAce,
  NuxeoAcl,
  AuditEntry,
  DirectoryEntry,
  DocumentDetailService,
  DirectoryService,
  TaskService,
  NuxeoTask,
  WorkflowService,
  NuxeoWorkflow,
  NuxeoWorkflowModel,
  CURRENT_USERNAME,
} from '@agentic-ui/shared/nuxeo-client';
import { forkJoin } from 'rxjs';

import { ShareDialogComponent, ShareDialogData, DocumentViewerComponent } from '@agentic-ui/shared/ui';
import { AddToCollectionDialogComponent } from '../add-to-collection-dialog/add-to-collection-dialog';

export interface SectionNode {
  doc: NuxeoDocument;
  children: SectionNode[];
  expanded: boolean;
}

const TAG_COLORS: string[] = [
  '#e8a317',
  '#3b82f6',
  '#0d9488',
  '#8b5cf6',
  '#ef4444',
  '#ec4899',
  '#f97316',
];

@Component({
  selector: 'lib-document-detail',
  standalone: true,
  imports: [
    DatePipe,
    NgTemplateOutlet,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTooltipModule,
    MatMenuModule,
    MatSnackBarModule,
    MatDialogModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatSortModule,
    MatTableModule,
    MatPaginatorModule,
    DocumentViewerComponent,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './document-detail.html',
  styleUrl: './document-detail.scss',
})
export class DocumentDetailComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly detailService = inject(DocumentDetailService);
  private readonly directoryService = inject(DirectoryService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly taskService = inject(TaskService);
  private readonly workflowService = inject(WorkflowService);
  private readonly currentUsername = inject(CURRENT_USERNAME);

  readonly doc = signal<NuxeoDocument | null>(null);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly blobUrl = signal<SafeResourceUrl | null>(null);
  readonly propertiesPanelOpen = signal(true);
  private rawBlobUrl: string | null = null;
  private docUid = '';

  // Workflow / Task state
  readonly documentTasks = signal<NuxeoTask[]>([]);
  readonly documentTasksLoading = signal(false);
  readonly documentWorkflows = signal<NuxeoWorkflow[]>([]);
  readonly abandoningWorkflow = signal(false);
  readonly availableWorkflows = signal<NuxeoWorkflowModel[]>([]);
  readonly workflowsLoading = signal(false);
  readonly startingWorkflow = signal(false);
  readonly showStartProcessPanel = signal(false);
  readonly selectedWorkflowModel = signal('');

  // Document action states
  readonly isLocked = signal(false);
  readonly lockOwner = signal<string | null>(null);
  readonly isFavorite = signal(false);
  readonly isSubscribed = signal(false);
  readonly actionInProgress = signal<string | null>(null);
  readonly clipboardDocs = signal<Array<{ uid: string; title: string }>>(
    JSON.parse(localStorage.getItem('nuxeo_clipboard') ?? '[]'),
  );
  readonly isInClipboard = computed(() =>
    this.clipboardDocs().some((d) => d.uid === this.docUid),
  );

  // History tab state
  readonly auditEntries = signal<AuditEntry[]>([]);
  readonly auditLoading = signal(false);
  readonly auditTotalSize = signal(0);
  readonly auditPageSize = signal(20);
  readonly auditPageIndex = signal(0);
  readonly historyDisplayedColumns = [
    'eventId', 'eventDate', 'principalName', 'category', 'comment', 'docLifeCycle',
  ];
  private historyLoaded = false;

  // History filters (signals so computed() reacts)
  readonly filterUsername = signal('');
  readonly filterDateFrom = signal<Date | null>(null);
  readonly filterDateTo = signal<Date | null>(null);
  readonly filterAction = signal('');
  readonly filterCategory = signal('');

  readonly availableActions = signal<DirectoryEntry[]>([]);
  readonly availableCategories = signal<DirectoryEntry[]>([]);
  private eventTypeLabelMap = new Map<string, string>();
  private eventCategoryLabelMap = new Map<string, string>();

  // Sort state
  private sortActive = signal('');
  private sortDirection = signal<'asc' | 'desc' | ''>('');

  // Publishing tab state
  readonly publishedDocs = signal<NuxeoDocument[]>([]);
  readonly publishLoading = signal(false);
  readonly sectionTree = signal<SectionNode[]>([]);
  readonly sectionsLoading = signal(false);
  readonly selectedSectionId = signal<string | null>(null);
  readonly publishing = signal(false);
  private publishTabLoaded = false;

  readonly mimeType = computed(() => {
    const d = this.doc();
    if (!d) return '';
    const fc = d.properties['file:content'] as Record<string, unknown> | null;
    return (fc?.['mime-type'] as string) ?? '';
  });

  readonly isImage = computed(() => this.mimeType().startsWith('image/'));
  readonly isPdf = computed(() => this.mimeType() === 'application/pdf');

  readonly fileName = computed(() => {
    const d = this.doc();
    if (!d) return '';
    const fc = d.properties['file:content'] as Record<string, unknown> | null;
    return (fc?.['name'] as string) ?? d.title;
  });

  readonly fileSize = computed(() => {
    const d = this.doc();
    if (!d) return '';
    const fc = d.properties['file:content'] as Record<string, unknown> | null;
    const len = Number(fc?.['length'] ?? 0);
    if (len === 0) return '';
    if (len < 1024) return `${len} B`;
    if (len < 1024 * 1024) return `${(len / 1024).toFixed(2)} KB`;
    return `${(len / (1024 * 1024)).toFixed(2)} MB`;
  });

  readonly breadcrumbPath = computed(() => {
    const d = this.doc();
    if (!d) return '';
    const parts = d.path.split('/').filter(Boolean);
    parts.pop();
    return parts.join(' > ');
  });

  readonly versionLabel = computed(() => {
    const d = this.doc();
    if (!d) return '';
    const major = d.properties['uid:major_version'] ?? 0;
    const minor = d.properties['uid:minor_version'] ?? 0;
    return `${major}.${minor}+`;
  });

  readonly contributors = computed(() => {
    const d = this.doc();
    if (!d) return [];
    return (d.properties['dc:contributors'] as string[]) ?? [];
  });

  readonly tags = computed(() => {
    const d = this.doc();
    if (!d) return [];
    const raw = d.properties['nxtag:tags'] as Array<{ label: string }> | string[] | null;
    if (!raw) return [];
    return raw.map((t) => (typeof t === 'string' ? t : t.label));
  });

  readonly description = computed(() => {
    const d = this.doc();
    return (d?.properties['dc:description'] as string) ?? '';
  });

  readonly creator = computed(() => {
    const d = this.doc();
    return (d?.properties['dc:creator'] as string) ?? '';
  });

  readonly created = computed(() => {
    const d = this.doc();
    return (d?.properties['dc:created'] as string) ?? '';
  });

  readonly modified = computed(() => {
    const d = this.doc();
    return (d?.properties['dc:modified'] as string) ?? d?.lastModified ?? '';
  });

  readonly expires = computed(() => {
    const d = this.doc();
    return (d?.properties['dc:expired'] as string) ?? '';
  });

  // Permissions tab computed
  readonly localAces = computed<NuxeoAce[]>(() => {
    const d = this.doc();
    const acls = d?.contextParameters?.['acls'] as NuxeoAcl[] | undefined;
    if (!acls) return [];
    const local = acls.find((a) => a.name === 'local');
    return local?.aces.filter((ace) => ace.granted && !ace.externalUser) ?? [];
  });

  readonly inheritedAces = computed<NuxeoAce[]>(() => {
    const d = this.doc();
    const acls = d?.contextParameters?.['acls'] as NuxeoAcl[] | undefined;
    if (!acls) return [];
    const inherited = acls.find((a) => a.name === 'inherited');
    return inherited?.aces.filter((ace) => ace.granted) ?? [];
  });

  readonly externalAces = computed<NuxeoAce[]>(() => {
    const d = this.doc();
    const acls = d?.contextParameters?.['acls'] as NuxeoAcl[] | undefined;
    if (!acls) return [];
    return acls
      .flatMap((a) => a.aces)
      .filter((ace) => ace.externalUser && ace.granted);
  });

  readonly isInheritanceBlocked = computed<boolean>(() => {
    const d = this.doc();
    const acls = d?.contextParameters?.['acls'] as NuxeoAcl[] | undefined;
    if (!acls) return false;
    return !acls.some((a) => a.name === 'inherited');
  });

  permissionLabel(permission: string): string {
    const labels: Record<string, string> = {
      Everything: 'Manage everything',
      ReadWrite: 'Edit',
      Read: 'Read',
      Write: 'Write',
      ReadRemove: 'Read & Remove',
      AddChildren: 'Add Children',
      Remove: 'Remove',
      ManageWorkflows: 'Manage Workflows',
      ReadCanCollect: 'Can collect',
    };
    return labels[permission] ?? permission;
  }

  aceTimeFrame(ace: NuxeoAce): string {
    if (!ace.begin && !ace.end) return 'Permanent';
    const parts: string[] = [];
    if (ace.begin) parts.push(`from ${new Date(ace.begin).toLocaleDateString()}`);
    if (ace.end) parts.push(`to ${new Date(ace.end).toLocaleDateString()}`);
    return parts.join(' ');
  }

  readonly filteredAuditEntries = computed(() => {
    let entries = this.auditEntries();
    const username = this.filterUsername();
    const dateFrom = this.filterDateFrom();
    const dateTo = this.filterDateTo();
    const action = this.filterAction();
    const category = this.filterCategory();
    const active = this.sortActive();
    const direction = this.sortDirection();

    if (username) {
      const lower = username.toLowerCase();
      entries = entries.filter((e) =>
        e.principalName.toLowerCase().includes(lower),
      );
    }
    if (dateFrom) {
      const from = dateFrom.getTime();
      entries = entries.filter((e) => new Date(e.eventDate).getTime() >= from);
    }
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      entries = entries.filter((e) => new Date(e.eventDate).getTime() <= to.getTime());
    }
    if (action) {
      entries = entries.filter((e) => e.eventId === action);
    }
    if (category) {
      entries = entries.filter((e) => e.category === category);
    }

    if (active && direction) {
      const dir = direction === 'asc' ? 1 : -1;
      const key = active as keyof AuditEntry;
      entries = [...entries].sort((a, b) => {
        const va = a[key] ?? '';
        const vb = b[key] ?? '';
        return va < vb ? -dir : va > vb ? dir : 0;
      });
    }

    return entries;
  });

  ngOnInit(): void {
    const uid = this.route.snapshot.paramMap.get('uid');
    if (!uid) {
      this.error.set('No document ID provided.');
      this.loading.set(false);
      return;
    }
    this.docUid = uid;
    this.loadDocument(uid);
  }

  ngOnDestroy(): void {
    if (this.rawBlobUrl) {
      URL.revokeObjectURL(this.rawBlobUrl);
    }
  }

  private loadDocument(uid: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.detailService.getFullDocument(uid).subscribe({
      next: (doc) => {
        this.doc.set(doc);
        this.syncActionStates(doc);
        this.loading.set(false);
        this.loadBlob(doc);
        this.loadDocumentTasks(uid);
        this.loadDocumentWorkflows(uid);
      },
      error: () => {
        this.error.set('Failed to load document.');
        this.loading.set(false);
      },
    });
  }

  /* ─── Workflow / Task methods ─── */

  private loadDocumentTasks(uid: string): void {
    this.documentTasksLoading.set(true);
    const userId = this.currentUsername() ?? 'Administrator';
    this.taskService.getDocumentTasks(uid, userId).subscribe({
      next: (tasks) => {
        this.documentTasks.set(tasks);
        this.documentTasksLoading.set(false);
      },
      error: () => this.documentTasksLoading.set(false),
    });
  }

  private loadDocumentWorkflows(uid: string): void {
    this.workflowService.getDocumentWorkflows(uid).subscribe({
      next: (wfs) => this.documentWorkflows.set(wfs),
      error: () => this.documentWorkflows.set([]),
    });
  }

  abandonWorkflow(wf: NuxeoWorkflow): void {
    this.abandoningWorkflow.set(true);
    this.workflowService.cancelWorkflow(wf.id).subscribe({
      next: () => {
        this.abandoningWorkflow.set(false);
        this.toast('Workflow abandoned');
        this.loadDocumentWorkflows(this.docUid);
        this.loadDocumentTasks(this.docUid);
      },
      error: () => {
        this.abandoningWorkflow.set(false);
        this.toast('Failed to abandon workflow');
      },
    });
  }

  taskDueLabel(task: NuxeoTask): string {
    if (!task.dueDate) return '';
    const d = new Date(task.dueDate);
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  openStartProcess(): void {
    this.showStartProcessPanel.set(true);
    this.workflowsLoading.set(true);
    this.workflowService.getWorkflowModels().subscribe({
      next: (models) => {
        this.availableWorkflows.set(models);
        this.workflowsLoading.set(false);
      },
      error: () => {
        this.availableWorkflows.set([]);
        this.workflowsLoading.set(false);
      },
    });
  }

  closeStartProcess(): void {
    this.showStartProcessPanel.set(false);
    this.selectedWorkflowModel.set('');
  }

  startProcess(): void {
    const model = this.selectedWorkflowModel();
    if (!model) return;

    this.startingWorkflow.set(true);
    this.detailService.startWorkflow(this.docUid, model).subscribe({
      next: () => {
        this.startingWorkflow.set(false);
        this.closeStartProcess();
        this.toast('Workflow started successfully');
        this.loadDocumentTasks(this.docUid);
        this.loadDocumentWorkflows(this.docUid);
      },
      error: () => {
        this.startingWorkflow.set(false);
        this.toast('Failed to start workflow');
      },
    });
  }

  goToTask(task: NuxeoTask): void {
    void this.router.navigateByUrl('/tasks/' + task.id);
  }

  taskLabel(task: NuxeoTask): string {
    const key = task.name
      .replace(/^wf\.\w+\./, '')
      .replace(/\.(title|directive)$/i, '');
    return key
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\./g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  /** Turn "ParallelDocumentReview" or "wf.x.Y" into "Parallel Document Review" */
  workflowDisplayName(wf: { name: string; title: string; workflowModelName?: string }): string {
    // Use workflowModelName or name — the title is an i18n key (wf.x.Y)
    const raw = (wf.workflowModelName ?? wf.name) || wf.title;
    // If it looks like an i18n key, strip the prefix
    const cleaned = raw.startsWith('wf.') ? raw.replace(/^wf\.\w+\./, '') : raw;
    return cleaned
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  private syncActionStates(doc: NuxeoDocument): void {
    this.isLocked.set(!!doc.lockOwner);
    this.lockOwner.set(doc.lockOwner ?? null);
    this.isFavorite.set(doc.contextParameters?.favorites?.isFavorite ?? false);
    const subs = doc.contextParameters?.subscribedNotifications;
    this.isSubscribed.set(Array.isArray(subs) && subs.length > 0);
  }

  private loadBlob(doc: NuxeoDocument): void {
    const fc = doc.properties['file:content'] as Record<string, unknown> | null;
    if (!fc) return;

    const mime = (fc['mime-type'] as string) ?? '';
    const isImg = mime.startsWith('image/');
    const isPdfType = mime === 'application/pdf';

    if (isImg || isPdfType) {
      this.detailService.fetchBlob(doc.uid).subscribe({
        next: (blob) => this.setBlobUrl(blob),
        error: () => { /* viewer will show fallback */ },
      });
    } else {
      this.detailService.fetchPdfRendition(doc.uid).subscribe({
        next: (blob) => this.setBlobUrl(blob),
        error: () => { /* no preview available */ },
      });
    }
  }

  private setBlobUrl(blob: Blob): void {
    if (this.rawBlobUrl) URL.revokeObjectURL(this.rawBlobUrl);
    this.rawBlobUrl = URL.createObjectURL(blob);
    this.blobUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(this.rawBlobUrl));
  }

  onTabChange(index: number): void {
    if (index === 2 && !this.historyLoaded) {
      this.loadDirectoryEntries();
      this.loadAuditLog();
    }
    if (index === 3 && !this.publishTabLoaded) {
      this.loadPublishingData();
    }
  }

  private loadDirectoryEntries(): void {
    forkJoin({
      types: this.directoryService.getEventTypes(),
      categories: this.directoryService.getEventCategories(),
    }).subscribe({
      next: ({ types, categories }) => {
        this.availableActions.set(types);
        this.availableCategories.set(categories);
        this.eventTypeLabelMap = new Map(types.map((t) => [t.id, t.displayLabel]));
        this.eventCategoryLabelMap = new Map(categories.map((c) => [c.id, c.displayLabel]));
      },
    });
  }

  loadAuditLog(): void {
    if (!this.docUid) return;
    this.auditLoading.set(true);

    this.detailService
      .getAuditLog(this.docUid, this.auditPageSize(), this.auditPageIndex())
      .subscribe({
        next: (res) => {
          this.auditEntries.set(res.entries);
          this.auditTotalSize.set(res.totalSize);
          this.auditLoading.set(false);
          this.historyLoaded = true;
        },
        error: () => {
          this.auditLoading.set(false);
        },
      });
  }

  onAuditPageChange(event: PageEvent): void {
    this.auditPageSize.set(event.pageSize);
    this.auditPageIndex.set(event.pageIndex);
    this.loadAuditLog();
  }

  onAuditSort(sort: Sort): void {
    this.sortActive.set(sort.active);
    this.sortDirection.set(sort.direction);
  }

  eventLabel(eventId: string): string {
    return this.eventTypeLabelMap.get(eventId)
      ?? eventId.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
  }

  categoryLabel(category: string): string {
    return this.eventCategoryLabelMap.get(category)
      ?? category
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (c) => c.toUpperCase())
        .replace('event ', '')
        .replace(' Category', '');
  }

  userInitial(name: string): string {
    return name.charAt(0).toUpperCase();
  }

  tagColor(index: number): string {
    return TAG_COLORS[index % TAG_COLORS.length];
  }

  private loadPublishingData(): void {
    this.publishTabLoaded = true;
    this.publishLoading.set(true);
    this.sectionsLoading.set(true);

    this.detailService.getPublishedVersions(this.docUid).subscribe({
      next: (res) => {
        this.publishedDocs.set(res.entries);
        this.publishLoading.set(false);
      },
      error: () => this.publishLoading.set(false),
    });

    this.detailService.getSectionTree().subscribe({
      next: (res) => {
        this.sectionTree.set(this.buildSectionTree(res.entries));
        this.sectionsLoading.set(false);
      },
      error: () => this.sectionsLoading.set(false),
    });
  }

  private buildSectionTree(docs: NuxeoDocument[]): SectionNode[] {
    const nodeMap = new Map<string, SectionNode>();
    const roots: SectionNode[] = [];

    for (const doc of docs) {
      nodeMap.set(doc.path, { doc, children: [], expanded: true });
    }

    for (const doc of docs) {
      const node = nodeMap.get(doc.path)!;
      const parentPath = doc.path.split('/').slice(0, -1).join('/');
      const parent = nodeMap.get(parentPath);
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }
    return roots;
  }

  selectSection(id: string): void {
    this.selectedSectionId.set(
      this.selectedSectionId() === id ? null : id,
    );
  }

  toggleSectionNode(node: SectionNode): void {
    node.expanded = !node.expanded;
    this.sectionTree.update((t) => [...t]);
  }

  publishToSection(): void {
    const target = this.selectedSectionId();
    if (!target || !this.docUid) return;
    this.publishing.set(true);

    this.detailService.publishDocument(this.docUid, target).subscribe({
      next: () => {
        this.publishing.set(false);
        this.selectedSectionId.set(null);
        this.detailService.getPublishedVersions(this.docUid).subscribe({
          next: (res) => this.publishedDocs.set(res.entries),
        });
      },
      error: () => this.publishing.set(false),
    });
  }

  sectionIcon(node: SectionNode): string {
    return node.doc.type === 'SectionRoot' ? 'library_books' : 'folder';
  }

  publishedPath(doc: NuxeoDocument): string {
    return doc.path.split('/').slice(2).join(' > ');
  }

  publishedVersion(doc: NuxeoDocument): string {
    const major = doc.properties?.['uid:major_version'] ?? 0;
    const minor = doc.properties?.['uid:minor_version'] ?? 0;
    return `${major}.${minor}`;
  }

  // ── Document Actions ──

  toggleLock(): void {
    if (this.actionInProgress()) return;
    this.actionInProgress.set('lock');
    const op = this.isLocked()
      ? this.detailService.unlockDocument(this.docUid)
      : this.detailService.lockDocument(this.docUid);

    op.subscribe({
      next: () => {
        const wasLocked = this.isLocked();
        this.isLocked.set(!wasLocked);
        this.lockOwner.set(wasLocked ? null : 'Administrator');
        this.actionInProgress.set(null);
        this.toast(wasLocked ? 'Document unlocked' : 'Document locked');
      },
      error: () => {
        this.actionInProgress.set(null);
        this.toast('Failed to toggle lock');
      },
    });
  }

  toggleFavorite(): void {
    if (this.actionInProgress()) return;
    this.actionInProgress.set('favorite');
    const op = this.isFavorite()
      ? this.detailService.removeFromFavorites(this.docUid)
      : this.detailService.addToFavorites(this.docUid);

    op.subscribe({
      next: () => {
        const wasFav = this.isFavorite();
        this.isFavorite.set(!wasFav);
        this.actionInProgress.set(null);
        this.toast(wasFav ? 'Removed from favorites' : 'Added to favorites');
      },
      error: () => {
        this.actionInProgress.set(null);
        this.toast('Failed to update favorites');
      },
    });
  }

  toggleSubscription(): void {
    if (this.actionInProgress()) return;
    this.actionInProgress.set('subscribe');
    const op = this.isSubscribed()
      ? this.detailService.unsubscribe(this.docUid)
      : this.detailService.subscribe(this.docUid);

    op.subscribe({
      next: () => {
        const wasSub = this.isSubscribed();
        this.isSubscribed.set(!wasSub);
        this.actionInProgress.set(null);
        this.toast(wasSub ? 'Notifications disabled' : 'Notifications enabled');
      },
      error: () => {
        this.actionInProgress.set(null);
        this.toast('Failed to update notifications');
      },
    });
  }

  trashDocument(): void {
    if (this.actionInProgress()) return;
    if (!confirm('Are you sure you want to delete this document?')) return;
    this.actionInProgress.set('trash');

    this.detailService.trashDocument(this.docUid).subscribe({
      next: () => {
        this.actionInProgress.set(null);
        this.toast('Document moved to trash');
        this.goBack();
      },
      error: () => {
        this.actionInProgress.set(null);
        this.toast('Failed to delete document');
      },
    });
  }

  toggleClipboard(): void {
    const current = this.clipboardDocs();
    const d = this.doc();
    if (!d) return;

    if (this.isInClipboard()) {
      const updated = current.filter((c) => c.uid !== this.docUid);
      this.clipboardDocs.set(updated);
      localStorage.setItem('nuxeo_clipboard', JSON.stringify(updated));
      this.toast('Removed from clipboard');
    } else {
      const updated = [...current, { uid: d.uid, title: d.title }];
      this.clipboardDocs.set(updated);
      localStorage.setItem('nuxeo_clipboard', JSON.stringify(updated));
      this.toast('Added to clipboard');
    }
  }

  exportDocument(): void {
    if (this.actionInProgress()) return;
    this.actionInProgress.set('export');

    this.detailService.exportBlob(this.docUid).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = this.fileName();
        a.click();
        URL.revokeObjectURL(url);
        this.actionInProgress.set(null);
        this.toast('Download started');
      },
      error: () => {
        this.actionInProgress.set(null);
        this.toast('Failed to export document');
      },
    });
  }

  openAddToCollectionDialog(): void {
    const ref = this.dialog.open(AddToCollectionDialogComponent, {
      width: '440px',
      autoFocus: false,
    });

    ref.afterClosed().subscribe((collectionId: string | undefined) => {
      if (!collectionId) return;
      this.actionInProgress.set('collection');
      this.detailService.addToCollection(this.docUid, collectionId).subscribe({
        next: () => {
          this.actionInProgress.set(null);
          this.toast('Added to collection');
        },
        error: () => {
          this.actionInProgress.set(null);
          this.toast('Failed to add to collection');
        },
      });
    });
  }

  shareDocument(): void {
    this.dialog.open(ShareDialogComponent, {
      data: {
        title: this.doc()?.title ?? 'Document',
        url: window.location.href,
      } satisfies ShareDialogData,
      width: '520px',
    });
  }

  private toast(message: string): void {
    this.snackBar.open(message, 'OK', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom',
    });
  }

  goBack(): void {
    const d = this.doc();
    if (d) {
      const parentPath = d.path.split('/').slice(0, -1).join('/') || '/';
      void this.router.navigateByUrl(`/browse${parentPath}`);
    } else {
      void this.router.navigateByUrl('/browse');
    }
  }

  download(): void {
    if (!this.rawBlobUrl) return;
    const a = document.createElement('a');
    a.href = this.rawBlobUrl;
    a.download = this.fileName();
    a.click();
  }

  closePropertiesPanel(): void {
    this.propertiesPanelOpen.set(false);
  }

  openPropertiesPanel(): void {
    this.propertiesPanelOpen.set(true);
  }
}
