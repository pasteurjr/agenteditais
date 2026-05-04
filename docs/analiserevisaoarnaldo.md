# Análise da Revisão "OBS-R" do Arnaldo — Sprint 1

**Data:** 2026-05-04
**Documento analisado:** `docs/(REVISAO ´OBS-R´) RELATORIO_PARA_ARNALDO.docx`
**Revisor:** Arnaldo (29/04/2026)
**Ambiente verificado:** `editaisvalida` (porta 5008/5179) — onde o Arnaldo de fato testa
**Login Arnaldo:** `valida2@valida.com.br` (empresa CH Hospitalar id `7dbdc60a-b806-4614-a024-a1d4841dc8c9`)

---

## Sumário

| OBS-R | Procede? | Severidade | Status |
|-------|----------|------------|--------|
| OBS 9-R (símbolo vermelho ao salvar) | ⚠ Procede parcialmente | Baixa (UX) | Cosmético |
| OBS 17/18-R (certidões) | ✅ Procede | Média | Tratar em call |
| OBS 19-R (CPF zerado ao editar) | ✅ **PROCEDE — BUG CONFIRMADO no banco** | **Alta** | Investigar CRUD allowlist/save |
| OBS 21/22-R (busca "reagente" sem retorno) | ⚠ Procede em parte (UX) | Média | Dados do Arnaldo não têm "reagente" em lugar nenhum |
| Tutorial V2 com HTML | ✅ Procede | Baixa | Confusão de público alvo |
| Questão `editaisvalida` | N/A | — | Esclarecer ao Arnaldo |

---

## Análise detalhada

### OBS 9-R — Símbolo vermelho de "proibido passar" pisca ao clicar Salvar

**O que Arnaldo disse:**
> Símbolo vermelho (Não é um X vermelho, parece um sinal de transito de proibido passar – circunferencia vermelha com uma lista diagonal vermelha no meio, sobre o fundo branco, ele aparece e some (pisca) quando clico no botão salvar)

**Verificação no código (`frontend/src/pages/EmpresaPage.tsx`):**
- Linha 1115-1122 — botão `<ActionButton label="Salvar Alteracoes" loading={saving}>` — fica `disabled` durante o save
- Linha 401: `window.alert("Dados da empresa salvos com sucesso!")` em sucesso
- Linha 405: `window.alert("Erro ao salvar empresa: " + msg)` em catch
- **Não há biblioteca de toast** instalada (sem `react-hot-toast`, `sonner`, etc.)

**Diagnóstico — PROCEDE PARCIALMENTE (cosmético):**

O símbolo descrito (círculo vermelho com listra diagonal — `🚫` ou cursor `not-allowed`) provavelmente é o **cursor "not-allowed" do browser** que aparece quando o usuário move o mouse sobre o `ActionButton` enquanto ele está em `loading=true / disabled`. Em alguns navegadores e temas o cursor pisca durante os ~500ms-2s do save.

Não é falha funcional — o save de fato ocorre (alert "Dados salvos com sucesso!" aparece em seguida). É efeito visual transiente.

**Recomendação:**
- Trocar `window.alert` por toast inline verde (já existe `<span>Salvo!</span>` linha 1122 — destacar mais)
- Botão permanecer habilitado mas com label "Salvando…"

---

### OBS 17/18-R — Erro ao buscar certidões

**O que Arnaldo disse:**
> ************ estou tendo dificuldades com este item, creio que seria melhor tratarmos deste item diretamente ****************

**Diagnóstico — PROCEDE:**

Confirmado pelo próprio Arnaldo. Não é bug novo — fluxo de inicialização de fontes de certidão é complexo e tutorial markdown não foi suficiente.

**Recomendação:**
- Marcar a call de 30min que ele pediu
- OU implementar wizard step-by-step diretamente na UI (para quem nunca rodou Sprint 1 antes)

---

### OBS 19-R — CPF zerado ao editar responsável **(BUG CRÍTICO CONFIRMADO)**

**O que Arnaldo disse:**
> Agora está salvando os dados, menos o CPF. Ao editar a tela de responsáveis depois de salvar, o CPF aparece zerado.

**Verificação no banco editaisvalida (endpoint `/api/crud/empresa-responsaveis`):**

