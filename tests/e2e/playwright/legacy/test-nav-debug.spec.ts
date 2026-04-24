import { test, expect } from "@playwright/test";

const BASE = "http://localhost:5175";

test.setTimeout(60000);

test("Debug DOM structure", async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(5000);

  // Dump all top-level divs
  const topDivs = await page.evaluate(() => {
    const root = document.getElementById('root');
    if (!root) return 'NO ROOT';
    const children = Array.from(root.children);
    return children.map(c => ({
      tag: c.tagName,
      class: c.className,
      childCount: c.children.length,
      text: c.textContent?.substring(0, 100)
    }));
  });
  console.log("Root children:", JSON.stringify(topDivs, null, 2));

  // Find all divs with class containing 'sidebar' or 'app'
  const sidebarDivs = await page.evaluate(() => {
    const all = document.querySelectorAll('[class*="sidebar"], [class*="app-container"], [class*="top-bar"]');
    return Array.from(all).map(el => ({
      tag: el.tagName,
      class: el.className,
      id: el.id
    }));
  });
  console.log("Sidebar/app divs:", JSON.stringify(sidebarDivs, null, 2));

  // Find all buttons
  const buttons = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('button')).slice(0, 30).map(b => ({
      text: b.textContent?.trim().substring(0, 60),
      class: b.className.substring(0, 60),
      title: b.title
    }));
  });
  console.log("Buttons:", JSON.stringify(buttons, null, 2));
});
