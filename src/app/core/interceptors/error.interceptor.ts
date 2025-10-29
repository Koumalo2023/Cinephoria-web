import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthManagerService } from '../services/auth/auth-manager.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private authService: AuthManagerService,
    private router: Router
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'Une erreur est survenue';

        if (error.error instanceof ErrorEvent) {
          // Erreur côté client
          errorMessage = `Erreur: ${error.error.message}`;
          console.error('Erreur côté client:', error.error.message);
        } else {
          // Erreur côté serveur
          errorMessage = this.getServerErrorMessage(error);
          console.error(`Erreur côté serveur [${error.status}]: ${error.message}`);

          // Gérer les erreurs spécifiques
          this.handleServerError(error);
        }

        // Afficher l'erreur à l'utilisateur (à remplacer par un service de notification)
        console.error('Erreur interceptée:', errorMessage);

        // Propager l'erreur
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Obtenir le message d'erreur approprié selon le code d'erreur HTTP
   */
  private getServerErrorMessage(error: HttpErrorResponse): string {
    switch (error.status) {
      case 0:
        return 'Erreur de connexion au serveur. Vérifiez votre connexion internet.';
      
      case 400:
        return error.error?.message || 'Requête invalide. Veuillez vérifier les données saisies.';
      
      case 401:
        return 'Non autorisé. Veuillez vous connecter.';
      
      case 403:
        return 'Accès refusé. Vous n\'avez pas les permissions nécessaires.';
      
      case 404:
        return 'Ressource non trouvée.';
      
      case 409:
        return 'Conflit de données. Cette ressource existe déjà.';
      
      case 422:
        return error.error?.message || 'Données de validation incorrectes.';
      
      case 429:
        return 'Trop de requêtes. Veuillez patienter quelques instants.';
      
      case 500:
        return 'Erreur interne du serveur. Veuillez réessayer plus tard.';
      
      case 503:
        return 'Service temporairement indisponible. Veuillez réessayer plus tard.';
      
      default:
        return error.error?.message || `Erreur inattendue (${error.status})`;
    }
  }

  /**
   * Gérer les erreurs spécifiques du serveur
   */
  private handleServerError(error: HttpErrorResponse): void {
    switch (error.status) {
      case 401:
        // Token expiré ou invalide - déconnecter l'utilisateur
        this.authService.logout();
        this.router.navigate(['/auth/login'], {
          queryParams: { returnUrl: this.router.url }
        });
        break;
      
      case 403:
        // Accès refusé - rediriger vers la page d'accueil
        this.router.navigate(['/']);
        break;
      
      case 404:
        // Ressource non trouvée - rediriger vers la page 404
        this.router.navigate(['/not-found']);
        break;
      
      case 500:
        // Erreur serveur - rediriger vers la page d'erreur
        this.router.navigate(['/server-error']);
        break;
      
      default:
        // Pour les autres erreurs, on ne fait rien de spécifique
        break;
    }
  }
}