import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

// Composants partagés
import { AuthFormComponent } from '../../../shared/components/organisms/auth-form/auth-form.component';
import { AuthMode, AuthFormConfig } from '../../../shared/components/organisms/auth-form/auth-form.component';

// Services
import { AuthManagerService } from '../../../core/services/auth/auth-manager.service';
import { LoginUserDto, RegisterUserDto } from '../../../core/interfaces/core.interfaces';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    AuthFormComponent
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  // Configuration du formulaire d'inscription
  authFormConfig: AuthFormConfig = {
    mode: 'register',
    title: 'Créer votre compte',
    subtitle: 'Rejoignez la communauté Cinephoria en quelques secondes',
    showRememberMe: false,
    showForgotPassword: false,
    showSignUpLink: false,
    showLoginLink: true,
    requireEmailVerification: true,
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
    console.log('RegisterComponent initialisé');
  }

  // Gestion de la soumission du formulaire
  onAuthSubmit(authData: LoginUserDto | RegisterUserDto): void {
    // En mode register, authData sera toujours de type RegisterUserDto
    const registerData = authData as RegisterUserDto;
    console.log('Tentative d\'inscription:', registerData);
    this.loading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authManagerService.register(registerData).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Compte créé avec succès ! Redirection...';
        console.log('Utilisateur inscrit avec succès:', response.user.firstName);
        
        // Redirection basée sur le rôle après inscription réussie
        setTimeout(() => {
          this.authManagerService.redirectBasedOnRole();
        }, 1500);
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = this.getErrorMessage(error);
        console.error('Erreur d\'inscription:', error);
      }
    });
  }


  // Changement de mode (vers connexion)
  onModeChange(newMode: AuthMode): void {
    if (newMode === 'login') {
      this.router.navigate(['/auth/login']);
    }
  }

  // Réinitialisation du mot de passe (non utilisé en mode register)
  onPasswordReset(emailData: any): void {
    // Non utilisé dans le mode register
  }

  // Gestion des messages d'erreur
  private getErrorMessage(error: any): string {
    if (error.status === 409) {
      return 'Un compte avec cet email existe déjà';
    } else if (error.status === 400) {
      return 'Données d\'inscription invalides';
    } else if (error.status === 0) {
      return 'Impossible de se connecter au serveur. Vérifiez que l\'API backend est démarrée sur https://localhost:5048';
    } else if (error.status === 404) {
      return 'Endpoint API non trouvé. Vérifiez la configuration du backend.';
    } else if (error.message && error.message.includes('Structure de réponse API invalide')) {
      return 'Réponse inattendue du serveur. Vérifiez la configuration de l\'API.';
    } else if (error.error?.message) {
      return error.error.message;
    } else {
      return 'Une erreur est survenue lors de l\'inscription';
    }
  }
}
