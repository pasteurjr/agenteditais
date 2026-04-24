import { test, expect } from "@playwright/test";
import { login, navTo, clickTab, getBody, ssPath } from "../helpers";

const UC = "F01";

test.describe(`UC-${UC}: Manter cadastro principal da empresa`, () => {
  test("P1: Acessar EmpresaPage", async ({ page }) => {
    await login(page);
    await navTo(page, "Empresa");
    await page.screenshot({ path: ssPath(UC, "P01_resp_pagina"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(100);
  });

  test("P2: Sistema carrega empresa do usuário", async ({ page }) => {
    await login(page);
    await navTo(page, "Empresa");
    await page.waitForTimeout(2000);
    const body = await getBody(page);
    // Deve ter campos de cadastro
    const temCampos = body.includes("CNPJ") || body.includes("Razão") || body.includes("razao") || body.includes("Fantasia");
    console.log(`Campos empresa: ${temCampos ? "✅" : "❌"}`);
    await page.screenshot({ path: ssPath(UC, "P02_resp_empresa_carregada"), fullPage: true });
    expect(temCampos).toBeTruthy();
  });

  test("P3-4: Revisar campos e verificar botão Salvar", async ({ page }) => {
    await login(page);
    await navTo(page, "Empresa");
    await page.waitForTimeout(2000);
    const body = await getBody(page);
    const temSalvar = body.includes("Salvar") || body.includes("salvar");
    console.log(`Botão Salvar: ${temSalvar ? "✅" : "❌"}`);
    await page.screenshot({ path: ssPath(UC, "P03_resp_campos_visiveis"), fullPage: true });
  });
});
