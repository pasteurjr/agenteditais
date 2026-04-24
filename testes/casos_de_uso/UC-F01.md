---
uc_id: UC-F01
nome: "Manter cadastro principal da empresa"
sprint: "Sprint 1"
versao_uc: "5.0"
doc_origem: "CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md"
linha_inicio_no_doc: 192
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-F01 — Manter cadastro principal da empresa

> Caso de uso extraído automaticamente de `docs/CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V5.md` (linha 192).
> Sprint origem: **Sprint 1**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-001, RN-002, RN-003, RN-022, RN-023, RN-024, RN-025, RN-028 [FALTANTE→V4]

**RF relacionados:** RF-001, RF-005

**Regras de Negocio aplicaveis:**
- Presentes: RN-001, RN-002, RN-003, RN-022, RN-023, RN-024, RN-025
- Faltantes: RN-028 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario administrador/comercial

### Pre-condicoes
1. Usuario autenticado (ver secao Modelo de Acesso).
2. CRUD de `empresas` disponivel.

### Pos-condicoes
1. Registro em `empresas` criado ou atualizado.
2. Dados cadastrais ficam reutilizaveis nas demais etapas do sistema.

### Botoes e acoes observadas
- `Salvar Alteracoes`
- `Tentar novamente` em caso de erro

### Sequencia de eventos
1. Usuario acessa `EmpresaPage` via menu lateral "Configuracoes > Empresa".
2. Sistema carrega a primeira empresa do usuario via `crudList("empresas", { limit: 1 })` e popula o [Card: "Informacoes Cadastrais"].
3. Usuario revisa e altera os campos do [Card: "Informacoes Cadastrais"]: [Campo: "Razao Social"], [Campo: "Nome Fantasia"], [Campo: "CNPJ"], [Campo: "Inscricao Estadual"] na [Secao: "Dados Basicos"]; [Campo: "Website"], [Campo: "Instagram"], [Campo: "LinkedIn"], [Campo: "Facebook"] na [Secao: "Presenca Digital"]; [Campo: "Endereco"], [Campo: "Cidade"], [Campo: "UF"] (**deve ser dropdown/select com os 27 estados — V5 correcao**), [Campo: "CEP"] na [Secao: "Endereco"].
4. Usuario clica no [Botao: "Salvar Alteracoes"] no rodape do [Card: "Informacoes Cadastrais"].
5. Sistema cria ou atualiza o registro em `empresas`. Exibe [Toast] de confirmacao (**V5 correcao: toast de sucesso deve ser implementado — atualmente ausente**) ou [Alerta] de erro com [Botao: "Tentar novamente"].

> **Nota:** Este card e compartilhado com UC-F02. Ver [UC-F02] para os elementos de Emails, Telefones e Area de Atuacao Padrao.

> **Correcao V5 (Arnaldo OBS-05):** Existe duplicidade de telas de edicao de empresa entre "Cadastros > Empresa" (CRUD generico) e "Configuracoes > Empresa" (EmpresaPage completa). O tutorial deve instruir explicitamente para usar "Configuracoes > Empresa".

### Fluxos Alternativos

**FA-01 — Usuario cancela a edicao antes de salvar**
1. Usuario altera campos no formulario.
2. Usuario navega para outra pagina sem clicar "Salvar Alteracoes".
3. Sistema nao persiste as alteracoes. Ao retornar, os dados originais sao recarregados.

**FA-02 — Facebook deixado em branco (campo opcional)**
1. No Passo 3, usuario preenche todos os campos exceto [Campo: "Facebook"].
2. Sistema aceita o salvamento sem erro — campo opcional.
3. O registro persiste com Facebook = null/vazio.

**FA-03 — Empresa ja possui dados cadastrados**
1. No Passo 2, sistema carrega dados pre-existentes nos campos.
2. Usuario sobrescreve os valores desejados.
3. Sistema atualiza (PUT) em vez de criar (POST).

**FA-04 — Usuario acessa via "Cadastros > Empresa" (CRUD generico)**
1. Usuario navega para "Cadastros > Empresa" em vez de "Configuracoes > Empresa".
2. Sistema exibe CRUD generico simplificado (sem redes sociais, endereco completo, etc.).
3. Alteracoes feitas aqui atualizam a mesma tabela `empresas`, porem com menos campos.

### Fluxos de Excecao

**FE-01 — CNPJ invalido (digito verificador incorreto)**
1. No Passo 3, usuario informa CNPJ com formato correto mas digito verificador errado (ex: `00.000.000/0000-00`).
2. Sistema valida via RN-028 (`validar_cnpj`).
3. Exibe [Alerta] ou [Toast] vermelho: "CNPJ invalido".
4. Registro NAO e salvo.

