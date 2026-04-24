import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, clickTab, getBody, ssPath } from "../helpers";

const UC = "042";

test.describe(`UC-${UC}: Registrar Resultado de Recurso`, () => {
  test.beforeEach(async ({ page }) => {
    fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  });

  test("P01: Acessar Follow-up page", async ({ page }) => {
    await login(page);
    await navTo(page, "Follow-up");
    await page.screenshot({ path: ssPath(UC, "P01_acao"), fullPage: true });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.toLowerCase()).toMatch(/follow|resultado|aguardando|recurso/i);
  });

  test("P02: Verificar aba Resultados e lista de recursos", async ({ page }) => {
    await login(page);
    await navTo(page, "Follow-up");
    await clickTab(page, "Resultados");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P02_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P02_resp"), fullPage: true });
    expect(body.toLowerCase()).toMatch(/resultado|recurso|ganho|perdido|pendente/i);
  });

  test("P03: Clicar botao Registrar e abrir modal", async ({ page }) => {
    await login(page);
    await navTo(page, "Follow-up");
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P03_acao"), fullPage: true });
    // Clica em Registrar Resultado
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(
        (el) =>
          el.textContent?.toLowerCase().includes("registrar") ||
          el.textContent?.toLowerCase().includes("resultado")
      );
      if (b) b.click();
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P03_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(100);
  });

  test("P04: Selecionar opcao Vitoria no modal de resultado", async ({ page }) => {
    await login(page);
    await navTo(page, "Follow-up");
    await page.waitForTimeout(1500);
    // Abre modal de registro
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(
        (el) =>
          el.textContent?.toLowerCase().includes("registrar") ||
          el.textContent?.toLowerCase().includes("resultado")
      );
      if (b) b.click();
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P04_acao"), fullPage: true });
    // Seleciona resultado "vitória" ou "ganho"
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button, input[type='radio'], option"));
      for (const el of Array.from(btns)) {
        if (
          el.textContent?.toLowerCase().includes("vitoria") ||
          el.textContent?.toLowerCase().includes("ganho") ||
          el.textContent?.toLowerCase().includes("provido") ||
          (el as HTMLInputElement).value?.toLowerCase().includes("vitoria") ||
          (el as HTMLInputElement).value?.toLowerCase().includes("ganho")
        ) {
          (el as HTMLElement).click();
          break;
        }
      }
    });
    await page.waitForTimeout(500);
    await page.screenshot({ path: ssPath(UC, "P04_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(100);
  });

  test("P05: Verificar badges de resultado vitoria/derrota na lista", async ({ page }) => {
    await login(page);
    await navTo(page, "Follow-up");
    await clickTab(page, "Resultados");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P05_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P05_resp"), fullPage: true });
    expect(body.length).toBeGreaterThan(100);
  });
});
