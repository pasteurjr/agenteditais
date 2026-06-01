"""
Seed Sprint 9 — popula dados para 12 UCs: Sala Virtual, Scores, Analytics, Health.

Execucao: cd backend && python -m seeds.sprint9_seed

Idempotente: usa marcador SPRINT9_SEED e checa duplicatas.

Cobre (CH Hospitalar — valida1):
  - 3 sessoes de pregao (1 ativa, 1 encerrada vitoria, 1 encerrada derrota)
  - 10-15 lances por sessao com rodadas variadas
  - Concorrentes com desclassificacoes (Score Qualidade)
  - PrecoCamada completas A-F (DRE e sala virtual)
  - EstrategiaEdital com perfil_competitivo e cenarios
  - Monitoramento tipo sessao_pregao

Cobre (RP3X — valida2):
  - 1 sessao de pregao encerrada
  - Empenhos com datas variadas (Tempo Medio)
"""
import sys
import os
import uuid
from datetime import datetime, date, timedelta
from decimal import Decimal

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models import (
    SessionLocal,
    User, Empresa, Edital, Produto, EditalItem, EditalItemProduto,
    Concorrente, ParticipacaoEdital, Contrato, Lance, PrecoCamada,
    EstrategiaEdital, Monitoramento, SessaoPregao, AuditoriaLog,
)

SEED_MARK = "SPRINT9_SEED"

VALIDA1_USER_ID = "45fae79e-27dc-46e4-9b74-ed054ad3b7b1"
VALIDA2_USER_ID = "edc4ab79-8fae-4ae1-a3da-d652f8bf5720"
CH_EMPRESA_ID = "7dbdc60a-b806-4614-a024-a1d4841dc8c9"


def uid():
    return str(uuid.uuid4())


def now():
    return datetime(2026, 4, 17, 10, 0, 0)


def already_seeded(db, model, **filters):
    return db.query(model).filter_by(**filters).first()


def get_rp3x_empresa_id(db):
    ue = db.query(Empresa).join(User, Empresa.user_id == User.id).filter(User.id == VALIDA2_USER_ID).first()
    if ue:
        return ue.id
    from models import UsuarioEmpresa
    ue2 = db.query(UsuarioEmpresa).filter(
        UsuarioEmpresa.user_id == VALIDA2_USER_ID,
        UsuarioEmpresa.ativo == True
    ).first()
    return ue2.empresa_id if ue2 else None


# ==================== CH HOSPITALAR ====================

def seed_ch_sessoes(db):
    """Cria 3 sessoes de pregao para CH Hospitalar."""
    editais = db.query(Edital).filter(Edital.empresa_id == CH_EMPRESA_ID).limit(3).all()
    if len(editais) < 3:
        print("  [SKIP] Menos de 3 editais para CH — sessoes nao criadas")
        return []

    sessoes_data = [
        {"edital_idx": 0, "status": "ativa", "modalidade": "aberto", "autonomia": "copiloto", "resultado": None},
        {"edital_idx": 1, "status": "encerrada", "modalidade": "aberto", "autonomia": "um_clique", "resultado": "vitoria"},
        {"edital_idx": 2, "status": "encerrada", "modalidade": "aberto_fechado", "autonomia": "copiloto", "resultado": "derrota"},
    ]

    sessao_ids = []
    for s in sessoes_data:
        ed = editais[s["edital_idx"]]
        check = db.query(SessaoPregao).filter_by(
            edital_id=ed.id, empresa_id=CH_EMPRESA_ID
        ).first()
        if check:
            sessao_ids.append(check.id)
            continue

        sid = uid()
        sessao = SessaoPregao(
            id=sid,
            user_id=VALIDA1_USER_ID,
            empresa_id=CH_EMPRESA_ID,
            edital_id=ed.id,
            modalidade=s["modalidade"],
            status=s["status"],
            fase_atual="encerrada" if s["status"] == "encerrada" else "aberta",
            autonomia=s["autonomia"],
            resultado=s["resultado"],
            posicao_final=1 if s["resultado"] == "vitoria" else (3 if s["resultado"] == "derrota" else None),
            lance_final=Decimal("385.0000") if s["resultado"] else None,
            margem_final=Decimal("13.24") if s["resultado"] else None,
            robo_ativo=False,
            lances_automaticos_count=0,
            created_at=now(),
        )
        db.add(sessao)
        sessao_ids.append(sid)
        print(f"  + SessaoPregao {s['status']} — edital={ed.numero or ed.id[:8]}")

    db.flush()
    return sessao_ids


