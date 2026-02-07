<?php

use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('GET /api/testing/ping returns 200 and env testing only when APP_ENV is testing', function () {
    $this->assertTrue(app()->environment('testing'), 'phpunit.xml sets APP_ENV=testing');

    $response = $this->getJson('/api/testing/ping');

    $response->assertStatus(200)
        ->assertJson(['ok' => true, 'env' => 'testing']);
});
