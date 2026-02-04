# Plano Sprint 2 - Alertas e Automação (Completo)

## Visao Geral

A Sprint 2 implementa **alertas de pregao, notificacoes e monitoramento automatizado** de editais, permitindo que o usuario nunca perca um prazo importante.

### Objetivo Principal
Automatizar o acompanhamento de prazos e criar um sistema de notificacoes inteligente para editais.

### Entregaveis

| # | Funcionalidade | Intencao | Prioridade | Status |
|---|----------------|----------|------------|--------|
| 1 | Alertas de Prazo por Edital | `configurar_alertas` | Alta | Pendente |
| 2 | Dashboard de Contagem Regressiva | `listar_alertas` | Alta | Pendente |
| 3 | Extracao Automatica de Datas | `extrair_datas_edital` | Alta | Pendente |
| 4 | Monitoramento Automatico de Fontes | `configurar_monitoramento` | Alta | Pendente |
| 5 | Notificacoes por Email | `configurar_notificacoes` | Media | Pendente |
| 6 | Calendario de Editais | `ver_calendario` | Media | Pendente |
| 7 | Alertas de Novos Editais (Alta Aderencia) | `alertas_aderencia` | Media | Pendente |
| 8 | Historico de Alertas | `historico_alertas` | Baixa | Pendente |
| 9 | Configuracao de Preferencias | `preferencias_alertas` | Baixa | Pendente |

---

## Arquitetura de Dados

### Novas Tabelas

```sql
-- =====================================================
-- TABELA: alertas
-- Alertas agendados para editais
-- =====================================================
CREATE TABLE alertas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    edital_id INT NOT NULL,

    -- Tipo de alerta
    tipo ENUM('abertura', 'impugnacao', 'recursos', 'proposta', 'personalizado') NOT NULL,

    -- Quando disparar
    data_disparo DATETIME NOT NULL,
    tempo_antes_minutos INT,  -- 1440 = 24h, 60 = 1h, etc.

    -- Status
    status ENUM('agendado', 'disparado', 'lido', 'cancelado') DEFAULT 'agendado',

    -- Canais
    canal_email BOOLEAN DEFAULT TRUE,
    canal_push BOOLEAN DEFAULT TRUE,
    canal_sms BOOLEAN DEFAULT FALSE,

    -- Mensagem
    titulo VARCHAR(255),
    mensagem TEXT,

    -- Metadados
    disparado_em DATETIME,
    lido_em DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (edital_id) REFERENCES editais(id),
    INDEX idx_alertas_status (status),
    INDEX idx_alertas_data (data_disparo),
    INDEX idx_alertas_user (user_id)
);

-- =====================================================
-- TABELA: monitoramentos
-- Configuracoes de monitoramento automatico
-- =====================================================
CREATE TABLE monitoramentos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,

    -- Filtros de busca
    termo VARCHAR(255) NOT NULL,  -- "hematologia", "equipamento laboratorial"
    fontes JSON,  -- ["pncp", "comprasnet", "bec"]
    ufs JSON,  -- ["SP", "RJ", "MG"] ou null = todas
    valor_minimo DECIMAL(15, 2),
    valor_maximo DECIMAL(15, 2),

    -- Frequencia
    frequencia_horas INT DEFAULT 4,  -- A cada X horas
    ultimo_check DATETIME,
    proximo_check DATETIME,

    -- Notificacoes
    notificar_email BOOLEAN DEFAULT TRUE,
    notificar_push BOOLEAN DEFAULT TRUE,
    score_minimo_alerta INT DEFAULT 70,  -- Alertar se score >= 70%

    -- Status
    ativo BOOLEAN DEFAULT TRUE,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_monitoramentos_ativo (ativo),
    INDEX idx_monitoramentos_proximo (proximo_check)
);

-- =====================================================
-- TABELA: notificacoes
-- Notificacoes enviadas (historico)
-- =====================================================
CREATE TABLE notificacoes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,

    -- Referencia
    tipo ENUM('alerta_prazo', 'novo_edital', 'alta_aderencia', 'resultado', 'sistema') NOT NULL,
    edital_id INT,
    alerta_id INT,
    monitoramento_id INT,

    -- Conteudo
    titulo VARCHAR(255) NOT NULL,
    mensagem TEXT NOT NULL,
    dados JSON,  -- Dados adicionais em JSON

    -- Canais
    enviado_email BOOLEAN DEFAULT FALSE,
    enviado_push BOOLEAN DEFAULT FALSE,
    enviado_sms BOOLEAN DEFAULT FALSE,

    -- Status
    lida BOOLEAN DEFAULT FALSE,
    lida_em DATETIME,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (edital_id) REFERENCES editais(id),
    FOREIGN KEY (alerta_id) REFERENCES alertas(id),
    FOREIGN KEY (monitoramento_id) REFERENCES monitoramentos(id),
    INDEX idx_notificacoes_user (user_id),
    INDEX idx_notificacoes_lida (lida)
);

-- =====================================================
-- TABELA: preferencias_notificacao
-- Preferencias do usuario para notificacoes
-- =====================================================
CREATE TABLE preferencias_notificacao (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,

    -- Canais habilitados
    email_habilitado BOOLEAN DEFAULT TRUE,
    push_habilitado BOOLEAN DEFAULT TRUE,
    sms_habilitado BOOLEAN DEFAULT FALSE,

    -- Email
    email_notificacao VARCHAR(255),  -- Email alternativo para notificacoes

    -- Horarios permitidos
    horario_inicio TIME DEFAULT '07:00:00',
    horario_fim TIME DEFAULT '22:00:00',
    dias_semana JSON DEFAULT '["seg","ter","qua","qui","sex"]',

    -- Tipos de alerta padrao
    alertas_padrao JSON DEFAULT '[1440, 60, 15]',  -- 24h, 1h, 15min antes

    -- Filtros
    score_minimo_notificacao INT DEFAULT 60,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- =====================================================
-- ALTERACAO na tabela editais (adicionar datas extraidas)
-- =====================================================
ALTER TABLE editais ADD COLUMN data_impugnacao DATETIME;
ALTER TABLE editais ADD COLUMN data_recursos DATETIME;
ALTER TABLE editais ADD COLUMN data_homologacao_prevista DATE;
ALTER TABLE editais ADD COLUMN horario_abertura TIME;
ALTER TABLE editais ADD COLUMN fuso_horario VARCHAR(50) DEFAULT 'America/Sao_Paulo';

-- =====================================================
-- INDICES para performance
-- =====================================================
CREATE INDEX idx_alertas_disparo ON alertas(data_disparo, status);
CREATE INDEX idx_editais_abertura ON editais(data_abertura);
```

