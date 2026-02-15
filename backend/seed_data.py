"""
Script para popular tabelas vazias com dados fictícios na área médico-farmacêutica.
Execução: cd backend && python seed_data.py
"""
import uuid
from datetime import datetime, date, timedelta
from decimal import Decimal
from models import (
    engine, SessionLocal,
    Empresa, EmpresaDocumento, EmpresaCertidao, EmpresaResponsavel,
    Edital, EditalRequisito, EditalDocumento, EditalItem,
    Analise, AnaliseDetalhe, Proposta,
    Concorrente, PrecoHistorico, ParticipacaoEdital,
    Alerta, Notificacao,
    Contrato, ContratoEntrega, Recurso,
    LeadCRM, AcaoPosPerda, AuditoriaLog, AprendizadoFeedback,
    ParametroScore, Dispensa, EstrategiaEdital
)

# User ID do Pasteur Jr (usuario principal)
USER_ID = "cda089f1-0963-4e8c-b90d-ab2cf5bfe5f3"

def uid():
    return str(uuid.uuid4())

def seed():
    db = SessionLocal()
    try:
        created = []

        # ─── 1. EMPRESA ────────────────────────────────────────────────────────
        if db.query(Empresa).count() == 0:
            emp_id = uid()
            emp = Empresa(
                id=emp_id, user_id=USER_ID,
                cnpj="12.345.678/0001-90", razao_social="MedLab Diagnósticos Ltda",
                nome_fantasia="MedLab", inscricao_estadual="123.456.789.0012",
                inscricao_municipal="987654", regime_tributario="lucro_presumido",
                endereco="Av. Brasil, 1500 - Funcionários", cidade="Belo Horizonte",
                uf="MG", cep="30130-000", telefone="(31) 3333-4444",
                email="contato@medlab.com.br", porte="epp",
                areas_atuacao=["diagnóstico laboratorial", "equipamentos médicos", "reagentes"],
                ativo=True,
            )
            db.add(emp)
            created.append("empresas")

            # Documentos da empresa
            for tipo, nome in [
                ("contrato_social", "Contrato Social MedLab.pdf"),
                ("atestado_capacidade", "Atestado Capacidade Técnica - HC UFMG.pdf"),
                ("balanco", "Balanço Patrimonial 2025.pdf"),
                ("alvara", "Alvará Funcionamento BH 2026.pdf"),
            ]:
                db.add(EmpresaDocumento(
                    id=uid(), empresa_id=emp_id, tipo=tipo,
                    nome_arquivo=nome, path_arquivo=f"/docs/empresa/{nome}",
                    data_emissao=date(2025, 6, 15),
                    data_vencimento=date(2026, 12, 31) if tipo != "contrato_social" else None,
                    processado=True,
                ))
            created.append("empresa_documentos")

            # Certidões
            for tipo, org, dias in [
                ("cnd_federal", "Receita Federal", 180),
                ("fgts", "Caixa Econômica Federal", 30),
                ("trabalhista", "TST", 180),
                ("cnd_estadual", "SEFAZ-MG", 90),
                ("cnd_municipal", "Prefeitura BH", 90),
            ]:
                dt_emissao = date.today() - timedelta(days=10)
                db.add(EmpresaCertidao(
                    id=uid(), empresa_id=emp_id, tipo=tipo,
                    orgao_emissor=org, numero=f"CND-{uid()[:8].upper()}",
                    data_emissao=dt_emissao,
                    data_vencimento=dt_emissao + timedelta(days=dias),
                    status="valida",
                ))
            created.append("empresa_certidoes")

            # Responsáveis
            for nome, cargo, tipo_r in [
                ("Dr. Carlos Mendes", "Diretor Técnico", "representante_legal"),
                ("Ana Paula Oliveira", "Gerente Comercial", "preposto"),
                ("Dr. Roberto Lima", "Responsável Técnico", "tecnico"),
            ]:
                db.add(EmpresaResponsavel(
                    id=uid(), empresa_id=emp_id, nome=nome, cargo=cargo,
                    cpf=f"{uid()[:3]}.{uid()[:3]}.{uid()[:3]}-{uid()[:2]}",
                    email=f"{nome.split()[0].lower()}@medlab.com.br",
                    telefone="(31) 9" + uid()[:4] + "-" + uid()[:4],
                    tipo=tipo_r,
                ))
            created.append("empresa_responsaveis")

        # ─── 2. EDITAIS ───────────────────────────────────────────────────────
        if db.query(Edital).count() == 0:
            editais_data = [
                ("PE-001/2026", "Hospital das Clínicas UFMG", "federal", "MG", "Belo Horizonte",
                 "Aquisição de analisador hematológico automatizado com fornecimento de reagentes por 12 meses",
                 "pregao_eletronico", "aluguel_com_consumo", Decimal("450000.00"), "participando"),
                ("PE-015/2026", "Secretaria de Saúde de SP", "estadual", "SP", "São Paulo",
                 "Registro de preços para aquisição de kits de diagnóstico de COVID-19 e Dengue",
                 "pregao_eletronico", "consumo_reagentes", Decimal("1200000.00"), "novo"),
                ("PE-003/2026", "FHEMIG", "estadual", "MG", "Belo Horizonte",
                 "Fornecimento de centrífuga refrigerada de alta velocidade para laboratório de pesquisa",
                 "pregao_eletronico", "venda_equipamento", Decimal("85000.00"), "analisando"),
                ("CC-002/2026", "Hospital Municipal de Contagem", "municipal", "MG", "Contagem",
                 "Comodato de equipamento de bioquímica clínica com reagentes por 24 meses",
                 "concorrencia", "comodato", Decimal("780000.00"), "novo"),
                ("DL-010/2026", "UPA Norte BH", "municipal", "MG", "Belo Horizonte",
                 "Aquisição de microscópio binocular com iluminação LED",
                 "dispensa", "venda_equipamento", Decimal("12000.00"), "proposta_enviada"),
            ]
            edital_ids = []
            for num, orgao, tipo_o, uf, cid, obj, mod, cat, val, st in editais_data:
                eid = uid()
                edital_ids.append(eid)
                db.add(Edital(
                    id=eid, user_id=USER_ID, numero=num, orgao=orgao,
                    orgao_tipo=tipo_o, uf=uf, cidade=cid, objeto=obj,
                    modalidade=mod, categoria=cat, valor_referencia=val,
                    data_publicacao=date.today() - timedelta(days=15),
                    data_abertura=datetime.now() + timedelta(days=10),
                    data_limite_proposta=datetime.now() + timedelta(days=8),
                    data_limite_impugnacao=datetime.now() + timedelta(days=5),
                    status=st, fonte="pncp",
                ))
            created.append("editais")

            # Requisitos para o primeiro edital
            reqs_data = [
                ("tecnico", "Capacidade de processamento mínima de 60 amostras/hora", "Velocidade processamento", "60", ">="),
                ("tecnico", "Volume de amostra: 50 a 500 microlitros", "Volume amostra", "50-500", "range"),
                ("tecnico", "23 parâmetros hematológicos incluindo reticulócitos", "Parâmetros", "23", ">="),
                ("tecnico", "Tela touch screen colorida mínimo 10 polegadas", "Tela", "10", ">="),
                ("documental", "Registro ANVISA válido para o equipamento", None, None, None),
                ("documental", "Manual de operação em português", None, None, None),
                ("comercial", "Garantia mínima de 12 meses", "Garantia meses", "12", ">="),
                ("comercial", "Assistência técnica no estado do comprador", None, None, None),
            ]
            req_ids = []
            for tipo, desc, nome_spec, val_ex, op in reqs_data:
                rid = uid()
                req_ids.append(rid)
                db.add(EditalRequisito(
                    id=rid, edital_id=edital_ids[0], tipo=tipo,
                    descricao=desc, nome_especificacao=nome_spec,
                    valor_exigido=val_ex, operador=op,
                    obrigatorio=True, pagina_origem=5,
                ))
            created.append("editais_requisitos")

            # Itens para editais
            for i, eid in enumerate(edital_ids[:3]):
                db.add(EditalItem(
                    id=uid(), edital_id=eid, numero_item=1,
                    descricao=f"Item principal do edital {i+1}",
                    unidade_medida="UN", quantidade=Decimal("1"),
                    valor_unitario_estimado=Decimal("50000.00"),
                    valor_total_estimado=Decimal("50000.00"),
                ))
            created.append("editais_itens")

            # Documentos para editais
            for eid in edital_ids[:2]:
                db.add(EditalDocumento(
                    id=uid(), edital_id=eid, tipo="edital_principal",
                    nome_arquivo="edital_completo.pdf",
                    path_arquivo=f"/docs/editais/{eid}/edital.pdf",
                    processado=True,
                ))
            created.append("editais_documentos")

        # ─── 3. ANÁLISES ──────────────────────────────────────────────────────
        if db.query(Analise).count() == 0:
            # Pegar primeiro edital e primeiro produto
            edital = db.query(Edital).filter(Edital.user_id == USER_ID).first()
            from models import Produto
            produto = db.query(Produto).filter(Produto.user_id == USER_ID).first()

            if edital and produto:
                ana_id = uid()
                db.add(Analise(
                    id=ana_id, edital_id=edital.id, produto_id=produto.id,
                    user_id=USER_ID,
                    score_tecnico=Decimal("85.50"), score_comercial=Decimal("72.30"),
                    score_potencial=Decimal("90.00"), score_final=Decimal("82.60"),
                    requisitos_total=8, requisitos_atendidos=6,
                    requisitos_parciais=1, requisitos_nao_atendidos=1,
                    preco_sugerido=Decimal("420000.00"),
                    recomendacao="GO - Boa aderência técnica. Preço competitivo. Recomenda-se participar.",
                ))
                created.append("analises")

        # ─── 4. PROPOSTAS ─────────────────────────────────────────────────────
        if db.query(Proposta).count() == 0:
            edital = db.query(Edital).filter(Edital.user_id == USER_ID).first()
            from models import Produto
            produto = db.query(Produto).filter(Produto.user_id == USER_ID).first()
            analise = db.query(Analise).filter(Analise.user_id == USER_ID).first()

            if edital and produto:
                db.add(Proposta(
                    id=uid(), edital_id=edital.id, produto_id=produto.id,
                    analise_id=analise.id if analise else None,
                    user_id=USER_ID,
                    texto_tecnico="Proposta técnica para fornecimento de analisador hematológico...",
                    preco_unitario=Decimal("415000.00"), preco_total=Decimal("415000.00"),
                    quantidade=1, status="rascunho",
                ))
                created.append("propostas")

        # ─── 5. ALERTAS ───────────────────────────────────────────────────────
        if db.query(Alerta).count() == 0:
            edital = db.query(Edital).filter(Edital.user_id == USER_ID).first()
            if edital:
                for tipo, titulo, dias in [
                    ("abertura", "Abertura do Pregão PE-001/2026", 10),
                    ("proposta", "Prazo final para envio de proposta", 8),
                    ("impugnacao", "Prazo para impugnação encerra em 5 dias", 5),
                ]:
                    db.add(Alerta(
                        id=uid(), user_id=USER_ID, edital_id=edital.id,
                        tipo=tipo, data_disparo=datetime.now() + timedelta(days=dias),
                        tempo_antes_minutos=60, status="agendado",
                        titulo=titulo, mensagem=f"Alerta: {titulo}",
                        canal_email=True, canal_push=True,
                    ))
                created.append("alertas")

        # ─── 6. NOTIFICAÇÕES ──────────────────────────────────────────────────
        if db.query(Notificacao).count() == 0:
            edital = db.query(Edital).filter(Edital.user_id == USER_ID).first()
            if edital:
                for tipo, titulo, msg in [
                    ("novo_edital", "Novo edital encontrado", "Edital PE-015/2026 - Kits diagnóstico COVID/Dengue - R$ 1.2M"),
                    ("alta_aderencia", "Alta aderência detectada", "Score de 85% para PE-001/2026 com Analisador XN-1000"),
                    ("alerta_prazo", "Prazo se aproximando", "Proposta do PE-001/2026 deve ser enviada em 8 dias"),
                ]:
                    db.add(Notificacao(
                        id=uid(), user_id=USER_ID, tipo=tipo,
                        edital_id=edital.id,
                        titulo=titulo, mensagem=msg, lida=False,
                    ))
                created.append("notificacoes")

        # ─── 7. CONTRATOS ─────────────────────────────────────────────────────
        if db.query(Contrato).count() == 0:
            ctr_id = uid()
            db.add(Contrato(
                id=ctr_id, user_id=USER_ID,
                numero_contrato="CTR-2025-0087",
                orgao="Hospital Municipal de Betim",
                objeto="Comodato de analisador bioquímico com fornecimento de reagentes por 36 meses",
                valor_total=Decimal("960000.00"),
                data_assinatura=date(2025, 3, 15),
                data_inicio=date(2025, 4, 1),
                data_fim=date(2028, 3, 31),
                status="vigente",
                observacoes="Contrato resultante do PE-045/2025. Entrega mensal de reagentes.",
            ))

            # Entregas do contrato
            for i in range(1, 7):
                mes = date(2025, 3 + i, 15) if 3 + i <= 12 else date(2026, (3 + i) - 12, 15)
                st = "entregue" if i <= 4 else ("atrasado" if i == 5 else "pendente")
                db.add(ContratoEntrega(
                    id=uid(), contrato_id=ctr_id,
                    descricao=f"Lote mensal {i} - Reagentes bioquímica",
                    quantidade=Decimal("500"),
                    valor_unitario=Decimal("15.00"), valor_total=Decimal("7500.00"),
                    data_prevista=mes,
                    data_realizada=mes - timedelta(days=2) if st == "entregue" else None,
                    nota_fiscal=f"NF-{2025}{i:03d}" if st == "entregue" else None,
                    numero_empenho=f"EMP-2025-{i:04d}",
                    status=st,
                ))
            created.append("contratos + contrato_entregas")

        # ─── 8. RECURSOS ──────────────────────────────────────────────────────
        if db.query(Recurso).count() == 0:
            edital = db.query(Edital).filter(Edital.user_id == USER_ID).first()
            if edital:
                db.add(Recurso(
                    id=uid(), user_id=USER_ID, edital_id=edital.id,
                    tipo="impugnacao",
                    motivo="Exigência de marca específica no termo de referência viola art. 41 da Lei 14.133/21",
                    texto_minuta="Ao Pregoeiro...\n\nVem a empresa MedLab Diagnósticos Ltda, CNPJ 12.345.678/0001-90, interpor a presente IMPUGNAÇÃO ao edital...",
                    fundamentacao_legal="Art. 41 e Art. 164 da Lei 14.133/2021",
                    prazo_limite=datetime.now() + timedelta(days=5),
                    status="rascunho",
                ))
                created.append("recursos")

        # ─── 9. LEADS CRM ─────────────────────────────────────────────────────
        if db.query(LeadCRM).count() == 0:
            leads = [
                ("Hospital das Clínicas UFMG", "17.217.985/0001-04", "Dr. Fernando Costa", "Chefe do Laboratório",
                 "prospeccao", Decimal("500000.00")),
                ("Santa Casa de BH", "17.200.429/0001-25", "Dra. Mariana Alves", "Diretora Técnica",
                 "contato", Decimal("350000.00")),
                ("Secretaria Saúde Contagem", "18.715.383/0001-40", "João Pedro Ramos", "Pregoeiro",
                 "proposta", Decimal("200000.00")),
            ]
            lead_ids = []
            for orgao, cnpj, contato, cargo, status, valor in leads:
                lid = uid()
                lead_ids.append(lid)
                db.add(LeadCRM(
                    id=lid, user_id=USER_ID,
                    orgao=orgao, cnpj_orgao=cnpj,
                    contato_nome=contato, contato_cargo=cargo,
                    contato_email=f"{contato.split()[0].lower()}@{orgao.split()[0].lower()}.gov.br",
                    contato_telefone="(31) 3" + uid()[:3] + "-" + uid()[:4],
                    status_pipeline=status, origem="PNCP",
                    valor_potencial=valor,
                    proxima_acao="Agendar visita técnica",
                    data_proxima_acao=date.today() + timedelta(days=7),
                ))
            created.append("leads_crm")

            # Ações pós-perda
            db.add(AcaoPosPerda(
                id=uid(), user_id=USER_ID,
                lead_crm_id=lead_ids[0],
                tipo_acao="visita_tecnica",
                descricao="Agendar demonstração do analisador XN-1000 no laboratório do HC",
                responsavel="Ana Paula Oliveira",
                data_prevista=date.today() + timedelta(days=14),
                status="pendente",
            ))
            created.append("acoes_pos_perda")

        # ─── 10. PARÂMETROS SCORE ─────────────────────────────────────────────
        if db.query(ParametroScore).count() == 0:
            db.add(ParametroScore(
                id=uid(), user_id=USER_ID,
                peso_tecnico=Decimal("0.40"), peso_comercial=Decimal("0.25"),
                peso_participacao=Decimal("0.20"), peso_ganho=Decimal("0.15"),
                limiar_go=Decimal("70.00"), limiar_nogo=Decimal("40.00"),
                margem_minima=Decimal("15.00"),
            ))
            created.append("parametros_score")

        # ─── 11. DISPENSAS ─────────────────────────────────────────────────────
        if db.query(Dispensa).count() == 0:
            edital_disp = db.query(Edital).filter(
                Edital.user_id == USER_ID,
                Edital.modalidade == "dispensa"
            ).first()
            if edital_disp:
                db.add(Dispensa(
                    id=uid(), user_id=USER_ID, edital_id=edital_disp.id,
                    artigo="Art. 75, II",
                    valor_limite=Decimal("50000.00"),
                    justificativa="Aquisição de equipamento de baixo valor - dispensa de licitação",
                    fornecedores_cotados=[
                        {"empresa": "MedLab", "valor": 11500},
                        {"empresa": "DiagTech", "valor": 12800},
                        {"empresa": "LabEquip", "valor": 13200},
                    ],
                    status="aberta",
                    data_limite=datetime.now() + timedelta(days=15),
                ))
                created.append("dispensas")

        # ─── 12. ESTRATÉGIAS ──────────────────────────────────────────────────
        if db.query(EstrategiaEdital).count() == 0:
            editais = db.query(Edital).filter(Edital.user_id == USER_ID).limit(3).all()
            for i, ed in enumerate(editais):
                decisao = ["go", "acompanhar", "go"][i] if i < 3 else "acompanhar"
                db.add(EstrategiaEdital(
                    id=uid(), user_id=USER_ID, edital_id=ed.id,
                    decisao=decisao,
                    prioridade=["alta", "media", "alta"][i] if i < 3 else "baixa",
                    margem_desejada=Decimal("20.00"),
                    agressividade_preco="moderado",
                    justificativa=f"Estratégia definida para {ed.numero}",
                    data_decisao=datetime.now(),
                    decidido_por="Carlos Mendes",
                ))
            created.append("estrategias_editais")

        # ─── 13. AUDITORIA ────────────────────────────────────────────────────
        if db.query(AuditoriaLog).count() == 0:
            for acao, entidade in [
                ("criar", "empresa"), ("atualizar", "produto"),
                ("criar", "edital"), ("criar", "proposta"),
                ("login", "user"),
            ]:
                db.add(AuditoriaLog(
                    id=uid(), user_id=USER_ID,
                    user_email="pasteurjr@gmail.com",
                    acao=acao, entidade=entidade,
                    entidade_id=uid(),
                    ip_address="192.168.1.100",
                    user_agent="Mozilla/5.0 Chrome/120",
                ))
            created.append("auditoria_log")

        # ─── 14. APRENDIZADO ──────────────────────────────────────────────────
        if db.query(AprendizadoFeedback).count() == 0:
            db.add(AprendizadoFeedback(
                id=uid(), user_id=USER_ID,
                tipo_evento="resultado_edital",
                entidade="edital", entidade_id=uid(),
                dados_entrada={"score_previsto": 82.6, "preco_sugerido": 420000},
                resultado_real={"ganhou": True, "preco_final": 415000},
                delta={"score_delta": 0, "preco_delta": -5000},
                aplicado=False,
            ))
            created.append("aprendizado_feedback")

        # ─── 15. PREÇOS HISTÓRICOS (adicionar mais se poucos) ─────────────────
        if db.query(PrecoHistorico).filter(PrecoHistorico.user_id == USER_ID).count() < 5:
            for empresa, preco_v, resultado, motivo in [
                ("DiagTech Ltda", Decimal("398000.00"), "derrota", "preco"),
                ("LabEquip SA", Decimal("425000.00"), "vitoria", None),
                ("BioSystems", Decimal("380000.00"), "derrota", "preco"),
            ]:
                edital = db.query(Edital).filter(Edital.user_id == USER_ID).first()
                if edital:
                    db.add(PrecoHistorico(
                        id=uid(), user_id=USER_ID,
                        edital_id=edital.id,
                        preco_referencia=Decimal("450000.00"),
                        preco_vencedor=preco_v,
                        nosso_preco=Decimal("415000.00"),
                        empresa_vencedora=empresa,
                        resultado=resultado,
                        motivo_perda=motivo,
                        data_homologacao=date.today() - timedelta(days=30),
                        fonte="manual",
                    ))
            created.append("precos_historicos (extras)")

        # ─── 16. PARTICIPAÇÕES ─────────────────────────────────────────────────
        if db.query(ParticipacaoEdital).count() == 0:
            edital = db.query(Edital).filter(Edital.user_id == USER_ID).first()
            concorrentes = db.query(Concorrente).limit(3).all()
            if edital and concorrentes:
                for i, conc in enumerate(concorrentes):
                    db.add(ParticipacaoEdital(
                        id=uid(), edital_id=edital.id,
                        concorrente_id=conc.id,
                        preco_proposto=Decimal(str(380000 + i * 20000)),
                        posicao_final=i + 1,
                        desclassificado=False,
                        fonte="manual",
                    ))
                created.append("participacoes_editais")

        db.commit()
        print(f"\n✅ Seed concluído! Tabelas populadas: {', '.join(created)}")
        print(f"   Total: {len(created)} tabelas\n")

        # Verificar contagens
        from models import Base
        from sqlalchemy import text
        print("── Contagens após seed ──")
        for table_name in sorted(Base.metadata.tables.keys()):
            result = db.execute(text(f"SELECT COUNT(*) FROM `{table_name}`"))
            count = result.scalar()
            if count > 0:
                print(f"  {table_name:40s} {count} registros")

    except Exception as e:
        db.rollback()
        print(f"\n❌ Erro no seed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()


if __name__ == "__main__":
    seed()
