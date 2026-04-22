# PLANO: Validacao Visual Automatica dos Tutoriais (Sprints 1-9)

**Data:** 2026-04-20
**Objetivo:** Sistema interativo que executa automaticamente os 9 tutoriais (`tutorialsprint{1-9}-2.md`) passo-a-passo usando Playwright, mostrando visualmente cada acao na tela com controle manual do usuario.

---

## 1. Conceito

O usuario quer **VER** a validacao acontecendo na tela, passo a passo, como uma demonstracao guiada interativa:

- Cada passo do tutorial e exibido em um painel formatado em Markdown
- O Playwright preenche campos, clica botoes, navega — e o usuario VE na tela
- Apos cada passo: PAUSA. O usuario le, verifica, e clica **[Continuar]**
- O usuario pode clicar **[Parar]** ou **[Reiniciar]** a qualquer momento
- O usuario pode inserir **comentarios/correcoes** em cada passo
- A execucao e DOCUMENTADA: screenshots + resultado + comentarios do usuario

---

## 2. Arquitetura

```
+------------------------------------------------------------------+
|  PAINEL DE CONTROLE (HTML servido localmente)                     |
|                                                                   |
|  +---------------------------+  +------------------------------+  |
|  | PASSO ATUAL (MD rendered) |  | BROWSER (Playwright visible) |  |
|  | UC-F01 Passo 3:           |  | [tela real do sistema]       |  |
|  | "Preencher redes sociais" |  |                              |  |
|  | Instagram: @rp3x...       |  |                              |  |
|  | LinkedIn: rp3x-comercio   |  |                              |  |
|  |                           |  |                              |  |
|  | Status: EXECUTANDO...     |  |                              |  |
|  +---------------------------+  +------------------------------+  |
|                                                                   |
|  [<< Anterior] [Continuar >>] [Parar] [Reiniciar]               |
|                                                                   |
|  Comentario: [________________________________] [Salvar]          |
|                                                                   |
|  Progresso: UC-F01 Passo 3/6 | Sprint 1 | 3/17 UCs              |
+------------------------------------------------------------------+
```

### Componentes:

1. **Parser de Tutorial** (Python) — le o `.md`, extrai UCs, passos, dados, verificacoes
2. **Executor Playwright** (Python) — executa acoes no browser (visible mode, slow_mo)
3. **Servidor de Controle** (Python/Flask) — serve o painel HTML, gerencia estado
4. **Painel HTML** — mostra passo atual, controles, campo de comentario
5. **Documentador** — salva screenshots + resultado + comentarios em relatorio final

---

## 3. Fluxo de Execucao

```
1. Usuario roda: python validacao_visual.py --sprint 1
2. Abre browser Playwright (headed, visible, slow_mo=500ms)
3. Abre painel de controle em outra aba/janela
4. Login automatico (valida2@valida.com.br / 123456 / RP3X)
5. Para cada UC no tutorial:
   5.1 Exibe no painel: nome do UC, descricao, tempo estimado
   5.2 Para cada Passo do UC:
       a) Exibe no painel: texto do passo formatado em MD
       b) Executa acao Playwright (navegar, preencher, clicar)
       c) Tira screenshot ANTES e DEPOIS
       d) PAUSA — aguarda usuario clicar [Continuar]
       e) Usuario pode digitar comentario/correcao
       f) Registra resultado (OK / FALHA / COMENTARIO)
   5.3 Exibe verificacao final do UC
6. Gera relatorio: docs/RELATORIO_VALIDACAO_VISUAL_SPRINT{n}.md
```

---

## 4. Parser de Tutorial

### 4.1 Estrutura de um Tutorial (detectada)

```markdown
# Tutorial ... Sprint N ...

## Credenciais e Login
| Campo | Valor |
| Email | valida2@... |
| Senha | 123456 |

## [UC-F01] Nome do Caso de Uso
> Descricao do que o UC faz

**Onde:** Menu lateral -> Empresa -> Cadastro

### Passo 1 — Titulo do passo
**O que fazer:** Instrucao
**Dados a informar:**
| Campo | Valor |
| Razao Social | `RP3X...` |

### Passo 2 — ...
...

Verificacao:
- [ ] Campo X tem valor Y
- [ ] Mensagem Z aparece
```

### 4.2 Modelo de dados extraidos

```python
@dataclass
class PassoTutorial:
    numero: int
    titulo: str
    instrucao: str          # "O que fazer"
    dados: dict             # {campo: valor} da tabela
    verificacao_ok: str     # "Correto se:"
    verificacao_erro: str   # "Problema se:"
    acao_playwright: str    # tipo: navegar|preencher|clicar|verificar

@dataclass
class CasoDeUso:
    codigo: str             # "UC-F01"
    nome: str
    descricao: str
    onde: str               # "Menu lateral -> Empresa"
    passos: list[PassoTutorial]

@dataclass
class Tutorial:
    sprint: int
    empresa: str
    credenciais: dict
    casos_de_uso: list[CasoDeUso]
```

