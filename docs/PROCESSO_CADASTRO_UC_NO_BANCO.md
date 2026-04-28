# Processo de Cadastro de UC (Tutorial + Passos + Dataset) no Banco `testesvalidacoes`

**Versão:** 1.0
**Data:** 2026-04-28
**Autor:** Claude (consolidando processo aplicado para UC-F01)
**Audiência:** desenvolvedores, agentes Claude futuros, **app gerador de validações com LLM** que possa ser construído depois

---

## 0. Sumário executivo

Este documento formaliza **como cadastrar um caso de uso completo no banco `testesvalidacoes`** para que ele possa ser executado pelo `executor_sprint1.py` (DB-aware). Foi consolidado a partir do trabalho feito para o **UC-F01 (Cadastro de Empresa)** em 28/04/2026 e deve ser seguido literalmente para os demais UCs da Sprint 1 (F02..F17), sprints futuras (Sprint 2..N) e por qualquer LLM/agente que gere validações automaticamente.

**O que é "cadastrar UC no banco":**

1. Inserir o **dataset** (dados de teste — campos do formulário, contextos, etc.) na tabela `datasets`
2. Inserir os **passos do tutorial** (sequência de ações Playwright + asserts) na tabela `passos_tutorial`
3. Garantir que dados únicos no banco da aplicação (`editais`) usem **placeholders** que sejam resolvidos em runtime para evitar colisão entre execuções

**Resultado:** o tester abre o app web, escolhe o UC, clica "Iniciar" e o `executor_sprint1.py` lê tudo do banco, executa o Playwright, persiste evidências (screenshots/passos) também no banco.

---

## 1. Pré-requisitos

Antes de começar a cadastrar um UC, certifique-se de que:

| Pré-requisito | Onde verificar |
|---|---|
| O UC tem caso de uso documentado em markdown | `testes/casos_de_uso/UC-FNN.md` |
| O UC tem entrada na tabela `casos_de_uso` (campo `uc_id` = "UC-FNN") | `seed/seed_ucs_sprint1.py` |
| O UC tem ao menos 1 CT cadastrado em `casos_de_teste` | seed |
| Existe documento normativo IEEE 829 dos CTs do UC | `docs/CASOS DE TESTE PARA VALIDACAO SPRINT1 CONJUNTO1 V7.md` |
| O fluxo está implementado no app | rodar manualmente para confirmar antes de automatizar |

Se algo falta, **pare e gere o que falta primeiro**. Não tente cadastrar passos para um UC ainda não implementado no app.

---

## 2. Arquivos de origem (3 inputs)

Cada UC precisa de **3 arquivos** em disco antes de virar registro no banco:

### 2.1. Dataset YAML — `testes/datasets/UC-FNN_visual.yaml`

Contém os **dados que o tutorial vai usar** (formulários, valores esperados, dados de contexto). Estrutura:

```yaml
# Metadados (não vão para dados_json no banco)
uc_id: UC-FNN
trilha: visual
ciclo_id_default: piloto-ucfNN

# Dados de teste (vão para dados_json no banco)
empresa:
  cnpj: "{{CNPJ_UNICO}}"
  razao_social: "DEMO {{SUFIXO_CICLO}} Comércio e Representações Ltda"
  nome_fantasia: "DEMO {{SUFIXO_CICLO}} Comércio"
  inscricao_estadual: "{{IE_UNICA}}"
  inscricao_municipal: "{{IM_UNICA}}"
  email: "contato+{{SUFIXO_CICLO}}@demo.com.br"
  telefone: "{{TELEFONE_UNICO}}"
  # campos não-únicos podem ser fixos:
  endereco: "Av. da Validação, 1000"
  cidade: "São Paulo"
  uf: "SP"
  cep: "01000-000"
usuario:
  # já é provisionado pelo context_manager via valida<N>@valida.com sequencial
  email: "{{EMAIL_PRINCIPAL}}"
  senha: "{{SENHA_PRINCIPAL}}"
```

