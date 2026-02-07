import { test, expect } from '@playwright/test';

test.describe('Authentification', () => {
  test('la page d\'accueil redirige vers /login', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: /connexion/i })).toBeVisible();
  });

  test('affichage du formulaire de connexion', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /connexion/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /se connecter/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /créer un compte/i })).toBeVisible();
  });

  test('lien vers inscription', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: /créer un compte/i }).click();
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByRole('heading', { name: /inscription/i })).toBeVisible();
  });

  test('inscription puis redirection vers dashboard', async ({ page }) => {
    const email = `e2e-${Date.now()}@test.local`;
    const name = 'E2E User';
    const password = 'password123';

    await page.goto('/register');
    await page.locator('#register-password-confirmation').waitFor({ state: 'visible' });
    await page.getByLabel(/nom/i).fill(name);
    await page.getByLabel(/email/i).fill(email);
    await page.locator('#register-password').fill(password);
    await page.locator('#register-password-confirmation').fill(password);

    const registerResponse = page.waitForResponse(
      (res) => res.url().includes('register') && res.request().method() === 'POST',
      { timeout: 15000 }
    );
    await page.getByRole('button', { name: /s'inscrire/i }).click();
    const res = await registerResponse;
    expect([200, 201]).toContain(res.status());

    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 5000 });
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByText(new RegExp(name, 'i'))).toBeVisible();
  });

  test('connexion avec identifiants valides après inscription', async ({ page }) => {
    const email = `e2e-login-${Date.now()}@test.local`;
    const name = 'Login Test';
    const password = 'secret456';

    await page.goto('/register');
    await page.locator('#register-password-confirmation').waitFor({ state: 'visible' });
    await page.getByLabel(/nom/i).fill(name);
    await page.getByLabel(/email/i).fill(email);
    await page.locator('#register-password').fill(password);
    await page.locator('#register-password-confirmation').fill(password);

    const registerResponse = page.waitForResponse(
      (res) => res.url().includes('register') && res.request().method() === 'POST',
      { timeout: 15000 }
    );
    await page.getByRole('button', { name: /s'inscrire/i }).click();
    const regRes = await registerResponse;
    expect([200, 201]).toContain(regRes.status());

    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 5000 });

    await page.getByRole('button', { name: /déconnecter/i }).click();
    await expect(page).toHaveURL(/\/login$/);

    await page.getByLabel(/email/i).fill(email);
    await page.getByLabel(/mot de passe/i).fill(password);
    await page.getByRole('button', { name: /se connecter/i }).click();
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 15000 });
    await expect(page.getByText(new RegExp(name, 'i'))).toBeVisible();
  });

  test('accès à /dashboard sans token redirige vers login', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('connexion avec identifiants invalides affiche une erreur', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('invalide@test.local');
    await page.getByLabel(/mot de passe/i).fill('wrong');
    await page.getByRole('button', { name: /se connecter/i }).click();

    await expect(page.getByRole('alert')).toBeVisible();
    await expect(page).toHaveURL(/\/login$/);
  });
});
