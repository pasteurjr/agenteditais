# Guia de Testes - Sprint 2: Alertas e Automação

## Visão Geral

Este documento descreve os casos de teste para todas as funcionalidades implementadas na Sprint 2 do Agente Editais.

## Pré-requisitos

1. Backend rodando na porta 5007
2. Frontend rodando na porta 5173 (ou 5175)
3. Banco de dados MySQL configurado
4. Pelo menos 1 edital cadastrado no banco (para testes de alertas)
5. Usuário autenticado

---

## 1. Dashboard de Prazos

### Caso de Teste 1.1: Visualizar dashboard de prazos (padrão 7 dias)
**Prompt:** `Mostre o dashboard de prazos dos editais`

**Resposta Esperada:**
```
📊 **Dashboard de Prazos** (próximos 7 dias)

### 📈 Resumo
- Total: **X** editais
- 🔴 Urgentes (< 24h): **Y**
- 🟡 Próximos (1-3 dias): **Z**
- 🟢 Agendados (> 3 dias): **W**

### 📋 Editais por Prazo
🔴 **PE-001/2026** - Secretaria de Saúde
   📅 Abertura: 05/02/2026 10:00
   ⏱️ **23h45min**
...
```

### Caso de Teste 1.2: Dashboard de prazos (30 dias)
**Prompt:** `Mostre o dashboard de prazos dos próximos 30 dias`

**Resposta Esperada:** Similar ao 1.1, mas com período de 30 dias.

### Caso de Teste 1.3: Dashboard sem editais
**Pré-condição:** Nenhum edital cadastrado

**Prompt:** `Mostre o dashboard de prazos`

**Resposta Esperada:**
```
📊 **Dashboard de Prazos** (próximos 7 dias)

### 📈 Resumo
- Total: **0** editais
...

ℹ️ Nenhum edital com prazo neste período.
```

---

## 2. Configuração de Alertas

### Caso de Teste 2.1: Configurar alertas com tempos especificados
**Pré-condição:** Edital PE-001/2026 cadastrado

**Prompt:** `Configure alertas para o edital PE-001/2026 com 1 dia, 1 hora e 15 minutos de antecedência`

**Resposta Esperada:**
```
✅ **Alertas configurados para PE-001/2026**

📋 **Alertas agendados:**
- ⏰ 1 dia antes → 04/02/2026 10:00
- ⏰ 1 hora antes → 05/02/2026 09:00
- ⏰ 15 minutos antes → 05/02/2026 09:45

🔔 **Canais:** Email: ✅ | Push: ✅
```

### Caso de Teste 2.2: Configurar alertas com tempos padrão
**Prompt:** `Configure alertas para o edital PE-002/2026`

**Resposta Esperada:**
```
✅ **Alertas configurados para PE-002/2026**

📋 **Alertas agendados:**
- ⏰ 1 dia antes → ...
- ⏰ 1 hora antes → ...
- ⏰ 15 minutos antes → ...

🔔 **Canais:** Email: ✅ | Push: ✅
```

### Caso de Teste 2.3: Configurar alerta sem especificar edital
**Prompt:** `Configure alertas`

**Resposta Esperada:**
```
⚠️ Para configurar alertas, preciso saber qual edital. Informe o número do edital, por exemplo:

*"Configure alertas para o PE 123/2024"*
```

### Caso de Teste 2.4: Configurar alerta apenas email
**Prompt:** `Configure alertas para o edital PE-003/2026 apenas por email`

**Resposta Esperada:**
```
✅ **Alertas configurados para PE-003/2026**
...
🔔 **Canais:** Email: ✅ | Push: ❌
```

---

## 3. Listar Alertas

### Caso de Teste 3.1: Listar alertas configurados
**Pré-condição:** Alertas configurados

**Prompt:** `Quais alertas tenho configurados?`

**Resposta Esperada:**
```
🔔 **Seus Alertas** (X encontrados)

⏳ **PE-001/2026** - Abertura
   📅 Disparo: 04/02/2026 10:00
   ⏰ 1 dia antes

⏳ **PE-001/2026** - Abertura
   📅 Disparo: 05/02/2026 09:00
   ⏰ 1 hora antes
...
```

### Caso de Teste 3.2: Listar alertas sem nenhum configurado
**Pré-condição:** Nenhum alerta configurado

**Prompt:** `Meus alertas`

