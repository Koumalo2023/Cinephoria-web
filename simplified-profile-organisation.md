# Organisation du SimplifiedProfileComponent

## Vue d'ensemble
Le SimplifiedProfileComponent devient le centre de contrôle complet de l'utilisateur, regroupant toutes les fonctionnalités de gestion de compte, paramètres et préférences dans une interface unifiée et intuitive.

## Structure proposée

### 1. Section Header - Identité utilisateur
- **Photo de profil** avec upload/édition
- **Informations principales** :
  - Nom complet
  - Email (vérifié/non vérifié)
  - Numéro de téléphone
  - Date d'inscription
  - Statut du compte

### 2. Onglets principaux

#### A. Profil Personnel
**Informations de base** :
- Formulaire de modification :
  - Prénom et nom
  - Email (avec vérification)
  - Téléphone
  - Date de naissance (optionnel)

**Photo de profil** :
- Upload depuis appareil
- Recadrage et optimisation
- Suppression photo actuelle
- Prévisualisation en temps réel

**Préférences générales** :
- Langue préférée
- Fuseau horaire
- Format de date
- Thème (sombre/clair/auto)

#### B. Sécurité
**Gestion du mot de passe** :
- Changement de mot de passe
- Force du mot de passe actuel
- Historique des changements
- Expiration programmée

**Authentification** :
- Authentification à deux facteurs
- Appareils connectés
- Sessions actives
- Historique de connexion

**Sécurité avancée** :
- Questions de sécurité
- Adresses IP autorisées
- Alertes de sécurité
- Journal d'activité suspecte

#### C. Notifications
**Préférences générales** :
- Activation/Désactivation globale
- Canaux préférés (email/app/push)

**Types de notifications** :
- **Réservations** :
  - Nouvelle réservation
  - Rappel de séance
  - Annulation
  - Modification

- **Compte** :
  - Changements de sécurité
  - Activité suspecte
  - Mises à jour du profil

- **Marketing** :
  - Offres spéciales
  - Nouveaux films
  - Événements spéciaux
  - Newsletter

**Paramètres avancés** :
- Fréquence des notifications
- Heures silencieuses
- Priorité des alertes
- Format des emails

#### D. Préférences
**Expérience utilisateur** :
- Page d'accueil personnalisée
- Widgets favoris du dashboard
- Ordre d'affichage des sections
- Réductions d'animations

**Confidentialité** :
- Visibilité du profil
- Partage des données
- Cookies et tracking
- Suppression des données

**Accessibilité** :
- Taille de police
- Contraste des couleurs
- Navigation au clavier
- Lecteur d'écran

### 3. Section Actions globales

#### A. Export des données
- Téléchargement des données personnelles
- Format PDF/JSON/CSV
- Historique complet des activités
- Prévisualisation avant export

#### B. Gestion du compte
- Désactivation temporaire
- Suppression définitive
- Transfert de données
- Héritage numérique

#### C. Support et aide
- Contact support technique
- FAQ et documentation
- Signalement de bug
- Suggestions d'amélioration

## Workflows principaux

### Workflow 1 : Mise à jour du profil
1. **Onglet "Profil Personnel"** → Édition des informations
2. **Validation en temps réel** :
   - Format email valide
   - Téléphone optionnel
   - Champs obligatoires
3. **Sauvegarde** → Confirmation et notification
4. **Vérification** → Email de confirmation si changement

### Workflow 2 : Gestion de la sécurité
1. **Onglet "Sécurité"** → Changement de mot de passe
2. **Validation de sécurité** :
   - Ancien mot de passe requis
   - Force du nouveau mot de passe
   - Confirmation identique
3. **Application** → Déconnexion des autres appareils
4. **Notification** → Alerte de changement de sécurité

### Workflow 3 : Personnalisation des notifications
1. **Onglet "Notifications"** → Configuration par catégorie
2. **Test des préférences** :
   - Email de test
   - Notification push test
   - Aperçu des formats
3. **Sauvegarde progressive** → Application immédiate
4. **Historique** → Suivi des modifications

## Intégration des services et DTO

### Services utilisés avec méthodes spécifiques :

