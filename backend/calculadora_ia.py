"""
Calculadora Trabalhista com IA

Integra a calculadora matemática com o LLM para:
1. Detectar pedidos de cálculo em mensagens do chat
2. Extrair parâmetros da mensagem
3. Identificar dados faltantes e solicitar ao usuário
4. Executar cálculo e gerar explicação jurídica detalhada
"""

import json
import re
from typing import Dict, Any, Optional, Tuple
from calculadora import calcular, SALARIO_MINIMO_2026
from llm import call_deepseek


# Prompt para detectar e extrair dados de cálculo
PROMPT_DETECTAR_CALCULO = """Você é um assistente especializado em EXTRAIR DADOS de pedidos de cálculos trabalhistas.

TAREFA: Analise a mensagem e EXTRAIA todos os valores numéricos e informações fornecidas.

TIPOS DE CÁLCULO E SEUS PARÂMETROS OBRIGATÓRIOS:
1. rescisao_completa: salario (float), data_admissao (YYYY-MM-DD), data_demissao (YYYY-MM-DD), dias_trabalhados_mes (int), saldo_fgts (float), tipo_rescisao (string)
2. saldo_salario: salario (float), dias_trabalhados (int)
3. ferias_proporcionais: salario (float), meses_trabalhados (int)
4. ferias_vencidas: salario (float), periodos_vencidos (int, default 1)
5. decimo_terceiro: salario (float), meses_trabalhados (int)
6. aviso_previo: salario (float), anos_trabalhados (int)
7. multa_fgts: saldo_fgts (float), tipo_rescisao (string)
8. horas_extras: salario (float), quantidade_horas (float), percentual_adicional (float, default 50)
9. adicional_noturno: salario (float), horas_noturnas (float)
10. insalubridade: grau (minimo/medio/maximo)
11. periculosidade: salario (float)

VALORES DE tipo_rescisao: "sem_justa_causa", "pedido_demissao", "justa_causa", "acordo"

REGRAS DE EXTRAÇÃO:
- "demitido sem justa causa" ou "fui mandado embora" = tipo_rescisao: "sem_justa_causa"
- "pedi demissão" = tipo_rescisao: "pedido_demissao"
- Datas como "15/03/2020" devem virar "2020-03-15"
- Valores monetários como "R$ 5.000,00" devem virar 5000.0
- "20 dias no último mês" = dias_trabalhados_mes: 20
- "18.000 de FGTS" = saldo_fgts: 18000.0

EXEMPLO:
Mensagem: "Fui demitido sem justa causa. Salário R$ 5.000, entrei 15/03/2020, saí 20/01/2026. Trabalhei 20 dias no mês e tenho R$ 18.000 de FGTS."
Resposta:
{
    "e_pedido_calculo": true,
    "tipo_calculo": "rescisao_completa",
    "dados_extraidos": {
        "salario": 5000.0,
        "data_admissao": "2020-03-15",
        "data_demissao": "2026-01-20",
        "dias_trabalhados_mes": 20,
        "saldo_fgts": 18000.0,
        "tipo_rescisao": "sem_justa_causa"
    },
    "dados_faltantes": [],
    "mensagem_solicitacao": null
}

IMPORTANTE:
- EXTRAIA todos os dados que estão na mensagem. NÃO peça dados que já foram fornecidos.
- Se todos os dados necessários foram fornecidos, dados_faltantes deve ser uma lista VAZIA [].
- Responda APENAS com o JSON, sem texto adicional.

MENSAGEM DO USUÁRIO:
"""

PROMPT_EXPLICAR_CALCULO = """Você é um advogado trabalhista explicando um cálculo para seu cliente.

Com base no cálculo realizado, forneça uma explicação clara e didática que inclua:

1. **Resultado**: O valor calculado em destaque
2. **Memória de Cálculo**: Passo a passo de como chegou ao valor
3. **Base Legal**: Artigos da CLT, leis e súmulas aplicáveis
4. **Observações**: Informações importantes que o cliente deve saber

Use linguagem acessível, mas mantenha a precisão jurídica.
Formate a resposta em markdown para boa visualização.

DADOS DO CÁLCULO:
Tipo: {tipo}
Parâmetros: {parametros}
Resultado: {resultado}

Gere a explicação completa:
"""


def detectar_pedido_calculo(mensagem: str) -> Dict[str, Any]:
    """
    Usa o LLM para detectar se a mensagem é um pedido de cálculo
    e extrair os parâmetros fornecidos.
    """
    prompt = PROMPT_DETECTAR_CALCULO + mensagem

    try:
        resposta = call_deepseek([{"role": "user", "content": prompt}], max_tokens=1000)

        # Extrair JSON da resposta
        # Tenta encontrar JSON na resposta
        json_match = re.search(r'\{[\s\S]*\}', resposta)
        if json_match:
            resultado = json.loads(json_match.group())
            return resultado
        else:
            return {"e_pedido_calculo": False, "erro": "Não foi possível parsear resposta"}
    except json.JSONDecodeError:
        return {"e_pedido_calculo": False, "erro": "JSON inválido na resposta"}
    except Exception as e:
        return {"e_pedido_calculo": False, "erro": str(e)}


