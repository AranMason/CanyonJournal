import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    timeout: 30000,
    use: {
        baseURL: 'http://localhost:3000',
        browserName: 'chromium',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
        headless: true,
    },
    projects: [
        { name: 'setup', testMatch: /tests\/playwright\/.*\.setup\.ts/ },
        {
            name: 'test',
            testDir: './tests/playwright/suites',
            use: {
                ...devices['Desktop Chrome'],
                // Use prepared auth state.
                storageState: 'tests/playwright/.auth/user.json',
            },
            dependencies: ['setup'],
        },
    ]
});