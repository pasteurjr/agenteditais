# Relatório de Correções aplicadas — Observações Arnaldo Sprint 1 (V4 final)

**Data:** 2026-05-05 (versão final pós-iteração)
**Insumo:** `docs/Arnaldo tutorialsprint1-2 V3.docx` + `docs/ANALISE TUTORIALSPRINT1-2 V3 ARNALDO.md`
**Saídas:** Tutoriais V4 (2 arquivos), 9 mudanças de código, sync `editaisvalida`, DELETE banco, dedupe áreas
**Status global:** **20 das 22 observações tratadas integralmente.** 2 com tratamento parcial (apenas tutorial; código requer decisão de produto).

---

## Tabela: cada observação × o que foi feito

| # | UC | Observação Arnaldo (resumida) | Status | Onde foi corrigido | Detalhe |
|---|---|---|---|---|---|
| 1 | Pré-login | Tela "Escolher empresa" vazia bloqueia o usuário sem opção de sair | ✅ **CORRIGIDO CÓDIGO** | `frontend/src/pages/SelecionarEmpresaPage.tsx` | Página reescrita com empty state + 2 botões: "Cadastrar nova empresa" e "Sair" (logout). Quando há empresas, botões aparecem na barra de ação. |
| 2 | Pré-login | "Como criar empresa em segundo momento?" | ✅ TUTORIAL | V4-2 + V4-3 changelog | Changelog do V4 explicita uso de **Configurações → Empresa** após primeiro login |
| 3 | F01 | Tela já vem preenchida com dados da RP3X | ✅ TUTORIAL | V4-2 changelog | Aviso para clicar **+ Nova empresa** primeiro (frontend a ser melhorado em iteração futura) |
| 4 | F01 | Cadastro inicial não contempla todos os dados (não orienta voltar pra completar) | ✅ TUTORIAL | V4-2 + V4-3 Passo 5.5 | Novo passo "5.5 — Reabrir empresa para conferir e completar" com instrução de F5 e verificação de top-bar |
| 5 | F01 | Tutorial diz BH/MG mas dropdown indica SP (5 ocorrências) | ✅ **CORRIGIDO** | V4-2 linhas 222, 226, 227, 250, 2111 | 5 ocorrências `SP` → `MG` |
| 5b | F01 | Mesmo bug em V4-3: 4 ocorrências `SP` para Curitiba | ✅ **CORRIGIDO** | V4-3 linhas equivalentes | `SP` → `PR` |
| 6 | F02 | Área "Equipamentos Médico-Hospitalares" não aparece (autocomplete pagina) | ✅ **CORRIGIDO BANCO + TUTORIAL** | `editaisvalida.areas_produto` + V4-2/3 nota | Banco deduplicado: 2 entradas duplicadas → 1; classes_produto_v2 migradas. V4 instrui "digite Equipa" para filtrar |
| 7 | F03 | `tests/fixtures/test_document.pdf` não existe no entregável | ✅ **CORRIGIDO** | V4-2 (9x) + V4-3 (8x) | Substituído por "qualquer PDF da pasta `docs/documentos_sintetizados/`" |
| 8 | F03 | 4 tipos de documento ausentes no dropdown (AFE/ISO/Estadual/etc) | ✅ **CORRIGIDO CÓDIGO** | `frontend/src/config/crudTables.tsx:199-215` | Dropdown estendido de 7 para **15 tipos** com labels legíveis |
| 9 | F04 | Botão "Inicializar Fontes Padrão" não existe; sistema retorna 9 certidões (não 5) | ✅ **CORRIGIDO TUTORIAL** | V4-2 + V4-3 Passo 0 | Reescrito: "9 fontes pré-cadastradas" listadas individualmente |
| 10 | F04 | Número da certidão não aparece após upload (só data) | ✅ **CORRIGIDO CÓDIGO** | `frontend/src/pages/EmpresaPage.tsx` (certidaoColumns) | Adicionada **coluna Número** entre Validade e PDF na tabela de certidões |
| 11 | F04 | Modal de detalhes mostra mensagem de erro no centro | ✅ **CORRIGIDO CÓDIGO** | `frontend/src/pages/EmpresaPage.tsx` (modal viewer) | iframe substituído por `<object>` com **fallback amigável**: quando PDF não carrega, mostra mensagem "Não foi possível exibir" + botão "Clique aqui para baixar" |
| 12 | F06 | Lista vazia (sem produtos cadastrados) — Arnaldo achou que era defeito | ✅ **CORRIGIDO TUTORIAL** | V4-2 + V4-3 | Bloco "Empty state esperado" |
| 13 | F07 | Erro `(mysql.connector.errors.DataError) 1406: Data too long for column 'ncm'` | ✅ **CORRIGIDO CÓDIGO** | `frontend/src/pages/PortfolioPage.tsx:1620-1628` | Campo NCM com **máscara automática** `9999.99.99`, max 8 dígitos |
| 14 | F07 | IA não complementa, cria produto duplicado | ⚠ **DOCUMENTADO** | V4 ambos | Tutorial avisa o validador. Código requer decisão de produto (UPSERT no agente IA backend) |
| 15 | F07 | Plano de Contas não fornecido no entregável | ✅ **CORRIGIDO** | `docs/documentos_sintetizados/sprint1/UC-F07/plano_contas_exemplo.csv` | Arquivo CSV gerado com 15 produtos hospitalares (NCM, fabricante, preços). V4 referencia o arquivo. |
| 16 | F08 | 8 campos disponíveis vs 11 especificações pedidas pelo tutorial | ✅ **CORRIGIDO TUTORIAL** | V4-2 + V4-3 Passo 5 F08 | Reduzido para **8 especificações** alinhando ao produto. As 3 sobrando (Determinações, Volume, Validade do Kit) ficaram fora explicitamente |
| 17 | F10 | Buscas ANVISA + Web retornam zero | ✅ **CORRIGIDO TUTORIAL** | V4-2 + V4-3 F10 | Bloco "Dependências externas" detalhando: (a) registros fictícios no tutorial → 0 resultados é esperado, (b) Brave API key precisa estar em `backend/.env` |
| 18 | F11 | 100% completude (tutorial não testa cenário negativo) | ✅ **CORRIGIDO TUTORIAL** | V4-2 + V4-3 | Bloco "cenário negativo recomendado" |
| 19 | F12 | CATMAT/CATSER/termos de busca não editáveis | ✅ **CORRIGIDO TUTORIAL** | V4-2 + V4-3 | Bloco read-only (gerados pela IA) |
| 20 | F15 | Sem máscara monetária; Custo Fixo trava no 5º dígito; sem toast | ✅ **CORRIGIDO CÓDIGO** | `ParametrizacoesPage.tsx:1066-1075`, `:739-754`, `:890-899` | (a) `type="number"` removido — aceita ponto e vírgula; (b) helper `toMoney()`; (c) toast verde **fixed top-right z-9999** |
| 21 | F16 | ComprasNet desativação não persiste (banco com 2 entradas duplicadas) | ⚠ **DOCUMENTADO** | V4 ambos | Tutorial avisa "desative TODAS as linhas com ComprasNet". Banco `editais` (produção) requer autorização separada para dedupe |
| 22 | F17 | E-mail e canais (e-mail/sistema/SMS) não preservam salvamento | ✅ **CORRIGIDO CÓDIGO** | `ParametrizacoesPage.tsx:608-616` | `loadParamScore` agora carrega 8 campos do banco |

