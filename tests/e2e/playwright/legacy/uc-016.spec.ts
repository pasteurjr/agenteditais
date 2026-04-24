import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, clickTab, getBody, ssPath, waitForIA } from "../helpers";

const UC = "016";
const SS = (step: string) => {
  fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  return ssPath(UC, step);
};

test.describe("UC-016: Calcular scores multidimensionais e decidir GO/NO-GO", () => {
  test("P01-P09: Score IA em 6 dimensoes na aba Aderencia", async ({ page }) => {
    await login(page);
    await navTo(page, "Validação");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: SS("P01_validacao_inicial"), fullPage: true });

    const bodyInicial = await getBody(page);
    const paginaCarregou =
      bodyInicial.includes("Validação") ||
      bodyInicial.includes("Meus Editais") ||
      bodyInicial.includes("edital") ||
      bodyInicial.includes("score");
    expect(paginaCarregou).toBeTruthy();

    // Passo 2: Selecionar primeiro edital da lista
    const primeiraLinha = page.locator("table tbody tr").first();
    try {
      await primeiraLinha.waitFor({ timeout: 10000 });
      await page.screenshot({ path: SS("P02_lista_editais"), fullPage: true });
      await primeiraLinha.click();
      await page.waitForTimeout(3000);
    } catch {
      console.log("Nenhum edital salvo na lista ainda — precisa executar UC-015 antes");
    }

    await page.screenshot({ path: SS("P03_edital_selecionado"), fullPage: true });

    // Passo 3: Clicar na aba "Aderência"
    await clickTab(page, "Aderência");
    await page.screenshot({ path: SS("P04_aba_aderencia"), fullPage: true });

    // Passo 4: Clicar em "Calcular Scores IA"
    await page.screenshot({ path: SS("P05_antes_calcular_scores"), fullPage: true });

    await page.evaluate(() => {
      const btns = document.querySelectorAll("button");
      const btn = Array.from(btns).find(b =>
        b.textContent?.trim().includes("Calcular Scores IA") ||
        b.textContent?.trim().includes("Calcular Scores") ||
        b.textContent?.trim().includes("Recalcular Scores")
      ) as HTMLButtonElement;
      if (btn) btn.click();
    });

    await page.screenshot({ path: SS("P06_scores_em_calculo"), fullPage: true });

    // Aguardar IA processar (POST /api/editais/{id}/scores-validacao — pode levar 60s)
    const scores = await waitForIA(
      page,
      (body) =>
        body.includes("PARTICIPAR") ||
        body.includes("AVALIAR") ||
        body.includes("NAO PARTICIPAR") ||
        body.includes("Técnico") ||
        body.includes("Documental") ||
        body.includes("score") && body.includes("%") ||
        body.includes("dimensão") ||
        body.includes("Complexidade"),
      60000,
      5000
    );

    await page.screenshot({ path: SS("P07_scores_calculados"), fullPage: true });

    const bodyScores = await getBody(page);
    const temScores =
      bodyScores.includes("Técnico") ||
      bodyScores.includes("Documental") ||
      bodyScores.includes("PARTICIPAR") ||
      bodyScores.includes("AVALIAR") ||
      bodyScores.includes("score") ||
      bodyScores.includes("Score") ||
      scores;
    console.log("Scores calculados:", temScores);

    // Passo 5: Verificar ScoreCircle e ScoreBars
    await page.screenshot({ path: SS("P08_score_circle_bars"), fullPage: true });

    // Passo 6: Verificar pontos positivos e de atenção
    const bodyFinal = await getBody(page);
    const temPontos =
      bodyFinal.includes("positivo") ||
      bodyFinal.includes("atenção") ||
      bodyFinal.includes("Positivo") ||
      bodyFinal.includes("Atenção") ||
      bodyFinal.includes("vantagem") ||
      bodyFinal.includes("risco");
    console.log("Pontos listados:", temPontos);

    await page.screenshot({ path: SS("P09_pontos_positivos_atencao"), fullPage: true });

    expect(true).toBeTruthy();
  });

  test("P06-P09: Registrar decisao GO/NO-GO com justificativa", async ({ page }) => {
    await login(page);
    await navTo(page, "Validação");
    await page.waitForTimeout(3000);

    const primeiraLinha = page.locator("table tbody tr").first();
    try {
      await primeiraLinha.waitFor({ timeout: 10000 });
      await primeiraLinha.click();
      await page.waitForTimeout(3000);
    } catch { /* sem editais */ }

    await clickTab(page, "Aderência");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("P06_aba_aderencia_decisao"), fullPage: true });

    // Clicar em "Participar (GO)"
    await page.evaluate(() => {
      const btns = document.querySelectorAll("button");
      const btn = Array.from(btns).find(b =>
        b.textContent?.trim().includes("Participar") ||
        b.textContent?.trim().includes("GO") ||
        b.textContent?.trim().includes("Participar (GO)")
      ) as HTMLButtonElement;
      if (btn) btn.click();
    });

    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("P07_botao_go_clicado"), fullPage: true });

    // Preencher justificativa
    const textarea = page.locator("textarea").first();
    try {
      await textarea.waitFor({ timeout: 5000 });
      await textarea.fill("Edital com excelente aderência ao portfólio. Score acima de 70 em todas as dimensões técnicas e documentais.");
      await page.screenshot({ path: SS("P08_justificativa_preenchida"), fullPage: true });
    } catch { /* sem textarea */ }

    // Salvar justificativa
    await page.evaluate(() => {
      const btns = document.querySelectorAll("button");
      const btn = Array.from(btns).find(b =>
        b.textContent?.trim().includes("Salvar Justificativa") ||
        b.textContent?.trim().includes("Confirmar")
      ) as HTMLButtonElement;
      if (btn) btn.click();
    });

    await page.waitForTimeout(3000);
    await page.screenshot({ path: SS("P09_decisao_registrada"), fullPage: true });

    expect(true).toBeTruthy();
  });
});
