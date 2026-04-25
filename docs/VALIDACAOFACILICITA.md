# Validação do Facilicita.IA — Processo Completo

**Documento de referência** — explica em detalhe como o sistema é validado antes de cada release.

**Data:** 2026-04-24
**Status:** processo proposto, em implementação (ver `PLANO VALIDACAO V3.md`).
**Para quem:** POs, desenvolvedores, validadores externos (Arnaldo), e o próprio Claude Code que vai operar o processo.

---

## 1. Por que validar em 3 formas?

O Facilicita.IA automatiza licitações. Um bug em proposta comercial ou em impugnação tem **consequência jurídica e financeira**. Não dá pra confiar em uma única linha de defesa.

Cada forma captura tipos distintos de defeito:

| Forma | O que pega bem | O que NÃO pega |
|---|---|---|
| **Automática E2E** | Regressão, quebra de API, mudança de status HTTP, campo ausente na response | UX confusa, texto ambíguo, formatação visual, fluxo "certo mas estranho" |
| **Automática Visual (acompanhada)** | Tudo que a E2E pega + descrição ancorada errada, seletor frágil, passo ambíguo no tutorial | Defeito invisível pro PO (ex: persistência silenciosa que parece OK na UI) |
| **Humana (validador externo)** | Intuição de usuário real, UX, ordem de elementos, "parece estranho mas funciona" | Regressões profundas, bugs em borda numérica, bugs em integrações |

Rodar as três fecha as três lacunas.

### Custo vs cobertura

```
Custo de token/tempo:     E2E << Visual << Humana
Cobertura de classes de bug:  crescente (E2E → Visual → Humana)
Velocidade de feedback:       E2E ms/s, Visual min, Humana horas/dias
```

Por isso: **E2E roda sempre, Visual roda em mudanças significativas, Humana fecha a sprint.**

---

## 2. O que são "casos de uso" e por que a verdade mora neles

Um **caso de uso (UC)** é a especificação do que o usuário faz e o que o sistema responde. Estrutura canônica (padrão V5 do projeto):

```
UC-F01 — Manter Cadastro Principal de Empresa

RNs aplicadas: RN-028, RN-042, RN-078, RN-206...

Pré-condições: usuário autenticado, seleção de empresa vazia

Pós-condições: empresa gravada em parametrizacao_sistema com CNPJ único

Sequência de eventos:
  1. Usuário navega até Configurações > Empresa
  2. Sistema exibe formulário com campos Razão Social, CNPJ, IE, ...
  3. Usuário preenche CNPJ "68.218.777/0001-03"
  4. Sistema valida CNPJ (RN-028) e habilita restante do form
  5. Usuário preenche demais campos e clica Salvar
  6. Sistema grava e exibe "Salvo!" em verde por 2s

Fluxos alternativos (FA):
  FA1: CNPJ já cadastrado em outra empresa → mensagem "CNPJ duplicado"
  FA2: CEP inválido → não preenche endereço automaticamente

Fluxos de exceção (FE):
  FE1: viaCEP offline → exibe "Serviço indisponível, preencha manualmente"
  FE2: backend 500 → toast vermelho "Erro ao salvar. Tente novamente."

Tela representativa: EmpresaPage com 4 cards (Cadastrais, Endereço, Telefones, Documentos)

Mapeamento Tela ↔ Sequência:
  Passo 3 ↔ input[name=cnpj]
  Passo 6 ↔ toast .crud-message-success
```

**Princípio inviolável:** se o código diverge do caso de uso, o código está errado — nunca o contrário. Se o caso de uso estiver realmente errado, isso é **impasse** e requer decisão de produto, não licença pra reinterpretar o UC.

---

## 3. Cobertura obrigatória: Principal + Alternativos + Exceções

**REGRA INVIOLÁVEL.** Um UC não está validado quando só o fluxo principal passa. A validação deve exercitar **todos os fluxos descritos no caso de uso V5**:

### Os três tipos de fluxo em cada UC

| Tipo | Símbolo | O que é | Exemplo (UC-F01 Cadastro de Empresa) |
|---|---|---|---|
| **Fluxo Principal** | FP | O caminho "feliz" — tudo dá certo | Usuário preenche CNPJ válido, empresa é criada |
| **Fluxos Alternativos** | FA | Variações legítimas do caminho | FA1: CEP não encontrado → usuário preenche manual. FA2: CNPJ já cadastrado em outra empresa → edição em vez de criação. |
| **Fluxos de Exceção** | FE | Erros e falhas esperadas | FE1: viaCEP offline → toast "Serviço indisponível". FE2: backend 500 → mensagem de erro amigável. FE3: CNPJ inválido pelo algoritmo RF → campo em vermelho. |

### Obrigações na geração de casos de teste e tutoriais

Para **cada UC**, o `/validar-uc` deve gerar:

1. **Um caso de teste por fluxo** — nunca um só caso de teste que "tenta cobrir tudo". Separar:
   - `UC-F01_e2e_principal.yaml`
   - `UC-F01_e2e_fa1_cep_nao_encontrado.yaml`
   - `UC-F01_e2e_fa2_cnpj_existente.yaml`
   - `UC-F01_e2e_fe1_viacep_offline.yaml`
   - `UC-F01_e2e_fe2_backend_500.yaml`
   - `UC-F01_e2e_fe3_cnpj_invalido.yaml`

2. **Um tutorial por variação** — o tutorial Playwright de `fe1_viacep_offline` simula o servidor externo offline via `page.route()`; o tutorial de `fe2_backend_500` intercepta e injeta 500 na response.

3. **Dados específicos por fluxo** — o dataset E2E pode ter uma seção `valores_fluxo_principal` e `valores_fa1_cep_nao_encontrado` com CEP propositalmente inválido.

### Regra para o Claude durante Fase 1 e 2

Ao sintetizar dados e casos de teste:

1. **Ler o UC integralmente.** Não parar na seção "Sequência de eventos". Ler também "Fluxos Alternativos" e "Fluxos de Exceção".
2. **Contar fluxos explicitamente** e anunciar no checkpoint da Fase 1: *"UC-F01 tem 1 fluxo principal + 2 alternativos + 3 exceções = 6 variações. Gerarei 6 casos de teste e 6 tutoriais por trilha."*
3. **Nunca omitir exceção por ser trabalhosa** — exceções são onde a maioria dos bugs mora.
4. **Se o UC não detalhar exceções suficientes**, Claude deve **inferir exceções comuns** (timeout de rede, campo vazio, valor extremo) e **perguntar** ao PO se procede.

### Obrigações na Fase 4 (execução)

- Todos os casos de teste devem ser executados, não apenas o principal.
- Se qualquer FA ou FE falhar, o UC inteiro é reprovado (mesmo se o principal passar).
- Relatório lista cada fluxo com seu veredito individual:

```markdown
## UC-F01 — Manter Cadastro de Empresa

| Fluxo | Veredito | Duração | Camada decisiva |
|---|---|---|---|
| FP  | APROVADO  | 12.4s | DOM |
| FA1 (CEP não encontrado) | APROVADO  | 8.1s | Semântica |
| FA2 (CNPJ existente) | **REPROVADO** | 4.2s | Rede (404 em vez de 409) |
| FE1 (viaCEP offline) | APROVADO | 5.7s | Semântica |
| FE2 (backend 500) | APROVADO | 3.9s | DOM |
| FE3 (CNPJ inválido) | APROVADO | 2.1s | DOM |

**Veredito final do UC: REPROVADO** (FA2 falhou)
```

### Por que isso importa

No Facilicita.IA:
- Uma falha em FA2 (CNPJ duplicado) pode gerar registros órfãos no banco
- Uma falha em FE1 (viaCEP offline) pode deixar o usuário preso numa tela sem saída
- Uma falha em FE3 (CNPJ inválido aceito) é bug regulatório — o sistema aceita CNPJ que não existe

**Validar só o fluxo principal é validação de fachada.** Não conta.

---

## 4. Provisionamento de contexto (Fase 0 do ciclo)

Antes de qualquer UC rodar, é preciso **provisionar o contexto de validação**: usuários, CNPJs, empresas, editais, documentos. Isso acontece uma vez no início de cada ciclo de validação, em uma fase dedicada chamada **Fase 0**.

### O princípio central

**Um ciclo = 3 usuários + 3 empresas, reusados ao longo de todas as sprints daquele ciclo.** Os dados entre sprints são coerentes — a empresa cadastrada no UC-F01 da Sprint 1 é a mesma que busca editais no UC-CV01 da Sprint 2, que precifica no UC-P01 da Sprint 3, etc.

Isso garante que:
- Mudanças de estado entre sprints são testáveis (ex: proposta da Sprint 3 referencia edital da Sprint 2)
- Dados acumulam organicamente (ex: produtos cadastrados na Sprint 1 aparecem no Portfolio durante Sprint 2)
- Validação reflete o uso real do sistema (não um UC isolado num banco limpo)

### O que a Fase 0 provisiona

Para cada trilha (E2E, Visual, Humana), a Fase 0 cria:

