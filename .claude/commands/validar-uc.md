---
description: Gera dataset+caso de teste+tutorial (3 camadas x 3 trilhas) e executa validação com loop até convergir
argument-hint: "UC-F01 --modo=visual  |  --sprint=1 --modo=e2e  |  --ciclo=<id> --modo=visual"
---

# VALIDAÇÃO AUTOMATIZADA DE CASOS DE USO — PROTOCOLO V3

## ARGUMENTOS

Os argumentos passados ao slash command estão em `$ARGUMENTS`. Formas aceitas:

- `UC-F01 --modo=visual` — 1 UC isolado (herda ou cria contexto de ciclo)
- `--sprint=1 --modo=e2e` — sprint inteira
- `--sprint=1,2,3,4,5 --modo=e2e` — multi-sprint com contexto reusado
- `--ciclo=<ciclo_id> --modo=visual` — retomar ciclo existente
- `--modo` default: `e2e` (se omitido)

**Antes de iniciar a Fase 0**, parse `$ARGUMENTS` e confirme com o humano:
- Quais UCs entram
- Qual modo
- Qual ambiente (agenteditais 5180 para e2e/visual, editaisvalida 5179 para humano)
- Se já existe ciclo aberto ou se cria novo

Aguarde "prossiga" antes de começar.

---

## CONTEXTO E OBJETIVO

Você opera como `validation-coordinator` do time de validação. Sua execução tem **6 fases obrigatórias**:

**FASE 0 (Provisionamento) → FASE 1 (Datasets) → FASE 2 (Casos de teste) → FASE 3 (Tutoriais) → FASE 4 (Execução) → FASE 5 (Relatório)**

Cada fase tem checkpoint humano. Você delega julgamento aos agentes especializados em `.claude/agents/validation-*.md`. Nunca julga conteúdo sozinho.

**Cobertura obrigatória:** para cada UC, gere **um caso de teste por variação** — Fluxo Principal (FP) + cada Fluxo Alternativo (FAn) + cada Fluxo de Exceção (FEn). Nunca um caso "abrangente".

**Time de 9 agentes** (em `.claude/agents/validation-*.md`):
- `validation-coordinator` (você) — orquestra
- `validation-uc-analyzer` — extrai estrutura do UC
- `validation-dataset-auditor` — adversarial, audita contexto da Fase 0
- `validation-test-case-generator` — gera caso de teste por variação+trilha
- `validation-tutorial-writer` — escreve tutoriais
- `validation-semantic-judge` — juiz semântico
- `validation-root-cause-classifier` — classifica divergência (no loop de correção)
- `validation-critique` — 2ª opinião adversarial
- `validation-code-fixer` — propõe diff (no loop)

Artefatos são salvos em:
- **Contexto do ciclo (Fase 0):** `testes/contextos/<ciclo_id>/contexto.yaml` + `editais/` + `docs/`
- **Datasets (Fase 1):** `testes/datasets/<uc_id>_{e2e,visual,humano}.yaml`
- **Casos de teste (Fase 2):** `testes/casos_de_teste/<uc_id>_{e2e,visual,humano}_<variacao>.{yaml,md}`
- **Tutoriais (Fase 3):** `testes/tutoriais_{playwright,visual,humano}/<uc_id>_<variacao>.md`
- **Relatórios (Fase 5):** `testes/relatorios/{automatico,visual,humano}/<uc_id>_<timestamp>.md`
- **Evidências:** `testes/relatorios/<trilha>/<uc_id>/<timestamp>/`

Leitura obrigatória: `docs/VALIDACAOFACILICITA.md` (processo completo).

---

## FASE 0 — PROVISIONAMENTO DE CONTEXTO DO CICLO

**Quando roda:** apenas uma vez por ciclo. `/validar-uc --sprint=1,2,3` provisiona contexto antes do primeiro UC; demais UCs reusam. `/validar-uc UC-F01` isolado: se há ciclo aberto, reusa; senão, executa Fase 0.

**Provisiona para cada uma das 3 trilhas (E2E, Visual, Humana):**

### 0.1 Alocar usuário sequencial
Consulta o banco pelo maior `valida<N>` em `users.email LIKE 'valida%@valida.com.br'` e reserva os próximos 3 IDs livres. Senha padrão: `123456`. Papel: `usuario_valida`.

