import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { of } from 'rxjs';
import { catchError, finalize, tap } from 'rxjs/operators';

// Composants atomiques
import { AvatarComponent } from 'src/app/shared/components/atoms/avatar/avatar.component';
import { BadgeComponent } from 'src/app/shared/components/atoms/badge/badge.component';
import { ButtonComponent } from 'src/app/shared/components/atoms/button/button.component';
import { IconComponent } from 'src/app/shared/components/atoms/icon/icon.component';
import { InputComponent } from 'src/app/shared/components/atoms/input/input.component';
import { SearchInputComponent } from 'src/app/shared/components/atoms/search-input/search-input.component';
import { SelectComponent } from 'src/app/shared/components/atoms/select/select.component';

// Composants molécules
import { AppliedFilter, FilterGroup, FilterPanelComponent } from 'src/app/shared/components/molecules/filter-panel/filter-panel.component';
import { PasswordResetFormComponent } from 'src/app/shared/components/molecules/password-reset-form/password-reset-form.component';

// Composants organisms
import { AdminTableComponent, TableAction, TableColumn, TableConfig, TableData } from 'src/app/shared/components/organisms/admin-table/admin-table.component';
import { EmployeeRegistrationComponent } from 'src/app/shared/components/organisms/employee-registration/employee-registration.component';

// Services
import { UserService } from 'src/app/core/services/api/user.service';
import { UserStateService } from 'src/app/core/services/auth/user-state.service';
import { LoadingService } from 'src/app/core/services/loading.service';
import { NotificationService } from 'src/app/core/services/notification.service';

// Interfaces
import {
  AppUserDto,
  ChangeEmployeePasswordDto,
  EmployeeProfileDto,
  UpdateEmployeeDto
} from 'src/app/core/interfaces/core.interfaces';

// Enums
import { UserRole } from 'src/app/core/enums/user-role.enum';

export interface EmployeeStats {
  totalEmployees: number;
  activeEmployees: number;
  totalAdmins: number;
  newEmployeesThisMonth: number;
  employeeGrowthRate: number;
  averageTenure: number;
}

export interface EmployeeFilters {
  role?: UserRole;
  status?: 'active' | 'inactive';
  department?: string;
  cinema?: number;
  searchTerm?: string;
}

