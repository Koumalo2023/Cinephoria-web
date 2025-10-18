import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="main-layout">
      <!-- Header -->
      <header class="main-header">
        <div class="header-container">
          <div class="logo-section">
            <h1 class="logo">
              <a routerLink="/" class="logo-link">Cinephoria</a>
            </h1>
          </div>
          
          <nav class="main-nav">
            <a routerLink="/" class="nav-link" routerLinkActive="active">Accueil</a>
            <a routerLink="/movies" class="nav-link" routerLinkActive="active">Films</a>
            <a routerLink="/reservations" class="nav-link" routerLinkActive="active">Réservations</a>
            <a routerLink="/contact" class="nav-link" routerLinkActive="active">Contact</a>
          </nav>
          
          <div class="auth-section">
            <a routerLink="/auth/login" class="auth-link">Connexion</a>
            <a routerLink="/auth/register" class="auth-link auth-link--primary">Inscription</a>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="main-content">
        <router-outlet></router-outlet>
      </main>

      <!-- Footer -->
      <footer class="main-footer">
        <div class="footer-container">
          <div class="footer-section">
            <h3>Cinephoria</h3>
            <p>Votre cinéma de référence pour des expériences cinématographiques exceptionnelles.</p>
          </div>
          
          <div class="footer-section">
            <h4>Navigation</h4>
            <a routerLink="/" class="footer-link">Accueil</a>
            <a routerLink="/movies" class="footer-link">Films</a>
            <a routerLink="/reservations" class="footer-link">Réservations</a>
          </div>
          
          <div class="footer-section">
            <h4>Contact</h4>
            <p>📞 01 23 45 67 89</p>
            <p>✉️ contact&#64;cinephoria.fr</p>
            <p>📍 123 Avenue du Cinéma, 75000 Paris</p>
          </div>
          
          <div class="footer-section">
            <h4>Horaires</h4>
            <p>Lun-Dim: 10h-23h</p>
            <p>Week-end: 9h-00h</p>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>&copy; 2024 Cinephoria. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .main-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .main-header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 1rem 0;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .header-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo-section .logo {
      margin: 0;
      font-size: 1.8rem;
      font-weight: 700;
    }

    .logo-link {
      color: white;
      text-decoration: none;
      transition: opacity 0.3s ease;
    }

    .logo-link:hover {
      opacity: 0.8;
    }

    .main-nav {
      display: flex;
      gap: 2rem;
    }

    .nav-link {
      color: white;
      text-decoration: none;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .nav-link:hover,
    .nav-link.active {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .auth-section {
      display: flex;
      gap: 1rem;
    }

    .auth-link {
      color: white;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .auth-link:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .auth-link--primary {
      background-color: white;
      color: #667eea;
      font-weight: 600;
    }

    .auth-link--primary:hover {
      background-color: #f8f9fa;
      transform: translateY(-1px);
    }

    .main-content {
      flex: 1;
      padding: 2rem 0;
    }

    .main-footer {
      background-color: #2d3748;
      color: white;
      padding: 3rem 0 1rem;
      margin-top: auto;
    }

    .footer-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    }

    .footer-section h3,
    .footer-section h4 {
      margin-bottom: 1rem;
      color: #667eea;
    }

    .footer-section p {
      margin-bottom: 0.5rem;
      line-height: 1.6;
    }

    .footer-link {
      display: block;
      color: #cbd5e0;
      text-decoration: none;
      margin-bottom: 0.5rem;
      transition: color 0.3s ease;
    }

    .footer-link:hover {
      color: white;
    }

    .footer-bottom {
      max-width: 1200px;
      margin: 2rem auto 0;
      padding: 1rem 2rem;
      border-top: 1px solid #4a5568;
      text-align: center;
      color: #a0aec0;
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .header-container {
        flex-direction: column;
        gap: 1rem;
        padding: 0 1rem;
      }

      .main-nav {
        gap: 1rem;
      }

      .auth-section {
        gap: 0.5rem;
      }

      .footer-container {
        grid-template-columns: 1fr;
        text-align: center;
      }
    }
  `]
})
export class MainLayoutComponent {
  title = 'Cinephoria';
}