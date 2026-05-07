---
uc_id: UC-ARN-18
nome: "Botao atualizar individual passa ID da certidao"
sprint: "Sprint 10"
versao_uc: "1.0"
doc_origem: "docs/SPEC_UCS_ARNALDO.yaml"
gerado_em: "2026-05-07"
relacionado_a: "F04-04"
---

# UC-ARN-18 — Botao atualizar individual passa ID da certidao

> **Origem:** observação **F04-04** do `docs/Observações tutorialsprint1-3 V6.docx` (Arnaldo).
> **Esta correção foi implementada em** `commit fadb984` (06/05/2026).
> **Este UC valida** que a correção esta funcionando end-to-end.

## Descrição

Inspeciona codigo do EmpresaPage e confirma que onClick passa [c.id] em vez de chamar geral.


## Pré-condições

- Empresa criada anteriormente no ciclo (UC-ARN-01)

## UCs predecessores

- UC-ARN-01 (cria empresa SP no ciclo, exceto se este UC for o proprio UC-ARN-01)

## Pontos de observação (tester)

- Confirma que a correção F04-04 esta aplicada

## Resultado esperado

Todos os passos aprovados; SQL/DOM confirmam que a correção F04-04 esta aplicada.