### Diagrama de Relacionamentos

```
+------------------+     +------------------+     +------------------+
|      users       |---->|     editais      |<----|     alertas      |
|                  |     |                  |     |                  |
|  - id            |     | - id             |     | - id             |
|  - email         |     | - data_abertura  |     | - tipo           |
+--------+---------+     | - data_impugnacao|     | - data_disparo   |
         |               +------------------+     | - status         |
         |                                        +------------------+
         |
         |               +------------------+     +------------------+
         +-------------->| monitoramentos   |     |   notificacoes   |
                         |                  |     |                  |
                         | - termo          |     | - tipo           |
                         | - frequencia     |     | - titulo         |
                         | - score_minimo   |     | - lida           |
                         +------------------+     +------------------+
```

---

## Funcionalidade 1: Alertas de Prazo por Edital

### Intencao: `configurar_alertas`

### Prompts do Usuario

| Exemplo de Prompt | Dados Extraidos |
|-------------------|-----------------|
| "Configure alertas para o edital PE-001/2026" | edital, alertas padrao |
| "Avise-me 24h antes da abertura do PE-001" | edital, tempo=1440min |
| "Quero ser alertado 1 hora antes do pregao" | edital, tempo=60min |
| "Configure alertas de impugnacao para PE-002" | edital, tipo=impugnacao |
| "Me avise 3 dias, 1 dia e 1 hora antes" | edital, tempos=[4320, 1440, 60] |

### Fluxo Detalhado

```
+-------------------------------------------------------------------------+
| USUARIO: "Configure alertas para o edital PE-001/2026"                  |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| 1. DETECTAR INTENCAO                                                    |
|    Palavras-chave: "configure alertas", "avise", "lembre"               |
|    -> intencao = "configurar_alertas"                                   |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| 2. BUSCAR EDITAL                                                        |
|                                                                         |
|    SELECT * FROM editais                                                |
|    WHERE numero LIKE '%PE-001%'                                         |
|    AND user_id = :user_id                                               |
|                                                                         |
|    Se nao encontrar -> "Edital nao encontrado"                          |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| 3. BUSCAR PREFERENCIAS DO USUARIO                                       |
|                                                                         |
|    SELECT alertas_padrao FROM preferencias_notificacao                  |
|    WHERE user_id = :user_id                                             |
|                                                                         |
|    Padrao: [1440, 60, 15] (24h, 1h, 15min)                              |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| 4. CRIAR ALERTAS                                                        |
|                                                                         |
|    Para cada tempo em alertas_padrao:                                   |
|                                                                         |
|    INSERT INTO alertas (                                                |
|      user_id, edital_id, tipo, data_disparo,                            |
|      tempo_antes_minutos, titulo, mensagem                              |
|    ) VALUES (                                                           |
|      :user_id, :edital_id, 'abertura',                                  |
|      :data_abertura - INTERVAL :tempo MINUTE,                           |
|      :tempo,                                                            |
|      'Alerta: PE-001/2026 abre em 24h',                                 |
|      'O pregao PE-001/2026 tera sua sessao...'                          |
|    )                                                                    |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| 5. RESPOSTA                                                             |
|                                                                         |
|    ## Alertas Configurados - PE-001/2026                                |
|                                                                         |
|    **Edital:** PE-001/2026 - Hospital das Clinicas                      |
|    **Abertura:** 15/02/2026 09:00                                       |
|                                                                         |
|    | Alerta | Data/Hora Disparo | Canal |                               |
|    |--------|-------------------|-------|                               |
|    | 24h antes | 14/02/2026 09:00 | Email, Push |                       |
|    | 1h antes | 15/02/2026 08:00 | Email, Push |                        |
|    | 15min antes | 15/02/2026 08:45 | Push |                            |
|                                                                         |
|    Voce sera notificado em: usuario@empresa.com                         |
+-------------------------------------------------------------------------+
```

