---
uc_id: UC-AT01
nome: "Buscar Atas no PNCP"
sprint: "Sprint 5"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT5 V5.md"
linha_inicio_no_doc: 412
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-AT01 — Buscar Atas no PNCP

> Caso de uso extraído automaticamente de `docs/CASOS DE USO SPRINT5 V5.md` (linha 412).
> Sprint origem: **Sprint 5**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RF relacionado:** RF-035
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Backend `tool_buscar_atas_pncp` operacional
3. API do PNCP acessivel

### Pos-condicoes
1. Atas encontradas exibidas na tabela de resultados
2. Atas selecionadas salvas via botao "Salvar"
3. Dados disponiveis para extracao (UC-AT02)

### Sequencia de Eventos

1. Usuario acessa AtasPage (`/app/atas`) via menu lateral "Atas"
2. [Titulo: "Atas de Pregao"] exibe a pagina com 4 abas
3. Clica na [Aba: "Buscar"] (1a aba, ativa por padrao)
4. Preenche [TextInput: "Termo de busca (min. 3 caracteres)"] com o termo desejado (ex: "reagentes")
5. Opcionalmente seleciona [Select: "UF"] para filtrar por estado (opcoes: AC a TO, default "Todas")
6. Clica [Botao: "Buscar"] (icone Search) — desabilitado se termo < 3 chars
7. Durante a busca: [Botao: "Buscando..."] (loader) e tabela em carregamento
8. [Tabela: resultados de busca] exibe: Titulo, Orgao, UF, Publicacao, Acoes
9. Na coluna Acoes: [Botao: "Salvar"] (size sm) e [Botao: "Extrair"] (size sm, variant secondary)
10. Usuario clica [Botao: "Salvar"] — ata inserida em `atas_consultadas`
11. Usuario clica [Botao: "Extrair"] — navega para aba "Extrair" com ata pre-carregada (UC-AT02)

### Fluxos Alternativos (V5)

- **FA-01 — Busca sem resultados:** No passo 8, API do PNCP retorna lista vazia. Tabela exibe mensagem "Nenhuma ata encontrada para o termo '{termo}'". Usuario pode alterar o termo ou remover filtro de UF e buscar novamente.
- **FA-02 — Busca filtrada por UF:** Usuario seleciona UF especifica (passo 5) antes de buscar. Resultados retornam apenas atas daquela UF. Se nenhum resultado, aplica-se FA-01.
- **FA-03 — Salvar ata ja existente:** Usuario clica "Salvar" (passo 10) em ata que ja consta em `atas_consultadas`. Sistema exibe toast informativo "Ata ja salva anteriormente" e nao duplica o registro.

### Fluxos de Excecao (V5)

- **FE-01 — Termo de busca com menos de 3 caracteres:** No passo 6, botao "Buscar" permanece desabilitado. Nenhuma requisicao e disparada.
- **FE-02 — API do PNCP indisponivel:** Requisicao ao backend falha com erro de conexao. Sistema exibe toast de erro "Servico PNCP indisponivel. Tente novamente mais tarde." Tabela permanece vazia.
- **FE-03 — Timeout na busca:** Busca demora mais de 30 segundos. Sistema cancela a requisicao e exibe alerta "Busca expirou. Tente um termo mais especifico."

### Tela(s) Representativa(s)

**Pagina:** AtasPage (`/app/atas`)
**Posicao:** Aba "Buscar" (1a aba)

#### Layout da Tela

```
[Titulo: "Atas de Pregao"] (h2, fontSize: 22, fontWeight: 700)

[Aba: "Buscar"] [Aba: "Extrair"] [Aba: "Minhas Atas"] [Aba: "Saldo ARP"]

[Card principal — formulario de busca] [ref: Passos 4-8]
  [TextInput: "Termo de busca (min. 3 caracteres)"] [ref: Passo 4]
    placeholder: "Ex: reagentes, equipamentos..."
  [Select: "UF"] [ref: Passo 5]
    opcoes: "Todas" + AC, AL, AM, AP, BA, CE, DF, ES, GO, MA, MG, MS, MT, PA, PB, PE, PI, PR, RJ, RN, RO, RR, RS, SC, SE, SP, TO
  [Botao: "Buscar"] (icone Search) — desabilitado quando termo < 3 chars [ref: Passo 6]
  [Botao: "Buscando..."] (icone Loader2, animate-spin) — exibido durante busca [ref: Passo 7]

[Tabela: resultados de busca] [ref: Passo 8]
  [Coluna: "Titulo"] (key: titulo)
  [Coluna: "Orgao"] (key: orgao)
  [Coluna: "UF"] (key: uf)
  [Coluna: "Publicacao"] (key: data_publicacao)
  [Coluna: "Acoes"] (key: url_pncp)
    [Botao: "Salvar"] (size: sm) [ref: Passo 10]
    [Botao: "Extrair"] (size: sm, variant: secondary) [ref: Passo 11]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Buscar"] | 3 |
| [TextInput: "Termo de busca"] | 4 |
| [Select: "UF"] | 5 |
| [Botao: "Buscar"] | 6 |
| [Botao: "Buscando..."] (loader) | 7 |
| [Tabela: resultados] | 8 |
| [Botao: "Salvar"] | 10 |
| [Botao: "Extrair"] | 11 |

### Implementacao Atual
**Implementado**

---
