# TUTORIAL DE VALIDACAO MANUAL — SPRINT 8 — CONJUNTO 1 (CH Hospitalar)

**Data:** 2026-04-16
**Empresa:** CH Hospitalar (CNPJ 43.712.232/0001-85)
**Dados de apoio:** `docs/dadossprint8-1.md`
**Referencia:** `docs/CASOS DE USO SPRINT8.md`
**UCs cobertos:** 5 (DI01, CL01, CL02, CL03, MA01)
**Publico:** validador humano acompanhando roteiro passo-a-passo

---

## Credenciais e Login

| Campo | Valor |
|---|---|
| URL | http://localhost:5180 |
| Email | valida1@valida.com.br |
| Senha | 123456 |
| Empresa | CH Hospitalar |

### Fluxo de login
1. Abrir `http://localhost:5180`
2. Preencher email/senha e clicar **Entrar**
3. Na tela de selecao, clicar em **CH Hospitalar**
4. Aguardar dashboard carregar

---

## Pre-requisitos

- Backend rodando na porta **5007**
- Frontend rodando na porta **5180**
- Seeds executadas:
  - `python backend/seeds/sprint5_seed.py` (dados base)
  - `python backend/seeds/sprint6_seed.py` (dados Sprint 6)
  - `python backend/seeds/sprint7_seed.py` (dados Sprint 7)
  - `python backend/seeds/sprint8_seed.py` (dados Sprint 8)

---

## Indice

