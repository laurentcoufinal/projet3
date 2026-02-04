<?php

use App\Models\Note;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('authenticated user can get their notes as json', function () {
    $user = User::factory()->create();
    $note1 = Note::factory()->for($user)->create(['text' => 'Ma première note']);
    $note2 = Note::factory()->for($user)->create(['text' => 'Ma deuxième note']);

    $loginResponse = $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);
    $loginResponse->assertStatus(200);
    $token = $loginResponse->json('token');

    $response = $this->withToken($token)->getJson('/api/notes');

    $response->assertStatus(200)
        ->assertJsonCount(2, 'data')
        ->assertJsonStructure([
            'data' => [
                '*' => [
                    'id',
                    'user_id',
                    'tag_id',
                    'text',
                    'created_at',
                    'updated_at',
                ],
            ],
        ])
        ->assertJsonFragment(['text' => 'Ma première note'])
        ->assertJsonFragment(['text' => 'Ma deuxième note']);
});

test('authenticated user can update their note', function () {
    $user = User::factory()->create();
    $note = Note::factory()->for($user)->create(['text' => 'Texte initial']);

    $loginResponse = $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);
    $loginResponse->assertStatus(200);
    $token = $loginResponse->json('token');

    $response = $this->withToken($token)->putJson('/api/notes/'.$note->id, [
        'text' => 'Texte mis à jour',
    ]);

    $response->assertStatus(200)
        ->assertJsonPath('data.id', $note->id)
        ->assertJsonPath('data.text', 'Texte mis à jour');

    $note->refresh();
    $this->assertSame('Texte mis à jour', $note->text);
});

test('authenticated user can delete their note', function () {
    $user = User::factory()->create();
    $note = Note::factory()->for($user)->create(['text' => 'Note à supprimer']);

    $loginResponse = $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);
    $loginResponse->assertStatus(200);
    $token = $loginResponse->json('token');

    $response = $this->withToken($token)->deleteJson('/api/notes/'.$note->id);

    $response->assertStatus(200)
        ->assertJsonPath('message', 'Note supprimée.');
    $this->assertDatabaseMissing('notes', ['id' => $note->id]);
});

// Contrainte 1 : toute note doit choisir un tag existant
test('create note with existing tag_id succeeds', function () {
    $user = User::factory()->create();
    $tag = Tag::factory()->create(['name' => 'Mon tag']);

    $loginResponse = $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);
    $loginResponse->assertStatus(200);
    $token = $loginResponse->json('token');

    $response = $this->withToken($token)->postJson('/api/notes', [
        'text' => 'Ma nouvelle note',
        'tag_id' => $tag->id,
    ]);

    $response->assertStatus(201)
        ->assertJsonPath('data.text', 'Ma nouvelle note')
        ->assertJsonPath('data.tag_id', $tag->id);
    $this->assertDatabaseHas('notes', ['text' => 'Ma nouvelle note', 'tag_id' => $tag->id]);
});

test('create note with non existing tag_id fails with 422', function () {
    $user = User::factory()->create();

    $loginResponse = $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'password',
    ]);
    $loginResponse->assertStatus(200);
    $token = $loginResponse->json('token');

    $response = $this->withToken($token)->postJson('/api/notes', [
        'text' => 'Ma note',
        'tag_id' => 99999,
    ]);

    $response->assertStatus(422)
        ->assertJsonValidationErrors(['tag_id']);
    $this->assertDatabaseMissing('notes', ['text' => 'Ma note']);
});
