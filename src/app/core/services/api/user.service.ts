import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AppUserDto,
  ChangeEmployeePasswordDto,
  CreateEmployeeDto,
  EmployeeProfileDto,
  UpdateEmployeeDto
} from '../../interfaces/core.interfaces';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly baseUrl = `${environment.apiUrl}/Auth`;

  constructor(private http: HttpClient) {}

  // =============================================
  // Méthodes Admin
  // =============================================

  /**
   * Récupérer tous les utilisateurs (Admin)
   */
  getAllUsers(): Observable<AppUserDto[]> {
    return this.http.get<AppUserDto[]>(this.baseUrl);
  }

  /**
   * Récupérer un utilisateur par son ID (Admin)
   */
  getUserById(userId: string): Observable<AppUserDto> {
    return this.http.get<AppUserDto>(`${this.baseUrl}/${userId}`);
  }

  /**
   * Rechercher des utilisateurs (Admin)
   */
  searchUsers(query: string): Observable<AppUserDto[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<AppUserDto[]>(`${this.baseUrl}/search`, { params });
  }

  /**
   * Récupérer les utilisateurs par rôle (Admin)
   */
  getUsersByRole(role: number): Observable<AppUserDto[]> {
    const params = new HttpParams().set('role', role.toString());
    return this.http.get<AppUserDto[]>(`${this.baseUrl}/role`, { params });
  }

  /**
   * Mettre à jour un utilisateur (Admin)
   */
  updateUser(userId: string, userData: UpdateEmployeeDto): Observable<AppUserDto> {
    return this.http.put<AppUserDto>(`${this.baseUrl}/${userId}`, userData);
  }

  /**
   * Désactiver un utilisateur (Admin)
   */
  deactivateUser(userId: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${userId}/deactivate`, {});
  }

  /**
   * Activer un utilisateur (Admin)
   */
  activateUser(userId: string): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${userId}/activate`, {});
  }

  // =============================================
  // Gestion des Employés (Admin)
  // =============================================

  /**
   * Récupérer tous les employés (Admin)
   */
  getAllEmployees(): Observable<EmployeeProfileDto[]> {
    return this.http.get<EmployeeProfileDto[]>(`${this.baseUrl}/employees`);
  }

  /**
   * Récupérer un employé par son ID (Admin)
   */
  getEmployeeById(employeeId: string): Observable<EmployeeProfileDto> {
    return this.http.get<EmployeeProfileDto>(`${this.baseUrl}/employees/${employeeId}`);
  }

  /**
   * Créer un nouvel employé (Admin)
   */
  createEmployee(employeeData: CreateEmployeeDto): Observable<EmployeeProfileDto> {
    return this.http.post<EmployeeProfileDto>(`${this.baseUrl}/employees`, employeeData);
  }

  /**
   * Mettre à jour un employé (Admin)
   */
  updateEmployee(employeeId: string, employeeData: UpdateEmployeeDto): Observable<EmployeeProfileDto> {
    return this.http.put<EmployeeProfileDto>(`${this.baseUrl}/employees/${employeeId}`, employeeData);
  }

  /**
   * Changer le mot de passe d'un employé (Admin)
   */
  changeEmployeePassword(passwordData: ChangeEmployeePasswordDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/employees/change-password`, passwordData);
  }

  /**
   * Promouvoir un utilisateur en employé (Admin)
   */
  promoteToEmployee(userId: string, position: string): Observable<EmployeeProfileDto> {
    return this.http.put<EmployeeProfileDto>(`${this.baseUrl}/${userId}/promote`, { position });
  }

  /**
   * Rétrograder un employé en utilisateur (Admin)
   */
  demoteToUser(employeeId: string): Observable<AppUserDto> {
    return this.http.put<AppUserDto>(`${this.baseUrl}/employees/${employeeId}/demote`, {});
  }

  // =============================================
  // Statistiques Utilisateurs (Admin)
  // =============================================

  /**
   * Récupérer les statistiques des utilisateurs (Admin)
   */
  getUserStats(): Observable<{
    totalUsers: number;
    totalEmployees: number;
    totalAdmins: number;
    activeUsers: number;
    inactiveUsers: number;
    newUsersThisMonth: number;
    userGrowthRate: number;
  }> {
    return this.http.get<{
      totalUsers: number;
      totalEmployees: number;
      totalAdmins: number;
      activeUsers: number;
      inactiveUsers: number;
      newUsersThisMonth: number;
      userGrowthRate: number;
    }>(`${this.baseUrl}/stats`);
  }

  /**
   * Récupérer l'activité des utilisateurs (Admin)
   */
  getUserActivity(): Observable<{
    userId: string;
    userName: string;
    lastLogin: Date;
    totalReservations: number;
    totalRatings: number;
    totalIncidents: number;
  }[]> {
    return this.http.get<{
      userId: string;
      userName: string;
      lastLogin: Date;
      totalReservations: number;
      totalRatings: number;
      totalIncidents: number;
    }[]>(`${this.baseUrl}/activity`);
  }
}