import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { 
  LoginUserDto, 
  LoginResponseDto, 
  RegisterUserDto,
  UserProfileDto,
  UpdateAppUserDto,
  ChangeUserPasswordDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
  ContactRequest
} from '../../interfaces/core.interfaces';
import { AuthService as ApiAuthService } from '../api/auth.service';
import { UserStateService } from './user-state.service';

@Injectable({
  providedIn: 'root'
})
export class AuthManagerService {

  constructor(
    private apiAuthService: ApiAuthService,
    private userStateService: UserStateService,
    private router: Router
  ) {}

  /**
   * Connexion utilisateur avec gestion d'état
   */
  login(credentials: LoginUserDto): Observable<LoginResponseDto> {
    return this.apiAuthService.login(credentials).pipe(
      tap(response => {
        this.userStateService.setUser(response);
        console.log('Utilisateur connecté avec succès:', response.user.firstName);
      }),
      catchError(error => {
        console.error('Erreur de connexion:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Inscription utilisateur avec connexion automatique
   */
  register(userData: RegisterUserDto): Observable<LoginResponseDto> {
    return this.apiAuthService.register(userData).pipe(
      tap(response => {
        this.userStateService.setUser(response);
        console.log('Utilisateur inscrit et connecté avec succès:', response.user.firstName);
      }),
      catchError(error => {
        console.error('Erreur d\'inscription:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Déconnexion utilisateur avec redirection
   */
  logout(): Observable<void> {
    return this.apiAuthService.logout().pipe(
      tap(() => {
        this.userStateService.logout();
        console.log('Utilisateur déconnecté avec succès');
        this.router.navigate(['/']);
      }),
      catchError(error => {
        // Même en cas d'erreur, on déconnecte localement
        this.userStateService.logout();
        console.error('Erreur lors de la déconnexion:', error);
        this.router.navigate(['/']);
        return throwError(() => error);
      })
    );
  }

  /**
   * Rafraîchir le profil utilisateur
   */
  refreshProfile(): Observable<UserProfileDto> {
    return this.apiAuthService.getProfile().pipe(
      tap(profile => {
        // Mettre à jour l'utilisateur avec les données du profil
        const currentUser = this.userStateService.currentUser;
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            firstName: profile.firstName,
            lastName: profile.lastName,
            email: profile.email,
            phoneNumber: profile.phoneNumber,
            profilePictureUrl: profile.profilePictureUrl
          };
          this.userStateService.refreshUser(updatedUser);
        }
      }),
      catchError(error => {
        console.error('Erreur lors du rafraîchissement du profil:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Mettre à jour le profil utilisateur
   */
  updateProfile(profileData: UpdateAppUserDto): Observable<UserProfileDto> {
    return this.apiAuthService.updateProfile(profileData).pipe(
      tap(profile => {
        // Mettre à jour l'utilisateur avec les nouvelles données
        const currentUser = this.userStateService.currentUser;
        if (currentUser) {
          const updatedUser = {
            ...currentUser,
            firstName: profile.firstName,
            lastName: profile.lastName,
            email: profile.email,
            phoneNumber: profile.phoneNumber,
            profilePictureUrl: profile.profilePictureUrl
          };
          this.userStateService.refreshUser(updatedUser);
        }
      }),
      catchError(error => {
        console.error('Erreur lors de la mise à jour du profil:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Changer le mot de passe
   */
  changePassword(passwordData: ChangeUserPasswordDto): Observable<void> {
    return this.apiAuthService.changePassword(passwordData).pipe(
      tap(() => {
        console.log('Mot de passe changé avec succès');
      }),
      catchError(error => {
        console.error('Erreur lors du changement de mot de passe:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Demander une réinitialisation de mot de passe
   */
  requestPasswordReset(emailData: RequestPasswordResetDto): Observable<void> {
    return this.apiAuthService.requestPasswordReset(emailData).pipe(
      tap(() => {
        console.log('Demande de réinitialisation envoyée');
      }),
      catchError(error => {
        console.error('Erreur lors de la demande de réinitialisation:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Réinitialiser le mot de passe
   */
  resetPassword(resetData: ResetPasswordDto): Observable<void> {
    return this.apiAuthService.resetPassword(resetData).pipe(
      tap(() => {
        console.log('Mot de passe réinitialisé avec succès');
      }),
      catchError(error => {
        console.error('Erreur lors de la réinitialisation:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Rafraîchir le token JWT
   */
  refreshToken(): Observable<LoginResponseDto> {
    return this.apiAuthService.refreshToken().pipe(
      tap(response => {
        this.userStateService.setUser(response);
        console.log('Token rafraîchi avec succès');
      }),
      catchError(error => {
        console.error('Erreur lors du rafraîchissement du token:', error);
        // En cas d'erreur, déconnecter l'utilisateur
        this.userStateService.logout();
        this.router.navigate(['/auth/login']);
        return throwError(() => error);
      })
    );
  }

  /**
   * Envoyer un message de contact
   */
  sendContactMessage(contactData: ContactRequest): Observable<void> {
    return this.apiAuthService.sendContactMessage(contactData).pipe(
      tap(() => {
        console.log('Message de contact envoyé avec succès');
      }),
      catchError(error => {
        console.error('Erreur lors de l\'envoi du message:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    return this.userStateService.isAuthenticated;
  }

  /**
   * Obtenir l'utilisateur actuel
   */
  getCurrentUser(): any | null {
    return this.userStateService.currentUser;
  }

  /**
   * Obtenir le token JWT
   */
  getToken(): string | null {
    return this.userStateService.getToken();
  }
}