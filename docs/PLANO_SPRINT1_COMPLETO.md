# Plano Sprint 1 - Fundamentos Comerciais (Completo)

## Visão Geral

A Sprint 1 implementa as bases para **inteligência de mercado**: coleta de preços, análise de concorrentes e recomendação de preços competitivos.

### Objetivo Principal
Permitir que o usuário tome decisões de preço baseadas em dados históricos reais.

### Entregáveis

| # | Funcionalidade | Intenção | Prioridade |
|---|----------------|----------|------------|
| 1 | Registrar Resultado de Certame | `registrar_resultado` | 🥇 Alta |
| 2 | Extrair Resultados de Ata (PDF) | `extrair_ata` | 🥇 Alta |
| 3 | Buscar Preços no PNCP | `buscar_precos_pncp` | 🥈 Média |
| 4 | Histórico de Preços | `historico_precos` | 🥈 Média |
| 5 | Lista de Concorrentes | `analisar_concorrentes` | 🥈 Média |
| 6 | Recomendação de Preços | `recomendar_preco` | 🥇 Alta |
| 7 | Classificação de Editais | `classificar_edital` | 🥉 Baixa |
| 8 | Verificar Completude do Produto | `verificar_completude` | 🥉 Baixa |

---

## Arquitetura de Dados

### Novas Tabelas

```sql
-- =====================================================
-- TABELA: categorias_editais
-- Tipos de editais (comodato, venda, aluguel, etc.)
-- =====================================================
CREATE TABLE categorias_editais (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    keywords JSON,  -- ["comodato", "cessão", ...]
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Dados iniciais
INSERT INTO categorias_editais (nome, keywords) VALUES
('Comodato de Equipamentos', '["comodato", "cessão", "cessao", "empréstimo"]'),
('Aluguel com Reagentes', '["locação", "locacao", "aluguel", "reagentes"]'),
('Aluguel Simples', '["locação", "locacao", "aluguel"]'),
('Venda de Equipamentos', '["aquisição", "aquisicao", "compra", "venda"]'),
('Consumo de Reagentes', '["reagentes", "consumíveis", "kits", "testes"]'),
('Insumos Hospitalares', '["material hospitalar", "insumos hospitalares"]'),
('Insumos Laboratoriais', '["material laboratorial", "insumos laboratoriais"]');

-- =====================================================
-- TABELA: concorrentes
-- Empresas que participam de licitações
-- =====================================================
CREATE TABLE concorrentes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    cnpj VARCHAR(20) UNIQUE,
    razao_social VARCHAR(255),
    segmentos JSON,  -- ["hematologia", "bioquímica", ...]
    editais_participados INT DEFAULT 0,
    editais_ganhos INT DEFAULT 0,
    preco_medio DECIMAL(15, 2),
    taxa_vitoria DECIMAL(5, 2),  -- Percentual
    observacoes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA: precos_historicos
-- Preços de editais finalizados
-- =====================================================
CREATE TABLE precos_historicos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    edital_id INT,
    produto_id INT,
    user_id INT,

    -- Valores
    preco_referencia DECIMAL(15, 2),  -- Valor de referência do edital
    preco_vencedor DECIMAL(15, 2),    -- Preço do vencedor
    nosso_preco DECIMAL(15, 2),       -- Nosso preço (se participamos)
    desconto_percentual DECIMAL(5, 2), -- % de desconto sobre referência

    -- Vencedor
    concorrente_id INT,               -- FK para concorrentes
    empresa_vencedora VARCHAR(255),   -- Nome (redundante para busca)
    cnpj_vencedor VARCHAR(20),

    -- Resultado
    resultado ENUM('vitoria', 'derrota', 'cancelado', 'deserto', 'revogado'),
    motivo_perda ENUM('preco', 'tecnica', 'documentacao', 'prazo', 'outro'),

    -- Datas
    data_homologacao DATE,
    data_registro DATETIME DEFAULT CURRENT_TIMESTAMP,

    -- Fonte do dado
    fonte ENUM('manual', 'pncp', 'ata_pdf', 'painel_precos'),

    FOREIGN KEY (edital_id) REFERENCES editais(id),
    FOREIGN KEY (produto_id) REFERENCES produtos(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (concorrente_id) REFERENCES concorrentes(id)
);

-- =====================================================
-- TABELA: participacoes_editais
-- Todos os participantes de cada edital (não só vencedor)
-- =====================================================
CREATE TABLE participacoes_editais (
    id INT PRIMARY KEY AUTO_INCREMENT,
    edital_id INT NOT NULL,
    concorrente_id INT,

    -- Dados da participação
    preco_proposto DECIMAL(15, 2),
    posicao_final INT,  -- 1 = vencedor, 2 = segundo, etc.
    desclassificado BOOLEAN DEFAULT FALSE,
    motivo_desclassificacao TEXT,

    -- Metadados
    fonte ENUM('manual', 'pncp', 'ata_pdf'),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (edital_id) REFERENCES editais(id),
    FOREIGN KEY (concorrente_id) REFERENCES concorrentes(id)
);

-- =====================================================
-- ÍNDICES para performance
-- =====================================================
CREATE INDEX idx_precos_edital ON precos_historicos(edital_id);
CREATE INDEX idx_precos_concorrente ON precos_historicos(concorrente_id);
CREATE INDEX idx_precos_data ON precos_historicos(data_homologacao);
CREATE INDEX idx_participacoes_edital ON participacoes_editais(edital_id);
CREATE INDEX idx_participacoes_concorrente ON participacoes_editais(concorrente_id);

-- =====================================================
-- ALTERAÇÃO na tabela editais (adicionar categoria)
-- =====================================================
ALTER TABLE editais ADD COLUMN categoria_id INT;
ALTER TABLE editais ADD FOREIGN KEY (categoria_id) REFERENCES categorias_editais(id);
```