**Resposta Esperada:**
```
📭 Você não tem alertas configurados.

Para criar alertas, diga algo como:
*"Configure alertas para o PE 123/2024 com 1 dia e 1 hora de antecedência"*
```

---

## 4. Cancelar Alertas

### Caso de Teste 4.1: Cancelar alertas de um edital
**Prompt:** `Cancele os alertas do edital PE-001/2026`

**Resposta Esperada:**
```
✅ **X alerta(s) cancelado(s)**

📋 Edital: PE-001/2026
```

### Caso de Teste 4.2: Cancelar todos os alertas
**Prompt:** `Cancele todos os meus alertas`

**Resposta Esperada:**
```
✅ **X alerta(s) cancelado(s)**
```

---

## 5. Calendário de Editais

### Caso de Teste 5.1: Calendário do mês atual
**Prompt:** `Mostre o calendário de editais deste mês`

**Resposta Esperada:**
```
📅 **Calendário de Editais - Fevereiro 2026**

Total: **X** editais no mês

### 📆 Dia 5
🆕 **PE-001/2026** - Ministério da Saúde
   ⏰ 10:00

### 📆 Dia 12
🔍 **PE-002/2026** - Secretaria Estadual
   ⏰ 14:00
...
```

### Caso de Teste 5.2: Calendário de um mês específico
**Prompt:** `Mostre o calendário de editais de março`

**Resposta Esperada:** Similar ao 5.1, mas para março.

### Caso de Teste 5.3: Calendário sem editais
**Prompt:** `Mostre o calendário de editais de dezembro`

**Resposta Esperada:**
```
📅 **Calendário de Editais - Dezembro 2026**

Total: **0** editais no mês

ℹ️ Nenhum edital com data neste mês.
```

---

## 6. Configurar Monitoramento

### Caso de Teste 6.1: Criar monitoramento básico
**Prompt:** `Monitore editais de equipamentos laboratoriais no PNCP`

**Resposta Esperada:**
```
✅ **Monitoramento Configurado**

🔍 **Termo:** equipamentos laboratoriais
📡 **Fontes:** pncp
📍 **UFs:** Todas
⏱️ **Frequência:** A cada 4 hora(s)
📊 **Score mínimo para alerta:** 70%

🆔 ID: `abc123...`
```

### Caso de Teste 6.2: Monitoramento com UFs específicas
**Prompt:** `Monitore editais de reagentes em SP e MG`

**Resposta Esperada:**
```
✅ **Monitoramento Configurado**

🔍 **Termo:** reagentes
📡 **Fontes:** pncp
📍 **UFs:** SP, MG
⏱️ **Frequência:** A cada 4 hora(s)
📊 **Score mínimo para alerta:** 70%
...
```

### Caso de Teste 6.3: Monitoramento sem termo
**Prompt:** `Configure monitoramento`

**Resposta Esperada:**
```
⚠️ Para configurar um monitoramento, preciso saber o que monitorar.

Exemplos:
- *"Monitore editais de equipamentos laboratoriais"*
- *"Configure monitoramento para reagentes em SP e MG"*
```

---

## 7. Listar Monitoramentos

### Caso de Teste 7.1: Listar monitoramentos ativos
**Prompt:** `Quais monitoramentos tenho ativos?`

**Resposta Esperada:**
```
🔍 **Seus Monitoramentos** (X encontrados)

✅ **equipamentos laboratoriais**
   📡 Fontes: pncp
   📍 UFs: Todas
   ⏱️ A cada 4h
   📊 Score mínimo: 70%
   🕐 Última execução: 04/02/2026 15:30
   📋 Editais encontrados: 12
...
```

### Caso de Teste 7.2: Sem monitoramentos
**Prompt:** `Meus monitoramentos`

**Resposta Esperada:**
```
📭 Você não tem monitoramentos configurados.

Para criar um monitoramento, diga algo como:
*"Monitore editais de equipamentos laboratoriais no PNCP"*
```

---

## 8. Desativar Monitoramento

### Caso de Teste 8.1: Desativar monitoramento por termo
**Prompt:** `Desative o monitoramento de equipamentos laboratoriais`

**Resposta Esperada:**
```
✅ Monitoramento desativado com sucesso!

🔍 **Termo:** equipamentos laboratoriais
```

---

## 9. Configurar Notificações

