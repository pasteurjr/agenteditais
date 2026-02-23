# RESULTADOS DOS TESTES - PAGINA 2 (EMPRESA)

**Data execucao:** 2026-02-20
**Framework:** Playwright (Chromium, headless)
**Backend:** http://localhost:5007
**Frontend:** http://localhost:5175
**Empresa testada:** Aquila Diagnostico Ltda (ID: 7dbdc60a-b806-4614-a024-a1d4841dc8c9)

---

## RESULTADO FINAL: 13/13 TESTES PASSARAM (1min 48s)

---

## RESUMO

| # | Teste | Status | Detalhe |
|---|-------|--------|---------|
| T1 | Cadastro completo (13 campos + emails + celulares) | PASS | 12 campos + 2 emails + 2 celulares persistidos |
| T1b | Remover email e verificar persistencia | PASS | vendas@ removido, contato@ e celulares ok |
| T2 | Upload documento via UI (modal) | PASS | Modal com 13 tipos, 9 do WORKFLOW presentes |
| T2b | Upload 9 tipos de documentos via API | PASS | 9/9 tipos retornaram HTTP 201 |
| T2c | Download de documento | PASS | 34 documentos, download OK (HTTP 200) |
| T2d | Exclusao de documento | PASS | Excluiu com sucesso (34 -> 33 docs) |
| T3 | Busca automatica de 5 certidoes | PASS | 5 certidoes com URLs reais dos portais |
| T3b | Card Certidoes Automaticas na UI | PASS | Card visivel, tabela com certidoes |
| T4 | Adicionar responsavel via modal UI | PASS | Joao Carlos Silva adicionado com sucesso |
| T4b | Adicionar segundo + excluir responsavel | PASS | Maria Souza adicionada e depois excluida |
| T7 | Gerar classes/subclasses via IA | PASS | 22 produtos -> 3 classes, 11 subclasses |
| T10 | Verificar config SMTP | PASS | Nao configurado (esperado em dev) |
| T11 | Screenshots + verificacao geral UI | PASS | 4 cards visiveis, campos preenchidos |

---

## DETALHES POR TESTE

### TESTE 1: Cadastro completo - 13 campos + emails + celulares

**O que foi feito:**
1. Navegou ao menu CONFIGURACOES > Empresa
2. Preencheu TODOS os 13 campos do formulario:
   - Razao Social: `Aquila Diagnostico Ltda`
   - Nome Fantasia: `Aquila`
   - CNPJ: `12.345.678/0001-90`
   - Inscricao Estadual: `123.456.789.012`
   - Website: `http://aquila.com.br`
   - Instagram: `@aquila_diagnostico`
   - LinkedIn: `aquila-diagnostico-ltda`
   - Facebook: `aquiladiagnostico`
   - Endereco: `Rua das Analises, 500`
   - Cidade: `Sao Paulo`
   - UF: `SP`
   - CEP: `01310-100`
3. Adicionou 2 emails: `contato@aquila.com.br`, `vendas@aquila.com.br`
4. Adicionou 2 celulares: `(11) 99999-0001`, `(11) 98888-0002`
5. Clicou "Salvar Alteracoes"
6. Recarregou a pagina e re-navegou para Empresa
7. **VERIFICOU:** Todos os 13 campos + 2 emails + 2 celulares persistiram

**Screenshots:** tests/results/t1_01_antes.png, t1_02_campos_preenchidos.png, t1_03_com_emails_celulares.png, t1_04_apos_salvar.png, t1_05_apos_reload.png

---

### TESTE 1b: Remover email e verificar persistencia

**O que foi feito:**
1. Encontrou o email `vendas@aquila.com.br` e clicou no X
2. Salvou
3. Recarregou e verificou

**Resultado apos remocao:**
```json
["contato@aquila.com.br", "(11) 99999-0001", "(11) 98888-0002"]
```

vendas@ removido com sucesso, demais itens persistiram.

---

### TESTE 2: Upload de documento via UI

**O que foi feito:**
1. Clicou "Upload Documento" no card "Documentos da Empresa"
2. Verificou modal com select de tipos
3. Selecionou "Contrato Social" e preencheu validade 2027-12-31
4. Clicou "Enviar"

**Tipos disponiveis no select (13 total):**
Contrato Social, Procuracao, Certidao Negativa, Habilitacao Fiscal, Habilitacao Economica, Balanco Patrimonial, Qualificacao Tecnica, Atestado de Capacidade, AFE (ANVISA), CBPAD, CBPP, Corpo de Bombeiros, Outro

**9 tipos do WORKFLOW:** Todos presentes no select.

---

### TESTE 2b: Upload 9 tipos via API

| Tipo | HTTP Status | Resultado |
|------|-------------|-----------|
| contrato_social | 201 | OK |
| procuracao | 201 | OK |
| afe | 201 | OK |
| cbpad | 201 | OK |
| cbpp | 201 | OK |
| bombeiros | 201 | OK |
| habilitacao_economica | 201 | OK |
| habilitacao_fiscal | 201 | OK |
| qualificacao_tecnica | 201 | OK |

**todos_ok: true**

---

### TESTE 2c: Download de documento

- Total documentos: 34
- Download testado: sim
- HTTP 200: OK

---

### TESTE 2d: Exclusao de documento

- Documento excluido: `habilitacao_fiscal_teste.pdf`
- Antes: 34 docs, Depois: 33 docs
- Delete OK

---

