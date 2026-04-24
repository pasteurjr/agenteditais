# ANALISE DA REVISAO DO VALIDADOR ARNALDO — Sprint 01 (pos-correcoes)

**Data:** 2026-04-24
**Documento analisado:** `docs/REVISAO resposta_arnaldo_sprint1.docx`
**Contexto:** Apos entregarmos as correcoes documentadas em `resposta_arnaldo_sprint1.txt`, o validador Arnaldo refez os testes e reportou 5 problemas remanescentes. Este documento analisa cada um com verificacao direta no codigo-fonte e propoe acoes.

**Legenda:**
- **PROCEDE** — observacao correta, requer correcao
- **PROCEDE PARCIAL** — observacao tem fundamento, mas com ressalvas/causa distinta
- **NAO PROCEDE** — observacao incorreta ou por erro de operacao do validador
- **MELHORIA** — sugestao valida mas nao e bug

---

## [OBS-09-R] Simbolo vermelho aparece ao clicar em qualquer botao "Salvar"

> *"agora esta salvando mas aparece um simbolo vermelho ao clicar no botao salvar. O detalhe e que esse simbolo aparece sempre que se clica em um botao salvar em qualquer dos itens pelos quais ja passei no sistema."*

**Veredicto: PROCEDE PARCIAL — nao e erro no save, e o botao "Excluir" vermelho adjacente**

### Analise

O `handleSave` em `frontend/src/components/CrudPage.tsx` (linhas 395-416) so seta `error` no bloco `catch`. Em caso de sucesso, apenas `successMsg` e definido. Portanto, nao ha "simbolo vermelho de erro" sendo renderizado ao salvar com sucesso.

**O que o validador provavelmente esta vendo:** o botao **Excluir** (`action-button-danger`, vermelho, icone de lixeira) aparece AO LADO do botao Salvar no cabecalho do formulario de edicao, sempre que o registro ja existe no banco:

```tsx
// CrudPage.tsx:830-848
<div className="card-header-right">
  <button className="action-button action-button-primary" onClick={handleSave} disabled={saving}>
    {saving ? <span className="loading-spinner small" /> : <Save size={16} />}
    <span>Salvar</span>
  </button>
  {selectedId && !isNew && (
    <button className="action-button action-button-danger" onClick={handleDelete}>
      <Trash2 size={16} />
      <span>Excluir</span>
    </button>
  )}
  <button className="action-button action-button-secondary" onClick={handleCancel}>
    <X size={16} />
    <span>Cancelar</span>
  </button>
</div>
```

Esse padrao se repete em TODAS as telas CRUD do sistema (e por isso o validador ve o mesmo simbolo em qualquer lugar). Nao e um erro — e a UI de exclusao posicionada junto do Salvar.

### Acao

1. **Esclarecer ao validador:** o icone vermelho e o botao "Excluir", nao uma mensagem de erro. Ele sempre fica visivel ao lado do Salvar em modo edicao.
2. **Melhoria de UX (opcional):** Mover o botao Excluir para o rodape do formulario, separado do Salvar, para evitar confusao. Exige redesign.
3. **Verificar se nao ha, alem disso, algum erro RN sendo disparado silenciosamente.** O helper `_rn_warn_or_raise` (crud_routes.py:55) em modo nao-enforcing apenas loga warning no console do backend — nao chega ao frontend. Mas se `_ENFORCE_RN=True`, erros de validacao de CNPJ/CPF/email/UF **causam 400** e apareceriam como erro real no frontend. Pedir ao validador um screenshot do simbolo vermelho para confirmar.

---

## [OBS-11-R] Icone de lapis nao encontrado para edicao

> *"nao achei esse icone de lapis, mas consegui alterar simplesmente digitando em cima do que ja existia"*

**Veredicto: PROCEDE PARCIAL — icone existe mas e pequeno/pouco visivel**

### Analise

Os icones de edicao existem no codigo:

- `EmpresaPage.tsx:855` — `<Pencil size={15} />` em botao "Editar" de certidoes
- `EmpresaPage.tsx:898` — `<Pencil size={16} />` em botao "Editar" de responsaveis
- `PortfolioPage.tsx:755` — `<Edit2 size={16} />` em botao "Editar" de produtos