1. [FASE 1 — Dispensas de Licitacao (UC-DI01)](#fase-1)
2. [FASE 2 — Classificacao Inteligente (UC-CL01, UC-CL02)](#fase-2)
3. [FASE 3 — Visualizar Classes no Portfolio (UC-CL03)](#fase-3)
4. [FASE 4 — Mascaras de Descricao (UC-MA01)](#fase-4)

---

## FASE 1 — Dispensas de Licitacao (UC-DI01) <a id="fase-1"></a>

### UC-DI01 — Dashboard e Workflow de Dispensas

1. Sidebar → **Captacao** (secao Fluxo Comercial)
2. Verificar 2 tabs na parte superior: **Editais** (default, conteudo existente), **Dispensas** (nova)
3. Clicar na tab **Dispensas**
4. Verificar 4 stat cards com valores do seed:
   - **Abertas** (2)
   - **Cotacao Enviada** (2)
   - **Adjudicadas** (1)
   - **Encerradas** (1)
5. Verificar filtros visiveis:
   - Select **Artigo** (Todos / 75-I / 75-II / 75-III / 75-IV / 75-V)
   - Inputs **Valor Min** e **Valor Max**
   - Input **UF**
   - Input **Buscar orgao**
6. Verificar tabela de dispensas com dados do seed (6 linhas)
7. Verificar colunas: Numero, Orgao, UF, Artigo, Objeto, Valor, Prazo, Status, Acoes
8. **Interacao — Filtro artigo:**
   - Selecionar "75-I" no filtro Artigo
   - Verificar tabela filtra para mostrar apenas dispensas com artigo 75-I (3 dispensas)
   - Voltar para "Todos"
9. **Interacao — Filtro valor:**
   - Preencher Valor Min: 50000, Valor Max: 80000
   - Verificar tabela filtra para dispensas dentro da faixa
   - Limpar filtros
10. Verificar badge **"Valor Excedido"** (RN-NEW-07) — se alguma dispensa tiver valor > limite do artigo, badge vermelho visivel
11. Verificar badges de urgencia na coluna Prazo:
    - Verde (>15 dias)
    - Amarelo (5-15 dias)
    - Vermelho (<5 dias)

### UC-DI01 — Gerar Cotacao

12. Localizar dispensa com status "aberta" na tabela
13. Clicar botao **"Cotacao"** (ou "Gerar Cotacao") na coluna Acoes
14. Aguardar modal abrir (pode levar alguns segundos — chamada DeepSeek)
15. Verificar modal exibe:
    - Texto da cotacao gerada pela IA
    - Formatacao de proposta comercial
16. Verificar botoes **Fechar** / **OK** no modal
17. Fechar modal

### UC-DI01 — Atualizar Status

18. Localizar dispensa com status "aberta"
19. Verificar botao/select de status na coluna Acoes
20. Selecionar transicao valida: **aberta → cotacao_enviada**
21. Verificar toast de sucesso
22. Verificar stat card "Abertas" decrementou e "Cotacao Enviada" incrementou
23. **Teste de transicao invalida (RN-NEW-08):**
    - Tentar pular de "aberta" diretamente para "adjudicada"
    - Verificar erro: "Transicao invalida"
24. **Teste RN-NEW-11:**
    - Localizar dispensa "cotacao_enviada" e transicionar para "adjudicada"
    - Verificar se lead CRM foi criado automaticamente (mensagem de sucesso ou verificar no CRM)

---

## FASE 2 — Classificacao Inteligente (UC-CL01, UC-CL02) <a id="fase-2"></a>

### UC-CL02 — Gerenciar Classes e Mascaras (aba Classes)

1. Sidebar → **Parametrizacoes** (secao Configuracoes)
2. Verificar **6 tabs**: Score, Comercial, Fontes, Notificacoes, Preferencias, **Classes** (nova)
3. Clicar na tab **Classes**
4. Verificar 3 stat cards:
   - **Areas** (3 — Diagnostico Laboratorial, Equipamentos Medicos, Consumiveis Hospitalares)
   - **Classes** (5)
   - **Produtos sem Classe** (>=0, quantidade de produtos com subclasse_id=null)
5. Verificar botoes visiveis:
   - **Nova Area**, **Nova Classe**, **Nova Subclasse**
   - **Gerar via IA**, **Aplicar ao Portfolio**
   - **Atualizar** (refresh)

### UC-CL02 — Tree View

6. Verificar arvore hierarquica com 3 niveis:
   - Nivel 1 (Area): Diagnostico Laboratorial, Equipamentos Medicos, Consumiveis Hospitalares
   - Nivel 2 (Classe): Reagentes Hematologia, Kits Bioquimica, etc.
   - Nivel 3 (Subclasse): Hemograma Completo, Coagulacao, etc.
7. **Interacao — Expandir:**
   - Clicar em "Diagnostico Laboratorial" para expandir
   - Verificar classes filhas aparecem: Reagentes Hematologia, Kits Bioquimica
   - Clicar em "Reagentes Hematologia" para expandir
   - Verificar subclasses: Hemograma Completo, Coagulacao
8. **Interacao — Detalhe subclasse:**
   - Clicar em "Hemograma Completo"
   - Verificar painel de detalhe abre com:
     - Nome: "Hemograma Completo"
     - NCMs: ["3822.00.90"]
     - campos_mascara com 3 campos: Volume (mL), Testes/Frasco (num), Metodologia (texto)
   - Verificar botao **Salvar** presente

### UC-CL02 — CRUD Manual

9. **Criar nova area:**
   - Clicar **Nova Area**
   - Preencher nome: "Teste Area Validacao"
   - Confirmar criacao
   - Verificar area aparece na arvore
10. **Criar nova classe:**
    - Clicar **Nova Classe**
    - Selecionar area: "Teste Area Validacao"
    - Preencher nome: "Teste Classe"
    - Confirmar criacao
11. **Criar nova subclasse:**
    - Clicar **Nova Subclasse**
    - Selecionar classe: "Teste Classe"
    - Preencher nome: "Teste Subclasse"
    - Confirmar criacao
12. **Excluir itens de teste:**
    - Excluir subclasse "Teste Subclasse"
    - Excluir classe "Teste Classe"
    - Excluir area "Teste Area Validacao"
    - Verificar arvore voltou ao estado original (3 areas, 5 classes, 8 subclasses)

### UC-CL01 — Gerar Classes via IA

13. Clicar botao **Gerar via IA** (ou "Gerar Classes via IA")
14. **Se portfolio >= 20 produtos:**
    - Aguardar loading spinner "Analisando..."
    - Modal abre com arvore sugerida pela IA
    - Verificar arvore com areas, classes, subclasses sugeridas
    - Verificar contagem de produtos por no
    - Verificar botoes: **Aceitar Tudo**, **Cancelar**
    - Clicar **Cancelar** (para nao poluir dados do seed)
15. **Se portfolio < 20 produtos (RN-NEW-09):**
    - Toast: "Minimo de 20 produtos exigido (atual: N). Cadastre mais produtos."
    - Verificar que modal NAO abre

### UC-CL02 — Aplicar ao Portfolio

16. Clicar botao **Aplicar ao Portfolio**
17. Verificar modal abre com:
    - Lista de produtos sem classe
    - Selects cascata: Area → Classe → Subclasse
18. Selecionar area "Diagnostico Laboratorial" → classe "Reagentes Hematologia" → subclasse "Hemograma Completo"
19. Selecionar 1 produto da lista
20. Clicar **Vincular** ou **Salvar**
21. Verificar toast de sucesso
22. Verificar stat card "Produtos sem Classe" decrementou

---

## FASE 3 — Visualizar Classes no Portfolio (UC-CL03) <a id="fase-3"></a>

### UC-CL03 — Colunas e Badges

1. Sidebar → **Portfolio** (secao Configuracoes)
2. Verificar tab **produtos** ativa (existente)
3. Verificar colunas **novas** na tabela:
   - **Classe** — nome da classe do produto (resolve via subclasse → classe)
   - **Desc. Normalizada** — texto truncado da descricao normalizada (quando aplicada)
4. Verificar **badges**:
   - **"Sem Classe"** (amarelo) — produtos com subclasse_id = null
   - **"Mascara Ativa"** (verde) — produtos com mascara_ativa = true (2 do seed)
5. Verificar checkbox de selecao por linha (nova coluna)
6. Verificar checkbox "Sem Classe" no filtro (filtra produtos sem classificacao)

### UC-CL03 — Filtro Sem Classe

7. **Interacao — Filtro:**
   - Marcar checkbox **"Sem Classe"**
   - Verificar tabela mostra apenas produtos com subclasse_id = null
   - Desmarcar checkbox
   - Verificar tabela volta ao normal

### UC-CL03 — Selecao Multipla e Classificacao

8. Selecionar 2-3 produtos via checkbox
9. Verificar botao **"Classificar Selecionados"** aparece (visivel quando >= 1 selecionado)
10. Clicar **Classificar Selecionados**
11. Verificar modal com:
    - Lista dos produtos selecionados
    - Selects cascata: Area → Classe → Subclasse
12. Selecionar Area → Classe → Subclasse
13. Clicar **Salvar** / **Vincular**
14. Verificar toast de sucesso
15. Verificar badges "Sem Classe" desaparecem dos produtos classificados

---

## FASE 4 — Mascaras de Descricao (UC-MA01) <a id="fase-4"></a>

### UC-MA01 — Aplicar Mascara Individual

1. Na tab **produtos** do Portfolio (ja esta nela da FASE 3)
2. Localizar um produto com subclasse vinculada (para ter campos_mascara)
3. Clicar botao **"Aplicar Mascara"** (icone na coluna Acoes)
4. Aguardar chamada DeepSeek (pode levar alguns segundos)
5. Verificar modal **"Resultado da Mascara"** abre com:
   - **Descricao Original** — texto atual do produto
   - **Descricao Normalizada** — texto gerado pela IA
   - **Score Antes** e **Score Depois** (ex: 45 → 82)
   - **Variantes** — tags com variantes de nomenclatura
   - **Sinonimos** — tags com sinonimos
6. Verificar botoes: **Aceitar**, **Cancelar**
7. Clicar **Aceitar**
8. Verificar toast de sucesso
9. Verificar coluna "Desc. Normalizada" agora mostra texto para esse produto
10. Verificar badge **"Mascara Ativa"** (verde) aparece no produto

### UC-MA01 — Verificar Produto Pre-normalizado do Seed

11. Localizar um dos 2 produtos que ja tem mascara no seed
12. Verificar:
    - Coluna "Desc. Normalizada" mostra texto "[NORMALIZADO]..."
    - Badge "Mascara Ativa" verde visivel
13. Clicar **Aplicar Mascara** nesse produto (para regerar)
14. Verificar modal abre normalmente com nova sugestao da IA

### UC-MA01 — Aplicar Mascara em Lote

15. Selecionar 2-3 produtos via checkbox
16. Verificar botao **"Aplicar Mascara em Lote"** visivel (quando items selecionados)
17. Clicar **Aplicar Mascara em Lote**
18. Aguardar processamento (barra de progresso ou spinner)
19. Verificar resultado:
    - Toast com resumo: "Mascara aplicada a N produtos"
    - Colunas "Desc. Normalizada" atualizadas nos produtos processados
    - Badges "Mascara Ativa" aparecem
