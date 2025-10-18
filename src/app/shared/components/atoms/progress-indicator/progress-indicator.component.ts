import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ProgressIndicatorSize = 'small' | 'medium' | 'large';
export type ProgressIndicatorVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error';

export interface ProgressStep {
  id: string | number;
  label: string;
  description?: string;
  completed?: boolean;
  active?: boolean;
  disabled?: boolean;
}

@Component({
  selector: 'app-progress-indicator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './progress-indicator.component.html',
  styleUrls: ['./progress-indicator.component.scss']
})
export class ProgressIndicatorComponent {
  @Input() steps: ProgressStep[] = [];
  @Input() currentStep: number = 0;
  @Input() size: ProgressIndicatorSize = 'medium';
  @Input() variant: ProgressIndicatorVariant = 'primary';
  @Input() showLabels: boolean = true;
  @Input() showDescriptions: boolean = false;
  @Input() clickable: boolean = false;

  // Classes CSS pour le conteneur
  get containerClasses(): string {
    return [
      'progress-indicator',
      `progress-indicator--${this.size}`,
      `progress-indicator--${this.variant}`
    ].join(' ').trim();
  }

  // Classes CSS pour chaque étape
  getStepClasses(step: ProgressStep, index: number): string {
    return [
      'progress-indicator__step',
      step.completed ? 'progress-indicator__step--completed' : '',
      step.active ? 'progress-indicator__step--active' : '',
      step.disabled ? 'progress-indicator__step--disabled' : '',
      index <= this.currentStep ? 'progress-indicator__step--visited' : '',
      this.clickable && !step.disabled ? 'progress-indicator__step--clickable' : ''
    ].join(' ').trim();
  }

  // Gérer le clic sur une étape
  onStepClick(step: ProgressStep, index: number): void {
    if (this.clickable && !step.disabled && index <= this.currentStep) {
      // Émettre un événement ou permettre la navigation
      // Cette logique peut être étendue selon les besoins
    }
  }

  // Calculer la progression en pourcentage
  get progressPercentage(): number {
    if (this.steps.length === 0) return 0;
    return (this.currentStep / (this.steps.length - 1)) * 100;
  }

  // Vérifier si une étape est accessible
  isStepAccessible(index: number): boolean {
    return this.clickable && index <= this.currentStep;
  }
}
