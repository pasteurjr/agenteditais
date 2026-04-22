# CASOS DE TESTE PARA VALIDACAO — SPRINT 2 — CONJUNTO 2

**Data:** 2026-04-21
**Empresa:** RP3X Comercio e Representacoes Ltda.
**Usuario:** valida2@valida.com.br / 123456
**Produtos relevantes:** Kit de Reagentes para Hemograma Completo Sysmex XN
**NCM:** 3822.19.90
**Area:** Diagnostico in Vitro e Laboratorio
**Referencia:** CASOS DE USO CAPTACAO VALIDACAO(SPRINT2) V5.md + tutorialsprint2-2.md

---

## Convencoes

- **ID:** CT-{UC}-{numero sequencial} (ex: CT-CV01-01)
- **Tipo:** Positivo (fluxo principal) / Negativo (fluxo de excecao) / Limite (valores extremos ou fronteira)
- Dados extraidos exclusivamente do `tutorialsprint2-2.md`

---

## UC-CV01 — Buscar editais por termo, classificacao e score

### CT-CV01-01 — Busca 1: "reagente hematologia" com Score Rapido

| Campo | Valor |
|---|---|
| **ID** | CT-CV01-01 |
| **Descricao** | Verificar busca por termo "reagente hematologia" com Score Rapido, UF=Todas, Fonte=PNCP, encerrados=Nao |
| **Pre-condicoes** | Usuario autenticado como valida2@valida.com.br, empresa RP3X ativa, Sprint 1 concluida (portfolio e parametrizacao cadastrados), pagina Captacao acessivel |
| **Acoes do ator e dados de entrada** | 1. Clicar em "Captacao" na sidebar. 2. Preencher campo "Termo de busca" com `reagente hematologia`. 3. Selecionar UF = `Todas` (deixar em branco). 4. Selecionar Fonte = `PNCP`. 5. Selecionar Analise de Score = `Score Rapido`. 6. Desmarcar checkbox "Incluir editais encerrados". 7. Clicar em "Buscar Editais". |
| **Saida esperada** | Tabela de resultados e populada com pelo menos 1 edital relacionado a reagentes ou hematologia. Cada edital exibe colunas: Fonte, Numero, Orgao, UF, Modalidade, Objeto, Valor, Produto Correspondente, Prazo, Score. A coluna Score exibe percentuais calculados (Score Rapido). Os StatCards (Prazo 2, 5, 10, 20 dias) sao atualizados. |
| **Tipo** | Positivo |

### CT-CV01-02 — Busca 2: "kit diagnostico laboratorio" com NCM e UF=SP, Score Hibrido

| Campo | Valor |
|---|---|
| **ID** | CT-CV01-02 |
| **Descricao** | Verificar busca com termo "kit diagnostico laboratorio", NCM 3822.19.90, UF=SP, Score Hibrido |
| **Pre-condicoes** | Pagina Captacao acessivel, Busca 1 concluida ou nova sessao |
| **Acoes do ator e dados de entrada** | 1. Limpar campo de busca anterior. 2. Preencher campo "Termo de busca" com `kit diagnostico laboratorio`. 3. Preencher campo NCM com `3822.19.90`. 4. Selecionar UF = `SP`. 5. Selecionar Fonte = `PNCP`. 6. Selecionar Analise de Score = `Score Hibrido`. 7. Desmarcar checkbox "Incluir editais encerrados". 8. Clicar em "Buscar Editais". |
| **Saida esperada** | Tabela de resultados e populada com editais filtrados por SP. Scores hibridos sao exibidos na coluna Score. Todos os editais exibem UF=SP. O NCM `3822.19.90` filtra corretamente os resultados para reagentes de diagnostico. |
| **Tipo** | Positivo |

### CT-CV01-03 — Busca 3: "reagente bioquimico" com cascata completa e Score Profundo

| Campo | Valor |
|---|---|
| **ID** | CT-CV01-03 |
| **Descricao** | Verificar busca com cascata Area/Classe/Subclasse completa, Score Profundo, Qtd=5, incluindo editais encerrados |
| **Pre-condicoes** | Pagina Captacao acessivel, classificacoes do portfolio cadastradas (Sprint 1) |
| **Acoes do ator e dados de entrada** | 1. Limpar campo de busca anterior. 2. Preencher campo "Termo de busca" com `reagente bioquimico`. 3. Selecionar Area = `Diagnostico in Vitro e Laboratorio`. 4. Aguardar populacao da Classe; selecionar Classe = `Reagentes e Kits Diagnosticos`. 5. Aguardar populacao da Subclasse; selecionar Subclasse = `Kit de Hematologia`. 6. Selecionar Analise de Score = `Score Profundo`. 7. Preencher "Qtd editais profundo" com `5`. 8. Marcar checkbox "Incluir editais encerrados". 9. Clicar em "Buscar Editais". |
| **Saida esperada** | Tabela exibe no maximo 5 resultados. Editais encerrados podem aparecer com diferenciacao visual (badge "Encerrado" ou cor diferente). Scores profundos sao exibidos na coluna Score. O processamento pode levar ate 60 segundos ou mais. |
| **Tipo** | Positivo |

### CT-CV01-04 — Busca 4: "glicose enzimatica laboratorio" sem score, UF=MG

| Campo | Valor |
|---|---|
| **ID** | CT-CV01-04 |
| **Descricao** | Verificar busca sem calculo de score, termo "glicose enzimatica laboratorio", UF=MG |
| **Pre-condicoes** | Pagina Captacao acessivel |
| **Acoes do ator e dados de entrada** | 1. Limpar campo de busca anterior. 2. Preencher campo "Termo de busca" com `glicose enzimatica laboratorio`. 3. Selecionar UF = `MG`. 4. Selecionar Analise de Score = `Sem Score`. 5. Desmarcar checkbox "Incluir editais encerrados". 6. Clicar em "Buscar Editais". |
| **Saida esperada** | Tabela de resultados e populada. A coluna Score esta vazia ou com traco (sem calculo). Todos os editais exibem UF=MG. A busca e mais rapida que com score. |
| **Tipo** | Positivo |

### CT-CV01-05 — Busca 5: "material laboratorial" com encerrados e Score Rapido

| Campo | Valor |
|---|---|
| **ID** | CT-CV01-05 |
| **Descricao** | Verificar busca incluindo editais encerrados, UF=Todas, Score Rapido |
| **Pre-condicoes** | Pagina Captacao acessivel |
| **Acoes do ator e dados de entrada** | 1. Limpar campo de busca anterior. 2. Preencher campo "Termo de busca" com `material laboratorial`. 3. Selecionar UF = `Todas` (deixar em branco). 4. Selecionar Fonte = `PNCP`. 5. Selecionar Analise de Score = `Score Rapido`. 6. Marcar checkbox "Incluir editais encerrados". 7. Clicar em "Buscar Editais". |
| **Saida esperada** | Tabela de resultados inclui editais ativos e encerrados. Editais encerrados exibem diferenciacao visual (badge "Encerrado" ou cor diferente). Scores rapidos calculados para todos os editais. |
| **Tipo** | Positivo |

