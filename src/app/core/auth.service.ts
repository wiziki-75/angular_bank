import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  register(userData: any): Observable<any> {
    return this.http.post(`${this.API_URL}/auth/register`, userData);
  }

  // On ajoute .pipe(tap(...)) pour intercepter la réponse du login
  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/auth/login`, credentials).pipe(
      tap(response => {
        console.log('Login response:', response.jwt);
        if (response && response.jwt) {
          // On stocke le token JWT dans le navigateur
          localStorage.setItem('auth_token', response.jwt);
        }
      })
    );
  }

  // Nouvelle méthode pour récupérer les infos de l'utilisateur connecté
  getCurrentUser(): Observable<any> {
    const token = localStorage.getItem('auth_token');
    console.log(token)
    
    // On crée les headers avec le format standard 'Bearer'
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    return this.http.get(`${this.API_URL}/auth/current-user`, { headers });
  }

  // Pour vider le stockage à la déconnexion
  logout(): void {
    localStorage.removeItem('auth_token');
  }
}