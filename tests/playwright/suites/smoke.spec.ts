import { test, expect } from '@playwright/test';

const pageChecks: { url: string, expectedTitle: string }[] = [
    {
        url: '/dashboard',
        expectedTitle: 'Dashboard'
    },
    {
        url: '/journal',
        expectedTitle: 'Your Journal'
    },
    {
        url: '/journal/record',
        expectedTitle: 'Add Record'
    }, {
        url: '/canyons',
        expectedTitle: 'Canyon List'
    },
    {
        url: '/settings/goals',
        expectedTitle: 'Goals'
    }, {
        url: '/settings/gear',
        expectedTitle: 'Equipment'
    }, {
        url: '/settings',
        expectedTitle: 'Settings'
    }
];


pageChecks.forEach(({ url, expectedTitle }) => {
    test(`${url} loads correctly`, async ({ page }) => {
        await page.goto(url);
        await expect(page.locator('h1')).toHaveText(expectedTitle);
    });
})
