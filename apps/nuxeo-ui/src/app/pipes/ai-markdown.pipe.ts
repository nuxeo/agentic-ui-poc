import { Pipe, PipeTransform, inject } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({ name: 'aiMarkdown', standalone: true })
export class AiMarkdownPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(value: string): SafeHtml {
    let html = this.escapeHtml(value);

    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    html = html.replace(/^(\d+)\.\s+(.*)$/gm, '<li class="ai-ol-item" value="$1">$2</li>');
    html = html.replace(
      /((?:<li class="ai-ol-item"[^>]*>.*?<\/li>\n?)+)/g,
      '<ol class="ai-list">$1</ol>',
    );

    html = html.replace(/^[-•]\s+(.*)$/gm, '<li class="ai-ul-item">$1</li>');
    html = html.replace(
      /((?:<li class="ai-ul-item">.*?<\/li>\n?)+)/g,
      '<ul class="ai-list">$1</ul>',
    );

    html = html.replace(/\n/g, '<br>');
    html = html.replace(/(<\/?(?:ol|ul|li)[^>]*>)<br>/g, '$1');
    html = html.replace(/<br>(<\/?(?:ol|ul|li)[^>]*>)/g, '$1');

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private escapeHtml(text: string): string {
    const map: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
    return text.replace(/[&<>"]/g, (c) => map[c]);
  }
}
