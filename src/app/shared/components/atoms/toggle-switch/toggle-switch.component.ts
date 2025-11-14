import { CommonModule } from '@angular/common';
import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-toggle-switch',
  standalone: true,
  imports: [CommonModule],
  template: `
    <label class="toggle-wrapper" [class.toggle--disabled]="disabled">
      <input
        type="checkbox"
        [checked]="checked"
        [disabled]="disabled"
        (change)="onToggle($event)"
        class="toggle-input"
        [attr.aria-label]="label">
      <span class="toggle-slider" [class.toggle--checked]="checked">
        <span class="toggle-handle"></span>
      </span>
      @if (label) {
        <span class="toggle-label">{{ label }}</span>
      }
    </label>
  `,
  styleUrls: ['./toggle-switch.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ToggleSwitchComponent),
      multi: true
    }
  ]
})
export class ToggleSwitchComponent implements ControlValueAccessor {
  @Input() checked: boolean = false;
  @Input() disabled: boolean = false;
  @Input() label: string = '';
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  
  @Output() toggleChange = new EventEmitter<boolean>();

  private onChange: (value: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  onToggle(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.checked = input.checked;
    this.onChange(this.checked);
    this.onTouched();
    this.toggleChange.emit(this.checked);
  }

  // ControlValueAccessor implementation
  writeValue(value: boolean): void {
    this.checked = value;
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}