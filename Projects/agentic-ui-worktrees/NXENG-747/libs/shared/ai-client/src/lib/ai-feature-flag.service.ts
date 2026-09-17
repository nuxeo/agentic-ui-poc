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
        // Product decision for the PoC: make AI visible after upgrade even for old local opt-outs.
        // User choices made after this migration are preserved by the migration marker.
        localStorage.setItem(MIGRATION_KEY, 'true');
        localStorage.setItem(STORAGE_KEY, 'true');
        return true;
      }

      return stored === null ? true : stored === 'true';
    } catch {
      // If storage is unavailable, keep the PoC default-on for the current session.
      return true;
    }
  }
}
