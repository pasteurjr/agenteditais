"""
SQLAlchemy ORM models for the Editais IA system.
"""
from sqlalchemy import Column, String, Text, DateTime, Enum, ForeignKey, Integer, JSON, Boolean, DECIMAL, Date, create_engine
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
    google_id = Column(String(255), unique=True, nullable=True)
    name = Column(String(255), nullable=False)
    picture_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    last_login_at = Column(DateTime, nullable=True)

    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    produtos = relationship("Produto", back_populates="user", cascade="all, delete-orphan")
    editais = relationship("Edital", back_populates="user", cascade="all, delete-orphan")

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
    nome = Column(String(255), nullable=False)
    codigo_interno = Column(String(50), nullable=True)
    ncm = Column(String(20), nullable=True)
    categoria = Column(Enum('equipamento', 'reagente', 'insumo_hospitalar', 'insumo_laboratorial', 'informatica', 'redes', 'mobiliario', 'eletronico', 'outro'), nullable=False)
    fabricante = Column(String(255), nullable=True)
    modelo = Column(String(255), nullable=True)
    descricao = Column(Text, nullable=True)
    preco_referencia = Column(DECIMAL(15, 2), nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    user = relationship("User", back_populates="produtos")
    especificacoes = relationship("ProdutoEspecificacao", back_populates="produto", cascade="all, delete-orphan")
    documentos = relationship("ProdutoDocumento", back_populates="produto", cascade="all, delete-orphan")
    analises = relationship("Analise", back_populates="produto", cascade="all, delete-orphan")

    def to_dict(self, include_specs=False):
        result = {
            "id": self.id,
            "nome": self.nome,
            "codigo_interno": self.codigo_interno,
            "ncm": self.ncm,
            "categoria": self.categoria,
            "fabricante": self.fabricante,
            "modelo": self.modelo,
            "descricao": self.descricao,
            "preco_referencia": float(self.preco_referencia) if self.preco_referencia else None,
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
    numero = Column(String(100), nullable=False)
    orgao = Column(String(255), nullable=False)
    orgao_tipo = Column(Enum('federal', 'estadual', 'municipal', 'autarquia', 'fundacao'), default='municipal')
    uf = Column(String(2), nullable=True)
    cidade = Column(String(100), nullable=True)
    objeto = Column(Text, nullable=False)
    modalidade = Column(Enum('pregao_eletronico', 'pregao_presencial', 'concorrencia', 'tomada_precos', 'convite', 'dispensa', 'inexigibilidade'), default='pregao_eletronico')
    categoria = Column(Enum('comodato', 'venda_equipamento', 'aluguel_com_consumo', 'aluguel_sem_consumo', 'consumo_reagentes', 'consumo_insumos', 'servicos', 'informatica', 'redes', 'mobiliario', 'outro'), nullable=True)
    valor_referencia = Column(DECIMAL(15, 2), nullable=True)
    data_publicacao = Column(Date, nullable=True)
    data_abertura = Column(DateTime, nullable=True)
    data_limite_proposta = Column(DateTime, nullable=True)
    data_limite_impugnacao = Column(DateTime, nullable=True)
    status = Column(Enum('novo', 'analisando', 'participando', 'proposta_enviada', 'em_pregao', 'vencedor', 'perdedor', 'cancelado', 'desistido', 'aberto', 'fechado', 'suspenso'), default='novo')
    fonte = Column(String(50), nullable=True)
    url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    user = relationship("User", back_populates="editais")
    requisitos = relationship("EditalRequisito", back_populates="edital", cascade="all, delete-orphan")
    documentos = relationship("EditalDocumento", back_populates="edital", cascade="all, delete-orphan")
    analises = relationship("Analise", back_populates="edital", cascade="all, delete-orphan")

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
            "status": self.status,
            "fonte": self.fonte,
            "url": self.url,
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


# ==================== ANÁLISES E SCORES ====================

class Analise(Base):
    """Análise de aderência produto x edital"""
    __tablename__ = 'analises'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    edital_id = Column(String(36), ForeignKey('editais.id', ondelete='CASCADE'), nullable=False)
    produto_id = Column(String(36), ForeignKey('produtos.id', ondelete='CASCADE'), nullable=False)
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)

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
    requisito_id = Column(String(36), ForeignKey('editais_requisitos.id'), nullable=False)
    especificacao_id = Column(String(36), nullable=True)

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
    analise_id = Column(String(36), ForeignKey('analises.id'), nullable=True)
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)

    texto_tecnico = Column(Text, nullable=True)
    preco_unitario = Column(DECIMAL(15, 2), nullable=True)
    preco_total = Column(DECIMAL(15, 2), nullable=True)
    quantidade = Column(Integer, default=1)

    status = Column(Enum('rascunho', 'revisao', 'aprovada', 'enviada'), default='rascunho')
    arquivo_path = Column(String(500), nullable=True)

    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    def to_dict(self):
        return {
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
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


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

    concorrente = relationship("Concorrente", back_populates="precos_historicos")

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


# ==================== DOCUMENTOS GERADOS ====================

class Documento(Base):
    __tablename__ = 'documentos'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    session_id = Column(String(36), ForeignKey('sessions.id', ondelete='SET NULL'), nullable=True)
    tipo = Column(String(50), nullable=False)
    titulo = Column(String(255), nullable=False)
    conteudo_md = Column(Text, nullable=False)
    dados_json = Column(JSON, nullable=True)
    versao = Column(Integer, default=1)
    documento_pai_id = Column(String(36), nullable=True)
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)

    user = relationship("User", backref="documentos_gerados")
    session = relationship("Session", backref="documentos")

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


# ==================== DATABASE ====================

engine = create_engine(MYSQL_URI, pool_pre_ping=True, pool_recycle=3600)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    """Cria todas as tabelas e insere dados iniciais."""
    Base.metadata.create_all(bind=engine)

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


def get_db():
    """Get a database session. Use as context manager or call close() when done."""
    db = SessionLocal()
    try:
        return db
    except Exception:
        db.close()
        raise
