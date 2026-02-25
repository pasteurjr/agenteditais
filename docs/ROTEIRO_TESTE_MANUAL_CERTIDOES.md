# Roteiro de Teste Manual — Certidoes Automaticas

**Requisito:** RF-003 (Certidoes Automaticas) + RF-004 (Alertas IA sobre Documentos)
**Pre-requisitos:** Backend rodando (porta 5007), Frontend rodando (porta 5175), estar logado no sistema.

---

## Teste 1 — Pagina Empresa exibe secao de Certidoes

**Passos:**
1. No menu lateral, clique em **Configuracoes** > **Empresa**
2. Role a pagina ate encontrar o card **"Certidoes Automaticas"**

**Resultado esperado:**
- [ ] Card "Certidoes Automaticas" esta visivel
- [ ] Subtitulo mostra "Busca certidoes para CNPJ XX.XXX.XXX/XXXX-XX nos portais oficiais"
- [ ] Botao azul **"Buscar Certidoes"** esta visivel e habilitado
- [ ] Se a empresa nao tem CNPJ, o botao aparece desabilitado

---

## Teste 2 — Buscar Certidoes popula tabela com 21 linhas

**Passos:**
1. Na secao "Certidoes Automaticas", clique no botao **"Buscar Certidoes"**
2. Aguarde o carregamento (o botao muda para "Buscando..." com spinner)
3. Aguarde ate o botao voltar ao normal (pode levar 5-30 segundos)

**Resultado esperado:**
- [ ] Enquanto busca, aparece "Buscando..." com icone girando
- [ ] Apos conclusao, aparece mensagem verde com estatisticas: "Busca concluida: 21 fontes — X obtidas automaticamente, Y pendentes, Z manuais"
- [ ] Tabela mostra **21 linhas** (uma por fonte cadastrada)
- [ ] Cada linha tem: nome da certidao, orgao emissor, status, validade, botoes de acao

---

## Teste 3 — Status badges corretos por tipo de fonte

**Passos:**
1. Apos buscar, observe a coluna "Status" na tabela de certidoes

**Resultado esperado:**
- [ ] Fontes publicas que o sistema conseguiu consultar: badge verde **"Valida"**
- [ ] Fontes publicas que requerem acesso manual (captcha): badge amarelo **"Pendente"**
- [ ] Fontes manuais (SICAF, Atestados, Balanco, CREA-SP, CND Municipal): badge cinza **"Manual"**
- [ ] Nenhum badge "Erro" (a menos que haja problema de rede)

**Fontes que devem aparecer como "Manual" (5):**
1. SICAF - Cadastro Unificado de Fornecedores
2. CND Municipal - Prefeitura de Sao Paulo (ISS)
3. Atestados de Capacidade Tecnica
4. CREA-SP - Registro de Pessoa Juridica
5. Balanco Patrimonial e Demonstracoes Contabeis

---

## Teste 4 — Botoes de acao por linha

**Passos:**
1. Observe os botoes na coluna "Acoes" de cada linha

**Resultado esperado:**
- [ ] Icone de **olho** (azul): presente em linhas que tem URL de portal. Ao clicar, abre o portal oficial em nova aba
- [ ] Icone de **upload** (amarelo): presente em TODAS as 21 linhas. Permite anexar PDF
- [ ] Icone de **download**: so aparece em linhas que ja tem arquivo anexado
- [ ] Icone de **refresh**: presente apenas nas 16 fontes automaticas. Ausente nas 5 manuais

---

## Teste 5 — Abrir portal via icone de olho

**Passos:**
1. Na linha "CND Federal - Receita Federal / PGFN", clique no icone de olho (azul)
2. Na linha "CNDT - Certidao Negativa de Debitos Trabalhistas", clique no icone de olho

**Resultado esperado:**
- [ ] CND Federal: abre nova aba com o site da Receita Federal (solucoes.receita.fazenda.gov.br)
- [ ] CNDT: abre nova aba com o site do TST (cndt-certidao.tst.jus.br)
- [ ] Os links abrem nos portais corretos dos respectivos orgaos

---

## Teste 6 — Modal de upload de certidao

**Passos:**
1. Na linha de qualquer certidao, clique no icone de **upload** (amarelo)
2. Observe o modal que abre

