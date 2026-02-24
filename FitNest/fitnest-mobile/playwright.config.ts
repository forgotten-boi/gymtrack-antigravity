import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env['CI'],
    retries: process.env['CI'] ? 2 : 0,
    workers: process.env['CI'] ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: 'http://localhost:8100',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        viewport: { width: 390, height: 844 },
    },
    projects: [
        {
            name: 'Mobile Chrome',
            use: { ...devices['iPhone 13'] },
        },
    ],
    webServer: {
        command: 'npx ionic serve --no-open',
        url: 'http://localhost:8100',
        reuseExistingServer: !process.env['CI'],
        timeout: 120000,
    },
});
