import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideExperimentalZonelessChangeDetection, signal } from '@angular/core';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
  withDisabledInitialNavigation,
} from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DocumentDetailComponent } from './document-detail';
import {
  ARenderService,
  BrowseService,
  CURRENT_USERNAME,
  DirectoryService,
  DocumentDetailService,
  mailSendFailureMessage,
  NuxeoApiBase,
  PERMISSION_DENIED_MESSAGE,
  type NuxeoComment,
  type NuxeoDocument,
  TagService,
  TaskService,
  WorkflowService,
} from '@agentic-ui/shared/nuxeo-client';
import {
  AiChatService,
  AiFeatureFlagService,
  AiGatewayService,
} from '@agentic-ui/shared/ai-client';
import { KeClientService, type KeEnrichmentResult } from '@agentic-ui/shared/ke-client';

const STUB_DOC: NuxeoDocument = {
  uid: 'doc-uid-1',
  title: 'stub',
  type: 'File',
  path: '/stub',
  lastModified: '2026-01-01T00:00:00Z',
  properties: {},
};

const NOTE_DOC: NuxeoDocument = {
  uid: 'note-uid-1',
  title: 'My Note',
  type: 'Note',
  path: '/default-domain/workspaces/ws/my-note',
  lastModified: '2026-01-01T00:00:00Z',
  properties: {
    'note:note': '<p>hello</p>',
    'note:mime_type': 'text/html',
  },
  contextParameters: {
    permissions: ['Read', 'Write'],
  },
};

const mockBrowseService = {
  updateDocument: vi.fn((): Observable<NuxeoDocument> => of(STUB_DOC)),
};

const keResult = (result: string): KeEnrichmentResult =>
  ({ textClassification: { result } }) as KeEnrichmentResult;

const mockDocumentDetailService = {
  // Never-emitting Observable: keeps loadDocument's subscription "in-flight" so
  // the chain of follow-up calls (loadPublicationCount, etc.) never fires and we
  // do not have to stub every downstream service for these focused tests.
  getFullDocument: (): Observable<NuxeoDocument> => new Observable<NuxeoDocument>(),
  fetchBlob: () => of(new Blob(['stub'], { type: 'application/pdf' })),
  sendNotificationEmailForPermission: vi.fn(() => of({ uid: 'doc-uid-1' })),
  updateComment: vi.fn(),
  deleteComment: vi.fn(),
};

const NATURE_ENTRIES = [
  {
    id: 'article',
    label: 'label.directories.nature.article',
    displayLabel: 'Article',
    ordering: 0,
    obsolete: 0,
    directoryName: 'nature',
  },
  {
    id: 'contract',
    label: 'label.directories.nature.contract',
    displayLabel: 'Contract',
    ordering: 0,
    obsolete: 0,
    directoryName: 'nature',
  },
];

const mockDirectoryService = {
  getEventTypes: () => of([]),
  getEventCategories: () => of([]),
  getEntries: (name: string) => (name === 'nature' ? of(NATURE_ENTRIES) : of([])),
  getAllL10nEntries: () => of([]),
};

const mockTaskService = {
  getDocumentTasks: () => of([]),
};

const mockWorkflowService = {
  getDocumentWorkflows: () => of([]),
};

const mockARenderService = {
  isAvailable: () => of(false),
  getPreviewerUrl: () => of(null),
};

const mockTagService = {
  addTag: () => of(null),
};

const mockAiGatewayService = {
  summarize: () => of(null),
  suggestTags: () => of({ tags: [] }),
  classify: () => of(null),
  findSimilar: () => of({ documents: [] }),
  analyzeSentiment: () => of({ sentiments: [], threadSummary: null }),
};

const mockAiChatService = {
  openPanel: () => undefined,
};

const mockAiFeatureFlagService = {
  aiEnabled: signal(false),
};

const mockNuxeoApiBase = {
  nxqlSearch: () => of({ entries: [] }),
};

