# Guia de Migração de Agentes MindsDB: OpenAI ↔ LM Studio

## Visão Geral

Este documento descreve o processo completo de migração dos agentes MindsDB entre provedores de LLM (OpenAI e LM Studio), permitindo alternância rápida e fácil rollback.

---

## Agentes Gerenciados

### 1. `natural_language_check_stock`
- **Função:** Executar queries SQL em linguagem natural no banco producao_tropical
- **Skill:** producao_tropical_sql_skill_5fd72444521a42ff9e7e36045f25a0db
- **Uso:** Consultas de produção, estoque e manutenção

### 2. `natural_language_database_searcher`
- **Função:** Buscar informações gerais no banco de dados
- **Skill:** (configurável)
- **Uso:** Buscas e explorações de dados

---

## Arquivos de Configuração

### Estrutura de Diretórios

```
/home/pasteurjr/Documentos/mindsdb/
├── .env.example                          # Template de variáveis de ambiente
├── configuracao-mindsdb.md               # Guia principal do MindsDB
├── configuracao-qwen-local.md            # Guia do Qwen local
├── configuracao-agents-migration.md      # Este arquivo
└── scripts/
    ├── switch-to-lmstudio.sql           # Migrar para LM Studio
    ├── switch-to-openai.sql             # Reverter para OpenAI
    └── check-agents-status.sql          # Verificar status
```

---

## Provedores Disponíveis

### OpenAI (Cloud)
- **Modelos:** GPT-4o, GPT-4o-mini
- **Custo:** ~$0.15/1M tokens (GPT-4o-mini)
- **Latência:** 500-2000ms
- **Privacidade:** Dados enviados para OpenAI
- **Disponibilidade:** 99.9% SLA

### LM Studio (Local)
- **Modelo:** Qwen2.5-Coder-32B-Instruct
- **Servidor:** 192.168.1.115:1234
- **Custo:** $0 (grátis)
- **Latência:** 50-200ms (rede local)
- **Privacidade:** 100% local
- **Disponibilidade:** Depende do servidor

---

## Migração: OpenAI → LM Studio

### Pré-requisitos

1. **Verificar servidor LM Studio está rodando:**
```bash
ping -c 2 192.168.1.115
curl http://192.168.1.115:1234/v1/models
```

2. **Backup da configuração atual:**
```sql
-- Executar no MindsDB Studio
SELECT * FROM information_schema.agents
WHERE name IN ('natural_language_check_stock', 'natural_language_database_searcher');
```

Salvar o output em um arquivo de texto.

### Passo a Passo

#### 1. Executar Script de Migração

No MindsDB Studio, abra e execute:
```
scripts/switch-to-lmstudio.sql
```

Ou copie e cole o conteúdo do script diretamente no editor SQL.

#### 2. Verificar Migração

```sql
-- Ver agentes criados
SHOW AGENTS;

-- Ver qual modelo está sendo usado
SELECT
    name AS agente,
    model_name AS modelo,
    CASE
        WHEN params LIKE '%192.168.1.115%' THEN 'LM Studio (Qwen)'
        WHEN params LIKE '%openai%' THEN 'OpenAI'
        ELSE 'Desconhecido'
    END AS provedor
FROM information_schema.agents
WHERE name IN ('natural_language_check_stock', 'natural_language_database_searcher');
```

#### 3. Testar Agentes

```sql
-- Teste Agente 1
SELECT *
FROM mindsdb.natural_language_check_stock
WHERE question = 'Quantos registros existem na tabela maquinas?';

-- Teste Agente 2
SELECT *
FROM mindsdb.natural_language_database_searcher
WHERE question = 'Liste as tabelas do banco de dados';
```

#### 4. Validar Resultados

- ✅ Respostas corretas e em português
- ✅ SQL gerado está sintaticamente correto
- ✅ Tempo de resposta < 500ms
- ✅ Sem erros de conexão

---

## Reversão: LM Studio → OpenAI

### Quando Reverter

- Servidor LM Studio offline ou instável
- Qualidade das respostas inferior ao esperado
- Necessidade de maior confiabilidade (99.9% SLA)
- Queries complexas que Qwen não consegue gerar

### Passo a Passo

#### 1. Executar Script de Reversão

No MindsDB Studio, abra e execute:
```
scripts/switch-to-openai.sql
```

#### 2. Verificar Reversão

```sql
SHOW AGENTS;

SELECT name, model_name FROM information_schema.agents
WHERE name IN ('natural_language_check_stock', 'natural_language_database_searcher');
```

#### 3. Testar Agentes

```sql
-- Teste básico
SELECT *
FROM mindsdb.natural_language_check_stock
WHERE question = 'Quantos produtos temos em estoque?';
```

**Tempo de rollback:** < 2 minutos

---

## Monitoramento e Diagnóstico

### Script de Status Completo

```bash
# No MindsDB Studio, execute:
scripts/check-agents-status.sql
```

### Verificações Manuais

#### 1. Verificar Engines Disponíveis
```sql
SHOW ML_ENGINES;
```

Deve mostrar:
- `openai` - Engine OpenAI
- `lmstudio` - Engine LM Studio
- `statsforecast` - Engine para previsões

#### 2. Verificar Conectividade LM Studio
```bash
# No terminal
curl http://192.168.1.115:1234/v1/models
```

Deve retornar JSON com lista de modelos.

#### 3. Verificar Logs de Conversas
```sql
SELECT * FROM mindsdb.agents_conversations
WHERE agent_name = 'natural_language_check_stock'
ORDER BY created_at DESC
LIMIT 5;
```

---

## Comparação de Performance

