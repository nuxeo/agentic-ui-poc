import { DestroyRef, Injectable, inject, signal, computed } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AiGatewayService } from './ai-gateway.service';
import {
  AI_PANEL_DEFAULT_WIDTH,
  clampAiPanelWidthToBounds,
  readStoredAiPanelWidth,
  storeAiPanelWidth,
} from './ai-chat-panel-size';
import type { ChatMessage, DocRef } from './ai.models';

export interface ChatEntry {
  role: 'user' | 'assistant';
  content: string;
  sources?: DocRef[];
  timestamp: Date;
}

/**
 * The Automation-backed chat, now the fallback rather than the default path.
 *
 * `AgentRuntimeService` supersedes it wherever `GET /nuxeo/agent/capabilities` reports a gateway:
 * `send()` here resolves in a single `AI.Chat` POST, so it cannot stream tokens, run a tool
 * loop, or pause for approval. It stays because a deployment without the gateway is a
 * supported configuration, and it also owns the panel's open/closed state, which is shared
 * by both paths.
 */
@Injectable({ providedIn: 'root' })
export class AiChatService {
  private readonly ai = inject(AiGatewayService);
  private readonly destroyRef = inject(DestroyRef);

  readonly messages = signal<ChatEntry[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly hasMessages = computed(() => this.messages().length > 0);
  readonly panelOpen = signal(false);

  /**
   * How wide the user has dragged the panel, in CSS pixels.
   *
   * Here rather than in the panel component because the shell needs it too — the drawer
   * frame is the shell's element, not the panel's — and because it outlives the
   * component: the panel is destroyed every time the drawer closes, so a width held in
   * the component would reset on each toggle. It sits next to `panelOpen` for the same
   * reason that does: both describe the frame around the chat rather than either of the
   * two AI paths inside it.
   *
   * Read back from storage at construction, so the width is right on the drawer's first
   * paint rather than jumping a frame later.
   */
  readonly panelWidth = signal(readStoredAiPanelWidth());

  private currentContext: { docId?: string; page?: string } = {};

  openPanel(ctx?: { docId?: string; page?: string }): void {
    if (ctx) this.setContext(ctx);
    this.panelOpen.set(true);
  }

  closePanel(): void {
    this.panelOpen.set(false);
  }

  togglePanel(): void {
    this.panelOpen.update((v) => !v);
  }

  /**
   * Records a width the user has settled on.
   *
   * `persist: false` is what a drag in progress uses: the signal moves so the panel
   * follows the pointer, but storage is written once on release rather than on every
   * pointer event.
   */
  setPanelWidth(width: number, persist = true): void {
    const clamped = clampAiPanelWidthToBounds(width);
    this.panelWidth.set(clamped);
    if (persist) storeAiPanelWidth(clamped);
  }

  resetPanelWidth(): void {
    this.setPanelWidth(AI_PANEL_DEFAULT_WIDTH);
  }

  setContext(ctx: { docId?: string; page?: string }): void {
    this.currentContext = ctx;
  }

  send(message: string): void {
    const history: ChatMessage[] = this.messages().map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const userEntry: ChatEntry = { role: 'user', content: message, timestamp: new Date() };
    this.messages.update((msgs) => [...msgs, userEntry]);
    this.loading.set(true);
    this.error.set(null);

    this.ai
      .chat({ message, history, context: this.currentContext })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          const assistantEntry: ChatEntry = {
            role: 'assistant',
            content: response.reply,
            sources: response.sources,
            timestamp: new Date(),
          };
          this.messages.update((msgs) => [...msgs, assistantEntry]);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set(err?.error?.error ?? 'AI service unavailable');
          this.loading.set(false);
        },
      });
  }

  clear(): void {
    this.messages.set([]);
    this.error.set(null);
  }
}
