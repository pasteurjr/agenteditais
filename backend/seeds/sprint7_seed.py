"""
Seed Sprint 7 — popula dados para 12 UCs: Mercado TAM/SAM/SOM, Analytics, Aprendizado.

Execucao: cd backend && python -m seeds.sprint7_seed

Idempotente: usa marcador SPRINT7_SEED e checa duplicatas.

Cobre (CH Hospitalar — valida1):
  - 5 concorrentes (MedLab Sul, DiagTech, BioAnalise, LabNorte, QualiMed)
  - 20 participacoes distribuidas entre concorrentes + editais
  - 15 precos historicos (8 vitoria, 5 derrota, 2 cancelado)
  - 15 feedbacks (4 resultado_edital, 4 score, 4 preco, 3 feedback_usuario)
  - 5 sugestoes IA (3 pendentes, 1 aceita, 1 rejeitada)
  - 4 padroes detectados (sazonalidade 92%, correlacao 85%, tendencia 68%, comportamento 45%)
  - 3 itens intrusos (1 critico, 1 medio, 1 informativo)

Cobre (RP3X — valida2):
  - 2 concorrentes
  - 5 participacoes
  - 5 precos historicos
  - 5 feedbacks
  - 2 sugestoes IA
  - 2 padroes detectados
  - 1 item intruso
"""
import sys
import os
import uuid
from datetime import datetime, date, timedelta
from decimal import Decimal

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import (
    SessionLocal,
    User, Empresa, Edital, Produto,
    Concorrente, ParticipacaoEdital, PrecoHistorico,
    AprendizadoFeedback, SugestaoIA, PadraoDetectado, ItemIntruso,
)

SEED_MARK = "SPRINT7_SEED"

VALIDA1_USER_ID = "45fae79e-27dc-46e4-9b74-ed054ad3b7b1"
VALIDA2_USER_ID = "edc4ab79-8fae-4ae1-a3da-d652f8bf5720"
CH_EMPRESA_ID = "7dbdc60a-b806-4614-a024-a1d4841dc8c9"


def uid():
    return str(uuid.uuid4())


def now():
    return datetime(2026, 4, 16, 9, 0, 0)


def already_seeded(db, model, **filters):
    return db.query(model).filter_by(**filters).first()


def get_rp3x_empresa_id(db):
    ue = db.query(Empresa).join(
        User, Empresa.user_id == User.id
    ).filter(User.id == VALIDA2_USER_ID).first()
    if ue:
        return ue.id
    from models import UsuarioEmpresa
    ue2 = db.query(UsuarioEmpresa).filter(
        UsuarioEmpresa.user_id == VALIDA2_USER_ID,
        UsuarioEmpresa.ativo == True
    ).first()
    return ue2.empresa_id if ue2 else None


# ==================== CH HOSPITALAR ====================

def seed_ch_concorrentes(db):
    concorrentes_data = [
        ("MedLab Sul", "12.345.678/0001-90", 15, 8, "Reagentes hematologia e bioquimica"),
        ("DiagTech Ltda", "23.456.789/0001-01", 12, 3, "Equipamentos diagnostico"),
        ("BioAnalise SA", "34.567.890/0001-12", 10, 5, "Kits laboratoriais diversos"),
        ("LabNorte Distribuidora", "45.678.901/0001-23", 8, 2, "Reagentes e insumos norte"),
        ("QualiMed Diagnosticos", "56.789.012/0001-34", 20, 12, "Full-line diagnostico"),
    ]
    created = 0
    ids = []
    for nome, cnpj, part, gan, obs in concorrentes_data:
        existing = already_seeded(db, Concorrente, cnpj=cnpj)
        if existing:
            ids.append(existing.id)
            continue
        c = Concorrente(
            id=uid(),
            nome=nome, cnpj=cnpj,
            editais_participados=part, editais_ganhos=gan,
            preco_medio=Decimal(str(round(50000 + gan * 3000, 2))),
            observacoes=obs,
            created_at=now() - timedelta(days=30),
        )
        db.add(c)
        ids.append(c.id)
        created += 1
    db.flush()
    return created, ids


