import { test, expect, Page } from '@playwright/test';

async function loginAsGuest(page: Page) {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.locator('text=Continue as Guest').click();
    await expect(page).toHaveURL(/\/home/, { timeout: 10000 });
}

test.describe('Mobile Home Page', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsGuest(page);
    });

    test('should display welcome message for guest', async ({ page }) => {
        await expect(page.locator('text=Hey,')).toBeVisible();
    });

    test('should show guest mode banner', async ({ page }) => {
        await expect(page.locator('.guest-banner')).toBeVisible();
    });

    test('should display quick action cards', async ({ page }) => {
        await expect(page.locator('text=Log Workout')).toBeVisible();
        await expect(page.locator('text=Nutrition')).toBeVisible();
        await expect(page.locator('text=AI Coach')).toBeVisible();
        await expect(page.locator('text=Community')).toBeVisible();
    });

    test('should display bottom tab bar', async ({ page }) => {
        const tabBar = page.locator('.tab-bar');
        await expect(tabBar).toBeVisible();
        await expect(page.locator('.tab-bar >> text=Home')).toBeVisible();
        await expect(page.locator('.tab-bar >> text=Workout')).toBeVisible();
        await expect(page.locator('.tab-bar >> text=Nutrition')).toBeVisible();
    });

    test('should navigate to workout capture', async ({ page }) => {
        await page.locator('.action-card', { hasText: 'Log Workout' }).click();
        await expect(page).toHaveURL(/\/workout-capture/, { timeout: 5000 });
    });

    test('should navigate to nutrition page', async ({ page }) => {
        await page.locator('.action-card', { hasText: 'Nutrition' }).click();
        await expect(page).toHaveURL(/\/nutrition/, { timeout: 5000 });
    });

    test('should navigate to progress page', async ({ page }) => {
        await page.locator('.progress-card').click();
        await expect(page).toHaveURL(/\/progress/, { timeout: 5000 });
    });
});
