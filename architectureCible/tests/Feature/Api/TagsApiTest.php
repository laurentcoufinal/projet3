<?php

use App\Models\Note;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('authenticated user can get their tags as json', function () {
    $user = User::factory()->create();
    $tag1 = Tag::factory()->create(['name' => 'Travail']);
    $tag2 = Tag::factory()->create(['name' => 'Perso']);
    Note::factory()->for($user)->for($tag1)->create();
    Note::factory()->for($user)->for($tag2)->create();

    $loginResponse = $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);
    $loginResponse->assertStatus(200);
    $token = $loginResponse->json('token');

    $response = $this->withToken($token)->getJson('/api/tags');

    $response->assertStatus(200)
        ->assertJsonCount(2, 'data')
        ->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'name',
                    'created_at',
                    'updated_at',
                ],
            ],
        ])
        ->assertJsonFragment(['name' => 'Travail'])
        ->assertJsonFragment(['name' => 'Perso']);
});

test('authenticated user can create a tag', function () {
    $user = User::factory()->create();

    $loginResponse = $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);
    $loginResponse->assertStatus(200);
    $token = $loginResponse->json('token');

    $response = $this->withToken($token)->postJson('/api/tags', [
        'name' => 'Nouveau tag',
    ]);

    $response->assertStatus(201)
        ->assertJsonStructure([
            'data' => [
                'id',
                'name',
                'created_at',
                'updated_at',
            ],
        ])
        ->assertJsonPath('data.name', 'Nouveau tag');

    $this->assertDatabaseHas('tags', ['name' => 'Nouveau tag']);
});

// Contrainte 2 : les tags sont globaux, ils n'appartiennent pas à un user
test('tags are global so GET returns all tags', function () {
    $user = User::factory()->create();
    $tag1 = Tag::factory()->create(['name' => 'Tag A']);
    $tag2 = Tag::factory()->create(['name' => 'Tag B']);
    Note::factory()->for($user)->for($tag1)->create();

    $loginResponse = $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);
    $loginResponse->assertStatus(200);
    $token = $loginResponse->json('token');

    $response = $this->withToken($token)->getJson('/api/tags');

    $response->assertStatus(200)->assertJsonCount(2, 'data');
    $this->assertTrue(collect($response->json('data'))->pluck('name')->contains('Tag A'));
    $this->assertTrue(collect($response->json('data'))->pluck('name')->contains('Tag B'));
});

test('tags are global so user sees tag they do not use in any note', function () {
    $user = User::factory()->create();
    $tagUsed = Tag::factory()->create(['name' => 'Tag utilisé']);
    $tagNotUsed = Tag::factory()->create(['name' => 'Tag non utilisé']);
    Note::factory()->for($user)->for($tagUsed)->create();

    $loginResponse = $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);
    $loginResponse->assertStatus(200);
    $token = $loginResponse->json('token');

    $response = $this->withToken($token)->getJson('/api/tags');

    $response->assertStatus(200);
    $names = collect($response->json('data'))->pluck('name');
    $this->assertTrue($names->contains('Tag non utilisé'), 'Tags are global: user must see tag they do not use.');
});

test('authenticated user with no tags gets empty list and message', function () {
    $user = User::factory()->create();

    $loginResponse = $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);
    $loginResponse->assertStatus(200);
    $token = $loginResponse->json('token');

    $response = $this->withToken($token)->getJson('/api/tags');

    $response->assertStatus(200)
        ->assertJsonPath('data', [])
        ->assertJsonPath('message', 'Aucun tag.');
});

test('create tag without name returns 422', function () {
    $user = User::factory()->create();

    $loginResponse = $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);
    $loginResponse->assertStatus(200);
    $token = $loginResponse->json('token');

    $response = $this->withToken($token)->postJson('/api/tags', []);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['name']);
});

test('create tag with empty name returns 422', function () {
    $user = User::factory()->create();

    $loginResponse = $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);
    $loginResponse->assertStatus(200);
    $token = $loginResponse->json('token');

    $response = $this->withToken($token)->postJson('/api/tags', [
        'name' => '',
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['name']);
});
