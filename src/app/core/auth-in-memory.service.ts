// src/app/core/auth-in-memory.service.ts
import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthInMemoryService extends AuthService {
  register(data: any): Observable<any> {
    return of({ jwt: 'mock-token', user: { name: data.name, clientCode: '12345' } });
  }

  login(data: any): Observable<any> {
    return of({ jwt: 'mock-token', user: { name: 'Utilisateur Démo', clientCode: data.clientCode } });
  }

  getCurrentUser(): Observable<any> {
    return of({ name: 'Utilisateur Démo', clientCode: '12345' });
  }

  logout(): void { console.log('Déconnexion démo'); }

  getAccounts(): Observable<any[]> {
    return of([
      { id: '1', label: 'Compte Courant Démo', balance: 1500 },
      { id: '2', label: 'Livret A Démo', balance: 5000 }
    ]);
  }

  getTransactions(accountId: string): Observable<any[]> {
    return of([
      { id: 't1', amount: 50, emitter: { id: '1', owner: { name: 'Boulangerie' } }, createdAt: new Date() }
    ]);
  }

  getStoredUser() { return { name: 'Démo', clientCode: '12345' }; }
  getStoredToken() { return 'mock-token'; }
}