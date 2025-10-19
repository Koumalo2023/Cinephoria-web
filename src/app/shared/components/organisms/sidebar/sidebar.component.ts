import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

// Composants atomiques
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { AvatarComponent } from '../../atoms/avatar/avatar.component';
import { BadgeComponent } from '../../atoms/badge/badge.component';

// Composants molécules
import { NavLinkComponent } from '../../atoms/nav-link/nav-link.component';

export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  route?: string;
  badge?: number;
  children?: SidebarItem[];
  permissions?: string[];
}

export interface UserInfo {
  name: string;
  email: string;
  avatar?: string;
  role: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    IconComponent,
    AvatarComponent,
    BadgeComponent,
    NavLinkComponent
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() user: UserInfo = {
    name: 'Utilisateur',
    email: 'user@example.com',
    role: 'user'
  };

  @Input() navigationItems: SidebarItem[] = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: 'home',
      route: '/user/dashboard'
    },
    {
      id: 'movies',
      label: 'Films',
      icon: 'film',
      route: '/movies'
    },
    {
      id: 'reservations',
      label: 'Réservations',
      icon: 'ticket',
      route: '/user/reservations',
      badge: 5
    },
    {
      id: 'profile',
      label: 'Mon Profil',
      icon: 'user',
      route: '/user/profile'
    },
    {
      id: 'management',
      label: 'Gestion',
      icon: 'settings',
      children: [
        {
          id: 'users',
          label: 'Utilisateurs',
          icon: 'users',
          route: '/admin/users',
          permissions: ['admin']
        },
        {
          id: 'employees',
          label: 'Employés',
          icon: 'users',
          route: '/admin/employees',
          permissions: ['admin']
        },
        {
          id: 'theaters',
          label: 'Salles',
          icon: 'video',
          route: '/management/theaters',
          permissions: ['admin', 'employee']
        },
        {
          id: 'showtimes',
          label: 'Séances',
          icon: 'clock',
          route: '/management/showtimes',
          permissions: ['admin', 'employee']
        },
        {
          id: 'reservations-mgmt',
          label: 'Réservations',
          icon: 'ticket',
          route: '/management/reservations',
          permissions: ['admin', 'employee']
        },
        {
          id: 'statistics',
          label: 'Statistiques',
          icon: 'bar-chart',
          route: '/management/statistics',
          permissions: ['admin', 'employee']
        },
        {
          id: 'settings',
          label: 'Paramètres',
          icon: 'settings',
          route: '/management/settings',
          permissions: ['admin', 'employee']
        }
      ]
    }
  ];

  @Input() collapsed: boolean = false;
  @Input() currentRoute: string = '';

  @Output() itemSelected = new EventEmitter<SidebarItem>();
  @Output() toggleCollapse = new EventEmitter<boolean>();

  expandedItems: Set<string> = new Set();

  toggleItemExpansion(itemId: string): void {
    if (this.expandedItems.has(itemId)) {
      this.expandedItems.delete(itemId);
    } else {
      this.expandedItems.add(itemId);
    }
  }

  onItemClick(item: SidebarItem): void {
    if (item.children && item.children.length > 0) {
      this.toggleItemExpansion(item.id);
    } else {
      this.itemSelected.emit(item);
    }
  }

  onToggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.toggleCollapse.emit(this.collapsed);
  }

  hasPermission(item: SidebarItem): boolean {
    if (!item.permissions) return true;
    return item.permissions.includes(this.user.role);
  }

  isItemActive(item: SidebarItem): boolean {
    if (item.route === this.currentRoute) return true;
    
    if (item.children) {
      return item.children.some(child =>
        child.route === this.currentRoute && this.hasPermission(child)
      );
    }
    
    return false;
  }

  getCollapsedClass(): string {
    return this.collapsed ? 'sidebar--collapsed' : '';
  }
}
