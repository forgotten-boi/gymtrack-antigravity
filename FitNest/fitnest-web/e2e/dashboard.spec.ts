import { test, expect, Page } from '@playwright/test';

async function loginAsCoach(page: Page) {
    await page.goto('/login');
    await page.fill('#email', 'coach@fitnest.com');
    await page.fill('#password', 'password');
    await page.click('button.login-btn');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
}

test.describe('Dashboard Page', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsCoach(page);
    });

    test('should display welcome message', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('Welcome back');
    });

    test('should display stats grid with 4 cards', async ({ page }) => {
        const statCards = page.locator('.stat-card');
        await expect(statCards).toHaveCount(4);
    });

    test('should display active athletes stat', async ({ page }) => {
        await expect(page.locator('text=Active Athletes')).toBeVisible();
    });

    test('should display pending reviews stat', async ({ page }) => {
        await expect(page.locator('text=Pending Reviews')).toBeVisible();
    });

    test('should display analytics section with volume chart', async ({ page }) => {
        await expect(page.locator('text=Team Volume Trend')).toBeVisible();
        const chartBars = page.locator('.chart-bar-col');
        await expect(chartBars).toHaveCount(8);
    });

    test('should display top performers section', async ({ page }) => {
        await expect(page.locator('text=Top Performers')).toBeVisible();
        const performers = page.locator('.performer-item');
        await expect(performers).toHaveCount(5);
    });

    test('should display recent activity feed', async ({ page }) => {
        await expect(page.locator('text=Recent Activity')).toBeVisible();
        const activityItems = page.locator('.activity-item');
        await expect(activityItems.first()).toBeVisible();
    });

    test('should have navigation to athletes', async ({ page }) => {
        await page.click('text=View All');
        await expect(page).toHaveURL(/\/athletes/, { timeout: 5000 });
    });
});
