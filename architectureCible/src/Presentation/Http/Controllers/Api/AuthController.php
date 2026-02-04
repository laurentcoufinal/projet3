<?php

namespace ArchitectureCible\Presentation\Http\Controllers\Api;

use ArchitectureCible\Application\Ports\AuthServiceInterface;
use ArchitectureCible\Presentation\Http\Requests\LoginRequest;
use ArchitectureCible\Presentation\Http\Resources\UserResource;
use Illuminate\Http\JsonResponse;

class AuthController
{
    public function __construct(
        private AuthServiceInterface $authService
    ) {}

    public function login(LoginRequest $request): JsonResponse
    {
        $result = $this->authService->login(
            $request->validated('email'),
            $request->validated('password')
        );

        if ($result === null) {
            return response()->json([
                'message' => 'Invalid credentials.',
            ], 401);
        }

        return response()->json([
            'token' => $result['token'],
            'user' => new UserResource($result['user']),
        ], 200);
    }

    public function logout(): JsonResponse
    {
        $user = $this->authService->user();
        if ($user !== null) {
            $this->authService->logout($user);
        }

        return response()->json(['message' => 'Logged out.'], 200);
    }

    public function user(): JsonResponse
    {
        $user = $this->authService->user();
        if ($user === null) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        return response()->json(['data' => new UserResource($user)], 200);
    }
}
