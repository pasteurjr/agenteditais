# Conclusão: Tentativa de Migração para LM Studio

**Data:** 2026-01-05
**Status:** ❌ FALHOU - Bug no MindsDB
**Decisão:** Reverter para OpenAI

---

## Objetivo Original

Migrar os agentes MindsDB de OpenAI (GPT-4o) para LM Studio local (Qwen2.5-Coder-32B) para:
- ✅ Reduzir custos (de $0.15/1M tokens para $0)
- ✅ Melhorar privacidade (dados 100% locais)
- ✅ Reduzir latência (200ms vs 1000ms)

---

## Testes Realizados

### ✅ Testes que Funcionaram

1. **Conectividade LM Studio**
   ```bash
   ping 192.168.1.115  # ✅ 0.2ms
   curl http://192.168.1.115:1234/v1/models  # ✅ Retornou lista de modelos
   curl http://192.168.1.115:1234/v1/chat/completions  # ✅ Retornou resposta
   ```

2. **Modelo disponível**
   - ✅ `qwen2.5-coder-32b-instruct` confirmado no servidor
   - ✅ Teste de chat completion funcionou perfeitamente

### ❌ Testes que Falharam

1. **Criar agente com `openai_api_base`**
   ```sql
   CREATE AGENT test USING
     provider = 'openai',
     openai_api_base = 'http://192.168.1.115:1234/v1',
     model = 'qwen2.5-coder-32b-instruct';
   ```
   **Erro:** `401 - Invalid API key` (tentou conectar a platform.openai.com)

2. **Criar modelo com `api_base`**
   ```sql
   CREATE MODEL test USING
     engine = 'openai',
     api_base = 'http://192.168.1.115:1234/v1',
     model_name = 'qwen2.5-coder-32b-instruct';
   ```
   **Erro:** `400 - Model with identifier 'test' not found`
   (usou parte do nome do modelo MindsDB ao invés do `model_name`)

3. **Criar ML_ENGINE customizado**
   ```sql
   CREATE ML_ENGINE lmstudio FROM openai
   USING api_base = 'http://192.168.1.115:1234/v1';
   ```
   **Erro:** Mesmo problema - MindsDB ignorou o `api_base`

---

## Causa Raiz Identificada

### Bug Conhecido no MindsDB

