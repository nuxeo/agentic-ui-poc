import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { describe, beforeEach, afterEach, expect, it, vi } from 'vitest';

import { AI_BACKEND_URL } from './ai.config';
import { AiChatService } from './ai-chat.service';
import {
  AI_PANEL_DEFAULT_WIDTH,
  AI_PANEL_MAX_WIDTH,
  AI_PANEL_WIDTH_STORAGE_KEY,
} from './ai-chat-panel-size';

const CHAT_OP = '/nuxeo/api/v1/automation/AI.Chat';

/** The host's own `localStorage` varies by Node version; drive a predictable one instead. */
function memoryStorage(seed: Record<string, string> = {}) {
  const store = new Map(Object.entries(seed));
  return {
    store,
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => void store.set(key, value),
    removeItem: (key: string) => void store.delete(key),
    clear: () => store.clear(),
  };
}

/**
 * The fallback path, exercised on its own: this is what a customer without the agent
 * gateway gets, so it has to keep working independently of anything AG-UI.
 */
describe('AiChatService', () => {
  let service: AiChatService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AI_BACKEND_URL, useValue: '/nuxeo' },
      ],
    });
    service = TestBed.inject(AiChatService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('posts the turn to the AI.Chat Automation operation with the page context', () => {
    service.setContext({ docId: 'doc-1', page: '/doc/doc-1' });
    service.send('summarize this');

    const request = http.expectOne(CHAT_OP);
    expect(request.request.method).toBe('POST');
    expect(request.request.body.params.message).toBe('summarize this');
    expect(request.request.body.params.docId).toBe('doc-1');
    request.flush({ reply: 'Here is the summary.' });

    expect(service.loading()).toBe(false);
    expect(service.messages().map((m) => m.role)).toEqual(['user', 'assistant']);
  });

  it('sends prior turns as history so the single-shot call still has context', () => {
    service.send('first');
    http.expectOne(CHAT_OP).flush({ reply: 'one' });

    service.send('second');
    const request = http.expectOne(CHAT_OP);
    expect(JSON.parse(request.request.body.params.historyJson)).toEqual([
      { role: 'user', content: 'first' },
      { role: 'assistant', content: 'one' },
    ]);
    request.flush({ reply: 'two' });
  });

  it('keeps the reply sources for the citation cards', () => {
    service.send('find contracts');
    http.expectOne(CHAT_OP).flush({
      reply: 'Two contracts matched.',
      sources: [{ uid: 'doc-1', title: 'Contract A', path: '/ws/a' }],
    });

    expect(service.messages()[1].sources).toEqual([
      { uid: 'doc-1', title: 'Contract A', path: '/ws/a' },
    ]);
  });

  it('surfaces the failure and resets loading so the user can retry', () => {
    service.send('hello');
    http.expectOne(CHAT_OP).flush('', { status: 503, statusText: 'Service Unavailable' });

    expect(service.error()).toBe('AI service unavailable');
    expect(service.loading()).toBe(false);
  });

  it('clears the transcript and the error together', () => {
    service.send('hello');
    http.expectOne(CHAT_OP).flush('', { status: 500, statusText: 'Server Error' });

    service.clear();

    expect(service.messages()).toEqual([]);
    expect(service.error()).toBeNull();
  });

  it('tracks the panel open state shared by both AI paths', () => {
    expect(service.panelOpen()).toBe(false);
    service.togglePanel();
    expect(service.panelOpen()).toBe(true);
    service.closePanel();
    expect(service.panelOpen()).toBe(false);
    service.openPanel({ page: '/browse' });
    expect(service.panelOpen()).toBe(true);
  });
});

/**
 * The panel's width lives here for the same reason its open state does — the frame around
 * the chat outlives the component inside it, which is destroyed on every close.
 */
describe('AiChatService panel width', () => {
  let storage: ReturnType<typeof memoryStorage>;

  function configure(seed: Record<string, string> = {}) {
    storage = memoryStorage(seed);
    // Stubbed before the service is injected: the width is read from storage in a field
    // initialiser, so the panel is the right size on the drawer's first paint.
    vi.stubGlobal('localStorage', storage);
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AI_BACKEND_URL, useValue: '/nuxeo' },
      ],
    });
    return TestBed.inject(AiChatService);
  }

  afterEach(() => vi.unstubAllGlobals());

  it('starts at the default width', () => {
    expect(configure().panelWidth()).toBe(AI_PANEL_DEFAULT_WIDTH);
  });

  it('restores the width the user last settled on', () => {
    expect(configure({ [AI_PANEL_WIDTH_STORAGE_KEY]: '620' }).panelWidth()).toBe(620);
  });

  it('records and persists a committed width', () => {
    const service = configure();
    service.setPanelWidth(560);

    expect(service.panelWidth()).toBe(560);
    expect(storage.store.get(AI_PANEL_WIDTH_STORAGE_KEY)).toBe('560');
  });

  /**
   * The reason `persist` exists. A drag emits a width per pointer event, and writing
   * storage on each one is both wasteful and wrong: the width worth remembering is the
   * one the user released on, not every width the pointer passed through.
   */
  it('moves the panel without persisting while a drag is in progress', () => {
    const service = configure();
    service.setPanelWidth(500, false);

    expect(service.panelWidth()).toBe(500);
    expect(storage.store.has(AI_PANEL_WIDTH_STORAGE_KEY)).toBe(false);
  });

  it('clamps a width outside the bounds', () => {
    const service = configure();
    service.setPanelWidth(10_000);
    expect(service.panelWidth()).toBe(AI_PANEL_MAX_WIDTH);
  });

  it('resets to the default width', () => {
    const service = configure({ [AI_PANEL_WIDTH_STORAGE_KEY]: '700' });
    service.resetPanelWidth();

    expect(service.panelWidth()).toBe(AI_PANEL_DEFAULT_WIDTH);
    expect(storage.store.get(AI_PANEL_WIDTH_STORAGE_KEY)).toBe(String(AI_PANEL_DEFAULT_WIDTH));
  });
});
