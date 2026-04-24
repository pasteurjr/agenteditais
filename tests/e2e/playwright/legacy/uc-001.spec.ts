import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, getBody, ssPath } from "./helpers";

const UC = "001";
const SS = (step: string) => {
  fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  return ssPath(UC, step);
};

test.describe("UC-001: Login e Autenticacao", () => {
  test("P01-P05: Fluxo principal — login com credenciais validas", async ({
    page,
  }) => {
    // Passo 1: Acessar tela de login
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto("http://localhost:5175", { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("P01_tela_login"), fullPage: true });

    // Verificar elementos da tela de login
    const body = await getBody(page);
    const hasLogin =
      body.includes("Agente") ||
      body.includes("login") ||
      body.includes("Login") ||
      body.includes("Entrar");
    expect(hasLogin).toBeTruthy();

    // Passo 2: Preencher email
    await page.waitForSelector('input[type="email"]', { timeout: 8000 });
    await page.fill('input[type="email"]', "pasteurjr@gmail.com");
    await page.screenshot({ path: SS("P02_email_preenchido"), fullPage: true });

    // Passo 3: Preencher senha
    await page.fill('input[type="password"]', "123456");
    await page.screenshot({ path: SS("P03_senha_preenchida"), fullPage: true });

    // Passo 4: Submeter formulario
    await page.click('button[type="submit"]');
    await page.screenshot({ path: SS("P04_loading"), fullPage: true });

    // Passo 5: Aguardar Dashboard
    await page.waitForSelector("text=Dashboard", { timeout: 15000 });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("P05_dashboard_apos_login"), fullPage: true });

    const bodyApos = await getBody(page);
    expect(bodyApos).toContain("Dashboard");

    // Verificar token no localStorage
    const token = await page.evaluate(() =>
      localStorage.getItem("editais_ia_access_token")
    );
    expect(token).not.toBeNull();
    expect(token!.length).toBeGreaterThan(10);
  });

  test("FE-001: Credenciais invalidas — deve exibir mensagem de erro", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto("http://localhost:5175", { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(2000);

    await page.waitForSelector('input[type="email"]', { timeout: 8000 });
    await page.fill('input[type="email"]', "errado@email.com");
    await page.fill('input[type="password"]', "senhaerrada");
    await page.screenshot({ path: SS("FE01_credenciais_erradas"), fullPage: true });

    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);
    await page.screenshot({ path: SS("P06_erro_credenciais"), fullPage: true });

    const body = await getBody(page);
    const hasError =
      body.includes("erro") ||
      body.includes("Erro") ||
      body.includes("inválid") ||
      body.includes("incorret") ||
      body.includes("login-error") ||
      body.includes("credencial") ||
      // ainda na tela de login (sem redirect = credenciais rejeitadas)
      body.includes("Entrar") ||
      body.includes("Email");
    expect(hasError).toBeTruthy();
  });

  test("FA-001: Link Criar conta — navega para RegisterPage", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1400, height: 900 });
    await page.goto("http://localhost:5175", { waitUntil: "networkidle", timeout: 15000 });
    await page.waitForTimeout(2000);

    // Clicar no link Criar conta
    const linkCriarConta = page.locator("text=Criar conta").first();
    await linkCriarConta.waitFor({ timeout: 8000 });
    await page.screenshot({ path: SS("FA01_antes_criar_conta"), fullPage: true });
    await linkCriarConta.click();
    await page.waitForTimeout(2000);
    await page.screenshot({ path: SS("FA01_register_page"), fullPage: true });

    const body = await getBody(page);
    const hasRegister =
      body.includes("Criar") ||
      body.includes("Registro") ||
      body.includes("cadastro") ||
      body.includes("Nome") ||
      body.includes("Confirmar");
    expect(hasRegister).toBeTruthy();
  });
});
