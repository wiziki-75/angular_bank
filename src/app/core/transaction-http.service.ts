import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { TransactionService, EmitTransactionDTO } from './transaction.service';

@Injectable({ providedIn: 'root' })
export class TransactionHttpService extends TransactionService {
  private readonly API_URL = environment.apiUrl;

  constructor(private http: HttpClient) {
    super();
  }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('access_token');
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  emitTransaction(transactionData: EmitTransactionDTO): Observable<any> {
    return this.http.post(
      `${this.API_URL}/transactions/emit`,
      transactionData,
      { headers: this.getHeaders() }
    );
  }

  getTransaction(transactionId: string): Observable<any> {
    return this.http.get(
      `${this.API_URL}/transactions/${transactionId}`,
      { headers: this.getHeaders() }
    );
  }

  cancelTransaction(transactionId: string): Observable<any> {
    return this.http.post(
      `${this.API_URL}/transactions/${transactionId}/cancel`,
      {},
      { headers: this.getHeaders() }
    );
  }
}