**FE-02 — CNPJ em formato incorreto**
1. Usuario digita CNPJ sem pontuacao ou com caracteres invalidos.
2. Sistema rejeita no frontend (mascara) ou backend (validacao).
3. Exibe mensagem de formato invalido.

**FE-03 — Servidor fora do ar / erro de rede**
1. Usuario clica "Salvar Alteracoes" mas o backend nao responde.
2. Sistema exibe [Alerta] de erro com [Botao: "Tentar novamente"].
3. Dados permanecem no formulario para reenvio.

**FE-04 — Razao Social em branco (campo obrigatorio)**
1. Usuario deixa [Campo: "Razao Social"] vazio e tenta salvar.
2. Sistema exibe erro de validacao: "Razao Social e obrigatoria".
3. Registro NAO e salvo.

**FE-05 — UF digitada como texto livre (bug conhecido)**
1. Campo UF e TextInput em vez de SelectInput.
2. Usuario digita valor invalido (ex: "XX").
3. Sistema aceita o valor — nao ha validacao de UF no backend.
4. **Correcao V5:** UF deve ser trocado para dropdown com 27 estados.

**FE-06 — Toast de sucesso nao aparece (bug conhecido)**
1. Usuario salva com dados validos.
2. Backend retorna 200 OK, dados sao persistidos.
3. Porem nenhum feedback visual e exibido ao usuario.
4. **Correcao V5:** Adicionar toast "Dados salvos com sucesso" apos PUT bem-sucedido.

### Tela(s) Representativa(s)

**Pagina:** EmpresaPage (`/app/empresa`)
**Posicao:** Card 1 de 5

#### Layout da Tela

```
[Cabecalho da Pagina]
  [Icone: Building]
  [Titulo: "Dados da Empresa"]
  [Subtitulo: "Cadastro de informacoes e documentos da empresa"]
  [Botao: "Verificar Documentos"] (header-level, ver UC-F03) [ref: —]

[Card: "Informacoes Cadastrais"] [Icone: Building]
  [Secao: "Dados Basicos"] (form-grid-2)
    [Campo: "Razao Social"] — text, obrigatorio [ref: Passo 3]
    [Campo: "Nome Fantasia"] — text [ref: Passo 3]
    [Campo: "CNPJ"] — text, obrigatorio, placeholder "00.000.000/0000-00" [ref: Passo 3]
    [Campo: "Inscricao Estadual"] — text [ref: Passo 3]
  [Campo: "Area de Atuacao Padrao"] — select (areas do backend) [ref: UC-F02 Passo 3]
  [Secao: "Presenca Digital"] (form-grid-2)
    [Campo: "Website"] — url [ref: Passo 3]
    [Campo: "Instagram"] — text, prefix "@" [ref: Passo 3]
    [Campo: "LinkedIn"] — text [ref: Passo 3]
    [Campo: "Facebook"] — text [ref: Passo 3]
  [Secao: "Endereco"]
    [Campo: "Endereco"] — text (form-grid-1) [ref: Passo 3]
    [Campo: "Cidade"] — text (form-grid-3) [ref: Passo 3]
    [Campo: "UF"] — **select (dropdown 27 UFs)** [ref: Passo 3] (V5 correcao: atualmente TextInput)
    [Campo: "CEP"] — text [ref: Passo 3]
  [Secao: "Emails de Contato"] [ref: UC-F02 Passo 1]
  [Secao: "Celulares / Telefones"] [ref: UC-F02 Passo 2]
  [Botao: "Salvar Alteracoes"] — primary [ref: Passo 4]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Campo: "Razao Social"] | 3 |
| [Campo: "Nome Fantasia"] | 3 |
| [Campo: "CNPJ"] | 3 |
| [Campo: "Inscricao Estadual"] | 3 |
| [Campo: "Website"] | 3 |
| [Campo: "Instagram"] | 3 |
| [Campo: "LinkedIn"] | 3 |
| [Campo: "Facebook"] | 3 |
| [Campo: "Endereco"] | 3 |
| [Campo: "Cidade"] | 3 |
| [Campo: "UF"] | 3 |
| [Campo: "CEP"] | 3 |
| [Botao: "Salvar Alteracoes"] | 4, 5 |
| [Botao: "Tentar novamente"] | 5 (erro) |

### Persistencia observada
Campos relevantes em `empresas`: `cnpj`, `razao_social`, `nome_fantasia`, `inscricao_estadual`, `website`, `instagram`, `linkedin`, `facebook`, `endereco`, `cidade`, `uf`, `cep`, `emails`, `celulares`, `area_padrao_id`, `frequencia_busca_certidoes`.

### Implementacao atual
**IMPLEMENTADO**

---
