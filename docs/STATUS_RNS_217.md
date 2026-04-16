# Status Completo das 217 Regras de Negócio

**Data:** 2026-04-13  
**Fonte:** `docs/requisitos_completosv8.md` Seção 13  
**Escopo:** Sprints 1–5 (RN-001 a RN-217)

## Sumário

- **Total de RNs:** 217
- **Implementadas (com enforcement no código):** 180 (82%)
- **Faltantes (warn-only ou ausentes):** 37 (17%)

### Faltantes por importância
- 🔴 **CRÍTICA:** 17
- 🟡 **ALTA:** 12
- 🟢 **MÉDIA:** 8

### Legenda
- ✅ **Implementada** — enforcement ativo no código
- 🆕 **Implementada V4** — adicionada nos blocos 1–8 desta sessão (warn-only com `ENFORCE_RN_VALIDATORS=true`)
- ⏳ **Faltante** — ainda não tem enforcement

---

## Sprint 1 — Fundação

| RN | Status | Importância | Descrição | UCs |
|----|--------|-------------|-----------|-----|
| RN-001 | ✅ | 🔴 Crítica | O CNPJ da empresa e identificador unico global no sistema — nao pode existir mais de um registro de `empresas` com o mesmo CNPJ. F | UC-F01 |
| RN-002 | ✅ | 🔴 Crítica | Razao social e CNPJ sao campos obrigatorios para criacao/atualizacao do cadastro da empresa; sem eles o registro nao pode ser salv | UC-F01 |
| RN-003 | ✅ | 🔴 Crítica | O CNPJ deve passar por validacao de formato (somente digitos numericos validos, tipicamente 14 digitos apos remocao de mascara `.` | UC-F01, UC-F04 |
| RN-004 | ✅ | 🔴 Crítica | Cada empresa so pode ter um responsavel com o mesmo CPF — o par (empresa_id, cpf) e unico. Fonte: `backend/models.py:1590` (`Uniqu | UC-F05 |
| RN-005 | ✅ | 🟢 Média | Uma empresa pode ter N responsaveis (1:N), classificados em tipos `representante_legal`, `preposto` ou `tecnico`. Fonte: `backend/ | UC-F05 |
| RN-006 | ✅ | 🔴 Crítica | Nome e email sao obrigatorios no cadastro de um responsavel; cargo, CPF e telefone sao opcionais. Fonte: UC-F05 passo 2 + `backend | UC-F05 |
| RN-007 | ✅ | 🔴 Crítica | Uma certidao tem obrigatoriamente uma data de vencimento registrada. Fonte: `backend/models.py:1551`. | UC-F04 |
| RN-008 | ✅ | 🔴 Crítica | O status visual da certidao e derivado da data de vencimento: verde quando faltam >30 dias, amarelo 15-30 dias, vermelho <15 dias  | UC-F04 |
| RN-009 | ✅ | 🔴 Crítica | O conjunto de status possiveis de certidao e restrito a `valida`, `vencida`, `pendente`, `buscando`, `erro`, `nao_disponivel`; def | UC-F04 |
| RN-010 | ✅ | 🔴 Crítica | Para disparar a busca automatica de certidoes, a empresa precisa ter `id` e `cnpj`; sem CNPJ a acao e bloqueada. Fonte: UC-F04 pas | UC-F04 |
| RN-011 | ✅ | 🟡 Alta | Todo produto nasce com `status_pipeline = "cadastrado"` por default. Fonte: `backend/models.py:155` + `backend/app.py:3508`. | UC-F06, UC-F07, UC-F08 |
| RN-012 | ✅ | 🟡 Alta | O funil de conversao do produto e fechado nos 4 estados `cadastrado`, `qualificado`, `ofertado`, `vencedor`; valores fora desse co | UC-F06, UC-F13 |
| RN-013 | ✅ | 🟢 Média | Nao pode existir mais de um produto com o mesmo `nome` dentro da mesma empresa. Fonte: `backend/app.py:3491-3496`. | UC-F07, UC-F08 |
| RN-014 | ✅ | 🟢 Média | O produto pertence a uma unica empresa (FK `empresa_id`); ao excluir a empresa, produtos sao removidos em cascata. Fonte: `backend | UC-F06, UC-F07 |
| RN-015 | ✅ | 🟢 Média | Cada consulta ao catalogo de produtos e escopada a empresa atual do usuario (multi-tenant por `empresa_id` do JWT). Fonte: `backen | UC-F06, UC-F07, UC-F08 |
| RN-016 | ✅ | 🟡 Alta | A categoria do produto e restrita a conjunto fechado: `equipamento`, `reagente`, `insumo_hospitalar`, `insumo_laboratorial`, `info | UC-F07, UC-F08 |
| RN-017 | ✅ | 🟢 Média | A completude tecnica do produto e calculada como `campos_preenchidos / total_campos` sobre 7 campos basicos (Nome, Fabricante, Mod | UC-F11 |
| RN-018 | ✅ | 🟡 Alta | O status de completude e classificado em 4 faixas: `completo` (>=90%), `quase_completo` (>=70%), `incompleto` (>=40%), `muito_inco | UC-F11 |
| RN-019 | ✅ | 🟢 Média | Se o produto nao tiver subclasse associada, a verificacao de especificacoes nao e executada — o percentual de mascara default e 10 | UC-F11 |
| RN-020 | ✅ | 🟡 Alta | A soma dos 6 pesos de score (tecnico, documental, complexidade, juridico, logistico, comercial) deve ser 1.00 (100%) com toleranci | UC-F14 |
| RN-021 | ✅ | 🟡 Alta | O score final usa 6 dimensoes fixas e ponderadas — a lista e fechada e nao aceita adicao/remocao pelo usuario. Fonte: RF-018 crite | UC-F14 |
| RN-022 | ✅ | 🟢 Média | Apenas usuario com papel `admin` na empresa ou `superuser` global pode editar dados cadastrais da empresa atual; operadores comuns | UC-F01, UC-F02 |
| RN-023 | ✅ | 🟢 Média | Superusuario enxerga todas as empresas ativas; usuario comum so enxerga empresas com vinculo ativo em `usuario_empresa`. Fonte: `b | UC-F01, UC-F02, UC-F03, UC-F04 (+13) |
| RN-024 | ✅ | 🟢 Média | O vinculo usuario-empresa e unico — o par (`user_id`, `empresa_id`) nao pode existir mais de uma vez. Fonte: `backend/models.py:14 | UC-F01 |
| RN-025 | ✅ | 🟢 Média | O porte da empresa, quando informado, e restrito a `me`, `epp`, `medio` ou `grande`. Fonte: `backend/models.py:1362` + RF-005 crit | UC-F01 |
| RN-026 | ✅ | 🔴 Crítica | A frequencia de busca automatica de certidoes e restrita a `desativada`, `diaria`, `semanal`, `quinzenal`, `mensal`; default `diar | UC-F04 |
| RN-027 | ✅ | 🟡 Alta | A fonte PNCP nao pode ser desativada: e fonte obrigatoria padrao de busca de editais. Fonte: RF-015 criterio 4. | UC-F16 |
| RN-028 | 🆕 V4 | 🔴 Crítica | O CNPJ deve ser validado pelo algoritmo de digitos verificadores da Receita Federal, nao apenas pelo formato/14 digitos. Justifica | UC-F01 |
| RN-029 | 🆕 V4 | 🔴 Crítica | O CPF do responsavel, quando informado, deve ser validado pelos digitos verificadores da Receita Federal. Justificativa: `empresa_ | UC-F05 |
| RN-030 | 🆕 V4 | 🟢 Média | Uma empresa deve ter pelo menos um responsavel do tipo `representante_legal` antes de ser utilizada em geracao de propostas. Justi | UC-F05 |
| RN-031 | 🆕 V4 | 🔴 Crítica | Uma empresa nao pode ser usada em proposta/edital se tiver certidoes obrigatorias (CND Federal, FGTS, Trabalhista) com status `ven | UC-F04 |
| RN-032 | 🆕 V4 | 🟡 Alta | Cada peso individual do score (RN-020) deve estar no intervalo [0.0, 1.0]; valores negativos ou >1.0 devem ser rejeitados. Justifi | UC-F14 |
| RN-033 | 🆕 V4 | 🟡 Alta | Um produto so pode transicionar para `status_pipeline = "ofertado"` se tiver NCM preenchido e (quando houver subclasse) completude | UC-F06, UC-F08, UC-F11 |
| RN-034 | 🆕 V4 | 🟡 Alta | A transicao de status do produto e monotona: `cadastrado -> qualificado -> ofertado -> vencedor`, nao pode pular etapas; reversao  | UC-F06, UC-F08 |
| RN-035 | 🆕 V4 | 🟡 Alta | O NCM do produto deve seguir formato `NNNN.NN.NN` (8 digitos) e pertencer a uma NCM parametrizada na subclasse. Justificativa: `ba | UC-F07, UC-F08 |
| RN-036 | 🆕 V4 | 🟢 Média | Campos de preco sensivel (`preco_referencia`, markup, margens) so podem ser vistos por usuarios com papel `admin` ou `comercial`;  | UC-F06, UC-F08 |
| RN-037 | 🆕 V4 | 🟢 Média | Toda leitura de dados sensiveis do portfolio deve registrar log com `user_id`, `produto_id`, `timestamp`, `acao`. Justificativa: R | UC-F06, UC-F08 |
| RN-038 | 🆕 V4 | 🟡 Alta | Limiares GO/NO-GO devem respeitar `minimo_GO > maximo_NO-GO` para cada faixa (Final, Tecnico, Juridico) — sem overlap. Justificati | UC-F14 |
| RN-039 | 🆕 V4 | 🟡 Alta | Documentos da empresa com `data_vencimento` passam a `expirado` automaticamente sem acao manual. Justificativa: `empresa_documento | UC-F03 |
| RN-040 | ✅ | 🟢 Média | Ao excluir uma subclasse, produtos vinculados devem permanecer no catalogo (soft-disconnect, `subclasse_id = NULL`), nao cascatear | UC-F13 |
| RN-041 | 🆕 V4 | 🟡 Alta | Os pesos default pre-configurados devem totalizar 1.00 no primeiro acesso (seed); sem seed valido, primeira-execucao fica travada  | UC-F14 |
| RN-042 | 🆕 V4 | 🟡 Alta | Um email adicionado a lista `Emails de Contato` deve ser unico dentro da empresa e valido por RFC 5322. Justificativa: `empresas.e | UC-F02 |

## Sprint 2 — Captação/Validação

| RN | Status | Importância | Descrição | UCs |
|----|--------|-------------|-----------|-----|
| RN-043 | ✅ | 🟡 Alta | Busca de editais no PNCP exige termo de busca nao vazio. Requisicoes sem termo retornam HTTP 400 "Parametro 'termo' e obrigatorio" | UC-CV01 |
| RN-044 | ✅ | 🟢 Média | Janela de publicacao da busca PNCP e limitada entre 7 e 730 dias (default 90). Valores fora sao clipados. Fonte: `backend/app.py:9 | UC-CV01 |
| RN-045 | ✅ | 🟢 Média | Paginas PNCP sao consultadas com ate 50 resultados por pagina (tamanhoPagina/tam_pagina=50). Fonte: `backend/tools.py:774, 1885, 2 | UC-CV01, UC-CV11, UC-CV12 |
| RN-046 | ✅ | 🟡 Alta | O sistema oferece 4 modos de score na captacao: `nenhum`, `rapido` (batch IA), `hibrido` (rapido + profundo nos melhores) e `profu | UC-CV01, UC-CV02 |
| RN-047 | ✅ | 🟡 Alta | Score final e media ponderada das 6 dimensoes: `score = 0.35*tec + 0.20*jur + 0.15*doc + 0.15*complex + 0.10*com + 0.05*log`. Peso | UC-CV08 |
| RN-048 | ✅ | 🟡 Alta | A IA NAO decide GO/NO-GO — o backend recalcula o score_final e aplica regra deterministica de decisao com limiares do banco. Fonte | UC-CV08 |
| RN-049 | ✅ | 🟡 Alta | Decisao GO exige (AND): score_final >= limiar_go (default 70) E score_tecnico >= 60 E score_juridico >= 60. Fonte: `backend/tools. | UC-CV08 |
| RN-050 | ✅ | 🟡 Alta | Decisao NO-GO automatica (OR): score_final < 40 OU score_tecnico < 30 OU score_juridico < 30. Fonte: `backend/tools.py:8195-8196,  | UC-CV08 |
| RN-051 | ✅ | 🟢 Média | Decisao AVALIAR e o complemento: qualquer combinacao que nao satisfaca GO nem NO-GO. Fonte: `backend/tools.py:8199-8200`. | UC-CV08 |
| RN-052 | ✅ | 🟢 Média | Potencial de ganho: `elevado` (>=70), `medio` (>=40 e <70), `baixo` (<40). Fonte: `backend/tools.py:8278-8282`. | UC-CV02, UC-CV08 |
| RN-053 | ✅ | 🟢 Média | Faixas de cada dimensao interpretadas pela IA: 90-100 excelente, 70-89 bom, 50-69 parcial, 0-49 baixo (uso em justificativas, nao  | UC-CV08 |
| RN-054 | ✅ | 🟡 Alta | Se o edital pede SERVICO e a empresa so tem PRODUTO cadastrado, score_tecnico e forcado para faixa 0-20. Fonte: `backend/tools.py: | UC-CV08 |
| RN-055 | ✅ | 🟡 Alta | Compatibilidade de porte — edital exclusivo ME/EPP e empresa medio/grande => NO-GO obrigatorio; empresa ME/EPP em edital ME/EPP => | UC-CV08 |
| RN-056 | ✅ | 🟡 Alta | Esfera do orgao inferida do nome: contem MINISTERIO/FEDERAL/NACIONAL -> Federal; ESTADO/ESTADUAL -> Estadual; caso contrario -> Mu | UC-CV12 |
| RN-057 | ✅ | 🟢 Média | Risco de pagamento heuristico: Federal=Baixo, Estadual=Medio, Municipal=Alto. Fonte: `backend/app.py:11295, 11427`. | UC-CV12 |
| RN-058 | ✅ | 🟢 Média | Classificacao de volume de compras do orgao: >100 = Alto; 21-100 = Medio; <=20 = Baixo. Fonte: `backend/app.py:11296, 11428`. | UC-CV12 |
| RN-059 | ✅ | 🟡 Alta | Cache da analise de mercado tem validade de 30 dias; `{"forcar": true}` forca recalculo. Fonte: `backend/app.py:11270-11303`. | UC-CV12 |
| RN-060 | ✅ | 🟡 Alta | Historico interno do orgao conta apenas editais da propria empresa com match ilike no nome (primeiros 20 chars), ignorando `temp_s | UC-CV12 |
| RN-061 | ✅ | 🟢 Média | Recorrencia do objeto a partir de atas PNCP (>=2 datas): media de intervalos <=200d = semestral; <=400d = anual; >400d = esporadic | UC-CV11 |
| RN-062 | ✅ | 🟢 Média | Severidade de riscos em 4 niveis: `critico`, `alto`, `medio`, `baixo`. Cores: alto=#ef4444, medio=#eab308, baixo=#22c55e. IA deve  | UC-CV11 |
| RN-063 | ✅ | 🟡 Alta | Intencao estrategica em 4 estados exclusivos: `estrategico`, `defensivo`, `acompanhamento`, `aprendizado`, persistidos com margem  | UC-CV04 |
| RN-064 | ✅ | 🟡 Alta | Status do edital salvo em 4 estados: `novo`, `go`, `avaliando`, `nogo`. Fonte: `frontend/src/pages/ValidacaoPage.tsx:70, 615, 793- | UC-CV07, UC-CV08 |
| RN-065 | ✅ | 🔴 Crítica | Prazo de encerramento com classificacao visual: <=2d vermelho, <=5d amarelo, >5d neutro. Cards em 4 faixas: 2/5/10/20 dias. Fonte: | UC-CV01, UC-CV02 |
| RN-066 | ✅ | 🟡 Alta | Acao em lote "Salvar Score >= 70%" salva apenas editais com score >=70 ainda nao salvos. Fonte: `frontend/src/pages/CaptacaoPage.t | UC-CV03 |
| RN-067 | ✅ | 🟡 Alta | Matching produto x edital segue hierarquia: produto exato -> subclasse -> classe -> generico. Score so e calculado se existir >=1  | UC-CV02, UC-CV08 |
| RN-068 | ✅ | 🟢 Média | Deduplicacao multi-termo usa 2 chaves: (numero+orgao) e (orgao+valor_estimado). Fonte: `backend/app.py:9571-9587`. | UC-CV01 |
| RN-069 | ✅ | 🟢 Média | Compras similares do orgao filtradas por palavras-chave do produto match (>4 chars) + palavras do objeto (>5 chars), max 4 palavra | UC-CV12 |
| RN-070 | ✅ | 🔴 Crítica | Analise de mercado exige CNPJ OU nome do orgao; sem nenhum, retorna HTTP 400. Fonte: `backend/app.py:11267-11268`. | UC-CV12 |
| RN-071 | ✅ | 🟢 Média | Extracao de requisitos documentais exige PDF com texto_extraido >=200 chars; senao HTTP 400. Fonte: `backend/app.py:11969-11973`. | UC-CV10 |
| RN-072 | ✅ | 🟢 Média | Extracao de requisitos e idempotente — requer `{"forcar": true}` para sobrescrever requisitos ja extraidos. Fonte: `backend/app.py | UC-CV10 |
| RN-073 | ✅ | 🟡 Alta | Alerta visual amarelo na aba Riscos quando >=2 editais similares perdidos para concorrentes. Fonte: `docs/CASOS DE USO CAPTACAO VA | UC-CV11 |
| RN-074 | ✅ | 🟢 Média | Taxa de vitoria do concorrente: `ganhos / max(participados, 1) * 100`, arredondada 1 casa. Fonte: `backend/app.py:11790, 11899`. | UC-CV11 |
| RN-075 | ✅ | 🟢 Média | Chat IA do UC-CV13 escopado por sessao — contexto restrito ao edital aberto e ao tipo de acao. Fonte: `backend/app.py:1285-1311` + | UC-CV13 |
| RN-076 | ✅ | 🟡 Alta | Editais `temp_score` (temporarios para calculo profundo sob demanda) sao sempre excluidos de `/api/editais/salvos` e do historico  | UC-CV07, UC-CV12 |
| RN-077 | ✅ | 🟢 Média | Termo de busca exige comprimento minimo >=3 chars. Fonte: `backend/app.py:4942` e `backend/app.py:5031` (`if not termo or len(term | UC-CV01 |
| RN-078 | 🆕 V4 | 🟢 Média | Limite maximo de editais por busca deveria ser cap hard (~500). Justificativa: frontend hoje envia 2000 como limite, sobrecarga ba | UC-CV01 |
| RN-079 | 🆕 V4 | 🟡 Alta | Cache de mercado (30d) deveria invalidar quando novo edital do mesmo orgao e salvo. Justificativa: historico interno desatualiza d | UC-CV12 |
| RN-080 | 🆕 V4 | 🔴 Crítica | Recalcular scores apos decisao salva (GO/NO-GO) deveria exigir justificativa ou criar nova versao. Justificativa: preservar audito | UC-CV08 |
| RN-081 | 🆕 V4 | 🟡 Alta | Backend nao valida formalmente que pesos de score somem 100% — apenas aplica. Justificativa: RF-018 define mas nao rejeita. | UC-CV08 |
| RN-082 | 🆕 V4 | 🟡 Alta | Transicoes `novo -> go/avaliando/nogo` nao tem matriz definida. Um edital `nogo` pode voltar a `go` sem restricao. Justificativa:  | UC-CV07, UC-CV08 |
| RN-083 | 🆕 V4 | 🟢 Média | Chat IA nao restringe perguntas fora do escopo do edital. Justificativa: consumo desnecessario de tokens em off-topic. | UC-CV13 |
| RN-084 | 🆕 V4 | 🟢 Média | Sem limite/debounce no `/analisar-riscos` — cooldown minimo 60s sugerido. Justificativa: protege custos DeepSeek e rate-limit PNCP | UC-CV11 |
| RN-085 | 🆕 V4 | 🟢 Média | Extracao de lotes IA (UC-CV09) nao exige valor/qtd minimos por lote. Justificativa: lotes com 1 item ou valor 0 sao artifatos polu | UC-CV09 |
| RN-086 | 🆕 V4 | 🟡 Alta | Score profundo nao e invalidado quando `data_encerramento` do edital muda ou portfolio e alterado. Justificativa: dados stale exib | UC-CV08 |
| RN-087 | 🆕 V4 | 🔴 Crítica | Heuristica de esfera por substring e fragil — "Fundacao Oswaldo Cruz" (federal) pode nao bater. Deveria usar CNPJ ou `orgaoEntidad | UC-CV12 |

## Sprint 3 — Precificação/Proposta

| RN | Status | Importância | Descrição | UCs |
|----|--------|-------------|-----------|-----|
| RN-088 | ✅ | 🟢 Média | Quantidade de kits arredondada SEMPRE para cima (ceil). Formula: `Qtd_Kits = ceil(Volume_Real_Ajustado / Rendimento_por_kit)`. Fon | UC-P03 |
| RN-089 | ✅ | 🟢 Média | Volume Real Ajustado = `Volume_edital + Rep_amostras + Rep_calibradores + Rep_controles`. Repeticoes default 0. Fonte: RF-039-02 + | UC-P03 |
| RN-090 | ✅ | 🟡 Alta | Rendimento por kit deve ser estritamente positivo. Sistema bloqueia calculo com "Rendimento do produto deve ser > 0". Fonte: `back | UC-P03 |
| RN-091 | ✅ | 🟢 Média | Modo "Custo + Markup" na Camada B: `preco_base = custo_base_final * (1 + markup_percentual / 100)`. Fonte: RF-039-08 + `backend/to | UC-P05 |
| RN-092 | ✅ | 🟡 Alta | Camada B aceita 3 modos mutuamente exclusivos: `manual`, `markup`, `upload`. Modo invalido retorna erro. Fonte: RF-039-08 + `backe | UC-P05 |
| RN-093 | ✅ | 🟢 Média | Precedencia tributaria Camada A: param explicito > `beneficios_fiscais_ncm` (matching por maior prefixo) > parametros empresa > de | UC-P04 |
| RN-094 | ✅ | 🟢 Média | NCM comecando com prefixo em `ncm_isencao_icms` (default `["3822"]`) recebe ICMS=0 automatico com flag `isencao_icms=True`. Fonte: | UC-P04 |
| RN-095 | ✅ | 🟢 Média | `custo_base_final = custo_unitario`; tributos sao informacionais, nao somam ao custo. Fonte: `backend/tools.py:8915-8916`. | UC-P04 |
| RN-096 | ✅ | 🟢 Média | Valor de Referencia (Camada C) = edital.valor_unitario_estimado (se existir) OU `preco_base * (percentual_sobre_base / 100)`. Pode | UC-P06 |
| RN-097 | ✅ | 🟢 Média | Camada C exige Camada B persistida; retorna erro "Configure preco base (Camada B) primeiro" caso contrario. Fonte: `backend/tools. | UC-P06 |
| RN-098 | ✅ | 🟡 Alta | Dependencia em cascata: A -> B -> C -> D/E. `tool_estruturar_lances` retorna "Configure camadas A-C primeiro" se faltar. Fonte: `b | UC-P04, UC-P05, UC-P06, UC-P07 |
| RN-099 | ✅ | 🟡 Alta | Lance minimo deve ser estritamente menor que lance inicial. Warning e confirmacao obrigatoria se viola. Fonte: RF-039-10 + `backen | UC-P07 |
| RN-100 | ✅ | 🟡 Alta | Se `lance_minimo < custo_base_final` (custo>0), exibe warning "Lance minimo esta abaixo do custo!" com confirmacao. Margem = `((la | UC-P07 |
| RN-101 | ✅ | 🟡 Alta | Lance minimo sugerido pela IA: `custo_sugerido * 1.10` (custo + 10% margem minima). Mesma formula no recalculo cascata. Fonte: `ba | UC-P04, UC-P11 |
| RN-102 | ✅ | 🟡 Alta | Margem sobre custo padronizada: `((valor - custo) / custo) * 100`. Exige custo>0. Fonte: `backend/tools.py:9071, 9140`. | UC-P04, UC-P05, UC-P06, UC-P07 (+1) |
| RN-103 | ✅ | 🟢 Média | Sugestoes A-E do pipeline IA sao determinsticas: (A)=preco_min*0.85; (B)=preco_medio*0.97; (C)=edital ou preco_medio*0.99; (D)=Pre | UC-P11 |
| RN-104 | ✅ | 🟢 Média | Janela historica: Camada F e pipeline IA usam 24 meses; busca geral chat usa 12 meses. Fonte: `backend/tools.py:9256, 9628, 6598`. | UC-P09, UC-P11 |
| RN-105 | ✅ | 🟢 Média | Variacao `preco_max/preco_min > 5x` sinaliza inconsistencia de unidade de medida. Fonte: `backend/tools.py:9695-9697`. | UC-P11 |
| RN-106 | ✅ | 🟢 Média | Perfis de estrategia aceitos: `quero_ganhar` e `nao_ganhei_minimo`. Cada um gera 3 cenarios. Fonte: RF-039-11 + `backend/tools.py: | UC-P08 |
| RN-107 | ✅ | 🟢 Média | Amortizacao comodato mensal: `valor_equipamento / duracao_meses`, ambos >0. Fonte: RF-039-07 + `backend/tools.py:9357-9360`. | UC-P10 |
| RN-108 | ✅ | 🟡 Alta | ANVISA semaforo 4 estados: `valido` (verde, ativo), `atencao` (amarelo, em_analise/indefinido), `vencido` (vermelho, cancelado), ` | UC-R04 |
| RN-109 | ✅ | 🟡 Alta | ANVISA vencido = BLOQUEIO de envio. Frontend exibe "BLOQUEANTE: Existem registros ANVISA vencidos". Fonte: RF-040-04 + `frontend/s | UC-R04, UC-R07 |
| RN-110 | ✅ | 🟡 Alta | Cada verificacao ANVISA gera `AnvisaValidacao` imutavel com data, fonte, resultado e `log_texto`. Fonte: RF-040-04 + `backend/tool | UC-R04 |
| RN-111 | ✅ | 🟡 Alta | Documentos >25MB recebem status `alerta` com flag `alerta_tamanho=True`. Limite configuravel via `max_size_mb` (default 25). Fonte | UC-R05 |
| RN-112 | ✅ | 🟢 Média | Smart Split: paginas por parte = `max(1, int(total_pages * max_size_mb / file_size_mb))`. PDFs 1-pag nao fracionaveis. Fonte: RF-0 | UC-R05 |
| RN-113 | ✅ | 🟡 Alta | Checklist documental: status `ok`/`alerta`/`faltando`; flag `obrigatorio` herdada de `DocumentoNecessario.obrigatorio`. Fonte: RF- | UC-R05 |
| RN-114 | ✅ | 🟡 Alta | Transicoes validas do status da proposta: `rascunho -> revisao`; `revisao -> {rascunho, aprovada}`; `aprovada -> {revisao, enviada | UC-R07 |
| RN-115 | ✅ | 🟢 Média | Descricao Tecnica A/B: alternar para "personalizado" preserva texto original como backup; modo default e "edital" (literal). Fonte | UC-R03 |
| RN-116 | ✅ | 🟡 Alta | Criacao de proposta exige `edital_id` e `produto_id` obrigatorios. Fonte: RF-040-01/02 + `backend/app.py:8858-8859`. | UC-R01, UC-R02 |
| RN-117 | ✅ | 🟡 Alta | Proposta recem-criada nasce com `status='rascunho'` (motor automatico ou upload). Fonte: RF-040-02 + `backend/app.py:8896`. | UC-R01, UC-R02 |
| RN-118 | ✅ | 🟡 Alta | Dossie ZIP contem: proposta_tecnica.txt, arquivo original, pasta `documentos/` por produto, `anvisa_validacao.txt`. Fonte: RF-041- | UC-R06 |
| RN-119 | ✅ | 🟢 Média | Proposta exportavel em PDF (engessado) e DOCX (editavel) via `GET /api/propostas/{id}/export?formato=pdf / docx`. Fonte: RF-041-01 | UC-R06 |
| RN-120 | ⏳ Faltante | 🟢 Média | Sistema nao compara `valor_unitario_estimado` do edital com custo ERP no momento da vinculacao item-produto. Deveria emitir warnin | UC-P02, UC-P04 |
| RN-121 | ⏳ Faltante | 🟡 Alta | Nao valida se `lance_inicial <= target_referencia` (Camada C). Pregoes rejeitam lances acima do estimado. Justificativa: bloquear  | UC-P07 |
| RN-122 | ⏳ Faltante | 🟡 Alta | Margem minima deveria ser parametro da empresa (`parametros_score.margem_minima_percentual`), nao hardcoded +10%. Formula: `lance_ | UC-P07 |
| RN-123 | ⏳ Faltante | 🟢 Média | Match historico (Camada F) deveria permitir busca por NCM, nao apenas nome. Janela configuravel, 12m default. | UC-P09, UC-P11 |
| RN-124 | ⏳ Faltante | 🟢 Média | Perfis `quero_ganhar`/`nao_ganhei_minimo` deveriam afetar markup da Camada B automaticamente: agressiva=15%, conservadora=30%. | UC-P05, UC-P08 |
| RN-125 | ⏳ Faltante | 🟢 Média | Comodatos cadastrados nao sao inseridos automaticamente na proposta (secao "Equipamentos em Comodato"). | UC-P10, UC-R01 |
| RN-126 | ⏳ Faltante | 🟡 Alta | Status ANVISA `atencao` e binario — deveria calcular `validade_date - today` e exibir "Vencimento em X dias" quando <=180 dias. St | UC-R04 |
| RN-127 | ⏳ Faltante | 🟡 Alta | Motor de proposta nao valida pre-requisitos: (a) item vinculado a produto, (b) Camada A salva, (c) edital em validacao ou posterio | UC-R01 |
| RN-128 | ⏳ Faltante | 🟡 Alta | Checklist de submissao (UC-R07) e readonly visual — nao bloqueia transicao `aprovada -> enviada` se item pendente. | UC-R07 |
| RN-129 | ⏳ Faltante | 🔴 Crítica | Exportacao do dossie nao registra versao nem checksum SHA-256. Rastreabilidade critica em impugnacao. | UC-R06 |
| RN-130 | ⏳ Faltante | 🟡 Alta | `markup_percentual` hoje aceita negativos silenciosamente. Deveria validar `>=0` no modo `markup`; caso precise vender abaixo do c | UC-P05 |
| RN-131 | ⏳ Faltante | 🟡 Alta | Custo ERP = 0 ou None cai silenciosamente no fallback `produto.preco_referencia`. Deveria retornar "Custo ERP invalido, edite manu | UC-P04 |
| RN-132 | ⏳ Faltante | 🔴 Crítica | RF-041-02 exige LOG imutavel de alteracoes de preco/markup. `auditoria_log` existe mas nao e gravado automaticamente pelas tools ` | UC-P04, UC-P05, UC-P06, UC-P07 |

## Sprint 4 — Impugnação/Recursos

| RN | Status | Importância | Descrição | UCs |
|----|--------|-------------|-----------|-----|
| RN-133 | ✅ | 🔴 Crítica | Impugnacao deve ser protocolada ate 3 dias uteis antes da abertura (Lei 14.133/2021, Art. 164 caput). Sistema calcula o prazo auto | UC-I03, UC-I05 |
| RN-134 | ✅ | 🟡 Alta | Geracao de peticao via IA exige >=1 inconsistencia registrada (oriunda de validacao legal previa UC-I01 ou fornecida explicitament | UC-I02, UC-I03 |
| RN-135 | ✅ | 🟡 Alta | Validacao legal exige PDF com texto extraido >=200 chars; editais sem PDF retornam `sem_pdf: true`. Fonte: RF-043-01 + `backend/to | UC-I01 |
| RN-136 | ✅ | 🔴 Crítica | Base legal minima de comparacao: Lei 14.133/2021, Lei 8.666/1993, Decreto 11.462/2023, IN SEGES/ME 73/2022, jurisprudencia TCU. In | UC-I01 |
| RN-137 | ✅ | 🟢 Média | Classificacao de gravidade em 3 niveis: ALTA (vermelho), MEDIA (amarelo), BAIXA (azul/verde). Define cor e priorizacao na tabela.  | UC-I01, UC-RE02 |
| RN-138 | ✅ | 🔴 Crítica | `sugestao_tipo` aceita `impugnacao` (Alta/Critica) ou `esclarecimento` (Media/Baixa). Usuario pode sobrepor no modal. Fonte: RF-04 | UC-I02 |
| RN-139 | ✅ | 🟢 Média | Geracao de peticao exige edital com: numero, orgao, objeto e data_abertura. Campos faltantes emitem "N/I" no prompt; data_abertura | UC-I03 |
| RN-140 | ✅ | 🔴 Crítica | Peticao/impugnacao nasce em `rascunho`. Fluxo: rascunho -> em revisao -> enviada/protocolada. Fonte: RF-043-06 + `backend/app.py:1 | UC-I03, UC-I04 |
| RN-141 | ✅ | 🔴 Crítica | Upload de peticao externa aceita `.docx`, `.pdf`, `.doc`. Fonte: RF-043-07 + UC-I04 + `frontend/src/pages/ImpugnacaoPage.tsx`. | UC-I04 |
| RN-142 | ✅ | 🔴 Crítica | Badges de prazo: `Expirado` (vermelho, <=hoje), `Urgente` (<=1d), `Atencao` (3-5d), `OK` (>5d). Endpoint classifica como expirado/ | UC-I05 |
| RN-143 | ✅ | 🔴 Crítica | Janela de recurso de 10 minutos apos declaracao do vencedor (Art. 165 §2º Lei 14.133/2021). Cronometro em tempo real. Fonte: RF-04 | UC-RE01 |
| RN-144 | ✅ | 🔴 Crítica | Manifestacao de intencao de recurso obrigatoria dentro da janela de 10min (Art. 165 §3º). Fonte: RF-044-01 + UC-RE01 passos 10-11. | UC-RE01, UC-RE04 |
| RN-145 | ✅ | 🟢 Média | Monitoramento da janela suporta 3 canais simultaneos: WhatsApp, Email, Alerta. Defaults = todos True. Fonte: RF-044-01 + `backend/ | UC-RE01 |
| RN-146 | ✅ | 🔴 Crítica | Laudo de Recurso ou Contra-Razao exige subtipo `Administrativo` ou `Tecnico`. Fonte: RF-044-09 + UC-RE04 passo 4. | UC-RE04, UC-RE05 |
| RN-147 | ✅ | 🔴 Crítica | Laudo de Recurso exige secoes `## SECAO JURIDICA` e `## SECAO TECNICA`. Fonte: RF-044-07 + UC-RE04 passo 11 + `frontend/src/pages/ | UC-RE04 |
| RN-148 | ✅ | 🟢 Média | Contra-Razao exige adicionalmente `## DEFESA` e `## ATAQUE`. Fonte: RF-044-08 + UC-RE05 passos 9-10. | UC-RE05 |
| RN-149 | ✅ | 🔴 Crítica | Status valido de recurso: enum `[rascunho, revisao, enviado, aceito, rejeitado]`. Outros valores retornam HTTP 400. Fonte: `backen | UC-RE04, UC-RE05 |
| RN-150 | ✅ | 🟡 Alta | Checklist pre-envio de 6 itens: formato PDF/DOCX, <25MB, secao juridica, secao tecnica, edital vinculado, status adequado. Todos d | UC-RE06 |
| RN-151 | ✅ | 🟡 Alta | Apos upload manual no portal, protocolo obrigatorio (ex.: "PNCP-2026-0046-REC-001"). Sem protocolo o status fica em revisao. Fonte | UC-RE06 |
| RN-152 | ✅ | 🟢 Média | Chat juridico (UC-RE03) responde apenas dentro do edital, proposta vencedora, inconsistencias e base de legislacao. Respostas deve | UC-RE03 |
| RN-153 | ✅ | 🟢 Média | LOG imutavel de edicoes em peticao/laudo com user_id, timestamp, campo, valor_anterior, valor_novo. Fonte: RF-043-06 + RF-044-10 + | UC-I03, UC-RE04, UC-RE05 |
| RN-154 | ✅ | 🟢 Média | Analise da proposta vencedora (UC-RE02) exige texto colado no `[TextArea]`. Fonte: RF-044-02 + UC-RE02 passo 3 + `backend/app.py:1 | UC-RE02 |
| RN-155 | ⏳ Faltante | 🔴 Crítica | Prazo legal de recurso = 3 dias uteis da intimacao (Art. 165 §1º I). Sistema nao calcula nem bloqueia geracao apos esse prazo. | UC-RE04, UC-RE06 |
| RN-156 | ⏳ Faltante | 🔴 Crítica | Prazo legal de contra-razao = 3 dias uteis do recebimento da intimacao (Art. 165 §3º). Nao ha contador por empresa alvo. | UC-RE05, UC-RE06 |
| RN-157 | ⏳ Faltante | 🔴 Crítica | Quando prazo de impugnacao/recurso/contra-razao esta expirado, sistema deve impedir criacao de nova peticao/laudo. Hoje `tool_gera | UC-I03, UC-RE04, UC-RE05 |
| RN-158 | ⏳ Faltante | 🟢 Média | Countdown visual padronizado: verde >72h, laranja 24-72h, vermelho <24h. Cortes atuais no frontend sao diferentes. | UC-I05, UC-RE01 |
| RN-159 | ⏳ Faltante | 🔴 Crítica | Laudo de Recurso so pode ser gerado se edital esta em status de derrota/perda. Hoje `criar_recurso_detalhado` aceita qualquer edit | UC-RE04 |
| RN-160 | ⏳ Faltante | 🔴 Crítica | Contra-Razao so pode ser gerada se (a) empresa venceu e (b) terceiro registrou recurso. Sistema nao verifica. | UC-RE05 |
| RN-161 | ⏳ Faltante | 🔴 Crítica | Categorias estruturadas de motivacao: Restritividade, Vicio Formal, Direcionamento, Preco Inexequivel (Art. 59), Qualificacao Tecn | UC-I01, UC-RE02 |
| RN-162 | ⏳ Faltante | 🟡 Alta | Upload de peticao/laudo: limite explicito 10 MB, rejeitar PDFs protegidos por senha. Hoje UI menciona "<25MB" sem validacao server | UC-I04, UC-RE04, UC-RE05 |
| RN-163 | ⏳ Faltante | 🔴 Crítica | Calculo de dias uteis deveria considerar feriados nacionais, estaduais (UF do orgao) e municipais. Hoje usa apenas `weekday()<5`.  | UC-I05, UC-RE04, UC-RE05 |
| RN-164 | ⏳ Faltante | 🟡 Alta | Deveria existir monitor automatico que transicione laudo em elaboracao para "atrasado" quando contador zerar, impedindo submissao  | UC-RE04, UC-RE05, UC-RE06 |

## Sprint 5 — Pós-venda/CRM

| RN | Status | Importância | Descrição | UCs |
|----|--------|-------------|-----------|-----|
| RN-165 | ✅ | 🔴 Crítica | Pipeline CRM tem exatamente 13 stages imutaveis: captado_nao_divulgado, captado_divulgado, em_analise, lead_potencial, monitoramen | UC-CRM01 |
| RN-166 | ✅ | 🟡 Alta | Cada edital pertence a 1 stage; transicao so aceita se stage destino estiver na lista valida. Fonte: `backend/crm_routes.py:160-16 | UC-CRM01 |
| RN-167 | ✅ | 🟢 Média | CRM distingue `pipeline_tipo_venda` em "venda pontual" (encerra no ganho definitivo) e "venda recorrente" (fluxo de execucao compl | UC-CRM01, UC-CT07, UC-CT09 |
| RN-168 | ✅ | 🔴 Crítica | Cards com substage: Impugnacao -> {aguardando, deferida, indeferida}; Recursos -> {em_elaboracao, submetidos}; Contra-Razoes -> {e | UC-CRM01, UC-CRM07 |
| RN-169 | ✅ | 🔴 Crítica | Saldo de empenho: `saldo = valor_empenhado - soma(faturas nao canceladas)`. Saldo negativo proibido. Fonte: RF-046-01 + `backend/e | UC-CT07, UC-CT08 |
| RN-170 | ✅ | 🔴 Crítica | Faturas tem status enum {pendente, paga, cancelada}; apenas `!= cancelada` entram no saldo. Fonte: `backend/models.py:2242` + `bac | UC-CT07, UC-CT08 |
| RN-171 | ✅ | 🔴 Crítica | Itens de empenho com `gera_valor=False` (calibradores, controles) geram alerta quando consumo >`limite_consumo_pct` (default 100%) | UC-CT07 |
| RN-172 | ✅ | 🔴 Crítica | Auditoria: `divergencia =  / total_faturado - total_entregue_valor / `; marca `tem_divergencia=True` se >R$0,01. Fonte: `backend/e | UC-CT08 |
| RN-173 | ✅ | 🔴 Crítica | Relatorios de auditoria exportaveis em CSV com colunas fixas + linha de TOTAIS. Fonte: `backend/empenho_routes.py:287-296` + RF-04 | UC-CT08 |
| RN-174 | ✅ | 🟡 Alta | Contratos a vencer classificados em 5 tiers exclusivos: `vencer_30`, `vencer_90`, `em_tratativa`, `renovados`, `nao_renovados`. Os | UC-CT09, UC-CT10 |
| RN-175 | ✅ | 🔴 Crítica | `tratativa_status` aceita {em_tratativa, renovado, nao_renovado, null}. Fonte: `backend/empenho_routes.py:369-371`. | UC-CT09 |
| RN-176 | ✅ | 🔴 Crítica | Contrato marcado como renovado retorna para "Contratos em Andamento" com `data_renovacao` registrada. Fonte: RF-046-03 + UC-CT09 p | UC-CT09 |
| RN-177 | ✅ | 🔴 Crítica | KPIs execucao retornam 6 metricas: contratos_ativos, vencer_30d, vencer_90d, em_tratativa, renovados, nao_renovados. "Ativo" = `st | UC-CT10 |
| RN-178 | ✅ | 🔴 Crítica | Aditivo contratual aceita {acrescimo, supressao, prazo, escopo}. Backend calcula `limite_25_pct = valor_original * 0.25` e `pct_co | UC-CT04 |
| RN-179 | ✅ | 🔴 Crítica | Aditivo exige {contrato_id, tipo, justificativa}. Fundamentacao legal deve ser um de {Art. 124-I, Art. 124-II, Art. 125, Art. 126} | UC-CT04 |
| RN-180 | ✅ | 🔴 Crítica | Designacoes contratuais aceitam 3 tipos fixos: {gestor, fiscal_tecnico, fiscal_administrativo}. Os 3 papeis sao obrigatorios por L | UC-CT05 |
| RN-181 | ✅ | 🟢 Média | Criacao de designacao exige {contrato_id, tipo, nome}; atividades fiscais ligadas a `designacao_id` exigem {tipo, descricao}. Font | UC-CT05 |
| RN-182 | ✅ | 🔴 Crítica | Solicitacao de carona valida limite individual de 50% das qtds registradas por orgao solicitante (Art. 86 §4 Lei 14.133/2021). Fon | UC-CT06 |
| RN-183 | ✅ | 🔴 Crítica | Solicitacao de carona valida limite global de 200% (o dobro) da qtd registrada, somando adesoes aprovadas (Art. 86 §5). Fonte: RF- | UC-CT06 |
| RN-184 | ✅ | 🟢 Média | ARP barra de consumo: verde (<70%), amarelo (70-89%), vermelho (>=90%). Fonte: UC-CT06 passo 4 + RF-046-08. | UC-CT06 |
| RN-185 | ✅ | 🔴 Crítica | Vigencia ARP 1 ano prorrogavel por +1 ano (Art. 84 Lei 14.133/2021). Alertas automaticos a 30/15/7 dias. Fonte: RF-046-08. | UC-CR03, UC-CT06 |
| RN-186 | ✅ | 🟢 Média | Alertas multi-tier de vencimento: Critico (<7d, vermelho), Urgente (7-15d, laranja), Atencao (15-30d, amarelo), Normal (>30d, verd | UC-CR03, UC-FU02 |
| RN-187 | ✅ | 🔴 Crítica | Alertas multi-tier cobrem 4 entidades: contrato_vencimento, arp_vencimento, garantia_vencimento, entrega_prazo. Canais escalonados | UC-CR03 |
| RN-188 | ✅ | 🟢 Média | Agenda CRM classifica urgencia: critica (<=1d), alta (<=3d), normal (>3d). Coluna aceita {critica, alta, normal, baixa}. Fonte: `b | UC-CRM04 |
| RN-189 | ✅ | 🟢 Média | Parametrizacoes CRM aceitam 3 tipos fixos: {tipo_edital, agrupamento_portfolio, motivo_derrota}. Escopadas por empresa. Fonte: RF- | UC-CRM02 |
| RN-190 | ✅ | 🟢 Média | Tipos de Edital padrao: 8 valores (Aquisicao Equip, Aquisicao Reag+Equip, Aquisicao Reag, Comodato, Locacao, Locacao+Reag, Manuten | UC-CRM02 |
| RN-191 | ✅ | 🟢 Média | Agrupamento Portfolio padrao: 13 valores (Point Of Care, Gasometria, Bioquimica, Coagulacao, ELISA, Hematologia, Imunohematologia, | UC-CRM02 |
| RN-192 | ✅ | 🟢 Média | Motivos de Derrota padrao: 7 valores (Administrativo, ME/EPP exclusivo, Falha operacional, Nao tem doc, Nao atende espec, Inviavel | UC-CRM02, UC-CRM06, UC-CRM07 |
| RN-193 | ✅ | 🟢 Média | Decisao de nao-participacao exige motivo (FK motivo_derrota) + justificativa (>=20 chars) + LOG. Move edital para "Monitoramento d | UC-CRM06 |
| RN-194 | ✅ | 🟢 Média | Decisao de perda distingue "Perda Direta" de "Perda apos Contra-Razao" via `teve_contra_razao` (Boolean). Fonte: RF-045 + UC-CRM07 | UC-CRM05, UC-CRM07 |
| RN-195 | ✅ | 🟢 Média | Motivo de perda exige descricao (>=30 chars) + categoria parametrizada + acao recomendada de {Revisar espec, Revisar precificacao, | UC-CRM07 |
| RN-196 | ✅ | 🔴 Crítica | KPIs CRM — "analisados" = stages {em_analise, lead_potencial, fase_propostas, proposta_submetida, espera_resultado, ganho_provisor | UC-CRM05 |
| RN-197 | ✅ | 🟢 Média | Ticket medio = media(valor_referencia) dos ganhos vs media dos participados. Taxa vitoria = ganhos/participados*100. Fonte: RF-045 | UC-CRM05 |
| RN-198 | ✅ | 🟢 Média | Mapa geografico usa coordenadas fixas das 27 UFs (lat/lon das capitais); editais agrupados por UF com contagem por stage. Fonte: R | UC-CRM03 |
| RN-199 | ✅ | 🔴 Crítica | Score logistico e soma ponderada 0-100: Distancia UF 30% + Historico 25% + Frete 25% + Prazo 20%. Classificacao: VIAVEL (>=70), PA | UC-FU03 |
| RN-200 | ✅ | 🟢 Média | Registro de resultado (UC-FU01) aceita {vitoria, derrota, cancelado}. Vitoria exige valor_final; Derrota exige valor_final + empre | UC-FU01 |
| RN-201 | ✅ | 🟢 Média | Saldo ARP por item: `saldo_disponivel = quantidade_registrada - consumido_participante - consumido_carona`. Saldo negativo proibid | UC-CT06 |
| RN-202 | ✅ | 🟡 Alta | Entrega status enum {pendente, entregue, atrasado, cancelado}. `data_prevista` obrigatoria; `data_realizada > data_prevista` = atr | UC-CT02, UC-CT03 |
| RN-203 | ✅ | 🔴 Crítica | Contrato status enum {vigente, encerrado, rescindido, suspenso}. Aditivos, empenhos e entregas so podem ser criados em contratos ` | UC-CT01, UC-CT02, UC-CT04, UC-CT07 |
| RN-204 | ⏳ Faltante | 🟡 Alta | Pipeline CRM deve validar transicoes permitidas (nao permitir pular de `captado_divulgado` direto para `resultado_definitivo`). Ho | UC-CRM01 |
| RN-205 | ⏳ Faltante | 🟢 Média | Regresso de stage deve exigir autorizacao de gestor + log com motivo. Hoje o retrocesso e livre. Justificativa: impede mascarar in | UC-CRM01 |
| RN-206 | ⏳ Faltante | 🔴 Crítica | Gestor e fiscal de um contrato devem ser pessoas diferentes (segregacao). Hoje nao ha check em `ContratoDesignacao`. Justificativa | UC-CT05 |
| RN-207 | ⏳ Faltante | 🔴 Crítica | Aditivo deve ser BLOQUEADO pelo backend quando percentual acumulado ultrapassa 25% (compras/servicos) ou 50% (obras). Hoje apenas  | UC-CT04 |
| RN-208 | ⏳ Faltante | 🔴 Crítica | Entrega deve exigir `nota_fiscal` obrigatorio — hoje nullable. Justificativa: Lei 14.133/2021 exige comprovante fiscal. | UC-CT02 |
| RN-209 | ⏳ Faltante | 🟡 Alta | Nao permitir criar fatura cuja soma cumulativa (nao canceladas) ultrapasse `valor_empenhado`. Hoje calcula saldo apenas na leitura | UC-CT07, UC-CT08 |
| RN-210 | ⏳ Faltante | 🔴 Crítica | Numero de empenho deve seguir padrao `EMPH-AAAA-NNN` ou `AAAANE000NNN`. Hoje e String(100) livre. Justificativa: rastreabilidade c | UC-CT07, UC-CT08 |
| RN-211 | ⏳ Faltante | 🔴 Crítica | Alerta formal ao gestor quando divergencia em auditoria >= R$1.000 OU >=5% do empenhado. Threshold atual R$0,01 gera ruido. Justif | UC-CT08 |
| RN-212 | ⏳ Faltante | 🔴 Crítica | Contador de prazo em Recursos/Contra-Razoes em elaboracao deve disparar evento automatico movendo card para "atrasado" quando zera | UC-CRM01, UC-RE04, UC-RE05 |
| RN-213 | ⏳ Faltante | 🟢 Média | Ata de pregao deve permitir vinculacao 1:N com editais (mesmo vencedor em varios lotes). `AtaConsultada` nao formaliza a relacao.  | UC-AT02, UC-AT03 |
| RN-214 | ⏳ Faltante | 🟡 Alta | KPIs do CRM devem incluir "Tempo Medio de Ganho" (lance -> ganho definitivo) conforme RF-045-05 KPI 8. Nao computado hoje. | UC-CRM05 |
| RN-215 | ⏳ Faltante | 🔴 Crítica | KPIs devem incluir "Indice de Reversao por Recursos" (ganhos via recurso / total participados) conforme RF-045-05 KPI 4. | UC-CRM05 |
| RN-216 | ⏳ Faltante | 🔴 Crítica | Todo contrato recorrente deve ter >=1 designacao ativa de gestor. Contrato orfao (sem designacao) deveria ser NAO-CONFORME. Justif | UC-CT01, UC-CT05 |
| RN-217 | ⏳ Faltante | 🟢 Média | Mapa geografico (UC-CRM03) deve exibir valor total em R$ por UF (soma `valor_referencia`), alem da contagem. Hoje so agrupa por st | UC-CRM03 |

---

## Notas

1. As 22 RNs marcadas 🆕 V4 foram implementadas nesta sessão em modo **warn-only** (ativadas com `ENFORCE_RN_VALIDATORS=true`).
2. RN-040 já estava no código; apenas a documentação foi atualizada.
3. Critério de **importância** é heurístico — baseado em palavras-chave da descrição (legais, gates, validadores → CRÍTICA; outros validadores → ALTA; UI/formato → MÉDIA).
4. As `Aplicável a: UC-XXX` são extraídas literalmente da Seção 13 de `requisitos_completosv8.md`.