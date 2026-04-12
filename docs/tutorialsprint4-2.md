# Tutorial de Validação Manual — Sprint 4 — Conjunto 2
# Empresa: RP3X Comércio e Representações Ltda.

**Data:** 08/04/2026
**Dados:** dadosrecursimp-2.md
**Referência:** CASOS DE USO RECURSOS E IMPUGNACOES V2.md
**UCs:** I01–I05, RE01–RE06, FU01–FU03 (14 casos de uso)
**Público:** Dono do Produto / Validador de Negócio (sem conhecimento técnico necessário)

---

> **Como usar este tutorial**
>
> Siga cada passo na ordem indicada. Os dados a inserir estão destacados em `código`. As verificações ao final de cada UC dizem exatamente o que deve estar na tela para confirmar que o sistema funcionou corretamente. Quando algo não está como esperado, a seção "Sinais de problema" orienta o que reportar.

---

## Credenciais e Fluxo de Acesso

| Campo | Valor |
|---|---|
| URL do sistema | `http://pasteurjr.servehttp.com:5179` |
| Usuário (Conjunto 2) | valida2@valida.com.br |
| Senha | 123456 |
| Perfil | Superusuário |
| Empresa alvo | RP3X Comércio e Representações Ltda. |

### Pré-requisitos obrigatórios

Antes de iniciar este tutorial, os seguintes dados devem estar cadastrados no sistema:

1. **Sprint 1 (Empresa/Portfólio/Parametrização):** Empresa RP3X cadastrada com todos os dados de `dadosempportpar-2.md`.
2. **Sprint 2 (Captação/Validação):** Editais salvos com status GO ou Em Avaliação de `dadoscapval-2.md`, especialmente:
   - Edital de reagentes de hematologia (busca "reagente hematologia")
   - Edital de kit diagnóstico laboratorial (busca "kit diagnostico laboratorio")

3. **Produtos cadastrados no portfólio:**

| Produto | Fabricante | NCM | Área |
|---|---|---|---|
| Kit de Reagentes para Hemograma Completo Sysmex XN | Sysmex | 3822.19.90 | Diagnóstico in Vitro e Laboratório |
| Kit para Glicose Enzimática Wiener BioGlic-100 Automação | Wiener Lab Group | 3822.19.90 | Diagnóstico in Vitro e Laboratório |

### Fluxo de login

1. Acessar `http://pasteurjr.servehttp.com:5179`
2. Email: `valida2@valida.com.br` / Senha: `123456`
3. Tela de seleção de empresa → clicar "RP3X Comércio e Representações Ltda."
4. Dashboard carrega com RP3X como empresa ativa

### Menus extras visíveis (superusuário)
- **Usuarios** — CRUD de usuários
- **Associar Empresa/Usuario** — vincular usuários a empresas
- **Selecionar Empresa** — trocar empresa ativa

---

## Índice

