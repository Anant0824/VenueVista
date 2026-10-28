import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { API_BASE } from '../constants';
import { VenueStore } from './venue.store';

interface AuthResponse {
  token: string;
  role: string;
  roles: string[];
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly venueStore = inject(VenueStore);

  readonly currentToken = signal<string | null>(null);
  readonly currentUserRole = signal<string | null>(null);
  readonly currentUsername = signal<string | null>(null);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.currentToken.set(localStorage.getItem('token'));
      this.currentUserRole.set(localStorage.getItem('role'));
      this.currentUsername.set(localStorage.getItem('username'));
    }
  }

  login(credentials: { username: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE}/auth/login`, credentials).pipe(
      tap((response) => {
        this.logSuccessfulLogin(response);
        this.saveSession(response);
      }),
    );
  }

  signup(credentials: { username: string; password: string; email: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_BASE}/auth/signup`, credentials).pipe(
      tap((response) => this.saveSession(response)),
    );
  }

  private saveSession(response: AuthResponse): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('role', response.role);
      localStorage.setItem('username', response.username);
    }

    this.currentToken.set(response.token);
    this.currentUserRole.set(response.role);
    this.currentUsername.set(response.username);
    this.venueStore.load();
  }

  private logSuccessfulLogin(response: AuthResponse): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    console.info('[Auth debug] Login response (token redacted):', {
      ...response,
      token: '[REDACTED]',
    });

    try {
      const payloadSegment = response.token.split('.')[1];
      if (!payloadSegment) {
        throw new Error('JWT payload is missing.');
      }

      const base64Payload = payloadSegment
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(Math.ceil(payloadSegment.length / 4) * 4, '=');
      const payloadBytes = Uint8Array.from(atob(base64Payload), (character) => character.charCodeAt(0));
      const claims = JSON.parse(new TextDecoder().decode(payloadBytes)) as Record<string, unknown>;

      console.info('[Auth debug] Decoded JWT claims:', claims);
      console.info('[Auth debug] Role supplied by backend:', response.role);
      if (claims['role'] !== response.role) {
        console.warn('[Auth debug] Backend response role does not match JWT role claim.');
      }
    } catch (error) {
      console.warn('[Auth debug] Unable to decode login JWT payload.', error);
    }
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('username');
    }

    this.currentToken.set(null);
    this.currentUserRole.set(null);
    this.currentUsername.set(null);
    this.venueStore.reset();
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.currentToken();
  }

  isCreator(): boolean {
    return this.currentUserRole() === 'ROLE_CREATOR' || this.currentUserRole() === 'ROLE_ADMIN';
  }
}
