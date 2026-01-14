import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TransactionService, EmitTransactionDTO } from '../../core/transaction.service';
import { AccountService, Account } from '../../core/account.service';

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.css'
})
export class TransactionComponent implements OnInit {
  transactionForm: FormGroup;
  accounts: Account[] = [];
  selectedAccount: Account | null = null;
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private accountService: AccountService
  ) {
    this.transactionForm = this.fb.group({
      accountId: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnInit(): void {
    this.loadAccounts();
  }

  loadAccounts(): void {
    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        console.log('Comptes chargés:', accounts);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des comptes:', err);
        this.errorMessage = 'Impossible de charger vos comptes';
      }
    });
  }

  onAccountSelect(): void {
    const accountId = this.transactionForm.get('accountId')?.value;
    if (accountId) {
      this.selectedAccount = this.accounts.find(acc => acc.id === accountId) || null;
      // Mettre à jour la validation du montant en fonction du solde
      const amountControl = this.transactionForm.get('amount');
      if (this.selectedAccount) {
        amountControl?.setValidators([
          Validators.required,
          Validators.min(0.01),
          Validators.max(this.selectedAccount.balance)
        ]);
      }
      amountControl?.updateValueAndValidity();
    }
  }

  get maxAmount(): number {
    return this.selectedAccount?.balance || 0;
  }

  get availableBalance(): number {
    if (!this.selectedAccount) return 0;
    const amount = this.transactionForm.get('amount')?.value || 0;
    return this.selectedAccount.balance - amount;
  }

  onSubmit(): void {
    if (this.transactionForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs correctement';
      return;
    }

    const receiverAccountId = this.transactionForm.get('accountId')?.value;

    console.log('receiverAccountId: ', this.transactionForm.get('accountId')?.value);
    
    if (!this.selectedAccount) {
      this.errorMessage = 'Veuillez sélectionner un compte';
      return;
    }

    // Vérification du solde
    const amount = this.transactionForm.get('amount')?.value;
    if (amount > this.selectedAccount.balance) {
      this.errorMessage = 'Montant supérieur au solde disponible';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const transactionData: EmitTransactionDTO = {
      emitterAccountId: this.selectedAccount.id,
      receiverAccountId: receiverAccountId,
      amount: parseFloat(amount),
      description: this.transactionForm.get('description')?.value
    };

    this.transactionService.emitTransaction(transactionData).subscribe({
      next: (response) => {
        console.log('Transaction réussie:', response);
        this.successMessage = `Transaction effectuée avec succès ! Montant: ${amount}€`;
        this.transactionForm.reset();
        this.selectedAccount = null;
        this.isLoading = false;
        // Recharger les comptes pour mettre à jour les soldes
        this.loadAccounts();
      },
      error: (err) => {
        console.error('Erreur lors de la transaction:', err);
        this.errorMessage = err.error?.message || 'Erreur lors de la transaction';
        this.isLoading = false;
      }
    });
  }
}
