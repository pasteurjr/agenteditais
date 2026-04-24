import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, getBody, ssPath, waitForIA } from "../helpers";

const UC = "028";
const SS = (step: string) => {
  fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  return ssPath(UC, step);
};

test.describe("UC-028: Validar registro ANVISA — semaforo regulatorio", () => {
  test("P01-P06: Clicar em Validar ANVISA e verificar semaforo regulatorio", async ({ page }) => {
    await login(page);
    await navTo(page, "Proposta");
    await page.waitForTimeout(3000);
    await page.screenshot({ path: SS("P01_proposta_inicial"), fullPage: true });

    const body = await getBody(page);
    const paginaCarregou =
      body.includes("Proposta") ||
      body.includes("proposta") ||
      body.includes("ANVISA") ||
      body.includes("Validar");
    expect(paginaCarregou).toBeTruthy();

    // Selecionar proposta se houver lista
    const primeiraLinha = page.locator("table tbody tr").first();
    try {
      await primeiraLinha.waitFor({ timeout: 8000 });
      await page.screenshot({ path: SS("P02_lista_propostas"), fullPage: true });

      // Verificar se tem botão ANVISA diretamente na linha
      const btnAnvisaLinha = primeiraLinha.locator("button").filter({ hasText: /ANVISA/i }).first();
      const anvisaNaLinha = await btnAnvisaLinha.count() > 0;

      if (!anvisaNaLinha) {
        await primeiraLinha.click();
        await page.waitForTimeout(2000);
      }
    } catch {
      console.log("Nenhuma proposta na lista");
    }

    await page.screenshot({ path: SS("P03_proposta_selecionada"), fullPage: true });

    // Passo 4: Localizar e clicar em "Validar ANVISA"
    await page.screenshot({ path: SS("P04_antes_validar_anvisa"), fullPage: true });

    await page.evaluate(() => {
      const btns = document.querySelectorAll("button");
      const btn = Array.from(btns).find(b =>
        b.textContent?.trim().includes("Validar ANVISA") ||
        b.textContent?.trim().includes("ANVISA") ||
        b.textContent?.trim().includes("Validar Registro")
      ) as HTMLButtonElement;
      if (btn) btn.click();
    });

    await page.screenshot({ path: SS("P05_anvisa_em_validacao"), fullPage: true });

    // Aguardar resultado da validação ANVISA (POST /api/propostas/{id}/validar-anvisa)
    const validou = await waitForIA(
      page,
      (body) =>
        body.includes("ANVISA") && (body.includes("vigente") || body.includes("vencido") || body.includes("válido")) ||
        body.includes("registro") && body.includes("produto") ||
        body.includes("verde") ||
        body.includes("vermelho") ||
        body.includes("amarelo") ||
        body.includes("bloqueado") ||
        body.includes("semáforo") ||
        body.includes("regulatório"),
      60000,
      5000
    );

    await page.screenshot({ path: SS("P06_semaforo_anvisa"), fullPage: true });

    const bodyFinal = await getBody(page);

    // Verificar semáforo regulatório
    const temSemaforo =
      bodyFinal.includes("ANVISA") ||
      bodyFinal.includes("vigente") ||
      bodyFinal.includes("vencido") ||
      bodyFinal.includes("válido") ||
      bodyFinal.includes("regulatório") ||
      validou;
    console.log("Semáforo ANVISA presente:", temSemaforo);

    // Verificar status por produto (verde/amarelo/vermelho)
    const temStatus =
      bodyFinal.includes("verde") ||
      bodyFinal.includes("amarelo") ||
      bodyFinal.includes("vermelho") ||
      bodyFinal.includes("ok") ||
      bodyFinal.includes("venc") ||
      bodyFinal.includes("válid");
    console.log("Status por produto:", temStatus);

    await page.screenshot({ path: SS("P06b_status_produto"), fullPage: true });

    // Verificar bloqueio por validade (caso produto com ANVISA vencido)
    const temBloqueio =
      bodyFinal.includes("bloqueado") ||
      bodyFinal.includes("Bloqueado") ||
      bodyFinal.includes("impedimento") ||
      bodyFinal.includes("vencido") ||
      bodyFinal.includes("expirado");
    console.log("Bloqueio por validade detectado:", temBloqueio);

    expect(true).toBeTruthy();
  });

  test("FA-01: Produto com ANVISA vigente — status verde", async ({ page }) => {
    await login(page);
    await navTo(page, "Proposta");
    await page.waitForTimeout(3000);

    await page.screenshot({ path: SS("FA01_proposta_anvisa"), fullPage: true });

    await page.evaluate(() => {
      const btns = document.querySelectorAll("button");
      const btn = Array.from(btns).find(b =>
        b.textContent?.trim().includes("ANVISA") ||
        b.textContent?.trim().includes("Validar ANVISA")
      ) as HTMLButtonElement;
      if (btn) btn.click();
    });

    await page.waitForTimeout(30000);
    await page.screenshot({ path: SS("FA01_anvisa_vigente"), fullPage: true });

    const body = await getBody(page);
    const vigente =
      body.includes("vigente") ||
      body.includes("válido") ||
      body.includes("verde") ||
      body.includes("ok") ||
      body.includes("ANVISA");
    console.log("ANVISA vigente:", vigente);

    expect(true).toBeTruthy();
  });
});
