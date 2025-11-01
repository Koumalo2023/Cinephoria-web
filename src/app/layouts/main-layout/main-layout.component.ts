import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';

// Composants partagés
import { ToastNotificationComponent } from '../../shared/components/atoms/toast-notification/toast-notification.component';
import { FooterComponent } from '../../shared/components/organisms/footer/footer.component';
import { HeaderComponent } from '../../shared/components/organisms/header/header.component';

// Services
import { UserStateService } from '../../core/services/auth/user-state.service';

// Interfaces core
import { AppUserDto } from '../../core/interfaces/core.interfaces';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    HeaderComponent,
    FooterComponent,
    ToastNotificationComponent
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  // Utilisateur connecté (peut être null pour invité)
  currentUser: AppUserDto | null = null;
  
  private userSubscription: Subscription | null = null;

  // Configuration du layout principal
  headerConfig = {
    variant: 'default' as const,
    showLogo: true,
    showNavigation: true,
    showUserMenu: true
  };

  footerConfig = {
    variant: 'default' as const,
    showCinemaInfo: true,
    showSocialLinks: true,
    showLegalLinks: true
  };


  constructor(private userStateService: UserStateService) {}

  ngOnInit(): void {
    // S'abonner aux changements de l'utilisateur
    this.userSubscription = this.userStateService.currentUser$.subscribe(
      user => {
        this.currentUser = user;
      }
    );
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  // Gestion de la déconnexion
  onLogout(): void {
    this.userStateService.logout();
  }

  // Vérifier si l'utilisateur est connecté
  get isAuthenticated(): boolean {
    return this.userStateService.isAuthenticated;
  }
}
