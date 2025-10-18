import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  IncidentDto,
  CreateIncidentDto,
  UpdateIncidentDto,
  IncidentStatusUpdateDto
} from '../../interfaces/core.interfaces';

@Injectable({
  providedIn: 'root'
})
export class IncidentService {
  private readonly baseUrl = `${environment.apiUrl}/incidents`;

  constructor(private http: HttpClient) {}

  /**
   * Récupérer tous les incidents de l'utilisateur
   */
  getUserIncidents(): Observable<IncidentDto[]> {
    return this.http.get<IncidentDto[]>(this.baseUrl);
  }

  /**
   * Récupérer un incident par son ID
   */
  getIncidentById(incidentId: number): Observable<IncidentDto> {
    return this.http.get<IncidentDto>(`${this.baseUrl}/${incidentId}`);
  }

  /**
   * Créer un nouvel incident
   */
  createIncident(incidentData: CreateIncidentDto): Observable<IncidentDto> {
    return this.http.post<IncidentDto>(this.baseUrl, incidentData);
  }

  /**
   * Mettre à jour un incident
   */
  updateIncident(incidentId: number, incidentData: UpdateIncidentDto): Observable<IncidentDto> {
    return this.http.put<IncidentDto>(`${this.baseUrl}/${incidentId}`, incidentData);
  }

  /**
   * Supprimer un incident
   */
  deleteIncident(incidentId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${incidentId}`);
  }

  /**
   * Récupérer les incidents par statut
   */
  getIncidentsByStatus(status: number): Observable<IncidentDto[]> {
    const params = new HttpParams().set('status', status.toString());
    return this.http.get<IncidentDto[]>(`${this.baseUrl}/status`, { params });
  }

  /**
   * Récupérer les incidents par priorité
   */
  getIncidentsByPriority(priority: number): Observable<IncidentDto[]> {
    const params = new HttpParams().set('priority', priority.toString());
    return this.http.get<IncidentDto[]>(`${this.baseUrl}/priority`, { params });
  }

  // =============================================
  // Méthodes Admin/Employee
  // =============================================

  /**
   * Récupérer tous les incidents (Admin/Employee)
   */
  getAllIncidents(): Observable<IncidentDto[]> {
    return this.http.get<IncidentDto[]>(`${this.baseUrl}/all`);
  }

  /**
   * Récupérer les incidents assignés à un employé (Employee/Admin)
   */
  getAssignedIncidents(): Observable<IncidentDto[]> {
    return this.http.get<IncidentDto[]>(`${this.baseUrl}/assigned`);
  }

  /**
   * Assigner un incident à un employé (Admin)
   */
  assignIncident(incidentId: number, employeeId: string): Observable<IncidentDto> {
    return this.http.put<IncidentDto>(`${this.baseUrl}/${incidentId}/assign`, { employeeId });
  }

  /**
   * Mettre à jour le statut d'un incident (Employee/Admin)
   */
  updateIncidentStatus(statusData: IncidentStatusUpdateDto): Observable<IncidentDto> {
    return this.http.put<IncidentDto>(`${this.baseUrl}/status`, statusData);
  }

  /**
   * Résoudre un incident (Employee/Admin)
   */
  resolveIncident(incidentId: number): Observable<IncidentDto> {
    return this.http.put<IncidentDto>(`${this.baseUrl}/${incidentId}/resolve`, {});
  }

  /**
   * Récupérer les statistiques d'incidents (Admin)
   */
  getIncidentStats(): Observable<{
    totalIncidents: number;
    openIncidents: number;
    inProgressIncidents: number;
    resolvedIncidents: number;
    averageResolutionTime: number;
    incidentsByPriority: { priority: number; count: number }[];
  }> {
    return this.http.get<{
      totalIncidents: number;
      openIncidents: number;
      inProgressIncidents: number;
      resolvedIncidents: number;
      averageResolutionTime: number;
      incidentsByPriority: { priority: number; count: number }[];
    }>(`${this.baseUrl}/stats`);
  }
}