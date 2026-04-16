"""
Seed Sprint 5 V3 — popula dados mínimos para os 26 UCs revelarem tela com dados reais.

Execução: cd backend && python -m seeds.sprint5_seed

Idempotente: usa marcador textual (observacoes='SPRINT5_SEED') para detectar linhas já criadas
e não duplica.

Cobre (CH Hospitalar — valida1):
  - Preenche 6 contratos NULL existentes com dados
  - Cria 5 contratos-tier adicionais (30d/90d/em_tratativa/renovado/nao_renovado)
  - Cria 2 empenhos + 6 itens (1 calibrador sem valor) + 6 faturas
  - Cria entregas (inclui 1 atrasada) vinculadas a itens+faturas
  - Aditivos, designações, atividades fiscais, ARP saldos
  - CRM parametrizações (28 defaults via insert direto)
  - Pipeline stages em 13 editais (cobre os 13 stages)
  - 6 CRM agenda items
  - 4 edital_decisoes (2 nao_participacao + 2 perda)
  - Distribui editais em mais UFs se necessário

Cobre (RP3X — valida2):
  - Cria empresa RP3X + vínculo UsuarioEmpresa + ParametroScore
  - 2 produtos (reagentes)
  - Subset mínimo equivalente para RP3X (menor escala — 15 editais, 4 contratos, 2 empenhos)
"""
import sys
import os
import uuid
from datetime import datetime, date, timedelta
from decimal import Decimal

# Permite execução via: python seeds/sprint5_seed.py
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import (
    SessionLocal,
    User, Empresa, UsuarioEmpresa, ParametroScore, Produto,
    Edital, Contrato, ContratoEntrega,
    ContratoAditivo, ContratoDesignacao, AtividadeFiscal, ARPSaldo,
    AtaConsultada,
    Empenho, EmpenhoItem, EmpenhoFatura,
    CRMParametrizacao, EditalDecisao, CRMAgendaItem,
    Proposta,
)

SEED_MARK = "SPRINT5_SEED"

# IDs verificados 2026-04-10
VALIDA1_USER_ID = "45fae79e-27dc-46e4-9b74-ed054ad3b7b1"
VALIDA2_USER_ID = "edc4ab79-8fae-4ae1-a3da-d652f8bf5720"
CH_EMPRESA_ID = "7dbdc60a-b806-4614-a024-a1d4841dc8c9"

# ==================== CONSTANTES ====================

PIPELINE_STAGES = [
    "captado_nao_divulgado", "captado_divulgado", "em_analise", "lead_potencial",
    "monitoramento_concorrencia", "em_impugnacao", "fase_propostas", "proposta_submetida",
    "espera_resultado", "ganho_provisorio", "processo_recurso", "contra_razao",
    "resultado_definitivo",
]

CRM_PARAMS_DEFAULT = {
    "tipo_edital": [
        "Pregão Eletrônico", "Pregão Presencial", "Concorrência", "Dispensa",
        "Inexigibilidade", "Chamamento Público", "RDC", "Tomada de Preços",
    ],
    "agrupamento_portfolio": [
        "Hematologia", "Bioquímica", "Imunologia", "Microbiologia",
        "Parasitologia", "Urinálise", "Coagulação", "Hormônios",
        "Gasometria", "Glicemia", "PCR/Biomol", "Infusão",
        "Monitorização",
    ],
    "motivo_derrota": [
        "Preço não competitivo", "Especificação técnica",
        "Documentação incompleta", "Prazo de entrega",
        "Concorrente com relacionamento", "Falha operacional interna",
        "Edital direcionado",
    ],
}


def uid():
    return str(uuid.uuid4())


def today():
    return date(2026, 4, 10)


def now():
    return datetime(2026, 4, 10, 9, 0, 0)


# ==================== HELPERS ====================

def marked(obs):
    return (obs or "") + f" [{SEED_MARK}]"


def already_seeded(db, model, **filters):
    """Retorna primeira linha que bate nos filtros ou None."""
    return db.query(model).filter_by(**filters).first()


# ==================== SEED — CH HOSPITALAR ====================

def seed_ch_contratos_tiers(db):
    """Cria 5 contratos em tiers p/ UC-CT09 (contratos a vencer)."""
    tiers = [
        ("CTR-CH-2026-V30", date(2026, 5, 5), None, None, 420000, "SES-MG", "Reagentes hematológicos"),
        ("CTR-CH-2026-V90", date(2026, 6, 25), None, None, 680000, "HC-FMUSP", "Kit glicose"),
        ("CTR-CH-2026-TR", date(2026, 4, 25), "em_tratativa", None, 380000, "INCA", "Monitorização"),
        ("CTR-CH-2026-RN", date(2026, 5, 20), "renovado", date(2026, 4, 1), 520000, "Hospital Sírio", "Analisador"),
        ("CTR-CH-2026-NR", date(2026, 4, 30), "nao_renovado", None, 290000, "Prefeitura BH", "Insumos"),
    ]
    created = 0
    for num, dfim, trat, drenov, valor, orgao, obj in tiers:
        if already_seeded(db, Contrato, numero_contrato=num):
            continue
        db.add(Contrato(
            id=uid(),
            user_id=VALIDA1_USER_ID,
            empresa_id=CH_EMPRESA_ID,
            numero_contrato=num,
            orgao=orgao,
            objeto=obj,
            valor_total=Decimal(valor),
            data_assinatura=date(2025, 5, 10),
            data_inicio=date(2025, 6, 1),
            data_fim=dfim,
            status="vigente",
            tratativa_status=trat,
            data_renovacao=drenov,
            observacoes=marked("Contrato tier"),
        ))
        created += 1
    return created