### 0.2 Gerar CNPJ único
Algoritmo da RF (14 dígitos, 2 DVs). Verifica `SELECT id FROM empresas WHERE cnpj = ?`. Se colidir, retry. 10 colisões consecutivas → impasse.

### 0.3 Selecionar editais do PNCP
Invoca funções de `backend/tools.py` (`_buscar_edital_pncp_por_numero`, `_buscar_arquivos_pncp`) para selecionar 3 editais com `dataAberturaProposta` futura (>= hoje + 3 dias) e PDF baixável. Baixa para `testes/contextos/<ciclo_id>/editais/`. Pula se UCs do ciclo não envolvem edital.

### 0.4 Renderizar documentos fictícios
Templates Jinja2 em `testes/fixtures/documentos_template/`. Renderiza Contrato Social, CND Federal, FGTS, Trabalhista, SICAF, Alvará para cada empresa. Saída: `testes/contextos/<ciclo_id>/docs/<trilha>/`.

### 0.5 Criar usuários no banco (NÃO empresas)
`INSERT INTO users (...)` — 3 usuários. **Empresa NÃO é criada na Fase 0** — fica a cargo do UC-F01 via UI (Opção Y).

### 0.6 Gravar contexto
`testes/contextos/<ciclo_id>/contexto.yaml` com IDs de usuários, CNPJs pretendidos, paths de editais e documentos.

### 0.7 Auditoria adversarial
Chamar `validation-dataset-auditor` com o contexto.yaml. Se reprovar (severidade CRITICA): voltar ao 0.1 e reprovisionar.

### 0.8 Checkpoint obrigatório
Apresenta tabela comparativa das 3 trilhas:
- Usuário alocado
- CNPJ gerado
- Razão social pretendida
- N editais selecionados + URLs
- N documentos renderizados

Aguarda "prossiga" antes de Fase 1.

### 0.9 Reutilização e retomada
`/validar-uc --ciclo=<id>` pula Fase 0 e usa contexto existente.

### 0.10 Regra de ordem: UC-F01 primeiro
Se ciclo inclui UCs da Sprint 1, UC-F01 é o primeiro. Cria a empresa via UI (Opção Y), preenchendo `empresa.id` no contexto. Falha em UC-F01 → ciclo bloqueia.

---

## FASE 1 — SÍNTESE DE DATASETS

Para cada UC do ciclo, gere **3 datasets** em `testes/datasets/<uc_id>_{e2e,visual,humano}.yaml`. Datasets contêm **só valores**, sem asserções nem instrução. Referenciam o contexto do ciclo (`contexto_ref`) para usuário/empresa/editais.

### 1.1 Antes da síntese: chamar `validation-uc-analyzer`
Delega ao agente a leitura do UC.md. Retorno: estrutura YAML com FP + FAs + FEs + RNs + dados necessários inferidos. Sem essa estrutura, não há síntese.

### 1.2 Conjunto E2E (`<uc_id>_e2e.yaml`)
Determinístico. Strings com prefixo `E2E_<YYYYMMDD>_`. Triplo formato para campos numéricos/datados:
- entrada (como o usuário digita): `"45230,00"`
- exibição (como aparece renderizado): `"R$ 45.230,00"`
- trânsito (como vai pro backend): `45230.00`

### 1.3 Conjunto VISUAL (`<uc_id>_visual.yaml`)
Memorável. Strings prefixadas `DEMO_`. Mesmo triplo formato. Prefere valores legíveis no painel (você vai estar olhando).

### 1.4 Conjunto HUMANO (`<uc_id>_humano.yaml`)
Realista. CNPJs válidos pela RF, nomes profissionais, valores em R$ com centavos coerentes, datas plausíveis.

### 1.5 Variações
Cada dataset deve incluir valores tanto para o FP quanto para FAs/FEs (ex: CEP inválido para FA1, payload que dispara 500 para FE2). Estrutura sugerida:

```yaml
valores_fp:
  empresa: {cnpj_entrada: "...", ...}
valores_fa1_cep_nao_encontrado:
  cep_proposital_invalido: "00000-000"
valores_fe2_backend_500:
  payload_que_dispara_erro: {...}
```

### 1.6 Checkpoint obrigatório
Apresenta os 3 datasets em formato tabular comparativo. Aguarda "prossiga".

