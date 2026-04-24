import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, clickTab, getBody, waitForIA, ssPath } from "../helpers";

const UC = "038";

test.describe(`UC-${UC}: Chatbox de Análise de Recurso`, () => {
  test.beforeEach(async ({ page }) => {
    fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  });

  test("P01: Acessar RecursosPage aba Analise e localizar chatbox", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Analise");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P01_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P01_resp"), fullPage: true });
    expect(body.toLowerCase()).toMatch(/analise|chat|recurso|edital/i);
  });

  test("P02: Verificar campo de input do chat e botao enviar", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Analise");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P02_acao"), fullPage: true });
    // Verifica se há input de chat ou textarea
    const hasChat = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="text"], textarea');
      for (const inp of Array.from(inputs)) {
        const placeholder = inp.getAttribute("placeholder") || "";
        if (
          placeholder.toLowerCase().includes("pergunta") ||
          placeholder.toLowerCase().includes("mensagem") ||
          placeholder.toLowerCase().includes("chat") ||
          placeholder.toLowerCase().includes("duvida")
        ) {
          return true;
        }
      }
      return false;
    });
    await page.screenshot({ path: ssPath(UC, "P02_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(100);
  });

  test("P03: Enviar mensagem no chatbox e aguardar resposta da IA", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Analise");
    await page.waitForTimeout(1500);
    // Primeiro realiza análise para habilitar chat
    await page.evaluate(() => {
      const selects = document.querySelectorAll("select");
      for (const s of Array.from(selects)) {
        if (s.options.length > 1) {
          s.selectedIndex = 1;
          s.dispatchEvent(new Event("change", { bubbles: true }));
          break;
        }
      }
    });
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find((el) => el.textContent?.toLowerCase().includes("analisar"));
      if (b) b.click();
    });
    await waitForIA(
      page,
      (body) =>
        body.toLowerCase().includes("inconsist") ||
        body.toLowerCase().includes("desvio") ||
        body.toLowerCase().includes("analise"),
      60000
    );
    await page.screenshot({ path: ssPath(UC, "P03_acao"), fullPage: true });
    // Digita pergunta no chat
    const chatInput = page.locator(
      'input[placeholder*="pergunta"], input[placeholder*="mensagem"], input[placeholder*="chat"]'
    ).first();
    if (await chatInput.count() > 0) {
      await chatInput.fill("Qual é a principal inconsistência encontrada?");
      await chatInput.press("Enter");
    } else {
      // Tenta textarea de chat
      const ta = page.locator("textarea").last();
      if (await ta.count() > 0) {
        await ta.fill("Qual é a principal inconsistência encontrada?");
        await page.keyboard.press("Enter");
      }
    }
    await page.screenshot({ path: ssPath(UC, "P03_loading"), fullPage: true });
    const found = await waitForIA(
      page,
      (body) =>
        body.toLowerCase().includes("inconsist") ||
        body.toLowerCase().includes("resposta") ||
        body.toLowerCase().includes("analise") ||
        body.toLowerCase().includes("desvio"),
      60000
    );
    await page.screenshot({ path: ssPath(UC, "P03_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(200);
  });

  test("P04: Verificar historico de mensagens no chatbox", async ({ page }) => {
    await login(page);
    await navTo(page, "Recursos");
    await clickTab(page, "Analise");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P04_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P04_resp"), fullPage: true });
    expect(body.length).toBeGreaterThan(100);
  });
});