### FASE 1 — IMPUGNAÇÃO E ESCLARECIMENTOS
- [UC-I01 — Validação Legal do Edital](#uc-i01--validação-legal-do-edital)
- [UC-I02 — Sugerir Esclarecimento ou Impugnação](#uc-i02--sugerir-esclarecimento-ou-impugnação)
- [UC-I03 — Gerar Petição de Impugnação](#uc-i03--gerar-petição-de-impugnação)
- [UC-I04 — Upload de Petição Externa](#uc-i04--upload-de-petição-externa)
- [UC-I05 — Controle de Prazo](#uc-i05--controle-de-prazo)

### FASE 2 — RECURSOS E CONTRA-RAZÕES
- [UC-RE01 — Monitorar Janela de Recurso](#uc-re01--monitorar-janela-de-recurso)
- [UC-RE02 — Analisar Proposta Vencedora](#uc-re02--analisar-proposta-vencedora)
- [UC-RE03 — Chatbox de Análise](#uc-re03--chatbox-de-análise)
- [UC-RE04 — Gerar Laudo de Recurso](#uc-re04--gerar-laudo-de-recurso)
- [UC-RE05 — Gerar Laudo de Contra-Razão](#uc-re05--gerar-laudo-de-contra-razão)
- [UC-RE06 — Submissão Assistida no Portal](#uc-re06--submissão-assistida-no-portal)

### FASE 3 — FOLLOWUP DE RESULTADOS
- [UC-FU01 — Registrar Resultado de Edital](#uc-fu01--registrar-resultado-de-edital)
- [UC-FU02 — Configurar Alertas de Vencimento](#uc-fu02--configurar-alertas-de-vencimento)
- [UC-FU03 — Score Logístico](#uc-fu03--score-logístico)

- [Resumo de Verificações por UC](#resumo-de-verificações-por-uc)
- [O que reportar se algo falhar](#o-que-reportar-se-algo-falhar)

---

# FASE 1 — IMPUGNAÇÃO E ESCLARECIMENTOS

---

## [UC-I01] Validação Legal do Edital

> **O que este caso de uso faz:** O sistema analisa automaticamente o texto de um edital salvo e identifica cláusulas que podem violar a legislação de licitações (Lei 14.133/2021). Cada inconsistência encontrada recebe uma classificação de gravidade (ALTA, MÉDIA, BAIXA) e uma sugestão de ação — Impugnação (para cláusulas claramente ilegais) ou Esclarecimento (para cláusulas ambíguas). É como ter um advogado especializado revisando o edital para encontrar problemas antes do prazo.

**Onde:** Menu lateral → Impugnação → aba Validação Legal
**Quanto tempo leva:** 5 a 10 minutos (inclui processamento da IA)

---

### Antes de começar

- Certifique-se de estar logado com `valida2@valida.com.br` e com a empresa RP3X ativa.
- Pelo menos um edital de reagentes de hematologia deve estar salvo no sistema (Sprint 2).

---

### Passo 1 — Navegar até a página de Impugnação

**O que fazer:** No menu lateral à esquerda, localize e clique na opção "Impugnação". Isso vai abrir a tela de Impugnação e Esclarecimentos.

**O que você vai ver na tela:** Uma página com abas (Validação Legal, Petições, Prazos) e um seletor de edital.

**O que acontece depois:** A tela de Impugnação é exibida, pronta para selecionar um edital.

---

### Passo 2 — Selecionar o edital e analisar

**O que fazer:** No campo [Select: "Selecione o Edital"], escolha o edital de reagentes hematológicos salvo na Sprint 2. Em seguida, clique no botão "Analisar Edital".

**O que você vai ver na tela:** O seletor de edital com a lista de editais salvos e o botão "Analisar Edital".

**O que acontece depois:** O sistema exibe um indicador "Analisando..." enquanto a IA processa o edital. Após o processamento (30-60 segundos), uma tabela de inconsistências aparece.

---

### Passo 3 — Verificar as inconsistências identificadas

**O que fazer:** Examine a tabela de inconsistências gerada pela IA. Cada linha deve conter: trecho do edital, lei violada, gravidade e sugestão de ação.

**Inconsistências esperadas (específicas de reagentes):**

| # | Trecho do edital (exemplo) | Lei Violada | Gravidade | Sugestão |
|---|---|---|---|---|
| 1 | "Reagentes devem ser compatíveis exclusivamente com analisador Sysmex XN-1000" | Art. 41 par.2 Lei 14.133/2021 — restrição indevida de marca/plataforma | ALTA | Impugnação |
| 2 | "Exige-se AFE ANVISA categoria especial para distribuidora" | Art. 67 par.1 Lei 14.133/2021 — exigência desproporcional de habilitação | MÉDIA | Esclarecimento |
| 3 | "Prazo de validade mínimo de 24 meses na data da entrega" | Art. 75 Lei 14.133/2021 — restrição excessiva (shelf-life padrão do mercado é 18 meses) | ALTA | Impugnação |
| 4 | "Fornecimento de equipamento em comodato vinculado aos reagentes" | Art. 40 par.5 Lei 14.133/2021 — vinculação reagente-equipamento restringe competição | ALTA | Impugnação |
| 5 | "Amostras de todos os itens devem ser entregues em até 3 dias úteis" | Art. 17 par.3 Lei 14.133/2021 — prazo insuficiente para logística de cadeia fria (2-8°C) | MÉDIA | Esclarecimento |

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- Tabela de inconsistências visível com pelo menos 3 itens
- Badges de gravidade coloridos: ALTA (vermelho), MÉDIA (amarelo), BAIXA (verde)
- Badges de sugestão: "Impugnação" (error) ou "Esclarecimento" (info)
- Questões específicas de reagentes: platform lock-in (comodato vinculado), shelf-life, cadeia fria, AFE especial

**Sinais de problema:**
- Nenhuma inconsistência identificada
- Inconsistências genéricas que não mencionam reagentes/equipamentos
- Gravidades todas iguais (sem diferenciação)
- Processamento trava por mais de 90 segundos

---

## [UC-I02] Sugerir Esclarecimento ou Impugnação

> **O que este caso de uso faz:** Depois de identificar as inconsistências do edital (UC-I01), agora você cria as petições formais — seja um Esclarecimento (para pedir explicação sobre algo ambíguo) ou uma Impugnação (para contestar uma cláusula ilegal). É como redigir uma carta oficial ao órgão licitante antes do prazo.

**Onde:** Menu lateral → Impugnação → aba Petições
**Quanto tempo leva:** 10 a 15 minutos (2 petições a criar)

---

### Antes de começar

- O UC-I01 deve ter sido executado (edital já analisado).
- Você continuará na mesma página de Impugnação.

---

### Passo 1 — Acessar a aba Petições

**O que fazer:** Na página de Impugnação, clique na aba "Petições".

**O que você vai ver na tela:** Uma tabela (possivelmente vazia) de petições e um botão "Nova Petição".

---

### Passo 2 — Criar petição de Esclarecimento (AFE desproporcional)

**O que fazer:** Clique no botão "Nova Petição". Um modal (janela sobreposta) vai abrir com campos para preencher.

**Dados a informar no modal:**

| Campo | Valor |
|---|---|
| Edital | Edital de reagentes hematológicos |
| Tipo | `Esclarecimento` |
| Template | `Nenhum (em branco)` |
| Conteúdo | `Solicitamos esclarecimento quanto à exigência de AFE ANVISA em categoria especial para distribuidoras de reagentes de diagnóstico in vitro. A legislação vigente (RDC 16/2013) não prevê tal subcategoria para distribuidoras de produtos classe I e II. Rogamos informar a base normativa para tal requisito.` |

**O que acontece depois:** Clique em "Salvar" (ou botão equivalente). A petição é criada e aparece na tabela.

✅ **Correto se:** Petição aparece na tabela com Tipo "Esclarecimento", Status "Rascunho" e badge de tipo "Esclarecimento" (info).
❌ **Problema se:** Modal não abre, erro ao salvar, ou petição não aparece na tabela.

---

### Passo 3 — Criar petição de Impugnação (restrição de plataforma)

**O que fazer:** Clique novamente em "Nova Petição". Preencha o modal com os dados de uma Impugnação.

**Dados a informar no modal:**

| Campo | Valor |
|---|---|
| Edital | Edital de reagentes hematológicos |
| Tipo | `Impugnação` |
| Template | `Nenhum (em branco)` |
| Conteúdo | `A exigência de compatibilidade exclusiva com analisador Sysmex XN-1000 configura direcionamento de marca vedado pelo Art. 41 par.2 da Lei 14.133/2021. Reagentes de diversos fabricantes (Wiener, Labtest, Abbott) atendem os mesmos parâmetros analíticos. A vinculação reagente-equipamento em comodato restringe indevidamente a competição.` |

**O que acontece depois:** Clique em "Salvar". A segunda petição aparece na tabela.

✅ **Correto se:** Petição aparece com Tipo "Impugnação", Status "Rascunho". Agora há 2 petições na tabela (Esclarecimento + Impugnação).
❌ **Problema se:** Só aparece uma petição, ou o tipo está incorreto.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- Duas petições na tabela: uma de Esclarecimento e uma de Impugnação
- Ambas com Status "Rascunho"
- Badges de tipo diferenciados (Esclarecimento = info, Impugnação = error)
- Conteúdo jurídico específico sobre AFE ANVISA e platform lock-in

**Sinais de problema:**
- Modal não abre ao clicar "Nova Petição"
- Erro ao salvar a petição
- Tipo não é gravado corretamente
- Tabela mostra apenas uma petição quando deveria ter duas

---

## [UC-I03] Gerar Petição de Impugnação

> **O que este caso de uso faz:** A IA do sistema gera automaticamente um documento formal de impugnação, com qualificação da empresa, fatos, fundamentos jurídicos, jurisprudências e pedido. Você pode editar o texto gerado, salvar como rascunho, enviar para revisão e exportar como PDF. É como ter um assistente jurídico que redige a primeira versão da petição para você revisar.

**Onde:** Menu lateral → Impugnação → aba Petições → abrir petição de Impugnação
**Quanto tempo leva:** 10 a 15 minutos (geração IA + edição + exportação)

---

### Antes de começar

- O UC-I02 deve ter sido executado (petição de Impugnação criada).
- Você deve estar na aba Petições com as 2 petições visíveis.

---

### Passo 1 — Abrir a petição de Impugnação

**O que fazer:** Na tabela de petições, localize a petição do tipo "Impugnação" (restrição de plataforma). Clique no ícone de olho (Eye) para abrir o editor.

**O que você vai ver na tela:** Um editor de texto com o conteúdo da petição e botões de ação (Gerar Petição, Salvar Rascunho, Enviar para Revisão, Exportar PDF).

---

### Passo 2 — Gerar petição via IA

**O que fazer:** Clique no botão "Gerar Petição" (ícone Lightbulb). Aguarde o processamento da IA.

**O que acontece depois:** A IA gera um documento completo de impugnação. O conteúdo é preenchido no editor de texto.

**Seções esperadas na petição gerada:**

| Seção | Conteúdo esperado |
|---|---|
| Qualificação | Dados da RP3X Comércio e Representações Ltda., CNPJ 68.218.593/0001-09, distribuidora de reagentes |
| Fatos | Descrição da cláusula que exige Sysmex XN-1000 exclusivamente, comodato vinculado |
| Direito | Art. 41 par.2 Lei 14.133/2021, Art. 5 Lei 12.462/2011, princípio da isonomia |
| Jurisprudências | Acórdão TCU sobre direcionamento de marca em reagentes laboratoriais |
| Pedido | Alteração do edital para aceitar reagentes compatíveis com múltiplas plataformas de análise hematológica |

✅ **Correto se:** Petição gerada com todas as seções preenchidas e conteúdo jurídico coerente.
❌ **Problema se:** IA não gera conteúdo, ou seções ficam vazias, ou conteúdo é genérico demais.

---

### Passo 3 — Editar o texto

**O que fazer:** No TextArea (editor de texto), edite o conteúdo gerado pela IA. Adicione o seguinte trecho como argumento complementar:

> "Adicionalmente, o prazo de validade mínimo de 24 meses exigido no edital excede o shelf-life padrão do mercado de reagentes de hematologia, que é de 18 meses conforme bulas dos fabricantes Sysmex, Wiener, Labtest e Abbott, restringindo ainda mais a competição."

**O que acontece depois:** O texto é atualizado no editor. Verifique que o texto é 100% editável.

---

### Passo 4 — Salvar rascunho

**O que fazer:** Clique no botão "Salvar Rascunho".

**O que acontece depois:** Uma mensagem de sucesso (toast) aparece confirmando o salvamento.

✅ **Correto se:** Toast de sucesso exibido.
❌ **Problema se:** Erro ao salvar, ou toast não aparece.

---

### Passo 5 — Enviar para revisão

**O que fazer:** Clique no botão "Enviar para Revisão".

**O que acontece depois:** O status da petição muda para "Em Revisão".

✅ **Correto se:** Status atualizado para "Em Revisão".
❌ **Problema se:** Status não muda, ou erro ao atualizar.

---

### Passo 6 — Exportar como PDF

**O que fazer:** Clique no botão "Exportar como PDF" (ou "Exportar PDF").

**O que acontece depois:** Um arquivo PDF é baixado para o seu computador com o conteúdo da petição.

✅ **Correto se:** Download do PDF é iniciado e o arquivo contém o texto da petição.
❌ **Problema se:** Download não inicia, ou PDF está vazio/corrompido.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- IA gerou petição com seções de Qualificação, Fatos, Direito, Jurisprudências e Pedido
- Texto 100% editável no editor
- Trecho sobre shelf-life adicionado com sucesso
- Rascunho salvo com toast de confirmação
- Status mudou para "Em Revisão"
- PDF exportado com conteúdo correto

**Sinais de problema:**
- IA não gera conteúdo ou trava no processamento
- Texto não é editável
- Salvamento falha
- Status não atualiza
- PDF vazio ou com erro

---

## [UC-I04] Upload de Petição Externa

> **O que este caso de uso faz:** Permite enviar (fazer upload) de uma petição que foi elaborada fora do sistema — por exemplo, uma petição preparada por um advogado em arquivo PDF. O sistema adiciona essa petição à lista, permitindo gerenciá-la junto com as petições criadas internamente.

**Onde:** Menu lateral → Impugnação → aba Petições
**Quanto tempo leva:** 3 a 5 minutos

---

### Antes de começar

- Os UCs I02 e I03 devem ter sido executados (2 petições já na tabela).
- Tenha um arquivo PDF disponível para upload (pode ser qualquer PDF menor que 2 MB).

---

### Passo 1 — Clicar Upload Petição

**O que fazer:** Na aba Petições, clique no botão "Upload Petição".

**O que você vai ver na tela:** Um modal (janela sobreposta) com campos para selecionar o edital e o arquivo.

---

### Passo 2 — Preencher os dados e fazer upload

**Dados a informar no modal:**

| Campo | Valor |
|---|---|
| Edital | Edital de reagentes hematológicos |
| Arquivo | Selecionar um arquivo PDF (por exemplo, `tests/fixtures/teste_upload.pdf` ou qualquer PDF < 2 MB) |

**O que fazer:** Selecione o edital, escolha o arquivo PDF e clique em "Enviar" (ou "Upload").

**O que acontece depois:** O arquivo é enviado e uma nova petição aparece na tabela.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- Petição de upload aparece na tabela com Tipo "Impugnação" e Status "Rascunho"
- Total de petições na tabela: 3 (2 criadas + 1 upload)

**Sinais de problema:**
- Modal de upload não abre
- Erro ao enviar o arquivo
- Petição não aparece na tabela após upload
- Total de petições diferente de 3

---

## [UC-I05] Controle de Prazo

> **O que este caso de uso faz:** O sistema calcula automaticamente os prazos de impugnação para cada edital salvo. Segundo a Lei 14.133/2021 (Art. 164), o prazo para impugnar é de 3 dias úteis antes da data de abertura do edital. O sistema mostra uma tabela com os editais, datas de abertura, prazos limite e um indicador de urgência (OK, Atenção, Urgente ou Expirado).

**Onde:** Menu lateral → Impugnação → aba Prazos
**Quanto tempo leva:** 3 a 5 minutos

---

### Passo 1 — Acessar a aba Prazos

**O que fazer:** Na página de Impugnação, clique na aba "Prazos".

**O que você vai ver na tela:** Uma tabela com os editais salvos e seus respectivos prazos de impugnação.

---

### Passo 2 — Verificar os dados da tabela

**O que fazer:** Examine a tabela de prazos. Ela deve conter os editais salvos na Sprint 2.

**Dados esperados na tabela:**

| Edital | Órgão (exemplo) | Data Abertura | Prazo Limite (3d úteis) | Status esperado |
|---|---|---|---|---|
| Edital de reagentes hematológicos | Hospital Estadual ou Secretaria de Saúde | (data do edital) | (3 dias úteis antes) | OK, Atenção ou Urgente |
| Edital de kit diagnóstico | Laboratório Central (LACEN) | (data do edital) | (3 dias úteis antes) | OK, Atenção ou Urgente |

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- Tabela de prazos carregada com editais salvos
- Coluna "Dias Restantes" com valor numérico ou badge "EXPIRADO"
- Coluna "Status" com badge colorido: Urgente (vermelho), Atenção (amarelo), OK (verde), Expirado (vermelho)
- Cálculo automático: 3 dias úteis antes da abertura (Art. 164 Lei 14.133/2021)
- Editais de reagentes e de kits diagnósticos aparecem simultaneamente na tabela

**Sinais de problema:**
- Tabela vazia (nenhum edital aparece)
- Coluna "Dias Restantes" sem valor ou com valor incorreto
- Badges de status todos iguais (sem diferenciação por urgência)
- Cálculo de prazo não desconta fins de semana/feriados

---

# FASE 2 — RECURSOS E CONTRA-RAZÕES

---

## [UC-RE01] Monitorar Janela de Recurso

> **O que este caso de uso faz:** Após a fase de licitação, existe uma janela de tempo para interpor recursos. Este UC configura o monitoramento automático dessa janela — o sistema acompanha o portal de compras e notifica você (por WhatsApp, email ou alerta no sistema) quando a janela de recurso abre. Você também pode registrar a intenção de recurso assim que a janela estiver aberta.

**Onde:** Menu lateral → Recursos → aba Monitoramento
**Quanto tempo leva:** 5 a 10 minutos

---

### Antes de começar

- Certifique-se de estar logado com `valida2@valida.com.br` e empresa RP3X ativa.
- Pelo menos um edital de reagentes deve estar salvo no sistema.

---

### Passo 1 — Navegar até a página de Recursos

**O que fazer:** No menu lateral à esquerda, clique na opção "Recursos". Isso abre a tela de Recursos e Contra-Razões.

**O que você vai ver na tela:** Uma página com abas (Monitoramento, Análise, Laudos) e um seletor de edital.

---

### Passo 2 — Selecionar edital e configurar canais

**O que fazer:** Na aba "Monitoramento", selecione o edital de reagentes hematológicos no campo [Select]. Configure os canais de notificação conforme abaixo.

**Dados a informar:**

| Canal | Valor |
|---|---|
| WhatsApp | `Sim` (marcar checkbox) |
| Email | `Sim` (marcar checkbox) |
| Alerta no sistema | `Não` (deixar desmarcado) |

---

### Passo 3 — Ativar monitoramento

**O que fazer:** Clique no botão "Ativar Monitoramento".

**O que acontece depois:** O status muda para "Aguardando". O sistema começa a monitorar a janela de recurso.

---

### Passo 4 — Verificar detecção de janela

**O que fazer:** Aguarde o sistema detectar a abertura da janela de recurso (ou verifique se ela já está aberta).

**O que acontece depois:** Se a janela estiver aberta, o status muda para "JANELA ABERTA".

---

### Passo 5 — Registrar intenção de recurso

**O que fazer:** Quando o status estiver "JANELA ABERTA", clique no botão "Registrar Intenção de Recurso".

**O que acontece depois:** A intenção de recurso é registrada e o status é atualizado.

✅ **Correto se:** Intenção registrada com sucesso, status atualizado.
❌ **Problema se:** Botão "Registrar Intenção" não disponível, ou erro ao registrar.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- Edital selecionado corretamente
- Canais WhatsApp e Email marcados, Alerta no sistema desmarcado (apenas 2 canais ativos)
- Monitoramento ativado com status "Aguardando" ou "JANELA ABERTA"
- Intenção de recurso registrada (se janela aberta)

**Sinais de problema:**
- Seletor de edital vazio (sem editais salvos)
- Checkboxes de canal não funcionam
- Monitoramento não ativa ao clicar o botão
- Status não muda de "Aguardando"

---

## [UC-RE02] Analisar Proposta Vencedora

> **O que este caso de uso faz:** Neste UC, você cola o texto completo da proposta do concorrente que venceu a licitação. A IA analisa a proposta e identifica inconsistências — pontos onde o vencedor pode não atender ao edital. Isso fundamenta um possível recurso. É como fazer uma auditoria da proposta do vencedor para encontrar falhas.

**Onde:** Menu lateral → Recursos → aba Análise
**Quanto tempo leva:** 10 a 15 minutos (inclui colagem do texto e processamento IA)

---

### Antes de começar

- Você deve estar na página de Recursos.
- O edital de reagentes hematológicos deve estar salvo.

---

### Passo 1 — Acessar a aba Análise

**O que fazer:** Clique na aba "Análise". Selecione o edital de reagentes hematológicos.

**O que você vai ver na tela:** Um campo TextArea para colar a proposta vencedora e um botão para iniciar a análise.

---

### Passo 2 — Colar a proposta vencedora

**O que fazer:** Copie o texto abaixo e cole no campo TextArea da proposta vencedora:

```
PROPOSTA COMERCIAL — Labtest Diagnóstica S.A.
CNPJ: 16.517.200/0001-72
Pregão Eletrônico — Reagentes de Hematologia

Item 1: Kit de Reagentes para Hemograma Completo — Labtest LabMax 300
  Qtd: 50 CX | Valor Unit: R$ 1.720,00 | Total: R$ 86.000,00
  Prazo de validade: 18 meses | Armazenamento: 2-8C
  Compatível com: Mindray BC-6800, Labtest LabMax

Item 2: Reagente Diluente Isotônico — Labtest CellPack
  Qtd: 30 GL | Valor Unit: R$ 390,00 | Total: R$ 11.700,00

Item 3: Reagente Lisante — Labtest StromaLyse
  Qtd: 40 FR | Valor Unit: R$ 350,00 | Total: R$ 14.000,00

Item 4: Controle Hematológico — Labtest ControlCheck 3N
  Qtd: 20 KIT | Valor Unit: R$ 980,00 | Total: R$ 19.600,00

TOTAL: R$ 131.300,00
Prazo de entrega: 20 dias corridos
Condição: Equipamento Mindray BC-6800 em comodato vinculado
Validade da proposta: 90 dias
```

---

### Passo 3 — Iniciar a análise

**O que fazer:** Clique no botão de análise (pode ser "Analisar Proposta" ou similar). Aguarde o processamento da IA.

**O que acontece depois:** A IA identifica as inconsistências da proposta e exibe os resultados em cards na tela.

---

### Passo 4 — Verificar inconsistências identificadas

**O que fazer:** Examine os cards de resultado. Verifique as inconsistências conforme a tabela abaixo.

**Inconsistências esperadas na proposta:**

| # | Item | Inconsistência | Motivação Recurso | Gravidade |
|---|---|---|---|---|
| 1 | Compatibilidade de plataforma | Proposta oferece Mindray BC-6800 mas edital especificava Sysmex XN-1000 | Descumprimento do termo de referência — plataforma incompatível | ALTA |
| 2 | Prazo de validade | Proposta informa 18 meses, edital exige 24 meses | Não atende requisito de shelf-life mínimo exigido | ALTA |
| 3 | Prazo de entrega | 20 dias corridos pode exceder o prazo do edital (15 dias) | Descumprimento de prazo de entrega | MÉDIA |
| 4 | Comodato não solicitado | Proposta inclui comodato de Mindray BC-6800 sem previsão editalícia | Inclusão de condição não prevista no edital — pode configurar vantagem indevida | MÉDIA |
| 5 | Registro ANVISA | Não consta número de registro ANVISA dos reagentes na proposta | Ausência de comprovação regulatória obrigatória | BAIXA |

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- Card "Inconsistências Identificadas" visível com tabela
- Card "Análise Detalhada" visível com texto jurídico
- Badges de gravidade: ALTA (vermelho), MÉDIA (amarelo), BAIXA (verde)
- Inconsistências específicas: plataforma incompatível, shelf-life, comodato não previsto, registro ANVISA

**Sinais de problema:**
- Análise não identifica nenhuma inconsistência
- Processamento da IA trava por mais de 90 segundos
- Cards de resultado não aparecem
- Inconsistências genéricas sem mencionar os itens específicos da proposta

---

## [UC-RE03] Chatbox de Análise

> **O que este caso de uso faz:** Após a análise da proposta vencedora (UC-RE02), você pode fazer perguntas à IA sobre os resultados. O chatbox funciona como um assistente jurídico/técnico que responde dúvidas sobre a proposta, viabilidade de recurso, riscos e estratégias. A conversa é cumulativa — cada pergunta aproveita o contexto das anteriores.

**Onde:** Menu lateral → Recursos → aba Análise → seção Chatbox
**Quanto tempo leva:** 15 a 20 minutos (5 perguntas com respostas da IA)

---

### Antes de começar

- O UC-RE02 deve ter sido executado (proposta analisada).
- Você deve estar na aba Análise com os resultados visíveis.

---

### Passo 1 — Pergunta 1: Compatibilidade de plataforma

**O que fazer:** No campo de texto do chatbox, digite a pergunta abaixo e clique "Enviar":

`Os reagentes da Labtest são compatíveis com o analisador Sysmex XN-1000 exigido no edital?`

**O que acontece depois:** A mensagem aparece na área de chat (lado direito). O sistema exibe "Pensando..." e depois a resposta da IA (lado esquerdo).

✅ **Correto se:** Resposta menciona a incompatibilidade de plataforma — reagentes Labtest são para Mindray, não para Sysmex.
❌ **Problema se:** Resposta genérica sem mencionar as plataformas específicas.

---

### Passo 2 — Pergunta 2: Shelf-life

**O que fazer:** Digite a pergunta:

`O prazo de validade de 18 meses pode ser aceito se o edital exige 24?`

**O que acontece depois:** IA responde com análise jurídica sobre recurso por shelf-life insuficiente.

✅ **Correto se:** Resposta analisa juridicamente a possibilidade de recurso, mencionando o Art. 75 ou padrão de mercado.

---

### Passo 3 — Pergunta 3: Comodato

**O que fazer:** Digite a pergunta:

`A inclusão de equipamento em comodato pela vencedora configura vantagem indevida?`

**O que acontece depois:** IA responde com análise sobre comodato não previsto no edital e impacto na isonomia.

✅ **Correto se:** Resposta discute o comodato não previsto e o princípio da isonomia.

---

### Passo 4 — Pergunta 4: AFE ANVISA

**O que fazer:** Digite a pergunta:

`A RP3X tem AFE ANVISA vigente para comercializar esses reagentes?`

**O que acontece depois:** IA responde sobre o status regulatório da empresa.

✅ **Correto se:** Resposta aborda a verificação de AFE ANVISA para a RP3X.

---

### Passo 5 — Pergunta 5: Risco de aceitação

**O que fazer:** Digite a pergunta:

`Qual o risco de a comissão de licitação aceitar reagentes com shelf-life menor?`

**O que acontece depois:** IA responde com análise de risco e precedentes.

✅ **Correto se:** Resposta menciona riscos e precedentes relevantes.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- 5 perguntas enviadas e 5 respostas recebidas
- Histórico completo visível na área de chat
- Conversa cumulativa (cada resposta considera o contexto anterior)
- Respostas específicas sobre reagentes: plataforma, shelf-life, comodato, AFE ANVISA, risco

**Sinais de problema:**
- Chatbox não envia mensagens
- IA não responde ou trava em "Pensando..."
- Respostas genéricas sem contexto do edital/proposta analisada
- Histórico de perguntas é perdido entre mensagens

---

## [UC-RE04] Gerar Laudo de Recurso

> **O que este caso de uso faz:** Aqui você cria os laudos formais de recurso — documentos técnicos e jurídicos que fundamentam a contestação da decisão da licitação. Neste conjunto, serão criados dois tipos: Recurso Técnico (contra a proposta da Labtest) e Recurso Administrativo (contra uma exigência do próprio edital). Os laudos possuem seções jurídicas e técnicas obrigatórias.

**Onde:** Menu lateral → Recursos → aba Laudos
**Quanto tempo leva:** 15 a 20 minutos (2 laudos a criar)

---

### Antes de começar

- Os UCs RE01 a RE03 devem ter sido executados.
- Você deve estar na página de Recursos.

---

### Passo 1 — Acessar a aba Laudos

**O que fazer:** Clique na aba "Laudos".

**O que você vai ver na tela:** Uma tabela (possivelmente vazia) de laudos e um botão "Novo Laudo".

---

### Passo 2 — Criar Recurso Técnico (contra Labtest)

**O que fazer:** Clique em "Novo Laudo". Um modal vai abrir.

**Dados a informar no modal:**

| Campo | Valor |
|---|---|
| Edital | Edital de reagentes hematológicos |
| Tipo | `Recurso` |
| Subtipo | `Técnico` |
| Template | `Nenhum (em branco)` |
| Empresa Alvo | `Labtest Diagnóstica S.A.` |
| Conteúdo Inicial | `Recurso técnico contra a proposta da Labtest Diagnóstica: (1) reagentes incompatíveis com plataforma Sysmex XN-1000 exigida; (2) shelf-life de 18 meses não atende o mínimo de 24 meses; (3) inclusão de comodato Mindray BC-6800 não previsto no TR.` |

**O que acontece depois:** Clique em "Salvar". O laudo aparece na tabela com Status "Rascunho".

---

### Passo 3 — Editar o Recurso Técnico

**O que fazer:** Clique no ícone de olho (Eye) para abrir o editor do laudo. Verifique que o card exibe "Editando: ... Recurso (Técnico)". Edite o texto no TextArea (rows 20), incluindo as seções obrigatórias:

**Seções obrigatórias do laudo:**

| Seção | Conteúdo esperado |
|---|---|
| SEÇÃO JURÍDICA | Art. 41 par.2 Lei 14.133/2021 (especificação técnica), Art. 71 (habilitação técnica), Acórdão TCU sobre reagentes incompatíveis |
| SEÇÃO TÉCNICA | Incompatibilidade reagente-analisador (Labtest para Mindray vs Sysmex exigido), shelf-life 18 vs 24 meses, ausência de registro ANVISA na proposta |

**O que fazer em seguida:**
1. Clique em "Salvar Rascunho" → toast de sucesso
2. Clique em "Enviar para Revisão" → status muda para "Revisão"

---

### Passo 4 — Criar Recurso Administrativo (contra o edital)

**O que fazer:** Clique novamente em "Novo Laudo". Preencha o modal com os dados do recurso administrativo.

**Dados a informar no modal:**

| Campo | Valor |
|---|---|
| Edital | Edital de reagentes hematológicos |
| Tipo | `Recurso` |
| Subtipo | `Administrativo` |
| Template | `Nenhum (em branco)` |
| Empresa Alvo | (deixar em branco — recurso contra o edital, não contra concorrente) |
| Conteúdo Inicial | `Recurso administrativo contra a exigência de shelf-life mínimo de 24 meses para reagentes de hematologia. O padrão de mercado para kits de hemograma é de 18 meses conforme bulas dos fabricantes Sysmex, Wiener, Labtest e Abbott. A exigência de 24 meses restringe indevidamente a competição (Art. 75 Lei 14.133/2021).` |

**O que acontece depois:** Clique em "Salvar". O segundo laudo aparece na tabela.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- 2 laudos na tabela: Recurso Técnico + Recurso Administrativo
- Empresa Alvo: "Labtest Diagnóstica S.A." no primeiro, vazio no segundo (cenário de borda — campo "Empresa Alvo" em branco)
- Status: ambos iniciam como "Rascunho" (o Técnico pode estar em "Revisão" se o Passo 3 foi executado)
- Conteúdo jurídico específico sobre plataforma incompatível, shelf-life e comodato

**Sinais de problema:**
- Modal não aceita campo "Empresa Alvo" em branco
- Subtipos (Técnico/Administrativo) não disponíveis
- Erro ao salvar o segundo laudo
- Apenas um laudo aparece na tabela

---

## [UC-RE05] Gerar Laudo de Contra-Razão

> **O que este caso de uso faz:** Uma contra-razão é a resposta formal ao recurso de um concorrente. Neste cenário, a Wama Diagnóstica interpôs recurso alegando que os reagentes da RP3X/Sysmex não possuem equivalência analítica. Você cria um laudo de contra-razão refutando esse argumento com certificações e registros ANVISA.

**Onde:** Menu lateral → Recursos → aba Laudos
**Quanto tempo leva:** 10 a 15 minutos

---

### Antes de começar

- O UC-RE04 deve ter sido executado (2 laudos de recurso na tabela).
- Você deve estar na aba Laudos.

---

### Passo 1 — Criar contra-razão

**O que fazer:** Clique em "Novo Laudo". Preencha o modal com os dados abaixo.

**Dados a informar no modal:**

| Campo | Valor |
|---|---|
| Edital | Edital de reagentes hematológicos |
| Tipo | `Contra-Razão` |
| Subtipo | `Técnico` |
| Template | `Nenhum (em branco)` |
| Empresa Alvo | `Wama Diagnóstica Ltda.` |
| Conteúdo Inicial | `Contra-razões ao recurso interposto pela Wama Diagnóstica, que alega que os reagentes RP3X Científica/Sysmex não possuem demonstração de equivalência analítica. Refutamos: os reagentes Sysmex XN possuem registro ANVISA (10069330285), validação conforme ISO 15189 e certificado de calibração rastreável ao padrão internacional ISLH.` |

**O que acontece depois:** Clique em "Salvar". O laudo aparece na tabela com Tipo "Contra-Razão" e Status "Rascunho".

---

### Passo 2 — Editar a contra-razão

**O que fazer:** Clique no ícone de olho (Eye) para abrir o editor. Verifique que o card exibe "Editando: ... Contra-Razão (Técnico)". Edite o texto incluindo as seções obrigatórias:

**Seções obrigatórias:**

| Seção | Conteúdo esperado |
|---|---|
| SEÇÃO JURÍDICA | Art. 71 Lei 14.133/2021, RDC 36/2015 ANVISA (IVD), ISO 15189 (laboratórios clínicos) |
| SEÇÃO TÉCNICA | Registro ANVISA vigente, equivalência analítica comprovada, certificação ISO 15189, calibração rastreável |
| DEFESA | Refutação do argumento de falta de equivalência — RP3X apresenta todas as certificações exigidas |
| ATAQUE | Wama Diagnóstica não apresentou registro ANVISA do produto proposto na licitação; reagentes Wama não possuem certificação ISO 15189 publicada |

---

### Passo 3 — Salvar e exportar

**O que fazer:**
1. Clique em "Salvar Rascunho" → toast de sucesso
2. Clique em "Exportar como DOCX" → download do arquivo DOCX

✅ **Correto se:** Toast de sucesso exibido e arquivo DOCX baixado.
❌ **Problema se:** Erro ao salvar ou exportação DOCX não funciona.

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- Total de laudos na tabela: 3 (2 Recursos + 1 Contra-Razão)
- Tipos distintos: Recurso Técnico, Recurso Administrativo, Contra-Razão
- Empresa Alvo: Labtest, (vazio), Wama
- Seções de DEFESA e ATAQUE presentes na contra-razão
- Exportação DOCX funcionando

**Sinais de problema:**
- Tipo "Contra-Razão" não disponível no seletor
- Seções DEFESA/ATAQUE não aceitas no editor
- Exportação DOCX falha
- Total de laudos diferente de 3

---

## [UC-RE06] Submissão Assistida no Portal

> **O que este caso de uso faz:** Este é o passo final da fase de Recursos — o sistema auxilia a submissão formal do recurso no portal de compras (ComprasNet/gov.br). Ele valida o documento (tamanho, formato, prazo, seções obrigatórias), gera o PDF final, abre o portal externo para upload manual e registra o protocolo de submissão. Neste conjunto, serão feitas duas submissões: o Recurso Técnico e a Contra-Razão.

**Onde:** Menu lateral → Recursos → aba Laudos → abrir laudo → "Submeter no Portal"
**Quanto tempo leva:** 10 a 15 minutos (2 submissões)

---

### Antes de começar

- Os UCs RE04 e RE05 devem ter sido executados (3 laudos na tabela).
- Pelo menos o Recurso Técnico deve estar com status "Revisão".

---

### Cenário 1 — Submissão do Recurso Técnico

---

### Passo 1 — Abrir o editor do Recurso Técnico

**O que fazer:** Na tabela de laudos, localize o Recurso Técnico (contra Labtest Diagnóstica). Clique no ícone de olho (Eye) para abrir o editor.

---

### Passo 2 — Clicar "Submeter no Portal"

**O que fazer:** No editor do laudo, clique no botão "Submeter no Portal". Um modal de submissão assistida vai abrir.

**O que você vai ver no modal:**

| Seção | Verificação |
|---|---|
| Dados da Petição | Badge "RECURSO", edital e subtipo "Técnico" corretos |
| Validação Pré-Envio | 6 validações devem passar (tamanho, formato, prazo, seção jurídica, seção técnica, assinatura) |
| Resultado da validação | "Todas as validações passaram" |

---

### Passo 3 — Verificar checklist e exportar

**O que fazer:**
1. Verifique que os 6 checkboxes da validação estão marcados
2. Clique em "Exportar PDF" → download do PDF
3. Clique em "Abrir Portal ComprasNet" → nova aba abre com link do portal gov.br

---

### Passo 4 — Registrar protocolo

**O que fazer:** Após o upload manual no portal (simulado), preencha o campo de Protocolo e registre a submissão.

**Dados a informar:**

| Campo | Valor |
|---|---|
| Protocolo | `PNCP-2026-RP3X-REC-001` |

**O que fazer em seguida:** Clique em "Registrar Submissão".

**O que acontece depois:** Mensagem "SUBMETIDO COM SUCESSO" aparece. Clique em "Fechar" para fechar o modal.

---

### Verificações pós-submissão do Recurso Técnico

| Verificação | Resultado esperado |
|---|---|
| Status do laudo na tabela | "Protocolado" (badge info) |
| Protocolo salvo | PNCP-2026-RP3X-REC-001 |

---

### Cenário 2 — Submissão da Contra-Razão

---

### Passo 5 — Abrir a Contra-Razão e submeter

**O que fazer:**
1. Na tabela de laudos, localize a Contra-Razão (contra Wama). Clique no ícone Eye para abrir o editor.
2. Verifique que o card exibe "Editando: ... Contra-Razão (Técnico)".
3. Clique em "Enviar para Revisão" → status muda para "Revisão".
4. Clique em "Submeter no Portal" → modal abre.
5. Verifique o Badge "CONTRA-RAZÃO".
6. Clique em "Exportar DOCX" → download do arquivo.
7. Preencha o Protocolo: `PNCP-2026-RP3X-CRA-001`
8. Clique em "Registrar Submissão" → "SUBMETIDO COM SUCESSO".

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- Duas submissões realizadas na mesma sessão (Recurso + Contra-Razão) com protocolos diferentes
- Recurso Técnico: status "Protocolado", protocolo `PNCP-2026-RP3X-REC-001`
- Contra-Razão: status "Protocolado", protocolo `PNCP-2026-RP3X-CRA-001`
- Todas as 6 validações pré-envio passaram em ambas as submissões
- PDFs e/ou DOCX exportados com sucesso

**Sinais de problema:**
- Modal de submissão não abre
- Validações pré-envio falham (checkbox desmarcado)
- Botão "Registrar Submissão" desabilitado
- Protocolo não é salvo
- Status não muda para "Protocolado"
- Portal ComprasNet não abre em nova aba

---

# FASE 3 — FOLLOWUP DE RESULTADOS

---

## [UC-FU01] Registrar Resultado de Edital

> **O que este caso de uso faz:** Após o encerramento do processo licitatório, você registra o resultado final — se a empresa venceu (Vitória) ou perdeu (Derrota). Isso alimenta as estatísticas do sistema (taxa de sucesso, valores acumulados) e permite análise histórica. Neste conjunto, serão registrados dois resultados: uma Vitória e uma Derrota.

**Onde:** Menu lateral → Followup → aba Resultados
**Quanto tempo leva:** 10 a 15 minutos (2 resultados a registrar)

---

### Antes de começar

- Certifique-se de estar logado com `valida2@valida.com.br` e empresa RP3X ativa.
- Os editais das Sprints anteriores devem estar salvos no sistema.

---

### Passo 1 — Navegar até a página de Followup

**O que fazer:** No menu lateral à esquerda, clique na opção "Followup". Isso abre a tela de Acompanhamento de Resultados.

**O que você vai ver na tela:** Uma página com abas (Resultados, Alertas) e stat cards (Vitórias, Derrotas, Taxa de Sucesso, etc.).

---

### Cenário 1 — Registrar Vitória (reagentes hematológicos)

---

### Passo 2 — Selecionar edital e registrar vitória

**O que fazer:** Localize o edital de reagentes hematológicos na tabela de editais pendentes. Clique em "Registrar Resultado" (ou ícone equivalente).

**Dados a informar no modal:**

| Campo | Valor |
|---|---|
| Tipo | `Vitória` |
| Valor Final (R$) | `142.500,00` |
| Observações | `Recurso técnico contra Labtest Diagnóstica foi deferido pela comissão. Proposta RP3X/Sysmex XN aceita integralmente. Contrato de fornecimento com entregas mensais fracionadas por 12 meses. Cadeia fria garantida com transportadora especializada.` |

**O que acontece depois:** Clique em "Salvar" (ou "Registrar"). O edital sai da tabela de Pendentes e aparece em Resultados Registrados.

---

### Passo 3 — Verificar resultado da vitória

| Verificação | Resultado esperado |
|---|---|
| Edital sai da tabela Pendentes | Sim |
| Edital aparece em Resultados Registrados | Badge "Vitória" (verde) |
| Stat Cards atualizados | Vitórias incrementado, Taxa de Sucesso recalculada |

---

### Cenário 2 — Registrar Derrota (kit diagnóstico)

---

### Passo 4 — Selecionar segundo edital e registrar derrota

**O que fazer:** Localize o edital de kit diagnóstico laboratorial (segundo edital salvo). Clique em "Registrar Resultado".

**Dados a informar no modal:**

| Campo | Valor |
|---|---|
| Tipo | `Derrota` |
| Valor Final (R$) | `38.200,00` |
| Empresa Vencedora | `Wama Diagnóstica Ltda.` |
| Motivo da Derrota | `Preço` |
| Observações | `Proposta RP3X ficou 12% acima do preço da Wama. Reagentes de glicose possuem margem apertada no mercado. Wama ofertou kit sem controle de qualidade incluso, reduzindo preço unitário. Avaliar ajuste de markup para próximos certames de bioquímica.` |

**O que acontece depois:** Clique em "Salvar". O edital aparece em Resultados Registrados com badge "Derrota".

---

### Passo 5 — Verificar resultado da derrota

| Verificação | Resultado esperado |
|---|---|
| Edital em Resultados Registrados | Badge "Derrota" (vermelho) |
| Empresa Vencedora registrada | "Wama Diagnóstica Ltda." |
| Motivo | "Preço" |
| Stat Cards | Derrotas incrementado, Taxa de Sucesso recalculada |

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- Vitória registrada: edital de reagentes, R$ 142.500,00, badge verde
- Derrota registrada: edital de kit diagnóstico, R$ 38.200,00, badge vermelho, motivo "Preço"
- Stat Cards recalculados com ambos os resultados (Vitórias + Derrotas + Taxa de Sucesso)
- Empresa Vencedora "Wama Diagnóstica Ltda." no registro de derrota

**Sinais de problema:**
- Edital não aparece na tabela de pendentes
- Modal de resultado não abre
- Stat Cards não atualizam após registro
- Campo "Empresa Vencedora" não disponível no cenário de Derrota
- Badge de tipo (Vitória/Derrota) não exibido

---

## [UC-FU02] Configurar Alertas de Vencimento

> **O que este caso de uso faz:** Após registrar uma vitória (contrato assinado), o sistema monitora as datas de vencimento de contratos e ARPs (Atas de Registro de Preço). Alertas são classificados por urgência: Crítico (<7 dias), Urgente (7-15 dias), Atenção (15-30 dias) e Normal (>30 dias). Para reagentes com cadeia fria (2-8°C), o monitoramento de vencimento é especialmente crítico.

**Onde:** Menu lateral → Followup → aba Alertas
**Quanto tempo leva:** 5 a 10 minutos

---

### Passo 1 — Acessar a aba Alertas

**O que fazer:** Na página de Followup, clique na aba "Alertas".

**O que você vai ver na tela:** Summary cards no topo (Total, Crítico, Urgente, Atenção, Normal) e uma tabela de vencimentos abaixo.

---

### Passo 2 — Verificar summary cards

**Summary cards esperados:**

| Card | Valor esperado |
|---|---|
| Total | >= 1 (depende de contratos/ARPs cadastrados) |
| Crítico (<7d) | 0 ou mais |
| Urgente (7-15d) | 0 ou mais |
| Atenção (15-30d) | 0 ou mais |
| Normal (>30d) | >= 1 (contrato de reagentes recém-registrado) |

---

### Passo 3 — Verificar tabela de vencimentos

**Dados esperados (após vitória registrada no UC-FU01):**

| Tipo | Nome | Data | Urgência esperada |
|---|---|---|---|
| contrato | Contrato de reagentes hematológicos — RP3X/Sysmex XN | (12 meses após data do edital) | Normal (verde, >30d) |
| arp | ARP de reagentes bioquímicos (se existir) | (conforme registro) | Variável |

---

### Passo 4 — Verificar regras de alerta

**O que fazer:** Verifique se existe uma tabela de regras de alerta com colunas para 30d, 15d, 7d, 1d, Email, Push e Ativo.

| Verificação | Resultado esperado |
|---|---|
| Tabela de regras | Exibe regras com colunas 30d, 15d, 7d, 1d, Email, Push, Ativo |
| Se sem regras | Mensagem "Nenhuma regra configurada..." |
| Botão "Atualizar" | Recarrega dados da tabela |

---

### Passo 5 — Cenário de borda: sem vencimentos

| Verificação | Resultado esperado |
|---|---|
| Se nenhum vencimento cadastrado | Mensagem "Nenhum vencimento nos próximos 90 dias" |

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- Summary cards exibidos com valores numéricos
- Tabela de vencimentos com pelo menos 1 registro (contrato de reagentes)
- Urgência classificada corretamente por cores (vermelho, amarelo, verde)
- Regras de alerta visíveis ou mensagem de "Nenhuma regra configurada"

**Sinais de problema:**
- Summary cards todos zerados após registro de vitória
- Tabela de vencimentos vazia quando deveria ter dados
- Urgência não calculada corretamente
- Botão "Atualizar" não recarrega dados

---

## [UC-FU03] Score Logístico

> **O que este caso de uso faz:** O Score Logístico avalia a viabilidade de entrega da empresa para cada edital, considerando distância, prazo de entrega e capacidade produtiva. Para a RP3X (distribuidora de reagentes em Ribeirão Preto/SP), o score considera especificamente a logística de cadeia fria (2-8°C) e entregas fracionadas mensais, que são críticos para reagentes mas não para equipamentos.

**Onde:** Menu lateral → Followup → Card Stat "Score Logístico"
**Quanto tempo leva:** 3 a 5 minutos

---

### Passo 1 — Verificar o score logístico

**O que fazer:** Na página de Followup, localize o card stat "Score Logístico".

**Componentes do score para reagentes:**

| Componente | Valor esperado | Justificativa |
|---|---|---|
| Distância | Média-Alta | RP3X em Ribeirão Preto/SP — distância média para órgãos estaduais/municipais de SP, maior para outros estados |
| Prazo de entrega | Alto | 15 dias de prazo máximo configurado, adequado para a maioria dos certames |
| Capacidade produtiva | Alto | Distribuidora com estoque de reagentes — não fabrica, revende com estoque |

---

### Passo 2 — Interpretar o score

**Faixas de interpretação para reagentes:**

| Faixa | Significado |
|---|---|
| 80-100 | Alta viabilidade — entrega fácil, estoque disponível, cadeia fria controlada |
| 60-79 | Viabilidade média — pode exigir transportadora terceirizada para cadeia fria |
| 40-59 | Viabilidade baixa — distância grande, risco de ruptura de cadeia fria |
| < 40 | Inviável — logística de cadeia fria comprometida, custo de frete alto |

---

### ✅ Resultado Final

**O que o validador deve conferir:**
- Score numérico exibido com valor entre 0 e 100 (ou "N/A" se sem dados)
- Componentes visíveis: Distância, Prazo, Capacidade
- Score complementa a decisão GO/NO-GO da ValidaçãoPage
- Interpretação coerente com o perfil da RP3X (distribuidora de reagentes em Ribeirão Preto/SP)

**Sinais de problema:**
- Score não exibido ou sempre "N/A"
- Componentes não detalhados
- Score incoerente com o perfil logístico da empresa (ex: distância "Baixa" para entregas interestaduais)

---

## Resumo de Verificações por UC

| UC | O que verificar | Resultado esperado |
|---|---|---|
| UC-I01 | Validação Legal do edital de reagentes | Tabela com >= 3 inconsistências; badges ALTA/MÉDIA/BAIXA; sugestões Impugnação/Esclarecimento; questões de platform lock-in, shelf-life, cadeia fria, AFE |
| UC-I02 | Criar Esclarecimento + Impugnação | 2 petições na tabela; tipos distintos; Status "Rascunho"; conteúdo sobre AFE e restrição de plataforma |
| UC-I03 | Gerar petição via IA, editar, exportar PDF | IA gera seções completas (Qualificação, Fatos, Direito, Jurisprudências, Pedido); texto editável; shelf-life adicionado; PDF exportado |
| UC-I04 | Upload de petição externa (PDF) | 3 petições na tabela (2 criadas + 1 upload); tipo e status corretos |
| UC-I05 | Tabela de prazos de impugnação | Editais com prazos calculados (3d úteis); badges de urgência coloridos; reagentes e kits simultâneos |
| UC-RE01 | Monitoramento de janela de recurso | WhatsApp e Email ativos, Alerta desmarcado; status "Aguardando" ou "JANELA ABERTA"; intenção registrada |
| UC-RE02 | Análise da proposta da Labtest | 5 inconsistências: plataforma, shelf-life, prazo, comodato, ANVISA; badges de gravidade corretos |
| UC-RE03 | Chatbox com 5 perguntas | 5 perguntas/respostas; histórico cumulativo; respostas sobre plataforma, shelf-life, comodato, AFE, risco |
| UC-RE04 | 2 laudos de recurso (Técnico + Administrativo) | Seções jurídica e técnica; Empresa Alvo preenchida e vazia; subtipos distintos |
| UC-RE05 | Contra-razão contra Wama Diagnóstica | Seções DEFESA e ATAQUE; argumento de equivalência analítica e ISO 15189; exportação DOCX |
| UC-RE06 | 2 submissões (Recurso + Contra-Razão) | Validações pré-envio OK; protocolos PNCP-2026-RP3X-REC-001 e CRA-001; status "Protocolado" |
| UC-FU01 | Vitória (R$ 142.500) + Derrota (R$ 38.200) | Badges verde/vermelho; motivo "Preço"; Wama vencedora; Stat Cards recalculados |
| UC-FU02 | Alertas de vencimento de contratos | Summary cards; tabela de vencimentos com contrato de reagentes; regras de alerta |
| UC-FU03 | Score Logístico para reagentes | Score 0-100; componentes Distância/Prazo/Capacidade; interpretação cadeia fria |

---

## O que reportar se algo falhar

Se durante a validação você encontrar algo diferente do esperado, relate com as seguintes informações para facilitar a correção:

**1. Qual UC falhou?**
Exemplo: "UC-RE02, Passo 3"

**2. O que você esperava ver?**
Exemplo: "A tabela deveria mostrar 5 inconsistências da proposta da Labtest"

**3. O que apareceu em vez disso?**
Exemplo: "Nenhuma inconsistência foi identificada e a tela ficou vazia"

**4. Alguma mensagem de erro apareceu?**
Se sim, copie o texto exato da mensagem ou tire um print da tela.

**5. Em qual passo você estava?**
Exemplo: "Acabei de colar a proposta da Labtest e clicar em Analisar"

**6. O problema aparece toda vez que você tenta, ou só aconteceu uma vez?**
Se aconteceu só uma vez, tente repetir o passo para confirmar se é consistente.

---

> **Dica final:** Faça os UCs na ordem apresentada neste tutorial. A sequência recomendada é: UC-I01 (analisar edital) → UC-I02 (criar esclarecimento e impugnação) → UC-I03 (gerar petição via IA) → UC-I04 (upload petição) → UC-I05 (verificar prazos) → UC-RE01 (ativar monitoramento) → UC-RE02 (analisar proposta Labtest) → UC-RE03 (chatbox com 5 perguntas) → UC-RE04 (dois recursos: Técnico + Administrativo) → UC-RE05 (contra-razão Wama) → UC-RE06 (submeter Recurso + Contra-Razão) → UC-FU01 (registrar Vitória + Derrota) → UC-FU02 (alertas de vencimento) → UC-FU03 (score logístico). Os UCs de Impugnação (I01–I05) devem ser feitos antes dos de Recursos (RE01–RE06), e estes antes do Followup (FU01–FU03), pois os dados são cumulativos.
