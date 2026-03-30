import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface NuxeoUserResponse {
  id: string;
  properties?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    [key: string]: unknown;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly currentUserSubject = new BehaviorSubject<User | null>(this.loadUser());
  readonly currentUser$ = this.currentUserSubject.asObservable();

  private loadUser(): User | null {
    try {
      const stored = localStorage.getItem('nuxeo_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  get isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  get token(): string | null {
    return localStorage.getItem('nuxeo_token');
  }

  login(username: string, password: string): Observable<User> {
    const token = btoa(`${username}:${password}`);
    const headers = new HttpHeaders({ Authorization: `Basic ${token}` });
    return this.http
      .get<NuxeoUserResponse>(`${environment.nuxeoUrl}/api/v1/me`, { headers })
      .pipe(
        tap((resp) => {
          const user: User = {
            id: resp.id,
            firstName: resp.properties?.['firstName'],
            lastName: resp.properties?.['lastName'],
            email: resp.properties?.['email'],
          };
          localStorage.setItem('nuxeo_token', token);
          localStorage.setItem('nuxeo_user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }),
        catchError((err) => throwError(() => err)),
      );
  }

  logout(): void {
    localStorage.removeItem('nuxeo_token');
    localStorage.removeItem('nuxeo_user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }
}