### TESTE 3: Busca automatica de 5 certidoes

**Endpoint:** POST /api/empresa-certidoes/buscar-automatica

| Tipo | Status | Orgao | URL Portal |
|------|--------|-------|------------|
| cnd_federal | atualizado | Receita Federal / PGFN | https://solucoes.receita.fazenda.gov.br/... |
| cnd_estadual | atualizado | Secretaria da Fazenda - SP | https://www.sefaz.sp.gov.br |
| cnd_municipal | atualizado | Prefeitura de Sao Paulo | (sem URL padrao) |
| fgts | atualizado | Caixa Economica Federal | https://consulta-crf.caixa.gov.br/... |
| trabalhista | atualizado | Tribunal Superior do Trabalho (TST) | https://cndt-certidao.tst.jus.br/... |

**5 certidoes retornadas com sucesso**, 4 com URLs reais.

---

### TESTE 3b: Card Certidoes na UI

- Card "Certidoes Automaticas" visivel: sim
- Botao "Buscar Certidoes": existe, desabilitado ("Em breve")
- Certidoes na tabela: 41 registros

---

### TESTE 4: Adicionar responsavel via modal

1. Clicou "Adicionar" no card Responsaveis
2. Preencheu: Nome=Joao Carlos Silva, Cargo=Diretor Tecnico, Email=joao.silva@aquila.com.br, Telefone=(11) 97777-0003
3. Salvou
4. **Verificou:** "Joao Carlos Silva" aparece na tabela

---

### TESTE 4b: Adicionar segundo responsavel e excluir

1. Adicionou Maria Souza (Gerente Comercial)
2. Verificou que apareceu na tabela
3. Clicou no botao lixeira da linha Maria Souza
4. Aceitou confirmacao
5. **Verificou:** Maria removida da tabela

---

### TESTE 7: Gerar classes/subclasses via IA

**Endpoint:** POST /api/parametrizacoes/gerar-classes

```json
{
  "success": true,
  "total_produtos": 22,
  "total_classes": 3,
  "classes": [
    { "nome": "Equipamentos Medico-Hospitalares", "ncm": "9018.00.00", "subclasses": 5 },
    { "nome": "Tecnologia da Informacao e Redes", "ncm": "8471.30.00", "subclasses": 5 },
    { "nome": "Materiais e Insumos Hospitalares", "ncm": "3005.90.00", "subclasses": 1 }
  ]
}
```

22 produtos classificados em 3 classes com 11 subclasses. Tempo: ~25s.

---

### TESTE 10: Config SMTP

```json
{ "smtp_configurado": false, "smtp_host": null }
```

Esperado em ambiente de desenvolvimento.

---

### TESTE 11: Screenshots e verificacao geral

**4 cards da pagina Empresa:**
- Informacoes Cadastrais: VISIVEL
- Documentos da Empresa: VISIVEL
- Certidoes Automaticas: VISIVEL
- Responsaveis: VISIVEL

**Campos verificados apos todos os testes:**
- razao_social: Aquila Diagnostico Ltda
- cnpj: 12.345.678/0001-90
- website: http://aquila.com.br
- instagram: @aquila_diagnostico
- cidade: Sao Paulo
- uf: SP

**Screenshots:** tests/results/t11_01_pagina_completa.png, t11_02_pagina_scroll.png

---

## BUGS CORRIGIDOS DURANTE OS TESTES

### BUG 1 (CORRIGIDO): ENUM empresa_documentos.tipo

**Problema:** MySQL ENUM nao incluia 7 tipos novos (afe, cbpad, cbpp, bombeiros, habilitacao_economica, habilitacao_fiscal, qualificacao_tecnica).

**Correcao:** ALTER TABLE + models.py + normalizacao de tipo no endpoint upload.

### BUG 2 (CORRIGIDO): Colunas faltando na tabela empresas

**Problema:** Frontend esperava campos website, instagram, linkedin, facebook, emails, celulares que NAO existiam no MySQL.

**Correcao:** ALTER TABLE para adicionar 6 colunas + models.py + to_dict().

### BUG 3 (CORRIGIDO): Coluna edital_requisito_id ausente

**Problema:** FK adicionada ao modelo SQLAlchemy mas nao ao MySQL real.

**Correcao:** ALTER TABLE para adicionar coluna.

---

## TESTES PENDENTES (TESTES 5, 6, 8 do TESTEPAGINA2.md)

Os testes 5 (Fontes de Obtencao via Chat), 6 (Fontes de Busca via Chat) e 8 (Comparacao edital vs docs via Chat) requerem interacao com o agente de IA no chat lateral. Estes testes sao manuais ou via prompts no chat e nao podem ser totalmente automatizados via Playwright pois dependem de respostas da IA.

| # | Teste | Como testar |
|---|-------|-------------|
| 5.1 | Upload manual via chat | Manualmente no chat |
| 5.2 | Buscar no website via chat | Manualmente no chat |
| 5.3 | Consultar ANVISA via chat | Manualmente no chat |
| 5.4 | Listar editais via chat | Manualmente no chat |
| 6.1 | Gerar palavras-chave via chat | Manualmente no chat |
| 6.2 | Listar fontes de busca via chat | Manualmente no chat |
| 8.1 | Comparar docs vs edital via chat | Manualmente no chat |
| 8.2 | Verificar impugnacoes via chat | Manualmente no chat |
| 8.3 | Docs a mais via chat | Manualmente no chat |
