---
uc_id: UC-SC03
nome: "Score Numerico de Recurso (EXPANSAO — RecursosPage)"
sprint: "Sprint 9"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT9.md"
linha_inicio_no_doc: 921
split_gerado_em: "2026-05-04T03:45:25"
---

# UC-SC03 — Score Numerico de Recurso (EXPANSAO — RecursosPage)

> Caso de uso extraido de `docs/CASOS DE USO SPRINT9.md` (linha 921).
> Sprint origem: **Sprint 9**.

---

**Tipo:** EXPANSAO da pagina existente `RecursosPage.tsx`
**UCs estendidos:** UC-RE01 (Sprint 4 — Monitorar Janela de Recurso), UC-RE02 (Sprint 4 — Analisar Proposta Vencedora), UC-RE04 (Sprint 4 — Gerar Laudo de Recurso). A RecursosPage ja gera analises textuais. Este UC ADICIONA um score numerico resumido.
**O que JA EXISTE:** RecursosPage com janela de recurso, analise de proposta vencedora via IA, chatbox de analise, geracao de laudo (PDF), submissao assistida. Endpoints de recurso.

**RNs aplicadas:** RN-NEW-17 (score >= 70 recomendado, < 30 nao recomendado), RN-037 (audit), RN-084 (cooldown)

**RF relacionado:** RF-042 (sub-item 9.a do roadmap)
**Ator:** Usuario (Analista Juridico, Gestor de Licitacoes)

### Pre-condicoes
1. Edital com resultado publicado (vitoria de outro concorrente)
2. Analise da proposta vencedora executada (UC-RE02)
3. Desvios tecnicos identificados pelo sistema

### Pos-condicoes
1. Score de recurso calculado (0-100)
2. Recomendacao exibida (Recomendado / Nao recomendado / Inconclusivo)
3. Fatores do score detalhados

### Sequencia de Eventos

1. Usuario acessa RecursosPage (`/app/recursos`) e seleciona edital com janela de recurso aberta (JA EXISTE, UC-RE01)
2. **NOVO:** [Card: "Score de Recurso"] exibe:
   - [Gauge: Score 0-100] com cores: Verde (>=70 "Recomendado"), Amarelo (30-69 "Inconclusivo"), Vermelho (<30 "Nao recomendado")
   - [Label: recomendacao textual] "Recurso recomendado — alta probabilidade de provimento"
3. [Card: "Fatores do Score"] exibe breakdown:
   - Desvios tecnicos (peso 40%): "X desvios detectados na proposta vencedora, gravidade media/alta"
   - Historico da empresa (peso 20%): "Taxa de provimento de recursos: X de Y (ZZ%)"
   - Historico do orgao (peso 25%): "Orgao proveu XX% dos recursos nos ultimos 24 meses"
   - Fundamento legal (peso 15%): "Desvios enquadrados nos Art. 59, 60, 165 da Lei 14.133"
4. Score = soma ponderada dos fatores, normalizada 0-100
5. RN-NEW-17 aplicada:
   - Score >= 70: [Badge verde: "Recurso Recomendado"] + texto "Alta probabilidade de provimento"
   - Score 30-69: [Badge amarelo: "Inconclusivo"] + texto "Avalie os fatores individuais"
   - Score < 30: [Badge vermelho: "Nao Recomendado"] + texto "Baixa probabilidade. Considere nao recorrer."
6. **EXPANDIDO:** No card de "Janela de Recurso Aberta" (UC-RE01), badge com score ao lado do prazo:
   - "Recurso ate 15/05/2026 — Score: [72 Verde]"
7. [Botao: "Gerar Laudo com Score"] (expansao do UC-RE04): inclui score e fatores no laudo PDF

### Tela(s) Representativa(s)

**Pagina:** RecursosPage (`/app/recursos`)
**Posicao:** Card novo acima do chatbox de analise

#### Layout do Card

```
+--- Score de Recurso ---+
|  [Gauge: 72]           |
|  RECOMENDADO            |
|                         |
|  Fatores:               |
|  Desvios tecnicos  40% 85|
|  Hist. empresa     20% 60|
|  Hist. orgao       25% 68|
|  Fundamento legal  15% 55|
|                         |
|  Janela: ate 15/05/2026 |
|  [Gerar Laudo c/ Score] |
+-------------------------+
```

### Excecoes
- **E1:** Analise da proposta vencedora nao executada — banner: "Execute a analise (UC-RE02) antes de calcular o score"
- **E2:** Sem historico de recursos — fatores de historico usam media do sistema (50)
- **E3:** Orgao sem historico de recursos — fator "Historico do orgao" usa media geral (50)

---
