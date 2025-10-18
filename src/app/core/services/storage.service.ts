import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface StorageConfig {
  prefix?: string;
  encryption?: boolean;
  compression?: boolean;
}

export interface StorageItem<T = any> {
  key: string;
  value: T;
  timestamp: number;
  expiresAt?: number;
  metadata?: {
    size: number;
    type: string;
    version?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private config: StorageConfig = {
    prefix: 'cinephoria_',
    encryption: false,
    compression: false
  };

  constructor() {
    this.initialize();
  }

  /**
   * Configure le service de stockage
   */
  configure(config: Partial<StorageConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Stocke une valeur dans le localStorage
   */
  set<T>(key: string, value: T, expiresIn?: number): void {
    const storageKey = this.getPrefixedKey(key);
    const storageItem: StorageItem<T> = {
      key: storageKey,
      value,
      timestamp: Date.now(),
      expiresAt: expiresIn ? Date.now() + expiresIn : undefined,
      metadata: {
        size: this.calculateSize(value),
        type: typeof value,
        version: '1.0'
      }
    };

    try {
      const serializedValue = this.serialize(storageItem);
      localStorage.setItem(storageKey, serializedValue);
    } catch (error) {
      console.error(`Erreur lors du stockage de la clé ${key}:`, error);
      this.handleStorageError(error, key);
    }
  }

  /**
   * Récupère une valeur du localStorage
   */
  get<T>(key: string): T | null {
    const storageKey = this.getPrefixedKey(key);
    
    try {
      const item = localStorage.getItem(storageKey);
      if (!item) return null;

      const storageItem = this.deserialize<StorageItem<T>>(item);
      
      // Vérifie l'expiration
      if (storageItem.expiresAt && Date.now() > storageItem.expiresAt) {
        this.remove(key);
        return null;
      }

      return storageItem.value;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la clé ${key}:`, error);
      return null;
    }
  }

  /**
   * Récupère une valeur avec Observable
   */
  getObservable<T>(key: string): Observable<T | null> {
    return of(this.get<T>(key));
  }

  /**
   * Supprime une valeur du localStorage
   */
  remove(key: string): void {
    const storageKey = this.getPrefixedKey(key);
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error(`Erreur lors de la suppression de la clé ${key}:`, error);
    }
  }

  /**
   * Supprime toutes les valeurs avec le préfixe de l'application
   */
  clear(): void {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.config.prefix!)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Erreur lors du nettoyage du stockage:', error);
    }
  }

  /**
   * Supprime toutes les données expirées
   */
  clearExpired(): void {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.config.prefix!)) {
          const item = localStorage.getItem(key);
          if (item) {
            try {
              const storageItem = this.deserialize<StorageItem>(item);
              if (storageItem.expiresAt && Date.now() > storageItem.expiresAt) {
                keysToRemove.push(key);
              }
            } catch {
              // Supprime les éléments corrompus
              keysToRemove.push(key);
            }
          }
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Erreur lors du nettoyage des données expirées:', error);
    }
  }

  /**
   * Stocke une valeur dans le sessionStorage
   */
  setSession<T>(key: string, value: T): void {
    const storageKey = this.getPrefixedKey(key);
    try {
      const serializedValue = JSON.stringify(value);
      sessionStorage.setItem(storageKey, serializedValue);
    } catch (error) {
      console.error(`Erreur lors du stockage session de la clé ${key}:`, error);
    }
  }

  /**
   * Récupère une valeur du sessionStorage
   */
  getSession<T>(key: string): T | null {
    const storageKey = this.getPrefixedKey(key);
    try {
      const item = sessionStorage.getItem(storageKey);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Erreur lors de la récupération session de la clé ${key}:`, error);
      return null;
    }
  }

  /**
   * Supprime une valeur du sessionStorage
   */
  removeSession(key: string): void {
    const storageKey = this.getPrefixedKey(key);
    try {
      sessionStorage.removeItem(storageKey);
    } catch (error) {
      console.error(`Erreur lors de la suppression session de la clé ${key}:`, error);
    }
  }

  /**
   * Stocke le token d'authentification
   */
  setAuthToken(token: string, expiresIn: number = 24 * 60 * 60 * 1000): void {
    this.set('auth_token', token, expiresIn);
  }

  /**
   * Récupère le token d'authentification
   */
  getAuthToken(): string | null {
    return this.get<string>('auth_token');
  }

  /**
   * Supprime le token d'authentification
   */
  removeAuthToken(): void {
    this.remove('auth_token');
  }

  /**
   * Stocke les préférences utilisateur
   */
  setUserPreferences(preferences: any): void {
    this.set('user_preferences', preferences);
  }

  /**
   * Récupère les préférences utilisateur
   */
  getUserPreferences(): any {
    return this.get('user_preferences') || {};
  }

  /**
   * Stocke les données de recherche
   */
  setSearchData(searchKey: string, data: any): void {
    this.set(`search_${searchKey}`, data, 30 * 60 * 1000); // 30 minutes
  }

  /**
   * Récupère les données de recherche
   */
  getSearchData(searchKey: string): any {
    return this.get(`search_${searchKey}`);
  }

  /**
   * Stocke les données de film
   */
  setMovieData(movieId: number, data: any): void {
    this.set(`movie_${movieId}`, data, 60 * 60 * 1000); // 1 heure
  }

  /**
   * Récupère les données de film
   */
  getMovieData(movieId: number): any {
    return this.get(`movie_${movieId}`);
  }

  /**
   * Stocke les données de cinéma
   */
  setTheaterData(theaterId: number, data: any): void {
    this.set(`theater_${theaterId}`, data, 2 * 60 * 60 * 1000); // 2 heures
  }

  /**
   * Récupère les données de cinéma
   */
  getTheaterData(theaterId: number): any {
    return this.get(`theater_${theaterId}`);
  }

  /**
   * Vérifie l'espace disponible
   */
  getAvailableSpace(): number {
    try {
      // Estimation de l'espace disponible
      const testKey = this.getPrefixedKey('test_space');
      const testData = 'x'.repeat(1024); // 1KB
      
      localStorage.setItem(testKey, testData);
      localStorage.removeItem(testKey);
      
      return 5 * 1024 * 1024; // Estimation 5MB pour la plupart des navigateurs
    } catch (error) {
      return 0;
    }
  }

  /**
   * Calcule la taille utilisée
   */
  getUsedSpace(): number {
    let totalSize = 0;
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.config.prefix!)) {
          const value = localStorage.getItem(key);
          totalSize += key.length + (value ? value.length : 0);
        }
      }
    } catch (error) {
      console.error('Erreur lors du calcul de la taille utilisée:', error);
    }
    
    return totalSize;
  }

  /**
   * Exporte toutes les données de l'application
   */
  exportData(): string {
    const exportData: { [key: string]: any } = {};
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.config.prefix!)) {
          const value = localStorage.getItem(key);
          if (value) {
            try {
              exportData[key] = this.deserialize(value);
            } catch {
              exportData[key] = value;
            }
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'export des données:', error);
    }
    
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Importe des données dans le stockage
   */
  importData(data: string): boolean {
    try {
      const importData = JSON.parse(data);
      
      Object.keys(importData).forEach(key => {
        if (key.startsWith(this.config.prefix!)) {
          const serializedValue = this.serialize(importData[key]);
          localStorage.setItem(key, serializedValue);
        }
      });
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'import des données:', error);
      return false;
    }
  }

  private getPrefixedKey(key: string): string {
    return `${this.config.prefix}${key}`;
  }

  private serialize(value: any): string {
    return JSON.stringify(value);
  }

  private deserialize<T>(value: string): T {
    return JSON.parse(value);
  }

  private calculateSize(value: any): number {
    return new Blob([JSON.stringify(value)]).size;
  }

  private handleStorageError(error: any, key: string): void {
    if (error.name === 'QuotaExceededError') {
      // Nettoyer les données expirées et réessayer
      this.clearExpired();
      console.warn('Quota de stockage dépassé, données expirées nettoyées');
    }
  }

  private initialize(): void {
    // Nettoyer les données expirées au démarrage
    this.clearExpired();
    
    // Surveiller les changements de stockage
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        this.handleStorageChange(event);
      });
    }
  }

  private handleStorageChange(event: StorageEvent): void {
    if (event.key && event.key.startsWith(this.config.prefix!)) {
      // Émettre un événement personnalisé pour les composants intéressés
      const customEvent = new CustomEvent('cinephoriaStorageChange', {
        detail: {
          key: event.key,
          oldValue: event.oldValue,
          newValue: event.newValue,
          url: event.url,
          storageArea: event.storageArea
        }
      });
      
      window.dispatchEvent(customEvent);
    }
  }
}