### Codigo

```python
# tools.py
def tool_configurar_alertas(message: str, user_id: int, db) -> dict:
    """Configura alertas de prazo para um edital."""

    # 1. Extrair edital e tempos da mensagem
    # Usar LLM ou regex para extrair
    prompt = """Extraia as informacoes desta solicitacao de alerta:

MENSAGEM: "{message}"

Retorne JSON:
{{
    "edital": "numero do edital",
    "tempos_minutos": [1440, 60, 15],  // Lista de tempos em minutos antes do evento
    "tipo": "abertura",  // abertura, impugnacao, recursos, proposta
    "canais": ["email", "push"]  // Canais desejados
}}
"""
    # ... extrair dados ...

    # 2. Buscar edital
    edital = db.query(Edital).filter(
        Edital.numero.ilike(f"%{dados['edital']}%"),
        Edital.user_id == user_id
    ).first()

    if not edital:
        return {"erro": f"Edital '{dados['edital']}' nao encontrado."}

    if not edital.data_abertura:
        return {"erro": "Edital nao possui data de abertura cadastrada."}

    # 3. Buscar preferencias
    prefs = db.query(PreferenciasNotificacao).filter(
        PreferenciasNotificacao.user_id == user_id
    ).first()

    tempos = dados.get("tempos_minutos") or (prefs.alertas_padrao if prefs else [1440, 60, 15])

    # 4. Criar alertas
    alertas_criados = []
    for tempo in tempos:
        data_disparo = edital.data_abertura - timedelta(minutes=tempo)

        # Nao criar alerta se ja passou
        if data_disparo < datetime.now():
            continue

        alerta = Alerta(
            user_id=user_id,
            edital_id=edital.id,
            tipo=dados.get("tipo", "abertura"),
            data_disparo=data_disparo,
            tempo_antes_minutos=tempo,
            canal_email="email" in dados.get("canais", ["email", "push"]),
            canal_push="push" in dados.get("canais", ["email", "push"]),
            titulo=f"Alerta: {edital.numero} abre em {formatar_tempo(tempo)}",
            mensagem=f"O pregao {edital.numero} - {edital.orgao} tera sua sessao de abertura em {formatar_tempo(tempo)}."
        )
        db.add(alerta)
        alertas_criados.append({
            "tempo": tempo,
            "data_disparo": data_disparo,
            "canais": ["email" if alerta.canal_email else None, "push" if alerta.canal_push else None]
        })

    db.commit()

    return {
        "sucesso": True,
        "edital": edital.numero,
        "orgao": edital.orgao,
        "data_abertura": edital.data_abertura,
        "alertas": alertas_criados
    }

def formatar_tempo(minutos: int) -> str:
    """Converte minutos para texto legivel."""
    if minutos >= 1440:
        dias = minutos // 1440
        return f"{dias} dia(s)"
    elif minutos >= 60:
        horas = minutos // 60
        return f"{horas} hora(s)"
    else:
        return f"{minutos} minutos"

# app.py
def processar_configurar_alertas(message: str, user_id: int, db):
    """Processa configuracao de alertas."""
    resultado = tool_configurar_alertas(message, user_id, db)

    if resultado.get("erro"):
        return f"## Erro\n\n{resultado['erro']}"

    resposta = f"## Alertas Configurados - {resultado['edital']}\n\n"
    resposta += f"**Edital:** {resultado['edital']} - {resultado['orgao']}\n"
    resposta += f"**Abertura:** {resultado['data_abertura'].strftime('%d/%m/%Y %H:%M')}\n\n"

    resposta += "| Alerta | Data/Hora Disparo | Canal |\n"
    resposta += "|--------|-------------------|-------|\n"

    for alerta in resultado['alertas']:
        canais = [c for c in alerta['canais'] if c]
        resposta += f"| {formatar_tempo(alerta['tempo'])} antes | "
        resposta += f"{alerta['data_disparo'].strftime('%d/%m/%Y %H:%M')} | "
        resposta += f"{', '.join(canais).title()} |\n"

    return resposta
```

---

## Funcionalidade 2: Dashboard de Contagem Regressiva

