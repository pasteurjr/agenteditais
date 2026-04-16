"""
Seed Sprint 6 — popula dados minimos para os 17 UCs (Flags, Monitoria, Auditoria, SMTP).

Execucao: cd backend && python -m seeds.sprint6_seed

Idempotente: usa marcador SPRINT6_SEED e checa duplicatas por campos unicos.

Cobre (CH Hospitalar — valida1):
  - 8 alertas (4 agendado, 2 disparado, 1 lido, 1 cancelado)
  - 5 monitoramentos (3 ativos normais, 1 pausado, 1 com erro)
  - 10 audit logs (3 sensiveis + 7 normais)
  - 1 config SMTP global (dry-run)
  - 4 email templates
  - 6 email queue (2 pending, 2 sent, 2 failed)

Cobre (RP3X — valida2):
  - 5 alertas (sem cancelado — estado zero)
  - 3 monitoramentos (sem erro — estado zero)
  - 6 audit logs (sem sensiveis — estado zero)
  - 4 email templates
  - 4 email queue (sem failed — estado zero)
"""
import sys
import os
import uuid
from datetime import datetime, date, timedelta
from decimal import Decimal

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import (
    SessionLocal,
    User, Empresa, Edital,
    Alerta, Monitoramento, AuditoriaLog,
    ConfiguracaoSMTP, EmailTemplate, EmailQueue,
)

SEED_MARK = "SPRINT6_SEED"

VALIDA1_USER_ID = "45fae79e-27dc-46e4-9b74-ed054ad3b7b1"
VALIDA2_USER_ID = "edc4ab79-8fae-4ae1-a3da-d652f8bf5720"
CH_EMPRESA_ID = "7dbdc60a-b806-4614-a024-a1d4841dc8c9"


def uid():
    return str(uuid.uuid4())


def now():
    return datetime(2026, 4, 16, 9, 0, 0)


def already_seeded(db, model, **filters):
    return db.query(model).filter_by(**filters).first()


SENSITIVE_ENTITIES = {"smtp-config", "users", "empresas", "contratos", "propostas", "parametros-score"}

TEMPLATE_DATA = [
    ("alerta-edital", "Alerta de Edital", "Novo alerta: {{edital_numero}}",
     "<h2>Alerta</h2><p>Edital {{edital_numero}} requer atenção.</p>",
     ["edital_numero"]),
    ("certidao-vencida", "Certidão Vencida", "Certidão {{tipo}} venceu em {{data_vencimento}}",
     "<h2>Certidão Vencida</h2><p>A certidão {{tipo}} venceu em {{data_vencimento}}.</p>",
     ["tipo", "data_vencimento"]),
    ("contrato-vencimento", "Contrato a Vencer", "Contrato {{numero}} vence em {{dias}} dias",
     "<h2>Contrato a Vencer</h2><p>O contrato {{numero}} vencerá em {{dias}} dias.</p>",
     ["numero", "dias"]),
    ("monitoramento-encontrado", "Monitoramento Encontrado", '{{total}} editais encontrados para "{{termo}}"',
     "<h2>Novos Editais</h2><p>{{total}} editais encontrados para o termo {{termo}}.</p>",
     ["total", "termo"]),
]


# ==================== CH HOSPITALAR ====================

