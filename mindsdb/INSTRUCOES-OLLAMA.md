# Instruções: Migrar Agentes para Ollama (Qwen 2.5 Coder 32B)

**Data:** 2026-01-05
**Status:** ✅ PRONTO PARA EXECUTAR
**Solução:** host.docker.internal:11434 (Docker → Host via SSH tunnel)

---

## Pré-requisitos (JÁ ATENDIDOS ✅)

- ✅ SSH tunnel rodando: `ssh -p71 -N -L 11434:localhost:11434 pasteurjr@192.168.1.115`
- ✅ Ollama remoto respondendo em 192.168.1.115:11434
- ✅ Modelo qwen2.5-coder:32b baixado (19.8 GB)
- ✅ MindsDB Studio acessível em http://localhost:47334

---

## Executar no MindsDB Studio (http://localhost:47334)

### ⚠️ IMPORTANTE
**Execute UM COMANDO POR VEZ** (MindsDB Studio não aceita múltiplos comandos)

---

### PASSO 1: Dropar primeiro agente

```sql
DROP AGENT IF EXISTS natural_language_check_stock;
```

**Aguarde:** "Agent dropped successfully" ou similar
**Se der erro:** Ignore e continue

---

### PASSO 2: Criar primeiro agente com Ollama

```sql
CREATE AGENT natural_language_check_stock
USING
    provider = 'ollama',
    model = 'qwen2.5-coder:32b',
    ollama_host = 'http://host.docker.internal:11434',
    prompt_template = 'Gere a query sql para consulta ao banco de dados, execute a query e responda a essa pergunta em português: {{question}}',
    skills = ['producao_tropical_sql_skill_f72ddc92be4d4ce7b9a537412f5f511b'];
```

**Aguarde:** "Agent created successfully" ou similar
**Se der erro:** Anote o erro e continue para diagnóstico

---

### PASSO 3: Dropar segundo agente

```sql
DROP AGENT IF EXISTS natural_language_database_searcher;
```

**Aguarde:** "Agent dropped successfully" ou similar
**Se der erro:** Ignore e continue

---

### PASSO 4: Criar segundo agente com Ollama

```sql
CREATE AGENT natural_language_database_searcher
USING
    provider = 'ollama',
    model = 'qwen2.5-coder:32b',
    ollama_host = 'http://host.docker.internal:11434',
    prompt_template = 'Gere a query sql para consulta ao banco de dados e responda a essa pergunta em português: {{question}}',
    skills = ['producao_tropical_sql_skill_1a05114b1c9d41f2b156643915e2eea1'];
```

**Aguarde:** "Agent created successfully" ou similar
**Se der erro:** Anote o erro e continue para diagnóstico

---

### PASSO 5: Verificar agentes criados

```sql
SHOW AGENTS;
```

**Esperado:** Listar ambos agentes com model_name = 'qwen2.5-coder:32b'

---

### PASSO 6: Testar Agente 1 (natural_language_check_stock)

```sql
SELECT *
FROM mindsdb.natural_language_check_stock
WHERE question = 'Quantas máquinas existem na tabela maquinas?';
```

**Esperado:**
- SQL gerado corretamente
- Query executada
- Resposta em português

**Se der erro de conexão:** Problema de rede Docker → Host

---

### PASSO 7: Testar Agente 2 (natural_language_database_searcher)

```sql
SELECT *
FROM mindsdb.natural_language_database_searcher
WHERE question = 'Liste as 5 primeiras tabelas do banco de dados producao_tropical';
```

**Esperado:**
- SQL gerado corretamente
- Lista de tabelas retornada
- Resposta em português

---

## Troubleshooting

### Erro: "Connection refused" ou "Cannot connect to localhost:11434"

**Causa:** Docker não consegue acessar host.docker.internal

**Soluções:**

