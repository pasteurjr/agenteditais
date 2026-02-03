# Plano Fase 2 - Agentes e Prompts do Sistema de Editais

## Arquitetura de Agentes (Documento 07)

O sistema prevê **9 agentes especializados** organizados em **5 crews** (orquestrações):

| Agente | ID | Função | Status |
|--------|-----|--------|--------|
| Portfolio Manager | AG-01 | Processar manuais, extrair specs | ✅ Implementado (parcial) |
| Document Parser | AG-02 | Parsing de editais | ✅ Implementado (parcial) |
| Classification Agent | AG-03 | Classificar editais por categoria | 🔴 Pendente |
| Compliance Analyzer | AG-04 | Calcular scores de aderência | ✅ Implementado (parcial) |
| Market Intelligence | AG-05 | Análise de preços e concorrentes | 🔴 Pendente |
| Proposal Generator | AG-06 | Gerar texto técnico da proposta | ✅ Implementado |
| Bidding Robot | AG-07 | Sugestão de lances em pregão | 🔴 Pendente (opcional) |
| Audit Agent | AG-08 | Auditar propostas, gerar recursos | 🔴 Pendente |
| Performance Monitor | AG-09 | Diagnóstico e aprendizado | 🔴 Pendente |

---

## 1. CREW: PortfolioCrew (AG-01)

### Funcionalidade Atual
- Upload de PDF/DOCX
- Extração de especificações técnicas
- Cadastro do produto

### Funcionalidade Pendente
- Geração de embeddings vetoriais
- Sugestão de campos faltantes
- Score de completude do cadastro

### Prompts do Usuário → Tarefas dos Agentes

| # | Prompt do Usuário | Intenção | Tarefa do Agente | Resposta Esperada |
|---|-------------------|----------|------------------|-------------------|
| 1.1 | "Cadastre este manual como produto Sysmex XN-1000" | `arquivo_cadastrar` | `processar_manual_completo` | "✅ Produto 'Sysmex XN-1000' cadastrado com sucesso! Extraí 45 especificações técnicas. Score de completude: 87%. **Sugestões**: Adicione informações de peso e dimensões para melhorar aderência em editais de equipamentos." |
| 1.2 | "Quais especificações faltam no produto XN-1000?" | `verificar_completude` | `analisar_completude_produto` | "📋 **Análise do Produto XN-1000:**\n- Specs cadastradas: 45\n- Score completude: 87%\n- **Campos faltantes sugeridos:**\n  1. Peso (kg) - Alta prioridade\n  2. Dimensões (LxAxP) - Alta prioridade\n  3. Tensão de alimentação - Média prioridade\n  4. Consumo elétrico (W) - Baixa prioridade" |
| 1.3 | "Atualize as specs do produto XN-1000 com peso 55kg" | `atualizar_produto` | `atualizar_especificacoes` | "✅ Especificação adicionada: Peso = 55 kg. Score de completude atualizado: 91%." |
| 1.4 | "Reprocesse o manual do produto X" | `reprocessar_produto` | `reprocessar_manual` | "🔄 Reprocessando manual... Encontradas 3 novas especificações que não estavam cadastradas. Atualizando produto..." |
| 1.5 | "Busque na web o datasheet do Sysmex XN-1000" | `buscar_web` | `buscar_datasheet_web` | "🔍 Encontrei 3 resultados:\n1. [Datasheet oficial Sysmex](url) - PDF 2.3MB\n2. [Manual do usuário](url) - PDF 15MB\nDeseja que eu baixe algum deles?" |

---

## 2. CREW: DiscoveryCrew (AG-02 + AG-03)

### Funcionalidade Atual
- Busca de editais via API PNCP
- Scraper básico
- Parsing de requisitos

### Funcionalidade Pendente
- Classificação automática por categoria (Comodato, Venda, Aluguel, etc.)
- Extração de datas (abertura, impugnação, recursos)
- Score de pré-qualificação
- Parsing de múltiplos anexos

### Prompts do Usuário → Tarefas dos Agentes

