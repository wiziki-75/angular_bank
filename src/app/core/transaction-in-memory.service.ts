import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { TransactionService, EmitTransactionDTO } from './transaction.service';

@Injectable({ providedIn: 'root' })
export class TransactionInMemoryService extends TransactionService {
  
  emitTransaction(transactionData: EmitTransactionDTO): Observable<any> {
    console.log('Mode Démo : Envoi de transaction', transactionData);
    return of({ status: 'SUCCESS', id: 'mock-tx-' + Date.now() });
  }

  getTransaction(transactionId: string): Observable<any> {
    return of({
      id: transactionId,
      amount: 150.00,
      description: 'Achat de test mode démo',
      status: 'VALIDATED',
      createdAt: new Date().toISOString(),
      emitter: { id: 'acc-1', owner: { name: 'Client Démo' } },
      receiver: { id: 'acc-2', owner: { name: 'Boulangerie' } }
    });
  }

  cancelTransaction(transactionId: string): Observable<any> {
    return of({ status: 'CANCELLED', id: transactionId });
  }
}