### Intencao: `listar_alertas`

### Prompts do Usuario

| Exemplo de Prompt | Acao |
|-------------------|------|
| "Quais alertas tenho configurados?" | Lista todos alertas ativos |
| "Mostre os proximos pregoes" | Lista editais por data de abertura |
| "Quais editais abrem esta semana?" | Filtra por periodo |
| "Timer dos meus editais" | Dashboard com contagem regressiva |

### Fluxo Detalhado

```
+-------------------------------------------------------------------------+
| USUARIO: "Quais alertas tenho configurados?"                            |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| 1. BUSCAR ALERTAS ATIVOS                                                |
|                                                                         |
|    SELECT a.*, e.numero, e.orgao, e.data_abertura                       |
|    FROM alertas a                                                       |
|    JOIN editais e ON a.edital_id = e.id                                 |
|    WHERE a.user_id = :user_id                                           |
|    AND a.status = 'agendado'                                            |
|    AND a.data_disparo >= NOW()                                          |
|    ORDER BY a.data_disparo ASC                                          |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| 2. CALCULAR TEMPO RESTANTE                                              |
|                                                                         |
|    Para cada edital:                                                    |
|    tempo_restante = data_abertura - NOW()                               |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| 3. RESPOSTA                                                             |
|                                                                         |
|    ## Proximos Pregoes                                                  |
|                                                                         |
|    ### PE-001/2026 - Hospital das Clinicas                              |
|    - Abertura: 15/02/2026 09:00                                         |
|    - Tempo restante: 3 dias, 5 horas                                    |
|    - Alertas: 24h antes, 1h antes, 15min antes                          |
|                                                                         |
|    ### PE-003/2026 - UNICAMP                                            |
|    - Abertura: 20/02/2026 14:00                                         |
|    - Tempo restante: 8 dias, 10 horas                                   |
|    - Alertas: 24h antes, 1h antes                                       |
+-------------------------------------------------------------------------+
```

### Codigo

```python
# tools.py
def tool_listar_alertas(user_id: int, db, periodo_dias: int = 30) -> dict:
    """Lista alertas e editais proximos."""

    data_limite = datetime.now() + timedelta(days=periodo_dias)

    # Buscar editais com alertas agendados
    editais_alertas = db.query(Edital, Alerta).join(
        Alerta, Alerta.edital_id == Edital.id
    ).filter(
        Edital.user_id == user_id,
        Alerta.status == 'agendado',
        Alerta.data_disparo <= data_limite
    ).order_by(Edital.data_abertura).all()

    # Agrupar por edital
    editais_dict = {}
    for edital, alerta in editais_alertas:
        if edital.id not in editais_dict:
            editais_dict[edital.id] = {
                "edital": edital,
                "alertas": []
            }
        editais_dict[edital.id]["alertas"].append(alerta)

    # Calcular tempo restante
    resultado = []
    for eid, dados in editais_dict.items():
        edital = dados["edital"]
        tempo_restante = edital.data_abertura - datetime.now()

        resultado.append({
            "numero": edital.numero,
            "orgao": edital.orgao,
            "data_abertura": edital.data_abertura,
            "tempo_restante": tempo_restante,
            "alertas": [
                {
                    "tempo_antes": a.tempo_antes_minutos,
                    "data_disparo": a.data_disparo,
                    "status": a.status
                }
                for a in dados["alertas"]
            ]
        })

    return {"editais": resultado}

def formatar_tempo_restante(td: timedelta) -> str:
    """Formata timedelta para texto legivel."""
    dias = td.days
    horas = td.seconds // 3600
    minutos = (td.seconds % 3600) // 60

    partes = []
    if dias > 0:
        partes.append(f"{dias} dia(s)")
    if horas > 0:
        partes.append(f"{horas} hora(s)")
    if minutos > 0 and dias == 0:
        partes.append(f"{minutos} min")

    return ", ".join(partes) or "menos de 1 minuto"
```

---

## Funcionalidade 3: Extracao Automatica de Datas

### Intencao: `extrair_datas_edital`

### Prompts do Usuario

| Exemplo de Prompt | Acao |
|-------------------|------|
| [Upload PDF] "Extraia as datas deste edital" | Extrai todas as datas |
| "Quando abre o edital PE-001?" | Busca data de abertura |
| "Qual o prazo de impugnacao do PE-002?" | Busca data especifica |
| "Atualize as datas do edital PE-001 com este PDF" | Re-extrai datas |

### Fluxo Detalhado