### Diagrama de Relacionamentos

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     editais     │────▶│precos_historicos│◀────│   concorrentes  │
│                 │     │                 │     │                 │
│ - numero        │     │ - preco_ref     │     │ - nome          │
│ - objeto        │     │ - preco_venc    │     │ - cnpj          │
│ - valor_ref     │     │ - resultado     │     │ - taxa_vitoria  │
│ - categoria_id  │     │ - motivo_perda  │     │ - preco_medio   │
└────────┬────────┘     └─────────────────┘     └────────┬────────┘
         │                                               │
         │              ┌─────────────────┐              │
         └─────────────▶│ participacoes   │◀─────────────┘
                        │   _editais      │
                        │                 │
                        │ - preco_prop    │
                        │ - posicao_final │
                        │ - desclassif    │
                        └─────────────────┘
```

---

## Funcionalidade 1: Registrar Resultado de Certame

### Intenção: `registrar_resultado`

### Prompts do Usuário

| Exemplo de Prompt | Dados Extraídos |
|-------------------|-----------------|
| "Perdemos o PE-001/2026 por preço. Vencedor MedLab R$ 365k" | edital, resultado, vencedor, preço |
| "Ganhamos o edital PE-002/2026 com R$ 290.000" | edital, resultado=vitória, nosso_preço |
| "PE-003 foi cancelado" | edital, resultado=cancelado |
| "O edital PE-004 foi para MedLab por R$ 400k, segundo TechSaúde R$ 412k, terceiro nós com R$ 425k" | múltiplos participantes |
| "Registre derrota no PE-005, perdemos por documentação" | edital, resultado, motivo |

### Fluxo Detalhado

```
┌─────────────────────────────────────────────────────────────────────┐
│ USUÁRIO: "Perdemos o PE-001 para MedLab com R$ 365k, nosso foi 380k"│
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 1. DETECTAR INTENÇÃO (IA ou Fallback)                               │
│                                                                     │
│    Palavras-chave: "perdemos", "ganhamos", "resultado", "vencedor"  │
│    → intencao = "registrar_resultado"                               │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2. EXTRAIR DADOS VIA LLM                                            │
│                                                                     │
│    PROMPT:                                                          │
│    "Extraia os dados deste registro de resultado de licitação:      │
│     Mensagem: '{message}'                                           │
│                                                                     │
│     Retorne JSON:                                                   │
│     {                                                               │
│       'edital': 'PE-001/2026',                                      │
│       'resultado': 'derrota',                                       │
│       'nosso_preco': 380000,                                        │
│       'preco_vencedor': 365000,                                     │
│       'empresa_vencedora': 'MedLab',                                │
│       'motivo': 'preco',                                            │
│       'outros_participantes': []                                    │
│     }"                                                              │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. VALIDAR E BUSCAR EDITAL                                          │
│                                                                     │
│    SELECT * FROM editais                                            │
│    WHERE numero LIKE '%PE-001%'                                     │
│    AND user_id = :user_id                                           │
│                                                                     │
│    Se não encontrar → "❌ Edital não encontrado"                    │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 4. REGISTRAR/ATUALIZAR CONCORRENTE                                  │
│                                                                     │
│    SELECT * FROM concorrentes WHERE nome = 'MedLab'                 │
│                                                                     │
│    Se não existe:                                                   │
│      INSERT INTO concorrentes (nome) VALUES ('MedLab')              │
│                                                                     │
│    UPDATE concorrentes SET                                          │
│      editais_participados = editais_participados + 1,               │
│      editais_ganhos = editais_ganhos + 1,                           │
│      taxa_vitoria = (editais_ganhos / editais_participados) * 100   │
│    WHERE nome = 'MedLab'                                            │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 5. REGISTRAR PREÇO HISTÓRICO                                        │
│                                                                     │
│    INSERT INTO precos_historicos (                                  │
│      edital_id, preco_referencia, preco_vencedor, nosso_preco,      │
│      desconto_percentual, concorrente_id, empresa_vencedora,        │
│      resultado, motivo_perda, fonte                                 │
│    ) VALUES (                                                       │
│      123, 450000, 365000, 380000,                                   │
│      18.9, 45, 'MedLab',                                            │
│      'derrota', 'preco', 'manual'                                   │
│    )                                                                │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 6. REGISTRAR PARTICIPAÇÕES (nossa e do vencedor)                    │
│                                                                     │
│    INSERT INTO participacoes_editais                                │
│      (edital_id, concorrente_id, preco_proposto, posicao_final)     │
│    VALUES                                                           │
│      (123, 45, 365000, 1),  -- MedLab (vencedor)                    │
│      (123, NULL, 380000, 2) -- Nós (segundo lugar)                  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 7. ATUALIZAR STATUS DO EDITAL                                       │
│                                                                     │
│    UPDATE editais SET status = 'perdido' WHERE id = 123             │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 8. RESPOSTA                                                         │
│                                                                     │
│    📊 **Resultado Registrado - PE-001/2026:**                       │
│                                                                     │
│    **Resultado:** DERROTA                                           │
│    **Causa:** Preço                                                 │
│                                                                     │
│    | Posição | Empresa    | Preço       |                           │
│    |---------|------------|-------------|                           │
│    | 1º      | MedLab     | R$ 365.000  |                           │
│    | 2º      | Sua Empresa| R$ 380.000  |                           │
│                                                                     │
│    **Análise:**                                                     │
│    - Diferença: R$ 15.000 (4,1%)                                    │
│    - Desconto do vencedor: 18,9% sobre referência                   │
│    - Nosso desconto: 15,6% sobre referência                         │
│                                                                     │
│    💡 **Insight:** Para ganhar, precisaríamos de preço ~3% menor    │
└─────────────────────────────────────────────────────────────────────┘
```

### Código

```python
# app.py - Adicionar na detecção de intenções
# Em PROMPT_CLASSIFICAR_INTENCAO:
"""
20. **registrar_resultado**: Registrar resultado de certame (vitória/derrota)
    Exemplos: "perdemos o edital X", "ganhamos o PE-001", "vencedor foi empresa Y"
    Palavras-chave: perdemos, ganhamos, resultado, vencedor, derrota, vitória
"""

