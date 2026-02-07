import { test as base } from '@playwright/test';
import type { APIResponse } from '@playwright/test';

const TEST_USER_EMAIL = process.env.TEST_USER_EMAIL ?? 'test@example.com';
const TEST_USER_PASSWORD = process.env.TEST_USER_PASSWORD ?? 'password';

export type AuthenticatedRequest = {
  get: (url: string, options?: object) => Promise<APIResponse>;
  post: (url: string, options?: object) => Promise<APIResponse>;
  put: (url: string, options?: object) => Promise<APIResponse>;
  delete: (url: string, options?: object) => Promise<APIResponse>;
};

export type AuthFixtures = {
  token: string;
  authRequest: AuthenticatedRequest;
};

function withAuth(
  request: import('@playwright/test').APIRequestContext,
  token: string
): AuthenticatedRequest {
  const headers = { Authorization: `Bearer ${token}` };
  return {
    get: (url: string, options?: object) =>
      request.get(url, {
        ...(options as object),
        headers: { ...((options as { headers?: Record<string, string> })?.headers ?? {}), ...headers },
      }),
    post: (url: string, options?: object) =>
      request.post(url, {
        ...(options as object),
        headers: { ...((options as { headers?: Record<string, string> })?.headers ?? {}), ...headers },
      }),
    put: (url: string, options?: object) =>
      request.put(url, {
        ...(options as object),
        headers: { ...((options as { headers?: Record<string, string> })?.headers ?? {}), ...headers },
      }),
    delete: (url: string, options?: object) =>
      request.delete(url, {
        ...(options as object),
        headers: { ...((options as { headers?: Record<string, string> })?.headers ?? {}), ...headers },
      }),
  };
}

export const test = base.extend<AuthFixtures>({
  token: async ({ request }, use) => {
    const response = await request.post('/api/auth/login', {
      data: { email: TEST_USER_EMAIL, password: TEST_USER_PASSWORD },
    });
    if (!response.ok()) {
      const text = await response.text();
      throw new Error(
        `Login failed (${response.status()}): ${text}. Ensure DB is migrated and user ${TEST_USER_EMAIL} exists (e.g. php artisan db:seed --class=ApiTestSeeder).`
      );
    }
    const body = await response.json();
    await use(body.token);
  },

  authRequest: async ({ request, token }, use) => {
    await use(withAuth(request, token));
  },
});

export { expect } from '@playwright/test';
