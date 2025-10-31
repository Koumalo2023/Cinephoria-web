# Page de Gestion des Séances

## 📋 Vue d'ensemble

La page de gestion des séances permet aux administrateurs et employés de gérer toutes les séances de films dans les cinémas Cinephoria. Elle offre une interface complète pour créer, modifier, supprimer et consulter les séances avec des fonctionnalités avancées de filtrage et de recherche.

## 🎯 Fonctionnalités

### Fonctionnalités Principales
- **Consultation complète** : Liste de toutes les séances avec informations détaillées
- **Création de séances** : Formulaire modal avec validation complète
- **Modification de séances** : Édition en un clic avec pré-remplissage
- **Suppression de séances** : Avec confirmation et vérification des réservations
- **Filtrage avancé** : Par cinéma, film, salle, date
- **Recherche en temps réel** : Par nom de film, salle ou cinéma
- **Statistiques rapides** : Vue d'ensemble des séances et occupation

### Fonctionnalités Avancées
- **Gestion des conflits** : Vérification automatique des chevauchements
- **Calcul automatique** : Durée estimée basée sur le film
- **Indicateurs visuels** : Statut d'occupation avec codes couleur
- **Interface responsive** : Optimisé pour mobile et tablette
- **Pagination** : Gestion des grandes listes de séances

## 🏗️ Architecture

### Structure des Fichiers
```
src/app/features/management/showtimes/
├── showtime.component.ts          # Composant principal
├── showtime.component.html        # Template avec tableaux et formulaires
├── showtime.component.scss        # Styles spécifiques
├── services/
│   └── showtime-management.service.ts  # Service de gestion d'état
└── README.md                      # Documentation
```

### Composants Réutilisables Utilisés
- [`ButtonComponent`](../../shared/components/atoms/button/button.component.ts) - Boutons d'action
- [`PaginationComponent`](../../shared/components/molecules/pagination/pagination.component.ts) - Navigation paginée
- [`BadgeComponent`](../../shared/components/atoms/badge/badge.component.ts) - Indicateurs d'état
- [`FormFieldComponent`](../../shared/components/molecules/form-field/form-field.component.ts) - Champs de formulaire
- [`SelectComponent`](../../shared/components/atoms/select/select.component.ts) - Sélecteurs
- [`DatePickerComponent`](../../shared/components/atoms/date-picker/date-picker.ts) - Sélecteur de date
- [`TimePickerComponent`](../../shared/components/atoms/time-picker/time-picker.component.ts) - Sélecteur d'heure

### Services Utilisés
- [`ShowtimeService`](../../core/services/api/showtime.service.ts) - API des séances
- [`MovieService`](../../core/services/api/movie.service.ts) - API des films
- [`TheaterService`](../../core/services/api/theater.service.ts) - API des salles
- [`CinemaService`](../../core/services/api/cinema.service.ts) - API des cinémas
- [`ShowtimeManagementService`](./services/showtime-management.service.ts) - Gestion d'état local

## 🔧 Utilisation

### Accès à la Page
La page est accessible via la navigation de gestion sous le chemin `/management/showtimes`.

### Création d'une Séance
1. Cliquer sur le bouton "Nouvelle Séance"
2. Remplir le formulaire :
   - **Film** : Sélectionner dans la liste des films disponibles
   - **Cinéma** : Choisir le cinéma (filtre les salles disponibles)
   - **Salle** : Sélectionner une salle opérationnelle
   - **Date et Heure** : Définir le début de la séance
   - **Qualité** : Choisir la qualité de projection
   - **Prix** : Définir le prix de base
   - **Ajustement** : Optionnel, pour tarifs spéciaux
   - **Promotion** : Cocher si séance en promotion
3. Valider avec "Créer la Séance"

### Modification d'une Séance
1. Cliquer sur "Modifier" dans la ligne de la séance
2. Le formulaire se pré-remplit avec les données existantes
3. Modifier les champs nécessaires
4. Valider avec "Modifier la Séance"

### Suppression d'une Séance
1. Cliquer sur "Supprimer" dans la ligne de la séance
2. Confirmer la suppression dans la boîte de dialogue
3. La séance est supprimée si aucune réservation n'existe

### Filtrage et Recherche
- **Recherche texte** : Saisir dans la barre de recherche
- **Filtre par cinéma** : Sélectionner un cinéma spécifique
- **Filtre par film** : Sélectionner un film spécifique
- **Les filtres se combinent** pour affiner les résultats

## 📊 Indicateurs et Statuts

