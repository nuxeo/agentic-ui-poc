import { Injectable, inject, signal, computed } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { aiErrorMessage } from './ai-error';
import { AiGatewayService } from './ai-gateway.service';
import * as i0 from "@angular/core";
export class AiChatService {
    ai = inject(AiGatewayService);
    translate = inject(TranslateService);
    messages = signal([], ...(ngDevMode ? [{ debugName: "messages" }] : []));
    loading = signal(false, ...(ngDevMode ? [{ debugName: "loading" }] : []));
    error = signal(null, ...(ngDevMode ? [{ debugName: "error" }] : []));
    hasMessages = computed(() => this.messages().length > 0, ...(ngDevMode ? [{ debugName: "hasMessages" }] : []));
    panelOpen = signal(false, ...(ngDevMode ? [{ debugName: "panelOpen" }] : []));
    currentContext = {};
    openPanel(ctx) {
        if (ctx)
            this.setContext(ctx);
        this.panelOpen.set(true);
    }
    closePanel() {
        this.panelOpen.set(false);
    }
    togglePanel() {
        this.panelOpen.update((v) => !v);
    }
    setContext(ctx) {
        this.currentContext = ctx;
    }
    send(message) {
        const history = this.messages().map((m) => ({
            role: m.role,
            content: m.content,
        }));
        const userEntry = { role: 'user', content: message, timestamp: new Date() };
        this.messages.update((msgs) => [...msgs, userEntry]);
        this.loading.set(true);
        this.error.set(null);
        this.ai.chat({ message, history, context: this.currentContext }).subscribe({
            next: (response) => {
                const assistantEntry = {
                    role: 'assistant',
                    content: response.reply,
                    sources: response.sources,
                    timestamp: new Date(),
                };
                this.messages.update((msgs) => [...msgs, assistantEntry]);
                this.loading.set(false);
            },
            error: (err) => {
                this.error.set(aiErrorMessage(err, this.translate.instant('shared-ai-client.message.ai-service-unavailable')));
                this.loading.set(false);
            },
        });
    }
    clear() {
        this.messages.set([]);
        this.error.set(null);
    }
    static ɵfac = function AiChatService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AiChatService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: AiChatService, factory: AiChatService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AiChatService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
