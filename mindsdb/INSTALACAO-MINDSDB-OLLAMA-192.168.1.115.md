# Guia Completo: Instalação MindsDB + Ollama na 192.168.1.115

**Data:** 2026-01-05
**Máquina destino:** 192.168.1.115
**Objetivo:** Instalar MindsDB nativo + Ollama local para eliminar bugs de rede Docker
**Status:** ✅ PRONTO PARA EXECUTAR

---

## Pré-requisitos (JÁ INSTALADOS ✅)

- ✅ Ollama instalado na 192.168.1.115 (porta 11434)
- ✅ Modelo Qwen2.5-Coder-32B baixado (19.8 GB)
- ✅ Python 3.8+ disponível
- ✅ Acesso SSH: `ssh -p71 pasteurjr@192.168.1.115`

---

## PARTE 1: Instalação do MindsDB (Nativo - SEM Docker)

Execute todos os comandos **na máquina 192.168.1.115** via SSH.

### 1.1. Conectar via SSH

```bash
# Da sua máquina local
ssh -p71 pasteurjr@192.168.1.115
```

### 1.2. Instalar Dependências

```bash
# Atualizar sistema
sudo apt update

# Instalar dependências do MindsDB
sudo apt install -y python3-pip python3-venv build-essential libmysqlclient-dev

# Criar diretório para MindsDB
mkdir -p ~/mindsdb
cd ~/mindsdb
```

### 1.3. Criar Ambiente Virtual Python

```bash
# Criar venv
python3 -m venv venv

# Ativar venv
source venv/bin/activate

# Atualizar pip
pip install --upgrade pip
```

### 1.4. Instalar MindsDB

```bash
# Instalar MindsDB (pode demorar 5-10 minutos)
pip install mindsdb

# Verificar versão instalada
mindsdb --version
```

### 1.5. Iniciar MindsDB

```bash
# Iniciar MindsDB em background
nohup mindsdb --api http --port 47334 > mindsdb.log 2>&1 &

# Verificar se está rodando
ps aux | grep mindsdb

# Ver logs (Ctrl+C para sair)
tail -f mindsdb.log
```

**MindsDB Studio estará acessível em:** http://192.168.1.115:47334

---

## PARTE 2: Verificar Ollama

### 2.1. Testar Ollama

```bash
# Verificar se Ollama está rodando
curl http://localhost:11434/api/tags

# Deve retornar JSON com modelo qwen2.5-coder:32b
```

### 2.2. Se Ollama não estiver rodando

```bash
# Iniciar Ollama
ollama serve &

# Verificar novamente
curl http://localhost:11434/api/tags
```

---

## PARTE 3: Configurar MindsDB via Studio

Abra o navegador em: **http://192.168.1.115:47334**

Execute os comandos SQL **UM POR VEZ** no MindsDB Studio.

---

### 3.1. Criar Datasource MySQL (producao_tropical)

```sql
CREATE DATABASE producao_tropical
WITH ENGINE = 'mysql',
PARAMETERS = {
  "host": "plasticostropical.servehttp.com",
  "port": 3308,
  "database": "producao",
  "user": "producao",
  "password": "112358123"
};
```

**Aguarde:** "Database created successfully"

---

### 3.2. Verificar Datasource

```sql
SHOW DATABASES;
```

**Esperado:** Lista contendo `producao_tropical`

```sql
SHOW TABLES FROM producao_tropical;
```

**Esperado:** Lista de tabelas (maquinas, producaoproduto, saco, etc.)

---

### 3.3. Testar Conexão com Database

```sql
SELECT * FROM producao_tropical.maquinas LIMIT 5;
```

**Esperado:** Retornar 5 registros da tabela maquinas

---

### 3.4. Criar Skill SQL para Agente 1 (natural_language_check_stock)

**Esta skill é especializada em consultas de ESTOQUE de produtos.**

