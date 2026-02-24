# Relatório de Testes — Certidões Automáticas

**Data:** 2026-02-24
**Ambiente:** Frontend http://localhost:5175 | Backend http://localhost:5007

## Resumo

| Status | Quantidade |
|---|---|
| PASS | 14 |
| FAIL | 0 |
| PARTIAL | 1 |
| **Total** | **15** |

## Resultados Detalhados

### ✅ TC-01: API buscar-automatica retorna todas as fontes

**Status:** PASS

**Detalhes:** Retornou 21 certidões. Stats: {"autenticadas":0,"manuais":5,"obtidas_auto":4,"publicas":16,"sem_api_key":0}. Válidas: 5, Pendentes: 0, Manuais: 0. Mensagem: "Busca concluída: 21 fontes — 4 obtidas automaticamente, 12 pendentes (portal manual), 5 manuais"

---

### ✅ TC-02: Certidões vinculadas a fontes via FK

**Status:** PASS

**Detalhes:** Total: 21. Com fonte_certidao_id: 21. Sem: 0. Com fonte_nome: 21

---

### ✅ TC-03: Fontes de certidões cadastradas

**Status:** PASS

**Detalhes:** Total: 21. Ativas: 21. Automáticas: 16. Manuais: 5. Fontes: CND Estadual - SEFAZ/SP (ICMS), SICAF - Cadastro Unificado de Fornecedores, Certidão Distribuição - Justiça Federal (TRF3/SP), CNJ - Improbidade Administrativa, CEIS - Empresas Inidôneas e Suspensas (CGU), CNDT - Certidão Negativa de Débitos Trabalhistas, CRF - Certificado de Regularidade do FGTS, CNEP - Empresas Punidas Lei Anticorrupção (CGU), Certidão de Falência e Recuperação Judicial (TJSP), TCU - Lista de Licitantes Inidôneos, INMETRO - Certificação de Produtos, Certidão Simplificada - JUCESP, CND Municipal - Prefeitura de São Paulo (ISS), CADIN - Cadastro de Inadimplentes Federal, CND Federal - Receita Federal / PGFN, Atestados de Capacidade Técnica, ANVISA - AFE (Autorização de Funcionamento), CREA-SP - Registro de Pessoa Jurídica, ANVISA - Registro de Produtos para Saúde, Certidão Distribuições Cíveis 1º Grau (TJSP), Balanço Patrimonial e Demonstrações Contábeis

---

### ✅ TC-04: Página Empresa mostra seção Certidões

**Status:** PASS

**Detalhes:** Card certidões visível: true. Botão Buscar: true

**Screenshots:**
- ![CERT_TC04_01_empresa_page.png](../test_screenshots/certidoes/CERT_TC04_01_empresa_page.png)
- ![CERT_TC04_02_secao_certidoes.png](../test_screenshots/certidoes/CERT_TC04_02_secao_certidoes.png)

---

### ✅ TC-05: Buscar Certidões popula tabela

**Status:** PASS

**Detalhes:** Linhas na tabela: 21. Mensagem: "Busca concluída: 21 fontes — 4 obtidas automaticamente, 12 pendentes (portal manual), 5 manuais. Certidões marcadas como 'Válida' foram obtidas automaticamente. Para as demais, clique no ícone de olho"

**Screenshots:**
- ![CERT_TC05_02_resultado_busca.png](../test_screenshots/certidoes/CERT_TC05_02_resultado_busca.png)
- ![CERT_TC05_03_tabela_completa.png](../test_screenshots/certidoes/CERT_TC05_03_tabela_completa.png)

---

### ⚠️ TC-06: Status badges corretos

**Status:** PARTIAL

**Detalhes:** Válida: 5, Pendente: 0, Manual: 0, Erro: 0

**Screenshots:**
- ![CERT_TC06_01_badges.png](../test_screenshots/certidoes/CERT_TC06_01_badges.png)

---

### ✅ TC-07: Botões de ação na tabela

**Status:** PASS

**Detalhes:** Portais: 19, Upload: 21, Download: 1, Refresh: 16

**Screenshots:**
- ![CERT_TC07_01_acoes.png](../test_screenshots/certidoes/CERT_TC07_01_acoes.png)

---

### ✅ TC-08: Modal upload de certidão

**Status:** PASS

**Detalhes:** Modal visível: true. Input arquivo: true. Input data: true. Título: true

**Screenshots:**
- ![CERT_TC08_01_modal_upload.png](../test_screenshots/certidoes/CERT_TC08_01_modal_upload.png)

---

### ✅ TC-09: Upload real de PDF via modal

**Status:** PASS

**Detalhes:** Modal fechou: true. Data vencimento: 2026-08-24

**Screenshots:**
- ![CERT_TC09_01_form_preenchido.png](../test_screenshots/certidoes/CERT_TC09_01_form_preenchido.png)
- ![CERT_TC09_02_apos_upload.png](../test_screenshots/certidoes/CERT_TC09_02_apos_upload.png)

---

### ✅ TC-10: Certidão Válida após upload

**Status:** PASS

**Detalhes:** Badges Válida: 5. Botões Download: 1

**Screenshots:**
- ![CERT_TC10_01_apos_upload_status.png](../test_screenshots/certidoes/CERT_TC10_01_apos_upload_status.png)

---

### ✅ TC-11: Footer dinâmico com contagem

**Status:** PASS

**Detalhes:** Footer antigo (hardcoded): false. Footer novo (dinâmico): true

**Screenshots:**
- ![CERT_TC11_01_footer.png](../test_screenshots/certidoes/CERT_TC11_01_footer.png)

---

### ✅ TC-12: CRUD Fontes de Certidões

**Status:** PASS

**Detalhes:** Tabela visível: true. Linhas: 21

**Screenshots:**
- ![CERT_TC12_01_crud_fontes.png](../test_screenshots/certidoes/CERT_TC12_01_crud_fontes.png)
- ![CERT_TC12_02_crud_fontes_scroll.png](../test_screenshots/certidoes/CERT_TC12_02_crud_fontes_scroll.png)

---

### ✅ TC-13: API upload de certidão

**Status:** PASS

**Detalhes:** Status: 200. Response: {"certidao":{"created_at":"2026-02-23T22:43:17","data_emissao":"2026-02-24","data_vencimento":"2026-12-31","edital_requisito_id":null,"empresa_id":"7dbdc60a-b806-4614-a024-a1d4841dc8c9","fonte_certidao_id":"94b48826-d1b1-433a-86f2-4f7794230dd8","fonte_nome":"CND Municipal - Prefeitura de São Paulo (

---

### ✅ TC-14: Novos status aceitos pelo enum

**Status:** PASS

**Detalhes:** Distribuição de status: {"valida":5,"vencida":16}

---

### ✅ TC-15: Mensagem com estatísticas de busca

**Status:** PASS

**Detalhes:** Mensagem visível: true. Texto: "Busca concluída: 21 fontes — 4 obtidas automaticamente, 12 pendentes (portal manual), 5 manuais. Certidões marcadas como 'Válida' foram obtidas automaticamente. Para as demais, clique no ícone de olho para abrir o portal e faça upload do PDF."

**Screenshots:**
- ![CERT_TC15_01_msg_sucesso.png](../test_screenshots/certidoes/CERT_TC15_01_msg_sucesso.png)

---

