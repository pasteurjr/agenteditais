"""
Rotas custom para Sprint 5 V3 — Grupo A: Execucao (UC-CT07 a UC-CT10)
Endpoints de Empenhos, Auditoria, Contratos a Vencer, KPIs Execucao
"""
from flask import Blueprint, request, jsonify
from functools import wraps
import jwt as pyjwt
import io
import csv
from datetime import datetime, date, timedelta
from decimal import Decimal
from sqlalchemy import func, and_, or_

from models import (
    get_db,
    Empenho, EmpenhoItem, EmpenhoFatura,
    Contrato, ContratoEntrega, UsuarioEmpresa,
)
from config import JWT_SECRET_KEY as JWT_SECRET

empenho_bp = Blueprint('empenho', __name__)


# ─── Auth decorator (cópia leve do padrão) ────────────────────────────────────
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


def _dec(v):
    if v is None:
        return Decimal('0')
    if isinstance(v, Decimal):
        return v
    return Decimal(str(v))


def _contrato_scoped(db, contrato_id):
    """Retorna Contrato se existir e o user tiver acesso, senão None."""
    c = db.query(Contrato).filter(Contrato.id == contrato_id).first()
    if not c:
        return None
    if not request.is_super and c.empresa_id and c.empresa_id != request.empresa_id:
        return None
    return c


def _empenho_scoped(db, empenho_id):
    e = db.query(Empenho).filter(Empenho.id == empenho_id).first()
    if not e:
        return None
    if not request.is_super and e.empresa_id and e.empresa_id != request.empresa_id:
        return None
    return e


# ══════════════════════════════════════════════════════════════════════════════
# UC-CT07 — Empenhos com Saldo
# ══════════════════════════════════════════════════════════════════════════════

@empenho_bp.route('/api/contratos/<contrato_id>/empenhos', methods=['GET'])
@require_auth
def list_empenhos_contrato(contrato_id):
    db = get_db()
    try:
        c = _contrato_scoped(db, contrato_id)
        if not c:
            return jsonify({"error": "Contrato não encontrado"}), 404

        empenhos = db.query(Empenho).filter(Empenho.contrato_id == contrato_id).all()
        result = []
        for emp in empenhos:
            # Total faturado (status = paga)
            total_pago = db.query(func.coalesce(func.sum(EmpenhoFatura.valor_fatura), 0)).filter(
                EmpenhoFatura.empenho_id == emp.id,
                EmpenhoFatura.status == 'paga'
            ).scalar() or 0
            total_faturado = db.query(func.coalesce(func.sum(EmpenhoFatura.valor_fatura), 0)).filter(
                EmpenhoFatura.empenho_id == emp.id,
                EmpenhoFatura.status != 'cancelada'
            ).scalar() or 0
            saldo = _dec(emp.valor_empenhado) - _dec(total_faturado)

            d = emp.to_dict()
            d['total_faturado'] = float(total_faturado)
            d['total_pago'] = float(total_pago)
            d['saldo'] = float(saldo)
            d['saldo_pct'] = float(saldo / _dec(emp.valor_empenhado) * 100) if _dec(emp.valor_empenhado) > 0 else 0
            result.append(d)
        return jsonify({"empenhos": result, "total": len(result)}), 200
    finally:
        db.close()


