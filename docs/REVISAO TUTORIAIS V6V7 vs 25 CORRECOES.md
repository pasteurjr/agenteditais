# Revisão dos tutoriais V6/V7 vs as 25 correções aplicadas

**Data:** 08/05/2026
**Tutoriais analisados:**
- `docs/tutorialsprint1-2 V6.md` (Bio-Hosp/MG) — versão que Arnaldo testou em 06/05
- `docs/tutorialsprint1-3 V6.md` (Vita-Sense/PR) — idem
- `docs/tutorialsprint1-2 V7.md` (Bio-Hosp/MG) — versão "atualizada" com CHANGELOG no início
- `docs/tutorialsprint1-3 V7.md` (Vita-Sense/PR) — idem

## Diagnóstico geral

V7 adicionou um **CHANGELOG no início** listando as 25 correções, mas **NÃO atualizou o corpo dos passos** dos UCs. Isso significa:

- ✅ Validador que LER o CHANGELOG sabe o que mudou
- ❌ Validador que ir direto pro passo a passo não vê instruções específicas das correções
- ❌ Os "✅ Correto se" e "❌ Problema se" continuam descrevendo o comportamento ANTIGO em alguns casos

Resumindo: **V7 ≠ V6 só num resumo no topo**. O passo-a-passo é idêntico.

---

# Pontos a atualizar nos tutoriais

## Tutorial 1-2 (Bio-Hosp/MG) — UC-F01 Cadastro Empresa

### ⚠ Linha 213 e tabela linha 217-223 (Passo 2 — Dados principais)

**Problema:** lista campos como "Razão Social, Nome Fantasia, CNPJ, Inscrição Estadual e Website" sem indicar quais são obrigatórios. Não menciona F01-02 (IE asterisco vermelho).

**Correção sugerida:**
```diff
- **O que você vai ver na tela:** Campos de texto em branco (...). Os campos
-  geralmente são: Razão Social, Nome Fantasia, CNPJ, Inscrição Estadual e Website.
+ **O que você vai ver na tela:** Campos de texto em branco. Os campos obrigatórios
+  têm asterisco vermelho (*): Razão Social*, CNPJ*, Inscrição Estadual* (V7).
+  Campos opcionais: Nome Fantasia, Website.

  | Campo | Valor |
  |---|---|
- | Razão Social | `Bio-Hosp Equipamentos Hospitalares Ltda.` |
+ | Razão Social * | `Bio-Hosp Equipamentos Hospitalares Ltda.` |
  | Nome Fantasia | `Bio-Hosp` |
- | CNPJ | `33.014.556/0001-96` |
+ | CNPJ * | `33.014.556/0001-96` (V7: vai ficar read-only após o primeiro Save) |
- | Inscrição Estadual | `062.118.443.0078` |
+ | Inscrição Estadual * | `062.118.443.0078` (V7: agora obrigatório) |
  | Website | `https://biohosp.com.br` |
```

**Cobre:** F01-02 (IE asterisco), F01-04 (CNPJ readonly).

---

### ⚠ Linha 261 e tabela linha 263-270 (Passo 4 — Endereço)

**Problema:** tutorial lista apenas 4 campos de endereço (Logradouro, Cidade, UF, CEP). V7 do produto tem **7 campos estruturados** (CEP, Logradouro, Número, Complemento, Bairro, Cidade, UF).

**Correção sugerida:**
```diff
- **O que você vai ver na tela:** Campos de Logradouro, Complemento (ou Conjunto),
-  Cidade, UF (Estado) e CEP.
+ **O que você vai ver na tela (V7):** Endereço estruturado em 7 campos:
+   1. CEP — campo principal; ao digitar e sair, o sistema preenche
+      automaticamente Logradouro/Bairro/Cidade/UF (via ViaCEP).
+   2. Logradouro — Rua/Avenida (preenchido automaticamente)
+   3. Número — só dígitos (preenchimento manual)
+   4. Complemento — Sala/Andar/Bloco (opcional)
+   5. Bairro — preenchido automaticamente
+   6. Cidade — preenchido automaticamente
+   7. UF — preenchido automaticamente (dropdown)

  | Campo | Valor |
  |---|---|
+ | CEP | `30380-457` (preenche os abaixo automaticamente) |
- | Logradouro / Endereço | `Avenida Raja Gabaglia, 1781 — Sala 304` |
+ | Logradouro | `Avenida Raja Gabaglia` (auto-preenchido) |
+ | Número | `1781` |
+ | Complemento | `Sala 304` |
+ | Bairro | `Estoril` (auto-preenchido) |
  | Cidade | `Belo Horizonte` (auto-preenchido) |
  | UF | `MG` (auto-preenchido) |