| Artefato | Estratégia |
|---|---|
| **Usuário** | `valida<N>@valida.com.br` sequencial — consulta o banco o último `validaN`, gera os 3 próximos livres |
| **CNPJ** | Gerado pelo algoritmo da RF, verificado no banco; se colidir, retry até achar único |
| **Empresa (stub no DB)** | Apenas o registro de usuário → empresa fica nula **até o UC-F01 criá-la via UI** |
| **Editais** | Busca 3 editais reais no PNCP via `backend/tools.py::_buscar_edital_pncp_por_numero`, filtra por prazo futuro + PDF baixável |
| **Documentos** | Renderizados a partir de templates em `testes/fixtures/documentos_template/` (Contrato Social, CND Federal, FGTS, Trabalhista, SICAF, Alvará) com nome/CNPJ da empresa fictícia |

### Regra crítica: cada execução gera contexto novo

Novos usuários, novas empresas, novos CNPJs **toda vez** que `/validar-uc` roda um ciclo. **Nunca reutiliza contexto de ciclo anterior.** Isso isola execuções e evita contaminação.

### O UC-F01 cria a empresa de verdade

A Fase 0 **não faz seed SQL da empresa**. Ela cria só o usuário. A empresa é criada pela UI no próprio UC-F01 (primeiro UC da Sprint 1). Motivo: se a Fase 0 criasse a empresa via SQL, o UC-F01 jamais seria validado de verdade — estaria apenas "editando um registro pré-existente".

**Consequência prática:** o UC-F01 é **obrigatório e sempre o primeiro** em qualquer ciclo. Se falhar, o ciclo inteiro falha (nenhuma sprint seguinte roda sem empresa).

### Ordem de execução dos UCs é fixa

Dentro de um ciclo que inclui várias sprints, a ordem é:

```
Sprint 1 (UC-F01 primeiro, obrigatório)
  ↓ UC-F01 cria empresa via UI
  ↓ UC-F02..F17 usam essa empresa
Sprint 2 (UC-CV01..CV13 usam empresa + produtos já cadastrados)
  ↓ UC-CV02 cadastra editais (alguns dos 3 pré-selecionados na Fase 0)
Sprint 3 (UC-P01..P12 usam editais + produtos + empresa)
Sprint 4 (UC-I01..I05 + UC-RE01..RE06 usam propostas da Sprint 3)
Sprint 5 (UC-FU01..CRM07 usam tudo anterior)
```

Uma falha em Sprint N bloqueia Sprints N+1..5 daquele ciclo. **Isso é intencional** — imita o fluxo real do usuário.

### O que o arquivo de contexto contém

A Fase 0 grava em `testes/contextos/<ciclo_id>/contexto.yaml`:

```yaml
ciclo_id: 2026-04-25_103000
ambiente: agenteditais  # ou editaisvalida
trilhas:
  e2e:
    usuario:
      email: valida123@valida.com.br
      senha: "senha_gerada"
      id: (preenchido apos provisionamento)
    empresa:
      cnpj: "11.111.111/0001-11"  # validado RF, único no banco
      razao_social_pretendida: "E2E_20260425_EMPRESA_001"
      id: null  # preenchido pelo UC-F01
    editais_selecionados:
      - numero: "123/2026"
        cnpj_orgao: "00.000.000/0001-91"
        url_pncp: "https://pncp.gov.br/app/editais/..."
        arquivo_local: "testes/contextos/2026-04-25_103000/editais/edital_123_2026.pdf"
      - ...
    documentos_renderizados:
      contrato_social: "testes/contextos/2026-04-25_103000/docs/contrato_social.pdf"
      cnd_federal: "..."
      # ...
  visual:
    # estrutura idêntica com usuario valida124
  humano:
    # estrutura idêntica com usuario valida125, ambiente editaisvalida, dados realistas
```

Esse arquivo é a **referência única** para todos os datasets, casos de teste e tutoriais gerados no ciclo. Qualquer UC que precise do email do usuário, do CNPJ da empresa, ou do path de um documento, consulta o contexto.

### Limpeza

- **Trilha E2E:** contexto inteiro é removido ao final do ciclo (usuário, empresa, documentos). Dados prefixados `E2E_<data>_` facilitam busca.
- **Trilha Visual:** contexto preservado até próxima execução. Pode reusar se quiser continuar uma validação interrompida. Reset manual via comando.
- **Trilha Humana:** **nunca apaga**. A empresa do Arnaldo fica no editaisvalida indefinidamente — ele pode voltar pra validar UCs adicionais no futuro.

---

## 5. As 3 camadas de artefatos (por trilha)

Cada UC, ao ser validado, produz **3 artefatos em cada uma das 3 trilhas** — totalizando **9 arquivos** gerados pelo `/validar-uc` antes da execução. Os 9 arquivos se dividem em 3 camadas encadeadas:

### Camada 1 — Datasets (só dados, sem lógica)

Em `testes/datasets/UC-<id>_<trilha>.yaml`. Contém apenas os **valores** que o teste vai usar, nenhuma asserção nem instrução.

Exemplo para UC-F01:
```yaml
# datasets/UC-F01_e2e.yaml
caso_uso: UC-F01
trilha: e2e
valores:
  empresa:
    razao_social: "E2E_20260425_EMPRESA_001"
    cnpj_entrada: "11111111000111"      # o que o usuário digita
    cnpj_exibicao: "11.111.111/0001-11" # o que aparece após mascarar
    cnpj_transito: "11111111000111"      # o que trafega pro backend
  contato:
    email: "e2e+20260425@test.local"
```

Vantagem: se você quer rodar o mesmo UC com outro CNPJ, **muda só este arquivo**. Não toca em caso de teste nem em tutorial.

### Camada 2 — Casos de teste (asserções por passo, sem instrução)

Em `testes/casos_de_teste/UC-<id>_<trilha>.{yaml,md}`. Contém as **asserções** que devem passar em cada passo, referenciando o dataset pelo caminho.

Exemplo para UC-F01 na trilha E2E:
```yaml
# casos_de_teste/UC-F01_e2e.yaml
caso_uso: UC-F01
trilha: e2e
dataset_ref: datasets/UC-F01_e2e.yaml
passos:
  - id: passo_03_preencher_cnpj
    usa_dados: empresa.cnpj_entrada
    asserts_dom:
      - selector: 'input[name=cnpj]'
        attribute: 'data-valid'
        equals: 'true'
    asserts_rede:
      - metodo: POST
        url_contem: '/api/validar-cnpj'
        status: 200
    asserts_semantica:
      descricao_ancorada: "Campo CNPJ mostra máscara aplicada e badge verde"
      elementos_obrigatorios: ["11.111.111/0001-11"]
      elementos_proibidos: ["Inválido", "Erro"]
```

Vantagem: se você quer endurecer a asserção semântica ou adicionar nova verificação de rede, **muda só este arquivo**.

### Camada 3 — Tutoriais (instrução de execução)

Em `testes/tutoriais_<trilha>/UC-<id>*.md`. Contém **como o executor faz** a ação, consumindo dataset e caso de teste por referência.

Exemplo para UC-F01 na trilha E2E:
```yaml
# tutoriais_playwright/UC-F01_happy_path.md
metadados:
  dataset_ref: datasets/UC-F01_e2e.yaml
  caso_de_teste_ref: casos_de_teste/UC-F01_e2e.yaml

passos:
  - id: passo_03_preencher_cnpj
    acao:
      tipo: fill
      seletor: 'input[name=cnpj]'
      valor_from_dataset: empresa.cnpj_entrada  # resolvido em runtime
    validacao_ref: casos_de_teste/UC-F01_e2e.yaml#passo_03_preencher_cnpj
```

Vantagem: se a UI mudou e o seletor está diferente, **muda só este arquivo**. Dataset e caso de teste seguem intactos.

### Como as 3 camadas fluem

```
UC-F01.md (caso de uso — spec de negócio)
      ↓ FASE 1 do /validar-uc
[datasets]      UC-F01_e2e.yaml  UC-F01_visual.yaml  UC-F01_humano.yaml
      ↓ FASE 2 do /validar-uc
[casos de teste] UC-F01_e2e.yaml  UC-F01_visual.yaml  UC-F01_humano.md
      ↓ FASE 3 do /validar-uc
[tutoriais]     _playwright/      _visual/             _humano/
      ↓ FASE 4 (executa conforme --modo)
[relatórios]    automatico/       visual/              humano/
```

**Cada fase tem checkpoint obrigatório** — você confirma o artefato antes de avançar. Isso evita gerar tutoriais em cima de casos de teste errados, ou casos de teste em cima de datasets errados.

### Por que 3 camadas e não 1 (tudo no tutorial)?

Porque cada camada evolui em ritmo diferente:

- **UI muda** (seletores) → só tutorial muda.
- **Regra de negócio muda** (ex: CNPJ agora precisa validar DV) → só caso de teste muda (nova asserção).
- **Teste precisa de outros valores** (ex: empresa maior) → só dataset muda.

Com tudo junto, qualquer mudança em um aspecto obriga a editar o arquivo inteiro e reler todos os passos — aumenta risco de erro humano.

Com 3 camadas separadas, cada mudança tem blast radius limitado e é fácil de revisar em PR.

### Formato diferencial por trilha

Dentro da Camada 2 (casos de teste), o **formato** muda por trilha porque o que é asserção depende de quem valida:

