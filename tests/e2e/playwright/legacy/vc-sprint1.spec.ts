import { test } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, clickTab } from "../helpers";

// VC Fase C — Regerar screenshots Sprint 1 (F06, F07, F12)
// Saída em runtime/screenshots/VC/

const DIR = "runtime/screenshots/VC/sprint1";
fs.mkdirSync(DIR, { recursive: true });
const SS = (name: string) => `${DIR}/${name}.png`;

test.describe.configure({ mode: "serial" });

test("VC-F06: Portfolio com produtos visíveis", async ({ page }) => {
  await login(page);
  await navTo(page, "Portfolio");
  await page.waitForTimeout(3000);

  // Limpar qualquer filtro residual — selecionar "Todas" em área
  await page.evaluate(() => {
    const selects = Array.from(document.querySelectorAll<HTMLSelectElement>("select.form-input"));
    for (const s of selects) {
      s.value = "";
      s.dispatchEvent(new Event("change", { bubbles: true }));
    }
  });
  await page.waitForTimeout(1500);

  // Screenshot da lista de produtos (deve mostrar os 2 produtos)
  await page.screenshot({ path: SS("F06_lista_produtos"), fullPage: true });

  // Clicar na primeira linha para abrir detalhes
  const firstRow = page.locator(".data-table tbody tr, table tbody tr").first();
  if (await firstRow.count() > 0) {
    await firstRow.click();
    await page.waitForTimeout(2000);
  }
  await page.screenshot({ path: SS("F06_detalhe_produto"), fullPage: true });
});

test("VC-F07: Cadastro IA (aba cadastro pelo manual) com produto", async ({ page }) => {
  await login(page);
  await navTo(page, "Portfolio");
  await page.waitForTimeout(2500);

  // Mudar para aba "Cadastro IA" (ou similar)
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const btn = buttons.find(b => /cadastro.*ia|cadastroIA|cadastro por ia/i.test(b.textContent || ""));
    if (btn) (btn as HTMLElement).click();
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: SS("F07_aba_cadastro_ia"), fullPage: true });

  // Voltar pra lista de produtos e mostrar que há produtos
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const btn = buttons.find(b => /^meus produtos|produtos$/i.test((b.textContent || "").trim()));
    if (btn) (btn as HTMLElement).click();
  });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: SS("F07_com_produtos"), fullPage: true });
});

test("VC-F12: Detalhes e metadados do produto expandidos", async ({ page }) => {
  await login(page);
  await navTo(page, "Portfolio");
  await page.waitForTimeout(2500);

  // Limpar filtros
  await page.evaluate(() => {
    const selects = Array.from(document.querySelectorAll<HTMLSelectElement>("select.form-input"));
    for (const s of selects) { s.value = ""; s.dispatchEvent(new Event("change", { bubbles: true })); }
  });
  await page.waitForTimeout(1500);

  // Clicar no primeiro produto
  const firstRow = page.locator(".data-table tbody tr, table tbody tr").first();
  if (await firstRow.count() > 0) {
    await firstRow.click();
    await page.waitForTimeout(2500);
  }

  // Expandir metadados (se houver botão)
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    const btn = buttons.find(b => /metadados|expandir/i.test((b.textContent || "").trim()));
    if (btn) (btn as HTMLElement).click();
  });
  await page.waitForTimeout(1000);

  await page.screenshot({ path: SS("F12_detalhes_metadados"), fullPage: true });
});
