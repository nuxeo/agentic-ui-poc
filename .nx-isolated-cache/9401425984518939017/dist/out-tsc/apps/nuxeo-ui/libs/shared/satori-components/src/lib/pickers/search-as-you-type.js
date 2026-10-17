import { DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, concat, defer, map, of, switchMap, timer, } from 'rxjs';
/** Web UI's selectivity waits 300 ms after the last key before it asks the server. */
export const NXS_SEARCH_DEBOUNCE_MS = 300;
/**
 * A search that follows what the user types: `short` below `minChars`, `searching` at once, and the
 * server asked once the user has paused for `NXS_SEARCH_DEBOUNCE_MS`. A newer term cancels an older
 * request, so a late answer never replaces the results for what is typed now, and a failed request
 * is a state rather than an error, so the field keeps working. Call it in an injection context; the
 * subscription ends with the component.
 */
export function nxsSearchAsYouType(search, minChars) {
    const idle = { status: 'idle', term: '', results: [] };
    const state = signal(idle, ...(ngDevMode ? [{ debugName: "state" }] : []));
    const terms = new Subject();
    terms
        .pipe(switchMap((text) => {
        const term = (text ?? '').trim();
        if (!term)
            return of(idle);
        if (term.length < Math.max(1, minChars()))
            return of({ status: 'short', term, results: [] });
        return concat(of({ status: 'searching', term, results: [] }), timer(NXS_SEARCH_DEBOUNCE_MS).pipe(switchMap(() => defer(() => search(term))), map((results) => ({
            status: results.length ? 'found' : 'none',
            term,
            results,
        })), catchError(() => of({ status: 'failed', term, results: [] }))));
    }), takeUntilDestroyed(inject(DestroyRef)))
        .subscribe((next) => state.set(next));
    return {
        state: state.asReadonly(),
        query: (text) => terms.next(text),
        reset: () => terms.next(null),
    };
}
