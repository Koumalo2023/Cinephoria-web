import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Composants partagés
import { AuthFormComponent } from '../../../shared/components/organisms/auth-form/auth-form.component';
import { AuthMode, AuthFormConfig } from '../../../shared/components/organisms/auth-form/auth-form.component';

// Services
import { AuthManagerService } from '../../../core/services/auth/auth-manager.service';
import { RequestPasswordResetDto } from '../../../core/interfaces/core.interfaces';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    AuthFormComponent
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  // Configuration du formulaire de mot de passe oublié
  authFormConfig: AuthFormConfig = {
    mode: 'forgot-password',
    title: 'Mot de passe oublié',
    subtitle: 'Entrez votre email pour recevoir un lien de réinitialisation',
    showRememberMe: false,
    showForgotPassword: false,
    showSignUpLink: false,
    showLoginLink: true,
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
    console.log('ForgotPasswordComponent initialisé');
  }

  // Gestion de la soumission du formulaire (non utilisé en mode forgot-password)
  onAuthSubmit(authData: any): void {
    // Non utilisé dans le mode forgot-password
  }


  // Changement de mode (vers connexion)
  onModeChange(newMode: AuthMode): void {
    if (newMode === 'login') {
      this.router.navigate(['/auth/login']);
    }
  }

  // Réinitialisation du mot de passe
  onPasswordReset(emailData: RequestPasswordResetDto): void {
    console.log('Demande de réinitialisation:', emailData);
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

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
    if (error.status === 404) {
      return 'Aucun compte trouvé avec cet email';
    } else if (error.status === 0) {
      return 'Erreur de connexion au serveur';
    } else if (error.error?.message) {
      return error.error.message;
    } else {
      return 'Une erreur est survenue lors de la demande de réinitialisation';
    }
  }
}
