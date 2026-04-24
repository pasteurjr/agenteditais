import { test } from "@playwright/test";
import { login, navTo } from "../helpers";

test("debug CV11 selecionar edital", async ({ page }) => {
  await login(page);
  await navTo(page, "Validacao");
  await page.waitForTimeout(5000);

  // Inspect: quantas TRs e classes
  const info = await page.evaluate(() => {
    const rows = document.querySelectorAll("tbody tr");
    return {
      rowCount: rows.length,
      firstRowHTML: rows[0]?.outerHTML?.substring(0, 500),
      firstRowClass: (rows[0] as HTMLElement)?.className,
      tablesCount: document.querySelectorAll("table").length,
    };
  });
  console.log(JSON.stringify(info, null, 2));

  // Click na primeira linha
  await page.locator("tbody tr").first().click({ force: true });
  await page.waitForTimeout(3000);

  // Verificar se painel abriu
  const painelOk = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll("button"));
    return btns.some(b => (b.textContent || "").includes("Ver Edital"));
  });
  console.log("painelOk:", painelOk);

  // Tentativa 2: clicar especificamente na TD
  if (!painelOk) {
    await page.locator("tbody tr td").first().click({ force: true });
    await page.waitForTimeout(3000);
    const painelOk2 = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      return btns.some(b => (b.textContent || "").includes("Ver Edital"));
    });
    console.log("painelOk2 (td click):", painelOk2);
  }
});
