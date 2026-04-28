"""
Modelos SQLAlchemy do banco testesvalidacoes.

Espelha o DDL em ddl.sql. PK CHAR(36) UUID, timestamps datetime.now,
soft delete via 'ativo'. ENUMs alinhados com tipos do MySQL.
"""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Optional, List

from sqlalchemy import (
    Column, String, Text, Integer, DateTime, Boolean, ForeignKey, JSON, Enum,
    UniqueConstraint, Index, BigInteger,
)
from sqlalchemy.dialects.mysql import LONGTEXT, TINYINT
from sqlalchemy.orm import relationship

from .engine import Base


def _uuid() -> str:
    return str(uuid.uuid4())


# ============================================================
# 1. User (tester)
# ============================================================
class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=_uuid)
    email = Column(String(255), nullable=False, unique=True)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    administrador = Column(TINYINT(1), nullable=False, default=0)
    ativo = Column(TINYINT(1), nullable=False, default=1)
    criado_em = Column(DateTime, nullable=False, default=datetime.now)

    # Relationships
    testes = relationship("Teste", back_populates="user")
    observacoes = relationship("Observacao", back_populates="user")

    __table_args__ = (
        Index("ix_users_admin", "administrador", "ativo"),
    )


# ============================================================
# 2. Projeto
# ============================================================
class Projeto(Base):
    __tablename__ = "projetos"

    id = Column(String(36), primary_key=True, default=_uuid)
    nome = Column(String(255), nullable=False, unique=True)
    descricao = Column(Text, nullable=True)
    ativo = Column(TINYINT(1), nullable=False, default=1)
    criado_em = Column(DateTime, nullable=False, default=datetime.now)

    sprints = relationship("Sprint", back_populates="projeto", cascade="all, delete-orphan")


# ============================================================
# 3. Sprint
# ============================================================
class Sprint(Base):
    __tablename__ = "sprints"

    id = Column(String(36), primary_key=True, default=_uuid)
    projeto_id = Column(String(36), ForeignKey("projetos.id", ondelete="CASCADE"), nullable=False)
    numero = Column(Integer, nullable=False)
    nome = Column(String(255), nullable=False)
    descricao = Column(Text, nullable=True)
    ativo = Column(TINYINT(1), nullable=False, default=1)
    criado_em = Column(DateTime, nullable=False, default=datetime.now)

    projeto = relationship("Projeto", back_populates="sprints")
    casos_de_uso = relationship("CasoDeUso", back_populates="sprint", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("projeto_id", "numero", name="uq_sprints_projeto_numero"),
    )


# ============================================================
# 4. CasoDeUso
# ============================================================
class CasoDeUso(Base):
    __tablename__ = "casos_de_uso"

    id = Column(String(36), primary_key=True, default=_uuid)
    sprint_id = Column(String(36), ForeignKey("sprints.id", ondelete="CASCADE"), nullable=False)
    uc_id = Column(String(20), nullable=False)
    nome = Column(String(255), nullable=False)
    doc_origem = Column(String(500), nullable=True)
    conteudo_md = Column(LONGTEXT, nullable=True)
    ativo = Column(TINYINT(1), nullable=False, default=1)
    criado_em = Column(DateTime, nullable=False, default=datetime.now)

    sprint = relationship("Sprint", back_populates="casos_de_uso")
    casos_de_teste = relationship("CasoDeTeste", back_populates="caso_de_uso", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("sprint_id", "uc_id", name="uq_uc_sprint"),
        Index("ix_uc_id", "uc_id"),
    )


# ============================================================
# 5. CasoDeTeste
# ============================================================
class CasoDeTeste(Base):
    __tablename__ = "casos_de_teste"

    id = Column(String(36), primary_key=True, default=_uuid)
    caso_de_uso_id = Column(String(36), ForeignKey("casos_de_uso.id", ondelete="CASCADE"), nullable=False)
    ct_id = Column(String(60), nullable=False)
    descricao = Column(String(500), nullable=False)
    pre_condicoes = Column(Text, nullable=True)
    acoes = Column(Text, nullable=True)
    saida_esperada = Column(Text, nullable=True)
    tipo = Column(Enum("Positivo", "Negativo", "Limite"), nullable=False, default="Positivo")
    categoria = Column(Enum("Cenário", "Classe", "Fronteira", "Combinado"), nullable=False)
    trilha_sugerida = Column(Enum("visual", "e2e", "humana"), nullable=False, default="visual")
    rns_aplicadas = Column(String(500), nullable=True)
    fonte_doc = Column(String(500), nullable=True)
    variacao_tutorial = Column(String(50), nullable=True)
    ativo = Column(TINYINT(1), nullable=False, default=1)
    criado_em = Column(DateTime, nullable=False, default=datetime.now)

    caso_de_uso = relationship("CasoDeUso", back_populates="casos_de_teste")

    __table_args__ = (
        UniqueConstraint("caso_de_uso_id", "ct_id", name="uq_ct_uc"),
        Index("ix_ct_id", "ct_id"),
        Index("ix_categoria_trilha", "categoria", "trilha_sugerida"),
    )


