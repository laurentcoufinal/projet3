<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
<<<<<<< HEAD
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../architectureCible/routes/api.php',
=======
        api: __DIR__.'/../routes/api.php',
>>>>>>> a8db11e320cb4c920879e8c7d0a67f63e2dd730b
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        //
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