# Em detectar_intencao_fallback():
def detectar_intencao_fallback(message: str) -> str:
    msg = message.lower()

    # Registrar resultado
    if any(p in msg for p in ["perdemos", "ganhamos", "vencedor foi", "resultado do edital",
                               "derrota", "vitória", "vitoria", "segundo lugar", "cancelado"]):
        return "registrar_resultado"
    # ... resto do código

# tools.py
PROMPT_EXTRAIR_RESULTADO = """Extraia os dados deste registro de resultado de licitação.

MENSAGEM DO USUÁRIO:
"{message}"

IMPORTANTE:
- Valores monetários: converta "365k" para 365000, "R$ 1.2M" para 1200000
- Se o usuário mencionar que "perdemos" ou "não ganhamos", o resultado é "derrota"
- Se mencionar "ganhamos" ou "vencemos", o resultado é "vitoria"
- Identifique todos os participantes mencionados com suas posições

Retorne APENAS um JSON válido:
{{
    "edital": "número do edital (ex: PE-001/2026)",
    "resultado": "vitoria|derrota|cancelado|deserto|revogado",
    "nosso_preco": número ou null,
    "preco_vencedor": número ou null,
    "empresa_vencedora": "nome da empresa" ou null,
    "cnpj_vencedor": "cnpj" ou null,
    "motivo": "preco|tecnica|documentacao|prazo|outro" ou null,
    "outros_participantes": [
        {{"empresa": "nome", "preco": número, "posicao": número}},
        ...
    ]
}}"""

