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
