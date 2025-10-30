# Plan de Mise en Place - Page de Gestion des Séances

## 📋 Analyse du Contexte Actuel

### Structure Existante
- **Composant de base** : [`ShowtimeComponent`](src/app/features/management/showtimes/showtime.component.ts) - squelette vide
- **Interfaces** : Toutes les interfaces nécessaires sont définies dans [`core.interfaces.ts`](src/app/core/interfaces/core.interfaces.ts)
- **Services API** : Tous les services nécessaires existent et sont fonctionnels
- **Composants réutilisables** : Plusieurs composants disponibles pour la réutilisation

### Interfaces Clés Identifiées
- [`ShowtimeDto`](src/app/core/interfaces/core.interfaces.ts:188) - Interface principale des séances
- [`CreateShowtimeDto`](src/app/core/interfaces/core.interfaces.ts:701) - Création de séance
- [`UpdateShowtimeDto`](src/app/core/interfaces/core.interfaces.ts:716) - Mise à jour de séance
- [`MovieDto`](src/app/core/interfaces/core.interfaces.ts:133) - Interface des films
- [`TheaterDto`](src/app/core/interfaces/core.interfaces.ts:276) - Interface des salles
- [`CinemaDto`](src/app/core/interfaces/core.interfaces.ts:261) - Interface des cinémas

### Services API Disponibles
- [`ShowtimeService`](src/app/core/services/api/showtime.service.ts) - Gestion complète des séances
- [`MovieService`](src/app/core/services/api/movie.service.ts) - Gestion des films
- [`TheaterService`](src/app/core/services/api/theater.service.ts) - Gestion des salles
- [`CinemaService`](src/app/core/services/api/cinema.service.ts) - Gestion des cinémas

## 🎯 Objectifs Fonctionnels

### Fonctionnalités Principales
1. **Consultation des séances** - Liste complète avec filtres
2. **Création de séances** - Formulaire de création avec validation
3. **Modification de séances** - Édition des séances existantes
4. **Suppression de séances** - Avec confirmation
5. **Filtrage et recherche** - Par film, cinéma, date, salle
6. **Affichage des disponibilités** - Places restantes et statut

### Fonctionnalités Avancées
1. **Planning visuel** - Vue calendrier/semaine
2. **Statistiques rapides** - Taux d'occupation, revenus
3. **Gestion des conflits** - Vérification des chevauchements
4. **Export/Import** - Format CSV pour planification

## 🏗️ Architecture Technique

### Structure des Composants

```
src/app/features/management/showtimes/
├── showtime.component.ts          # Composant principal
├── showtime.component.html        # Template principal
├── showtime.component.scss        # Styles spécifiques
├── components/                    # Composants enfants
│   ├── showtime-list/             # Liste des séances
│   ├── showtime-form/             # Formulaire création/édition
│   ├── showtime-calendar/         # Vue calendrier
│   └── showtime-filters/          # Filtres et recherche
└── services/                      # Services spécifiques
    └── showtime-management.service.ts
```

### Composants Réutilisables à Utiliser

1. **Navigation et Layout**
   - [`ManagementLayoutComponent`](src/app/layouts/management-layout/management-layout.component.ts) - Layout de gestion
   - [`BreadcrumbComponent`](src/app/shared/components/molecules/breadcrumb/breadcrumb.component.ts) - Fil d'Ariane

2. **Formulaires et Inputs**
   - [`FormFieldComponent`](src/app/shared/components/molecules/form-field/form-field.component.ts) - Champs de formulaire
   - [`SelectComponent`](src/app/shared/components/atoms/select/select.component.ts) - Sélecteurs
   - [`DatePickerComponent`](src/app/shared/components/atoms/date-picker/date-picker.component.ts) - Sélecteur de date
   - [`TimePickerComponent`](src/app/shared/components/atoms/time-picker/time-picker.component.ts) - Sélecteur d'heure

3. **Affichage de Données**
   - [`ShowtimeSelectorComponent`](src/app/shared/components/molecules/showtime-selector/showtime-selector.component.ts) - Sélecteur de séances
   - [`TheaterCardComponent`](src/app/shared/components/molecules/theater-card/theater-card.component.ts) - Carte de salle
   - [`PaginationComponent`](src/app/shared/components/molecules/pagination/pagination.component.ts) - Pagination
   - [`SearchBarComponent`](src/app/shared/components/molecules/search-bar/search-bar.component.ts) - Barre de recherche

