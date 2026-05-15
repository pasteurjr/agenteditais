# Resposta às Observações — tutorialsprint1-3 V8

**Para:** Validador (Arnaldo / Argus)
**Data:** 15/05/2026
**Referência:** `docs/Observações tutorialsprint1-3 V8.docx` · análise técnica em `docs/ANALISE-Observações tutorialsprint1-3 V8.md`
**Tutorial atualizado:** `docs/tutorialsprint1-3 V9.md` (CHANGELOG V9 no topo)

Obrigado pelas 22 observações. Cada uma foi cruzada com o **código real** do sistema (não só o tutorial) e tratada. Resumo do veredito e do que foi feito:

| Obs | UC | Veredito | O que foi feito |
|---|---|---|---|
| 1 | F06 | ✅ Procede | Ícone de lupa virou **botão clicável** (clique/Enter/automático) |
| 2 | F06 | ✅ Procede | Busca de produtos agora **ignora acentuação** |
| 3 | F07 | ⚠️ Esclarecimento | **Não era bug.** NCM é extraído pela IA no upload; a máscara aparece ao **editar** o produto. Tutorial V9 esclarece o Passo 02 |
| 4 | F07 | ✅ Procede | Upload agora aceita **PDF, CSV, XLSX, XLS, DOCX** (antes só PDF) |
| 5 | F07 | ✅ Procede | NF/Plano de Contas com N itens → **N produtos cadastrados** (não só o primeiro); subclasse com critério mais rígido |
| 6 | F07 | ✅ Procede | **Categoria** do produto agora **editável** no modal de edição |
| 7 | F07 | ✅ Procede | Classificação de tipo de documento agora **determinística** (temperature=0) — uploads repetidos dão resultado estável |
| 8 | F07 | ✅ Procede | Mesma correção da Obs 5 — multi-item por documento |
| 9 | F09 | ⚠️ Parcial | Specs "extras" eram variação da extração, **não fonte externa**. Reduzido com extração determinística (obs 7). Origem por spec é melhoria futura |
| 10 | F09 | ✅ Procede | Reprocessar IA agora **complementa** (merge por nome) — **não apaga mais** specs existentes/manuais |
| 11 | F09 | ❌ Não procede | **Esclarecimento:** "Reprocessar IA" **nunca buscou na web** — usa só o documento/descrição do produto. Busca web é função separada (UC-F10). Confusão pelo nome |
| 12 | F09 | ✅ Procede | Card de detalhes ganhou form **"Adicionar especificação manualmente"** |
| 13 | F10 | ✅ Procede | Busca Web **não cadastra mais automaticamente** — modal com **checkbox** para o usuário escolher o que incorporar |
| 14 | F10 | ✅ Já corrigido | Buscas Web/ANVISA voltaram a trazer resultados — scraping migrado de Serper (sem créditos) para **Brave** |
| 15 | F11 | ✅ Procede | Ícone de completude na grade virou **farol colorido** (verde/amarelo/vermelho) |
| 16 | F11 | ✅ Procede | Novo **filtro por nível de completude** na barra de filtros |
| 17 | F11 | ✅ Procede | Produto sem máscara mostra **"N/A"** em Especificações (antes 100% falso) |
| 24 | F12 | ✅ Já corrigido | CATMAT/CATSER/palavras-chave **editáveis manualmente** (botão "Editar metadados") |
| 25 | F12 | ✅ Procede | Palavras-chave do CATMAT agora **ampliam** a busca (não excluem) — score de aderência classifica, usuário avalia |
| 27 | F15 | ✅ Procede | Caixinhas de UF com **fonte branca**; permite **desmarcar UF** após "todo o Brasil" |
| 28 | F15 | ✅ Procede | Campos de valor (TAM/SAM/SOM) com **máscara monetária** pt-BR |
| 30 | F16 | ✅ Procede | Desativar fonte (ComprasNet) **persiste** e a fonte desativada **não é mais consultada** na busca geral |

## Destaques

**2 observações eram esclarecimentos, não defeitos:**
- **Obs 3** — não existe campo de NCM no cadastro por upload **por design**: a IA extrai o NCM do documento. A máscara `9018.19.90` é da tela de **edição** do produto. O tutorial V8 induzia a esperar digitar NCM ali; o V9 corrige a instrução.
- **Obs 11** — o "Reprocessar IA" **nunca** consultou a web; ele só relê o documento já enviado e a descrição do produto. O que pareceu "dados de fora" é variação da extração do próprio documento (agora mais estável com a Obs 7). Buscar na web é o botão **"Buscar na Web"** (UC-F10), função distinta.

**2 já estavam corrigidas** antes desta rodada (Obs 14 Serper→Brave; Obs 24 metadados editáveis).

**Bugs graves corrigidos nesta rodada:** Obs 10 (reprocessar destruía specs), Obs 17 (completude 100% falsa), Obs 30 (desativação de fonte não persistia), Obs 4/5/8 (upload só-PDF e mono-produto).

## Próximo passo

Reexecute a validação usando o **`tutorialsprint1-3 V9.md`** — cada passo afetado está marcado com `**V9 (obs N):**` indicando exatamente o que testar e o critério de aprovação. As correções foram validadas automaticamente no ambiente de testes antes desta entrega.