@empenho_bp.route('/api/empenhos/<empenho_id>/saldo', methods=['GET'])
@require_auth
def empenho_saldo(empenho_id):
    db = get_db()
    try:
        emp = _empenho_scoped(db, empenho_id)
        if not emp:
            return jsonify({"error": "Empenho não encontrado"}), 404

        total_faturado = db.query(func.coalesce(func.sum(EmpenhoFatura.valor_fatura), 0)).filter(
            EmpenhoFatura.empenho_id == empenho_id,
            EmpenhoFatura.status != 'cancelada'
        ).scalar() or 0
        total_pago = db.query(func.coalesce(func.sum(EmpenhoFatura.valor_fatura), 0)).filter(
            EmpenhoFatura.empenho_id == empenho_id,
            EmpenhoFatura.status == 'paga'
        ).scalar() or 0
        saldo = _dec(emp.valor_empenhado) - _dec(total_faturado)

        itens = db.query(EmpenhoItem).filter(EmpenhoItem.empenho_id == empenho_id).all()
        faturas = db.query(EmpenhoFatura).filter(EmpenhoFatura.empenho_id == empenho_id).all()

        return jsonify({
            "empenho": emp.to_dict(),
            "valor_empenhado": float(_dec(emp.valor_empenhado)),
            "total_faturado": float(total_faturado),
            "total_pago": float(total_pago),
            "saldo": float(saldo),
            "saldo_pct": float(saldo / _dec(emp.valor_empenhado) * 100) if _dec(emp.valor_empenhado) > 0 else 0,
            "itens": [i.to_dict() for i in itens],
            "faturas": [f.to_dict() for f in faturas],
        }), 200
    finally:
        db.close()


@empenho_bp.route('/api/empenhos/<empenho_id>/alertas-consumo', methods=['GET'])
@require_auth
def empenho_alertas_consumo(empenho_id):
    """UC-CT07: alerta para itens sem valor (gera_valor=False) consumidos acima do limite."""
    db = get_db()
    try:
        emp = _empenho_scoped(db, empenho_id)
        if not emp:
            return jsonify({"error": "Empenho não encontrado"}), 404

        itens = db.query(EmpenhoItem).filter(
            EmpenhoItem.empenho_id == empenho_id,
            EmpenhoItem.gera_valor == False
        ).all()

        alertas = []
        for item in itens:
            # Soma das entregas vinculadas a este item
            total_entregue = db.query(func.coalesce(func.sum(ContratoEntrega.quantidade), 0)).filter(
                ContratoEntrega.empenho_item_id == item.id,
                ContratoEntrega.status == 'entregue'
            ).scalar() or 0
            qtd_contratada = _dec(item.quantidade)
            if qtd_contratada <= 0:
                continue
            consumo_pct = float(_dec(total_entregue) / qtd_contratada * 100)
            limite = item.limite_consumo_pct or 100.0
            if consumo_pct > limite:
                alertas.append({
                    "item_id": item.id,
                    "descricao": item.descricao,
                    "quantidade_contratada": float(qtd_contratada),
                    "total_entregue": float(total_entregue),
                    "consumo_pct": consumo_pct,
                    "limite_pct": limite,
                    "excesso_pct": consumo_pct - limite,
                    "nivel": "critico" if consumo_pct > limite * 1.2 else "alto",
                })
        return jsonify({"alertas": alertas, "total": len(alertas)}), 200
    finally:
        db.close()


# ══════════════════════════════════════════════════════════════════════════════
# UC-CT08 — Auditoria Empenho × Fatura × Entrega × Saldo
# ══════════════════════════════════════════════════════════════════════════════

