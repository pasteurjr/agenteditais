---
uc_id: UC-ARN-01
nome: "Cadastro de empresa via upload IA + aceite humano"
sprint: "Sprint 10"
versao_uc: "1.0"
doc_origem: "docs/SPEC_UCS_ARNALDO.yaml"
gerado_em: "2026-05-07"
relacionado_a: "F01-01"
---

# UC-ARN-01 — Cadastro de empresa via upload IA + aceite humano

> **Origem:** observação **F01-01** do `docs/Observações tutorialsprint1-3 V6.docx` (Arnaldo).
> **Esta correção foi implementada em** `commit fadb984` (06/05/2026).
> **Este UC valida** que a correção esta funcionando end-to-end.

## Descrição

Valida o componente UploadLoteIA contexto=cadastro_empresa.
User loga, abre tela Empresa, faz upload de PDF do contrato social,
IA extrai dados, user revisa, marca aceite e salva.


## Pré-condições

- Usuario logado como pasteur@valida.com
- Empresa nao cadastrada ainda no ciclo

## UCs predecessores

- UC-ARN-01 (cria empresa SP no ciclo, exceto se este UC for o proprio UC-ARN-01)

## Pontos de observação (tester)

- Componente UploadLoteIA renderiza com testid OU heading especifico (nao generico)
- Componente tem botao de selecionar arquivo

## Resultado esperado

Todos os passos aprovados; SQL/DOM confirmam que a correção F01-01 esta aplicada.
