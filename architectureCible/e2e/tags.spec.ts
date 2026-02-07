import { expect } from '@playwright/test';
import { test } from './fixtures/api-auth';

test.describe('API Tags (table tags)', () => {
  test('GET /api/tags without token returns 401', async ({ request }) => {
    const res = await request.get('/api/tags');
    expect(res.status()).toBe(401);
  });

  test('GET /api/tags returns list and structure', async ({ authRequest }) => {
    const res = await authRequest.get('/api/tags');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
    if (body.data.length > 0) {
      expect(body.data[0]).toHaveProperty('id');
      expect(body.data[0]).toHaveProperty('name');
      expect(body.data[0]).toHaveProperty('created_at');
      expect(body.data[0]).toHaveProperty('updated_at');
    }
  });

  test('POST /api/tags creates a tag', async ({ authRequest }) => {
    const name = `Tag Playwright ${Date.now()}`;
    const res = await authRequest.post('/api/tags', {
      data: { name },
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body).toHaveProperty('data');
    expect(body.data.name).toBe(name);
    expect(body.data).toHaveProperty('id');
    expect(body.data).toHaveProperty('created_at');
    expect(body.data).toHaveProperty('updated_at');
  });

  test('GET /api/tags after create returns the new tag', async ({ authRequest }) => {
    const name = `Tag List ${Date.now()}`;
    await authRequest.post('/api/tags', { data: { name } });
    const listRes = await authRequest.get('/api/tags');
    expect(listRes.ok()).toBeTruthy();
    const listBody = await listRes.json();
    const found = listBody.data.find((t: { name: string }) => t.name === name);
    expect(found).toBeDefined();
    expect(found.name).toBe(name);
  });

  test('POST /api/tags without name returns 422', async ({ authRequest }) => {
    const res = await authRequest.post('/api/tags', { data: {} });
    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.errors).toHaveProperty('name');
  });

  test('POST /api/tags with empty name returns 422', async ({ authRequest }) => {
    const res = await authRequest.post('/api/tags', { data: { name: '' } });
    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.errors).toHaveProperty('name');
  });
});