4. **Feedback Utilisateur**
   - [`ToastNotificationComponent`](src/app/shared/components/atoms/toast-notification/toast-notification.component.ts) - Notifications
   - [`SpinnerComponent`](src/app/shared/components/atoms/spinner/spinner.component.ts) - Indicateur de chargement
   - [`BadgeComponent`](src/app/shared/components/atoms/badge/badge.component.ts) - Badges d'état

## 🔧 Implémentation Détaillée

### Phase 1 : Structure de Base (Jour 1)

#### 1.1. Mise à jour du Composant Principal
```typescript
// showtime.component.ts
- Implémenter OnInit, OnDestroy
- Injecter les services nécessaires
- Gérer l'état local (séances, filtres, chargement)
- Implémenter les méthodes CRUD de base
```

#### 1.2. Template Principal
```html
<!-- showtime.component.html -->
- Header avec titre et bouton d'ajout
- Section filtres avec composant réutilisable
- Section liste des séances avec pagination
- Modal pour création/édition
- Notifications toast
```

#### 1.3. Service de Gestion
```typescript
// showtime-management.service.ts
- Centraliser la logique métier
- Gérer les appels API avec retry
- Gérer le cache et l'état
- Fournir des méthodes utilitaires
```

### Phase 2 : Fonctionnalités CRUD (Jour 2)

#### 2.1. Lecture et Affichage
- Récupérer toutes les séances via [`ShowtimeService.getAllShowtimes()`](src/app/core/services/api/showtime.service.ts:47)
- Afficher dans un tableau avec colonnes : Film, Salle, Date/Heure, Places, Statut, Actions
- Implémenter le tri par colonnes
- Ajouter la pagination avec [`PaginationComponent`](src/app/shared/components/molecules/pagination/pagination.component.ts)

#### 2.2. Création de Séance
- Formulaire modal avec [`CreateShowtimeDto`](src/app/core/interfaces/core.interfaces.ts:701)
- Champs : Film (select), Salle (select), Date/Heure, Qualité, Prix
- Validation : Pas de chevauchement, salle disponible
- Appel à [`ShowtimeService.createShowtime()`](src/app/core/services/api/showtime.service.ts:23)

#### 2.3. Édition de Séance
- Formulaire pré-rempli avec [`UpdateShowtimeDto`](src/app/core/interfaces/core.interfaces.ts:716)
- Validation des modifications
- Appel à [`ShowtimeService.updateShowtime()`](src/app/core/services/api/showtime.service.ts:31)

#### 2.4. Suppression de Séance
- Confirmation avant suppression
- Vérifier s'il y a des réservations
- Appel à [`ShowtimeService.deleteShowtime()`](src/app/core/services/api/showtime.service.ts:39)

### Phase 3 : Filtrage et Recherche (Jour 3)

#### 3.1. Filtres Avancés
- Par cinéma (select avec [`CinemaService.getAllCinemas()`](src/app/core/services/api/cinema.service.ts:29))
- Par film (select avec [`MovieService.getAllMovies()`](src/app/core/services/api/movie.service.ts:43))
- Par salle (select avec [`TheaterService.getAllTheaters()`](src/app/core/services/api/theater.service.ts:23))
- Par date (date picker avec plage)
- Par statut (disponible, complet, annulé)

#### 3.2. Recherche Texte
- Recherche par nom de film, salle, cinéma
- Utiliser [`SearchBarComponent`](src/app/shared/components/molecules/search-bar/search-bar.component.ts)
- Recherche en temps réel avec debounce

#### 3.3. Filtres Combinés
- Combinaison de plusieurs filtres
- Réinitialisation des filtres
- Sauvegarde des préférences utilisateur

### Phase 4 : Interface Avancée (Jour 4)

#### 4.1. Vue Calendrier
- Affichage semaine/mois avec séances
- Glisser-déposer pour modification
- Indicateurs visuels de disponibilité
- Intégration avec [`ShowtimeSelectorComponent`](src/app/shared/components/molecules/showtime-selector/showtime-selector.component.ts)