- | CEP | `30380-457` |
```

**Cobre:** F01-07 (4 campos novos endereço estruturado).

---

### ⚠ Após Passo 5.5 (linha 311) — falta passo 6 V7: confirmar CNPJ readonly

**Problema:** tutorial não pede ao validador conferir que CNPJ ficou disabled após salvar.

**Correção sugerida (adicionar passo novo):**
```diff
+ ### Passo 6 — V7: Confirmar que CNPJ ficou read-only
+
+ **O que fazer:** Após F5 (Passo 5.5), clique no campo CNPJ.
+
+ **O que você vai ver na tela:** O campo CNPJ está esmaecido (cinza),
+  cursor não muda para "I-beam" ao passar por cima, e abaixo do campo aparece
+  o texto: *"CNPJ é a chave fiscal da empresa e não pode ser alterado.
+  Para cadastrar outra empresa, use 'Selecionar Empresa → Nova Empresa'."*.
+
+ ✅ **Correto se:** CNPJ não permite digitação E o aviso explicativo aparece.
+ ❌ **Problema se:** Você consegue editar o CNPJ.
+
+ **Cobre:** F01-04.
```

---

## Tutorial 1-2 — Sidebar Configurações

### ⚠ Não há passo dedicado a F01-08 (sidebar lembra preferência)

**Correção sugerida (passo novo após UC-F01):**
```diff
+ ### Passo intermediário V7 — Sidebar lembra preferência
+
+ **O que fazer:**
+ 1. Clique no menu lateral expandindo "Cadastros" e "Configurações"
+ 2. Pressione F5 (recarregar a página)
+
+ **O que você vai ver na tela (V7):** Após o reload, as seções "Cadastros" e
+  "Configurações" continuam abertas — o sistema lembra a preferência do navegador.
+
+ ✅ **Correto se:** Após F5, as seções abertas antes continuam abertas.
+ ❌ **Problema se:** Todas as seções voltam fechadas após F5.
+
+ **Cobre:** F01-08.
```

---

## Tutorial 1-2 — UC-F03 Documentos

### ⚠ Linha ~510 (Passo 2 Documento 1) — comportamento de badges

**Problema:** texto diz "indicador AMARELO indicando que está prestes a vencer ou acabou de vencer" — mistura **Vence** (amarelo) com **Vencido** (vermelho). V7 distingue 4 estados.

**Correção sugerida:**
```diff
  📌 **Atenção:** A data `30/06/2026` é praticamente hoje (1º de abril de 2026).
