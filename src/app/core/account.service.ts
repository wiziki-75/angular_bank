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

export abstract class AccountService {
  abstract openAccount(accountData: OpenAccountDTO): Observable<any>;
  abstract getAccounts(): Observable<Account[]>;
  abstract getAccount(accountId: string): Observable<Account>;
  abstract getAccountTransactions(accountId: string): Observable<any[]>;
}