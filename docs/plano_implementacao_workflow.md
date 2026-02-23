# Plano de Implementação: Aderência Total ao WORKFLOW SISTEMA.pdf (pgs 2-10)

**Data:** 2026-02-19
**Referência:** docs/analise_gap_workflow.md (v2)
**Objetivo:** Fechar os 15 gaps identificados para atingir 100% de aderência

---

## RESUMO DOS GAPS A IMPLEMENTAR

### Categoria A — Frontend/Visual (6 gaps)

| ID | Descrição | Módulo | Arquivos |
|---|---|---|---|
| **G1** | Score Técnica/Comercial em gauge circular (não barra) | Captação | CaptacaoPage.tsx, ScoreBar.tsx |
| **G2** | Score Recomendação com estrelas (4.5/5) | Captação | CaptacaoPage.tsx, novo StarRating.tsx |
| **G3** | Tooltip de Análise de Gaps ao hover do score na tabela | Captação | CaptacaoPage.tsx |
| **G4** | Labels High/Medium/Low nas 6 barras de dimensão | Validação | ValidacaoPage.tsx, ScoreBar.tsx |
| **G5** | Mapa Logístico visual com estimativa de entrega | Validação | ValidacaoPage.tsx |
| **G6** | Processo Amanda — view/seção de pastas organizadas por edital | Validação | ValidacaoPage.tsx |

### Categoria B — Integração Backend↔Frontend (6 gaps)

| ID | Descrição | Módulo | Arquivos |
|---|---|---|---|
| **G7** | Upload real de arquivo da EmpresaPage (persistir no disco) | Empresa | EmpresaPage.tsx, app.py (nova rota) |
| **G8** | Scheduler/cron para execução automática de monitoramento | Captação | backend/scheduler.py (novo) |
| **G9** | Notificação real por email | Captação | backend/notifications.py (novo) |
| **G10** | Usar porte/regime_tributario da empresa na validação | Validação | tools.py (PROMPT_SCORES_VALIDACAO) |
| **G11** | Gerar classes/subclasses via IA (habilitar botão) | Parametrizações | ParametrizacoesPage.tsx, app.py |
| **G12** | Vincular documento da empresa a item do edital (FK) | Validação | models.py, ValidacaoPage.tsx |

### Categoria C — Fontes Externas (3 gaps)

| ID | Descrição | Módulo | Arquivos |
|---|---|---|---|
| **G13** | SICONV como fonte de busca | Captação | tools.py |
| **G14** | Busca automática de certidões (portais CND/FGTS) | Empresa | tools.py, EmpresaPage.tsx |
| **G15** | Botões "Varia por Produto/Região" na margem | Captação | CaptacaoPage.tsx |

---

## ESTRUTURA DO AGENT TEAM

```
team-lead (coordenador)
├── agent-frontend     → G1, G2, G3, G4, G5, G6, G15
├── agent-backend      → G7, G8, G9, G10, G11, G12, G13, G14
└── agent-tester       → Gera documento de teste completo (WORKFLOW pgs 2-10)
```

**3 agentes** trabalhando em paralelo:
- **agent-frontend**: Todos os gaps visuais/UI (7 tarefas)
- **agent-backend**: Todos os gaps de backend/integração (8 tarefas)
- **agent-tester**: Produz o documento de teste cobrindo TUDO do WORKFLOW

---

## TAREFAS DETALHADAS

### agent-frontend (7 tarefas)

#### F1: Gauge circular para Score Técnica/Comercial (G1)
**Arquivo:** `frontend/src/pages/CaptacaoPage.tsx`
**O que fazer:**
- No painel lateral (linhas ~700-702), substituir os 2 `ScoreBar` de "Técnico" e "Comercial" por `ScoreCircle` (componente que já existe em ScoreBar.tsx)
- Usar tamanho 60px para os gauges no painel
- Manter as cores: >=80 verde, 50-79 amarelo, <50 vermelho
- Label dentro do círculo: "90%" / "75%"
- Label abaixo: "Aderência Técnica" / "Aderência Comercial"