### Caso de Teste 9.1: Configurar email de notificação
**Prompt:** `Configure notificações para o email teste@email.com`

**Resposta Esperada:**
```
✅ **Preferências de Notificação Atualizadas**

📧 **Email:** ✅ Habilitado
   Enviar para: teste@email.com
🔔 **Push:** ✅ Habilitado
```

### Caso de Teste 9.2: Desativar email
**Prompt:** `Desativar notificações por email`

**Resposta Esperada:**
```
✅ **Preferências de Notificação Atualizadas**

📧 **Email:** ❌ Desabilitado
🔔 **Push:** ✅ Habilitado
```

---

## 10. Histórico de Notificações

### Caso de Teste 10.1: Ver histórico
**Prompt:** `Mostre o histórico de notificações`

**Resposta Esperada:**
```
📬 **Suas Notificações** (X exibidas, Y não lidas)

🔵 ⏰ **Alerta de Prazo - PE-001/2026**
   O edital PE-001/2026 abre em 1 hora...
   🕐 04/02/2026 09:00

👁️ 📋 **Novo edital encontrado - reagentes**
   O monitoramento 'reagentes' encontrou 3 novos editais!...
   🕐 03/02/2026 16:00
...
```

### Caso de Teste 10.2: Notificações não lidas
**Prompt:** `Quais notificações não li?`

**Resposta Esperada:** Apenas notificações não lidas.

### Caso de Teste 10.3: Sem notificações
**Prompt:** `Histórico de notificações`

**Resposta Esperada:**
```
📭 Você não tem notificações.

As notificações aparecem quando:
- Alertas de prazo são disparados
- Novos editais são encontrados pelo monitoramento
- O sistema precisa informar algo importante
```

---

## 11. Extração de Datas (com PDF)

### Caso de Teste 11.1: Solicitar extração sem PDF
**Prompt:** `Extraia as datas do edital PE-001/2026`

**Resposta Esperada:**
```
⚠️ Para extrair as datas do edital **PE-001/2026**, faça upload do PDF do edital.

Após o upload, direi:
*"Extraia as datas do edital PE-001/2026"*
```

### Caso de Teste 11.2: Extração com PDF (simulado)
**Pré-condição:** PDF de edital anexado

**Prompt:** `Extraia as datas deste edital`

**Resposta Esperada:**
```
📅 **Datas Extraídas do Edital**

📆 **Data de Abertura:** 05/02/2026
⏰ **Horário:** 10:00
📝 **Limite para Propostas:** 04/02/2026 18:00
⚠️ **Prazo Impugnação:** 02/02/2026
📰 **Data Publicação:** 20/01/2026

💡 *Deseja configurar alertas para estas datas?*
```

---

## 12. Testes de Menu Lateral (Sidebar)

### Caso de Teste 12.1: Expandir menu "Alertas e Prazos"
**Ação:** Clicar no menu "Alertas e Prazos" na sidebar

**Resultado Esperado:** Menu expande mostrando sub-itens:
- Dashboard de Prazos
- Próximos Pregões
- Meus Alertas
- Configurar Alerta

### Caso de Teste 12.2: Clicar em item do menu
**Ação:** Clicar em "Dashboard de Prazos"

**Resultado Esperado:** Prompt "Mostre o dashboard de prazos dos editais" é enviado e a resposta aparece no chat.

### Caso de Teste 12.3: Todos os menus expandem/colapsam
**Ação:** Clicar em cada grupo de menu

**Resultado Esperado:** Todos os grupos expandem e mostram sub-itens:
- Alertas e Prazos
- Monitoramento
- Calendário
- Notificações

---

## 13. Testes de Dropdown (ChatInput)

### Caso de Teste 13.1: Selecionar prompt de Dashboard
**Ação:** Selecionar "✅ 📊 Dashboard de prazos" no dropdown

**Resultado Esperado:** Campo de texto preenchido com "Mostre o dashboard de prazos dos editais"

### Caso de Teste 13.2: Selecionar prompt de Monitoramento
**Ação:** Selecionar "✅ 👁️ Criar monitoramento" no dropdown

**Resultado Esperado:** Campo de texto preenchido com "Monitore editais de [TERMO] no PNCP"

### Caso de Teste 13.3: Verificar seções Sprint 2
**Ação:** Abrir dropdown e verificar seções

