---
description: Loop de validação+correção até convergir ou atingir impasse (invoca /validar-uc e agentes root-cause-classifier + critique + code-fixer)
argument-hint: "UC-F01,UC-F02  |  --sprint=1  |  --ciclo=<id> --teto=3"
---

# CORREÇÃO AUTOMÁTICA DE DIVERGÊNCIAS — PROTOCOLO DE LOOP

## ARGUMENTOS

Argumentos em `$ARGUMENTS`. Formas aceitas:

- `UC-F01,UC-F02` — lista de UCs a entrar no ciclo
- `--sprint=1` — sprint inteira
- `--ciclo=<ciclo_id>` — retomar ciclo existente
- `--teto=N` — teto de iterações (default 3, range 1-5). Recomenda-se começar com 1 na primeira rodada do processo.

**Antes da Fase 0**, parse `$ARGUMENTS` e confirme com o humano:
- Quais UCs entram
- Teto de iterações
- Branch base (default: `main`)
- Existe `.claude-protected`? (leia se houver)
- Validação manual humana está agendada/em curso?

Aguarde "prossiga".

## CONTEXTO E OBJETIVO

Este comando fecha o ciclo de validação: recebe um ou mais casos de
uso, executa o protocolo `/validar-uc`, e quando há divergências,
tenta corrigir o código automaticamente e re-validar. O loop só
termina em três condições: (1) todos os casos aprovados, (2) teto
de iterações atingido, (3) impasse declarado.

**Time de 9 agentes** (ver `docs/VALIDACAOFACILICITA.md` seção 9):
você atua como `validation-coordinator` do loop de correção. Para
cada divergência encontrada pelo `/validar-uc`:
1. Chama `validation-root-cause-classifier` para classificar em 8 categorias
2. Se categoria é `DEFEITO_CODIGO_*`, chama `validation-code-fixer` para propor diff
3. **Obrigatoriamente** chama `validation-critique` para 2ª opinião adversarial antes de aplicar
4. Se critique aprovar: aplica diff, commit em branch isolada, re-valida
5. Se critique vetar: `IMPASSE_CRITIQUE_VETO`
6. Se outra categoria (ambiguidade, decisão de produto, zona protegida, etc): impasse imediato

Este comando opera em paralelo à validação manual conduzida pelo
Product Owner. Divergências que exigem decisão de produto, spec
ambígua, ou julgamento de negócio NÃO devem ser resolvidas aqui —
são marcadas como impasse e aguardam a validação humana.

Pressuposto: o comando `/validar-uc` está instalado e funcional, e
os artefatos que ele produz (tutoriais, relatórios, evidências)
seguem as convenções de diretório do projeto.

---

## PRINCÍPIOS INVIOLÁVEIS (LEIA ANTES DE QUALQUER AÇÃO)

1. **O caso de uso é a verdade, o código é hipótese.** Quando o
   código diverge do caso de uso, a correção vai no código — nunca
   reinterprete o caso de uso para justificar o código atual. Se o
   caso de uso parecer errado, isso é IMPASSE, não licença para
   reescrevê-lo.

2. **Código é modificado apenas em branch isolada.** Nunca commit
   direto na main/master/develop. Abrir PR, não fazer merge
   automático.

3. **Validação manual humana é autoridade superior.** Se o tutorial
   humano (executado pelo PO) reprovar algo que o automático
   aprovou, o automático estava errado — registre e ajuste o
   protocolo de validação, não o código.

4. **Arquivos protegidos nunca são modificados automaticamente.**
   Ver seção "Zonas protegidas" abaixo. Divergência que exige
   mudança em zona protegida é impasse obrigatório.

5. **Teto de iterações é absoluto.** Máximo 3 tentativas de correção
   por caso de uso. Além disso, declare impasse — não tente mais.

6. **Regressão é rollback.** Se correção do caso A quebrou caso B
   previamente aprovado, reverter imediatamente e declarar impasse
   de conflito entre casos.

7. **Na dúvida sobre causa raiz, não corrija.** Preferir impasse a
   correção especulativa.

---

## ZONAS PROTEGIDAS (NÃO MODIFICAR AUTOMATICAMENTE)

Lista de arquivos/diretórios onde o agente NUNCA propõe correção
automática, mesmo que a divergência pareça apontar para eles. Qualquer
divergência que exija alteração nestas áreas é IMPASSE obrigatório
com alerta explícito:

