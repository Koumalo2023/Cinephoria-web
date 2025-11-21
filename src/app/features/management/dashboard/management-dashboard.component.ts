
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';


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


