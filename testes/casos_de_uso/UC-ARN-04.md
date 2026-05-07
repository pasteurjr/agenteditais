---
uc_id: UC-ARN-04
nome: "CNPJ readonly apos empresa salva"
sprint: "Sprint 10"
versao_uc: "1.0"
doc_origem: "docs/SPEC_UCS_ARNALDO.yaml"
gerado_em: "2026-05-07"
relacionado_a: "F01-04"
---

# UC-ARN-04 — CNPJ readonly apos empresa salva

> **Origem:** observação **F01-04** do `docs/Observações tutorialsprint1-3 V6.docx` (Arnaldo).
> **Esta correção foi implementada em** `commit fadb984` (06/05/2026).
> **Este UC valida** que a correção esta funcionando end-to-end.

## Descrição

Cria empresa, recarrega EmpresaPage e verifica que input CNPJ esta disabled.


## Pré-condições

- Empresa criada anteriormente no ciclo (UC-ARN-01)

## UCs predecessores

- UC-ARN-01 (cria empresa SP no ciclo, exceto se este UC for o proprio UC-ARN-01)

## Pontos de observação (tester)

- CNPJ desabilitado quando empresa ja salva

## Resultado esperado

Todos os passos aprovados; SQL/DOM confirmam que a correção F01-04 esta aplicada.
