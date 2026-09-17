/**
 * On-screen narration for a screencast with no audio.
 *
 * Playwright cannot record audio, so anything a narrator would say has to be
 * visible. The previous approach was to cut to a slide for each point, which is
 * what made the recording read as a slide deck. This injects the same words as an
 * overlay **on the running application** instead, so the app is never off screen.
 *
 * Two deliberate properties:
 *
 * - It is injected into the page, so a `page.reload()` wipes it. That is useful:
 *   a caption can never outlive the state it describes, which is precisely the
 *   failure mode of a slide asserting something the next cut does not show.
 * - It never covers the primary content column. The bar sits at the bottom and
 *   the code panel at the right, both over empty space at 1920×1080.
 */

const STYLE_ID = 'satori-caption-style';

const CSS = `
#satori-caption {
  position: fixed;
  /*
   * Clears the 15rem navigation column rather than spanning the window.
   * The shell puts the signed-in user and the Layer 1 manifest source at the
   * bottom of that column, and a full-width bar covered exactly the two lines a
   * caption was asserting — a narration that hides its own evidence.
   */
  left: 15rem;
  right: 0;
  bottom: 0;
  z-index: 2147483000;
  padding: 1.125rem 2rem 1.25rem;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  color: #eef4fb;
  background: rgba(11, 22, 34, 0.94);
  border-top: 3px solid #4c9aff;
}
#satori-caption b {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 1.0625rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #4c9aff;
}
#satori-caption span {
  display: block;
  font-size: 1.5rem;
  line-height: 1.35;
  max-width: 120ch;
}
#satori-code {
  position: fixed;
  right: 2rem;
  top: 2rem;
  z-index: 2147483000;
  width: 44rem;
  max-height: 70vh;
  overflow: hidden;
  padding: 1.25rem 1.5rem;
  border-radius: 10px;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  color: #eef4fb;
  background: rgba(11, 22, 34, 0.97);
  border: 1px solid #24405c;
  box-shadow: 0 18px 48px rgba(3, 10, 18, 0.55);
}
#satori-code b {
  display: block;
  margin-bottom: 0.75rem;
  font-size: 1rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #4c9aff;
}
#satori-code pre {
  margin: 0;
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 0.9375rem;
  line-height: 1.5;
  white-space: pre-wrap;
}
`;

/** Show, or replace, the bottom narration bar. */
export async function caption(page, label, text) {
  await page.evaluate(
    ({ label, text, css, styleId }) => {
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = css;
        document.head.append(style);
      }
      let bar = document.getElementById('satori-caption');
      if (!bar) {
        bar = document.createElement('aside');
        bar.id = 'satori-caption';
        document.body.append(bar);
      }
      // `textContent`, never `innerHTML`: these strings come from the scene, but
      // the repository's rule is absolute and a screencast is a bad place to
      // start making exceptions.
      bar.textContent = '';
      const heading = document.createElement('b');
      heading.textContent = label;
      const body = document.createElement('span');
      body.textContent = text;
      bar.append(heading, body);
    },
    { label, text, css: CSS, styleId: STYLE_ID },
  );
}

/**
 * Show the exact text the scene is about to write somewhere.
 *
 * Passed the same string that is written to disk or to Nuxeo, so the panel cannot
 * drift from what actually happened — the point of showing it at all.
 */
export async function showCode(page, label, code) {
  await page.evaluate(
    ({ label, code, css, styleId }) => {
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = css;
        document.head.append(style);
      }
      let panel = document.getElementById('satori-code');
      if (!panel) {
        panel = document.createElement('aside');
        panel.id = 'satori-code';
        document.body.append(panel);
      }
      panel.textContent = '';
      const heading = document.createElement('b');
      heading.textContent = label;
      const pre = document.createElement('pre');
      pre.textContent = code;
      panel.append(heading, pre);
    },
    { label, code, css: CSS, styleId: STYLE_ID },
  );
}

export async function hideCode(page) {
  await page.evaluate(() => document.getElementById('satori-code')?.remove());
}
