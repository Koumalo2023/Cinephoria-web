# Utilisation de FontAwesome dans Cinephoria

## Installation

FontAwesome a été installé avec les packages suivants :
- `@fortawesome/fontawesome-svg-core` - Core de FontAwesome
- `@fortawesome/angular-fontawesome@0.14.0` - Intégration Angular
- `@fortawesome/free-solid-svg-icons` - Icônes solides
- `@fortawesome/free-regular-svg-icons` - Icônes régulières
- `@fortawesome/free-brands-svg-icons` - Icônes de marques

## Configuration

L'application utilise Angular standalone components. FontAwesome est configuré directement dans chaque composant qui l'utilise.

## Utilisation dans un composant

### 1. Importer les dépendances nécessaires

```typescript
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faHome, faFilm, faUser } from '@fortawesome/free-solid-svg-icons';
```

### 2. Ajouter FaIconComponent aux imports du composant

```typescript
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [FaIconComponent, /* autres imports */],
  // ...
})
```

### 3. Déclarer les icônes dans la classe

```typescript
export class ExampleComponent {
  faHome = faHome;
  faFilm = faFilm;
  faUser = faUser;
}
```

### 4. Utiliser dans le template

```html
<fa-icon [icon]="faHome"></fa-icon> Accueil
<fa-icon [icon]="faFilm"></fa-icon> Films
<fa-icon [icon]="faUser"></fa-icon> Profil
```

## Types d'icônes disponibles

### Icônes solides (remplies)
```typescript
import { 
  faHome, faFilm, faUser, 
  faSearch, faBars, faTimes,
  faPlus, faEdit, faTrash,
  faStar, faHeart, faCalendar
} from '@fortawesome/free-solid-svg-icons';
```

### Icônes régulières (contour)
```typescript
import { 
  faStar as farStar, 
  faHeart as farHeart,
  faUser as farUser
} from '@fortawesome/free-regular-svg-icons';
```

### Icônes de marques
```typescript
import { 
  faFacebook, faTwitter, 
  faInstagram, faGoogle
} from '@fortawesome/free-brands-svg-icons';
```

## Personnalisation des icônes

### Taille
```html
<fa-icon [icon]="faHome" size="xs"></fa-icon>  <!-- Extra small -->
<fa-icon [icon]="faHome" size="sm"></fa-icon>  <!-- Small -->
<fa-icon [icon]="faHome" size="lg"></fa-icon>  <!-- Large -->
<fa-icon [icon]="faHome" size="2x"></fa-icon>  <!-- 2x -->
<fa-icon [icon]="faHome" size="3x"></fa-icon>  <!-- 3x -->
```

### Couleur
```html
<fa-icon [icon]="faHome" style="color: red;"></fa-icon>
```

### Rotation
```html
<fa-icon [icon]="faHome" [rotate]="90"></fa-icon>
<fa-icon [icon]="faHome" [rotate]="180"></fa-icon>
<fa-icon [icon]="faHome" [rotate]="270"></fa-icon>
```

### Animation
```html
<fa-icon [icon]="faHome" [spin]="true"></fa-icon>      <!-- Rotation continue -->
<fa-icon [icon]="faHome" [pulse]="true"></fa-icon>    <!-- Rotation par étapes -->
```

## Exemple complet

```typescript
import { Component } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faHome, faFilm, faUser, faSearch, faStar } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [FaIconComponent],
  template: `
    <nav>
      <a href="/">
        <fa-icon [icon]="faHome" size="lg"></fa-icon>
        Accueil
      </a>
      <a href="/movies">
        <fa-icon [icon]="faFilm" size="lg"></fa-icon>
        Films
      </a>
      <a href="/profile">
        <fa-icon [icon]="faUser" size="lg"></fa-icon>
        Profil
      </a>
      <button>
        <fa-icon [icon]="faSearch"></fa-icon>
        Rechercher
      </button>
      <div class="rating">
        <fa-icon [icon]="faStar" style="color: gold;"></fa-icon>
        <fa-icon [icon]="faStar" style="color: gold;"></fa-icon>
        <fa-icon [icon]="faStar" style="color: gold;"></fa-icon>
        <fa-icon [icon]="faStar" style="color: gold;"></fa-icon>
        <fa-icon [icon]="faStar"></fa-icon>
      </div>
    </nav>
  `,
  styles: [`
    nav {
      display: flex;
      gap: 1rem;
      align-items: center;
    }
    a {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: inherit;
    }
    .rating {
      display: flex;
      gap: 0.2rem;
    }
  `]
})
export class NavigationComponent {
  faHome = faHome;
  faFilm = faFilm;
  faUser = faUser;
  faSearch = faSearch;
  faStar = faStar;
}
```

## Ressources utiles

- [Documentation officielle FontAwesome](https://fontawesome.com/docs)
- [Icônes disponibles](https://fontawesome.com/icons)
- [Angular FontAwesome GitHub](https://github.com/FortAwesome/angular-fontawesome)