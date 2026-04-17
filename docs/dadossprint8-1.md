# DADOS BASE — SPRINT 8 — CONJUNTO 1 (CH Hospitalar)

**Data:** 2026-04-16
**Usuario:** valida1@valida.com.br / 123456
**Empresa:** CH Hospitalar (CNPJ 43.712.232/0001-85)
**Referencia:** `docs/CASOS DE USO SPRINT8.md`
**UCs cobertos:** 5 (DI01, CL01, CL02, CL03, MA01)

---

## 1. Credenciais e acesso

| Campo | Valor |
|---|---|
| Email | valida1@valida.com.br |
| Senha | 123456 |
| Empresa selecionada | CH Hospitalar |
| Papel | admin |
| Backend | http://localhost:5007 |
| Frontend | http://localhost:5180 |

---

## 2. Referencias pre-existentes

- **Editais:** >=28 distribuidos em 9 UFs (Sprints 1-5)
- **Produtos:** >=20 cadastrados no portfolio (obrigatorio para UC-CL01 — RN-NEW-09)
- **Contratos:** >=12 vigentes
- **ParametroScore:** com `estados_atuacao` e NCMs configurados
- **Seeds anteriores obrigatorias:**
  - `python backend/seeds/sprint5_seed.py`
  - `python backend/seeds/sprint6_seed.py`
  - `python backend/seeds/sprint7_seed.py`
  - `python backend/seeds/sprint8_seed.py`

---

## 3. Areas de Produto (3 registros)

| # | Nome | Descricao | Ativo |
|---|---|---|---|
| 1 | Diagnostico Laboratorial | Reagentes, kits e insumos para analises clinicas | Sim |
| 2 | Equipamentos Medicos | Equipamentos de diagnostico e analise | Sim |
| 3 | Consumiveis Hospitalares | Materiais descartaveis e de consumo | Sim |

---

## 4. Classes de Produto V2 (5 registros)

| # | Nome | Area | Descricao |
|---|---|---|---|
| 1 | Reagentes Hematologia | Diagnostico Laboratorial | Reagentes para hemograma e coagulacao |
| 2 | Kits Bioquimica | Diagnostico Laboratorial | Kits para dosagens bioquimicas |
| 3 | Analisadores Automatizados | Equipamentos Medicos | Equipamentos de analise automatica |
| 4 | Microscopia | Equipamentos Medicos | Microscopios e acessorios |
| 5 | Descartaveis Laboratoriais | Consumiveis Hospitalares | Tubos, ponteiras, laminas |

---

## 5. Subclasses de Produto (8 registros)

| # | Nome | Classe | NCMs | campos_mascara (resumo) |
|---|---|---|---|---|
| 1 | Hemograma Completo | Reagentes Hematologia | 3822.00.90 | Volume (mL, OBRIG), Testes/Frasco (num, OBRIG), Metodologia |
| 2 | Coagulacao | Reagentes Hematologia | 3822.00.90 | Parametro (select: TP/TTPA/Fibrinogenio, OBRIG), Sensibilidade |
| 3 | Glicose/Colesterol | Kits Bioquimica | 3822.00.90 | Analito (OBRIG), Metodo (select: Enzimatico/Colorimetrico, OBRIG), Linearidade (mg/dL) |
| 4 | Eletrolitos | Kits Bioquimica | 3822.00.90 | Ion (select: Na+/K+/Cl-/Ca++, OBRIG), Volume Amostra (uL) |
| 5 | Analisador Hematologico | Analisadores Automatizados | 9027.80.99 | Parametros (num, OBRIG), Velocidade (amostras/hora, OBRIG), Volume Aspiracao (uL) |
| 6 | Microscopio Optico | Microscopia | 9011.10.00 | Objetivas (OBRIG), Iluminacao (select: LED/Halogena, OBRIG) |
| 7 | Tubos Coleta | Descartaveis Laboratoriais | 3926.90.90 | Volume (mL, OBRIG), Anticoagulante (select: EDTA/Citrato/Heparina/Seco, OBRIG), Cor Tampa |
| 8 | Ponteiras Micropipeta | Descartaveis Laboratoriais | 3926.90.90 | Faixa Volume (uL, OBRIG), Compatibilidade, Esteril (boolean, OBRIG) |

**Estrutura campos_mascara detalhada (exemplo Subclasse 1 — Hemograma Completo):**
```json
[
  {"campo": "Volume", "tipo": "decimal", "unidade": "mL", "obrigatorio": true},
  {"campo": "Testes/Frasco", "tipo": "numero", "obrigatorio": true},
  {"campo": "Metodologia", "tipo": "texto", "obrigatorio": false}
]
```

---

## 6. Dispensas (6 registros)

| # | Edital vinculado | Artigo | Valor Limite | Status | Cotacao |
|---|---|---|---|---|---|
| 1 | 1o edital CH | 75-I | R$ 50.000 | **aberta** | — |
| 2 | 2o edital CH | 75-II | R$ 100.000 | **aberta** | — |
| 3 | 3o edital CH | 75-I | R$ 50.000 | **cotacao_enviada** | "Cotacao gerada via IA..." |
| 4 | 4o edital CH | 75-II | R$ 100.000 | **cotacao_enviada** | "Proposta enviada ao orgao..." |
| 5 | 5o edital CH | 75-I | R$ 45.000 | **adjudicada** | "Adjudicado." |
| 6 | 6o edital CH | 75-II | R$ 80.000 | **encerrada** | "Contrato firmado." |