| Trilha | Formato | Asserções |
|---|---|---|
| **E2E** | YAML rígido | DOM (selector/atributo), Rede (método/URL/status), Semântica (LLM com descrição ancorada) |
| **Visual** | YAML + pontos de observação | Asserções automáticas (DOM/Rede) + **pausas para o PO observar** coisas sutis (ex: "a animação está fluida?") |
| **Humano** | Markdown com checklists | **Nenhuma asserção automática** — só checkboxes com critérios objetivos pro validador marcar |

Camada 1 (datasets) usa sempre YAML — é só valor. Camada 3 (tutoriais) varia: YAML runnable pro E2E, MD+YAML misto pro Visual, MD prosa pro humano.

---

## 6. Como cada trilha funciona

Cada UC é validado pelas 3 trilhas, cada uma consumindo seu próprio dataset + caso de teste + tutorial.

### Comando que dispara tudo

Uma única entrada no Claude Code:

```
/validar-uc UC-F01 --modo=e2e       # automático total (default)
/validar-uc UC-F01 --modo=visual    # acompanhado com você
/validar-uc UC-F01 --modo=humano    # gera tutorial pro Arnaldo
```

Independente do modo, **as fases 1 e 2 (síntese de dados + geração de tutoriais) sempre produzem os 3 datasets e os 3 tutoriais**. O modo só decide **qual é executado agora**.

---

### 3.1 Forma 1 — Automática E2E (headless)

**Para quem:** desenvolvimento contínuo, CI, regressão.
**Ambiente:** `agenteditais` (porta 5180 / backend 5007).
**Dataset:** determinístico com prefixo `E2E_<YYYYMMDD>_`. Nunca sobrescreve dados reais. Limpeza automática no final via `DELETE WHERE ... LIKE 'E2E_%'`.

#### Como roda

1. Playwright headless (invisível) abre browser, faz login, navega até a tela do UC.
2. Para cada passo do tutorial Playwright:
   - **Camada 1 (DOM):** verifica existência de elementos, classes, atributos, URL. Se falhar → passo reprovado sem gastar token de LLM.
   - **Camada 2 (Rede):** intercepta requisições/respostas. Verifica método, status HTTP, presença de chaves no payload. Se falhar → passo reprovado.
   - **Camada 3 (Semântica):** **só executa se 1 e 2 passaram.** Tira screenshot "depois", manda pro Claude com descrição ancorada + lista de elementos obrigatórios e proibidos. Retorno em JSON:
     ```json
     {"veredito": "APROVADO", "confianca": 0.92, "elementos_obrigatorios_presentes": [...], "justificativa": "..."}
     ```
   - Se confiança < 0.85: roda 2x mais e aplica voto majoritário.
3. **Camada 4 (opcional):** validação backend — query direta no banco pra confirmar persistência.

#### Exemplo — UC-F01 passe E2E

Dados usados:
- Razão Social: `E2E_20260425_EMPRESA_001`
- CNPJ: `11.111.111/0001-11` (mock, RN-028 off em modo E2E pra não bloquear)
- Email: `e2e+20260425@test.local`
- CEP: `00000-000` (mock)

Saída: `testes/relatorios/automatico/UC-F01_2026-04-25_103000.md`

```markdown
# UC-F01 — Relatório automático E2E

**Veredito:** APROVADO
**Duração:** 18.2s
**Passos aprovados:** 6/6
**Tokens LLM:** 2400 (camada semântica em 4 passos)

## Linha do tempo
| Passo | Veredito | Duração | Camada determinante |
|---|---|---|---|
| 1. navegar empresa | APROVADO | 1.8s | DOM |
| 2. preencher CNPJ | APROVADO | 0.9s | Rede (POST /api/validar-cnpj 200) |
| ...
```

#### Quando roda
- Toda vez que abre PR: CI executa E2E em todos os UCs da sprint da feature.
- Toda noite: full regression em todos os ~80 UCs.

---

### 3.2 Forma 2 — Automática Visual (você acompanha)

**Para quem:** você (Pasteur) co-pilotando mudanças significativas; calibração de novos UCs; investigação de bugs intermitentes.
**Ambiente:** `agenteditais` (porta 5180).
**Dataset:** memorável com prefixo `DEMO_`. Você reconhece que é teste mas o valor é legível (`DEMO_RP3X Ltda`, não `E2E_20260425_xyz`).

#### Como roda

1. `python testes/framework_visual/executor.py UC-F01`.
2. Duas janelas abrem:
   - **Janela A (browser real):** Chromium **visível**, slow_mo=500ms. Você vê o sistema executando como se fosse um usuário (navegando, preenchendo, clicando).
   - **Janela B (painel de controle):** HTML servido por Flask em `http://localhost:9876`.

3. **Modelo de passos lógicos (vs atômicos).** O tutorial visual NÃO é uma lista de "1 fill = 1 passo". Cada passo é um **marco de UX** que faz sentido pro humano acompanhar — ele agrega várias ações atômicas que conceitualmente acontecem juntas. Exemplo pra UC-F01:

   - **Passo lógico 1:** Navegar até EmpresaPage (1 ação: goto)
   - **Passo lógico 2:** Preencher seção "Dados Básicos" (4 fills: Razão, Fantasia, CNPJ, IE)
   - **Passo lógico 3:** Preencher seção "Presença Digital" (4 fills: Site, IG, LI, FB)
   - **Passo lógico 4:** Preencher seção "Endereço" (4 ações: 3 fills + 1 select UF)
   - **Passo lógico 5:** Salvar e confirmar (click + wait response + wait "Salvo!")

   Critério de agrupamento: **por seção visual da tela** ou **por marco que o usuário-final percebe como "uma coisa".**

4. **Ciclo por passo lógico:**
   - Executor roda automaticamente todas as ações atômicas do passo (com slow_mo, você vê na Janela A)
   - Ao terminar o passo, **PAUSA** e mostra na Janela B:
     - Screenshot DEPOIS (estado final do passo, fresco)
     - Descrição em Markdown + pontos a observar
     - Resultado das camadas automáticas (DOM/Rede)
     - **Decisão obrigatória:** ✅ **Aprovar** ou ❌ **Reprovar** (Continuar fica desabilitado até marcar)
     - Textarea de **Observação** (opcional)
   - Você marca, opcionalmente comenta, e clica **▶️ Continuar** → executor avança pro próximo passo
   - Outros botões: **⏹️ Parar** (encerra), **🔄 Reiniciar** (volta pro 1)

5. Ao final, relatório em `testes/relatorios/visual/UC-F01_<timestamp>.md` com a decisão Aprovar/Reprovar de cada passo + observações.

#### Regra do agrupamento lógico — vale APENAS para `tutoriais_visual/`

| Artefato | Granularidade |
|---|---|
| `datasets/UC-*.yaml` | Único (atende as 3 trilhas) — só dados |
| `casos_de_teste/UC-*_e2e_*.yaml` | **Atômico** — 1 assert por campo, pra precisão de debugging |
| `casos_de_teste/UC-*_visual_*.yaml` | **Atômico nos asserts** + **agrupado nos `passos`** (o YAML pode ter sub-passos `passo_lógico → ações`) |
| `casos_de_teste/UC-*_humano_*.md` | Prosa narrativa |
| `tutoriais_playwright/UC-*.md` (E2E) | **Atômico** — passos finos pro runner headless |
| `tutoriais_visual/UC-*.md` (Visual) | **Lógico** — agregados em marcos de UX |
| `tutoriais_humano/UC-*.md` (Humano) | Prosa pro Arnaldo executar manual |

Por que só visual agrega: É a única trilha onde o ritmo da pausa **é parte da UX**. Na E2E ninguém olha; na Humana o agrupamento já é narrativo. Na Visual, agrupar 16 ações em 5 marcos transforma "16 cliques no Continuar" em "5 decisões úteis".

#### O diferencial da trilha visual

Ela gera o **único** relatório que registra julgamento humano em tempo real durante execução automática. O relatório contém:

```markdown
# UC-F01 — Relatório visual acompanhado

**Executor:** Playwright headed + controle manual
**PO:** Pasteur
**Data:** 2026-04-25 10:30
**Ambiente:** agenteditais :5180

## Passo 3 — Preencher CNPJ
**Ação:** `page.fill('input[name=cnpj]', 'DEMO_CNPJ 11.111.111/0001-11')`
**Resultado automático:** DOM ✓ | Rede ✓ | Semântica ✓
**Observação do PO:** "O campo aceita sem máscara, deveria formatar imediatamente"
**Status:** APROVADO com observação

## Passo 4 — Preencher CEP
**Ação:** `page.fill('input[name=cep]', '02452-001')`
**Resultado automático:** DOM ✓ | Rede ✓ (viaCEP 200) | Semântica ✓
**Observação do PO:** "Cidade veio 'sao paulo' minúsculo — deveria ser 'São Paulo'"
**Correção necessária:** SIM
**Arquivo sugerido:** backend/endereco.py (normalização de cidade do viaCEP)
```

#### Quando roda
- **Sempre** antes de aprovar mudança relevante num UC.
- Quando um bug reportado pelo Arnaldo é difícil de reproduzir no E2E.
- Quando um UC novo é introduzido: você pilota pra calibrar seletores e descrição ancorada.

---

### 3.3 Forma 3 — Humana (validador externo)

**Para quem:** Arnaldo (validador independente), ou qualquer PO que queira validar sem o sistema rodando.
**Ambiente:** `editaisvalida` (porta 5179 / backend 5008). **Isolado do de desenvolvimento** para não misturar dados reais com dados de validação.
**Dataset:** realista e profissional. CNPJs válidos pelo algoritmo da Receita Federal, nomes de empresa plausíveis, valores em R$ com centavos coerentes.

