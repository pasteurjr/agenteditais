"""
SQLAlchemy ORM models for the Editais IA system.
"""
from sqlalchemy import Column, String, Text, DateTime, Enum, ForeignKey, Integer, JSON, Boolean, DECIMAL, Date, Float, create_engine, UniqueConstraint, text
from sqlalchemy.dialects.mysql import LONGTEXT
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship, sessionmaker
from datetime import datetime
import uuid

from config import MYSQL_URI

Base = declarative_base()


# ==================== AUTH (copiado do trabalhista) ====================

class User(Base):
    __tablename__ = 'users'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=True)
    password_plain = Column(String(255), nullable=True)
    google_id = Column(String(255), unique=True, nullable=True)
    name = Column(String(255), nullable=False)
    picture_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    last_login_at = Column(DateTime, nullable=True)

    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    produtos = relationship("Produto", back_populates="user", cascade="all, delete-orphan")
    editais = relationship("Edital", back_populates="user", cascade="all, delete-orphan")
    # Relationships existentes convertidos de backref
    alertas = relationship("Alerta", back_populates="user", cascade="all, delete-orphan")
    monitoramentos = relationship("Monitoramento", back_populates="user", cascade="all, delete-orphan")
    notificacoes = relationship("Notificacao", back_populates="user", cascade="all, delete-orphan")
    preferencias_notificacao = relationship("PreferenciasNotificacao", back_populates="user", cascade="all, delete-orphan", uselist=False)
    documentos_gerados = relationship("Documento", back_populates="user", cascade="all, delete-orphan")
    propostas = relationship("Proposta", back_populates="user", cascade="all, delete-orphan")
    precos_historicos = relationship("PrecoHistorico", back_populates="user")
    # Relationships para novas tabelas
    empresas = relationship("Empresa", back_populates="user", cascade="all, delete-orphan")
    contratos = relationship("Contrato", back_populates="user", cascade="all, delete-orphan")
    recursos = relationship("Recurso", back_populates="user", cascade="all, delete-orphan")
    leads_crm = relationship("LeadCRM", back_populates="user", cascade="all, delete-orphan")
    acoes_pos_perda = relationship("AcaoPosPerda", back_populates="user", cascade="all, delete-orphan")
    auditoria_logs = relationship("AuditoriaLog", back_populates="user")
    aprendizado_feedback = relationship("AprendizadoFeedback", back_populates="user", cascade="all, delete-orphan")
    parametro_score = relationship("ParametroScore", back_populates="user", cascade="all, delete-orphan", uselist=False)
    dispensas = relationship("Dispensa", back_populates="user", cascade="all, delete-orphan")
    estrategias = relationship("EstrategiaEdital", back_populates="user", cascade="all, delete-orphan")
    # FASE 1 Precificação
    lotes = relationship("Lote", back_populates="user", cascade="all, delete-orphan")
    vinculos_item_produto = relationship("EditalItemProduto", back_populates="user", cascade="all, delete-orphan")
    preco_camadas = relationship("PrecoCamada", back_populates="user", cascade="all, delete-orphan")
    lances = relationship("Lance", back_populates="user", cascade="all, delete-orphan")
    comodatos = relationship("Comodato", back_populates="user", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "picture_url": self.picture_url,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class RefreshToken(Base):
    __tablename__ = 'refresh_tokens'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    token = Column(String(64), nullable=False, unique=True)
    expires_at = Column(DateTime, nullable=False)
    revoked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now)

    user = relationship("User", back_populates="refresh_tokens")


# ==================== CHAT (copiado do trabalhista) ====================

class Session(Base):
    __tablename__ = 'sessions'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    name = Column(String(255), nullable=False, default='Nova conversa')
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    user = relationship("User", back_populates="sessions")
    messages = relationship("Message", back_populates="session", cascade="all, delete-orphan", order_by="Message.created_at")
    documentos = relationship("Documento", back_populates="session")
    auditoria_logs = relationship("AuditoriaLog", back_populates="session")

    def to_dict(self, include_messages=False):
        result = {
            "session_id": self.id,
            "name": self.name,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_messages:
            result["messages"] = [m.to_dict() for m in self.messages]
        return result


class Message(Base):
    __tablename__ = 'messages'

    id = Column(Integer, primary_key=True, autoincrement=True)
    session_id = Column(String(36), ForeignKey('sessions.id', ondelete='CASCADE'), nullable=False)
    role = Column(Enum('user', 'assistant'), nullable=False)
    content = Column(Text, nullable=False)
    sources_json = Column(JSON, nullable=True)
    action_type = Column(String(50), nullable=True)  # Tipo de ação selecionada
    created_at = Column(DateTime, default=datetime.now)

    session = relationship("Session", back_populates="messages")

    def to_dict(self):
        return {
            "role": self.role,
            "content": self.content,
            "sources": self.sources_json,
            "action_type": self.action_type,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# ==================== PRODUTOS (Portfólio da Empresa) ====================

class Produto(Base):
    """Produto cadastrado (equipamento, reagente, insumo)"""
    __tablename__ = 'produtos'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    empresa_id = Column(String(36), ForeignKey('empresas.id', ondelete='CASCADE'), nullable=True)
    nome = Column(String(255), nullable=False)
    codigo_interno = Column(String(50), nullable=True)
    ncm = Column(String(20), nullable=True)
    categoria = Column(Enum('equipamento', 'reagente', 'insumo_hospitalar', 'insumo_laboratorial', 'informatica', 'redes', 'mobiliario', 'eletronico', 'outro'), nullable=False)
    subclasse_id = Column(String(36), ForeignKey('subclasses_produto.id', ondelete='SET NULL'), nullable=True)
    fabricante = Column(String(255), nullable=True)
    modelo = Column(String(255), nullable=True)
    descricao = Column(Text, nullable=True)
    preco_referencia = Column(DECIMAL(15, 2), nullable=True)
    status_pipeline = Column(String(20), default="cadastrado")  # cadastrado, qualificado, ofertado, vencedor
    registro_anvisa = Column(String(30), nullable=True)
    anvisa_status = Column(String(20), nullable=True)  # ativo, em_analise, cancelado, null
    # Metadados de captação (populados em background após cadastro)
    catmat_codigos = Column(JSON, nullable=True)          # ["495268", "495269"]
    catser_codigos = Column(JSON, nullable=True)          # ["27502", "27510"]
    catmat_descricoes = Column(JSON, nullable=True)       # ["Reagente para diagnóstico...", ...]
    termos_busca = Column(JSON, nullable=True)            # ["hemograma", "hematologia", "CBC", ...]
    termos_busca_updated_at = Column(DateTime, nullable=True)
    catmat_updated_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    user = relationship("User", back_populates="produtos")
    especificacoes = relationship("ProdutoEspecificacao", back_populates="produto", cascade="all, delete-orphan")
    documentos = relationship("ProdutoDocumento", back_populates="produto", cascade="all, delete-orphan")
    analises = relationship("Analise", back_populates="produto", cascade="all, delete-orphan")
    propostas = relationship("Proposta", back_populates="produto", cascade="all, delete-orphan")
    # FASE 1 Precificação
    vinculos_editais = relationship("EditalItemProduto", back_populates="produto", cascade="all, delete-orphan")

    def to_dict(self, include_specs=False):
        result = {
            "id": self.id,
            "nome": self.nome,
            "codigo_interno": self.codigo_interno,
            "ncm": self.ncm,
            "categoria": self.categoria,
            "subclasse_id": self.subclasse_id,
            "fabricante": self.fabricante,
            "modelo": self.modelo,
            "descricao": self.descricao,
            "preco_referencia": float(self.preco_referencia) if self.preco_referencia else None,
            "status_pipeline": self.status_pipeline or "cadastrado",
            "registro_anvisa": self.registro_anvisa,
            "anvisa_status": self.anvisa_status,
            "catmat_codigos": self.catmat_codigos,
            "catser_codigos": self.catser_codigos,
            "catmat_descricoes": self.catmat_descricoes,
            "termos_busca": self.termos_busca,
            "termos_busca_updated_at": self.termos_busca_updated_at.isoformat() if self.termos_busca_updated_at else None,
            "catmat_updated_at": self.catmat_updated_at.isoformat() if self.catmat_updated_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_specs:
            result["especificacoes"] = [e.to_dict() for e in self.especificacoes]
        return result


class ProdutoEspecificacao(Base):
    """Especificações técnicas extraídas do manual (ESTRUTURADO)"""
    __tablename__ = 'produtos_especificacoes'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    produto_id = Column(String(36), ForeignKey('produtos.id', ondelete='CASCADE'), nullable=False)
    nome_especificacao = Column(String(255), nullable=False)
    valor = Column(String(500), nullable=False)
    unidade = Column(String(50), nullable=True)
    valor_numerico = Column(DECIMAL(15, 6), nullable=True)
    operador = Column(String(10), nullable=True)  # "<", "<=", "=", ">=", ">", "range"
    valor_min = Column(DECIMAL(15, 6), nullable=True)
    valor_max = Column(DECIMAL(15, 6), nullable=True)
    pagina_origem = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.now)

    produto = relationship("Produto", back_populates="especificacoes")

    def to_dict(self):
        return {
            "id": self.id,
            "nome_especificacao": self.nome_especificacao,
            "valor": self.valor,
            "unidade": self.unidade,
            "valor_numerico": float(self.valor_numerico) if self.valor_numerico else None,
            "operador": self.operador,
            "valor_min": float(self.valor_min) if self.valor_min else None,
            "valor_max": float(self.valor_max) if self.valor_max else None,
            "pagina_origem": self.pagina_origem,
        }


class ProdutoDocumento(Base):
    """Documentos do produto (manuais, fichas, certificados)"""
    __tablename__ = 'produtos_documentos'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    produto_id = Column(String(36), ForeignKey('produtos.id', ondelete='CASCADE'), nullable=False)
    tipo = Column(Enum('manual', 'ficha_tecnica', 'certificado_anvisa', 'certificado_outro'), nullable=False)
    nome_arquivo = Column(String(255), nullable=False)
    path_arquivo = Column(String(500), nullable=False)
    texto_extraido = Column(LONGTEXT, nullable=True)
    processado = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now)

    produto = relationship("Produto", back_populates="documentos")

    def to_dict(self):
        return {
            "id": self.id,
            "tipo": self.tipo,
            "nome_arquivo": self.nome_arquivo,
            "processado": self.processado,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# ==================== CLASSIFICAÇÃO DE PRODUTOS (Área > Classe > Subclasse) ====================

class AreaProduto(Base):
    """Áreas de produto — nível mais alto (Médica, Tecnologia, Construção Civil)"""
    __tablename__ = 'areas_produto'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    empresa_id = Column(String(36), ForeignKey('empresas.id', ondelete='CASCADE'), nullable=True)
    nome = Column(String(255), nullable=False)
    descricao = Column(Text, nullable=True)
    ativo = Column(Boolean, default=True)
    ordem = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.now)

    classes = relationship("ClasseProdutoV2", back_populates="area", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "descricao": self.descricao,
            "ativo": self.ativo,
            "ordem": self.ordem,
            "classes": [c.to_dict() for c in self.classes] if self.classes else [],
        }


class ClasseProdutoV2(Base):
    """Classes de produto — nível intermediário (Reagentes, Equipamentos, etc)"""
    __tablename__ = 'classes_produto_v2'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    empresa_id = Column(String(36), ForeignKey('empresas.id', ondelete='CASCADE'), nullable=True)
    nome = Column(String(255), nullable=False)
    area_id = Column(String(36), ForeignKey('areas_produto.id', ondelete='CASCADE'), nullable=False)
    descricao = Column(Text, nullable=True)
    ativo = Column(Boolean, default=True)
    ordem = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.now)

    area = relationship("AreaProduto", back_populates="classes")
    subclasses = relationship("SubclasseProduto", back_populates="classe", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "area_id": self.area_id,
            "descricao": self.descricao,
            "ativo": self.ativo,
            "ordem": self.ordem,
            "subclasses": [s.to_dict() for s in self.subclasses] if self.subclasses else [],
        }


class SubclasseProduto(Base):
    """Subclasses de produto — nível mais granular, com NCMs"""
    __tablename__ = 'subclasses_produto'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    empresa_id = Column(String(36), ForeignKey('empresas.id', ondelete='CASCADE'), nullable=True)
    nome = Column(String(255), nullable=False)
    classe_id = Column(String(36), ForeignKey('classes_produto_v2.id', ondelete='CASCADE'), nullable=False)
    ncms = Column(JSON, nullable=True)
    campos_mascara = Column(JSON, nullable=True)
    ativo = Column(Boolean, default=True)
    ordem = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.now)

    classe = relationship("ClasseProdutoV2", back_populates="subclasses")

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "classe_id": self.classe_id,
            "ncms": self.ncms,
            "campos_mascara": self.campos_mascara,
            "ativo": self.ativo,
            "ordem": self.ordem,
        }


# ==================== MODALIDADES E ORIGENS ====================

class ModalidadeLicitacao(Base):
    """Modalidades de licitação (Pregão Eletrônico, Concorrência, etc)"""
    __tablename__ = 'modalidades_licitacao'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    nome = Column(String(255), nullable=False)
    descricao = Column(Text, nullable=True)
    ativo = Column(Boolean, default=True)
    ordem = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.now)

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "descricao": self.descricao,
            "ativo": self.ativo,
            "ordem": self.ordem,
        }


