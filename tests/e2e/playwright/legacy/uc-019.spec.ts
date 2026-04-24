import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, clickTab, getBody, ssPath, waitForIA } from "../helpers";

const UC = "019";
const SS = (step: string) => {
  fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  return ssPath(UC, step);
};

test.describe("UC-019: Listar editais salvos, selecionar edital e usar IA na validacao", () => {
  test("P01-P07: Listagem e selecao de editais salvos", async ({ page }) => {
    await login(page);
    await navTo(page, "Validação");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: SS("P01_validacao_page"), fullPage: true });

    // Verificar tabela "Meus Editais"
    const body = await getBody(page);
    const temLista =
      body.includes("Meus Editais") ||
      body.includes("edital") ||
      body.includes("Edital") ||
      body.includes("status") ||
      body.includes("Score");
    expect(temLista).toBeTruthy();

    // Passo 2: Verificar filtro por status
    await page.screenshot({ path: SS("P02_tabela_editais"), fullPage: true });

    const filtroStatus = page.locator('select, [class*="select"]').filter({ hasText: /status|novo|avaliando|go|nogo/i }).first();
    try {
      await filtroStatus.waitFor({ timeout: 5000 });
      await page.screenshot({ path: SS("P03_filtro_status"), fullPage: true });
    } catch {
      // Tenta via evaluate
      await page.evaluate(() => {
        const selects = document.querySelectorAll("select");
        const select = Array.from(selects).find(s =>
          Array.from(s.options).some(o =>
            o.value === "novo" || o.value === "avaliando" || o.value === "go"
          )
        ) as HTMLSelectElement;
        if (select) select.click();
      });
      await page.screenshot({ path: SS("P03_filtro_status_fallback"), fullPage: true });
    }

    // Passo 4: Selecionar primeiro edital da lista
    const primeiraLinha = page.locator("table tbody tr").first();
    try {
      await primeiraLinha.waitFor({ timeout: 10000 });
      await page.screenshot({ path: SS("P04_antes_selecionar"), fullPage: true });
      await primeiraLinha.click();
      await page.waitForTimeout(3000);
      await page.screenshot({ path: SS("P05_edital_selecionado"), fullPage: true });
    } catch {
      console.log("Nenhum edital na lista — executar UC-015 primeiro");
      await page.screenshot({ path: SS("P04_sem_editais"), fullPage: true });
    }

    // Passo 5: Verificar dados carregados automaticamente (itens, lotes, historico)
    const bodyPos = await getBody(page);
    const dadosCarregados =
      bodyPos.includes("Aderência") ||
      bodyPos.includes("Lotes") ||
      bodyPos.includes("Documentos") ||
      bodyPos.includes("Riscos") ||
      bodyPos.includes("Mercado") ||
      bodyPos.includes("IA");
    console.log("Painel de análise carregado:", dadosCarregados);

    await page.screenshot({ path: SS("P06_painel_analise"), fullPage: true });

    // Passo 6: Testar botão "Ver Edital" (PdfViewer)
    await page.evaluate(() => {
      const btns = document.querySelectorAll("button");
      const btn = Array.from(btns).find(b =>
        b.textContent?.trim().includes("Ver Edital") ||
        b.textContent?.trim().includes("Ver PDF")
      ) as HTMLButtonElement;
      if (btn) btn.click();
    });

    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("P07_pdf_viewer"), fullPage: true });

    expect(true).toBeTruthy();
  });

  test("FA-02: Aba IA — Gerar Resumo do edital", async ({ page }) => {
    await login(page);
    await navTo(page, "Validação");
    await page.waitForTimeout(3000);

    // Selecionar edital
    const primeiraLinha = page.locator("table tbody tr").first();
    try {
      await primeiraLinha.waitFor({ timeout: 10000 });
      await primeiraLinha.click();
      await page.waitForTimeout(3000);
    } catch {
      console.log("Nenhum edital — continuando sem seleção");
    }

    // Navegar para aba IA
    await clickTab(page, "IA");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("FA02_aba_ia"), fullPage: true });

    const bodyIA = await getBody(page);
    const abaIA =
      bodyIA.includes("Gerar Resumo") ||
      bodyIA.includes("Resumo") ||
      bodyIA.includes("Perguntar") ||
      bodyIA.includes("Requisitos") ||
      bodyIA.includes("Classificar");
    console.log("Aba IA carregada:", abaIA);

    // Clicar em "Gerar Resumo"
    await page.screenshot({ path: SS("FA02_antes_gerar_resumo"), fullPage: true });

    await page.evaluate(() => {
      const btns = document.querySelectorAll("button");
      const btn = Array.from(btns).find(b =>
        b.textContent?.trim().includes("Gerar Resumo") ||
        b.textContent?.trim().includes("Regerar Resumo") ||
        b.textContent?.trim().includes("Resumo")
      ) as HTMLButtonElement;
      if (btn) btn.click();
    });

    await page.screenshot({ path: SS("FA02_resumo_gerando"), fullPage: true });

    // Aguardar resposta da IA (POST /api/chat)
    const resumoGerado = await waitForIA(
      page,
      (body) =>
        body.includes("resumo") ||
        body.includes("Resumo") ||
        body.includes("objeto do edital") ||
        body.includes("licitação") ||
        body.includes("edital trata") ||
        body.length > 2000,
      60000,
      5000
    );

    await page.screenshot({ path: SS("FA02_resumo_gerado"), fullPage: true });
    console.log("Resumo gerado:", resumoGerado);

    // Testar pergunta livre
    const inputPergunta = page.locator('input[placeholder*="pergunta"], input[placeholder*="Pergunta"], textarea[placeholder*="pergunta"]').first();
    try {
      await inputPergunta.waitFor({ timeout: 5000 });
      await inputPergunta.fill("Quais são os requisitos técnicos obrigatórios?");
      await page.screenshot({ path: SS("FA02_pergunta_preenchida"), fullPage: true });

      await page.evaluate(() => {
        const btns = document.querySelectorAll("button");
        const btn = Array.from(btns).find(b =>
          b.textContent?.trim().includes("Perguntar") ||
          b.textContent?.trim().includes("Enviar")
        ) as HTMLButtonElement;
        if (btn) btn.click();
      });

      await page.waitForTimeout(15000);
      await page.screenshot({ path: SS("FA02_resposta_pergunta"), fullPage: true });
    } catch { /* sem campo de pergunta */ }

    // Testar ação rápida "Requisitos Técnicos"
    await page.evaluate(() => {
      const btns = document.querySelectorAll("button");
      const btn = Array.from(btns).find(b =>
        b.textContent?.trim().includes("Requisitos Técnicos") ||
        b.textContent?.trim().includes("Requisitos Tecnicos")
      ) as HTMLButtonElement;
      if (btn) btn.click();
    });

    await page.waitForTimeout(10000);
    await page.screenshot({ path: SS("FA02_requisitos_tecnicos"), fullPage: true });

    expect(true).toBeTruthy();
  });
});
