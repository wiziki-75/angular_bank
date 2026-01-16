import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

export interface EmitTransactionDTO {
  emitterAccountId: string;
  receiverAccountId: string;
  amount: number;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {}

  emitTransaction(transactionData: EmitTransactionDTO): Observable<any> {
    return this.http.post(
      `${this.API_URL}/transactions/emit`,
      transactionData
    );
  }

  getTransaction(transactionId: string): Observable<any> {
    return this.http.get(`${this.API_URL}/transactions/${transactionId}`);
  }

  cancelTransaction(transactionId: string): Observable<any> {
    return this.http.post(
      `${this.API_URL}/transactions/${transactionId}/cancel`,
      {}
    );
  }
}
