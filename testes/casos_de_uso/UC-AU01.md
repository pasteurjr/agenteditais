---
uc_id: UC-AU01
nome: "Consultar Registros de Auditoria"
sprint: "Sprint 6"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT 6.md"
linha_inicio_no_doc: 833
split_gerado_em: "2026-05-04T01:10:45"
---

# UC-AU01 — Consultar Registros de Auditoria

> Caso de uso extraido automaticamente de `docs/CASOS DE USO SPRINT 6.md` (linha 833).
> Sprint origem: **Sprint 6**.

---

**RNs aplicadas:** RN-037 (audit log — inclusive do proprio ato de consultar)

**RF relacionado:** RF-056 (Governanca e Auditoria), RF-054
**Ator:** Usuario (Auditor Interno, Diretor, Administrador)

### Pre-condicoes
1. Usuario autenticado com perfil que permite consultar auditoria (auditor/diretor/admin)
2. Middleware de auditoria ja populou `auditoria_log` com eventos recentes

### Pos-condicoes
1. Usuario visualiza registros conforme filtros aplicados
2. A propria consulta e registrada em `AuditoriaLog` com flag `consulta_auditoria=true`

### Sequencia de Eventos

1. Usuario acessa AuditoriaPage (`/app/auditoria`) via menu lateral "Governanca > Auditoria"
2. [Cabecalho: "Registros de Auditoria"] exibe pagina
3. [Secao: Filtros — horizontal] com: Entidade (Select multi), Usuario (Select), Operacao (Select: CREATE/UPDATE/DELETE/STATE_TRANSITION/LOGIN/LOGOUT), Periodo (DatePicker), ID da Entidade (TextInput opcional)
4. [Aba: "Registros"] (default) exibe tabela paginada
5. [Tabela: Registros] mostra: Timestamp, Usuario, IP, Entidade, ID, Operacao, Resumo da Mudanca
6. Usuario clica em uma linha - [Modal: "Detalhe do Registro"] abre
7. Modal mostra: timestamp ISO, usuario completo, IP, user_agent, entidade, operacao, estado_anterior (JSON collapsible), estado_novo (JSON collapsible), diff visual (campos em vermelho/verde), contexto adicional
8. Usuario pode clicar [Botao: "Copiar JSON"] para copiar o registro bruto

### Tela(s) Representativa(s)

```
+---------------------------------------------------------------+
|  Registros de Auditoria                                       |
|                                                               |
|  [Filtros]                                                    |
|  Entidade: [Edital, Proposta v]   Usuario: [Todos v]         |
|  Operacao: [Todos v]   Periodo: [ultimos 7 dias v]           |
|  ID: [____________]  [Botao: Aplicar Filtros]                 |
|                                                               |
|  +------+-----------+-----------+-------+------+----+-------+ |
|  |Times-|Usuario    |IP         |Entid. |ID    |Op. |Resumo | |
|  |tamp  |           |           |       |      |    |       | |
|  +------+-----------+-----------+-------+------+----+-------+ |
|  |15/04 |joao@ch.com|192.168.1.4|Edital |2034  |UPD |status:| |
|  |14:32 |           |           |       |      |    |em_pro-| |
|  |      |           |           |       |      |    |posta  | |
|  +------+-----------+-----------+-------+------+----+-------+ |
|  |15/04 |maria@ch.co|10.0.0.55  |Param- |1     |UPD |peso_  | |
|  |11:15 |           |           |Score  |      |    |tec 0.4| |
|  |      |           |           |       |      |    |-> 0.6 | |
|  +------+-----------+-----------+-------+------+----+-------+ |
|                                                               |
|  [Paginacao: << 1 2 3 ... >>]  [Botao: Exportar CSV]         |
+---------------------------------------------------------------+
```

#### Modal "Detalhe do Registro"

```
+---------------------------------------------------------------+
|  Detalhe do Registro de Auditoria              [X]            |
|                                                               |
|  Timestamp: 2026-04-15T11:15:32.442Z                          |
|  Usuario: maria@ch.com (id=7, role=diretor)                   |
|  IP: 10.0.0.55  User-Agent: Mozilla/5.0...                    |
|  Entidade: ParametroScore                                     |
|  ID: 1                                                        |
|  Operacao: UPDATE                                             |
|                                                               |
|  [Secao: Estado Anterior] [v expandir]                        |
|  {                                                            |
|    "peso_tecnico": 0.4,                                      |
|    "peso_juridico": 0.2,                                     |
|    ...                                                        |
|  }                                                            |
|                                                               |
|  [Secao: Estado Novo] [v expandir]                            |
|  {                                                            |
|    "peso_tecnico": 0.6,   <- alterado                        |
|    "peso_juridico": 0.2,                                     |
|    ...                                                        |
|  }                                                            |
|                                                               |
|  [Secao: Diff Visual]                                         |
|  - peso_tecnico: 0.4                                          |
|  + peso_tecnico: 0.6                                          |
|                                                               |
|  [Secao: Contexto]                                            |
|  Alerta de Auditoria Sensivel foi disparado                  |
|  (ID: alerta_89)                                              |
|                                                               |
|  [Botao: Copiar JSON]  [Botao: Fechar]                        |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Tabela paginada de registros, detalhes completos em modal, diffs
- **Preenchidos (input):** Filtros (Entidade, Usuario, Operacao, Periodo, ID)
- **Obtidos (resposta do sistema):** Lista filtrada, detalhes, exportacao CSV

### Excecoes
- **E1:** Usuario sem permissao - pagina mostra erro 403 "Voce nao tem permissao para acessar Auditoria. Entre em contato com o administrador"
- **E2:** Filtro retorna 0 resultados - tabela exibe estado vazio "Nenhum registro encontrado para os filtros aplicados"
- **E3:** Registro de auditoria com estado_anterior nulo (operacao CREATE) - modal oculta a secao "Estado Anterior"

---
