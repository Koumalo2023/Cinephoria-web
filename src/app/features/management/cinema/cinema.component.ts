import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CinemaManagementComponent } from 'src/app/shared/components/organisms/cinema-management/cinema-management.component';

@Component({
  selector: 'app-cinema',
  imports: [CinemaManagementComponent],
  templateUrl: './cinema.component.html',
  styleUrl: './cinema.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CinemaComponent {

}
