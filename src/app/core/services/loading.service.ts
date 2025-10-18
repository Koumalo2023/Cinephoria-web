import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
  type?: 'spinner' | 'progress' | 'skeleton';
  size?: 'small' | 'medium' | 'large';
  overlay?: boolean;
}

export interface LoadingTask {
  id: string;
  message?: string;
  progress?: number;
  type?: LoadingState['type'];
  size?: LoadingState['size'];
  overlay?: boolean;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingStates = new Map<string, LoadingTask>();
  private loadingSubject = new BehaviorSubject<LoadingState>({ isLoading: false });
  public loadingState$: Observable<LoadingState> = this.loadingSubject.asObservable().pipe(
    distinctUntilChanged((prev, curr) => 
      prev.isLoading === curr.isLoading && 
      prev.message === curr.message && 
      prev.progress === curr.progress
    )
  );

  private defaultConfig = {
    defaultMessage: 'Chargement en cours...',
    minDisplayTime: 300, // ms
    autoDismiss: true,
    showProgress: true
  };

  /**
   * Démarre un indicateur de chargement
   */
  start(
    id: string = 'default',
    message?: string,
    type: LoadingState['type'] = 'spinner',
    size: LoadingState['size'] = 'medium',
    overlay: boolean = true
  ): void {
    const task: LoadingTask = {
      id,
      message: message || this.defaultConfig.defaultMessage,
      type,
      size,
      overlay,
      timestamp: Date.now()
    };

    this.loadingStates.set(id, task);
    this.updateLoadingState();
  }

  /**
   * Démarre un chargement avec progression
   */
  startWithProgress(
    id: string = 'default',
    message?: string,
    initialProgress: number = 0
  ): void {
    const task: LoadingTask = {
      id,
      message: message || this.defaultConfig.defaultMessage,
      progress: initialProgress,
      type: 'progress',
      size: 'medium',
      overlay: true,
      timestamp: Date.now()
    };

    this.loadingStates.set(id, task);
    this.updateLoadingState();
  }

  /**
   * Met à jour la progression d'un chargement
   */
  updateProgress(id: string, progress: number, message?: string): void {
    const task = this.loadingStates.get(id);
    if (task) {
      task.progress = Math.min(Math.max(progress, 0), 100);
      if (message) {
        task.message = message;
      }
      this.updateLoadingState();
    }
  }

  /**
   * Met à jour le message d'un chargement
   */
  updateMessage(id: string, message: string): void {
    const task = this.loadingStates.get(id);
    if (task) {
      task.message = message;
      this.updateLoadingState();
    }
  }

  /**
   * Arrête un indicateur de chargement
   */
  stop(id: string = 'default'): void {
    const task = this.loadingStates.get(id);
    if (task) {
      // Respecter le temps d'affichage minimum
      const displayTime = Date.now() - task.timestamp;
      const remainingTime = Math.max(0, this.defaultConfig.minDisplayTime - displayTime);

      if (remainingTime > 0) {
        setTimeout(() => {
          this.loadingStates.delete(id);
          this.updateLoadingState();
        }, remainingTime);
      } else {
        this.loadingStates.delete(id);
        this.updateLoadingState();
      }
    }
  }

  /**
   * Arrête tous les indicateurs de chargement
   */
  stopAll(): void {
    this.loadingStates.clear();
    this.updateLoadingState();
  }

  /**
   * Vérifie si un chargement spécifique est en cours
   */
  isLoading(id: string = 'default'): boolean {
    return this.loadingStates.has(id);
  }

  /**
   * Vérifie si au moins un chargement est en cours
   */
  isAnyLoading(): boolean {
    return this.loadingStates.size > 0;
  }

  /**
   * Récupère l'état de chargement actuel
   */
  getLoadingState(): LoadingState {
    if (this.loadingStates.size === 0) {
      return { isLoading: false };
    }

    // Retourner le premier chargement (ou un état agrégé)
    const firstTask = Array.from(this.loadingStates.values())[0];
    
    return {
      isLoading: true,
      message: firstTask.message,
      progress: firstTask.progress,
      type: firstTask.type,
      size: firstTask.size,
      overlay: firstTask.overlay
    };
  }

  /**
   * Récupère tous les chargements en cours
   */
  getActiveLoadings(): LoadingTask[] {
    return Array.from(this.loadingStates.values());
  }

  /**
   * Récupère le nombre de chargements en cours
   */
  getLoadingCount(): number {
    return this.loadingStates.size;
  }

  /**
   * Configure le service
   */
  configure(config: Partial<typeof this.defaultConfig>): void {
    this.defaultConfig = { ...this.defaultConfig, ...config };
  }

  /**
   * Démarre un chargement pour une requête HTTP
   */
  startHttpLoading(
    endpoint: string,
    method: string = 'GET',
    id?: string
  ): string {
    const loadingId = id || `http_${method}_${endpoint}_${Date.now()}`;
    const message = this.getHttpLoadingMessage(method, endpoint);
    
    this.start(loadingId, message, 'spinner', 'medium', true);
    return loadingId;
  }

  /**
   * Démarre un chargement avec progression pour un upload
   */
  startUploadLoading(
    fileName: string,
    id?: string
  ): string {
    const loadingId = id || `upload_${fileName}_${Date.now()}`;
    const message = `Téléchargement de "${fileName}"...`;
    
    this.startWithProgress(loadingId, message, 0);
    return loadingId;
  }

