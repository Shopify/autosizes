const { test, expect } = require('@playwright/test');

test.describe('autosizes polyfill', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8000/test.html');
  });

  test('should handle basic test case', async ({ page, browserName }) => {
    const test1 = page.locator('#test1 img');
    await test1.waitFor({ state: 'visible' });
    
    // Wait for document to load
    await page.evaluate(() => new Promise(resolve => {
      if (document.readyState === 'complete') {
        resolve();
        return;
      }
      window.addEventListener('load', () => resolve());
    }));

    async function getImageCurrentSrc(page, imageId) {
      const img = page.locator(imageId);
      await img.evaluate(img => new Promise(resolve => {
        if (img.complete) resolve();
        img.onload = resolve;
      }));
      return await img.evaluate(img => img.currentSrc);
    }

    let currentSrc = await getImageCurrentSrc(page, '#img-test1');
    expect(currentSrc).not.toMatch("/1200/900");
    currentSrc = await getImageCurrentSrc(page, '#img-test2');
    expect(currentSrc).not.toMatch("/1200/900");
    currentSrc = await getImageCurrentSrc(page, '#img-test3');
    expect(currentSrc).toMatch("/1200/900");
    currentSrc = await getImageCurrentSrc(page, '#img-test4');
    expect(currentSrc).toMatch("/1200/900");
    currentSrc = await getImageCurrentSrc(page, '#img-test5');
    expect(currentSrc).not.toMatch("/1200/900");
    currentSrc = await getImageCurrentSrc(page, '#img-test6');
    expect(currentSrc).not.toMatch("/1200/900");
  });
});
