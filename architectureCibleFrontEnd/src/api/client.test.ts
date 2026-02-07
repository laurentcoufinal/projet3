import { describe, it, expect, vi, afterEach } from 'vitest';
import { getTags, createTag, getNotes, createNote, deleteNote } from './client';

describe('api client tags', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    vi.stubGlobal('fetch', originalFetch);
  });

  describe('getTags', () => {
    it('retourne un tableau vide si token est null', async () => {
      const result = await getTags(null);
      expect(result).toEqual([]);
    });

    it('retourne la liste des tags sur succès', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve([{ id: 1, name: 'Work' }, { id: 2, name: 'Personal' }]),
        })
      );
      const result = await getTags('token');
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ id: 1, name: 'Work' });
      expect(result[1]).toEqual({ id: 2, name: 'Personal' });
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/tags'),
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer token' }),
        })
      );
    });

    it('lance une erreur si la réponse n\'est pas ok', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          json: () => Promise.resolve({ message: 'Unauthorized' }),
        })
      );
      await expect(getTags('bad')).rejects.toThrow('Unauthorized');
    });
  });

  describe('createTag', () => {
    it('envoie POST avec le nom et le token et retourne le tag créé', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () => Promise.resolve({ id: 3, name: 'New' }),
        })
      );
      const result = await createTag('New', 'token');
      expect(result).toEqual({ id: 3, name: 'New' });
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/tags'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ Authorization: 'Bearer token' }),
          body: JSON.stringify({ name: 'New' }),
        })
      );
    });

    it('lance une erreur avec le message de validation si 422', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          json: () =>
            Promise.resolve({
              errors: { name: ['The name has already been taken.'] },
              message: 'Validation failed',
            }),
        })
      );
      await expect(createTag('Duplicate', 'token')).rejects.toThrow(/already been taken/i);
    });
  });
});

describe('api client notes', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    vi.stubGlobal('fetch', originalFetch);
  });

  describe('getNotes', () => {
    it('retourne un tableau vide si token est null', async () => {
      const result = await getNotes(null);
      expect(result).toEqual([]);
    });

    it('retourne la liste des notes sur succès', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () =>
            Promise.resolve([
              { id: 1, text: 'Note 1', tag_id: 1, tag: { id: 1, name: 'Work' } },
            ]),
        })
      );
      const result = await getNotes('token');
      expect(result).toHaveLength(1);
      expect(result[0].text).toBe('Note 1');
      expect(result[0].tag?.name).toBe('Work');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/notes'),
        expect.objectContaining({
          headers: expect.objectContaining({ Authorization: 'Bearer token' }),
        })
      );
    });

    it('lance une erreur si la réponse n\'est pas ok', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          json: () => Promise.resolve({ message: 'Unauthorized' }),
        })
      );
      await expect(getNotes('bad')).rejects.toThrow('Unauthorized');
    });
  });

  describe('createNote', () => {
    it('envoie POST avec text, tag_id et token et retourne la note créée', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          json: () =>
            Promise.resolve({ id: 1, text: 'My note', tag_id: 2, tag: { id: 2, name: 'Personal' } }),
        })
      );
      const result = await createNote('My note', 2, 'token');
      expect(result.text).toBe('My note');
      expect(result.tag_id).toBe(2);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/notes'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({ Authorization: 'Bearer token' }),
          body: JSON.stringify({ text: 'My note', tag_id: 2 }),
        })
      );
    });

    it('lance une erreur avec le message de validation si 422', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          json: () =>
            Promise.resolve({
              errors: { tag_id: ['The selected tag is invalid.'] },
              message: 'Validation failed',
            }),
        })
      );
      await expect(createNote('text', 999, 'token')).rejects.toThrow(/invalid/i);
    });
  });

  describe('deleteNote', () => {
    it('envoie DELETE avec l\'id et le token', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({ ok: true })
      );
      await deleteNote(1, 'token');
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/notes/1'),
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({ Authorization: 'Bearer token' }),
        })
      );
    });

    it('lance une erreur si la réponse n\'est pas ok', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          json: () => Promise.resolve({ message: 'Forbidden' }),
        })
      );
      await expect(deleteNote(1, 'token')).rejects.toThrow('Forbidden');
    });
  });
});
