import { Injectable, inject, signal, computed } from '@angular/core';
import { AiGatewayService } from './ai-gateway.service';
import type { ChatMessage, DocRef } from './ai.models';

export interface ChatEntry {
  role: 'user' | 'assistant';
  content: string;
  sources?: DocRef[];
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class AiChatService {
  private readonly ai = inject(AiGatewayService);

  readonly messages = signal<ChatEntry[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly hasMessages = computed(() => this.messages().length > 0);
  readonly panelOpen = signal(false);

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

  setContext(ctx: { docId?: string; page?: string }): void {
    this.currentContext = ctx;
  }

  send(message: string): void {
    const userEntry: ChatEntry = { role: 'user', content: message, timestamp: new Date() };
    this.messages.update((msgs) => [...msgs, userEntry]);
    this.loading.set(true);
    this.error.set(null);

    const history: ChatMessage[] = this.messages().map((m) => ({
      role: m.role,
      content: m.content,
    }));

    this.ai.chat({ message, history, context: this.currentContext }).subscribe({
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
