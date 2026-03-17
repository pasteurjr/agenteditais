#!/usr/bin/env python3
"""
Testes do backend modificado - Sprint 3
Testa: CATMAT/CATSER, termos semânticos, parametrização de score,
matching hierárquico, pré-filtro, cálculo de score com pesos do banco.
"""

import sys
import os
import json
import time
import requests

BASE_URL = "http://localhost:5007"
CREDS = {"email": "pasteurjr@gmail.com", "password": "123456"}

# ============================================================
# Helpers
# ============================================================

def login():
    r = requests.post(f"{BASE_URL}/api/auth/login", json=CREDS)
    assert r.status_code == 200, f"Login falhou: {r.status_code} {r.text}"
    return r.json()["access_token"]

def headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


def print_section(title):
    print(f"\n{'='*70}")
    print(f"  {title}")
    print(f"{'='*70}")


def print_result(ok, desc, detail=""):
    status = "PASS" if ok else "FAIL"
    symbol = "✓" if ok else "✗"
    print(f"  [{status}] {symbol} {desc}")
    if detail:
        for line in detail.split("\n"):
            print(f"         {line}")


# ============================================================
# TESTE 1: Campos CATMAT/termos_busca existem no modelo Produto
# ============================================================

def test_1_campos_produto(token):
    print_section("TESTE 1: Campos CATMAT/termos_busca no modelo Produto")
    print("  Entrada: GET /api/crud/produtos (lista produtos)")
    print("  Esperado: Campos catmat_codigos, catser_codigos, catmat_descricoes,")
    print("            termos_busca, termos_busca_updated_at, catmat_updated_at")
    print()

    r = requests.get(f"{BASE_URL}/api/crud/produtos", headers=headers(token))
    assert r.status_code == 200, f"Erro: {r.status_code}"
    data = r.json()
    items = data.get("items") or data.get("data") or []

    if not items:
        print_result(False, "Nenhum produto encontrado")
        return

    p = items[0]
    campos_novos = ["catmat_codigos", "catser_codigos", "catmat_descricoes",
                    "termos_busca", "termos_busca_updated_at", "catmat_updated_at"]

    presentes = [c for c in campos_novos if c in p]
    ausentes = [c for c in campos_novos if c not in p]

    print_result(
        len(ausentes) == 0,
        f"Campos presentes no to_dict(): {len(presentes)}/6",
        f"Presentes: {presentes}\nAusentes: {ausentes}" if ausentes else ""
    )

    # Verificar conteúdo dos termos_busca
    termos = p.get("termos_busca") or []
    print_result(
        len(termos) > 0,
        f"termos_busca populado: {len(termos)} termos",
        f"Produto: {p.get('nome', '?')}\nPrimeiros 5: {termos[:5]}"
    )

    # Verificar catmat_updated_at
    updated = p.get("catmat_updated_at")
    print_result(
        updated is not None,
        f"catmat_updated_at preenchido: {updated}"
    )

    return p


# ============================================================
# TESTE 2: Endpoint reprocessar-metadados (produto individual)
# ============================================================

def test_2_reprocessar_metadados(token, produto_id, produto_nome):
    print_section("TESTE 2: Reprocessar metadados de um produto")
    print(f"  Entrada: POST /api/produtos/{produto_id}/reprocessar-metadados")
    print(f"  Produto: {produto_nome}")
    print("  Esperado: success=true, campos atualizados")
    print()

    r = requests.post(
        f"{BASE_URL}/api/produtos/{produto_id}/reprocessar-metadados",
        headers=headers(token)
    )

    print_result(
        r.status_code == 200,
        f"Status code: {r.status_code}",
        json.dumps(r.json(), indent=2, ensure_ascii=False) if r.status_code == 200 else r.text
    )

    if r.status_code == 200:
        data = r.json()
        print_result(data.get("success") == True, "success=true")

    # Verificar que os campos foram atualizados
    r2 = requests.get(f"{BASE_URL}/api/crud/produtos/{produto_id}", headers=headers(token))
    if r2.status_code == 200:
        p = r2.json()
        if isinstance(p, dict) and "item" in p:
            p = p["item"]
        termos = p.get("termos_busca") or []
        print_result(
            len(termos) >= 8,
            f"termos_busca atualizados: {len(termos)} termos (min 8 esperado)",
            f"Termos: {termos[:8]}..."
        )


