import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { AiFeatureFlagService } from './ai-feature-flag.service';

const STORAGE_KEY = 'ai-features-enabled';
const MIGRATION_KEY = 'ai-features-default-enabled-v1';

/**
 * The flag is read once, in a field initialiser, so every case has to arrange `localStorage` and then
 * construct the service — injecting it first and rewriting storage afterwards would assert nothing.
 *
 * `localStorage` is real here rather than stubbed, and cleared between tests. On Node 22+ a built-in
 * `localStorage` shadows jsdom's, which is why the gate passes `--no-experimental-webstorage`; a bare
 * `nx test` does not (see CLAUDE.md).
 */
describe('AiFeatureFlagService', () => {
  /** Builds the service after storage has been arranged, since the flag is read in a field. */
  function createService(): AiFeatureFlagService {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), AiFeatureFlagService],
    });
    return TestBed.inject(AiFeatureFlagService);
  }

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('the one-time migration', () => {
    it('turns AI on for a browser that has never seen the flag', () => {
      const service = createService();

      expect(service.aiEnabled()).toBe(true);
      expect(localStorage.getItem(MIGRATION_KEY)).toBe('true');
      expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
    });

    it('overrides a pre-migration opt-out, which is the point of it', () => {
      // A user who had turned AI off before the migration marker existed. The product decision
      // recorded in the service is that the upgrade makes AI visible again for them.
      localStorage.setItem(STORAGE_KEY, 'false');

      const service = createService();

      expect(service.aiEnabled()).toBe(true);
      expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
    });

    it('does not override an opt-out made after the migration', () => {
      // The discriminating half: once the marker is set, the user's choice is authoritative. Without
      // the marker check the migration would reset the flag on every single construction.
      localStorage.setItem(MIGRATION_KEY, 'true');
      localStorage.setItem(STORAGE_KEY, 'false');

      const service = createService();

      expect(service.aiEnabled()).toBe(false);
    });

    it('honours an opt-in made after the migration', () => {
      localStorage.setItem(MIGRATION_KEY, 'true');
      localStorage.setItem(STORAGE_KEY, 'true');

      expect(createService().aiEnabled()).toBe(true);
    });

    it('defaults to on when the marker is set but the flag was removed', () => {
      localStorage.setItem(MIGRATION_KEY, 'true');

      expect(createService().aiEnabled()).toBe(true);
    });

    it('treats any value other than "true" as off', () => {
      localStorage.setItem(MIGRATION_KEY, 'true');
      localStorage.setItem(STORAGE_KEY, 'yes');

      // Strict `=== 'true'`, so a stray value cannot read as enabled.
      expect(createService().aiEnabled()).toBe(false);
    });
  });

  describe('setEnabled', () => {
    it('persists the new value', () => {
      const service = createService();

      service.setEnabled(false);

      expect(service.aiEnabled()).toBe(false);
      expect(localStorage.getItem(STORAGE_KEY)).toBe('false');

      service.setEnabled(true);

      expect(service.aiEnabled()).toBe(true);
      expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
    });
  });

  describe('toggle', () => {
    it('flips the flag and persists it', () => {
      const service = createService();
      expect(service.aiEnabled()).toBe(true);

      service.toggle();
      expect(service.aiEnabled()).toBe(false);
      expect(localStorage.getItem(STORAGE_KEY)).toBe('false');

      service.toggle();
      expect(service.aiEnabled()).toBe(true);
      expect(localStorage.getItem(STORAGE_KEY)).toBe('true');
    });
  });

  describe('when localStorage is unavailable', () => {
    it('defaults to on rather than throwing during construction', () => {
      // Safari in private mode, and any embedding that blocks storage: `getItem` throws. The service
      // must still construct, because it is injected at app start.
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new DOMException('denied', 'SecurityError');
      });

      expect(createService().aiEnabled()).toBe(true);
    });

    it('still updates the in-memory flag when persisting throws', () => {
      const service = createService();
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('denied', 'SecurityError');
      });

      service.setEnabled(false);

      // The toggle has to work for the current session even if the choice cannot be remembered.
      expect(service.aiEnabled()).toBe(false);
    });
  });
});