| # | Prompt do Usuário | Intenção | Tarefa do Agente | Resposta Esperada |
|---|-------------------|----------|------------------|-------------------|
| 2.1 | "Busque editais de equipamentos laboratoriais" | `buscar_editais` | `buscar_editais_pncp` + `parsing_completo_edital` | "🔍 Encontrei 15 editais no PNCP:\n\n**1. PE-001/2026 - Hospital das Clínicas**\n- Objeto: Aquisição de analisadores hematológicos\n- Categoria: **Venda de Equipamentos** (confiança 92%)\n- Data abertura: 15/02/2026\n- Valor ref: R$ 450.000,00\n- Pré-qualificação: ✅ Aprovado (87%)\n\n**2. PE-002/2026 - FMUSP**\n- Objeto: Comodato de equipamentos com reagentes..." |
| 2.2 | "Classifique o edital PE-001/2026" | `classificar_edital` | `classificar_edital_ambiguo` | "📊 **Classificação do Edital PE-001/2026:**\n- **Categoria**: Comodato de Equipamentos com Reagentes\n- Confiança: 78% (classificado por IA)\n- **Justificativa**: O termo de referência menciona 'cessão de equipamentos' com 'obrigatoriedade de aquisição de reagentes' e 'manutenção pelo fornecedor', características típicas de comodato.\n- Keywords encontradas: comodato, cessão, reagentes, manutenção preventiva" |
| 2.3 | "Quais editais vencem esta semana?" | `consulta_mindsdb` | `consulta_analitica` | "📅 **Editais com abertura esta semana:**\n1. PE-001/2026 - Hospital das Clínicas - 05/02/2026 09:00\n2. PE-003/2026 - UNICAMP - 06/02/2026 14:00\n3. PE-007/2026 - UFMG - 07/02/2026 10:00\n\n⚠️ **Alerta**: PE-001 abre em 3 dias!" |
| 2.4 | "Extraia os requisitos técnicos do edital PE-001/2026" | `extrair_requisitos` | `parsing_completo_edital` | "📋 **Requisitos Técnicos do PE-001/2026:**\n\n**Obrigatórios:**\n1. Processamento mínimo: 100 amostras/hora\n2. Registro ANVISA válido\n3. Assistência técnica em até 24h\n\n**Desejáveis:**\n1. Sistema de backup integrado\n2. Interface em português\n\n**Documentais:**\n1. Atestado de capacidade técnica\n2. Certidões negativas de débito" |
| 2.5 | "Configure monitoramento automático para editais de hematologia" | `configurar_monitoramento` | `agendar_monitoramento` | "⏰ **Monitoramento Configurado:**\n- Termo: 'hematologia'\n- Fontes: PNCP, ComprasNet, BEC-SP\n- Frequência: A cada 4 horas\n- Alertas: Email + Push\n\nVocê será notificado quando novos editais forem encontrados." |
| 2.6 | "Quais são os tipos de editais que o sistema reconhece?" | `chat_livre` | - | "📊 **Categorias de Editais:**\n1. **Comodato de Equipamentos** - Cessão com obrigação de consumo\n2. **Aluguel com Reagentes** - Locação vinculada a insumos\n3. **Aluguel Simples** - Locação sem vínculo\n4. **Venda de Equipamentos** - Aquisição definitiva\n5. **Consumo de Reagentes** - Apenas insumos\n6. **Insumos Hospitalares** - Materiais hospitalares\n7. **Insumos Laboratoriais** - Materiais de laboratório" |

---

## 3. CREW: AnalysisCrew (AG-04 + AG-05)

### Funcionalidade Atual
- Score de aderência técnica básico
- Comparação requisito x especificação

### Funcionalidade Pendente
- Score de aderência comercial (distância, logística)
- Score de potencial de ganho
- Análise de gaps com sugestões
- Histórico de preços vencedores
- Lista de concorrentes frequentes
- Recomendação de faixa de preço

### Prompts do Usuário → Tarefas dos Agentes