- O sistema deve exibir este documento com um indicador de alerta — geralmente
- um badge ou ícone AMARELO, indicando que está prestes a vencer ou acabou de vencer.
- Isso é o comportamento esperado e correto.
+ O sistema (V7) distingue **4 estados** com cores diferentes:
+   • Verde (OK) — vence em mais de 30 dias
+   • Amarelo (Vence) — vence em até 30 dias
+   • Vermelho (Vencido) — data já passou
+   • Cinza (Falta envio) — documento sem PDF cadastrado
+ Este documento (validade 30/06/2026) deve aparecer com badge VERMELHO se
+ a data atual já passou, ou AMARELO se faltam menos de 30 dias.
```

**Cobre:** F03-01 (4 estados de badge).

---

## Tutorial 1-2 — UC-F04 Certidões

### ⚠ Não menciona coluna "Fonte" / badge Ativa-Inativa (F04-03)

**Correção sugerida (adicionar trecho na seção de visualização da lista):**
```diff
+ **V7:** Cada certidão na lista mostra na coluna **Fonte** um badge:
+   • Verde "Ativa" — fonte cadastrada para essa certidão e habilitada
+   • Cinza "Inativa" — fonte cadastrada mas desligada (não vai buscar automaticamente)
```

**Cobre:** F04-03.

---

### ⚠ Não menciona botões individuais por linha (F04-04)

**Correção sugerida:**
```diff
+ **V7 — Botões por certidão (não mais geral):**
+ Cada linha da tabela tem botões individuais:
+   • "Buscar agora" (esta certidão específica)
+   • "Editar dados" (número, validade, órgão)
+   • "Fazer upload manual do PDF"
+   • "Baixar PDF"
+ Esses botões agem apenas na certidão da linha — antes era um botão único
+ que acionava busca em todas.
```

**Cobre:** F04-04.

---

### ⚠ Não menciona tooltips explicativos (F04-05)

**Correção sugerida:**
```diff
+ **V7 — Tooltips:** Passe o mouse sobre cada ícone na coluna "Ações" — aparecerá
+ uma explicação descritiva (ex: "Editar dados da certidão (número, validade,
+ órgão emissor)"). Antes os ícones não tinham descrição clara.
```

**Cobre:** F04-05.

---

### ⚠ Não menciona filtro automático por UF (F04-01)

**Correção sugerida (no Passo 0 — verificar fontes):**
```diff
+ **V7 — Filtro por UF:** A lista de fontes em "Cadastros → Empresa → Fontes
+ de Certidões" agora mostra apenas:
+   • Fontes federais (UF = NULL): aparecem para qualquer empresa
+   • Fontes estaduais: APENAS da UF da empresa atual
+ Como Bio-Hosp é MG, você verá SEFAZ-MG, Pref. Belo Horizonte, etc.
+ NÃO verá SEFAZ-PR, SEFAZ-SP, Pref. Curitiba, etc.
```

**Cobre:** F04-01.

---

### ⚠ Não menciona magic bytes %PDF (F04-07)

**Correção sugerida (adicionar na seção de upload manual):**
```diff
+ **V7 — Validação de arquivo:** O sistema verifica que o arquivo é realmente
+ um PDF (lendo os primeiros bytes). Se você tentar enviar um arquivo que tem
+ extensão .pdf mas é HTML/imagem disfarçada, o sistema rejeita com mensagem
+ clara: *"O arquivo enviado não é um PDF válido. Verifique se você selecionou
+ o arquivo correto."*
```

**Cobre:** F04-07.

---

### ⚠ Não menciona prevalência da validade do PDF (F04-06)

**Correção sugerida:**
```diff
+ **V7 — Validade prevalece do PDF:** Quando você sobe um PDF e digita uma
+ data de validade, o sistema EXTRAI a data do PDF via IA. Se as datas
+ divergirem, a data do PDF prevalece (mais confiável — vem do documento
+ oficial). O sistema avisa: *"A validade extraída do PDF (DD/MM/AAAA)
+ prevaleceu sobre a digitada."*
```

**Cobre:** F04-06.

---

## Tutorial 1-2 — UC-F05 Responsáveis

### ⚠ Linha 838: "Empresa → Responsáveis"

**Problema:** Nome do submenu mudou.

**Correção sugerida:**
```diff
- **Onde:** Menu lateral → Empresa → Responsáveis
+ **Onde:** Menu lateral → Cadastros → Empresa → **Responsáveis e Representantes** (V7)
```

**Cobre:** F05-01.

---

### ⚠ Tabelas de campos do form Responsável (linhas 871, 891) — não incluem 3 campos novos

**Correção sugerida:**
```diff
  | Campo | Valor |
  |---|---|
  | Tipo | `Representante Legal` |
  | Nome | `Mariana Andrade Silveira` |
  | Cargo | `Sócia-Diretora` |
  | Email | `fernanda.costa@biohosp.com.br` |
  | Telefone | `(31) 99654-7821` |
  | CPF | `845.612.339-58` |
