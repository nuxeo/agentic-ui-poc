import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { Subject, of } from 'rxjs';

import {
  AgentSelectionStore,
  provideAgentWidgets,
  type AgentWidgetRequest,
} from '@agentic-ui/shared/agent-client';
import { documentCardWidget } from '@agentic-ui/shared/ui/agent-widgets';
import {
  CURRENT_USERNAME,
  CollectionService,
  DocumentDetailService,
  DocumentService,
  type NuxeoDocument,
} from '@agentic-ui/shared/nuxeo-client';

import { documentListWidget } from '../../agent-widgets';
import { AgentWidgetHostComponent } from './agent-widget-host.component';

const UID = 'aaaaaaaa-1111-2222-3333-444444444444';

function mountRequest(docIds: readonly string[] = [UID]): AgentWidgetRequest {
  return { toolCallId: 'call-1', status: 'ready', name: 'documentList', props: { docIds } };
}

function cardRequest(docId: string = UID): AgentWidgetRequest {
  return { toolCallId: 'call-2', status: 'ready', name: 'documentCard', props: { docId } };
}

function nuxeoDocument(uid: string): NuxeoDocument {
  return {
    uid,
    title: `Document ${uid}`,
    type: 'File',
    path: `/default-domain/ws/${uid}`,
    properties: {},
  } as NuxeoDocument;
}

/**
 * The application half of the generative-UI boundary: a validated request in, one
 * allowlisted component mounted, or a sentence explaining why not.
 *
 * These are the security properties rather than the rendering. The reads are
 * deliberately left open — `getById` answers with a Subject that never emits — so
 * that "was the component torn down" can be asked of the subscription rather than
 * of the DOM, which is the form the leak would actually take.
 */