#### Como roda

Esta trilha **não é executada por Playwright**. Ela gera um **tutorial em Markdown** que o Arnaldo executa manualmente.

1. `/validar-uc UC-F01 --modo=humano`
2. Sistema gera `testes/tutoriais_humano/UC-F01_humano.md`:
   ```markdown
   # Tutorial de validação manual — UC-F01: Manter Cadastro Principal

   ## Metadados
   - Versão: 5.2.0
   - Ambiente: editaisvalida.facilicita.ia (porta 5179)
   - Credenciais: valida1@valida.com.br / 123456
   - Tempo estimado: 5 minutos

   ## Pré-condições
   - Logado com valida1
   - Empresa selecionada: CH Hospitalar

   ## Dados de teste
   | Campo | Valor | Observação |
   |---|---|---|
   | Razão Social | RP3X Comércio e Representações Ltda | Valor real, mas o CNPJ abaixo é fictício |
   | CNPJ | 68.218.777/0001-03 | CNPJ válido pelo algoritmo da RF |
   | CEP | 02452-001 | Bairro real de São Paulo |
   | ... | ... | ... |

   ## Passo 1 — Navegar até Cadastro de Empresa
   **O que fazer:** clique em "Configurações" no menu lateral e depois em "Empresa".
   **O que deve acontecer:** abre a página "Dados da Empresa" com cards de Informações Cadastrais, Endereço, Telefones e Documentos.
   **O que observar criticamente:**
   - A página carrega em menos de 2 segundos?
   - Os cards estão alinhados verticalmente em telas >1400px?
   - O breadcrumb mostra "Configurações > Empresa"?

   ## Passo 2 — Preencher CNPJ
   ...

   ## Critérios de aceitação
   - [ ] A empresa foi salva
   - [ ] Apareceu "Salvo!" em verde por 2 segundos
   - [ ] O CNPJ foi formatado automaticamente com a máscara
   - [ ] A cidade foi preenchida em Title Case ("São Paulo", não "sao paulo")

   ## Limpeza
   Não precisa limpar — o dado de teste fica na sua empresa para próximas validações.
   ```
3. Você envia o tutorial pro Arnaldo (PDF, docx, link).
4. Ele executa **manualmente em editaisvalida :5179**, anota observações em texto ou docx.
5. Você salva a resposta em `testes/relatorios/humano/UC-F01_resposta_arnaldo.txt` (ou docx convertido).

#### Quando roda
- **Fim de sprint**, antes de deploy pra produção.
- Quando um UC é novo ou foi refatorado profundamente.
- Sempre que há dúvida se a experiência está natural pro usuário real.

---

## 7. Injunções fortes ao juiz semântico (Claude analisando telas)

Esta seção não é negociável. Quando Claude faz análise semântica de uma tela na Camada 3, **deve seguir estas regras como comandos, não como sugestões.**

### 7.1 Capturar a tela de forma completa, não parcial

1. **Sempre tirar screenshot de tela inteira.** Nunca screenshot de elemento específico — bug pode estar **ao lado** do elemento esperado (toast de erro parcialmente visível, modal sobreposto).
2. **Capturar árvore de acessibilidade (a11y tree) junto com o screenshot.** O screenshot é input visual; a a11y tree é input estruturado. Ambos alimentam a análise.
3. **Capturar também a URL atual e o status do último request.** Bugs de navegação (ex: ficou na página errada mas parece certa) são invisíveis no screenshot.

### 7.2 Analisar em profundidade, não em superfície

Ao receber a tela + descrição ancorada + lista de elementos obrigatórios + lista de proibidos, Claude deve executar este checklist **mentalmente e documentar cada item**:

**Passo A — Inventário de elementos visíveis**
- Liste TODOS os elementos interativos visíveis (botões, inputs, links, selects, checkboxes)
- Liste TODOS os textos visíveis (títulos, labels, mensagens, toasts, badges)
- Liste TODOS os valores atualmente preenchidos (o que está DENTRO dos inputs)
- Liste elementos de estado (loading spinners, progress bars, skeletons)

**Passo B — Verificação de elementos obrigatórios**
Para CADA elemento na lista `elementos_obrigatorios`:
- Está presente na tela? (sim/não)
- Está na posição esperada? (topo/lateral/rodapé/modal)
- Está com o texto exato? (comparar caractere por caractere quando for literal)
- Está habilitado/desabilitado conforme esperado?
- Valor preenchido (se input) corresponde ao esperado?

**Passo C — Verificação de elementos proibidos**
Para CADA elemento na lista `elementos_proibidos`:
- Está AUSENTE da tela? (Claude deve olhar com cuidado redobrado aqui — LLMs tendem a ignorar ausências)
- Alguma mensagem de erro visível em qualquer canto? (scan da tela inteira, não só do foco principal)
- Algum estado de erro implícito (campo em vermelho, badge cinza onde deveria ser verde)?

**Passo D — Coerência entre tela e ação realizada**
- A ação foi "clicar em Salvar". A tela reflete isso? (toast de sucesso? redirecionamento? modal fechou?)
- O valor preenchido no passo anterior (ex: CNPJ "11.111.111/0001-11") aparece persistido na tela atual?
- Há sinal de que a ação executou de verdade, ou apenas silêncio ambíguo?

**Passo E — Ancoragem temporal**
- A tela está ESTÁVEL (sem loading)? Se tiver loading spinner, aguardar antes de julgar.
- Há alguma mensagem transitória que pode ter sumido durante a captura? (toast de 2s)

### 7.3 Responder em JSON rígido, sem prosa

O retorno DEVE ser exclusivamente JSON válido com esta estrutura:

```json
{
  "veredito": "APROVADO | REPROVADO | INCONCLUSIVO",
  "confianca": 0.0,

  "inventario_tela": {
    "elementos_interativos": [...],
    "textos_visiveis": [...],
    "valores_preenchidos": {"campo1": "valor1"},
    "estado_transitorio": false
  },

  "checklist_obrigatorios": [
    {
      "esperado": "texto 'Salvo!' em verde",
      "encontrado": true,
      "evidencia": "visível ao lado do botão Salvar Alterações, cor rgb(34,197,94)"
    }
  ],

  "checklist_proibidos": [
    {
      "proibido": "mensagem de erro",
      "encontrado": false,
      "varreu_tela_inteira": true
    }
  ],

  "coerencia_com_acao": "Ação foi clicar em Salvar; toast verde 'Salvo!' confirma execução",

  "justificativa": "Todos os obrigatórios presentes; nenhum proibido detectado; coerência OK.",

  "discrepancias_observadas": []
}
```

### 7.4 Regras de decisão (NUNCA violar)

1. **Na dúvida, REPROVE.** Falso positivo (aprovou com bug) custa mais caro que falso negativo (reprovou sem motivo) em sistema com consequência jurídica.

2. **Se algum obrigatório está AUSENTE → REPROVADO.** Sem exceção. Não aprove com "provavelmente está por baixo" ou "pode ter sumido".

3. **Se algum proibido está PRESENTE → REPROVADO.** Mesmo que o obrigatório também esteja presente.

4. **Se a tela está em estado transitório (loading) → INCONCLUSIVO.** Não tente adivinhar o estado final.

5. **Se a URL não bate com o esperado → REPROVADO.** Mesmo que a tela visualmente pareça certa.

6. **Se confiança < 0.85 → NÃO resolva sozinho.** Retorne o JSON com `confianca` real; o orquestrador vai chamar 2x mais e aplicar voto majoritário.

7. **Descrição ancorada ambígua → INCONCLUSIVO com justificativa explicando o que faltou na descrição.** Isso sinaliza pro orquestrador refinar a descrição, não mudar o código.

8. **Nunca use a camada semântica como muleta.** Se um bug poderia ter sido pego pela camada DOM (elemento inexistente) ou Rede (status HTTP errado), a análise semântica NÃO deve aprovar só porque "visualmente parece certo". Na ausência das camadas anteriores, Claude deve marcar `discrepancias_observadas: ["bug perceptível no DOM mas não coberto pela camada estrutural — tutorial precisa ser fortalecido"]`.

### 7.5 Por que tão rígido?

Porque LLMs têm dois vieses sistemáticos nesse tipo de tarefa:

- **Viés da confirmação:** tendem a achar o que foi pedido e ignorar o resto. Por isso a lista `elementos_proibidos` e o Passo C são obrigatórios.
- **Viés da permissividade:** tendem a justificar aprovação mesmo com evidência parcial. Por isso "na dúvida, reprove" e o checklist estruturado.

Em testes de regressão de Facilicita.IA, um bug que escapou da validação e foi pra produção pode custar uma licitação de seis dígitos. **Rigor do juiz é defesa contra o próprio LLM.**

---

## 8. O ciclo iterativo até convergência

Validação não é evento único — é **ciclo** que se repete até todos os casos de teste (Principal + FAs + FEs, nas 3 trilhas) terminarem em APROVADO ou o sistema declarar impasse.

### 8.1 O loop completo

