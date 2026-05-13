#!/usr/bin/env python3
"""Cria o "Teste Global" no testesvalidacoes.

Estrutura:
  - Projeto Facilicita.IA
    - Sprint "Global" (numero=99, independente=1)
      - UC-GLOBAL-01 "Fluxo End-to-End de Licitação (S1-S5)"
        - CT-GLOBAL-FP (positivo, trilha=visual)
          - ~80 passos clonados das sprints 1-5, encadeados, com dados consistentes
            de uma empresa sintética MediTest (gerada a cada ciclo)

O dataset (empresa, produtos, parametros) eh gerado tambem como JSON e referenciado
via valor_from_dataset nos passos.

Idempotente: rodar de novo limpa e recria o conteudo da sprint Global.
"""

import json
import sys
import uuid
from datetime import datetime
from pathlib import Path

import pymysql

# ============================================================================
# Config
# ============================================================================

MYSQL = dict(
    host="camerascasas.no-ip.info",
    port=3308,
    user="producao",
    password="112358123",
    database="testesvalidacoes",
    charset="utf8mb4",
    cursorclass=pymysql.cursors.DictCursor,
)

PROJETO_FACILICITA_ID = "00000000-0000-0000-0000-000000000001"
SPRINT_GLOBAL_NUMERO = 99
SPRINT_GLOBAL_NOME = "Global — Fluxo End-to-End de Licitação"

# ============================================================================
# Helpers
# ============================================================================

def get_or_create_sprint_global(cur) -> str:
    """Retorna o id da sprint Global; cria se não existir."""
    cur.execute(
        "SELECT id FROM sprints WHERE projeto_id=%s AND numero=%s",
        (PROJETO_FACILICITA_ID, SPRINT_GLOBAL_NUMERO),
    )
    r = cur.fetchone()
    if r:
        print(f"  sprint Global já existe (id={r['id'][:8]})")
        return r["id"]
    sid = str(uuid.uuid4())
    cur.execute(
        """INSERT INTO sprints (id, projeto_id, numero, nome, descricao, ativo, criado_em, independente)
           VALUES (%s, %s, %s, %s, %s, 1, NOW(), 1)""",
        (sid, PROJETO_FACILICITA_ID, SPRINT_GLOBAL_NUMERO, SPRINT_GLOBAL_NOME,
         "Teste integrado que percorre Sprint 1→2→3→4→5 num único fluxo end-to-end."),
    )
    print(f"  sprint Global criada (id={sid[:8]})")
    return sid


def limpar_uc_global(cur, sprint_id: str):
    """Apaga apenas os passos_tutorial do UC-GLOBAL-01 (mantém UC e CT
    porque podem ter execuções históricas com FK)."""
    cur.execute("SELECT id FROM casos_de_uso WHERE sprint_id=%s AND uc_id='UC-GLOBAL-01'", (sprint_id,))
    r = cur.fetchone()
    if not r:
        return None
    uc_id = r["id"]
    # Apaga só os passos (mantém CT/UC pra preservar FK das execuções)
    cur.execute(
        """DELETE pt FROM passos_tutorial pt
           JOIN casos_de_teste ct ON ct.id=pt.caso_de_teste_id
           WHERE ct.caso_de_uso_id=%s""",
        (uc_id,),
    )
    print(f"  Passos do UC-GLOBAL-01 anterior apagados (CT e UC mantidos)")
    return uc_id


def criar_uc(cur, sprint_id: str) -> str:
    """Cria UC-GLOBAL-01."""
    uc_id = str(uuid.uuid4())
    cur.execute(
        """INSERT INTO casos_de_uso
           (id, sprint_id, uc_id, nome, doc_origem, conteudo_md, ativo, criado_em)
           VALUES (%s, %s, %s, %s, %s, %s, 1, NOW())""",
        (
            uc_id,
            sprint_id,
            "UC-GLOBAL-01",
            "Fluxo End-to-End de Licitação (S1-S5)",
            "docs/TESTE_GLOBAL.md",
            "## UC-GLOBAL-01 — Fluxo End-to-End\n\n"
            "Percorre Sprint 1 (empresa+portfolio+parametros), "
            "Sprint 2 (captação+validação), "
            "Sprint 3 (precificação+proposta), "
            "Sprint 4 (impugnação), "
            "Sprint 5 (followup) — num único caso de teste, com dados encadeados de "
            "uma empresa sintética MediTest gerada a cada ciclo.",
        ),
    )
    print(f"  UC-GLOBAL-01 criado (id={uc_id[:8]})")
    return uc_id


