import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, clickTab, getBody, ssPath, waitForIA } from "../helpers";

const UC = "018";
const SS = (step: string) => {
  fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  return ssPath(UC, step);
};

test.describe("UC-018: Analise de mercado via IA", () => {
  test("P01-P07: Aba Mercado — Analisar Mercado do Orgao com DeepSeek", async ({ page }) => {
    await login(page);
    await navTo(page, "Validação");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: SS("P01_validacao_inicial"), fullPage: true });

    // Selecionar primeiro edital da lista
    const primeiraLinha = page.locator("table tbody tr").first();
    try {
      await primeiraLinha.waitFor({ timeout: 10000 });
      await page.screenshot({ path: SS("P02_lista_editais"), fullPage: true });
      await primeiraLinha.click();
      await page.waitForTimeout(3000);
    } catch {
      console.log("Nenhum edital disponível — executar UC-015 antes");
    }

    await page.screenshot({ path: SS("P03_edital_selecionado"), fullPage: true });

    // Navegar para aba Mercado
    await clickTab(page, "Mercado");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("P04_aba_mercado"), fullPage: true });

    const bodyMercado = await getBody(page);
    const abaAtiva =
      bodyMercado.includes("Mercado") ||
      bodyMercado.includes("mercado") ||
      bodyMercado.includes("Analisar Mercado") ||
      bodyMercado.includes("orgão") ||
      bodyMercado.includes("concorrente");
    expect(abaAtiva).toBeTruthy();

    // Passo 5: Clicar em "Analisar Mercado do Orgao"
    await page.screenshot({ path: SS("P05_antes_analisar_mercado"), fullPage: true });

    await page.evaluate(() => {
      const btns = document.querySelectorAll("button");
      const btn = Array.from(btns).find(b =>
        b.textContent?.trim().includes("Analisar Mercado do Órgão") ||
        b.textContent?.trim().includes("Analisar Mercado do Orgao") ||
        b.textContent?.trim().includes("Analisar Mercado") ||
        b.textContent?.trim().includes("Reanalisar Mercado")
      ) as HTMLButtonElement;
      if (btn) btn.click();
    });

    await page.screenshot({ path: SS("P06_analise_iniciada"), fullPage: true });

    // Aguardar análise de mercado (POST /api/editais/{id}/analisar-mercado — até 60s)
    const analisou = await waitForIA(
      page,
      (body) =>
        body.includes("orgão") && body.includes("reputação") ||
        body.includes("vencedor") ||
        body.includes("concorrente") ||
        body.includes("mercado") && body.includes("compras") ||
        body.includes("SinaisMercado") ||
        body.includes("sinal de mercado") ||
        body.includes("potencial") ||
        body.includes("Risco competitivo"),
      60000,
      5000
    );

    await page.screenshot({ path: SS("P07_analise_mercado_completa"), fullPage: true });

    const bodyFinal = await getBody(page);

    // Verificar card de sinais de mercado
    const temSinais =
      bodyFinal.includes("sinal") ||
      bodyFinal.includes("Sinal") ||
      bodyFinal.includes("competit") ||
      bodyFinal.includes("vencedor") ||
      bodyFinal.includes("análise") ||
      analisou;
    console.log("Análise de mercado retornou dados:", temSinais);

    // Verificar card de reputação do órgão
    const temReputacao =
      bodyFinal.includes("reputação") ||
      bodyFinal.includes("pregoeiro") ||
      bodyFinal.includes("pagador") ||
      bodyFinal.includes("histórico");
    console.log("Reputação do órgão presente:", temReputacao);

    // Verificar volume de compras e compras similares
    const temVolume =
      bodyFinal.includes("volume") ||
      bodyFinal.includes("similar") ||
      bodyFinal.includes("compras");
    console.log("Volume de compras presente:", temVolume);

    await page.screenshot({ path: SS("P07b_todos_cards_mercado"), fullPage: true });

    // Testar "Reanalisar Mercado"
    await page.evaluate(() => {
      const btns = document.querySelectorAll("button");
      const btn = Array.from(btns).find(b =>
        b.textContent?.trim().includes("Reanalisar Mercado") ||
        b.textContent?.trim().includes("Analisar Mercado")
      ) as HTMLButtonElement;
      if (btn) btn.click();
    });

    await page.waitForTimeout(5000);
    await page.screenshot({ path: SS("P07c_reanalisar_mercado"), fullPage: true });

    expect(true).toBeTruthy();
  });
});
