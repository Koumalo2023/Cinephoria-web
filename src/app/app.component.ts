import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faHome, faFilm, faSignInAlt, faUser } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FaIconComponent],
  template: `
    <div class="app-container">
      <header class="app-header">
        <h1>Cinephoria</h1>
        <nav class="app-nav">
          <a routerLink="/">
            <fa-icon [icon]="faHome"></fa-icon>
            Accueil
          </a>
          <a routerLink="/movies">
            <fa-icon [icon]="faFilm"></fa-icon>
            Films
          </a>
          <a routerLink="/auth/login">
            <fa-icon [icon]="faSignInAlt"></fa-icon>
            Connexion
          </a>
        </nav>
      </header>
      
      <main class="app-main">
        <router-outlet></router-outlet>
      </main>
      
      <footer class="app-footer">
        <p>&copy; 2024 Cinephoria - Tous droits réservés</p>
      </footer>
    </div>
  `,
  styles: [`
    .app-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    
    .app-header {
      background-color: #1a1a1a;
      color: white;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .app-header h1 {
      margin: 0;
      font-size: 1.8rem;
      font-weight: bold;
    }
    
    .app-nav {
      display: flex;
      gap: 2rem;
    }
    
    .app-nav a {
      color: white;
      text-decoration: none;
      padding: 0.5rem 1rem;
      border-radius: 4px;
      transition: background-color 0.3s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .app-nav a:hover {
      background-color: rgba(255,255,255,0.1);
    }
    
    .app-nav fa-icon {
      font-size: 0.9rem;
    }
    
    .app-main {
      flex: 1;
      padding: 2rem;
    }
    
    .app-footer {
      background-color: #f5f5f5;
      padding: 1rem 2rem;
      text-align: center;
      border-top: 1px solid #e0e0e0;
    }
  `]
})
export class AppComponent {
  title = 'Cinephoria - Gestion de Cinéma';
  
  // FontAwesome icons
  faHome = faHome;
  faFilm = faFilm;
  faSignInAlt = faSignInAlt;
  faUser = faUser;
}