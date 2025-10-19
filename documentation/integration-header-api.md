# Intégration du Header avec l'API - Documentation

## Vue d'ensemble

L'intégration du composant header avec l'API d'authentification a été finalisée avec une architecture robuste qui gère l'état de l'utilisateur connecté et la navigation par rôle.

## Architecture des Services

### Services Créés

1. **UserStateService** (`user-state.service.ts`)
   - Gestion centralisée de l'état de l'utilisateur
   - Observables pour les changements d'état
   - Persistance dans le localStorage
   - Vérification de la validité du token JWT

2. **AuthManagerService** (`auth-manager.service.ts`)
   - Service unifié d'authentification
   - Combinaison des services API et local
   - Gestion des erreurs et redirections
   - Rafraîchissement automatique du profil

### Services Existants

- **ApiAuthService** (`api/auth.service.ts`) - Communication avec l'API backend
- **LocalAuthService** (`auth/auth.service.ts`) - Gestion locale du token

## Intégration du Header

### Modifications Apportées

1. **HeaderComponent** (`header.component.ts`)
   - Suppression de l'input `currentUser` simulé
   - Intégration avec `UserStateService` via observables
   - Gestion automatique des changements d'état
   - Déconnexion via le service unifié

2. **Layouts** (`main-layout.component.ts`, `admin-layout.component.ts`)
   - Utilisation du `UserStateService` pour l'état utilisateur
   - Suppression des données utilisateur simulées
   - Gestion des abonnements pour éviter les fuites mémoire

## Flux d'Authentification

### Connexion
1. L'utilisateur remplit le formulaire de connexion
2. `AuthManagerService.login()` est appelé
3. En cas de succès, `UserStateService.setUser()` met à jour l'état
4. Redirection automatique selon le rôle utilisateur

### Navigation par Rôle
- **User (0)** → `/user/dashboard`
- **Employee (1)** → `/employee/dashboard` 
- **Admin (2)** → `/admin/dashboard`

### Déconnexion
1. Appel à `UserStateService.logout()`
2. Nettoyage du localStorage
3. Redirection vers la page d'accueil
4. Mise à jour automatique du header

## Gestion d'État

### Observables Disponibles
```typescript
// Statut d'authentification
userStateService.isAuthenticated$

// Données utilisateur
userStateService.currentUser$

// Vérification de rôle
userStateService.hasRole$(role)
userStateService.isAdmin$()
userStateService.isEmployee$()
```

### Persistance
- Token JWT stocké dans `localStorage`
- Données utilisateur sérialisées
- Conversion automatique des dates

## Sécurité

### Validation du Token
- Vérification de l'expiration JWT
- Détection automatique des tokens invalides
- Déconnexion forcée en cas d'erreur

### Gestion des Erreurs
- Messages d'erreur utilisateur-friendly
- Logs détaillés en console
- Redirections appropriées

## Composant de Connexion

### Fonctionnalités
- Formulaire réactif avec validation
- Gestion des états de chargement
- Redirection automatique selon le rôle
- Interface responsive et moderne

### Validation
- Email format valide
- Mot de passe minimum 6 caractères
- Messages d'erreur contextuels

## Tests et Débogage

### Points de Contrôle
1. Vérifier que le header affiche l'état correct
2. Tester la navigation par rôle après connexion
3. Vérifier la persistance après rechargement
4. Tester la déconnexion et redirection

### Logs Disponibles
- Connexion/déconnexion réussie
- Erreurs d'authentification
- Changements d'état utilisateur

## Améliorations Futures

1. **Rafraîchissement automatique du token**
2. **Gestion des sessions multiples**
3. **Support multi-langues**
4. **Intégration avec les notifications**
5. **Mode hors ligne limité**

## Conclusion

L'intégration du header avec l'API est maintenant complète et fonctionnelle. L'architecture mise en place permet une gestion robuste de l'authentification avec une expérience utilisateur fluide et sécurisée.