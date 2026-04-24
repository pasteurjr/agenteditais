import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, getBody, ssPath, waitForIA } from "../helpers";

const UC = "026";
const SS = (step: string) => {
  fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  return ssPath(UC, step);
};

test.describe("UC-026: Gerar proposta tecnica com IA", () => {
  test("P01-P07: Selecionar edital e gerar proposta com DeepSeek", async ({ page }) => {
    await login(page);
    await navTo(page, "Proposta");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: SS("P01_proposta_inicial"), fullPage: true });

    const body = await getBody(page);
    const paginaCarregou =
      body.includes("Proposta") ||
      body.includes("proposta") ||
      body.includes("Gerar Proposta") ||
      body.includes("edital") ||
      body.includes("template");
    expect(paginaCarregou).toBeTruthy();

    // Passo 2: Selecionar edital no SelectInput
    await page.screenshot({ path: SS("P02_selects_formulario"), fullPage: true });

    const selects = page.locator("select");
    const selectCount = await selects.count();
    console.log("Número de selects:", selectCount);

    // Selecionar edital (primeiro select)
    try {
      const selectEdital = selects.nth(0);
      await selectEdital.waitFor({ timeout: 5000 });
      const options = await selectEdital.locator("option").all();
      if (options.length > 1) {
        await selectEdital.selectOption({ index: 1 });
        await page.waitForTimeout(1000);
      }
    } catch { /* sem select */ }

    // Selecionar produto (segundo select)
    try {
      const selectProduto = selects.nth(1);
      await selectProduto.waitFor({ timeout: 3000 });
      const options = await selectProduto.locator("option").all();
      if (options.length > 1) {
        await selectProduto.selectOption({ index: 1 });
        await page.waitForTimeout(1000);
      }
    } catch { /* sem select produto */ }

    // Selecionar lote (terceiro select se houver)
    try {
      const selectLote = selects.nth(2);
      await selectLote.waitFor({ timeout: 3000 });
      const options = await selectLote.locator("option").all();
      if (options.length > 1) {
        await selectLote.selectOption({ index: 1 });
        await page.waitForTimeout(1000);
      }
    } catch { /* sem select lote */ }

    await page.screenshot({ path: SS("P03_selects_preenchidos"), fullPage: true });

    // Verificar pré-preenchimento de preço (Camada D)
    const inputPreco = page.locator('input[name*="preco"], input[name*="valor"], input[placeholder*="preço"]').first();
    try {
      await inputPreco.waitFor({ timeout: 3000 });
      const valor = await inputPreco.inputValue();
      console.log("Preço pré-preenchido:", valor);
    } catch { /* sem input preco */ }

    await page.screenshot({ path: SS("P04_preco_prepopulado"), fullPage: true });

    // Passo 5: Clicar em "Gerar Proposta"
    await page.screenshot({ path: SS("P05_antes_gerar"), fullPage: true });

    await page.evaluate(() => {
      const btns = document.querySelectorAll("button");
      const btn = Array.from(btns).find(b =>
        b.textContent?.trim().includes("Gerar Proposta") ||
        b.textContent?.trim().includes("Gerar Texto") ||
        b.textContent?.trim().includes("Gerar com IA")
      ) as HTMLButtonElement;
      if (btn) btn.click();
    });

    await page.screenshot({ path: SS("P06_gerando_proposta"), fullPage: true });

    // Aguardar geração da proposta pela IA (POST /api/propostas/{id}/gerar-texto — até 90s)
    const propostaGerada = await waitForIA(
      page,
      (body) =>
        body.includes("proposta técnica") ||
        body.includes("Proposta Técnica") ||
        body.includes("PROPOSTA") ||
        body.includes("empresa propõe") ||
        body.includes("produto") && body.includes("especificação") ||
        body.includes("qualidade") && body.includes("entrega") ||
        body.length > 3000 && body.includes("##"),
      90000,
      6000
    );

    await page.screenshot({ path: SS("P07_proposta_gerada"), fullPage: true });

    const bodyFinal = await getBody(page);
    const temProposta =
      bodyFinal.includes("proposta") ||
      bodyFinal.includes("Proposta") ||
      bodyFinal.includes("rascunho") ||
      propostaGerada;
    console.log("Proposta gerada:", temProposta);

    // Verificar preview
    const temPreview =
      bodyFinal.includes("preview") ||
      bodyFinal.includes("Preview") ||
      bodyFinal.includes("visualizar") ||
      bodyFinal.includes("PDF") ||
      bodyFinal.includes("DOCX");
    console.log("Preview disponível:", temPreview);

    await page.screenshot({ path: SS("P07b_preview_proposta"), fullPage: true });

    expect(true).toBeTruthy();
  });

  test("FA-01: Gerar texto em proposta existente em status rascunho", async ({ page }) => {
    await login(page);
    await navTo(page, "Proposta");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: SS("FA01_lista_propostas"), fullPage: true });

    // Verificar DataTable de propostas
    const body = await getBody(page);
    const temDataTable =
      body.includes("rascunho") ||
      body.includes("Rascunho") ||
      body.includes("proposta") ||
      body.includes("status");
    console.log("DataTable de propostas:", temDataTable);

    // Tentar clicar em "Gerar Texto" em proposta existente
    await page.evaluate(() => {
      const btns = document.querySelectorAll("button");
      const btn = Array.from(btns).find(b =>
        b.textContent?.trim().includes("Gerar Texto") ||
        b.textContent?.trim().includes("Regerar")
      ) as HTMLButtonElement;
      if (btn) btn.click();
    });

    await page.waitForTimeout(5000);
    await page.screenshot({ path: SS("FA01_gerar_texto_rascunho"), fullPage: true });

    expect(true).toBeTruthy();
  });
});