describe('AgentWidgetHostComponent', () => {
  let fixture: ComponentFixture<AgentWidgetHostComponent>;
  let reads: Subject<NuxeoDocument>;
  let documents: jasmine.SpyObj<DocumentService>;
  let selectionStore: AgentSelectionStore;

  /**
   * Applies a request and waits for the lazy chunk, the way a real mount happens.
   *
   * The mount is genuinely asynchronous — the registry's dynamic `import()` is
   * not stubbed — so this settles the effect, then the download, then renders.
   */
  async function show(request: AgentWidgetRequest): Promise<void> {
    fixture.componentRef.setInput('request', request);
    fixture.detectChanges();
    for (let turn = 0; turn < 50 && fixture.componentInstance.loading(); turn += 1) {
      await new Promise((resolve) => setTimeout(resolve, 5));
      fixture.detectChanges();
    }
    fixture.detectChanges();
  }

  function host(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function mountedList(): HTMLElement | null {
    return host().querySelector('lib-document-list-page');
  }

  function mountedCard(): HTMLElement | null {
    return host().querySelector('lib-document-metadata-card');
  }

  function notice(): string {
    return host().querySelector('.ai-widget-notice')?.textContent?.trim() ?? '';
  }

  beforeEach(() => {
    reads = new Subject<NuxeoDocument>();
    documents = jasmine.createSpyObj<DocumentService>('DocumentService', [
      'getById',
      'getRecentlyViewed',
      'getExpiredDocuments',
    ]);
    documents.getById.and.returnValue(reads.asObservable());

    TestBed.configureTestingModule({
      imports: [AgentWidgetHostComponent, NoopAnimationsModule],
      providers: [
        { provide: DocumentService, useValue: documents },
        {
          provide: CollectionService,
          useValue: jasmine.createSpyObj<CollectionService>('CollectionService', ['getFavorites']),
        },
        {
          provide: DocumentDetailService,
          useValue: {
            fetchThumbnail: () => of(null),
            removeFromFavorites: () => of(null),
          },
        },
        { provide: CURRENT_USERNAME, useValue: () => 'Administrator' },
        { provide: Router, useValue: jasmine.createSpyObj<Router>('Router', ['navigate']) },
        provideAgentWidgets(documentListWidget, documentCardWidget),
      ],
    });

    selectionStore = TestBed.inject(AgentSelectionStore);
    fixture = TestBed.createComponent(AgentWidgetHostComponent);
  });

  describe('mounting an allowlisted widget', () => {
    it('mounts the real document list for a validated request', async () => {
      await show(mountRequest());

      expect(mountedList()).not.toBeNull();
      expect(notice()).toBe('');
    });

    /**
     * The property the whole design rests on. The uids cross; the rows are read
     * back from Nuxeo under the caller's own session, so a title the producer
     * invented has no route onto the screen.
     */
    it('gives the component the uids and reads the rows from Nuxeo itself', async () => {
      await show(mountRequest([UID, 'uid-2']));

      expect(documents.getById.calls.allArgs()).toEqual([[UID], ['uid-2']]);

      reads.next(nuxeoDocument(UID));
      reads.complete();
      fixture.detectChanges();

      expect(mountedList()?.textContent).toContain(`Document ${UID}`);
    });

    // 400px. The list is a page component; in the panel it drops to the columns
    // that fit, and it does so because the registry says so, not because the
    // request did.
    it('mounts it compact, which is the application’s choice and not the request’s', async () => {
      await show(mountRequest());

      expect(mountedList()?.querySelector('.list-page--compact')).not.toBeNull();
    });

    // Read-only: `by-id` has no remove action, so nothing mounted from a tool
    // call can perform a write the gateway holds no record of.
    it('offers no action that writes', async () => {
      await show(mountRequest());
      reads.next(nuxeoDocument(UID));
      reads.complete();
      fixture.detectChanges();

      expect(
        mountedList()?.querySelectorAll('button.cell--actions, .cell--actions button').length,
      ).toBe(0);
    });
  });

  /**
   * A7 stage 2: the host is what connects a mounted widget to the selection
   * store, and it does that from the *validated props* rather than from
   * anything the component ends up rendering.
   *
   * That ordering is the security-relevant part. The offered set has to exist
   * before a proposal can be honoured, and it has to be derived from data the
   * widget's own parser already accepted — otherwise the closed set a proposal
   * is checked against is not closed.
   */
  describe('selection wiring', () => {
    it('offers the widget’s validated uids, so a proposal has something to match', async () => {
      await show(mountRequest([UID, 'uid-2']));

      expect([...selectionStore.offered()].sort()).toEqual([UID, 'uid-2'].sort());
    });

    it('shows a proposal that arrived before the lazy chunk finished downloading', async () => {
      // The real ordering: STATE_SNAPSHOT and the render event ride one run, and
      // the widget is still being fetched when the proposal lands.
      selectionStore.propose([UID]);
      expect(selectionStore.proposals()).toEqual([]);

      await show(mountRequest([UID, 'uid-2']));

      expect(selectionStore.proposalsFor('call-1')).toEqual([UID]);
    });

    it('withdraws its offer when the transcript destroys it', async () => {
      await show(mountRequest([UID]));
      selectionStore.propose([UID]);
      expect(selectionStore.proposals()).toEqual([UID]);

      fixture.destroy();

      expect(selectionStore.offered().size).toBe(0);
      expect(selectionStore.proposals()).toEqual([]);
    });

    it('withdraws the old offer when one instance is reused for a new request', async () => {
      await show(mountRequest([UID]));
      await show(cardRequest());

      // The card declares no `selection`, so nothing is offered any more — and a
      // proposal for the list's uid has nowhere to land.
      expect(selectionStore.offered().size).toBe(0);
    });

    it('leaves a widget that declares no selection entirely alone', async () => {
      await show(cardRequest());

      expect(selectionStore.offered().size).toBe(0);
      expect(mountedCard()?.querySelector('mat-checkbox')).toBeNull();
    });
  });

  /**
   * The host names no widget. It resolves whatever the composition root
   * registered, which is why the second widget cost no change to it — and why
   * these tests are here rather than in the document list's own spec.
   */
  describe('mounting a second, differently shaped widget', () => {
    it('mounts the metadata card for a request carrying one uid rather than a list', async () => {
      await show(cardRequest());

      expect(mountedCard()).not.toBeNull();
      expect(mountedList()).toBeNull();
      expect(documents.getById.calls.allArgs()).toEqual([[UID]]);
    });

    it('swaps one widget for another of a different shape, leaving neither behind', async () => {
      await show(mountRequest());
      expect(mountedList()).not.toBeNull();

      await show(cardRequest());

      expect(mountedList()).toBeNull();
      expect(mountedCard()).not.toBeNull();
      expect(reads.observers.length).toBe(1);
    });

    it('resolves each widget from the catalogue, not from a name it knows', async () => {
      // With nothing registered, a request the previous tests mount is refused
      // by the same host. That is the claim "closed allowlist, resolved in the
      // app" makes, and it is checked rather than asserted in a comment.
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [AgentWidgetHostComponent, NoopAnimationsModule],
        providers: [{ provide: DocumentService, useValue: documents }],
      });
      fixture = TestBed.createComponent(AgentWidgetHostComponent);

      await show(cardRequest());

      expect(mountedCard()).toBeNull();
      expect(notice()).toContain('does not provide');
    });
  });

  describe('refusing a request', () => {
    it('mounts nothing at all for a widget name the application does not have', async () => {
      await show({ toolCallId: 'call-1', status: 'rejected', reason: 'unknown-widget' });

      expect(mountedList()).toBeNull();
      expect(host().children.length).toBe(1);
      expect(notice()).toContain('does not provide');
    });

    it('mounts nothing at all for props that failed validation', async () => {
      await show({ toolCallId: 'call-1', status: 'rejected', reason: 'invalid-props' });

      expect(mountedList()).toBeNull();
      expect(notice()).toContain('did not check out');
    });

    // A refusal must not become a read. The component type is never resolved, so
    // a rejected request cannot reach a service under any circumstances.
    it('performs no reads for a refused request', async () => {
      await show({ toolCallId: 'call-1', status: 'rejected', reason: 'unknown-widget' });

      expect(documents.getById).not.toHaveBeenCalled();
    });

    it('says something rather than leaving a blank space', async () => {
      await show({ toolCallId: 'call-1', status: 'rejected', reason: 'unknown-widget' });

      expect(notice().length).toBeGreaterThan(0);
    });

    it('repeats nothing the producer sent', async () => {
      await show({ toolCallId: 'call-1', status: 'rejected', reason: 'invalid-props' });

      expect(notice()).not.toContain('call-1');
      expect(notice()).not.toContain('documentList');
    });
  });

  /**
   * The transcript is cleared, re-ordered and re-rendered constantly, and a
   * component that survives its host takes its injector, its subscriptions and
   * its blob URLs with it. Asked of the open read rather than of the DOM,
   * because that is where the leak would be.
   */
  describe('teardown', () => {
    it('tears the mounted component down when the transcript clears', async () => {
      await show(mountRequest());
      expect(reads.observed).toBe(true);

      fixture.destroy();

      expect(reads.observed).toBe(false);
    });

    it('tears the previous one down before mounting a replacement', async () => {
      await show(mountRequest());
      expect(reads.observed).toBe(true);

      await show(mountRequest(['uid-2']));

      // One live subscription, not two: the first component's read is gone and
      // the replacement has opened its own.
      expect(documents.getById.calls.allArgs()).toEqual([[UID], ['uid-2']]);
      expect(reads.observers.length).toBe(1);
    });

    it('leaves nothing in the outlet when a mount is replaced by a refusal', async () => {
      await show(mountRequest());

      await show({ toolCallId: 'call-1', status: 'rejected', reason: 'invalid-props' });

      expect(mountedList()).toBeNull();
      expect(reads.observed).toBe(false);
    });

    it('survives being destroyed before anything was ever mounted', () => {
      fixture.componentRef.setInput('request', {
        toolCallId: 'call-1',
        status: 'rejected',
        reason: 'unknown-widget',
      } satisfies AgentWidgetRequest);
      fixture.detectChanges();

      expect(() => fixture.destroy()).not.toThrow();
    });
  });
});
