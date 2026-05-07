---
uc_id: UC-ARN-02
nome: "Inscricao Estadual obrigatoria"
sprint: "Sprint 10"
versao_uc: "1.0"
doc_origem: "docs/SPEC_UCS_ARNALDO.yaml"
gerado_em: "2026-05-07"
relacionado_a: "F01-02"
---

# UC-ARN-02 — Inscricao Estadual obrigatoria

> **Origem:** observação **F01-02** do `docs/Observações tutorialsprint1-3 V6.docx` (Arnaldo).
> **Esta correção foi implementada em** `commit fadb984` (06/05/2026).
> **Este UC valida** que a correção esta funcionando end-to-end.

## Descrição

Valida que a IE eh required no CRUD de empresas.
Tenta criar empresa SEM IE -> erro 400. Cria COM IE -> 201.


## Pré-condições

- Empresa criada anteriormente no ciclo (UC-ARN-01)

## UCs predecessores

- UC-ARN-01 (cria empresa SP no ciclo, exceto se este UC for o proprio UC-ARN-01)

## Pontos de observação (tester)

- Form mostra IE como obrigatoria (asterisco vermelho)

## Resultado esperado

Todos os passos aprovados; SQL/DOM confirmam que a correção F01-02 esta aplicada.