```
┌──────────────────────────────────────────────┐
│  /validar-uc --sprint=N --modo=e2e            │
└──────────────────────────────────────────────┘
                    │
                    ▼
         ┌─────────────────────┐
         │  Fase 0-5 executa   │
         └─────────────────────┘
                    │
                    ▼
            ┌───────────────┐
            │ Divergências? │───NÃO──→  SUCESSO (ciclo encerrado)
            └───────────────┘
                    │ SIM
                    ▼
      ┌──────────────────────────────┐
      │  /corrigir-divergencias       │
      │  classifica causa raiz        │
      └──────────────────────────────┘
                    │
                    ▼
      ┌──────────────────────────────┐
      │  É DEFEITO_CODIGO_OBVIO ou    │
      │  DEFEITO_CODIGO_COMPORTAMENTAL?│
      └──────────────────────────────┘
           │ SIM              │ NÃO
           ▼                   ▼
  ┌────────────────┐   ┌───────────────────┐
  │ Propõe diff +   │   │ Declara IMPASSE   │
  │ checkpoint PO   │   │ (tipo específico) │
  └────────────────┘   └───────────────────┘
           │                   │
           ▼                   ▼
  ┌────────────────┐   ┌───────────────────┐
  │ Aplica, commit  │   │ Aguarda humano    │
  │ em branch       │   │ (sai do loop)     │
  └────────────────┘   └───────────────────┘
           │
           ▼
  ┌────────────────────────────────────┐
  │ Re-executa UCs afetados + baseline │
  └────────────────────────────────────┘
           │
           ▼
      ┌──────────┐
      │ Regressão│──SIM──→ git revert + IMPASSE_REGRESSAO
      │ detectada?│
      └──────────┘
           │ NÃO
           ▼
      ┌──────────┐
      │ Tudo OK? │──SIM──→ SUCESSO
      └──────────┘
           │ NÃO
           ▼
      ┌──────────────┐
      │ Contador < 3 │──SIM──→ volta pro topo (próxima iteração)
      │ iterações?   │
      └──────────────┘
           │ NÃO
           ▼
      IMPASSE_TETO_ITERACOES
```

### 8.2 Condições de parada

O loop **só** termina nos seguintes estados:

| Estado | Significado | Ação |
|---|---|---|
| `SUCESSO_TOTAL` | Todos os casos de teste (FP+FA+FE, 3 trilhas) passaram | Abrir PR, marcar ciclo como concluído |
| `IMPASSE_AMBIGUIDADE_SPEC` | UC permite duas interpretações | PO + time revisam spec, reescrevem UC |
| `IMPASSE_DECISAO_PRODUTO` | Comportamento conflita com UC mas é escolha de produto | Reunião de produto |
| `IMPASSE_ZONA_PROTEGIDA` | Correção exigiria tocar em zona protegida | Dev sênior revisa manualmente |
| `IMPASSE_DADO_TESTE` | Dado gerado na Fase 1 está errado | Revisar gerador de dados |
| `IMPASSE_JUIZ_FLUTUANTE` | Camada semântica com voto dividido persistente | Refinar descrição ancorada |
| `IMPASSE_TETO_ITERACOES` | 3 tentativas sem convergir | Análise humana |
| `IMPASSE_REGRESSAO` | Correção de um caso quebrou outro | Decisão de produto — casos em conflito |
| `IMPASSE_CAUSA_RAIZ_OBSCURA` | Análise não identifica defeito com confiança | Debug manual com dev |

**O loop NÃO tem outros modos de saída.** Ele não "desiste silenciosamente". Não "pula o caso difícil". Não "aprova com ressalva".

### 8.3 Teto de iterações como proteção

Default: **3 iterações por ciclo.** Configurável entre 1 e 5 via parâmetro.

Por que 3?
- 1 iteração: descobre classe de bug óbvia (ex: status HTTP errado)
- 2 iterações: corrige efeito colateral da primeira correção
- 3 iterações: captura bugs cruzados entre UCs
- Além disso: **quase sempre é sinal de ambiguidade de spec ou decisão de produto** — o loop automático não resolve, só mascara.

**Recomendação forte para primeira rodada do processo:** começar com teto = 1. Isso força o agente a ser conservador na classificação. Depois que você ganhar confiança, aumenta para 2 ou 3.

### 8.4 Detecção de regressão obrigatória

Após cada correção, o loop **não** pode apenas re-executar o UC afetado. Ele deve re-executar:

1. O UC que motivou a correção (obviamente)
2. Todos os outros UCs no ciclo atual (correção pode ter efeito cruzado)
3. Subconjunto da **baseline de UCs previamente aprovados** que tocam nos mesmos arquivos modificados
4. Se o arquivo modificado é compartilhado por muitos UCs (ex: `backend/crud_routes.py`): **toda a baseline**

Se qualquer UC que antes passava agora falha → **`git revert` automático + IMPASSE_REGRESSAO**. Sem exceção. Não tente "corrigir a correção" — é sinal de que os casos estão em conflito e precisam de decisão humana.

### 8.5 Convergência parcial é aceita

Se após 3 iterações **alguns** UCs passaram e **outros** ficaram em impasse, o ciclo é `SUCESSO_PARCIAL`. Os aprovados podem ir pra PR; os em impasse ficam marcados no relatório com categoria + recomendação.

Não é falha — é progresso auditável. Falha é declarar "tudo passou" quando nem todos os casos de teste foram executados.

### 8.6 Cada iteração é documentada

`testes/relatorios/ciclo_<timestamp>/iteracoes/iteracao_N.md` contém:

- Quais UCs foram re-executados nessa iteração
- Quais correções foram aplicadas (diffs + commits)
- Qual UC virou de REPROVADO→APROVADO (progresso)
- Qual UC virou de APROVADO→REPROVADO (regressão — rollback automático)
- Quais permanecem REPROVADO (vai pra próxima iteração ou impasse)

Assim você pode reconstruir exatamente por que o ciclo convergiu ou não.

---

## 9. Time de agentes do processo de validação

O processo não é executado por um único Claude genérico — ele é orquestrado por um **time de 9 agentes especializados**, cada um com prompt próprio, responsabilidades delimitadas e gatilhos específicos. Isso existe para evitar **viés de confirmação** (o mesmo agente que cria a spec também a julga) e para padronizar a saída de cada etapa.

### 9.1 Visão geral do time

```
                    ┌───────────────────────────────┐
                    │  validation-coordinator        │
                    │  (orquestra tudo, mantém       │
                    │   estado do ciclo e            │
                    │   checkpoints)                 │
                    └───────────────┬───────────────┘
                                    │
      ┌──────────────┬───────────────┼──────────────┬──────────────┐
      │              │               │              │              │
      ▼              ▼               ▼              ▼              ▼
┌──────────┐  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
│  uc-     │  │ dataset- │   │ test-    │   │ tutorial-│   │ semantic-│
│ analyzer │  │ auditor  │   │ case-    │   │ writer   │   │ judge    │
│          │  │          │   │ generator│   │          │   │          │
└──────────┘  └──────────┘   └──────────┘   └──────────┘   └──────────┘
                                                                  │
                                    (se reprova)                   │
                                    ▼                              │
                            ┌───────────────┐                      │
                            │ root-cause-   │                      │
                            │ classifier    │                      │
                            └───────┬───────┘                      │
                                    │                              │
                      ┌─────────────┼─────────────┐                │
                      ▼             ▼             ▼                │
                ┌──────────┐  ┌──────────┐  ┌──────────┐          │
                │ critique │  │code-fixer│  │ IMPASSE  │          │
                │(2a opin) │  │          │  │          │          │
                └──────────┘  └──────────┘  └──────────┘          │
                                                                  │
                              (todos reportam de volta pro)       │
                              validation-coordinator ◀────────────┘
```

### 9.2 Os 9 agentes

#### `validation-coordinator` — Orquestrador do ciclo

**Gatilho:** chamado pelo `/validar-uc` ou `/corrigir-divergencias`.
**Input:** lista de UCs, modo (e2e/visual/humano), ciclo_id (se retomada).
**Saída:** relatório final do ciclo + dispatch pros outros agentes.
**Papel:**
- Executa Fase 0 (provisionamento, via código não-LLM)
- Decide qual próximo UC rodar
- Chama os outros agentes em sequência com o input certo
- Gerencia checkpoints (Fase 1.4, 2.4, 3.4 — apresenta ao humano, aguarda "prossiga")
- Mantém `testes/contextos/<ciclo_id>/estado.yaml` atualizado (qual UC passou, qual falhou, qual iteração está)
- Declara impasses quando aplicável
- Nunca julga conteúdo — só orquestra.

**Por que é agente e não código:** precisa decidir dinamicamente com base em estado complexo. Decisões como "devo rodar UC-F02 agora?" dependem de "UC-F01 passou?", "qual trilha?", "qual teto de iterações restante?".

---

#### `uc-analyzer` — Analisador de Casos de Uso