class OrigemOrgao(Base):
    """Origens/tipos de órgão licitante (Municipal, Hospital, Universidade, etc)"""
    __tablename__ = 'origens_orgao'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    nome = Column(String(255), nullable=False)
    descricao = Column(Text, nullable=True)
    ativo = Column(Boolean, default=True)
    ordem = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.now)

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "descricao": self.descricao,
            "ativo": self.ativo,
            "ordem": self.ordem,
        }


# ==================== FONTES DE EDITAIS ====================

class FonteEdital(Base):
    """Fontes de busca de editais (PNCP, ComprasNet, BEC, etc)"""
    __tablename__ = 'fontes_editais'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    nome = Column(String(100), nullable=False)
    tipo = Column(Enum('api', 'scraper'), nullable=False)
    url_base = Column(String(500), nullable=True)
    api_key = Column(String(255), nullable=True)
    ativo = Column(Boolean, default=True)
    descricao = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "tipo": self.tipo,
            "url_base": self.url_base,
            "ativo": self.ativo,
            "descricao": self.descricao,
        }


# ==================== EDITAIS (Oportunidades) ====================

class Edital(Base):
    """Edital capturado"""
    __tablename__ = 'editais'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    empresa_id = Column(String(36), ForeignKey('empresas.id', ondelete='CASCADE'), nullable=True)
    numero = Column(String(100), nullable=False)
    orgao = Column(String(255), nullable=False)
    orgao_tipo = Column(Enum('federal', 'estadual', 'municipal', 'autarquia', 'fundacao'), default='municipal')
    uf = Column(String(2), nullable=True)
    cidade = Column(String(100), nullable=True)
    objeto = Column(Text, nullable=False)
    modalidade = Column(Enum('pregao_eletronico', 'pregao_presencial', 'concorrencia', 'tomada_precos', 'convite', 'dispensa', 'inexigibilidade'), default='pregao_eletronico')
    categoria = Column(Enum('comodato', 'venda_equipamento', 'aluguel_com_consumo', 'aluguel_sem_consumo', 'consumo_reagentes', 'consumo_insumos', 'servicos', 'informatica', 'redes', 'mobiliario', 'outro'), nullable=True)
    modalidade_id = Column(String(36), ForeignKey('modalidades_licitacao.id', ondelete='SET NULL'), nullable=True)
    categoria_id = Column(String(36), ForeignKey('classes_produto_v2.id', ondelete='SET NULL'), nullable=True)
    origem_id = Column(String(36), ForeignKey('origens_orgao.id', ondelete='SET NULL'), nullable=True)
    valor_referencia = Column(DECIMAL(15, 2), nullable=True)
    data_publicacao = Column(Date, nullable=True)
    data_abertura = Column(DateTime, nullable=True)
    data_limite_proposta = Column(DateTime, nullable=True)
    data_limite_impugnacao = Column(DateTime, nullable=True)
    data_recursos = Column(DateTime, nullable=True)  # Sprint 2
    data_homologacao_prevista = Column(Date, nullable=True)  # Sprint 2
    horario_abertura = Column(String(5), nullable=True)  # HH:MM - Sprint 2
    fuso_horario = Column(String(50), default='America/Sao_Paulo')  # Sprint 2
    status = Column(Enum('novo', 'analisando', 'participando', 'proposta_enviada', 'em_pregao', 'vencedor', 'perdedor', 'cancelado', 'desistido', 'aberto', 'fechado', 'suspenso', 'ganho', 'perdido', 'temp_score'), default='novo')
    fonte = Column(String(50), nullable=True)
    url = Column(String(500), nullable=True)
    # Dados PNCP para buscar itens e documentos
    numero_pncp = Column(String(100), nullable=True)  # Ex: 15126437000143-1-000531/2025
    cnpj_orgao = Column(String(20), nullable=True)
    ano_compra = Column(Integer, nullable=True)
    seq_compra = Column(Integer, nullable=True)
    srp = Column(Boolean, default=False)  # Sistema de Registro de Preços
    situacao_pncp = Column(String(100), nullable=True)  # Divulgada, Suspensa, etc.
    # URLs de PDF e arquivos
    pdf_url = Column(String(500), nullable=True)  # URL para download do PDF do edital
    pdf_titulo = Column(String(255), nullable=True)  # Título do arquivo PDF
    pdf_path = Column(String(500), nullable=True)  # Caminho local se baixado
    dados_completos = Column(Boolean, default=False)  # Se tem todos os dados do PNCP
    fonte_tipo = Column(String(20), nullable=True)  # 'api' ou 'scraper'
    # RF-013: Vinculo edital -> classe/subclasse de produto
    classe_produto_id = Column(String(36), ForeignKey("classes_produto_v2.id"), nullable=True)
    subclasse_produto_id = Column(String(36), ForeignKey("subclasses_produto.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    user = relationship("User", back_populates="editais")
    classe_produto = relationship("ClasseProdutoV2", foreign_keys=[classe_produto_id])
    subclasse_produto = relationship("SubclasseProduto", foreign_keys=[subclasse_produto_id])
    requisitos = relationship("EditalRequisito", back_populates="edital", cascade="all, delete-orphan")
    documentos = relationship("EditalDocumento", back_populates="edital", cascade="all, delete-orphan")
    analises = relationship("Analise", back_populates="edital", cascade="all, delete-orphan")
    itens = relationship("EditalItem", back_populates="edital", cascade="all, delete-orphan")
    # Relationships convertidos de backref + novas tabelas
    propostas = relationship("Proposta", back_populates="edital", cascade="all, delete-orphan")
    alertas = relationship("Alerta", back_populates="edital", cascade="all, delete-orphan")
    participacoes = relationship("ParticipacaoEdital", back_populates="edital", cascade="all, delete-orphan")
    notificacoes = relationship("Notificacao", back_populates="edital")
    contratos = relationship("Contrato", back_populates="edital")
    recursos = relationship("Recurso", back_populates="edital", cascade="all, delete-orphan")
    leads_crm = relationship("LeadCRM", back_populates="edital")
    acoes_pos_perda = relationship("AcaoPosPerda", back_populates="edital")
    dispensas = relationship("Dispensa", back_populates="edital", cascade="all, delete-orphan")
    estrategias = relationship("EstrategiaEdital", back_populates="edital", cascade="all, delete-orphan")
    # FASE 1 Precificação
    lotes = relationship("Lote", back_populates="edital", cascade="all, delete-orphan")
    comodatos = relationship("Comodato", back_populates="edital", cascade="all, delete-orphan")

    def to_dict(self, include_requisitos=False):
        result = {
            "id": self.id,
            "numero": self.numero,
            "orgao": self.orgao,
            "orgao_tipo": self.orgao_tipo,
            "uf": self.uf,
            "cidade": self.cidade,
            "objeto": self.objeto,
            "modalidade": self.modalidade,
            "categoria": self.categoria,
            "valor_referencia": float(self.valor_referencia) if self.valor_referencia else None,
            "data_publicacao": self.data_publicacao.isoformat() if self.data_publicacao else None,
            "data_abertura": self.data_abertura.isoformat() if self.data_abertura else None,
            "data_limite_proposta": self.data_limite_proposta.isoformat() if self.data_limite_proposta else None,
            "data_limite_impugnacao": self.data_limite_impugnacao.isoformat() if self.data_limite_impugnacao else None,
            "data_recursos": self.data_recursos.isoformat() if self.data_recursos else None,
            "data_homologacao_prevista": self.data_homologacao_prevista.isoformat() if self.data_homologacao_prevista else None,
            "horario_abertura": self.horario_abertura,
            "fuso_horario": self.fuso_horario,
            "status": self.status,
            "fonte": self.fonte,
            "fonte_tipo": self.fonte_tipo,
            "url": self.url,
            "pdf_url": self.pdf_url,
            "pdf_titulo": self.pdf_titulo,
            "pdf_path": self.pdf_path,
            "dados_completos": self.dados_completos,
            "cnpj_orgao": self.cnpj_orgao,
            "ano_compra": self.ano_compra,
            "seq_compra": self.seq_compra,
            "classe_produto_id": self.classe_produto_id,
            "subclasse_produto_id": self.subclasse_produto_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_requisitos:
            result["requisitos"] = [r.to_dict() for r in self.requisitos]
        return result


class EditalRequisito(Base):
    """Requisitos extraídos do edital (ESTRUTURADO)"""
    __tablename__ = 'editais_requisitos'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    edital_id = Column(String(36), ForeignKey('editais.id', ondelete='CASCADE'), nullable=False)
    tipo = Column(Enum('tecnico', 'documental', 'comercial', 'legal'), nullable=False)
    descricao = Column(Text, nullable=False)
    nome_especificacao = Column(String(255), nullable=True)
    valor_exigido = Column(String(500), nullable=True)
    operador = Column(String(10), nullable=True)
    valor_numerico = Column(DECIMAL(15, 6), nullable=True)
    obrigatorio = Column(Boolean, default=True)
    pagina_origem = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.now)

    edital = relationship("Edital", back_populates="requisitos")

    def to_dict(self):
        return {
            "id": self.id,
            "tipo": self.tipo,
            "descricao": self.descricao,
            "nome_especificacao": self.nome_especificacao,
            "valor_exigido": self.valor_exigido,
            "operador": self.operador,
            "valor_numerico": float(self.valor_numerico) if self.valor_numerico else None,
            "obrigatorio": self.obrigatorio,
            "pagina_origem": self.pagina_origem,
        }


class EditalDocumento(Base):
    """Documentos do edital (PDF, anexos)"""
    __tablename__ = 'editais_documentos'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    edital_id = Column(String(36), ForeignKey('editais.id', ondelete='CASCADE'), nullable=False)
    tipo = Column(Enum('edital_principal', 'termo_referencia', 'anexo', 'planilha', 'outro'), nullable=False)
    nome_arquivo = Column(String(255), nullable=False)
    path_arquivo = Column(String(500), nullable=False)
    texto_extraido = Column(LONGTEXT, nullable=True)
    processado = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now)

    edital = relationship("Edital", back_populates="documentos")

    def to_dict(self):
        return {
            "id": self.id,
            "tipo": self.tipo,
            "nome_arquivo": self.nome_arquivo,
            "processado": self.processado,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class EditalItem(Base):
    """Itens/lotes do edital (vindos da API PNCP)"""
    __tablename__ = 'editais_itens'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    edital_id = Column(String(36), ForeignKey('editais.id', ondelete='CASCADE'), nullable=False)
    numero_item = Column(Integer, nullable=True)
    descricao = Column(Text, nullable=True)
    unidade_medida = Column(String(50), nullable=True)
    quantidade = Column(DECIMAL(15, 4), nullable=True)
    valor_unitario_estimado = Column(DECIMAL(15, 2), nullable=True)
    valor_total_estimado = Column(DECIMAL(15, 2), nullable=True)
    codigo_item = Column(String(100), nullable=True)  # Código no PNCP
    tipo_beneficio = Column(String(100), nullable=True)  # ME/EPP, Cota reservada, etc.
    created_at = Column(DateTime, default=datetime.now)

    edital = relationship("Edital", back_populates="itens")
    # FASE 1 Precificação
    lote_itens = relationship("LoteItem", back_populates="edital_item", cascade="all, delete-orphan")
    produto_vinculado = relationship("EditalItemProduto", back_populates="edital_item", cascade="all, delete-orphan", uselist=False)

    def to_dict(self):
        return {
            "id": self.id,
            "numero_item": self.numero_item,
            "descricao": self.descricao,
            "unidade_medida": self.unidade_medida,
            "quantidade": float(self.quantidade) if self.quantidade else None,
            "valor_unitario_estimado": float(self.valor_unitario_estimado) if self.valor_unitario_estimado else None,
            "valor_total_estimado": float(self.valor_total_estimado) if self.valor_total_estimado else None,
            "codigo_item": self.codigo_item,
            "tipo_beneficio": self.tipo_beneficio,
        }


# ==================== ANÁLISES E SCORES ====================

class Analise(Base):
    """Análise de aderência produto x edital"""
    __tablename__ = 'analises'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    edital_id = Column(String(36), ForeignKey('editais.id', ondelete='CASCADE'), nullable=False)
    produto_id = Column(String(36), ForeignKey('produtos.id', ondelete='CASCADE'), nullable=False)
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    empresa_id = Column(String(36), ForeignKey('empresas.id', ondelete='CASCADE'), nullable=True)

    # Scores (0 a 100)
    score_tecnico = Column(DECIMAL(5, 2), nullable=True)
    score_comercial = Column(DECIMAL(5, 2), nullable=True)
    score_potencial = Column(DECIMAL(5, 2), nullable=True)
    score_final = Column(DECIMAL(5, 2), nullable=True)

    # Contadores
    requisitos_total = Column(Integer, default=0)
    requisitos_atendidos = Column(Integer, default=0)
    requisitos_parciais = Column(Integer, default=0)
    requisitos_nao_atendidos = Column(Integer, default=0)

    # Preços
    preco_sugerido_min = Column(DECIMAL(15, 2), nullable=True)
    preco_sugerido_max = Column(DECIMAL(15, 2), nullable=True)
    preco_sugerido = Column(DECIMAL(15, 2), nullable=True)

    recomendacao = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)

    edital = relationship("Edital", back_populates="analises")
    produto = relationship("Produto", back_populates="analises")
    detalhes = relationship("AnaliseDetalhe", back_populates="analise", cascade="all, delete-orphan")
    propostas = relationship("Proposta", back_populates="analise")

    def to_dict(self, include_detalhes=False):
        result = {
            "id": self.id,
            "edital_id": self.edital_id,
            "produto_id": self.produto_id,
            "score_tecnico": float(self.score_tecnico) if self.score_tecnico else None,
            "score_comercial": float(self.score_comercial) if self.score_comercial else None,
            "score_potencial": float(self.score_potencial) if self.score_potencial else None,
            "score_final": float(self.score_final) if self.score_final else None,
            "requisitos_total": self.requisitos_total,
            "requisitos_atendidos": self.requisitos_atendidos,
            "requisitos_parciais": self.requisitos_parciais,
            "requisitos_nao_atendidos": self.requisitos_nao_atendidos,
            "preco_sugerido": float(self.preco_sugerido) if self.preco_sugerido else None,
            "recomendacao": self.recomendacao,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_detalhes:
            result["detalhes"] = [d.to_dict() for d in self.detalhes]
        return result


class AnaliseDetalhe(Base):
    """Detalhes da análise: cada requisito comparado"""
    __tablename__ = 'analises_detalhes'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    analise_id = Column(String(36), ForeignKey('analises.id', ondelete='CASCADE'), nullable=False)
    requisito_id = Column(String(36), ForeignKey('editais_requisitos.id', ondelete='CASCADE'), nullable=False)
    especificacao_id = Column(String(36), ForeignKey('produtos_especificacoes.id', ondelete='SET NULL'), nullable=True)

    status = Column(Enum('atendido', 'parcial', 'nao_atendido', 'nao_aplicavel'), nullable=False)
    valor_exigido = Column(String(500), nullable=True)
    valor_produto = Column(String(500), nullable=True)
    justificativa = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)

    analise = relationship("Analise", back_populates="detalhes")

    def to_dict(self):
        return {
            "id": self.id,
            "requisito_id": self.requisito_id,
            "especificacao_id": self.especificacao_id,
            "status": self.status,
            "valor_exigido": self.valor_exigido,
            "valor_produto": self.valor_produto,
            "justificativa": self.justificativa,
        }


# ==================== PROPOSTAS ====================

class Proposta(Base):
    """Proposta gerada"""
    __tablename__ = 'propostas'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    edital_id = Column(String(36), ForeignKey('editais.id', ondelete='CASCADE'), nullable=False)
    produto_id = Column(String(36), ForeignKey('produtos.id', ondelete='CASCADE'), nullable=False)
    analise_id = Column(String(36), ForeignKey('analises.id', ondelete='SET NULL'), nullable=True)
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    empresa_id = Column(String(36), ForeignKey('empresas.id', ondelete='CASCADE'), nullable=True)

    texto_tecnico = Column(Text, nullable=True)
    preco_unitario = Column(DECIMAL(15, 2), nullable=True)
    preco_total = Column(DECIMAL(15, 2), nullable=True)
    quantidade = Column(Integer, default=1)

    status = Column(Enum('rascunho', 'revisao', 'aprovada', 'enviada'), default='rascunho')
    arquivo_path = Column(String(500), nullable=True)
    documentos_anexados = Column(Integer, default=0)
    documentos_total = Column(Integer, default=3)

    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    edital = relationship("Edital", back_populates="propostas")
    produto = relationship("Produto", back_populates="propostas")
    analise = relationship("Analise", back_populates="propostas")
    user = relationship("User", back_populates="propostas")

    def to_dict(self):
        result = {
            "id": self.id,
            "edital_id": self.edital_id,
            "produto_id": self.produto_id,
            "analise_id": self.analise_id,
            "texto_tecnico": self.texto_tecnico,
            "preco_unitario": float(self.preco_unitario) if self.preco_unitario else None,
            "preco_total": float(self.preco_total) if self.preco_total else None,
            "quantidade": self.quantidade,
            "status": self.status,
            "arquivo_path": self.arquivo_path,
            "documentos_anexados": self.documentos_anexados or 0,
            "documentos_total": self.documentos_total or 3,
            "numero_edital": None,
            "nome_produto": None,
            "orgao": None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if self.edital:
            result["numero_edital"] = getattr(self.edital, 'numero', None) or getattr(self.edital, 'numero_edital', None)
            result["orgao"] = getattr(self.edital, 'orgao', None)
        if self.produto:
            result["nome_produto"] = getattr(self.produto, 'nome', None)
        return result


# ==================== CONCORRENTES E PREÇOS HISTÓRICOS ====================

class Concorrente(Base):
    """Empresas concorrentes em licitações"""
    __tablename__ = 'concorrentes'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    nome = Column(String(255), nullable=False)
    cnpj = Column(String(20), unique=True, nullable=True)
    razao_social = Column(String(255), nullable=True)
    segmentos = Column(JSON, nullable=True)  # ["hematologia", "bioquímica", ...]
    editais_participados = Column(Integer, default=0)
    editais_ganhos = Column(Integer, default=0)
    preco_medio = Column(DECIMAL(15, 2), nullable=True)
    taxa_vitoria = Column(DECIMAL(5, 2), nullable=True)
    observacoes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    precos_historicos = relationship("PrecoHistorico", back_populates="concorrente")
    participacoes = relationship("ParticipacaoEdital", back_populates="concorrente")

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "cnpj": self.cnpj,
            "razao_social": self.razao_social,
            "segmentos": self.segmentos,
            "editais_participados": self.editais_participados,
            "editais_ganhos": self.editais_ganhos,
            "preco_medio": float(self.preco_medio) if self.preco_medio else None,
            "taxa_vitoria": float(self.taxa_vitoria) if self.taxa_vitoria else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class PrecoHistorico(Base):
    """Preços de editais finalizados"""
    __tablename__ = 'precos_historicos'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    edital_id = Column(String(36), ForeignKey('editais.id', ondelete='SET NULL'), nullable=True)
    produto_id = Column(String(36), ForeignKey('produtos.id', ondelete='SET NULL'), nullable=True)
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=True)
    empresa_id = Column(String(36), ForeignKey('empresas.id', ondelete='CASCADE'), nullable=True)

    # Valores
    preco_referencia = Column(DECIMAL(15, 2), nullable=True)
    preco_vencedor = Column(DECIMAL(15, 2), nullable=True)
    nosso_preco = Column(DECIMAL(15, 2), nullable=True)
    desconto_percentual = Column(DECIMAL(5, 2), nullable=True)

    # Vencedor
    concorrente_id = Column(String(36), ForeignKey('concorrentes.id', ondelete='SET NULL'), nullable=True)
    empresa_vencedora = Column(String(255), nullable=True)
    cnpj_vencedor = Column(String(20), nullable=True)

    # Resultado
    resultado = Column(Enum('vitoria', 'derrota', 'cancelado', 'deserto', 'revogado'), nullable=True)
    motivo_perda = Column(Enum('preco', 'tecnica', 'documentacao', 'prazo', 'outro'), nullable=True)

    # Datas
    data_homologacao = Column(Date, nullable=True)
    data_registro = Column(DateTime, default=datetime.now)

    # Fonte do dado
    fonte = Column(Enum('manual', 'pncp', 'ata_pdf', 'painel_precos'), nullable=True)

    # Vinculo com ata consultada (edital de origem real do preço)
    ata_consultada_id = Column(String(36), ForeignKey('atas_consultadas.id', ondelete='SET NULL'), nullable=True)

    concorrente = relationship("Concorrente", back_populates="precos_historicos")
    user = relationship("User", back_populates="precos_historicos")
    ata_consultada = relationship("AtaConsultada", back_populates="precos_historicos")

    def to_dict(self):
        return {
            "id": self.id,
            "edital_id": self.edital_id,
            "produto_id": self.produto_id,
            "preco_referencia": float(self.preco_referencia) if self.preco_referencia else None,
            "preco_vencedor": float(self.preco_vencedor) if self.preco_vencedor else None,
            "nosso_preco": float(self.nosso_preco) if self.nosso_preco else None,
            "desconto_percentual": float(self.desconto_percentual) if self.desconto_percentual else None,
            "empresa_vencedora": self.empresa_vencedora,
            "resultado": self.resultado,
            "motivo_perda": self.motivo_perda,
            "data_homologacao": self.data_homologacao.isoformat() if self.data_homologacao else None,
            "fonte": self.fonte,
        }


class OrgaoPerfil(Base):
    """Perfil de órgãos contratantes com dados do PNCP e análise IA"""
    __tablename__ = 'orgaos_perfil'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    cnpj = Column(String(20), unique=True, nullable=False)
    nome = Column(String(255), nullable=True)
    uf = Column(String(2), nullable=True)
    total_compras = Column(Integer, default=0)
    valor_total_compras = Column(DECIMAL(15, 2), nullable=True)
    valor_medio_compras = Column(DECIMAL(15, 2), nullable=True)
    modalidades_frequentes = Column(JSON, nullable=True)
    compras_similares = Column(JSON, nullable=True)
    analise_ia = Column(Text, nullable=True)
    historico_pagamento = Column(String(100), nullable=True)
    ultima_atualizacao = Column(DateTime, nullable=True)
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=True)
    created_at = Column(DateTime, default=datetime.now)

    def to_dict(self):
        return {
            "id": self.id,
            "cnpj": self.cnpj,
            "nome": self.nome,
            "uf": self.uf,
            "total_compras": self.total_compras,
            "valor_total_compras": float(self.valor_total_compras) if self.valor_total_compras else None,
            "valor_medio_compras": float(self.valor_medio_compras) if self.valor_medio_compras else None,
            "modalidades_frequentes": self.modalidades_frequentes,
            "compras_similares": self.compras_similares,
            "analise_ia": self.analise_ia,
            "historico_pagamento": self.historico_pagamento,
            "ultima_atualizacao": self.ultima_atualizacao.isoformat() if self.ultima_atualizacao else None,
        }