**Resultado esperado:**
- [ ] Modal abre com titulo "Upload Certidao: [nome da certidao]"
- [ ] Campo obrigatorio: **Arquivo (PDF)** — aceita PDF, JPG, PNG
- [ ] Campo opcional: **Data de Vencimento** — input tipo date
- [ ] Campo opcional: **Numero da Certidao** — campo texto
- [ ] Texto informativo: "Apos o upload, a certidao sera marcada como Valida"
- [ ] Botoes: **Cancelar** e **Enviar** (Enviar desabilitado enquanto nao selecionar arquivo)

---

## Teste 7 — Upload real de PDF

**Passos:**
1. Clique no icone de upload de qualquer certidao (ex: CND Federal)
2. No modal, selecione um arquivo PDF do seu computador
3. Preencha a data de vencimento (ex: 6 meses a frente)
4. Preencha o numero (ex: "12345/2026")
5. Clique **Enviar**

**Resultado esperado:**
- [ ] Modal fecha automaticamente apos envio bem-sucedido
- [ ] A certidao agora mostra badge verde **"Valida"**
- [ ] A coluna "Validade" mostra a data que voce informou
- [ ] O icone de **download** aparece na linha (arquivo foi salvo)
- [ ] Clicar no download baixa o PDF que voce enviou

---

## Teste 8 — Download de certidao anexada

**Passos:**
1. Apos fazer upload (Teste 7), clique no icone de **download** na mesma linha

**Resultado esperado:**
- [ ] Browser inicia download do arquivo PDF
- [ ] O arquivo baixado corresponde ao que foi enviado no upload

---

## Teste 9 — Footer dinamico com contagem

**Passos:**
1. Role ate o final da tabela de certidoes

**Resultado esperado:**
- [ ] Aparece texto tipo: "21 certidoes (16 com busca automatica, 5 manuais)"
- [ ] NAO aparece o texto antigo fixo "Fontes: Receita Federal | SEFAZ | Prefeitura | Caixa | TST"
- [ ] Instrucao: "Clique no icone [olho] para abrir o portal do orgao emissor"

---

## Teste 10 — CRUD Fontes de Certidoes (menu Cadastros)

**Passos:**
1. No menu lateral, clique em **Cadastros**
2. Expanda **Empresa**
3. Clique em **Fontes de Certidoes**

**Resultado esperado:**
- [ ] Pagina CRUD abre com tabela mostrando as 21 fontes
- [ ] Colunas visiveis: nome, tipo_certidao, orgao_emissor, url_portal, metodo_acesso, ativo, permite_busca_automatica
- [ ] Pode clicar em uma fonte para editar (alterar URL, ativar/desativar busca automatica)
- [ ] As 21 fontes estao listadas:

| # | Nome | Tipo |
|---|---|---|
| 1 | CND Federal - Receita Federal / PGFN | cnd_federal |
| 2 | CND Estadual - SEFAZ/SP (ICMS) | cnd_estadual |
| 3 | CND Municipal - Prefeitura de Sao Paulo (ISS) | cnd_municipal |
| 4 | CRF - Certificado de Regularidade do FGTS | fgts |
| 5 | CNDT - Certidao Negativa de Debitos Trabalhistas | trabalhista |
| 6 | SICAF - Cadastro Unificado de Fornecedores | outro |
| 7 | CEIS - Empresas Inidoneas e Suspensas (CGU) | outro |
| 8 | CNEP - Empresas Punidas Lei Anticorrupcao (CGU) | outro |
| 9 | TCU - Lista de Licitantes Inidoneos | outro |
| 10 | CNJ - Improbidade Administrativa | outro |
| 11 | CADIN - Cadastro de Inadimplentes Federal | outro |
| 12 | Certidao de Falencia e Recuperacao Judicial (TJSP) | outro |
| 13 | Certidao Distribuicoes Civeis 1o Grau (TJSP) | outro |
| 14 | Certidao Distribuicao - Justica Federal (TRF3/SP) | outro |
| 15 | Certidao Simplificada - JUCESP | outro |
| 16 | ANVISA - AFE (Autorizacao de Funcionamento) | outro |
| 17 | ANVISA - Registro de Produtos para Saude | outro |
| 18 | INMETRO - Certificacao de Produtos | outro |
| 19 | CREA-SP - Registro de Pessoa Juridica | outro |
| 20 | Atestados de Capacidade Tecnica | outro |
| 21 | Balanco Patrimonial e Demonstracoes Contabeis | outro |

---

## Teste 11 — Editar uma fonte de certidao

