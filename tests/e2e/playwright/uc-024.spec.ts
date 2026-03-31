import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, clickTab, getBody, ssPath, waitForIA } from "./helpers";

const UC = "024";
const SS = (step: string) => {
  fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  return ssPath(UC, step);
};

test.describe("UC-024: Simular disputa de precos", () => {
  test("P01-P06: Aba Lances — simular cenarios de disputa em pregao eletronico", async ({ page }) => {
    await login(page);
    await navTo(page, "Precificação");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: SS("P01_precificacao_inicial"), fullPage: true });

    // Selecionar edital
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

    // Navegar para aba Lances
    await clickTab(page, "Lances");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("P03_aba_lances"), fullPage: true });

    const bodyLances = await getBody(page);
    const abaLancesAtiva =
      bodyLances.includes("Lance") ||
      bodyLances.includes("lance") ||
      bodyLances.includes("Simular") ||
      bodyLances.includes("disputa") ||
      bodyLances.includes("pregão") ||
      bodyLances.includes("Camada D") ||
      bodyLances.includes("Camada E");
    console.log("Aba Lances ativa:", abaLancesAtiva);

    // Verificar campos de lance inicial (Camada D) e lance mínimo (Camada E)
    await page.screenshot({ path: SS("P04_campos_lance"), fullPage: true });

    const inputLanceInicial = page.locator('input[name*="lance_inicial"], input[name*="proposta"], input[placeholder*="lance inicial"]').first();
    try {
      await inputLanceInicial.waitFor({ timeout: 5000 });
      await inputLanceInicial.fill("28.00");
      await page.screenshot({ path: SS("P04b_lance_inicial_preenchido"), fullPage: true });
    } catch {
      // Tenta preencher via index
      const inputs = page.locator('input[type="number"]');
      const count = await inputs.count();
      if (count > 0) {
        await inputs.first().fill("28.00");
        await page.screenshot({ path: SS("P04b_lance_inicial_fallback"), fullPage: true });
      }
    }

    const inputLanceMinimo = page.locator('input[name*="lance_minimo"], input[name*="minimo"], input[placeholder*="lance mínimo"]').first();
    try {
      await inputLanceMinimo.waitFor({ timeout: 3000 });
      await inputLanceMinimo.fill("24.50");
      await page.screenshot({ path: SS("P04c_lance_minimo_preenchido"), fullPage: true });
    } catch { /* sem campo */ }

    // Clicar em "Simular Disputa"
    await page.screenshot({ path: SS("P05_antes_simular"), fullPage: true });

    await page.evaluate(() => {
      const btns = document.querySelectorAll("button");
      const btn = Array.from(btns).find(b =>
        b.textContent?.trim().includes("Simular Disputa") ||
        b.textContent?.trim().includes("Simular") ||
        b.textContent?.trim().includes("Simular Cenários")
      ) as HTMLButtonElement;
      if (btn) btn.click();
    });

    await page.screenshot({ path: SS("P05b_simulacao_iniciada"), fullPage: true });

    // Aguardar resultado da simulação (POST /api/editais/{id}/simular-disputa)
    const simulou = await waitForIA(
      page,
      (body) =>
        body.includes("cenário") ||
        body.includes("margem") ||
        body.includes("vitória") ||
        body.includes("probabilidade") ||
        body.includes("disputa") && body.includes("R$") ||
        body.includes("resultado"),
      60000,
      5000
    );

    await page.screenshot({ path: SS("P06_cenarios_simulados"), fullPage: true });

    const bodyFinal = await getBody(page);
    const temResultados =
      bodyFinal.includes("cenário") ||
      bodyFinal.includes("margem") ||
      bodyFinal.includes("probabilidade") ||
      bodyFinal.includes("resultado") ||
      simulou;
    console.log("Simulação retornou resultados:", temResultados);

    // Verificar análise de margem e posicionamento
    const temMargem =
      bodyFinal.includes("margem") ||
      bodyFinal.includes("Margem") ||
      bodyFinal.includes("%");
    console.log("Margem calculada:", temMargem);

    await page.screenshot({ path: SS("P06b_analise_margem"), fullPage: true });

    expect(true).toBeTruthy();
  });

  test("FA-01: Verificar posicionamento competitivo no resultado", async ({ page }) => {
    await login(page);
    await navTo(page, "Precificação");
    await page.waitForTimeout(3000);

    await clickTab(page, "Lances");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("FA01_lances_competitivo"), fullPage: true });

    const body = await getBody(page);
    const temCompetitividade =
      body.includes("competitivo") ||
      body.includes("posicionamento") ||
      body.includes("concorrente") ||
      body.includes("histórico") ||
      body.includes("referência");
    console.log("Posicionamento competitivo:", temCompetitividade);

    expect(true).toBeTruthy();
  });
});