def tool_registrar_resultado(message: str, user_id: int, db) -> dict:
    """Registra resultado de certame e alimenta base de preços."""

    # 1. Extrair dados via LLM
    prompt = PROMPT_EXTRAIR_RESULTADO.format(message=message)
    resposta = call_deepseek([{"role": "user", "content": prompt}], max_tokens=500)

    try:
        dados = json.loads(extrair_json(resposta))
    except:
        return {"erro": "Não consegui entender os dados. Tente: 'Perdemos o PE-001 para Empresa X com R$ 100.000'"}

    # 2. Buscar edital
    edital = db.query(Edital).filter(
        Edital.numero.ilike(f"%{dados['edital']}%"),
        Edital.user_id == user_id
    ).first()

    if not edital:
        return {"erro": f"Edital '{dados['edital']}' não encontrado no seu cadastro."}

    # 3. Registrar/atualizar concorrente vencedor
    concorrente_id = None
    if dados.get("empresa_vencedora") and dados["resultado"] != "vitoria":
        concorrente = db.query(Concorrente).filter(
            Concorrente.nome.ilike(f"%{dados['empresa_vencedora']}%")
        ).first()

        if not concorrente:
            concorrente = Concorrente(
                nome=dados["empresa_vencedora"],
                cnpj=dados.get("cnpj_vencedor")
            )
            db.add(concorrente)
            db.flush()

        concorrente.editais_participados += 1
        concorrente.editais_ganhos += 1
        concorrente_id = concorrente.id

    # 4. Calcular desconto
    desconto = None
    if edital.valor_referencia and dados.get("preco_vencedor"):
        desconto = ((edital.valor_referencia - dados["preco_vencedor"]) / edital.valor_referencia) * 100

    # 5. Registrar preço histórico
    preco_hist = PrecoHistorico(
        edital_id=edital.id,
        user_id=user_id,
        preco_referencia=edital.valor_referencia,
        preco_vencedor=dados.get("preco_vencedor"),
        nosso_preco=dados.get("nosso_preco"),
        desconto_percentual=desconto,
        concorrente_id=concorrente_id,
        empresa_vencedora=dados.get("empresa_vencedora"),
        cnpj_vencedor=dados.get("cnpj_vencedor"),
        resultado=dados["resultado"],
        motivo_perda=dados.get("motivo"),
        data_homologacao=datetime.now().date(),
        fonte="manual"
    )
    db.add(preco_hist)

    # 6. Registrar participações
    # Vencedor
    if concorrente_id and dados.get("preco_vencedor"):
        part_vencedor = ParticipacaoEdital(
            edital_id=edital.id,
            concorrente_id=concorrente_id,
            preco_proposto=dados["preco_vencedor"],
            posicao_final=1,
            fonte="manual"
        )
        db.add(part_vencedor)

    # Nossa participação
    if dados.get("nosso_preco"):
        nossa_posicao = 1 if dados["resultado"] == "vitoria" else 2
        part_nossa = ParticipacaoEdital(
            edital_id=edital.id,
            concorrente_id=None,  # Nós mesmos
            preco_proposto=dados["nosso_preco"],
            posicao_final=nossa_posicao,
            fonte="manual"
        )
        db.add(part_nossa)

    # Outros participantes
    for part in dados.get("outros_participantes", []):
        # Buscar ou criar concorrente
        conc = db.query(Concorrente).filter(
            Concorrente.nome.ilike(f"%{part['empresa']}%")
        ).first()
        if not conc:
            conc = Concorrente(nome=part["empresa"])
            db.add(conc)
            db.flush()

        conc.editais_participados += 1

        part_edital = ParticipacaoEdital(
            edital_id=edital.id,
            concorrente_id=conc.id,
            preco_proposto=part.get("preco"),
            posicao_final=part.get("posicao"),
            fonte="manual"
        )
        db.add(part_edital)

    # 7. Atualizar status do edital
    if dados["resultado"] == "vitoria":
        edital.status = "ganho"
    elif dados["resultado"] == "derrota":
        edital.status = "perdido"
    elif dados["resultado"] in ["cancelado", "revogado", "deserto"]:
        edital.status = dados["resultado"]

    db.commit()

    return {
        "sucesso": True,
        "edital": edital.numero,
        "resultado": dados["resultado"],
        "preco_vencedor": dados.get("preco_vencedor"),
        "nosso_preco": dados.get("nosso_preco"),
        "vencedor": dados.get("empresa_vencedora"),
        "desconto": desconto,
        "diferenca": abs(dados.get("nosso_preco", 0) - dados.get("preco_vencedor", 0)) if dados.get("nosso_preco") and dados.get("preco_vencedor") else None
    }

