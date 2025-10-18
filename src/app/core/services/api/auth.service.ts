import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
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

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {}

  /**
   * Connexion utilisateur
   */
  login(credentials: LoginUserDto): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(`${this.baseUrl}/login`, credentials);
  }

  /**
   * Inscription utilisateur
   */
  register(userData: RegisterUserDto): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(`${this.baseUrl}/register`, userData);
  }

  /**
   * Récupération du profil utilisateur
   */
  getProfile(): Observable<UserProfileDto> {
    return this.http.get<UserProfileDto>(`${this.baseUrl}/profile`);
  }

  /**
   * Mise à jour du profil utilisateur
   */
  updateProfile(profileData: UpdateAppUserDto): Observable<UserProfileDto> {
    return this.http.put<UserProfileDto>(`${this.baseUrl}/profile`, profileData);
  }

  /**
   * Changement de mot de passe utilisateur
   */
  changePassword(passwordData: ChangeUserPasswordDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/change-password`, passwordData);
  }

  /**
   * Demande de réinitialisation de mot de passe
   */
  requestPasswordReset(emailData: RequestPasswordResetDto): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/request-password-reset`, emailData);
  }

  /**
   * Réinitialisation de mot de passe
   */
  resetPassword(resetData: ResetPasswordDto): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/reset-password`, resetData);
  }

  /**
   * Déconnexion utilisateur
   */
  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/logout`, {});
  }

  /**
   * Rafraîchissement du token
   */
  refreshToken(): Observable<LoginResponseDto> {
    return this.http.post<LoginResponseDto>(`${this.baseUrl}/refresh`, {});
  }

  /**
   * Envoi d'un message de contact
   */
  sendContactMessage(contactData: ContactRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/contact`, contactData);
  }
}