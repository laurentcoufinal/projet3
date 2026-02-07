const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';

export function getApiBase(): string {
  return API_BASE;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: { id: number; name: string; email: string };
  token: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message ?? `Login failed: ${res.status}`);
  }
  return res.json();
}

export async function register(credentials: RegisterCredentials): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(credentials),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message ?? `Register failed: ${res.status}`);
  }
  return res.json();
}

export interface Tag {
  id: number;
  name: string;
}

function authHeaders(token: string) {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

export async function getTags(token: string | null): Promise<Tag[]> {
  if (!token) return [];
  const res = await fetch(`${API_BASE}/tags`, {
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message ?? `Failed to fetch tags: ${res.status}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : data.data ?? [];
}

export async function createTag(name: string, token: string): Promise<Tag> {
  const res = await fetch(`${API_BASE}/tags`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const message = data.errors?.name?.[0] ?? data.message ?? `Failed to create tag: ${res.status}`;
    throw new Error(message);
  }
  const data = await res.json();
  return data.data ?? data;
}

export interface Note {
  id: number;
  text: string;
  tag_id: number;
  tag?: Tag;
}

export async function getNotes(token: string | null): Promise<Note[]> {
  if (!token) return [];
  const res = await fetch(`${API_BASE}/notes`, {
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message ?? `Failed to fetch notes: ${res.status}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : data.data ?? [];
}

export async function createNote(text: string, tag_id: number, token: string): Promise<Note> {
  const res = await fetch(`${API_BASE}/notes`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ text, tag_id }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg = data.errors?.text?.[0] ?? data.errors?.tag_id?.[0] ?? data.message ?? `Failed to create note: ${res.status}`;
    throw new Error(msg);
  }
  const data = await res.json();
  return data.data ?? data;
}

export async function deleteNote(id: number, token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/notes/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message ?? `Failed to delete note: ${res.status}`);
  }
}
