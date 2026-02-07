# Contrôle des configurations et versions

## Versions requises

| Composant | Version (composer/package) | CI (GitHub Actions) | Statut |
|-----------|----------------------------|---------------------|--------|
| **PHP** | ^8.2 | 8.4 | ✅ Compatible |
| **Laravel** | ^12.0 | - | ✅ |
| **Node** | - | 22 | ✅ |
| **Laravel Sanctum** | ^4.3 | - | ✅ |
| **Livewire Volt** | ^1.7.0 | - | ✅ |
| **Livewire Flux** | ^2.1.1 | - | ✅ (credentials requises) |
| **Vite** | ^6.0 | - | ✅ |
| **Tailwind CSS** | ^4.0.7 | - | ✅ |
| **Pest** | ^3.8 | - | ✅ |

## Configuration applicative

### Bootstrap (`bootstrap/app.php`)
- **Routes** : `web`, `api`, `commands`, `health: /up` ✅
- **API** : `routes/api.php` chargé ✅

### Providers (`bootstrap/providers.php`)
- `App\Providers\AppServiceProvider` ✅
- `App\Providers\VoltServiceProvider` (monte `resources/views/livewire`) ✅
- `ArchitectureCible\Providers\ArchitectureCibleServiceProvider` (bindings API) ✅

### Autoload (`composer.json`)
- `App\` → `app/` ✅
- `ArchitectureCible\` → `src/` ✅
- `Database\Factories\`, `Database\Seeders\` ✅

### Environnement de test (`phpunit.xml`)
- `APP_ENV=testing`, `APP_KEY` défini ✅
- `DB_CONNECTION=sqlite`, `DB_DATABASE=:memory:` ✅
- `SESSION_DRIVER=array`, `CACHE_STORE=array`, `QUEUE_CONNECTION=sync` ✅
- `BCRYPT_ROUNDS=4` pour tests rapides ✅

### CI (`.github/workflows/tests.yml`)
- PHP 8.4, Node 22 ✅
- `composer install`, `npm i`, `cp .env.example .env`, `php artisan key:generate` ✅
- **Build assets** : `npm run build` (nécessaire pour le manifest Vite) ✅
- Tests : `./vendor/bin/pest` ✅

### Points d’attention
1. **Tests en local** : exécuter `npm run build` avant `php artisan test` si les tests web (login, register, etc.) sont lancés, sinon erreur « Vite manifest not found ».
2. **Flux (Livewire)** : les workflows utilisent `secrets.FLUX_USERNAME` et `secrets.FLUX_LICENSE_KEY` ; à configurer dans le dépôt GitHub.
3. **Couverture de code** : `phpunit.xml` inclut `app` dans `<source>` ; ajouter `src` pour couvrir le namespace `ArchitectureCible`.