# app.py
def processar_registrar_resultado(message: str, user_id: int, db):
    """Processa registro de resultado de certame."""
    resultado = tool_registrar_resultado(message, user_id, db)

    if resultado.get("erro"):
        return f"❌ {resultado['erro']}"

    # Formatar resposta
    emoji_resultado = "🏆" if resultado["resultado"] == "vitoria" else "📊"
    status_texto = {
        "vitoria": "VITÓRIA",
        "derrota": "DERROTA",
        "cancelado": "CANCELADO",
        "deserto": "DESERTO",
        "revogado": "REVOGADO"
    }.get(resultado["resultado"], resultado["resultado"].upper())

    resposta = f"{emoji_resultado} **Resultado Registrado - {resultado['edital']}:**\n\n"
    resposta += f"**Resultado:** {status_texto}\n\n"

    if resultado.get("preco_vencedor") or resultado.get("nosso_preco"):
        resposta += "| Posição | Empresa | Preço |\n"
        resposta += "|---------|---------|-------|\n"

        if resultado.get("vencedor") and resultado["resultado"] != "vitoria":
            resposta += f"| 1º | {resultado['vencedor']} | R$ {resultado['preco_vencedor']:,.2f} |\n"

        if resultado.get("nosso_preco"):
            pos = "1º" if resultado["resultado"] == "vitoria" else "2º"
            resposta += f"| {pos} | Sua Empresa | R$ {resultado['nosso_preco']:,.2f} |\n"

        resposta += "\n"

    if resultado.get("diferenca") and resultado["resultado"] == "derrota":
        pct = (resultado["diferenca"] / resultado["nosso_preco"]) * 100
        resposta += f"**Análise:**\n"
        resposta += f"- Diferença: R$ {resultado['diferenca']:,.2f} ({pct:.1f}%)\n"
        if resultado.get("desconto"):
            resposta += f"- Desconto do vencedor: {resultado['desconto']:.1f}%\n"
        resposta += f"\n💡 **Insight:** Para editais similares, considere preços ~{pct:.0f}% menores\n"

    return resposta