| # | Prompt do Usuário | Intenção | Tarefa do Agente | Resposta Esperada |
|---|-------------------|----------|------------------|-------------------|
| 3.1 | "Calcule a aderência do Sysmex XN-1000 ao edital PE-001/2026" | `calcular_aderencia` | `analise_completa_aderencia` | "📊 **Análise de Aderência - XN-1000 x PE-001/2026:**\n\n**Scores:**\n- 🔧 Técnico: **92%** (Excelente)\n- 💼 Comercial: **78%** (Bom)\n- 🎯 Potencial de Ganho: **85%** (Alto)\n\n**Requisitos Técnicos:**\n✅ Processamento 100 amostras/h → XN-1000 faz 110/h\n✅ Registro ANVISA → Válido até 2028\n⚠️ Assistência 24h → Verificar cobertura na região\n\n**Gaps Identificados:**\n1. Distância ao órgão: 450km (impacta score comercial)\n2. Falta informação de backup no cadastro\n\n**Recomendação:** ✅ PARTICIPAR - Alta chance de vitória" |
| 3.2 | "Qual a recomendação de preço para o edital PE-001/2026?" | `recomendar_preco` | `inteligencia_precos_completa` | "💰 **Recomendação de Preço - PE-001/2026:**\n\n**Análise Histórica:**\n- Editais similares analisados: 12\n- Preço médio vencedor: R$ 385.000,00\n- Preço mínimo vencedor: R$ 342.000,00\n- Preço máximo vencedor: R$ 425.000,00\n\n**Recomendação:**\n- 💚 Preço Agressivo: R$ 360.000 (prob. ganho: 78%)\n- 💛 Preço Moderado: R$ 385.000 (prob. ganho: 65%)\n- 🔴 Preço Conservador: R$ 410.000 (prob. ganho: 42%)\n\n**Score de Competitividade:** 72%\n\n**Concorrentes Frequentes:**\n1. MedLab Equipamentos (ganhou 4 de 12)\n2. TechSaúde (ganhou 3 de 12)\n3. DiagnósticaBR (ganhou 2 de 12)" |
| 3.3 | "Quem são os principais concorrentes em editais de hematologia?" | `analisar_concorrentes` | `inteligencia_precos_completa` | "🏆 **Concorrentes em Hematologia (últimos 12 meses):**\n\n| Empresa | Participações | Vitórias | Taxa | Preço Médio |\n|---------|---------------|----------|------|-------------|\n| MedLab | 15 | 6 | 40% | R$ 372.000 |\n| TechSaúde | 12 | 4 | 33% | R$ 389.000 |\n| DiagnósticaBR | 10 | 3 | 30% | R$ 401.000 |\n| SuaEmpresa | 8 | 2 | 25% | R$ 395.000 |\n\n**Insights:**\n- MedLab pratica preços 5% abaixo da média\n- TechSaúde foca em editais de alta complexidade\n- Oportunidade: Editais de pequeno porte têm menos concorrência" |
| 3.4 | "Quais produtos têm aderência acima de 80% ao edital PE-001?" | `consulta_mindsdb` | `consulta_analitica` | "🎯 **Produtos com Alta Aderência ao PE-001/2026:**\n\n1. **Sysmex XN-1000** - Score: 92%\n   - Atende 18 de 20 requisitos\n   - Gap: assistência técnica regional\n\n2. **Mindray BC-6800** - Score: 85%\n   - Atende 17 de 20 requisitos\n   - Gap: velocidade processamento\n\n3. **ABX Pentra 80** - Score: 81%\n   - Atende 16 de 20 requisitos\n   - Gap: automação de calibração" |
| 3.5 | "Mostre o histórico de preços para equipamentos de hematologia" | `historico_precos` | `inteligencia_precos_completa` | "📈 **Histórico de Preços - Hematologia:**\n\n**Últimos 6 meses:**\n| Data | Edital | Órgão | Ref. | Vencedor | Δ% |\n|------|--------|-------|------|----------|----|\n| Jan/26 | PE-123 | HC-SP | 450k | 398k | -12% |\n| Dez/25 | PE-456 | UNICAMP | 480k | 425k | -11% |\n| Nov/25 | PE-789 | UFMG | 420k | 385k | -8% |\n\n**Tendência:** Preços vencedores ~10% abaixo da referência\n**Sazonalidade:** Pico de editais em Jan-Mar (início de exercício)" |

