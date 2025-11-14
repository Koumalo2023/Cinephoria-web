import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ProfileService } from '../services/api/profile.service';

@Injectable()
export class CorsFallbackInterceptor implements HttpInterceptor {
  
  constructor(private profileService: ProfileService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Vérifier si la requête concerne les endpoints de profil
    const isProfileRequest = this.isProfileEndpoint(req.url);
    
    if (!isProfileRequest) {
      return next.handle(req);
    }

    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Vérifier si c'est une erreur CORS
        if (this.isCorsError(error)) {
          console.warn(`CORS error detected for ${req.url}, falling back to mock data`);
          
          // Basculer vers les données mockées pour toutes les requêtes futures
          this.profileService.forceMockData();
          
          // Pour cette requête spécifique, on ne peut pas retourner de réponse mockée ici
          // car l'intercepteur ne peut pas transformer une requête HTTP en données mockées
          // Le fallback se fera au niveau du ProfileService
        }
        
        return throwError(() => error);
      })
    );
  }

  /**
   * Vérifie si l'URL correspond à un endpoint de profil
   */
  private isProfileEndpoint(url: string): boolean {
    const profileEndpoints = [
      '/api/Auth/user-profile',
      '/api/Auth/update-profile',
      '/api/Auth/upload-user-profile',
      '/api/Auth/change-password',
      '/api/settings/notifications',
      '/api/settings/security'
    ];
    
    return profileEndpoints.some(endpoint => url.includes(endpoint));
  }

  /**
   * Détecte les erreurs CORS
   */
  private isCorsError(error: HttpErrorResponse): boolean {
    // Les erreurs CORS ont généralement un status 0 et pas de réponse
    return error.status === 0 && 
           error.error instanceof ProgressEvent && 
           error.error.type === 'error' &&
           !navigator.onLine === false; // Vérifier que la connexion internet est active
  }

  /**
   * Vérifie si l'erreur est due à une indisponibilité du serveur
   */
  private isServerUnavailable(error: HttpErrorResponse): boolean {
    return error.status === 0 || error.status >= 500;
  }
}