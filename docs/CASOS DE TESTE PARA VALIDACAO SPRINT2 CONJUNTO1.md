# CASOS DE TESTE PARA VALIDACAO — SPRINT 2 — CONJUNTO 1

**Data:** 2026-04-21
**Empresa:** CH Hospitalar Comercio de Equipamentos Medicos e Hospitalares Ltda.
**Usuario:** valida1@valida.com.br / 123456
**Produtos relevantes:** Ultrassonografo Portatil Mindray M7T | Monitor Multiparametrico Mindray iMEC10 Plus
**NCM:** 9018.19.90
**Area:** Equip. Medico-Hospitalares
**Referencia:** CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V5.md + tutorialsprint2-1.md

---

## Convencoes

- **ID:** CT-{UC}-{numero sequencial} (ex: CT-CV01-01)
- **Tipo:** Positivo (fluxo principal) / Negativo (fluxo de excecao) / Limite (valores extremos ou fronteira)
- Dados extraidos exclusivamente do `tutorialsprint2-1.md`

---

## UC-CV01 — Buscar editais por termo, classificacao e score

### CT-CV01-01 — Busca 1: termo simples com Score Rapido

| Campo | Valor |
|---|---|
| **ID** | CT-CV01-01 |
| **Descricao** | Verificar busca por termo simples "monitor multiparametrico" com Score Rapido, UF=Todas, Fonte=PNCP, encerrados=Nao |
| **Pre-condicoes** | Usuario autenticado como valida1@valida.com.br, empresa CH Hospitalar ativa, Sprint 1 concluida, pagina Captacao acessivel |
| **Acoes do ator e dados de entrada** | 1. Clicar em "Captacao" na sidebar. 2. Preencher campo "Termo de busca" com `monitor multiparametrico`. 3. Selecionar UF = `Todas`. 4. Selecionar Fonte = `PNCP`. 5. Selecionar Analise de Score = `Score Rapido`. 6. Desmarcar checkbox "Incluir editais encerrados". 7. Clicar em "Buscar Editais". |
| **Saida esperada** | Tabela de resultados e populada com pelo menos 1 edital. Cada edital exibe colunas: Fonte, Numero, Orgao, UF, Modalidade, Objeto, Valor, Produto Correspondente, Prazo, Score. A coluna Score exibe percentuais calculados (Score Rapido). Os StatCards (Prazo 2, 5, 10, 20 dias) sao atualizados. |
| **Tipo** | Positivo |

### CT-CV01-02 — Busca 2: termo com NCM e UF=SP, Score Hibrido

| Campo | Valor |
|---|---|
| **ID** | CT-CV01-02 |
| **Descricao** | Verificar busca com termo "ultrassom portatil", NCM 9018.19.90, UF=SP, Score Hibrido |
| **Pre-condicoes** | Pagina Captacao acessivel, Busca 1 concluida ou nova sessao |
| **Acoes do ator e dados de entrada** | 1. Preencher campo "Termo de busca" com `ultrassom portatil`. 2. Preencher campo NCM com `9018.19.90`. 3. Selecionar UF = `SP`. 4. Selecionar Analise de Score = `Score Hibrido`. 5. Clicar em "Buscar Editais". |
| **Saida esperada** | Tabela de resultados e populada com editais filtrados por SP. Scores hibridos sao exibidos na coluna Score. Todos os editais exibem UF=SP. |
| **Tipo** | Positivo |

### CT-CV01-03 — Busca 3: cascata Area/Classe/Subclasse com Score Profundo

| Campo | Valor |
|---|---|
| **ID** | CT-CV01-03 |
| **Descricao** | Verificar busca com cascata de classificacao completa, Score Profundo, Qtd=5, incluindo editais encerrados |
| **Pre-condicoes** | Pagina Captacao acessivel, classificacoes do portfolio cadastradas |
| **Acoes do ator e dados de entrada** | 1. Preencher campo "Termo de busca" com `equipamento medico`. 2. Selecionar Area = `Equipamentos Medico-Hospitalares`. 3. Aguardar populacao da Classe; selecionar Classe = `Equipamentos de Diagnostico por Imagem`. 4. Aguardar populacao da Subclasse; selecionar Subclasse = `Ultrassonografo`. 5. Selecionar Analise de Score = `Score Profundo`. 6. Preencher "Qtd editais profundo" com `5`. 7. Marcar checkbox "Incluir editais encerrados". 8. Clicar em "Buscar Editais". |
| **Saida esperada** | Tabela exibe no maximo 5 resultados. Editais encerrados podem aparecer com diferenciacao visual. Scores profundos sao exibidos na coluna Score. O processamento pode levar ate 2 minutos. |
| **Tipo** | Positivo |

### CT-CV01-04 — Busca 4: sem score, UF=RJ

| Campo | Valor |
|---|---|
| **ID** | CT-CV01-04 |
| **Descricao** | Verificar busca sem calculo de score, termo "desfibrilador", UF=RJ, Fonte=PNCP |
| **Pre-condicoes** | Pagina Captacao acessivel |
| **Acoes do ator e dados de entrada** | 1. Preencher campo "Termo de busca" com `desfibrilador`. 2. Selecionar UF = `RJ`. 3. Selecionar Fonte = `PNCP`. 4. Selecionar Analise de Score = `Sem Score`. 5. Clicar em "Buscar Editais". |
| **Saida esperada** | Tabela de resultados e populada. A coluna Score esta vazia ou com traco (sem calculo). Todos os editais exibem UF=RJ. A busca e mais rapida que com score. |
| **Tipo** | Positivo |

### CT-CV01-05 — Busca com termo vazio (fluxo de excecao)

| Campo | Valor |
|---|---|
| **ID** | CT-CV01-05 |
| **Descricao** | Verificar que o sistema impede busca com termo vazio ou com menos de 3 caracteres (RN-077) |
| **Pre-condicoes** | Pagina Captacao acessivel |
| **Acoes do ator e dados de entrada** | 1. Deixar campo "Termo de busca" vazio. 2. Clicar em "Buscar Editais". |
| **Saida esperada** | Sistema exibe validacao: "Informe ao menos 3 caracteres no termo de busca." A busca nao e executada. Nenhum resultado e exibido. |
| **Tipo** | Negativo |

