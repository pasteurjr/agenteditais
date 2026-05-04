---
uc_id: UC-MO02
nome: "Criar Monitoramento PNCP via IA"
sprint: "Sprint 6"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT 6.md"
linha_inicio_no_doc: 529
split_gerado_em: "2026-05-04T01:10:45"
---

# UC-MO02 — Criar Monitoramento PNCP via IA

> Caso de uso extraido automaticamente de `docs/CASOS DE USO SPRINT 6.md` (linha 529).
> Sprint origem: **Sprint 6**.

---

**RNs aplicadas:** RN-084 (cooldown 60s DeepSeek), RN-132 (audit de invocacoes), RN-037 (audit log)

**RF relacionado:** RF-048, RF-054 (Interface Hibrida)
**Ator:** Usuario (qualquer perfil com permissao)

### Pre-condicoes
1. Usuario autenticado
2. Tool `tool_configurar_monitoramento` registrada no catalogo DeepSeek
3. APScheduler ativo

### Pos-condicoes
1. Monitoramento criado em `MonitoramentoConfig` com todos os parametros
2. Job registrado no APScheduler com periodicidade configurada
3. Log de invocacao gravado (RN-132)
4. Primeira execucao disparada imediatamente OU na proxima janela programada

### Sequencia de Eventos

1. Usuario abre o [Floating Chat]
2. Digita: "Cria um monitoramento do PNCP para reagentes de hematologia em SP com valor entre 100k e 500k, roda 4 vezes ao dia"
3. Clica [Botao: Enviar]
4. Sistema verifica cooldown (RN-084)
5. DeepSeek processa e emite tool_call para `tool_configurar_monitoramento` com: `{fonte: "PNCP", termo: "hematologia reagentes", ncm_prefix: "3822", uf: "SP", valor_min: 100000, valor_max: 500000, periodicidade: "6h"}`
6. Tool executa: cria registro em `MonitoramentoConfig`, agenda job APScheduler com intervalo de 6h
7. Tool registra em `AuditoriaLog` (RN-132)
8. Tool retorna sucesso para DeepSeek
9. IA responde: "Criado! Vou olhar o PNCP a cada 6h atras de reagentes de hematologia em SP no intervalo de 100k a 500k. Primeira execucao agora, depois 18h, meia-noite, 6h..."
10. Chatbox exibe a mensagem
11. Usuario navega para MonitoriaPage > Aba "Ativos" e vê o novo monitoramento na tabela

### Tela(s) Representativa(s)

Chatbox ja descrito em UC-FL02.

**Elementos acessiveis:**
- **Acessados (leitura):** Historico da conversa, confirmacao da IA, link para monitoramento criado
- **Preenchidos (input):** Mensagem em linguagem natural
- **Obtidos (resposta do sistema):** Monitoramento persistido, job agendado, resposta natural

### Excecoes
- **E1:** Parametros incompletos - IA pede complemento: "Faltou a UF ou regiao. Pode me dizer onde quer que eu olhe?"
- **E2:** Monitoramento duplicado (mesmo criterio) - IA avisa: "Voce ja tem um monitoramento parecido ativo. Quer que eu atualize ele ou crie um novo?"

---