**Resultado Esperado:** Seções visíveis:
- ━━━ 13. ALERTAS E PRAZOS (Sprint 2) ━━━
- ━━━ 14. CALENDÁRIO DE EDITAIS (Sprint 2) ━━━
- ━━━ 15. MONITORAMENTO AUTOMÁTICO (Sprint 2) ━━━
- ━━━ 16. NOTIFICAÇÕES (Sprint 2) ━━━
- ━━━ 17. EXTRAÇÃO DE DATAS (Sprint 2) ━━━

---

## 14. Testes de Scheduler (Backend)

### Caso de Teste 14.1: Verificar inicialização do scheduler
**Ação:** Iniciar o backend (python app.py)

**Log Esperado:**
```
[SCHEDULER] Iniciado com sucesso!
[SCHEDULER] - Verificação de alertas: a cada 5 minutos
[SCHEDULER] - Monitoramentos: a cada 60 minutos
[SCHEDULER] - Limpeza de notificações: diária às 3h
```

### Caso de Teste 14.2: Job de verificação de alertas
**Pré-condição:** Alerta agendado para tempo passado

**Ação:** Aguardar 5 minutos

**Log Esperado:**
```
[SCHEDULER] 2026-02-04 15:05:00 - Verificando alertas de prazo...
[SCHEDULER] 1 alertas para disparar
[SCHEDULER] Alerta abc123 disparado para usuario@email.com
```

---

## 15. Teste de Integração Completa

### Cenário: Fluxo completo de alertas

1. **Cadastrar edital** (se necessário)
   - `Cadastre o edital PE-TEST/2026, órgão Teste, objeto: Teste Sprint 2, abertura: 06/02/2026 10:00`

2. **Configurar alertas**
   - `Configure alertas para o PE-TEST/2026 com 1 hora e 15 minutos de antecedência`

3. **Verificar alertas**
   - `Quais alertas tenho configurados?`

4. **Ver no dashboard**
   - `Mostre o dashboard de prazos`

5. **Ver no calendário**
   - `Mostre o calendário de fevereiro`

6. **Cancelar alertas**
   - `Cancele os alertas do PE-TEST/2026`

7. **Verificar cancelamento**
   - `Meus alertas`

---

## Checklist de Testes

| # | Funcionalidade | Teste | Status |
|---|----------------|-------|--------|
| 1 | Dashboard Prazos | 7 dias | ⬜ |
| 2 | Dashboard Prazos | 30 dias | ⬜ |
| 3 | Dashboard Prazos | Sem editais | ⬜ |
| 4 | Configurar Alertas | Com tempos | ⬜ |
| 5 | Configurar Alertas | Tempos padrão | ⬜ |
| 6 | Configurar Alertas | Sem edital | ⬜ |
| 7 | Listar Alertas | Com alertas | ⬜ |
| 8 | Listar Alertas | Sem alertas | ⬜ |
| 9 | Cancelar Alertas | Por edital | ⬜ |
| 10 | Cancelar Alertas | Todos | ⬜ |
| 11 | Calendário | Mês atual | ⬜ |
| 12 | Calendário | Mês específico | ⬜ |
| 13 | Monitoramento | Criar básico | ⬜ |
| 14 | Monitoramento | Com UFs | ⬜ |
| 15 | Monitoramento | Listar | ⬜ |
| 16 | Monitoramento | Desativar | ⬜ |
| 17 | Notificações | Configurar email | ⬜ |
| 18 | Notificações | Histórico | ⬜ |
| 19 | Notificações | Não lidas | ⬜ |
| 20 | Extração Datas | Sem PDF | ⬜ |
| 21 | Menu Sidebar | Expandir/Colapsar | ⬜ |
| 22 | Menu Sidebar | Clicar item | ⬜ |
| 23 | Dropdown | Seções Sprint 2 | ⬜ |
| 24 | Scheduler | Inicialização | ⬜ |
| 25 | Integração | Fluxo completo | ⬜ |

---

## Notas

- Todos os testes devem ser executados com usuário autenticado
- Para testes de scheduler, aguardar o intervalo configurado (5 min para alertas)
- Para testes de email, configurar SMTP_USER e SMTP_PASSWORD no .env
- A extração de datas de PDF depende do upload de arquivo

---

*Documento gerado em 04/02/2026 - Sprint 2: Alertas e Automação*
