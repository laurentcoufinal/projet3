# Analyse de l'architecture – API Renote

## 1. Fonction principale

L'application expose une **API REST** de prise de notes. La fonction principale est :

- **Authentifier** les utilisateurs par token (Laravel Sanctum).
- **Exposer** les ressources **notes** (texte + tag obligatoire) et **tags** (globaux) via des endpoints REST (JSON).

Il n'y a pas d'interface web : tout accès se fait par requêtes HTTP vers les routes préfixées par `/api`.

---

## 2. Architecture (couches)

| Couche | Rôle | Répertoire / Fichiers |
|--------|------|------------------------|
| **Routes** | Définition des endpoints API | `routes/api.php` |
| **Presentation** | Contrôleurs HTTP, validation (FormRequest), formatage (Resources) | `src/Presentation/Http/` |
| **Application (Ports)** | Contrats (interfaces) pour l’auth et la persistance | `src/Application/Ports/` |
| **Infrastructure** | Implémentations (Sanctum, Eloquent) | `src/Infrastructure/` |
| **Injection** | Liaison interface → implémentation | `src/Providers/ArchitectureCibleServiceProvider.php` |
| **Modèles** | Entités Eloquent (User, Note, Tag) | `app/Models/` |

---

## 3. Fonctions et fichiers où elles sont réalisées

### 3.1 Authentification

Routes **attendues par le frontend** : `POST /api/register`, `POST /api/login` (réponse : `token` + `user`).

| Fonction | Description | Fichier où c'est réalisé |
|----------|-------------|---------------------------|
| **Inscription (register)** | name, email, password, password_confirmation → 201 + token + user ; 422 si email déjà pris | `routes/api.php` (`POST /api/register`), `AuthController::register()`, `RegisterRequest.php`, `AuthServiceInterface::register()`, `SanctumAuthService::register()` |
| **Connexion (login)** | Email + mot de passe → token + user ; 401 si invalide ; rate limit 5/min. Exposé en `POST /api/login` et `POST /api/auth/login`. | `routes/api.php` (route `POST /api/auth/login`), `src/Presentation/Http/Controllers/Api/AuthController.php` → `login()`, `src/Presentation/Http/Requests/LoginRequest.php` (règles), `src/Application/Ports/AuthServiceInterface.php` → `login()`, `src/Infrastructure/Auth/SanctumAuthService.php` → `login()` |
| **Déconnexion (logout)** | Invalidation du token courant | `routes/api.php` (route `POST /api/auth/logout`), `src/Presentation/Http/Controllers/Api/AuthController.php` → `logout()`, `src/Application/Ports/AuthServiceInterface.php` → `logout()`, `src/Infrastructure/Auth/SanctumAuthService.php` → `logout()` |
| **Profil utilisateur (user)** | Retourne l’utilisateur connecté (JSON) ; 401 si non authentifié | `routes/api.php` (route `GET /api/auth/user`), `src/Presentation/Http/Controllers/Api/AuthController.php` → `user()`, `src/Application/Ports/AuthServiceInterface.php` → `user()`, `src/Infrastructure/Auth/SanctumAuthService.php` → `user()`, `src/Presentation/Http/Resources/UserResource.php` → `toArray()` |

---

### 3.2 Notes

| Fonction | Description | Fichier où c'est réalisé |
|----------|-------------|---------------------------|
| **Liste des notes (index)** | Notes de l’utilisateur connecté (avec tag) ; 200 + `data` ; message si vide | `routes/api.php` (route `GET /api/notes`), `src/Presentation/Http/Controllers/Api/NoteController.php` → `index()`, `src/Application/Ports/NoteRepositoryInterface.php` → `getNotesForUser()`, `src/Infrastructure/Persistence/EloquentNoteRepository.php` → `getNotesForUser()`, `src/Presentation/Http/Resources/NoteResource.php` → `toArray()` |
| **Création d’une note (store)** | Corps : `text` (optionnel, max 65535), `tag_id` (obligatoire) ; 201 + note créée | `routes/api.php` (route `POST /api/notes`), `src/Presentation/Http/Controllers/Api/NoteController.php` → `store()`, `src/Presentation/Http/Requests/CreateNoteRequest.php` (règles + messages), `src/Application/Ports/NoteRepositoryInterface.php` → `create()`, `src/Infrastructure/Persistence/EloquentNoteRepository.php` → `create()` |
| **Mise à jour d’une note (update)** | Corps partiel : `text`, `tag_id` ; 404 si note absente ou non détenue | `routes/api.php` (route `PUT /api/notes/{noteId}`), `src/Presentation/Http/Controllers/Api/NoteController.php` → `update()`, `src/Presentation/Http/Requests/UpdateNoteRequest.php` (règles), `src/Application/Ports/NoteRepositoryInterface.php` → `findByIdForUser()`, `update()`, `src/Infrastructure/Persistence/EloquentNoteRepository.php` → `findByIdForUser()`, `update()` |
| **Suppression d’une note (destroy)** | 404 si note absente ou non détenue | `routes/api.php` (route `DELETE /api/notes/{noteId}`), `src/Presentation/Http/Controllers/Api/NoteController.php` → `destroy()`, `src/Application/Ports/NoteRepositoryInterface.php` → `findByIdForUser()`, `delete()`, `src/Infrastructure/Persistence/EloquentNoteRepository.php` → `findByIdForUser()`, `delete()` |

