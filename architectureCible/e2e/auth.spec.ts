import { expect } from '@playwright/test';
import { test } from './fixtures/api-auth';

test.describe('API Auth', () => {
  test('POST /api/auth/login returns token and user', async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { email: process.env.TEST_USER_EMAIL ?? 'test@example.com', password: process.env.TEST_USER_PASSWORD ?? 'password' },
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty('token');
    expect(body.token).toBeTruthy();
    expect(body).toHaveProperty('user');
    expect(body.user).toHaveProperty('email');
    expect(body.user).toHaveProperty('name');
    expect(body.user).toHaveProperty('id');
  });

  test('POST /api/auth/login with invalid credentials returns 401', async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { email: 'wrong@example.com', password: 'wrong' },
    });
    expect(res.status()).toBe(401);
    const body = await res.json();
    expect(body.message).toBe('Invalid credentials.');
  });

  test('GET /api/auth/user without token returns 401', async ({ request }) => {
    const res = await request.get('/api/auth/user');
    expect(res.status()).toBe(401);
  });

  test('GET /api/auth/user with token returns user data', async ({ authRequest }) => {
    const res = await authRequest.get('/api/auth/user');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty('data');
    expect(body.data).toHaveProperty('email');
    expect(body.data).toHaveProperty('name');
    expect(body.data).toHaveProperty('id');
  });

  test('POST /api/auth/logout with token returns 200', async ({ authRequest }) => {
    const res = await authRequest.post('/api/auth/logout');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.message).toContain('Logged out');
  });

  test('login with missing email returns 422', async ({ request }) => {
    const res = await request.post('/api/auth/login', {
      data: { password: 'password' },
    });
    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.errors).toHaveProperty('email');
  });
});
