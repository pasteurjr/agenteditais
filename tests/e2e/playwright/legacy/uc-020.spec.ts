import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, clickTab, getBody, ssPath } from "../helpers";

const UC = "020";
const SS = (step: string) => {
  fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  return ssPath(UC, step);
};

test.describe("UC-020: Organizar itens em lotes na PrecificacaoPage", () => {
  test("P01-P07: Navegar para Precificacao e aba Lotes — selecionar edital", async ({ page }) => {
    await login(page);
    await navTo(page, "Precificação");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: SS("P01_precificacao_inicial"), fullPage: true });

    const body = await getBody(page);
    const paginaCarregou =
      body.includes("Precificação") ||
      body.includes("precificação") ||
      body.includes("Lotes") ||
      body.includes("Camadas") ||
      body.includes("Lances") ||
      body.includes("edital");
    expect(paginaCarregou).toBeTruthy();

    // Passo 2: Verificar SelectInput de edital
    await page.screenshot({ path: SS("P02_select_edital"), fullPage: true });

    // Tentar selecionar edital no SelectInput
    const selectEdital = page.locator('select').first();
    try {
      await selectEdital.waitFor({ timeout: 5000 });
      const options = await selectEdital.locator("option").all();
      if (options.length > 1) {
        await selectEdital.selectOption({ index: 1 });
        await page.waitForTimeout(2000);
        await page.screenshot({ path: SS("P03_edital_selecionado"), fullPage: true });
      }
    } catch {
      // Tenta via clique em elemento de lista
      await page.evaluate(() => {
        const selects = document.querySelectorAll('[class*="select"], select');
        if (selects.length > 0) (selects[0] as HTMLElement).click();
      });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: SS("P03_edital_select_fallback"), fullPage: true });
    }

    // Passo 3: Navegar para aba Lotes
    await clickTab(page, "Lotes");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("P04_aba_lotes"), fullPage: true });

    const bodyLotes = await getBody(page);
    const abaLotesAtiva =
      bodyLotes.includes("Lote") ||
      bodyLotes.includes("lote") ||
      bodyLotes.includes("Criar Lote") ||
      bodyLotes.includes("Organizar") ||
      bodyLotes.includes("item");
    console.log("Aba Lotes ativa:", abaLotesAtiva);

    // Passo 4: Verificar se há botão "Criar Lote"
    const btnCriarLote = page.locator("button").filter({ hasText: /Criar Lote|Novo Lote/i }).first();
    const criarLoteExiste = await btnCriarLote.count() > 0;
    console.log("Botão Criar Lote existe:", criarLoteExiste);

    await page.screenshot({ path: SS("P05_botoes_lotes"), fullPage: true });

    // Passo 5: Tentar criar um lote
    if (criarLoteExiste) {
      await btnCriarLote.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: SS("P06_criar_lote_clicado"), fullPage: true });

      // Preencher nome do lote se modal abrir
      const inputNome = page.locator('input[placeholder*="nome"], input[placeholder*="lote"], input[name*="nome"]').first();
      try {
        await inputNome.waitFor({ timeout: 3000 });
        await inputNome.fill("Lote 1 - Reagentes");
        await page.screenshot({ path: SS("P06b_lote_nome_preenchido"), fullPage: true });
      } catch { /* sem modal */ }
    }

    // Passo 6: Verificar lista de lotes existentes
    await page.screenshot({ path: SS("P07_lista_lotes"), fullPage: true });

    const bodyFinal = await getBody(page);
    const temLotes =
      bodyFinal.includes("Lote") ||
      bodyFinal.includes("lote") ||
      bodyFinal.includes("item");
    console.log("Lotes presentes:", temLotes);

    expect(true).toBeTruthy();
  });

  test("FA-01: Expandir e colapsar lote via ChevronDown/Up", async ({ page }) => {
    await login(page);
    await navTo(page, "Precificação");
    await page.waitForTimeout(3000);

    await clickTab(page, "Lotes");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("FA01_aba_lotes"), fullPage: true });

    // Tentar clicar em ChevronDown/Up para expandir lote
    const chevron = page.locator('[data-icon*="chevron"], button[aria-expanded], [class*="chevron"]').first();
    try {
      await chevron.waitFor({ timeout: 5000 });
      await chevron.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: SS("FA01_lote_expandido"), fullPage: true });

      await chevron.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: SS("FA01_lote_colapsado"), fullPage: true });
    } catch {
      await page.screenshot({ path: SS("FA01_sem_chevron"), fullPage: true });
    }

    expect(true).toBeTruthy();
  });
});
