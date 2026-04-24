---
description: Gera tutoriais e executa validação automatizada de caso(s) de uso
---

# VALIDAÇÃO AUTOMATIZADA DE CASOS DE USO — PROTOCOLO DE EXECUÇÃO

## CONTEXTO E OBJETIVO

Você receberá um ou mais casos de uso (specs com sequência de eventos
contendo ações do usuário e respostas do sistema, com telas
prototipadas). Seu trabalho tem quatro fases obrigatórias, executadas
em ordem: SÍNTESE → TUTORIAIS → EXECUÇÃO → RELATÓRIO.

O objetivo é produzir validação reproduzível, auditável e com baixo
índice de falsos positivos/negativos. Você atua simultaneamente como
engenheiro de testes, gerador de dados e juiz semântico.

Artefatos são salvos em:
- **Contexto do ciclo (Fase 0):** `testes/contextos/<ciclo_id>/contexto.yaml` + `editais/` + `docs/`
- **Datasets (Fase 1):** `testes/datasets/<uc_id>_{e2e,visual,humano}.yaml`
- **Casos de teste (Fase 2):** `testes/casos_de_teste/<uc_id>_{e2e,visual,humano}.{yaml,md}`
- **Tutoriais (Fase 3):** `testes/tutoriais_{playwright,visual,humano}/<uc_id>*.md`
- **Relatórios (Fase 5):** `testes/relatorios/{automatico,visual,humano}/<uc_id>_<timestamp>.md`
- **Evidências:** `testes/relatorios/<trilha>/<uc_id>/<timestamp>/`

---

## FASE 0 — PROVISIONAMENTO DE CONTEXTO DO CICLO

**Quando roda:** apenas uma vez no início de um ciclo de validação. Se o comando é `/validar-uc --sprint=1,2,3`, Fase 0 roda antes do primeiro UC e o contexto provisionado é reusado pelos demais. Se o comando é `/validar-uc UC-F01` isolado, verifica se existe ciclo aberto; se sim, reutiliza, se não, executa Fase 0.

**O que provisiona** (para cada uma das 3 trilhas: E2E, Visual, Humana):

### 0.1 Alocar usuário sequencial
Consulta o banco pelo maior `valida<N>` existente em `users.email LIKE 'valida%@valida.com.br'` e reserva os próximos 3 IDs livres. Senha padrão: `123456`. Papel: `usuario_valida`.

### 0.2 Gerar CNPJ único
Gera CNPJ pelo algoritmo da RF (14 dígitos, validação dos 2 DVs). Verifica `SELECT id FROM empresas WHERE cnpj = ?`. Se colidir, gera outro. Se colidir 10 vezes, declara impasse (não deveria acontecer em prática).

### 0.3 Selecionar editais do PNCP
Invoca `backend/tools.py::_buscar_edital_pncp_por_numero` (e demais `_buscar_*_pncp`) para selecionar 3 editais que:
- Tenham `dataAberturaProposta` futura (>= hoje + 3 dias)
- Tenham pelo menos 1 arquivo PDF/ZIP baixável
- Tenham categoria compatível com o escopo dos UCs do ciclo (se UCs envolvem edital)

Baixa os arquivos pra `testes/contextos/<ciclo_id>/editais/`. Se o ciclo inclui só UCs sem edital (ex: só Sprint 1), pula.

### 0.4 Renderizar documentos fictícios
Para cada empresa, renderiza via templates Jinja2 em `testes/fixtures/documentos_template/`:
- Contrato Social (CNPJ, razão social, capital social, endereço)
- CND Federal (CNPJ, data de emissão, validade)
- FGTS (CNPJ, data, validade)
- Certidão Trabalhista
- SICAF
- Alvará de Funcionamento

Saída: PDFs em `testes/contextos/<ciclo_id>/docs/<trilha>/`.

### 0.5 Criar usuários no banco (NÃO empresas)
`INSERT INTO users (email, senha_hash, papel, ...)` — 3 usuários.

