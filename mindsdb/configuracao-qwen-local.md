# Configuração: Qwen2.5-Coder-32B Local no MindsDB

## Informações do Servidor

- **Servidor:** 192.168.1.115:1234
- **Endpoint:** http://192.168.1.115:1234/v1
- **Modelo:** qwen2.5-coder-32b-instruct
- **Autenticação:** Nenhuma (sem API key)
- **Compatibilidade:** OpenAI API format
- **Status:** ✅ Testado e funcionando

## Teste de Conectividade Realizado

```bash
# Teste de ping
ping -c 2 192.168.1.115
# Resultado: 0.2ms latência ✅

# Teste de porta
nc -zv 192.168.1.115 1234
# Resultado: Porta aberta ✅

# Lista de modelos disponíveis
curl http://192.168.1.115:1234/v1/models
# Resultado: qwen2.5-coder-32b-instruct disponível ✅

# Teste de chat completion
curl -X POST http://192.168.1.115:1234/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "qwen2.5-coder-32b-instruct",
    "messages": [{"role": "user", "content": "Responda apenas: OK"}],
    "max_tokens": 10
  }'
# Resultado: {"choices":[{"message":{"content":"OK"}}]} ✅
```

---

## Opção 1: Criar ML_ENGINE Dedicado (RECOMENDADO)

Esta abordagem cria um engine separado para o servidor local, facilitando reutilização.

### Passo 1: Criar ML_ENGINE

```sql
CREATE ML_ENGINE qwen_local
FROM openai
USING
    openai_api_base = 'http://192.168.1.115:1234/v1',
    openai_api_key = 'not-needed';
```

### Passo 2: Verificar se foi criado

```sql
SHOW ML_ENGINES;
```

### Passo 3: Criar modelo usando o engine

```sql
CREATE MODEL mindsdb.qwen_coder_model
PREDICT response
USING
    engine = 'qwen_local',
    model_name = 'qwen2.5-coder-32b-instruct',
    prompt_template = '{{question}}',
    max_tokens = 500;
```

### Passo 4: Testar o modelo

```sql
SELECT response
FROM mindsdb.qwen_coder_model
WHERE question = 'Escreva uma função Python que calcula o fatorial de um número';
```

---

## Opção 2: Criar Modelo Direto (Sem Engine Dedicado)

Se preferir não criar um engine separado:

```sql
CREATE MODEL mindsdb.qwen_coder_direct
PREDICT answer
USING
    engine = 'openai',
    api_base = 'http://192.168.1.115:1234/v1',
    model_name = 'qwen2.5-coder-32b-instruct',
    api_key = 'dummy-key',
    prompt_template = '{{question}}',
    max_tokens = 1000;
```

**Teste:**

```sql
SELECT answer
FROM mindsdb.qwen_coder_direct
WHERE question = 'O que é Python?';
```

---

## Opção 3: Criar Agente com Qwen Local

Para usar o modelo em um agente inteligente com skills:

### Passo 1: Criar agente básico

```sql
CREATE AGENT code_assistant_qwen
USING
    model = 'qwen2.5-coder-32b-instruct',
    provider = 'openai',
    openai_api_base = 'http://192.168.1.115:1234/v1',
    openai_api_key = 'dummy',
    prompt_template = 'Você é um assistente especializado em programação. Ajude o usuário com: {{question}}';
```

### Passo 2: Criar agente com SQL skill

```sql
CREATE AGENT sql_coder_qwen
USING
    model = 'qwen2.5-coder-32b-instruct',
    provider = 'openai',
    openai_api_base = 'http://192.168.1.115:1234/v1',
    openai_api_key = 'dummy',
    prompt_template = 'Você é um especialista em SQL. Gere e execute queries SQL para responder: {{question}}',
    skills = ['producao_tropical_sql_skill_5fd72444521a42ff9e7e36045f25a0db'];
```

### Passo 3: Testar agente

```sql
SELECT *
FROM mindsdb.code_assistant_qwen
WHERE question = 'Como criar uma tabela SQL para armazenar usuários?';
```

---

## Comparação: Qwen Local vs GPT-4o

| Aspecto | Qwen Local | GPT-4o (OpenAI) |
|---------|------------|-----------------|
| **Custo** | Gratuito | Pago por token |
| **Latência** | ~0.2ms rede local | Varia (internet) |
| **Privacidade** | 100% local | Dados enviados para OpenAI |
| **Especialização** | Código (32B params) | Geral (maior) |
| **Disponibilidade** | Depende do servidor | 99.9% SLA |
| **Limite de tokens** | Configurável | Limite de API |

---

## Casos de Uso Recomendados

