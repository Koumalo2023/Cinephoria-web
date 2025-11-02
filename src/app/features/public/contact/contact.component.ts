import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';


// Services
import { AuthService } from '../../../core/services/api/auth.service';

// Interfaces
import { ContactRequest } from '../../../core/interfaces/core.interfaces';

export interface ContactInfo {
  type: 'email' | 'phone' | 'address' | 'social';
  label: string;
  value: string;
  icon: string;
  description?: string;
}

export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

@Component({
  selector: 'app-contact',
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  isSubmitting: boolean = false;
  isSubmitted: boolean = false;

  // Informations de contact
  contactInfos: ContactInfo[] = [
    {
      type: 'email',
      label: 'Email',
      value: 'contact@cinephoria.com',
      icon: 'mail',
      description: 'Réponse sous 24h'
    },
    {
      type: 'phone',
      label: 'Téléphone',
      value: '+33 1 23 45 67 89',
      icon: 'phone',
      description: 'Lun-Ven 9h-18h'
    },
    {
      type: 'address',
      label: 'Adresse',
      value: '123 Avenue des Champs-Élysées, 75008 Paris',
      icon: 'map-pin',
      description: 'Siège social'
    },
    {
      type: 'social',
      label: 'Réseaux sociaux',
      value: '@Cinephoria',
      icon: 'share-2',
      description: 'Suivez-nous'
    }
  ];

  // FAQ
  faqItems: FAQItem[] = [
    {
      question: 'Comment réserver des places ?',
      answer: 'Vous pouvez réserver en ligne via notre site web, via l\'application mobile, ou directement à la caisse du cinéma.',
      category: 'Réservations'
    },
    {
      question: 'Puis-je annuler ou modifier ma réservation ?',
      answer: 'Les annulations sont possibles jusqu\'à 2h avant la séance. Les modifications dépendent des places disponibles.',
      category: 'Réservations'
    },
    {
      question: 'Quels sont les tarifs ?',
      answer: 'Nos tarifs varient selon les séances (plein tarif, réduit, étudiant, enfant). Des abonnements sont également disponibles.',
      category: 'Tarifs'
    },
    {
      question: 'Y a-t-il des places PMR ?',
      answer: 'Tous nos cinémas sont accessibles aux personnes à mobilité réduite. Réservez vos places PMR en ligne ou par téléphone.',
      category: 'Accessibilité'
    },
    {
      question: 'Comment devenir membre fidélité ?',
      answer: 'Créez un compte sur notre site et cumulez des points à chaque réservation pour bénéficier d\'avantages exclusifs.',
      category: 'Fidélité'
    },
    {
      question: 'Puis-je organiser un événement privé ?',
      answer: 'Oui, nous proposons la location de salles pour événements privés. Contactez-nous pour plus d\'informations.',
      category: 'Événements'
    }
  ];

  // Équipe de support
  supportTeam = [
    {
      name: 'Marie Dubois',
      role: 'Responsable clientèle',
      email: 'marie.dubois@cinephoria.com',
      phone: '+33 1 23 45 67 90',
      avatar: '/assets/team/marie.jpg',
      specialties: ['Réservations', 'Fidélité', 'Réclamations']
    },
    {
      name: 'Thomas Martin',
      role: 'Support technique',
      email: 'thomas.martin@cinephoria.com',
      phone: '+33 1 23 45 67 91',
      avatar: '/assets/team/thomas.jpg',
      specialties: ['Problèmes techniques', 'Application mobile', 'Compte utilisateur']
    },
    {
      name: 'Sophie Laurent',
      role: 'Gestionnaire événements',
      email: 'sophie.laurent@cinephoria.com',
      phone: '+33 1 23 45 67 92',
      avatar: '/assets/team/sophie.jpg',
      specialties: ['Événements privés', 'Groupes', 'Entreprises']
    }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.contactForm = this.createContactForm();
  }

  ngOnInit(): void {
    // Initialiser les données si nécessaire
  }

  private createContactForm(): FormGroup {
    return this.fb.group({
      username: ['', [Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      title: ['', [Validators.required, Validators.minLength(5)]],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }


  // Soumission du formulaire avec appel API
  onSubmit(): void {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      
      const formData: ContactRequest = {
        username: this.contactForm.get('username')?.value,
        email: this.contactForm.get('email')?.value,
        title: this.contactForm.get('title')?.value,
        description: this.contactForm.get('description')?.value
      };

      console.log('Envoi du formulaire de contact:', formData);

      // Appel API réel
      this.authService.sendContactMessage(formData).subscribe({
        next: () => {
          this.isSubmitting = false;
          this.isSubmitted = true;
          console.log('Formulaire envoyé avec succès!');
          
          // Réinitialiser après 5 secondes
          setTimeout(() => {
            this.isSubmitted = false;
            this.contactForm.reset();
          }, 5000);
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Erreur lors de l\'envoi du formulaire:', error);
          // Gérer l'erreur (affichage d'un message d'erreur à l'utilisateur)
        }
      });
    } else {
      console.log('Formulaire invalide');
    }
  }

  // Gestion des catégories FAQ
  get faqCategories(): string[] {
    return [...new Set(this.faqItems.map(item => item.category))];
  }

  getFaqItemsByCategory(category: string): FAQItem[] {
    return this.faqItems.filter(item => item.category === category);
  }

  // Getters pour les champs du formulaire
  get username(): any {
    return this.contactForm.get('username');
  }

  get email(): any {
    return this.contactForm.get('email');
  }

  get title(): any {
    return this.contactForm.get('title');
  }

  get description(): any {
    return this.contactForm.get('description');
  }
}
