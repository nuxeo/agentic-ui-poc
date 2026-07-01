import {
  Component,
  DestroyRef,
  OnInit,
  OnDestroy,
  inject,
  signal,
  computed,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { DomSanitizer, SafeResourceUrl, SafeHtml } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule, MatTabGroup } from '@angular/material/tabs';
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
  BrowseService,
  DirectoryEntry,
  DocumentDetailService,
  DirectoryService,
  NuxeoComment,
  NuxeoApiBase,
  TaskService,
  NuxeoTask,
  WorkflowService,
  NuxeoWorkflow,
  NuxeoWorkflowModel,
  CURRENT_USERNAME,
  avatarColor,
  ARenderService,
  TagService,
  ContentLakeIngestService,
  buildContentLakeIngestMarker,
  isContentLakeIngestCurrent,
  needsContentLakeIngest,
  readBlobDigest,
  resolveIngestMarkerWriteProperty,
  shouldProbeContentLakeIngestStatus,
  supportsContentLakeIngest,
  canManageDocumentPermissions,
  canWriteDocument,
  canRemoveDocument,
  PERMISSION_DENIED_MESSAGE,
  isBlobHoldingDocType,
  isFolderishDocument,
  noteFormatLabel,
  renderNoteMarkdown,
} from '@agentic-ui/shared/nuxeo-client';
import { SatAvatarModule } from '@hylandsoftware/satori-ui/avatar';
import { SatBreadcrumbsComponent, SatBreadcrumbsItem } from '@hylandsoftware/satori-ui/breadcrumbs';
import { SatTagModule, SatTagCategory } from '@hylandsoftware/satori-ui/tag';
import {
  AiGatewayService,
  AiChatService,
  AiFeatureFlagService,
  type SummarizeResponse,
  type SuggestedTag,
  type ClassifyResponse,
  type SimilarDoc,
  type SentimentItem,
  type SentimentResponse,
} from '@agentic-ui/shared/ai-client';
import {
  KeClientService,
  type KeEnrichRequest,
  type KeEnrichmentResult,
} from '@agentic-ui/shared/ke-client';
import { KdClientService } from '@agentic-ui/shared/kd-client';
import DOMPurify from 'dompurify';
import { finalize, forkJoin, map, Observable, of, switchMap, timer } from 'rxjs';
import {
  ShareDialogComponent,
  ShareDialogData,
  DocumentViewerComponent,
  ExportDialogComponent,
  ExportDialogData,
  ExportType,
  ConfirmDialogComponent,
  ConfirmDialogData,
  type VideoSource,
  type StoryboardItem,
  type PictureInfo,
  type PictureView,
  type ExifData,
  type IptcData,
} from '@agentic-ui/shared/ui';
import { AddToCollectionDialogComponent } from '../add-to-collection-dialog/add-to-collection-dialog';
import {
  CreateVersionDialogComponent,
  CreateVersionDialogData,
} from '../create-version-dialog/create-version-dialog';
import { PublishDialogComponent, PublishDialogData } from '../publish-dialog/publish-dialog';
import { DriveDialogComponent, type DriveDialogData } from '../drive-dialog/drive-dialog';
import { AttachmentPreviewDialogComponent } from '../attachment-preview-dialog/attachment-preview-dialog';
import { ReplaceAttachmentDialogComponent } from '../replace-attachment-dialog/replace-attachment-dialog';
import { RemoveAttachmentDialogComponent } from '../remove-attachment-dialog/remove-attachment-dialog';
import { EditDocumentDialogComponent } from '../edit-document-dialog/edit-document-dialog';
import { NoteEditorComponent } from '../note-editor/note-editor';
import {
  AddPermissionDialogComponent,
  AddPermissionDialogData,
  DeletePermissionDialogComponent,
  DeletePermissionDialogData,
  ShareExternalDialogComponent,
  ShareExternalDialogData,
  UpdatePermissionDialogComponent,
  UpdatePermissionDialogData,
} from '@agentic-ui/feature-collections';

export interface SectionNode {
  doc: NuxeoDocument;
  children: SectionNode[];
  expanded: boolean;
}

const TAG_CATEGORIES: SatTagCategory[] = [
  'yellow',
  'blue',
  'teal',
  'purple',
  'red',
  'pink',
  'orange',
];

/**
 * Sentinel value the Hyland Knowledge Enrichment `text-classification` action returns
 * when the model cannot match the document to any of the supplied candidate classes.
 * We must never write this to `dc:nature` — it is not a valid vocabulary id and Nuxeo
 * will reject the PUT with HTTP 422 ("Cannot find vocabulary value").
 *
 * See AGENTS/08-bug-patterns.md ("AI free-form output written to a vocabulary field").
 */
const KE_NO_MATCH_SENTINEL = 'not_from_provided_classes';

type KeUiAction =
  | 'text-classification'
  | 'named-entity-recognition-text'
  | 'text-summarization'
  | 'image-enrichment';

type ClipboardDoc = { uid: string; title: string };

function readClipboardDocs(): ClipboardDoc[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem('nuxeo_clipboard') ?? '[]');
    return Array.isArray(parsed)
      ? parsed.filter(
          (item): item is ClipboardDoc =>
            typeof item === 'object' &&
            item !== null &&
            typeof (item as ClipboardDoc).uid === 'string' &&
            typeof (item as ClipboardDoc).title === 'string',
        )
      : [];
  } catch {
    return [];
  }
}

function writeClipboardDocs(docs: ClipboardDoc[]): void {
  try {
    localStorage.setItem('nuxeo_clipboard', JSON.stringify(docs));
  } catch {
    // Storage can be unavailable in restricted browser contexts and test runners.
  }
}

