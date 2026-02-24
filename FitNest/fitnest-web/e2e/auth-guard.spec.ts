import { test, expect } from '@playwright/test';

test.describe('Auth Guard', () => {
    test.beforeEach(async ({ page }) => {
        await page.context().clearCookies();
        await page.evaluate(() => localStorage.clear());
    });

    test('should redirect unauthenticated user from dashboard to login', async ({ page }) => {
        await page.goto('/dashboard');
        await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    });

    test('should redirect unauthenticated user from athletes to login', async ({ page }) => {
        await page.goto('/athletes');
        await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    });

    test('should redirect unknown routes to login', async ({ page }) => {
        await page.goto('/nonexistent-page');
        await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    });
});
