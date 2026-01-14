import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  user: any = null;

  // ✅ Solde par défaut = ouverture de compte
  balance = 250;

  transactions: any[] = [];
  private accountId: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('Dashboard init');

    /** 🔹 1. Charger immédiatement le client */
    const storedUser = this.authService.getStoredUser();
    if (!storedUser) {
      this.router.navigate(['/register']);
      return;
    }

    this.user = storedUser;

    /** 🔹 2. Charger comptes + transactions (si dispo) */
    this.loadAccountAndTransactions();
  }

  /* =========================
     DATA
     ========================= */

  private loadAccountAndTransactions(): void {
    this.authService.getAccounts().subscribe({
      next: (accounts) => {
        if (!accounts || accounts.length === 0) {
          console.warn('Aucun compte trouvé → solde initial conservé (250€)');
          return;
        }

        const account = accounts[0];
        this.accountId = account.id ?? account.accountId ?? null;

        // ✅ Solde réel SI l’API le fournit
        if (typeof account.balance === 'number') {
          this.balance = account.balance;
        } else if (typeof account.total === 'number') {
          this.balance = account.total;
        }

        if (!this.accountId) return;

        this.authService.getTransactions(this.accountId).subscribe({
          next: (txs) => {
            this.transactions = (txs ?? [])
              .sort((a: any, b: any) => {
                const da = new Date(a.createdAt ?? a.date ?? a.emittedAt).getTime();
                const db = new Date(b.createdAt ?? b.date ?? b.emittedAt).getTime();
                return db - da;
              })
              .slice(0, 5);
          },
          error: err => {
            console.error('Erreur chargement transactions', err);
          }
        });
      },
      error: err => {
        console.error('Erreur chargement comptes → solde initial conservé', err);
      }
    });
  }

  /* =========================
     UI HELPERS
     ========================= */

  getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  }

  formatDate(date: any): string {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}h${minutes}`;
  }

  /* =========================
     ACTIONS
     ========================= */

  goToTransfer(): void {
    this.router.navigate(['/transaction']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/register']);
  }
}
