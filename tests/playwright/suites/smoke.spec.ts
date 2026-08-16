import { test, expect } from '@playwright/test';

test.use({ storageState: 'tests/playwright/.auth/user.json' });

const pageChecks: { url: string, expectedTitle: string }[] = [
    {
        url: '/dashboard',
        expectedTitle: 'Dashboard'
    },
    {
        url: '/journal',
        expectedTitle: 'Your Journal'
    }
];


pageChecks.forEach(({ url, expectedTitle }) => {
    test(`${url} loads correctly`, async ({ page }) => {
        await page.goto(url);
        await expect(page.locator('h1')).toHaveText(expectedTitle);
    });

})