def fill_ch_null_contratos(db):
    """Preenche os 6 contratos da CH que estão com campos NULL."""
    nulls = db.query(Contrato).filter(
        Contrato.empresa_id == CH_EMPRESA_ID,
        Contrato.numero_contrato.is_(None),
    ).all()
    orgaos = ["Hospital das Clínicas", "HEMOMINAS", "UFMG Hospital", "SES-SP", "Santa Casa BH", "Fundação Hemope"]
    filled = 0
    for i, c in enumerate(nulls[:6]):
        c.numero_contrato = f"CTR-2025-00{90+i}"
        c.orgao = orgaos[i % len(orgaos)]
        c.objeto = f"Fornecimento de reagentes hemograma - lote {i+1}"
        c.valor_total = Decimal(str(350000 + i * 40000))
        c.data_assinatura = date(2025, 3, 15 + i)
        c.data_inicio = date(2025, 4, 1)
        c.data_fim = date(2026, 12, 31)
        c.status = "vigente"
        filled += 1
    return filled


def seed_ch_empenhos(db):
    """Cria 2 empenhos para CH com itens e faturas."""
    # Contrato alvo: CTR-2025-0087 (já existente completo)
    ctr = db.query(Contrato).filter_by(
        empresa_id=CH_EMPRESA_ID, numero_contrato="CTR-2025-0087"
    ).first()
    if not ctr:
        # fallback: primeiro contrato com numero da CH
        ctr = db.query(Contrato).filter(
            Contrato.empresa_id == CH_EMPRESA_ID,
            Contrato.numero_contrato.isnot(None),
        ).first()
    if not ctr:
        print("  ! Nenhum contrato CH disponível para empenho")
        return 0, 0, 0, 0

    created_emp = created_it = created_fat = created_ent = 0

    # Empenho 1: Global R$960k no contrato principal
    if not already_seeded(db, Empenho, numero_empenho="EMPH-2026-0001"):
        e1 = Empenho(
            id=uid(),
            contrato_id=ctr.id,
            user_id=VALIDA1_USER_ID,
            empresa_id=CH_EMPRESA_ID,
            numero_empenho="EMPH-2026-0001",
            tipo="global",
            valor_empenhado=Decimal("960000"),
            data_empenho=date(2026, 4, 1),
            fonte_recurso="Tesouro Federal",
            natureza_despesa="33.90.30",
            status="ativo",
            observacoes=marked("Empenho global principal"),
        )
        db.add(e1)
        db.flush()
        created_emp += 1

        # Itens
        itens_data = [
            ("Analisador Mindray BS-240", 1, 850000, True, None),
            ("Reagentes hemograma (caixa c/ 100 testes)", 100, 800, True, None),
            ("Calibradores e Controles de Qualidade", 50, 0, False, 120.0),
        ]
        item_ids = []
        for desc, qty, unit, gera, lim in itens_data:
            it = EmpenhoItem(
                id=uid(),
                empenho_id=e1.id,
                descricao=desc,
                quantidade=Decimal(str(qty)),
                valor_unitario=Decimal(str(unit)),
                valor_total=Decimal(str(qty * unit)),
                gera_valor=gera,
                limite_consumo_pct=lim,
            )
            db.add(it)
            db.flush()
            item_ids.append(it.id)
            created_it += 1

        # Faturas
        faturas_data = [
            ("NF-001/2026", 320000, date(2026, 4, 1), date(2026, 4, 1), "paga"),
            ("NF-002/2026", 320000, date(2026, 5, 1), None, "pendente"),
            ("NF-003/2026", 320000, date(2026, 6, 1), None, "pendente"),
        ]
        fat_ids = []
        for numf, val, emi, pag, st in faturas_data:
            f = EmpenhoFatura(
                id=uid(),
                empenho_id=e1.id,
                user_id=VALIDA1_USER_ID,
                numero_fatura=numf,
                valor_fatura=Decimal(str(val)),
                data_emissao=emi,
                data_vencimento=emi + timedelta(days=30),
                data_pagamento=pag,
                nota_fiscal=numf,
                status=st,
                observacoes=marked(""),
            )
            db.add(f)
            db.flush()
            fat_ids.append(f.id)
            created_fat += 1

        # Entregas (1 atrasada → divergência)
        entregas_data = [
            ("Entrega analisador", 1, 850000, date(2026, 4, 5), date(2026, 4, 6), "entregue", item_ids[0], fat_ids[0]),
            ("Entrega reagentes lote 1", 40, 800, date(2026, 4, 20), date(2026, 4, 19), "entregue", item_ids[1], fat_ids[1]),
            ("Entrega reagentes lote 2", 30, 800, date(2026, 5, 15), date(2026, 5, 16), "entregue", item_ids[1], fat_ids[1]),
            ("Entrega controles Q1", 20, 0, date(2026, 4, 30), None, "atrasado", item_ids[2], None),
        ]
        for desc, qty, unit, dprev, dreal, st, iid, fid in entregas_data:
            db.add(ContratoEntrega(
                id=uid(),
                contrato_id=ctr.id,
                descricao=desc,
                quantidade=Decimal(str(qty)),
                valor_unitario=Decimal(str(unit)),
                valor_total=Decimal(str(qty * unit)),
                data_prevista=dprev,
                data_realizada=dreal,
                status=st,
                empenho_item_id=iid,
                fatura_id=fid,
                numero_empenho="EMPH-2026-0001",
                observacoes=marked(""),
            ))
            created_ent += 1

    # Empenho 2: Ordinário em outro contrato
    ctr2 = db.query(Contrato).filter(
        Contrato.empresa_id == CH_EMPRESA_ID,
        Contrato.numero_contrato.isnot(None),
        Contrato.numero_contrato != "CTR-2025-0087",
    ).first()
    if ctr2 and not already_seeded(db, Empenho, numero_empenho="EMPH-2026-0002"):
        e2 = Empenho(
            id=uid(),
            contrato_id=ctr2.id,
            user_id=VALIDA1_USER_ID,
            empresa_id=CH_EMPRESA_ID,
            numero_empenho="EMPH-2026-0002",
            tipo="ordinario",
            valor_empenhado=Decimal("450000"),
            data_empenho=date(2026, 4, 3),
            fonte_recurso="Recursos Próprios",
            natureza_despesa="33.90.30",
            status="ativo",
            observacoes=marked("Empenho ordinário secundário"),
        )
        db.add(e2)
        db.flush()
        created_emp += 1

        itens2 = [
            ("Monitor Mindray iMEC10", 3, 150000, True, None),
            ("Kit Infusor descartável", 500, 0, False, 110.0),
            ("Calibração anual sensores", 1, 0, False, 100.0),
        ]
        for desc, qty, unit, gera, lim in itens2:
            db.add(EmpenhoItem(
                id=uid(),
                empenho_id=e2.id,
                descricao=desc,
                quantidade=Decimal(str(qty)),
                valor_unitario=Decimal(str(unit)),
                valor_total=Decimal(str(qty * unit)),
                gera_valor=gera,
                limite_consumo_pct=lim,
            ))
            created_it += 1

        faturas2 = [
            ("NF-100/2026", 150000, date(2026, 4, 10), date(2026, 4, 10), "paga"),
            ("NF-101/2026", 300000, date(2026, 5, 10), None, "pendente"),
            ("NF-102/2026", 0, date(2026, 4, 15), None, "pendente"),
        ]
        for numf, val, emi, pag, st in faturas2:
            db.add(EmpenhoFatura(
                id=uid(),
                empenho_id=e2.id,
                user_id=VALIDA1_USER_ID,
                numero_fatura=numf,
                valor_fatura=Decimal(str(val)),
                data_emissao=emi,
                data_vencimento=emi + timedelta(days=30),
                data_pagamento=pag,
                nota_fiscal=numf,
                status=st,
                observacoes=marked(""),
            ))
            created_fat += 1

    return created_emp, created_it, created_fat, created_ent


