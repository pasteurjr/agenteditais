# TUTORIAL DE VALIDACAO MANUAL — SPRINT 7 — CONJUNTO 1 (CH Hospitalar)

**Data:** 2026-04-16
**Empresa:** CH Hospitalar (CNPJ 43.712.232/0001-85)
**Dados de apoio:** `docs/dadossprint7-1.md`
**Referencia:** `docs/CASOS DE USO SPRINT7 V4.md`
**UCs cobertos:** 12 (ME01..ME04, AN01..AN05, AP01..AP03)
**Publico:** validador humano acompanhando roteiro passo-a-passo

---

## Credenciais e Login

| Campo | Valor |
|---|---|
| URL | http://localhost:5180 |
| Email | valida1@valida.com.br |
| Senha | 123456 |
| Empresa | CH Hospitalar |

### Fluxo de login
1. Abrir `http://localhost:5180`
2. Preencher email/senha e clicar **Entrar**
3. Na tela de selecao, clicar em **CH Hospitalar**
4. Aguardar dashboard carregar

---

## Pre-requisitos

- Backend rodando na porta **5007**
- Frontend rodando na porta **5180**
- Seeds executadas:
  - `python backend/seeds/sprint5_seed.py` (dados base)
  - `python backend/seeds/sprint6_seed.py` (dados Sprint 6)
  - `python backend/seeds/sprint7_seed.py` (dados Sprint 7)

---

## Indice