**Regra de placeholders:** ver seção 5 deste documento. **Qualquer campo que vire UNIQUE no banco da aplicação ou que possa colidir entre execuções DEVE virar placeholder.** Campos não-únicos (endereço, cidade, UF) podem ser literais.

### 2.2. Casos de Teste YAML — `testes/casos_de_teste/UC-FNN_visual_<variacao>.yaml`

Contém os **asserts** (DOM e Rede) por passo. Um arquivo por variação (FP, FA-01, FE-01, etc.).

```yaml
uc_id: UC-FNN
variacao: fp
trilha: visual
passos:
  - id: passo_00_login
    asserts_dom:
      - selector: 'h1:has-text("Você não tem empresas vinculadas")'
    asserts_rede:
      - url_contem: /api/auth/login
        metodo: POST
        status: 200
  - id: passo_01_criar_empresa
    asserts_dom:
      - selector: 'h1:has-text("Empresas")'
```

### 2.3. Tutorial em Markdown — `testes/tutoriais_visual/UC-FNN_<variacao>.md`

Contém os **passos visíveis ao tester** + **ações Playwright**. Estrutura:

````markdown
# Tutorial UC-FNN — <Nome do UC> (variação <variacao>)

## Passo 00 — Login

O browser vai logar com `{{usuario.email}}`. Como o super não tem vínculos...

**Observe criticamente:**
- Tela X aparece após login
- Botões Y e Z visíveis

```yaml
acao:
  sequencia:
    - tipo: navigate
      url: "/"
      timeout: 15000
    - tipo: fill
      seletor: 'input[type="email"]'
      valor_from_contexto: usuario.email
    - tipo: fill
      seletor: 'input[type="password"]'
      valor_from_contexto: usuario.senha
    - tipo: click
      seletor: 'button[type="submit"]'
    - tipo: wait_for
      seletor: 'h1:has-text("Você não tem empresas vinculadas")'
      timeout: 15000
```

## Passo 01 — Clicar "Criar Nova Empresa"
... (próximo passo) ...
````

**Convenções obrigatórias do MD:**

- 1 `## Passo NN — <título>` por passo
- `**Observe criticamente:**` seguido de bullet list = `pontos_observacao` (vão para `pontos_observacao` JSON)
- 1 bloco `\`\`\`yaml ... \`\`\`` por passo com a chave `acao:` na raiz contendo `sequencia` (lista de ações Playwright)
- IDs de passo: `passo_NN_<descritor_em_snake_case>` (NN com 2 dígitos, começa em 00)

---

## 3. Tabelas de destino no banco

### 3.1. Tabela `datasets`

```sql
CREATE TABLE datasets (
  id VARCHAR(36) NOT NULL,
  caso_de_uso_id VARCHAR(36) NOT NULL,
  trilha ENUM('visual','e2e','humana') NOT NULL DEFAULT 'visual',
  dados_json JSON NOT NULL,
  criado_em DATETIME NOT NULL,
  atualizado_em DATETIME NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_dataset_uc_trilha (caso_de_uso_id, trilha),
  CONSTRAINT fk_dataset_uc FOREIGN KEY (caso_de_uso_id) REFERENCES casos_de_uso(id) ON DELETE CASCADE
);
```

**Regra:** 1 linha por (UC, trilha). Se UC tiver 3 trilhas (visual, e2e, humana), tem 3 linhas. **Sprint 1 V1 → só visual.**

### 3.2. Tabela `passos_tutorial`

```sql
CREATE TABLE passos_tutorial (
  id VARCHAR(36) NOT NULL,
  caso_de_teste_id VARCHAR(36) NOT NULL,
  ordem INT NOT NULL,
  passo_id VARCHAR(120) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descricao_painel TEXT,
  pontos_observacao JSON,
  acoes_json JSON NOT NULL,
  asserts_json JSON,
  PRIMARY KEY (id),
  UNIQUE KEY uq_passo_ct_ordem (caso_de_teste_id, ordem),
  CONSTRAINT fk_passo_tutorial_ct FOREIGN KEY (caso_de_teste_id) REFERENCES casos_de_teste(id) ON DELETE CASCADE
);
```