**Importante:** empresas NÃO são criadas na Fase 0. Empresa é criada pelo próprio UC-F01 via UI (Opção Y). Isso garante que UC-F01 seja validado de verdade, não "editado".

### 0.6 Gravar contexto
`testes/contextos/<ciclo_id>/contexto.yaml`:

```yaml
ciclo_id: "<YYYYMMDD_HHMMSS>"
criado_em: <ISO-8601>
ambiente: agenteditais  # ou editaisvalida
sprints_no_ciclo: [1, 2, 3]
trilhas:
  e2e:
    usuario:
      email: valida123@valida.com.br
      senha: "123456"
      id: <uuid gerado pelo INSERT>
    empresa:
      cnpj_pretendido: "11.111.111/0001-11"
      razao_social_pretendida: "E2E_20260425_EMPRESA_001"
      id: null  # será preenchido após UC-F01
    editais_selecionados:
      - numero: "123/2026"
        cnpj_orgao: "00.000.000/0001-91"
        url_pncp: "..."
        arquivo_local: "testes/contextos/<ciclo_id>/editais/e2e/edital_123_2026.pdf"
    documentos_renderizados:
      contrato_social: "testes/contextos/<ciclo_id>/docs/e2e/contrato_social.pdf"
      cnd_federal: "..."
      # ...
  visual:
    # idêntico com valida124
  humano:
    # idêntico com valida125, ambiente=editaisvalida, dados realistas
```

### 0.7 Checkpoint obrigatório
Apresenta tabela comparativa das 3 trilhas provisionadas:
- usuário alocado
- CNPJ gerado
- razão social pretendida
- N editais selecionados + URLs
- N documentos renderizados

Aguarda "prossiga" antes da Fase 1.

### 0.8 Reutilização e retomada
Se já existe `testes/contextos/<ciclo_id>/contexto.yaml` E o comando é `/validar-uc --ciclo=<ciclo_id> ...`, pula Fase 0 e usa contexto existente. Permite retomar ciclos interrompidos sem reprovisionar tudo.

### 0.9 Regra de ordem: UC-F01 primeiro
Se o ciclo inclui UCs da Sprint 1, UC-F01 é o primeiro. Motivo: ele cria a empresa via UI, preenchendo `empresa.id` no contexto. Qualquer UC subsequente que precise de empresa (praticamente todos) consulta esse ID.

Se falhar UC-F01, o ciclo inteiro é bloqueado. Relatório final diz: "sprints 2-5 não executadas — dependem de UC-F01 aprovado".

---

## FASE 1 — SÍNTESE DE DADOS DE TESTE

A partir de cada caso de uso, infira os dados necessários para
exercitá-lo. Produza DOIS conjuntos independentes, cada um destinado
a alimentar seu respectivo tutorial na Fase 2. Os dados serão
embutidos inline nos tutoriais — não gere arquivos JSON/YAML
separados para os dados.

### 1.1 Conjunto HUMANO

Dados realistas e memoráveis para um Product Owner executar
manualmente. Destino: serão embutidos como texto natural no
Tutorial Humano.

Requisitos:
- Valores com aparência plausível no contexto de licitações
  governamentais brasileiras (CNPJs válidos pelo algoritmo da RF,
  valores em R$ com centavos realistas, datas coerentes com prazos
  de editais, números de edital no formato N/ANO)
- Nomes fictícios mas profissionais — evite "João Teste 123"
  ou similares
- Quantidade mínima: apenas o necessário para exercitar o caso de uso
- Cada dado deve vir com uma nota curta explicando por que aquele
  valor foi escolhido (facilita o PO entender a intenção do teste
  e observar criticamente o comportamento esperado)

### 1.2 Conjunto PLAYWRIGHT

Dados para execução automatizada. Destino: serão embutidos como
valores literais em cada passo do Tutorial Playwright onde houver
ação que requer entrada.

