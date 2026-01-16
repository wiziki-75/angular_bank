import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  id: string;
  name: string;
  clientCode: string;
  createdAt?: string;
}

export interface AuthResponse {
  jwt?: string;
  access_token?: string;
  accessToken?: string;
  token?: string;
  user?: User;
  currentUser?: User;
}

export interface RegisterRequest {
  name: string;
  password: string;
}

export interface LoginRequest {
  clientCode: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/register`, data).pipe(
      tap((res) => {
        this.persistAuthFromResponse(res);
      })
    );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/auth/login`, data).pipe(
      tap((res) => {
        this.persistAuthFromResponse(res);
      })
    );
  }

  getCurrentUser(): Observable<User> {
    const token = this.getStoredToken();
    if (!token) return throwError(() => new Error('No token'));

    return this.http.get<User>(`${this.API_URL}/auth/current-user`).pipe(
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

  getStoredUser(): User | null {
    const raw = localStorage.getItem('current_user');
    return raw ? JSON.parse(raw) : null;
  }

  getStoredToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private persistAuthFromResponse(res: AuthResponse): void {
    const token = res?.jwt ?? res?.access_token ?? res?.accessToken ?? res?.token ?? null;
    const user = res?.user ?? res?.currentUser ?? null;

    if (token) localStorage.setItem('access_token', token);
    if (user) localStorage.setItem('current_user', JSON.stringify(user));
  }
}
