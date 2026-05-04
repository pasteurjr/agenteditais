---
uc_id: UC-LA03
nome: "Sala Virtual de Disputa (EXPANSAO — LancesPage)"
sprint: "Sprint 9"
versao_uc: "5.0"
doc_origem: "CASOS DE USO SPRINT9.md"
linha_inicio_no_doc: 390
split_gerado_em: "2026-05-04T03:45:25"
---

# UC-LA03 — Sala Virtual de Disputa (EXPANSAO — LancesPage)

> Caso de uso extraido de `docs/CASOS DE USO SPRINT9.md` (linha 390).
> Sprint origem: **Sprint 9**.

---

**Tipo:** EXPANSAO da pagina existente `LancesPage.tsx`
**UCs estendidos:** Nenhum UC anterior direto — LancesPage existente so exibia listagem. Este UC ADICIONA o componente de sala virtual de operacao em tempo real.
**O que JA EXISTE:** LancesPage com lista de pregoes de hoje (aguardando/em_andamento/encerrado), historico de lances (vitoria/derrota), taxa de sucesso. Endpoints: `GET /api/lances/hoje`, `GET /api/lances/historico`. Arquivo: `frontend/src/pages/LancesPage.tsx`.

**RNs aplicadas:** RN-099, RN-100, RN-037 (audit), RN-NEW-12 (flag AUTO_BID), RN-NEW-13 (max 20 lances auto)

**RF relacionado:** RF-042-01 (Sala Virtual de Disputa)
**Ator:** Usuario (Operador de Lances)

### Pre-condicoes
1. Usuario autenticado com permissao de operacao de lances
2. Pregao com status `em_andamento` detectado (via UC-LA05 ou manual)
3. Edital vinculado ao pregao possui itens com Camadas D/E configuradas
4. Perfil competitivo definido (UC-P08, Sprint 3)

### Pos-condicoes
1. Sala virtual ativa com timer, historico, sugestao IA
2. Lances enviados registrados no modelo Lance com status=enviado
3. Resultado da sessao (vitoria/derrota) registrado
4. Audit log de cada lance enviado (RN-037)

### Sequencia de Eventos

1. Usuario acessa LancesPage (`/app/lances`)
2. Na secao "Pregoes Hoje" (JA EXISTE), identifica pregao com status `em_andamento`
3. **NOVO:** [Botao: "Entrar na Sala"] visivel apenas para pregoes em_andamento
4. Ao clicar, sistema abre [Componente: "Sala Virtual de Disputa"] que substitui a listagem
5. [Cabecalho da Sala] exibe dados do edital + valores carregados das Camadas (Sprint 3):
   - Edital: numero + orgao + objeto (resumido)
   - Item: descricao + NCM + quantidade
   - Custo Base (Camada A): R$ XXX — `PrecoCamada.custo_base_final` (alarme de prejuizo)
   - Lance Inicial (Camada D): R$ XXX — `PrecoCamada.lance_inicial` (valor de entrada)
   - Lance Minimo (Camada E): R$ XXX — `PrecoCamada.lance_minimo` (piso, freio do robo)
   - Margem Minima: XX.X% — `PrecoCamada.margem_minima` = (E - A) / A * 100
   - Perfil: [Badge: "quero_ganhar" azul] ou [Badge: "nao_ganhei_minimo" amarelo] — `EstrategiaEdital.perfil_competitivo`
   - Faixa de Disputa: R$ [lance_minimo] — R$ [lance_inicial] — lida de `tool_estruturar_lances` resultado
6. [Card: "Timer"] exibe cronometro regressivo:
   - Lance Aberto: 2:00 minutos, reinicia a cada novo lance (Art. 56, Lei 14.133)
   - Lance Fechado: 5:00 minutos (contagem unica)
   - Cores: verde (> 1min), amarelo (30s-1min), vermelho piscante (< 30s)
7. [Card: "Historico de Lances da Sessao"] — DataTable atualizado via polling (5s):
   - Colunas: Rodada | Empresa | Valor (R$) | Hora | Posicao
   - Nossos lances destacados em azul
   - Lance lider destacado em verde
   - Lance abaixo do custo destacado em vermelho
8. [Card: "Posicao Atual"] exibe:
   - Posicao: 1o / 2o / 3o / etc.
   - Valor do nosso ultimo lance
   - Distancia para o lider: R$ XX (se nao somos 1o)
   - Margem sobre custo: XX.X%
   - Distancia para o lance minimo (Camada E): R$ XX
