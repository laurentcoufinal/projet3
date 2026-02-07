import { test, expect } from '@playwright/test';

async function registerAndGoToDashboard(page: import('@playwright/test').Page) {
  const email = `e2e-dash-${Date.now()}@test.local`;
  const name = 'Dashboard User';
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
  return { res, email, name, password };
}

test.describe('Dashboard', () => {
  test.setTimeout(120000);
  test.beforeEach(async ({ page }) => {
    const out = await registerAndGoToDashboard(page);
    if (out.res.status() === 429) {
      await page.waitForTimeout(60000);
      const retry = await registerAndGoToDashboard(page);
      expect([200, 201]).toContain(retry.res.status());
    } else {
      expect([200, 201]).toContain(out.res.status());
    }
    await expect(page).toHaveURL(/\/dashboard$/, { timeout: 5000 });
    await page.waitForTimeout(2500);
  });

  test('affiche le dashboard avec formulaire note et tag', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /ajouter une note/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /ajouter un tag/i })).toBeVisible();
  });

  test('création d\'un tag puis apparition dans la liste', async ({ page }) => {
    const tagName = `Tag-E2E-${Date.now()}`;
    await page.getByLabel(/nom du tag/i).fill(tagName);
    await page.getByRole('button', { name: /^ajouter$/i }).click();
    await expect(page.getByRole('list').getByText(tagName)).toBeVisible();
  });

  test('création d\'une note avec un tag', async ({ page }) => {
    const tagName = `NoteTag-${Date.now()}`;
    await page.getByLabel(/nom du tag/i).fill(tagName);
    await page.getByRole('button', { name: /^ajouter$/i }).click();
    await expect(page.getByRole('list').getByText(tagName)).toBeVisible();

    const noteText = `Ma note E2E ${Date.now()}`;
    await page.getByLabel(/texte de la note/i).fill(noteText);
    await page.getByLabel(/choisir un tag/i).selectOption({ label: tagName });
    await page.getByRole('button', { name: /ajouter la note/i }).click();

    await expect(page.getByText(noteText)).toBeVisible();
    await expect(page.locator('li').filter({ hasText: noteText }).getByText(tagName)).toBeVisible();
  });

  test('suppression d\'une note', async ({ page }) => {
    const tagName = `DelTag-${Date.now()}`;
    await page.getByLabel(/nom du tag/i).fill(tagName);
    await page.getByRole('button', { name: /^ajouter$/i }).click();
    await expect(page.getByRole('list').getByText(tagName)).toBeVisible();

    const noteText = 'Note à supprimer';
    await page.getByLabel(/texte de la note/i).fill(noteText);
    await page.getByLabel(/choisir un tag/i).selectOption({ label: tagName });
    await page.getByRole('button', { name: /ajouter la note/i }).click();
    await expect(page.getByText(noteText)).toBeVisible();

    await page.getByRole('button', { name: /supprimer/i }).first().click();
    await expect(page.getByText(noteText)).not.toBeVisible();
  });

  test('déconnexion redirige vers login', async ({ page }) => {
    await page.getByRole('button', { name: /déconnecter/i }).click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole('heading', { name: /connexion/i })).toBeVisible();
  });
});
