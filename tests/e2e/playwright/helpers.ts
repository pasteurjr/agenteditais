import { Page } from "@playwright/test";

export const BASE = "http://localhost:5175";

export async function login(page: Page) {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto(BASE, { waitUntil: "networkidle", timeout: 15000 });
  await page.waitForTimeout(2000);
  try {
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    await page.fill('input[type="email"]', "pasteurjr@gmail.com");
    await page.fill('input[type="password"]', "123456");
    await page.click('button[type="submit"]');
    await page.waitForSelector("text=Dashboard", { timeout: 15000 });
    await page.waitForTimeout(2000);
  } catch {
    await page.waitForTimeout(3000);
  }
}

// Mapa de labels amigáveis para labels reais do sidebar (sem acento)
const PAGE_LABELS: Record<string, string> = {
  "Empresa": "Empresa",
  "Portfolio": "Portfolio",
  "Parametrizacoes": "Parametrizacoes",
  "Parametrizações": "Parametrizacoes",
  "Captacao": "Captacao",
  "Captação": "Captacao",
  "Validacao": "Validacao",
  "Validação": "Validacao",
  "Impugnacao": "Impugnacao",
  "Impugnação": "Impugnacao",
  "Precificacao": "Precificacao",
  "Precificação": "Precificacao",
  "Proposta": "Proposta",
  "Submissao": "Submissao",
  "Submissão": "Submissao",
  "Lances": "Disputa Lances",
  "Recursos": "Recursos",
  "Followup": "Followup",
  "Follow-up": "Followup",
  "CRM": "CRM",
  "Execucao": "Execucao Contrato",
  "Execução": "Execucao Contrato",
  "Execucao Contrato": "Execucao Contrato",
  "Producao": "Execucao Contrato",
  "Atas": "Atas de Pregao",
  "Atas de Pregao": "Atas de Pregao",
  "Dashboard": "Dashboard",
};

// Mapa de qual seção do sidebar cada página pertence (usar label real do botão de seção)
const PAGE_SECTION: Record<string, string> = {
  "Empresa": "Configuracoes",
  "Portfolio": "Configuracoes",
  "Parametrizacoes": "Configuracoes",
  "Dashboard": "Fluxo Comercial",
  "Captacao": "Fluxo Comercial",
  "Validacao": "Fluxo Comercial",
  "Impugnacao": "Fluxo Comercial",
  "Precificacao": "Fluxo Comercial",
  "Proposta": "Fluxo Comercial",
  "Submissao": "Fluxo Comercial",
  "Disputa Lances": "Fluxo Comercial",
  "Recursos": "Fluxo Comercial",
  "Followup": "Fluxo Comercial",
  "CRM": "Fluxo Comercial",
  "Execucao Contrato": "Fluxo Comercial",
  "Atas de Pregao": "Fluxo Comercial",
};

export async function navTo(page: Page, label: string) {
  const realLabel = PAGE_LABELS[label] || label;
  const section = PAGE_SECTION[realLabel];

  // Expandir seção antes de clicar (se necessário)
  if (section) {
    await page.evaluate((sec: string) => {
      // Busca botão de seção que contém o texto (ex: "Fluxo Comercial", "Configuracoes")
      const buttons = Array.from(document.querySelectorAll("button"));
      for (const btn of buttons) {
        const text = btn.textContent?.trim() || "";
        if (text === sec || text.includes(sec)) {
          // Só clicar se a seção estiver fechada (sem itens nav visíveis abaixo)
          const nextSibling = btn.nextElementSibling;
          if (!nextSibling || !nextSibling.querySelector("button.nav-item")) {
            (btn as HTMLElement).click();
          }
          return;
        }
      }
    }, section);
    await page.waitForTimeout(800);
  }

  await page.evaluate((lbl: string) => {
    // Estratégia 1: botão nav-item com span.nav-item-label exato
    const navButtons = Array.from(document.querySelectorAll("button.nav-item, button.nav-item-main"));
    for (const btn of navButtons) {
      const labelSpan = btn.querySelector(".nav-item-label");
      if (labelSpan && labelSpan.textContent?.trim() === lbl) {
        (btn as HTMLElement).click();
        return;
      }
    }
    // Estratégia 2: qualquer botão cujo label span contém o texto
    for (const btn of navButtons) {
      const labelSpan = btn.querySelector(".nav-item-label");
      if (labelSpan && labelSpan.textContent?.trim().includes(lbl)) {
        (btn as HTMLElement).click();
        return;
      }
    }
    // Estratégia 3: fallback — qualquer span exato
    const el = Array.from(document.querySelectorAll("span")).find(
      (e) => e.textContent?.trim() === lbl
    ) as HTMLElement | undefined;
    if (el) el.click();
  }, realLabel);
  await page.waitForTimeout(3000);
}

export async function expandSection(page: Page, section: string) {
  await page.evaluate((sec: string) => {
    const el = Array.from(document.querySelectorAll("span")).find(
      (e) => e.textContent?.trim() === sec
    ) as HTMLElement;
    if (el) el.click();
  }, section);
  await page.waitForTimeout(500);
}

export async function clickTab(page: Page, texto: string) {
  await page.evaluate((txt: string) => {
    const selectors = [".tab-panel-tab", ".tab-panel button", '[class*="tab"]'];
    for (const sel of selectors) {
      const tabs = document.querySelectorAll(sel);
      const tab = Array.from(tabs).find((t) =>
        t.textContent?.trim().includes(txt)
      ) as HTMLElement;
      if (tab) {
        tab.click();
        return;
      }
    }
  }, texto);
  await page.waitForTimeout(2000);
}

export async function getBody(page: Page): Promise<string> {
  return (await page.innerText("body").catch(() => "")) || "";
}

export async function waitForIA(
  page: Page,
  checkFn: (body: string) => boolean,
  maxWaitMs = 120000,
  intervalMs = 5000
): Promise<boolean> {
  const iterations = Math.ceil(maxWaitMs / intervalMs);
  for (let i = 0; i < iterations; i++) {
    await page.waitForTimeout(intervalMs);
    const body = await getBody(page);
    if (checkFn(body)) return true;
  }
  return false;
}

export function ssPath(ucCode: string, step: string): string {
  return `runtime/screenshots/UC-${ucCode}/${step}.png`;
}