### Use Qwen Local para:
- ✅ Geração de código (Python, SQL, JavaScript, etc.)
- ✅ Análise de código e debugging
- ✅ Documentação de código
- ✅ Tradução entre linguagens de programação
- ✅ Casos onde privacidade é importante
- ✅ Alto volume de requisições (sem custo)

### Use GPT-4o para:
- ✅ Tarefas de linguagem natural complexas
- ✅ Raciocínio avançado
- ✅ Conhecimento geral atualizado
- ✅ Quando 100% de uptime é crítico

---

## Troubleshooting

### Erro: "Connection timeout"

```sql
-- Verificar se o servidor está acessível
-- Execute no terminal:
ping 192.168.1.115
curl http://192.168.1.115:1234/v1/models
```

### Erro: "Model not found"

```sql
-- Ver modelos disponíveis no servidor
-- Execute no terminal:
curl http://192.168.1.115:1234/v1/models | python3 -m json.tool
```

### Erro: "API key invalid"

O servidor local não valida API keys, mas o MindsDB pode exigir uma. Use qualquer string:
- `api_key = 'dummy'`
- `api_key = 'not-needed'`
- `api_key = 'local-server'`

### Engine não encontrado

```sql
-- Ver engines disponíveis
SHOW ML_ENGINES;

-- Se 'openai' não existir, criar:
CREATE ML_ENGINE openai
FROM openai
USING
    openai_api_key = 'sua-chave-real-do-openai';
```

---

## Outros Modelos Disponíveis no Servidor

Além do Qwen2.5-Coder-32B, o servidor local tem:

1. **qwen3-coder-30b-a3b-instruct** - Versão mais nova
2. **nvidia_nvidia-nemotron-nano-9b-v2** - Modelo menor da NVIDIA
3. **deepcoder-14b-preview** - Especializado em código
4. **gpt-oss-20b** - Modelo geral open-source
5. **text-embedding-nomic-embed-text-v1.5** - Para embeddings

Para usar outro modelo, basta mudar o `model_name`:

```sql
CREATE MODEL mindsdb.nemotron_model
PREDICT response
USING
    engine = 'qwen_local',
    model_name = 'nvidia_nvidia-nemotron-nano-9b-v2',
    prompt_template = '{{question}}';
```

---

## Exemplo Prático: Agente SQL com Qwen Local

```sql
-- 1. Criar ML_ENGINE (se ainda não existir)
CREATE ML_ENGINE qwen_local
FROM openai
USING
    openai_api_base = 'http://192.168.1.115:1234/v1',
    openai_api_key = 'local';

-- 2. Criar agente que usa Qwen para SQL
CREATE AGENT producao_assistant_qwen
USING
    model = 'qwen2.5-coder-32b-instruct',
    provider = 'openai',
    openai_api_base = 'http://192.168.1.115:1234/v1',
    openai_api_key = 'local',
    prompt_template = 'Você é especialista em SQL para o banco de dados producao_tropical. Gere e execute queries SQL para responder em português: {{question}}',
    skills = ['producao_tropical_sql_skill_5fd72444521a42ff9e7e36045f25a0db'];

-- 3. Testar
SELECT *
FROM mindsdb.producao_assistant_qwen
WHERE question = 'Quantas máquinas estão ativas hoje?';
```

**Vantagens:**
- 🆓 Sem custo de API
- 🔒 Dados não saem da rede local
- ⚡ Latência muito baixa
- 🎯 Especializado em código/SQL

---

## Monitoramento

### Ver modelos criados

```sql
SHOW MODELS;
```

### Ver detalhes de um modelo

```sql
DESCRIBE qwen_coder_model;
```

### Ver uso de um modelo

```sql
SELECT * FROM information_schema.models
WHERE name = 'qwen_coder_model';
```

### Deletar modelo

```sql
DROP MODEL qwen_coder_model;
```

### Deletar engine

```sql
DROP ML_ENGINE qwen_local;
```

---

## Resumo: Passos Rápidos

```sql
-- 1. Criar engine
CREATE ML_ENGINE qwen_local
FROM openai
USING
    openai_api_base = 'http://192.168.1.115:1234/v1',
    openai_api_key = 'local';

-- 2. Criar modelo
CREATE MODEL mindsdb.qwen_coder
PREDICT response
USING
    engine = 'qwen_local',
    model_name = 'qwen2.5-coder-32b-instruct',
    prompt_template = '{{question}}';

-- 3. Testar
SELECT response
FROM mindsdb.qwen_coder
WHERE question = 'Olá, você está funcionando?';
```

---

**Documento criado em:** 2026-01-04
**Status:** ✅ Servidor testado e funcional
**Latência:** ~0.2ms (rede local)
