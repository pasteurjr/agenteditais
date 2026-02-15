"""
Rotas CRUD genéricas para todas as tabelas de cadastro.
Registra endpoints REST: GET (list+search), GET/:id, POST, PUT/:id, DELETE/:id
"""
from flask import Blueprint, request, jsonify
from functools import wraps
import jwt as pyjwt
import uuid
from datetime import datetime
from decimal import Decimal, InvalidOperation

from models import (
    get_db, Base,
    User, Empresa, EmpresaDocumento, EmpresaCertidao, EmpresaResponsavel,
    Produto, ProdutoEspecificacao, ProdutoDocumento,
    FonteEdital, Edital, EditalRequisito, EditalDocumento, EditalItem,
    Analise, AnaliseDetalhe, Proposta,
    Concorrente, PrecoHistorico, ParticipacaoEdital,
    Alerta, Monitoramento, Notificacao, PreferenciasNotificacao,
    Documento, Contrato, ContratoEntrega, Recurso,
    LeadCRM, AcaoPosPerda, AuditoriaLog, AprendizadoFeedback,
    ParametroScore, Dispensa, EstrategiaEdital
)
from config import JWT_SECRET_KEY as JWT_SECRET

crud_bp = Blueprint('crud', __name__)


# ─── Auth decorator ────────────────────────────────────────────────────────────

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
        except pyjwt.ExpiredSignatureError:
            return jsonify({"error": "Token expirado"}), 401
        except pyjwt.InvalidTokenError:
            return jsonify({"error": "Token inválido"}), 401
        return f(*args, **kwargs)
    return decorated


def get_current_user_id():
    return getattr(request, 'user_id', None)


# ─── Table registry ────────────────────────────────────────────────────────────