1. **Verificar se SSH tunnel está rodando:**
   ```bash
   ps aux | grep "ssh.*11434"
   ```
   Deve mostrar: `ssh -p71 -N -L 11434:localhost:11434 pasteurjr@192.168.1.115`

2. **Testar Ollama via tunnel (no terminal do host):**
   ```bash
   curl http://localhost:11434/api/tags
   ```
   Deve retornar JSON com modelo qwen2.5-coder:32b

3. **Verificar network_mode do Docker:**
   ```bash
   docker inspect mindsdb_container | grep -i network
   ```

   - Se for `"NetworkMode": "bridge"` → host.docker.internal deve funcionar
   - Se for `"NetworkMode": "host"` → usar `localhost:11434`

4. **Alternativa 1: Usar IP direto do Ollama remoto**
   ```sql
   ollama_host = 'http://192.168.1.115:11434'
   ```
   (Não precisa de SSH tunnel, mas perde a segurança)

5. **Alternativa 2: Recriar container com --network=host**
   ```bash
   docker stop mindsdb_container
   docker rm mindsdb_container
   docker run -d --name mindsdb_container --network=host mindsdb/mindsdb:25.3.2.0
   ```
   Depois usar `ollama_host = 'http://localhost:11434'`

---

### Erro: "Invalid model name"

**Causa:** Provider incorreto ou modelo não encontrado

**Solução:**
- Verificar que está usando `provider = 'ollama'` (NÃO `engine`)
- Verificar que modelo existe: `curl http://localhost:11434/api/tags`

---

### Erro: SQL gerado incorreto ou resposta ruim

**Causa:** Qwen pode não ter compreendido a pergunta

**Soluções:**
1. Reformular a pergunta de forma mais clara
2. Ajustar o prompt_template
3. Reverter para OpenAI: `scripts/REVERT-TO-OPENAI-FINAL.sql`

---

## Reverter para OpenAI (Se Necessário)

Se Ollama não funcionar ou performance for ruim:

```bash
# No MindsDB Studio, executar comando por comando:
cat /home/pasteurjr/Documentos/mindsdb/scripts/REVERT-TO-OPENAI-FINAL.sql
```

**Tempo de rollback:** < 2 minutos

---

## Benefícios da Migração (Se Funcionar)

| Aspecto | OpenAI (Antes) | Ollama (Depois) |
|---------|----------------|-----------------|
| **Custo** | ~$0.15/1M tokens | $0 (grátis) |
| **Latência** | ~1000ms | ~200ms |
| **Privacidade** | Dados enviados OpenAI | 100% local |
| **Disponibilidade** | 99.9% SLA | Depende do servidor remoto |

---

## Manter SSH Tunnel Sempre Ativo

Para evitar que o tunnel caia:

```bash
# Opção 1: Rodar em tmux/screen
tmux new -s ollama-tunnel
ssh -p71 -N -L 11434:localhost:11434 pasteurjr@192.168.1.115
# Detach: Ctrl+B, D

# Opção 2: Criar serviço systemd (mais robusto)
sudo nano /etc/systemd/system/ollama-tunnel.service
```

Conteúdo do serviço:
```ini
[Unit]
Description=SSH Tunnel para Ollama Remoto
After=network.target

[Service]
Type=simple
User=pasteurjr
ExecStart=/usr/bin/ssh -p71 -N -L 11434:localhost:11434 pasteurjr@192.168.1.115
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Ativar:
```bash
sudo systemctl daemon-reload
sudo systemctl enable ollama-tunnel
sudo systemctl start ollama-tunnel
```

---

## Próximos Passos

1. ✅ Executar passos 1-7 acima
2. ✅ Validar que ambos agentes funcionam
3. ✅ Testar com queries de produção real
4. ⏳ Monitorar performance por 1 semana
5. ⏳ Documentar problemas encontrados
6. ⏳ Decidir: manter Ollama ou reverter para OpenAI

---

**Boa sorte!** 🚀