**Distribuicao por status:**
- aberta: 2
- cotacao_enviada: 2
- adjudicada: 1
- encerrada: 1

**Limites legais por artigo (Lei 14.133/2021):**
| Artigo | Limite |
|---|---|
| 75-I | R$ 50.000 |
| 75-II | R$ 100.000 |
| 75-III | Sem limite fixo |
| 75-IV | Sem limite fixo |
| 75-V | Sem limite fixo |

**Transicoes validas (RN-NEW-08):**
- aberta → cotacao_enviada
- cotacao_enviada → aberta (retorno)
- cotacao_enviada → adjudicada
- adjudicada → encerrada
- encerrada → (terminal, sem transicao)

---

## 7. Produtos com Mascara Aplicada (2 registros)

| # | Produto | descricao_normalizada | mascara_ativa | variantes | sinonimos | score_antes | score_depois |
|---|---|---|---|---|---|---|---|
| 1 | 1o produto CH | "[NORMALIZADO] {nome} — descricao padronizada para licitacoes publicas" | true | "{nome} tipo A", "{nome} premium" | "reagente", "kit diagnostico" | 45 | 82 |
| 2 | 2o produto CH | "[NORMALIZADO] {nome} — descricao padronizada para licitacoes publicas" | true | "{nome} tipo A", "{nome} premium" | "reagente", "kit diagnostico" | 45 | 82 |

**Campos novos no model Produto (Sprint 8):**
- `descricao_normalizada` (Text) — descricao gerada pela IA
- `mascara_ativa` (Boolean, default False) — feature flag por produto (RN-NEW-10)
- `mascara_metadata` (JSON) — variantes, sinonimos, score_antes, score_depois

---

## 8. Hierarquia completa (arvore)

```
CH Hospitalar
├── 📁 Diagnostico Laboratorial
│   ├── 📂 Reagentes Hematologia
│   │   ├── 📄 Hemograma Completo (NCM: 3822.00.90, 3 campos mascara)
│   │   └── 📄 Coagulacao (NCM: 3822.00.90, 2 campos mascara)
│   └── 📂 Kits Bioquimica
│       ├── 📄 Glicose/Colesterol (NCM: 3822.00.90, 3 campos mascara)
│       └── 📄 Eletrolitos (NCM: 3822.00.90, 2 campos mascara)
├── 📁 Equipamentos Medicos
│   ├── 📂 Analisadores Automatizados
│   │   └── 📄 Analisador Hematologico (NCM: 9027.80.99, 3 campos mascara)
│   └── 📂 Microscopia
│       └── 📄 Microscopio Optico (NCM: 9011.10.00, 2 campos mascara)
└── 📁 Consumiveis Hospitalares
    └── 📂 Descartaveis Laboratoriais
        ├── 📄 Tubos Coleta (NCM: 3926.90.90, 3 campos mascara)
        └── 📄 Ponteiras Micropipeta (NCM: 3926.90.90, 3 campos mascara)
```

**Totais:** 3 areas, 5 classes, 8 subclasses, 21 campos de mascara

---

## 9. Endpoints Sprint 8 (novos/melhorados)

| # | Metodo | Endpoint | Funcao |
|---|---|---|---|
| 1 | GET | /api/dashboard/dispensas | Stat cards por status, filtros artigo/faixa/uf |
| 2 | POST | /api/dispensas/buscar | Busca PNCP com modalidade=dispensa |
| 3 | POST | /api/dispensas/{id}/cotacao | Gera cotacao via DeepSeek |
| 4 | PUT | /api/dispensas/{id}/status | Transicao de status (RN-NEW-08 + RN-NEW-11) |
| 5 | POST | /api/portfolio/aplicar-mascara | Aplica mascara a 1 produto |
| 6 | POST | /api/portfolio/aplicar-mascara-lote | Aplica mascara em lote (max 50) |
| 7 | POST | /api/parametrizacoes/gerar-classes | Gera classes via IA (melhorado: RN-NEW-09, cooldown, aplicar) |

---

## 10. Dados derivados (calculados em tempo real)

### Dashboard Dispensas (UC-DI01)
- **Stat cards:** contagem por status (aberta/cotacao_enviada/adjudicada/encerrada)
- **Por artigo:** contagem por artigo (75-I/75-II)
- **Filtros:** artigo, faixa valor (min/max), UF

### Geracao de Classes via IA (UC-CL01)
- Requer minimo **20 produtos** no portfolio (RN-NEW-09)
- Cooldown **60 segundos** entre invocacoes (RN-084)
- Retorna arvore sugerida com areas/classes/subclasses/campos_mascara
- Modo `aplicar=true` cria registros no banco e vincula produtos

### Mascara de Descricao (UC-MA01)
- Invoca DeepSeek com descricao + NCM + campos_mascara da subclasse
- Retorna: descricao_normalizada, variantes (3-5), sinonimos, score antes/depois
- Score estimado: melhoria tipica de 37 pontos (45 → 82)