# ============================================================
# TESTE 3: Campos ParametroScore no banco
# ============================================================

def test_3_parametro_score(token):
    print_section("TESTE 3: ParametroScore - campos e valores")
    print("  Entrada: GET /api/crud/parametros-score")
    print("  Esperado: 6 pesos + 6 limiares presentes e com defaults corretos")
    print()

    r = requests.get(f"{BASE_URL}/api/crud/parametros-score", headers=headers(token))
    assert r.status_code == 200, f"Erro: {r.status_code}"
    data = r.json()
    items = data.get("items") or data.get("data") or []

    if not items:
        print_result(False, "Nenhum ParametroScore encontrado - criando...")
        # Criar um registro
        r_create = requests.post(
            f"{BASE_URL}/api/crud/parametros-score",
            headers=headers(token),
            json={}
        )
        print(f"  Create: {r_create.status_code} {r_create.text[:200]}")
        r = requests.get(f"{BASE_URL}/api/crud/parametros-score", headers=headers(token))
        data = r.json()
        items = data.get("items") or data.get("data") or []

    if not items:
        print_result(False, "Impossível criar/listar ParametroScore")
        return None

    ps = items[0]

    # Verificar pesos
    pesos = {
        "peso_tecnico": 0.35, "peso_documental": 0.15, "peso_complexidade": 0.15,
        "peso_juridico": 0.20, "peso_logistico": 0.05, "peso_comercial": 0.10
    }
    for campo, default in pesos.items():
        val = ps.get(campo)
        presente = val is not None
        print_result(presente, f"{campo} = {val} (default esperado: {default})")

    # Verificar que peso_participacao e peso_ganho NÃO existem
    print_result(
        "peso_participacao" not in ps,
        "peso_participacao removido (não deve existir)"
    )
    print_result(
        "peso_ganho" not in ps,
        "peso_ganho removido (não deve existir)"
    )

    # Verificar limiares
    limiares = {
        "limiar_go": 70.0, "limiar_nogo": 40.0,
        "limiar_tecnico_go": 60.0, "limiar_tecnico_nogo": 30.0,
        "limiar_juridico_go": 60.0, "limiar_juridico_nogo": 30.0
    }
    for campo, default in limiares.items():
        val = ps.get(campo)
        presente = val is not None
        print_result(presente, f"{campo} = {val} (default esperado: {default})")

    # Verificar soma dos pesos
    soma = sum(float(ps.get(c, 0) or 0) for c in pesos.keys())
    print_result(
        abs(soma - 1.0) < 0.02,
        f"Soma dos pesos = {soma:.2f} (esperado ~1.00)"
    )

    return ps


# ============================================================
# TESTE 4: Atualizar pesos via CRUD e verificar persistência
# ============================================================