#### ProfileService
- `getUserProfile(userId: string)` → `UserProfileDto` (appUserId, firstName, lastName, email, phoneNumber, profilePictureUrl, createdAt, updatedAt, role, reservations, movieRatings, favoriteMovies, userMovieHistories, employeeFavorites)
- `updateUserProfile(profileData: UpdateAppUserDto)` → Mise à jour avec `UpdateAppUserDto` (appUserId, firstName, lastName, email, userName, profilePictureUrl, phoneNumber)
- `uploadProfileImage(userId: string, file: File)` → Upload photo profil
- `deleteProfileImage(userId: string, imageUrl: string)` → Suppression photo
- `getUserStats(userId: string)` → `UserStats` (totalReservations, totalReviews, favoriteGenres, memberSince, lastActivity, loyaltyPoints, membershipLevel)
- `getNotificationSettings()` → `NotificationSettingsDto` (emailNotifications, smsNotifications, reservationReminders, promotionNotifications, newsletter)
- `updateNotificationSettings(settings: NotificationSettingsDto)` → Mise à jour paramètres notifications
- `getSecuritySettings()` → `SecuritySettingsDto` (passwordExpirationDays, maxLoginAttempts, sessionTimeoutMinutes, twoFactorAuthentication, ipWhitelist)
- `updateSecuritySettings(settings: SecuritySettingsDto)` → Mise à jour sécurité
- `changePassword(passwordData: ChangeUserPasswordDto)` → Changement mot de passe avec `ChangeUserPasswordDto` (oldPassword, newPassword, confirmNewPassword)

#### AuthService
- `getProfile()` → Récupération profil utilisateur
- `updateProfile(updateData: UpdateAppUserDto)` → Mise à jour profil
- `changePassword(passwordData: ChangeUserPasswordDto)` → Changement mot de passe

#### NotificationPreferencesService
- `getNotificationPreferences()` → `NotificationPreferencesDto` (userId, emailEnabled, appEnabled, preferences)
- `updateNotificationPreferences(preferences: UpdateNotificationPreferencesDto)` → Mise à jour avec `UpdateNotificationPreferencesDto` (emailEnabled, appEnabled, preferences)
- `getUserNotifications(limit: number, skip: number)` → `UserNotificationDto[]` (id, userId, title, message, type, isRead, createdAt)
- `markNotificationAsRead(notificationId: string)` → Marquer comme lu
- `getUnreadNotificationCount()` → `UnreadCountResponse` (unreadCount)

#### UserService
- `getUserById(userId: string)` → `AppUserDto` pour informations détaillées
- `getUserStats()` → Statistiques utilisateur globales

### DTO principaux utilisés :
- **UserProfileDto** : Profil utilisateur complet
- **UpdateAppUserDto** : Mise à jour des informations profil
- **NotificationSettingsDto** : Paramètres de notifications
- **SecuritySettingsDto** : Paramètres de sécurité
- **ChangeUserPasswordDto** : Changement de mot de passe
- **NotificationPreferencesDto** : Préférences de notifications détaillées
- **UpdateNotificationPreferencesDto** : Mise à jour préférences
- **UserNotificationDto** : Notifications utilisateur
- **AppUserDto** : Utilisateur avec toutes les relations
- **UserStats** : Statistiques personnelles

## Fonctionnalités avancées

### A. Synchronisation cross-device
- **Sauvegarde cloud** des paramètres
- **Synchronisation en temps réel**
- **Conflits de modification** résolus intelligemment
- **Historique des versions** des paramètres

### B. Analytics de l'expérience
- **Suivi des préférences** les plus utilisées
- **Suggestions automatiques** basées sur l'usage
- **Optimisation de l'interface** selon le comportement
- **Feedback utilisateur** intégré

### C. Sécurité renforcée
- **Détection d'anomalies** de connexion
- **Alertes proactives** de sécurité
- **Chiffrement** des données sensibles
- **Audit régulier** des paramètres

## Améliorations UX

### Interface utilisateur :
- **Navigation par onglets** intuitive
- **Sauvegarde automatique** des modifications
- **Indicateurs visuels** des changements en cours
- **Mode lecture** pour les longs textes

### Accessibilité :
- **Support complet** des lecteurs d'écran
- **Navigation au clavier** optimisée
- **Contraste des couleurs** ajustable
- **Taille des textes** modifiable

### Performance :
- **Chargement progressif** des sections
- **Cache intelligent** des paramètres
- **Optimisation** des images de profil
- **Compression** des données exportées

## État futur souhaité
- Intégration avec systèmes d'authentification externes
- Portabilité des données entre plateformes
- Intelligence artificielle pour suggestions personnalisées
- Analytics avancés de l'expérience utilisateur
- API complète pour applications tierces