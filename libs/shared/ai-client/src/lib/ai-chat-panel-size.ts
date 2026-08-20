/**
 * How wide the assistant panel may be, and where that width is kept.
 *
 * Split out of `AiChatService` for the same reason `app-theme.ts` is split out of
 * `AppThemeService`: the clamping is the part with rules in it, and those rules are
 * worth testing without a TestBed.
 *
 * Two clamps, deliberately, because a width has two different wrong values. A width
 * outside {@link AI_PANEL_MIN_WIDTH}..{@link AI_PANEL_MAX_WIDTH} is *never* legitimate
 * and is corrected on the way in. A width that merely does not fit *this* window is
 * legitimate and is corrected only on the way out — see {@link clampAiPanelWidth}.
 */

/**
 * Narrowest useful panel.
 *
 * The transcript, the composer and the mounted widgets are laid out for a 400px column
 * and their container queries switch to a compact density below roughly 300px of inner
 * width, which is what this leaves once the panel's own padding is taken off. Narrower
 * than this and the header's four controls start colliding.
 */
export const AI_PANEL_MIN_WIDTH = 320;

/**
 * Widest panel, regardless of how much room the window has.
 *
 * A cap rather than "as wide as you like": the panel is a side channel onto the page
 * behind it, and past this the transcript's own line length is the thing that suffers.
 */
export const AI_PANEL_MAX_WIDTH = 720;

/** The width the panel has always had, and what a reset returns to. */
export const AI_PANEL_DEFAULT_WIDTH = 400;

/**
 * Application content that must survive beside an expanded panel.
 *
 * `mat-sidenav` in `side` mode takes its width out of the content rather than covering
 * it, so an unbounded panel does not overlap the page — it squeezes it until the
 * document list is unusable. This is the floor under that.
 */
export const AI_PANEL_MIN_CONTENT_WIDTH = 360;

export const AI_PANEL_WIDTH_STORAGE_KEY = 'agentic_ui_ai_panel_width';

/**
 * The widest the panel may be in a window this size.
 *
 * {@link AI_PANEL_MIN_WIDTH} wins when the window is too narrow for both panel and
 * content, because the alternative is a max below the min and therefore an empty range.
 * In that window the panel is simply not resizable, which is the honest answer.
 */
export function aiPanelMaxWidth(viewportWidth: number): number {
  if (!Number.isFinite(viewportWidth)) return AI_PANEL_DEFAULT_WIDTH;
  return Math.max(
    AI_PANEL_MIN_WIDTH,
    Math.min(AI_PANEL_MAX_WIDTH, Math.round(viewportWidth) - AI_PANEL_MIN_CONTENT_WIDTH),
  );
}

/**
 * A width the panel may be asked for, whatever the window is currently doing.
 *
 * This is the clamp applied when the width is *set*. It deliberately does not consult
 * the viewport: a request made while the window was wide should survive the window
 * being temporarily narrow, so the viewport clamp belongs on the read side.
 */
export function clampAiPanelWidthToBounds(width: number): number {
  if (!Number.isFinite(width)) return AI_PANEL_DEFAULT_WIDTH;
  return Math.min(Math.max(Math.round(width), AI_PANEL_MIN_WIDTH), AI_PANEL_MAX_WIDTH);
}

/** The width the panel actually gets: the requested width, narrowed to fit the window. */
export function clampAiPanelWidth(width: number, viewportWidth: number): number {
  const max = aiPanelMaxWidth(viewportWidth);
  if (!Number.isFinite(width)) return Math.min(AI_PANEL_DEFAULT_WIDTH, max);
  return Math.min(Math.max(Math.round(width), AI_PANEL_MIN_WIDTH), max);
}

/**
 * The stored width, or the default.
 *
 * Out-of-range is clamped rather than discarded — a hand-edited or stale value is a
 * preference expressed badly, not a reason to forget it — but anything unparseable
 * falls back, and a storage that throws (Safari private browsing, a blocked origin)
 * is not allowed to take the panel down with it.
 */
export function readStoredAiPanelWidth(): number {
  try {
    const raw = localStorage.getItem(AI_PANEL_WIDTH_STORAGE_KEY);
    if (raw === null) return AI_PANEL_DEFAULT_WIDTH;
    const parsed = Number.parseInt(raw, 10);
    return Number.isFinite(parsed) ? clampAiPanelWidthToBounds(parsed) : AI_PANEL_DEFAULT_WIDTH;
  } catch {
    return AI_PANEL_DEFAULT_WIDTH;
  }
}

export function storeAiPanelWidth(width: number): void {
  try {
    localStorage.setItem(AI_PANEL_WIDTH_STORAGE_KEY, String(clampAiPanelWidthToBounds(width)));
  } catch {
    /* A preference that cannot be saved is still worth honouring for this session. */
  }
}
