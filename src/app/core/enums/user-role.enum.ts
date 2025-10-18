/**
 * Enumération des rôles utilisateur dans l'application Cinephoria
 * Compatible avec l'API backend (valeurs numériques)
 */
export enum UserRole {
  User = 0,
  Employee = 1,
  Admin = 2
}

/**
 * Interface pour les permissions par rôle
 */
export interface RolePermissions {
  canViewMovies: boolean;
  canMakeReservations: boolean;
  canManageScreenings: boolean;
  canManageMovies: boolean;
  canManageUsers: boolean;
  canManageEmployees: boolean;
  canViewStatistics: boolean;
}

/**
 * Mappage des permissions par rôle
 */
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  [UserRole.User]: {
    canViewMovies: true,
    canMakeReservations: true,
    canManageScreenings: false,
    canManageMovies: false,
    canManageUsers: false,
    canManageEmployees: false,
    canViewStatistics: false
  },
  [UserRole.Employee]: {
    canViewMovies: true,
    canMakeReservations: true,
    canManageScreenings: true,
    canManageMovies: false,
    canManageUsers: false,
    canManageEmployees: false,
    canViewStatistics: true
  },
  [UserRole.Admin]: {
    canViewMovies: true,
    canMakeReservations: true,
    canManageScreenings: true,
    canManageMovies: true,
    canManageUsers: true,
    canManageEmployees: true,
    canViewStatistics: true
  }
};