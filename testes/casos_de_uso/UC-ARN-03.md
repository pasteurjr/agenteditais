---
uc_id: UC-ARN-03
nome: "Vincular empresa-usuario sem re-login"
sprint: "Sprint 10"
versao_uc: "1.0"
doc_origem: "docs/SPEC_UCS_ARNALDO.yaml"
gerado_em: "2026-05-07"
relacionado_a: "F01-03"
---

# UC-ARN-03 — Vincular empresa-usuario sem re-login

> **Origem:** observação **F01-03** do `docs/Observações tutorialsprint1-3 V6.docx` (Arnaldo).
> **Esta correção foi implementada em** `commit fadb984` (06/05/2026).
> **Este UC valida** que a correção esta funcionando end-to-end.

## Descrição

Valida que apos vincular um usuario a uma empresa via /api/admin/associar-empresa,
a lista 'minhasEmpresasList' do AuthContext atualiza sem precisar logout/login.


## Pré-condições

- Empresa criada anteriormente no ciclo (UC-ARN-01)

## UCs predecessores

- UC-ARN-01 (cria empresa SP no ciclo, exceto se este UC for o proprio UC-ARN-01)

## Pontos de observação (tester)

- Endpoint /api/admin/associar-empresa existe (nao 404)
- Lista de empresas vinculadas existe no AuthContext

## Resultado esperado

Todos os passos aprovados; SQL/DOM confirmam que a correção F01-03 esta aplicada.
