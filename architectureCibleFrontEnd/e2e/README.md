# Tests E2E Playwright

## Prérequis

1. **API backend** : démarrer l’API (ex. Laravel sur `http://localhost:8000`) et préparer les tables (migrations, seed si besoin). L’URL est configurée via `VITE_API_URL` (défaut : `http://localhost:8000/api`).

2. Le **frontend** est lancé automatiquement par Playwright avant les tests (serveur Vite sur `http://localhost:5173`).

## Commandes

- `npm run test:e2e` : lancer les tests E2E (headless).
- `npm run test:e2e:ui` : lancer l’interface Playwright pour déboguer.

## Fichiers

- `auth.spec.ts` : redirection, formulaire login/register, inscription, connexion, accès protégé, erreur de connexion.
- `dashboard.spec.ts` : après inscription, création de tag, création de note, suppression de note, déconnexion.
