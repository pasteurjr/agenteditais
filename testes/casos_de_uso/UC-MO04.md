---
uc_id: UC-MO04
nome: "Verificar Pendencias PNCP de Edital (sob demanda)"
sprint: "Sprint 6"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT 6.md"
linha_inicio_no_doc: 662
split_gerado_em: "2026-05-04T01:10:45"
---

# UC-MO04 — Verificar Pendencias PNCP de Edital (sob demanda)

> Caso de uso extraido automaticamente de `docs/CASOS DE USO SPRINT 6.md` (linha 662).
> Sprint origem: **Sprint 6**.

---

**RNs aplicadas:** RN-084 (cooldown), RN-132 (audit invocacao), RN-037 (audit log)

**RF relacionado:** RF-048, RF-019 (Captacao de Editais)
**Ator:** Usuario (Analista)

### Pre-condicoes
1. Usuario autenticado
2. Edital existe no banco local
3. Tool `tool_verificar_pendencias_pncp` registrada
4. Conexao com API do PNCP disponivel

### Pos-condicoes
1. Consulta PNCP realizada
2. Diferencas entre estado local vs PNCP detectadas e registradas
3. Se houver adendo/prorrogacao/cancelamento, alerta criado automaticamente

### Sequencia de Eventos

1. Usuario abre Floating Chat
2. Digita: "Verifica se o edital 2034 tem pendencias ou atualizacoes no PNCP"
3. Clica Enviar
4. DeepSeek emite tool_call `tool_verificar_pendencias_pncp` com `edital_id=2034`
5. Tool consulta PNCP via API usando numero_controle_pncp do edital local
6. Tool compara campo-a-campo: objeto, data_abertura, valor_estimado, status, termo_referencia_hash
7. Para cada diferenca, registra em `PendenciaPNCP` com: campo, valor_local, valor_pncp, data_deteccao
8. Se diferenca for "adendo publicado" ou "prorrogacao" ou "cancelamento" ou "suspensao", tool chama `tool_configurar_alertas` aninhada com criticidade `alto`
9. Tool registra em `AuditoriaLog`
10. Tool retorna JSON com diferencas
11. IA responde: "Verifiquei o edital 2034 no PNCP. Encontrei 2 mudancas: 1) O orgao publicou um adendo em 14/04 alterando o termo de referencia (tem anexo novo), 2) A data de abertura foi prorrogada de 18/04 para 25/04. Ja criei um alerta alto para voce."

### Tela(s) Representativa(s)

Chatbox com resposta estruturada contendo links para os detalhes.

**Elementos acessiveis:**
- **Acessados (leitura):** Resposta da IA com sumario de pendencias, links para entidades afetadas
- **Preenchidos (input):** Comando natural
- **Obtidos (resposta do sistema):** Lista de pendencias, alertas automaticos, registro em PendenciaPNCP

### Excecoes
- **E1:** Edital nao encontrado no PNCP - IA responde: "Esse edital nao consta mais no PNCP. Pode ter sido removido ou o numero_controle esta errado"
- **E2:** API PNCP indisponivel - IA responde: "O PNCP esta indisponivel agora. Vou tentar novamente em 10 minutos automaticamente. Se urgente, tenta via web"

---
