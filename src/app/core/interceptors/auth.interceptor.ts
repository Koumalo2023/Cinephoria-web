import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthStateService } from '../services/auth/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthStateService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Récupérer le token JWT
    const token = this.authService.getToken();

    // Cloner la requête et ajouter l'en-tête d'autorisation si le token existe
    if (token && this.shouldAddToken(request)) {
      const authRequest = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next.handle(authRequest);
    }

    // Si pas de token ou requête qui ne nécessite pas d'authentification, passer la requête originale
    return next.handle(request);
  }

  /**
   * Déterminer si le token doit être ajouté à la requête
   * Exclut les endpoints d'authentification qui n'ont pas besoin de token
   */
  private shouldAddToken(request: HttpRequest<any>): boolean {
    // URLs qui ne nécessitent pas d'authentification
    const excludedUrls = [
      '/api/auth/login',
      '/api/auth/register',
      '/api/auth/request-password-reset',
      '/api/auth/reset-password',
      '/api/auth/contact'
    ];

    // Vérifier si l'URL de la requête est dans la liste des URLs exclues
    return !excludedUrls.some(url => request.url.includes(url));
  }
}