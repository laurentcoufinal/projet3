# Architecture du frontend Renote (React)

## 1. Fonction principale de l'application

**Renote** est une SPA (Single Page Application) React qui permet à un utilisateur de :
- **S’authentifier** (connexion / inscription) et d’accéder à un espace protégé.
- **Gérer des notes** : créer des notes associées à un tag, afficher la liste, supprimer une note.
- **Gérer des tags** : créer des tags, afficher la liste des tags.

L’application consomme une **API REST** (ex. Laravel + Sanctum) et gère l’état côté client avec **Zustand** (auth) et **TanStack Query** (notes, tags).

---

## 2. Structure des dossiers

```
src/
  api/           # Client HTTP et appels API
  stores/        # État global (Zustand)
  hooks/         # Hooks React Query + logique métier
  components/    # Composants réutilisables (notes, tags)
  pages/         # Pages / écrans (Login, Register, Dashboard)
  routes/        # Routage et garde d’authentification
  types/         # Types TypeScript (user, tag, note)
  test/          # Setup et utilitaires de test
```

---

## 3. Fichiers et fonctions

### 3.1 Point d’entrée et racine

| Fichier | Rôle principal | Fonctions / exports |
|--------|----------------|---------------------|
| **src/main.tsx** | Point d’entrée : monte l’app React dans `#root` en mode Strict. | — (appel à `createRoot().render(<StrictMode><App /></StrictMode>)`) |
| **src/App.tsx** | Racine UI : fournit le client React Query et affiche le routeur. | `App()` — enveloppe l’app avec `QueryClientProvider` et `AppRouter`. |

---

### 3.2 API (client HTTP)

| Fichier | Rôle principal | Fonctions (fichier : `src/api/client.ts`) |
|--------|----------------|-------------------------------------------|
| **src/api/client.ts** | Client HTTP vers l’API : auth, notes, tags. Base URL via `VITE_API_URL`. | `getApiBase()` — retourne l’URL de base de l’API.<br>`login(credentials)` — POST `/login`, retourne `LoginResponse`.<br>`register(credentials)` — POST `/register`, retourne `LoginResponse`.<br>`authHeaders(token)` — (interne) en-têtes avec `Authorization: Bearer`.<br>`getTags(token)` — GET `/tags`, retourne `Tag[]`.<br>`createTag(name, token)` — POST `/tags`, retourne `Tag`.<br>`getNotes(token)` — GET `/notes`, retourne `Note[]`.<br>`createNote(text, tag_id, token)` — POST `/notes`, retourne `Note`.<br>`deleteNote(id, token)` — DELETE `/notes/:id`. |

Réexport des types : `LoginCredentials`, `LoginResponse`, `RegisterCredentials`, `Tag`, `Note`.

---

### 3.3 Store (état global auth)

| Fichier | Rôle principal | Fonctions (fichier : `src/stores/authStore.ts`) |
|--------|----------------|-------------------------------------------------|
| **src/stores/authStore.ts** | Store Zustand pour l’authentification (user, token, erreur, chargement). Persistance en **sessionStorage** (clé `auth-storage`). | `useAuthStore` — store avec `user`, `token`, `error`, `isLoading`, et actions.<br>Actions du store : `login(email, password)`, `register(name, email, password)`, `logout()`, `setError(error)`, `clearError()`.<br>`getStoredToken()` — lit le token depuis la persistance (sessionStorage). |

---

### 3.4 Hooks (données serveur)

| Fichier | Rôle principal | Fonctions (fichier : `src/hooks/useNotes.ts`) |
|--------|----------------|-----------------------------------------------|
| **src/hooks/useNotes.ts** | Hooks React Query pour les notes (lecture, création, suppression). | `notesQueryKey` — clé de requête pour invalidation.<br>`useNotes()` — `useQuery` : liste des notes (activée si token).<br>`useCreateNote()` — `useMutation` : création de note + invalidation de la liste.<br>`useDeleteNote()` — `useMutation` : suppression de note + invalidation. |

| Fichier | Rôle principal | Fonctions (fichier : `src/hooks/useTags.ts`) |
|--------|----------------|----------------------------------------------|
| **src/hooks/useTags.ts** | Hooks React Query pour les tags (lecture, création). | `tagsQueryKey` — clé de requête.<br>`useTags()` — `useQuery` : liste des tags (activée si token).<br>`useCreateTag()` — `useMutation` : création de tag + invalidation. |

---

### 3.5 Routes

| Fichier | Rôle principal | Fonctions (fichier : `src/routes/AppRouter.tsx`) |
|--------|----------------|--------------------------------------------------|
| **src/routes/AppRouter.tsx** | Définit les routes et la structure (public / protégé). | `AppRouter()` — `BrowserRouter` + routes : `/login`, `/register`, `/dashboard` (sous garde), `/` et `*` → redirection vers `/login`. |

| Fichier | Rôle principal | Fonctions (fichier : `src/routes/AuthGuard.tsx`) |
|--------|----------------|--------------------------------------------------|
| **src/routes/AuthGuard.tsx** | Garde d’accès : affiche les enfants seulement si un token est présent. | `AuthGuard()` — si pas de token : `Navigate` vers `/login` avec `state.from` ; sinon rend `<Outlet />`. |

