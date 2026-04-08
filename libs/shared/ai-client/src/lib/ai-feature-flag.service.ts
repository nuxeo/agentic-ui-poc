import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'ai-features-enabled';

@Injectable({ providedIn: 'root' })
export class AiFeatureFlagService {
  readonly aiEnabled = signal<boolean>(this.readFromStorage());

  toggle(): void {
    this.setEnabled(!this.aiEnabled());
  }

  setEnabled(value: boolean): void {
    this.aiEnabled.set(value);
    try {
      localStorage.setItem(STORAGE_KEY, String(value));
    } catch {
      /* localStorage unavailable */
    }
  }

  private readFromStorage(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEY) !== 'false';
    } catch {
      return true;
    }
  }
}