  /**
   * Démarre un chargement pour une sauvegarde
   */
  startSaveLoading(
    entity: string,
    id?: string
  ): string {
    const loadingId = id || `save_${entity}_${Date.now()}`;
    const message = `Sauvegarde des données ${entity}...`;
    
    this.start(loadingId, message, 'spinner', 'small', false);
    return loadingId;
  }

  /**
   * Démarre un chargement pour une recherche
   */
  startSearchLoading(
    query: string,
    id?: string
  ): string {
    const loadingId = id || `search_${query}_${Date.now()}`;
    const message = `Recherche de "${query}"...`;
    
    this.start(loadingId, message, 'spinner', 'small', false);
    return loadingId;
  }

  /**
   * Démarre un chargement pour une génération de rapport
   */
  startReportLoading(
    reportType: string,
    id?: string
  ): string {
    const loadingId = id || `report_${reportType}_${Date.now()}`;
    const message = `Génération du rapport ${reportType}...`;
    
    this.startWithProgress(loadingId, message, 0);
    return loadingId;
  }

  /**
   * Simule une progression pour les tâches longues
   */
  simulateProgress(
    id: string,
    duration: number = 5000,
    steps: number = 10
  ): void {
    const stepDuration = duration / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = (currentStep / steps) * 100;
      
      this.updateProgress(id, progress, `Progression: ${Math.round(progress)}%`);

      if (currentStep >= steps) {
        clearInterval(interval);
        this.stop(id);
      }
    }, stepDuration);
  }

  /**
   * Gère les erreurs de chargement
   */
  handleLoadingError(id: string, errorMessage: string): void {
    const task = this.loadingStates.get(id);
    if (task) {
      task.message = `Erreur: ${errorMessage}`;
      this.updateLoadingState();

      // Arrêter après un délai
      setTimeout(() => {
        this.stop(id);
      }, 3000);
    }
  }

  /**
   * Crée un wrapper pour les observables avec gestion automatique du chargement
   */
  wrapObservable<T>(
    observable: Observable<T>,
    loadingId?: string,
    message?: string
  ): Observable<T> {
    const id = loadingId || `obs_${Date.now()}`;
    
    return new Observable<T>(subscriber => {
      this.start(id, message);

      const subscription = observable.subscribe({
        next: (value) => {
          subscriber.next(value);
        },
        error: (error) => {
          this.handleLoadingError(id, error.message);
          subscriber.error(error);
        },
        complete: () => {
          this.stop(id);
          subscriber.complete();
        }
      });

      return () => {
        subscription.unsubscribe();
        this.stop(id);
      };
    });
  }

  /**
   * Crée un wrapper pour les promesses avec gestion automatique du chargement
   */
  async wrapPromise<T>(
    promise: Promise<T>,
    loadingId?: string,
    message?: string
  ): Promise<T> {
    const id = loadingId || `promise_${Date.now()}`;
    
    try {
      this.start(id, message);
      const result = await promise;
      this.stop(id);
      return result;
    } catch (error) {
      this.handleLoadingError(id, (error as Error).message);
      throw error;
    }
  }

  /**
   * Réinitialise le service
   */
  reset(): void {
    this.loadingStates.clear();
    this.updateLoadingState();
  }

  /**
   * Met à jour l'état de chargement global
   */
  private updateLoadingState(): void {
    const state = this.getLoadingState();
    this.loadingSubject.next(state);
  }

  /**
   * Obtient le message de chargement pour les requêtes HTTP
   */
  private getHttpLoadingMessage(method: string, endpoint: string): string {
    const methodMessages: { [key: string]: string } = {
      'GET': 'Récupération des données...',
      'POST': 'Création en cours...',
      'PUT': 'Mise à jour en cours...',
      'PATCH': 'Modification en cours...',
      'DELETE': 'Suppression en cours...'
    };

    const baseMessage = methodMessages[method] || 'Traitement en cours...';

    // Messages spécifiques par endpoint
    const endpointMessages: { [key: string]: string } = {
      '/api/movies': 'Chargement des films...',
      '/api/theaters': 'Chargement des cinémas...',
      '/api/showtimes': 'Chargement des séances...',
      '/api/reservations': 'Chargement des réservations...',
      '/api/users': 'Chargement des utilisateurs...',
      '/api/auth': 'Authentification...'
    };

    const specificMessage = Object.entries(endpointMessages).find(([path]) => 
      endpoint.includes(path)
    )?.[1];

    return specificMessage || baseMessage;
  }

  /**
   * Gestionnaire pour les événements de navigation
   */
  handleNavigationStart(): void {
    this.start('navigation', 'Chargement de la page...', 'spinner', 'large', true);
  }

  /**
   * Gestionnaire pour la fin de navigation
   */
  handleNavigationEnd(): void {
    this.stop('navigation');
  }

  /**
   * Gestionnaire pour les erreurs de navigation
   */
  handleNavigationError(): void {
    this.handleLoadingError('navigation', 'Erreur lors du chargement de la page');
  }

  /**
   * Débogue les chargements actifs
   */
  debugActiveLoadings(): void {
    console.group('Chargements actifs');
    this.getActiveLoadings().forEach(task => {
      console.log(`- ${task.id}: ${task.message} (${task.progress || 0}%)`);
    });
    console.groupEnd();
  }
}