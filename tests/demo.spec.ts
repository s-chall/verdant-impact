import { test, expect } from '@playwright/test';

test('demo opens Demak, runs agents, result visible', async ({ page }) => {
  await page.goto('/?demo=1');
  await expect(page.locator('#today')).not.toHaveText(/Friday/i);
  await expect(page.locator('#pName')).toHaveText('Demak Coastal Recovery');
  await expect(page.locator('#detail')).toBeVisible();
  await page.locator('#runBtn').click();
  await expect(page.locator('#result')).toBeVisible({ timeout: 20_000 });
  await expect(page.locator('#result')).toContainText('Automatic check');
  await expect(page.locator('#sha')).toContainText('SHA-256');
  await expect(page.locator('#activity li').first()).toBeVisible();
  await expect.poll(async () => page.locator('#activity li').count()).toBeGreaterThanOrEqual(3);
  await expect(page.locator('#fundBtn')).toBeVisible();
  await expect(page.locator('#vaultCard')).toContainText(/locked/i);
});

test('deep link ?project=mangrove&studio=1 opens Demak', async ({ page }) => {
  await page.goto('/?project=mangrove&studio=1');
  await expect(page.locator('#pName')).toHaveText('Demak Coastal Recovery');
});

test('query change from Palawan to mangrove opens Demak', async ({ page }) => {
  await page.goto('/?project=palawan');
  await expect(page.locator('#pName')).toHaveText('Palawan Reefs');
  await page.evaluate(() => {
    history.pushState({}, '', '/?project=mangrove&studio=1');
  });
  await expect(page.locator('#pName')).toHaveText('Demak Coastal Recovery');
});

test('home puts Solana nonprofit funding on the first screen', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#intro h1')).toContainText(/USDC/i);
  await expect(page.locator('#intro h1')).toContainText(/Solana/i);
  await expect(page.locator('#solChip')).toBeVisible();
  await expect(page.getByText('Pick a quest')).toBeVisible();
});

test('session reefs does not override mangrove deep link', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    sessionStorage.setItem('verdant.session', JSON.stringify({ project: 'gbr', cat: 'reefs' }));
  });
  await page.goto('/?project=mangrove&studio=1');
  await expect(page.locator('#pName')).toHaveText('Demak Coastal Recovery');
});

test('preview USDC stays locked and does not claim a send', async ({ page }) => {
  await page.goto('/?demo=1');
  await expect(page.locator('#vaultCard')).toContainText(/locked/i);
  await page.locator('#fundBtn').click();
  await expect(page.locator('#fundDlg')).toBeVisible();
  await expect(page.locator('#fundDlg')).toContainText(/not deployed/i);
  await page.locator('#fundGo').click();
  await expect(page.locator('#vaultRaised')).not.toHaveText('0');
  await expect(page.locator('#vaultCard')).toContainText(/locked/i);
  await expect(page.locator('#activity li').first()).toContainText(/USDC preview/i);
});