def criar_ct(cur, uc_id: str) -> str:
    """Cria CT-GLOBAL-FP."""
    ct_id = str(uuid.uuid4())
    cur.execute(
        """INSERT INTO casos_de_teste
           (id, caso_de_uso_id, ct_id, descricao, pre_condicoes, acoes, saida_esperada,
            tipo, categoria, trilha_sugerida, rns_aplicadas, fonte_doc, ativo, criado_em)
           VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, 1, NOW())""",
        (
            ct_id,
            uc_id,
            "CT-GLOBAL-FP",
            "Fluxo principal end-to-end: empresa MediTest cadastrada, portfolio, parametrização, "
            "captação de edital monitor multiparâmetro no PNCP, validação, proposta, impugnação, "
            "registro de resultado.",
            "Usuário sintético novo. Empresa nascente vazia. Banco editais sincronizado com migrations 051-054.",
            "Sistema executa ~80 passos sem erro. Empresa criada com portfólio populado, "
            "edital captado e salvo, proposta gerada, impugnação registrada, resultado lançado.",
            "Empresa MediTest, 1 produto Monitor Multiparâmetro Mindray, certidões + responsáveis cadastrados, "
            "edital PNCP de monitor multiparâmetro captado, score híbrido > 50, proposta + impugnação geradas, "
            "resultado de Vitória registrado em Sprint 5.",
            "Positivo",
            "Cenário",
            "visual",
            "RN-001,RN-002,RN-003,RN-022,RN-026,RN-031,RN-037,RN-059",
            "Múltiplos UCs Sprint 1-5",
        ),
    )
    print(f"  CT-GLOBAL-FP criado (id={ct_id[:8]})")
    return ct_id


# ============================================================================
# Clone helper — pega passos de UCs canônicos, adapta dataset, re-prefixa passo_id
# ============================================================================

def clonar_passos_de_uc(cur, uc_canonico: str, ct_canonico_sufixo: str = "-FP",
                        prefix: str = "") -> list[dict]:
    """Busca passos do CT canônico de um UC. Retorna lista de dicts com
    {passo_id, titulo, descricao_painel, pontos_observacao, acoes_json, asserts_json}.
    """
    cur.execute(
        """SELECT pt.passo_id, pt.titulo, pt.descricao_painel, pt.pontos_observacao,
                  pt.acoes_json, pt.asserts_json
           FROM passos_tutorial pt
           JOIN casos_de_teste ct ON ct.id=pt.caso_de_teste_id
           JOIN casos_de_uso uc ON uc.id=ct.caso_de_uso_id
           WHERE uc.uc_id=%s AND ct.ct_id LIKE %s
           ORDER BY pt.ordem""",
        (uc_canonico, f"%{ct_canonico_sufixo}"),
    )
    rows = cur.fetchall()
    out = []
    for r in rows:
        out.append({
            "passo_id": f"{prefix}{r['passo_id']}" if prefix else r["passo_id"],
            "titulo": r["titulo"],
            "descricao_painel": r["descricao_painel"],
            "pontos_observacao": r["pontos_observacao"],
            "acoes_json": r["acoes_json"],
            "asserts_json": r["asserts_json"],
        })
    return out


# ============================================================================
# Pipeline de passos do Teste Global
# ============================================================================

