import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-layout">
      <!-- Sidebar -->
      <aside class="admin-sidebar">
        <div class="sidebar-header">
          <h2 class="sidebar-logo">Cinephoria</h2>
          <p class="sidebar-subtitle">Administration</p>
        </div>
        
        <nav class="sidebar-nav">
          <div class="nav-section">
            <h3 class="nav-section-title">Tableau de bord</h3>
            <a routerLink="/admin/dashboard" class="nav-link" routerLinkActive="active">
              📊 Vue d'ensemble
            </a>
          </div>
          
          <div class="nav-section">
            <h3 class="nav-section-title">Gestion</h3>
            <a routerLink="/admin/movies" class="nav-link" routerLinkActive="active">
              🎬 Films
            </a>
            <a routerLink="/admin/showtimes" class="nav-link" routerLinkActive="active">
              🕒 Séances
            </a>
            <a routerLink="/admin/theaters" class="nav-link" routerLinkActive="active">
              🎭 Salles
            </a>
            <a routerLink="/admin/incidents" class="nav-link" routerLinkActive="active">
              ⚠️ Incidents
            </a>
          </div>
          
          <div class="nav-section">
            <h3 class="nav-section-title">Utilisateurs</h3>
            <a routerLink="/admin/users" class="nav-link" routerLinkActive="active">
              👥 Utilisateurs
            </a>
            <a routerLink="/admin/employees" class="nav-link" routerLinkActive="active">
              👨‍💼 Employés
            </a>
          </div>
          
          <div class="nav-section">
            <h3 class="nav-section-title">Analyses</h3>
            <a routerLink="/admin/statistics" class="nav-link" routerLinkActive="active">
              📈 Statistiques
            </a>
            <a routerLink="/admin/reports" class="nav-link" routerLinkActive="active">
              📋 Rapports
            </a>
          </div>
          
          <div class="nav-section">
            <h3 class="nav-section-title">Configuration</h3>
            <a routerLink="/admin/settings" class="nav-link" routerLinkActive="active">
              ⚙️ Paramètres
            </a>
          </div>
        </nav>
        
        <div class="sidebar-footer">
          <div class="user-info">
            <div class="user-avatar">A</div>
            <div class="user-details">
              <strong>Administrateur</strong>
              <span>admin&#64;cinephoria.fr</span>
            </div>
          </div>
          <button class="logout-btn" (click)="logout()">🚪 Déconnexion</button>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="admin-main">
        <!-- Header -->
        <header class="admin-header">
          <div class="header-left">
            <button class="menu-toggle" (click)="toggleSidebar()">
              ☰
            </button>
            <h1 class="page-title">{{ getPageTitle() }}</h1>
          </div>
          
          <div class="header-right">
            <div class="header-actions">
              <button class="header-btn" title="Notifications">
                🔔
                <span class="notification-badge">3</span>
              </button>
              <button class="header-btn" title="Aide">
                ❓
              </button>
            </div>
            <div class="user-menu">
              <span class="user-name">Administrateur</span>
              <div class="user-avatar-small">A</div>
            </div>
          </div>
        </header>

        <!-- Content -->
        <main class="admin-content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      min-height: 100vh;
      background-color: #f7fafc;
    }

    .admin-sidebar {
      width: 280px;
      background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
      color: white;
      display: flex;
      flex-direction: column;
      transition: all 0.3s ease;
    }

    .sidebar-header {
      padding: 2rem 1.5rem 1rem;
      border-bottom: 1px solid #4a5568;
    }

    .sidebar-logo {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #667eea;
    }

    .sidebar-subtitle {
      margin: 0;
      color: #a0aec0;
      font-size: 0.9rem;
    }

    .sidebar-nav {
      flex: 1;
      padding: 1rem 0;
      overflow-y: auto;
    }

    .nav-section {
      margin-bottom: 1.5rem;
    }

    .nav-section-title {
      font-size: 0.8rem;
      font-weight: 600;
      color: #a0aec0;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 0 1.5rem 0.5rem;
      margin: 0;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #cbd5e0;
      text-decoration: none;
      padding: 0.75rem 1.5rem;
      transition: all 0.3s ease;
      border-left: 3px solid transparent;
    }

    .nav-link:hover {
      background-color: rgba(102, 126, 234, 0.1);
      color: white;
    }

    .nav-link.active {
      background-color: rgba(102, 126, 234, 0.2);
      color: #667eea;
      border-left-color: #667eea;
    }

    .sidebar-footer {
      padding: 1.5rem;
      border-top: 1px solid #4a5568;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
    }

    .user-details {
      flex: 1;
    }

    .user-details strong {
      display: block;
      font-size: 0.9rem;
    }

    .user-details span {
      font-size: 0.8rem;
      color: #a0aec0;
    }

    .logout-btn {
      width: 100%;
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 0.75rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .logout-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .admin-main {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .admin-header {
      background: white;
      border-bottom: 1px solid #e2e8f0;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .menu-toggle {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 4px;
      transition: background-color 0.3s ease;
    }

    .menu-toggle:hover {
      background-color: #f7fafc;
    }

    .page-title {
      margin: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: #2d3748;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .header-actions {
      display: flex;
      gap: 0.5rem;
    }

    .header-btn {
      background: none;
      border: none;
      padding: 0.5rem;
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      transition: background-color 0.3s ease;
    }

    .header-btn:hover {
      background-color: #f7fafc;
    }

    .notification-badge {
      position: absolute;
      top: -2px;
      right: -2px;
      background: #e53e3e;
      color: white;
      font-size: 0.7rem;
      padding: 0.1rem 0.3rem;
      border-radius: 50%;
      min-width: 16px;
      text-align: center;
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem;
      border-radius: 6px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    .user-menu:hover {
      background-color: #f7fafc;
    }

    .user-name {
      font-weight: 500;
      color: #2d3748;
    }

    .user-avatar-small {
      width: 32px;
      height: 32px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      color: white;
      font-size: 0.8rem;
    }

    .admin-content {
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .admin-sidebar {
        position: fixed;
        left: -280px;
        height: 100vh;
        z-index: 1000;
      }

      .admin-sidebar.open {
        left: 0;
      }

      .admin-header {
        padding: 1rem;
      }

      .admin-content {
        padding: 1rem;
      }

      .user-name {
        display: none;
      }
    }

    @media (max-width: 480px) {
      .page-title {
        font-size: 1.25rem;
      }

      .admin-content {
        padding: 0.5rem;
      }
    }
  `]
})
export class AdminLayoutComponent {
  isSidebarOpen = true;

  getPageTitle(): string {
    const currentPath = window.location.pathname;
    const routeTitles: { [key: string]: string } = {
      '/admin/dashboard': 'Tableau de bord',
      '/admin/movies': 'Gestion des films',
      '/admin/showtimes': 'Gestion des séances',
      '/admin/theaters': 'Gestion des salles',
      '/admin/incidents': 'Gestion des incidents',
      '/admin/users': 'Gestion des utilisateurs',
      '/admin/employees': 'Gestion des employés',
      '/admin/statistics': 'Statistiques',
      '/admin/reports': 'Rapports',
      '/admin/settings': 'Paramètres'
    };
    
    return routeTitles[currentPath] || 'Administration';
  }

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  logout(): void {
    // TODO: Implémenter la déconnexion
    console.log('Déconnexion...');
  }
}