### CT-CV01-06 — Busca com filtros restritivos sem resultado (fluxo alternativo)

| Campo | Valor |
|---|---|
| **ID** | CT-CV01-06 |
| **Descricao** | Verificar comportamento quando a busca nao retorna resultados |
| **Pre-condicoes** | Pagina Captacao acessivel |
| **Acoes do ator e dados de entrada** | 1. Preencher campo "Termo de busca" com `xyzinexistente123`. 2. Selecionar UF = `Todas`. 3. Selecionar Fonte = `PNCP`. 4. Selecionar Analise de Score = `Sem Score`. 5. Clicar em "Buscar Editais". |
| **Saida esperada** | Sistema exibe mensagem informativa: "Nenhum edital encontrado para os criterios informados." A tabela permanece vazia. StatCards permanecem zerados. |
| **Tipo** | Negativo |

---

## UC-CV02 — Explorar resultados e painel lateral

### CT-CV02-01 — Abrir painel lateral do primeiro edital

| Campo | Valor |
|---|---|
| **ID** | CT-CV02-01 |
| **Descricao** | Verificar que o painel lateral abre ao clicar no primeiro edital da tabela de resultados |
| **Pre-condicoes** | CT-CV01-01 concluido com sucesso (resultados da Busca 1 visiveis) |
| **Acoes do ator e dados de entrada** | 1. Clicar na primeira linha da tabela de resultados. |
| **Saida esperada** | Painel lateral abre exibindo: Numero do edital, Orgao, UF, Objeto, Valor (R$), Modalidade, Produto Correspondente (match com Monitor ou Ultrassom), Score (barra percentual com cor), Potencial (Alto/Medio/Baixo). |
| **Tipo** | Positivo |

### CT-CV02-02 — Verificar Score Profundo no painel (6 dimensoes)

| Campo | Valor |
|---|---|
| **ID** | CT-CV02-02 |
| **Descricao** | Verificar que o painel lateral exibe 6 ScoreBars quando score profundo esta calculado |
| **Pre-condicoes** | CT-CV01-03 concluido (busca com Score Profundo), pelo menos 1 edital com score profundo |
| **Acoes do ator e dados de entrada** | 1. Clicar num edital da Busca 3 (Score Profundo). |
| **Saida esperada** | Painel lateral exibe secao "Score Profundo" com 6 ScoreBars: Tecnica, Documental, Complexidade, Juridico, Logistico, Comercial. Cada barra mostra percentual entre 0% e 100%. Badge "Decisao IA" (GO/NO-GO/Acompanhar) visivel. Justificativa IA, Pontos Positivos e Pontos de Atencao exibidos. |
| **Tipo** | Positivo |

### CT-CV02-03 — Verificar decisao IA badge

| Campo | Valor |
|---|---|
| **ID** | CT-CV02-03 |
| **Descricao** | Verificar que o badge de Decisao IA esta visivel no painel lateral |
| **Pre-condicoes** | CT-CV01-01 concluido, edital com score calculado |
| **Acoes do ator e dados de entrada** | 1. Clicar no primeiro edital com score >= 50% na tabela de resultados. |
| **Saida esperada** | Badge de Decisao IA visivel com texto GO, NO-GO ou Acompanhar. Badge tem cor correspondente (verde, vermelho, amarelo). |
| **Tipo** | Positivo |

### CT-CV02-04 — Painel lateral nao abre com tabela vazia (fluxo alternativo)

| Campo | Valor |
|---|---|
| **ID** | CT-CV02-04 |
| **Descricao** | Verificar que nenhum painel abre quando a tabela de resultados esta vazia |
| **Pre-condicoes** | Nenhuma busca executada ou busca sem resultados |
| **Acoes do ator e dados de entrada** | 1. Sem executar busca, tentar clicar na area da tabela de resultados. |
| **Saida esperada** | Nenhum painel lateral e aberto. Mensagem: "Execute uma busca para ver resultados." |
| **Tipo** | Negativo |

---

## UC-CV03 — Salvar edital, itens e scores

### CT-CV03-01 — Cenario 1: Salvar edital individual da Busca 1

| Campo | Valor |
|---|---|
| **ID** | CT-CV03-01 |
| **Descricao** | Verificar salvamento individual de um edital da busca "monitor multiparametrico" com Score Rapido |
| **Pre-condicoes** | CT-CV01-01 concluido, resultados visiveis |
| **Acoes do ator e dados de entrada** | 1. Executar Busca 1: termo `monitor multiparametrico`, UF=Todas, Fonte=PNCP, Score Rapido. 2. Clicar na primeira linha da tabela para abrir o painel lateral. 3. Clicar em "Salvar Edital" no painel lateral. |
| **Saida esperada** | Badge "Salvo" aparece na linha do edital. Toast de sucesso exibido. O edital passa a ser elegivel na ValidacaoPage. |
| **Tipo** | Positivo |

### CT-CV03-02 — Cenario 2: Salvar todos da Busca 4

| Campo | Valor |
|---|---|
| **ID** | CT-CV03-02 |
| **Descricao** | Verificar salvamento em lote de todos os editais da busca "desfibrilador" |
| **Pre-condicoes** | Busca 4 executada (desfibrilador, RJ, Sem Score) com resultados |
| **Acoes do ator e dados de entrada** | 1. Executar Busca 4: termo `desfibrilador`, UF=RJ, Fonte=PNCP, Sem Score. 2. Clicar em "Salvar Todos" na secao de Acoes em Lote. |
| **Saida esperada** | Todos os editais da lista recebem badge "Salvo". Toast de confirmacao exibido. Ate 5 primeiros editais verificados com badge "Salvo". |
| **Tipo** | Positivo |

### CT-CV03-03 — Cenario 3: Salvar somente score >= 70%

