import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';
  
  private tokenSubject = new BehaviorSubject<string | null>(this.getToken());
  private userSubject = new BehaviorSubject<any | null>(this.getUser());

  /**
   * Récupérer le token JWT depuis le localStorage
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Définir le token JWT dans le localStorage
   */
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.tokenSubject.next(token);
  }

  /**
   * Récupérer les données utilisateur depuis le localStorage
   */
  getUser(): any | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Définir les données utilisateur dans le localStorage
   */
  setUser(user: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    this.userSubject.next(user);
  }

  /**
   * Vérifier si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token && !this.isTokenExpired(token);
  }

  /**
   * Vérifier si le token est expiré
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationDate = new Date(payload.exp * 1000);
      return expirationDate <= new Date();
    } catch (error) {
      return true;
    }
  }

  /**
   * Déconnecter l'utilisateur
   */
  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.tokenSubject.next(null);
    this.userSubject.next(null);
  }

  /**
   * Observable pour surveiller les changements de token
   */
  getTokenObservable(): Observable<string | null> {
    return this.tokenSubject.asObservable();
  }

  /**
   * Observable pour surveiller les changements d'utilisateur
   */
  getUserObservable(): Observable<any | null> {
    return this.userSubject.asObservable();
  }

  /**
   * Récupérer le rôle de l'utilisateur connecté
   */
  getUserRole(): number | null {
    const user = this.getUser();
    return user?.role ?? null;
  }

  /**
   * Vérifier si l'utilisateur a un rôle spécifique
   */
  hasRole(role: number): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  /**
   * Vérifier si l'utilisateur est admin
   */
  isAdmin(): boolean {
    return this.hasRole(2); // Admin role = 2
  }

  /**
   * Vérifier si l'utilisateur est employé
   */
  isEmployee(): boolean {
    return this.hasRole(1); // Employee role = 1
  }

  /**
   * Vérifier si l'utilisateur est un utilisateur standard
   */
  isUser(): boolean {
    return this.hasRole(0); // User role = 0
  }
}