---

## FASE 2 — GERAÇÃO DE CASOS DE TESTE

Para cada UC × cada trilha × cada variação, gere **um caso de teste**. Total: ~6 variações × 3 trilhas = 18 arquivos por UC típico.

Delega ao agente `validation-test-case-generator` (chamado **uma vez por trilha+variação**).

### 2.1 Formato por trilha

- **E2E** (`testes/casos_de_teste/<uc_id>_e2e_<variacao>.yaml`): YAML rígido com asserções nas 3 camadas (DOM, Rede, Semântica). Inclui `descricao_ancorada`, `elementos_obrigatorios`, `elementos_proibidos`. Referencia `dataset_ref`.
- **Visual** (`testes/casos_de_teste/<uc_id>_visual_<variacao>.yaml`): YAML com asserções automáticas + `pausa_para_observacao` (pontos para o PO observar) + `screenshots_obrigatorios`.
- **Humana** (`testes/casos_de_teste/<uc_id>_humano_<variacao>.md`): Markdown com checklists objetivos por passo (sem seletores, sem asserções de rede).

### 2.2 Regra de ouro da descrição ancorada
Se um humano leigo, lendo só a `descricao_ancorada`, conseguir confundir duas telas diferentes do sistema, ela está fraca. Reescreva. A lista `elementos_proibidos` é tão importante quanto `elementos_obrigatorios` — sem ela, o juiz semântico ignora ausências.

### 2.3 Variações herdam do FP
Caso de teste de FA1 ou FE2 pode marcar `herda_de: fp` e listar apenas os passos **alterados**. Reduz duplicação.

### 2.4 Checkpoint obrigatório
Apresenta lista de casos de teste gerados (paths + resumo de uma linha por variação). Aguarda "prossiga".

---

## FASE 3 — GERAÇÃO DE TUTORIAIS

Para cada caso de teste, gere o **tutorial** que executa aquele caso. Delega ao `validation-tutorial-writer`.

### 3.1 Tutorial E2E (`testes/tutoriais_playwright/<uc_id>_<variacao>.md`)
YAML runnable. Cada passo: `acao` (tipo + seletor + `valor_from_dataset`) + `validacao_ref` apontando pro caso de teste. Limpeza pós-execução obrigatória (`DELETE WHERE ... LIKE 'E2E_%'`).

### 3.2 Tutorial Visual (`testes/tutoriais_visual/<uc_id>_<variacao>.md`)
MD em prosa (renderizado no painel :9876) + blocos YAML para o parser Python. Cada passo tem texto de "o que vai acontecer" + "observe criticamente" + bloco `acao_executor`.

### 3.3 Tutorial Humano (`testes/tutoriais_humano/<uc_id>_<variacao>.md`)
Markdown PT-BR fluido. Dados embutidos **inline** (Arnaldo não tem parser). Inclui pré-condições, dados de teste em tabela, passos com "O que fazer" + "O que deve acontecer" + "Observar criticamente" + checklist objetivo.

### 3.4 Checkpoint obrigatório
Apresenta caminhos dos tutoriais e resumo de 1 linha por passo. Aguarda "prossiga" antes de Fase 4.

---

## FASE 4 — EXECUÇÃO

Depende do `--modo`:

### 4.1 `--modo=e2e` (default)
Runner Playwright headless executa `tutoriais_playwright/<uc_id>_<variacao>.md`. Para cada passo:

**Pré-passo:**
- Log: timestamp, step_id, estado atual
- Screenshot: `testes/relatorios/automatico/<uc_id>/<timestamp>/before_<step_id>.png`
- Snapshot da árvore de acessibilidade (preferir sobre HTML bruto)

**Ação:**
- Executa via Playwright com seletor preferencial (fallback uma vez)
- Intercepta `page.on('request')` e `page.on('response')` desde antes da ação

**Validação em 3 camadas (ordem barato → caro):**

1. **Estrutural DOM** (ms, determinística) — verifica `asserts_dom` do caso de teste. Falha → REPROVADO, não chama camada semântica.
2. **Estrutural Rede** (s, determinística) — verifica `asserts_rede`. Captura payloads completos. Falha → REPROVADO.
3. **Semântica** (custosa, não-determinística) — só se 1 e 2 passaram. Tira `after_<step_id>.png`. Chama agente `validation-semantic-judge` com screenshot + a11y tree + descrição ancorada + elementos obrigatórios/proibidos.
   - Se `confianca < 0.85`: chama 2x adicionais e aplica voto majoritário (2 de 3).
   - Se `validacao_backend` definida no caso de teste: executa query/chamada e compara com `resultado_esperado`.

