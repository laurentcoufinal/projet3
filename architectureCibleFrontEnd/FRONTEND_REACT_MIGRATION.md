# Analyse du frontend actuel et migration vers React avec state management

## 1. Analyse de la partie frontend actuelle

### 1.1 Stack technique

| Couche | Technologie | Rôle |
|--------|-------------|------|
| **Rendu** | Blade (Laravel) | HTML côté serveur, layouts, composants Blade |
| **Interactivité** | Livewire | Composants réactifs côté serveur : état en PHP, `wire:model`, `wire:click`, `wire:submit` déclenchent des allers-retours HTTP |
| **UI / Design system** | Livewire Flux | Sidebar, navlist, dropdown, profile, menu (composants Blade + Alpine.js en sous-couche) |
| **Styles** | Tailwind CSS 4 | Utilitaires, thème (zinc, dark mode), variables CSS |
| **Build** | Vite 6, laravel-vite-plugin | Compilation CSS ; `resources/js/app.js` est vide (Livewire injecte ses scripts) |
| **État côté client** | Aucun | Tout l’état est côté serveur (Livewire + session Laravel) |

Le frontend est donc **monolithique côté Laravel** : pas de SPA, pas de state management client. L’UI réagit via des requêtes Livewire qui mettent à jour le DOM par morceaux.

### 1.2 Structure des écrans et fichiers

| Zone | Fichiers / composants | Comportement |
|------|------------------------|--------------|
| **Landing** | `welcome.blade.php` | Page d’accueil : nav (Login / Register ou Dashboard), hero Renote |
| **Auth** | `livewire/auth/*.blade.php` (Volt) | Login, Register, Forgot password, Reset password, Verify email, Confirm password |
| **Layout authentifié** | `components/layouts/app.blade.php`, `app/sidebar.blade.php` | Sidebar Flux (logo, lien Dashboard, liens externes, menu utilisateur : profil, Settings, Logout) |
| **Dashboard** | `dashboard.blade.php` | Contenu : `<livewire:notes />` + `<livewire:tag-form />` |
| **Notes** | `app/Livewire/Notes.php`, `livewire/notes.blade.php` | Formulaire (texte + select tag), liste des notes avec suppression, message flash |
| **Tags** | `app/Livewire/TagForm.php`, `livewire/tag-form.blade.php` | Formulaire (nom), message flash, erreur de validation ; événement `tagCreated` pour rafraîchir les tags dans Notes |
| **Settings** | Volt → `livewire/settings/*.blade.php` | Profil, mot de passe, apparence, suppression compte |

### 1.3 État actuel (côté serveur)

| Contexte | Données | Où elles vivent |
|----------|---------|------------------|
| **Auth** | Utilisateur connecté | Session Laravel, `auth()->user()` |
| **Notes** | `notes`, `text`, `tag_id`, `tags` | Composant Livewire `Notes.php` (mount, loadNotes, save, delete, refreshTags) |
| **Tags** | `name`, liste des tags (pour le select) | Composant `TagForm.php` + écoute `tagCreated` dans Notes |
| **Messages** | Succès / erreur | `session()->flash('message')`, validation Laravel |
| **UI** | Sidebar, dropdown | Flux + Alpine (état local dans le DOM) |

### 1.4 Flux typiques

- **Chargement dashboard** : Livewire monte Notes et TagForm → `mount()` charge tags et notes → rendu Blade.
- **Ajout d’une note** : Submit formulaire → requête Livewire `save()` → validation, création en BDD, `loadNotes()`, re-rendu fragment HTML.
- **Ajout d’un tag** : Submit → `TagForm::save()` → création tag, `dispatch('tagCreated')` → Notes reçoit et appelle `refreshTags()` → re-rendu.
- **Suppression note** : `wire:click="delete(id)"` → requête Livewire → suppression, `loadNotes()`, re-rendu.

Conclusion : pas de state global client ; chaque interaction passe par le serveur et met à jour l’UI via les réponses Livewire.

---

## 2. Migration vers React avec state management

### 2.1 Principes de la migration

- **Backend** : supposé déjà migré en API REST (ex. Laravel + Sanctum) comme dans le plan existant : `POST/GET login, register, logout`, `GET/POST/DELETE notes`, `GET/POST tags`, `GET user`.
- **Frontend** : une SPA React qui consomme cette API ; l’état (auth, notes, tags, formulaires, messages) est géré côté client avec une solution de state management.

### 2.2 Choix du state management

Trois options adaptées à une app de taille Renote (notes, tags, auth, settings) :

| Solution | Idée | Avantages | Inconvénients |
|----------|------|-----------|---------------|
| **Redux Toolkit + RTK Query** | Store global (slices) + couche API intégrée (cache, invalidation) | Modèle clair, DevTools, cache HTTP et invalidation (ex. après création note) | Plus de boilerplate qu’un store minimal |
| **Zustand + React Query (TanStack Query)** | Store léger (auth, UI) + React Query pour données serveur (notes, tags) | Peu de code, React Query gère cache/refetch, Zustand simple pour auth et préférences | Deux libs à maîtriser |
| **React Query seul + Context** | Pas de store global ; React Query pour toutes les données API, Context pour user + thème | Minimal, une seule lib pour le serveur | Context pour auth/thème à bien délimiter pour éviter re-renders |

**Recommandation pour Renote** : **Zustand + React Query (TanStack Query)**.

- **React Query** : chargement des notes et tags, création/suppression de note, création de tag, invalidation des listes après mutation (équivalent de `loadNotes()` / `refreshTags()`).
- **Zustand** : token/user (auth), préférence dark/light, éventuellement sidebar ouverte/fermée — état global léger sans Context ni Redux.