```

---

## Funcionalidade 2: Extrair Resultados de Ata (PDF)

### Intenção: `extrair_ata`

### Prompts do Usuário

| Exemplo de Prompt | Ação |
|-------------------|------|
| [Upload ata.pdf] "Extraia os resultados desta ata" | Extrai vencedores e preços |
| [Upload ata.pdf] "Quem ganhou este pregão?" | Extrai vencedor |
| [Upload ata.pdf] "Registre os resultados" | Extrai e salva no banco |

### Fluxo Detalhado

```
┌─────────────────────────────────────────────────────────────────────┐
│ USUÁRIO: [Upload ATA_PE001.pdf] "Extraia os resultados"             │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 1. DETECTAR INTENÇÃO                                                │
│    tem_arquivo = True                                               │
│    Palavras: "extraia", "resultados", "ata"                         │
│    → intencao = "extrair_ata"                                       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2. EXTRAIR TEXTO DO PDF                                             │
│                                                                     │
│    texto = extrair_texto_pdf(arquivo)                               │
│    # Pode usar PyMuPDF, pdfplumber, etc.                            │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. ENVIAR PARA LLM COM PROMPT ESPECIALIZADO                         │
│                                                                     │
│    PROMPT_EXTRAIR_ATA:                                              │
│    "Analise esta ata de sessão de pregão eletrônico.                │
│                                                                     │
│     TEXTO DA ATA:                                                   │
│     {texto_ata[:8000]}                                              │
│                                                                     │
│     Extraia para CADA ITEM/LOTE:                                    │
│     1. Número do item                                               │
│     2. Descrição                                                    │
│     3. Empresa vencedora                                            │
│     4. CNPJ do vencedor                                             │
│     5. Preço vencedor                                               │
│     6. Lista de participantes com lances                            │
│                                                                     │
│     Retorne JSON: {...}"                                            │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 4. PROCESSAR RESULTADO                                              │
│                                                                     │
│    Para cada item extraído:                                         │
│    - Identificar edital correspondente no banco                     │
│    - Registrar vencedor e preço                                     │
│    - Registrar todos os participantes                               │
│    - Atualizar concorrentes                                         │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 5. RESPOSTA                                                         │
│                                                                     │
│    📄 **Resultados Extraídos da Ata:**                              │
│                                                                     │
│    **Edital:** PE-001/2026 - Hospital das Clínicas                  │
│    **Data da Sessão:** 15/02/2026                                   │
│                                                                     │
│    **Item 1 - Analisador Hematológico:**                            │
│    | Pos | Empresa      | Lance Final |                             │
│    |-----|--------------|-------------|                             │
│    | 1º  | MedLab       | R$ 365.000  |                             │
│    | 2º  | TechSaúde    | R$ 372.000  |                             │
│    | 3º  | DiagnósticaBR| R$ 385.000  |                             │
│                                                                     │
│    ✅ Dados salvos no histórico de preços!                          │
└─────────────────────────────────────────────────────────────────────┘
```

### Código

```python
# tools.py
PROMPT_EXTRAIR_ATA = """Analise esta ata de sessão de pregão eletrônico e extraia TODOS os dados.

TEXTO DA ATA:
{texto_ata}

EXTRAIA:

1. **Dados Gerais:**
   - Número do edital/pregão
   - Órgão
   - Data da sessão

2. **Para CADA ITEM/LOTE:**
   - Número do item
   - Descrição do objeto
   - Empresa vencedora
   - CNPJ do vencedor (se disponível)
   - Valor/preço vencedor
   - TODOS os participantes com seus lances finais

3. **Empresas Desclassificadas:**
   - Nome da empresa
   - Motivo da desclassificação

Retorne APENAS um JSON válido:
{{
    "edital": "número do pregão/edital",
    "orgao": "nome do órgão",
    "data_sessao": "dd/mm/yyyy",
    "itens": [
        {{
            "item": 1,
            "descricao": "descrição do objeto",
            "vencedor": "nome da empresa",
            "cnpj_vencedor": "XX.XXX.XXX/XXXX-XX ou null",
            "preco_vencedor": 123456.78,
            "participantes": [
                {{"empresa": "nome", "cnpj": "...", "lance_final": 123456.78, "posicao": 1}},
                {{"empresa": "nome", "cnpj": "...", "lance_final": 130000.00, "posicao": 2}}
            ]
        }}
    ],
    "desclassificados": [
        {{"empresa": "nome", "motivo": "motivo da desclassificação"}}
    ]
}}"""