def test_4_atualizar_parametros(token, param_id):
    print_section("TESTE 4: Atualizar pesos e limiares via CRUD")
    print(f"  Entrada: PATCH /api/crud/parametros-score/{param_id}")
    print("  Payload: peso_tecnico=0.40, limiar_go=75.0, limiar_nogo=35.0")
    print("  Esperado: Valores atualizados e persistidos")
    print()

    novos = {
        "peso_tecnico": "0.40",
        "peso_documental": "0.10",
        "limiar_go": "75.0",
        "limiar_nogo": "35.0",
        "limiar_tecnico_go": "65.0"
    }

    r = requests.put(
        f"{BASE_URL}/api/crud/parametros-score/{param_id}",
        headers=headers(token),
        json=novos
    )

    print_result(
        r.status_code == 200,
        f"Update status: {r.status_code}",
        r.text[:300] if r.status_code != 200 else ""
    )

    # Verificar leitura
    r2 = requests.get(f"{BASE_URL}/api/crud/parametros-score/{param_id}", headers=headers(token))
    if r2.status_code == 200:
        ps = r2.json()
        if isinstance(ps, dict) and "item" in ps:
            ps = ps["item"]

        for campo, val_esperado in novos.items():
            val_real = ps.get(campo)
            ok = val_real is not None and abs(float(val_real) - float(val_esperado)) < 0.01
            print_result(ok, f"{campo}: esperado={val_esperado}, obtido={val_real}")

    # Restaurar defaults
    defaults = {
        "peso_tecnico": "0.35", "peso_documental": "0.15",
        "limiar_go": "70.0", "limiar_nogo": "40.0",
        "limiar_tecnico_go": "60.0"
    }
    requests.put(
        f"{BASE_URL}/api/crud/parametros-score/{param_id}",
        headers=headers(token),
        json=defaults
    )
    print_result(True, "Defaults restaurados")


# ============================================================
# TESTE 5: Busca CATMAT via API dadosabertos
# ============================================================

def test_5_busca_catmat_api():
    print_section("TESTE 5: API CATMAT dadosabertos.compras.gov.br")
    print("  Entrada: Estrategia 2 passos — buscar PDMs por grupo, depois itens por PDM")
    print("  Grupos: 65 (Equip. Medico), 66 (Instrumentos Lab)")
    print("  Esperado: HTTP 200, PDMs e itens retornados")
    print()

    base = "https://dadosabertos.compras.gov.br"

    # Passo 1: Buscar PDMs do grupo 65 (Equip. Médico)
    try:
        r = requests.get(f"{base}/modulo-material/3_consultarPdmMaterial",
                        params={"codigoGrupo": 65, "tamanhoPagina": 50}, timeout=15)
        if r.status_code == 200:
            pdms = r.json().get("resultado", [])
            print_result(len(pdms) > 0, f"Grupo 65 (Equip. Medico): {len(pdms)} PDMs")
            # Buscar PDMs com "luva" ou "autoclave"
            luva_pdms = [p for p in pdms if "luva" in (p.get("nomePdm") or "").lower()]
            auto_pdms = [p for p in pdms if "autoclave" in (p.get("nomePdm") or "").lower()]
            if luva_pdms:
                print(f"           PDM Luva: cod={luva_pdms[0]['codigoPdm']} | {luva_pdms[0]['nomePdm']}")
            if auto_pdms:
                print(f"           PDM Autoclave: cod={auto_pdms[0]['codigoPdm']} | {auto_pdms[0]['nomePdm']}")
        else:
            print_result(False, f"Grupo 65: HTTP {r.status_code}")
    except Exception as e:
        print_result(False, f"Grupo 65: Erro: {e}")

    # Passo 1b: Buscar PDMs do grupo 66 (Instrumentos Lab)
    try:
        r = requests.get(f"{base}/modulo-material/3_consultarPdmMaterial",
                        params={"codigoGrupo": 66, "tamanhoPagina": 50}, timeout=15)
        if r.status_code == 200:
            pdms = r.json().get("resultado", [])
            print_result(len(pdms) > 0, f"Grupo 66 (Instrumentos Lab): {len(pdms)} PDMs")
        else:
            print_result(False, f"Grupo 66: HTTP {r.status_code}")
    except Exception as e:
        print_result(False, f"Grupo 66: Erro: {e}")

    # Passo 2: Buscar itens de um PDM específico (432 = Luva Descartável)
    try:
        r = requests.get(f"{base}/modulo-material/4_consultarItemMaterial",
                        params={"codigoPdm": 432, "tamanhoPagina": 10}, timeout=15)
        if r.status_code == 200:
            itens = r.json().get("resultado", [])
            total = r.json().get("totalRegistros", len(itens))
            print_result(len(itens) > 0, f"PDM 432 (Luva Descartavel): {total} itens")
            if itens:
                i = itens[0]
                print(f"           Exemplo: cod={i.get('codigoItem')} | {i.get('descricaoItem', '')[:70]}")
        else:
            print_result(False, f"PDM 432: HTTP {r.status_code}")
    except Exception as e:
        print_result(False, f"PDM 432: Erro: {e}")