9. [Card: "Sugestao da IA"] — alimentado por UC-LA02 (tool_sugerir_lance)
10. [Card: "Envio de Lance"] exibe:
    - [NumberInput: "Valor do Lance"] pre-preenchido com sugestao da IA
    - [Label: "Margem"] atualiza em tempo real conforme valor digitado
    - [Botao: "Enviar Lance"] — envia via endpoint e registra no modelo Lance
    - [Checkbox: "Confirmar"] — obrigatorio antes de enviar (trava de seguranca)
11. Se AUTO_BID_ENABLED=true (UC-LA06): [Card: "Robo de Lances"] exibe status do envio automatico
12. [Botao: "Sair da Sala"] retorna a listagem, mantendo sessao ativa em background
13. Ao encerrar sessao (timer expira sem novos lances): sistema exibe [Modal: "Resultado da Sessao"]:
    - Resultado: VITORIA / DERROTA
    - Posicao final
    - Lance vencedor: R$ XXX (empresa vencedora)
    - Nosso lance final: R$ XXX
    - Margem final sobre custo
    - [Botao: "Ver Relatorio Completo"] — exporta CSV da sessao

### Tela(s) Representativa(s)

**Pagina:** LancesPage (`/app/lances`)
**Posicao:** Componente sala virtual (substitui listagem quando ativo)

#### Layout da Tela

```
+---------------------------------------------------------------+
|  Sala Virtual de Disputa                         [Sair da Sala]|
|                                                               |
|  Edital: PE 023/2026 — HC Univ. Campinas — Reagentes Hematol. |
|  Item 01: Kit Hemograma Completo (NCM 3822.00.90) — 5.000 un  |
|  Custo(A): R$ 340  | Inicial(D): R$ 500 | Minimo(E): R$ 380  |
|  Margem min: 11.8%  |  Faixa: R$ 380-500  |  [quero_ganhar]  |
|                                                               |
|  +--- Timer ---+  +--- Posicao Atual ---+  +--- Sugestao ---+|
|  |   01:23     |  |  Posicao: 2o        |  | R$ 412,50      ||
|  |  [AMARELO]  |  |  Nosso: R$ 420,00   |  | Margem: 18.2%  ||
|  |             |  |  Lider: R$ 415,00   |  | Pos.est.: 1o   ||
|  |             |  |  Dist.: R$ 5,00     |  | [Alta]         ||
|  |             |  |  Margem: 23.5%      |  | [Aceitar]      ||
|  |             |  |  Ate E: R$ 40,00    |  | [Ajustar]      ||
|  +-------------+  +--------------------+  +----------------+|
|                                                               |
|  +--- Historico de Lances ----------------------------------+|
|  |Rod.|Empresa         |Valor    |Hora     |Pos.|           ||
|  | 5  |Concorrente A   |R$ 415,00|14:23:15 | 1  |           ||
|  | 5  |*** NOSSA ***   |R$ 420,00|14:22:48 | 2  | [AZUL]    ||
|  | 4  |Concorrente B   |R$ 425,00|14:22:12 | 3  |           ||
|  | 4  |Concorrente A   |R$ 430,00|14:21:45 | 2  |           ||
|  | 3  |*** NOSSA ***   |R$ 435,00|14:21:10 | 1  | [AZUL]    ||
|  | ...                                                       ||
|  +-----------------------------------------------------------+|
|                                                               |
|  +--- Envio de Lance ---+  +--- Robo de Lances ---+          |
|  | Valor: [R$ 412,50]   |  | Status: [ATIVO]      |          |
|  | Margem: 18.2%        |  | Lances auto: 3/20    |          |
|  | [x] Confirmar        |  | [Pausar]             |          |
|  | [Enviar Lance]       |  +---------------------+          |
|  +-----------------------+                                    |
+---------------------------------------------------------------+
```

**Elementos acessiveis:**
- **Acessados (leitura):** Timer, Posicao Atual (5 indicadores), Historico de Lances (DataTable), Sugestao IA (card)
- **Preenchidos (input):** Valor do Lance, Checkbox Confirmar
- **Acoes:** Enviar Lance, Aceitar Sugestao, Ajustar, Ignorar, Pausar Robo, Sair da Sala

### Excecoes
- **E1:** Polling falha 3x consecutivas — banner: "Conexao com portal instavel. Insira dados manualmente."
- **E2:** Sessao encerrada enquanto sala aberta — modal de resultado exibido automaticamente
- **E3:** Timer expira — sistema bloqueia envio de lance e exibe "Tempo encerrado"

---
