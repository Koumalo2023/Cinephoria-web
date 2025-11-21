import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthManagerService } from '../services/auth/auth-manager.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authManager: AuthManagerService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    
    // Vérifier d'abord si l'utilisateur est authentifié
    if (!this.authManager.isAuthenticated()) {
      return this.router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    // Récupérer les rôles requis depuis la configuration de la route
    const requiredRoles = route.data['roles'] as number[];
    
    // Si aucun rôle n'est requis, autoriser l'accès
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Vérifier si l'utilisateur a au moins un des rôles requis
    const userRole = this.authManager.getUserRole();
    const hasRequiredRole = requiredRoles.some(role => userRole === role);

    if (hasRequiredRole) {
      return true;
    }

    // Si l'utilisateur n'a pas les permissions nécessaires, rediriger vers la page d'accueil
    return this.router.createUrlTree(['/']);
  }
}