# Maps table slug → { model, user_scoped, parent_fk, search_fields, label }
CRUD_TABLES = {
    # === Empresa ===
    "empresas": {
        "model": Empresa,
        "user_scoped": True,
        "search_fields": ["cnpj", "razao_social", "nome_fantasia", "cidade"],
        "label": "Empresa",
        "required": ["cnpj", "razao_social"],
    },
    "empresa-documentos": {
        "model": EmpresaDocumento,
        "user_scoped": False,
        "parent_fk": "empresa_id",
        "parent_model": Empresa,
        "search_fields": ["nome_arquivo", "tipo"],
        "label": "Documento da Empresa",
        "required": ["empresa_id", "tipo", "nome_arquivo", "path_arquivo"],
    },
    "empresa-certidoes": {
        "model": EmpresaCertidao,
        "user_scoped": False,
        "parent_fk": "empresa_id",
        "parent_model": Empresa,
        "search_fields": ["tipo", "orgao_emissor", "numero"],
        "label": "Certidão da Empresa",
        "required": ["empresa_id", "tipo", "data_vencimento"],
    },
    "empresa-responsaveis": {
        "model": EmpresaResponsavel,
        "user_scoped": False,
        "parent_fk": "empresa_id",
        "parent_model": Empresa,
        "search_fields": ["nome", "cargo", "email", "cpf"],
        "label": "Responsável da Empresa",
        "required": ["empresa_id", "nome"],
    },
    # === Portfolio ===
    "produtos": {
        "model": Produto,
        "user_scoped": True,
        "search_fields": ["nome", "codigo_interno", "fabricante", "modelo", "ncm"],
        "label": "Produto",
        "required": ["nome", "categoria"],
    },
    "produtos-especificacoes": {
        "model": ProdutoEspecificacao,
        "user_scoped": False,
        "parent_fk": "produto_id",
        "parent_model": Produto,
        "search_fields": ["nome_especificacao", "valor"],
        "label": "Especificação do Produto",
        "required": ["produto_id", "nome_especificacao", "valor"],
    },
    "produtos-documentos": {
        "model": ProdutoDocumento,
        "user_scoped": False,
        "parent_fk": "produto_id",
        "parent_model": Produto,
        "search_fields": ["nome_arquivo", "tipo"],
        "label": "Documento do Produto",
        "required": ["produto_id", "tipo", "nome_arquivo", "path_arquivo"],
    },
    # === Fontes ===
    "fontes-editais": {
        "model": FonteEdital,
        "user_scoped": False,
        "global": True,
        "search_fields": ["nome", "tipo", "url_base"],
        "label": "Fonte de Edital",
        "required": ["nome", "tipo"],
    },
    # === Editais ===
    "editais": {
        "model": Edital,
        "user_scoped": True,
        "search_fields": ["numero", "orgao", "objeto", "uf", "cidade"],
        "label": "Edital",
        "required": ["numero", "orgao", "objeto"],
    },
    "editais-requisitos": {
        "model": EditalRequisito,
        "user_scoped": False,
        "parent_fk": "edital_id",
        "parent_model": Edital,
        "search_fields": ["descricao", "nome_especificacao"],
        "label": "Requisito do Edital",
        "required": ["edital_id", "tipo", "descricao"],
    },
    "editais-documentos": {
        "model": EditalDocumento,
        "user_scoped": False,
        "parent_fk": "edital_id",
        "parent_model": Edital,
        "search_fields": ["nome_arquivo", "tipo"],
        "label": "Documento do Edital",
        "required": ["edital_id", "tipo", "nome_arquivo", "path_arquivo"],
    },
    "editais-itens": {
        "model": EditalItem,
        "user_scoped": False,
        "parent_fk": "edital_id",
        "parent_model": Edital,
        "search_fields": ["descricao", "codigo_item"],
        "label": "Item do Edital",
        "required": ["edital_id"],
    },
    # === Análises ===
    "analises": {
        "model": Analise,
        "user_scoped": True,
        "search_fields": ["recomendacao"],
        "label": "Análise",
        "required": ["edital_id", "produto_id"],
    },
    "analises-detalhes": {
        "model": AnaliseDetalhe,
        "user_scoped": False,
        "parent_fk": "analise_id",
        "parent_model": Analise,
        "search_fields": ["justificativa", "valor_exigido", "valor_produto"],
        "label": "Detalhe da Análise",
        "required": ["analise_id", "requisito_id", "status"],
    },
    # === Propostas ===
    "propostas": {
        "model": Proposta,
        "user_scoped": True,
        "search_fields": ["texto_tecnico"],
        "label": "Proposta",
        "required": ["edital_id", "produto_id"],
    },
    # === Concorrência ===
    "concorrentes": {
        "model": Concorrente,
        "user_scoped": False,
        "global": True,
        "search_fields": ["nome", "cnpj", "razao_social"],
        "label": "Concorrente",
        "required": ["nome"],
    },
    "precos-historicos": {
        "model": PrecoHistorico,
        "user_scoped": True,
        "search_fields": ["empresa_vencedora", "cnpj_vencedor"],
        "label": "Preço Histórico",
        "required": [],
    },
    "participacoes-editais": {
        "model": ParticipacaoEdital,
        "user_scoped": False,
        "parent_fk": "edital_id",
        "parent_model": Edital,
        "search_fields": ["motivo_desclassificacao"],
        "label": "Participação em Edital",
        "required": ["edital_id"],
    },
    # === Alertas e Monitoramento ===
    "alertas": {
        "model": Alerta,
        "user_scoped": True,
        "search_fields": ["titulo", "mensagem", "tipo"],
        "label": "Alerta",
        "required": ["edital_id", "tipo", "data_disparo"],
    },
    "monitoramentos": {
        "model": Monitoramento,
        "user_scoped": True,
        "search_fields": ["termo"],
        "label": "Monitoramento",
        "required": ["termo"],
    },
    "notificacoes": {
        "model": Notificacao,
        "user_scoped": True,
        "search_fields": ["titulo", "mensagem"],
        "label": "Notificação",
        "required": ["tipo", "titulo", "mensagem"],
    },
    "preferencias-notificacao": {
        "model": PreferenciasNotificacao,
        "user_scoped": True,
        "search_fields": [],
        "label": "Preferências de Notificação",
        "required": [],
    },
    # === Documentos Gerados ===
    "documentos": {
        "model": Documento,
        "user_scoped": True,
        "search_fields": ["titulo", "tipo"],
        "label": "Documento Gerado",
        "required": ["tipo", "titulo", "conteudo_md"],
    },
    # === Contratos ===
    "contratos": {
        "model": Contrato,
        "user_scoped": True,
        "search_fields": ["numero_contrato", "orgao", "objeto"],
        "label": "Contrato",
        "required": [],
    },
    "contrato-entregas": {
        "model": ContratoEntrega,
        "user_scoped": False,
        "parent_fk": "contrato_id",
        "parent_model": Contrato,
        "search_fields": ["descricao", "nota_fiscal", "numero_empenho"],
        "label": "Entrega de Contrato",
        "required": ["contrato_id", "data_prevista"],
    },
    # === Recursos ===
    "recursos": {
        "model": Recurso,
        "user_scoped": True,
        "search_fields": ["motivo", "fundamentacao_legal"],
        "label": "Recurso",
        "required": ["edital_id", "tipo", "prazo_limite"],
    },
    # === CRM ===
    "leads-crm": {
        "model": LeadCRM,
        "user_scoped": True,
        "search_fields": ["orgao", "cnpj_orgao", "contato_nome", "contato_email"],
        "label": "Lead CRM",
        "required": ["orgao"],
    },
    "acoes-pos-perda": {
        "model": AcaoPosPerda,
        "user_scoped": True,
        "search_fields": ["descricao", "responsavel"],
        "label": "Ação Pós-Perda",
        "required": [],
    },
    # === Auditoria ===
    "auditoria-log": {
        "model": AuditoriaLog,
        "user_scoped": True,
        "search_fields": ["acao", "entidade", "user_email"],
        "label": "Log de Auditoria",
        "required": ["acao", "entidade"],
        "read_only": True,
    },
    "aprendizado-feedback": {
        "model": AprendizadoFeedback,
        "user_scoped": True,
        "search_fields": ["tipo_evento", "entidade"],
        "label": "Feedback de Aprendizado",
        "required": ["tipo_evento"],
    },
    # === Parâmetros ===
    "parametros-score": {
        "model": ParametroScore,
        "user_scoped": True,
        "search_fields": [],
        "label": "Parâmetros de Score",
        "required": [],
    },
    "dispensas": {
        "model": Dispensa,
        "user_scoped": True,
        "search_fields": ["artigo", "justificativa"],
        "label": "Dispensa",
        "required": ["edital_id"],
    },
    "estrategias-editais": {
        "model": EstrategiaEdital,
        "user_scoped": True,
        "search_fields": ["justificativa", "decidido_por"],
        "label": "Estratégia de Edital",
        "required": ["edital_id"],
    },
}


