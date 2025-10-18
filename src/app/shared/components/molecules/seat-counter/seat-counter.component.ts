import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-seat-counter',
  imports: [],
  templateUrl: './seat-counter.component.html',
  styleUrl: './seat-counter.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeatCounterComponent {

}