Problema: tamanhos 15-16 px em botoes sem background explicito, em linhas de tabela densas, podem passar despercebidos.

Alem disso, **muitas telas CRUD usam o padrao de clicar na linha da tabela** para abrir o formulario de edicao (CrudPage.tsx:784-787: `<tr className="clickable" onClick={handleSelectItem}>`). Nesse fluxo nao ha icone de lapis — a propria linha e o "botao editar". O validador pode estar olhando para uma tela CRUD generica onde esse padrao e usado, esperando encontrar um icone.

### Acao

1. **Aumentar tamanho dos icones** de `Pencil`/`Edit2` para `size={18}` e adicionar background leve (`#eff6ff` com hover `#dbeafe`).
2. **Adicionar tooltip ja existe** (`title="Editar"`) — verificar se esta funcionando.
3. **No CrudPage generico,** adicionar uma coluna de acoes com icone de lapis explicito, mesmo que a linha inteira seja clicavel — redundancia visual melhora descoberta.
4. **Atualizar tutorial** explicando os dois fluxos: "clique na linha OU no icone de lapis (quando disponivel) para editar".

---

## [OBS-17/18-R] Dificuldades com certidoes — tratar diretamente

> *"estou tendo dificuldades com este item, creio que seria melhor tratarmos deste item diretamente"*

**Veredicto: INFORMATIVO — infraestrutura existe, chamada direta recomendada**

### Status atual do sistema

**Modelo:** `FonteCertidao` (`backend/models.py:1642-1700`) — tabela `fontes_certidoes` com campos completos: `tipo_certidao`, `nome`, `url_portal`, `metodo_acesso`, `requer_autenticacao`, `permite_busca_automatica`, suporte a credenciais criptografadas.

**Endpoint CRUD:** registrado em `crud_routes.py:347-354`:
```python
"fontes-certidoes": {
    "model": FonteCertidao,
    "empresa_scoped": True,
    "search_fields": ["nome", "tipo_certidao", "orgao_emissor", ...],
    "label": "Fonte de Certidão",
    "required": ["tipo_certidao", "nome", "url_portal"],
    "encrypt_fields": ["senha_criptografada"],
},
```

**Interface:** acessivel via `Cadastros > Empresa > Fontes de Certidoes` (nome da rota no frontend).

### Acao

1. **Agendar chamada** com o Arnaldo para demonstrar o fluxo de inicializacao de fontes de certidoes ao vivo.
2. **Preparar dados de seed:** verificar se o ambiente de validacao tem as fontes principais ja cadastradas (Receita Federal, Receita Estadual, Prefeitura, FGTS, Justica do Trabalho) — se nao, criar seed.
3. **Revisar tutorial** para adicionar screenshots passo-a-passo do setup inicial de fontes, nao apenas a mencao textual.

---

## [OBS-19-R] Mascara de telefone errada + erro ao salvar Fernanda, impedindo cadastrar Dr. Ricardo

> *"A mascara do telefone esta errada. Depois que cadastrei a Fernanda, ao clicar em salvar retorna essa mensagem de erro e depois nao consegui cadastrar o Dr. Ricardo."*

**Veredicto: PROCEDE — existe unique constraint que bloqueia cadastro sem CPF**

### Analise

**Mascara frontend** (`EmpresaPage.tsx:89-95`):
```tsx
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 6) return `(${digits.slice(0,2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0,2)}) ${digits.slice(2,6)}-${digits.slice(6)}`;
  return `(${digits.slice(0,2)}) ${digits.slice(2,7)}-${digits.slice(7)}`;
}
```
Produz `(XX) XXXXX-XXXX` para 11 digitos (celular) ou `(XX) XXXX-XXXX` para 10 digitos (fixo). Formato correto.

**Campo no banco** (`models.py:1619`):
```python
telefone = Column(String(20), nullable=True)  # aceita ate 20 chars
```
Formato `(XX) XXXXX-XXXX` tem 15 chars — cabe.

