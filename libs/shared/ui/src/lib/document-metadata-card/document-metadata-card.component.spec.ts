import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { DocumentService, type NuxeoDocument } from '@agentic-ui/shared/nuxeo-client';

import { DocumentMetadataCardComponent } from './document-metadata-card.component';

/**
 * The read-only metadata card, as a widget the agent can cause to appear.
 *
 * The properties under test are the ones that make it safe to mount somewhere
 * the user did not navigate to: it reads what it shows rather than being told
 * it, it writes nothing, and it lets go of its subscription when the transcript
 * that holds it is cleared.
 */

const UID = 'aaaaaaaa-1111-2222-3333-444444444444';

function doc(overrides: Partial<NuxeoDocument> = {}): NuxeoDocument {
  return {
    uid: UID,
    title: 'Records retention policy 2026',
    type: 'File',
    path: '/default-domain/workspaces/Policies/retention',
    lastModified: '2026-08-01T09:00:00.000Z',
    state: 'project',
    properties: {
      'dc:created': '2026-01-04T11:12:13.000Z',
      'dc:modified': '2026-08-01T09:00:00.000Z',
      'dc:creator': 'Administrator',
      'dc:lastContributor': 'jdoe',
    },
    ...overrides,
  };
}

describe('DocumentMetadataCardComponent', () => {
  let fixture: ComponentFixture<DocumentMetadataCardComponent>;
  let documents: { getById: ReturnType<typeof vi.fn> };
  let router: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    documents = { getById: vi.fn().mockReturnValue(of(doc())) };
    router = { navigate: vi.fn().mockResolvedValue(true) };

    TestBed.configureTestingModule({
      imports: [DocumentMetadataCardComponent],
      providers: [
        { provide: DocumentService, useValue: documents },
        { provide: Router, useValue: router },
      ],
    });
  });

  function create(inputs: Record<string, unknown> = {}): void {
    fixture = TestBed.createComponent(DocumentMetadataCardComponent);
    fixture.componentRef.setInput('docId', UID);
    for (const [name, value] of Object.entries(inputs)) {
      fixture.componentRef.setInput(name, value);
    }
    fixture.detectChanges();
  }

  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? '';
  const labels = () =>
    [...(fixture.nativeElement as HTMLElement).querySelectorAll('dt')].map(
      (node) => node.textContent?.trim() ?? '',
    );

  describe('what it shows', () => {
    it('reads the document from Nuxeo rather than being handed its contents', () => {
      create();

      expect(documents.getById).toHaveBeenCalledWith(UID);
      expect(text()).toContain('Records retention policy 2026');
    });

    it('shows the application default set of fields when none was chosen', () => {
      create();

      expect(labels()).toEqual(['Type', 'Modified', 'Created by']);
    });

    it('shows exactly the fields asked for, in the order asked for', () => {
      create({ fields: ['creator', 'path', 'type'] });

      expect(labels()).toEqual(['Created by', 'Location', 'Type']);
    });

    it('drops a field the document does not carry rather than showing a blank row', () => {
      documents.getById.mockReturnValue(of(doc({ properties: { 'dc:creator': 'Administrator' } })));

      create({ fields: ['creator', 'contributor'] });

      expect(labels()).toEqual(['Created by']);
    });

    it('re-reads when it is pointed at a different document', () => {
      create();
      const other = 'bbbbbbbb-1111-2222-3333-444444444444';

      fixture.componentRef.setInput('docId', other);
      fixture.detectChanges();

      expect(documents.getById).toHaveBeenLastCalledWith(other);
    });
  });

  describe('what it does not show', () => {
    it('says the document could not be read, without saying why', () => {
      // 403 and 404 produce the same sentence deliberately. Telling a caller
      // that a document exists but is not theirs is a disclosure the page views
      // do not make either.
      documents.getById.mockReturnValue(throwError(() => new Error('403')));

      create();

      expect(text()).toContain('could not be read');
      expect(text()).not.toContain('403');
    });

    it('shows no fields at all while the read is still in flight', () => {
      documents.getById.mockReturnValue(new Subject<NuxeoDocument>());

      create();

      expect(labels()).toEqual([]);
    });
  });

  describe('it is read-only', () => {
    it('offers exactly one action, and it is navigation', () => {
      create();
      const buttons = [
        ...(fixture.nativeElement as HTMLElement).querySelectorAll('button'),
      ] as HTMLButtonElement[];

      expect(buttons).toHaveLength(1);
      buttons[0].click();

      expect(router.navigate).toHaveBeenCalledWith(['/doc', UID]);
    });

    it('injects no service that can write', () => {
      // The structural half of "read-only". A mounted component that wrote would
      // do it under the user's Nuxeo session, and the gateway's approval gate is
      // not merely bypassed on that path — it is absent from it.
      const source = DocumentMetadataCardComponent.toString();

      expect(source).not.toMatch(/DocumentDetailService|BrowseService|TagService|inject\(Http/);
    });
  });

  describe('it lets go when the transcript does', () => {
    it('unsubscribes from an in-flight read on destroy', () => {
      const reads = new Subject<NuxeoDocument>();
      documents.getById.mockReturnValue(reads);
      create();
      expect(reads.observed).toBe(true);

      fixture.destroy();

      expect(reads.observed).toBe(false);
    });
  });
});
