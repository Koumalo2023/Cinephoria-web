import { Routes } from '@angular/router';
import { AuthGuard, RoleGuard } from './index';
import { UserRole } from '../enums/user-role.enum';

/**
 * Exemples de configuration de routes avec les guards
 * Ces exemples montrent comment utiliser les guards pour protéger les routes par rôles
 */

export const routeExamples: Routes = [
  // =============================================
  // Routes Publiques (pas de guard)
  // =============================================
  {
    path: '',
    loadComponent: () => import('../../features/public/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'movies',
    loadComponent: () => import('../../features/public/movies/movies.component').then(m => m.MoviesComponent)
  },
  {
    path: 'auth',
    loadChildren: () => import('../../features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // =============================================
  // Routes Utilisateur Authentifié (AuthGuard)
  // =============================================
  {
    path: 'profile',
    loadComponent: () => import('../../features/user/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'reservations',
    loadComponent: () => import('../../features/user/reservations/reservations.component').then(m => m.ReservationsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'favorites',
    loadComponent: () => import('../../features/user/favorites/favorites.component').then(m => m.FavoritesComponent),
    canActivate: [AuthGuard]
  },

  // =============================================
  // Routes Employé (RoleGuard avec rôle Employee)
  // =============================================
  {
    path: 'employee',
    loadComponent: () => import('../../features/employee/dashboard/dashboard.component').then(m => m.EmployeeDashboardComponent),
    canActivate: [RoleGuard],
    data: { roles: [UserRole.Employee, UserRole.Admin] } // Employee (1) ou Admin (2)
  },
  {
    path: 'employee/reservations',
    loadComponent: () => import('../../features/employee/reservations/reservations.component').then(m => m.EmployeeReservationsComponent),
    canActivate: [RoleGuard],
    data: { roles: [UserRole.Employee, UserRole.Admin] }
  },
  {
    path: 'employee/incidents',
    loadComponent: () => import('../../features/employee/incidents/incidents.component').then(m => m.EmployeeIncidentsComponent),
    canActivate: [RoleGuard],
    data: { roles: [UserRole.Employee, UserRole.Admin] }
  },

  // =============================================
  // Routes Admin (RoleGuard avec rôle Admin uniquement)
  // =============================================
  {
    path: 'admin',
    loadComponent: () => import('../../features/admin/dashboard/dashboard.component').then(m => m.AdminDashboardComponent),
    canActivate: [RoleGuard],
    data: { roles: [UserRole.Admin] } // Admin (2) uniquement
  },
  {
    path: 'admin/users',
    loadComponent: () => import('../../features/admin/users/users.component').then(m => m.AdminUsersComponent),
    canActivate: [RoleGuard],
    data: { roles: [UserRole.Admin] }
  },
  {
    path: 'admin/cinemas',
    loadComponent: () => import('../../features/admin/cinemas/cinemas.component').then(m => m.AdminCinemasComponent),
    canActivate: [RoleGuard],
    data: { roles: [UserRole.Admin] }
  },
  {
    path: 'admin/movies',
    loadComponent: () => import('../../features/admin/movies/movies.component').then(m => m.AdminMoviesComponent),
    canActivate: [RoleGuard],
    data: { roles: [UserRole.Admin] }
  },

  // =============================================
  // Routes avec Protection Multiple
  // =============================================
  {
    path: 'management',
    loadComponent: () => import('../../features/management/dashboard/dashboard.component').then(m => m.ManagementDashboardComponent),
    canActivate: [AuthGuard, RoleGuard], // Les deux guards doivent passer
    data: { roles: [UserRole.Employee, UserRole.Admin] }
  },

  // =============================================
  // Route de Fallback (404)
  // =============================================
  {
    path: '**',
    loadComponent: () => import('../../features/public/not-found/not-found.component').then(m => m.NotFoundComponent)
  }
];