**Regra:** N linhas por CT (1 por passo). UC com FP + 3 FAs + 2 FEs vira 6 CTs distintos, cada um com seus N passos.

---

## 4. Estrutura JSON dos campos

### 4.1. `dados_json` (tabela `datasets`)

Mapa hierárquico livre. Convenção: agrupar por entidade lógica.

```json
{
  "empresa": {
    "cnpj": "{{CNPJ_UNICO}}",
    "razao_social": "DEMO {{SUFIXO_CICLO}} Ltda",
    "...": "..."
  },
  "usuario": {
    "email": "{{EMAIL_PRINCIPAL}}",
    "senha": "{{SENHA_PRINCIPAL}}"
  },
  "edital": {
    "numero": "0001/2026"
  }
}
```

Acessado nas ações via `valor_from_dataset: empresa.cnpj` (notação dot-path).

### 4.2. `acoes_json` (tabela `passos_tutorial`)

**Lista** (não dict) de ações Playwright. Uma ação por elemento.

```json
[
  {"tipo": "navigate", "url": "/", "timeout": 15000},
  {"tipo": "wait_for", "seletor": "input[type=\"email\"]"},
  {"tipo": "fill", "seletor": "input[type=\"email\"]", "valor_from_contexto": "usuario.email", "timeout": 5000},
  {"tipo": "click", "seletor": "button[type=\"submit\"]", "timeout": 5000}
]
```

**Tipos de ação suportados pelo `_executar_acao` do `executor.py`:**

| Tipo | Campos obrigatórios | Campos opcionais |
|---|---|---|
| `navigate` | `url` | `timeout` |
| `wait_for` | `seletor` ou `alternativa` | `timeout` (default 10000) |
| `fill` | `seletor`, (`valor_literal` OU `valor_from_dataset` OU `valor_from_contexto`) | `timeout`, `alternativa` |
| `click` | `seletor` | `timeout`, `alternativa` |
| `select_option` | `seletor`, `valor_literal` ou `valor_from_dataset` | `timeout` |
| `screenshot` | (nenhum) | `destino` |
| `assert_visible` | `seletor` | `timeout` |
| `wait` | `valor_literal` (ms) | — |

**Resolução de valores em runtime:**

- `valor_literal: "abc"` → usa `"abc"` literalmente
- `valor_from_dataset: empresa.cnpj` → busca em `dados_json` do dataset
- `valor_from_contexto: usuario.email` → busca em `contexto.yaml` do ciclo

**Estrutura aninhada (`sequencia`):**

```json
[{"tipo": "", "sequencia": [{"tipo": "click", ...}, {"tipo": "fill", ...}]}]
```

Tipo vazio com `sequencia` = "container" que executa filhos em ordem. Útil para grupos lógicos.

### 4.3. `asserts_json` (tabela `passos_tutorial`)

Lista de asserts validados após executar `acoes_json` do passo. Pode ser `NULL` se passo não tem assert.

```json
[
  {"tipo": "dom", "selector": "h1:has-text(\"Empresas\")"},
  {"tipo": "dom", "selector": "button:has-text(\"Novo\")", "count": 1},
  {"tipo": "rede", "url_contem": "/api/crud/empresas", "metodo": "POST", "status": 201}
]
```

**Tipos de assert:**

| Tipo | Campos | Verifica |
|---|---|---|
| `dom` | `selector` | Elemento existe no DOM |
| `dom` | `selector`, `count` | Número exato de elementos |
| `dom` | `selector`, `texto_contem` | Texto contém substring |
| `rede` | `url_contem`, `metodo`, `status` | Request HTTP foi feita com status esperado |

### 4.4. `pontos_observacao` (tabela `passos_tutorial`)

Lista de strings que viram bullet points no painel do tester.

```json
[
  "Tela 'Você não tem empresas vinculadas' aparece após login",
  "3 botões visíveis: 'Criar Nova Empresa' (azul), 'Vincular Empresa' (roxo), 'Entrar' (verde)",
  "Botão 'Sair' disponível no rodapé"
]
```