describe('DocumentDetailComponent', () => {
  let component: DocumentDetailComponent;
  let fixture: ComponentFixture<DocumentDetailComponent>;
  let snackBarOpenSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    snackBarOpenSpy = vi.fn();
    mockBrowseService.updateDocument.mockReturnValue(of(STUB_DOC));
    await TestBed.configureTestingModule({
      imports: [DocumentDetailComponent],
      providers: [
        provideExperimentalZonelessChangeDetection(),
        provideRouter([], withDisabledInitialNavigation()),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ uid: 'doc-uid-1' })),
            queryParamMap: of(convertToParamMap({})),
            snapshot: { queryParamMap: convertToParamMap({}) },
          },
        },
        { provide: DocumentDetailService, useValue: mockDocumentDetailService },
        { provide: BrowseService, useValue: mockBrowseService },
        { provide: DirectoryService, useValue: mockDirectoryService },
        {
          provide: KeClientService,
          useValue: { enrich: (): Observable<KeEnrichmentResult> => of(keResult('')) },
        },
        { provide: TaskService, useValue: mockTaskService },
        { provide: WorkflowService, useValue: mockWorkflowService },
        { provide: ARenderService, useValue: mockARenderService },
        { provide: TagService, useValue: mockTagService },
        { provide: AiGatewayService, useValue: mockAiGatewayService },
        { provide: AiChatService, useValue: mockAiChatService },
        { provide: AiFeatureFlagService, useValue: mockAiFeatureFlagService },
        { provide: NuxeoApiBase, useValue: mockNuxeoApiBase },
        { provide: CURRENT_USERNAME, useValue: () => 'tester' },
        { provide: MatSnackBar, useValue: { open: snackBarOpenSpy } },
      ],
    })
      .overrideComponent(DocumentDetailComponent, {
        set: { imports: [], template: '<div></div>' },
      })
      .compileComponents();

    fixture = TestBed.createComponent(DocumentDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('sendPermissionNotification (NXSAT-159)', () => {
    const ace = {
      id: 'ace-1',
      username: 'user-readonly01',
      externalUser: false,
      permission: 'Read',
      granted: true,
      creator: null,
      begin: null,
      end: null,
      status: 'effective' as const,
    };

    it('shows success toast when resend succeeds', () => {
      component.sendPermissionNotification(ace);

      expect(mockDocumentDetailService.sendNotificationEmailForPermission).toHaveBeenCalledWith(
        'doc-uid-1',
        'ace-1',
      );
      expect(snackBarOpenSpy).toHaveBeenCalledWith('Notification email sent', 'OK', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    });

    it('shows SMTP guidance when resend fails due to mail', () => {
      mockDocumentDetailService.sendNotificationEmailForPermission.mockReturnValue(
        throwError(() => ({ error: { message: 'An error occurred while sending a mail' } })),
      );

      component.sendPermissionNotification(ace);

      expect(snackBarOpenSpy).toHaveBeenCalledWith(mailSendFailureMessage('send'), 'OK', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    });
  });

  describe('indexing properties File Name (NXSAT-190)', () => {
    it('hides File Name for Note documents without a file blob', () => {
      component.doc.set(NOTE_DOC);

      expect(component.hasPersistedMainBlob()).toBe(false);
    });

    it('shows File Name when file:content has a persisted blob', () => {
      component.doc.set({
        ...STUB_DOC,
        title: 'File_loremIpsum-5.pdf',
        properties: {
          'file:content': {
            name: 'File_loremIpsum-5.pdf',
            length: '1024',
            digest: 'abc123',
          },
        },
      });

      expect(component.hasPersistedMainBlob()).toBe(true);
      expect(component.fileName()).toBe('File_loremIpsum-5.pdf');
    });
  });

  describe('saveNote (NXSAT-174)', () => {
    it('preserves write permissions when update response omits the permissions enricher', async () => {
      component.doc.set(NOTE_DOC);
      mockBrowseService.updateDocument.mockReturnValue(
        of({
          ...NOTE_DOC,
          properties: {
            'note:note': '<p>updated</p>',
            'note:mime_type': 'text/html',
          },
          contextParameters: {},
        }),
      );

      component.saveNote('<p>updated</p>');
      await fixture.whenStable();

      expect(component.canWriteDoc()).toBe(true);
      expect(component.doc()?.contextParameters?.['permissions']).toEqual(['Read', 'Write']);
    });
  });

  describe('text classification', () => {
    // docUid is set by the route paramMap mock; no private-field access needed.

    it('refuses to write the "not_from_provided_classes" sentinel to dc:nature', async () => {
      const keClient = TestBed.inject(KeClientService);
      const browse = TestBed.inject(BrowseService);
      vi.spyOn(keClient, 'enrich').mockReturnValue(of(keResult('not_from_provided_classes')));
      const updateSpy = vi.spyOn(browse, 'updateDocument');

      component.runTextClassification();
      await fixture.whenStable();

      expect(updateSpy).not.toHaveBeenCalled();
      expect(component.keError()).toMatch(/could not match this document/i);
    });

    it('refuses to write a category that is not in the nature vocabulary', async () => {
      const keClient = TestBed.inject(KeClientService);
      const browse = TestBed.inject(BrowseService);
      vi.spyOn(keClient, 'enrich').mockReturnValue(of(keResult('Hallucinated')));
      const updateSpy = vi.spyOn(browse, 'updateDocument');

      component.runTextClassification();
      await fixture.whenStable();

      expect(updateSpy).not.toHaveBeenCalled();
      expect(component.keError()).toMatch(/"Hallucinated".*not one of the \d+ document categories/);
    });

    it('writes the vocabulary id when KE returns a valid display label', async () => {
      const keClient = TestBed.inject(KeClientService);
      const browse = TestBed.inject(BrowseService);
      vi.spyOn(keClient, 'enrich').mockReturnValue(of(keResult('Contract')));
      const updateSpy = vi.spyOn(browse, 'updateDocument').mockReturnValue(of(STUB_DOC));

      component.runTextClassification();
      await fixture.whenStable();

      expect(updateSpy).toHaveBeenCalledWith('doc-uid-1', { 'dc:nature': 'contract' });
      expect(component.keError()).toBeNull();
    });

    it('aborts classification (no enrich call) when the nature vocabulary is empty', async () => {
      const keClient = TestBed.inject(KeClientService);
      const enrichSpy = vi.spyOn(keClient, 'enrich');
      component.natureVocabulary.set([]);

      component.runTextClassification();
      await fixture.whenStable();

      expect(enrichSpy).not.toHaveBeenCalled();
      expect(component.keError()).toMatch(/nature.*vocabulary failed to load/i);
    });
  });

  describe('write permission guards (NXSAT-163)', () => {
    const readOnlyDoc: NuxeoDocument = {
      ...STUB_DOC,
      contextParameters: { permissions: ['Read'] },
    };

    it('canWriteDoc is false for read-only users', () => {
      component.doc.set(readOnlyDoc);
      expect(component.canWriteDoc()).toBe(false);
    });

    it('saveNote is blocked for read-only users', () => {
      const browse = TestBed.inject(BrowseService);
      const updateSpy = vi.spyOn(browse, 'updateDocument');
      component.doc.set({ ...readOnlyDoc, type: 'Note' });

      component.saveNote('updated body');

      expect(updateSpy).not.toHaveBeenCalled();
      expect(snackBarOpenSpy).toHaveBeenCalledWith(
        PERMISSION_DENIED_MESSAGE,
        'OK',
        expect.objectContaining({ duration: 3000 }),
      );
    });

    it('openCreateVersionDialog is blocked for read-only users', () => {
      component.doc.set(readOnlyDoc);
      const dialogSpy = vi.spyOn(component['dialog'], 'open');

      component.openCreateVersionDialog();

      expect(dialogSpy).not.toHaveBeenCalled();
      expect(snackBarOpenSpy).toHaveBeenCalledWith(
        PERMISSION_DENIED_MESSAGE,
        'OK',
        expect.objectContaining({ duration: 3000 }),
      );
    });

    it('submitComment is blocked for read-only users', () => {
      component.doc.set(readOnlyDoc);
      component.newCommentText.set('hello');

      component.submitComment();

      expect(snackBarOpenSpy).toHaveBeenCalledWith(
        PERMISSION_DENIED_MESSAGE,
        'OK',
        expect.objectContaining({ duration: 3000 }),
      );
    });
  });

  describe('comment replies (NXSAT-184)', () => {
    const writableDoc: NuxeoDocument = {
      ...STUB_DOC,
      contextParameters: { permissions: ['Read', 'Write'] },
    };

    const parentComment: NuxeoComment = {
      id: 'comment-1',
      parentId: 'doc-uid-1',
      text: 'Parent comment',
      author: 'tester',
      creationDate: '2026-01-01T00:00:00Z',
      modificationDate: '2026-01-01T00:00:00Z',
    };

    const reply: NuxeoComment = {
      id: 'reply-1',
      parentId: 'comment-1',
      text: 'Original reply',
      author: 'tester',
      creationDate: '2026-01-01T01:00:00Z',
      modificationDate: '2026-01-01T01:00:00Z',
    };

    beforeEach(() => {
      component.doc.set(writableDoc);
      component.comments.set([parentComment]);
      component.repliesMap.set({ 'comment-1': [reply] });
      vi.spyOn(component['dialog'], 'open').mockReturnValue({
        afterClosed: () => of(true),
      } as never);
    });

    it('saveEditComment updates a reply in repliesMap', async () => {
      const updatedReply: NuxeoComment = {
        ...reply,
        text: 'Edited reply',
        modificationDate: '2026-01-02T00:00:00Z',
      };
      mockDocumentDetailService.updateComment.mockReturnValue(of(updatedReply));
      component.editingCommentId.set('reply-1');
      component.editingCommentText.set('Edited reply');

      component.saveEditComment();
      await fixture.whenStable();

      expect(mockDocumentDetailService.updateComment).toHaveBeenCalledWith(
        'doc-uid-1',
        'reply-1',
        'Edited reply',
      );
      expect(component.repliesMap()['comment-1']).toEqual([updatedReply]);
      expect(component.editingCommentId()).toBeNull();
    });

    it('deleteComment removes a reply from repliesMap', async () => {
      mockDocumentDetailService.deleteComment.mockReturnValue(of(void 0));

      component.deleteComment(reply, 'comment-1');
      await fixture.whenStable();

      expect(mockDocumentDetailService.deleteComment).toHaveBeenCalledWith('doc-uid-1', 'reply-1');
      expect(component.repliesMap()['comment-1']).toEqual([]);
      expect(snackBarOpenSpy).toHaveBeenCalledWith('Reply deleted', 'OK', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
      });
    });
  });
});
