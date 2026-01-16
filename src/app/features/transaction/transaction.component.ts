import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TransactionService, EmitTransactionDTO } from '../../core/transaction.service';
import { AccountService, Account } from '../../core/account.service';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-transaction',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transaction.component.html',
  styleUrl: './transaction.component.css'
})
export class TransactionComponent implements OnInit, OnDestroy {
  transactionForm: FormGroup;
  accounts: Account[] = [];
  selectedAccount: Account | null = null;
  successMessage: string = '';
  errorMessage: string = '';
  isLoading: boolean = false;
  isLoadingAccounts: boolean = true;
  isRetrying: boolean = false;
  
  // Modal et gestion de l'annulation
  showPendingModal = signal(false);
  currentTransactionId: string | null = null;
  isCancelling: boolean = false;
  isMonitoring: boolean = false;
  
  // Pour nettoyer les timeouts
  private monitoringTimeout: any = null;
  private statusCheckSubscription: Subscription | null = null;

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private accountService: AccountService,
    private router: Router
  ) {
    this.transactionForm = this.fb.group({
      emitterAccountId: [{ value: '', disabled: true }, [Validators.required]],
      receiverAccountId: ['', [Validators.required]],
      amount: ['', [Validators.required, Validators.min(0.01)]],
      description: ['']
    });
  }

  ngOnInit(): void {
    this.loadAccounts();
  }

  ngOnDestroy(): void {
    this.cleanupMonitoring();
  }

  private cleanupMonitoring(): void {
    if (this.monitoringTimeout) {
      clearTimeout(this.monitoringTimeout);
      this.monitoringTimeout = null;
    }
    if (this.statusCheckSubscription) {
      this.statusCheckSubscription.unsubscribe();
      this.statusCheckSubscription = null;
    }
    this.isMonitoring = false;
  }

  loadAccounts(): void {
    this.isLoadingAccounts = true;
    this.accountService.getAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        this.isLoadingAccounts = false;
        this.transactionForm.get('emitterAccountId')?.enable();
        console.log('Comptes chargés:', accounts);
      },
      error: (err) => {
        console.error('Erreur lors du chargement des comptes:', err);
        this.errorMessage = 'Impossible de charger vos comptes';
        this.isLoadingAccounts = false;
      }
    });
  }

  onAccountSelect(): void {
    const accountId = this.transactionForm.get('emitterAccountId')?.value;
    if (accountId) {
      this.selectedAccount = this.accounts.find(acc => String(acc.id) === String(accountId)) || null;
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
    this.successMessage = '';

    if (this.transactionForm.invalid) {
      this.errorMessage = 'Veuillez remplir tous les champs correctement';
      return;
    }

    const receiverAccountId = this.transactionForm.get('receiverAccountId')?.value;
    const emitterAccountId = this.transactionForm.get('emitterAccountId')?.value;

    // Vérification: pas de transfert à soi-même
    if (String(receiverAccountId) === String(emitterAccountId)) {
      this.errorMessage = 'Vous ne pouvez pas transférer des fonds à votre propre compte';
      return;
    }
    
    if (!this.selectedAccount) {
      this.errorMessage = 'Veuillez sélectionner votre compte émetteur';
      return;
    }

    // Vérification du solde
    const amount = this.transactionForm.get('amount')?.value;
    if (amount > this.selectedAccount.balance) {
      this.errorMessage = 'Montant supérieur au solde disponible';
      return;
    }

    // Réinitialiser l'erreur et commencer
    this.errorMessage = '';
    this.isLoading = true;

    const transactionData: EmitTransactionDTO = {
      emitterAccountId: emitterAccountId,
      receiverAccountId: receiverAccountId,
      amount: parseFloat(amount),
      description: this.transactionForm.get('description')?.value || ''
    };

    this.processTransaction(transactionData);
  }

  processTransaction(transactionData: EmitTransactionDTO): void {
    this.showPendingModal.set(true);
    
    this.transactionService.emitTransaction(transactionData).subscribe({
      next: (response) => {
        console.log('Transaction émise:', response);
        this.currentTransactionId = response.id;
        this.isLoading = false;
        
        // Commencer la surveillance du statut
        this.isMonitoring = true;
        this.monitorTransactionStatus(response.id, transactionData);
      },
      error: (err) => {
        console.error('Erreur lors de l\'émission de la transaction:', err);
        this.isLoading = false;
        
        this.errorMessage = 'Erreur lors de l\'émission de la transaction'
        this.isRetrying = true;
        this.showPendingModal.set(false);
      }
    });
  }

  monitorTransactionStatus(transactionId: string, transactionData: EmitTransactionDTO): void {
    const startTime = Date.now();
    const maxDuration = 10000;
    const checkInterval = 1000;
    
    const checkStatus = () => {
      // Arrêter si monitoring est désactivé (annulation ou composant détruit)
      if (!this.isMonitoring || !this.showPendingModal) {
        this.cleanupMonitoring();
        return;
      }
      
      const elapsed = Date.now() - startTime;
      
      // Timeout atteint
      if (elapsed > maxDuration) {
        console.warn('Timeout de surveillance atteint');
        this.handleTimeout(transactionId, transactionData);
        return;
      }
      
      // Vérifier le statut
      this.statusCheckSubscription = this.transactionService.getTransaction(transactionId).subscribe({
        next: (transaction) => {
          console.log('Statut de la transaction:', transaction.status);
          
          const status = transaction.status.toLowerCase();
          
          if (status === 'completed') {
            this.cleanupMonitoring();
            this.handleSuccess(transactionData);
          } else if (status === 'failed' || status === 'error') {
            this.cleanupMonitoring();
            this.handleFailure(transactionData);
          } else if (status === 'cancelled') {
            this.cleanupMonitoring();
            this.handleCancellation();
          } else if (status === 'pending') {
            // Continuer la surveillance
            this.monitoringTimeout = setTimeout(checkStatus, checkInterval);
          } else {
            // Statut inconnu, continuer la surveillance
            console.warn('Statut inconnu:', transaction.status);
            this.monitoringTimeout = setTimeout(checkStatus, checkInterval);
          }
        },
        error: (err) => {
          console.error('Erreur lors de la vérification du statut:', err);
          this.cleanupMonitoring();
          this.showPendingModal.set(false);
          this.errorMessage = 'Erreur lors de la vérification de la transaction';
          this.currentTransactionId = null;
        }
      });
    };
    
    // Démarrer après un court délai
    this.monitoringTimeout = setTimeout(checkStatus, 1000);
  }

  handleSuccess(transactionData: EmitTransactionDTO): void {
    this.showPendingModal.set(false);
    this.currentTransactionId = null;
    this.successMessage = `Transaction effectuée avec succès ! Montant: ${transactionData.amount.toFixed(2)}€`;
    this.transactionForm.reset();
    this.selectedAccount = null;
    this.isRetrying = false;
    this.loadAccounts();
  }

  handleFailure(transactionData: EmitTransactionDTO): void {
    this.showPendingModal.set(false);
    this.currentTransactionId = null;
    this.errorMessage = 'La transaction a échoué. Veuillez réessayer.';
    this.isRetrying = true;
  }

  handleCancellation(): void {
    this.showPendingModal.set(false);
    this.currentTransactionId = null;
    this.successMessage = 'Transaction annulée avec succès';
    this.transactionForm.reset();
    this.selectedAccount = null;
    this.isRetrying = false;
    this.loadAccounts();
  }

  handleTimeout(transactionId: string, transactionData: EmitTransactionDTO): void {
    // Faire une dernière vérification
    this.transactionService.getTransaction(transactionId).subscribe({
      next: (transaction) => {
        const status = transaction.status.toLowerCase();
        if (status === 'completed') {
          this.handleSuccess(transactionData);
        } else if (status === 'failed' || status === 'error') {
          this.handleFailure(transactionData);
        } else if (status === 'cancelled') {
          this.handleCancellation();
        } else {
          // Toujours en attente après timeout
          this.showPendingModal.set(false);
          this.currentTransactionId = null;
          this.errorMessage = 'La vérification de la transaction a pris trop de temps. Vérifiez votre historique.';
        }
      },
      error: () => {
        this.showPendingModal.set(false);
        this.currentTransactionId = null;
        this.errorMessage = 'Impossible de vérifier le statut final de la transaction';
      }
    });
  }

  cancelTransaction(): void {
    if (!this.currentTransactionId || this.isCancelling) return;
    
    this.isCancelling = true;
    
    this.transactionService.cancelTransaction(this.currentTransactionId).subscribe({
      next: () => {
        console.log('Transaction annulée avec succès');
        this.isCancelling = false;
        this.isMonitoring = false;
        this.cleanupMonitoring();
        this.handleCancellation();
      },
      error: (err) => {
        console.error('Erreur lors de l\'annulation:', err);
        this.isCancelling = false;
        
        if (err.status === 400 || err.status === 404) {
          // Transaction déjà terminée, vérifier le statut
          if (this.currentTransactionId) {
            this.transactionService.getTransaction(this.currentTransactionId).subscribe({
              next: (transaction) => {
                const status = transaction.status.toLowerCase();
                if (status === 'completed') {
                  this.cleanupMonitoring();
                  this.handleSuccess({
                    emitterAccountId: transaction.emitterAccountId,
                    receiverAccountId: transaction.receiverAccountId,
                    amount: transaction.amount,
                    description: transaction.description || ''
                  });
                } else {
                  this.showPendingModal.set(false);
                  this.errorMessage = 'Impossible d\'annuler: la transaction est déjà terminée';
                }
              },
              error: () => {
                this.showPendingModal.set(false);
                this.errorMessage = 'Erreur lors de la vérification de la transaction';
              }
            });
          }
        } else {
          this.errorMessage = 'Erreur lors de l\'annulation de la transaction';
        }
      }
    });
  }

  goBack(): void {
    // Nettoyer avant de quitter
    this.cleanupMonitoring();
    this.router.navigate(['/dashboard']);
  }
}