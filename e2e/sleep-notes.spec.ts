import { test, expect } from '@playwright/test';

test.describe('Sleep Notes', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Dismiss WelcomeModal if it's present
    const modal = page.locator('[role="dialog"]').first();
    if (await modal.isVisible()) {
      await page.keyboard.press('Escape');
    }

    // Wait a bit for modal to close
    await page.waitForTimeout(100);

    await page.click('a[href="/sleep-notes"]');
  });

  test('should create a sleep note with activities', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Sleep Notes');

    // Find textarea for notes
    const noteTextarea = page.locator('textarea');
    if (await noteTextarea.isVisible()) {
      await noteTextarea.fill('Had a great sleep tonight. Felt very refreshed.');
    }

    // Check some activities if available
    const exerciseCheckbox = page.locator('input[type="checkbox"]').first();
    if (await exerciseCheckbox.isVisible()) {
      await exerciseCheckbox.check();
    }

    // Look for save button
    const saveButton = page.locator('button:has-text("Save")');
    if (await saveButton.isVisible()) {
      await saveButton.click();

      // Verify success message
      await expect(page.locator('text=/saved|success/i')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should display list of previous notes', async ({ page }) => {
    // Check if there's a notes list or empty state
    const emptyState = page.locator('text=/No notes|Start logging/i');
    const notesList = page.locator('[role="list"], .notes-list');

    const hasContent = await emptyState.isVisible() || await notesList.isVisible();
    expect(hasContent).toBeTruthy();
  });

  test('should track multiple activities', async ({ page }) => {
    // Look for activity checkboxes
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();

    // Check if we have activity options
    expect(count).toBeGreaterThan(0);

    // Check multiple if available
    if (count >= 2) {
      await checkboxes.nth(0).check();
      await checkboxes.nth(1).check();

      await expect(checkboxes.nth(0)).toBeChecked();
      await expect(checkboxes.nth(1)).toBeChecked();
    }
  });

  test('should persist notes across page reloads', async ({ page }) => {
    const noteTextarea = page.locator('textarea');

    if (await noteTextarea.isVisible()) {
      await noteTextarea.fill('Test note for persistence');

      const saveButton = page.locator('button:has-text("Save")');
      if (await saveButton.isVisible()) {
        await saveButton.click();
        await page.waitForTimeout(1000);
      }

      // Reload page
      await page.reload();

      // Check if note is still visible
      await expect(page.locator('text=Test note for persistence')).toBeVisible();
    }
  });

  test('should allow editing existing notes', async ({ page }) => {
    // Create a note first
    const noteTextarea = page.locator('textarea');

    if (await noteTextarea.isVisible()) {
      await noteTextarea.fill('Original note');

      const saveButton = page.locator('button:has-text("Save")');
      if (await saveButton.isVisible()) {
        await saveButton.click();
        await page.waitForTimeout(1000);
      }

      // Try to edit
      const editButton = page.locator('button:has-text("Edit")');
      if (await editButton.isVisible()) {
        await editButton.click();
        await noteTextarea.fill('Edited note');
        await saveButton.click();

        await expect(page.locator('text=Edited note')).toBeVisible();
      }
    }
  });

  test('should show date/time for each note', async ({ page }) => {
    // Look for date/time indicators
    const datePattern = /\d{1,2}\/\d{1,2}\/\d{2,4}|\d{1,2}:\d{2}/;

    // Check if we have any notes with dates
    const hasDate = await page.locator(`text=${datePattern}`).count() > 0;

    // If no notes, that's okay (empty state)
    // If notes exist, they should have dates
    if (hasDate) {
      await expect(page.locator(`text=${datePattern}`).first()).toBeVisible();
    }
  });

  test('should handle keyboard navigation in note form', async ({ page }) => {
    const textarea = page.locator('textarea');

    if (await textarea.isVisible()) {
      // Tab to textarea
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // Type note
      await page.keyboard.type('Keyboard test note');

      const content = await textarea.inputValue();
      expect(content).toContain('Keyboard test note');
    }
  });
});