class AtaConsultada(Base):
    """Atas de registro de preço consultadas no PNCP"""
    __tablename__ = 'atas_consultadas'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    edital_id = Column(String(36), ForeignKey('editais.id', ondelete='SET NULL'), nullable=True)  # Edital que motivou a consulta
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=True)
    numero_controle_pncp = Column(String(100), nullable=True, unique=True)
    titulo = Column(String(255), nullable=True)
    orgao = Column(String(255), nullable=True)
    cnpj_orgao = Column(String(20), nullable=True)
    uf = Column(String(2), nullable=True)
    ano = Column(Integer, nullable=True)
    seq_compra = Column(Integer, nullable=True)
    url_pncp = Column(String(500), nullable=True)
    url_edital_origem = Column(String(500), nullable=True)
    data_publicacao = Column(DateTime, nullable=True)
    data_vigencia_inicio = Column(Date, nullable=True)
    data_vigencia_fim = Column(Date, nullable=True)
    created_at = Column(DateTime, default=datetime.now)

    # Relationships
    edital = relationship("Edital", backref="atas_consultadas")
    precos_historicos = relationship("PrecoHistorico", back_populates="ata_consultada")

    def to_dict(self):
        return {
            "id": self.id,
            "edital_id": self.edital_id,
            "numero_controle_pncp": self.numero_controle_pncp,
            "titulo": self.titulo,
            "orgao": self.orgao,
            "cnpj_orgao": self.cnpj_orgao,
            "uf": self.uf,
            "ano": self.ano,
            "seq_compra": self.seq_compra,
            "url_pncp": self.url_pncp,
            "url_edital_origem": self.url_edital_origem,
            "data_publicacao": self.data_publicacao.isoformat() if self.data_publicacao else None,
        }


class ParticipacaoEdital(Base):
    """Participações de empresas em editais"""
    __tablename__ = 'participacoes_editais'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    edital_id = Column(String(36), ForeignKey('editais.id', ondelete='CASCADE'), nullable=False)
    concorrente_id = Column(String(36), ForeignKey('concorrentes.id', ondelete='SET NULL'), nullable=True)

    preco_proposto = Column(DECIMAL(15, 2), nullable=True)
    posicao_final = Column(Integer, nullable=True)  # 1 = vencedor
    desclassificado = Column(Boolean, default=False)
    motivo_desclassificacao = Column(Text, nullable=True)

    fonte = Column(Enum('manual', 'pncp', 'ata_pdf'), nullable=True)
    created_at = Column(DateTime, default=datetime.now)

    edital = relationship("Edital", back_populates="participacoes")
    concorrente = relationship("Concorrente", back_populates="participacoes")

    def to_dict(self):
        return {
            "id": self.id,
            "edital_id": self.edital_id,
            "concorrente_id": self.concorrente_id,
            "preco_proposto": float(self.preco_proposto) if self.preco_proposto else None,
            "posicao_final": self.posicao_final,
            "desclassificado": self.desclassificado,
            "motivo_desclassificacao": self.motivo_desclassificacao,
            "fonte": self.fonte,
        }


# ==================== SPRINT 2: ALERTAS E MONITORAMENTO ====================

