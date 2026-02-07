import { expect } from '@playwright/test';
import { test } from './fixtures/api-auth';

test.describe('API Notes (table notes)', () => {
  test('GET /api/notes without token returns 401', async ({ request }) => {
    const res = await request.get('/api/notes');
    expect(res.status()).toBe(401);
  });

  test('GET /api/notes returns list and structure', async ({ authRequest }) => {
    const res = await authRequest.get('/api/notes');
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);
    if (body.data.length > 0) {
      const note = body.data[0];
      expect(note).toHaveProperty('id');
      expect(note).toHaveProperty('user_id');
      expect(note).toHaveProperty('tag_id');
      expect(note).toHaveProperty('text');
      expect(note).toHaveProperty('created_at');
      expect(note).toHaveProperty('updated_at');
    }
  });

  test('POST /api/notes creates a note (with tag)', async ({ authRequest }) => {
    const tagRes = await authRequest.post('/api/tags', {
      data: { name: `Tag for note ${Date.now()}` },
    });
    expect(tagRes.ok()).toBeTruthy();
    const tagBody = await tagRes.json();
    const tagId = tagBody.data.id;

    const text = `Note Playwright ${Date.now()}`;
    const noteRes = await authRequest.post('/api/notes', {
      data: { text, tag_id: tagId },
    });
    expect(noteRes.status()).toBe(201);
    const noteBody = await noteRes.json();
    expect(noteBody).toHaveProperty('data');
    expect(noteBody.data.text).toBe(text);
    expect(noteBody.data.tag_id).toBe(tagId);
    expect(noteBody.data).toHaveProperty('id');
    expect(noteBody.data).toHaveProperty('user_id');
    expect(noteBody.data).toHaveProperty('created_at');
    expect(noteBody.data).toHaveProperty('updated_at');
  });

  test('PUT /api/notes/:id updates a note', async ({ authRequest }) => {
    const tagRes = await authRequest.post('/api/tags', {
      data: { name: `Tag update ${Date.now()}` },
    });
    const tagId = (await tagRes.json()).data.id;
    const createRes = await authRequest.post('/api/notes', {
      data: { text: 'Initial text', tag_id: tagId },
    });
    const noteId = (await createRes.json()).data.id;

    const newText = 'Updated text by Playwright';
    const updateRes = await authRequest.put(`/api/notes/${noteId}`, {
      data: { text: newText },
    });
    expect(updateRes.ok()).toBeTruthy();
    const updateBody = await updateRes.json();
    expect(updateBody.data.text).toBe(newText);
    expect(updateBody.data.id).toBe(noteId);
    expect(updateBody.message).toContain('mise à jour');
  });

  test('DELETE /api/notes/:id deletes a note', async ({ authRequest }) => {
    const tagRes = await authRequest.post('/api/tags', {
      data: { name: `Tag delete ${Date.now()}` },
    });
    const tagId = (await tagRes.json()).data.id;
    const createRes = await authRequest.post('/api/notes', {
      data: { text: 'Note to delete', tag_id: tagId },
    });
    const noteId = (await createRes.json()).data.id;

    const deleteRes = await authRequest.delete(`/api/notes/${noteId}`);
    expect(deleteRes.ok()).toBeTruthy();
    const deleteBody = await deleteRes.json();
    expect(deleteBody.message).toContain('supprimée');

    const getRes = await authRequest.get(`/api/notes`);
    const listBody = await getRes.json();
    const found = listBody.data.find((n: { id: number }) => n.id === noteId);
    expect(found).toBeUndefined();
  });

  test('PUT /api/notes/99999 returns 404', async ({ authRequest }) => {
    const res = await authRequest.put('/api/notes/99999', {
      data: { text: 'Any' },
    });
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.message).toContain('not found');
  });

  test('DELETE /api/notes/99999 returns 404', async ({ authRequest }) => {
    const res = await authRequest.delete('/api/notes/99999');
    expect(res.status()).toBe(404);
    const body = await res.json();
    expect(body.message).toContain('not found');
  });

  test('POST /api/notes with non-existing tag_id returns 422', async ({ authRequest }) => {
    const res = await authRequest.post('/api/notes', {
      data: { text: 'Note', tag_id: 99999 },
    });
    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.errors).toHaveProperty('tag_id');
  });

  test('POST /api/notes without tag_id returns 422', async ({ authRequest }) => {
    const res = await authRequest.post('/api/notes', {
      data: { text: 'Note only' },
    });
    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.errors).toHaveProperty('tag_id');
  });
});
