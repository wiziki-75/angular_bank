import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { Account } from '../../core/account.service';
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

  // ✅ feedback "copié"
  copiedKey: string | null = null;

  constructor(
    private authService: AuthService,
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

  /* =========================
     HELPERS - Account properties
     ========================= */

  getAccountId(): string | number {
    if (!this.selectedAccount) return '';
    const a = this.selectedAccount as any;
    return a.id ?? a.accountId ?? a.account_id ?? '';
  }

  getAccountLabel(): string {
    if (!this.selectedAccount) return 'Sans label';
    const a = this.selectedAccount as any;
    return a.clientCode ?? a.label ?? a.name ?? 'Sans label';
  }

  getCreatedDate(): string {
    if (!this.selectedAccount) return 'Non disponible';
    const acc = this.selectedAccount as any;

    const dateValue = acc.openAt ?? acc.createdAt ?? acc.created_at ?? acc.openDate ?? acc.openedAt ?? acc.date;

    if (!dateValue) {
      console.log('Aucune date trouvée dans:', acc);
      return 'Non disponible';
    }

    return this.formatDate(dateValue);
  }

  getBalance(): number {
    if (!this.selectedAccount) return 0;
    const acc = this.selectedAccount as any;
    return acc.balance ?? acc.total ?? acc.solde ?? 0;
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Non disponible';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.log('Date invalide:', dateString);
      return 'Date invalide';
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /* =========================
     COPY HELPERS ✅
     ========================= */

  async copyToClipboard(value: string | number, key: string): Promise<void> {
    try {
      const text = String(value ?? '');
      if (!text) return;

      await navigator.clipboard.writeText(text);

      this.copiedKey = key;
      setTimeout(() => {
        if (this.copiedKey === key) this.copiedKey = null;
      }, 1200);
    } catch (e) {
      console.error('Erreur copie clipboard:', e);
      this.errorMessage = "Impossible de copier l'information (permissions navigateur).";
      setTimeout(() => (this.errorMessage = ''), 2000);
    }
  }

  // ✅ prêts si plus tard tu affiches une transaction id
  copyTransactionId(txId: string | number): void {
    this.copyToClipboard(txId, 'txId');
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