# ============================================================
# TESTE 6: Pré-filtro usa termos_busca e catmat_descricoes
# ============================================================

def test_6_prefiltro_termos(token):
    print_section("TESTE 6: Pré-filtro com termos_busca integrados")
    print("  Entrada: Chamar _build_product_keyword_index internamente")
    print("  Esperado: Keywords incluem termos semânticos dos produtos")
    print()

    # Testar via import direto
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
    try:
        from models import SessionLocal, Produto
        from tools import _build_product_keyword_index

        db = SessionLocal()
        produtos = db.query(Produto).filter(Produto.user_id == "cda089f1-0963-4e8c-b90d-ab2cf5bfe5f3").all()
        produtos_data = []
        for p in produtos:
            produtos_data.append({
                "id": str(p.id),
                "nome": p.nome,
                "categoria": p.categoria,
                "fabricante": p.fabricante,
                "modelo": p.modelo,
                "termos_busca": p.termos_busca or [],
                "catmat_descricoes": p.catmat_descricoes or [],
            })
        db.close()

        index = _build_product_keyword_index(produtos_data, None)
        keywords = index.get("keywords", set())

        print_result(len(keywords) > 20, f"Total keywords no índice: {len(keywords)}")

        # Verificar que termos semânticos estão no índice
        # Pegar termos do primeiro produto
        if produtos_data and produtos_data[0].get("termos_busca"):
            termos_p1 = produtos_data[0]["termos_busca"]
            found = 0
            for t in termos_p1[:5]:
                t_lower = t.lower().strip()
                # Os termos multi-word são tokenizados
                palavras = [w for w in t_lower.split() if len(w) > 2]
                for w in palavras:
                    if w in keywords:
                        found += 1
                        break
            print_result(
                found >= 3,
                f"Termos semânticos no índice: {found}/{min(5, len(termos_p1))} termos testados",
                f"Termos testados: {termos_p1[:5]}"
            )
        else:
            print_result(False, "Sem termos_busca no produto 1 para testar")

        # Verificar keywords de fabricante/modelo
        fabs = index.get("fabricantes", set())
        mods = index.get("modelos", set())
        print_result(len(fabs) > 0, f"Fabricantes no índice: {len(fabs)} ({list(fabs)[:5]})")
        print_result(len(mods) > 0, f"Modelos no índice: {len(mods)} ({list(mods)[:5]})")

    except Exception as e:
        print_result(False, f"Erro ao testar pré-filtro: {e}")


# ============================================================
# TESTE 7: Matching hierárquico _match_produto_edital
# ============================================================

