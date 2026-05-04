---
uc_id: UC-MO06
nome: "Tratar Monitoramentos com Erro"
sprint: "Sprint 6"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT 6.md"
linha_inicio_no_doc: 763
split_gerado_em: "2026-05-04T01:10:45"
---

# UC-MO06 — Tratar Monitoramentos com Erro

> Caso de uso extraido automaticamente de `docs/CASOS DE USO SPRINT 6.md` (linha 763).
> Sprint origem: **Sprint 6**.

---

**RNs aplicadas:** RN-037 (audit log)

**RF relacionado:** RF-048
**Ator:** Usuario (Administrador, Gestor)

### Pre-condicoes
1. Usuario autenticado com perfil admin
2. Existe pelo menos 1 monitoramento com status `erro`

### Pos-condicoes
1. Usuario tomou acao corretiva (reativar, editar, excluir)
2. Acao registrada em AuditoriaLog

### Sequencia de Eventos

1. Usuario acessa MonitoriaPage > [Aba: "Erros"]
2. [Card: "Monitoramentos com Erro"] lista todos com status `erro`
3. [Tabela] mostra: Nome, Fonte, Ultima Execucao com Sucesso, Tentativas Falhas Consecutivas, Mensagem de Erro, Acao Sugerida
4. Usuario clica em uma linha - [Modal: "Diagnostico do Erro"] abre
5. Modal mostra: stack trace ultima execucao, payload enviado, resposta HTTP (se aplicavel), diagnostico da IA ("A fonte X mudou o schema. Monitoramento precisa ser recriado")
6. Botoes: [Botao: "Executar Manualmente"], [Botao: "Editar Monitoramento"], [Botao: "Reativar"], [Botao: "Excluir"]
7. Usuario clica [Botao: "Executar Manualmente"] para tentar uma vez
8. Sistema executa, se der certo muda status para `ativo`, se falhar atualiza mensagem de erro

### Tela(s) Representativa(s)

#### Modal "Diagnostico do Erro"

```
+---------------------------------------------------------------+
|  Diagnostico: TCE-MG                            [X]           |
|                                                               |
|  Status: ERRO                                                 |
|  Ultima Execucao com Sucesso: 10/04/2026 06:00                |
|  Tentativas Falhas Consecutivas: 12                           |
|  Primeira Falha: 11/04/2026 06:00                             |
|                                                               |
|  [Secao: Ultima Mensagem de Erro]                             |
|  +-----------------------------------------------------------+|
|  | HTTP 404 Not Found                                        ||
|  | URL: https://tce-mg.gov.br/licitacoes/listar               ||
|  | Resposta: "The requested URL was not found"               ||
|  +-----------------------------------------------------------+|
|                                                               |
|  [Secao: Diagnostico IA]                                      |
|  O portal TCE-MG parece ter mudado o endereco da listagem    |
|  de licitacoes. Recomendo: 1) verificar manualmente o novo   |
|  endereco, 2) editar o monitoramento com a URL atualizada,   |
|  3) considerar usar busca PNCP em vez de portal direto.      |
|                                                               |
|  [Botao: Executar Manualmente]                                |
|  [Botao: Editar Monitoramento]                                |
|  [Botao: Reativar]                                            |
|  [Botao: Excluir Monitoramento]                               |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Stack trace, diagnostico IA, historico de falhas
- **Preenchidos (input):** Escolha da acao corretiva
- **Obtidos (resposta do sistema):** Resultado da acao, mudanca de status

---

# FASE 3 — AUDITORIA UNIVERSAL

---
