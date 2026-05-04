---
uc_id: UC-SC01
nome: "Score de Competitividade (EXPANSAO — PrecificacaoPage + CaptacaoPage)"
sprint: "Sprint 9"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT9.md"
linha_inicio_no_doc: 778
split_gerado_em: "2026-05-04T03:45:25"
---

# UC-SC01 — Score de Competitividade (EXPANSAO — PrecificacaoPage + CaptacaoPage)

> Caso de uso extraido de `docs/CASOS DE USO SPRINT9.md` (linha 778).
> Sprint origem: **Sprint 9**.

---

**Tipo:** EXPANSAO de duas paginas existentes
**UCs estendidos:** UC-P08 (Sprint 3 — Estrategia Competitiva), UC-CV08 (Sprint 2 — Scores Multidimensionais). O Score de Competitividade e um novo score que complementa o score de aderencia (Sprint 2) e a estrategia competitiva (Sprint 3).
**O que JA EXISTE:** PrecificacaoPage com tab Estrategia e cenarios. CaptacaoPage com coluna Score de Aderencia. Modelo `Concorrente` com historico. Tool `tool_insights_precificacao` com analise de precos.

**RNs aplicadas:** RN-074 (taxa vitoria concorrente), RN-102 (margem padronizada), RN-NEW-15 (historico 24m, bootstrap PNCP), RN-037 (audit)

**RF relacionado:** RF-042, RF-050 (Mercado)
**Ator:** Usuario (Analista Comercial, Diretor)

### Pre-condicoes
1. Edital selecionado com itens vinculados a produtos
2. Historico de editais similares (mesmo NCM, faixa valor, regiao) — minimo 5 editais no historico
3. Camadas A-C configuradas (preco base e referencia)

### Pos-condicoes
1. Score de Competitividade calculado e exibido (0-100)
2. Breakdown dos fatores visivel
3. Score visivel tanto na PrecificacaoPage quanto na CaptacaoPage

### Sequencia de Eventos

1. **Na PrecificacaoPage**, apos configurar Camadas A-C:
2. **NOVO:** [Card: "Score de Competitividade"] acima dos cenarios de estrategia (tab Estrategia) exibe:
   - [Gauge: Score 0-100] com cores: Verde (>=70), Amarelo (40-69), Vermelho (<40)
   - [Label: "Probabilidade estimada de vencer: XX%"]
3. [Card: "Fatores do Score"] exibe breakdown:
   - Historico similar (peso 30%): "Empresa venceu X de Y editais similares (NCM + faixa + regiao)"
   - Posicao de preco (peso 30%): "Preco configurado esta no percentil XX do historico de homologados"
   - Concorrencia (peso 20%): "X concorrentes conhecidos, taxa media de vitoria YY%"
   - Perfil do orgao (peso 20%): "Orgao prioriza preco/qualidade com base em XX editais anteriores"
4. [Tooltip] em cada fator mostra o calculo detalhado
5. Se empresa sem historico proprio (RN-NEW-15): usa dados publicos PNCP como bootstrap e exibe [Badge: "Estimativa — sem historico proprio"]
6. **Na CaptacaoPage**, na tabela de editais:
7. **NOVO:** [Coluna: "Competitividade"] com badge colorido:
   - Verde: "Alta (78)" — editais onde a empresa tem boa chance
   - Amarelo: "Media (52)" — chance moderada
   - Vermelho: "Baixa (23)" — pouca chance
   - Cinza: "N/D" — dados insuficientes
8. Score calculado automaticamente para editais com produtos vinculados e precos configurados
9. [Filtro: "Competitividade"] permite filtrar editais por faixa de score

### Tela(s) Representativa(s)

**Pagina:** PrecificacaoPage — tab Estrategia
**Posicao:** Card novo acima dos cenarios

#### Layout do Card

```
+--- Score de Competitividade ---+
|  [Gauge: 72]  ALTA             |
|  Prob. vitoria: ~72%           |
|                                |
|  Fatores:                      |
|  Historico similar    30%  85  |
|  Posicao de preco     30%  68  |
|  Concorrencia         20%  70  |
|  Perfil do orgao      20%  60  |
|                                |
|  [Badge: estimativa PNCP]      |
+--------------------------------+
```

### Excecoes
- **E1:** Menos de 5 editais similares no historico — score exibido como "Preliminar (baixa confianca)"
- **E2:** Precos nao configurados — coluna Competitividade mostra "Configure precos"
- **E3:** Orgao sem historico — fator "Perfil do orgao" usa media geral (50)

---
