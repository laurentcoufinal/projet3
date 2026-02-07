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

test('login with missing email returns 422', function () {
    $response = $this->postJson('/api/auth/login', [
        'password' => 'password',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

test('login with invalid email format returns 422', function () {
    $response = $this->postJson('/api/auth/login', [
        'email' => 'not-an-email',
        'password' => 'password',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});

test('login with missing password returns 422', function () {
    $response = $this->postJson('/api/auth/login', [
        'email' => 'user@example.com',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['password']);
});

test('logout without token returns 401', function () {
    $response = $this->postJson('/api/auth/logout');

    $response->assertStatus(401);
});

// Routes attendues par le frontend : POST /api/login et POST /api/register
test('POST /api/login works like POST /api/auth/login', function () {
    $user = User::factory()->create();

    $response = $this->postJson('/api/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);

    $response->assertStatus(200)
        ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email']])
        ->assertJsonPath('user.email', $user->email);
    $this->assertNotEmpty($response->json('token'));
});

test('POST /api/register creates user and returns token and user', function () {
    $response = $this->postJson('/api/register', [
        'name' => 'New User',
        'email' => 'new@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email']])
        ->assertJsonPath('user.name', 'New User')
        ->assertJsonPath('user.email', 'new@example.com');
    $this->assertNotEmpty($response->json('token'));
    $this->assertDatabaseHas('users', ['email' => 'new@example.com']);
});

test('POST /api/register with duplicate email returns 422', function () {
    User::factory()->create(['email' => 'existing@example.com']);

    $response = $this->postJson('/api/register', [
        'name' => 'Other',
        'email' => 'existing@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['email']);
});
