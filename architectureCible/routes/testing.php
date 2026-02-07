<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Routes de test (actives uniquement quand APP_ENV=testing)
|--------------------------------------------------------------------------
|
| Ces routes ne sont enregistrées que lorsque l'application est en
| environnement "testing". Elles permettent aux tests E2E (ex. Playwright)
| de vérifier que le serveur est bien en mode test.
|
*/

Route::get('testing/ping', function () {
    return response()->json([
        'ok' => true,
        'env' => app()->environment(),
    ]);
})->name('testing.ping');