### CT-CV01-06 — Busca com termo menor que 3 caracteres (fluxo de excecao)

| Campo | Valor |
|---|---|
| **ID** | CT-CV01-06 |
| **Descricao** | Verificar que o sistema impede busca com termo vazio ou com menos de 3 caracteres (RN-077) |
| **Pre-condicoes** | Pagina Captacao acessivel |
| **Acoes do ator e dados de entrada** | 1. Preencher campo "Termo de busca" com `re` (apenas 2 caracteres). 2. Clicar em "Buscar Editais". |
| **Saida esperada** | Sistema exibe validacao: "Informe ao menos 3 caracteres no termo de busca." A busca nao e executada. Nenhum resultado e exibido. |
| **Tipo** | Negativo |

### CT-CV01-07 — Busca sem resultados (fluxo alternativo)

| Campo | Valor |
|---|---|
| **ID** | CT-CV01-07 |
| **Descricao** | Verificar comportamento quando a busca nao retorna resultados |
| **Pre-condicoes** | Pagina Captacao acessivel |
| **Acoes do ator e dados de entrada** | 1. Preencher campo "Termo de busca" com `xyzinexistente999`. 2. Selecionar UF = `Todas`. 3. Selecionar Fonte = `PNCP`. 4. Selecionar Analise de Score = `Sem Score`. 5. Clicar em "Buscar Editais". |
| **Saida esperada** | Sistema exibe mensagem informativa: "Nenhum edital encontrado para os criterios informados." A tabela permanece vazia. StatCards permanecem zerados. |
| **Tipo** | Negativo |

---

## UC-CV02 — Explorar resultados e painel lateral

### CT-CV02-01 — Abrir painel lateral do primeiro edital da Busca 1

| Campo | Valor |
|---|---|
| **ID** | CT-CV02-01 |
| **Descricao** | Verificar que o painel lateral abre ao clicar no primeiro edital da busca "reagente hematologia" com score >= 40% |
| **Pre-condicoes** | CT-CV01-01 concluido com sucesso (resultados da Busca 1 visiveis) |
| **Acoes do ator e dados de entrada** | 1. Na lista de resultados da Busca 1, localizar o primeiro edital com score >= 40%. 2. Clicar sobre o edital (titulo ou botao "Ver detalhes"). |
| **Saida esperada** | Painel lateral abre exibindo: Titulo do edital, Orgao comprador, Numero do edital/codigo PNCP, Data de abertura/encerramento, Valor estimado, Modalidade, Score de aderencia, Produto Correspondente = `Kit de Reagentes para Hemograma Completo Sysmex XN`. |
| **Tipo** | Positivo |

### CT-CV02-02 — Verificar produto match no painel lateral

| Campo | Valor |
|---|---|
| **ID** | CT-CV02-02 |
| **Descricao** | Verificar que o produto com maior compatibilidade exibido no painel e o Kit Sysmex XN |
| **Pre-condicoes** | CT-CV02-01 concluido (painel lateral aberto) |
| **Acoes do ator e dados de entrada** | 1. No painel lateral, verificar a secao de compatibilidade/produto correspondente. |
| **Saida esperada** | O produto `Kit de Reagentes para Hemograma Completo Sysmex XN` aparece como match na secao de compatibilidade do painel. |
| **Tipo** | Positivo |

### CT-CV02-03 — Explorar segundo edital da Busca 2

| Campo | Valor |
|---|---|
| **ID** | CT-CV02-03 |
| **Descricao** | Verificar que o painel lateral atualiza ao trocar de edital |
| **Pre-condicoes** | Busca 2 executada ("kit diagnostico laboratorio", NCM 3822.19.90, UF=SP, Score Hibrido) com resultados |
| **Acoes do ator e dados de entrada** | 1. Executar Busca 2 se nao estiver visivel. 2. Clicar no segundo edital da lista para abrir seu painel lateral. |
| **Saida esperada** | Painel lateral se atualiza com informacoes do segundo edital. Orgao e titulo sao de SP. Informacoes sao diferentes do primeiro edital. |
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
| **Descricao** | Verificar salvamento individual de um edital da busca "reagente hematologia" com bom score |
| **Pre-condicoes** | CT-CV01-01 concluido, resultados visiveis |
| **Acoes do ator e dados de entrada** | 1. Executar Busca 1 se necessario: termo `reagente hematologia`, UF=Todas, Fonte=PNCP, Score Rapido. 2. Na lista de resultados, localizar um edital com bom score. 3. Clicar no botao "Salvar" (icone disquete/favorito) ao lado desse edital. |
| **Saida esperada** | Badge "Salvo" aparece na linha do edital (icone preenchido, cor diferente ou texto "Salvo"). Toast de confirmacao exibido. O edital passa a ser elegivel na ValidacaoPage. |
| **Tipo** | Positivo |

### CT-CV03-02 — Cenario 2: Salvar 2 editais selecionados da Busca 2

| Campo | Valor |
|---|---|
| **ID** | CT-CV03-02 |
| **Descricao** | Verificar salvamento em lote de 2 editais selecionados via checkbox |
| **Pre-condicoes** | Busca 2 executada ("kit diagnostico laboratorio", NCM 3822.19.90, SP, Score Hibrido) com >= 2 resultados |
| **Acoes do ator e dados de entrada** | 1. Executar Busca 2 se necessario. 2. Marcar checkbox do 1o edital da lista. 3. Marcar checkbox do 2o edital da lista. 4. Clicar em "Salvar Selecionados". |
| **Saida esperada** | Os dois editais exibem badge "Salvo". Mensagem de confirmacao indica que 2 editais foram salvos (ex: "2 editais salvos com sucesso"). |
| **Tipo** | Positivo |

### CT-CV03-03 — Cenario 3: Salvar todos os editais da Busca 4

| Campo | Valor |
|---|---|
| **ID** | CT-CV03-03 |
| **Descricao** | Verificar salvamento em lote de todos os editais da Busca 4 |
| **Pre-condicoes** | Busca 4 executada ("glicose enzimatica laboratorio", UF=MG, Sem Score) com resultados |
| **Acoes do ator e dados de entrada** | 1. Executar Busca 4 se necessario. 2. Clicar em "Salvar Todos". |
| **Saida esperada** | Todos os editais da lista recebem badge "Salvo". Toast de confirmacao exibido com quantidade total salva (ex: "X editais salvos com sucesso"). |
| **Tipo** | Positivo |

### CT-CV03-04 — Salvar edital ja salvo (fluxo alternativo — duplicata)

| Campo | Valor |
|---|---|
| **ID** | CT-CV03-04 |
| **Descricao** | Verificar comportamento ao tentar salvar um edital que ja foi salvo anteriormente |
| **Pre-condicoes** | CT-CV03-01 concluido (edital ja salvo) |
| **Acoes do ator e dados de entrada** | 1. Localizar o edital salvo em CT-CV03-01 (com badge "Salvo"). 2. Clicar novamente no botao "Salvar" desse edital. |
| **Saida esperada** | Sistema atualiza o registro existente (upsert) em vez de criar duplicata. Toast: "Edital atualizado com sucesso." O botao "Salvar" esta desabilitado ou exibe "Ja Salvo". |
| **Tipo** | Limite |

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

