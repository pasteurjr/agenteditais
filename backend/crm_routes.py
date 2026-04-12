"""
Rotas custom para Sprint 5 V3 — Grupo B: CRM (UC-CRM01 a UC-CRM07)
Pipeline kanban, parametrizacoes, mapa, agenda, KPIs, decisoes.
"""
from flask import Blueprint, request, jsonify
from functools import wraps
import jwt as pyjwt
import uuid
from datetime import datetime, date, timedelta
from decimal import Decimal
from sqlalchemy import func, and_, or_

from models import (
    get_db,
    Edital, Contrato,
    CRMParametrizacao, EditalDecisao, CRMAgendaItem,
    UsuarioEmpresa,
)
from config import JWT_SECRET_KEY as JWT_SECRET

crm_bp = Blueprint('crm', __name__)


# ─── Auth ─────────────────────────────────────────────────────────────────────
def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({"error": "Token não fornecido"}), 401
        token = auth_header.split(' ')[1]
        try:
            payload = pyjwt.decode(token, JWT_SECRET, algorithms=["HS256"])
            request.user_id = payload["user_id"]
            request.empresa_id = payload.get("empresa_id")
            request.is_super = payload.get("is_super", False)
            if not request.empresa_id:
                db = get_db()
                try:
                    ue = db.query(UsuarioEmpresa).filter(
                        UsuarioEmpresa.user_id == request.user_id,
                        UsuarioEmpresa.ativo == True
                    ).first()
                    request.empresa_id = ue.empresa_id if ue else None
                finally:
                    db.close()
        except pyjwt.ExpiredSignatureError:
            return jsonify({"error": "Token expirado"}), 401
        except pyjwt.InvalidTokenError:
            return jsonify({"error": "Token inválido"}), 401
        return f(*args, **kwargs)
    return decorated


# Definicao dos 13 stages e ordem do pipeline
PIPELINE_STAGES = [
    {"id": "captado_nao_divulgado", "label": "Editais Não Divulgados Captados", "color": "#94a3b8"},
    {"id": "captado_divulgado", "label": "Editais Divulgados Captados", "color": "#60a5fa"},
    {"id": "em_analise", "label": "Editais em Análise", "color": "#3b82f6"},
    {"id": "lead_potencial", "label": "Leads Potenciais", "color": "#8b5cf6"},
    {"id": "monitoramento_concorrencia", "label": "Monitoramento da Concorrência", "color": "#a78bfa"},
    {"id": "em_impugnacao", "label": "Em Processo de Impugnação", "color": "#f59e0b"},
    {"id": "fase_propostas", "label": "Em Fase de Propostas", "color": "#eab308"},
    {"id": "proposta_submetida", "label": "Propostas Submetidas", "color": "#facc15"},
    {"id": "espera_resultado", "label": "Em Espera de Resultados", "color": "#fb923c"},
    {"id": "ganho_provisorio", "label": "Ganho Provisório e Habilitação", "color": "#22d3ee"},
    {"id": "processo_recurso", "label": "Processos e Recursos", "color": "#06b6d4"},
    {"id": "contra_razao", "label": "Contra Razões", "color": "#0891b2"},
    {"id": "resultado_definitivo", "label": "Resultados Definitivos", "color": "#16a34a"},
]

# Mapeamento status legado -> pipeline_stage
STATUS_TO_STAGE = {
    'novo': 'captado_divulgado',
    'analisando': 'em_analise',
    'participando': 'lead_potencial',
    'proposta_enviada': 'proposta_submetida',
    'em_pregao': 'espera_resultado',
    'vencedor': 'resultado_definitivo',
    'ganho': 'resultado_definitivo',
    'perdedor': 'resultado_definitivo',
    'perdido': 'resultado_definitivo',
    'cancelado': None,
    'desistido': 'monitoramento_concorrencia',
}

STAGE_SUBSTAGE_DEFAULT = {
    'vencedor': 'ganho_definitivo',
    'ganho': 'ganho_definitivo',
    'perdedor': 'perdido_definitivo',
    'perdido': 'perdido_definitivo',
}


# ══════════════════════════════════════════════════════════════════════════════
# UC-CRM01 — Pipeline Kanban
# ══════════════════════════════════════════════════════════════════════════════