**Pós-passo:**
- Log do veredito com evidências
- Se REPROVADO: para o caso de teste (não tenta recuperar), vai pra Fase 5
- Se APROVADO: prossegue

### 4.2 `--modo=visual`
Sobe Flask :9876 + browser headed via `python testes/framework_visual/executor.py <ciclo_id> <uc_id>`. PO acompanha em tempo real, pausa a cada passo, comenta, marca correções. Camadas DOM e Rede rodam automaticamente; Semântica ainda chama `semantic-judge`.

### 4.3 `--modo=humano`
**Não executa.** Apenas confirma que `tutoriais_humano/*` foram gerados e instrui:
> "Tutoriais prontos em `testes/tutoriais_humano/`. Envie ao validador externo (Arnaldo) para execução manual em editaisvalida (porta 5179). Ao receber resposta, salve em `testes/relatorios/humano/<uc_id>_resposta_<validador>.{md,docx,txt}`."

---

## FASE 5 — RELATÓRIO

Produza `testes/relatorios/<trilha>/<uc_id>_<timestamp>.md` contendo:

1. **Sumário executivo** — APROVADO/REPROVADO global, taxa de passos aprovados, duração, custo em tokens
2. **Linha do tempo** — tabela com cada passo × variação, veredito, duração, qual camada determinou. Se a Camada Semântica nunca for o gargalo, ela pode estar permissiva demais.
3. **Evidências por passo** — links para screenshots before/after, payloads de rede em JSON completo, JSON da análise semântica, resultado da validação backend
4. **Discrepâncias detectadas** — priorizadas por severidade (crítica → cosmética)
5. **Custo de execução** — tokens em camada semântica, tempo total, número de re-análises por baixa confiança
6. **Recomendações de manutenção:**
   - Passos com `descricao_ancorada` repetidamente baixa-confiança (refinar)
   - Seletores que caíram para fallback (refatorar no produto)
   - Asserções redundantes entre camadas (simplificar)

Inclui referência aos 3 artefatos usados (dataset, caso de teste, tutorial) no header do relatório.

---

## REGRAS INVIOLÁVEIS

1. **Nunca reescreva um caso de uso silenciosamente.** Se o spec é ambíguo, pare e pergunte antes da Fase 1.

2. **Nunca invente dados "para fazer funcionar".** Se faltam dados, volte à Fase 1 e pergunte.

3. **Nunca use a camada semântica como muleta para seletores ruins.** Se o DOM está testável, teste no DOM — é mais barato e determinístico.

4. **Sempre limpe os dados de teste** (trilha E2E) após execução, usando `criterios_limpeza`. Trilha Visual: limpeza manual quando você decidir resetar. Trilha Humana: nunca apaga.

5. **Sempre prefira árvore de acessibilidade** sobre HTML bruto.

6. **Na dúvida, reprove.** Falso negativo (passou mas deveria falhar) é mais caro que falso positivo no Facilicita.IA, onde propostas têm consequência jurídica.

7. **Nunca pule os checkpoints** das Fases 0, 1, 2 e 3. Gerar artefatos sobre dados/casos errados desperdiça tokens.

8. **Cobertura completa de fluxos.** Aprovar só o FP = REPROVAR o UC. FAs e FEs são obrigatórios.

9. **UC-F01 primeiro** quando o ciclo inclui Sprint 1. Se falhar, bloqueia o ciclo inteiro.

10. **Respeite `.claude-protected`.** Nenhum agente pode propor mudança em arquivo listado lá.

---

## INÍCIO DA EXECUÇÃO

Aguardo `$ARGUMENTS`. Ao recebê-los:
1. Parse argumentos
2. Confirme com o humano (UCs, modo, ambiente, ciclo novo ou retomada)
3. Comece pela Fase 0 (ou pula se ciclo existente)
4. Apresente checkpoints obrigatórios em cada fase

Para o loop de correção (após reprovações), use `/corrigir-divergencias`.