**Validacao backend** (`crud_routes.py:76-82`):
```python
elif table_slug == "empresa-responsaveis":
    cpf = data.get("cpf")
    if cpf:
        _rn_warn_or_raise("RN-029", validar_cpf(cpf), f"CPF invalido: {cpf}")
    email = data.get("email")
    if email:
        _rn_warn_or_raise("RN-042", validar_email(email), f"Email invalido: {email}")
    # NAO HA validacao de telefone
```
Nenhuma regra de negocio rejeita telefone.

**Causa real do erro:** `models.py:1611`:
```python
__table_args__ = (UniqueConstraint('empresa_id', 'cpf', name='uq_empresa_responsavel_cpf'),)
```

A tabela tem **UNIQUE constraint em (empresa_id, cpf)**. Quando o CPF e NULL, MySQL/InnoDB em geral permite multiplos NULL na UNIQUE — mas se o validador cadastrou Fernanda SEM CPF, depois tentou Dr. Ricardo SEM CPF, dependendo do collation/engine isso pode dar conflito. Pior ainda: se a primeira insercao gravou `cpf = ''` (string vazia em vez de NULL), a segunda insercao com `cpf = ''` **VAI VIOLAR** a unicidade porque string vazia e considerada igual a string vazia.

**Confirmacao provavel:** o frontend passa `cpf: ""` (string vazia) em vez de `cpf: null` quando o campo fica em branco, gerando violacao de UNIQUE constraint no segundo cadastro.

**Sobre a "mascara errada":** O validador nao especificou qual e o formato "errado". Hipoteses:
- Pode estar vendo `(11) 9XXXX-XXXX` (11 digitos) quando esperava `(11) 99XXX-XXXX` — mas o formato atual `(XX) XXXXX-XXXX` esta correto para celulares brasileiros.
- Pode ter visto erro de digitacao num telefone com menos de 10 digitos, que fica com a mascara incompleta.
- **Precisa screenshot** para confirmar.

### Acao

1. **Confirmar a causa raiz do erro de save:** verificar logs do backend no momento do teste. Provavel erro: `Duplicate entry '<empresa_id>-' for key 'uq_empresa_responsavel_cpf'`.
2. **Correcao:** em `crud_routes.py` ou no payload do frontend, converter string vazia para `None` antes de enviar:
   ```python
   # em _normalize_payload ou equivalente
   if data.get("cpf") == "":
       data["cpf"] = None
   ```
3. **Alternativa mais robusta:** remover a UNIQUE constraint de CPF (permitir multiplos responsaveis sem CPF) ou tornar CPF obrigatorio no formulario.
4. **Mascara de telefone:** pedir screenshot ao Arnaldo do formato que ele considera errado. Se for duvida de celular vs fixo, adicionar legenda: "Celular: (11) 99999-9999 | Fixo: (11) 9999-9999".
5. **Mensagem de erro amigavel:** quando der violacao de UNIQUE, traduzir "Duplicate entry" para "Ja existe um responsavel com este CPF nesta empresa".

---

## [OBS-21/22-R] Busca por "reagente" (subclasse) continua nao funcionando

> *"busca pelo termo 'reagente' continua nao dando retorno sendo que os dois produtos cadastrados tem o termo reagente como subclasse. Mas a busca pelo termo 'hemograma' (que esta no nome do produto) deu certo."*

**Veredicto: PROCEDE — filtro nao busca no nome da subclasse**

### Analise

`frontend/src/pages/PortfolioPage.tsx:218-244`:
```tsx
const filteredProdutos = produtos.filter((p) => {
  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    const match = p.nome.toLowerCase().includes(term) ||
      (p.fabricante || "").toLowerCase().includes(term) ||
      (p.modelo || "").toLowerCase().includes(term) ||
      (p.descricao || "").toLowerCase().includes(term);
    if (!match) return false;
  }
  // ...
});
```

O filtro compara `searchTerm` apenas contra `nome`, `fabricante`, `modelo` e `descricao`. **NAO compara contra `subclasse`, `classe` ou `area`** (nem por id, nem por nome).

Na correcao anterior (Sprint 1), adicionamos `descricao` ao filtro — mas **descricao do produto** e diferente de **nome da subclasse**. Sao campos distintos.

### Acao

