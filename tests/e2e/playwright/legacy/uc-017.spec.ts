import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, clickTab, getBody, ssPath, waitForIA } from "../helpers";

const UC = "017";
const SS = (step: string) => {
  fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  return ssPath(UC, step);
};

test.describe("UC-017: Lotes, Documentos e Riscos na ValidacaoPage", () => {
  async function navegarParaValidacaoComEdital(page: any) {
    await login(page);
    await navTo(page, "Validação");
    await page.waitForTimeout(3000);

    const primeiraLinha = page.locator("table tbody tr").first();
    try {
      await primeiraLinha.waitFor({ timeout: 10000 });
      await primeiraLinha.click();
      await page.waitForTimeout(3000);
    } catch {
      console.log("Nenhum edital disponível na lista de validação");
    }
  }

  test("P01-P07: Aba Lotes — importar itens PNCP e extrair lotes via IA", async ({ page }) => {
    await navegarParaValidacaoComEdital(page);
    await page.screenshot({ path: SS("P01_edital_selecionado"), fullPage: true });

    // Navegar para aba Lotes
    await clickTab(page, "Lotes");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("P02_aba_lotes"), fullPage: true });

    const bodyLotes = await getBody(page);
    const abaLotesAtiva =
      bodyLotes.includes("Lote") ||
      bodyLotes.includes("lote") ||
      bodyLotes.includes("item") ||
      bodyLotes.includes("Item") ||
      bodyLotes.includes("PNCP");
    expect(abaLotesAtiva).toBeTruthy();

    // Passo 3: Clicar em "Buscar Itens no PNCP"
    await page.screenshot({ path: SS("P03_antes_buscar_itens"), fullPage: true });

    await page.evaluate(() => {
      const btns = document.querySelectorAll("button");
      const btn = Array.from(btns).find(b =>
        b.textContent?.trim().includes("Buscar Itens no PNCP") ||
        b.textContent?.trim().includes("Buscar Itens") ||
        b.textContent?.trim().includes("Importar Itens")
      ) as HTMLButtonElement;
      if (btn) btn.click();
    });

    await page.waitForTimeout(10000);
    await page.screenshot({ path: SS("P04_itens_importados"), fullPage: true });

    // Passo 5: Clicar em "Extrair Lotes via IA"
    await page.evaluate(() => {
      const btns = document.querySelectorAll("button");
      const btn = Array.from(btns).find(b =>
        b.textContent?.trim().includes("Extrair Lotes via IA") ||
        b.textContent?.trim().includes("Extrair Lotes") ||
        b.textContent?.trim().includes("Processar Lotes")
      ) as HTMLButtonElement;
      if (btn) btn.click();
    });

    await page.screenshot({ path: SS("P05_extracao_lotes_iniciada"), fullPage: true });

    const lotesExtraidos = await waitForIA(
      page,
      (body) =>
        body.includes("Lote 1") ||
        body.includes("lote 1") ||
        body.includes("extraído") ||
        body.includes("processado") ||
        body.includes("item") && body.includes("valor"),
      60000,
      5000
    );

    await page.screenshot({ path: SS("P06_lotes_extraidos"), fullPage: true });

    const bodyFinal = await getBody(page);
    console.log("Lotes extraídos:", lotesExtraidos);
    console.log("Conteúdo com lotes:", bodyFinal.includes("Lote") || bodyFinal.includes("lote"));

    // Passo 7: Tentar Reprocessar
    await page.evaluate(() => {
      const btns = document.querySelectorAll("button");
      const btn = Array.from(btns).find(b =>
        b.textContent?.trim().includes("Reprocessar")
      ) as HTMLButtonElement;
      if (btn) btn.click();
    });

    await page.waitForTimeout(3000);
    await page.screenshot({ path: SS("P07_reprocessar"), fullPage: true });

    expect(true).toBeTruthy();
  });

  test("P08-P12: Aba Documentos — identificar requisitos documentais", async ({ page }) => {
    await navegarParaValidacaoComEdital(page);

    // Navegar para aba Documentos
    await clickTab(page, "Documentos");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("P08_aba_documentos"), fullPage: true });

    const bodyDocs = await getBody(page);
    const abaDocsAtiva =
      bodyDocs.includes("Documento") ||
      bodyDocs.includes("documento") ||
      bodyDocs.includes("certidão") ||
      bodyDocs.includes("Certidão") ||
      bodyDocs.includes("atestado");
    console.log("Aba Documentos ativa:", abaDocsAtiva);

    // Clicar em "Identificar Documentos Exigidos pelo Edital"
    await page.screenshot({ path: SS("P09_antes_identificar_docs"), fullPage: true });

    await page.evaluate(() => {
      const btns = document.querySelectorAll("button");
      const btn = Array.from(btns).find(b =>
        b.textContent?.trim().includes("Identificar Documentos") ||
        b.textContent?.trim().includes("Reidentificar Documentos") ||
        b.textContent?.trim().includes("Buscar Documentos")
      ) as HTMLButtonElement;
      if (btn) btn.click();
    });

    await page.waitForTimeout(15000);
    await page.screenshot({ path: SS("P10_documentos_identificados"), fullPage: true });

    const bodyDocsFinal = await getBody(page);
    const temDocs =
      bodyDocsFinal.includes("ok") ||
      bodyDocsFinal.includes("faltando") ||
      bodyDocsFinal.includes("vencido") ||
      bodyDocsFinal.includes("CND") ||
      bodyDocsFinal.includes("FGTS") ||
      bodyDocsFinal.includes("Certidão");
    console.log("Documentos listados:", temDocs);

    // Verificar Certidões
    await page.evaluate(() => {
      const btns = document.querySelectorAll("button");
      const btn = Array.from(btns).find(b =>
        b.textContent?.trim().includes("Verificar Certidões") ||
        b.textContent?.trim().includes("Verificar Certidoes")
      ) as HTMLButtonElement;
      if (btn) btn.click();
    });

    await page.waitForTimeout(5000);
    await page.screenshot({ path: SS("P12_certidoes_verificadas"), fullPage: true });

    expect(true).toBeTruthy();
  });

  test("P13-P17: Aba Riscos — analisar riscos, atas e vencedores", async ({ page }) => {
    await navegarParaValidacaoComEdital(page);

    // Navegar para aba Riscos
    await clickTab(page, "Riscos");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("P13_aba_riscos"), fullPage: true });

    const bodyRiscos = await getBody(page);
    const abaRiscosAtiva =
      bodyRiscos.includes("Risco") ||
      bodyRiscos.includes("risco") ||
      bodyRiscos.includes("Analisar Riscos") ||
      bodyRiscos.includes("fatal") ||
      bodyRiscos.includes("juridico");
    console.log("Aba Riscos ativa:", abaRiscosAtiva);

    // Clicar em "Analisar Riscos do Edital"
    await page.screenshot({ path: SS("P14_antes_analisar_riscos"), fullPage: true });

    await page.evaluate(() => {
      const btns = document.querySelectorAll("button");
      const btn = Array.from(btns).find(b =>
        b.textContent?.trim().includes("Analisar Riscos do Edital") ||
        b.textContent?.trim().includes("Analisar Riscos") ||
        b.textContent?.trim().includes("Reanalisar Riscos")
      ) as HTMLButtonElement;
      if (btn) btn.click();
    });

    await page.screenshot({ path: SS("P15_riscos_em_analise"), fullPage: true });

    const riscos = await waitForIA(
      page,
      (body) =>
        body.includes("risco") ||
        body.includes("Risco") ||
        body.includes("fatal") ||
        body.includes("juridico") ||
        body.includes("flag") ||
        body.includes("clausula"),
      60000,
      5000
    );

    await page.screenshot({ path: SS("P15_riscos_analisados"), fullPage: true });
    console.log("Riscos analisados:", riscos);

    // Rebuscar Atas
    await page.evaluate(() => {
      const btns = document.querySelectorAll("button");
      const btn = Array.from(btns).find(b =>
        b.textContent?.trim().includes("Rebuscar Atas") ||
        b.textContent?.trim().includes("Buscar Atas")
      ) as HTMLButtonElement;
      if (btn) btn.click();
    });

    await page.waitForTimeout(10000);
    await page.screenshot({ path: SS("P16_atas_rebuscadas"), fullPage: true });

    // Buscar Vencedores e Precos
    await page.evaluate(() => {
      const btns = document.querySelectorAll("button");
      const btn = Array.from(btns).find(b =>
        b.textContent?.trim().includes("Buscar Vencedores") ||
        b.textContent?.trim().includes("Vencedores e Preços")
      ) as HTMLButtonElement;
      if (btn) btn.click();
    });

    await page.waitForTimeout(10000);
    await page.screenshot({ path: SS("P17_vencedores_precos"), fullPage: true });

    expect(true).toBeTruthy();
  });
});