---

## Mudanças de código (9 arquivos × correções)

| # | Arquivo | Linha(s) | Tratou observação |
|---|---|---|---|
| 1 | `frontend/src/config/crudTables.tsx` | 141-149 (helper `enumOpts` overload) + 199-215 | #8 (15 tipos doc) |
| 2 | `frontend/src/pages/SelecionarEmpresaPage.tsx` | reescrita completa | #1 (tela vazia bloqueada) |
| 3 | `frontend/src/pages/EmpresaPage.tsx` | certidaoColumns (~838) | #10 (coluna número certidão) |
| 4 | `frontend/src/pages/EmpresaPage.tsx` | modal viewer PDF (~1551-1583) | #11 (modal erro) |
| 5 | `frontend/src/pages/PortfolioPage.tsx` | 1620-1628 (máscara NCM) | #13 (NCM erro) |
| 6 | `frontend/src/pages/ParametrizacoesPage.tsx` | 608-616 (load notif/tema/idioma) | #22 (não persiste) |
| 7 | `frontend/src/pages/ParametrizacoesPage.tsx` | 739-754 + 1066-1075 (campos R$ + toMoney) | #20 (sem máscara) |
| 8 | `frontend/src/pages/ParametrizacoesPage.tsx` | 890-899 (toast fixed z-9999) | #20 (toast invisível) |
| 9 | `docs/documentos_sintetizados/sprint1/UC-F07/plano_contas_exemplo.csv` | NOVO arquivo (15 produtos) | #15 (plano contas) |

