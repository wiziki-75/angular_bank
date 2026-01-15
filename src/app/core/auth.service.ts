import { Observable } from 'rxjs';

export abstract class AuthService {
  abstract register(data: any): Observable<any>;
  abstract login(data: any): Observable<any>;
  abstract getCurrentUser(): Observable<any>;
  abstract logout(): void;
  abstract getAccounts(): Observable<any[]>;
  abstract getTransactions(accountId: string): Observable<any[]>;
  abstract getStoredUser(): any | null;
  abstract getStoredToken(): string | null;
}