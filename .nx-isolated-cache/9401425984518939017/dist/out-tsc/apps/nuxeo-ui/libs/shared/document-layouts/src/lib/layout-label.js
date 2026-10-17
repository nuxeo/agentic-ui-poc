import { humanize } from './resolve-layout';
/** A label's text: the literal, else the first key that translates, else the readable fallback. */
export function layoutLabelText(translate, label) {
    if (label.literal)
        return label.literal;
    for (const key of label.keys) {
        const translated = translate.instant(key);
        if (typeof translated === 'string' && translated !== key)
            return translated;
    }
    return label.fallback;
}
/**
 * A resolved edit or create layout as the metadata editor's sections. A tab needs a name, so a
 * section with no heading is named from its id in tabs display.
 */
export function toEditorSections(layout, text) {
    return layout.sections.map((section) => ({
        id: section.id,
        heading: text(section.label) ?? (layout.display === 'tabs' ? humanize(section.id) : null),
        fields: section.fields.map((field) => ({
            xpath: field.xpath,
            label: text(field.label) ?? field.xpath,
            definition: field.definition,
        })),
    }));
}
