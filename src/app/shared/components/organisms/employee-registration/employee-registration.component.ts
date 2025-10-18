import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Composants atomiques
import { ButtonComponent } from '../../atoms/button/button.component';
import { IconComponent } from '../../atoms/icon/icon.component';
import { InputComponent } from '../../atoms/input/input.component';
import { SelectComponent } from '../../atoms/select/select.component';
import { DatePickerComponent } from '../../atoms/date-picker/date-picker.component';
import { BadgeComponent } from '../../atoms/badge/badge.component';
import { ChipComponent } from '../../atoms/chip/chip.component';
import { CheckboxComponent } from '../../atoms/checkbox/checkbox.component';
import { FileUploadComponent } from '../../atoms/file-upload/file-upload.component';

// Composants molécules
import { FormFieldComponent } from '../../molecules/form-field/form-field.component';

// Interfaces core
import { CreateEmployeeDto, CinemaDto } from '../../../../core/interfaces/core.interfaces';

export interface EmployeeRole {
  id: string;
  name: string;
  permissions: string[];
  description: string;
}

@Component({
  selector: 'app-employee-registration',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    IconComponent,
    InputComponent,
    SelectComponent,
    DatePickerComponent,
    BadgeComponent,
    ChipComponent,
    CheckboxComponent,
    FileUploadComponent,
    FormFieldComponent
  ],
  templateUrl: './employee-registration.component.html',
  styleUrl: './employee-registration.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class EmployeeRegistrationComponent implements OnInit {
  employeeForm: FormGroup;
  isSubmitting: boolean = false;
  currentStep: number = 1;
  totalSteps: number = 3;

  // Données de démonstration
  roles: EmployeeRole[] = [
    {
      id: 'manager',
      name: 'Gestionnaire',
      permissions: ['gestion_salles', 'gestion_employés', 'rapports'],
      description: 'Gestion complète du cinéma'
    },
    {
      id: 'projectionist',
      name: 'Projectionniste',
      permissions: ['gestion_séances', 'maintenance'],
      description: 'Gestion des projections et maintenance'
    },
    {
      id: 'cashier',
      name: 'Caissier',
      permissions: ['vente_billets', 'encaissement'],
      description: 'Accueil et vente de billets'
    },
    {
      id: 'cleaner',
      name: 'Agent de nettoyage',
      permissions: ['nettoyage'],
      description: 'Entretien des salles et espaces communs'
    }
  ];

  cinemas: CinemaDto[] = [
    {
      cinemaId: 1,
      name: 'Cinéma Paradis',
      address: '123 Avenue des Champs-Élysées',
      phoneNumber: '+33 1 42 68 53 01',
      city: 'Paris',
      country: 'France',
      openingHours: '10:00-23:00',
      showtimes: [],
      theaters: []
    },
    {
      cinemaId: 2,
      name: 'MegaPlex Centre',
      address: '45 Rue de la République',
      phoneNumber: '+33 4 78 92 15 67',
      city: 'Lyon',
      country: 'France',
      openingHours: '10:00-23:00',
      showtimes: [],
      theaters: []
    },
    {
      cinemaId: 3,
      name: 'CineStar',
      address: '78 Boulevard Haussmann',
      phoneNumber: '+33 4 91 23 45 67',
      city: 'Marseille',
      country: 'France',
      openingHours: '10:00-23:00',
      showtimes: [],
      theaters: []
    }
  ];

  departments: string[] = ['Projection', 'Accueil', 'Administration', 'Maintenance', 'Sécurité'];

  constructor(private fb: FormBuilder) {
    this.employeeForm = this.createEmployeeForm();
  }

  ngOnInit(): void {
    // Initialiser les données si nécessaire
  }

  private createEmployeeForm(): FormGroup {
    return this.fb.group({
      // Étape 1: Informations personnelles
      personalInfo: this.fb.group({
        firstName: ['', [Validators.required, Validators.minLength(2)]],
        lastName: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
        birthDate: ['', Validators.required],
        address: ['', Validators.required],
        city: ['', Validators.required],
        postalCode: ['', [Validators.required, Validators.pattern(/^[0-9]{5}$/)]]
      }),

      // Étape 2: Informations professionnelles
      professionalInfo: this.fb.group({
        role: ['', Validators.required],
        cinema: ['', Validators.required],
        department: ['', Validators.required],
        hireDate: ['', Validators.required],
        salary: ['', [Validators.required, Validators.min(0)]],
        contractType: ['', Validators.required],
        workSchedule: ['', Validators.required]
      }),

      // Étape 3: Documents et accès
      documents: this.fb.group({
        identityDocument: [null],
        resume: [null],
        contract: [null],
        emergencyContact: this.fb.group({
          name: ['', Validators.required],
          phone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
          relationship: ['', Validators.required]
        }),
        permissions: this.fb.group({
          systemAccess: [false],
          financialAccess: [false],
          managementAccess: [false],
          reportsAccess: [false]
        })
      })
    });
  }

  // Gestion des étapes
  nextStep(): void {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
    }
  }

  previousStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    if (step >= 1 && step <= this.totalSteps) {
      this.currentStep = step;
    }
  }

  // Gestion des fichiers
  onFileSelected(event: any, field: string): void {
    const file = event.target?.files?.[0];
    if (file) {
      const documentsGroup = this.employeeForm.get('documents') as FormGroup;
      documentsGroup.patchValue({ [field]: file });
      console.log(`Fichier sélectionné pour ${field}:`, file.name);
    }
  }

  // Validation des étapes
  isStepValid(step: number): boolean {
    switch (step) {
      case 1:
        return (this.employeeForm.get('personalInfo') as FormGroup).valid;
      case 2:
        return (this.employeeForm.get('professionalInfo') as FormGroup).valid;
      case 3:
        return (this.employeeForm.get('documents') as FormGroup).valid;
      default:
        return false;
    }
  }

  // Soumission du formulaire
  onSubmit(): void {
    if (this.employeeForm.valid) {
      this.isSubmitting = true;
      const formData = this.employeeForm.value;
      
      // Conversion vers CreateEmployeeDto
      const employeeData: CreateEmployeeDto = {
        email: formData.personalInfo.email,
        password: 'TempPassword123!', // Générer un mot de passe temporaire
        firstName: formData.personalInfo.firstName,
        lastName: formData.personalInfo.lastName,
        phoneNumber: formData.personalInfo.phone,
        position: formData.professionalInfo.role,
        hiredDate: formData.professionalInfo.hireDate
      };

      console.log('Données employé:', employeeData);

      // Simulation d'envoi
      setTimeout(() => {
        this.isSubmitting = false;
        console.log('Employé enregistré avec succès!');
        this.employeeForm.reset();
        this.currentStep = 1;
      }, 2000);
    } else {
      console.log('Formulaire invalide');
    }
  }

  // Getters pour les options des selects
  get roleOptions(): any[] {
    return this.roles.map(role => ({ 
      label: role.name, 
      value: role.id,
      description: role.description
    }));
  }

  get cinemaOptions(): any[] {
    return this.cinemas.map(cinema => ({
      label: cinema.name,
      value: cinema.cinemaId,
      sublabel: `${cinema.city} - ${cinema.address}`
    }));
  }

  get departmentOptions(): any[] {
    return this.departments.map(dept => ({ label: dept, value: dept }));
  }

  get contractTypeOptions(): any[] {
    return [
      { label: 'CDI', value: 'cdi' },
      { label: 'CDD', value: 'cdd' },
      { label: 'Temps partiel', value: 'part_time' },
      { label: 'Intérim', value: 'interim' }
    ];
  }

  get workScheduleOptions(): any[] {
    return [
      { label: 'Temps plein (35h)', value: 'full_time' },
      { label: 'Temps partiel (20h)', value: 'part_time_20' },
      { label: 'Temps partiel (25h)', value: 'part_time_25' },
      { label: 'Horaires variables', value: 'variable' }
    ];
  }

  // Getters pour les groupes de formulaire
  get personalInfo(): FormGroup {
    return this.employeeForm.get('personalInfo') as FormGroup;
  }

  get professionalInfo(): FormGroup {
    return this.employeeForm.get('professionalInfo') as FormGroup;
  }

  get documents(): FormGroup {
    return this.employeeForm.get('documents') as FormGroup;
  }

  get emergencyContact(): FormGroup {
    return this.documents.get('emergencyContact') as FormGroup;
  }

  get permissions(): FormGroup {
    return this.documents.get('permissions') as FormGroup;
  }

  // Méthodes utilitaires pour l'affichage
  getRoleDisplayName(roleId: string): string {
    const role = this.roles.find(r => r.id === roleId);
    return role ? role.name : 'Rôle inconnu';
  }

  getCinemaDisplayName(cinemaId: number): string {
    const cinema = this.cinemas.find(c => c.cinemaId === cinemaId);
    return cinema ? cinema.name : 'Cinéma inconnu';
  }
}
