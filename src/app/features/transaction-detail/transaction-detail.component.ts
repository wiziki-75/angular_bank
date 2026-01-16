import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionService } from '../../core/transaction.service';
import { DataParserService } from '../../core/data-parser.service';
import { FormatService } from '../../core/format.service';

@Component({
  selector: 'app-transaction-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './transaction-detail.component.html',
  styleUrls: ['./transaction-detail.component.css']
})
export class TransactionDetailComponent implements OnInit {

  transaction: any = null;
  errorMessage = '';
  loading = true;

  copiedKey: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private transactionService: TransactionService,
    private dataParser: DataParserService,
    private format: FormatService
  ) {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras?.state?.['transaction']) {
      this.transaction = nav.extras.state['transaction'];
      this.loading = false;
    }
  }

  ngOnInit(): void {
    if (!this.transaction) {
      const id = this.route.snapshot.paramMap.get('id');
      if (!id) {
        this.errorMessage = "Aucune transaction sélectionnée.";
        this.loading = false;
        return;
      }
      this.fetchTransaction(id);
    }
  }

  private fetchTransaction(id: string): void {
    this.loading = true;
    this.transactionService.getTransaction(id).subscribe({
      next: (res) => {
        this.transaction = res?.data ?? res?.transaction ?? res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement transaction:', err);
        this.errorMessage = "Impossible de charger la transaction.";
        this.loading = false;
      }
    });
  }

  /* =========================
     SAFE GETTERS (robustes)
     ========================= */

  getTransactionId(): string {
    return this.dataParser.getTransactionId(this.transaction);
  }

  getEmitterAccountId(): string {
    const t = this.transaction as any;

    const raw = this.dataParser.pickFirst(t, [
      'emitterAccountId',
      'emitter_account_id',
      'emitterId',
      'emitterAccount',
      'emitter',
      'fromAccountId',
      'from_account_id',
      'from',
      'senderAccountId',
      'sender_account_id',
      'senderAccount',
      'sender',
      'debitedAccountId',
      'debitedAccount',
      'accountFrom'
    ]);

    return this.dataParser.extractId(raw);
  }

  getReceiverAccountId(): string {
    const t = this.transaction as any;

    const raw = this.dataParser.pickFirst(t, [
      'receiverAccountId',
      'receiver_account_id',
      'receiverId',
      'receiverAccount',
      'receiver',
      'toAccountId',
      'to_account_id',
      'to',
      'beneficiaryAccountId',
      'beneficiaryAccount',
      'creditedAccountId',
      'creditedAccount',
      'accountTo'
    ]);

    return this.dataParser.extractId(raw);
  }

  getDisplayName(): string {
    const t = this.transaction as any;
    return t?.receiverName || t?.senderName || t?.label || t?.name || 'Transaction';
  }

  getInitials(name: string): string {
    return this.format.getInitials(name);
  }

  getDateValue(): any {
    return this.dataParser.getTransactionDate(this.transaction);
  }

  formatDate(date: any): string {
    const formatted = this.format.formatDateTime(date);
    return formatted || 'Non disponible';
  }

  getSignedAmount(): number {
    const t = this.transaction as any;
    const raw = Number(t?.amount ?? 0);

    if (t?.type === 'EMIT' || t?.direction === 'OUT' || t?.kind === 'DEBIT') {
      return -Math.abs(raw);
    }
    return raw;
  }

  getStatus(): string {
    const status = this.dataParser.getTransactionStatus(this.transaction);
    return status || '—';
  }

  getDescription(): string {
    const description = this.dataParser.getTransactionDescription(this.transaction);
    return description || '—';
  }

  /* =========================
     COPY
     ========================= */

  async copyToClipboard(value: string | number, key: string): Promise<void> {
    try {
      const text = String(value ?? '');
      if (!text) return;

      await navigator.clipboard.writeText(text);

      this.copiedKey = key;
      setTimeout(() => {
        if (this.copiedKey === key) this.copiedKey = null;
      }, 1200);
    } catch (e) {
      console.error('Erreur copie clipboard:', e);
      this.errorMessage = "Impossible de copier (permissions navigateur).";
      setTimeout(() => (this.errorMessage = ''), 2000);
    }
  }

  /* =========================
     ACTIONS
     ========================= */

  goBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