---

## 4. CREW: ProposalCrew (AG-06)

### Funcionalidade Atual
- Geração de proposta técnica
- 8 seções padrão
- Tabela comparativa de requisitos

### Funcionalidade Pendente
- Compilação automática de documentos (certidões, atestados)
- Montagem de arquivo ZIP/PDF final
- Planilha de preços automatizada
- Alertas de prazo (24h, 1h antes)

### Prompts do Usuário → Tarefas dos Agentes

| # | Prompt do Usuário | Intenção | Tarefa do Agente | Resposta Esperada |
|---|-------------------|----------|------------------|-------------------|
| 4.1 | "Gere uma proposta do Sysmex XN-1000 para o PE-001/2026 com preço R$ 380.000" | `gerar_proposta` | `gerar_texto_tecnico_proposta` | "📝 **Proposta Técnica Gerada:**\n\n**Edital:** PE-001/2026 - Hospital das Clínicas\n**Produto:** Sysmex XN-1000\n**Valor:** R$ 380.000,00\n\n---\n## 1. APRESENTAÇÃO DA EMPRESA\n[Texto gerado...]\n\n## 2. DESCRIÇÃO DO EQUIPAMENTO\n[Especificações técnicas...]\n\n## 3. ATENDIMENTO AOS REQUISITOS\n| Requisito | Exigido | Oferecido | Status |\n|-----------|---------|-----------|--------|\n| Processamento | 100/h | 110/h | ✅ |\n...\n\n---\n✅ Proposta salva! ID: PROP-2026-001\nDeseja que eu compile os documentos anexos?" |
| 4.2 | "Compile os documentos para a proposta PROP-2026-001" | `compilar_documentos` | `compilar_anexos_proposta` | "📎 **Compilação de Documentos - PROP-2026-001:**\n\n**Documentos do Repositório:**\n✅ Certidão Negativa Federal - Válida até 15/03/2026\n✅ Certidão FGTS - Válida até 28/02/2026\n✅ Atestado Capacidade Técnica - Hospital Albert Einstein\n⚠️ Alvará Sanitário - **VENCIDO** (renovar!)\n\n**Documentos do Produto:**\n✅ Registro ANVISA\n✅ Manual Técnico\n✅ Catálogo Comercial\n\n**Ação Necessária:** Renovar Alvará Sanitário antes de 15/02/2026" |
| 4.3 | "Monte o PDF final da proposta PROP-2026-001" | `montar_proposta_final` | `montar_arquivo_final` | "📦 **Proposta Finalizada:**\n\n✅ Arquivo gerado: `PROPOSTA_PE-001-2026_SYSMEX-XN1000.pdf`\n- Tamanho: 15.2 MB\n- Páginas: 48\n\n**Conteúdo:**\n1. Carta proposta (2 pág)\n2. Proposta técnica (12 pág)\n3. Documentos habilitação (20 pág)\n4. Catálogo do produto (14 pág)\n\n📥 [Baixar PDF](link)" |
| 4.4 | "Configure alertas para o edital PE-001/2026" | `configurar_alertas` | `agendar_alertas_edital` | "⏰ **Alertas Configurados para PE-001/2026:**\n\n- 📅 **3 dias antes** (12/02): Email de lembrete\n- 📅 **24 horas antes** (14/02 09:00): Email + Push\n- 📅 **1 hora antes** (15/02 08:00): Push urgente\n- 📅 **15 min antes** (15/02 08:45): Notificação final\n\n📲 Notificações serão enviadas para: usuario@empresa.com" |
| 4.5 | "Quais propostas tenho pendentes de envio?" | `listar_propostas` | `listar_propostas_pendentes` | "📋 **Propostas Pendentes:**\n\n| ID | Edital | Produto | Valor | Abertura | Status |\n|----|--------|---------|-------|----------|--------|\n| PROP-001 | PE-001/2026 | XN-1000 | 380k | 15/02 | ⚠️ Docs incompletos |\n| PROP-002 | PE-003/2026 | BC-6800 | 290k | 20/02 | ✅ Pronta |\n| PROP-003 | PE-007/2026 | XN-2000 | 520k | 25/02 | 🔄 Em elaboração |\n\n**Atenção:** PROP-001 precisa de Alvará Sanitário atualizado!" |

