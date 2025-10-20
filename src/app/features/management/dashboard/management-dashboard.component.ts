
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

// Services

// Interfaces

// Composants réutilisables

// Atoms

// Molecules

@Component({
  selector: 'app-management-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    
  ],
  templateUrl: './management-dashboard.component.html',
  styleUrl: './management-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ManagementDashboardComponent  {
  
}


