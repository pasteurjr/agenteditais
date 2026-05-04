---
uc_id: UC-SM03
nome: "Consultar Fila de Envio e Reenviar Manualmente"
sprint: "Sprint 6"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT 6.md"
linha_inicio_no_doc: 1230
split_gerado_em: "2026-05-04T01:10:45"
---

# UC-SM03 — Consultar Fila de Envio e Reenviar Manualmente

> Caso de uso extraido automaticamente de `docs/CASOS DE USO SPRINT 6.md` (linha 1230).
> Sprint origem: **Sprint 6**.

---

**RNs aplicadas:** RN-037 (audit log)

**RF relacionado:** RF-052-01, RNF-003
**Ator:** Usuario (Administrador, Suporte)

### Pre-condicoes
1. Usuario autenticado com perfil admin/suporte
2. SMTP configurado e ativo

### Pos-condicoes
1. Usuario visualiza fila de envio em tempo real
2. Pode reenviar emails que falharam

### Sequencia de Eventos

1. Usuario acessa NotificacoesPage > [Aba: "Fila"]
2. [Secao: Stat Cards] mostra: Pendentes (azul), Enviados hoje (verde), Falhas hoje (vermelho), Taxa de sucesso % (amarelo)
3. [Tabela: Fila de Envio] exibe: Data/Hora Enfileiramento, Destinatario, Tipo, Assunto, Status (pendente/enviando/enviado/falhou/reagendado), Tentativas, Ultima Mensagem, Acoes
4. [Filtros]: Status, Destinatario, Periodo
5. Usuario localiza um email com status "falhou" e clica [Botao: "Reenviar"] na coluna Acoes
6. [Modal de confirmacao: "Reenviar email?"] abre mostrando preview do email
7. Usuario confirma, backend reenfileira o email com tentativa 1 zerada
8. [Toast: "Email reenfileirado. Proximo envio em ~10s"]
9. Usuario pode clicar [Botao: "Ver Detalhes"] em qualquer email para ver [Modal: "Detalhe do Envio"] com payload HTML, headers, resposta do servidor SMTP, stack trace (se erro)

### Tela(s) Representativa(s)

```
+---------------------------------------------------------------+
|  Notificacoes > Fila de Envio                                 |
|                                                               |
|  +--------+  +--------+  +--------+  +--------+              |
|  |Pendent.|  |Enviados|  |Falhas  |  |Taxa    |              |
|  |   8    |  | hoje   |  | hoje   |  |sucesso |              |
|  |(azul)  |  |  142   |  |   3    |  |97.9%   |              |
|  +--------+  +--------+  +--------+  +--------+              |
|                                                               |
|  Status: [Todos v]  Destinat.: [___]  Periodo: [hoje v]     |
|                                                               |
|  +------+-----------+------+---------+--------+----+-------+ |
|  |Data  |Destinat.  |Tipo  |Assunto  |Status  |Tent|Acao   | |
|  +------+-----------+------+---------+--------+----+-------+ |
|  |15:00 |joao@ch.com|prazo |Alerta:..|Enviado | 1  |[Det]  | |
|  +------+-----------+------+---------+--------+----+-------+ |
|  |14:55 |maria@ch...|cont. |Contrato.|Falhou  | 3  |[Reen] | |
|  |      |           |vence |..       |        |    |[Det]  | |
|  +------+-----------+------+---------+--------+----+-------+ |
|  |14:50 |pedro@ch...|audit.|Alterac..|Enviando| 1  |[Det]  | |
|  +------+-----------+------+---------+--------+----+-------+ |
|  |14:45 |ana@ch.com |prazo |Alerta:..|Pendente| 0  |[Can]  | |
|  +------+-----------+------+---------+--------+----+-------+ |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Stat Cards, Fila completa, Detalhes por email (payload, headers, erros)
- **Preenchidos (input):** Filtros, acao Reenviar, acao Cancelar pendente
- **Obtidos (resposta do sistema):** Fila em tempo real, reenvio confirmado, detalhes completos

### Excecoes
- **E1:** Email ja foi enviado com sucesso mas usuario quer reenviar - sistema permite mas marca o reenvio como `duplicado=true` no audit
- **E2:** Quota SMTP atingida - banner vermelho "Provedor SMTP atingiu quota diaria. Novos envios ficarao em fila"

---

# ANEXO — MAPEAMENTO RF x UC x RN

| RF | Descricao | UCs |
|---|---|---|
| RF-047 | Flags (Sinalizadores) | UC-FL01, UC-FL02, UC-FL03, UC-FL04, UC-FL05 |
| RF-048 | Monitoria | UC-MO01, UC-MO02, UC-MO05, UC-MO06 |
| RF-052-01 | Alertas Multi-tier | UC-FL01, UC-FL02, UC-SM01, UC-SM02 |
| RF-056 | Governanca e Auditoria | UC-AU01, UC-AU02, UC-AU03 |
| RF-054 | Interface Hibrida Chat+CRUD | UC-FL02, UC-MO02, UC-MO03, UC-MO04 |
| RF-004 | Documentos da Empresa | UC-MO03 |
| RF-002 | Gestao de Certidoes | UC-FL02, UC-MO03 (integracao) |
| RF-019 | Captacao de Editais | UC-MO04 |
| RNF-003 | Observabilidade | UC-SM01, UC-SM03 |

| RN | Descricao | UCs afetados | Status nesta sprint |
|---|---|---|---|
| RN-008 | Status visual certidao | UC-FL02, UC-MO03 | Enforced (ja existia) |
| RN-031 | Bloqueio certidao vencida | UC-FL02 | **Ativada FALTANTE->V4** |
| RN-037 | Audit log universal | Todos | **Ativada FALTANTE->V4** |
| RN-039 | Transicao automatica documento vencido | UC-FL02, UC-MO03 | **Ativada FALTANTE->V4** |
| RN-080 | Versionamento de decisao GO/NO-GO | UC-AU02 | **Ativada FALTANTE->V4** |
| RN-084 | Cooldown DeepSeek | UC-FL02, UC-MO02, UC-MO03, UC-MO04 | Enforced (ja existia) |
| RN-132 | Audit invocacoes DeepSeek | UC-FL02, UC-MO02, UC-MO03, UC-MO04 | **Ativada FALTANTE->V4** |
| RN-186 | Niveis de criticidade (cores) | UC-FL01, UC-FL05 | Enforced (ja existia) |
| RN-187 | Canais escalonados | UC-SM01, UC-SM02 | Enforced (ja existia) |
| RN-211 | Threshold divergencia auditoria | UC-FL01 | **Ativada FALTANTE->V4** |
| RN-212 | Contador prazo dispara automatico | UC-FL01, UC-FL02 | **Ativada FALTANTE->V4** |

---

**Total de RFs cobertos nesta sprint:** 7 (RF-002 parcial, RF-004, RF-047, RF-048, RF-052-01, RF-054, RF-056)
**Total de RNs enforced nesta sprint:** 11 (5 ja enforced + 6 ativadas a partir de FALTANTE)
**Total de UCs nesta sprint:** 17 (5 Flags + 6 Monitoria + 3 Auditoria + 3 SMTP)
