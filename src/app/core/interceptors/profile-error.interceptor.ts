import {
    HttpErrorResponse,
    HttpEvent,
    HttpHandler,
    HttpInterceptor,
    HttpRequest
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class ProfileErrorInterceptor implements HttpInterceptor {

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Une erreur est survenue lors de l\'opération';
        
        // Gestion spécifique des erreurs liées au profil
        if (this.isProfileRequest(request.url)) {
          errorMessage = this.getProfileErrorMessage(error, request);
        } else {
          errorMessage = this.getGenericErrorMessage(error);
        }
        
        console.error('Profile API Error:', {
          url: request.url,
          method: request.method,
          status: error.status,
          message: errorMessage,
          error: error.error
        });

        // On pourrait émettre l'erreur via un service de notification ici
        // this.notificationService.showError(errorMessage);
        
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Vérifie si la requête concerne les fonctionnalités de profil
   */
  private isProfileRequest(url: string): boolean {
    const profileEndpoints = [
      '/api/auth/user-profile',
      '/api/auth/update-profile',
      '/api/auth/upload-user-profile',
      '/api/auth/change-password',
      '/api/settings/notifications',
      '/api/settings/security'
    ];
    
    return profileEndpoints.some(endpoint => url.includes(endpoint));
  }

  /**
   * Génère un message d'erreur spécifique pour les requêtes de profil
   */
  private getProfileErrorMessage(error: HttpErrorResponse, request: HttpRequest<unknown>): string {
    const endpoint = this.getEndpointName(request.url);
    
    switch (error.status) {
      case 400:
        return this.getBadRequestMessage(endpoint, error);
      case 401:
        return 'Votre session a expiré. Veuillez vous reconnecter.';
      case 403:
        return 'Vous n\'avez pas les permissions nécessaires pour cette action.';
      case 404:
        return this.getNotFoundMessage(endpoint);
      case 409:
        return 'Cette adresse email est déjà utilisée.';
      case 422:
        return this.getValidationErrorMessage(error);
      case 429:
        return 'Trop de tentatives. Veuillez réessayer dans quelques minutes.';
      case 500:
        return 'Erreur serveur. Veuillez réessayer plus tard.';
      case 503:
        return 'Service temporairement indisponible. Veuillez réessayer plus tard.';
      default:
        return `Erreur lors de ${this.getActionName(endpoint, request.method)}. Veuillez réessayer.`;
    }
  }

  /**
   * Génère un message d'erreur générique
   */
  private getGenericErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 0:
        return 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.';
      case 401:
        return 'Session expirée. Veuillez vous reconnecter.';
      case 403:
        return 'Accès non autorisé.';
      case 404:
        return 'Ressource non trouvée.';
      case 500:
        return 'Erreur serveur interne.';
      default:
        return 'Une erreur inattendue est survenue.';
    }
  }

  /**
   * Messages d'erreur pour les requêtes 400 (Bad Request)
   */
  private getBadRequestMessage(endpoint: string, error: HttpErrorResponse): string {
    const errorDetail = error.error?.message || error.error?.errors?.[0];
    
    if (errorDetail) {
      return errorDetail;
    }

    switch (endpoint) {
      case 'change-password':
        return 'Le mot de passe actuel est incorrect ou le nouveau mot de passe ne respecte pas les critères de sécurité.';
      case 'upload-user-profile':
        return 'Le fichier image n\'est pas valide. Formats acceptés: JPG, PNG, GIF. Taille max: 5MB.';
      case 'update-profile':
        return 'Les données du profil sont invalides. Vérifiez les informations saisies.';
      default:
        return 'Requête invalide. Vérifiez les données envoyées.';
    }
  }

  /**
   * Messages d'erreur pour les requêtes 404 (Not Found)
   */
  private getNotFoundMessage(endpoint: string): string {
    switch (endpoint) {
      case 'user-profile':
        return 'Profil utilisateur non trouvé.';
      case 'settings':
        return 'Paramètres non trouvés.';
      default:
        return 'Ressource non trouvée.';
    }
  }

  /**
   * Extrait les messages d'erreur de validation
   */
  private getValidationErrorMessage(error: HttpErrorResponse): string {
    const errors = error.error?.errors;
    
    if (errors && Array.isArray(errors) && errors.length > 0) {
      return errors[0];
    }
    
    if (error.error?.message) {
      return error.error.message;
    }
    
    return 'Données de validation invalides.';
  }

  /**
   * Extrait le nom de l'endpoint à partir de l'URL
   */
  private getEndpointName(url: string): string {
    const segments = url.split('/');
    return segments[segments.length - 1] || segments[segments.length - 2] || 'unknown';
  }

  /**
   * Génère le nom de l'action en fonction de la méthode HTTP
   */
  private getActionName(endpoint: string, method: string | null): string {
    const actions: { [key: string]: string } = {
      'GET': 'la récupération',
      'POST': 'l\'envoi',
      'PUT': 'la mise à jour',
      'DELETE': 'la suppression',
      'PATCH': 'la modification'
    };

    const action = actions[method || 'GET'] || 'l\'opération';
    
    const endpointNames: { [key: string]: string } = {
      'user-profile': 'du profil',
      'update-profile': 'du profil',
      'upload-user-profile': 'de la photo de profil',
      'change-password': 'du mot de passe',
      'notifications': 'des paramètres de notifications',
      'security': 'des paramètres de sécurité'
    };

    const endpointName = endpointNames[endpoint] || 'des données';
    
    return `${action} ${endpointName}`;
  }
}