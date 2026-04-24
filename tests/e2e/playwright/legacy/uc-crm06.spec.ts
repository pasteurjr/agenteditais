import { test, expect } from "@playwright/test";
import { login, navTo, clickTab, getBody, ssPath, assertDataVisible } from "./helpers";

const UC = "CRM06";

test.describe(`UC-${UC}: Decisão de Não Participação`, () => {
  test("Sequência completa UC-CRM06", async ({ page }) => {
    test.setTimeout(120000);

    // P01 — Acessar CRM
    await login(page);
    await navTo(page, "CRM");
    await page.screenshot({ path: ssPath(UC, "P01_acao"), fullPage: true });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P01_resp"), fullPage: true });

    // P02 — Abrir aba Decisões
    await page.screenshot({ path: ssPath(UC, "P02_acao"), fullPage: true });
    await clickTab(page, "Decisões");
    await page.waitForTimeout(2500);
    await assertDataVisible(page, {
      anyText: ["Decisões de Editais", "Nova Decisão"],
      minCount: 1,
    });
    await page.screenshot({ path: ssPath(UC, "P02_resp"), fullPage: true });

    // P03 — Verificar decisões existentes na tabela (criadas pelo seed)
    await page.screenshot({ path: ssPath(UC, "P03_acao"), fullPage: true });
    const body = await getBody(page);
    // Pelo menos 1 decisão de não-participação deve aparecer
    expect(body.includes("Não Participação") || body.includes("Não participação")).toBeTruthy();
    await page.screenshot({ path: ssPath(UC, "P03_resp"), fullPage: true });

    // P04 — Clicar em Nova Decisão → abrir modal
    await page.screenshot({ path: ssPath(UC, "P04_acao"), fullPage: true });
    const opened = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(b => (b.textContent || "").trim() === "Nova Decisão");
      if (b) { (b as HTMLElement).click(); return true; }
      return false;
    });
    expect(opened).toBeTruthy();
    await page.waitForTimeout(1500);
    const body2 = await getBody(page);
    expect(body2.includes("Tipo") || body2.includes("Motivo") || body2.includes("Justificativa")).toBeTruthy();
    await page.screenshot({ path: ssPath(UC, "P04_resp"), fullPage: true });

    // P05 — Verificar opções tipo no modal (Não Participação / Perda)
    await page.screenshot({ path: ssPath(UC, "P05_acao"), fullPage: true });
    const body3 = await getBody(page);
    expect(body3.includes("Não Participação") || body3.includes("Perda")).toBeTruthy();
    await page.screenshot({ path: ssPath(UC, "P05_resp"), fullPage: true });
  });
});