+ | Validade do mandato/procuração (V7) | `15/12/2027` |
+ | Documento de outorga (descrição) (V7) | `Procuração 2026 cláusula 5` |
+ | Caminho/URL do documento (PDF) (V7) | qualquer PDF de docs/documentos_sintetizados/ |
```

**Cobre:** F05-02, F05-03.

---

## Tutorial 1-2 — UC-F02 Portfolio + UC-F13 Áreas/Classes

### ⚠ Não menciona aba "Cadastro por IA" no Portfolio (F02-03)

**Correção sugerida (UC-F06+ ou seção dedicada):**
```diff
+ ### Passo V7 — Upload em Massa por IA (NOVO)
+
+ **Onde:** Menu lateral → Configurações → Portfolio → aba **"Cadastro por IA"**
+
+ **O que fazer:**
+ 1. Selecione a aba "Cadastro por IA" (no topo da página de Portfolio)
+ 2. Arraste vários PDFs/DOCX na zona de drop ("Arraste catálogos, manuais...")
+ 3. A IA classifica cada arquivo (catálogo, manual, registro ANVISA) e extrai
+    nome do produto, fabricante, modelo
+ 4. Você revisa cada item e marca aceite individualmente
+ 5. Salvar
+
+ ✅ **Correto se:** A aba "Cadastro por IA" existe + dropzone aceita múltiplos
+    arquivos + IA mostra classificação preliminar antes de salvar.
+
+ **Cobre:** F02-03.
```

---

### ⚠ UC-F13 não menciona rejeição de duplicatas (F13-01)

**Correção sugerida:**
```diff
+ **V7 — Áreas/Classes únicas:** Se você tentar cadastrar uma área (ou classe)
+ com o mesmo nome de uma já existente NA MESMA EMPRESA, o sistema rejeita
+ com mensagem amigável: *"Já existe uma Área com este nome nesta empresa.
+ Áreas devem ser únicas — use Subclasses para variações."*
+
+ Para testar: cadastre uma área "Equipamentos Médico-Hospitalares". Tente
+ cadastrar de novo com mesmo nome — deve dar erro amigável (não erro técnico
+ de banco).
```

**Cobre:** F13-01.

---

## Cursor mãozinha (F02-02) e Vincular sem re-login (F01-03)

Esses são comportamentos transversais — não precisam de passo dedicado, mas valem **menção no CHANGELOG do tutorial** (já existe em V7 linhas 24, 41) **e** uma "✅ verificação visual" no início:

```diff
+ ### Verificações visuais V7 (transversais — todos os UCs)
+
+ Antes de começar os UCs, confira:
+ 1. **Cursor "mãozinha":** passe o mouse sobre qualquer botão azul da tela
+    inicial — deve virar mãozinha (cursor:pointer). Botões cinza-claro
+    desabilitados viram cursor "proibido".
+ 2. **Vincular empresa sem re-login:** se for cadastrar empresa nova
+    via Cadastros > Associar Empresa/Usuario, NÃO precisa fazer logout
+    pra ver a empresa nova na lista. A lista atualiza automaticamente.
+
+ **Cobre:** F02-02, F01-03.
```

---

## Aceite IA + auditoria (F03-03)

Esse não tem fluxo dedicado nos tutoriais — é transversal a UC-F03/F06/F07 (qualquer tela com extração IA).

**Correção sugerida (no início do UC-F03 e UC-F06+):**
```diff
+ **V7 — Aceite IA explícito:** Em qualquer tela onde a IA preenche dados
+ automaticamente, antes de salvar você precisa marcar o checkbox
+ **"Aceito os dados extraídos pela IA"**. Esse aceite é registrado em
+ trilha de auditoria (tabela `auditoria_aceite_ia`) — protege legalmente
+ a empresa e o usuário em caso de auditoria.
+
+ Sem marcar o aceite, o botão "Salvar" fica desabilitado.
```

**Cobre:** F03-03.

---

## F02-01 (ordem F02 → F13) e F01-01/06 (Upload IA cadastro)

### F02-01 — JÁ ATENDIDO em V7 (CHANGELOG + nota explicativa linha 346-355)

V7 já tem nota detalhada explicando a ordem. Pode permanecer. Apenas mover ou destacar mais cedo no documento ajuda.

### F01-01/06 — Parcialmente atendido

V7 menciona em CHANGELOG "Em desenvolvimento — drag-and-drop de pasta com IA classificando arquivos". Mas o componente está **plugado e funcional** em EmpresaPage e PortfolioPage. Atualizar o CHANGELOG:

```diff
- > **Features grandes (entregue parcialmente, ver F01-01/06 + F02-03 + F03-02 — Upload em massa por IA):**
- > - Em desenvolvimento — drag-and-drop de pasta com IA classificando arquivos automaticamente. Ainda não está no fluxo do tutorial.
+ > **Features grandes ENTREGUES (F01-01/06 + F02-03 + F03-02 — Upload em massa por IA):**
+ > - **Cadastro Automático por IA — envie contrato social** (EmpresaPage, quando empresa nova)
+ > - **Cadastro Automático de Documentos por IA** (EmpresaPage, quando empresa salva)
+ > - **Upload em Lote por IA (NOVO)** (PortfolioPage, aba Cadastro por IA)
+ > Componentes plugados e validados pelos UC-ARN-01/06/11/13.
```

**Cobre:** F01-01, F01-06, F02-03, F03-02.

---

# Resumo executivo da revisão

| Obs Arnaldo | Status no tutorial V6 | Status no tutorial V7 | Ação necessária |
|---|---|---|---|
| **F01-01** | Não menciona | Menciona em CHANGELOG (mas diz "em desenvolvimento") | **Atualizar CHANGELOG** + adicionar passo opcional |
| **F01-02** (IE asterisco) | Não menciona | CHANGELOG menciona; corpo NÃO indica | **Atualizar Passo 2 UC-F01** + tabela de campos |
| **F01-03** (sem re-login) | Não menciona | CHANGELOG menciona | **Adicionar nota nas verificações iniciais** |
| **F01-04** (CNPJ readonly) | Não menciona | CHANGELOG menciona; corpo NÃO valida | **Adicionar Passo 6 V7** após Passo 5.5 |
| **F01-05** (sidebar labels) | Já OK (labels curtos) | Idem | **Nenhuma** |
| **F01-06** (UploadLote docs) | Não menciona | CHANGELOG diz "em desenvolvimento" | **Atualizar CHANGELOG** + passo opcional |
| **F01-07** (4 campos endereço) | Endereço com 4 campos antigos | Idem (não atualizado) | **Reescrever Passo 4 UC-F01** |
| **F01-08** (sidebar localStorage) | Não menciona | CHANGELOG menciona; corpo NÃO valida | **Adicionar passo intermediário V7** |
| **F02-01** (ordem F02→F13) | Não explica | V7 explica linha 346-355 | **Nenhuma — V7 já cobre** |
| **F02-02** (cursor pointer) | Não menciona | CHANGELOG menciona | **Adicionar verificação transversal** |
| **F02-03** (UploadLote portfolio) | Não menciona | CHANGELOG diz "em desenvolvimento" | **Atualizar CHANGELOG + passo dedicado** |
| **F03-01** (4 status badge) | Mistura "vence/vencido" | Idem (não atualizado) | **Atualizar Passo 2-5 UC-F03** |
| **F03-02** (UploadLote docs IA) | Não menciona | CHANGELOG diz "em desenvolvimento" | **Atualizar CHANGELOG** |
| **F03-03** (aceite IA + log) | Não menciona | CHANGELOG menciona | **Adicionar nota transversal** UC-F03/F06+ |
| **F04-01** (filtro UF) | Não menciona | CHANGELOG menciona | **Adicionar nota Passo 0** UC-F04 |
| **F04-02** (label credencial) | Texto antigo no V6 | Idem (não atualizado) | **Atualizar texto** quando mostra form Novo |
| **F04-03** (coluna Fonte) | Não menciona | CHANGELOG menciona | **Adicionar nota lista certidões** |
| **F04-04** (botão individual) | Não menciona | CHANGELOG menciona | **Adicionar trecho** sobre botões por linha |
| **F04-05** (tooltips) | Não menciona | CHANGELOG menciona | **Adicionar nota** |
| **F04-06** (validade PDF prevalece) | Não menciona | CHANGELOG menciona | **Adicionar nota** upload manual |
| **F04-07** (magic bytes) | Não menciona | CHANGELOG menciona | **Adicionar nota** upload manual |
| **F04-08** (CRF FGTS path) | Não menciona | CHANGELOG menciona | **Nenhuma — invisível ao tester** |
| **F05-01** (submenu nome) | "Empresa → Responsáveis" | Idem (não atualizado) | **Atualizar linha 838** |
| **F05-02** (validade mandato) | Não menciona | CHANGELOG menciona; tabelas NÃO incluem | **Atualizar tabela campos UC-F05** |
| **F05-03** (doc outorga) | Não menciona | Idem | **Atualizar tabela campos UC-F05** |
| **F13-01** (UNIQUE area) | Não menciona | CHANGELOG menciona | **Adicionar passo de validação UC-F13** |

---

# Veredicto

**É necessário atualizar os tutoriais.** O CHANGELOG do V7 lista as mudanças mas o **passo a passo continua descrevendo a UI antiga em vários pontos críticos**:

1. UC-F01 Passo 2 — não marca campos obrigatórios
2. UC-F01 Passo 4 — endereço com 4 campos antigos (deveria ser 7)
3. UC-F03 Passos 2-5 — confunde "vence/vencido"
4. UC-F04 — não menciona coluna Fonte, botões individuais, tooltips, filtro UF, magic bytes, prevalência PDF
5. UC-F05 — submenu errado + faltam 3 campos novos no form
6. UC-F13 — não testa rejeição de duplicatas

## Recomendação

Gerar **V8** dos tutoriais com TODAS as atualizações acima. Manter V6 como histórico (era o que Arnaldo testou). V7 fica como "intermediário com CHANGELOG mas sem corpo atualizado".

Tempo estimado: ~30 min de edição cirúrgica nos 2 arquivos (V8 do tutorialsprint1-2 e tutorialsprint1-3).

---

**Documento gerado em 08/05/2026 após análise V11 (45/45 APROVADO automatico).**
