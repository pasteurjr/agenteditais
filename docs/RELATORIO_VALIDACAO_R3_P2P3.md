# Relatório de Validação — Rodada 3 — Páginas 2 e 3

**Data:** 2026-02-22
**Executor:** Agente Tester Automatizado (Playwright/Chromium headless)
**Ambiente:** Backend http://localhost:5007 | Frontend http://localhost:5175
**Spec:** `tests/validacao_r3_p2p3.spec.ts`
**Screenshots:** `tests/results/validacao_r3/`

---

## Resumo Executivo

| Métrica | Valor |
|---------|-------|
| Total de testes | 10 |
| Aprovados | **10** |
| Reprovados | **0** |
| Tempo total | ~1.7min |
| Bugs encontrados | **0 novos** |

**Resultado geral: TODAS AS VERIFICAÇÕES PASSARAM**

---

## Resultados Detalhados — Página 2 (Empresa)

| Req | Teste | Status | Tempo | Observações |
|-----|-------|--------|-------|-------------|
| 2.1 | Cadastro Empresa — preencher, salvar, verificar persistência | PASS | 18.4s | Dados preenchidos (Razão Social, CNPJ, Nome Fantasia, Cidade, UF), salvos via API, e persistem após reload |
| 2.2 | Upload Documentos — upload real de PDF | PASS | 14.0s | Upload de `teste_upload2.pdf` (92KB) como "Contrato Social" via FormData+fetch. Documento aparece na tabela. API confirma `path_arquivo` preenchido em disco |
| 2.3 | Certidões Automáticas — card e badges | PASS | 6.6s | Card "Certidões Automáticas" visível com subtítulo correto. Botão "Buscar Certidões (Em breve)" presente e desabilitado |
| 2.4 | Responsáveis CRUD — criar e verificar na tabela | PASS | 11.0s | Modal "Adicionar Responsável" abre corretamente. Campos preenchidos (Nome, Cargo, Email, Telefone). Responsável aparece na tabela após salvar. API confirma registro criado |

### Bug B1 (Upload de Documentos) — VERIFICADO CORRIGIDO
- O upload agora usa `FormData` + `fetch` para `/api/empresa-documentos/upload`
- O arquivo é salvo no disco com path: `/uploads/empresa/{id}/contrato_social/{hash}_teste_upload2.pdf`
- Registro criado no banco com `nome_arquivo`, `path_arquivo`, `tipo` corretos
- O documento aparece na tabela de documentos da empresa

### Bug B2 (Modal CSS) — VERIFICADO CORRIGIDO
- Modais de Upload de Documento e Adicionar Responsável abrem e fecham corretamente
- Não há problemas visuais nos modais

---

## Resultados Detalhados — Página 3 (Portfolio)

| Req | Teste | Status | Tempo | Observações |
|-----|-------|--------|-------|-------------|
| 3.1 | Fontes Upload — 6 cards, botões ANVISA e Busca Web | PASS | 8.8s | Aba "Uploads" com exatamente 6 cards: Manuais, Instruções de Uso, NFS, Plano de Contas, Folders, Website de Consultas. Botões "Buscar ANVISA" e "Buscar na Web" visíveis no header |
| 3.2 | Registros ANVISA — modal e busca | PASS | 9.4s | Modal "Registros de Produtos pela ANVISA" abre. Campos "Número de Registro ANVISA" e "Nome do Produto" presentes. Preenchido com "hemoglobina glicada". Botão "Buscar via IA" habilitado |
| 3.2b | Busca Web — modal e campos | PASS | 9.3s | Modal "Buscar Produto na Web" abre corretamente. Campos "Nome do Produto" (required) e "Fabricante" (opcional) presentes |
| 3.3 | Cadastro Manual — nome, classe (ID enum), fabricante, modelo | PASS | 9.4s | Aba "Cadastro Manual" funcional. Formulário preenchido: Nome="Analisador Bioquímico XYZ-500", Classe="equipamento" (ID, não label), Fabricante="Shimadzu", Modelo="CL-500i". Seção de Especificações Técnicas aparece ao selecionar classe. Botão "Cadastrar via IA" habilitado. **Confirmado que Categoria envia ID do enum** |
| 3.4 | IA Lê Manuais — tabela, completude, ações | PASS | 7.7s | Tabela com colunas: Produto, Fabricante, Modelo, Classe, NCM, Completude, Ações. Produtos exibidos com barras de completude (ScoreBar). Botões de ação (Visualizar, Reprocessar, Verificar Completude, Excluir) presentes |
| 3.5 | Classificação/Agrupamento — árvore de classes | PASS | 9.2s | 4 classes na árvore: Equipamentos, Reagentes, Insumos Hospitalares, Informática. Expandir "Equipamentos" mostra subclasses (Laboratório, Hospitalar, Imagem e Diagnóstico). Badges NCM visíveis. Card "Agente de Monitoramento" com funil e badge "Agente Ativo" |

