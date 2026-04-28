# Como usar o app de Validação Visual (testesvalidacoes)

**Versão:** 1.0 (V1)
**Data:** 2026-04-27
**Audiência:** testers da Sprint 1 — pasteur, arnaldo, tarcisio, marbei, marcelo, valida1, valida2

---

## 1. O que é

O app web em `http://localhost:9876` permite ao tester:

- Fazer **login** com email/senha
- Ver no **/home** os testes em andamento e o histórico
- Criar **novo teste** selecionando CTs da Sprint 1 (entre os 124 CTs Cenário com tutorial)
- **Executar** o teste com Playwright headed (browser visível) acompanhando passo a passo
- A cada passo: ver screenshots before/after, **Aprovar** ou **Reprovar**, escrever **observações**
- **Pausar** a qualquer momento e **Retomar** de onde parou (CTs aprovados ficam pulados)
- Gerar **relatório** consolidado com todos os passos, screenshots e observações
- **Admins** (pasteur, arnaldo, tarcisio) também veem **/relatorios** global de todos os testers

---

## 2. Subir o webapp

```bash
cd /mnt/data1/progpython/agenteditais
bash scripts/start_painel_webapp.sh
```

Sai logs no terminal. Webapp escuta em `http://localhost:9876`. Mata instância prévia se houver.

---

## 3. Login

| Email | Senha | Tipo |
|---|---|---|
| `pasteur@valida.com` | `123456` | admin |
| `arnaldo@valida.com` | `123456` | admin |
| `tarcisio@valida.com` | `123456` | admin |
| `marbei@valida.com` | `123456` | tester |
| `marcelo@valida.com` | `123456` | tester |
| `valida1@valida.com` | `123456` | tester |
| `valida2@valida.com` | `123456` | tester |

Acesse `http://localhost:9876/login`.

---

## 4. Criar um teste novo

1. No `/home`, clique **"➕ Novo Teste"**
2. Preencha:
   - **Título** (ex: "Smoke Sprint 1 dia 1")
   - **Projeto** → "Facilicita.IA"
   - **Sprint** → "Sprint 1 — Empresa, Portfolio e Parametrizacao"
   - **Ciclo (opcional)** → "piloto-ucf01" (ou qualquer outro contexto provisionado)
3. Filtre os CTs:
   - **Categoria**: deixe só "Cenário" ✓ (124 CTs visuais)
   - **Trilha**: "visual"
   - **só com tutorial**: ✓ (recomendado pra Fase 1; outros são pulados)
4. Clique no header de cada UC pra expandir e marcar os CTs desejados
5. Veja contador embaixo: "X CTs selecionados — estimativa: ~Y min"
6. Clique **"Criar e Iniciar Teste"**

→ você é redirecionado pra `/teste/<id>/executar` com a lista de CTs.

---

## 5. Executar o teste

**Hoje (V1):** a tela `/teste/<id>/executar` mostra a lista estática dos CTs. O botão "▶️ Iniciar (Fase D/E pendente)" está desabilitado pois não há painel JS interativo ainda — a integração via web do executor com botões em tempo real precisa do front polling de IPC, que está implementado no backend mas faltam os controles JS na tela.

**Modo manual (funcional)** enquanto o painel JS interativo não vem:

```bash
# Em outro terminal, com webapp já rodando:
python3 testes/framework_visual/executor_db.py --teste_id <UUID-do-teste>
```

O executor:
1. Lê o teste e suas execuções pendentes do banco
2. Sobe Chromium headed
3. Para cada CT:
   - Carrega o tutorial (`testes/tutoriais_visual/<UC>_<variacao>.md`)
   - Executa cada passo, captura screenshots, valida DOM/Rede
   - Persiste `passos_execucao` no banco
   - **PAUSA** aguardando o tester clicar Aprovar/Reprovar via outro endpoint
4. Você abre o `/teste/<id>/estado` para ver o estado JSON e use as APIs:
   - `POST /teste/<id>/aprovar`
   - `POST /teste/<id>/reprovar`
   - `POST /teste/<id>/comentario` (body: `{"texto":"..."}`)
   - `POST /teste/<id>/pausar` (envia SIGTERM)

Exemplo via curl (depois de logado e com cookie em /tmp/c.txt):

```bash
TESTE_ID="<uuid>"
# Aprovar passo atual
curl -b /tmp/c.txt -X POST http://localhost:9876/teste/$TESTE_ID/aprovar
# Reprovar
curl -b /tmp/c.txt -X POST http://localhost:9876/teste/$TESTE_ID/reprovar
# Comentar
curl -b /tmp/c.txt -X POST -H "Content-Type: application/json" \
  -d '{"texto":"Toast nao apareceu"}' \
  http://localhost:9876/teste/$TESTE_ID/comentario
# Estado
curl -b /tmp/c.txt http://localhost:9876/teste/$TESTE_ID/estado
```