### CT-CV04-01 — Estrategia 1: Estrategico, margem 20%, sem variacoes

| Campo | Valor |
|---|---|
| **ID** | CT-CV04-01 |
| **Descricao** | Verificar definicao de estrategia "Estrategico" com margem 20% para edital de reagentes hematologia |
| **Pre-condicoes** | CT-CV03-01 concluido (edital salvo da Busca 1) |
| **Acoes do ator e dados de entrada** | 1. Localizar edital salvo da Busca 1 ("reagente hematologia"). 2. Abrir painel lateral ou opcao "Definir Estrategia". 3. Selecionar Tipo de Estrategia = `Estrategico`. 4. Ajustar Margem Minima para `20` (slider ou campo). 5. Desativar toggle "Varia por Produto". 6. Desativar toggle "Varia por Regiao". 7. Clicar em "Salvar Estrategia". |
| **Saida esperada** | Toast de sucesso exibido. Badge "Estrategico" visivel no edital. Ao fechar e reabrir o painel: radio "Estrategico" marcado, margem=20%, "Varia por Produto"=Nao, "Varia por Regiao"=Nao. |
| **Tipo** | Positivo |

### CT-CV04-02 — Estrategia 2: Acompanhamento, margem 15%, Varia por Produto=Sim e Regiao=Sim

| Campo | Valor |
|---|---|
| **ID** | CT-CV04-02 |
| **Descricao** | Verificar definicao de estrategia "Acompanhamento" com margem 15% e ambas variacoes ativas |
| **Pre-condicoes** | CT-CV03-03 concluido (edital salvo da Busca 4 — "glicose enzimatica laboratorio") |
| **Acoes do ator e dados de entrada** | 1. Localizar edital salvo da Busca 4. 2. Abrir painel lateral ou opcao "Definir Estrategia". 3. Selecionar Tipo de Estrategia = `Acompanhamento`. 4. Ajustar Margem Minima para `15`. 5. Ativar toggle "Varia por Produto". 6. Ativar toggle "Varia por Regiao". 7. Clicar em "Salvar Estrategia". |
| **Saida esperada** | Toast de sucesso exibido. Badge "Acompanhamento" visivel no edital. Ao fechar e reabrir: radio "Acompanhamento" marcado, margem=15%, "Varia por Produto"=Sim, "Varia por Regiao"=Sim. Ambas variacoes aceitas simultaneamente. |
| **Tipo** | Positivo |

### CT-CV04-03 — Estrategia 3: Aprendizado, margem 5%, sem variacoes

| Campo | Valor |
|---|---|
| **ID** | CT-CV04-03 |
| **Descricao** | Verificar definicao de estrategia "Aprendizado" com margem 5% |
| **Pre-condicoes** | CT-CV03-02 concluido (edital salvo da Busca 2) |
| **Acoes do ator e dados de entrada** | 1. Localizar outro edital salvo (da Busca 2 ou qualquer outro). 2. Abrir painel lateral ou opcao "Definir Estrategia". 3. Selecionar Tipo de Estrategia = `Aprendizado`. 4. Ajustar Margem Minima para `5`. 5. Desativar toggle "Varia por Produto". 6. Desativar toggle "Varia por Regiao". 7. Clicar em "Salvar Estrategia". |
| **Saida esperada** | Toast de sucesso exibido. Badge "Aprendizado" visivel no edital. Ao fechar e reabrir: radio "Aprendizado" marcado, margem=5%, sem variacoes. |
| **Tipo** | Positivo |

### CT-CV04-04 — Persistencia: verificar estrategias apos navegar entre paginas

| Campo | Valor |
|---|---|
| **ID** | CT-CV04-04 |
| **Descricao** | Verificar que as 3 estrategias persistem apos navegar para outra pagina e voltar |
| **Pre-condicoes** | CT-CV04-01, CT-CV04-02 e CT-CV04-03 concluidos |
| **Acoes do ator e dados de entrada** | 1. Navegar para outra pagina (ex: Dashboard). 2. Voltar a tela onde os editais com estrategias estao. 3. Verificar estrategia de cada edital. |
| **Saida esperada** | Edital Busca 1: Estrategico, 20%, sem variacoes. Edital Busca 4: Acompanhamento, 15%, Varia por Produto=Sim, Varia por Regiao=Sim. Edital Busca 2: Aprendizado, 5%, sem variacoes. Todas persistem corretamente. |
| **Tipo** | Positivo |

### CT-CV04-05 — Fechar painel sem salvar (fluxo alternativo)

| Campo | Valor |
|---|---|
| **ID** | CT-CV04-05 |
| **Descricao** | Verificar que alteracoes nao persistem se o painel for fechado sem salvar |
| **Pre-condicoes** | Edital com estrategia ja definida (CT-CV04-01 concluido) |
| **Acoes do ator e dados de entrada** | 1. Abrir painel do edital da Busca 1 (Estrategico, 20%). 2. Alterar radio para "Aprendizado" e margem para 5%. 3. Sem clicar "Salvar Estrategia", fechar painel (clicar em outro edital ou navegar). 4. Voltar ao edital da Busca 1. |
| **Saida esperada** | O edital ainda exibe: Estrategico, 20%, sem variacoes. As alteracoes nao foram persistidas. |
| **Tipo** | Negativo |

---

## UC-CV05 — Exportar e consolidar

### CT-CV05-01 — Exportar CSV da Busca 1

| Campo | Valor |
|---|---|
| **ID** | CT-CV05-01 |
| **Descricao** | Verificar exportacao de resultados da Busca 1 em formato CSV |
| **Pre-condicoes** | Busca 1 executada ("reagente hematologia", Todas UFs, PNCP, Score Rapido, encerrados=Nao) com resultados |
| **Acoes do ator e dados de entrada** | 1. Executar Busca 1 se necessario. 2. Clicar em "Exportar CSV" na secao Acoes em Lote. |
| **Saida esperada** | Download de arquivo .csv e iniciado. O arquivo contem colunas com dados dos editais (titulo, orgao, score, etc.) em formato tabular. O arquivo nao esta vazio. |
| **Tipo** | Positivo |

### CT-CV05-02 — Relatorio Completo da Busca 5

| Campo | Valor |
|---|---|
| **ID** | CT-CV05-02 |
| **Descricao** | Verificar geracao de relatorio completo consolidado da Busca 5 |
| **Pre-condicoes** | Busca 5 executada ("material laboratorial", Todas UFs, PNCP, Score Rapido, encerrados=Sim) com resultados |
| **Acoes do ator e dados de entrada** | 1. Executar Busca 5 se necessario. 2. Clicar em "Relatorio Completo" na secao Acoes em Lote. |
| **Saida esperada** | Relatorio e gerado e exibido (PDF, markdown/HTML ou nova aba). Contem informacoes detalhadas dos editais, mais completo que o CSV. Conteudo nao vazio. |
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

### CT-CV06-01 — Criar Monitoramento 1: reagente hematologia hemograma

