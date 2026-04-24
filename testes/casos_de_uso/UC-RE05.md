---
uc_id: UC-RE05
nome: "Gerar Laudo de Contra-Razao"
sprint: "Sprint 4 (Recursos e Impugnações)"
versao_uc: "5.0"
doc_origem: "CASOS DE USO RECURSOS E IMPUGNACOES V5.md"
linha_inicio_no_doc: 1315
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-RE05 — Gerar Laudo de Contra-Razao

> Caso de uso extraído automaticamente de `docs/CASOS DE USO RECURSOS E IMPUGNACOES V5.md` (linha 1315).
> Sprint origem: **Sprint 4 (Recursos e Impugnações)**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RF relacionado:** RF-044-05

**Regras de Negocio aplicaveis:**
- Presentes: RN-146, RN-148, RN-149, RN-153
- Faltantes: RN-156 [FALTANTE], RN-157 [FALTANTE], RN-160 [FALTANTE], RN-162 [FALTANTE], RN-163 [FALTANTE], RN-164 [FALTANTE], RN-212 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-146, RN-148, RN-149, RN-153, RN-156 [FALTANTE->V4], RN-157 [FALTANTE->V4], RN-160 [FALTANTE->V4], RN-162 [FALTANTE->V4], RN-163 [FALTANTE->V4], RN-164 [FALTANTE->V4], RN-212 [FALTANTE->V4]

**Ator:** Usuario + Agente IA

### Pre-condicoes
1. Recurso de outra empresa identificado contra a proposta do usuario
2. Documento de recurso disponivel (PDF/DOCX) ou informacoes sobre os fundamentos
3. Proposta do usuario e edital completo disponiveis
4. Base de legislacao e jurisprudencias carregada

### Pos-condicoes
1. Laudo de contra-razao gerado com secao de defesa e secao de ataque
2. Defesa: refuta os argumentos do recurso contra a proposta do usuario
3. Ataque: questiona a proposta da empresa recorrente
4. Documento em status "rascunho", 100% editavel
5. LOG de criacao e edicoes registrado

### Sequencia de Eventos

1. Usuario acessa RecursosPage e clica na [Aba: "Laudos"]
2. Clica [Botao: "Novo Laudo"] (icone Plus, variant primary) — Modal "Novo Laudo" abre
3. Preenche [Select: "Edital"], [Select: "Tipo"] = "Contra-Razao", [Select: "Subtipo"]
4. Preenche [TextInput: "Empresa Alvo"] com nome da empresa que interpos o recurso
5. Opcionalmente seleciona [Select: "Template"] e preenche [TextArea: "Conteudo Inicial"]
6. Clica [Botao: "Criar"] — laudo do tipo "Contra-Razao" criado com status "Rascunho"
7. Laudo aparece na [Tabela: Laudos]; usuario clica [Icone-Acao: Eye] para abrir editor
8. [Card: "Editando: {edital} - Contra-Razao ({subtipo})"] exibe editor com conteudo
9. [TextArea] exibe texto do laudo — usuario edita incluindo obrigatoriamente: SECAO DEFESA e SECAO ATAQUE
10. Sistema exibe hint com secoes obrigatorias: `## DEFESA, ## ATAQUE`
11. Usuario salva com [Botao: "Salvar Rascunho"] ou avanca para submissao com [Botao: "Submeter no Portal"]
12. Opcionalmente exporta via [Botao: "PDF"] ou [Botao: "DOCX"]

> Nota: O fluxo de tela e identico ao UC-RE04 — a diferenca e o valor selecionado em [Select: "Tipo"] = "Contra-Razao" e as secoes obrigatorias distintas (DEFESA + ATAQUE ao inves de JURIDICA + TECNICA). Ver layout completo em UC-RE04.

### Fluxos Alternativos (V5)

**FA-01 — Contra-razao com apenas secao de defesa (sem ataque)**
1. Usuario edita o laudo incluindo apenas "## DEFESA"
2. Nao inclui "## ATAQUE" (decide nao atacar a proposta do recorrente)
3. Sistema aceita — secao ATAQUE e recomendada mas nao obrigatoria
4. Aviso: "Recomendamos incluir secao de ATAQUE para fortalecer a contra-razao."

**FA-02 — Criar contra-razao sem conhecer os argumentos completos do recurso**
1. Usuario nao tem acesso ao texto completo do recurso interposto
2. Preenche [TextArea: "Conteudo Inicial"] com resumo dos pontos que conhece
3. Laudo criado com informacao parcial
4. Usuario podera editar e complementar quando obtiver o documento de recurso completo