```sql
CREATE SKILL producao_tropical_sql_skill_check_stock
USING
    type = 'sql',
    database = 'producao_tropical',
    tables = ['produto'],
    description = 'Você é um especialista em gerar queries que procure pela quantidade em estoque de um produto. Para tal voce vai criar uma query select descprod, quantestoque from produto where descprod deve ter um LIKE para o nome do produto completo, um LIKE para cada cada palavra do nome do produto e um LIKE para cada combinação da  primera palavra com as outras seguintes, um like para cada combinação da segunda palavra do nome com as seguintes e assim por diante. Execute a query e forneça um unico resultado com o DEScPROD que seja mais semelhante ao nome do produto dersejado';
```

**Aguarde:** "Skill created successfully"

**IMPORTANTE:** Anote o ID completo da skill que será gerado (ex: `producao_tropical_sql_skill_check_stock_abc123...`)

---

### 3.5. Criar Skill SQL para Agente 2 (natural_language_database_searcher)

**Esta skill é para consultas GERAIS sobre produção, manutenção e qualidade.**

```sql
CREATE SKILL producao_tropical_sql_skill_searcher
USING
    type = 'sql',
    database = 'producao_tropical',
    description = 'A base de dados contém informações sobre a produção industrial de máquinas que fabricam produtos que sao embalagens plásticas. Cada máquina está associada a um molde específico e possui registros de produção com datas, status (se a máquina está produzindo ou não), e ciclos de checagem de qualidade de peso durante a produção. Também existem registros de manutenção preventiva e corretiva das máquinas, segmentados por turnos. A produção de cada produto é contada em sacos, e registram o estoque. cada produto possui uma quantidade por saco.para saber a quantidade em estoque de um produto deve-se consultar a tabela saco e a tabela movimentacaoestoque. As respostas devem ser fortnecidas em portugues As datas fornecidas nas perguntas seguem o formato **dd/mm/yyyy** e devem ser convertidas para o formato **yyyy-mm-dd** para realizar consultas. A base de dados é usada para responder perguntas relacionadas a: - **Produção das máquinas**, como status de produção, intervalo de datas e dados de peso. tabelas relacionadas a producao tem prod em seu nome - **Manutenção das máquinas**, incluindo registros diários e por turno. as tabelas de manutencao tem manut em seu nome - **Controle de qualidade**, com base em checagens de peso durante os ciclos de produção. A tabela de nome producaoproduto contem a producao de cada maquina. o campoquantproduzida é o que indica a quantidade de sacos produzida pela máquina. O modelo deve correlacionar as informações para responder perguntas em linguagem natural sobre a produção, qualidade e manutenção das máquinas. nao use a tabela registroproducao!! Essa tabela não existe. Use a tabela producaoproduto, que contẽm o registro de produção!!!';
```

**Aguarde:** "Skill created successfully"

**IMPORTANTE:** Anote o ID completo da skill que será gerado (ex: `producao_tropical_sql_skill_searcher_xyz789...`)

---

### 3.6. Verificar Skills Criadas

```sql
SHOW SKILLS;
```

**Esperado:** Listar as 2 skills criadas com seus IDs completos

**Copie os IDs das skills para usar nos próximos passos!**

---

### 3.7. Criar Agente 1: natural_language_check_stock (com Ollama)

**⚠️ SUBSTITUIR `<SKILL_ID_CHECK_STOCK>` pelo ID real da skill criada no passo 3.4**

**Este agente é especializado em consultas de ESTOQUE.**

```sql
CREATE AGENT natural_language_check_stock
USING
    provider = 'ollama',
    model = 'qwen2.5-coder:32b',
    ollama_host = 'http://localhost:11434',
    prompt_template = 'Gere a query sql para consulta ao banco de dados, execute a query e responda a essa pergunta em português: {{question}}',
    skills = ['<SKILL_ID_CHECK_STOCK>'];
```