def seed_ch_alertas(db):
    editais = db.query(Edital).filter(
        Edital.empresa_id == CH_EMPRESA_ID,
    ).limit(8).all()
    if len(editais) < 8:
        print(f"  ! Apenas {len(editais)} editais CH disponiveis, precisa de 8")
        editais = editais + editais[:8 - len(editais)]

    base = now()
    # (tipo, status, disparo, disparado_em, lido_em, titulo, silenciado_ate, motivo)
    alertas_data = [
        ("abertura", "agendado", base + timedelta(days=3), None, None, "Abertura PE Hemograma SP", None, None),
        ("impugnacao", "agendado", base + timedelta(days=7), None, None, "Prazo impugnacao edital MG", None, None),
        ("recursos", "agendado", base + timedelta(days=1), None, None, "Prazo recurso edital RS", None, None),
        ("proposta", "disparado", base - timedelta(days=2), base - timedelta(days=1), None, "Proposta edital RJ vence hoje", None, None),
        ("contrato_vencimento", "disparado", base - timedelta(days=5), base - timedelta(days=4), None, "Contrato CTR-CH-2026-V30 vence", None, None),
        ("personalizado", "lido", base - timedelta(days=10), base - timedelta(days=9), base - timedelta(days=8), "Revisar documentacao empresa", None, None),
        ("abertura", "cancelado", base + timedelta(days=15), None, None, "Licitacao cancelada pelo orgao", None, None),
        ("entrega_prazo", "agendado", base + timedelta(days=2), None, None, "Entrega reagentes prazo", None, None),
        ("personalizado", "silenciado", base + timedelta(days=5), None, None, "Reuniao adiada pelo cliente", base + timedelta(days=10), "Reagendado para proxima semana"),
    ]
    created = 0
    for i, (tipo, status, disparo, disparado_em, lido_em, titulo, sil_ate, sil_motivo) in enumerate(alertas_data):
        if already_seeded(db, Alerta, titulo=titulo):
            continue
        edital_idx = i if i < len(editais) else i % len(editais)
        db.add(Alerta(
            id=uid(),
            user_id=VALIDA1_USER_ID,
            empresa_id=CH_EMPRESA_ID,
            edital_id=editais[edital_idx].id,
            tipo=tipo,
            data_disparo=disparo,
            tempo_antes_minutos=1440,
            status=status,
            canal_email=True,
            canal_push=True,
            titulo=titulo,
            mensagem=f"{titulo} - gerado automaticamente pelo seed Sprint 6",
            disparado_em=disparado_em,
            lido_em=lido_em,
            silenciado_ate=sil_ate,
            motivo_silenciamento=sil_motivo,
            created_at=base - timedelta(days=i),
        ))
        created += 1
    return created


def seed_ch_monitoramentos(db):
    base = now()
    monitoramentos_data = [
        ("hematologia", ["SP", "RJ", "MG"], 4, True, 12, base - timedelta(hours=2)),
        ("reagentes laboratoriais", ["SP", "RS"], 8, True, 7, base - timedelta(hours=4)),
        ("equipamento diagnostico", ["MG", "BA", "GO"], 12, True, 3, base - timedelta(hours=6)),
        ("kit coagulacao", ["PR", "SC"], 4, False, 5, base - timedelta(hours=48)),
        ("biomol pcr", ["SP"], 4, True, 2, base - timedelta(hours=72)),
    ]
    created = 0
    for termo, ufs, freq, ativo, encontrados, ultimo in monitoramentos_data:
        if already_seeded(db, Monitoramento, termo=termo, empresa_id=CH_EMPRESA_ID):
            continue
        db.add(Monitoramento(
            id=uid(),
            user_id=VALIDA1_USER_ID,
            empresa_id=CH_EMPRESA_ID,
            termo=termo,
            ufs=ufs,
            fontes=["pncp"],
            frequencia_horas=freq,
            ativo=ativo,
            editais_encontrados=encontrados,
            ultimo_check=ultimo,
            proximo_check=ultimo + timedelta(hours=freq),
            notificar_email=True,
            notificar_push=True,
            score_minimo_alerta=70,
            ultima_execucao=ultimo,
            created_at=base - timedelta(days=10),
        ))
        created += 1
    return created