- Lógica de cálculo financeiro (propostas, lances, valores finais)
- Integrações com sistemas governamentais (ComprasNet, BEC, Licitações-e)
- Código de auditoria, log e trilha de evidências
- Migrations de banco de dados
- Código de autenticação, autorização e sessão
- Arquivos de configuração de produção (secrets, credenciais, URLs
  de integração)
- Schemas de dados expostos em API pública
- Qualquer arquivo listado em `.claude-protected` na raiz do projeto

Se o projeto tiver um `.claude-protected`, leia-o ANTES de iniciar o
loop e adicione à lista acima.

---

## FASE 0 — PREPARAÇÃO

### 0.1 Checkpoint inicial obrigatório

Antes de executar qualquer coisa, confirme com o usuário:

- Quais casos de uso entram neste ciclo (IDs explícitos)
- Branch base a partir da qual criar a branch de correção
- Teto de iterações (default: 3, pode ser ajustado entre 1 e 5)
- Há `.claude-protected` no projeto? (ler se houver)
- Validação manual humana está agendada/em curso? (para cross-check
  posterior)

Apresente o plano e aguarde "prossiga".

### 0.2 Criar branch de trabalho

```bash
git checkout -b validacao/<timestamp>-<lista_uc_ids>
```

Commit inicial vazio com marca do ciclo:

```
chore(validacao): inicia ciclo automático para UC-042, UC-043
Teto de iterações: 3
Casos de uso versão: <x.y.z>
```

### 0.3 Baseline de casos já aprovados

Identifique todos os casos de uso do projeto que estavam APROVADOS
na última execução registrada (consultar `testes/relatorios/`). Esta
lista é a "baseline de não-regressão" — qualquer um deles que
quebrar durante o loop exige rollback.

---

## FASE 1 — EXECUTAR VALIDAÇÃO INICIAL

Para cada caso de uso no ciclo:

1. Executar `/validar-uc` seguindo seu protocolo integral (Fases 1-4)
2. Coletar relatório em `testes/relatorios/<uc_id>_<timestamp>.md`
3. Registrar veredito global: APROVADO ou REPROVADO

Ao final, produzir sumário:

| UC    | Veredito  | Passos falhos | Camada de falha      |
|-------|-----------|---------------|----------------------|
| UC-042| APROVADO  | 0             | —                    |
| UC-043| REPROVADO | passo_05      | estrutural_rede      |
| UC-044| REPROVADO | passo_03,07   | semântica, dom       |

Se todos APROVADOS: pular para Fase 5 (encerramento).

---

## FASE 2 — CLASSIFICAÇÃO DE CAUSA RAIZ

Para cada divergência detectada, classifique em UMA das categorias
abaixo. **Esta classificação determina se há correção automática.**

### 2.1 Categorias corrigíveis automaticamente

**DEFEITO_CODIGO_OBVIO** — padrão reconhecível de bug:
- Status HTTP incorreto retornado pelo endpoint
- Validação de campo ausente ou com regra errada
- Formatação de saída divergente do esperado (ex: valor sem
  formatação pt-BR)
- Mensagem de erro/sucesso com texto diferente do especificado
- Campo ausente na response ou payload
- Ordem de elementos na resposta
- Cabeçalho HTTP faltando ou incorreto

**DEFEITO_CODIGO_COMPORTAMENTAL** — lógica aparentemente errada mas
não trivial:
- Fluxo executa na ordem errada
- Efeito colateral ausente (ex: não grava em tabela de auditoria)
- Condição não tratada (branch faltando)

### 2.2 Categorias que NÃO viram correção automática

**AMBIGUIDADE_SPEC** — o caso de uso permite mais de uma interpretação
razoável, e a interpretação do código é uma delas. Requer decisão
humana sobre qual é a correta.

**DECISAO_PRODUTO** — o comportamento atual não está errado, é uma
escolha de produto que conflita com o caso de uso. Requer PO decidir
se muda a spec ou muda o código.

**DADO_TESTE_INCORRETO** — o dado sintetizado na Fase 1 do `/validar-uc`
pode estar errado (ex: CNPJ inválido, data fora do range permitido
legitimamente pelo sistema). Requer revisão do gerador de dados, não
do código.

**JUIZ_SEMANTICO_FLUTUANTE** — divergência apenas na camada semântica
com baixa confiança ou voto dividido. Pode ser descrição ancorada
fraca, não bug. Requer refinamento da descrição ancorada no tutorial
Playwright, não do código.