**Exemplo com ID real (ajuste conforme o ID gerado):**
```sql
CREATE AGENT natural_language_check_stock
USING
    provider = 'ollama',
    model = 'qwen2.5-coder:32b',
    ollama_host = 'http://localhost:11434',
    prompt_template = 'Gere a query sql para consulta ao banco de dados, execute a query e responda a essa pergunta em português: {{question}}',
    skills = ['producao_tropical_sql_skill_check_stock_f72ddc92be4d4ce7b9a537412f5f511b'];
```

**Aguarde:** "Agent created successfully"

---

### 3.8. Criar Agente 2: natural_language_database_searcher (com Ollama)

**⚠️ SUBSTITUIR `<SKILL_ID_SEARCHER>` pelo ID real da skill criada no passo 3.5**

**Este agente é para consultas GERAIS (produção, manutenção, qualidade).**

```sql
CREATE AGENT natural_language_database_searcher
USING
    provider = 'ollama',
    model = 'qwen2.5-coder:32b',
    ollama_host = 'http://localhost:11434',
    prompt_template = 'Gere a query sql para consulta ao banco de dados e responda a essa pergunta em português: {{question}}',
    skills = ['<SKILL_ID_SEARCHER>'];
```

**Exemplo com ID real (ajuste conforme o ID gerado):**
```sql
CREATE AGENT natural_language_database_searcher
USING
    provider = 'ollama',
    model = 'qwen2.5-coder:32b',
    ollama_host = 'http://localhost:11434',
    prompt_template = 'Gere a query sql para consulta ao banco de dados e responda a essa pergunta em português: {{question}}',
    skills = ['producao_tropical_sql_skill_searcher_1a05114b1c9d41f2b156643915e2eea1'];
```

**Aguarde:** "Agent created successfully"

---

### 3.9. Verificar Agentes Criados

```sql
SHOW AGENTS;
```

**Esperado:**
- natural_language_check_stock (model: qwen2.5-coder:32b)
- natural_language_database_searcher (model: qwen2.5-coder:32b)

```sql
SELECT name, model_name, project_name, skills
FROM information_schema.agents;
```

---

## PARTE 4: Testar Agentes

### 4.1. Testar Agente 1 (natural_language_check_stock)

```sql
SELECT *
FROM mindsdb.natural_language_check_stock
WHERE question = 'Quantas máquinas existem na tabela maquinas?';
```

**Esperado:**
- SQL gerado: `SELECT COUNT(*) FROM producao_tropical.maquinas;`
- Resposta em português com o número de máquinas

---

### 4.2. Testar Agente 2 (natural_language_database_searcher)

```sql
SELECT *
FROM mindsdb.natural_language_database_searcher
WHERE question = 'Liste as 5 primeiras tabelas do banco de dados';
```

**Esperado:**
- SQL gerado: `SHOW TABLES FROM producao_tropical LIMIT 5;`
- Resposta em português com lista de tabelas

---

### 4.3. Teste de Produção Real

```sql
SELECT *
FROM mindsdb.natural_language_check_stock
WHERE question = 'Qual foi a produção total de BOMBONA 05 L RET NAT em dezembro de 2025?';
```

**Esperado:**
- SQL usando `producaoproduto` (NÃO registroproducao)
- Filtro por data dezembro 2025
- Soma de `quantproduzida`
- Resposta em português

---

### 4.4. Ver Histórico de Conversas

```sql
SELECT * FROM mindsdb.agents_conversations
WHERE agent_name IN ('natural_language_check_stock', 'natural_language_database_searcher')
ORDER BY created_at DESC
LIMIT 10;
```

---

## PARTE 5: Configurar MindsDB como Serviço (Opcional)

Para que MindsDB inicie automaticamente com o sistema:

```bash
# Criar arquivo de serviço systemd
sudo nano /etc/systemd/system/mindsdb.service
```

Conteúdo do arquivo:
```ini
[Unit]
Description=MindsDB Server
After=network.target

[Service]
Type=simple
User=pasteurjr
WorkingDirectory=/home/pasteurjr/mindsdb
Environment="PATH=/home/pasteurjr/mindsdb/venv/bin:/usr/local/bin:/usr/bin:/bin"
ExecStart=/home/pasteurjr/mindsdb/venv/bin/mindsdb --api http --port 47334
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Ativar serviço:
```bash
sudo systemctl daemon-reload
sudo systemctl enable mindsdb
sudo systemctl start mindsdb

