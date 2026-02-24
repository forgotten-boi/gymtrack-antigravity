import { test, expect, Page } from '@playwright/test';

async function loginAsGuest(page: Page) {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.locator('text=Continue as Guest').click();
    await expect(page).toHaveURL(/\/home/, { timeout: 10000 });
}

test.describe('Mobile Page Navigation', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsGuest(page);
    });

    test('should navigate to workout capture page', async ({ page }) => {
        await page.goto('/workout-capture');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('ion-title')).toContainText('Log Workout');
    });

    test('should navigate to nutrition page', async ({ page }) => {
        await page.goto('/nutrition');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('ion-title')).toContainText('Nutrition');
    });

    test('should navigate to progress page', async ({ page }) => {
        await page.goto('/progress');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('ion-title')).toContainText('Progress');
    });

    test('should navigate to AI assistant page', async ({ page }) => {
        await page.goto('/ai-assistant');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('ion-title')).toContainText('AI');
    });

    test('should navigate to friends page', async ({ page }) => {
        await page.goto('/friends');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('ion-title')).toContainText('Community');
    });

    test('should navigate to onboarding page', async ({ page }) => {
        await page.goto('/onboarding');
        await page.waitForLoadState('networkidle');
        await expect(page.locator('text=Set Up Your Profile')).toBeVisible();
    });
});

test.describe('Workout Capture - Manual Mode', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsGuest(page);
        await page.goto('/workout-capture');
        await page.waitForLoadState('networkidle');
    });

    test('should switch to manual mode', async ({ page }) => {
        await page.locator('ion-segment-button[value="manual"]').click();
        await expect(page.locator('text=Add Exercise')).toBeVisible();
    });

    test('should show exercise picker on add', async ({ page }) => {
        await page.locator('ion-segment-button[value="manual"]').click();
        await page.locator('text=Add Exercise').click();
        await expect(page.locator('.exercise-picker')).toBeVisible();
        await expect(page.locator('text=Bench Press')).toBeVisible();
    });
});

test.describe('Nutrition Page', () => {
    test.beforeEach(async ({ page }) => {
        await loginAsGuest(page);
        await page.goto('/nutrition');
        await page.waitForLoadState('networkidle');
    });

    test('should display calorie summary card', async ({ page }) => {
        await expect(page.locator('text=Calories')).toBeVisible();
    });

    test('should display macro bars', async ({ page }) => {
        await expect(page.locator('text=Protein')).toBeVisible();
        await expect(page.locator('text=Carbs')).toBeVisible();
        await expect(page.locator('text=Fat')).toBeVisible();
    });
});
