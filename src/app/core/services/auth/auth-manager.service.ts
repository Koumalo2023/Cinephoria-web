import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { UserRole } from '../../enums/user-role.enum';
import {
  ApiLoginResponseDto,
  AppUserDto,
  ContactRequest,
  LoginResponseDto,
  LoginUserDto,
  RegisterUserDto,
  RequestPasswordResetDto,
  ResetPasswordDto
} from '../../interfaces/core.interfaces';
import { UserStateService } from './user-state.service';

@Injectable({
  providedIn: 'root'
})
export class AuthManagerService {

  private readonly baseUrl = `${environment.apiUrl}/Auth`;

  constructor(
    private http: HttpClient,
    private userStateService: UserStateService,
    private router: Router
  ) {}

  /**
   * Connexion utilisateur avec gestion d'état
   */
  login(credentials: LoginUserDto): Observable<LoginResponseDto> {
    return this.http.post<ApiLoginResponseDto>(`${this.baseUrl}/login`, credentials).pipe(
      map((apiResponse: ApiLoginResponseDto) => {
        // Convertir la réponse API en LoginResponseDto
        const loginResponse: LoginResponseDto = {
          token: apiResponse.token,
          expiresIn: 3600, // Valeur par défaut
          user: this.convertApiProfileToAppUser(apiResponse.profile)
        };
        return loginResponse;
      }),
      tap(response => {
        // Vérifier que la réponse a la structure attendue
        if (response && response.user) {
          this.userStateService.setUser(response);
          console.log('Utilisateur connecté avec succès:', response.user.firstName);
        } else {
          console.warn('Réponse API inattendue:', response);
          throw new Error('Structure de réponse API invalide');
        }
      }),
      catchError(error => {
        console.error('Erreur de connexion:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Convertir le profil API en AppUserDto
   */
  private convertApiProfileToAppUser(apiProfile: any): AppUserDto {
    // Convertir le rôle string en enum UserRole
    let role: UserRole;
    switch (apiProfile.role) {
      case 'Admin':
        role = UserRole.Admin;
        break;
      case 'Employee':
        role = UserRole.Employee;
        break;
      case 'User':
      default:
        role = UserRole.User;
        break;
    }

    return {
      appUserId: apiProfile.employeeId || apiProfile.appUserId,
      firstName: apiProfile.firstName,
      lastName: apiProfile.lastName,
      email: apiProfile.email,
      userName: apiProfile.email, // Utiliser l'email comme nom d'utilisateur par défaut
      emailConfirmed: true,
      phoneNumber: apiProfile.phoneNumber,
      createdAt: new Date(apiProfile.createdAt),
      updatedAt: new Date(apiProfile.updatedAt),
      hasApprovedTermsOfUse: true,
      hiredDate: apiProfile.hiredDate ? new Date(apiProfile.hiredDate) : undefined,
      position: apiProfile.position,
      profilePictureUrl: apiProfile.profilePictureUrl || '',
      reportedIncidents: apiProfile.reportedIncidents || [],
      resolvedByIncidents: apiProfile.resolvedByIncidents || [],
      role: role,
      reservations: [],
      movieRatings: [],
      favoriteMovies: [],
      userMovieHistories: [],
      employeeFavorites: apiProfile.employeeFavorites || []
    };
  }

  /**
   * Inscription utilisateur avec connexion automatique
   */
  register(userData: RegisterUserDto): Observable<LoginResponseDto> {
    return this.http.post<ApiLoginResponseDto>(`${this.baseUrl}/register`, userData).pipe(
      map((apiResponse: ApiLoginResponseDto) => {
        // Convertir la réponse API en LoginResponseDto
        const loginResponse: LoginResponseDto = {
          token: apiResponse.token,
          expiresIn: 3600, // Valeur par défaut
          user: this.convertApiProfileToAppUser(apiResponse.profile)
        };
        return loginResponse;
      }),
      tap(response => {
        // Vérifier que la réponse a la structure attendue
        if (response && response.user) {
          this.userStateService.setUser(response);
          console.log('Utilisateur inscrit et connecté avec succès:', response.user.firstName);
        } else {
          console.warn('Réponse API inattendue:', response);
          throw new Error('Structure de réponse API invalide');
        }
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
    return this.http.post<void>(`${this.baseUrl}/logout`, {}).pipe(
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
   * Demander une réinitialisation de mot de passe
   */
  requestPasswordReset(emailData: RequestPasswordResetDto): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/request-password-reset`, emailData).pipe(
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
    return this.http.post<void>(`${this.baseUrl}/reset-password`, resetData).pipe(
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
    return this.http.post<LoginResponseDto>(`${this.baseUrl}/refresh`, {}).pipe(
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
    return this.http.post<void>(`${this.baseUrl}/send-contact`, contactData).pipe(
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

  /**
   * Rediriger l'utilisateur en fonction de son rôle après connexion
   */
  redirectBasedOnRole(): void {
    const user = this.userStateService.currentUser;
    
    if (!user) {
      console.warn('Aucun utilisateur connecté pour la redirection');
      this.router.navigate(['/']);
      return;
    }

    console.log(`Redirection basée sur le rôle: ${user.role} (${UserRole[user.role]})`);

    switch (user.role) {
      case UserRole.User:
        // Utilisateur standard -> page d'accueil
        this.router.navigate(['/']);
        break;
      case UserRole.Employee:
      case UserRole.Admin:
        // Employé ou Admin -> tableau de bord management
        this.router.navigate(['/management/dashboard']);
        break;
      default:
        console.warn(`Rôle inconnu: ${user.role}, redirection vers l'accueil`);
        this.router.navigate(['/']);
        break;
    }
  }
  /**
   * Récupérer l'ID de l'utilisateur connecté
   * Optimisé pour utiliser les données du profil chargé
   */
  getCurrentUserId(): string | null {
    const currentUser = this.getCurrentUser();
    
    // Priorité 1: ID de l'utilisateur actuel
    let userId = currentUser?.appUserId ?? currentUser?.employeeId ?? null;
    
    // Priorité 2: Recherche dans le localStorage
    if (!userId) {
      const rawUserData = localStorage.getItem('user_data');
      if (rawUserData) {
        try {
          const parsedUser = JSON.parse(rawUserData);
          userId = parsedUser.appUserId ?? parsedUser.employeeId ?? parsedUser.id ?? null;
          if (userId) {
            console.log('🔍 ID utilisateur trouvé dans localStorage:', userId);
          }
        } catch (error) {
          console.error('❌ Erreur lors du parsing des données utilisateur:', error);
        }
      }
    }
    
    // Priorité 3: Utiliser l'email comme fallback (uniquement en développement)
    if (!userId && currentUser?.email && environment.production === false) {
      userId = currentUser.email;
      console.warn('⚠️ Utilisation de l\'email comme ID temporaire (développement):', userId);
    }
    
    if (!userId) {
      console.warn('⚠️ Aucun ID utilisateur trouvé');
    }
    
    return userId;
  }

  /**
   * Récupérer le rôle de l'utilisateur connecté
   */
  getUserRole(): UserRole | null {
    const currentUser = this.getCurrentUser();
    return currentUser?.role ?? null;
  }

  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   */
  hasRole(role: UserRole): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  /**
   * Vérifier si l'utilisateur est admin
   */
  isAdmin(): boolean {
    return this.hasRole(UserRole.Admin);
  }

  /**
   * Vérifier si l'utilisateur est employé
   */
  isEmployee(): boolean {
    return this.hasRole(UserRole.Employee);
  }

  /**
   * Vérifier si l'utilisateur est un utilisateur standard
   */
  isUser(): boolean {
    return this.hasRole(UserRole.User);
  }

  /**
   * Observable pour surveiller les changements de token
   */
  getTokenObservable(): Observable<string | null> {
    return this.userStateService.currentUser$.pipe(
      map(user => this.userStateService.getToken())
    );
  }

  /**
   * Observable pour surveiller les changements d'utilisateur
   */
  getUserObservable(): Observable<any | null> {
    return this.userStateService.currentUser$;
  }
}