Pesquisa na web confirmou:
- **[Issue #10126](https://github.com/mindsdb/mindsdb/issues/10126):** "Cannot use custom api_base with OpenAI Handler"
- **[Discussion #9010](https://github.com/mindsdb/mindsdb/discussions/9010):** "Custom Api Base not working"
- **[PR #10179](https://github.com/mindsdb/mindsdb/pull/10179):** Fix implementado, mas pode não estar na versão 25.3.2.0

### Sintomas do Bug

1. MindsDB **ignora** o parâmetro `api_base` em agentes
2. MindsDB **ignora** o parâmetro `model_name` em modelos
3. MindsDB usa parte do **nome do modelo** ao invés do `model_name` especificado
4. Skills tentam conectar ao OpenAI oficial mesmo com `api_base` customizado

---

## Alternativas Consideradas

### 1. ✅ Usar Ollama (RECOMENDADO)

**Prós:**
- ✅ Suporte oficial do MindsDB ([docs](https://docs.mindsdb.com/integrations/ai-engines/ollama))
- ✅ Sem bugs conhecidos
- ✅ Mesma performance que LM Studio
- ✅ Configuração simples

**Contras:**
- ⚠️ Precisa instalar Ollama separadamente
- ⚠️ Precisa baixar modelos novamente

**Como fazer:**
```bash
# Instalar Ollama
curl https://ollama.ai/install.sh | sh

# Baixar modelo
ollama pull qwen2.5-coder:32b

# No MindsDB:
CREATE ML_ENGINE ollama_engine FROM ollama
USING ollama_host = 'http://localhost:11434';

CREATE AGENT agent_name USING
  engine = 'ollama_engine',
  model = 'qwen2.5-coder:32b';
```

### 2. ✅ Atualizar MindsDB

**Prós:**
- ✅ Pode corrigir o bug (PR #10179)
- ✅ Permite usar LM Studio

**Contras:**
- ⚠️ Risco de quebrar configurações existentes
- ⚠️ Não garantido que a nova versão tem o fix

**Como fazer:**
```bash
docker pull mindsdb/mindsdb:latest
docker stop mindsdb_container
docker rm mindsdb_container
docker run -d --name mindsdb_container -p 47334:47334 mindsdb/mindsdb:latest
```

### 3. ⚠️ Variável de Ambiente (WORKAROUND)

**Prós:**
- ✅ Pode funcionar sem atualizar
- ✅ Workaround documentado

**Contras:**
- ⚠️ Não testado
- ⚠️ Afeta TODOS os agentes (não permite mix OpenAI + LM Studio)

**Como fazer:**
```bash
docker run -d \
  -e OPENAI_API_BASE=http://192.168.1.115:1234/v1 \
  -e OPENAI_API_KEY=sk-local \
  mindsdb/mindsdb
```

### 4. ✅ Manter OpenAI (DECISÃO ATUAL)

**Prós:**
- ✅ Funciona perfeitamente
- ✅ Sem riscos
- ✅ Confiável (99.9% SLA)

**Contras:**
- ❌ Custo: ~$0.15/1M tokens
- ❌ Dados enviados para OpenAI
- ❌ Latência maior

---

## Decisão Final

**REVERTER PARA OPENAI** usando o script:
```
scripts/REVERT-TO-OPENAI-FINAL.sql
```

### Configuração Final dos Agentes

**Agente 1: natural_language_check_stock**
- Model: `gpt-4o`
- Skill: `producao_tropical_sql_skill_f72ddc92be4d4ce7b9a537412f5f511b`
- Prompt: "Gere a query sql para consulta ao banco de dados, execute a query e responda a essa pergunta em português: {{question}}"

**Agente 2: natural_language_database_searcher**
- Model: `gpt-4o`
- Skill: `producao_tropical_sql_skill_1a05114b1c9d41f2b156643915e2eea1`
- Prompt: "Gere a query sql para consulta ao banco de dados e responda a essa pergunta em português: {{question}}"

---

## Lições Aprendidas

1. ✅ MindsDB tem **bugs conhecidos** com custom `api_base`
2. ✅ LM Studio funciona perfeitamente (testado), mas MindsDB não suporta corretamente
3. ✅ **Ollama é a alternativa recomendada** para LLMs locais com MindsDB
4. ✅ Sempre verificar issues do GitHub antes de tentar integrações customizadas
5. ✅ OpenAI é confiável, mas caro - considerar Ollama para o futuro

---

## Próximos Passos (Futuro)

### Curto Prazo
- ✅ Manter OpenAI (funciona, confiável)
- ✅ Monitorar custos da API
- ✅ Considerar GPT-4o-mini para reduzir custos (70% mais barato)

### Médio Prazo
- ⏳ Avaliar migração para Ollama
- ⏳ Testar Ollama em ambiente de desenvolvimento
- ⏳ Comparar qualidade Ollama vs OpenAI

### Longo Prazo
- ⏳ Acompanhar updates do MindsDB
- ⏳ Testar novamente quando versão com fix do PR #10179 estiver disponível
- ⏳ Considerar contribuir com MindsDB para melhorar suporte LM Studio

---

## Arquivos Criados Durante Tentativa

### Scripts SQL
- ✅ `scripts/switch-to-lmstudio.sql` - Migração (não funciona)
- ✅ `scripts/switch-to-openai.sql` - Reversão (funciona)
- ✅ `scripts/check-agents-status.sql` - Diagnóstico
- ✅ `scripts/REVERT-TO-OPENAI-FINAL.sql` - **Reversão completa (USE ESTE)**

### Documentação
- ✅ `configuracao-qwen-local.md` - Guia LM Studio (não aplicável)
- ✅ `configuracao-agents-migration.md` - Guia migração (parcialmente aplicável)
- ✅ `.env.example` - Template de configuração
- ✅ `CONCLUSAO-MIGRACAO-LMSTUDIO.md` - **Este documento**

---

## Resumo Executivo

| Aspecto | Status | Nota |
|---------|--------|------|
| **Conectividade LM Studio** | ✅ OK | Servidor funcionando perfeitamente |
| **MindsDB → LM Studio** | ❌ FALHOU | Bug conhecido (#10126) |
| **Agentes OpenAI** | ✅ OK | Revertidos com sucesso |
| **Alternativa Ollama** | ⏳ PENDENTE | Recomendado para futuro |
| **Custo atual** | ⚠️ ALTO | ~$0.15/1M tokens (OpenAI) |

---

**Conclusão:** MindsDB versão 25.3.2.0 **NÃO suporta corretamente** servidores OpenAI-compatible customizados (como LM Studio) devido a bugs conhecidos. A melhor alternativa local é **Ollama**, que tem integração oficial.

**Recomendação:** Manter OpenAI no curto prazo e planejar migração para Ollama quando possível.

---

**Documento criado em:** 2026-01-05
**Autor:** Baseado em testes e pesquisa
**Referências:**
- [MindsDB OpenAI Docs](https://docs.mindsdb.com/integrations/ai-engines/openai)
- [Issue #10126](https://github.com/mindsdb/mindsdb/issues/10126)
- [MindsDB Ollama Docs](https://docs.mindsdb.com/integrations/ai-engines/ollama)