def seed_ch_lances_sessao(db, sessao_ids):
    """Cria lances para cada sessao."""
    for idx, sessao_id in enumerate(sessao_ids):
        existing = db.query(Lance).filter(Lance.sessao_pregao_id == sessao_id).count()
        if existing > 0:
            continue

        vinculo = None
        sessao = db.query(SessaoPregao).filter(SessaoPregao.id == sessao_id).first()
        if sessao:
            vinculo = db.query(EditalItemProduto).filter(
                EditalItemProduto.empresa_id == CH_EMPRESA_ID
            ).join(EditalItem).filter(EditalItem.edital_id == sessao.edital_id).first()

        if not vinculo:
            print(f"  [SKIP] Sem vinculo para sessao {sessao_id[:8]} — lances nao criados")
            continue

        num_lances = 12 if idx == 0 else (10 if idx == 1 else 8)
        base_valor = 495.0
        for r in range(1, num_lances + 1):
            valor = base_valor - (r * 12.5)
            if valor < 340:
                valor = 340 + (r * 2)
            margem = ((valor - 340) / 340 * 100) if 340 > 0 else 0

            lance = Lance(
                id=uid(),
                edital_item_produto_id=vinculo.id,
                user_id=VALIDA1_USER_ID,
                empresa_id=CH_EMPRESA_ID,
                sessao_pregao_id=sessao_id,
                rodada=r,
                valor_lance=Decimal(str(round(valor, 4))),
                tipo="inicial" if r == 1 else "decremento",
                fase="aberta",
                margem_sobre_custo=Decimal(str(round(margem, 2))),
                status="enviado",
                created_at=now() + timedelta(minutes=r * 2),
            )
            db.add(lance)

        print(f"  + {num_lances} lances para sessao {sessao_id[:8]}")

    db.flush()


def seed_ch_estrategia(db):
    """Cria EstrategiaEdital para editais de CH."""
    editais = db.query(Edital).filter(Edital.empresa_id == CH_EMPRESA_ID).limit(3).all()
    for i, ed in enumerate(editais):
        existing = db.query(EstrategiaEdital).filter_by(
            edital_id=ed.id, empresa_id=CH_EMPRESA_ID
        ).first()
        if existing:
            continue

        perfil = "quero_ganhar" if i < 2 else "nao_ganhei_minimo"
        est = EstrategiaEdital(
            id=uid(),
            user_id=VALIDA1_USER_ID,
            empresa_id=CH_EMPRESA_ID,
            edital_id=ed.id,
            perfil_competitivo=perfil,
            cenarios_simulados=[
                {"cenario": "Target", "valor": 500, "margem": 47.1},
                {"cenario": "Medio", "valor": 440, "margem": 29.4},
                {"cenario": "Agressivo", "valor": 404, "margem": 18.8},
            ],
            created_at=now(),
        )
        db.add(est)
        print(f"  + EstrategiaEdital perfil={perfil} — edital={ed.numero or ed.id[:8]}")

    db.flush()


def seed_ch_concorrentes_desclass(db):
    """Adiciona desclassificacoes a concorrentes existentes para Score Qualidade."""
    concorrentes = db.query(Concorrente).limit(5).all()

    updated = 0
    for i, c in enumerate(concorrentes):
        if int(c.editais_participados or 0) < 3:
            c.editais_participados = 10 + i * 3
            c.editais_ganhos = 3 + i

        existing_desclass = db.query(ParticipacaoEdital).filter(
            ParticipacaoEdital.concorrente_id == c.id,
            ParticipacaoEdital.desclassificado == True,
        ).count()

        if existing_desclass == 0 and i % 2 == 0:
            editais = db.query(Edital).filter(Edital.empresa_id == CH_EMPRESA_ID).limit(2).all()
            for ed in editais[:1]:
                part = ParticipacaoEdital(
                    id=uid(),
                    edital_id=ed.id,
                    concorrente_id=c.id,
                    desclassificado=True,
                    motivo_desclassificacao="Documentação incompleta",
                    posicao_final=None,
                    created_at=now(),
                )
                db.add(part)
                updated += 1

    if updated:
        print(f"  + {updated} desclassificacoes adicionadas a concorrentes")
    db.flush()


def seed_ch_preco_camadas(db):
    """Garante PrecoCamada completas A-F para vinculos de CH."""
    vinculos = db.query(EditalItemProduto).filter(
        EditalItemProduto.empresa_id == CH_EMPRESA_ID
    ).limit(5).all()

    created = 0
    for v in vinculos:
        existing = db.query(PrecoCamada).filter_by(edital_item_produto_id=v.id).first()
        if existing:
            if not existing.custo_base_final:
                existing.custo_base_final = Decimal("340.00")
                existing.lance_inicial = Decimal("495.00")
                existing.lance_minimo = Decimal("385.00")
                existing.margem_minima = Decimal("13.24")
                existing.target_referencia = Decimal("500.00")
                existing.preco_medio_historico = Decimal("440.00")
            continue

        pc = PrecoCamada(
            id=uid(),
            edital_item_produto_id=v.id,
            user_id=VALIDA1_USER_ID,
            empresa_id=CH_EMPRESA_ID,
            custo_base_final=Decimal("340.00"),
            preco_base=Decimal("459.00"),
            target_referencia=Decimal("500.00"),
            lance_inicial=Decimal("495.00"),
            lance_minimo=Decimal("385.00"),
            margem_minima=Decimal("13.24"),
            preco_medio_historico=Decimal("440.00"),
            created_at=now(),
        )
        db.add(pc)
        created += 1

    if created:
        print(f"  + {created} PrecoCamada A-F criadas")
    db.flush()