def seed_ch_aditivos_designacoes(db):
    """Cria aditivos, designações, atividades, ARP saldos."""
    ctr = db.query(Contrato).filter_by(
        empresa_id=CH_EMPRESA_ID, numero_contrato="CTR-2025-0087"
    ).first()
    if not ctr:
        return 0, 0, 0, 0

    aditivos_created = designacoes_created = atividades_created = arps_created = 0

    # Aditivo
    if not already_seeded(db, ContratoAditivo, contrato_id=ctr.id):
        db.add(ContratoAditivo(
            id=uid(),
            contrato_id=ctr.id,
            user_id=VALIDA1_USER_ID,
            tipo="prazo",
            justificativa="Prorrogação de 180 dias conforme Art. 124 Lei 14.133/2021 por necessidade comprovada de continuidade do fornecimento",
            valor_original=960000.0,
            valor_aditivo=0.0,
            percentual=0.0,
            data_aditivo=datetime(2026, 3, 20),
            nova_data_fim=datetime(2027, 6, 30),
            fundamentacao_legal="Lei 14.133/2021 Art. 124",
            status="vigente",
            observacoes=marked(""),
        ))
        aditivos_created += 1

    # Designações
    desigs = [
        ("gestor", "Dr. Carlos Henrique Silva", "Gestor de Contratos", "123.456.789-00", "PRT-001/2025"),
        ("fiscal_tecnico", "Enf. Maria Beatriz Rocha", "Fiscal Técnico", "987.654.321-00", "PRT-002/2025"),
    ]
    designacao_ids = []
    for tipo, nome, cargo, cpf, portaria in desigs:
        existing = db.query(ContratoDesignacao).filter_by(
            contrato_id=ctr.id, tipo=tipo, nome=nome
        ).first()
        if existing:
            designacao_ids.append(existing.id)
            continue
        d = ContratoDesignacao(
            id=uid(),
            contrato_id=ctr.id,
            user_id=VALIDA1_USER_ID,
            tipo=tipo,
            nome=nome,
            cargo=cargo,
            cpf=cpf,
            portaria_numero=portaria,
            data_inicio=datetime(2025, 6, 1),
            ativo=True,
            observacoes=marked(""),
        )
        db.add(d)
        db.flush()
        designacao_ids.append(d.id)
        designacoes_created += 1

    # Atividade fiscal
    if designacao_ids:
        existing_af = db.query(AtividadeFiscal).filter_by(designacao_id=designacao_ids[0]).first()
        if not existing_af:
            db.add(AtividadeFiscal(
                id=uid(),
                designacao_id=designacao_ids[1] if len(designacao_ids) > 1 else designacao_ids[0],
                user_id=VALIDA1_USER_ID,
                tipo="vistoria",
                descricao="Vistoria de recebimento do analisador Mindray BS-240 — equipamento instalado e operante.",
                data_atividade=datetime(2026, 4, 6),
                status="registrado",
            ))
            atividades_created += 1

    # ARP saldo — requer ata_consultada
    ata = db.query(AtaConsultada).filter_by(user_id=VALIDA1_USER_ID).first()
    if ata and not db.query(ARPSaldo).filter_by(ata_id=ata.id).first():
        db.add(ARPSaldo(
            id=uid(),
            ata_id=ata.id,
            user_id=VALIDA1_USER_ID,
            item_descricao="Kit Hemograma Sysmex XN - 100 testes",
            catmat_catser="287435",
            quantidade_registrada=Decimal("1000"),
            consumido_participante=Decimal("320"),
            consumido_carona=Decimal("80"),
            saldo_disponivel=Decimal("600"),
            valor_unitario=Decimal("850"),
        ))
        arps_created += 1

    return aditivos_created, designacoes_created, atividades_created, arps_created


