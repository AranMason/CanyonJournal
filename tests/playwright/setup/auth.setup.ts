import { test as setup, expect } from '@playwright/test';

const authFile = 'tests/playwright/.auth/user.json';

setup('authenticate', async ({ page, baseURL }) => {
  // Perform authentication steps. Replace these actions with your own.
  await page.goto(`${baseURL}/login`);
  await page.locator('input#username').fill('test@handlinne.co.uk');
  await page.locator('input#password').fill('Password123!');
  await page.locator("button[value='default']").click();

  // Wait to Log into the main website's homepage
  await page.waitForURL(`${baseURL}/dashboard`);

  // Accept the Cookie Banner
  await page.getByRole('button', { name: 'Accept' }).click();

  // End of authentication steps.
  await page.context().storageState({ path: authFile });
});