@crm_bp.route('/api/crm/pipeline', methods=['GET'])
@require_auth
def get_pipeline():
    db = get_db()
    try:
        q = db.query(Edital)
        if not request.is_super and request.empresa_id:
            q = q.filter(Edital.empresa_id == request.empresa_id)
        editais = q.all()

        # Agrupar por stage (usando fallback do status legado se pipeline_stage for null)
        grouped = {s["id"]: [] for s in PIPELINE_STAGES}
        for e in editais:
            stage = e.pipeline_stage
            if not stage:
                stage = STATUS_TO_STAGE.get(e.status or '')
            if not stage:
                continue
            if stage not in grouped:
                continue
            grouped[stage].append({
                "id": e.id,
                "numero": e.numero,
                "orgao": e.orgao,
                "uf": e.uf,
                "objeto": (e.objeto or '')[:120],
                "valor_referencia": float(e.valor_referencia) if e.valor_referencia else None,
                "data_abertura": e.data_abertura.isoformat() if e.data_abertura else None,
                "pipeline_stage": stage,
                "pipeline_substage": e.pipeline_substage,
                "pipeline_tipo_venda": e.pipeline_tipo_venda,
                "vendedor_responsavel": e.vendedor_responsavel,
                "status": e.status,
            })

        result = []
        for s in PIPELINE_STAGES:
            result.append({
                "stage": s["id"],
                "label": s["label"],
                "color": s["color"],
                "count": len(grouped[s["id"]]),
                "editais": grouped[s["id"]],
            })
        return jsonify({"pipeline": result, "stages": PIPELINE_STAGES}), 200
    finally:
        db.close()


@crm_bp.route('/api/editais/<edital_id>/pipeline-stage', methods=['PUT'])
@require_auth
def move_edital_stage(edital_id):
    db = get_db()
    try:
        e = db.query(Edital).filter(Edital.id == edital_id).first()
        if not e:
            return jsonify({"error": "Edital não encontrado"}), 404
        if not request.is_super and e.empresa_id and e.empresa_id != request.empresa_id:
            return jsonify({"error": "Acesso negado"}), 403
        data = request.get_json() or {}
        stage = data.get('pipeline_stage')
        valid_ids = [s["id"] for s in PIPELINE_STAGES]
        if stage not in valid_ids:
            return jsonify({"error": f"Stage inválido. Use: {valid_ids}"}), 400
        e.pipeline_stage = stage
        if 'pipeline_substage' in data:
            e.pipeline_substage = data.get('pipeline_substage')
        if 'pipeline_tipo_venda' in data:
            e.pipeline_tipo_venda = data.get('pipeline_tipo_venda')
        if 'vendedor_responsavel' in data:
            e.vendedor_responsavel = data.get('vendedor_responsavel')
        db.commit()
        return jsonify({
            "success": True,
            "edital_id": edital_id,
            "pipeline_stage": e.pipeline_stage,
            "pipeline_substage": e.pipeline_substage,
        }), 200
    finally:
        db.close()


# ══════════════════════════════════════════════════════════════════════════════
# UC-CRM02 — Parametrizacoes (seed + CRUD leve)
# ══════════════════════════════════════════════════════════════════════════════

SEED_PARAMETRIZACOES = {
    'tipo_edital': [
        'Aquisição Equipamentos', 'Aquisição Reag + Equip', 'Aquisição Reagentes',
        'Comodato', 'Locação', 'Locação + Reagentes', 'Manutenção', 'Material de Laboratório',
    ],
    'agrupamento_portfolio': [
        'Point Of Care', 'Gasometria', 'Bioquímica', 'Coagulação', 'ELISA',
        'Hematologia', 'Imunohematologia', 'Teste Rápido', 'Urinálise',
        'Quimioluminescência', 'Íon Seletivo', 'Aglutinação', 'Diversos',
    ],
    'motivo_derrota': [
        'Administrativo', 'Exclusivo para ME/EPP', 'Falha operacional',
        'Não tem documento', 'Não atende especificação', 'Inviável comercialmente',
        'Não tem equipamento',
    ],
}


@crm_bp.route('/api/crm/parametrizacoes/seed', methods=['POST'])
@require_auth
def seed_parametrizacoes():
    db = get_db()
    try:
        created = 0
        for tipo, valores in SEED_PARAMETRIZACOES.items():
            for ordem, valor in enumerate(valores):
                q = db.query(CRMParametrizacao).filter(
                    CRMParametrizacao.tipo == tipo,
                    CRMParametrizacao.valor == valor,
                )
                if request.empresa_id:
                    q = q.filter(CRMParametrizacao.empresa_id == request.empresa_id)
                existing = q.first()
                if existing:
                    continue
                p = CRMParametrizacao(
                    id=str(uuid.uuid4()),
                    empresa_id=request.empresa_id,
                    user_id=request.user_id,
                    tipo=tipo,
                    valor=valor,
                    ordem=ordem,
                    ativo=True,
                )
                db.add(p)
                created += 1
        db.commit()
        return jsonify({"success": True, "created": created}), 200
    finally:
        db.close()


# ══════════════════════════════════════════════════════════════════════════════
# UC-CRM03 — Mapa do Brasil
# ══════════════════════════════════════════════════════════════════════════════