---

## 5. CREW: PostSubmissionCrew (AG-08 + AG-09)

### Funcionalidade Atual
- Nenhuma (100% pendente)

### Funcionalidade Pendente
- Auditoria de proposta vencedora
- Identificação de desvios técnicos
- Score de recurso (probabilidade de sucesso)
- Geração de laudo de contestação
- Diagnóstico de causas de perda
- Retroalimentação do sistema

### Prompts do Usuário → Tarefas dos Agentes

| # | Prompt do Usuário | Intenção | Tarefa do Agente | Resposta Esperada |
|---|-------------------|----------|------------------|-------------------|
| 5.1 | "Audite a proposta vencedora do edital PE-001/2026" | `auditar_proposta` | `auditoria_completa_recurso` | "🔍 **Auditoria - Proposta Vencedora PE-001/2026:**\n\n**Vencedor:** MedLab Equipamentos Ltda\n**Valor:** R$ 365.000,00\n**Equipamento:** Abbott Cell-Dyn Ruby\n\n**Desvios Identificados:**\n\n❌ **Desvio Crítico - Processamento:**\n- Exigido: 100 amostras/hora\n- Declarado: 90 amostras/hora\n- Evidência: Página 15 da proposta\n- Impacto: ALTO\n\n⚠️ **Desvio Menor - Assistência:**\n- Exigido: 24h\n- Declarado: 48h em finais de semana\n- Impacto: MÉDIO\n\n**Score de Recurso: 78%**\n\n✅ **Recomendação:** ENTRAR COM RECURSO\nDeseja que eu gere o laudo de contestação?" |
| 5.2 | "Gere o laudo de contestação para o PE-001/2026" | `gerar_laudo` | `auditoria_completa_recurso` | "📄 **Laudo de Contestação Gerado:**\n\n**Edital:** PE-001/2026\n**Recorrente:** Sua Empresa Ltda\n**Recorrido:** MedLab Equipamentos Ltda\n\n---\n**FUNDAMENTAÇÃO:**\n\n1. DO DESVIO TÉCNICO PRINCIPAL\nConforme item 5.2.1 do Termo de Referência, é exigido processamento mínimo de 100 amostras por hora. A proposta vencedora, em sua página 15, declara capacidade de apenas 90 amostras por hora, caracterizando descumprimento objetivo do edital.\n\n[Texto completo do laudo...]\n\n---\n📥 [Baixar DOCX](link)\n\n**Prazo para recurso:** Até 17/02/2026 18:00" |
| 5.3 | "Registre que perdemos o edital PE-001/2026 por preço" | `registrar_resultado` | `diagnostico_aprendizado_completo` | "📊 **Resultado Registrado - PE-001/2026:**\n\n**Resultado:** DERROTA\n**Causa Principal:** Preço\n**Nosso preço:** R$ 380.000,00\n**Preço vencedor:** R$ 365.000,00\n**Diferença:** R$ 15.000,00 (4,1%)\n\n**Diagnóstico:**\n- Nossa proposta estava 4,1% acima do vencedor\n- Tendência de mercado indica desconto médio de 10% sobre referência\n- Nosso desconto foi de apenas 6%\n\n**Aprendizados Aplicados:**\n- Ajustado modelo de preços para região SP\n- Faixa de preço para próximos editais similares: R$ 350-370k\n\n**Ações Sugeridas:**\n1. Revisar estrutura de custos\n2. Considerar parceria logística em SP para reduzir custo" |
| 5.4 | "Quais foram os motivos das nossas últimas derrotas?" | `analisar_perdas` | `diagnostico_aprendizado_completo` | "📈 **Análise de Derrotas (últimos 6 meses):**\n\n**Total:** 8 derrotas\n\n**Por Causa:**\n- 💰 Preço: 5 (62%)\n- 📋 Técnica: 2 (25%)\n- 📄 Documentação: 1 (13%)\n\n**Insights:**\n1. 80% das derrotas por preço foram para MedLab\n2. Desvio médio de preço: 5,8% acima do vencedor\n3. Derrotas técnicas foram em editais de alta complexidade\n\n**Recomendações:**\n1. Reduzir margem em 3% para editais competitivos\n2. Focar em editais de média complexidade (maior taxa de sucesso)\n3. Melhorar cadastro de specs para evitar gaps técnicos" |
| 5.5 | "Qual nossa taxa de vitória em editais de hematologia?" | `consulta_mindsdb` | `consulta_analitica` | "🏆 **Taxa de Vitória - Hematologia:**\n\n**Período:** Últimos 12 meses\n\n| Indicador | Valor |\n|-----------|-------|\n| Participações | 15 |\n| Vitórias | 5 |\n| Taxa | 33% |\n| Valor ganho | R$ 1.8M |\n| Valor perdido | R$ 3.2M |\n\n**Por Tipo de Edital:**\n- Venda: 40% (4 de 10)\n- Comodato: 20% (1 de 5)\n\n**Comparativo Mercado:**\n- Sua taxa: 33%\n- Média do setor: 28%\n- Você está **5% acima** da média! 🎉" |