### 4.5. `descricao_painel` (tabela `passos_tutorial`)

**Texto markdown completo** que aparece no painel `:9876` antes do tester aprovar. Contém o `## Passo NN — <título>` + parágrafo descritivo + bullet `**Observe criticamente:**`. É o markdown bruto extraído do `.md` do tutorial.

```text
## Passo 00 — Login

O browser vai logar com `{{usuario.email}}`. Como o super...

**Observe criticamente:**
- Tela X aparece...
- Botões Y e Z...
```

---

## 5. Placeholders — regra de ouro para evitar colisão

**Por que existem:** o app `editais` tem campos UNIQUE (CNPJ, email, IE, etc.). Se 2 testes seguidos tentam criar a mesma empresa "DEMO 002 / 56.700.252/4415-59", o segundo dá erro.

**Como funciona:**

1. No dataset YAML/banco, valores de campos únicos ficam como `{{PLACEHOLDER}}`
2. Antes de executar o tutorial, o `executor_sprint1.py` chama `_resolver_placeholders(dados_json, ciclo_id, ctx)` que substitui pelos valores reais provisionados pelo `context_manager`
3. Cada teste tem `ciclo_id` único (ex: `teste-aa7e09bc`) → cada teste usa CNPJ/email/IE diferentes

### 5.1. Placeholders padrão (já provisionados pelo `context_manager`)

| Placeholder | Origem | Exemplo |
|---|---|---|
| `{{CICLO}}` | `ciclo_id` literal | `teste-aa7e09bc` |
| `{{SUFIXO_CICLO}}` | últimos 8 chars do ciclo | `aa7e09bc` |
| `{{CNPJ_UNICO}}` | `cnpj_generator.gerar_cnpj_unico()` (RF-válido + check no banco) | `47.832.451/0001-92` |
| `{{EMAIL_PRINCIPAL}}` | `valida<N>@valida.com` sequencial via `user_allocator` | `valida4@valida.com` |
| `{{SENHA_PRINCIPAL}}` | senha do user alocado | `123456` (default em dev) |

### 5.2. Placeholders gerados deterministicamente do ciclo

Para campos UNIQUE que não têm gerador próprio, derivar do hash do `ciclo_id`:

| Placeholder | Como gerar (pseudocódigo) | Exemplo |
|---|---|---|
| `{{IE_UNICA}}` | `f"{int(hash(ciclo_id)) % 1_000_000_000:09d}.{...}"` (formato IE) | `123.456.789.012` |
| `{{IM_UNICA}}` | `f"{int(hash(ciclo_id)) % 9999999:07d}-{dv}"` | `1234567-8` |
| `{{TELEFONE_UNICO}}` | `f"(11) 4{int(hash) % 999:03d}-{int(hash) % 9999:04d}"` | `(11) 4521-3478` |
| `{{NOME_PESSOA}}` | índice em lista fixa de nomes baseado no hash | `Ana Silva` |

**Regra:** placeholders devem ser **determinísticos** dado o `ciclo_id` (rodar 2x o mesmo teste produz mesmos valores). Isso permite retomada e replay.

### 5.3. Onde os placeholders ficam definidos

Implementação central em `testes/framework_visual/dados/placeholders.py` (a criar). Função:

