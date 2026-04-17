# TUTORIAL DE VALIDACAO MANUAL — SPRINT 8 — CONJUNTO 2 (RP3X)

**Data:** 2026-04-16
**Empresa:** RP3X Comercio e Representacoes Ltda. (CNPJ 68.218.593/0001-09)
**Dados de apoio:** `docs/dadossprint8-2.md`
**Referencia:** `docs/CASOS DE USO SPRINT8.md`
**UCs cobertos:** 5 (DI01, CL01, CL02, CL03, MA01)

---

## Credenciais e Login

| Campo | Valor |
|---|---|
| URL | http://localhost:5180 |
| Email | valida2@valida.com.br |
| Senha | 123456 |
| Empresa | RP3X Comercio e Representacoes Ltda. |

### Fluxo de login
1. Abrir `http://localhost:5180`
2. Preencher email/senha → **Entrar**
3. Selecionar **RP3X Comercio e Representacoes Ltda.**

---

## Pre-requisitos

- Backend porta **5007** / Frontend porta **5180**
- Seeds executadas:
  - `python backend/seeds/sprint5_seed.py`
  - `python backend/seeds/sprint6_seed.py`
  - `python backend/seeds/sprint7_seed.py`
  - `python backend/seeds/sprint8_seed.py`
- Empresa RP3X criada pela seed

---

## Indice

1. [FASE 1 — Dispensas de Licitacao](#fase-1)
2. [FASE 2 — Classificacao Inteligente](#fase-2)
3. [FASE 3 — Portfolio Classes](#fase-3)
4. [FASE 4 — Mascaras de Descricao](#fase-4)

---

## FASE 1 — Dispensas de Licitacao (UC-DI01) <a id="fase-1"></a>

Fluxo identico ao Conjunto 1, com diferenciais:

### UC-DI01 — Dashboard Dispensas
- Stat cards com dados minimos: **Abertas: 2**, demais zerados (0 cotacao_enviada, 0 adjudicada, 0 encerrada)
- Tabela com apenas **2 dispensas**, ambas status "aberta" e artigo "75-I"
- Sem badge "Valor Excedido" (ambas dentro do limite de R$ 50.000)

### UC-DI01 — Gerar Cotacao
- Mesma funcionalidade: clicar "Cotacao" em uma dispensa aberta
- Produtos do portfolio RP3X (impressoras/toner) usados na cotacao
- Dominio diferente: TI/impressao vs diagnostico laboratorial

### UC-DI01 — Atualizar Status
- Testar transicao: **aberta → cotacao_enviada** em uma das 2 dispensas
- Verificar stat cards atualizam: Abertas 2→1, Cotacao Enviada 0→1
- Testar transicao: **cotacao_enviada → adjudicada** para validar RN-NEW-11 (lead CRM)
- Verificar lead criado no pipeline CRM

---

## FASE 2 — Classificacao Inteligente (UC-CL01, UC-CL02) <a id="fase-2"></a>

### UC-CL02 — Aba Classes
Fluxo identico ao Conjunto 1, com diferenciais:

- **Stat cards menores:**
  - Areas: **1** (vs 3 do CH)
  - Classes: **2** (vs 5 do CH)
  - Produtos sem Classe: variavel

- **Tree view menor:**
  ```
  📁 Impressao e Automacao
    📂 Impressoras Laser
      📄 Laser Mono
      📄 Laser Color
    📂 Suprimentos Impressao
      📄 Toner
  ```

- **Detalhe de subclasse mais simples:**
  - Cada subclasse tem apenas **1 campo de mascara** (vs 2-3 do CH)
  - Exemplo "Laser Mono": apenas "Velocidade (ppm)"
  - Exemplo "Toner": apenas "Rendimento (paginas)"

### UC-CL02 — CRUD Manual
- Mesmo fluxo: criar area/classe/subclasse de teste e excluir
- Arvore menor facilita visualizacao

### UC-CL01 — Gerar Classes via IA
- **DIFERENCIAL CRITICO:** RP3X pode nao ter 20 produtos no portfolio
- Se < 20 produtos: **RN-NEW-09 bloqueia geracao**
  - Toast: "Minimo de 20 produtos exigido (atual: N). Cadastre mais produtos."
  - Este e um teste valido da regra de negocio
- Se >= 20 produtos: fluxo identico ao CH, mas com sugestoes de TI/impressao

---

## FASE 3 — Portfolio Classes (UC-CL03) <a id="fase-3"></a>

Fluxo identico ao Conjunto 1, com diferenciais:

### UC-CL03 — Colunas e Badges
- Coluna "Classe" resolve para nomes do dominio TI: "Impressoras Laser", "Suprimentos Impressao"
- **Nenhum produto com mascara no seed** — coluna "Desc. Normalizada" vazia para todos
- **Nenhum badge "Mascara Ativa"** (0 mascaras no seed vs 2 do CH)
- Badges "Sem Classe" para todos os produtos sem subclasse_id

### UC-CL03 — Filtro e Classificacao
- Mesma funcionalidade de filtro "Sem Classe" e selecao multipla
- Modal "Classificar Selecionados" mostra areas/classes/subclasses do dominio RP3X

---

## FASE 4 — Mascaras de Descricao (UC-MA01) <a id="fase-4"></a>

Fluxo identico ao Conjunto 1, com diferenciais:

### UC-MA01 — Aplicar Mascara Individual
- **Nenhum produto pre-normalizado** — todos os testes sao de aplicacao "do zero"
- Campos mascara mais simples: 1 campo por subclasse (ex.: apenas "Velocidade ppm")
- Resultado da IA sera mais compacto (menos campos para normalizar)
- Score estimado: melhoria esperada proporcional (mas com menos campos)

### UC-MA01 — Verificar Diferencial de Dominio
- Descricao normalizada usara termos de TI/impressao (vs termos de laboratorio no CH)
- Variantes geradas: nomes de impressoras, modelos de toner
- Sinonimos: termos do mercado de TI governamental

### UC-MA01 — Aplicar em Lote
- Mesma funcionalidade: selecionar N produtos e aplicar mascara em lote
- Resultado com produtos do dominio TI

---

## Resumo de Diferenciais vs Conjunto 1

| UC | CH (Conj.1) | RP3X (Conj.2) | Diferencial chave |
|---|---|---|---|
| UC-DI01 | 6 dispensas, 4 status | 2 dispensas, so aberta | Testa dashboard com dados minimos |
| UC-CL01 | Geracao IA funciona (>=20 prod) | Pode bloquear (RN-NEW-09) | Testa regra de negocio de minimo |
| UC-CL02 | Tree 3 niveis, 8 subclasses | Tree minima, 3 subclasses | Testa tree com poucos dados |
| UC-CL03 | 2 badges "Mascara Ativa" | 0 badges mascara | Testa portfolio sem mascaras |
| UC-MA01 | Mascara com 3 campos | Mascara com 1 campo | Testa mascara simples vs complexa |
