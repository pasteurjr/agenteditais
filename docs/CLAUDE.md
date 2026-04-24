# Facilicita.IA — Contexto para Claude Code

Sistema de automação de licitações e pregões governamentais brasileiros.
Stack: FastAPI, Redis, Playwright, MySQL remoto, orquestração via Petri
Net (VisualTasksExec).

## Validação e correção de casos de uso

Processo de validação com dois comandos complementares:

**`/validar-uc`** — gera dois tutoriais (humano e Playwright) a partir
de casos de uso, executa o Playwright com validação em três camadas
(DOM, rede, semântica), e produz relatório auditável. Não modifica
código. Use quando quiser apenas diagnóstico.

**`/corrigir-divergencias`** — executa o loop completo: roda
`/validar-uc`, classifica divergências por causa raiz, corrige
automaticamente as de categoria "defeito de código", re-valida, e
repete até sucesso ou impasse. Opera em branch isolada, abre PR, nunca
faz merge automático. Respeita zonas protegidas (ver `.claude-protected`).

### Fluxo recomendado

1. PO recebe o tutorial humano e começa a execução manual em paralelo
2. Em paralelo, rodar `/corrigir-divergencias` no mesmo conjunto de UCs
3. Cross-check obrigatório entre os dois resultados antes de merge do PR
4. Divergência entre manual e automático = ajustar protocolo de
   validação, nunca só confiar no automático

### Diretórios relevantes

- `testes/casos_de_uso/` — specs de entrada
- `testes/tutoriais_humano/` — tutoriais para o PO executar manualmente
- `testes/tutoriais_playwright/` — tutoriais para execução automatizada
- `testes/relatorios/` — relatórios de execução com evidências
- `testes/relatorios/ciclo_<timestamp>/` — relatórios do loop de correção
- `testes/fixtures/` — arquivos auxiliares (PDFs, seeds SQL)

### Convenções do projeto

- Prefixo `E2E_<YYYYMMDD>_` em todos os dados de teste sintetizados
- Limpeza obrigatória via `DELETE ... WHERE ... LIKE 'E2E_%'` ao final
  de cada execução de validação
- Screenshots de evidência em `testes/relatorios/<uc_id>/<timestamp>/`
- Três formatos para dados numéricos/datados nos tutoriais Playwright:
  entrada (como usuário digita), exibição (como aparece renderizado),
  trânsito (como vai para o backend)
- Commits do loop de correção seguem formato
  `fix(validacao): <resumo>` com referência à divergência
- Branch de correção: `validacao/<timestamp>-<lista_uc_ids>`

### Zonas protegidas (não modificar automaticamente)

Arquivos onde `/corrigir-divergencias` NUNCA propõe correção automática:

- Lógica de cálculo financeiro (propostas, lances, valores finais)
- Integrações com sistemas governamentais (ComprasNet, BEC, Licitações-e)
- Código de auditoria, log e trilha de evidências
- Migrations de banco de dados
- Código de autenticação, autorização e sessão
- Configurações de produção (secrets, credenciais)
- Schemas de API pública

Lista estendida pode ser mantida em `.claude-protected` na raiz do
projeto.
