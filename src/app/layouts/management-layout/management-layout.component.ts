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
  selector: 'app-management-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './management-layout.component.html',
  styleUrls: ['./management-layout.component.scss']
})
export class ManagementLayoutComponent implements OnInit {
  // Utilisateur simulé pour le layout management (employé)
  currentUser: AppUserDto | null = {
    appUserId: 'emp-12345',
    firstName: 'Jean',
    lastName: 'Dupont',
    email: 'jean.dupont@cinephoria.com',
    userName: 'jdupont',
    emailConfirmed: true,
    phoneNumber: '+33123456789',
    createdAt: new Date('2023-01-15'),
    updatedAt: new Date('2024-10-18'),
    hasApprovedTermsOfUse: true,
    hiredDate: new Date('2023-01-15'),
    position: 'Gestionnaire de salle',
    profilePictureUrl: '',
    reportedIncidents: [],
    resolvedByIncidents: [],
    role: UserRole.Employee,
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

  ngOnInit(): void {
    // Initialisation du layout management
    console.log('Management Layout initialisé');
  }

  // Gestion de la déconnexion
  onLogout(): void {
    console.log('Déconnexion du gestionnaire');
    this.currentUser = null;
    // Redirection vers la page de connexion
  }

  // Gestion des événements utilisateur
  onUserAction(action: string): void {
    console.log(`Action utilisateur: ${action}`);
    // Gérer les actions spécifiques au layout management
  }
}