**ZONA_PROTEGIDA** — correção exigiria modificar arquivo listado em
zonas protegidas.

**CAUSA_RAIZ_OBSCURA** — análise não consegue determinar com confiança
razoável onde está o defeito. Na dúvida, NÃO corrigir.

### 2.3 Formato da classificação

Para cada divergência, produza um bloco:

```yaml
divergencia_id: UC-043_passo_05_div01
caso_uso: UC-043
passo: passo_05_enviar_proposta
camada_detectora: estrutural_rede
sintoma: "Endpoint POST /api/propostas retornou 500, esperado 201"
evidencia: "testes/relatorios/UC-043/20260416_143000/after_passo_05.png"

analise:
  hipotese_causa_raiz: |
    Handler do endpoint não trata caso de anexo com tamanho > 5MB.
    Stack trace no log mostra IOError não capturado em
    propostas/handler.py:142.
  confianca: 0.9
  categoria: DEFEITO_CODIGO_COMPORTAMENTAL
  arquivos_envolvidos:
    - app/propostas/handler.py
  zona_protegida_afetada: false

acao_recomendada: CORRIGIR_AUTOMATICO
```

### 2.4 Checkpoint obrigatório

Apresente a classificação completa de TODAS as divergências e aguarde
"prossiga" antes de qualquer modificação de código. Isto dá ao usuário
chance de:
- Discordar de classificações
- Promover uma divergência de IMPASSE para CORRIGIR (se ele sabe algo
  que o agente não sabe)
- Rebaixar uma divergência de CORRIGIR para IMPASSE (se ele suspeita
  de decisão de produto)

---

## FASE 3 — CORREÇÃO (apenas categorias corrigíveis)

Para cada divergência classificada como CORRIGIR_AUTOMATICO:

### 3.1 Propor a correção

1. Ler o(s) arquivo(s) envolvido(s) integralmente
2. Verificar novamente que não está em zona protegida
3. Produzir o diff da correção mínima necessária
4. Explicar em 2-3 linhas: o que estava errado, o que muda, por que
   essa mudança resolve a causa raiz identificada
5. Identificar efeitos colaterais potenciais (outros testes que podem
   ser afetados, comportamentos adjacentes)

### 3.2 Checkpoint de correção

Apresentar todas as correções propostas em um único bloco e aguardar
"prossiga" ou feedback específico. Formato:

```
### Correções propostas nesta iteração

#### Correção 1 — UC-043_passo_05_div01
Arquivo: app/propostas/handler.py
Causa raiz: IOError não capturado em upload de anexo grande
Efeito colateral: nenhum identificado (função isolada)

<diff>

---

#### Correção 2 — ...
```

O usuário pode responder:
- "prossiga" → aplica todas
- "prossiga, mas não aplique a correção N" → aplica parcialmente
- "revise a correção N porque Y" → retorna à análise

### 3.3 Aplicar e commitar

Para cada correção aprovada:

1. Aplicar o diff
2. Commit atômico (uma correção por commit):
   ```
   fix(validacao): <resumo de uma linha>

   Divergência: <divergencia_id>
   Caso de uso: <uc_id>
   Causa raiz: <hipotese_causa_raiz>
   Iteração: <n>
   ```

3. Registrar em `testes/relatorios/ciclo_<timestamp>/correcoes.md`:
   divergência, arquivo, hash do commit, justificativa

---

## FASE 4 — RE-VALIDAÇÃO E DETECÇÃO DE REGRESSÃO

### 4.1 Re-executar casos afetados

Executar `/validar-uc` em:
- Todos os casos de uso do ciclo atual (incluindo os que passaram
  na Fase 1, pois correções podem ter efeito cruzado)
- Subconjunto da baseline de não-regressão: priorizar casos que
  tocam nos mesmos arquivos modificados. Se bateu em arquivo crítico
  (compartilhado), rodar baseline completa.

### 4.2 Análise dos resultados

Quatro cenários possíveis:

**Cenário A — Todos do ciclo aprovados, baseline intacta.**
Ir para Fase 5.

**Cenário B — Ciclo melhorou, sem regressão, mas ainda há falhas.**
Incrementar contador de iteração. Se contador < teto: voltar à
Fase 2 (re-classificar divergências remanescentes e tentar novamente).
Se contador == teto: declarar IMPASSE_TETO_ITERACOES.

