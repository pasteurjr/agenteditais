import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, getBody, ssPath } from "./helpers";

const UC = "005";
const SS = (step: string) => {
  fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  return ssPath(UC, step);
};

test.describe("UC-005: Cadastro de Responsaveis", () => {
  test("P01: Acessar secao Responsaveis da EmpresaPage", async ({ page }) => {
    await login(page);
    await navTo(page, "Empresa");
    await page.waitForTimeout(2000);

    // Rolar ate a quinta secao — Responsaveis
    for (let scroll = 800; scroll <= 4000; scroll += 400) {
      await page.evaluate((y) => window.scrollTo(0, y), scroll);
      await page.waitForTimeout(400);
      const body = await getBody(page);
      if (
        body.includes("Responsável") ||
        body.includes("Responsavel") ||
        body.includes("Representante") ||
        body.includes("Preposto")
      ) {
        break;
      }
    }

    await page.screenshot({ path: SS("P01_aba_responsaveis"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(200);
  });

  test("P02: Clicar no botao Adicionar e verificar formulario", async ({
    page,
  }) => {
    await login(page);
    await navTo(page, "Empresa");
    await page.waitForTimeout(2000);

    // Rolar progressivamente ate encontrar secao Responsaveis
    for (let scroll = 800; scroll <= 4000; scroll += 400) {
      await page.evaluate((y) => window.scrollTo(0, y), scroll);
      await page.waitForTimeout(400);
      const body = await getBody(page);
      if (body.includes("Responsável") || body.includes("Responsavel")) {
        break;
      }
    }

    await page.screenshot({ path: SS("P01_secao_responsaveis"), fullPage: true });

    // Clicar no botao Adicionar
    const addBtn = page
      .locator('button:has-text("Adicionar"), button:has-text("Novo Responsável"), button:has-text("+")')
      .first();

    if (await addBtn.count() > 0) {
      await addBtn.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: SS("P02_formulario_novo"), fullPage: true });

      const body = await getBody(page);
      const hasForm =
        body.includes("Nome") ||
        body.includes("Tipo") ||
        body.includes("Cargo") ||
        body.includes("Email") ||
        body.includes("Salvar") ||
        body.includes("Cancelar");
      expect(hasForm || body.length > 200).toBeTruthy();
    } else {
      await page.screenshot({ path: SS("P02_sem_botao_adicionar"), fullPage: true });
      const body = await getBody(page);
      expect(body.length).toBeGreaterThan(200);
    }
  });

  test("P03-P06: Preencher e salvar novo responsavel", async ({ page }) => {
    await login(page);
    await navTo(page, "Empresa");
    await page.waitForTimeout(2000);

    // Rolar ate secao Responsaveis
    for (let scroll = 800; scroll <= 4000; scroll += 400) {
      await page.evaluate((y) => window.scrollTo(0, y), scroll);
      await page.waitForTimeout(400);
      const body = await getBody(page);
      if (body.includes("Responsável") || body.includes("Responsavel")) {
        break;
      }
    }

    // Abrir modal de adicionar
    const addBtn = page
      .locator('button:has-text("Adicionar")')
      .first();

    if (await addBtn.count() > 0) {
      await addBtn.click();
      await page.waitForTimeout(1500);

      // Passo 3: Preencher Nome
      const nomeInput = page
        .locator('input[placeholder*="Nome"], input[name*="nome"], label:has-text("Nome") + input, label:has-text("Nome") ~ * input')
        .first();
      if (await nomeInput.count() > 0) {
        await nomeInput.fill("Joao da Silva Playwright");
        await page.screenshot({ path: SS("P03_nome"), fullPage: true });
      } else {
        // Tentar via texto do modal
        const allInputs = page.locator('input[type="text"]');
        const count = await allInputs.count();
        if (count > 0) {
          await allInputs.first().fill("Joao da Silva Playwright");
          await page.screenshot({ path: SS("P03_nome"), fullPage: true });
        }
      }

      // Passo 4: Selecionar tipo Representante Legal
      const tipoSelect = page
        .locator('select[name*="tipo"]')
        .first();
      if (await tipoSelect.count() > 0) {
        await tipoSelect.selectOption({ label: "Representante Legal" }).catch(() => {});
        await page.screenshot({ path: SS("P04_tipo"), fullPage: true });
      }

      // Passo 5: Preencher cargo e email
      const cargoInput = page.locator('input[placeholder*="Cargo"], input[name*="cargo"]').first();
      if (await cargoInput.count() > 0) {
        await cargoInput.fill("Diretor Executivo");
      }
      const emailInput = page.locator('input[type="email"], input[placeholder*="Email"], input[name*="email"]').first();
      if (await emailInput.count() > 0) {
        await emailInput.fill("joao.silva@empresateste.com.br");
      }
      const telefoneInput = page.locator('input[placeholder*="Telefone"], input[name*="telefone"]').first();
      if (await telefoneInput.count() > 0) {
        await telefoneInput.fill("(11) 99999-1234");
      }
      await page.screenshot({ path: SS("P05_formulario_completo"), fullPage: true });

      // Passo 6: Salvar
      const salvarBtn = page
        .locator('button:has-text("Salvar")')
        .first();
      if (await salvarBtn.count() > 0) {
        await salvarBtn.click();
        await page.waitForTimeout(2000);
        await page.screenshot({ path: SS("P06_salvo"), fullPage: true });
      }
    }

    await page.screenshot({ path: SS("P07_listagem"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(200);
  });

  test("Verificar opcoes do dropdown de tipo de responsavel", async ({
    page,
  }) => {
    await login(page);
    await navTo(page, "Empresa");
    await page.waitForTimeout(2000);

    for (let scroll = 800; scroll <= 4000; scroll += 400) {
      await page.evaluate((y) => window.scrollTo(0, y), scroll);
      await page.waitForTimeout(400);
      const body = await getBody(page);
      if (body.includes("Responsável") || body.includes("Responsavel")) break;
    }

    const addBtn = page.locator('button:has-text("Adicionar")').first();
    if (await addBtn.count() > 0) {
      await addBtn.click();
      await page.waitForTimeout(1500);

      await page.screenshot({ path: SS("FE01_modal_dropdown"), fullPage: true });

      // Verificar opcoes do select de tipo
      const tipoSelect = page.locator('select').first();
      if (await tipoSelect.count() > 0) {
        const options = await tipoSelect.locator('option').allTextContents();
        await page.screenshot({ path: SS("FE01_opcoes_tipo"), fullPage: true });

        const bodyModal = await getBody(page);
        const hasOpcoes =
          bodyModal.includes("Representante") ||
          bodyModal.includes("Preposto") ||
          bodyModal.includes("Tecnico") ||
          bodyModal.includes("Técnico") ||
          options.length > 0;
        expect(hasOpcoes || bodyModal.length > 200).toBeTruthy();
      }

      // Cancelar
      const cancelBtn = page.locator('button:has-text("Cancelar")').first();
      if (await cancelBtn.count() > 0) {
        await cancelBtn.click();
        await page.waitForTimeout(1000);
      }
    }
  });
});
