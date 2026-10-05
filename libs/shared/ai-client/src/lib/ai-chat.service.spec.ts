import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { describe, it, expect, beforeEach, vi, type MockInstance } from 'vitest';
import { Subject, of, throwError } from 'rxjs';

import { AiChatService } from './ai-chat.service';
import { AiGatewayService } from './ai-gateway.service';
import type { ChatResponse, DocRef } from './ai.models';

/**
 * The chat service needs no backend at all — only a mocked gateway, which is what
 * `scripts/beta-harness/coverage-gate.mjs` says of this whole library.
 */
describe('AiChatService', () => {
  let service: AiChatService;
  let chat: MockInstance<AiGatewayService['chat']>;

  /** `ChatResponse.sources` is required, so a reply with no sources still carries an empty array. */
  function reply(text: string, sources: DocRef[] = []): ChatResponse {
    return { reply: text, sources };
  }

  beforeEach(() => {
    chat = vi.fn<AiGatewayService['chat']>().mockReturnValue(of(reply('Hello back')));

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: AiGatewayService, useValue: { chat } },
        // Only `instant` is reached, and only on the failure path.
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
        AiChatService,
      ],
    });

    service = TestBed.inject(AiChatService);
  });

  it('starts empty, closed and not loading', () => {
    expect(service.messages()).toEqual([]);
    expect(service.hasMessages()).toBe(false);
    expect(service.loading()).toBe(false);
    expect(service.error()).toBeNull();
    expect(service.panelOpen()).toBe(false);
  });

  describe('the panel', () => {
    it('opens and closes', () => {
      service.openPanel();
      expect(service.panelOpen()).toBe(true);

      service.closePanel();
      expect(service.panelOpen()).toBe(false);
    });

    it('toggles from whichever state it is in', () => {
      service.togglePanel();
      expect(service.panelOpen()).toBe(true);

      service.togglePanel();
      expect(service.panelOpen()).toBe(false);
    });

    it('adopts a context passed when opening', () => {
      service.openPanel({ docId: 'doc-1', page: 'document-detail' });
      service.send('hello');

      expect(chat).toHaveBeenCalledWith(
        expect.objectContaining({ context: { docId: 'doc-1', page: 'document-detail' } }),
      );
    });

    it('leaves the existing context alone when opened with none', () => {
      service.setContext({ docId: 'doc-1' });
      service.openPanel();
      service.send('hello');

      expect(chat).toHaveBeenCalledWith(expect.objectContaining({ context: { docId: 'doc-1' } }));
    });
  });

  describe('send', () => {
    it('appends the user message immediately, before any reply', () => {
      // A pending gateway, so the optimistic append is observable on its own. The user has to see
      // their own message straight away rather than after a round trip.
      const pending = new Subject<ChatResponse>();
      chat.mockReturnValue(pending.asObservable());

      service.send('what changed?');

      expect(service.messages()).toHaveLength(1);
      expect(service.messages()[0]).toMatchObject({ role: 'user', content: 'what changed?' });
      expect(service.loading()).toBe(true);
    });

    it('appends the assistant reply with its sources and stops loading', () => {
      const source: DocRef = {
        uid: 'doc-1',
        title: 'Report',
        path: '/default-domain/workspaces/report',
      };
      chat.mockReturnValue(of(reply('Two files changed.', [source])));

      service.send('what changed?');

      expect(service.messages()).toHaveLength(2);
      expect(service.messages()[1]).toMatchObject({
        role: 'assistant',
        content: 'Two files changed.',
        sources: [source],
      });
      expect(service.loading()).toBe(false);
      expect(service.hasMessages()).toBe(true);
    });

    it('sends the prior turns as history, without the message being sent', () => {
      service.send('first');
      chat.mockClear();

      service.send('second');

      // Two entries exist by now (user + assistant from the first turn) and both are history; the
      // new message travels in `message`, not in `history`.
      expect(chat).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'second',
          history: [
            { role: 'user', content: 'first' },
            { role: 'assistant', content: 'Hello back' },
          ],
        }),
      );
    });

    it('sends an empty history on the first turn', () => {
      service.send('first');

      expect(chat).toHaveBeenCalledWith(expect.objectContaining({ history: [] }));
    });

    it('clears a previous error when a new message is sent', () => {
      chat.mockReturnValue(throwError(() => new Error('down')));
      service.send('first');
      expect(service.error()).not.toBeNull();

      const pending = new Subject<ChatResponse>();
      chat.mockReturnValue(pending.asObservable());
      service.send('second');

      expect(service.error()).toBeNull();
    });

    it('records a failure message and stops loading, keeping the user message', () => {
      chat.mockReturnValue(throwError(() => ({ status: 500 })));

      service.send('what changed?');

      expect(service.error()).toBeTruthy();
      expect(service.loading()).toBe(false);
      // The user's own message stays on screen; only the reply is missing.
      expect(service.messages()).toHaveLength(1);
      expect(service.messages()[0]).toMatchObject({ role: 'user' });
    });
  });

  describe('clear', () => {
    it('empties the transcript and the error but leaves the panel open', () => {
      chat.mockReturnValue(throwError(() => new Error('down')));
      service.openPanel();
      service.send('hello');

      service.clear();

      expect(service.messages()).toEqual([]);
      expect(service.hasMessages()).toBe(false);
      expect(service.error()).toBeNull();
      expect(service.panelOpen()).toBe(true);
    });
  });
});