```python
def construir_mapa_placeholders(ciclo_id: str, ctx: dict) -> dict[str, str]:
    """Retorna {placeholder_name: valor} pronto para substituir em strings do dataset."""
    sufixo = ciclo_id.split("-")[-1][:8]
    trilha = ctx.get("trilha_principal", "visual")
    trilha_data = ctx["trilhas"][trilha]
    return {
        "CICLO": ciclo_id,
        "SUFIXO_CICLO": sufixo,
        "CNPJ_UNICO": trilha_data["empresa"]["cnpj_pretendido"],
        "EMAIL_PRINCIPAL": trilha_data["usuario"]["email"],
        "SENHA_PRINCIPAL": trilha_data["usuario"]["senha"],
        "IE_UNICA": _gerar_ie_deterministica(ciclo_id),
        "IM_UNICA": _gerar_im_deterministica(ciclo_id),
        "TELEFONE_UNICO": _gerar_telefone_deterministico(ciclo_id),
    }


def resolver_placeholders(obj, mapa: dict[str, str]):
    """Substitui {{X}} recursivamente em strings dentro de dict/list/str."""
    if isinstance(obj, str):
        for k, v in mapa.items():
            obj = obj.replace(f"{{{{{k}}}}}", str(v))
        return obj
    if isinstance(obj, dict):
        return {k: resolver_placeholders(v, mapa) for k, v in obj.items()}
    if isinstance(obj, list):
        return [resolver_placeholders(x, mapa) for x in obj]
    return obj
```

### 5.4. Quando NÃO usar placeholder

- Campos puramente visuais (placeholder de input, label, título): pode ser literal
- Campos não-UNIQUE no banco da aplicação: pode ser literal (mas use placeholder se quiser distinguir testes em logs)
- Valores fixos esperados pela aplicação (ex: regime tributário "simples"): literal

### 5.5. Auditoria automática de placeholders

O agente `validation-dataset-auditor` deve, ao revisar um dataset novo:

1. Listar todos os campos em `dados_json`
2. Cruzar com lista de UNIQUE keys do schema do banco `editais`
3. Reprovar se algum campo UNIQUE estiver hardcoded (não-placeholder)
4. Aprovar só se todo campo unique-no-banco virou `{{PLACEHOLDER}}`

---

## 6. Script de cadastro — referência canônica

O **script `testes/framework_visual/seed/importar_tutorial_uc_f01.py`** é a referência viva. Para cadastrar um UC novo, **copiar este script e adaptar 3 pontos**:

1. Trocar `"UC-F01"` pelo `uc_id` do novo UC
2. Trocar `"CT-F01-FP"` pelo `ct_id` da variação a cadastrar
3. Trocar paths dos 3 inputs (dataset/CT/tutorial)

Para um UC novo com FP + 2 FAs + 1 FE = 4 variações, executar 4 vezes (1 por CT).

### 6.1. Algoritmo do script (resumo)

```
1. Conecta no banco testesvalidacoes
2. Busca UC pelo uc_id          → casos_de_uso.id
3. Busca CT pelo ct_id          → casos_de_teste.id
4. Carrega YAML do dataset       → remove keys de meta (uc_id, trilha, ciclo_id_default)
5. UPSERT na tabela datasets     → 1 linha (UC, trilha) com dados_json
6. Carrega tutorial via parser   → testes/framework_visual/parser.carregar_tutorial(uc, variacao, ciclo)
7. Carrega CT YAML para asserts  → mapa {passo_id: [asserts_dom + asserts_rede]}
8. DELETE passos_tutorial WHERE caso_de_teste_id = ct.id   (idempotência)
9. Para cada passo do tutorial:
   - Converte objeto Acao → dict serializável
   - Achata se ação raiz tem só "sequencia"
   - INSERT em passos_tutorial com (ordem, passo_id, titulo, descricao_painel,
                                    pontos_observacao, acoes_json, asserts_json)
10. COMMIT
11. Verifica COUNT(*) = N esperado
```

### 6.2. Idempotência

O script é seguro de rodar várias vezes:
- Dataset: UPDATE se existe, INSERT se não
- Passos: DELETE all + INSERT all (não há histórico de versão de passos)

Ao mudar o tutorial em disco, basta re-rodar o script para atualizar o banco.

---

## 7. Fluxo completo passo-a-passo

Para cadastrar um UC novo:

### Etapa 1 — Validação prévia
- [ ] UC documentado em `testes/casos_de_uso/UC-FNN.md`
- [ ] UC implementado e testado manualmente no app
- [ ] CTs especificados em `docs/CASOS DE TESTE PARA VALIDACAO SPRINT<X>.md`

