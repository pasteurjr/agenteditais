# Guia de Configuração MindsDB

Documento com todos os comandos executados para atualizar API keys, recriar modelos, agentes e datasources no MindsDB.

---

## 1. Testar API Key da OpenAI

Antes de usar no MindsDB, testamos a API key diretamente:

```bash
# Testar se a API key está válida
curl -s https://api.openai.com/v1/models \
  -H "Authorization: Bearer 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"

# Testar modelo GPT-4o-mini
curl -s https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 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" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Say hello"}],
    "max_tokens": 10
  }'
```

---

## 2. Verificar Modelos e Engines Existentes

```sql
-- Ver todos os modelos
SHOW MODELS;

-- Ver ML_ENGINEs configurados
SELECT * FROM information_schema.ml_engines WHERE name = 'openai';

-- Ver agentes existentes
SHOW AGENTS;

-- Ver detalhes de um agente específico
SELECT * FROM information_schema.agents WHERE name = 'natural_language_check_stock';

-- Ver skills disponíveis
SHOW SKILLS;
```

---

## 3. Atualizar ML_ENGINE OpenAI

**IMPORTANTE:** Você deve deletar os modelos ANTES de deletar o engine.

```sql
-- Passo 1: Deletar modelo que usa o engine
DROP MODEL __ping_openai;

-- Passo 2: Deletar o ML_ENGINE
DROP ML_ENGINE openai;

-- Passo 3: Criar ML_ENGINE com nova API key
CREATE ML_ENGINE openai
FROM openai
USING
    openai_api_key = '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';

-- Passo 4: Recriar o modelo
CREATE MODEL __ping_openai
PREDICT answer
USING
    engine = 'openai',
    model_name = 'gpt-4o-mini',
    prompt_template = '{{question}}';

-- Passo 5: Testar o modelo
SELECT answer
FROM __ping_openai
WHERE question = 'Olá, você está funcionando?';
```

---

## 4. Dropar e Recriar Datasource

```sql
-- Passo 1: Dropar datasource existente
DROP DATABASE producao_tropical;

-- Passo 2: Criar novo datasource
CREATE DATABASE producao_tropical
WITH ENGINE = 'mysql',
PARAMETERS = {
  "host": "plasticostropical.servehttp.com",
  "port": 3308,
  "database": "producao",
  "user": "producao",
  "password": "112358123"
};

-- Passo 3: Verificar se funcionou
SHOW DATABASES;

-- Passo 4: Listar tabelas do database
SHOW TABLES FROM producao_tropical;

-- Passo 5: Testar com uma query
SELECT * FROM producao_tropical.maquinas LIMIT 5;
```

---

## 5. Recriar Agente com Nova API Key

### Configuração Original do Agente

- **Nome:** natural_language_check_stock
- **Modelo:** gpt-4o
- **Skill:** producao_tropical_sql_skill_5fd72444521a42ff9e7e36045f25a0db
- **Database:** producao_tropical
- **Função:** Executar queries SQL em linguagem natural

### Comandos para Recriar

```sql
-- Passo 1: Dropar agente existente
DROP AGENT natural_language_check_stock;

-- Passo 2: Criar agente com nova configuração
CREATE AGENT natural_language_check_stock
USING
  model = 'gpt-4o',
  provider = 'openai',
  openai_api_key = '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',
  prompt_template = 'Você é um assistente SQL especializado no banco de dados producao_tropical. Use a skill SQL para gerar e executar queries que respondam às perguntas do usuário em português. Lembre-se: converta datas de dd/mm/yyyy para yyyy-mm-dd, use a tabela producaoproduto (NÃO registroproducao), e consulte saco e movimentacaoestoque para estoque. Pergunta: {{question}}',
  skills = ['producao_tropical_sql_skill_5fd72444521a42ff9e7e36045f25a0db'];

-- Passo 3: Verificar se foi criado corretamente
SELECT * FROM information_schema.agents WHERE name = 'natural_language_check_stock';
```

---

## 6. Testar o Agente

```sql
-- Teste básico
SELECT *
FROM mindsdb.natural_language_check_stock
WHERE question = 'Quantos registros existem na tabela maquinas?';

-- Teste de produção
SELECT *
FROM mindsdb.natural_language_check_stock
WHERE question = 'Qual foi a produção total da última semana?';

-- Teste de estoque
SELECT *
FROM mindsdb.natural_language_check_stock
WHERE question = 'Quais produtos estão com estoque baixo?';

-- Ver histórico de conversas
SELECT * FROM mindsdb.agents_conversations
WHERE agent_name = 'natural_language_check_stock'
ORDER BY created_at DESC
LIMIT 10;
```

---

## 7. Informações da Skill SQL

A skill `producao_tropical_sql_skill_5fd72444521a42ff9e7e36045f25a0db` está configurada com:

- **Database:** producao_tropical
- **Tipo:** sql
- **Descrição:** Base de dados de produção industrial com informações sobre:
  - Máquinas e moldes
  - Registros de produção (tabela `producaoproduto`)
  - Manutenção preventiva e corretiva
  - Controle de qualidade por peso
  - Estoque (tabelas `saco` e `movimentacaoestoque`)

### Regras Importantes:
- Datas fornecidas em dd/mm/yyyy devem ser convertidas para yyyy-mm-dd
- Usar tabela `producaoproduto` (NÃO `registroproducao`)
- Para estoque: consultar `saco` e `movimentacaoestoque`
- Campo de produção: `quantproduzida` (quantidade de sacos)

---

## 8. Alternar Entre Modelos

### De gpt-4o-mini para gpt-4o:

```sql
DROP AGENT natural_language_check_stock;

CREATE AGENT natural_language_check_stock
USING
  model = 'gpt-4o',  -- Modelo mais potente e caro
  provider = 'openai',
  openai_api_key = 'sua-api-key-aqui',
  prompt_template = '...',
  skills = ['producao_tropical_sql_skill_5fd72444521a42ff9e7e36045f25a0db'];
```

### De gpt-4o para gpt-4o-mini:

```sql
DROP AGENT natural_language_check_stock;

CREATE AGENT natural_language_check_stock
USING
  model = 'gpt-4o-mini',  -- Modelo mais econômico
  provider = 'openai',
  openai_api_key = 'sua-api-key-aqui',
  prompt_template = '...',
  skills = ['producao_tropical_sql_skill_5fd72444521a42ff9e7e36045f25a0db'];
```

---

## 9. Troubleshooting

### Erro: "Unable to drop ml engine with active models"

**Solução:** Delete os modelos primeiro, depois o engine.

```sql
-- Ver quais modelos usam o engine
SHOW MODELS;

-- Deletar modelos primeiro
DROP MODEL nome_do_modelo;

-- Depois deletar o engine
DROP ML_ENGINE openai;
```

### Erro de sintaxe no ALTER AGENT

**Solução:** A versão do MindsDB pode não suportar ALTER AGENT. Use DROP e CREATE.

### Verificar se API key está funcionando

```sql
-- Teste simples com modelo
SELECT answer
FROM __ping_openai
WHERE question = 'teste';
```

---

## 10. Informações de Conexão

### MindsDB Container
- **Nome do container:** mindsdb_container
- **MindsDB Studio:** http://localhost:47334

### Database Producao Tropical
- **Host:** plasticostropical.servehttp.com
- **Porta:** 3308
- **Database:** producao
- **Usuário:** producao
- **Senha:** 112358123

### OpenAI API Key Atual
```
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
```

---

**Documento criado em:** 2026-01-03
**MindsDB Version:** 25.3.2.0