1. [FASE 1 — Inteligencia de Mercado (UC-ME01..ME04)](#fase-1)
2. [FASE 2 — Analytics Consolidado (UC-AN01..AN04)](#fase-2)
3. [FASE 3 — Perdas Expandido (UC-AN05)](#fase-3)
4. [FASE 4 — Pipeline de Aprendizado (UC-AP01..AP03)](#fase-4)

---

## FASE 1 — Inteligencia de Mercado (UC-ME01..ME04) <a id="fase-1"></a>

### UC-ME01 — Dashboard TAM/SAM/SOM na MercadoPage

1. Sidebar → **Mercado** (secao Indicadores)
2. Verificar 2 tabs: **TAM / SAM / SOM** (ativa, negrito) e **Intrusos**
3. Verificar filtros: select **Segmento** (Todos/Hematologia/...) e select **Periodo** (3m/6m/12m)
4. Verificar botao **Recalcular** visivel
5. Verificar 4 stat cards com valores nao-zero:
   - **Editais no Periodo** (>0)
   - **Valor Total TAM** (R$ >0)
   - **Valor Medio** (R$ >0)
   - 4o card presente
6. Verificar card **Funil de Mercado** com 3 niveis: TAM, SAM, SOM
7. Verificar card **Tendencias** (Editais por Mes ou "Nenhum dado")
8. **Interacao:** Mudar filtro Segmento para "Hematologia"
9. Clicar **Recalcular**
10. Verificar que stat cards atualizam (continuam visiveis com valores)

### UC-ME02 — Distribuicao Geografica SAM no CRM Mapa

1. Sidebar → **CRM** (secao Fluxo Comercial)
2. Clicar aba **Mapa**
3. Aguardar mapa Leaflet renderizar
4. Verificar 3 stat cards acima do mapa:
   - **Maior Oportunidade** (ou "UF Maior")
   - **Menor Participacao** (ou "UF Menor")
   - **UFs sem Presenca** (ou "sem Presenca")
5. Verificar filtros: select **Segmento** e select **Metrica**
6. Verificar mapa com marcadores circulares por UF
7. Verificar titulo "Distribuicao Geografica"
8. Verificar **Ranking de UFs** — tabela com pelo menos 1 linha
9. **Interacao:** Alterar filtro Metrica para "Valor"
10. Verificar mapa e titulo continuam visiveis

### UC-ME03 — Share vs Concorrentes na ConcorrenciaPage

1. Sidebar → **Concorrencia** (secao Indicadores)
2. Verificar 4 stat cards:
   - **Concorrentes Conhecidos** (>=5)
   - **Nossa Taxa** (percentual)
   - **Maior Ameaca** (nome do concorrente)
3. Verificar secao **Share de Mercado**
4. Verificar filtros: **Segmento** e **Periodo**
5. Verificar tabela de concorrentes com dados dos 5 do seed:
   - MedLab Sul, DiagTech, BioAnalise, LabNorte, QualiMed
   - Pelo menos 3 dos 5 nomes visiveis
   - Tabela com >=3 linhas
6. **Interacao:** Clicar na primeira linha da tabela
7. Verificar detalhe abre com info:
   - "Razao Social" ou "CNPJ" ou "Taxa de Sucesso"
   - "Historico" ou "Vitorias" ou "Derrotas"

### UC-ME04 — Detectar Itens Intrusos na MercadoPage tab Intrusos

1. Sidebar → **Mercado** → clicar tab **Intrusos**
2. Verificar 3 stat cards com valores reais:
   - **Intrusos Detectados** (>=1, seed tem 3)
   - **Editais Afetados**
   - **Valor em Risco**
3. Verificar filtro **Criticidade** e botao **Analisar Novo Edital**
4. Verificar **Itens Intrusos Detectados** — tabela com >=1 linha
5. Verificar badges de criticidade: **CRITICO** (vermelho) e/ou **MEDIO** (amarelo) e/ou **INFORMATIVO** (azul)
6. Verificar NCMs na tabela: 8415 ou 4802 ou 9402
7. **Interacao:** Clicar **Analisar Novo Edital**
   - Se modal abrir: verificar botao "Analisar com IA" e "Cancelar"
   - Clicar **Cancelar** para fechar
8. **Interacao:** Filtro Criticidade → selecionar "critico"
9. Verificar tabela filtrada mostra apenas itens CRITICO (se houver)

---

## FASE 2 — Analytics Consolidado (UC-AN01..AN04) <a id="fase-2"></a>

### UC-AN01 — Funil de Conversao Pipeline

1. Sidebar → **Analytics** (secao Indicadores)
2. Verificar header "Analytics" com subtitulo "Performance, conversoes e ROI"
3. Verificar 4 tabs: **Pipeline** (ativa), **Conversoes**, **Tempos**, **ROI**
4. Verificar Pipeline tab em negrito (fontWeight >=600)
5. Verificar filtros: **Periodo** e **Segmento**
6. Verificar 4 stat cards com valores nao-zero:
   - **Total Pipeline** (>0, ex: 28)
   - **Analisados** (ex: 5)
   - **Participados** (ex: 14)
   - **Resultado Definitivo** (ex: 2)
7. Verificar card **Funil do Pipeline — 13 Etapas** com barras visuais
   - Nomes de etapas: "captado", "analise", "divulgado" etc.
   - Setas de conversao com % entre etapas
8. Verificar **Tabela de Conversao** com colunas: ETAPA, ENTRADA, SAIDA, CONVERSAO %, VALOR ACUM.
9. Verificar tabela tem linhas com dados reais

### UC-AN02 — Taxas de Conversao Detalhadas

1. Clicar tab **Conversoes**
2. Verificar 4 stat cards:
   - **Taxa Geral** (ex: 1.5%)
   - **Melhor Segmento** (ex: "Outros")
   - **Melhor UF** (ex: "MG")
   - **Contribuicao Auto.** (ex: 25%)
3. Verificar card **Taxa por Tipo de Licitacao** com colunas: TIPO, PARTICIPADOS, GANHOS, TAXA %, BENCHMARK
4. Verificar card **Taxa por UF** com tabela
5. Verificar card **Taxa por Segmento** com tabela
6. Verificar tabelas tem linhas de dados com valores % coloridos

### UC-AN03 — Tempo Medio entre Etapas

1. Clicar tab **Tempos**
2. Verificar 4 stat cards:
   - **Tempo Total Medio** (ex: "0d")
   - **Etapa Mais Lenta** (nome da transicao)
   - **Etapa Mais Rapida** (nome da transicao)
   - **Homologacao → Empenho** (ex: "0d")
3. Verificar card **Tempo entre Etapas** com barras horizontais coloridas
   - Transicoes com seta → (ex: "captado_nao_divulgado → captado_divulgado")
   - Cores: verde (<7d), amarelo (7-30d), vermelho (>30d)
4. Verificar badge **GARGALO** na transicao mais lenta (se dados permitem)
5. Verificar **Detalhamento** tabela com colunas: TRANSICAO, MEDIA, MEDIANA, MIN, MAX

### UC-AN04 — ROI Estimado

1. Clicar tab **ROI**
2. Verificar **ROI Consolidado** — indicador grande central com % (fonte grande verde)
3. Verificar valor total R$ abaixo do percentual
4. Verificar filtro **Periodo** (3m/6m/12m/Total)
5. Verificar grid 2x2 de **Componentes** com R$ valores:
   - **Receita Direta** — "Editais ganhos"
   - **Oportunidades Salvas** — "Recursos revertidos"
   - **Produtividade** — "Horas economizadas"
   - **Prevencao Perdas** — "Intrusos detectados"
6. Verificar **Detalhamento** tabela com colunas: COMPONENTE, VALOR R$, % TOTAL
7. Verificar tabela tem 4 linhas (uma por componente)

---

## FASE 3 — Perdas Expandido (UC-AN05) <a id="fase-3"></a>

### UC-AN05 — Perdas com Recomendacoes IA

1. Sidebar → **Perdas** (secao Indicadores)
2. Verificar 4 stat cards:
   - **Total de Perdas**
   - **Valor Total Perdido** (R$)
   - **Taxa de Perda** (%)
   - **Top Motivo** (nome do motivo mais frequente)
3. Verificar filtros expandidos: **Periodo**, **Segmento**, **UF**
4. Verificar botao **Exportar CSV** visivel
5. Verificar card **Recomendacoes da IA** com insights:
   - Cada insight tem icone lampada + texto
   - Botoes **Aplicar** e **Rejeitar** por insight
6. **Interacao:** Clicar **Aplicar** na 1a recomendacao
   - Verificar texto "Aplicada" aparece (verde) ou botao desaparece
7. **Interacao:** Clicar **Rejeitar** na 2a recomendacao
   - Verificar texto "Rejeitada" aparece (vermelho) ou botao desaparece

---

## FASE 4 — Pipeline de Aprendizado (UC-AP01..AP03) <a id="fase-4"></a>

### UC-AP01 — Feedbacks Registrados

1. Sidebar → **Aprendizado** (secao Indicadores)
2. Verificar header "Pipeline de Aprendizado"
3. Verificar 3 tabs: **Feedbacks** (ativa), **Sugestoes**, **Padroes**
4. Verificar Feedbacks tab em negrito
5. Verificar 4 stat cards:
   - **Total Feedbacks** (>=10, seed tem 15+)
   - **Aplicados** (~10)
   - **Pendentes** (~5)
   - **Taxa Adocao** (~62.5%)
6. Verificar filtros: select **Tipo** (resultado_edital/score_ajustado/preco_ajustado/feedback_usuario) e **Periodo**
7. Verificar botao **Registrar Feedback Manual**
8. Verificar tabela **Feedbacks Registrados** com colunas: DATA, TIPO, ENTIDADE, RESUMO, DELTA, APLICADO
9. Verificar tabela tem >=5 linhas
10. Verificar badges "Sim" (verde) e "Nao" (cinza) na coluna Aplicado
11. **Interacao:** Clicar **Registrar Feedback Manual**
    - Modal abre com: select Tipo, input Entidade, textarea Descricao, textarea Resultado
    - Preencher Descricao: "Teste manual de validacao"
    - Clicar **Registrar** → modal fecha

### UC-AP02 — Sugestoes IA

1. Clicar tab **Sugestoes**
2. Verificar 3 stat cards:
   - **Pendentes** (>=1, seed tem 3)
   - **Aceitas** (>=1)
   - **Rejeitadas** (>=1)
3. Verificar card **Sugestoes Ativas** com sugestoes pendentes:
   - Titulo, descricao, badge confianca %
   - Titulos do seed: "Ajustar peso prazo de entrega", "Reduzir margem em Hematologia SP", "Recalibrar score tecnico para biomol"
   - Botoes **Aceitar** e **Rejeitar** por sugestao
4. **Interacao:** Clicar **Aceitar** na 1a sugestao
   - Sugestao desaparece ou mostra status "Aceita"
5. **Interacao:** Clicar **Rejeitar** na 2a sugestao
   - Modal abre pedindo motivo (textarea, minimo 10 caracteres)
   - Preencher: "Nao concordamos com esta abordagem no momento"
   - Clicar **Rejeitar** no modal → sugestao desaparece
6. Verificar **Historico de Decisoes** — tabela com colunas: DATA, SUGESTAO, DECISAO, MOTIVO
7. Verificar tabela tem >=2 linhas (1 aceita + 1 rejeitada do seed)

### UC-AP03 — Padroes Detectados

1. Clicar tab **Padroes**
2. Verificar 3 stat cards:
   - **Padroes Detectados** (>=2, seed tem 4)
   - **Alta Confianca (>=70%)** (2)
   - **Ultima Analise** (data)
3. Verificar toggle **"Mostrar padroes com confianca < 50%"** (checkbox, default desligado)
4. Verificar botao **Forcar Nova Analise**
5. Verificar cards de padroes com titulos do seed (3 visiveis com toggle off):
   - "Pico de editais em Marco e Setembro" (92% verde)
   - "Orgaos federais pagam 12% acima da media" (85% verde)
   - "Preco medio subindo 3% ao trimestre" (68% amarelo)
6. Verificar badges de confianca coloridos: verde (>=70%), amarelo (50-69%)
7. Verificar padrao "Hospital X repete mesmos NCMs" (45%) **NAO visivel** com toggle off
8. **Interacao:** Clicar toggle → ativar
   - Padrao 45% aparece: "Hospital X repete mesmos NCMs a cada 6 meses"
9. **Interacao:** Clicar **Forcar Nova Analise**
   - Botao mostra "Analisando..." ou fica desabilitado temporariamente
   - Apos conclusao, pagina volta ao estado normal