def seed_ch_auditoria(db):
    base = now()
    s6_marker = f"S6_SEED_{CH_EMPRESA_ID[:8]}"
    logs_data = [
        ("create", "edital", False, base - timedelta(days=5)),
        ("update", "edital", False, base - timedelta(days=4)),
        ("create", "proposta", False, base - timedelta(days=3)),
        ("update", "smtp-config", True, base - timedelta(days=2)),
        ("update", "parametros-score", True, base - timedelta(days=1)),
        ("create", "contrato", False, base - timedelta(days=6)),
        ("delete", "alerta", False, base - timedelta(days=1, hours=6)),
        ("update", "users", True, base - timedelta(days=3, hours=4)),
        ("create", "monitoramento", False, base - timedelta(days=2, hours=3)),
        ("login", "auth", False, base - timedelta(days=1, hours=1)),
    ]
    existing = db.query(AuditoriaLog).filter(
        AuditoriaLog.user_id == VALIDA1_USER_ID,
        AuditoriaLog.entidade_id == s6_marker,
    ).count()
    if existing >= 10:
        return 0

    diff_data = {
        ("update", "edital"): ({"status": "rascunho", "valor_estimado": 50000}, {"status": "publicado", "valor_estimado": 55000}),
        ("update", "smtp-config"): ({"host": "smtp.antigo.com", "port": 25}, {"host": "smtp.empresa.com.br", "port": 587}),
        ("update", "parametros-score"): ({"peso_certidao": 0.3, "peso_preco": 0.5}, {"peso_certidao": 0.4, "peso_preco": 0.4}),
        ("update", "users"): ({"name": "Usuario Teste", "is_super": False}, {"name": "Validador 1", "is_super": True}),
        ("create", "edital"): (None, {"numero": "PE-2026-SP-001", "orgao": "Hospital SP", "modalidade": "pregao_eletronico"}),
        ("create", "proposta"): (None, {"valor": 45000, "status": "rascunho", "edital_numero": "PE-2026-SP-001"}),
        ("create", "contrato"): (None, {"numero": "CTR-2026-001", "valor": 120000, "prazo_meses": 12}),
        ("delete", "alerta"): ({"titulo": "Alerta antigo", "status": "agendado"}, None),
        ("create", "monitoramento"): (None, {"termo": "hematologia", "ufs": ["SP", "RJ"], "frequencia_horas": 4}),
        ("login", "auth"): (None, {"email": "valida1@valida.com.br", "ip": "127.0.0.1"}),
    }

    created = 0
    for acao, entidade, sensivel, created_at in logs_data:
        antes, depois = diff_data.get((acao, entidade), (
            {"campo": "valor_anterior"} if acao in ("update", "delete") else None,
            {"campo": "valor_novo"} if acao in ("create", "update") else None,
        ))
        db.add(AuditoriaLog(
            id=uid(),
            user_id=VALIDA1_USER_ID,
            user_email="valida1@valida.com.br",
            acao=acao,
            entidade=entidade,
            entidade_id=s6_marker,
            dados_antes=antes,
            dados_depois=depois,
            ip_address="127.0.0.1",
            user_agent="Mozilla/5.0 Seed Sprint 6",
            created_at=created_at,
        ))
        created += 1
    return created


def seed_smtp_config(db):
    if already_seeded(db, ConfiguracaoSMTP, host="smtp.empresa.com.br"):
        return 0
    from crypto_utils import encrypt_password
    db.add(ConfiguracaoSMTP(
        id=uid(),
        empresa_id=None,
        host="smtp.empresa.com.br",
        port=587,
        user="alertas@empresa.com.br",
        password_encrypted=encrypt_password("S3nh@SMTP!2026"),
        from_email="alertas@empresa.com.br",
        from_name="Sistema Argus",
        tls_enabled=True,
        smtp_live_mode=False,
        updated_by=VALIDA1_USER_ID,
    ))
    return 1


def seed_ch_templates(db):
    created = 0
    for slug, nome, assunto, corpo, vars in TEMPLATE_DATA:
        if already_seeded(db, EmailTemplate, empresa_id=CH_EMPRESA_ID, slug=slug):
            continue
        db.add(EmailTemplate(
            id=uid(),
            empresa_id=CH_EMPRESA_ID,
            slug=slug,
            nome=nome,
            assunto=assunto,
            corpo_html=corpo,
            corpo_text=assunto,
            variaveis_json=vars,
            ativo=True,
            versao=1,
        ))
        created += 1
    return created


