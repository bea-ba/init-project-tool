import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('should not have any automatically detectable accessibility issues on homepage', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have accessibility issues on sleep tracker page', async ({ page }) => {
    await page.goto('/sleep-tracker');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have accessibility issues on alarm setup page', async ({ page }) => {
    await page.goto('/alarm-setup');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have accessibility issues on insights page', async ({ page }) => {
    await page.goto('/insights');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper focus indicators', async ({ page }) => {
    await page.goto('/');

    // Tab through elements
    await page.keyboard.press('Tab');

    // Check that focused element has visible outline
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        outlineWidth: styles.outlineWidth,
        outlineStyle: styles.outlineStyle,
      };
    });

    // Should have outline (skip link)
    expect(focusedElement.outlineWidth).not.toBe('0px');
  });

  test('should have proper ARIA landmarks', async ({ page }) => {
    await page.goto('/');

    // Check for main landmark
    const main = page.locator('main[role="main"]');
    await expect(main).toBeVisible();

    // Check for navigation landmark
    const nav = page.locator('nav[role="navigation"]');
    await expect(nav).toBeVisible();
  });

  test('should have skip links', async ({ page }) => {
    await page.goto('/');

    // Press Tab to reveal skip links
    await page.keyboard.press('Tab');

    const skipLink = page.locator('a.skip-link');
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toContainText('Skip to main content');
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // Check for h1
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    // Verify heading structure
    const headings = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const h2 = document.querySelector('h2');
      const h3 = document.querySelector('h3');
      return {
        hasH1: !!h1,
        hasH2: !!h2,
        hasH3: !!h3,
      };
    });

    expect(headings.hasH1).toBeTruthy();
  });

  test('should have alt text for images', async ({ page }) => {
    await page.goto('/');

    // Get all images
    const images = await page.locator('img').all();

    for (const img of images) {
      const alt = await img.getAttribute('alt');
      // Images should either have alt text or be decorative (empty alt)
      expect(alt).toBeDefined();
    }
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/settings');

    // Get all inputs
    const inputs = await page.locator('input:visible').all();

    for (const input of inputs) {
      const id = await input.getAttribute('id');

      if (id) {
        // Check if there's a label for this input
        const label = page.locator(`label[for="${id}"]`);
        const labelExists = await label.count() > 0;

        // Input should have either a label or aria-label
        const ariaLabel = await input.getAttribute('aria-label');
        const ariaLabelledBy = await input.getAttribute('aria-labelledby');

        expect(labelExists || ariaLabel || ariaLabelledBy).toBeTruthy();
      }
    }
  });

  test('should support keyboard navigation for all interactive elements', async ({ page }) => {
    await page.goto('/');

    // Tab through all focusable elements
    const focusableElements: string[] = [];

    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');

      const tagName = await page.evaluate(() => {
        return document.activeElement?.tagName || '';
      });

      focusableElements.push(tagName);
    }

    // Should have focused on various interactive elements
    const hasButtons = focusableElements.some(tag => tag === 'BUTTON');
    const hasLinks = focusableElements.some(tag => tag === 'A');

    expect(hasButtons || hasLinks).toBeTruthy();
  });

  test('should announce dynamic content changes to screen readers', async ({ page }) => {
    await page.goto('/sleep-tracker');

    // Check for ARIA live regions
    const liveRegion = page.locator('[role="status"], [aria-live]');
    await expect(liveRegion).toBeVisible();
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/');

    // Use axe-core to check color contrast
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('body')
      .analyze();

    const contrastViolations = accessibilityScanResults.violations.filter(
      v => v.id === 'color-contrast'
    );

    expect(contrastViolations).toHaveLength(0);
  });
});
