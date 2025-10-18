import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="auth-layout">
      <!-- Header -->
      <header class="auth-header">
        <div class="auth-header-container">
          <a routerLink="/" class="auth-logo">
            <h1>Cinephoria</h1>
          </a>
          <nav class="auth-nav">
            <a routerLink="/" class="auth-nav-link">Retour à l'accueil</a>
          </nav>
        </div>
      </header>

      <!-- Main Content -->
      <main class="auth-content">
        <div class="auth-container">
          <div class="auth-background">
            <div class="auth-overlay">
              <div class="auth-card">
                <div class="auth-card-header">
                  <h2 class="auth-title">{{ getPageTitle() }}</h2>
                  <p class="auth-subtitle">Accédez à votre espace Cinephoria</p>
                </div>
                
                <div class="auth-card-body">
                  <router-outlet></router-outlet>
                </div>
                
                <div class="auth-card-footer">
                  <div class="auth-links">
                    <a routerLink="/auth/login" *ngIf="!isLoginPage()" class="auth-link">
                      Déjà un compte ? Se connecter
                    </a>
                    <a routerLink="/auth/register" *ngIf="!isRegisterPage()" class="auth-link">
                      Pas encore de compte ? S'inscrire
                    </a>
                    <a routerLink="/" class="auth-link">
                      ← Retour à l'accueil
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- Footer -->
      <footer class="auth-footer">
        <div class="auth-footer-container">
          <p>&copy; 2024 Cinephoria. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .auth-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .auth-header {
      background: white;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      padding: 1rem 0;
    }

    .auth-header-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .auth-logo {
      color: #667eea;
      text-decoration: none;
      font-size: 1.5rem;
      font-weight: 700;
    }

    .auth-logo h1 {
      margin: 0;
    }

    .auth-nav-link {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .auth-nav-link:hover {
      background-color: rgba(102, 126, 234, 0.1);
    }

    .auth-content {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .auth-container {
      width: 100%;
      height: 100%;
    }

    .auth-background {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .auth-overlay {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      border-radius: 12px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }

    .auth-card {
      min-width: 400px;
      max-width: 500px;
      padding: 2rem;
    }

    .auth-card-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .auth-title {
      color: #2d3748;
      font-size: 2rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
    }

    .auth-subtitle {
      color: #718096;
      font-size: 1rem;
      margin: 0;
    }

    .auth-card-body {
      margin-bottom: 2rem;
    }

    .auth-card-footer {
      border-top: 1px solid #e2e8f0;
      padding-top: 1.5rem;
    }

    .auth-links {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      text-align: center;
    }

    .auth-link {
      color: #667eea;
      text-decoration: none;
      font-size: 0.9rem;
      transition: color 0.3s ease;
    }

    .auth-link:hover {
      color: #764ba2;
      text-decoration: underline;
    }

    .auth-footer {
      background: white;
      border-top: 1px solid #e2e8f0;
      padding: 1rem 0;
    }

    .auth-footer-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      text-align: center;
      color: #718096;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .auth-header-container {
        padding: 0 1rem;
      }

      .auth-background {
        padding: 1rem;
      }

      .auth-card {
        min-width: unset;
        width: 100%;
        padding: 1.5rem;
      }

      .auth-title {
        font-size: 1.5rem;
      }
    }

    @media (max-width: 480px) {
      .auth-card {
        padding: 1rem;
      }

      .auth-header-container {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `]
})
export class AuthLayoutComponent {
  getPageTitle(): string {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/register')) {
      return 'Créer un compte';
    } else if (currentPath.includes('/login')) {
      return 'Se connecter';
    }
    return 'Authentification';
  }

  isLoginPage(): boolean {
    return window.location.pathname.includes('/login');
  }

  isRegisterPage(): boolean {
    return window.location.pathname.includes('/register');
  }
}