def seed_ch_crm_parametrizacoes(db):
    """Insere direto no banco as 28 parametrizações default para CH."""
    created = 0
    for tipo, valores in CRM_PARAMS_DEFAULT.items():
        for idx, valor in enumerate(valores):
            existing = db.query(CRMParametrizacao).filter_by(
                empresa_id=CH_EMPRESA_ID, tipo=tipo, valor=valor
            ).first()
            if existing:
                continue
            db.add(CRMParametrizacao(
                id=uid(),
                empresa_id=CH_EMPRESA_ID,
                user_id=VALIDA1_USER_ID,
                tipo=tipo,
                valor=valor,
                ordem=idx,
                ativo=True,
            ))
            created += 1
    return created


def seed_ch_pipeline_stages(db):
    """Distribui pipeline_stage nos editais da CH para cobrir todos os 13 stages."""
    editais = db.query(Edital).filter_by(empresa_id=CH_EMPRESA_ID).order_by(Edital.created_at).all()
    if len(editais) < 13:
        return 0

    # Distribuição: 2 captado_nao_divulgado, 3 captado_divulgado, 3 em_analise, 2 lead_potencial,
    # 2 monitoramento, 2 em_impugnacao, 3 fase_propostas, 2 proposta_submetida, 2 espera_resultado,
    # 2 ganho_provisorio, 2 processo_recurso, 1 contra_razao, 2 resultado_definitivo = 28
    plan = (
        ["captado_nao_divulgado"] * 2 +
        ["captado_divulgado"] * 3 +
        ["em_analise"] * 3 +
        ["lead_potencial"] * 2 +
        ["monitoramento_concorrencia"] * 2 +
        ["em_impugnacao"] * 2 +
        ["fase_propostas"] * 3 +
        ["proposta_submetida"] * 2 +
        ["espera_resultado"] * 2 +
        ["ganho_provisorio"] * 2 +
        ["processo_recurso"] * 2 +
        ["contra_razao"] * 1 +
        ["resultado_definitivo"] * 2
    )
    updated = 0
    for ed, stage in zip(editais, plan):
        if ed.pipeline_stage != stage:
            ed.pipeline_stage = stage
            ed.pipeline_tipo_venda = "recorrente" if updated % 2 == 0 else "pontual"
            updated += 1
    return updated


def seed_ch_agenda(db):
    """Cria 6 itens de agenda p/ UC-CRM04."""
    editais = db.query(Edital).filter_by(empresa_id=CH_EMPRESA_ID).limit(6).all()
    if not editais:
        return 0
    items = [
        ("Apresentação técnica edital SP-PREG-100/2026", "critica", date(2026, 4, 15), "Dr. Carlos Silva", "fase_propostas"),
        ("Impugnação edital GO-MUN-230/2026", "alta", date(2026, 4, 18), "Dra. Ana Lima", "em_impugnacao"),
        ("Prazo recurso edital RS-INST-445/2026", "critica", date(2026, 4, 25), "Dra. Ana Lima", "processo_recurso"),
        ("Followup ganho CTR-2025-0087", "normal", date(2026, 4, 30), "Dr. Carlos Silva", "resultado_definitivo"),
        ("Negociação renovação CTR-CH-2026-V30", "alta", date(2026, 5, 8), "Eng. Paulo Monteiro", None),
        ("Reunião pós-venda trimestral", "baixa", date(2026, 5, 20), "Dr. Carlos Silva", None),
    ]
    created = 0
    for idx, (tit, urg, dt, resp, stage) in enumerate(items):
        existing = db.query(CRMAgendaItem).filter_by(
            empresa_id=CH_EMPRESA_ID, titulo=tit
        ).first()
        if existing:
            continue
        db.add(CRMAgendaItem(
            id=uid(),
            edital_id=editais[idx % len(editais)].id,
            user_id=VALIDA1_USER_ID,
            empresa_id=CH_EMPRESA_ID,
            titulo=tit,
            descricao=f"{tit} - detalhamento agendado",
            responsavel=resp,
            data_limite=datetime.combine(dt, datetime.min.time().replace(hour=14)),
            urgencia=urg,
            pipeline_stage=stage,
            concluido=False,
        ))
        created += 1
    return created


