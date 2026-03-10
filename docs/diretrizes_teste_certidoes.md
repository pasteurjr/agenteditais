# Diretrizes de Teste — Certidões Automáticas

**Data:** 10/03/2026
**Navegação:** Sidebar → Configurações → Empresa → seção "Certidões Automáticas"

---

## 1. Pré-requisitos

- Backend rodando: `python3 backend/app.py` (porta 5007)
- Frontend rodando: `cd frontend && npm run dev` (porta 5175)
- Empresa QUANTICA IA LTDA cadastrada com CNPJ 62.164.030/0001-90
- Fontes de certidões inicializadas (acontece automaticamente ou via POST /api/fontes-certidoes/inicializar)

---

## 2. Testes de Busca Automática

### TESTE A: Clicar "Buscar Certidões"

**Passos:**
1. Acesse Sidebar → Configurações → Empresa
2. Role até a seção "Certidões Automáticas"
3. Verifique que a tabela já mostra as fontes pré-carregadas (sincronizar-fontes roda no load)
4. Clique no botão **"Buscar Certidões"**
5. Aguarde ~10 segundos (a CGU leva 3-5s para responder)

**Resultados Esperados:**

| Certidão | Status Esperado | O que aparece |
|---|---|---|
| CGU - Certidão Correcional | **Válida** (verde) | NADA CONSTA — CEIS, CNEP, CEPIM, CGU-PJ, ePAD |
| BrasilAPI - Situação Cadastral CNPJ | **Válida** (verde) | Situação ATIVA — QUANTICA IA LTDA. Simples: Sim |
| Receita Federal - CND Federal | **Pendente** (amarelo) | Orientação para acessar e-CAC com login gov.br |
| TST - CNDT | **Pendente** (amarelo) | Orientação para acessar portal com captcha |
| Caixa - CRF/FGTS | **Manual** (cinza) | Orientação para acessar portal (ShieldSquare anti-bot) |
| SEFAZ - CND Estadual | **Manual** (cinza) | Orientação para acessar SEFAZ com captcha |
| Prefeitura - CND Municipal | **Manual** (cinza) | Orientação para acessar prefeitura |

**Verificações:**
- [ ] Mensagem de resumo aparece no topo (ex: "Busca concluída: 7 fontes — 2 obtidas automaticamente, 5 pendentes")
- [ ] CGU e BrasilAPI ficam com badge "Válida" (verde)
- [ ] Fontes manuais ficam com badge "Manual" (cinza) ou "Pendente" (amarelo)
- [ ] Data de validade da CGU é ~180 dias a partir de hoje
- [ ] Nenhum erro no console do browser

### TESTE B: Verificar Portal da Transparência (com chave API)

**Passos (opcional, requer cadastro):**
1. Acesse https://portaldatransparencia.gov.br/api-de-dados/cadastrar-email
2. Cadastre um email e obtenha a chave API (gratuita)
3. Em Cadastros → Fontes de Certidões, adicione uma fonte "Portal da Transparência" com a chave API no campo `api_key`
4. Execute a busca novamente

**Resultado:** Deve retornar NADA CONSTA para CEIS, CNEP, CEPIM com dados detalhados.

---

## 3. Testes de Upload Manual

### TESTE C: Upload de certidão para fonte manual

**Passos:**
1. Na tabela de certidões, encontre uma fonte com status "Manual" ou "Pendente"
2. Clique no ícone de **Upload** (📤 amarelo)
3. No modal, selecione um PDF (use um dos PDFs em `docs/docs_quantica/`)
4. Opcionalmente preencha "Data de Vencimento" e "Número"
5. Clique "Enviar"

**Verificações:**
- [ ] Modal de upload abre corretamente
- [ ] Upload funciona sem erro
- [ ] Status muda para "Válida" (verde) após upload
- [ ] Botão de Download (⬇️) aparece após upload
- [ ] Botão de Download baixa o PDF corretamente

### TESTE D: Visualizar documento uploaded

**Passos:**
1. Após fazer upload, clique no ícone de **Download** (⬇️)
2. Verifique que o PDF abre corretamente

**Verificações:**
- [ ] NÃO aparece erro "Token não fornecido" (bug corrigido)
- [ ] PDF abre corretamente no browser

---

## 4. Testes de Vencimento

### TESTE E: Indicador visual de vencimento próximo

**Passos:**
1. Via banco de dados ou upload, crie uma certidão com `data_vencimento` = hoje + 10 dias
2. Recarregue a página