**Gatilho:** chamado pelo coordinator ao iniciar processamento de um UC.
**Input:** arquivo `testes/casos_de_uso/UC-F01.md` (texto em markdown).
**Saída:** YAML estruturado com:
```yaml
uc_id: UC-F01
nome: "Manter Cadastro Principal"
atores: [usuario_logado]
fluxos:
  principal:
    - passo: 1, ação: "navegar empresa", resposta: "..."
    - ...
  alternativos:
    - id: FA1, gatilho: "CEP não encontrado", variação_do_passo: 4, ...
  excecoes:
    - id: FE1, gatilho: "viaCEP offline", ...
pre_condicoes: [usuario_logado, empresa_nao_existe]
pos_condicoes: [empresa_criada]
rns_envolvidas: [RN-028, RN-042, RN-078, RN-206]
campos_do_form: [razao_social, cnpj, ie, cep, endereco, telefone, ...]
telas_envolvidas: [EmpresaPage]
dados_necessarios_inferidos: [cnpj_valido_rf, cep_valido, email_valido, ...]
```
**Papel:** ler o UC e transformar em estrutura machine-readable. Sempre preserva FP + FAs + FEs explicitamente.
**Dependência:** nenhuma. Primeiro agente a ser chamado por UC.

---

#### `dataset-auditor` — Auditor de datasets

**Gatilho:** chamado APÓS a Fase 0 (provisionamento) e antes da Fase 1.
**Input:** `testes/contextos/<ciclo_id>/contexto.yaml` + análise do UC.
**Saída:** JSON com `aprovado: true/false` + lista de problemas detectados.
**Papel (adversarial — tenta achar falhas):**
- CNPJs são realmente válidos pelo algoritmo RF?
- Usuários alocados realmente não colidem com existentes?
- Editais selecionados têm PDF baixável? URLs respondem 200?
- Documentos renderizados têm o CNPJ correto da empresa?
- Os dados batem com o que o UC vai exigir?
- Se veio do `uc-analyzer` a info "precisa CEP válido", o CEP no contexto é válido?

**Por que adversarial:** provisionador pode estar com bug silencioso. Auditor tenta quebrar.

---

#### `test-case-generator` — Gerador de casos de teste

**Gatilho:** chamado na Fase 2 do `/validar-uc`, uma vez por fluxo do UC.
**Input:** análise do UC + dataset do ciclo + trilha (E2E/Visual/Humano).
**Saída:** arquivo em `testes/casos_de_teste/UC-F01_e2e_fp.yaml` (e variações FA/FE).
**Papel:**
- Para cada fluxo (principal, FA1, FA2, ..., FE1, FE2, ...), gera um caso de teste
- Define asserções nas 3 camadas de validação (DOM, Rede, Semântica)
- Escreve **descrição ancorada** específica o bastante pra não confundir telas
- Lista `elementos_obrigatorios` + `elementos_proibidos`
- Referencia dataset por path (`dataset_ref`), não duplica valores

**Regra crítica:** **nunca gera um único caso de teste "abrangente".** Um caso por fluxo. Se UC tem 1FP + 2FA + 3FE = 6 casos de teste por trilha = 18 arquivos.

---

#### `tutorial-writer` — Escritor de tutoriais

**Gatilho:** chamado na Fase 3, após casos de teste aprovados pelo coordinator.
**Input:** caso de teste + dataset + análise do UC + trilha.
**Saída:**
- `tutoriais_playwright/<UC>_<variacao>.md` (YAML runnable) se trilha E2E
- `tutoriais_visual/<UC>_<variacao>.md` (MD + YAML) se trilha Visual
- `tutoriais_humano/<UC>_<variacao>.md` (prosa fluida) se trilha Humano

**Papel:** traduzir caso de teste (asserções) + dataset (valores) numa instrução de execução específica do formato da trilha. Tutoriais referenciam caso de teste e dataset, não duplicam.

**Diferencial por trilha:**
- Humano: prosa envolvente, dados embutidos inline (Arnaldo não tem parser), observações críticas em cada passo
- Visual: pontos de observação explícitos ("verifique se a animação é fluida")
- E2E: YAML seco, só seletores + asserções

---

#### `semantic-judge` — Juiz semântico

**Gatilho:** chamado pela Fase 4 (execução E2E ou Visual) em cada passo, **somente se Camadas 1 e 2 (DOM/Rede) passaram.**
**Input:** screenshot + a11y tree + descrição ancorada + elementos_obrigatorios + elementos_proibidos + URL atual.
**Saída:** JSON com veredito, confiança, inventário da tela, checklists, justificativa, discrepâncias (conforme seção 7 deste doc).
**Papel:** analisar profundamente a tela obtida vs esperada, seguindo as 8 regras de decisão inviolávels da seção 7.

**Por que é agente separado:** mentalidade independente. Quem escreveu a descrição ancorada (`test-case-generator`) NÃO pode julgar seu próprio trabalho — viés de confirmação. `semantic-judge` é chamado do zero, sem histórico do ciclo, só com o prompt + inputs.

**Redução de não-determinismo:** se `confianca < 0.85`, o coordinator chama o agente mais 2x e aplica voto majoritário.

---

#### `root-cause-classifier` — Classificador de causa raiz

**Gatilho:** chamado pelo `/corrigir-divergencias` quando há divergência em algum UC.
**Input:** relatório de reprovação + código fonte relevante + UC original.
**Saída:** YAML com categoria + arquivos envolvidos + confiança da classificação.
**Papel:** classificar a divergência em **uma** das 6 categorias:
- `DEFEITO_CODIGO_OBVIO`
- `DEFEITO_CODIGO_COMPORTAMENTAL`
- `AMBIGUIDADE_SPEC`
- `DECISAO_PRODUTO`
- `DADO_TESTE_INCORRETO`
- `JUIZ_SEMANTICO_FLUTUANTE`
- `ZONA_PROTEGIDA`
- `CAUSA_RAIZ_OBSCURA`

**Obrigação:** se incerto entre duas categorias, **prefere a mais conservadora** (sempre escolhe impasse em vez de "tentar corrigir").

---

#### `critique` — Crítico adversarial

**Gatilho:** chamado **antes** de aplicar correções (2ª opinião obrigatória).
**Input:** classificação do `root-cause-classifier` + diff proposto pelo `code-fixer`.
**Saída:** JSON com `aprovado_para_aplicar: true/false` + razões.
**Papel (adversarial):**
- A classificação de causa raiz faz sentido com a evidência?
- O diff proposto realmente corrige a causa raiz ou só silencia o sintoma?
- Há risco de regressão em outros UCs?
- A correção toca em arquivo próximo de zona protegida?
- O `test-case-generator` não poderia ter sido mais específico em vez de pedir correção no código?

**Poder de veto:** se `critique` reprova, `code-fixer` não aplica. Coordinator marca como `IMPASSE_CRITIQUE_VETO` e escala pro humano.

**Por que vale o custo:** em domínio com consequência jurídica, 2ª opinião adversarial evita correção silenciosa baseada em suposição errada.

---

#### `code-fixer` — Aplicador de correções

**Gatilho:** chamado APÓS `root-cause-classifier` dizer `DEFEITO_CODIGO_*` E `critique` aprovar.
**Input:** classificação + arquivos envolvidos + teste reprovado.
**Saída:** diff mínimo pronto pra commit.
**Papel:**
- Lê os arquivos envolvidos
- Propõe a menor mudança que resolve a causa raiz
- Explica em 2-3 linhas o que muda e por quê
- Identifica efeitos colaterais potenciais
- Nunca toca em zonas protegidas
- Commit em branch isolada, nunca em main

**Restrição:** só roda em `DEFEITO_CODIGO_OBVIO` ou `DEFEITO_CODIGO_COMPORTAMENTAL`. Outras categorias = impasse direto, não chama `code-fixer`.

### 9.3 Fluxo temporal de invocação

Para 1 UC do tipo que tem 1FP + 2FA + 3FE = 6 variações, na trilha E2E:

```
1. coordinator carrega UC
2. coordinator → uc-analyzer → estrutura YAML do UC
3. (Fase 0 roda uma vez por ciclo, em código não-LLM)
4. coordinator → dataset-auditor (auditor aprova contexto)
5. coordinator gera 3 datasets (Fase 1, código + template)
6. coordinator → test-case-generator (chamado 6 vezes — 1 por fluxo)
7. [CHECKPOINT com humano]
8. coordinator → tutorial-writer (chamado 6 vezes — 1 por fluxo)
9. [CHECKPOINT com humano]
10. coordinator executa os 6 tutoriais (runner Playwright headless)
    Para cada passo com Camada 3 ativa:
    coordinator → semantic-judge (chamado N vezes — 1 por passo semântico)
    (se confiança < 0.85: chama 2x mais)
11. coordinator gera relatório da trilha E2E

(Se algum dos 6 casos reprovou, entra no loop de correção:)
12. coordinator → root-cause-classifier
13. Se DEFEITO_CODIGO_*:
    14. coordinator → code-fixer (propõe diff)
    15. coordinator → critique (2a opinião)
    16. Se critique aprovar: aplica diff, commit, volta pro passo 10 (re-valida)
    17. Se critique vetar: impasse
18. Se outra categoria: impasse imediato

Repete loop até 3 iterações ou todos aprovados.
```

### 9.4 Comunicação entre agentes

- **Stateless:** cada agente é chamado com input completo. Não depende de histórico.
- **JSON estruturado:** saída de cada agente é JSON/YAML parseável pelo coordinator.
- **Logs centralizados:** coordinator grava cada chamada em `testes/relatorios/ciclo_<id>/agentes/<agente>_<timestamp>.json`.
- **Reprodutibilidade:** pode-se rejogar uma chamada de agente específica fornecendo o input gravado.

### 9.5 Escalação pra humano

