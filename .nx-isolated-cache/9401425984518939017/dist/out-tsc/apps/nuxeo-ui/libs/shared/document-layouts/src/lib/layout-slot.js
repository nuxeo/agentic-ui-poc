import { EXTENSION_SLOTS, } from '@nuxeo/satori-platform/extensions';
/**
 * The entry that replaces a type's layout in one mode, or `null` for the layout itself: the first,
 * by order, whose rule passes and whose component this build has. Each mode is its own slot, and
 * each is resolved by name so the reference check can see it is read.
 */
export function layoutSlotEntry(extensions, components, mode, context) {
    const entries = mode === 'metadata'
        ? extensions.resolve(EXTENSION_SLOTS.documentMetadata, context)
        : mode === 'edit'
            ? extensions.resolve(EXTENSION_SLOTS.documentEdit, context)
            : extensions.resolve(EXTENSION_SLOTS.documentCreate, context);
    return entries.find((entry) => components.has(entry.componentId ?? entry.id)) ?? null;
}
/**
 * What a create form's rules read as the document: the type being created, in the folder it is
 * created in. Rules such as `app.rules.isType` then answer for the new document, not for the folder.
 */
export function documentToCreate(type, parentPath) {
    const folder = parentPath ? withoutTrailingSlashes(parentPath) : '';
    return {
        uid: '',
        title: '',
        type,
        path: `${folder}/`,
        lastModified: '',
        properties: {},
        facets: [],
    };
}
/**
 * `path` less its trailing slashes, counted back from the end. `/\/+$/` retries from each slash of
 * a run that does not end the path, so a long run takes quadratic time.
 */
function withoutTrailingSlashes(path) {
    let end = path.length;
    while (end > 0 && path[end - 1] === '/')
        end -= 1;
    return path.slice(0, end);
}