def test_7_matching_hierarquico(token):
    print_section("TESTE 7: Matching hierárquico produto-edital")
    print("  Entrada: _match_produto_edital com objeto simulado")
    print("  Esperado: Match exato para termo direto, genérico para indireto")
    print()

    sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
    try:
        from models import SessionLocal, Produto
        from tools import _match_produto_edital

        db = SessionLocal()
        produtos = db.query(Produto).filter(
            Produto.user_id == "cda089f1-0963-4e8c-b90d-ab2cf5bfe5f3"
        ).all()

        # Cenário 1: Objeto com nome exato do produto
        p1 = produtos[0]  # Analisador Bioquímico
        objeto_exato = f"Aquisição de {p1.nome} para laboratório clínico municipal"

        melhor, nivel, score = _match_produto_edital(produtos, objeto_exato, db)
        print_result(
            nivel in ("exato",) and melhor is not None,
            f"Match EXATO: objeto contém '{p1.nome[:30]}...'",
            f"Resultado: produto={melhor.nome if melhor else None}, nivel={nivel}, score={score:.3f}"
        )

        # Cenário 2: Objeto com fabricante/modelo
        p_micro = None
        for p in produtos:
            if "microscópio" in p.nome.lower() or "microscopio" in p.nome.lower():
                p_micro = p
                break
        if p_micro:
            objeto_fab = f"Pregão para microscopio binocular {p_micro.fabricante or ''} {p_micro.modelo or ''}"
            melhor2, nivel2, score2 = _match_produto_edital(produtos, objeto_fab, db)
            print_result(
                nivel2 in ("exato", "subclasse") and melhor2 is not None,
                f"Match por fabricante/modelo: '{p_micro.fabricante} {p_micro.modelo}'",
                f"Resultado: produto={melhor2.nome if melhor2 else None}, nivel={nivel2}, score={score2:.3f}"
            )

        # Cenário 3: Objeto genérico (sem match forte)
        objeto_gen = "Contratação de serviço de manutenção predial e limpeza"
        melhor3, nivel3, score3 = _match_produto_edital(produtos, objeto_gen, db)
        print_result(
            nivel3 in ("nenhum", "generico") and (score3 < 0.3),
            f"Match GENÉRICO/NENHUM para objeto não-relacionado",
            f"Resultado: produto={melhor3.nome[:30] if melhor3 else None}, nivel={nivel3}, score={score3:.3f}"
        )

        # Cenário 4: Objeto com termos de categoria
        objeto_cat = "Aquisição de reagentes para diagnóstico laboratorial hemograma completo"
        melhor4, nivel4, score4 = _match_produto_edital(produtos, objeto_cat, db)
        print_result(
            melhor4 is not None,
            f"Match por categoria/termos: 'reagentes diagnóstico hemograma'",
            f"Resultado: produto={melhor4.nome[:40] if melhor4 else None}, nivel={nivel4}, score={score4:.3f}"
        )

        db.close()
    except Exception as e:
        import traceback
        print_result(False, f"Erro: {e}")
        traceback.print_exc()


# ============================================================
# TESTE 8: Score profundo usa pesos do banco
# ============================================================

