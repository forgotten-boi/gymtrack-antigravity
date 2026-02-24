import { test, expect } from '@playwright/test';

test.describe('Mobile Login Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.evaluate(() => localStorage.clear());
        await page.goto('/login');
        await page.waitForLoadState('networkidle');
    });

    test('should display the login page', async ({ page }) => {
        await expect(page.locator('h1')).toHaveText('FitNest');
        await expect(page.locator('.subtitle')).toHaveText('Track Your Fitness Journey');
    });

    test('should display all login options', async ({ page }) => {
        await expect(page.locator('text=Sign In')).toBeVisible();
        await expect(page.locator('text=Continue with Google')).toBeVisible();
        await expect(page.locator('text=Continue as Guest')).toBeVisible();
    });

    test('should login with email and navigate to home', async ({ page }) => {
        await page.locator('ion-input[type="email"] input').fill('test@example.com');
        await page.locator('ion-input[type="password"] input').fill('password');
        await page.locator('text=Sign In').click();
        await expect(page).toHaveURL(/\/home/, { timeout: 10000 });
    });

    test('should login as guest and navigate to home', async ({ page }) => {
        await page.locator('text=Continue as Guest').click();
        await expect(page).toHaveURL(/\/home/, { timeout: 10000 });
    });
});
