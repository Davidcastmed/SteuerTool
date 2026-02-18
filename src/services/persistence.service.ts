import { Injectable } from '@angular/core';
import { TaxData } from '../models/tax-data.model';

@Injectable({
  providedIn: 'root',
})
export class PersistenceService {
  private getStorageKey(year: number): string {
    return `steuererklaerung-data-${year}`;
  }

  saveTaxData(data: TaxData, year: number): void {
    try {
      const key = this.getStorageKey(year);
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving data to localStorage', e);
    }
  }

  loadTaxData(year: number): TaxData | null {
    try {
      const key = this.getStorageKey(year);
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Error reading data from localStorage', e);
      return null;
    }
  }

  clearTaxData(year: number): void {
    try {
      const key = this.getStorageKey(year);
      localStorage.removeItem(key);
    } catch (e) {
      console.error('Error removing data from localStorage', e);
    }
  }
}