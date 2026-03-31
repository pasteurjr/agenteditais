# Estado Real de Implementação

## Resumo executivo

O sistema está claramente além de um protótipo inicial. Há implementação real relevante até a Sprint 5, mas o estado atual não sustenta um “pronto para homologação plena” sem ressalvas técnicas importantes.

## Confirmado por código

### Módulos com implementação real relevante

- autenticação e sessões
- empresa
- portfolio
- parametrizações
- captação
- validação
- impugnação
- recursos
- proposta
- submissão
- follow-up
- atas
- execução de contratos
- contratado x realizado

Evidências principais:

- `frontend/src/pages/CaptacaoPage.tsx`
- `frontend/src/pages/ValidacaoPage.tsx`
- `frontend/src/pages/PropostaPage.tsx`
- `frontend/src/pages/RecursosPage.tsx`
- `frontend/src/pages/ProducaoPage.tsx`
- `frontend/src/pages/ContratadoRealizadoPage.tsx`
- `backend/app.py`
- `backend/tools.py`
- `backend/crud_routes.py`

### Módulos ainda mockados ou incompletos

Confirmados por leitura direta das páginas:

- `frontend/src/pages/CRMPage.tsx`
- `frontend/src/pages/PerdasPage.tsx`
- `frontend/src/pages/ConcorrenciaPage.tsx`
- `frontend/src/pages/FlagsPage.tsx`
- `frontend/src/pages/MonitoriaPage.tsx`
- `frontend/src/pages/MercadoPage.tsx`
- `frontend/src/pages/LancesPage.tsx`

Padrões encontrados nessas páginas:

- arrays `mock*`
- `TODO: Chamar API`
- handlers locais sem integração real
- ausência de fetch/CRUD efetivo

## Confirmado por execução

### Backend

Comando executado:

```bash
cd backend && python3 -c "from app import app; print('backend_import_ok')"
```

Resultado:

- backend importou corretamente no diretório do módulo
- isso comprova integridade mínima de importação, não operação completa do servidor

### Testes Playwright

Comando executado:

```bash
npx playwright test tests/validacao_sprint2.spec.ts --list
```

Resultado:

- 20 testes foram listados corretamente
- isso confirma a existência de uma suíte real de validação automatizada

### Frontend build

Comando executado:

```bash
npm --prefix frontend run build
```

Resultado:

- falha de compilação TypeScript

Conclusão:

- o frontend não está em estado compilável limpo nesta árvore de trabalho

## Divergências relevantes entre documentação e estado observado

### Documentação recente é valiosa, mas não totalmente homogênea

Exemplo:

- `docs/analise/inventario_do_sistema.md` fala em React 18
- `frontend/package.json` mostra React 19.2.0

### O sistema “até Sprint 5” está funcional em partes centrais, mas a shell total do produto contém páginas futuras ainda mockadas

Isso afeta a percepção de prontidão caso o cliente navegue livremente por todo o menu.

## Leitura consolidada por maturidade

### Maturidade alta

- modelos e domínio de negócio
- CRUD genérico
- módulos centrais do fluxo licitatório
- documentação de casos de uso e validação

### Maturidade média

- integração entre páginas e chat
- consistência do frontend
- rastreabilidade entre implementação e testes

### Maturidade baixa

- limpeza do estado da árvore
- tipagem TypeScript
- isolamento entre módulos concluídos e módulos futuros
- segurança operacional de configuração