---

## 6. Funcionalidades 100% Tradicionais (Sem Agentes IA)

Estas funcionalidades são implementadas com código tradicional, sem uso de agentes de IA:

| Funcionalidade | Intenção | Implementação |
|----------------|----------|---------------|
| Cadastrar produto (manual) | `cadastrar_produto` | CRUD Flask |
| Cadastrar edital (manual) | `cadastrar_edital` | CRUD Flask |
| Listar produtos | `listar_produtos` | SELECT + formatação |
| Listar editais | `listar_editais` | SELECT + formatação |
| Listar fontes | `listar_fontes` | SELECT + formatação |
| Cadastrar fonte | `cadastrar_fonte` | INSERT + validação |
| Excluir produto | `excluir_produto` | DELETE + confirmação |
| Excluir edital | `excluir_edital` | DELETE + confirmação |
| Salvar editais | `salvar_editais` | INSERT batch |
| Gerenciar CRM | `gerenciar_crm` | CRUD completo |
| Alertas e calendário | `gerenciar_alertas` | Scheduler + notificações |

---

## 7. Novas Intenções a Implementar (Fase 2)

Baseado no documento 07, as seguintes intenções precisam ser adicionadas ao sistema:

```python
PROMPT_CLASSIFICAR_INTENCAO_V2 = """
...
### NOVAS CATEGORIAS FASE 2:

20. **classificar_edital**: Classificar edital por categoria (comodato, venda, aluguel, etc.)
    Exemplos: "classifique o edital PE-001", "qual o tipo deste edital?", "é comodato ou venda?"

21. **recomendar_preco**: Obter recomendação de preço baseada em histórico
    Exemplos: "qual preço sugerir?", "recomendação de preço para edital X"

22. **analisar_concorrentes**: Analisar concorrentes em determinado segmento
    Exemplos: "quem são os concorrentes?", "empresas que participam de editais de..."

23. **historico_precos**: Ver histórico de preços em editais similares
    Exemplos: "preços praticados em editais de hematologia", "histórico de preços"

24. **verificar_completude**: Verificar completude do cadastro de um produto
    Exemplos: "o que falta no produto X?", "quais specs estão faltando?"

25. **auditar_proposta**: Auditar proposta vencedora de concorrente
    Exemplos: "audite a proposta vencedora", "verifique desvios da proposta"

26. **gerar_laudo**: Gerar laudo de contestação/recurso
    Exemplos: "gere o laudo de contestação", "faça o recurso"

27. **registrar_resultado**: Registrar resultado de certame (vitória/derrota)
    Exemplos: "perdemos o edital X", "ganhamos o PE-001", "registre resultado"

28. **analisar_perdas**: Analisar causas de derrotas
    Exemplos: "por que perdemos?", "análise de derrotas", "motivos das perdas"

29. **compilar_documentos**: Compilar documentos para proposta
    Exemplos: "compile os documentos", "junte os anexos"

30. **montar_proposta_final**: Montar PDF/ZIP final da proposta
    Exemplos: "monte o PDF final", "gere o arquivo da proposta"

31. **configurar_alertas**: Configurar alertas de prazo para edital
    Exemplos: "avise 24h antes", "configure alertas", "lembre-me do prazo"

32. **configurar_monitoramento**: Configurar monitoramento automático de editais
    Exemplos: "monitore editais de...", "busque automaticamente", "avise quando houver"
"""
```

