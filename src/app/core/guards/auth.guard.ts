import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthManagerService } from '../services/auth/auth-manager.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authManager: AuthManagerService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    // Vérifier si l'utilisateur est authentifié
    if (this.authManager.isAuthenticated()) {
      return true;
    }

    // Si non authentifié, rediriger vers la page de login avec l'URL de retour
    return this.router.createUrlTree(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
  }
}