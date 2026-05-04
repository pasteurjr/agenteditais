---
uc_id: UC-SM02
nome: "Gerenciar Templates de Email"
sprint: "Sprint 6"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT 6.md"
linha_inicio_no_doc: 1153
split_gerado_em: "2026-05-04T01:10:45"
---

# UC-SM02 — Gerenciar Templates de Email

> Caso de uso extraido automaticamente de `docs/CASOS DE USO SPRINT 6.md` (linha 1153).
> Sprint origem: **Sprint 6**.

---

**RNs aplicadas:** RN-037 (audit log de edicao de template)

**RF relacionado:** RF-052-01, RF-056
**Ator:** Usuario (Administrador, Comunicacao)

### Pre-condicoes
1. Usuario autenticado com perfil admin/comunicacao
2. Configuracao SMTP ativa (UC-SM01 concluido)

### Pos-condicoes
1. Templates persistidos em `TemplateEmail` com versionamento
2. Versao anterior preservada (historico)

### Sequencia de Eventos

1. Usuario acessa NotificacoesPage > [Aba: "Templates"]
2. [Card: "Templates de Email"] exibe lista dos 10 templates pre-cadastrados (1 por tipo de alerta)
3. [Tabela: Templates] mostra: Tipo, Nome, Ultima Edicao, Versao, Acoes
4. Usuario clica [Botao: "Editar"] em um template
5. [Modal Fullscreen: "Editor de Template"] abre
6. Editor tem 3 paineis:
   - Esquerda: [Editor WYSIWYG: "Corpo HTML"] com toolbar (negrito, italico, link, imagem)
   - Centro: [TextArea: "Variaveis disponiveis"] com lista: `{{ nome_usuario }}`, `{{ numero_edital }}`, `{{ data_limite }}`, `{{ link_sistema }}`, `{{ criticidade }}`, etc
   - Direita: [Preview: "Visualizacao em tempo real"] renderiza com valores de exemplo
7. Usuario edita o HTML usando as variaveis
8. [TextInput: "Assunto"] com variaveis tambem
9. Usuario clica [Botao: "Salvar Nova Versao"]
10. Sistema cria nova entrada em `TemplateEmail` com `versao=N+1`, mantem a anterior como `ativo=false`, define a nova como `ativo=true`
11. Registra em AuditoriaLog com diff antes/depois
12. [Toast: "Template salvo como versao {N+1}"]

### Tela(s) Representativa(s)

#### Modal Fullscreen "Editor de Template"

```
+---------------------------------------------------------------+
|  Editor de Template: Prazo de Recurso        [X]              |
|                                                               |
|  Versao atual: v3  |  Criado por: joao@ch.com                |
|                                                               |
|  Assunto: [Alerta: Prazo de recurso vence em {{horas}}h_]    |
|                                                               |
|  +---------------------+------------+--------------------+   |
|  | Corpo HTML          |Variaveis   |Preview             |   |
|  +---------------------+------------+--------------------+   |
|  | [B][I][Link][Img]   |{{nome_usu-}|                    |   |
|  |                     |ario}}      |Ola Joao,           |   |
|  | Ola {{nome_usuario}}|{{numero_   |                    |   |
|  | ,                   |edital}}    |O prazo do recurso  |   |
|  |                     |{{data_limi}|do edital 2034      |   |
|  | O prazo do recurso  |te}}        |vence em 2 horas.   |   |
|  | do edital           |{{horas}}   |                    |   |
|  | {{numero_edital}}   |{{link_sis-}|Acesse o sistema    |   |
|  | vence em {{horas}}  |tema}}      |para fazer o envio: |   |
|  | horas.              |{{criticid-}|                    |   |
|  |                     |ade}}       |[Acessar Sistema]   |   |
|  | Acesse o sistema    |            |                    |   |
|  | para fazer o envio: |            |                    |   |
|  |                     |            |                    |   |
|  | [{{link_sistema}}]  |            |                    |   |
|  +---------------------+------------+--------------------+   |
|                                                               |
|  [Botao: Salvar Nova Versao]  [Botao: Historico]  [Botao:    |
|                                                   Descartar]|
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Historico de versoes, lista de variaveis disponiveis, preview em tempo real
- **Preenchidos (input):** HTML do corpo, Assunto, todas via editor WYSIWYG
- **Obtidos (resposta do sistema):** Nova versao persistida, preview renderizado, audit log

---
