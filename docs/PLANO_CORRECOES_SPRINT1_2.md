# PLANO: Correcoes Sprint 1-2 — Tutorial + Bugs Criticos (Observacoes Arnaldo)

**Data:** 2026-04-23
**Contexto:** O documento `ANALISE_OBSERVACOES_ARNALDO_SPRINT1_2.md` identificou 11 observacoes que PROCEDEM, 3 PARCIAIS e 3 bugs CRITICOS nos UCs F07-F17. O tutorial `tutorialsprint1-2.md` precisa ser corrigido em 7 pontos, e 3 bugs criticos precisam de correcao no sistema.

---

## PARTE A — Correcoes no Tutorial (tutorialsprint1-2.md)

### A1. UC-F07 Passo 4 — Explicar importacao em lote via Plano de Contas
**Linhas:** 848-866
**Problema:** O Passo 4 so testa salvar "Plano de Contas sem nome". NAO explica que o upload de Plano de Contas importa MULTIPLOS produtos automaticamente via IA.
**Correcao:** Reescrever Passo 4 para:
1. Manter o teste de salvar sem nome (validacao de campo opcional)
2. Adicionar Passo 5 NOVO explicando a importacao em lote:
   - "Clique em **Adicionar Produto** > selecione **Plano de Contas (ERP)** no dropdown de tipo"
   - "Faca upload de um arquivo .xlsx, .csv ou .pdf com lista de produtos"
   - "O sistema usa IA para extrair e cadastrar CADA item individualmente"
   - "Aguarde o processamento — pode levar ate 2 minutos dependendo do tamanho"
   - "Tambem funciona com **Nota Fiscal (NFS)** para importar itens de NF"
3. Atualizar Resultado Final (linhas 869-882) para incluir verificacao de importacao em lote

### A2. UC-F07 — Alertar auto-save sem revisao
**Linhas:** 833-844 (Passo 3)
**Correcao:** Adicionar nota apos linha 841:
> "📌 **Atenção:** O processamento da IA salva os dados automaticamente no produto. Não há etapa de revisão antes do salvamento — após o processamento, os campos já estarão preenchidos e salvos. Caso algum dado esteja incorreto, você poderá editar manualmente no UC-F08."

### A3. UC-F08 — Explicar dependencia do UC-F13
**Linhas:** 894-899 (Antes de comecar)
**Correcao:** Adicionar prerequisito:
> "- Os dropdowns de **Área**, **Classe** e **Subclasse** dependem de dados cadastrados previamente (UC-F13). Se estiverem vazios, prossiga com os demais campos e retorne após executar o UC-F13."

### A4. UC-F09 — Adicionar prerequisito de documento
**Linhas:** 1032-1035 (Antes de comecar)
**Correcao:** Adicionar:
> "- O produto deve ter um **documento anexado** (manual técnico, IFU ou plano de contas). Se nenhum documento foi enviado durante o UC-F07, o reprocessamento usará apenas a descrição do produto como base, o que pode gerar resultados limitados."

### A5. UC-F10 — Avisar sobre servicos externos
**Linhas:** 1103-1107 (Antes de comecar)
**Correcao:** Expandir aviso existente:
> "- A busca ANVISA e a busca Web dependem de **serviços externos** (site da ANVISA e API Brave Search). Se retornarem 0 resultados, pode ser por indisponibilidade temporária do serviço, ou porque o nome do produto não corresponde exatamente ao registro. Tente simplificar o nome de busca se necessário. **Isso não é um erro do sistema.**"

### A6. UC-F16 — Alertar que fontes sao globais
**Linhas:** Secao UC-F16 (1671-1792), antes do Passo 1
**Correcao:** Adicionar aviso no "Antes de comecar":
> "⚠️ **IMPORTANTE:** As fontes de busca (ComprasNet, PNCP, etc.) são configurações **globais** — ativar ou desativar uma fonte afeta **todos os usuários e empresas** do sistema. Em ambiente de validação compartilhado, **NÃO desative fontes permanentemente**. Se o teste pedir para desativar, **reative imediatamente após o teste.**"

