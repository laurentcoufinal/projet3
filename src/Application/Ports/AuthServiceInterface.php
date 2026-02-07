<?php

namespace ArchitectureCible\Application\Ports;

use App\Models\User;

interface AuthServiceInterface
{
    /**
     * Authenticate user by email and password. Returns token and user on success, null on failure.
     *
     * @return array{token: string, user: User}|null
     */
    public function login(string $email, string $password): ?array;

    /**
     * Revoke current access token for the given user.
     */
    public function logout(User $user): void;

    /**
     * Get the authenticated user (e.g. from current request).
     */
    public function user(): ?User;
}
