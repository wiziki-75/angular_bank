import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthHttpService extends AuthService {
  private readonly API_URL = 'https://coding-bank.fly.dev';

  constructor(private http: HttpClient) {
    super();
  }

  /* =========================
     AUTH
     ========================= */

  register(data: { name: string; password: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/register`, data).pipe(
      tap((res: any) => {
        this.persistAuthFromResponse(res);
        const user = this.getStoredUser();
        console.log('🆔 Identifiant client créé :', user?.clientCode);
      })
    );
  }

  login(data: { clientCode: string; password: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/login`, data).pipe(
      tap((res: any) => {
        this.persistAuthFromResponse(res);
      })
    );
  }

  getCurrentUser(): Observable<any> {
    const token = this.getStoredToken();
    if (!token) return throwError(() => new Error('No token'));

    return this.http.get(`${this.API_URL}/auth/current-user`, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap((res: any) => {
        const user = res?.user ?? res;
        if (user) localStorage.setItem('current_user', JSON.stringify(user));
      })
    );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
  }

  /* =========================
     ACCOUNTS
     ========================= */

  getAccounts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/accounts`, {
      headers: this.getAuthHeaders()
    });
  }

  getTransactions(accountId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.API_URL}/accounts/${accountId}/transactions`,
      { headers: this.getAuthHeaders() }
    );
  }

  /* =========================
     STORAGE HELPERS
     ========================= */

  getStoredUser(): any | null {
    const raw = localStorage.getItem('current_user');
    return raw ? JSON.parse(raw) : null;
  }

  getStoredToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private persistAuthFromResponse(res: any): void {
    // ✅ Coding-bank renvoie le token dans "jwt"
    const token =
      res?.jwt ??
      res?.access_token ??
      res?.accessToken ??
      res?.token ??
      null;

    const user =
      res?.user ??
      res?.currentUser ??
      null;

    if (token) localStorage.setItem('access_token', token);
    if (user) localStorage.setItem('current_user', JSON.stringify(user));

    // Debug
    console.log('AUTH RESPONSE:', res);
    console.log('TOKEN STORED:', token);
    console.log('USER STORED:', user);
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getStoredToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token ?? ''}`
    });
  }
}
