<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTestingEnvironment
{
    /**
     * N'autorise la requête que si l'application tourne en environnement "testing".
     * Sinon retourne 404 pour que les routes de test ne soient pas exposées.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! app()->environment('testing')) {
            abort(404);
        }

        return $next($request);
    }
}