| Situação | Agente que detecta | Ação |
|---|---|---|
| Confiança < 0.85 no juiz semântico | `semantic-judge` | Coordinator chama 2x mais e aplica voto majoritário |
| Dataset inválido (CNPJ duplicado, edital offline) | `dataset-auditor` | Impasse `IMPASSE_DADO_TESTE` |
| Causa raiz ambígua ou obscura | `root-cause-classifier` | Impasse correspondente |
| Diff proposto cheira a muleta | `critique` | Impasse `IMPASSE_CRITIQUE_VETO` |
| Spec ambígua | `uc-analyzer` ou `test-case-generator` | Para checkpoint e pergunta |

**Nenhum agente decide sozinho em caso de dúvida.** Escalação é política.

### 9.6 Reuso de agentes existentes do projeto

Os 9 agentes de validação são **novos** e separados dos 9 agentes já existentes em `.claude/agents/` (backend/frontend/page engineers). Coexistem. Os de validação têm prefixo `validation-` nos arquivos:

- `.claude/agents/validation-coordinator.md`
- `.claude/agents/validation-uc-analyzer.md`
- `.claude/agents/validation-test-case-generator.md`
- `.claude/agents/validation-tutorial-writer.md`
- `.claude/agents/validation-semantic-judge.md`
- `.claude/agents/validation-root-cause-classifier.md`
- `.claude/agents/validation-code-fixer.md`
- `.claude/agents/validation-critique.md`
- `.claude/agents/validation-dataset-auditor.md`

### 9.7 Custo estimado (tokens por UC)

Rodar um UC com 6 variações e 5 passos semânticos por variação, sem reprovação:

| Agente | Chamadas | Tokens aproximados |
|---|---|---|
| uc-analyzer | 1 | 3k |
| dataset-auditor | 1 | 2k |
| test-case-generator | 6 | 12k |
| tutorial-writer | 6 | 15k |
| semantic-judge | 30 (6 × 5) | 60k |
| coordinator | ~20 | 10k |
| **Total por UC aprovado direto** | — | **~100k tokens** |

Se reprovar e entrar em loop de correção, +30k por iteração (classifier + critique + fixer).

Em ciclo de 5 sprints com ~80 UCs: **~8M tokens** no feliz, **~15M** se metade reprova. Comparado a validar manualmente 80 UCs com QA, é barato.

---

## 10. Cross-check: como as 3 formas conversam

Depois das 3 rodadas por UC, `/corrigir-divergencias UC-F01` compara os 3 relatórios e classifica:

| E2E | Visual | Humano | Leitura |
|---|---|---|---|
| ✓ | ✓ | ✓ | Consistente. UC aprovado. |
| ✗ | ✗ | ✗ | Bug real. Corrigir no código. |
| ✓ | ✓ | ✗ | **Bandeira vermelha.** O automático não pegou algo que o humano pegou. Refinar descrição ancorada. **Nunca** só confiar no automático. |
| ✓ | ✗ | ✓ | Visual foi rigoroso demais, ou humano foi superficial. Investigar. |
| ✗ | ✓ | ✓ | Seletor frágil. Refatorar no produto pra o E2E alcançar. |
| ✗ | ✗ | ✓ | Automático pegou um bug que o humano não achou. Bug real (humano foi superficial). |
| ✗ | ✓ | ✗ | Ponto cego da trilha visual. Revisar protocolo visual. |

**Autoridade:** validação humana é autoridade superior. Se ela diverge do automático, ajusta-se o automático, nunca o contrário.

### Impasses possíveis

O loop de correção nunca modifica código se encontrar:

- **IMPASSE_AMBIGUIDADE_SPEC** — o UC permite duas interpretações.
- **IMPASSE_DECISAO_PRODUTO** — o comportamento atual é escolha de produto que conflita com o UC.
- **IMPASSE_ZONA_PROTEGIDA** — correção exigiria mexer em `backend/rn_validators.py`, integrações governamentais, financeiro, auth, etc.
- **IMPASSE_REGRESSAO** — corrigir o UC A quebrou o UC B previamente aprovado.
- **IMPASSE_TETO_ITERACOES** — 3 tentativas sem sucesso.

Impasses viram issue/Slack, aguardam decisão humana.

---

## 11. Fluxo completo, end-to-end, de 1 UC

Vamos seguir UC-F01 do início ao fim, como seria feito após o plano estar implementado:

### Segunda-feira, 10h — kickoff da sprint
PO (você) abre `/validar-uc UC-F01,UC-F02,UC-F03 --modo=visual`.

- **Fase 1 (síntese):** Claude lê os 3 UCs, gera 3 datasets por UC (9 conjuntos no total), apresenta em tabela Markdown, pede "prossiga".
- Você revisa, corrige algum valor, responde "prossiga".

- **Fase 2 (tutoriais):** Claude gera 9 tutoriais (3 humanos + 3 visuais + 3 playwright), apresenta caminhos e resumo de uma linha por passo, pede "prossiga".
- Você responde "prossiga".

- **Fase 3 (visual):** sobe painel :9876, abre browser em :5180, executa UC-F01 passo a passo. Você acompanha, anota 2 observações, nenhuma correção crítica. UC-F02 mesma coisa. UC-F03 você clica "Correção necessária" no passo 5 porque o toast não aparece.

- **Fase 4 (relatório):** 3 relatórios em `testes/relatorios/visual/`.

### Segunda-feira, 14h — CI automática
Você abre PR com a feature. CI dispara `/validar-uc --modo=e2e` em todos os UCs da Sprint 1.

Resultado: UC-F01 e F02 ✓, UC-F03 ✗ no passo 5.

- `/corrigir-divergencias UC-F03` é disparado pelo CI.
- Análise classifica como `DEFEITO_CODIGO_OBVIO` (toast não sendo emitido no handler).
- Propõe diff.
- Você aprova.
- Aplica, re-valida, passa.

### Sexta-feira, 17h — fim de sprint
`/validar-uc UC-F01..UC-F17 --modo=humano` gera 17 tutoriais humanos.

Você empacota num zip + PDF e manda pro Arnaldo por email.

### Terça seguinte — resposta do Arnaldo
Arnaldo manda um docx com observações por UC.

- Você converte em markdown, salva cada em `testes/relatorios/humano/UC-F??_resposta_arnaldo.md`.
- `/corrigir-divergencias UC-F01..UC-F17 --cross-check` compara as 3 trilhas.
- Detecta 4 bandeiras vermelhas (E2E+Visual OK, Humano REPROVA).
- Refina descrição ancorada nos 4 tutoriais.
- Re-roda as 3 trilhas.
- Aprova ou declara impasse.

---

## 12. Papéis e responsabilidades

| Quem | Responsabilidade |
|---|---|
| **Claude Code** | Executar `/validar-uc` e `/corrigir-divergencias`, sintetizar dados, gerar tutoriais, classificar divergências, propor correções. Respeitar zonas protegidas. |
| **Você (Pasteur, PO/dev)** | Aprovar datasets em Fase 1, aprovar tutoriais em Fase 2, pilotar a trilha visual em passos críticos, revisar diffs antes de aplicar, revisar tutoriais humanos antes de enviar pro Arnaldo. |
| **Arnaldo (validador)** | Executar o tutorial humano em `editaisvalida :5179`, anotar observações na UI de validação acompanhada visual se ele quiser executar localmente, ou em docx se for remoto. Prioridade máxima em UX/negócio. |
| **CI** | Rodar E2E em todos os UCs a cada PR, todas as noites em modo full regression. Abrir issue quando houver impasse. |

---

## 13. Sinais de saúde do processo

Métricas a monitorar no relatório final do ciclo:

- **Taxa de aprovação no 1º passe:** alta (>80%) = UCs estão bem escritos.
- **Tokens por UC na camada semântica:** se subindo, descrições ancoradas estão ficando vagas.
- **Frequência de voto dividido (3 execuções do juiz semântico):** se frequente, a screenshot + descrição estão ambíguas.
- **Divergência E2E vs Humano:** se alta, o protocolo automático está permissivo.
- **Impasses por ciclo:** se subindo, o design está em zona cinzenta demais.

---

## 14. Convenções e regras do projeto

- **Prefixos de dados:**
  - Realistas: sem prefixo
  - Demo (visual): `DEMO_`
  - E2E: `E2E_<YYYYMMDD>_`
- **Limpeza:**
  - E2E: automática via `DELETE WHERE ... LIKE 'E2E_%'`
  - DEMO: manual ao encerrar sessão visual
  - Humano: mantém na empresa para próximas validações
- **Diretórios (3 camadas de artefatos + suporte + contexto):**
  - `testes/casos_de_uso/` — specs de negócio (1 arquivo por UC) — **entrada**
  - `testes/contextos/<ciclo_id>/` — **Fase 0**: contexto do ciclo (contexto.yaml, editais baixados, documentos renderizados)
  - `testes/datasets/` — **camada 1**: 3 datasets por UC em YAML (consultam o contexto do ciclo)
  - `testes/casos_de_teste/` — **camada 2**: 3 casos de teste por UC com asserções
  - `testes/tutoriais_playwright/` — **camada 3 (trilha e2e)**: YAML runnable
  - `testes/tutoriais_visual/` — **camada 3 (trilha visual)**: MD + YAML pro parser
  - `testes/tutoriais_humano/` — **camada 3 (trilha humana)**: MD prosa pro Arnaldo
  - `testes/fixtures/seeds/` — SQL de setup (opcional)
  - `testes/fixtures/documentos_template/` — **templates de documentos fictícios** (Jinja2 + PDFs base) renderizados na Fase 0 para cada empresa
  - `testes/framework_visual/` — código Python do framework visual (parser, executor, painel)
  - `testes/framework_provisionamento/` — código Python da Fase 0 (gerador CNPJ, adapter PNCP, renderizador de documentos)
  - `testes/relatorios/{automatico,visual,humano}/` — saídas separadas por trilha