class Alerta(Base):
    """Alertas agendados para editais"""
    __tablename__ = 'alertas'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    empresa_id = Column(String(36), ForeignKey('empresas.id', ondelete='CASCADE'), nullable=True)
    edital_id = Column(String(36), ForeignKey('editais.id', ondelete='CASCADE'), nullable=False)

    # Tipo de alerta
    tipo = Column(Enum('abertura', 'impugnacao', 'recursos', 'proposta', 'personalizado'), nullable=False, default='abertura')

    # Quando disparar
    data_disparo = Column(DateTime, nullable=False)
    tempo_antes_minutos = Column(Integer, nullable=True)  # 1440 = 24h, 60 = 1h, etc.

    # Status
    status = Column(Enum('agendado', 'disparado', 'lido', 'cancelado'), default='agendado')

    # Canais
    canal_email = Column(Boolean, default=True)
    canal_push = Column(Boolean, default=True)
    canal_sms = Column(Boolean, default=False)

    # Mensagem
    titulo = Column(String(255), nullable=True)
    mensagem = Column(Text, nullable=True)

    # Metadados
    disparado_em = Column(DateTime, nullable=True)
    lido_em = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.now)

    user = relationship("User", back_populates="alertas")
    edital = relationship("Edital", back_populates="alertas")
    notificacoes = relationship("Notificacao", back_populates="alerta")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "edital_id": self.edital_id,
            "tipo": self.tipo,
            "data_disparo": self.data_disparo.isoformat() if self.data_disparo else None,
            "tempo_antes_minutos": self.tempo_antes_minutos,
            "status": self.status,
            "canal_email": self.canal_email,
            "canal_push": self.canal_push,
            "titulo": self.titulo,
            "mensagem": self.mensagem,
            "disparado_em": self.disparado_em.isoformat() if self.disparado_em else None,
            "lido_em": self.lido_em.isoformat() if self.lido_em else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Monitoramento(Base):
    """Configurações de monitoramento automático de editais"""
    __tablename__ = 'monitoramentos'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    empresa_id = Column(String(36), ForeignKey('empresas.id', ondelete='CASCADE'), nullable=True)

    # Filtros de busca (mesmos parâmetros da tela de Captação)
    termo = Column(String(255), nullable=False)  # "hematologia", "equipamento laboratorial"
    ncm = Column(String(50), nullable=True)  # NCM complementar (ex: "9018.19.90")
    fontes = Column(JSON, nullable=True)  # ["pncp", "comprasnet", "bec"]
    ufs = Column(JSON, nullable=True)  # ["SP", "RJ", "MG"] ou null = todas
    incluir_encerrados = Column(Boolean, default=False)  # Incluir editais com prazo vencido
    valor_minimo = Column(DECIMAL(15, 2), nullable=True)
    valor_maximo = Column(DECIMAL(15, 2), nullable=True)

    # Frequência
    frequencia_horas = Column(Integer, default=4)  # A cada X horas
    ultimo_check = Column(DateTime, nullable=True)
    proximo_check = Column(DateTime, nullable=True)

    # Notificações
    notificar_email = Column(Boolean, default=True)
    notificar_push = Column(Boolean, default=True)
    score_minimo_alerta = Column(Integer, default=70)  # Alertar se score >= 70%

    # Status
    ativo = Column(Boolean, default=True)
    editais_encontrados = Column(Integer, default=0)
    ultima_execucao = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    user = relationship("User", back_populates="monitoramentos")
    notificacoes = relationship("Notificacao", back_populates="monitoramento")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "termo": self.termo,
            "ncm": self.ncm,
            "fontes": self.fontes,
            "ufs": self.ufs,
            "incluir_encerrados": self.incluir_encerrados,
            "valor_minimo": float(self.valor_minimo) if self.valor_minimo else None,
            "valor_maximo": float(self.valor_maximo) if self.valor_maximo else None,
            "frequencia_horas": self.frequencia_horas,
            "ultimo_check": self.ultimo_check.isoformat() if self.ultimo_check else None,
            "proximo_check": self.proximo_check.isoformat() if self.proximo_check else None,
            "notificar_email": self.notificar_email,
            "notificar_push": self.notificar_push,
            "score_minimo_alerta": self.score_minimo_alerta,
            "ativo": self.ativo,
            "editais_encontrados": self.editais_encontrados,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Notificacao(Base):
    """Notificações enviadas (histórico)"""
    __tablename__ = 'notificacoes'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    empresa_id = Column(String(36), ForeignKey('empresas.id', ondelete='CASCADE'), nullable=True)

    # Referência
    tipo = Column(Enum('alerta_prazo', 'novo_edital', 'alta_aderencia', 'resultado', 'sistema'), nullable=False)
    edital_id = Column(String(36), ForeignKey('editais.id', ondelete='SET NULL'), nullable=True)
    alerta_id = Column(String(36), ForeignKey('alertas.id', ondelete='SET NULL'), nullable=True)
    monitoramento_id = Column(String(36), ForeignKey('monitoramentos.id', ondelete='SET NULL'), nullable=True)

    # Conteúdo
    titulo = Column(String(255), nullable=False)
    mensagem = Column(Text, nullable=False)
    dados = Column(JSON, nullable=True)  # Dados adicionais em JSON

    # Canais
    enviado_email = Column(Boolean, default=False)
    enviado_push = Column(Boolean, default=False)
    enviado_sms = Column(Boolean, default=False)

    # Status
    lida = Column(Boolean, default=False)
    lida_em = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.now)

    user = relationship("User", back_populates="notificacoes")
    edital = relationship("Edital", back_populates="notificacoes")
    alerta = relationship("Alerta", back_populates="notificacoes")
    monitoramento = relationship("Monitoramento", back_populates="notificacoes")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "tipo": self.tipo,
            "edital_id": self.edital_id,
            "alerta_id": self.alerta_id,
            "monitoramento_id": self.monitoramento_id,
            "titulo": self.titulo,
            "mensagem": self.mensagem,
            "dados": self.dados,
            "enviado_email": self.enviado_email,
            "enviado_push": self.enviado_push,
            "lida": self.lida,
            "lida_em": self.lida_em.isoformat() if self.lida_em else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class PreferenciasNotificacao(Base):
    """Preferências do usuário para notificações"""
    __tablename__ = 'preferencias_notificacao'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True)

    # Canais habilitados
    email_habilitado = Column(Boolean, default=True)
    push_habilitado = Column(Boolean, default=True)
    sms_habilitado = Column(Boolean, default=False)

    # Email
    email_notificacao = Column(String(255), nullable=True)  # Email alternativo para notificações

    # Horários permitidos
    horario_inicio = Column(String(5), default='07:00')  # HH:MM
    horario_fim = Column(String(5), default='22:00')
    dias_semana = Column(JSON, default=lambda: ["seg", "ter", "qua", "qui", "sex"])

    # Tipos de alerta padrão (minutos antes)
    alertas_padrao = Column(JSON, default=lambda: [4320, 1440, 60, 15])  # 3 dias, 24h, 1h, 15min

    # Filtros
    score_minimo_notificacao = Column(Integer, default=60)

    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    user = relationship("User", back_populates="preferencias_notificacao")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "email_habilitado": self.email_habilitado,
            "push_habilitado": self.push_habilitado,
            "sms_habilitado": self.sms_habilitado,
            "email_notificacao": self.email_notificacao,
            "horario_inicio": self.horario_inicio,
            "horario_fim": self.horario_fim,
            "dias_semana": self.dias_semana,
            "alertas_padrao": self.alertas_padrao,
            "score_minimo_notificacao": self.score_minimo_notificacao,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# ==================== DOCUMENTOS GERADOS ====================

