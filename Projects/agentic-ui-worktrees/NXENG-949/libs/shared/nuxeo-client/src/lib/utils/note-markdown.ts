function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Allows only absolute http(s) URLs for user-provided links and embeds. */
export function isSafeHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Converts note markdown body to HTML for read-only preview (matches Nuxeo Web UI). */
export function renderNoteMarkdown(text: string): string {
  const escaped = escapeHtml(text);

  return escaped
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label: string, href: string) => {
      if (!isSafeHttpUrl(href)) return match;
      return `<a href="${escapeHtml(href.trim())}" target="_blank" rel="noopener noreferrer">${label}</a>`;
    })
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>')
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hubloa])(.+)$/gm, '<p>$1</p>')
    .replace(/<p><\/p>/g, '');
}

export function isMarkdownNoteFormat(mimeType: string): boolean {
  return mimeType === 'text/markdown';
}
