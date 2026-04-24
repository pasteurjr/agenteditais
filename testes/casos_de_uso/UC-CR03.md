---
uc_id: UC-CR03
nome: "Alertas de Vencimento Multi-tier"
sprint: "Sprint 5"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT5 V5.md"
linha_inicio_no_doc: 2002
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-CR03 — Alertas de Vencimento Multi-tier

> Caso de uso extraído automaticamente de `docs/CASOS DE USO SPRINT5 V5.md` (linha 2002).
> Sprint origem: **Sprint 5**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RNs aplicadas:** RN-185, RN-186, RN-187

**RF relacionado:** NOVO (boas praticas de gestao contratual)
**Ator:** Usuario (Analista Comercial)

### Pre-condicoes
1. Usuario autenticado no sistema
2. Contratos, ARPs e entregas cadastrados com datas de vencimento

### Pos-condicoes
1. Vencimentos proximos de todas as categorias listados consolidadamente
2. Alertas multi-tier exibidos com niveis de urgencia

### Sequencia de Eventos

1. Na ContratadoRealizadoPage, usuario localiza a [Secao: "Proximos Vencimentos"] (Card abaixo de Atrasos)
2. [Card: "Proximos Vencimentos"] (icone Calendar) exibe a secao
3. Se carregando: [Loader2 animate-spin + "Carregando alertas..."] exibidos
4. [Secao: Stat Cards — grid auto-fit] exibe contadores por urgencia: Vermelho (<7d), Laranja (7-15d), Amarelo (15-30d), Verde (>30d)
5. [Tabela: Vencimentos] exibe: Tipo (badge), Nome, Data Vencimento, Dias Restantes, Urgencia (badge)
6. [Coluna: "Tipo"] exibe badge colorido: contrato (azul), arp (roxo), entrega (laranja)
7. [Coluna: "Urgencia"] exibe badge por nivel: vermelho, laranja, amarelo, verde
8. Se sem vencimentos proximos: [Texto: "Nenhum vencimento proximo"]

### Fluxos Alternativos (V5)

- **FA-01 — Apenas vencimentos de tipo "contrato":** Tabela mostra apenas badges azuis na coluna Tipo. Stat Cards refletem apenas contratos. Funcionalidade identica.
- **FA-02 — Nenhum vencimento critico (<7d):** Stat Card "Vermelho (<7d)" exibe 0. Tabela pode ter vencimentos em outros tiers. Nenhum alerta critico.
- **FA-03 — Todos os vencimentos em mais de 30 dias:** Todos com badge verde. Apenas Stat Card "Verde (>30d)" com valor > 0. Demais zerados.

### Fluxos de Excecao (V5)

- **FE-01 — Erro ao carregar alertas:** Requisicao falha. Loader exibido ate timeout. Alerta de erro exibido. Stat Cards com "-".
- **FE-02 — Nenhum vencimento proximo:** Mensagem "Nenhum vencimento proximo" exibida (passo 8). Stat Cards todos zerados. Tabela vazia.

### Tela(s) Representativa(s)

**Pagina:** ContratadoRealizadoPage (`/app/contratado-realizado`)
**Posicao:** Secao 3 — Proximos Vencimentos (abaixo de Atrasos)

#### Layout da Tela

```
[Card: "Proximos Vencimentos"] (icone Calendar) [ref: Passo 2]

  [Loader2 animate-spin + "Carregando alertas..."] — condicional [ref: Passo 3]
  [Alerta de Erro] (icone AlertTriangle) — condicional

  [Secao: Stat Cards — grid auto-fit] [ref: Passo 4]
    [Card: "Vermelho (<7d)"] (fontSize: 26, color: #dc2626, bg: #fecaca)
    [Card: "Laranja (7-15d)"] (fontSize: 26, color: #ea580c, bg: #fed7aa)
    [Card: "Amarelo (15-30d)"] (fontSize: 26, color: #ca8a04, bg: #fef08a)
    [Card: "Verde (>30d)"] (fontSize: 26, color: #16a34a, bg: #bbf7d0)

  [Tabela: Vencimentos] (DataTable) [ref: Passos 5, 6, 7]
    [Coluna: "Tipo"] (key: tipo_entidade, render customizado) [ref: Passo 6]
      [Badge: "contrato"] (cor: #3b82f6)
      [Badge: "arp"] (cor: #8b5cf6)
      [Badge: "entrega"] (cor: #f59e0b)
    [Coluna: "Nome"] (key: nome)
    [Coluna: "Data Vencimento"] (key: data_vencimento, render: formatDate)
    [Coluna: "Dias Restantes"] (key: dias_restantes) — "{dias}d" (fontWeight: 600)
    [Coluna: "Urgencia"] (key: urgencia, render customizado) [ref: Passo 7]
      [Badge: "Vermelho"] (bg: #fecaca, text: #dc2626)
      [Badge: "Laranja"] (bg: #fed7aa, text: #ea580c)
      [Badge: "Amarelo"] (bg: #fef08a, text: #ca8a04)
      [Badge: "Verde"] (bg: #bbf7d0, text: #16a34a)

  [Texto: "Nenhum vencimento proximo"] — se vazio [ref: Passo 8]
```

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Card: "Proximos Vencimentos"] | 2 |
| [Loader2] | 3 |
| [Stat Cards: Vermelho/Laranja/Amarelo/Verde] | 4 |
| [Tabela: Vencimentos] | 5 |
| [Coluna: "Tipo"] / badges | 6 |
| [Coluna: "Urgencia"] / badges | 7 |
| [Texto: "Nenhum vencimento proximo"] | 8 |

### Implementacao Atual
**Implementado**

---

# FASE 5 — CRM DO PROCESSO *(NOVA V3)*

---
