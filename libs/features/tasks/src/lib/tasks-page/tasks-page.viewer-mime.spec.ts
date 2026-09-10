import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, provideRouter, withDisabledInitialNavigation } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of, type Observable } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  CURRENT_USERNAME,
  DocumentService,
  NuxeoApiBase,
  TaskService,
  UserService,
  WorkflowService,
  type NuxeoDocument,
} from '@nuxeo-satori/platform/nuxeo-client';

import { TasksPageComponent } from './tasks-page.component';

/**
 * Covers one thing: which MIME type the tasks preview hands the document viewer.
 *
 * This exists because of a regression, not for coverage. `loadPreviewBlob` fetches the real blob only
 * for image/audio/video; for everything else it fetches `@rendition/thumbnail`, which is an image. The
 * template passed `mimeType()` — the *document's* metadata type — so a PDF task document told the
 * viewer `application/pdf` while the blob behind the URL was a PNG. That was invisible until the
 * viewer started checking the served type against the claim, at which point it correctly refused to
 * render anything and the preview went blank.
 *
 * The template is replaced: none of this reads the DOM, and rendering the real one drags in the
 * viewer, Material datepickers and Satori breadcrumbs for no benefit.
 */
describe('TasksPageComponent — the MIME type handed to the viewer', () => {
  let fixture: ComponentFixture<TasksPageComponent>;
  let component: TasksPageComponent;

  const emptyList = { entries: [] as NuxeoDocument[] };

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [TasksPageComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([], withDisabledInitialNavigation()),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: new Map() }, params: of({}) },
        },
        {
          provide: TaskService,
          useValue: {
            getTasks: vi.fn((): Observable<unknown> => of(emptyList)),
            getTask: vi.fn((): Observable<unknown> => of(null)),
          },
        },
        { provide: UserService, useValue: { searchUsers: vi.fn(() => of([])) } },
        { provide: WorkflowService, useValue: { getWorkflows: vi.fn(() => of(emptyList)) } },
        { provide: DocumentService, useValue: { getDocument: vi.fn(() => of(null)) } },
        { provide: NuxeoApiBase, useValue: { apiUrl: (p: string) => p } },
        { provide: HttpClient, useValue: { get: vi.fn(() => of(new Blob())) } },
        { provide: CURRENT_USERNAME, useValue: () => 'Administrator' },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    })
      .overrideComponent(TasksPageComponent, { set: { imports: [], template: '<div></div>' } })
      .compileComponents();

    fixture = TestBed.createComponent(TasksPageComponent);
    component = fixture.componentInstance;
  });

  /** Puts a document with the given metadata MIME type in front of the viewer. */
  function withDocumentMime(mime: string): void {
    component.targetDoc.set({
      uid: 'doc-1',
      title: 'report.pdf',
      properties: { 'file:content': { 'mime-type': mime, name: 'report.pdf' } },
    } as unknown as NuxeoDocument);
  }

  it('describes the blob once one has arrived, not the document', () => {
    withDocumentMime('application/pdf');
    // What `@rendition/thumbnail` actually returns for a PDF.
    component.previewBlobType.set('image/png');

    expect(component.viewerMimeType()).toBe('image/png');
    // The regression: returning the metadata type here made the viewer see a PDF claim against a
    // non-PDF blob, and refuse to render.
    expect(component.viewerMimeType()).not.toBe('application/pdf');
  });

  it('falls back to the document type before any blob has arrived', () => {
    withDocumentMime('application/pdf');
    component.previewBlobType.set('');

    expect(component.viewerMimeType()).toBe('application/pdf');
  });

  it('agrees with the metadata type when the real blob was fetched', () => {
    // image/audio/video take the `@blob/file:content` path, so the two types coincide — the change
    // must not perturb the case that was already correct.
    withDocumentMime('image/jpeg');
    component.previewBlobType.set('image/jpeg');

    expect(component.viewerMimeType()).toBe('image/jpeg');
  });
});
