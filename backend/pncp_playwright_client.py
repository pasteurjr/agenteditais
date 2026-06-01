"""
Cliente PNCP via Playwright real (bypassa F5 Bot Defense).

Mantém um Chromium headless em pool com 1 página warm-up em /app/editais
para que cookies/JS-challenge fiquem resolvidos. Faz fetch() de dentro do
browser para que TLS fingerprint + cookies BMAK sejam os de um Chrome real.

Uso:
    from pncp_playwright_client import pncp_search
    data = pncp_search(q="monitor", tipos_documento="edital", tam_pagina=50, pagina=1)
    # data == {'items': [...], 'total': N}
"""
import os
import json
import threading
import time
from typing import Dict, Any, Optional

_DISPLAY = os.environ.get("PNCP_PW_DISPLAY", ":99")
_HEADLESS = os.environ.get("PNCP_PW_HEADLESS", "1") == "1"
_UA = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
       "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36")
_WARMUP_URL = "https://pncp.gov.br/app/editais?q=&pagina=1"
_LOCK = threading.Lock()
_STATE: Dict[str, Any] = {"playwright": None, "browser": None, "ctx": None, "page": None, "warm_at": 0}
_WARM_TTL = 25 * 60  # 25 min — renova antes do cookie F5 expirar


def _ensure_warm():
    """Cria/renova browser+contexto+página e visita pncp/app pra resolver F5 challenge."""
    from playwright.sync_api import sync_playwright
    now = time.time()
    if _STATE["page"] and (now - _STATE["warm_at"]) < _WARM_TTL:
        return
    # tear down
    try:
        if _STATE["browser"]:
            _STATE["browser"].close()
    except Exception:
        pass
    try:
        if _STATE["playwright"]:
            _STATE["playwright"].stop()
    except Exception:
        pass
    os.environ.setdefault("DISPLAY", _DISPLAY)
    pw = sync_playwright().start()
    b = pw.chromium.launch(
        headless=_HEADLESS,
        args=["--no-sandbox", "--disable-dev-shm-usage", "--disable-blink-features=AutomationControlled"],
    )
    ctx = b.new_context(user_agent=_UA, locale="pt-BR")
    page = ctx.new_page()
    page.goto(_WARMUP_URL, wait_until="networkidle", timeout=45000)
    page.wait_for_timeout(2000)  # F5 challenge JS settle
    _STATE.update({"playwright": pw, "browser": b, "ctx": ctx, "page": page, "warm_at": now})


def _fetch_via_browser(path_with_query: str, retries: int = 2) -> Dict[str, Any]:
    """Executa fetch() dentro do browser real; retorna dict JSON."""
    js = """
    async (url) => {
        const r = await fetch(url, {headers: {'Accept': 'application/json'}});
        const text = await r.text();
        return {status: r.status, body: text};
    }
    """
    last_err = None
    for attempt in range(retries + 1):
        try:
            with _LOCK:
                _ensure_warm()
                page = _STATE["page"]
                result = page.evaluate(js, path_with_query)
            if result["status"] != 200:
                raise RuntimeError(f"PNCP HTTP {result['status']}: {result['body'][:200]}")
            return json.loads(result["body"])
        except Exception as e:
            last_err = e
            # invalida warmup pra tentar de novo do zero
            _STATE["warm_at"] = 0
            if attempt < retries:
                time.sleep(1.5)
                continue
            raise
    raise last_err  # unreachable


def pncp_search(q: str, tipos_documento: str = "edital", tam_pagina: int = 50,
                pagina: int = 1, ordenacao: str = "-data") -> Dict[str, Any]:
    """
    Busca textual no PNCP via endpoint interno /api/search/.
    Retorna {items: [...], total: N}.
    """
    from urllib.parse import urlencode
    qs = urlencode({
        "q": q,
        "tipos_documento": tipos_documento,
        "tam_pagina": tam_pagina,
        "pagina": pagina,
        "ordenacao": ordenacao,
    })
    return _fetch_via_browser(f"/api/search/?{qs}")


def pncp_get(path: str) -> Dict[str, Any]:
    """Chamada genérica a outro endpoint do PNCP (ex: /api/consulta/v1/...)."""
    return _fetch_via_browser(path)


def shutdown():
    """Encerra browser (chamar no shutdown da app)."""
    with _LOCK:
        try:
            if _STATE["browser"]:
                _STATE["browser"].close()
        except Exception:
            pass
        try:
            if _STATE["playwright"]:
                _STATE["playwright"].stop()
        except Exception:
            pass
        _STATE.update({"playwright": None, "browser": None, "ctx": None, "page": None, "warm_at": 0})


if __name__ == "__main__":
    # smoke test
    import sys
    termo = sys.argv[1] if len(sys.argv) > 1 else "monitor"
    print(f">>> buscando '{termo}'...")
    t0 = time.time()
    data = pncp_search(termo, tam_pagina=5, pagina=1)
    dt = time.time() - t0
    print(f"   total={data.get('total')} items={len(data.get('items', []))}  ({dt:.1f}s)")
    for it in (data.get("items") or [])[:3]:
        print(f"   - {it.get('title','')[:80]}")
        print(f"     orgao={it.get('orgao_nome','')[:60]}  uf={it.get('uf','')}")
    shutdown()