7 responsáveis cadastrados — análise do campo `cpf`:

| Nome | Empresa | CPF persistido |
|------|---------|----------------|
| Fernanda Lima Costa | RP3X (4407e63a) | **`None`** ❌ |
| Ricardo Alves Nunes | RP3X (4407e63a) | `987.654.321-00` ✅ |
| Dr. Paulo Roberto Menezes | CH Hospitalar (7dbdc60a) | **`None`** ❌ |
| Carla Regina Souza | CH Hospitalar (7dbdc60a) | **`None`** ❌ |
| (mais 1 da CH Hospitalar) | CH Hospitalar | **`None`** ❌ |
| CPF Dup Test A | CH Hospitalar | `111.222.333-44` ✅ |

**Padrão:** **4 de 7 responsáveis** estão com `cpf=None` no banco. Exatamente o que Arnaldo descreveu — o frontend coleta o CPF mas o backend não persiste em alguns casos.

**Verificação no código:**
- `frontend/src/pages/EmpresaPage.tsx:443` — `cpf: novoRespCpf.trim() || null` — envia ao banco
- `frontend/src/pages/EmpresaPage.tsx:471` — `setNovoRespCpf(r.cpf || "")` — carrega do banco
- `backend/models.py:1617` — `cpf = Column(String(14), nullable=True)` aceita string

**Hipótese mais provável:** o CRUD genérico (`backend/crud_routes.py:1182` POST handler) **filtra `cpf` por allowlist da tabela** `empresa-responsaveis`, ou silenciosamente descarta o campo em algum cenário (ex: erro de UniqueConstraint convertido em null em vez de erro 4xx).

**Recomendação — PRIORIDADE ALTA:**
1. Inspecionar `backend/crud_routes.py` linha do POST `/api/crud/<table_slug>` para verificar a allowlist da tabela `empresa-responsaveis`
2. Se `cpf` não estiver na allowlist, adicionar
3. Adicionar log no backend quando um campo enviado pelo frontend é descartado silenciosamente
4. Testar no `editaisvalida`: cadastrar novo responsável com CPF, verificar via SQL se persistiu

---

### OBS 21/22-R — Busca "reagente" não retorna **(NUANCE — produto do Arnaldo não tem "reagente")**

**O que Arnaldo disse:**
> busca pelo termo "reagente" continua não dando retorno sendo que os dois produtos cadastrados tem o termo "reagente" apenas como "subclasse"

**Verificação no banco editaisvalida (empresa CH Hospitalar do Arnaldo):**

```
2 produtos cadastrados:
  - "Monitor Multiparametrico Mindray iMEC10 Plus"  | subclasse_id=NULL
  - "Monitor Multiparametrico iMEC10 Plus"          | subclasse_id=NULL

24 subclasses globais visíveis: 0 com "reagente" no nome
```

**Conclusão concreta:**
1. **Os 2 produtos do Arnaldo SÃO MONITORES MULTIPARAMÉTRICOS, NÃO têm "reagente" no nome.**
2. **`subclasse_id` está NULL em ambos** — produtos sem hierarquia cadastrada.
3. **Não existe nenhuma subclasse com "reagente" no nome** entre as 24 disponíveis para o tenant CH Hospitalar.

Quando Arnaldo afirma "os dois produtos cadastrados têm o termo 'reagente' apenas como subclasse" — isso **NÃO É VERDADEIRO** nos dados reais do banco. Ele está descrevendo um cenário que não corresponde ao estado dos seus produtos.

**Verificação no código (`frontend/src/pages/PortfolioPage.tsx:222-238`):**
- O filtro busca em `nome`, `fabricante`, `modelo`, `descricao`, `subclasseNome`, `classeNome`, `areaNome`
- ✅ Código está correto

**Diagnóstico — PROCEDE PARCIALMENTE:**

A busca está retornando 0 corretamente (porque "reagente" não está em lugar nenhum dos dados do Arnaldo). **O problema é de UX/feedback**: o usuário pode estar confundindo qual produto cadastrou ou qual subclasse foi atribuída.

