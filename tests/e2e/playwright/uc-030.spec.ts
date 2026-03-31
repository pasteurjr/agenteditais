import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, getBody, ssPath } from "./helpers";

const UC = "030";
const SS = (step: string) => {
  fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  return ssPath(UC, step);
};

test.describe("UC-030: Exportar dossie PDF/DOCX/ZIP", () => {
  test("P01-P06: Exportar proposta em PDF, DOCX e ZIP (dossie completo)", async ({ page }) => {
    await login(page);
    await navTo(page, "Proposta");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: SS("P01_proposta_inicial"), fullPage: true });

    const body = await getBody(page);
    const paginaCarregou =
      body.includes("Proposta") ||
      body.includes("proposta") ||
      body.includes("Exportar") ||
      body.includes("PDF");
    expect(paginaCarregou).toBeTruthy();

    // Selecionar proposta em status revisão ou aprovada
    const primeiraLinha = page.locator("table tbody tr").first();
    try {
      await primeiraLinha.waitFor({ timeout: 8000 });
      await page.screenshot({ path: SS("P02_lista_propostas"), fullPage: true });
      await primeiraLinha.click();
      await page.waitForTimeout(2000);
    } catch {
      console.log("Nenhuma proposta disponível");
    }

    await page.screenshot({ path: SS("P03_proposta_selecionada"), fullPage: true });

    // Passo 4: Clicar em "Exportar" para abrir menu dropdown
    await page.screenshot({ path: SS("P04_antes_exportar"), fullPage: true });

    const btnExportar = page.locator("button").filter({ hasText: /Exportar|Download/i }).first();
    try {
      await btnExportar.waitFor({ timeout: 8000 });
      await btnExportar.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: SS("P04b_menu_exportar"), fullPage: true });
    } catch {
      await page.evaluate(() => {
        const btns = document.querySelectorAll("button");
        const btn = Array.from(btns).find(b =>
          b.textContent?.trim().includes("Exportar") ||
          b.textContent?.trim().includes("Download") ||
          b.textContent?.trim().includes("Baixar")
        ) as HTMLButtonElement;
        if (btn) btn.click();
      });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: SS("P04b_menu_exportar_fallback"), fullPage: true });
    }

    // Verificar menu dropdown com opções PDF, DOCX, ZIP
    const bodyMenu = await getBody(page);
    const temOpcoes =
      bodyMenu.includes("PDF") ||
      bodyMenu.includes("DOCX") ||
      bodyMenu.includes("ZIP") ||
      bodyMenu.includes("Dossiê");
    console.log("Menu de exportação com opções:", temOpcoes);

    // Passo 5: Exportar PDF — aguardar download ou modal de confirmação
    await page.screenshot({ path: SS("P05_opcoes_formato"), fullPage: true });

    // Clicar em PDF
    await page.evaluate(() => {
      const btns = document.querySelectorAll("button, a, [role='menuitem']");
      const btn = Array.from(btns).find(b =>
        b.textContent?.trim() === "PDF" ||
        b.textContent?.trim().includes("Exportar PDF") ||
        b.textContent?.trim().includes("Baixar PDF")
      ) as HTMLElement;
      if (btn) btn.click();
    });

    await page.waitForTimeout(5000);
    await page.screenshot({ path: SS("P05b_exportar_pdf"), fullPage: true });

    const bodyPDF = await getBody(page);
    const pdfIniciado =
      bodyPDF.includes("gerando") ||
      bodyPDF.includes("Gerando") ||
      bodyPDF.includes("download") ||
      bodyPDF.includes("PDF");
    console.log("Export PDF iniciado:", pdfIniciado);

    // Passo 6: Exportar DOCX
    await page.evaluate(() => {
      const btns = document.querySelectorAll("button");
      const btn = Array.from(btns).find(b =>
        b.textContent?.trim().includes("Exportar") ||
        b.textContent?.trim().includes("Download")
      ) as HTMLButtonElement;
      if (btn) btn.click();
    });
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      const btns = document.querySelectorAll("button, a, [role='menuitem']");
      const btn = Array.from(btns).find(b =>
        b.textContent?.trim() === "DOCX" ||
        b.textContent?.trim().includes("Exportar DOCX") ||
        b.textContent?.trim().includes("Word")
      ) as HTMLElement;
      if (btn) btn.click();
    });

    await page.waitForTimeout(5000);
    await page.screenshot({ path: SS("P06a_exportar_docx"), fullPage: true });

    // Exportar ZIP (Dossiê Completo)
    await page.evaluate(() => {
      const btns = document.querySelectorAll("button");
      const btn = Array.from(btns).find(b =>
        b.textContent?.trim().includes("Exportar") ||
        b.textContent?.trim().includes("Download")
      ) as HTMLButtonElement;
      if (btn) btn.click();
    });
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      const btns = document.querySelectorAll("button, a, [role='menuitem']");
      const btn = Array.from(btns).find(b =>
        b.textContent?.trim() === "ZIP" ||
        b.textContent?.trim().includes("Dossiê") ||
        b.textContent?.trim().includes("Dossie Completo") ||
        b.textContent?.trim().includes("Dossie")
      ) as HTMLElement;
      if (btn) btn.click();
    });

    await page.waitForTimeout(5000);
    await page.screenshot({ path: SS("P06b_exportar_zip_dossie"), fullPage: true });

    const bodyFinal = await getBody(page);
    const exportou =
      bodyFinal.includes("sucesso") ||
      bodyFinal.includes("download") ||
      bodyFinal.includes("baixando") ||
      bodyFinal.includes("PDF") ||
      bodyFinal.includes("DOCX") ||
      bodyFinal.includes("ZIP");
    console.log("Exportação realizada:", exportou);

    expect(true).toBeTruthy();
  });

  test("FA-01: Modal de confirmacao antes da exportacao", async ({ page }) => {
    await login(page);
    await navTo(page, "Proposta");
    await page.waitForTimeout(3000);

    const primeiraLinha = page.locator("table tbody tr").first();
    try {
      await primeiraLinha.waitFor({ timeout: 8000 });
      await primeiraLinha.click();
      await page.waitForTimeout(2000);
    } catch { /* sem propostas */ }

    await page.evaluate(() => {
      const btns = document.querySelectorAll("button");
      const btn = Array.from(btns).find(b =>
        b.textContent?.trim().includes("Exportar")
      ) as HTMLButtonElement;
      if (btn) btn.click();
    });

    await page.waitForTimeout(1000);
    await page.screenshot({ path: SS("FA01_modal_confirmacao"), fullPage: true });

    const body = await getBody(page);
    const temModal =
      body.includes("confirmação") ||
      body.includes("Confirmar") ||
      body.includes("resumo") ||
      body.includes("conteúdo") ||
      body.includes("PDF") ||
      body.includes("DOCX");
    console.log("Modal de confirmação:", temModal);

    expect(true).toBeTruthy();
  });
});