def seed_ch_participacoes(db, concorrente_ids):
    editais = db.query(Edital).filter(
        Edital.empresa_id == CH_EMPRESA_ID
    ).limit(10).all()
    if not editais:
        print("  ! Sem editais CH para participacoes")
        return 0

    created = 0
    for i in range(20):
        conc_id = concorrente_ids[i % len(concorrente_ids)]
        edital = editais[i % len(editais)]
        posicao = (i % 5) + 1
        preco = Decimal(str(round(40000 + i * 2500.50, 2)))

        if already_seeded(db, ParticipacaoEdital,
                          concorrente_id=conc_id, edital_id=edital.id):
            continue

        db.add(ParticipacaoEdital(
            id=uid(),
            concorrente_id=conc_id, edital_id=edital.id,
            preco_proposto=preco,
            posicao_final=posicao,
            fonte='manual',
            created_at=now() - timedelta(days=60 - i * 3),
        ))
        created += 1
    return created


def seed_ch_precos(db):
    editais = db.query(Edital).filter(
        Edital.empresa_id == CH_EMPRESA_ID
    ).limit(15).all()
    if not editais:
        print("  ! Sem editais CH para precos")
        return 0

    resultados = (['vitoria'] * 8) + (['derrota'] * 5) + (['cancelado'] * 2)
    created = 0
    for i, resultado in enumerate(resultados):
        edital = editais[i % len(editais)]
        nosso = Decimal(str(round(45000 + i * 3200, 2)))
        vencedor = nosso * Decimal('0.92') if resultado == 'derrota' else nosso

        nosso_f = float(nosso)
        existing = db.query(PrecoHistorico).filter(
            PrecoHistorico.edital_id == edital.id,
            PrecoHistorico.user_id == VALIDA1_USER_ID,
            PrecoHistorico.nosso_preco == nosso,
        ).first()
        if existing:
            continue

        db.add(PrecoHistorico(
            id=uid(), user_id=VALIDA1_USER_ID, empresa_id=CH_EMPRESA_ID,
            edital_id=edital.id,
            nosso_preco=nosso,
            preco_vencedor=vencedor if resultado != 'cancelado' else None,
            empresa_vencedora="MedLab Sul" if resultado == 'derrota' else "CH Hospitalar",
            resultado=resultado,
            data_homologacao=date.today() - timedelta(days=90 - i * 5),
            fonte='manual',
        ))
        created += 1
    return created


def seed_ch_feedbacks(db):
    tipos = (['resultado_edital'] * 4) + (['score_ajustado'] * 4) + \
            (['preco_ajustado'] * 4) + (['feedback_usuario'] * 3)
    created = 0
    for i, tipo in enumerate(tipos):
        entidade_val = 'edital' if tipo != 'feedback_usuario' else 'geral'
        eid = uid() if tipo != 'feedback_usuario' else None

        # Check if a feedback with same tipo_evento, entidade, user already exists at this date
        dt = now() - timedelta(days=45 - i * 3)
        existing = db.query(AprendizadoFeedback).filter(
            AprendizadoFeedback.user_id == VALIDA1_USER_ID,
            AprendizadoFeedback.tipo_evento == tipo,
            AprendizadoFeedback.created_at == dt,
        ).first()
        if existing:
            continue

        aplicado = i % 3 != 0
        db.add(AprendizadoFeedback(
            id=uid(), user_id=VALIDA1_USER_ID, empresa_id=CH_EMPRESA_ID,
            tipo_evento=tipo,
            entidade=entidade_val,
            entidade_id=eid,
            dados_entrada={"score": 60 + i},
            resultado_real={"score": 65 + i},
            delta={"score_delta": 5},
            aplicado=aplicado,
            created_at=dt,
        ))
        created += 1
    return created


