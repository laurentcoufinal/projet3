# Transformez l'architecture d'une application existante

# Plot

Renote is an application that allows user to take and store notes.
In renote, a user can:
- create notes
- visualize notes
- define relationship between the notes
- define tags
- and associate a tag to a note.

## Install

1. Install Laravel's Herd:
https://laravel.com/docs/12.x/installation#installation-using-herd

This will install Php, Composer and Laravel.

2. Install node v22

Install node version manager (MVN).
On Windows you can use this distribution:
https://github.com/coreybutler/nvm-windows#readme


3. Clone this project

4. Run `npm i` and `npm run dev`

5. Start Herd

6. Access `http://monolithic-app.test` from your browser

You are setup!

## API REST et tests E2E Playwright

L'application expose une API REST (voir `architecture.md`). Pour lancer les tests d’endpoints API avec Playwright :

1. **Démarrer l’API** (dans un terminal) :
   ```bash
   php artisan serve
   ```

2. **Préparer la base** (utilisateur de test pour les E2E) :
   ```bash
   php artisan migrate
   php artisan db:seed --class=ApiTestSeeder
   ```
   (Utilisateur : `test@example.com` / mot de passe : `password`)

3. **Installer les dépendances Playwright** (une fois) :
   ```bash
   npm install
   npx playwright install
   ```

4. **Lancer les tests API** :
   ```bash
   npm run test:e2e
   ```
   Ou avec une autre URL : `BASE_URL=http://localhost:8000 npm run test:e2e`

Les tests couvrent les tables **notes** et **tags** (auth, CRUD notes, CRUD tags, validation).

### Routes de test (uniquement en environnement testing)

Les routes définies dans `routes/testing.php` (ex. `GET /api/testing/ping`) ne sont **enregistrées que lorsque `APP_ENV=testing`**. En local ou en production, elles n’existent pas (réponse 404). Pour lancer le serveur en mode test (utile pour les E2E) :

```bash
APP_ENV=testing php artisan serve
```

## API + frontend (Vite sur :5173)

- **Redémarrage** : après toute modification des routes ou du code PHP, redémarrer l’API (`Ctrl+C` puis `php artisan serve`) pour prendre en compte les changements.
- **URLs attendues par le frontend** : l’API expose **POST /api/register** et **POST /api/login** (base URL : `http://localhost:8000/api`).
- **CORS** : `config/cors.php` autorise les requêtes depuis **http://localhost:5173** et **http://127.0.0.1:5173**, avec `supports_credentials` pour le token Sanctum.
- **Variable d’environnement frontend** : dans le projet Vite, définir **VITE_API_URL** (ex. `http://localhost:8000/api`). Voir `.env.example`. Redémarrer Vite après modification du `.env`.
