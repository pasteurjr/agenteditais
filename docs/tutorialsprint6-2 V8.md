# TUTORIAL DE VALIDAÇÃO MANUAL — SPRINT 6 — CONJUNTO 2 V8 (Bio-Hosp)

**Data:** 2026-05-18
**Empresa:** Bio-Hosp Equipamentos Hospitalares Ltda. (CNPJ 33.014.556/0001-96)
**Dados de apoio:** `docs/dadossprint6-2 V8.md`
**Referência:** `docs/CASOS DE USO SPRINT 6.md`
**UCs cobertos:** 17 (FL01..FL05, MO01..MO06, AU01..AU03, SM01..SM03)
**Público:** validador humano acompanhando roteiro passo-a-passo

**Pré-requisito:** `tutorialsprint4-2 V8.md` executado com sucesso (continuidade da cadeia Bio-Hosp S1→S4)

> **CHANGELOG V8** — Conjunto 2 encadeado com a cadeia Bio-Hosp S1→S4 V8; estrutura de UCs idêntica ao molde validado; identidade adaptada; reflete estado pós-correções Arnaldo + melhorias UX.

---

## Credenciais e Login

| Campo | Valor |
|---|---|
| URL | http://localhost:5179 |
| Email | validaarnaldo@valida.com.br |
| Senha | 123456 |
| Empresa | Bio-Hosp Equipamentos Hospitalares Ltda. |
| Perfil | Superusuário |

### Fluxo de login
1. Abrir `http://localhost:5179`
2. Preencher email/senha e clicar **Entrar**
3. Na tela de seleção, clicar em **Bio-Hosp Equipamentos Hospitalares Ltda.**
4. Aguardar dashboard carregar

---

## Pré-requisitos

- Backend rodando na porta **5007**
- Frontend rodando na porta **5179**
- Seeds executadas:
  - `python backend/seeds/sprint5_seed.py` (dados base)
  - `python backend/seeds/sprint6_seed.py` (dados Sprint 6)
- Cadeia Bio-Hosp S1→S4 V8 concluída (`tutorialsprint4-2 V8.md`)

---

## Índice