| Campo | Valor |
|---|---|
| **ID** | CT-CV03-03 |
| **Descricao** | Verificar que apenas editais com score >= 70% sao salvos |
| **Pre-condicoes** | Busca 1 executada (monitor multiparametrico, Score Rapido) com resultados |
| **Acoes do ator e dados de entrada** | 1. Executar Busca 1: termo `monitor multiparametrico`, UF=Todas, Fonte=PNCP, Score Rapido. 2. Clicar em "Salvar Score >= 70%". |
| **Saida esperada** | Apenas editais com score >= 70% recebem badge "Salvo". Editais com score < 70% nao sao salvos. Toast de confirmacao exibido. |
| **Tipo** | Positivo |

### CT-CV03-04 — Cenario 4: Salvar selecionados da Busca 2

| Campo | Valor |
|---|---|
| **ID** | CT-CV03-04 |
| **Descricao** | Verificar salvamento de 3 editais selecionados via checkbox |
| **Pre-condicoes** | Busca 2 executada (ultrassom portatil, NCM 9018.19.90, SP, Score Hibrido) com >= 3 resultados |
| **Acoes do ator e dados de entrada** | 1. Executar Busca 2: termo `ultrassom portatil`, NCM `9018.19.90`, UF=SP, Score Hibrido. 2. Marcar checkbox do 1o edital. 3. Marcar checkbox do 2o edital. 4. Marcar checkbox do 3o edital. 5. Clicar em "Salvar Selecionados". |
| **Saida esperada** | Exatamente 3 editais recebem badge "Salvo". Os demais editais nao recebem badge. Toast de confirmacao exibido. |
| **Tipo** | Positivo |

### CT-CV03-05 — Salvar Selecionados sem checkbox marcado (fluxo alternativo)

| Campo | Valor |
|---|---|
| **ID** | CT-CV03-05 |
| **Descricao** | Verificar que o sistema impede salvamento sem selecionar editais |
| **Pre-condicoes** | Busca executada com resultados na tabela |
| **Acoes do ator e dados de entrada** | 1. Sem marcar nenhum checkbox, clicar em "Salvar Selecionados". |
| **Saida esperada** | Sistema exibe mensagem: "Selecione ao menos um edital antes de salvar." Nenhum edital e salvo. |
| **Tipo** | Negativo |

---

## UC-CV04 — Definir estrategia

### CT-CV04-01 — Estrategia 1: Estrategico, margem 25%, Varia por Produto=Sim

| Campo | Valor |
|---|---|
| **ID** | CT-CV04-01 |
| **Descricao** | Verificar definicao de estrategia "Estrategico" com margem 25% e variacao por produto |
| **Pre-condicoes** | CT-CV03-01 concluido (edital salvo da Busca 1) |
| **Acoes do ator e dados de entrada** | 1. Executar Busca 1 (monitor multiparametrico, Score Rapido). 2. Clicar na primeira linha da tabela. 3. No painel lateral, selecionar radio "Estrategico". 4. Ajustar margem para `25` (slider ou campo). 5. Ativar toggle "Varia por Produto". 6. Desativar toggle "Varia por Regiao". 7. Clicar em "Salvar Estrategia". |
| **Saida esperada** | Toast de sucesso: "salvo" ou "sucesso". Ao fechar o painel (clicar em outro edital) e reabrir o mesmo edital: radio "Estrategico" esta marcado, margem exibe 25%, "Varia por Produto" ativo, "Varia por Regiao" inativo. |
| **Tipo** | Positivo |

### CT-CV04-02 — Estrategia 2: Defensivo, margem 10%, Varia por Regiao=Sim

| Campo | Valor |
|---|---|
| **ID** | CT-CV04-02 |
| **Descricao** | Verificar definicao de estrategia "Defensivo" com margem 10% e variacao por regiao |
| **Pre-condicoes** | CT-CV04-01 concluido, segundo edital salvo disponivel |
| **Acoes do ator e dados de entrada** | 1. Clicar no segundo edital da tabela de resultados. 2. Selecionar radio "Defensivo". 3. Ajustar margem para `10`. 4. Desativar toggle "Varia por Produto". 5. Ativar toggle "Varia por Regiao". 6. Clicar em "Salvar Estrategia". |
| **Saida esperada** | Toast de sucesso. Ao fechar e reabrir o painel do segundo edital: radio "Defensivo" marcado, margem=10%, "Varia por Produto" inativo, "Varia por Regiao" ativo. |
| **Tipo** | Positivo |

### CT-CV04-03 — Persistencia: verificar estrategia apos fechar e reabrir

| Campo | Valor |
|---|---|
| **ID** | CT-CV04-03 |
| **Descricao** | Verificar que as estrategias definidas persistem apos fechar e reabrir o painel |
| **Pre-condicoes** | CT-CV04-01 e CT-CV04-02 concluidos |
| **Acoes do ator e dados de entrada** | 1. Clicar no primeiro edital. 2. Verificar radio, margem e toggles. 3. Clicar no segundo edital. 4. Verificar radio, margem e toggles. |
| **Saida esperada** | Primeiro edital: Estrategico, 25%, Varia por Produto=Sim, Varia por Regiao=Nao. Segundo edital: Defensivo, 10%, Varia por Produto=Nao, Varia por Regiao=Sim. |
| **Tipo** | Positivo |

### CT-CV04-04 — Fechar painel sem salvar (fluxo alternativo)

| Campo | Valor |
|---|---|
| **ID** | CT-CV04-04 |
| **Descricao** | Verificar que alteracoes nao persistem se o painel for fechado sem salvar |
| **Pre-condicoes** | Edital com estrategia ja definida |
| **Acoes do ator e dados de entrada** | 1. Abrir painel do primeiro edital (Estrategico, 25%). 2. Alterar radio para "Aprendizado" e margem para 5%. 3. Sem clicar "Salvar Estrategia", clicar em outro edital. 4. Voltar ao primeiro edital. |
| **Saida esperada** | O primeiro edital ainda exibe: Estrategico, 25%, Varia por Produto=Sim. As alteracoes nao foram persistidas. |
| **Tipo** | Negativo |

