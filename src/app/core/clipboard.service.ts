import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ClipboardService {

  async copyToClipboard(value: string | number): Promise<boolean> {
    try {
      const text = String(value ?? '');
      if (!text) return false;

      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Erreur copie clipboard:', error);
      return false;
    }
  }
}
