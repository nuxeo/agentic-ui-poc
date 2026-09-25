import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import {
  CollectionService,
  DocumentDetailService,
  DocumentService,
  TaskService,
} from '@nuxeo-satori/platform/nuxeo-client';
import { AiFeatureFlagService, AiGatewayService } from '@agentic-ui/shared/ai-client';

import { AuthService } from '../auth/auth.service';
import { DashboardPageComponent } from './dashboard-page.component';
import { testTranslateModule } from '../i18n/translate-testing';

globalThis.ResizeObserver ??= class implements ResizeObserver {
  observe(): void {
    /* no-op */
  }
  unobserve(): void {
    /* no-op */
  }
  disconnect(): void {
    /* no-op */
  }
};

describe('DashboardPageComponent', () => {
  let fixture: ComponentFixture<DashboardPageComponent>;

  beforeEach(async () => {
    const docService = jasmine.createSpyObj('DocumentService', [
      'getRecentlyEdited',
      'getRecentlyViewed',
    ]);
    docService.getRecentlyEdited.and.returnValue(of({ entries: [], totalSize: 0 }));
    docService.getRecentlyViewed.and.returnValue(of({ entries: [], totalSize: 0 }));

    const taskService = jasmine.createSpyObj('TaskService', ['getUserTasks']);
    taskService.getUserTasks.and.returnValue(of([]));

    const collectionService = jasmine.createSpyObj('CollectionService', ['getFavorites']);
    collectionService.getFavorites.and.returnValue(of({ entries: [], totalSize: 0 }));

    const detailService = jasmine.createSpyObj('DocumentDetailService', ['fetchThumbnail']);
    detailService.fetchThumbnail.and.returnValue(of(null));

    const aiGateway = jasmine.createSpyObj('AiGatewayService', ['getInsights']);
    aiGateway.getInsights.and.returnValue(of({ insights: [] }));

    await TestBed.configureTestingModule({
      imports: [testTranslateModule(), DashboardPageComponent],
      providers: [
        provideNoopAnimations(),
        provideRouter([]),
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) },
        { provide: DocumentService, useValue: docService },
        { provide: TaskService, useValue: taskService },
        { provide: CollectionService, useValue: collectionService },
        { provide: DocumentDetailService, useValue: detailService },
        { provide: AiGatewayService, useValue: aiGateway },
        { provide: AiFeatureFlagService, useValue: { aiEnabled: signal(false) } },
        { provide: AuthService, useValue: { username: signal('Administrator') } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPageComponent);
    fixture.detectChanges();
  });

  it('keeps the Create or import FAB naming text in a cdk-visually-hidden span (WCAG 2.5.3)', () => {
    const fab = fixture.nativeElement.querySelector('button.dashboard-create-fab');
    expect(fab).withContext('Create or import FAB').not.toBeNull();
    if (!(fab instanceof HTMLButtonElement)) {
      fail('expected HTMLButtonElement');
      return;
    }

    const accessibleNameSpan = fab.querySelector('.cdk-visually-hidden');
    expect(accessibleNameSpan?.textContent?.trim()).toBe('Create or import');

    const icon = fab.querySelector('mat-icon');
    expect(icon?.getAttribute('aria-hidden')).toBe('true');

    // aria-label alone does not satisfy IBM label_name_visible when the icon ligature is still
    // visible text in the subtree; the name must come from the same text users see on hover.
    expect(fab.getAttribute('aria-label')).toBeNull();
  });
});
