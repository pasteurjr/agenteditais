# Conjunto de Dados C V8 — Sprint 6 (Alertas / Monitoramentos / Auditoria / SMTP) / Empresa Vita-Sense

> **V8** — Conjunto C de dados, continuidade da cadeia Vita-Sense S1→S5 V8. Estrutura idêntica ao molde; identidade adaptada.

**Data:** 2026-05-18
**Usuario:** validaargus@valida.com.br / 123456
**Empresa:** Vita-Sense (CNPJ 49.825.713/0001-04)
**Referencia:** `docs/CASOS DE USO SPRINT 6.md`
**UCs cobertos:** 17 (FL01..FL05, MO01..MO06, AU01..AU03, SM01..SM03)

---

## 1. Credenciais e acesso

| Campo | Valor |
|---|---|
| Email | validaargus@valida.com.br |
| Senha | 123456 |
| Empresa selecionada | Vita-Sense |
| Papel | Superusuário |
| Backend | http://localhost:5007 |
| Frontend | http://localhost:5180 |

---

## 2. Referencias pre-existentes

- **Editais:** >=28 distribuidos em 9 UFs (Sprints 1-5)
- **Contratos:** >=12 vigentes
- **Empenhos:** 2 (EMPH-2026-0001 + EMPH-2026-0002)
- **Seed anterior:** `python backend/seeds/sprint5_seed.py` (obrigatorio)

---

## 3. Alertas (8 registros)

| # | Tipo | Status | Data Disparo | Titulo | Edital ref |
|---|---|---|---|---|---|
| 1 | abertura | agendado | +3 dias | Abertura PE Hemograma SP | Edital Vita-Sense #1 |
| 2 | impugnacao | agendado | +7 dias | Prazo impugnacao edital MG | Edital Vita-Sense #2 |
| 3 | recursos | agendado | +1 dia | Prazo recurso edital RS | Edital Vita-Sense #3 |
| 4 | proposta | disparado | -2 dias | Proposta edital RJ vence hoje | Edital Vita-Sense #4 |
| 5 | contrato_vencimento | disparado | -5 dias | Contrato CTR-CH-2026-V30 vence | Edital Vita-Sense #5 |
| 6 | personalizado | lido | -10 dias | Revisar documentacao empresa | Edital Vita-Sense #6 |
| 7 | abertura | cancelado | +15 dias | Licitacao cancelada pelo orgao | Edital Vita-Sense #7 |
| 8 | entrega_prazo | agendado | +2 dias | Entrega reagentes prazo | Edital Vita-Sense #8 |

**Distribuicao por status:**
- Agendados: 4
- Disparados: 2
- Lidos: 1
- Cancelados: 1

---

## 4. Monitoramentos (5 registros)

| # | Termo | UFs | Freq. (h) | Ativo | Encontrados | Ultimo Check | Obs |
|---|---|---|---|---|---|---|---|
| 1 | hematologia | SP, RJ, MG | 4 | Sim | 12 | -2h | Normal |
| 2 | reagentes laboratoriais | SP, RS | 8 | Sim | 7 | -4h | Normal |
| 3 | equipamento diagnostico | MG, BA, GO | 12 | Sim | 3 | -6h | Normal |
| 4 | kit coagulacao | PR, SC | 4 | Nao | 5 | -48h | **Pausado** |
| 5 | biomol pcr | SP | 4 | Sim | 2 | -72h | **COM ERRO** |

**Distribuicao:**
- Ativos: 3 (normais)
- Pausados: 1
- Com erro: 1 (ultimo_check > 3 * frequencia_horas = 72h > 12h)

---

## 5. Auditoria (10 registros)

| # | Acao | Entidade | Sensivel | Created At |
|---|---|---|---|---|
| 1 | create | edital | Nao | -5 dias |
| 2 | update | edital | Nao | -4 dias |
| 3 | create | proposta | Nao | -3 dias |
| 4 | update | smtp-config | **Sim** | -2 dias |
| 5 | update | parametros-score | **Sim** | -1 dia |
| 6 | create | contrato | Nao | -6 dias |
| 7 | delete | alerta | Nao | -1 dia |
| 8 | update | users | **Sim** | -3 dias |
| 9 | create | monitoramento | Nao | -2 dias |
| 10 | login | auth | Nao | -1 dia |

**Entidades sensiveis (audit_middleware):** smtp-config, users, empresas, contratos, propostas, parametros-score.
**Total sensiveis:** 3 registros (#4, #5, #8)

---

## 6. Configuracao SMTP (1 global)

| Campo | Valor |
|---|---|
| Host | smtp.empresa.com.br |
| Porta | 587 |
| Usuario | alertas@empresa.com.br |
| Senha | *** (criptografada) |
| From Email | alertas@empresa.com.br |
| From Name | Sistema Argus |
| TLS | Habilitado |
| Modo producao | **Desligado** (dry-run) |
| Escopo | Global (empresa_id = NULL) |

---

## 7. Templates de Email (4 registros)

| Slug | Nome | Assunto |
|---|---|---|
| alerta-edital | Alerta de Edital | Novo alerta: {{edital_numero}} |
| certidao-vencida | Certidao Vencida | Certidao {{tipo}} venceu em {{data_vencimento}} |
| contrato-vencimento | Contrato a Vencer | Contrato {{numero}} vence em {{dias}} dias |
| monitoramento-encontrado | Monitoramento Encontrado | {{total}} editais encontrados para "{{termo}}" |

---

## 8. Fila de Email (6 registros)

| # | Destinatario | Template | Status | Assunto |
|---|---|---|---|---|
| 1 | validaargus@valida.com.br | alerta-edital | pending | Novo alerta: PE-2026-SP-001 |
| 2 | gestor@empresa.com.br | certidao-vencida | pending | Certidao CRF venceu em 10/04/2026 |
| 3 | validaargus@valida.com.br | contrato-vencimento | sent | Contrato CTR-CH-2026-V30 vence em 15 dias |
| 4 | fiscal@empresa.com.br | contrato-vencimento | sent | Contrato CTR-CH-2026-V90 vence em 60 dias |
| 5 | validaargus@valida.com.br | monitoramento-encontrado | failed | 5 editais encontrados para "hematologia" |
| 6 | suporte@empresa.com.br | alerta-edital | failed | Novo alerta: PE-2026-MG-003 |

**Distribuicao:**
- Pendentes: 2
- Enviados: 2
- Falhados: 2 (retry=3 Connection refused / retry=2 Timeout)