# ============================================================
# 6. Teste
# ============================================================
class Teste(Base):
    __tablename__ = "testes"

    id = Column(String(36), primary_key=True, default=_uuid)
    projeto_id = Column(String(36), ForeignKey("projetos.id"), nullable=False)
    sprint_id = Column(String(36), ForeignKey("sprints.id"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    titulo = Column(String(255), nullable=False)
    descricao = Column(Text, nullable=True)
    ciclo_id = Column(String(120), nullable=True)
    estado = Column(
        Enum("criado", "em_andamento", "pausado", "concluido", "cancelado"),
        nullable=False, default="criado"
    )
    pid_executor = Column(Integer, nullable=True)
    porta_painel = Column(Integer, nullable=True)
    pediu_continuar = Column(TINYINT(1), nullable=False, default=0)
    iniciado_em = Column(DateTime, nullable=True)
    atualizado_em = Column(DateTime, nullable=False, default=datetime.now, onupdate=datetime.now)
    concluido_em = Column(DateTime, nullable=True)
    ativo = Column(TINYINT(1), nullable=False, default=1)
    criado_em = Column(DateTime, nullable=False, default=datetime.now)

    user = relationship("User", back_populates="testes")
    projeto = relationship("Projeto")
    sprint = relationship("Sprint")
    conjuntos = relationship("ConjuntoDeTeste", back_populates="teste", cascade="all, delete-orphan")
    execucoes = relationship("ExecucaoCasoDeTeste", back_populates="teste", cascade="all, delete-orphan")
    relatorios = relationship("Relatorio", back_populates="teste", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_testes_user_estado", "user_id", "estado"),
        Index("ix_testes_sprint", "sprint_id"),
    )


# ============================================================
# 7. ConjuntoDeTeste
# ============================================================
class ConjuntoDeTeste(Base):
    __tablename__ = "conjuntos_de_teste"

    id = Column(String(36), primary_key=True, default=_uuid)
    teste_id = Column(String(36), ForeignKey("testes.id", ondelete="CASCADE"), nullable=False)
    nome = Column(String(255), nullable=False)
    descricao = Column(Text, nullable=True)
    criado_em = Column(DateTime, nullable=False, default=datetime.now)

    teste = relationship("Teste", back_populates="conjuntos")
    items = relationship("ConjuntoCasosDeTeste", back_populates="conjunto", cascade="all, delete-orphan")


# ============================================================
# 8. ConjuntoCasosDeTeste
# ============================================================
class ConjuntoCasosDeTeste(Base):
    __tablename__ = "conjunto_casos_de_teste"

    id = Column(String(36), primary_key=True, default=_uuid)
    conjunto_id = Column(String(36), ForeignKey("conjuntos_de_teste.id", ondelete="CASCADE"), nullable=False)
    caso_de_teste_id = Column(String(36), ForeignKey("casos_de_teste.id"), nullable=False)
    ordem = Column(Integer, nullable=False)

    conjunto = relationship("ConjuntoDeTeste", back_populates="items")
    caso_de_teste = relationship("CasoDeTeste")

    __table_args__ = (
        UniqueConstraint("conjunto_id", "ordem", name="uq_conjunto_ordem"),
        UniqueConstraint("conjunto_id", "caso_de_teste_id", name="uq_conjunto_ct"),
    )


# ============================================================
# 9. ExecucaoCasoDeTeste
# ============================================================
class ExecucaoCasoDeTeste(Base):
    __tablename__ = "execucoes_caso_de_teste"

    id = Column(String(36), primary_key=True, default=_uuid)
    teste_id = Column(String(36), ForeignKey("testes.id", ondelete="CASCADE"), nullable=False)
    caso_de_teste_id = Column(String(36), ForeignKey("casos_de_teste.id"), nullable=False)
    ordem = Column(Integer, nullable=False)
    estado = Column(
        Enum("pendente", "em_execucao", "aprovado", "reprovado", "pulado", "erro"),
        nullable=False, default="pendente"
    )
    veredito_automatico = Column(
        Enum("PENDENTE", "APROVADO", "REPROVADO", "INCONCLUSIVO"),
        nullable=False, default="PENDENTE"
    )
    veredicto_po = Column(Enum("APROVADO", "REPROVADO"), nullable=True)
    iniciado_em = Column(DateTime, nullable=True)
    concluido_em = Column(DateTime, nullable=True)
    duracao_ms = Column(Integer, nullable=True)
    screenshot_antes_path = Column(String(500), nullable=True)
    screenshot_depois_path = Column(String(500), nullable=True)
    detalhes_validacao_json = Column(JSON, nullable=True)

    teste = relationship("Teste", back_populates="execucoes")
    caso_de_teste = relationship("CasoDeTeste")
    passos = relationship("PassoExecucao", back_populates="execucao", cascade="all, delete-orphan")
    anexos = relationship("Anexo", back_populates="execucao", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("teste_id", "caso_de_teste_id", name="uq_exec_teste_ct"),
        UniqueConstraint("teste_id", "ordem", name="uq_exec_teste_ordem"),
        Index("ix_exec_estado", "estado"),
    )


# ============================================================
# 9b. PassoExecucao (D5)
# ============================================================
class PassoExecucao(Base):
    __tablename__ = "passos_execucao"

    id = Column(String(36), primary_key=True, default=_uuid)
    execucao_id = Column(String(36), ForeignKey("execucoes_caso_de_teste.id", ondelete="CASCADE"), nullable=False)
    ordem = Column(Integer, nullable=False)
    passo_id = Column(String(120), nullable=False)
    passo_titulo = Column(String(255), nullable=True)
    descricao_painel = Column(Text, nullable=True)
    screenshot_antes_path = Column(String(500), nullable=True)
    screenshot_depois_path = Column(String(500), nullable=True)
    screenshot_antes_url = Column(String(500), nullable=True)
    screenshot_depois_url = Column(String(500), nullable=True)
    veredito_automatico = Column(
        Enum("PENDENTE", "APROVADO", "REPROVADO", "INCONCLUSIVO"),
        nullable=False, default="PENDENTE"
    )
    veredicto_po = Column(Enum("APROVADO", "REPROVADO"), nullable=True)
    duracao_ms = Column(Integer, nullable=True)
    detalhes_validacao_json = Column(JSON, nullable=True)
    correcao_necessaria = Column(TINYINT(1), nullable=False, default=0)
    correcao_descricao = Column(Text, nullable=True)
    iniciado_em = Column(DateTime, nullable=True)
    concluido_em = Column(DateTime, nullable=True)

    execucao = relationship("ExecucaoCasoDeTeste", back_populates="passos")
    observacoes = relationship("Observacao", back_populates="passo_execucao", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint("execucao_id", "ordem", name="uq_passo_execucao_ordem"),
        Index("ix_passo_execucao", "execucao_id"),
        Index("ix_passo_id", "passo_id"),
    )


# ============================================================
# 10. Observacao
# ============================================================
class Observacao(Base):
    __tablename__ = "observacoes"

    id = Column(String(36), primary_key=True, default=_uuid)
    passo_execucao_id = Column(String(36), ForeignKey("passos_execucao.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    texto = Column(Text, nullable=False)
    criado_em = Column(DateTime, nullable=False, default=datetime.now)

    passo_execucao = relationship("PassoExecucao", back_populates="observacoes")
    user = relationship("User", back_populates="observacoes")


# ============================================================
# 11. Relatorio
# ============================================================
class Relatorio(Base):
    __tablename__ = "relatorios"

    id = Column(String(36), primary_key=True, default=_uuid)
    teste_id = Column(String(36), ForeignKey("testes.id", ondelete="CASCADE"), nullable=False)
    formato = Column(Enum("md", "pdf", "html"), nullable=False, default="md")
    conteudo_md = Column(LONGTEXT, nullable=True)
    path_arquivo = Column(String(500), nullable=True)
    gerado_em = Column(DateTime, nullable=False, default=datetime.now)

    teste = relationship("Teste", back_populates="relatorios")


# ============================================================
# 12. LogAuditoria
# ============================================================
class LogAuditoria(Base):
    __tablename__ = "log_auditoria"

    id = Column(String(36), primary_key=True, default=_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    acao = Column(String(50), nullable=False)
    recurso = Column(String(50), nullable=False)
    recurso_id = Column(String(36), nullable=True)
    metadata_json = Column(JSON, nullable=True)
    ip_address = Column(String(45), nullable=True)
    criado_em = Column(DateTime, nullable=False, default=datetime.now)

    __table_args__ = (
        Index("ix_audit_user", "user_id", "criado_em"),
        Index("ix_audit_recurso", "recurso", "recurso_id"),
    )


# ============================================================
# 13. Anexo
# ============================================================
class Anexo(Base):
    __tablename__ = "anexos"

    id = Column(String(36), primary_key=True, default=_uuid)
    execucao_id = Column(String(36), ForeignKey("execucoes_caso_de_teste.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    nome = Column(String(255), nullable=False)
    mime_type = Column(String(100), nullable=True)
    tamanho_bytes = Column(BigInteger, nullable=True)
    path_arquivo = Column(String(500), nullable=False)
    criado_em = Column(DateTime, nullable=False, default=datetime.now)

    execucao = relationship("ExecucaoCasoDeTeste", back_populates="anexos")


# ============================================================
# 14. Tag + TesteTag
# ============================================================
class Tag(Base):
    __tablename__ = "tags"

    id = Column(String(36), primary_key=True, default=_uuid)
    nome = Column(String(50), nullable=False, unique=True)
    cor = Column(String(7), nullable=True)


class TesteTag(Base):
    __tablename__ = "testes_tags"

    teste_id = Column(String(36), ForeignKey("testes.id", ondelete="CASCADE"), primary_key=True)
    tag_id = Column(String(36), ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True)


__all__ = [
    "User", "Projeto", "Sprint", "CasoDeUso", "CasoDeTeste",
    "Teste", "ConjuntoDeTeste", "ConjuntoCasosDeTeste",
    "ExecucaoCasoDeTeste", "PassoExecucao", "Observacao",
    "Relatorio", "LogAuditoria", "Anexo", "Tag", "TesteTag",
]
