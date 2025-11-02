import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ContactPageComponent } from 'src/app/shared/components/organisms/contact-page/contact-page.component';

@Component({
  selector: 'app-contact',
  imports: [ContactPageComponent],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactComponent {

}
