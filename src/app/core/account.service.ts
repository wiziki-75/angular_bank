import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface Account {
  id: string;
  balance: number;
  label: string;
  openAt: string;
  ownerId: string;
}

export interface OpenAccountDTO {
  initialBalance: number;
  label: string;
}

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  openAccount(accountData: OpenAccountDTO): Observable<any> {
    return this.http.post(
      `${this.API_URL}/accounts`,
      accountData
    );
  }

  getAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.API_URL}/accounts`);
  }

  getAccount(accountId: string): Observable<Account> {
    return this.http.get<Account>(`${this.API_URL}/accounts/${accountId}`);
  }

  getAccountTransactions(accountId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/accounts/${accountId}/transactions`);
  }
}