**Cenário C — Regressão detectada na baseline.**
Correção do ciclo quebrou caso de uso previamente aprovado.
Ação imediata: `git revert` dos commits desta iteração. Declarar
IMPASSE_REGRESSAO com detalhes de qual caso quebrou e por quê.
Não tentar "corrigir a correção" — os casos estão em conflito e
isso requer decisão humana.

**Cenário D — Ciclo não melhorou (mesmas falhas persistem).**
A correção aplicada não resolveu a causa raiz identificada. Isso é
sinal forte de classificação errada — a causa raiz real é outra.
Incrementar contador, mas reduzir confiança das classificações
automáticas na próxima iteração. Se repetir 2x seguidas, declarar
IMPASSE_CAUSA_RAIZ_OBSCURA.

---

## FASE 5 — ENCERRAMENTO

### 5.1 Relatório final do ciclo

Produzir `testes/relatorios/ciclo_<timestamp>/relatorio_ciclo.md`:

1. **Status final**: SUCESSO_TOTAL, SUCESSO_PARCIAL, IMPASSE

2. **Métricas**:
   - Iterações executadas
   - Casos de uso no ciclo × aprovados ao final
   - Correções aplicadas (total e por caso)
   - Tokens consumidos (validação + análise de causa raiz + correção)
   - Tempo total de parede

3. **Correções efetuadas**: lista com commits, arquivos, causas raiz

4. **Impasses declarados**: lista com divergência, categoria, razão,
   recomendação de ação humana

5. **Diff consolidado**: output de `git diff <base>..HEAD` para
   revisão rápida

6. **Alertas para validação manual humana**: lista de pontos que o
   PO deveria verificar com atenção especial neste ciclo, tipicamente:
   - Comportamentos modificados em consequência das correções
   - Divergências semânticas de baixa confiança que passaram
   - Casos onde a correção tocou em código próximo de zonas sensíveis

### 5.2 Abrir Pull Request

```bash
gh pr create \
  --base <branch_base> \
  --title "Validação automática: UC-042, UC-043, UC-044 (<status>)" \
  --body-file testes/relatorios/ciclo_<timestamp>/relatorio_ciclo.md
```

PR fica aguardando revisão humana. NÃO fazer merge automático.

### 5.3 Cross-check com validação manual

Se a validação manual humana (executada pelo PO em paralelo usando
o tutorial humano) estiver disponível, comparar:

- Casos onde automático APROVOU e humano APROVOU → consistente
- Casos onde automático APROVOU e humano REPROVOU → **bandeira
  vermelha**: automático foi permissivo demais, ajustar prompt de
  validação, NUNCA apenas confiar no automático
- Casos onde automático REPROVOU e humano APROVOU → automático foi
  rigoroso demais, revisar descrição ancorada ou classificação de
  causa raiz
- Casos onde automático REPROVOU e humano REPROVOU → consistente

Registrar análise no relatório final como seção "Cross-check manual".

---

## TIPOS DE IMPASSE — REFERÊNCIA

Ao declarar impasse, use um destes tipos e siga a recomendação:

| Tipo                        | Ação recomendada                                    |
|-----------------------------|-----------------------------------------------------|
| IMPASSE_AMBIGUIDADE_SPEC    | PO + time revisam spec, reescrevem caso de uso      |
| IMPASSE_DECISAO_PRODUTO     | Reunião de produto, decidir spec vs. código         |
| IMPASSE_ZONA_PROTEGIDA      | Desenvolvedor sênior revisa manualmente             |
| IMPASSE_DADO_TESTE          | Revisar Fase 1 do /validar-uc (gerador de dados)    |
| IMPASSE_JUIZ_FLUTUANTE      | Refinar descricao_ancorada no tutorial Playwright   |
| IMPASSE_TETO_ITERACOES      | Análise humana — problema mais complexo que loop    |
| IMPASSE_REGRESSAO           | Casos de uso em conflito — decisão de produto       |
| IMPASSE_CAUSA_RAIZ_OBSCURA  | Debug manual com desenvolvedor                      |

---

## INÍCIO DA EXECUÇÃO

Aguardo:
1. Lista de IDs de casos de uso a incluir no ciclo
2. Confirmação da branch base
3. Ajustes de teto de iterações se diferente do default (3)
4. Se há `.claude-protected` a considerar

Após confirmação, inicio pela Fase 0.