def seed_ch_decisoes(db):
    """4 decisões (2 nao_participacao + 2 perda) p/ UC-CRM06/07."""
    # Carrega motivos do CRM
    motivos = db.query(CRMParametrizacao).filter_by(
        empresa_id=CH_EMPRESA_ID, tipo="motivo_derrota", ativo=True
    ).limit(4).all()
    editais = db.query(Edital).filter_by(empresa_id=CH_EMPRESA_ID).offset(5).limit(4).all()
    if len(editais) < 4 or len(motivos) < 2:
        return 0
    decisoes = [
        ("nao_participacao", 0, "Não atende exigência de ME/EPP exclusivo", False),
        ("nao_participacao", 1, "Inviável comercialmente - preço de referência abaixo de custo", False),
        ("perda", 0, "Proposta não atendeu especificação técnica do item principal", False),
        ("perda", 1, "Falha operacional interna - atraso no envio da documentação", True),
    ]
    created = 0
    for idx, (tipo, mot_idx, just, cr) in enumerate(decisoes):
        ed = editais[idx]
        if db.query(EditalDecisao).filter_by(edital_id=ed.id, tipo=tipo).first():
            continue
        mot = motivos[mot_idx % len(motivos)]
        db.add(EditalDecisao(
            id=uid(),
            edital_id=ed.id,
            user_id=VALIDA1_USER_ID,
            empresa_id=CH_EMPRESA_ID,
            tipo=tipo,
            motivo_id=mot.id,
            motivo_texto=mot.valor,
            justificativa=just,
            teve_contra_razao=cr,
            pipeline_stage_anterior=ed.pipeline_stage,
        ))
        created += 1
    return created


# ==================== SEED — RP3X (valida2) ====================

def seed_rp3x_empresa(db):
    """Cria empresa RP3X + vínculo valida2."""
    rp3x = db.query(Empresa).filter_by(cnpj="68.218.593/0001-09").first()
    if rp3x:
        return rp3x.id, False

    rp3x_id = uid()
    db.add(Empresa(
        id=rp3x_id,
        user_id=VALIDA2_USER_ID,
        cnpj="68.218.593/0001-09",
        razao_social="RP3X Comercio e Representacoes Ltda.",
        nome_fantasia="RP3X",
        inscricao_estadual="123.456.789.111",
        regime_tributario="lucro_presumido",
        endereco="Rua das Acácias, 450 - Centro",
        cidade="São Paulo",
        uf="SP",
        cep="01310-100",
        telefone="(11) 3456-7890",
        email="contato@rp3x.com.br",
        porte="epp",
        areas_atuacao=["diagnóstico in vitro", "reagentes laboratório"],
        ativo=True,
    ))
    # Vínculo N:N
    db.add(UsuarioEmpresa(
        id=uid(),
        user_id=VALIDA2_USER_ID,
        empresa_id=rp3x_id,
        papel="admin",
        ativo=True,
    ))
    # ParametroScore
    existing_ps = db.query(ParametroScore).filter_by(user_id=VALIDA2_USER_ID).first()
    if not existing_ps:
        db.add(ParametroScore(
            id=uid(),
            user_id=VALIDA2_USER_ID,
            empresa_id=rp3x_id,
            peso_tecnico=0.30,
            peso_comercial=0.10,
            peso_documental=0.25,
            peso_complexidade=0.05,
            peso_juridico=0.20,
            peso_logistico=0.10,
            markup_padrao=35.0,
            custos_fixos=42000.0,
            frete_base=180.0,
        ))
    return rp3x_id, True


def seed_rp3x_produtos(db, rp3x_id):
    """2 produtos reagentes."""
    produtos_data = [
        ("Kit Hemograma Sysmex XN", "reagente"),
        ("Kit Glicose Wiener BioGlic-100", "reagente"),
    ]
    created = 0
    for nome, cat in produtos_data:
        if db.query(Produto).filter_by(empresa_id=rp3x_id, nome=nome).first():
            continue
        db.add(Produto(
            id=uid(),
            user_id=VALIDA2_USER_ID,
            empresa_id=rp3x_id,
            nome=nome,
            descricao=f"{nome} - kit completo para análises laboratoriais",
            categoria=cat,
            fabricante="Sysmex" if "Sysmex" in nome else "Wiener",
            preco_referencia=Decimal("1800") if "Sysmex" in nome else Decimal("220"),
        ))
        created += 1
    return created