1. [FASE 1 — Flags (UC-FL01..FL05)](#fase-1)
2. [FASE 2 — Monitoria (UC-MO01..MO06)](#fase-2)
3. [FASE 3 — Auditoria (UC-AU01..AU03)](#fase-3)
4. [FASE 4 — SMTP (UC-SM01..SM03)](#fase-4)

---

## FASE 1 — Flags e Alertas (UC-FL01..FL05) <a id="fase-1"></a>

**Objetivo:** validar dashboard de alertas, criacao via modal, pipeline visual, cancelamento e calendario.

### UC-FL01 — Dashboard Alertas carrega com stats e pipeline
1. Sidebar → **Flags** (secao Indicadores)
2. Verificar titulo "Flags e Alertas"
3. Verificar stat cards: **Agendados** (4), **Disparados** (2), **Cancelados** (1)
4. Verificar **Pipeline de Alertas** com 4 cards clicaveis por status
5. Verificar tabela com 8 alertas listados

### UC-FL02 — Botao Novo Alerta abre modal de criacao
1. Clicar botao **Novo Alerta**
2. Modal abre com campos: **Numero do Edital**, **Tipo de Alerta**, **Antecedencia**
3. Preencher: edital = qualquer existente, tipo = abertura, antecedencia = 24h
4. Clicar **Salvar** → toast de sucesso

### UC-FL03 — Pipeline visual filtra por status
1. No Pipeline, clicar card **Agendados**
2. Tabela filtra mostrando apenas alertas com status=agendado
3. Verificar texto **"Mostrar todos"** para limpar filtro
4. Clicar "Mostrar todos" → tabela volta a exibir todos

### UC-FL04 — Cancelar alerta via botao trash
1. Localizar alerta agendado na tabela
2. Clicar icone trash (titulo: "Cancelar alerta")
3. Verificar que o alerta muda de status (recarrega)

### UC-FL05 — Agenda/calendario renderiza mes atual
1. Scroll ate secao Agenda/Calendario
2. Verificar nome do mes atual renderizado (ex: "Maio")
3. Verificar texto **"Dias com alertas agendados"**
4. Dias com alertas marcados no calendario

---

## FASE 2 — Monitoria (UC-MO01..MO06) <a id="fase-2"></a>

**Objetivo:** validar dashboard de monitoramentos, criacao, botoes de analise, tabela e card de erro.

### UC-MO01 — Dashboard Monitoramentos carrega com stats
1. Sidebar → **Monitoria** (secao Indicadores)
2. Verificar titulo "Monitoramento Automatico"
3. Verificar 4 stat cards:
   - **Ativos**: 3 (ou mais, incluindo pre-existentes)
   - **Pausados**: 1
   - **Editais encontrados**: soma total (>=29)
   - **Com erro**: 1

### UC-MO02 — Botao Novo Monitoramento abre modal
1. Clicar **Novo Monitoramento**
2. Modal abre com: **Termo de busca**, **Frequencia**
3. Preencher: termo = "monitor multiparametro", frequencia = 8h
4. Clicar Salvar

### UC-MO03 — Botao Analisar Documentos presente
1. Verificar botao **"Analisar Documentos"** visivel no header da pagina
2. (Botao dispara tool DeepSeek — nao clicar em teste manual)

### UC-MO04 — Botao Verificar PNCP presente
1. Verificar botao **"Verificar PNCP"** visivel no header da pagina
2. (Botao dispara tool DeepSeek — nao clicar em teste manual)

### UC-MO05 — Tabela de monitoramentos com acoes
1. Verificar tabela com colunas: **Termo**, **UFs**, **Freq.**, **Encontrados**, **Status**
2. Verificar 5+ linhas (seed Sprint 6 + pre-existentes)
3. Cada linha tem acoes: toggle ativo/pausar, excluir

### UC-MO06 — Card monitoramentos com erro
1. Verificar card **"Com erro"** com contagem >= 1
2. Monitoramento "biomol pcr" com ultimo_check ha 72h (> 3 * 4h = 12h)

---

## FASE 3 — Auditoria (UC-AU01..AU03) <a id="fase-3"></a>

**Objetivo:** validar consulta de auditoria, filtro de acoes sensiveis, e exportacao compliance.

### UC-AU01 — Tab Consultar carrega com filtros e tabela
1. Sidebar → **Auditoria** (secao Governanca)
2. Tab **"Consultar"** ativa por padrao
3. Verificar filtros: **Entidade** (dropdown), **Periodo** (date range)
4. Verificar tabela com registros de auditoria (>=10 do seed)
5. Cada registro mostra: acao, entidade, usuario, data

### UC-AU02 — Tab Alteracoes Sensiveis
1. Clicar tab **"Alteracoes Sensiveis"**
2. Verificar que filtra por entidades sensiveis: smtp-config, users, parametros-score
3. Verificar 3 registros sensiveis visiveis (#4, #5, #8 do seed)
4. Alerta/banner de acoes sensiveis nas ultimas 24h

### UC-AU03 — Tab Exportar Compliance com formulario e botao
1. Clicar tab **"Exportar Compliance"**
2. Verificar formulario com:
   - **Data Inicio** (date picker)
   - **Data Fim** (date picker)
   - **Mascarar PII** (checkbox)
3. Verificar botao **"Exportar CSV"**
4. Clicar Exportar → download CSV inicia

---

## FASE 4 — SMTP (UC-SM01..SM03) <a id="fase-4"></a>

**Objetivo:** validar configuracao SMTP, templates de email e fila de envio.
**Nota:** Pagina SMTP requer permissao super-only (Superusuário tem acesso).

### UC-SM01 — Configuracao SMTP carrega e permite testar
1. Sidebar → **SMTP** (secao Governanca)
2. Tab **"Configuracao"** ativa
3. Verificar campos: **Host** (smtp.empresa.com.br), **Porta** (587), **From Email**
4. Verificar modo producao: **Desligado** (dry-run)
5. Botao **"Testar Conexao"** visivel

### UC-SM02 — Tab Templates lista templates de email
1. Clicar tab **"Templates"**
2. Verificar titulo "Templates de Email"
3. Verificar tabela com 4 templates:
   - alerta-edital, certidao-vencida, contrato-vencimento, monitoramento-encontrado
4. Colunas: **Slug**, **Nome**, **Assunto**

### UC-SM03 — Tab Fila de Envio mostra stats e tabela
1. Clicar tab **"Fila de Envio"**
2. Verificar **Resumo da Fila**: Pendentes (2), Enviados (2), Falhados (2)
3. Verificar tabela com 6 itens
4. Itens falhados com botao "Reenviar"
5. Verificar texto "Fila de Email"

---

## Resumo

- **UCs cobertos:** 17/17
- **Fases:** 4 (Flags, Monitoria, Auditoria, SMTP)
- **Produto-chave do conjunto:** Monitor Multiparâmetro Nihon Kohden BSM-3000 (SKU NK-BSM3000-BR)
- **Pré-requisito:** seeds Sprint 5 + Sprint 6 executadas + cadeia Bio-Hosp S1→S4 V8 concluída
- **Dados reais:** todos os elementos visiveis tem dados do seed, nenhuma tela vazia

---

## Encerramento

Apos validacao, **parar backend e frontend** (regra do projeto: sempre matar servidor apos testes).
