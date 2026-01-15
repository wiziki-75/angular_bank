import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AccountService, Account, OpenAccountDTO } from './account.service';

@Injectable({ providedIn: 'root' })
export class AccountInMemoryService extends AccountService {
  
  private mockAccounts: Account[] = [
    { id: '1', label: 'Compte Courant', balance: 2450.75, openAt: '2024-01-01', ownerId: 'user_1' },
    { id: '2', label: 'Livret A', balance: 10000.00, openAt: '2024-02-15', ownerId: 'user_1' }
  ];

  openAccount(accountData: OpenAccountDTO): Observable<any> {
    return of({ message: 'Compte créé (Mock)', id: Math.random().toString() });
  }

  getAccounts(): Observable<Account[]> {
    return of(this.mockAccounts);
  }

  getAccount(accountId: string): Observable<Account> {
    const account = this.mockAccounts.find(a => a.id === accountId) || this.mockAccounts[0];
    return of(account);
  }

  getAccountTransactions(accountId: string): Observable<any[]> {
    return of([
      { id: 'tx1', amount: 50, emitter: { id: accountId, owner: { name: 'Moi' } }, receiver: { owner: { name: 'Amazon' } }, createdAt: new Date().toISOString() },
      { id: 'tx2', amount: 1200, emitter: { id: 'other', owner: { name: 'Employeur' } }, receiver: { id: accountId, owner: { name: 'Moi' } }, createdAt: new Date().toISOString() }
    ]);
  }
}