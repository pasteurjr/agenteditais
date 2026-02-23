# TESTEPAGINA10 - VALIDACAO: Processo Amanda + Tab Cognitiva

**Pagina:** 10 do WORKFLOW SISTEMA.pdf
**Modulo:** ValidacaoPage.tsx (mesma pagina da 8-9, foco no Processo Amanda e tab Cognitiva)
**Rota:** validacao (Fluxo Comercial > Validacao)

---

## CONTEXTO DA PAGINA 10

### Processo Amanda
a. Leitura do Edital:
   Entende o que o edital pede para iniciar a montagem das pastas:
   1. Pasta de documentos da empresa - Atrela o documento com o item do edital que faz referencia ao mesmo;
   2. Pasta de documentos fiscais e certidoes - Atrela o documento com o item do edital que faz referencia ao mesmo;
   3. Pasta de documentos de Qualificacao Tecnica - Atrela o documento com o item do edital que faz referencia ao mesmo (se pede registro da anvisa, eh relacionado (para cada produto) o numero do registro;

b. Certidoes vencidas, detalhes sobre balancos, certidoes vencidas, registros requeridos, etc. Se o documento solicitado for muito inusitado, entao eh um edital candidato a ser impugnado.

c. Alta recorrencia de aditivos, historico de acoes contra empresas, aparencia de edital direcionado, pregoeiro rigoroso, etc.

d. Distancia para prestar a assistencia Tecnica, etc;

e. Informacoes relevantes sobre precos, precos predatorios, historicos de atrasos de faturamentos, margem impactada, Concorrente dominante, etc.

f. O que for definido aqui, vai para a tela do CRM...

### Elementos visuais da pagina:
- Aderencia Tecnica e Traducao em Linguagem Natural
- Analise de Item 3.1: Trecho do Edital | Aderencia: 82% (Parcialmente Aderente) | Trecho do Portfolio
- Resumo da IA
- O Orgao (Reputacao): Pregoeiro rigoroso, Bom pagador, Historico de problemas politicos
- Memoria Corporativa Permanente
- Alerta de Recorrencia: Editais semelhantes a este foram recusados 4 vezes por margem insuficiente

---

## TESTES

### T1: Processo Amanda - Card visivel com titulo
**Acao:** Selecionar edital, scroll ate o card Processo Amanda
**Verificar:**
- Card "Processo Amanda - Documentacao" visivel
- Icone FolderOpen

### T2: Processo Amanda - 3 Pastas de documentos
**Acao:** Verificar as 3 pastas dentro do card
**Verificar:**
- Pasta 1: "Documentos da Empresa" (icone azul)
  - Itens: Contrato Social, Procuracao, Atestado Capacidade Tecnica
- Pasta 2: "Certidoes e Fiscal" (icone amarelo)
  - Itens: CND Federal, FGTS-CRF, Certidao Trabalhista, Balanco Patrimonial
- Pasta 3: "Qualificacao Tecnica" (icone verde)
  - Itens: Registro ANVISA, Certificado BPF, Laudo Tecnico

### T3: Processo Amanda - StatusBadges por documento
**Acao:** Verificar badges de status dos documentos
**Verificar:**
- Cada item tem um StatusBadge (Disponivel/Faltante/OK/Vencida)
- Total de status badges >= 10
- Documentos atrelados ao item do edital

### T4: Tab Cognitiva - Resumo Gerado pela IA
**Acao:** Ir para tab "Cognitiva"
**Verificar:**
- Secao "Resumo Gerado pela IA" visivel
- Botao "Gerar Resumo" ou "Regerar Resumo" presente
- Se resumo existe: texto do resumo visivel

### T5: Tab Cognitiva - Historico de Editais Semelhantes
**Acao:** Verificar secao Historico
**Verificar:**
- Secao "Historico de Editais Semelhantes" visivel
- Se existe historico: lista com StatusBadge (Vencida/Perdida/Cancelada) + nome + motivo
- Se nao: mensagem "Nenhum edital semelhante encontrado"

### T6: Tab Cognitiva - Pergunte a IA sobre este Edital
**Acao:** Verificar secao de perguntas
**Verificar:**
- Secao "Pergunte a IA sobre este Edital" visivel
- Campo TextInput com placeholder "Ex: Qual o prazo de entrega?"
- Botao "Perguntar" presente

### T7: Aderencia Tecnica e Traducao em Linguagem Natural
**Acao:** Verificar tabela de aderencia trecho-a-trecho na tab Analitica
**Verificar:**
- Tabela "Aderencia Tecnica Trecho-a-Trecho"
- Colunas: Trecho do Edital | Aderencia (ScoreBadge com %) | Trecho do Portfolio
- Traducao em linguagem natural dos trechos

### T8: O Orgao (Reputacao)
**Acao:** Verificar card Reputacao do Orgao na tab Analitica
**Verificar:**
- Card com nome do orgao
- Grid: Pregoeiro (rigoroso/moderado/flexivel), Pagamento (bom/regular/mau pagador), Historico
- "Memoria Corporativa Permanente" mencionada

### T9: Alerta de Recorrencia
**Acao:** Verificar alerta de recorrencia
**Verificar:**
- Se editais semelhantes perdidos >= 2: card alerta visivel
- Mostra contagem e motivos
- Texto sobre margem insuficiente ou motivos recorrentes

### T10: Decisao GO/NO-GO da IA
**Acao:** Verificar banner de decisao da IA na tab Objetiva
**Verificar:**
- Se scores calculados: banner "Recomendacao da IA: GO/NO-GO/CONDICIONAL"
- Icone correspondente (CheckCircle para GO, XCircle para NO-GO, AlertTriangle para CONDICIONAL)

### T11: Screenshots completos de todas as secoes
**Acao:** Capturar screenshots:
- Processo Amanda completo
- Tab Cognitiva completa
- Aderencia trecho-a-trecho
- Reputacao do Orgao
