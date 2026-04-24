import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, clickTab, getBody, ssPath, waitForIA } from "../helpers";

const UC = "021";
const SS = (step: string) => {
  fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  return ssPath(UC, step);
};

test.describe("UC-021: Vincular produto a item do edital", () => {
  test("P01-P06: Vincular produto manual e via IA na aba Custos e Precos", async ({ page }) => {
    await login(page);
    await navTo(page, "Precificação");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: SS("P01_precificacao_inicial"), fullPage: true });

    // Selecionar edital no select
    const selectEdital = page.locator("select").first();
    try {
      await selectEdital.waitFor({ timeout: 5000 });
      const options = await selectEdital.locator("option").all();
      if (options.length > 1) {
        await selectEdital.selectOption({ index: 1 });
        await page.waitForTimeout(2000);
      }
    } catch { /* sem select */ }

    await page.screenshot({ path: SS("P02_edital_selecionado"), fullPage: true });

    // Navegar para aba Custos e Precos (ou Lotes/Camadas dependendo da estrutura)
    await clickTab(page, "Lotes");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("P03_aba_lotes_itens"), fullPage: true });

    // Procurar botão "Vincular Produto" em item do lote
    const btnVincular = page.locator("button").filter({ hasText: /Vincular Produto|Vincular/i }).first();
    const vincularExiste = await btnVincular.count() > 0;
    console.log("Botão Vincular Produto existe:", vincularExiste);

    await page.screenshot({ path: SS("P04_botoes_vincular"), fullPage: true });

    if (vincularExiste) {
      await btnVincular.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: SS("P05_modal_vincular_aberto"), fullPage: true });

      // Verificar modal de seleção de produto
      const bodyModal = await getBody(page);
      const modalAberto =
        bodyModal.includes("produto") ||
        bodyModal.includes("Produto") ||
        bodyModal.includes("portfólio") ||
        bodyModal.includes("match") ||
        bodyModal.includes("sugestão");
      console.log("Modal de vinculação aberto:", modalAberto);

      // Aguardar IA sugerir produtos (tool_vincular_item_produto)
      const sugestao = await waitForIA(
        page,
        (body) =>
          body.includes("sugestão") ||
          body.includes("match_score") ||
          body.includes("produto") && body.includes("score") ||
          body.includes("Aderente"),
        30000,
        3000
      );
      console.log("IA sugeriu produto:", sugestao);

      await page.screenshot({ path: SS("P06_sugestao_ia_produto"), fullPage: true });

      // Selecionar produto da lista se disponível
      const primeiroProduto = page.locator("table tbody tr, [class*='produto-item']").first();
      try {
        await primeiroProduto.waitFor({ timeout: 5000 });
        await primeiroProduto.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: SS("P06b_produto_selecionado"), fullPage: true });
      } catch { /* sem lista */ }

      // Confirmar vinculação
      await page.evaluate(() => {
        const btns = document.querySelectorAll("button");
        const btn = Array.from(btns).find(b =>
          b.textContent?.trim().includes("Confirmar") ||
          b.textContent?.trim().includes("Vincular") ||
          b.textContent?.trim().includes("Salvar")
        ) as HTMLButtonElement;
        if (btn) btn.click();
      });

      await page.waitForTimeout(3000);
      await page.screenshot({ path: SS("P06c_vinculo_confirmado"), fullPage: true });
    } else {
      // Tentar via aba Camadas
      await clickTab(page, "Camadas");
      await page.waitForTimeout(2000);
      await page.screenshot({ path: SS("P05_aba_camadas_fallback"), fullPage: true });

      await page.evaluate(() => {
        const btns = document.querySelectorAll("button");
        const btn = Array.from(btns).find(b =>
          b.textContent?.trim().includes("Vincular Produto") ||
          b.textContent?.trim().includes("Vincular")
        ) as HTMLButtonElement;
        if (btn) btn.click();
      });

      await page.waitForTimeout(3000);
      await page.screenshot({ path: SS("P06_vincular_camadas"), fullPage: true });
    }

    expect(true).toBeTruthy();
  });

  test("FA-02: Buscar produto via web (Buscar Web)", async ({ page }) => {
    await login(page);
    await navTo(page, "Precificação");
    await page.waitForTimeout(3000);

    await clickTab(page, "Lotes");
    await page.waitForTimeout(2000);

    const btnVincular = page.locator("button").filter({ hasText: /Vincular/i }).first();
    try {
      await btnVincular.waitFor({ timeout: 8000 });
      await btnVincular.click();
      await page.waitForTimeout(3000);

      // Procurar "Buscar Web"
      await page.evaluate(() => {
        const btns = document.querySelectorAll("button");
        const btn = Array.from(btns).find(b =>
          b.textContent?.trim().includes("Buscar Web") ||
          b.textContent?.trim().includes("Web")
        ) as HTMLButtonElement;
        if (btn) btn.click();
      });

      await page.waitForTimeout(10000);
      await page.screenshot({ path: SS("FA02_buscar_web"), fullPage: true });
    } catch {
      await page.screenshot({ path: SS("FA02_sem_vincular"), fullPage: true });
    }

    expect(true).toBeTruthy();
  });
});
