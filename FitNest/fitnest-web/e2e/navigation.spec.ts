import { test, expect, Page } from '@playwright/test';

async function loginAsCoach(page: Page) {
    await page.goto('/login');
    await page.fill('#email', 'coach@fitnest.com');
    await page.fill('#password', 'password');
    await page.click('button.login-btn');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
}

test.describe('Layout & Navigation', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsCoach(page);
    });

    test('should display sidebar with logo', async ({ page }) => {
        await expect(page.locator('.logo-icon')).toHaveText('F');
        await expect(page.locator('.logo-text')).toHaveText('FitNest');
    });

    test('should display navigation items', async ({ page }) => {
        await expect(page.locator('text=Dashboard')).toBeVisible();
        await expect(page.locator('text=Athletes')).toBeVisible();
    });

    test('should navigate between pages via sidebar', async ({ page }) => {
        await page.locator('.nav-item', { hasText: 'Athletes' }).click();
        await expect(page).toHaveURL(/\/athletes/, { timeout: 5000 });

        await page.locator('.nav-item', { hasText: 'Dashboard' }).click();
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 5000 });
    });

    test('should collapse sidebar on toggle', async ({ page }) => {
        await page.click('.toggle-btn');
        await expect(page.locator('.layout')).toHaveClass(/collapsed/);

        // Logo text should be hidden when collapsed
        await expect(page.locator('.logo-text')).not.toBeVisible();
    });

    test('should expand sidebar on second toggle', async ({ page }) => {
        await page.click('.toggle-btn');
        await page.click('.toggle-btn');
        await expect(page.locator('.layout')).not.toHaveClass(/collapsed/);
        await expect(page.locator('.logo-text')).toBeVisible();
    });

    test('should display user info in sidebar footer', async ({ page }) => {
        await expect(page.locator('.user-avatar')).toBeVisible();
        await expect(page.locator('.user-name')).toContainText('Coach');
    });

    test('should display notification bell in top bar', async ({ page }) => {
        await expect(page.locator('.icon-btn')).toBeVisible();
        await expect(page.locator('.notification-badge')).toBeVisible();
    });

    test('should open notification dropdown on click', async ({ page }) => {
        await page.click('.icon-btn');
        await expect(page.locator('.notification-dropdown')).toBeVisible();
        await expect(page.locator('text=Notifications')).toBeVisible();
    });

    test('should show notification items', async ({ page }) => {
        await page.click('.icon-btn');
        const items = page.locator('.notification-item');
        await expect(items.first()).toBeVisible();
    });

    test('should mark all notifications as read', async ({ page }) => {
        await page.click('.icon-btn');
        await page.click('text=Mark all read');
        await expect(page.locator('.notification-badge')).not.toBeVisible();
    });

    test('should logout when clicking logout button', async ({ page }) => {
        await page.click('.logout-btn');
        await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
    });
});