Alternative si vous préférez tout centraliser (API + state métier) : **Redux Toolkit + RTK Query** (slices `auth`, `notes`, `tags` ; API via `createApi`).

---

## 3. Proposition détaillée : React + Zustand + React Query

### 3.1 Stack cible

| Rôle | Technologie |
|------|-------------|
| Framework UI | React 18 (Create React App ou Vite + React) |
| State global léger | Zustand (auth, thème, UI) |
| Données serveur / cache | TanStack Query (React Query) |
| Requêtes HTTP | fetch ou axios (React Query utilise le client fourni) |
| Routing | React Router v6 |
| Styles | Tailwind CSS (réutiliser thème clair/sombre actuel) |
| Build | Vite |

### 3.2 Structure des dossiers (exemple)

```
src/
  api/                 # Client HTTP, base URL
  stores/               # Zustand
    authStore.ts       # token, user, login, logout, setUser
    uiStore.ts         # theme, sidebarOpen (optionnel)
  hooks/               # React Query + custom
    useNotes.ts        # useQuery notes, useMutation createNote, deleteNote
    useTags.ts         # useQuery tags, useMutation createTag
    useAuth.ts         # wrapper authStore + vérif token
  components/
    layout/
      Sidebar.tsx
      Header.tsx
    notes/
      NoteForm.tsx
      NoteList.tsx
      NoteItem.tsx
    tags/
      TagForm.tsx
  pages/
    Login.tsx
    Register.tsx
    Dashboard.tsx
    Settings.tsx
  routes/
    AppRouter.tsx      # routes publiques / protégées, AuthGuard
  types/
    note.ts, tag.ts, user.ts
```

### 3.3 Mapping état actuel → React + state management

| Actuel (Livewire / Laravel) | Après migration (React) |
|-----------------------------|--------------------------|
| `auth()->user()`, session | Zustand `authStore` : `user`, `token` ; chargement initial via `GET /api/user` avec token |
| Liste notes (Notes.php) | `useQuery(['notes'], fetchNotes)` ; après création/suppression : `queryClient.invalidateQueries(['notes'])` |
| Liste tags (TagForm + Notes) | `useQuery(['tags'], fetchTags)` ; après création tag : `invalidateQueries(['tags'])` |
| Formulaire note (text, tag_id) | État local dans `NoteForm` (useState) ou champs contrôlés ; submit → `useMutation(createNote)` |
| Formulaire tag (name) | État local dans `TagForm` ; submit → `useMutation(createTag)` |
| Flash message | État local (useState) dans le composant ou petit store Zustand `message` (optionnel) |
| Validation (erreurs Laravel) | Réponse 422 : afficher `errors` dans le formulaire (état local ou passé en props) |
| Layout sidebar / dropdown | Composants React ; état ouvert/fermé en local (useState) ou dans `uiStore` |
| Dark mode | Zustand `uiStore.theme` + classe sur `<html>` ou Tailwind dark |

### 3.4 Flux typiques côté React

- **Login** : formulaire → appel API login → réponse `user` + `token` → `authStore.setAuth(user, token)` + stockage token (localStorage) → redirection vers Dashboard.
- **Dashboard** : `useNotes()` et `useTags()` (React Query) chargent notes et tags ; création note → mutation → `invalidateQueries(['notes'])` → liste à jour ; création tag → mutation → `invalidateQueries(['tags'])` → select des tags à jour.
- **Protection des routes** : composant `AuthGuard` qui lit `authStore.token` (ou user) ; si absent, redirection vers Login.

### 3.5 Étapes de migration (résumé)

1. Créer le projet React (Vite + React + TypeScript si souhaité).
2. Installer et configurer Zustand, TanStack Query, React Router, Tailwind.
3. Définir le client API (base URL, intercepteur pour `Authorization: Bearer <token>`).
4. Implémenter `authStore` (Zustand) et `useAuth`, écran Login/Register et AuthGuard.
5. Implémenter `useNotes` / `useTags` (queries + mutations) et pages Dashboard (NoteForm, NoteList, TagForm).
6. Reproduire le layout (Sidebar, menu utilisateur, Settings, Logout).
7. Gérer thème (dark/light) et messages succès/erreur.
8. Connecter l’app à l’API Laravel (Sanctum) une fois celle-ci en place.

---

## 4. Alternative : Redux Toolkit + RTK Query

Si vous préférez un seul écosystème (state + API) et un modèle très explicite :

- **Store** : slices `auth`, `notes`, `tags` (et éventuellement `ui`).
- **API** : `createApi` (RTK Query) avec `endpoints` pour login, register, logout, getNotes, createNote, deleteNote, getTags, createTag, getUser. Les tags de cache (`'Notes'`, `'Tags'`) permettent d’invalider après mutation.
- **Composants** : `useGetNotesQuery`, `useCreateNoteMutation`, etc. ; état auth dans le store Redux.

Avantage : une seule lib, pattern connu. Inconvénient : plus de fichiers et de configuration que Zustand + React Query pour une app de cette taille.

---

## 5. Synthèse

- **Frontend actuel** : Blade + Livewire + Flux + Tailwind ; état entièrement côté serveur, pas de state management client.
- **Migration proposée** : SPA React consommant l’API Laravel (Sanctum), avec **Zustand** pour l’auth et l’UI globale et **React Query** pour les notes et tags (cache, mutations, invalidation). Alternative : **Redux Toolkit + RTK Query** pour tout centraliser.
- Le document ci-dessus peut servir de base pour un plan d’implémentation détaillé (tickets, ordre des composants, etc.) en cohérence avec l’architecture cible (API + frontend découplé).