| Campo | Valor |
|---|---|
| **ID** | CT-CV06-01 |
| **Descricao** | Verificar criacao de monitoramento com termo, NCM, 4 UFs multiplas, frequencia 6h, score minimo 50 |
| **Pre-condicoes** | Pagina Captacao acessivel, secao Monitoramentos visivel |
| **Acoes do ator e dados de entrada** | 1. Clicar em "Novo Monitoramento". 2. Preencher Termo com `reagente hematologia hemograma`. 3. Preencher NCM com `3822.19.90`. 4. Marcar UFs: `SP`, `MG`, `PR`, `RS`. 5. Selecionar Fonte = `PNCP`. 6. Selecionar Frequencia/Intervalo = `A cada 6 horas`. 7. Preencher Score Minimo com `50`. 8. Desmarcar "Incluir Encerrados". 9. Clicar em "Criar". |
| **Saida esperada** | Monitoramento aparece na tabela/lista de monitoramentos ativos com: termo="reagente hematologia hemograma", UFs=SP/MG/PR/RS, frequencia=6h, score min=50, status="Ativo" (badge verde). |
| **Tipo** | Positivo |

### CT-CV06-02 — Criar Monitoramento 2: reagente bioquimico glicose colesterol

| Campo | Valor |
|---|---|
| **ID** | CT-CV06-02 |
| **Descricao** | Verificar criacao de segundo monitoramento com UF=Todas, frequencia 24h, encerrados=Sim |
| **Pre-condicoes** | CT-CV06-01 concluido |
| **Acoes do ator e dados de entrada** | 1. Clicar em "Novo Monitoramento". 2. Preencher Termo com `reagente bioquimico glicose colesterol`. 3. Preencher NCM com `3822.19.90`. 4. Marcar UFs = Todas (deixar em branco ou selecionar "Todas"). 5. Selecionar Fonte = `PNCP`. 6. Selecionar Frequencia/Intervalo = `A cada 24 horas`. 7. Preencher Score Minimo com `40`. 8. Marcar "Incluir Encerrados". 9. Clicar em "Criar". |
| **Saida esperada** | Segundo monitoramento aparece na lista com status "Ativo". Dois monitoramentos listados no total. |
| **Tipo** | Positivo |

### CT-CV06-03 — Criar Monitoramento 3: material laboratorio clinico (sem NCM)

| Campo | Valor |
|---|---|
| **ID** | CT-CV06-03 |
| **Descricao** | Verificar criacao de monitoramento sem NCM (campo vazio aceito), UF=SP, frequencia 12h |
| **Pre-condicoes** | CT-CV06-02 concluido |
| **Acoes do ator e dados de entrada** | 1. Clicar em "Novo Monitoramento". 2. Preencher Termo com `material laboratorio clinico`. 3. Deixar NCM em branco (campo vazio). 4. Marcar UFs = `SP`. 5. Selecionar Fonte = `PNCP`. 6. Selecionar Frequencia/Intervalo = `A cada 12 horas`. 7. Preencher Score Minimo com `30`. 8. Desmarcar "Incluir Encerrados". 9. Clicar em "Criar". |
| **Saida esperada** | Terceiro monitoramento criado com sucesso sem NCM. Tres monitoramentos listados, todos com status "Ativo". |
| **Tipo** | Positivo |

### CT-CV06-04 — Pausar Monitoramento 2

| Campo | Valor |
|---|---|
| **ID** | CT-CV06-04 |
| **Descricao** | Verificar que pausar monitoramento muda o status para "Pausado" |
| **Pre-condicoes** | CT-CV06-02 concluido, Mon 2 ativo |
| **Acoes do ator e dados de entrada** | 1. Na linha do Mon 2 ("reagente bioquimico glicose colesterol"), clicar em "Pausar". |
| **Saida esperada** | Status do Mon 2 muda para "Pausado" (ou "Inativo"). Mon 1 e Mon 3 permanecem "Ativo". |
| **Tipo** | Positivo |

### CT-CV06-05 — Atualizar Monitoramento 1 (score minimo de 50 para 60)

| Campo | Valor |
|---|---|
| **ID** | CT-CV06-05 |
| **Descricao** | Verificar edicao de monitoramento existente alterando score minimo |
| **Pre-condicoes** | CT-CV06-01 concluido, Mon 1 ativo |
| **Acoes do ator e dados de entrada** | 1. Na linha do Mon 1 ("reagente hematologia hemograma"), clicar em "Editar". 2. Alterar Score Minimo de `50` para `60`. 3. Salvar. |
| **Saida esperada** | Score minimo do Mon 1 agora exibe `60` na lista. Toast de confirmacao exibido. O monitoramento nao e duplicado. |
| **Tipo** | Positivo |

### CT-CV06-06 — Retomar Monitoramento 2

| Campo | Valor |
|---|---|
| **ID** | CT-CV06-06 |
| **Descricao** | Verificar que retomar monitoramento muda o status de volta para "Ativo" |
| **Pre-condicoes** | CT-CV06-04 concluido, Mon 2 pausado |
| **Acoes do ator e dados de entrada** | 1. Na linha do Mon 2 ("reagente bioquimico glicose colesterol"), clicar em "Retomar" (ou "Ativar", "Play"). |
| **Saida esperada** | Status do Mon 2 volta para "Ativo". Todos os tres monitoramentos com status "Ativo". |
| **Tipo** | Positivo |

### CT-CV06-07 — Excluir Monitoramento 3

| Campo | Valor |
|---|---|
| **ID** | CT-CV06-07 |
| **Descricao** | Verificar exclusao de monitoramento |
| **Pre-condicoes** | CT-CV06-06 concluido, tres monitoramentos ativos |
| **Acoes do ator e dados de entrada** | 1. Na linha do Mon 3 ("material laboratorio clinico"), clicar em "Excluir". 2. Confirmar exclusao se modal de confirmacao aparecer. |
| **Saida esperada** | Mon 3 desaparece da lista. Restam apenas Mon 1 (score min=60, 4 UFs, 6h) e Mon 2 (score min=40, Todas UFs, 24h), ambos com status "Ativo". |
| **Tipo** | Positivo |

### CT-CV06-08 — Criar monitoramento sem termo (fluxo de excecao)

| Campo | Valor |
|---|---|
| **ID** | CT-CV06-08 |
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
| **Descricao** | Verificar que a pagina Validacao lista todos os editais salvos pela empresa RP3X |
| **Pre-condicoes** | Editais salvos nos cenarios CT-CV03-01 a CT-CV03-03 |
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
| **Saida esperada** | Apenas editais com status "Novo" sao exibidos (editais recem-salvos que ainda nao receberam decisao GO/NO-GO). |
| **Tipo** | Positivo |

### CT-CV07-03 — Buscar por texto "reagente"

| Campo | Valor |
|---|---|
| **ID** | CT-CV07-03 |
| **Descricao** | Verificar busca textual na lista de editais salvos com o termo "reagente" |
| **Pre-condicoes** | CT-CV07-01 concluido, filtro Status=Todos |
| **Acoes do ator e dados de entrada** | 1. Selecionar Status = `Todos`. 2. Preencher campo "Buscar edital..." com `reagente`. |
| **Saida esperada** | Tabela e filtrada mostrando apenas editais cujo objeto/numero contem "reagente". Pelo menos 1 edital da Busca 1 aparece. |
| **Tipo** | Positivo |

