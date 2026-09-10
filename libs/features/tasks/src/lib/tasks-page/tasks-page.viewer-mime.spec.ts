import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, provideRouter, withDisabledInitialNavigation } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
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
  type NuxeoTask,
} from '@nuxeo-satori/platform/nuxeo-client';
import { DocumentViewerComponent } from '@nuxeo-satori/platform/ui';

import { TasksPageComponent } from './tasks-page.component';

/**
 * Asserts which MIME type the tasks preview actually *binds* to the document viewer.
 *
 * ## Why this renders the real template
 *
 * The first version of this file replaced the template and called `viewerMimeType()` directly. Review
 * pointed out that it therefore could not detect the regression its own docblock claimed to cover, and
 * that was correct: reverting `[mimeType]="viewerMimeType()"` to `[mimeType]="mimeType()"` in
 * `tasks-page.component.html` left all three assertions green. A test that cannot fail when the defect
 * returns is not evidence — the same trap `document-viewer.dispatch.spec.ts` fell into with a fake safe
 * value, recorded in this PR's own description.
 *
 * So the real template renders and the assertion reads `mimeType()` off the real
 * `DocumentViewerComponent` instance. The binding itself is now the thing under test.
 *
 * ## The regression
 *
 * `loadPreviewBlob` fetches the real blob only for image/audio/video; everything else gets
 * `@rendition/thumbnail`, which is an image. Binding the document's metadata type therefore told the
 * viewer `application/pdf` while the blob was a PNG — and once the viewer began checking the served
 * type against the claim it refused to render, blanking the preview.
 */
/**
 * jsdom has no `ResizeObserver`, and `SatBreadcrumbs` constructs one. Rendering the real template
 * therefore needs this stub; without it the component throws during construction and every assertion
 * fails for an environment reason rather than a behavioural one.
 */
class ResizeObserverStub {
  // Intentionally inert: nothing here observes layout, and a stub that recorded calls would imply
  // this file asserts something about resizing. `no-empty-function` is satisfied with a comment.
  observe(): void {
    /* no-op */
  }
  unobserve(): void {
    /* no-op */
  }
  disconnect(): void {
    /* no-op */
  }
}

describe('TasksPageComponent — the MIME type bound to the viewer', () => {
  let fixture: ComponentFixture<TasksPageComponent>;
  let component: TasksPageComponent;

  const emptyList = { entries: [] as NuxeoDocument[] };
  /** What `@rendition/thumbnail` returns for a non-media document: an image, not the document. */
  const thumbnailBlob = new Blob(['png-bytes'], { type: 'image/png' });

  beforeEach(async () => {
    vi.clearAllMocks();
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver ??= ResizeObserverStub;

    await TestBed.configureTestingModule({
      // `TranslateModule` is bootstrapped by the app, not the feature: the Satori breadcrumbs inside
      // this template inject `TranslateService`. Same pattern as `document-detail-slots.spec.ts`.
      imports: [TasksPageComponent, NoopAnimationsModule, TranslateModule.forRoot()],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([], withDisabledInitialNavigation()),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: new Map() }, params: of({}) },
        },
        {
          // Every method the component reaches for, because rendering the real template exercises
          // more of it than a stubbed one did.
          provide: TaskService,
          useValue: {
            getUserTasks: vi.fn((): Observable<unknown> => of(emptyList)),
            getTask: vi.fn((): Observable<unknown> => of(null)),
            notifyTasksChanged: vi.fn(),
          },
        },
        {
          provide: UserService,
          useValue: {
            searchUsers: vi.fn((): Observable<unknown[]> => of([])),
            searchGroups: vi.fn((): Observable<unknown[]> => of([])),
          },
        },
        {
          provide: WorkflowService,
          useValue: {
            getWorkflowGraph: vi.fn((): Observable<unknown> => of({ nodes: [], transitions: [] })),
            cancelWorkflow: vi.fn((): Observable<void> => of(undefined)),
          },
        },
        { provide: DocumentService, useValue: { getDocument: vi.fn(() => of(null)) } },
        { provide: NuxeoApiBase, useValue: { apiUrl: (p: string) => p } },
        { provide: HttpClient, useValue: { get: vi.fn(() => of(thumbnailBlob)) } },
        { provide: CURRENT_USERNAME, useValue: () => 'Administrator' },
        { provide: MatSnackBar, useValue: { open: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TasksPageComponent);
    component = fixture.componentInstance;
  });

  /** Puts a document with the given metadata MIME type in front of the viewer and renders. */
  function renderWith(metadataMime: string, servedType: string | null): void {
    // A selected task is required, not just a target document: the preview panel lives in the `@else`
    // of `@if (!hasSelection())`, and `hasSelection()` is `selectedTask() !== null`. Without this the
    // template renders the "Select a task" placeholder and nothing is asserted.
    component.selectedTask.set({
      id: 'task-1',
      name: 'Review',
      workflowInstanceId: 'wf-1',
      targetDocumentIds: [{ id: 'doc-1' }],
    } as unknown as NuxeoTask);
    component.targetDoc.set({
      uid: 'doc-1',
      title: 'report.pdf',
      properties: { 'file:content': { 'mime-type': metadataMime, name: 'report.pdf' } },
    } as unknown as NuxeoDocument);
    if (servedType !== null) component.previewBlobType.set(servedType);
    fixture.detectChanges();
  }

  /**
   * The `mimeType` the rendered viewer was actually handed.
   *
   * Read off the real `DocumentViewerComponent` instance rather than a stub. A stub swapped in via
   * `overrideComponent({ remove/add: imports })` silently did not match, so the query found nothing and
   * the test failed for the wrong reason — using the real child removes that whole class of doubt, and
   * it is the component whose input actually matters.
   */
  function boundMimeType(): string {
    const found = fixture.debugElement.query(By.directive(DocumentViewerComponent));
    if (!found) {
      throw new Error(
        'document viewer did not render, so nothing was asserted about the binding — ' +
          `hasSelection=${component.hasSelection?.() ?? 'n/a'} targetDoc=${component.targetDoc() !== null}`,
      );
    }
    return (found.componentInstance as DocumentViewerComponent).mimeType();
  }

  it('binds the served type, not the document type, once a blob has arrived', () => {
    renderWith('application/pdf', 'image/png');

    // The load-bearing assertion. Reverting the template to `[mimeType]="mimeType()"` fails here,
    // which the previous version of this file did not.
    expect(boundMimeType()).toBe('image/png');
    expect(boundMimeType()).not.toBe('application/pdf');
  });

  it('binds the document type before any blob has arrived', () => {
    renderWith('application/pdf', '');

    expect(boundMimeType()).toBe('application/pdf');
  });

  it('binds one consistent value when the real blob was fetched', () => {
    // image/audio/video take the `@blob/file:content` path, so the two coincide — the change must not
    // perturb the case that was already correct.
    renderWith('image/jpeg', 'image/jpeg');

    expect(boundMimeType()).toBe('image/jpeg');
  });
});
