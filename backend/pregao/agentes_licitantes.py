"""5 Agentes Licitantes IA com personalidades distintas.

Cada agente decide:
- Proposta inicial (P_PROPOSTAS)
- Lance em rodada aberta (P_LANCES_ABERTOS)
- Lance fechado final (P_LANCES_FECHADOS)
- Aceita/rejeita negociacao (P_NEGOCIACAO)

Usa DeepSeek (deepseek-chat) via backend/llm.py. Cada decisao e tomada com
prompt customizado por personalidade + estado da rodada.
"""
from __future__ import annotations
import json
import random
import sys
from pathlib import Path
from typing import List, Dict, Any, Optional

# Adicionar backend ao path
_BACKEND = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_BACKEND))

from llm import call_deepseek

PERSONALIDADES = {
    "agressivo": {
        "nome": "Agressivo",
        "descricao": "Vai pra cima. Decrementa rapido e fundo. Aceita margens minimas pra ganhar.",
        "decremento_pct_min": 3.0, "decremento_pct_max": 8.0,
        "margem_minima_pct": 5.0,  # nao desce abaixo de custo + 5%
    },
    "conservador": {
        "nome": "Conservador",
        "descricao": "Defende margem. Decrementa pouco. Sai cedo se preco cair muito.",
        "decremento_pct_min": 0.5, "decremento_pct_max": 2.0,
        "margem_minima_pct": 18.0,
    },
    "erratico": {
        "nome": "Erratico",
        "descricao": "Imprevisivel. Pode decrementar muito ou pouco. Pode pular rodadas.",
        "decremento_pct_min": 0.0, "decremento_pct_max": 12.0,
        "margem_minima_pct": 8.0,
    },
    "calculista": {
        "nome": "Calculista",
        "descricao": "Analisa historico. Decrementa exatamente o suficiente pra liderar.",
        "decremento_pct_min": 1.0, "decremento_pct_max": 4.0,
        "margem_minima_pct": 12.0,
    },
    "reativo": {
        "nome": "Reativo",
        "descricao": "So responde se for ultrapassado. Mantem-se quieto na lideranca.",
        "decremento_pct_min": 0.5, "decremento_pct_max": 3.0,
        "margem_minima_pct": 10.0,
    },
}


def gerar_cnpj_ficticio() -> str:
    """Gera CNPJ ficticio formato 12.345.678/0001-90."""
    nums = [random.randint(0, 9) for _ in range(8)]
    return f"{nums[0]}{nums[1]}.{nums[2]}{nums[3]}{nums[4]}.{nums[5]}{nums[6]}{nums[7]}/0001-{random.randint(10,99)}"


def gerar_nome_ficticio(personalidade: str) -> str:
    bases = {
        "agressivo": ["Acelera", "Conquista", "Tigris", "Vanguarda", "Maxim"],
        "conservador": ["Solidus", "Tradicao", "Patrimonio", "Estavel", "Classica"],
        "erratico": ["Caos", "Imprevisivel", "Volatil", "Random", "Saltus"],
        "calculista": ["Logos", "Algoritmo", "Matrix", "Calculo", "Precisao"],
        "reativo": ["Resposta", "Defensiva", "Counter", "Reflex", "Sentinela"],
    }
    sufixos = ["Comercio Ltda", "Suprimentos SA", "Distribuidora", "Industria e Comercio", "Servicos Tecnicos"]
    nome = random.choice(bases.get(personalidade, ["Generico"]))
    suf = random.choice(sufixos)
    return f"{nome} {suf}"