### CT-CV07-04 — Buscar por texto "glicose"

| Campo | Valor |
|---|---|
| **ID** | CT-CV07-04 |
| **Descricao** | Verificar busca textual com termo "glicose" |
| **Pre-condicoes** | CT-CV07-01 concluido |
| **Acoes do ator e dados de entrada** | 1. Limpar campo de busca. 2. Preencher campo "Buscar edital..." com `glicose`. |
| **Saida esperada** | Tabela e filtrada mostrando apenas editais relacionados a "glicose" (da Busca 4 do UC-CV01). |
| **Tipo** | Positivo |

### CT-CV07-05 — Selecionar edital e verificar 6 abas

| Campo | Valor |
|---|---|
| **ID** | CT-CV07-05 |
| **Descricao** | Verificar que selecionar um edital exibe o Card Edital Info e as 6 abas de analise |
| **Pre-condicoes** | CT-CV07-03 concluido, edital de reagente visivel |
| **Acoes do ator e dados de entrada** | 1. Limpar filtro de busca. 2. Localizar edital da Busca 1 ("reagente hematologia"). 3. Clicar na linha do edital. |
| **Saida esperada** | Card "Edital Info" visivel com: Numero, Orgao, Objeto, Valor. 6 abas visiveis e clicaveis: Aderencia, Lotes, Documentos, Riscos, Mercado, IA. |
| **Tipo** | Positivo |

### CT-CV07-06 — Lista vazia na ValidacaoPage (fluxo alternativo)

| Campo | Valor |
|---|---|
| **ID** | CT-CV07-06 |
| **Descricao** | Verificar comportamento quando nenhum edital foi salvo (cenario hipotetico) |
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
| **Descricao** | Verificar calculo de scores multidimensionais para edital de "reagente hematologia" |
| **Pre-condicoes** | CT-CV07-05 concluido (edital de reagente selecionado), aba Aderencia acessivel |
| **Acoes do ator e dados de entrada** | 1. Clicar na aba "Aderencia". 2. Clicar em "Calcular Scores IA". 3. Aguardar processamento (15 a 45 segundos). |
| **Saida esperada** | 6 dimensoes de score exibidas com indicadores visuais (barras, cores): Tecnica (60-90%), Documental (50-80%), Financeira (40-75%), Experiencia (45-80%), Geografica (30-70%), Prazo (50-85%). ScoreCircle (score geral) visivel. Badge "Decisao IA" visivel. |
| **Tipo** | Positivo |

### CT-CV08-02 — Decidir GO com justificativa

| Campo | Valor |
|---|---|
| **ID** | CT-CV08-02 |
| **Descricao** | Verificar decisao GO com preenchimento de motivo e detalhes para edital de reagentes |
| **Pre-condicoes** | CT-CV08-01 concluido (scores calculados) |
| **Acoes do ator e dados de entrada** | 1. Clicar em "Participar (GO)". 2. Preencher campo Motivo com `Boa aderencia tecnica`. 3. Preencher campo Detalhes com `Kit Sysmex XN atende todos os parametros do edital. Empresa possui AFE vigente e documentacao fiscal completa.`. 4. Clicar em "Salvar Justificativa". |
| **Saida esperada** | Botao GO fica verde/ativo. Toast de sucesso exibido. Status do edital muda para "GO" na tabela de Meus Editais. Badge verde visivel. |
| **Tipo** | Positivo |

### CT-CV08-03 — Decidir Em Avaliacao com justificativa (outro edital)

| Campo | Valor |
|---|---|
| **ID** | CT-CV08-03 |
| **Descricao** | Verificar decisao Em Avaliacao para um edital diferente com motivo de pendencia documental |
| **Pre-condicoes** | Outro edital salvo disponivel, diferente do que recebeu GO |
| **Acoes do ator e dados de entrada** | 1. Voltar a lista de Validacao. 2. Selecionar outro edital (diferente do que recebeu GO). 3. Clicar na aba "Aderencia". 4. Clicar em "Calcular Scores IA". 5. Aguardar processamento. 6. Clicar em "Acompanhar (Em Avaliacao)". 7. Preencher Motivo com `Pendencia documental`. 8. Preencher Detalhes com `Necessario atualizar atestado de capacidade tecnica antes de participar. Demais criterios atendem.`. 9. Clicar em "Salvar Justificativa". |
| **Saida esperada** | Botao Em Avaliacao fica amarelo/laranja/ativo. Toast de sucesso exibido. Status do edital muda para "Em Avaliacao". Badge amarelo/laranja visivel na lista. |
| **Tipo** | Positivo |

### CT-CV08-04 — Verificar status na lista apos decisoes

| Campo | Valor |
|---|---|
| **ID** | CT-CV08-04 |
| **Descricao** | Verificar que os badges de status refletem as decisoes tomadas na lista de Validacao |
| **Pre-condicoes** | CT-CV08-02 e CT-CV08-03 concluidos |
| **Acoes do ator e dados de entrada** | 1. Voltar a lista de Validacao. 2. Verificar badges de status dos 2 editais. |
| **Saida esperada** | Primeiro edital: badge "GO" (verde). Segundo edital: badge "Em Avaliacao" (amarelo/laranja). Filtro por Status "GO" mostra apenas o primeiro. Filtro "Em Avaliacao" mostra apenas o segundo. |
| **Tipo** | Positivo |

### CT-CV08-05 — Timeout no calculo de scores (fluxo de excecao)

| Campo | Valor |
|---|---|
| **ID** | CT-CV08-05 |
| **Descricao** | Verificar comportamento quando o calculo de scores excede o timeout |
| **Pre-condicoes** | Edital selecionado, servico de IA lento ou indisponivel |
| **Acoes do ator e dados de entrada** | 1. Clicar em "Calcular Scores IA". 2. Aguardar alem do timeout. |
| **Saida esperada** | Sistema exibe mensagem: "O calculo de scores demorou mais que o esperado. Tente novamente." Scores nao sao atualizados. |
| **Tipo** | Negativo |

---

## UC-CV09 — Importar itens e extrair lotes

### CT-CV09-01 — Importar itens do PNCP (reagentes laboratoriais)

| Campo | Valor |
|---|---|
| **ID** | CT-CV09-01 |
| **Descricao** | Verificar importacao de itens do PNCP para o edital de reagentes com decisao GO |
| **Pre-condicoes** | CT-CV08-02 concluido (edital "reagente hematologia" com decisao GO selecionado) |
| **Acoes do ator e dados de entrada** | 1. Clicar na aba "Lotes". 2. Clicar em "Buscar Itens no PNCP". 3. Aguardar carregamento (10-30 segundos). |
| **Saida esperada** | Tabela "Itens do Edital" e populada com aproximadamente 8 itens de reagentes e material laboratorial. Itens esperados incluem: Reagente para hemograma completo, Diluente para hematologia, Lisante para hematologia, Calibrador hematologico, Controle hematologico, Reagente de glicose GOD-PAP, Reagente de colesterol, Ponteiras descartaveis. Colunas visiveis: #, Descricao, Qtd, Unid, Vlr Unit, Vlr Total. |
| **Tipo** | Positivo |

