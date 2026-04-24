---
uc_id: UC-CRM06
nome: "Registrar Decisao de Nao-Participacao *(NOVO V3)*"
sprint: "Sprint 5"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT5 V5.md"
linha_inicio_no_doc: 2720
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-CRM06 — Registrar Decisao de Nao-Participacao *(NOVO V3)*

> Caso de uso extraído automaticamente de `docs/CASOS DE USO SPRINT5 V5.md` (linha 2720).
> Sprint origem: **Sprint 5**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-192, RN-193

**RF relacionado:** RF-045-01
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Edital em etapa "Em Analise" no pipeline do CRM (UC-CRM01)
3. Decisao de nao participar tomada pela equipe comercial

### Pos-condicoes
1. Motivos da nao-participacao registrados com log do usuario
2. Edital movido para "Monitoramento da Concorrencia" ou removido do pipeline ativo
3. Registro disponivel como insumo para analise de aprendizado futuro
4. KPIs de "Nao Participados / Analisados" atualizados

### Sequencia de Eventos

1. Na CRMPage, usuario expande o [Card: "Em Analise"] no pipeline
2. [Tabela: Editais em Analise] exibe editais com coluna de Acao
3. Usuario clica [Botao: "Declinar"] (variant: secondary, icone XCircle) no edital desejado
4. [Modal: "Registrar Decisao de Nao-Participacao — {numero}"] abre
5. [Select: "Motivo Principal"] — opcoes dinamicas dos Motivos de Derrota parametrizados (UC-CRM02):
   Administrativo, Exclusivo para ME/EPP, Falha operacional, Nao tem documento, Nao atende especificacao, Inviavel comercialmente, Nao tem equipamento, Outro
6. [TextArea: "Detalhamento dos motivos"] — campo obrigatorio, minimo 20 caracteres
7. [Checkbox: "Manter em Monitoramento da Concorrencia"] — se marcado, edital vai para card "Monitoramento" em vez de ser removido
8. [Texto: "Registrado por: {nome_usuario} em {data_hora}"] — exibido automaticamente (log do usuario)
9. Clica [Botao: "Confirmar Declinio"] (variant: primary)
10. Modal fecha; edital move para "Monitoramento da Concorrencia" ou sai do pipeline
11. [Toast: "Decisao registrada com sucesso"] exibido
12. [Botao: "Cancelar"] fecha modal sem salvar

### Fluxos Alternativos (V5)

- **FA-01 — Declinio sem manter em monitoramento:** Checkbox "Manter em Monitoramento" desmarcado (passo 7). Edital e removido do pipeline ativo. Nao aparece em nenhum card.
- **FA-02 — Declinio com motivo "Outro":** Usuario seleciona "Outro" no select (passo 5). Campo de detalhamento (passo 6) torna-se ainda mais importante para documentar o motivo especifico.
- **FA-03 — Edital sem oportunidade no CRM:** Edital aparece em "Em Analise" mas equipe decide nao participar por falta de oportunidade comercial. Fluxo de declinio e identico.

### Fluxos de Excecao (V5)

- **FE-01 — Detalhamento com menos de 20 caracteres:** No passo 9, validacao impede confirmacao. Sistema exibe erro "Detalhamento deve ter no minimo 20 caracteres."
- **FE-02 — Motivo nao selecionado:** Sistema exibe erro "Selecione o motivo principal da nao-participacao."
- **FE-03 — Erro ao registrar decisao:** Requisicao POST falha. Toast de erro exibido. Modal permanece aberto com dados preservados.
- **FE-04 — Edital ja movido por outro usuario:** Concurrent edit — edital ja saiu de "Em Analise". Backend retorna conflito. Sistema exibe alerta "Edital nao esta mais em analise. Atualize o pipeline."

### Tela(s) Representativa(s)

**Pagina:** CRMPage (`/app/crm`)
**Posicao:** Card "Em Analise" > Modal

#### Layout da Tela

```
[Card Expandido: "Em Analise"] [ref: Passo 1]
  [Tabela: Editais em Analise] [ref: Passo 2]
    [Coluna: "Numero"]
    [Coluna: "Orgao"]
    [Coluna: "Objeto"] — truncado
    [Coluna: "Valor Estimado"] (render: formatCurrency)
    [Coluna: "Acao"]
      [Botao: "Participar"] (size: sm, variant: primary)
      [Botao: "Declinar"] (size: sm, variant: secondary, icone XCircle) [ref: Passo 3]

[Modal: "Registrar Decisao de Nao-Participacao — {numero}"] [ref: Passos 4-12]
  [Select: "Motivo Principal"] [ref: Passo 5]
    opcoes dinamicas: motivos parametrizados
  [TextArea: "Detalhamento dos motivos"] — obrigatorio, min 20 chars [ref: Passo 6]
    placeholder: "Descreva os motivos detalhados da decisao de nao participar..."
  [Checkbox: "Manter em Monitoramento da Concorrencia"] [ref: Passo 7]
  [Texto: "Registrado por: {nome_usuario} em {data_hora}"] (color: #6b7280, fontSize: 12) [ref: Passo 8]
  [Botao: "Cancelar"] (variant: secondary) [ref: Passo 12]
  [Botao: "Confirmar Declinio"] (variant: primary) [ref: Passo 9]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Card Expandido: "Em Analise"] | 1 |
| [Tabela: Editais em Analise] | 2 |
| [Botao: "Declinar"] | 3 |
| [Modal: "Registrar Decisao de Nao-Participacao"] | 4 |
| [Select: "Motivo Principal"] | 5 |
| [TextArea: "Detalhamento dos motivos"] | 6 |
| [Checkbox: "Manter em Monitoramento"] | 7 |
| [Texto: log do usuario] | 8 |
| [Botao: "Confirmar Declinio"] | 9 |
| [Toast: confirmacao] | 11 |
| [Botao: "Cancelar"] | 12 |

### Implementacao Atual
**Nao Implementado**

---
