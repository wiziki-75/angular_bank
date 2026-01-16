import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { Account } from '../../core/account.service';
import { DataParserService } from '../../core/data-parser.service';
import { FormatService } from '../../core/format.service';
import { ClipboardService } from '../../core/clipboard.service';
import { Router } from '@angular/router';

export interface User {
  id?: string | number;
  name: string;
  clientCode?: string;
  [key: string]: any;
}

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.css']
})
export class InfoComponent implements OnInit {
  user: User | null = null;
  selectedAccount: Account | null = null;
  errorMessage: string = '';
  copiedKey: string | null = null;

  constructor(
    private authService: AuthService,
    private dataParser: DataParserService,
    private format: FormatService,
    private clipboard: ClipboardService,
    private router: Router
  ) {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.selectedAccount = navigation.extras.state['selectedAccount'];
    }
  }

  ngOnInit(): void {
    this.loadUserData();

    if (!this.selectedAccount) {
      this.router.navigate(['/dashboard']);
    }
  }

  loadUserData(): void {
    const storedUser = this.authService.getStoredUser();
    if (storedUser) {
      this.user = storedUser;
    }
  }

  getAccountId(): string | number {
    return this.dataParser.getAccountId(this.selectedAccount) || '';
  }

  getAccountLabel(): string {
    return this.dataParser.getAccountLabel(this.selectedAccount);
  }

  getCreatedDate(): string {
    const dateValue = this.dataParser.getAccountCreatedDate(this.selectedAccount);

    if (!dateValue) {
      return 'Non disponible';
    }

    return this.formatDate(dateValue);
  }

  getBalance(): number {
    return this.dataParser.getAccountBalance(this.selectedAccount);
  }

  formatDate(dateString: string): string {
    const formatted = this.format.formatDate(dateString);
    if (!formatted) {
      return 'Date invalide';
    }
    return formatted;
  }

  async copyToClipboard(value: string | number, key: string): Promise<void> {
    const success = await this.clipboard.copyToClipboard(value);
    if (success) {
      this.copiedKey = key;
      setTimeout(() => {
        if (this.copiedKey === key) this.copiedKey = null;
      }, 1200);
    } else {
      this.errorMessage = "Impossible de copier l'information (permissions navigateur).";
      setTimeout(() => (this.errorMessage = ''), 2000);
    }
  }

  copyTransactionId(txId: string | number): void {
    this.copyToClipboard(txId, 'txId');
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
