---
uc_id: UC-AP02
nome: "Sugestoes da IA Baseadas em Aprendizado"
sprint: "Sprint 7"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT7 V4.md"
linha_inicio_no_doc: 928
split_gerado_em: "2026-05-04T01:54:15"
---

# UC-AP02 — Sugestoes da IA Baseadas em Aprendizado

> Caso de uso extraido automaticamente de `docs/CASOS DE USO SPRINT7 V4.md` (linha 928).
> Sprint origem: **Sprint 7**.

---

**RNs aplicadas:** RN-NEW-05 (aceite explicito), RN-084 (cooldown), RN-132 (audit invocacao), RN-037 (audit log)

**RF relacionado:** RF-055 (Aprendizado Continuo)
**Ator:** Usuario (Diretor, Analista Comercial)

### Pre-condicoes
1. Usuario autenticado
2. Base de `AprendizadoFeedback` possui >= 10 registros
3. Padroes ja detectados (UC-AP03) com confianca >= 70%

### Pos-condicoes
1. Usuario aceita ou rejeita sugestoes da IA
2. Decisoes registradas em `AprendizadoFeedback`
3. Sugestoes aceitas sao aplicadas na proxima analise da IA

### Sequencia de Eventos

1. Usuario clica na [Aba: "Sugestoes"]
2. [Card: "Stat Cards — grid 3"] exibe: Sugestoes Pendentes, Aceitas (total historico), Rejeitadas (total historico)
3. [Card: "Sugestoes Ativas"] lista as sugestoes geradas pela IA que aguardam decisao:
   - Cada sugestao: [Icone: sparkle/lampada], [Titulo], [Descricao], [Confianca %], [Base de dados], [Botao: "Aceitar"], [Botao: "Rejeitar"]
4. Ao clicar [Botao: "Aceitar"]: sistema aplica a sugestao (ex.: altera peso de score), registra em `AprendizadoFeedback` com `aplicado=true`
5. Ao clicar [Botao: "Rejeitar"]: [Modal: "Motivo da Rejeicao"] abre com [TextArea: "Por que rejeita esta sugestao?"] (min 10 chars)
6. Sistema registra rejeicao com motivo em `AprendizadoFeedback` — IA NAO repete sugestao similar
7. [Card: "Historico de Decisoes"] tabela: Data, Sugestao, Decisao (Aceita/Rejeitada), Motivo, Impacto (se aceita, qual metrica mudou)
8. [Botao: "Pedir Nova Analise"] invoca DeepSeek para gerar novas sugestoes (RN-084 cooldown)

### Tela(s) Representativa(s)

**Pagina:** AprendizadoPage
**Posicao:** Aba "Sugestoes"

#### Layout da Tela

```
+---------------------------------------------------------------+
|  Aprendizado > Sugestoes                                      |
|                                                               |
|  +-----------+  +-----------+  +-----------+                  |
|  |Pendentes  |  |Aceitas    |  |Rejeitadas |                  |
|  |     5     |  |    18     |  |     7     |                  |
|  +-----------+  +-----------+  +-----------+                  |
|                                                               |
|  +---- Sugestoes Ativas ------+                               |
|  |                            |                               |
|  | ✨ Ajustar peso tecnico para Hematologia                   |
|  |    Voce alterou peso_tecnico de 0.4 para 0.6 nos          |
|  |    ultimos 3 editais de hemato. Ganhou 2 dos 3.           |
|  |    Sugestao: padronizar peso 0.6 para o segmento.         |
|  |    Confianca: 78%  Base: 12 feedbacks                     |
|  |    [Aceitar]  [Rejeitar]                                  |
|  |                                                            |
|  | ✨ Reduzir margem alvo em SP                               |
|  |    Editais ganhos em SP: margem media 8.2%.               |
|  |    Editais perdidos em SP: margem media 14.5%.            |
|  |    Sugestao: calibrar margem alvo para 10% em SP.         |
|  |    Confianca: 72%  Base: 23 feedbacks                     |
|  |    [Aceitar]  [Rejeitar]                                  |
|  |                                                            |
|  | ✨ Priorizar orgaos universitarios                         |
|  |    Sua taxa de vitoria em hospitais universitarios:        |
|  |    42% vs 18% em hospitais municipais.                    |
|  |    Sugestao: aumentar score para orgaos HU.               |
|  |    Confianca: 85%  Base: 35 feedbacks                     |
|  |    [Aceitar]  [Rejeitar]                                  |
|  +--------------------------------------------+              |
|                                                               |
|  [Pedir Nova Analise]                                         |
|                                                               |
|  +---- Historico de Decisoes ----+                            |
|  |Data  |Sugestao         |Decisao  |Motivo         |        |
|  |10/04 |Margem RJ 8%     |Aceita   |—              |        |
|  |08/04 |Ignorar dispensa |Rejeitada|"Vamos testar  |        |
|  |      |< R$50K          |         | dispensas"     |        |
|  +-------------------------------+                            |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Stat Cards (3), Lista sugestoes ativas, Historico de decisoes
- **Preenchidos (input):** Aceitar/Rejeitar (com motivo), Pedir Nova Analise
- **Obtidos (resposta do sistema):** Sugestoes da IA, aplicacao automatica, registro de decisao

### Excecoes
- **E1:** Base < 10 feedbacks — mensagem: "Preciso de pelo menos 10 resultados registrados para gerar sugestoes. Atualmente: {N}."
- **E2:** Cooldown ativo ao pedir nova analise — toast: "Aguarde {N}s"
- **E3:** Sugestao ja rejeitada com motivo similar — IA filtra e nao repete

---
