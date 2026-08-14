import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { vi } from 'vitest';

import { DocumentDetailService, NUXEO_API_ORIGIN } from '@agentic-ui/shared/nuxeo-client';

import { KdCitationDialogComponent } from './kd-citation-dialog';

describe('KdCitationDialogComponent', () => {
  let fixture: ComponentFixture<KdCitationDialogComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KdCitationDialogComponent, HttpClientTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: MAT_DIALOG_DATA,
          useValue: {
            initialIndex: 1,
            answer: {
              questionId: 'q-1',
              agentId: 'agent-1',
              question: 'Who is Holmes?',
              status: 'Complete',
              answer: 'Holmes is a detective [1].',
              citations: [{ objectId: 'source__doc-1', title: 'Sherlock', referenceId: 'chunk-1' }],
              objectReferences: [
                {
                  objectId: 'source__doc-1',
                  references: [
                    {
                      referenceId: 'chunk-1',
                      content: 'Pray take a seat, said Holmes.',
                      pageNumber: 1,
                    },
                  ],
                },
              ],
            },
          },
        },
        {
          provide: MatDialogRef,
          useValue: { close: vi.fn() },
        },
        { provide: NUXEO_API_ORIGIN, useValue: '' },
        DocumentDetailService,
        DomSanitizer,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(KdCitationDialogComponent);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('loads the source document and renders the active reference excerpt', () => {
    fixture.detectChanges();

    const docReq = httpMock.expectOne('/nuxeo/api/v1/id/doc-1');
    expect(docReq.request.method).toBe('GET');
    docReq.flush({
      uid: 'doc-1',
      title: 'Sherlock story',
      path: '/default-domain/workspaces/demo/sherlock.png',
      properties: {
        'file:content': { name: 'sherlock.png', 'mime-type': 'image/png' },
      },
      contextParameters: {},
    });

    const blobReq = httpMock.expectOne(
      (r) =>
        r.url === '/nuxeo/api/v1/id/doc-1/@blob/file:content' &&
        r.params.get('clientReason') === 'view',
    );
    blobReq.flush(new Blob(['image'], { type: 'image/png' }));

    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('chunk-1');
    expect(element.textContent).toContain('[1]');
    expect(element.textContent).toContain('Pray take a seat, said Holmes.');
    expect(element.textContent).toContain('Page 1');
  });
});