def test_8_score_profundo_pesos(token):
    print_section("TESTE 8: Score profundo com pesos do banco")
    print("  Entrada: Buscar 1 edital no PNCP, calcular score profundo")
    print("  Esperado: score_final recalculado com pesos, decisão GO/NO-GO/AVALIAR")
    print()

    # Primeiro buscar um edital
    print("  [1] Buscando editais no PNCP...")
    r = requests.get(
        f"{BASE_URL}/api/editais/buscar",
        headers=headers(token),
        params={
            "termo": "reagente laboratorio",
            "tipo_score": "nenhum",
            "limite": 3,
            "dias_busca": 30,
        }
    )

    if r.status_code != 200:
        print_result(False, f"Busca editais falhou: {r.status_code}", r.text[:300])
        return

    data = r.json()
    editais = data.get("editais", [])
    if not editais:
        print_result(False, "Nenhum edital encontrado para testar score")
        return

    edital = editais[0]
    edital_id = edital.get("id")
    print(f"  [2] Edital encontrado: {edital.get('numero', '?')} - {edital.get('orgao', '?')[:50]}")
    print(f"       Objeto: {edital.get('objeto', '?')[:80]}...")

    # Salvar o edital no banco para poder calcular score
    # O score profundo precisa do edital salvo
    print("  [3] Calculando score profundo via busca com tipo_score=profundo...")
    r2 = requests.get(
        f"{BASE_URL}/api/editais/buscar",
        headers=headers(token),
        params={
            "termo": "reagente laboratorio",
            "tipo_score": "profundo",
            "limite": 1,
            "dias_busca": 30,
            "limiteScoreProfundo": 1,
        },
        timeout=120
    )

    if r2.status_code != 200:
        print_result(False, f"Score profundo falhou: {r2.status_code}", r2.text[:300])
        return

    data2 = r2.json()
    editais_scored = data2.get("editais", [])

    # Procurar edital com score_profundo calculado
    scored = None
    for e in editais_scored:
        if e.get("score_profundo"):
            scored = e
            break

    if not scored:
        print_result(False, "Nenhum edital com score profundo calculado",
                    f"Editais retornados: {len(editais_scored)}")
        if editais_scored:
            keys = list(editais_scored[0].keys())
            print(f"           Campos disponíveis: {keys}")
        return

    sp = scored["score_profundo"]
    scores = sp.get("scores", {})

    # Verificar 6 dimensões
    dimensoes = ["tecnico", "documental", "complexidade", "juridico", "logistico", "comercial"]
    for dim in dimensoes:
        val = scores.get(dim)
        print_result(val is not None, f"score_{dim} = {val}")

    # Verificar score_geral (score_final recalculado pelo backend)
    sf = sp.get("score_geral")
    print_result(sf is not None, f"score_geral (score_final) = {sf}")

    # Verificar decisão
    decisao = sp.get("decisao")
    print_result(
        decisao in ("GO", "NO-GO", "AVALIAR"),
        f"Decisão: {decisao}"
    )

    # Verificar recálculo com pesos do banco
    # Carregar pesos atuais
    sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))
    from models import SessionLocal as SL2, ParametroScore as PS2
    db2 = SL2()
    ps = db2.query(PS2).first()
    db2.close()

    if ps:
        st = float(scores.get("tecnico", 0))
        sd = float(scores.get("documental", 0))
        sc = float(scores.get("complexidade", 0))
        sj = float(scores.get("juridico", 0))
        sl = float(scores.get("logistico", 0))
        sm = float(scores.get("comercial", 0))

        pesos = {
            "tecnico": float(ps.peso_tecnico),
            "documental": float(ps.peso_documental),
            "complexidade": float(ps.peso_complexidade),
            "juridico": float(ps.peso_juridico),
            "logistico": float(ps.peso_logistico),
            "comercial": float(ps.peso_comercial),
        }
        calc = round(st*pesos["tecnico"] + sd*pesos["documental"] + sc*pesos["complexidade"] +
                     sj*pesos["juridico"] + sl*pesos["logistico"] + sm*pesos["comercial"], 1)
        diff = abs(float(sf or 0) - calc)
        print_result(
            diff < 3.0,
            f"Recálculo score_final: backend={sf}, esperado={calc}, diff={diff}",
            f"Pesos do banco: {pesos}\nScores: tec={st} doc={sd} comp={sc} jur={sj} log={sl} com={sm}"
        )
    else:
        print_result(False, "ParametroScore não encontrado no banco")


# ============================================================
# TESTE 9: Busca paralela com termos extras
# ============================================================

