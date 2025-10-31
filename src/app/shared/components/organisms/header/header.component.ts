import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

// Interfaces core
import { UserRole } from '../../../../core/enums/user-role.enum';
import { AppUserDto } from '../../../../core/interfaces/core.interfaces';
import { UserStateService } from '../../../../core/services/auth/user-state.service';

export type HeaderVariant = 'default' | 'transparent' | 'sticky';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() variant: 'default' | 'transparent' | 'sticky' = 'default';
  @Input() showLogo: boolean = true;
  @Input() showNavigation: boolean = true;
  @Input() showUserMenu: boolean = true;

  currentUser: AppUserDto | null = null;
  isMobileMenuOpen: boolean = false;
  unreadNotifications: number = 0;
  
  private userSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private userStateService: UserStateService
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.userStateService.currentUser$.subscribe(
      user => {
        this.currentUser = user;
        this.updateNotificationCount();
      }
    );
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  private updateNotificationCount(): void {
    // Simuler le comptage des notifications non lues
    this.unreadNotifications = this.isAuthenticated ? Math.floor(Math.random() * 5) : 0;
  }

  // Navigation par rôle
  get navigationItems(): any[] {
    const baseItems = [
      { label: 'Accueil', routerLink: ['/'], icon: 'home' },
      { label: 'Films', routerLink: ['/movies'], icon: 'film' },
      { label: 'Réservations', routerLink: ['/user/reservations'], icon: 'ticket' },
      { label: 'Contact', routerLink: ['/contact'], icon: 'mail' }
    ];

    if (!this.isAuthenticated) {
      return [
        ...baseItems,
        { label: 'Se connecter', routerLink: ['/auth/login'], icon: 'log-in', variant: 'secondary' },
        { label: 'S\'inscrire', routerLink: ['/auth/register'], icon: 'user-plus', variant: 'primary' }
      ];
    }

    if (!this.currentUser) {
      return [
        ...baseItems,
        { label: 'Se connecter', routerLink: ['/auth/login'], icon: 'log-in', variant: 'secondary' },
        { label: 'S\'inscrire', routerLink: ['/auth/register'], icon: 'user-plus', variant: 'primary' }
      ];
    }

    switch (this.currentUser.role) {
      case UserRole.User:
        return [
          ...baseItems,
          { label: 'Mon espace', routerLink: ['/user/profile'], icon: 'user' },
          { label: 'Notifications', routerLink: ['/user/notifications'], icon: 'bell', badge: this.unreadNotifications }
        ];

      case UserRole.Employee:
        return [
          ...baseItems,
          { label: 'Management', routerLink: ['/management/dashboard'], icon: 'settings' },
          { label: 'Incidents', routerLink: ['/management/incidents'], icon: 'alert-triangle' }
        ];

      case UserRole.Admin:
        return [
          ...baseItems,
          { label: 'Administration', routerLink: ['/admin/dashboard'], icon: 'shield' },
          { label: 'Management', routerLink: ['/management/dashboard'], icon: 'settings' }
        ];

      default:
        return baseItems;
    }
  }

  // Gestion de la navigation mobile
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  // Actions utilisateur
  onLogin(): void {
    this.router.navigate(['/auth/login']);
    this.closeMobileMenu();
  }

  onRegister(): void {
    this.router.navigate(['/auth/register']);
    this.closeMobileMenu();
  }

  onLogout(): void {
    this.userStateService.logout();
    this.router.navigate(['/']);
    this.closeMobileMenu();
  }

  onProfile(): void {
    this.router.navigate(['/user/profile']);
    this.closeMobileMenu();
  }

  onNotifications(): void {
    this.router.navigate(['/user/notifications']);
    this.closeMobileMenu();
  }

  // Classes CSS dynamiques
  get headerClasses(): string {
    const classes = ['header'];
    classes.push(`header--${this.variant}`);
    if (this.isMobileMenuOpen) classes.push('header--mobile-open');
    return classes.join(' ');
  }

  get mobileMenuClasses(): string {
    return this.isMobileMenuOpen ? 'mobile-menu mobile-menu--open' : 'mobile-menu';
  }

  // Vérification des rôles
  get isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  get isGuest(): boolean {
    return !this.currentUser;
  }

  get isUser(): boolean {
    return this.currentUser?.role === UserRole.User;
  }

  get isEmployee(): boolean {
    return this.currentUser?.role === UserRole.Employee;
  }

  get isAdmin(): boolean {
    return this.currentUser?.role === UserRole.Admin;
  }

  // Nom d'affichage de l'utilisateur
  get displayName(): string {
    if (!this.currentUser) return '';
    return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
  }

  // Avatar de l'utilisateur
  get userAvatar(): string {
    return this.currentUser?.profilePictureUrl || '';
  }
  // Vérifie si une route est active
  isActiveRoute(route: any[]): boolean {
    if (!route || route.length === 0) return false;
    const currentUrl = this.router.url;
    const targetUrl = route.join('/');
    return currentUrl.includes(targetUrl);
  }

  // Gestion de la déconnexion
  logout(): void {
    this.userStateService.logout();
    this.closeMobileMenu();
    this.router.navigate(['/']);
  }

  // Obtient le libellé du rôle utilisateur
  getUserRoleLabel(): string {
    if (!this.currentUser) return '';
    
    switch (this.currentUser.role) {
      case UserRole.User:
        return 'Utilisateur';
      case UserRole.Employee:
        return 'Employé';
      case UserRole.Admin:
        return 'Administrateur';
      default:
        return '';
    }
  }

  // Gestion des dropdowns mobiles
  private openDropdowns: Set<string> = new Set();

  toggleMobileDropdown(label: string): void {
    if (this.openDropdowns.has(label)) {
      this.openDropdowns.delete(label);
    } else {
      this.openDropdowns.add(label);
    }
  }

  isMobileDropdownOpen(label: string): boolean {
    return this.openDropdowns.has(label);
  }
}