---

## 5. Executor Playwright

### 5.1 Modos de execucao

```python
browser = playwright.chromium.launch(
    headless=False,      # VISIBLE — usuario VE
    slow_mo=500,         # 500ms entre acoes para visibilidade
)
```

### 5.2 Mapeamento Passo -> Acao Playwright

| Tipo de passo | Acao Playwright |
|---|---|
| "Menu lateral -> X -> Y" | `navTo(page, "X", "Y")` — usa helpers.ts |
| "Preencher campo X com valor Y" | `page.fill('[label=X]', Y)` ou `page.locator(...)` |
| "Clicar botao Z" | `page.click('button:has-text("Z")')` |
| "Selecionar opcao W" | `page.select_option(...)` ou click no dropdown |
| "Verificar que campo X = Y" | `expect(page.locator(...)).toHaveValue(Y)` |
| "Verificar mensagem aparece" | `expect(page.locator(...)).toBeVisible()` |

### 5.3 Controle de pausa

```python
class ExecutorControlado:
    def __init__(self):
        self.estado = "pausado"  # pausado | executando | parado
        self.evento_continuar = asyncio.Event()
    
    async def aguardar_continuar(self):
        """Bloqueia ate usuario clicar Continuar"""
        self.evento_continuar.clear()
        await self.evento_continuar.wait()
    
    def continuar(self):
        self.evento_continuar.set()
    
    def parar(self):
        self.estado = "parado"
        self.evento_continuar.set()  # desbloqueia para encerrar
```

---

## 6. Servidor de Controle (Flask)

### 6.1 Endpoints

| Metodo | Rota | Descricao |
|---|---|---|
| GET | `/` | Painel HTML de controle |
| GET | `/estado` | Estado atual (passo, UC, screenshot) |
| POST | `/continuar` | Desbloqueia para proximo passo |
| POST | `/parar` | Para execucao |
| POST | `/reiniciar` | Reinicia do inicio |
| POST | `/comentario` | Salva comentario no passo atual |
| GET | `/screenshot` | Ultima screenshot |
| GET | `/relatorio` | Relatorio parcial gerado ate agora |

### 6.2 Painel HTML

- Renderiza Markdown do passo atual (usando marked.js ou similar)
- Mostra campos que serao preenchidos destacados
- Barra de progresso: UC X de Y, Passo N de M
- Botoes: [Continuar] [Parar] [Reiniciar]
- Textarea para comentarios
- Area de screenshot do passo anterior

---

## 7. Documentacao Gerada

### 7.1 Relatorio por Sprint

Arquivo: `docs/RELATORIO_VALIDACAO_VISUAL_SPRINT{n}.md`

```markdown
# Relatorio de Validacao Visual — Sprint {n}

**Data:** 2026-04-20
**Executor:** Automatico (Playwright + Controle Manual)
**Tutorial:** tutorialsprint{n}-2.md
**Empresa:** RP3X ...

## Resumo
- Total UCs: 17
- Executados: 17
- OK: 15
- Com comentarios: 2
- Falhas: 0

## UC-F01 — Manter Cadastro Principal
| Passo | Resultado | Screenshot | Comentario |
|---|---|---|---|
| 1. Navegar ate Empresa | OK | sprint1/F01_P01.png | — |
| 2. Preencher dados principais | OK | sprint1/F01_P02.png | — |
| 3. Preencher redes sociais | OK | sprint1/F01_P03.png | Instagram ok |
| 4. Preencher endereco | CORRECAO | sprint1/F01_P04.png | CEP nao formatou auto |
| 5. Clicar Salvar | OK | sprint1/F01_P05.png | — |
| 6. Verificacao final | OK | sprint1/F01_P06.png | Todos campos salvos |

## UC-F02 — Gerir Contatos
...
```

### 7.2 Screenshots

Diretorio: `runtime/screenshots/validacao_visual/sprint{n}/`
Padrao: `{UC}_{Passo}_{antes|depois}.png`

---

## 8. Programas a Criar (1 por sprint de 1 a 5, demais depois)

| Arquivo | Sprint | Tutorial fonte | UCs |
|---|---|---|---|
| `validacao_visual_sprint1.py` | 1 | tutorialsprint1-2.md | F01-F17 (17 UCs) |
| `validacao_visual_sprint2.py` | 2 | tutorialsprint2-2.md | Captacao + Validacao |
| `validacao_visual_sprint3.py` | 3 | tutorialsprint3-2.md | Precificacao |
| `validacao_visual_sprint4.py` | 4 | tutorialsprint4-2.md | Propostas |
| `validacao_visual_sprint5.py` | 5 | tutorialsprint5-2.md | Followup + Contratos |

Sprints 6-9 serao criados depois (mesma estrutura).

### 8.1 Estrutura de cada programa