---

## UC-CV05 — Exportar e consolidar

### CT-CV05-01 — Exportar CSV da Busca 1

| Campo | Valor |
|---|---|
| **ID** | CT-CV05-01 |
| **Descricao** | Verificar exportacao de resultados em formato CSV |
| **Pre-condicoes** | Busca 1 executada (monitor multiparametrico, Score Rapido) com resultados |
| **Acoes do ator e dados de entrada** | 1. Executar Busca 1: termo `monitor multiparametrico`, UF=Todas, Fonte=PNCP, Score Rapido. 2. Clicar em "Exportar CSV" na secao Acoes em Lote. |
| **Saida esperada** | Download de arquivo .csv e iniciado. O arquivo contem colunas: Fonte, Numero, Orgao, UF, Modalidade, Objeto, Valor, Score. O arquivo nao esta vazio. |
| **Tipo** | Positivo |

### CT-CV05-02 — Relatorio Completo da Busca 2

| Campo | Valor |
|---|---|
| **ID** | CT-CV05-02 |
| **Descricao** | Verificar geracao de relatorio completo consolidado |
| **Pre-condicoes** | Busca 2 executada (ultrassom portatil, NCM 9018.19.90, SP, Score Hibrido) com resultados |
| **Acoes do ator e dados de entrada** | 1. Executar Busca 2: termo `ultrassom portatil`, NCM `9018.19.90`, UF=SP, Score Hibrido. 2. Clicar em "Relatorio Completo" na secao Acoes em Lote. |
| **Saida esperada** | Relatorio e gerado e exibido. Contem resumo, ranking e analise. Formato markdown/HTML. Conteudo nao vazio. |
| **Tipo** | Positivo |

### CT-CV05-03 — Exportar CSV com tabela vazia (fluxo alternativo)

| Campo | Valor |
|---|---|
| **ID** | CT-CV05-03 |
| **Descricao** | Verificar que exportacao e impedida sem resultados de busca |
| **Pre-condicoes** | Nenhuma busca executada ou tabela de resultados vazia |
| **Acoes do ator e dados de entrada** | 1. Sem executar busca, clicar em "Exportar CSV". |
| **Saida esperada** | Sistema exibe mensagem: "Nenhum dado para exportar. Execute uma busca primeiro." Nenhum download e iniciado. |
| **Tipo** | Negativo |

---

## UC-CV06 — Gerir monitoramentos

### CT-CV06-01 — Criar Monitoramento 1: monitor multiparametrico

| Campo | Valor |
|---|---|
| **ID** | CT-CV06-01 |
| **Descricao** | Verificar criacao de monitoramento com termo, NCM, UFs multiplas, frequencia 6h |
| **Pre-condicoes** | Pagina Captacao acessivel, secao Monitoramentos visivel |
| **Acoes do ator e dados de entrada** | 1. Clicar em "Novo Monitoramento". 2. Preencher Termo com `monitor multiparametrico`. 3. Preencher NCM com `9018.19.90`. 4. Marcar UFs: SP, RJ, MG. 5. Selecionar Fonte = `PNCP`. 6. Selecionar Frequencia = `A cada 6 horas`. 7. Preencher Score Minimo com `60`. 8. Desmarcar "Incluir Encerrados". 9. Clicar em "Criar". |
| **Saida esperada** | Monitoramento aparece na tabela de monitoramentos ativos com: termo="monitor multiparametrico", UFs=SP/RJ/MG, frequencia=6h, score min=60, status="Ativo" (badge verde). |
| **Tipo** | Positivo |

### CT-CV06-02 — Criar Monitoramento 2: ultrassonografo portatil

| Campo | Valor |
|---|---|
| **ID** | CT-CV06-02 |
| **Descricao** | Verificar criacao de segundo monitoramento com UF=Todas, frequencia 12h |
| **Pre-condicoes** | CT-CV06-01 concluido |
| **Acoes do ator e dados de entrada** | 1. Clicar em "Novo Monitoramento". 2. Preencher Termo com `ultrassonografo portatil`. 3. Preencher NCM com `9018.19.90`. 4. Marcar UFs = Todas. 5. Selecionar Fonte = `PNCP`. 6. Selecionar Frequencia = `A cada 12 horas`. 7. Preencher Score Minimo com `50`. 8. Desmarcar "Incluir Encerrados". 9. Clicar em "Criar". |
| **Saida esperada** | Segundo monitoramento aparece na tabela com status "Ativo". Dois monitoramentos listados. |
| **Tipo** | Positivo |

### CT-CV06-03 — Pausar Monitoramento 1

| Campo | Valor |
|---|---|
| **ID** | CT-CV06-03 |
| **Descricao** | Verificar que pausar monitoramento muda o status para "Pausado" |
| **Pre-condicoes** | CT-CV06-01 concluido, Mon 1 ativo |
| **Acoes do ator e dados de entrada** | 1. Na linha do Mon 1 (monitor multiparametrico), clicar em "Pausar". |
| **Saida esperada** | Status do Mon 1 muda para "Pausado" (badge cinza). Mon 2 permanece "Ativo". |
| **Tipo** | Positivo |

### CT-CV06-04 — Retomar Monitoramento 1

| Campo | Valor |
|---|---|
| **ID** | CT-CV06-04 |
| **Descricao** | Verificar que retomar monitoramento muda o status de volta para "Ativo" |
| **Pre-condicoes** | CT-CV06-03 concluido, Mon 1 pausado |
| **Acoes do ator e dados de entrada** | 1. Na linha do Mon 1 (monitor multiparametrico), clicar em "Retomar" ou "Ativar". |
| **Saida esperada** | Status do Mon 1 volta para "Ativo" (badge verde). |
| **Tipo** | Positivo |

### CT-CV06-05 — Excluir Monitoramento 2

