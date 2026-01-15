import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { AccountService, Account } from '../../core/account.service';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

export interface User {
  id?: string | number;
  name: string;
  clientCode?: string;
  [key: string]: any;
}

export interface Transaction {
  id: string | number;
  type: 'EMIT' | 'RECEIVE' | string;
  amount: number;
  receiverName?: string;
  senderName?: string;
  label?: string;
  name?: string;
  createdAt?: string;
  date?: string;
  emittedAt?: string;
  issuedAt?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  user: User | null = null;
  accounts: Account[] = [];
  selectedAccount: Account | null = null;

  balance = 0;
  transactions: Transaction[] = [];
  errorMessage: string = '';

  constructor(
    private authService: AuthService,
    private accountService: AccountService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('Dashboard init');

    const storedUser = this.authService.getStoredUser();
    if (!storedUser) {
      this.router.navigate(['/register']);
      return;
    }

    this.user = storedUser;
    this.loadAccounts();
  }

  /* =========================
     DATA
     ========================= */

  private loadAccounts(): void {
    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;

        if (!accounts || accounts.length === 0) {
          console.warn('Aucun compte trouvé');
          this.errorMessage = 'Aucun compte disponible';
          return;
        }

        this.selectedAccount = accounts[0];
        this.loadAccountData();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement comptes', err);
        this.errorMessage = 'Impossible de charger vos comptes';
      }
    });
  }

  onAccountSelect(account: Account): void {
    this.selectedAccount = account;
    this.balance = 0;
    this.transactions = [];
    this.errorMessage = '';
    this.loadAccountData();
  }

  private loadAccountData(): void {
    if (!this.selectedAccount) return;

    const accountId = this.getAccountId();
    if (!accountId) return;

    this.balance = this.getBalance();

    this.authService.getTransactions(String(accountId)).subscribe({
      next: (txs) => {
        console.log('Transactions chargées:', txs);
        this.transactions = (txs ?? [])
          .sort((a: any, b: any) => {
            const da = new Date(a.createdAt ?? a.date ?? a.emittedAt ?? a.issuedAt).getTime();
            const db = new Date(b.createdAt ?? b.date ?? b.emittedAt ?? b.issuedAt).getTime();
            return db - da;
          })
          .slice(0, 10);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement transactions', err);
        this.errorMessage = 'Impossible de charger les transactions';
      }
    });
  }

  /* =========================
     HELPERS - Account properties
     ========================= */

  getAccountId(account?: Account): string | number | null {
    const acc = account ?? this.selectedAccount;
    if (!acc) return null;
    return (acc as any).id ??
           (acc as any).accountId ??
           (acc as any).account_id ??
           null;
  }

  getBalance(account?: Account): number {
    const acc = account ?? this.selectedAccount;
    if (!acc) return 0;
    const a = acc as any;
    return a.balance ?? a.total ?? a.solde ?? 0;
  }

  getAccountLabel(account?: Account): string {
    const acc = account ?? this.selectedAccount;
    if (!acc) return 'Sans label';
    const a = acc as any;
    return a.clientCode ?? a.label ?? a.name ?? 'Sans label';
  }

  /* =========================
     UI HELPERS
     ========================= */

  getInitials(name: string): string {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}h${minutes}`;
  }

  /* =========================
     NEW ✅ CLICK TX -> DETAIL
     ========================= */

  goToTransactionDetail(tx: Transaction): void {
    // ✅ on passe l'objet transaction directement (pas besoin de re-fetch)
    this.router.navigate(['/transaction-detail'], {
      state: { transaction: tx }
    });
  }

  /* =========================
     ACTIONS
     ========================= */

  goToTransfer(): void {
    this.router.navigate(['/transaction']);
  }

  goToInfo(): void {
    this.router.navigate(['/info'], {
      state: { selectedAccount: this.selectedAccount }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/register']);
  }
}
