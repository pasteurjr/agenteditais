# DADOS BASE — SPRINT 8 — CONJUNTO 2 (RP3X)

**Data:** 2026-04-16
**Usuario:** valida2@valida.com.br / 123456
**Empresa:** RP3X Comercio e Representacoes Ltda. (CNPJ 68.218.593/0001-09)
**Referencia:** `docs/CASOS DE USO SPRINT8.md`
**UCs cobertos:** 5 (DI01, CL01, CL02, CL03, MA01)

---

## 1. Credenciais e acesso

| Campo | Valor |
|---|---|
| Email | valida2@valida.com.br |
| Senha | 123456 |
| Empresa selecionada | RP3X Comercio e Representacoes Ltda. |
| Papel | admin |
| Backend | http://localhost:5007 |
| Frontend | http://localhost:5180 |

---

## 2. Referencias pre-existentes

- **Editais:** dados RP3X das Sprints 1-5
- **Seeds anteriores obrigatorias:**
  - `python backend/seeds/sprint5_seed.py`
  - `python backend/seeds/sprint6_seed.py`
  - `python backend/seeds/sprint7_seed.py`
  - `python backend/seeds/sprint8_seed.py`
- Empresa RP3X criada pela seed

---

## 3. Areas de Produto (1 registro)

| # | Nome | Descricao | Ativo |
|---|---|---|---|
| 1 | Impressao e Automacao | Impressoras e suprimentos | Sim |

---

## 4. Classes de Produto V2 (2 registros)

| # | Nome | Area | Descricao |
|---|---|---|---|
| 1 | Impressoras Laser | Impressao e Automacao | — |
| 2 | Suprimentos Impressao | Impressao e Automacao | — |

---

## 5. Subclasses de Produto (3 registros)

| # | Nome | Classe | NCMs | campos_mascara (resumo) |
|---|---|---|---|---|
| 1 | Laser Mono | Impressoras Laser | 8443.32.99 | Velocidade (ppm, OBRIG) |
| 2 | Laser Color | Impressoras Laser | 8443.32.99 | Velocidade (ppm, OBRIG) |
| 3 | Toner | Suprimentos Impressao | 3707.90.29 | Rendimento (paginas, OBRIG) |

**Estrutura campos_mascara detalhada (exemplo Subclasse 1 — Laser Mono):**
```json
[
  {"campo": "Velocidade", "tipo": "numero", "unidade": "ppm", "obrigatorio": true}
]
```

---

## 6. Dispensas (2 registros)

| # | Edital vinculado | Artigo | Valor Limite | Status | Cotacao |
|---|---|---|---|---|---|
| 1 | 1o edital RP3X | 75-I | R$ 50.000 | **aberta** | — |
| 2 | 2o edital RP3X | 75-I | R$ 50.000 | **aberta** | — |

**Distribuicao por status:**
- aberta: 2
- cotacao_enviada: 0
- adjudicada: 0
- encerrada: 0

---

## 7. Hierarquia completa (arvore)

```
RP3X Comercio e Representacoes
└── 📁 Impressao e Automacao
    ├── 📂 Impressoras Laser
    │   ├── 📄 Laser Mono (NCM: 8443.32.99, 1 campo mascara)
    │   └── 📄 Laser Color (NCM: 8443.32.99, 1 campo mascara)
    └── 📂 Suprimentos Impressao
        └── 📄 Toner (NCM: 3707.90.29, 1 campo mascara)
```

**Totais:** 1 area, 2 classes, 3 subclasses, 3 campos de mascara

---

## 8. Produtos com Mascara Aplicada (0 registros)

Nenhum produto RP3X tem mascara aplicada no seed. A funcionalidade esta disponivel para teste manual via UC-MA01.

---

## 9. Diferenciais vs Conjunto 1 (CH Hospitalar)

| Entidade | CH (Conj.1) | RP3X (Conj.2) | Diferencial |
|---|---|---|---|
| Areas | 3 | 1 | Volume minimo |
| Classes V2 | 5 | 2 | Menos classes |
| Subclasses | 8 | 3 | Menos subclasses |
| Campos mascara | 21 | 3 | Mascaras simples (1 campo cada) |
| Dispensas | 6 (4 status) | 2 (apenas aberta) | Sem workflow completo |
| Produtos c/ mascara | 2 | 0 | Sem mascara no seed |
| Segmento | Diagnostico laboratorial | Impressao/TI | Dominio diferente |

---

## 10. Observacoes para validacao

### UC-DI01 — Dispensas
- Stat cards mostrarao apenas "Abertas: 2" (demais zerados)
- Sem cotacao gerada no seed — testar geracao manual
- Sem dispensa adjudicada — testar transicao manual para validar RN-NEW-11

### UC-CL01 — Gerar Classes via IA
- RP3X pode NAO ter 20 produtos — nesse caso, RN-NEW-09 bloqueara geracao
- Se bloqueado: toast "Minimo de 20 produtos exigido (atual: N)"
- Este e um diferencial valido vs CH (que tem >=20 produtos)

### UC-CL02 — Gerenciar Classes
- Tree view menor (1 area, 2 classes, 3 subclasses)
- Mascaras simples (1 campo cada vs 2-3 do CH)
- Toda funcionalidade CRUD identica ao CH

### UC-CL03 — Portfolio Classes
- Mesma funcionalidade: colunas Classe + Desc.Normalizada, badges
- Nenhum produto tera badge "Mascara Ativa" (0 mascaras no seed)
- Todos sem subclasse_id terao badge "Sem Classe"

### UC-MA01 — Mascara de Descricao
- Nenhuma mascara pre-aplicada — testar aplicacao completa do zero
- Campos mascara mais simples (1 campo vs 3 do CH) — resultado da IA sera mais compacto