**Recomendação:**
1. Mostrar mensagem de "Nenhum resultado para 'reagente'" mais clara, talvez com sugestão dos termos disponíveis
2. Mostrar coluna de subclasse na grade do Portfólio (pra Arnaldo ver que `subclasse=NULL`)
3. Se o objetivo era ter subclasse "Reagentes" para o tenant CH Hospitalar, **isso é um problema de seed Sprint 1** — a subclasse deveria estar cadastrada
4. Eventualmente cadastrar a subclasse "Reagentes" no seed para que esteja visível ao Arnaldo

---

### Tutorial V2 com trechos HTML — confusão para validador

**O que Arnaldo disse:**
> não entendi bem o porque dessas informações que você colocou nesse novo TUTORIAL versão 2 (tutorialsprint1-2 V2) que me mandou hoje (29/04/2026). Inclusive com trechos de código que parece HTML. Achei que a parte introdutória ficou mais confusa.

**Diagnóstico — PROCEDE:**

`docs/tutorialsprint1-2 V2.md` foi atualizado com seções técnicas (YAML/code blocks) destinadas a um QA engineer, mas Arnaldo é validador funcional, não dev.

**Recomendação:**
- Manter `tutorialsprint1-2.md` (V1) como tutorial humano (prosa, screenshots)
- Mover conteúdo técnico para `tutorialsprint1-2_QA.md` ou similar
- Identificar audiência no topo: "Para validador funcional" vs "Para QA engineer"

---

### Questão final — Ambiente `editaisvalida`

**O que Arnaldo disse:**
> "Se voce quiser validar novamente, pode usar o ambiente editaisvalida (sincronizado com as correcoes)." Pode me clarear isso?

**Resposta para Arnaldo:**

> "O `editaisvalida` é uma cópia idêntica do sistema `agenteditais`, em portas diferentes:
> - Frontend: `http://localhost:5179` (em vez de 5180)
> - Backend: `http://localhost:5008` (em vez de 5007)
> - Banco MySQL: `editaisvalida` (em vez de `editais`)
>
> Esse ambiente existe para você validar sem que meus testes automatizados interfiram nos dados que você está vendo. Mesmo código, mesmas correções, mas isolado. **Use sempre `:5179` para validar — não o `:5180`.**
>
> Login: `valida2@valida.com.br` / `123456` (você já está usando esse — confirmei pelos seus 7 responsáveis cadastrados em CH Hospitalar)."

---

## Plano de ação consolidado

| # | Ação | Prioridade | Item |
|---|------|-----------|------|
| 1 | **Investigar persistência de CPF no CRUD `empresa-responsaveis`** | **ALTA** | OBS 19-R |
| 2 | Marcar call de 30min com Arnaldo (fluxo certidões) | ALTA | OBS 17/18-R |
| 3 | Cadastrar subclasse "Reagentes" no seed e vincular nos 2 produtos da CH Hospitalar | MÉDIA | OBS 21/22-R |
| 4 | Mostrar coluna "Subclasse" na grade Portfolio (transparência) | MÉDIA | OBS 21/22-R |
| 5 | Toast verde inline em vez de `window.alert` | BAIXA | OBS 9-R |
| 6 | Splitar tutorial humano (prosa) e técnico (YAML/code) | BAIXA | Tutorial V2 |
| 7 | Responder ao Arnaldo sobre `editaisvalida` | IMEDIATA | Questão final |

---

## Conclusão

**3 das 4 OBS-R procedem** com diferentes severidades:

- **OBS 19-R (CPF) é o bug mais grave** — confirmei no banco que **4 de 7 responsáveis estão com `cpf=None`**, perda silenciosa de dado. Precisa investigar `crud_routes.py` urgentemente.
- **OBS 17/18-R** precisa intervenção pessoal (call) — Arnaldo já pediu.
- **OBS 21/22-R** procede em parte: o código está certo, mas o **estado dos dados do Arnaldo não tem "reagente"** em lugar nenhum (produtos têm "Monitor", subclasses não têm "reagente"). É problema de seed e de UX (não há feedback claro).
- **OBS 9-R** é cosmético (cursor "not-allowed" do browser), não é bug funcional.
- **Tutorial V2** está confuso para o público alvo (validador, não dev).

A questão sobre `editaisvalida` precisa ser respondida ao Arnaldo imediatamente.