```
+-------------------------------------------------------------------------+
| USUARIO: [Upload edital.pdf] "Extraia as datas deste edital"            |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| 1. EXTRAIR TEXTO DO PDF                                                 |
|    texto = extrair_texto_pdf(arquivo)                                   |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| 2. ENVIAR PARA LLM                                                      |
|                                                                         |
|    PROMPT_EXTRAIR_DATAS:                                                |
|    "Analise este edital de licitacao e extraia TODAS as datas           |
|     importantes mencionadas.                                            |
|                                                                         |
|     TEXTO: {texto[:6000]}                                               |
|                                                                         |
|     Extraia:                                                            |
|     1. Numero do edital/pregao                                          |
|     2. Data/hora de abertura da sessao                                  |
|     3. Prazo para impugnacao                                            |
|     4. Prazo para recursos                                              |
|     5. Prazo para envio de propostas                                    |
|     6. Data de publicacao                                               |
|     7. Fuso horario (se mencionado)                                     |
|                                                                         |
|     Retorne JSON:                                                       |
|     {                                                                   |
|         'numero': 'PE-001/2026',                                        |
|         'data_abertura': '15/02/2026 09:00',                            |
|         'data_impugnacao': '12/02/2026 18:00',                          |
|         'data_recursos': '17/02/2026 18:00',                            |
|         'data_proposta': '14/02/2026 18:00',                            |
|         'data_publicacao': '01/02/2026',                                |
|         'fuso': 'Brasilia'                                              |
|     }"                                                                  |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| 3. ATUALIZAR EDITAL NO BANCO                                            |
|                                                                         |
|    UPDATE editais SET                                                   |
|      data_abertura = '2026-02-15 09:00:00',                             |
|      data_impugnacao = '2026-02-12 18:00:00',                           |
|      data_recursos = '2026-02-17 18:00:00',                             |
|      data_limite_proposta = '2026-02-14 18:00:00'                        |
|    WHERE numero = 'PE-001/2026'                                         |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| 4. SUGERIR ALERTAS                                                      |
|                                                                         |
|    "Deseja configurar alertas para estas datas?"                        |
+-------------------------------------------------------------------------+
```

### Codigo

```python
# tools.py
PROMPT_EXTRAIR_DATAS = """Analise este edital de licitacao e extraia TODAS as datas importantes.

TEXTO DO EDITAL:
{texto}

INSTRUCOES:
- Converta todas as datas para o formato dd/mm/yyyy HH:MM (se houver horario) ou dd/mm/yyyy (se so data)
- Horarios geralmente estao em horario de Brasilia
- A "sessao publica" ou "abertura" e a data mais importante
- Impugnacao geralmente e 3 dias antes da abertura
- Recursos geralmente e ate 3 dias apos a sessao

Retorne APENAS um JSON valido:
{{
    "numero": "numero do edital (ex: PE-001/2026)",
    "data_publicacao": "dd/mm/yyyy",
    "data_abertura": "dd/mm/yyyy HH:MM",
    "data_impugnacao": "dd/mm/yyyy HH:MM",
    "data_proposta": "dd/mm/yyyy HH:MM",
    "data_recursos": "dd/mm/yyyy HH:MM",
    "fuso": "Brasilia",
    "observacoes": "qualquer observacao relevante sobre prazos"
}}"""

def tool_extrair_datas_edital(arquivo_path: str, user_id: int, db) -> dict:
    """Extrai datas de um edital em PDF."""

    # 1. Extrair texto
    texto = extrair_texto_pdf(arquivo_path)
    if len(texto) < 100:
        return {"erro": "Nao foi possivel extrair texto do PDF."}

    # 2. Chamar LLM
    prompt = PROMPT_EXTRAIR_DATAS.format(texto=texto[:8000])
    resposta = call_deepseek([{"role": "user", "content": prompt}], max_tokens=500)

    try:
        dados = json.loads(extrair_json(resposta))
    except:
        return {"erro": "Nao consegui extrair as datas do edital."}

    # 3. Buscar ou criar edital
    edital = db.query(Edital).filter(
        Edital.numero.ilike(f"%{dados['numero']}%"),
        Edital.user_id == user_id
    ).first()

    atualizado = False
    if edital:
        # Atualizar datas
        if dados.get("data_abertura"):
            edital.data_abertura = parse_data(dados["data_abertura"])
        if dados.get("data_impugnacao"):
            edital.data_impugnacao = parse_data(dados["data_impugnacao"])
        if dados.get("data_proposta"):
            edital.data_limite_proposta = parse_data(dados["data_proposta"])
        if dados.get("data_recursos"):
            edital.data_recursos = parse_data(dados["data_recursos"])
        if dados.get("data_publicacao"):
            edital.data_publicacao = parse_data(dados["data_publicacao"])

        db.commit()
        atualizado = True

    return {
        "sucesso": True,
        "numero": dados.get("numero"),
        "datas": {
            "abertura": dados.get("data_abertura"),
            "impugnacao": dados.get("data_impugnacao"),
            "proposta": dados.get("data_proposta"),
            "recursos": dados.get("data_recursos"),
            "publicacao": dados.get("data_publicacao")
        },
        "edital_atualizado": atualizado,
        "observacoes": dados.get("observacoes")
    }

def parse_data(data_str: str) -> datetime:
    """Converte string de data para datetime."""
    formatos = [
        "%d/%m/%Y %H:%M",
        "%d/%m/%Y %H:%M:%S",
        "%d/%m/%Y",
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d"
    ]
    for fmt in formatos:
        try:
            return datetime.strptime(data_str, fmt)
        except:
            continue
    return None
```

