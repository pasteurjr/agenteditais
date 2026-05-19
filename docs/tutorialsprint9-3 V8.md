# TUTORIAL DE VALIDAÇÃO MANUAL — SPRINT 9 — CONJUNTO 3 V8 (Vita-Sense)

**Data:** 2026-05-18
**Empresa:** Vita-Sense Soluções Médicas Ltda. (CNPJ 49.825.713/0001-04 — IE 901.234.567.0098)
**Dados de apoio:** `docs/dadossprint9-3 V8.md`
**Referencia:** `docs/CASOS DE USO SPRINT9.md`
**Pré-requisito:** `tutorialsprint8-3 V8.md`
**UCs cobertos:** 12 (LA01-LA06, SC01-SC05, HC01)
**Publico:** validador humano acompanhando roteiro passo-a-passo

> **CHANGELOG V8** — Conjunto 3 encadeado na cadeia Vita-Sense S1→S8 V8; estrutura de UCs idêntica ao molde validado; só a identidade adaptada; reflete estado pós-correções Arnaldo + melhorias UX.

---

## Credenciais e Login

| Campo | Valor |
|---|---|
| URL | http://localhost:5180 |
| Email | validaargus@valida.com.br |
| Senha | 123456 |
| Empresa | Vita-Sense Soluções Médicas Ltda. |
| Perfil | Superusuário |

### Fluxo de login
1. Abrir `http://localhost:5180`
2. Preencher email/senha e clicar **Entrar**
3. Na tela de selecao, clicar em **Vita-Sense Soluções Médicas Ltda.**
4. Aguardar dashboard carregar

---

## Pre-requisitos

- Backend rodando na porta **5007**
- Frontend rodando na porta **5180**
- Cadeia Vita-Sense S1→S8 V8 executada (pré-requisito: `tutorialsprint8-3 V8.md`)
- Seeds executadas:
  - `python backend/seeds/sprint5_seed.py` (dados base)
  - `python backend/seeds/sprint6_seed.py` (dados Sprint 6)
  - `python backend/seeds/sprint7_seed.py` (dados Sprint 7)
  - `python backend/seeds/sprint8_seed.py` (dados Sprint 8)
  - `python backend/seeds/sprint9_seed.py` (dados Sprint 9)

---

## Indice

