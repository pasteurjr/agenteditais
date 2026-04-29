---
uc_id: UC-F18
nome: "Vincular empresa a usuario"
sprint: "Sprint 1"
versao_uc: "7.0"
doc_origem: "CASOS DE USO EMPRESA PORTFOLIO PARAMETRIZACAO V7.md"
extraido_em: "2026-04-28"
extraido_de: "FA-07.B do UC-F01 V6"
---

# UC-F18 — Vincular empresa a usuario

> Caso de uso extraido do **FA-07.B do UC-F01 V6** em V7 (28/04/2026).
> Eh um UC autonomo que tambem eh referenciado pelo UC-F01 via `<<uses>>`
> (UML: UC-F01 reusa UC-F18 como parte do seu fluxo apos criar empresa).
> Sprint origem: **Sprint 1**.

---

**RNs aplicadas:** RN-023 (segregacao por empresa)

**RF relacionados:** RF-001 (autenticacao/autorizacao)

**Regras de Negocio aplicaveis:**
- Presentes: RN-023
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**Ator:** Usuario administrador/superusuario

### Pre-condicoes
1. Usuario autenticado como super (apenas super pode vincular).
2. Usuario alvo da vinculacao existe em `users`.
3. Empresa alvo da vinculacao existe em `empresas`.
4. Endpoint `/api/admin/associar-empresa` operacional.

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-F01**

Pre-requisitos nao-UC:

- `[login]` — autenticacao basica do usuario
- `[infra]` — endpoint/servico operacional (nao eh UC)


### Pos-condicoes
1. Registro ativo em `usuario_empresa` (user_id, empresa_id, papel, ativo=True) criado ou atualizado.
2. No proximo login do user alvo, a empresa aparece em `vinculadas` no endpoint `/api/auth/minhas-empresas`.
3. User alvo pode entrar diretamente na EmpresaPage da empresa vinculada (sem cair em "Sem empresa vinculada").

### Botoes e acoes observadas
- `[Botao: "Vincular Empresa a Usuario"]` na tela "Sem Empresa Vinculada" (entrada via FA-07 do UC-F01)
- Pagina `associar-empresa` com selects de usuario, empresa, papel
- `[Botao: Salvar/Vincular]` que dispara `POST /api/admin/associar-empresa`
- Alternativa: invocacao direta da API por outro UC (relacao `<<uses>>` do UC-F01)

### Sequencia de eventos (Fluxo Principal)
1. Super autenticado acessa pagina `associar-empresa` (via menu Admin ou redirecionado pela tela "Sem Empresa Vinculada").
2. Super seleciona [Select: "Usuario alvo"] (lista de users do banco).
3. Super seleciona [Select: "Empresa alvo"] (lista de empresas existentes).
4. Super seleciona [Select: "Papel"] (operador|admin|consulta).
5. Super clica [Botao: "Vincular"].
6. Sistema dispara `POST /api/admin/associar-empresa` com `{user_id, empresa_id, papel, acao: "vincular"}`.
7. Backend valida (user existe, empresa existe, requester eh super) e cria/atualiza registro em `usuario_empresa`.
8. Sistema retorna mensagem de sucesso e atualiza listagem de vinculos.

### Fluxos Alternativos

**FA-01 — Vinculacao por CNPJ (em vez de empresa_id)**
1. Cliente da API envia `cnpj` no payload em vez de `empresa_id`.
2. Backend resolve empresa_id buscando por CNPJ (com ou sem mascara).
3. Resto do fluxo igual ao FP.
4. **Util para fluxos automatizados** (ex: tutorial CT-F01-FP que acabou de criar empresa via CRUD e nao tem o UUID em mao).

**FA-02 — Reativacao de vinculo previamente desvinculado**
1. Usuario alvo ja teve vinculo com a empresa, mas foi desvinculado (ativo=False).
2. Sistema detecta o vinculo existente e reativa em vez de criar duplicado.

**FA-03 — Atualizacao de papel**
1. Usuario alvo ja tem vinculo ativo com a empresa.
2. Sistema atualiza apenas o campo `papel` (operador → admin, p.ex.).

### Fluxos de Excecao

**FE-01 — Usuario alvo nao existe**
1. user_id no payload nao corresponde a user no banco.
2. Backend retorna 404 com mensagem "Usuario nao encontrado".

**FE-02 — Empresa alvo nao existe**
1. empresa_id ou cnpj no payload nao corresponde a empresa no banco.
2. Backend retorna 404 com mensagem "Empresa nao encontrada".

**FE-03 — Requester nao eh super**
1. Usuario logado nao tem papel super.
2. Decorator `@require_super` bloqueia → 403.

**FE-04 — Payload invalido**
1. Faltam user_id ou empresa_id/cnpj.
2. Backend retorna 400 com mensagem "user_id e (empresa_id OU cnpj) sao obrigatorios".

### Tela(s) Representativa(s)

**Pagina:** `associar-empresa` (`/app/admin/associar-empresa`)
**Posicao:** Pagina autonoma de admin

#### Layout da Tela

```
[Card: "Vincular Empresa a Usuario"]
  [Select: "Usuario"] (todos os users do banco)
  [Select: "Empresa"] (todas as empresas)
  [Select: "Papel"] — operador|admin|consulta
  [Botao: "Vincular"] — primary
  [Botao: "Cancelar"]

[Tabela: "Vinculos existentes"]
  [Coluna: "Usuario"] [Coluna: "Empresa"] [Coluna: "Papel"] [Coluna: "Ativo"]
  [Icone-Acao: Trash] — desvincular (chama mesmo endpoint com acao="desvincular")
```

### Persistencia observada
Tabela `usuario_empresa`: `user_id`, `empresa_id`, `papel`, `ativo`, `criado_em`.

### Relacao com UC-F01

**`UC-F01 <<uses>> UC-F18`** (UML).

UC-F01 invoca UC-F18 como parte do seu fluxo — apos criar a empresa via CRUD (passo 4 do CT-F01-FP), o sistema dispara UC-F18 com `user_id = usuario corrente` e `empresa_id = empresa recem-criada`. Tutorial automatizado faz isso via `chamar_api` no passo 10 do CT-F01-FP.

UC-F18 tambem pode ser executado **autonomamente** (admin vinculando empresa pre-existente a outro user), com seu proprio CT-F18-FP cobrindo este cenario.

### Implementacao atual
**IMPLEMENTADO** (endpoint `POST /api/admin/associar-empresa` operacional desde V6, agora aceitando CNPJ alem de empresa_id desde V7).

---