def seed_ch_queue(db):
    base = now()
    queue_data = [
        ("valida1@valida.com.br", "alerta-edital", "pending", "Novo alerta: PE-2026-SP-001",
         None, 0, None),
        ("gestor@empresa.com.br", "certidao-vencida", "pending", "Certidao CRF venceu em 10/04/2026",
         None, 0, None),
        ("valida1@valida.com.br", "contrato-vencimento", "sent", "Contrato CTR-CH-2026-V30 vence em 15 dias",
         base - timedelta(days=1), 0, None),
        ("fiscal@empresa.com.br", "contrato-vencimento", "sent", "Contrato CTR-CH-2026-V90 vence em 60 dias",
         base - timedelta(days=3), 0, None),
        ("valida1@valida.com.br", "monitoramento-encontrado", "failed", '5 editais encontrados para "hematologia"',
         None, 3, "Connection refused"),
        ("suporte@empresa.com.br", "alerta-edital", "failed", "Novo alerta: PE-2026-MG-003",
         None, 2, "Timeout after 30s"),
    ]
    created = 0
    for dest, slug, status, assunto, enviado, retry, erro in queue_data:
        if already_seeded(db, EmailQueue, empresa_id=CH_EMPRESA_ID, assunto=assunto):
            continue
        db.add(EmailQueue(
            id=uid(),
            empresa_id=CH_EMPRESA_ID,
            user_id=VALIDA1_USER_ID,
            destinatario=dest,
            template_slug=slug,
            assunto=assunto,
            corpo_html=f"<p>{assunto}</p>",
            status=status,
            retry_count=retry,
            max_retries=3,
            erro_mensagem=erro,
            enviado_em=enviado,
            created_at=base - timedelta(days=2),
        ))
        created += 1
    return created


# ==================== RP3X ====================

def seed_rp3x_alertas(db, rp3x_id):
    editais = db.query(Edital).filter(
        Edital.empresa_id == rp3x_id,
    ).limit(5).all()
    if len(editais) < 5:
        print(f"  ! Apenas {len(editais)} editais RP3X disponiveis, precisa de 5")
        editais = editais + editais[:5 - len(editais)]

    base = now()
    alertas_data = [
        ("abertura", "agendado", base + timedelta(days=4), None, None, "Abertura PE Reagentes SP"),
        ("impugnacao", "agendado", base + timedelta(days=6), None, None, "Prazo impugnacao edital BA"),
        ("proposta", "disparado", base - timedelta(days=1), base - timedelta(hours=12), None, "Proposta edital MG vence"),
        ("contrato_vencimento", "disparado", base - timedelta(days=3), base - timedelta(days=2), None, "Contrato CTR-RP-2026-V30 vence"),
        ("personalizado", "lido", base - timedelta(days=7), base - timedelta(days=6), base - timedelta(days=5), "Revisar portfolio reagentes"),
    ]
    created = 0
    for i, (tipo, status, disparo, disparado_em, lido_em, titulo) in enumerate(alertas_data):
        if already_seeded(db, Alerta, titulo=titulo):
            continue
        db.add(Alerta(
            id=uid(),
            user_id=VALIDA2_USER_ID,
            empresa_id=rp3x_id,
            edital_id=editais[i].id,
            tipo=tipo,
            data_disparo=disparo,
            tempo_antes_minutos=1440,
            status=status,
            canal_email=True,
            canal_push=True,
            titulo=titulo,
            mensagem=f"{titulo} - seed Sprint 6 RP3X",
            disparado_em=disparado_em,
            lido_em=lido_em,
            created_at=base - timedelta(days=i),
        ))
        created += 1
    return created


