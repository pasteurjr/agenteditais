"""
RN Estados — Maquinas de transicao de estado para entidades principais.

Cobertura:
- RN-034: Produto (status_pipeline): cadastrado -> qualificado -> ofertado -> vencedor/perdedor
- RN-082: Edital (status): novo -> analisando -> participando -> proposta_enviada -> em_pregao -> vencedor/perdedor
- RN-205: Contrato (status): vigente -> encerrado/rescindido/suspenso

Este helper valida a transicao em __backend-side__ sem exigir ALTER TABLE.
Apenas verifica se o caminho (de -> para) esta no mapa VALID_TRANSITIONS.
"""
import os


_ENFORCE = os.environ.get("ENFORCE_RN_VALIDATORS", "false").lower() == "true"


# RN-034: Produto.status_pipeline
# cadastrado -> qualificado -> ofertado -> vencedor/perdedor
# Permitimos voltar para "cadastrado" (reset).
PRODUTO_TRANSITIONS = {
    None: {"cadastrado"},
    "": {"cadastrado"},
    "cadastrado": {"qualificado", "cadastrado"},
    "qualificado": {"ofertado", "cadastrado"},
    "ofertado": {"vencedor", "perdedor", "qualificado"},
    "vencedor": {"ofertado"},
    "perdedor": {"ofertado"},
}


# RN-082: Edital.status (mais complexo porque ja tem muitos estados historicos)
# Usamos um grafo relaxado — bloqueia apenas "pulos" obviamente errados.
EDITAL_TRANSITIONS = {
    None: {"novo", "aberto"},
    "novo": {"analisando", "cancelado", "desistido", "aberto", "temp_score"},
    "analisando": {"participando", "desistido", "cancelado", "novo", "temp_score"},
    "temp_score": {"analisando", "novo", "desistido", "cancelado"},
    "participando": {"proposta_enviada", "desistido", "cancelado"},
    "proposta_enviada": {"em_pregao", "desistido", "cancelado"},
    "em_pregao": {"vencedor", "perdedor", "ganho", "perdido", "cancelado", "suspenso"},
    "suspenso": {"em_pregao", "cancelado"},
    "aberto": {"novo", "analisando", "fechado", "cancelado"},
    "fechado": {"vencedor", "perdedor", "ganho", "perdido", "aberto"},
    # terminais aceitam qualquer transicao para nenhum (fim de ciclo)
    "vencedor": {"ganho"},
    "perdedor": {"perdido"},
    "ganho": set(),
    "perdido": set(),
    "cancelado": set(),
    "desistido": set(),
}


# RN-205: Contrato.status
# vigente -> encerrado/rescindido/suspenso
CONTRATO_TRANSITIONS = {
    None: {"vigente"},
    "vigente": {"encerrado", "rescindido", "suspenso"},
    "suspenso": {"vigente", "encerrado", "rescindido"},
    "encerrado": set(),
    "rescindido": set(),
}


class TransicaoInvalida(Exception):
    """Levantada quando ENFORCE_RN_VALIDATORS=true e transicao e invalida."""
    def __init__(self, rn_code: str, entidade: str, de, para):
        self.rn_code = rn_code
        self.entidade = entidade
        self.de = de
        self.para = para
        super().__init__(
            f"[{rn_code}] Transicao invalida para {entidade}: '{de}' -> '{para}'"
        )


def validar_transicao(entidade: str, campo_estado: str, estado_atual, novo_estado) -> bool:
    """Retorna True se a transicao for valida. Se ENFORCE=true, levanta excecao."""
    if novo_estado is None or novo_estado == "":
        return True  # nao e uma transicao
    if estado_atual == novo_estado:
        return True  # idempotente

    mapas = {
        ("produtos", "status_pipeline"): ("RN-034", PRODUTO_TRANSITIONS),
        ("editais", "status"): ("RN-082", EDITAL_TRANSITIONS),
        ("contratos", "status"): ("RN-205", CONTRATO_TRANSITIONS),
    }
    key = (entidade, campo_estado)
    if key not in mapas:
        return True  # entidade nao monitorada

    rn_code, mapa = mapas[key]
    permitidos = mapa.get(estado_atual, None)
    if permitidos is None:
        msg = f"Estado origem '{estado_atual}' desconhecido para {entidade}.{campo_estado}"
        if _ENFORCE:
            raise TransicaoInvalida(rn_code, entidade, estado_atual, novo_estado)
        print(f"[{rn_code} WARN] {msg}")
        return False
    if novo_estado not in permitidos:
        msg = f"Transicao '{estado_atual}' -> '{novo_estado}' nao permitida para {entidade}.{campo_estado}. Permitidos: {sorted(permitidos) if permitidos else 'nenhum (estado terminal)'}"
        if _ENFORCE:
            raise TransicaoInvalida(rn_code, entidade, estado_atual, novo_estado)
        print(f"[{rn_code} WARN] {msg}")
        return False
    return True


def check_transicao_update(table_slug: str, instance, data: dict):
    """Helper para dispatcher CRUD: valida transicao de status se aplicavel."""
    campos_por_slug = {
        "produtos": "status_pipeline",
        "editais": "status",
        "contratos": "status",
    }
    campo = campos_por_slug.get(table_slug)
    if not campo or campo not in data:
        return
    estado_atual = getattr(instance, campo, None)
    novo = data.get(campo)
    validar_transicao(table_slug, campo, estado_atual, novo)