### CT-CV09-02 — Extrair lotes via IA (3 lotes esperados)

| Campo | Valor |
|---|---|
| **ID** | CT-CV09-02 |
| **Descricao** | Verificar extracao de lotes via IA apos importacao de itens de reagentes |
| **Pre-condicoes** | CT-CV09-01 concluido (itens importados) |
| **Acoes do ator e dados de entrada** | 1. Clicar em "Extrair Lotes via IA". 2. Aguardar processamento (15-45 segundos). |
| **Saida esperada** | 3 cards de lote aparecem: Lote 1 "Hematologia" (itens 1-5: reagente hemograma, diluente, lisante, calibrador, controle), Lote 2 "Bioquimica" (itens 6-7: glicose GOD-PAP, colesterol), Lote 3 "Material de Consumo" (item 8: ponteiras). Cada lote tem titulo descritivo, valor estimado e lista de itens. |
| **Tipo** | Positivo |

### CT-CV09-03 — Mover item 8 (ponteiras) do Lote 3 para Lote 1

| Campo | Valor |
|---|---|
| **ID** | CT-CV09-03 |
| **Descricao** | Verificar movimentacao de item entre lotes (ponteiras do Lote 3 para Lote 1) |
| **Pre-condicoes** | CT-CV09-02 concluido (3 lotes extraidos) |
| **Acoes do ator e dados de entrada** | 1. Localizar item 8 (ponteiras) no Lote 3 (Material de Consumo). 2. No select "Mover para" do item, selecionar "Lote 1" (Hematologia). |
| **Saida esperada** | Item 8 (ponteiras) desaparece do Lote 3 e aparece no Lote 1. Lote 3 fica vazio. Lote 1 agora tem 6 itens. |
| **Tipo** | Positivo |

### CT-CV09-04 — Excluir Lote 3 (vazio)

| Campo | Valor |
|---|---|
| **ID** | CT-CV09-04 |
| **Descricao** | Verificar exclusao de lote vazio apos movimentacao de item |
| **Pre-condicoes** | CT-CV09-03 concluido (Lote 3 vazio) |
| **Acoes do ator e dados de entrada** | 1. Localizar Lote 3 (vazio). 2. Clicar no icone "X" (Excluir lote) do Lote 3. 3. Confirmar exclusao se modal aparecer. |
| **Saida esperada** | Lote 3 e removido da interface. Restam 2 lotes: Lote 1 (Hematologia, 6 itens) e Lote 2 (Bioquimica, 2 itens). |
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

### CT-CV10-01 — Acessar aba Documentos e verificar categorias

| Campo | Valor |
|---|---|
| **ID** | CT-CV10-01 |
| **Descricao** | Verificar que a aba Documentos exibe categorias de documentos com badges de status |
| **Pre-condicoes** | CT-CV07-05 concluido (edital de reagentes selecionado), documentos da Sprint 1 cadastrados |
| **Acoes do ator e dados de entrada** | 1. Clicar na aba "Documentos". 2. Verificar visualmente as categorias. |
| **Saida esperada** | Categorias visiveis incluem: Habilitacao Juridica, Regularidade Fiscal, Qualificacao Tecnica, Sanitarias, Qualificacao Economica. Cada categoria exibe badges: Disponivel (verde), Vencido (vermelho), Faltante (cinza). |
| **Tipo** | Positivo |

### CT-CV10-02 — Identificar documentos exigidos pelo edital (com foco em ANVISA)

| Campo | Valor |
|---|---|
| **ID** | CT-CV10-02 |
| **Descricao** | Verificar extracao de requisitos documentais via IA com identificacao de documentos especificos para reagentes laboratoriais |
| **Pre-condicoes** | CT-CV10-01 concluido |
| **Acoes do ator e dados de entrada** | 1. Clicar em "Identificar Documentos Exigidos pelo Edital". 2. Aguardar processamento. |
| **Saida esperada** | Checklist de documentos e exibido incluindo: Habilitacao Juridica (Contrato Social, Procuracao), Regularidade Fiscal (Certidao Federal, FGTS, Trabalhista), Qualificacao Tecnica (AFE ANVISA), Sanitarias (Licenca Sanitaria, Registro ANVISA, Certificado de Boas Praticas, Laudo de Estabilidade), Qualificacao Economica (Balanco Patrimonial, Certidao Negativa de Falencia). A barra de completude e atualizada com percentual e contadores. |
| **Tipo** | Positivo |

### CT-CV10-03 — Buscar documentos exigidos via chat IA

| Campo | Valor |
|---|---|
| **ID** | CT-CV10-03 |
| **Descricao** | Verificar consulta ao chat IA sobre documentos exigidos |
| **Pre-condicoes** | CT-CV10-01 concluido |
| **Acoes do ator e dados de entrada** | 1. Clicar em "Buscar Documentos Exigidos". 2. Aguardar resposta. |
| **Saida esperada** | Resposta da IA e exibida listando os documentos exigidos pelo edital. Documentos especificos para reagentes (AFE ANVISA, Licenca Sanitaria, Registro ANVISA) devem ser mencionados. |
| **Tipo** | Positivo |

### CT-CV10-04 — Confrontar documentacao com base da empresa

| Campo | Valor |
|---|---|
| **ID** | CT-CV10-04 |
| **Descricao** | Verificar confrontacao dos documentos exigidos com os cadastrados pela empresa RP3X |
| **Pre-condicoes** | CT-CV10-02 concluido |
| **Acoes do ator e dados de entrada** | 1. Verificar indicadores de status para cada documento na lista. |
| **Saida esperada** | Cada documento exigido exibe indicador de status: Verde (empresa possui e esta valido), Amarelo (empresa possui mas proximo do vencimento), Vermelho (empresa nao possui ou esta vencido). Documentos ANVISA devem ter status diferenciado. |
| **Tipo** | Positivo |

### CT-CV10-05 — Verificar certidoes

| Campo | Valor |
|---|---|
| **ID** | CT-CV10-05 |
| **Descricao** | Verificar atualizacao de status de certidoes |
| **Pre-condicoes** | CT-CV10-01 concluido |
| **Acoes do ator e dados de entrada** | 1. Clicar em "Verificar Certidoes". 2. Aguardar processamento. |
| **Saida esperada** | Status das certidoes e atualizado. Badges de status (Atendido/Valido/Pendente/Vencido) sao exibidos. Nota: pode haver divergencia funcional conhecida (empresa_id = edital.id). |
| **Tipo** | Positivo |

---

## UC-CV11 — Analisar riscos, atas, concorrentes

### CT-CV11-01 — Analisar riscos do edital (riscos especificos de reagentes)