| Campo | Valor |
|---|---|
| **ID** | CT-CV06-05 |
| **Descricao** | Verificar exclusao de monitoramento com confirmacao |
| **Pre-condicoes** | CT-CV06-02 concluido, Mon 2 ativo |
| **Acoes do ator e dados de entrada** | 1. Na linha do Mon 2 (ultrassonografo portatil), clicar em "Excluir". 2. Se modal de confirmacao aparecer, clicar em "Confirmar" ou "Sim". |
| **Saida esperada** | Mon 2 desaparece da tabela. Apenas Mon 1 permanece na lista com status "Ativo". |
| **Tipo** | Positivo |

### CT-CV06-06 — Criar monitoramento sem termo (fluxo de excecao)

| Campo | Valor |
|---|---|
| **ID** | CT-CV06-06 |
| **Descricao** | Verificar que sistema impede criacao sem campo Termo preenchido |
| **Pre-condicoes** | Formulario de novo monitoramento aberto |
| **Acoes do ator e dados de entrada** | 1. Clicar em "Novo Monitoramento". 2. Deixar campo Termo vazio. 3. Preencher demais campos. 4. Clicar em "Criar". |
| **Saida esperada** | Sistema exibe validacao: "O campo Termo e obrigatorio." O monitoramento nao e criado. |
| **Tipo** | Negativo |

---

## UC-CV07 — Listar editais salvos

### CT-CV07-01 — Listar editais com filtro Status=Todos

| Campo | Valor |
|---|---|
| **ID** | CT-CV07-01 |
| **Descricao** | Verificar que a pagina Validacao lista todos os editais salvos |
| **Pre-condicoes** | Editais salvos nos cenarios CT-CV03-01 a CT-CV03-04 |
| **Acoes do ator e dados de entrada** | 1. Clicar em "Validacao" na sidebar. 2. Selecionar filtro Status = `Todos`. |
| **Saida esperada** | Tabela "Meus Editais" exibe todos os editais salvos. Cada edital mostra: Numero, Orgao, UF, Objeto, Valor, Abertura, Status (badge), Score. Total de editais > 0. |
| **Tipo** | Positivo |

### CT-CV07-02 — Filtrar por Status=Novo

| Campo | Valor |
|---|---|
| **ID** | CT-CV07-02 |
| **Descricao** | Verificar filtro de status "Novo" para editais recem-salvos |
| **Pre-condicoes** | CT-CV07-01 concluido |
| **Acoes do ator e dados de entrada** | 1. Selecionar filtro Status = `Novo`. |
| **Saida esperada** | Apenas editais com status "Novo" sao exibidos. Os editais recem-salvos (sem decisao) devem aparecer. |
| **Tipo** | Positivo |

### CT-CV07-03 — Buscar por texto "monitor"

| Campo | Valor |
|---|---|
| **ID** | CT-CV07-03 |
| **Descricao** | Verificar busca textual na lista de editais salvos |
| **Pre-condicoes** | CT-CV07-01 concluido, filtro Status=Todos |
| **Acoes do ator e dados de entrada** | 1. Selecionar Status = `Todos`. 2. Preencher campo "Buscar edital..." com `monitor`. |
| **Saida esperada** | Tabela e filtrada mostrando apenas editais cujo objeto/numero contem "monitor". Pelo menos 1 edital da Busca 1 aparece. |
| **Tipo** | Positivo |

### CT-CV07-04 — Selecionar edital e verificar 6 abas

| Campo | Valor |
|---|---|
| **ID** | CT-CV07-04 |
| **Descricao** | Verificar que selecionar um edital exibe o Card Edital Info e as 6 abas |
| **Pre-condicoes** | CT-CV07-03 concluido, edital "monitor" visivel |
| **Acoes do ator e dados de entrada** | 1. Clicar na linha do edital com texto "monitor". |
| **Saida esperada** | Card "Edital Info" visivel com: Numero, Orgao, Objeto, Valor. 6 abas visiveis: Aderencia, Lotes, Documentos, Riscos, Mercado, IA. |
| **Tipo** | Positivo |

### CT-CV07-05 — Lista vazia na ValidacaoPage (fluxo alternativo)

| Campo | Valor |
|---|---|
| **ID** | CT-CV07-05 |
| **Descricao** | Verificar comportamento quando nenhum edital foi salvo (se aplicavel) |
| **Pre-condicoes** | Nenhum edital salvo para a empresa (cenario hipotetico) |
| **Acoes do ator e dados de entrada** | 1. Acessar pagina Validacao. |
| **Saida esperada** | Mensagem: "Nenhum edital salvo. Va para Captacao para buscar e salvar editais." Painel de abas nao aparece. |
| **Tipo** | Negativo |

---

## UC-CV08 — Calcular scores e decidir GO/NO-GO

### CT-CV08-01 — Calcular scores de aderencia (6 dimensoes)

| Campo | Valor |
|---|---|
| **ID** | CT-CV08-01 |
| **Descricao** | Verificar calculo de scores multidimensionais para edital "monitor" |
| **Pre-condicoes** | CT-CV07-04 concluido (edital "monitor" selecionado), aba Aderencia acessivel |
| **Acoes do ator e dados de entrada** | 1. Clicar na aba "Aderencia". 2. Clicar em "Calcular Scores IA". 3. Aguardar processamento (ate 2 minutos). |
| **Saida esperada** | 6 ScoreBars visiveis com labels: Tecnica, Documental, Complexidade, Juridico, Logistico, Comercial. Cada barra exibe percentual entre 0% e 100%. ScoreCircle (score geral) visivel. Badge "Decisao IA" visivel. Justificativa IA, Pontos Positivos e Pontos de Atencao exibidos. |
| **Tipo** | Positivo |

### CT-CV08-02 — Decidir GO com justificativa