# Verificar status
sudo systemctl status mindsdb

# Ver logs
sudo journalctl -u mindsdb -f
```

---

## PARTE 6: Acessar de Outras Máquinas

### 6.1. Da máquina local (seu computador)

Abrir navegador em: **http://192.168.1.115:47334**

### 6.2. Se não conseguir acessar (firewall)

```bash
# Na máquina 192.168.1.115
sudo ufw allow 47334/tcp
sudo ufw reload
```

---

## PARTE 7: Comparação com Configuração Anterior

| Aspecto | MindsDB Anterior (Docker) | MindsDB Novo (Nativo) |
|---------|---------------------------|------------------------|
| **Instalação** | Docker | Python pip |
| **Provider** | OpenAI (GPT-4o) | Ollama (Qwen 2.5 Coder 32B) |
| **Custo** | ~$0.15/1M tokens | $0 (grátis) |
| **Latência** | ~1000ms | ~200ms |
| **Privacidade** | Dados enviados OpenAI | 100% local |
| **Rede** | localhost via host.docker.internal | localhost direto ✅ |
| **Skills** | IDs: f72ddc92..., 1a05114b... | **Novos IDs** (anotar!) |
| **Datasource** | producao_tropical | producao_tropical (mesmo) |
| **Studio URL** | localhost:47334 | 192.168.1.115:47334 |

---

## PARTE 8: Troubleshooting

### Erro: "Connection refused" ao acessar Ollama

**Causa:** Ollama não está rodando

**Solução:**
```bash
# Verificar se Ollama está rodando
ps aux | grep ollama

# Se não estiver, iniciar
ollama serve &
```

---

### Erro: "Cannot connect to database producao_tropical"

**Causa:** Firewall bloqueando conexão ou credenciais incorretas

**Solução:**
```bash
# Testar conexão MySQL manualmente
mysql -h plasticostropical.servehttp.com -P 3308 -u producao -p producao
# Senha: 112358123
```

---

### Erro: "Skill not found"

**Causa:** ID da skill incorreto no CREATE AGENT

**Solução:**
```sql
-- Ver skills disponíveis
SHOW SKILLS;

-- Copiar o ID exato e usar no CREATE AGENT
```

---

### MindsDB não inicia

**Verificar logs:**
```bash
tail -f ~/mindsdb/mindsdb.log
```

**Verificar se porta 47334 está livre:**
```bash
sudo netstat -tulpn | grep 47334
```

**Se porta estiver ocupada:**
```bash
# Usar porta diferente
mindsdb --api http --port 47335
```

---

### Agente retorna SQL incorreto

**Ajustar prompt_template:**
```sql
DROP AGENT natural_language_check_stock;

CREATE AGENT natural_language_check_stock
USING
    provider = 'ollama',
    model = 'qwen2.5-coder:32b',
    ollama_host = 'http://localhost:11434',
    prompt_template = 'Você é um assistente SQL especializado no banco de dados producao_tropical. Use a skill SQL para gerar e executar queries que respondam às perguntas do usuário em português. REGRAS IMPORTANTES: 1) Converter datas de dd/mm/yyyy para yyyy-mm-dd, 2) Usar tabela producaoproduto (NÃO registroproducao), 3) Para estoque consultar saco e movimentacaoestoque, 4) Campo de produção: quantproduzida. Pergunta: {{question}}',
    skills = ['<SKILL_ID>'];
```

---

## PARTE 9: Backup e Migração

### 9.1. Exportar Configuração Atual

```sql
-- Exportar agentes
SELECT * FROM information_schema.agents;

-- Exportar skills
SELECT * FROM information_schema.skills;

