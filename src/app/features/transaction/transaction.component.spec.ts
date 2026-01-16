import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TransactionComponent } from './transaction.component';
import { TransactionService, EmitTransactionDTO } from '../../core/transaction.service';
import { AccountService, Account } from '../../core/account.service';

describe('TransactionComponent', () => {
  let component: TransactionComponent;
  let fixture: ComponentFixture<TransactionComponent>;
  let transactionService: any;
  let accountService: any;
  let router: any;
  let snackBar: any;

  const mockAccounts: Account[] = [
    { id: '1', balance: 1000, label: 'Compte courant', openAt: '2024-01-01', ownerId: 'user1' },
    { id: '2', balance: 500, label: 'Compte épargne', openAt: '2024-01-01', ownerId: 'user1' }
  ];

  const mockTransaction = {
    id: 'tx-123',
    emitterAccountId: '1',
    receiverAccountId: '2',
    amount: 100,
    description: 'Test transfer',
    status: 'PENDING',
    createdAt: new Date()
  };

  beforeEach(async () => {
    transactionService = {
      emitTransaction: vi.fn(),
      getTransaction: vi.fn(),
      cancelTransaction: vi.fn()
    };
    
    accountService = {
      getAccounts: vi.fn()
    };
    
    router = {
      navigate: vi.fn()
    };
    
    snackBar = {
      open: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [TransactionComponent, ReactiveFormsModule],
      providers: [
        { provide: TransactionService, useValue: transactionService },
        { provide: AccountService, useValue: accountService },
        { provide: Router, useValue: router },
        { provide: MatSnackBar, useValue: snackBar }
      ]
    }).compileComponents();

    accountService.getAccounts.mockReturnValue(of(mockAccounts));

    fixture = TestBed.createComponent(TransactionComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load accounts on init', () => {
    fixture.detectChanges();
    expect(accountService.getAccounts).toHaveBeenCalled();
    expect(component.accounts).toEqual(mockAccounts);
    expect(component.isLoadingAccounts).toBe(false);
  });

  it('should validate form correctly', () => {
    fixture.detectChanges();
    expect(component.transactionForm.get('receiverAccountId')?.hasError('required')).toBe(true);
    expect(component.transactionForm.get('amount')?.hasError('required')).toBe(true);
  });

  it('should select account and update max validator', () => {
    fixture.detectChanges();
    component.transactionForm.get('emitterAccountId')?.setValue('1');
    component.onAccountSelect();
    
    expect(component.selectedAccount).toEqual(mockAccounts[0]);
    
    const amountControl = component.transactionForm.get('amount');
    amountControl?.setValue(1500);
    expect(amountControl?.hasError('max')).toBe(true);
  });

  it('should prevent transfer to same account', () => {
    fixture.detectChanges();
    // Bypasser la validation du formulaire
    Object.defineProperty(component.transactionForm, 'invalid', { get: () => false });
    
    component.transactionForm.get('emitterAccountId')?.setValue('1');
    component.transactionForm.get('receiverAccountId')?.setValue('1');
    component.transactionForm.get('amount')?.setValue(100);
    component.selectedAccount = mockAccounts[0];
    
    component.onSubmit();
    
    expect(component.errorMessage).toBe('Vous ne pouvez pas transférer des fonds à votre propre compte');
    expect(transactionService.emitTransaction).not.toHaveBeenCalled();
  });

  it('should prevent transfer exceeding balance', () => {
    fixture.detectChanges();
    // Bypasser la validation du formulaire
    Object.defineProperty(component.transactionForm, 'invalid', { get: () => false });
    
    component.transactionForm.get('emitterAccountId')?.setValue('1');
    component.transactionForm.get('receiverAccountId')?.setValue('2');
    component.transactionForm.get('amount')?.setValue(2000);
    component.selectedAccount = mockAccounts[0];
    
    component.onSubmit();
    
    expect(component.errorMessage).toBe('Montant supérieur au solde disponible');
    expect(transactionService.emitTransaction).not.toHaveBeenCalled();
  });

  it('should emit transaction successfully', async () => {
    fixture.detectChanges();
    transactionService.emitTransaction.mockReturnValue(of(mockTransaction));
    transactionService.getTransaction.mockReturnValue(of({ ...mockTransaction, status: 'COMPLETED' }));
    
    const transactionData: EmitTransactionDTO = {
      emitterAccountId: '1',
      receiverAccountId: '2',
      amount: 100,
      description: 'Test'
    };
    
    component.processTransaction(transactionData);
    
    expect(transactionService.emitTransaction).toHaveBeenCalledWith(transactionData);
    expect(component.showPendingModal()).toBe(true);
    expect(component.currentTransactionId).toBe('tx-123');
  });

  it('should monitor transaction status until completed', async () => {
    fixture.detectChanges();
    const handleSuccessSpy = vi.spyOn(component, 'handleSuccess');
    transactionService.getTransaction.mockReturnValue(of({ ...mockTransaction, status: 'COMPLETED' }));
    
    component.isMonitoring = true;
    component.showPendingModal.set(true);
    component.monitorTransactionStatus('tx-123', {
      emitterAccountId: '1',
      receiverAccountId: '2',
      amount: 100,
      description: 'Test'
    });
    
    await new Promise(resolve => setTimeout(resolve, 1100));
    
    expect(handleSuccessSpy).toHaveBeenCalled();
  });

  it('should cancel transaction successfully', () => {
    fixture.detectChanges();
    accountService.getAccounts.mockReturnValue(of(mockAccounts));
    const handleCancellationSpy = vi.spyOn(component, 'handleCancellation');
    component.currentTransactionId = 'tx-123';
    transactionService.cancelTransaction.mockReturnValue(of({}));
    
    component.cancelTransaction();
    
    expect(transactionService.cancelTransaction).toHaveBeenCalledWith('tx-123');
    expect(handleCancellationSpy).toHaveBeenCalled();
  });

  it('should navigate to dashboard', () => {
    fixture.detectChanges();
    component.goBack();
    
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});