| Campo | Valor |
|---|---|
| **ID** | CT-CV11-01 |
| **Descricao** | Verificar analise de riscos com identificacao de riscos especificos para reagentes laboratoriais |
| **Pre-condicoes** | CT-CV07-05 concluido (edital de reagentes selecionado) |
| **Acoes do ator e dados de entrada** | 1. Clicar na aba "Riscos". 2. Clicar em "Analisar Riscos do Edital". 3. Aguardar processamento. |
| **Saida esperada** | Lista de riscos exibida com niveis de severidade. Riscos esperados incluem: AFE ANVISA exigida (Alto), Exclusividade de plataforma/comodato (Critico), Compatibilidade com equipamento especifico (Alto), Prazo de validade minimo dos reagentes (Medio), Cadeia fria 2-8C para transporte e armazenamento (Alto), Entrega fracionada (Medio). Cada risco com badge de severidade: Critico/Alto/Medio/Baixo. |
| **Tipo** | Positivo |

### CT-CV11-02 — Verificar falhas fatais (Fatal Flaws)

| Campo | Valor |
|---|---|
| **ID** | CT-CV11-02 |
| **Descricao** | Verificar identificacao de falhas fatais impeditivas para participacao |
| **Pre-condicoes** | CT-CV11-01 concluido |
| **Acoes do ator e dados de entrada** | 1. Verificar secao de "Falhas Fatais" ou destaques visuais (cor vermelha, icone alerta). |
| **Saida esperada** | Falhas fatais identificadas e destacadas visualmente: Especificacao de marca exclusiva (edital so aceita reagentes de uma marca), Comodato vinculado (edital exige equipamento em comodato de fabricante especifico). Se nao aplicaveis ao edital, mensagem "Nenhum risco eliminatorio" exibida. |
| **Tipo** | Positivo |

### CT-CV11-03 — Rebuscar atas de registro de precos

| Campo | Valor |
|---|---|
| **ID** | CT-CV11-03 |
| **Descricao** | Verificar busca de atas de registro de precos anteriores |
| **Pre-condicoes** | CT-CV11-01 concluido |
| **Acoes do ator e dados de entrada** | 1. Clicar em "Rebuscar Atas". 2. Aguardar processamento. |
| **Saida esperada** | Lista de atas e exibida (ou mensagem "Nenhuma ata encontrada" — ambos sao resultados validos). Se houver atas: titulo, orgao, UF, data e link "Ver no PNCP" visiveis. Badge "Recorrencia" (Semestral/Anual/Esporadica) exibido. |
| **Tipo** | Positivo |

### CT-CV11-04 — Buscar vencedores e concorrentes do segmento

| Campo | Valor |
|---|---|
| **ID** | CT-CV11-04 |
| **Descricao** | Verificar busca de vencedores e identificacao de concorrentes do segmento de reagentes laboratoriais |
| **Pre-condicoes** | CT-CV11-01 concluido |
| **Acoes do ator e dados de entrada** | 1. Clicar em "Buscar Vencedores e Precos". 2. Aguardar processamento. |
| **Saida esperada** | Tabela de concorrentes exibida. Concorrentes esperados do segmento de diagnostico laboratorial: Labtest, Wama, Siemens Healthineers, Beckman Coulter, Abbott Diagnostics. Colunas: Concorrente, Participacoes, Vitorias, Taxa (%). |
| **Tipo** | Positivo |

### CT-CV11-05 — Atualizar concorrentes

| Campo | Valor |
|---|---|
| **ID** | CT-CV11-05 |
| **Descricao** | Verificar atualizacao da tabela de concorrentes |
| **Pre-condicoes** | CT-CV11-04 concluido |
| **Acoes do ator e dados de entrada** | 1. Clicar em "Atualizar" na secao Concorrentes Conhecidos. 2. Aguardar processamento. |
| **Saida esperada** | Tabela "Concorrentes" e atualizada/recarregada. Dados de participacoes e vitorias podem ser recalculados. |
| **Tipo** | Positivo |

---

## UC-CV12 — Analisar mercado

### CT-CV12-01 — Analisar mercado do orgao (6 secoes)

| Campo | Valor |
|---|---|
| **ID** | CT-CV12-01 |
| **Descricao** | Verificar analise de mercado com todas as 6 secoes preenchidas para edital de reagentes |
| **Pre-condicoes** | CT-CV07-05 concluido (edital de reagentes selecionado) |
| **Acoes do ator e dados de entrada** | 1. Clicar na aba "Mercado". 2. Clicar em "Analisar Mercado do Orgao". 3. Aguardar processamento (15-60 segundos). |
| **Saida esperada** | 6 secoes preenchidas: (1) Dados do Orgao: Nome, CNPJ, localizacao e porte. (2) Reputacao: indicadores de adimplencia, historico de pagamentos. (3) Volume PNCP: quantidade de compras realizadas pelo orgao. (4) Compras Similares: compras anteriores de reagentes laboratoriais pelo mesmo orgao. (5) Historico Interno: participacoes anteriores da RP3X com esse orgao (pode estar vazio — primeiro contato — e isso e aceitavel). (6) Analise IA: texto consolidando as informacoes. |
| **Tipo** | Positivo |

### CT-CV12-02 — Verificar analise IA de mercado

| Campo | Valor |
|---|---|
| **ID** | CT-CV12-02 |
| **Descricao** | Verificar que a analise IA gera texto coerente mencionando o segmento de reagentes |
| **Pre-condicoes** | CT-CV12-01 concluido |
| **Acoes do ator e dados de entrada** | 1. Verificar secao "Analise de Mercado (IA)". |
| **Saida esperada** | Texto analitico longo e coerente, mencionando o orgao, o segmento de reagentes laboratoriais, e fazendo referencia aos dados das demais secoes. Texto nao vazio. |
| **Tipo** | Positivo |

### CT-CV12-03 — Compras Similares relevantes para reagentes

| Campo | Valor |
|---|---|
| **ID** | CT-CV12-03 |
| **Descricao** | Verificar que a secao Compras Similares mostra compras de reagentes e nao de outros materiais |
| **Pre-condicoes** | CT-CV12-01 concluido |
| **Acoes do ator e dados de entrada** | 1. Verificar secao "Compras Similares". |
| **Saida esperada** | Se houver compras anteriores, sao compras de reagentes laboratoriais (nao de outros materiais). Se nao houver, mensagem "Nenhuma compra similar encontrada" ou equivalente. |
| **Tipo** | Positivo |

---

## UC-CV13 — IA resumo e perguntas

### CT-CV13-01 — Gerar resumo do edital

| Campo | Valor |
|---|---|
| **ID** | CT-CV13-01 |
| **Descricao** | Verificar geracao de resumo executivo pelo IA para edital de reagentes |
| **Pre-condicoes** | CT-CV07-05 concluido (edital de reagentes selecionado) |
| **Acoes do ator e dados de entrada** | 1. Clicar na aba "IA". 2. Clicar em "Gerar Resumo". 3. Aguardar processamento. |
| **Saida esperada** | Resumo executivo gerado em markdown renderizado. Contem informacoes sobre: objeto da licitacao (reagentes e material laboratorial), orgao comprador, valor estimado, prazos, principais exigencias. Conteudo nao vazio e relevante ao edital. |
| **Tipo** | Positivo |