def gerar_explicacao_calculo(tipo: str, parametros: Dict, resultado: Dict) -> str:
    """
    Usa o LLM para gerar uma explicação detalhada do cálculo.
    """
    prompt = PROMPT_EXPLICAR_CALCULO.format(
        tipo=tipo,
        parametros=json.dumps(parametros, ensure_ascii=False, indent=2),
        resultado=json.dumps(resultado, ensure_ascii=False, indent=2)
    )

    try:
        explicacao = call_deepseek([{"role": "user", "content": prompt}], max_tokens=16000)
        return explicacao
    except Exception as e:
        # Fallback: retorna resultado formatado sem IA
        return formatar_resultado_simples(tipo, resultado)


def formatar_resultado_simples(tipo: str, resultado: Dict) -> str:
    """Formata resultado sem usar IA (fallback)."""
    if "erro" in resultado:
        return f"**Erro no cálculo:** {resultado['erro']}"

    texto = f"## Resultado do Cálculo\n\n"

    if resultado.get("total") is not None:
        # Rescisão completa
        texto += f"### Total a Receber: R$ {resultado['total']:,.2f}\n\n"
        texto += "**Verbas:**\n"
        for verba, dados in resultado.get("verbas", {}).items():
            nome = verba.replace("_", " ").title()
            texto += f"- {nome}: R$ {dados['valor']:,.2f}\n"
    else:
        # Cálculo simples
        texto += f"**Valor:** R$ {resultado.get('valor', 0):,.2f}\n\n"

    if resultado.get("formula"):
        texto += f"\n**Fórmula:** {resultado['formula']}\n"

    if resultado.get("base_legal"):
        texto += f"\n**Base Legal:** {resultado['base_legal']}\n"

    if resultado.get("memoria", {}).get("calculo"):
        texto += f"\n**Cálculo:** {resultado['memoria']['calculo']}\n"

    return texto


def processar_calculo_chat(mensagem: str, historico: list = None) -> Tuple[bool, str, Optional[Dict]]:
    """
    Processa uma mensagem do chat verificando se é pedido de cálculo.

    Retorna:
    - (True, resposta, resultado) se processou um cálculo
    - (False, None, None) se não é pedido de cálculo
    """
    # Detectar se é pedido de cálculo
    deteccao = detectar_pedido_calculo(mensagem)

    if not deteccao.get("e_pedido_calculo"):
        return False, None, None

    tipo = deteccao.get("tipo_calculo")
    dados = deteccao.get("dados_extraidos", {})
    faltantes = deteccao.get("dados_faltantes", [])

    # Se faltam dados, solicitar ao usuário
    if faltantes:
        msg_solicitacao = deteccao.get("mensagem_solicitacao")
        if not msg_solicitacao:
            campos_formatados = ", ".join(faltantes)
            msg_solicitacao = f"Para calcular o **{tipo.replace('_', ' ')}**, preciso das seguintes informações:\n\n"
            for campo in faltantes:
                msg_solicitacao += f"- **{campo.replace('_', ' ').title()}**\n"
            msg_solicitacao += "\nPor favor, forneça esses dados."

        return True, msg_solicitacao, {"status": "aguardando_dados", "tipo": tipo, "dados_parciais": dados}

    # Executar cálculo
    try:
        resultado = calcular(tipo, **dados)

        if "erro" in resultado:
            return True, f"**Erro no cálculo:** {resultado['erro']}", None

        # Gerar explicação com IA
        explicacao = gerar_explicacao_calculo(tipo, dados, resultado)

        return True, explicacao, resultado

    except Exception as e:
        return True, f"**Erro ao processar cálculo:** {str(e)}", None


def calcular_com_explicacao(tipo: str, parametros: Dict) -> Dict[str, Any]:
    """
    Executa cálculo e retorna resultado com explicação da IA.
    Usado pelo endpoint /api/calcular-ia e pelo toggle na calculadora.
    """
    # Executar cálculo matemático
    resultado = calcular(tipo, **parametros)

    if "erro" in resultado:
        return {
            "sucesso": False,
            "erro": resultado["erro"],
            "explicacao": None
        }

    # Gerar explicação com IA
    explicacao = gerar_explicacao_calculo(tipo, parametros, resultado)

    return {
        "sucesso": True,
        "resultado": resultado,
        "explicacao": explicacao
    }
