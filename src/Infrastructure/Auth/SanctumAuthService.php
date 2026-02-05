<?php

namespace ArchitectureCible\Infrastructure\Auth;

use App\Models\User;
use ArchitectureCible\Application\Ports\AuthServiceInterface;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class SanctumAuthService implements AuthServiceInterface
{
    public function login(string $email, string $password): ?array
    {
        $user = User::where('email', $email)->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            return null;
        }

        $token = $user->createToken('api')->plainTextToken;

        return [
            'token' => $token,
            'user' => $user,
        ];
    }

    public function logout(User $user): void
    {
        $user->currentAccessToken()?->delete();
    }

    public function user(): ?User
    {
        /** @var User|null */
        return Auth::guard('sanctum')->user();
    }
}