def tool_extrair_ata_pdf(arquivo_path: str, user_id: int, db) -> dict:
    """Extrai resultados de uma ata de sessão de pregão."""

    # 1. Extrair texto do PDF
    texto = extrair_texto_pdf(arquivo_path)

    if len(texto) < 100:
        return {"erro": "Não foi possível extrair texto do PDF. Verifique se é uma ata de sessão."}

    # 2. Limitar texto para não estourar contexto
    texto_truncado = texto[:12000]  # ~3000 tokens

    # 3. Enviar para LLM
    prompt = PROMPT_EXTRAIR_ATA.format(texto_ata=texto_truncado)
    resposta = call_deepseek([{"role": "user", "content": prompt}], max_tokens=2000)

    try:
        dados = json.loads(extrair_json(resposta))
    except:
        return {"erro": "Não consegui extrair dados estruturados da ata."}

    # 4. Processar cada item
    itens_processados = []
    for item in dados.get("itens", []):
        # Buscar edital correspondente
        edital = db.query(Edital).filter(
            Edital.numero.ilike(f"%{dados['edital']}%"),
            Edital.user_id == user_id
        ).first()

        if edital:
            # Registrar preço histórico
            preco_hist = PrecoHistorico(
                edital_id=edital.id,
                user_id=user_id,
                preco_vencedor=item.get("preco_vencedor"),
                empresa_vencedora=item.get("vencedor"),
                cnpj_vencedor=item.get("cnpj_vencedor"),
                resultado="derrota",  # Se estamos extraindo ata, provavelmente não ganhamos
                data_homologacao=datetime.strptime(dados.get("data_sessao", ""), "%d/%m/%Y").date() if dados.get("data_sessao") else None,
                fonte="ata_pdf"
            )
            db.add(preco_hist)

            # Registrar participantes
            for part in item.get("participantes", []):
                # Buscar ou criar concorrente
                conc = db.query(Concorrente).filter(
                    Concorrente.nome.ilike(f"%{part['empresa']}%")
                ).first()

                if not conc:
                    conc = Concorrente(
                        nome=part["empresa"],
                        cnpj=part.get("cnpj")
                    )
                    db.add(conc)
                    db.flush()

                conc.editais_participados += 1
                if part.get("posicao") == 1:
                    conc.editais_ganhos += 1

                part_edital = ParticipacaoEdital(
                    edital_id=edital.id,
                    concorrente_id=conc.id,
                    preco_proposto=part.get("lance_final"),
                    posicao_final=part.get("posicao"),
                    fonte="ata_pdf"
                )
                db.add(part_edital)

        itens_processados.append(item)

    # Registrar desclassificados
    for desc in dados.get("desclassificados", []):
        conc = db.query(Concorrente).filter(
            Concorrente.nome.ilike(f"%{desc['empresa']}%")
        ).first()

        if conc and edital:
            part_edital = ParticipacaoEdital(
                edital_id=edital.id,
                concorrente_id=conc.id,
                desclassificado=True,
                motivo_desclassificacao=desc.get("motivo"),
                fonte="ata_pdf"
            )
            db.add(part_edital)

    db.commit()

    return {
        "sucesso": True,
        "edital": dados.get("edital"),
        "orgao": dados.get("orgao"),
        "data_sessao": dados.get("data_sessao"),
        "itens": itens_processados,
        "desclassificados": dados.get("desclassificados", [])
    }
```

---

## Funcionalidade 3: Buscar Preços no PNCP (Automático)

### Intenção: `buscar_precos_pncp` (pode ser job agendado ou sob demanda)

### Fluxo

```
┌─────────────────────────────────────────────────────────────────────┐
│ TRIGGER: Job agendado (diário) ou usuário pede                      │
│          "Busque preços de hematologia no PNCP"                     │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 1. CHAMAR API PNCP - CONTRATOS                                      │
│                                                                     │
│    GET https://pncp.gov.br/api/consulta/v1/contratos                │
│    ?q=hematologia                                                   │
│    &dataInicial=2025-02-01                                          │
│    &dataFinal=2026-02-01                                            │
│    &pagina=1                                                        │
│    &tamanhoPagina=50                                                │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 2. PROCESSAR CONTRATOS                                              │
│                                                                     │
│    Para cada contrato:                                              │
│    - Verificar se já existe no banco (evitar duplicatas)            │
│    - Extrair: valor, fornecedor, CNPJ, objeto                       │
│    - Registrar em precos_historicos                                 │
│    - Atualizar concorrente                                          │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 3. CHAMAR API PNCP - ATAS DE REGISTRO DE PREÇO                      │
│                                                                     │
│    GET https://pncp.gov.br/api/consulta/v1/atas                     │
│    (preços unitários por item)                                      │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│ 4. RESPOSTA (se sob demanda)                                        │
│                                                                     │
│    📥 **Preços Importados do PNCP:**                                │
│                                                                     │
│    Encontrados: 45 contratos de hematologia                         │
│    Novos registrados: 32                                            │
│    Já existentes: 13                                                │
│                                                                     │
│    **Faixa de Preços:**                                             │
│    - Mínimo: R$ 285.000                                             │
│    - Médio: R$ 372.000                                              │
│    - Máximo: R$ 485.000                                             │
└─────────────────────────────────────────────────────────────────────┘
```

### Código

```python
# tools.py
def tool_buscar_precos_pncp(termo: str, meses: int = 12, db=None) -> dict:
    """Busca contratos e atas no PNCP para alimentar base de preços."""

    data_inicio = (datetime.now() - timedelta(days=meses * 30)).strftime("%Y-%m-%d")
    data_fim = datetime.now().strftime("%Y-%m-%d")

    # 1. Buscar contratos
    url_contratos = "https://pncp.gov.br/api/consulta/v1/contratos"
    params = {
        "q": termo,
        "dataInicial": data_inicio,
        "dataFinal": data_fim,
        "pagina": 1,
        "tamanhoPagina": 100
    }

    try:
        response = requests.get(url_contratos, params=params, timeout=30)
        contratos = response.json().get("data", [])
    except Exception as e:
        return {"erro": f"Falha ao acessar PNCP: {str(e)}"}

    novos = 0
    existentes = 0
    precos = []

    for c in contratos:
        # Verificar se já existe
        existente = db.query(PrecoHistorico).filter(
            PrecoHistorico.empresa_vencedora == c.get("nomeRazaoSocialFornecedor"),
            PrecoHistorico.preco_vencedor == c.get("valorInicial")
        ).first()

        if existente:
            existentes += 1
            continue

        # Buscar ou criar concorrente
        fornecedor = c.get("nomeRazaoSocialFornecedor")
        cnpj = c.get("cnpjCpfFornecedor")

        conc = db.query(Concorrente).filter(
            Concorrente.cnpj == cnpj
        ).first() if cnpj else None

        if not conc and fornecedor:
            conc = Concorrente(nome=fornecedor, cnpj=cnpj)
            db.add(conc)
            db.flush()

        # Registrar preço
        preco_hist = PrecoHistorico(
            preco_vencedor=c.get("valorInicial"),
            empresa_vencedora=fornecedor,
            cnpj_vencedor=cnpj,
            concorrente_id=conc.id if conc else None,
            data_homologacao=datetime.strptime(c.get("dataAssinatura"), "%Y-%m-%d").date() if c.get("dataAssinatura") else None,
            resultado="vitoria",  # É o vencedor do contrato
            fonte="pncp"
        )
        db.add(preco_hist)

        if conc:
            conc.editais_participados += 1
            conc.editais_ganhos += 1

        precos.append(c.get("valorInicial", 0))
        novos += 1

    db.commit()

    return {
        "sucesso": True,
        "termo": termo,
        "total_encontrados": len(contratos),
        "novos_registrados": novos,
        "ja_existentes": existentes,
        "preco_minimo": min(precos) if precos else None,
        "preco_medio": sum(precos) / len(precos) if precos else None,
        "preco_maximo": max(precos) if precos else None
    }
