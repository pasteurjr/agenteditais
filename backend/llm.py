import requests
from config import DEEPSEEK_API_KEY, DEEPSEEK_MODEL, DEEPSEEK_BASE_URL, TEMPERATURE, MAX_TOKENS


def _prepare_messages_for_reasoner(messages):
    """
    Prepara mensagens para o deepseek-reasoner que tem restrições:
    1. Não pode ter reasoning_content nas mensagens
    2. Não pode ter mensagens sucessivas do mesmo role
    3. Última mensagem deve ser do usuário
    """
    cleaned = []
    for msg in messages:
        # Remover reasoning_content se existir
        clean_msg = {
            "role": msg["role"],
            "content": msg["content"]
        }

        # Evitar mensagens sucessivas do mesmo role
        if cleaned and cleaned[-1]["role"] == clean_msg["role"]:
            # Concatenar com a mensagem anterior
            cleaned[-1]["content"] += "\n\n" + clean_msg["content"]
        else:
            cleaned.append(clean_msg)

    # Garantir que a última mensagem seja do usuário
    if cleaned and cleaned[-1]["role"] != "user":
        cleaned.append({"role": "user", "content": "Por favor, continue."})

    return cleaned


def call_deepseek(messages, max_tokens=None, temperature=None, model_override=None):
    """
    Chama a API do DeepSeek.

    Args:
        messages: Lista de mensagens no formato OpenAI
        max_tokens: Limite de tokens na resposta
        temperature: Temperatura (criatividade) - não suportado pelo reasoner
        model_override: Força uso de modelo específico (útil para usar deepseek-chat em vez de reasoner)
    """
    url = f"{DEEPSEEK_BASE_URL}/v1/chat/completions"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {DEEPSEEK_API_KEY}"
    }

    model = model_override or DEEPSEEK_MODEL

    # deepseek-reasoner tem restrições específicas
    if model == "deepseek-reasoner":
        # Preparar mensagens (remover reasoning_content, garantir alternância)
        clean_messages = _prepare_messages_for_reasoner(messages)

        payload = {
            "model": model,
            "messages": clean_messages,
            # Habilitar thinking mode para permitir até 64K de output
            "thinking": {"type": "enabled"},
        }
        # Com thinking mode habilitado, max_tokens pode ir até 64K
        if max_tokens:
            payload["max_tokens"] = min(max_tokens, 65536)
    else:
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature if temperature is not None else TEMPERATURE,
            "max_tokens": max_tokens if max_tokens is not None else min(MAX_TOKENS, 8000)
        }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=300)
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]
    except requests.exceptions.HTTPError as e:
        # Log do erro completo para debug
        print(f"Erro HTTP na API DeepSeek: {e}")
        if e.response is not None:
            print(f"Status: {e.response.status_code}")
            print(f"Resposta completa: {e.response.text}")
        raise Exception(f"{e.response.status_code} {e.response.reason}: {e.response.text[:200] if e.response else 'N/A'}")