- **Commits do loop de correção:** `fix(validacao): <resumo>` com referência à divergência
- **Branch de correção:** `validacao/<timestamp>-<lista_uc_ids>`

---

## 15. O que cada artefato contém (referência rápida)

Por UC, são gerados **9 artefatos de entrada** (3 camadas × 3 trilhas) + até **3 relatórios** (1 por trilha executada).

### Camada 1 — Datasets

#### `testes/datasets/UC-F01_e2e.yaml`
YAML com valores determinísticos `E2E_<data>_*`. Triplo formato (entrada/exibição/trânsito) para campos numéricos/datados. **Usado pelo runner E2E.**

#### `testes/datasets/UC-F01_visual.yaml`
YAML com valores memoráveis prefixados `DEMO_`. Legíveis no painel, identificáveis como teste. **Usado pelo framework visual.**

#### `testes/datasets/UC-F01_humano.yaml`
YAML com valores realistas (CNPJ válido RF, endereço real, nomes profissionais). Claude lê este YAML e embute os valores como texto natural no tutorial humano final. **Usado na geração do tutorial humano.**

### Camada 2 — Casos de teste

#### `testes/casos_de_teste/UC-F01_e2e.yaml`
Asserções rígidas por passo nas 3 camadas de validação (DOM/Rede/Semântica). `dataset_ref` aponta pro dataset. **Usado pelo runner E2E.**

#### `testes/casos_de_teste/UC-F01_visual.yaml`
Asserções automáticas (DOM/Rede) + **pontos de observação** por passo (texto que aparece no painel: "observe se a animação está fluida"). **Usado pelo framework visual.**

#### `testes/casos_de_teste/UC-F01_humano.md`
Markdown com **checklists** por passo: "[ ] O valor aparece em R$ com vírgula", "[ ] Não aparece mensagem de erro". Critérios objetivos pro Arnaldo marcar. **Embutido no tutorial humano final.**

### Camada 3 — Tutoriais

#### `testes/tutoriais_playwright/UC-F01_happy_path.md`
YAML runnable. Cada passo tem `acao` (tipo + seletor + `valor_from_dataset`) e `validacao_ref` apontando pro caso de teste. Runner resolve referências. **Consumido pelo runner E2E.**

#### `testes/tutoriais_visual/UC-F01_visual.md`
MD + blocos YAML. Texto natural renderizado no painel + YAML estruturado pro parser Python. Cada passo referencia dataset e caso de teste. **Consumido pelo framework visual.**

#### `testes/tutoriais_humano/UC-F01_humano.md`
MD em prosa com dados + checklist **embutidos inline** (não referência). Motivo: o Arnaldo não tem parser, precisa de arquivo auto-contido. **Pro Arnaldo executar manualmente.**

### Relatórios (saídas)

#### `testes/relatorios/automatico/UC-F01_<ts>.md`
Markdown machine-friendly. Sumário executivo, linha do tempo, evidências (screenshots, payloads JSON), custo em tokens. Referencia os 3 artefatos usados (dataset + caso de teste + tutorial). **Pro CI/dashboard.**

#### `testes/relatorios/visual/UC-F01_<ts>.md`
Markdown com seções por passo. Cada passo tem ação, resultado automático (DOM/Rede/Semântica), **observação do PO**, **correção sugerida**, screenshots. **Para você revisar depois.**

#### `testes/relatorios/humano/UC-F01_resposta_arnaldo.md`
Formato livre (docx convertido para MD). Tipicamente: observação por passo ou por UC. **Para cross-check e entrada do loop de correção.**

---

## 16. Primeiros passos depois da implementação

Quando o PLANO V3 estiver executado (~11h de trabalho):

1. **Piloto UC-F01 em 3 passes** (3h):
   - Passe VISUAL primeiro (calibração comigo ao seu lado)
   - Passe E2E (regressão rápida)
   - Passe HUMANO (gerar tutorial e revisar antes de mandar pro Arnaldo)

2. **Se piloto for bem:** escalar pros UCs da Sprint 1 inteira (F01-F17).

3. **Se piloto revelar gap:** ajustar framework antes de escalar.

4. **Ciclo completo em Sprint 2** quando primeira sprint tiver estabilizado.

---

## 17. Referências

- Protocolo `/validar-uc` detalhado: `docs/validar-uc.md`
- Protocolo `/corrigir-divergencias`: `docs/corrigir-divergencias.md`
- Contexto Claude Code: `docs/CLAUDE.md`
- Plano de validação visual original: `docs/planovalidacaovisualautomatica.v1.md`
- Plano de implementação V3 (deste processo): `docs/PLANO VALIDACAO V3.md`
- Casos de uso V5:
  - Sprint 1: `docs/CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md`
  - Sprint 2: `docs/CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V5.md`
  - Sprint 3/4: `docs/CASOS DE USO PRECIFICACAO E PROPOSTA V5.md`
  - Sprint 4: `docs/CASOS DE USO RECURSOS E IMPUGNACOES V5.md`
  - Sprint 5: `docs/CASOS DE USO SPRINT5 V5.md`

---

## 18. FAQ curto

**Por que 3 trilhas e não uma super-completa?**
Porque cada uma tem custo e cobertura diferentes. E2E é barata e rápida, Humana é cara e lenta. Rodar só E2E deixa UX cega. Rodar só Humana trava o desenvolvimento.

**O PO tem que acompanhar toda trilha Visual?**
Não. Ela é opcional, para quando você quer co-pilotar uma mudança significativa. Pode pular em commits triviais.

**E se o Arnaldo achar um bug que o E2E não achou?**
Bandeira vermelha no cross-check. **Ajusta-se a descrição ancorada do E2E, nunca o contrário.** Validação humana é autoridade superior.

**Posso rodar as 3 ao mesmo tempo?**
Sim. Visual bloqueia o browser, E2E roda headless em outra instância, Humana é remota no editaisvalida. São ambientes isolados.

**Dá pra validar em paralelo (vários UCs simultâneos)?**
E2E sim (CI paraleliza). Visual não (você só pode pilotar um de cada vez). Humana sim (Arnaldo recebe lote de tutoriais).

**E se o caso de uso tiver bug (não o código)?**
Impasse. O loop não reescreve UCs sozinho. Decisão de produto.

**O CNPJ da empresa fictícia pode colidir com uma empresa real?**
Não. O gerador da Fase 0 usa o algoritmo da RF e consulta o banco antes de confirmar. Se o CNPJ já existir, retry até achar um único.

**E se os editais pré-selecionados na Fase 0 sumirem do PNCP durante o ciclo?**
Os arquivos já foram baixados na Fase 0 pra `testes/contextos/<ciclo_id>/editais/`. Mesmo se o PNCP remover, os dados locais continuam válidos. A URL original fica registrada pra auditoria.

**Posso pausar um ciclo e retomar depois?**
Trilha Visual: sim (reexecuta `python testes/framework_visual/executor.py --retomar <ciclo_id>`). Trilha E2E: não faz sentido (headless, 20 min no total). Trilha Humana: obviamente sim — o Arnaldo executa no ritmo dele.

**E se um UC da Sprint 2 depender de produto cadastrado na Sprint 1 que falhou?**
Sprint 1 falhada bloqueia Sprint 2 automaticamente. O relatório diz "UC-CV01 não executado — depende de UC-F07 que falhou". Você decide se consegue ignorar a dependência ou se precisa corrigir Sprint 1 antes.

**O UC tem só fluxo principal definido. E os alternativos/exceções?**
Claude deve inferir as exceções comuns (timeout, campo vazio, valor extremo, backend 500, serviço externo offline) e perguntar no checkpoint da Fase 1 se os incluir. Você aprova ou ajusta. Nunca gerar só o fluxo principal silenciosamente.

**Quantas iterações o loop pode tentar?**
Default 3. Configurável entre 1 e 5. Recomendação: começar com 1 na primeira vez que você rodar o processo, pra calibrar o quão confiante o Claude está sendo na classificação de causa raiz. Depois aumenta.

**O loop pode aprovar um UC sem executar todos os FAs e FEs?**
Não. O UC só é APROVADO se TODOS os casos de teste dele (principal + alternativos + exceções) tiverem passado nas 3 trilhas (ou nas trilhas que foram executadas no ciclo). Aprovação parcial é REPROVAÇÃO.

**Claude pode "chutar" na análise semântica se não tem certeza?**
Não. Deve retornar `INCONCLUSIVO` com `confianca < 0.85`. O orquestrador vai rodar 2x mais e aplicar voto majoritário. Se persiste inconclusivo, é sinal de descrição ancorada fraca — volta pra Fase 2 refinar a spec de validação, não muda código.

---

**Pronto para começar?** Quando estiver de acordo com este documento e com o `PLANO VALIDACAO V3.md`, começamos pela Fase A do plano (instalação base).
