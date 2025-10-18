import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../../atoms/icon/icon.component';
import { BadgeComponent } from '../../atoms/badge/badge.component';

export interface LegendItem {
  type: 'type' | 'status';
  key: string;
  label: string;
  color: string;
  icon?: string;
  description?: string;
}

@Component({
  selector: 'app-seat-legend',
  standalone: true,
  imports: [CommonModule, IconComponent, BadgeComponent],
  templateUrl: './seat-legend.component.html',
  styleUrl: './seat-legend.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeatLegendComponent {
  @Input() title = 'Légende des sièges';
  @Input() showTypes = true;
  @Input() showStatus = true;
  @Input() compact = false;

  get legendItems(): LegendItem[] {
    const items: LegendItem[] = [];

    if (this.showTypes) {
      items.push(
        {
          type: 'type',
          key: 'standard',
          label: 'Standard',
          color: '#e9ecef',
          icon: 'chair',
          description: 'Siège standard'
        },
        {
          type: 'type',
          key: 'premium',
          label: 'Premium',
          color: '#fff3cd',
          icon: 'star',
          description: 'Siège premium avec plus d\'espace'
        },
        {
          type: 'type',
          key: 'vip',
          label: 'VIP',
          color: '#ffd700',
          icon: 'crown',
          description: 'Siège VIP avec service exclusif'
        },
        {
          type: 'type',
          key: 'handicap',
          label: 'Handicapé',
          color: '#d1ecf1',
          icon: 'wheelchair',
          description: 'Siège adapté PMR'
        }
      );
    }

    if (this.showStatus) {
      items.push(
        {
          type: 'status',
          key: 'available',
          label: 'Disponible',
          color: '#28a745',
          icon: 'check',
          description: 'Siège disponible'
        },
        {
          type: 'status',
          key: 'selected',
          label: 'Sélectionné',
          color: '#007bff',
          icon: 'check-circle',
          description: 'Siège sélectionné'
        },
        {
          type: 'status',
          key: 'occupied',
          label: 'Occupé',
          color: '#dc3545',
          icon: 'user',
          description: 'Siège déjà occupé'
        },
        {
          type: 'status',
          key: 'reserved',
          label: 'Réservé',
          color: '#ffc107',
          icon: 'lock',
          description: 'Siège réservé'
        },
        {
          type: 'status',
          key: 'blocked',
          label: 'Bloqué',
          color: '#6c757d',
          icon: 'ban',
          description: 'Siège bloqué'
        }
      );
    }

    return items;
  }

  getTypeItems(): LegendItem[] {
    return this.legendItems.filter(item => item.type === 'type');
  }

  getStatusItems(): LegendItem[] {
    return this.legendItems.filter(item => item.type === 'status');
  }

  getIconVariant(item: LegendItem): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'muted' {
    switch (item.key) {
      case 'available':
      case 'selected':
        return 'success';
      case 'occupied':
        return 'error';
      case 'reserved':
        return 'warning';
      case 'blocked':
        return 'muted';
      default:
        return 'primary';
    }
  }

  getItemClasses(item: LegendItem): string {
    const baseClass = 'legend-item';
    const typeClass = `legend-item--${item.type}`;
    const keyClass = `legend-item--${item.key}`;
    
    if (this.compact) {
      return `${baseClass} ${typeClass} ${keyClass} legend-item--compact`;
    }
    
    return `${baseClass} ${typeClass} ${keyClass}`;
  }

  getBadgeVariant(item: LegendItem): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' {
    switch (item.key) {
      case 'available':
      case 'selected':
        return 'success';
      case 'occupied':
        return 'error';
      case 'reserved':
        return 'warning';
      case 'blocked':
        return 'secondary';
      case 'vip':
        return 'warning';
      case 'premium':
        return 'info';
      case 'handicap':
        return 'info';
      default:
        return 'primary';
    }
  }
}
