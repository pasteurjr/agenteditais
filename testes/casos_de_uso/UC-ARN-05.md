---
uc_id: UC-ARN-05
nome: "Sidebar Configuracoes mantem labels curtos"
sprint: "Sprint 10"
versao_uc: "1.0"
doc_origem: "docs/SPEC_UCS_ARNALDO.yaml"
gerado_em: "2026-05-07"
relacionado_a: "F01-05"
---

# UC-ARN-05 — Sidebar Configuracoes mantem labels curtos

> **Origem:** observação **F01-05** do `docs/Observações tutorialsprint1-3 V6.docx` (Arnaldo).
> **Esta correção foi implementada em** `commit fadb984` (06/05/2026).
> **Este UC valida** que a correção esta funcionando end-to-end.

## Descrição

Confirma que sidebar tem itens 'Empresa', 'Portfolio', 'Parametrizacoes', 'Selecionar Empresa'
como labels curtos (compatibilidade com tutoriais existentes).


## Pré-condições

- Empresa criada anteriormente no ciclo (UC-ARN-01)

## UCs predecessores

- UC-ARN-01 (cria empresa SP no ciclo, exceto se este UC for o proprio UC-ARN-01)

## Pontos de observação (tester)

- Sidebar Configuracoes mostra exatamente os 4 labels esperados

## Resultado esperado

Todos os passos aprovados; SQL/DOM confirmam que a correção F01-05 esta aplicada.
