import { filter, map } from 'rxjs';
import { SavedSearchDialogComponent } from '@nuxeo/satori-platform/ui';
/**
 * Asks for a saved search's name — for Save as, or with `initial` for Rename — and emits it trimmed,
 * or nothing when the dialog is dismissed or left blank.
 */
export function askSavedSearchName(dialog, translate, options) {
    return dialog
        .open(SavedSearchDialogComponent, {
        data: {
            title: options.heading,
            placeholder: translate.instant('saved-search.dialog.name-placeholder'),
            initialValue: options.initial,
        },
    })
        .afterClosed()
        .pipe(map((name) => (typeof name === 'string' ? name.trim() : '')), filter((name) => name.length > 0));
}