```python
# validacao_visual_sprint1.py

from validacao_visual_framework import (
    Tutorial, CasoDeUso, PassoTutorial,
    ExecutorControlado, PainelControle,
    parse_tutorial_md, gerar_relatorio
)

TUTORIAL_FILE = "docs/tutorialsprint1-2.md"
SPRINT = 1

async def main():
    # 1. Parsear tutorial
    tutorial = parse_tutorial_md(TUTORIAL_FILE)
    
    # 2. Iniciar servidor de controle
    painel = PainelControle(tutorial)
    painel.iniciar(porta=8888)
    
    # 3. Iniciar Playwright (visivel)
    executor = ExecutorControlado(tutorial, painel)
    await executor.executar()
    
    # 4. Gerar relatorio
    gerar_relatorio(executor.resultados, sprint=SPRINT)
```

### 8.2 Framework compartilhado

Arquivo: `tests/validacao_visual/validacao_visual_framework.py`

Contem:
- Parser de tutorial MD
- ExecutorControlado (Playwright + pausa)
- PainelControle (Flask server)
- Mapeamento automatico de passos -> acoes Playwright
- Gerador de relatorio MD
- Utilidades (screenshot, wait, assertions)

---

## 9. Requisitos Tecnicos

### Dependencias existentes (ja instaladas)
- `playwright` (testes E2E existentes)
- `flask` (backend existente)
- `markdown` ou parsing manual (regex)

### Novas dependencias
- Nenhuma obrigatoria (tudo pode ser feito com o que ja existe)
- Opcional: `marked` (JS no painel HTML) para render MD bonito

### Portas
- Sistema: 5007 (backend) + 5179 (frontend) — ja existem
- Painel de controle: **8888** (novo, Flask leve)

---

## 10. Fluxo do Usuario

```
1. $ python validacao_visual_sprint1.py
   -> Abre browser com sistema (localhost:5179)
   -> Abre segunda aba com painel de controle (localhost:8888)

2. Painel mostra:
   "Sprint 1 — UC-F01 Manter Cadastro Principal"
   "Passo 1: Navegar ate Menu Empresa"
   [Executando...]

3. Browser navega automaticamente ate pagina Empresa
   -> Screenshot capturada

4. Painel mostra:
   "Passo 1 CONCLUIDO"
   "Passo 2: Preencher dados principais"
   "Campos: Razao Social = RP3X..., CNPJ = 68.218..."
   [Continuar >>]

5. Usuario observa a tela, verifica, opcionalmente digita comentario
   -> Clica [Continuar]

6. Browser preenche campos automaticamente (slow_mo, usuario VE)
   -> Screenshot apos preenchimento

7. Repete ate fim do UC
   -> Verificacao final exibida

8. Proximo UC...

9. Fim: Relatorio gerado em docs/RELATORIO_VALIDACAO_VISUAL_SPRINT1.md
```

---

## 11. Regras Importantes

1. **VISIVEL** — browser em modo headed, nunca headless
2. **SLOW_MO** — delay entre acoes (500ms) para o usuario acompanhar
3. **PAUSA OBRIGATORIA** — entre cada passo, usuario precisa clicar Continuar
4. **CAMPOS VISIVEIS** — mostrar no painel quais campos serao preenchidos com quais valores ANTES de preencher
5. **SCREENSHOTS** — antes e depois de cada passo
6. **COMENTARIOS** — campo sempre disponivel para o usuario anotar correcoes
7. **DOCUMENTACAO** — tudo registrado no relatorio final
8. **INDEPENDENTE** — cada sprint e um programa separado
9. **REINICIAVEL** — pode parar e reiniciar de qualquer ponto
10. **FORMATADO** — painel exibe em Markdown bonito, nao texto cru

---

## 12. Ordem de Implementacao

### Fase 1: Framework base
- Parser de tutorial MD
- Modelo de dados (Tutorial, CasoDeUso, PassoTutorial)
- ExecutorControlado com Playwright
- PainelControle (Flask + HTML)

### Fase 2: Sprint 1 (prova de conceito)
- `validacao_visual_sprint1.py` completo
- Testar com 3-4 primeiros UCs
- Ajustar mapeamento passo->acao

### Fase 3: Sprints 2-5
- Adaptar para cada sprint
- Cada sprint pode ter acoes especificas (IA, API, timers)

### Fase 4: Sprints 6-9
- Mesma estrutura, UCs mais complexos

---

## 13. Verificacao

- [ ] Parser extrai corretamente todos UCs e passos de tutorialsprint1-2.md
- [ ] Browser abre em modo visivel com slow_mo
- [ ] Painel de controle carrega e exibe passo formatado
- [ ] Botao Continuar desbloqueia proximo passo
- [ ] Botao Parar encerra graciosamente
- [ ] Botao Reiniciar volta ao inicio
- [ ] Comentarios sao salvos por passo
- [ ] Screenshots geradas antes/depois
- [ ] Relatorio MD gerado ao final com todos resultados
- [ ] Campos sao preenchidos visivelmente na tela
