---
uc_id: UC-CT06
nome: "Saldo de ARP / Controle de Carona"
sprint: "Sprint 5"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT5 V5.md"
linha_inicio_no_doc: 656
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-CT06 — Saldo de ARP / Controle de Carona

> Caso de uso extraído automaticamente de `docs/CASOS DE USO SPRINT5 V5.md` (linha 656).
> Sprint origem: **Sprint 5**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-182, RN-183, RN-184, RN-185, RN-201

**RF relacionado:** NOVO (Art. 82-86, Lei 14.133/2021)
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Ao menos uma ata salva (UC-AT01/AT03)
3. Dados de itens da ARP extraidos com quantidades

### Pos-condicoes
1. Saldo por item da ARP exibido com barras de consumo
2. Limites legais de carona calculados e monitorados
3. Solicitacoes de carona registradas com status

### Sequencia de Eventos

1. Usuario clica na [Aba: "Saldo ARP"] da AtasPage (4a aba)
2. Seleciona ARP em [Select: "Selecione uma Ata"] — carrega dados da ata selecionada
3. [Card: "Saldos por Item"] exibe [Tabela: saldos] com: Item, Qtd Registrada, Consumo Part., Consumo Carona, Saldo, % Consumido
4. [Coluna: "% Consumido"] exibe [Progresso: ProgressBar] com cor dinamica:
   - Verde (#16a34a): pct < 70%
   - Amarelo (#eab308): 70% <= pct < 90%
   - Vermelho (#dc2626): pct >= 90%
5. Na coluna Acao: [Botao: "Carona"] (size sm) — abre modal de solicitacao
6. [Card: "Solicitacoes de Carona"] exibe tabela de caronas com colunas: Orgao, Quantidade, Status, Data
7. [Coluna: "Status"] exibe badges: Aprovada (verde), Recusada (vermelho), Pendente (amarelo)
8. Usuario clica [Botao: "Carona"] — [Modal: "Nova Solicitacao de Carona"] abre
9. Preenche: [TextInput: "Orgao Solicitante"], [TextInput: "CNPJ"], [TextInput: "Quantidade"], [TextArea: "Justificativa"]
10. Clica [Botao: "Solicitar"] — solicitacao registrada
11. [Botao: "Cancelar"] fecha modal sem salvar

### Fluxos Alternativos (V5)

- **FA-01 — ARP sem solicitacoes de carona:** No passo 6, tabela "Solicitacoes de Carona" esta vazia. Card exibe mensagem "Nenhuma solicitacao de carona registrada para esta ARP."
- **FA-02 — Item com saldo 100% consumido:** No passo 4, ProgressBar esta 100% vermelha. Botao "Carona" continua disponivel mas sistema pode exibir aviso "Saldo esgotado para este item" ao tentar solicitar.
- **FA-03 — Solicitacao de carona com quantidade menor que o minimo do item:** Usuario informa quantidade inferior ao lote minimo. Sistema aceita mas exibe aviso informativo sobre lote minimo recomendado.

### Fluxos de Excecao (V5)

- **FE-01 — Nenhuma ARP salva:** No passo 2, select "Selecione uma Ata" nao tem opcoes. Mensagem "Nenhuma ata salva. Busque e salve atas na aba 'Buscar'." e exibida.
- **FE-02 — Saldo ARP insuficiente para carona (Art. 82-86):** Quantidade solicitada no passo 9 excede saldo disponivel do item. Sistema exibe alerta "Quantidade excede saldo disponivel ({saldo} unidades). Limite legal de carona atingido." Modal permanece aberto.
- **FE-03 — CNPJ invalido no modal de carona:** CNPJ informado no passo 9 nao passa validacao de formato. Sistema exibe erro inline "CNPJ invalido. Use formato 00.000.000/0001-00."
- **FE-04 — Erro ao salvar solicitacao de carona:** Requisicao POST falha. Toast de erro exibido. Modal permanece aberto com dados preservados.

### Tela(s) Representativa(s)

**Pagina:** AtasPage (`/app/atas`)
**Posicao:** Aba "Saldo ARP" (4a aba)

#### Layout da Tela

```
[Aba: "Buscar"] [Aba: "Extrair"] [Aba: "Minhas Atas"] [Aba: "Saldo ARP"]

[Select: "Selecione uma Ata"] [ref: Passo 2]
  opcao padrao: "Selecione..."
  opcoes dinamicas: minhasAtas

[Card: "Saldos por Item"] [ref: Passos 3, 4, 5]
  [Tabela: saldos] (DataTable)
    [Coluna: "Item"] (key: item_descricao)
    [Coluna: "Qtd Registrada"] (key: quantidade_registrada)
    [Coluna: "Consumo Part."] (key: consumido_participante)
    [Coluna: "Consumo Carona"] (key: consumido_carona)
    [Coluna: "Saldo"] (key: saldo_disponivel)
    [Coluna: "% Consumido"] — render customizado [ref: Passo 4]
      [Progresso: ProgressBar] (width: 80px, height: 8px)
        [Indicador: cor verde] — pct < 70
        [Indicador: cor amarelo] — 70 <= pct < 90
        [Indicador: cor vermelho] — pct >= 90
      [Texto: "{pct}%"]
    [Coluna: "Acao"]
      [Botao: "Carona"] (size: sm) [ref: Passo 5]

[Card: "Solicitacoes de Carona"] [ref: Passos 6, 7]
  [Tabela: caronas] — HTML customizada
    [Coluna: "Orgao"]
    [Coluna: "Quantidade"] — alinhado a direita
    [Coluna: "Status"] — centralizado [ref: Passo 7]
      [Badge: "Aprovada"] (background: #dcfce7, color: #166534)
      [Badge: "Recusada"] (background: #fee2e2, color: #991b1b)
      [Badge: "Pendente"] (background: #fef3c7, color: #92400e)
    [Coluna: "Data"]

[Modal: "Nova Solicitacao de Carona — {item_descricao}"] [ref: Passos 8-11]
  [TextInput: "Orgao Solicitante"] — placeholder "Nome do orgao" [ref: Passo 9]
  [TextInput: "CNPJ"] — placeholder "00.000.000/0001-00" [ref: Passo 9]
  [TextInput: "Quantidade"] — placeholder "0" [ref: Passo 9]
  [TextArea: "Justificativa"] — placeholder "Justificativa da adesao..." [ref: Passo 9]
  [Botao: "Cancelar"] (variant: secondary) [ref: Passo 11]
  [Botao: "Solicitar"] [ref: Passo 10]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Aba: "Saldo ARP"] | 1 |
| [Select: "Selecione uma Ata"] | 2 |
| [Card: "Saldos por Item"] | 3 |
| [Tabela: saldos] | 3 |
| [Coluna: "% Consumido"] / ProgressBar | 4 |
| [Botao: "Carona"] | 5 |
| [Card: "Solicitacoes de Carona"] | 6 |
| [Coluna: "Status"] / badges | 7 |
| [Modal: "Nova Solicitacao de Carona"] | 8 |
| campos do modal | 9 |
| [Botao: "Solicitar"] | 10 |
| [Botao: "Cancelar"] | 11 |

### Implementacao Atual
**Implementado**

---

# FASE 3 — EXECUCAO DE CONTRATOS

---
