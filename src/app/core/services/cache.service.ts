import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';

export interface CacheConfig {
  maxAge?: number;
  maxSize?: number;
  strategy?: 'memory' | 'localStorage' | 'sessionStorage';
}

export interface CacheEntry<T = any> {
  key: string;
  value: T;
  timestamp: number;
  expiresAt: number;
  size: number;
  url: string;
  method: string;
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitCount: number;
  missCount: number;
  hitRate: number;
  oldestEntry: number;
  newestEntry: number;
}

@Injectable({
  providedIn: 'root'
})
export class CacheService {
  private cache = new Map<string, CacheEntry>();
  private stats: CacheStats = {
    totalEntries: 0,
    totalSize: 0,
    hitCount: 0,
    missCount: 0,
    hitRate: 0,
    oldestEntry: 0,
    newestEntry: 0
  };

  private config: CacheConfig = {
    maxAge: 5 * 60 * 1000, // 5 minutes par défaut
    maxSize: 50 * 1024 * 1024, // 50 MB
    strategy: 'memory'
  };

  private cacheStatsSubject = new BehaviorSubject<CacheStats>(this.stats);
  public cacheStats$ = this.cacheStatsSubject.asObservable();

  /**
   * Configure le service de cache
   */
  configure(config: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...config };
    this.cleanup(); // Nettoyer après reconfiguration
  }

  /**
   * Stocke une réponse HTTP dans le cache
   */
  set(request: HttpRequest<any>, response: HttpResponse<any>, customMaxAge?: number): void {
    const key = this.generateCacheKey(request);
    const maxAge = customMaxAge || this.config.maxAge!;
    
    const cacheEntry: CacheEntry = {
      key,
      value: response.clone(),
      timestamp: Date.now(),
      expiresAt: Date.now() + maxAge,
      size: this.calculateSize(response),
      url: request.url,
      method: request.method
    };

    // Vérifier si on dépasse la taille maximale
    if (this.stats.totalSize + cacheEntry.size > this.config.maxSize!) {
      this.evictOldest();
    }

    this.cache.set(key, cacheEntry);
    this.updateStats();
  }

  /**
   * Récupère une réponse HTTP du cache
   */
  get(request: HttpRequest<any>): HttpResponse<any> | null {
    const key = this.generateCacheKey(request);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.missCount++;
      this.updateStats();
      return null;
    }

    // Vérifier l'expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.missCount++;
      this.updateStats();
      return null;
    }

    this.stats.hitCount++;
    this.updateStats();
    return entry.value.clone();
  }

  /**
   * Vérifie si une requête est en cache et valide
   */
  has(request: HttpRequest<any>): boolean {
    const key = this.generateCacheKey(request);
    const entry = this.cache.get(key);
    
    if (!entry) return false;
    
    // Vérifier l'expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.updateStats();
      return false;
    }
    
    return true;
  }

  /**
   * Supprime une entrée du cache
   */
  delete(request: HttpRequest<any>): boolean {
    const key = this.generateCacheKey(request);
    const deleted = this.cache.delete(key);
    
    if (deleted) {
      this.updateStats();
    }
    
    return deleted;
  }

  /**
   * Supprime toutes les entrées du cache
   */
  clear(): void {
    this.cache.clear();
    this.resetStats();
  }

  /**
   * Supprime les entrées expirées
   */
  cleanup(): void {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.updateStats();
    }
  }

  /**
   * Supprime les entrées par pattern d'URL
   */
  deleteByPattern(pattern: string | RegExp): number {
    let deletedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (typeof pattern === 'string' ? entry.url.includes(pattern) : pattern.test(entry.url)) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      this.updateStats();
    }

    return deletedCount;
  }

  /**
   * Supprime le cache pour un endpoint spécifique
   */
  deleteByEndpoint(endpoint: string): number {
    return this.deleteByPattern(new RegExp(`^.*${endpoint}.*$`));
  }

  /**
   * Supprime le cache pour les films
   */
  clearMoviesCache(): number {
    return this.deleteByPattern(/\/api\/movies/);
  }

  /**
   * Supprime le cache pour les cinémas
   */
  clearTheatersCache(): number {
    return this.deleteByPattern(/\/api\/theaters/);
  }

  /**
   * Supprime le cache pour les séances
   */
  clearShowtimesCache(): number {
    return this.deleteByPattern(/\/api\/showtimes/);
  }

  /**
   * Supprime le cache pour les réservations
   */
  clearReservationsCache(): number {
    return this.deleteByPattern(/\/api\/reservations/);
  }

  /**
   * Supprime le cache pour les utilisateurs
   */
  clearUsersCache(): number {
    return this.deleteByPattern(/\/api\/users/);
  }

  /**
   * Récupère les statistiques du cache
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Récupère les statistiques en tant qu'Observable
   */
  getStatsObservable(): Observable<CacheStats> {
    return this.cacheStats$;
  }

  /**
   * Récupère toutes les clés du cache
   */
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * Récupère toutes les entrées du cache
   */
  getEntries(): CacheEntry[] {
    return Array.from(this.cache.values());
  }

  /**
   * Vérifie si le cache est vide
   */
  isEmpty(): boolean {
    return this.cache.size === 0;
  }

  /**
   * Récupère la taille totale du cache
   */
  getTotalSize(): number {
    return this.stats.totalSize;
  }

  /**
   * Récupère le nombre d'entrées dans le cache
   */
  getEntryCount(): number {
    return this.cache.size;
  }

  /**
   * Exporte le cache (pour debug)
   */
  exportCache(): string {
    const exportData = {
      config: this.config,
      entries: this.getEntries(),
      stats: this.stats,
      exportTimestamp: Date.now()
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Importe le cache (pour debug)
   */
  importCache(data: string): boolean {
    try {
      const importData = JSON.parse(data);
      
      // Réinitialiser le cache
      this.clear();
      
      // Importer les entrées
      if (Array.isArray(importData.entries)) {
        importData.entries.forEach((entry: CacheEntry) => {
          this.cache.set(entry.key, entry);
        });
      }
      
      this.updateStats();
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'import du cache:', error);
      return false;
    }
  }

  /**
   * Active/désactive le cache
   */
  setEnabled(enabled: boolean): void {
    if (!enabled) {
      this.clear();
    }
  }

  /**
   * Vérifie si une URL doit être mise en cache
   */
  shouldCache(url: string): boolean {
    // URLs à mettre en cache
    const cacheablePatterns = [
      /\/api\/movies(\?.*)?$/,
      /\/api\/theaters(\?.*)?$/,
      /\/api\/showtimes(\?.*)?$/,
      /\/api\/genres(\?.*)?$/,
      /\/api\/reviews(\?.*)?$/
    ];

    // URLs à ne pas mettre en cache
    const nonCacheablePatterns = [
      /\/api\/auth\//,
      /\/api\/users\/[^\/]+\/password/,
      /\/api\/reservations\/[^\/]+\/cancel/,
      /\/api\/.*\/delete/,
      /\/api\/.*\/create/,
      /\/api\/.*\/update/
    ];

    // Vérifier les patterns non cacheables d'abord
    if (nonCacheablePatterns.some(pattern => pattern.test(url))) {
      return false;
    }

    // Vérifier les patterns cacheables
    return cacheablePatterns.some(pattern => pattern.test(url));
  }

  /**
   * Génère une clé de cache unique pour une requête
   */
  private generateCacheKey(request: HttpRequest<any>): string {
    // Inclure l'URL, la méthode et les paramètres de requête
    const keyParts = [
      request.method,
      request.urlWithParams,
      JSON.stringify(request.body || {}),
      JSON.stringify(request.headers.keys().reduce((acc, key) => {
        acc[key] = request.headers.get(key);
        return acc;
      }, {} as any))
    ];

    return btoa(keyParts.join('|')).substring(0, 100); // Limiter la longueur
  }

  /**
   * Calcule la taille approximative d'une réponse
   */
  private calculateSize(response: HttpResponse<any>): number {
    let size = 0;
    
    // Taille du body
    if (response.body) {
      size += new Blob([JSON.stringify(response.body)]).size;
    }
    
    // Taille des headers
    response.headers.keys().forEach(key => {
      const value = response.headers.get(key);
      size += key.length + (value ? value.length : 0);
    });
    
    // Taille du status
    size += response.status.toString().length;
    
    return size;
  }

  /**
   * Supprime les entrées les plus anciennes pour faire de la place
   */
  private evictOldest(): void {
    if (this.cache.size === 0) return;

    // Trier les entrées par timestamp (plus anciennes d'abord)
    const sortedEntries = Array.from(this.cache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp);

    // Supprimer les entrées jusqu'à ce qu'on ait assez d'espace
    let freedSpace = 0;
    const targetFreeSpace = this.config.maxSize! * 0.1; // Libérer 10% de l'espace

    for (const [key, entry] of sortedEntries) {
      if (freedSpace >= targetFreeSpace) break;
      
      this.cache.delete(key);
      freedSpace += entry.size;
    }

    this.updateStats();
  }

  /**
   * Met à jour les statistiques
   */
  private updateStats(): void {
    const entries = Array.from(this.cache.values());
    
    this.stats.totalEntries = entries.length;
    this.stats.totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);
    this.stats.oldestEntry = entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : 0;
    this.stats.newestEntry = entries.length > 0 ? Math.max(...entries.map(e => e.timestamp)) : 0;
    
    const totalRequests = this.stats.hitCount + this.stats.missCount;
    this.stats.hitRate = totalRequests > 0 ? (this.stats.hitCount / totalRequests) * 100 : 0;

    this.cacheStatsSubject.next({ ...this.stats });
  }

  /**
   * Réinitialise les statistiques
   */
  private resetStats(): void {
    this.stats = {
      totalEntries: 0,
      totalSize: 0,
      hitCount: 0,
      missCount: 0,
      hitRate: 0,
      oldestEntry: 0,
      newestEntry: 0
    };
    this.cacheStatsSubject.next(this.stats);
  }

  /**
   * Initialise le nettoyage périodique
   */
  private initializeCleanup(): void {
    // Nettoyer toutes les 30 secondes
    setInterval(() => {
      this.cleanup();
    }, 30000);
  }

  constructor() {
    this.initializeCleanup();
  }
}