---

## 8. Fluxo de Conversação Típico

### Fluxo Completo: Do Cadastro à Proposta

```
USUÁRIO: [Envia PDF] "Cadastre como Sysmex XN-1000"
AGENTE:  ✅ Produto cadastrado! 45 specs extraídas. Score completude: 87%.
         Sugestão: Adicione peso e dimensões.

USUÁRIO: "Busque editais de hematologia"
AGENTE:  🔍 15 editais encontrados!
         PE-001/2026 - HC-SP - R$ 450k - Abertura 15/02

USUÁRIO: "Calcule aderência do XN-1000 ao PE-001"
AGENTE:  📊 Score técnico: 92% | Comercial: 78% | Potencial: 85%
         Recomendação: PARTICIPAR

USUÁRIO: "Qual preço sugerir?"
AGENTE:  💰 Preço agressivo: R$ 360k (78% chance)
         Preço moderado: R$ 385k (65% chance)
         Concorrente principal: MedLab (40% taxa vitória)

USUÁRIO: "Gere proposta com R$ 375.000"
AGENTE:  📝 Proposta gerada! ID: PROP-001
         8 seções | Tabela comparativa |
         Deseja compilar documentos?

USUÁRIO: "Sim, compile e monte o PDF"
AGENTE:  📦 PDF gerado: 48 páginas, 15.2MB
         ⚠️ Alvará Sanitário VENCIDO - renovar!
         📥 [Baixar PDF]

USUÁRIO: "Configure alertas"
AGENTE:  ⏰ Alertas: 3 dias, 24h, 1h, 15min antes
         Notificações para: usuario@empresa.com

[Após resultado...]

USUÁRIO: "Perdemos por preço"
AGENTE:  📊 Registrado. Diferença: 4,1% acima do vencedor.
         Ajustado modelo de preços. Nova faixa: R$ 350-370k.

USUÁRIO: "Audite a proposta vencedora"
AGENTE:  🔍 Desvio crítico encontrado: processamento 90/h vs 100/h exigido
         Score de recurso: 78%
         Recomendação: ENTRAR COM RECURSO

USUÁRIO: "Gere o laudo"
AGENTE:  📄 Laudo gerado! Prazo: 17/02 18:00
         📥 [Baixar DOCX]
```

---

## 9. Resumo de Implementação

### Fase 2.1 (Sprint 1-2): Fundamentos
- [ ] Implementar intenções 20-24
- [ ] AG-05: Market Intelligence Agent
- [ ] Tabelas: `precos_historicos`, `concorrentes`
- [ ] API de recomendação de preço

### Fase 2.2 (Sprint 3-4): Documentos e Alertas
- [ ] Implementar intenções 29-32
- [ ] Sistema de alertas (scheduler)
- [ ] Compilação de documentos
- [ ] Repositório de certidões

### Fase 2.3 (Sprint 5): Auditoria e Aprendizado
- [ ] Implementar intenções 25-28
- [ ] AG-08: Audit Agent
- [ ] AG-09: Performance Monitor
- [ ] Sistema de feedback/aprendizado

---

*Documento gerado em: 02/02/2026*
*Baseado em: 07_Configuracao_CrewAI_MVP_v2.docx*