### A7. UC-F17 — Adicionar passo de verificacao de persistencia
**Linhas:** 1894-1895 (Resultado Final)
**Correcao:** Adicionar passo explicito ANTES do resultado final:
> "### Passo extra — Verificar persistência"
> "**O que fazer:** Após salvar as notificações e preferências, **recarregue a página** (F5 ou Ctrl+R). Verifique se todos os valores salvos permanecem como configurados."
> "✅ **Correto se:** Todos os toggles, seleções e campos mantêm os valores salvos após recarregar."
> "❌ **Problema se:** Algum campo volta ao valor padrão após recarregar — isso indica que o salvamento não persistiu no banco."

---

## PARTE B — Bugs Criticos no Sistema

### B1. UC-F11 — Thresholds de completude desalinhados
**Arquivos:** `frontend/src/pages/PortfolioPage.tsx` (linhas 1495, 1501, 1507)
**Problema:** Frontend usa >= 80% para verde, backend usa >= 90% para "completo"
**Correcao:** Alinhar frontend aos thresholds do backend (mais rigorosos):
```tsx
// Linha 1495 (percentual_geral) — trocar 80 por 90, trocar 50 por 70
color: perc >= 90 ? "#22c55e" : perc >= 70 ? "#f59e0b" : perc >= 40 ? "#fb923c" : "#ef4444"

// Linha 1501 (percentual_basicos) — trocar 80 por 90
color: perc >= 90 ? "#22c55e" : perc >= 70 ? "#f59e0b" : "#ef4444"

// Linha 1507 (percentual_mascara) — trocar 80 por 90, trocar 50 por 70
color: perc >= 90 ? "#22c55e" : perc >= 70 ? "#f59e0b" : perc >= 40 ? "#fb923c" : "#ef4444"
```
Adicionar cor laranja (#fb923c) para faixa 40-69% que antes nao existia no frontend.

**Tambem atualizar o tutorial UC-F11** (linha 1203): trocar "65% e 80%" por faixa correta.

### B2. UC-F17 — Notificacoes/Preferencias salvam no modelo errado
**Arquivos:**
- `frontend/src/pages/ParametrizacoesPage.tsx` (linhas 785-814)
- `backend/crud_routes.py` (linha 880 — `_set_column_value`)
- `backend/models.py` (modelo `PreferenciasNotificacao`)

**Problema:** Frontend salva `notif_email, notif_sistema, notif_sms, frequencia_resumo, tema, idioma, fuso_horario` via `crudUpdate("parametros-score", ...)`. Essas colunas NAO existem em `ParametroScore`. O `_set_column_value()` ignora silenciosamente. O modelo `PreferenciasNotificacao` existe mas nao e usado.

**Correcao (2 opcoes):**

**Opcao A (recomendada) — Usar PreferenciasNotificacao:**
1. Em `ParametrizacoesPage.tsx`:
   - `handleSalvarNotificacoes()` (linha 785): trocar `saveParamScore(...)` por `crudUpdate("preferencias-notificacao", prefNotifId, {...})`
   - `handleSalvarPreferencias()` (linha 802): idem
   - Adicionar `loadPreferenciasNotificacao()` no useEffect para carregar dados do modelo correto
   - Adicionar `ensurePreferenciasNotificacao()` similar ao `ensureParamScore()` para criar registro se nao existir
2. Verificar se `preferencias-notificacao` esta registrado no CRUD generico do backend

**Opcao B (mais simples) — Adicionar colunas ao ParametroScore:**
1. Em `models.py`, adicionar ao ParametroScore:
   ```python
   notif_email = Column(Boolean, default=True)
   notif_sistema = Column(Boolean, default=True)
   notif_sms = Column(Boolean, default=False)
   frequencia_resumo = Column(String(20), default='diario')
   tema = Column(String(20), default='claro')
   idioma = Column(String(10), default='pt-BR')
   fuso_horario = Column(String(50), default='America/Sao_Paulo')
   ```
2. Adicionar ao `to_dict()` do ParametroScore
3. Rodar ALTER TABLE no banco editais E editaisvalida

### B3. UC-F16 — Fontes de editais globais (nao escoped por empresa)
**Arquivos:** `backend/models.py` (FonteEdital, linha 398-420)
**Problema:** `fontes_editais` nao tem `empresa_id`. Toggle afeta todos.
**Correcao:** NAO corrigir agora — requer mudanca arquitetural (tabela intermediaria). Apenas corrigir no tutorial (A6 acima). Adicionar ao backlog.

---

## PARTE C — Correcoes menores no sistema

### C1. UC-F14 — Toast de confirmacao
**Arquivo:** `frontend/src/pages/ParametrizacoesPage.tsx`
**Problema:** Handlers de save nao exibem feedback visual de sucesso/erro (so console.error)
**Correcao:** Ja existe `notifSalvas` e `prefSalvas` com badge "Salvo!" (linhas 1242, 1299). Verificar se os OUTROS handlers (handleSalvarMercado, handleSalvarPesosScore, etc.) tambem tem feedback. Se nao, adicionar estado `salvoFeedback` generico.

### C2. UC-F15 — Feedback de erro em saves de TAM/SAM/SOM
**Arquivo:** `frontend/src/pages/ParametrizacoesPage.tsx` (linha 671)
**Problema:** `catch` so faz `console.error`, usuario nao ve erro
**Correcao:** Adicionar estado de erro e exibir mensagem vermelha se o save falhar:
```tsx
} catch (err) {
  console.error(err);
  setErroSave("Erro ao salvar. Verifique suas permissões.");
  setTimeout(() => setErroSave(null), 5000);
}
```

---

## Ordem de Execucao

| # | Tipo | Tarefa | Arquivo(s) |
|---|---|---|---|
| 1 | BUG | B1: Thresholds completude 80→90 | PortfolioPage.tsx:1495-1507 |
| 2 | BUG | B2: Notificacoes/Prefs modelo correto | ParametrizacoesPage.tsx + models.py |
| 3 | FIX | C1+C2: Toast/feedback em saves | ParametrizacoesPage.tsx |
| 4 | TUTORIAL | A1: Plano de Contas importacao em lote | tutorialsprint1-2.md:848-882 |
| 5 | TUTORIAL | A2: Aviso auto-save UC-F07 | tutorialsprint1-2.md:841 |
| 6 | TUTORIAL | A3: Dependencia UC-F13 no F08 | tutorialsprint1-2.md:894-899 |
| 7 | TUTORIAL | A4: Prerequisito documento UC-F09 | tutorialsprint1-2.md:1032-1035 |
| 8 | TUTORIAL | A5: Servicos externos UC-F10 | tutorialsprint1-2.md:1103-1107 |
| 9 | TUTORIAL | A6: Fontes globais UC-F16 | tutorialsprint1-2.md:~1675 |
| 10 | TUTORIAL | A7: Persistencia UC-F17 | tutorialsprint1-2.md:~1894 |
| 11 | SYNC | Replicar tudo para editaisvalida | frontend + backend + banco |
| 12 | DOC | Regenerar PDF do tutorial | tutorialsprint1-2.pdf |

---

## Verificacao

- [ ] Produto com 86% completude aparece AMARELO (nao verde)
- [ ] Produto com 92% aparece VERDE
- [ ] Produto com 45% aparece LARANJA
- [ ] Salvar notificacoes em UC-F17, recarregar, dados persistem
- [ ] Salvar preferencias (tema/idioma/fuso), recarregar, dados persistem
- [ ] Toast de sucesso aparece ao salvar parametros de score
- [ ] Toast de erro aparece se save falhar (simular sem permissao)
- [ ] Tutorial UC-F07 tem passo de importacao em lote via Plano de Contas
- [ ] Tutorial UC-F07 alerta auto-save
- [ ] Tutorial UC-F16 alerta fontes globais
- [ ] Tutorial UC-F17 tem passo de verificacao de persistencia
- [ ] editaisvalida sincronizado (frontend + backend + banco)
- [ ] PDF do tutorial regenerado

---

## Decisao pendente

**B2 — Opcao A ou B?** Recomendo **Opcao B** (adicionar colunas ao ParametroScore) porque:
- Menos mudanca no frontend (continua usando saveParamScore)
- PreferenciasNotificacao pode nao estar registrado no CRUD generico
- Mais rapido de implementar
- So precisa de ALTER TABLE + to_dict()