def seed_rp3x_editais(db, rp3x_id):
    """15 editais distribuídos em 6 UFs p/ RP3X."""
    ufs = ["SP", "RJ", "MG", "RS", "PR", "BA"]
    stages = (
        ["captado_nao_divulgado"] * 1 +
        ["captado_divulgado"] * 2 +
        ["em_analise"] * 2 +
        ["lead_potencial"] * 2 +
        ["monitoramento_concorrencia"] * 1 +
        ["em_impugnacao"] * 1 +
        ["fase_propostas"] * 2 +
        ["proposta_submetida"] * 1 +
        ["espera_resultado"] * 1 +
        ["ganho_provisorio"] * 1 +
        ["processo_recurso"] * 1
    )
    created = 0
    for i in range(15):
        numero = f"RP3X-ED-{2026}-{100+i}"
        if db.query(Edital).filter_by(numero=numero, empresa_id=rp3x_id).first():
            continue
        db.add(Edital(
            id=uid(),
            user_id=VALIDA2_USER_ID,
            empresa_id=rp3x_id,
            numero=numero,
            orgao=f"Secretaria de Saúde - {ufs[i % 6]}",
            orgao_tipo="estadual",
            uf=ufs[i % 6],
            cidade="Capital",
            objeto=f"Fornecimento de reagentes laboratoriais - Lote {i+1}",
            modalidade="pregao_eletronico",
            categoria="consumo_reagentes",
            valor_referencia=Decimal(str(150000 + i * 25000)),
            data_publicacao=date(2026, 3, 1) + timedelta(days=i),
            data_abertura=datetime(2026, 4, 15 + (i % 10), 10, 0),
            status="novo",
            pipeline_stage=stages[i] if i < len(stages) else "captado_divulgado",
            pipeline_tipo_venda="pontual" if i % 2 == 0 else "recorrente",
            fonte="PNCP",
        ))
        created += 1
    return created


def seed_rp3x_contratos_empenhos(db, rp3x_id):
    """4 contratos RP3X + 2 empenhos com itens/faturas + tiers."""
    tiers = [
        ("CTR-RP-2026-V30", date(2026, 5, 5), None, None, 260000, "HC-USP"),
        ("CTR-RP-2026-V90", date(2026, 6, 25), None, None, 410000, "HC-UFMG"),
        ("CTR-RP-2026-TR", date(2026, 4, 28), "em_tratativa", None, 190000, "HGVC-SP"),
        ("CTR-RP-2026-RN", date(2026, 5, 22), "renovado", date(2026, 4, 2), 315000, "HFA Brasília"),
        ("CTR-RP-2026-NR", date(2026, 5, 2), "nao_renovado", None, 150000, "HC-FMRP"),
    ]
    created_c = 0
    for num, dfim, trat, drenov, valor, orgao in tiers:
        if db.query(Contrato).filter_by(numero_contrato=num).first():
            continue
        db.add(Contrato(
            id=uid(),
            user_id=VALIDA2_USER_ID,
            empresa_id=rp3x_id,
            numero_contrato=num,
            orgao=orgao,
            objeto="Reagentes laboratoriais",
            valor_total=Decimal(str(valor)),
            data_assinatura=date(2025, 6, 10),
            data_inicio=date(2025, 7, 1),
            data_fim=dfim,
            status="vigente",
            tratativa_status=trat,
            data_renovacao=drenov,
            observacoes=marked(""),
        ))
        created_c += 1

    # Contrato base para empenhos
    ctr_base = db.query(Contrato).filter_by(
        empresa_id=rp3x_id, numero_contrato="CTR-2026-RP3X-001"
    ).first()
    if not ctr_base:
        ctr_base_id = uid()
        ctr_base = Contrato(
            id=ctr_base_id,
            user_id=VALIDA2_USER_ID,
            empresa_id=rp3x_id,
            numero_contrato="CTR-2026-RP3X-001",
            orgao="Hospital das Clínicas - FMUSP",
            objeto="Comodato de analisador hematológico + reagentes",
            valor_total=Decimal("480000"),
            data_assinatura=date(2026, 2, 15),
            data_inicio=date(2026, 3, 1),
            data_fim=date(2027, 3, 1),
            status="vigente",
            observacoes=marked(""),
        )
        db.add(ctr_base)
        db.flush()
        created_c += 1

    created_e = created_it = created_fat = 0
    if not db.query(Empenho).filter_by(numero_empenho="EMPH-2026-RP3X-001").first():
        e = Empenho(
            id=uid(),
            contrato_id=ctr_base.id,
            user_id=VALIDA2_USER_ID,
            empresa_id=rp3x_id,
            numero_empenho="EMPH-2026-RP3X-001",
            tipo="global",
            valor_empenhado=Decimal("480000"),
            data_empenho=date(2026, 4, 1),
            fonte_recurso="Tesouro Estadual",
            natureza_despesa="33.90.30",
            status="ativo",
            observacoes=marked(""),
        )
        db.add(e)
        db.flush()
        created_e += 1

        itens = [
            ("Kit Hemograma Sysmex XN (caixa c/ 100)", 200, 1800, True, None),
            ("Kit Glicose Wiener BioGlic-100", 500, 220, True, None),
            ("Controles de qualidade hematológicos", 100, 0, False, 110.0),
        ]
        for desc, qty, unit, gera, lim in itens:
            db.add(EmpenhoItem(
                id=uid(),
                empenho_id=e.id,
                descricao=desc,
                quantidade=Decimal(str(qty)),
                valor_unitario=Decimal(str(unit)),
                valor_total=Decimal(str(qty * unit)),
                gera_valor=gera,
                limite_consumo_pct=lim,
            ))
            created_it += 1

        faturas = [
            ("NF-R01/2026", 180000, date(2026, 4, 5), date(2026, 4, 5), "paga"),
            ("NF-R02/2026", 150000, date(2026, 5, 5), None, "pendente"),
            ("NF-R03/2026", 150000, date(2026, 6, 5), None, "pendente"),
        ]
        for numf, val, emi, pag, st in faturas:
            db.add(EmpenhoFatura(
                id=uid(),
                empenho_id=e.id,
                user_id=VALIDA2_USER_ID,
                numero_fatura=numf,
                valor_fatura=Decimal(str(val)),
                data_emissao=emi,
                data_vencimento=emi + timedelta(days=30),
                data_pagamento=pag,
                nota_fiscal=numf,
                status=st,
            ))
            created_fat += 1

    return created_c, created_e, created_it, created_fat