Requisitos:
- Determinísticos: fixados agora, nada gerado em tempo de execução
- Identificáveis: prefixo `E2E_<YYYYMMDD>_` em strings livres, para
  facilitar limpeza e isolar de dados reais
- Coerentes entre passos: valor referenciado no passo N deve bater
  com o cadastrado no passo anterior do mesmo caso de uso
- Triplo formato para cada dado numérico/datado quando aplicável:
  - Formato de entrada (como o usuário digita): "45230,00"
  - Formato de exibição (como aparece renderizado): "R$ 45.230,00"
  - Formato de trânsito (como vai para o backend): 45230.00
- Cobrem pelo menos uma variação significativa além do happy path
  (borda, limite, erro esperado) — gere um tutorial Playwright
  separado para cada variação

### 1.3 Para AMBOS os conjuntos, declare no topo do respectivo tutorial:

- Pré-condições do sistema (usuário logado? registros pré-existentes?
  seeds necessárias?)
- Identificação de dados sensíveis (PII/LGPD) — ainda que fictícios,
  marque-os para que o tutorial humano não seja compartilhado sem
  cuidado
- Critérios de limpeza ao final da execução

### 1.4 Checkpoint obrigatório

**PARE E CONFIRME** apresentando os dois conjuntos em formato tabular
legível (markdown, não JSON bruto). Aguarde "prossiga" ou correções
antes de gerar os tutoriais. Isso evita desperdício de tokens em
geração de tutoriais sobre premissas erradas.

---

## FASE 2 — GERAÇÃO DE TUTORIAIS

Os dois tutoriais derivam do mesmo caso de uso mas são autocontidos
e independentes. Cada um embute seu respectivo conjunto de dados
inline.

### 2.1 Tutorial Humano (`testes/tutoriais_humano/<uc_id>_humano.md`)

Markdown em português brasileiro, tom instrutivo, dados embutidos
como texto natural.

Estrutura obrigatória:

    # Tutorial de validação manual — <UC-ID>: <Nome do caso de uso>

    ## Metadados
    - Caso de uso: <UC-ID> (versão <x.y.z>)
    - Tutorial gerado em: <ISO-8601>
    - Tempo estimado de execução: <minutos>

    ## Pré-condições
    <lista legível do que precisa estar pronto antes>

    ## Dados de teste (referência)
    | Campo | Valor a usar | Observação |
    |-------|-------------|------------|
    <tabela dos dados principais com nota de intenção>

    ## Passo N — <título descritivo da ação>

    **O que fazer:**
    <lista numerada de ações concretas com os valores literais
    já no texto, no formato que o humano vai digitar na tela>

    **O que deve acontecer:**
    <lista do que deve aparecer na tela, com valores literais no
    formato renderizado>

    **O que observar criticamente:**
    <lista de sutilezas que só humano capta: formatação de moeda
    pt-BR, ordem visual dos elementos, responsividade, feedback
    tátil de botões, etc.>

    [repetir por passo]

    ## Critérios de aceitação do caso de uso
    - [ ] <critério em linguagem de negócio>

    ## Limpeza após execução
    <instruções simples para o humano, se houver>

### 2.2 Tutorial Playwright (`testes/tutoriais_playwright/<uc_id>_<variacao>.md`)

Markdown estruturado para o Claude Code consumir. Cada passo é um
bloco YAML autocontido com dados literais.