---

### 3.6 Pages

| Fichier | Rôle principal | Fonctions (fichier : `src/pages/Login.tsx`) |
|--------|----------------|---------------------------------------------|
| **src/pages/Login.tsx** | Page de connexion : formulaire email / mot de passe. | `Login()` — formulaire, appel à `login()` du store, redirection vers `/dashboard` en cas de succès, lien vers Register. |

| Fichier | Rôle principal | Fonctions (fichier : `src/pages/Register.tsx`) |
|--------|----------------|----------------------------------------------|
| **src/pages/Register.tsx** | Page d’inscription : formulaire nom, email, mot de passe. | `Register()` — formulaire, appel à `register()` du store, redirection vers `/dashboard` en cas de succès, lien vers Login. |

| Fichier | Rôle principal | Fonctions (fichier : `src/pages/Dashboard.tsx`) |
|--------|----------------|-------------------------------------------------|
| **src/pages/Dashboard.tsx** | Espace authentifié : message de bienvenue, bouton déconnexion, liste et formulaire de notes, liste et formulaire de tags. | `Dashboard()` — affiche user, bouton Déconnexion (`logout` + `navigate('/login')`), `NoteList`, `NoteForm`, `TagList`, `TagForm`. |

---

### 3.7 Composants

| Fichier | Rôle principal | Fonctions (fichier : `src/components/notes/NoteForm.tsx`) |
|--------|----------------|----------------------------------------------------------|
| **src/components/notes/NoteForm.tsx** | Formulaire de création de note (texte + sélection de tag). | `NoteForm()` — champs contrôlés, `useCreateNote()` et `useTags()`, soumission via `handleSubmit`, affichage des erreurs de mutation. |

| Fichier | Rôle principal | Fonctions (fichier : `src/components/notes/NoteList.tsx`) |
|--------|----------------|----------------------------------------------------------|
| **src/components/notes/NoteList.tsx** | Liste des notes avec suppression. | `NoteList()` — `useNotes()` et `useDeleteNote()`, états chargement / erreur / vide, bouton Supprimer par note. |

| Fichier | Rôle principal | Fonctions (fichier : `src/components/tags/TagForm.tsx`) |
|--------|----------------|--------------------------------------------------------|
| **src/components/tags/TagForm.tsx** | Formulaire de création de tag (nom). | `TagForm()` — champ nom (maxLength 50), `useCreateTag()`, soumission et affichage des erreurs. |

| Fichier | Rôle principal | Fonctions (fichier : `src/components/tags/TagList.tsx`) |
|--------|----------------|--------------------------------------------------------|
| **src/components/tags/TagList.tsx** | Liste des tags en lecture seule. | `TagList()` — `useTags()`, états chargement / erreur / vide, affichage des noms. |

---

### 3.8 Types

| Fichier | Rôle principal | Types (fichier : `src/types/user.ts`) |
|--------|----------------|--------------------------------------|
| **src/types/user.ts** | Types liés à l’utilisateur et à l’auth. | `User`, `LoginCredentials`, `LoginResponse`, `RegisterCredentials`. |

| Fichier | Rôle principal | Types (fichier : `src/types/tag.ts`) |
|--------|----------------|-------------------------------------|
| **src/types/tag.ts** | Type des tags. | `Tag` (id, name). |

| Fichier | Rôle principal | Types (fichier : `src/types/note.ts`) |
|--------|----------------|-------------------------------------|
| **src/types/note.ts** | Type des notes (avec tag optionnel). | `Note` (id, text, tag_id, tag?). |

---

### 3.9 Test

| Fichier | Rôle principal | Fonctions (fichier : `src/test/setup.ts`, `src/test/wrapper.tsx`) |
|--------|----------------|------------------------------------------------------------------|
| **src/test/setup.ts** | Configuration Vitest (matchers, etc.). | Import de `@testing-library/jest-dom`. |
| **src/test/wrapper.tsx** | Wrapper pour rendre des composants avec React Query en test. | `createQueryWrapper()` — retourne un composant qui enveloppe les enfants dans `QueryClientProvider` (client sans retry). |

---

## 4. Flux de données (résumé)

- **Auth** : `Login` / `Register` → `authStore.login` / `register` → `api/client.login` / `register` → état (user, token) + persistance sessionStorage. `AuthGuard` lit `token` pour autoriser l’accès au Dashboard.
- **Notes** : `NoteList` / `NoteForm` utilisent `useNotes`, `useCreateNote`, `useDeleteNote` (React Query) qui appellent `getNotes`, `createNote`, `deleteNote` avec le token du store.
- **Tags** : `TagList` / `TagForm` utilisent `useTags`, `useCreateTag` qui appellent `getTags`, `createTag` avec le token du store.

---

## 5. Stack technique

| Rôle | Technologie |
|------|-------------|
| UI | React 18 |
| Routing | React Router v6 |
| État global (auth) | Zustand + persist (sessionStorage) |
| Données serveur (notes, tags) | TanStack Query (React Query) |
| Client HTTP | fetch (API dans `src/api/client.ts`) |
| Langage | TypeScript |
| Build | Vite 6 |
