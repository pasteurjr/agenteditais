---
uc_id: UC-SC02
nome: "Score de Qualidade dos Concorrentes (EXPANSAO — ConcorrenciaPage)"
sprint: "Sprint 9"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT9.md"
linha_inicio_no_doc: 850
split_gerado_em: "2026-05-04T03:45:25"
---

# UC-SC02 — Score de Qualidade dos Concorrentes (EXPANSAO — ConcorrenciaPage)

> Caso de uso extraido de `docs/CASOS DE USO SPRINT9.md` (linha 850).
> Sprint origem: **Sprint 9**.

---

**Tipo:** EXPANSAO da pagina existente `ConcorrenciaPage.tsx`
**UCs estendidos:** UC-ME03 (Sprint 7 — Share vs Concorrentes). UC-ME03 expandiu ConcorrenciaPage com share de mercado. Este UC ADICIONA score de qualidade.
**O que JA EXISTE:** ConcorrenciaPage com tabela Nome/CNPJ/Vitorias/Derrotas/Taxa/Preco Medio + detalhe com historico. Modelo `Concorrente` e `ParticipacaoEdital`. Endpoint: `GET /api/concorrentes/listar`.

**RNs aplicadas:** RN-074 (taxa vitoria), RN-NEW-16 (formula qualidade), RN-037 (audit)

**RF relacionado:** RF-049 (Concorrencia)
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Concorrentes identificados no sistema (Sprint 2/7)
2. Historico de editais com resultados (desclassificacoes, impugnacoes)

### Pos-condicoes
1. Score de qualidade calculado e exibido por concorrente
2. Card resumo de qualidade media do orgao visivel

### Sequencia de Eventos

1. Usuario acessa ConcorrenciaPage (`/app/concorrencia`)
2. **NOVO:** [Coluna: "Qualidade"] na tabela de concorrentes com score numerico e badge:
   - Alta (>=70, verde): poucos problemas historicos — concorrente forte
   - Media (40-69, amarelo): qualidade inconsistente
   - Baixa (<40, vermelho): muitas desclassificacoes — oportunidade para recurso
3. Score calculado por concorrente (RN-NEW-16):
   - `qualidade = 100 - ((desclassificacoes + impugnacoes_recebidas) / max(editais_participados, 1)) * 100`
   - Limitado a [0, 100]
4. **NOVO:** Ao clicar num concorrente, detalhe expandido inclui:
   - [Card: "Historico de Qualidade"] com:
     - Desclassificacoes: X vezes em Y editais
     - Impugnacoes recebidas: X
     - Recursos perdidos: X
     - Motivos mais comuns de desclassificacao
5. **NOVO:** [Card: "Qualidade Media do Orgao"] acima da tabela (visivel quando filtrado por orgao):
   - Media de qualidade de todos os concorrentes que participam naquele orgao
   - Se media baixa (< 40): [Badge: "Oportunidade — concorrentes fracos neste orgao"]
   - Se media alta (>= 70): [Badge: "Orgao competitivo — concorrentes fortes"]

### Tela(s) Representativa(s)

**Pagina:** ConcorrenciaPage (`/app/concorrencia`)
**Posicao:** Coluna nova na tabela + card acima

#### Layout — Tabela expandida

```
+---------------------------------------------------------------+
|  Concorrencia                                                  |
|                                                               |
|  +--- Qualidade Media: Hospital X (orgao filtrado) ---+       |
|  | Media: 45 [MEDIA - Amarelo]                         |       |
|  | "Concorrentes com qualidade inconsistente neste     |       |
|  |  orgao. Oportunidade para propostas tecnicas        |       |
|  |  superiores."                                       |       |
|  +-----------------------------------------------------+      |
|                                                               |
|  |Nome        |CNPJ      |Vit.|Der.|Taxa |Preco|Qualid.|     |
|  |MedEquip    |12.345..  | 8  | 12 |40%  |R$450| 35[V] |     |
|  |BioStar     |23.456..  | 15 | 5  |75%  |R$520| 82[Vd]|     |
|  |LabTech     |34.567..  | 3  | 18 |14%  |R$380| 22[V] |     |
+---------------------------------------------------------------+
```

### Excecoes
- **E1:** Concorrente sem historico de desclassificacoes — score = 75 (default otimista) com nota "Sem historico"
- **E2:** Nenhum concorrente identificado para orgao — card de qualidade media oculto

---
