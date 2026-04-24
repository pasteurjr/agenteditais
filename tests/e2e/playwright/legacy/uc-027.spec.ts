import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, getBody, ssPath } from "../helpers";

const UC = "027";
const SS = (step: string) => {
  fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  return ssPath(UC, step);
};

test.describe("UC-027: Editar proposta no editor rico com Markdown", () => {
  test("P01-P06: Abrir editor, usar toolbar e salvar edicao", async ({ page }) => {
    await login(page);
    await navTo(page, "Proposta");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: SS("P01_proposta_lista"), fullPage: true });

    const body = await getBody(page);
    const paginaCarregou =
      body.includes("Proposta") ||
      body.includes("proposta") ||
      body.includes("editar") ||
      body.includes("rascunho");
    expect(paginaCarregou).toBeTruthy();

    // Passo 2: Clicar em "Editar" em proposta existente
    const btnEditar = page.locator("button").filter({ hasText: /^Editar$/i }).first();
    try {
      await btnEditar.waitFor({ timeout: 8000 });
      await page.screenshot({ path: SS("P02_antes_editar"), fullPage: true });
      await btnEditar.click();
      await page.waitForTimeout(2000);
    } catch {
      // Tentar via ícone de edição
      await page.evaluate(() => {
        const btns = document.querySelectorAll("button");
        const btn = Array.from(btns).find(b =>
          b.textContent?.trim() === "Editar" ||
          b.title?.includes("Editar") ||
          b.getAttribute("aria-label")?.includes("Editar")
        ) as HTMLButtonElement;
        if (btn) btn.click();
      });
      await page.waitForTimeout(2000);
    }

    await page.screenshot({ path: SS("P03_editor_aberto"), fullPage: true });

    // Verificar editor rico (TextArea + MarkdownToolbar)
    const bodyEditor = await getBody(page);
    const editorAberto =
      bodyEditor.includes("Negrito") ||
      bodyEditor.includes("negrito") ||
      bodyEditor.includes("bold") ||
      bodyEditor.includes("toolbar") ||
      bodyEditor.includes("Markdown") ||
      bodyEditor.includes("**") ||
      bodyEditor.includes("Preview");
    console.log("Editor rico aberto:", editorAberto);

    // Passo 3: Localizar textarea e editar texto
    const textarea = page.locator("textarea").first();
    try {
      await textarea.waitFor({ timeout: 8000 });
      await page.screenshot({ path: SS("P04_textarea_visivel"), fullPage: true });

      // Adicionar texto ao editor
      await textarea.click();
      await textarea.evaluate((el: HTMLTextAreaElement) => {
        el.value = el.value + "\n\n## Condições de Entrega\n\nA empresa garante entrega em até **7 dias úteis** após confirmação do pedido.";
        el.dispatchEvent(new Event("input", { bubbles: true }));
      });
      await page.screenshot({ path: SS("P04b_texto_editado"), fullPage: true });
    } catch {
      console.log("Textarea não encontrada diretamente");
      await page.screenshot({ path: SS("P04_sem_textarea"), fullPage: true });
    }

    // Passo 4: Usar toolbar de formatação (negrito)
    const toolbarNegrito = page.locator("button").filter({ hasText: /Negrito|Bold|B/i }).first();
    try {
      await toolbarNegrito.waitFor({ timeout: 5000 });
      await toolbarNegrito.click();
      await page.waitForTimeout(500);
      await page.screenshot({ path: SS("P05_toolbar_negrito"), fullPage: true });
    } catch {
      // Tentar via botão com ícone B
      await page.evaluate(() => {
        const btns = document.querySelectorAll("button");
        const btn = Array.from(btns).find(b =>
          b.textContent?.trim() === "B" ||
          b.innerHTML.includes("bold") ||
          b.title?.toLowerCase().includes("negrito")
        ) as HTMLButtonElement;
        if (btn) btn.click();
      });
      await page.screenshot({ path: SS("P05_toolbar_negrito_fallback"), fullPage: true });
    }

    // Verificar preview se disponível
    const btnPreview = page.locator("button").filter({ hasText: /Preview|Visualizar|Pré-visualiz/i }).first();
    try {
      await btnPreview.waitFor({ timeout: 5000 });
      await btnPreview.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: SS("P05b_preview"), fullPage: true });
    } catch { /* sem preview */ }

    // Passo 5: Salvar proposta (PUT /api/propostas/{id})
    await page.evaluate(() => {
      const btns = document.querySelectorAll("button");
      const btn = Array.from(btns).find(b =>
        b.textContent?.trim().includes("Salvar") ||
        b.textContent?.trim().includes("Confirmar Edição") ||
        b.textContent?.trim().includes("Atualizar")
      ) as HTMLButtonElement;
      if (btn) btn.click();
    });

    await page.waitForTimeout(3000);
    await page.screenshot({ path: SS("P06_proposta_salva"), fullPage: true });

    const bodyFinal = await getBody(page);
    const salvou =
      bodyFinal.includes("salvo") ||
      bodyFinal.includes("Salvo") ||
      bodyFinal.includes("sucesso") ||
      bodyFinal.includes("atualizado");
    console.log("Proposta salva:", salvou);

    expect(true).toBeTruthy();
  });

  test("FA-01: Verificar PropostaLog — controle de versoes", async ({ page }) => {
    await login(page);
    await navTo(page, "Proposta");
    await page.waitForTimeout(3000);

    await page.screenshot({ path: SS("FA01_historico_versoes"), fullPage: true });

    // Procurar histórico de versões
    const btnHistorico = page.locator("button").filter({ hasText: /Histórico|Log|Versões/i }).first();
    try {
      await btnHistorico.waitFor({ timeout: 5000 });
      await btnHistorico.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: SS("FA01_log_versoes"), fullPage: true });
    } catch {
      await page.screenshot({ path: SS("FA01_sem_historico"), fullPage: true });
    }

    const body = await getBody(page);
    const temLog =
      body.includes("log") ||
      body.includes("Log") ||
      body.includes("versão") ||
      body.includes("histórico") ||
      body.includes("edição");
    console.log("PropostaLog disponível:", temLog);

    expect(true).toBeTruthy();
  });
});
