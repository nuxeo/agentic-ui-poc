/** HTML fragment for inserting multiple note pictures — one block per image (Web UI parity). */
export function buildNoteImagesInsertHtml(urls) {
    return urls.map((url) => `<p><img src="${escapeHtmlAttribute(url)}"></p>`).join('');
}
function escapeHtmlAttribute(value) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
