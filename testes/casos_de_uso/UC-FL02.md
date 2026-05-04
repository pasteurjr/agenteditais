---
uc_id: UC-FL02
nome: "Criar Alerta via IA (chatbox)"
sprint: "Sprint 6"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT 6.md"
linha_inicio_no_doc: 179
split_gerado_em: "2026-05-04T01:10:45"
---

# UC-FL02 — Criar Alerta via IA (chatbox)

> Caso de uso extraido automaticamente de `docs/CASOS DE USO SPRINT 6.md` (linha 179).
> Sprint origem: **Sprint 6**.

---

**RNs aplicadas:** RN-037 (audit log), RN-084 (cooldown 60s DeepSeek), RN-132 (audit de invocacoes), RN-008 (status certidao), RN-031 (bloqueio certidao vencida), RN-039 (transicao automatica de expirado), RN-186 (criticidade), RN-212 (contador prazo)

**RF relacionado:** RF-047, RF-054 (Interface Hibrida Chat+CRUD)
**Ator:** Usuario (qualquer perfil com permissao de criar alertas)

### Pre-condicoes
1. Usuario esta autenticado
2. Tool `tool_configurar_alertas` esta registrada no catalogo DeepSeek
3. Entidade de referencia (edital, contrato, certidao) existe no banco

### Pos-condicoes
1. Alerta criado no banco com todos os campos preenchidos pela IA
2. Scheduler agenda o disparo conforme a data/hora
3. Log de invocacao da tool gravado em `AuditoriaLog` (RN-132)
4. Alerta aparece imediatamente no UC-FL01 (Dashboard Ativos)

### Sequencia de Eventos

1. Usuario abre o [Floating Chat] disponivel em qualquer pagina (inclusive FlagsPage)
2. Usuario digita em [TextArea: "Mensagem para IA"]: "Cria um alerta critico de prazo de recurso para o edital 2034 com disparo amanha as 8h"
3. Usuario clica [Botao: "Enviar"] (icone Send)
4. Sistema verifica cooldown DeepSeek (RN-084). Se <60s da ultima chamada, exibe erro e aborta
5. Backend invoca DeepSeek com o prompt + catalogo de tools
6. DeepSeek responde com tool_call para `tool_configurar_alertas` com os argumentos extraidos: `{tipo: "prazo_recurso", edital_id: 2034, criticidade: "critico", data_disparo: "2026-04-16T08:00:00", canal: "ambos", responsavel_id: current_user}`
7. Backend executa a tool; tool cria registro em `AlertaFlag`, agenda job no APScheduler
8. Tool registra log em `AuditoriaLog` com `tool_name=tool_configurar_alertas`, `input_hash`, `user_id`, `timestamp` (RN-132)
9. Backend retorna resposta da tool para o DeepSeek
10. DeepSeek gera mensagem de confirmacao em PT-BR informal: "Prontinho! Alerta critico de prazo de recurso criado para o edital 2034. Vou te avisar amanha as 8h via email e tela."
11. Chatbox exibe a mensagem no historico da conversa
12. Se usuario navegar para FlagsPage > Aba "Ativos" (UC-FL01), novo alerta aparece no topo da tabela

### Tela(s) Representativa(s)

**Pagina:** Qualquer pagina do sistema (chatbox e flutuante)
**Posicao:** Floating Chat (canto inferior direito)

#### Layout do Chatbox

```
+---------------------------------------+
|  Chat com a IA                   [X] |
+---------------------------------------+
|                                       |
|  [Usuario]                            |
|  Cria um alerta critico de prazo     |
|  de recurso para o edital 2034       |
|  com disparo amanha as 8h            |
|                                       |
|  [IA - Tool Call: tool_configurar_   |
|   alertas] (collapsed, expansivel)   |
|                                       |
|  [IA]                                 |
|  Prontinho! Alerta critico de prazo  |
|  de recurso criado para o edital     |
|  2034. Vou te avisar amanha as 8h    |
|  via email e tela.                   |
|                                       |
|  [Link: Ver alerta criado -->]       |
|                                       |
+---------------------------------------+
|  [TextArea: "Mensagem para IA"]      |
|  [Botao: Enviar] [Botao: Anexar]     |
+---------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Historico da conversa, Tool calls expandidos, Confirmacoes da IA, Link para ver alerta criado
- **Preenchidos (input):** Mensagem em linguagem natural em [TextArea]
- **Obtidos (resposta do sistema):** Resposta natural da IA, Registro persistido em `AlertaFlag`, Job agendado, Atualizacao da tela FL01

### Excecoes
- **E1:** Edital 2034 nao existe - IA responde "Nao encontrei o edital 2034. Quer que eu liste seus editais recentes para escolher?"
- **E2:** Cooldown ativo (RN-084) - tool retorna erro e IA responde "Aguarda mais {N} segundos antes de me mandar outro pedido pesado. Enquanto isso, quer ver seus alertas ativos?"
- **E3:** Certidao usada como referencia esta vencida (RN-031) - tool valida e IA avisa "O alerta foi criado, mas te aviso que a certidao FGTS dessa empresa esta vencida desde 10/04/2026. Nao da para enviar proposta nesse estado."

---
