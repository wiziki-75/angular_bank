import { Injectable } from '@angular/core';

/**
 * Service de formatage pour les données d'affichage.
 * Centralise la logique de formatage utilisée dans plusieurs composants.
 */
@Injectable({
  providedIn: 'root'
})
export class FormatService {

  /**
   * Génère les initiales à partir d'un nom
   * @param name Le nom complet
   * @returns Les initiales (2 caractères maximum)
   */
  getInitials(name: string): string {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  /**
   * Formate une date au format français avec heures et minutes
   * @param date Date à formater (string, Date, ou timestamp)
   * @returns Date formatée (dd/mm/yyyy HH:mm) ou chaîne vide si invalide
   */
  formatDateTime(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}h${minutes}`;
  }

  /**
   * Formate une date au format français (juste la date, sans l'heure)
   * @param date Date à formater (string, Date, ou timestamp)
   * @returns Date formatée (dd/mm/yyyy) ou chaîne vide si invalide
   */
  formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '';

    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    
    return `${day}/${month}/${year}`;
  }

  /**
   * Formate un montant en euros
   * @param amount Montant à formater
   * @param decimals Nombre de décimales (par défaut 2)
   * @returns Montant formaté avec symbole €
   */
  formatCurrency(amount: number, decimals: number = 2): string {
    if (amount === undefined || amount === null) return '0,00 €';
    return `${amount.toFixed(decimals).replace('.', ',')} €`;
  }

  /**
   * Formate un nombre avec séparateur de milliers
   * @param value Nombre à formater
   * @returns Nombre formaté avec espaces comme séparateurs
   */
  formatNumber(value: number): string {
    if (value === undefined || value === null) return '0';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  /**
   * Tronque un texte à une longueur maximale
   * @param text Texte à tronquer
   * @param maxLength Longueur maximale
   * @returns Texte tronqué avec '...' si nécessaire
   */
  truncate(text: string, maxLength: number): string {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  /**
   * Capitalise la première lettre d'un texte
   * @param text Texte à capitaliser
   * @returns Texte avec première lettre en majuscule
   */
  capitalize(text: string): string {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  }

  /**
   * Formate un statut de transaction pour l'affichage
   * @param status Statut brut
   * @returns Statut formaté et traduit
   */
  formatTransactionStatus(status: string): string {
    if (!status) return 'Inconnu';
    
    const statusMap: { [key: string]: string } = {
      'completed': 'Complété',
      'pending': 'En attente',
      'failed': 'Échoué',
      'cancelled': 'Annulé',
      'error': 'Erreur'
    };

    return statusMap[status.toLowerCase()] || this.capitalize(status);
  }

  /**
   * Formate un type de transaction pour l'affichage
   * @param type Type de transaction (EMIT/RECEIVE)
   * @returns Type formaté
   */
  formatTransactionType(type: string): string {
    if (!type) return 'Inconnu';
    
    const typeMap: { [key: string]: string } = {
      'EMIT': 'Émission',
      'RECEIVE': 'Réception',
      'emit': 'Émission',
      'receive': 'Réception'
    };

    return typeMap[type] || this.capitalize(type);
  }
}