```

---

## Funcionalidades 4-6: Histórico, Concorrentes, Recomendação

(Já detalhadas no documento `implementacao_sprint1.md`)

---

## Cronograma de Implementação

### Semana 1: Base de Dados e Registro Manual

| Dia | Tarefa |
|-----|--------|
| 1 | Criar tabelas no banco (categorias, concorrentes, precos_historicos, participacoes) |
| 2 | Implementar models SQLAlchemy |
| 3 | Implementar `registrar_resultado` (intenção + tool + processador) |
| 4 | Testar registro manual com vários formatos de prompt |
| 5 | Ajustes e refinamentos |

### Semana 2: Extração Automática

| Dia | Tarefa |
|-----|--------|
| 1 | Implementar `extrair_ata` (upload de PDF de ata) |
| 2 | Implementar `buscar_precos_pncp` (API contratos) |
| 3 | Implementar job agendado para busca automática PNCP |
| 4 | Implementar `historico_precos` |
| 5 | Implementar `analisar_concorrentes` |

### Semana 3: Inteligência e Classificação

| Dia | Tarefa |
|-----|--------|
| 1-2 | Implementar `recomendar_preco` com análise LLM |
| 3 | Implementar `classificar_edital` (keyword + IA) |
| 4 | Implementar `verificar_completude` |
| 5 | Testes integrados e ajustes |

### Semana 4: Frontend e Polimento

| Dia | Tarefa |
|-----|--------|
| 1-2 | Adicionar novos prompts no dropdown do frontend |
| 3 | Melhorar formatação das respostas |
| 4 | Documentação e testes finais |
| 5 | Deploy e validação |

---

## Métricas de Sucesso da Sprint

| Métrica | Meta |
|---------|------|
| Registros de resultado via chat | Funcional com 95% de acurácia na extração |
| Extração de atas PDF | Funcional com 80% de acurácia |
| Integração PNCP | Buscando e importando contratos |
| Recomendação de preços | Gerando faixas baseadas em histórico |
| Classificação de editais | 85% de acurácia no keyword, 95% com IA |

---

*Documento gerado em: 03/02/2026*
*Sprint 1 - Sistema de Editais - Fase 2*
