# Evidências de Execução

## Objetivo

Registrar apenas evidências produzidas nesta rodada, sem misturar com screenshots e relatórios históricos já existentes no repositório.

## 1. Inventário estrutural

Constatações derivadas de comandos no repositório:

- 23 páginas em `frontend/src/pages`
- 33 arquivos de testes principais em `tests`
- 306 documentos em `docs` com extensões `md`, `docx`, `pdf` e `pptx`

Leitura:

- o repositório possui volume suficiente para sustentar uma trilha séria de auto research
- a massa documental exige curadoria, porque mistura documentos ativos, históricos e artefatos auxiliares

## 2. Estado do git

Constatações:

- branch atual: `main`
- `HEAD` igual a `origin/main`
- sem commits locais pendentes de push
- working tree sujo com:
  - artefatos de teste
  - lockfiles temporários
  - documentos novos não commitados

Leitura:

- não havia necessidade de `push`
- seria incorreto fazer commit automático sem triagem prévia

## 3. Backend

### Import do app

Comando:

```bash
cd backend && python3 -c "from app import app; print('backend_import_ok')"
```

Resultado:

```text
backend_import_ok
```

Interpretação:

- integridade mínima de importação confirmada

## 4. Playwright

### Descoberta de testes

Comando:

```bash
npx playwright test tests/validacao_sprint2.spec.ts --list
```

Resultado:

- 20 testes listados para `validacao_sprint2.spec.ts`

Interpretação:

- a suíte Playwright existe e está operacional ao menos no estágio de descoberta

## 5. Frontend

### Build

Comando:

```bash
npm --prefix frontend run build
```

Resultado:

- falha em `tsc -b && vite build`

Classe dos erros observados:

- incompatibilidades de tipos em `DataTable` e `Column<T>`
- props inválidas em componentes reutilizáveis
- imports com `type-only` ausentes
- componentes usando props não suportadas
- páginas novas ou reescritas sem aderência completa aos tipos comuns

Arquivos mais impactados pelo log:

- `frontend/src/components/CrudPage.tsx`
- `frontend/src/components/Dashboard.tsx`
- `frontend/src/config/crudTables.tsx`
- `frontend/src/pages/CaptacaoPage.tsx`
- `frontend/src/pages/ValidacaoPage.tsx`
- `frontend/src/pages/AtasPage.tsx`
- `frontend/src/pages/EmpresaPage.tsx`
- `frontend/src/pages/ProducaoPage.tsx`
- `frontend/src/pages/PropostaPage.tsx`
- `frontend/src/pages/RecursosPage.tsx`
- `frontend/src/pages/SubmissaoPage.tsx`

Interpretação:

- o frontend está em estágio funcional parcial, mas não em estado de compilação limpa
- isso inviabiliza declarar homologação plena do produto nesta árvore