---

## Funcionalidade 4: Monitoramento Automatico de Fontes

### Intencao: `configurar_monitoramento`

### Prompts do Usuario

| Exemplo de Prompt | Acao |
|-------------------|------|
| "Monitore editais de hematologia no PNCP" | Cria monitoramento |
| "Configure busca automatica de equipamentos laboratoriais" | Cria monitoramento |
| "Avise quando houver editais de reagentes em SP" | Monitoramento + filtro UF |
| "Desative o monitoramento de hematologia" | Desativa monitoramento |
| "Quais monitoramentos tenho ativos?" | Lista monitoramentos |

### Fluxo Detalhado

```
+-------------------------------------------------------------------------+
| USUARIO: "Monitore editais de hematologia no PNCP"                      |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| 1. EXTRAIR PARAMETROS                                                   |
|    termo = "hematologia"                                                |
|    fontes = ["pncp"]                                                    |
|    frequencia = 4 horas (padrao)                                        |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| 2. CRIAR MONITORAMENTO                                                  |
|                                                                         |
|    INSERT INTO monitoramentos (                                         |
|      user_id, termo, fontes, frequencia_horas,                          |
|      proximo_check, notificar_email, score_minimo_alerta                |
|    ) VALUES (                                                           |
|      :user_id, 'hematologia', '["pncp"]', 4,                            |
|      NOW() + INTERVAL 4 HOUR, true, 70                                  |
|    )                                                                    |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| 3. EXECUTAR PRIMEIRA BUSCA (opcional)                                   |
|    Buscar editais atuais para mostrar preview                           |
+-------------------------------------------------------------------------+
                                    |
                                    v
+-------------------------------------------------------------------------+
| 4. RESPOSTA                                                             |
|                                                                         |
|    ## Monitoramento Configurado                                         |
|                                                                         |
|    **Termo:** hematologia                                               |
|    **Fontes:** PNCP                                                     |
|    **Frequencia:** A cada 4 horas                                       |
|    **Alertas:** Score >= 70%                                            |
|                                                                         |
|    Voce sera notificado quando novos editais forem encontrados.         |
|    Proximo check: 04/02/2026 16:00                                      |
|                                                                         |
|    **Preview:** Encontrados 5 editais ativos no momento.                |
+-------------------------------------------------------------------------+
```

### Codigo

