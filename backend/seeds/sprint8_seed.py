"""
Seed Sprint 8 — popula dados para 5 UCs: Dispensas, Classes, Máscaras.

Execucao: cd backend && python -m seeds.sprint8_seed

Idempotente: usa marcador SPRINT8_SEED e checa duplicatas.

Cobre (CH Hospitalar — valida1):
  - 3 areas de produto (Diagnóstico, Equipamentos, Consumíveis)
  - 5 classes V2 vinculadas às áreas
  - 8 subclasses com campos_mascara
  - 6 dispensas (2 aberta, 2 cotacao_enviada, 1 adjudicada, 1 encerrada)
  - 2 produtos com descricao_normalizada + mascara_ativa

Cobre (RP3X — valida2):
  - 1 area, 2 classes, 3 subclasses
  - 2 dispensas
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
    AreaProduto, ClasseProdutoV2, SubclasseProduto,
    Dispensa,
)

SEED_MARK = "SPRINT8_SEED"

VALIDA1_USER_ID = "45fae79e-27dc-46e4-9b74-ed054ad3b7b1"
VALIDA2_USER_ID = "edc4ab79-8fae-4ae1-a3da-d652f8bf5720"
CH_EMPRESA_ID = "7dbdc60a-b806-4614-a024-a1d4841dc8c9"


def uid():
    return str(uuid.uuid4())


def now():
    return datetime(2026, 4, 16, 10, 0, 0)


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

def seed_ch_areas(db):
    areas_data = [
        ("Diagnóstico Laboratorial", "Reagentes, kits e insumos para análises clínicas"),
        ("Equipamentos Médicos", "Equipamentos de diagnóstico e análise"),
        ("Consumíveis Hospitalares", "Materiais descartáveis e de consumo"),
    ]
    created = 0
    ids = []
    for nome, desc in areas_data:
        if already_seeded(db, AreaProduto, nome=nome, empresa_id=CH_EMPRESA_ID):
            area = db.query(AreaProduto).filter_by(nome=nome, empresa_id=CH_EMPRESA_ID).first()
            ids.append(area.id)
            continue
        area = AreaProduto(
            id=uid(), empresa_id=CH_EMPRESA_ID,
            nome=nome, descricao=desc, ativo=True, ordem=len(ids),
        )
        db.add(area)
        ids.append(area.id)
        created += 1
    db.flush()
    print(f"  Areas: {created} criadas, {len(areas_data)-created} existentes")
    return ids


def seed_ch_classes(db, area_ids):
    classes_data = [
        (area_ids[0], "Reagentes Hematologia", "Reagentes para hemograma e coagulação"),
        (area_ids[0], "Kits Bioquímica", "Kits para dosagens bioquímicas"),
        (area_ids[1], "Analisadores Automatizados", "Equipamentos de análise automática"),
        (area_ids[1], "Microscopia", "Microscópios e acessórios"),
        (area_ids[2], "Descartáveis Laboratoriais", "Tubos, ponteiras, lâminas"),
    ]
    created = 0
    ids = []
    for area_id, nome, desc in classes_data:
        if already_seeded(db, ClasseProdutoV2, nome=nome, empresa_id=CH_EMPRESA_ID):
            cls = db.query(ClasseProdutoV2).filter_by(nome=nome, empresa_id=CH_EMPRESA_ID).first()
            ids.append(cls.id)
            continue
        cls = ClasseProdutoV2(
            id=uid(), empresa_id=CH_EMPRESA_ID,
            nome=nome, area_id=area_id, descricao=desc, ativo=True, ordem=len(ids),
        )
        db.add(cls)
        ids.append(cls.id)
        created += 1
    db.flush()
    print(f"  Classes V2: {created} criadas, {len(classes_data)-created} existentes")
    return ids


def seed_ch_subclasses(db, classe_ids):
    subclasses_data = [
        (classe_ids[0], "Hemograma Completo", ["3822.00.90"], [
            {"campo": "Volume", "tipo": "decimal", "unidade": "mL", "obrigatorio": True},
            {"campo": "Testes/Frasco", "tipo": "numero", "obrigatorio": True},
            {"campo": "Metodologia", "tipo": "texto", "obrigatorio": False},
        ]),
        (classe_ids[0], "Coagulação", ["3822.00.90"], [
            {"campo": "Parâmetro", "tipo": "select", "opcoes": ["TP", "TTPA", "Fibrinogênio"], "obrigatorio": True},
            {"campo": "Sensibilidade", "tipo": "texto", "obrigatorio": False},
        ]),
        (classe_ids[1], "Glicose/Colesterol", ["3822.00.90"], [
            {"campo": "Analito", "tipo": "texto", "obrigatorio": True},
            {"campo": "Método", "tipo": "select", "opcoes": ["Enzimático", "Colorimétrico"], "obrigatorio": True},
            {"campo": "Linearidade", "tipo": "texto", "unidade": "mg/dL", "obrigatorio": False},
        ]),
        (classe_ids[1], "Eletrólitos", ["3822.00.90"], [
            {"campo": "Íon", "tipo": "select", "opcoes": ["Na+", "K+", "Cl-", "Ca++"], "obrigatorio": True},
            {"campo": "Volume Amostra", "tipo": "decimal", "unidade": "µL", "obrigatorio": False},
        ]),
        (classe_ids[2], "Analisador Hematológico", ["9027.80.99"], [
            {"campo": "Parâmetros", "tipo": "numero", "obrigatorio": True},
            {"campo": "Velocidade", "tipo": "texto", "unidade": "amostras/hora", "obrigatorio": True},
            {"campo": "Volume Aspiração", "tipo": "decimal", "unidade": "µL", "obrigatorio": False},
        ]),
        (classe_ids[3], "Microscópio Óptico", ["9011.10.00"], [
            {"campo": "Objetivas", "tipo": "texto", "obrigatorio": True},
            {"campo": "Iluminação", "tipo": "select", "opcoes": ["LED", "Halógena"], "obrigatorio": True},
        ]),
        (classe_ids[4], "Tubos Coleta", ["3926.90.90"], [
            {"campo": "Volume", "tipo": "decimal", "unidade": "mL", "obrigatorio": True},
            {"campo": "Anticoagulante", "tipo": "select", "opcoes": ["EDTA", "Citrato", "Heparina", "Seco"], "obrigatorio": True},
            {"campo": "Cor Tampa", "tipo": "texto", "obrigatorio": False},
        ]),
        (classe_ids[4], "Ponteiras Micropipeta", ["3926.90.90"], [
            {"campo": "Faixa Volume", "tipo": "texto", "unidade": "µL", "obrigatorio": True},
            {"campo": "Compatibilidade", "tipo": "texto", "obrigatorio": False},
            {"campo": "Estéril", "tipo": "boolean", "obrigatorio": True},
        ]),
    ]
    created = 0
    ids = []
    for classe_id, nome, ncms, mascara in subclasses_data:
        if already_seeded(db, SubclasseProduto, nome=nome, empresa_id=CH_EMPRESA_ID):
            sub = db.query(SubclasseProduto).filter_by(nome=nome, empresa_id=CH_EMPRESA_ID).first()
            ids.append(sub.id)
            continue
        sub = SubclasseProduto(
            id=uid(), empresa_id=CH_EMPRESA_ID,
            nome=nome, classe_id=classe_id, ncms=ncms,
            campos_mascara=mascara, ativo=True, ordem=len(ids),
        )
        db.add(sub)
        ids.append(sub.id)
        created += 1
    db.flush()
    print(f"  Subclasses: {created} criadas, {len(subclasses_data)-created} existentes")
    return ids


def seed_ch_dispensas(db, edital_ids):
    dispensas_data = [
        (edital_ids[0], "75-I", 50000, "aberta", None),
        (edital_ids[1], "75-II", 100000, "aberta", None),
        (edital_ids[2], "75-I", 50000, "cotacao_enviada", "Cotação gerada via IA..."),
        (edital_ids[3], "75-II", 100000, "cotacao_enviada", "Proposta enviada ao órgão..."),
        (edital_ids[4] if len(edital_ids) > 4 else edital_ids[0], "75-I", 45000, "adjudicada", "Adjudicado."),
        (edital_ids[5] if len(edital_ids) > 5 else edital_ids[1], "75-II", 80000, "encerrada", "Contrato firmado."),
    ]
    created = 0
    for edital_id, artigo, limite, status, cotacao in dispensas_data:
        if already_seeded(db, Dispensa, edital_id=edital_id, empresa_id=CH_EMPRESA_ID):
            continue
        disp = Dispensa(
            id=uid(), user_id=VALIDA1_USER_ID, empresa_id=CH_EMPRESA_ID,
            edital_id=edital_id, artigo=artigo,
            valor_limite=Decimal(str(limite)), status=status,
            cotacao_texto=cotacao,
            data_limite=datetime.now() + timedelta(days=15),
        )
        db.add(disp)
        created += 1
    db.flush()
    print(f"  Dispensas: {created} criadas, {len(dispensas_data)-created} existentes")


def seed_ch_mascaras_produto(db, subclasse_ids):
    produtos = db.query(Produto).filter(
        Produto.empresa_id == CH_EMPRESA_ID,
        Produto.descricao_normalizada.is_(None),
    ).limit(2).all()

    updated = 0
    for i, prod in enumerate(produtos):
        if i < len(subclasse_ids):
            prod.subclasse_id = subclasse_ids[i]
        prod.descricao_normalizada = f"[NORMALIZADO] {prod.nome} — descrição padronizada para licitações públicas"
        prod.mascara_ativa = True
        prod.mascara_metadata = {
            "variantes": [f"{prod.nome} tipo A", f"{prod.nome} premium"],
            "sinonimos": ["reagente", "kit diagnóstico"],
            "score_antes": 45,
            "score_depois": 82,
        }
        updated += 1
    db.flush()
    print(f"  Produtos com máscara: {updated} atualizados")


def seed_ch(db):
    print("\n[CH Hospitalar]")

    editais = db.query(Edital).filter(Edital.empresa_id == CH_EMPRESA_ID).limit(6).all()
    edital_ids = [e.id for e in editais]
    if len(edital_ids) < 2:
        print("  AVISO: menos de 2 editais encontrados — dispensas parciais")
        return

    area_ids = seed_ch_areas(db)
    classe_ids = seed_ch_classes(db, area_ids)
    subclasse_ids = seed_ch_subclasses(db, classe_ids)
    seed_ch_dispensas(db, edital_ids)
    seed_ch_mascaras_produto(db, subclasse_ids)


# ==================== RP3X ====================

def seed_rp3x(db):
    print("\n[RP3X]")
    rp3x_eid = get_rp3x_empresa_id(db)
    if not rp3x_eid:
        print("  AVISO: empresa RP3X nao encontrada — skip")
        return

    # 1 area
    area = already_seeded(db, AreaProduto, nome="Impressão e Automação", empresa_id=rp3x_eid)
    if not area:
        area = AreaProduto(id=uid(), empresa_id=rp3x_eid, nome="Impressão e Automação", descricao="Impressoras e suprimentos", ativo=True)
        db.add(area)
        db.flush()
    area_id = area.id

    # 2 classes
    cls_names = ["Impressoras Laser", "Suprimentos Impressão"]
    cls_ids = []
    for nome in cls_names:
        cls = already_seeded(db, ClasseProdutoV2, nome=nome, empresa_id=rp3x_eid)
        if not cls:
            cls = ClasseProdutoV2(id=uid(), empresa_id=rp3x_eid, nome=nome, area_id=area_id, ativo=True)
            db.add(cls)
            db.flush()
        cls_ids.append(cls.id)

    # 3 subclasses
    subs_data = [
        (cls_ids[0], "Laser Mono", ["8443.32.99"], [{"campo": "Velocidade", "tipo": "numero", "unidade": "ppm", "obrigatorio": True}]),
        (cls_ids[0], "Laser Color", ["8443.32.99"], [{"campo": "Velocidade", "tipo": "numero", "unidade": "ppm", "obrigatorio": True}]),
        (cls_ids[1], "Toner", ["3707.90.29"], [{"campo": "Rendimento", "tipo": "numero", "unidade": "páginas", "obrigatorio": True}]),
    ]
    for classe_id, nome, ncms, mascara in subs_data:
        if not already_seeded(db, SubclasseProduto, nome=nome, empresa_id=rp3x_eid):
            db.add(SubclasseProduto(
                id=uid(), empresa_id=rp3x_eid, nome=nome,
                classe_id=classe_id, ncms=ncms, campos_mascara=mascara, ativo=True,
            ))
    db.flush()

    # 2 dispensas
    editais = db.query(Edital).filter(Edital.empresa_id == rp3x_eid).limit(2).all()
    for ed in editais:
        if not already_seeded(db, Dispensa, edital_id=ed.id, empresa_id=rp3x_eid):
            db.add(Dispensa(
                id=uid(), user_id=VALIDA2_USER_ID, empresa_id=rp3x_eid,
                edital_id=ed.id, artigo="75-I", valor_limite=Decimal("50000"),
                status="aberta", data_limite=datetime.now() + timedelta(days=20),
            ))
    db.flush()
    print("  RP3X seed completo")


def main():
    print("=" * 50)
    print("SEED SPRINT 8 — Dispensas + Classes + Máscaras")
    print("=" * 50)

    db = SessionLocal()
    try:
        seed_ch(db)
        seed_rp3x(db)
        db.commit()
        print("\n✓ Sprint 8 seed concluído com sucesso!")
    except Exception as e:
        db.rollback()
        print(f"\n✗ Erro: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
