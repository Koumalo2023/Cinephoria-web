import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { AppUserDto, LoginResponseDto } from '../../interfaces/core.interfaces';
import { UserRole } from '../../enums/user-role.enum';

@Injectable({
  providedIn: 'root'
})
export class UserStateService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';
  
  private currentUserSubject = new BehaviorSubject<AppUserDto | null>(this.getStoredUser());
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.isTokenValid());

  /**
   * Observable de l'utilisateur connecté
   */
  get currentUser$(): Observable<AppUserDto | null> {
    return this.currentUserSubject.asObservable();
  }

  /**
   * Observable du statut d'authentification
   */
  get isAuthenticated$(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  /**
   * Récupérer l'utilisateur actuel (synchronisé)
   */
  get currentUser(): AppUserDto | null {
    return this.currentUserSubject.value;
  }

  /**
   * Vérifier si l'utilisateur est authentifié (synchronisé)
   */
  get isAuthenticated(): boolean {
    return this.isAuthenticatedSubject.value;
  }

  /**
   * Initialiser l'utilisateur après connexion
   */
  setUser(loginResponse: LoginResponseDto): void {
    this.setToken(loginResponse.token);
    this.setUserData(loginResponse.user);
    this.currentUserSubject.next(loginResponse.user);
    this.isAuthenticatedSubject.next(true);
  }

  /**
   * Déconnecter l'utilisateur
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Rafraîchir les données utilisateur
   */
  refreshUser(user: AppUserDto): void {
    this.setUserData(user);
    this.currentUserSubject.next(user);
  }

  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   */
  hasRole(role: UserRole): boolean {
    const user = this.currentUser;
    return user?.role === role;
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
  isRegularUser(): boolean {
    return this.hasRole(UserRole.User);
  }

  /**
   * Obtenir le token JWT
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Vérifier si le token est valide
   */
  private isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationDate = new Date(payload.exp * 1000);
      return expirationDate > new Date();
    } catch (error) {
      return false;
    }
  }

  /**
   * Stocker le token JWT
   */
  private setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  /**
   * Stocker les données utilisateur
   */
  private setUserData(user: AppUserDto): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Récupérer les données utilisateur stockées
   */
  private getStoredUser(): AppUserDto | null {
    const userData = localStorage.getItem(this.USER_KEY);
    if (!userData) return null;

    try {
      const user = JSON.parse(userData);
      // Convertir les dates string en objets Date
      if (user.createdAt) user.createdAt = new Date(user.createdAt);
      if (user.updatedAt) user.updatedAt = new Date(user.updatedAt);
      if (user.hiredDate) user.hiredDate = new Date(user.hiredDate);
      return user;
    } catch (error) {
      console.error('Erreur lors du parsing des données utilisateur:', error);
      return null;
    }
  }

  /**
   * Observable pour vérifier un rôle spécifique
   */
  hasRole$(role: UserRole): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => user?.role === role)
    );
  }

  /**
   * Observable pour vérifier si l'utilisateur est admin
   */
  isAdmin$(): Observable<boolean> {
    return this.hasRole$(UserRole.Admin);
  }

  /**
   * Observable pour vérifier si l'utilisateur est employé
   */
  isEmployee$(): Observable<boolean> {
    return this.hasRole$(UserRole.Employee);
  }

  /**
   * Observable pour vérifier si l'utilisateur est un utilisateur standard
   */
  isRegularUser$(): Observable<boolean> {
    return this.hasRole$(UserRole.User);
  }
}