import { test, expect } from "@playwright/test";
import { login, navTo, clickTab, getBody, ssPath, assertDataVisible } from "../helpers";

const UC = "CRM02";

test.describe(`UC-${UC}: Parametrizações CRM (3 tipos)`, () => {
  test("Sequência completa UC-CRM02", async ({ page }) => {
    test.setTimeout(120000);

    // P01 — Acessar CRM
    await login(page);
    await navTo(page, "CRM");
    await page.screenshot({ path: ssPath(UC, "P01_acao"), fullPage: true });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P01_resp"), fullPage: true });

    // P02 — Abrir aba Parametrizações
    await page.screenshot({ path: ssPath(UC, "P02_acao"), fullPage: true });
    await clickTab(page, "Parametrizações");
    await page.waitForTimeout(2500);
    await assertDataVisible(page, {
      anyText: ["Parametrizações CRM", "Tipos de Edital", "Agrupamento", "Motivos"],
      minCount: 2,
    });
    await page.screenshot({ path: ssPath(UC, "P02_resp"), fullPage: true });

    // P03 — Verificar aba Tipos de Edital (default)
    await page.screenshot({ path: ssPath(UC, "P03_acao"), fullPage: true });
    const body = await getBody(page);
    expect(body.includes("Pregão") || body.includes("Concorrência") || body.includes("Dispensa")).toBeTruthy();
    await page.screenshot({ path: ssPath(UC, "P03_resp"), fullPage: true });

    // P04 — Trocar para Agrupamento Portfolio
    await page.screenshot({ path: ssPath(UC, "P04_acao"), fullPage: true });
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(b => (b.textContent || "").trim() === "Agrupamento Portfolio");
      if (b) (b as HTMLElement).click();
    });
    await page.waitForTimeout(1500);
    const body2 = await getBody(page);
    expect(body2.includes("Hematologia") || body2.includes("Bioquímica") || body2.includes("Imunologia")).toBeTruthy();
    await page.screenshot({ path: ssPath(UC, "P04_resp"), fullPage: true });

    // P05 — Trocar para Motivos de Derrota
    await page.screenshot({ path: ssPath(UC, "P05_acao"), fullPage: true });
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(b => (b.textContent || "").trim() === "Motivos de Derrota");
      if (b) (b as HTMLElement).click();
    });
    await page.waitForTimeout(1500);
    const body3 = await getBody(page);
    expect(body3.includes("Preço") || body3.includes("Especificação") || body3.includes("Documentação")).toBeTruthy();
    await page.screenshot({ path: ssPath(UC, "P05_resp"), fullPage: true });
  });
});
