---
uc_id: UC-SM01
nome: "Configurar Servidor SMTP"
sprint: "Sprint 6"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT 6.md"
linha_inicio_no_doc: 1077
split_gerado_em: "2026-05-04T01:10:45"
---

# UC-SM01 — Configurar Servidor SMTP

> Caso de uso extraido automaticamente de `docs/CASOS DE USO SPRINT 6.md` (linha 1077).
> Sprint origem: **Sprint 6**.

---

**RNs aplicadas:** RN-037 (audit log), RN-187 (canais escalonados)

**RF relacionado:** RF-052-01, RNF-003 (Observabilidade)
**Ator:** Usuario (Administrador)

### Pre-condicoes
1. Usuario autenticado como administrador
2. Credenciais SMTP validas disponiveis (Gmail/M365/SendGrid/SES/proprio)

### Pos-condicoes
1. Configuracao persistida em `ConfiguracaoSMTP` com senha criptografada
2. Conexao testada com envio de email de verificacao
3. Sistema em modo SMTP_LIVE_MODE=true
4. Registro em AuditoriaLog

### Sequencia de Eventos

1. Usuario acessa NotificacoesPage (`/app/notificacoes`) via menu "Administracao > Notificacoes"
2. Clica na [Aba: "Servidor"]
3. [Card: "Configuracao SMTP"] exibe formulario
4. Usuario preenche: [TextInput: "Host"] (ex: smtp.gmail.com), [NumericInput: "Porta"] (ex: 587), [Select: "Seguranca"] (TLS/SSL/Nenhuma), [TextInput: "Usuario"], [PasswordInput: "Senha"], [TextInput: "Remetente padrao"] (ex: notificacoes@empresa.com), [TextInput: "Nome do remetente"]
5. Usuario pode adicionar remetentes alternativos por tipo de alerta via [Botao: "+ Adicionar Remetente Alternativo"]: [Select: "Tipo de alerta"], [TextInput: "Remetente alternativo"]
6. Clica [Botao: "Testar Conexao"]
7. Sistema tenta conectar + enviar email de verificacao para o proprio remetente
8. Se sucesso: [Toast: "Email de verificacao enviado. Confira a caixa de entrada"]
9. Se falha: [Toast erro: "Falha: {mensagem_detalhada}"]
10. Usuario clica [Botao: "Salvar Configuracao"] apos teste OK
11. Backend criptografa senha (AES-256), persiste, muda flag `SMTP_LIVE_MODE=true`
12. [Audit log] registra com usuario, timestamp, IP (senha nunca e logada)

### Tela(s) Representativa(s)

```
+---------------------------------------------------------------+
|  Notificacoes > Servidor SMTP                                 |
|                                                               |
|  [Card: Configuracao SMTP]                                    |
|                                                               |
|  Host:     [smtp.gmail.com___________]                       |
|  Porta:    [587_____]                                         |
|  Seguranca: (o) TLS  ( ) SSL  ( ) Nenhuma                    |
|  Usuario:  [notif@empresa.com________]                       |
|  Senha:    [*********_________________]                      |
|  Remetente padrao: [notif@empresa.com]                       |
|  Nome: [Facilitia Notificacoes__________]                    |
|                                                               |
|  [Card: Remetentes Alternativos]                              |
|  +----------------------+---------------------------+       | |
|  |Tipo de Alerta        |Remetente                  |       | |
|  +----------------------+---------------------------+       | |
|  |prazo_recurso         |juridico@empresa.com       |       | |
|  |contrato_vencimento   |comercial@empresa.com      |       | |
|  +----------------------+---------------------------+       | |
|  [Botao: + Adicionar]                                         |
|                                                               |
|  [Botao: Testar Conexao]  [Botao: Salvar Configuracao]       |
|                                                               |
|  Status: ✓ Conectado (ultima verificacao: 15/04 14:00)       |
|  Modo: SMTP_LIVE_MODE=true                                    |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Status de conexao, ultimo teste OK, lista de remetentes alternativos
- **Preenchidos (input):** Host, Porta, Seguranca, Usuario, Senha, Remetente padrao, Nome, Remetentes alternativos por tipo
- **Obtidos (resposta do sistema):** Teste de conexao, envio de email de verificacao, persistencia criptografada

### Excecoes
- **E1:** Credenciais invalidas - [Toast: "Falha de autenticacao. Verifique usuario e senha"]
- **E2:** Porta bloqueada por firewall - [Toast: "Timeout ao conectar. Porta pode estar bloqueada"]
- **E3:** Servidor SMTP nao aceita STARTTLS - [Toast: "Servidor nao suporta TLS. Tente SSL ou Nenhuma"]

---