# ─── Helper: set column value with type coercion ───────────────────────────────

def _set_column_value(instance, col_name, value, model_class):
    """Set a column value with proper type coercion for SQLAlchemy."""
    col = model_class.__table__.columns.get(col_name)
    if col is None:
        return

    col_type = str(col.type)

    # Skip None values for nullable columns
    if value is None or value == "":
        if col.nullable:
            setattr(instance, col_name, None)
        return

    try:
        if "DECIMAL" in col_type or "NUMERIC" in col_type:
            setattr(instance, col_name, Decimal(str(value)))
        elif "INTEGER" in col_type or "INT" in col_type:
            setattr(instance, col_name, int(value))
        elif "BOOLEAN" in col_type or "TINYINT" in col_type:
            if isinstance(value, bool):
                setattr(instance, col_name, value)
            elif isinstance(value, str):
                setattr(instance, col_name, value.lower() in ("true", "1", "yes", "sim"))
            else:
                setattr(instance, col_name, bool(value))
        elif "DATETIME" in col_type:
            if isinstance(value, str):
                # Try ISO format
                for fmt in ("%Y-%m-%dT%H:%M:%S", "%Y-%m-%dT%H:%M", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
                    try:
                        setattr(instance, col_name, datetime.strptime(value, fmt))
                        break
                    except ValueError:
                        continue
            else:
                setattr(instance, col_name, value)
        elif "DATE" in col_type and "DATETIME" not in col_type:
            if isinstance(value, str):
                from datetime import date
                setattr(instance, col_name, date.fromisoformat(value))
            else:
                setattr(instance, col_name, value)
        elif "JSON" in col_type:
            if isinstance(value, str):
                import json
                setattr(instance, col_name, json.loads(value))
            else:
                setattr(instance, col_name, value)
        else:
            setattr(instance, col_name, value)
    except (ValueError, InvalidOperation, TypeError):
        setattr(instance, col_name, value)


# ─── Schema endpoint ───────────────────────────────────────────────────────────

@crud_bp.route("/api/crud/schema", methods=["GET"])
@require_auth
def get_crud_schema():
    """Return metadata about all CRUD tables for the frontend."""
    schemas = {}
    for slug, config in CRUD_TABLES.items():
        model = config["model"]
        columns = []
        for col in model.__table__.columns:
            if col.name in ("id", "created_at", "updated_at"):
                continue
            col_info = {
                "name": col.name,
                "type": str(col.type).split("(")[0].upper(),
                "nullable": col.nullable,
                "required": col.name in config.get("required", []),
            }
            # Enums
            if hasattr(col.type, "enums"):
                col_info["type"] = "ENUM"
                col_info["options"] = list(col.type.enums)
            # ForeignKey
            for fk in col.foreign_keys:
                col_info["fk"] = str(fk.column)
            if col.default is not None and hasattr(col.default, "arg"):
                arg = col.default.arg
                if callable(arg):
                    col_info["default"] = "auto"
                else:
                    col_info["default"] = str(arg)
            columns.append(col_info)

        schemas[slug] = {
            "label": config["label"],
            "columns": columns,
            "search_fields": config.get("search_fields", []),
            "user_scoped": config.get("user_scoped", False),
            "global": config.get("global", False),
            "read_only": config.get("read_only", False),
            "parent_fk": config.get("parent_fk"),
        }
    return jsonify(schemas)


# ─── Generic CRUD endpoints ────────────────────────────────────────────────────

@crud_bp.route("/api/crud/<table_slug>", methods=["GET"])
@require_auth
def crud_list(table_slug):
    """List records with optional search. Query params: q (search), parent_id, limit, offset."""
    config = CRUD_TABLES.get(table_slug)
    if not config:
        return jsonify({"error": f"Tabela '{table_slug}' não encontrada"}), 404

    model = config["model"]
    user_id = get_current_user_id()
    q = request.args.get("q", "").strip()
    parent_id = request.args.get("parent_id")
    limit = min(int(request.args.get("limit", 200)), 500)
    offset = int(request.args.get("offset", 0))

    db = get_db()
    try:
        query = db.query(model)

        # Scope by user if needed
        if config.get("user_scoped") and hasattr(model, "user_id"):
            query = query.filter(model.user_id == user_id)
        elif config.get("parent_fk") and parent_id:
            fk_col = getattr(model, config["parent_fk"], None)
            if fk_col is not None:
                query = query.filter(fk_col == parent_id)
            # Verify parent ownership
            parent_model = config.get("parent_model")
            if parent_model and hasattr(parent_model, "user_id"):
                parent = db.query(parent_model).filter(
                    parent_model.id == parent_id,
                    parent_model.user_id == user_id
                ).first()
                if not parent:
                    return jsonify({"error": "Registro pai não encontrado"}), 404
        elif not config.get("global"):
            # For child tables without parent_id, try to scope by user through parent
            if config.get("parent_fk"):
                parent_model = config.get("parent_model")
                if parent_model and hasattr(parent_model, "user_id"):
                    fk_col = getattr(model, config["parent_fk"], None)
                    parent_ids = [p.id for p in db.query(parent_model.id).filter(
                        parent_model.user_id == user_id
                    ).all()]
                    if fk_col is not None:
                        query = query.filter(fk_col.in_(parent_ids))

        # Search
        if q and config.get("search_fields"):
            from sqlalchemy import or_
            conditions = []
            for field_name in config["search_fields"]:
                field = getattr(model, field_name, None)
                if field is not None:
                    conditions.append(field.ilike(f"%{q}%"))
            if conditions:
                query = query.filter(or_(*conditions))

        # Order
        if hasattr(model, "created_at"):
            query = query.order_by(model.created_at.desc())
        elif hasattr(model, "nome"):
            query = query.order_by(model.nome)

        total = query.count()
        items = query.offset(offset).limit(limit).all()

        return jsonify({
            "items": [item.to_dict() for item in items],
            "total": total,
            "limit": limit,
            "offset": offset,
        })
    finally:
        db.close()


@crud_bp.route("/api/crud/<table_slug>/<record_id>", methods=["GET"])
@require_auth
def crud_get(table_slug, record_id):
    """Get a single record by ID."""
    config = CRUD_TABLES.get(table_slug)
    if not config:
        return jsonify({"error": f"Tabela '{table_slug}' não encontrada"}), 404

    model = config["model"]
    user_id = get_current_user_id()
    db = get_db()
    try:
        query = db.query(model).filter(model.id == record_id)
        if config.get("user_scoped") and hasattr(model, "user_id"):
            query = query.filter(model.user_id == user_id)

        item = query.first()
        if not item:
            return jsonify({"error": f"{config['label']} não encontrado(a)"}), 404

        return jsonify(item.to_dict())
    finally:
        db.close()


@crud_bp.route("/api/crud/<table_slug>", methods=["POST"])
@require_auth
def crud_create(table_slug):
    """Create a new record."""
    config = CRUD_TABLES.get(table_slug)
    if not config:
        return jsonify({"error": f"Tabela '{table_slug}' não encontrada"}), 404

    if config.get("read_only"):
        return jsonify({"error": f"{config['label']} é somente leitura"}), 403

    model = config["model"]
    user_id = get_current_user_id()
    data = request.json or {}

    # Validate required fields
    for field_name in config.get("required", []):
        if field_name not in data or data[field_name] in (None, ""):
            return jsonify({"error": f"Campo '{field_name}' é obrigatório"}), 400

    db = get_db()
    try:
        instance = model()
        instance.id = str(uuid.uuid4())

        # Set user_id if user-scoped
        if config.get("user_scoped") and hasattr(model, "user_id"):
            instance.user_id = user_id

        # Set fields from data
        skip_fields = {"id", "created_at", "updated_at"}
        for col in model.__table__.columns:
            if col.name in skip_fields:
                continue
            if col.name == "user_id" and config.get("user_scoped"):
                continue
            if col.name in data:
                _set_column_value(instance, col.name, data[col.name], model)

        db.add(instance)
        db.commit()
        db.refresh(instance)

        return jsonify(instance.to_dict()), 201
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        db.close()


@crud_bp.route("/api/crud/<table_slug>/<record_id>", methods=["PUT", "PATCH"])
@require_auth
def crud_update(table_slug, record_id):
    """Update a record."""
    config = CRUD_TABLES.get(table_slug)
    if not config:
        return jsonify({"error": f"Tabela '{table_slug}' não encontrada"}), 404

    if config.get("read_only"):
        return jsonify({"error": f"{config['label']} é somente leitura"}), 403

    model = config["model"]
    user_id = get_current_user_id()
    data = request.json or {}

    db = get_db()
    try:
        query = db.query(model).filter(model.id == record_id)
        if config.get("user_scoped") and hasattr(model, "user_id"):
            query = query.filter(model.user_id == user_id)

        instance = query.first()
        if not instance:
            return jsonify({"error": f"{config['label']} não encontrado(a)"}), 404

        # Update fields
        skip_fields = {"id", "created_at", "user_id"}
        for col in model.__table__.columns:
            if col.name in skip_fields:
                continue
            if col.name in data:
                _set_column_value(instance, col.name, data[col.name], model)

        db.commit()
        db.refresh(instance)

        return jsonify(instance.to_dict())
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        db.close()


@crud_bp.route("/api/crud/<table_slug>/<record_id>", methods=["DELETE"])
@require_auth
def crud_delete(table_slug, record_id):
    """Delete a record."""
    config = CRUD_TABLES.get(table_slug)
    if not config:
        return jsonify({"error": f"Tabela '{table_slug}' não encontrada"}), 404

    if config.get("read_only"):
        return jsonify({"error": f"{config['label']} é somente leitura"}), 403

    model = config["model"]
    user_id = get_current_user_id()

    db = get_db()
    try:
        query = db.query(model).filter(model.id == record_id)
        if config.get("user_scoped") and hasattr(model, "user_id"):
            query = query.filter(model.user_id == user_id)

        instance = query.first()
        if not instance:
            return jsonify({"error": f"{config['label']} não encontrado(a)"}), 404

        db.delete(instance)
        db.commit()

        return jsonify({"message": f"{config['label']} excluído(a) com sucesso"})
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 400
    finally:
        db.close()