| Campo | Valor |
|---|---|
| **ID** | CT-CV08-02 |
| **Descricao** | Verificar decisao GO com preenchimento de motivo e detalhes |
| **Pre-condicoes** | CT-CV08-01 concluido (scores calculados) |
| **Acoes do ator e dados de entrada** | 1. Clicar em "Participar (GO)". 2. Preencher campo Motivo com `Aderencia tecnica alta`. 3. Preencher campo Detalhes com `Produto atende 100% dos requisitos do edital, preco competitivo, empresa tem documentacao completa.`. 4. Clicar em "Salvar Justificativa". |
| **Saida esperada** | Botao GO fica verde/ativo. Toast de sucesso exibido. Status do edital muda para "GO" na tabela de Meus Editais. |
| **Tipo** | Positivo |

### CT-CV08-03 — Decidir NO-GO com justificativa (outro edital)

| Campo | Valor |
|---|---|
| **ID** | CT-CV08-03 |
| **Descricao** | Verificar decisao NO-GO para um edital diferente |
| **Pre-condicoes** | Outro edital salvo disponivel, diferente do que recebeu GO |
| **Acoes do ator e dados de entrada** | 1. Limpar busca e selecionar outro edital na tabela. 2. Clicar na aba "Aderencia". 3. Clicar em "Calcular Scores IA". 4. Aguardar processamento. 5. Clicar em "Rejeitar (NO-GO)". 6. Preencher Motivo com `Complexidade excessiva`. 7. Preencher Detalhes com `Edital exige certificacoes que a empresa nao possui no momento.`. 8. Clicar em "Salvar Justificativa". |
| **Saida esperada** | Botao NO-GO fica vermelho/ativo. Toast de sucesso exibido. Status do edital muda para "NO-GO". |
| **Tipo** | Positivo |

### CT-CV08-04 — Timeout no calculo de scores (fluxo de excecao)

| Campo | Valor |
|---|---|
| **ID** | CT-CV08-04 |
| **Descricao** | Verificar comportamento quando o calculo de scores excede o timeout |
| **Pre-condicoes** | Edital selecionado, servico de IA lento ou indisponivel |
| **Acoes do ator e dados de entrada** | 1. Clicar em "Calcular Scores IA". 2. Aguardar alem do timeout. |
| **Saida esperada** | Sistema exibe mensagem: "O calculo de scores demorou mais que o esperado. Tente novamente." Scores nao sao atualizados. |
| **Tipo** | Negativo |

---

## UC-CV09 — Importar itens e extrair lotes

### CT-CV09-01 — Importar itens do PNCP

| Campo | Valor |
|---|---|
| **ID** | CT-CV09-01 |
| **Descricao** | Verificar importacao de itens do PNCP para o edital "monitor" |
| **Pre-condicoes** | CT-CV07-04 concluido (edital "monitor" selecionado) |
| **Acoes do ator e dados de entrada** | 1. Clicar na aba "Lotes". 2. Clicar em "Buscar Itens no PNCP". 3. Aguardar carregamento. |
| **Saida esperada** | Tabela "Itens do Edital" e populada com pelo menos 1 item. Colunas visiveis: #, Descricao, Qtd, Unid, Vlr Unit, Vlr Total. |
| **Tipo** | Positivo |

### CT-CV09-02 — Extrair lotes via IA

| Campo | Valor |
|---|---|
| **ID** | CT-CV09-02 |
| **Descricao** | Verificar extracao de lotes via IA apos importacao de itens |
| **Pre-condicoes** | CT-CV09-01 concluido (itens importados) |
| **Acoes do ator e dados de entrada** | 1. Clicar em "Extrair Lotes via IA". 2. Aguardar processamento (ate 2 minutos). |
| **Saida esperada** | Pelo menos 2 cards de lote aparecem (Lote 1, Lote 2). Cada lote tem titulo, valor estimado e lista de itens. |
| **Tipo** | Positivo |

### CT-CV09-03 — Mover item entre lotes

| Campo | Valor |
|---|---|
| **ID** | CT-CV09-03 |
| **Descricao** | Verificar movimentacao de item de um lote para outro |
| **Pre-condicoes** | CT-CV09-02 concluido (lotes extraidos com itens) |
| **Acoes do ator e dados de entrada** | 1. No Lote 2, localizar um item. 2. No select "Mover para" do item, selecionar "Lote 1". |
| **Saida esperada** | O item desaparece do Lote 2 e aparece no Lote 1. Valores estimados dos lotes sao recalculados. |
| **Tipo** | Positivo |

### CT-CV09-04 — Excluir lote

| Campo | Valor |
|---|---|
| **ID** | CT-CV09-04 |
| **Descricao** | Verificar exclusao de lote |
| **Pre-condicoes** | CT-CV09-02 concluido, pelo menos 2 lotes existentes |
| **Acoes do ator e dados de entrada** | 1. Clicar no icone "X" (Excluir lote) do Lote 2. 2. Confirmar exclusao se modal aparecer. |
| **Saida esperada** | Lote 2 e removido da interface. Os itens do lote ficam desvinculados ou redistribuidos. |
| **Tipo** | Positivo |

### CT-CV09-05 — Buscar itens com PNCP indisponivel (fluxo de excecao)

| Campo | Valor |
|---|---|
| **ID** | CT-CV09-05 |
| **Descricao** | Verificar comportamento quando o PNCP esta fora do ar |
| **Pre-condicoes** | Edital selecionado, aba Lotes aberta |
| **Acoes do ator e dados de entrada** | 1. Clicar em "Buscar Itens no PNCP" (com PNCP indisponivel). |
| **Saida esperada** | Sistema exibe mensagem: "Nao foi possivel conectar ao PNCP. Tente novamente." Tabela de itens permanece vazia. |
| **Tipo** | Negativo |

---

## UC-CV10 — Confrontar documentacao

### CT-CV10-01 — Verificar categorias de documentos