### CT-CV13-02 — Pergunta 1: compatibilidade de equipamento

| Campo | Valor |
|---|---|
| **ID** | CT-CV13-02 |
| **Descricao** | Verificar resposta da IA sobre compatibilidade de equipamento especifico |
| **Pre-condicoes** | CT-CV13-01 concluido |
| **Acoes do ator e dados de entrada** | 1. Preencher campo de pergunta com `Os reagentes precisam ser compativeis com algum equipamento especifico?`. 2. Clicar em "Perguntar" ou "Enviar". |
| **Saida esperada** | Resposta da IA e exibida contendo informacoes sobre compatibilidade de equipamento (se o edital mencionar algum modelo ou marca). Resposta relevante ao contexto do edital. |
| **Tipo** | Positivo |

### CT-CV13-03 — Pergunta 2: prazo de validade

| Campo | Valor |
|---|---|
| **ID** | CT-CV13-03 |
| **Descricao** | Verificar resposta da IA sobre prazo de validade minimo dos reagentes |
| **Pre-condicoes** | CT-CV13-01 concluido |
| **Acoes do ator e dados de entrada** | 1. Preencher campo de pergunta com `Qual o prazo de validade minimo exigido para os reagentes?`. 2. Clicar em "Perguntar". |
| **Saida esperada** | Resposta da IA contendo informacoes sobre prazo de validade minimo (geralmente 6 ou 12 meses para reagentes) ou informando que o edital nao especifica. |
| **Tipo** | Positivo |

### CT-CV13-04 — Pergunta 3: entrega fracionada

| Campo | Valor |
|---|---|
| **ID** | CT-CV13-04 |
| **Descricao** | Verificar resposta da IA sobre condicoes de entrega fracionada |
| **Pre-condicoes** | CT-CV13-01 concluido |
| **Acoes do ator e dados de entrada** | 1. Preencher campo de pergunta com `O edital exige entrega fracionada?`. 2. Clicar em "Perguntar". |
| **Saida esperada** | Resposta da IA abordando se o edital preve entregas parceladas (fracionadas) ou entrega unica. |
| **Tipo** | Positivo |

### CT-CV13-05 — Pergunta 4: AFE ANVISA

| Campo | Valor |
|---|---|
| **ID** | CT-CV13-05 |
| **Descricao** | Verificar resposta da IA sobre exigencia de AFE ANVISA |
| **Pre-condicoes** | CT-CV13-01 concluido |
| **Acoes do ator e dados de entrada** | 1. Preencher campo de pergunta com `E necessario AFE ANVISA?`. 2. Clicar em "Perguntar". |
| **Saida esperada** | Resposta da IA confirmando se o edital exige Autorizacao de Funcionamento Especial da ANVISA (muito provavel para reagentes). Idealmente especifica o tipo de autorizacao. |
| **Tipo** | Positivo |

### CT-CV13-06 — Pergunta 5: regime de fornecimento

| Campo | Valor |
|---|---|
| **ID** | CT-CV13-06 |
| **Descricao** | Verificar resposta da IA sobre modalidade de contratacao |
| **Pre-condicoes** | CT-CV13-01 concluido |
| **Acoes do ator e dados de entrada** | 1. Preencher campo de pergunta com `Qual o regime de fornecimento — registro de precos ou contrato direto?`. 2. Clicar em "Perguntar". |
| **Saida esperada** | Resposta da IA identificando se e Sistema de Registro de Precos (SRP) ou contrato direto. |
| **Tipo** | Positivo |

### CT-CV13-07 — Acao rapida: Requisitos Tecnicos

| Campo | Valor |
|---|---|
| **ID** | CT-CV13-07 |
| **Descricao** | Verificar extracao de requisitos tecnicos via acao rapida para reagentes |
| **Pre-condicoes** | CT-CV13-01 concluido |
| **Acoes do ator e dados de entrada** | 1. Clicar em "Requisitos Tecnicos". 2. Aguardar processamento. |
| **Saida esperada** | Lista de requisitos tecnicos especificos para reagentes exibida, incluindo: compatibilidade com equipamento especifico (se mencionado), prazo de validade minimo, certificados e registros exigidos (ANVISA, BPF), metodo analitico (enzimatico, colorimetrico, etc.). |
| **Tipo** | Positivo |

### CT-CV13-08 — Acao rapida: Classificar Edital

| Campo | Valor |
|---|---|
| **ID** | CT-CV13-08 |
| **Descricao** | Verificar classificacao do edital como "Consumo" para reagentes laboratoriais |
| **Pre-condicoes** | CT-CV13-01 concluido |
| **Acoes do ator e dados de entrada** | 1. Clicar em "Classificar Edital". 2. Aguardar processamento. |
| **Saida esperada** | Classificacao exibida: "Consumo" (ou "Material de Consumo") — reagentes sao materiais consumiveis, nao bens permanentes nem servicos. Justificativa da classificacao presente. |
| **Tipo** | Positivo |

### CT-CV13-09 — Regerar resumo

| Campo | Valor |
|---|---|
| **ID** | CT-CV13-09 |
| **Descricao** | Verificar regeneracao do resumo apos perguntas e acoes rapidas |
| **Pre-condicoes** | CT-CV13-01 a CT-CV13-08 concluidos |
| **Acoes do ator e dados de entrada** | 1. Clicar em "Regerar Resumo". 2. Aguardar processamento. |
| **Saida esperada** | Novo resumo e gerado e exibido (pode ser mais completo que o anterior, incorporando contexto das perguntas). Resumo nao vazio. Historico de perguntas permanece visivel. |
| **Tipo** | Positivo |

### CT-CV13-10 — IA indisponivel (fluxo de excecao)

| Campo | Valor |
|---|---|
| **ID** | CT-CV13-10 |
| **Descricao** | Verificar comportamento quando o servico de IA (DeepSeek) esta indisponivel |
| **Pre-condicoes** | Edital selecionado, servico DeepSeek indisponivel |
| **Acoes do ator e dados de entrada** | 1. Clicar na aba "IA". 2. Clicar em "Gerar Resumo". |
| **Saida esperada** | Sistema exibe mensagem: "Servico de IA indisponivel. Tente novamente mais tarde." Nenhum resumo e gerado. |
| **Tipo** | Negativo |

### CT-CV13-11 — Cooldown de 60s entre chamadas (fluxo de excecao, RN-084)

| Campo | Valor |
|---|---|
| **ID** | CT-CV13-11 |
| **Descricao** | Verificar que o sistema respeita o cooldown de 60 segundos entre chamadas DeepSeek por empresa |
| **Pre-condicoes** | CT-CV13-01 concluido (resumo recem-gerado, cooldown ativo) |
| **Acoes do ator e dados de entrada** | 1. Imediatamente apos gerar resumo, clicar em "Perguntar" com qualquer texto. |
| **Saida esperada** | Sistema retorna HTTP 429 ou mensagem indicando que o cooldown esta ativo. Pergunta nao e processada. Usuario deve aguardar 60 segundos antes de nova chamada. |
| **Tipo** | Negativo |