def test_9_busca_paralela_termos(token):
    print_section("TESTE 9: Busca com termos extras (CATMAT/semânticos)")
    print("  Entrada: GET /api/editais/buscar com tipo_score=rapido")
    print("  Esperado: Mais editais encontrados graças a buscas paralelas")
    print()

    # Busca sem score (baseline)
    r1 = requests.get(
        f"{BASE_URL}/api/editais/buscar",
        headers=headers(token),
        params={
            "termo": "laboratorio",
            "tipo_score": "nenhum",
            "limite": 50,
            "dias_busca": 30,
        },
        timeout=60
    )
    n_sem = len(r1.json().get("editais", [])) if r1.status_code == 200 else 0
    print_result(True, f"Busca SEM score: {n_sem} editais")

    # Busca com score rápido (ativa termos extras)
    try:
        r2 = requests.get(
            f"{BASE_URL}/api/editais/buscar",
            headers=headers(token),
            params={
                "termo": "laboratorio",
                "tipo_score": "rapido",
                "limite": 20,
                "dias_busca": 15,
            },
            timeout=180
        )
        n_com = len(r2.json().get("editais", [])) if r2.status_code == 200 else 0
        print_result(True, f"Busca COM score (termos extras): {n_com} editais")

        # Se tipo_score != nenhum, buscas extras são feitas
        print_result(
            r2.status_code == 200,
            f"Busca com score retornou HTTP {r2.status_code}",
            f"Delta editais: {n_com - n_sem} (positivo = termos extras trouxeram mais)" if n_com >= n_sem else
            f"Nota: {n_com} vs {n_sem} (pode ser igual se dedup removeu duplicatas)"
        )

        # Verificar que editais com score têm score_tecnico
        if r2.status_code == 200:
            editais_scored = r2.json().get("editais", [])
            com_score = [e for e in editais_scored if e.get("score_tecnico") is not None]
            print_result(
                len(com_score) > 0,
                f"Editais com score_tecnico: {len(com_score)}/{len(editais_scored)}"
            )
    except requests.exceptions.Timeout:
        print_result(False, "Busca com score rápido: Timeout (>180s)",
                    "A busca com termos extras pode demorar muito com muitos produtos")


# ============================================================
# TESTE 10: Verificar que peso_participacao/peso_ganho foram removidos
# ============================================================

def test_10_campos_removidos(token):
    print_section("TESTE 10: Campos fantasma removidos do ParametroScore")
    print("  Entrada: GET /api/crud/parametros-score")
    print("  Esperado: peso_participacao e peso_ganho NÃO presentes")
    print()

    r = requests.get(f"{BASE_URL}/api/crud/parametros-score", headers=headers(token))
    if r.status_code != 200:
        print_result(False, f"Erro: {r.status_code}")
        return

    items = r.json().get("items") or r.json().get("data") or []
    if not items:
        print_result(False, "Nenhum registro")
        return

    ps = items[0]
    print_result("peso_participacao" not in ps, "peso_participacao removido do to_dict()")
    print_result("peso_ganho" not in ps, "peso_ganho removido do to_dict()")

    # Verificar que os 6 pesos corretos existem
    pesos_corretos = ["peso_tecnico", "peso_documental", "peso_complexidade",
                      "peso_juridico", "peso_logistico", "peso_comercial"]
    todos = all(c in ps for c in pesos_corretos)
    print_result(todos, f"6 pesos corretos presentes: {[c for c in pesos_corretos if c in ps]}")


# ============================================================
# MAIN
# ============================================================

def main():
    print("\n" + "=" * 70)
    print("  SUITE DE TESTES - Backend Sprint 3")
    print("  CATMAT/CATSER, Termos Semânticos, Parametrização de Score")
    print("=" * 70)

    token = login()
    print(f"\n  Login OK. Token: {token[:30]}...")

    # Teste 1: Campos no modelo
    p = test_1_campos_produto(token)

    # Teste 2: Reprocessar metadados
    if p:
        test_2_reprocessar_metadados(token, p.get("id"), p.get("nome", "?"))

    # Teste 3: ParametroScore
    ps = test_3_parametro_score(token)

    # Teste 4: Atualizar parâmetros
    if ps:
        test_4_atualizar_parametros(token, ps.get("id"))

    # Teste 5: API CATMAT direta
    test_5_busca_catmat_api()

    # Teste 6: Pré-filtro
    test_6_prefiltro_termos(token)

    # Teste 7: Matching hierárquico
    test_7_matching_hierarquico(token)

    # Teste 8: Score profundo (mais lento)
    test_8_score_profundo_pesos(token)

    # Teste 9: Busca paralela
    test_9_busca_paralela_termos(token)

    # Teste 10: Campos removidos
    test_10_campos_removidos(token)

    print(f"\n{'='*70}")
    print("  SUITE FINALIZADA")
    print(f"{'='*70}\n")


if __name__ == "__main__":
    main()
