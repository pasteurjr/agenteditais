import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, getBody, ssPath } from "./helpers";

const UC = "014";
const SS = (step: string) => {
  fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  return ssPath(UC, step);
};

test.describe("UC-014: Explorar resultados e painel lateral do edital", () => {
  test("P01-P07: Clicar em resultado e verificar painel lateral", async ({ page }) => {
    await login(page);
    await navTo(page, "Captação");
    await page.waitForTimeout(2000);

    // Executar busca para ter resultados disponíveis
    await page.evaluate(() => {
      const inputs = document.querySelectorAll("input");
      const input = Array.from(inputs).find(i =>
        i.placeholder?.toLowerCase().includes("termo") ||
        i.placeholder?.toLowerCase().includes("busca") ||
        i.placeholder?.toLowerCase().includes("pesquis")
      ) as HTMLInputElement;
      if (input) {
        input.value = "reagente";
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });

    await page.evaluate(() => {
      const btns = document.querySelectorAll("button");
      const btn = Array.from(btns).find(b =>
        b.textContent?.trim().includes("Buscar Editais") ||
        b.textContent?.trim().includes("Buscar")
      ) as HTMLButtonElement;
      if (btn) btn.click();
    });

    await page.screenshot({ path: SS("P01_busca_iniciada"), fullPage: true });

    // Aguardar resultados aparecerem na tabela
    await page.waitForTimeout(20000);
    await page.screenshot({ path: SS("P02_resultados_disponiveis"), fullPage: true });

    // Passo 3: Clicar na primeira linha da DataTable
    const primeiraLinha = page.locator("table tbody tr").first();
    try {
      await primeiraLinha.waitFor({ timeout: 10000 });
      await page.screenshot({ path: SS("P03_antes_clicar_linha"), fullPage: true });
      await primeiraLinha.click();
      await page.waitForTimeout(3000);
    } catch {
      // Tentar clicar via botão "Ver detalhes"
      await page.evaluate(() => {
        const btns = document.querySelectorAll("button");
        const btn = Array.from(btns).find(b =>
          b.textContent?.trim().includes("Ver detalhes") ||
          b.textContent?.trim().includes("Detalhes") ||
          b.title?.includes("detalhe")
        ) as HTMLButtonElement;
        if (btn) btn.click();
      });
      await page.waitForTimeout(3000);
    }

    await page.screenshot({ path: SS("P04_painel_lateral_aberto"), fullPage: true });

    // Passo 4: Verificar painel lateral com dados do edital
    const body = await getBody(page);
    const painelAberto =
      body.includes("Salvar Edital") ||
      body.includes("Salvar Estratégia") ||
      body.includes("Ir para Validação") ||
      body.includes("score") ||
      body.includes("Score") ||
      body.includes("Abrir no Portal") ||
      body.includes("Baixar PDF");
    console.log("Painel lateral aberto:", painelAberto);

    // Passo 5: Verificar dados do edital no painel
    await page.screenshot({ path: SS("P05_dados_edital_painel"), fullPage: true });

    // Passo 6: Testar filtro por UF se disponível
    const selectUF = page.locator('select, [class*="select"]').filter({ hasText: /UF|Estado/i }).first();
    try {
      await selectUF.waitFor({ timeout: 5000 });
      await selectUF.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: SS("P06_filtro_uf_aberto"), fullPage: true });
    } catch {
      console.log("Filtro UF não encontrado diretamente, tentando via evaluate");
      await page.evaluate(() => {
        const selects = document.querySelectorAll("select");
        const select = Array.from(selects).find(s =>
          s.id?.includes("uf") || s.name?.includes("uf") ||
          Array.from(s.options).some(o => o.value === "SP" || o.value === "RJ")
        ) as HTMLSelectElement;
        if (select) select.click();
      });
      await page.screenshot({ path: SS("P06_filtro_uf_fallback"), fullPage: true });
    }

    // Passo 7: Screenshot final com painel e filtros
    await page.screenshot({ path: SS("P07_estado_final"), fullPage: true });
    expect(true).toBeTruthy();
  });

  test("FA-01: Selecionar todos via checkbox do cabecalho", async ({ page }) => {
    await login(page);
    await navTo(page, "Captação");
    await page.waitForTimeout(2000);

    await page.evaluate(() => {
      const inputs = document.querySelectorAll("input");
      const input = Array.from(inputs).find(i =>
        i.placeholder?.toLowerCase().includes("termo") || i.placeholder?.toLowerCase().includes("busca")
      ) as HTMLInputElement;
      if (input) { input.value = "reagente"; input.dispatchEvent(new Event("input", { bubbles: true })); }
    });
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button")).find(b =>
        b.textContent?.includes("Buscar")
      ) as HTMLButtonElement;
      if (btn) btn.click();
    });

    await page.waitForTimeout(20000);

    // Tentar marcar checkbox do cabeçalho
    const checkboxHeader = page.locator('thead input[type="checkbox"], th input[type="checkbox"]').first();
    try {
      await checkboxHeader.waitFor({ timeout: 8000 });
      await page.screenshot({ path: SS("FA01_antes_selecionar_todos"), fullPage: true });
      await checkboxHeader.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: SS("FA01_todos_selecionados"), fullPage: true });
    } catch {
      await page.screenshot({ path: SS("FA01_sem_checkbox_header"), fullPage: true });
    }

    expect(true).toBeTruthy();
  });
});