class Documento(Base):
    __tablename__ = 'documentos'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    empresa_id = Column(String(36), ForeignKey('empresas.id', ondelete='CASCADE'), nullable=True)
    session_id = Column(String(36), ForeignKey('sessions.id', ondelete='SET NULL'), nullable=True)
    tipo = Column(String(50), nullable=False)
    titulo = Column(String(255), nullable=False)
    conteudo_md = Column(Text, nullable=False)
    dados_json = Column(JSON, nullable=True)
    versao = Column(Integer, default=1)
    documento_pai_id = Column(String(36), ForeignKey('documentos.id', ondelete='SET NULL'), nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    user = relationship("User", back_populates="documentos_gerados")
    session = relationship("Session", back_populates="documentos")

    def to_dict(self, include_content=True):
        result = {
            "id": self.id,
            "user_id": self.user_id,
            "session_id": self.session_id,
            "tipo": self.tipo,
            "titulo": self.titulo,
            "versao": self.versao,
            "documento_pai_id": self.documento_pai_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
        if include_content:
            result["conteudo_md"] = self.conteudo_md
            result["dados_json"] = self.dados_json
        return result


# ==================== EMPRESA (Dados da empresa do usuário) ====================

class Empresa(Base):
    """Dados cadastrais da empresa do usuário"""
    __tablename__ = 'empresas'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    cnpj = Column(String(20), unique=True, nullable=False)
    razao_social = Column(String(255), nullable=False)
    nome_fantasia = Column(String(255), nullable=True)
    inscricao_estadual = Column(String(20), nullable=True)
    inscricao_municipal = Column(String(20), nullable=True)
    regime_tributario = Column(Enum('simples', 'lucro_presumido', 'lucro_real'), nullable=True)
    endereco = Column(Text, nullable=True)
    cidade = Column(String(100), nullable=True)
    uf = Column(String(2), nullable=True)
    cep = Column(String(10), nullable=True)
    website = Column(String(500), nullable=True)
    instagram = Column(String(100), nullable=True)
    linkedin = Column(String(100), nullable=True)
    facebook = Column(String(100), nullable=True)
    telefone = Column(String(20), nullable=True)
    celulares = Column(Text, nullable=True)
    email = Column(String(255), nullable=True)
    emails = Column(Text, nullable=True)
    porte = Column(Enum('me', 'epp', 'medio', 'grande'), nullable=True)
    areas_atuacao = Column(JSON, nullable=True)
    frequencia_busca_certidoes = Column(String(20), default='diaria', nullable=True)
    area_padrao_id = Column(String(36), ForeignKey('areas_produto.id', ondelete='SET NULL'), nullable=True)
    ativo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    user = relationship("User", back_populates="empresas")
    area_padrao = relationship("AreaProduto", foreign_keys=[area_padrao_id], lazy="joined")
    documentos = relationship("EmpresaDocumento", back_populates="empresa", cascade="all, delete-orphan")
    certidoes = relationship("EmpresaCertidao", back_populates="empresa", cascade="all, delete-orphan")
    responsaveis = relationship("EmpresaResponsavel", back_populates="empresa", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "cnpj": self.cnpj,
            "razao_social": self.razao_social,
            "nome_fantasia": self.nome_fantasia,
            "inscricao_estadual": self.inscricao_estadual,
            "inscricao_municipal": self.inscricao_municipal,
            "regime_tributario": self.regime_tributario,
            "endereco": self.endereco,
            "cidade": self.cidade,
            "uf": self.uf,
            "cep": self.cep,
            "website": self.website,
            "instagram": self.instagram,
            "linkedin": self.linkedin,
            "facebook": self.facebook,
            "telefone": self.telefone,
            "celulares": self.celulares,
            "email": self.email,
            "emails": self.emails,
            "porte": self.porte,
            "areas_atuacao": self.areas_atuacao,
            "frequencia_busca_certidoes": self.frequencia_busca_certidoes,
            "area_padrao_id": self.area_padrao_id,
            "area_padrao_nome": self.area_padrao.nome if self.area_padrao else None,
            "ativo": self.ativo,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class CategoriaDocumento(Base):
    """Categorias de documentos para licitações (Habilitação Jurídica, Fiscal, etc.)"""
    __tablename__ = 'categorias_documento'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    nome = Column(String(100), nullable=False, unique=True)
    descricao = Column(Text, nullable=True)
    ordem = Column(Integer, default=0)
    ativo = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.now)

    documentos_necessarios = relationship("DocumentoNecessario", back_populates="categoria_rel")

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "descricao": self.descricao,
            "ordem": self.ordem,
            "ativo": self.ativo,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class DocumentoNecessario(Base):
    """Tipos de documentos necessários para licitações — popula o dropdown de upload"""
    __tablename__ = 'documentos_necessarios'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    categoria_id = Column(String(36), ForeignKey('categorias_documento.id', ondelete='SET NULL'), nullable=True)
    nome = Column(String(255), nullable=False)
    descricao = Column(Text, nullable=True)
    tipo_chave = Column(String(50), nullable=False, unique=True)
    base_legal = Column(String(500), nullable=True)
    validade_dias = Column(Integer, nullable=True)
    obrigatorio = Column(Boolean, default=True)
    ativo = Column(Boolean, default=True)
    ordem = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.now)

    categoria_rel = relationship("CategoriaDocumento", back_populates="documentos_necessarios")
    documentos = relationship("EmpresaDocumento", back_populates="documento_necessario")

    def to_dict(self):
        cat = self.categoria_rel
        return {
            "id": self.id,
            "categoria_id": self.categoria_id,
            "categoria": cat.nome if cat else None,
            "nome": self.nome,
            "descricao": self.descricao,
            "tipo_chave": self.tipo_chave,
            "base_legal": self.base_legal,
            "validade_dias": self.validade_dias,
            "obrigatorio": self.obrigatorio,
            "ativo": self.ativo,
            "ordem": self.ordem,
        }


class EmpresaDocumento(Base):
    """Documentos da empresa (contrato social, atestados, etc)"""
    __tablename__ = 'empresa_documentos'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    empresa_id = Column(String(36), ForeignKey('empresas.id', ondelete='CASCADE'), nullable=False)
    tipo = Column(Enum(
        'contrato_social', 'atestado_capacidade', 'balanco', 'alvara',
        'registro_conselho', 'procuracao', 'certidao_negativa',
        'habilitacao_fiscal', 'habilitacao_economica', 'qualificacao_tecnica',
        'afe', 'cbpad', 'cbpp', 'bombeiros', 'outro'
    ), nullable=False)
    documento_necessario_id = Column(String(36), ForeignKey('documentos_necessarios.id', ondelete='SET NULL'), nullable=True)
    nome_arquivo = Column(String(255), nullable=False)
    path_arquivo = Column(String(500), nullable=False)
    data_emissao = Column(Date, nullable=True)
    data_vencimento = Column(Date, nullable=True)
    texto_extraido = Column(LONGTEXT, nullable=True)
    processado = Column(Boolean, default=False)
    edital_requisito_id = Column(String(36), ForeignKey('editais_requisitos.id', ondelete='SET NULL'), nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    empresa = relationship("Empresa", back_populates="documentos")
    documento_necessario = relationship("DocumentoNecessario", back_populates="documentos")

    def to_dict(self):
        dn = self.documento_necessario
        return {
            "id": self.id,
            "empresa_id": self.empresa_id,
            "tipo": self.tipo,
            "documento_necessario_id": self.documento_necessario_id,
            "documento_necessario_nome": dn.nome if dn else None,
            "documento_necessario_categoria": dn.categoria_rel.nome if dn and dn.categoria_rel else None,
            "nome_arquivo": self.nome_arquivo,
            "path_arquivo": self.path_arquivo,
            "data_emissao": self.data_emissao.isoformat() if self.data_emissao else None,
            "data_vencimento": self.data_vencimento.isoformat() if self.data_vencimento else None,
            "processado": self.processado,
            "edital_requisito_id": self.edital_requisito_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class EmpresaCertidao(Base):
    """Certidões da empresa (CND, FGTS, trabalhista, etc)"""
    __tablename__ = 'empresa_certidoes'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    empresa_id = Column(String(36), ForeignKey('empresas.id', ondelete='CASCADE'), nullable=False)
    tipo = Column(Enum('cnd_federal', 'cnd_estadual', 'cnd_municipal', 'fgts', 'trabalhista', 'outro'), nullable=False)
    orgao_emissor = Column(String(255), nullable=True)
    numero = Column(String(100), nullable=True)
    data_emissao = Column(Date, nullable=True)
    data_vencimento = Column(Date, nullable=False)
    path_arquivo = Column(String(500), nullable=True)
    status = Column(Enum('valida', 'vencida', 'pendente', 'buscando', 'erro', 'nao_disponivel'), default='pendente')
    url_consulta = Column(String(500), nullable=True)
    mensagem = Column(Text, nullable=True)
    dados_extras = Column(JSON, nullable=True)
    fonte_certidao_id = Column(String(36), ForeignKey('fontes_certidoes.id', ondelete='SET NULL'), nullable=True)
    edital_requisito_id = Column(String(36), ForeignKey('editais_requisitos.id', ondelete='SET NULL'), nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    empresa = relationship("Empresa", back_populates="certidoes")
    fonte = relationship("FonteCertidao", lazy="joined")

    def to_dict(self):
        return {
            "id": self.id,
            "empresa_id": self.empresa_id,
            "tipo": self.tipo,
            "orgao_emissor": self.orgao_emissor,
            "numero": self.numero,
            "data_emissao": self.data_emissao.isoformat() if self.data_emissao else None,
            "data_vencimento": self.data_vencimento.isoformat() if self.data_vencimento else None,
            "path_arquivo": self.path_arquivo,
            "status": self.status,
            "url_consulta": self.url_consulta,
            "mensagem": self.mensagem,
            "dados_extras": self.dados_extras,
            "fonte_certidao_id": self.fonte_certidao_id,
            "fonte_nome": (self.fonte.nome if self.fonte else None) if self.fonte_certidao_id else None,
            "permite_busca_automatica": (self.fonte.permite_busca_automatica if self.fonte else True) if self.fonte_certidao_id else True,
            "edital_requisito_id": self.edital_requisito_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class EmpresaResponsavel(Base):
    """Responsáveis/representantes da empresa"""
    __tablename__ = 'empresa_responsaveis'
    __table_args__ = (UniqueConstraint('empresa_id', 'cpf', name='uq_empresa_responsavel_cpf'),)

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    empresa_id = Column(String(36), ForeignKey('empresas.id', ondelete='CASCADE'), nullable=False)
    nome = Column(String(255), nullable=False)
    cargo = Column(String(100), nullable=True)
    cpf = Column(String(14), nullable=True)
    email = Column(String(255), nullable=True)
    telefone = Column(String(20), nullable=True)
    tipo = Column(Enum('representante_legal', 'preposto', 'tecnico'), nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    empresa = relationship("Empresa", back_populates="responsaveis")

    def to_dict(self):
        return {
            "id": self.id,
            "empresa_id": self.empresa_id,
            "nome": self.nome,
            "cargo": self.cargo,
            "cpf": self.cpf,
            "email": self.email,
            "telefone": self.telefone,
            "tipo": self.tipo,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# ==================== FONTES DE CERTIDÕES ====================

class FonteCertidao(Base):
    """Fontes/portais oficiais para busca de certidões da empresa.
    Cadastra cada portal com URL, tipo de certidão, e credenciais opcionais
    para busca automatizada via IA."""
    __tablename__ = 'fontes_certidoes'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    empresa_id = Column(String(36), ForeignKey('empresas.id', ondelete='CASCADE'), nullable=True)
    tipo_certidao = Column(Enum(
        'cnd_federal', 'cnd_estadual', 'cnd_municipal', 'fgts', 'trabalhista', 'outro'
    ), nullable=False)
    nome = Column(String(255), nullable=False)  # Ex: "Receita Federal", "SEFAZ-SP"
    orgao_emissor = Column(String(255), nullable=True)  # Ex: "Receita Federal / PGFN"
    url_portal = Column(String(500), nullable=False)  # URL do portal de consulta
    url_api = Column(String(500), nullable=True)  # URL de API, se disponível (ex: SERPRO)
    metodo_acesso = Column(Enum('publico', 'login_senha', 'certificado_digital', 'api_key'), default='publico')
    usuario = Column(String(255), nullable=True)  # Login/usuário no portal (se requer autenticação)
    senha_criptografada = Column(String(500), nullable=True)  # Senha criptografada (se requer autenticação)
    certificado_path = Column(String(500), nullable=True)  # Caminho do certificado digital A1/A3
    api_key = Column(String(500), nullable=True)  # API key se acesso via API
    cnpj_consulta = Column(String(18), nullable=True)  # CNPJ usado para consulta (se diferente do da empresa)
    uf = Column(String(2), nullable=True)  # UF relevante (para SEFAZ estaduais)
    cidade = Column(String(100), nullable=True)  # Cidade relevante (para CND municipal)
    requer_autenticacao = Column(Boolean, default=False)  # Se precisa login para consultar
    permite_busca_automatica = Column(Boolean, default=True)  # Se a IA pode buscar automaticamente
    observacoes = Column(Text, nullable=True)  # Notas sobre como acessar o portal
    ativo = Column(Boolean, default=True)
    ultima_consulta = Column(DateTime, nullable=True)
    resultado_ultima_consulta = Column(Enum('sucesso', 'erro', 'timeout', 'login_invalido'), nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "tipo_certidao": self.tipo_certidao,
            "nome": self.nome,
            "orgao_emissor": self.orgao_emissor,
            "url_portal": self.url_portal,
            "url_api": self.url_api,
            "metodo_acesso": self.metodo_acesso,
            "usuario": self.usuario,
            "senha_criptografada": "***" if self.senha_criptografada else None,  # Nunca expor senha
            "certificado_path": self.certificado_path,
            "api_key": "***" if self.api_key else None,  # Nunca expor API key
            "cnpj_consulta": self.cnpj_consulta,
            "uf": self.uf,
            "cidade": self.cidade,
            "requer_autenticacao": self.requer_autenticacao,
            "permite_busca_automatica": self.permite_busca_automatica,
            "observacoes": self.observacoes,
            "ativo": self.ativo,
            "ultima_consulta": self.ultima_consulta.isoformat() if self.ultima_consulta else None,
            "resultado_ultima_consulta": self.resultado_ultima_consulta,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


# ==================== CONTRATOS ====================

class Contrato(Base):
    """Contratos firmados após ganho de licitação"""
    __tablename__ = 'contratos'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    empresa_id = Column(String(36), ForeignKey('empresas.id', ondelete='CASCADE'), nullable=True)
    edital_id = Column(String(36), ForeignKey('editais.id', ondelete='SET NULL'), nullable=True)
    proposta_id = Column(String(36), ForeignKey('propostas.id', ondelete='SET NULL'), nullable=True)
    numero_contrato = Column(String(100), nullable=True)
    orgao = Column(String(255), nullable=True)
    objeto = Column(Text, nullable=True)
    valor_total = Column(DECIMAL(15, 2), nullable=True)
    data_assinatura = Column(Date, nullable=True)
    data_inicio = Column(Date, nullable=True)
    data_fim = Column(Date, nullable=True)
    status = Column(Enum('vigente', 'encerrado', 'rescindido', 'suspenso'), default='vigente')
    arquivo_path = Column(String(500), nullable=True)
    observacoes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    user = relationship("User", back_populates="contratos")
    edital = relationship("Edital", back_populates="contratos")
    proposta = relationship("Proposta")
    entregas = relationship("ContratoEntrega", back_populates="contrato", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "edital_id": self.edital_id,
            "proposta_id": self.proposta_id,
            "numero_contrato": self.numero_contrato,
            "orgao": self.orgao,
            "objeto": self.objeto,
            "valor_total": float(self.valor_total) if self.valor_total else None,
            "data_assinatura": self.data_assinatura.isoformat() if self.data_assinatura else None,
            "data_inicio": self.data_inicio.isoformat() if self.data_inicio else None,
            "data_fim": self.data_fim.isoformat() if self.data_fim else None,
            "status": self.status,
            "arquivo_path": self.arquivo_path,
            "observacoes": self.observacoes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class ContratoEntrega(Base):
    """Entregas de itens do contrato (contratado x realizado)"""
    __tablename__ = 'contrato_entregas'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    contrato_id = Column(String(36), ForeignKey('contratos.id', ondelete='CASCADE'), nullable=False)
    produto_id = Column(String(36), ForeignKey('produtos.id', ondelete='SET NULL'), nullable=True)
    descricao = Column(Text, nullable=True)
    quantidade = Column(DECIMAL(15, 4), nullable=True)
    valor_unitario = Column(DECIMAL(15, 2), nullable=True)
    valor_total = Column(DECIMAL(15, 2), nullable=True)
    data_prevista = Column(Date, nullable=False)
    data_realizada = Column(Date, nullable=True)
    nota_fiscal = Column(String(100), nullable=True)
    numero_empenho = Column(String(100), nullable=True)
    status = Column(Enum('pendente', 'entregue', 'atrasado', 'cancelado'), default='pendente')
    observacoes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    contrato = relationship("Contrato", back_populates="entregas")
    produto = relationship("Produto")

    def to_dict(self):
        return {
            "id": self.id,
            "contrato_id": self.contrato_id,
            "produto_id": self.produto_id,
            "descricao": self.descricao,
            "quantidade": float(self.quantidade) if self.quantidade else None,
            "valor_unitario": float(self.valor_unitario) if self.valor_unitario else None,
            "valor_total": float(self.valor_total) if self.valor_total else None,
            "data_prevista": self.data_prevista.isoformat() if self.data_prevista else None,
            "data_realizada": self.data_realizada.isoformat() if self.data_realizada else None,
            "nota_fiscal": self.nota_fiscal,
            "numero_empenho": self.numero_empenho,
            "status": self.status,
            "observacoes": self.observacoes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# ==================== RECURSOS E IMPUGNAÇÕES ====================

class Recurso(Base):
    """Recursos, contra-razões e impugnações"""
    __tablename__ = 'recursos'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    empresa_id = Column(String(36), ForeignKey('empresas.id', ondelete='CASCADE'), nullable=True)
    edital_id = Column(String(36), ForeignKey('editais.id', ondelete='CASCADE'), nullable=False)
    tipo = Column(Enum('recurso', 'contra_razao', 'impugnacao'), nullable=False)
    motivo = Column(Text, nullable=True)
    texto_minuta = Column(LONGTEXT, nullable=True)
    fundamentacao_legal = Column(Text, nullable=True)
    data_protocolo = Column(DateTime, nullable=True)
    prazo_limite = Column(DateTime, nullable=False)
    status = Column(Enum('rascunho', 'protocolado', 'deferido', 'indeferido', 'pendente'), default='rascunho')
    resultado = Column(Text, nullable=True)
    arquivo_path = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    user = relationship("User", back_populates="recursos")
    edital = relationship("Edital", back_populates="recursos")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "edital_id": self.edital_id,
            "tipo": self.tipo,
            "motivo": self.motivo,
            "fundamentacao_legal": self.fundamentacao_legal,
            "data_protocolo": self.data_protocolo.isoformat() if self.data_protocolo else None,
            "prazo_limite": self.prazo_limite.isoformat() if self.prazo_limite else None,
            "status": self.status,
            "resultado": self.resultado,
            "arquivo_path": self.arquivo_path,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# ==================== CRM ====================

class LeadCRM(Base):
    """Leads para CRM de órgãos públicos"""
    __tablename__ = 'leads_crm'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    empresa_id = Column(String(36), ForeignKey('empresas.id', ondelete='CASCADE'), nullable=True)
    edital_id = Column(String(36), ForeignKey('editais.id', ondelete='SET NULL'), nullable=True)
    orgao = Column(String(255), nullable=False)
    cnpj_orgao = Column(String(20), nullable=True)
    contato_nome = Column(String(255), nullable=True)
    contato_cargo = Column(String(100), nullable=True)
    contato_telefone = Column(String(20), nullable=True)
    contato_email = Column(String(255), nullable=True)
    status_pipeline = Column(Enum('prospeccao', 'contato', 'proposta', 'negociacao', 'ganho', 'perdido', 'inativo'), default='prospeccao')
    origem = Column(String(100), nullable=True)
    valor_potencial = Column(DECIMAL(15, 2), nullable=True)
    proxima_acao = Column(Text, nullable=True)
    data_proxima_acao = Column(Date, nullable=True)
    ultima_interacao = Column(DateTime, nullable=True)
    observacoes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    user = relationship("User", back_populates="leads_crm")
    edital = relationship("Edital", back_populates="leads_crm")
    acoes_pos_perda = relationship("AcaoPosPerda", back_populates="lead_crm")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "edital_id": self.edital_id,
            "orgao": self.orgao,
            "cnpj_orgao": self.cnpj_orgao,
            "contato_nome": self.contato_nome,
            "contato_cargo": self.contato_cargo,
            "contato_telefone": self.contato_telefone,
            "contato_email": self.contato_email,
            "status_pipeline": self.status_pipeline,
            "origem": self.origem,
            "valor_potencial": float(self.valor_potencial) if self.valor_potencial else None,
            "proxima_acao": self.proxima_acao,
            "data_proxima_acao": self.data_proxima_acao.isoformat() if self.data_proxima_acao else None,
            "ultima_interacao": self.ultima_interacao.isoformat() if self.ultima_interacao else None,
            "observacoes": self.observacoes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class AcaoPosPerda(Base):
    """Ações pós-perda para reconquista"""
    __tablename__ = 'acoes_pos_perda'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    empresa_id = Column(String(36), ForeignKey('empresas.id', ondelete='CASCADE'), nullable=True)
    edital_id = Column(String(36), ForeignKey('editais.id', ondelete='SET NULL'), nullable=True)
    lead_crm_id = Column(String(36), ForeignKey('leads_crm.id', ondelete='SET NULL'), nullable=True)
    tipo_acao = Column(Enum('reprocessar_oferta', 'visita_tecnica', 'nova_proposta', 'recurso', 'acompanhar'), nullable=True)
    descricao = Column(Text, nullable=True)
    responsavel = Column(String(255), nullable=True)
    data_prevista = Column(Date, nullable=True)
    data_realizada = Column(Date, nullable=True)
    resultado = Column(Text, nullable=True)
    status = Column(Enum('pendente', 'em_andamento', 'concluida', 'cancelada'), default='pendente')
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    user = relationship("User", back_populates="acoes_pos_perda")
    edital = relationship("Edital", back_populates="acoes_pos_perda")
    lead_crm = relationship("LeadCRM", back_populates="acoes_pos_perda")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "edital_id": self.edital_id,
            "lead_crm_id": self.lead_crm_id,
            "tipo_acao": self.tipo_acao,
            "descricao": self.descricao,
            "responsavel": self.responsavel,
            "data_prevista": self.data_prevista.isoformat() if self.data_prevista else None,
            "data_realizada": self.data_realizada.isoformat() if self.data_realizada else None,
            "resultado": self.resultado,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# ==================== AUDITORIA E APRENDIZADO ====================

class AuditoriaLog(Base):
    """Log de auditoria de ações do sistema"""
    __tablename__ = 'auditoria_log'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    session_id = Column(String(36), ForeignKey('sessions.id', ondelete='SET NULL'), nullable=True)
    user_email = Column(String(255), nullable=True)
    acao = Column(String(50), nullable=False)
    entidade = Column(String(50), nullable=False)
    entidade_id = Column(String(36), nullable=True)
    dados_antes = Column(JSON, nullable=True)
    dados_depois = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.now)

    user = relationship("User", back_populates="auditoria_logs")
    session = relationship("Session", back_populates="auditoria_logs")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "session_id": self.session_id,
            "user_email": self.user_email,
            "acao": self.acao,
            "entidade": self.entidade,
            "entidade_id": self.entidade_id,
            "dados_antes": self.dados_antes,
            "dados_depois": self.dados_depois,
            "ip_address": self.ip_address,
            "user_agent": self.user_agent,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class AprendizadoFeedback(Base):
    """Feedback e aprendizado do sistema para melhoria contínua"""
    __tablename__ = 'aprendizado_feedback'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    empresa_id = Column(String(36), ForeignKey('empresas.id', ondelete='CASCADE'), nullable=True)
    tipo_evento = Column(Enum('resultado_edital', 'score_ajustado', 'preco_ajustado', 'feedback_usuario'), nullable=False)
    entidade = Column(String(50), nullable=True)
    entidade_id = Column(String(36), nullable=True)
    dados_entrada = Column(JSON, nullable=True)
    resultado_real = Column(JSON, nullable=True)
    delta = Column(JSON, nullable=True)
    aplicado = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.now)

    user = relationship("User", back_populates="aprendizado_feedback")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "tipo_evento": self.tipo_evento,
            "entidade": self.entidade,
            "entidade_id": self.entidade_id,
            "dados_entrada": self.dados_entrada,
            "resultado_real": self.resultado_real,
            "delta": self.delta,
            "aplicado": self.aplicado,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# ==================== PARAMETRIZAÇÕES ====================

class ParametroScore(Base):
    """Parâmetros de score e pesos configuráveis por empresa"""
    __tablename__ = 'parametros_score'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=True)
    empresa_id = Column(String(36), ForeignKey('empresas.id', ondelete='CASCADE'), nullable=False, unique=True)
    # Pesos das 6 dimensões do score profundo (devem somar 1.0)
    peso_tecnico = Column(DECIMAL(5, 2), default=0.35)
    peso_comercial = Column(DECIMAL(5, 2), default=0.10)
    peso_documental = Column(DECIMAL(5, 2), default=0.15)
    peso_complexidade = Column(DECIMAL(5, 2), default=0.15)
    peso_juridico = Column(DECIMAL(5, 2), default=0.20)
    peso_logistico = Column(DECIMAL(5, 2), default=0.05)
    # Limiares de decisão GO/NO-GO
    limiar_go = Column(DECIMAL(5, 2), default=70.0)
    limiar_nogo = Column(DECIMAL(5, 2), default=40.0)
    limiar_tecnico_go = Column(DECIMAL(5, 2), default=60.0)      # score_tecnico >= X para GO
    limiar_tecnico_nogo = Column(DECIMAL(5, 2), default=30.0)    # score_tecnico < X para NO-GO
    limiar_juridico_go = Column(DECIMAL(5, 2), default=60.0)     # score_juridico >= X para GO
    limiar_juridico_nogo = Column(DECIMAL(5, 2), default=30.0)   # score_juridico < X para NO-GO
    margem_minima = Column(DECIMAL(5, 2), nullable=True)
    # Campos comerciais (Parametrizações)
    estados_atuacao = Column(JSON, nullable=True)       # ["SP", "RJ", "MG"]
    prazo_maximo = Column(Integer, nullable=True)        # dias
    frequencia_maxima = Column(String(20), nullable=True)  # semanal, mensal, etc
    tam = Column(DECIMAL(15, 2), nullable=True)
    sam = Column(DECIMAL(15, 2), nullable=True)
    som = Column(DECIMAL(15, 2), nullable=True)
    tipos_edital = Column(JSON, nullable=True)           # ["comodato", "venda", ...]
    palavras_chave = Column(JSON, nullable=True)         # ["microscopio", "centrifuga"]
    ncms_busca = Column(JSON, nullable=True)             # ["9018.19.80"]
    # RF-014: Custos e Margens
    markup_padrao = Column(Float, default=0.0)           # Markup % padrao
    custos_fixos = Column(Float, default=0.0)            # Custos operacionais fixos mensais
    frete_base = Column(Float, default=0.0)              # Custo base de frete
    # FASE 1 Precificação: Alíquotas tributárias padrão
    icms_padrao = Column(DECIMAL(5, 2), default=18.0)    # ICMS padrão (%)
    pis_cofins = Column(DECIMAL(5, 2), default=9.25)     # PIS + COFINS (%)
    ipi_padrao = Column(DECIMAL(5, 2), default=0.0)      # IPI padrão (%)
    custo_logistica_percentual = Column(DECIMAL(5, 2), default=5.0)  # Logística sobre custo (%)
    margem_contribuicao_min = Column(DECIMAL(5, 2), default=15.0)    # Margem contribuição mínima (%)
    ncm_isencao_icms = Column(JSON, nullable=True)       # NCMs com isenção ICMS ["3822"]
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    user = relationship("User", back_populates="parametro_score")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "peso_tecnico": float(self.peso_tecnico) if self.peso_tecnico else None,
            "peso_comercial": float(self.peso_comercial) if self.peso_comercial else None,
            "peso_documental": float(self.peso_documental) if self.peso_documental else None,
            "peso_complexidade": float(self.peso_complexidade) if self.peso_complexidade else None,
            "peso_juridico": float(self.peso_juridico) if self.peso_juridico else None,
            "peso_logistico": float(self.peso_logistico) if self.peso_logistico else None,
            "limiar_go": float(self.limiar_go) if self.limiar_go else None,
            "limiar_nogo": float(self.limiar_nogo) if self.limiar_nogo else None,
            "limiar_tecnico_go": float(self.limiar_tecnico_go) if self.limiar_tecnico_go else None,
            "limiar_tecnico_nogo": float(self.limiar_tecnico_nogo) if self.limiar_tecnico_nogo else None,
            "limiar_juridico_go": float(self.limiar_juridico_go) if self.limiar_juridico_go else None,
            "limiar_juridico_nogo": float(self.limiar_juridico_nogo) if self.limiar_juridico_nogo else None,
            "margem_minima": float(self.margem_minima) if self.margem_minima else None,
            "estados_atuacao": self.estados_atuacao,
            "prazo_maximo": self.prazo_maximo,
            "frequencia_maxima": self.frequencia_maxima,
            "tam": float(self.tam) if self.tam else None,
            "sam": float(self.sam) if self.sam else None,
            "som": float(self.som) if self.som else None,
            "tipos_edital": self.tipos_edital,
            "palavras_chave": self.palavras_chave,
            "ncms_busca": self.ncms_busca,
            "markup_padrao": self.markup_padrao,
            "custos_fixos": self.custos_fixos,
            "frete_base": self.frete_base,
            "icms_padrao": float(self.icms_padrao) if self.icms_padrao else None,
            "pis_cofins": float(self.pis_cofins) if self.pis_cofins else None,
            "ipi_padrao": float(self.ipi_padrao) if self.ipi_padrao else None,
            "custo_logistica_percentual": float(self.custo_logistica_percentual) if self.custo_logistica_percentual else None,
            "margem_contribuicao_min": float(self.margem_contribuicao_min) if self.margem_contribuicao_min else None,
            "ncm_isencao_icms": self.ncm_isencao_icms,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class ClasseProduto(Base):
    """Classes e subclasses de produtos parametrizáveis pelo usuário"""
    __tablename__ = 'classes_produtos'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    empresa_id = Column(String(36), ForeignKey('empresas.id', ondelete='CASCADE'), nullable=True)
    nome = Column(String(255), nullable=False)
    tipo = Column(String(20), nullable=False, default='classe')  # classe ou subclasse
    ncms = Column(JSON, nullable=True)  # ["9018.19.80", "9027.80.99"]
    classe_pai_id = Column(String(36), ForeignKey('classes_produtos.id', ondelete='CASCADE'), nullable=True)
    campos_mascara = Column(JSON, nullable=True)  # [{"nome": "Potencia", "tipo": "texto"}, ...]
    qtd_produtos = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    user = relationship("User", backref="classes_produtos")
    classe_pai = relationship("ClasseProduto", remote_side=[id], backref="subclasses")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "nome": self.nome,
            "tipo": self.tipo,
            "ncms": self.ncms,
            "classe_pai_id": self.classe_pai_id,
            "campos_mascara": self.campos_mascara,
            "qtd_produtos": self.qtd_produtos,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Dispensa(Base):
    """Dispensas de licitação"""
    __tablename__ = 'dispensas'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    empresa_id = Column(String(36), ForeignKey('empresas.id', ondelete='CASCADE'), nullable=True)
    edital_id = Column(String(36), ForeignKey('editais.id', ondelete='CASCADE'), nullable=False)
    artigo = Column(String(50), nullable=True)
    valor_limite = Column(DECIMAL(15, 2), nullable=True)
    justificativa = Column(Text, nullable=True)
    cotacao_texto = Column(LONGTEXT, nullable=True)
    fornecedores_cotados = Column(JSON, nullable=True)
    status = Column(Enum('aberta', 'cotacao_enviada', 'adjudicada', 'encerrada'), default='aberta')
    data_limite = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    user = relationship("User", back_populates="dispensas")
    edital = relationship("Edital", back_populates="dispensas")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "edital_id": self.edital_id,
            "artigo": self.artigo,
            "valor_limite": float(self.valor_limite) if self.valor_limite else None,
            "justificativa": self.justificativa,
            "fornecedores_cotados": self.fornecedores_cotados,
            "status": self.status,
            "data_limite": self.data_limite.isoformat() if self.data_limite else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class EstrategiaEdital(Base):
    """Estratégia e decisão go/nogo por edital"""
    __tablename__ = 'estrategias_editais'
    __table_args__ = (UniqueConstraint('user_id', 'edital_id', name='uq_estrategia_user_edital'),)

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    empresa_id = Column(String(36), ForeignKey('empresas.id', ondelete='CASCADE'), nullable=True)
    edital_id = Column(String(36), ForeignKey('editais.id', ondelete='CASCADE'), nullable=False)
    decisao = Column(Enum('go', 'nogo', 'acompanhar'), nullable=True)
    prioridade = Column(Enum('alta', 'media', 'baixa'), nullable=True)
    margem_desejada = Column(DECIMAL(5, 2), nullable=True)
    agressividade_preco = Column(Enum('conservador', 'moderado', 'agressivo'), nullable=True)
    justificativa = Column(Text, nullable=True)
    data_decisao = Column(DateTime, nullable=True)
    decidido_por = Column(String(255), nullable=True)
    # FASE 1 Precificação: Estratégia competitiva (UC-P08)
    perfil_competitivo = Column(Enum('quero_ganhar', 'nao_ganhei_minimo'), nullable=True)
    margem_minima = Column(DECIMAL(5, 2), nullable=True)      # % margem mínima aceitável
    margem_maxima = Column(DECIMAL(5, 2), nullable=True)      # % margem máxima desejada
    desconto_maximo = Column(DECIMAL(5, 2), nullable=True)    # % desconto máximo sobre referência
    priorizar_volume = Column(Boolean, default=False)          # Prioriza volume sobre margem
    notas_estrategia = Column(Text, nullable=True)             # Notas livres
    cenarios_simulados = Column(JSON, nullable=True)           # [{cenario, valor, margem}]
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    user = relationship("User", back_populates="estrategias")
    edital = relationship("Edital", back_populates="estrategias")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "edital_id": self.edital_id,
            "decisao": self.decisao,
            "prioridade": self.prioridade,
            "margem_desejada": float(self.margem_desejada) if self.margem_desejada else None,
            "agressividade_preco": self.agressividade_preco,
            "justificativa": self.justificativa,
            "data_decisao": self.data_decisao.isoformat() if self.data_decisao else None,
            "decidido_por": self.decidido_por,
            "perfil_competitivo": self.perfil_competitivo,
            "margem_minima": float(self.margem_minima) if self.margem_minima else None,
            "margem_maxima": float(self.margem_maxima) if self.margem_maxima else None,
            "desconto_maximo": float(self.desconto_maximo) if self.desconto_maximo else None,
            "priorizar_volume": self.priorizar_volume,
            "notas_estrategia": self.notas_estrategia,
            "cenarios_simulados": self.cenarios_simulados,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# ==================== PRECIFICAÇÃO — FASE 1 ====================

class Lote(Base):
    """Lotes do edital agrupando itens por especialidade (UC-P01)"""
    __tablename__ = 'lotes'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    edital_id = Column(String(36), ForeignKey('editais.id', ondelete='CASCADE'), nullable=False)
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    empresa_id = Column(String(36), ForeignKey('empresas.id', ondelete='CASCADE'), nullable=True)
    numero_lote = Column(Integer, nullable=False)
    nome = Column(String(255), nullable=True)            # "Lote 01 - Hematologia"
    especialidade = Column(String(255), nullable=True)   # Hematologia, Bioquímica, etc
    volume_exigido = Column(DECIMAL(15, 2), nullable=True)  # Volume total exigido no edital
    valor_estimado = Column(DECIMAL(15, 2), nullable=True)
    status = Column(Enum('rascunho', 'configurado', 'selecionado', 'precificado', 'finalizado'), default='rascunho')
    observacoes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    edital = relationship("Edital", back_populates="lotes")
    user = relationship("User", back_populates="lotes")
    itens = relationship("LoteItem", back_populates="lote", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "edital_id": self.edital_id,
            "user_id": self.user_id,
            "numero_lote": self.numero_lote,
            "nome": self.nome,
            "especialidade": self.especialidade,
            "volume_exigido": float(self.volume_exigido) if self.volume_exigido else None,
            "valor_estimado": float(self.valor_estimado) if self.valor_estimado else None,
            "status": self.status,
            "observacoes": self.observacoes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class LoteItem(Base):
    """Associação M:N entre Lote e EditalItem (UC-P01)"""
    __tablename__ = 'lote_itens'
    __table_args__ = (UniqueConstraint('lote_id', 'edital_item_id', name='uq_lote_item'),)

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    lote_id = Column(String(36), ForeignKey('lotes.id', ondelete='CASCADE'), nullable=False)
    edital_item_id = Column(String(36), ForeignKey('editais_itens.id', ondelete='CASCADE'), nullable=False)
    ordem = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.now)

    lote = relationship("Lote", back_populates="itens")
    edital_item = relationship("EditalItem", back_populates="lote_itens")

    def to_dict(self):
        return {
            "id": self.id,
            "lote_id": self.lote_id,
            "edital_item_id": self.edital_item_id,
            "ordem": self.ordem,
        }


class EditalItemProduto(Base):
    """Vínculo item do edital ↔ produto do portfolio + volumetria (UC-P02, UC-P03)"""
    __tablename__ = 'edital_item_produto'
    __table_args__ = (UniqueConstraint('edital_item_id', 'produto_id', name='uq_item_produto'),)

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    edital_item_id = Column(String(36), ForeignKey('editais_itens.id', ondelete='CASCADE'), nullable=False)
    produto_id = Column(String(36), ForeignKey('produtos.id', ondelete='CASCADE'), nullable=False)
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    empresa_id = Column(String(36), ForeignKey('empresas.id', ondelete='CASCADE'), nullable=True)
    # UC-P02: Match/seleção
    match_score = Column(DECIMAL(5, 2), nullable=True)   # 0-100% match IA
    match_detalhes = Column(JSON, nullable=True)          # {campo: status, ...}
    confirmado = Column(Boolean, default=False)           # Confirmado pelo analista
    # UC-P03: Volumetria
    volume_edital = Column(DECIMAL(15, 2), nullable=True)
    rendimento_produto = Column(DECIMAL(15, 4), nullable=True)  # testes/kit, unidades/caixa
    repeticoes_amostras = Column(Integer, default=0)
    repeticoes_calibradores = Column(Integer, default=0)
    repeticoes_controles = Column(Integer, default=0)
    volume_real_ajustado = Column(DECIMAL(15, 2), nullable=True)
    quantidade_kits = Column(Integer, nullable=True)      # ceil(ajustado/rendimento)
    formula_calculo = Column(String(500), nullable=True)  # Fórmula legível
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    edital_item = relationship("EditalItem", back_populates="produto_vinculado")
    produto = relationship("Produto", back_populates="vinculos_editais")
    user = relationship("User", back_populates="vinculos_item_produto")

    def to_dict(self):
        return {
            "id": self.id,
            "edital_item_id": self.edital_item_id,
            "produto_id": self.produto_id,
            "user_id": self.user_id,
            "match_score": float(self.match_score) if self.match_score else None,
            "match_detalhes": self.match_detalhes,
            "confirmado": self.confirmado,
            "volume_edital": float(self.volume_edital) if self.volume_edital else None,
            "rendimento_produto": float(self.rendimento_produto) if self.rendimento_produto else None,
            "repeticoes_amostras": self.repeticoes_amostras,
            "repeticoes_calibradores": self.repeticoes_calibradores,
            "repeticoes_controles": self.repeticoes_controles,
            "volume_real_ajustado": float(self.volume_real_ajustado) if self.volume_real_ajustado else None,
            "quantidade_kits": self.quantidade_kits,
            "formula_calculo": self.formula_calculo,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class PrecoCamada(Base):
    """Camadas de preço A-F por item (UC-P04 a UC-P07, UC-P09)"""
    __tablename__ = 'preco_camadas'
    __table_args__ = (UniqueConstraint('edital_item_produto_id', name='uq_preco_camada_vinculo'),)

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    edital_item_produto_id = Column(String(36), ForeignKey('edital_item_produto.id', ondelete='CASCADE'), nullable=False)
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    empresa_id = Column(String(36), ForeignKey('empresas.id', ondelete='CASCADE'), nullable=True)
    # Camada A — Base de Custos (UC-P04)
    custo_unitario = Column(DECIMAL(15, 4), nullable=True)    # Custo unitário do ERP/manual
    custo_fonte = Column(Enum('erp', 'manual', 'media_mercado'), nullable=True)
    ncm = Column(String(20), nullable=True)
    icms = Column(DECIMAL(5, 2), default=0.0)
    ipi = Column(DECIMAL(5, 2), default=0.0)
    pis_cofins = Column(DECIMAL(5, 2), default=0.0)
    isencao_icms = Column(Boolean, default=False)
    custo_base_final = Column(DECIMAL(15, 4), nullable=True)  # Custo com impostos
    # Camada B — Preço Base (UC-P05)
    modo_preco_base = Column(Enum('manual', 'markup', 'upload'), nullable=True)
    markup_percentual = Column(DECIMAL(5, 2), nullable=True)
    preco_base = Column(DECIMAL(15, 4), nullable=True)
    reutilizar_preco_base = Column(Boolean, default=False)
    # Camada C — Valor de Referência (UC-P06)
    valor_referencia_edital = Column(DECIMAL(15, 4), nullable=True)  # Importado do edital
    valor_referencia_disponivel = Column(Boolean, default=False)
    percentual_sobre_base = Column(DECIMAL(5, 2), nullable=True)     # % sobre preço base
    target_referencia = Column(DECIMAL(15, 4), nullable=True)
    margem_sobre_custo = Column(DECIMAL(5, 2), nullable=True)  # (target - custo) / custo * 100
    # Camada D — Valor Inicial do Lance (UC-P07)
    modo_lance_inicial = Column(Enum('absoluto', 'percentual_referencia'), nullable=True)
    lance_inicial = Column(DECIMAL(15, 4), nullable=True)
    # Camada E — Valor Mínimo do Lance (UC-P07)
    modo_lance_minimo = Column(Enum('absoluto', 'percentual_desconto'), nullable=True)
    desconto_maximo_percentual = Column(DECIMAL(5, 2), nullable=True)
    lance_minimo = Column(DECIMAL(15, 4), nullable=True)
    margem_minima = Column(DECIMAL(5, 2), nullable=True)  # (mínimo - custo) / custo * 100
    # Camada F — Histórico (UC-P09) — referência consultiva
    preco_medio_historico = Column(DECIMAL(15, 4), nullable=True)
    preco_min_historico = Column(DECIMAL(15, 4), nullable=True)
    preco_max_historico = Column(DECIMAL(15, 4), nullable=True)
    qtd_registros_historico = Column(Integer, default=0)
    # Status geral
    status = Column(Enum('rascunho', 'parcial', 'completo', 'aprovado'), default='rascunho')
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    edital_item_produto = relationship("EditalItemProduto", backref="preco_camada")
    user = relationship("User", back_populates="preco_camadas")

    def to_dict(self):
        def _f(v):
            return float(v) if v is not None else None
        return {
            "id": self.id,
            "edital_item_produto_id": self.edital_item_produto_id,
            "user_id": self.user_id,
            # Camada A
            "custo_unitario": _f(self.custo_unitario),
            "custo_fonte": self.custo_fonte,
            "ncm": self.ncm,
            "icms": _f(self.icms),
            "ipi": _f(self.ipi),
            "pis_cofins": _f(self.pis_cofins),
            "isencao_icms": self.isencao_icms,
            "custo_base_final": _f(self.custo_base_final),
            # Camada B
            "modo_preco_base": self.modo_preco_base,
            "markup_percentual": _f(self.markup_percentual),
            "preco_base": _f(self.preco_base),
            "reutilizar_preco_base": self.reutilizar_preco_base,
            # Camada C
            "valor_referencia_edital": _f(self.valor_referencia_edital),
            "valor_referencia_disponivel": self.valor_referencia_disponivel,
            "percentual_sobre_base": _f(self.percentual_sobre_base),
            "target_referencia": _f(self.target_referencia),
            "margem_sobre_custo": _f(self.margem_sobre_custo),
            # Camada D
            "modo_lance_inicial": self.modo_lance_inicial,
            "lance_inicial": _f(self.lance_inicial),
            # Camada E
            "modo_lance_minimo": self.modo_lance_minimo,
            "desconto_maximo_percentual": _f(self.desconto_maximo_percentual),
            "lance_minimo": _f(self.lance_minimo),
            "margem_minima": _f(self.margem_minima),
            # Camada F
            "preco_medio_historico": _f(self.preco_medio_historico),
            "preco_min_historico": _f(self.preco_min_historico),
            "preco_max_historico": _f(self.preco_max_historico),
            "qtd_registros_historico": self.qtd_registros_historico,
            # Status
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Lance(Base):
    """Registro de lances em disputa/simulação (UC-P07, UC-P08)"""
    __tablename__ = 'lances'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    edital_item_produto_id = Column(String(36), ForeignKey('edital_item_produto.id', ondelete='CASCADE'), nullable=False)
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    empresa_id = Column(String(36), ForeignKey('empresas.id', ondelete='CASCADE'), nullable=True)
    rodada = Column(Integer, default=1)
    valor_lance = Column(DECIMAL(15, 4), nullable=False)
    tipo = Column(Enum('inicial', 'decremento', 'minimo', 'simulacao'), default='simulacao')
    margem_sobre_custo = Column(DECIMAL(5, 2), nullable=True)
    status = Column(Enum('planejado', 'enviado', 'aceito', 'recusado'), default='planejado')
    observacao = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)

    edital_item_produto = relationship("EditalItemProduto", backref="lances")
    user = relationship("User", back_populates="lances")

    def to_dict(self):
        return {
            "id": self.id,
            "edital_item_produto_id": self.edital_item_produto_id,
            "rodada": self.rodada,
            "valor_lance": float(self.valor_lance) if self.valor_lance else None,
            "tipo": self.tipo,
            "margem_sobre_custo": float(self.margem_sobre_custo) if self.margem_sobre_custo else None,
            "status": self.status,
            "observacao": self.observacao,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Comodato(Base):
    """Gestão de equipamentos em comodato (UC-P10)"""
    __tablename__ = 'comodatos'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    edital_id = Column(String(36), ForeignKey('editais.id', ondelete='CASCADE'), nullable=False)
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    empresa_id = Column(String(36), ForeignKey('empresas.id', ondelete='CASCADE'), nullable=True)
    produto_equipamento_id = Column(String(36), ForeignKey('produtos.id', ondelete='SET NULL'), nullable=True)
    nome_equipamento = Column(String(255), nullable=False)
    valor_equipamento = Column(DECIMAL(15, 2), nullable=True)
    duracao_meses = Column(Integer, nullable=True)
    valor_mensal_amortizacao = Column(DECIMAL(15, 2), nullable=True)
    custo_manutencao_mensal = Column(DECIMAL(15, 2), nullable=True)
    custo_instalacao = Column(DECIMAL(15, 2), nullable=True)
    condicoes_especiais = Column(Text, nullable=True)
    status = Column(Enum('planejado', 'negociando', 'ativo', 'encerrado'), default='planejado')
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    edital = relationship("Edital", back_populates="comodatos")
    user = relationship("User", back_populates="comodatos")
    produto_equipamento = relationship("Produto", foreign_keys=[produto_equipamento_id])

    def to_dict(self):
        return {
            "id": self.id,
            "edital_id": self.edital_id,
            "user_id": self.user_id,
            "produto_equipamento_id": self.produto_equipamento_id,
            "nome_equipamento": self.nome_equipamento,
            "valor_equipamento": float(self.valor_equipamento) if self.valor_equipamento else None,
            "duracao_meses": self.duracao_meses,
            "valor_mensal_amortizacao": float(self.valor_mensal_amortizacao) if self.valor_mensal_amortizacao else None,
            "custo_manutencao_mensal": float(self.custo_manutencao_mensal) if self.custo_manutencao_mensal else None,
            "custo_instalacao": float(self.custo_instalacao) if self.custo_instalacao else None,
            "condicoes_especiais": self.condicoes_especiais,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


# ==================== DATABASE ====================

engine = create_engine(MYSQL_URI, pool_pre_ping=True, pool_recycle=3600)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Cria todas as tabelas e insere dados iniciais."""
    Base.metadata.create_all(bind=engine)

    # Migrations: novos campos
    db_mig = SessionLocal()
    try:
        alter_stmts = [
            # Produto: campos catmat/termos_busca
            "ALTER TABLE produtos ADD COLUMN catmat_codigos JSON NULL",
            "ALTER TABLE produtos ADD COLUMN catser_codigos JSON NULL",
            "ALTER TABLE produtos ADD COLUMN catmat_descricoes JSON NULL",
            "ALTER TABLE produtos ADD COLUMN termos_busca JSON NULL",
            "ALTER TABLE produtos ADD COLUMN termos_busca_updated_at DATETIME NULL",
            "ALTER TABLE produtos ADD COLUMN catmat_updated_at DATETIME NULL",
            # ParametroScore: limiares por dimensão
            "ALTER TABLE parametros_score ADD COLUMN limiar_tecnico_go DECIMAL(5,2) DEFAULT 60.0",
            "ALTER TABLE parametros_score ADD COLUMN limiar_tecnico_nogo DECIMAL(5,2) DEFAULT 30.0",
            "ALTER TABLE parametros_score ADD COLUMN limiar_juridico_go DECIMAL(5,2) DEFAULT 60.0",
            "ALTER TABLE parametros_score ADD COLUMN limiar_juridico_nogo DECIMAL(5,2) DEFAULT 30.0",
            # PrecoHistorico: vinculação com ata consultada
            "ALTER TABLE precos_historicos ADD COLUMN ata_consultada_id VARCHAR(36) NULL",
        ]
        for stmt in alter_stmts:
            try:
                db_mig.execute(text(stmt))
                db_mig.commit()
            except Exception:
                db_mig.rollback()  # coluna já existe

        # Alinhar defaults antigos dos pesos
        try:
            db_mig.execute(text("""
                UPDATE parametros_score SET
                    peso_tecnico = 0.35, peso_comercial = 0.10,
                    peso_complexidade = 0.15, peso_juridico = 0.20,
                    peso_logistico = 0.05
                WHERE peso_tecnico = 0.25
            """))
            db_mig.commit()
        except Exception:
            db_mig.rollback()

        # Drop campos fantasma (peso_participacao, peso_ganho)
        for col in ["peso_participacao", "peso_ganho"]:
            try:
                db_mig.execute(text(f"ALTER TABLE parametros_score DROP COLUMN {col}"))
                db_mig.commit()
            except Exception:
                db_mig.rollback()

        print("[DB] Migrations executadas (catmat/termos_busca/limiares)")
    except Exception as e:
        print(f"[DB] Erro nas migrations: {e}")
    finally:
        db_mig.close()

    # Inserir fontes de editais iniciais
    db = SessionLocal()
    try:
        # Verificar se já existem fontes
        if db.query(FonteEdital).count() == 0:
            fontes_iniciais = [
                FonteEdital(
                    id='pncp',
                    nome='PNCP',
                    tipo='api',
                    url_base='https://pncp.gov.br/api/consulta/v1',
                    ativo=True,
                    descricao='Portal Nacional de Contratações Públicas - API oficial'
                ),
                FonteEdital(
                    id='comprasnet',
                    nome='ComprasNet',
                    tipo='scraper',
                    url_base='https://www.gov.br/compras',
                    ativo=True,
                    descricao='Portal de Compras do Governo Federal'
                ),
                FonteEdital(
                    id='bec-sp',
                    nome='BEC-SP',
                    tipo='scraper',
                    url_base='https://www.bec.sp.gov.br',
                    ativo=True,
                    descricao='Bolsa Eletrônica de Compras de São Paulo'
                ),
                FonteEdital(
                    id='siconv',
                    nome='SICONV / +Brasil',
                    tipo='scraper',
                    url_base='https://transferegov.sistema.gov.br',
                    ativo=True,
                    descricao='Plataforma +Brasil (antigo SICONV) - Convênios e Contratos de Repasse'
                ),
            ]
            for fonte in fontes_iniciais:
                db.add(fonte)
            db.commit()
            print("[DB] Fontes de editais iniciais inseridas")
    except Exception as e:
        print(f"[DB] Erro ao inserir fontes iniciais: {e}")
        db.rollback()
    finally:
        db.close()

    # Seed: Modalidades de licitação
    db = SessionLocal()
    try:
        if db.query(ModalidadeLicitacao).count() == 0:
            modalidades = [
                ModalidadeLicitacao(nome="Pregão Eletrônico", descricao="Licitação eletrônica para bens e serviços comuns", ordem=1),
                ModalidadeLicitacao(nome="Pregão Presencial", descricao="Licitação presencial para bens e serviços comuns", ordem=2),
                ModalidadeLicitacao(nome="Concorrência", descricao="Para contratos de grande valor", ordem=3),
                ModalidadeLicitacao(nome="Tomada de Preços", descricao="Para contratos de valor intermediário", ordem=4),
                ModalidadeLicitacao(nome="Convite", descricao="Para contratos de menor valor", ordem=5),
                ModalidadeLicitacao(nome="Dispensa", descricao="Dispensa de licitação", ordem=6),
                ModalidadeLicitacao(nome="Inexigibilidade", descricao="Inviabilidade de competição", ordem=7),
            ]
            for m in modalidades:
                db.add(m)
            db.commit()
            print("[DB] Modalidades de licitação inseridas")
    except Exception as e:
        print(f"[DB] Erro ao inserir modalidades: {e}")
        db.rollback()
    finally:
        db.close()

    # Seed: Origens de órgão
    db = SessionLocal()
    try:
        if db.query(OrigemOrgao).count() == 0:
            origens = [
                OrigemOrgao(nome="Municipal", descricao="Prefeituras e órgãos municipais", ordem=1),
                OrigemOrgao(nome="Estadual", descricao="Governos estaduais e órgãos estaduais", ordem=2),
                OrigemOrgao(nome="Federal", descricao="Órgãos federais e ministérios", ordem=3),
                OrigemOrgao(nome="Universidade", descricao="Universidades públicas", ordem=4),
                OrigemOrgao(nome="Hospital", descricao="Hospitais públicos", ordem=5),
                OrigemOrgao(nome="LACEN", descricao="Laboratórios centrais de saúde pública", ordem=6),
                OrigemOrgao(nome="Força Armada", descricao="Exército, Marinha e Aeronáutica", ordem=7),
                OrigemOrgao(nome="Autarquia", descricao="Autarquias e agências reguladoras", ordem=8),
                OrigemOrgao(nome="Centros de Pesquisas", descricao="Institutos e centros de pesquisa", ordem=9),
                OrigemOrgao(nome="Fundações de Pesquisa", descricao="FAPESP, FAPERJ, CNPq, etc", ordem=10),
                OrigemOrgao(nome="Fundações Diversas", descricao="Fundações públicas diversas", ordem=11),
                OrigemOrgao(nome="Campanhas Governamentais", descricao="Programas e campanhas do governo", ordem=12),
            ]
            for o in origens:
                db.add(o)
            db.commit()
            print("[DB] Origens de órgão inseridas")
    except Exception as e:
        print(f"[DB] Erro ao inserir origens: {e}")
        db.rollback()
    finally:
        db.close()

    # Seed: Áreas, Classes e Subclasses de produto
    db = SessionLocal()
    try:
        if db.query(AreaProduto).count() == 0:
            # Área Médica
            area_medica = AreaProduto(nome="Médica", descricao="Equipamentos e insumos médico-hospitalares", ordem=1)
            db.add(area_medica)
            db.flush()
            cls_reagentes = ClasseProdutoV2(nome="Reagentes", area_id=area_medica.id, descricao="Reagentes laboratoriais e diagnósticos", ordem=1)
            cls_equipamentos = ClasseProdutoV2(nome="Equipamentos", area_id=area_medica.id, descricao="Equipamentos médico-hospitalares", ordem=2)
            cls_insumos = ClasseProdutoV2(nome="Insumos Hospitalares", area_id=area_medica.id, descricao="Materiais e insumos hospitalares", ordem=3)
            cls_comodato = ClasseProdutoV2(nome="Comodato", area_id=area_medica.id, descricao="Equipamentos em regime de comodato", ordem=4)
            cls_aluguel = ClasseProdutoV2(nome="Aluguel", area_id=area_medica.id, descricao="Locação de equipamentos", ordem=5)
            db.add_all([cls_reagentes, cls_equipamentos, cls_insumos, cls_comodato, cls_aluguel])
            db.flush()
            # Subclasses para Reagentes
            db.add_all([
                SubclasseProduto(nome="Hematologia", classe_id=cls_reagentes.id, ncms=["3822.00.90"], ordem=1),
                SubclasseProduto(nome="Bioquímica", classe_id=cls_reagentes.id, ncms=["3822.00.90"], ordem=2),
                SubclasseProduto(nome="Imunologia", classe_id=cls_reagentes.id, ncms=["3002.15.90"], ordem=3),
                SubclasseProduto(nome="Microbiologia", classe_id=cls_reagentes.id, ncms=["3821.00.00"], ordem=4),
            ])
            # Subclasses para Equipamentos
            db.add_all([
                SubclasseProduto(nome="Analisadores", classe_id=cls_equipamentos.id, ncms=["9027.80.99"], ordem=1),
                SubclasseProduto(nome="Microscópios", classe_id=cls_equipamentos.id, ncms=["9011.80.90"], ordem=2),
                SubclasseProduto(nome="Centrífugas", classe_id=cls_equipamentos.id, ncms=["8421.19.10"], ordem=3),
            ])

            # Área Tecnologia
            area_tech = AreaProduto(nome="Tecnologia", descricao="Equipamentos e serviços de TI", ordem=2)
            db.add(area_tech)
            db.flush()
            cls_info = ClasseProdutoV2(nome="Informática", area_id=area_tech.id, descricao="Computadores, servidores, software", ordem=1)
            cls_redes = ClasseProdutoV2(nome="Redes", area_id=area_tech.id, descricao="Equipamentos de rede e telecom", ordem=2)
            db.add_all([cls_info, cls_redes])

            # Área Construção Civil
            area_civil = AreaProduto(nome="Construção Civil", descricao="Materiais e serviços de construção", ordem=3)
            db.add(area_civil)
            db.flush()
            cls_mob = ClasseProdutoV2(nome="Mobiliário", area_id=area_civil.id, descricao="Móveis e mobiliário", ordem=1)
            db.add(cls_mob)

            db.commit()
            print("[DB] Áreas, classes e subclasses de produto inseridas")
    except Exception as e:
        print(f"[DB] Erro ao inserir áreas/classes: {e}")
        db.rollback()
    finally:
        db.close()


def get_db():
    """Get a database session. Use as context manager or call close() when done."""
    db = SessionLocal()
    try:
        return db
    except Exception:
        db.close()
        raise
