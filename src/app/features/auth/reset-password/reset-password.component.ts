import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Composants partagés
import { AuthFormComponent } from '../../../shared/components/organisms/auth-form/auth-form.component';
import { AuthMode, AuthFormConfig } from '../../../shared/components/organisms/auth-form/auth-form.component';

// Services
import { AuthManagerService } from '../../../core/services/auth/auth-manager.service';
import { ResetPasswordDto } from '../../../core/interfaces/core.interfaces';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    AuthFormComponent
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  // Configuration du formulaire de réinitialisation
  authFormConfig: AuthFormConfig = {
    mode: 'reset-password',
    title: 'Réinitialiser votre mot de passe',
    subtitle: 'Choisissez un nouveau mot de passe sécurisé',
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

  // Token de réinitialisation et email
  resetToken: string = '';
  userEmail: string = '';

  constructor(
    private authManagerService: AuthManagerService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    console.log('ResetPasswordComponent initialisé');
    
    // Récupérer le token et l'email depuis les paramètres de route
    this.route.queryParams.subscribe(params => {
      this.resetToken = params['token'] || '';
      this.userEmail = params['email'] || '';
      
      if (!this.resetToken || !this.userEmail) {
        this.errorMessage = 'Token de réinitialisation ou email manquant';
      }
    });
  }

  // Gestion de la soumission du formulaire (non utilisé en mode reset-password)
  onAuthSubmit(authData: any): void {
    // Non utilisé dans le mode reset-password
  }


  // Changement de mode (vers connexion)
  onModeChange(newMode: AuthMode): void {
    if (newMode === 'login') {
      this.router.navigate(['/auth/login']);
    }
  }

  // Réinitialisation du mot de passe
  onPasswordReset(passwordData: any): void {
    if (!this.resetToken || !this.userEmail) {
      this.errorMessage = 'Token de réinitialisation ou email manquant';
      return;
    }

    console.log('Réinitialisation du mot de passe:', passwordData);
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const resetData: ResetPasswordDto = {
      token: this.resetToken,
      email: this.userEmail,
      newPassword: passwordData.password
    };

    this.authManagerService.resetPassword(resetData).subscribe({
      next: () => {
        this.loading = false;
        this.successMessage = 'Mot de passe réinitialisé avec succès ! Redirection...';
        console.log('Mot de passe réinitialisé avec succès');
        
        // Redirection après réinitialisation réussie
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 1500);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = this.getErrorMessage(error);
        console.error('Erreur lors de la réinitialisation:', error);
      }
    });
  }

  // Gestion des messages d'erreur
  private getErrorMessage(error: any): string {
    if (error.status === 400) {
      return 'Token de réinitialisation invalide ou expiré';
    } else if (error.status === 0) {
      return 'Erreur de connexion au serveur';
    } else if (error.error?.message) {
      return error.error.message;
    } else {
      return 'Une erreur est survenue lors de la réinitialisation';
    }
  }
}
