import { describe, beforeEach, afterEach, expect, it, vi } from 'vitest';

import {
  AI_PANEL_DEFAULT_WIDTH,
  AI_PANEL_MAX_WIDTH,
  AI_PANEL_MIN_CONTENT_WIDTH,
  AI_PANEL_MIN_WIDTH,
  AI_PANEL_WIDTH_STORAGE_KEY,
  aiPanelMaxWidth,
  clampAiPanelWidth,
  clampAiPanelWidthToBounds,
  readStoredAiPanelWidth,
  storeAiPanelWidth,
} from './ai-chat-panel-size';

/**
 * The width rules on their own. Everything here is arithmetic and a storage read, which
 * is exactly the part worth pinning without a component: the two-clamp split is easy to
 * collapse into one by accident, and doing so silently loses a preference.
 */
describe('AI panel width bounds', () => {
  it('keeps a width the user asked for inside the fixed bounds', () => {
    expect(clampAiPanelWidthToBounds(500)).toBe(500);
    expect(clampAiPanelWidthToBounds(10)).toBe(AI_PANEL_MIN_WIDTH);
    expect(clampAiPanelWidthToBounds(9999)).toBe(AI_PANEL_MAX_WIDTH);
  });

  it('rounds a sub-pixel width, because a drag produces one and CSS pixels are integers', () => {
    expect(clampAiPanelWidthToBounds(432.6)).toBe(433);
  });

  it('falls back to the default rather than propagating NaN', () => {
    expect(clampAiPanelWidthToBounds(Number.NaN)).toBe(AI_PANEL_DEFAULT_WIDTH);
    expect(clampAiPanelWidthToBounds(Number.POSITIVE_INFINITY)).toBe(AI_PANEL_DEFAULT_WIDTH);
    expect(clampAiPanelWidth(Number.NaN, 1440)).toBe(AI_PANEL_DEFAULT_WIDTH);
  });

  it('leaves the page behind the panel a usable width', () => {
    // A 900px window cannot give the panel its 720px maximum and still leave 360px of
    // content, so the panel's ceiling is what remains rather than the fixed maximum.
    expect(aiPanelMaxWidth(900)).toBe(900 - AI_PANEL_MIN_CONTENT_WIDTH);
    expect(aiPanelMaxWidth(900)).toBeLessThan(AI_PANEL_MAX_WIDTH);
  });

  it('does not exceed the fixed maximum however wide the window is', () => {
    expect(aiPanelMaxWidth(5000)).toBe(AI_PANEL_MAX_WIDTH);
  });

  /**
   * The degenerate window. Below roughly 680px there is no width that satisfies both
   * floors, and the alternative to picking one is a max below the min — an empty range,
   * which would make `clamp` return the max and snap the panel *narrower* than its own
   * minimum every time the width was read.
   */
  it('never reports a maximum below the minimum, however narrow the window', () => {
    expect(aiPanelMaxWidth(400)).toBe(AI_PANEL_MIN_WIDTH);
    expect(aiPanelMaxWidth(0)).toBe(AI_PANEL_MIN_WIDTH);
    expect(aiPanelMaxWidth(-100)).toBe(AI_PANEL_MIN_WIDTH);
  });

  it('falls back to the default when the viewport width is not a number', () => {
    expect(aiPanelMaxWidth(Number.NaN)).toBe(AI_PANEL_DEFAULT_WIDTH);
  });

  /**
   * The reason there are two clamps rather than one.
   *
   * A stored 700px is a legitimate preference. Reading it in a 900px window has to yield
   * 540px so the page stays usable — but the stored value must still be 700, so the
   * preference comes back when the window is widened again. A single clamp applied on the
   * way in would overwrite 700 with 540 and the user would have silently lost the width
   * they chose by having once opened the app in a small window.
   */
  it('narrows a wide preference to fit the window without discarding it', () => {
    expect(clampAiPanelWidth(700, 900)).toBe(900 - AI_PANEL_MIN_CONTENT_WIDTH);
    expect(clampAiPanelWidthToBounds(700)).toBe(700);
    expect(clampAiPanelWidth(700, 1440)).toBe(700);
  });

  it('holds the minimum even in a window too narrow for it', () => {
    expect(clampAiPanelWidth(AI_PANEL_DEFAULT_WIDTH, 500)).toBe(AI_PANEL_MIN_WIDTH);
  });
});

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

describe('AI panel width storage', () => {
  let storage: ReturnType<typeof memoryStorage>;

  function seed(entries: Record<string, string> = {}) {
    storage = memoryStorage(entries);
    vi.stubGlobal('localStorage', storage);
  }

  beforeEach(() => seed());
  afterEach(() => vi.unstubAllGlobals());

  it('round-trips a width', () => {
    storeAiPanelWidth(560);
    expect(readStoredAiPanelWidth()).toBe(560);
  });

  it('uses the default when nothing has been stored', () => {
    expect(readStoredAiPanelWidth()).toBe(AI_PANEL_DEFAULT_WIDTH);
  });

  it('clamps a stale or hand-edited value instead of discarding it', () => {
    seed({ [AI_PANEL_WIDTH_STORAGE_KEY]: '4000' });
    expect(readStoredAiPanelWidth()).toBe(AI_PANEL_MAX_WIDTH);
  });

  it('falls back to the default for a value that is not a width at all', () => {
    seed({ [AI_PANEL_WIDTH_STORAGE_KEY]: 'wide please' });
    expect(readStoredAiPanelWidth()).toBe(AI_PANEL_DEFAULT_WIDTH);
  });

  it('clamps on the way out as well, so a bad value cannot be written', () => {
    storeAiPanelWidth(9999);
    expect(storage.store.get(AI_PANEL_WIDTH_STORAGE_KEY)).toBe(String(AI_PANEL_MAX_WIDTH));
  });

  /**
   * Safari in private browsing, and any origin with storage blocked. A panel that cannot
   * remember its width is a papercut; a panel that throws on open is a broken app.
   */
  it('survives a storage that throws on read and on write', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new DOMException('denied', 'SecurityError');
      },
      setItem: () => {
        throw new DOMException('denied', 'SecurityError');
      },
      removeItem: () => undefined,
      clear: () => undefined,
    });

    expect(readStoredAiPanelWidth()).toBe(AI_PANEL_DEFAULT_WIDTH);
    expect(() => storeAiPanelWidth(500)).not.toThrow();
  });
});