def seed_rp3x_crm(db, rp3x_id):
    """Parametrizações, agenda, decisões RP3X."""
    params_created = 0
    for tipo, valores in CRM_PARAMS_DEFAULT.items():
        for idx, valor in enumerate(valores):
            if db.query(CRMParametrizacao).filter_by(
                empresa_id=rp3x_id, tipo=tipo, valor=valor
            ).first():
                continue
            db.add(CRMParametrizacao(
                id=uid(),
                empresa_id=rp3x_id,
                user_id=VALIDA2_USER_ID,
                tipo=tipo,
                valor=valor,
                ordem=idx,
                ativo=True,
            ))
            params_created += 1

    db.flush()

    # Agenda
    editais_rp = db.query(Edital).filter_by(empresa_id=rp3x_id).limit(6).all()
    agenda_items = [
        ("Visita técnica edital MG - Reagentes", "alta", date(2026, 4, 16)),
        ("Impugnação edital BA", "critica", date(2026, 4, 22)),
        ("Elaboração recurso edital SP", "critica", date(2026, 4, 28)),
        ("Apresentação de ensaio reagentes", "normal", date(2026, 5, 5)),
        ("Renovação CTR-RP-2026-V30", "alta", date(2026, 5, 10)),
        ("Treinamento cliente HC", "baixa", date(2026, 5, 25)),
    ]
    agenda_created = 0
    for idx, (tit, urg, dt) in enumerate(agenda_items):
        if db.query(CRMAgendaItem).filter_by(empresa_id=rp3x_id, titulo=tit).first():
            continue
        db.add(CRMAgendaItem(
            id=uid(),
            edital_id=editais_rp[idx % len(editais_rp)].id if editais_rp else None,
            user_id=VALIDA2_USER_ID,
            empresa_id=rp3x_id,
            titulo=tit,
            descricao=tit,
            responsavel="Equipe RP3X",
            data_limite=datetime.combine(dt, datetime.min.time().replace(hour=10)),
            urgencia=urg,
            concluido=False,
        ))
        agenda_created += 1

    # Decisões
    motivos_rp = db.query(CRMParametrizacao).filter_by(
        empresa_id=rp3x_id, tipo="motivo_derrota", ativo=True
    ).limit(4).all()
    editais_decisao = db.query(Edital).filter_by(empresa_id=rp3x_id).offset(8).limit(4).all()
    decisoes = [
        ("nao_participacao", "Edital exclusivo ME/EPP - não qualificado", False),
        ("nao_participacao", "Logística inviável para UF distante", False),
        ("perda", "Especificação não atendida - Art. 40", False),
        ("perda", "Preço não competitivo - margem insuficiente", True),
    ]
    decisoes_created = 0
    for idx, (tipo, just, cr) in enumerate(decisoes):
        if idx >= len(editais_decisao) or idx >= len(motivos_rp):
            break
        ed = editais_decisao[idx]
        if db.query(EditalDecisao).filter_by(edital_id=ed.id, tipo=tipo).first():
            continue
        mot = motivos_rp[idx]
        db.add(EditalDecisao(
            id=uid(),
            edital_id=ed.id,
            user_id=VALIDA2_USER_ID,
            empresa_id=rp3x_id,
            tipo=tipo,
            motivo_id=mot.id,
            motivo_texto=mot.valor,
            justificativa=just,
            teve_contra_razao=cr,
            pipeline_stage_anterior=ed.pipeline_stage,
        ))
        decisoes_created += 1

    return params_created, agenda_created, decisoes_created


# ==================== MAIN ====================

