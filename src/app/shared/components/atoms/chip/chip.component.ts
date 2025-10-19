import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ChipVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'outline';
export type ChipSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'app-chip',
  templateUrl: './chip.component.html',
  styleUrls: ['./chip.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class ChipComponent {
  @Input() variant: ChipVariant = 'primary';
  @Input() size: ChipSize = 'medium';
  @Input() removable: boolean = false;
  @Input() disabled: boolean = false;
  @Input() selected: boolean = false;
  @Input() avatar: string = '';
  @Input() avatarAlt: string = '';
  @Input() icon: string = '';
  
  @Output() removed = new EventEmitter<void>();
  @Output() selectedChange = new EventEmitter<boolean>();

  get chipClasses(): string {
    const classes = [
      'chip',
      `chip--${this.variant}`,
      `chip--${this.size}`,
      this.disabled ? 'chip--disabled' : '',
      this.selected ? 'chip--selected' : '',
      this.removable ? 'chip--removable' : '',
      this.avatar ? 'chip--has-avatar' : '',
      this.icon ? 'chip--has-icon' : ''
    ];
    
    return classes.filter(c => c).join(' ');
  }

  onRemove(event: Event): void {
    event.stopPropagation();
    if (!this.disabled && this.removable) {
      this.removed.emit();
    }
  }

  toggleSelection(): void {
    if (!this.disabled) {
      this.selected = !this.selected;
      this.selectedChange.emit(this.selected);
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault();
      this.toggleSelection();
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      this.onRemove(event);
    }
  }
}
