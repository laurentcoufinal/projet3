<?php

namespace ArchitectureCible\Providers;

use ArchitectureCible\Application\Ports\AuthServiceInterface;
use ArchitectureCible\Application\Ports\NoteRepositoryInterface;
use ArchitectureCible\Application\Ports\TagRepositoryInterface;
use ArchitectureCible\Infrastructure\Auth\SanctumAuthService;
use ArchitectureCible\Infrastructure\Persistence\EloquentNoteRepository;
use ArchitectureCible\Infrastructure\Persistence\EloquentTagRepository;
use Illuminate\Support\ServiceProvider;

class ArchitectureCibleServiceProvider extends ServiceProvider
{
    /**
     * Register services for the API REST Sanctum migration.
     */
    public function register(): void
    {
        $this->app->bind(AuthServiceInterface::class, SanctumAuthService::class);
        $this->app->bind(NoteRepositoryInterface::class, EloquentNoteRepository::class);
        $this->app->bind(TagRepositoryInterface::class, EloquentTagRepository::class);
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        //
    }
}