const MIME_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  bmp: 'image/bmp',
  tiff: 'image/tiff',
  tif: 'image/tiff',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  pdf: 'application/pdf',
  txt: 'text/plain',
  html: 'text/html',
  htm: 'text/html',
  xml: 'text/xml',
  json: 'application/json',
  md: 'text/markdown',
};

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
    NoteEditorComponent,
    SatAvatarModule,
    SatBreadcrumbsComponent,
    SatTagModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './document-detail.html',
  styleUrl: './document-detail.scss',
})
export class DocumentDetailComponent implements OnInit, OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly browseService = inject(BrowseService);
  private readonly detailService = inject(DocumentDetailService);
  private readonly directoryService = inject(DirectoryService);
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly nuxeoApi = inject(NuxeoApiBase);
  private readonly taskService = inject(TaskService);
  private readonly workflowService = inject(WorkflowService);
  private readonly currentUsername = inject(CURRENT_USERNAME);
  private readonly arenderService = inject(ARenderService);
  private readonly tagService = inject(TagService);
  private readonly aiGateway = inject(AiGatewayService);
  private readonly keClient = inject(KeClientService);
  private readonly contentLakeIngestService = inject(ContentLakeIngestService);
  private readonly kdClient = inject(KdClientService);
  private readonly aiChatService = inject(AiChatService);
  readonly featureFlags = inject(AiFeatureFlagService);

  /** Programmatic tab switches (e.g. Publishing link). */
  private readonly detailTabGroup = viewChild<MatTabGroup>('detailTabGroup');

  readonly doc = signal<NuxeoDocument | null>(null);
  readonly loading = signal(true);
  readonly blobLoading = signal(false);
  readonly viewerLoading = computed(
    () => this.loading() || (this.blobLoading() && !this.blobUrl()),
  );
  readonly error = signal<string | null>(null);
  readonly blobUrl = signal<SafeResourceUrl | null>(null);
  readonly noteContent = signal<string | null>(null);
  readonly noteHtml = signal<SafeHtml | null>(null);
  readonly noteSaving = signal(false);
  readonly focusNoteEditor = signal(false);
  readonly videoSources = signal<VideoSource[]>([]);
  readonly storyboard = signal<StoryboardItem[]>([]);
  readonly posterUrl = signal<SafeResourceUrl | null>(null);
  readonly hasPdfRendition = signal(false);
  readonly previewUrl = signal<SafeResourceUrl | null>(null);
  readonly pictureInfo = signal<PictureInfo | null>(null);
  readonly pictureViews = signal<PictureView[]>([]);
  readonly exifData = signal<ExifData | null>(null);
  readonly iptcData = signal<IptcData | null>(null);
  readonly arenderUrl = signal<SafeResourceUrl | null>(null);
  /** Bumped when the ARender previewer URL changes so the iframe is recreated (avoids stale session / wrong doc). */
  readonly arenderReloadId = signal(0);
  readonly propertiesPanelOpen = signal(true);
  readonly panelSubTab = signal<'properties' | 'comments' | 'activity'>('properties');
  private rawBlobUrl: string | null = null;
  private videoObjectUrls: string[] = [];
  private docUid = '';
  private metadataRefreshAttempt = 0;
  private blobLoadGeneration = 0;
  /** Set when navigating here immediately after create/import with a main blob. */
  private freshBlobDocument = false;
  /** Set when navigating here immediately after creating a Note. */
  private freshNoteDocument = false;
  private breadcrumbPathCache: string | null = null;
  private breadcrumbItemsCache: SatBreadcrumbsItem[] = [];

  // AI Insights state
  readonly aiSummary = signal<SummarizeResponse | null>(null);
  readonly aiSummaryLoading = signal(false);
  readonly aiSuggestedTags = signal<SuggestedTag[]>([]);
  readonly aiTagsLoading = signal(false);
  readonly aiClassification = signal<ClassifyResponse | null>(null);
  readonly aiClassifyLoading = signal(false);
  readonly aiSimilarDocs = signal<SimilarDoc[]>([]);
  readonly aiSimilarLoading = signal(false);
  readonly aiError = signal<string | null>(null);

  readonly aiSentimentMap = signal<Record<string, SentimentItem>>({});
  readonly aiThreadSummary = signal<string | null>(null);
  readonly aiSentimentLoading = signal(false);
  readonly keActionInFlight = signal<KeUiAction | null>(null);
  readonly keStatus = signal<string | null>(null);
  readonly keError = signal<string | null>(null);
  readonly contentLakeIngestInFlight = signal(false);
  readonly contentLakeIngestStatus = signal<string | null>(null);
  readonly contentLakeIngestError = signal<string | null>(null);
  /** Set after a successful ingest or CheckDigest probe when the marker cannot be persisted. */
  readonly contentLakePresenceVerified = signal(false);
  readonly contentLakePresenceChecking = signal(false);
  readonly contentLakeIngestedTooltip = 'Indexed in Content Lake';

  // Loaded from the Nuxeo `nature` directory and supplied as candidate classes to the
  // KE text-classification model. Sourcing live ids guarantees the value we write back
  // to `dc:nature` is in the vocabulary (Nuxeo enforces this and returns 422 otherwise).
  readonly natureVocabulary = signal<DirectoryEntry[]>([]);
  private natureVocabularyLoaded = false;

  // Comments state
  readonly comments = signal<NuxeoComment[]>([]);
  readonly commentsLoading = signal(false);
  readonly newCommentText = signal('');
  readonly editingCommentId = signal<string | null>(null);
  readonly editingCommentText = signal('');
  readonly commentSaving = signal(false);
  readonly repliesMap = signal<Record<string, NuxeoComment[]>>({});
  readonly replyingToId = signal<string | null>(null);
  readonly replyText = signal('');
  private commentsLoaded = false;

  // Panel activity state (recent activity for the side panel)
  readonly panelActivity = signal<AuditEntry[]>([]);
  readonly panelActivityLoading = signal(false);
  private panelActivityLoaded = false;

  // Version state
  readonly versions = signal<NuxeoDocument[]>([]);
  readonly versionsLoading = signal(false);
  readonly versionDropdownOpen = signal(false);
  private versionsLoaded = false;

  readonly currentMajor = computed(() => {
    const d = this.doc();
    return Number(d?.properties['uid:major_version'] ?? 0);
  });

  readonly currentMinor = computed(() => {
    const d = this.doc();
    return Number(d?.properties['uid:minor_version'] ?? 0);
  });

  readonly hasVersion = computed(() => {
    return this.currentMajor() > 0 || this.currentMinor() > 0;
  });

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
  readonly clipboardDocs = signal<ClipboardDoc[]>(readClipboardDocs());
  readonly isInClipboard = computed(() => this.clipboardDocs().some((d) => d.uid === this.docUid));

  // History tab state
  readonly auditEntries = signal<AuditEntry[]>([]);
  readonly auditLoading = signal(false);
  readonly auditTotalSize = signal(0);
  readonly auditPageSize = signal(20);
  readonly auditPageIndex = signal(0);
  readonly historyDisplayedColumns = [
    'eventId',
    'eventDate',
    'principalName',
    'category',
    'comment',
    'docLifeCycle',
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
    const noteMime = d.properties['note:mime_type'] as string | undefined;
    if (noteMime) return noteMime;
    const fc = d.properties['file:content'] as Record<string, unknown> | null;
    return this.resolveMainContentMime(fc, d);
  });

  readonly isNoteDocument = computed(() => this.doc()?.type === 'Note');
  readonly noteFormatDisplay = computed(() => noteFormatLabel(this.mimeType()));
  readonly noteEditorBody = computed(() => this.noteContent() ?? '');

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

  readonly breadcrumbItems = computed<SatBreadcrumbsItem[]>(() => {
    const d = this.doc();
    if (!d) return [];

    const path = d.path ?? '';
    if (path === this.breadcrumbPathCache) {
      return this.breadcrumbItemsCache;
    }

    const parts = path.split('/').filter(Boolean);
    parts.pop();
    this.breadcrumbPathCache = path;
    let accumulated = '/browse';
    this.breadcrumbItemsCache = parts.map((s) => {
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

  readonly versionLabel = computed(() => {
    const d = this.doc();
    if (!d) return '';
    const label = `${this.currentMajor()}.${this.currentMinor()}`;
    return d.isCheckedOut ? `${label}+` : label;
  });

  readonly docState = computed(() => {
    const d = this.doc();
    if (!d) return '';
    return (
      (d.properties['ecm:currentLifeCycleState'] as string) ??
      (d.properties['dc:nature'] as string) ??
      d.type ??
      ''
    );
  });

  readonly publicationCount = computed(() => this.publishedDocs().length);

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

  readonly documentCategory = computed(() => {
    const d = this.doc();
    return (d?.properties['dc:nature'] as string) ?? '';
  });

  readonly fileMimeType = computed(() => {
    const d = this.doc();
    if (!d) return '';
    const fileContent = d.properties['file:content'] as Record<string, unknown> | null;
    const directMime = (fileContent?.['mime-type'] as string) ?? '';
    if (directMime) return directMime;

    const pictureViews = d.properties['picture:views'] as
      | Array<Record<string, unknown>>
      | undefined;
    const pictureContent = pictureViews?.[0]?.['content'] as Record<string, unknown> | undefined;
    return (pictureContent?.['mime-type'] as string) ?? '';
  });

  readonly supportsTextKnowledgeEnrichment = computed(
    () => this.fileMimeType() === 'application/pdf',
  );
  readonly supportsImageKnowledgeEnrichment = computed(() => {
    const mime = this.fileMimeType();
    return mime.startsWith('image/') || this.doc()?.type === 'Picture';
  });
  readonly canIngestToContentLake = computed(() => needsContentLakeIngest(this.doc()));
  readonly showsContentLakeIngested = computed(
    () => isContentLakeIngestCurrent(this.doc()) || this.contentLakePresenceVerified(),
  );
  readonly showsContentLakeIngestAction = computed(() => supportsContentLakeIngest(this.doc()));

  readonly attachments = computed(() => {
    const d = this.doc();
    if (!d) return [];
    const files = d.properties['files:files'] as Array<{ file: Record<string, unknown> }> | null;
    if (!files) return [];
    return files
      .filter((f) => f.file)
      .map((f, i) => ({
        index: i,
        name: (f.file['name'] as string) ?? 'Untitled',
        size: Number(f.file['length'] ?? 0),
        mimeType: (f.file['mime-type'] as string) ?? '',
        url: (f.file['data'] as string) ?? '',
      }));
  });

  readonly collections = computed(() => {
    const d = this.doc();
    if (!d) return [];
    const cols = d.contextParameters?.['collections'] as
      | Array<{ uid: string; title: string; path: string }>
      | undefined;
    return cols ?? [];
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
    return acls.flatMap((a) => a.aces).filter((ace) => ace.externalUser && ace.granted);
  });

  readonly isInheritanceBlocked = computed<boolean>(() => {
    const d = this.doc();
    const acls = d?.contextParameters?.['acls'] as NuxeoAcl[] | undefined;
    if (!acls) return false;
    return !acls.some((a) => a.name === 'inherited');
  });

  readonly canManagePermissions = computed(() => canManageDocumentPermissions(this.doc()));
  readonly canWriteDoc = computed(() => canWriteDocument(this.doc()));
  readonly canRemoveDoc = computed(() => canRemoveDocument(this.doc()));

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

  displayUsername(ace: NuxeoAce): string {
    return ace.username.replace(/^transient\//, '');
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
      entries = entries.filter((e) => e.principalName.toLowerCase().includes(lower));
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
    this.loadNatureVocabulary();
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const uid = params.get('uid');
      if (!uid) {
        this.error.set('No document ID provided.');
        this.loading.set(false);
        return;
      }
      this.freshBlobDocument =
        this.route.snapshot.queryParamMap.get('fresh') === '1' ||
        this.readFreshBlobNavigationState();
      this.freshNoteDocument = this.readFreshNoteNavigationState();
      this.resetState();
      this.docUid = uid;
      this.loadDocument(uid);
    });
  }

  private readFreshBlobNavigationState(): boolean {
    const fromCurrent = this.router.getCurrentNavigation()?.extras?.state as
      | { freshBlobDocument?: boolean }
      | undefined;
    if (fromCurrent?.freshBlobDocument === true) {
      return true;
    }
    const historyState = history.state as { freshBlobDocument?: boolean } | undefined;
    return historyState?.freshBlobDocument === true;
  }

  private readFreshNoteNavigationState(): boolean {
    const fromCurrent = this.router.getCurrentNavigation()?.extras?.state as
      | { freshNote?: boolean }
      | undefined;
    if (fromCurrent?.freshNote === true) {
      return true;
    }
    const historyState = history.state as { freshNote?: boolean } | undefined;
    return historyState?.freshNote === true;
  }

  /**
   * Pre-loads the `nature` vocabulary so the Classify action can supply real ids
   * to the KE model. DirectoryService caches the response so navigating between
   * documents is cheap.
   */
  private loadNatureVocabulary(): void {
    if (this.natureVocabularyLoaded) return;
    this.natureVocabularyLoaded = true;
    this.directoryService
      .getEntries('nature')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (entries) => this.natureVocabulary.set(entries),
        error: () => {
          // Allow another attempt on the next document if the directory call fails.
          this.natureVocabularyLoaded = false;
        },
      });
  }

  private resetState(): void {
    this.metadataRefreshAttempt = 0;
    this.blobLoadGeneration += 1;
    this.resetViewerState();
    if (this.rawBlobUrl) {
      URL.revokeObjectURL(this.rawBlobUrl);
      this.rawBlobUrl = null;
    }
    this.doc.set(null);
    this.blobUrl.set(null);
    this.blobLoading.set(false);
    this.arenderUrl.set(null);
    this.error.set(null);
    this.comments.set([]);
    this.repliesMap.set({});
    this.commentsLoaded = false;
    this.panelActivity.set([]);
    this.panelActivityLoaded = false;
    this.versions.set([]);
    this.versionsLoaded = false;
    this.versionDropdownOpen.set(false);
    this.documentTasks.set([]);
    this.documentWorkflows.set([]);
    this.keActionInFlight.set(null);
    this.keStatus.set(null);
    this.keError.set(null);
    this.contentLakeIngestInFlight.set(false);
    this.contentLakeIngestStatus.set(null);
    this.contentLakeIngestError.set(null);
    this.contentLakePresenceVerified.set(false);
    this.contentLakePresenceChecking.set(false);
    this.panelSubTab.set('properties');
  }

  generateSummary(): void {
    if (!this.docUid) return;
    this.aiSummaryLoading.set(true);
    this.aiError.set(null);
    this.aiGateway.summarize(this.docUid).subscribe({
      next: (res) => {
        this.aiSummary.set(res);
        this.aiSummaryLoading.set(false);
      },
      error: (err) => {
        this.aiError.set(err?.error?.error ?? 'Summary generation failed');
        this.aiSummaryLoading.set(false);
      },
    });
  }

  suggestTags(): void {
    if (!this.docUid) return;
    this.aiTagsLoading.set(true);
    this.aiError.set(null);
    this.aiGateway.suggestTags(this.docUid).subscribe({
      next: (res) => {
        this.aiSuggestedTags.set(res.tags);
        this.aiTagsLoading.set(false);
      },
      error: (err) => {
        this.aiError.set(err?.error?.error ?? 'Tag suggestion failed');
        this.aiTagsLoading.set(false);
      },
    });
  }

  applyAiTag(tagLabel: string): void {
    if (!this.docUid) return;
    this.tagService.addTag(this.docUid, tagLabel).subscribe({
      next: () => {
        this.aiSuggestedTags.update((tags) => tags.filter((t) => t.label !== tagLabel));
        this.snackBar.open(`Tag "${tagLabel}" applied`, 'OK', { duration: 3000 });
      },
      error: () => this.snackBar.open('Failed to apply tag', 'Dismiss', { duration: 3000 }),
    });
  }

  classifyDocument(): void {
    if (!this.docUid) return;
    this.aiClassifyLoading.set(true);
    this.aiError.set(null);
    this.aiGateway.classify(this.docUid).subscribe({
      next: (res) => {
        this.aiClassification.set(res);
        this.aiClassifyLoading.set(false);
      },
      error: (err) => {
        this.aiError.set(err?.error?.error ?? 'Classification failed');
        this.aiClassifyLoading.set(false);
      },
    });
  }

  findSimilar(): void {
    if (!this.docUid) return;
    this.aiSimilarLoading.set(true);
    this.aiError.set(null);
    this.aiGateway.findSimilar(this.docUid).subscribe({
      next: (res) => {
        this.aiSimilarDocs.set(res.documents);
        this.aiSimilarLoading.set(false);
      },
      error: (err) => {
        this.aiError.set(err?.error?.error ?? 'Similar doc search failed');
        this.aiSimilarLoading.set(false);
      },
    });
  }

  runTextClassification(): void {
    const candidates = this.natureVocabulary().map((entry) => entry.id);
    if (candidates.length === 0) {
      const message =
        'Document classification is unavailable: the "nature" vocabulary failed to load. ' +
        'Refresh the page and try again.';
      this.keError.set(message);
      this.toast(message);
      return;
    }
    this.runKnowledgeEnrichment('text-classification', {
      actions: ['text-classification'],
      classes: candidates,
    });
  }

  runTextEntityExtraction(): void {
    this.runKnowledgeEnrichment('named-entity-recognition-text', {
      actions: ['named-entity-recognition-text'],
    });
  }

  runTextSummarization(): void {
    this.runKnowledgeEnrichment('text-summarization', {
      actions: ['text-summarization'],
      maxWordCount: 150,
    });
  }

  runImageEnrichment(): void {
    this.runKnowledgeEnrichment('image-enrichment', {
      actions: ['image-description', 'named-entity-recognition-image'],
      maxWordCount: 100,
    });
  }

  ingestToContentLake(): void {
    const uid = this.docUid;
    if (!uid || !this.canIngestToContentLake() || this.contentLakeIngestInFlight()) {
      return;
    }

    this.contentLakeIngestInFlight.set(true);
    this.contentLakeIngestError.set(null);
    this.contentLakeIngestStatus.set(null);

    this.contentLakeIngestService
      .startIngest([uid])
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((command) => this.contentLakeIngestService.waitUntilComplete(command.commandId)),
        switchMap((status) =>
          this.contentLakeIngestService
            .markIngested([uid])
            .pipe(map((updatedDocs) => ({ status, updatedDoc: updatedDocs[0] ?? null }))),
        ),
        finalize(() => this.contentLakeIngestInFlight.set(false)),
      )
      .subscribe({
        next: ({ status, updatedDoc }) => {
          if (status.error || status.errorCount > 0) {
            const message =
              `Content Lake ingest finished with errors (${status.errorCount} failed). ` +
              'Check that the HxAI connector and ingest credentials are configured on Nuxeo.';
            this.contentLakeIngestError.set(message);
            this.contentLakeIngestStatus.set(null);
            this.toast(message);
            return;
          }

          const message =
            'Ingested to Content Lake. Knowledge Discovery agents can search this document once indexing completes.';
          this.contentLakeIngestStatus.set(message);
          this.contentLakePresenceVerified.set(true);
          if (updatedDoc) {
            this.doc.set(updatedDoc);
          } else {
            this.applyContentLakeIngestMarkerLocally();
          }
          this.toast(message);
        },
        error: (err: Error) => {
          const message = err.message || 'Content Lake ingest failed.';
          this.contentLakeIngestError.set(message);
          this.contentLakeIngestStatus.set(null);
          this.toast(message);
        },
      });
  }

  isKeActionRunning(action: KeUiAction): boolean {
    return this.keActionInFlight() === action;
  }

  navigateToDoc(uid: string): void {
    void this.router.navigateByUrl(`/doc/${uid}`);
  }

  openAiAssistant(): void {
    this.aiChatService.openPanel({ docId: this.docUid ?? undefined, page: this.router.url });
  }

  analyzeCommentSentiment(): void {
    const allComments = this.comments();
    if (!allComments.length) return;
    this.aiSentimentLoading.set(true);
    this.aiSentimentMap.set({});
    this.aiThreadSummary.set(null);

    const payload = allComments.map((c) => ({ id: c.id, text: c.text }));
    this.aiGateway.analyzeSentiment(payload).subscribe({
      next: (res: SentimentResponse) => {
        const map: Record<string, SentimentItem> = {};
        for (const item of res.sentiments) {
          map[item.id] = item;
        }
        this.aiSentimentMap.set(map);
        this.aiThreadSummary.set(res.threadSummary);
        this.aiSentimentLoading.set(false);
      },
      error: () => {
        this.aiSentimentLoading.set(false);
      },
    });
  }

  private runKnowledgeEnrichment(uiAction: KeUiAction, request: KeEnrichRequest): void {
    if (!this.docUid || this.keActionInFlight()) return;

    this.keActionInFlight.set(uiAction);
    this.keError.set(null);
    this.keStatus.set(this.keStartMessage(uiAction));

    this.detailService
      .fetchBlob(this.docUid)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((blob) =>
          this.keClient.enrich(blob, {
            ...request,
            sourceId: this.docUid,
          }),
        ),
        switchMap((result) => this.persistKnowledgeEnrichment(uiAction, result)),
        finalize(() => this.keActionInFlight.set(null)),
      )
      .subscribe({
        next: (updatedDoc) => {
          this.doc.set(updatedDoc);
          this.syncActionStates(updatedDoc);
          this.keStatus.set(this.keSuccessMessage(uiAction));
          this.toast(this.keSuccessMessage(uiAction));
        },
        error: (err) => {
          const message = this.resolveKnowledgeEnrichmentError(err, uiAction);
          this.keError.set(message);
          this.keStatus.set(null);
          this.toast(message);
        },
      });
  }

  private persistKnowledgeEnrichment(
    uiAction: KeUiAction,
    result: KeEnrichmentResult,
  ): Observable<NuxeoDocument> {
    const docId = this.docUid;
    const propertyUpdates: Record<string, unknown> = {};
    let tagsToApply: string[] = [];

    switch (uiAction) {
      case 'text-classification': {
        const category = result.textClassification?.result?.trim();
        const vocabularySize = this.natureVocabulary().length;
        const manualHint =
          'To set it manually, click the Edit button and pick a value for Document Category.';

        if (!category) {
          console.warn('[KE] text-classification returned no category', result);
          return this.throwKeResultError(
            `Knowledge Enrichment did not return a document category. ${manualHint}`,
          );
        }
        if (category === KE_NO_MATCH_SENTINEL) {
          console.warn(
            `[KE] text-classification: no match against ${vocabularySize} candidate(s)`,
            { candidates: this.natureVocabulary().map((entry) => entry.id), result },
          );
          return this.throwKeResultError(
            `Knowledge Enrichment could not match this document to any of the ${vocabularySize} ` +
              `available document categories. ${manualHint}`,
          );
        }
        // Map back to a vocabulary id. Accept either the id or the display label
        // (the LLM occasionally returns the human-readable label rather than the id).
        const resolvedId = this.resolveNatureVocabularyId(category);
        if (!resolvedId) {
          console.warn(`[KE] text-classification: "${category}" is not in the nature vocabulary`, {
            candidates: this.natureVocabulary().map((entry) => entry.id),
            result,
          });
          return this.throwKeResultError(
            `Knowledge Enrichment returned "${category}", which is not one of the ` +
              `${vocabularySize} document categories. ${manualHint}`,
          );
        }
        propertyUpdates['dc:nature'] = resolvedId;
        break;
      }

      case 'text-summarization': {
        const summary = result.textSummary?.result?.trim();
        if (!summary) {
          return this.throwKeResultError('Knowledge Enrichment did not return a summary.');
        }
        propertyUpdates['dc:description'] = summary;
        break;
      }

      case 'named-entity-recognition-text': {
        tagsToApply = this.collectNamedEntityTags(result.namedEntityText?.result);
        if (tagsToApply.length === 0) {
          return this.throwKeResultError('Knowledge Enrichment did not return any text entities.');
        }
        break;
      }

      case 'image-enrichment': {
        const description = result.imageDescription?.result?.trim();
        tagsToApply = this.collectNamedEntityTags(result.namedEntityImage?.result);

        if (description) {
          propertyUpdates['dc:description'] = description;
        }
        if (Object.keys(propertyUpdates).length === 0 && tagsToApply.length === 0) {
          return this.throwKeResultError(
            'Knowledge Enrichment did not return an image description or image entities.',
          );
        }
        break;
      }
    }

    const existingTags = new Set(this.tags().map((tag) => tag.toLowerCase()));
    const uniqueTags = tagsToApply.filter((tag) => !existingTags.has(tag.toLowerCase()));

    const update$ =
      Object.keys(propertyUpdates).length > 0
        ? this.browseService.updateDocument(docId, propertyUpdates)
        : of(null);
    const tags$ =
      uniqueTags.length > 0
        ? forkJoin(uniqueTags.map((tag) => this.tagService.addTag(docId, tag)))
        : of([]);

    return forkJoin({ updated: update$, tags: tags$ }).pipe(
      switchMap(() => this.detailService.getFullDocument(docId)),
    );
  }

  /**
   * Maps a KE classification result back to a Nuxeo `nature` vocabulary id.
   * Accepts a match against either `id` or `displayLabel` (case-insensitive) since
   * the LLM sometimes returns the human-readable label.
   */
  private resolveNatureVocabularyId(value: string): string | null {
    const needle = value.trim().toLowerCase();
    if (!needle) return null;
    const match = this.natureVocabulary().find(
      (entry) => entry.id.toLowerCase() === needle || entry.displayLabel.toLowerCase() === needle,
    );
    return match?.id ?? null;
  }

  private collectNamedEntityTags(entityMap: Record<string, string[]> | null | undefined): string[] {
    if (!entityMap) return [];
    const values = Object.values(entityMap).flatMap((entries) => entries ?? []);
    return Array.from(
      new Set(values.map((value) => value.trim()).filter((value) => value.length > 0)),
    );
  }

  private keStartMessage(action: KeUiAction): string {
    switch (action) {
      case 'text-classification':
        return 'Running document classification...';
      case 'named-entity-recognition-text':
        return 'Extracting named entities from the PDF...';
      case 'text-summarization':
        return 'Generating document summary...';
      case 'image-enrichment':
        return 'Generating image description and tags...';
    }
  }

  private keSuccessMessage(action: KeUiAction): string {
    switch (action) {
      case 'text-classification':
        return 'Document category updated from Knowledge Enrichment.';
      case 'named-entity-recognition-text':
        return 'Document tags updated from Knowledge Enrichment.';
      case 'text-summarization':
        return 'Document description updated from Knowledge Enrichment.';
      case 'image-enrichment':
        return 'Image description and tags updated from Knowledge Enrichment.';
    }
  }

  private resolveKnowledgeEnrichmentError(error: unknown, action: KeUiAction): string {
    const fallback = `Failed to run ${this.keActionLabel(action)}.`;
    if (error instanceof Error && error.message) {
      if (error.message.includes('No authentication info for calling the Enrichment service')) {
        return (
          'Knowledge Enrichment is not configured on this Nuxeo server yet. ' +
          'Add the CIC contextEnrichment/enrichment credentials to Nuxeo, then retry.'
        );
      }
      return error.message;
    }
    const maybeMessage = (error as { error?: { message?: string }; message?: string } | null)?.error
      ?.message;
    if (maybeMessage?.includes('No authentication info for calling the Enrichment service')) {
      return (
        'Knowledge Enrichment is not configured on this Nuxeo server yet. ' +
        'Add the CIC contextEnrichment/enrichment credentials to Nuxeo, then retry.'
      );
    }
    return maybeMessage ?? (error as { message?: string } | null)?.message ?? fallback;
  }

  private keActionLabel(action: KeUiAction): string {
    switch (action) {
      case 'text-classification':
        return 'document classification';
      case 'named-entity-recognition-text':
        return 'entity extraction';
      case 'text-summarization':
        return 'document summarization';
      case 'image-enrichment':
        return 'image enrichment';
    }
  }

  private throwKeResultError(message: string): Observable<never> {
    return new Observable((subscriber) => {
      subscriber.error(new Error(message));
    });
  }

  ngOnDestroy(): void {
    if (this.rawBlobUrl) {
      URL.revokeObjectURL(this.rawBlobUrl);
    }
    for (const url of this.videoObjectUrls) {
      URL.revokeObjectURL(url);
    }
  }

  private maybeBackfillContentLakeMarker(doc: NuxeoDocument): void {
    if (!shouldProbeContentLakeIngestStatus(doc)) {
      if (isContentLakeIngestCurrent(doc)) {
        this.contentLakePresenceVerified.set(true);
      }
      return;
    }

    this.contentLakePresenceChecking.set(true);
    this.kdClient
      .listIngestSourceIds()
      .pipe(
        switchMap((sourceIds) =>
          this.contentLakeIngestService.backfillIngestMarkerIfNeeded(doc, sourceIds),
        ),
        finalize(() => this.contentLakePresenceChecking.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((result) => {
        if (result.presentInContentLake) {
          this.contentLakePresenceVerified.set(true);
        }
        if (result.doc && this.doc()?.uid === result.doc.uid) {
          this.doc.set(result.doc);
        }
      });
  }

  private applyContentLakeIngestMarkerLocally(): void {
    const doc = this.doc();
    if (!doc) {
      return;
    }
    const digest = readBlobDigest(doc);
    const writeProperty = resolveIngestMarkerWriteProperty(doc);
    if (!digest || !writeProperty) {
      return;
    }
    this.doc.set({
      ...doc,
      properties: {
        ...doc.properties,
        [writeProperty]: buildContentLakeIngestMarker(digest),
      },
    });
  }

  private loadDocument(uid: string): void {
    this.loading.set(true);
    this.error.set(null);

    this.detailService
      .getFullDocument(uid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (doc) => {
          if (doc.type !== 'Collection' && isFolderishDocument(doc) && doc.path) {
            void this.router.navigateByUrl(`/browse${doc.path}`, { replaceUrl: true });
            return;
          }
          this.doc.set(doc);
          this.syncActionStates(doc);
          this.loading.set(false);
          this.loadBlob(doc);
          if (this.freshNoteDocument && doc.type === 'Note') {
            this.focusNoteEditor.set(true);
            this.freshNoteDocument = false;
          }
          this.scheduleMetadataRefreshIfNeeded(doc);
          this.loadPublicationCount(uid);
          this.loadDocumentTasks(uid);
          this.loadDocumentWorkflows(uid);
          this.loadARenderUrl(doc);
          this.maybeBackfillContentLakeMarker(doc);
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
    this.detailService.getRunnableWorkflows(this.docUid).subscribe({
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
    this.workflowService.startWorkflow(this.docUid, model).subscribe({
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
    const key = task.name.replace(/^wf\.\w+\./, '').replace(/\.(title|directive)$/i, '');
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
    const generation = ++this.blobLoadGeneration;
    this.resetViewerState();
    this.blobLoading.set(true);

    const noteText = doc.properties['note:note'] as string | undefined;
    const noteMime = doc.properties['note:mime_type'] as string | undefined;
    if (noteText !== undefined && noteText !== null) {
      this.noteContent.set(noteText);
      if (noteMime === 'text/markdown') {
        const rawHtml = this.renderMarkdown(noteText);
        const cleanHtml = DOMPurify.sanitize(rawHtml, { ADD_ATTR: ['target'] });
        this.noteHtml.set(this.sanitizer.bypassSecurityTrustHtml(cleanHtml));
      }
      this.blobLoading.set(false);
      return;
    }

    const picViews = doc.properties['picture:views'] as Array<Record<string, unknown>> | undefined;
    if (picViews?.length) {
      this.extractPictureMetadata(doc, picViews);
    }

    const transcodedVideos = doc.properties['vid:transcodedVideos'] as
      | Array<Record<string, unknown>>
      | undefined;
    if (transcodedVideos && transcodedVideos.length > 0) {
      this.loadVideoSources(doc, transcodedVideos, generation);
      return;
    }

    const fc = doc.properties['file:content'] as Record<string, unknown> | null;
    if (!fc) {
      if (doc.type === 'Picture') {
        this.fetchMainBlob(doc, generation);
        this.scheduleMetadataRefreshIfNeeded(doc);
        return;
      }
      const noPreviewTypes = [
        'Collection',
        'Folder',
        'Workspace',
        'Domain',
        'Section',
        'OrderedFolder',
      ];
      if (!noPreviewTypes.includes(doc.type)) {
        this.loadPreviewFallback(doc);
      } else {
        this.blobLoading.set(false);
      }
      return;
    }

    const mime = this.resolveMainContentMime(fc, doc);

    if (doc.type === 'Picture' || (picViews?.length && !mime)) {
      this.fetchMainBlob(doc, generation);
      this.scheduleMetadataRefreshIfNeeded(doc);
      return;
    }

    if (mime.startsWith('video/')) {
      this.fetchMainBlob(doc, generation);
      this.loadStoryboard(doc);
      return;
    }

    if (mime.startsWith('audio/') || mime.startsWith('image/') || mime === 'application/pdf') {
      this.fetchMainBlob(doc, generation);
      return;
    }

    if (mime.startsWith('text/') || mime === 'application/json') {
      this.detailService
        .fetchBlob(doc.uid)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (blob) => {
            if (generation !== this.blobLoadGeneration || doc.uid !== this.docUid) return;
            void blob.text().then((text) => this.noteContent.set(text));
            this.blobLoading.set(false);
            this.freshBlobDocument = false;
          },
          error: () => {
            if (generation !== this.blobLoadGeneration || doc.uid !== this.docUid) return;
            this.loadPreviewFallback(doc);
          },
        });
      return;
    }

    const renditions = (doc.contextParameters?.['renditions'] ?? []) as Array<{ name: string }>;
    if (renditions.some((r) => r.name === 'pdf')) {
      this.hasPdfRendition.set(true);
      this.detailService
        .fetchPdfRendition(doc.uid)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (blob) => {
            if (generation !== this.blobLoadGeneration || doc.uid !== this.docUid) return;
            this.setBlobUrl(blob);
            this.blobLoading.set(false);
            this.freshBlobDocument = false;
          },
          error: () => {
            if (generation !== this.blobLoadGeneration || doc.uid !== this.docUid) return;
            this.loadPreviewFallback(doc);
          },
        });
      return;
    }

    if (isBlobHoldingDocType(doc.type) && this.hasFileContentBlob(fc)) {
      this.fetchMainBlob(doc, generation);
      return;
    }

    this.loadPreviewFallback(doc);
  }

  private resolveMainContentMime(fc: Record<string, unknown> | null, doc: NuxeoDocument): string {
    const mime = (fc?.['mime-type'] as string) ?? '';
    if (mime) return mime;
    const fileName = (fc?.['name'] as string) ?? doc.title ?? '';
    return this.mimeTypeFromFileName(fileName);
  }

  private mimeTypeFromFileName(fileName: string): string {
    const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
    return MIME_BY_EXTENSION[ext] ?? '';
  }

  private hasFileContentBlob(fc: Record<string, unknown>): boolean {
    return !!(
      fc['digest'] ||
      fc['data'] ||
      (typeof fc['name'] === 'string' && fc['name'].length > 0) ||
      Number(fc['length'] ?? 0) > 0
    );
  }

  private fetchMainBlob(doc: NuxeoDocument, generation: number, attempt = 0): void {
    const maxAttempts = this.freshBlobDocument || isBlobHoldingDocType(doc.type) ? 8 : 1;
    this.detailService
      .fetchBlob(doc.uid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          if (generation !== this.blobLoadGeneration || doc.uid !== this.docUid) return;
          this.setBlobUrl(blob);
          this.blobLoading.set(false);
          this.freshBlobDocument = false;
          this.clearFreshUploadQueryParam();
        },
        error: () => {
          if (generation !== this.blobLoadGeneration || doc.uid !== this.docUid) return;
          if (attempt + 1 < maxAttempts) {
            timer(400)
              .pipe(takeUntilDestroyed(this.destroyRef))
              .subscribe(() => {
                if (generation !== this.blobLoadGeneration || doc.uid !== this.docUid) return;
                this.fetchMainBlob(doc, generation, attempt + 1);
              });
            return;
          }
          this.freshBlobDocument = false;
          this.loadPreviewFallback(doc);
        },
      });
  }

  private clearFreshUploadQueryParam(): void {
    if (this.route.snapshot.queryParamMap.get('fresh') !== '1') return;
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { fresh: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  /**
   * Nuxeo may return partially hydrated Picture metadata immediately after create/import.
   * Poll briefly and merge metadata without resetting an already-visible preview.
   */
  private scheduleMetadataRefreshIfNeeded(doc: NuxeoDocument): void {
    if (!this.documentMetadataIncomplete(doc)) return;

    const uid = doc.uid;
    const maxAttempts = 6;

    const poll = (): void => {
      if (uid !== this.docUid || this.metadataRefreshAttempt >= maxAttempts) return;
      this.metadataRefreshAttempt += 1;

      timer(500)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          switchMap(() => this.detailService.getFullDocument(uid)),
        )
        .subscribe({
          next: (refetched) => {
            if (uid !== this.docUid) return;
            this.syncDocumentMetadataFromRefetch(refetched);
            if (
              this.documentMetadataIncomplete(refetched) &&
              this.metadataRefreshAttempt < maxAttempts
            ) {
              poll();
            }
          },
          error: () => {
            // Stop polling on transient failures; preview may already be visible.
          },
        });
    };

    poll();
  }

  private syncDocumentMetadataFromRefetch(doc: NuxeoDocument): void {
    this.doc.set(doc);
    const picViews = doc.properties['picture:views'] as Array<Record<string, unknown>> | undefined;
    if (picViews?.length) {
      this.extractPictureMetadata(doc, picViews);
    }
    if (!this.blobUrl()) {
      this.fetchMainBlob(doc, this.blobLoadGeneration);
    }
  }

  private documentMetadataIncomplete(doc: NuxeoDocument): boolean {
    if (doc.type !== 'Picture') {
      return false;
    }

    const info = doc.properties['picture:info'] as Record<string, unknown> | undefined;
    const views = doc.properties['picture:views'] as Array<Record<string, unknown>> | undefined;
    if (!info || !views?.length) {
      return true;
    }

    const width = Number(info['width'] ?? 0);
    const height = Number(info['height'] ?? 0);
    if (width <= 0 || height <= 0) {
      return true;
    }

    return !views.some((view) => {
      const title = (view['title'] as string) ?? '';
      const viewWidth = Number(view['width'] ?? 0);
      return (
        (title === 'FullHD' || title === 'OriginalJpeg' || title === 'Medium') && viewWidth > 200
      );
    });
  }

  private loadVideoSources(
    doc: NuxeoDocument,
    transcodedVideos: Array<Record<string, unknown>>,
    generation: number,
  ): void {
    const sources: VideoSource[] = [];
    for (const tv of transcodedVideos) {
      const content = tv['content'] as Record<string, unknown> | undefined;
      const dataUrl = (content?.['data'] as string) ?? '';
      const tvMime = (content?.['mime-type'] as string) ?? 'video/mp4';
      const label = (tv['name'] as string) ?? '';
      if (dataUrl && tvMime.startsWith('video/')) {
        sources.push({
          url: this.sanitizer.bypassSecurityTrustResourceUrl(dataUrl),
          mimeType: tvMime,
          label,
        });
      }
    }
    if (sources.length > 0) {
      this.videoSources.set(sources);
      this.blobLoading.set(false);
    } else {
      this.fetchMainBlob(doc, generation);
    }
    this.loadStoryboard(doc);
  }

  private loadStoryboard(doc: NuxeoDocument): void {
    const sb = doc.properties['vid:storyboard'] as Array<Record<string, unknown>> | undefined;
    if (!sb || sb.length === 0) return;
    const items: StoryboardItem[] = sb.map((entry) => {
      const content = entry['content'] as Record<string, unknown> | undefined;
      const thumbUrl = (content?.['data'] as string) ?? '';
      return {
        timecode: Number(entry['timecode'] ?? 0),
        thumbnailUrl: this.sanitizer.bypassSecurityTrustResourceUrl(thumbUrl),
        label: (entry['comment'] as string) ?? '',
      };
    });
    this.storyboard.set(items);
  }

  private loadFallbackBlob(doc: NuxeoDocument, generation = this.blobLoadGeneration): void {
    this.detailService
      .fetchBlob(doc.uid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (blob) => {
          if (generation !== this.blobLoadGeneration || doc.uid !== this.docUid) return;
          this.setBlobUrl(blob);
          this.blobLoading.set(false);
          this.freshBlobDocument = false;
        },
        error: () => {
          if (generation !== this.blobLoadGeneration || doc.uid !== this.docUid) return;
          this.loadPreviewFallback(doc);
        },
      });
  }

  private loadPreviewFallback(doc: NuxeoDocument): void {
    const previewCtx = doc.contextParameters?.['preview'] as { url?: string } | undefined;
    if (previewCtx?.url) {
      this.previewUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(previewCtx.url));
    }
    this.blobLoading.set(false);
    this.freshBlobDocument = false;
  }

  private resetViewerState(): void {
    this.blobUrl.set(null);
    this.noteContent.set(null);
    this.noteHtml.set(null);
    this.noteSaving.set(false);
    this.focusNoteEditor.set(false);
    this.videoSources.set([]);
    this.storyboard.set([]);
    this.posterUrl.set(null);
    this.hasPdfRendition.set(false);
    this.previewUrl.set(null);
    this.pictureInfo.set(null);
    this.pictureViews.set([]);
    this.exifData.set(null);
    this.iptcData.set(null);
    for (const url of this.videoObjectUrls) {
      URL.revokeObjectURL(url);
    }
    this.videoObjectUrls = [];
  }

  private extractPictureMetadata(
    doc: NuxeoDocument,
    picViews: Array<Record<string, unknown>>,
  ): void {
    const info = doc.properties['picture:info'] as Record<string, unknown> | undefined;
    if (info) {
      const width = Number(info['width'] ?? 0);
      const height = Number(info['height'] ?? 0);
      if (width > 0 && height > 0) {
        const weight = Number(info['weight'] ?? 0);
        this.pictureInfo.set({
          width,
          height,
          format: (info['format'] as string) ?? '',
          colorSpace: (info['colorSpace'] as string) ?? '',
          depth: Number(info['depth'] ?? 0),
          weight: this.formatBytes(weight),
        });
      }
    }

    const views: PictureView[] = picViews.map((v) => {
      const content = v['content'] as Record<string, unknown> | undefined;
      const len = Number(content?.['length'] ?? 0);
      return {
        title: (v['title'] as string) ?? '',
        width: Number(v['width'] ?? 0),
        height: Number(v['height'] ?? 0),
        fileSize: this.formatBytes(len),
        format: ((content?.['mime-type'] as string) ?? '').replace('image/', '').toUpperCase(),
        downloadUrl: (content?.['data'] as string) ?? '',
      };
    });
    this.pictureViews.set(views);

    const imd = doc.properties['imd:image_description'] as string | undefined;
    const exif: ExifData = {};
    const dateOrig = doc.properties['imd:date_time_original'] as string | undefined;
    if (dateOrig) exif.dateTimeOriginal = dateOrig;
    const orient = doc.properties['imd:orientation'] as string | undefined;
    if (orient) exif.orientation = orient;
    const fNum = doc.properties['imd:fnumber'] as string | number | undefined;
    if (fNum) exif.fNumber = `f/${fNum}`;
    const exposure = doc.properties['imd:exposure_time'] as string | number | undefined;
    if (exposure) exif.exposureTime = String(exposure);
    const iso = doc.properties['imd:iso_speed_ratings'] as string | number | undefined;
    if (iso) exif.isoSpeedRatings = String(iso);
    const focal = doc.properties['imd:focal_length'] as string | number | undefined;
    if (focal) exif.focalLength = `${focal}mm`;
    if (Object.keys(exif).length > 0) {
      this.exifData.set(exif);
    }

    const iptc: IptcData = {};
    const copyright = doc.properties['iptc:copyright'] as string | undefined;
    if (copyright) iptc.copyright = copyright;
    const rights = doc.properties['iptc:rights'] as string | undefined;
    if (rights) iptc.rights = rights;
    const source = doc.properties['iptc:source'] as string | undefined;
    if (source) iptc.source = source;
    const desc = imd ?? (doc.properties['iptc:description'] as string | undefined);
    if (desc) iptc.description = desc;
    if (Object.keys(iptc).length > 0) {
      this.iptcData.set(iptc);
    }
  }

  downloadPictureFormat(url: string): void {
    if (!url) return;
    window.open(url, '_blank');
  }

  private renderMarkdown(text: string): string {
    return renderNoteMarkdown(text);
  }

  private setBlobUrl(blob: Blob): void {
    if (this.rawBlobUrl) URL.revokeObjectURL(this.rawBlobUrl);
    this.rawBlobUrl = URL.createObjectURL(blob);
    this.blobUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(this.rawBlobUrl));
  }

  onTabChange(raw: number): void {
    const index = Math.floor(Number(raw));
    if (!Number.isFinite(index) || index < 0) {
      return;
    }
    if (index === 3 && !this.historyLoaded) {
      this.loadDirectoryEntries();
      this.loadAuditLog();
    }
    if (index === 4 && !this.publishTabLoaded) {
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
          this.auditTotalSize.set(res.resultsCount ?? res.totalSize ?? res.entries.length);
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
    return (
      this.eventTypeLabelMap.get(eventId) ??
      eventId.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())
    );
  }

  categoryLabel(category: string): string {
    return (
      this.eventCategoryLabelMap.get(category) ??
      category
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (c) => c.toUpperCase())
        .replace('event ', '')
        .replace(' Category', '')
    );
  }

  avatarColor = avatarColor;

  tagCategory(index: number): SatTagCategory {
    return TAG_CATEGORIES[index % TAG_CATEGORIES.length];
  }

  private loadPublicationCount(uid: string): void {
    this.detailService.getPublishedVersions(uid).subscribe({
      next: (res) => {
        this.publishedDocs.set(res.entries);
        this.publishLoading.set(false);
      },
      error: () => this.publishLoading.set(false),
    });
  }

  private loadPublishingData(): void {
    this.publishTabLoaded = true;
    this.publishLoading.set(true);
    this.sectionsLoading.set(true);

    if (this.publishedDocs().length === 0) {
      this.detailService.getPublishedVersions(this.docUid).subscribe({
        next: (res) => {
          this.publishedDocs.set(res.entries);
          this.publishLoading.set(false);
        },
        error: () => this.publishLoading.set(false),
      });
    } else {
      this.publishLoading.set(false);
    }

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
      const node = nodeMap.get(doc.path);
      if (!node) continue;
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
    this.selectedSectionId.set(this.selectedSectionId() === id ? null : id);
  }

  toggleSectionNode(node: SectionNode): void {
    node.expanded = !node.expanded;
    this.sectionTree.update((t) => [...t]);
  }

  publishToSection(): void {
    const target = this.selectedSectionId();
    if (!target || !this.docUid) return;
    this.publishing.set(true);

    this.detailService.publishDocument(this.docUid, target, { override: true }).subscribe({
      next: () => {
        this.publishing.set(false);
        this.selectedSectionId.set(null);
        this.toast('Document published');
        this.refreshPublishedDocs();
      },
      error: () => {
        this.publishing.set(false);
        this.toast('Failed to publish');
      },
    });
  }

  sectionIcon(node: SectionNode): string {
    return node.doc.type === 'SectionRoot' ? 'library_books' : 'folder';
  }

  publishedPath(doc: NuxeoDocument): string {
    return doc.path;
  }

  publishedVersion(doc: NuxeoDocument): string {
    const major = doc.properties?.['uid:major_version'] ?? 0;
    const minor = doc.properties?.['uid:minor_version'] ?? 0;
    return `${major}.${minor}`;
  }

  isOlderVersion(pub: NuxeoDocument): boolean {
    const pubMajor = Number(pub.properties?.['uid:major_version'] ?? 0);
    const pubMinor = Number(pub.properties?.['uid:minor_version'] ?? 0);
    return (
      pubMajor < this.currentMajor() ||
      (pubMajor === this.currentMajor() && pubMinor < this.currentMinor())
    );
  }

  publishedRendition(doc: NuxeoDocument): string {
    const nature = doc.properties?.['dc:nature'] as string | null;
    if (nature) return nature;
    const mime = (doc.properties?.['file:content'] as Record<string, unknown>)?.[
      'mime-type'
    ] as string;
    if (mime === 'application/pdf') return 'PDF';
    return 'None';
  }

  publishedBy(doc: NuxeoDocument): string {
    return (
      (doc.properties?.['dc:lastContributor'] as string) ??
      (doc.properties?.['dc:creator'] as string) ??
      ''
    );
  }

  publishedDate(doc: NuxeoDocument): string {
    return (doc.properties?.['dc:modified'] as string) ?? doc.lastModified ?? '';
  }

  goToPublishingTab(): void {
    const g = this.detailTabGroup();
    if (g) {
      g.selectedIndex = 4;
    }
    this.onTabChange(4);
  }

  unpublishDocument(proxyDoc: NuxeoDocument): void {
    if (this.actionInProgress()) return;
    this.actionInProgress.set('unpublish');
    this.detailService.unpublishDocument(proxyDoc.uid).subscribe({
      next: () => {
        this.actionInProgress.set(null);
        this.publishedDocs.update((docs) => docs.filter((d) => d.uid !== proxyDoc.uid));
        this.toast('Publication removed');
      },
      error: () => {
        this.actionInProgress.set(null);
        this.toast('Failed to unpublish');
      },
    });
  }

  republishDocument(proxyDoc: NuxeoDocument): void {
    if (this.actionInProgress()) return;
    this.actionInProgress.set('republish');
    this.republishToSectionByProxy(proxyDoc);
  }

  private republishToSectionByProxy(proxyDoc: NuxeoDocument): void {
    const sectionPath = proxyDoc.path.split('/').slice(0, -1).join('/');
    // Find section UID from the section tree or query for it
    const findSection = (nodes: SectionNode[]): string | null => {
      for (const n of nodes) {
        if (n.doc.path === sectionPath) return n.doc.uid;
        const found = findSection(n.children);
        if (found) return found;
      }
      return null;
    };
    const sectionUid = findSection(this.sectionTree());
    if (sectionUid) {
      this.doRepublish(sectionUid);
    } else {
      const query = `SELECT * FROM Document WHERE ecm:path = '${sectionPath}' AND ecm:isTrashed = 0`;
      this.nuxeoApi.nxqlSearch(query, 1).subscribe({
        next: (res) => {
          if (res.entries.length > 0) {
            this.doRepublish(res.entries[0].uid);
          } else {
            this.actionInProgress.set(null);
            this.toast('Section not found');
          }
        },
        error: () => {
          this.actionInProgress.set(null);
          this.toast('Failed to republish');
        },
      });
    }
  }

  private doRepublish(targetSectionUid: string): void {
    this.detailService
      .publishDocument(this.docUid, targetSectionUid, { override: true })
      .subscribe({
        next: () => {
          this.actionInProgress.set(null);
          this.toast('Document republished');
          this.refreshPublishedDocs();
        },
        error: () => {
          this.actionInProgress.set(null);
          this.toast('Failed to republish');
        },
      });
  }

  unpublishAll(): void {
    const docs = this.publishedDocs();
    if (docs.length === 0 || this.actionInProgress()) return;
    this.actionInProgress.set('unpublish-all');

    const deletions = docs.map((d) => this.detailService.unpublishDocument(d.uid));
    forkJoin(deletions).subscribe({
      next: () => {
        this.actionInProgress.set(null);
        this.publishedDocs.set([]);
        this.toast('All publications removed');
      },
      error: () => {
        this.actionInProgress.set(null);
        this.toast('Failed to remove some publications');
        this.refreshPublishedDocs();
      },
    });
  }

  private refreshPublishedDocs(): void {
    this.detailService.getPublishedVersions(this.docUid).subscribe({
      next: (res) => this.publishedDocs.set(res.entries),
    });
  }

  // ── Document Actions ──

  toggleLock(): void {
    if (this.actionInProgress() || !this.requireWritePermission()) return;
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
        window.dispatchEvent(new Event('favorites-changed'));
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

  readonly isTrashed = computed(() => {
    const d = this.doc();
    return d?.isTrashed === true || d?.state === 'deleted';
  });

  trashDocument(): void {
    if (this.actionInProgress() || !this.requireRemovePermission()) return;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Document',
        message: 'Are you sure you want to delete this document?',
        confirmLabel: 'Delete',
      } as ConfirmDialogData,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.actionInProgress.set('trash');

        this.detailService
          .trashDocument(this.docUid)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
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
      });
  }

  restoreFromTrash(): void {
    if (this.actionInProgress() || !this.requireWritePermission()) return;
    this.actionInProgress.set('restore');
    this.detailService
      .restoreFromTrash(this.docUid)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.actionInProgress.set(null);
          this.toast('Document restored');
          this.loadDocument(this.docUid);
        },
        error: () => {
          this.actionInProgress.set(null);
          this.toast('Failed to restore document');
        },
      });
  }

  permanentlyDelete(): void {
    if (this.actionInProgress() || !this.requireRemovePermission()) return;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Permanently Delete Document',
        message: 'Permanently delete this document? This cannot be undone.',
        confirmLabel: 'Delete',
      } as ConfirmDialogData,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.actionInProgress.set('permanentDelete');
        this.detailService
          .permanentlyDelete(this.docUid)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.actionInProgress.set(null);
              this.toast('Document permanently deleted');
              this.goBack();
            },
            error: () => {
              this.actionInProgress.set(null);
              this.toast('Failed to permanently delete document');
            },
          });
      });
  }

  toggleClipboard(): void {
    const current = this.clipboardDocs();
    const d = this.doc();
    if (!d) return;

    if (this.isInClipboard()) {
      const updated = current.filter((c) => c.uid !== this.docUid);
      this.clipboardDocs.set(updated);
      writeClipboardDocs(updated);
      this.toast('Removed from clipboard');
    } else {
      const updated = [...current, { uid: d.uid, title: d.title }];
      this.clipboardDocs.set(updated);
      writeClipboardDocs(updated);
      this.toast('Added to clipboard');
    }
    window.dispatchEvent(new Event('clipboard-changed'));
  }

  exportDocument(): void {
    this.dialog.open(ExportDialogComponent, {
      data: {
        documentUid: this.docUid,
        documentTitle: this.doc()?.title ?? 'document',
        exportFn: (type: ExportType, uid: string): Observable<Blob> => {
          switch (type) {
            case 'thumbnail':
              return this.detailService.fetchThumbnail(uid);
            case 'pdf':
              return this.detailService.fetchPdfRendition(uid);
            case 'zip':
              return this.detailService.exportZip(uid, `${this.doc()?.title ?? 'export'}.zip`);
            case 'xml':
              return this.detailService.exportXml(uid);
          }
        },
      } satisfies ExportDialogData,
      width: '440px',
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

  openEditDialog(): void {
    const currentDoc = this.doc();
    if (!currentDoc || !this.requireWritePermission()) return;

    const ref = this.dialog.open(EditDocumentDialogComponent, {
      width: '560px',
      data: { document: currentDoc },
    });

    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((updatedDoc: NuxeoDocument | undefined) => {
        if (!updatedDoc) return;
        this.doc.set(updatedDoc);
        this.syncActionStates(updatedDoc);
        this.toast('Document updated');
        this.loadDocument(this.docUid);
      });
  }

  saveNote(body: string): void {
    const doc = this.doc();
    if (!doc || this.noteSaving()) return;

    this.noteSaving.set(true);
    const mime = this.mimeType();
    this.browseService
      .updateDocument(doc.uid, {
        'note:note': body,
        'note:mime_type': mime,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.noteSaving.set(false);
          this.doc.set(updated);
          this.noteContent.set(body);
          if (mime === 'text/markdown') {
            const rawHtml = this.renderMarkdown(body);
            const cleanHtml = DOMPurify.sanitize(rawHtml, { ADD_ATTR: ['target'] });
            this.noteHtml.set(this.sanitizer.bypassSecurityTrustHtml(cleanHtml));
          } else {
            this.noteHtml.set(null);
          }
          this.toast('Note saved');
        },
        error: () => {
          this.noteSaving.set(false);
          this.toast('Failed to save note');
        },
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

  private requireWritePermission(): boolean {
    if (canWriteDocument(this.doc())) return true;
    this.toast(PERMISSION_DENIED_MESSAGE);
    return false;
  }

  private requireRemovePermission(): boolean {
    if (canRemoveDocument(this.doc())) return true;
    this.toast(PERMISSION_DENIED_MESSAGE);
    return false;
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

  previewMainBlob(): void {
    if (!this.rawBlobUrl) return;
    const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.rawBlobUrl);
    this.dialog.open(AttachmentPreviewDialogComponent, {
      width: '90vw',
      maxWidth: '1200px',
      maxHeight: '95vh',
      panelClass: 'preview-dialog-panel',
      data: {
        name: this.fileName(),
        mimeType: this.mimeType(),
        blobUrl: safeUrl,
        rawUrl: '',
      },
    });
  }

  private loadARenderUrl(doc: NuxeoDocument): void {
    const xpath = this.blobXPathForARender(doc);
    if (!xpath) {
      this.arenderUrl.set(null);
      return;
    }
    const requestedDocUid = doc.uid;
    this.arenderUrl.set(null);
    this.arenderService
      .isAvailable()
      .pipe(
        switchMap((available) =>
          available ? this.arenderService.getPreviewerUrl(doc.uid, xpath) : of(null),
        ),
      )
      .subscribe({
        next: (url) => {
          if (requestedDocUid !== this.docUid) return;
          if (url) {
            this.arenderUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
            this.arenderReloadId.update((n) => n + 1);
          }
        },
        error: () => {
          if (requestedDocUid !== this.docUid) return;
          this.arenderUrl.set(null);
        },
      });
  }

  /**
   * Blob xpath for Document.ARenderGetPreviewerUrl so annotations align with the main blob (file:content).
   */
  private blobXPathForARender(doc: NuxeoDocument): string | null {
    if (doc.properties['note:note'] !== undefined && doc.properties['note:note'] !== null) {
      return null;
    }
    const fc = doc.properties['file:content'] as Record<string, unknown> | null;
    if (!fc || !(fc['digest'] ?? fc['data'])) {
      const pics = doc.properties['picture:views'] as unknown[] | undefined;
      if (!pics?.length) return null;
    }
    return 'file:content';
  }

  // ── Panel Sub-Tab Switching ──

  switchPanelSubTab(tab: 'properties' | 'comments' | 'activity'): void {
    this.panelSubTab.set(tab);
    if (tab === 'comments' && !this.commentsLoaded) {
      this.loadComments();
    }
    if (tab === 'activity' && !this.panelActivityLoaded) {
      this.loadPanelActivity();
    }
  }

  // ── Comments ──

  loadComments(): void {
    if (!this.docUid) return;
    this.commentsLoading.set(true);
    this.detailService.getAllComments(this.docUid).subscribe({
      next: (res) => {
        const all = (res.entries ?? []).map((e) => ({
          id: e.uid,
          parentId: (e.properties['comment:parentId'] as string) ?? this.docUid,
          text: (e.properties['comment:text'] as string) ?? '',
          author: (e.properties['comment:author'] as string) ?? '',
          creationDate:
            (e.properties['comment:creationDate'] as string) ??
            (e.properties['dc:created'] as string) ??
            '',
          modificationDate:
            (e.properties['comment:modificationDate'] as string) ??
            (e.properties['dc:modified'] as string) ??
            '',
        }));
        const topLevel = all.filter((c) => c.parentId === this.docUid);
        const replies: Record<string, NuxeoComment[]> = {};
        for (const c of all) {
          if (c.parentId !== this.docUid) {
            if (!replies[c.parentId]) replies[c.parentId] = [];
            replies[c.parentId].push(c);
          }
        }
        this.comments.set(topLevel);
        this.repliesMap.set(replies);
        this.commentsLoading.set(false);
        this.commentsLoaded = true;
      },
      error: () => this.commentsLoading.set(false),
    });
  }

  submitComment(): void {
    const text = this.newCommentText().trim();
    if (!text || this.commentSaving()) return;
    this.commentSaving.set(true);
    this.detailService.createComment(this.docUid, text).subscribe({
      next: (comment) => {
        this.comments.update((list) => [comment, ...list]);
        this.newCommentText.set('');
        this.commentSaving.set(false);
      },
      error: () => {
        this.commentSaving.set(false);
        this.toast('Failed to add comment');
      },
    });
  }

  cancelNewComment(): void {
    this.newCommentText.set('');
  }

  startEditComment(comment: NuxeoComment): void {
    this.editingCommentId.set(comment.id);
    this.editingCommentText.set(comment.text);
  }

  cancelEditComment(): void {
    this.editingCommentId.set(null);
    this.editingCommentText.set('');
  }

  saveEditComment(): void {
    const id = this.editingCommentId();
    const text = this.editingCommentText().trim();
    if (!id || !text || this.commentSaving()) return;
    this.commentSaving.set(true);
    this.detailService.updateComment(this.docUid, id, text).subscribe({
      next: (updated) => {
        this.comments.update((list) => list.map((c) => (c.id === id ? updated : c)));
        this.editingCommentId.set(null);
        this.editingCommentText.set('');
        this.commentSaving.set(false);
      },
      error: () => {
        this.commentSaving.set(false);
        this.toast('Failed to update comment');
      },
    });
  }

  deleteComment(comment: NuxeoComment): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Delete Comment',
        message: 'Delete this comment?',
        confirmLabel: 'Delete',
      } as ConfirmDialogData,
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.detailService.deleteComment(this.docUid, comment.id).subscribe({
        next: () => {
          this.comments.update((list) => list.filter((c) => c.id !== comment.id));
          this.toast('Comment deleted');
        },
        error: () => this.toast('Failed to delete comment'),
      });
    });
  }

  startReply(commentId: string): void {
    this.replyingToId.set(commentId);
    this.replyText.set('');
  }

  cancelReply(): void {
    this.replyingToId.set(null);
    this.replyText.set('');
  }

  submitReply(commentId: string): void {
    const text = this.replyText().trim();
    if (!text || this.commentSaving()) return;
    this.commentSaving.set(true);
    this.detailService.createReply(this.docUid, commentId, text).subscribe({
      next: (reply) => {
        const correctedReply = { ...reply, parentId: commentId };
        this.repliesMap.update((m) => ({
          ...m,
          [commentId]: [...(m[commentId] ?? []), correctedReply],
        }));
        this.replyingToId.set(null);
        this.replyText.set('');
        this.commentSaving.set(false);
      },
      error: () => {
        this.commentSaving.set(false);
        this.toast('Failed to add reply');
      },
    });
  }

  replyCount(commentId: string): number {
    return (this.repliesMap()[commentId] ?? []).length;
  }

  lastReplyTime(commentId: string): string {
    const replies = this.repliesMap()[commentId];
    if (!replies?.length) return '';
    return this.relativeTime(replies[replies.length - 1].creationDate);
  }

  isCommentEdited(comment: NuxeoComment): boolean {
    return !!comment.modificationDate && comment.modificationDate !== comment.creationDate;
  }

  relativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return 'a few seconds ago';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`;
    return new Date(dateStr).toLocaleDateString();
  }

  // ── Panel Activity ──

  loadPanelActivity(): void {
    if (!this.docUid) return;
    this.panelActivityLoading.set(true);
    this.detailService.getAuditLog(this.docUid, 20, 0).subscribe({
      next: (res) => {
        this.panelActivity.set(res.entries);
        this.panelActivityLoading.set(false);
        this.panelActivityLoaded = true;
      },
      error: () => this.panelActivityLoading.set(false),
    });
  }

  activityLabel(eventId: string): string {
    const labels: Record<string, string> = {
      documentCreated: 'created the document',
      documentModified: 'updated the document',
      documentMoved: 'moved the document',
      documentRemoved: 'removed the document',
      documentLocked: 'locked the document',
      documentUnlocked: 'unlocked the document',
      documentSecurityUpdated: 'updated security settings',
      lifecycle_transition_event: 'changed document state',
      download: 'downloaded the document',
      loginSuccess: 'logged in',
      addedToCollection: 'added to collection',
      removedFromCollection: 'removed from collection',
      documentPublished: 'published the document',
      documentProxyPublished: 'published the document',
      'workflow.start': 'started a review',
      'workflow.complete': 'completed a review',
      documentCheckedIn: 'checked in the document',
      documentCheckedOut: 'checked out the document',
      documentRestored: 'restored the document',
      'activity.deleted': 'activity.deleted',
    };
    return (
      labels[eventId] ??
      eventId
        .replace(/([A-Z])/g, ' $1')
        .toLowerCase()
        .trim()
    );
  }

  // ── Versioning ──

  openCreateVersionDialog(): void {
    if (!this.requireWritePermission()) return;
    const ref = this.dialog.open(CreateVersionDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      panelClass: 'create-version-dialog-panel',
      data: {
        documentUid: this.docUid,
        documentTitle: this.doc()?.title ?? '',
        currentMajor: this.currentMajor(),
        currentMinor: this.currentMinor(),
      } satisfies CreateVersionDialogData,
    });

    ref.afterClosed().subscribe((result) => {
      if (result) {
        this.loadDocument(this.docUid);
        this.versionsLoaded = false;
        this.loadVersions();
      }
    });
  }

  toggleVersionDropdown(): void {
    if (!this.versionsLoaded) {
      this.loadVersions();
    }
    this.versionDropdownOpen.update((v) => !v);
  }

  loadVersions(): void {
    if (!this.docUid) return;
    this.versionsLoading.set(true);
    this.detailService.getVersions(this.docUid).subscribe({
      next: (res) => {
        this.versions.set(res.entries ?? []);
        this.versionsLoading.set(false);
        this.versionsLoaded = true;
      },
      error: () => this.versionsLoading.set(false),
    });
  }

  versionString(doc: NuxeoDocument): string {
    const major = Number(doc.properties['uid:major_version'] ?? 0);
    const minor = Number(doc.properties['uid:minor_version'] ?? 0);
    return `${major}.${minor}`;
  }

  restoreVersion(version: NuxeoDocument): void {
    if (!this.requireWritePermission()) return;
    this.versionDropdownOpen.set(false);
    this.actionInProgress.set('restore');
    this.detailService.restoreVersion(version.uid).subscribe({
      next: () => {
        this.actionInProgress.set(null);
        this.toast(`Restored to version ${this.versionString(version)}`);
        this.loadDocument(this.docUid);
        this.versionsLoaded = false;
      },
      error: () => {
        this.actionInProgress.set(null);
        this.toast('Failed to restore version');
      },
    });
  }

  // ── Publish ──

  openPublishDialog(): void {
    if (!this.requireWritePermission()) return;
    const openDialog = (versions: NuxeoDocument[]) => {
      const renditions = this.buildRenditionOptions();
      const ref = this.dialog.open(PublishDialogComponent, {
        width: '620px',
        panelClass: 'publish-dialog-panel',
        data: {
          documentUid: this.docUid,
          documentTitle: this.doc()?.title ?? '',
          versionLabel: this.versionLabel(),
          renditions,
          versions,
        } satisfies PublishDialogData,
      });

      ref.afterClosed().subscribe((published) => {
        if (published) {
          this.publishTabLoaded = false;
        }
      });
    };

    if (this.versionsLoaded) {
      openDialog(this.versions());
    } else {
      this.detailService.getVersions(this.docUid).subscribe({
        next: (res) => {
          const entries = res.entries ?? [];
          this.versions.set(entries);
          this.versionsLoaded = true;
          openDialog(entries);
        },
        error: () => openDialog([]),
      });
    }
  }

  private buildRenditionOptions(): { name: string; label: string }[] {
    const d = this.doc();
    const rends = d?.contextParameters?.['renditions'] as Array<{ name: string }> | undefined;
    const labelMap: Record<string, string> = {
      thumbnail: 'Thumbnail',
      pdf: 'PDF',
      zipExport: 'ZIP Export',
      xmlExport: 'XML Export',
    };
    if (!rends) return Object.entries(labelMap).map(([name, label]) => ({ name, label }));
    return rends.map((r) => ({ name: r.name, label: labelMap[r.name] ?? r.name }));
  }

  previewAttachment(att: { name: string; url: string; mimeType: string }): void {
    this.http.get(att.url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const objectUrl = URL.createObjectURL(blob);
        const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
        this.dialog.open(AttachmentPreviewDialogComponent, {
          width: '90vw',
          maxWidth: '1200px',
          maxHeight: '95vh',
          panelClass: 'preview-dialog-panel',
          data: { name: att.name, mimeType: att.mimeType, blobUrl: safeUrl, rawUrl: objectUrl },
        });
      },
      error: () => this.toast('Failed to load preview'),
    });
  }

  openDriveDialog(): void {
    const doc = this.doc();
    const fileContent = doc?.properties?.['file:content'] as {
      name?: string;
      data?: string;
    } | null;
    // Derive parent folder path so Drive opens in the document's containing folder
    const docPath = doc?.path ?? '';
    const parentPath = docPath.includes('/') ? docPath.split('/').slice(0, -1).join('/') : '/';
    const data: DriveDialogData = {
      docUid: doc?.uid ?? this.docUid,
      filename: fileContent?.name ?? doc?.title ?? '',
      blobUrl: fileContent?.data ?? '',
      docPath: parentPath || '/',
    };
    this.dialog.open(DriveDialogComponent, { width: '500px', data });
  }

  openAddPermissionDialog(): void {
    const data: AddPermissionDialogData = { documentUid: this.docUid };
    const ref = this.dialog.open(AddPermissionDialogComponent, {
      width: '540px',
      data,
      autoFocus: false,
    });
    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((saved: boolean) => {
        if (saved) this.loadDocument(this.docUid);
      });
  }

  editPermission(ace: NuxeoAce): void {
    const ref = this.dialog.open(UpdatePermissionDialogComponent, {
      width: '520px',
      data: { documentUid: this.docUid, ace } satisfies UpdatePermissionDialogData,
      autoFocus: false,
    });
    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((updated: boolean | undefined) => {
        if (updated) {
          this.toast('Permission updated');
          this.loadDocument(this.docUid);
        }
      });
  }

  deletePermission(ace: NuxeoAce): void {
    const ref = this.dialog.open(DeletePermissionDialogComponent, {
      width: '560px',
      data: {
        documentUid: this.docUid,
        ace,
        permissionLabel: this.permissionLabel(ace.permission),
        timeFrameLabel: this.aceTimeFrame(ace),
      } satisfies DeletePermissionDialogData,
      autoFocus: false,
    });
    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((deleted: boolean | undefined) => {
        if (deleted) {
          this.toast('Permission deleted');
          this.loadDocument(this.docUid);
        }
      });
  }

  editExternalPermission(ace: NuxeoAce): void {
    const ref = this.dialog.open(UpdatePermissionDialogComponent, {
      width: '520px',
      data: {
        documentUid: this.docUid,
        ace,
        isExternal: true,
      } satisfies UpdatePermissionDialogData,
      autoFocus: false,
    });
    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((updated: boolean | undefined) => {
        if (updated) {
          this.toast('Permission updated');
          this.loadDocument(this.docUid);
        }
      });
  }

  sendPermissionNotification(ace: NuxeoAce): void {
    if (this.actionInProgress()) return;
    this.actionInProgress.set('notify-' + ace.id);
    this.detailService
      .sendNotificationEmailForPermission(this.docUid, ace.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.actionInProgress.set(null);
          this.toast('Notification email sent');
        },
        error: () => {
          this.actionInProgress.set(null);
          this.toast('Failed to send notification');
        },
      });
  }

  toggleInheritanceBlock(): void {
    if (this.actionInProgress()) return;
    const blocked = this.isInheritanceBlocked();
    this.actionInProgress.set('block-inheritance');
    const op = blocked
      ? this.detailService.unblockPermissionInheritance(this.docUid)
      : this.detailService.blockPermissionInheritance(this.docUid);
    op.subscribe({
      next: () => {
        this.actionInProgress.set(null);
        this.toast(blocked ? 'Permission inheritance unblocked' : 'Permission inheritance blocked');
        this.loadDocument(this.docUid);
      },
      error: () => {
        this.actionInProgress.set(null);
        this.toast('Failed to update permission inheritance');
      },
    });
  }

  openExternalPermissionDialog(): void {
    const data: ShareExternalDialogData = { documentUid: this.docUid };
    const ref = this.dialog.open(ShareExternalDialogComponent, {
      width: '540px',
      data,
      autoFocus: false,
    });
    ref.afterClosed().subscribe((saved: boolean) => {
      if (saved) this.loadDocument(this.docUid);
    });
  }

  uploadAttachment(event: Event): void {
    if (!this.requireWritePermission()) {
      (event.target as HTMLInputElement).value = '';
      return;
    }
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.actionInProgress.set('upload');

    this.detailService.uploadAttachment(this.docUid, file).subscribe({
      next: () => {
        this.actionInProgress.set(null);
        this.toast(`"${file.name}" attached`);
        this.loadDocument(this.docUid);
      },
      error: () => {
        this.actionInProgress.set(null);
        this.toast('Failed to upload attachment');
      },
    });
    input.value = '';
  }

  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  downloadAttachment(url: string, name: string): void {
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.target = '_blank';
    a.click();
  }

  openReplaceDialog(att: { index: number; name: string }): void {
    if (!this.requireWritePermission()) return;
    const ref = this.dialog.open(ReplaceAttachmentDialogComponent, {
      width: '480px',
      data: { fileName: att.name },
    });
    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((file: File | null) => {
        if (!file) return;
        this.actionInProgress.set('replace');
        this.detailService
          .replaceAttachment(this.docUid, att.index, file)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.actionInProgress.set(null);
              this.toast(`"${att.name}" replaced`);
              this.loadDocument(this.docUid);
            },
            error: () => {
              this.actionInProgress.set(null);
              this.toast('Failed to replace attachment');
            },
          });
      });
  }

  openRemoveDialog(att: { index: number; name: string }): void {
    if (!this.requireWritePermission()) return;
    const ref = this.dialog.open(RemoveAttachmentDialogComponent, { width: '400px' });
    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed: boolean) => {
        if (!confirmed) return;
        this.actionInProgress.set('remove');
        this.detailService
          .removeAttachment(this.docUid, att.index)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: () => {
              this.actionInProgress.set(null);
              this.toast(`"${att.name}" removed`);
              this.loadDocument(this.docUid);
            },
            error: () => {
              this.actionInProgress.set(null);
              this.toast('Failed to remove attachment');
            },
          });
      });
  }

  closePropertiesPanel(): void {
    this.propertiesPanelOpen.set(false);
  }

  openPropertiesPanel(): void {
    this.propertiesPanelOpen.set(true);
  }
}