def seed_rp3x_monitoramentos(db, rp3x_id):
    base = now()
    monitoramentos_data = [
        ("reagentes diagnostico", ["SP", "MG", "RJ"], 6, True, 8, base - timedelta(hours=3)),
        ("kit glicose wiener", ["SP", "RS"], 12, True, 4, base - timedelta(hours=8)),
        ("analise clinica pcr", ["MG", "BA"], 8, False, 2, base - timedelta(hours=24)),
    ]
    created = 0
    for termo, ufs, freq, ativo, encontrados, ultimo in monitoramentos_data:
        if already_seeded(db, Monitoramento, termo=termo, empresa_id=rp3x_id):
            continue
        db.add(Monitoramento(
            id=uid(),
            user_id=VALIDA2_USER_ID,
            empresa_id=rp3x_id,
            termo=termo,
            ufs=ufs,
            fontes=["pncp"],
            frequencia_horas=freq,
            ativo=ativo,
            editais_encontrados=encontrados,
            ultimo_check=ultimo,
            proximo_check=ultimo + timedelta(hours=freq),
            notificar_email=True,
            notificar_push=True,
            score_minimo_alerta=70,
            ultima_execucao=ultimo,
            created_at=base - timedelta(days=8),
        ))
        created += 1
    return created


def seed_rp3x_auditoria(db, rp3x_id):
    base = now()
    s6_marker = f"S6_SEED_{rp3x_id[:8]}"
    logs_data = [
        ("create", "edital", base - timedelta(days=4)),
        ("update", "edital", base - timedelta(days=3)),
        ("create", "proposta", base - timedelta(days=2)),
        ("create", "contrato", base - timedelta(days=5)),
        ("create", "monitoramento", base - timedelta(days=1, hours=5)),
        ("login", "auth", base - timedelta(hours=12)),
    ]
    existing = db.query(AuditoriaLog).filter(
        AuditoriaLog.user_id == VALIDA2_USER_ID,
        AuditoriaLog.entidade_id == s6_marker,
    ).count()
    if existing >= 6:
        return 0

    created = 0
    for acao, entidade, created_at in logs_data:
        db.add(AuditoriaLog(
            id=uid(),
            user_id=VALIDA2_USER_ID,
            user_email="valida2@valida.com.br",
            acao=acao,
            entidade=entidade,
            entidade_id=s6_marker,
            dados_antes={"campo": "anterior"} if acao == "update" else None,
            dados_depois={"campo": "novo"} if acao in ("create", "update") else None,
            ip_address="127.0.0.1",
            user_agent="Seed Sprint 6",
            created_at=created_at,
        ))
        created += 1
    return created


def seed_rp3x_templates(db, rp3x_id):
    created = 0
    for slug, nome, assunto, corpo, vars in TEMPLATE_DATA:
        if already_seeded(db, EmailTemplate, empresa_id=rp3x_id, slug=slug):
            continue
        db.add(EmailTemplate(
            id=uid(),
            empresa_id=rp3x_id,
            slug=slug,
            nome=nome,
            assunto=assunto,
            corpo_html=corpo.replace("Alerta", "Aviso"),
            corpo_text=assunto,
            variaveis_json=vars,
            ativo=True,
            versao=1,
        ))
        created += 1
    return created


def seed_rp3x_queue(db, rp3x_id):
    base = now()
    queue_data = [
        ("valida2@valida.com.br", "alerta-edital", "pending", "Novo alerta: RP3X-ED-2026-101",
         None, 0, None),
        ("gerente@rp3x.com.br", "certidao-vencida", "pending", "Certidao FGTS venceu em 12/04/2026",
         None, 0, None),
        ("valida2@valida.com.br", "contrato-vencimento", "sent", "Contrato CTR-RP-2026-V30 vence em 20 dias",
         base - timedelta(days=2), 0, None),
        ("fiscal@rp3x.com.br", "monitoramento-encontrado", "sent", '4 editais encontrados para "reagentes"',
         base - timedelta(days=1), 0, None),
    ]
    created = 0
    for dest, slug, status, assunto, enviado, retry, erro in queue_data:
        if already_seeded(db, EmailQueue, empresa_id=rp3x_id, assunto=assunto):
            continue
        db.add(EmailQueue(
            id=uid(),
            empresa_id=rp3x_id,
            user_id=VALIDA2_USER_ID,
            destinatario=dest,
            template_slug=slug,
            assunto=assunto,
            corpo_html=f"<p>{assunto}</p>",
            status=status,
            retry_count=retry,
            max_retries=3,
            erro_mensagem=erro,
            enviado_em=enviado,
            created_at=base - timedelta(days=1),
        ))
        created += 1
    return created


