import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionService } from '../../core/transaction.service';

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
    private transactionService: TransactionService
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

  private pickFirst(obj: any, keys: string[]): any {
    if (!obj) return undefined;
    for (const k of keys) {
      if (obj[k] !== undefined && obj[k] !== null && obj[k] !== '') return obj[k];
    }
    return undefined;
  }

  private extractId(value: any): string {
    if (value === undefined || value === null) return '';
    // si c'est déjà un string/number
    if (typeof value === 'string' || typeof value === 'number') return String(value);

    // si c'est un objet imbriqué { id: ... } ou { accountId: ... }
    if (typeof value === 'object') {
      const v =
        value.id ??
        value.accountId ??
        value.account_id ??
        value._id ??
        value.uuid ??
        '';
      return String(v ?? '');
    }

    return '';
  }

  /* =========================
     UI HELPERS
     ========================= */

  getTransactionId(): string {
    const t = this.transaction as any;
    return String(t?.id ?? t?.transactionId ?? t?._id ?? t?.uuid ?? '');
  }

  // ✅ FIX: on couvre un maximum de formats possibles
  getEmitterAccountId(): string {
    const t = this.transaction as any;

    const raw = this.pickFirst(t, [
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

    return this.extractId(raw);
  }

  getReceiverAccountId(): string {
    const t = this.transaction as any;

    const raw = this.pickFirst(t, [
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

    return this.extractId(raw);
  }

  getDisplayName(): string {
    const t = this.transaction as any;
    return t?.receiverName || t?.senderName || t?.label || t?.name || 'Transaction';
  }

  getInitials(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .filter(Boolean)
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  getDateValue(): any {
    const t = this.transaction as any;
    return t?.createdAt ?? t?.date ?? t?.emittedAt ?? t?.issuedAt ?? t?.updatedAt;
  }

  formatDate(date: any): string {
    const d = new Date(date);
    if (isNaN(d.getTime())) return 'Non disponible';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}h${minutes}`;
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
    const t = this.transaction as any;
    return t?.status ?? t?.state ?? '—';
  }

  getDescription(): string {
    const t = this.transaction as any;
    return t?.description ?? t?.label ?? t?.reason ?? '—';
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