**Verificações:**
- [ ] Badge mostra "Vence em Xd" (amarelo) quando faltam ≤ 15 dias
- [ ] Badge mostra "Vencida" (vermelho) quando data_vencimento < hoje
- [ ] Badge mostra "Válida" (verde) quando faltam > 15 dias

---

## 5. Testes do Scheduler

### TESTE F: Scheduler inicia sem erros

**Passos:**
1. Inicie o backend: `python3 backend/app.py`
2. Observe os logs no terminal

**Verificações:**
- [ ] Log mostra: `[SCHEDULER] Iniciado com sucesso!`
- [ ] Log mostra: `[SCHEDULER] - Verificação de certidões: diária às 6h`
- [ ] NÃO aparece scheduler duplicado (apenas uma vez)
- [ ] NÃO aparece erro de `Alerta` (bug corrigido)

### TESTE G: Frequência de busca

**Passos:**
1. Na seção de certidões, mude o select "Frequência de busca automática" para "Semanal"
2. Verifique no banco que `empresa.frequencia_busca_certidoes` foi atualizado

**Verificações:**
- [ ] Select salva corretamente (sem erro no console)
- [ ] Valor persiste ao recarregar a página

---

## 6. Testes do Sincronizar-Fontes (ao carregar página)

### TESTE H: Certidões aparecem sem clicar botão

**Passos:**
1. Delete todas as certidões da empresa no banco (se houver)
2. Acesse Sidebar → Configurações → Empresa

**Verificações:**
- [ ] A tabela de certidões já mostra registros (status "Pendente" ou "Manual")
- [ ] NÃO precisa clicar "Buscar Certidões" para ver as fontes listadas
- [ ] Cada fonte cadastrada tem um registro correspondente na tabela

---

## 7. Links dos Portais (verificação manual)

Para cada certidão manual, o botão de "Abrir Portal" (👁️) deve abrir a URL correta:

| Certidão | URL Esperada |
|---|---|
| CND Federal | https://cav.receita.fazenda.gov.br |
| CNDT/TST | https://cndt-certidao.tst.jus.br/gerarCertidao.faces |
| CRF/FGTS | https://consulta-crf.caixa.gov.br/consultacrf/pages/consultaEmpregador.jsf |
| CGU Correcional | https://certidoes.cgu.gov.br/ |
| BrasilAPI | https://brasilapi.com.br/ |

---

## 8. Resumo: O que funciona automaticamente vs manual

| Fonte | Busca Automática | Retorna | Custo |
|---|---|---|---|
| **CGU Certidão Correcional** | ✅ SIM | JSON (CEIS+CNEP+CEPIM+CGU-PJ+ePAD) | Grátis |
| **BrasilAPI CNPJ** | ✅ SIM | JSON (situação, sócios, CNAE, Simples) | Grátis |
| **Portal Transparência API** | ✅ SIM (com chave) | JSON (CEIS/CNEP/CEPIM individual) | Grátis (cadastro email) |
| CND Federal (Receita) | ❌ Manual | URL morta, migrou para e-CAC | — |
| CNDT (TST) | ❌ Manual | Captcha próprio (imagem) | — |
| CRF/FGTS (Caixa) | ❌ Manual | ShieldSquare anti-bot | — |
| CND Estadual (SEFAZ) | ❌ Manual | reCAPTCHA v2 / hCaptcha | — |
| CND Municipal | ❌ Manual | Varia por município | — |

---

## 9. Bugs Corrigidos Nesta Implementação

1. **Scheduler crashava** ao criar `Alerta` com `tipo='prazo'` (não existe no Enum) e sem `edital_id` (NOT NULL) → Corrigido: usa apenas `Notificação`
2. **Campo `numero_certidao` inexistente** no scheduler → Corrigido: usa `cert.numero`
3. **Scheduler duplicado** em debug mode → Corrigido: check `WERKZEUG_RUN_MAIN`
4. **Portal da Transparência AJAX bloqueado** por AWS WAF → Substituído por CGU API e API oficial (com chave)
5. **CND Federal URL morta** (404) → Corrigido: orienta para e-CAC
6. **FGTS "sem captcha"** era falso → Corrigido: ShieldSquare detectado, marca como manual
7. **Viewer de documentos** erro "Token não fornecido" → Corrigido: usa fetch+blob com Authorization header
8. **Certidões não apareciam ao carregar** → Corrigido: endpoint sincronizar-fontes chamado no load