# ==================== MAIN ====================

def main():
    db = SessionLocal()
    try:
        print("=" * 70)
        print("SPRINT 6 SEED — CH Hospitalar (valida1) + RP3X (valida2)")
        print("=" * 70)

        # ─── CH Hospitalar ───
        print("\n[CH Hospitalar / valida1]")

        n = seed_ch_alertas(db)
        print(f"  Alertas: {n}")

        n = seed_ch_monitoramentos(db)
        print(f"  Monitoramentos: {n}")

        n = seed_ch_auditoria(db)
        print(f"  Audit logs: {n}")

        n = seed_smtp_config(db)
        print(f"  SMTP config (global): {n}")

        n = seed_ch_templates(db)
        print(f"  Email templates: {n}")

        db.flush()
        n = seed_ch_queue(db)
        print(f"  Email queue: {n}")

        # ─── RP3X ───
        print("\n[RP3X / valida2]")
        rp3x = db.query(Empresa).filter_by(cnpj="68.218.593/0001-09").first()
        if not rp3x:
            print("  ! Empresa RP3X nao encontrada — execute sprint5_seed.py primeiro")
            sys.exit(1)
        rp3x_id = rp3x.id
        print(f"  Empresa RP3X: {rp3x_id}")

        n = seed_rp3x_alertas(db, rp3x_id)
        print(f"  Alertas: {n}")

        n = seed_rp3x_monitoramentos(db, rp3x_id)
        print(f"  Monitoramentos: {n}")

        n = seed_rp3x_auditoria(db, rp3x_id)
        print(f"  Audit logs: {n}")

        n = seed_rp3x_templates(db, rp3x_id)
        print(f"  Email templates: {n}")

        db.flush()
        n = seed_rp3x_queue(db, rp3x_id)
        print(f"  Email queue: {n}")

        db.commit()

        # ─── Verificação ───
        print("\n" + "=" * 70)
        print("VERIFICAÇÃO DE COUNTS MÍNIMOS")
        print("=" * 70)

        ch_checks = {
            "alertas CH": db.query(Alerta).filter_by(empresa_id=CH_EMPRESA_ID).count(),
            "monitoramentos CH": db.query(Monitoramento).filter_by(empresa_id=CH_EMPRESA_ID).count(),
            "audit_logs CH": db.query(AuditoriaLog).filter_by(user_id=VALIDA1_USER_ID).count(),
            "smtp_config (global)": db.query(ConfiguracaoSMTP).count(),
            "email_templates CH": db.query(EmailTemplate).filter_by(empresa_id=CH_EMPRESA_ID).count(),
            "email_queue CH": db.query(EmailQueue).filter_by(empresa_id=CH_EMPRESA_ID).count(),
        }

        rp_checks = {
            "alertas RP3X": db.query(Alerta).filter_by(empresa_id=rp3x_id).count(),
            "monitoramentos RP3X": db.query(Monitoramento).filter_by(empresa_id=rp3x_id).count(),
            "audit_logs RP3X": db.query(AuditoriaLog).filter_by(user_id=VALIDA2_USER_ID).count(),
            "email_templates RP3X": db.query(EmailTemplate).filter_by(empresa_id=rp3x_id).count(),
            "email_queue RP3X": db.query(EmailQueue).filter_by(empresa_id=rp3x_id).count(),
        }

        mins = {
            "alertas CH": 8, "monitoramentos CH": 5, "audit_logs CH": 10,
            "smtp_config (global)": 1, "email_templates CH": 4, "email_queue CH": 6,
            "alertas RP3X": 5, "monitoramentos RP3X": 3, "audit_logs RP3X": 6,
            "email_templates RP3X": 4, "email_queue RP3X": 4,
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
        print("\n✅ SEED SPRINT 6 CONCLUÍDO")

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