def _build_auditoria(db, contrato_id):
    empenhos = db.query(Empenho).filter(Empenho.contrato_id == contrato_id).all()
    linhas = []
    totais = {
        "total_empenhado": Decimal('0'),
        "total_faturado": Decimal('0'),
        "total_pago": Decimal('0'),
        "total_entregue": Decimal('0'),
        "total_saldo": Decimal('0'),
    }
    for emp in empenhos:
        faturas = db.query(EmpenhoFatura).filter(EmpenhoFatura.empenho_id == emp.id).all()
        total_fat = sum((_dec(f.valor_fatura) for f in faturas if f.status != 'cancelada'), Decimal('0'))
        total_pago = sum((_dec(f.valor_fatura) for f in faturas if f.status == 'paga'), Decimal('0'))

        # Entregas vinculadas a faturas deste empenho
        fatura_ids = [f.id for f in faturas]
        if fatura_ids:
            total_entregue_valor = db.query(
                func.coalesce(func.sum(ContratoEntrega.valor_total), 0)
            ).filter(ContratoEntrega.fatura_id.in_(fatura_ids)).scalar() or 0
        else:
            total_entregue_valor = 0

        saldo = _dec(emp.valor_empenhado) - total_fat
        divergencia = abs(total_fat - _dec(total_entregue_valor))

        linhas.append({
            "empenho_id": emp.id,
            "numero_empenho": emp.numero_empenho,
            "data_empenho": emp.data_empenho.isoformat() if emp.data_empenho else None,
            "valor_empenhado": float(_dec(emp.valor_empenhado)),
            "total_faturado": float(total_fat),
            "total_pago": float(total_pago),
            "total_entregue_valor": float(total_entregue_valor),
            "saldo": float(saldo),
            "divergencia": float(divergencia),
            "status": emp.status,
            "tem_divergencia": divergencia > Decimal('0.01'),
        })
        totais["total_empenhado"] += _dec(emp.valor_empenhado)
        totais["total_faturado"] += total_fat
        totais["total_pago"] += total_pago
        totais["total_entregue"] += _dec(total_entregue_valor)
        totais["total_saldo"] += saldo

    return linhas, {k: float(v) for k, v in totais.items()}


@empenho_bp.route('/api/contratos/<contrato_id>/auditoria-empenhos', methods=['GET'])
@require_auth
def auditoria_empenhos(contrato_id):
    db = get_db()
    try:
        c = _contrato_scoped(db, contrato_id)
        if not c:
            return jsonify({"error": "Contrato não encontrado"}), 404
        linhas, totais = _build_auditoria(db, contrato_id)
        return jsonify({
            "contrato_id": contrato_id,
            "contrato_numero": c.numero_contrato,
            "linhas": linhas,
            "totais": totais,
            "divergencias_encontradas": sum(1 for l in linhas if l["tem_divergencia"]),
        }), 200
    finally:
        db.close()


@empenho_bp.route('/api/contratos/<contrato_id>/auditoria-empenhos/export', methods=['GET'])
@require_auth
def auditoria_empenhos_export(contrato_id):
    from flask import Response
    db = get_db()
    try:
        c = _contrato_scoped(db, contrato_id)
        if not c:
            return jsonify({"error": "Contrato não encontrado"}), 404
        fmt = request.args.get('format', 'csv').lower()
        linhas, totais = _build_auditoria(db, contrato_id)

        # CSV (suficiente para Excel abrir); PDF ficaria para etapa futura
        output = io.StringIO()
        writer = csv.writer(output, delimiter=';')
        writer.writerow(['Empenho', 'Data', 'Valor Empenhado', 'Faturado', 'Pago', 'Entregue', 'Saldo', 'Divergência', 'Status'])
        for l in linhas:
            writer.writerow([
                l['numero_empenho'], l['data_empenho'], l['valor_empenhado'],
                l['total_faturado'], l['total_pago'], l['total_entregue_valor'],
                l['saldo'], l['divergencia'], l['status']
            ])
        writer.writerow([])
        writer.writerow(['TOTAIS', '', totais['total_empenhado'], totais['total_faturado'],
                         totais['total_pago'], totais['total_entregue'], totais['total_saldo'], '', ''])
        csv_data = output.getvalue()
        output.close()
        return Response(
            csv_data,
            mimetype='text/csv',
            headers={'Content-Disposition': f'attachment; filename=auditoria_empenhos_{contrato_id}.csv'}
        )
    finally:
        db.close()


# ══════════════════════════════════════════════════════════════════════════════
# UC-CT09 — Contratos a Vencer (tiers)
# ══════════════════════════════════════════════════════════════════════════════

