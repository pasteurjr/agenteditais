---
uc_id: UC-ARN-13
nome: "Upload em massa documentos IA"
sprint: "Sprint 10"
versao_uc: "1.0"
doc_origem: "docs/SPEC_UCS_ARNALDO.yaml"
gerado_em: "2026-05-07"
relacionado_a: "F03-02"
---

# UC-ARN-13 — Upload em massa documentos IA

> **Origem:** observação **F03-02** do `docs/Observações tutorialsprint1-3 V6.docx` (Arnaldo).
> **Esta correção foi implementada em** `commit fadb984` (06/05/2026).
> **Este UC valida** que a correção esta funcionando end-to-end.

## Descrição

UploadLoteIA contexto=documentos em EmpresaPage.

## Pré-condições

- Empresa criada anteriormente no ciclo (UC-ARN-01)

## UCs predecessores

- UC-ARN-01 (cria empresa SP no ciclo, exceto se este UC for o proprio UC-ARN-01)

## Pontos de observação (tester)

- UploadLoteIA documentos com testid OU heading especifico de documentos

## Resultado esperado

Todos os passos aprovados; SQL/DOM confirmam que a correção F03-02 esta aplicada.
