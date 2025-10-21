import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TheaterManagementComponent } from 'src/app/shared/components/organisms/theater-management/theater-management.component';

@Component({
  selector: 'app-theater',
  imports: [TheaterManagementComponent],
  templateUrl: './theater.component.html',
  styleUrl: './theater.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TheaterComponent {

}
