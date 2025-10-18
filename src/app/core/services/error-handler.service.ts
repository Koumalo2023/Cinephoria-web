import { Injectable, ErrorHandler, Injector } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';

export interface ErrorContext {
  timestamp: Date;
  url?: string;
  userAgent?: string;
  userId?: string;
  userRole?: string;
  component?: string;
  method?: string;
  lineNumber?: number;
  columnNumber?: number;
  stack?: string;
}

export interface ErrorLog {
  id: string;
  message: string;
  type: string;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  handled: boolean;
  userMessage?: string;
}

export interface ErrorConfig {
  enableLogging: boolean;
  enableNotifications: boolean;
  enableConsoleLogging: boolean;
  maxLogEntries: number;
  autoReportErrors: boolean;
  ignoredErrors: RegExp[];
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService implements ErrorHandler {
  private errorLogs: ErrorLog[] = [];
  private config: ErrorConfig = {
    enableLogging: true,
    enableNotifications: true,
    enableConsoleLogging: true,
    maxLogEntries: 1000,
    autoReportErrors: false,
    ignoredErrors: [
      /Loading chunk .* failed/,
      /Network Error/,
      /Timeout/,
      /Script error/,
      /ResizeObserver loop limit exceeded/
    ]
  };

  constructor(
    private injector: Injector,
    private notificationService: NotificationService
  ) {}

  /**
   * Gère les erreurs globales de l'application
   */
  handleError(error: any): void {
    // Vérifier si l'erreur doit être ignorée
    if (this.shouldIgnoreError(error)) {
      return;
    }

    const errorLog = this.createErrorLog(error);
    
    // Ajouter au journal d'erreurs
    if (this.config.enableLogging) {
      this.addToErrorLog(errorLog);
    }

    // Journaliser dans la console
    if (this.config.enableConsoleLogging) {
      this.logToConsole(errorLog);
    }

    // Afficher une notification à l'utilisateur
    if (this.config.enableNotifications && errorLog.userMessage) {
      this.showUserNotification(errorLog);
    }

    // Reporter automatiquement (si configuré)
    if (this.config.autoReportErrors) {
      this.reportError(errorLog);
    }
  }

  /**
   * Gère les erreurs HTTP spécifiques
   */
  handleHttpError(error: HttpErrorResponse, context?: string): void {
    const errorLog = this.createHttpErrorLog(error, context);
    
    if (this.config.enableLogging) {
      this.addToErrorLog(errorLog);
    }

    // Gérer les erreurs HTTP spécifiques
    this.handleSpecificHttpError(error, errorLog);
  }

  /**
   * Configure le service de gestion des erreurs
   */
  configure(config: Partial<ErrorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Récupère le journal d'erreurs
   */
  getErrorLogs(): ErrorLog[] {
    return [...this.errorLogs];
  }

  /**
   * Récupère les erreurs par sévérité
   */
  getErrorsBySeverity(severity: ErrorLog['severity']): ErrorLog[] {
    return this.errorLogs.filter(log => log.severity === severity);
  }

  /**
   * Récupère les erreurs non gérées
   */
  getUnhandledErrors(): ErrorLog[] {
    return this.errorLogs.filter(log => !log.handled);
  }

  /**
   * Marque une erreur comme gérée
   */
  markAsHandled(errorId: string): void {
    const error = this.errorLogs.find(log => log.id === errorId);
    if (error) {
      error.handled = true;
    }
  }

  /**
   * Supprime une erreur du journal
   */
  removeError(errorId: string): void {
    this.errorLogs = this.errorLogs.filter(log => log.id !== errorId);
  }

  /**
   * Supprime toutes les erreurs
   */
  clearErrorLog(): void {
    this.errorLogs = [];
  }

  /**
   * Exporte le journal d'erreurs
   */
  exportErrorLog(): string {
    const exportData = {
      timestamp: new Date().toISOString(),
      totalErrors: this.errorLogs.length,
      errors: this.errorLogs
    };

    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Crée un log d'erreur à partir d'une erreur générique
   */
  private createErrorLog(error: any): ErrorLog {
    const context = this.getErrorContext(error);
    const severity = this.determineSeverity(error);
    const userMessage = this.getUserMessage(error);

    return {
      id: this.generateErrorId(),
      message: error.message || 'Erreur inconnue',
      type: error.name || 'Error',
      context,
      severity,
      handled: false,
      userMessage
    };
  }

  /**
   * Crée un log d'erreur HTTP
   */
  private createHttpErrorLog(error: HttpErrorResponse, context?: string): ErrorLog {
    const errorContext = this.getErrorContext(error);
    if (context) {
      errorContext.component = context;
    }

    const severity = this.determineHttpSeverity(error);
    const userMessage = this.getHttpUserMessage(error);

    return {
      id: this.generateErrorId(),
      message: error.message || `HTTP Error ${error.status}`,
      type: 'HttpErrorResponse',
      context: errorContext,
      severity,
      handled: false,
      userMessage
    };
  }

  /**
   * Récupère le contexte de l'erreur
   */
  private getErrorContext(error: any): ErrorContext {
    const router = this.injector.get(Router);
    
    return {
      timestamp: new Date(),
      url: router.url,
      userAgent: navigator.userAgent,
      component: this.getComponentFromStack(error),
      method: this.getMethodFromStack(error),
      lineNumber: error.lineNumber,
      columnNumber: error.columnNumber,
      stack: error.stack
    };
  }

  /**
   * Détermine la sévérité de l'erreur
   */
  private determineSeverity(error: any): ErrorLog['severity'] {
    if (error instanceof HttpErrorResponse) {
      return this.determineHttpSeverity(error);
    }

    // Erreurs de réseau
    if (error.message?.includes('Network Error') || error.message?.includes('Failed to fetch')) {
      return 'medium';
    }

    // Erreurs de timeout
    if (error.message?.includes('Timeout')) {
      return 'medium';
    }

    // Erreurs de syntaxe
    if (error.name === 'SyntaxError') {
      return 'high';
    }

    // Erreurs de référence
    if (error.name === 'ReferenceError') {
      return 'high';
    }

    // Erreurs de type
    if (error.name === 'TypeError') {
      return 'high';
    }

    // Erreurs critiques par défaut
    return 'critical';
  }

  /**
   * Détermine la sévérité d'une erreur HTTP
   */
  private determineHttpSeverity(error: HttpErrorResponse): ErrorLog['severity'] {
    if (error.status >= 500) {
      return 'high'; // Erreurs serveur
    } else if (error.status >= 400) {
      return 'medium'; // Erreurs client
    } else {
      return 'low'; // Autres erreurs
    }
  }

  /**
   * Obtient le message utilisateur pour une erreur
   */
  private getUserMessage(error: any): string | undefined {
    if (error instanceof HttpErrorResponse) {
      return this.getHttpUserMessage(error);
    }

    // Messages pour les erreurs courantes
    const commonErrors: { [key: string]: string } = {
      'Network Error': 'Problème de connexion réseau. Vérifiez votre connexion internet.',
      'Failed to fetch': 'Impossible de contacter le serveur. Vérifiez votre connexion.',
      'Timeout': 'La requête a expiré. Veuillez réessayer.',
      'SyntaxError': 'Erreur de syntaxe dans l\'application.',
      'ReferenceError': 'Erreur de référence dans l\'application.',
      'TypeError': 'Erreur de type dans l\'application.'
    };

    return commonErrors[error.message] || 'Une erreur inattendue est survenue.';
  }

  /**
   * Obtient le message utilisateur pour une erreur HTTP
   */
  private getHttpUserMessage(error: HttpErrorResponse): string | undefined {
    const statusMessages: { [key: number]: string } = {
      0: 'Impossible de contacter le serveur. Vérifiez votre connexion internet.',
      400: 'Requête incorrecte. Veuillez vérifier les informations saisies.',
      401: 'Vous devez être connecté pour accéder à cette ressource.',
      403: 'Vous n\'avez pas les permissions nécessaires pour cette action.',
      404: 'La ressource demandée n\'a pas été trouvée.',
      409: 'Conflit de données. Cette action n\'est pas possible dans l\'état actuel.',
      422: 'Données de validation incorrectes.',
      429: 'Trop de requêtes. Veuillez patienter avant de réessayer.',
      500: 'Erreur interne du serveur. Notre équipe technique a été notifiée.',
      502: 'Serveur temporairement indisponible. Veuillez réessayer plus tard.',
      503: 'Service temporairement indisponible. Maintenance en cours.',
      504: 'Délai d\'attente dépassé. Veuillez réessayer.'
    };

    return statusMessages[error.status] || 'Une erreur est survenue lors de la communication avec le serveur.';
  }

  /**
   * Gère les erreurs HTTP spécifiques
   */
  private handleSpecificHttpError(error: HttpErrorResponse, errorLog: ErrorLog): void {
    const router = this.injector.get(Router);

    switch (error.status) {
      case 401: // Non autorisé
        // Rediriger vers la page de connexion
        router.navigate(['/auth/login']);
        break;

      case 403: // Interdit
        // Afficher un message d'erreur spécifique
        this.notificationService.error(
          'Accès refusé',
          'Vous n\'avez pas les permissions nécessaires pour cette action.'
        );
        break;

      case 404: // Non trouvé
        // Rediriger vers la page 404
        router.navigate(['/not-found']);
        break;

      case 429: // Trop de requêtes
        this.notificationService.warning(
          'Trop de requêtes',
          'Veuillez patienter quelques instants avant de réessayer.'
        );
        break;

      case 500: // Erreur serveur
        // Journaliser l'erreur côté serveur
        console.error('Erreur serveur:', error);
        break;

      default:
        // Afficher une notification générique
        if (this.config.enableNotifications && errorLog.userMessage) {
          this.showUserNotification(errorLog);
        }
        break;
    }
  }

  /**
   * Ajoute une erreur au journal
   */
  private addToErrorLog(errorLog: ErrorLog): void {
    this.errorLogs.unshift(errorLog);

    // Limiter la taille du journal
    if (this.errorLogs.length > this.config.maxLogEntries) {
      this.errorLogs = this.errorLogs.slice(0, this.config.maxLogEntries);
    }
  }

  /**
   * Journalise l'erreur dans la console
   */
  private logToConsole(errorLog: ErrorLog): void {
    const { message, type, context, severity } = errorLog;
    
    const consoleMethod = this.getConsoleMethod(severity);
    const styles = this.getConsoleStyles(severity);

    console.groupCollapsed(`%c${type}: ${message}`, styles);
    console.log('Contexte:', context);
    console.log('Sévérité:', severity);
    if (context.stack) {
      console.log('Stack:', context.stack);
    }
    console.groupEnd();
  }

  /**
   * Affiche une notification à l'utilisateur
   */
  private showUserNotification(errorLog: ErrorLog): void {
    if (!errorLog.userMessage) return;

    const notificationConfig = {
      critical: { type: 'error' as const, duration: 10000 },
      high: { type: 'error' as const, duration: 8000 },
      medium: { type: 'warning' as const, duration: 6000 },
      low: { type: 'info' as const, duration: 4000 }
    };

    const config = notificationConfig[errorLog.severity];
    
    if (config.type === 'error') {
      this.notificationService.error('Erreur', errorLog.userMessage, config.duration);
    } else if (config.type === 'warning') {
      this.notificationService.warning('Avertissement', errorLog.userMessage, config.duration);
    } else {
      this.notificationService.info('Information', errorLog.userMessage, config.duration);
    }
  }

  /**
   * Signale l'erreur (pour intégration avec des services externes)
   */
  private reportError(errorLog: ErrorLog): void {
    // Ici, vous pouvez intégrer avec des services comme Sentry, LogRocket, etc.
    console.log('Error reported:', errorLog);
    
    // Exemple d'intégration avec un service externe
    // if (window.sentry) {
    //   window.sentry.captureException(new Error(errorLog.message), {
    //     extra: errorLog.context
    //   });
    // }
  }

  /**
   * Vérifie si l'erreur doit être ignorée
   */
  private shouldIgnoreError(error: any): boolean {
    const errorMessage = error.message || '';
    return this.config.ignoredErrors.some(pattern => pattern.test(errorMessage));
  }

  /**
   * Extrait le composant de la stack trace
   */
  private getComponentFromStack(error: any): string | undefined {
    if (!error.stack) return undefined;

    const angularPattern = /at (.*Component\.|.*Directive\.|.*Pipe\.|.*Service\.)/;
    const match = error.stack.match(angularPattern);
    
    return match ? match[1] : undefined;
  }

  /**
   * Extrait la méthode de la stack trace
   */
  private getMethodFromStack(error: any): string | undefined {
    if (!error.stack) return undefined;

    const methodPattern = /at (.*) \(/;
    const match = error.stack.match(methodPattern);
    
    return match ? match[1] : undefined;
  }

  /**
   * Génère un ID d'erreur unique
   */
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtient la méthode console appropriée
   */
  private getConsoleMethod(severity: ErrorLog['severity']): 'error' | 'warn' | 'info' {
    switch (severity) {
      case 'critical':
      case 'high':
        return 'error';
      case 'medium':
        return 'warn';
      default:
        return 'info';
    }
  }

  /**
   * Obtient les styles console appropriés
   */
  private getConsoleStyles(severity: ErrorLog['severity']): string {
    const colors = {
      critical: 'background: #dc3545; color: white; padding: 2px 4px; border-radius: 3px;',
      high: 'background: #fd7e14; color: white; padding: 2px 4px; border-radius: 3px;',
      medium: 'background: #ffc107; color: black; padding: 2px 4px; border-radius: 3px;',
      low: 'background: #17a2b8; color: white; padding: 2px 4px; border-radius: 3px;'
    };

    return colors[severity];
  }
}