@empenho_bp.route('/api/dashboard/contratos-vencer', methods=['GET'])
@require_auth
def dashboard_contratos_vencer():
    db = get_db()
    try:
        hoje = date.today()
        d30 = hoje + timedelta(days=30)
        d90 = hoje + timedelta(days=90)

        q = db.query(Contrato)
        if not request.is_super and request.empresa_id:
            q = q.filter(Contrato.empresa_id == request.empresa_id)

        all_contratos = q.all()
        tiers = {
            "vencer_30": [],
            "vencer_90": [],
            "em_tratativa": [],
            "renovados": [],
            "nao_renovados": [],
        }
        for c in all_contratos:
            d = c.to_dict()
            tratativa = getattr(c, 'tratativa_status', None)
            if tratativa == 'renovado':
                tiers["renovados"].append(d)
                continue
            if tratativa == 'nao_renovado':
                tiers["nao_renovados"].append(d)
                continue
            if tratativa == 'em_tratativa':
                tiers["em_tratativa"].append(d)
                continue
            if c.data_fim:
                if c.data_fim <= d30 and c.data_fim >= hoje:
                    tiers["vencer_30"].append(d)
                elif c.data_fim <= d90 and c.data_fim > d30:
                    tiers["vencer_90"].append(d)

        return jsonify({
            "tiers": tiers,
            "counts": {k: len(v) for k, v in tiers.items()},
        }), 200
    finally:
        db.close()


@empenho_bp.route('/api/contratos/<contrato_id>/tratativa', methods=['PUT'])
@require_auth
def atualizar_tratativa(contrato_id):
    db = get_db()
    try:
        c = _contrato_scoped(db, contrato_id)
        if not c:
            return jsonify({"error": "Contrato não encontrado"}), 404
        data = request.get_json() or {}
        novo_status = data.get('tratativa_status')
        valid = ['em_tratativa', 'renovado', 'nao_renovado', None, '']
        if novo_status not in valid:
            return jsonify({"error": f"Status inválido. Use: {valid}"}), 400
        c.tratativa_status = novo_status or None
        if 'tratativa_observacoes' in data:
            c.tratativa_observacoes = data.get('tratativa_observacoes')
        if data.get('data_renovacao'):
            try:
                c.data_renovacao = datetime.strptime(data['data_renovacao'], '%Y-%m-%d').date()
            except ValueError:
                pass
        db.commit()
        return jsonify({"success": True, "contrato": c.to_dict()}), 200
    finally:
        db.close()


# ══════════════════════════════════════════════════════════════════════════════
# UC-CT10 — KPIs Execução
# ══════════════════════════════════════════════════════════════════════════════

@empenho_bp.route('/api/dashboard/kpis-execucao', methods=['GET'])
@require_auth
def kpis_execucao():
    db = get_db()
    try:
        hoje = date.today()
        d30 = hoje + timedelta(days=30)
        d90 = hoje + timedelta(days=90)

        q = db.query(Contrato)
        if not request.is_super and request.empresa_id:
            q = q.filter(Contrato.empresa_id == request.empresa_id)
        contratos = q.all()

        ativos = [c for c in contratos if (c.status == 'vigente') or (c.data_fim and c.data_fim >= hoje and c.status not in ('encerrado', 'rescindido'))]
        vencer_30 = [c for c in contratos if c.data_fim and hoje <= c.data_fim <= d30]
        vencer_90 = [c for c in contratos if c.data_fim and d30 < c.data_fim <= d90]
        em_tratativa = [c for c in contratos if getattr(c, 'tratativa_status', None) == 'em_tratativa']
        renovados = [c for c in contratos if getattr(c, 'tratativa_status', None) == 'renovado']
        nao_renovados = [c for c in contratos if getattr(c, 'tratativa_status', None) == 'nao_renovado']

        return jsonify({
            "kpis": {
                "contratos_ativos": len(ativos),
                "vencer_30_dias": len(vencer_30),
                "vencer_90_dias": len(vencer_90),
                "em_tratativa": len(em_tratativa),
                "renovados": len(renovados),
                "nao_renovados": len(nao_renovados),
            },
            "periodo": {"hoje": hoje.isoformat(), "d30": d30.isoformat(), "d90": d90.isoformat()},
        }), 200
    finally:
        db.close()