def seed_ch_sugestoes(db):
    sugestoes_data = [
        ("parametro", "Ajustar peso prazo de entrega", "Editais com prazo curto tem melhor conversao. Aumentar peso.",
         Decimal('82'), "pendente", None),
        ("margem", "Reduzir margem em Hematologia SP",
         "Gap de 8% nos ultimos 5 editais perdidos em SP para hematologia.",
         Decimal('75'), "pendente", None),
        ("score", "Recalibrar score tecnico para biomol",
         "Score atual subestima capacidade tecnica em biomol-PCR.",
         Decimal('68'), "pendente", None),
        ("estrategia", "Focar em pregoes eletronicos MG",
         "Taxa de vitoria em MG e 40% acima da media. Priorizar.",
         Decimal('90'), "aceita", None),
        ("parametro", "Ignorar editais < R$ 10k",
         "ROI negativo em editais pequenos. Filtrar na captacao.",
         Decimal('55'), "rejeitada", "Nao concordamos, editais pequenos abrem portas"),
    ]
    created = 0
    for tipo, titulo, desc, conf, status, motivo in sugestoes_data:
        existing = already_seeded(db, SugestaoIA, titulo=titulo, user_id=VALIDA1_USER_ID)
        if existing:
            existing.status = status
            existing.rejeitado_motivo = motivo
            continue
        db.add(SugestaoIA(
            id=uid(), user_id=VALIDA1_USER_ID, empresa_id=CH_EMPRESA_ID,
            tipo=tipo, titulo=titulo, descricao=desc,
            confianca=conf, base_dados_count=15,
            acao_sugerida=f"Implementar ajuste: {titulo}",
            status=status, rejeitado_motivo=motivo,
            created_at=now() - timedelta(days=10),
        ))
        created += 1
    return created


def seed_ch_padroes(db):
    padroes_data = [
        ("sazonalidade", "Pico de editais em Marco e Setembro",
         "Concentracao de 35% dos editais nesses 2 meses. Preparar capacidade.",
         Decimal('92'), {"meses_pico": ["03", "09"], "concentracao_pct": 35}),
        ("correlacao", "Orgaos federais pagam 12% acima da media",
         "Correlacao entre tipo de orgao (federal vs estadual) e valor medio.",
         Decimal('85'), {"federal_premium": 12, "amostra": 45}),
        ("tendencia_preco", "Preco medio subindo 3% ao trimestre",
         "Tendencia de alta nos precos de referencia em hematologia.",
         Decimal('68'), {"taxa_trimestral": 3.0, "segmento": "hematologia"}),
        ("comportamento_orgao", "Hospital X repete mesmos NCMs a cada 6 meses",
         "Padrao ciclico de compras do Hospital Municipal X.",
         Decimal('45'), {"orgao": "Hospital Municipal X", "ciclo_meses": 6}),
    ]
    created = 0
    for tipo, titulo, desc, conf, dados in padroes_data:
        if already_seeded(db, PadraoDetectado, titulo=titulo, user_id=VALIDA1_USER_ID):
            continue
        db.add(PadraoDetectado(
            id=uid(), user_id=VALIDA1_USER_ID, empresa_id=CH_EMPRESA_ID,
            tipo=tipo, titulo=titulo, descricao=desc,
            confianca=conf, base_dados_count=50,
            dados_json=dados, ativo=True,
            created_at=now() - timedelta(days=7),
            updated_at=now() - timedelta(days=7),
        ))
        created += 1
    return created


