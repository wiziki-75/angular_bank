import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface Account {
  id: string;
  balance: number;
  clientCode: string;
  createdAt: string;
}

export interface OpenAccountDTO {
  clientCode: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  openAccount(accountData: OpenAccountDTO): Observable<any> {
    return this.http.post(
      `${this.API_URL}/accounts`,
      accountData,
      { headers: this.getHeaders() }
    );
  }

  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(
      `${this.API_URL}/accounts`,
      { headers: this.getHeaders() }
    );
  }

  getAccount(accountId: string): Observable<Account> {
    return this.http.get<Account>(
      `${this.API_URL}/accounts/${accountId}`,
      { headers: this.getHeaders() }
    );
  }

  getAccountTransactions(accountId: string): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.API_URL}/accounts/${accountId}/transactions`,
      { headers: this.getHeaders() }
    );
  }
}
