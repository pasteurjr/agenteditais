# TESTEPAGINA9 - VALIDACAO: Aderencias Detalhadas (7 dimensoes)

**Pagina:** 9 do WORKFLOW SISTEMA.pdf
**Modulo:** ValidacaoPage.tsx (mesma pagina da 8, foco nas abas Objetiva e Analitica)
**Rota:** validacao (Fluxo Comercial > Validacao)

---

## CONTEXTO DA PAGINA 9

A etapa de validacao deve ser pautada pelas aderencias / Scores indicados abaixo:

a. Aderencia / Riscos Tecnica / Portfolio:
   A IA deve ressaltar os trechos do edital que trazem riscos de aderencia tecnica vis a vis as caracteristicas tecnicas do portfolio. Identificacao de itens intrusos; Necessidades de complementacao de portfolio; Portfolio familia ou individual; etc.

b. Aderencia / Riscos Documental:
   Certidoes vencidas, detalhes sobre balancos, certidoes vencidas, registros requeridos, etc. Se o documento solicitado for muito inusitado, entao eh um edital candidato a ser impugnado, pois os documentos sao previstos na lei de licitacoes.

c. Aderencia / Riscos Juridicos:
   Alta recorrencia de aditivos, historico de acoes contra empresas, aparencia de edital direcionado, pregoeiro rigoroso, etc.

d. Aderencia / Riscos de Logistica:
   Distancia para prestar a assistencia Tecnica, etc;

e. Aderencia / Riscos Comerciais:
   Informacoes relevantes sobre precos, precos predatorios, historicos de atrasos de faturamentos, margem impactada devido a frequencia de entrega ou custo de servir, historico de atrasos de pagamentos, Concorrente dominante identificado, etc.

f. Indicar sobre o tipo de empresa pode participar (micro, lucro presumido, etc.):
   O edital pode ser feito para cada empresa do grupo, aderente ao edital.

g. Indicar sobre o tipo de empresa pode participar (micro, lucro presumido, etc.):
   Repetido no workflow - mesma funcionalidade

---

## TESTES

### T1: Tab Objetiva - Aderencia Tecnica Detalhada (a)
**Acao:** Selecionar edital, ir para tab "Objetiva"
**Verificar:**
- Secao "Aderencia Tecnica Detalhada" visivel
- Icone Target
- Se scores calculados: mostra sub-scores tecnicos (ScoreBar por item)
- Se nao: mostra botao "Calcular Scores"

### T2: Tab Objetiva - Certificacoes
**Acao:** Verificar secao Certificacoes na tab Objetiva
**Verificar:**
- Secao "Certificacoes" com icone Shield
- Lista de certificacoes com StatusBadge (OK/Pendente/Vencida)
- Cada item tem nome e status

### T3: Tab Objetiva - Checklist Documental (b)
**Acao:** Verificar secao Checklist Documental
**Verificar:**
- Secao "Checklist Documental" com icone ClipboardCheck
- Tabela com colunas: Documento, Status, Validade
- Status badges: OK, Vencido, Faltando, Ajustavel

### T4: Tab Objetiva - Mapa Logistico (d)
**Acao:** Verificar secao Mapa Logistico
**Verificar:**
- Secao "Mapa Logistico" com icone Target
- Mostra UF do Edital e UF da Empresa (SP)
- Badge de Distancia: Proximo/Medio/Distante
- Entrega Estimada em dias

### T5: Tab Objetiva - Analise de Lote (itens intrusos)
**Acao:** Verificar secao Analise de Lote
**Verificar:**
- Secao "Analise de Lote" com contagem de itens
- Barra visual com segmentos (aderente/intruso)
- Legenda: Aderente (X) + Item Intruso (Y)

### T6: Tab Analitica - Pipeline de Riscos (c)
**Acao:** Ir para tab "Analitica"
**Verificar:**
- Secao "Pipeline de Riscos"
- Sub-secao "Modalidade e Risco" com badges
- Sub-secao "Flags Juridicos" com badges
- Badge "Pregao Eletronico" e "Faturamento 45 dias"

### T7: Tab Analitica - Fatal Flaws
**Acao:** Verificar secao Fatal Flaws
**Verificar:**
- Se existem fatal flaws: card vermelho com lista
- Cada flaw tem icone AlertCircle
- Nota: "O sistema identificou estes problemas criticos antes da leitura humana"

### T8: Tab Analitica - Reputacao do Orgao (c)
**Acao:** Verificar secao Reputacao do Orgao
**Verificar:**
- Secao com nome do orgao
- Grid com 3 itens: Pregoeiro, Pagamento, Historico
- Valores preenchidos (mesmo que defaults)

### T9: Tab Analitica - Alerta de Recorrencia
**Acao:** Verificar se existe alerta de recorrencia
**Verificar:**
- Se editais semelhantes perdidos >= 2: card "Alerta de Recorrencia" visivel
- Texto: "Editais semelhantes foram perdidos X vezes por motivos recorrentes"

### T10: Tab Analitica - Aderencia Trecho-a-Trecho (a)
**Acao:** Verificar tabela de aderencia trecho-a-trecho
**Verificar:**
- Secao "Aderencia Tecnica Trecho-a-Trecho"
- Tabela com colunas: Trecho do Edital, Aderencia (ScoreBadge), Trecho do Portfolio
- Traducao em linguagem natural do edital vs portfolio

### T11: Tab Analitica - Aderencia Comercial (e)
**Acao:** Verificar que score comercial esta no Score Dashboard
**Verificar:**
- Score bar "Atratividade Comercial" presente no dashboard
- Score bar "Risco Juridico" presente (c)
- Score bar "Viabilidade Logistica" presente (d)

### T12: API - POST /api/editais/{id}/scores-validacao
**Acao:** Chamar endpoint de calculo de scores
**Verificar:**
- HTTP 200
- Retorna scores com 6 dimensoes: tecnico, documental, complexidade, juridico, logistico, comercial
- Retorna decisao_ia: GO/NO-GO/CONDICIONAL
- Retorna justificativa_ia

### T13: Screenshots das tabs Objetiva e Analitica completas