def seed_ch_intrusos(db):
    editais = db.query(Edital).filter(
        Edital.empresa_id == CH_EMPRESA_ID
    ).limit(3).all()
    if not editais:
        print("  ! Sem editais CH para intrusos")
        return 0

    intrusos_data = [
        ("Mobiliario hospitalar - cama articulada eletrica", "9402.90.90",
         Decimal('185000.00'), Decimal('15.30'), "critico",
         "Item representa 15.3% do edital e esta FORA do portfolio. Risco alto de inexecucao."),
        ("Ar condicionado split 30000 BTU", "8415.10.11",
         Decimal('42000.00'), Decimal('7.20'), "medio",
         "Equipamento de climatizacao, fora do escopo de diagnostico. Avaliar subcontratacao."),
        ("Papel A4 resma 500fls", "4802.56.10",
         Decimal('3500.00'), Decimal('0.80'), "informativo",
         "Material de escritorio. Impacto minimo, pode ser cotado externamente."),
    ]
    created = 0
    for i, (desc, ncm, valor, pct, crit, acao) in enumerate(intrusos_data):
        edital = editais[i % len(editais)]
        if already_seeded(db, ItemIntruso, descricao_item=desc, edital_id=edital.id):
            continue
        db.add(ItemIntruso(
            id=uid(), user_id=VALIDA1_USER_ID, empresa_id=CH_EMPRESA_ID,
            edital_id=edital.id,
            descricao_item=desc, ncm=ncm, valor=valor,
            percentual_edital=pct, criticidade=crit,
            acao_sugerida=acao,
            created_at=now() - timedelta(days=5),
        ))
        created += 1
    return created


# ==================== RP3X ====================

def seed_rp3x_concorrentes(db, rp3x_empresa_id):
    concorrentes_data = [
        ("TechSolucoes Gov", "67.890.123/0001-45", 6, 2, "TI para governo"),
        ("GovData Sistemas", "78.901.234/0001-56", 4, 1, "Sistemas de gestao publica"),
    ]
    created = 0
    ids = []
    for nome, cnpj, part, gan, obs in concorrentes_data:
        existing = already_seeded(db, Concorrente, cnpj=cnpj)
        if existing:
            ids.append(existing.id)
            continue
        c = Concorrente(
            id=uid(),
            nome=nome, cnpj=cnpj,
            editais_participados=part, editais_ganhos=gan,
            preco_medio=Decimal(str(round(80000 + gan * 5000, 2))),
            observacoes=obs,
            created_at=now() - timedelta(days=20),
        )
        db.add(c)
        ids.append(c.id)
        created += 1
    db.flush()
    return created, ids


def seed_rp3x_participacoes(db, concorrente_ids, rp3x_empresa_id):
    editais = db.query(Edital).filter(
        Edital.empresa_id == rp3x_empresa_id
    ).limit(5).all()
    if not editais:
        print("  ! Sem editais RP3X para participacoes")
        return 0

    created = 0
    for i in range(5):
        conc_id = concorrente_ids[i % len(concorrente_ids)]
        edital = editais[i % len(editais)]

        if already_seeded(db, ParticipacaoEdital,
                          concorrente_id=conc_id, edital_id=edital.id):
            continue

        db.add(ParticipacaoEdital(
            id=uid(),
            concorrente_id=conc_id, edital_id=edital.id,
            preco_proposto=Decimal(str(round(70000 + i * 5000, 2))),
            posicao_final=(i % 3) + 1,
            fonte='manual',
            created_at=now() - timedelta(days=30 - i * 5),
        ))
        created += 1
    return created