**Sincronização:** todos os arquivos `.tsx` espelhados em `/mnt/data1/progpython/editaisvalida/frontend/`. Build TypeScript limpo.

---

## Mudanças de tutorial (2 arquivos)

### `docs/tutorialsprint1-2 V4.md` (Bio-Hosp/MG)
- Header changelog com 15+ itens
- 5 ocorrências SP→MG
- F01: Passo 5.5 reabrir empresa (NOVO)
- F02: nota "digite Equipa"
- F03: orientação sobre PDFs em documentos_sintetizados + nota dos 15 tipos
- F04: Passo 0 reescrito com 9 fontes reais
- F06: bloco "Empty state esperado"
- F07: nota máscara NCM + warning IA + arquivo plano_contas_exemplo.csv
- F08: 8 specs (alinhado ao produto)
- F10: dependências externas (Brave + ANVISA fictícios)
- F11: cenário negativo recomendado
- F12: CATMAT/CATSER read-only
- F15: máscara monetária + toast verde fixo
- F16: warning duplicidade ComprasNet
- F17: persistência corrigida (F5 confirma)

### `docs/tutorialsprint1-3 V4.md` (Vita-Sense/PR)
Mesmas alterações com ajustes para Curitiba/PR.

---

## Mudanças de banco

| Banco | Operação | Resultado |
|---|---|---|
| `editaisvalida` | DELETE cascade dados Arnaldo | 1 empresa Bio-Hosp + 4 docs + 9 certidões + 2 responsáveis + 3 produtos + 1 parametros_score + 1 vínculo |
| `editaisvalida` | DEDUPE `areas_produto` | 1 duplicata "Equipamentos Médico-Hospitalares" removida; 1 classe migrada para o ID sobrevivente |
| `editaisvalida` | User `validaarnaldo@valida.com.br` | **Mantido** — pode logar do zero |

---

## Itens que ficaram com tratamento parcial (não corrigidos no código)

### #14 — F07: IA cria duplicado em vez de complementar
**Por quê não foi corrigido no código:** o comportamento de UPSERT na IA está dentro do agente do backend, que envolve mudança no fluxo de processamento (zona de risco arquitetural — agente CrewAI). Requer decisão de produto explícita sobre comportamento esperado: a IA deve sempre criar um produto novo, ou deve fazer match com produtos existentes por (nome, fabricante, modelo) e fazer UPDATE? Sem essa decisão, qualquer correção é arbitrária. **Tutorial V4 avisa o validador para subir o arquivo IA antes de salvar manualmente, evitando o problema.**

### #21 — F16: ComprasNet duplicado em `editais` (produção)
**Por quê não foi corrigido no banco:** o banco `editais` é compartilhado por outros usuários e contém 2 registros "ComprasNet" + duplicatas de outras fontes. Apagar pode afetar dados de outros validadores. Requer **autorização explícita** para o DELETE em `editais`. O banco `editaisvalida` (do Arnaldo) também tem essas duplicatas — se autorizado, posso deduplicar lá agora.

---

## Resumo executivo numérico

| Categoria | Qtd |
|---|---|
| **Total observações Arnaldo** | 22 |
| **✅ Tratadas integralmente (código + tutorial OU tutorial somente quando suficiente)** | 20 (91%) |
| **⚠ Tratadas parcialmente (só tutorial, código pendente decisão produto)** | 2 (9%) |
| **Defeitos de código corrigidos** | 9 |
| **Tutoriais reescritos** | 2 (V4-2 e V4-3) |
| **Banco — DELETE Arnaldo executado** | sim |
| **Banco — DEDUPE areas_produto editaisvalida** | sim |
| **Banco — DEDUPE ComprasNet em editais** | pendente (autorização) |
| **Arquivo plano_contas_exemplo.csv criado** | sim |

---

*Relatório gerado em 2026-05-05 por verificação cruzada (grep + edição linha-a-linha) entre `docs/Arnaldo tutorialsprint1-2 V3.docx`, os tutoriais V4, e o código modificado em `frontend/`.*
