import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'ai-features-enabled';
const MIGRATION_KEY = 'ai-features-default-enabled-v1';

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
      const migrated = localStorage.getItem(MIGRATION_KEY) === 'true';
      const stored = localStorage.getItem(STORAGE_KEY);

      if (!migrated) {
        localStorage.setItem(MIGRATION_KEY, 'true');
        localStorage.setItem(STORAGE_KEY, 'true');
        return true;
      }

      return stored === null ? true : stored === 'true';
    } catch {
      return true;
    }
  }
}
