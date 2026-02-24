import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.context().clearCookies();
        await page.evaluate(() => localStorage.clear());
        await page.goto('/login');
    });

    test('should display the login form', async ({ page }) => {
        await expect(page.locator('h1')).toHaveText('FitNest');
        await expect(page.locator('text=Coach Dashboard')).toBeVisible();
        await expect(page.locator('#email')).toBeVisible();
        await expect(page.locator('#password')).toBeVisible();
        await expect(page.locator('button.login-btn')).toHaveText('Sign In');
    });

    test('should show error when fields are empty', async ({ page }) => {
        await page.click('button.login-btn');
        await expect(page.locator('.error-message')).toHaveText('Please enter email and password');
    });

    test('should show error with invalid credentials', async ({ page }) => {
        await page.fill('#email', 'bad@email.com');
        await page.fill('#password', 'wrongpassword');
        await page.click('button.login-btn');
        await expect(page.locator('.error-message')).toHaveText('Invalid email or password', { timeout: 5000 });
    });

    test('should login successfully with valid credentials', async ({ page }) => {
        await page.fill('#email', 'coach@fitnest.com');
        await page.fill('#password', 'password');
        await page.click('button.login-btn');
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    });

    test('should show loading state during login', async ({ page }) => {
        await page.fill('#email', 'coach@fitnest.com');
        await page.fill('#password', 'password');
        await page.click('button.login-btn');
        await expect(page.locator('text=Signing in...')).toBeVisible();
    });
});