### Etapa 2 — Geração dos 3 inputs em disco
- [ ] `testes/datasets/UC-FNN_visual.yaml` — dataset com placeholders
- [ ] `testes/casos_de_teste/UC-FNN_visual_<var>.yaml` — asserts por passo (1 por variação)
- [ ] `testes/tutoriais_visual/UC-FNN_<var>.md` — passos + ações Playwright (1 por variação)

### Etapa 3 — Auditoria adversarial
- [ ] `validation-dataset-auditor` aprova dataset (todo campo UNIQUE virou placeholder)
- [ ] `validation-test-case-generator` aprova asserts (cobre FP/FAs/FEs declarados no UC)
- [ ] `validation-tutorial-writer` aprova MD (passos navegáveis, observações claras)

### Etapa 4 — Cadastro no banco
- [ ] Garantir que UC e CTs existem em `casos_de_uso` + `casos_de_teste`
- [ ] Copiar `importar_tutorial_uc_f01.py` → `importar_tutorial_uc_fNN.py`
- [ ] Adaptar 3 pontos (uc_id, ct_id, paths)
- [ ] `python3 testes/framework_visual/seed/importar_tutorial_uc_fNN.py`
- [ ] Verificar:
  - `SELECT COUNT(*) FROM datasets WHERE caso_de_uso_id = '...'` → 1
  - `SELECT COUNT(*) FROM passos_tutorial WHERE caso_de_teste_id = '...'` → N (mesmo número do MD)

### Etapa 5 — Smoke test
- [ ] Subir backend `:5060` + frontend `:5181`
- [ ] Login no app web (`pasteur@valida.com`)
- [ ] Criar teste novo selecionando o UC novo
- [ ] Iniciar → Chromium headed deve abrir + painel `:9876` deve mostrar `Passo 00`
- [ ] Acompanhar até o fim, aprovando passos manualmente
- [ ] Verificar no banco:
  - `SELECT COUNT(*) FROM passos_execucao WHERE execucao_id = '...'` → N (todos os passos persistidos)
  - `SELECT estado FROM testes WHERE id = '...'` → `concluido`
- [ ] Re-executar o teste 2x — confirmar que **não há colisão** (CNPJ/email diferentes)

### Etapa 6 — Documentação
- [ ] Adicionar entrada em `docs/REGISTRO_UCS_CADASTRADOS.md` com (uc_id, n_cts, n_passos_total, data, autor)
- [ ] Marcar UC como "✅ Banco" no checklist da sprint

---

## 8. Como o `executor_sprint1.py` consome o banco em runtime

Para o app gerador futuro entender o ciclo completo:

```
1. Tester clica "Iniciar" no React (:5181)
2. Frontend chama POST /api/testes/<id>/iniciar no Flask (:5060)
3. Backend faz subprocess.Popen("python3 executor_sprint1.py --teste_id <UUID>")
4. Executor:
   a. Carrega Teste do banco (inclui ciclo_id)
   b. Carrega contexto.yaml do ciclo (provisionado pelo context_manager)
   c. Carrega ExecucaoCasoDeTeste pendentes do teste
   d. Para cada execução:
      - Carrega CT, UC
      - Carrega Dataset (UC, trilha=visual) → dados_json
      - **Resolve placeholders** em dados_json usando ciclo + ctx
      - Carrega PassoTutorial em ordem
      - Para cada passo:
        - INSERT em passos_execucao (estado pendente)
        - Screenshot ANTES → grava .png + UPDATE path no banco
        - Para cada ação em acoes_json:
          - Resolve valor_from_dataset (lê dados_json já com placeholders resolvidos)
          - Resolve valor_from_contexto (lê contexto.yaml do ciclo)
          - Executa via Playwright (_executar_acao)
        - Screenshot DEPOIS → UPDATE path
        - Para cada assert em asserts_json:
          - Valida DOM ou Rede (_validar_dom)
        - UPDATE passos_execucao com veredito_automatico + detalhes_validacao_json
        - Aguarda PO clicar aprovar/reprovar no painel :9876
        - INSERT observacoes se houver comentários
        - UPDATE concluido_em
      - UPDATE execucoes_caso_de_teste com vereditos consolidados
   e. UPDATE testes.estado = 'concluido'
   f. Cleanup (atexit + signal handler) limpa pid_executor=NULL
```

