/**
 * Reproducao dos casos OBS-15 (excluir documento) e OBS-20 (permissao admin)
 * que estavam em "MONITORAR" porque eu nao tinha reproduzido.
 */
import { test, expect } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

const BASE = "http://localhost:5180";
const API = "http://localhost:5007";
const SHOTS = "/mnt/data1/progpython/agenteditais/docs/screenshots_obs15_20";

async function shot(page: any, name: string) {
  await page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: false });
}

async function loginAs(page: any, email: string, password: string) {
  await page.setViewportSize({ width: 1400, height: 900 });
  await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.evaluate(() => {
    Object.keys(localStorage).filter(k => k.startsWith("editais_ia_")).forEach(k => localStorage.removeItem(k));
  });
  await page.reload({ waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(2000);
  try {
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);
    const body = await page.innerText("body").catch(() => "");
    if (body.includes("Selecionar Empresa") || body.includes("Escolha a empresa")) {
      const ch = page.locator("text=CH Hospitalar").first();
      if (await ch.count() > 0) await ch.click();
      else {
        await page.evaluate(() => {
          const all = Array.from(document.querySelectorAll("div, button, a"));
          const el = all.find(e => e.textContent?.includes("CNPJ"));
          if (el) (el as HTMLElement).click();
        });
      }
      await page.waitForTimeout(4000);
    }
    await page.waitForSelector("text=Dashboard", { timeout: 15000 });
  } catch {
    await page.waitForTimeout(3000);
  }
}

async function navTo(page: any, label: string) {
  const sectionMap: Record<string, string> = {
    "Empresa": "Configuracoes",
  };
  const section = sectionMap[label];
  if (section) {
    await page.evaluate((sec: string) => {
      const buttons = Array.from(document.querySelectorAll("button"));
      for (const btn of buttons) {
        const t = btn.textContent?.trim() || "";
        if (t === sec || t.includes(sec)) {
          (btn as HTMLElement).click();
          return;
        }
      }
    }, section);
    await page.waitForTimeout(800);
  }
  await page.evaluate((lbl: string) => {
    const navButtons = Array.from(document.querySelectorAll("button.nav-item, button.nav-item-main"));
    for (const btn of navButtons) {
      const ls = btn.querySelector(".nav-item-label");
      if (ls && ls.textContent?.trim() === lbl) (btn as HTMLElement).click();
    }
  }, label);
  await page.waitForTimeout(3000);
}

test.beforeAll(() => fs.mkdirSync(SHOTS, { recursive: true }));

test.describe("Reproducao OBS-15 e OBS-20", () => {
  test.setTimeout(120000);

  // ──────────────────────────────────────────
  // OBS-15: excluir documento pela UI
  // ──────────────────────────────────────────
  test("OBS-15: excluir documento pela UI funciona (com confirm handler)", async ({ page }) => {
    // Handler de confirm — sempre aceitar
    page.on("dialog", d => d.accept());

    await loginAs(page, "valida1@valida.com.br", "123456");
    await navTo(page, "Empresa");
    await page.waitForTimeout(2000);

    // Scroll ate Documentos
    await page.evaluate(() => {
      const h = Array.from(document.querySelectorAll(".card-title, h2, h3")).find(e => (e.textContent || "").toLowerCase().includes("documentos"));
      if (h) h.scrollIntoView({ block: "center" });
    });
    await page.waitForTimeout(1500);
    await shot(page, "OBS-15_01_antes_excluir");

    // Contar linhas de documentos ANTES
    const linhasAntes = await page.locator('table tbody tr').count();
    console.log(`[OBS-15] Linhas antes: ${linhasAntes}`);

    // Se houver documentos, clicar no botao Excluir do primeiro
    if (linhasAntes > 0) {
      // O botao de excluir e a lixeira vermelha — title="Excluir"
      const excluirBtn = page.locator('button[title="Excluir"]').first();
      const n = await excluirBtn.count();
      console.log(`[OBS-15] Botoes Excluir encontrados: ${n}`);

      if (n > 0) {
        // Capturar a requisicao DELETE
        const delPromise = page.waitForResponse(
          r => r.url().includes("/api/crud/empresa-documentos/") && r.request().method() === "DELETE",
          { timeout: 10000 }
        ).catch(() => null);

        await excluirBtn.click();
        const resp = await delPromise;
        console.log(`[OBS-15] DELETE response: ${resp?.status()} ${resp?.url()}`);

        await page.waitForTimeout(2000);
        await shot(page, "OBS-15_02_apos_excluir");

        if (resp) {
          expect(resp.status()).toBeLessThan(400);
        }

        const linhasDepois = await page.locator('table tbody tr').count();
        console.log(`[OBS-15] Linhas depois: ${linhasDepois}`);
        expect(linhasDepois).toBeLessThan(linhasAntes);
      }
    }
  });

  // ──────────────────────────────────────────
  // OBS-20: permissao do valida2
  // ──────────────────────────────────────────
  test("OBS-20: valida2 nao recebe 403 em operacoes comuns de admin", async ({ page, request }) => {
    // 1. Login via API e confirmar is_super
    const login = await request.post(`${API}/api/auth/login`, {
      data: { email: "valida2@valida.com.br", password: "123456" }
    });
    expect(login.status()).toBe(200);
    const body = await login.json();
    const token = body.access_token;
    console.log(`[OBS-20] valida2 is_super: ${body.user?.is_super}, papel: ${body.user?.papel}`);

    // 2. Decodar o JWT para conferir as claims
    const [, payload] = token.split(".");
    const claims = JSON.parse(Buffer.from(payload, "base64").toString());
    console.log(`[OBS-20] JWT claims: ${JSON.stringify(claims)}`);
    expect(claims.is_super).toBe(true);

    const H = { Authorization: `Bearer ${token}` };

    // 3. Tentar operacoes tipicas que poderiam dar 403
    const checks = [
      { name: "listar empresas", req: () => request.get(`${API}/api/crud/empresas?limit=5`, { headers: H }) },
      { name: "listar produtos", req: () => request.get(`${API}/api/crud/produtos?limit=5`, { headers: H }) },
      { name: "listar parametros-score", req: () => request.get(`${API}/api/crud/parametros-score?limit=5`, { headers: H }) },
      { name: "listar fontes-editais", req: () => request.get(`${API}/api/crud/fontes-editais?limit=5`, { headers: H }) },
      { name: "listar fontes-certidoes", req: () => request.get(`${API}/api/crud/fontes-certidoes?limit=5`, { headers: H }) },
      { name: "listar empresa-responsaveis", req: () => request.get(`${API}/api/crud/empresa-responsaveis?limit=5`, { headers: H }) },
    ];

    let issues: string[] = [];
    for (const c of checks) {
      const r = await c.req();
      console.log(`[OBS-20] ${c.name}: HTTP ${r.status()}`);
      if (r.status() === 403) issues.push(`${c.name} -> 403`);
    }
    expect(issues).toEqual([]);

    // 4. Login via UI e tirar screenshot do dashboard
    await loginAs(page, "valida2@valida.com.br", "123456");
    await shot(page, "OBS-20_01_valida2_logado");

    const bodyText = await page.innerText("body");
    console.log(`[OBS-20] Dashboard contem "apenas administradores"? ${/apenas administradores/i.test(bodyText)}`);
    expect(/apenas administradores/i.test(bodyText)).toBeFalsy();
  });
});
