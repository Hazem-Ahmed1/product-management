import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';
import type { LoginRequest, LoginResponse, User } from '../models/auth.model';

/**
 * Security strategy: SESSION STORAGE
 * ─────────────────────────────────
 * The token is stored in sessionStorage to persist across reloads but clear when the tab closes.
 */

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // ── State ────────────────────────────────────────────────────────
  private readonly _token = signal<string | null>(this.getInitialToken());
  private readonly _user = signal<User | null>(this.getInitialUser());

  /** Read-only signal consumed by the HTTP interceptor. */
  readonly token = this._token.asReadonly();

  /** Reactive boolean: true when a valid token is held in memory. */
  readonly isAuthenticated = computed(() => !!this._token());

  /** The currently authenticated user (non-sensitive profile data). */
  readonly currentUser = this._user.asReadonly();

  /** Session expiration logic is obsolete with localStorage, keeping for compatibility */
  readonly sessionExpired = computed(() => false);

  // ─────────────────────────────────────────────────────────────────

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(
        `${environment.apiBaseUrl}/auth/login`,
        credentials,
      )
      .pipe(
        tap((res) => this.startSession(res)),
        catchError((err: HttpErrorResponse) => this.handleError(err)),
      );
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }


  handleUnauthorized(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  // ── Private helpers ───────────────────────────────────────────────

  private startSession(res: LoginResponse): void {
    this._token.set(res.token);
    this._user.set(res.user);
    sessionStorage.setItem('shop_admin_token', res.token);
    if (res.user) {
      sessionStorage.setItem('shop_admin_user', JSON.stringify(res.user));
    }
  }

  private clearSession(): void {
    this._token.set(null);
    this._user.set(null);
    sessionStorage.removeItem('shop_admin_token');
    sessionStorage.removeItem('shop_admin_user');
  }

  private getInitialToken(): string | null {
    try {
      return sessionStorage.getItem('shop_admin_token');
    } catch {
      return null;
    }
  }

  private getInitialUser(): User | null {
    try {
      const userStr = sessionStorage.getItem('shop_admin_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  private handleError(err: HttpErrorResponse): Observable<never> {
    let message = 'An unexpected error occurred. Please try again.';

    if (err.status === 404) {
      message = 'No account found with those credentials.';
    } else if (err.status === 422) {
      const body = err.error as {
        message?: string;
        errors?: Record<string, string[]>;
      };
      message = body?.message ?? 'Validation error. Please check your inputs.';
    } else if (err.status === 401) {
      message = 'Your session has expired. Please sign in again.';
    } else if (err.status === 0) {
      message =
        'Unable to reach the server. Check your internet connection.';
    }

    return throwError(() => new Error(message));
  }
}