Estrutura obrigatória:

    # Tutorial de execução automatizada — <UC-ID> (variação: <nome>)

    ## Metadados
    ```yaml
    caso_uso_id: UC-042
    variacao: happy_path  # ou: limite_superior, erro_validacao, etc.
    caso_uso_versao: 2.1.0
    gerado_em: <ISO-8601>
    modelo_validador: claude-opus-4.6
    prompt_validacao_versao: v1.0
    ```

    ## Pré-condições
    <lista técnica: seeds SQL, cookies de sessão, estado de filas>

    ## Setup
    ```sql
    -- Comandos SQL para preparar o estado
    ```

    ## Passo N — <título descritivo>

    ```yaml
    id: passo_NN_<slug>

    acao_ator:
      descricao: "Descrição humana curta do que o ator faz"
      sequencia:
        - <tipo_acao>:
            <parâmetros específicos com valores literais>

    resposta_esperada_sistema:
      camada_semantica:
        descricao_ancorada: |
          Descrição MUITO específica do que deve estar visível na tela.
          Evite vaguidades como "a tela correta aparece".
          Seja tão específico que um humano leigo, lendo essa descrição,
          não consiga confundi-la com outra tela similar do sistema.
        elementos_obrigatorios:
          - <lista de textos/elementos que DEVEM estar presentes>
        elementos_proibidos:
          - <lista de textos/elementos que NÃO podem aparecer>

      camada_estrutural_dom:
        - <asserções sobre URL, atributos, classes>

      camada_estrutural_rede:
        - requisicao: "<METODO> <path>"
          payload_contem:
            <chaves/valores esperados no body>
          status_esperado: <código>
          timeout_ms: <número>

      validacao_backend:  # opcional, usar em ações críticas
        query: "<SQL ou chamada de API para verificar estado>"
        resultado_esperado:
          <estado esperado no backend>
    ```

    [repetir por passo]

    ## Limpeza pós-execução
    ```sql
    DELETE FROM <tabela> WHERE <coluna> LIKE 'E2E_%';
    ```

### 2.3 Regra de ouro da descrição ancorada

Se um humano leigo, lendo só a `descricao_ancorada`, conseguir confundir
duas telas diferentes do sistema, ela está fraca. Reescreva até
distinguir A de B sem ambiguidade. A lista `elementos_proibidos` é
tão importante quanto `elementos_obrigatorios` — sem ela, o juiz
LLM tende a confirmar presença do que foi pedido e ignorar presença
de erro ao lado.

### 2.4 Checkpoint

Após gerar os dois tutoriais, apresente os caminhos dos arquivos e
um resumo de uma linha por passo. Aguarde "prossiga" antes de
executar (Fase 3).

---

## FASE 3 — EXECUÇÃO SISTEMÁTICA

Execute o Tutorial Playwright passo a passo. Não execute o tutorial
humano — este é para o PO rodar manualmente em paralelo.

### 3.1 Pré-passo

- Log estruturado: timestamp, step_id, estado atual
- Screenshot: `testes/relatorios/<uc_id>/<timestamp>/before_<step_id>.png`
- Snapshot da árvore de acessibilidade (não HTML bruto — árvore a11y
  é mais estável e semanticamente rica, e força o produto a ser
  acessível como efeito colateral positivo)

### 3.2 Ação

- Execute via Playwright com seletor preferencial
- Se falhar, tente fallback UMA vez, logando o downgrade como alerta
  (seletor preferencial está ficando frágil)
- Intercepte requisições via `page.on('request')` e `page.on('response')`
  desde antes da ação, para capturar tráfego de rede gerado pela ação

### 3.3 Validação em três camadas (ordem barato → caro)

**Camada 1 — Estrutural DOM** (milissegundos, determinística):
- Verifique todas as asserções `camada_estrutural_dom`
- Falha aqui → marque passo como REPROVADO, NÃO gaste tokens com
  camada semântica

**Camada 2 — Estrutural Rede** (segundos, determinística):
- Verifique todas as asserções `camada_estrutural_rede`
- Capture payloads completos (request e response) para o relatório
- Falha aqui → mesma regra, NÃO prosseguir para camada semântica