1. **Corrigir o filtro** para incluir nome da subclasse/classe/area. Depende de como o produto carrega esses nomes:
   - Se `produto.subclasse_nome` vem do backend: adicionar `(p.subclasse_nome || "").toLowerCase().includes(term)`.
   - Se so vem o `subclasse_id`: fazer lookup na lista de subclasses carregada no estado do componente e comparar o nome.

   Codigo sugerido:
   ```tsx
   const getSubclasseNome = (id: string | null | undefined) =>
     id ? (subclasses.find(s => s.id === id)?.nome || "") : "";
   const getClasseNome = (id: string | null | undefined) =>
     id ? (classes.find(c => c.id === id)?.nome || "") : "";
   const getAreaNome = (id: string | null | undefined) =>
     id ? (areas.find(a => a.id === id)?.nome || "") : "";

   const match = p.nome.toLowerCase().includes(term) ||
     (p.fabricante || "").toLowerCase().includes(term) ||
     (p.modelo || "").toLowerCase().includes(term) ||
     (p.descricao || "").toLowerCase().includes(term) ||
     getSubclasseNome(p.subclasse_id).toLowerCase().includes(term) ||
     getClasseNome(p.classe_id).toLowerCase().includes(term) ||
     getAreaNome(p.area_id).toLowerCase().includes(term);
   ```

2. **Replicar em editaisvalida** apos corrigir.

3. **Atualizar tutorial** se necessario para explicitar que a busca cobre nome, fabricante, modelo, descricao, area, classe e subclasse.

---

## Resumo de Acoes

### Correcoes no sistema (codigo)

| # | OBS | Acao | Arquivo(s) | Prioridade |
|---|---|---|---|---|
| 1 | OBS-21/22-R | Adicionar busca em subclasse/classe/area no filtro do Portfolio | `PortfolioPage.tsx:218-244` | ALTA |
| 2 | OBS-19-R | Converter string vazia em NULL para CPF (evitar violacao UNIQUE) | `crud_routes.py` ou `EmpresaPage.tsx:420-447` | ALTA |
| 3 | OBS-19-R | Mensagem amigavel para violacao de UNIQUE (traduzir "Duplicate entry") | `crud_routes.py` (error handler) | MEDIA |
| 4 | OBS-11-R | Aumentar size dos icones Pencil/Edit2 de 15-16 para 18 + background | `EmpresaPage.tsx`, `PortfolioPage.tsx` | BAIXA |

### Esclarecimentos / UX (sem codigo)

| # | OBS | Acao |
|---|---|---|
| 1 | OBS-09-R | Explicar ao validador: o simbolo vermelho e o botao "Excluir", nao erro. Ou redesenhar posicao dos botoes. |
| 2 | OBS-17/18-R | Agendar chamada com Arnaldo para demonstrar setup de fontes de certidoes ao vivo |
| 3 | OBS-19-R | Pedir screenshot ao Arnaldo: (a) mascara "errada" de telefone, (b) mensagem de erro ao salvar Fernanda |

### Tutorial

| # | OBS | Acao |
|---|---|---|
| 1 | OBS-11-R | Esclarecer no tutorial que a linha inteira da tabela e clicavel para editar (alem do icone de lapis) |
| 2 | OBS-17/18-R | Adicionar screenshots passo-a-passo do setup inicial de fontes de certidoes |
| 3 | OBS-19-R | Adicionar legenda no campo de telefone: "Celular: (11) 99999-9999 | Fixo: (11) 9999-9999" |

---

## Metricas

| Categoria | Quantidade |
|---|---|
| Total de observacoes de revisao | 5 |
| PROCEDE | 1 (OBS-21/22-R) |
| PROCEDE PARCIAL | 3 (OBS-09-R, OBS-11-R, OBS-19-R) |
| INFORMATIVO | 1 (OBS-17/18-R — tratar em chamada) |
| Bugs confirmados | 2 (OBS-19-R UNIQUE cpf, OBS-21/22-R filtro) |

---

## Proximos passos

1. Aplicar correcoes 1 e 2 da tabela "Correcoes no sistema" (alta prioridade).
2. Agendar chamada com Arnaldo (OBS-17/18-R).
3. Solicitar screenshots pendentes (OBS-09-R, OBS-19-R).
4. Replicar correcoes em editaisvalida.
5. Atualizar tutorial.
6. Regerar PDF do tutorial.