| Métrica | OpenAI (GPT-4o-mini) | LM Studio (Qwen) |
|---------|----------------------|------------------|
| **Custo** | $0.15/1M tokens | $0 |
| **Latência Média** | ~1000ms | ~200ms |
| **Queries Simples** | Excelente | Excelente |
| **Queries Complexas** | Excelente | Muito Bom |
| **Compreensão de NL** | Excelente | Muito Bom |
| **Geração de SQL** | Excelente | Excelente |
| **Privacidade** | Baixa | Alta |
| **Disponibilidade** | 99.9% | Variável |

---

## Troubleshooting

### Problema: "Connection timeout" ao usar LM Studio

**Causa:** Servidor LM Studio offline ou inacessível

**Solução:**
```bash
# 1. Verificar se servidor está respondendo
ping 192.168.1.115

# 2. Verificar se porta 1234 está aberta
nc -zv 192.168.1.115 1234

# 3. Se offline, reverter para OpenAI
# No MindsDB Studio:
scripts/switch-to-openai.sql
```

### Problema: SQL gerado incorreto

**Causa:** Modelo não entendeu a pergunta ou prompt inadequado

**Solução:**
1. Reformular pergunta de forma mais clara
2. Verificar se está usando o prompt_template correto
3. Considerar ajustar o prompt para o modelo específico
4. Se persistir, reverter para OpenAI

### Problema: Agente não responde

**Causa:** Agente não foi criado corretamente

**Solução:**
```sql
-- Verificar se agente existe
SHOW AGENTS;

-- Se não existir, executar script de criação novamente
scripts/switch-to-lmstudio.sql  -- ou switch-to-openai.sql
```

### Problema: "No module named 'lightwood'"

**Causa:** Tentando usar engine lightwood que não está instalado

**Solução:**
- Usar `engine = 'statsforecast'` ao invés de `engine = 'lightwood'`
- Ou remover cláusula `USING engine = '...'` para usar engine padrão

---

## Boas Práticas

### 1. Sempre Fazer Backup

Antes de qualquer migração:
```sql
SELECT * FROM information_schema.agents WHERE name = 'nome_do_agente';
```
Salve o output em um arquivo.

### 2. Testar em Ambiente de Desenvolvimento

Se possível, teste a migração em um ambiente de dev antes de aplicar em produção.

### 3. Monitorar Performance

Após migração, monitore:
- Taxa de sucesso das queries
- Tempo de resposta
- Qualidade das respostas
- Erros ou falhas

### 4. Documentar Problemas

Mantenha um log de problemas encontrados com cada provedor para referência futura.

### 5. Ter Plano de Rollback

Sempre tenha o script de reversão testado e pronto para uso.

---

## Alternância Rápida: Resumo dos Comandos

### Migrar para LM Studio (Qwen)
```sql
-- No MindsDB Studio, execute:
@scripts/switch-to-lmstudio.sql
```

### Reverter para OpenAI
```sql
-- No MindsDB Studio, execute:
@scripts/switch-to-openai.sql
```

### Verificar Status
```sql
-- No MindsDB Studio, execute:
@scripts/check-agents-status.sql
```

**Tempo total de alternância:** < 2 minutos

---

## Casos de Uso Recomendados

### Use LM Studio (Qwen) quando:
- ✅ Custo é uma preocupação
- ✅ Privacidade é crítica
- ✅ Baixa latência é necessária
- ✅ Alto volume de queries
- ✅ Queries SQL relativamente diretas

### Use OpenAI quando:
- ✅ Máxima confiabilidade é necessária (99.9% SLA)
- ✅ Queries muito complexas ou ambíguas
- ✅ Servidor LM Studio está offline
- ✅ Necessita latest model updates

---

## Configuração de Variáveis de Ambiente

Copie `.env.example` para `.env` e configure:

```env
# Escolher provedor ativo
ACTIVE_PROVIDER=lmstudio  # ou openai

# LM Studio
LMSTUDIO_BASE_URL=http://192.168.1.115:1234/v1
LMSTUDIO_MODEL=qwen2.5-coder-32b-instruct

# OpenAI
OPENAI_API_KEY=sua-api-key-aqui
OPENAI_MODEL_PRIMARY=gpt-4o
```

---

## Métricas de Sucesso

Após migração, validar:

- ✅ Ambos agentes criados sem erros
- ✅ Testes básicos passando
- ✅ Latência dentro do esperado (< 500ms)
- ✅ SQL gerado está correto
- ✅ Respostas em português corretas
- ✅ Taxa de sucesso > 95%

---

## Próximos Passos

1. **Executar migração** usando `scripts/switch-to-lmstudio.sql`
2. **Monitorar performance** por 1 semana
3. **Documentar problemas** encontrados
4. **Ajustar prompts** se necessário
5. **Avaliar custos** economizados

---

## Suporte e Referências

### Documentação Relacionada
- `/home/pasteurjr/Documentos/mindsdb/configuracao-mindsdb.md` - Guia principal
- `/home/pasteurjr/Documentos/mindsdb/configuracao-qwen-local.md` - Guia Qwen

### Scripts Disponíveis
- `scripts/switch-to-lmstudio.sql` - Migração para LM Studio
- `scripts/switch-to-openai.sql` - Reversão para OpenAI
- `scripts/check-agents-status.sql` - Diagnóstico

### Contatos
- MindsDB Studio: http://localhost:47334
- Servidor LM Studio: http://192.168.1.115:1234

---

**Documento criado em:** 2026-01-05
**Última atualização:** 2026-01-05
**Versão:** 1.0
**Status:** Pronto para uso
