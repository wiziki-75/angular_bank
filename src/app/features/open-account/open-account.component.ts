import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AccountService, OpenAccountDTO } from '../../core/account.service';

@Component({
  selector: 'app-open-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './open-account.component.html',
  styleUrls: ['./open-account.component.css']
})
export class OpenAccountComponent {
  accountData: OpenAccountDTO = {
    initialBalance: 100,
    label: ''
  };

  errorMessage: string = '';
  successMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private accountService: AccountService,
    private router: Router
  ) {}

  openAccount(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    if (!this.accountData.label.trim()) {
      this.errorMessage = 'Veuillez entrer un nom pour le compte';
      this.isLoading = false;
      return;
    }

    if (this.accountData.initialBalance < 0) {
      this.errorMessage = 'Le montant initial doit être positif';
      this.isLoading = false;
      return;
    }

    this.accountService.openAccount(this.accountData).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.successMessage = 'Compte créé avec succès !';
        // Redirect to dashboard after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Erreur lors de la création du compte';
        console.error('Erreur lors de la création du compte:', error);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