#### F2: Estrelas para Score Recomendação (G2)
**Arquivo:** `frontend/src/components/FormField.tsx` (ou novo `StarRating.tsx`)
**O que fazer:**
- Criar componente `StarRating` que converte score 0-100 para escala 0-5 estrelas (score/20)
- Renderizar 5 estrelas SVG (cheias, metade, vazias)
- Exibir valor numérico ao lado: "4.5/5"
- Cor: dourado (#eab308)
- Substituir o ScoreBar de "Recomendação" no painel lateral da CaptacaoPage por StarRating

#### F3: Tooltip de Gaps no hover do score (G3)
**Arquivo:** `frontend/src/pages/CaptacaoPage.tsx`
**O que fazer:**
- Na coluna Score da tabela (linha ~483), ao hover sobre o ScoreCircle, mostrar tooltip com:
  - "Análise de Gaps" como título
  - Lista dos gaps do edital (se houver): "- Requisito X: não atendido", "- Certificação Y: pendente"
  - Se não houver gaps: "Todos os requisitos atendidos"
- Usar CSS `position: absolute` com z-index alto
- Tooltip aparece ao mouseenter, desaparece ao mouseleave

#### F4: Labels High/Medium/Low nas 6 barras (G4)
**Arquivo:** `frontend/src/components/ScoreBar.tsx` + `ValidacaoPage.tsx`
**O que fazer:**
- No componente ScoreBar, adicionar prop opcional `showLevel?: boolean`
- Quando `showLevel=true`:
  - Score >= 70: label "(High)" em verde
  - Score 40-69: label "(Medium)" em amarelo
  - Score < 40: label "(Low)" em vermelho
- Aplicar na ValidacaoPage nas 6 barras do dashboard (linhas ~872-879)

#### F5: Mapa Logístico visual (G5)
**Arquivo:** `frontend/src/pages/ValidacaoPage.tsx`
**O que fazer:**
- Na aba Objetiva, após o Checklist Documentos, adicionar seção "Mapa Logístico"
- Exibir:
  - UF do edital vs UF da empresa (extraída de `empresa.uf`)
  - "Entrega Estimada: X dias" (baseado em `score_logistico` e parametrizações de prazo)
  - Ícone de localização + badge de distância (Próximo/Médio/Distante)
- Não precisa de mapa geográfico real — basta indicador visual de proximidade

#### F6: Processo Amanda — Seção de pastas por edital (G6)
**Arquivo:** `frontend/src/pages/ValidacaoPage.tsx`
**O que fazer:**
- Adicionar nova seção (ou sub-aba) "Documentação" dentro da ValidacaoPage
- Quando um edital é selecionado, mostrar 3 "pastas" organizadas:
  1. **Documentos da Empresa** — puxa de `empresa_documentos` (contrato_social, procuracao)
  2. **Documentos Fiscais e Certidões** — puxa de `empresa_certidoes` (CND, FGTS, Trabalhista)
  3. **Qualificação Técnica** — puxa de `produtos_documentos` (certificado_anvisa, qualificacao_tecnica)
- Cada pasta mostra: nome do doc, status (OK/Vencido/Faltando), validade
- Comparar com requisitos documentais do edital (`edital_requisitos` tipo=documental)
- Marcar: "Exigido pelo edital" vs "Disponível" vs "Faltante"
- Backend: criar endpoint `GET /api/editais/{id}/documentacao-necessaria` que cruza requisitos do edital com documentos da empresa

#### F7: Botões "Varia por Produto/Região" (G15)
**Arquivo:** `frontend/src/pages/CaptacaoPage.tsx`
**O que fazer:**
- Abaixo do slider de Expectativa de Margem, adicionar 2 botões toggle:
  - "Varia por Produto" — quando ativo, mostrar dropdown de produtos com margem individual
  - "Varia por Região" — quando ativo, mostrar dropdown de UFs com margem por região
- Persistir via CRUD `estrategias-editais` campos adicionais

---

### agent-backend (8 tarefas)

#### B1: Upload real de arquivo na EmpresaPage (G7)
**Arquivos:** `backend/app.py`, `frontend/src/pages/EmpresaPage.tsx`
**O que fazer:**
- Backend: criar rota `POST /api/empresa-documentos/upload` que:
  - Recebe arquivo via multipart/form-data
  - Salva em `UPLOAD_FOLDER/empresa/{empresa_id}/{tipo}/`
  - Atualiza `path_arquivo` no registro `EmpresaDocumento`
  - Retorna path para acesso
- Frontend: no modal de upload da EmpresaPage, enviar o arquivo real via `FormData` + `fetch` ao novo endpoint
- Habilitar botões de Visualizar (abrir PDF) e Download (baixar arquivo)

#### B2: Scheduler para monitoramento automático (G8)
**Arquivo:** `backend/scheduler.py` (novo)
**O que fazer:**
- Criar módulo usando APScheduler (ou threading.Timer como fallback)
- A cada intervalo (configurável por monitoramento: diário/semanal):
  1. Buscar todos os `Monitoramento` ativos no BD
  2. Para cada um, executar `tool_buscar_editais_fonte(termo, uf)`
  3. Comparar com editais já salvos (evitar duplicatas)
  4. Se houver novos editais, criar `Notificacao` no BD
  5. Se email habilitado, enviar via `notifications.py`
- Inicializar scheduler ao iniciar o app (`app.py` → `scheduler.start()`)
- Respeitar horários configurados (não buscar de madrugada)

#### B3: Notificação real por email (G9)
**Arquivo:** `backend/notifications.py` (novo)
**O que fazer:**
- Criar função `enviar_email_notificacao(destinatario, assunto, corpo_html)`
- Usar SMTP (configurável via env vars: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS)
- Templates HTML para:
  - Novo edital encontrado pelo monitoramento
  - Alerta de prazo (X horas para abertura)
  - Resumo diário/semanal de editais
- Integrar com `tool_configurar_preferencias_notificacao()` para ler canais habilitados
- Fallback: se SMTP não configurado, apenas salvar notificação no BD (já funciona)

#### B4: Usar porte/regime na validação (G10)
**Arquivo:** `backend/tools.py`
**O que fazer:**
- Em `tool_calcular_scores_validacao()` (linha ~6245), antes de chamar DeepSeek:
  1. Carregar dados da empresa do usuário (porte, regime_tributario)
  2. Incluir no prompt: "A empresa é de porte {porte} e regime {regime_tributario}"
  3. Pedir ao modelo que considere restrições de participação (ex: edital exclusivo para ME/EPP)
- No `PROMPT_SCORES_VALIDACAO`, adicionar instrução para avaliar compatibilidade tipo/porte
- Retornar campo adicional: `compatibilidade_porte: boolean`

#### B5: Gerar classes/subclasses via IA (G11)
**Arquivos:** `backend/app.py`, `frontend/src/pages/ParametrizacoesPage.tsx`
**O que fazer:**
- Backend: criar endpoint `POST /api/parametrizacoes/gerar-classes` que:
  1. Lista todos os produtos do usuário com suas categorias e NCMs
  2. Envia para DeepSeek com prompt: "Agrupe estes produtos em classes e subclasses lógicas com NCMs"
  3. Retorna estrutura: `[{nome_classe, ncms, subclasses: [{nome, ncms}]}]`
- Frontend: habilitar o botão "Gerar com IA" na aba Produtos
  - Ao clicar, chamar endpoint
  - Exibir preview da estrutura gerada
  - Botão "Aplicar" para salvar
  - Botão "Cancelar" para descartar

#### B6: Vincular documento a item do edital (G12)
**Arquivos:** `backend/models.py`, `backend/app.py`, `frontend/src/pages/ValidacaoPage.tsx`
**O que fazer:**
- Models: adicionar campo opcional `edital_requisito_id` (FK) em `EmpresaDocumento` e `EmpresaCertidao`
- Backend: endpoint `POST /api/editais/{id}/vincular-documento` que:
  - Recebe: `{documento_id, requisito_id}`
  - Cria o vínculo no BD
- Backend: endpoint `GET /api/editais/{id}/documentacao-necessaria` (usado por F6)
  - Retorna requisitos documentais do edital + documentos da empresa vinculados/disponíveis
- Frontend: na seção Processo Amanda (F6), botão "Vincular" em cada requisito faltante

#### B7: SICONV como fonte de busca (G13)
**Arquivo:** `backend/tools.py`
**O que fazer:**
- Adicionar parser `_parse_siconv()` similar aos existentes (_parse_comprasnet, _parse_bec_sp)
- URL base: `https://siconv.caixa.gov.br` ou API disponível
- Integrar em `tool_buscar_editais_scraper()` como fonte adicional
- Registrar automaticamente via `tool_cadastrar_fonte("SICONV", "scraper", url)`
- Se API não disponível, usar Serper com `site:siconv.caixa.gov.br`

#### B8: Busca automática de certidões (G14)
**Arquivos:** `backend/tools.py`, `frontend/src/pages/EmpresaPage.tsx`
**O que fazer:**
- Criar `tool_buscar_certidoes_automaticas(cnpj, user_id)`:
  - CND Federal: API da Receita (ou scraping do portal)
  - CND Estadual: varia por UF (iniciar com SP)
  - FGTS: API/portal da Caixa
  - Trabalhista (TST): API do TST
  - Para cada, tentar busca web via `tool_web_search(f"certidão negativa {tipo} CNPJ {cnpj}")`
- Habilitar o botão "Buscar Certidões" na EmpresaPage
- Ao clicar: chamar endpoint, atualizar status na tabela de certidões
- Fallback se API falhar: abrir URL de consulta manual

---

### agent-tester (1 tarefa principal)

#### T1: Documento de Teste Completo do WORKFLOW SISTEMA (pgs 2-10)

Gerar o arquivo `docs/plano_teste_workflow.md` contendo:

Para **CADA item** especificado no WORKFLOW SISTEMA.pdf (páginas 2 a 10), um bloco com:

1. **Trecho do WORKFLOW**: transcrição/descrição do que o PDF especifica
2. **Módulo/Página**: onde no sistema deve ser testado
3. **Pré-condições**: dados que precisam existir (empresa cadastrada, produtos, editais salvos, etc.)
4. **Passos de teste**: sequência exata de ações para verificar
5. **Dados de teste**: valores específicos para usar (CNPJ exemplo, nome de produto, termo de busca, etc.)
6. **Resultado esperado**: o que deve acontecer se estiver correto
7. **Verificação**: como confirmar (visual, BD, API response)

O documento deve cobrir NO MÍNIMO:

**Página 2 — Empresa:**
- Cadastro de todos os campos (razão social, CNPJ, inscrição estadual, website, redes sociais, emails, celulares)
- Upload de cada tipo de documento (Contrato Social, AFE, CBPAD, CBPP, Corpo de Bombeiros, Econômica, Fiscal, Técnica)
- Upload real de arquivo (persistência no disco)
- Visualização e download de documentos
- Busca automática de certidões
- Fontes de obtenção do portfolio (uploads, ANVISA, ERP, website)
- Palavras-chave geradas pela IA
- Classificação/agrupamento de produtos pela IA

**Página 3 — Portfolio:**
- Upload de cada tipo (Manuais, Instruções de Uso, NFS, Plano de Contas, Folders, Website)
- IA lê manual e extrai specs automaticamente
- Cadastro com classe, subclasse, NCM
- Máscara de specs técnicas (Potência, Voltagem, etc.)
- Verificação de completude
- Registros ANVISA via IA
- Monitoramento contínuo e classificação automática

**Página 4 — Parametrizações:**
- Arquitetura de classes/subclasses (CRUD completo)
- Gerar classes via IA
- Região de atuação (27 UFs)
- Tempo de entrega
- 6 norteadores de score
- Tipos de editais desejados
- Fontes documentais exigidas
- Pesos de scores

**Páginas 5-6 — Captação:**
- Busca de editais com score (tabela com Licitação, Produto Correspondente, Score gauge)
- Tooltip de Análise de Gaps ao hover
- Análise do Edital no painel (Score Técnica gauge, Score Comercial gauge, Score Recomendação estrelas)
- Cards de prazos (2d, 5d, 10d, 20d)
- Potencial de Ganho
- Intenção Estratégica (4 radios)
- Expectativa de Margem (slider + Varia por Produto/Região)
- Classificação por tipo (6 opções)
- Classificação por origem (9 opções)
- Fontes de busca (PNCP, ComprasNet, BEC, SICONV)
- IA lê todo o edital
- Monitoramento 24/7 com alertas
- Color coding (verde/amarelo/vermelho)

**Páginas 7-10 — Validação:**
- Sinais de Mercado (Concorrente Dominante, Licitação Direcionada)
- Botões Participar/Acompanhar/Ignorar + Justificativa
- Score circle grande
- Aba Objetiva: Aderência Técnica por requisito, Certificações, Checklist Docs, Mapa Logístico
- Aba Analítica: Modalidade e Risco, Flags Jurídicos, Fatal Flaws, Reputação do Órgão, Alerta de Recorrência, Trecho-a-Trecho
- Aba Cognitiva: Resumo IA, Histórico Semelhante, Pergunte à IA
- Análise de Lote (Aderente/Item Intruso)
- 6 barras de dimensão com labels High/Medium/Low
- Scores de Aderência/Riscos (Técnica, Documental, Jurídica, Logística, Comercial, Tipo empresa)
- Processo Amanda (3 pastas por edital com documentos vinculados)
- Decisão GO/NO-GO da IA
- Porte/regime da empresa na validação

**Prompts de Chat a testar (por categoria):**
- Cadastro de Produtos (12 prompts do dropdown)
- Busca e Cadastro de Editais (20 prompts)
- Análise de Editais (16 prompts)
- Análise de Aderência (3 prompts)
- Registro de Resultados (8 prompts)
- Atas e PNCP (6 prompts)
- Histórico de Preços (6 prompts)
- Análise de Concorrentes (5 prompts)
- Classificação de Editais (3 prompts)
- Fontes de Editais (4 prompts)
- Alertas e Prazos (8 prompts)
- Monitoramento (5 prompts)
- Notificações (4 prompts)

**Dados de teste sugeridos:**
- Empresa: "Áquila Diagnóstico Ltda", CNPJ: 12.345.678/0001-90, SP
- Produto 1: Microscópio Óptico Binocular (Equipamento, NCM 9011.10.00)
- Produto 2: Kit Diagnóstico Rápido HIV (Reagente, NCM 3822.00.90)
- Termo de busca: "microscópio", "reagente diagnóstico"
- Edital exemplo: PE-001/2026, Órgão: Hospital das Clínicas SP

---

## DEPENDÊNCIAS ENTRE TAREFAS

```
B1 (upload arquivo) ──────────────────────┐
B6 (vincular doc↔item) ──────────────────>├──> F6 (Processo Amanda UI)
B4 (porte/regime na validação) ───────────┘

B5 (gerar classes IA) ───────────────────────> F11 (habilitar botão)

B2 (scheduler) ──────> B3 (notificação email)

F1-F5 e F7: independentes, podem rodar em paralelo
B7, B8: independentes

T1 (documento de teste): independente, roda em paralelo com tudo
```

---

## ORDEM DE EXECUÇÃO

**Paralelo 1 (todos simultaneamente):**
- agent-frontend: F1, F2, F3, F4, F7 (gaps visuais sem dependência)
- agent-backend: B1, B4, B5, B7, B8 (gaps sem dependência)
- agent-tester: T1 (documento de teste)

**Paralelo 2 (após Paralelo 1):**
- agent-frontend: F5 (mapa logístico), F6 (Processo Amanda UI — depende de B1 e B6)
- agent-backend: B2 (scheduler), B3 (notificação), B6 (vincular doc↔item)

---

## CRITÉRIOS DE ACEITE

1. **TypeScript compila**: `cd frontend && npx tsc --noEmit` sem erros
2. **Backend inicia**: `python backend/app.py` sem erros
3. **Testes do documento T1**: cada item do plano de teste deve passar
4. **Mockup match**: screenshots das telas devem se aproximar dos mockups do WORKFLOW SISTEMA.pdf
5. **Chat não regrediu**: prompts do dropdown continuam funcionando
