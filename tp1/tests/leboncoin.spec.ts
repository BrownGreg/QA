// tests/leboncoin.spec.ts
import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('Leboncoin – CI/CD smoke tests', () => {
  
  test.use({ browserName: 'firefox' });
  test('🚩 #1 – Les filtres de recherche doivent être actifs sous Firefox', async ({ page }) => {
    await page.goto('https://www.leboncoin.fr/');
    // Lancer une recherche basique
    await page.locator('input[placeholder*="Que recherchez-vous"]').fill('vélo');
    await page.locator('button[type="submit"]').click();
    // Vérifier que le filtre de prix est cliquable
    const prixFilter = page.locator('select[name="price"]');
    await expect(prixFilter).toBeEnabled();
    // Appliquer un filtre de prix et contrôler la mise à jour
    await prixFilter.selectOption({ label: '50 € – 150 €' });
    await expect(page).toHaveURL(/price_min=50&price_max=150/);
  });

  test.use({ browserName: 'chromium' });
  test('🚩 #2 – L’ajout de photos doit fonctionner (web)', async ({ page }) => {
    await page.goto('https://www.leboncoin.fr/compte/mes-annonces'); 
    // on suppose que l'utilisateur est déjà connecté via un cookie ou fixture
    await page.goto('https://www.leboncoin.fr/annonces/creer/');
    // Remplissage rapide du formulaire minimum
    await page.locator('input[name="title"]').fill('Test Upload');
    await page.locator('input[name="price"]').fill('1');
    // Upload d’une image test de < 1 Mo
    const filePath = path.resolve(__dirname, 'fixtures', 'photo-test-500ko.jpg');
    await page.setInputFiles('input[type="file"]', filePath);
    // Vérifier qu’une prévisualisation apparaît
    const preview = page.locator('.upload-preview img');
    await expect(preview).toBeVisible();
  });

  test.use({ browserName: 'chromium' });
  test('🚩 #3 – Accès aux annonces sauvegardées', async ({ page }) => {
    await page.goto('https://www.leboncoin.fr/compte/favoris');
    // On attend que la liste soit chargée
    const items = page.locator('.react-favorites-list .ad-card');
    // Si au moins un ad-card est visible, le bug #3 est réglé
    await expect(items.first()).toBeVisible({ timeout: 5000 });
  });

});