# Coordenadas aproximadas das capitais brasileiras (lat, lon)
UF_COORDS = {
    'AC': (-9.97, -67.81), 'AL': (-9.66, -35.73), 'AP': (0.03, -51.07),
    'AM': (-3.12, -60.02), 'BA': (-12.97, -38.50), 'CE': (-3.73, -38.52),
    'DF': (-15.78, -47.93), 'ES': (-20.32, -40.34), 'GO': (-16.68, -49.25),
    'MA': (-2.53, -44.30), 'MT': (-15.60, -56.10), 'MS': (-20.44, -54.65),
    'MG': (-19.92, -43.94), 'PA': (-1.46, -48.50), 'PB': (-7.12, -34.86),
    'PR': (-25.43, -49.27), 'PE': (-8.05, -34.88), 'PI': (-5.09, -42.80),
    'RJ': (-22.91, -43.20), 'RN': (-5.79, -35.21), 'RS': (-30.03, -51.23),
    'RO': (-8.76, -63.90), 'RR': (2.82, -60.67), 'SC': (-27.59, -48.55),
    'SP': (-23.55, -46.63), 'SE': (-10.95, -37.07), 'TO': (-10.18, -48.33),
}


@crm_bp.route('/api/crm/mapa', methods=['GET'])
@require_auth
def get_mapa():
    db = get_db()
    try:
        q = db.query(Edital)
        if not request.is_super and request.empresa_id:
            q = q.filter(Edital.empresa_id == request.empresa_id)
        # Filtros opcionais
        vendedor = request.args.get('vendedor')
        if vendedor:
            q = q.filter(Edital.vendedor_responsavel == vendedor)
        stage = request.args.get('stage')
        if stage:
            q = q.filter(Edital.pipeline_stage == stage)
        editais = q.all()

        # Agrupar por UF
        uf_data = {}
        for e in editais:
            uf = e.uf
            if not uf or uf not in UF_COORDS:
                continue
            if uf not in uf_data:
                lat, lon = UF_COORDS[uf]
                uf_data[uf] = {"uf": uf, "lat": lat, "lon": lon, "editais": [], "stages": {}}
            stage_atual = e.pipeline_stage or STATUS_TO_STAGE.get(e.status or '') or 'captado_divulgado'
            uf_data[uf]["editais"].append({
                "id": e.id,
                "numero": e.numero,
                "orgao": e.orgao,
                "pipeline_stage": stage_atual,
                "valor_referencia": float(e.valor_referencia) if e.valor_referencia else None,
            })
            uf_data[uf]["stages"][stage_atual] = uf_data[uf]["stages"].get(stage_atual, 0) + 1

        return jsonify({"ufs": list(uf_data.values()), "total_editais": len(editais)}), 200
    finally:
        db.close()


# ══════════════════════════════════════════════════════════════════════════════
# UC-CRM04 — Agenda
# ══════════════════════════════════════════════════════════════════════════════

@crm_bp.route('/api/crm/agenda', methods=['GET'])
@require_auth
def get_agenda():
    db = get_db()
    try:
        hoje = datetime.now()
        items = []

        # Itens manuais do CRMAgendaItem
        q = db.query(CRMAgendaItem)
        if not request.is_super and request.empresa_id:
            q = q.filter(
                or_(CRMAgendaItem.empresa_id == request.empresa_id, CRMAgendaItem.empresa_id.is_(None))
            )
        for it in q.all():
            items.append({
                "id": it.id,
                "origem": "manual",
                "titulo": it.titulo,
                "descricao": it.descricao,
                "responsavel": it.responsavel,
                "data_limite": it.data_limite.isoformat() if it.data_limite else None,
                "urgencia": it.urgencia,
                "concluido": it.concluido,
                "pipeline_stage": it.pipeline_stage,
                "edital_id": it.edital_id,
                "contrato_id": it.contrato_id,
            })

        # Itens auto-gerados a partir de prazos dos editais
        qe = db.query(Edital)
        if not request.is_super and request.empresa_id:
            qe = qe.filter(Edital.empresa_id == request.empresa_id)
        for e in qe.all():
            if e.data_limite_proposta and e.data_limite_proposta >= hoje:
                dias = (e.data_limite_proposta - hoje).days
                items.append({
                    "id": f"auto-prop-{e.id}",
                    "origem": "auto",
                    "titulo": f"Prazo proposta: {e.numero}",
                    "descricao": (e.objeto or '')[:100],
                    "responsavel": e.vendedor_responsavel,
                    "data_limite": e.data_limite_proposta.isoformat(),
                    "urgencia": "critica" if dias <= 1 else "alta" if dias <= 3 else "normal",
                    "concluido": False,
                    "pipeline_stage": e.pipeline_stage,
                    "edital_id": e.id,
                    "contrato_id": None,
                })
            if e.data_limite_impugnacao and e.data_limite_impugnacao >= hoje:
                dias = (e.data_limite_impugnacao - hoje).days
                items.append({
                    "id": f"auto-imp-{e.id}",
                    "origem": "auto",
                    "titulo": f"Prazo impugnação: {e.numero}",
                    "descricao": (e.objeto or '')[:100],
                    "responsavel": e.vendedor_responsavel,
                    "data_limite": e.data_limite_impugnacao.isoformat(),
                    "urgencia": "critica" if dias <= 1 else "alta" if dias <= 3 else "normal",
                    "concluido": False,
                    "pipeline_stage": e.pipeline_stage,
                    "edital_id": e.id,
                    "contrato_id": None,
                })

        items.sort(key=lambda x: x["data_limite"] or "9999-99-99")
        return jsonify({"items": items, "total": len(items)}), 200
    finally:
        db.close()