1. [FASE 1 — Lances em Tempo Real (UC-LA01 a UC-LA06)](#fase-1)
2. [FASE 2 — Indicadores Avancados (UC-SC01 a UC-SC05)](#fase-2)
3. [FASE 3 — Health Check (UC-HC01)](#fase-3)

---

## FASE 1 — Lances em Tempo Real <a id="fase-1"></a>

### UC-LA03 — Sala Virtual de Disputa (LancesPage)

1. Sidebar → **Disputa Lances** (secao Fluxo Comercial)
2. Verificar secao **"Pregoes Hoje"** com tabela de sessoes:
   - Verificar texto "Acompanhamento de Lances" presente na pagina
   - Verificar sessoes listadas com status (ativa/encerrada)
3. Verificar secao **stat cards** com indicadores:
   - **Vitorias** — contagem de sessoes com resultado=vitoria (esperado: 1)
   - **Derrotas** — contagem de sessoes com resultado=derrota (esperado: 1)
   - **Taxa de Sucesso** — percentual de vitorias (esperado: 50%)
4. Localizar pregao com status **"ativa"** (sessao #1 do seed)
5. Verificar botao **"Entrar na Sala"** ou **"Abrir Portal"** visivel na linha da sessao ativa
6. Clicar **"Entrar na Sala"** na sessao ativa
7. Verificar que a sala virtual carrega com:
   - **Cabecalho** exibindo dados do edital vinculado
   - Valores das Camadas: Custo(A)=R$340 | Inicial(D)=R$495 | Minimo(E)=R$385
   - Margem minima: 13.24%
   - Perfil: badge "quero_ganhar" ou "nao_ganhei_minimo"
   - Faixa de disputa: R$385 — R$495
8. Verificar **Timer Card**:
   - Cronometro visivel (formato MM:SS)
   - Cores: verde (>1min), amarelo (30s-1min), vermelho (<30s)
9. Verificar **Historico de Lances**:
   - DataTable com lances da sessao (12 lances para sessao ativa)
   - Colunas: Rodada, Empresa, Valor, Hora, Posicao
   - Nossos lances destacados em azul
10. Verificar **Card Posicao Atual**:
    - Posicao atual (1o/2o/3o)
    - Valor do nosso ultimo lance
    - Distancia para o lider
    - Margem sobre custo
11. Verificar **Card Envio de Lance**:
    - Input para valor do lance
    - Label de margem (atualiza em tempo real ao digitar)
    - Checkbox "Confirmar" (trava de seguranca)
    - Botao "Enviar Lance"
12. Clicar **"Sair da Sala"** para retornar a listagem

### UC-LA02 — Sugestao de Lance em Tempo Real

13. Dentro da sala virtual (voltar via "Entrar na Sala"):
14. Verificar **Card "Sugestao da IA"** presente:
    - Valor sugerido em destaque (R$)
    - Margem sobre custo (%)
    - Posicao estimada (1o/2o/3o)
    - Confianca: badge (Alta verde / Media amarelo / Baixa vermelho)
    - Justificativa: texto curto
15. Verificar botoes de acao:
    - **"Aceitar e Enviar"** — envia lance sugerido
    - **"Ajustar"** — abre input para modificar valor
    - **"Ignorar"** — descarta sugestao
16. Se lance sugerido < custo (R$340): verificar **banner vermelho** "Lance abaixo do custo!"
17. Se lance sugerido == lance_minimo (R$385): verificar **banner amarelo** "Limite minimo atingido"

### UC-LA04 — Lance Aberto + Fechado

18. Na listagem de pregoes, verificar sessao #3 (modalidade aberto_fechado):
    - Badge de modalidade visivel: "Aberto + Fechado" ou "A+F"
19. Se sessao encerrada: verificar dados de resultado (derrota, posicao 3o)
20. **Verificacao da logica de fases:**
    - Sessoes aberto_fechado suportam duas fases: aberta (timer 2min) e fechada (timer 5min)
    - Na fase fechada, historico congela e card de lance fechado substitui o envio normal

### UC-LA01 — Simulador Deterministico (PrecificacaoPage)

21. Sidebar → **Precificacao** (secao Fluxo Comercial)
22. Selecionar edital + item com Camadas A-E configuradas (item do produto-chave **Ventilador Pulmonar Dräger Savina 300** — SKU DRG-SVN300-BR)
23. Navegar para tab **"Estrategia"**
24. Verificar secao existente de **Cenarios** (Sprint 3):
    - Perfil competitivo (quero_ganhar / nao_ganhei_minimo)
    - 3 cenarios: Target / Medio / Agressivo
25. **NOVO:** Abaixo dos cenarios, verificar secao **"Simulador Deterministico"**:
    - Form com parametros:
      - Numero de Rodadas (default: 10, 3-30)
      - Tipo de Decremento (fixo_reais / percentual_ultimo)
      - Valor do Decremento (R$ ou %)
      - Concorrentes Simulados (1-5, default: 3)
      - Perfil (pre-preenchido do EstrategiaEdital)
    - Botao **"Simular"**
26. Clicar **"Simular"** com parametros default
27. Verificar resultado da simulacao:
    - Tabela de rodadas: Rodada | Nosso Lance | Concorrente 1..N | Posicao | Margem
    - Stat cards: Resultado Final, Margem Final, Rodada Decisiva

### UC-LA05 — Deteccao de Abertura de Sessao (MonitoriaPage)

28. Sidebar → **Monitoria** (secao Monitoramento)
29. Verificar dashboard com monitoramentos existentes
30. Verificar monitoramento tipo **"sessao_pregao"** criado pelo seed:
    - Badge **"Sessao"** visivel (diferente de monitoramentos PNCP)
    - Termo: "Sessao de Pregao — Reagentes Hematologia"
    - Status: Ativo
31. Verificar botao **"Monitorar Sessao de Pregao"** no dashboard
32. Clicar botao para abrir modal de configuracao:
    - Select Edital (lista editais Vita-Sense)
    - DatePicker (data da sessao)
    - TimeInput (hora)
    - Select Portal (PNCP default)
    - Checkboxes: "Ativar sala virtual auto", "Notificar por email"
33. Verificar botoes **"Ativar Monitoramento"** e **"Cancelar"**
34. Fechar modal sem criar (para nao duplicar dados do seed)

### UC-LA06 — Robo de Lances

35. Voltar a sala virtual (Disputa Lances → Entrar na Sala na sessao ativa)
36. Verificar **Card "Robo de Lances"** presente:
    - Toggle "Ativar Robo"
    - Se AUTO_BID_ENABLED=false (default): toggle desabilitado com banner informativo
37. **Teste com robo desabilitado:**
    - Verificar banner: "Envio automatico desabilitado neste ambiente"
    - Toggle nao permite ativacao
38. **Se AUTO_BID_ENABLED=true:**
    - Ativar toggle
    - Verificar modal de configuracao:
      - Custo Base (A): R$ 340,00 (readonly)
      - Lance Inicial (D): R$ 495,00 (readonly)
      - Lance Minimo (E): R$ 385,00 (readonly)
      - Margem Minima: 13.24% (readonly)
      - Perfil: quero_ganhar (readonly)
      - Modo de Decremento: fixo_reais / percentual_ultimo
      - Valor do Decremento
      - Max lances: 20
    - Card de status: ATIVO/PAUSADO/PARADO, lances X/20, ultimo lance, margem
    - Botoes: Pausar, Parar

---

## FASE 2 — Indicadores Avancados <a id="fase-2"></a>

### UC-SC01 — Score de Competitividade (PrecificacaoPage + CaptacaoPage)

39. Sidebar → **Precificacao** → tab **"Estrategia"**
40. **NOVO:** Verificar **Card "Score de Competitividade"** na tab Estrategia:
    - Gauge visual 0-100 com cores: Verde(>=70) / Amarelo(40-69) / Vermelho(<40)
    - Breakdown de 4 fatores:
      - Historico similar (30%)
      - Posicao de preco (30%)
      - Concorrencia (20%)
      - Perfil orgao (20%)
    - Se bootstrap PNCP: badge "Estimativa PNCP"
41. Sidebar → **Captacao** (secao Fluxo Comercial)
42. **NOVO:** Verificar coluna **"Competitividade"** na tabela de editais:
    - Badge colorido com score: Alta(verde) / Media(amarelo) / Baixa(vermelho) / N/D(cinza)
    - Verificar que editais com produtos vinculados e precos configurados mostram score
    - Editais sem configuracao mostram "N/D"

### UC-SC02 — Score de Qualidade Concorrentes (ConcorrenciaPage)

43. Sidebar → **Concorrencia** (secao Analise)
44. Verificar texto "Concorr" presente na pagina
45. **NOVO:** Verificar coluna **"Qualidade"** na tabela de concorrentes:
    - Badge colorido: Alta(>=70, verde) / Media(40-69, amarelo) / Baixa(<40, vermelho)
    - Concorrentes com desclassificacao do seed: score ~90-95 (Alta)
    - Concorrentes sem desclassificacao: score 100 (Alta)
46. **NOVO:** Verificar **Card "Qualidade Media do Orgao"** acima da tabela:
    - Media de qualidade de todos os concorrentes
    - Badge indicativo (Orgao competitivo / Oportunidade)
47. Clicar em um concorrente com desclassificacao:
    - Verificar detalhe expandido com:
      - Desclassificacoes: X vezes
      - Motivo: "Documentacao incompleta"
      - Historico de participacoes

### UC-SC03 — Score Numerico de Recurso (RecursosPage)

48. Sidebar → **Recursos** (secao Analise)
49. Verificar texto "Recurso" presente na pagina
50. **NOVO:** Verificar **Card "Score de Recurso"** com:
    - Gauge circular 0-100
    - Cores: Verde(>=70) / Amarelo(30-69) / Vermelho(<30)
    - Badge de recomendacao:
      - >=70: "Recurso Recomendado" (verde)
      - 30-69: "Inconclusivo" (amarelo)
      - <30: "Nao Recomendado" (vermelho)
    - Breakdown dos 4 fatores:
      - Desvios tecnicos (40%)
      - Historico empresa (20%)
      - Historico orgao (25%)
      - Fundamento legal (15%)

### UC-SC04 — Tempo Medio do 1o Empenho (ContratadoRealizadoPage)

51. Sidebar → **Contratado** (secao Pos-Contrato)
52. Verificar texto "Contratado" presente na pagina
53. **NOVO:** Verificar **Stat Card "Tempo Medio do 1o Empenho"** no grid de KPIs:
    - Valor em dias (media global)
    - Badge: Rapido(<30d verde) / Normal(30-60d amarelo) / Lento(>60d vermelho)
54. **NOVO:** Verificar **DataTable "Tempo por Orgao"**:
    - Colunas: Orgao, Tempo medio (dias), Qtd contratos, Badge
    - Dados agrupados por orgao
55. **NOVO:** Verificar coluna **"1o Empenho (dias)"** na tabela de contratos:
    - Dias entre data_assinatura e primeiro empenho
    - Contratos sem empenho: "—" ou "Sem empenho"

### UC-SC05 — DRE do Contrato (ContratadoRealizadoPage + PrecificacaoPage)

56. Na mesma pagina (Contratado), verificar coluna **"Margem DRE"** na tabela de contratos:
    - Badge de margem: >20% verde / 10-20% amarelo / <10% vermelho (RN-NEW-18)
57. Clicar em um contrato com dados completos para ver detalhe:
58. **NOVO:** Verificar **Card "DRE do Contrato"** no detalhe:
    - Linhas do DRE:
      - Receita Bruta
      - (-) Impostos
      - = Receita Liquida
      - (-) Custos (custo_base_final * volume)
      - (-) Despesas Operacionais
      - = Resultado Operacional
      - Margem (%)
    - Badge de atratividade (verde/amarelo/vermelho)
59. Sidebar → **Precificacao** → selecionar edital
60. **NOVO:** Verificar botao **"Simular DRE"**:
    - Clicar para ver resultado de DRE simulado (pre-contrato)
    - Mesma estrutura de linhas do DRE
    - Usa PrecoCamada para calculos

---

## FASE 3 — Health Check <a id="fase-3"></a>

### UC-HC01 — Health Check do Sistema

61. **Via navegador** (nao precisa estar logado):
    - Acessar `http://localhost:5007/api/health`
    - Verificar resposta JSON:
      - `status`: "healthy" ou "degraded"
      - `version`: "9.0.0"
      - `services`: array com 7 servicos
      - `uptime_seconds`: numero positivo
      - `timestamp`: data/hora atual
62. Verificar cada servico no array `services`:
    - database: status, latency_ms, message
    - pncp: status, latency_ms
    - deepseek: status, latency_ms
    - brave: status, latency_ms
    - smtp: status, latency_ms
    - cache: status
    - scheduler: status
63. Verificar HTTP status:
    - 200 se status = healthy ou degraded
    - 503 se status = unhealthy (ex: database down)
64. **Via RecursosPage** (opcional): verificar card de Health Check com status dots

---

## Resumo de Validacao

| # | UC | Pagina | Verificacao principal | Dados esperados |
|---|---|---|---|---|
| 1 | LA03 | LancesPage | Sala virtual com cabecalho, timer, lances, envio | 3 sessoes, 30 lances, Camadas A-F |
| 2 | LA02 | LancesPage | Card sugestao IA com valor, margem, confianca | Sugestao baseada em perfil + Camadas |
| 3 | LA04 | LancesPage | Badge modalidade aberto/aberto_fechado | Sessao #3 com modalidade aberto_fechado |
| 4 | LA01 | PrecificacaoPage | Simulador deterministico com tabela e stats | Parametros + resultado rodadas |
| 5 | LA05 | MonitoriaPage | Monitoramento tipo sessao_pregao + badge | 1 monitoramento no seed |
| 6 | LA06 | LancesPage | Robo de lances (desabilitado ou com config) | AUTO_BID_ENABLED, max 20 lances |
| 7 | SC01 | Precificacao+Captacao | Score Competitividade 0-100 + 4 fatores | Gauge + coluna na captacao |
| 8 | SC02 | ConcorrenciaPage | Coluna Qualidade + card orgao | 5 concorrentes, scores 90-100 |
| 9 | SC03 | RecursosPage | Score Recurso 0-100 + recomendacao | Gauge + 4 fatores |
| 10 | SC04 | ContratadoRealizadoPage | Tempo Medio Empenho + tabela orgao | Media global + distribuicao |
| 11 | SC05 | ContratadoRealizadoPage | DRE + Margem badge + simular | Linhas DRE + badge cores |
| 12 | HC01 | Browser/API | GET /api/health → 200 + 7 servicos | version=9.0.0, services=7 |