def seed_ch_monitoramento_sessao(db):
    """Cria monitoramento tipo sessao_pregao."""
    existing = db.query(Monitoramento).filter_by(
        empresa_id=CH_EMPRESA_ID, tipo='sessao_pregao'
    ).first()
    if existing:
        return

    editais = db.query(Edital).filter(Edital.empresa_id == CH_EMPRESA_ID).limit(1).all()
    if not editais:
        return

    m = Monitoramento(
        id=uid(),
        user_id=VALIDA1_USER_ID,
        empresa_id=CH_EMPRESA_ID,
        tipo='sessao_pregao',
        edital_id=editais[0].id,
        termo="Sessão de Pregão — Reagentes Hematologia",
        frequencia_horas=1,
        notificar_email=True,
        ativo=True,
        created_at=now(),
    )
    db.add(m)
    print("  + Monitoramento sessao_pregao criado")
    db.flush()


# ==================== RP3X ====================

def seed_rp3x(db):
    """Seed mínimo para RP3X: 1 sessao encerrada + empenhos com datas variadas."""
    rp3x_id = get_rp3x_empresa_id(db)
    if not rp3x_id:
        print("  [SKIP] RP3X empresa nao encontrada")
        return

    editais = db.query(Edital).filter(Edital.empresa_id == rp3x_id).limit(2).all()
    if not editais:
        print("  [SKIP] Sem editais para RP3X")
        return

    # Sessao encerrada
    existing_sessao = db.query(SessaoPregao).filter_by(empresa_id=rp3x_id).first()
    if not existing_sessao:
        sessao = SessaoPregao(
            id=uid(),
            user_id=VALIDA2_USER_ID,
            empresa_id=rp3x_id,
            edital_id=editais[0].id,
            modalidade="aberto",
            status="encerrada",
            fase_atual="encerrada",
            autonomia="copiloto",
            resultado="vitoria",
            posicao_final=1,
            lance_final=Decimal("220.0000"),
            margem_final=Decimal("18.50"),
            created_at=now(),
        )
        db.add(sessao)
        print("  + SessaoPregao RP3X (encerrada/vitoria)")

    # Contratos com datas para Tempo Empenho
    contratos = db.query(Contrato).filter(Contrato.empresa_id == rp3x_id).limit(3).all()
    if contratos:
        from empenho_routes import Empenho
        for i, c in enumerate(contratos):
            existing = db.query(Empenho).filter(Empenho.contrato_id == c.id).first()
            if existing:
                continue
            dias = [15, 42, 78][i % 3]
            data_emp = c.data_assinatura + timedelta(days=dias) if c.data_assinatura else now().date()
            emp = Empenho(
                id=uid(),
                contrato_id=c.id,
                user_id=VALIDA2_USER_ID,
                empresa_id=rp3x_id,
                numero_empenho=f"2026NE{1000+i}",
                data_empenho=data_emp if isinstance(data_emp, (date, datetime)) else now(),
                valor_empenhado=Decimal("50000.00") + Decimal(str(i * 10000)),
                created_at=now(),
            )
            db.add(emp)
            print(f"  + Empenho RP3X — {dias} dias apos assinatura")

    db.flush()


# ==================== MAIN ====================

def run():
    db = SessionLocal()
    try:
        existing = db.query(AuditoriaLog).filter(
            AuditoriaLog.acao == SEED_MARK
        ).first()
        if existing:
            print(f"Seed {SEED_MARK} ja executado. Executando novamente (idempotente)...")

        print("\n=== SPRINT 9 SEED ===\n")

        print("[CH Hospitalar]")
        seed_ch_preco_camadas(db)
        seed_ch_estrategia(db)
        sessao_ids = seed_ch_sessoes(db)
        seed_ch_lances_sessao(db, sessao_ids)
        seed_ch_concorrentes_desclass(db)
        seed_ch_monitoramento_sessao(db)

        print("\n[RP3X]")
        seed_rp3x(db)

        if not existing:
            db.add(AuditoriaLog(
                id=uid(),
                user_id=VALIDA1_USER_ID,
                acao=SEED_MARK,
                entidade="seed",
                entidade_id="sprint9",
                dados_depois={"data": now().isoformat()},
                created_at=now(),
            ))

        db.commit()
        print("\n=== SEED SPRINT 9 COMPLETO ===\n")

    except Exception as e:
        db.rollback()
        print(f"\n[ERRO] {e}")
        import traceback
        traceback.print_exc()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    run()