**Camada 3 — Semântica** (custosa em tokens, não-determinística):
- Só execute se camadas 1 e 2 passaram
- Screenshot `after_<step_id>.png`
- Análise com prompt estruturado ao modelo:

  ```
  Você está validando uma tela contra uma descrição esperada.

  DESCRIÇÃO ESPERADA:
  <descricao_ancorada>

  ELEMENTOS OBRIGATÓRIOS:
  <lista>

  ELEMENTOS PROIBIDOS:
  <lista>

  Responda APENAS em JSON válido, sem markdown:
  {
    "veredito": "APROVADO | REPROVADO | INCONCLUSIVO",
    "confianca": 0.0-1.0,
    "elementos_obrigatorios_presentes": [<string>],
    "elementos_obrigatorios_ausentes": [<string>],
    "elementos_proibidos_detectados": [<string>],
    "justificativa": "<texto curto e específico>",
    "discrepancias_observadas": [<string>]
  }
  ```

- **Redução de não-determinismo**: se `confianca < 0.85`, execute
  a análise 2x adicionais e aplique voto majoritário (2 de 3).
  Registre divergências entre execuções no relatório como sinal
  de que a descrição ancorada precisa ser refinada.

- **Validação backend** (se definida): execute query/chamada e
  compare com `resultado_esperado`. Esta camada pega o que screenshot
  e rede não pegam: persistência correta, efeitos colaterais em
  filas, etc.

### 3.4 Pós-passo

- Log do veredito com todas as evidências (screenshots, payloads
  capturados, queries executadas, JSON da análise semântica)
- Se REPROVADO: pare a execução do caso de uso (não tente recuperar
  automaticamente, isso mascara a causa raiz), vá direto para Fase 4
- Se APROVADO: prossiga para próximo passo

---

## FASE 4 — RELATÓRIO DE VALIDAÇÃO

Produza `testes/relatorios/<uc_id>_<timestamp>.md` contendo:

1. **Sumário executivo** (primeira tela do relatório):
   APROVADO/REPROVADO global, taxa de passos aprovados, duração total,
   custo estimado em tokens

2. **Linha do tempo**: tabela com cada passo, veredito, duração,
   qual camada determinou o resultado (importante: se a camada
   semântica nunca é o gargalo de reprovação, ela pode estar
   permissiva demais)

3. **Evidências por passo**: links relativos para screenshots
   before/after, payloads de rede (JSON completo), JSON da análise
   semântica, resultado da validação backend

4. **Discrepâncias detectadas**: lista priorizada por severidade
   (crítica → cosmética)

5. **Custo de execução**: tokens usados na validação semântica,
   tempo total de execução, número de re-análises por baixa confiança
   (métrica para monitorar saúde do processo)

6. **Recomendações de manutenção**:
   - Passos cuja descrição ancorada gerou baixa confiança
     repetidamente (refinar a descrição)
   - Seletores que caíram para fallback (refatorar no produto)
   - Asserções redundantes entre camadas (simplificar)

---

## REGRAS INVIOLÁVEIS

1. **Nunca reescreva um caso de uso silenciosamente.** Se o spec é
   ambíguo, pare e pergunte antes da Fase 1.

2. **Nunca invente dados "para fazer funcionar".** Se faltam dados
   no spec, volte à Fase 1 e pergunte.

3. **Nunca use a camada semântica como muleta para seletores ruins.**
   Se o DOM está testável, teste no DOM — é mais barato e
   determinístico.

4. **Sempre limpe os dados de teste após execução**, usando
   `criterios_limpeza` da Fase 1. Dados residuais contaminam
   execuções futuras.

5. **Sempre prefira árvore de acessibilidade** sobre HTML bruto
   para análise estrutural e semântica — é mais estável e
   semanticamente rica.

6. **Na dúvida, reprove.** Falso negativo (passou mas deveria
   falhar) é mais caro que falso positivo no Facilicita.IA, onde
   propostas têm consequência jurídica.

7. **Nunca pule os checkpoints** das Fases 1 e 2. Gerar tutoriais
   sobre dados errados, ou executar tutoriais sobre premissas
   erradas, desperdiça tokens e gera ruído no relatório.

---

## INÍCIO DA EXECUÇÃO

Aguardo o(s) caso(s) de uso. Ao recebê-los, começarei pela Fase 1
e apresentarei os dois conjuntos de dados em formato tabular para
sua confirmação antes de gerar os tutoriais.
