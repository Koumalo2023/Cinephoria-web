import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Composants atomiques
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { InputComponent } from '../../atoms/input/input.component';
import { TextareaComponent } from '../../atoms/textarea/textarea.component';
import { BadgeComponent } from '../../atoms/badge/badge.component';
import { ChipComponent } from '../../atoms/chip/chip.component';

// Composants molécules
import { ContactFormComponent } from '../../molecules/contact-form/contact-form.component';

// Interfaces
import { ContactRequest } from '../../../../core/interfaces/core.interfaces';

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
  selector: 'app-contact-page',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    IconComponent,
    InputComponent,
    TextareaComponent,
    BadgeComponent,
    ChipComponent,
    ContactFormComponent
  ],
  templateUrl: './contact-page.component.html',
  styleUrl: './contact-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class ContactPageComponent implements OnInit {
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

  constructor(private fb: FormBuilder) {
    this.contactForm = this.createContactForm();
  }

  ngOnInit(): void {
    // Initialiser les données si nécessaire
  }

  private createContactForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(10)]],
      category: ['general', Validators.required],
      priority: ['normal', Validators.required],
      consent: [false, Validators.requiredTrue]
    });
  }

  // Catégories de contact
  get contactCategories(): any[] {
    return [
      { label: 'Question générale', value: 'general' },
      { label: 'Problème technique', value: 'technical' },
      { label: 'Réservation', value: 'reservation' },
      { label: 'Réclamation', value: 'complaint' },
      { label: 'Suggestion', value: 'suggestion' },
      { label: 'Partenariat', value: 'partnership' }
    ];
  }

  // Priorités
  get priorityOptions(): any[] {
    return [
      { label: 'Normal', value: 'normal' },
      { label: 'Urgent', value: 'urgent' },
      { label: 'Critique', value: 'critical' }
    ];
  }

  // Soumission du formulaire
  onSubmit(): void {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      
      const formData: ContactRequest = {
        username: this.contactForm.get('name')?.value,
        email: this.contactForm.get('email')?.value,
        title: this.contactForm.get('subject')?.value,
        description: this.contactForm.get('message')?.value
      };

      console.log('Envoi du formulaire de contact:', formData);

      // Simulation d'envoi
      setTimeout(() => {
        this.isSubmitting = false;
        this.isSubmitted = true;
        console.log('Formulaire envoyé avec succès!');
        
        // Réinitialiser après 5 secondes
        setTimeout(() => {
          this.isSubmitted = false;
          this.contactForm.reset({
            category: 'general',
            priority: 'normal',
            consent: false
          });
        }, 5000);
      }, 2000);
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
  get name(): any {
    return this.contactForm.get('name');
  }

  get email(): any {
    return this.contactForm.get('email');
  }

  get subject(): any {
    return this.contactForm.get('subject');
  }

  get message(): any {
    return this.contactForm.get('message');
  }

  get category(): any {
    return this.contactForm.get('category');
  }

  get priority(): any {
    return this.contactForm.get('priority');
  }

  get consent(): any {
    return this.contactForm.get('consent');
  }
}