**FA-03 — Exportar contra-razao em DOCX para revisao externa (advogado)**
1. Usuario exporta via [Botao: "DOCX"]
2. Envia arquivo DOCX para advogado externo revisar
3. Advogado devolve arquivo revisado
4. Usuario faz upload da versao revisada via UC-I04 (Upload de Peticao Externa)

### Fluxos de Excecao (V5)

**FE-01 — Empresa alvo nao informada**
1. Usuario deixa [TextInput: "Empresa Alvo"] vazio no modal
2. Clica [Botao: "Criar"]
3. Validacao: "Informe o nome da empresa que interpos o recurso (Empresa Alvo)."
4. Modal nao fecha (para contra-razao, empresa alvo e obrigatoria — diferente de recurso)

**FE-02 — Prazo de contra-razao expirado**
1. Usuario tenta submeter contra-razao apos prazo de 3 dias uteis (Art. 165 Lei 14.133/2021)
2. Ao clicar [Botao: "Submeter no Portal"], validacao pre-envio detecta prazo expirado
3. Checkbox "Prazo de submissao valido" aparece desmarcado
4. Mensagem: "Prazo de contra-razao expirado. Submissao nao e recomendada."

**FE-03 — Erro na exportacao DOCX**
1. Usuario clica [Botao: "DOCX"]
2. Erro na geracao do arquivo DOCX
3. Mensagem: "Erro ao exportar DOCX. Tente exportar em PDF."

### Tela(s) Representativa(s)

**Pagina:** RecursosPage (`/app/recursos`)
**Posicao:** Aba "Laudos" (3a aba) — idem UC-RE04, tipo "Contra-Razao"

#### Layout da Tela

```
[Aba: "Laudos" (badge: N)]

[Card: "Laudos de Recurso e Contra-Razao"] (icone FileText)
  [Botao: "Novo Laudo"] (icone Plus, variant primary) [ref: Passo 2]

  [Tabela: Laudos]
    [Coluna: "Tipo"] — "Contra-Razao" [ref: Passo 3]
    [Coluna: "Empresa Alvo"] — empresa recorrente [ref: Passo 4]
    [Coluna: "Status"]
      [Badge: "Rascunho"] (neutral)
      [Badge: "Revisao"] (warning)
      [Badge: "Protocolado"] (info)

[Card: "Editando: {edital} - Contra-Razao ({subtipo})"] (icone Edit3) [ref: Passo 8]
  [Alerta: "Secoes obrigatorias: ## SECAO JURIDICA, ## SECAO TECNICA | Adicionais: ## DEFESA, ## ATAQUE"] [ref: Passos 9, 10]
  [TextArea] — editor, rows 20 [ref: Passos 9, 11]
  [Botao: "Salvar Rascunho"] (icone Save) [ref: Passo 11]
  [Botao: "Enviar para Revisao"] (icone Send, variant primary)
  [Botao: "Submeter no Portal"] (icone ExternalLink, variant primary) [ref: Passo 11]
  [Botao: "PDF"] (icone Download) [ref: Passo 12]
  [Botao: "DOCX"] (icone Download) [ref: Passo 12]

[Modal: "Novo Laudo"] [ref: Passos 3-6]
  [Select: "Tipo"] = "Contra-Razao" [ref: Passo 3]
  [TextInput: "Empresa Alvo"] — empresa que interpos o recurso [ref: Passo 4]
  [Botao: "Criar"] (variant primary) [ref: Passo 6]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Laudos"] | 1 |
| [Botao: "Novo Laudo"] | 2 |
| [Select: "Tipo"] = "Contra-Razao" | 3 |
| [Select: "Subtipo"] | 3 |
| [TextInput: "Empresa Alvo"] | 4 |
| [Select: "Template"] / [TextArea: "Conteudo Inicial"] | 5 |
| [Botao: "Criar"] | 6 |
| [Tabela: Laudos] / [Icone-Acao: Eye] | 7 |
| [Card: "Editando: ... Contra-Razao"] | 8 |
| [TextArea] editor | 9 |
| [Alerta: secoes obrigatorias DEFESA/ATAQUE] | 10 |
| [Botao: "Salvar Rascunho"] / [Botao: "Submeter no Portal"] | 11 |
| [Botao: "PDF"] / [Botao: "DOCX"] | 12 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---