```python
# tools.py
def tool_configurar_monitoramento(message: str, user_id: int, db) -> dict:
    """Configura monitoramento automatico de editais."""

    # 1. Extrair parametros
    prompt = """Extraia os parametros de monitoramento desta mensagem:

MENSAGEM: "{message}"

Retorne JSON:
{{
    "termo": "termo de busca",
    "fontes": ["pncp", "comprasnet", "bec"],  // ou null = todas
    "ufs": ["SP", "RJ"],  // ou null = todas
    "frequencia_horas": 4,
    "score_minimo": 70,
    "valor_minimo": null,
    "valor_maximo": null
}}"""
    # ... extrair dados ...

    # 2. Verificar se ja existe monitoramento similar
    existente = db.query(Monitoramento).filter(
        Monitoramento.user_id == user_id,
        Monitoramento.termo == dados['termo'],
        Monitoramento.ativo == True
    ).first()

    if existente:
        return {"erro": f"Ja existe monitoramento ativo para '{dados['termo']}'."}

    # 3. Criar monitoramento
    monitoramento = Monitoramento(
        user_id=user_id,
        termo=dados['termo'],
        fontes=json.dumps(dados.get('fontes', ['pncp'])),
        ufs=json.dumps(dados.get('ufs')) if dados.get('ufs') else None,
        frequencia_horas=dados.get('frequencia_horas', 4),
        valor_minimo=dados.get('valor_minimo'),
        valor_maximo=dados.get('valor_maximo'),
        score_minimo_alerta=dados.get('score_minimo', 70),
        proximo_check=datetime.now() + timedelta(hours=dados.get('frequencia_horas', 4)),
        notificar_email=True,
        notificar_push=True
    )
    db.add(monitoramento)
    db.commit()

    return {
        "sucesso": True,
        "id": monitoramento.id,
        "termo": dados['termo'],
        "fontes": dados.get('fontes', ['pncp']),
        "frequencia": dados.get('frequencia_horas', 4),
        "proximo_check": monitoramento.proximo_check,
        "score_minimo": dados.get('score_minimo', 70)
    }

# Scheduler (executar periodicamente)
def job_executar_monitoramentos():
    """Job que executa os monitoramentos agendados."""

    with SessionLocal() as db:
        # Buscar monitoramentos a executar
        agora = datetime.now()
        monitoramentos = db.query(Monitoramento).filter(
            Monitoramento.ativo == True,
            Monitoramento.proximo_check <= agora
        ).all()

        for mon in monitoramentos:
            try:
                # Buscar editais
                fontes = json.loads(mon.fontes) if mon.fontes else ['pncp']
                ufs = json.loads(mon.ufs) if mon.ufs else None

                novos_editais = buscar_editais_fontes(
                    termo=mon.termo,
                    fontes=fontes,
                    ufs=ufs,
                    valor_min=mon.valor_minimo,
                    valor_max=mon.valor_maximo
                )

                # Filtrar editais novos (nao notificados antes)
                editais_novos = []
                for edital in novos_editais:
                    ja_notificado = db.query(Notificacao).filter(
                        Notificacao.user_id == mon.user_id,
                        Notificacao.edital_id == edital.id,
                        Notificacao.tipo == 'novo_edital'
                    ).first()

                    if not ja_notificado:
                        editais_novos.append(edital)

                # Calcular score de aderencia para cada edital
                for edital in editais_novos:
                    score = calcular_score_rapido(edital, mon.user_id, db)

                    if score >= mon.score_minimo_alerta:
                        # Criar notificacao
                        notificacao = Notificacao(
                            user_id=mon.user_id,
                            tipo='novo_edital',
                            edital_id=edital.id,
                            monitoramento_id=mon.id,
                            titulo=f"Novo edital: {edital.numero}",
                            mensagem=f"Encontrado edital de {mon.termo} com {score}% de aderencia.",
                            dados=json.dumps({"score": score, "termo": mon.termo})
                        )
                        db.add(notificacao)

                        # Enviar notificacao
                        if mon.notificar_email:
                            enviar_email_notificacao(mon.user_id, notificacao)
                        if mon.notificar_push:
                            enviar_push_notificacao(mon.user_id, notificacao)

                # Atualizar proximo check
                mon.ultimo_check = agora
                mon.proximo_check = agora + timedelta(hours=mon.frequencia_horas)

            except Exception as e:
                print(f"Erro no monitoramento {mon.id}: {e}")

        db.commit()
```

---

## Funcionalidade 5: Notificacoes por Email

### Intencao: `configurar_notificacoes`

### Prompts do Usuario

| Exemplo de Prompt | Acao |
|-------------------|------|
| "Configure meu email de notificacao" | Configura email |
| "Quero receber alertas em outro@empresa.com" | Muda email |
| "Desative notificacoes por email" | Desativa canal |
| "Configure horario de notificacoes das 8h as 20h" | Define horarios |

### Codigo

```python
# tools.py
def tool_configurar_notificacoes(message: str, user_id: int, db) -> dict:
    """Configura preferencias de notificacao."""

    # Buscar ou criar preferencias
    prefs = db.query(PreferenciasNotificacao).filter(
        PreferenciasNotificacao.user_id == user_id
    ).first()

    if not prefs:
        prefs = PreferenciasNotificacao(user_id=user_id)
        db.add(prefs)

    # Extrair configuracoes da mensagem
    # ... processamento ...

    db.commit()
    return {"sucesso": True, "preferencias": prefs}

# Servico de email
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

def enviar_email_notificacao(user_id: int, notificacao):
    """Envia email de notificacao."""

    # Buscar usuario e preferencias
    user = get_user(user_id)
    prefs = get_preferencias(user_id)

    email_destino = prefs.email_notificacao or user.email

    # Verificar horario permitido
    agora = datetime.now().time()
    if prefs.horario_inicio and prefs.horario_fim:
        if not (prefs.horario_inicio <= agora <= prefs.horario_fim):
            # Agendar para proximo horario permitido
            return agendar_email(email_destino, notificacao)

    # Montar email
    msg = MIMEMultipart('alternative')
    msg['Subject'] = notificacao.titulo
    msg['From'] = 'alertas@editais.com'
    msg['To'] = email_destino

    # Corpo do email
    html = f"""
    <html>
    <body>
        <h2>{notificacao.titulo}</h2>
        <p>{notificacao.mensagem}</p>
        <hr>
        <p><small>Sistema de Alertas de Editais</small></p>
    </body>
    </html>
    """
    msg.attach(MIMEText(html, 'html'))

    # Enviar
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.starttls()
        server.login(SMTP_USER, SMTP_PASS)
        server.send_message(msg)

    notificacao.enviado_email = True
    return True
```

---

## Funcionalidade 6: Calendario de Editais

### Intencao: `ver_calendario`

### Prompts do Usuario

| Exemplo de Prompt | Acao |
|-------------------|------|
| "Mostre o calendario de fevereiro" | Calendario mensal |
| "Quais editais abrem esta semana?" | Visao semanal |
| "Exportar datas para o Google Calendar" | Integracao |