**Próxima iteração (V1.1):** integrar `controle.js` adaptado pra polling do `/teste/<id>/estado` + botões Aprovar/Reprovar reais na `executar.html`.

---

## 6. Pausar e retomar

- **Pausar**: `POST /teste/<id>/pausar` envia SIGTERM ao executor. Teste vira `pausado`. CTs em andamento são preservados.
- **Retomar**: rode novamente `python3 testes/framework_visual/executor_db.py --teste_id <UUID>`.
  - CTs em estado `aprovado/reprovado/pulado` são **pulados** automaticamente.
  - O CT que estava em `em_execucao` é reinicializado do passo 0 (granularidade V1).

---

## 7. Ver relatórios

- **`/meus-relatorios`** — lista relatórios do próprio user (todos)
- **`/relatorios`** — lista global (admin only)
- **`/relatorio/<teste_id>`** — detalhe HTML com screenshots inline + observações
- **`/relatorio/<teste_id>/md`** — download do MD

---

## 8. Esquema do banco

Banco MySQL: `testesvalidacoes` em `camerascasas.no-ip.info:3308` (mesmo servidor do `editais`).

Principais tabelas:

| Tabela | Conteúdo |
|---|---|
| `users` | testers (3 admins + 4 não-admins) |
| `projetos`, `sprints` | catálogo |
| `casos_de_uso` | 17 UCs Sprint 1 com `conteudo_md` cacheado |
| `casos_de_teste` | 201 CTs categorizados (Cenário/Classe/Fronteira/Combinado) |
| `testes` | sessões de teste do tester |
| `conjuntos_de_teste` + `conjunto_casos_de_teste` | agrupador de CTs |
| `execucoes_caso_de_teste` | resultado consolidado por CT |
| **`passos_execucao`** | **D5 — 1 linha por passo do tutorial, com screenshots + vereditos** |
| `observacoes` | comentários do PO vinculados a passo específico |
| `relatorios` | MD final |
| `log_auditoria` | login/criar/aprovar/reprovar/iniciar |

---

## 9. Comandos úteis

```bash
# Subir webapp
bash scripts/start_painel_webapp.sh

# Re-rodar seed (idempotente)
python3 testes/framework_visual/seed/seed_testesvalidacoes.py

# Consultar banco rápido
mysql -h camerascasas.no-ip.info -P 3308 -u producao -p112358123 testesvalidacoes -e "
SELECT t.titulo, t.estado, COUNT(e.id) as ncts
FROM testes t LEFT JOIN execucoes_caso_de_teste e ON e.teste_id = t.id
GROUP BY t.id ORDER BY t.criado_em DESC LIMIT 10
"

# Ver auditoria
mysql -h camerascasas.no-ip.info -P 3308 -u producao -p112358123 testesvalidacoes -e "
SELECT acao, recurso, criado_em FROM log_auditoria ORDER BY criado_em DESC LIMIT 20
"

# Limpar dados de testes para começar do zero (CUIDADO — admin only)
mysql -h camerascasas.no-ip.info -P 3308 -u producao -p112358123 testesvalidacoes -e "
DELETE FROM testes WHERE user_id = (SELECT id FROM users WHERE email='valida1@valida.com')
"
```

---

## 10. Limitações V1 conhecidas

- **F17**: painel JS de execução em tempo real ainda não foi integrado em `executar.html` — V1.1 vai trazer
- **F18**: UI pra criar/editar tags ainda não existe — apenas tabela
- **F19**: CRUD admin (gerenciar projetos, sprints, UCs, CTs, users) — apenas via banco/seed
- **F20**: 1 só teste com browser headed por vez (limitação display)

Detalhes completos em `docs/FUROS_E_PENDENCIAS_FASE_*.md`.

---

## 11. Próximos passos sugeridos

1. **V1.1 — `controle.js` integrado em `executar.html`** (polling de `/teste/<id>/estado`, botões Aprovar/Reprovar funcionais na UI)
2. **V1.2 — escrever tutoriais visuais para UCs F02..F17** (hoje só F01 fp tem)
3. **V2 — fases 2 e 3 da automação visual** (Categoria=Classe + Fronteira + Combinado, mas via trilha e2e headless)
4. **V2 — CRUD admin, tags UI, anexos, dashboard de cobertura**

---

*Documento gerado em 2026-04-27 ao final da implementação V1.*
