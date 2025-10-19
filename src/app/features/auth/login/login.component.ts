import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Composants partagés
import { AuthFormComponent } from '../../../shared/components/organisms/auth-form/auth-form.component';
import { AuthMode, AuthFormConfig } from '../../../shared/components/organisms/auth-form/auth-form.component';

// Services
import { AuthManagerService } from '../../../core/services/auth/auth-manager.service';
import { LoginUserDto } from '../../../core/interfaces/core.interfaces';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    AuthFormComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  // Configuration du formulaire de connexion
  authFormConfig: AuthFormConfig = {
    mode: 'login',
    title: 'Connexion à votre compte',
    subtitle: 'Connectez-vous pour accéder à votre espace personnel',
    showRememberMe: true,
    showForgotPassword: true,
    showSignUpLink: true,
    showLoginLink: false,
    requireEmailVerification: false,
    minPasswordLength: 8,
    maxPasswordLength: 128
  };

  // État du composant
  loading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private authManagerService: AuthManagerService,
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('LoginComponent initialisé');
  }

  // Gestion de la soumission du formulaire
  onAuthSubmit(authData: LoginUserDto): void {
    console.log('Tentative de connexion:', authData);
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authManagerService.login(authData).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Connexion réussie ! Redirection...';
        console.log('Utilisateur connecté avec succès:', response.user.firstName);
        
        // Redirection basée sur le rôle après connexion réussie
        setTimeout(() => {
          this.authManagerService.redirectBasedOnRole();
        }, 1500);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = this.getErrorMessage(error);
        console.error('Erreur de connexion:', error);
      }
    });
  }


  // Changement de mode (vers inscription)
  onModeChange(newMode: AuthMode): void {
    if (newMode === 'register') {
      this.router.navigate(['/auth/register']);
    }
  }

  // Réinitialisation du mot de passe
  onPasswordReset(emailData: any): void {
    console.log('Demande de réinitialisation:', emailData);
    this.loading = true;
    this.errorMessage = '';

    this.authManagerService.requestPasswordReset(emailData).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Un lien de réinitialisation a été envoyé à votre adresse email.';
        console.log('Email de réinitialisation envoyé');
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = this.getErrorMessage(error);
        console.error('Erreur lors de la demande de réinitialisation:', error);
      }
    });
  }

  // Gestion des messages d'erreur
  private getErrorMessage(error: any): string {
    if (error.status === 401) {
      return 'Email ou mot de passe incorrect';
    } else if (error.status === 0) {
      return 'Impossible de se connecter au serveur. Vérifiez que l\'API backend est démarrée sur https://localhost:5048';
    } else if (error.status === 404) {
      return 'Endpoint API non trouvé. Vérifiez la configuration du backend.';
    } else if (error.message && error.message.includes('Structure de réponse API invalide')) {
      return 'Réponse inattendue du serveur. Vérifiez la configuration de l\'API.';
    } else if (error.error?.message) {
      return error.error.message;
    } else {
      return 'Une erreur est survenue lors de la connexion';
    }
  }
}
