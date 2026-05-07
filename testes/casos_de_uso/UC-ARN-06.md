---
uc_id: UC-ARN-06
nome: "Documentos vem do upload IA do cadastro"
sprint: "Sprint 10"
versao_uc: "1.0"
doc_origem: "docs/SPEC_UCS_ARNALDO.yaml"
gerado_em: "2026-05-07"
relacionado_a: "F01-06"
---

# UC-ARN-06 — Documentos vem do upload IA do cadastro

> **Origem:** observação **F01-06** do `docs/Observações tutorialsprint1-3 V6.docx` (Arnaldo).
> **Esta correção foi implementada em** `commit fadb984` (06/05/2026).
> **Este UC valida** que a correção esta funcionando end-to-end.

## Descrição

Apos UploadLoteIA contexto=cadastro_empresa, valida que documentos
classificados aparecem em empresa-documentos.


## Pré-condições

- Empresa criada anteriormente no ciclo (UC-ARN-01)

## UCs predecessores

- UC-ARN-01 (cria empresa SP no ciclo, exceto se este UC for o proprio UC-ARN-01)

## Pontos de observação (tester)

- Confirma que a correção F01-06 esta aplicada

## Resultado esperado

Todos os passos aprovados; SQL/DOM confirmam que a correção F01-06 esta aplicada.
