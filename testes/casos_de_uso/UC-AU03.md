---
uc_id: UC-AU03
nome: "Exportar Pacote de Compliance"
sprint: "Sprint 6"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT 6.md"
linha_inicio_no_doc: 1001
split_gerado_em: "2026-05-04T01:10:45"
---

# UC-AU03 — Exportar Pacote de Compliance

> Caso de uso extraido automaticamente de `docs/CASOS DE USO SPRINT 6.md` (linha 1001).
> Sprint origem: **Sprint 6**.

---

**RNs aplicadas:** RN-037 (audit log do proprio ato de exportar), LGPD (retencao e mascaramento)

**RF relacionado:** RF-056
**Ator:** Usuario (Administrador, Auditor Externo credenciado)

### Pre-condicoes
1. Usuario autenticado com perfil admin
2. Periodo selecionado tem registros de auditoria

### Pos-condicoes
1. Pacote PDF/CSV gerado, versionado e assinado (timestamp + hash SHA-256)
2. Arquivo salvo em storage temporario
3. Email enviado ao solicitante via SMTP com link de download (UC-SM03)
4. Registro da exportacao gravado em `AuditoriaLog`

### Sequencia de Eventos

1. Usuario acessa AuditoriaPage > [Aba: "Exportar"]
2. [Formulario: "Gerar Pacote de Compliance"] com campos: [DatePicker: "Periodo inicio"], [DatePicker: "Periodo fim"], [Select multi: "Entidades incluir"], [Select multi: "Usuarios incluir"], [Select: "Formato"] (PDF/CSV/ambos), [Checkbox: "Mascarar dados pessoais (LGPD)"] (default true), [Email: "Enviar para"] (default = usuario atual)
3. Usuario preenche e clica [Botao: "Gerar Pacote"]
4. Backend inicia job assincrono (pode levar ate alguns minutos para periodos longos)
5. Tela muda para [Card: "Pacote em Geracao"] com barra de progresso
6. Backend coleta registros, aplica mascaramento LGPD (nomes, emails, IPs), gera PDF com cabecalho/rodape/hash
7. Backend grava hash + metadados em `PacoteCompliance` e salva arquivo em storage
8. Backend envia email ao solicitante com link de download (valido por 7 dias)
9. Tela atualiza para [Card: "Pacote Gerado"] com botao [Botao: "Download"] direto
10. [Audit log] registra: quem exportou, periodo, filtros aplicados, hash do arquivo

### Tela(s) Representativa(s)

```
+---------------------------------------------------------------+
|  Auditoria > Exportar Pacote de Compliance                    |
|                                                               |
|  [Formulario]                                                 |
|  Periodo inicio: [01/04/2026 v]                              |
|  Periodo fim:    [15/04/2026 v]                              |
|                                                               |
|  Entidades:     [Edital, Proposta, Contrato v]              |
|  Usuarios:      [Todos v]                                    |
|  Formato:       (o) PDF  ( ) CSV  ( ) Ambos                 |
|                                                               |
|  [X] Mascarar dados pessoais (LGPD)                           |
|                                                               |
|  Enviar para: [maria@ch.com               ]                  |
|                                                               |
|  [Botao: Gerar Pacote]                                        |
|                                                               |
|  [Historico de Exportacoes]                                   |
|  +-----------+---------+-------+---------+----------+------+ |
|  |Data       |Solicit. |Formato|Hash     |Expira    |Acao  | |
|  +-----------+---------+-------+---------+----------+------+ |
|  |14/04 16:00|maria    |PDF    |a3f8...  |21/04     |[Down]| |
|  |10/04 09:30|joao     |CSV    |b7c2...  |Expirado  |--    | |
|  +-----------+---------+-------+---------+----------+------+ |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Historico de exportacoes anteriores com metadados
- **Preenchidos (input):** Periodo, Entidades, Usuarios, Formato, Flag LGPD, Email destino
- **Obtidos (resposta do sistema):** Job assincrono, notificacao SMTP, arquivo assinado disponivel para download

### Excecoes
- **E1:** Periodo muito grande (>90 dias) - sistema avisa "Periodo maior que 90 dias pode demorar. Quer continuar?" e exige confirmacao
- **E2:** Falha na geracao - exibe erro com botao "Tentar novamente" e loga em AuditoriaLog com flag `erro_exportacao=true`
- **E3:** Email nao enviado (fila SMTP) - pacote fica disponivel direto na tela e badge amarelo "Email pendente, download direto disponivel"

---

# FASE 4 — NOTIFICACOES SMTP PRODUCAO

---