### Statuts d'Occupation
- **🟢 Disponible** (0-49%) : Beaucoup de places disponibles
- **🟡 Presque complet** (50-79%) : Places limitées
- **🟠 Bientôt complet** (80-99%) : Très peu de places
- **🔴 Complet** (100%) : Aucune place disponible
- **🔵 Terminé** : Séance passée

### Badges de Qualité
- **2D Standard** : Projection standard
- **3D** : Projection 3D
- **4DX** : Expérience immersive
- **IMAX** : Format grand écran
- **4K** : Ultra haute définition
- **Dolby Cinema** : Son et image premium

## 🔒 Validation et Sécurité

### Validation des Données
- **Champs requis** : Film, cinéma, salle, date/heure, prix
- **Validation des prix** : Doivent être positifs
- **Vérification des conflits** : Pas de chevauchement dans la même salle
- **Contrôle d'accès** : Réservé aux rôles Admin et Employee

### Gestion des Erreurs
- **Erreurs réseau** : Retry automatique avec backoff
- **Erreurs validation** : Messages contextuels dans le formulaire
- **Erreurs conflits** : Suggestions d'alternatives
- **Erreurs autorisation** : Redirection vers login

## 🎨 Personnalisation

### Variables CSS Personnalisables
```scss
// Couleurs principales
--primary-color: #1e40af;    // Bleu Cinephoria
--secondary-color: #f59e0b;  // Orange
--success-color: #10b981;    // Vert
--warning-color: #f59e0b;    // Orange
--error-color: #ef4444;      // Rouge

// Tailles et espacements
--header-height: 80px;
--sidebar-width: 280px;
--border-radius: 8px;
--shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
```

### Configuration
Le composant peut être configuré via :
- **Taille de page** : Nombre de séances par page (défaut: 10)
- **Délai de recherche** : Temps avant déclenchement (défaut: 300ms)
- **Formats de date** : Personnalisation des formats d'affichage

## 🧪 Tests

### Tests Unitaires Recommandés
```typescript
// Composant principal
- Chargement initial des données
- Filtrage et recherche
- Création/édition/suppression
- Gestion des erreurs

// Service de gestion
- Calcul des statistiques
- Filtrage des séances
- Vérification des conflits
- Gestion d'état
```

### Scénarios de Test
1. **Chargement initial** avec données valides
2. **Chargement avec erreur** de réseau
3. **Création réussie** d'une séance
4. **Création avec conflit** de planning
5. **Filtrage combiné** avec plusieurs critères
6. **Recherche en temps réel** avec résultats
7. **Suppression avec confirmation**

## 🔄 Intégration

### Dépendances
- Angular 16+
- Services API existants
- Composants shared réutilisables
- Design system Cinephoria

### Points d'Intégration
- **Authentification** : Vérification des rôles
- **Navigation** : Intégration dans le layout de gestion
- **API Backend** : Appels aux endpoints existants
- **Design System** : Respect des guidelines

## 📈 Performance

### Optimisations Implémentées
- **Lazy loading** : Chargement paginé des séances
- **Debounce search** : Recherche avec délai de 300ms
- **Cache mémoire** : Données mises en cache localement
- **Virtual scrolling** : Pour les longues listes (optionnel)

### Métriques de Performance
- **Temps de chargement** : < 2 secondes
- **Temps de réponse** : < 500ms pour les actions
- **Usage mémoire** : < 50MB
- **Compatibilité** : Navigateurs modernes + IE11

## 🐛 Dépannage

### Problèmes Courants
1. **Séances non affichées**
   - Vérifier la connexion API
   - Contrôler les filtres appliqués
   - Vérifier les permissions utilisateur

2. **Erreur de création**
   - Vérifier les champs obligatoires
   - Contrôler les conflits de planning
   - Vérifier la disponibilité de la salle

3. **Performance lente**
   - Réduire le nombre de séances par page
   - Optimiser les requêtes API
   - Vérifier la connexion réseau

### Logs et Debug
- **Console navigateur** : Erreurs JavaScript et API
- **Network tab** : Requêtes HTTP et réponses
- **Application state** : État du service de gestion

## 📝 Notes de Version

### v1.0.0 (Initiale)
- ✅ Consultation complète des séances
- ✅ CRUD complet avec validation
- ✅ Filtrage et recherche avancés
- ✅ Statistiques et indicateurs
- ✅ Interface responsive

### Prochaines Versions
- 🔄 Vue calendrier interactive
- 🔄 Export/Import CSV
- 🔄 Notifications en temps réel
- 🔄 Analytics avancés

---

**Dernière mise à jour** : 29/10/2025  
**Auteur** : Équipe Développement Cinephoria  
**Contact** : dev@cinephoria.com