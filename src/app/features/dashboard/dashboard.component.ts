import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { AccountService, Account } from '../../core/account.service';
import { DataParserService } from '../../core/data-parser.service';
import { FormatService } from '../../core/format.service';
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
  emitter: any;
  receiver: any;
  description?: string;
  receiverName?: string;
  senderName?: string;
  label?: string;
  name?: string;
  createdAt?: string;
  date?: string;
  emittedAt?: string;
  issuedAt?: string;
  status?: string;
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
    private dataParser: DataParserService,
    private format: FormatService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const storedUser = this.authService.getStoredUser();
    if (!storedUser) {
      this.router.navigate(['/register']);
      return;
    }

    this.user = storedUser;
    this.loadAccounts();
  }

  private loadAccounts(): void {
    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;

        if (!accounts || accounts.length === 0) {
          this.errorMessage = 'Aucun compte disponible';
          return;
        }

        this.selectedAccount = accounts[0];
        this.loadAccountData();
        this.cdr.detectChanges();
      },
      error: (err) => {
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

    this.accountService.getAccountTransactions(String(accountId)).subscribe({
      next: (txs) => {
        this.transactions = (txs ?? [])
          .sort((a: any, b: any) => {
            const da = new Date(this.dataParser.getTransactionDate(a) ?? 0).getTime();
            const db = new Date(this.dataParser.getTransactionDate(b) ?? 0).getTime();
            return db - da;
          })
          .slice(0, 5);
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Impossible de charger les transactions';
      }
    });
  }

  getAccountId(account?: Account): string | number | null {
    return this.dataParser.getAccountId(account ?? this.selectedAccount);
  }

  getBalance(account?: Account): number {
    return this.dataParser.getAccountBalance(account ?? this.selectedAccount);
  }

  getAccountLabel(account?: Account): string {
    return this.dataParser.getAccountLabel(account ?? this.selectedAccount);
  }

  getInitials(name: string): string {
    return this.format.getInitials(name);
  }

  formatDate(date: any): string {
    return this.format.formatDateTime(date);
  }

  goToTransactionDetail(tx: Transaction): void {
    // on passe l'objet transaction directement (pas besoin de re-fetch)
    this.router.navigate(['/transaction-detail'], {
      state: { transaction: tx }
    });
  }

  goToTransfer(): void {
    this.router.navigate(['/transaction']);
  }

  goToInfo(): void {
    this.router.navigate(['/info'], {
      state: { selectedAccount: this.selectedAccount }
    });
  }

  goToOpenAccount(): void {
    this.router.navigate(['/open-account']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/register']);
  }
}
