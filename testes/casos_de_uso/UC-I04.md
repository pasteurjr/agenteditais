---
uc_id: UC-I04
nome: "Upload de Peticao Externa"
sprint: "Sprint 4 (Recursos e Impugnações)"
versao_uc: "5.0"
doc_origem: "CASOS DE USO RECURSOS E IMPUGNACOES V5.md"
linha_inicio_no_doc: 514
split_gerado_em: "2026-04-24T19:19:04"
---

# UC-I04 — Upload de Peticao Externa

> Caso de uso extraído automaticamente de `docs/CASOS DE USO RECURSOS E IMPUGNACOES V5.md` (linha 514).
> Sprint origem: **Sprint 4 (Recursos e Impugnações)**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RF relacionado:** RF-043-04

**Regras de Negocio aplicaveis:**
- Presentes: RN-140, RN-141
- Faltantes: RN-162 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-140, RN-141, RN-162 [FALTANTE->V4]

**Ator:** Usuario

### Pre-condicoes
1. Usuario esta autenticado no sistema
2. Edital esta salvo no sistema
3. Usuario possui peticao de impugnacao elaborada fora do sistema (DOCX/PDF)

### UCs predecessores

Estado satisfeito por execucao previa de:

- **UC-CV03**

Pre-requisitos nao-UC:

- `[login]` — autenticacao basica do usuario


### Pos-condicoes
1. Peticao importada no sistema com status "rascunho"
2. Documento vinculado ao edital
3. LOG de upload registrado

### Sequencia de Eventos

1. Na [Aba: "Peticoes"] da ImpugnacaoPage, usuario clica [Botao: "Upload Peticao"] (icone Upload)
2. [Modal: "Upload de Peticao"] abre
3. Usuario seleciona edital em [Select: "Edital"] dentro do modal
4. Usuario clica em [Campo: "Arquivo (.docx / .pdf)"] — abre seletor de arquivo do sistema operacional
5. Seleciona arquivo .docx, .pdf ou .doc — sistema valida formato e tamanho (limite implicito)
6. Usuario clica [Botao: "Upload"] (variant primary) no rodape do modal
7. Sistema salva documento no banco com status "rascunho", vinculado ao edital
8. Modal fecha e peticao aparece na [Tabela: Peticoes] com tipo "Impugnacao" e status "Rascunho"
9. LOG de upload registrado automaticamente

### Fluxos Alternativos (V5)

**FA-01 — Upload de arquivo DOCX ao inves de PDF**
1. Usuario seleciona arquivo .docx no Passo 4
2. Sistema aceita o formato (dentro dos formatos permitidos: .docx, .pdf, .doc)
3. Arquivo DOCX e salvo e vinculado ao edital
4. Fluxo continua normalmente a partir do Passo 6

**FA-02 — Cancelar upload apos selecionar arquivo**
1. Usuario seleciona arquivo (Passo 4-5)
2. Decide cancelar e clica [Botao: "Cancelar"] no modal
3. Modal fecha sem salvar — nenhum arquivo e enviado
4. Tabela de peticoes permanece inalterada

**FA-03 — Upload de segunda peticao externa para o mesmo edital**
1. Ja existe uma peticao externa vinculada ao edital
2. Usuario clica novamente em [Botao: "Upload Peticao"]
3. Seleciona o mesmo edital e outro arquivo
4. Sistema aceita — segunda peticao criada
5. Tabela exibe ambas as peticoes externas

### Fluxos de Excecao (V5)

**FE-01 — Formato de arquivo invalido**
1. Usuario seleciona arquivo com extensao nao suportada (ex: .txt, .xlsx, .png)
2. Sistema rejeita: mensagem "Formato nao aceito. Envie arquivo .pdf, .docx ou .doc."
3. [Campo: "Arquivo"] e limpo para nova selecao
4. [Botao: "Upload"] permanece desabilitado

**FE-02 — Arquivo excede limite de tamanho**
1. Usuario seleciona arquivo PDF com mais de 10 MB (limite do sistema)
2. Sistema rejeita: mensagem "Arquivo muito grande. Limite maximo: 10 MB."
3. [Campo: "Arquivo"] e limpo

**FE-03 — Nenhum edital selecionado no modal**
1. Usuario seleciona arquivo mas nao seleciona edital no [Select: "Edital"]
2. Clica [Botao: "Upload"]
3. Validacao: mensagem "Selecione um edital para vincular a peticao."
4. Modal nao fecha

**FE-04 — Falha no upload (erro de rede)**
1. Usuario clica [Botao: "Upload"] (Passo 6)
2. Requisicao falha por erro de rede ou backend indisponivel
3. Mensagem: "Erro ao enviar arquivo. Verifique sua conexao e tente novamente."
4. Modal permanece aberto com arquivo selecionado preservado

### Tela(s) Representativa(s)

**Pagina:** ImpugnacaoPage (`/app/impugnacao`)
**Posicao:** Aba "Peticoes" (2a aba) — Modal de Upload

#### Layout da Tela

```
[Aba: "Peticoes"] — contexto principal

[Card: "Peticoes"]
  [Botao: "Upload Peticao"] (icone Upload) [ref: Passo 1]

[Modal: "Upload de Peticao"] (disparado por [Botao: "Upload Peticao"]) [ref: Passo 2]
  [Select: "Edital"] — lista editais salvos [ref: Passo 3]
  [Campo: "Arquivo (.docx / .pdf)"] — input type file, accept: ".docx,.pdf,.doc" [ref: Passos 4, 5]
  [Botao: "Cancelar"] (variant secondary)
  [Botao: "Upload"] (variant primary) [ref: Passo 6]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Botao: "Upload Peticao"] | 1 |
| [Modal: "Upload de Peticao"] | 2 |
| [Select: "Edital"] no modal | 3 |
| [Campo: "Arquivo (.docx / .pdf)"] | 4, 5 |
| [Botao: "Upload"] | 6 |
| [Tabela: Peticoes] | 8 |

### Implementacao Atual
**✅ IMPLEMENTADO**

---