# Lista (uc_canonico, prefix, [opcionalmente passos a manter ou pular])
# A ordem AQUI determina a ordem de execução do Teste Global.
PIPELINE = [
    # === BLOCO 1 — Sprint 1: Empresa + Hierarquia (F13 ANTES de F02 pq F02 precisa de área) ===
    ("UC-F01", "s1_f01_", None),      # Login + criar empresa MediTest (12 passos)
    ("UC-F13", "s1_f13_", None),      # Áreas/Classes/Subclasses + máscara (13 passos)
    ("UC-F02", "s1_f02_", None),      # Contatos + área padrão (5 passos)
    ("UC-F04", "s1_f04_", None),      # Buscar certidões automáticas (7 passos)
    ("UC-F05", "s1_f05_", None),      # Responsáveis técnicos (8 passos)

    # === BLOCO 2 — Sprint 1: Portfólio (F07 ANTES de F06 pq F06 lista produtos cadastrados) ===
    ("UC-F03", "s1_f03_", None),      # Documentos da empresa + uploads (8 passos)
    ("UC-F07", "s1_f07_", None),      # Cadastrar produto por IA (4 passos)
    ("UC-F08", "s1_f08_", None),      # Editar produto (4 passos)
    ("UC-F06", "s1_f06_", None),      # Listar portfólio (3 passos) — agora há produto pra listar

    # === BLOCO 3 — Sprint 1: Configuração de Score e parametrização ===
    ("UC-F14", "s1_f14_", None),      # Pesos e limiares (5 passos)
    ("UC-F15", "s1_f15_", None),      # Parâmetros comerciais (4 passos)
    ("UC-F16", "s1_f16_", None),      # Fontes e NCMs (3 passos)
    ("UC-F17", "s1_f17_", None),      # Notificações (4 passos)

    # === BLOCO 4 — Sprint 2: Captação ===
    ("UC-CV01", "s2_cv01_", None),    # Buscar editais PNCP com score (7 passos)
    ("UC-CV02", "s2_cv02_", None),    # Explorar resultados (3 passos)
    ("UC-CV03", "s2_cv03_", None),    # Salvar edital + itens (3 passos)
    ("UC-CV04", "s2_cv04_", None),    # Definir estratégia (4 passos)

    # === BLOCO 5 — Sprint 2: Validação (precisa navegar pra /validacao) ===
    ("UC-CV07", "s2_cv07_", None),    # Listar editais salvos + navegar Validacao (4 passos)
    ("UC-CV09", "s2_cv09_", None),    # Importar itens + extrair lotes (6 passos) — pré-condição P02
    ("UC-CV08", "s2_cv08_", None),    # Score híbrido + GO/NO-GO (3 passos)
    ("UC-CV10", "s2_cv10_", None),    # Confrontar documentação (2 passos)

    # === BLOCO 6 — Sprint 3: Precificação + Proposta ===
    ("UC-P02", "s3_p02_", None),      # Seleção IA portfolio (5 passos) — agora tem item importado
    ("UC-P04", "s3_p04_", None),      # Configurar Base de Custos (2 passos)
    ("UC-P05", "s3_p05_", None),      # Preço base (1 passo)
    ("UC-R01", "s3_r01_", None),      # Gerar proposta técnica (1 passo)

    # === BLOCO 6 — Sprint 4: Impugnação ===
    ("UC-I01", "s4_i01_", None),      # Validação legal (2 passos)
    ("UC-I02", "s4_i02_", None),      # Sugerir impugnação (2 passos)

    # === BLOCO 7 — Sprint 5: Pós-processo ===
    ("UC-FU01", "s5_fu01_", None),    # Registrar resultado (1 passo)
    ("UC-FU02", "s5_fu02_", None),    # Configurar alertas (1 passo)
]


def montar_passos_pipeline(cur) -> list[dict]:
    """Monta a lista completa de passos do Teste Global a partir do PIPELINE.
    Aplica prefix nos passo_ids pra evitar colisão (mesmo UC clonado várias vezes
    poderia causar duplicata)."""
    passos = []
    for uc, prefix, _filter in PIPELINE:
        clones = clonar_passos_de_uc(cur, uc, ct_canonico_sufixo="-FP", prefix=prefix)
        if not clones:
            print(f"  AVISO: UC {uc} não tem passos no -FP; pulando")
            continue
        print(f"  {uc}: +{len(clones)} passos (prefix='{prefix}')")
        passos.extend(clones)
    return passos