@Component({
  selector: 'app-employee-management',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    IconComponent,
    InputComponent,
    SearchInputComponent,
    SelectComponent,
    BadgeComponent,
    AvatarComponent,
    FilterPanelComponent,
    PasswordResetFormComponent,
    AdminTableComponent,
    EmployeeRegistrationComponent
  ],
  templateUrl: './employee-management.component.html',
  styleUrl: './employee-management.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmployeeManagementComponent implements OnInit {
  private userService = inject(UserService);
  private userStateService = inject(UserStateService);
  private loadingService = inject(LoadingService);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  activeView: 'list' | 'registration' | 'details' = 'list';
  searchTerm: string = '';
  selectedEmployee: EmployeeProfileDto | null = null;
  isEditing: boolean = false;
  isResettingPassword: boolean = false;
  isLoading: boolean = false;
  filterContext: 'employees' | 'custom' = 'employees';

  // Données réelles
  employees: EmployeeProfileDto[] = [];
  allUsers: AppUserDto[] = [];
  stats: EmployeeStats = {
    totalEmployees: 0,
    activeEmployees: 0,
    totalAdmins: 0,
    newEmployeesThisMonth: 0,
    employeeGrowthRate: 0,
    averageTenure: 0
  };

  filterGroups: FilterGroup[] = [];
  appliedFilters: AppliedFilter[] = [];

  // Formulaire d'édition
  employeeForm: FormGroup;

  // Configuration de la table
  tableConfig: TableConfig = {
    selectable: true,
    sortable: true,
    filterable: true,
    pagination: true,
    pageSize: 10,
    pageSizeOptions: [5, 10, 25, 50],
    showActions: true,
    showSearch: true,
    showFilters: true,
    showHeader: true,
    showFooter: true,
    striped: true,
    hover: true,
    compact: false
  };

  tableColumns: TableColumn[] = [
    { key: 'profilePictureUrl', label: '', type: 'avatar', width: '60px', align: 'center' },
    { key: 'firstName', label: 'Prénom', sortable: true, filterable: true },
    { key: 'lastName', label: 'Nom', sortable: true, filterable: true },
    { key: 'email', label: 'Email', sortable: true, filterable: true },
    { key: 'position', label: 'Poste', sortable: true, filterable: true },
    { key: 'role', label: 'Rôle', sortable: true, filterable: true, type: 'badge' },
    { key: 'hiredDate', label: 'Date d\'embauche', sortable: true, type: 'date' },
    { key: 'actions', label: 'Actions', type: 'action', width: '200px', align: 'center' }
  ];

  tableActions: TableAction[] = [
    {
      id: 'edit',
      label: 'Modifier',
      icon: 'edit',
      variant: 'secondary',
      visible: () => true
    },
    {
      id: 'reset-password',
      label: 'Réinitialiser mot de passe',
      icon: 'key',
      variant: 'secondary',
      visible: () => true
    },
    {
      id: 'delete',
      label: 'Supprimer',
      icon: 'trash-2',
      variant: 'danger',
      visible: () => true
    }
  ];

  constructor(private fb: FormBuilder) {
    this.employeeForm = this.createEmployeeForm();
  }

  ngOnInit(): void {
    this.loadEmployees();
    this.loadUserStats();
    this.initializeFilters();
  }

  private createEmployeeForm(): FormGroup {
    return this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      position: ['', Validators.required],
      profilePictureUrl: ['']
    });
  }

  // Gestion des vues
  setView(view: 'list' | 'registration' | 'details', employee?: EmployeeProfileDto): void {
    this.activeView = view;
    
    if (view === 'details' && employee) {
      this.selectedEmployee = employee;
      this.loadEmployeeDetails(employee.appUserId);
    } else if (view === 'registration') {
      this.selectedEmployee = null;
      this.isEditing = false;
    } else {
      this.selectedEmployee = null;
    }
    
    this.cdr.detectChanges();
  }

  // Recherche
  onSearch(searchTerm: string): void {
    this.searchTerm = searchTerm;
    console.log('Recherche employés:', searchTerm);
  }

  // Chargement des données
  loadEmployees(): void {
    this.isLoading = true;
    this.loadingService.start('employees-loading', 'Chargement des employés...');
    
    this.userService.getAllEmployees()
      .pipe(
        tap((employees: EmployeeProfileDto[]) => {
          this.employees = employees;
          this.updateStats();
          this.cdr.detectChanges();
        }),
        catchError(error => {
          this.notificationService.error('Erreur', 'Erreur lors du chargement des employés');
          console.error('Erreur chargement employés:', error);
          return of([]);
        }),
        finalize(() => {
          this.isLoading = false;
          this.loadingService.stop('employees-loading');
          this.cdr.detectChanges();
        })
      )
      .subscribe();
  }


  loadEmployeeDetails(employeeId: string): void {
    this.isLoading = true;
    this.loadingService.start('employee-details', 'Chargement des détails...');
    
    this.userService.getEmployeeById(employeeId)
      .pipe(
        tap(employee => {
          this.selectedEmployee = employee;
          this.cdr.detectChanges();
        }),
        catchError(error => {
          this.notificationService.error('Erreur', 'Erreur lors du chargement des détails employé');
          console.error('Erreur chargement détails employé:', error);
          return of(null);
        }),
        finalize(() => {
          this.isLoading = false;
          this.loadingService.stop('employee-details');
          this.cdr.detectChanges();
        })
      )
      .subscribe();
  }

  loadUserStats(): void {
    this.userService.getUserStats()
      .pipe(
        tap(stats => {
          this.stats = {
            totalEmployees: stats.totalEmployees,
            activeEmployees: stats.activeUsers,
            totalAdmins: stats.totalAdmins,
            newEmployeesThisMonth: stats.newUsersThisMonth,
            employeeGrowthRate: stats.userGrowthRate,
            averageTenure: 0 // À calculer selon les données réelles
          };
          this.cdr.detectChanges();
        }),
        catchError(error => {
          console.error('Erreur chargement statistiques:', error);
          return of(null);
        })
      )
      .subscribe();
  }
  // Actions CRUD
  addNewEmployee(): void {
    this.setView('registration');
  }

  editEmployee(employee: EmployeeProfileDto): void {
    this.selectedEmployee = employee;
    this.isEditing = true;
    this.employeeForm.patchValue({
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      phoneNumber: employee.phoneNumber,
      position: employee.position,
      profilePictureUrl: employee.profilePictureUrl
    });
  }

  saveEmployee(): void {
    if (this.employeeForm.valid) {
      const formData = this.employeeForm.value;
      this.isLoading = true;
      
      if (this.selectedEmployee) {
        // Mise à jour d'un employé existant
        const updateData: UpdateEmployeeDto = {
          appUserId: this.selectedEmployee.appUserId,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          position: formData.position,
          phoneNumber: formData.phoneNumber,
          profilePictureUrl: formData.profilePictureUrl
        };
        
        this.loadingService.start('employee-update', 'Mise à jour de l\'employé...');
        
        this.userService.updateEmployee(this.selectedEmployee.appUserId, updateData)
          .pipe(
            tap(() => {
              // Mettre à jour les données locales
              const index = this.employees.findIndex(e => e.appUserId === this.selectedEmployee!.appUserId);
              if (index !== -1) {
                this.employees[index] = { ...this.employees[index], ...formData };
              }
              this.updateStats();
              this.notificationService.success('Succès', 'Employé mis à jour avec succès');
              this.cdr.detectChanges();
            }),
            catchError(error => {
              this.notificationService.error('Erreur', 'Erreur lors de la mise à jour de l\'employé');
              console.error('Erreur mise à jour employé:', error);
              return of(null);
            }),
            finalize(() => {
              this.isLoading = false;
              this.loadingService.stop('employee-update');
              this.isEditing = false;
              this.selectedEmployee = null;
              this.cdr.detectChanges();
            })
          )
          .subscribe();
      }
    }
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.selectedEmployee = null;
    this.employeeForm.reset();
  }

  resetEmployeePassword(employee: EmployeeProfileDto): void {
    this.selectedEmployee = employee;
    this.isResettingPassword = true;
  }

  onPasswordReset(passwordData: any): void {
    if (this.selectedEmployee) {
      this.isLoading = true;
      this.loadingService.start('password-reset', 'Réinitialisation du mot de passe...');
      
      const resetData: ChangeEmployeePasswordDto = {
        appUserId: this.selectedEmployee.appUserId,
        oldPassword: '', // L'admin n'a pas besoin de l'ancien mot de passe
        newPassword: passwordData.newPassword,
        confirmNewPassword: passwordData.confirmPassword
      };
      
      this.userService.changeEmployeePassword(resetData)
        .pipe(
          tap(() => {
            this.notificationService.success('Succès', 'Mot de passe réinitialisé avec succès');
            this.isResettingPassword = false;
            this.selectedEmployee = null;
            this.cdr.detectChanges();
          }),
          catchError(error => {
            this.notificationService.error('Erreur', 'Erreur lors de la réinitialisation du mot de passe');
            console.error('Erreur réinitialisation mot de passe:', error);
            return of(null);
          }),
          finalize(() => {
            this.isLoading = false;
            this.loadingService.stop('password-reset');
            this.cdr.detectChanges();
          })
        )
        .subscribe();
    }
  }

  cancelPasswordReset(): void {
    this.isResettingPassword = false;
    this.selectedEmployee = null;
  }

  deleteEmployee(employee: EmployeeProfileDto): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer l'employé ${employee.firstName} ${employee.lastName} ?`)) {
      this.isLoading = true;
      this.loadingService.start('employee-delete', 'Suppression de l\'employé...');
      
      // Note: L'API ne fournit pas de méthode deleteEmployee, on utilise deactivateUser
      this.userService.deactivateUser(employee.appUserId)
        .pipe(
          tap(() => {
            this.employees = this.employees.filter(e => e.appUserId !== employee.appUserId);
            this.updateStats();
            this.notificationService.success('Succès', 'Employé désactivé avec succès');
            this.cdr.detectChanges();
          }),
          catchError(error => {
            this.notificationService.error('Erreur', 'Erreur lors de la suppression de l\'employé');
            console.error('Erreur suppression employé:', error);
            return of(null);
          }),
          finalize(() => {
            this.isLoading = false;
            this.loadingService.stop('employee-delete');
            this.cdr.detectChanges();
          })
        )
        .subscribe();
    }
  }

  // Gestion des filtres
  private initializeFilters(): void {
    this.filterGroups = [
      {
        id: 'role',
        label: 'Rôle',
        type: 'select',
        options: [
          { id: 'admin', label: 'Admin', value: UserRole.Admin },
          { id: 'employee', label: 'Employé', value: UserRole.Employee },
          { id: 'user', label: 'Utilisateur', value: UserRole.User }
        ]
      },
      {
        id: 'status',
        label: 'Statut',
        type: 'select',
        options: [
          { id: 'active', label: 'Actif', value: 'active' },
          { id: 'inactive', label: 'Inactif', value: 'inactive' }
        ]
      },
      {
        id: 'department',
        label: 'Département',
        type: 'select',
        options: [
          { id: 'projection', label: 'Projection', value: 'projection' },
          { id: 'reception', label: 'Accueil', value: 'reception' },
          { id: 'administration', label: 'Administration', value: 'administration' },
          { id: 'maintenance', label: 'Maintenance', value: 'maintenance' }
        ]
      }
    ];
  }

  onFiltersChange(filters: FilterGroup[]): void {
    console.log('Filtres modifiés:', filters);
  }

  onFiltersApply(filters: FilterGroup[]): void {
    console.log('Filtres appliqués:', filters);
    this.appliedFilters = filters
      .filter(group => group.value && (Array.isArray(group.value) ? group.value.length > 0 : true))
      .map(group => ({
        groupId: group.id,
        label: group.label,
        value: group.value,
        displayValue: this.getFilterDisplayValue(group)
      }));
    
    this.applyFiltersToData();
  }

  onFiltersReset(): void {
    console.log('Filtres réinitialisés');
    this.appliedFilters = [];
    this.applyFiltersToData();
  }

  onFilterRemove(filter: AppliedFilter): void {
    console.log('Filtre supprimé:', filter);
    this.appliedFilters = this.appliedFilters.filter(f => f.groupId !== filter.groupId);
    this.applyFiltersToData();
  }

  private applyFiltersToData(): void {
    console.log('Filtres appliqués aux données:', this.appliedFilters);
    this.cdr.detectChanges();
  }

  private getFilterDisplayValue(group: FilterGroup): string {
    if (!group.value) return '';
    
    if (Array.isArray(group.value)) {
      return group.value.map(val => {
        const option = group.options?.find(opt => opt.value === val);
        return option ? option.label : String(val);
      }).join(', ');
    } else {
      const option = group.options?.find(opt => opt.value === group.value);
      return option ? option.label : String(group.value);
    }
  }

  // Mise à jour des statistiques
  private updateStats(): void {
    this.stats = {
      totalEmployees: this.employees.length,
      activeEmployees: this.employees.length, // À adapter selon les données réelles
      totalAdmins: this.employees.filter(e => e.role === UserRole.Admin).length,
      newEmployeesThisMonth: 0, // À calculer selon les données réelles
      employeeGrowthRate: 0, // À calculer selon les données réelles
      averageTenure: 0 // À calculer selon les données réelles
    };
  }

  // Gestion des événements de la table
  onTableAction(event: { action: string; row: any }): void {
    const employee = event.row as EmployeeProfileDto;
    
    switch (event.action) {
      case 'edit':
        this.editEmployee(employee);
        break;
      case 'reset-password':
        this.resetEmployeePassword(employee);
        break;
      case 'delete':
        this.deleteEmployee(employee);
        break;
    }
  }

  onTableRowSelected(row: any): void {
    const employee = row as EmployeeProfileDto;
    this.setView('details', employee);
  }

  // Getters pour les données de la table
  get tableData(): TableData {
    return {
      columns: this.tableColumns,
      rows: this.employees.map(employee => ({
        ...employee,
        role: this.getRoleDisplayName(employee.role),
        hiredDate: employee.hiredDate,
        profilePictureUrl: employee.profilePictureUrl || '/assets/images/default-avatar.png'
      })),
      totalCount: this.employees.length
    };
  }

  // Utilitaires d'affichage
  getRoleDisplayName(role: UserRole): string {
    switch (role) {
      case UserRole.Admin:
        return 'Admin';
      case UserRole.Employee:
        return 'Employé';
      case UserRole.User:
        return 'Utilisateur';
      default:
        return 'Inconnu';
    }
  }

  getRoleBadgeVariant(role: UserRole): 'primary' | 'secondary' | 'error' | 'info' {
    switch (role) {
      case UserRole.Admin:
        return 'error';
      case UserRole.Employee:
        return 'primary';
      case UserRole.User:
        return 'secondary';
      default:
        return 'secondary';
    }
  }

  // Gestion des événements du composant d'enregistrement
  onEmployeeRegistered(event: any): void {
    const employee = event as EmployeeProfileDto;
    this.employees.push(employee);
    this.updateStats();
    this.setView('list');
    this.notificationService.success('Succès', 'Employé créé avec succès');
    this.cdr.detectChanges();
  }

  onRegistrationCancelled(): void {
    this.setView('list');
  }

  // Gestion des événements de la table
  onTableSearch(term: string): void {
    this.searchTerm = term;
    console.log('Recherche table:', term);
  }

  onTableFilter(filters: any): void {
    console.log('Filtres table:', filters);
  }

  onTableSort(sort: { column: string; direction: 'asc' | 'desc' }): void {
    console.log('Tri table:', sort);
  }

  onTablePage(page: { page: number; pageSize: number }): void {
    console.log('Page table:', page);
  }

  onTableSelection(selection: any[]): void {
    console.log('Sélection table:', selection);
  }
}