| Campo | Valor |
|---|---|
| **ID** | CT-CV10-01 |
| **Descricao** | Verificar que as 5 categorias de documentos sao exibidas com badges de status |
| **Pre-condicoes** | CT-CV07-04 concluido (edital "monitor" selecionado), documentos da Sprint 1 cadastrados |
| **Acoes do ator e dados de entrada** | 1. Clicar na aba "Documentos". 2. Verificar visualmente as categorias. |
| **Saida esperada** | 5 categorias visiveis: Habilitacao Juridica, Regularidade Fiscal, Qualificacao Tecnica, Qualificacao Economica, Outros. Cada categoria exibe badges: Disponivel (verde), Vencido (vermelho), Faltante (cinza). |
| **Tipo** | Positivo |

### CT-CV10-02 — Identificar documentos exigidos pelo edital

| Campo | Valor |
|---|---|
| **ID** | CT-CV10-02 |
| **Descricao** | Verificar extracao de requisitos documentais via IA |
| **Pre-condicoes** | CT-CV10-01 concluido |
| **Acoes do ator e dados de entrada** | 1. Clicar em "Identificar Documentos Exigidos pelo Edital". 2. Aguardar processamento. |
| **Saida esperada** | Checklist de documentos e exibido com status: Atendido/Pendente/Vencido. A barra de completude e atualizada com percentual e contadores (disponiveis, vencidos, faltantes). |
| **Tipo** | Positivo |

### CT-CV10-03 — Buscar documentos exigidos via chat IA

| Campo | Valor |
|---|---|
| **ID** | CT-CV10-03 |
| **Descricao** | Verificar consulta ao chat IA sobre documentos exigidos |
| **Pre-condicoes** | CT-CV10-01 concluido |
| **Acoes do ator e dados de entrada** | 1. Clicar em "Buscar Documentos Exigidos". 2. Aguardar resposta. |
| **Saida esperada** | Resposta da IA e exibida listando os documentos exigidos pelo edital. |
| **Tipo** | Positivo |

### CT-CV10-04 — Verificar certidoes

| Campo | Valor |
|---|---|
| **ID** | CT-CV10-04 |
| **Descricao** | Verificar atualizacao de status de certidoes |
| **Pre-condicoes** | CT-CV10-01 concluido |
| **Acoes do ator e dados de entrada** | 1. Clicar em "Verificar Certidoes". 2. Aguardar processamento. |
| **Saida esperada** | Status das certidoes e atualizado. Badges de status (Atendido/Valido/Pendente/Vencido) sao exibidos. Nota: pode haver divergencia funcional conhecida (empresa_id = edital.id). |
| **Tipo** | Positivo |

---

## UC-CV11 — Analisar riscos, atas, concorrentes

### CT-CV11-01 — Analisar riscos do edital (4 categorias)

| Campo | Valor |
|---|---|
| **ID** | CT-CV11-01 |
| **Descricao** | Verificar analise de riscos com 4 categorias e severidades |
| **Pre-condicoes** | CT-CV07-04 concluido (edital "monitor" selecionado) |
| **Acoes do ator e dados de entrada** | 1. Clicar na aba "Riscos". 2. Clicar em "Analisar Riscos do Edital". 3. Aguardar processamento. |
| **Saida esperada** | 4 categorias de risco visiveis: Juridico, Tecnico, Financeiro, Logistico. Cada risco com badge de severidade: critico/alto/medio/baixo. Secao "Fatal Flaws": risco eliminatorio (vermelho) ou "Nenhum risco eliminatorio". |
| **Tipo** | Positivo |

### CT-CV11-02 — Rebuscar atas

| Campo | Valor |
|---|---|
| **ID** | CT-CV11-02 |
| **Descricao** | Verificar busca de atas de registro de precos |
| **Pre-condicoes** | CT-CV11-01 concluido |
| **Acoes do ator e dados de entrada** | 1. Clicar em "Rebuscar Atas". 2. Aguardar processamento. |
| **Saida esperada** | Lista de atas e exibida (ou mensagem "Nenhuma ata encontrada"). Se houver atas: titulo, orgao, UF, data e link "Ver no PNCP" visiveis. Badge "Recorrencia" (Semestral/Anual/Esporadica) exibido. |
| **Tipo** | Positivo |

### CT-CV11-03 — Buscar vencedores e precos

| Campo | Valor |
|---|---|
| **ID** | CT-CV11-03 |
| **Descricao** | Verificar busca de vencedores e precos historicos |
| **Pre-condicoes** | CT-CV11-02 concluido, atas encontradas |
| **Acoes do ator e dados de entrada** | 1. Clicar em "Buscar Vencedores e Precos". 2. Aguardar processamento. |
| **Saida esperada** | Tabela "Vencedores e Precos Registrados" visivel com colunas: Item, Vencedor, Vlr Estimado, Vlr Homologado, Desconto %. |
| **Tipo** | Positivo |

### CT-CV11-04 — Atualizar concorrentes

| Campo | Valor |
|---|---|
| **ID** | CT-CV11-04 |
| **Descricao** | Verificar atualizacao da tabela de concorrentes |
| **Pre-condicoes** | CT-CV11-01 concluido |
| **Acoes do ator e dados de entrada** | 1. Clicar em "Atualizar" na secao Concorrentes Conhecidos. 2. Aguardar processamento. |
| **Saida esperada** | Tabela "Concorrentes" visivel com colunas: Concorrente, Participacoes, Vitorias, Taxa (%). |
| **Tipo** | Positivo |

---

## UC-CV12 — Analisar mercado

### CT-CV12-01 — Analisar mercado do orgao (6 secoes)

| Campo | Valor |
|---|---|
| **ID** | CT-CV12-01 |
| **Descricao** | Verificar analise de mercado com todas as secoes preenchidas |
| **Pre-condicoes** | CT-CV07-04 concluido (edital "monitor" selecionado) |
| **Acoes do ator e dados de entrada** | 1. Clicar na aba "Mercado". 2. Clicar em "Analisar Mercado do Orgao". 3. Aguardar processamento. |
| **Saida esperada** | 6 secoes preenchidas: (1) Dados do Orgao: Nome, CNPJ, UF. (2) Reputacao: 6 indicadores (Esfera, Risco Pagamento, Volume, Modalidade Principal, % Pregao, Editais Similares). (3) Volume PNCP: 3 cards (Compras encontradas, Valor total, Valor medio). (4) Compras Similares: lista com objeto, valor, data. (5) Historico Interno: badges (Total, GO, NO-GO, Em Avaliacao). (6) Analise IA: texto analitico nao vazio. |
| **Tipo** | Positivo |

