---
uc_id: UC-FL04
nome: "Cancelar/Silenciar Alerta"
sprint: "Sprint 6"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT 6.md"
linha_inicio_no_doc: 326
split_gerado_em: "2026-05-04T01:10:45"
---

# UC-FL04 — Cancelar/Silenciar Alerta

> Caso de uso extraido automaticamente de `docs/CASOS DE USO SPRINT 6.md` (linha 326).
> Sprint origem: **Sprint 6**.

---

**RNs aplicadas:** RN-037 (audit log obrigatorio na acao)

**RF relacionado:** RF-047
**Ator:** Usuario (responsavel do alerta ou diretor)

### Pre-condicoes
1. Usuario autenticado
2. Alerta existe e esta em status `aguardando` ou `disparado_nao_reconhecido`
3. Usuario e o responsavel do alerta OU tem perfil de diretor/gestor

### Pos-condicoes
1. Alerta muda para status `silenciado` ou `cancelado`
2. Scheduler remove o job associado
3. `AuditoriaLog` recebe registro com usuario, motivo, timestamp

### Sequencia de Eventos

1. Usuario acessa [Aba: "Ativos"] da FlagsPage
2. Localiza o alerta e clica no [Botao: "..."] (menu de acoes) da linha
3. [Menu Dropdown] abre com opcoes: [Item: "Reconhecer"], [Item: "Silenciar ate..."], [Item: "Cancelar"]
4. Usuario seleciona [Item: "Silenciar ate..."]
5. [Modal: "Silenciar Alerta"] abre
6. [DatePicker: "Silenciar ate"] com minimo = amanha
7. [TextArea: "Motivo do silenciamento"] (obrigatorio, min 20 chars)
8. Usuario preenche e clica [Botao: "Confirmar Silenciamento"] (variant warning)
9. Sistema valida campos, atualiza alerta, grava em AuditoriaLog, remove job do scheduler
10. Modal fecha, linha desaparece da aba "Ativos" e aparece na aba [Aba: "Silenciados"]
11. Toast: "Alerta silenciado ate {data}. Voce pode reativa-lo a qualquer momento."

### Tela(s) Representativa(s)

#### Modal "Silenciar Alerta"

```
+---------------------------------------+
|  Silenciar Alerta               [X]  |
|                                       |
|  Alerta: Prazo de Recurso vence em 2h|
|  Edital: 2034                         |
|                                       |
|  [DatePicker: Silenciar ate]          |
|  [16/04/2026 v]                       |
|                                       |
|  [TextArea: Motivo (obrigatorio)]     |
|  O edital foi suspenso pelo orgao    |
|  conforme adendo publicado hoje.     |
|                                       |
|  [Botao: Cancelar]  [Botao: Confirmar|
|                      Silenciamento]  |
+---------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Dados do alerta (contexto), Confirmacao visual
- **Preenchidos (input):** Data de silenciamento, Motivo (obrigatorio min 20 chars)
- **Obtidos (resposta do sistema):** Persistencia, Remocao do scheduler, Audit log, Toast de confirmacao

### Excecoes
- **E1:** Motivo <20 chars - validacao frontend bloqueia submit com [Texto de erro: "Motivo deve ter pelo menos 20 caracteres"]
- **E2:** Usuario nao tem permissao - modal exibe erro "Voce nao pode silenciar este alerta. Apenas o responsavel ou um diretor pode faze-lo."

---