**Passos:**
1. Na pagina de Fontes de Certidoes (Teste 10), clique em uma fonte (ex: "CND Municipal")
2. Altere a URL do portal para a URL correta da prefeitura da sua cidade
3. Marque "permite_busca_automatica" como true
4. Salve

**Resultado esperado:**
- [ ] Formulario de edicao abre com os dados atuais da fonte
- [ ] Pode alterar URL, metodo de acesso, credenciais, observacoes
- [ ] Apos salvar, a alteracao persiste (recarregue a pagina para confirmar)

---

## Teste 12 — Buscar novamente apos editar fonte

**Passos:**
1. Volte para **Configuracoes** > **Empresa**
2. Clique em **"Buscar Certidoes"** novamente

**Resultado esperado:**
- [ ] A certidao correspondente a fonte editada reflete a nova URL
- [ ] Se voce habilitou busca automatica na CND Municipal, agora o sistema tenta consultar o portal

---

## Teste 13 — Mensagem de estatisticas apos busca

**Passos:**
1. Observe a mensagem verde apos clicar "Buscar Certidoes"

**Resultado esperado:**
- [ ] Mensagem mostra: "Busca concluida: 21 fontes — X obtidas automaticamente, Y pendentes (portal manual), Z aguardando credenciais, W manuais"
- [ ] Abaixo: "Certidoes marcadas como 'Valida' foram obtidas automaticamente. Para as demais, clique no icone de olho para abrir o portal e faca upload do PDF."

---

## Teste 14 — Busca automatica real nos portais

**Passos:**
1. Apos clicar "Buscar Certidoes", observe quais certidoes ficaram com status "Valida" automaticamente

**Portais com busca automatica real (HTTP):**

| Portal | O que faz | Resultado esperado |
|---|---|---|
| CEIS/CGU | Consulta API publica do Portal da Transparencia | Se empresa nao tem sancoes: "Valida" |
| CNEP/CGU | Consulta API publica do Portal da Transparencia | Se empresa nao tem punicoes: "Valida" |
| CADIN | Consulta API publica do Portal da Transparencia | Se empresa nao e inadimplente: "Valida" |
| TCU | Consulta API publica do Portal da Transparencia | Se empresa nao e inidonea: "Valida" |
| TST (CNDT) | Tenta gerar certidao via endpoint do TST | Se sem debitos: "Valida" com PDF baixado |
| CAIXA (FGTS) | Tenta consultar via formulario web | Se regular: "Valida" |

**Portais que requerem acesso manual (captcha/login):**
- Receita Federal, SEFAZ, Prefeitura, ANVISA, JUCESP, INMETRO, CNJ, TJ, JF
- Estes ficam como "Pendente" — voce precisa acessar o portal e fazer upload manual

---

## Teste 15 — Scheduler de verificacao de vencimento

**Passos:**
1. No log do backend (terminal), verifique que aparece: `[SCHEDULER] - Verificacao de certidoes: diaria as 6h`
2. (Opcional) Para testar manualmente: no banco de dados, altere a `data_vencimento` de uma certidao para amanha

**Resultado esperado:**
- [ ] Log do backend mostra o job registrado
- [ ] Quando o job roda (diariamente as 6h):
  - Certidoes vencendo em 15 dias: cria Alerta + Notificacao no sistema
  - Certidoes vencidas: marca status como "Vencida" automaticamente
  - Cria notificacao "Certidao vencida: [nome]" visivel na area de notificacoes

---

## Checklist Final

| # | Teste | OK? |
|---|---|---|
| 1 | Secao certidoes visivel na pagina Empresa | [ ] |
| 2 | Buscar retorna 21 linhas | [ ] |
| 3 | Badges corretos (Valida/Pendente/Manual) | [ ] |
| 4 | Botoes de acao (olho/upload/download/refresh) | [ ] |
| 5 | Icone olho abre portal correto | [ ] |
| 6 | Modal upload abre com campos corretos | [ ] |
| 7 | Upload de PDF funciona e marca como Valida | [ ] |
| 8 | Download da certidao anexada funciona | [ ] |
| 9 | Footer dinamico (nao hardcoded) | [ ] |
| 10 | CRUD Fontes mostra 21 fontes | [ ] |
| 11 | Editar fonte persiste alteracao | [ ] |
| 12 | Re-buscar reflete fonte editada | [ ] |
| 13 | Mensagem com estatisticas detalhadas | [ ] |
| 14 | Busca automatica real nos portais publicos | [ ] |
| 15 | Scheduler registrado no log do backend | [ ] |
