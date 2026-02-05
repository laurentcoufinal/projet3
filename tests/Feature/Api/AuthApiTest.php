<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('user can authenticate via api and receive token', function () {
    $user = User::factory()->create();

    $response = $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure([
            'token',
            'user' => [
                'id',
                'name',
                'email',
            ],
        ])
        ->assertJsonPath('user.email', $user->email);

    $this->assertNotEmpty($response->json('token'));
});

test('user cannot authenticate with invalid credentials', function () {
    $user = User::factory()->create();

    $response = $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $response->assertStatus(401)
        ->assertJson(['message' => 'Invalid credentials.']);
});

test('authenticated user can get their profile via api', function () {
    $user = User::factory()->create();

    $loginResponse = $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);
    $loginResponse->assertStatus(200);
    $token = $loginResponse->json('token');

    $response = $this->withToken($token)->getJson('/api/auth/user');

    $response->assertStatus(200)
        ->assertJsonPath('data.email', $user->email)
        ->assertJsonPath('data.name', $user->name);
});

test('authenticated user can logout via api', function () {
    $user = User::factory()->create();

    $loginResponse = $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);
    $loginResponse->assertStatus(200);
    $token = $loginResponse->json('token');

    $response = $this->withToken($token)->postJson('/api/auth/logout');

    $response->assertStatus(200);
});

test('unauthenticated request to protected endpoint returns 401', function () {
    $response = $this->getJson('/api/auth/user');

    $response->assertStatus(401);
});
