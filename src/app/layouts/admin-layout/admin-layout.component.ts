import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';

// Composants partagés
import { HeaderComponent } from '../../shared/components/organisms/header/header.component';
import { FooterComponent } from '../../shared/components/organisms/footer/footer.component';

// Interfaces core
import { AppUserDto } from '../../core/interfaces/core.interfaces';
import { UserRole } from '../../core/enums/user-role.enum';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss']
})
export class AdminLayoutComponent implements OnInit {
  // Utilisateur simulé pour le layout admin
  currentUser: AppUserDto | null = {
    appUserId: 'admin-12345',
    firstName: 'Marie',
    lastName: 'Martin',
    email: 'marie.martin@cinephoria.com',
    userName: 'mmartin',
    emailConfirmed: true,
    phoneNumber: '+33123456789',
    createdAt: new Date('2022-06-10'),
    updatedAt: new Date('2024-10-18'),
    hasApprovedTermsOfUse: true,
    hiredDate: new Date('2022-06-10'),
    position: 'Administrateur système',
    profilePictureUrl: '',
    reportedIncidents: [],
    resolvedByIncidents: [],
    role: UserRole.Admin,
    reservations: [],
    movieRatings: [],
    favoriteMovies: [],
    userMovieHistories: [],
    employeeFavorites: []
  };

  // Configuration du layout
  headerConfig = {
    variant: 'default' as const,
    showLogo: true,
    showNavigation: true,
    showUserMenu: true
  };

  footerConfig = {
    variant: 'compact' as const,
    showCinemaInfo: false,
    showSocialLinks: false,
    showLegalLinks: true
  };

  // Statistiques admin (simulées)
  adminStats = {
    totalUsers: 1542,
    activeEmployees: 23,
    totalCinemas: 8,
    pendingIncidents: 7,
    totalRevenue: 125430,
    systemHealth: 98
  };

  ngOnInit(): void {
    // Initialisation du layout admin
    console.log('Admin Layout initialisé');
  }

  // Gestion de la déconnexion
  onLogout(): void {
    console.log('Déconnexion de l\'administrateur');
    this.currentUser = null;
    // Redirection vers la page de connexion
  }

  // Gestion des actions admin
  onAdminAction(action: string): void {
    console.log(`Action admin: ${action}`);
    
    switch (action) {
      case 'refresh_stats':
        this.refreshAdminStats();
        break;
      case 'system_health':
        this.checkSystemHealth();
        break;
      case 'backup':
        this.performBackup();
        break;
      default:
        console.log(`Action non reconnue: ${action}`);
    }
  }

  // Rafraîchir les statistiques
  private refreshAdminStats(): void {
    console.log('Rafraîchissement des statistiques admin');
    // Simulation de mise à jour des stats
    this.adminStats = {
      ...this.adminStats,
      totalUsers: this.adminStats.totalUsers + Math.floor(Math.random() * 10),
      pendingIncidents: Math.max(0, this.adminStats.pendingIncidents - 1),
      systemHealth: 95 + Math.floor(Math.random() * 5)
    };
  }

  // Vérifier la santé du système
  private checkSystemHealth(): void {
    console.log('Vérification de la santé du système');
    // Simulation de vérification système
    const health = this.adminStats.systemHealth;
    if (health >= 95) {
      console.log('✅ Système en bonne santé');
    } else if (health >= 80) {
      console.log('⚠️  Système nécessite une attention');
    } else {
      console.log('❌ Problème système détecté');
    }
  }

  // Effectuer une sauvegarde
  private performBackup(): void {
    console.log('Démarrage de la sauvegarde système');
    // Simulation de sauvegarde
    setTimeout(() => {
      console.log('✅ Sauvegarde terminée avec succès');
    }, 2000);
  }

  // Obtenir le statut de santé du système
  getSystemHealthStatus(): string {
    const health = this.adminStats.systemHealth;
    if (health >= 95) return 'excellent';
    if (health >= 85) return 'bon';
    if (health >= 75) return 'moyen';
    return 'critique';
  }

  // Obtenir la couleur du statut de santé
  getSystemHealthColor(): string {
    const health = this.adminStats.systemHealth;
    if (health >= 95) return '#28a745';
    if (health >= 85) return '#ffc107';
    if (health >= 75) return '#fd7e14';
    return '#dc3545';
  }
}