def seed_rp3x_precos(db, rp3x_empresa_id):
    editais = db.query(Edital).filter(
        Edital.empresa_id == rp3x_empresa_id
    ).limit(5).all()
    if not editais:
        print("  ! Sem editais RP3X para precos")
        return 0

    resultados = ['vitoria', 'vitoria', 'derrota', 'derrota', 'cancelado']
    created = 0
    for i, resultado in enumerate(resultados):
        edital = editais[i % len(editais)]
        nosso = Decimal(str(round(75000 + i * 4000, 2)))
        vencedor = nosso * Decimal('0.95') if resultado == 'derrota' else nosso

        existing = db.query(PrecoHistorico).filter(
            PrecoHistorico.edital_id == edital.id,
            PrecoHistorico.user_id == VALIDA2_USER_ID,
            PrecoHistorico.nosso_preco == nosso,
        ).first()
        if existing:
            continue

        db.add(PrecoHistorico(
            id=uid(), user_id=VALIDA2_USER_ID, empresa_id=rp3x_empresa_id,
            edital_id=edital.id,
            nosso_preco=nosso,
            preco_vencedor=vencedor if resultado != 'cancelado' else None,
            empresa_vencedora="TechSolucoes Gov" if resultado == 'derrota' else "RP3X",
            resultado=resultado,
            data_homologacao=date.today() - timedelta(days=60 - i * 10),
            fonte='manual',
        ))
        created += 1
    return created


def seed_rp3x_feedbacks(db, rp3x_empresa_id):
    tipos = ['resultado_edital', 'resultado_edital', 'score_ajustado', 'preco_ajustado', 'feedback_usuario']
    created = 0
    for i, tipo in enumerate(tipos):
        entidade = 'edital' if tipo != 'feedback_usuario' else 'geral'
        existing = db.query(AprendizadoFeedback).filter(
            AprendizadoFeedback.user_id == VALIDA2_USER_ID,
            AprendizadoFeedback.tipo_evento == tipo,
            AprendizadoFeedback.entidade == entidade,
        ).first()
        if existing:
            continue
        db.add(AprendizadoFeedback(
            id=uid(), user_id=VALIDA2_USER_ID, empresa_id=rp3x_empresa_id,
            tipo_evento=tipo,
            entidade=entidade,
            dados_entrada={"score": 55 + i},
            resultado_real={"score": 60 + i},
            delta={"score_delta": 5},
            aplicado=i % 2 == 0,
            created_at=now() - timedelta(days=20 - i * 3),
        ))
        created += 1
    return created


def seed_rp3x_sugestoes(db, rp3x_empresa_id):
    sugestoes_data = [
        ("estrategia", "Priorizar pregoes eletronicos DF",
         "Melhor taxa de vitoria em editais federais do DF.",
         Decimal('78'), "pendente", None),
        ("margem", "Margem competitiva em sistemas web",
         "Reduzir margem em 5% para sistemas web aumentaria participacao.",
         Decimal('65'), "aceita", None),
    ]
    created = 0
    for tipo, titulo, desc, conf, status, motivo in sugestoes_data:
        existing = already_seeded(db, SugestaoIA, titulo=titulo, user_id=VALIDA2_USER_ID)
        if existing:
            existing.status = status
            existing.rejeitado_motivo = motivo
            continue
        db.add(SugestaoIA(
            id=uid(), user_id=VALIDA2_USER_ID, empresa_id=rp3x_empresa_id,
            tipo=tipo, titulo=titulo, descricao=desc,
            confianca=conf, base_dados_count=5,
            acao_sugerida=f"Implementar: {titulo}",
            status=status, rejeitado_motivo=motivo,
            created_at=now() - timedelta(days=5),
        ))
        created += 1
    return created


def seed_rp3x_padroes(db, rp3x_empresa_id):
    padroes_data = [
        ("correlacao", "Editais federais tem margem 15% maior",
         "Correlacao entre tipo federal e valor medio em TI.",
         Decimal('78'), {"federal_premium": 15, "amostra": 12}),
        ("tendencia_preco", "Precos de TI subindo 5% ao semestre",
         "Tendencia de alta emergente em servicos de TI governamental.",
         Decimal('55'), {"taxa_semestral": 5.0, "segmento": "TI"}),
    ]
    created = 0
    for tipo, titulo, desc, conf, dados in padroes_data:
        if already_seeded(db, PadraoDetectado, titulo=titulo, user_id=VALIDA2_USER_ID):
            continue
        db.add(PadraoDetectado(
            id=uid(), user_id=VALIDA2_USER_ID, empresa_id=rp3x_empresa_id,
            tipo=tipo, titulo=titulo, descricao=desc,
            confianca=conf, base_dados_count=12,
            dados_json=dados, ativo=True,
            created_at=now() - timedelta(days=5),
            updated_at=now() - timedelta(days=5),
        ))
        created += 1
    return created