---

## Screenshots Gerados

| Arquivo | Descrição |
|---------|-----------|
| `2.1_empresa_inicial.png` | Estado inicial da página Empresa |
| `2.1_empresa_preenchida.png` | Formulário preenchido com dados de teste |
| `2.1_empresa_salva.png` | Após clicar Salvar |
| `2.1_empresa_persistencia.png` | Após reload — dados persistem |
| `2.2_modal_upload_aberto.png` | Modal de upload de documento |
| `2.2_upload_formulario_preenchido.png` | Tipo selecionado e arquivo escolhido |
| `2.2_upload_enviado.png` | Após enviar documento |
| `2.2_documento_na_tabela.png` | Documento aparece na tabela |
| `2.2_verificacao_final.png` | Verificação final do upload |
| `2.3_certidoes_automaticas.png` | Card de certidões automáticas |
| `2.4_modal_responsavel.png` | Modal de adicionar responsável |
| `2.4_responsavel_preenchido.png` | Formulário de responsável preenchido |
| `2.4_responsavel_criado.png` | Responsável na tabela |
| `2.4_responsavel_api_verificado.png` | Verificação via API |
| `3.1_portfolio_inicial.png` | Página Portfolio inicial |
| `3.1_uploads_tab.png` | Aba Uploads |
| `3.1_uploads_6cards.png` | 6 cards de upload visíveis |
| `3.2_modal_anvisa.png` | Modal ANVISA aberto |
| `3.2_anvisa_preenchido.png` | Busca "hemoglobina glicada" |
| `3.2_anvisa_modal_fechado.png` | Modal fechado |
| `3.2b_modal_busca_web.png` | Modal Busca Web |
| `3.2b_busca_web_fechado.png` | Modal Busca Web fechado |
| `3.3_cadastro_manual_tab.png` | Aba Cadastro Manual |
| `3.3_classe_selecionada.png` | Classe "Equipamentos" selecionada + specs |
| `3.3_cadastro_preenchido.png` | Formulário completo |
| `3.3_verificacao_classe_id.png` | Confirmação de ID da classe |
| `3.4_tabela_produtos.png` | Tabela de produtos |
| `3.4_produtos_com_dados.png` | Produtos com dados e completude |
| `3.5_classificacao_tab.png` | Aba Classificação |
| `3.5_classificacao_expandida.png` | Árvore expandida |
| `3.5_classificacao_funil.png` | Card funil de monitoramento |

---

## Bugs Encontrados na Rodada 3

**Nenhum bug novo encontrado.**

Os 2 bugs corrigidos da Rodada 2 foram verificados com sucesso:
- **B1 (Upload Documentos)**: Corrigido — upload real via FormData funciona
- **B2 (Modal CSS)**: Corrigido — modais renderizam corretamente

---

## Conclusão

Todas as 10 verificações das Páginas 2 (Empresa) e 3 (Portfolio) passaram na Rodada 3. Os bugs B1 e B2 reportados na Rodada 2 foram confirmados como corrigidos. As funcionalidades testadas incluem CRUD completo de empresa, upload real de documentos PDF, certidões automáticas, responsáveis, portfolio com uploads, ANVISA, cadastro manual, classificação e monitoramento.