**Pontos críticos para o app gerador entender:**

- O dataset é **lido uma vez por execução** e tem placeholders resolvidos no início — não a cada passo
- As ações em `acoes_json` referenciam o dataset via `valor_from_dataset` (string do tipo `empresa.cnpj`) — o executor faz lookup no dict resolvido
- O ciclo (e portanto os valores únicos) é **fixo durante a execução do teste inteiro** — todos os CTs do mesmo teste reusam mesmos CNPJ/email
- Screenshots ficam em disco (`testes/relatorios/visual/<UC>/<timestamp>/`) e o banco só guarda o path

---

## 9. Especificação para o app gerador com LLM

Caso seja construído um app que use LLM para gerar tutoriais e cadastrar UCs automaticamente, o LLM deve produzir:

### 9.1. Outputs esperados do LLM

**Input:** caso de uso em markdown + screenshots de referência + schema do app (rotas, seletores)

**Output:** os 3 arquivos da seção 2 (`.yaml` dataset, `.yaml` casos de teste, `.md` tutorial), em formato exato.

### 9.2. Validações que o app deve fazer no output do LLM

1. **Sintaxe YAML/MD válida** — parse falha = pedir LLM regenerar
2. **Todos os campos UNIQUE no schema da aplicação viraram placeholder** — auditor adversarial
3. **Cada `## Passo NN` no MD tem bloco `\`\`\`yaml` correspondente** — parser do framework_visual
4. **Cada passo no MD tem entrada no .yaml de casos de teste** — pareamento por `passo_id`
5. **Tipos de ação em `acoes_json` ∈ {navigate, wait_for, fill, click, select_option, screenshot, assert_visible, wait}** — lista fechada
6. **Seletores referem elementos reais** — opcional: rodar smoke do tutorial no app antes de cadastrar

### 9.3. Loop de geração

```
1. LLM lê UC.md + schema + screenshots
2. LLM gera 3 arquivos
3. App valida (passos 1-6 acima)
4. Se inválido: feedback estruturado pro LLM + regenerar
5. Se válido: rodar importar_tutorial_uc_fNN.py adaptado → banco
6. Smoke test automatizado:
   - Cria teste com o UC novo
   - Inicia execução
   - Coleta resultado (passos aprovados / reprovados / inconclusivos)
7. Se smoke falhou: classificar causa raiz (defeito no app vs defeito no tutorial gerado)
   - Se defeito no tutorial: feedback pro LLM + regenerar
   - Se defeito no app: levantar issue para humano
8. Se smoke passou: marcar UC como "automatizado e cadastrado"
```

### 9.4. Prompt template para o LLM gerador

```
Você está cadastrando o {UC_ID} no banco de validação visual.

CONTEXTO:
- Caso de uso: {UC_MD_CONTEUDO}
- App em: http://localhost:5180 (porta agenteditais)
- Banco da aplicação: editais (campos UNIQUE relevantes: empresas.cnpj, users.email, ...)
- Documento normativo: docs/CRITERIOS PARA GERAR CTS A PARTIR DE UCS PELA IEEE829.md

PRODUZA 3 arquivos:

1. dataset YAML (testes/datasets/{UC_ID}_visual.yaml):
   - Estrutura: ver docs/PROCESSO_CADASTRO_UC_NO_BANCO.md seção 2.1
   - REGRA OBRIGATÓRIA: todo campo que vire UNIQUE no banco da aplicação DEVE ser placeholder
   - Placeholders disponíveis: {{CNPJ_UNICO}}, {{EMAIL_PRINCIPAL}}, {{SENHA_PRINCIPAL}}, {{IE_UNICA}}, {{IM_UNICA}}, {{TELEFONE_UNICO}}, {{CICLO}}, {{SUFIXO_CICLO}}

2. casos de teste YAML (testes/casos_de_teste/{UC_ID}_visual_<variacao>.yaml):
   - 1 arquivo por variação (FP, cada FA, cada FE)
   - asserts_dom + asserts_rede por passo

3. tutorial MD (testes/tutoriais_visual/{UC_ID}_<variacao>.md):
   - 1 arquivo por variação
   - 1 ## Passo NN — <título> por passo
   - Bloco ```yaml com chave acao: contendo sequencia: [...] de ações Playwright
   - **Observe criticamente:** com bullet list de pontos de observação

