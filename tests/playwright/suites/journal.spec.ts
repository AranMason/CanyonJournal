import { test, expect } from '@playwright/test';

test("Create and Edit Journal Entry", async ({ page }) => {

    const initialContent = {
        canyon: 'Bruar',
        teamSize: 4,
        waterLevel: 3,
        rating: 4,
        comment: crypto.randomUUID()
    };
    await page.getByTestId('record-search-canyon').fill(initialContent.canyon);
    await page.getByTestId(/record-canyon-search--item-/).first().click();

    await page.getByTestId('record-team-size').fill(initialContent.teamSize.toString());
    await page.getByTestId(`record-water-level-${initialContent.waterLevel}`).click();
    await page.getByTestId(`record-descent-rating-${initialContent.rating}`).click();

    await page.getByTestId('record-comments').fill(initialContent.comment);

    const createTagsInput = page.getByTestId('record-tags');
    await createTagsInput.fill('playwright-edit-source-tag');
    await createTagsInput.press('Enter');

    const saveReq = page.waitForResponse('/api/record')
    await page.locator('button[type="submit"]').click();
    await saveReq;

    // TODO: intercept API call to save, and assert values


    await page.goto('/journal');

    // TODO: Resolve Potential Race Condition?

    const firstSummary = page.getByTestId(/journal-record-summary-/).first();
    await expect(firstSummary).toBeVisible();
    await firstSummary.click();

    // TODO: Assert expected content of summary

    const firstEdit = page.getByTestId(/journal-record-edit-/).first();
    await expect(firstEdit).toBeVisible();
    await firstEdit.click();

    await expect(page.getByTestId('record-team-size')).toHaveValue(initialContent.teamSize.toString());
    await expect(page.getByTestId('record-comments')).toHaveValue(initialContent.comment);
    await expect(page.getByText('playwright-edit-source-tag')).toBeVisible();

    await expect(page.getByTestId('record-water-level-3')).not.toHaveClass(/MuiSvgIcon-colorDisabled/);
    await expect(page.getByTestId('record-descent-rating-4')).not.toHaveClass(/MuiSvgIcon-colorDisabled/);

    await page.getByTestId('record-team-size').fill('5');
    await page.getByTestId('record-water-level-2').click();
    await page.getByTestId('record-descent-rating-5').click();
    await page.getByTestId('record-comments').fill('Playwright edited note');

    const editTagsInput = page.getByTestId('record-tags');
    await editTagsInput.fill('playwright-edited-tag');
    await editTagsInput.press('Enter');

    await page.locator('button[type="submit"]').click();
})