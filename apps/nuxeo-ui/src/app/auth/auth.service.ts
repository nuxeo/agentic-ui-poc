import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, throwError, tap } from 'rxjs';

import { NUXEO_API_ORIGIN } from '@agentic-ui/shared/nuxeo-client';

const STORAGE_KEY = 'agentic_ui_nuxeo_session';

interface StoredSession {
  username: string;
  basic: string;
  /** Set from `/me` on login and refresh. */
  isAdministrator: boolean;
}

/** Nuxeo may return boolean, string, or numeric 1 depending on marshaller/version. */
function isTruthyAdministratorFlag(value: unknown): boolean {
  return value === true || value === 'true' || value === 1;
}

/** Reads admin flag from Nuxeo `GET /me` (shape varies slightly by version). */
function readIsAdministratorFromMe(me: unknown): boolean {
  if (!me || typeof me !== 'object') return false;
  const o = me as Record<string, unknown>;
  if (isTruthyAdministratorFlag(o['isAdministrator'])) return true;
  const props = o['properties'];
  if (props && typeof props === 'object') {
    const p = (props as Record<string, unknown>)['isAdministrator'];
    if (isTruthyAdministratorFlag(p)) return true;
  }
  return false;
}

/** Default Nuxeo built-in admin user id — used if `/me` omits `isAdministrator`. */
function isBuiltInAdministratorUsername(username: string): boolean {
  return username.trim().toLowerCase() === 'administrator';
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiOrigin = inject(NUXEO_API_ORIGIN);

  private readonly state = signal<StoredSession | null>(null);

  readonly username = computed(() => this.state()?.username ?? null);
  readonly isAuthenticated = computed(() => this.state() !== null);
  /**
   * True when Nuxeo reports administrator on `/me`, or when using the built-in
   * `Administrator` account and the API omitted the flag (common with older sessions).
   */
  readonly isAdministrator = computed(() => {
    const s = this.state();
    if (!s) return false;
    if (s.isAdministrator) return true;
    return isBuiltInAdministratorUsername(s.username);
  });

  constructor() {
    this.restoreSession();
    if (this.state()) {
      this.refreshCurrentUser().subscribe({ error: () => {} });
    }
  }

  private apiUrl(path: string): string {
    const base = this.apiOrigin.replace(/\/$/, '');
    return `${base}${path}`;
  }

  private restoreSession(): void {
    const raw =
      sessionStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }
    try {
      const parsed = JSON.parse(raw) as StoredSession;
      if (parsed?.username && parsed?.basic) {
        this.state.set({
          ...parsed,
          isAdministrator: parsed.isAdministrator ?? false,
        });
      }
    } catch {
      this.clearStorage();
    }
  }

  private persist(session: StoredSession, remember: boolean): void {
    this.clearStorage();
    const payload = JSON.stringify(session);
    if (remember) {
      localStorage.setItem(STORAGE_KEY, payload);
    } else {
      sessionStorage.setItem(STORAGE_KEY, payload);
    }
  }

  private clearStorage(): void {
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_KEY);
  }

  /**
   * Validates credentials against Nuxeo (`GET /nuxeo/api/v1/me`).
   */
  login(
    username: string,
    password: string,
    remember: boolean,
  ): Observable<void> {
    const trimmed = username.trim();
    const basic = btoa(`${trimmed}:${password}`);
    const headers = new HttpHeaders({
      Authorization: `Basic ${basic}`,
      Accept: 'application/json',
    });

    return this.http
      .get<unknown>(this.apiUrl('/nuxeo/api/v1/me'), { headers })
      .pipe(
        tap((me) => {
          const session: StoredSession = {
            username: trimmed,
            basic,
            isAdministrator: readIsAdministratorFromMe(me),
          };
          this.state.set(session);
          this.persist(session, remember);
        }),
        map(() => undefined),
        catchError((err) =>
          throwError(
            () =>
              new Error(
                err?.status === 401 || err?.status === 403
                  ? 'Invalid username or password.'
                  : 'Could not reach Nuxeo. Check the server, proxy, and URL.',
              ),
          ),
        ),
      );
  }

  logout(): void {
    this.state.set(null);
    this.clearStorage();
  }

  /**
   * Refreshes `/me` so `isAdministrator` stays accurate (e.g. after restoring an older session).
   * No-op when not authenticated.
   */
  refreshCurrentUser(): Observable<void> {
    const session = this.state();
    if (!session) {
      return of(undefined);
    }
    return this.http
      .get<unknown>(this.apiUrl('/nuxeo/api/v1/me'), {
        headers: { Accept: 'application/json' },
      })
      .pipe(
        tap((me) => {
          const next: StoredSession = {
            ...session,
            isAdministrator: readIsAdministratorFromMe(me),
          };
          this.state.set(next);
          this.persistCurrent(next);
        }),
        map(() => undefined),
      );
  }

  private persistCurrent(session: StoredSession): void {
    const remember = localStorage.getItem(STORAGE_KEY) !== null;
    this.persist(session, remember);
  }

  /** Value for `Authorization: Basic …` (without the prefix). */
  basicCredentials(): string | null {
    return this.state()?.basic ?? null;
  }
}
