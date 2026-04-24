---
uc_id: UC-R04
nome: "Auditoria ANVISA (Semaforo Regulatorio)"
sprint: "Sprint 3-4 (Precificação e Proposta)"
versao_uc: "5.0"
doc_origem: "CASOS DE USO PRECIFICACAO E PROPOSTA V5.md"
linha_inicio_no_doc: 1752
split_gerado_em: "2026-04-24T19:14:51"
---

# UC-R04 — Auditoria ANVISA (Semaforo Regulatorio)

> Caso de uso extraído automaticamente de `docs/CASOS DE USO PRECIFICACAO E PROPOSTA V5.md` (linha 1752).
> Sprint origem: **Sprint 3-4 (Precificação e Proposta)**.
> Para regerar: `python3 scripts/split-uc-v5.py`.

---

**RF relacionado:** RF-040-04

**Regras de Negocio aplicaveis:**
- Presentes: RN-108, RN-109, RN-110
- Faltantes: RN-126 [FALTANTE]
- Referencia completa: secao 13 de `requisitos_completosv8.md`

**RNs aplicadas:** RN-108, RN-109, RN-110, RN-126 [FALTANTE->V4]

**Ator:** Sistema (automatico) + Usuario (validacao)

### Pre-condicoes
1. Proposta selecionada com produtos vinculados
2. Produtos tem campo `registro_anvisa` preenchido

### Pos-condicoes
1. Cada produto tem status ANVISA visivel (Valido/Proximo Venc./Vencido)
2. Alerta bloqueante se registros vencidos

### Sequencia de eventos
1. No [Card: "Auditoria ANVISA"], usuario clica no [Botao: "Verificar Registros"]. [ref: Passo 1]
2. Sistema chama `GET /api/propostas/{id}/anvisa-audit`. [ref: Passo 2]
3. A [Tabela: "ANVISA Records"] exibe Produto, Registro, Validade e Status por produto. [ref: Passo 3]
4. Status badge: [Badge: "Valido"] verde, [Badge: "Proximo Venc."] amarelo, [Badge: "Vencido"] vermelho. [ref: Passo 4]
5. Se houver registros vencidos, sistema exibe [Alerta: "BLOQUEANTE: Existem registros ANVISA vencidos"]. [ref: Passo 5]

### Fluxos Alternativos (V5)

**FA-01 — Todos os registros validos (semaforo verde):**
1. No passo 4, todos os produtos tem registro ANVISA vigente (> 12 meses).
2. Todos os badges sao verdes.
3. Nenhum alerta bloqueante e exibido.
4. Badge geral: "OK".

**FA-02 — Registro proximo do vencimento (amarelo):**
1. Algum registro vence em menos de 12 meses.
2. Badge amarelo "Proximo Venc." e exibido.
3. Badge geral: "Atencao" (amarelo).
4. Proposta pode prosseguir, mas com aviso.

**FA-03 — Semaforo com multiplos indicadores (registro, classe, AFE):**
1. Sistema exibe 4 indicadores: Registro ANVISA, Classe de Risco, Vencimento, AFE da empresa.
2. Cada indicador tem cor independente (verde/amarelo/vermelho).

### Fluxos de Excecao (V5)

**FE-01 — Registro ANVISA vencido (bloqueante):**
1. No passo 4, algum produto tem registro ANVISA vencido.
2. Sistema exibe [Alerta: "BLOQUEANTE: Existem registros ANVISA vencidos"].
3. A proposta nao pode ser enviada ate regularizacao do registro.

**FE-02 — Registro ANVISA nao encontrado:**
1. No passo 2, o numero de registro informado nao existe na base ANVISA.
2. Sistema exibe badge vermelho "Nao encontrado" e alerta de regularizacao.

**FE-03 — Falha na consulta ANVISA (timeout de rede):**
1. A chamada `GET /api/propostas/{id}/anvisa-audit` falha.
2. Sistema exibe toast: "Erro ao consultar ANVISA. Tente novamente."
3. Badges ficam cinzas (sem dados).

**FE-04 — Produto sem registro ANVISA cadastrado:**
1. O produto vinculado nao tem campo `registro_anvisa` preenchido.
2. Sistema exibe badge vermelho "Sem registro" e recomendacao de cadastro.

### Tela(s) Representativa(s)

**Pagina:** PropostaPage (`/app/proposta`)
**Posicao:** Card 4 (Auditoria ANVISA)

#### Layout da Tela

[Card: "Auditoria ANVISA"] icon Shield
  [Botao: "Verificar Registros"] icon Shield [ref: Passo 1]
  [Texto: "Clique em 'Verificar Registros' para consultar"] — estado inicial
  [Tabela: "ANVISA Records"] — visivel apos verificacao [ref: Passo 3]
    [Coluna: "Produto"]
    [Coluna: "Registro"] — monospace
    [Coluna: "Validade"]
    [Coluna: "Status"] — badge [ref: Passo 4]
      [Badge: "Valido"] — verde
      [Badge: "Proximo Venc."] — amarelo
      [Badge: "Vencido"] — vermelho
  [Alerta: "BLOQUEANTE"] — vermelho, visivel se registros vencidos [ref: Passo 5]
    [Texto: "Existem registros ANVISA vencidos. A proposta nao pode ser enviada."]

#### Mapeamento Tela <-> Sequencia

| Elemento de Tela | Passo(s) |
|---|---|
| [Botao: "Verificar Registros"] | 1 |
| [Tabela: "ANVISA Records"] | 3 |
| [Badge: "Valido/Proximo Venc./Vencido"] | 4 |
| [Alerta: "BLOQUEANTE"] | 5 |

### Implementacao atual
**IMPLEMENTADO**

---
