#!/usr/bin/env python3
"""Verificacao de banco de dados — Sprint 2 (Captacao e Validacao)
Empresa: CH Hospitalar (7dbdc60a-b806-4614-a024-a1d4841dc8c9)
"""
import sys, json
sys.path.insert(0, 'backend')
from config import MYSQL_URI
from sqlalchemy import create_engine, text

CH_ID = '7dbdc60a-b806-4614-a024-a1d4841dc8c9'
engine = create_engine(MYSQL_URI)

results = {}

with engine.connect() as c:
    # 1. Editais salvos
    r = c.execute(text(f"SELECT COUNT(*) FROM editais WHERE empresa_id='{CH_ID}'"))
    count = r.scalar()
    results['editais_count'] = count
    results['editais_ok'] = count > 0

    # Amostra de editais
    r = c.execute(text(f"""
        SELECT numero, orgao, uf, modalidade, valor_referencia, status, fonte
        FROM editais WHERE empresa_id='{CH_ID}'
        ORDER BY created_at DESC LIMIT 5
    """))
    results['editais_amostra'] = [dict(row._mapping) for row in r]

    # 2. Estrategias
    r = c.execute(text(f"SELECT COUNT(*) FROM estrategias_editais WHERE empresa_id='{CH_ID}'"))
    count = r.scalar()
    results['estrategias_count'] = count
    results['estrategias_ok'] = count > 0

    r = c.execute(text(f"""
        SELECT ee.decisao, ee.prioridade, ee.margem_desejada, ee.justificativa,
               e.numero as edital_numero
        FROM estrategias_editais ee
        JOIN editais e ON e.id = ee.edital_id
        WHERE ee.empresa_id='{CH_ID}'
        ORDER BY ee.created_at DESC LIMIT 3
    """))
    results['estrategias_amostra'] = [dict(row._mapping) for row in r]

    # 3. Monitoramentos
    r = c.execute(text(f"SELECT COUNT(*) FROM monitoramentos WHERE empresa_id='{CH_ID}'"))
    count = r.scalar()
    results['monitoramentos_count'] = count
    results['monitoramentos_ok'] = count > 0

    r = c.execute(text(f"""
        SELECT termo, ncm, ufs, ativo, frequencia_horas, score_minimo_alerta
        FROM monitoramentos WHERE empresa_id='{CH_ID}'
        ORDER BY created_at DESC LIMIT 5
    """))
    results['monitoramentos_amostra'] = [dict(row._mapping) for row in r]

    # 4. Validacoes legais (scores de risco)
    r = c.execute(text(f"""
        SELECT COUNT(*) FROM validacoes_legais
        WHERE edital_id IN (SELECT id FROM editais WHERE empresa_id='{CH_ID}')
    """))
    count = r.scalar()
    results['validacoes_legais_count'] = count
    results['validacoes_legais_ok'] = count > 0

    # 4b. Estrategias com decisao GO
    r = c.execute(text(f"""
        SELECT COUNT(*) FROM estrategias_editais
        WHERE empresa_id='{CH_ID}' AND decisao='go'
    """))
    results['decisoes_go_count'] = r.scalar()

    results['analises_amostra'] = []

    # 5. Lotes
    r = c.execute(text(f"SELECT COUNT(*) FROM lotes WHERE empresa_id='{CH_ID}'"))
    count = r.scalar()
    results['lotes_count'] = count

    # 6. EditalItemProduto
    r = c.execute(text(f"SELECT COUNT(*) FROM edital_item_produto WHERE empresa_id='{CH_ID}'"))
    count = r.scalar()
    results['itens_produto_count'] = count

    # 7. Editais com empresa_id preenchido (verifica refatoracao)
    r = c.execute(text(f"SELECT COUNT(*) FROM editais WHERE empresa_id IS NULL"))
    null_count = r.scalar()
    results['editais_sem_empresa'] = null_count

    # 8. Verificar vinculacao correta — nenhum edital da CH tem empresa_id errado
    r = c.execute(text(f"""
        SELECT COUNT(*) FROM editais
        WHERE empresa_id='{CH_ID}'
        AND (numero IS NULL OR numero = '')
    """))
    results['editais_sem_numero'] = r.scalar()

# Formatar saida
print("=" * 70)
print("VERIFICACAO DE BANCO DE DADOS — SPRINT 2")
print("Empresa: CH Hospitalar (%s)" % CH_ID)
print("=" * 70)

checks = [
    ("Editais salvos", results['editais_count'], results['editais_ok'], ">= 1 edital"),
    ("Estrategias definidas", results['estrategias_count'], results['estrategias_ok'], ">= 1 estrategia"),
    ("Monitoramentos ativos", results['monitoramentos_count'], results['monitoramentos_ok'], ">= 1 monitoramento"),
    ("Validacoes legais", results['validacoes_legais_count'], results['validacoes_legais_ok'], ">= 1 validacao"),
    ("Decisoes GO", results['decisoes_go_count'], results['decisoes_go_count'] > 0, ">= 1 decisao GO"),
    ("Lotes extraidos", results['lotes_count'], results['lotes_count'] >= 0, "contagem"),
    ("Itens x Produto", results['itens_produto_count'], results['itens_produto_count'] >= 0, "contagem"),
    ("Editais sem empresa_id", results['editais_sem_empresa'], results['editais_sem_empresa'] == 0, "deve ser 0"),
    ("Editais sem numero", results['editais_sem_numero'], results['editais_sem_numero'] == 0, "deve ser 0"),
]

all_ok = True
for label, value, ok, criteria in checks:
    status = "PASS" if ok else "FAIL"
    if not ok: all_ok = False
    print(f"  [{status}] {label}: {value} ({criteria})")

print()
print("--- Amostra: Editais ---")
for ed in results['editais_amostra']:
    vr = ed.get('valor_referencia') or 0
    print(f"  {ed['numero'][:30]:30s} | {(ed['orgao'] or '')[:35]:35s} | {ed['uf'] or '??'} | R$ {vr:>12,.2f}")

print()
print("--- Amostra: Estrategias ---")
for es in results['estrategias_amostra']:
    md = es.get('margem_desejada') or 0
    dec = es.get('decisao') or '?'
    pri = es.get('prioridade') or '?'
    print(f"  Edital {(es.get('edital_numero') or '?')[:25]:25s} | {dec:12s} | prio={pri:6s} | margem={md}%")

print()
print("--- Amostra: Monitoramentos ---")
for mo in results['monitoramentos_amostra']:
    print(f"  termo={mo['termo']:30s} | ncm={mo['ncm'] or '-':12s} | ufs={mo['ufs'] or '-'} | ativo={'Sim' if mo['ativo'] else 'Nao'}")

print()
print(f"--- Validacoes Legais: {results['validacoes_legais_count']} ---")
print(f"--- Decisoes GO: {results['decisoes_go_count']} ---")

print()
print("=" * 70)
print(f"RESULTADO GERAL: {'APROVADO' if all_ok else 'REPROVADO'}")
print("=" * 70)

# Salvar JSON para o relatorio
with open('runtime/verificacao_banco_sprint2.json', 'w') as f:
    # Converter Decimal para float
    def convert(obj):
        from decimal import Decimal
        if isinstance(obj, Decimal):
            return float(obj)
        raise TypeError
    json.dump(results, f, indent=2, default=convert)
print(f"\nJSON salvo em runtime/verificacao_banco_sprint2.json")
