import { Pipe, PipeTransform } from '@angular/core';
import DOMPurify, { type Config } from 'dompurify';
import { Marked, type RendererObject } from 'marked';

/**
 * The only tags the panel will put in the DOM. Everything a model can emit that is not on
 * this list — `script`, `style`, `iframe`, `form`, `input`, `img`, `svg` — is removed by
 * DOMPurify regardless of which stage produced it, so the safety of the output does not
 * depend on the markdown renderer above it being correct.
 *
 * `img` is deliberately absent: a chat answer is not a place to fetch an arbitrary remote
 * URL from, so images render as their alt text instead (see the `image` renderer below).
 */
const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'del',
  'code',
  'pre',
  'blockquote',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'ul',
  'ol',
  'li',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'a',
  'span',
];

/**
 * `class` carries the language hint on fenced code, `start` the first number of an ordered
 * list. `href`/`target`/`rel` are the anchor. Nothing else survives, including every
 * `on*` handler and `style`.
 */
const ALLOWED_ATTR = ['class', 'href', 'target', 'rel', 'start'];

/**
 * Every href this pipe emits has been through `new URL()` and is absolute, so the second,
 * independent URL check DOMPurify runs only has to accept the schemes we produce.
 * `javascript:`, `data:`, `vbscript:` and `blob:` all fail it.
 */
const ALLOWED_URI_REGEXP = /^(?:https?|mailto):/i;

const SANITIZE_CONFIG: Config = {
  ALLOWED_TAGS,
  ALLOWED_ATTR,
  ALLOWED_URI_REGEXP,
  // DOMPurify runs ALLOWED_URI_REGEXP over every attribute value, not just the ones that
  // hold a URL, so the attributes that are plainly not URLs have to say so — otherwise a
  // regexp tight enough to be useful on `href` would also strip `target="_blank"`.
  ADD_URI_SAFE_ATTR: ['class', 'target', 'rel', 'start'],
  // Explicit, so the invariant is exactly "only ALLOWED_ATTR survives" — DOMPurify would
  // otherwise still let arbitrary `data-*` and `aria-*` attributes through.
  ALLOW_DATA_ATTR: false,
  ALLOW_ARIA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
};

/** Schemes a link may resolve to. A link that resolves to anything else is not rendered. */
const SAFE_PROTOCOLS = ['http:', 'https:', 'mailto:'];

const HTML_ESCAPES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (character) => HTML_ESCAPES[character]);
}

/**
 * Resolves a markdown link target to an absolute URL, or `null` if it is not safe to click.
 *
 * The URL parser rather than a regex is what makes this decidable: it strips the tabs,
 * newlines and control characters that `java&#9;script:` style payloads use to hide a scheme,
 * so the protocol tested here is the protocol the browser would actually use.
 */
function safeHref(href: string): string | null {
  const trimmed = href.trim();
  if (!trimmed) return null;
  try {
    const resolved = new URL(trimmed, document.baseURI);
    return SAFE_PROTOCOLS.includes(resolved.protocol) ? resolved.href : null;
  } catch {
    return null;
  }
}

/**
 * Four overrides, each closing a hole the default renderer leaves open for untrusted input.
 * Everything else — tables, headings, rules, quotes, code, lists, emphasis — is marked's
 * own output, which escapes the text it interpolates.
 */
const renderer: RendererObject = {
  /**
   * Raw HTML in the model's answer is shown, never executed. Escaping rather than dropping
   * it also keeps the answer readable when the model is legitimately talking about markup.
   */
  html({ text }) {
    return escapeHtml(text);
  },

  /** No remote fetch from an answer: an image degrades to its alt text. */
  image({ text, href }) {
    return escapeHtml(text || href || '');
  },

  /**
   * A link whose target is not clickable degrades to its own text rather than disappearing,
   * so `[click](javascript:alert(1))` reads as `click` and does nothing.
   *
   * Rendered links open in a new tab: the panel's transcript is component state, so
   * navigating away in place would discard the conversation the link was cited in.
   * `noopener`/`noreferrer` deny the opened page a handle on this one, and `nofollow ugc`
   * marks the destination as untrusted third-party content, which it is.
   */
  link({ href, tokens }) {
    const label = this.parser.parseInline(tokens);
    const url = safeHref(href);
    if (!url) return label;
    return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer nofollow ugc">${label}</a>`;
  },

  /** `input` is not renderable here, so a GFM task list keeps its state as a glyph. */
  checkbox({ checked }) {
    return `<span class="ai-md-task">${checked ? '\u2611' : '\u2610'}</span> `;
  },
};

/**
 * A private parser instance rather than the `marked` singleton, so this configuration
 * cannot be changed by — or leak into — anything else that parses markdown.
 */
const markdown = new Marked(
  // `silent` matters during a demo: a parse failure becomes an error paragraph in one
  // bubble instead of an exception thrown out of change detection, which would take the
  // whole panel down mid-answer.
  { gfm: true, breaks: true, async: false, silent: true },
  { renderer },
);

/**
 * Renders assistant output as HTML.
 *
 * The source is a language model, which is not server-controlled: its output is steered by
 * document content the agent reads, which in an ECM repository is attacker-supplied in the
 * general case. It is treated as hostile throughout.
 *
 * That is why this pipe returns a plain `string` and not `SafeHtml`. Returning `SafeHtml`
 * would require `DomSanitizer.bypassSecurityTrustHtml`, which `AGENTS/07-security.md`
 * permits only for server-controlled sources. Returning a string instead means the
 * `[innerHTML]` binding runs Angular's own sanitizer over the result, so the markup that
 * reaches the DOM has passed two independent sanitizers:
 *
 * 1. DOMPurify with the closed allowlist above — the output can only contain `ALLOWED_TAGS`
 *    with `ALLOWED_ATTR`, and any `href` that is not http/https/mailto is dropped.
 * 2. Angular's `SecurityContext.HTML` sanitizer, which re-parses the string and applies its
 *    own element, attribute and URL allowlists.
 *
 * Neither stage trusts the markdown renderer, so a bug or a regression in marked cannot by
 * itself put executable markup on screen.
 */
@Pipe({ name: 'aiMarkdown', standalone: true })
export class AiMarkdownPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) return '';
    // Streamed text arrives mid-construct on almost every frame. marked's parser always
    // terminates on partial input — a half-written table or unclosed fence falls back to
    // the text it has — so no partial-input guard is needed here.
    const parsed = markdown.parse(value, { async: false }) as string;
    return DOMPurify.sanitize(parsed, SANITIZE_CONFIG);
  }
}