---

### 3.3 Tags

| Fonction | Description | Fichier où c'est réalisé |
|----------|-------------|---------------------------|
| **Liste des tags (index)** | Tous les tags (globaux) ; 200 + `data` ; message si vide | `routes/api.php` (route `GET /api/tags`), `src/Presentation/Http/Controllers/Api/TagController.php` → `index()`, `src/Application/Ports/TagRepositoryInterface.php` → `getAllTags()`, `src/Infrastructure/Persistence/EloquentTagRepository.php` → `getAllTags()`, `src/Presentation/Http/Resources/TagResource.php` → `toArray()` |
| **Création d’un tag (store)** | Corps : `name` (obligatoire, max 255) ; 201 + tag créé | `routes/api.php` (route `POST /api/tags`), `src/Presentation/Http/Controllers/Api/TagController.php` → `store()`, `src/Presentation/Http/Requests/CreateTagRequest.php` (règles), `src/Application/Ports/TagRepositoryInterface.php` → `create()`, `src/Infrastructure/Persistence/EloquentTagRepository.php` → `create()` |

---

### 3.4 Injection des dépendances

| Fonction | Description | Fichier où c'est réalisé |
|----------|-------------|---------------------------|
| **Binding Auth** | Liaison `AuthServiceInterface` → `SanctumAuthService` | `src/Providers/ArchitectureCibleServiceProvider.php` → `register()` |
| **Binding Notes** | Liaison `NoteRepositoryInterface` → `EloquentNoteRepository` | `src/Providers/ArchitectureCibleServiceProvider.php` → `register()` |
| **Binding Tags** | Liaison `TagRepositoryInterface` → `EloquentTagRepository` | `src/Providers/ArchitectureCibleServiceProvider.php` → `register()` |

---

## 4. Récapitulatif des fichiers par rôle

| Fichier | Rôle |
|---------|------|
| `routes/api.php` | Définition de toutes les routes API (auth, notes, tags) et middleware (throttle login, auth:sanctum) |
| `src/Presentation/Http/Controllers/Api/AuthController.php` | `login()`, `logout()`, `user()` |
| `src/Presentation/Http/Controllers/Api/NoteController.php` | `index()`, `store()`, `update()`, `destroy()` |
| `src/Presentation/Http/Controllers/Api/TagController.php` | `index()`, `store()` |
| `src/Presentation/Http/Requests/LoginRequest.php` | Règles de validation (email, password) pour le login |
| `src/Presentation/Http/Requests/CreateNoteRequest.php` | Règles (text max 65535, tag_id required/exists) et messages pour la création de note |
| `src/Presentation/Http/Requests/UpdateNoteRequest.php` | Règles (text, tag_id optionnels) pour la mise à jour de note |
| `src/Presentation/Http/Requests/CreateTagRequest.php` | Règles (name required, max 255) pour la création de tag |
| `src/Presentation/Http/Resources/UserResource.php` | `toArray()` : formatage User → JSON |
| `src/Presentation/Http/Resources/NoteResource.php` | `toArray()` : formatage Note → JSON (avec tag si chargé) |
| `src/Presentation/Http/Resources/TagResource.php` | `toArray()` : formatage Tag → JSON |
| `src/Application/Ports/AuthServiceInterface.php` | Contrat `login()`, `logout()`, `user()` |
| `src/Application/Ports/NoteRepositoryInterface.php` | Contrat `getNotesForUser()`, `create()`, `findByIdForUser()`, `update()`, `delete()` |
| `src/Application/Ports/TagRepositoryInterface.php` | Contrat `getAllTags()`, `getTagsForUser()`, `create()` |
| `src/Infrastructure/Auth/SanctumAuthService.php` | Implémentation auth (login, logout, user) avec Sanctum |
| `src/Infrastructure/Persistence/EloquentNoteRepository.php` | Implémentation persistance notes (Eloquent) |
| `src/Infrastructure/Persistence/EloquentTagRepository.php` | Implémentation persistance tags (Eloquent) |
| `src/Providers/ArchitectureCibleServiceProvider.php` | Enregistrement des bindings interface → implémentation |
| `app/Models/User.php` | Modèle Eloquent utilisateur (auth, tokens Sanctum) |
| `app/Models/Note.php` | Modèle Eloquent note (user_id, tag_id, text) |
| `app/Models/Tag.php` | Modèle Eloquent tag (name) |
| `database/migrations/2025_07_16_195507_create_notes_table.php` | Schéma table `notes` |
| `database/migrations/2025_07_16_195813_create_tags_table.php` | Schéma table `tags` |

---

*Document généré pour l’analyse de l’architecture – fonction principale et fonctions avec les fichiers où elles sont réalisées.*