def inserir_passos(cur, ct_id: str, passos: list[dict]):
    """Insere os passos clonados no CT-GLOBAL-FP, na ordem dada."""
    for ordem, p in enumerate(passos, start=1):
        cur.execute(
            """INSERT INTO passos_tutorial
               (id, caso_de_teste_id, ordem, passo_id, titulo, descricao_painel,
                pontos_observacao, acoes_json, asserts_json, criado_em, atualizado_em)
               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())""",
            (
                str(uuid.uuid4()),
                ct_id,
                ordem,
                p["passo_id"][:120],  # limite da coluna
                (p["titulo"] or "")[:255],
                p["descricao_painel"],
                p["pontos_observacao"],
                p["acoes_json"],
                p["asserts_json"],
            ),
        )
    print(f"  {len(passos)} passos inseridos no CT-GLOBAL-FP")


# ============================================================================
# Dataset global (empresa MediTest sintética)
# ============================================================================

DATASET_GLOBAL = {
    "_descricao": "Dataset do Teste Global. Empresa MediTest gerada por ciclo. Dados encadeados Sprint 1-5.",
    "empresa": {
        "razao_social": "MediTest Equipamentos Diagnósticos Ltda.",
        "nome_fantasia": "MediTest",
        # CNPJ é gerado dinâmicamente pelo cnpj_generator do framework por ciclo
        "cnpj": "11.222.333/0001-81",  # placeholder; executor substitui
        "inscricao_estadual": "123.456.789.012",
        "logradouro": "Avenida das Indústrias",
        "numero": "1500",
        "complemento": "Sala 203",
        "bairro": "Vila Industrial",
        "cidade": "São Paulo",
        "uf": "SP",
        "cep": "04123-001",
        "telefone": "(11) 4002-8922",
        "website": "https://meditest.com.br",
    },
    "contatos": {
        "emails": ["contato@meditest.com.br", "comercial@meditest.com.br"],
        "telefones": ["(11) 4002-8922", "(11) 99999-1234"],
        "area_padrao": "Equipamentos Médico-Hospitalares",
    },
    "responsaveis": [
        {
            "nome": "Dr. Carlos Silva",
            "cpf": "111.222.333-44",
            "rg": "12.345.678-9",
            "tipo": "Representante Legal",
            "email": "carlos@meditest.com.br",
            "telefone": "(11) 98888-1111",
        },
        {
            "nome": "Eng. Ana Costa",
            "cpf": "222.333.444-55",
            "rg": "23.456.789-0",
            "tipo": "Responsável Técnico",
            "email": "ana@meditest.com.br",
            "telefone": "(11) 97777-2222",
        },
    ],
    "hierarquia": {
        "area": "Equipamentos Médico-Hospitalares",
        "classes": [
            {"nome": "Monitoração"},
        ],
        "subclasses": [
            {
                "classe": "Monitoração",
                "nome": "Monitor Multiparâmetro",
                "ncm": "9018.19.90",
                "campos_mascara": [
                    "Tela (polegadas)",
                    "Parâmetros monitorados",
                    "Tipo de paciente",
                    "Bateria (horas)",
                    "Peso (kg)",
                    "Alimentação (V)",
                    "Classe ANVISA",
                    "Registro ANVISA",
                ],
            },
        ],
    },
    "produto_principal": {
        "nome": "Monitor Multiparâmetro Mindray uMEC 12",
        "marca": "Mindray",
        "modelo": "uMEC 12",
        "ncm": "9018.19.90",
        "area": "Equipamentos Médico-Hospitalares",
        "classe": "Monitoração",
        "subclasse": "Monitor Multiparâmetro",
        "especificacoes": [
            {"campo": "Tela (polegadas)", "valor": "12 polegadas, touch screen"},
            {"campo": "Parâmetros monitorados", "valor": "ECG, SpO2, RESP, NIBP, TEMP, IBP"},
            {"campo": "Tipo de paciente", "valor": "Adulto/Pediátrico/Neonatal"},
            {"campo": "Bateria (horas)", "valor": "4 horas (íon-lítio)"},
            {"campo": "Peso (kg)", "valor": "5.2 kg"},
            {"campo": "Alimentação (V)", "valor": "110/220V AC, 50/60 Hz"},
            {"campo": "Classe ANVISA", "valor": "III"},
            {"campo": "Registro ANVISA", "valor": "80102510134"},
        ],
    },
    "score_config": {
        "peso_aderencia_tecnica": 35,
        "peso_preco_alvo": 25,
        "peso_localizacao": 15,
        "peso_historico_orgao": 15,
        "peso_concorrencia": 10,
        "limiar_go": 70,
        "limiar_nogo": 40,
    },
    "parametros_comerciais": {
        "margem_minima_pct": 12.0,
        "margem_alvo_pct": 22.0,
        "regioes_prioritarias": ["SP", "RJ", "MG"],
        "modalidades_alvo": ["Pregão Eletrônico", "Pregão Presencial", "Concorrência"],
    },
    "fontes_busca": {
        "ativas": ["PNCP", "ComprasNet"],
        "palavras_chave": ["monitor multiparametrico", "oximetro de pulso", "equipamento médico hospitalar"],
        "ncms_alvo": ["9018.19.90"],
    },
    "captacao": {
        "termo_busca": "monitor multiparametrico",
        "uf_busca": "SP",
        "tipo_score": "Score Híbrido",
        "fonte": "PNCP",
    },
    "proposta": {
        "preco_base_por_unidade": "R$ 18.500,00",
        "margem_aplicada_pct": 22.0,
    },
    "resultado_followup": {
        "tipo": "Vitória",
        "valor_final": "R$ 185.000,00",
        "qtd_vencida": 10,
    },
    "alertas_followup": {
        "alvos": ["FGTS", "Trabalhista", "Federal"],
        "antecedencia_dias": 15,
    },
}