def main():
    db = SessionLocal()
    try:
        print("=" * 70)
        print("SPRINT 5 V3 SEED — CH Hospitalar (valida1) + RP3X (valida2)")
        print("=" * 70)

        # ─── CH Hospitalar ───
        print("\n[CH Hospitalar / valida1]")
        n = fill_ch_null_contratos(db)
        print(f"  Contratos NULL preenchidos: {n}")

        n = seed_ch_contratos_tiers(db)
        print(f"  Contratos tiers criados: {n}")

        db.flush()
        e, it, fat, ent = seed_ch_empenhos(db)
        print(f"  Empenhos: {e} | Itens: {it} | Faturas: {fat} | Entregas: {ent}")

        a, d, af, arp = seed_ch_aditivos_designacoes(db)
        print(f"  Aditivos: {a} | Designações: {d} | Atividades: {af} | ARP: {arp}")

        n = seed_ch_crm_parametrizacoes(db)
        print(f"  CRM parametrizações: {n}")

        n = seed_ch_pipeline_stages(db)
        print(f"  Pipeline stages atualizados: {n}")

        n = seed_ch_agenda(db)
        print(f"  Agenda CRM: {n}")

        db.flush()
        n = seed_ch_decisoes(db)
        print(f"  Edital decisões: {n}")

        # ─── RP3X ───
        print("\n[RP3X / valida2]")
        rp3x_id, created_new = seed_rp3x_empresa(db)
        print(f"  Empresa RP3X: {'CRIADA' if created_new else 'já existia'} ({rp3x_id})")

        db.flush()
        n = seed_rp3x_produtos(db, rp3x_id)
        print(f"  Produtos: {n}")

        n = seed_rp3x_editais(db, rp3x_id)
        print(f"  Editais: {n}")

        db.flush()
        c, e, it, fat = seed_rp3x_contratos_empenhos(db, rp3x_id)
        print(f"  Contratos: {c} | Empenhos: {e} | Itens: {it} | Faturas: {fat}")

        db.flush()
        p, ag, dc = seed_rp3x_crm(db, rp3x_id)
        print(f"  Params CRM: {p} | Agenda: {ag} | Decisões: {dc}")

        db.commit()

        # ─── Verificação final ───
        print("\n" + "=" * 70)
        print("VERIFICAÇÃO DE COUNTS MÍNIMOS")
        print("=" * 70)

        ch_checks = {
            "empresa CH": db.query(Empresa).filter_by(id=CH_EMPRESA_ID).count(),
            "contratos CH": db.query(Contrato).filter_by(empresa_id=CH_EMPRESA_ID).count(),
            "empenhos CH": db.query(Empenho).filter_by(empresa_id=CH_EMPRESA_ID).count(),
            "empenho_itens CH": db.query(EmpenhoItem).join(Empenho).filter(Empenho.empresa_id == CH_EMPRESA_ID).count(),
            "empenho_faturas CH": db.query(EmpenhoFatura).join(Empenho).filter(Empenho.empresa_id == CH_EMPRESA_ID).count(),
            "crm_params CH": db.query(CRMParametrizacao).filter_by(empresa_id=CH_EMPRESA_ID).count(),
            "crm_agenda CH": db.query(CRMAgendaItem).filter_by(empresa_id=CH_EMPRESA_ID).count(),
            "edital_decisoes CH": db.query(EditalDecisao).filter_by(empresa_id=CH_EMPRESA_ID).count(),
            "editais CH c/ pipeline_stage": db.query(Edital).filter(
                Edital.empresa_id == CH_EMPRESA_ID,
                Edital.pipeline_stage.isnot(None),
            ).count(),
        }

        rp_checks = {
            "empresa RP3X": db.query(Empresa).filter_by(id=rp3x_id).count(),
            "produtos RP3X": db.query(Produto).filter_by(empresa_id=rp3x_id).count(),
            "editais RP3X": db.query(Edital).filter_by(empresa_id=rp3x_id).count(),
            "contratos RP3X": db.query(Contrato).filter_by(empresa_id=rp3x_id).count(),
            "empenhos RP3X": db.query(Empenho).filter_by(empresa_id=rp3x_id).count(),
            "crm_params RP3X": db.query(CRMParametrizacao).filter_by(empresa_id=rp3x_id).count(),
            "crm_agenda RP3X": db.query(CRMAgendaItem).filter_by(empresa_id=rp3x_id).count(),
            "edital_decisoes RP3X": db.query(EditalDecisao).filter_by(empresa_id=rp3x_id).count(),
        }

        mins = {
            "empresa CH": 1, "contratos CH": 10, "empenhos CH": 2, "empenho_itens CH": 6,
            "empenho_faturas CH": 6, "crm_params CH": 28, "crm_agenda CH": 6,
            "edital_decisoes CH": 4, "editais CH c/ pipeline_stage": 13,
            "empresa RP3X": 1, "produtos RP3X": 2, "editais RP3X": 15, "contratos RP3X": 5,
            "empenhos RP3X": 1, "crm_params RP3X": 28, "crm_agenda RP3X": 6,
            "edital_decisoes RP3X": 2,
        }

        print("\nCH Hospitalar:")
        fail = False
        for k, v in ch_checks.items():
            mn = mins.get(k, 0)
            ok = v >= mn
            status = "OK" if ok else "FAIL"
            print(f"  [{status}] {k}: {v} (min {mn})")
            if not ok:
                fail = True

        print("\nRP3X:")
        for k, v in rp_checks.items():
            mn = mins.get(k, 0)
            ok = v >= mn
            status = "OK" if ok else "FAIL"
            print(f"  [{status}] {k}: {v} (min {mn})")
            if not ok:
                fail = True

        if fail:
            print("\n❌ SEED FALHOU — counts abaixo do mínimo")
            sys.exit(1)
        print("\n✅ SEED SPRINT 5 V3 CONCLUÍDO")

    except Exception as e:
        db.rollback()
        print(f"\n❌ ERRO: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()
