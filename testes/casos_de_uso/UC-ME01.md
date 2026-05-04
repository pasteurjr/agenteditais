---
uc_id: UC-ME01
nome: "Dashboard TAM/SAM/SOM"
sprint: "Sprint 7"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT7 V4.md"
linha_inicio_no_doc: 92
split_gerado_em: "2026-05-04T01:54:15"
---

# UC-ME01 — Dashboard TAM/SAM/SOM

> Caso de uso extraido automaticamente de `docs/CASOS DE USO SPRINT7 V4.md` (linha 92).
> Sprint origem: **Sprint 7**.

---

**RNs aplicadas:** RN-059 (cache 30d), RN-037 (audit log), RN-132 (audit invocacao), RN-NEW-01 (TAM sem filtro geo), RN-NEW-02 (SAM com filtro), RN-NEW-03 (SOM com taxa vitoria)

**RF relacionado:** RF-050 (Mercado TAM/SAM/SOM)
**Ator:** Usuario (Diretor, Analista Comercial)

### Pre-condicoes
1. Usuario esta autenticado no sistema
2. Portfolio da empresa possui pelo menos 5 produtos cadastrados
3. Historico de editais captados existe (Sprints 2/6)
4. Parametrizacoes de UFs de atuacao e NCMs estao configuradas

### Pos-condicoes
1. Usuario visualiza o dimensionamento TAM/SAM/SOM com valores atualizados
2. Registro de consulta gravado em `AuditoriaLog` (RN-037)
3. Cache de 30 dias criado (RN-059) — proxima consulta usa cache se < 30d

### Sequencia de Eventos

1. Usuario acessa MercadoPage (`/app/mercado`) via menu lateral "Indicadores > Mercado"
2. [Cabecalho: "Analise de Mercado"] exibe titulo da pagina com subtitulo "TAM/SAM/SOM e Deteccao de Intrusos"
3. [Secao: Abas] mostra 2 tabs: TAM/SAM/SOM (default), Intrusos (UC-ME04)
   **Nota:** Mapa fica na aba Mapa do CRMPage (UC-ME02). Concorrencia fica na ConcorrenciaPage (UC-ME03).
4. Na [Aba: "TAM/SAM/SOM"] (default), [Secao: Filtros] exibe [Select: "Segmento"] (Todos/Hematologia/Bioquimica/Coagulacao/etc.), [Select: "Periodo"] (3m/6m/12m), [Botao: "Recalcular"] (forca cache, RN-059)
5. [Card: "Funil de Mercado"] exibe 3 indicadores em formato funil vertical:
   - TAM: total de editais no(s) segmento(s) no periodo, com valor acumulado em R$
   - SAM: subconjunto filtrado por UFs + NCMs + faixa de valor, com valor acumulado
   - SOM: SAM * taxa_vitoria * fator_capacidade, com valor estimado de captura
6. Cada indicador mostra: [Valor em R$], [Quantidade de editais], [% relativa ao anterior] (SAM/TAM = Taxa Cobertura, SOM/SAM = Taxa Penetracao)
7. [Card: "Stat Cards — grid 4 colunas"] exibe: Editais no Periodo (total TAM), Valor Total TAM (R$), Valor Medio por Edital (R$), Taxa de Penetracao SOM/SAM (%)
8. [Card: "Tendencias"] exibe grafico de barras com editais por mes (ja existe, expandido com linha de SOM sobreposta)
9. [Card: "Categorias Mais Demandadas"] exibe grid de categorias com percentual e valor medio (ja existe)
10. [Card: "Evolucao de Precos"] exibe grafico de linha com preco medio por segmento ao longo do periodo
11. Se cache expirado (> 30 dias): sistema recalcula automaticamente com loading spinner

### Tela(s) Representativa(s)

**Pagina:** MercadoPage (`/app/mercado`)
**Posicao:** Aba "TAM/SAM/SOM"

#### Layout da Tela

```
+---------------------------------------------------------------+
|  Analise de Mercado                                           |
|  TAM/SAM/SOM e Deteccao de Intrusos                           |
|                                                               |
|  +-----------+  +---------+                                   |
|  |TAM/SAM/SOM|  |Intrusos |                                   |
|  +-----------+  +---------+                                   |
|  (Mapa→CRMPage, Concorrencia→ConcorrenciaPage)               |
|                                                               |
|  [Filtros]                                                    |
|  Segmento: [Todos v]  Periodo: [12 meses v]  [Recalcular]   |
|                                                               |
|  +-------------------+  +---------+ +---------+ +---------+  |
|  | FUNIL DE MERCADO  |  |Editais  | |Valor    | |Valor    |  |
|  |                   |  |Periodo  | |Total TAM| |Medio    |  |
|  |  +-------------+  |  |  1.247  | |R$ 892M  | |R$ 715K  |  |
|  |  |    TAM      |  |  +---------+ +---------+ +---------+  |
|  |  | 1.247 ed.   |  |  +---------+                          |
|  |  | R$ 892M     |  |  |Penetra- |                          |
|  |  +-------------+  |  |cao      |                          |
|  |  |   SAM       |  |  | 12.3%   |                          |
|  |  |  412 ed.    |  |  +---------+                          |
|  |  |  R$ 298M    |  |                                       |
|  |  | (33% TAM)   |  |                                       |
|  |  +-------------+  |                                       |
|  |  |  SOM        |  |                                       |
|  |  |  51 ed.     |  |                                       |
|  |  |  R$ 36.7M   |  |                                       |
|  |  | (12.3% SAM) |  |                                       |
|  |  +-------------+  |                                       |
|  +-------------------+                                       |
|                                                               |
|  +------ Tendencias de Editais --------+                     |
|  | [Grafico barras: editais por mes]   |                     |
|  | [Linha sobreposta: SOM por mes]     |                     |
|  +-------------------------------------+                     |
|                                                               |
|  +---- Categorias Mais Demandadas -----+                     |
|  | Hematologia      38%  ████████████  |                     |
|  | Bioquimica       25%  ████████      |                     |
|  | Coagulacao       18%  ██████        |                     |
|  | Imunologia       12%  ████          |                     |
|  | Biomol/PCR        7%  ██            |                     |
|  +-------------------------------------+                     |
|                                                               |
|  +---- Evolucao de Precos por Segmento -+                    |
|  | [Grafico linha: preco medio por mes] |                    |
|  | Segmentos: cores diferentes por linha|                    |
|  +--------------------------------------+                    |
|                                                               |
|                                       [Floating Chatbox IA]  |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Funil TAM/SAM/SOM (3 niveis), Stat Cards (4), Tendencias (grafico barras), Categorias (barras horizontais), Evolucao de Precos (grafico linha)
- **Preenchidos (input):** Segmento, Periodo, Botao Recalcular
- **Obtidos (resposta do sistema):** Dimensionamento calculado, cache atualizado, graficos renderizados

### Excecoes
- **E1:** Portfolio vazio ou com menos de 5 produtos — banner: "Cadastre pelo menos 5 produtos no portfolio para dimensionar o mercado"
- **E2:** Nenhum edital no historico — stat cards mostram zero com mensagem: "Execute monitoramentos (Sprint 6) para capturar editais"
- **E3:** Cache invalido e recalculo falha — toast de erro: "Falha ao calcular TAM/SAM/SOM. Tente novamente."

---