# ══════════════════════════════════════════════════════════════════════════════
# UC-CRM05 — KPIs CRM
# ══════════════════════════════════════════════════════════════════════════════

@crm_bp.route('/api/crm/kpis', methods=['GET'])
@require_auth
def get_kpis_crm():
    db = get_db()
    try:
        q = db.query(Edital)
        if not request.is_super and request.empresa_id:
            q = q.filter(Edital.empresa_id == request.empresa_id)
        editais = q.all()

        def stage_of(e):
            return e.pipeline_stage or STATUS_TO_STAGE.get(e.status or '')

        total = len(editais)
        analisados = [e for e in editais if stage_of(e) in ('em_analise', 'lead_potencial', 'fase_propostas', 'proposta_submetida', 'espera_resultado', 'ganho_provisorio', 'processo_recurso', 'contra_razao', 'resultado_definitivo')]
        participados = [e for e in editais if stage_of(e) in ('fase_propostas', 'proposta_submetida', 'espera_resultado', 'ganho_provisorio', 'processo_recurso', 'contra_razao', 'resultado_definitivo')]
        nao_participados = [e for e in editais if stage_of(e) == 'monitoramento_concorrencia']
        ganhos = [e for e in editais if e.pipeline_substage == 'ganho_definitivo' or (e.status in ('vencedor', 'ganho'))]
        perdidos = [e for e in editais if e.pipeline_substage == 'perdido_definitivo' or (e.status in ('perdedor', 'perdido'))]
        em_recurso = [e for e in editais if stage_of(e) == 'processo_recurso']
        em_contra_razao = [e for e in editais if stage_of(e) == 'contra_razao']

        valor_ganhos = sum(float(e.valor_referencia) for e in ganhos if e.valor_referencia)
        valor_participados = sum(float(e.valor_referencia) for e in participados if e.valor_referencia)

        ticket_medio_ganhos = (valor_ganhos / len(ganhos)) if ganhos else 0
        ticket_medio_participados = (valor_participados / len(participados)) if participados else 0

        taxa_participacao = (len(participados) / len(analisados) * 100) if analisados else 0
        taxa_vitoria = (len(ganhos) / len(participados) * 100) if participados else 0

        return jsonify({
            "kpis": {
                "total_editais": total,
                "analisados": len(analisados),
                "participados": len(participados),
                "nao_participados": len(nao_participados),
                "ganhos": len(ganhos),
                "perdidos": len(perdidos),
                "em_recurso": len(em_recurso),
                "em_contra_razao": len(em_contra_razao),
                "taxa_participacao_pct": round(taxa_participacao, 2),
                "taxa_vitoria_pct": round(taxa_vitoria, 2),
                "valor_ganhos": valor_ganhos,
                "valor_participados": valor_participados,
                "ticket_medio_ganhos": round(ticket_medio_ganhos, 2),
                "ticket_medio_participados": round(ticket_medio_participados, 2),
            }
        }), 200
    finally:
        db.close()


# ══════════════════════════════════════════════════════════════════════════════
# Migracao: preencher pipeline_stage a partir do status legado (UC-CRM01)
# ══════════════════════════════════════════════════════════════════════════════

@crm_bp.route('/api/crm/pipeline/migrate', methods=['POST'])
@require_auth
def migrate_pipeline_stages():
    """Preenche pipeline_stage para editais que ainda nao o tem, mapeando do status."""
    db = get_db()
    try:
        q = db.query(Edital).filter(Edital.pipeline_stage.is_(None))
        if not request.is_super and request.empresa_id:
            q = q.filter(Edital.empresa_id == request.empresa_id)
        editais = q.all()
        migrated = 0
        for e in editais:
            stage = STATUS_TO_STAGE.get(e.status or '')
            if stage:
                e.pipeline_stage = stage
                substage = STAGE_SUBSTAGE_DEFAULT.get(e.status or '')
                if substage:
                    e.pipeline_substage = substage
                migrated += 1
        db.commit()
        return jsonify({"success": True, "migrated": migrated, "total": len(editais)}), 200
    finally:
        db.close()
