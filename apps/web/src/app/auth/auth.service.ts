import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, throwError, tap } from 'rxjs';

import { NUXEO_API_ORIGIN } from '../nuxeo-api.config';

const STORAGE_KEY = 'agentic_ui_nuxeo_session';

interface StoredSession {
  username: string;
  basic: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiOrigin = inject(NUXEO_API_ORIGIN);

  private readonly state = signal<StoredSession | null>(null);

  readonly username = computed(() => this.state()?.username ?? null);
  readonly isAuthenticated = computed(() => this.state() !== null);

  constructor() {
    this.restoreSession();
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
        this.state.set(parsed);
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
        tap(() => {
          const session: StoredSession = { username: trimmed, basic };
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

  /** Value for `Authorization: Basic …` (without the prefix). */
  basicCredentials(): string | null {
    return this.state()?.basic ?? null;
  }
}
