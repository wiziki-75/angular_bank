import { Injectable } from '@angular/core';

/**
 * Service utilitaire pour parser et extraire des données depuis des objets
 * avec structures hétérogènes (différentes API, différents formats).
 * Élimine la duplication de logique entre dashboard et transaction-detail.
 */
@Injectable({
  providedIn: 'root'
})
export class DataParserService {

  /**
   * Retourne la première valeur définie parmi une liste de clés
   * @param obj L'objet à parcourir
   * @param keys Liste de clés à tester
   * @returns La première valeur trouvée ou undefined
   */
  pickFirst(obj: any, keys: string[]): any {
    if (!obj) return undefined;
    for (const key of keys) {
      if (obj[key] !== undefined && obj[key] !== null && obj[key] !== '') {
        return obj[key];
      }
    }
    return undefined;
  }

  /**
   * Extrait un ID depuis un objet qui peut être un ID direct ou un objet imbriqué
   * @param value Valeur à parser (string, number, ou objet avec ID)
   * @returns L'ID sous forme de string, ou chaîne vide si non trouvé
   */
  extractId(value: any): string {
    if (value === undefined || value === null) return '';
    
    // Si c'est déjà un string/number
    if (typeof value === 'string' || typeof value === 'number') {
      return String(value);
    }

    // Si c'est un objet imbriqué { id: ... } ou { accountId: ... }
    if (typeof value === 'object') {
      const id = this.pickFirst(value, [
        'id',
        'accountId',
        'account_id',
        '_id',
        'uuid'
      ]);
      return String(id ?? '');
    }

    return '';
  }

  /**
   * Extrait l'ID d'un compte depuis différents formats possibles
   */
  getAccountId(account: any): string {
    if (!account) return '';
    return this.extractId(account) || this.pickFirst(account, [
      'id',
      'accountId',
      'account_id'
    ]) || '';
  }

  /**
   * Extrait le solde d'un compte depuis différents formats possibles
   */
  getAccountBalance(account: any): number {
    if (!account) return 0;
    return this.pickFirst(account, ['balance', 'total', 'solde']) ?? 0;
  }

  /**
   * Extrait le label d'un compte depuis différents formats possibles
   */
  getAccountLabel(account: any): string {
    if (!account) return 'Sans label';
    return this.pickFirst(account, ['clientCode', 'label', 'name']) ?? 'Sans label';
  }

  /**
   * Extrait la date de création d'un compte depuis différents formats possibles
   */
  getAccountCreatedDate(account: any): string | null {
    if (!account) return null;
    return this.pickFirst(account, [
      'openAt',
      'createdAt',
      'created_at',
      'openDate',
      'openedAt',
      'date'
    ]);
  }

  /**
   * Extrait l'ID d'une transaction depuis différents formats possibles
   */
  getTransactionId(transaction: any): string {
    if (!transaction) return '';
    return this.pickFirst(transaction, [
      'id',
      'transactionId',
      '_id',
      'uuid'
    ]) ?? '';
  }

  /**
   * Extrait la date d'une transaction depuis différents formats possibles
   */
  getTransactionDate(transaction: any): string | null {
    if (!transaction) return null;
    return this.pickFirst(transaction, [
      'createdAt',
      'date',
      'emittedAt',
      'issuedAt'
    ]);
  }

  /**
   * Extrait le montant d'une transaction depuis différents formats possibles
   */
  getTransactionAmount(transaction: any): number {
    if (!transaction) return 0;
    return this.pickFirst(transaction, ['amount', 'value', 'montant']) ?? 0;
  }

  /**
   * Extrait le statut d'une transaction depuis différents formats possibles
   */
  getTransactionStatus(transaction: any): string {
    if (!transaction) return '';
    return this.pickFirst(transaction, ['status', 'state', 'etat']) ?? '';
  }

  /**
   * Extrait la description d'une transaction depuis différents formats possibles
   */
  getTransactionDescription(transaction: any): string {
    if (!transaction) return '';
    return this.pickFirst(transaction, [
      'description',
      'label',
      'note',
      'message'
    ]) ?? '';
  }
}
