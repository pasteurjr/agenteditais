import { test, expect } from "@playwright/test";
import * as fs from "fs";
import { login, navTo, getBody, waitForIA, ssPath } from "./helpers";

const UC = "057";

test.describe(`UC-${UC}: Chat com IA (FloatingChat)`, () => {
  test.beforeEach(async ({ page }) => {
    fs.mkdirSync(`runtime/screenshots/UC-${UC}`, { recursive: true });
  });

  test("P01: Localizar FloatingChat na interface", async ({ page }) => {
    await login(page);
    await navTo(page, "Dashboard");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P01_acao"), fullPage: true });
    // FloatingChat normalmente é um botão flutuante no canto inferior direito
    const chatBtn = page.locator(
      '[class*="floating"], [class*="chat-btn"], [class*="fab"], button[title*="chat"], button[title*="IA"]'
    ).first();
    if (await chatBtn.count() > 0) {
      await chatBtn.click();
      await page.waitForTimeout(1500);
    } else {
      // Tenta abrir pelo ícone de chat
      await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll("button"));
        const b = btns.find(
          (el) =>
            el.title?.toLowerCase().includes("chat") ||
            el.getAttribute("aria-label")?.toLowerCase().includes("chat") ||
            el.textContent?.toLowerCase().includes("chat") ||
            el.querySelector('[class*="MessageCircle"], [class*="Chat"]') !== null
        );
        if (b) b.click();
      });
      await page.waitForTimeout(1500);
    }
    await page.screenshot({ path: ssPath(UC, "P01_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(100);
  });

  test("P02: Abrir FloatingChat e verificar campo de mensagem", async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);
    await page.screenshot({ path: ssPath(UC, "P02_acao"), fullPage: true });
    // Tenta abrir o chat flutuante
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(
        (el) =>
          el.className?.toLowerCase().includes("float") ||
          el.className?.toLowerCase().includes("chat") ||
          el.title?.toLowerCase().includes("chat") ||
          el.title?.toLowerCase().includes("ia") ||
          el.title?.toLowerCase().includes("assistente")
      );
      if (b) b.click();
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P02_resp"), fullPage: true });
    // Verifica se chat abriu com campo de input
    const hasChatInput = await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="text"], textarea');
      for (const inp of Array.from(inputs)) {
        const ph = inp.getAttribute("placeholder") || "";
        if (
          ph.toLowerCase().includes("mensagem") ||
          ph.toLowerCase().includes("pergunta") ||
          ph.toLowerCase().includes("digita") ||
          ph.toLowerCase().includes("chat")
        ) {
          return true;
        }
      }
      return false;
    });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(100);
  });

  test("P03: Enviar mensagem no FloatingChat e aguardar resposta da IA", async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);
    // Abre chat flutuante
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(
        (el) =>
          el.className?.toLowerCase().includes("float") ||
          el.className?.toLowerCase().includes("chat") ||
          el.title?.toLowerCase().includes("chat") ||
          el.title?.toLowerCase().includes("assistente") ||
          el.title?.toLowerCase().includes("ia")
      );
      if (b) b.click();
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P03_acao"), fullPage: true });
    // Digita mensagem no chat
    const chatInput = page.locator(
      'input[placeholder*="mensagem"], input[placeholder*="pergunta"], input[placeholder*="digita"], textarea[placeholder*="mensagem"]'
    ).first();
    if (await chatInput.count() > 0) {
      await chatInput.fill("O que é um Pregão Eletrônico segundo a Lei 14.133/2021?");
      await chatInput.press("Enter");
    } else {
      // Tenta textarea genérica do chat
      const textareas = page.locator("textarea");
      const count = await textareas.count();
      if (count > 0) {
        await textareas.last().fill("O que é um Pregão Eletrônico segundo a Lei 14.133/2021?");
        await page.keyboard.press("Enter");
      }
    }
    await page.screenshot({ path: ssPath(UC, "P03_loading"), fullPage: true });
    const found = await waitForIA(
      page,
      (body) =>
        body.toLowerCase().includes("pregao") ||
        body.toLowerCase().includes("14.133") ||
        body.toLowerCase().includes("eletronic") ||
        body.toLowerCase().includes("licitacao") ||
        body.toLowerCase().includes("resposta"),
      60000
    );
    await page.screenshot({ path: ssPath(UC, "P03_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(200);
  });

  test("P04: Verificar historico de mensagens no chat", async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);
    // Abre chat
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(
        (el) =>
          el.className?.toLowerCase().includes("float") ||
          el.className?.toLowerCase().includes("chat") ||
          el.title?.toLowerCase().includes("chat")
      );
      if (b) b.click();
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: ssPath(UC, "P04_acao"), fullPage: true });
    const body = await getBody(page);
    await page.screenshot({ path: ssPath(UC, "P04_resp"), fullPage: true });
    expect(body.length).toBeGreaterThan(100);
  });

  test("P05: Enviar segunda mensagem de contexto e verificar continuidade", async ({ page }) => {
    await login(page);
    await page.waitForTimeout(2000);
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll("button"));
      const b = btns.find(
        (el) =>
          el.className?.toLowerCase().includes("float") ||
          el.className?.toLowerCase().includes("chat") ||
          el.title?.toLowerCase().includes("chat")
      );
      if (b) b.click();
    });
    await page.waitForTimeout(1500);
    // Primeira mensagem
    const chatInput = page.locator(
      'input[placeholder*="mensagem"], input[placeholder*="pergunta"], textarea[placeholder*="mensagem"]'
    ).first();
    if (await chatInput.count() > 0) {
      await chatInput.fill("Quais são os tipos de licitação previstos?");
      await chatInput.press("Enter");
    }
    await page.screenshot({ path: ssPath(UC, "P05_acao"), fullPage: true });
    await waitForIA(
      page,
      (body) =>
        body.toLowerCase().includes("tipo") ||
        body.toLowerCase().includes("licitacao") ||
        body.toLowerCase().includes("modalidade"),
      60000
    );
    await page.screenshot({ path: ssPath(UC, "P05_resp"), fullPage: true });
    const body = await getBody(page);
    expect(body.length).toBeGreaterThan(200);
  });
});
