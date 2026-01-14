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
  balance = 0;
  transactions: any[] = [];
  private accountId: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('Dashboard init');

    const token = this.authService.getStoredToken();
    if (!token) {
      this.router.navigate(['/register']);
      return;
    }

    // 1) Essaye l'API current-user
    this.authService.getCurrentUser().subscribe({
      next: (res: any) => {
        this.user = res?.user ?? res;
        this.loadAccountAndTransactions();
      },
      error: (err) => {
        console.error('current-user failed (fallback local user):', err);

        // 2) Fallback : user du localStorage
        this.user = this.authService.getStoredUser();
        if (!this.user) {
          this.router.navigate(['/register']);
          return;
        }

        this.loadAccountAndTransactions();
      }
    });
  }

  private loadAccountAndTransactions(): void {
    this.authService.getAccounts().subscribe({
      next: (accounts) => {
        if (!accounts || accounts.length === 0) return;

        // On prend le 1er compte
        const account = accounts[0];
        this.accountId = account.id ?? account.accountId ?? null;

        // Solde (selon la shape)
        this.balance = account.balance ?? account.total ?? 0;

        if (!this.accountId) return;

        this.authService.getTransactions(this.accountId).subscribe({
          next: (txs) => {
            // Tri date décroissante + 5 dernières
            this.transactions = (txs ?? [])
              .sort((a: any, b: any) => {
                const da = new Date(a.createdAt ?? a.date ?? a.emittedAt).getTime();
                const db = new Date(b.createdAt ?? b.date ?? b.emittedAt).getTime();
                return db - da;
              })
              .slice(0, 5);
          }
        });
      }
    });
  }

  goToTransfer(): void {
    this.router.navigate(['/transfer']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/register']);
  }

  /* =========================
     UI HELPERS (compat HTML)
     ========================= */

  getInitials(name: string): string {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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


}