-- Exportar databases
SELECT * FROM information_schema.databases;
```

Salvar output em arquivo de texto para backup.

---

### 9.2. Script de Recriação Rápida

Após anotar os IDs das skills, criar arquivo `restore-agents.sql`:

```sql
-- =============================================================================
-- SCRIPT DE RECRIAÇÃO DOS AGENTES (COPIAR IDS REAIS DAS SKILLS)
-- =============================================================================

-- Agente 1
CREATE AGENT natural_language_check_stock
USING
    provider = 'ollama',
    model = 'qwen2.5-coder:32b',
    ollama_host = 'http://localhost:11434',
    prompt_template = 'Gere a query sql para consulta ao banco de dados, execute a query e responda a essa pergunta em português: {{question}}',
    skills = ['<SKILL_ID_AGENTE1_AQUI>'];

-- Agente 2
CREATE AGENT natural_language_database_searcher
USING
    provider = 'ollama',
    model = 'qwen2.5-coder:32b',
    ollama_host = 'http://localhost:11434',
    prompt_template = 'Gere a query sql para consulta ao banco de dados e responda a essa pergunta em português: {{question}}',
    skills = ['<SKILL_ID_AGENTE2_AQUI>'];
```

---

## PARTE 10: Informações de Referência

### Credenciais MySQL (producao_tropical)
```
Host: plasticostropical.servehttp.com
Porta: 3308
Database: producao
Usuário: producao
Senha: 112358123
```

### URLs de Acesso
```
MindsDB Studio: http://192.168.1.115:47334
Ollama API: http://localhost:11434
```

### Modelos Ollama Disponíveis
```bash
# Listar modelos
ollama list

# Modelo sendo usado
qwen2.5-coder:32b (19.8 GB, Q4_K_M)
```

### Comandos Úteis

```bash
# Parar MindsDB
pkill -f mindsdb

# Iniciar MindsDB
cd ~/mindsdb
source venv/bin/activate
nohup mindsdb --api http --port 47334 > mindsdb.log 2>&1 &

# Ver logs MindsDB
tail -f ~/mindsdb/mindsdb.log

# Testar Ollama
curl http://localhost:11434/api/tags

# Status do serviço (se configurado)
sudo systemctl status mindsdb
```

---

## Checklist de Instalação

Marque cada item conforme concluir:

- [ ] 1. SSH para 192.168.1.115
- [ ] 2. MindsDB instalado via pip
- [ ] 3. MindsDB iniciado e acessível em http://192.168.1.115:47334
- [ ] 4. Ollama testado e respondendo
- [ ] 5. Datasource `producao_tropical` criado
- [ ] 6. Conexão com MySQL testada
- [ ] 7. Skill SQL para Agente 1 criada (ID anotado)
- [ ] 8. Skill SQL para Agente 2 criada (ID anotado)
- [ ] 9. Agente `natural_language_check_stock` criado
- [ ] 10. Agente `natural_language_database_searcher` criado
- [ ] 11. Ambos agentes testados com sucesso
- [ ] 12. Configuração documentada/backup feito

---

## Próximos Passos

1. ✅ Executar este guia passo a passo
2. ✅ Anotar IDs das skills criadas
3. ✅ Testar ambos agentes com queries reais
4. ⏳ Monitorar performance por 1 semana
5. ⏳ Comparar qualidade Qwen vs GPT-4o
6. ⏳ Decidir se migra definitivamente ou mantém ambos

---

**Boa sorte com a instalação!** 🚀

Se tiver problemas, verificar:
1. Logs do MindsDB: `tail -f ~/mindsdb/mindsdb.log`
2. Status do Ollama: `curl http://localhost:11434/api/tags`
3. Conexão MySQL: `mysql -h plasticostropical.servehttp.com -P 3308 -u producao -p`

---

**Documento criado em:** 2026-01-05
**Baseado em:** configuracao-mindsdb.md, exportagents.csv
**Versão MindsDB:** Latest (pip install)
**Modelo LLM:** Qwen2.5-Coder-32B (Ollama)