def gravar_dataset_yaml():
    """Salva o dataset como arquivo YAML pra inspeção/edição manual."""
    Path("testes/datasets").mkdir(parents=True, exist_ok=True)
    out = Path("testes/datasets/UC-GLOBAL-01_visual.yaml")
    try:
        import yaml
        out.write_text(yaml.safe_dump(DATASET_GLOBAL, allow_unicode=True, sort_keys=False), encoding="utf-8")
    except ImportError:
        out.write_text(json.dumps(DATASET_GLOBAL, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"  dataset gravado em {out}")


# ============================================================================
# Main
# ============================================================================

def main():
    print(f"\n[{datetime.now().isoformat()}] === Criar Teste Global ===\n")
    cn = pymysql.connect(**MYSQL)
    try:
        with cn.cursor() as cur:
            print("[1/5] Sprint Global...")
            sprint_id = get_or_create_sprint_global(cur)

            print("\n[2/5] Limpa passos do UC-GLOBAL-01 anterior (se existir)...")
            uc_id_existente = limpar_uc_global(cur, sprint_id)

            if uc_id_existente:
                print("\n[3/5] UC-GLOBAL-01 já existe; reaproveita CT-GLOBAL-FP existente")
                uc_id = uc_id_existente
                cur.execute("SELECT id FROM casos_de_teste WHERE caso_de_uso_id=%s AND ct_id='CT-GLOBAL-FP'", (uc_id,))
                r = cur.fetchone()
                if r:
                    ct_id = r["id"]
                    print(f"  CT-GLOBAL-FP reaproveitado (id={ct_id[:8]})")
                else:
                    ct_id = criar_ct(cur, uc_id)
            else:
                print("\n[3/5] Cria UC-GLOBAL-01 + CT-GLOBAL-FP...")
                uc_id = criar_uc(cur, sprint_id)
                ct_id = criar_ct(cur, uc_id)

            print("\n[4/5] Monta pipeline de passos (Sprint 1 → 5)...")
            passos = montar_passos_pipeline(cur)
            print(f"\n  TOTAL: {len(passos)} passos no pipeline")

            print("\n[5/5] Insere passos no CT...")
            inserir_passos(cur, ct_id, passos)

        cn.commit()
        print("\n[OK] Estrutura criada e commitada no banco testesvalidacoes.")
    finally:
        cn.close()

    # Dataset (fora da transação)
    print("\n[+] Grava dataset YAML...")
    gravar_dataset_yaml()

    print(f"\n[{datetime.now().isoformat()}] === FIM ===")


if __name__ == "__main__":
    main()