class AgenteLicitante:
    """Agente que decide propostas e lances baseado em personalidade + IA."""

    def __init__(self, personalidade: str, custo_estimado: float, valor_referencia: float,
                 use_llm: bool = True):
        if personalidade not in PERSONALIDADES:
            raise ValueError(f"Personalidade desconhecida: {personalidade}")
        self.personalidade = personalidade
        self.config = PERSONALIDADES[personalidade]
        self.nome = gerar_nome_ficticio(personalidade)
        self.cnpj = gerar_cnpj_ficticio()
        self.custo_estimado = custo_estimado
        self.valor_referencia = valor_referencia
        self.preco_minimo = custo_estimado * (1 + self.config["margem_minima_pct"] / 100)
        self.use_llm = use_llm
        self.historico_lances = []
        self.id = None  # preenchido pelo simulador (UUID)

    def _decidir_via_llm(self, contexto: str, hint: str) -> Optional[float]:
        """Pede pra DeepSeek decidir um valor numerico. Retorna None se falhar."""
        prompt = f"""Voce e um licitante {self.config['nome']} num pregao eletronico Lei 14.133/2021.

PERSONALIDADE: {self.config['descricao']}

DADOS:
- Custo estimado: R$ {self.custo_estimado:.2f}
- Valor de referencia do edital: R$ {self.valor_referencia:.2f}
- Preco minimo aceitavel (sua margem): R$ {self.preco_minimo:.2f}
- Decremento tipico: {self.config['decremento_pct_min']}% a {self.config['decremento_pct_max']}%

CONTEXTO ATUAL: {contexto}

{hint}

Responda APENAS com um numero decimal (ex: 1234.56), sem moeda, sem texto. So o numero."""
        try:
            resp = call_deepseek(
                [{"role": "user", "content": prompt}],
                max_tokens=50, temperature=0.7, model_override="deepseek-chat"
            )
            # Extrai primeiro numero
            import re
            m = re.search(r'(\d+[\.,]?\d*)', resp.replace(',', '.'))
            if m:
                return float(m.group(1))
        except Exception as ex:
            print(f"  [warn] LLM falhou pra {self.nome}: {ex}")
        return None

    def proposta_inicial(self) -> float:
        """Decide proposta inicial (selada). Geralmente um pouco abaixo do referencia."""
        cfg = self.config
        # Heuristica: agressivo abaixo do referencia, conservador igual ou pouco abaixo
        if self.personalidade == "agressivo":
            base = self.valor_referencia * random.uniform(0.85, 0.92)
        elif self.personalidade == "conservador":
            base = self.valor_referencia * random.uniform(0.95, 1.00)
        elif self.personalidade == "erratico":
            base = self.valor_referencia * random.uniform(0.80, 1.05)
        elif self.personalidade == "calculista":
            base = self.valor_referencia * random.uniform(0.92, 0.97)
        elif self.personalidade == "reativo":
            base = self.valor_referencia * random.uniform(0.93, 0.98)
        else:
            base = self.valor_referencia * 0.95

        if self.use_llm:
            llm_val = self._decidir_via_llm(
                f"Submetendo proposta inicial selada. Sem informacao dos concorrentes.",
                f"Sugira um valor entre R$ {self.preco_minimo:.2f} e R$ {self.valor_referencia:.2f}."
            )
            if llm_val and self.preco_minimo <= llm_val <= self.valor_referencia * 1.1:
                base = llm_val

        return max(round(base, 2), self.preco_minimo)

    def decidir_lance(self, ranking: List[Dict[str, Any]], rodada: int,
                      meu_ultimo_valor: float) -> Optional[float]:
        """Decide um novo lance ou retorna None pra passar a rodada.

        ranking: lista [{agente_id, valor}] ordenada asc (menor primeiro = lider).
        rodada: numero da rodada (1+).
        meu_ultimo_valor: meu lance mais recente.

        Retorna float (novo lance) ou None (passou a rodada).
        """
        cfg = self.config
        if not ranking:
            return None

        lider_valor = ranking[0]["valor"]
        sou_lider = ranking[0].get("agente_id") == self.id

        # Reativo: so age se NAO for lider
        if self.personalidade == "reativo" and sou_lider:
            return None

        # Erratico: 30% chance de pular
        if self.personalidade == "erratico" and random.random() < 0.30:
            return None

        # Conservador: para se preco-base ja proximo do minimo
        if self.personalidade == "conservador" and meu_ultimo_valor <= self.preco_minimo * 1.10:
            return None

        # Calcula novo lance: decrementa do lider
        decremento_pct = random.uniform(cfg["decremento_pct_min"], cfg["decremento_pct_max"])
        if sou_lider:
            # Sou lider — decremento pequeno pra defender
            decremento_pct = decremento_pct * 0.3
            base = meu_ultimo_valor
        else:
            base = lider_valor

        novo = base * (1 - decremento_pct / 100)

        # Nao pode ir abaixo do minimo
        if novo < self.preco_minimo:
            return None

        # Tem que decrementar (nao pode ser igual ou maior ao lider)
        if not sou_lider and novo >= lider_valor:
            return None

        return round(novo, 2)

    def aceita_negociacao(self, valor_proposto_pregoeiro: float, meu_valor_atual: float) -> bool:
        """Pregoeiro pede desconto adicional. Aceita se for compativel com personalidade."""
        if valor_proposto_pregoeiro < self.preco_minimo:
            return False
        # Agressivo aceita facil; conservador resiste
        if self.personalidade == "agressivo":
            return True
        if self.personalidade == "conservador":
            return valor_proposto_pregoeiro >= meu_valor_atual * 0.97  # so 3% de desconto
        if self.personalidade == "calculista":
            return valor_proposto_pregoeiro >= self.preco_minimo * 1.05
        # Outros aceitam se acima do minimo
        return True

    def __repr__(self):
        return f"AgenteLicitante({self.personalidade}, {self.nome[:30]}, custo={self.custo_estimado}, min={self.preco_minimo})"


def criar_agentes_padrao(custo_base: float = 100.0,
                         valor_referencia: float = 200.0,
                         use_llm: bool = True) -> List[AgenteLicitante]:
    """Cria 5 agentes (1 de cada personalidade) com custos ligeiramente diferentes."""
    custos = {
        "agressivo": custo_base * 0.90,    # custo menor, pode ir mais fundo
        "conservador": custo_base * 1.10,  # custo maior, defende margem
        "erratico": custo_base * 1.00,
        "calculista": custo_base * 0.95,
        "reativo": custo_base * 1.05,
    }
    return [
        AgenteLicitante(p, custos[p], valor_referencia, use_llm=use_llm)
        for p in PERSONALIDADES.keys()
    ]