VALIDAÇÕES QUE EU FAREI NO SEU OUTPUT:
- Sintaxe YAML/MD parseável
- Auditor adversarial em campos UNIQUE
- Pareamento passo MD ↔ passo YAML
- Tipos de ação ∈ lista fechada
- Smoke test automatizado

Se algo for ambíguo no UC, pergunte ANTES de gerar.
```

---

## 10. Exemplo concreto — UC-F01 (já cadastrado)

Para conferir o resultado do processo aplicado:

```sql
-- 1 dataset
SELECT id, trilha, JSON_KEYS(dados_json)
FROM datasets d
JOIN casos_de_uso uc ON uc.id = d.caso_de_uso_id
WHERE uc.uc_id = 'UC-F01';
-- Esperado: 1 linha (trilha=visual)

-- N passos do CT FP
SELECT pt.ordem, pt.passo_id, pt.titulo,
       JSON_LENGTH(pt.acoes_json) qtd_acoes,
       JSON_LENGTH(pt.asserts_json) qtd_asserts
FROM passos_tutorial pt
JOIN casos_de_teste ct ON ct.id = pt.caso_de_teste_id
WHERE ct.ct_id = 'CT-F01-FP'
ORDER BY pt.ordem;
-- Esperado: 10 linhas (passo_00 .. passo_09)
```

**Status atual (28/04/2026):**
- ✅ UC-F01 / CT-F01-FP: 10 passos cadastrados, dataset visual cadastrado
- ⚠️ **Hardcoded** (em vez de placeholders) — vai ser migrado na próxima iteração
- ⏳ UC-F02..F17: pendentes

---

## 11. Próximas iterações

| Item | Quando |
|---|---|
| **Migrar UC-F01 dataset** para placeholders (substituir CNPJ `56.700.252/4415-59` por `{{CNPJ_UNICO}}` etc.) | imediato |
| **Implementar `placeholders.py`** com mapa + função resolver_placeholders | imediato |
| **Hookar `_resolver_placeholders` no `executor_sprint1.py`** após `dataset.dados_json` ser carregado | imediato |
| **Cadastrar UC-F02..F17** seguindo este processo | sequencial nas próximas sessões |
| **Implementar app gerador com LLM** | V2/V3 |
| **Estender para trilha e2e e humana** | depois que visual estiver estável |

---

## 12. Glossário

- **UC** — caso de uso (UC-F01..UC-F17 na Sprint 1)
- **CT** — caso de teste (1 UC pode ter N CTs: FP, FA-NN, FE-NN)
- **FP / FA / FE** — Fluxo Principal / Fluxo Alternativo / Fluxo de Exceção (IEEE 829)
- **Trilha** — visual (com tester olhando + painel), e2e (headless CI), humana (validador externo)
- **Ciclo** — execução isolada com dados próprios (CNPJ + emails únicos), identificado por `ciclo_id`
- **Dataset** — dict com dados de teste do UC (1 por UC + trilha)
- **Tutorial** — sequência de passos navegáveis pelo Playwright (1 por CT)
- **Placeholder** — `{{X}}` substituído em runtime por valor único do ciclo
- **Painel `:9876`** — Flask efêmero que sobe junto com o executor pra tester aprovar passos
- **Trilha visual** — única em V1; tester acompanha browser headed + aprova/reprova passo a passo

---

**Fim do documento.** Versão viva — atualizar ao mudar processo de cadastro ou adicionar tipos de ação/assert.
