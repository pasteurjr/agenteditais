import { Page } from "@playwright/test";

export const BASE = "http://localhost:5179";

// ID fixo da empresa CH Hospitalar no banco de dados
const CH_HOSPITALAR_ID = "7dbdc60a-b806-4614-a024-a1d4841dc8c9";

export async function login(page: Page, _empresaNome?: string) {
  await page.setViewportSize({ width: 1400, height: 900 });
  // Limpar localStorage para forçar novo login
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.evaluate(() => {
    Object.keys(localStorage).filter(k => k.startsWith("editais_ia_")).forEach(k => localStorage.removeItem(k));
  });
  await page.reload({ waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(2000);
  try {
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    await page.fill('input[type="email"]', "valida1@valida.com.br");
    await page.fill('input[type="password"]', "123456");
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // Verificar se apareceu tela de seleção de empresa
    const h1Text = await page.locator('h1').innerText().catch(() => "");
    const isEmpresaSelection = h1Text.includes("Selecionar Empresa") || h1Text.includes("Selecione");

    if (isEmpresaSelection) {
      // Clicar no botão da empresa CH Hospitalar usando o ID no data attribute ou texto parcial
      const chBtn = page.locator('button:has-text("CH Hospitalar")').first();
      if (await chBtn.count() > 0) {
        await chBtn.click();
        await page.waitForTimeout(3000);
      } else {
        // Usar API diretamente via fetch no contexto da página
        await page.evaluate(async (empresaId: string) => {
          const token = localStorage.getItem("editais_ia_access_token");
          if (!token) return;
          const res = await fetch('/api/auth/switch-empresa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ empresa_id: empresaId }),
          });
          if (res.ok) {
            const data = await res.json();
            localStorage.setItem("editais_ia_access_token", data.access_token);
            localStorage.setItem("editais_ia_empresa", JSON.stringify(data.empresa));
            if (data.papel) localStorage.setItem("editais_ia_papel", data.papel);
          }
        }, CH_HOSPITALAR_ID);
        await page.reload({ waitUntil: "domcontentloaded", timeout: 30000 });
        await page.waitForTimeout(2000);
      }
    } else {
      // Empresa já selecionada automaticamente — verificar se é a correta
      // Se não for CH Hospitalar, fazer switch via evaluate
      const currentCnpj = await page.locator('body').innerText().catch(() => "");
      if (!currentCnpj.includes("43.712.232") && !currentCnpj.includes("CH Hospitalar")) {
        await page.evaluate(async (empresaId: string) => {
          const token = localStorage.getItem("editais_ia_access_token");
          if (!token) return;
          const res = await fetch('/api/auth/switch-empresa', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ empresa_id: empresaId }),
          });
          if (res.ok) {
            const data = await res.json();
            localStorage.setItem("editais_ia_access_token", data.access_token);
            localStorage.setItem("editais_ia_empresa", JSON.stringify(data.empresa));
            if (data.papel) localStorage.setItem("editais_ia_papel", data.papel);
          }
        }, CH_HOSPITALAR_ID);
        await page.reload({ waitUntil: "domcontentloaded", timeout: 30000 });
        await page.waitForTimeout(2000);
      }
    }

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

/**
 * Garante que a tela tem dados reais antes do screenshot de resposta.
 * Uso: await assertDataVisible(page, { anyText: ['EMPH-', 'R$'], minCount: 2 })
 * Ou: await assertDataVisible(page, { selector: 'table tbody tr', minCount: 3 })
 * Falha o teste se não encontrar — preserva princípio "nunca screenshot de tela vazia".
 */
export async function assertDataVisible(
  page: Page,
  opts: { selector?: string; anyText?: string[]; minCount?: number; timeout?: number }
) {
  const timeout = opts.timeout ?? 15000;
  const minCount = opts.minCount ?? 1;

  if (opts.selector) {
    try {
      await page.waitForSelector(opts.selector, { timeout });
    } catch {
      throw new Error(`assertDataVisible: selector '${opts.selector}' não encontrado em ${timeout}ms`);
    }
    const count = await page.locator(opts.selector).count();
    if (count < minCount) {
      throw new Error(`assertDataVisible: esperava >=${minCount} de '${opts.selector}', achou ${count} — tela vazia`);
    }
    return;
  }

  if (opts.anyText && opts.anyText.length > 0) {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      const body = (await page.innerText("body").catch(() => "")) || "";
      const found = opts.anyText.filter(t => body.includes(t)).length;
      if (found >= minCount) return;
      await page.waitForTimeout(500);
    }
    const body = (await page.innerText("body").catch(() => "")) || "";
    const found = opts.anyText.filter(t => body.includes(t));
    throw new Error(`assertDataVisible: esperava >=${minCount} de [${opts.anyText.join(", ")}], achou ${found.length} [${found.join(", ")}] — tela vazia`);
  }

  throw new Error("assertDataVisible: precisa de 'selector' ou 'anyText'");
}

/**
 * Seleciona primeiro contrato da tabela de contratos (ProducaoPage).
 * Clica no botão "Selecionar" da primeira linha disponível.
 */
export async function selectFirstContrato(page: Page, preferNumero?: string) {
  // Aguarda a tabela de contratos renderizar
  await page.waitForTimeout(2000);
  const clicked = await page.evaluate((prefer: string | undefined) => {
    // Estratégia 1: achar linha que contém prefer e clicar no Selecionar dela
    if (prefer) {
      const rows = Array.from(document.querySelectorAll("tr"));
      for (const row of rows) {
        if ((row.textContent || "").includes(prefer)) {
          const btn = row.querySelector("button");
          if (btn && (btn.textContent || "").toLowerCase().includes("selecionar")) {
            (btn as HTMLElement).click();
            return "prefer";
          }
        }
      }
    }
    // Estratégia 2: primeiro botão Selecionar da página
    const buttons = Array.from(document.querySelectorAll("button"));
    const btn = buttons.find(b => (b.textContent || "").trim().toLowerCase() === "selecionar");
    if (btn) {
      (btn as HTMLElement).click();
      return "first";
    }
    return "";
  }, preferNumero);
  await page.waitForTimeout(2500);
  return clicked;
}