def seed_rp3x_intrusos(db, rp3x_empresa_id):
    editais = db.query(Edital).filter(
        Edital.empresa_id == rp3x_empresa_id
    ).limit(1).all()
    if not editais:
        print("  ! Sem editais RP3X para intrusos")
        return 0

    desc = "Servidor de rack 2U com 128GB RAM"
    if already_seeded(db, ItemIntruso, descricao_item=desc, edital_id=editais[0].id):
        return 0

    db.add(ItemIntruso(
        id=uid(), user_id=VALIDA2_USER_ID, empresa_id=rp3x_empresa_id,
        edital_id=editais[0].id,
        descricao_item=desc, ncm="8471.49.90",
        valor=Decimal('65000.00'), percentual_edital=Decimal('8.50'),
        criticidade='medio',
        acao_sugerida="Hardware fora do escopo de software. Avaliar parceria com fornecedor.",
        created_at=now() - timedelta(days=3),
    ))
    return 1


# ==================== MAIN ====================

def run_seed():
    db = SessionLocal()
    try:
        print(f"\n{'='*60}")
        print(f"  SEED SPRINT 7 — Mercado, Analytics, Aprendizado")
        print(f"{'='*60}\n")

        # ── CH Hospitalar ──
        print("CH Hospitalar (valida1):")

        n, conc_ids = seed_ch_concorrentes(db)
        print(f"  Concorrentes: {n} criados ({len(conc_ids)} total)")

        n = seed_ch_participacoes(db, conc_ids)
        print(f"  Participacoes: {n} criadas")

        n = seed_ch_precos(db)
        print(f"  Precos Historicos: {n} criados")

        n = seed_ch_feedbacks(db)
        print(f"  Feedbacks: {n} criados")

        n = seed_ch_sugestoes(db)
        print(f"  Sugestoes IA: {n} criadas")

        n = seed_ch_padroes(db)
        print(f"  Padroes Detectados: {n} criados")

        n = seed_ch_intrusos(db)
        print(f"  Itens Intrusos: {n} criados")

        db.flush()

        # ── RP3X ──
        rp3x_empresa_id = get_rp3x_empresa_id(db)
        if not rp3x_empresa_id:
            print("\n  ! RP3X empresa nao encontrada, pulando seed RP3X")
        else:
            print(f"\nRP3X (valida2) — empresa_id={rp3x_empresa_id}:")

            n, conc_ids_rp = seed_rp3x_concorrentes(db, rp3x_empresa_id)
            print(f"  Concorrentes: {n} criados ({len(conc_ids_rp)} total)")

            n = seed_rp3x_participacoes(db, conc_ids_rp, rp3x_empresa_id)
            print(f"  Participacoes: {n} criadas")

            n = seed_rp3x_precos(db, rp3x_empresa_id)
            print(f"  Precos Historicos: {n} criados")

            n = seed_rp3x_feedbacks(db, rp3x_empresa_id)
            print(f"  Feedbacks: {n} criados")

            n = seed_rp3x_sugestoes(db, rp3x_empresa_id)
            print(f"  Sugestoes IA: {n} criadas")

            n = seed_rp3x_padroes(db, rp3x_empresa_id)
            print(f"  Padroes Detectados: {n} criados")

            n = seed_rp3x_intrusos(db, rp3x_empresa_id)
            print(f"  Itens Intrusos: {n} criados")

        db.commit()
        print(f"\n{'='*60}")
        print(f"  SEED SPRINT 7 CONCLUIDO COM SUCESSO")
        print(f"{'='*60}\n")

    except Exception as e:
        db.rollback()
        print(f"\n  ERRO no seed: {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