### CT-CV12-02 — Verificar analise IA de mercado

| Campo | Valor |
|---|---|
| **ID** | CT-CV12-02 |
| **Descricao** | Verificar que a analise IA gera texto coerente sobre o orgao |
| **Pre-condicoes** | CT-CV12-01 concluido |
| **Acoes do ator e dados de entrada** | 1. Verificar secao "Analise de Mercado (IA)". |
| **Saida esperada** | Texto analitico longo e coerente, mencionando o orgao e o segmento do edital. Texto nao vazio. |
| **Tipo** | Positivo |

---

## UC-CV13 — IA resumo e perguntas

### CT-CV13-01 — Gerar resumo do edital

| Campo | Valor |
|---|---|
| **ID** | CT-CV13-01 |
| **Descricao** | Verificar geracao de resumo em markdown pelo IA |
| **Pre-condicoes** | CT-CV07-04 concluido (edital "monitor" selecionado) |
| **Acoes do ator e dados de entrada** | 1. Clicar na aba "IA". 2. Clicar em "Gerar Resumo". 3. Aguardar processamento. |
| **Saida esperada** | Resumo em markdown renderizado e exibido. Contem secoes, paragrafos e listas. Conteudo nao vazio e relevante ao edital. |
| **Tipo** | Positivo |

### CT-CV13-02 — Pergunta 1: prazo de entrega

| Campo | Valor |
|---|---|
| **ID** | CT-CV13-02 |
| **Descricao** | Verificar resposta da IA sobre prazo de entrega |
| **Pre-condicoes** | CT-CV13-01 concluido |
| **Acoes do ator e dados de entrada** | 1. Preencher campo de pergunta com `Qual o prazo de entrega exigido?`. 2. Clicar em "Perguntar" ou "Enviar". |
| **Saida esperada** | Resposta da IA e exibida contendo informacoes sobre prazo, entrega ou dias. Resposta relevante ao edital. |
| **Tipo** | Positivo |

### CT-CV13-03 — Pergunta 2: registro ANVISA

| Campo | Valor |
|---|---|
| **ID** | CT-CV13-03 |
| **Descricao** | Verificar resposta da IA sobre exigencia de registro ANVISA |
| **Pre-condicoes** | CT-CV13-01 concluido |
| **Acoes do ator e dados de entrada** | 1. Preencher campo de pergunta com `O edital exige registro ANVISA?`. 2. Clicar em "Perguntar". |
| **Saida esperada** | Resposta da IA contendo informacoes sobre ANVISA, registro ou classe. |
| **Tipo** | Positivo |

### CT-CV13-04 — Pergunta 3: garantias exigidas

| Campo | Valor |
|---|---|
| **ID** | CT-CV13-04 |
| **Descricao** | Verificar resposta da IA sobre garantias exigidas |
| **Pre-condicoes** | CT-CV13-01 concluido |
| **Acoes do ator e dados de entrada** | 1. Preencher campo de pergunta com `Quais sao as garantias exigidas?`. 2. Clicar em "Perguntar". |
| **Saida esperada** | Resposta da IA contendo informacoes sobre garantia, execucao ou proposta. |
| **Tipo** | Positivo |

### CT-CV13-05 — Acao rapida: Requisitos Tecnicos

| Campo | Valor |
|---|---|
| **ID** | CT-CV13-05 |
| **Descricao** | Verificar extracao de requisitos tecnicos via acao rapida |
| **Pre-condicoes** | CT-CV13-01 concluido |
| **Acoes do ator e dados de entrada** | 1. Clicar em "Requisitos Tecnicos". 2. Aguardar processamento. |
| **Saida esperada** | Lista de requisitos tecnicos e exibida. Contem itens relevantes ao edital (especificacoes de equipamento medico). |
| **Tipo** | Positivo |

### CT-CV13-06 — Acao rapida: Classificar Edital

| Campo | Valor |
|---|---|
| **ID** | CT-CV13-06 |
| **Descricao** | Verificar classificacao do edital via acao rapida |
| **Pre-condicoes** | CT-CV13-01 concluido |
| **Acoes do ator e dados de entrada** | 1. Clicar em "Classificar Edital". 2. Aguardar processamento. |
| **Saida esperada** | Classificacao exibida: uma das opcoes Venda, Comodato, Aluguel, Consumo ou Servico. Justificativa da classificacao presente. |
| **Tipo** | Positivo |

### CT-CV13-07 — Regerar resumo

| Campo | Valor |
|---|---|
| **ID** | CT-CV13-07 |
| **Descricao** | Verificar regeneracao do resumo apos perguntas e acoes rapidas |
| **Pre-condicoes** | CT-CV13-01 a CT-CV13-06 concluidos |
| **Acoes do ator e dados de entrada** | 1. Clicar em "Regerar Resumo". 2. Aguardar processamento. |
| **Saida esperada** | Novo resumo e gerado e exibido (pode diferir do anterior). Resumo nao vazio. Historico de perguntas permanece visivel. |
| **Tipo** | Positivo |

### CT-CV13-08 — IA indisponivel (fluxo de excecao)

| Campo | Valor |
|---|---|
| **ID** | CT-CV13-08 |
| **Descricao** | Verificar comportamento quando o servico de IA esta indisponivel |
| **Pre-condicoes** | Edital selecionado, servico DeepSeek indisponivel |
| **Acoes do ator e dados de entrada** | 1. Clicar na aba "IA". 2. Clicar em "Gerar Resumo". |
| **Saida esperada** | Sistema exibe mensagem: "Servico de IA indisponivel. Tente novamente mais tarde." Nenhum resumo e gerado. |
| **Tipo** | Negativo |