#### 4.2. Statistiques Rapides
- Nombre de séances aujourd'hui/demain
- Taux d'occupation moyen
- Revenus estimés
- Alertes de séances complètes

#### 4.3. Responsive Design
- Adaptation mobile/tablette
- Menu contextuel sur mobile
- Gestures tactiles pour calendrier

## 🎨 Design et UX

### Palette de Couleurs
- **Primaire** : Bleu Cinephoria (#1E40AF)
- **Secondaire** : Orange (#F59E0B)
- **Succès** : Vert (#10B981)
- **Alerte** : Orange (#F59E0B)
- **Erreur** : Rouge (#EF4444)

### États Visuels
- **Disponible** : Vert avec icône check
- **Complet** : Rouge avec icône fermé
- **Bientôt complet** : Orange avec icône alerte
- **En cours** : Bleu avec icône horloge
- **Terminé** : Gris avec icône terminé

### Interactions
- **Hover** : Surbrillance avec informations supplémentaires
- **Clic** : Sélection avec feedback visuel
- **Glisser** : Réorganisation dans le calendrier
- **Double-clic** : Édition rapide

## 🔒 Gestion des Erreurs

### Types d'Erreurs Gérées
1. **Erreurs Réseau** : Retry automatique avec backoff
2. **Erreurs Validation** : Messages contextuels dans le formulaire
3. **Erreurs Conflits** : Gestion des chevauchements de séances
4. **Erreurs Autorisation** : Redirection vers login si nécessaire

### Messages d'Erreur Utilisateur
- Clairs et contextuels
- Avec suggestions de correction
- Traduits en français
- Cohérents avec le design system

## 📊 Métriques de Performance

### Optimisations à Implémenter
1. **Lazy Loading** : Chargement paginé des séances
2. **Cache** : Mise en cache des films, salles, cinémas
3. **Debounce** : Recherche avec délai de 300ms
4. **Virtual Scrolling** : Pour les longues listes
5. **Preloading** : Données fréquemment utilisées

### Objectifs de Performance
- **Temps de chargement initial** : < 2 secondes
- **Temps de réponse aux actions** : < 500ms
- **Usage mémoire** : < 50MB
- **Compatibilité** : Navigateurs modernes + IE11

## 🧪 Tests à Implémenter

### Tests Unitaires
- Composant principal et enfants
- Services de gestion
- Utilitaires et helpers
- Validateurs de formulaire

### Tests d'Intégration
- Flux complet CRUD
- Filtrage et recherche
- Interactions utilisateur
- Gestion d'erreurs

### Tests E2E
- Scénarios utilisateur complets
- Données de test réalistes
- Couverture des cas limites

## 📅 Planning de Développement

### Semaine 1 : Fondations
- **Jour 1-2** : Structure et CRUD de base
- **Jour 3** : Filtrage et recherche
- **Jour 4** : Interface avancée
- **Jour 5** : Tests et optimisation

### Semaine 2 : Perfectionnement
- **Jour 6-7** : Refactoring et améliorations
- **Jour 8** : Tests complets
- **Jour 9** : Documentation
- **Jour 10** : Revue et déploiement

## 🔄 Intégration Continue

### Points d'Intégration
1. **API Backend** : Tous les endpoints testés et fonctionnels
2. **Design System** : Respect des composants réutilisables
3. **Authentification** : Intégration avec le service auth existant
4. **Routing** : Intégration dans le module de gestion

### Dépendances
- Angular 16+
- Services API existants
- Composants shared réutilisables
- Design system Cinephoria

## 🚀 Livrables Attendus

### Fonctionnel
- [x] Consultation complète des séances
- [x] Création/édition/suppression de séances
- [x] Filtrage et recherche avancés
- [x] Vue calendrier interactive
- [x] Gestion d'erreurs complète

### Technique
- [x] Code propre et documenté
- [x] Tests unitaires et d'intégration
- [x] Performance optimisée
- [x] Accessibilité respectée

### Utilisateur
- [x] Interface intuitive et responsive
- [x] Feedback utilisateur clair
- [x] Documentation utilisateur
- [x] Formation équipe support

---

**Statut** : Plan validé et prêt pour l'implémentation  
**Priorité** : Haute  
**Complexité** : Moyenne  
**Durée estimée** : 2 semaines  
**Équipe** : 1 développeur frontend