---
uc_id: UC-ARN-23
nome: "Responsavel: submenu, validade, doc outorga"
sprint: "Sprint 10"
versao_uc: "1.0"
doc_origem: "docs/SPEC_UCS_ARNALDO.yaml"
gerado_em: "2026-05-07"
relacionado_a: "F05-01-02-03"
---

# UC-ARN-23 — Responsavel: submenu, validade, doc outorga

> **Origem:** observação **F05-01-02-03** do `docs/Observações tutorialsprint1-3 V6.docx` (Arnaldo).
> **Esta correção foi implementada em** `commit fadb984` (06/05/2026).
> **Este UC valida** que a correção esta funcionando end-to-end.

## Descrição

Valida que: (1) submenu chama-se 'Responsaveis e Representantes';
(2) form tem campo documento_validade; (3) tem campo documento_path.


## Pré-condições

- Empresa criada anteriormente no ciclo (UC-ARN-01)

## UCs predecessores

- UC-ARN-01 (cria empresa SP no ciclo, exceto se este UC for o proprio UC-ARN-01)

## Pontos de observação (tester)

- Confirma que a correção F05-01-02-03 esta aplicada

## Resultado esperado

Todos os passos aprovados; SQL/DOM confirmam que a correção F05-01-02-03 esta aplicada.
