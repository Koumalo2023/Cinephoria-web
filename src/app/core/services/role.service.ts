import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserRole } from '../enums/user-role.enum';

export interface RolePermission {
  id: string;
  name: string;
  description: string;
  category: string;
  requiredRole: UserRole;
}

export interface UserRoleData {
  role: UserRole;
  permissions: string[];
  displayName: string;
  description: string;
  level: number;
}

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private currentRoleSubject = new BehaviorSubject<UserRole | null>(null);
  public currentRole$ = this.currentRoleSubject.asObservable();

  private readonly roleHierarchy: Map<UserRole, number> = new Map([
    [UserRole.Admin, 100],
    [UserRole.Employee, 80],
    [UserRole.User, 60]
  ]);

  private readonly roleDefinitions: Map<UserRole, UserRoleData> = new Map([
    [UserRole.Admin, {
      role: UserRole.Admin,
      permissions: ['*'],
      displayName: 'Administrateur',
      description: 'Accès complet à toutes les fonctionnalités du système',
      level: 100
    }],
    [UserRole.Employee, {
      role: UserRole.Employee,
      permissions: [
        'movies:read', 'movies:create', 'movies:update',
        'theaters:read', 'theaters:update',
        'showtimes:read', 'showtimes:create', 'showtimes:update',
        'reservations:read', 'reservations:create', 'reservations:update',
        'incidents:read', 'incidents:create', 'incidents:update',
        'reports:read', 'reports:generate'
      ],
      displayName: 'Employé',
      description: 'Gestion des opérations quotidiennes',
      level: 80
    }],
    [UserRole.User, {
      role: UserRole.User,
      permissions: [
        'movies:read',
        'theaters:read',
        'showtimes:read',
        'reservations:read', 'reservations:create', 'reservations:cancel',
        'reviews:read', 'reviews:create', 'reviews:update', 'reviews:delete',
        'profile:read', 'profile:update'
      ],
      displayName: 'Utilisateur',
      description: 'Accès aux fonctionnalités publiques et personnelles',
      level: 60
    }]
  ]);

  private readonly permissionDefinitions: RolePermission[] = [
    // Gestion des utilisateurs
    { id: 'users:read', name: 'Voir les utilisateurs', description: 'Consulter la liste des utilisateurs', category: 'users', requiredRole: UserRole.Admin },
    { id: 'users:create', name: 'Créer utilisateur', description: 'Ajouter un nouvel utilisateur', category: 'users', requiredRole: UserRole.Admin },
    { id: 'users:update', name: 'Modifier utilisateur', description: 'Modifier les informations utilisateur', category: 'users', requiredRole: UserRole.Admin },
    { id: 'users:delete', name: 'Supprimer utilisateur', description: 'Supprimer un utilisateur', category: 'users', requiredRole: UserRole.Admin },

    // Gestion des films
    { id: 'movies:read', name: 'Voir les films', description: 'Consulter la liste des films', category: 'movies', requiredRole: UserRole.User },
    { id: 'movies:create', name: 'Créer film', description: 'Ajouter un nouveau film', category: 'movies', requiredRole: UserRole.Employee },
    { id: 'movies:update', name: 'Modifier film', description: 'Modifier les informations d\'un film', category: 'movies', requiredRole: UserRole.Employee },
    { id: 'movies:delete', name: 'Supprimer film', description: 'Supprimer un film', category: 'movies', requiredRole: UserRole.Admin },

    // Gestion des cinémas
    { id: 'theaters:read', name: 'Voir les cinémas', description: 'Consulter la liste des cinémas', category: 'theaters', requiredRole: UserRole.User },
    { id: 'theaters:create', name: 'Créer cinéma', description: 'Ajouter un nouveau cinéma', category: 'theaters', requiredRole: UserRole.Admin },
    { id: 'theaters:update', name: 'Modifier cinéma', description: 'Modifier les informations d\'un cinéma', category: 'theaters', requiredRole: UserRole.Employee },
    { id: 'theaters:delete', name: 'Supprimer cinéma', description: 'Supprimer un cinéma', category: 'theaters', requiredRole: UserRole.Admin },

    // Gestion des séances
    { id: 'showtimes:read', name: 'Voir les séances', description: 'Consulter la liste des séances', category: 'showtimes', requiredRole: UserRole.User },
    { id: 'showtimes:create', name: 'Créer séance', description: 'Ajouter une nouvelle séance', category: 'showtimes', requiredRole: UserRole.Employee },
    { id: 'showtimes:update', name: 'Modifier séance', description: 'Modifier les informations d\'une séance', category: 'showtimes', requiredRole: UserRole.Employee },
    { id: 'showtimes:delete', name: 'Supprimer séance', description: 'Supprimer une séance', category: 'showtimes', requiredRole: UserRole.Admin },

    // Gestion des réservations
    { id: 'reservations:read', name: 'Voir les réservations', description: 'Consulter la liste des réservations', category: 'reservations', requiredRole: UserRole.Employee },
    { id: 'reservations:create', name: 'Créer réservation', description: 'Créer une nouvelle réservation', category: 'reservations', requiredRole: UserRole.User },
    { id: 'reservations:update', name: 'Modifier réservation', description: 'Modifier une réservation', category: 'reservations', requiredRole: UserRole.Employee },
    { id: 'reservations:delete', name: 'Supprimer réservation', description: 'Supprimer une réservation', category: 'reservations', requiredRole: UserRole.Admin },
    { id: 'reservations:cancel', name: 'Annuler réservation', description: 'Annuler sa propre réservation', category: 'reservations', requiredRole: UserRole.User },

    // Gestion des avis
    { id: 'reviews:read', name: 'Voir les avis', description: 'Consulter la liste des avis', category: 'reviews', requiredRole: UserRole.User },
    { id: 'reviews:create', name: 'Créer avis', description: 'Ajouter un nouvel avis', category: 'reviews', requiredRole: UserRole.User },
    { id: 'reviews:update', name: 'Modifier avis', description: 'Modifier son propre avis', category: 'reviews', requiredRole: UserRole.User },
    { id: 'reviews:delete', name: 'Supprimer avis', description: 'Supprimer son propre avis', category: 'reviews', requiredRole: UserRole.User },

    // Gestion des incidents
    { id: 'incidents:read', name: 'Voir les incidents', description: 'Consulter la liste des incidents', category: 'incidents', requiredRole: UserRole.Employee },
    { id: 'incidents:create', name: 'Créer incident', description: 'Signaler un nouvel incident', category: 'incidents', requiredRole: UserRole.Employee },
    { id: 'incidents:update', name: 'Modifier incident', description: 'Mettre à jour un incident', category: 'incidents', requiredRole: UserRole.Employee },

    // Rapports et statistiques
    { id: 'reports:read', name: 'Voir les rapports', description: 'Consulter les rapports et statistiques', category: 'reports', requiredRole: UserRole.Employee },
    { id: 'reports:generate', name: 'Générer rapports', description: 'Générer de nouveaux rapports', category: 'reports', requiredRole: UserRole.Employee },

    // Paramètres
    { id: 'settings:read', name: 'Voir paramètres', description: 'Consulter les paramètres système', category: 'settings', requiredRole: UserRole.Admin },
    { id: 'settings:update', name: 'Modifier paramètres', description: 'Modifier les paramètres système', category: 'settings', requiredRole: UserRole.Admin },

    // Profil utilisateur
    { id: 'profile:read', name: 'Voir profil', description: 'Consulter son propre profil', category: 'profile', requiredRole: UserRole.User },
    { id: 'profile:update', name: 'Modifier profil', description: 'Modifier son propre profil', category: 'profile', requiredRole: UserRole.User }
  ];

  /**
   * Définit le rôle actuel de l'utilisateur
   */
  setCurrentRole(role: UserRole | null): void {
    this.currentRoleSubject.next(role);
  }

  /**
   * Récupère le rôle actuel de l'utilisateur
   */
  getCurrentRole(): UserRole | null {
    return this.currentRoleSubject.value;
  }

  /**
   * Vérifie si l'utilisateur a un rôle spécifique
   */
  hasRole(role: UserRole): boolean {
    const currentRole = this.getCurrentRole();
    if (!currentRole) return false;

    const currentLevel = this.roleHierarchy.get(currentRole) || 0;
    const requiredLevel = this.roleHierarchy.get(role) || 0;

    return currentLevel >= requiredLevel;
  }

  /**
   * Vérifie si l'utilisateur a au moins un des rôles spécifiés
   */
  hasAnyRole(roles: UserRole[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  /**
   * Vérifie si l'utilisateur a une permission spécifique
   */
  hasPermission(permissionId: string): boolean {
    const currentRole = this.getCurrentRole();
    if (!currentRole) return false;

    // Admin a toutes les permissions
    if (currentRole === UserRole.Admin) {
      return true;
    }

    const roleData = this.roleDefinitions.get(currentRole);
    if (!roleData) return false;

    // Vérifie si la permission est dans la liste ou si c'est une permission générique
    return roleData.permissions.includes(permissionId) || 
           roleData.permissions.includes('*') ||
           this.checkWildcardPermission(roleData.permissions, permissionId);
  }

  /**
   * Vérifie si l'utilisateur a au moins une des permissions spécifiées
   */
  hasAnyPermission(permissionIds: string[]): boolean {
    return permissionIds.some(permissionId => this.hasPermission(permissionId));
  }

  /**
   * Vérifie si l'utilisateur a toutes les permissions spécifiées
   */
  hasAllPermissions(permissionIds: string[]): boolean {
    return permissionIds.every(permissionId => this.hasPermission(permissionId));
  }

  /**
   * Récupère toutes les permissions disponibles pour le rôle actuel
   */
  getCurrentPermissions(): string[] {
    const currentRole = this.getCurrentRole();
    if (!currentRole) return [];

    const roleData = this.roleDefinitions.get(currentRole);
    return roleData?.permissions || [];
  }

  /**
   * Récupère les informations détaillées sur un rôle
   */
  getRoleInfo(role: UserRole): UserRoleData | undefined {
    return this.roleDefinitions.get(role);
  }

  /**
   * Récupère la hiérarchie des rôles
   */
  getRoleHierarchy(): Map<UserRole, number> {
    return new Map(this.roleHierarchy);
  }

  /**
   * Récupère tous les rôles disponibles
   */
  getAvailableRoles(): UserRole[] {
    return Array.from(this.roleDefinitions.keys());
  }

  /**
   * Récupère les définitions de toutes les permissions
   */
  getAllPermissionDefinitions(): RolePermission[] {
    return [...this.permissionDefinitions];
  }

  /**
   * Récupère les permissions par catégorie
   */
  getPermissionsByCategory(category: string): RolePermission[] {
    return this.permissionDefinitions.filter(permission => permission.category === category);
  }

  /**
   * Récupère toutes les catégories de permissions
   */
  getPermissionCategories(): string[] {
    const categories = new Set(this.permissionDefinitions.map(p => p.category));
    return Array.from(categories);
  }

  /**
   * Vérifie si un rôle peut gérer un autre rôle
   */
  canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
    const managerLevel = this.roleHierarchy.get(managerRole) || 0;
    const targetLevel = this.roleHierarchy.get(targetRole) || 0;

    // Un rôle ne peut gérer que les rôles de niveau inférieur
    return managerLevel > targetLevel;
  }

  /**
   * Récupère les rôles qu'un rôle peut gérer
   */
  getManageableRoles(role: UserRole): UserRole[] {
    const roleLevel = this.roleHierarchy.get(role) || 0;
    
    return Array.from(this.roleHierarchy.entries())
      .filter(([_, level]) => level < roleLevel)
      .map(([userRole]) => userRole);
  }

  /**
   * Vérifie si l'utilisateur peut accéder à une route
   */
  canAccessRoute(requiredRole: UserRole | UserRole[]): boolean {
    if (Array.isArray(requiredRole)) {
      return this.hasAnyRole(requiredRole);
    }
    return this.hasRole(requiredRole);
  }

  /**
   * Vérifie les permissions pour une action CRUD
   */
  canPerformAction(resource: string, action: 'create' | 'read' | 'update' | 'delete'): boolean {
    const permissionId = `${resource}:${action}`;
    return this.hasPermission(permissionId);
  }

  /**
   * Récupère le nom d'affichage d'un rôle
   */
  getRoleDisplayName(role: UserRole): string {
    const roleInfo = this.getRoleInfo(role);
    return roleInfo?.displayName || role.toString();
  }

  /**
   * Récupère la description d'un rôle
   */
  getRoleDescription(role: UserRole): string {
    const roleInfo = this.getRoleInfo(role);
    return roleInfo?.description || '';
  }

  /**
   * Vérifie les permissions avec des wildcards
   */
  private checkWildcardPermission(permissions: string[], permissionId: string): boolean {
    const [resource, action] = permissionId.split(':');
    
    // Vérifie les permissions génériques comme "movies:*"
    return permissions.includes(`${resource}:*`);
  }

  /**
   * Émet un événement lorsque les permissions changent
   */
  onPermissionsChange(): Observable<UserRole | null> {
    return this.currentRole$;
  }

  /**
   * Réinitialise le service (pour la déconnexion)
   */
  reset(): void {
    this.currentRoleSubject.next(null);
  }
}