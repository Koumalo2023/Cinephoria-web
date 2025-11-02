import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-user-layout',
  imports: [],
  templateUrl: './user-layout.component.html',
  styleUrl: './user-layout.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true
})
export class UserLayoutComponent {

}
