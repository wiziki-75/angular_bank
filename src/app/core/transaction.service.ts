import { Observable } from 'rxjs';

export interface EmitTransactionDTO {
  emitterAccountId: string;
  receiverAccountId: string;
  amount: number;
  description: string;
}

export abstract class TransactionService {
  abstract emitTransaction(transactionData: EmitTransactionDTO): Observable<any>;
  abstract getTransaction(transactionId: string): Observable<any>;
  abstract cancelTransaction(transactionId: string): Observable<any>;
}