### Codigo

```python
# tools.py
def tool_ver_calendario(user_id: int, db, mes: int = None, ano: int = None) -> dict:
    """Retorna calendario de editais."""

    if not mes:
        mes = datetime.now().month
    if not ano:
        ano = datetime.now().year

    # Inicio e fim do mes
    inicio = datetime(ano, mes, 1)
    if mes == 12:
        fim = datetime(ano + 1, 1, 1)
    else:
        fim = datetime(ano, mes + 1, 1)

    # Buscar editais no periodo
    editais = db.query(Edital).filter(
        Edital.user_id == user_id,
        Edital.data_abertura >= inicio,
        Edital.data_abertura < fim
    ).order_by(Edital.data_abertura).all()

    # Organizar por dia
    calendario = {}
    for edital in editais:
        dia = edital.data_abertura.day
        if dia not in calendario:
            calendario[dia] = []
        calendario[dia].append({
            "numero": edital.numero,
            "orgao": edital.orgao,
            "horario": edital.data_abertura.strftime("%H:%M"),
            "status": edital.status
        })

    return {
        "mes": mes,
        "ano": ano,
        "dias": calendario,
        "total_editais": len(editais)
    }
```

---

## Funcionalidade 7: Alertas de Novos Editais (Alta Aderencia)

### Intencao: `alertas_aderencia`

### Prompts do Usuario

| Exemplo de Prompt | Acao |
|-------------------|------|
| "Avise quando houver edital com aderencia acima de 80%" | Configura alerta |
| "Alerte sobre editais compativeis com Sysmex XN-1000" | Alerta para produto |
| "Quero saber de editais com score alto" | Configura padrao |

---

## Cronograma de Implementacao

### Semana 1: Base de Dados e Alertas Basicos

| Dia | Tarefa |
|-----|--------|
| 1 | Criar tabelas no banco (alertas, monitoramentos, notificacoes, preferencias) |
| 2 | Implementar models SQLAlchemy |
| 3 | Implementar `configurar_alertas` (intencao + tool + processador) |
| 4 | Implementar `listar_alertas` (dashboard) |
| 5 | Implementar job de disparo de alertas |

### Semana 2: Extracao e Monitoramento

| Dia | Tarefa |
|-----|--------|
| 1 | Implementar `extrair_datas_edital` (upload PDF) |
| 2 | Implementar `configurar_monitoramento` |
| 3 | Implementar job de execucao de monitoramentos |
| 4 | Implementar busca em multiplas fontes |
| 5 | Testes e ajustes |

### Semana 3: Notificacoes e Integracao

| Dia | Tarefa |
|-----|--------|
| 1-2 | Implementar sistema de email (SMTP) |
| 3 | Implementar `configurar_notificacoes` |
| 4 | Implementar `ver_calendario` |
| 5 | Testes integrados |

### Semana 4: Frontend e Polimento

| Dia | Tarefa |
|-----|--------|
| 1-2 | Adicionar novos prompts no dropdown do frontend |
| 3 | Dashboard de alertas no frontend |
| 4 | Documentacao e testes finais |
| 5 | Deploy e validacao |

---

## Metricas de Sucesso da Sprint

| Metrica | Meta |
|---------|------|
| Alertas disparados no tempo correto | >= 99% |
| Emails entregues | >= 95% |
| Extracao de datas de PDFs | >= 80% acuracia |
| Monitoramentos executados | >= 99% |
| Editais novos detectados | >= 95% |

---

## Testes da Sprint 2

### Prompts de Teste por Funcionalidade

#### 1. Configurar Alertas
```
Configure alertas para o edital PE-001/2026
Avise-me 24h antes da abertura do PE-001
Me avise 3 dias, 1 dia e 1 hora antes do pregao
Quero alertas de impugnacao do edital PE-002
```

#### 2. Listar Alertas / Dashboard
```
Quais alertas tenho configurados?
Mostre os proximos pregoes
Quais editais abrem esta semana?
Timer dos meus editais
```

#### 3. Extrair Datas
```
[Upload PDF] Extraia as datas deste edital
Quando abre o edital PE-001?
Qual o prazo de impugnacao do PE-002?
```

#### 4. Configurar Monitoramento
```
Monitore editais de hematologia no PNCP
Configure busca automatica de equipamentos laboratoriais
Avise quando houver editais de reagentes em SP
Quais monitoramentos tenho ativos?
Desative o monitoramento de hematologia
```

#### 5. Notificacoes
```
Configure meu email de notificacao para outro@empresa.com
Quero receber alertas apenas das 8h as 18h
Desative notificacoes por email
```

#### 6. Calendario
```
Mostre o calendario de fevereiro
Quais editais abrem esta semana?
Exportar datas para o Google Calendar
```

---

*Documento gerado em: 04/02/2026*
*Sprint 2 - Sistema de Editais - Alertas e Automacao*
